import { NextRequest, NextResponse } from "next/server";
import {
  raknaEkoInsikter,
  raknaKallsystem,
  lasPortfoljForMedlem,
  renSlugLista,
  type EkoKlientkontext,
} from "@/lib/eko-koppling";
import { INTRESSE_NYCKLAR, type IntresseNyckel } from "@/lib/tracer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/eko — EKOSYSTEMETS SAMLADE INTELLIGENS (samverkansmotorn).
 *
 * Returnerar { insikter: EkoInsikt[], genererad, kallsystem: string[] } —
 * insikter som bara uppstår när systemen DELAR sin kunskap om eleven
 * (tracer+kurstips, vågkarta+portfölj, quiz+veckoplan, signal-bus+notiser,
 * Fas 2-analys). Visas i admin (beteende-panelen) och kan trådas in i Min
 * Sida (assistent-panelen).
 *
 * ELEVENS KONTEXT — FRIVILLIG OCH SAMMANFATTAD (P8/PGD, samma filosofi som
 * /api/tracer): panelerna skickar med lasKlientkontext():s sammanfattning som
 * query-parametrar — ALDRIG råa sökvägar eller personuppgifter:
 *
 *   ?niva=7                       — nivå 1–100 (member-local)
 *   &klara=v01-forsaljningstillvaxt,v02-arr-tillvaxt
 *   &streak=4                     — streak-antal
 *   &aktivTid=5400                — aktiva sekunder (tracern)
 *   &toppIntresse=teknisk         — teknisk|fundamental|portfölj|beteende
 *   &intressen=teknisk,beteende   — aktiva spår (intresse-bredd)
 *   &quizRatt=6&quizFel=4         — quiz-poäng
 *   &portfoljSektorer=teknik      — portföljens sektorer (om kända)
 *   &memberId=…                   — ELLER låt servern läsa portföljen i
 *                                   Supabase (client_portfolios/holdings)
 *
 * Utan parametrar körs gäst-läget — motorn andas ändå (statiska signaler +
 * Fas 2-hälsning). Pedagogisk analys — inte investeringsråd.
 */

// ── Query-tolkning (allt saniterat + boundat innan det når motorn) ───────────

function tal(p: URLSearchParams, namn: string, max: number): number {
  const n = Math.round(Number(p.get(namn)));
  return Number.isFinite(n) && n >= 0 ? Math.min(n, max) : 0;
}

function slugLista(p: URLSearchParams, namn: string, max: number): string[] {
  const rå = p.get(namn);
  if (!rå) return [];
  return renSlugLista(rå.split(","), max);
}

function toppIntresse(p: URLSearchParams): IntresseNyckel | null {
  const rå = p.get("toppIntresse");
  return rå && (INTRESSE_NYCKLAR as readonly string[]).includes(rå)
    ? (rå as IntresseNyckel)
    : null;
}

/** Sektorer tillåter mellanslag/& ("bank & finans") — ej slug-syntax. */
function sektorLista(p: URLSearchParams, max: number): string[] {
  const rå = p.get("portfoljSektorer");
  if (!rå) return [];
  const ut: string[] = [];
  for (const del of rå.split(",")) {
    const sek = del.trim().toLowerCase().slice(0, 40);
    if (sek && /^[\wåäö&\- ]+$/.test(sek) && !ut.includes(sek) && ut.length < max) ut.push(sek);
  }
  return ut;
}

/** "teknisk,beteende" → { teknisk: 1, beteende: 1 } — poängen spelar ingen
 *  roll här, bara BREDDEN (antal aktiva spår) matar Fas 2-analysen. */
function intresseProfil(p: URLSearchParams): Record<string, number> {
  const ut: Record<string, number> = {};
  const rå = p.get("intressen");
  if (!rå) return ut;
  for (const del of rå.split(",")) {
    const nyckel = del.trim();
    if ((INTRESSE_NYCKLAR as readonly string[]).includes(nyckel)) ut[nyckel] = 1;
  }
  return ut;
}

// ── GET: ekosystemets samlade intelligens ────────────────────────────────────

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;

  // Portföljen: antingen direkt (portfoljSektorer) eller via Supabase om
  // memberId angavs — lasPortfoljForMedlem är fail-safe och returnerar tomt
  // läge utan konfig/fel, aldrig kast.
  const sektorer = sektorLista(p, 24);
  const memberId = p.get("memberId")?.trim().slice(0, 64) || "";
  let portfoljAntal = sektorer.length;
  if (memberId && sektorer.length === 0) {
    const pf = await lasPortfoljForMedlem(memberId);
    portfoljAntal = pf.antal;
    sektorer.push(...pf.sektorer);
  }

  const kontext: EkoKlientkontext = {
    niva: Math.max(1, Math.min(100, tal(p, "niva", 100))),
    klaraKurser: slugLista(p, "klara", 60),
    streakAntal: tal(p, "streak", 3650),
    aktivTidSek: tal(p, "aktivTid", 40_000_000),
    toppIntresse: toppIntresse(p),
    intresseProfil: intresseProfil(p),
    "quiz ratt": tal(p, "quizRatt", 100_000),
    "quiz fel": tal(p, "quizFel", 100_000),
    portfoljAntal,
    portfoljSektorer: sektorer,
  };

  const insikter = await raknaEkoInsikter(kontext);

  return NextResponse.json({
    insikter,
    genererad: new Date().toISOString(),
    kallsystem: raknaKallsystem(insikter),
    notering:
      "Ekosystemets samverkansmotor — systemens samlade intelligens om eleven. " +
      "Pedagogisk analys, inte investeringsråd.",
  });
}
