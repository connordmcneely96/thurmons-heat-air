import { requireAuth } from '../../lib/session';
import { Env } from '../../types';

type InvoiceStatusFilter = 'pending' | 'paid' | 'cancelled';

type InvoiceRow = {
    id: number;
    project_id: number;
    amount: number;
    invoice_type: string;
    status: string;
    paid_at: string | null;
    created_at: string;
    service_type: string | null;
    scheduled_date: string | null;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DUE_DATE_GRACE_DAYS = 4;

const STATUS_DISPLAY: Record<string, string> = {
    pending: 'Pending Payment',
    paid: 'Paid',
    cancelled: 'Cancelled',
    sent: 'Pending Payment',
    overdue: 'Overdue',
    refunded: 'Refunded',
};

const INVOICE_TYPE_DISPLAY: Record<string, string> = {
    deposit: 'Deposit (50%)',
    balance: 'Balance Due',
    full: 'Full Payment',
    additional: 'Additional Charge',
};

const SERVICE_NAME_DISPLAY: Record<string, string> = {
    ac_repair: 'AC Repair & Service',
    'ac-repair': 'AC Repair & Service',
    heating: 'Heating & Furnace',
    installation: 'New System Installation',
    maintenance: 'Maintenance & Tune-Up',
    ductwork: 'Ductwork',
    ventilation: 'Ventilation',
    multiple: 'Multiple Services',
    other: 'Other',
};

function clampNumber(value: number, fallback: number, min: number, max?: number): number {
    if (Number.isNaN(value)) {
        return fallback;
    }
    if (max !== undefined) {
        return Math.min(Math.max(value, min), max);
    }
    return Math.max(value, min);
}

function parseDate(value?: string | null): Date | null {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed;
}

function formatDate(value?: string | Date | null): string | null {
    if (!value) {
        return null;
    }
    const date = value instanceof Date ? value : parseDate(value);
    if (!date) {
        return null;
    }
    return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
}

function calculateDueDate(
    invoiceType: string,
    createdAt: string,
    scheduledDate?: string | null
): string | null {
    const createdDate = parseDate(createdAt);
    if (!createdDate) {
        return null;
    }
    const baseDue = addDays(createdDate, DUE_DATE_GRACE_DAYS);
    const scheduled = parseDate(scheduledDate);

    if (invoiceType === 'deposit') {
        const dueDate = scheduled && scheduled < baseDue ? scheduled : baseDue;
        return formatDate(dueDate);
    }

    if (invoiceType === 'balance' && scheduled) {
        return formatDate(scheduled);
    }

    return formatDate(baseDue);
}

function toTitleCase(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) {
            return authResult;
        }

        // Any authenticated account may view its OWN invoices. The query below is
        // scoped to this account's customer id / email, so admins only ever see
        // their own invoices — never another customer's.
        if (authResult.role !== 'customer' && authResult.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const customerId = authResult.userId;
        const sessionEmail = normalizeEmail(authResult.email);
        const url = new URL(request.url);
        const statusParam = url.searchParams.get('status');
        const limitParam = url.searchParams.get('limit');
        const pageParam = url.searchParams.get('page');

        let statusFilter: InvoiceStatusFilter | null = null;
        if (statusParam) {
            if (statusParam === 'pending' || statusParam === 'paid' || statusParam === 'cancelled') {
                statusFilter = statusParam;
            } else {
                return new Response(JSON.stringify({ success: false, error: 'Invalid status filter' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        const limit = clampNumber(Number.parseInt(limitParam || '', 10), DEFAULT_LIMIT, 1, MAX_LIMIT);
        const page = clampNumber(Number.parseInt(pageParam || '', 10), 1, 1);
        const offset = (page - 1) * limit;

        const listQuery = `
      SELECT 
        i.id,
        i.project_id,
        i.amount,
        i.invoice_type,
        i.status,
        i.paid_at,
        i.created_at,
        p.service_type,
        p.scheduled_date
      FROM invoices i
      JOIN projects p ON i.project_id = p.id
      WHERE (
            i.customer_id = ?
            OR EXISTS (
                SELECT 1 FROM customers c2
                WHERE c2.id = i.customer_id
                  AND LOWER(c2.email) = ?
            )
        )
        AND (? IS NULL OR i.status = ?)
      ORDER BY 
        CASE i.status
          WHEN 'pending' THEN 1
          WHEN 'paid' THEN 2
          WHEN 'cancelled' THEN 3
        END,
        i.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const invoiceResults = await env.DB.prepare(listQuery)
            .bind(customerId, sessionEmail, statusFilter, statusFilter, limit, offset)
            .all<InvoiceRow>();

        const rows = invoiceResults.results || [];

        const countResult = await env.DB.prepare(
            `
      SELECT COUNT(*) as total
      FROM invoices i
      WHERE (
            i.customer_id = ?
            OR EXISTS (
                SELECT 1 FROM customers c2
                WHERE c2.id = i.customer_id
                  AND LOWER(c2.email) = ?
            )
        )
        AND (? IS NULL OR i.status = ?)
    `
        )
            .bind(customerId, sessionEmail, statusFilter, statusFilter)
            .first<{ total: number }>();

        const summaryResult = await env.DB.prepare(
            `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as totalPending,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as totalPaid
      FROM invoices
      WHERE (
            customer_id = ?
            OR EXISTS (
                SELECT 1 FROM customers c2
                WHERE c2.id = invoices.customer_id
                  AND LOWER(c2.email) = ?
            )
        )
    `
        )
            .bind(customerId, sessionEmail)
            .first<{ totalPending: number; totalPaid: number }>();

        const invoices = rows.map((row) => {
            const invoiceType = row.invoice_type;
            const status = row.status;
            const createdAtFormatted = formatDate(row.created_at) || row.created_at;
            const scheduledDateFormatted = formatDate(row.scheduled_date) || row.scheduled_date;
            const dueDate = calculateDueDate(invoiceType, row.created_at, row.scheduled_date);
            const serviceType = row.service_type || null;
            const canPay = status === 'pending';

            const invoice: Record<string, unknown> = {
                id: row.id,
                projectId: row.project_id,
                project_id: row.project_id,
                amount: Number(row.amount),
                invoiceType,
                invoice_type: invoiceType,
                invoiceTypeDisplay: INVOICE_TYPE_DISPLAY[invoiceType] || toTitleCase(invoiceType),
                status,
                statusDisplay: STATUS_DISPLAY[status] || toTitleCase(status),
                paidAt: row.paid_at || null,
                paid_at: row.paid_at || null,
                createdAt: createdAtFormatted,
                created_at: createdAtFormatted,
                dueDate,
                due_date: dueDate,
                serviceType,
                service_type: serviceType,
                serviceName: serviceType
                    ? SERVICE_NAME_DISPLAY[serviceType] || toTitleCase(serviceType)
                    : null,
                scheduledDate: scheduledDateFormatted,
                scheduled_date: scheduledDateFormatted,
                canPay,
            };

            if (canPay) {
                invoice.paymentUrl = `/portal/invoices/pay?id=${row.id}`;
            } else if (status === 'paid') {
                invoice.receiptUrl = `/portal/invoices/${row.id}/receipt`;
            }

            return invoice;
        });

        const totalInvoices = Number(countResult?.total || 0);
        const totalPages = Math.max(1, Math.ceil(totalInvoices / limit));

        return new Response(
            JSON.stringify({
                success: true,
                invoices,
                data: invoices,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalInvoices,
                    hasMore: page < totalPages,
                },
                summary: {
                    totalPending: Number(summaryResult?.totalPending || 0),
                    totalPaid: Number(summaryResult?.totalPaid || 0),
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Customer invoices list error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch invoices' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
