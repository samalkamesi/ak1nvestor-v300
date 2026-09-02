import { NextRequest, NextResponse } from "next/server";

import ZAI from "z-ai-web-dev-sdk";

import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSONB-kolumnen details kommer som objekt från PostgREST — äldre rader kan vara strängar. */
function parseDetails(v: unknown): any {
  if (v && typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * POST /api/styrelse/autonom
 *
 * AI-organen autonomt föreslår förbättringar av kundupplevelsen.
 * Detta är den autonoma loopen:
 * 1. Hämta senaste kundaktivitet från user_activities
 * 2. Identifiera svaga punkter (långa sessioner utan konvertering, bounce)
 * 3. Låt AI-organen föreslå konkreta förbättringar
 * 4. Spara som system_events + returnera förslag
 *
 * Körs av cron-regelbundet (se scripts/autonom-loop.sh).
 * Supabase är VALFRITT: utan konfig körs loopen på tom data (inga krascher).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const focus = body.focus || "kundupplevelse"; // kundupplevelse | branding | marketing | innehåll

    const rest = getSupabaseRest();

    // 1. Hämta senaste kundaktivitet (senaste 24h) — valfritt utan Supabase
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let activities: { session_id: string | null; action: string | null; section: string | null }[] = [];
    if (rest) {
      try {
        const res = await fetch(
          `${rest.origin}/rest/v1/user_activities?created_at=gte.${since.toISOString()}&select=session_id,action,section&order=created_at.desc&limit=100`,
          { headers: rest.headers, signal: AbortSignal.timeout(10000) }
        );
        if (res.ok) activities = await res.json();
      } catch {}
    }

    // 2. Analysera — räkna section_visits, course_opens, etc.
    const sectionCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    for (const a of activities) {
      if (a.section) sectionCounts[a.section] = (sectionCounts[a.section] || 0) + 1;
      if (a.action) actionCounts[a.action] = (actionCounts[a.action] || 0) + 1;
    }

    const totalSessions = new Set(activities.map((a) => a.session_id)).size;
    const totalActivities = activities.length;
    const topSections = Object.entries(sectionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 3. Låt AI-organen analysera och föreslå förbättringar
    const zai = await ZAI.create();
    const prompt = `Du är AK1A Research Lab:s AI-organ styrelse (8 organ: Σ Strategi, α Analys, Δ Data, Ω Vision, Φ Innovation, Θ Kvalitet, Μ Marknads, Ψ Utbildning).

Senaste 24h data:
- Totala sessioner: ${totalSessions}
- Totala aktiviteter: ${totalActivities}
- Topp sektioner: ${topSections.map(([s, c]) => `${s} (${c})`).join(", ")}
- Action-fördelning: ${Object.entries(actionCounts).map(([a, c]) => `${a} (${c})`).join(", ")}
- Fokus idag: ${focus}

AK1A:s DNA: Verifierbarhet, Kognitiv suveränitet, "Vi skapade kategorin", anti-bank, anti-casino.

UPPGIFT: Föreslå 3 KONKRETA förbättringar av kundupplevelsen baserat på datan. Varje förslag ska vara:
1. Datadrivet (referera till siffrorna)
2. MÄTT-baserat (mätbart resultat)
3. Specifikt (vilken sida, vilket ord, vilken handling)

Svara i detta EXAKTA JSON-format:
{
  "organ": "Σ|α|Δ|Ω|Φ|Θ|Μ|Ψ",
  "analysis": "kort analys av datan (2-3 meningar)",
  "proposals": [
    {
      "title": "konkret förslag",
      "page": "hem|analyser|aktier|kurser|labb|strategi|om-oss|portal|prec",
      "currentText": "nuvarande text",
      "proposedText": "föreslagen ny text",
      "rationale": "varför detta attraherar fler kunder",
      "successMetric": "hur vi mäter om det funkar",
      "priority": "KRITISK|HÖG|MEDEL"
    }
  ]
}

Fokusera på att attrahera fler kunder genom tydligare, mer kundvänliga ord — utan att tappa vår DNA (verifierbarhet, kognitiv suveränitet).`;

    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices?.[0]?.message?.content || "";

    // Försök parsa JSON
    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback
    }

    // 4. Spara som system_events (valfritt utan Supabase — eventId blir null)
    let eventId: string | null = null;
    if (rest) {
      try {
        const res = await fetch(`${rest.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({
            type: "ai_organ_autonom_proposal",
            severity: "info",
            message: `AI-organ ${parsed?.organ || "?"} föreslog ${parsed?.proposals?.length || 0} förbättringar (fokus: ${focus})`,
            details: {
              focus,
              dataSnapshot: { totalSessions, totalActivities, topSections, actionCounts },
              proposal: parsed,
              rawContent: content.substring(0, 2000),
            },
            source: "autonom-loop",
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const rows = await res.json();
          eventId = rows?.[0]?.id ?? null;
        }
      } catch {}
    }

    return NextResponse.json({
      eventId,
      focus,
      dataSnapshot: { totalSessions, totalActivities, topSections, actionCounts },
      proposal: parsed,
      rawContent: content,
    });
  } catch (e: any) {
    console.error("Autonom loop error:", e);
    return NextResponse.json(
      { error: e?.message || "autonom_loop_failed" },
      { status: 500 }
    );
  }
}

/** GET — hämta senaste autonoma förslag */
export async function GET() {
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ proposals: [] });

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.ai_organ_autonom_proposal&select=id,created_at,details&order=created_at.desc&limit=10`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return NextResponse.json({ proposals: [] });

    const events = await res.json();
    const proposals = (events || []).map((e: any) => {
      const details = parseDetails(e.details);
      return {
        eventId: e.id,
        createdAt: e.created_at,
        focus: details.focus,
        organ: details.proposal?.organ,
        proposals: details.proposal?.proposals || [],
        dataSnapshot: details.dataSnapshot,
      };
    });

    return NextResponse.json({ proposals });
  } catch {
    return NextResponse.json({ proposals: [] });
  }
}
