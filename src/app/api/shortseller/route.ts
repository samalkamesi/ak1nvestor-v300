import { NextRequest, NextResponse } from "next/server";
import { zaiAktiv, zaiChat } from "@/lib/zai";
import {
  AMNEN,
  forsvarsFragor,
  historisktFallFor,
  kontextuellInledning,
  valAttack,
  valBerakningsAttack,
  type AmneVal,
  type AttackFraga,
  type Niva,
} from "@/lib/shortseller-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/shortseller — Agent 3: The Short-Seller (v2, se shortseller-bank.ts
 * för 10x-kalkylen).
 *
 * Sokratisk grillningsagent som ALDRIG ger direkta svar — enda undantaget är
 * beräknings-attacker, där rätt svar + förklaring skickas med i svaret och
 * visas av klienten FÖRST efter elevens val.
 *
 * Lägen:
 * - "utmana":    { amne, niva?, typ?: "sokratisk"|"berakning", exkludera?, elevCtx? }
 *                Eleven vill bli grillad. Z.ai GLM först (ZAI_API_KEY via
 *                zaiAktiv()), deterministisk bank-fallback alltid.
 * - "forsvar":   { tes, niva? }
 *                Tesen attackeras: nyckelordsanalys väljer 1–5 sekventiella
 *                attacker (klienten kör "Hållbart?/Försvaret håller inte").
 *                GLM kan dessutom generera en skräddarsydd öppningsattack.
 *
 * AI-READY (10x punkt 6): utan ZAI_API_KEY svarar den deterministiska banken
 * identiskt — sajten fungerar ALLTID.
 */

/** System-prompt för Z.ai GLM — sokratisk Reasoning Mode (ALDRIG direkta svar). */
const ZAI_SYSTEM = `Du är "Short-Sellern" — en sokratisk grillningsagent i AK1A Research Lab (svensk finansutbildning).
DIN ENDA UPPGIFT: angrip elevens investeringsanalys med skarpa motfrågor. Du ger ALDRIG direkta svar, ALDRIG beröm, ALDRIG bekräftelse — bara frågor som tvingar eleven att granska sina antaganden.

REGLER:
1. Ett svar = EN enda motfråga (max 3 meningar). Ingen lista, ingen utläggning.
2. Attackera alltid det SVAGASTE antagandet i elevens text: sifferunderlag, snittberäkningar, hållbarhet, WACC/multipel-val, moat, hävstång, konjunkturkänslighet.
3. Referera AKM1-variabler med V-nummer när det passar (V01 försäljningstillväxt, V02 ARR, V04 P/S, V06 EV/EBITDA, V07 bruttomarginal, V09 ROE, V10 skuldsättningsgrad, V13 patent/moat, V19 kapitalförbränning & emission-risk, V20 återköp).
4. Historisk grund: relatera vid lämplighet till verkliga fall (Sinch, H&M, Penn Central, Kodak, Wirecard, Northvolt, LTCM, Nifty Fifty, IT-bubblan 2000, 2008).
5. Svaret skrivs på svenska, ton: respektfullt hård, som en short-seller som granskar en pitch — aldrig nedvärderande av eleven som person.
6. Börja aldrig med "Jag" — gå rakt på frågan.
7. Eleven har en färdighetsnivå 1–3 (1 = grunder, 3 = avancerad): anpassa frågans vinkel, inte respekten.`;

type ElevCtx = {
  klaraKurser: string[];
  xp: number;
  sokvag: string;
  paagaaendeKurs: string | null;
};

function somNiva(v: unknown): Niva {
  return v === 2 || v === 3 ? v : 1;
}

function somStrang(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

function somElevCtx(rå: unknown): ElevCtx {
  const c = (rå ?? {}) as { klaraKurser?: unknown; xp?: unknown; sokvag?: unknown; paagaaendeKurs?: unknown };
  return {
    klaraKurser: Array.isArray(c.klaraKurser)
      ? c.klaraKurser.filter((x): x is string => typeof x === "string").slice(0, 60)
      : [],
    xp: Number(c.xp) || 0,
    sokvag: String(c.sokvag || "/").slice(0, 200),
    paagaaendeKurs: somStrang(c.paagaaendeKurs, 120),
  };
}

/** Bygg en kort kontextrad till GLM-prompten av elevens situation. */
function kontextRad(ctx: ElevCtx): string {
  const bitar: string[] = [];
  if (ctx.klaraKurser.length > 0) {
    const vNamn = ctx.klaraKurser
      .map((slug) => slug.split("-")[0].toUpperCase())
      .filter((v) => /^V\d+$/.test(v))
      .slice(0, 8);
    bitar.push(
      `Eleven har klarat ${ctx.klaraKurser.length} kurser${vNamn.length > 0 ? ` (${vNamn.join(", ")})` : ""} med ${ctx.xp} XP`
    );
  } else {
    bitar.push(`Eleven är ny (${ctx.xp} XP, inga kurser klarade ännu)`);
  }
  if (ctx.paagaaendeKurs) bitar.push(`och läser just nu kursen "${ctx.paagaaendeKurs}"`);
  else if (ctx.sokvag && ctx.sokvag !== "/") bitar.push(`och står på sidan ${ctx.sokvag}`);
  return bitar.join(" ") + ".";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode } = body ?? {};

    // ── Läge 1: utmana — grillning på ett ämne (GLM först, bank-fallback) ──
    if (mode === "utmana") {
      const giltiga = new Set<string>(AMNEN.map((a) => a.id));
      const amneVal: AmneVal = giltiga.has(String(body.amne)) ? (body.amne as AmneVal) : "overraska";
      const niva = somNiva(body.niva);
      const arBerakning = body.typ === "berakning";
      const exkludera: string[] = Array.isArray(body.exkludera)
        ? body.exkludera.filter((x: unknown): x is string => typeof x === "string").slice(0, 60)
        : [];
      const elevCtx = somElevCtx(body.elevCtx);

      // Beräknings-attacker är alltid deterministiska — siffrorna ska inte improviseras.
      const attack: AttackFraga = arBerakning
        ? valBerakningsAttack(niva, exkludera)
        : valAttack({ amne: amneVal, niva, exkludera });
      const inledning = kontextuellInledning(attack, elevCtx);

      if (!arBerakning && zaiAktiv()) {
        const svaret = await zaiChat(
          [
            { role: "system", content: ZAI_SYSTEM },
            {
              role: "user",
              content: `${kontextRad(elevCtx)} Eleven har färdighetsnivå ${niva} av 3 och har begärt att bli grillad på ämnet "${amneVal}". Generera din nästa attackfråga — gärna kopplad till elevens situation.`,
            },
          ],
          { temperatur: 0.9, maxTokens: 200 }
        );
        if (svaret) {
          return NextResponse.json({
            agent: "shortseller",
            mode: "sokratisk-llm",
            kalla: "llm",
            attack: { ...attack, fraga: svaret, berakning: undefined },
            kontextuellInledning: inledning,
            historisktFall: historisktFallFor(attack.amne),
            meddelande: `🎯 [AKM1/AK1TS · GLM] ${inledning ?? ""}${svaret}`,
            kontext: attack.kontext,
            nastaSteg: "Svara med din analys. Short-Sellern kommer att följa upp.",
          });
        }
      }

      return NextResponse.json({
        agent: "shortseller",
        mode: arBerakning ? "berakning" : "sokratisk",
        kalla: "bank",
        attack,
        kontextuellInledning: inledning,
        historisktFall: historisktFallFor(attack.amne),
        meddelande: arBerakning
          ? `🧮 [AKM1/AK1TS] Räkna — och välj. Svar och förklaring kommer först efter ditt val.`
          : `🎯 [AKM1/AK1TS] ${inledning ?? ""}${attack.fraga}`,
        kontext: attack.kontext,
        nastaSteg: arBerakning
          ? "Räkna först i huvudet eller på papper — välj sedan alternativ."
          : "Svara med din analys. Short-Sellern kommer att följa upp.",
      });
    }

    // ── Läge 2: försvar — tesen attackeras sekventiellt (1–5 attacker) ─────
    if (mode === "forsvar") {
      const tesText = somStrang(body.tes, 600);
      if (!tesText) {
        return NextResponse.json({ error: "Lämna in din tes för att bli grillad" }, { status: 400 });
      }
      const niva = somNiva(body.niva);

      // Deterministisk grund: nyckelordsanalys → 1–5 sekventiella attacker
      const attacker = forsvarsFragor(tesText, niva, 5);

      // GLM-läge: en skräddarsydd öppningsattack på hela tesen (fallback ovan)
      let oppningsAttack: string | null = null;
      if (zaiAktiv()) {
        oppningsAttack = await zaiChat(
          [
            { role: "system", content: ZAI_SYSTEM },
            {
              role: "user",
              content: `Eleven försvarar följande tes (färdighetsnivå ${niva} av 3):\n"""${tesText}"""\n\nHitta det svagaste antagandet och ställ din öppningsattack.`,
            },
          ],
          { temperatur: 0.8, maxTokens: 200 }
        );
      }

      return NextResponse.json({
        agent: "shortseller",
        mode: "forsvar",
        kalla: oppningsAttack ? "llm" : "bank",
        attacker,
        oppningsAttack,
        historisktFall: attacker[0] ? historisktFallFor(attacker[0].amne) : null,
        meddelande:
          oppningsAttack
            ? `🔴 [AKM1/AK1TS · GLM] ${oppningsAttack}`
            : `🔴 [AKM1/AK1TS] Tesen läst. ${attacker.length} attacker väntar — en i taget.`,
        tips: "Short-Sellern ger inga svar — bara frågor. Svara ärligt på varje attack: det är där lärandet bor.",
        nastaSteg: "Döm varje försvar själv: Hållbart — eller höll det inte? Betyget kommer på slutet.",
      });
    }

    return NextResponse.json({ error: "Ogiltigt läge — använd 'utmana' eller 'forsvar'" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
