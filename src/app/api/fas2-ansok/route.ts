import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { skickaVboutLead, vboutStatusText } from "@/lib/vbout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VARFOR = 800;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ren(str: unknown, max: number): string {
  return String(str ?? "").trim().slice(0, max);
}

/**
 * POST /api/fas2-ansok — ansökan till Fas 2 (utbildning med grundaren).
 * Skrivs som system_event (type=fas2_ansokan) i admin → Systemevents, där
 * grundaren läser ansökningar och boka möte. AI-styrelsens beslut #3.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Ogiltig förfrågan" }, { status: 400 });
    }

    const { namn, email, niva, xp, kurserKlara, varfor } = body as Record<string, unknown>;

    const n = ren(namn, 80);
    const e = ren(email, 160);
    const v = ren(varfor, MAX_VARFOR + 1);

    if (!n) {
      return NextResponse.json({ error: "Namn krävs" }, { status: 400 });
    }
    if (!EMAIL_RE.test(e)) {
      return NextResponse.json({ error: "En giltig e-postadress krävs" }, { status: 400 });
    }
    if (v.length > MAX_VARFOR) {
      return NextResponse.json(
        { error: `Varför-texten får vara högst ${MAX_VARFOR} tecken` },
        { status: 400 }
      );
    }

    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    const niv = Math.max(1, Math.min(100, Number(niva) || 1));
    const xpTal = Math.max(0, Math.min(10_000_000, Number(xp) || 0));
    const kurser = Array.isArray(kurserKlara)
      ? kurserKlara.slice(0, 500).map((k) => ren(k, 120)).filter(Boolean)
      : [];

    await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "fas2_ansokan",
        severity: "info",
        message: `Fas 2-ansökan: ${n} (nivå ${niv})`,
        details: {
          namn: n,
          email: e,
          niva: niv,
          xp: xpTal,
          kurserKlara: kurser,
          varfor: v,
          datum: new Date().toISOString(),
        },
        source: "fas2",
      }),
      signal: AbortSignal.timeout(10000),
    });

    // Vbout — Fas 2-ansökan är varm lead: mata marknadsautomationen direkt
    // (fire-and-forget, påverkar aldrig ansökan)
    void skickaVboutLead({
      email: e,
      namn: n,
      kalla: "fas2-ansok",
      notering: `Nivå ${niv} · ${xpTal} XP · ${kurser.length} klara kurser`,
    }).then((r) => {
      if (!r.ok) console.warn("[vbout] leadmiss fas2:", vboutStatusText(r));
    });

    return NextResponse.json({
      ok: true,
      meddelande:
        "Ansökan mottagen — vi återkommer med mötestid. Fas 1 fortsätter att vara gratis, för alltid.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Något gick fel" }, { status: 500 });
  }
}

/**
 * GET /api/fas2-ansok — antal registrerade Fas 2-ansökningar
 * (type=fas2_ansokan i system_events, räknat via content-range).
 */
export async function GET() {
  try {
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ antal: 0 });
    }
    const res = await fetch(`${rest.origin}/rest/v1/system_events?type=eq.fas2_ansokan&select=id`, {
      method: "HEAD",
      headers: { ...rest.headers, Prefer: "count=planned" },
      signal: AbortSignal.timeout(10000),
    });
    const antal = Number(res.headers.get("content-range")?.split("/")[1] ?? 0) || 0;
    return NextResponse.json({ antal });
  } catch {
    return NextResponse.json({ antal: 0 });
  }
}
