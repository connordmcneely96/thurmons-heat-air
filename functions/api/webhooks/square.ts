import { Env } from '../../types';
import { verifySquareWebhook } from '../../lib/square';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Square webhook receiver.
 * Configure in Square dashboard:
 *   URL    = https://thurmons-heat-air.pages.dev/api/webhooks/square
 *   events = payment.created, payment.updated
 *
 * On a COMPLETED payment, the matching ledger row is marked complete, the invoice's
 * amount_paid is recomputed, and the invoice flips to 'partial' or 'paid'.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-square-hmacsha256-signature');
        const signatureKey = (env as unknown as { SQUARE_WEBHOOK_SIGNATURE_KEY?: string })
            .SQUARE_WEBHOOK_SIGNATURE_KEY;

        if (!signatureKey) {
            console.error('SQUARE_WEBHOOK_SIGNATURE_KEY not configured');
            return new Response(JSON.stringify({ error: 'Webhook not configured' }), { status: 500, headers: jsonHeaders });
        }

        const url = new URL(request.url);
        const notificationUrl = `${url.origin}${url.pathname}`;
        const valid = await verifySquareWebhook(signatureKey, notificationUrl, rawBody, signature);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401, headers: jsonHeaders });
        }

        const event = JSON.parse(rawBody) as {
            type?: string;
            data?: { object?: { payment?: { id?: string; status?: string; order_id?: string } } };
        };

        if (event.type === 'payment.created' || event.type === 'payment.updated') {
            const payment = event.data?.object?.payment;
            const status = payment?.status;
            const orderId = payment?.order_id;
            const paymentId = payment?.id;

            if (status === 'COMPLETED' && orderId) {
                const ledger = await env.DB.prepare(`
                    SELECT id, invoice_id, status FROM invoice_payments WHERE square_order_id = ?
                `).bind(orderId).first<{ id: number; invoice_id: number; status: string }>();

                if (ledger && ledger.status !== 'completed') {
                    // 1) complete this ledger entry
                    await env.DB.prepare(`
                        UPDATE invoice_payments
                        SET status = 'completed', square_payment_id = ?, paid_at = datetime('now')
                        WHERE id = ?
                    `).bind(paymentId ?? null, ledger.id).run();

                    // 2) recompute the invoice's running total from completed payments
                    const sumRow = await env.DB.prepare(`
                        SELECT COALESCE(SUM(amount), 0) AS paid
                        FROM invoice_payments
                        WHERE invoice_id = ? AND status = 'completed'
                    `).bind(ledger.invoice_id).first<{ paid: number }>();

                    const invoice = await env.DB.prepare(`
                        SELECT amount, invoice_type, project_id FROM invoices WHERE id = ?
                    `).bind(ledger.invoice_id).first<{ amount: number; invoice_type: string; project_id: number }>();

                    if (invoice) {
                        const paidTotal = Number(sumRow?.paid) || 0;
                        const fullyPaid = paidTotal + 0.005 >= invoice.amount;

                        await env.DB.prepare(`
                            UPDATE invoices
                            SET amount_paid = ?,
                                status = ?,
                                paid_at = CASE WHEN ? = 1 THEN datetime('now') ELSE paid_at END
                            WHERE id = ?
                        `).bind(paidTotal, fullyPaid ? 'paid' : 'partial', fullyPaid ? 1 : 0, ledger.invoice_id).run();

                        // 3) flip project flags only once the invoice is fully paid
                        if (fullyPaid) {
                            if (invoice.invoice_type === 'deposit') {
                                await env.DB.prepare(`UPDATE projects SET deposit_paid = 1 WHERE id = ?`)
                                    .bind(invoice.project_id).run();
                            } else if (invoice.invoice_type === 'balance' || invoice.invoice_type === 'full') {
                                await env.DB.prepare(`UPDATE projects SET balance_paid = 1 WHERE id = ?`)
                                    .bind(invoice.project_id).run();
                            }
                        }
                    }
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('Square webhook error:', error instanceof Error ? error.message : String(error));
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500, headers: jsonHeaders });
    }
};
