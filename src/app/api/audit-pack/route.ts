import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { prisma } from "@/lib/prisma";
import { auditPackToCsv, auditPackToPdf, buildAuditPack } from "@/lib/audit-pack";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Generated synchronously, same as /api/export — this app's data volume is
// small (a handful of kitchens, a dozen-ish forms/day each), so even a wide
// range finishes well inside a serverless timeout. Capped at ~14 months as a
// backstop rather than building background-job infrastructure this app has
// no other use for.
const MAX_RANGE_DAYS = 430;

// GET /api/audit-pack?locationId=&from=YYYY-MM-DD&to=YYYY-MM-DD&format=pdf|csv
// Manager-only, location-scoped. One PDF covering completeness, exceptions,
// late entries, amendments, and weekly verification sign-offs for the range,
// plus the same flat data as a CSV appendix.
export async function GET(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(401, "Sign in as a manager first");

    const params = req.nextUrl.searchParams;
    const locationId = params.get("locationId");
    const from = params.get("from");
    const to = params.get("to");
    const format = params.get("format") === "csv" ? "csv" : "pdf";

    if (!locationId) throw new ApiError(400, "locationId is required");
    if (!from || !DATE_RE.test(from)) throw new ApiError(400, "from must be YYYY-MM-DD");
    if (!to || !DATE_RE.test(to)) throw new ApiError(400, "to must be YYYY-MM-DD");
    if (from > to) throw new ApiError(400, "from must not be after to");

    const rangeDays = (new Date(to).getTime() - new Date(from).getTime()) / (24 * 60 * 60 * 1000) + 1;
    if (rangeDays > MAX_RANGE_DAYS) {
      throw new ApiError(400, `Date range too wide — pick ${MAX_RANGE_DAYS} days or fewer`);
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new ApiError(404, "Location not found");

    const pack = await buildAuditPack({
      locationId,
      from,
      to,
      generatedBy: `${manager.name} (${manager.role})`,
    });

    const stamp = `${from}_to_${to}`;
    const filenameBase = `${location.name.replace(/[^a-z0-9]+/gi, "-")}-audit-pack-${stamp}`;

    if (format === "csv") {
      const csv = auditPackToCsv(pack);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }

    const pdf = await auditPackToPdf(pack);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
