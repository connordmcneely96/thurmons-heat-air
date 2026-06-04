import { Env } from '../../types';

const CACHE_TTL_SECONDS = 31536000; // 1 year (immutable)
const ASSET_ALIASES: Record<string, string[]> = {
    'home-hero-bg.png': ['Home_Page_Hero_Background_Image.png'],
    'company-image.png': ['Company_Image.png'],
    'service-lawn-care.png': ['Lawn_Care_%26_Maintenance_Image.png', 'Lawn_Care_&_Maintenance_Image.png'],
    'service-landscaping-design.png': ['Landscaping_%26_Design_Image.png', 'Landscaping_&_Design_Image.png'],
    'service-seasonal-cleanups.png': ['Seasonal_Cleanups_Image%20(1).png', 'Seasonal_Cleanups_Image (1).png'],
    'service-pressure-washing.png': ['Pressure_Washing_%26_Soft_Washing_Image.png', 'Pressure_Washing_&_Soft_Washing_Image.png'],
};

function getContentType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
        html: 'text/html; charset=utf-8',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        woff: 'font/woff',
        woff2: 'font/woff2',
        ttf: 'font/ttf',
        eot: 'application/vnd.ms-fontobject',
        pdf: 'application/pdf',
        txt: 'text/plain',
    };

    return contentTypes[extension || ''] || 'application/octet-stream';
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { env, params } = context;

    try {
        const rawPath = Array.isArray(params.path) ? params.path.join('/') : params.path;

        if (!rawPath) {
            return new Response('Not found', { status: 404 });
        }

        const candidatePaths = new Set<string>([rawPath]);
        const aliasTargets = ASSET_ALIASES[rawPath];
        if (aliasTargets) {
            for (const aliasTarget of aliasTargets) {
                candidatePaths.add(aliasTarget);
            }
        }
        try {
            candidatePaths.add(decodeURIComponent(rawPath));
        } catch {
            // Keep raw path if malformed encoding is present.
        }
        candidatePaths.add(rawPath.replace(/\+/g, ' '));

        let object: R2ObjectBody | null = null;
        let resolvedPath: string | null = null;
        for (const path of candidatePaths) {
            console.log('[Assets] Fetching from R2:', path);
            object = await env.R2_BUCKET.get(path);
            if (object) {
                resolvedPath = path;
                break;
            }
        }

        if (!object || !resolvedPath) {
            console.error('[Assets] File not found in R2 for candidates:', Array.from(candidatePaths));
            return new Response('Not found', { status: 404 });
        }

        console.log('[Assets] File found, serving:', resolvedPath);

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Cache-Control', `public, max-age=${CACHE_TTL_SECONDS}, immutable`);

        if (!headers.get('Content-Type')) {
            headers.set('Content-Type', getContentType(resolvedPath));
        }

        return new Response(object.body, {
            headers,
        });

    } catch (error) {
        console.error('Asset serving error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
};
