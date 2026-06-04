import { requireAuth } from '../../lib/session';
import { Env } from '../../types';
import { createDepositPaymentIntent, getStripeClient } from '../../lib/stripe';

const TRANSACTION_FEE_NOTICE = 'Credit card processing fees apply (2.9% + $0.30)';

type DepositRequestBody = {
    projectId?: number;
    savePaymentMethod?: boolean;
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

    let body: DepositRequestBody;
    try {
        body = await request.json<DepositRequestBody>();
    } catch (error) {
        console.error('Create deposit body parse error:', error);
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

    let savePaymentMethod = false;
    if (body?.savePaymentMethod !== undefined) {
        if (typeof body.savePaymentMethod !== 'boolean') {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid savePaymentMethod value' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        savePaymentMethod = body.savePaymentMethod;
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
        if (normalizedStatus !== 'scheduled') {
            return new Response(
                JSON.stringify({ success: false, error: 'Project is not scheduled' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const depositPaid = project.deposit_paid === 1 || project.deposit_paid === true;
        if (depositPaid) {
            return new Response(
                JSON.stringify({ success: false, error: 'Deposit already paid' }),
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
        const depositAmount =
            Number.isFinite(depositAmountFromProject) && depositAmountFromProject > 0
                ? depositAmountFromProject
                : totalAmount * 0.5;

        if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid deposit amount' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const amountInCents = Math.round(depositAmount * 100);
        if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid deposit amount' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Deduplication: check for an existing deposit invoice for this project
        const existingDepositInvoice = await env.DB.prepare(
            `
      SELECT id, status, amount, stripe_payment_intent_id
      FROM invoices
      WHERE project_id = ? AND invoice_type = 'deposit'
      LIMIT 1
    `
        )
            .bind(projectId)
            .first<InvoiceRow>();

        if (existingDepositInvoice) {
            const invoiceStatus = normalizeStatus(existingDepositInvoice.status);

            if (invoiceStatus === 'paid') {
                return new Response(
                    JSON.stringify({ success: false, error: 'Deposit already paid' }),
                    { status: 409, headers: { 'Content-Type': 'application/json' } }
                );
            }

            if (invoiceStatus === 'pending' && existingDepositInvoice.stripe_payment_intent_id) {
                // Reuse existing payment intent — retrieve and return client_secret
                const stripe = getStripeClient(env);
                let paymentIntent;
                try {
                    paymentIntent = await stripe.paymentIntents.retrieve(
                        existingDepositInvoice.stripe_payment_intent_id
                    );
                } catch (error) {
                    console.error('Retrieve deposit payment intent error:', error);
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

                const invoiceAmount = toNumber(existingDepositInvoice.amount);
                const responseAmount =
                    Number.isFinite(invoiceAmount) && invoiceAmount > 0 ? invoiceAmount : depositAmount;

                return new Response(
                    JSON.stringify({
                        success: true,
                        clientSecret: paymentIntent.client_secret,
                        amount: Number(responseAmount.toFixed(2)),
                        currency: 'usd',
                        invoiceId: existingDepositInvoice.id,
                        transactionFeeNotice: TRANSACTION_FEE_NOTICE,
                    }),
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }

            // Invoice exists but has no Stripe PI yet (created by accept.ts) —
            // fall through to create the PI, then UPDATE the invoice instead of inserting
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

        let paymentIntent;
        try {
            paymentIntent = await createDepositPaymentIntent(env, {
                amountInCents,
                stripeCustomerId: customer.stripe_customer_id,
                projectId,
                customerId,
                savePaymentMethod,
            });
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

        let finalInvoiceId: number;

        if (existingDepositInvoice) {
            // Invoice was created by accept.ts (no PI yet) — link the new PI to it
            const updateResult = await env.DB.prepare(
                `
        UPDATE invoices
        SET stripe_payment_intent_id = ?, status = 'pending'
        WHERE id = ?
      `
            )
                .bind(paymentIntent.id, existingDepositInvoice.id)
                .run();

            if (!updateResult.success) {
                console.error('Update deposit invoice failed:', updateResult);
                return new Response(
                    JSON.stringify({ success: false, error: 'Failed to update invoice' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }
            finalInvoiceId = existingDepositInvoice.id;
        } else {
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
        ) VALUES (?, ?, ?, 'deposit', 'pending', ?, datetime('now'))
      `
            )
                .bind(projectId, customerId, depositAmount, paymentIntent.id)
                .run();

            if (!invoiceResult.success) {
                console.error('Create deposit invoice failed:', invoiceResult);
                return new Response(
                    JSON.stringify({ success: false, error: 'Failed to create invoice' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }
            finalInvoiceId = invoiceResult.meta.last_row_id;
        }

        return new Response(
            JSON.stringify({
                success: true,
                clientSecret: paymentIntent.client_secret,
                amount: Number(depositAmount.toFixed(2)),
                currency: 'usd',
                invoiceId: finalInvoiceId,
                transactionFeeNotice: TRANSACTION_FEE_NOTICE,
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Create deposit error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to create deposit' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
