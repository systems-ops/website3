import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { prisma } from "@/lib/prisma";
import { DEMO_MARKER, deleteDemoHistory, seedDemoHistory } from "@/lib/demo-seed";

// Temporary, self-serve tool for previewing what exports look like with
// real-shaped history in them. Manager-only, same trust level as every
// other write in this app. Meant to be removed once it's served its
// purpose — see the PR that added it.
const CONFIRM_TOKEN = "SEED_DEMO_DATA";

// POST /api/admin/seed-demo-history { confirm: "SEED_DEMO_DATA" }
// Generates 5 completed weeks of realistic history (readings, checklists,
// calibration rows, receiving logs, weekly sign-offs) across every
// location, respecting each location's actually-enabled forms. Refuses to
// run twice without a DELETE in between, so a double-click can't double the
// data.
export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== CONFIRM_TOKEN) {
      throw new ApiError(400, `Pass { "confirm": "${CONFIRM_TOKEN}" } to run this`);
    }

    const already = await prisma.logEntry.count({ where: { submittedBy: DEMO_MARKER } });
    if (already > 0) {
      throw new ApiError(409, "Demo data already exists — DELETE this endpoint first to remove it before reseeding");
    }

    const result = await seedDemoHistory();
    return NextResponse.json({ seeded: result });
  } catch (err) {
    return handleApiError(err);
  }
}

// DELETE /api/admin/seed-demo-history
// Removes everything the POST above created, and nothing else — every row
// it touches is one this endpoint itself tagged (LogEntry.submittedBy, or a
// distinctive Verification/ReceivingReview.comments prefix).
export async function DELETE() {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const result = await deleteDemoHistory();
    return NextResponse.json({ deleted: result });
  } catch (err) {
    return handleApiError(err);
  }
}
