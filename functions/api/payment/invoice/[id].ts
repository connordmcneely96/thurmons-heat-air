import { requireAuth } from '../../../lib/session';
import { Env } from '../../../types';
import { squareConfigFromEnv, createPaymentLink } from '../../../lib/square';

interface InvoiceRow {
    id: number;
    project_id: number;
    customer_id: number;
    amount: number;
    invoice_type: string;
    status: string;
    service_type: string | null;
}

const INVOICE_TYPE_DISPLAY: Record<string, string> = {
    deposit: 'Deposit',
    balance: 'Balance Due',
    full: 'Full Payment',
    additional: 'Additional Charge',
};

const jsonHeaders = { 'Content-Type': 'application/json' };

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    try {
        // Authenticate user
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) {
            return authResult;
        }

        if (authResult.role !== 'customer') {
            return new Response(JSON.stringify({ success: false, error: 'Customer access required' }), {
                status: 403,
                headers: jsonHeaders,
            });
        }

        const customerId = authResult.userId;
        const invoiceId = params.id as string;

        // Get invoice + parent project (ownership-checked)
        const invoice = await env.DB.prepare(`
            SELECT i.id, i.project_id, i.customer_id, i.amount, i.invoice_type, i.status, p.service_type
            FROM invoices i
            JOIN projects p ON i.project_id = p.id
            WHERE i.id = ? AND i.customer_id = ?
        `).bind(invoiceId, customerId).first<InvoiceRow>();

        if (!invoice) {
            return new Response(JSON.stringify({ success: false, error: 'Invoice not found' }), {
                status: 404,
                headers: jsonHeaders,
            });
        }

        // Only unpaid invoices can be paid. 'pending' = not yet sent, 'sent' = link already generated.
        if (invoice.status !== 'pending' && invoice.status !== 'sent') {
            return new Response(JSON.stringify({
                success: false,
                error: `Invoice cannot be paid. Status: ${invoice.status}`,
            }), {
                status: 400,
                headers: jsonHeaders,
            });
        }

        // Build a human-readable checkout name
        const serviceName = invoice.service_type || 'HVAC Service';
        const typeDisplay = INVOICE_TYPE_DISPLAY[invoice.invoice_type] || invoice.invoice_type;
        const description = `${serviceName} - ${typeDisplay} (Invoice #${invoice.id})`;
        const origin = new URL(request.url).origin;

        // Create a Square-hosted checkout link
        const config = squareConfigFromEnv(env);
        const link = await createPaymentLink(config, {
            amountCents: Math.round(invoice.amount * 100),
            name: description,
            note: `Invoice #${invoice.id}`,
            redirectUrl: `${origin}/portal/invoices?paid=${invoice.id}`,
        });

        // Record Square identifiers so the webhook can match the payment back to this invoice
        await env.DB.prepare(`
            UPDATE invoices
            SET status = 'sent',
                square_order_id = ?,
                square_payment_link_id = ?,
                sent_at = COALESCE(sent_at, datetime('now'))
            WHERE id = ?
        `).bind(link.orderId ?? null, link.paymentLinkId, invoice.id).run();

        return new Response(JSON.stringify({ success: true, url: link.url }), {
            status: 200,
            headers: jsonHeaders,
        });
    } catch (error) {
        console.error('Square payment link error:', error instanceof Error ? error.message : String(error));
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to create payment link',
        }), {
            status: 500,
            headers: jsonHeaders,
        });
    }
};
