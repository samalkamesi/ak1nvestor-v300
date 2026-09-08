import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/granskningslogg — granskningslogg-visaren (FAS L3 våg 88,
 * STYRELSE-V86-L3-ADMIN.md §C) — underpanelen i Medlemmar 👥.
 *
 * GET ?type=alla|andringar|medlem|medlem_progress|medlem_andring|admin-andring
 *    &limit=50 → system_events (type-in.vitlista, order=created_at.desc,
 *    limit-tak 50 HÅRDKODAT — kontraktet: "limit-tak 50, hårdkodad").
 *    "andringar" = ändringshistoriken medlem_andring/admin-andring (L3-audit,
 *    retention-organets vitlista våg 86) — panelens default-vy. "alla" är
 *    supermängden (medlem + medlem_progress + andrings-typerna).
 *
 * Koppling: varje POST /api/admin/medlemmar hamnar här inom sekunder
 * (same-table write). Visning sker i panelen: tid, type-badge, meddelande,
 * details-JSON (kollapsad), severity-färg — Systemevents-mönstret.
 *
 * SKYDD: requireAdmin(req) — default tillat=["admin"]. Läser ENDAST
 * system_events (inga /auth/v1-anrop). GDPR/P6: visar redan sanerade rader —
 * rutten lägger ALDRIG till e-post i klartext i något svar.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Vitlistade filter-värden → PostgREST-filter (aldrig fritext mot REST:et). */
const TYP_FILTER: ReadonlyMap<string, string> = new Map([
  ["alla", "in.(medlem,medlem_progress,medlem_andring,admin-andring)"],
  ["andringar", "in.(medlem_andring,admin-andring)"],
  ["medlem", "eq.medlem"],
  ["medlem_progress", "eq.medlem_progress"],
  ["medlem_andring", "eq.medlem_andring"],
  ["admin-andring", "eq.admin-andring"],
]);

/** Kontraktets hårda tak — ignorera större limit-begäran. */
const MAX_RADER = 50;

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req); // default tillat=["admin"]
  if (skydd) return skydd;

  const typRaw = (req.nextUrl.searchParams.get("type") || "alla").trim();
  const filter = TYP_FILTER.get(typRaw) ?? TYP_FILTER.get("alla");
  const limitRaw = Number.parseInt(req.nextUrl.searchParams.get("limit") || "", 10);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, MAX_RADER) : MAX_RADER;

  // Bygg-hermetik (variabler-lagring.ts våg 79): aldrig nätverk under next build.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.json({ events: [] });
  }

  const rest = getSupabaseRest();
  if (!rest) {
    return NextResponse.json({ error: "Supabase ej konfigurerad" }, { status: 503 });
  }

  try {
    const res = await fetch(
      rest.origin +
        "/rest/v1/system_events?type=" +
        filter +
        "&select=type,severity,message,details,source,created_at&order=created_at.desc&limit=" +
        String(limit),
      {
        headers: rest.headers,
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Kunde inte läsa granskningsloggen." }, { status: 502 });
    }
    const rader = (await res.json().catch(() => null)) as unknown[] | null;
    if (!Array.isArray(rader)) {
      return NextResponse.json({ error: "Oväntat svar från event-lagret." }, { status: 502 });
    }
    return NextResponse.json({ events: rader, limit });
  } catch {
    return NextResponse.json({ error: "Nätverksfel mot event-lagret." }, { status: 502 });
  }
}
