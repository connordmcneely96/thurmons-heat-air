-- ============================================
-- CREATE TEST INVOICE FOR STRIPE PAYMENT DEMO
-- ============================================
--
-- Instructions:
-- 1. Go to Cloudflare Dashboard > D1 Databases > evergrow-landscaping-db
-- 2. Click "Console" tab
-- 3. Copy and paste this entire script
-- 4. Click "Execute"
--
-- This will create a test customer, project, and invoice
-- so you can test the Stripe payment feature
-- ============================================

-- Step 1: Check if test customer exists, if not create one
INSERT OR IGNORE INTO customers (
    id,
    email,
    name,
    phone,
    password_hash,
    email_verified,
    created_at,
    updated_at
) VALUES (
    999, -- Using ID 999 for easy identification
    '[email protected]',
    'Test Customer',
    '555-0123',
    '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', -- Placeholder hash
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 2: Check if test project exists, if not create one
INSERT OR IGNORE INTO projects (
    id,
    customer_id,
    service_type,
    description,
    total_amount,
    deposit_amount,
    deposit_paid,
    balance_paid,
    scheduled_date,
    status,
    created_at
) VALUES (
    999, -- Using ID 999 for easy identification
    999, -- Links to test customer
    'lawn-care',
    'Test project for payment demo',
    300.00,
    150.00,
    0, -- Not paid yet
    0, -- Not paid yet
    DATE('now', '+7 days'),
    'scheduled',
    CURRENT_TIMESTAMP
);

-- Step 3: Create a PENDING invoice for deposit
-- This is the invoice that will show the "Pay Now" button
INSERT INTO invoices (
    project_id,
    customer_id,
    amount,
    invoice_type,
    description,
    status,
    due_date,
    created_at
) VALUES (
    999,
    999,
    150.00, -- Deposit amount (50% of $300)
    'deposit',
    'Deposit payment for lawn care service',
    'pending', -- IMPORTANT: Must be 'pending' to show Pay Now button
    DATE('now', '+3 days'),
    CURRENT_TIMESTAMP
);

-- Step 4: Verify the invoice was created
SELECT
    i.id as invoice_id,
    i.amount,
    i.status,
    i.invoice_type,
    c.email as customer_email,
    p.service_type
FROM invoices i
JOIN customers c ON i.customer_id = c.id
JOIN projects p ON i.project_id = p.id
WHERE i.customer_id = 999
ORDER BY i.created_at DESC
LIMIT 1;

-- ============================================
-- LOGIN CREDENTIALS FOR TESTING
-- ============================================
-- Email: [email protected]
-- Password: You'll need to set this through the registration
--           process or manually update the password_hash
-- ============================================
