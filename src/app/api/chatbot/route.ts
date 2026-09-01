import { NextRequest, NextResponse } from "next/server";
import { getCourses } from "@/lib/content";
import { lasMedlem, niva, lasXP, lasKlaraKurser } from "@/lib/member-local";
import { zaiAktiv, zaiChat } from "@/lib/zai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chatbot — AI-Mentorn: superintelligent guide som:
 * 1. Känner eleven (nivå, XP, klarade kurser, plats på sajten)
 * 2. Förstår SAMMANHANG (var eleven befinner sig just nu)
 * 3. GER HANDLINGAR ("klicka här", "gör detta nu", "nästa steg")
 * 4. Följer AKM1/AK1TS-ekosystemet i ALLT
 * 5. Proaktiv: föreslår NÄSTA STEG innan eleven frågar
 */

type Intent = {
  typ: "navigering" | "utbildning" | "analys" | "portfölj" | "inspiration" | "hjälp" | "system";
  handlings: Array<{ text: string; lank: string; ikon: string; beskrivning?: string }>;
};

function byggKontext(sokvag: string): Record<string, unknown> {
  // Känner eleven
  const medlem = lasMedlem();
  const nivaV = typeof window !== "undefined" ? niva() : 1;
  const xp = typeof window !== "undefined" ? lasXP() : 0;
  const klara = typeof window !== "undefined" ? lasKlaraKurser() : [];

  // Känner plats
  const sida = sokvag.split("/").filter(Boolean);

  return { medlem, niva: nivaV, xp, klaraKurser: klara.length, sida };
}

function navigera(fraga: string): Intent | null {
  const q = fraga.toLowerCase();

  // NAVIGERING — eleven vill komma någonstans
  if (/vart|hur hittar|var finns|ta mig till|visa|gå till|navigera|klicka/.test(q)) {
    if (/kurser|utbild/.test(q)) return { typ: "navigering", handlings: [
      { text: "Alla kurser (227 st)", lank: "/kurser", ikon: "📚" },
      { text: "Läroplanen (5 nivåer)", lank: "/laroplan", ikon: "🗺️" },
      { text: "Graham komplett (21 kap)", lank: "/kurser/the-intelligent-investor", ikon: "🏛️" },
    ]};
    if (/portfölj|mina aktier|innehav/.test(q)) return { typ: "navigering", handlings: [
      { text: "Min portfölj (lägg in aktier)", lank: "/min-portfolj", ikon: "💼" },
      { text: "Portfölj-kursen (5×5×4)", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
    ]};
    if (/topplista|leaderboard|tävla|rank/.test(q)) return { typ: "navigering", handlings: [
      { text: "Topplistan 🏆", lank: "/topplista", ikon: "🏆" },
      { text: "Förtjäna XP: läs en kurs", lank: "/kurser", ikon: "📚" },
      { text: "Logga in gratis", lank: "/logga-in", ikon: "🔑" },
    ]};
    if (/bibliotek|bok|böcker|bokkanon|läslista/.test(q)) return { typ: "navigering", handlings: [
      { text: "Biblioteket 📖 (100 böcker)", lank: "/bibliotek", ikon: "📖", beskrivning: "Kanon kopplad till AKM1/AK1TS" },
      { text: "Bokmaster-kurser", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: "13 böcker kapitel för kapitel" },
    ]};
    if (/kalkylator|räkna|beräkna/.test(q)) return { typ: "navigering", handlings: [
      { text: "AKM1-kalkylatorn (20 variabler)", lank: "/kalkylator", ikon: "🧮" },
      { text: "Var hittar jag siffrorna?", lank: "/kalkylator", ikon: "📖" },
    ]};
    if (/analys|aktie|bolag/.test(q)) return { typ: "navigering", handlings: [
      { text: "Alla analyser", lank: "/analyser", ikon: "📊" },
      { text: "Precise Biometrics", lank: "/analyser/PREC.ST", ikon: "🎯" },
      { text: "Volvo Cars", lank: "/analyser/VOLCAR-B", ikon: "🚗" },
    ]};
    if (/blogg|artikel/.test(q)) return { typ: "navigering", handlings: [
      { text: "Bloggen (29 artiklar)", lank: "/blogg", ikon: "✍️" },
      { text: "Så läser du en årsredovisning", lank: "/blogg/sa-laser-du-en-svensk-arsredovisning", ikon: "📖" },
    ]};
    if (/profil|testa|diagnos/.test(q)) return { typ: "navigering", handlings: [
      { text: "Din finansiella personlighet", lank: "/profil", ikon: "🧠" },
      { text: "Diagnostest (5 frågor)", lank: "/diagnos", ikon: "⚡" },
    ]};
    if (/logga in|konto|registrera/.test(q)) return { typ: "navigering", handlings: [
      { text: "Logga in / Skapa gratis konto", lank: "/logga-in", ikon: "🔑" },
    ]};
    if (/labb|case/.test(q)) return { typ: "navigering", handlings: [
      { text: "Labbet (201 case studies)", lank: "/labb", ikon: "🧪" },
    ]};
    if (/medlemskap|pris|fas/.test(q)) return { typ: "navigering", handlings: [
      { text: "Medlemskap (Fas 1/2/3)", lank: "/medlemskap", ikon: "💛" },
    ]};
  }

  // UTBILDNING — eleven vill lära sig
  if (/lär|utbild|förstå|förklara|vad är|hur fungerar|börja/.test(q)) {
    return { typ: "utbildning", handlings: [
      { text: "Börja här: Läroplanen Nivå 1", lank: "/laroplan", ikon: "🌱" },
      { text: "V09: ROE (viktigaste variabeln)", lank: "/kurser/v09-roe", ikon: "📊" },
      { text: "Testa dig: Kognitiv profil", lank: "/profil", ikon: "🧠" },
    ]};
  }

  // ANALYS — eleven vill analysera
  if (/analysera|värdera|bedöma|utvärdera/.test(q)) {
    return { typ: "analys", handlings: [
      { text: "Räkna med egna siffror", lank: "/kalkylator", ikon: "🧮" },
      { text: "Läs en årsredovisning", lank: "/blogg/sa-laser-du-en-svensk-arsredovisning", ikon: "📖" },
      { text: "Graham: Marginal of Safety", lank: "/kurser/the-intelligent-investor", ikon: "🌉" },
    ]};
  }

  // PORTFÖLJ — eleven vill bygga
  if (/portfölj|bygga|investera/.test(q)) {
    return { typ: "portfölj", handlings: [
      { text: "Bygg din portfölj", lank: "/min-portfolj", ikon: "💼" },
      { text: "Portfölj-ekosystem kursen", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
      { text: "5 vanliga nybörjarmisstag", lank: "/blogg/5-vanliga-nyborjarmisstag-svenska-aktier", ikon: "⚠️" },
    ]};
  }

  // INSPIRATION — eleven vill växa
  if (/motivation|inspiration|tips|råd|bli bättre/.test(q)) {
    return { typ: "inspiration", handlings: [
      { text: "Vad är institutionell aktieanalys?", lank: "/blogg/vad-ar-institutionell-aktieanalys", ikon: "🏛️" },
      { text: "Så läser du din portföljrapport", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📊" },
      { text: "Grahams arv (kap 21)", lank: "/kurser/the-intelligent-investor", ikon: "🎓" },
    ]};
  }

  // SYSTEM — eleven frågar om systemet
  if (/system|ekosystem|ai|organ|hur fungerar sidan/.test(q)) {
    return { typ: "system", handlings: [
      { text: "AI-organens status", lank: "/api/autonom/status", ikon: "🤖" },
      { text: "Styrelsens beslut", lank: "/api/styrelse/beslut", ikon: "🏛️" },
      { text: "Ekosystem-kursen", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
    ]};
  }

  return null;
}

/**
 * VÅGFUNDAMENT — fundamentalvågor enligt P7-protokollet (VAGFUNDAMENT-SPEC).
 * P8-sekretess: här lever ENDAST terminologi, svarsstruktur och beteenden —
 * inga klassificeringströsklar, formler eller bekräftelseregler (de stannar i motorn).
 */
function vagfundamentSvar(
  fraga: string
): { svar: string; handlings: Array<{ text: string; lank: string; ikon: string }> } | null {
  const q = fraga.toLowerCase();

  const triggar =
    /vågfundament|fundamentalvåg|fundamental våg|variabelns våg|vågklass|vågmatris|våg-matris|divergens|20\s*[×x]\s*5/.test(q) ||
    (/våg/.test(q) && (/v\d{2}/.test(q) || /mikro|medellång|mega|horisont/.test(q)));
  if (!triggar) return null;

  const VF_VARIABLER: Record<string, string> = {
    V01: "Försäljningstillväxt", V02: "ARR-tillväxt", V03: "Intäktsdiversifiering",
    V04: "P/S", V05: "P/B", V06: "EV/EBITDA",
    V07: "Bruttomarginal", V08: "EBITDA-marginal", V09: "ROE",
    V10: "Skuldsättningsgrad", V11: "Likviditet", V12: "Intäktsstabilitet",
    V13: "Patent & IP", V14: "Varumärke & Kundlojalitet", V15: "Nätverkseffekter",
    V16: "Produktlanseringar", V17: "Avtal & Partnerskap", V18: "Regulatoriska katalysatorer",
    V19: "Kapitalförbrukning & Emission-risk", V20: "Återköp",
  };

  const vMatch = q.match(/v(\d{2})/);
  const vId = vMatch ? `V${vMatch[1]}` : null;
  const vNamn = vId ? VF_VARIABLER[vId] : undefined;

  // Obs: "medellång" innehåller "lång" — testa i rätt ordning
  const horisont = /medellång/.test(q)
    ? "medellång"
    : /mikro/.test(q)
      ? "mikro"
      : /mega/.test(q)
        ? "mega"
        : /kort/.test(q)
          ? "kort"
          : /lång/.test(q)
            ? "lång"
            : null;

  const rad = vId
    ? `Du frågar om ${vNamn ? `${vId} ${vNamn}` : `variabeln ${vId}`}${horisont ? ` på horisonten ${horisont}` : " — den har en egen våg per horisont"}.`
    : horisont
      ? `Du frågar om horisonten ${horisont} — varje variabel har sin egen våg där.`
      : `Varje AKM1-variabel (V01–V20) har sin egen våg på fem horisonter: mikro, kort, medellång, lång och mega.`;

  const divergensText = /divergens/.test(q)
    ? `\nDivergens: när fundamentalvågen och prisvågen pekar olika (t.ex. fundamental ▲ men pris ▼) är det en värde-signal att studera — aldrig en köp- eller säljsignal.`
    : "";

  const svar = `[VÅGFUNDAMENT] Källa: Vågfundamentet — AKM1:s 20 variabler som tidsserier (20×5-matrisen).
${rad}
Vågklasser (varje cell = variabel × horisont):
• ▲ impulsvåg — fundamentalen rör sig uppåt: variabeln förbättras
• ▼ korrigering — fundamentalen rör sig nedåt: variabeln försvagas
• ◼ basbygge — fundamentalen ligger still och samlar kraft
• · osatt — för lite historik för att vågen ska kunna klassas; ärlig utdata, aldrig påhittad${divergensText}
Exakta celler läser du i matrisen på /vagfundament — jag citerar bara det som redovisas, aldrig mer.
Pedagogisk analys — inte investeringsråd.`;

  return {
    svar,
    handlings: [
      { text: "Öppna 20×5-matrisen →", lank: "/vagfundament", ikon: "🌊" },
      ...(vId ? [{ text: `Se ${vId} i kalkylatorn →`, lank: "/kalkylator", ikon: "🧮" }] : []),
      { text: "Ekosystem-kursen →", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
    ],
  };
}

/** AKM1-variabel svar med handlings-knappar */
function akm1Svar(fraga: string): { svar: string; handlings: Array<{ text: string; lank: string; ikon: string }> } | null {
  const q = fraga.toLowerCase();

  const VAR: Record<string, { svar: string; lank: string }> = {
    "roe": { svar: "V09 ROE = resultat / snitt EK.\nPoäng: ≥20%=5, ≥15%=4, ≥10%=3, ≥5%=2.\nHur räknar du? → Kursen + kalkylatorn nedan.", lank: "/kurser/v09-roe" },
    "bruttomarginal": { svar: "V07 Bruttomarginal = (omsättning − rörelsens kostnader) / omsättning.\n≥60%=5, ≥40%=4, ≥25%=3.\nVar hittar du den? → Resultaträkningen, rad 2.", lank: "/kurser/v07-bruttomarginal" },
    "p/s": { svar: "V04 P/S = börsvärde / omsättning.\n<1=5, <2=4, <3=3, <5=2.\nRäkna själv → Kalkylatorn.", lank: "/kurser/v04-ps" },
    "moat": { svar: "AKM1 Moat = V13 (patent) + V14 (varumärke) + V15 (nätverkseffekter).\nMoat = varaktig konkurrensfördel som skyddar vinster.", lank: "/kurser/v13-patent-ip" },
    "marginal of safety": { svar: "Grahams kärnbegrepp: köp till 30-50% under beräknat värde.\nBron byggd för 30 ton, lasten 10 ton = överlev att ha fel.", lank: "/kurser/the-intelligent-investor" },
    "mr market": { svar: "Mr Market = din partner som erbjuder pris VARJE DAG efter humör.\nEuforisk dag: köper dyrt. Deprimerad: säljer billigt.\nDu kan ignorera honom — han kommer tillbaka imorgon.", lank: "/kurser/the-intelligent-investor" },
    "ekosystem": { svar: "AK1A Ecosystem:\n• AKM1: 20 fundamentalvariabler (V01-V20)\n• AK1TS: 5 teorier × 5 horisonter × 4 dimensioner = 100 datapunkter\n• 5×5×4 = total bild på 100 datapunkter", lank: "/kurser/portfolj-ekosystemet" },
    "kalkylator": { svar: "AKM1-kalkylatorn: 20 variabler, tre flikar:\n1. Räkna med egna siffror (formler + auto-poäng)\n2. Poängsätt manuellt (reglage)\n3. Var hittar jag siffrorna? (rapportguide)", lank: "/kalkylator" },
    "portfölj": { svar: "Portföljsystemet: lägg in aktier → AKM1 per aktie → vågprofil → djupanalys med Python.\nAllt på en sida.", lank: "/min-portfolj" },
    "tillväxt": { svar: "AKM1 Tillväxt = V01 (försäljning) + V02 (ARR) + V03 (diversifiering).\nAlla tre mäter olika aspekter av tillväxtkvalitet.", lank: "/kurser/v01-forsaljningstillvaxt" },
    "risk": { svar: "AKM1 Risk = V19 (kapitalförbränning) + V10 (skuldsättningsgrad).\nRisk = inte bara volatilitet utan permanent förlust-kapital.", lank: "/kurser/v19-kapitalforbranning" },
  };

  for (const [nyckel, data] of Object.entries(VAR)) {
    if (q.includes(nyckel)) {
      return {
        svar: `[AKM1] ${data.svar}`,
        handlings: [
          { text: "Läs kursen →", lank: data.lank, ikon: "📚" },
          { text: "Räkna i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
          { text: "Se alla 20 variabler →", lank: "/kurser", ikon: "📊" },
        ],
      };
    }
  }

  // V-nummer
  const vMatch = q.match(/v(\d{2})/);
  if (vMatch) {
    const num = vMatch[1];
    return {
      svar: `[AKM1] Variabel V${num} — en av de 20 fundamentalvariablerna.\nSe alla i kursbiblioteket eller kalkylatorn.`,
      handlings: [
        { text: `Gå till V${num} →`, lank: `/kurser`, ikon: "📚" },
        { text: "Testa i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
      ],
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { fraga, sokvag } = await req.json();
    const q = String(fraga || "").slice(0, 300);
    if (!q.trim()) {
      return NextResponse.json({
        svar: "Jag är din AI-mentor. Vad vill du göra?",
        handlings: [
          { text: "Börja lära mig", lank: "/laroplan", ikon: "🌱" },
          { text: "Testa min nivå", lank: "/profil", ikon: "🧠" },
          { text: "Bygg portfölj", lank: "/min-portfolj", ikon: "💼" },
        ],
        typ: "start",
      });
    }

    // 1) VÅGFUNDAMENT — fundamentalvågor enligt P7 (citera exakt, aldrig extrapolera)
    const vf = vagfundamentSvar(q);
    if (vf) {
      return NextResponse.json({ ...vf, kalla: "Vågfundamentet — P7-protokollet", typ: "utbildning" });
    }

    // 2) AKM1-variabel svar — alltid deterministiskt (exakta formler, noll hallucination)
    const akm1 = akm1Svar(q);
    if (akm1) {
      return NextResponse.json({ ...akm1, kalla: "AKM1-ekosystem", typ: "utbildning" });
    }

    // 3) Navigering
    const nav = navigera(q);
    if (nav) {
      return NextResponse.json({
        svar: "Jag tar dig dit — klicka på någon av länkarna:",
        handlings: nav.handlings,
        typ: nav.typ,
        kalla: "AI-Mentor",
      });
    }

    // 4) Varumärke
    if (/vem är|vad är.*(sam|ak1|alkamesi|nvestor)/i.test(q)) {
      return NextResponse.json({
        svar: `Sam Alkamesi är grundaren av AK1nvestor.com. AK1A Research Lab (lab.ak1nvestor.com) är plattformen: ${Object.keys(getCourses()).length} kurser, analyser, portföljsystem och AI-mentor — allt bygger på AKM1 + AK1TS-ekosystemet. Fas 1 är alltid gratis.`,
        handlings: [
          { text: "Se medlemskap →", lank: "/medlemskap", ikon: "💛" },
          { text: "Läs mer om oss →", lank: "/om-oss", ikon: "🏛️" },
        ],
        kalla: "varumärke",
        typ: "hjälp",
      });
    }

    // 5) Proaktivt nästa steg
    const kurser = Object.values(getCourses());
    const ord = q.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9åäö\/\-]/g, "")).filter((w) => w.length > 2);
    const poang = new Map<string, number>();
    for (const k of kurser) {
      const titel = k.title.toLowerCase();
      const text = `${k.learn || ""} ${k.why || ""}`.toLowerCase();
      let p = 0;
      for (const o of ord) {
        if (titel.includes(o)) p += o.length * 10;
        else if (text.includes(o)) p += o.length;
      }
      if (p > 0) poang.set(k.slug, p);
    }
    const topp = [...poang.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    const relevanta = topp.map(([slug]) => kurser.find((k) => k.slug === slug)!).filter(Boolean);

    // 5b) Z.ai GLM-läge — fritt formulerat pedagogiskt svar, GROUNDAT i kurserna
    if (zaiAktiv()) {
      const kurserKontext = relevanta.length > 0
        ? relevanta.map((k) => `- /kurser/${k.slug} — ${k.title}: ${(k.learn || "").slice(0, 200)}`).join("\n")
        : "Inga kursmatchningar — svara allmänt pedagogiskt.";
      const svaret = await zaiChat(
        [
          {
            role: "system",
            content: `Du är "AI-Mentorn" i AK1A Research Lab (lab.ak1nvestor.com) — svensk finansutbildning med ${Object.keys(getCourses()).length} kurser, kalkylator (AKM1: 20 fundamentalvariabler V01-V20, 0-5 poäng, max 100), portföljsystem (AK1TS: 5 tidshorisonter × 5 teorier × 4 dimensioner), quiz med +10 XP, flashcards med spaced repetition, certifikat.

REGELVERK:
1. Svara på svenska — varm, rak, pedagogisk. Max ~150 ord.
2. ALLT ekosystem: nämner du ett fundamentalbegrepp, koppla till AKM1-variabel med V-nummer (t.ex. "V09 ROE = resultat efter skatt / snitt eget kapital").
3. HITTA PÅ ALDRIG formler eller siffror du inte är säker på — säg istället "räkna exakt i kalkylatorn".
4. Avsluta med en konkret nästa handling (kurs, kalkylatorn, quiz eller portföljen).
5. Eleven befinner sig nu på: ${sokvag || "/"} — anpassa svaret.
6. VÅGFUNDAMENT (fundamentalvågor/vågklass/våg för en V-variabel): källan är "Vågfundamentet — AKM1:s 20 variabler som tidsserier" — AKM1-variabeln är en tidsserie med en egen våg per horisont (mikro, kort, medellång, lång, mega) i 20×5-matrisen. Vågklasser: impulsvåg ▲ (fundamentalen förbättras), korrigering ▼ (försvagas), basbygge ◼ (samlar kraft), osatt · (för lite historik). P7-regler att följa: (a) citera celler exakt som de redovisas i matrisen; (b) extrapolera ALDRIG utanför osatta celler — osatt betyder osatt; (c) påtala divergens mellan fundamental våg och prisvåg när båda nämns (värde-signal att studera, aldrig köp/sälj); (d) avsluta alltid med disclaimern "pedagogisk analys — inte investeringsråd" och hänvisa till /vagfundament.

KURSMATCHNINGAR (grounding — lär dig från dessa, länka dem):
${kurserKontext}`,
          },
          { role: "user", content: q },
        ],
        { temperatur: 0.6, maxTokens: 400 }
      );
      if (svaret) {
        return NextResponse.json({
          svar: svaret,
          handlings: (relevanta.length > 0
            ? relevanta.slice(0, 2).map((k) => ({
                text: `Starta: ${k.title.slice(0, 30)}… →`,
                lank: `/kurser/${k.slug}`,
                ikon: "📚",
              }))
            : [
                { text: "Räkna i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
                { text: "Läroplanen →", lank: "/laroplan", ikon: "🗺️" },
              ]
          ).concat([{ text: "Repetera flashcards →", lank: "#", ikon: "🃏" }]),
          kalla: "Z.ai GLM + AKM1-ekosystem",
          typ: "utbildning",
          modell: "GLM",
        });
      }
    }

    if (topp.length > 0) {
      const relevanta = topp.map(([slug]) => kurser.find((k) => k.slug === slug)!).filter(Boolean);
      return NextResponse.json({
        svar: relevanta.length === 1
          ? `[AKM1] Det låter som kursen **${relevanta[0].title}** (${relevanta[0].totalMinutes || relevanta[0].minutes} min).\n\n${relevanta[0].learn}`
          : `[AKM1] Flera kurser matchar:\n${relevanta.map((k) => `• **${k.title}** — ${k.learn?.slice(0, 80)}…`).join("\n")}`,
        handlings: relevanta.slice(0, 3).map((k) => ({
          text: `Starta: ${k.title.slice(0, 30)}… →`,
          lank: `/kurser/${k.slug}`,
          ikon: "📚",
        })),
        kalla: "AKM1-ekosystem",
        typ: "utbildning",
      });
    }

    // 6) Fallback med proaktiva förslag
    return NextResponse.json({
      svar: "Jag kan hjälpa dig med allt på sajten. Här är nästa steg baserat på var du är:",
      handlings: [
        { text: "Fortsätt läroplanen →", lank: "/laroplan", ikon: "🗺️" },
        { text: "Räkna på en aktie →", lank: "/kalkylator", ikon: "🧮" },
        { text: "Bygg portfölj →", lank: "/min-portfolj", ikon: "💼" },
        { text: "Testa mig (quiz) →", lank: "/kurser/the-intelligent-investor", ikon: "🧠" },
      ],
      typ: "hjälp",
      kalla: "AI-Mentor",
    });
  } catch {
    return NextResponse.json({ svar: "Något gick fel — försök igen." }, { status: 400 });
  }
}
