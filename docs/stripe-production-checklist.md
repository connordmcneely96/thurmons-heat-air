# Stripe Production Readiness Checklist — Evergrow Landscaping OKC

**Last Updated:** 2026-02-15
**Status:** In progress — business verification pending

---

## Overview

This checklist must be completed in full before switching from Stripe test mode to live mode. Items marked with `[BLOCKING]` must be resolved before any live payments can be accepted.

Current business status notes:
- Client has Stripe account created
- EIN obtained
- Legal business name pending verification
- Bank account pending verification

---

## Section 1: Stripe Account Verification `[BLOCKING]`

These items are required by Stripe before live mode payouts are enabled.

- [ ] **Business type confirmed** — Set to "Individual" or "Company" in Stripe Dashboard → Settings → Business details
- [ ] **Legal business name submitted** — Must exactly match EIN registration
- [ ] **EIN / Tax ID entered** — Settings → Tax details → enter EIN
- [ ] **Business address verified** — Physical address (not P.O. Box) required
- [ ] **Business phone number added** — Must be reachable
- [ ] **Business website verified** — `https://evergrowlandscaping.com` — Stripe may review it
- [ ] **Business description completed** — 1-2 sentences describing the landscaping services
- [ ] **Product/service description** — "Residential and commercial landscaping services in OKC metro area"
- [ ] **Account representative verified** — Personal information (name, DOB, SSN last 4 or full) for the account owner
- [ ] **Stripe identity verification completed** — Stripe may request government ID
- [ ] **Account not restricted** — Check Dashboard → Home for any action required banners

### Verify Status
Stripe Dashboard → Settings → Business details → look for green "Verified" status or pending requests.

---

## Section 2: Bank Account (Payouts) `[BLOCKING]`

- [ ] **Business bank account linked** — Dashboard → Settings → Bank accounts and scheduling
- [ ] **Routing and account numbers correct** — Double-check with bank statement
- [ ] **Micro-deposit verification completed** — If required, verify two small deposits (1-2 business days)
- [ ] **Payout schedule configured** — Recommend: Daily or weekly automatic payouts
- [ ] **Minimum payout threshold understood** — Default is $1.00; confirm with Stripe

---

## Section 3: Code Changes for Production `[BLOCKING]`

- [ ] **Webhook handles `payment_intent.succeeded`** — The current webhook only handles `checkout.session.completed`. The Elements-based payment flow fires `payment_intent.succeeded` and won't update the database until this is added. See `docs/stripe-integration-audit.md` §3.1.
- [ ] **Stripe API version standardised** — All files should use the same `apiVersion`. Current inconsistency: some files omit it, others use `2024-12-18.acacia`.
- [ ] **Stripe Customer created at registration** — Verify `functions/api/auth/register.ts` creates a Stripe Customer and stores `stripe_customer_id`. If not, users can't pay via the Elements flow.
- [ ] **Migration 006 applied to production D1** — Run:
  ```bash
  wrangler d1 execute evergrow-landscaping-db \
    --file=migrations/006_payment_methods.sql
  ```

---

## Section 4: Environment Variables `[BLOCKING]`

### Cloudflare Workers/Pages Secrets

Switch from test keys to live keys only after Stripe verification is complete.

```bash
# Remove test keys (overwrite with live values)
wrangler secret put EVERGROW_STRIPE_SECRET_KEY_LIVE         # sk_live_...
wrangler secret put EVERGROW_STRIPE_WEBHOOK_SECRET_LIVE     # whsec_... (live webhook secret)
wrangler secret put RESEND_API_KEY            # re_... (already set if email works)
wrangler secret put SESSION_SECRET            # keep existing value
wrangler secret put JWT_SECRET               # keep existing value
```

### Next.js Frontend (Cloudflare Pages Environment Variables)

In Cloudflare Dashboard → Pages → evergrow-landscaping → Settings → Environment Variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_LIVE = pk_live_...
```

Set this for "Production" environment only. Keep `pk_test_...` for "Preview" environment.

---

## Section 5: Stripe Dashboard Configuration

### Test Mode Webhook (already required for testing)
- [ ] Endpoint URL: `https://evergrowlandscaping.com/api/webhooks/stripe`
- [ ] Events subscribed:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded` ← **add this**
  - [ ] `payment_intent.payment_failed`
- [ ] Endpoint is "Enabled" (not disabled)

### Live Mode Webhook (for production)
- [ ] Create a separate live webhook endpoint: `https://evergrowlandscaping.com/api/webhooks/stripe`
- [ ] Subscribe to same events as above
- [ ] Copy live webhook signing secret → update `STRIPE_WEBHOOK_SECRET` in Cloudflare

### Payment Methods (Stripe Dashboard → Settings → Payment methods)
- [ ] Cards enabled (Visa, Mastercard, Amex, Discover)
- [ ] Apple Pay enabled (automatic with Cards)
- [ ] Google Pay enabled (automatic with Cards)
- [ ] Link (Stripe's 1-click checkout) — optional, recommended for conversion
- [ ] ACH Direct Debit — optional; good for large invoices; has 1-2 day delay

### Branding (Stripe Dashboard → Settings → Branding)
- [ ] Business name: "Evergrow Landscaping"
- [ ] Logo uploaded
- [ ] Brand color: `#4DB8AC` (Hopeful Teal)
- [ ] Icon uploaded
- [ ] Statement descriptor: "EVERGROW LANDSCAPING" (max 22 chars; appears on customer bank statements)
- [ ] Statement descriptor suffix: optional short identifier

---

## Section 6: Legal and Compliance

- [ ] **Terms of Service** — Must include:
  - [ ] Payment processing by Stripe
  - [ ] 50% deposit policy
  - [ ] When balance is due
  - [ ] Accepted payment methods
- [ ] **Privacy Policy** — Must include:
  - [ ] Payment data handled by Stripe (link to stripe.com/privacy)
  - [ ] No card data stored on Evergrow servers
  - [ ] Data retention policy
- [ ] **Refund Policy** — Document and display:
  - [ ] Under what conditions refunds are issued
  - [ ] Timeframe for refund processing (5-10 business days for card refunds)
  - [ ] Who to contact for refund requests
- [ ] **PCI Compliance** — Evergrow qualifies for SAQ A (self-assessment) because card data is handled entirely by Stripe Elements and no card data touches Evergrow servers. No additional certification required.

---

## Section 7: Security Hardening

- [ ] **Rate limiting** — Add Cloudflare rate limiting rules for:
  - [ ] `POST /api/payment/create-deposit` — max 10 req/min per IP
  - [ ] `POST /api/payment/create-balance` — max 10 req/min per IP
  - [ ] `POST /api/auth/login` — max 5 req/min per IP (brute force protection)
- [ ] **HTTPS enforced** — Cloudflare → SSL/TLS → set to "Full (strict)"
- [ ] **Security headers** — Verify Cloudflare headers are configured (CSP, HSTS, X-Frame-Options)
- [ ] **Webhook endpoint not publicly documented** — Avoid listing `/api/webhooks/stripe` in public API docs

---

## Section 8: Monitoring and Alerting

- [ ] **Stripe Dashboard alerts** — Dashboard → Settings → Notifications:
  - [ ] Email alerts for failed payments
  - [ ] Email alerts for disputes/chargebacks
  - [ ] Weekly summary email
- [ ] **Cloudflare Workers logs** — Enable log retention in Cloudflare Dashboard → Workers & Pages → Settings → Observability
- [ ] **Webhook failure alerting** — Stripe retries failed webhooks for 3 days. Check Dashboard → Webhooks → Recent deliveries regularly post-launch.
- [ ] **Chargeback response process** — Know that Stripe gives 7-21 days to respond to disputes. Document who handles disputes and what evidence to provide.
- [ ] **Revenue tracking** — Stripe Dashboard → Reports → Revenue Recognition (available on paid plans)

---

## Section 9: Pre-Launch Testing with Live Keys

Before opening to customers, run one real transaction:

- [ ] Switch to live keys in Cloudflare
- [ ] Create a real test invoice for $1.00 (or smallest possible amount)
- [ ] Pay with a real card (your own business card)
- [ ] Verify:
  - [ ] Payment appears in Stripe Dashboard → Payments
  - [ ] Invoice status updated to `'paid'` in D1
  - [ ] Receipt email delivered
  - [ ] Payout scheduled to bank account
- [ ] Refund the $1.00 test charge from Stripe Dashboard

---

## Section 10: Go-Live Procedure

1. **Final test-mode verification** — Run full end-to-end test checklist from `docs/stripe-testing-guide.md`
2. **Complete all [BLOCKING] items above**
3. **Put site in maintenance mode** (optional but recommended during key rotation)
4. **Rotate to live keys** in Cloudflare Pages environment variables
5. **Create live webhook endpoint** in Stripe Dashboard
6. **Update `STRIPE_WEBHOOK_SECRET`** to live signing secret
7. **Verify deployment** — trigger a Cloudflare Pages redeploy
8. **Run $1.00 live test transaction**
9. **Remove maintenance mode**
10. **Monitor Cloudflare logs and Stripe Dashboard** for first 24 hours

---

## Section 11: Post-Launch Monitoring (First 30 Days)

- [ ] Week 1: Review all webhook delivery logs in Stripe Dashboard daily
- [ ] Week 1: Verify all paid invoices are correctly reflected in D1
- [ ] Week 2: Confirm payouts arriving in bank account on schedule
- [ ] Week 2: Review Stripe Radar fraud score on any flagged payments
- [ ] Month 1: Review conversion rate (payments initiated vs. completed) in Stripe Dashboard
- [ ] Month 1: Check for any failed webhooks that need manual reconciliation

---

## Contacts and Resources

| Resource | URL |
|----------|-----|
| Stripe Dashboard | https://dashboard.stripe.com |
| Stripe Test Dashboard | https://dashboard.stripe.com/test |
| Stripe Support | https://support.stripe.com |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Stripe API Docs | https://docs.stripe.com/api |
| Stripe Webhook Docs | https://docs.stripe.com/webhooks |
| Resend Dashboard | https://resend.com |
| D1 Console | Cloudflare Dashboard → D1 → evergrow-landscaping-db |
