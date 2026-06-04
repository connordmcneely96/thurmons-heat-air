import { Env } from '../../types';
import { getFromCache, setInCache } from '../../lib/cache';
import { normalizeAssetUrl } from '../../lib/asset-url';

interface BlogPostListRow {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    category: string | null;
    tags: string | null;
    published_at: string | null;
    content_length: number | null;
}

interface BlogListResponse {
    success: boolean;
    posts: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string;
        featuredImageUrl: string | null;
        category: string | null;
        tags: string[];
        publishedAt: string | null;
        readTime: string;
    }>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPosts: number;
        hasMore: boolean;
    };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const CACHE_TTL_SECONDS = 60 * 60;
const CHARS_PER_MINUTE = 1200;

function parsePositiveInt(value: string | undefined | null, fallback: number): number | null {
    if (value === undefined || value === null) return fallback;
    if (!/^\d+$/.test(value)) return null;
    const parsed = Number.parseInt(value, 10);
    if (parsed < 1) return null;
    return parsed;
}

function normalizeQuery(value: string | undefined | null): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeKey(value: string | undefined): string {
    return value ? value.trim().toLowerCase() : 'all';
}

function parseTags(value: string | null | undefined): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed
                .filter((tag): tag is string => typeof tag === 'string')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        }
        return [];
    } catch {
        return [];
    }
}

function getReadTimeFromLength(length: number | null | undefined): string {
    const safeLength = typeof length === 'number' && Number.isFinite(length) ? length : 0;
    const minutes = Math.max(1, Math.ceil(safeLength / CHARS_PER_MINUTE));
    return `${minutes} min`;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const url = new URL(request.url);
        const page = parsePositiveInt(url.searchParams.get('page'), DEFAULT_PAGE);
        const limit = parsePositiveInt(url.searchParams.get('limit'), DEFAULT_LIMIT);

        if (page === null || limit === null || limit > MAX_LIMIT) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid pagination parameters',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const category = normalizeQuery(url.searchParams.get('category'));
        const tag = normalizeQuery(url.searchParams.get('tag'));
        const search = normalizeQuery(url.searchParams.get('search'));

        const categoryKey = normalizeKey(category);
        const tagKey = normalizeKey(tag);
        const searchKey = normalizeKey(search);
        const cacheKeyBase = `blog:list:${page}:${categoryKey}:${tagKey}`;
        const cacheKey =
            search || limit !== DEFAULT_LIMIT
                ? `${cacheKeyBase}:${limit}:${searchKey}`
                : cacheKeyBase;

        const cached = await getFromCache<BlogListResponse>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), { headers: { 'Content-Type': 'application/json' } });
        }

        const conditions: string[] = ['published = 1'];
        const bindings: Array<string | number> = [];

        if (category) {
            conditions.push('LOWER(category) = ?');
            bindings.push(category.toLowerCase());
        }

        if (tag) {
            conditions.push('LOWER(tags) LIKE ?');
            bindings.push(`%"${tag.toLowerCase()}"%`);
        }

        if (search) {
            conditions.push('(LOWER(title) LIKE ? OR LOWER(COALESCE(excerpt, \'\')) LIKE ?)');
            const searchValue = `%${search.toLowerCase()}%`;
            bindings.push(searchValue, searchValue);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countRow = await env.DB.prepare(
            `SELECT COUNT(*) as total FROM blog_posts ${whereClause}`
        )
            .bind(...bindings)
            .first<{ total: number }>();

        const totalPosts = Number(countRow?.total ?? 0);
        const totalPages = totalPosts === 0 ? 0 : Math.ceil(totalPosts / limit);
        const offset = (page - 1) * limit;

        const postsResult = await env.DB.prepare(
            `
        SELECT id, title, slug, excerpt, featured_image_url, category, tags, published_at,
               LENGTH(content) as content_length
        FROM blog_posts
        ${whereClause}
        ORDER BY published_at DESC
        LIMIT ? OFFSET ?
      `
        )
            .bind(...bindings, limit, offset)
            .all<BlogPostListRow>();

        const rows = (postsResult.results || []) as BlogPostListRow[];
        const posts = rows.map((row) => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt ?? '',
            featuredImageUrl: normalizeAssetUrl(row.featured_image_url),
            category: row.category ?? null,
            tags: parseTags(row.tags),
            publishedAt: row.published_at ?? null,
            readTime: getReadTimeFromLength(row.content_length),
        }));

        const response: BlogListResponse = {
            success: true,
            posts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasMore: totalPages > 0 && page < totalPages,
            },
        };

        const cacheTags = ['blog-posts'];
        if (category) {
            cacheTags.push(`blog-category:${categoryKey}`);
        }
        if (tag) {
            cacheTags.push(`blog-tag:${tagKey}`);
        }

        await setInCache(env, cacheKey, response, {
            ttl: CACHE_TTL_SECONDS,
            tags: cacheTags,
        });

        return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Blog posts list error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch blog posts',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
