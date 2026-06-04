import {
    getProjectCancellationEmail,
    getProjectCompletionEmail,
    getProjectFeedbackRequestEmail,
    sendEmail,
} from '../../../lib/email';
import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

const OWNER_EMAIL_FALLBACK = 'karson@evergrowlandscaping.com';
const SITE_BASE_URL = 'https://evergrowlandscaping.com';
const PORTAL_BASE_URL = `${SITE_BASE_URL}/portal`;
const FEEDBACK_FORM_URL = `${PORTAL_BASE_URL}/feedback`;
const GOOGLE_REVIEW_URL = 'https://g.page/r/evergrow-landscaping/review';
const COMPLETION_DUE_DAYS = 7;

type ProjectStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

const STATUS_DB_MAP: Record<ProjectStatus, string> = {
    scheduled: 'scheduled',
    in_progress: 'in-progress',
    completed: 'completed',
    cancelled: 'cancelled',
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
    lawn_care: 'Lawn Care & Maintenance',
    'lawn-care': 'Lawn Care & Maintenance',
    flower_beds: 'Flower Bed Installation',
    'flower-beds': 'Flower Bed Installation',
    seasonal_cleanup: 'Seasonal Cleanup',
    'seasonal-cleanup': 'Seasonal Cleanup',
    pressure_washing: 'Pressure Washing',
    'pressure-washing': 'Pressure Washing',
    landscaping: 'Landscaping & Design',
    other: 'Other Services',
};

interface ProjectRow {
    id: number;
    customer_id: number;
    status: string | null;
    service_type: string | null;
    total_amount: number | null;
    deposit_amount: number | null;
    deposit_paid: number | boolean | null;
    completed_at: string | null;
    project_description: string | null;
    quote_description: string | null;
    customer_name: string | null;
    customer_email: string | null;
}

interface InvoiceRow {
    id: number;
    amount: number | null;
    status: string | null;
    created_at: string | null;
}

function parseProjectId(value?: string | string[]): number | null {
    const val = Array.isArray(value) ? value[0] : value;
    if (!val || !/^\d+$/.test(val)) {
        return null;
    }
    const parsed = Number.parseInt(val, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStatusInput(value: unknown): ProjectStatus | null {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_');
    if (
        normalized === 'scheduled' ||
        normalized === 'in_progress' ||
        normalized === 'completed' ||
        normalized === 'cancelled'
    ) {
        return normalized as ProjectStatus;
    }
    return null;
}

function normalizeStoredStatus(value: string | null): ProjectStatus | null {
    if (!value) {
        return null;
    }
    const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, '_');
    if (
        normalized === 'scheduled' ||
        normalized === 'in_progress' ||
        normalized === 'completed' ||
        normalized === 'cancelled'
    ) {
        return normalized as ProjectStatus;
    }
    return null;
}

function validateTransition(
    current: ProjectStatus,
    next: ProjectStatus
): { success: true } | { success: false; error: string } {
    if (current === next) {
        return {
            success: false,
            error: `Project is already ${formatStatusLabel(next)}`,
        };
    }
    if (current === 'completed') {
        return {
            success: false,
            error: 'Completed projects cannot be updated',
        };
    }
    if (current === 'cancelled') {
        return {
            success: false,
            error: 'Cancelled projects cannot be updated',
        };
    }
    if (current === 'scheduled' && (next === 'in_progress' || next === 'cancelled')) {
        return { success: true };
    }
    if (current === 'in_progress' && (next === 'completed' || next === 'cancelled')) {
        return { success: true };
    }
    return {
        success: false,
        error: `Invalid status transition from ${formatStatusLabel(current)} to ${formatStatusLabel(next)}`,
    };
}

function formatStatusLabel(value: ProjectStatus): string {
    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseOptionalText(
    value: unknown,
    fieldName: string
): { value: string | null; error?: string } {
    if (value === undefined || value === null) {
        return { value: null };
    }
    if (typeof value !== 'string') {
        return { value: null, error: `${fieldName} must be a string` };
    }
    const trimmed = value.trim();
    return { value: trimmed.length > 0 ? trimmed : null };
}

function parsePhotoList(value: unknown): { value: string[]; error?: string } {
    if (value === undefined || value === null) {
        return { value: [] };
    }
    if (!Array.isArray(value)) {
        return { value: [], error: 'completionPhotos must be an array of strings' };
    }
    const photos: string[] = [];
    for (const item of value) {
        if (typeof item !== 'string') {
            return { value: [], error: 'completionPhotos must be an array of strings' };
        }
        const trimmed = item.trim();
        if (trimmed) {
            photos.push(trimmed);
        }
    }
    return { value: photos };
}

function isDepositPaid(value: number | boolean | null): boolean {
    return value === 1 || value === true;
}

function toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeInvoiceStatus(value: string | null): string | null {
    if (!value) {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 ? normalized : null;
}

function formatIsoTimestamp(value: string | null): string | null {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed.toISOString();
}

function normalizeEmail(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim().toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeName(value?: string | null): string {
    if (!value) return 'Customer';
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : 'Customer';
}

function getServiceTypeLabel(value?: string | null): string {
    if (!value) {
        return 'Landscaping Service';
    }
    const normalized = value.trim().toLowerCase();
    return SERVICE_TYPE_LABELS[normalized] || formatTitle(normalized);
}

function formatTitle(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseDate(value: string | null): Date | null {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
}

function formatDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
}

function buildPaymentPath(invoiceId: number): string {
    return `/portal/invoices/pay?id=${invoiceId}`;
}

function getStatusMessage(status: ProjectStatus): string {
    switch (status) {
        case 'completed':
            return 'Project marked as completed';
        case 'cancelled':
            return 'Project cancelled';
        case 'in_progress':
            return 'Project marked as in progress';
        default:
            return 'Project updated';
    }
}

// GET — full project detail with customer info and invoices
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;

    const projectId = parseProjectId(params.id);
    if (!projectId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid project ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const project = await env.DB.prepare(
            `
            SELECT
              p.id,
              p.customer_id,
              p.quote_id,
              p.service_type,
              p.description AS project_description,
              p.total_amount,
              p.deposit_amount,
              p.deposit_paid,
              COALESCE(p.balance_paid, 0) AS balance_paid,
              p.scheduled_date,
              p.scheduled_time,
              p.status,
              p.completed_at,
              p.created_at,
              c.name  AS customer_name,
              c.email AS customer_email,
              c.phone AS customer_phone,
              c.address AS customer_address,
              q.quoted_amount,
              q.description AS quote_description,
              q.quote_notes
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            LEFT JOIN quotes   q ON p.quote_id   = q.id
            WHERE p.id = ?
            LIMIT 1
            `
        )
            .bind(projectId)
            .first<Record<string, unknown>>();

        if (!project) {
            return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const invoiceResults = await env.DB.prepare(
            `
            SELECT
              id,
              amount,
              invoice_type,
              status,
              stripe_payment_intent_id,
              paid_at,
              due_date,
              created_at
            FROM invoices
            WHERE project_id = ?
            ORDER BY created_at ASC
            `
        )
            .bind(projectId)
            .all<Record<string, unknown>>();

        const rawStatus = project.status as string | null;
        const normalizedStatus = normalizeStoredStatus(rawStatus) ?? rawStatus ?? 'scheduled';

        const serviceTypeRaw = project.service_type as string | null;
        const serviceType = serviceTypeRaw
            ? serviceTypeRaw.trim().toLowerCase().replace(/-/g, '_')
            : null;
        const serviceName = serviceType
            ? SERVICE_TYPE_LABELS[serviceType] ?? serviceType
            : 'Service';

        const totalAmount = Number(project.total_amount ?? 0);
        const depositAmount = Number(project.deposit_amount ?? 0);
        const depositPaid =
            project.deposit_paid === 1 || project.deposit_paid === true;
        const balancePaid =
            project.balance_paid === 1 || project.balance_paid === true;
        const balanceDue = depositPaid
            ? Math.max(0, totalAmount - depositAmount)
            : totalAmount;

        const INVOICE_TYPE_DISPLAY: Record<string, string> = {
            deposit: 'Deposit (50%)',
            balance: 'Balance Due',
            full: 'Full Payment',
            additional: 'Additional Charge',
        };

        return new Response(
            JSON.stringify({
                success: true,
                project: {
                    id: project.id,
                    customerId: project.customer_id,
                    quoteId: project.quote_id,
                    serviceType,
                    serviceName,
                    totalAmount,
                    depositAmount,
                    depositPaid,
                    balancePaid,
                    balanceDue,
                    scheduledDate: project.scheduled_date ?? null,
                    scheduledTime: project.scheduled_time ?? null,
                    status: normalizedStatus,
                    statusDisplay: formatStatusLabel(normalizedStatus as ProjectStatus) ?? normalizedStatus,
                    completedAt: project.completed_at ?? null,
                    createdAt: project.created_at,
                    description:
                        (project.quote_description as string | null) ??
                        (project.project_description as string | null) ??
                        null,
                    customer: {
                        name: project.customer_name ?? null,
                        email: project.customer_email ?? null,
                        phone: project.customer_phone ?? null,
                        address: project.customer_address ?? null,
                    },
                    invoices: (invoiceResults.results ?? []).map((inv) => ({
                        id: inv.id,
                        amount: Number(inv.amount ?? 0),
                        invoiceType: inv.invoice_type,
                        invoiceTypeDisplay:
                            INVOICE_TYPE_DISPLAY[inv.invoice_type as string] ??
                            inv.invoice_type,
                        status: inv.status,
                        paidAt: inv.paid_at ?? null,
                        dueDate: inv.due_date ?? null,
                        createdAt: inv.created_at,
                    })),
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin project GET error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to load project' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// PATCH — update scheduling fields (scheduled_date, scheduled_time) without status change
export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;

    const projectId = parseProjectId(params.id);
    if (!projectId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid project ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!body || typeof body !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { scheduledDate, scheduledTime } = body as Record<string, unknown>;

    if (typeof scheduledDate !== 'string' || !scheduledDate.trim()) {
        return new Response(JSON.stringify({ success: false, error: 'scheduledDate is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const parsedDate = new Date(scheduledDate.trim());
    if (Number.isNaN(parsedDate.getTime())) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid scheduledDate format' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const scheduledDateValue = scheduledDate.trim();
    const scheduledTimeValue =
        typeof scheduledTime === 'string' ? scheduledTime.trim() || null : null;

    try {
        const project = await env.DB.prepare(
            'SELECT id, status FROM projects WHERE id = ? LIMIT 1'
        )
            .bind(projectId)
            .first<{ id: number; status: string | null }>();

        if (!project) {
            return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const currentStatus = normalizeStoredStatus(project.status);
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Cannot reschedule a ${currentStatus} project`,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await env.DB.prepare(
            `UPDATE projects
             SET scheduled_date = ?, scheduled_time = ?
             WHERE id = ?`
        )
            .bind(scheduledDateValue, scheduledTimeValue, projectId)
            .run();

        return new Response(
            JSON.stringify({ success: true, message: 'Schedule updated' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin project patch error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to update schedule' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

// PUT — update project status (scheduled → in_progress → completed/cancelled)
export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    const projectId = parseProjectId(params.id);
    if (!projectId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid project ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        console.error('Admin project update body parse error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!body || typeof body !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { status, completionNotes, completionPhotos } = body as Record<string, unknown>;
    const nextStatus = normalizeStatusInput(status);
    if (!nextStatus) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid status value' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const notesResult = parseOptionalText(completionNotes, 'completionNotes');
    if (notesResult.error) {
        return new Response(JSON.stringify({ success: false, error: notesResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const photosResult = parsePhotoList(completionPhotos);
    if (photosResult.error) {
        return new Response(JSON.stringify({ success: false, error: photosResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const project = await env.DB.prepare(
            `
        SELECT
          p.id,
          p.customer_id,
          p.status,
          p.service_type,
          p.total_amount,
          p.deposit_amount,
          p.deposit_paid,
          p.completed_at,
          p.description as project_description,
          q.description as quote_description,
          c.name as customer_name,
          c.email as customer_email
        FROM projects p
        LEFT JOIN quotes q ON p.quote_id = q.id
        LEFT JOIN customers c ON p.customer_id = c.id
        WHERE p.id = ?
        LIMIT 1
      `
        )
            .bind(projectId)
            .first<ProjectRow>();

        if (!project) {
            return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const currentStatus = normalizeStoredStatus(project.status);
        if (!currentStatus) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid project status' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const transition = validateTransition(currentStatus, nextStatus);
        if (!transition.success) {
            return new Response(JSON.stringify({ success: false, error: transition.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Require deposit to be paid before marking a project complete
        if (nextStatus === 'completed' && !isDepositPaid(project.deposit_paid)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Cannot complete project: deposit has not been paid',
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const dbStatus = STATUS_DB_MAP[nextStatus];
        const updateResult = await env.DB.prepare(
            `
        UPDATE projects
        SET
          status = ?,
          completed_at = CASE
            WHEN ? = 'completed' THEN datetime('now')
            ELSE completed_at
          END
        WHERE id = ?
      `
        )
            .bind(dbStatus, dbStatus, projectId)
            .run();

        const updateChanges = updateResult.meta?.changes ?? 0;
        if (!updateResult.success || updateChanges === 0) {
            throw new Error('Failed to update project status');
        }

        const updated = await env.DB.prepare(
            `
        SELECT status, completed_at
        FROM projects
        WHERE id = ?
        LIMIT 1
      `
        )
            .bind(projectId)
            .first<{ status: string | null; completed_at: string | null }>();

        const completedAtRaw = formatIsoTimestamp(updated?.completed_at || project.completed_at);
        const completedAt =
            nextStatus === 'completed' && !completedAtRaw
                ? new Date().toISOString()
                : completedAtRaw;

        let balanceInvoice: {
            id: number;
            amount: number;
            dueDate: string | null;
            paymentUrl: string | null;
        } | null = null;
        let completionEmailSent = false;
        let feedbackEmailSent = false;

        if (nextStatus === 'completed') {
            const depositPaid = isDepositPaid(project.deposit_paid);
            const totalAmount = toNumber(project.total_amount);
            const depositAmount = toNumber(project.deposit_amount);
            const balanceAmount = depositPaid ? Math.max(0, totalAmount - depositAmount) : 0;

            let invoiceId: number | null = null;
            let invoiceAmount: number | null = null;
            let invoiceCreatedAt: string | null = null;
            let invoiceOpenBalance = false;

            if (depositPaid && Number.isFinite(balanceAmount) && balanceAmount > 0) {
                const existingInvoice = await env.DB.prepare(
                    `
            SELECT id, amount, status, created_at
            FROM invoices
            WHERE project_id = ?
              AND invoice_type = 'balance'
            ORDER BY created_at DESC
            LIMIT 1
          `
                )
                    .bind(projectId)
                    .first<InvoiceRow>();

                const existingStatus = normalizeInvoiceStatus(existingInvoice?.status || null);
                if (existingInvoice && existingStatus !== 'cancelled') {
                    invoiceId = existingInvoice.id;
                    invoiceAmount = toNumber(existingInvoice.amount);
                    invoiceCreatedAt = existingInvoice.created_at;
                    invoiceOpenBalance =
                        existingStatus === 'pending' ||
                        existingStatus === 'sent' ||
                        existingStatus === 'overdue';
                } else {
                    const invoiceResult = await env.DB.prepare(
                        `
              INSERT INTO invoices (
                project_id,
                customer_id,
                amount,
                invoice_type,
                status,
                created_at
              ) VALUES (?, ?, ?, 'balance', 'pending', datetime('now'))
            `
                    )
                        .bind(projectId, project.customer_id, balanceAmount)
                        .run();

                    if (!invoiceResult.success) {
                        throw new Error('Failed to create balance invoice');
                    }

                    invoiceId = Number(invoiceResult.meta.last_row_id);
                    invoiceAmount = balanceAmount;
                    invoiceCreatedAt = new Date().toISOString();
                    invoiceOpenBalance = true;
                }
            }

            if (
                invoiceOpenBalance &&
                invoiceId &&
                invoiceAmount !== null &&
                Number.isFinite(invoiceAmount) &&
                invoiceAmount > 0
            ) {
                const dueBase = parseDate(invoiceCreatedAt || new Date().toISOString()) ?? new Date();
                const dueDate = formatDateOnly(addDays(dueBase, COMPLETION_DUE_DAYS));
                balanceInvoice = {
                    id: invoiceId,
                    amount: Number(invoiceAmount.toFixed(2)),
                    dueDate,
                    paymentUrl: buildPaymentPath(invoiceId),
                };
            }

            const customerEmail = normalizeEmail(project.customer_email);
            const customerName = normalizeName(project.customer_name);
            const serviceTypeLabel = getServiceTypeLabel(project.service_type);
            const summary = project.project_description || project.quote_description || null;

            if (customerEmail) {
                const completionEmailHtml = getProjectCompletionEmail({
                    name: customerName,
                    serviceType: serviceTypeLabel,
                    summary: summary || undefined,
                    completionNotes: notesResult.value || undefined,
                    completionPhotos: photosResult.value,
                    balanceAmount: balanceInvoice?.amount ?? null,
                    paymentUrl: balanceInvoice?.paymentUrl
                        ? `${SITE_BASE_URL}${balanceInvoice.paymentUrl}`
                        : null,
                    dueDate: balanceInvoice?.dueDate ?? null,
                    feedbackUrl: FEEDBACK_FORM_URL,
                    reviewUrl: GOOGLE_REVIEW_URL,
                });

                const completionResult = await sendEmail(env, {
                    to: customerEmail,
                    subject: 'Project Completed - Evergrow Landscaping',
                    html: completionEmailHtml,
                });

                if (!completionResult.success) {
                    console.error('Project completion email failed:', completionResult.error);
                } else {
                    completionEmailSent = true;
                }
            }

            const priorCompleted = await env.DB.prepare(
                `
          SELECT COUNT(*) as total
          FROM projects
          WHERE customer_id = ?
            AND status = 'completed'
            AND id != ?
        `
            )
                .bind(project.customer_id, projectId)
                .first<{ total: number }>();

            const isFirstTimeCustomer = Number(priorCompleted?.total || 0) === 0;
            if (isFirstTimeCustomer && customerEmail) {
                const feedbackEmailHtml = getProjectFeedbackRequestEmail({
                    name: customerName,
                    serviceType: serviceTypeLabel,
                    feedbackUrl: FEEDBACK_FORM_URL,
                    reviewUrl: GOOGLE_REVIEW_URL,
                });

                const feedbackResult = await sendEmail(env, {
                    to: customerEmail,
                    subject: 'How did we do? - Evergrow Landscaping',
                    html: feedbackEmailHtml,
                });

                if (!feedbackResult.success) {
                    console.error('Project feedback request email failed:', feedbackResult.error);
                } else {
                    feedbackEmailSent = true;
                }
            }
        }

        if (nextStatus === 'cancelled') {
            const cancelResult = await env.DB.prepare(
                `
          UPDATE invoices
          SET status = 'cancelled'
          WHERE project_id = ?
            AND status IN ('pending', 'sent', 'overdue')
        `
            )
                .bind(projectId)
                .run();

            if (!cancelResult.success) {
                console.error('Project cancellation invoice update failed:', cancelResult);
            }

            console.info('Project cancelled', {
                projectId,
                reason: notesResult.value ?? null,
            });

            const customerEmail = normalizeEmail(project.customer_email);
            if (customerEmail) {
                const cancellationHtml = getProjectCancellationEmail({
                    name: normalizeName(project.customer_name),
                    serviceType: getServiceTypeLabel(project.service_type),
                    reason: notesResult.value || undefined,
                });

                const cancelEmailResult = await sendEmail(env, {
                    to: customerEmail,
                    subject: 'Project Update - Evergrow Landscaping',
                    html: cancellationHtml,
                });

                if (!cancelEmailResult.success) {
                    console.error('Project cancellation email failed:', cancelEmailResult.error);
                }
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: getStatusMessage(nextStatus),
                project: {
                    id: projectId,
                    status: nextStatus,
                    completedAt,
                },
                balanceInvoice,
                emailsSent: {
                    completion: completionEmailSent,
                    feedback: feedbackEmailSent,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin project status update error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to update project status' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
