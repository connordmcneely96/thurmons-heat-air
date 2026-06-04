import { Env } from '../../types';
import { rateLimitMiddleware } from '../../lib/cache';
import { getNewsletterWelcomeEmail, sendEmail } from '../../lib/email';
import { validateNewsletterSubscribePayload } from '../../lib/validation';

const SUBSCRIBE_LIMIT = 3;
const SUBSCRIBE_WINDOW_SECONDS = 60 * 60;
const DEFAULT_SOURCE = 'website';
const UNSUBSCRIBE_BASE_URL = 'https://evergrowlandscaping.pages.dev/unsubscribe'; // Method to be updated with real domain

interface NewsletterRecord {
    id: number;
    status: string;
    unsubscribed_at?: string | null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const rateLimitResponse = await rateLimitMiddleware(
            request,
            env,
            SUBSCRIBE_LIMIT,
            SUBSCRIBE_WINDOW_SECONDS
        );

        if (rateLimitResponse) {
            return rateLimitResponse;
        }

        let body: unknown;
        try {
            body = await request.json();
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid JSON body',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const validation = validateNewsletterSubscribePayload(body);
        if (!validation.success || !validation.data) {
            return new Response(JSON.stringify({
                success: false,
                error: validation.errors[0] || 'Invalid request',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const { email, name, source } = validation.data;
        const existing = await env.DB.prepare(
            `
        SELECT id, status, unsubscribed_at
        FROM newsletter_subscribers
        WHERE email = ?
        LIMIT 1
      `
        )
            .bind(email)
            .first<NewsletterRecord>();

        if (existing && existing.status === 'active') {
            return new Response(JSON.stringify({
                success: true,
                message: "You're already subscribed to our newsletter.",
            }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (existing) {
            const updateResult = await env.DB.prepare(
                `
          UPDATE newsletter_subscribers
          SET name = COALESCE(?, name),
          source = COALESCE(?, source),
          subscribed_at = CURRENT_TIMESTAMP,
          unsubscribed_at = NULL,
          status = 'active'
        WHERE email = ?
      `
            )
                .bind(name ?? null, source ?? null, email)
                .run();

            if (!updateResult.success) {
                throw new Error('Failed to update newsletter subscription');
            }
        } else {
            const insertResult = await env.DB.prepare(
                `
          INSERT INTO newsletter_subscribers (email, name, source, status)
          VALUES (?, ?, ?, 'active')
        `
            )
                .bind(email, name ?? null, source ?? DEFAULT_SOURCE)
                .run();

            if (!insertResult.success) {
                throw new Error('Failed to save newsletter subscription');
            }
        }

        const unsubscribeUrl = buildUnsubscribeUrl(email);
        const emailHtml = getNewsletterWelcomeEmail({
            name: name ?? undefined,
            unsubscribeUrl,
        });

        const emailResult = await sendEmail(env, {
            to: email,
            subject: 'Welcome to Evergrow Landscaping Updates',
            html: emailHtml,
        });

        if (!emailResult.success) {
            throw new Error(emailResult.error || 'Failed to send welcome email');
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Thanks for subscribing! Check your email for a welcome message.',
        }), { status: 201, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to subscribe',
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

function buildUnsubscribeUrl(email: string): string {
    const url = new URL(UNSUBSCRIBE_BASE_URL);
    url.searchParams.set('email', email);
    return url.toString();
}
