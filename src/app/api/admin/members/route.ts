import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

/** GET /api/admin/members — lista alla medlemmar */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ members: [] });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/members?select=*&order=created_at.desc`,
      { headers: HEADERS() }
    );
    const members = await res.json();

    // Get portfolio count for each member
    const membersWithCounts = await Promise.all(
      (members || []).map(async (m: any) => {
        const portfolioRes = await fetch(
          `${SUPABASE_URL}/rest/v1/client_portfolios?member_id=eq.${m.id}&select=id,analysis_status`,
          { headers: HEADERS() }
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
