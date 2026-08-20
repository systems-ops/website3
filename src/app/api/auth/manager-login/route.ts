import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { verifyPin } from "@/lib/pin";
import { createManagerSession } from "@/lib/manager-session";

const loginSchema = z.object({
  pin: z.string().min(4).max(8),
});

// Managers are named individuals (not a shared pool), but still sign in with
// just a PIN — same fast-entry pattern as cooks, checked against the small
// set of active manager accounts. Not location-scoped: a manager's role
// applies company-wide.
export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());

    const candidates = await prisma.manager.findMany({ where: { active: true } });
    const manager = candidates.find((m) => verifyPin(body.pin, m.pinHash));
    if (!manager) throw new ApiError(401, "Invalid PIN");

    await createManagerSession(manager.id);

    return NextResponse.json({ manager: { id: manager.id, name: manager.name, role: manager.role } });
  } catch (err) {
    return handleApiError(err);
  }
}
