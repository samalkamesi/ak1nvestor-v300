import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * VÅGFUNDAMENT — fundamentalvågornas ekosystem (VAGFUNDAMENT-SPEC P7).
 * GET  ?ticker=VOLV-B.ST        → enskild akties 20×5-matris
 * POST {tickers, vikter?}       → per aktie + portföljaggregering (P6)
 * Python-motor: scripts/vagfundament.py (python3 med python-fallback, som djupanalys).
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

function körPython(payload: Record<string, unknown>): Promise<MotorSvar | null> {
  return new Promise((resolve) => {
    // python3 (Vercel/Linux) med python-fallback (Windows) — kedjat utan race
    const forsok = (bin: string, next?: () => void) => {
      let barn: ReturnType<typeof spawn>;
      try {
        barn = spawn(bin, ["scripts/vagfundament.py"], { cwd: process.cwd() });
      } catch {
        if (next) next();
        else resolve(null);
        return;
      }
      let ut = "";
      let fickData = false;
      barn.on("error", () => {
        if (!fickData && next) next();
        else if (!fickData) resolve(null);
      });
      barn.stdin?.on("error", () => {});
      barn.stdout!.on("data", (d: any) => {
        ut += d;
        fickData = true;
      });
      barn.on("close", () => {
        if (!fickData && next) {
          next();
          return;
        }
        try {
          resolve(JSON.parse(ut));
        } catch {
          resolve(null);
        }
      });
      barn.stdin!.write(JSON.stringify(payload));
      barn.stdin!.end();
    };
    forsok("python3", () => forsok("python"));
  });
}

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** GET /api/vagfundament?ticker=VOLV-B.ST — enskild akties fundamentalvågsmatris. */
export async function GET(req: NextRequest) {
  try {
    const ticker = new URL(req.url).searchParams.get("ticker") || "";
    if (!ticker || !TICKER_RE.test(ticker)) {
      return NextResponse.json({ error: "Ogiltig eller saknad ticker" }, { status: 400 });
    }
    const svar = await körPython({ tickers: [ticker] });
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
    const svar = await körPython(payload);
    if (!svar || !Array.isArray(svar.tickers)) {
      return NextResponse.json({ error: "Motorn kunde inte köras" }, { status: 500 });
    }
    return NextResponse.json(svar);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
