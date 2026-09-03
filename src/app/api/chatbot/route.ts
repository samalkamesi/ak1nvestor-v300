import { NextRequest, NextResponse } from "next/server";
import { SIFFROR } from "@/lib/siffror";
import { getCourses, getBlogPosts } from "@/lib/content";
import { zaiAktiv, zaiChat } from "@/lib/zai";
import { EKOSYSTEM } from "@/lib/ekosystem";
import {
  normaliseraFraga,
  hamtaAmne,
  arFoljdfraga,
  type AmnesNyckel,
  type NormaliseradFraga,
} from "@/lib/chatbot-nlu";

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
 * 5. Följer AKM1/AK1TS-ekosystemet i ALLT (Task 106-standard: V-nummer +
 *    formel + poäng + kurslänk där relevant)
 * 6. RÅDGIVNINGS-GRÄNS: ALDRIG köp/sälj-rekommendationer — alltid disclaimer
 *    ("pedagogisk analys — inte investeringsråd") vid värderingsnära frågor
 * 7. Proaktiv: föreslår NÄSTA STEG innan eleven frågar
 * 8. MINNS OCH TÄNKER OBEROENDE (konversationsminne "i djupet"): POST:en
 *    tar emot `historik` (senaste turerna ur elevens lokala chat-minne) och
 *    varje deterministiskt/LLM-svar berikas (berika()) med:
 *    (a) naturlig bakåtreferens — "Du frågade tidigare om V12 — nu ligger
 *        vi rätt för nästa steg:" — när historiken gör den naturlig,
 *    (b) "Snäv men viktig korrigering: ..." när frågan vilar på ett
 *        ifrågasättbart antagande (fundamentalanalys som statisk, lågt P/E
 *        som alltid billigt, teknisk analys i Fas 2, ...) — svaret på den
 *        ursprungliga frågan försämras aldrig,
 *    (c) EN skarp analytiker-motfråga som roterar mellan fem kategorier
 *        (värdering, risk, tidshorisont, källkritik, applikation) och som
 *        ALDRIG upprepar förra svarets kategori (läses ur historiken),
 *    (d) en "fördjupa"-länk till mest relevant kurs/verktyg.
 *
 * Svars-typen "klarande" använder handlings-länkar på formen "fragor:<text>"
 * (URL-kodad) — chat-widgeten skickar texten som en NY fråga, vilket gör
 * motfrågan klickbart svarsbar. Klarande-svar får INTE ny motfråga (den är
 * redan en fråga).
 */

type Handling = { text: string; lank: string; ikon: string; beskrivning?: string };
type Intent = {
  typ: "navigering" | "utbildning" | "analys" | "portfölj" | "inspiration" | "hjälp" | "system" | "klarande";
  handlings: Handling[];
};

/** Grundsvaret från varje svarslager innan intelligens-berikning. */
type Bassvar = {
  svar: string;
  handlings: Handling[];
  kalla?: string;
  typ: string;
  modell?: string;
};

// ── KONVERSATIONSMINNE — historik från widgetens lokala minne ────────────────

type HistorikTur = { roll: "du" | "mentor"; text: string; ts: number };

/** Rensa/normalisera klient-historiken: giltiga turer, max ~12, rimlig längd. */
function rensaHistorik(rå: unknown): HistorikTur[] {
  if (!Array.isArray(rå)) return [];
  const turer: HistorikTur[] = [];
  for (const t of rå) {
    if (!t || typeof t !== "object") continue;
    const roll = (t as { roll?: unknown }).roll;
    const text = (t as { text?: unknown }).text;
    const ts = (t as { ts?: unknown }).ts;
    if (typeof text !== "string" || !text.trim()) continue;
    turer.push({
      roll: roll === "mentor" ? "mentor" : "du",
      text: text.slice(0, 400),
      ts: typeof ts === "number" && Number.isFinite(ts) ? ts : 0,
    });
  }
  return turer.slice(-14); // widget skickar 12 — liten marginal
}

/** Enkelt sidnamn ur sökvägen — för GLM-promptens platssinne (server-sida). */
function sidKontextText(sokvag: string): string {
  const p = String(sokvag || "/").toLowerCase();
  const delar = p.split("/").filter(Boolean);
  const rot = delar[0] || "";
  const under = delar[1] || "";
  const kart: Record<string, string> = {
    kurser: under
      ? `kurs-sidan /kurser/${under} — eleven läser just nu denna kurs kapitel för kapitel`
      : "kursbiblioteket (" + SIFFROR.kurser + " kurser)",
    analyser: under
      ? `analysen av ${decodeURIComponent(under).toUpperCase()} — eleven fördjupar sig i ett enskilt bolag`
      : "analysbanken — eleven bläddrar bland analyser",
    kalkylator: "AKM1-kalkylatorn — eleven räknar på ett bolag just nu",
    "min-portfolj": "portföljsystemet — eleven följer sina innehav",
    portfoljbyggare: "portföljbyggaren — eleven bygger en tänkt portfölj rad för rad",
    blogg: under ? `bloggartikeln "${decodeURIComponent(under)}"` : "bloggen",
    labb: "Labbet (201 case study)",
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
  // Levande tal — ur src/lib/siffror.ts (guldkällan): 
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
    if (/nyhet|nyheter|rss|flöde|senaste nytt|bevakning/.test(q)) return { typ: "navigering", handlings: [
      { text: "Nyhetscentralen 📰", lank: "/nyheter", ikon: "📰", beskrivning: "Senaste nytt — intelligent rangerat för din utbildning" },
      { text: "Hantera dina kanaler", lank: "/nyheter", ikon: "⚙️", beskrivning: "Bevakning, ämnen och egna RSS-flöden" },
      { text: "Din dashboard", lank: "/min-sida", ikon: "🏠", beskrivning: "Senaste nytt-kortet + analyser för dig" },
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

  // UTBILDNING — eleven vill lära sig (obs: bart "vad är" tas INTE här —
  // okända ämnen ska nå ämnesmotorn → kursmatch → ärlig fallback)
  if (/lär|utbild|förstå|förklara|hur fungerar|börja|kom igång/.test(q)) {
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

  // SYSTEM — eleven frågar om systemet (\bai\b: ordet AI, inte delsträngen)
  if (/system|ekosystem|\bai\b|organ|hur fungerar sidan/.test(q)) {
    return { typ: "system", handlings: [
      { text: "Min sida (din dashboard) →", lank: "/min-sida", ikon: "🏠", beskrivning: "Autonom aktivitet + vågkorta" },
      { text: "Om oss (ekosystemet) →", lank: "/om-oss", ikon: "🏛️", beskrivning: "Historien och modellerna" },
      { text: "Ekosystem-kursen →", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
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
  fraga: string,
  ren: string
): { svar: string; handlings: Array<{ text: string; lank: string; ikon: string }> } | null {
  const q = fraga.toLowerCase();

  // Ren (normaliserad) sträng tillåter bart "våg"/"vågor" — men vagkarta och
  // vågkon testas FÖRE detta lager i POST, så de stjäl aldrig frågan.
  const triggar =
    /vågfundament|fundamentalvåg|fundamental våg|variabelns våg|vågklass|vågmatris|våg-matris|divergens|20\s*[×x]\s*5/.test(q) ||
    /vagfundament|fundamentalvag|vagklass|vagmatris|divergens|20\s*[x]\s*5/.test(ren) ||
    /\bvag/.test(ren) ||
    (/våg/.test(q) && (/v\d{2}/.test(q) || /mikro|medellång|mega|horisont/.test(q)));
  if (!triggar) return null;

  const VF_VARIABLER: Record<string, string> = {
    V01: "Försäljningstillväxt", V02: "ARR-tillväxt", V03: "Intäktsdiversifiering",
    V04: "P/S", V05: "P/B", V06: "EV/EBITDA",
    V07: "Bruttomarginal", V08: "EBITDA-marginal", V09: "ROE",
    V10: "Skuldsättningsgrad", V11: "Likviditet", V12: "Intäktsstabilitet",
    V13: "Patent & IP", V14: "Varumärke & Kundlojalitet", V15: "Nätverkseffekter",
    V16: "Produktlanseringar", V17: "Avtal & Partnerskap", V18: "Regulatoriska katalysatorer",
    V19: "Kassatäckning — nyemissionsrisk", V20: "Återköp av egna aktier",
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

  const svar = `Bra fråga — här är grunderna i Vågfundamentet (källa: AKM1:s 20 variabler som tidsserier, 20×5-matrisen).
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

// ── ÄMNESMOTORN: V-registret + mänsklig svarskomponist ──────────────────────
// Varje ämne som NLU-lagret (chatbot-nlu.ts) kan känna igen har en post här.
// Typningen Record<AmnesNyckel, VPost> garanterar vid kompilering att INGET
// igenkänt ämne saknar svar. Tal (antal variabler, poängskala) hämtas ur
// EKOSYSTEM (src/lib/ekosystem.ts) — kanonen — aldrig hårdkodat.

type VPost = {
  /** "V09" — saknas för koncept utanför de 20 variablerna (P/E, moat …). */
  vId?: string;
  namn: string;
  kategori: string;
  /** Kärnrader — varje sträng blir egen rad i svaret. */
  karna: string[];
  /** Konkret räkneexempel i SEK — påhittat men realistiskt (ärligt märkt). */
  exempel: string;
  /** Naturliga fortsättningsfrågor — roteras. */
  fortfragor: string[];
  /** Kurs-slug ("v09-roe") eller absolut sökväg ("/kalkylator"). */
  kurs: string;
  /** Helt egen handlingslista (ersätter standarduppsättningen). */
  egenaHandlingar?: Handling[];
  /** Värderingsnärt ämne → disclaimern läggs på. */
  varde?: boolean;
};

const V_REGISTRET: Record<AmnesNyckel, VPost> = {
  v01: {
    vId: "V01", namn: "Försäljningstillväxt", kategori: "Tillväxt",
    karna: [
      "Formel: (Årets nettoomsättning − förra årets) ÷ förra årets × 100 %.",
      "Poängskala: ≥30 % → 5p · ≥20 % → 4p · ≥10 % → 3p · ≥0 % → 2p · negativ tillväxt → 1p.",
      "Var hittar du siffrorna: resultaträkningen, raden 'Nettoomsättning' — båda åren står bredvid varandra.",
    ],
    exempel: "Ett påhittat bolag: omsättning 1 000 Mkr förra året och 1 200 Mkr i år → (1 200 − 1 000) ÷ 1 000 = 20 % → 4 poäng.",
    fortfragor: [
      "Ska vi titta på V02 ARR-tillväxt också — de två mäter olika slags tillväxt?",
      "Vill du se hela tillväxtkategorin i kalkylatorn? V01–V03 visas tillsammans.",
    ],
    kurs: "v01-forsaljningstillvaxt",
  },
  v02: {
    vId: "V02", namn: "ARR-tillväxt", kategori: "Tillväxt",
    karna: [
      "Formel: (Årets ARR − förra årets ARR) ÷ förra årets ARR × 100 % — ARR är årliga återkommande intäkter (SaaS-bolag).",
      "Så poängsätts det: kvalitativt med reglaget 0–5 i AKM1 — nivå OCH hållbarhet vägs samman.",
      "Var hittar du siffrorna: förvaltningsberättelsen eller presentationen — sök 'ARR'.",
    ],
    exempel: "Ett påhittat SaaS-bolag: ARR 42 Mkr → 55 Mkr på ett år → (55 − 42) ÷ 42 ≈ 31 % ARR-tillväxt.",
    fortfragor: [
      "Vill du se skillnaden mot V01 — omsättning är inte samma sak som ARR?",
      "Ska vi kolla V03 efteråt? Tillväxt utan spridning är skör.",
    ],
    kurs: "v02-arr-tillvaxt",
  },
  v03: {
    vId: "V03", namn: "Intäktsdiversifiering", kategori: "Tillväxt",
    karna: [
      "Så mäts det: största kundens andel av omsättningen + spridning över segment och marknader.",
      "Så poängsätts det: kvalitativt med reglaget 0–5 — ju bredare spridning, desto högre.",
      "Var hittar du siffrorna: noten om segment/intäktsfördelning + storkundsnoten.",
    ],
    exempel: "Ett påhittat bolag: storkunden står för 45 % av omsättningen → sårbart, låg poäng. Spridning över 40 kunder med max 8 % vardera → robust, hög poäng.",
    fortfragor: [
      "Vill du läsa hur en storkundsnot ser ut i en riktig årsredovisning?",
      "Ska vi väga ihop hela tillväxtkategorin (V01–V03) i kalkylatorn?",
    ],
    kurs: "v03-intaktsdiversifiering",
  },
  v04: {
    vId: "V04", namn: "P/S", kategori: "Värdering",
    karna: [
      "Formel: P/S = börsvärde ÷ nettoomsättning (helst rullande 12 månader).",
      "Poängskala: <1 → 5p · <2 → 4p · <3 → 3p · <5 → 2p · ≥5 → 1p.",
      "Var hittar du siffrorna: börsvärde = aktiekurs × antal aktier; omsättning = resultaträkningens första rad.",
    ],
    exempel: "Ett påhittat bolag: börsvärde 6 000 Mkr och omsättning 3 000 Mkr → P/S = 2,0 → 3 poäng.",
    fortfragor: [
      "Vill du jämföra med V05 P/B och V06 EV/EBITDA — tre multiplicerar som måste berätta samma historia?",
      "Ska vi räkna P/S för ett bolag du följer? Kalkylatorn gör det automatiskt.",
    ],
    kurs: "v04-ps", varde: true,
  },
  v05: {
    vId: "V05", namn: "P/B", kategori: "Värdering",
    karna: [
      "Formel: P/B = börsvärde ÷ eget kapital.",
      "Poängskala: <1 → 5p · <2 → 4p · <3 → 3p · <5 → 2p · ≥5 → 1p.",
      "Var hittar du siffrorna: balansräkningen — 'Eget kapital' (jämför gärna med 5-årigt snitt i noterna).",
    ],
    exempel: "Ett påhittat bolag: börsvärde 6 000 Mkr och eget kapital 4 000 Mkr → P/B = 1,5 → 4 poäng.",
    fortfragor: [
      "Vill du se varför P/B ensamt kan lura — ett eget kapital kan vara gammalt eller övervärderat?",
      "Ska vi titta på Graham-nivån under det: NCAV och net-net?",
    ],
    kurs: "v05-pb", varde: true,
  },
  v06: {
    vId: "V06", namn: "EV/EBITDA", kategori: "Värdering",
    karna: [
      "Formel: EV/EBITDA = (börsvärde + räntebärande skulder − kassa) ÷ EBITDA.",
      "Poängskala: <5 → 5p · <7 → 4p · <10 → 3p · <14 → 2p · ≥14 → 1p.",
      "Var hittar du siffrorna: skulder och kassa i balansräkningen; EBITDA = rörelseresultat + avskrivningar (kassaflödesanalysen).",
    ],
    exempel: "Ett påhittat bolag: EV = 6 000 + 1 500 − 500 = 7 000 Mkr mot EBITDA 1 000 Mkr → 7,0x → 2 poäng.",
    fortfragor: [
      "Vill du se skillnaden mot P/S — EV/EBITDA straffar skuld, P/S gör det inte?",
      "Ska vi räkna hela värderingskategorin (V04–V06) i kalkylatorn?",
    ],
    kurs: "v06-ev-ebitda", varde: true,
  },
  v07: {
    vId: "V07", namn: "Bruttomarginal", kategori: "Lönsamhet",
    karna: [
      "Formel: (nettoomsättning − rörelsens kostnader) ÷ nettoomsättning × 100 %.",
      "Poängskala: ≥60 % → 5p · ≥40 % → 4p · ≥25 % → 3p · ≥10 % → 2p · <10 % → 1p.",
      "Var hittar du siffrorna: resultaträkningen — vissa bolag redovisar bruttovinst direkt. OBS: jämför med 5-års historik.",
      "Notera: bruttomarginal är markerad KRITISK i kalkylatorn — den väger extra tungt.",
    ],
    exempel: "Ett påhittat bolag: omsättning 1 000 Mkr och rörelsens kostnader 550 Mkr → (1 000 − 550) ÷ 1 000 = 45 % → 4 poäng.",
    fortfragor: [
      "Vill du se vad en stigande bruttomarginal gör med V09 ROE — mekaniken är fin att se?",
      "Ska vi räkna bruttomarginal för ett bolag du följer? Två rader i årsredovisningen räcker.",
    ],
    kurs: "v07-bruttomarginal",
  },
  v08: {
    vId: "V08", namn: "EBITDA-marginal", kategori: "Lönsamhet",
    karna: [
      "Formel: (rörelseresultat + avskrivningar) ÷ nettoomsättning × 100 %.",
      "Poängskala: ≥25 % → 5p · ≥15 % → 4p · ≥10 % → 3p · ≥5 % → 2p · <5 % → 1p.",
      "Var hittar du siffrorna: rörelseresultatet i resultaträkningen; avskrivningarna i kassaflödesanalysen.",
      "Obs: 'vinstmarginal' (efter finansiella poster och skatt) är inte samma sak — men rätt variabel att börja i.",
    ],
    exempel: "Ett påhittat bolag: EBITDA 180 Mkr på omsättning 1 000 Mkr → 18 % → 4 poäng.",
    fortfragor: [
      "Vill du se hur bruttomarginal (V07) och EBITDA-marginal (V08) skiljer sig — kostnadsperspektivet är nyckeln?",
      "Ska vi gå vidare till V09 ROE — lönsamhetens slutstation?",
    ],
    kurs: "v08-ebitda-marginal",
  },
  v09: {
    vId: "V09", namn: "ROE", kategori: "Lönsamhet",
    karna: [
      "Formel: ROE = resultat efter skatt ÷ snitt eget kapital (balansräkningen, årets början + slut).",
      "Poängskala: ≥20 % → 5p · ≥15 % → 4p · ≥10 % → 3p · ≥5 % → 2p · <5 % → 1p.",
      "Var hittar du siffrorna: årets resultat = resultaträkningens nedersta rad; eget kapital båda tidpunkterna i balansräkningen.",
      "Warren Buffetts favoritvariabel — han söker ROE över 15 % i längden.",
    ],
    exempel: "Ett påhittat bolag: årets resultat 250 Mkr, eget kapital 1 100 Mkr vid årets början och 1 400 Mkr vid slutet → snitt 1 250 Mkr → ROE = 250 ÷ 1 250 = 20 % → 5 poäng.",
    fortfragor: [
      "Vill du se hur ROE ser ut för ett riktigt svenskt bolag? Analysbanken visar verkliga exempel.",
      "Ska vi räkna ROE för ett bolag du följer? Kalkylatorn gör det automatiskt.",
    ],
    kurs: "v09-roe",
  },
  v10: {
    vId: "V10", namn: "Skuldsättningsgrad", kategori: "Stabilitet",
    karna: [
      "Formel: skulder och övriga förpliktelser ÷ eget kapital.",
      "Poängskala: <0,5 → 5p · <1 → 4p · <2 → 3p · <3 → 2p · ≥3 → 1p.",
      "Var hittar du siffrorna: balansräkningen — hela posten 'Skulder och övriga förpliktelser' (både lång- och kortfristiga).",
    ],
    exempel: "Ett påhittat bolag: skulder 1 500 Mkr och eget kapital 4 000 Mkr → 0,38 → 5 poäng.",
    fortfragor: [
      "Vill du para ihop det med V19 — skuld är en risk bara när kassan inte räcker?",
      "Ska vi kolla hur skuldsättningsgraden påverkar hela stabilitetskategorin?",
    ],
    kurs: "v10-skuldsattningsgrad",
  },
  v11: {
    vId: "V11", namn: "Likviditet", kategori: "Stabilitet",
    karna: [
      "Så mäts det: omsättningstillgångar ÷ kortfristiga skulder (kvickkvot) — båda räkenskapsåren.",
      "Så poängsätts det: kvalitativt med reglaget 0–5 — kan bolaget betala sina korta åtaganden, gång på gång?",
      "Var hittar du siffrorna: balansräkningens översta och nedersta poster.",
    ],
    exempel: "Ett påhittat bolag: omsättningstillgångar 900 Mkr mot kortfristiga skulder 450 Mkr → kvickkvot 2,0 — kortfristiga åtaganden täcks två gånger om.",
    fortfragor: [
      "Vill du se skillnaden mot V19 — likviditet är läget idag, kassatäckning är hur länge det räcker?",
      "Ska vi titta på V12 intäktsstabilitet, som gör likviditeten förutsägbar?",
    ],
    kurs: "v11-likviditet",
  },
  v12: {
    vId: "V12", namn: "Intäktsstabilitet", kategori: "Stabilitet",
    karna: [
      "Så mäts det: 5 års nettoomsättning — hur jämn kurvan är.",
      "Så poängsätts det: kvalitativt med reglaget 0–5 — stadig kurva utan svängar ger högt.",
      "Var hittar du siffrorna: årsredovisningens 5-årsöversikt (oftast sist i påstådda nyckeltal).",
    ],
    exempel: "Påhittad 5-årsserie: 800 / 850 / 870 / 910 / 950 Mkr → stadig stigning → hög poäng. Serien 400 / 900 / 300 / 1 000 / 500 Mkr → berg- och dalbana → låg.",
    fortfragor: [
      "Vill du se hur stabil intäkt + låg skuld tillsammans bygger moat?",
      "Ska vi gå vidare till Moat-kategorin (V13–V15)?",
    ],
    kurs: "v12-intaktsstabilitet",
  },
  v13: {
    vId: "V13", namn: "Patent & IP", kategori: "Moat",
    karna: [
      "Så mäts det: patentfamiljer, skyddstid och hur kärnan i verksamheten är skyddad.",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: noten om immateriella tillgångar + förvaltningsberättelsen.",
    ],
    exempel: "Ett påhittat bolag: 12 patentfamiljer med i snitt 8 års kvarvarande skydd kring kärntekniken → en verklig vallgrav.",
    fortfragor: [
      "Vill du se hur V13 + V14 + V15 tillsammans bildar hela moat-frågan?",
      "Ska vi kolla V14 varumärke — den mjukaste men starkaste vallgraven?",
    ],
    kurs: "v13-patent-ip",
  },
  v14: {
    vId: "V14", namn: "Varumärke & kundlojalitet", kategori: "Moat",
    karna: [
      "Så mäts det: kan bolaget ta högre pris än konkurrenterna utan att tappa kunder?",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: förvaltningsberättelsen, kundnoten, marknadsandelsuppgifter.",
    ],
    exempel: "Ett påhittat bolag: varumärket bär 15–20 % högre prissättning än konkurrenternas — utan volymförlust. Det är en vallgrav mätt i kronor.",
    fortfragor: [
      "Vill du se hur varumärke syns i siffrorna — bruttomarginal (V07) är ofta spåret?",
      "Ska vi titta på V15 nätverkseffekter, den tredje moat-halvan?",
    ],
    kurs: "v14-varumarke",
  },
  v15: {
    vId: "V15", namn: "Nätverkseffekter", kategori: "Moat",
    karna: [
      "Så mäts det: blir tjänsten mer värd för varje ny användare — och syns det i kundantalet?",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: förvaltningsberättelsen; kundantal över tid.",
    ],
    exempel: "Ett påhittat bolag: kundbasen växte 40 → 90 tusen nästan utan marknadsföringskostnad — varje ny kund gjorde tjänsten värdefullare för alla andra.",
    fortfragor: [
      "Vill du se vilka svenska bolag som har nätverkseffekter — de är sällsynta?",
      "Ska vi gå vidare till katalysatorerna (V16–V18)?",
    ],
    kurs: "v15-natverkseffekter",
  },
  v16: {
    vId: "V16", namn: "Produktlanseringar", kategori: "Katalysator",
    karna: [
      "Så mäts det: kommande lanseringar i pipelinen — storlek och tidpunkt.",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: förvaltningsberättelsens avsnitt om pipeline/kommande lanseringar.",
    ],
    exempel: "Ett påhittat bolag: pipeline med två lanseringar inom 12 månader mot en adresserbar marknad på 2 Mdr kr — en katalysator att följa, inte att förutsäga.",
    fortfragor: [
      "Vill du se hur en katalysator skiljer sig från en våg — sannolikhet mot rörelse?",
      "Ska vi kolla V17 avtal & partnerskap?",
    ],
    kurs: "v16-produktlanseringar",
  },
  v17: {
    vId: "V17", namn: "Avtal & Partnerskap", kategori: "Katalysator",
    karna: [
      "Så mäts det: viktiga avtal och partnerskap — värde, löptid och trovärdighet.",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: pressmeddelanden + förvaltningsberättelsens 'viktiga avtal'.",
    ],
    exempel: "Ett påhittat bolag: ramavtal med en global distributör värt uppskattningsvis 150 Mkr per år — om det infrias syns det i V01 inom ett år.",
    fortfragor: [
      "Vill du lära dig läsa pressmeddelanden med källkritik — vem har intresse av formuleringen?",
      "Ska vi titta på V18 regulatoriska katalysatorer?",
    ],
    kurs: "v17-avtal-partnerskap",
  },
  v18: {
    vId: "V18", namn: "Regulatoriska katalysatorer", kategori: "Katalysator",
    karna: [
      "Så mäts det: väntande myndighetsbeslut som kan öppna eller stänga marknader.",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: riskavsnittet i förvaltningsberättelsen + myndighetsbeslut.",
    ],
    exempel: "Ett påhittat bolag: väntande godkännande — ja öppnar en ny marknad, nej fryser pipelinen. En binär händelse: följ beslutet, spekulera aldrig i det.",
    fortfragor: [
      "Vill du se hur riskavsnittet i en årsredovisning ser ut — dit går nyckeln?",
      "Ska vi ta V19 — risken som mäts i månader?",
    ],
    kurs: "v18-regulatoriska",
  },
  v19: {
    vId: "V19", namn: "Kassatäckning — nyemissionsrisk", kategori: "Risk",
    karna: [
      "Formel: kassa ÷ |årlig förbränning| → antal månaders runway.",
      "Poängskala: positivt kassaflöde → 5p · ≥60 mån → 5p · ≥36 → 4p · ≥18 → 3p · ≥12 → 2p · <12 → 1p.",
      "Var hittar du siffrorna: kassan i balansräkningen; förbränningen = kassaflödet från den löpande verksamheten. Kontrollera nyemissionshistoriken!",
      "Notera: markerad KRITISK i kalkylatorn — utspädningsrisken äter framtida avkastning.",
    ],
    exempel: "Ett påhittat bolag: kassa 240 Mkr och förbränning −60 Mkr per år → 48 månaders runway → 4 poäng.",
    fortfragor: [
      "Vill du se hur en nyemission späder ut ditt ägande — mekaniken är värd att känna igen?",
      "Ska vi para ihop V19 med V10 — hela riskkategorin på en gång?",
    ],
    kurs: "v19-kapitalforbranning",
  },
  v20: {
    vId: "V20", namn: "Återköp av egna aktier", kategori: "Kapitalstruktur",
    karna: [
      "Så mäts det: återköpensvolym i förhållande till börsvärdet + insiderköp (VD/styrelse) som komplement.",
      "Så poängsätts det: kvalitativt med reglaget 0–5.",
      "Var hittar du siffrorna: bolagets not om återköp (börsen/finanskalender); insiderköp hos Finansinspektionen.",
    ],
    exempel: "Ett påhittat bolag: återköp för 2 Mdr kr av ett börsvärde på 20 Mdr kr = 10 % av bolaget — ledningen röstar med sina egna kronor om att aktien är undervärderad.",
    fortfragor: [
      "Vill du se hur återköp skiljer sig från utdelning — samma krona, olika signal?",
      "Ska vi gå tillbaka och väva ihop alla 20 variabler i kalkylatorn?",
    ],
    kurs: "v20-aterekop-egna-aktier",
  },
  pe: {
    namn: "P/E", kategori: "värderingsmultipel — utanför AKM1:s 20 variabler",
    karna: [
      "Ärligt först: P/E är INTE en av AKM1:s 20 variabler. De närmaste är V04 P/S, V05 P/B och V06 EV/EBITDA — men P/E används i Konfluensradarns värdegolv (dimension 1) tillsammans med P/B och NCAV.",
      "Formel: P/E = börsvärde ÷ nettoresultat (eller: aktiekurs ÷ vinst per aktie).",
      "Så läser du det: P/E 15 betyder att du betalar 15 års nuvarande vinst — men en multipel blir bara sann tillsammans med kvaliteten (V07 marginaler, V10 skuld).",
    ],
    exempel: "Ett påhittat bolag: aktiekurs 120 kr och vinst per aktie 8 kr → P/E = 120 ÷ 8 = 15.",
    fortfragor: [
      "Ska vi titta på V04 P/S istället — AKM1:s egen sätt att väga priset mot storleken?",
      "Vill du se hur lågt P/E kan vara ett varningstecken, inte en fyndklocka?",
    ],
    kurs: "/konfluens", varde: true,
    egenaHandlingar: [
      { text: "Konfluensradarn (värdegolvet) →", lank: "/konfluens", ikon: "🧭" },
      { text: "Räkna V04 P/S i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
      { text: "Kursen om värdering (V04) →", lank: "/kurser/v04-ps", ikon: "📚" },
    ],
  },
  moat: {
    namn: "Moat (vallgrav)", kategori: "Moat — tre AKM1-halvor",
    karna: [
      "AKM1:s svar på moat-frågan: V13 (patent & IP) + V14 (varumärke & kundlojalitet) + V15 (nätverkseffekter).",
      "Moat = varaktig konkurrensfördel som skyddar vinster — inte från en kvartalsrapport, utan i åratal.",
      "Så poängsätts det: varje halva 0–5 på eget reglage; helheten syns i kategorisnittet.",
    ],
    exempel: "Påhittad räkning: en vallgrav som håller 5 extra procentenheter marginal i 10 år på 1 000 Mkr omsättning ≈ 500 Mkr skyddad vinst — därför betyder moat mer än nästa kvartal.",
    fortfragor: [
      "Vill du utforska de tre halvorna — V13, V14 och V15 var för sig?",
      "Ska vi se hur moat syns i bruttomarginalen (V07)? Spåret är samma.",
    ],
    kurs: "v13-patent-ip",
  },
  sakerhetsmarginal: {
    namn: "Marginal of safety", kategori: "Grahams kärnbegrepp",
    karna: [
      "Principen: köp endast med marginal mellan pris och värde — Benjamin Graham sa 30–50 % rabatt mot beräknat värde.",
      "Varför: du KOMMER att ha fel ibland. Marginalen är det som gör felen överlevbara.",
      "I AKM1 återkommer den i värderingskategorin (V04–V06) och i Konfluensradarns värdegolv.",
    ],
    exempel: "Grahams bro: byggd för 30 ton, lastad med 10 ton — du överlever att ha fel. Med siffror: inneboende värde 100 kr per aktie → köp för högst 70 kr.",
    fortfragor: [
      "Vill du läsa Grahams egna ord — kursen går igenom hela The Intelligent Investor?",
      "Ska vi se hur marginalen visas i Konfluensradarns värdegolv?",
    ],
    kurs: "the-intelligent-investor", varde: true,
  },
  mrmarket: {
    namn: "Mr Market", kategori: "Grahams metafor",
    karna: [
      "Mr Market är din partner som erbjuder dig ett pris VARJE DAG — efter humör.",
      "Euforisk dag: han köper dyrt. Deprimerad dag: han säljer billigt. Du kan ignorera honom — han kommer tillbaka imorgon.",
      "I AK1A:s värde är Mr Market skälet till att värde kommer FÖRE vågor (Konfluensradarns garanti).",
    ],
    exempel: "En påhittad dag: Mr Market erbjuder 84 kr på morgonen (eufori) och 71 kr på eftermiddagen (dystra rubriker) — bolaget är detsamma. Det är han som förändrats, inte verksamheten.",
    fortfragor: [
      "Vill du träna på att skilja bolagets rörelse från marknadens humör — Labbet har case på det?",
      "Ska vi läsa kapitlet om Mr Market i Graham-kursen?",
    ],
    kurs: "the-intelligent-investor",
  },
  ekosystem: {
    namn: "EKOSYSTEMET", kategori: `${EKOSYSTEM.modeller.AKM1.namn} + ${EKOSYSTEM.modeller.AK1TS.namn}`,
    karna: [
      `AKM1: ${EKOSYSTEM.modeller.AKM1.variabler} fundamentalvariabler (V01–V20, ${EKOSYSTEM.modeller.AKM1.poangskala}) i ${EKOSYSTEM.modeller.AKM1.kategorier.length} kategorier.`,
      `AK1TS: ${EKOSYSTEM.modeller.AK1TS.teorier} teorier × ${EKOSYSTEM.modeller.AK1TS.horisonter} horisonter × ${EKOSYSTEM.modeller.AK1TS.dimensioner} dimensioner = 100 datapunkter.`,
      "Principerna som bär allt: " + EKOSYSTEM.principer.slice(0, 3).join(" · ") + ".",
    ],
    exempel: "I praktiken: AKM1 säger VAD du tittar på (fundamentet, 0–5 per variabel), AK1TS säger HUR det rör sig (vågor per horisont) — och Konfluensradarn väger värde mot vågor.",
    fortfragor: [
      "Vill du börja där det gör mest nytta — V09 ROE, favoritvariabeln?",
      "Ska vi se hela 5×5×4 i ekosystem-kursen?",
    ],
    kurs: "portfolj-ekosystemet",
  },
  kalkylator: {
    namn: "AKM1-kalkylatorn", kategori: "sajtens räkneverk",
    karna: [
      `${EKOSYSTEM.modeller.AKM1.variabler} variabler, tre flikar: 1) Räkna med egna siffror (formler + auto-poäng), 2) Poängsätt manuellt (reglage), 3) Var hittar jag siffrorna? (rapportguiden).`,
      "Dra i reglagen — rekommendationen och kategorisnitten uppdateras direkt.",
      "Osäker på en variabel? Klicka på namnet i kalkylatorn — då landar du i kursen.",
    ],
    exempel: "Pröva med exempelbolagen: Precise Biometrics (38/100 i den officiella analysen) eller Volvo Cars (62/100) — knappen 'Exempel' i kalkylatorn laddar dem.",
    fortfragor: [
      "Vill du att jag förklarar en variabel först — säg bara 'vad är ROE' eller 'förklara V07'?",
      "Ska vi öppna guiden 'Var hittar jag siffrorna?' — den följer med hela vägen in i årsredovisningen?",
    ],
    kurs: "/kalkylator",
    egenaHandlingar: [
      { text: "Öppna kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
      { text: "Var hittar jag siffrorna? →", lank: "#guide", ikon: "📖", beskrivning: "Rapportguiden (fliken i kalkylatorn)" },
      { text: "Se alla 20 variabler →", lank: "/kurser", ikon: "📊" },
    ],
  },
  portfolj: {
    namn: "Portföljsystemet", kategori: "dina innehav, genomlysta",
    karna: [
      "Lägg in vad du äger — bolag, antal aktier, kurs. Systemet analyserar varje aktie för sig och väger samman portföljens AKM1-poäng.",
      "Du får vågbild per tidshorisont, riskmått, koncentration och personliga tips — allt utifrån dina egna siffror.",
      "Djupanalysen hämtar live-data och kör Python-motorn: 5×5×4 per aktie → viktad portföljbild.",
    ],
    exempel: "Påhittat: 5 innehav där ett bolag är 42 % av värdet → koncentrationsvarningen tänds (gränsen går vid 40 %) — då vet du var riskspridningen behöver jobbas.",
    fortfragor: [
      "Vill du förstå 40 %-varningen — varför just den nivån?",
      "Ska vi kolla kursen om portfölj-ekosystemet (5×5×4) först?",
    ],
    kurs: "/min-portfolj",
    egenaHandlingar: [
      { text: "Min portfölj →", lank: "/min-portfolj", ikon: "💼" },
      { text: "Kursen om portfölj-ekosystemet →", lank: "/kurser/portfolj-ekosystemet", ikon: "📊" },
      { text: "Portföljbyggaren (träna) →", lank: "/portfoljbyggare", ikon: "🏗️" },
    ],
  },
  tillvaxt: {
    vId: "V01–V03", namn: "Tillväxt", kategori: "Tillväxt (tre variabler)",
    karna: [
      "AKM1 mäter tillväxtkvalitet med tre variabler: V01 (försäljningstillväxt), V02 (ARR-tillväxt) och V03 (intäktsdiversifiering).",
      "Alla tre mäter olika aspekter: hur mycket, hur återkommande och hur utspritt.",
      "V01 har egen poängskala (≥30 % → 5p · ≥20 % → 4p · ≥10 % → 3p · ≥0 % → 2p); V02–V03 poängsätts kvalitativt 0–5.",
    ],
    exempel: "Påhittat bolag: omsättning +20 % (V01: 4p), ARR +31 % (V02: högt) men storkund på 45 % (V03: lågt) — snabb men skör tillväxt.",
    fortfragor: [
      "Vill du gå på djupet i V01 — formeln och var siffrorna står?",
      "Ska vi väga ihop hela tillväxtkategorin i kalkylatorn?",
    ],
    kurs: "v01-forsaljningstillvaxt",
  },
  risk: {
    vId: "V10 + V19", namn: "Risk", kategori: "Risk (två variabler)",
    karna: [
      "I AKM1 är risk inte volatilitet — det är permanent förlust av kapital. Två variabler fångar den: V10 (skuldsättningsgrad) och V19 (kassatäckning — nyemissionsrisk).",
      "V10 poängskala: <0,5 → 5p · <1 → 4p · <2 → 3p · <3 → 2p · ≥3 → 1p. V19: positivt kassaflöde → 5p, annars månader kvar i kassan.",
      "Prissvängningar är Mr Market som skriker — risken bor i fundamentalen.",
    ],
    exempel: "Påhittat bolag: skulder 1 500 Mkr mot eget kapital 4 000 Mkr (V10: 0,38 → 5p) men förbränning −60 Mkr/år med kassa 240 Mkr (V19: 48 mån → 4p) — lugnt idag, koll på klockan.",
    fortfragor: [
      "Vill du se hur en emission späder ut ägandet — V19 i praktiken?",
      "Ska vi kolla V10-formeln och var skulderna gömmer sig i balansräkningen?",
    ],
    kurs: "v19-kapitalforbranning",
  },
  utdelning: {
    namn: "Utdelning", kategori: "utanför AKM1:s 20 — bedöms via tre variabler",
    karna: [
      "Ärligt: utdelning är inte en egen AKM1-variabel. Hållbarheten bedömer du med V09 (ROE — genereras vinsten alls?), V10 (skuld — betalas den ut med lånade pengar?) och V19 (kassaflöde — räcker det?).",
      "Huvudregel: hållbarhet före nivå. En utdelning som överstiger vad verksamheten genererar äter balansräkningen.",
    ],
    exempel: "Påhittat bolag: utdelning 6 kr per aktie på en vinst på 5 kr → utdelningsgrad 120 % — betalas ur balansräkningen, inte ur verksamheten.",
    fortfragor: [
      "Ska vi kolla ROE (V09) först — där föds en hållbar utdelning?",
      "Vill du läsa Grahams syn på utdelningar i The Intelligent Investor?",
    ],
    kurs: "v09-roe",
  },
  borsen: {
    namn: "Börsen", kategori: "startpunkten",
    karna: [
      "Börsen är en marknadsplats där andelar i bolag byter ägare — varje dag, till ett pris som sätts av utbud och efterfrågan.",
      "Priset är inte samma sak som värdet. Det är hela skillnaden — och hela Grundidén bakom AKM1: köp andelar i bra bolag när priset ligger under värdet.",
      "Din kompass: Mr Market (humöret) + marginal of safety (rabatten) + 20 variabler (kvaliteten).",
    ],
    exempel: "Påhittat: ett bolag som tjänar 100 Mkr per år och handlas till 10 000 Mkr kostar 100 års vinst — börsen bestämmer priset, fundamentalen hjälper dig avgöra om det är värt det.",
    fortfragor: [
      "Vill du börja med den viktigaste variabeln — V09 ROE?",
      "Ska vi titta på läroplanen i stället? Nivå 1 börjar från noll.",
    ],
    kurs: "/laroplan",
    egenaHandlingar: [
      { text: "Börja här: Läroplanen →", lank: "/laroplan", ikon: "🌱" },
      { text: "V09: ROE — viktigaste variabeln →", lank: "/kurser/v09-roe", ikon: "📊" },
      { text: "Mr Market (Graham-kursen) →", lank: "/kurser/the-intelligent-investor", ikon: "🏛️" },
    ],
  },
};

/** Mänskliga frasinledningar — roteras så mentorn aldrig låter robotlik. */
const OPPNARE: Array<(namn: string) => string> = [
  (n) => `Bra fråga — ${n} är precis sånt som skiljer proffsanalys från gissningar.`,
  (n) => `Kul att du frågar om ${n} — det är en av grundpelarna.`,
  (n) => `Okej, ${n}! Då kör vi, steg för steg.`,
  (n) => `Det där är en av mina favoritfrågor. ${n} i korthet:`,
  (n) => `Precis rätt fråga just nu. Så här tänker du kring ${n}:`,
  (n) => `Då reder vi ut ${n} ordentligt.`,
];

/** Övergångar för följdfrågor — "vi var inne på ROE, nu tar vi P/S". */
const OVERGANGAR: Array<(förra: string, nya: string) => string> = [
  (f, n) => `Vi var precis inne på ${f} — nu tar vi ${n}, de hänger ihop:`,
  (f, n) => `Bra att du bygger vidare från ${f}. ${n} är nästa naturliga stapel:`,
  (f, n) => `Du tänker som en analytiker — först ${f}, sedan ${n}:`,
  (f, n) => `${f} och ${n} är grannar i modellen. Så hänger det ihop:`,
];

/** Komponera ett ämnessvar: bekräftelse → kärna → SEK-exempel → följdfråga. */
function vSvar(nyckel: AmnesNyckel, foljdAv: AmnesNyckel | null, fro: number): Bassvar {
  const post = V_REGISTRET[nyckel];
  const akm = EKOSYSTEM.modeller.AKM1;
  const oppnare = OPPNARE[fro % OPPNARE.length](post.namn);
  const overgang =
    foljdAv && foljdAv !== nyckel
      ? OVERGANGAR[fro % OVERGANGAR.length](V_REGISTRET[foljdAv].namn, post.namn)
      : "";

  const rubrik = post.vId
    ? `${post.vId} · ${post.namn} — ${post.kategori} i AKM1 (${akm.variabler} variabler, ${akm.poangskala}).`
    : `${post.namn} — ${post.kategori}.`;

  const delar = [
    overgang ? overgang : oppnare,
    [rubrik, ...post.karna].join("\n"),
    `Räkneexempel (påhittat men realistiskt): ${post.exempel}`,
    post.fortfragor[fro % post.fortfragor.length],
  ];
  if (post.varde) delar.push("Pedagogisk analys — inte investeringsråd.");

  const handlings: Handling[] = post.egenaHandlingar ?? [
    post.kurs.startsWith("/")
      ? { text: `${post.namn} →`, lank: post.kurs, ikon: "📚" }
      : { text: `Läs kursen: ${post.namn} →`, lank: `/kurser/${post.kurs}`, ikon: "📚" },
    { text: "Räkna i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
    { text: "Se alla 20 variabler →", lank: "/kurser", ikon: "📊" },
  ];

  return { svar: delar.join("\n\n"), handlings, typ: "utbildning", kalla: "AKM1-ekosystem (deterministisk)" };
}

// ── SMALLTALK + SNABBA INTENT — mänskligt, kort, med nästa steg ──────────────

/** Hälsnings-, tack-, hjälp- och navigerings-smalltalk. Null = inte smalltalk. */
function smalltalkSvar(n: NormaliseradFraga, niva: number | null, fro: number): Bassvar | null {
  const ren = n.ren;

  // "nästa steg" / "nästa kurs" — personligt utifrån nivå (om klienten skickar den)
  if (/nasta (steg|kurs)|vart ska jag ga nu|^vad nu$|fortsattning/.test(ren)) {
    const redoFas2 = (niva ?? 0) >= 25;
    return {
      svar: redoFas2
        ? `Då tar vi pulsen på resan! Du ligger på nivå ${niva} — det är en stark signal. Fas 2-ansökan (kostnadsfritt, 2 minuter) är öppen för dig: coaching, 18 mästarverk och representant-vägen.\n\nVill du hellre fortsätta bygga i din egen takt? Då väntar Superanalysen eller nästa kurs i läroplanen.`
        : `Då tar vi pulsen på resan! Börja där du står: nästa kurs i läroplanen (varje avslutad kurs ger XP och flyttar dig uppåt), eller repetera dagens flashcards — glömskekurvan jobbar åt dig.\n\nVill du ha det personligt? Berätta vad du senast lärde dig, så tipsar jag om exakt rätt kurs.`,
      handlings: [
        { text: "Fortsätt läroplanen →", lank: "/laroplan", ikon: "🗺️" },
        redoFas2
          ? { text: "Ansök om Fas 2 →", lank: "/fas2-ansok", ikon: "🎓", beskrivning: "Nivå 25+ — du är redo" }
          : { text: "Räkna på en aktie →", lank: "/kalkylator", ikon: "🧮" },
        { text: "Repetera flashcards", lank: "#", ikon: "🃏", beskrivning: "+5 XP per bra svar" },
      ],
      typ: "hjälp",
      kalla: "AI-Mentor",
    };
  }

  // "testa mig" / "testa min nivå"
  if (/testa (mig|min niva)|niva ?test|nivatest|vilken niva jag ar|hur duktig/.test(ren)) {
    return {
      svar: `Kul att du vill mäta dig! Två vägar, och de mäter olika saker:\n• Kognitiva profilen — ett 3-minuters scenariotest som visar hur DU tänker som analytiker (inte vad du kan).\n• Quiz i kurserna — konkreta kunskapsfrågor, +10 XP per rätt svar.\nSnabbast vägen: öppna en kurs du kan något om och kör quiz:et direkt.`,
      handlings: [
        { text: "Kognitiva profilen (3 min) →", lank: "/profil", ikon: "🧠" },
        { text: "Testa dig: quiz i kurserna →", lank: "/kurser", ikon: "🎯", beskrivning: "+10 XP per rätt svar" },
        { text: "Läroplanen (se nivån) →", lank: "/laroplan", ikon: "🗺️" },
      ],
      typ: "utbildning",
      kalla: "AI-Mentor",
    };
  }

  // "hjälp"
  if (/^hjalp\b|behover hjalp|vad kan du|hur anvander jag|vet inte vad jag ska|^help\b/.test(ren)) {
    return {
      svar: `Varsågod — så här hjälper jag dig bäst:\n• Förklara alla 20 AKM1-variabler — fråga "vad är ROE?", "förklara V07" eller bara "vad är pe?"\n• Visa verktygen: kalkylatorn, portföljen, Konfluensradarn, Vågfundamentet\n• Tipsa om nästa steg — skriv "nästa steg" eller "testa min nivå"\n• Repetera — skriv "repetera" så startar flashcardsen direkt här i chatten\nFråga fritt — stavfel tål jag.`,
      handlings: [
        { text: "V09: ROE — börja där →", lank: "/kurser/v09-roe", ikon: "📊" },
        { text: "Kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
        { text: "Läroplanen →", lank: "/laroplan", ikon: "🗺️" },
      ],
      typ: "hjälp",
      kalla: "AI-Mentor",
    };
  }

  // "tack" — korta, varma, roterande
  if (/^tack|^tackar|tacksam/.test(ren) && n.tokens.length <= 4) {
    const TACK = [
      "Varsågod! Tack för att du investerar i dig själv — det är den mest pålitliga avkastningen som finns. Ska vi ta nästa steg?",
      "Vad kul att det hjälpte! Då är vi redo för nästa variabel — eller ett quiz för att fästa kunskapen?",
      "Varsågod — jag är här när du behöver mig. Kom ihåg: repetition är hur hjärnan bygger, så skriv 'repetera' när du vill friska upp minnet.",
    ];
    return {
      svar: TACK[fro % TACK.length],
      handlings: [
        { text: "Repetera flashcards", lank: "#", ikon: "🃏" },
        { text: "Nästa steg →", lank: "fragor:" + encodeURIComponent("nästa steg"), ikon: "➡️" },
        { text: "V09: ROE →", lank: "/kurser/v09-roe", ikon: "📊" },
      ],
      typ: "hjälp",
      kalla: "AI-Mentor",
    };
  }

  // Ren hälsning ("hej", "god morgon") — kort fråga-svar-situation
  if (/^(hej|hejsan|hall|hallà|tja|yo|god morgon|godmorgon|god dag|goddag|god kvall|godkvall|hello|hi|morr)\b/.test(ren) && n.tokens.length <= 2) {
    return {
      svar: `Hej! Vad kul att du är här. Jag följer med dig genom hela resan — fråga om vad som helst: en variabel ("vad är ROE?"), ett verktyg eller nästa steg. Och oroa dig inte för stavfel — jag förstår ändå.`,
      handlings: [
        { text: "Börja här: Läroplanen →", lank: "/laroplan", ikon: "🌱" },
        { text: "Vad är ROE? (testa mig) →", lank: "fragor:" + encodeURIComponent("vad är ROE?"), ikon: "📊" },
      ],
      typ: "hjälp",
      kalla: "AI-Mentor",
    };
  }

  return null;
}

// ── ÄRLIGHETSLAGER: live-data om verkliga bolag hittar vi ALDRIG på ─────────

/** Kända bolagsnamn (förenklade) — träffar bara tillsammans med data-ord. */
const BOLAGSNAMN = [
  "volvo", "volcar", "ericsson", "ericson", "telia", "nordea", "swedbank",
  "handelsbanken", "sandvik", "atlas", "investor", "industrivarden", "saab",
  "scania", "elekta", "hexagon", "ssab", "boliden", "lifco", "addtech",
  "nibe", "hexatronic", "kopygold", "precise", "eqt", "spiltan", "hm",
];

/** Frågor som kräver aktuell bolagsdata ("kursen just nu", "vad kostar X?"). */
function bordataSvar(n: NormaliseradFraga): Bassvar | null {
  // Ord-prefix-matchning ("volvos" triggar "volvo") på den normaliserade
  // frågan — exakt token-matchning räcker inte för svenska genitiv.
  const namn = BOLAGSNAMN.find((b) => new RegExp(`\\b${b}`).test(n.ren));
  if (!namn) return null;
  const live =
    /just nu|dagens|idag|aktuell|kurs|pris|kosta|utveckling|senaste|snitt|varder(ing)? .* (nu|idag)|hur gar/.test(n.ren);
  if (!live) return null;
  return {
    svar: `Det här vet jag inte säkert — jag har ingen live-data här i chatten, och om verkliga bolag hittar jag aldrig på siffror. Det är en ärlighetsfråga: en påhittad kurs är värd noll för dig.\n\nMen jag kan hjälpa dig vidare:\n• Analysbanken — färdiga analyser med riktiga, källbelagda siffror\n• Vågfundamentet — hur bolagens fundamentalvågor rör sig (20×5-matrisen)\n• Kalkylatorn — sätt in bolagets egna siffror från årsredovisningen och räkna själv`,
    handlings: [
      { text: "Analysbanken (färdiga analyser) →", lank: "/analyser", ikon: "📊" },
      { text: "Vågfundamentet (20×5) →", lank: "/vagfundament", ikon: "🌊" },
      { text: "Räkna själv i kalkylatorn →", lank: "/kalkylator", ikon: "🧮" },
    ],
    typ: "hjälp",
    kalla: "AI-Mentor — ärlighetslager",
  };
}

/** Läs konversationskontexten: klientens `kontext` (senaste ämnets nyckel)
 *  — annars härled ur historikens senaste elevfråga. Bakåtkompatibelt. */
function lasKontextAmne(kontextRå: unknown, historik: HistorikTur[]): AmnesNyckel | null {
  if (typeof kontextRå === "string" && kontextRå in V_REGISTRET) {
    return kontextRå as AmnesNyckel;
  }
  for (let i = historik.length - 1; i >= 0; i--) {
    if (historik[i].roll !== "du") continue;
    const hittad = hamtaAmne(normaliseraFraga(historik[i].text));
    if (hittad) return hittad;
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
    svar: `Bra fråga — vågkonen är ett av sajtens mest lärorika verktyg, och helt deterministiskt: ur en pris- eller fundamentalhistorik (t.ex. 24 månads-slutkurser) räknas percentilband per AK1TS-horisont — ren matematik ur seriens egen standardavvikelse, ingen slump, inga gissningar.
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
    svar: `Då reder vi ut konfluens ordentligt. Radarns garanti: värde FÖRE vågor — först måste bolaget vara påstått billigt mot sina egna siffror, SEDAN letar vi vågor som vänder. Fem oberoende dimensioner måste tala samman:
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
    svar: `Kul att du frågar — det här är Grahams mest extrema värdegolv. En net-net är ett bolag där kursen ligger under 2/3 av Net Current Asset Value (NCAV) — omsättningstillgångar minus totala skulder. Du köper alltså hela bolaget för mindre än dess rörelsekapital och får verksamheten "gratis".
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
    svar: `Precis rätt fråga — här är hur faser och certifiering hänger ihop. Fas 3 (13 999 kr) representeras snart — Fas 2-medlemmar får tillgång först. Vägen dit byggs av din egen insats:
• Fas 1 — hela biblioteket (${SIFFROR.kurser} kurser, kalkylatorn, portföljsystemet): gratis för alltid.
• Fas 2 (9 999 kr) — den fundamentala vägen till oberoende analytiker: inget nytt — samma 20 analytiska indikatorer (V01–V20), nu analyserade och sammanvägda på rätt sätt med stöd av 18 mästarverk (värdering, bokslut, redovisning, företagsfinans), oändligt med timmar med grundaren och chansen att bli representant för AK1nvestor. 90 dagars nöjd-kund-garanti: betalning först efter 90 dagar om du förblir nöjd. Ingen teknisk analys här — den hör hemma i Fas 3; ansökan kostnadsfritt (2 min), nivå 25+ är en bra signal.
• Fas 3 — allt i Fas 2 plus det dynamiska ekosystemet: AKM1 × AK1TS, Vågfundamentet, Konfluensradarn och Portföljens vågor, teknisk analys på mästarnivå, trading-psykologi samt dashboard med AI-koppling och rapporter — och rätt till alla framtida utvecklingar.
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
    svar: `AK1A Pro i korthet: vägen för skolor, företag och institutioner som vill ge sina elever eller medarbetare hela ekosystemet — ${SIFFROR.kurser} kurser, AKM1-kalkylatorn (20 variabler), portföljsystemet (5×5×4) och AI-mentorn.
Privata medlemmar hittar sina faser (Fas 1 gratis · Fas 2 den fundamentala vägen · Fas 3 ekosystemet) på medlemskapssidan.`,
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
      svar: `Ja, portföljrapporten har sin egen guide — den går steg för steg genom rapportens delar: AKM1-poängen per aktie, vågprofilen och riskmätningen. Verkstan där du BYGGER egna rapporter hittar du på /rapporter.`,
      handlings: [
        { text: "Läs guiden →", lank: "/blogg/sa-laser-du-din-portfoljrapport", ikon: "📖" },
        { text: "Bygg en rapport →", lank: "/rapporter", ikon: "🖨️" },
      ],
      kalla: "AK1A rapportverkstad",
      typ: "utbildning" as const,
    };
  }

  return {
    svar: `Redovisningsverkstan samlar dina analyser till en formatterad, utskriftsbar redovisningsrapport: marin omslagsband med AK1A-signering och din nivå, nyckeltal som tabellrader och metodiken bakom AKM1, AK1TS och Konfluens — med automatiska disclaimers. Allt sparas lokalt i din webbläsare. Skriv ut eller spara som PDF och dela med lärare, föräldrar eller framtida du.`,
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
    svar: `Viktig fråga — horisonten förändrar ALLT i analysen. Därför har AK1TS fem horisonter: mikro, kort, medellång, lång och mega. Samma bolag kan vara en stark impulsvåg på mikro och ett moget basbygge på lång.
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
      svar: `Ärligt svar: ingen vågkarta har sparats ännu — jag hittar inte på läge. Den autonoma mätningen körs enligt schema, och nästa mätning fyller kartan automatiskt. Du kan alltid studera vågklasserna ▲▼◼ själv i Vågfundamentets 20×5-matris.`,
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
    svar: `Här är senaste vågmätningen${genererad}: ${u.impulsvag} impulsvågor ▲, ${u.korrigering} korrigeringar ▼, ${u.basbygge} basbyggen ◼ och ${u.osatt} osatta celler i universum. ${rorelser}
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
 * Ton: pedagogik.ts — vi hjälper, vi dömer aldrig. Oppnaren roterar.
 */
function klarandeSvar(fraga: string, fro: number) {
  const fragaKort = fraga.trim().replace(/\s+/g, " ").slice(0, 60);
  const KLARANDE_OPPNARE = [
    "Bra fråga — och precis här vill jag vara en riktig mentor istället för att gissa.",
    "Klassisk analytiker-fråga — och svaret beror på vad du vill uppnå, så låt mig fråga rätt först.",
    "Där stannar jag upp och frågar vidare — en mentor gissar aldrig, den hjälper dig fråga rätt.",
  ];
  const oppnare = KLARANDE_OPPNARE[fro % KLARANDE_OPPNARE.length];
  return {
    svar: `${oppnare} "${fragaKort}${fraga.length > 60 ? "…" : ""}" beror helt på vad du vill uppnå: en aktie kan vara ett utmärkt långsiktigt innehav och ett dåligt korttidsläge — samtidigt.

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

// ── INTELLIGENSLAGER: minne, oberoende tänkande, motfråge-rotation ──────────
// Bygger ovanpå Task 106:s deterministiska svarsmotor: varje grundsvar berikas
// med bakåtreferens ur historiken, antagande-korrektion och EN roterande
// analytiker-motfråga — se berika() nedan.

/** Ämnesigenkänning i en fråga — driver naturliga bakåtreferenser.
 *  Primärt via NLU-lagret (chatbot-nlu) + V-registret; faller tillbaka på
 *  ämnen som andra svarslager äger (vågkarta, konfluens, redovisning …). */
function amne(fraga: string): string | null {
  const nlu = hamtaAmne(normaliseraFraga(fraga));
  if (nlu) {
    const p = V_REGISTRET[nlu];
    return p.vId ? `${p.vId} ${p.namn}` : p.namn;
  }
  const tabell: Array<[RegExp, string]> = [
    [/vågfundament|fundamentalvåg|vågklass|vågmatris/i, "vågfundamentet"],
    [/vågkarta|vågmätning/i, "vågkartan"],
    [/konfluens/i, "konfluens"],
    [/net[- ]?net|ncav|cigar/i, "net-net"],
    [/tidshorisont|horisont/i, "tidshorisonten"],
    [/rapport|redovisn|bokslut|årsredovisning/i, "redovisning"],
    [/utdel|flashcard|repeter/i, "repetition"],
  ];
  for (const [re, namn] of tabell) if (re.test(fraga)) return namn;
  return null;
}

/** Fortsättningsstilar för bakåtreferensen — roteras med historikens längd
 *  så att mentorn aldrig låter robotlik två frågor i rad. */
const BACKREF_STILAR = [
  "nu ligger vi rätt för nästa steg:",
  "nu bygger vi vidare på det:",
  "nu kan vi gå ett steg djupare:",
  "det gör den här frågan ännu skarpare:",
];

/**
 * Naturlig bakåtreferens ("Du frågade tidigare om V12 — nu ligger vi rätt för
 * nästa steg:"). Refererar ENDAST när historiken gör den naturlig: senaste
 * tidigare elevfråga har ett kännt ämne och antingen samma ämne som den
 * aktuella frågan, eller så saknar den aktuella frågan eget ämne. Annars
 * tvingas ingen referens fram — en analytiker citerar inte på commando.
 */
function bakåtreferens(q: string, historik: HistorikTur[]): string | null {
  const tidigare = historik.filter(
    (t) => t.roll === "du" && t.text.trim().length > 4 && t.text.trim() !== q.trim()
  );
  const senaste = tidigare[tidigare.length - 1];
  if (!senaste) return null;
  const amneSenaste = amne(senaste.text);
  const amneNu = amne(q);
  if (!amneSenaste) return null;
  if (amneNu && amneNu !== amneSenaste) return null;
  const stil = BACKREF_STILAR[historik.length % BACKREF_STILAR.length];
  return `Du frågade tidigare om ${amneSenaste} — ${stil}`;
}

/**
 * OBEROENDE TÄNKANDE — mönster på ifrågasättbara antaganden i elevens fråga.
 * Korrektionen läggs FÖRE grundsvaret och försämrar aldrig själva svaret:
 * "Snäv men viktig korrigering: ...".
 */
const ANTAGANDEN: Array<{ re: RegExp; korrigering: string }> = [
  {
    re: /(fundamentalanalys|fundamentet|fundamentaldata|fundamentala siffror)[^.]{0,80}(statisk|oföränderlig|ändras aldrig|fast och färdigt)/i,
    korrigering:
      "Snäv men viktig korrigering: fundamentalanalys är inte statisk. Varje AKM1-variabel (V01–V20) är en tidsserie med en egen våg per horisont — det du ser i en årsredovisning är en ögonblicksbild av en rörelse (Vågfundamentets 20×5-matris), inte en evig sanning.",
  },
  {
    re: /(l[aå]gt?\s*p\s*\/\s*e)[^.]{0,60}(alltid|per definition|betyder ju|måste ju)[^.]{0,30}(billig|bra|köp|attraktiv|fördelaktig)/i,
    korrigering:
      "Snäv men viktig korrigering: lågt P/E är inte synonymt med billigt — sjunkande marginaler (V07) eller hög skuld (V10) kan förklara varför marknaden rabatterar kursen. En multipel blir bara sann när den läses tillsammans med kvaliteten.",
  },
  {
    re: /(teknisk analys[^.]{0,60}fas\s?2)|(fas\s?2[^.]{0,60}teknisk analys)/i,
    korrigering:
      "Snäv men viktig korrigering: teknisk analys hör hemma i Fas 3 (AK1TS — 5 teorier × 5 horisonter × 4 dimensioner). Fas 2 är den fundamentala vägen: värdering, bokslut, redovisning och företagsfinans.",
  },
  {
    re: /utdelning[^.]{0,60}(alltid|bäst|säkrast|mest trygg)/i,
    korrigering:
      "Snäv men viktig korrigering: hög utdelning är inte automatiskt trygghet — en utdelning som överstiger vad verksamheten genererar äter balansräkningen (V10) eller slutar i emission (V19). Hållbarhet går alltid före nivå.",
  },
  {
    re: /(aktier|börsen)[^.]{0,50}(alltid|garanterat|ju alltid)[^.]{0,40}(upp|stiga|stiger|öka)/i,
    korrigering:
      "Snäv men viktig korrigering: längre tidshorisont sänker sannolikheten för förlust — men aldrig till noll. Risken för permanent kapitalförlust (V19) finns på alla horisonter; därför kräver Grahams marginal of safety alltid en rabatt mot beräknat värde.",
  },
  {
    re: /risk\s*(är|=|betyder|mag)\s*volatilitet/i,
    korrigering:
      "Snäv men viktig korrigering: i AKM1 är risk inte volatilitet utan permanent förlust av kapital. Prissvängningar är Mr Market som skriker — risken bor i fundamentalen (V10 skuldsättning, V19 kapitalförbrukning).",
  },
];

function hittaAntagande(q: string): string | null {
  for (const a of ANTAGANDEN) if (a.re.test(q)) return a.korrigering;
  return null;
}

/** Motfråge-kategorier — roteras så att mentorn aldrig ställer samma slag
 *  fråga två svar i rad och aldrig upprepar en exakt frågetext i historiken. */
type MotfragaKategori = "värdering" | "risk" | "tidshorisont" | "källkritik" | "applikation";

const MOTFRAGOR: Record<MotfragaKategori, string[]> = {
  värdering: [
    "Vilket P/E skulle du vara beredd att betala för det här bolaget — och vilken tillväxt förutsätter det priset?",
    "Om kursen föll 30 % imorgon utan ny information: är bolaget då billigare, eller såg du fel från början?",
    "Vad är bolaget värt om multipeln halveras men fundamentalen är oförändrad — och vad avgör det?",
  ],
  risk: [
    "Vilken enskild händelse skulle radera din tes — och finns den synlig i någon AKM1-variabel?",
    "Var finns skulden (V10) eller kapitalförbrukningen (V19) som kan tvinga fram en emission?",
    "Om du fick se EN variabel innan du avgör risken — vilken väljer du, och varför?",
  ],
  tidshorisont: [
    "På vilken av de fem horisonterna (mikro → mega) avgör den här frågan din tes?",
    "Skulle ditt svar förändras om horisonten vore 6 månader i stället för 6 år?",
    "Vilken vågklass (▲ ▼ ◼) väntar du på — och på vilken horisont?",
  ],
  källkritik: [
    "Var i årsredovisningen hittar du siffran som bevisar det — not, resultaträkning eller kassaflöde?",
    "Vem har intresse av att siffran ser ut som den gör — och vad skulle en shortsäljare titta på först?",
    "Stämmer nyckeltalet mot kassaflödet, eller är det en redovisningskonstruktion?",
  ],
  applikation: [
    "Räkna V09 (ROE = resultat efter skatt / snitt eget kapital) för ett bolag du följer — vilket värde hittar du?",
    "Öppna kalkylatorn och poängsätt bolaget (V01–V20): vilken variabel fick lägst poäng, och varför?",
    "Vilken variabel skulle du själv vilja lägga till i AKM1 — och vad skulle den mäta?",
  ],
};

/** Senaste motfråge-kategori ur historiken (markören "💬 Motfråga (…)" sparas
 *  av widgeten i minnet — därför överlever rotationen sidbyte och reload). */
function senasteMotfrageKategori(historik: HistorikTur[]): MotfragaKategori | null {
  for (let i = historik.length - 1; i >= 0; i--) {
    const t = historik[i];
    if (t.roll !== "mentor") continue;
    const m = t.text.match(/💬 Motfråga \(([^)]+)\)/);
    if (m) return m[1] as MotfragaKategori;
  }
  return null;
}

/** Ämnes-förankrad preferens: motfrågan ska helst bita i frågans eget ämne. */
function amnesPreferens(q: string): MotfragaKategori | null {
  if (/risk|skuld|emission|fara|förlust/i.test(q)) return "risk";
  if (/värder|multipel|p\s?\/\s?[seb]|billig|dyr|pris/i.test(q)) return "värdering";
  if (/tidshorisont|horisont|sikt|våg|timing|lång|mikro|mega/i.test(q)) return "tidshorisont";
  if (/källa|rapport|bokslut|redovisn|not|tillit|lita|siffra/i.test(q)) return "källkritik";
  if (/räkna|kalkyl|öv|testa|tillämp|använd|prakt/i.test(q)) return "applikation";
  return null;
}

/**
 * Välj EN skarp analytiker-motfråga:
 * 1. exkludera förra svarets kategori (ur historikmarkören) — aldrig samma
 *    kategori två gånger i rad,
 * 2. lyft fram kategorin som passar frågans ämne,
 * 3. rotera inom kategorin (mentor-svars-räknaren i historiken) och hoppa
 *    över frågetexter som redan ställts inom det synliga minnet.
 */
function valMotfraga(q: string, historik: HistorikTur[]): { text: string; kategori: MotfragaKategori } {
  const sist = senasteMotfrageKategori(historik);
  const alla = Object.keys(MOTFRAGOR) as MotfragaKategori[];
  const kandidater = alla.filter((k) => k !== sist);
  const preferens = amnesPreferens(q);
  const ordning =
    preferens && kandidater.includes(preferens)
      ? [preferens, ...kandidater.filter((k) => k !== preferens)]
      : kandidater.length > 0
        ? kandidater
        : alla;
  const mentorSvar = historik.filter((t) => t.roll === "mentor").length;
  const kategori = ordning[mentorSvar % ordning.length];
  const ställda = historik.filter((t) => t.roll === "mentor").map((t) => t.text).join("\n");
  const friska = MOTFRAGOR[kategori].filter((f) => !ställda.includes(f));
  const pool = friska.length > 0 ? friska : MOTFRAGOR[kategori];
  const text = pool[(q.length + mentorSvar) % pool.length];
  return { text, kategori };
}

/**
 * BERIKA — lägger intelligenslagren ovanpå ett grundsvar (deterministiskt
 * eller GLM): bakåtreferens, antagande-korrektion, EN roterande motfråga
 * (som separat fält — widgeten renderar den som klickbart chip) och en
 * "fördjupa"-länk. Klarande svar (redan en fråga) berikas inte med motfråga.
 * `amneKey` (topic-nyckel) skickas med i svaret — widgeten lagrar den som
 * konversationskontext och skickar tillbaka den som `kontext` nästa fråga.
 */
function berika(base: Bassvar, q: string, historik: HistorikTur[], amneKey?: AmnesNyckel | null) {
  const arKlarande = base.typ === "klarande";
  const delar: string[] = [];
  if (!arKlarande) {
    const ref = bakåtreferens(q, historik);
    if (ref && !base.svar.includes("Du frågade tidigare") && !base.svar.includes("Vi var precis inne på")) delar.push(ref);
    const korr = hittaAntagande(q);
    if (korr && !base.svar.includes("Snäv men viktig korrigering")) delar.push(korr);
  }
  const svar = [...delar, base.svar].filter(Boolean).join("\n\n");

  const motfraga = arKlarande ? undefined : valMotfraga(q, historik);
  const fLank =
    base.handlings.find((h) => h.lank.startsWith("/kurser/")) ||
    base.handlings.find((h) => h.lank.startsWith("/") && !h.lank.startsWith("fragor:"));
  const fordjupa = fLank
    ? { text: fLank.text.replace(/\s*→\s*$/, "").trim(), lank: fLank.lank }
    : undefined;

  return NextResponse.json({
    ...base,
    svar,
    ...(motfraga ? { motfraga } : {}),
    ...(fordjupa ? { fordjupa } : {}),
    ...(amneKey ? { amne: amneKey } : {}),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fraga, sokvag, historik: historikRå, kontext: kontextRå, niva: nivaRå } = await req.json();
    const q = String(fraga || "").slice(0, 300);
    const historik = rensaHistorik(historikRå);
    const niva = typeof nivaRå === "number" && Number.isFinite(nivaRå) ? nivaRå : null;

    // ── NL-LAGRET: frågan normaliseras (gemener, stavfel, åäö-varianter,
    //    fyllnadsord, synonymer) innan någon matcher ser den ──
    const norm = normaliseraFraga(q);
    const amnesNyckel = hamtaAmne(norm);
    const foljd = amnesNyckel !== null && arFoljdfraga(norm);
    const kontextAmne = lasKontextAmne(kontextRå, historik);
    // Rotationsfrö: deterministiskt men varierat fråga till fråga
    const fro = historik.length + q.length;

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

    // 0) SMALLTALK + snabba intent ("hej", "tack", "hjälp", "nästa steg",
    //    "testa min nivå") — korta mänskliga svar med nästa steg
    const small = smalltalkSvar(norm, niva, fro);
    if (small) return berika(small, q, historik, null);

    // 1) VÅGKARTA — senaste autonoma mätningen (mest specifika våg-frågan
    //    testas FÖRE vagfundamentet, annars slukar det "vågkartan")
    const vagkarta = await vagkartaSvar(q);
    if (vagkarta) return berika(vagkarta, q, historik);

    // 2) VÅGFUNDAMENT — fundamentalvågor enligt P7 (citera exakt, aldrig extrapolera)
    const vf = vagfundamentSvar(q, norm.ren);
    if (vf) {
      return berika({ ...vf, kalla: "Vågfundamentet — P7-protokollet", typ: "utbildning" }, q, historik);
    }

    // 3) SID-DATA-INTENTS — deterministiska svar om verktygen på sajten
    const vagkon = vagkonSvar(q);
    if (vagkon) return berika(vagkon, q, historik);

    const konfluens = konfluensSvar(q);
    if (konfluens) return berika(konfluens, q, historik);

    const netnet = netnetSvar(q);
    if (netnet) return berika(netnet, q, historik);

    const fas3 = fas3Svar(q);
    if (fas3) return berika(fas3, q, historik);

    const pro = proSvar(q);
    if (pro) return berika(pro, q, historik);

    const rapport = rapportSvar(q);
    if (rapport) return berika(rapport, q, historik);

    const horisont = tidshorisontSvar(q);
    if (horisont) return berika(horisont, q, historik);

    // 4) TVETYDIGHET — mentorn redigerar: EN klarliggande motfråga istället
    //    för gissning (köp-/sälj- och "är X bra?"-frågor)
    if (arTvetydig(q)) {
      return berika(klarandeSvar(q, fro), q, historik, null);
    }

    // 5) ÄRLIGHET — live-data om verkliga bolag hittas aldrig på: hänvisa
    //    vidare till verktygen (FÖRE ämnesmotorn — "vad är Volvos P/E just
    //    nu?" är en datafråga, inte en pedagogisk)
    const bordata = bordataSvar(norm);
    if (bordata) return berika(bordata, q, historik, null);

    // 6) ÄMNESMOTORN — alla 20 variabler + koncept: mänsklig struktur med
    //    bekräftelse, V-nummer + formel + poängskala (ur EKOSYSTEM-kanonen),
    //    SEK-exempel och naturlig fortsättningsfråga. Följdfrågor ("och P/E?")
    //    kopps till kontexten och nämner förra ämnet.
    if (amnesNyckel) {
      const foljdAv = foljd && kontextAmne && kontextAmne !== amnesNyckel ? kontextAmne : null;
      return berika(vSvar(amnesNyckel, foljdAv, fro), q, historik, amnesNyckel);
    }

    // 5) Navigering
    const nav = navigera(q);
    if (nav) {
      return berika(
        {
          svar: "Jag tar dig dit — klicka på någon av länkarna:",
          handlings: nav.handlings,
          typ: nav.typ,
          kalla: "AI-Mentor",
        },
        q,
        historik
      );
    }

    // 6) Varumärke
    if (/vem är|vad är.*(sam|ak1|alkamesi|nvestor)/i.test(q)) {
      return berika(
        {
          svar: `Sam Alkamesi är grundaren av AK1nvestor.com. AK1A Research Lab (lab.ak1nvestor.com) är plattformen: ${Object.keys(getCourses()).length} kurser, analyser, portföljsystem och AI-mentor — allt bygger på AKM1 + AK1TS-ekosystemet. Fas 1 är alltid gratis.`,
          handlings: [
            { text: "Se medlemskap →", lank: "/medlemskap", ikon: "💛" },
            { text: "Läs mer om oss →", lank: "/om-oss", ikon: "🏛️" },
          ],
          kalla: "varumärke",
          typ: "hjälp",
        },
        q,
        historik
      );
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
    //     + SAMTALSHISTORIK (minnet i djupet) och analytiker-persona i prompten
    if (zaiAktiv()) {
      const kurserKontext = relevanta.length > 0
        ? relevanta.map((k) => `- /kurser/${k.slug} — ${k.title}: ${(k.learn || "").slice(0, 200)}`).join("\n")
        : "Inga kursmatchningar — svara allmänt pedagogiskt.";

      // Historiken som GLM-meddelanden (äldst först). Widgeten sparar den aktuella
      // frågan sist i minnet — undvik dubblett av user-meddelandet.
      const historikMedd = historik
        .filter((t) => t.text.trim())
        .map((t) => ({
          role: t.roll === "mentor" ? ("assistant" as const) : ("user" as const),
          content: t.text,
        }));
      const medd = [...historikMedd];
      const sist = medd[medd.length - 1];
      if (!sist || sist.role !== "user" || sist.content.trim() !== q.trim()) {
        medd.push({ role: "user" as const, content: q });
      }

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
8. TVETYDIGA FRÅGOR ("är X bra?", "ska jag köpa X?"): gissa ALDRIG — ställ EN klarliggande motfråga om elevens tidshorisont och mål ("Bra för vad — som långsiktigt ägande eller kort sikt?") innan du svarar.
9. ANALYTIKER-PERSONA — TÄNK OBEROENDE: om elevens fråga vilar på ett tveksamt antagande (att fundamentalanalys vore statisk, att lågt P/E alltid vore billigt, att teknisk analys hör till Fas 2, att hög utdelning alltid vore trygghet) — påpeka det FÖRST med raden "Snäv men viktig korrigering: ..." och svara sedan lika fullständigt på själva frågan.
10. MINNE: du får samtalshistorik (äldst först). Referera bakåt naturligt när det hjälper eleven ("Du frågade tidigare om V12 — nu ligger vi rätt för nästa steg:") — men tvinga aldrig fram en referens som inte lyfter svaret.
11. Ställ INTE en avslutande fråga — mentorskiktet lägger automatiskt till EN roterande analytiker-motfråga efter ditt svar.

KURSMATCHNINGAR (grounding — lär dig från dessa, länka dem):
${kurserKontext}`,
          },
          ...medd,
        ],
        { temperatur: 0.6, maxTokens: 400 }
      );
      if (svaret) {
        return berika(
          {
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
          },
          q,
          historik
        );
      }
    }

    if (topp.length > 0) {
      const relevanta = topp.map(([slug]) => kurser.find((k) => k.slug === slug)!).filter(Boolean);
      return berika(
        {
          svar: relevanta.length === 1
            ? `Det låter som kursen "${relevanta[0].title}" (${relevanta[0].totalMinutes || relevanta[0].minutes} min).\n\n${relevanta[0].learn}`
            : `Bra ämne — flera kurser matchar:\n${relevanta.map((k) => `• ${k.title} — ${k.learn?.slice(0, 80)}…`).join("\n")}`,
          handlings: relevanta.slice(0, 3).map((k) => ({
            text: `Starta: ${k.title.slice(0, 30)}… →`,
            lank: `/kurser/${k.slug}`,
            ikon: "📚",
          })),
          kalla: "AKM1-ekosystem",
          typ: "utbildning",
        },
        q,
        historik
      );
    }

    // 8) ÄRLIG FALLBACK — mentorn erkänner vad den inte kan (hittar aldrig
    //    på) och bjuder på tre konkreta vägar vidare (direktiv: 3 förslag)
    const AKTIVITETER = [
      { text: "Förklara en variabel →", lank: "fragor:" + encodeURIComponent("vad är ROE?"), ikon: "📊", beskrivning: "Alla 20 — formel, poängskala, exempel" },
      { text: "Räkna på en aktie →", lank: "/kalkylator", ikon: "🧮", beskrivning: "AKM1: 20 variabler" },
      { text: "Nästa steg för mig →", lank: "fragor:" + encodeURIComponent("nästa steg"), ikon: "➡️", beskrivning: "Personligt tips" },
    ];
    return berika(
      {
        svar: `Det här vet jag inte säkert — och det är bättre att jag säger det än gissar. Men jag kan hjälpa dig med:\n• Alla ${EKOSYSTEM.modeller.AKM1.variabler} AKM1-variabler — fråga "vad är ROE?", "förklara V07", "vadd är P/E?" (stavfel tål jag)\n• Verktygen: kalkylatorn, portföljen, Konfluensradarn, Vågfundamentet\n• Din resa: "nästa steg", "testa min nivå" eller "repetera"`,
        handlings: AKTIVITETER,
        typ: "hjälp",
        kalla: "AI-Mentor — ärlighetslager",
      },
      q,
      historik,
      null
    );
  } catch {
    return NextResponse.json({ svar: "Något gick fel — försök igen." }, { status: 400 });
  }
}
