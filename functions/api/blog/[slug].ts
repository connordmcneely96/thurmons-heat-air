import { Env } from '../../types';
import { getFromCache, setInCache } from '../../lib/cache';
import { normalizeAssetUrl } from '../../lib/asset-url';

interface BlogPostRow {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image_url: string | null;
    category: string | null;
    tags: string | null;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
}

interface RelatedPostRow {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
}

interface BlogPostResponse {
    success: boolean;
    post: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        featuredImageUrl: string | null;
        category: string | null;
        tags: string[];
        publishedAt: string | null;
        readTime: string;
        metaTitle: string;
        metaDescription: string;
    };
    relatedPosts: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt: string;
        featuredImageUrl: string | null;
    }>;
}

const CACHE_TTL_SECONDS = 60 * 60;
const CHARS_PER_MINUTE = 1200;

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
    const { request, env, params } = context;

    try {
        const slug = params.slug;
        if (!slug || Array.isArray(slug)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Post not found',
            }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const cacheKey = `blog:post:${slug}`;
        const cached = await getFromCache<BlogPostResponse>(env, cacheKey);
        if (cached) {
            return new Response(JSON.stringify(cached), { headers: { 'Content-Type': 'application/json' } });
        }

        const post = await env.DB.prepare(
            `
        SELECT id, title, slug, content, excerpt, featured_image_url, category, tags,
               published_at, meta_title, meta_description
        FROM blog_posts
        WHERE slug = ? AND published = 1
        LIMIT 1
      `
        )
            .bind(slug)
            .first<BlogPostRow>();

        if (!post) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Post not found',
            }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const tags = parseTags(post.tags);
        const category = post.category?.trim() || null;
        const readTime = getReadTimeFromLength(post.content?.length);
        const metaTitle = post.meta_title?.trim() || post.title;
        const metaDescription = post.meta_description?.trim() || (post.excerpt ?? '');

        const relatedPosts: BlogPostResponse['relatedPosts'] = [];
        const usedIds = new Set<number>([post.id]);

        if (category) {
            const categoryResult = await env.DB.prepare(
                `
          SELECT id, title, slug, excerpt, featured_image_url
          FROM blog_posts
          WHERE published = 1 AND LOWER(category) = ? AND id != ?
          ORDER BY published_at DESC
          LIMIT 3
        `
            )
                .bind(category.toLowerCase(), post.id)
                .all<RelatedPostRow>();

            const categoryRows = (categoryResult.results || []) as RelatedPostRow[];
            for (const row of categoryRows) {
                relatedPosts.push({
                    id: row.id,
                    title: row.title,
                    slug: row.slug,
                    excerpt: row.excerpt ?? '',
                    featuredImageUrl: normalizeAssetUrl(row.featured_image_url),
                });
                usedIds.add(row.id);
            }
        }

        const remaining = 3 - relatedPosts.length;
        if (remaining > 0 && tags.length > 0) {
            const tagConditions = tags.map(() => 'LOWER(tags) LIKE ?').join(' OR ');
            const tagBindings = tags.map((tag) => `%"${tag.toLowerCase()}"%`);
            const excludeIds = Array.from(usedIds);
            const excludeClause = `AND id NOT IN (${excludeIds.map(() => '?').join(', ')})`;

            const tagResult = await env.DB.prepare(
                `
          SELECT id, title, slug, excerpt, featured_image_url
          FROM blog_posts
          WHERE published = 1
          ${excludeClause}
          AND (${tagConditions})
          ORDER BY published_at DESC
          LIMIT ?
        `
            )
                .bind(...excludeIds, ...tagBindings, remaining)
                .all<RelatedPostRow>();

            const tagRows = (tagResult.results || []) as RelatedPostRow[];
            for (const row of tagRows) {
                relatedPosts.push({
                    id: row.id,
                    title: row.title,
                    slug: row.slug,
                    excerpt: row.excerpt ?? '',
                    featuredImageUrl: normalizeAssetUrl(row.featured_image_url),
                });
            }
        }

        const response: BlogPostResponse = {
            success: true,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt ?? '',
                featuredImageUrl: normalizeAssetUrl(post.featured_image_url),
                category,
                tags,
                publishedAt: post.published_at ?? null,
                readTime,
                metaTitle,
                metaDescription,
            },
            relatedPosts,
        };

        const cacheTags = ['blog-posts', `blog-post:${slug}`];
        if (category) {
            cacheTags.push(`blog-category:${category.toLowerCase()}`);
        }
        for (const tag of tags) {
            cacheTags.push(`blog-tag:${tag.toLowerCase()}`);
        }

        await setInCache(env, cacheKey, response, {
            ttl: CACHE_TTL_SECONDS,
            tags: cacheTags,
        });

        return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Blog post fetch error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch blog post',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
