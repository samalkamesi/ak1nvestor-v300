import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/** GET /api/admin/stats — dashboard statistik */
export async function GET() {
  const stats: any = {
    members: { total: 0, free: 0, premium: 0, pro: 0 },
    portfolios: { total: 0, pending: 0, in_review: 0, completed: 0 },
    bookings: { total: 0, requested: 0, confirmed: 0, completed: 0 },
    megaTasks: { total: 0, completed: 0 },
    courses: { total: 0, deep: 0, shallow: 0 },
    systemEvents: { total: 0 },
  };

  // Mega tasks from JSON
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/export/mega-tasks.json"), "utf-8");
    const tasks = JSON.parse(raw);
    stats.megaTasks = {
      total: tasks.length,
      completed: tasks.filter((t: any) => t.status === "completed").length,
    };
  } catch {}

  // Courses from JSON
  try {
    const raw = readFileSync(path.join(process.cwd(), "src/features/deep-courses/data/deep-courses.json"), "utf-8");
    const courses = JSON.parse(raw);
    let deep = 0, shallow = 0;
    for (const [slug, course] of Object.entries(courses) as [string, any][]) {
      const total = course.chapters?.reduce((s: number, ch: any) =>
        s + ch.blocks?.reduce((s2: number, b: any) => s2 + (b.content?.length || 0), 0) || 0, 0) || 0;
      if (total > 5000) deep++; else shallow++;
    }
    stats.courses = { total: Object.keys(courses).length, deep, shallow };
  } catch {}

  // Supabase stats (endast via validerad supabase.co-värd)
  const rest = getSupabaseRest();
  if (rest) {
    try {
      // Members
      const membersRes = await fetch(`${rest.origin}/rest/v1/members?select=member_type`, { headers: rest.headers });
      const members = await membersRes.json();
      stats.members = {
        total: members?.length || 0,
        free: members?.filter((m: any) => m.member_type === "free").length || 0,
        premium: members?.filter((m: any) => m.member_type === "premium").length || 0,
        pro: members?.filter((m: any) => m.member_type === "pro").length || 0,
      };

      // Portfolios
      const portfolioRes = await fetch(`${rest.origin}/rest/v1/client_portfolios?select=analysis_status`, { headers: rest.headers });
      const portfolios = await portfolioRes.json();
      stats.portfolios = {
        total: portfolios?.length || 0,
        pending: portfolios?.filter((p: any) => p.analysis_status === "pending").length || 0,
        in_review: portfolios?.filter((p: any) => p.analysis_status === "in_review").length || 0,
        completed: portfolios?.filter((p: any) => p.analysis_status === "completed").length || 0,
      };

      // Bookings
      const bookingsRes = await fetch(`${rest.origin}/rest/v1/bookings?select=status`, { headers: rest.headers });
      const bookings = await bookingsRes.json();
      stats.bookings = {
        total: bookings?.length || 0,
        requested: bookings?.filter((b: any) => b.status === "requested").length || 0,
        confirmed: bookings?.filter((b: any) => b.status === "confirmed").length || 0,
        completed: bookings?.filter((b: any) => b.status === "completed").length || 0,
      };

      // System events count
      const eventsRes = await fetch(`${rest.origin}/rest/v1/system_events?select=id&limit=100`, { headers: rest.headers });
      const events = await eventsRes.json();
      stats.systemEvents = { total: events?.length || 0 };
    } catch {}
  }

  return NextResponse.json(stats);
}
