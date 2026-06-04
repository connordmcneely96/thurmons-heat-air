import { requireAuth } from '../../lib/session';
import { getStripeClient } from '../../lib/stripe';
import { Env } from '../../types';

type SavePaymentMethodBody = {
    paymentMethodId?: string;
    setAsDefault?: boolean;
};

type CustomerRow = {
    stripe_customer_id: string | null;
};

type PaymentMethodRow = {
    id: number;
    stripe_payment_method_id: string;
};

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

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

    let body: SavePaymentMethodBody;
    try {
        body = await request.json<SavePaymentMethodBody>();
    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const paymentMethodId = body?.paymentMethodId;
    if (!isNonEmptyString(paymentMethodId)) {
        return new Response(JSON.stringify({ success: false, error: 'paymentMethodId is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Stripe payment method IDs always start with 'pm_'
    if (!paymentMethodId.startsWith('pm_')) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid payment method ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const setAsDefault = body?.setAsDefault === true;
    const customerId = authResult.userId;

    try {
        // Get customer's Stripe customer ID
        const customer = await env.DB.prepare(
            'SELECT stripe_customer_id FROM customers WHERE id = ?'
        )
            .bind(customerId)
            .first<CustomerRow>();

        if (!customer?.stripe_customer_id) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Payment processing unavailable',
                    message: 'No Stripe customer record found. Please contact support.',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const stripe = getStripeClient(env);

        // Verify this payment method exists and retrieve its details
        let pm;
        try {
            pm = await stripe.paymentMethods.retrieve(paymentMethodId);
        } catch {
            return new Response(
                JSON.stringify({ success: false, error: 'Payment method not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Attach payment method to customer if not already attached
        if (!pm.customer || pm.customer !== customer.stripe_customer_id) {
            try {
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customer.stripe_customer_id,
                });
            } catch (error) {
                console.error('Failed to attach payment method to customer:', error);
                return new Response(
                    JSON.stringify({ success: false, error: 'Failed to save payment method' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // If setAsDefault, update Stripe customer's default payment method
        if (setAsDefault) {
            await stripe.customers.update(customer.stripe_customer_id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        }

        // Check if we already have this payment method stored locally
        const existing = await env.DB.prepare(
            'SELECT id, stripe_payment_method_id FROM payment_methods WHERE stripe_payment_method_id = ?'
        )
            .bind(paymentMethodId)
            .first<PaymentMethodRow>();

        if (!existing) {
            // Extract card details if available
            const card = pm.type === 'card' ? pm.card : null;

            // If setAsDefault, clear existing defaults for this customer first
            if (setAsDefault) {
                await env.DB.prepare(
                    'UPDATE payment_methods SET is_default = 0 WHERE customer_id = ?'
                )
                    .bind(customerId)
                    .run();
            }

            // Insert new payment method record
            await env.DB.prepare(
                `INSERT INTO payment_methods (
                    customer_id,
                    stripe_payment_method_id,
                    type,
                    last4,
                    brand,
                    exp_month,
                    exp_year,
                    is_default,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
            )
                .bind(
                    customerId,
                    paymentMethodId,
                    pm.type,
                    card?.last4 ?? null,
                    card?.brand ?? null,
                    card?.exp_month ?? null,
                    card?.exp_year ?? null,
                    setAsDefault ? 1 : 0
                )
                .run();
        } else if (setAsDefault) {
            // Update existing record: clear all defaults, then set this one
            await env.DB.prepare(
                'UPDATE payment_methods SET is_default = 0 WHERE customer_id = ?'
            )
                .bind(customerId)
                .run();

            await env.DB.prepare(
                'UPDATE payment_methods SET is_default = 1 WHERE id = ?'
            )
                .bind(existing.id)
                .run();
        }

        return new Response(
            JSON.stringify({
                success: true,
                paymentMethodId,
                isDefault: setAsDefault,
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Save payment method error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to save payment method' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
