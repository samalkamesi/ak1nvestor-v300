import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";

/**
 * GET /api/member/analysis?memberId=xxx&email=yyy — hämta analyser.
 * Auth-härdad 2026-09-02 (Blue Ocean ERRC E1): memberId måste paras med
 * medlemmens registrerade e-post — annars avvisas anropet. Tidigare kunde
 * godtyckligt memberId läsa medlemmens klientanalyser.
 */
export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const memberId = params.get("memberId");
    const email = (params.get("email") || "").trim().toLowerCase();

    if (!memberId || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ analyses: [], error: "memberId och giltig email krävs" }, { status: 400 });
    }

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ analyses: [] });
    }

    // Verifiera att e-post + id hör ihop innan några analyser lämnas ut
    const medlemsRes = await fetch(
      `${rest.origin}/rest/v1/members?id=eq.${encodeURIComponent(memberId)}&email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
      { headers: rest.headers }
    );
    const medlemmar = await medlemsRes.json();
    if (!Array.isArray(medlemmar) || medlemmar.length === 0) {
      return NextResponse.json({ analyses: [], error: "okänd medlemskombination" }, { status: 403 });
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
