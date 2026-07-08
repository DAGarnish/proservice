// lib/rateLimiter.ts
// In-memory rate limiter for the preview generation endpoint.
// Replace with Redis/Upstash for production multi-instance deployments.

interface RateLimitRecord {
  count: number;
  firstRequest: number;
  lastRequest: number;
}

// In-memory stores (reset on server restart — use Redis for production)
const ipStore = new Map<string, RateLimitRecord>();
const emailStore = new Map<string, RateLimitRecord>();
const duplicateStore = new Map<string, number>(); // key → timestamp

const WINDOW_MS = (parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || '24')) * 60 * 60 * 1000;
const MAX_PER_IP = parseInt(process.env.RATE_LIMIT_PER_IP || '50');
const MAX_PER_EMAIL = parseInt(process.env.RATE_LIMIT_PER_EMAIL || '20');

function cleanExpired(store: Map<string, RateLimitRecord>) {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now - record.firstRequest > WINDOW_MS) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
}

export function clearRateLimits() {
  ipStore.clear();
  emailStore.clear();
  duplicateStore.clear();
}

export function checkRateLimit(ip: string, email: string, businessName: string): RateLimitResult {
  // If in development mode or explicitly disabled via env, allow all requests
  if (process.env.NODE_ENV === 'development' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return { allowed: true };
  }

  cleanExpired(ipStore);
  cleanExpired(emailStore);

  const now = Date.now();

  // 1. IP limit
  const ipRecord = ipStore.get(ip);
  if (ipRecord) {
    if (now - ipRecord.firstRequest < WINDOW_MS && ipRecord.count >= MAX_PER_IP) {
      return {
        allowed: false,
        reason: `Too many preview requests from this device. Please try again later.`,
        retryAfterMs: WINDOW_MS - (now - ipRecord.firstRequest),
      };
    }
  }

  // 2. Email limit
  const emailNorm = email.toLowerCase().trim();
  const emailRecord = emailStore.get(emailNorm);
  if (emailRecord) {
    if (now - emailRecord.firstRequest < WINDOW_MS && emailRecord.count >= MAX_PER_EMAIL) {
      return {
        allowed: false,
        reason: `Too many preview requests for this email address. Please try again later.`,
        retryAfterMs: WINDOW_MS - (now - emailRecord.firstRequest),
      };
    }
  }

  // 3. Duplicate block (same email + business name within 15 seconds to prevent accidental double clicks)
  const dupKey = `${emailNorm}:${businessName.toLowerCase().trim()}`;
  const dupTimestamp = duplicateStore.get(dupKey);
  if (dupTimestamp && now - dupTimestamp < 15 * 1000) {
    return {
      allowed: false,
      reason: `A preview for this business is already being generated right now. Please wait a moment.`,
    };
  }

  return { allowed: true };
}

export function recordRequest(ip: string, email: string, businessName: string) {
  const now = Date.now();
  const emailNorm = email.toLowerCase().trim();

  // Update IP record
  const ipRecord = ipStore.get(ip) || { count: 0, firstRequest: now, lastRequest: now };
  ipRecord.count += 1;
  ipRecord.lastRequest = now;
  ipStore.set(ip, ipRecord);

  // Update email record
  const emailRecord = emailStore.get(emailNorm) || { count: 0, firstRequest: now, lastRequest: now };
  emailRecord.count += 1;
  emailRecord.lastRequest = now;
  emailStore.set(emailNorm, emailRecord);

  // Mark duplicate
  const dupKey = `${emailNorm}:${businessName.toLowerCase().trim()}`;
  duplicateStore.set(dupKey, now);
}

export function getRateLimitStats() {
  return {
    uniqueIPs: ipStore.size,
    uniqueEmails: emailStore.size,
    windowHours: parseInt(process.env.RATE_LIMIT_WINDOW_HOURS || '24'),
    maxPerIP: MAX_PER_IP,
    maxPerEmail: MAX_PER_EMAIL,
  };
}
