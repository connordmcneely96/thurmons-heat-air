import { Env } from '../../types';
import { sendEmail, getJobApplicationNotificationEmail, getJobApplicationConfirmationEmail } from '../../lib/email';

interface ApplicationData {
    name: string;
    email: string;
    phone: string;
    cityState: string;
    position: string;
    willingToTravel: string;
    hasLicense: string;
    yearsExperience: string;
    equipmentSkills: string[];
    resumeUrl: string;
    coverLetter: string;
    availabilityDate: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const data = await request.json() as ApplicationData;

        // Validate required fields
        if (!data.name || !data.email || !data.phone || !data.cityState || !data.position) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!data.willingToTravel || !data.hasLicense || !data.yearsExperience) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Convert boolean strings to integers
        const willingToTravel = data.willingToTravel === 'yes' ? 1 : 0;
        const hasLicense = data.hasLicense === 'yes' ? 1 : 0;

        // Convert equipment skills array to JSON string
        const equipmentSkillsJson = data.equipmentSkills && data.equipmentSkills.length > 0
            ? JSON.stringify(data.equipmentSkills)
            : null;

        // Insert application into database
        const result = await env.DB.prepare(`
            INSERT INTO job_applications (
                name,
                email,
                phone,
                city_state,
                position,
                willing_to_travel,
                has_license,
                years_experience,
                equipment_skills,
                resume_url,
                cover_letter,
                availability_date,
                status,
                submitted_at,
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
            data.name,
            data.email,
            data.phone,
            data.cityState,
            data.position,
            willingToTravel,
            hasLicense,
            parseInt(data.yearsExperience, 10),
            equipmentSkillsJson,
            data.resumeUrl || null,
            data.coverLetter || null,
            data.availabilityDate || null
        ).run();

        if (!result.success) {
            throw new Error('Failed to save application to database');
        }

        const applicationId = result.meta.last_row_id;

        // Send notification email to business
        try {
            await sendEmail(env, {
                from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                to: 'Karson@evergrowlandscaping.com',
                subject: `New Job Application – ${data.position} – ${data.name}`,
                html: getJobApplicationNotificationEmail({
                    applicationId: applicationId as number,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    cityState: data.cityState,
                    position: data.position,
                    willingToTravel: data.willingToTravel === 'yes',
                    hasLicense: data.hasLicense === 'yes',
                    yearsExperience: parseInt(data.yearsExperience, 10),
                    equipmentSkills: data.equipmentSkills,
                    resumeUrl: data.resumeUrl,
                    coverLetter: data.coverLetter,
                    availabilityDate: data.availabilityDate
                }),
            });
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
            // Don't fail the request if email fails
        }

        // Send confirmation email to applicant
        try {
            await sendEmail(env, {
                from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                to: data.email,
                subject: 'Application received – Evergrow Landscaping',
                html: getJobApplicationConfirmationEmail({
                    name: data.name,
                    position: data.position
                }),
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        return new Response(JSON.stringify({
            success: true,
            applicationId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Job application submission error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit application'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
