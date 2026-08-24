import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Analys = {
  ticker: string;
  fel?: string;
  kallor?: number;
  data?: { pris: number; hojd52: number; lag52: number; pos52: number; sigma_ar: number | null; atr14: number | null; voltrend: number | null };
  vager?: Record<string, string>;
  matris25?: Record<string, number>;
  sammanfattning?: { bull: number; bear: number; neutral: number };
  notering?: string;
};

function körPython(tickers: string[]): Promise<Analys[]> {
  return new Promise((resolve) => {
    // python3 (Vercel/Linux) med python-fallback (Windows) — kedjat utan race
    const forsok = (bin: string, next?: () => void) => {
      let barn: ReturnType<typeof spawn>;
      try {
        barn = spawn(bin, ["scripts/analysis_engine.py"], { cwd: process.cwd() });
      } catch {
        if (next) next();
        else resolve([]);
        return;
      }
      let ut = "";
      let fickData = false;
      barn.on("error", () => {
        if (!fickData && next) next();
        else if (!fickData) resolve([]);
      });
      barn.stdin.on("error", () => {});
      barn.stdout.on("data", (d: any) => {
        ut += d;
        fickData = true;
      });
      barn.on("close", () => {
        if (!fickData && next) {
          next();
          return;
        }
        try {
          resolve(JSON.parse(ut).tickers || []);
        } catch {
          resolve([]);
        }
      });
      barn.stdin.write(JSON.stringify({ tickers }));
      barn.stdin.end();
    };
    forsok("python3", () => forsok("python"));
  });
}

const TEORIER = ["elliott", "fibonacci", "gann", "lucas", "volym"];
const HORIZONTER = ["mikro", "kort", "medellang", "lang", "mega"];
const VAGVIKT: Record<string, number> = { "impulsvåg": 1, korrigering: -1, basbygge: 0, osatt: 0 };

/** GET /api/member/portfolio/djupanalys?portfolioId=xxx — 5×5×4-ekosystem per aktie + portfölj. */
export async function GET(req: NextRequest) {
  try {
    const portfolioId = new URL(req.url).searchParams.get("portfolioId");
    if (!portfolioId) {
      return NextResponse.json({ error: "portfolioId krävs" }, { status: 400 });
    }
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    const hRes = await fetch(
      `${rest.origin}/rest/v1/client_holdings?portfolio_id=eq.${encodeURIComponent(portfolioId)}&select=*`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    const holdings: Array<{ id: string; ticker: string; company: string | null; shares: number | null; current_price: number | null; avg_cost: number | null }> =
      (await hRes.json()) || [];
    if (holdings.length === 0) {
      return NextResponse.json({ error: "Portföljen har inga innehav" }, { status: 404 });
    }

    // Värden och vikter
    const rader = holdings.map((h) => {
      const pris = h.current_price ?? h.avg_cost ?? 0;
      return { ...h, varde: pris * (h.shares || 0) };
    });
    const totalVarde = rader.reduce((s, r) => s + r.varde, 0);
    // Topp 10 per vikt (motorgräns), resten redovisas som ej analyserade
    const sorterade = [...rader].sort((a, b) => b.varde - a.varde);
    const attAnalysera = sorterade.slice(0, 10);
    const overskott = sorterade.slice(10);

    const analyser = await körPython(attAnalysera.map((r) => r.ticker));
    const perTicker = new Map(analyser.map((a) => [a.ticker.toUpperCase(), a]));

    // Portföljens viktade 25-cellmatris + vågprofil (5 horisonter)
    const matrisPort: Record<string, number> = {};
    let matrisVikt = 0;
    const vagProfil: Record<string, { impulsvåg: number; korrigering: number; basbygge: number; osatt: number }> = {};
    for (const hz of HORIZONTER) vagProfil[hz] = { "impulsvåg": 0, korrigering: 0, basbygge: 0, osatt: 0 };

    for (const r of attAnalysera) {
      const a = perTicker.get(r.ticker.toUpperCase());
      if (!a || a.fel || !a.matris25) continue;
      const vikt = totalVarde > 0 ? r.varde / totalVarde : 0;
      matrisVikt += vikt;
      for (const nyckel of Object.keys(a.matris25)) {
        matrisPort[nyckel] = (matrisPort[nyckel] || 0) + a.matris25[nyckel] * vikt;
      }
      if (a.vager) {
        for (const hz of HORIZONTER) {
          const v = a.vager[hz] as string;
          vagProfil[hz][v] = (vagProfil[hz][v] || 0) + vikt;
        }
      }
    }

    // Normalisera mot analyserad vikt (celler -1..+1)
    for (const nyckel of Object.keys(matrisPort)) {
      matrisPort[nyckel] = Math.round((matrisPort[nyckel] / Math.max(1e-9, matrisVikt)) * 100) / 100;
    }
    for (const hz of HORIZONTER) {
      for (const k of Object.keys(vagProfil[hz])) {
        vagProfil[hz][k] = Math.round((vagProfil[hz][k] / Math.max(1e-9, matrisVikt)) * 100);
      }
    }

    const celler = Object.values(matrisPort);
    const bull = celler.filter((x) => x > 0.15).length;
    const bear = celler.filter((x) => x < -0.15).length;
    const bias =
      bull > bear * 1.5 ? "BULLISH BIAS" : bear > bull * 1.5 ? "BEARISH BIAS" : "NEUTRAL BIAS";

    // Aggregerad risk: viktad sigma + koncentration
    let viktSigma = 0;
    let sigmaVikt = 0;
    for (const r of attAnalysera) {
      const a = perTicker.get(r.ticker.toUpperCase());
      const vikt = totalVarde > 0 ? r.varde / totalVarde : 0;
      if (a?.data?.sigma_ar != null) {
        viktSigma += a.data.sigma_ar * vikt;
        sigmaVikt += vikt;
      }
    }
    const portSigma = sigmaVikt > 0 ? viktSigma / sigmaVikt : null;
    const koncentration = totalVarde > 0 ? (sorterade[0]?.varde || 0) / totalVarde : 0;

    const innehavUt = attAnalysera.map((r) => {
      const a = perTicker.get(r.ticker.toUpperCase());
      return {
        ticker: r.ticker,
        bolag: r.company || r.ticker,
        varde: Math.round(r.varde),
        viktProcent: Math.round((totalVarde > 0 ? r.varde / totalVarde : 0) * 1000) / 10,
        analys: a && !a.fel ? a : { ticker: r.ticker, fel: a?.fel || "kunde inte hämtas" },
      };
    });

    return NextResponse.json({
      genererad: new Date().toISOString(),
      totalVarde: Math.round(totalVarde),
      analysTackning: Math.round(matrisVikt * 100),
      innehav: innehavUt,
      ejAnalyserade: overskott.map((r) => ({ ticker: r.ticker, orsak: "utanför topp-10 per vikt" })),
      portfolj: {
        matris25: matrisPort,
        celler: { bull, bear, neutral: 25 - bull - bear, bias },
        vagProfil,
        viktadSigma: portSigma ? Math.round(portSigma * 1000) / 1000 : null,
        koncentrationProcent: Math.round(koncentration * 100),
      },
      teorier: TEORIER,
      horisonter: HORIZONTER,
      notering:
        "Signaler beräknade av AK1A Analysis Engine (Python) från pris/volymdata via oberoende källor (Yahoo Finance primärt, Stooq sekundärt). Heuristiska proxy-mätare — pedagogiskt verktyg, inte investeringsråd.",
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
