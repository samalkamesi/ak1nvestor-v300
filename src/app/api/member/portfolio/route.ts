import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const HEADERS = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

/** POST /api/member/portfolio — skicka in portfölj */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, name, description, totalValue, cashPosition, riskTolerance, holdings } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "Supabase inte konfigurerad" }, { status: 500 });
    }

    // Create portfolio
    const portfolioRes = await fetch(`${SUPABASE_URL}/rest/v1/client_portfolios`, {
      method: "POST",
      headers: { ...HEADERS(), Prefer: "return=representation" },
      body: JSON.stringify({
        member_id: memberId,
        name: name || "Min portfölj",
        description: description || null,
        total_value: totalValue || 0,
        cash_position: cashPosition || 0,
        risk_tolerance: riskTolerance || "medium",
        analysis_status: "pending",
        submitted_at: new Date().toISOString(),
      }),
    });
    const portfolio = await portfolioRes.json();

    if (!portfolio || !portfolio[0]) {
      return NextResponse.json({ error: "Kunde inte skapa portfölj" }, { status: 500 });
    }

    const portfolioId = portfolio[0].id;

    // Create holdings
    if (holdings && holdings.length > 0) {
      const holdingsData = holdings.map((h: any) => ({
        portfolio_id: portfolioId,
        ticker: h.ticker,
        company: h.company || null,
        sector: h.sector || null,
        shares: h.shares || 0,
        avg_cost: h.avgCost || null,
        current_price: h.currentPrice || null,
        weight: h.weight || 0,
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/client_holdings`, {
        method: "POST",
        headers: { ...HEADERS(), Prefer: "return=minimal" },
        body: JSON.stringify(holdingsData),
      });
    }

    return NextResponse.json({ portfolio: portfolio[0], holdingsCount: holdings?.length || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/** GET /api/member/portfolio?memberId=xxx — hämta portföljer */
export async function GET(req: NextRequest) {
  try {
    const memberId = new URL(req.url).searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ portfolios: [] });
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/client_portfolios?member_id=eq.${memberId}&select=*&order=created_at.desc`,
      { headers: HEADERS() }
    );
    const portfolios = await res.json();

    // Get holdings for each portfolio
    const portfoliosWithHoldings = await Promise.all(
      (portfolios || []).map(async (p: any) => {
        const holdingsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/client_holdings?portfolio_id=eq.${p.id}&select=*`,
          { headers: HEADERS() }
        );
        const holdings = await holdingsRes.json();
        return { ...p, holdings: holdings || [] };
      })
    );

    return NextResponse.json({ portfolios: portfoliosWithHoldings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
