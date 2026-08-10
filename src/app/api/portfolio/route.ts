import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/portfolio?sessionId=xxx — lista användarens portföljer. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId krävs" }, { status: 400 });
    }

    const portfolios = await db.portfolio.findMany({
      where: { sessionId },
      orderBy: { updatedAt: "desc" },
      include: { holdings: true },
    });

    return NextResponse.json({ portfolios });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST /api/portfolio — skapa ny portfölj. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      name,
      description,
      cashPosition,
      holdings = [],
    } = body;

    if (!sessionId || !name) {
      return NextResponse.json({ error: "sessionId och name krävs" }, { status: 400 });
    }

    // Beräkna scores från holdings
    const totalAkm1 = holdings.reduce((sum: number, h: any) => sum + (h.akm1Total || 0), 0);
    const avgAkm1 = holdings.length > 0 ? totalAkm1 / holdings.length : 0;

    const portfolio = await db.portfolio.create({
      data: {
        sessionId,
        name,
        description: description || null,
        cashPosition: cashPosition || 0,
        totalValue: holdings.reduce((sum: number, h: any) => sum + (h.weight || 0), 0),
        riskScore: avgAkm1,
        holdings: {
          create: holdings.map((h: any) => ({
            ticker: h.ticker,
            company: h.company,
            sector: h.sector || null,
            weight: h.weight || 0,
            shares: h.shares || null,
            entryPrice: h.entryPrice || null,
            currentPrice: h.currentPrice || null,
            costBasis: h.costBasis || null,
            akm1Scores: h.akm1Scores ? JSON.stringify(h.akm1Scores) : null,
            akm1Total: h.akm1Total || null,
            technicalAnalysis: h.technicalAnalysis ? JSON.stringify(h.technicalAnalysis) : null,
            technicalScore: h.technicalScore || null,
            fundamentalAnalysis: h.fundamentalAnalysis ? JSON.stringify(h.fundamentalAnalysis) : null,
            fundamentalScore: h.fundamentalScore || null,
            wavePosition: h.wavePosition || null,
            waveTimeframe: h.waveTimeframe || null,
            waveConfidence: h.waveConfidence || null,
            thesis: h.thesis || null,
            risks: h.risks || null,
            catalysts: h.catalysts || null,
          })),
        },
      },
      include: { holdings: true },
    });

    return NextResponse.json({ portfolio });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
