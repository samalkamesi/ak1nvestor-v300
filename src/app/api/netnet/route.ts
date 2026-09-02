import { NextRequest, NextResponse } from "next/server";
import { skannaNetnet } from "@/lib/netnet-motor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TICKER_RE = /^[A-Za-z0-9.\-]{1,12}$/;

/**
 * NET-NET-SKANNERNS DATAVÄG — GET ?tickers=A,B,C (max 15) skannar exakt
 * de begärda; utan parametrar körs hela universum (25 i två batchar).
 * Route i stället för server action: samma exekveringskontext som de
 * bevisat fungerande analys-route:erna.
 */
export async function GET(req: NextRequest) {
  try {
    const begärda = (new URL(req.url).searchParams.get("tickers") || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && TICKER_RE.test(t))
      .slice(0, 15);
    const rader = begärda.length > 0
      ? await skannaNetnet(begärda)
      : (await Promise.all([
          skannaNetnet(UNIVERSUM.slice(0, 15)),
          skannaNetnet(UNIVERSUM.slice(15)),
        ])).flat();
    return NextResponse.json({
      genererad: new Date().toISOString(),
      rader,
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
