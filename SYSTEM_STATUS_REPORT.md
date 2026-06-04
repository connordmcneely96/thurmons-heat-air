# EVERGROW LANDSCAPING - SYSTEM STATUS REPORT

**Date:** 2026-02-09
**Database:** 11 tables, 4 migration files
**Codebase:** Next.js 16 static export + Cloudflare Workers
**Overall Status:** ~75% Complete

---

## WORKING

- **Stripe Payments (Full Pipeline):** Real PaymentElement UI, payment intent creation with retry logic, deposit/balance split (50/50), guest checkout via Stripe Checkout Sessions, webhook handler (verifies signature, updates invoice status, marks project payment flags), payment receipt emails sent automatically
- **Email System (Resend):** 20 HTML email templates, wired up on: quote requests (notification + confirmation), contact form submissions, payment receipts, project lifecycle (scheduled/completed/cancelled), feedback requests, job applications (notification + confirmation), newsletter welcome, project photo notifications
- **Authentication:** PBKDF2 password hashing (100K iterations), JWT sessions stored in KV (7-day expiry), `requireAuth()` and `requireAdmin()` middleware, login/register endpoints functional, AuthContext + localStorage token persistence
- **Admin API (7 endpoints):** Quote management (list/filter/send quote with acceptance link), project creation from quotes (with deposit invoice + email), project status transitions (with completion/cancellation emails), blog CRUD (create/update/publish with slug generation), blog image upload to R2 with WebP conversion
- **Customer Portal API:** Projects list, invoices list, feedback submission (1-5 rating with owner alerts)
- **Quote Request Flow:** Multi-step form (zip validation -> contact info -> service details + photo upload), submits to real API, sends notification + confirmation emails
- **R2 File Storage:** Upload/delete/list for quotes, projects, blog, resumes. Asset serving via `/api/assets/` proxy. 10MB limit, image type validation
- **Caching & Rate Limiting:** KV-backed cache with TTL + tag invalidation, rate limiting middleware (newsletter: 3/hr)
- **All 12 Public Pages:** Home, About, Contact, Careers, Commercial, Blog listing, Blog post (API-fetched), 4 service detail pages, Quote Request
- **All Portal Pages:** Dashboard (stats + recent projects), Projects (with filtering), Invoices (with real Stripe PaymentModal), Feedback form
- **Guest Payment Flow:** Email-based invoice lookup at `/pay`, redirects to Stripe Checkout
- **All 7 Forms:** Contact, Quote Request (multi-step), Job Application (with resume upload), Payment Modal (Stripe Elements), Feedback, Login, Register
- **Database Schema:** 11 tables with proper indexes, foreign keys, check constraints
- **Service Area Validation:** ZIP code lookup for El Dorado AR and Oklahoma City OK regions

## PARTIALLY WORKING

- **Blog Listing Page (`app/blog/page.tsx`):** Uses hardcoded mock posts instead of fetching from `/api/blog/posts`. The blog *detail* page fetches from API correctly, but the *listing* page still shows 5 static placeholder posts. Newsletter form in this page is not wired to the subscribe endpoint.
- **Blog RelatedPosts Component:** Uses hardcoded mock data instead of fetching related posts from API
- **Duplicate Portal Routes:** Both `app/(portal)/dashboard/` and `app/portal/(authenticated)/` exist with *different* AuthContext implementations. Both work independently but create confusion and potential auth state inconsistencies.
- **Contact Form Stub:** `app/api/contact/route.ts` is a dead stub (console.log only). The *real* Cloudflare function at `functions/api/contact.ts` works correctly. The stub only runs in `next dev` and would mislead during local development.

## NOT WORKING

- **Admin Dashboard UI:** Zero frontend pages. All admin operations require direct API calls or tools like Postman. No way for business owner to manage quotes, projects, blog, or job applications through a browser.
- **Email Verification:** No endpoint, no token generation, no confirmation flow. Users register and are immediately active.
- **Password Reset:** No forgot-password endpoint, no reset token, no reset flow.
- **Newsletter Subscribe (BUG FIXED):** API was querying table `newsletters` but migration creates `newsletter_subscribers`. **Fixed in this commit** -- table name corrected in `functions/api/newsletter/subscribe.ts`.
- **Newsletter Unsubscribe:** No endpoint exists. `unsubscribed_at` column exists in DB but nothing writes to it. Unsubscribe URL in welcome email leads to a non-existent page.
- **robots.txt:** Missing. Search engines have no crawl directives.
- **sitemap.xml:** Missing. No dynamic or static sitemap generation.
- **404 Page:** No `app/not-found.tsx`. Invalid URLs show default Next.js 404.
- **Error Boundary:** No `app/error.tsx`. Runtime errors show default error page.
- **Services Index Page:** No `app/services/page.tsx`. "Explore All Services" links from home page lead to 404.
- **Google Analytics:** Not installed. No event tracking.
- **Google Maps:** No map integration. Contact page shows "Service Area Map Placeholder" text.
- **Real Images/Assets:** `public/images/` is empty. Only placeholder SVGs from Next.js starter. All service photos, team photos, hero images are missing.
- **`.env.example`:** No environment variable template. New developers can't know what secrets are needed.
- **CI/CD Pipeline:** No GitHub Actions or deployment scripts.
- **Tests:** No test files, no test framework installed.

---

## CRITICAL PATH TO MURPHY USA BID

### Week 1 (Feb 9-14): Core Functionality

**Day 1 (Feb 9) - Admin Can View & Respond to Quotes:**
1. Build admin dashboard layout + sidebar navigation (2 hrs)
2. Build admin quotes list page with status filters (2 hrs)
3. Build admin quote detail page with "Send Quote" form (2 hrs)
4. Wire up to existing `/api/admin/quotes/` endpoints

**Day 2 (Feb 10) - Admin Can Manage Projects:**
1. Build admin projects list page with status filters (1.5 hrs)
2. Build admin project detail page with status transitions (2 hrs)
3. Build "Create Project from Quote" action (1 hr)
4. Wire up to existing `/api/admin/projects/` endpoints

**Day 3 (Feb 11) - Professional Presentation:**
1. Add real company images/photos to `public/images/` (need from owner)
2. Fix blog listing to fetch from API instead of mock data (1 hr)
3. Add `robots.txt` + basic `sitemap.xml` (30 min)
4. Add proper 404 page (30 min)
5. Add `/services` index page (1 hr)

**Day 4 (Feb 12) - Polish & Consolidate:**
1. Consolidate duplicate portal routes into single structure (2 hrs)
2. Remove dead `app/api/contact/route.ts` stub (5 min)
3. Wire up blog listing newsletter form to subscribe API (30 min)
4. Add `.env.example` with all required variables (15 min)
5. Full manual test of quote -> project -> payment flow

**Day 5 (Feb 13) - Admin Blog & Cleanup:**
1. Build admin blog management page (create/edit/publish) (3 hrs)
2. Fix blog RelatedPosts to fetch from API (1 hr)
3. Final build verification and bug fixes

### Week 2 (Feb 15-21): Hardening

**Day 1:** Email verification flow + password reset flow (4 hrs)
**Day 2:** Newsletter unsubscribe endpoint + page (2 hrs), Google Analytics setup (1 hr)
**Day 3:** Admin job applications view page (2 hrs), admin contact requests page (2 hrs)
**Day 4:** Google Maps integration on contact page (2 hrs), structured data/JSON-LD (1 hr)
**Day 5:** End-to-end testing, deployment verification, security audit

---

## IMMEDIATE ACTION (Next 4 Hours)

| # | Task | Time | Impact |
|---|------|------|--------|
| 1 | ~~Fix newsletter table name bug~~ | **DONE** | Newsletter signups were completely broken |
| 2 | Build admin quotes list page | 2 hrs | Owner can see all 12+ pending quotes |
| 3 | Build admin quote detail + send quote action | 1.5 hrs | Owner can respond to quotes with pricing |
| 4 | Add `robots.txt` + `sitemap.xml` | 30 min | SEO baseline for search visibility |

---

## QUICK WINS (Under 1 Hour Each)

- Add `robots.txt` to `public/` (10 min)
- Add basic `sitemap.xml` to `public/` (15 min)
- Add `app/not-found.tsx` custom 404 page (20 min)
- Add `app/services/page.tsx` services index (30 min)
- Delete dead `app/api/contact/route.ts` stub (2 min)
- Wire blog listing newsletter form to `/api/newsletter/subscribe` (20 min)
- Add `.env.example` documenting all required secrets (10 min)
- Fix blog listing to fetch from API instead of mock data (45 min)

---

## BUILD PROMPTS FOR EACH MISSING SYSTEM

### 1. Admin Dashboard
- **What:** Full admin panel with sidebar nav + pages for quotes, projects, blog, applications
- **Where:** `app/admin/` directory with layout + individual pages
- **API:** All endpoints already exist at `functions/api/admin/`
- **Auth:** Use existing `requireAdmin()` - need admin-specific layout with auth check
- **Test:** Login as admin, verify CRUD operations on quotes and projects

### 2. Email Verification
- **What:** Generate verification token on register, send email with link, verify endpoint
- **Where:** `functions/api/auth/verify-email.ts` + modify `register.ts`
- **DB:** Add `email_verification_token` column to customers, or use KV
- **Test:** Register new user, click email link, verify `email_verified` flips to 1

### 3. Password Reset
- **What:** Forgot password form, reset token via email, reset endpoint
- **Where:** `functions/api/auth/forgot-password.ts` + `reset-password.ts`, `app/reset-password/page.tsx`
- **DB:** Use KV for time-limited reset tokens
- **Test:** Request reset, click email link, set new password, login with it

### 4. Blog Listing (API-Fetched)
- **What:** Replace mock posts array with `useEffect` fetch from `/api/blog/posts`
- **Where:** `app/blog/page.tsx` - convert to client component like the detail page
- **Test:** Add blog post via admin API, verify it appears on listing page

### 5. Services Index Page
- **What:** Grid of all 4 services with descriptions and links to detail pages
- **Where:** `app/services/page.tsx`
- **Test:** Click "Explore All Services" from homepage, see all services listed

### 6. SEO Assets
- **What:** `robots.txt` allowing all crawlers + `sitemap.xml` listing all public pages
- **Where:** `public/robots.txt` + `public/sitemap.xml`
- **Test:** Visit `/robots.txt` and `/sitemap.xml` in browser

---

## ACCEPTANCE CRITERIA

### Fully Functional Website:
- [ ] All public pages render without errors
- [ ] Quote request flow works end-to-end (submit -> admin sees it -> sends quote -> customer accepts)
- [ ] Payment flow works (deposit -> balance -> receipt email)
- [ ] Admin can manage quotes, projects, and blog through browser UI
- [ ] Contact form sends email notification
- [ ] Newsletter signup works and sends welcome email
- [ ] Blog loads posts from database (not hardcoded)
- [ ] SEO basics in place (robots.txt, sitemap, metadata)
- [ ] No "Evergreen" references anywhere (all "Evergrow")
- [ ] Build succeeds with `npx next build` (zero errors)

### Murphy USA Bid Ready:
- [ ] Admin dashboard shows pending commercial quotes prominently
- [ ] Can demonstrate full project lifecycle (quote -> schedule -> complete)
- [ ] Professional gallery/portfolio of completed work visible
- [ ] Testimonials section with real customer reviews
- [ ] Commercial services page clearly addresses enterprise needs
- [ ] Payment processing demonstrable with test mode

### No Critical Bugs:
- [x] Newsletter table name matches migration schema
- [x] All "Evergreen" -> "Evergrow" naming fixed
- [x] PaymentModal uses real Stripe Elements (not mock inputs)
- [x] Contact form sends email notifications
- [x] Blog detail page fetches from API
- [x] Static export builds successfully
- [ ] No dead stubs or console.log-only endpoints in production path
