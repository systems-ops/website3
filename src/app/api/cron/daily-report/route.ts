import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { currentPacificHour, isValidBusinessDate, yesterdayBusinessDate } from "@/lib/business-date";
import { getCurrentManager } from "@/lib/manager-session";
import { sendDailyReportsForAllLocations } from "@/lib/send-daily-reports";

// The hour (Pacific) this fires at, out of an hourly Vercel Cron schedule —
// gating on the local hour rather than a fixed UTC cron time is what the
// spec asks for, since a fixed UTC schedule drifts an hour across DST.
//
// NOTE for whoever merges item 2 (the 4am business-date cutover): this
// report currently runs shortly after the plain midnight boundary because
// that's what "today" means without item 2's cutover in this branch. Once
// that merges, this job has to run after 4am instead, or it sends before
// the closing checklist exists and reports it missing every night — the
// spec calls this out explicitly. Move TARGET_HOUR to (e.g.) 4 and confirm
// yesterdayBusinessDate() still means what this code assumes it means.
const TARGET_HOUR = 0;

// GET /api/cron/daily-report — invoked hourly by Vercel Cron (see
// vercel.json). Only acts during the target Pacific hour; every other
// invocation is a fast no-op. A manager can also force a run for a specific
// business date (testing, or resending after fixing a recipient list) —
// that path is separately authenticated and ignores the hour gate, but
// still goes through the same idempotency check.
export async function GET(req: NextRequest) {
  try {
    const forcedDate = req.nextUrl.searchParams.get("businessDate");

    if (forcedDate) {
      const manager = await getCurrentManager();
      if (!manager) throw new ApiError(403, "Manager sign-in required to force a run");
      if (!isValidBusinessDate(forcedDate)) throw new ApiError(400, "businessDate must be YYYY-MM-DD");
      const results = await sendDailyReportsForAllLocations(forcedDate);
      return NextResponse.json({ businessDate: forcedDate, forced: true, results });
    }

    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      throw new ApiError(401, "Unauthorized");
    }

    if (currentPacificHour() !== TARGET_HOUR) {
      return NextResponse.json({ skipped: true, reason: "not the report hour" });
    }

    const businessDate = yesterdayBusinessDate();
    const results = await sendDailyReportsForAllLocations(businessDate);
    return NextResponse.json({ businessDate, results });
  } catch (err) {
    return handleApiError(err);
  }
}
