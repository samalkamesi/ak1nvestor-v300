import { NextRequest, NextResponse } from "next/server";

import ZAI from "z-ai-web-dev-sdk";

import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";

/**
 * POST /api/styrelse/djup
 *
 * Djupare konsultation av AI-organen om specifika strategiska frågor.
 * Loggar både fråga och svar till organ_consultations-tabellen.
 *
 * Body: { sessionId, organ, question, context, depth }
 *
 * Supabase är VALFRITT: utan konfig körs konsultationen ändå (utan loggning).
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

    const rest = getSupabaseRest();

    // Skapa consultation-record (status: pending) — utan Supabase körs ändå
    let consultationId: string | null = null;
    if (rest) {
      try {
        const res = await fetch(`${rest.origin}/rest/v1/organ_consultations`, {
          method: "POST",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=representation" },
          body: JSON.stringify({
            session_id: sessionId,
            organ,
            question,
            context: context ?? null,
            depth,
            response: null,
            confidence: null,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const rows = await res.json();
          consultationId = rows?.[0]?.id ?? null;
        }
      } catch {}
    }

    const saveResponse = async (response: unknown, confidence: string | null) => {
      if (!rest || !consultationId) return;
      try {
        await fetch(`${rest.origin}/rest/v1/organ_consultations?id=eq.${consultationId}`, {
          method: "PATCH",
          headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ response, confidence }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {}
    };

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

      await saveResponse({ text: response, organ: profile.name, symbol: profile.symbol }, confidence);

      return NextResponse.json({
        ok: true,
        consultationId,
        organ: profile,
        response,
        confidence,
      });
    } catch (llmErr: any) {
      // LLM misslyckades (t.ex. rate limit) — spara felet men returnera
      await saveResponse({ error: llmErr.message?.slice(0, 200) }, "LÅG");

      // Logga system event
      if (rest) {
        try {
          await fetch(`${rest.origin}/rest/v1/system_events`, {
            method: "POST",
            headers: { ...rest.headers, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({
              type: "api_error",
              severity: "warning",
              message: `AI-organ ${organ} kunde inte svara: ${llmErr.message?.slice(0, 100)}`,
              details: { consultationId, question: question.slice(0, 100) },
              source: "api",
            }),
            signal: AbortSignal.timeout(10000),
          });
        } catch {}
      }

      return NextResponse.json({
        ok: false,
        error: "AI-organet kunde inte svara just nu (rate-limit eller API-fel). Frågan har loggats och kommer att besvaras senare.",
        consultationId,
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
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const organ = url.searchParams.get("organ");

  const rest = getSupabaseRest();
  if (!rest) return NextResponse.json({ consultations: [] });

  try {
    const params = new URLSearchParams({ select: "*", order: "created_at.desc", limit: "50" });
    if (sessionId) params.set("session_id", `eq.${sessionId}`);
    if (organ) params.set("organ", `eq.${organ}`);

    const res = await fetch(`${rest.origin}/rest/v1/organ_consultations?${params}`, {
      headers: rest.headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json({ consultations: [] });

    const rows = await res.json();

    // Mappa tillbaka till camelCase + JSON-strängar (samma form som tidigare API-kontrakt)
    const consultations = (rows || []).map((r: any) => ({
      id: r.id,
      sessionId: r.session_id,
      organ: r.organ,
      question: r.question,
      context: r.context != null ? JSON.stringify(r.context) : null,
      response: r.response != null ? JSON.stringify(r.response) : null,
      meetingId: r.meeting_id ?? null,
      depth: r.depth,
      confidence: r.confidence,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ consultations });
  } catch {
    return NextResponse.json({ consultations: [] });
  }
}
