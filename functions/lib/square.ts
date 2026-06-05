// Square payments helpers for Cloudflare Pages Functions.
// Uses fetch + Web Crypto only (no Node SDK) so it runs in the Workers runtime.
// Powers Option A: Square-hosted Checkout (Payment Links) for deposits & invoice payments.

export type SquareConfig = {
  accessToken: string;
  locationId: string;
  environment: 'sandbox' | 'production';
};

const SQUARE_VERSION = '2025-01-23';

function baseUrl(environment: string): string {
  return environment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

/** Build a SquareConfig from a Pages Functions env object. Throws if misconfigured. */
export function squareConfigFromEnv(env: {
  SQUARE_ACCESS_TOKEN?: string;
  SQUARE_LOCATION_ID?: string;
  SQUARE_ENVIRONMENT?: string;
}): SquareConfig {
  if (!env.SQUARE_ACCESS_TOKEN) throw new Error('SQUARE_ACCESS_TOKEN not configured');
  if (!env.SQUARE_LOCATION_ID) throw new Error('SQUARE_LOCATION_ID not configured');
  return {
    accessToken: env.SQUARE_ACCESS_TOKEN,
    locationId: env.SQUARE_LOCATION_ID,
    environment: env.SQUARE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  };
}

async function squarePost<T>(config: SquareConfig, path: string, body: unknown): Promise<T> {
  const res = await fetch(`${baseUrl(config.environment)}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const detail =
      (data?.errors as Array<{ detail?: string }> | undefined)?.[0]?.detail ||
      `Square API error (${res.status})`;
    throw new Error(detail);
  }
  return data as T;
}

export type CreatePaymentLinkInput = {
  amountCents: number;
  name: string;        // shown on the hosted checkout (e.g. "Deposit - Invoice #123")
  note?: string;       // internal payment note
  redirectUrl?: string; // where to return the customer after paying
};

export type PaymentLinkResult = {
  url: string;
  paymentLinkId: string;
  orderId?: string;
};

/**
 * Create a Square-hosted checkout link for a one-time amount.
 * Returns the URL to redirect the customer to.
 */
export async function createPaymentLink(
  config: SquareConfig,
  input: CreatePaymentLinkInput
): Promise<PaymentLinkResult> {
  const body: Record<string, unknown> = {
    idempotency_key: crypto.randomUUID(),
    quick_pay: {
      name: input.name,
      price_money: { amount: Math.round(input.amountCents), currency: 'USD' },
      location_id: config.locationId,
    },
  };
  if (input.note) body.payment_note = input.note;
  if (input.redirectUrl) body.checkout_options = { redirect_url: input.redirectUrl };

  const data = await squarePost<{
    payment_link: { id: string; url: string; order_id?: string };
  }>(config, '/v2/online-checkout/payment-links', body);

  return {
    url: data.payment_link.url,
    paymentLinkId: data.payment_link.id,
    orderId: data.payment_link.order_id,
  };
}

/** Fetch a Square payment by id (used by the webhook to confirm COMPLETED status). */
export async function getPayment(config: SquareConfig, paymentId: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${baseUrl(config.environment)}/v2/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Square-Version': SQUARE_VERSION,
    },
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const detail =
      (data?.errors as Array<{ detail?: string }> | undefined)?.[0]?.detail ||
      'Square getPayment failed';
    throw new Error(detail);
  }
  return data.payment as Record<string, unknown>;
}

/**
 * Verify a Square webhook signature.
 * Square signs HMAC-SHA256 over (notificationUrl + rawBody), base64-encoded,
 * sent in the 'x-square-hmacsha256-signature' header.
 */
export async function verifySquareWebhook(
  signatureKey: string,
  notificationUrl: string,
  rawBody: string,
  signatureHeader: string | null
): Promise<boolean> {
  if (!signatureHeader) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(signatureKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(notificationUrl + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signatureHeader.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signatureHeader.charCodeAt(i);
  }
  return diff === 0;
}
