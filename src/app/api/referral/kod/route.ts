import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import {
  genereraTipskod,
  lasMedlemsidForKod,
  lasTipskodForMedlem,
  saneraRefKod,
  skrivTipskod,
} from "@/lib/referral";

/**
 * POST /api/referral/kod — m10 STEG 1: eleven skapar sin tipskod (OPT-IN).
 *
 * DelaKort-knappen "Skapa din tipskod" anropar detta med sin e-post — samma
 * identifiering som hela v1-medlemsflödet (/api/member/register tar också
 * bara e-post; members-local är localStorage-baserad). Eleven MÅSTE vara
 * registrerad medlem: e-post utan medlemrad ⇒ 404 (skapa konto först).
 *
 * GDPR (m10 §3 alt C): koden är en framställd slumpidentifierare som lagras
 * som KONTODATA (koppling members.id ↔ kod) i system_events — ingen hash,
 * ingen ny datakategori, ingen social graf. FÖRNYELSE = spärr: gamla koden
 * raderas (best-effort) och den nya gäller (senaste-vinner, lager.ts-mönstret).
 *
 * FOMO-FÖRBUD (§0/§3): svaret innehåller INGEN belöning, räknare eller
 * deadline — bara koden. Steg 2 (tack/badges) väntar på J1–J2.
 *
 * Pedagogisk analys — inte investeringsråd.
 */

/** Enkel in-memory rate-limit per process (6/min) — mönstret från
 *  /api/konvertering/intention, skyddar mot kod-flooding. */
const senasteAnrop: number[] = [];
const MAX_ANROP_PER_MIN = 6;

/** Kollisionsskydd: 32^8 ≈ 1,1 biljarder koder — dubbelkolla ändå, max 3 försök. */
const MAX_FORSOK = 3;

export async function POST(req: NextRequest) {
  const nu = Date.now();
  while (senasteAnrop.length && nu - senasteAnrop[0] > 60_000) senasteAnrop.shift();
  if (senasteAnrop.length >= MAX_ANROP_PER_MIN) {
    return NextResponse.json(
      { ok: false, error: "För många försök — vänta en minut." },
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

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@") || email.length > 320) {
    return NextResponse.json({ ok: false, error: "email krävs." }, { status: 400 });
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      { ok: false, error: "Supabase ej konfigurerad — tipskoden kan inte sparas." },
      { status: 503 }
    );
  }

  try {
    // Eleven måste vara medlem (samma uppslag som register-GET:en).
    const medlemRes = await fetch(
      `${rest.origin}/rest/v1/members?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
      { headers: rest.headers, signal: AbortSignal.timeout(8000) }
    );
    if (!medlemRes.ok) {
      return NextResponse.json(
        { ok: false, error: `Medlemsuppslag misslyckades (Supabase ${medlemRes.status}).` },
        { status: 502 }
      );
    }
    const medlem = (await medlemRes.json()) as { id?: string }[];
    const medlemsid = medlem[0]?.id;
    if (!medlemsid) {
      return NextResponse.json(
        { ok: false, error: "Skapa ett gratis konto först — tipskoden följer medlemskapet." },
        { status: 404 }
      );
    }

    // Har eleven redan en AKTIV kod? Idempotent: returnera den (senaste-vinner)
    // i stället för att spärra och förnya vid dubbelklick/omladdning.
    const befintlig = await lasTipskodForMedlem(rest, medlemsid);
    if (befintlig) {
      return NextResponse.json({ ok: true, kod: befintlig, ny: false });
    }

    // Slumpa fram en ledig kod (kollisionskoll mot lagret, max 3 försök).
    let kod = "";
    for (let i = 0; i < MAX_FORSOK; i++) {
      const kandidat = genereraTipskod();
      const upptagen = await lasMedlemsidForKod(rest, kandidat);
      if (!upptagen) {
        kod = kandidat;
        break;
      }
    }
    if (!kod || !saneraRefKod(kod)) {
      return NextResponse.json(
        { ok: false, error: "Kunde inte slumpa fram en ledig kod — försök igen." },
        { status: 503 }
      );
    }

    const skriven = await skrivTipskod(rest, medlemsid, kod);
    if (!skriven) {
      return NextResponse.json(
        { ok: false, error: "Skrivning misslyckades — försök igen om en stund." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, kod, ny: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Okänt fel." },
      { status: 500 }
    );
  }
}
