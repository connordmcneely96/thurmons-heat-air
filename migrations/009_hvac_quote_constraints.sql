-- Migration: HVAC quote constraints
-- Date: 2026-06-07
-- Description: The quotes table came from the Evergrow template with CHECK
-- constraints that only allowed landscaping service_type slugs and a limited
-- property_size set. The HVAC quote form submits new values (ac-repair, heating,
-- installation, maintenance, ductwork, ventilation, multiple, other) and added
-- property sizes (xlarge, unsure), which violated those CHECKs (D1_ERROR:
-- CHECK constraint failed: service_type ...).
--
-- SQLite cannot ALTER a CHECK constraint, so the quotes table is rebuilt without
-- the service_type and property_size enum checks. The form is the source of truth
-- for valid values, so these enums are intentionally left unconstrained to avoid
-- breaking again as services evolve. All other columns, the status check, the
-- foreign key, indexes, and existing data are preserved.
--
-- Run this in the Cloudflare D1 console (thurmons-heat-air-db).

PRAGMA defer_foreign_keys = TRUE;

CREATE TABLE quotes_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,
  contact_city TEXT,
  contact_zip TEXT,
  service_type TEXT NOT NULL,
  property_size TEXT,
  description TEXT,
  photo_urls TEXT,
  quoted_amount REAL,
  quote_notes TEXT,
  quote_valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'quoted', 'accepted', 'declined', 'expired', 'converted')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  quoted_at TEXT,
  accepted_at TEXT,
  FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

INSERT INTO quotes_new SELECT * FROM quotes;

DROP TABLE quotes;

ALTER TABLE quotes_new RENAME TO quotes;

CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
