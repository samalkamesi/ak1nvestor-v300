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

/** GET /api/member/analysis?memberId=xxx — hämta analyser */
export async function GET(req: NextRequest) {
  try {
    const memberId = new URL(req.url).searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ analyses: [] });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ analyses: [] });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/client_analyses?member_id=eq.${memberId}&select=*&order=created_at.desc`,
      { headers: HEADERS() }
    );
    const analyses = await res.json();
    return NextResponse.json({ analyses: analyses || [] });
  } catch (e: any) {
    return NextResponse.json({ analyses: [], error: e.message }, { status: 500 });
  }
}
