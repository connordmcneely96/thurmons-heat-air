import { Env } from '../types';

interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}

/**
 * Upload a file to Cloudflare R2 storage
 * @param env - Worker environment with R2_BUCKET binding
 * @param file - File or Blob to upload
 * @param folder - Destination folder (e.g., 'quotes', 'projects', 'blog')
 * @returns Upload result with URL and key
 */
export async function uploadToR2(
    env: Env,
    file: File | Blob,
    folder: string = 'uploads'
): Promise<UploadResult> {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const extension = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const key = `${folder}/${timestamp}-${randomStr}.${extension}`;

        // Upload to R2
        await env.R2_BUCKET.put(key, file, {
            httpMetadata: {
                contentType: file.type || 'image/jpeg',
            },
        });

        // Return URL served through our Pages function proxy
        const url = `/api/assets/${key}`;

        return {
            success: true,
            url,
            key,
        };
    } catch (error) {
        console.error('R2 upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Delete a file from R2 storage
 * @param env - Worker environment with R2_BUCKET binding
 * @param key - File key to delete
 * @returns True if deletion successful
 */
export async function deleteFromR2(env: Env, key: string): Promise<boolean> {
    try {
        await env.R2_BUCKET.delete(key);
        return true;
    } catch (error) {
        console.error('R2 delete error:', error);
        return false;
    }
}

/**
 * Get a file from R2 storage
 * @param env - Worker environment with R2_BUCKET binding
 * @param key - File key to retrieve
 * @returns R2 object or null if not found
 */
export async function getFromR2(env: Env, key: string): Promise<R2ObjectBody | null> {
    try {
        const object = await env.R2_BUCKET.get(key);
        return object;
    } catch (error) {
        console.error('R2 get error:', error);
        return null;
    }
}

/**
 * List files in R2 storage with optional prefix
 * @param env - Worker environment with R2_BUCKET binding
 * @param prefix - Optional prefix to filter files (e.g., 'quotes/')
 * @param limit - Maximum number of files to return (default 1000)
 * @returns List of R2 objects
 */
export async function listFromR2(
    env: Env,
    prefix?: string,
    limit: number = 1000
): Promise<R2Objects> {
    try {
        const options: R2ListOptions = { limit };
        if (prefix) {
            options.prefix = prefix;
        }
        return await env.R2_BUCKET.list(options);
    } catch (error) {
        console.error('R2 list error:', error);
        throw error;
    }
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default 10MB)
 * @param allowedTypes - Allowed MIME types (default: images)
 * @returns Validation result
 */
export function validateFile(
    file: File | Blob,
    maxSizeMB: number = 10,
    allowedTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
): { valid: boolean; error?: string } {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        };
    }

    return { valid: true };
}
