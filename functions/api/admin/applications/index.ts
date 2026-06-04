import { requireAdmin } from '../../../lib/session';
import { Env } from '../../../types';

interface ApplicationRow {
    id: number;
    name: string;
    email: string;
    phone: string;
    city_state: string;
    position: string;
    willing_to_travel: number;
    has_license: number;
    years_experience: number | null;
    equipment_skills: string | null;
    resume_url: string | null;
    cover_letter: string | null;
    availability_date: string | null;
    status: string;
    submitted_at: string;
    updated_at: string | null;
}

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
        const status = url.searchParams.get('status');

        const validStatuses = ['pending', 'reviewing', 'interviewed', 'accepted', 'rejected', 'withdrawn'];
        const statusFilter = status && validStatuses.includes(status) ? status : null;

        const rows = await env.DB.prepare(
            `SELECT id, name, email, phone, city_state, position,
                    willing_to_travel, has_license, years_experience,
                    equipment_skills, resume_url, cover_letter, availability_date,
                    status, submitted_at, updated_at
             FROM job_applications
             WHERE (? IS NULL OR status = ?)
             ORDER BY submitted_at DESC
             LIMIT ? OFFSET ?`
        ).bind(statusFilter, statusFilter, limit, offset).all<ApplicationRow>();

        const applications = (rows.results || []).map(row => {
            let skills: string[] = [];
            try { skills = row.equipment_skills ? JSON.parse(row.equipment_skills) : []; } catch { skills = []; }
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                cityState: row.city_state,
                position: row.position,
                willingToTravel: row.willing_to_travel === 1,
                hasLicense: row.has_license === 1,
                yearsExperience: row.years_experience,
                equipmentSkills: skills,
                resumeUrl: row.resume_url,
                coverLetter: row.cover_letter,
                availabilityDate: row.availability_date,
                status: row.status,
                submittedAt: row.submitted_at,
                updatedAt: row.updated_at,
            };
        });

        return new Response(JSON.stringify({ success: true, applications }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Admin applications list error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to load applications' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
