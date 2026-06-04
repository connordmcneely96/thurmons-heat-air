import { Env } from '../../types';
import { createSession } from '../../lib/session';

interface CustomerRow {
    id: number;
    name: string;
    email: string;
    password_hash: string | null;
    role: 'customer' | 'admin';
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    try {
        const body = await request.json<{ email: string; password: string }>();
        const { email, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Email and password are required',
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Look up customer in database
        const customer = await env.DB.prepare(
            'SELECT id, name, email, password_hash, role FROM customers WHERE LOWER(email) = ?'
        ).bind(normalizedEmail).first<CustomerRow>();

        if (!customer) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email or password',
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Reject login if no password has been set yet (account created via admin/quote flow).
        // The customer must use the "Set Password" flow before logging in.
        if (!customer.password_hash) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No password set for this account. Please use the password reset link sent to your email.',
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verify password using PBKDF2
        const isValid = await verifyPassword(password, customer.password_hash);
        if (!isValid) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Invalid email or password',
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create a real JWT session with proper signing and KV storage
        if (!env.JWT_SECRET) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Server configuration error: JWT_SECRET is not set',
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!env.SESSIONS) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Server configuration error: SESSIONS KV namespace is not bound',
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const token = await createSession(env, {
            userId: customer.id,
            email: customer.email,
            name: customer.name,
            role: customer.role || 'customer',
        });

        return new Response(JSON.stringify({
            success: true,
            token,
            user: {
                id: customer.id.toString(),
                name: customer.name,
                email: customer.email,
                role: customer.role || 'customer',
            },
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: 'Login failed. Please try again.',
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

/**
 * Hash a password using PBKDF2 (Web Crypto API - Cloudflare Workers compatible)
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `pbkdf2:100000:${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored hash
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const parts = storedHash.split(':');
    if (parts[0] !== 'pbkdf2' || parts.length !== 4) {
        return false;
    }
    const iterations = parseInt(parts[1], 10);
    const salt = new Uint8Array(parts[2].match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const expectedHash = parts[3];

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );
    // Use timing-safe comparison to prevent timing side-channel attacks
    const expectedBytes = new Uint8Array(parts[3].match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const actualBytes = new Uint8Array(hash);
    if (expectedBytes.length !== actualBytes.length) return false;
    return crypto.subtle.timingSafeEqual(expectedBytes, actualBytes);
}
