import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/member/analys-efterfragad — medlem begär analys av ett bolag.
 * Hamnar som system_event (type=analysis_request) i admin → Systemevents,
 * där grundaren prioriterar nästa analys. Bounded av organ-motorns retention.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, ticker, bolag, notering } = await req.json();
    const t = String(ticker || bolag || "").trim().slice(0, 40);
    if (!t) {
      return NextResponse.json({ error: "ticker eller bolagsnamn krävs" }, { status: 400 });
    }
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }
    await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "analysis_request",
        severity: "info",
        message: `Analys efterfrågad: ${t}${notering ? ` — ${String(notering).slice(0, 120)}` : ""}`,
        details: { ticker: t, email: String(email || "okänd").slice(0, 120) },
        source: "member-request",
      }),
      signal: AbortSignal.timeout(10000),
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
