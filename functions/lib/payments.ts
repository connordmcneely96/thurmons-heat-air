import { Env } from '../types';

/**
 * Mark a ledger payment completed, recompute the invoice's running total,
 * flip the invoice to 'partial' or 'paid', and update project flags when fully paid.
 *
 * Shared by the Square webhook (real payments) and PAYMENTS_TEST_MODE (simulated).
 * Idempotent: a ledger row already 'completed' is a no-op.
 */
export async function completeLedgerPayment(
    env: Env,
    ledgerId: number,
    paymentId: string | null
): Promise<void> {
    const ledger = await env.DB.prepare(
        `SELECT id, invoice_id, status FROM invoice_payments WHERE id = ?`
    ).bind(ledgerId).first<{ id: number; invoice_id: number; status: string }>();

    if (!ledger || ledger.status === 'completed') return;

    await env.DB.prepare(
        `UPDATE invoice_payments SET status = 'completed', square_payment_id = ?, paid_at = datetime('now') WHERE id = ?`
    ).bind(paymentId ?? null, ledgerId).run();

    const sumRow = await env.DB.prepare(
        `SELECT COALESCE(SUM(amount), 0) AS paid FROM invoice_payments WHERE invoice_id = ? AND status = 'completed'`
    ).bind(ledger.invoice_id).first<{ paid: number }>();

    const invoice = await env.DB.prepare(
        `SELECT amount, invoice_type, project_id FROM invoices WHERE id = ?`
    ).bind(ledger.invoice_id).first<{ amount: number; invoice_type: string; project_id: number }>();

    if (!invoice) return;

    const paidTotal = Number(sumRow?.paid) || 0;
    const fullyPaid = paidTotal + 0.005 >= invoice.amount;

    await env.DB.prepare(
        `UPDATE invoices SET amount_paid = ?, status = ?, paid_at = CASE WHEN ? = 1 THEN datetime('now') ELSE paid_at END WHERE id = ?`
    ).bind(paidTotal, fullyPaid ? 'paid' : 'partial', fullyPaid ? 1 : 0, ledger.invoice_id).run();

    if (fullyPaid) {
        if (invoice.invoice_type === 'deposit') {
            await env.DB.prepare(`UPDATE projects SET deposit_paid = 1 WHERE id = ?`).bind(invoice.project_id).run();
        } else if (invoice.invoice_type === 'balance' || invoice.invoice_type === 'full') {
            await env.DB.prepare(`UPDATE projects SET balance_paid = 1 WHERE id = ?`).bind(invoice.project_id).run();
        }
    }
}
