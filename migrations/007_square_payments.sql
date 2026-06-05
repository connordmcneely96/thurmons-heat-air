-- Square payment tracking columns on invoices.
-- Apply via the Cloudflare dashboard D1 console (browser, no terminal):
--   Workers & Pages -> D1 -> thurmons-heat-air-db -> Console -> paste & run.
ALTER TABLE invoices ADD COLUMN square_order_id TEXT;
ALTER TABLE invoices ADD COLUMN square_payment_link_id TEXT;
ALTER TABLE invoices ADD COLUMN square_payment_id TEXT;
CREATE INDEX IF NOT EXISTS idx_invoices_square_order ON invoices(square_order_id);
