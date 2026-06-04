import { sendEmail } from '../lib/email';

interface Env {
    DB: D1Database;
    RESEND_API_KEY: string;
    NOTIFICATION_EMAIL?: string;
}

function getContactConfirmationEmail(data: { name: string }): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #e9ecef; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>We Got Your Message!</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.name)},</p>
          <p>Thank you for reaching out to Evergrow Landscaping! We've received your message and our team will review it shortly.</p>
          <p>We typically respond within <strong>24 hours</strong> during business days. If your request is urgent, you can also reach us directly at <a href="mailto:contact@evergrowlandscaping.com">contact@evergrowlandscaping.com</a>.</p>
          <p>We look forward to helping you create a beautiful outdoor space!</p>
          <p>Warm regards,<br><strong>The Evergrow Landscaping Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong> &bull; contact@evergrowlandscaping.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getContactNotificationEmail(data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    service_type?: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .field { margin-bottom: 20px; padding: 15px; background: white; border-left: 4px solid #4DB8AC; border-radius: 4px; }
        .label { font-weight: bold; color: #2E5A8F; display: block; margin-bottom: 5px; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #e9ecef; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Action required - respond within 24 hours</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">Name</span>
            <span class="value">${escapeHtml(data.name)}</span>
          </div>

          <div class="field">
            <span class="label">Email</span>
            <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
          </div>

          ${data.phone ? `
          <div class="field">
            <span class="label">Phone</span>
            <span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span>
          </div>
          ` : ''}

          ${data.service_type ? `
          <div class="field">
            <span class="label">Service Interest</span>
            <span class="value">${escapeHtml(data.service_type)}</span>
          </div>
          ` : ''}

          <div class="field">
            <span class="label">Message</span>
            <span class="value">${escapeHtml(data.message).replace(/\n/g, '<br>')}</span>
          </div>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Submitted at ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body: any = await request.json();
        const { name, email, phone, message, service_type } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Name, email, and message are required'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Server-side length limits to prevent abuse
        if (typeof name === 'string' && name.length > 200) {
            return new Response(JSON.stringify({ success: false, error: 'Name is too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (typeof phone === 'string' && phone.length > 30) {
            return new Response(JSON.stringify({ success: false, error: 'Phone number is too long' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        if (typeof message === 'string' && message.length > 5000) {
            return new Response(JSON.stringify({ success: false, error: 'Message must be 5000 characters or fewer' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email format'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Insert into database
        const result = await env.DB.prepare(`
      INSERT INTO contact_requests (name, email, phone, message, service_type, status)
      VALUES (?, ?, ?, ?, ?, 'new')
    `).bind(
            name.trim(),
            email.trim(),
            phone?.trim() || null,
            message.trim(),
            service_type?.trim() || null
        ).run();

        if (!result.success) {
            throw new Error('Failed to save contact request');
        }

        // Send email notification to business owner
        const notificationEmail = 'Karson@evergrowlandscaping.com';
        try {
            await sendEmail(env as any, {
                from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                to: notificationEmail,
                subject: `New Contact Form Submission – ${name.trim()}`,
                html: getContactNotificationEmail({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone?.trim(),
                    message: message.trim(),
                    service_type: service_type?.trim(),
                }),
                replyTo: email.trim(),
            });
        } catch (emailError) {
            // Log but don't fail the request if email fails
            console.error('Failed to send contact notification email:', emailError);
        }

        // Send confirmation auto-reply to customer
        try {
            await sendEmail(env as any, {
                from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                to: email.trim(),
                subject: 'We got your message – Evergrow Landscaping',
                html: getContactConfirmationEmail({ name: name.trim() }),
            });
        } catch (emailError) {
            console.error('Failed to send contact confirmation email:', emailError);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Thank you for contacting us! We will get back to you within 24 hours.',
        }), { headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Contact form error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Failed to submit form'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
