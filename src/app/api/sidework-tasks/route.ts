import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentSigner } from "@/lib/signer";
import { getCurrentManager } from "@/lib/manager-session";
import { createSideworkTaskSchema } from "@/lib/sidework-schemas";
import { todayBusinessDate } from "@/lib/business-date";

// GET /api/sidework-tasks?locationId=&businessDate=&includeInactive=
// Item 4 — front-of-house sidework. Operational, not evidentiary: this is
// deliberately not routed through LogEntry (see schema.prisma), so it never
// touches compliance completeness, exports, or audit packs.
// includeInactive is manager-only, for the task-list editor.
export async function GET(req: NextRequest) {
  try {
    const signer = await getCurrentSigner();
    if (!signer) throw new ApiError(401, "Sign in first");

    const locationId = req.nextUrl.searchParams.get("locationId");
    if (!locationId) throw new ApiError(400, "locationId is required");
    if (signer.kind === "cook" && !signer.locationIds.includes(locationId)) {
      throw new ApiError(403, "Not scoped to this kitchen");
    }

    const businessDate = req.nextUrl.searchParams.get("businessDate") ?? todayBusinessDate();
    const includeInactive = req.nextUrl.searchParams.get("includeInactive") === "true";
    if (includeInactive && !(await getCurrentManager())) {
      throw new ApiError(403, "Manager sign-in required");
    }

    const [tasks, completions] = await Promise.all([
      prisma.sideworkTask.findMany({
        where: { locationIds: { has: locationId }, ...(includeInactive ? {} : { active: true }) },
        orderBy: [{ shift: "asc" }, { sortOrder: "asc" }],
      }),
      prisma.sideworkCompletion.findMany({ where: { locationId, businessDate } }),
    ]);

    const completionByTaskId = new Map(completions.map((c) => [c.sideworkTaskId, c]));

    return NextResponse.json({
      businessDate,
      tasks: tasks.map((task) => {
        const completion = completionByTaskId.get(task.id);
        return {
          id: task.id,
          title: task.title,
          category: task.category,
          role: task.role,
          shift: task.shift,
          sortOrder: task.sortOrder,
          active: task.active,
          locationIds: task.locationIds,
          status: completion?.status ?? "OPEN",
          claimedSignatureName: completion?.claimedSignatureName ?? null,
          completedSignatureName: completion?.completedSignatureName ?? null,
          completedAt: completion?.completedAt ?? null,
        };
      }),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

// POST /api/sidework-tasks
// Manager-only. "Adding a task must not require a deploy" — this is that.
export async function POST(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(403, "Manager sign-in required");

    const body = createSideworkTaskSchema.parse(await req.json());

    const maxSortOrder = await prisma.sideworkTask.aggregate({
      where: { shift: body.shift },
      _max: { sortOrder: true },
    });

    const task = await prisma.sideworkTask.create({
      data: {
        title: body.title,
        category: body.category,
        role: body.role,
        shift: body.shift,
        locationIds: body.locationIds,
        sortOrder: body.sortOrder ?? (maxSortOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}
