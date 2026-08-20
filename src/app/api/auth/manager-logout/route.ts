import { NextResponse } from "next/server";
import { destroyManagerSession } from "@/lib/manager-session";
import { handleApiError } from "@/lib/api-errors";

export async function POST() {
  try {
    await destroyManagerSession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
