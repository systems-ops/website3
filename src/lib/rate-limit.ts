import { prisma } from "@/lib/prisma";

// Persisted (not in-memory) rate limiting for PIN login attempts — an
// in-process counter resets on every Vercel cold start and protects
// nothing. Escalating friction rather than a single fixed threshold: a
// handful of failed attempts (a genuine typo) is free, but volume gets
// throttled and then locked out, all without ever touching verifyPin
// (and its scryptSync cost) once a caller is locked out.
const WINDOW_MS = 15 * 60 * 1000;
const FREE_ATTEMPTS = 5;
const LOCKOUT_AT = 15;
const MAX_BACKOFF_MS = 30_000;

export function requestIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export class RateLimitedError extends Error {
  constructor() {
    super("Too many attempts. Try again later.");
  }
}

/**
 * Call before verifying a PIN. Throws RateLimitedError if this ip/kind/
 * location combination is currently locked out; otherwise sleeps an
 * escalating backoff once past the free-attempt threshold.
 */
export async function enforceLoginRateLimit(params: {
  kind: "cook" | "manager";
  locationId: string | null;
  ip: string;
}) {
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      kind: params.kind,
      locationId: params.locationId,
      ip: params.ip,
      succeeded: false,
      createdAt: { gte: since },
    },
  });

  if (recentFailures >= LOCKOUT_AT) {
    throw new RateLimitedError();
  }

  if (recentFailures >= FREE_ATTEMPTS) {
    const backoffMs = Math.min(2 ** (recentFailures - FREE_ATTEMPTS) * 1000, MAX_BACKOFF_MS);
    await new Promise((resolve) => setTimeout(resolve, backoffMs));
  }
}

export async function recordLoginAttempt(params: {
  kind: "cook" | "manager";
  locationId: string | null;
  ip: string;
  succeeded: boolean;
}) {
  await prisma.loginAttempt.create({ data: params });
}
