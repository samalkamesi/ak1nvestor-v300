import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/analytics — besöks- och SEO-statistik för admin-panelen. */
export async function GET(req: NextRequest) {
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ views: {}, topPages: [], topSections: [], signups: [] });
  }
  const dagar = Math.min(90, Number(new URL(req.url).searchParams.get("days")) || 30);
  const sedan = new Date(Date.now() - dagar * 86400_000).toISOString();
  const cutoff24 = new Date(Date.now() - 86400_000).toISOString();
  const cutoff7 = new Date(Date.now() - 7 * 86400_000).toISOString();

  try {
    // Hämta aktiviteter inom fönstret (page_view + section_visit)
    const res = await fetch(
      `${rest.origin}/rest/v1/user_activities?select=session_id,action,section,created_at&created_at=gte.${sedan}&order=created_at.desc&limit=10000`,
      { headers: rest.headers, signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const acts = (await res.json()) || [];

    const views = { total: 0, d24: 0, d7: 0 };
    const sessions = { total: new Set<string>(), d24: new Set<string>(), d7: new Set<string>() };
    const sidor = new Map<string, number>();
    const sektioner = new Map<string, number>();

    for (const a of acts) {
      sessions.total.add(a.session_id);
      if (a.created_at >= cutoff24) sessions.d24.add(a.session_id);
      if (a.created_at >= cutoff7) sessions.d7.add(a.session_id);
      if (a.action === "page_view") {
        views.total++;
        if (a.created_at >= cutoff24) views.d24++;
        if (a.created_at >= cutoff7) views.d7++;
        if (a.section) sidor.set(a.section, (sidor.get(a.section) || 0) + 1);
      } else if (a.action === "section_visit" && a.section) {
        sektioner.set(a.section, (sektioner.get(a.section) || 0) + 1);
      }
    }

    // Registreringar per dag
    const signupsRes = await fetch(
      `${rest.origin}/rest/v1/members?select=created_at&created_at=gte.${sedan}&order=created_at.desc&limit=500`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    const signups: Record<string, number> = {};
    if (signupsRes.ok) {
      for (const m of (await signupsRes.json()) || []) {
        const d = String(m.created_at).slice(0, 10);
        signups[d] = (signups[d] || 0) + 1;
      }
    }

    const topPages = [...sidor.entries()]
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);
    const topSections = [...sektioner.entries()]
      .map(([section, visits]) => ({ section, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    return NextResponse.json({
      periodDays: dagar,
      views,
      uniqueVisitors: {
        total: sessions.total.size,
        d24: sessions.d24.size,
        d7: sessions.d7.size,
      },
      topPages,
      topSections,
      signupsPerDay: signups,
      totalSignups: Object.values(signups).reduce((s: number, n) => s + n, 0),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
