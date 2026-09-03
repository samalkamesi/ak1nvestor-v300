import { NextRequest, NextResponse } from "next/server";
import {
  skannaKonfluens,
  MAX_TICKER_KONFLUENS,
  type KonfluensRad,
} from "@/lib/konfluens-motor";
import {
  körVagfundament,
  type VagfundamentAnalys,
  type VagfundamentPortfolj,
} from "@/lib/vagfundament-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * AK1A PRO — B2B-ANALYSEN (Fas D-MVP, forskning-b2b.md 3.3).
 *
 * POST { tickers: [...], vikter?: { TICKER: vikt } } → samlad B2B-analys-JSON:
 *   - konfluensrader per ticker (skannaKonfluens — fem dimensioner + klass),
 *   - vågfundament per ticker + portföljaggregering (körVagfundament, P6),
 *   - universum-sammanfattning (klassfördelning, viktad konfluens, divergens).
 *
 * Dataväg: ROUTE, aldrig server action (samma exekveringskontext som
 * /api/konfluens och /api/vagfundament — server actions levererade inte
 * Yahoo-data). Båda motorerna körs PARALLELLT via Promise.all.
 *
 * P8 SEKRETESS: interna vikter/trösklar stannar i motorerna — svaret innehåller
 * aldrig hemlig know-how, bara klasser/poäng/utdata. CSV-import-regeln från
 * forskning-b2b 4.2 gäller: indata är instrument + vikter, ALDRIG personuppgifter.
 *
 * Pedagogiskt verktyg — inte investeringsråd.
 */

/** Ticker-format som Yahoo accepterar (samma regex som övriga motorer). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Max tickers per anrop (konfluensmotorns rutschkana). */
const MAX_TICKERS = MAX_TICKER_KONFLUENS; // 10

/** Rensa och validera en ticker-lista (strängarray ur request-kroppen). */
function rensaTickers(rå: unknown): string[] {
  if (!Array.isArray(rå)) return [];
  const rensade: string[] = [];
  for (const t of rå) {
    if (typeof t !== "string") continue;
    const ticker = t.trim().toUpperCase();
    if (ticker.length === 0 || !TICKER_RE.test(ticker)) continue;
    if (!rensade.includes(ticker)) rensade.push(ticker); // dubbletter slås ihop
    if (rensade.length >= MAX_TICKERS) break;
  }
  return rensade;
}

/**
 * Sanera vikter: endast nycklar som matchar begärda tickers behålls, värden
 * måste vara ändliga positiva tal. Normalisering sker i vågfundamentmotorn
 * (_normaliseraVikter) — här städas bara skräp bort.
 */
function sanaVikter(rå: unknown, tickers: string[]): Record<string, number> {
  if (rå === null || typeof rå !== "object" || Array.isArray(rå)) return {};
  const ut: Record<string, number> = {};
  for (const [k, v] of Object.entries(rå as Record<string, unknown>)) {
    const ticker = k.trim().toUpperCase();
    if (!tickers.includes(ticker)) continue;
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    ut[ticker] = v;
  }
  return ut;
}

/** Klassfördelning + viktad/ovan konfluens + divergensräkning. */
function universumSammanfattning(
  rader: KonfluensRad[],
  vikter: Record<string, number>,
): {
  antal: number;
  antalKonfluens: number;
  klassFordelning: Record<string, number>;
  snittKonfluens: number | null;
  viktadKonfluens: number | null;
  divergensPositiv: number;
  divergensNegativ: number;
} {
  const klassFordelning: Record<string, number> = {};
  let summa = 0;
  let n = 0;
  let vSumma = 0;
  let vVikt = 0;
  let divergensPositiv = 0;
  let divergensNegativ = 0;
  let antalKonfluens = 0;
  for (const r of rader) {
    if (r.klass !== null) {
      klassFordelning[r.klass] = (klassFordelning[r.klass] ?? 0) + 1;
      if (r.klass === "Konfluens — värde möter vändande vågor") antalKonfluens += 1;
    }
    if (typeof r.konfluens === "number") {
      summa += r.konfluens;
      n += 1;
      const v = vikter[r.ticker];
      if (typeof v === "number" && v > 0) {
        vSumma += r.konfluens * v;
        vVikt += v;
      }
    }
    if (r.divergens === "positiv") divergensPositiv += 1;
    if (r.divergens === "negativ") divergensNegativ += 1;
  }
  return {
    antal: rader.length,
    antalKonfluens,
    klassFordelning,
    snittKonfluens: n > 0 ? Math.round(summa / n) : null,
    viktadKonfluens: vVikt > 0 ? Math.round(vSumma / vVikt) : null,
    divergensPositiv,
    divergensNegativ,
  };
}

export async function POST(req: NextRequest) {
  try {
    let kropp: unknown = null;
    try {
      kropp = await req.json();
    } catch {
      kropp = null;
    }
    const obj = kropp !== null && typeof kropp === "object" ? (kropp as { tickers?: unknown; vikter?: unknown }) : {};
    const tickers = rensaTickers(obj.tickers);
    if (tickers.length === 0) {
      return NextResponse.json(
        {
          error: `Skicka { "tickers": [...] } — max ${MAX_TICKERS} tickers per anrop (format t.ex. "VOLV-B.ST").`,
        },
        { status: 400 },
      );
    }
    const vikter = sanaVikter(obj.vikter, tickers);

    // Båda motorerna parallellt — en motor som havererar dödar aldrig hela svaret.
    const [konfluensR, vagfundamentR] = await Promise.allSettled([
      skannaKonfluens(tickers),
      körVagfundament({ tickers, ...(Object.keys(vikter).length > 0 ? { vikter } : {}) }),
    ]);

    const rader: KonfluensRad[] =
      konfluensR.status === "fulfilled" ? konfluensR.value : [];
    const vagfundament: { tickers: VagfundamentAnalys[]; portfolj?: VagfundamentPortfolj } =
      vagfundamentR.status === "fulfilled"
        ? {
            tickers: vagfundamentR.value?.tickers ?? [],
            portfolj: vagfundamentR.value?.portfolj,
          }
        : { tickers: [] };

    if (rader.length === 0 && vagfundament.tickers.length === 0) {
      return NextResponse.json(
        { error: "Motorerna kunde inte köras (datakällorna svarade inte) — försök igen om en stund." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      genererad: new Date().toISOString(),
      analysensOmfattning: {
        begarda: Array.isArray(obj.tickers) ? obj.tickers.length : tickers.length,
        analyserade: tickers.length,
        maxTickers: MAX_TICKERS,
      },
      rader,
      vagfundament,
      sammanfattning: universumSammanfattning(rader, vikter),
      disclaimer:
        "Pedagogisk analys — inte investeringsråd. Poäng och klasser är metodik-utdata (AKM1 · AK1TS · Konfluens), aldrig köp- eller säljsignaler.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysen misslyckades" },
      { status: 500 },
    );
  }
}
