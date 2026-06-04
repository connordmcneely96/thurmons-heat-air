import { uploadToR2, validateFile } from '../../lib/r2-upload';
import { Env } from '../../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No file provided',
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Validate file (max 10MB, allow jpg, jpeg, png, heic)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        const validation = validateFile(file, 10, allowedTypes);

        if (!validation.valid) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: validation.error,
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate folder path with date
        const now = new Date();
        const dateFolder = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const folder = `quotes/${dateFolder}`;

        // Upload to R2
        const uploadResult = await uploadToR2(env, file, folder);

        if (!uploadResult.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: uploadResult.error || 'Upload failed',
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                url: uploadResult.url,
                key: uploadResult.key,
            }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Photo upload error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to upload photo',
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
