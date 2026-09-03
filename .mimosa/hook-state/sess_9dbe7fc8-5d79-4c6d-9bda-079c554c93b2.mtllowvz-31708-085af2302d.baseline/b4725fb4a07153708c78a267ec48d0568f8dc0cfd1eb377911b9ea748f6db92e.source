import { NextRequest, NextResponse } from "next/server";
import { skannaKonfluens } from "@/lib/konfluens-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Ticker-format som Yahoo accepterar (samma regex som övriga motorer). */
const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Max tickers per anrop — motorn tar tio i en rutschkana. */
const MAX_TICKERS = 10;

/**
 * Fast universum — tio välkända svenska Large Cap-tickers. Körs när
 * GET anropas utan parametrar (komponentens "Skanna universum"-knapp).
 */
const UNIVERSUM: readonly string[] = [
  "VOLV-B.ST",
  "SAAB-B.ST",
  "ATCO-A.ST",
  "SAND.ST",
  "SHB-B.ST",
  "ESSITY-B.ST",
  "ERIC-B.ST",
  "AZN.ST",
  "SKF-B.ST",
  "HM-B.ST",
];

/** Rensa och validera en ticker-lista (sträng-array ur request-kropp eller query). */
function rensaTickers(rå: unknown): string[] {
  if (!Array.isArray(rå)) return [];
  return rå
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0 && TICKER_RE.test(t))
    .slice(0, MAX_TICKERS);
}

/**
 * KONFLUENSRADARNS DATAVÄG — route i stället för server action (samma
 * exekveringskontext som /api/netnet och /api/vagfundament: server
 * actions levererade inte Yahoo-data).
 *
 * GET  utan parametrar    → fast universum (10 svenska tickers)
 * GET  ?tickers=A,B,C     → exakt de begärda (max 10)
 * POST {tickers:[...]}    → exakt de begärda (max 10)
 *
 * Motorn (src/lib/konfluens-motor.ts) garanterar värdegolvet FÖRE
 * vågorna: värde först, fundamental vågstart därefter, prisvågläge
 * sist — fem oberoende källor måste tala samman. P8: exakta vikter
 * och trösklar stannar i motorn, aldrig i svaret.
 */
export async function GET(req: NextRequest) {
  try {
    const begärda = rensaTickers(
      (new URL(req.url).searchParams.get("tickers") || "").split(","),
    );
    const tickers = begärda.length > 0 ? begärda : [...UNIVERSUM];
    const rader = await skannaKonfluens(tickers);
    return NextResponse.json({
      genererad: new Date().toISOString(),
      universum: begärda.length > 0 ? "eget urval" : "fast universum",
      rader,
      notering:
        "Konfluensradarn väger värdegolv mot vågor som vänder — pedagogisk analys, inte investeringsråd.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Skanningen misslyckades" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let kropp: unknown = null;
    try {
      kropp = await req.json();
    } catch {
      kropp = null;
    }
    const begärda = rensaTickers(
      kropp !== null && typeof kropp === "object"
        ? (kropp as { tickers?: unknown }).tickers
        : null,
    );
    if (begärda.length === 0) {
      return NextResponse.json(
        { error: `Skicka { "tickers": [...] } — max ${MAX_TICKERS} tickers per anrop.` },
        { status: 400 },
      );
    }
    const rader = await skannaKonfluens(begärda);
    return NextResponse.json({
      genererad: new Date().toISOString(),
      universum: "eget urval",
      rader,
      notering:
        "Konfluensradarn väger värdegolv mot vågor som vänder — pedagogisk analys, inte investeringsråd.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Skanningen misslyckades" },
      { status: 500 },
    );
  }
}
