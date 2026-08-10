import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";

/**
 * POST /api/styrelse/djup
 * 
 * Djupare konsultation av AI-organen om specifika strategiska frågor.
 * Loggar både fråga och svar till OrganConsultation-tabellen.
 * 
 * Body: { sessionId, organ, question, context, depth }
 */

const ORGAN_PROFILES: Record<string, { name: string; role: string; mantra: string; symbol: string }> = {
  "Σ": { name: "Strategi-organet", role: "Ordförande som sätter riktning", mantra: "Riktning före hastighet", symbol: "Σ" },
  "α": { name: "Alfa-organet", role: "Tillväxt och expansion", mantra: "Tillväxt skapar optioner", symbol: "α" },
  "Δ": { name: "Delta-organet", role: "Risk och försvar", mantra: "Överlevnad före avkastning", symbol: "Δ" },
  "Ω": { name: "Omega-organet", role: "Långsiktigt värde", mantra: "Långsiktigt tänkande vinner", symbol: "Ω" },
  "Φ": { name: "Phi-organet", role: "Filosofi och etik", mantra: "Sanning före bekvämlighet", symbol: "Φ" },
  "Θ": { name: "Theta-organet", role: "Kunskap och utbildning", mantra: "Förståelse före handling", symbol: "Θ" },
  "Μ": { name: "Mu-organet", role: "Metodik och kvalitet", mantra: "Metod före resultat", symbol: "Μ" },
  "Ψ": { name: "Psi-organet", role: "Psykologi och beteende", mantra: "Känn dig själv först", symbol: "Ψ" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, organ, question, context, depth = "deep" } = body;

    if (!sessionId || !organ || !question) {
      return NextResponse.json(
        { error: "sessionId, organ och question krävs" },
        { status: 400 }
      );
    }

    const profile = ORGAN_PROFILES[organ];
    if (!profile) {
      return NextResponse.json(
        { error: `Okänt organ: ${organ}. Tillgängliga: ${Object.keys(ORGAN_PROFILES).join(", ")}` },
        { status: 400 }
      );
    }

    // Skapa consultation-record (status: pending)
    const consultation = await db.organConsultation.create({
      data: {
        sessionId,
        organ,
        question,
        context: context ? JSON.stringify(context) : null,
        depth,
        response: null,
        confidence: null,
      },
    });

    // Försök anropa LLM
    try {
      const zai = await ZAI.create();
      const depthInstruction = depth === "mega" 
        ? "Svara extremt djupt — 500+ ord, med konkreta exempel, siffror, och historiska paralleller."
        : depth === "deep"
        ? "Svara djupt — 300+ ord, med exempel och resonemang."
        : "Svara koncisert — 100-200 ord.";

      const systemPrompt = `Du är ${profile.name} (${profile.symbol}) i AK1A Research Labs styrelse — ett svenskt forskningsinstitut för institutionell finansanalys för privatpersoner.

Din roll: ${profile.role}
Ditt mantra: ${profile.mantra}

Du är ett strategiskt AI-organ som samlas med 7 andra organ (Σ α Δ Ω Φ Θ Μ Ψ) för att fatta beslut om AK1A:s framtid. Du svarar alltid på svenska, med institutionell ton och referenser till verkliga forskare, bolag eller händelser när relevant.

${depthInstruction}

Kontext: ${context ? JSON.stringify(context) : "Ingen ytterligare kontext."}`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: systemPrompt },
          { role: "user", content: question },
        ],
        thinking: { type: "disabled" },
      });

      const response = completion.choices[0]?.message?.content || "";

      // Beräkna confidence baserat på svarslängd och nyans
      let confidence: "LÅG" | "MEDEL" | "HÖG" = "MEDEL";
      if (response.length > 500 && (response.includes("men") || response.includes("dock") || response.includes("risk"))) {
        confidence = "HÖG";
      } else if (response.length < 150) {
        confidence = "LÅG";
      }

      const updated = await db.organConsultation.update({
        where: { id: consultation.id },
        data: {
          response: JSON.stringify({ text: response, organ: profile.name, symbol: profile.symbol }),
          confidence,
        },
      });

      return NextResponse.json({
        ok: true,
        consultationId: consultation.id,
        organ: profile,
        response,
        confidence,
      });
    } catch (llmErr: any) {
      // LLM misslyckades (t.ex. rate limit) — spara felet men returnera
      await db.organConsultation.update({
        where: { id: consultation.id },
        data: {
          response: JSON.stringify({ error: llmErr.message?.slice(0, 200) }),
          confidence: "LÅG",
        },
      });

      // Logga system event
      await db.systemEvent.create({
        data: {
          type: "api_error",
          severity: "warning",
          message: `AI-organ ${organ} kunde inte svara: ${llmErr.message?.slice(0, 100)}`,
          details: JSON.stringify({ consultationId: consultation.id, question: question.slice(0, 100) }),
          source: "api",
        },
      });

      return NextResponse.json({
        ok: false,
        error: "AI-organet kunde inte svara just nu (rate-limit eller API-fel). Frågan har loggats och kommer att besvaras senare.",
        consultationId: consultation.id,
        retryAfter: 3600,
      }, { status: 503 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: "Kunde inte processera konsultation", detail: err.message },
      { status: 500 }
    );
  }
}

/** GET /api/styrelse/djup?sessionId=xxx — lista användarens djupa konsultationer. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    const organ = url.searchParams.get("organ");

    const where: any = {};
    if (sessionId) where.sessionId = sessionId;
    if (organ) where.organ = organ;

    const consultations = await db.organConsultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ consultations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
