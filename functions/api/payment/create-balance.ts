import { requireAuth } from '../../lib/session';
import { createPaymentIntentWithRetry, getStripeClient } from '../../lib/stripe';
import { Env } from '../../types';

const TRANSACTION_FEE_NOTICE = 'Credit card processing fees apply';

type BalanceRequestBody = {
    projectId?: number;
    usesSavedPaymentMethod?: boolean;
};

type ProjectRow = {
    id: number;
    customer_id: number;
    status: string | null;
    deposit_paid: number | boolean | null;
    total_amount: number | null;
    deposit_amount: number | null;
};

type CustomerRow = {
    stripe_customer_id: string | null;
};

type InvoiceRow = {
    id: number;
    status: string | null;
    amount: number | null;
    stripe_payment_intent_id: string | null;
};

function normalizeStatus(status: string | null): string | null {
    if (!status) {
        return null;
    }
    return status.trim().toLowerCase().replace(/-/g, '_');
}

function toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parseProjectId(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        return null;
    }
    return value;
}

async function getSavedPaymentMethodId(
    env: Env,
    stripeCustomerId: string
): Promise<string | null> {
    const stripe = getStripeClient(env);
    const customer = await stripe.customers.retrieve(stripeCustomerId);

    if (!customer || (typeof customer === 'object' && 'deleted' in customer && customer.deleted)) {
        return null;
    }

    if (typeof customer !== 'string') {
        const defaultMethod = customer.invoice_settings?.default_payment_method;
        if (typeof defaultMethod === 'string') {
            return defaultMethod;
        }
        if (defaultMethod && typeof defaultMethod === 'object' && 'id' in defaultMethod) {
            return defaultMethod.id;
        }
    }

    const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
        limit: 1,
    });

    return paymentMethods.data[0]?.id ?? null;
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

    let body: BalanceRequestBody;
    try {
        body = await request.json<BalanceRequestBody>();
    } catch (error) {
        console.error('Create balance body parse error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const projectId = parseProjectId(body?.projectId);
    if (!projectId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid project ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let usesSavedPaymentMethod = false;
    if (body?.usesSavedPaymentMethod !== undefined) {
        if (typeof body.usesSavedPaymentMethod !== 'boolean') {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid usesSavedPaymentMethod value' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        usesSavedPaymentMethod = body.usesSavedPaymentMethod;
    }

    try {
        const customerId = authResult.userId;

        const project = await env.DB.prepare(
            `
      SELECT id, customer_id, status, deposit_paid, total_amount, deposit_amount
      FROM projects
      WHERE id = ? AND customer_id = ?
    `
        )
            .bind(projectId, customerId)
            .first<ProjectRow>();

        if (!project) {
            return new Response(
                JSON.stringify({ success: false, error: 'Project does not belong to customer' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const normalizedStatus = normalizeStatus(project.status);
        if (normalizedStatus !== 'completed') {
            return new Response(
                JSON.stringify({ success: false, error: 'Job not completed yet' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const depositPaid = project.deposit_paid === 1 || project.deposit_paid === true;
        if (!depositPaid) {
            return new Response(
                JSON.stringify({ success: false, error: 'Deposit not paid yet' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const totalAmount = toNumber(project.total_amount);
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid project amount' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const depositAmountFromProject = toNumber(project.deposit_amount);
        const balanceAmount =
            Number.isFinite(depositAmountFromProject) && depositAmountFromProject > 0
                ? totalAmount - depositAmountFromProject
                : totalAmount * 0.5;

        if (!Number.isFinite(balanceAmount) || balanceAmount <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid balance amount' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const amountInCents = Math.round(balanceAmount * 100);
        if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid balance amount' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const existingInvoice = await env.DB.prepare(
            `
      SELECT id, status, amount, stripe_payment_intent_id
      FROM invoices
      WHERE project_id = ?
        AND invoice_type = 'balance'
      LIMIT 1
    `
        )
            .bind(projectId)
            .first<InvoiceRow>();

        if (existingInvoice) {
            const invoiceStatus = normalizeStatus(existingInvoice.status);
            if (invoiceStatus === 'paid') {
                return new Response(JSON.stringify({ success: false, error: 'Already paid' }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            if (invoiceStatus === 'pending') {
                if (!existingInvoice.stripe_payment_intent_id) {
                    console.error(
                        'Balance invoice missing Stripe payment intent:',
                        existingInvoice.id
                    );
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'Payment processing temporarily unavailable',
                        }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }

                const stripe = getStripeClient(env);
                let paymentIntent;
                try {
                    paymentIntent = await stripe.paymentIntents.retrieve(
                        existingInvoice.stripe_payment_intent_id
                    );
                } catch (error) {
                    console.error('Retrieve balance payment intent error:', error);
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'Payment processing temporarily unavailable',
                        }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }

                if (!paymentIntent.client_secret) {
                    console.error('Stripe payment intent missing client secret:', paymentIntent.id);
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: 'Payment processing temporarily unavailable',
                        }),
                        { status: 500, headers: { 'Content-Type': 'application/json' } }
                    );
                }

                const invoiceAmount = toNumber(existingInvoice.amount);
                const responseAmount =
                    Number.isFinite(invoiceAmount) && invoiceAmount > 0 ? invoiceAmount : balanceAmount;

                return new Response(
                    JSON.stringify({
                        success: true,
                        clientSecret: paymentIntent.client_secret,
                        amount: Number(responseAmount.toFixed(2)),
                        currency: 'usd',
                        invoiceId: existingInvoice.id,
                        projectCompleted: true,
                        transactionFeeNotice: TRANSACTION_FEE_NOTICE,
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        const customer = await env.DB.prepare(
            `
      SELECT stripe_customer_id
      FROM customers
      WHERE id = ?
    `
        )
            .bind(customerId)
            .first<CustomerRow>();

        if (!customer?.stripe_customer_id) {
            console.error('Stripe customer ID missing for customer:', customerId);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Payment processing temporarily unavailable',
                    message: 'Please try again or contact us',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let savedPaymentMethodId: string | null = null;
        if (usesSavedPaymentMethod) {
            try {
                savedPaymentMethodId = await getSavedPaymentMethodId(
                    env,
                    customer.stripe_customer_id
                );
            } catch (error) {
                console.error('Saved payment method lookup failed:', error);
            }
        }

        let paymentIntent;
        try {
            const paymentIntentParams: Parameters<typeof createPaymentIntentWithRetry>[1] = {
                amount: amountInCents,
                currency: 'usd',
                customer: customer.stripe_customer_id,
                metadata: {
                    source: 'evergrow-landscaping-website',
                    project_id: String(projectId),
                    customer_id: String(customerId),
                    invoice_type: 'balance',
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            };

            if (savedPaymentMethodId) {
                paymentIntentParams.payment_method = savedPaymentMethodId;
            }

            paymentIntent = await createPaymentIntentWithRetry(env, paymentIntentParams);
        } catch (error) {
            console.error('Stripe payment intent error:', error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Payment processing temporarily unavailable',
                    message: 'Please try again or contact us',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (!paymentIntent.client_secret) {
            console.error('Stripe payment intent missing client secret:', paymentIntent.id);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Payment processing temporarily unavailable',
                    message: 'Please try again or contact us',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const invoiceResult = await env.DB.prepare(
            `
      INSERT INTO invoices (
        project_id,
        customer_id,
        amount,
        invoice_type,
        status,
        stripe_payment_intent_id,
        created_at
      ) VALUES (?, ?, ?, 'balance', 'pending', ?, datetime('now'))
    `
        )
            .bind(projectId, customerId, balanceAmount, paymentIntent.id)
            .run();

        if (!invoiceResult.success) {
            console.error('Create balance invoice failed:', invoiceResult);
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to create invoice' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                clientSecret: paymentIntent.client_secret,
                amount: Number(balanceAmount.toFixed(2)),
                currency: 'usd',
                invoiceId: invoiceResult.meta.last_row_id,
                projectCompleted: true,
                transactionFeeNotice: TRANSACTION_FEE_NOTICE,
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Create balance error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to create balance payment' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
