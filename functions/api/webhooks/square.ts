import { Env } from '../../types';
import { verifySquareWebhook } from '../../lib/square';
import { completeLedgerPayment } from '../../lib/payments';

const jsonHeaders = { 'Content-Type': 'application/json' };

/**
 * Square webhook receiver.
 * Configure in Square dashboard:
 *   URL    = https://thurmons-heat-air.pages.dev/api/webhooks/square
 *   events = payment.created, payment.updated
 *
 * On a COMPLETED payment, the matching ledger row is completed and the invoice
 * balance/status is recomputed (see completeLedgerPayment).
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
            if (payment?.status === 'COMPLETED' && payment.order_id) {
                const ledger = await env.DB.prepare(
                    `SELECT id FROM invoice_payments WHERE square_order_id = ?`
                ).bind(payment.order_id).first<{ id: number }>();

                if (ledger) {
                    await completeLedgerPayment(env, ledger.id, payment.id ?? null);
                }
            }
        }

        return new Response(JSON.stringify({ received: true }), { status: 200, headers: jsonHeaders });
    } catch (error) {
        console.error('Square webhook error:', error instanceof Error ? error.message : String(error));
        return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500, headers: jsonHeaders });
    }
};
