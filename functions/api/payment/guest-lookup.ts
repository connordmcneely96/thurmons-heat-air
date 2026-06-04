import { Env } from '../../types';

type InvoiceRow = {
    id: number;
    project_id: number;
    amount: number;
    invoice_type: string;
    status: string;
    paid_at: string | null;
    created_at: string;
    service_type: string | null;
    scheduled_date: string | null;
};

const STATUS_DISPLAY: Record<string, string> = {
    pending: 'Pending Payment',
    paid: 'Paid',
    cancelled: 'Cancelled',
    sent: 'Pending Payment',
    overdue: 'Overdue',
    refunded: 'Refunded',
};

const INVOICE_TYPE_DISPLAY: Record<string, string> = {
    deposit: 'Deposit (50%)',
    balance: 'Balance Due',
    full: 'Full Payment',
    additional: 'Additional Charge',
};

const SERVICE_NAME_DISPLAY: Record<string, string> = {
    lawn_care: 'Lawn Care & Maintenance',
    'lawn-care': 'Lawn Care & Maintenance',
    flower_beds: 'Flower Bed Installation',
    'flower-beds': 'Flower Bed Installation',
    seasonal_cleanup: 'Seasonal Cleanup',
    'seasonal-cleanup': 'Seasonal Cleanup',
    pressure_washing: 'Pressure Washing',
    'pressure-washing': 'Pressure Washing',
    other: 'Other Services',
};

function toTitleCase(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json<{ email: string }>();
        const email = body.email?.trim().toLowerCase();

        if (!email) {
            return new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Find customer by email
        const customer = await env.DB.prepare(
            'SELECT id, name, email FROM customers WHERE LOWER(email) = ?'
        ).bind(email).first<{ id: number; name: string; email: string }>();

        if (!customer) {
            // Return empty results rather than revealing whether the email exists
            return new Response(JSON.stringify({
                success: true,
                invoices: [],
                message: 'No pending invoices found for this email address.',
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Get pending invoices for this customer
        const invoiceResults = await env.DB.prepare(`
            SELECT
                i.id,
                i.project_id,
                i.amount,
                i.invoice_type,
                i.status,
                i.paid_at,
                i.created_at,
                p.service_type,
                p.scheduled_date
            FROM invoices i
            JOIN projects p ON i.project_id = p.id
            WHERE i.customer_id = ?
              AND i.status = 'pending'
            ORDER BY i.created_at DESC
        `).bind(customer.id).all<InvoiceRow>();

        const invoices = (invoiceResults.results || []).map((row) => ({
            id: row.id,
            amount: Number(row.amount),
            invoiceType: row.invoice_type,
            invoiceTypeDisplay: INVOICE_TYPE_DISPLAY[row.invoice_type] || toTitleCase(row.invoice_type),
            status: row.status,
            statusDisplay: STATUS_DISPLAY[row.status] || toTitleCase(row.status),
            serviceName: row.service_type
                ? SERVICE_NAME_DISPLAY[row.service_type] || toTitleCase(row.service_type)
                : 'Service',
            createdAt: row.created_at,
        }));

        return new Response(JSON.stringify({
            success: true,
            customerName: customer.name,
            invoices,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Guest lookup error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Failed to look up invoices' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
