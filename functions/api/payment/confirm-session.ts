import { Env } from '../../types';
import { requireAuth } from '../../lib/session';
import { getStripeClient } from '../../lib/stripe';

type ConfirmSessionRequest = {
    sessionId?: unknown;
};

interface InvoiceRow {
    id: number;
    project_id: number;
    customer_id: number;
    invoice_type: string;
    status: string;
}

function parseSessionId(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

/**
 * POST /api/payment/confirm-session
 *
 * Read-only status check: asks Stripe whether the checkout session is paid
 * and returns the current invoice status from our DB. It does NOT write to
 * the database — the Stripe webhook (checkout.session.completed) is the sole
 * source of truth for DB updates and receipt emails. This prevents the race
 * condition where confirm-session wins ahead of the webhook and marks the
 * invoice paid before the webhook fires, causing the receipt email to be skipped.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // Require authentication — session IDs appear in redirect URLs and must not
    // be usable by unauthenticated callers.
    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) return authResult;

    try {
        const body = await request.json<ConfirmSessionRequest>();
        const sessionId = parseSessionId(body.sessionId);

        if (!sessionId) {
            return new Response(JSON.stringify({ success: false, error: 'sessionId is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const stripe = getStripeClient(env);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return new Response(JSON.stringify({ success: false, error: 'Payment not yet confirmed' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const invoiceIdFromMetadata = session.metadata?.invoice_id || null;

        // Look up invoice to return current DB status (webhook may have already processed it)
        const invoice = await env.DB.prepare(`
            SELECT id, project_id, customer_id, invoice_type, status
            FROM invoices
            WHERE (id = ?)
               OR (stripe_invoice_id = ?)
            LIMIT 1
        `).bind(invoiceIdFromMetadata, session.id).first<InvoiceRow>();

        if (!invoice) {
            return new Response(JSON.stringify({ success: false, error: 'Invoice not found for this session' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verify the authenticated user owns this invoice
        if (invoice.customer_id !== authResult.userId) {
            return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Return current state — webhook is responsible for writing paid status
        return new Response(JSON.stringify({
            success: true,
            invoiceId: invoice.id,
            projectId: invoice.project_id,
            invoiceType: invoice.invoice_type,
            paid: invoice.status === 'paid',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Confirm checkout session error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to confirm payment session',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
