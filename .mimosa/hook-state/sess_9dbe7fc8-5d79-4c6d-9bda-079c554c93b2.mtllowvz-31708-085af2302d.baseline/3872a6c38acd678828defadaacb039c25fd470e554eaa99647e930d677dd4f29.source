import { NextRequest, NextResponse } from "next/server";
import { körVagfundament } from "@/lib/vagfundament-motor";
import { lasEllerHamta } from "@/lib/datacache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * VÅGFUNDAMENT — fundamentalvågornas ekosystem (VAGFUNDAMENT-SPEC P7).
 * GET  ?ticker=VOLV-B.ST        → enskild akties 20×5-matris
 * POST {tickers, vikter?}       → per aktie + portföljaggregering (P6)
 * Motor: src/lib/vagfundament-motor.ts (TS-port av python-motorn —
 * bitidentiskt verifierad; python saknas i Vercel Node-runtime).
 *
 * DATACACHEN (src/lib/datacache.ts): varje motor-rad cachas PER TICKER i samma
 * format som cron-fyllningen (06:00 UTC) — fundamentaldata förändras sällan,
 * så raderna serveras ur cachen upp till 12 h gamla och nätverket anropas
 * först vid cache-miss (lasEllerHamta fyller då på igen, "on-demand").
 */

type Indikator = {
  namn: string;
  kategori: string;
  niva: number | null;
  nivaKalla: "beraknad" | "osatt";
  nuvarde: number | null;
  enhet?: string | null;
  vager: Record<string, string>;
  momentum: Record<string, number | null>;
  medelBekraftad: Record<string, boolean | null>;
};

export type VagfundamentAnalys = {
  ticker: string;
  fel?: string;
  valuta?: string | null;
  dataPer?: string | null;
  indikatorer?: Record<string, Indikator>;
  matris?: Record<string, Record<string, number | null>>;
  kategorier?: Record<string, Record<string, number | null>>;
  total?: Record<string, number | null>;
  sammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  notering?: string;
  disclaimer?: string;
};

type VagfundamentPortfolj = {
  matris: Record<string, Record<string, number | null>>;
  kategorier: Record<string, Record<string, number | null>>;
  total: Record<string, number | null>;
  radTexter: string[];
  totalText: string;
  tackningProcent: number;
  notering?: string;
};

type MotorSvar = { tickers: VagfundamentAnalys[]; portfolj?: VagfundamentPortfolj };

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Max-ålder på cacherad fundamentalvåg-data: 12 h (720 min) — fundamentaldata förändras sällan. */
const CACHE_MAX_ALDER_MIN = 720;

/** Kör jobb i omgångar om `tak` — motorns egen parallellitet (4) håller
 * Yahoo-trycket vänligt när cachen är kall. Resultatet behåller indataordningen. */
async function iOmgangar<T>(jobb: (() => Promise<T>)[], tak = 4): Promise<T[]> {
  const ut: T[] = [];
  for (let i = 0; i < jobb.length; i += tak) {
    ut.push(...(await Promise.all(jobb.slice(i, i + tak).map((j) => j()))));
  }
  return ut;
}

/** GET /api/vagfundament?ticker=VOLV-B.ST — enskild akties fundamentalvågsmatris. */
export async function GET(req: NextRequest) {
  try {
    const ticker = new URL(req.url).searchParams.get("ticker") || "";
    if (!ticker || !TICKER_RE.test(ticker)) {
      return NextResponse.json({ error: "Ogiltig eller saknad ticker" }, { status: 400 });
    }
    // Cachen FÖRE nätverket: lasEllerHamta cachar motor-raden per ticker i
    // exakt samma format som cron-fyllningen (data/cache/vagfundament-{ticker}.json).
    const { data: analys, franCache } = await lasEllerHamta(
      ticker,
      "vagfundament",
      async () => (await körVagfundament({ tickers: [ticker] })).tickers[0] ?? null,
      CACHE_MAX_ALDER_MIN,
    );
    if (!analys) {
      return NextResponse.json({ error: "Motorn kunde inte köras" }, { status: 500 });
    }
    if (analys.fel) {
      return NextResponse.json({ tickers: [analys], franCache }, { status: 404 });
    }
    return NextResponse.json({ tickers: [analys], franCache });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** POST /api/vagfundament {tickers: [...], vikter?: {ticker: vikt}} — portföljaggregering (P6). */
export async function POST(req: NextRequest) {
  try {
    const kropp = await req.json().catch(() => ({}));
    const tickers: string[] = Array.isArray(kropp?.tickers) ? kropp.tickers.filter((t: unknown) => typeof t === "string" && TICKER_RE.test(t as string)) : [];
    if (tickers.length === 0) {
      return NextResponse.json({ error: "tickers krävs (1–12 stycken)" }, { status: 400 });
    }
    if (tickers.length > 12) {
      return NextResponse.json({ error: "Max 12 tickers per anrop" }, { status: 400 });
    }
    const vikter: Record<string, number> =
      kropp?.vikter && typeof kropp.vikter === "object"
        ? Object.fromEntries(
            Object.entries(kropp.vikter as Record<string, unknown>)
              .filter(([k, v]) => typeof k === "string" && typeof v === "number" && v > 0)
              .map(([k, v]) => [k, v as number])
          )
        : {};
    const harVikter = Object.keys(vikter).length > 0;
    const payload = harVikter ? { tickers, vikter } : { tickers };

    // Viktat läge: P6-portföljaggregeringen sker i motorn och kräver samtliga
    // rader + vikter i ETT anrop — därför delar alla cache-missar en och samma
    // (memoiserade) motorkörning i stället för ett nätverksanrop per ticker.
    let viktadKorning: Promise<MotorSvar> | null = null;
    const korViktad = (): Promise<MotorSvar> => (viktadKorning ??= körVagfundament(payload));

    // Cachen läses PER TICKER (samma radformat som cron-fyllningen) — nätverket
    // anropas endast för tickers utan frisk cacherad, och omgångarna om 4 håller
    // motorns interna parallellitet. Ordningen på rader bevaras.
    const perTicker = await iOmgangar(
      tickers.map((t) => async () =>
        lasEllerHamta(
          t,
          "vagfundament",
          async () => {
            if (harVikter) {
              const s = await korViktad();
              return s.tickers.find((r) => r.ticker === t) ?? null;
            }
            return (await körVagfundament({ tickers: [t] })).tickers[0] ?? null;
          },
          CACHE_MAX_ALDER_MIN,
        ),
      ),
    );
    const antalFranCache = perTicker.filter((r) => r.franCache).length;
    const analysRader = perTicker
      .map((r) => r.data)
      .filter((a): a is VagfundamentAnalys => a !== null);

    // Oviktat: svaret byggs rakt ur de per-ticker-cachade raderna. Viktat
    // (vikt-bevarande): portföljraden kan bara aggregeras av motorn — körningen
    // säkerställs även när alla tickers satt i cachen, och dess P6-del fogas till.
    const svar: MotorSvar = harVikter
      ? { tickers: analysRader, portfolj: (await korViktad()).portfolj }
      : { tickers: analysRader };
    if (!svar || !Array.isArray(svar.tickers)) {
      return NextResponse.json({ error: "Motorn kunde inte köras" }, { status: 500 });
    }
    return NextResponse.json({ ...svar, franCache: antalFranCache > 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
