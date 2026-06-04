/**
 * Balance Due Reminder Cron Handler
 *
 * This endpoint is triggered daily at 8am CST (configured in wrangler.toml [triggers]).
 * It sends payment reminders to customers with balance invoices due in 2 days.
 *
 * To invoke manually (admin only): POST /api/cron/reminders
 * Cloudflare scheduled event invokes this logic via the scheduled() export below.
 */
import { sendEmail } from '../../lib/email';
import { Env } from '../../types';

interface ReminderRow {
    invoice_id: number;
    invoice_amount: number;
    due_date: string;
    customer_email: string;
    customer_name: string;
    service_type: string | null;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDateDisplay(dateStr: string): string {
    try {
        return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

function buildReminderEmail(params: {
    customerName: string;
    serviceType: string;
    amount: number;
    dueDate: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .amount-box { background: white; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #d97706; }
        .btn { display: inline-block; background: #2d6a4f; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #e9ecef; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Payment Reminder</h1>
        </div>
        <div class="content">
          <p>Hi ${params.customerName},</p>
          <p>This is a friendly reminder that your final balance for your <strong>${params.serviceType}</strong> is due in <strong>2 days</strong>.</p>
          <div class="amount-box">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Balance Due</p>
            <div class="amount">${formatCurrency(params.amount)}</div>
            <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Due by ${formatDateDisplay(params.dueDate)}</p>
          </div>
          <p style="text-align: center; margin: 24px 0;">
            <a href="https://evergrowlandscaping.com/portal/invoices" class="btn">Pay Now →</a>
          </p>
          <p>If you have any questions, please contact us at <a href="mailto:contact@evergrowlandscaping.com">contact@evergrowlandscaping.com</a>.</p>
          <p>Thank you,<br><strong>The Evergrow Landscaping Team</strong></p>
        </div>
        <div class="footer">
          <p><strong>Evergrow Landscaping</strong> &bull; contact@evergrowlandscaping.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendBalanceDueReminders(env: Env): Promise<{ sent: number; errors: number }> {
    const rows = await env.DB.prepare(
        `SELECT
            i.id AS invoice_id,
            i.amount AS invoice_amount,
            i.due_date,
            c.email AS customer_email,
            c.name AS customer_name,
            p.service_type
         FROM invoices i
         JOIN customers c ON i.customer_id = c.id
         JOIN projects p ON i.project_id = p.id
         WHERE i.invoice_type = 'balance'
           AND i.status = 'pending'
           AND DATE(i.due_date) = DATE('now', '+2 days')`
    ).all<ReminderRow>();

    let sent = 0;
    let errors = 0;

    for (const row of rows.results || []) {
        try {
            await sendEmail(env, {
                from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                to: row.customer_email,
                subject: '⏰ Payment Reminder – Balance Due in 2 Days',
                html: buildReminderEmail({
                    customerName: row.customer_name || 'Customer',
                    serviceType: row.service_type || 'Landscaping Service',
                    amount: Number(row.invoice_amount),
                    dueDate: row.due_date,
                }),
            });
            sent++;
        } catch (err) {
            console.error(`Reminder email failed for invoice ${row.invoice_id}:`, err);
            errors++;
        }
    }

    return { sent, errors };
}

// HTTP endpoint for manual invocation (admin auth not required for cron, but useful for testing)
export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { env } = context;

    try {
        const result = await sendBalanceDueReminders(env);
        console.log(`[Cron] Balance reminders: sent=${result.sent}, errors=${result.errors}`);
        return new Response(JSON.stringify({ success: true, ...result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[Cron] Balance reminder error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Cron job failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

// Cloudflare Pages scheduled event handler
// This is exported for use in a _worker.ts if Pages supports scheduled events.
export async function handleScheduled(env: Env): Promise<void> {
    try {
        const result = await sendBalanceDueReminders(env);
        console.log(`[Scheduled] Balance reminders: sent=${result.sent}, errors=${result.errors}`);
    } catch (error) {
        console.error('[Scheduled] Balance reminder error:', error);
    }
}
