import { requireAuth } from '../../lib/session';
import { Env } from '../../types';

type QuoteRow = {
    id: number;
    service_type: string;
    description: string | null;
    quoted_amount: number | null;
    status: string;
    quote_valid_until: string | null;
    created_at: string;
    quoted_at: string | null;
    accepted_at: string | null;
};

const STATUS_DISPLAY: Record<string, string> = {
    pending: 'Pending',
    quoted: 'Quoted',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    converted: 'Converted',
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
    other: 'Other Services',
};

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

function toTitleCase(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) return authResult;

        if (authResult.role !== 'customer') {
            return new Response(JSON.stringify({ success: false, error: 'Customer access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const sessionEmail = normalize(authResult.email);

        const result = await env.DB.prepare(
            `
            SELECT
              q.id,
              q.service_type,
              q.description,
              q.quoted_amount,
              q.status,
              q.quote_valid_until,
              q.created_at,
              q.quoted_at,
              q.accepted_at
            FROM quotes q
            LEFT JOIN customers c ON q.customer_id = c.id
            WHERE q.customer_id = ?
               OR LOWER(COALESCE(c.email, '')) = ?
               OR LOWER(COALESCE(q.contact_email, '')) = ?
               OR LOWER(COALESCE(q.customer_email, '')) = ?
            ORDER BY q.created_at DESC
            LIMIT 100
            `
        )
            .bind(authResult.userId, sessionEmail, sessionEmail, sessionEmail)
            .all<QuoteRow>();

        const quotes = (result.results ?? []).map((q) => {
            const serviceKey = normalize(q.service_type);
            const serviceName = SERVICE_TYPE_LABELS[serviceKey] || toTitleCase(serviceKey);
            const statusKey = normalize(q.status);
            return {
                id: q.id,
                serviceType: q.service_type,
                service_type: q.service_type,
                serviceName,
                description: q.description,
                quotedAmount: q.quoted_amount,
                quoted_amount: q.quoted_amount,
                status: q.status,
                statusDisplay: STATUS_DISPLAY[statusKey] || toTitleCase(statusKey),
                quoteValidUntil: q.quote_valid_until,
                quote_valid_until: q.quote_valid_until,
                createdAt: q.created_at,
                created_at: q.created_at,
                quotedAt: q.quoted_at,
                quoted_at: q.quoted_at,
                acceptedAt: q.accepted_at,
                accepted_at: q.accepted_at,
            };
        });

        return new Response(JSON.stringify({ success: true, quotes, data: quotes }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Customer quotes error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch quotes' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
