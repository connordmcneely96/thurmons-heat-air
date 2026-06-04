import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

const VALID_STATUSES = ['pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn'];

export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    const appId = parseInt(params.id as string, 10);
    if (!appId || appId <= 0) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid application ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const payload = body as Record<string, unknown>;
    const status = typeof payload.status === 'string' ? payload.status.trim().toLowerCase() : null;

    if (!status || !VALID_STATUSES.includes(status)) {
        return new Response(JSON.stringify({
            success: false,
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM job_applications WHERE id = ? LIMIT 1'
        ).bind(appId).first<{ id: number }>();

        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: 'Application not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const result = await env.DB.prepare(
            'UPDATE job_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(status, appId).run();

        if (!result.success) {
            throw new Error('Failed to update application status');
        }

        return new Response(JSON.stringify({ success: true, status }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin application PATCH error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to update application' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
