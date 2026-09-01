import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/content";

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

    // 2) Kurssökning: träffar på titel/learn/why
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
          ? `Det låter som kursen **${relevanta[0].title}** (${relevanta[0].level}, ${relevanta[0].totalMinutes || relevanta[0].minutes} min).\n\n${relevanta[0].learn}\n\nBör här: /kurser/${relevanta[0].slug}`
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
