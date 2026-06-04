import { Env } from '../../types';
import { uploadToR2, validateFile } from '../../lib/r2-upload';

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const applicantName = formData.get('applicantName') as string;

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No file provided'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!applicantName) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Applicant name is required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Validate file (PDF only, max 5MB)
        const allowedTypes = ['application/pdf'];
        const validation = validateFile(file, 5, allowedTypes);

        if (!validation.valid) {
            return new Response(JSON.stringify({
                success: false,
                error: validation.error
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create folder path: resumes/{sanitized-name}-{timestamp}
        const timestamp = Date.now();
        const sanitizedName = applicantName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        const folder = `resumes/${sanitizedName}-${timestamp}`;

        // Upload to R2
        const uploadResult = await uploadToR2(env, file, folder);

        return new Response(JSON.stringify({
            success: true,
            url: uploadResult.url
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Resume upload error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to upload resume'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
