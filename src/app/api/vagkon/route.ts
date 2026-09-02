import { NextRequest, NextResponse } from "next/server";
import { raknaVagkon } from "@/lib/vagkon";
import { hamtaArsserie } from "@/lib/vagfundament-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * VÅGKON — historik + deterministisk percentilkon per AK1TS-horisont (Fas C).
 * GET ?ticker=VOLV-B.ST&serie=pris  → 24 månads-slutkurser (Yahoo v8 chart, 2y/1mo)
 * GET ?ticker=VOLV-B.ST&serie=v01   → årlig omsättningsserie (vagfundament-motorns
 *                                      annualTotalRevenue — samma Yahoo-väg som motorn)
 * Svar: {ticker, serie, historik, vagkon} där vagkon = raknaVagkon(historik) —
 * ren matematik, ingen slump, alltid identisk för samma historik.
 */

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** SSRF-skydd: endast Yahoos chart-värdar är tillåtna (query1 primärt, query2 reserv). */
const ALLOWED_CHART_HOSTS = ["query1.finance.yahoo.com", "query2.finance.yahoo.com"] as const;

const SERIER: Record<string, "pris" | "v01"> = { pris: "pris", v01: "v01" };

/** Månadsslutkurser (2 år) direkt ur Yahoos chart-API — graceful: null vid fel. */
async function hamtaManadsCloses(ticker: string): Promise<number[] | null> {
  const sokvag = `/v8/finance/chart/${encodeURIComponent(ticker)}?range=2y&interval=1mo`;
  for (const host of ALLOWED_CHART_HOSTS) {
    const url = `https://${host}${sokvag}`;
    // Dubbelkontroll mot allow-listen (sökvägen är fast — hosten kan aldrig bli användarstyrd).
    if (!ALLOWED_CHART_HOSTS.includes(new URL(url).host as (typeof ALLOWED_CHART_HOSTS)[number])) continue;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (AK1A)", Accept: "application/json" },
        signal: AbortSignal.timeout(8000), // 8 s — Yahoo svarar normalt på < 1 s
        redirect: "error", // omdirigering = värd utanför allow-listen => avbryt
        cache: "no-store",
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        chart?: { result?: { indicators?: { quote?: { close?: unknown[] }[] } }[] };
      };
      const closes = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
      if (!Array.isArray(closes)) continue;
      const rensade = closes.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
      if (rensade.length > 0) return rensade;
    } catch {
      // timeout/nätverksfel → fortsätt med reservvärden
    }
  }
  return null;
}

/** GET /api/vagkon?ticker=VOLV-B.ST&serie=pris|v01 — historik + vågkon. */
export async function GET(req: NextRequest) {
  try {
    const param = new URL(req.url).searchParams;
    const ticker = (param.get("ticker") || "").trim();
    if (!ticker || !TICKER_RE.test(ticker)) {
      return NextResponse.json({ error: "Ogiltig eller saknad ticker" }, { status: 400 });
    }
    const serie = SERIER[(param.get("serie") || "pris").toLowerCase()];
    if (!serie) {
      return NextResponse.json({ error: "Okänd serie — använd serie=pris eller serie=v01" }, { status: 400 });
    }

    // serie=v01: vagfundament-motorns årliga serie (annualTotalRevenue).
    // serie=pris: analys-motorn exponerar inte stängdkurser i sin typ — då hämtas
    // chart-slutkurserna direkt från Yahoo (query1/query2) i stället för att fuskas fram.
    const historik =
      serie === "v01"
        ? await hamtaArsserie(ticker, "TotalRevenue")
        : await hamtaManadsCloses(ticker);

    if (!historik || historik.length < 3) {
      return NextResponse.json(
        { error: `Ingen användbar historik för ${ticker} (serie=${serie}) — Yahoo svarade inte eller för få punkter` },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticker, serie, historik, vagkon: raknaVagkon(historik) });
  } catch (e: unknown) {
    const meddelande = e instanceof Error ? e.message : "Okänt fel";
    return NextResponse.json({ error: meddelande }, { status: 500 });
  }
}
