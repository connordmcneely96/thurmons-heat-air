import { loadStripe, Stripe } from '@stripe/stripe-js';

// Prefer test key; fall back to live key.
// Set both in Cloudflare Pages and use Preview env for test, Production env for live.
const PUBLISHABLE_KEY =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_LIVE ||
    '';

// Cached instance for the lazy getter
let _stripeInstance: Promise<Stripe | null> | null = null;

/**
 * Returns a singleton Stripe.js instance for use in frontend components.
 * Lazily initialized on first call to avoid loading Stripe until needed.
 *
 * Usage:
 *   import { getStripeClient } from '@/lib/stripe-client'
 *   const stripe = await getStripeClient()
 */
export function getStripeClient(): Promise<Stripe | null> {
    if (!_stripeInstance) {
        if (!PUBLISHABLE_KEY) {
            console.error(
                'No Stripe publishable key found. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_TEST or NEXT_PUBLIC_STRIPE_PUBLISHABLE_EVERGROW_LIVE.'
            );
            return Promise.resolve(null);
        }
        _stripeInstance = loadStripe(PUBLISHABLE_KEY);
    }
    return _stripeInstance;
}

/**
 * Pre-loaded Stripe promise for use with @stripe/react-stripe-js <Elements>.
 * Import this directly into components that use the Elements provider.
 *
 * Usage:
 *   import { stripePromise } from '@/lib/stripe-client'
 *   <Elements stripe={stripePromise} options={{ clientSecret }}>
 */
export const stripePromise = loadStripe(PUBLISHABLE_KEY);
