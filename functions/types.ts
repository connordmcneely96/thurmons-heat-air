/**
 * Cloudflare Worker Environment Bindings
 * This interface defines all the bindings available to the Worker
 */
export interface Env {
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

/**
 * Customer database record
 */
export interface Customer {
    id: number;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    password_hash?: string;
    stripe_customer_id?: string;
    email_verified: number;
    created_at: string;
    updated_at: string;
}

/**
 * Quote request database record
 */
export interface Quote {
    id: number;
    customer_id?: number;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    contact_city?: string;
    contact_zip?: string;
    service_type: 'lawn-care' | 'flower-beds' | 'seasonal-cleanup' | 'pressure-washing' | 'other';
    property_size?: 'small' | 'medium' | 'large' | 'commercial';
    description?: string;
    photo_urls?: string; // JSON array of R2 URLs
    quoted_amount?: number;
    quote_notes?: string;
    quote_valid_until?: string;
    status: 'pending' | 'quoted' | 'accepted' | 'declined' | 'expired' | 'converted';
    created_at: string;
    quoted_at?: string;
    accepted_at?: string;
}

/**
 * Project database record
 */
export interface Project {
    id: number;
    customer_id: number;
    quote_id?: number;
    service_type: string;
    description?: string;
    total_amount: number;
    deposit_amount?: number;
    deposit_paid: number;
    balance_paid: number;
    scheduled_date?: string;
    scheduled_time?: string;
    estimated_duration?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';
    created_at: string;
    started_at?: string;
    completed_at?: string;
}

/**
 * Project photo database record
 */
export interface ProjectPhoto {
    id: number;
    project_id: number;
    photo_url: string;
    uploader_type: 'customer' | 'business';
    uploader_id?: number;
    caption?: string;
    phase?: 'before' | 'progress' | 'after';
    uploaded_at: string;
}

/**
 * Invoice database record
 */
export interface Invoice {
    id: number;
    project_id: number;
    customer_id: number;
    amount: number;
    invoice_type: 'deposit' | 'balance' | 'full' | 'additional';
    description?: string;
    status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
    stripe_payment_intent_id?: string;
    stripe_invoice_id?: string;
    due_date?: string;
    sent_at?: string;
    paid_at?: string;
    created_at: string;
}

/**
 * Testimonial database record
 */
export interface Testimonial {
    id: number;
    customer_id?: number;
    project_id?: number;
    customer_name: string;
    customer_city?: string;
    rating: number;
    feedback: string;
    is_featured: number;
    is_approved: number;
    display_order: number;
    created_at: string;
    approved_at?: string;
}

/**
 * Blog post database record
 */
export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image_url?: string;
    category?: string;
    tags?: string; // JSON array
    meta_title?: string;
    meta_description?: string;
    author: string;
    published: number;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Contact request database record
 */
export interface ContactRequest {
    id: number;
    name: string;
    email: string;
    phone?: string;
    message: string;
    service_type?: string;
    status: 'new' | 'read' | 'responded' | 'archived';
    notes?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Newsletter subscription database record
 */
export interface NewsletterSubscriber {
    id: number;
    email: string;
    name?: string;
    source?: string;
    subscribed_at: string;
    unsubscribed_at?: string;
    status: 'active' | 'unsubscribed';
}

/**
 * Service area database record
 */
export interface ServiceArea {
    id: number;
    zip_code: string;
    city: string;
    state: string;
    region: 'el-dorado' | 'okc';
    is_active: number;
}

/**
 * Job application database record
 */
export interface JobApplication {
    id: number;
    name: string;
    email: string;
    phone: string;
    city_state: string;
    position: string;
    willing_to_travel: number;
    has_license: number;
    years_experience?: number;
    equipment_skills?: string; // JSON array
    resume_url?: string;
    cover_letter?: string;
    availability_date?: string;
    status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected' | 'withdrawn';
    submitted_at: string;
    updated_at: string;
}
