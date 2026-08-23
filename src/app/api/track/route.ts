import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/track — sidvisnings-spårning (beacon).
 * Bounded: en rad per sidvisning, städas av organ-motorns retention (90 dagar).
 * Skyddad mot spam: max 1 rad per (session+path) per 30 sek kanoniskt här
 * är förenklat — klienten deduplicerar; retention-organet sätter taket.
 */
export async function POST(req: NextRequest) {
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ ok: true }); // tyst nläge utan Supabase
  try {
    const { path: p, sessionId, ref } = await req.json();
    if (typeof p !== "string" || p.length > 200 || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // Endast interna sökvägar (inga externa URL:er i loggen)
    const ren = p.startsWith("/") ? p.slice(0, 200) : "/";

    await fetch(`${rest.origin}/rest/v1/user_activities`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        session_id: String(sessionId).slice(0, 64),
        action: "page_view",
        section: ren,
        target_type: ref && String(ref).startsWith("/") ? "referrer" : null,
        target_id: ref ? String(ref).slice(0, 200) : null,
        metadata: null,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
