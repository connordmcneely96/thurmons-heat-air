import { requireAuth } from '../../lib/session';
import { Env } from '../../types';
import { getStripeClient } from '../../lib/stripe';

const SERVICE_TYPE_LABELS: Record<string, string> = {
    lawn_care: 'Lawn Care & Maintenance',
    flower_beds: 'Flower Bed Installation',
    seasonal_cleanup: 'Seasonal Cleanup',
    pressure_washing: 'Pressure Washing',
};

const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Scheduled',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const STATUS_FILTERS: Record<string, string> = {
    scheduled: 'scheduled',
    in_progress: 'in-progress',
    completed: 'completed',
    cancelled: 'cancelled',
};

interface ProjectRow {
    id: number;
    service_type: string;
    total_amount: number;
    deposit_amount: number | null;
    deposit_paid: number | boolean;
    balance_paid?: number | boolean;
    scheduled_date: string | null;
    status: string;
    completed_at: string | null;
    created_at: string;
    quote_description: string | null;
    project_description?: string | null;
}

interface PendingCheckoutInvoiceRow {
    id: number;
    project_id: number;
    invoice_type: string;
    stripe_invoice_id: string | null;
}

function normalizeServiceType(serviceType: string | null): string | null {
    if (!serviceType) return null;
    return serviceType.trim().toLowerCase().replace(/-/g, '_');
}

function normalizeStatus(status: string | null): string | null {
    if (!status) return null;
    return status.trim().toLowerCase().replace(/-/g, '_');
}

function formatTitle(value: string): string {
    return value
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

function parsePositiveInt(value: string | undefined | null, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumber(value: unknown, fallback = 0): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getBalanceDue(
    totalAmount: number,
    depositAmount: number,
    depositPaid: boolean,
    balancePaid: boolean
): number {
    if (balancePaid) {
        return 0;
    }
    const balance = depositPaid ? totalAmount - depositAmount : totalAmount;
    return balance > 0 ? balance : 0;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    try {
        const url = new URL(request.url);
        const sessionEmail = normalizeEmail(authResult.email);
        const statusQuery = url.searchParams.get('status');
        const limitQuery = url.searchParams.get('limit');
        const pageQuery = url.searchParams.get('page');
        const projectIdQuery = url.searchParams.get('projectId');

        // If a specific projectId is requested, fetch just that project
        if (projectIdQuery) {
            const projectId = parsePositiveInt(projectIdQuery, 0);
            if (projectId <= 0) {
                return new Response(
                    JSON.stringify({ success: false, error: 'Invalid project ID' }),
                    { status: 400, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const row = await env.DB.prepare(
                `
                SELECT
                  p.id,
                  p.service_type,
                  p.description as project_description,
                  p.total_amount,
                  p.deposit_amount,
                  CASE
                    WHEN EXISTS (
                        SELECT 1 FROM invoices i
                        WHERE i.project_id = p.id
                          AND i.invoice_type = 'deposit'
                          AND i.status = 'paid'
                    ) THEN 1
                    ELSE p.deposit_paid
                  END as deposit_paid,
                  CASE
                    WHEN EXISTS (
                        SELECT 1 FROM invoices i
                        WHERE i.project_id = p.id
                          AND i.invoice_type = 'balance'
                          AND i.status = 'paid'
                    ) THEN 1
                    ELSE p.balance_paid
                  END as balance_paid,
                  p.scheduled_date,
                  p.status,
                  p.completed_at,
                  p.created_at,
                  q.quoted_amount,
                  q.description as quote_description
                FROM projects p
                LEFT JOIN quotes q ON p.quote_id = q.id
                WHERE p.id = ?
                  AND (
                    p.customer_id = ?
                    OR EXISTS (
                        SELECT 1 FROM customers c2
                        WHERE c2.id = p.customer_id
                          AND LOWER(c2.email) = ?
                    )
                  )
              `
            )
                .bind(projectId, authResult.userId, sessionEmail)
                .first<ProjectRow>();

            if (!row) {
                return new Response(
                    JSON.stringify({ success: false, error: 'Project not found' }),
                    { status: 404, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const normalizedServiceType = normalizeServiceType(row.service_type);
            const serviceName = normalizedServiceType
                ? SERVICE_TYPE_LABELS[normalizedServiceType] || formatTitle(normalizedServiceType)
                : 'Service';
            const normalizedRowStatus = normalizeStatus(row.status) ?? row.status;
            const statusDisplay =
                STATUS_LABELS[normalizedRowStatus] || formatTitle(normalizedRowStatus);
            const totalAmount = toNumber(row.total_amount, 0);
            const depositAmount = toNumber(row.deposit_amount, 0);
            const depositPaid = row.deposit_paid === 1 || row.deposit_paid === true;
            const balancePaid = row.balance_paid === 1 || row.balance_paid === true;
            const balanceDue = getBalanceDue(totalAmount, depositAmount, depositPaid, balancePaid);

            const project = {
                id: row.id,
                serviceType: normalizedServiceType ?? row.service_type,
                service_type: normalizedServiceType ?? row.service_type,
                serviceName,
                totalAmount,
                total_amount: totalAmount,
                depositAmount,
                deposit_amount: depositAmount,
                depositPaid,
                deposit_paid: depositPaid,
                balancePaid,
                balance_paid: balancePaid,
                balanceDue,
                balance_due: balanceDue,
                scheduledDate: row.scheduled_date,
                scheduled_date: row.scheduled_date,
                status: normalizedRowStatus,
                statusDisplay,
                completedAt: row.completed_at,
                completed_at: row.completed_at,
                createdAt: row.created_at,
                created_at: row.created_at,
                description: row.quote_description ?? row.project_description ?? null,
            };

            if (!project.deposit_paid || !project.balance_paid) {
                const stripe = getStripeClient(env);
                const pendingInvoices = await env.DB.prepare(
                    `
                    SELECT id, project_id, invoice_type, stripe_invoice_id
                    FROM invoices
                    WHERE project_id = ?
                      AND status = 'pending'
                      AND stripe_invoice_id LIKE 'cs_%'
                    `
                ).bind(project.id).all<PendingCheckoutInvoiceRow>();

                for (const invoice of pendingInvoices.results ?? []) {
                    if (!invoice.stripe_invoice_id) continue;
                    try {
                        const session = await stripe.checkout.sessions.retrieve(invoice.stripe_invoice_id);
                        if (session.payment_status !== 'paid') continue;

                        const paymentIntentId = typeof session.payment_intent === 'string'
                            ? session.payment_intent
                            : session.payment_intent?.id || null;

                        await env.DB.prepare(
                            `
                            UPDATE invoices
                            SET status = 'paid',
                                paid_at = CURRENT_TIMESTAMP,
                                stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id)
                            WHERE id = ?
                            `
                        ).bind(paymentIntentId, invoice.id).run();

                        if (invoice.invoice_type === 'deposit') {
                            project.deposit_paid = true;
                            project.depositPaid = true;
                        } else if (invoice.invoice_type === 'balance') {
                            project.balance_paid = true;
                            project.balancePaid = true;
                        } else if (invoice.invoice_type === 'full') {
                            project.deposit_paid = true;
                            project.balance_paid = true;
                            project.depositPaid = true;
                            project.balancePaid = true;
                        }
                    } catch {
                        // ignore transient Stripe lookup failures for this self-heal path
                    }
                }

                await env.DB.prepare(
                    `
                    UPDATE projects
                    SET deposit_paid = ?, balance_paid = ?
                    WHERE id = ?
                    `
                )
                    .bind(project.deposit_paid ? 1 : 0, project.balance_paid ? 1 : 0, project.id)
                    .run();

                const recomputedBalance = getBalanceDue(
                    project.total_amount,
                    project.deposit_amount,
                    project.deposit_paid,
                    project.balance_paid
                );
                project.balance_due = recomputedBalance;
                project.balanceDue = recomputedBalance;
            }

            return new Response(
                JSON.stringify({
                    success: true,
                    projects: [project],
                    data: [project],
                    pagination: { currentPage: 1, totalPages: 1, totalProjects: 1, hasMore: false },
                }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const limit = parsePositiveInt(limitQuery, 20);
        const page = parsePositiveInt(pageQuery, 1);
        const offset = (page - 1) * limit;

        const normalizedStatus = normalizeStatus(statusQuery ?? null);
        if (normalizedStatus && !STATUS_FILTERS[normalizedStatus]) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid status filter',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const statusFilter = normalizedStatus ? STATUS_FILTERS[normalizedStatus] : null;

        const countResult = await env.DB.prepare(
            `
            SELECT COUNT(*) as total
            FROM projects p
            WHERE (
                p.customer_id = ?
                OR EXISTS (
                    SELECT 1 FROM customers c2
                    WHERE c2.id = p.customer_id
                      AND LOWER(c2.email) = ?
                )
            )
              AND (? IS NULL OR p.status = ?)
          `
        )
            .bind(authResult.userId, sessionEmail, statusFilter, statusFilter)
            .first<{ total: number }>();

        const totalProjects = Math.max(0, toNumber(countResult?.total, 0));
        const totalPages = totalProjects === 0 ? 0 : Math.ceil(totalProjects / limit);
        const hasMore = page < totalPages;

        const projectResults = await env.DB.prepare(
            `
            SELECT
              p.id,
              p.service_type,
              p.description as project_description,
              p.total_amount,
              p.deposit_amount,
              CASE
                WHEN EXISTS (
                    SELECT 1 FROM invoices i
                    WHERE i.project_id = p.id
                      AND i.invoice_type = 'deposit'
                      AND i.status = 'paid'
                ) THEN 1
                ELSE p.deposit_paid
              END as deposit_paid,
              CASE
                WHEN EXISTS (
                    SELECT 1 FROM invoices i
                    WHERE i.project_id = p.id
                      AND i.invoice_type = 'balance'
                      AND i.status = 'paid'
                ) THEN 1
                ELSE p.balance_paid
              END as balance_paid,
              p.scheduled_date,
              p.status,
              p.completed_at,
              p.created_at,
              q.quoted_amount,
              q.description as quote_description
            FROM projects p
            LEFT JOIN quotes q ON p.quote_id = q.id
            WHERE (
                p.customer_id = ?
                OR EXISTS (
                    SELECT 1 FROM customers c2
                    WHERE c2.id = p.customer_id
                      AND LOWER(c2.email) = ?
                )
            )
              AND (? IS NULL OR p.status = ?)
            ORDER BY 
              CASE p.status
                WHEN 'in_progress' THEN 1
                WHEN 'in-progress' THEN 1
                WHEN 'scheduled' THEN 2
                WHEN 'completed' THEN 3
                WHEN 'cancelled' THEN 4
                ELSE 5
              END,
              p.scheduled_date DESC
            LIMIT ? OFFSET ?
          `
        )
            .bind(authResult.userId, sessionEmail, statusFilter, statusFilter, limit, offset)
            .all<ProjectRow>();

        const projects = (projectResults.results ?? []).map((row) => {
            const normalizedServiceType = normalizeServiceType(row.service_type);
            const serviceName = normalizedServiceType
                ? SERVICE_TYPE_LABELS[normalizedServiceType] || formatTitle(normalizedServiceType)
                : 'Service';
            const normalizedRowStatus = normalizeStatus(row.status) ?? row.status;
            const statusDisplay =
                STATUS_LABELS[normalizedRowStatus] || formatTitle(normalizedRowStatus);
            const totalAmount = toNumber(row.total_amount, 0);
            const depositAmount = toNumber(row.deposit_amount, 0);
            const depositPaid = row.deposit_paid === 1 || row.deposit_paid === true;
            const balancePaid = row.balance_paid === 1 || row.balance_paid === true;
            const balanceDue = getBalanceDue(totalAmount, depositAmount, depositPaid, balancePaid);

            return {
                id: row.id,
                serviceType: normalizedServiceType ?? row.service_type,
                service_type: normalizedServiceType ?? row.service_type,
                serviceName,
                totalAmount,
                total_amount: totalAmount,
                depositAmount,
                deposit_amount: depositAmount,
                depositPaid,
                deposit_paid: depositPaid,
                balancePaid,
                balance_paid: balancePaid,
                balanceDue,
                balance_due: balanceDue,
                scheduledDate: row.scheduled_date,
                scheduled_date: row.scheduled_date,
                status: normalizedRowStatus,
                statusDisplay,
                completedAt: row.completed_at,
                completed_at: row.completed_at,
                createdAt: row.created_at,
                created_at: row.created_at,
                description: row.quote_description ?? row.project_description ?? null,
            };
        });

        // Self-heal project payment flags when hosted checkout succeeded but webhook is delayed/missed.
        const stripe = getStripeClient(env);
        const checkoutPaidCache = new Map<string, { paid: boolean; paymentIntentId: string | null }>();

        for (const project of projects) {
            if (project.deposit_paid && project.balance_paid) continue;

            const pendingInvoices = await env.DB.prepare(
                `
                SELECT id, project_id, invoice_type, stripe_invoice_id
                FROM invoices
                WHERE project_id = ?
                  AND status = 'pending'
                  AND stripe_invoice_id LIKE 'cs_%'
                `
            ).bind(project.id).all<PendingCheckoutInvoiceRow>();

            for (const invoice of pendingInvoices.results ?? []) {
                if (!invoice.stripe_invoice_id) continue;

                let cached = checkoutPaidCache.get(invoice.stripe_invoice_id);
                if (!cached) {
                    try {
                        const session = await stripe.checkout.sessions.retrieve(invoice.stripe_invoice_id);
                        const paymentIntentId = typeof session.payment_intent === 'string'
                            ? session.payment_intent
                            : session.payment_intent?.id || null;
                        cached = { paid: session.payment_status === 'paid', paymentIntentId };
                    } catch {
                        cached = { paid: false, paymentIntentId: null };
                    }
                    checkoutPaidCache.set(invoice.stripe_invoice_id, cached);
                }

                if (!cached.paid) continue;

                await env.DB.prepare(
                    `
                    UPDATE invoices
                    SET status = 'paid',
                        paid_at = CURRENT_TIMESTAMP,
                        stripe_payment_intent_id = COALESCE(?, stripe_payment_intent_id)
                    WHERE id = ?
                    `
                ).bind(cached.paymentIntentId, invoice.id).run();

                if (invoice.invoice_type === 'deposit') {
                    project.deposit_paid = true;
                } else if (invoice.invoice_type === 'balance') {
                    project.balance_paid = true;
                } else if (invoice.invoice_type === 'full') {
                    project.deposit_paid = true;
                    project.balance_paid = true;
                }

                await env.DB.prepare(
                    `
                    UPDATE projects
                    SET deposit_paid = ?, balance_paid = ?
                    WHERE id = ?
                    `
                )
                    .bind(project.deposit_paid ? 1 : 0, project.balance_paid ? 1 : 0, project.id)
                    .run();
            }

            project.balance_due = getBalanceDue(
                project.total_amount,
                project.deposit_amount,
                project.deposit_paid,
                project.balance_paid
            );
            project.balanceDue = project.balance_due;
        }

        return new Response(
            JSON.stringify({
                success: true,
                projects,
                data: projects,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalProjects,
                    hasMore,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Customer projects error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to fetch projects',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
