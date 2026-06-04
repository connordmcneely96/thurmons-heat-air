import { getProjectScheduledEmail, sendEmail } from '../../../lib/email';
import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

type CreateProjectBody = {
    quoteId?: number;
    scheduledDate?: string;
    scheduledTime?: string;
    depositRequired?: boolean;
    notes?: string;
};

type QuoteRow = {
    id: number;
    customer_id: number | null;
    service_type: string;
    quoted_amount: number | null;
    status: string;
    description: string | null;
    photo_urls: string | null;
    contact_name: string | null;
    contact_email: string | null;
    customer_name: string | null;
    customer_email: string | null;
};

type ExistingProjectRow = {
    id: number;
};

type ProjectRow = {
    id: number;
    customer_id: number | null;
    quote_id: number | null;
    customer_name: string | null;
    customer_email: string | null;
    service_type: string;
    total_amount: number;
    deposit_amount: number | null;
    deposit_paid: number | boolean;
    balance_paid: number | boolean;
    scheduled_date: string | null;
    scheduled_time: string | null;
    status: string;
    completed_at: string | null;
    created_at: string;
    quote_description: string | null;
    project_description?: string | null;
};

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

const DEPOSIT_REQUIRED_SERVICES = new Set(['flower_beds', 'pressure_washing']);
const NO_DEPOSIT_SERVICES = new Set(['lawn_care', 'seasonal_cleanup', 'other']);
const PAYMENT_PORTAL_BASE_URL = 'https://evergrowlandscaping.com';
const REMINDER_KEY_PREFIX = 'project_reminder:';
const DEPOSIT_DUE_DAYS_BEFORE = 4;

function parseQuoteId(value: unknown): number | null {
    if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
        return null;
    }
    return value;
}

function parseScheduledDate(value: unknown): { isoDate: string } | { error: string } {
    if (typeof value !== 'string') {
        return { error: 'Scheduled date is required' };
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return { error: 'Scheduled date is required' };
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        return { error: 'Invalid scheduled date format' };
    }
    return { isoDate: parsed.toISOString().slice(0, 10) };
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

function parseDepositRequired(value: unknown): { value: boolean | null; error?: string } {
    if (value === undefined || value === null) {
        return { value: null };
    }
    if (typeof value !== 'boolean') {
        return { value: null, error: 'depositRequired must be a boolean' };
    }
    return { value };
}

function isFutureDate(isoDate: string): boolean {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const scheduled = new Date(`${isoDate}T00:00:00Z`);
    return scheduled.getTime() > today.getTime();
}

function normalizeServiceType(value: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.toLowerCase().replace(/-/g, '_');
}

function normalizeStatus(status: string | null): string | null {
    if (!status) return null;
    return status.trim().toLowerCase().replace(/-/g, '_');
}

function toNumber(value: unknown): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function parsePositiveInt(value: string | undefined | null, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
}

function resolveDepositRequirement(
    serviceType: string,
    depositRequiredInput: boolean | null,
    totalAmount: number
): { depositRequired: boolean; depositAmount: number | null; error?: string } {
    if (DEPOSIT_REQUIRED_SERVICES.has(serviceType)) {
        if (depositRequiredInput !== true) {
            return {
                depositRequired: true,
                depositAmount: null,
                error: 'Deposit is required for this service type',
            };
        }
        return {
            depositRequired: true,
            depositAmount: roundCurrency(totalAmount * 0.5),
        };
    }

    if (NO_DEPOSIT_SERVICES.has(serviceType)) {
        if (depositRequiredInput === true) {
            return {
                depositRequired: false,
                depositAmount: null,
                error: 'Deposit is not required for this service type',
            };
        }
        return { depositRequired: false, depositAmount: null };
    }

    if (depositRequiredInput === true) {
        return {
            depositRequired: false,
            depositAmount: null,
            error: 'Deposit configuration not supported for this service type',
        };
    }

    return { depositRequired: false, depositAmount: null };
}

function normalizeEmail(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function normalizeName(value?: string | null): string {
    if (!value) {
        return 'Customer';
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : 'Customer';
}

function formatTitle(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function calculateDepositDueDate(scheduledDate: string): string {
    const scheduled = new Date(`${scheduledDate}T00:00:00Z`);
    const due = new Date(scheduled.getTime());
    due.setUTCDate(due.getUTCDate() - DEPOSIT_DUE_DAYS_BEFORE);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dueDate = due < today ? today : due;
    return dueDate.toISOString().slice(0, 10);
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

async function queueProjectReminder(
    env: Env,
    data: {
        projectId: number;
        customerId: number;
        customerEmail: string | null;
        customerName: string;
        scheduledDate: string;
        scheduledTime: string | null;
        serviceType: string;
    }
): Promise<void> {
    const scheduledDate = new Date(`${data.scheduledDate}T00:00:00Z`);
    if (Number.isNaN(scheduledDate.getTime())) {
        return;
    }
    const reminderDate = new Date(scheduledDate.getTime());
    reminderDate.setUTCDate(reminderDate.getUTCDate() - 1);

    const ttlSeconds = Math.max(
        86400,
        Math.ceil((scheduledDate.getTime() - Date.now()) / 1000) + 86400
    );

    const payload = {
        type: 'project_reminder',
        sendAt: reminderDate.toISOString(),
        projectId: data.projectId,
        customerId: data.customerId,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        scheduledDate: data.scheduledDate,
        scheduledTime: data.scheduledTime,
        serviceType: data.serviceType,
    };

    try {
        await env.CACHE.put(`${REMINDER_KEY_PREFIX}${data.projectId}`, JSON.stringify(payload), {
            expirationTtl: ttlSeconds,
        });
    } catch (error) {
        console.error('Project reminder queue failed:', error);
    }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    try {
        const url = new URL(request.url);
        const statusQuery = url.searchParams.get('status');
        const limitQuery = url.searchParams.get('limit');
        const pageQuery = url.searchParams.get('page');
        const quoteIdQuery = url.searchParams.get('quoteId');

        const limit = parsePositiveInt(limitQuery, 20);
        const page = parsePositiveInt(pageQuery, 1);
        const offset = (page - 1) * limit;

        const normalizedStatus = normalizeStatus(statusQuery ?? null);
        if (normalizedStatus && !STATUS_FILTERS[normalizedStatus]) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid status filter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const statusFilter = normalizedStatus ? STATUS_FILTERS[normalizedStatus] : null;
        const quoteIdFilter = quoteIdQuery ? parsePositiveInt(quoteIdQuery, 0) || null : null;

        const countResult = await env.DB.prepare(
            `
        SELECT COUNT(*) as total
        FROM projects p
        WHERE (? IS NULL OR p.status = ?)
          AND (? IS NULL OR p.quote_id = ?)
      `
        )
            .bind(statusFilter, statusFilter, quoteIdFilter, quoteIdFilter)
            .first<{ total: number }>();

        const totalProjects = Math.max(0, toNumber(countResult?.total));
        const totalPages = totalProjects === 0 ? 0 : Math.ceil(totalProjects / limit);
        const hasMore = page < totalPages;

        const projectResults = await env.DB.prepare(
            `
        SELECT
          p.id,
          p.customer_id,
          p.quote_id,
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
          p.scheduled_time,
          p.status,
          p.completed_at,
          p.created_at,
          q.quoted_amount,
          q.description as quote_description,
          c.name as customer_name,
          c.email as customer_email
        FROM projects p
        LEFT JOIN quotes q ON p.quote_id = q.id
        LEFT JOIN customers c ON p.customer_id = c.id
        WHERE (? IS NULL OR p.status = ?)
          AND (? IS NULL OR p.quote_id = ?)
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
            .bind(statusFilter, statusFilter, quoteIdFilter, quoteIdFilter, limit, offset)
            .all<ProjectRow>();

        const projects = (projectResults.results ?? []).map((row) => {
            const normalizedServiceType = normalizeServiceType(row.service_type);
            const serviceName = normalizedServiceType
                ? SERVICE_NAME_DISPLAY[normalizedServiceType] || formatTitle(normalizedServiceType)
                : 'Service';
            const normalizedRowStatus = normalizeStatus(row.status) ?? row.status;
            const statusDisplay =
                STATUS_LABELS[normalizedRowStatus] || formatTitle(normalizedRowStatus);
            const totalAmount = toNumber(row.total_amount);
            const depositAmount = toNumber(row.deposit_amount);
            const depositPaid = row.deposit_paid === 1 || row.deposit_paid === true;
            const balancePaid = row.balance_paid === 1 || row.balance_paid === true;
            const balanceDue = getBalanceDue(totalAmount, depositAmount, depositPaid, balancePaid);

            return {
                id: row.id,
                customerId: row.customer_id,
                quoteId: row.quote_id,
                customerName: row.customer_name,
                customerEmail: row.customer_email,
                serviceType: normalizedServiceType ?? row.service_type,
                serviceName,
                totalAmount,
                depositAmount,
                depositPaid,
                balancePaid,
                balanceDue,
                scheduledDate: row.scheduled_date,
                scheduledTime: row.scheduled_time,
                status: normalizedRowStatus,
                statusDisplay,
                completedAt: row.completed_at,
                createdAt: row.created_at,
                description: row.quote_description ?? row.project_description ?? null,
            };
        });

        return new Response(
            JSON.stringify({
                success: true,
                projects,
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
        console.error('Admin projects listing error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch projects' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    let body: CreateProjectBody;
    try {
        body = await request.json<CreateProjectBody>();
    } catch (error) {
        console.error('Admin project body parse error:', error);
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

    const quoteId = parseQuoteId(body.quoteId);
    if (!quoteId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid quote ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const scheduledDateResult = parseScheduledDate(body.scheduledDate);
    if ('error' in scheduledDateResult) {
        return new Response(
            JSON.stringify({ success: false, error: scheduledDateResult.error }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const scheduledTimeResult = parseOptionalText(body.scheduledTime, 'scheduledTime');
    if (scheduledTimeResult.error) {
        return new Response(
            JSON.stringify({ success: false, error: scheduledTimeResult.error }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const notesResult = parseOptionalText(body.notes, 'notes');
    if (notesResult.error) {
        return new Response(JSON.stringify({ success: false, error: notesResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const depositRequiredResult = parseDepositRequired(body.depositRequired);
    if (depositRequiredResult.error) {
        return new Response(
            JSON.stringify({ success: false, error: depositRequiredResult.error }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const scheduledDate = scheduledDateResult.isoDate;
    if (!isFutureDate(scheduledDate)) {
        return new Response(
            JSON.stringify({ success: false, error: 'Scheduled date must be in the future' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const quote = await env.DB.prepare(
            `
          SELECT
            q.id,
            q.customer_id,
            q.service_type,
            q.quoted_amount,
            q.status,
            q.description,
            q.photo_urls,
            q.contact_name,
            q.contact_email,
            c.name as customer_name,
            c.email as customer_email
          FROM quotes q
          LEFT JOIN customers c ON q.customer_id = c.id
          WHERE q.id = ?
          LIMIT 1
        `
        )
            .bind(quoteId)
            .first<QuoteRow>();

        if (!quote) {
            return new Response(JSON.stringify({ success: false, error: 'Quote not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (quote.status !== 'accepted') {
            return new Response(JSON.stringify({ success: false, error: 'Quote not accepted' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!quote.customer_id) {
            return new Response(
                JSON.stringify({ success: false, error: 'Quote is missing a customer' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const existingProject = await env.DB.prepare(
            `
          SELECT id
          FROM projects
          WHERE quote_id = ?
          LIMIT 1
        `
        )
            .bind(quoteId)
            .first<ExistingProjectRow>();

        if (existingProject) {
            return new Response(
                JSON.stringify({ success: false, error: 'Project already exists for this quote' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const totalAmount = toNumber(quote.quoted_amount);
        if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
            return new Response(
                JSON.stringify({ success: false, error: 'Quote amount is missing or invalid' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const normalizedServiceType =
            normalizeServiceType(quote.service_type) ?? quote.service_type;
        const depositValidation = resolveDepositRequirement(
            normalizedServiceType,
            depositRequiredResult.value,
            totalAmount
        );

        if (depositValidation.error) {
            return new Response(
                JSON.stringify({ success: false, error: depositValidation.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const projectDescription = notesResult.value ?? null;
        const projectInsert = await env.DB.prepare(
            `
          INSERT INTO projects (
            customer_id,
            quote_id,
            service_type,
            description,
            total_amount,
            deposit_amount,
            deposit_paid,
            scheduled_date,
            scheduled_time,
            status,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 'scheduled', datetime('now'))
        `
        )
            .bind(
                quote.customer_id,
                quoteId,
                normalizedServiceType,
                projectDescription,
                roundCurrency(totalAmount),
                depositValidation.depositAmount,
                scheduledDate,
                scheduledTimeResult.value
            )
            .run();

        if (!projectInsert.success) {
            console.error('Admin project creation failed:', projectInsert);
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to create project' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const projectId = Number(projectInsert.meta.last_row_id);

        // Copy quote photos to project_photos table as 'before' phase
        if (quote.photo_urls) {
            try {
                const photoUrls: string[] = JSON.parse(quote.photo_urls as string);
                for (const url of photoUrls) {
                    if (url && typeof url === 'string') {
                        await env.DB.prepare(
                            `INSERT INTO project_photos (project_id, photo_url, uploader_type, uploader_id, caption, phase)
                             VALUES (?, ?, 'customer', ?, 'Submitted with quote request', 'before')`
                        ).bind(projectId, url, quote.customer_id).run();
                    }
                }
            } catch (photoErr) {
                console.error('Failed to copy quote photos to project:', photoErr);
                // Non-fatal - continue with project creation
            }
        }

        let depositInvoice: {
            id: number;
            amount: number;
            dueDate: string;
            paymentUrl: string;
        } | null = null;
        if (depositValidation.depositAmount !== null) {
            const depositDueDate = calculateDepositDueDate(scheduledDate);
            const invoiceResult = await env.DB.prepare(
                `
            INSERT INTO invoices (
              project_id,
              customer_id,
              amount,
              invoice_type,
              status,
              due_date,
              created_at
            ) VALUES (?, ?, ?, 'deposit', 'pending', ?, datetime('now'))
          `
            )
                .bind(
                    projectId,
                    quote.customer_id,
                    depositValidation.depositAmount,
                    depositDueDate
                )
                .run();

            if (!invoiceResult.success) {
                console.error('Admin deposit invoice creation failed:', invoiceResult);
                return new Response(
                    JSON.stringify({ success: false, error: 'Failed to create deposit invoice' }),
                    { status: 500, headers: { 'Content-Type': 'application/json' } }
                );
            }

            const invoiceId = Number(invoiceResult.meta.last_row_id);
            depositInvoice = {
                id: invoiceId,
                amount: Number(depositValidation.depositAmount.toFixed(2)),
                dueDate: depositDueDate,
                paymentUrl: `/portal/invoices/pay?id=${invoiceId}`,
            };
        }

        const customerEmail = normalizeEmail(quote.contact_email || quote.customer_email);
        const customerName = normalizeName(quote.contact_name || quote.customer_name);
        const serviceName =
            SERVICE_NAME_DISPLAY[normalizedServiceType] || formatTitle(normalizedServiceType);

        if (customerEmail) {
            const paymentLink = depositInvoice
                ? `${PAYMENT_PORTAL_BASE_URL}${depositInvoice.paymentUrl}`
                : undefined;
            const emailHtml = getProjectScheduledEmail({
                name: customerName,
                serviceType: serviceName,
                scheduledDate,
                scheduledTime: scheduledTimeResult.value ?? undefined,
                serviceDetails: quote.description ?? undefined,
                depositAmount: depositValidation.depositAmount ?? undefined,
                depositDueDate: depositInvoice?.dueDate,
                paymentLink,
            });

            const emailResult = await sendEmail(env, {
                to: customerEmail,
                subject: 'Project Scheduled - Evergrow Landscaping',
                html: emailHtml,
            });

            if (!emailResult.success) {
                console.error('Project scheduled email failed:', emailResult.error);
            }
        }

        await queueProjectReminder(env, {
            projectId,
            customerId: quote.customer_id,
            customerEmail,
            customerName,
            scheduledDate,
            scheduledTime: scheduledTimeResult.value,
            serviceType: serviceName,
        });

        const response: Record<string, unknown> = {
            success: true,
            message: 'Project created and scheduled',
            project: {
                id: projectId,
                quoteId,
                customerId: quote.customer_id,
                serviceType: normalizedServiceType,
                totalAmount: Number(roundCurrency(totalAmount).toFixed(2)),
                depositAmount:
                    depositValidation.depositAmount !== null
                        ? Number(depositValidation.depositAmount.toFixed(2))
                        : null,
                depositRequired: depositValidation.depositRequired,
                scheduledDate,
                status: 'scheduled',
            },
        };

        if (depositInvoice) {
            response.depositInvoice = depositInvoice;
        }

        return new Response(JSON.stringify(response), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin project creation error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to create project' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
