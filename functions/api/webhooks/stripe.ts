import { Env } from '../../types';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '../../lib/stripe';
import { sendEmail, getPaymentReceiptEmail } from '../../lib/email';

interface InvoiceRow {
    id: number;
    project_id: number;
    customer_id: number;
    amount: number;
    invoice_type: string;
    service_type: string | null;
    status: string;
}

interface CustomerRow {
    email: string;
    name: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        // Get the raw body for signature verification
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return new Response(JSON.stringify({ error: 'No signature provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verify webhook signature (uses env-aware key selection)
        let event: Stripe.Event;
        try {
            event = await verifyWebhookSignature(env, body, signature);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.payment_status !== 'paid') {
                    console.log('Checkout session completed without paid status, skipping:', session.id);
                    break;
                }

                // Get payment intent ID
                const paymentIntentId = typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : session.payment_intent?.id;

                if (!paymentIntentId) {
                    console.error('Checkout session missing payment_intent:', session.id);
                    break;
                }

                const invoiceIdFromMetadata = session.metadata?.invoice_id;

                // Get invoice details
                const invoice = await env.DB.prepare(`
                    SELECT
                        i.id,
                        i.project_id,
                        i.customer_id,
                        i.amount,
                        i.invoice_type,
                        p.service_type
                    FROM invoices i
                    JOIN projects p ON i.project_id = p.id
                    WHERE (i.id = ?)
                       OR (i.stripe_invoice_id = ?)
                    LIMIT 1
                `).bind(invoiceIdFromMetadata ?? null, session.id).first<InvoiceRow>();

                if (!invoice) {
                    console.error('Invoice not found for checkout session:', {
                        sessionId: session.id,
                        invoiceIdFromMetadata,
                    });
                    break;
                }

                if (invoice.status === 'paid') {
                    console.log('Invoice already paid, skipping checkout completion:', invoice.id);
                    break;
                }

                // Update invoice status
                await env.DB.prepare(`
                    UPDATE invoices
                    SET status = 'paid',
                        stripe_payment_intent_id = ?,
                        paid_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(paymentIntentId, invoice.id).run();

                // Update project payment status
                if (invoice.invoice_type === 'deposit') {
                    await env.DB.prepare(`
                        UPDATE projects
                        SET deposit_paid = 1
                        WHERE id = ?
                    `).bind(invoice.project_id).run();
                } else if (invoice.invoice_type === 'balance') {
                    await env.DB.prepare(`
                        UPDATE projects
                        SET balance_paid = 1
                        WHERE id = ?
                    `).bind(invoice.project_id).run();
                } else if (invoice.invoice_type === 'full') {
                    await env.DB.prepare(`
                        UPDATE projects
                        SET deposit_paid = 1,
                            balance_paid = 1
                        WHERE id = ?
                    `).bind(invoice.project_id).run();
                }

                // Get customer details for email
                const customer = await env.DB.prepare(`
                    SELECT email, name
                    FROM customers
                    WHERE id = ?
                `).bind(invoice.customer_id).first<CustomerRow>();

                if (customer) {
                    // Send receipt email using existing function
                    try {
                        await sendEmail(env, {
                            to: customer.email,
                            subject: `Payment Receipt - Invoice #${invoice.id}`,
                            html: getPaymentReceiptEmail({
                                name: customer.name,
                                amount: invoice.amount,
                                invoiceType: invoice.invoice_type,
                                projectId: invoice.project_id,
                                paidAt: new Date(),
                            }),
                        });
                    } catch (emailError) {
                        console.error('Failed to send receipt email:', emailError);
                        // Don't fail the webhook if email fails
                    }
                }

                console.log('Payment processed successfully for invoice:', invoice.id);
                break;
            }

            case 'payment_intent.succeeded': {
                // Handles the Elements-based payment flow (PaymentModal → create-deposit/create-balance).
                // The hosted Checkout flow (invoice/[id].ts) fires checkout.session.completed instead.
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Look up invoice by stripe_payment_intent_id (stored when PI is created)
                const piInvoice = await env.DB.prepare(`
                    SELECT
                        i.id,
                        i.project_id,
                        i.customer_id,
                        i.amount,
                        i.invoice_type,
                        i.status,
                        p.service_type
                    FROM invoices i
                    JOIN projects p ON i.project_id = p.id
                    WHERE i.stripe_payment_intent_id = ?
                `).bind(paymentIntent.id).first<InvoiceRow>();

                if (!piInvoice) {
                    // PI not linked to one of our invoices — skip silently
                    console.log('No invoice found for payment_intent.succeeded:', paymentIntent.id);
                    break;
                }

                // Idempotency: skip if already marked paid (e.g. duplicate delivery)
                if (piInvoice.status === 'paid') {
                    console.log('Invoice already paid, skipping:', piInvoice.id);
                    break;
                }

                // Mark invoice paid
                await env.DB.prepare(`
                    UPDATE invoices
                    SET status = 'paid', paid_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).bind(piInvoice.id).run();

                // Update project payment flags
                if (piInvoice.invoice_type === 'deposit') {
                    await env.DB.prepare(`
                        UPDATE projects SET deposit_paid = 1 WHERE id = ?
                    `).bind(piInvoice.project_id).run();
                } else if (piInvoice.invoice_type === 'balance') {
                    await env.DB.prepare(`
                        UPDATE projects SET balance_paid = 1 WHERE id = ?
                    `).bind(piInvoice.project_id).run();
                }

                // Send receipt email
                const piCustomer = await env.DB.prepare(`
                    SELECT email, name FROM customers WHERE id = ?
                `).bind(piInvoice.customer_id).first<CustomerRow>();

                if (piCustomer) {
                    try {
                        await sendEmail(env, {
                            to: piCustomer.email,
                            subject: `Payment Receipt - Invoice #${piInvoice.id}`,
                            html: getPaymentReceiptEmail({
                                name: piCustomer.name,
                                amount: piInvoice.amount,
                                invoiceType: piInvoice.invoice_type,
                                projectId: piInvoice.project_id,
                                paidAt: new Date(),
                            }),
                        });
                    } catch (emailError) {
                        console.error('Failed to send receipt email:', emailError);
                    }
                }

                console.log('Payment Intent succeeded, invoice marked paid:', piInvoice.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.error('Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return new Response(JSON.stringify({
            error: 'Webhook processing failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
