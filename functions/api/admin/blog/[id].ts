import { invalidateByTag } from '../../../lib/cache';
import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';
import { normalizeAssetUrl } from '../../../lib/asset-url';

// GET — fetch single blog post for editing
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    const postId = parseInt(params.id as string, 10);
    if (!postId || postId <= 0) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid post ID' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const post = await env.DB.prepare(
            `SELECT id, title, slug, content, excerpt, featured_image_url, category, tags,
                    meta_title, meta_description, published, published_at, created_at, updated_at
             FROM blog_posts WHERE id = ? LIMIT 1`
        ).bind(postId).first<{
            id: number; title: string; slug: string; content: string; excerpt: string | null;
            featured_image_url: string | null; category: string | null; tags: string | null;
            meta_title: string | null; meta_description: string | null;
            published: number; published_at: string | null; created_at: string; updated_at: string;
        }>();

        if (!post) {
            return new Response(JSON.stringify({ success: false, error: 'Post not found' }), {
                status: 404, headers: { 'Content-Type': 'application/json' },
            });
        }

        let tags: string[] = [];
        try { tags = post.tags ? JSON.parse(post.tags) : []; } catch { tags = []; }

        return new Response(JSON.stringify({
            success: true,
            post: {
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                featuredImageUrl: normalizeAssetUrl(post.featured_image_url),
                category: post.category,
                tags,
                metaTitle: post.meta_title,
                metaDescription: post.meta_description,
                published: post.published === 1,
                publishedAt: post.published_at,
                createdAt: post.created_at,
                updatedAt: post.updated_at,
            },
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Admin blog GET error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to load post' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
};

// DELETE — remove a blog post
export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    const postId = parseInt(params.id as string, 10);
    if (!postId || postId <= 0) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid post ID' }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const existing = await env.DB.prepare(
            'SELECT id, slug, category, tags FROM blog_posts WHERE id = ? LIMIT 1'
        ).bind(postId).first<{ id: number; slug: string; category: string | null; tags: string | null }>();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: 'Post not found' }), {
                status: 404, headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await env.DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(postId).run();
        if (!result.success) {
            throw new Error('Failed to delete post');
        }

        const cacheTags = new Set<string>(['blog-posts', `blog-post:${existing.slug}`]);
        if (existing.category) cacheTags.add(`blog-category:${existing.category.toLowerCase()}`);
        let tags: string[] = [];
        try { tags = existing.tags ? JSON.parse(existing.tags) : []; } catch { tags = []; }
        for (const tag of tags) {
            const normalized = tag.trim().toLowerCase();
            if (normalized) cacheTags.add(`blog-tag:${normalized}`);
        }
        await Promise.all(Array.from(cacheTags).map(tag => invalidateByTag(env, tag)));

        return new Response(JSON.stringify({ success: true, message: 'Post deleted' }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin blog DELETE error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to delete post' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
};

interface BlogPostRow {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featured_image_url: string | null;
    category: string | null;
    tags: string | null;
    published: number;
    published_at: string | null;
    meta_title: string | null;
    meta_description: string | null;
}

const TITLE_MIN_LENGTH = 10;
const TITLE_MAX_LENGTH = 200;
const CONTENT_MIN_LENGTH = 100;
const EXCERPT_MAX_LENGTH = 300;
const EXCERPT_AUTO_LENGTH = 200;
const META_TITLE_MAX_LENGTH = 60;
const META_DESCRIPTION_MAX_LENGTH = 155;

function parsePostId(value?: string): number | null {
    if (!value || !/^\d+$/.test(value)) {
        return null;
    }
    const parsed = Number.parseInt(value, 10);
    return parsed > 0 ? parsed : null;
}

function parseOptionalText(
    value: unknown,
    fieldName: string,
    maxLength?: number
): { value: string | null; error?: string } {
    if (value === undefined || value === null) {
        return { value: null };
    }
    if (typeof value !== 'string') {
        return { value: null, error: `${fieldName} must be a string` };
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return { value: null };
    }
    if (maxLength && trimmed.length > maxLength) {
        return { value: null, error: `${fieldName} must be ${maxLength} characters or fewer` };
    }
    return { value: trimmed };
}

function parseOptionalUrl(
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
    if (!trimmed) {
        return { value: null };
    }

    if (trimmed.startsWith('/')) {
        return { value: normalizeAssetUrl(trimmed) };
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return { value: null, error: `${fieldName} must be a valid URL` };
        }
    } catch {
        return { value: null, error: `${fieldName} must be a valid URL` };
    }
    return { value: normalizeAssetUrl(trimmed) };
}

function parseTagsInput(value: unknown): { tags: string[]; error?: string } {
    if (value === undefined || value === null) {
        return { tags: [] };
    }
    if (!Array.isArray(value)) {
        return { tags: [], error: 'tags must be an array of strings' };
    }
    const tags = new Set<string>();
    for (const entry of value) {
        if (typeof entry !== 'string') {
            return { tags: [], error: 'tags must be an array of strings' };
        }
        const trimmed = entry.trim();
        if (trimmed) {
            tags.add(trimmed);
        }
    }
    return { tags: Array.from(tags) };
}

function parseOptionalBoolean(
    value: unknown,
    fieldName: string
): { value: boolean; provided: boolean; error?: string } {
    if (value === undefined) {
        return { value: false, provided: false };
    }
    if (typeof value !== 'boolean') {
        return { value: false, provided: true, error: `${fieldName} must be a boolean` };
    }
    return { value, provided: true };
}

function parseTagsFromDb(value: string | null): string[] {
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

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildExcerpt(content: string): string {
    const plainText = stripHtml(content);
    if (!plainText) {
        return '';
    }
    const preview = plainText.slice(0, EXCERPT_AUTO_LENGTH).trim();
    if (!preview) {
        return '';
    }
    return `${preview}...`;
}

function clampSeoValue(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }
    return value.slice(0, maxLength).trim();
}

async function invalidateBlogCache(
    env: Env,
    slug: string,
    previousCategory: string | null,
    previousTags: string[],
    nextCategory: string | null,
    nextTags: string[]
): Promise<void> {
    const cacheTags = new Set<string>(['blog-posts', `blog-post:${slug}`]);
    const categories = [previousCategory, nextCategory].filter(Boolean) as string[];
    for (const category of categories) {
        cacheTags.add(`blog-category:${category.toLowerCase()}`);
    }
    for (const tag of [...previousTags, ...nextTags]) {
        const normalized = tag.trim().toLowerCase();
        if (normalized) {
            cacheTags.add(`blog-tag:${normalized}`);
        }
    }
    await Promise.all(Array.from(cacheTags).map((tag) => invalidateByTag(env, tag)));
}

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    const postId = parsePostId(params.id as string);
    if (!postId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid post ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        console.error('Admin blog update parse error:', error);
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

    const payload = body as Record<string, unknown>;

    try {
        const existing = await env.DB.prepare(
            `
            SELECT id, title, slug, content, excerpt, featured_image_url, category, tags,
                   published, published_at, meta_title, meta_description
            FROM blog_posts
            WHERE id = ?
            LIMIT 1
          `
        )
            .bind(postId)
            .first<BlogPostRow>();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: 'Post not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const hasTitleField = Object.prototype.hasOwnProperty.call(payload, 'title');
        const titleResult = hasTitleField
            ? parseOptionalText(payload.title, 'title', TITLE_MAX_LENGTH)
            : { value: null };
        if (titleResult.error) {
            return new Response(JSON.stringify({ success: false, error: titleResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const nextTitle = titleResult.value ?? existing.title;
        if (nextTitle.length < TITLE_MIN_LENGTH) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `title must be at least ${TITLE_MIN_LENGTH} characters`,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const hasContentField = Object.prototype.hasOwnProperty.call(payload, 'content');
        const contentResult = hasContentField
            ? parseOptionalText(payload.content, 'content')
            : { value: null };
        if (contentResult.error) {
            return new Response(JSON.stringify({ success: false, error: contentResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const nextContent = contentResult.value ?? existing.content;
        if (nextContent.length < CONTENT_MIN_LENGTH) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `content must be at least ${CONTENT_MIN_LENGTH} characters`,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const hasExcerptField = Object.prototype.hasOwnProperty.call(payload, 'excerpt');
        const excerptResult = hasExcerptField
            ? parseOptionalText(payload.excerpt, 'excerpt', EXCERPT_MAX_LENGTH)
            : { value: null };
        if (excerptResult.error) {
            return new Response(JSON.stringify({ success: false, error: excerptResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let nextExcerpt = existing.excerpt;
        if (hasExcerptField) {
            const generatedExcerpt = buildExcerpt(nextContent);
            nextExcerpt = excerptResult.value ?? (generatedExcerpt || null);
        } else if (!nextExcerpt) {
            const generatedExcerpt = buildExcerpt(nextContent);
            nextExcerpt = generatedExcerpt || null;
        }
        const excerptForMeta = (nextExcerpt ?? '').trim();

        const hasFeaturedImageField = Object.prototype.hasOwnProperty.call(
            payload,
            'featuredImageUrl'
        );
        const featuredImageResult = hasFeaturedImageField
            ? parseOptionalUrl(payload.featuredImageUrl, 'featuredImageUrl')
            : { value: null };
        if (featuredImageResult.error) {
            return new Response(
                JSON.stringify({ success: false, error: featuredImageResult.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        const nextFeaturedImageUrl = hasFeaturedImageField
            ? featuredImageResult.value
            : existing.featured_image_url;

        const hasCategoryField = Object.prototype.hasOwnProperty.call(payload, 'category');
        const categoryResult = hasCategoryField
            ? parseOptionalText(payload.category, 'category')
            : { value: null };
        if (categoryResult.error) {
            return new Response(JSON.stringify({ success: false, error: categoryResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const nextCategory = hasCategoryField ? categoryResult.value : existing.category;

        const hasTagsField = Object.prototype.hasOwnProperty.call(payload, 'tags');
        const tagsResult = hasTagsField ? parseTagsInput(payload.tags) : { tags: [] };
        if (tagsResult.error) {
            return new Response(JSON.stringify({ success: false, error: tagsResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const existingTags = parseTagsFromDb(existing.tags);
        const nextTags = hasTagsField ? tagsResult.tags : existingTags;
        const tagsJson = nextTags.length > 0 ? JSON.stringify(nextTags) : null;

        const publishedResult = parseOptionalBoolean(payload.published, 'published');
        if (publishedResult.error) {
            return new Response(JSON.stringify({ success: false, error: publishedResult.error }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const nextPublished = publishedResult.provided
            ? publishedResult.value
            : existing.published === 1;
        const publishedFlag = nextPublished ? 1 : 0;

        const hasMetaTitleField = Object.prototype.hasOwnProperty.call(payload, 'metaTitle');
        const metaTitleResult = hasMetaTitleField
            ? parseOptionalText(payload.metaTitle, 'metaTitle', META_TITLE_MAX_LENGTH)
            : { value: null };
        if (metaTitleResult.error) {
            return new Response(
                JSON.stringify({ success: false, error: metaTitleResult.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        const metaTitleFallback = existing.meta_title?.trim() || nextTitle;
        const metaTitleValue = clampSeoValue(
            (hasMetaTitleField ? metaTitleResult.value : metaTitleFallback) ?? nextTitle,
            META_TITLE_MAX_LENGTH
        );

        const hasMetaDescriptionField = Object.prototype.hasOwnProperty.call(
            payload,
            'metaDescription'
        );
        const metaDescriptionResult = hasMetaDescriptionField
            ? parseOptionalText(
                payload.metaDescription,
                'metaDescription',
                META_DESCRIPTION_MAX_LENGTH
            )
            : { value: null };
        if (metaDescriptionResult.error) {
            return new Response(
                JSON.stringify({ success: false, error: metaDescriptionResult.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        const metaDescriptionFallback = existing.meta_description?.trim() || excerptForMeta;
        const metaDescriptionValue = clampSeoValue(
            (hasMetaDescriptionField ? metaDescriptionResult.value : metaDescriptionFallback) ??
            excerptForMeta,
            META_DESCRIPTION_MAX_LENGTH
        );

        const updateResult = await env.DB.prepare(
            `
            UPDATE blog_posts
            SET
              title = ?,
              content = ?,
              excerpt = ?,
              featured_image_url = ?,
              category = ?,
              tags = ?,
              meta_title = ?,
              meta_description = ?,
              published = ?,
              published_at = CASE
                WHEN ? = 1 AND published = 0 THEN datetime('now')
                WHEN ? = 0 THEN NULL
                ELSE published_at
              END,
              updated_at = datetime('now')
            WHERE id = ?
          `
        )
            .bind(
                nextTitle,
                nextContent,
                nextExcerpt,
                nextFeaturedImageUrl,
                nextCategory,
                tagsJson,
                metaTitleValue,
                metaDescriptionValue,
                publishedFlag,
                publishedFlag,
                publishedFlag,
                postId
            )
            .run();

        if (!updateResult.success) {
            throw new Error('Failed to update blog post');
        }

        const updated = await env.DB.prepare(
            `
            SELECT id, title, slug, published, published_at
            FROM blog_posts
            WHERE id = ?
            LIMIT 1
          `
        )
            .bind(postId)
            .first<{
                id: number;
                title: string;
                slug: string;
                published: number;
                published_at: string | null;
            }>();

        if (!updated) {
            throw new Error('Failed to load updated blog post');
        }

        await invalidateBlogCache(
            env,
            existing.slug,
            existing.category,
            existingTags,
            nextCategory,
            nextTags
        );

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    updated.published === 1 ? 'Blog post updated and published' : 'Blog post updated',
                post: {
                    id: updated.id,
                    title: updated.title,
                    slug: updated.slug,
                    published: updated.published === 1,
                    publishedAt: updated.published_at,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin blog update error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to update blog post' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
