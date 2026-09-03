import { NextRequest, NextResponse } from "next/server";
import { lasCache } from "@/lib/datacache";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/notiser — notis-systemets server-sida.
 *
 * GET  → levererar UNDERLAGET för de automatiska notiserna: dagens pass-aktie
 *        (samma deterministiska rotation som /api/dagens-pass) och vågkartans
 *        sammanfattning (system_events via Supabase — det är DETTA servern
 *        kan läsa som klienten inte kan). Själva fästandet sker i localStorage
 *        på klienten (src/lib/notiser.ts) — därför returneras data, inte
 *        färdiga notiser. Billigt på purpose: motorn körs ALDRIG här, namnet
 *        läses ur datacachen med ticker som fallback.
 *
 * POST → { action: "las Alla" | "lasAlla" | "rensa" } — bekräftelse-krok för
 *        notis-centrets knappar. Mutationen itself bor i klientens
 *        localStorage; POST:en validerar och kvitterar (och är kopplingspunkten
 *        framtida telemetri kan anknytas till utan klientändring).
 */

// Speglar ROTATION + datumHash i /api/dagens-pass — håll de två synkade vid
// ändringar (samma salt 1 → samma aktie samma dag som passet visar).
const ROTATION: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "SHB-B.ST",
  "SWED-A.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "NDA-SE.ST",
  "SKF-B.ST",
  "ALFA.ST",
];

/** FNV-1a-hash med salt (bitidentisk med dagens-pass-routen). */
function datumHash(datum: string, salt: number): number {
  const s = `${salt}:${datum}`;
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Dagens pass-aktie: ticker via rotationen, namn ur datacachen om motor-rad
 *  redan finns (cron 06:00 UTC fyller den) — annars ticker som visningsnamn.
 *  ALDRIG ett motoranrop: notiser ska vara billiga. */
async function dagensPassAktie(datum: string): Promise<{ ticker: string; namn: string }> {
  const ticker = ROTATION[datumHash(datum, 1) % ROTATION.length];
  let namn = ticker;
  try {
    const rad = await lasCache(ticker, "analys");
    const dataNamn = (rad?.data as { namn?: string } | null)?.namn;
    if (typeof dataNamn === "string" && dataNamn.trim()) namn = dataNamn.trim();
  } catch {
    /* cache oläsbar — ticker räcker som namn */
  }
  return { ticker, namn };
}

/** Dagens vågkarta: senaste system_events-rad med type=vagscan. Endast om den
 * är GENERERAD IDAG räknas den som "dagens vågmätning" — en veckogammal karta
 * ska aldrig hälsas som färsk. Sammanfattningen byggs i vagkartans eget format
 * (▲ ▼ ◼-läsarnas råtal, utan symboler — de läggs till i UI:t). */
async function dagensVagkarta(
  datum: string
): Promise<{ sammanfattning: string; genererad: string } | null> {
  const sb = getSupabaseRest();
  if (!sb) return null;
  try {
    const res = await fetch(
      `${sb.origin}/rest/v1/system_events?type=eq.vagscan&select=details,created_at&order=created_at.desc&limit=1`,
      { headers: sb.headers, cache: "no-store", signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const rader = (await res.json()) as Array<{
      details: Record<string, unknown> | null;
      created_at: string;
    }>;
    const rad = rader[0];
    if (!rad || !rad.details) return null;

    const us = rad.details.universumSammanfattning as
      | { impulsvag?: number; korrigering?: number; basbygge?: number }
      | undefined;
    if (!us || typeof us.impulsvag !== "number") return null;

    const genererad =
      typeof rad.details.genererad === "string" ? rad.details.genererad : rad.created_at;
    if (genererad.slice(0, 10) !== datum) return null; // inte dagens mätning

    const sammanfattning = `${us.impulsvag} impulsvågor · ${us.korrigering ?? 0} korrigeringar · ${us.basbygge ?? 0} basbyggen`;
    return { sammanfattning, genererad };
  } catch {
    return null; // tyst — vågkarta-notisen är valfri lyx, aldrig felkälla
  }
}

export async function GET() {
  const datum = new Date().toISOString().slice(0, 10);
  const [pass, vagkarta] = await Promise.all([dagensPassAktie(datum), dagensVagkarta(datum)]);
  return NextResponse.json({ datum, pass, vagkarta });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
  const action = typeof body?.action === "string" ? body.action.trim() : "";

  if (action === "lasAlla" || action === "las Alla" || action === "rensa") {
    // Mutationen skedde klient-sida (localStorage) — kvittera normaliserat.
    return NextResponse.json({ ok: true, action: action === "rensa" ? "rensa" : "lasAlla" });
  }
  return NextResponse.json(
    { error: 'Ogiltig action — använd "las Alla" eller "rensa".' },
    { status: 400 }
  );
}
