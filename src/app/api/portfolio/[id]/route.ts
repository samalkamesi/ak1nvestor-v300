import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/portfolio/[id] — hämta specifik portfölj med innehav. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const portfolio = await db.portfolio.findUnique({
      where: { id },
      include: { holdings: { orderBy: { weight: "desc" } } },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "Portfölj hittades inte" }, { status: 404 });
    }

    return NextResponse.json({ portfolio });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PUT /api/portfolio/[id] — uppdatera portfölj. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, cashPosition, riskScore, moatScore, growthScore, valueScore, technicalScore, fundamentalScore, scenarioBull, scenarioBase, scenarioBear, isPublic } = body;

    const portfolio = await db.portfolio.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(cashPosition !== undefined && { cashPosition }),
        ...(riskScore !== undefined && { riskScore }),
        ...(moatScore !== undefined && { moatScore }),
        ...(growthScore !== undefined && { growthScore }),
        ...(valueScore !== undefined && { valueScore }),
        ...(technicalScore !== undefined && { technicalScore }),
        ...(fundamentalScore !== undefined && { fundamentalScore }),
        ...(scenarioBull !== undefined && { scenarioBull }),
        ...(scenarioBase !== undefined && { scenarioBase }),
        ...(scenarioBear !== undefined && { scenarioBear }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: { holdings: true },
    });

    return NextResponse.json({ portfolio });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** DELETE /api/portfolio/[id] — ta bort portfölj. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.portfolio.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
