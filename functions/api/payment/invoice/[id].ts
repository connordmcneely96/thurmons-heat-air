import { requireAuth } from '../../../lib/session';
import { Env } from '../../../types';
import { squareConfigFromEnv, createPaymentLink } from '../../../lib/square';
import { completeLedgerPayment } from '../../../lib/payments';

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

// An invoice is loadable/payable by the account that owns it: matched by customer id
// OR by the account's email matching the invoice customer's email. Admins therefore
// can only ever touch their own invoices.
async function loadInvoice(env: Env, invoiceId: string, customerId: number, email: string): Promise<InvoiceRow | null> {
    return env.DB.prepare(`
        SELECT i.id, i.project_id, i.customer_id, i.amount, i.amount_paid, i.invoice_type,
               i.status, i.created_at, i.due_date, p.service_type
        FROM invoices i
        JOIN projects p ON i.project_id = p.id
        WHERE i.id = ?
          AND (
            i.customer_id = ?
            OR EXISTS (
                SELECT 1 FROM customers c2
                WHERE c2.id = i.customer_id
                  AND LOWER(c2.email) = ?
            )
          )
    `).bind(invoiceId, customerId, email.trim().toLowerCase()).first<InvoiceRow>();
}

// GET: return invoice balance/terms so the portal can show a payment form
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    try {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;
        if (auth.role !== 'customer' && auth.role !== 'admin') return json({ success: false, error: 'Authentication required' }, 403);

        const invoice = await loadInvoice(env, params.id as string, auth.userId, auth.email);
        if (!invoice) return json({ success: false, error: 'Invoice not found' }, 404);

        const amountPaid = round2(invoice.amount_paid || 0);
        const balance = round2(invoice.amount - amountPaid);

        return json({
            success: true,
            invoice: {
                id: invoice.id,
                label: invoiceLabel(invoice),
                amount: round2(invoice.amount),
                amountPaid,
                balance,
                status: invoice.status,
                dueDate: computeDueDate(invoice),
            },
        });
    } catch (error) {
        console.error('Invoice GET error:', error instanceof Error ? error.message : String(error));
        return json({ success: false, error: 'Failed to load invoice' }, 500);
    }
};

// POST: create a Square checkout link for a full or partial payment toward the invoice.
// When PAYMENTS_TEST_MODE is 'true', the payment is simulated (no Square call) so the
// full flow can be tested without live/sandbox credentials.
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    try {
        const auth = await requireAuth(request, env);
        if (auth instanceof Response) return auth;
        if (auth.role !== 'customer' && auth.role !== 'admin') return json({ success: false, error: 'Authentication required' }, 403);

        const invoice = await loadInvoice(env, params.id as string, auth.userId, auth.email);
        if (!invoice) return json({ success: false, error: 'Invoice not found' }, 404);

        if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'refunded') {
            return json({ success: false, error: `Invoice cannot be paid. Status: ${invoice.status}` }, 400);
        }

        const amountPaid = round2(invoice.amount_paid || 0);
        const balance = round2(invoice.amount - amountPaid);
        if (balance <= 0) {
            return json({ success: false, error: 'This invoice is already paid in full' }, 400);
        }

        const body = await request.json<{ amount?: number }>().catch(() => ({}));
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

            return json({ success: true, test: true, url: `${origin}/portal/invoices?paid=${invoice.id}&test=1` });
        }

        // --- LIVE: Square hosted checkout link ---
        const isPartial = payAmount < balance - 0.01;
        const config = squareConfigFromEnv(env);
        const link = await createPaymentLink(config, {
            amountCents: Math.round(payAmount * 100),
            name: `${invoiceLabel(invoice)} (Invoice #${invoice.id})`,
            note: `Invoice #${invoice.id}${isPartial ? ' (partial payment)' : ''}`,
            redirectUrl: `${origin}/portal/invoices?paid=${invoice.id}`,
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
        console.error('Payment link error:', error instanceof Error ? error.message : String(error));
        return json({ success: false, error: 'Failed to create payment' }, 500);
    }
};
