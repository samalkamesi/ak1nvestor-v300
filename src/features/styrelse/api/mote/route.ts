import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * AI Organ Styrelse — mötessystem.
 *
 * De 8 AK1A-organen (Σ α Δ Ω Φ Θ Μ Ψ) samlas till möte kring en dagordning.
 * Varje organ avger en syn (LLM-genererad, i sin roll).
 * Σ (Strategi-organet) syntetiserar till ett styrelsebeslut.
 *
 * POST /api/styrelse/mote
 * body: { agenda: string }
 * returns: { id, agenda, timestamp, viewpoints: [{organ, symbol, role, viewpoint}], decision: { title, rationale, actions[], signatures } }
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const ORGANS = [
  { symbol: "α", name: "Analys-organet", verb: "TÄNKER", role: "Fundamental och teknisk nedbrytning — AKM1 + AK1TS", mantra: "Data talar — vi översätter.", focus: "data, nyckeltal, vågteori, värdering" },
  { symbol: "Δ", name: "Data-organet", verb: "SAMLAR", role: "Data-ansvar — inhämtar och renar rådata", mantra: "Ren data, ren sanning.", focus: "datakällor, aktualitet, luckor" },
  { symbol: "Ω", name: "Vision-organet", verb: "SKAPAR", role: "Vision-formulering — långsiktiga mål från insikter", mantra: "Tänj gränsen — bevara kärnan.", focus: "långsiktigt ekosystem, paradigm" },
  { symbol: "Φ", name: "Innovation-organet", verb: "SKAPAR", role: "Innovationsmotor — nya metoder och verktyg", mantra: "Bygg det som saknas.", focus: "nya metoder, automatisering, verktyg" },
  { symbol: "Θ", name: "Kvalitets-organet", verb: "BESLUTAR", role: "Kvalitetsgranskning — granskar, validerar, nekar", mantra: "Bevisa det — annars stannar det.", focus: "validering, ärlighetsfilter, know-how-valv" },
  { symbol: "Μ", name: "Marknads-organet", verb: "SAMLAR", role: "Marknadspuls — övervakar sentiment och flöden", mantra: "Pulsen aldrig ljuger.", focus: "marknadskontext, sentiment, sektorer" },
  { symbol: "Ψ", name: "Utbildnings-organet", verb: "FÖRVERKLIGAR", role: "Kunskapsöverföring — förmedlar know-how till människor", mantra: "Förståelse först — vinst sedan.", focus: "pedagogik, nybörjarvänlighet, läroplan" },
];

interface Viewpoint {
  organ: string;
  symbol: string;
  role: string;
  verb: string;
  mantra: string;
  viewpoint: string;
}

interface Decision {
  title: string;
  rationale: string;
  actions: string[];
  risk_notes: string;
  confidence: "LÅG" | "MEDEL" | "HÖG";
  signatures: { symbol: string; organ: string; verdict: "JA" | "RESERVATION" | "NEJ" }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const agenda: string = (body.agenda || "").toString().trim();

    if (!agenda || agenda.length < 3) {
      return NextResponse.json(
        { error: "En dagordning (agenda) krävs (minst 3 tecken)." },
        { status: 400 }
      );
    }
    if (agenda.length > 600) {
      return NextResponse.json(
        { error: "Dagordningen får max vara 600 tecken." },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // ── Fas 1: Varje organ avger sin syn (sekventiellt — undvik rate-limit) ──
    const viewpoints: Viewpoint[] = [];
    for (const organ of ORGANS) {
      const prompt = `Du är ${organ.name} (${organ.symbol}) i AK1A Research Labs styrelse — ett svenskt forskningsinstitut för institutionell finansanalys för privatpersoner.

Din roll: ${organ.role}
Ditt verb: ${organ.verb}
Ditt mantra: "${organ.mantra}"
Ditt fokus: ${organ.focus}

STYRELSEMÖTETS DAGORDNING:
"${agenda}"

AK1A:S KÄNDEPRINCIPER:
- Håll know-how helt — redovisa generöst. (Slutsatser offentliga, metoder bevarade.)
- Varje påstående märks MÄTT (verifierat) eller METODMÅL (mål, ej uppnått).
- Anti-casino: ingen FOMO, inga push-notiser om priser.
- Pedagogisk finansanalys — inte investeringsråd.
- Långsamt och rätt.

Avge din organs syn på dagordningen i 2–4 meningar på SVENSKA. Skriv ur ditt organs perspektiv (din roll + fokus). Var konkret och ärlig — om något är en vision snarare än uppnått, säg det. Svara ENDAST med synen, ingen inledning.`;

      let viewpoint = "";
      // Retry with backoff for rate-limits
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const completion = await zai.chat.completions.create({
            messages: [
              { role: "assistant", content: "Du är en svensk institutionell analytiker och styrelseledamot." },
              { role: "user", content: prompt },
            ],
            thinking: { type: "disabled" },
          });
          viewpoint = (completion.choices[0]?.message?.content || "").trim();
          break;
        } catch (e: any) {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
          } else {
            viewpoint = `(Kunde inte generera syn: ${e?.message || "okänt fel"}.)`;
          }
        }
      }
      viewpoints.push({
        organ: organ.name,
        symbol: organ.symbol,
        role: organ.role,
        verb: organ.verb,
        mantra: organ.mantra,
        viewpoint: viewpoint || "(Ingen syn avgiven.)",
      });
      // Small delay between organs to respect rate-limits
      await new Promise((r) => setTimeout(r, 600));
    }

    // ── Fas 2: Σ (Strategi-organet) syntetiserar styrelsebeslut ──
    const viewpointsText = viewpoints
      .map((v) => `${v.symbol} ${v.organ} (${v.verb}): ${v.viewpoint}`)
      .join("\n\n");

    const decisionPrompt = `Du är Σ (Strategi-organet) i AK1A Research Labs styrelse — ordförande som sätter riktning och prioriterar visioner. Ditt mantra: "Riktning före hastighet."

STYRELSEMÖTETS DAGORDNING:
"${agenda}"

DE 7 ÖVRIGA ORGANENS SYN:
${viewpointsText}

AK1A:S PRINCIPER:
- Håll know-how helt — redovisa generöst.
- Varje påstående märks MÄTT eller METODMÅL.
- Anti-casino, pedagogisk finansanalys, långsamt och rätt.

FATTA ETT STYRELSEBESLUT. Svara i EXAKT detta JSON-format (inga markdown-kodstängsel, ingen annan text):
{
  "title": "Kort beslutsrubrik (max 80 tecken)",
  "rationale": "Motivering på 3-5 meningar som syntetiserar organens syn.",
  "actions": ["Konkret åtgärd 1", "Konkret åtgärd 2", "Konkret åtgärd 3"],
  "risk_notes": "Kort notis om risk eller osäkerhet.",
  "confidence": "LÅG | MEDEL | HÖG",
  "signatures": [
    {"symbol": "Σ", "organ": "Strategi-organet", "verdict": "JA"},
    {"symbol": "α", "organ": "Analys-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Δ", "organ": "Data-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Ω", "organ": "Vision-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Φ", "organ": "Innovation-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Θ", "organ": "Kvalitets-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Μ", "organ": "Marknads-organet", "verdict": "JA | RESERVATION | NEJ"},
    {"symbol": "Ψ", "organ": "Utbildnings-organet", "verdict": "JA | RESERVATION | NEJ"}
  ]
}

Signaturerna ska reflektera varje organs syn — om ett organ uttryckte tvekan i sin syn, ge det RESERVATION; om motstånd, NEJ. Σ själv är alltid JA (ordförande).`;

    let decision: Decision;
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: "Du är ordförande för ett svenskt forskningsinstituts styrelse. Du svarar ENDAST med giltig JSON." },
          { role: "user", content: decisionPrompt },
        ],
        thinking: { type: "disabled" },
      });
      const raw = (completion.choices[0]?.message?.content || "").trim();
      // strip code fences if present
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
      decision = JSON.parse(cleaned);
    } catch (e: any) {
      decision = {
        title: "Beslut kunde inte syntetiseras",
        rationale: `Strategi-organet kunde inte generera ett formellt beslut från organens syn. Tekniskt fel: ${e?.message || "okänt"}. De 7 organens syn finns ändå att läsa ovan.`,
        actions: ["Följ upp med ett nytt möte med mer specifik dagordning."],
        risk_notes: "Beslut saknar formell syntes — mötets värde ligger i organens enskilda syn.",
        confidence: "LÅG",
        signatures: [
          { symbol: "Σ", organ: "Strategi-organet", verdict: "JA" },
          ...ORGANS.map((o) => ({ symbol: o.symbol, organ: o.name, verdict: "RESERVATION" as const })),
        ],
      };
    }

    const meeting = {
      id: `M-${Date.now().toString(36).toUpperCase()}`,
      agenda,
      timestamp: new Date().toISOString(),
      viewpoints,
      decision,
    };

    return NextResponse.json(meeting);
  } catch (e: any) {
    return NextResponse.json(
      { error: `Mötesfel: ${e?.message || "okänt fel"}` },
      { status: 500 }
    );
  }
}
