import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/admin/members — lista alla medlemmar med portföljer. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // pending | in_review | completed
    const memberType = url.searchParams.get("memberType");

    const where: any = {};
    if (memberType) where.memberType = memberType;

    const members = await db.member.findMany({
      where,
      include: {
        portfolios: {
          ...(status ? { where: { analysisStatus: status } } : {}),
          include: { holdings: true },
          orderBy: { createdAt: "desc" },
        },
        analyses: { orderBy: { createdAt: "desc" } },
        bookings: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary stats
    const stats = {
      totalMembers: members.length,
      pendingPortfolios: members.reduce((sum, m) => sum + m.portfolios.filter((p) => p.analysisStatus === "pending").length, 0),
      inReviewPortfolios: members.reduce((sum, m) => sum + m.portfolios.filter((p) => p.analysisStatus === "in_review").length, 0),
      completedPortfolios: members.reduce((sum, m) => sum + m.portfolios.filter((p) => p.analysisStatus === "completed").length, 0),
      totalAnalyses: members.reduce((sum, m) => sum + m.analyses.length, 0),
      totalBookings: members.reduce((sum, m) => sum + m.bookings.filter((b) => b.status === "requested").length, 0),
    };

    return NextResponse.json({ members, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
