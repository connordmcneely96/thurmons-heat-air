-- Migration: Seed Karson's admin account
-- Date: 2026-04-01
-- Description: Inserts or updates Karson Mixon as an admin user with PBKDF2 password hash
-- Password: March2026! (hashed with PBKDF2-SHA256, 100000 iterations)
--
-- Run with:
--   npx wrangler d1 execute evergrow-landscaping-db --remote --file=migrations/007_seed_karson_admin.sql

INSERT INTO customers (email, name, phone, role, password_hash, email_verified)
VALUES (
  'karson@evergrowlandscaping.com',
  'Karson Mixon',
  '405-479-5794',
  'admin',
  'pbkdf2:100000:644c995e1da2904703ce89c8e9349b19:1230eeba88a63598d14e0ec93dd5bfe42c3513022476d4524eed4089cdda59cb',
  1
)
ON CONFLICT(email) DO UPDATE SET
  password_hash = 'pbkdf2:100000:644c995e1da2904703ce89c8e9349b19:1230eeba88a63598d14e0ec93dd5bfe42c3513022476d4524eed4089cdda59cb',
  role = 'admin',
  name = 'Karson Mixon',
  email_verified = 1;
