/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
    // Cloudflare Bindings
    DB: D1Database;
    R2_BUCKET: R2Bucket;
    SESSIONS: KVNamespace;
    CACHE: KVNamespace;

    // Stripe Secrets — separate test/live keys (select via ENVIRONMENT)
    EVERGROW_STRIPE_SECRET_KEY_TEST: string;
    EVERGROW_STRIPE_SECRET_KEY_LIVE: string;
    EVERGROW_STRIPE_WEBHOOK_SECRET_TEST: string;
    EVERGROW_STRIPE_WEBHOOK_SECRET_LIVE: string;
    RESEND_API_KEY: string;
    SESSION_SECRET: string;
    JWT_SECRET: string;
    NOTIFICATION_EMAIL?: string;

    // Environment
    ENVIRONMENT: string;
}
