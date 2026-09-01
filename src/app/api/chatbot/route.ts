import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/content";
import { EKOSYSTEM } from "@/lib/ekosystem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chatbot — kunskapsbaserad AI-chat (deterministisk v1).
 * Svarar från: kursbiblioteket (226 kurser), varumärkes-FAQ, Fas-systemet.
 * Uppgraderingsväg: LLM-nyckel (OPENAI/Z-ai) ger fritt formulerade svar —
 * dokumenterat i PLAN_MEGASYSTEM; tills dess: sök + mallar, alltid källhänvisat.
 */

const BRAND: Array<{ nyckel: RegExp; svar: string }> = [
  {
    nyckel: /(vem är|vad är).*(sam|alkamesi)/i,
    svar:
      "Sam Alkamesi är grundaren av AK1nvestor.com och AK1A Research Lab. Hans tes: fundamentalanalys är en rättighet — som luft och vatten — därför är Fas 1 (hela utbildningen) alltid gratis. I Fas 2 utbildar han personligt framtida representanter (ansökan + möte krävs). Se /medlemskap.",
  },
  {
    nyckel: /(vem är|vad är).*(ak1|ak1a|ak1nvestor)/i,
    svar:
      "AK1nvestor.com är varumärket — företaget och grundaren Sam Alkamesi. Lab.ak1nvestor.com är plattformen: 226 kurser, analyser, portföljsystem och forskningslabbet. Tillsammans: institutionell metodik, öppet redovisad, för alla människor.",
  },
  {
    nyckel: /(fas 1|fas 2|fas 3|pris|kostar)/i,
    svar:
      "Fas 1 = ALLT gratis för alltid (alla kurser, kalkylator, portföljsystem). Fas 2 = 9 999 kr personlig utbildning medgrundaren (ansökan + 90 dagars nöjdhetsgaranti — betala först när nöjd). Fas 3 = 13 999 kr, presenteras snart. Se /medlemskap.",
  },
  {
    nyckel: /(chatbot|ai|hjälp|fungerar)/i,
    svar:
      "Jag är AK1A:s kunskaps-chatbot: jag svarar från hela kursbiblioteket (226 kurser), analyserna och varumärket. Fråga t.ex. 'vad är ROE?', 'tips på kurs om vågor', 'vem är Sam?', 'hur fungerar kalkylatorn?'.",
  },
  {
    nyckel: /(policy|integritet|gdpr|data)/i,
    svar:
      "Vår integritetspolicy i korthet: endast e-post vid konto, kursprogress sparas LOKALT i din browser (lämnar aldrig din dator), besöksmätning anonym per session (90 dagar), ingen försäljning av data. Läs hela på /privacy-policy och /finansiell-policy.",
  },
];

export async function POST(req: NextRequest) {
  try {
    const { fraga } = await req.json();
    const q = String(fraga || "").slice(0, 300);
    if (!q.trim()) {
      return NextResponse.json({ svar: "Ställ en fråga — om kurser, AKM1, portföljer eller vem vi är! 🙋" });
    }

    // 1) Varumärke först
    for (const b of BRAND) {
      if (b.nyckel.test(q)) {
        return NextResponse.json({ svar: b.svar, kalla: "varumärke" });
      }
    }

    // 2) AKM1-variabel detektering — om eleven frågar om en specifik variabel
    const AKM1_VAR = {
      "v01": "V01 Försäljningstillväxt — (omsättning i år − omsättning förra året) / förra året. Poäng: 0-5. /kurser/v01-forsaljningstillvaxt",
      "v02": "V02 ARR-tillväxt — återkommande intäkter (prenumerationer). /kurser/v02-arr-tillvaxt",
      "v03": "V03 Intäktsdiversifiering — bredd i kundbas. /kurser/v03-intaktsdiversifiering",
      "v04": "V04 P/S — pris/omsättning. /kurser/v04-ps",
      "v05": "V05 P/B — pris/bokfört värde. /kurser/v05-pb",
      "v06": "V06 EV/EBITDA — företagsvärde/rörelseresultat före avskrivningar. /kurser/v06-ev-ebitda",
      "v07": "V07 Bruttomarginal — (omsättning − rörelsens kostnader) / omsättning. /kurser/v07-bruttomarginal",
      "v08": "V08 EBITDA-marginal. /kurser/v08-ebitda-marginal",
      "v09": "V09 ROE — avkastning på eget kapital. /kurser/v09-roe",
      "v10": "V10 Skuldsättningsgrad. /kurser/v10-skuldsattningsgrad",
      "v11": "V11 Likviditet (kvickkvot). /kurser/v11-likviditet",
      "v12": "V12 Intäktsstabilitet. /kurser/v12-intaktsstabilitet",
      "v13": "V13 Patent & IP. /kurser/v13-patent-ip",
      "v14": "V14 Varumärke. /kurser/v14-varumarke",
      "v15": "V15 Nätverkseffekter. /kurser/v15-natverkseffekter",
      "v16": "V16 Produktlanseringar. /kurser/v16-produktlanseringar",
      "v17": "V17 Avtal & Partnerskap. /kurser/v17-avtal-partnerskap",
      "v18": "V18 Regulatoriska katalysatorer. /kurser/v18-regulatoriska",
      "v19": "V19 Kapitalförbränning. /kurser/v19-kapitalforbranning",
      "v20": "V20 Återköp & insiderköp. /kurser/v20-aterekop-egna-aktier",
      "roe": "V09 ROE = resultat efter skatt / snitt eget kapital. Poäng 0-5: ≥20%=5, ≥15%=4, ≥10%=3. Kurs: /kurser/v09-roe. Testa i kalkylatorn: /kalkylator",
      "bruttomarginal": "V07 Bruttomarginal = (omsättning − kostnader) / omsättning. ≥60%=5, ≥40%=4, ≥25%=3. Kurs: /kurser/v07-bruttomarginal",
      "p/e": "Värdering — P/E = pris / vinst per aktie. Ingår i AKM1:s värderingskategori (V04-V06). Kalkylator: /kalkylator",
      "p/s": "V04 P/S = börsvärde / omsättning. <1=5p, <2=4p, <3=3p. Kurs: /kurser/v04-ps",
      "p/b": "V05 P/B = börsvärde / eget kapital. <1=5p, <2=4p. Kurs: /kurser/v05-pb",
      "ev/ebitda": "V06 EV/EBITDA = (börsvärde + skulder − kassa) / EBITDA. <5=5p, <7=4p. Kurs: /kurser/v06-ev-ebitda",
      "tillväxt": "AKM1 Tillväxt = V01-V03 (försäljning, ARR, diversifiering). Alla tre mäter olika aspekter av tillväxt. Kurser: /kurser",
      "moat": "AKM1 Moat = V13-V15 (patent, varumärke, nätverk). Moat = varaktig konkurrensfördel. Kurser: /kurser/v13-patent-ip",
      "risk": "AKM1 Risk = V19 (kapitalförbränning) + V10 (skulder). Kurs: /kurser/v19-kapitalforbranning",
      "marginal of safety": "Grahams kärna: köp till 30-50% under beräknat värde. AKM1 bygger på detta — varje variabel bidrar till marginalen. Läs: /kurser/the-intelligent-investor (kap 20)",
      "mr market": "Mr Market = din partner som erbjuder pris varje dag efter humör. AK1TS: teknisk våg-läsning i 5 horisonter. Kurs: /kurser/the-intelligent-investor (kap 8)",
      "ekosystem": "AK1A Ecosystem = AKM1 (20 fundamentalvariabler) + AK1TS (5 teorier × 5 horisonter × 4 dimensioner = 100 datapunkter). Se: /kurser/portfolj-ekosystemet",
      "kalkylator": "AKM1-kalkylatorn finns på /kalkylator — 20 variabler, räkna med egna siffror, automatisk poäng. Tre flikar: räkna, poängsätt, rapportguide.",
      "portfölj": "Portföljanalys finns på /min-portfolj — lägg in innehav, AKM1 per aktie, vågprofil, djupanalys med Python-motor. Se: /kurser/portfolj-ekosystemet",
    };

    const qLower = q.toLowerCase();
    for (const [nyckel, svar] of Object.entries(AKM1_VAR)) {
      if (qLower.includes(nyckel)) {
        return NextResponse.json({ svar, kalla: "AKM1-ekosystem", modell: "AKM1" });
      }
    }

    // 3) Kurssökning: träffar på titel/learn/why
    const kurser = Object.values(getCourses());
    const ord = q.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9åäö\/\-]/g, "")).filter((w) => w.length > 2);
    const poang = new Map<string, number>();
    for (const k of kurser) {
      const titel = k.title.toLowerCase();
      const text = `${k.learn || ""} ${k.why || ""} ${k.summary || ""}`.toLowerCase();
      let p = 0;
      for (const o of ord) {
        if (titel.includes(o)) p += o.length * 10; // titelträff väger 10x
        else if (text.includes(o)) p += o.length;
      }
      if (p > 0) poang.set(k.slug, p);
    }
    const topp = [...poang.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (topp.length > 0) {
      const relevanta = topp.map(([slug]) => kurser.find((k) => k.slug === slug)!);
      const svar =
        relevanta.length === 1
          ? `Enligt AKM1 (20 fundamentalvariabler) — det låter som kursen **${relevanta[0].title}** (${relevanta[0].totalMinutes || relevanta[0].minutes} min).\n\n${relevanta[0].learn}\n\nBör här: /kurser/${relevanta[0].slug}`
          : `Flera kurser matchar:\n${relevanta
              .map((k) => `• **${k.title}** — ${k.learn?.slice(0, 90)}… (/kurser/${k.slug})`)
              .join("\n")}`;
      return NextResponse.json({ svar, kalla: "kursbiblioteket" });
    }

    // 3) Fallback med guidning
    return NextResponse.json({
      svar:
        "Jag hittade ingen direkt träff — men jag kan: förklara alla 20 AKM1-variabler ('vad är ROE?'), tipsa kurser ('kurs om risk'), berätta om Fas 1/2/3, Sam Alkamesi, eller hur portföljanalysen fungerar. Prova gärna ett av dem!",
      kalla: "vägledning",
    });
  } catch {
    return NextResponse.json({ svar: "Något gick fel — försök igen." }, { status: 400 });
  }
}
