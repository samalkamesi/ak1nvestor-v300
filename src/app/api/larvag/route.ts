import { NextRequest, NextResponse } from "next/server";

import { lasMedlemSession } from "@/lib/medlem-auth";
import { lasMedlemProgress, TOM_MEDLEM_PROGRESS } from "@/lib/medlem-progress";
import { getSupabaseRest } from "@/lib/supabase-rest";
import { raknaLarvag, type LarvagRek, type LasandeKontext } from "@/lib/larvag";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/larvag — LÄRVÄGENS SERVERKÄRNA (våg 88, B1-LARVAG).
 *
 * GET ?fas=&lag=&streak=&antal=&exkludera=:
 *   1. lasMedlemSession → progress via lasMedlemProgress (requestskopad,
 *      §B.4) — gäst ⇒ TOM profil (samma tippedekonomi som kurstips).
 *   2. lasande-kontext: fas/lästillstånd/streak som SAMMANFATTAD query
 *      (eko-mönstret — inga personuppgifter, inget som identifierar) +
 *      ANONYMA quiz-svaghetsräknare (type=quiz_svaghet, noll personuppgifter
 *      — argmax-källan, läsningen polystrar aldrig fram någon elev).
 *   3. raknaLarvag (larvag.ts — REN kärna) ⇒ topp-N rek med varför-rader
 *      från de vinNANDE reglerna. Deterministiskt: samma indata ⇒ samma svar.
 *
 * Personliga värden når ALDRIG en CDN-cache (force-dynamic; ISR-låsta
 * kurssidor läser denna ALDRIG i SSR-passet — korten hydreras klient-side).
 * Fel/tömhet ⇒ tomt rek-array (200) — ett tips får aldrig krascha en yta.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Event-typen för anonyma quiz-svagheter (skrivs av /api/quiz/svaghet). */
const SVAGHET_EVENT_TYP = "quiz_svaghet";
/** Argmaxen läser senaste räknare — 1000 räcker gott för topp-signalet. */
const SVAGHET_LAS_TAK = 1000;

const LASANDE_TILLSTAND = new Set<LasandeKontext["lasTillstand"]>([
  "nybörjare",
  "växande",
  "avancerad",
  "fas2-redo",
]);

/** URL-kodat PostgREST-filtervärde — RÅTT, aldrig citerat (lager.ts våg 55). */
function fv(v: string): string {
  return encodeURIComponent(v);
}

/**
 * lasSvagheter — ANONYM mängd: antal quiz_svaghet-rader per slug (senaste
 * först, EN sida). Kastar ALDRIG; byggfas/ej konfigurerat/fel ⇒ {} (motorn
 * klarar en värld utan svaghetssignal — regeln vilar då tyst).
 */
async function lasSvagheter(): Promise<Record<string, number>> {
  if (process.env.NEXT_PHASE === "phase-production-build") return {};
  const rest = getSupabaseRest();
  if (!rest) return {};
  try {
    const url =
      rest.origin +
      "/rest/v1/system_events?type=eq." +
      fv(SVAGHET_EVENT_TYP) +
      "&select=details->>slug&order=id.desc&limit=" +
      String(SVAGHET_LAS_TAK);
    const res = await fetch(url, {
      headers: rest.headers,
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!res.ok) return {};
    const rader = (await res.json()) as Array<{ slug?: string | null }>;
    if (!Array.isArray(rader)) return {};
    const ut: Record<string, number> = {};
    for (const r of rader) {
      if (typeof r?.slug !== "string" || r.slug === "") continue;
      ut[r.slug] = (ut[r.slug] ?? 0) + 1;
    }
    return ut;
  } catch {
    return {}; // tyst fall-back — svaghetsregeln vilar
  }
}

export async function GET(req: NextRequest) {
  // ── Sammanfattad lasande-kontext ur query (eko-mönstret — aldrig rådata) ──
  const q = req.nextUrl.searchParams;
  const fasRaw = Number(q.get("fas"));
  const fas: LasandeKontext["fas"] = fasRaw === 2 || fasRaw === 3 ? fasRaw : 1;
  const lagRaw = q.get("lag") ?? "";
  const lasTillstand: LasandeKontext["lasTillstand"] = LASANDE_TILLSTAND.has(lagRaw as LasandeKontext["lasTillstand"])
    ? (lagRaw as LasandeKontext["lasTillstand"])
    : "nybörjare";
  const streak = Number.isFinite(Number(q.get("streak")))
    ? Math.max(0, Math.min(9999, Math.floor(Number(q.get("streak")))))
    : 0;
  const antal = Number.isFinite(Number(q.get("antal")))
    ? Math.max(1, Math.min(5, Math.floor(Number(q.get("antal")))))
    : 3;
  const exkluderaRaw = q.get("exkludera") ?? "";
  const exkluderaSlug = /^[a-z0-9-]{1,200}$/i.test(exkluderaRaw) ? exkluderaRaw : undefined;

  // ── Session → progress (gäst ⇒ TOM — tippedekonomin gäller alla) ──────────
  const session = await lasMedlemSession(req);
  const progress = session ? await lasMedlemProgress(session.authId) : TOM_MEDLEM_PROGRESS;

  // ── Svagheterna (anonym mängd) + kärnan ────────────────────────────────────
  const svagheter = await lasSvagheter();
  const rek: LarvagRek[] = raknaLarvag(
    progress,
    { lasTillstand, fas, streak, svagheter, exkluderaSlug },
    { antal },
  );

  return NextResponse.json({ inloggad: session !== null, rek });
}
