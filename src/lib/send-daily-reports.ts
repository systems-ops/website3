import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { buildDailyReport } from "@/lib/daily-report";
import { dailyReportHtml, dailyReportSubject, dailyReportText } from "@/lib/daily-report-email";

const FROM_ADDRESS = "systems@passionebrands.com";

function resendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

export type SendResult =
  | { locationId: string; locationName: string; status: "sent"; recipientCount: number }
  | { locationId: string; locationName: string; status: "skipped_no_recipients" }
  | { locationId: string; locationName: string; status: "already_sent" }
  | { locationId: string; locationName: string; status: "failed"; error: string };

// One email per location, not a combined digest — a manager who oversees
// more than one site gets one email per kitchen, so the subject line alone
// says which one it concerns. Idempotent: a DailyReportLog row for this
// (locationId, businessDate) means "already sent," full stop, regardless of
// how many times this is invoked — cron can double-fire.
export async function sendDailyReportForLocation(locationId: string, businessDate: string): Promise<SendResult> {
  const location = await prisma.location.findUniqueOrThrow({ where: { id: locationId } });

  const recipients = await prisma.reportRecipient.findMany({ where: { locationId, active: true } });
  if (recipients.length === 0) {
    return { locationId, locationName: location.name, status: "skipped_no_recipients" };
  }

  // Claim the (locationId, businessDate) slot before sending, not after —
  // two concurrent cron invocations racing past a plain existence check
  // could both send before either one had written the "already sent" row.
  // The unique constraint on this table makes only one create() win.
  let claimed: { id: string };
  try {
    claimed = await prisma.dailyReportLog.create({
      data: { locationId, businessDate, recipientCount: recipients.length },
    });
  } catch {
    return { locationId, locationName: location.name, status: "already_sent" };
  }

  try {
    const report = await buildDailyReport(locationId, businessDate);
    const resend = resendClient();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipients.map((r) => r.email),
      subject: dailyReportSubject(report),
      html: dailyReportHtml(report),
      text: dailyReportText(report),
    });
    if (error) throw new Error(error.message);

    return { locationId, locationName: location.name, status: "sent", recipientCount: recipients.length };
  } catch (err) {
    // The send didn't actually happen — release the claim so a retry
    // (the next hourly cron tick) can send it for real, rather than
    // permanently marking a failed send as delivered.
    await prisma.dailyReportLog.delete({ where: { id: claimed.id } }).catch(() => {});
    return { locationId, locationName: location.name, status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendDailyReportsForAllLocations(businessDate: string): Promise<SendResult[]> {
  const locations = await prisma.location.findMany();
  const results: SendResult[] = [];
  for (const location of locations) {
    results.push(await sendDailyReportForLocation(location.id, businessDate));
  }
  return results;
}
