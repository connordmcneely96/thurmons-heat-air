import { requireAuth } from '../../../lib/session';
import { Env, ProjectPhoto } from '../../../types';
import { uploadToR2 } from '../../../lib/r2-upload';
import { sendEmail, getProjectPhotoNotificationEmail } from '../../../lib/email';

// GET /api/projects/:id/photos - Get all photos for a project
export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) {
            return authResult;
        }

        const projectId = params.id as string;

        // Verify customer owns this project (unless admin)
        const project = await env.DB.prepare(`
            SELECT * FROM projects WHERE id = ?
        `).bind(projectId).first();

        if (!project) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Project not found',
            }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // Check if customer owns project (customer_id matches session userId)
        if (project.customer_id !== authResult.userId && authResult.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: 'You do not have access to this project',
            }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        // Fetch all photos for this project
        const photos = await env.DB.prepare(`
            SELECT * FROM project_photos
            WHERE project_id = ?
            ORDER BY
                CASE phase
                    WHEN 'before' THEN 1
                    WHEN 'progress' THEN 2
                    WHEN 'after' THEN 3
                    ELSE 4
                END,
                uploaded_at ASC
        `).bind(projectId).all();

        return new Response(JSON.stringify({
            success: true,
            photos: photos.results || [],
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Get photos error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to fetch photos',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};

// POST /api/projects/:id/photos - Upload a photo
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    try {
        const authResult = await requireAuth(request, env);
        if (authResult instanceof Response) {
            return authResult;
        }

        const projectId = params.id as string;

        // Verify project exists and customer has access
        const project: any = await env.DB.prepare(`
            SELECT p.*, c.name as customer_name, c.email as customer_email
            FROM projects p
            LEFT JOIN customers c ON p.customer_id = c.id
            WHERE p.id = ?
        `).bind(projectId).first();

        if (!project) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Project not found',
            }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        // Check if customer owns project (customer_id matches session userId)
        if (project.customer_id !== authResult.userId && authResult.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                error: 'You do not have access to this project',
            }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        const caption = formData.get('caption') as string | null;
        const phase = formData.get('phase') as 'before' | 'progress' | 'after' | null;

        if (!file || !(file instanceof File)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No file provided',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Validate file (max 10MB, allow jpg, jpeg, png, heic)
        if (file.size > 10 * 1024 * 1024) {
            return new Response(JSON.stringify({
                success: false,
                error: 'File too large. Max size is 10MB.',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid file type. Please upload JPG, PNG, or HEIC.',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Check photo limit (max 20 per project)
        const photoCount: any = await env.DB.prepare(`
            SELECT COUNT(*) as count FROM project_photos WHERE project_id = ?
        `).bind(projectId).first();

        if (photoCount && photoCount.count >= 20) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Maximum of 20 photos per project reached',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Determine uploader type
        const uploaderType = authResult.role === 'admin' ? 'business' : 'customer';

        // Upload to R2
        const folder = `projects/${projectId}/${uploaderType}`;
        const uploadResult = await uploadToR2(env, file, folder);

        if (!uploadResult.success) {
            return new Response(JSON.stringify({
                success: false,
                error: uploadResult.error || 'Upload failed',
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Save to database
        const result = await env.DB.prepare(`
            INSERT INTO project_photos (
                project_id, photo_url, uploader_type, uploader_id, caption, phase
            ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            projectId,
            uploadResult.url,
            uploaderType,
            authResult.userId,
            caption || null,
            phase || null
        ).run();

        if (!result.success) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Failed to save photo',
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Send notification email (don't fail if this fails)
        try {
            if (uploaderType === 'customer') {
                // Notify business when customer uploads
                const notificationEmail = env.NOTIFICATION_EMAIL || 'karson@evergrowlandscaping.com';
                await sendEmail(env, {
                    to: notificationEmail,
                    subject: `New Photos Added - Project #${projectId}`,
                    html: getProjectPhotoNotificationEmail({
                        projectId: Number(projectId),
                        uploaderName: project.customer_name || 'Customer',
                        uploaderType: 'customer',
                        photoUrl: uploadResult.url!,
                        caption: caption || undefined,
                    }),
                });
            } else {
                // Notify customer when business uploads
                if (project.customer_email) {
                    await sendEmail(env, {
                        to: project.customer_email,
                        subject: `New Photos Added to Your Project`,
                        html: getProjectPhotoNotificationEmail({
                            projectId: Number(projectId),
                            uploaderName: 'Evergrow Landscaping',
                            uploaderType: 'business',
                            photoUrl: uploadResult.url!,
                            caption: caption || undefined,
                        }),
                    });
                }
            }
        } catch (emailError) {
            console.error('Failed to send photo notification email:', emailError);
        }

        return new Response(JSON.stringify({
            success: true,
            photo: {
                id: result.meta.last_row_id,
                project_id: projectId,
                photo_url: uploadResult.url,
                uploader_type: uploaderType,
                uploader_id: authResult.userId,
                caption,
                phase,
                uploaded_at: new Date().toISOString(),
            },
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Upload photo error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to upload photo',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
