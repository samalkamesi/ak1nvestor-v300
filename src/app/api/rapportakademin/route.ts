import { NextRequest, NextResponse } from "next/server";
import { lasMedlemSession } from "@/lib/medlem-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { minimeradBedomningRad, valideraMinimeradRad } from "@/lib/rapportakademin/minimering";
import { harArt13Kvitto, sparaArt13Kvitto } from "@/lib/rapportakademin/art13";
import {
  RA_BEDOMNING_EVENT,
  RA_RADERING_EVENT,
  raderaEleversBedomningar,
} from "@/lib/rapportakademin/gallring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/rapportakademin — Fas 1-flödets laggrundade yta (LAGBESLUT
 * STYRELSE-MUADCVYF-CG1JM2, 2026-09-21). Samma mönster som /api/medlem:
 * action i kroppen, autentisering via httpOnly-kakan, ALDRIG tokens i
 * svaret.
 *
 *   action=art13     — kvittera att art 13-infon visats vid insamlingen
 *   action=bedomning — lagra EN bedömning (GRINDARNA: medlem inloggad +
 *                      art 13-kvitto + minimeringsvalidering — annars NEK)
 *   action=export    — hämta elevens bedömningar som fil (art 20-tänk:
 *                      portabilitet när prenumerationen går ut)
 *   action=radera    — radera elevens bedömningar + kvitto (art 17)
 *
 * Juridik: allt inom utbildningsundantaget (2007:528 2 kap 5 §) —
 * övningsresultat är utbildning, aldrig rådgivning.
 */

function fv(s: string): string {
  return encodeURIComponent(s);
}

export async function POST(req: NextRequest) {
  const session = await lasMedlemSession(req);
  if (session === null) {
    return NextResponse.json({ fel: "Logga in först." }, { status: 401 });
  }
  const authId = session.authId;
  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ fel: "Tjänsten är inte konfigurerad." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ fel: "Ogiltig förfrågan." }, { status: 400 });
  }
  const action = typeof body.action === "string" ? body.action : "";

  // ── art13: kvitto på visad information vid insamlingstillfället ────────
  if (action === "art13") {
    const ok = await sparaArt13Kvitto(authId);
    if (!ok) return NextResponse.json({ fel: "Kvittot kunde inte sparas." }, { status: 502 });
    return NextResponse.json({ ok: true });
  }

  // ── bedomning: intagsgrinden — ALLA tre grindar måste vara gröna ───────
  if (action === "bedomning") {
    const rad = typeof body.rad === "object" && body.rad !== null ? body.rad : null;
    if (rad === null) {
      return NextResponse.json({ fel: "Bedömningsrad saknas." }, { status: 400 });
    }
    const r = rad as Record<string, unknown>;

    // Grind 1 — minimering (art 5.1 c): okända fält ⇒ NEK, inte tyst bortskapad.
    const val = valideraMinimeradRad(r);
    if (!val.ok) {
      return NextResponse.json(
        { fel: "Radens fält överstiger minimeringslistan (GDPR art 5.1 c).", okandaFalt: val.okandaFalt },
        { status: 400 }
      );
    }

    // Grind 2 — art 13-kvitto MÅSTE finnas innan något lagras.
    if (!(await harArt13Kvitto(authId))) {
      return NextResponse.json(
        { fel: "Informationen om dina data måste visas och kvitteras före den första övningen (GDPR art 13).", kod: "art13_saknas" },
        { status: 409 }
      );
    }

    // Grind 3 — skalra ned till de fem fälten och lagra (SENASTE-VINNER-lager).
    const minimerad = minimeradBedomningRad(r);
    if (minimerad.ovningsId === "") {
      return NextResponse.json({ fel: "ovningsId saknar värde." }, { status: 400 });
    }
    try {
      const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
        method: "POST",
        headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          type: RA_BEDOMNING_EVENT,
          severity: "info",
          message: `[ra] bedömning ${minimerad.ovningsId.slice(0, 40)}: ${minimerad.ratt ? "rätt" : "fel"}`,
          details: { ...minimerad, authId: authId.toLowerCase() },
          source: "rapportakademin",
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return NextResponse.json({ fel: "Bedömningen kunde inte sparas." }, { status: 502 });
      }
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ fel: "Bedömningen kunde inte sparas." }, { status: 502 });
    }
  }

  // ── export: elevens bedömningar som portabel fil (art 20-tänk) ────────
  if (action === "export") {
    try {
      const res = await fetch(
        `${rest.origin}/rest/v1/system_events?type=eq.${RA_BEDOMNING_EVENT}` +
          `&details->>authid=eq.${fv(authId.toLowerCase())}` +
          `&select=details&order=created_at.desc,id.desc&limit=10000`,
        { headers: rest.headers, signal: AbortSignal.timeout(10000) }
      );
      if (!res.ok) {
        return NextResponse.json({ fel: "Exporten misslyckades." }, { status: 502 });
      }
      const rader = (await res.json()) as { details?: Record<string, unknown> }[];
      const poster = rader
        .map((x) => (x.details && typeof x.details === "object" ? x.details : null))
        .filter((d): d is Record<string, unknown> => d !== null);
      return NextResponse.json({
        ok: true,
        format: "rapportakademin-export-v1",
        antal: poster.length,
        poster,
        skapad: new Date().toISOString(),
      });
    } catch {
      return NextResponse.json({ fel: "Exporten misslyckades." }, { status: 502 });
    }
  }

  // ── radera: elevens begäran om radering (art 17) + kvitto ──────────────
  if (action === "radera") {
    const n = await raderaEleversBedomningar(
      authId,
      "art 17 — elevens begäran (LAGBESLUT 2026-09-21)",
      RA_RADERING_EVENT
    );
    if (n === -1) {
      return NextResponse.json({ fel: "Raderingen misslyckades." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, raderade: n });
  }

  return NextResponse.json({ fel: "Ogiltigt action." }, { status: 400 });
}
