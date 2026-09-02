import { NextRequest, NextResponse } from "next/server";
import { getCourses, getBlogPosts } from "@/lib/content";
import { zaiAktiv, zaiChat } from "@/lib/zai";

import { getSupabaseRest } from "@/lib/supabase-rest";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/chatbot — AI-Mentorn: superintelligent guide som:
 * 1. Känner eleven (nivå, XP, klarade kurser, plats på sajten)
 * 2. Förstår SAMMANHANG (var eleven befinner sig just nu — alla sidtyper)
 * 3. REDIGERAR BEHOVET: tvetydiga frågor ("är Volvo bra?") möts med EN
 *    klarliggande motfråga om tidshorisont och mål (svar-typ "klarande") —
 *    mentorn gissar aldrig, den hjälper eleven formulera vad den vill veta
 * 4. GER HANDLINGAR ("klicka här", "gör detta nu", "nästa steg")
 * 5. Följer AKM1/AK1TS-ekosystemet i ALLT
 * 6. RÅDGIVNINGS-GRÄNS: ALDRIG köp/sälj-rekommendationer — alltid disclaimer
 *    ("pedagogisk analys — inte investeringsråd") vid värderingsnära frågor
 * 7. Proaktiv: föreslår NÄSTA STEG innan eleven frågar
 *
 * Svars-typen "klarande" använder handlings-länkar på formen "fragor:<text>"
 * (URL-kodad) — chat-widgeten skickar texten som en NY fråga, vilket gör
 * motfrågan klickbart svarsbar.
 */

type Intent = {
  typ: "navigering" | "utbildning" | "analys" | "portfölj" | "inspiration" | "hjälp" | "system" | "klarande";
  handlings: Array<{ text: string; lank: string; ikon: string; beskrivning?: string }>;
};

/** Enkelt sidnamn ur sökvägen — för GLM-promptens platssinne (server-sida). */
function sidKontextText(sokvag: string): string {
  const p = String(sokvag || "/").toLowerCase();
  const delar = p.split("/").filter(Boolean);
  const rot = delar[0] || "";
  const under = delar[1] || "";
  const kart: Record<string, string> = {
    kurser: under
      ? `kurs-sidan /kurser/${under} — eleven läser just nu denna kurs kapitel för kapitel`
      : "kursbiblioteket (307 kurser)",
    analyser: under
      ? `analysen av ${decodeURIComponent(under).toUpperCase()} — eleven fördjupar sig i ett enskilt bolag`
      : "analysbanken — eleven bläddrar bland analyser",
    kalkylator: "AKM1-kalkylatorn — eleven räknar på ett bolag just nu",
    "min-portfolj": "portföljsystemet — eleven följer sina innehav",
    portfoljbyggare: "portföljbyggaren — eleven bygger en tänkt portfölj rad för rad",
    blogg: under ? `bloggartikeln "${decodeURIComponent(under)}"` : "bloggen",
    labb: "Labbet (201 case studies)",
    laroplan: "läroplanen — elevens 5-nivåers resa",
    vagfundament: "Vågfundamentet — 20×5-matrisen med fundamentalvågor",
    konfluens: "Konfluensradarn — värde möter vågor",
    netnet: "Net-net-skannern — Grahams NCAV-screening",
    rapporter: "redovisningsverkstan — eleven bygger rapport",
    fas3: "Fas 3-sidan",
    "fas2-ansok": "Fas 2-ansökan",
    pro: "Pro-sidan (B2B)",
    medlemskap: "medlemskapssidan (Fas 1/2/3)",
    profil: "analytikerprofilen",
    "dagens-pass": "dagens pass",
    topplista: "topplistan",
    badges: "meritväggen (badges)",
    manifest: "manifestet",
    bibliotek: "biblioteket — bokkanon + BOKMASTER",
    certifikat: "certifikatssidan (betyg A–D)",
    superanalys: "superanalysen",
    "min-sida": "Min sida — elevens dashboard",
    "logga-in": "inloggningssidan",
    "om-oss": "Om oss-sidan",
  };
  if (kart[rot]) return kart[rot];
  if (!rot) return "startsidan";
  return `sidan ${p}`;
}

function navigera(fraga: string): Intent | null {
  const q = fraga.toLowerCase();
  // Levande tal — Uppdaterad 2026-09-01: 307 kurser · 78 BOKMASTER-böcker · 35 blogginlägg
  const antalKurser = Object.keys(getCourses()).length;
  const antalBokmaster = Object.values(getCourses()).filter((c) => c.category === "BOKMASTER").length;
  const antalBlogg = getBlogPosts().length;

  // NAVIGERING — eleven vill komma någonstans
  if (/vart|hur hittar|var finns|ta mig till|visa|gå till|navigera|klicka/.test(q)) {
    if (/kurser|utbild/.test(q)) return { typ: "navigering", handlings: [
      { text: `Alla kurser (${antalKurser} st)`, lank: "/kurser", ikon: "📚" },
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
      { text: "Biblioteket 📖 (bokkanon)", lank: "/bibliotek", ikon: "📖", beskrivning: "Kanon kopplad till AKM1/AK1TS" },
      { text: "Bokmaster-kurser", lank: "/kurser/the-intelligent-investor", ikon: "🏛️", beskrivning: `${antalBokmaster} böcker kapitel för kapitel` },
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
      { text: `Bloggen (${antalBlogg} artiklar)`, lank: "/blogg", ikon: "✍️" },
      { text: "Så läser du en årsredovisning", lank: "/blogg/sa-laser-du-en-svensk-arsredovisning", ikon: "📖" },
    ]};
    if (/profil|testa|diagnos/.test(q)) return { typ: "navigering", handlings: [
      { text: "Din finansiella personlighet", lank: "/profil", ikon: "🧠" },
      { text: "Analytikerprofilen (2 moduler)", lank: "/profil", ikon: "⚡" },
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

// ── SID-DATA-INTENTS (nya 2026-09-01) ───────────────────────────────────────
// Deterministiska svar på sajtens analys-verktyg — inspiration: dashfraga.ts.

/** VÅGKON — den deterministiska vågkonen (percentilband ur historikens egen σ). */
function vagkonSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/v[aå]gkon/.test(q)) return null;
  return {
    svar: `[VÅGKON] Vågkonen är den deterministiska vågkonen: ur en pris- eller fundamentalhistorik (t.ex. 24 månads-slutkurser) räknas percentilband per AK1TS-horisont — ren matematik ur seriens egen standardavvikelse, ingen slump, inga gissningar.
Så läser du den:
• Ligger kursen i konens nedre band är den lågt mot sin egen historia — i övre bandet högt.
• Konen säger INTE vart kursen ska — den visar var den är, relativt sitt eget förflutna.
Du ser grafen på Konfluens-sidan (demo: Volvo B) och kan hämta live-data via /api/vagkon?ticker=VOLV-B.ST&serie=pris.
Pedagogiskt studieunderlag — inte investeringsråd.`,
    handlings: [
      { text: "Se vågkon-grafen →", lank: "/konfluens", ikon: "📈" },
      { text: "Vågfundamentet (20×5) →", lank: "/vagfundament", ikon: "🌊" },
      { text: "Ekosystem-kursen →", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
    ],
    kalla: "Vågkonen (Fas C)",
    typ: "utbildning" as const,
  };
}

/** KONFLUENS (fördjupad) — radarns garanti och de fem dimensionerna. */
function konfluensSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/konfluens/.test(q)) return null;
  return {
    svar: `[KONFLUENS] Radarns garanti: värde FÖRE vågor — först måste bolaget vara påstått billigt mot sina egna siffror, SEDAN letar vi vågor som vänder. Fem oberoende dimensioner måste tala samman:
1. Värdegolv — NCAV-kvot + P/B + P/E (net-net + analysfundament). Värdepelaren väger tyngst — utan ett värdegolv spelar vågorna ingen roll.
2. Kvalitet — AKM1-proxy: ROE, vinstmarginal och skuldsättningsgrad.
3. Fundamental vågstart — andel impulsvågor på mikro+kort i vågfundamentets 20×5-matris.
4. Prisvågläge — prisvåg fortfarande i basbygge/korrigering = vi är tidiga ute (högt); impulsvåg = tåget har gått.
5. Divergens — fundamentet ▲ medan priset ▼ = vändande vågor (den femte, oberoende rösten).
Allt vägs samman till EN deterministisk konfluenspoäng 0–100 (klass-gräns 70, pelar-gräns 50) — bedöms färre än två av de fem dimensionerna blir poängen osatt: ärlig utdata, aldrig påhittad.
Klass-namnen är radarns eget språk: ett studieunderlag, aldrig en signal.`,
    handlings: [
      { text: "Öppna Konfluensradarn →", lank: "/konfluens", ikon: "🧭" },
      { text: "Vågfundamentet (20×5) →", lank: "/vagfundament", ikon: "🌊" },
      { text: "Net-net-skannern →", lank: "/netnet", ikon: "🎣" },
    ],
    kalla: "Konfluensmotorn — fem dimensioner",
    typ: "utbildning" as const,
  };
}

/** NET-NET / NCAV — Grahams extrema värdegolv. */
function netnetSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/net[- ]?net|\bncav\b|cigar.?butt/.test(q)) return null;
  return {
    svar: `[NET-NET] Grahams mest extrema värdegolv: en net-net är ett bolag där kursen ligger under 2/3 av Net Current Asset Value (NCAV) — omsättningstillgångar minus totala skulder. Du köper alltså hela bolaget för mindre än dess rörelsekapital och får verksamheten "gratis".
Cigar-butts kallas de för: som en fimpa du plockar upp på gatan — ett återstående bloss värde. De är sällsynta idag, och skannern visar var de finns: grön NET-NET-markering när kurs/NCAV ≤ 0,667, guld NÄRA strax över.
Pedagogiskt verktyg — aldrig investeringsråd.`,
    handlings: [
      { text: "Öppna Net-net-skannern →", lank: "/netnet", ikon: "🎣" },
      { text: "Konfluensradarn →", lank: "/konfluens", ikon: "🧭", beskrivning: "Värdegolvet är dimension 1" },
      { text: "Graham: The Intelligent Investor →", lank: "/kurser/the-intelligent-investor", ikon: "🏛️" },
    ],
    kalla: "Net-net-motorn (Graham)",
    typ: "utbildning" as const,
  };
}

/** FAS 3 / CERTIFIERING — kraven och länkarna. */
function fas3Svar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/fas\s?[123]|certifier|certifikat|intyg|medlemskap/.test(q)) return null;
  return {
    svar: `[FAS 3 & CERTIFIERING] Fas 3 (13 999 kr) representeras snart — Fas 2-medlemmar får tillgång först. Vägen dit byggs av din egen insats:
• Fas 1 — hela biblioteket (307 kurser, kalkylatorn, portföljsystemet): gratis för alltid.
• Fas 2 — coaching, gemenskap och representant-vägen; ansökan kostnadsfritt (2 min), nivå 25+ är en bra signal.
• Certifikatet — betyg A–D styrs av din nivå, ditt XP och dina klarade kurser, och uppdateras live. Delbart på LinkedIn.
Kraven växer alltså ur vad du faktiskt gör här i labbet — inte ur vad du betalar.`,
    handlings: [
      { text: "Se medlemskapet (Fas 1/2/3) →", lank: "/medlemskap", ikon: "💛" },
      { text: "Ansök om Fas 2 (kostnadsfritt) →", lank: "/fas2-ansok", ikon: "🎓" },
      { text: "Se ditt certifikat →", lank: "/certifikat", ikon: "📜" },
    ],
    kalla: "AK1A medlemskap",
    typ: "hjälp" as const,
  };
}

/** PRO / B2B — vägen för skolor, företag och institutioner. */
function proSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/\bpro\b|\bb2b\b|företagspaket|skollicens|företagskonto/.test(q)) return null;
  return {
    svar: `[PRO / B2B] AK1A Pro är vägen för skolor, företag och institutioner som vill ge sina elever eller medarbetare hela ekosystemet — 307 kurser, AKM1-kalkylatorn (20 variabler), portföljsystemet (5×5×4) och AI-mentorn.
Privata medlemmar hittar sina faser (Fas 1 gratis · Fas 2 coaching · Fas 3 snart) på medlemskapssidan.`,
    handlings: [
      { text: "AK1A Pro →", lank: "/pro", ikon: "🏢" },
      { text: "Medlemskap & faser →", lank: "/medlemskap", ikon: "💛" },
    ],
    kalla: "AK1A Pro",
    typ: "hjälp" as const,
  };
}

/** RAPPORT / REDOVISNING — redovisningsverkstan. */
function rapportSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/rapport|redovisn/.test(q)) return null;

  // Portföljrapporten har sin egen guide (blogg) — träffa den först
  if (/portföljrapport|portfoljrapport/.test(q)) {
    return {
      svar: `[RAPPORT] Så läser du din portföljrapport — guiden går steg för steg genom rapportens delar: AKM1-poängen per aktie, vågprofilen och riskmätningen. Verkstan där du BYGGER egna rapporter hittar du på /rapporter.`,
      handlings: [
        { text: "Läs guiden →", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📖" },
        { text: "Bygg en rapport →", lank: "/rapporter", ikon: "🖨️" },
      ],
      kalla: "AK1A rapportverkstad",
      typ: "utbildning" as const,
    };
  }

  return {
    svar: `[RAPPORT] Redovisningsverkstan samlar dina analyser till en formatterad, utskriftsbar redovisningsrapport: marin omslagsband med AK1A-signering och din nivå, nyckeltal som tabellrader och metodiken bakom AKM1, AK1TS och Konfluens — med automatiska disclaimers. Allt sparas lokalt i din webbläsare. Skriv ut eller spara som PDF och dela med lärare, föräldrar eller framtida du.`,
    handlings: [
      { text: "Öppna redovisningsverkstan →", lank: "/rapporter", ikon: "🖨️" },
      { text: "Välj analyser i analysbanken →", lank: "/analyser", ikon: "📊" },
      { text: "Se ditt certifikat →", lank: "/certifikat", ikon: "📜" },
    ],
    kalla: "AK1A rapportverkstad",
    typ: "utbildning" as const,
  };
}

/** TIDSHORISONT — AK1TS fem horisonter (mikro → mega) + var eleven börjar värdera. */
function tidshorisontSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/tidshorisont|\bkort sikt\b|\blång sikt\b|\blang sikt\b|kortsiktig|långsiktig/.test(q)) return null;
  return {
    svar: `[TIDSHORISONT] Din tidshorisont förändrar ALLT i analysen — därför har AK1TS fem horisonter: mikro, kort, medellång, lång och mega. Samma bolag kan vara en stark impulsvåg på mikro och ett moget basbygge på lång.
För långsiktigt ägande (5 år+) börjar du med fundamentet: AKM1:s 20 variabler (V01–V20, 0–100 poäng) — lönsamheten (V09 ROE), moaten (V13–V15) och skulderna (V10) väger då tyngst.
Räkna exakt i kalkylatorn — jag ger aldrig köp- eller säljrekommendationer, jag lär ut metoden.`,
    handlings: [
      { text: "Räkna på ett bolag →", lank: "/kalkylator", ikon: "🧮" },
      { text: "V09: ROE (start här) →", lank: "/kurser/v09-roe", ikon: "📊" },
      { text: "Ekosystem-kursen (5×5×4) →", lank: "/kurser/portfolj-ekosystemet", ikon: "🗺️" },
    ],
    kalla: "AK1TS — fem horisonter",
    typ: "utbildning" as const,
  };
}

// ── VÅGKARTA — intern hämtning av senaste autonoma vagscan ──────────────────

/** Svar från /api/vagscan/senaste (cron/vagscan + vågkorta-kortet). */
type VagscanSvar = {
  saknas?: boolean;
  genererad?: string;
  universumSammanfattning?: { impulsvag: number; korrigering: number; basbygge: number; osatt: number };
  topRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
  botRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
};

/** Hämta senaste vågskanning — läser direkt ur Supabase (ingen loopback-fetch,
 *  undviker SSRF-yta: samma datakälla som /api/vagscan/senaste läser ifrån). */
async function hamtaSenasteVagscan(): Promise<VagscanSvar | null> {
  const rest = getSupabaseRest();
  if (!rest) return null;
  try {
    const res = await fetch(
      rest.origin + "/rest/v1/system_events?type=eq.vagscan&select=details,created_at&order=created_at.desc&limit=1",
      { headers: rest.headers, signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const rader = await res.json();
    if (!Array.isArray(rader) || rader.length === 0) return null;
    const d = rader[0].details ?? rader[0];
    return typeof d === "string" ? (JSON.parse(d) as VagscanSvar) : (d as VagscanSvar);
  } catch {
    return null;
  }
}



/** VÅGKARTA — "vad säger vågkartan?" → senaste autonoma mätningen. */
async function vagkartaSvar(fraga: string) {
  const q = fraga.toLowerCase();
  if (!/v[aå]gkarta|vagscan|vågmätning/.test(q)) return null;

  const scan = await hamtaSenasteVagscan();
  const u = scan?.universumSammanfattning;
  if (!scan || scan.saknas === true || !u) {
    return {
      svar: `[VÅGKARTA] Ingen vågkarta har sparats ännu — den autonoma mätningen körs enligt schema, och nästa mätning fyller kartan automatiskt. Du kan alltid studera vågklasserna ▲▼◼ själv i Vågfundamentets 20×5-matris.`,
      handlings: [
        { text: "Vågfundamentet (20×5) →", lank: "/vagfundament", ikon: "🌊" },
        { text: "Min sida (kartan) →", lank: "/min-sida", ikon: "🗺️" },
      ],
      kalla: "Vågkartan (autonom mätning)",
      typ: "analys" as const,
    };
  }

  const top = scan.topRorelse?.[0];
  const bot = scan.botRorelse?.[0];
  const delar: string[] = [];
  if (top) delar.push(`starkast stigande: ${top.variabel} ${top.namn} (${top.antalBolag} bolag)`);
  if (bot) delar.push(`starkast fallande: ${bot.variabel} ${bot.namn} (${bot.antalBolag} bolag)`);
  const rorelser = delar.length > 0 ? `${delar.join(" · ")}.` : "Inga dominerande rörelser just nu.";
  const genererad = scan.genererad ? ` (mätning: ${scan.genererad})` : "";

  return {
    svar: `[VÅGKARTA] Senaste vågmätningen${genererad}: ${u.impulsvag} impulsvågor ▲, ${u.korrigering} korrigeringar ▼, ${u.basbygge} basbyggen ◼ och ${u.osatt} osatta celler i universum. ${rorelser}
Vågkartan är pedagogisk analys — inte investeringsråd.`,
    handlings: [
      { text: "Se hela vågkartan →", lank: "/min-sida", ikon: "🗺️" },
      { text: "Vågfundamentet (20×5) →", lank: "/vagfundament", ikon: "🌊" },
      { text: "Konfluensradarn →", lank: "/konfluens", ikon: "🧭" },
    ],
    kalla: "Vågkartan (autonom mätning)",
    typ: "analys" as const,
  };
}

// ── TVETYDIGHETS-DETEKTERING (redigering) ───────────────────────────────────

/** Mönster på behovs-tvetydighet — mentorn REDIKERAR istället för att gissa.
 *  OBS: \b fungerar inte med å/ä/ö i JS — svenska ordgränser hanteras med
 *  lookarounds mot [a-z0-9åäö] i stället. */
const SV = "a-z0-9åäö";
const TVETYDIGA_MONSTER: RegExp[] = [
  // "är volvo bra?", "är det ett bra köp?", "är aktien värd det?"
  new RegExp(`(?<![${SV}])är(?![${SV}])[^?]{0,60}(?<![${SV}])(bra|dålig|dåligt|intressant|värt|köp)(?![${SV}])`),
  // "ska jag köpa volvo?", "bör jag sälja nu?"
  new RegExp(`(?<![${SV}])(ska|bör|skulle|kan)(?![${SV}])\\s+jag\\s+(?<![${SV}])(köpa|sälja|behålla|gå in|ta ut)(?![${SV}])`),
  // "köpa nu", "sälja aktien", "köpa bolaget"
  new RegExp(`(?<![${SV}])(köpa|sälja)(?![${SV}])\\s+(?<![${SV}])(nu|aktien|aktier|bolaget|den|det)(?![${SV}])`),
  // "vad tycker du om volvo?"
  new RegExp(`(?<![${SV}])vad\\s+tycker\\s+(du|ni)\\s+om(?![${SV}])`),
  // "vilken aktie är bäst?"
  new RegExp(`(?<![${SV}])vilken(?![${SV}])[^?]{0,30}(?<![${SV}])(aktie|bolag|portfölj)(?![${SV}])[^?]{0,20}(?<![${SV}])(bäst|bra)(?![${SV}])`),
];

function arTvetydig(fraga: string): boolean {
  return TVETYDIGA_MONSTER.some((re) => re.test(fraga.toLowerCase()));
}

/**
 * KLARANDE SVAR — EN motfråga om tidshorisont och mål, med klickbara
 * svarsalternativ ("fragor:" skickas tillbaka som ny fråga av widgeten).
 * Ton: pedagogik.ts — vi hjälper, vi dömer aldrig.
 */
function klarandeSvar(fraga: string) {
  const fragaKort = fraga.trim().replace(/\s+/g, " ").slice(0, 60);
  return {
    svar: `Bra fråga — och precis här vill jag vara en riktig mentor istället för att gissa. "${fragaKort}${fraga.length > 60 ? "…" : ""}" beror helt på vad du vill uppnå: en aktie kan vara ett utmärkt långsiktigt innehav och ett dåligt korttidsläge — samtidigt.

Hjälp mig förstå din tidshorisont och ditt mål, så tar jag dig exakt dit du vill:

Jag ger aldrig köp- eller säljrekommendationer — jag lär ut metoden (AKM1: 20 variabler, 0–100 poäng) så att du kan döma själv. Pedagogisk analys — inte investeringsråd.`,
    handlings: [
      {
        text: "Långsiktigt ägande (5 år+)",
        lank: "fragor:" + encodeURIComponent("Jag tänker långsiktigt (5 år+) — visa hur jag värderar bolaget med AKM1"),
        ikon: "🕰️",
        beskrivning: "Fundamentet väger tyngst",
      },
      {
        text: "Kort sikt (under 1 år)",
        lank: "fragor:" + encodeURIComponent("Jag har kort tidshorisont — vad är viktigt att tänka på?"),
        ikon: "⚡",
        beskrivning: "Vågor och timing",
      },
      {
        text: "Jag vill lära mig värdera själv",
        lank: "fragor:" + encodeURIComponent("Lär mig värdera ett bolag från grunden med AKM1"),
        ikon: "📚",
        beskrivning: "Från noll till egen analys",
      },
    ],
    typ: "klarande" as const,
    kalla: "AI-Mentor — behovs-förståelse",
  };
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

    // 2) SID-DATA-INTENTS — deterministiska svar om verktygen på sajten
    const vagkon = vagkonSvar(q);
    if (vagkon) return NextResponse.json(vagkon);

    const konfluens = konfluensSvar(q);
    if (konfluens) return NextResponse.json(konfluens);

    const netnet = netnetSvar(q);
    if (netnet) return NextResponse.json(netnet);

    const fas3 = fas3Svar(q);
    if (fas3) return NextResponse.json(fas3);

    const pro = proSvar(q);
    if (pro) return NextResponse.json(pro);

    const rapport = rapportSvar(q);
    if (rapport) return NextResponse.json(rapport);

    const horisont = tidshorisontSvar(q);
    if (horisont) return NextResponse.json(horisont);

    const vagkarta = await vagkartaSvar(q);
    if (vagkarta) return NextResponse.json(vagkarta);

    // 3) AKM1-variabel svar — alltid deterministiskt (exakta formler, noll hallucination)
    const akm1 = akm1Svar(q);
    if (akm1) {
      return NextResponse.json({ ...akm1, kalla: "AKM1-ekosystem", typ: "utbildning" });
    }

    // 4) TVETYDIGHET — mentorn redigerar: EN klarliggande motfråga istället för gissning
    if (arTvetydig(q)) {
      return NextResponse.json(klarandeSvar(q));
    }

    // 5) Navigering
    const nav = navigera(q);
    if (nav) {
      return NextResponse.json({
        svar: "Jag tar dig dit — klicka på någon av länkarna:",
        handlings: nav.handlings,
        typ: nav.typ,
        kalla: "AI-Mentor",
      });
    }

    // 6) Varumärke
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

    // 7) Proaktivt nästa steg
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

    // 7b) Z.ai GLM-läge — fritt formulerat pedagogiskt svar, GROUNDAT i kurserna
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
5. Eleven befinner sig nu på: ${sidKontextText(sokvag)} — anpassa svaret till platsen.
6. VÅGFUNDAMENT (fundamentalvågor/vågklass/våg för en V-variabel): källan är "Vågfundamentet — AKM1:s 20 variabler som tidsserier" — AKM1-variabeln är en tidsserie med en egen våg per horisont (mikro, kort, medellång, lång, mega) i 20×5-matrisen. Vågklasser: impulsvåg ▲ (fundamentalen förbättras), korrigering ▼ (försvagas), basbygge ◼ (samlar kraft), osatt · (för lite historik). P7-regler att följa: (a) citera celler exakt som de redovisas i matrisen; (b) extrapolera ALDRIG utanför osatta celler — osatt betyder osatt; (c) påtala divergens mellan fundamental våg och prisvåg när båda nämns (värde-signal att studera, aldrig köp/sälj); (d) avsluta alltid med disclaimern "pedagogisk analys — inte investeringsråd" och hänvisa till /vagfundament.
7. RÅDGIVNINGS-GRÄNS: ge ALDRIG köp- eller säljrekommendationer för enskilda aktier eller bolag — du är pedagog, inte rådgivare. När frågan rör värdering av ett bolag, avsluta med "pedagogisk analys — inte investeringsråd".
8. TVETYDIGA FRÅGOR ("är X bra?", "ska jag köpa X?"): gissa ALDRIG — ställ EN klarliggande motfråga om eleven tidshorisont och mål ("Bra för vad — som långsiktigt ägande eller kort sikt?") innan du svarar.

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

    // 8) Fallback med proaktiva förslag
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
