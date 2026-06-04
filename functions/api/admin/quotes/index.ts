import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

type QuoteStatusFilter = 'pending' | 'quoted' | 'accepted' | 'declined';

interface QuoteRow {
    id: number;
    customer_id: number | null;
    service_type: string;
    property_size: string | null;
    description: string | null;
    photo_urls: string | null;
    quoted_amount: number | null;
    status: string;
    created_at: string;
    accepted_at: string | null;
    customer_name: string | null;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    customer_city: string | null;
    customer_state: string | null;
    customer_zip: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_address: string | null;
    contact_city: string | null;
    contact_zip: string | null;
    project_deposit_paid: number | null;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const SERVICE_NAME_DISPLAY: Record<string, string> = {
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

const STATUS_DISPLAY: Record<string, string> = {
    pending: 'Awaiting Quote',
    quoted: 'Quote Sent',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    converted: 'Converted to Project',
};

function normalizeStatusFilter(value?: string | null): QuoteStatusFilter | null {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    if (
        normalized === 'pending' ||
        normalized === 'quoted' ||
        normalized === 'accepted' ||
        normalized === 'declined'
    ) {
        return normalized as QuoteStatusFilter;
    }
    return null;
}

function normalizeServiceTypeFilter(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.toLowerCase().replace(/_/g, '-');
}

function normalizeServiceType(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.toLowerCase().replace(/-/g, '_');
}

function parseDateParam(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
        return null;
    }
    return parsed.toISOString().slice(0, 10);
}

function buildSearchFilter(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return `%${trimmed}%`;
}

function parsePositiveInt(
    value: string | undefined | null,
    fallback: number,
    max?: number
): number {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    if (max !== undefined) {
        return Math.min(parsed, max);
    }
    return parsed;
}

function calculateDaysWaiting(createdAt: string, now: Date): number {
    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) {
        return 0;
    }
    const diff = now.getTime() - created.getTime();
    if (diff <= 0) {
        return 0;
    }
    return Math.floor(diff / MS_PER_DAY);
}

function formatAddress(
    address?: string | null,
    city?: string | null,
    state?: string | null,
    zip?: string | null
): string | null {
    const addressValue = address?.trim();
    const cityValue = city?.trim();
    const stateValue = state?.trim();
    const zipValue = zip?.trim();

    const segments: string[] = [];
    if (addressValue) {
        segments.push(addressValue);
    }

    const localityParts = [cityValue, stateValue].filter(Boolean);
    if (localityParts.length > 0) {
        segments.push(localityParts.join(', '));
    }

    let combined = segments.join(', ');
    if (zipValue) {
        combined = combined ? `${combined} ${zipValue}` : zipValue;
    }

    return combined || null;
}

function buildPhotoUrl(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    // Already a proper relative path to the asset proxy
    if (trimmed.startsWith('/api/assets/')) {
        return trimmed;
    }
    // Legacy format: bare R2 key, possibly with assets/ prefix
    const withoutLeadingSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
    const normalized = withoutLeadingSlash.replace(/^assets\//i, '');
    return `/api/assets/${normalized}`;
}

function parsePhotoUrls(value: string | null): string[] {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => (typeof item === 'string' ? buildPhotoUrl(item) : null))
                .filter((item): item is string => Boolean(item));
        }
        if (typeof parsed === 'string') {
            const url = buildPhotoUrl(parsed);
            return url ? [url] : [];
        }
    } catch (error) {
        const url = buildPhotoUrl(value);
        return url ? [url] : [];
    }

    return [];
}

function formatTitle(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    try {
        const url = new URL(request.url);
        const statusParam = url.searchParams.get('status');
        const serviceTypeParam = url.searchParams.get('serviceType');
        const dateFromParam = url.searchParams.get('dateFrom');
        const dateToParam = url.searchParams.get('dateTo');
        const searchParam = url.searchParams.get('search');
        const pageParam = url.searchParams.get('page');
        const limitParam = url.searchParams.get('limit');

        const statusFilter = normalizeStatusFilter(statusParam);
        if (statusParam && !statusFilter) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid status filter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const serviceTypeFilter = normalizeServiceTypeFilter(serviceTypeParam);

        const dateFrom = parseDateParam(dateFromParam);
        if (dateFromParam && !dateFrom) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid dateFrom format' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const dateTo = parseDateParam(dateToParam);
        if (dateToParam && !dateTo) {
            return new Response(
                JSON.stringify({ success: false, error: 'Invalid dateTo format' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const searchFilter = buildSearchFilter(searchParam);
        const limit = parsePositiveInt(limitParam, DEFAULT_LIMIT, MAX_LIMIT);
        const page = parsePositiveInt(pageParam, 1);
        const offset = (page - 1) * limit;

        const filterParams = [
            statusFilter,
            statusFilter,
            serviceTypeFilter,
            serviceTypeFilter,
            dateFrom,
            dateFrom,
            dateTo,
            dateTo,
            searchFilter,
            searchFilter,
            searchFilter,
            searchFilter,
        ];

        const quotesQuery = `
      SELECT
        q.id,
        q.customer_id,
        q.service_type,
        q.property_size,
        q.description,
        q.photo_urls,
        q.quoted_amount,
        q.status,
        q.created_at,
        q.accepted_at,
        COALESCE(c.name, q.contact_name) as customer_name,
        COALESCE(c.email, q.contact_email) as customer_email,
        COALESCE(c.phone, q.contact_phone) as customer_phone,
        COALESCE(c.address, q.contact_address) as customer_address,
        COALESCE(c.city, q.contact_city) as customer_city,
        c.state as customer_state,
        COALESCE(c.zip_code, q.contact_zip) as customer_zip,
        p.deposit_paid as project_deposit_paid
      FROM quotes q
      LEFT JOIN customers c ON q.customer_id = c.id
      LEFT JOIN projects p ON p.quote_id = q.id
      WHERE (? IS NULL OR q.status = ?)
        AND (? IS NULL OR q.service_type = ?)
        AND (? IS NULL OR DATE(q.created_at) >= ?)
        AND (? IS NULL OR DATE(q.created_at) <= ?)
        AND (
          ? IS NULL OR 
          COALESCE(c.name, q.contact_name) LIKE ? OR 
          COALESCE(c.email, q.contact_email) LIKE ? OR 
          COALESCE(c.phone, q.contact_phone) LIKE ?
        )
      ORDER BY 
        CASE q.status
          WHEN 'pending' THEN 1
          WHEN 'quoted' THEN 2
          WHEN 'accepted' THEN 3
          WHEN 'declined' THEN 4
          ELSE 5
        END,
        q.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const quotesResult = await env.DB.prepare(quotesQuery)
            .bind(...filterParams, limit, offset)
            .all<QuoteRow>();

        const countResult = await env.DB.prepare(
            `
        SELECT COUNT(*) as total
        FROM quotes q
        LEFT JOIN customers c ON q.customer_id = c.id
        WHERE (? IS NULL OR q.status = ?)
          AND (? IS NULL OR q.service_type = ?)
          AND (? IS NULL OR DATE(q.created_at) >= ?)
          AND (? IS NULL OR DATE(q.created_at) <= ?)
          AND (
            ? IS NULL OR 
            COALESCE(c.name, q.contact_name) LIKE ? OR 
            COALESCE(c.email, q.contact_email) LIKE ? OR 
            COALESCE(c.phone, q.contact_phone) LIKE ?
          )
      `
        )
            .bind(...filterParams)
            .first<{ total: number }>();

        const summaryParams = [
            serviceTypeFilter,
            serviceTypeFilter,
            dateFrom,
            dateFrom,
            dateTo,
            dateTo,
            searchFilter,
            searchFilter,
            searchFilter,
            searchFilter,
        ];

        const summaryResult = await env.DB.prepare(
            `
        SELECT
          SUM(CASE WHEN q.status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN q.status = 'quoted' THEN 1 ELSE 0 END) as quoted,
          SUM(CASE WHEN q.status = 'accepted' THEN 1 ELSE 0 END) as accepted,
          SUM(CASE WHEN q.status = 'declined' THEN 1 ELSE 0 END) as declined
        FROM quotes q
        LEFT JOIN customers c ON q.customer_id = c.id
        WHERE (? IS NULL OR q.service_type = ?)
          AND (? IS NULL OR DATE(q.created_at) >= ?)
          AND (? IS NULL OR DATE(q.created_at) <= ?)
          AND (
            ? IS NULL OR 
            COALESCE(c.name, q.contact_name) LIKE ? OR 
            COALESCE(c.email, q.contact_email) LIKE ? OR 
            COALESCE(c.phone, q.contact_phone) LIKE ?
          )
      `
        )
            .bind(...summaryParams)
            .first<{ pending: number; quoted: number; accepted: number; declined: number }>();

        const now = new Date();
        const quotes = (quotesResult.results || []).map((row) => {
            const normalizedServiceType = normalizeServiceType(row.service_type);
            const serviceName =
                SERVICE_NAME_DISPLAY[normalizedServiceType ?? row.service_type] ||
                formatTitle(normalizedServiceType ?? row.service_type);
            const statusDisplay = STATUS_DISPLAY[row.status] || formatTitle(row.status);
            const createdAt = row.created_at;
            const daysWaiting = calculateDaysWaiting(createdAt, now);
            const needsResponse = row.status === 'pending' && daysWaiting > 1;
            const customerAddress = formatAddress(
                row.customer_address,
                row.customer_city,
                row.customer_state,
                row.customer_zip
            );

            // Compute deposit status for the quote
            const depositStatus = (() => {
                const s = row.status;
                if (s !== 'accepted' && s !== 'converted') return 'na';
                if (row.project_deposit_paid === 1) return 'paid';
                if (row.project_deposit_paid === 0) return 'pending';
                return 'na';
            })();

            return {
                id: row.id,
                customerId: row.customer_id,
                customerName: row.customer_name,
                customerEmail: row.customer_email,
                customerPhone: row.customer_phone,
                customerAddress,
                serviceType: normalizedServiceType ?? row.service_type,
                serviceName,
                propertySize: row.property_size,
                description: row.description,
                photoUrls: parsePhotoUrls(row.photo_urls),
                quotedAmount: row.quoted_amount !== null ? Number(row.quoted_amount) : null,
                status: row.status,
                statusDisplay,
                createdAt,
                acceptedAt: row.accepted_at,
                daysWaiting,
                needsResponse,
                depositStatus,
            };
        });

        const totalQuotes = Math.max(0, Number(countResult?.total || 0));
        const totalPages = totalQuotes === 0 ? 0 : Math.ceil(totalQuotes / limit);

        return new Response(
            JSON.stringify({
                success: true,
                quotes,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalQuotes,
                    hasMore: page < totalPages,
                },
                summary: {
                    pending: Number(summaryResult?.pending || 0),
                    quoted: Number(summaryResult?.quoted || 0),
                    accepted: Number(summaryResult?.accepted || 0),
                    declined: Number(summaryResult?.declined || 0),
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin quotes list error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch quotes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
