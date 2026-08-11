import { NextRequest, NextResponse } from "next/server";

import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/styrelse/kommunikation
 *
 * AI-organen (Μ Marknads + Ψ Utbildning + Θ Kvalitet) föreslår
 * strategisk omskrivning av text på en specifik sida för att attrahera
 * fler kunder — utan att tappa DNA (verifierbarhet, kognitiv suveränitet).
 *
 * Input: { page: "hem"|"analyser"|..., currentText: "...", target: "attrahera|konvertera|behålla" }
 * Output: { rewrittenText, rationale, successMetric }
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

    // Spara som SystemEvent för spårbarhet
    await db.systemEvent.create({
      data: {
        type: "kommunikation_omskrivning",
        severity: "info",
        message: `AI-organ skrev om ${page} (${target}) — confidence: ${parsed?.organConfidence || "?"}`,
        details: JSON.stringify({
          page,
          target,
          currentTextLength: currentText.length,
          rewrittenTextLength: parsed?.rewrittenText?.length || 0,
          changesMade: parsed?.changesMade || [],
          rationale: parsed?.rationale,
          successMetric: parsed?.successMetric,
        }),
        source: "kommunikation-api",
      },
    });

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
  try {
    const events = await db.systemEvent.findMany({
      where: { type: "kommunikation_omskrivning" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const rewrites = events.map((e) => {
      try {
        return {
          eventId: e.id,
          createdAt: e.createdAt,
          ...JSON.parse(e.details || "{}"),
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ rewrites });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
