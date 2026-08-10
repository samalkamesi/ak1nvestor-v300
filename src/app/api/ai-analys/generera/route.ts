import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    // Spara som SystemEvent
    await db.systemEvent.create({
      data: {
        type: "ai_analys_genererad",
        severity: "info",
        message: `AI genererade ${analyses.length} analyser för ${ticker} (METODMÅL)`,
        details: JSON.stringify({
          ticker,
          lengths,
          bias: waveData?.bias,
          confidence: waveData?.confidence,
          summary: waveData?.summary,
        }),
        source: "ai-analys-api",
      },
    });

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
  try {
    const events = await db.systemEvent.findMany({
      where: { type: "ai_analys_genererad" },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const analyses = events.map((e) => {
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

    return NextResponse.json({ analyses });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
