import { NextResponse } from "next/server";
import { recentOrganLogs } from "@/lib/autonom/organ";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/autonom/status — insyn i AI-organens aktivitet.
 * Visar senaste loggraderna (max 500 finns någonsin — hårt tak i motorn)
 * plus systemets gränser.
 */
export async function GET() {
  const logs = await recentOrganLogs(20);
  return NextResponse.json({
    active: process.env.AUTONOM_DISABLED !== "1",
    limits: {
      maxLogRows: 500,
      maxLogAgeDays: 30,
      writesPerRun: 1,
      killSwitch: "AUTONOM_DISABLED=1",
    },
    recentReports: logs,
  });
}
