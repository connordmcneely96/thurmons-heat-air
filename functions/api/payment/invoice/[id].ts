import { requireAuth } from '../../../lib/session';
import { Env } from '../../../types';
import { getStripeClient } from '../../../lib/stripe';

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
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const customerId = authResult.userId;
        const invoiceId = params.id as string;

        // Get invoice details
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
        `).bind(invoiceId, customerId).first<InvoiceRow>();

        if (!invoice) {
            return new Response(JSON.stringify({ success: false, error: 'Invoice not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Check if invoice can be paid
        if (invoice.status !== 'pending') {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invoice cannot be paid. Status: ' + invoice.status
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get customer details
        const customer = await env.DB.prepare(`
            SELECT id, email, name, stripe_customer_id
            FROM customers
            WHERE id = ?
        `).bind(customerId).first<CustomerRow>();

        if (!customer) {
            return new Response(JSON.stringify({ success: false, error: 'Customer not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const stripe = getStripeClient(env);

        // Get or create Stripe customer
        let stripeCustomerId = customer.stripe_customer_id;
        if (!stripeCustomerId) {
            const stripeCustomer = await stripe.customers.create({
                email: customer.email,
                name: customer.name,
                metadata: {
                    customer_id: customerId.toString(),
                },
            });
            stripeCustomerId = stripeCustomer.id;

            // Save Stripe customer ID
            await env.DB.prepare(`
                UPDATE customers
                SET stripe_customer_id = ?
                WHERE id = ?
            `).bind(stripeCustomerId, customerId).run();
        }

        // Create description
        const serviceName = invoice.service_type
            ? SERVICE_NAME_DISPLAY[invoice.service_type] || invoice.service_type
            : 'Service';
        const invoiceTypeDisplay = INVOICE_TYPE_DISPLAY[invoice.invoice_type] || invoice.invoice_type;
        const description = `${serviceName} - ${invoiceTypeDisplay} (Invoice #${invoice.id})`;

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(invoice.amount * 100), // Convert to cents
                        product_data: {
                            name: description,
                            description: `Invoice #${invoice.id}`,
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${new URL(request.url).origin}/portal/invoices/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${new URL(request.url).origin}/portal/invoices`,
            metadata: {
                invoice_id: invoice.id.toString(),
                customer_id: customerId.toString(),
            },
        });

        return new Response(JSON.stringify({
            success: true,
            sessionId: session.id,
            url: session.url
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Create checkout session error:', error instanceof Error ? error.message : String(error));
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to create payment session',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
