import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { currentPacificHour, isValidBusinessDate, yesterdayBusinessDate } from "@/lib/business-date";
import { getCurrentManager } from "@/lib/manager-session";
import { sendDailyReportsForAllLocations } from "@/lib/send-daily-reports";

// The hour (Pacific) this fires at, out of an hourly Vercel Cron schedule —
// gating on the local hour rather than a fixed UTC cron time is what the
// spec asks for, since a fixed UTC schedule drifts an hour across DST.
//
// Runs an hour after the 4am business-date cutover (src/lib/business-date.ts),
// not at plain midnight — the business day that just ended (what
// yesterdayBusinessDate() returns at this hour) isn't finalized until 4am,
// since a closing checklist finished after midnight still belongs to it.
// Running any earlier would send before that checklist exists and report
// it missing every single night, which the spec calls out explicitly as
// the failure mode to avoid. The extra hour of buffer over the cutover
// itself absorbs the last few stragglers.
const TARGET_HOUR = 5;

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
