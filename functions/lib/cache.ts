import { Env } from '../types';

interface CacheOptions {
    ttl?: number; // Time to live in seconds
    tags?: string[]; // For cache invalidation
}

interface CachedData<T> {
    value: T;
    tags: string[];
    cachedAt: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

interface RateLimitData {
    count: number;
    windowStart: number;
}

const DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Get data from cache
 * @param env - Worker environment with CACHE KV binding
 * @param key - Cache key
 * @returns Cached value or null if not found
 */
export async function getFromCache<T>(
    env: Env,
    key: string
): Promise<T | null> {
    try {
        const cached = await env.CACHE!.get(key);
        if (!cached) return null;

        const data: CachedData<T> = JSON.parse(cached);
        return data.value;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

/**
 * Set data in cache
 * @param env - Worker environment with CACHE KV binding
 * @param key - Cache key
 * @param value - Value to cache
 * @param options - Cache options (TTL, tags)
 */
export async function setInCache<T>(
    env: Env,
    key: string,
    value: T,
    options: CacheOptions = {}
): Promise<void> {
    const { ttl = DEFAULT_TTL, tags = [] } = options;

    try {
        const data: CachedData<T> = {
            value,
            tags,
            cachedAt: Date.now(),
        };

        await env.CACHE!.put(key, JSON.stringify(data), {
            expirationTtl: ttl,
        });

        // Store tag references for invalidation
        for (const tag of tags) {
            const tagKey = `tag:${tag}`;
            const existingKeys = await env.CACHE!.get(tagKey);
            const keys = existingKeys ? JSON.parse(existingKeys) : [];

            if (!keys.includes(key)) {
                keys.push(key);
            }

            await env.CACHE!.put(tagKey, JSON.stringify(keys), {
                expirationTtl: ttl + 60, // Keep tag index slightly longer
            });
        }
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

/**
 * Invalidate all cache entries with a specific tag
 * @param env - Worker environment with CACHE KV binding
 * @param tag - Tag to invalidate
 */
export async function invalidateByTag(
    env: Env,
    tag: string
): Promise<void> {
    try {
        const tagKey = `tag:${tag}`;
        const keysStr = await env.CACHE!.get(tagKey);

        if (keysStr) {
            const keys: string[] = JSON.parse(keysStr);

            // Delete all keys with this tag
            await Promise.all(keys.map(key => env.CACHE!.delete(key)));

            // Delete the tag index itself
            await env.CACHE!.delete(tagKey);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
}

/**
 * Delete a specific key from cache
 * @param env - Worker environment with CACHE KV binding
 * @param key - Cache key to delete
 */
export async function deleteFromCache(env: Env, key: string): Promise<void> {
    await env.CACHE!.delete(key);
}

/**
 * Check rate limit for an identifier (IP address or user ID)
 * @param env - Worker environment with CACHE KV binding
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds (default: 60)
 * @returns Rate limit result with allowed status, remaining count, and reset time
 */
export async function checkRateLimit(
    env: Env,
    identifier: string,
    limit: number = 10,
    windowSeconds: number = 60
): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    const dataStr = await env.CACHE!.get(key);
    let data: RateLimitData = dataStr
        ? JSON.parse(dataStr)
        : { count: 0, windowStart: now };

    // Reset window if expired
    if (now - data.windowStart > windowMs) {
        data = { count: 0, windowStart: now };
    }

    data.count++;

    const allowed = data.count <= limit;
    const remaining = Math.max(0, limit - data.count);
    const resetAt = data.windowStart + windowMs;

    // Store updated count
    await env.CACHE!.put(key, JSON.stringify(data), {
        expirationTtl: windowSeconds + 10, // Add buffer to TTL
    });

    return { allowed, remaining, resetAt };
}

/**
 * Rate limiting middleware for API routes
 * @param request - The request object
 * @param env - Worker environment
 * @param limit - Maximum number of requests
 * @param windowSeconds - Time window in seconds
 * @returns Response with 429 if rate limited, null otherwise
 */
export async function rateLimitMiddleware(
    request: Request,
    env: Env,
    limit: number = 10,
    windowSeconds: number = 60
): Promise<Response | null> {
    // Use CF-Connecting-IP header for rate limiting
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimit = await checkRateLimit(env, ip, limit, windowSeconds);

    if (!rateLimit.allowed) {
        return new Response(
            JSON.stringify({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
                    'X-RateLimit-Limit': limit.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
                },
            }
        );
    }

    // Return null to indicate no rate limit hit (request can proceed)
    return null;
}

/**
 * Cache API response with automatic key generation
 * @param env - Worker environment
 * @param request - Request object (for generating cache key)
 * @param fetcher - Function that fetches the data
 * @param options - Cache options
 * @returns Cached or fetched data
 */
export async function cacheApiResponse<T>(
    env: Env,
    request: Request,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    // Generate cache key from URL and query params
    const url = new URL(request.url);
    const cacheKey = `api:${url.pathname}:${url.search}`;

    // Try to get from cache first
    const cached = await getFromCache<T>(env, cacheKey);
    if (cached !== null) {
        return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    await setInCache(env, cacheKey, data, options);

    return data;
}

/**
 * Get or set cache with a fetcher function (cache-aside pattern)
 * @param env - Worker environment
 * @param key - Cache key
 * @param fetcher - Function to fetch data if not in cache
 * @param options - Cache options
 * @returns Cached or fetched data
 */
export async function getOrSet<T>(
    env: Env,
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    // Try cache first
    const cached = await getFromCache<T>(env, key);
    if (cached !== null) {
        return cached;
    }

    // Fetch and cache
    const data = await fetcher();
    await setInCache(env, key, data, options);

    return data;
}

/**
 * Clear all cache entries (use with caution)
 * @param env - Worker environment with CACHE KV binding
 */
export async function clearAllCache(env: Env): Promise<void> {
    try {
        // Note: KV doesn't have a "clear all" operation
        // This would need to list and delete all keys
        // Not recommended for production use
        const list = await env.CACHE!.list();

        for (const key of list.keys) {
            await env.CACHE!.delete(key.name);
        }
    } catch (error) {
        console.error('Clear cache error:', error);
    }
}
