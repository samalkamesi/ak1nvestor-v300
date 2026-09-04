import { NextRequest, NextResponse } from "next/server";
import {
  POANGBASER,
  RISK_NIVOR,
  RISK_TAKTER,
  byggPortfolj,
  hamtaRiskProfil,
  sakradPoangBas,
} from "@/lib/portfolj-forskning/riskportfolj";
import type { RiskNiva, TillvaxtTakt } from "@/lib/portfolj-forskning/typer";
import { lasKorstabellGrund } from "@/lib/portfolj-forskning/korstabell-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PORTFÖLJFORSKNING — P7:s API.
 *
 * GET  /api/portfolj-forskning
 *   → 200 { finns: true,  antal, rader: KorstabbellRad[] }   (normaliserat underlag)
 *   → 200 { finns: false, antal: 0, rader: [] }              (P6 har ej levererat —
 *                                                             motorn gissar aldrig)
 *
 * POST /api/portfolj-forskning { riskniva, takt, poangbas? }
 *   riskniva: "konservativ" | "balanserad" | "tillvaxt"  (å-form "risknivå" accepteras)
 *   takt:      "lugn" | "stadig" | "aggressiv"
 *   poangbas:  "akm1" (default) | "akm2"                  (våg 57 D2 — ogiltigt → akm1)
 *   → 200 { forslag: PortfoljForslag, antalRader }   — deterministiskt byggd ur
 *        hamtaRiskProfil + byggPortfolj (poängbas 50 % · vågstatus 35 % · golv 15 %)
 *   → 400 ogiltig risknivå/takt
 *   → 503 underlag saknas (korstabell-grund.json ej levererad)
 *
 * Prenumerationsgating (AKM2-läget kräver Portföljforskning Plus) sker i
 * UI:t (bygg-portfolj-kort.tsx) — detta API har ingen autentisering alls och
 * motorn validerar aldrig prenumerationer.
 *
 * ALLT är pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528).
 */

/** GET — korstabellens normaliserade rader, om P6:s underlag finns. */
export async function GET() {
  const { finns, rader } = lasKorstabellGrund();
  return NextResponse.json(
    { finns, antal: rader.length, rader },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** POST — bygg en forskningsportfölj ur vald risknivå + tillväxttakt (+ poängbas). */
export async function POST(req: NextRequest) {
  try {
    const kropp: Record<string, unknown> = await req.json().catch(() => ({}));

    // Indatavalidering — nycklar utan å/ä/ö är kontraktet, å-formerna tolereras.
    const risknivaRå = kropp.riskniva ?? kropp["risknivå"];
    const taktRå = kropp.takt;
    if (typeof risknivaRå !== "string" || !RISK_NIVOR.includes(risknivaRå as RiskNiva)) {
      return NextResponse.json(
        { error: `Ogiltig risknivå — förväntas en av: ${RISK_NIVOR.join(", ")}` },
        { status: 400 },
      );
    }
    if (typeof taktRå !== "string" || !RISK_TAKTER.includes(taktRå as TillvaxtTakt)) {
      return NextResponse.json(
        { error: `Ogiltig tillväxttakt — förväntas en av: ${RISK_TAKTER.join(", ")}` },
        { status: 400 },
      );
    }
    const riskniva = risknivaRå as RiskNiva;
    const takt = taktRå as TillvaxtTakt;
    const poangbas = sakradPoangBas(kropp.poangbas); // ogiltigt/saknat → "akm1" (våg 57 D2)

    // Underlaget LÄSES vid varje anrop — P6:s leverans börjar gälla direkt.
    const { finns, rader } = lasKorstabellGrund();
    if (!finns) {
      return NextResponse.json(
        {
          error:
            "Underlaget saknas ännu — korstabell-grund.json har inte levererats. Motorn gissar aldrig; datainsamlingen pågår.",
          finns: false,
        },
        { status: 503 },
      );
    }

    const profil = hamtaRiskProfil(riskniva, takt);
    const forslag = byggPortfolj(profil, rader, { poangbas });
    return NextResponse.json(
      { forslag, antalRader: rader.length, poangbas, poangbaser: POANGBASER },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const meddelande = e instanceof Error ? e.message : "Okänt fel i portföljbygget";
    return NextResponse.json({ error: meddelande }, { status: 500 });
  }
}
