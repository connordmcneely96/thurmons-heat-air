# Stripe Payment Testing Guide

## Quick Start: See the Payment Feature in Action

### Option 1: Use Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com
   - Click on "D1" in the left sidebar
   - Select "evergrow-landscaping-db"

2. **Run the Test Data Script**
   - Click the "Console" tab
   - Open `create-test-invoice.sql` from this directory
   - Copy the entire contents
   - Paste into the D1 Console
   - Click "Execute"

3. **Set a Password for the Test Customer**

   Run this command in the D1 Console to set password as "test123":
   ```sql
   UPDATE customers
   SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye7FrYxYpYIRxH5O.hy8O0SwPAVJGM.6G'
   WHERE id = 999;
   ```

4. **Test the Payment Flow**
   - Go to: https://evergrowlandscaping.com/portal/login
   - Login with:
     - Email: `[email protected]`
     - Password: `test123`
   - Click "Invoices" in the sidebar
   - You should see a $150 invoice with a **"Pay Now"** button in teal
   - Click "Pay Now" to test Stripe Checkout

### Option 2: Use Your Own Existing Customer

If you already have a customer account:

1. **Find Your Customer ID**
   ```sql
   SELECT id, email, name FROM customers WHERE email = '[email protected]';
   ```

2. **Check for Existing Projects**
   ```sql
   SELECT id, service_type, total_amount FROM projects WHERE customer_id = YOUR_ID;
   ```

3. **Create a Test Invoice** (replace YOUR_CUSTOMER_ID and YOUR_PROJECT_ID)
   ```sql
   INSERT INTO invoices (
       project_id,
       customer_id,
       amount,
       invoice_type,
       status,
       due_date,
       created_at
   ) VALUES (
       YOUR_PROJECT_ID,
       YOUR_CUSTOMER_ID,
       100.00,
       'deposit',
       'pending',  -- MUST be 'pending'
       DATE('now', '+3 days'),
       CURRENT_TIMESTAMP
   );
   ```

---

## Where to Find Payment Features

### Navigation Links

**Desktop Header:**
```
[Phone] [Make a Payment] [Client Login] [Get a Quote]
```

**Mobile Menu:**
```
[Get a Free Quote]
[Make a Payment]  ← In teal color
[Customer Portal]
```

All "Make a Payment" links go to `/portal/invoices`

### Invoice Page

The "Pay Now" button appears ONLY when:
- ✅ Invoice status = 'pending'
- ✅ Customer is logged in
- ✅ Invoice belongs to the logged-in customer

**Button Location:**
```
Invoice #123
Lawn Care - Deposit (50%)          $150.00  [💳 Pay Now]
Due: Jan 30, 2026
```

---

## Stripe Configuration (Required)

### Test Mode Setup

1. **Get Stripe Test Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your "Secret key" (starts with `sk_test_`)
   - Copy your "Publishable key" (starts with `pk_test_`)

2. **Create Webhook Endpoint**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click "+ Add endpoint"
   - Endpoint URL: `https://evergrowlandscaping.com/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
   - Copy the "Signing secret" (starts with `whsec_`)

3. **Add to Cloudflare Pages Environment Variables**
   - Go to Cloudflare Dashboard > Pages > evergrow-landscaping
   - Settings > Environment Variables
   - Add these variables:
     ```
     EVERGROW_STRIPE_SECRET_KEY_TEST = sk_test_xxx...
     EVERGROW_STRIPE_WEBHOOK_SECRET_TEST = whsec_xxx...
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST = pk_test_xxx...
     ```
   - Click "Save"
   - Redeploy your site

### Test Cards

Use these test cards in Stripe Checkout:

- **Successful payment:** `4242 4242 4242 4242`
- **Payment requires authentication:** `4000 0025 0000 3155`
- **Payment is declined:** `4000 0000 0000 9995`

**Any future expiry date, any CVC, any ZIP code**

---

## Payment Flow (Step by Step)

1. **Customer logs into portal**
   - URL: `/portal/login`

2. **Views invoices**
   - URL: `/portal/invoices`
   - Sees list of invoices
   - Pending invoices show "Pay Now" button

3. **Clicks "Pay Now"**
   - JavaScript calls: `POST /api/payment/invoice/{id}`
   - API creates Stripe Checkout session
   - Returns checkout URL

4. **Redirects to Stripe Checkout**
   - Hosted payment page
   - Customer enters card details
   - Completes payment

5. **Success redirect**
   - URL: `/portal/invoices/success?session_id=xxx`
   - Shows success message

6. **Webhook processes payment** (happens automatically)
   - Stripe sends `checkout.session.completed` event
   - Webhook handler:
     - Updates invoice status to 'paid'
     - Saves payment_intent_id
     - Updates project deposit_paid/balance_paid
     - Sends receipt email to customer

---

## Troubleshooting

### "Pay Now" button doesn't appear

**Check:**
1. Is the invoice status 'pending'?
   ```sql
   SELECT id, status FROM invoices WHERE id = YOUR_INVOICE_ID;
   ```

2. Are you logged in as the correct customer?
   ```sql
   SELECT customer_id FROM invoices WHERE id = YOUR_INVOICE_ID;
   ```

3. Check browser console for errors (F12 > Console tab)

### Payment fails immediately

**Check:**
1. Stripe secret key is set in environment variables
2. Invoice exists and belongs to customer
3. Check Cloudflare Functions logs

### Webhook not working

**Check:**
1. Webhook URL is correct: `https://evergrowlandscaping.com/api/webhooks/stripe`
2. Webhook secret is set in environment variables
3. Events include `checkout.session.completed`
4. Check Stripe Dashboard > Webhooks > Recent Deliveries

### Email receipt not sending

**Check:**
1. `RESEND_API_KEY` is set in environment variables
2. Email address is valid
3. Check Cloudflare Functions logs for email errors

---

## File Locations

**Frontend:**
- Invoice list: `/app/portal/(authenticated)/invoices/page.tsx`
- Success page: `/app/portal/(authenticated)/invoices/success/page.tsx`
- Navigation: `/components/layout/Header.tsx`

**Backend:**
- Checkout API: `/functions/api/payment/invoice/[id].ts`
- Webhook handler: `/functions/api/webhooks/stripe.ts`
- Invoice API: `/functions/api/customer/invoices.ts`
- Email templates: `/functions/lib/email.ts`

**Database:**
- Invoices table schema in D1
- Required fields: `status`, `stripe_payment_intent_id`, `paid_at`

---

## Going Live (Production)

1. **Switch to Live Mode in Stripe**
   - Get live API keys from https://dashboard.stripe.com/apikeys
   - Create live webhook endpoint

2. **Update Environment Variables**
   ```
   STRIPE_SECRET_KEY = sk_live_xxx...
   STRIPE_WEBHOOK_SECRET = whsec_xxx... (live version)
   ```

3. **Test with real payment methods**
   - Use a real card (will charge real money!)
   - Test small amount first ($1.00)
   - Verify invoice updates correctly
   - Verify email receipt is sent

4. **Enable Stripe Payment Methods**
   - Dashboard > Settings > Payment Methods
   - Enable: Cards, Apple Pay, Google Pay
   - Consider: ACH Direct Debit, Link

---

## Questions?

The payment integration is complete and ready to test. If you encounter any issues:

1. Check the troubleshooting section above
2. Review Cloudflare Functions logs
3. Check Stripe Dashboard for payment/webhook activity
4. Verify environment variables are set correctly
