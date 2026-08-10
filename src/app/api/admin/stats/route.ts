import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/admin/stats — dashboard-statistik för admin. */
export async function GET(req: NextRequest) {
  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalActivities,
      activities24h,
      activities7d,
      uniqueSessions24h,
      uniqueSessions7d,
      totalPortfolios,
      totalAnalysisSessions,
      totalOrganConsultations,
      totalSystemEvents,
      criticalEvents24h,
      actionBreakdown,
      sectionBreakdown,
      recentActivities,
      recentEvents,
      recentPortfolios,
    ] = await Promise.all([
      db.userActivity.count(),
      db.userActivity.count({ where: { createdAt: { gte: since24h } } }),
      db.userActivity.count({ where: { createdAt: { gte: since7d } } }),
      db.userActivity.findMany({
        where: { createdAt: { gte: since24h } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      db.userActivity.findMany({
        where: { createdAt: { gte: since7d } },
        select: { sessionId: true },
        distinct: ["sessionId"],
      }),
      db.portfolio.count(),
      db.analysisSession.count(),
      db.organConsultation.count(),
      db.systemEvent.count(),
      db.systemEvent.count({
        where: { severity: "critical", createdAt: { gte: since24h } },
      }),
      db.userActivity.groupBy({
        by: ["action"],
        _count: true,
        orderBy: { _count: { action: "desc" } },
        take: 20,
      }),
      db.userActivity.groupBy({
        by: ["section"],
        _count: true,
        orderBy: { _count: { section: "desc" } },
        take: 20,
      }),
      db.userActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      db.systemEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.portfolio.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { holdings: true },
      }),
    ]);

    return NextResponse.json({
      totals: {
        activities: totalActivities,
        activities24h: activities24h,
        activities7d: activities7d,
        uniqueSessions24h: uniqueSessions24h.length,
        uniqueSessions7d: uniqueSessions7d.length,
        portfolios: totalPortfolios,
        analysisSessions: totalAnalysisSessions,
        organConsultations: totalOrganConsultations,
        systemEvents: totalSystemEvents,
        criticalEvents24h: criticalEvents24h,
      },
      breakdowns: {
        byAction: actionBreakdown.map((a) => ({ action: a.action, count: a._count })),
        bySection: sectionBreakdown.map((s) => ({ section: s.section, count: s._count })),
      },
      recent: {
        activities: recentActivities,
        events: recentEvents,
        portfolios: recentPortfolios,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Kunde inte hämta stats", detail: err.message }, { status: 500 });
  }
}
