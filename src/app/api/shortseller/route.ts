import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/content";
import { EKOSYSTEM, ModellRef } from "@/lib/ekosystem";
import { zaiAktiv, zaiChat } from "@/lib/zai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/shortseller — Agent 3: The Short-Seller
 *
 * Sokratisk grillningsagent som ALDRIG ger direkta svar.
 * Utmanar elevens analys med motfrågor, hittar svagheter,
 * jämför med historiska misslyckanden.
 *
 * Två lägen:
 * - "utmana": Eleven begär att bli grillad på ett ämne
 * - "forsvar": Eleven lämnar in en tes som attackeras
 */

type Attack = {
  kategori: "matematik" | "antagande" | "risk" | "historia" | "logik";
  fraga: string;
  kontext: string;
};

const ATTACKER: Record<string, Attack[]> = {
  "roe": [
    { kategori: "matematik", fraga: "Du nämnde ROE — hur beräknade du snittet av eget kapital? Använde du ingående eller utgående balans?", kontext: "Många glömmer att ROE kan manipuleras genom återköp som krymper eget kapital." },
    { kategori: "antagande", fraga: "ROE på 20% — är det hållbart? Vad händer med ROE om konjunkturen vänder?", kontext: "Cyperkliska bolag kan visa 25% ROE i toppen och 5% i botten." },
    { kategori: "historia", fraga: "H&M hade ROE över 30% 2015. Vad hände sen? Varför sjönk den?", kontext: "E-handel-konkurrens + tappad moat = ROE föll från 30% till 10%." },
  ],
  "tillväxt": [
    { kategori: "matematik", fraga: "Du pratar om tillväxt — hur mycket är organisk och hur mycket kommer från förvärv?", kontext: "Sinch växte 63% CAGR — men bara 10% var organiskt. Resten köptes." },
    { kategori: "risk", fraga: "Vad händer när tillväxten decelererar? Vilken multipel står kvar?", kontext: "P/S 12x vid 60% tillväxt → P/S 1x vid 10% tillväxt = -90% aktie." },
    { kategori: "logik", fraga: "Tillväxt utan lönsamhet — skapar det värde eller förstör det?", kontext: "Rule of 40: tillväxt% + EBITDA-marginal% bör vara ≥40%." },
  ],
  "varde": [
    { kategori: "matematik", fraga: "Din DCF — vilken WACC använde du? Varför den siffran?", kontext: "WACC 8% vs 10% kan förändra värderingen med 40%." },
    { kategori: "antagande", fraga: "Du antar bruttomarginal 22% — vad säger konkurrenterna? Kan de pressa dig?", kontext: "Priskrig i Kina har pressat marginaler för hela sektorer." },
    { kategori: "risk", fraga: "Vad händer med din värdering om räntan stiger 200 punkter?", kontext: "2008: ränta +3% → tillväxtbolag -60%." },
  ],
  "risk": [
    { kategori: "risk", fraga: "Vad är din största position? Hur många procent av portföljen?", kontext: "Penn Central: 'för stort för att falla' — föll ändå." },
    { kategori: "logik", fraga: "Du diversifierar — men diversifierar du mellan OLKA risker?", kontext: "Fem tech-bolag = en risk (sektor), inte fem." },
    { kategori: "historia", fraga: "Ling-Temco-Vought diversifierade genom förvärv. Vad hände?", kontext: "Konglomerat + hävstång → -96% på tre år." },
  ],
  "default": [
    { kategori: "logik", fraga: "Kan du förklara din tes i en mening — utan att använda ordet 'growth'?", kontext: "Om du inte kan förklara det enkelt förstår du det inte tillräckligt djupt." },
    { kategori: "risk", fraga: "Vad är det värsta som kan hända med din position? Har du räknat på det?", kontext: "Margin of safety: överlev nadret att ha fel." },
    { kategori: "antagande", fraga: "Om jag bortser från din analys — vad ser jag som du inte ser?", kontext: "Tunnelseende är den vanligaste orsaken till investerings-misslyckanden." },
    { kategori: "matematik", fraga: "Visa mig siffrorna. Inte känslan — siffrorna. Vad säger kassaflödet?", kontext: "Bokförd vinst kan sminkas. Kassaflödet kan inte." },
  ],
};

const HISTORISKA_FALL: Record<string, { bolag: string; fel: string; lardom: string }> = {
  "tillväxt": { bolag: "Sinch", fel: "Förvärvsdriven tillväxt + skulder", lardom: "Organisk tillväxt > förvärvstillväxt" },
  "varde": { bolag: "Nifty Fifty (1972)", fel: "Betalade premium för 'kvalitet'", lardom: "Priset du betalar > bolagets kvalitet" },
  "risk": { bolag: "Penn Central (1970)", fel: "Ignorerade välbekanta varningar", lardom: "Läs balansräkningen — varningarna står där" },
  "roe": { bolag: "H&M", fel: "ROe-fall från 30% till 10% vid moat-förlust", lardom: "ROE är en produkt av moat — när moat försvinner, försvinner ROE" },
};

/** System-prompt för Z.ai GLM — sokratisk Reasoning Mode (ALDRIG direkta svar) */
const ZAI_SYSTEM = `Du är "Short-Sellern" — en sokratisk grillningsagent i AK1A Research Lab (svensk finansutbildning).
DIN ENDA UPPGIFT: angrip elevens investeringsanalys med skarpa motfrågor. Du ger ALDRIG direkta svar, ALDRIG beröm, ALDRIG bekräftelse — bara frågor som tvingar eleven att granska sina antaganden.

REGLER:
1. Ett svar = EN enda motfråga (max 3 meningar). Ingen lista, ingen utläggning.
2. Attackera alltid det SVAGASTE antagandet i elevens text: sifferunderlag, snittberäkningar, hållbarhet, WACC/multipel-val, moat, hävstång, konjunkturkänslighet.
3. Referera AKM1-variabler med V-nummer när det passar (V01 försäljningstillväxt, V02 ARR, V04 bruttomarginal, V06 skuld/eget kapital, V09 ROE, V10 kassaflöde, V13 moat, V19 marginal of safety).
4. Historisk grund: relatera vid lämplighet till verkliga fall (Sinch, H&M, Penn Central, LTV, Nifty Fifty, IT-bubblan 2000, 2008).
5. Svaret skrivs på svenska, ton: respektfullt hård, som en short-seller som granskar en pitch.
6. Börja aldrig med "Jag" — gå rakt på frågan.`;

export async function POST(req: NextRequest) {
  try {
    const { mode, amne, tes } = await req.json();

    if (mode === "utmana") {
      // Eleven vill bli grillad på ett ämne
      const attacker = ATTACKER[amne] || ATTACKER["default"];
      const slump = Math.floor(Math.random() * attacker.length);
      const attack = attacker[slump];

      // Z.ai-läge: LLM genererar en färsk, skräddarsydd attack
      if (zaiAktiv()) {
        const svaret = await zaiChat(
          [
            { role: "system", content: ZAI_SYSTEM },
            { role: "user", content: `Eleven har begärt att bli grillad på ämnet "${amne}". Generera din nästa attackfråga.` },
          ],
          { temperatur: 0.9, maxTokens: 200 }
        );
        if (svaret) {
          return NextResponse.json({
            agent: "shortseller",
            mode: "sokratisk-llm",
            attack: { ...attack, fraga: svaret },
            historisktFall: HISTORISKA_FALL[amne] || null,
            meddelande: `🎯 [AKM1/AK1TS · GLM] ${svaret}`,
            kontext: attack.kontext,
            nastaSteg: "Svara med din analys. Short-Sellern kommer att följa upp.",
          });
        }
      }

      return NextResponse.json({
        agent: "shortseller",
        mode: "sokratisk",
        attack,
        historisktFall: HISTORISKA_FALL[amne] || null,
        meddelande: `🎯 [AKM1/AK1TS] ${attack.fraga}`,
        kontext: attack.kontext,
        nastaSteg: "Svara med din analys. Short-Sellern kommer att följa upp.",
      });
    }

    if (mode === "forsvar") {
      // Eleven lämnar in en tes — attackera den
      const tesText = String(tes || "").slice(0, 500);
      if (!tesText.trim()) {
        return NextResponse.json({ error: "Lämna in din tes för att bli grillad" }, { status: 400 });
      }

      // Hitta nyckelord i tesen för att välja attack-kategori
      const lower = tesText.toLowerCase();
      let kategori = "default";
      if (lower.includes("roe") || lower.includes("avkastning")) kategori = "roe";
      else if (lower.includes("tillväxt") || lower.includes("growth")) kategori = "tillväxt";
      else if (lower.includes("värde") || lower.includes("dcf") || lower.includes("wacc")) kategori = "varde";
      else if (lower.includes("risk") || lower.includes("portfölj")) kategori = "risk";

      const attacker = ATTACKER[kategori];
      const attack = attacker[Math.floor(Math.random() * attacker.length)];

      // Z.ai-läge: LLM läser HELA tesen och anger det svagaste antagandet
      if (zaiAktiv()) {
        const svaret = await zaiChat(
          [
            { role: "system", content: ZAI_SYSTEM },
            { role: "user", content: `Elevens tes att försvara:\n"""${tesText}"""\n\nHitta det svagaste antagandet och ställ din attackfråga.` },
          ],
          { temperatur: 0.8, maxTokens: 200 }
        );
        if (svaret) {
          return NextResponse.json({
            agent: "shortseller",
            mode: "sokratisk-llm",
            attack: { ...attack, fraga: svaret },
            historisktFall: HISTORISKA_FALL[kategori] || null,
            meddelande: `🔴 [AKM1/AK1TS · GLM] ${svaret}`,
            kontext: attack.kontext,
            tips: "Short-Sellern ger inga svar — bara frågor. Försvara din position!",
            nastaSteg: "Försvara din tes eller revidera den. Det är så man växer.",
          });
        }
      }

      // Generera sokratisk motfråga baserad på tesen
      const sokratiskFraga = attack.fraga === "default"
        ? "Din tes vilar på antaganden. Vilket är det SVAGASTE antagandet — och vad händer om det är fel?"
        : attack.fraga;

      return NextResponse.json({
        agent: "shortseller",
        mode: "sokratisk",
        attack: { ...attack, fraga: sokratiskFraga },
        historisktFall: HISTORISKA_FALL[kategori] || null,
        meddelande: `🔴 [AKM1/AK1TS] ${sokratiskFraga}`,
        kontext: attack.kontext,
        tips: "Short-Sellern ger inga svar — bara frågor. Försvara din position!",
        nastaSteg: "Försvara din tes eller revidera den. Det är så man växer.",
      });
    }

    return NextResponse.json({ error: "Ogiltigt läge — använd 'utmana' eller 'forsvar'" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
