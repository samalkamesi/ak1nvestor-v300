import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/indicators — list all AK1 indicators (V01..V20) */
export async function GET() {
  try {
    const indicators = await db.ak1Indicator.findMany({ orderBy: { num: "asc" } });
    return NextResponse.json({ indicators });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** POST /api/indicators — create/update an indicator */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, num, name, category, weight, level, summary, formula, scale, lynchView, grahamView, ak1View, slug } = body;
    if (!id || !num || !name) {
      return NextResponse.json({ error: "id, num, name required" }, { status: 400 });
    }
    const indicator = await db.ak1Indicator.upsert({
      where: { id },
      create: { id, num, name, category, weight, level, summary, formula, scale, lynchView, grahamView, ak1View, slug },
      update: { name, category, weight, level, summary, formula, scale, lynchView, grahamView, ak1View, slug },
    });
    return NextResponse.json({ indicator });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
