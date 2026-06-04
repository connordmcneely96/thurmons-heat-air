import { Env } from '../../types';
import { getOrSet } from '../../lib/cache';

const DEFAULT_LIMIT = 6;
const DEFAULT_MIN_RATING = 4;
const MAX_LIMIT = 20;
const CACHE_TTL_SECONDS = 60 * 60;
const CACHE_TAG = 'testimonials';

type TestimonialRow = {
    id: number;
    rating: number;
    feedback: string;
    created_at: string;
    customer_name: string;
    zip_code: string | null;
};

type ServiceAreaRow = {
    zip_code: string;
    city: string;
    state: string;
};

type TestimonialResponseItem = {
    id: number;
    rating: number;
    feedback: string;
    customerName: string;
    location: string;
    date: string;
};

type TestimonialsResponse = {
    success: true;
    testimonials: TestimonialResponseItem[];
    total: number;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        const featuredParam = url.searchParams.get('featured');
        const limitParam = url.searchParams.get('limit');
        const minRatingParam = url.searchParams.get('minRating');

        const featured = featuredParam === null ? true : parseBoolean(featuredParam);
        if (featured === null) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid featured parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const limit = limitParam === null ? DEFAULT_LIMIT : Number(limitParam);
        if (!Number.isInteger(limit) || limit <= 0 || limit > MAX_LIMIT) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid limit parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const minRating = minRatingParam === null ? DEFAULT_MIN_RATING : Number(minRatingParam);
        if (!Number.isInteger(minRating) || minRating < 1 || minRating > 5) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid minRating parameter' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const featuredValue = featured ? 1 : 0;
        const cacheKey = featured
            ? `testimonials:featured:${limit}:${minRating}`
            : `testimonials:nonfeatured:${limit}:${minRating}`;

        const response = await getOrSet<TestimonialsResponse>(
            env,
            cacheKey,
            async () => {
                const testimonialsResult = await env.DB.prepare(`
          SELECT
            t.id,
            t.rating,
            t.feedback,
            t.created_at,
            c.name as customer_name,
            c.zip_code
          FROM testimonials t
          JOIN customers c ON t.customer_id = c.id
          WHERE t.is_featured = ?
            AND t.rating >= ?
          ORDER BY t.created_at DESC
          LIMIT ?
        `).bind(featuredValue, minRating, limit).all<TestimonialRow>();

                const rows = testimonialsResult.results || [];
                if (rows.length === 0) {
                    return { success: true, testimonials: [], total: 0 };
                }

                const totalResult = await env.DB.prepare(`
          SELECT COUNT(*) as total
          FROM testimonials t
          JOIN customers c ON t.customer_id = c.id
          WHERE t.is_featured = ?
            AND t.rating >= ?
        `).bind(featuredValue, minRating).first<{ total: number }>();

                const locationMap = await getLocationMap(env.DB, rows);

                const testimonials = rows.map((row) => ({
                    id: row.id,
                    rating: row.rating,
                    feedback: row.feedback,
                    customerName: formatCustomerName(row.customer_name),
                    location: locationMap.get(row.zip_code ?? '') || '',
                    date: formatDate(row.created_at),
                }));

                return {
                    success: true,
                    testimonials,
                    total: totalResult?.total ?? 0,
                };
            },
            { ttl: CACHE_TTL_SECONDS, tags: [CACHE_TAG] }
        );

        return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Testimonials error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to fetch testimonials' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

function parseBoolean(value: string): boolean | null {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return null;
}

function formatCustomerName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Customer';
    const firstName = parts[0] ?? 'Customer';
    if (parts.length === 1) return firstName;
    const lastPart = parts[parts.length - 1];
    const lastInitial = lastPart?.[0]?.toUpperCase();
    return lastInitial ? `${firstName} ${lastInitial}.` : firstName;
}

function formatDate(value: string): string {
    if (!value) return '';
    const datePart = value.includes('T') ? value.split('T')[0] : value.split(' ')[0];
    const trimmed = datePart ?? '';
    return trimmed.length >= 10 ? trimmed.slice(0, 10) : trimmed;
}

async function getLocationMap(
    db: D1Database,
    rows: TestimonialRow[]
): Promise<Map<string, string>> {
    const zipCodes = Array.from(
        new Set(rows.map((row) => row.zip_code).filter((zip): zip is string => Boolean(zip)))
    );

    if (zipCodes.length === 0) {
        return new Map();
    }

    const placeholders = zipCodes.map(() => '?').join(', ');
    const areasResult = await db.prepare(`
    SELECT zip_code, city, state
    FROM service_areas
    WHERE zip_code IN (${placeholders})
  `).bind(...zipCodes).all<ServiceAreaRow>();

    const map = new Map<string, string>();
    for (const area of areasResult.results || []) {
        map.set(area.zip_code, `${area.city}, ${area.state}`);
    }

    return map;
}
