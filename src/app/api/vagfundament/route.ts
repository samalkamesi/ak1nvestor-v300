import { NextRequest, NextResponse } from "next/server";
import { körVagfundament } from "@/lib/vagfundament-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * VÅGFUNDAMENT — fundamentalvågornas ekosystem (VAGFUNDAMENT-SPEC P7).
 * GET  ?ticker=VOLV-B.ST        → enskild akties 20×5-matris
 * POST {tickers, vikter?}       → per aktie + portföljaggregering (P6)
 * Motor: src/lib/vagfundament-motor.ts (TS-port av python-motorn —
 * bitidentiskt verifierad; python saknas i Vercel Node-runtime).
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

/** GET /api/vagfundament?ticker=VOLV-B.ST — enskild akties fundamentalvågsmatris. */
export async function GET(req: NextRequest) {
  try {
    const ticker = new URL(req.url).searchParams.get("ticker") || "";
    if (!ticker || !TICKER_RE.test(ticker)) {
      return NextResponse.json({ error: "Ogiltig eller saknad ticker" }, { status: 400 });
    }
    const svar = await körVagfundament({ tickers: [ticker] });
    const analys = svar?.tickers?.[0];
    if (!analys) {
      return NextResponse.json({ error: "Motorn kunde inte köras" }, { status: 500 });
    }
    if (analys.fel) {
      return NextResponse.json({ tickers: [analys] }, { status: 404 });
    }
    return NextResponse.json(svar);
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
    const payload = Object.keys(vikter).length > 0 ? { tickers, vikter } : { tickers };
    const svar = await körVagfundament(payload);
    if (!svar || !Array.isArray(svar.tickers)) {
      return NextResponse.json({ error: "Motorn kunde inte köras" }, { status: 500 });
    }
    return NextResponse.json(svar);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
