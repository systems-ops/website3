import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { verifyPin } from "@/lib/pin";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  locationId: z.string(),
  pin: z.string().min(4).max(8),
});

// PINs are shared, not tied to a named person — anyone on shift enters
// whichever PIN they've been given. There's no "pick who you are" step:
// the PIN alone identifies which slot signed the record. With only ~10
// active PINs, checking each hash against the submitted PIN is cheap.
export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());

    const candidates = await prisma.cook.findMany({
      where: { active: true, locations: { some: { locationId: body.locationId } } },
      include: { locations: true },
    });

    const cook = candidates.find((c) => verifyPin(body.pin, c.pinHash));
    if (!cook) throw new ApiError(401, "Invalid PIN");

    await createSession(cook.id);

    return NextResponse.json({ cook: { id: cook.id, name: cook.name } });
  } catch (err) {
    return handleApiError(err);
  }
}
