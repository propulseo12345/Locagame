/**
 * Simple in-memory rate limiter for Edge Functions.
 * Uses a Map<IP, { count, windowStart }> with configurable window (default 60s).
 * Each Deno isolate has its own Map — sufficient to block basic abuse.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStart > windowMs * 2) {
      store.delete(key);
    }
  }
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check rate limit for a given key (typically IP + function name).
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs = 60_000
): { allowed: boolean; retryAfter?: number } {
  cleanup(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil(
      (entry.windowStart + windowMs - now) / 1000
    );
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Middleware helper: returns a 429 Response if rate limited, or null if allowed.
 */
export function rateLimitResponse(
  req: Request,
  functionName: string,
  maxRequests: number,
  cors?: Record<string, string>
): Response | null {
  const ip = getClientIp(req);
  const key = `${functionName}:${ip}`;
  const result = checkRateLimit(key, maxRequests);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          ...(cors || {}),
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter || 60),
        },
      }
    );
  }

  return null;
}
