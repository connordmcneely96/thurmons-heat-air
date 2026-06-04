# Stripe Testing Guide — Evergrow Landscaping OKC

**Last Updated:** 2026-02-15
**Environment:** Test mode (`sk_test_...` / `pk_test_...`)

---

## Prerequisites

Before running any payment tests, ensure:

- [ ] Stripe test keys are set in `.env.local` (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`)
- [ ] Cloudflare secrets are set:
  - `wrangler secret put STRIPE_SECRET_KEY` (use `sk_test_...`)
  - `wrangler secret put STRIPE_WEBHOOK_SECRET` (use `whsec_...`)
- [ ] At least one customer exists with a `stripe_customer_id` in the database
- [ ] At least one project with status `'scheduled'` and `total_amount > 0` exists

---

## Test Card Numbers

All test cards use: any future expiry date, any 3-digit CVC, any ZIP code.

### Successful Payments

| Card Number | Scenario |
|-------------|---------|
| `4242 4242 4242 4242` | Visa — immediate success |
| `5555 5555 5555 4444` | Mastercard — immediate success |
| `3782 822463 10005` | Amex — immediate success |

### Authentication (3D Secure)

| Card Number | Scenario |
|-------------|---------|
| `4000 0025 0000 3155` | Requires 3DS authentication — approve to succeed |
| `4000 0027 6000 3184` | Requires 3DS — decline in auth to fail |

### Declined Cards

| Card Number | Decline Reason |
|-------------|---------------|
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0002` | Card declined (generic) |
| `4000 0000 0000 0069` | Card expired |
| `4000 0000 0000 0127` | Incorrect CVC |
| `4100 0000 0000 0019` | Always blocked (fraud) |

---

## Payment Flow 1: Elements-Based (PaymentModal)

This is the primary payment flow via the Customer Portal.

### Setup: Create Test Data

1. Register or log in as a customer at `/portal/login`
2. The customer must have `stripe_customer_id` set — if not, use the hosted checkout flow first (which creates it automatically)
3. Create a project and invoice via admin panel, or run this SQL in D1 Console:

```sql
-- Replace 1 with your actual customer ID
INSERT INTO projects (customer_id, service_type, total_amount, deposit_amount, status)
VALUES (1, 'lawn-care', 300.00, 150.00, 'scheduled');

INSERT INTO invoices (project_id, customer_id, amount, invoice_type, status)
VALUES (last_insert_rowid(), 1, 150.00, 'deposit', 'pending');
```

### Test Steps: Deposit Payment

1. Go to `https://evergrowlandscaping.com/portal/invoices`
2. Find the pending deposit invoice
3. Click **"Pay Now"**
4. The PaymentModal opens — verify:
   - Invoice amount is displayed correctly
   - Transaction fee is calculated (2.9% + $0.30)
   - Stripe Payment Element renders
5. Enter test card `4242 4242 4242 4242`, any future expiry, any CVC
6. Click **"Pay $X.XX"**

**Expected results:**
- Payment processes without error
- Success toast appears: "Payment successful! Thank you."
- Stripe Dashboard → Payments shows a new payment
- Database: `invoices.status = 'paid'`, `paid_at` is set (via webhook)
- Database: `projects.deposit_paid = 1` (via webhook)
- Customer receives receipt email at registered address

**If webhook is not working:** Invoice will stay `pending` in DB even after frontend success. See Webhook Testing section below.

### Test Steps: Balance Payment

1. Ensure deposit is paid (`projects.deposit_paid = 1`)
2. Change project status to `'completed'`:
   ```sql
   UPDATE projects SET status = 'completed' WHERE id = YOUR_PROJECT_ID;
   ```
3. Go to `/portal/invoices`
4. A balance invoice should appear, or create one:
   ```sql
   INSERT INTO invoices (project_id, customer_id, amount, invoice_type, status)
   VALUES (YOUR_PROJECT_ID, YOUR_CUSTOMER_ID, 150.00, 'balance', 'pending');
   ```
5. Click **"Pay Now"** on the balance invoice
6. Complete payment with test card

**Expected results:** Same as deposit, but `projects.balance_paid = 1` after webhook

---

## Payment Flow 2: Hosted Checkout (Stripe-hosted page)

This flow is triggered from `POST /api/payment/invoice/[id]`.

### Test Steps

1. Get an invoice ID with status `'pending'`
2. Make an authenticated API call:
   ```bash
   curl -X POST https://evergrowlandscaping.com/api/payment/invoice/YOUR_INVOICE_ID \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```
3. The response includes a Stripe Checkout `url`
4. Navigate to that URL in the browser
5. Complete payment with test card `4242 4242 4242 4242`
6. Stripe redirects to `/portal/invoices/success?session_id=cs_test_...`

**Expected results:**
- Invoice status updated to `'paid'` via `checkout.session.completed` webhook
- Receipt email sent to customer

---

## Webhook Testing

### Option A: Stripe CLI (Local Development — Recommended)

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (macOS) or see https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward events to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. The CLI displays a local webhook secret — use this as `STRIPE_WEBHOOK_SECRET` in `.env.local`
5. Trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger payment_intent.succeeded
   ```

### Option B: Stripe Dashboard (Remote / Staging)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click your endpoint → "Send test webhook"
3. Select event type: `checkout.session.completed` or `payment_intent.succeeded`
4. Click "Send test webhook"
5. Check "Recent deliveries" for 200 response

### Verifying Webhook Delivery

After a payment, check:

```bash
# Check Cloudflare Workers logs
wrangler pages deployment tail

# Or in Stripe Dashboard:
# Developers → Webhooks → Your endpoint → Recent deliveries
```

Webhook should return `200 { "received": true }`.

### Common Webhook Failures

| Error | Cause | Fix |
|-------|-------|-----|
| 400 "Invalid signature" | Wrong `STRIPE_WEBHOOK_SECRET` | Re-copy signing secret from Stripe Dashboard |
| 500 "Invoice not found" | Invoice ID not in metadata | Use real test data, not Stripe's generic test events |
| Email not sent | `RESEND_API_KEY` not set | Set `wrangler secret put RESEND_API_KEY` |

---

## Testing Saved Payment Methods

### Save a Card During Payment

1. Open PaymentModal
2. If the Payment Element has a "Save payment information" option, check it
3. Or call the endpoint directly after a successful payment:

```bash
curl -X POST https://evergrowlandscaping.com/api/payment/save-payment-method \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethodId": "pm_test_xxx", "setAsDefault": true}'
```

### Verify Storage

```sql
SELECT * FROM payment_methods WHERE customer_id = YOUR_CUSTOMER_ID;
```

---

## Database Verification Queries

Run these in the Cloudflare D1 Console after testing:

```sql
-- Check invoice was marked paid
SELECT id, status, stripe_payment_intent_id, paid_at
FROM invoices
WHERE customer_id = YOUR_CUSTOMER_ID
ORDER BY created_at DESC LIMIT 5;

-- Check project payment flags
SELECT id, deposit_paid, balance_paid, status
FROM projects
WHERE customer_id = YOUR_CUSTOMER_ID;

-- Check Stripe customer ID is set
SELECT id, email, stripe_customer_id
FROM customers
WHERE id = YOUR_CUSTOMER_ID;

-- Check saved payment methods
SELECT id, stripe_payment_method_id, type, last4, brand, is_default
FROM payment_methods
WHERE customer_id = YOUR_CUSTOMER_ID;
```

---

## Testing Failed Payments

### Insufficient Funds (4000 0000 0000 9995)

1. Open PaymentModal
2. Enter `4000 0000 0000 9995` with any expiry/CVC
3. Submit payment

**Expected results:**
- Stripe returns payment failure
- PaymentModal shows error: "Your card has insufficient funds."
- Invoice status remains `'pending'`
- `payment_intent.payment_failed` logged in Cloudflare Workers logs
- Customer NOT charged

### 3DS Authentication Decline (4000 0027 6000 3184)

1. Enter card `4000 0027 6000 3184`
2. 3DS dialog appears
3. Click "Fail" in the 3DS modal

**Expected results:**
- Payment fails after 3DS decline
- Error message displayed to customer
- Invoice status remains `'pending'`

---

## Full End-to-End Test Checklist

Run through this checklist before marking the integration ready:

**Setup:**
- [ ] Test customer account created and verified
- [ ] Project created with `status = 'scheduled'`
- [ ] Customer has `stripe_customer_id` in database

**Deposit Flow:**
- [ ] Deposit invoice created (`status = 'pending'`)
- [ ] PaymentModal opens and renders Stripe Payment Element
- [ ] Payment processes with `4242 4242 4242 4242`
- [ ] Frontend success toast appears
- [ ] Webhook fires `payment_intent.succeeded` (or `checkout.session.completed`)
- [ ] `invoices.status = 'paid'` in database
- [ ] `projects.deposit_paid = 1` in database
- [ ] Receipt email received by customer

**Balance Flow:**
- [ ] Project marked `'completed'`
- [ ] Balance invoice created/visible
- [ ] Balance payment completes
- [ ] `projects.balance_paid = 1` in database
- [ ] Receipt email received

**Error Handling:**
- [ ] Declined card shows user-friendly message
- [ ] Network error retried or shown as error
- [ ] Double-payment prevented (second "Pay Now" on paid invoice not possible)

**Webhook:**
- [ ] Test events received (200 response)
- [ ] Signature verification working
- [ ] Failed payment logged to Cloudflare logs
