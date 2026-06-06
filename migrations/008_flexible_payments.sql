-- Flexible payments: partial payments toward an invoice + 30-day terms.
-- Apply via Cloudflare dashboard D1 console (Workers & Pages -> D1 -> thurmons-heat-air-db -> Console).
--
-- NOTE: invoices.due_date already exists from an earlier migration, so it is NOT re-added here.
-- If 'amount_paid' was already added in a partial run, that ALTER will error 'duplicate column' -- safe to skip.

-- Running total paid on the invoice
ALTER TABLE invoices ADD COLUMN amount_paid REAL NOT NULL DEFAULT 0;

-- Ledger: one row per payment attempt (an invoice can have many partial payments)
CREATE TABLE IF NOT EXISTS invoice_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',   -- pending | completed | failed
  square_order_id TEXT,
  square_payment_link_id TEXT,
  square_payment_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_order ON invoice_payments(square_order_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);
