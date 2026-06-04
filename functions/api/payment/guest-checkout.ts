import { Env } from '../../types';
import { getStripeClient } from '../../lib/stripe';

interface InvoiceRow {
    id: number;
    project_id: number;
    customer_id: number;
    amount: number;
    invoice_type: string;
    status: string;
    service_type: string | null;
}

interface CustomerRow {
    id: number;
    email: string;
    name: string;
    stripe_customer_id: string | null;
}

const SERVICE_NAME_DISPLAY: Record<string, string> = {
    lawn_care: 'Lawn Care & Maintenance',
    'lawn-care': 'Lawn Care & Maintenance',
    flower_beds: 'Flower Bed Installation',
    'flower-beds': 'Flower Bed Installation',
    seasonal_cleanup: 'Seasonal Cleanup',
    'seasonal-cleanup': 'Seasonal Cleanup',
    pressure_washing: 'Pressure Washing',
    'pressure-washing': 'Pressure Washing',
    other: 'Other Services',
};

const INVOICE_TYPE_DISPLAY: Record<string, string> = {
    deposit: 'Deposit (50%)',
    balance: 'Balance Due',
    full: 'Full Payment',
    additional: 'Additional Charge',
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json<{ invoiceId: number; email: string }>();
        const { invoiceId, email } = body;

        if (!invoiceId || !email) {
            return new Response(JSON.stringify({ success: false, error: 'Invoice ID and email are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Look up the customer by email
        const customer = await env.DB.prepare(
            'SELECT id, email, name, stripe_customer_id FROM customers WHERE LOWER(email) = ?'
        ).bind(normalizedEmail).first<CustomerRow>();

        if (!customer) {
            return new Response(JSON.stringify({ success: false, error: 'No account found for this email' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get invoice and verify it belongs to this customer
        const invoice = await env.DB.prepare(`
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
            WHERE i.id = ? AND i.customer_id = ?
        `).bind(invoiceId, customer.id).first<InvoiceRow>();

        if (!invoice) {
            return new Response(JSON.stringify({ success: false, error: 'Invoice not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (invoice.status !== 'pending') {
            return new Response(JSON.stringify({
                success: false,
                error: 'This invoice cannot be paid. Status: ' + invoice.status
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Initialize Stripe
        const stripe = getStripeClient(env);

        // Get or create Stripe customer
        let stripeCustomerId = customer.stripe_customer_id;
        if (!stripeCustomerId) {
            const stripeCustomer = await stripe.customers.create({
                email: customer.email,
                name: customer.name,
                metadata: {
                    customer_id: customer.id.toString(),
                },
            });
            stripeCustomerId = stripeCustomer.id;

            await env.DB.prepare(
                'UPDATE customers SET stripe_customer_id = ? WHERE id = ?'
            ).bind(stripeCustomerId, customer.id).run();
        }

        // Build description
        const serviceName = invoice.service_type
            ? SERVICE_NAME_DISPLAY[invoice.service_type] || invoice.service_type
            : 'Service';
        const invoiceTypeDisplay = INVOICE_TYPE_DISPLAY[invoice.invoice_type] || invoice.invoice_type;
        const description = `${serviceName} - ${invoiceTypeDisplay} (Invoice #${invoice.id})`;

        // Create Stripe Checkout Session with guest-friendly URLs
        const origin = new URL(request.url).origin;
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(invoice.amount * 100),
                        product_data: {
                            name: description,
                            description: `Invoice #${invoice.id}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/pay/success/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/pay/`,
            metadata: {
                invoice_id: invoice.id.toString(),
                customer_id: customer.id.toString(),
                guest_checkout: 'true',
            },
        });

        // Save checkout session reference
        await env.DB.prepare(
            'UPDATE invoices SET stripe_invoice_id = ? WHERE id = ?'
        ).bind(session.id, invoice.id).run();

        return new Response(JSON.stringify({
            success: true,
            sessionId: session.id,
            url: session.url,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Guest checkout error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to create payment session',
            details: error instanceof Error ? error.message : 'Unknown error',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
