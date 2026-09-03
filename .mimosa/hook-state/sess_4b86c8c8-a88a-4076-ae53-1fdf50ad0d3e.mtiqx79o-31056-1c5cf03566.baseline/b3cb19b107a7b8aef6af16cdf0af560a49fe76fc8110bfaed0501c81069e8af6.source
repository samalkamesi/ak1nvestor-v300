import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/** GET /api/member/analysis?memberId=xxx — hämta analyser */
export async function GET(req: NextRequest) {
  try {
    const memberId = new URL(req.url).searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ analyses: [] });
    }

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ analyses: [] });
    }

    const res = await fetch(
      `${rest.origin}/rest/v1/client_analyses?member_id=eq.${memberId}&select=*&order=created_at.desc`,
      { headers: rest.headers }
    );
    const analyses = await res.json();
    return NextResponse.json({ analyses: analyses || [] });
  } catch (e: any) {
    return NextResponse.json({ analyses: [], error: e.message }, { status: 500 });
  }
}
