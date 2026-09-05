import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getSupabaseRest } from "@/lib/supabase-rest";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * POST /api/admin/upload-analysis — analytiker laddar upp analys.
 *
 * SKYDD (VÅG 63 bygg-1, O4-robusthet §5): requireAdmin (x-admin-password,
 * timing-säkert enligt fas2-access-mönstret) — skriver analysrader och
 * publiclyerar dem, fick aldrig vara öppen.
 */
export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const body = await req.json();
    const { memberId, portfolioId, type, title, summary, body: analysisBody, portfolioOverview, riskAssessment, waveAnalysis, recommendations, nextSteps, confidence, isPublished } = body;

    const rest = getSupabaseRest();
    if (!memberId || !title || !rest) {
      return NextResponse.json({ error: "memberId, title krävs + Supabase" }, { status: 400 });
    }

    // Create analysis
    const createRes = await fetch(`${rest.origin}/rest/v1/client_analyses`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        member_id: memberId,
        portfolio_id: portfolioId || null,
        type: type || "full_portfolio",
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
      await fetch(`${rest.origin}/rest/v1/client_portfolios?id=eq.${portfolioId}`, {
        method: "PATCH",
        headers: { ...rest.headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_status: "completed",
          analyzed_at: new Date().toISOString(),
        }),
      });
    }

    // Log system event
    await fetch(`${rest.origin}/rest/v1/system_events`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        type: "analysis_uploaded",
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
