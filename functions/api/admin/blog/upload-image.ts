import { uploadToR2, validateFile } from '../../../lib/r2-upload';
import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

const BLOG_IMAGE_FOLDER = 'blog-images';
const MAX_UPLOAD_MB = 10;
const MAX_IMAGE_WIDTH = 1600;
const OPTIMIZED_TYPE = 'image/webp';
const OPTIMIZED_EXTENSION = 'webp';
const OPTIMIZED_QUALITY = 0.82;

function isBlobLike(value: unknown): value is Blob {
    return typeof Blob !== 'undefined' && value instanceof Blob;
}

function stripExtension(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '');
}

function sanitizeFilename(value: string): string {
    const cleaned = value.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-').trim();
    return cleaned.length > 0 ? cleaned.toLowerCase() : `blog-image-${Date.now()}`;
}

function getExtensionFromType(type: string | undefined): string {
    switch (type) {
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        case 'image/gif':
            return 'gif';
        case 'image/jpeg':
        case 'image/jpg':
            return 'jpg';
        default:
            return 'jpg';
    }
}

async function optimizeImage(
    file: Blob
): Promise<{ blob: Blob; contentType: string; extension: string }> {
    const buffer = await file.arrayBuffer();
    // Note: Standard Pages Functions environment might not have Image constructor for resizing.
    // We'll proceed with original file if image processing isn't available, or rely on a pure JS library if installed (not installed here).
    // The globalThis check mimics the original code.
    const imageCtor = (
        globalThis as { Image?: { decode?: (data: ArrayBuffer) => Promise<any> } }
    ).Image;

    if (!imageCtor?.decode) {
        const originalType = file.type || 'image/jpeg';
        return {
            blob: new Blob([buffer], { type: originalType }),
            contentType: originalType,
            extension: getExtensionFromType(originalType),
        };
    }

    try {
        const decoded = await imageCtor.decode(buffer);
        let processed = decoded;

        if (
            typeof decoded.width === 'number' &&
            decoded.width > MAX_IMAGE_WIDTH &&
            decoded.resize
        ) {
            processed = decoded.resize({ width: MAX_IMAGE_WIDTH });
        }

        if (processed.encode) {
            const encoded = await processed.encode(OPTIMIZED_TYPE, { quality: OPTIMIZED_QUALITY });
            return {
                blob: new Blob([encoded], { type: OPTIMIZED_TYPE }),
                contentType: OPTIMIZED_TYPE,
                extension: OPTIMIZED_EXTENSION,
            };
        }
    } catch (error) {
        console.warn('Image optimization failed, using original file.', error);
    }

    const fallbackType = file.type || 'image/jpeg';
    return {
        blob: new Blob([buffer], { type: fallbackType }),
        contentType: fallbackType,
        extension: getExtensionFromType(fallbackType),
    };
}

function buildUploadFile(
    original: Blob,
    optimized: { blob: Blob; contentType: string; extension: string }
): File | Blob {
    if (typeof File === 'undefined') {
        return optimized.blob;
    }
    const baseName =
        original instanceof File ? stripExtension(original.name) : `blog-image-${Date.now()}`;
    const safeName = sanitizeFilename(baseName);
    return new File([optimized.blob], `${safeName}.${optimized.extension}`, {
        type: optimized.contentType,
    });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (error) {
        console.error('Admin blog upload parse error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid form data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const uploadCandidate = formData.get('image') ?? formData.get('file');

    if (!uploadCandidate || !isBlobLike(uploadCandidate)) {
        return new Response(JSON.stringify({ success: false, error: 'Image file is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const validation = validateFile(uploadCandidate, MAX_UPLOAD_MB);
    if (!validation.valid) {
        return new Response(
            JSON.stringify({ success: false, error: validation.error || 'Invalid file' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const optimized = await optimizeImage(uploadCandidate);
        const uploadFile = buildUploadFile(uploadCandidate, optimized);

        const uploadResult = await uploadToR2(env, uploadFile, BLOG_IMAGE_FOLDER);
        if (!uploadResult.success || !uploadResult.url) {
            return new Response(
                JSON.stringify({ success: false, error: uploadResult.error || 'Upload failed' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Image uploaded',
                url: uploadResult.url,
                key: uploadResult.key,
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Admin blog upload error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'Failed to upload image' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
