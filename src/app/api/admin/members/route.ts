import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/** GET /api/admin/members — lista alla medlemmar */
export async function GET() {
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
