import { Env } from '../../types';
import { squareConfigFromEnv, createPaymentLink } from '../../lib/square';
import { completeLedgerPayment } from '../../lib/payments';

interface InvoiceRow {
    id: number;
    project_id: number;
    customer_id: number;
    amount: number;
    amount_paid: number;
    invoice_type: string;
    status: string;
    created_at: string;
    due_date: string | null;
    service_type: string | null;
}

const INVOICE_TYPE_DISPLAY: Record<string, string> = {
    deposit: 'Deposit',
    balance: 'Balance Due',
    full: 'Full Payment',
    additional: 'Additional Charge',
};

const PAYMENT_TERMS_DAYS = 30;
const MIN_PAYMENT = 1; // Square minimum charge is $1.00
const jsonHeaders = { 'Content-Type': 'application/json' };
const round2 = (n: number) => Math.round(n * 100) / 100;
const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: jsonHeaders });

function computeDueDate(row: { due_date: string | null; created_at: string }): string | null {
    if (row.due_date) return row.due_date;
    const created = new Date(row.created_at);
    if (Number.isNaN(created.getTime())) return null;
    created.setUTCDate(created.getUTCDate() + PAYMENT_TERMS_DAYS);
    return created.toISOString().slice(0, 10);
}

function invoiceLabel(row: InvoiceRow): string {
    const service = row.service_type || 'HVAC Service';
    const type = INVOICE_TYPE_DISPLAY[row.invoice_type] || row.invoice_type;
    return `${service} - ${type}`;
}

// Guest checkout: pay a pending invoice by email, no login required.
// Uses Square hosted checkout. When PAYMENTS_TEST_MODE === 'true', the payment is
// simulated (no Square call) so the full flow can be tested without credentials.
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    try {
        const body = await request
            .json<{ invoiceId?: number; email?: string; amount?: number }>()
            .catch(() => ({} as { invoiceId?: number; email?: string; amount?: number }));
        const invoiceId = body.invoiceId;
        const email = body.email?.trim().toLowerCase();

        if (!invoiceId || !email) {
            return json({ success: false, error: 'Invoice ID and email are required' }, 400);
        }

        // Look up the customer by email
        const customer = await env.DB.prepare(
            'SELECT id FROM customers WHERE LOWER(email) = ?'
        ).bind(email).first<{ id: number }>();

        if (!customer) {
            return json({ success: false, error: 'No account found for this email' }, 404);
        }

        // Get invoice and verify it belongs to this customer
        const invoice = await env.DB.prepare(`
            SELECT i.id, i.project_id, i.customer_id, i.amount, i.amount_paid, i.invoice_type,
                   i.status, i.created_at, i.due_date, p.service_type
            FROM invoices i
            JOIN projects p ON i.project_id = p.id
            WHERE i.id = ? AND i.customer_id = ?
        `).bind(invoiceId, customer.id).first<InvoiceRow>();

        if (!invoice) {
            return json({ success: false, error: 'Invoice not found' }, 404);
        }

        if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'refunded') {
            return json({ success: false, error: `This invoice cannot be paid. Status: ${invoice.status}` }, 400);
        }

        const amountPaid = round2(invoice.amount_paid || 0);
        const balance = round2(invoice.amount - amountPaid);
        if (balance <= 0) {
            return json({ success: false, error: 'This invoice is already paid in full' }, 400);
        }

        let payAmount = typeof body.amount === 'number' ? round2(body.amount) : balance;
        if (!Number.isFinite(payAmount) || payAmount < MIN_PAYMENT) {
            return json({ success: false, error: `Minimum payment is $${MIN_PAYMENT.toFixed(2)}` }, 400);
        }
        if (payAmount > balance + 0.01) payAmount = balance;

        const origin = new URL(request.url).origin;
        const testMode = (env as unknown as { PAYMENTS_TEST_MODE?: string }).PAYMENTS_TEST_MODE === 'true';

        // --- TEST MODE: simulate a completed payment, no Square call ---
        if (testMode) {
            const insert = await env.DB.prepare(`
                INSERT INTO invoice_payments (invoice_id, amount, status, square_order_id, square_payment_link_id)
                VALUES (?, ?, 'pending', ?, 'TEST')
            `).bind(invoice.id, payAmount, `TEST-${crypto.randomUUID()}`).run();

            await env.DB.prepare(`UPDATE invoices SET status = 'sent' WHERE id = ? AND status = 'pending'`)
                .bind(invoice.id).run();
            await env.DB.prepare(`UPDATE invoices SET due_date = ? WHERE id = ? AND due_date IS NULL`)
                .bind(computeDueDate(invoice), invoice.id).run();

            const ledgerId = Number(insert.meta?.last_row_id);
            await completeLedgerPayment(env, ledgerId, `TEST-${crypto.randomUUID()}`);

            return json({ success: true, test: true, url: `${origin}/pay/success/?invoice=${invoice.id}&test=1` });
        }

        // --- LIVE: Square hosted checkout link ---
        const isPartial = payAmount < balance - 0.01;
        const config = squareConfigFromEnv(env);
        const link = await createPaymentLink(config, {
            amountCents: Math.round(payAmount * 100),
            name: `${invoiceLabel(invoice)} (Invoice #${invoice.id})`,
            note: `Invoice #${invoice.id}${isPartial ? ' (partial payment)' : ''}`,
            redirectUrl: `${origin}/pay/success/?invoice=${invoice.id}`,
        });

        await env.DB.prepare(`
            INSERT INTO invoice_payments (invoice_id, amount, status, square_order_id, square_payment_link_id)
            VALUES (?, ?, 'pending', ?, ?)
        `).bind(invoice.id, payAmount, link.orderId ?? null, link.paymentLinkId).run();

        await env.DB.prepare(`UPDATE invoices SET status = 'sent' WHERE id = ? AND status = 'pending'`)
            .bind(invoice.id).run();
        await env.DB.prepare(`UPDATE invoices SET due_date = ? WHERE id = ? AND due_date IS NULL`)
            .bind(computeDueDate(invoice), invoice.id).run();

        return json({ success: true, url: link.url });
    } catch (error) {
        console.error('Guest checkout error:', error instanceof Error ? error.message : String(error));
        return json({
            success: false,
            error: 'Failed to create payment session',
            details: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
};
