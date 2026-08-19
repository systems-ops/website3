import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { buildExportRows, rowsToCsv, rowsToPdf } from "@/lib/export";
import { getCurrentCook } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/export?locationId=&logDefinitionId=&from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv|pdf
// Lets a signed-in cook pull the underlying records out of the app as a
// downloadable file — the "get our data back out" escape hatch.
export async function GET(req: NextRequest) {
  try {
    const cook = await getCurrentCook();
    if (!cook) throw new ApiError(401, "Sign in first");

    const params = req.nextUrl.searchParams;
    const locationId = params.get("locationId");
    const logDefinitionId = params.get("logDefinitionId") ?? undefined;
    const from = params.get("from") ?? undefined;
    const to = params.get("to") ?? undefined;
    const format = params.get("format") === "pdf" ? "pdf" : "csv";

    if (!locationId) throw new ApiError(400, "locationId is required");

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) throw new ApiError(404, "Location not found");

    const rows = await buildExportRows({ locationId, logDefinitionId, from, to });
    const stamp = new Date().toISOString().slice(0, 10);
    const filenameBase = `${location.name.replace(/[^a-z0-9]+/gi, "-")}-log-export-${stamp}`;

    if (format === "pdf") {
      const pdf = await rowsToPdf(rows, `${location.name} — Compliance Log Export`);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filenameBase}.pdf"`,
        },
      });
    }

    const csv = rowsToCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filenameBase}.csv"`,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
