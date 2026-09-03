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

    // Spara som system_events (valfritt utan Supabase)
    const rest = getSupabaseRest();
    if (rest) {
      try {
        await fetch(`${rest.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            type: "marknadsforing_kampanj",
            severity: "info",
            message: `AI-organ skapade ${campaign}-kampanj för ${channel} (${audience}) — confidence: ${parsed?.organConfidence || "?"}`,
            details: {
              campaign,
              channel,
              audience,
              campaignData: parsed,
            },
            source: "marknadsforing-api",
          }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    }

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
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ campaigns: [] });

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.marknadsforing_kampanj&select=id,created_at,details&order=created_at.desc&limit=20`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return NextResponse.json({ campaigns: [] });

    const events = await res.json();
    const campaigns = (events || []).map((e: any) => ({
      eventId: e.id,
      createdAt: e.created_at,
      ...parseDetails(e.details),
    }));

    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ campaigns: [] });
  }
}
