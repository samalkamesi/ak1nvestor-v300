import { NextRequest, NextResponse } from "next/server";
import { skannaNetnet, type NetnetRad } from "@/lib/netnet-motor";
import { lasEllerHamta } from "@/lib/datacache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/** Max-ålder på cacherad netnet-rad: 12 h (720 min) — NCAV bygger på senaste
 * balansräkningen som förändras sällan. */
const CACHE_MAX_ALDER_MIN = 720;

/**
 * NET-NET-SKANNERNS DATAVÄG — GET ?tickers=A,B,C (max 15) skannar exakt
 * de begärda; utan parametrar körs hela universum (25 tickers).
 * Route i stället för server action: samma exekveringskontext som de
 * bevisat fungerande analys-route:erna.
 *
 * DATACACHEN (src/lib/datacache.ts): cachen läses PER TICKER i samma
 * radformat som cron-fyllningen — universumet behöver inte längre batchas i
 * två skannaNetnet-anrop; varje ticker serveras ur cachen inom fönstret och
 * hämtas individuellt (i skannerns egen parallellitet) bara vid cache-miss.
 */

/** Kör jobb i omgångar om `tak` — skannerns egen parallellitet (4) håller
 * Yahoo-trycket vänligt när cachen är kall. Resultatet behåller ordningen. */
async function iOmgangar<T>(jobb: (() => Promise<T>)[], tak = 4): Promise<T[]> {
  const ut: T[] = [];
  for (let i = 0; i < jobb.length; i += tak) {
    ut.push(...(await Promise.all(jobb.slice(i, i + tak).map((j) => j()))));
  }
  return ut;
}

export async function GET(req: NextRequest) {
  try {
    const begärda = (new URL(req.url).searchParams.get("tickers") || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && TICKER_RE.test(t))
      .slice(0, 15);
    const lista = begärda.length > 0 ? begärda : UNIVERSUM;
    const perTicker = await iOmgangar(
      lista.map((t) => async () =>
        lasEllerHamta(
          t,
          "netnet",
          async () => (await skannaNetnet([t]))[0] ?? null,
          CACHE_MAX_ALDER_MIN,
        ),
      ),
    );
    const rader = perTicker
      .map((r) => r.data)
      .filter((r): r is NetnetRad => r !== null);
    const antalFranCache = perTicker.filter((r) => r.franCache).length;
    return NextResponse.json({
      genererad: new Date().toISOString(),
      rader,
      franCache: antalFranCache > 0,
      notering:
        "NCAV beräknad på senaste balansräkning via Yahoo Finance — pedagogiskt verktyg, inte investeringsråd.",
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Skanningen misslyckades" },
      { status: 500 }
    );
  }
}

const UNIVERSUM = [
  "VOLV-B.ST", "SAAB-B.ST", "ATCO-A.ST", "SAND.ST", "SHB-B.ST",
  "SWED-A.ST", "ESSITY-B.ST", "ERIC-B.ST", "AZN.ST", "NDA-SE.ST",
  "SKF-B.ST", "ALFA.ST", "NCC-B.ST", "BALD-B.ST", "INDU-C.ST",
  "KINV-B.ST", "LATO-B.ST", "EVO.ST", "SINCH.ST", "SBB-B.ST",
  "CATE.ST", "NYF-B.ST", "FABG.ST", "BEIA-B.ST", "HM-B.ST",
];
