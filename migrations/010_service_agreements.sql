-- Migration 010: Service Efficiency Agreement (S.E.A.) online signups with e-signature
-- Run once in the Cloudflare D1 console for thurmons-heat-air-db.

CREATE TABLE IF NOT EXISTS service_agreements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    home_phone TEXT,
    cell_phone TEXT,
    work_phone TEXT,
    service_address TEXT NOT NULL,
    service_city TEXT NOT NULL,
    service_state TEXT NOT NULL,
    service_zip TEXT NOT NULL,
    billing_address TEXT,
    billing_city TEXT,
    billing_state TEXT,
    billing_zip TEXT,
    equipment_locations TEXT,          -- JSON array: Attic, Basement, Closet, Crawl Space, Package Unit, Unknown
    filter_sizes TEXT,
    wifi_thermostat TEXT,              -- 'yes' | 'no' | NULL
    contact_preferences TEXT,          -- JSON array: Email, Phone, Text
    unit_count INTEGER NOT NULL DEFAULT 1,
    annual_price REAL NOT NULL,        -- before tax
    agreement_version TEXT NOT NULL,
    signed_name TEXT NOT NULL,         -- typed full legal name
    signature_data TEXT NOT NULL,      -- PNG data URL of drawn signature
    signed_at TEXT NOT NULL DEFAULT (datetime('now')),
    signer_ip TEXT,
    signer_user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new',  -- new | scheduled | active | cancelled
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_agreements_signed_at ON service_agreements(signed_at);
CREATE INDEX IF NOT EXISTS idx_service_agreements_email ON service_agreements(email);
