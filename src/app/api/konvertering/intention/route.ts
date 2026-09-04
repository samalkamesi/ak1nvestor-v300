import { NextRequest, NextResponse } from "next/server";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/konvertering/intention — AKTIVERA-PANELNS A4-EVENT (MARKNADS-
 * BESLUT VÅG 1b, korrigering av m7 rek 2).
 *
 * När en elev begär aktivering på /prenumeration postas ALLTID (även utan
 * nyhetsbrevscheck) ett ANONYMISERAT intention-event hit — för aggregerad
 * räkning i konverteringsvyn. Fältlista (AC2): [nivaNamn, period, pris] —
 * INGEN e-post, INGET namn, INGEN IP, INGEN personuppgift överhuvudtaget.
 * Med nyhetsbrevschecken ikryssad är det befintliga /api/email-flödet
 * orört (mejl kräver mottagare — kön postas aldrig utan e-post).
 *
 * Skrivs som system_events: type=konvertering_intention, severity=info,
 * details={nivaNamn, period, pris} — dokumenterat i /transparens.
 *
 * Pedagogisk analys — inte investeringsråd.
 */

const MAX_NIVA = 60;
const MAX_PRIS = 60;

/** Enkel in-memory rate-limit per process (10/min) — skyddar mot flooding. */
const senasteAnrop: number[] = [];
const MAX_ANROP_PER_MIN = 10;

export async function POST(req: NextRequest) {
  const nu = Date.now();
  while (senasteAnrop.length && nu - senasteAnrop[0] > 60_000) senasteAnrop.shift();
  if (senasteAnrop.length >= MAX_ANROP_PER_MIN) {
    return NextResponse.json(
      { ok: false, error: "För många intentioner — vänta en minut." },
      { status: 429 }
    );
  }
  senasteAnrop.push(nu);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Ogiltig JSON-body." }, { status: 400 });
  }

  // Endast nivå/period/pris tas emot — fältlistan är STÄNGD (AC2): okända
  // fält i bodyn avvisas aldrig högt, men lagras ALDRIG (persondata-skydd).
  const nivaNamn = typeof body.nivaNamn === "string" ? body.nivaNamn.trim().slice(0, MAX_NIVA) : "";
  const period = body.period === "manad" || body.period === "ar" ? body.period : "";
  const pris = typeof body.pris === "string" ? body.pris.trim().slice(0, MAX_PRIS) : "";

  if (!nivaNamn || !period) {
    return NextResponse.json(
      { ok: false, error: "nivaNamn och period (manad|ar) krävs." },
      { status: 400 }
    );
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      { ok: false, error: "Supabase ej konfigurerad — intentionen loggas inte." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "konvertering_intention",
        severity: "info",
        message: `[konvertering] intention: ${nivaNamn} (${period === "manad" ? "månadsvis" : "årsvis"})`.slice(0, 280),
        details: { nivaNamn, period, pris },
        source: "konvertering",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Skrivning misslyckades (Supabase ${res.status}).` },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Skrivning misslyckades (nätverk)." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, anonymiserad: true });
}
