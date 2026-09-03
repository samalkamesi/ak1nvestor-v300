import { NextRequest, NextResponse } from "next/server";

import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

/** GET /api/styrelse/protokoll — list all saved meeting protocols */
export async function GET() {
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ protocols: [] });

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/meeting_protocols?select=*&order=timestamp.desc&limit=50`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return NextResponse.json({ protocols: [] });

    const rows = await res.json();

    // Mappa tillbaka till camelCase + JSON-strängar (samma form som tidigare API-kontrakt)
    const protocols = (rows || []).map((r: any) => ({
      id: r.id,
      meetingId: r.meeting_id,
      agenda: r.agenda,
      timestamp: r.timestamp,
      viewpoints: r.viewpoints != null ? JSON.stringify(r.viewpoints) : null,
      decision: r.decision != null ? JSON.stringify(r.decision) : null,
      decisionTitle: r.decision_title,
      confidence: r.confidence,
      passed: r.passed,
      signatures: r.signatures != null ? JSON.stringify(r.signatures) : null,
    }));

    return NextResponse.json({ protocols });
  } catch {
    return NextResponse.json({ protocols: [] });
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

    const rest = getSupabaseRest();
    if (!rest) {
      // Graceful utan Supabase — protokoll kan inte sparas, men vi kraschar inte
      return NextResponse.json({ saved: null, warning: "supabase_ej_konfigurerad — protokoll ej sparat" });
    }

    const res = await fetch(`${rest.origin}/rest/v1/meeting_protocols`, {
      method: "POST",
      headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        meeting_id: meetingId,
        agenda,
        viewpoints: viewpoints || [],
        decision,
        decision_title: decisionTitle || decision.title || "",
        confidence: confidence || decision.confidence || "MEDEL",
        passed: passed ?? (decision.signatures || []).filter((s: any) => s.verdict === "JA").length >
          (decision.signatures || []).filter((s: any) => s.verdict === "NEJ").length,
        signatures: signatures || decision.signatures || [],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `supabase_error_${res.status}` }, { status: 502 });
    }

    const rows = await res.json();
    const r = rows?.[0] ?? null;
    const saved = r
      ? {
          id: r.id,
          meetingId: r.meeting_id,
          agenda: r.agenda,
          timestamp: r.timestamp,
          viewpoints: JSON.stringify(r.viewpoints ?? []),
          decision: JSON.stringify(r.decision ?? {}),
          decisionTitle: r.decision_title,
          confidence: r.confidence,
          passed: r.passed,
          signatures: JSON.stringify(r.signatures ?? []),
        }
      : null;

    return NextResponse.json({ saved });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
