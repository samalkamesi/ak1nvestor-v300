import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/member/analysis?memberId=xxx — hämta analyser för en medlem (bara publicerade). */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const memberId = url.searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ error: "memberId krävs" }, { status: 400 });
    }

    const analyses = await db.clientAnalysis.findMany({
      where: { memberId, isPublished: true },
      include: { member: true },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ analyses });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
