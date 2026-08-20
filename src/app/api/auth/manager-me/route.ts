import { NextResponse } from "next/server";
import { getCurrentManager } from "@/lib/manager-session";
import { handleApiError } from "@/lib/api-errors";

export async function GET() {
  try {
    const manager = await getCurrentManager();
    if (!manager) return NextResponse.json({ manager: null });
    return NextResponse.json({
      manager: { id: manager.id, name: manager.name, role: manager.role },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
