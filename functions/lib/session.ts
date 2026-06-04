import { Env } from '../types';
import { SignJWT, jwtVerify } from 'jose';

interface SessionData {
    userId: number;
    email: string;
    name: string;
    role: 'customer' | 'admin';
    createdAt: number;
}

const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create a new user session
 * @param env - Worker environment with SESSIONS KV binding
 * @param userData - User data to store in session
 * @returns JWT token for the session
 */
export async function createSession(
    env: Env,
    userData: Omit<SessionData, 'createdAt'>
): Promise<string> {
    const sessionData: SessionData = {
        ...userData,
        createdAt: Date.now(),
    };

    // Create JWT token
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT(sessionData as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);

    // Store session in KV for server-side validation
    const sessionKey = `session:${userData.userId}:${token.slice(-16)}`;
    await env.SESSIONS.put(sessionKey, JSON.stringify(sessionData), {
        expirationTtl: SESSION_EXPIRY,
    });

    return token;
}

/**
 * Validate a session token
 * @param env - Worker environment with SESSIONS KV binding
 * @param token - JWT token to validate
 * @returns Session data if valid, null otherwise
 */
export async function validateSession(
    env: Env,
    token: string
): Promise<SessionData | null> {
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // Verify session exists in KV (hasn't been invalidated)
        const sessionKey = `session:${payload.userId}:${token.slice(-16)}`;
        const sessionStr = await env.SESSIONS.get(sessionKey);

        if (!sessionStr) {
            return null; // Session expired or invalidated
        }

        return payload as unknown as SessionData;
    } catch (error) {
        console.error('Session validation error:', error);
        return null;
    }
}

/**
 * Destroy a specific session
 * @param env - Worker environment with SESSIONS KV binding
 * @param token - JWT token of the session to destroy
 * @param userId - User ID for the session
 */
export async function destroySession(
    env: Env,
    token: string,
    userId: number
): Promise<void> {
    const sessionKey = `session:${userId}:${token.slice(-16)}`;
    await env.SESSIONS.delete(sessionKey);
}

/**
 * Destroy all sessions for a user (useful for logout from all devices)
 * @param env - Worker environment with SESSIONS KV binding
 * @param userId - User ID whose sessions should be destroyed
 */
export async function destroyAllUserSessions(
    env: Env,
    userId: number
): Promise<void> {
    // List all sessions for user and delete
    const prefix = `session:${userId}:`;
    const list = await env.SESSIONS.list({ prefix });

    for (const key of list.keys) {
        await env.SESSIONS.delete(key.name);
    }
}

/**
 * Get session from Authorization header
 * @param request - The request object
 * @returns Token if present, null otherwise
 */
export function getSessionToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return null;

    // Support both "Bearer token" and just "token"
    const parts = authHeader.split(' ');
    return parts.length === 2 && parts[0] === 'Bearer' ? (parts[1] || null) : authHeader;
}

/**
 * Middleware to require authentication
 * @param request - The request object
 * @param env - Worker environment
 * @returns Session data or Response with 401
 */
export async function requireAuth(
    request: Request,
    env: Env
): Promise<SessionData | Response> {
    const token = getSessionToken(request);

    if (!token) {
        return new Response(
            JSON.stringify({ error: 'Authentication required' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    const session = await validateSession(env, token);

    if (!session) {
        return new Response(
            JSON.stringify({ error: 'Invalid or expired session' }),
            {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    return session;
}

/**
 * Middleware to require admin role
 * @param request - The request object
 * @param env - Worker environment
 * @returns Session data or Response with 401/403
 */
export async function requireAdmin(
    request: Request,
    env: Env
): Promise<SessionData | Response> {
    const authResult = await requireAuth(request, env);

    if (authResult instanceof Response) {
        return authResult; // Return 401 response
    }

    if (authResult.role !== 'admin') {
        return new Response(
            JSON.stringify({ error: 'Admin access required' }),
            {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    return authResult;
}
