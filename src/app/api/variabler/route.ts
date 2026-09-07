import { NextResponse } from "next/server";

import { lasPriserGallande } from "@/lib/variabler-lagring";
import { PRISER } from "@/lib/variabler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/variabler — PUBLIK läsning av gällande priser (VÅG 79,
 * ADMIN-MEGA steg 1 — BYGGKONTRAKTETS API-KONTRAKT).
 *
 * Svar: { priser: { …sammanslagna värden } } — sammanslagningen sker i
 * lasPriserGallande: fil-defaults (PRISER ur priser.json) + Supabase-
 * override senaste-vinner per kontraktets nyckel-mappning.
 *
 * Cache 60 s (Cache-Control public max-age=60 + stale-while-revalidate=300;
 * lasPriserGallande har dessutom modul-cache 5 min per process) — panelens
 * ändring syns inom fönstret UTAN deploy, vilket är hela steg 1:s kundvärde.
 *
 * ALDRIG 500: Supabase-fel/tom databas faller TYST tillbaka på filvärdena —
 * prod får aldrig bli utan priser (kontraktet). Publik ruta: inga hemligheter,
 * inga nycklar, bara pris-talen.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */
export async function GET() {
  try {
    const priser = await lasPriserGallande();
    return NextResponse.json(
      { priser },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch {
    // Deterministisk sista utvägen: fil-defaults (lasPriserGallande kastar
    // inte i praktiken — detta är bältet utanpå byxorna).
    return NextResponse.json(
      { priser: { ...PRISER } },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  }
}
