import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/combinations — list indicator combinations */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const verdict = searchParams.get("verdict");
    const indicator = searchParams.get("indicator");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (verdict) where.verdict = verdict;
    if (indicator) {
      where.OR = [{ indicatorAId: indicator }, { indicatorBId: indicator }];
    }

    const combos = await db.indicatorCombination.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ combinations: combos, count: combos.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** POST /api/combinations — create an indicator combination */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.indicatorCombination.create({ data: body });
    return NextResponse.json({ combination: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
