-- Migration: Payment methods table + Stripe field indexes
-- Date: 2026-02-15
-- Description: Adds payment_methods table for saved cards and additional
--              indexes on Stripe-related fields for query performance.

-- Payment methods table
-- Stores saved Stripe payment methods linked to customers
CREATE TABLE IF NOT EXISTS payment_methods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'card', -- 'card', 'us_bank_account', 'link'
  last4 TEXT,
  brand TEXT,        -- 'visa', 'mastercard', 'amex', 'discover', 'jcb', 'unionpay', 'unknown'
  exp_month INTEGER,
  exp_year INTEGER,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id
  ON payment_methods(customer_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_pm_id
  ON payment_methods(stripe_payment_method_id);

-- Additional indexes on invoices for Stripe lookup performance
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id
  ON invoices(stripe_invoice_id);

-- Ensure stripe_customer_id index exists on customers (idempotent)
CREATE INDEX IF NOT EXISTS idx_customers_stripe_id
  ON customers(stripe_customer_id);
