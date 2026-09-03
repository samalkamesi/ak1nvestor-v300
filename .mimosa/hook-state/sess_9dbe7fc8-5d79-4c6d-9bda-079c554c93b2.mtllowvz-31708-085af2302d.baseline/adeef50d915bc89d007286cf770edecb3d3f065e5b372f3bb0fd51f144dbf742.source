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
 * POST /api/styrelse/kommunikation
 *
 * AI-organen (Μ Marknads + Ψ Utbildning + Θ Kvalitet) föreslår
 * strategisk omskrivning av text på en specifik sida för att attrahera
 * fler kunder — utan att tappa DNA (verifierbarhet, kognitiv suveränitet).
 *
 * Input: { page: "hem"|"analyser"|..., currentText: "...", target: "attrahera|konvertera|behålla" }
 * Output: { rewrittenText, rationale, successMetric }
 *
 * Supabase är VALFRITT: utan konfig körs omskrivningen ändå (inga krascher).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, currentText, target = "attrahera" } = body;

    if (!page || !currentText) {
      return NextResponse.json(
        { error: "page och currentText krävs" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const targetDescriptions: Record<string, string> = {
      attrahera: "attrahera nya besökare att stanna och utforska",
      konvertera: "konvertera besökare till medlemmar (Fas 2/3)",
      behålla: "behålla existerande medlemmar och öka engagemang",
    };

    const prompt = `Du är AK1A Research Lab:s AI-organ Μ (Marknads) + Ψ (Utbildning) + Θ (Kvalitet).

UPPGIFT: Skriv om texten på sidan "${page}" för att ${targetDescriptions[target] || target}.

AK1A:s DNA (FÅR EJ BRYTAS):
- Verifierbarhet — varje siffra spårbar
- Kognitiv suveränitet — kunden tänker själv
- "Vi skapade kategorin. Andra kopierar."
- Anti-bank, anti-casino, pro-metod
- MÄTT (mätt) / METODMÅL (metodmål) — ärlighetsmarkörer

ORD ATT UNDVIKA (bank-ord, casino-ord):
- "våra experter", "din rådgivare", "ekonomisk planering"
- "garanterad", "säker investering", "magkänsla"
- "tips", "multibagger", "hot stock", "experterna säger"
- "marknaden säger", "private banking", "rådgivning"

ORD ATT ANVÄNDA (egna termer):
- "verifierbarhet", "kognitiv suveränitet", "reproducerbar"
- "MÄTT", "METODMÅL", "AKM1", "AK1TS"
- "pedagogisk finansanalys", "institutionell metodik"
- "anti-bank", "anti-casino", "pro-metod"

NUVARANDE TEXT på sidan "${page}":
"""
${currentText}
"""

SKRIV OM texten för att ${targetDescriptions[target] || target}.
Krav:
1. Behåll ALL information och siffror
2. Använd AK1A:s DNA-ord
3. Undvik förbjudna ord
4. Gör den mer kundattraktiv (varm, tydlig, konkret)
5. Max 25 ord per mening
6. Aktivt före passivt
7. Specifikt före abstrakt

Svara i EXAKT detta JSON-format:
{
  "rewrittenText": "den nya texten",
  "rationale": "varför denna version attraherar fler kunder (2-3 meningar)",
  "changesMade": ["förändring 1", "förändring 2", ...],
  "successMetric": "hur vi mäter om det funkar (CTR, time-on-page, konvertering)",
  "organConfidence": "LÅG|MEDEL|HÖG"
}`;

    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const content = response.choices?.[0]?.message?.content || "";

    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback
    }

    // Spara som system_events för spårbarhet (valfritt utan Supabase)
    const rest = getSupabaseRest();
    if (rest) {
      try {
        await fetch(`${rest.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            type: "kommunikation_omskrivning",
            severity: "info",
            message: `AI-organ skrev om ${page} (${target}) — confidence: ${parsed?.organConfidence || "?"}`,
            details: {
              page,
              target,
              currentTextLength: currentText.length,
              rewrittenTextLength: parsed?.rewrittenText?.length || 0,
              changesMade: parsed?.changesMade || [],
              rationale: parsed?.rationale,
              successMetric: parsed?.successMetric,
            },
            source: "kommunikation-api",
          }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    }

    return NextResponse.json({
      page,
      target,
      ...parsed,
    });
  } catch (e: any) {
    console.error("Kommunikation API error:", e);
    return NextResponse.json(
      { error: e?.message || "kommunikation_failed" },
      { status: 500 }
    );
  }
}

/** GET — hämta senaste kommunikations-förslag */
export async function GET() {
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ rewrites: [] });

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.kommunikation_omskrivning&select=id,created_at,details&order=created_at.desc&limit=20`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return NextResponse.json({ rewrites: [] });

    const events = await res.json();
    const rewrites = (events || []).map((e: any) => ({
      eventId: e.id,
      createdAt: e.created_at,
      ...parseDetails(e.details),
    }));

    return NextResponse.json({ rewrites });
  } catch {
    return NextResponse.json({ rewrites: [] });
  }
}
