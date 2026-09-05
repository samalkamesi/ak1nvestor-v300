import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * /api/admin/members — medlemsadministration.
 *
 * SKYDD (VÅG 63 bygg-1, O4-robusthet §5 — "värsta fyndet"): requireAdmin på
 * ALLA metoder. PATCH ändrar medlemmars nivå (free/premium/pro!) och GET
 * listar namn/e-post/telefon — ingen av dessa får vara öppen mot internet.
 * Samma x-admin-password-mönster som fas2-access (timing-säkert).
 */

/** GET /api/admin/members — lista alla medlemmar */
export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ members: [] });
  }

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/members?select=*&order=created_at.desc`,
      { headers: rest.headers }
    );
    const members = await res.json();

    // Get portfolio count for each member
    const membersWithCounts = await Promise.all(
      (members || []).map(async (m: any) => {
        const portfolioRes = await fetch(
          `${rest.origin}/rest/v1/client_portfolios?member_id=eq.${m.id}&select=id,analysis_status`,
          { headers: rest.headers }
        );
        const portfolios = await portfolioRes.json();
        return {
          ...m,
          portfolioCount: portfolios?.length || 0,
          pendingCount: portfolios?.filter((p: any) => p.analysis_status === "pending").length || 0,
          completedCount: portfolios?.filter((p: any) => p.analysis_status === "completed").length || 0,
        };
      })
    );

    return NextResponse.json({ members: membersWithCounts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, members: [] }, { status: 500 });
  }
}

/** PATCH /api/admin/members — ändra medlems nivå { id, memberType } */
export async function PATCH(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 500 });
  }
  try {
    const body = await req.json();
    const { id, memberType } = body;
    const allowed = ["free", "premium", "pro"];
    if (!id || !allowed.includes(memberType)) {
      return NextResponse.json(
        { error: "id krävs och memberType måste vara free|premium|pro" },
        { status: 400 }
      );
    }
    const res = await fetch(`${rest.origin}/rest/v1/members?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ member_type: memberType }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Supabase ${res.status}` }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
