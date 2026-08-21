import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { verifyPin } from "@/lib/pin";
import { createManagerSession } from "@/lib/manager-session";
import { enforceLoginRateLimit, recordLoginAttempt, requestIp, RateLimitedError } from "@/lib/rate-limit";

const loginSchema = z.object({
  pin: z.string().min(6).max(8),
});

// Managers are named individuals (not a shared pool), but still sign in with
// just a PIN — same fast-entry pattern as cooks, checked against the small
// set of active manager accounts. Not location-scoped: a manager's role
// applies company-wide.
export async function POST(req: Request) {
  const ip = requestIp(req);
  try {
    const body = loginSchema.parse(await req.json());

    try {
      await enforceLoginRateLimit({ kind: "manager", locationId: null, ip });
    } catch (err) {
      if (err instanceof RateLimitedError) throw new ApiError(429, err.message);
      throw err;
    }

    const candidates = await prisma.manager.findMany({ where: { active: true } });
    const manager = candidates.find((m) => verifyPin(body.pin, m.pinHash));
    if (!manager) {
      await recordLoginAttempt({ kind: "manager", locationId: null, ip, succeeded: false });
      throw new ApiError(401, "Invalid PIN");
    }

    await recordLoginAttempt({ kind: "manager", locationId: null, ip, succeeded: true });
    await createManagerSession(manager.id);

    return NextResponse.json({ manager: { id: manager.id, name: manager.name, role: manager.role } });
  } catch (err) {
    return handleApiError(err);
  }
}
