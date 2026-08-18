import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { handleApiError } from "@/lib/api-errors";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
