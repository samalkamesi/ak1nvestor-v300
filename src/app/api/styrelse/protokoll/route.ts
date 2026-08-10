import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

/** GET /api/styrelse/protokoll — list all saved meeting protocols */
export async function GET() {
  try {
    const protocols = await db.meetingProtocol.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });
    return NextResponse.json({ protocols });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

/** POST /api/styrelse/protokoll — save a meeting protocol to DB */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingId, agenda, viewpoints, decision, decisionTitle, confidence, passed, signatures } = body;
    if (!meetingId || !agenda || !decision) {
      return NextResponse.json({ error: "meetingId, agenda, decision required" }, { status: 400 });
    }
    const saved = await db.meetingProtocol.create({
      data: {
        meetingId,
        agenda,
        viewpoints: JSON.stringify(viewpoints || []),
        decision: JSON.stringify(decision),
        decisionTitle: decisionTitle || decision.title || "",
        confidence: confidence || decision.confidence || "MEDEL",
        passed: passed ?? (decision.signatures || []).filter((s: any) => s.verdict === "JA").length >
          (decision.signatures || []).filter((s: any) => s.verdict === "NEJ").length,
        signatures: JSON.stringify(signatures || decision.signatures || []),
      },
    });
    return NextResponse.json({ saved });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
