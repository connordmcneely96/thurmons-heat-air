import { invalidateByTag } from '../../../lib/cache';
import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';
import { normalizeAssetUrl } from '../../../lib/asset-url';

// GET — list all blog posts for admin
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    try {
        const url = new URL(request.url);
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
        const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

        const rows = await env.DB.prepare(
            `SELECT id, title, slug, excerpt, category, published, published_at, created_at, updated_at
             FROM blog_posts
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`
        ).bind(limit, offset).all<{
            id: number; title: string; slug: string; excerpt: string | null;
            category: string | null; published: number; published_at: string | null;
            created_at: string; updated_at: string;
        }>();

        const posts = (rows.results || []).map(row => ({
            id: row.id,
            title: row.title,
            slug: row.slug,
            excerpt: row.excerpt,
            category: row.category,
            published: row.published === 1,
            publishedAt: row.published_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }));

        return new Response(JSON.stringify({ success: true, posts }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin blog list error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to load blog posts' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

const TITLE_MIN_LENGTH = 10;
const TITLE_MAX_LENGTH = 200;
const CONTENT_MIN_LENGTH = 100;
const EXCERPT_MAX_LENGTH = 300;
const EXCERPT_AUTO_LENGTH = 200;
const META_TITLE_MAX_LENGTH = 60;
const META_DESCRIPTION_MAX_LENGTH = 155;

function parseRequiredText(
    value: unknown,
    fieldName: string,
    minLength: number,
    maxLength?: number
): { value: string; error?: string } {
    if (typeof value !== 'string') {
        return { value: '', error: `${fieldName} is required` };
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return { value: '', error: `${fieldName} is required` };
    }
    if (trimmed.length < minLength) {
        return { value: '', error: `${fieldName} must be at least ${minLength} characters` };
    }
    if (maxLength && trimmed.length > maxLength) {
        return { value: '', error: `${fieldName} must be ${maxLength} characters or fewer` };
    }
    return { value: trimmed };
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
): { value: boolean; error?: string } {
    if (value === undefined || value === null) {
        return { value: false };
    }
    if (typeof value !== 'boolean') {
        return { value: false, error: `${fieldName} must be a boolean` };
    }
    return { value };
}

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function isValidSlug(value: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function clampSeoValue(value: string, maxLength: number): string {
    if (value.length <= maxLength) {
        return value;
    }
    return value.slice(0, maxLength).trim();
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

async function invalidateBlogCache(
    env: Env,
    slug: string,
    category: string | null,
    tags: string[]
): Promise<void> {
    const cacheTags = new Set<string>(['blog-posts', `blog-post:${slug}`]);
    if (category) {
        cacheTags.add(`blog-category:${category.toLowerCase()}`);
    }
    for (const tag of tags) {
        const normalized = tag.trim().toLowerCase();
        if (normalized) {
            cacheTags.add(`blog-tag:${normalized}`);
        }
    }
    await Promise.all(Array.from(cacheTags).map((tag) => invalidateByTag(env, tag)));
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        console.error('Admin blog create parse error:', error);
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

    const titleResult = parseRequiredText(
        payload.title,
        'title',
        TITLE_MIN_LENGTH,
        TITLE_MAX_LENGTH
    );
    if (titleResult.error) {
        return new Response(JSON.stringify({ success: false, error: titleResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const contentResult = parseRequiredText(payload.content, 'content', CONTENT_MIN_LENGTH);
    if (contentResult.error) {
        return new Response(JSON.stringify({ success: false, error: contentResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const slugInput = parseOptionalText(payload.slug, 'slug');
    if (slugInput.error) {
        return new Response(JSON.stringify({ success: false, error: slugInput.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const baseSlugSource = slugInput.value ?? titleResult.value;
    const slug = slugify(baseSlugSource);
    if (!slug || !isValidSlug(slug)) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid slug format' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const excerptResult = parseOptionalText(payload.excerpt, 'excerpt', EXCERPT_MAX_LENGTH);
    if (excerptResult.error) {
        return new Response(JSON.stringify({ success: false, error: excerptResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const contentValue = contentResult.value;
    const generatedExcerpt = buildExcerpt(contentValue);
    const excerptValue = excerptResult.value ?? generatedExcerpt;
    const excerptForDb = excerptValue.trim().length > 0 ? excerptValue.trim() : null;

    const featuredImageResult = parseOptionalUrl(
        payload.featuredImageUrl,
        'featuredImageUrl'
    );
    if (featuredImageResult.error) {
        return new Response(JSON.stringify({ success: false, error: featuredImageResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const categoryResult = parseOptionalText(payload.category, 'category');
    if (categoryResult.error) {
        return new Response(JSON.stringify({ success: false, error: categoryResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const tagsResult = parseTagsInput(payload.tags);
    if (tagsResult.error) {
        return new Response(JSON.stringify({ success: false, error: tagsResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const publishedResult = parseOptionalBoolean(payload.published, 'published');
    if (publishedResult.error) {
        return new Response(JSON.stringify({ success: false, error: publishedResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const metaTitleResult = parseOptionalText(
        payload.metaTitle,
        'metaTitle',
        META_TITLE_MAX_LENGTH
    );
    if (metaTitleResult.error) {
        return new Response(JSON.stringify({ success: false, error: metaTitleResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const metaDescriptionResult = parseOptionalText(
        payload.metaDescription,
        'metaDescription',
        META_DESCRIPTION_MAX_LENGTH
    );
    if (metaDescriptionResult.error) {
        return new Response(JSON.stringify({ success: false, error: metaDescriptionResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const metaTitleValue = clampSeoValue(
        metaTitleResult.value ?? titleResult.value,
        META_TITLE_MAX_LENGTH
    );
    const metaDescriptionSource = metaDescriptionResult.value ?? excerptValue.trim();
    const metaDescriptionValue = clampSeoValue(
        metaDescriptionSource,
        META_DESCRIPTION_MAX_LENGTH
    );

    try {
        const existingSlug = await env.DB.prepare(
            'SELECT id FROM blog_posts WHERE slug = ? LIMIT 1'
        )
            .bind(slug)
            .first<{ id: number }>();

        if (existingSlug) {
            return new Response(JSON.stringify({ success: false, error: 'Slug already exists' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const publishedFlag = publishedResult.value ? 1 : 0;
        const tagsJson = tagsResult.tags.length > 0 ? JSON.stringify(tagsResult.tags) : null;

        const insertResult = await env.DB.prepare(
            `
        INSERT INTO blog_posts (
          title,
          slug,
          content,
          excerpt,
          featured_image_url,
          category,
          tags,
          meta_title,
          meta_description,
          published,
          published_at,
          created_at,
          updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?,
          CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END,
          datetime('now'),
          datetime('now')
        )
      `
        )
            .bind(
                titleResult.value,
                slug,
                contentValue,
                excerptForDb,
                featuredImageResult.value,
                categoryResult.value,
                tagsJson,
                metaTitleValue,
                metaDescriptionValue,
                publishedFlag,
                publishedFlag
            )
            .run();

        if (!insertResult.success) {
            throw new Error('Failed to insert blog post');
        }

        const insertedId = insertResult.meta.last_row_id;
        const createdRow = await env.DB.prepare(
            `
        SELECT id, title, slug, published, created_at
        FROM blog_posts
        WHERE id = ?
        LIMIT 1
      `
        )
            .bind(insertedId)
            .first<{
                id: number;
                title: string;
                slug: string;
                published: number;
                created_at: string;
            }>();

        if (!createdRow) {
            throw new Error('Failed to load created blog post');
        }

        if (publishedFlag === 1) {
            await invalidateBlogCache(
                env,
                createdRow.slug,
                categoryResult.value,
                tagsResult.tags
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Blog post created',
                post: {
                    id: createdRow.id,
                    title: createdRow.title,
                    slug: createdRow.slug,
                    published: createdRow.published === 1,
                    createdAt: createdRow.created_at,
                },
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin blog create error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to create blog post' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
