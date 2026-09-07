import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";
import {
  VARIABEL_NYCKLAR,
  NYCKEL_TILL_PRIS_FALT,
  lasAndringsLogg,
  lasGallandePoster,
  sparaVariabel,
  VariabelSparningsFel,
} from "@/lib/variabler-lagring";
import { PRISER } from "@/lib/variabler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/variabler — VARIABELPANELENS data-rutt (VÅG 79, ADMIN-MEGA
 * steg 1 — BYGGKONTRAKTETS API-KONTRAKT).
 *
 * GET  → { poster: [{nyckel, varde, filvarde, kalla, andrad}],
 *          logg: [senaste 20 type=variabel-andring-rader] }
 * POST { nyckel, varde } → skriver system_events type="variabel" (värde-raden,
 *          senaste-vinner vid läsning) + type="variabel-andring" (revisbarhet:
 *          nyckel/gammalt/nytt/av — raderas aldrig av skrivvägen).
 *
 * SKYDD (kontraktets säkerhetskrav — skärpt våg 79): requireAdmin på ALLA
 * metoder. I NODE_ENV=production utan ADMIN_PASSWORD satt ⇒ 500 med tydligt
 * fel (dev-fallback "AK1A-2026" gäller ENBAST i development — panelen kan
 * ändra PRISER, insatserna är höjda). Rate-limit 10 misslyckade/min.
 *
 * LÅS (ordförandevillkor 2 + kontraktet): nyckeln MÅSTE finnas i den
 * härdkodade vitlistan (VARIABEL_NYCKLAR) — panelen kan aldrig skapa nya
 * nivåer, aldrig röra gratis-Fas-1 (ligger utanför priser.json och vitlistan)
 * och värdet måste vara ett heltal ≥ 0. Ogiltigt ⇒ 400.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

// ── GET — panelens vy: gällande + filvärde per nyckel + ändringsloggen ──────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const overrides = await lasGallandePoster();
  const poster = VARIABEL_NYCKLAR.map((nyckel) => {
    const falt = NYCKEL_TILL_PRIS_FALT[nyckel];
    const filvarde = PRISER[falt];
    const override = overrides.get(nyckel);
    return {
      nyckel,
      varde: override ? override.varde : filvarde, // mergeat: senaste-vinner
      filvarde,
      kalla: override ? override.kalla : "fil",
      andrad: override ? override.andrad : null,
    };
  });

  const logg = await lasAndringsLogg(20);
  return NextResponse.json({ poster, logg });
}

// ── POST — { nyckel, varde }: validera → skriv värde-rad + logg-rad ─────────

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

/** Normalisera varde: number, eller siffersträng ("249") — annars null.
 *  Vakten: HELTAL ≥ 0 (kontraktet) — allt annat avvisas med 400. */
function normaliseraVarde(v: unknown): number | null {
  const n =
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.trim()) : NaN;
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skydd = requireAdmin(req, body);
  if (skydd) return skydd;

  const nyckel = typeof body.nyckel === "string" ? body.nyckel.trim() : "";
  if (!(VARIABEL_NYCKLAR as readonly string[]).includes(nyckel)) {
    return NextResponse.json(
      { error: "Ogiltig nyckel — panelen kan endast ändra kontraktets vitlistade prisnycklar." },
      { status: 400 },
    );
  }

  const varde = normaliseraVarde(body.varde);
  if (varde === null) {
    return NextResponse.json(
      { error: "varde måste vara ett heltal ≥ 0." },
      { status: 400 },
    );
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json(
      { error: "Supabase ej konfigurerat — variabler kan inte sparas utan lagret (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." },
      { status: 500 },
    );
  }

  try {
    const resultat = await sparaVariabel(nyckel, varde);
    return NextResponse.json({
      ok: true,
      nyckel,
      gammalt: resultat.gammalt,
      nytt: resultat.nytt,
      meddelande:
        resultat.gammalt === resultat.nytt
          ? "Värdet sparades (oförändrat) — ny skrivning loggas för revisbarhet."
          : "Värdet sparades och gäller inom cache-fönstret (publik läsning 60 s, modul-cache 5 min).",
    });
  } catch (e) {
    const meddelande = e instanceof VariabelSparningsFel ? e.message : "Okänt fel vid sparandet — värdet sparades INTE.";
    return NextResponse.json({ error: meddelande }, { status: 500 });
  }
}
