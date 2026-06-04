import { Resend } from 'resend';
import { Env } from '../types';

/**
 * Get configured Resend client instance
 * @param env - Worker environment with RESEND_API_KEY
 * @returns Resend client
 */
export function getResendClient(env: Env): Resend {
    if (!env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY not configured');
    }

    return new Resend(env.RESEND_API_KEY);
}

interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
    }>;
}

/**
 * Send an email via Resend
 * @param env - Worker environment
 * @param params - Email parameters
 * @returns Result with success status and email ID
 */
export async function sendEmail(
    env: Env,
    params: SendEmailParams
): Promise<{ success: boolean; id?: string; error?: string }> {
    // Check if Resend is configured
    if (!env.RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY not found in environment');
        return {
            success: false,
            error: 'Email service not configured (RESEND_API_KEY missing)'
        };
    }

    console.log('[Email] Resend API key found, attempting to send email to:', params.to);
    console.log('[Email] Email subject:', params.subject);

    try {
        const resend = new Resend(env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: params.from || 'Evergrow Landscaping <noreply@evergrowlandscaping.com>',
            to: params.to,
            subject: params.subject,
            html: params.html,
            replyTo: params.replyTo || 'contact@evergrowlandscaping.com',
            attachments: params.attachments,
        });

        if (error) {
            console.error('[Email] Resend API error:', JSON.stringify(error, null, 2));
            return { success: false, error: error.message };
        }

        console.log('[Email] Email sent successfully! ID:', data?.id);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error('[Email] Exception while sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================================================
// HELPERS
// ============================================================================

const PAYMENT_INVOICE_TYPE_LABELS: Record<string, string> = {
    deposit: 'Deposit Payment',
    balance: 'Balance Payment',
    full: 'Payment',
    additional: 'Additional Charge',
};

function getInvoiceTypeLabel(value?: string | null): string {
    if (!value) {
        return 'Payment';
    }
    const normalized = value.trim().toLowerCase();
    return PAYMENT_INVOICE_TYPE_LABELS[normalized] || toTitleCase(normalized);
}

function formatCurrency(amount: number): string {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    return `$${safeAmount.toFixed(2)}`;
}

function formatEmailDate(value?: Date | string): string | null {
    if (!value) {
        return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function toTitleCase(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatEmailText(value: string): string {
    return escapeHtml(value).replace(/\n/g, '<br>');
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Newsletter welcome email (to subscriber)
 */
export function getNewsletterWelcomeEmail(data: {
    name?: string;
    unsubscribeUrl: string;
}): string {
    const greetingName = data.name ? data.name : 'there';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 35px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 26px; }
        .content { padding: 30px 20px; background: white; }
        .content p { margin: 14px 0; }
        .highlight { background: #e7f3f5; padding: 18px; border-radius: 6px; border-left: 4px solid #4DB8AC; }
        .list { margin: 15px 0 0 18px; }
        .cta { display: inline-block; margin-top: 18px; background: #4DB8AC; color: white; padding: 12px 22px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        .footer a { color: #2E5A8F; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Evergrow Landscaping Updates</h1>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Seasonal tips and exclusive offers</p>
        </div>
        <div class="content">
          <p>Hi <strong>${greetingName}</strong>,</p>
          <p>Thank you for subscribing to Evergrow Landscaping updates! We are excited to share helpful insights and special promotions with you.</p>

          <div class="highlight">
            <strong>What you can expect:</strong>
            <ul class="list">
              <li>Seasonal lawn and landscape tips</li>
              <li>Exclusive discounts and promotions</li>
              <li>Project inspiration and before-and-after highlights</li>
            </ul>
          </div>

          <p>We respect your privacy and will never share your email with third parties.</p>
          <p>If you ever want to unsubscribe, you can do so here: <a href="${data.unsubscribeUrl}">Unsubscribe</a>.</p>

          <a href="https://evergrowlandscaping.com" class="cta">Visit Evergrow Landscaping</a>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Thank you for being part of our community.</p>
          <p style="margin-top: 12px;">
            <a href="${data.unsubscribeUrl}">Unsubscribe</a> if you no longer wish to receive updates.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Quote request notification email (to business owner)
 */
export function getQuoteRequestNotificationEmail(data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    zipCode?: string;
    serviceType: string;
    propertySize?: string;
    description?: string;
    photoUrls?: string[];
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
        .photos { margin-top: 20px; }
        .photos img { max-width: 200px; margin: 10px; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #e9ecef; border-radius: 0 0 8px 8px; }
        .urgent { background: #fff3cd; border-left-color: #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 New Quote Request</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Action required - review and respond</p>
        </div>
        <div class="content">
          <div class="field urgent">
            <span class="label">⚡ Priority</span>
            <span class="value">New quote request requires attention</span>
          </div>

          <div class="field">
            <span class="label">👤 Customer Name</span>
            <span class="value">${data.name}</span>
          </div>

          <div class="field">
            <span class="label">📧 Email</span>
            <span class="value"><a href="mailto:${data.email}">${data.email}</a></span>
          </div>

          ${data.phone ? `
          <div class="field">
            <span class="label">📱 Phone</span>
            <span class="value"><a href="tel:${data.phone}">${data.phone}</a></span>
          </div>
          ` : ''}

          ${data.address ? `
          <div class="field">
            <span class="label">📍 Address</span>
            <span class="value">${data.address}${data.city ? `, ${data.city}` : ''}${data.zipCode ? ` ${data.zipCode}` : ''}</span>
          </div>
          ` : ''}

          <div class="field">
            <span class="label">🛠️ Service Type</span>
            <span class="value">${data.serviceType}</span>
          </div>

          ${data.propertySize ? `
          <div class="field">
            <span class="label">📏 Property Size</span>
            <span class="value">${data.propertySize}</span>
          </div>
          ` : ''}

          ${data.description ? `
          <div class="field">
            <span class="label">📝 Description</span>
            <span class="value">${data.description.replace(/\n/g, '<br>')}</span>
          </div>
          ` : ''}

          ${data.photoUrls && data.photoUrls.length > 0 ? `
          <div class="field">
            <span class="label">📸 Photos Attached</span>
            <div class="photos">
              ${data.photoUrls.map((url, i) => `
                <a href="${url}" target="_blank">
                  <img src="${url}" alt="Photo ${i + 1}" style="max-width: 200px; border-radius: 4px;">
                </a>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Quote request submitted at ${new Date().toLocaleString()}</p>
          <p>Respond within 24 hours for best customer experience</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Quote request confirmation email (to customer)
 */
export function getQuoteRequestConfirmationEmail(name: string, serviceType: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; background: white; }
        .content p { margin: 15px 0; }
        .checklist { background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .checklist h3 { margin-top: 0; color: #2E5A8F; }
        .checklist ul { margin: 10px 0; padding-left: 25px; }
        .checklist li { margin: 8px 0; }
        .cta { background: #4DB8AC; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; margin: 20px 0; border-radius: 5px; font-weight: bold; }
        .cta:hover { background: #3da396; }
        .contact-box { background: #e7f3f5; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .contact-box strong { color: #2E5A8F; font-size: 18px; }
        .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Thanks for Your Quote Request!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>

          <p>Thank you for reaching out to Evergrow Landscaping! We've received your request for <strong>${serviceType}</strong> services and we're excited to help transform your outdoor space.</p>

          <div class="checklist">
            <h3>📋 What Happens Next:</h3>
            <ul>
              <li>✅ We'll review your request within 24 hours</li>
              <li>📞 One of our team members may reach out with questions</li>
              <li>💰 We'll provide a detailed, no-obligation quote</li>
              <li>📅 If you're happy with the quote, we'll schedule your project</li>
            </ul>
          </div>

          <p><strong>Why Choose Evergrow Landscaping?</strong></p>
          <ul>
            <li>🏆 Founded in 2023</li>
            <li>✅ Licensed & fully insured</li>
            <li>⭐ Highest-rated landscaping service in the area</li>
            <li>💯 100% satisfaction guarantee</li>
          </ul>

          <div class="contact-box">
            <p>Have questions? We're here to help!</p>
            <strong>📱 Call us: (405) 479-5794</strong>
            <p>📧 Email: contact@evergrowlandscaping.com</p>
          </div>

          <p>We look forward to working with you!</p>

          <p>Best regards,<br>
          <strong>The Evergrow Landscaping Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Serving El Dorado, AR & Oklahoma City</p>
          <p>Licensed & Insured | Family-Owned</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This email was sent because you requested a quote at evergrowlandscaping.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentReceiptEmail(data: {
    name?: string | null;
    amount: number;
    invoiceType?: string | null;
    projectId?: number | string | null;
    paidAt?: Date | string;
}): string {
    const customerName = escapeHtml(data.name || 'there');
    const amount = formatCurrency(data.amount);
    const invoiceLabel = getInvoiceTypeLabel(data.invoiceType);
    const paidAt = formatEmailDate(data.paidAt) || formatEmailDate(new Date());
    const projectLine = data.projectId
        ? `<p><strong>Project ID:</strong> ${escapeHtml(String(data.projectId))}</p>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 32px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px 20px; background: white; }
        .receipt-box { background: #e7f3f5; padding: 20px; border-radius: 6px; border-left: 4px solid #4DB8AC; }
        .amount { font-size: 32px; color: #2E5A8F; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Received</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Thank you for your payment. This email confirms we received your ${escapeHtml(invoiceLabel)}.</p>
          <div class="receipt-box">
            <p style="margin: 0;">Amount Paid</p>
            <div class="amount">${amount}</div>
            <p><strong>Paid on:</strong> ${paidAt}</p>
            ${projectLine}
          </div>
          <p>If you have any questions, reply to this email and we will help.</p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Thank you for your business.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentFailureEmail(data: {
    name?: string;
    amount: number;
    reason?: string;
    retryUrl?: string;
}): string {
    const customerName = escapeHtml(data.name || 'there');
    const amount = formatCurrency(data.amount);
    const reasonLine = data.reason
        ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>`
        : '';
    const retryLink = data.retryUrl
        ? `<a href="${escapeHtml(data.retryUrl)}" style="background: #4DB8AC; color: white; padding: 12px 22px; text-decoration: none; border-radius: 4px; display: inline-block;">Retry Payment</a>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8A2E2E; color: white; padding: 32px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px 20px; background: white; }
        .panel { background: #fff3cd; padding: 18px; border-radius: 6px; border-left: 4px solid #ffc107; }
        .amount { font-size: 28px; color: #8A2E2E; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>We were unable to process your payment.</p>
          <div class="panel">
            <p style="margin: 0;">Amount Due</p>
            <div class="amount">${amount}</div>
            ${reasonLine}
          </div>
          ${retryLink ? `<p style="margin-top: 20px;">${retryLink}</p>` : ''}
          <p>If you need help, reply to this email and we will assist you.</p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>contact@evergrowlandscaping.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentFailureAlertEmail(data: {
    customerName: string;
    customerEmail?: string;
    amount: number;
    projectId?: number | string | null;
    paymentIntentId: string;
    reason?: string;
}): string {
    const amount = formatCurrency(data.amount);
    const projectLine = data.projectId ? `<p><strong>Project ID:</strong> ${escapeHtml(String(data.projectId))}</p>` : '';
    const reasonLine = data.reason ? `<p><strong>Failure reason:</strong> ${escapeHtml(data.reason)}</p>` : '';
    const customerEmail = data.customerEmail ? escapeHtml(data.customerEmail) : 'Unavailable';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8A2E2E; color: white; padding: 28px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 26px 20px; background: white; }
        .panel { background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 12px 0; }
        .label { font-weight: bold; color: #8A2E2E; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Failure Alert</h1>
        </div>
        <div class="content">
          <div class="panel">
            <p class="label">Customer</p>
            <p>${escapeHtml(data.customerName)}</p>
            <p>Email: ${customerEmail}</p>
          </div>
          <div class="panel">
            <p class="label">Amount</p>
            <p>${amount}</p>
            ${projectLine}
            <p><strong>Payment Intent:</strong> ${escapeHtml(data.paymentIntentId)}</p>
            ${reasonLine}
          </div>
          <p>Please follow up with the customer to complete payment.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getRefundConfirmationEmail(data: {
    name?: string | null;
    amount: number;
    reason?: string | null;
}): string {
    const customerName = escapeHtml(data.name || 'there');
    const amount = formatCurrency(data.amount);
    const reasonLine = data.reason
        ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2E5A8F; color: white; padding: 28px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 26px 20px; background: white; }
        .panel { background: #e7f3f5; padding: 18px; border-radius: 6px; border-left: 4px solid #4DB8AC; }
        .amount { font-size: 26px; color: #2E5A8F; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${customerName}</strong>,</p>
          <p>Your refund has been processed.</p>
          <div class="panel">
            <p style="margin: 0;">Refund Amount</p>
            <div class="amount">${amount}</div>
            ${reasonLine}
          </div>
          <p>If you have questions, reply to this email.</p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getQuoteEmail(data: {
    customerName: string;
    serviceType: string;
    description?: string | null;
    quotedAmount: number;
    notes?: string | null;
    timeline?: string | null;
    terms?: string | null;
    acceptanceUrl: string;
    validUntilDisplay: string;
    requiresDeposit: boolean;
    termsUrl: string;
}): string {
    const amount = formatCurrency(data.quotedAmount);
    const descriptionBlock = data.description
        ? `<div class="section"><div class="label">Project Description</div><div class="value">${formatEmailText(data.description)}</div></div>`
        : '';
    const notesBlock = data.notes
        ? `<div class="section"><div class="label">Notes</div><div class="value">${formatEmailText(data.notes)}</div></div>`
        : '';
    const timelineBlock = data.timeline
        ? `<div class="section"><div class="label">Estimated Timeline</div><div class="value">${formatEmailText(data.timeline)}</div></div>`
        : '';
    const depositNote = data.requiresDeposit
        ? '<div class="alert"><strong>Note:</strong> A 50% deposit will be required to schedule this project upon acceptance.</div>'
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: #24663B; color: white; padding: 32px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; margin-bottom: 24px; }
        .quote-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .quote-amount { font-size: 36px; font-weight: bold; color: #24663B; margin: 8px 0; }
        .quote-label { text-transform: uppercase; font-size: 12px; color: #6B7280; letter-spacing: 0.05em; font-weight: 600; }
        .section { margin-bottom: 20px; }
        .label { font-weight: 600; color: #111827; font-size: 14px; margin-bottom: 4px; }
        .value { color: #4B5563; white-space: pre-wrap; }
        .alert { background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 24px 0; color: #92400E; font-size: 14px; }
        .cta-button { display: inline-block; background: #FBB017; color: #1F1F1F; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; width: 100%; box-sizing: border-box; }
        .cta-button:hover { background: #F59E0B; }
        .footer { background: #F9FAFB; padding: 24px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
        .footer a { color: #24663B; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quote is Ready</h1>
        </div>
        <div class="content">
          <p class="greeting">Hi ${escapeHtml(data.customerName)},</p>
          <p>We are pleased to provide the following quote for <strong>${escapeHtml(data.serviceType)}</strong>.</p>
          
          <div class="quote-box">
            <div class="quote-label">Total Quote Amount</div>
            <div class="quote-amount">${amount}</div>
            <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">Valid until ${escapeHtml(data.validUntilDisplay)}</div>
          </div>

          ${descriptionBlock}
          ${notesBlock}
          ${timelineBlock}
          ${depositNote}

          <div style="margin-top: 32px;">
            <a href="${data.acceptanceUrl}" class="cta-button">View & Accept Quote</a>
          </div>

          <p style="margin-top: 24px; font-size: 14px; text-align: center; color: #6B7280;">
            By accepting this quote, you agree to our <a href="${data.termsUrl}" style="color: #24663B; text-decoration: underline;">Terms of Service</a>.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Evergrow Landscaping</p>
          <p>Questions? Reply to this email or call us at (405) 479-5794</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getProjectCancellationEmail(data: {
    name: string;
    serviceType: string;
    reason?: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Project Cancellation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #E53E3E; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Update</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.name)},</p>
          <p>This email is to confirm that your project for <strong>${escapeHtml(data.serviceType)}</strong> has been cancelled.</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>` : ''}
          <p>If you have any questions or would like to reschedule, please contact us.</p>
          <p>Best regards,<br>Evergrow Landscaping</p>
        </div>
      </div>
    </body>
    </html>
    `;
}
export function getProjectCompletionEmail(data: {
    name: string;
    serviceType: string;
    summary?: string;
    completionNotes?: string;
    completionPhotos?: string[];
    balanceAmount?: number | null;
    paymentUrl?: string | null;
    dueDate?: string | null;
    feedbackUrl: string;
    reviewUrl: string;
}): string {
    const photosBlock = data.completionPhotos && data.completionPhotos.length > 0
        ? `
        <div style="margin: 20px 0;">
          <strong>Project Photos:</strong><br>
          ${data.completionPhotos.map(url => `<img src="${url}" style="max-width: 200px; margin: 5px; border-radius: 4px;" />`).join('')}
        </div>`
        : '';

    const paymentBlock = data.balanceAmount && data.balanceAmount > 0 && data.paymentUrl
        ? `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FBB017;">
            <p style="margin-top: 0;"><strong>Remaining Balance Due:</strong> ${formatCurrency(data.balanceAmount)}</p>
            <p>Due Date: ${data.dueDate || 'Upon Receipt'}</p>
            <a href="${data.paymentUrl}" style="display: inline-block; background: #24663B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Pay Balance</a>
        </div>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Project Completed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Completed! 🌿</h1>
        </div>
        <div class="content">
          <p>We are happy to let you know that your <strong>${escapeHtml(data.serviceType)}</strong> project has been completed.</p>
          
          ${data.summary ? `<p><strong>Summary:</strong> ${escapeHtml(data.summary)}</p>` : ''}
          ${data.completionNotes ? `<p><strong>Notes:</strong> ${escapeHtml(data.completionNotes)}</p>` : ''}
          ${photosBlock}
          ${paymentBlock}

          <p>We hope you love your new outdoor space! If you have a moment, we would appreciate your feedback.</p>
          <p>
            <a href="${data.feedbackUrl}">Share Feedback</a> | 
            <a href="${data.reviewUrl}">Leave a Google Review</a>
          </p>

          <p>Thank you for choosing Evergrow Landscaping!</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getDepositInvoiceEmail(data: {
    customerName: string;
    projectName: string;
    depositAmount: number;
    totalAmount: number;
    invoiceUrl: string;
    dueDate: string;
}): string {
    const depositAmount = formatCurrency(data.depositAmount);
    const totalAmount = formatCurrency(data.totalAmount);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { background: #24663B; color: white; padding: 32px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; margin-bottom: 24px; }
        .invoice-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; margin-bottom: 24px; }
        .amount-large { font-size: 36px; font-weight: bold; color: #24663B; margin: 8px 0; }
        .label { text-transform: uppercase; font-size: 12px; color: #6B7280; letter-spacing: 0.05em; font-weight: 600; }
        .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .cta-button { display: inline-block; background: #FBB017; color: #1F1F1F; text-decoration: none; padding: 16px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; width: 100%; box-sizing: border-box; }
        .cta-button:hover { background: #F59E0B; }
        .footer { background: #F9FAFB; padding: 24px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Deposit Invoice</h1>
        </div>
        <div class="content">
          <p class="greeting">Hi ${escapeHtml(data.customerName)},</p>
          <p>Thank you for accepting the quote! To secure your spot on our schedule, please make the deposit payment for <strong>${escapeHtml(data.projectName)}</strong>.</p>
          
          <div class="invoice-box">
            <div class="label">Deposit Due</div>
            <div class="amount-large">${depositAmount}</div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              <div class="row">
                <span style="color: #6B7280;">Project Total</span>
                <span>${totalAmount}</span>
              </div>
              <div class="row">
                <span style="color: #6B7280;">Due Date</span>
                <span>${data.dueDate}</span>
              </div>
            </div>
          </div>

          <a href="${data.invoiceUrl}" class="cta-button">Pay Deposit Securely</a>

          <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">
            Once we receive your deposit, we will contact you to confirm the start date.
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Evergrow Landscaping</p>
          <p>Questions? Reply to this email or call us at (405) 479-5794</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getProjectFeedbackRequestEmail(data: {
    name: string;
    serviceType: string;
    feedbackUrl: string;
    reviewUrl: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>How did we do?</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; background: #FBB017; color: #1F1F1F; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>How did we do?</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.name)},</p>
          <p>Thank you again for choosing Evergrow Landscaping for your ${escapeHtml(data.serviceType)}.</p>
          <p>Our goal is to provide 5-star service to every customer. We would love to hear about your experience!</p>
          
          <div style="text-center: center;">
            <a href="${data.reviewUrl}" class="btn">Leave a Google Review</a>
          </div>

          <p>Or if you have specific feedback for us directly: <a href="${data.feedbackUrl}">Complete Feedback Form</a></p>
          
          <p>We appreciate your business!</p>
          <p>The Evergrow Landscaping Team</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getProjectScheduledEmail(data: {
    name: string;
    serviceType: string;
    scheduledDate: string;
    scheduledTime?: string;
    serviceDetails?: string;
    depositAmount?: number | null;
    depositDueDate?: string;
    paymentLink?: string;
}): string {
    const timeInfo = data.scheduledTime ? ` at ${data.scheduledTime}` : '';
    const dateFormatted = new Date(data.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const depositBlock = data.depositAmount && data.depositAmount > 0 && data.paymentLink
        ? `
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #FBB017;">
            <p style="margin-top: 0;"><strong>Deposit Required:</strong> ${formatCurrency(data.depositAmount)}</p>
            <p>Due By: ${data.depositDueDate ? new Date(data.depositDueDate).toLocaleDateString() : 'Upon Receipt'}</p>
            <a href="${data.paymentLink}" style="display: inline-block; background: #24663B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Pay Deposit</a>
        </div>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Project Scheduled</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Project Scheduled 📅</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(data.name)},</p>
          <p>Great news! Your <strong>${escapeHtml(data.serviceType)}</strong> project has been scheduled.</p>
          
          <div style="background: #f0fdf4; padding: 15px; border-radius: 4px; border: 1px solid #bbf7d0; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #166534;">
              ${dateFormatted}${timeInfo}
            </p>
          </div>

          ${data.serviceDetails ? `<p><strong>Details:</strong> ${escapeHtml(data.serviceDetails)}</p>` : ''}
          
          ${depositBlock}

          <p>We are looking forward to working on your property!</p>
          <p>Best regards,<br>Evergrow Landscaping</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getCustomerFeedbackThankYouEmail(name: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Thank You for Your Feedback</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You!</h1>
        </div>
        <div class="content">
          <p>Hi ${escapeHtml(name)},</p>
          <p>Thank you so much for taking the time to share your feedback with us.</p>
          <p>We truly value our customers' input as it helps us continue to improve and provide the best possible service.</p>
          <p>If you have any further questions or concerns, please don't hesitate to reach out.</p>
          <p>Best regards,<br>The Evergrow Landscaping Team</p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getFeedbackOwnerAlertEmail(data: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string | null;
    rating: number;
    feedback: string;
    projectId?: number | null;
}): string {
    const projectLine = data.projectId ? `<p><strong>Project ID:</strong> ${data.projectId}</p>` : '';
    const emailLine = data.customerEmail ? `<p><strong>Email:</strong> ${escapeHtml(data.customerEmail)}</p>` : '';
    const phoneLine = data.customerPhone ? `<p><strong>Phone:</strong> ${escapeHtml(data.customerPhone)}</p>` : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>New Customer Feedback</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .rating { font-size: 24px; color: #FBB017; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Customer Feedback</h1>
        </div>
        <div class="content">
          <p><strong>Customer:</strong> ${escapeHtml(data.customerName)}</p>
          ${emailLine}
          ${phoneLine}
          ${projectLine}
          <p><strong>Rating:</strong> <span class="rating">${data.rating}/5</span></p>
          <p><strong>Feedback:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #FBB017; margin: 0;">
            ${escapeHtml(data.feedback).replace(/\n/g, '<br>')}
          </blockquote>
          
          <div style="margin-top: 20px; padding: 10px; background: #eef2f6; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              Please review this feedback in the admin portal.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getFeedbackOwnerReviewEmail(data: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string | null;
    rating: number;
    feedback: string;
    projectId?: number | null;
}): string {
    return getFeedbackOwnerAlertEmail({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        rating: data.rating,
        feedback: data.feedback,
        projectId: data.projectId
    });
}

/**
 * Project photo notification email
 */
export function getProjectPhotoNotificationEmail(data: {
    projectId: number;
    uploaderName: string;
    uploaderType: 'customer' | 'business';
    photoUrl: string;
    caption?: string;
}): string {
    const isCustomerUpload = data.uploaderType === 'customer';
    // const recipient = isCustomerUpload ? 'team' : 'customer'; // unused

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
        .photo { max-width: 100%; margin: 15px 0; border-radius: 8px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #e9ecef; border-radius: 0 0 8px 8px; }
        .cta { display: inline-block; margin: 20px 0; background: #4DB8AC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📸 New Photos Added</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Project #${data.projectId}</p>
        </div>
        <div class="content">
          <div class="field">
            <span class="label">${isCustomerUpload ? '👤 Customer Upload' : '🏢 Business Upload'}</span>
            <span class="value">${escapeHtml(data.uploaderName)} added new photos to Project #${data.projectId}</span>
          </div>

          ${data.caption ? `
          <div class="field">
            <span class="label">💬 Caption</span>
            <span class="value">${escapeHtml(data.caption)}</span>
          </div>
          ` : ''}

          <div class="field">
            <span class="label">📷 Photo</span>
            <a href="${data.photoUrl}" target="_blank">
              <img src="${data.photoUrl}" alt="Project photo" class="photo" />
            </a>
          </div>

          ${isCustomerUpload ? `
          <p style="text-align: center;">
            <a href="https://evergrowlandscaping.com/portal/projects/${data.projectId}" class="cta">View Project Photos</a>
          </p>
          ` : `
          <p style="text-align: center;">
            <a href="https://evergrowlandscaping.com/portal/projects/${data.projectId}" class="cta">View All Photos</a>
          </p>
          `}
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>${isCustomerUpload ? 'Review and respond to customer photos in your admin portal' : 'View your project progress photos anytime in your customer portal'}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Job application notification email (to business)
 */
export function getJobApplicationNotificationEmail(data: {
    applicationId: number;
    name: string;
    email: string;
    phone: string;
    cityState: string;
    position: string;
    willingToTravel: boolean;
    hasLicense: boolean;
    yearsExperience: number;
    equipmentSkills: string[];
    resumeUrl?: string;
    coverLetter?: string;
    availabilityDate?: string;
}): string {
    const skillsList = data.equipmentSkills && data.equipmentSkills.length > 0
        ? `<ul style="margin: 10px 0; padding-left: 25px;">${data.equipmentSkills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}</ul>`
        : '<p style="color: #666;">No equipment skills selected</p>';

    const resumeSection = data.resumeUrl
        ? `<div class="field">
         <span class="label">📎 Resume</span>
         <span class="value"><a href="${escapeHtml(data.resumeUrl)}" target="_blank" style="color: #4DB8AC; text-decoration: underline;">Download Resume (PDF)</a></span>
       </div>`
        : '<div class="field"><span class="label">📎 Resume</span><span class="value" style="color: #666;">No resume uploaded</span></div>';

    const coverLetterSection = data.coverLetter
        ? `<div class="field">
         <span class="label">✍️ Why Join Evergrow?</span>
         <span class="value">${escapeHtml(data.coverLetter).replace(/\n/g, '<br>')}</span>
       </div>`
        : '';

    const availabilitySection = data.availabilityDate
        ? `<div class="field">
         <span class="label">📅 Availability Start Date</span>
         <span class="value">${escapeHtml(data.availabilityDate)}</span>
       </div>`
        : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #24663B; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .field { margin-bottom: 20px; padding: 15px; background: white; border-left: 4px solid #4DB8AC; border-radius: 4px; }
        .label { font-weight: bold; color: #2E5A8F; display: block; margin-bottom: 5px; }
        .value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; background: #e9ecef; border-radius: 0 0 8px 8px; }
        .urgent { background: #fff3cd; border-left-color: #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💼 New Job Application</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px;">Application #${data.applicationId}</p>
        </div>
        <div class="content">
          <div class="field urgent">
            <span class="label">⚡ Priority</span>
            <span class="value">New job application requires review</span>
          </div>

          <div class="field">
            <span class="label">👤 Applicant Name</span>
            <span class="value">${escapeHtml(data.name)}</span>
          </div>

          <div class="field">
            <span class="label">📧 Email</span>
            <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span>
          </div>

          <div class="field">
            <span class="label">📱 Phone</span>
            <span class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></span>
          </div>

          <div class="field">
            <span class="label">📍 Current City/State</span>
            <span class="value">${escapeHtml(data.cityState)}</span>
          </div>

          <div class="field">
            <span class="label">💼 Position</span>
            <span class="value">${escapeHtml(data.position)}</span>
          </div>

          <div class="field">
            <span class="label">🚗 Willing to Travel Between Locations?</span>
            <span class="value">${data.willingToTravel ? '✅ Yes' : '❌ No'}</span>
          </div>

          <div class="field">
            <span class="label">🪪 Valid Driver's License?</span>
            <span class="value">${data.hasLicense ? '✅ Yes' : '❌ No'}</span>
          </div>

          <div class="field">
            <span class="label">📊 Years Experience in Landscaping</span>
            <span class="value">${data.yearsExperience} years</span>
          </div>

          <div class="field">
            <span class="label">🛠️ Equipment Skills</span>
            ${skillsList}
          </div>

          ${resumeSection}
          ${coverLetterSection}
          ${availabilitySection}
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Application submitted at ${new Date().toLocaleString()}</p>
          <p>Review application in your admin portal or contact applicant directly</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Job application confirmation email (to applicant)
 */
export function getJobApplicationConfirmationEmail(data: {
    name: string;
    position: string;
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
        .header { background: #24663B; color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; background: white; }
        .content p { margin: 15px 0; }
        .checklist { background: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .checklist h3 { margin-top: 0; color: #24663B; }
        .checklist ul { margin: 10px 0; padding-left: 25px; }
        .checklist li { margin: 8px 0; }
        .contact-box { background: #e7f3f5; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center; }
        .contact-box strong { color: #2E5A8F; font-size: 18px; }
        .footer { text-align: center; padding: 30px 20px; color: #666; font-size: 14px; background: #f8f9fa; border-radius: 0 0 8px 8px; }
        .footer p { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌿 Application Received!</h1>
        </div>
        <div class="content">
          <p>Hi <strong>${escapeHtml(data.name)}</strong>,</p>

          <p>Thank you for applying for the <strong>${escapeHtml(data.position)}</strong> position at Evergrow Landscaping! We've successfully received your application and appreciate your interest in joining our team.</p>

          <div class="checklist">
            <h3>📋 What Happens Next:</h3>
            <ul>
              <li>✅ We'll review your application within 5 business days</li>
              <li>📞 Qualified candidates will be contacted for a phone screening</li>
              <li>🤝 Selected applicants will be invited for an in-person interview</li>
              <li>💼 Final candidates will receive an offer to join our team</li>
            </ul>
          </div>

          <p><strong>Why Work at Evergrow Landscaping?</strong></p>
          <ul>
            <li>🏆 Family-owned business, owner-managed</li>
            <li>📍 Multi-location opportunities across AR & OK</li>
            <li>💯 Competitive pay and steady work</li>
            <li>📈 Opportunity to grow with an expanding company</li>
          </ul>

          <div class="contact-box">
            <p>Have questions about your application?</p>
            <strong>📱 Call us: (405) 479-5794</strong>
            <p>📧 Email: contact@evergrowlandscaping.com</p>
          </div>

          <p>We look forward to reviewing your application!</p>

          <p>Best regards,<br>
          <strong>The Evergrow Landscaping Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong></p>
          <p>Serving El Dorado, AR | Oklahoma City, OK</p>
          <p>Licensed & Insured | Family-Owned</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This email was sent because you applied for a position at evergrowlandscaping.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
