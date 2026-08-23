import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

async function antal(
  rest: NonNullable<ReturnType<typeof getSupabaseRest>>,
  table: string
): Promise<number> {
  try {
    const res = await fetch(`${rest.origin}/rest/v1/${table}?select=*&limit=0`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=planned" },
      signal: AbortSignal.timeout(10000),
    });
    return Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
  } catch {
    return 0;
  }
}

/** GET /api/admin/stats — dashboard-statistik (totals, breakdowns, recent) */
export async function GET() {
  const stats: any = {
    members: { total: 0, free: 0, premium: 0, pro: 0 },
    portfolios: { total: 0, pending: 0, in_review: 0, completed: 0 },
    bookings: { total: 0, requested: 0, confirmed: 0, completed: 0 },
    megaTasks: { total: 0, completed: 0 },
    courses: { total: 0, deep: 0, shallow: 0 },
    systemEvents: { total: 0 },
    totals: {
      activities: 0,
      activities24h: 0,
      activities7d: 0,
      uniqueSessions24h: 0,
      uniqueSessions7d: 0,
      portfolios: 0,
      analysisSessions: 0,
      organConsultations: 0,
      systemEvents: 0,
      criticalEvents24h: 0,
    },
    breakdowns: {
      byAction: [] as { action: string; count: number }[],
      bySection: [] as { section: string; count: number }[],
    },
    recent: {
      activities: [] as unknown[],
      events: [] as unknown[],
      portfolios: [] as unknown[],
    },
  };

  // Statiskt innehåll (fungerar utan Supabase)
  try {
    const tasks = JSON.parse(readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf8"));
    stats.megaTasks = {
      total: tasks.length,
      completed: tasks.filter((t: any) => t.status === "completed").length,
    };
  } catch {}
  try {
    const courses = JSON.parse(readFileSync(path.join(process.cwd(), "public/deep-courses.json"), "utf8"));
    let deep = 0,
      shallow = 0;
    for (const c of Object.values(courses) as any[]) {
      const chars =
        c.chapters?.reduce(
          (s: number, ch: any) => s + (ch.blocks?.reduce((s2: number, b: any) => s2 + (b.content?.length || 0), 0) || 0),
          0
        ) || 0;
      if (chars > 5000) deep++;
      else shallow++;
    }
    stats.courses = { total: Object.keys(courses).length, deep, shallow };
  } catch {}

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(stats);
  }

  const cutoff24 = new Date(Date.now() - 86400_000).toISOString();
  const cutoff7d = new Date(Date.now() - 7 * 86400_000).toISOString();

  try {
    const [membersRes, portfoliosRes, bookingsRes, activitiesRes, eventsRes, consultationsRes, recentPortfoliosRes] =
      await Promise.all([
        fetch(`${rest.origin}/rest/v1/members?select=member_type`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        fetch(`${rest.origin}/rest/v1/client_portfolios?select=analysis_status`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        fetch(`${rest.origin}/rest/v1/bookings?select=status`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        fetch(`${rest.origin}/rest/v1/user_activities?select=session_id,action,section,created_at&order=created_at.desc&limit=2000`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        fetch(`${rest.origin}/rest/v1/system_events?select=type,severity,message,created_at&order=created_at.desc&limit=200`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        antal(rest, "organ_consultations"),
        fetch(`${rest.origin}/rest/v1/client_portfolios?select=*&order=created_at.desc&limit=20`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
      ]);

    if (membersRes.ok) {
      const members = await membersRes.json();
      stats.members = {
        total: members?.length || 0,
        free: members?.filter((m: any) => m.member_type === "free").length || 0,
        premium: members?.filter((m: any) => m.member_type === "premium").length || 0,
        pro: members?.filter((m: any) => m.member_type === "pro").length || 0,
      };
    }
    if (portfoliosRes.ok) {
      const portfolios = await portfoliosRes.json();
      stats.portfolios = {
        total: portfolios?.length || 0,
        pending: portfolios?.filter((p: any) => p.analysis_status === "pending").length || 0,
        in_review: portfolios?.filter((p: any) => p.analysis_status === "in_review").length || 0,
        completed: portfolios?.filter((p: any) => p.analysis_status === "completed").length || 0,
      };
      stats.totals.analysisSessions = stats.portfolios.completed;
    }
    if (bookingsRes.ok) {
      const bookings = await bookingsRes.json();
      stats.bookings = {
        total: bookings?.length || 0,
        requested: bookings?.filter((b: any) => b.status === "requested").length || 0,
        confirmed: bookings?.filter((b: any) => b.status === "confirmed").length || 0,
        completed: bookings?.filter((b: any) => b.status === "completed").length || 0,
      };
    }

    if (activitiesRes.ok) {
      const acts = (await activitiesRes.json()) || [];
      const byAction = new Map<string, number>();
      const bySection = new Map<string, number>();
      const sess24 = new Set<string>();
      const sess7 = new Set<string>();
      let a24 = 0,
        a7 = 0;
      for (const a of acts) {
        byAction.set(a.action, (byAction.get(a.action) || 0) + 1);
        if (a.section) bySection.set(a.section, (bySection.get(a.section) || 0) + 1);
        const t = a.created_at;
        if (t >= cutoff24) {
          a24++;
          sess24.add(a.session_id);
        }
        if (t >= cutoff7d) {
          a7++;
          sess7.add(a.session_id);
        }
      }
      stats.totals.activities = await antal(rest, "user_activities");
      stats.totals.activities24h = a24;
      stats.totals.activities7d = a7;
      stats.totals.uniqueSessions24h = sess24.size;
      stats.totals.uniqueSessions7d = sess7.size;
      stats.breakdowns.byAction = [...byAction.entries()]
        .map(([action, count]) => ({ action, count }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 12);
      stats.breakdowns.bySection = [...bySection.entries()]
        .map(([section, count]) => ({ section, count }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 12);
    }

    if (eventsRes.ok) {
      const events = (await eventsRes.json()) || [];
      stats.systemEvents.total = await antal(rest, "system_events");
      stats.totals.systemEvents = stats.systemEvents.total;
      stats.totals.criticalEvents24h = events.filter(
        (e: any) => e.created_at >= cutoff24 && (e.severity === "error" || e.severity === "critical")
      ).length;
      stats.recent.events = events.slice(0, 20);
    }

    stats.totals.portfolios = stats.portfolios.total;
    stats.totals.organConsultations = consultationsRes;
    if (recentPortfoliosRes.ok) {
      stats.recent.portfolios = (await recentPortfoliosRes.json()) || [];
    }
  } catch {}

  return NextResponse.json(stats);
}
