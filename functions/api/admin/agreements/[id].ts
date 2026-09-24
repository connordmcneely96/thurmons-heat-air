import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

const VALID_STATUSES = ['new', 'scheduled', 'active', 'cancelled'];

export const onRequestPatch: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const auth = await requireAdmin(request, env);
    if (auth instanceof Response) return auth;

    const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid agreement ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const body = (await request.json().catch(() => ({}))) as { status?: string; notes?: string };
    const status = typeof body.status === 'string' && VALID_STATUSES.includes(body.status) ? body.status : null;
    const notes = typeof body.notes === 'string' ? body.notes.slice(0, 2000) : null;
    if (!status && notes === null) {
        return new Response(JSON.stringify({ success: false, error: 'Nothing to update' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    await env.DB.prepare(
        `UPDATE service_agreements SET status = COALESCE(?, status), notes = COALESCE(?, notes) WHERE id = ?`
    ).bind(status, notes, id).run();

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
};
