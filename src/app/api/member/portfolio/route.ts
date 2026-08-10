import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import { join } from "path";

export const runtime = "nodejs";

const STOCKS_DIR = join(process.cwd(), "data", "stocks");

/**
 * POST /api/member/portfolio — klienten skickar in sin portfölj för analys.
 * 
 * Body: { memberId, name, holdings: [{ticker, company, shares, avgCost, sector}], riskTolerance }
 * 
 * Process:
 * 1. Spara portfölj + innehav till DB
 * 2. För varje innehav, försök hämta cached vågdata från data/stocks/[ticker]/waves.json
 * 3. Om cache finns, beräkna aggregerad våg för portföljen
 * 4. Sätt analysisStatus = "pending" (väntar på analytiker)
 * 5. Logga activity för admin
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, name, description, holdings = [], riskTolerance = "medium", cashPosition = 0 } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    if (holdings.length === 0) {
      return NextResponse.json({ error: "Portfölj måste ha minst 1 innehav" }, { status: 400 });
    }

    // Verify member exists
    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Medlem hittades inte" }, { status: 404 });
    }

    // Calculate total value (use avgCost if currentPrice missing)
    let totalValue = cashPosition;
    for (const h of holdings) {
      totalValue += (h.shares || 0) * (h.currentPrice || h.avgCost || 0);
    }

    // Create portfolio
    const portfolio = await db.clientPortfolio.create({
      data: {
        memberId,
        name: name || "Min portfölj",
        description: description || null,
        totalValue,
        cashPosition,
        riskTolerance,
        analysisStatus: "pending",
        submittedAt: new Date(),
        holdings: {
          create: await Promise.all(holdings.map(async (h: any) => {
            // Try to fetch cached wave data
            let waveMicro: string | null = null;
            let waveShort: string | null = null;
            let waveMedium: string | null = null;
            let waveLong: string | null = null;
            let waveMega: string | null = null;
            let waveScore: number | null = null;
            let waveConfidence: number | null = null;
            let usedCache = false;
            let cacheDate: Date | null = null;

            try {
              const wavePath = join(STOCKS_DIR, (h.ticker || "").toUpperCase(), "waves.json");
              const waveContent = await fs.readFile(wavePath, "utf-8");
              const waveData = JSON.parse(waveContent);
              waveMicro = waveData.micro?.position || null;
              waveShort = waveData.short?.position || null;
              waveMedium = waveData.medium?.position || null;
              waveLong = waveData.long?.position || null;
              waveMega = waveData.mega?.position || null;
              waveScore = waveData.score || null;
              waveConfidence = waveData.confidence || null;
              usedCache = true;
              cacheDate = new Date();
            } catch {
              // No cached data — analytiker måste fylla i manuellt
            }

            const weight = totalValue > 0 ? ((h.shares || 0) * (h.currentPrice || h.avgCost || 0) / totalValue) * 100 : 0;

            return {
              ticker: (h.ticker || "").toUpperCase(),
              company: h.company || h.ticker,
              sector: h.sector || null,
              shares: h.shares || 0,
              avgCost: h.avgCost || null,
              currentPrice: h.currentPrice || null,
              weight,
              waveMicro,
              waveShort,
              waveMedium,
              waveLong,
              waveMega,
              waveScore,
              waveConfidence,
              usedCache,
              cacheDate,
            };
          })),
        },
      },
      include: { holdings: true },
    });

    // Calculate aggregate wave score if all holdings have cache
    const cachedHoldings = portfolio.holdings.filter((h) => h.usedCache && h.waveScore !== null);
    if (cachedHoldings.length > 0) {
      const avgScore = cachedHoldings.reduce((sum, h) => sum + (h.waveScore || 0) * (h.weight / 100), 0);
      // Determine aggregate wave per horizon (majority vote weighted)
      const horizons = ["Micro", "Short", "Medium", "Long", "Mega"] as const;
      const avgWaves: any = {};
      for (const horizon of horizons) {
        const waveKey = `wave${horizon}`;
        const waveCounts: Record<string, number> = {};
        for (const h of cachedHoldings) {
          const w = (h as any)[waveKey];
          if (w) {
            waveCounts[w] = (waveCounts[w] || 0) + h.weight;
          }
        }
        const topWave = Object.entries(waveCounts).sort((a, b) => b[1] - a[1])[0];
        avgWaves[`avgWave${horizon}`] = topWave ? topWave[0] : null;
      }

      await db.clientPortfolio.update({
        where: { id: portfolio.id },
        data: {
          avgWaveScore: avgScore,
          ...avgWaves,
        },
      });
    }

    // Log activity
    try {
      await db.userActivity.create({
        data: {
          sessionId: member.sessionId || member.email,
          action: "portfolio_submitted",
          section: "member",
          targetType: "portfolio",
          targetId: portfolio.id,
          metadata: JSON.stringify({
            memberId,
            holdingsCount: holdings.length,
            totalValue,
            usedCache: cachedHoldings.length,
          }),
        },
      });
    } catch {}

    // Log system event for admin
    try {
      await db.systemEvent.create({
        data: {
          type: "portfolio_submitted",
          severity: "info",
          message: `Ny portfölj inskickad: ${member.email} — ${holdings.length} innehav, ${cachedHoldings.length} med cache`,
          details: JSON.stringify({ portfolioId: portfolio.id, memberId }),
          source: "member",
        },
      });
    } catch {}

    return NextResponse.json({
      portfolio,
      member,
      cachedCount: cachedHoldings.length,
      totalHoldings: holdings.length,
      message: cachedHoldings.length > 0
        ? `Portfölj mottagen. ${cachedHoldings.length}/${holdings.length} innehav hade sparad vågdata. Analytiker granskar och kompletterar.`
        : "Portfölj mottagen. Analytiker gör full manuell analys — du får notis när den är klar.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** GET /api/member/portfolio?memberId=xxx — hämta medlemmens portföljer. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    const portfolios = await db.clientPortfolio.findMany({
      where: { memberId },
      include: { holdings: { orderBy: { weight: "desc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ portfolios });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
