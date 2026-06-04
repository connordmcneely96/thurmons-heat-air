import {
    getCustomerFeedbackThankYouEmail,
    getFeedbackOwnerAlertEmail,
    getFeedbackOwnerReviewEmail,
    sendEmail,
} from '../../lib/email';
import { requireAuth } from '../../lib/session';
import { Env } from '../../types';

interface ProjectRow {
    id: number;
    customer_id: number;
    status: string;
}

interface CustomerRow {
    id: number;
    name: string;
    email: string;
    phone: string | null;
}

const MAX_FEEDBACK_LENGTH = 1000;
const OWNER_EMAIL_FALLBACK = 'karson@evergrowlandscaping.com';

function parsePositiveInt(value: unknown): number | null {
    if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
        return value;
    }
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
        const parsed = Number.parseInt(value, 10);
        if (Number.isInteger(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return null;
}

function parseRating(value: unknown): number | null {
    const parsed =
        typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
        return null;
    }
    return parsed;
}

function parseFeedback(
    value: unknown
): { success: true; value: string } | { success: false; error: string } {
    if (value === undefined || value === null) {
        return { success: true, value: '' };
    }
    if (typeof value !== 'string') {
        return { success: false, error: 'Feedback must be a string' };
    }
    const trimmed = value.trim();
    if (trimmed.length > MAX_FEEDBACK_LENGTH) {
        return { success: false, error: 'Feedback exceeds 1000 characters' };
    }
    return { success: true, value: trimmed };
}

function parseAllowDisplay(value: unknown): boolean | null {
    if (value === undefined || value === null) {
        return false;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    return null;
}

function normalizeStatus(status: string | null): string | null {
    if (!status) return null;
    return status.trim().toLowerCase().replace(/[_\s]+/g, '-');
}

async function sendCustomerThankYouEmail(
    env: Env,
    data: {
        email: string | undefined;
        name: string;
        rating: number;
        allowDisplay: boolean;
        feedback: string;
    }
): Promise<void> {
    if (!data.email) {
        return;
    }

    const emailHtml = getCustomerFeedbackThankYouEmail(data.name);

    const result = await sendEmail(env, {
        to: data.email,
        subject: 'Thank you for your feedback',
        html: emailHtml,
    });

    if (!result.success) {
        console.error('Feedback thank you email failed:', result.error);
    }
}

async function sendOwnerReviewEmail(
    env: Env,
    ownerEmail: string,
    data: {
        customerName: string;
        customerEmail: string | undefined;
        customerPhone: string | null;
        projectId: number;
        rating: number;
        feedback: string;
    }
): Promise<void> {
    const emailHtml = getFeedbackOwnerReviewEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        projectId: data.projectId,
        rating: data.rating,
        feedback: data.feedback,
    });

    const result = await sendEmail(env, {
        to: ownerEmail,
        subject: 'New feedback ready for review',
        html: emailHtml,
        replyTo: data.customerEmail,
    });

    if (!result.success) {
        console.error('Feedback owner review email failed:', result.error);
    }
}

async function sendOwnerAlertEmail(
    env: Env,
    ownerEmail: string,
    data: {
        customerName: string;
        customerEmail: string | undefined;
        customerPhone: string | null;
        projectId: number;
        rating: number;
        feedback: string;
    }
): Promise<void> {
    const emailHtml = getFeedbackOwnerAlertEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        projectId: data.projectId,
        rating: data.rating,
        feedback: data.feedback,
    });

    const result = await sendEmail(env, {
        to: ownerEmail,
        subject: 'Customer feedback requires follow-up',
        html: emailHtml,
        replyTo: data.customerEmail,
    });

    if (!result.success) {
        console.error('Feedback owner alert email failed:', result.error);
    }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const authResult = await requireAuth(request, env);
    if (authResult instanceof Response) {
        return authResult;
    }

    if (authResult.role !== 'customer') {
        return new Response(JSON.stringify({ success: false, error: 'Customer access required' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    if (!body || typeof body !== 'object') {
        return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { projectId, rating, feedback, allowDisplay } = body as Record<string, unknown>;
    const projectIdValue = parsePositiveInt(projectId);
    if (!projectIdValue) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid projectId' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ratingValue = parseRating(rating);
    if (ratingValue === null) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid rating (must be 1-5)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const feedbackResult = parseFeedback(feedback);
    if (!feedbackResult.success) {
        return new Response(JSON.stringify({ success: false, error: feedbackResult.error }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const allowDisplayValue = parseAllowDisplay(allowDisplay);
    if (allowDisplayValue === null) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid allowDisplay value' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const customerId = authResult.userId;

    try {
        const project = await env.DB.prepare(
            `
            SELECT id, customer_id, status
            FROM projects
            WHERE id = ?
            LIMIT 1
          `
        )
            .bind(projectIdValue)
            .first<ProjectRow>();

        if (!project) {
            return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (project.customer_id !== customerId) {
            return new Response(
                JSON.stringify({ success: false, error: 'Project does not belong to customer' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }

        if (normalizeStatus(project.status) !== 'completed') {
            return new Response(JSON.stringify({ success: false, error: 'Project not completed yet' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const existing = await env.DB.prepare(
            `
            SELECT id
            FROM testimonials
            WHERE project_id = ?
            LIMIT 1
          `
        )
            .bind(projectIdValue)
            .first<{ id: number }>();

        if (existing) {
            return new Response(
                JSON.stringify({ success: false, error: 'Feedback already submitted for this project' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const isFeatured = ratingValue >= 4 && allowDisplayValue ? 1 : 0;

        const insertResult = await env.DB.prepare(
            `
            INSERT INTO testimonials (
              customer_id,
              project_id,
              rating,
              feedback,
              is_featured,
              created_at
            ) VALUES (?, ?, ?, ?, ?, datetime('now'))
          `
        )
            .bind(customerId, projectIdValue, ratingValue, feedbackResult.value, isFeatured)
            .run();

        if (!insertResult.success) {
            throw new Error('Failed to create testimonial');
        }

        const customer = await env.DB.prepare(
            `
            SELECT id, name, email, phone
            FROM customers
            WHERE id = ?
            LIMIT 1
          `
        )
            .bind(customerId)
            .first<CustomerRow>();

        const customerName = customer?.name || authResult.name || 'Customer';
        const customerEmail = customer?.email || authResult.email;
        const customerPhone = customer?.phone || null;
        const ownerEmail = env.NOTIFICATION_EMAIL || OWNER_EMAIL_FALLBACK;

        await sendCustomerThankYouEmail(env, {
            email: customerEmail,
            name: customerName,
            rating: ratingValue,
            allowDisplay: allowDisplayValue,
            feedback: feedbackResult.value,
        });

        if (ratingValue >= 4 && allowDisplayValue) {
            await sendOwnerReviewEmail(env, ownerEmail, {
                customerName,
                customerEmail,
                customerPhone,
                projectId: projectIdValue,
                rating: ratingValue,
                feedback: feedbackResult.value,
            });
        }

        if (ratingValue < 4) {
            await sendOwnerAlertEmail(env, ownerEmail, {
                customerName,
                customerEmail,
                customerPhone,
                projectId: projectIdValue,
                rating: ratingValue,
                feedback: feedbackResult.value,
            });
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you for your feedback!',
                testimonial: {
                    id: insertResult.meta.last_row_id,
                    rating: ratingValue,
                    feedback: feedbackResult.value,
                    willBeDisplayed: ratingValue >= 4 && allowDisplayValue,
                },
            }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Customer feedback error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to submit feedback' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
