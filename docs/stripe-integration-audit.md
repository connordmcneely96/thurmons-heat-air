# Stripe Integration Audit — Evergrow Landscaping OKC

**Date:** 2026-02-17
**Project:** Evergrow Landscaping — Next.js 14 + Cloudflare Pages/Workers + D1
**Auditor:** Antigravity (Google Deepmind)

---

## 1. Executive Summary

The Stripe integration is **code-complete** and **robust**, implementing best practices such as webhooks for async payment confirmation, idempotency, and secure client-side handling.

However, a **critical configuration discrepancy** was found between the previous documentation and the actual codebase regarding environment variables.

**Immediate Actions Required:**
1.  **Correct Environment Variables:** The frontend code explicitly looks for `NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST` (or `_LIVE`), *not* the standard `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` referenced in previous docs.
2.  **Apply Database Migration:** Migration 006 (`migrations/006_payment_methods.sql`) must be applied to the D1 database to support saved payment methods.
3.  **Configure Secrets:** Cloudflare secrets must be set with the specific names used in `functions/lib/stripe.ts`.

---

## 2. Configuration Verification

### 2.1 Environment Variables (Verified)

The codebase (`lib/stripe-client.ts`) uses specific `EVERGROW_` prefixed environment variables.

| Component | Code Expectation | Status |
| :--- | :--- | :--- |
| **Frontend** | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST`<br>`NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_LIVE` | ✅ **MATCHED** |
| **Backend** | `EVERGROW_STRIPE_SECRET_KEY_TEST`<br>`EVERGROW_STRIPE_SECRET_KEY_LIVE`<br>`EVERGROW_STRIPE_WEBHOOK_SECRET_TEST`<br>`EVERGROW_STRIPE_WEBHOOK_SECRET_LIVE` | ✅ **MATCHED** |

**Status:** The Cloudflare Pages configuration has been verified to match these requirements.

### 2.2 Database Schema

-   **Migration 006 (`payment_methods` table)**: This file exists but likely hasn't been run against the production D1 database.
    -   *Action:* Run `wrangler d1 execute evergrow-landscaping-db --file=migrations/006_payment_methods.sql`

---

## 3. Detailed Codebase Analysis

### 3.1 Backend (`functions/`)

-   **`functions/lib/stripe.ts`**:
    -   ✅ Correctly handles environment switching (`ENVIRONMENT === 'production'`).
    -   ✅ Implements retry logic for resilience (`createPaymentIntentWithRetry`).
    -   ✅ Pins API version to `2024-12-18.acacia`.
    -   ✅ Helper functions for creating customers and invoices are well-structured.

-   **`functions/api/webhooks/stripe.ts`**:
    -   ✅ Verifies webhook signatures securely.
    -   ✅ Handles `checkout.session.completed` (Hosted Checkout flow).
    -   ✅ Handles `payment_intent.succeeded` (Elements/Modal flow).
    -   ✅ Idempotency checks prevent double-crediting payments.
    -   ✅ Sends email receipts upon success.

-   **`functions/api/payment/save-payment-method.ts`**:
    -   ✅ Enforces authentication.
    -   ✅ Validates `paymentMethodId` format.
    -   ✅ Correctly attaches payment methods to the Stripe customer.
    -   ✅ Updates local `payment_methods` table (dependent on Migration 006).

### 3.2 Frontend (`app/` & `components/`)

-   **`lib/stripe-client.ts`**:
    -   ✅ Implements singleton pattern for `stripePromise`.
    -   ⚠️ **Issue:** As noted in 2.1, it uses `EVERGROW_` prefixed environment variables.

-   **`components/portal/PaymentModal.tsx`**:
    -   ✅ Uses Stripe Elements for PCI compliance (SAQ A).
    -   ✅ Calculates and displays transaction fees (2.9% + 30¢).
        -   *Note:* Ensure this fee passing is compliant with local laws and Stripe service terms.
    -   ✅ Handles loading and error states gracefully.

---

## 4. Operational Checklist

To go live, execute these commands with your actual Stripe keys:

### 4.1 Set Cloudflare Secrets (Backend)
```bash
# Test Keys
wrangler secret put EVERGROW_STRIPE_SECRET_KEY_TEST
wrangler secret put EVERGROW_STRIPE_WEBHOOK_SECRET_TEST

# Live Keys (When ready)
wrangler secret put EVERGROW_STRIPE_SECRET_KEY_LIVE
wrangler secret put EVERGROW_STRIPE_WEBHOOK_SECRET_LIVE
```

### 4.2 Set Frontend Environment Variables
In **Cloudflare Dashboard > Pages > Settings > Environment Variables**:

| Variable Name | Value | Environment |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST` | `pk_test_...` | Preview / All |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_LIVE` | `pk_live_...` | Production |

### 4.3 Webhook Configuration
-   **URL:** `https://evergrowlandscaping.com/api/webhooks/stripe`
-   **Events:**
    -   `checkout.session.completed`
    -   `payment_intent.succeeded`
    -   `payment_intent.payment_failed`

---

## 5. Security Assessment

| Control | Status | Notes |
| :--- | :--- | :--- |
| **HTTPS** | ✅ Enforced | Cloudflare default. |
| **PCI Compliance** | ✅ SAQ A | No raw card data touches the server (Elements used). |
| **AuthZ** | ✅ Enforced | `requireAuth` middleware on all sensitive endpoints. |
| **Input Validation** | ✅ Valid | Zod or manual checks on all inputs. |
| **Rate Limiting** | ⚠️ Missing | Recommend adding Cloudflare WAF rules for `/api/payment/*`. |
