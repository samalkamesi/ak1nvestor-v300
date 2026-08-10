import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/cases — list case studies (filter by type, sector, decisiveVars) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // success | failure
    const sector = searchParams.get("sector");
    const limit = parseInt(searchParams.get("limit") || "100");
    const search = searchParams.get("q");

    const where: any = {};
    if (type) where.type = type;
    if (sector) where.sector = sector;
    if (search) {
      where.OR = [
        { company: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { ticker: { contains: search } },
      ];
    }

    const cases = await db.caseStudy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ cases, count: cases.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** POST /api/cases — create a case study */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await db.caseStudy.create({ data: body });
    return NextResponse.json({ case: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
