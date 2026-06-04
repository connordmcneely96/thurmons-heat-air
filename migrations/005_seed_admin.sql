-- Migration: Add role column and seed demo admin account
-- Date: 2026-02-09
-- Description: Adds role column to customers table (if missing) and inserts admin user
-- Credentials: admin@evergrowlandscaping.com / admin123

-- Add role column to existing customers table
-- (SQLite will error if column already exists, so run this separately)
ALTER TABLE customers ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';

-- Insert demo admin account
INSERT OR IGNORE INTO customers (
  email,
  name,
  phone,
  role,
  password_hash,
  email_verified
) VALUES (
  'admin@evergrowlandscaping.com',
  'Connor McNeely',
  '405-479-5794',
  'admin',
  'pbkdf2:100000:b32ad1ed1edfb86476fd8c4070ed797f:09b92cbcb052c36dfddf2e5027432e65450c4d545cc128a8594a927a444b80b3',
  1
);
