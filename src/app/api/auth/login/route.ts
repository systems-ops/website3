import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { verifyPin } from "@/lib/pin";
import { createSession } from "@/lib/session";

const loginSchema = z.object({
  cookId: z.string(),
  locationId: z.string(),
  pin: z.string().min(4).max(8),
});

export async function POST(req: Request) {
  try {
    const body = loginSchema.parse(await req.json());

    const cook = await prisma.cook.findUnique({
      where: { id: body.cookId },
      include: { locations: true },
    });
    if (!cook || !cook.active) throw new ApiError(401, "Invalid PIN");

    const scoped = cook.locations.some((l) => l.locationId === body.locationId);
    if (!scoped) throw new ApiError(403, "This cook isn't scoped to that kitchen");

    if (!verifyPin(body.pin, cook.pinHash)) {
      throw new ApiError(401, "Invalid PIN");
    }

    await createSession(cook.id);

    return NextResponse.json({ cook: { id: cook.id, name: cook.name } });
  } catch (err) {
    return handleApiError(err);
  }
}
