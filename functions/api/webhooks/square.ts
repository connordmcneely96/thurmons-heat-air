import { Env } from '../../types';
import { squareConfigFromEnv, verifySquareWebhook } from '../../lib/square';

interface InvoiceMatch {
    id: number;
    project_id: number;
    invoice_type: string;
    status: string;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Square webhook receiver.
 * Configure in Square dashboard:
 *   URL  = https://thurmons-heat-air.pages.dev/api/webhooks/square
 *   events = payment.created, payment.updated
 * On a COMPLETED payment, the matching invoice is marked paid in D1.
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
            return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
                status: 500,
                headers: jsonHeaders,
            });
        }

        // Square signs HMAC-SHA256 over (notificationUrl + rawBody). The URL must match
        // exactly what is configured in the Square dashboard subscription.
        const url = new URL(request.url);
        const notificationUrl = `${url.origin}${url.pathname}`;

        const valid = await verifySquareWebhook(signatureKey, notificationUrl, rawBody, signature);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                status: 401,
                headers: jsonHeaders,
            });
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
                const invoice = await env.DB.prepare(`
                    SELECT id, project_id, invoice_type, status
                    FROM invoices
                    WHERE square_order_id = ?
                `).bind(orderId).first<InvoiceMatch>();

                if (invoice && invoice.status !== 'paid') {
                    await env.DB.prepare(`
                        UPDATE invoices
                        SET status = 'paid', paid_at = datetime('now'), square_payment_id = ?
                        WHERE id = ?
                    `).bind(paymentId ?? null, invoice.id).run();

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

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: jsonHeaders,
        });
    } catch (error) {
        console.error('Square webhook error:', error instanceof Error ? error.message : String(error));
        // Return 500 so Square retries delivery
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
            status: 500,
            headers: jsonHeaders,
        });
    }
};
