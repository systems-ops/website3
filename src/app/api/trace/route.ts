import { NextRequest, NextResponse } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-errors";
import { getCurrentManager } from "@/lib/manager-session";
import { traceSearch, traceToCsv, traceToPdf } from "@/lib/trace";

// GET /api/trace?query=&locationId=&format=json|csv|pdf
// Manager-only recall tool: free-text search across batch code, supplier
// lot number, and product name. locationId narrows to one kitchen; omit it
// to search across every kitchen (a recall doesn't stop at one location).
export async function GET(req: NextRequest) {
  try {
    const manager = await getCurrentManager();
    if (!manager) throw new ApiError(401, "Sign in as a manager first");

    const params = req.nextUrl.searchParams;
    const query = params.get("query") ?? "";
    const locationId = params.get("locationId") ?? undefined;
    const format = params.get("format");

    if (!query.trim()) throw new ApiError(400, "query is required");

    const batches = await traceSearch(query, locationId);

    if (format === "csv") {
      const csv = traceToCsv(batches);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="trace-${query.replace(/[^a-z0-9]+/gi, "-")}.csv"`,
        },
      });
    }

    if (format === "pdf") {
      const pdf = await traceToPdf(batches, `Trace results — "${query}"`);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="trace-${query.replace(/[^a-z0-9]+/gi, "-")}.pdf"`,
        },
      });
    }

    return NextResponse.json({ batches });
  } catch (err) {
    return handleApiError(err);
  }
}
