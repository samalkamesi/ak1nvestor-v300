import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/styrelse/marknadsforing
 *
 * AI-organen (Μ Marknads + Σ Strategi + Ω Vision) skapar strategisk
 * marknadsföringskampanj baserat på Zero to One, Blue Ocean, Positioning.
 *
 * Input: { campaign: "launch|retention|conversion|branding", channel: "email|social|hero|cta" }
 * Output: { campaignText, subject, body, cta, rationale, framework }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaign = "branding", channel = "hero", audience = "diy-sparare" } = body;

    const zai = await ZAI.create();

    const campaignDescriptions: Record<string, string> = {
      launch: "lansera en ny analys eller funktion",
      retention: "behålla existerande medlemmar",
      conversion: "konvertera besökare till betalande medlemmar",
      branding: "stärka varumärket och positionering",
    };

    const channelDescriptions: Record<string, string> = {
      email: "email-ämnesrad + body (max 150 ord)",
      social: "sociala medier post (max 280 tecken, konkret + länk)",
      hero: "hero-sektion på webbsida (rubrik + undertext + CTA)",
      cta: "call-to-action knapp-text (max 5 ord)",
    };

    const audienceDescriptions: Record<string, string> = {
      "diy-sparare": "Mats, 52, civilingenjör — teknisk, metodisk, vill förstå",
      "nyborjare": "Robin, 34, sjuksköterska — varm, pedagogisk, konkret",
      "företagare": "Astrid, 41, företagare — auktoritär, korthuggen, bevisdriven",
    };

    const prompt = `Du är AK1A Research Lab:s AI-organ Μ (Marknads) + Σ (Strategi) + Ω (Vision).

UPPGIFT: Skapa en ${campaignDescriptions[campaign]}kampanj för ${channelDescriptions[channel]}.
Målgrupp: ${audienceDescriptions[audience] || audience}

AK1A:s strategiska positionering (använd dessa i kampanjen):
- Zero to One: "Vi skapade kategorin. Andra kopierar."
- Blue Ocean: "Verifierbar Privatplacering" — ny marknad
- Positioning: äger ordet "VERIFIERBARHET" + "KOGNITIV SUVERÄNITET"
- Purple Cow: 99-sidiga analyser, offentlig AI-styrelse, "håll know-how, redovisa generöst"
- Start With Why: "Ge varje person samma beslutsunderlag som institutionerna"

AK1A:s DNA (FÅR EJ BRYTAS):
- Verifierbarhet — varje siffra spårbar
- Kognitiv suveränitet — kunden tänker själv
- Anti-bank, anti-casino, pro-metod
- MÄTT / METODMÅL — ärlighetsmarkörer

ORD ATT UNDVIKA:
- "våra experter", "din rådgivare", "garanterad", "säker", "tips", "multibagger"
- "marknaden säger", "private banking", "magkänsla"

ORD ATT ANVÄNDA:
- "verifierbarhet", "kognitiv suveränitet", "reproducerbar", "MÄTT", "METODMÅL"
- "institutionell metodik", "pedagogisk finansanalys"
- "Vi skapade kategorin", "Verifiera allt"

Skapa kampanjen i EXAKT detta JSON-format:
{
  "campaignText": "huvudtext för kanalen",
  "subject": "ämnesrad (om email) eller rubrik (om hero)",
  "body": "body-text (om email/hero) eller beskrivning (om social/cta)",
  "cta": "call-to-action text (max 5 ord)",
  "rationale": "varför denna kampanj attraherar målgruppen (2-3 meningar)",
  "framework": "vilket strategiskt ramverk som används (Zero to One / Blue Ocean / Positioning / etc.)",
  "successMetric": "hur vi mäter framgång (open rate, CTR, konvertering, time-on-page)",
  "organConfidence": "LÅG|MEDEL|HÖG",
  "tonality": "formell-varm|auktoritär-tillgänglig|pedagogisk|vetenskaplig"
}`;

    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices?.[0]?.message?.content || "";

    let parsed: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback
    }

    // Spara som SystemEvent
    await db.systemEvent.create({
      data: {
        type: "marknadsforing_kampanj",
        severity: "info",
        message: `AI-organ skapade ${campaign}-kampanj för ${channel} (${audience}) — confidence: ${parsed?.organConfidence || "?"}`,
        details: JSON.stringify({
          campaign,
          channel,
          audience,
          campaignData: parsed,
        }),
        source: "marknadsforing-api",
      },
    });

    return NextResponse.json({
      campaign,
      channel,
      audience,
      ...parsed,
    });
  } catch (e: any) {
    console.error("Marknadsföring API error:", e);
    return NextResponse.json(
      { error: e?.message || "marknadsforing_failed" },
      { status: 500 }
    );
  }
}

/** GET — hämta senaste marknadsföringskampanjer */
export async function GET() {
  try {
    const events = await db.systemEvent.findMany({
      where: { type: "marknadsforing_kampanj" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const campaigns = events.map((e) => {
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

    return NextResponse.json({ campaigns });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
