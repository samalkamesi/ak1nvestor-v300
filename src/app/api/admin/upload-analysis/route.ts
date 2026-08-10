import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload-analysis — analytiker laddar upp analys för en klient.
 * 
 * Body: {
 *   memberId, portfolioId?, type, title, summary, body,
 *   portfolioOverview?, riskAssessment?, waveAnalysis?, recommendations?, nextSteps?,
 *   confidence?, isPublished?
 * }
 * 
 * Om isPublished = true, sätts publishedAt och analysen syns för klienten i portalen.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      memberId,
      portfolioId,
      type = "full_portfolio",
      title,
      summary,
      body: analysisBody,
      portfolioOverview,
      riskAssessment,
      waveAnalysis,
      recommendations,
      nextSteps,
      analyzedBy,
      confidence = "MEDEL",
      isPublished = true,
    } = body;

    if (!memberId || !title || !summary) {
      return NextResponse.json(
        { error: "memberId, title och summary krävs" },
        { status: 400 }
      );
    }

    const member = await db.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return NextResponse.json({ error: "Medlem hittades inte" }, { status: 404 });
    }

    const analysis = await db.clientAnalysis.create({
      data: {
        memberId,
        portfolioId: portfolioId || null,
        type,
        title,
        summary,
        body: analysisBody || summary,
        portfolioOverview: portfolioOverview || null,
        riskAssessment: riskAssessment || null,
        waveAnalysis: waveAnalysis ? JSON.stringify(waveAnalysis) : null,
        recommendations: recommendations || null,
        nextSteps: nextSteps || null,
        analyzedBy: analyzedBy || "AK1A Analytiker",
        confidence,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    // Update portfolio status if portfolioId provided
    if (portfolioId) {
      await db.clientPortfolio.update({
        where: { id: portfolioId },
        data: {
          analysisStatus: "completed",
          analyzedAt: new Date(),
        },
      });
    }

    // Log activity
    try {
      await db.userActivity.create({
        data: {
          sessionId: member.sessionId || member.email,
          action: "analysis_published",
          section: "member",
          targetType: "analysis",
          targetId: analysis.id,
          metadata: JSON.stringify({ memberId, portfolioId, title }),
        },
      });
    } catch {}

    // Log system event
    try {
      await db.systemEvent.create({
        data: {
          type: "analysis_uploaded",
          severity: "info",
          message: `Analys uppladdad för ${member.email}: ${title}`,
          details: JSON.stringify({ analysisId: analysis.id, memberId, portfolioId }),
          source: "admin",
        },
      });
    } catch {}

    return NextResponse.json({ analysis, member });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** GET /api/admin/upload-analysis?memberId=xxx — hämta alla analyser (även opublicerade). */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");

    const where: any = {};
    if (memberId) where.memberId = memberId;

    const analyses = await db.clientAnalysis.findMany({
      where,
      include: { member: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ analyses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
