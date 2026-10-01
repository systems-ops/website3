import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { currentPacificHour, isValidBusinessDate, yesterdayBusinessDate } from "@/lib/business-date";
import { getCurrentManager } from "@/lib/manager-session";
import { sendDailyReportsForAllLocations } from "@/lib/send-daily-reports";

// Vercel's Hobby plan only allows a cron schedule that fires once a day, so
// this can no longer run hourly and gate on an exact target Pacific hour —
// see vercel.json, now a single fixed UTC time (13:00 UTC). That lands at
// 5am Pacific standard time or 6am Pacific daylight time depending on the
// time of year, since a fixed UTC cron drifts an hour across DST and this
// plan gives no second invocation to land the exact target hour.
//
// The cutover this must run after (src/lib/business-date.ts) is 4am
// Pacific, not plain midnight — the business day that just ended (what
// yesterdayBusinessDate() returns) isn't finalized until then, since a
// closing checklist finished after midnight still belongs to it. Running
// earlier would send before that checklist exists and report it missing
// every single night, which the spec calls out explicitly as the failure
// mode to avoid. So instead of matching one exact hour, this only guards
// against firing before that cutover — both possible landing hours (5am
// and 6am) clear it with room to spare, and sendDailyReportsForAllLocations
// is idempotent per (locationId, businessDate) if this ever fires more than
// once for the same business date.
const EARLIEST_HOUR = 5;

// GET /api/cron/daily-report — invoked once daily by Vercel Cron (see
// vercel.json). A no-op before the target hour. A manager can also force a
// run for a specific business date (testing, or resending after fixing a
// recipient list) — that path is separately authenticated and ignores the
// hour gate, but still goes through the same idempotency check.
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

    if (currentPacificHour() < EARLIEST_HOUR) {
      return NextResponse.json({ skipped: true, reason: "before the report hour" });
    }

    const businessDate = yesterdayBusinessDate();
    const results = await sendDailyReportsForAllLocations(businessDate);
    return NextResponse.json({ businessDate, results });
  } catch (err) {
    return handleApiError(err);
  }
}
