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

/** POST /api/admin/upload-analysis — analytiker laddar upp analys */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberId, portfolioId, type, title, summary, body: analysisBody, portfolioOverview, riskAssessment, waveAnalysis, recommendations, nextSteps, confidence, isPublished } = body;

    if (!memberId || !title || !SUPABASE_URL || !SUPABASE_KEY) {
      return NextResponse.json({ error: "memberId, title krävs + Supabase" }, { status: 400 });
    }

    // Create analysis
    const createRes = await fetch(`${SUPABASE_URL}/rest/v1/client_analyses`, {
      method: "POST",
      headers: { ...HEADERS(), Prefer: "return=representation" },
      body: JSON.stringify({
        member_id: memberId,
        portfolio_id: portfolioId || null,
        analysis_type: type || "full_portfolio",
        title,
        summary: summary || null,
        body: analysisBody || null,
        portfolio_overview: portfolioOverview || null,
        risk_assessment: riskAssessment || null,
        wave_analysis: waveAnalysis || null,
        recommendations: recommendations || null,
        next_steps: nextSteps || null,
        confidence: confidence || "MEDEL",
        is_published: isPublished ?? false,
        published_at: isPublished ? new Date().toISOString() : null,
      }),
    });
    const analysis = await createRes.json();

    // Update portfolio status if portfolioId
    if (portfolioId) {
      await fetch(`${SUPABASE_URL}/rest/v1/client_portfolios?id=eq.${portfolioId}`, {
        method: "PATCH",
        headers: HEADERS(),
        body: JSON.stringify({
          analysis_status: "completed",
          analyzed_at: new Date().toISOString(),
        }),
      });
    }

    // Log system event
    await fetch(`${SUPABASE_URL}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...HEADERS(), Prefer: "return=minimal" },
      body: JSON.stringify({
        event_type: "analysis_uploaded",
        severity: "info",
        message: `Analys uppladdad: ${title} (medlem: ${memberId})`,
        source: "admin-upload-analysis",
      }),
    });

    return NextResponse.json({ analysis: analysis[0] || analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
