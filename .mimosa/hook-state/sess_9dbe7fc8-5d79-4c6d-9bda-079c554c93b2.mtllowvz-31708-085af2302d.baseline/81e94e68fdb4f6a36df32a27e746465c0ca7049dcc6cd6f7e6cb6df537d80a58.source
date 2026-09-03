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
 * POST /api/ai-analys/generera
 *
 * AI-system genererar AK1TS våganalys för en aktie i 3 längder.
 * Detta är Fas 3-funktionen — AI-automation av våganalys.
 *
 * Input: { ticker: "VOLV-B", lengths: ["nyborjare","intermediar","avancerad"] }
 * Output: { analyses: [{ length, pages, waveMatrix, recommendation, ... }] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, lengths = ["nyborjare", "intermediar", "avancerad"] } = body;

    if (!ticker) {
      return NextResponse.json({ error: "ticker krävs" }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Hämta befintlig analys-data om finns
    const existingData = await fetch(`${req.nextUrl.origin}/api/analysis/${ticker}`, {
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    // Generera våg-matris (25 celler) med AI
    const waveMatrixPrompt = `Du är AK1A Research Lab:s AI-system för AK1TS våganalys.

AKTIE: ${ticker}
${existingData ? `BEFINTLIG DATA: ${JSON.stringify(existingData.akm1 || {}).substring(0, 500)}` : "Ingen befintlig data — generera demodata."}

UPPGIFT: Generera en 5×5 våg-matris (25 celler) för denna aktie.
- 5 teorier: Elliott, Fibonacci, Gann, Lucas, Volym
- 5 tidshorisonter: Mikro, Kort, Medellång, Lång, Mega
- Varje cell: signal (bull/bear/neutral) + styrka (1-3) + note

Svara i EXAKT detta JSON-format:
{
  "waveMatrix": {
    "Elliott-Mikro": { "signal": "bear", "strength": 3, "note": "..." },
    "Elliott-Kort": { "signal": "bear", "strength": 2, "note": "..." },
    ... (25 celler totalt)
  },
  "bias": "BEARISH|BULLISH|NEUTRAL",
  "confidence": "LÅG|MEDEL|HÖG",
  "summary": "2-meningars sammanfattning av våg-positionen"
}

Detta är METODMÅL — AI-genererad, kräver MÄTT-validering innan publicering.`;

    const waveResponse = await zai.chat.completions.create({
      messages: [{ role: "user", content: waveMatrixPrompt }],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const waveContent = waveResponse.choices?.[0]?.message?.content || "";

    let waveData: any = null;
    try {
      const jsonMatch = waveContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) waveData = JSON.parse(jsonMatch[0]);
    } catch {
      // fallback
    }

    // Generera 3 längder baserat på våg-matrisen
    const lengthConfigs = {
      nyborjare: { pages: 13, focus: "snabb överblick: rekommendation + 5 viktigaste variablerna" },
      intermediar: { pages: 35, focus: "alla 20 AKM1-variabler + Fibonacci + Elliott Wave" },
      avancerad: { pages: 99, focus: "Monte Carlo + Bayesian + Kelly + DCF-känslighet" },
    };

    const analyses = lengths.map((length: string) => {
      const config = lengthConfigs[length as keyof typeof lengthConfigs] || lengthConfigs.nyborjare;
      return {
        length,
        level: length === "nyborjare" ? "Nybörjare" : length === "intermediar" ? "Intermediär" : "Avancerad",
        pages: config.pages,
        focus: config.focus,
        status: "METODMÅL",
        waveMatrix: waveData?.waveMatrix || null,
        bias: waveData?.bias || "NEUTRAL",
        confidence: waveData?.confidence || "LÅG",
        summary: waveData?.summary || "",
      };
    });

    // Spara som system_events (valfritt utan Supabase)
    const rest = getSupabaseRest();
    if (rest) {
      try {
        await fetch(`${rest.origin}/rest/v1/system_events`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            type: "ai_analys_genererad",
            severity: "info",
            message: `AI genererade ${analyses.length} analyser för ${ticker} (METODMÅL)`,
            details: {
              ticker,
              lengths,
              bias: waveData?.bias,
              confidence: waveData?.confidence,
              summary: waveData?.summary,
            },
            source: "ai-analys-api",
          }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    }

    return NextResponse.json({
      ticker,
      generatedAt: new Date().toISOString(),
      status: "METODMÅL",
      analyses,
      rawWaveData: waveData,
    });
  } catch (e: any) {
    console.error("AI-analys error:", e);
    return NextResponse.json(
      { error: e?.message || "ai_analys_failed" },
      { status: 500 }
    );
  }
}

/** GET — hämta senaste AI-analyser */
export async function GET() {
  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ analyses: [] });

  try {
    const res = await fetch(
      `${rest.origin}/rest/v1/system_events?type=eq.ai_analys_genererad&select=id,created_at,details&order=created_at.desc&limit=20`,
      { headers: rest.headers, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return NextResponse.json({ analyses: [] });

    const events = await res.json();
    const analyses = (events || []).map((e: any) => ({
      eventId: e.id,
      createdAt: e.created_at,
      ...parseDetails(e.details),
    }));

    return NextResponse.json({ analyses });
  } catch {
    return NextResponse.json({ analyses: [] });
  }
}
