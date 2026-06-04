import { sendEmail } from '../../../../lib/email';
import { requireAdmin } from '../../../../lib/session';
import { Env } from '../../../../types';

const SITE_BASE_URL = 'https://evergrowlandscaping.com';
const PORTAL_INVOICES_URL = `${SITE_BASE_URL}/portal/invoices`;

const SERVICE_TYPE_LABELS: Record<string, string> = {
    lawn_care: 'Lawn Care & Maintenance',
    'lawn-care': 'Lawn Care & Maintenance',
    flower_beds: 'Flower Bed Installation',
    'flower-beds': 'Flower Bed Installation',
    seasonal_cleanup: 'Seasonal Cleanup',
    'seasonal-cleanup': 'Seasonal Cleanup',
    pressure_washing: 'Pressure Washing',
    'pressure-washing': 'Pressure Washing',
    landscaping: 'Landscaping & Design',
    other: 'Other Services',
};

function getServiceLabel(serviceType: string | null): string {
    if (!serviceType) return 'Landscaping Service';
    return SERVICE_TYPE_LABELS[serviceType.trim().toLowerCase()] || serviceType;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDateDisplay(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch {
        return dateStr;
    }
}

function buildCompletionEmail(params: {
    customerName: string;
    serviceType: string;
    balanceAmount: number;
    dueDate: string;
    portalUrl: string;
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
        .header { background: #2d6a4f; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .amount-box { background: white; border: 2px solid #2d6a4f; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #2d6a4f; }
        .btn { display: inline-block; background: #2d6a4f; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 13px; background: #e9ecef; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Project Complete!</h1>
        </div>
        <div class="content">
          <p>Hi ${params.customerName},</p>
          <p>Great news! Your <strong>${params.serviceType}</strong> is complete. We hope you love the results!</p>
          <div class="amount-box">
            <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Final Balance Due</p>
            <div class="amount">${formatCurrency(params.balanceAmount)}</div>
            <p style="margin: 8px 0 0; color: #666; font-size: 14px;">Due by ${formatDateDisplay(params.dueDate)}</p>
          </div>
          <p style="text-align: center;">
            <a href="${params.portalUrl}" class="btn">Pay Now →</a>
          </p>
          <p>If you have any questions about your invoice or the work completed, please don't hesitate to reach out at <a href="mailto:contact@evergrowlandscaping.com">contact@evergrowlandscaping.com</a>.</p>
          <p>Thank you for choosing Evergrow Landscaping!</p>
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

function parseProjectId(value?: string | string[]): number | null {
    const val = Array.isArray(value) ? value[0] : value;
    if (!val || !/^\d+$/.test(val)) return null;
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;

    const authResult = await requireAdmin(request, env);
    if (authResult instanceof Response) return authResult;

    const projectId = parseProjectId(params.id);
    if (!projectId) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid project ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const project = await env.DB.prepare(
            `SELECT p.id, p.customer_id, p.service_type, p.status, p.total_amount,
                    p.deposit_amount, p.deposit_paid, p.balance_paid,
                    c.name AS customer_name, c.email AS customer_email
             FROM projects p
             LEFT JOIN customers c ON p.customer_id = c.id
             WHERE p.id = ? LIMIT 1`
        ).bind(projectId).first<{
            id: number; customer_id: number; service_type: string | null; status: string;
            total_amount: number; deposit_amount: number | null;
            deposit_paid: number; balance_paid: number;
            customer_name: string | null; customer_email: string | null;
        }>();

        if (!project) {
            return new Response(JSON.stringify({ success: false, error: 'Project not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (project.deposit_paid !== 1) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Project deposit must be paid before marking as complete',
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        if (project.status === 'completed') {
            return new Response(JSON.stringify({ success: false, error: 'Project is already completed' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (project.status === 'cancelled') {
            return new Response(JSON.stringify({ success: false, error: 'Cancelled projects cannot be completed' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Update project to completed
        await env.DB.prepare(
            `UPDATE projects SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(projectId).run();

        const totalAmount = Number(project.total_amount || 0);
        const depositAmount = Number(project.deposit_amount || 0);
        const balanceAmount = Math.max(0, totalAmount - depositAmount);

        let invoiceId: number | null = null;
        let dueDate = '';

        if (balanceAmount > 0) {
            // Check for existing balance invoice
            const existing = await env.DB.prepare(
                `SELECT id, status FROM invoices
                 WHERE project_id = ? AND invoice_type = 'balance'
                 ORDER BY created_at DESC LIMIT 1`
            ).bind(projectId).first<{ id: number; status: string }>();

            if (existing && existing.status !== 'cancelled') {
                invoiceId = existing.id;
            } else {
                const dueDateStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                dueDate = dueDateStr;
                const result = await env.DB.prepare(
                    `INSERT INTO invoices (project_id, customer_id, amount, invoice_type, description, status, due_date, created_at)
                     VALUES (?, ?, ?, 'balance', ?, 'pending', ?, datetime('now'))`
                ).bind(
                    projectId,
                    project.customer_id,
                    balanceAmount,
                    `Final balance for ${getServiceLabel(project.service_type)}`,
                    dueDateStr
                ).run();

                invoiceId = Number(result.meta.last_row_id);
            }
        }

        // Send completion email with invoice link
        let emailSent = false;
        if (project.customer_email && invoiceId && balanceAmount > 0) {
            try {
                await sendEmail(env, {
                    from: 'Evergrow Landscaping <support@evergrowlandscaping.com>',
                    to: project.customer_email,
                    subject: '✅ Project Complete – Your Final Invoice Is Ready',
                    html: buildCompletionEmail({
                        customerName: project.customer_name || 'Customer',
                        serviceType: getServiceLabel(project.service_type),
                        balanceAmount,
                        dueDate,
                        portalUrl: PORTAL_INVOICES_URL,
                    }),
                });
                emailSent = true;
            } catch (err) {
                console.error('Completion email failed:', err);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Project marked as complete',
            invoiceId,
            balanceAmount,
            emailSent,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });

    } catch (error) {
        console.error('Project complete error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to complete project' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
