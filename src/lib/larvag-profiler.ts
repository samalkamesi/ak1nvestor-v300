/**
 * LÄRVÄGSPROFILER (spår 5 — lärvägsdjup per profil, Front B) — "en väg per
 * nyfikenhet, som en inbjudan aldrig ett tvång."
 *
 * Kurstips (klient) och raknaLarvag (server) rankar ur medlemmens progress;
 * profilerna fyller det TREDJE lagret i spår 5: kuraterade lärvägar där
 * STEGEN är fasta och varför-raden är handskriven per steg. Tre profiler,
 * varje steg en VERKIG kurs ur lärvägskartan (333-register) — titel, speltid,
 * nivå och fas kräver INTE dubbleras hit: raknaProfil löser dem ur kartan
 * (en källa, en sanning — larvag.ts-mönstret).
 *
 * +2 KURSER MED VARFÖR-RADER (spår 5-uppdraget): the-psychology-of-money
 * och konfluens-varde-moter-vagor stegs in som PROFILMÅL — två kurser som
 * INTE tidigare fanns i någon tipsstruktur (varken V-spåret, FLAGGSKEPP
 * eller FORBEREDELSE) och nu får personliga, dynamiska varför-rader.
 *
 * REN KÄRNA: deps = larvag-karta.ts ENDAST — inget nät, ingen fs, ingen
 * localStorage. SSR-/test-säker, deterministisk (samma indata ⇒ samma svar).
 * Okänd/trasig steg-slug hoppas TYST över i raknaProfil (defensivt) — men
 * verktyg/larvag-synk.mjs fångar den mekaniskt (kursregister-synken).
 *
 * Ton: ALWAYS personlig + uppmuntrande i du-form (kurstips-DNA:t) —
 * "din", "du kan", "välkommen", aldrig "borde", "missade", "brister".
 * Pedagogisk plattform — inte investeringsråd (lagen 2007:528).
 */

import { LARVAG_KARTA, LARVAG_KARTA_INDEX } from "./larvag-karta";

// ── Typer ────────────────────────────────────────────────────────────────────

/** Ett handskrivet steg — slug + varför-rad; allt annat löses ur kartan. */
export type ProfilStegRå = {
  slug: string;
  varför: string;
};

/** Profilens målkurs — dynamisk varför-rad (antalet klara steg bärs in). */
export type ProfilMalRå = {
  slug: string;
  varför: (klaraSteg: number) => string;
};

/** En kurerad lärväg — stegen är fasta, ordningen är pedagogiken. */
export type LarvagProfilRå = {
  id: string;
  titel: string;
  kort: string;
  ikon: string;
  steg: ProfilStegRå[];
  mal?: ProfilMalRå;
};

/** Ett steg berikat ur kartan (titel/minuter/nivå/fas) + ordning + ikon. */
export type ProfilSteg = {
  slug: string;
  titel: string;
  varför: string;
  ikon: string;
  /** 1-baserad position i profilen (ordningen är pedagogiken). */
  ordning: number;
  minuter: number;
  niva: number;
  kraverFas: number;
  /** Kapitelantal ur coursedata (våg 99-mönstret — berikas av rutten). */
  kapitel?: number;
};

/** Målkursen — som ProfilSteg men med lasVidFas (gaten tipsar, stänger ej). */
export type ProfilMal = ProfilSteg & { lasVidFas: number };

/** Hela profilen, kartberikad + summerad. */
export type ProfilMedSteg = {
  id: string;
  titel: string;
  kort: string;
  ikon: string;
  /** Summan av STEGENS speltid (målkursen räknas separat). */
  minuter: number;
  steg: ProfilSteg[];
  mal: ProfilMal | null;
};

/** Listvyns kompakta rad (utan steg — /api/larvag/profil utan ?profil). */
export type ProfilRad = {
  id: string;
  titel: string;
  kort: string;
  ikon: string;
  antalSteg: number;
  minuter: number;
};

// ── Profilerna (kuraterade ur 333-registret — slugs verifierade av synken) ──

export const LARVAG_PROFILER: readonly LarvagProfilRå[] = [
  {
    id: "fundamentet",
    titel: "Fundamentet — från noll till hel rapport",
    kort: "Sex korta steg från bokföringens grunder till en egen portföljöversikt — allt på Fas 1, i lugn takt.",
    ikon: "🧱",
    steg: [
      {
        slug: "km-001-bokforingens-grunder",
        varför: "Välkommen in — bokföringen är språket som alla rapporter talar, och den här kursen ger dig grammatiken på 22 minuter.",
      },
      {
        slug: "km-003-kassaflodesanalysen",
        varför: "Du kan läsa siffrorna — nu följer du pengarna. Kassaflödesanalysen visar vart kontanterna faktiskt rör sig, och den överraskar ofta.",
      },
      {
        slug: "km-009-pe",
        varför: "Med två rapporter i ryggen öppnar sig värderingen — P/E är dess mest citerade nyckeltal, här förklarat från grunden utan stress.",
      },
      {
        slug: "v07-bruttomarginal",
        varför: "Nu sätter du lönsamheten under lupen — bruttomarginalen berättar hur mycket av varje intäktskrona som blir kvar, och varför det skiljer mellan branscher.",
      },
      {
        slug: "v10-skuldsattningsgrad",
        varför: "Helheten saknas: skuldsättningsgraden visar hur tåligt bolaget är byggt — grunden du står på när konjunkturen vänder.",
      },
      {
        slug: "pf-01-portfoljbyggande",
        varför: "Sista biten: portföljen. Här fogas kursernas delar till en helhet — och fundamentet är lagt.",
      },
    ],
    mal: {
      slug: "the-psychology-of-money",
      varför: (klaraSteg) =>
        `Fundamentet är lagt med ${String(klaraSteg)} steg i ryggen — siffrorna kan du. The Psychology of Money öppnar analysens andra halva: beteendet. Housels berättelser gör känslor lika gripbara som balansräkningar.`,
    },
  },
  {
    id: "utdelningsvagen",
    titel: "Utdelningsvägen — så fungerar utdelningar",
    kort: "Mekanismerna från beslut till utbetalning och skatt — ren utbildning i hur metoden fungerar, ingen regim.",
    ikon: "💵",
    steg: [
      {
        slug: "km-005-eget-kapital-utdelningar",
        varför: "Utdelningen föds i det egna kapitalet — kursen visar var pengarna står innan de delas ut, och vad styrelsen egentligen beslutar om.",
      },
      {
        slug: "ud-01-payout-ratio",
        varför: "Hur stor del av vinsten lämnas tillbaka? Payout-ratio förklarar nyckeltalet som mäter utrymmet.",
      },
      {
        slug: "ud-07-utdelningskalender",
        varför: "Kalendern är utdelningens karta — ex-dag, avstämningsdag och utbetalning, förklarade i den ordningen de kommer.",
      },
      {
        slug: "ud-03-dividend-aristocrats",
        varför: "Vissa bolag har höjt i decennier — Aristocrats-kursen visar hur sådana serier byggts upp och vad historien lärt.",
      },
      {
        slug: "ud-04-utdelningsfallor",
        varför: "Lockelsen har fallor — här lär du dig skilja en hållbar utdelning från en sällsynt generös sista hälsning.",
      },
      {
        slug: "km-052-isk",
        varför: "Till sist skatten: ISK:s schablonsättning förklarad — så räknas den, oavsett utdelningarnas storlek.",
      },
      {
        slug: "portfolj-ekosystemet",
        varför: "Vägen sammanstrålar i ekosystemet — 5×5×4-modellen binder utdelningar, värdering och portfölj till en helhet.",
      },
    ],
  },
  {
    id: "vagvisaren",
    titel: "Vågvisaren — teknisk analys i ordning",
    kort: "Den tekniska verktygslådan i pedagogisk ordning — från glidande medel till våglärans matris.",
    ikon: "🌊",
    steg: [
      {
        slug: "ts-12-moving-averages",
        varför: "Vågorna börjar med ett snitt — glidande medelvärden visar trendens rygg, och kursen lär dig läsa dem utan myter.",
      },
      {
        slug: "ts-16-stod-och-motstand",
        varför: "Priset minns vissa nivåer — stöd och motstånd förklarar varför, och hur zonerna identifieras i praktiken.",
      },
      {
        slug: "ts-13-rsi",
        varför: "Tempot mäts — RSI visar när en rörelse springer fortare än den orkar, och hur indikatorn tolkas med urskillning.",
      },
      {
        slug: "ts-03-fibonacciretracements",
        varför: "Talföljden återkommer i prisrörelser — Fibonacci-retracements visar hur nivåerna ritas och bemöts med sans.",
      },
      {
        slug: "ts-01-elliott-wave",
        varför: "Våglärans grundmönster: fem vågor med och tre mot — kursen går igenom strukturen steg för steg.",
      },
      {
        slug: "ts-10-ak1ts-25cellers-matris",
        varför: "Allt samlas i matrisen — AK1TS 25 celler binder verktygen till ett analysraster, klart att fyllas.",
      },
    ],
    mal: {
      slug: "konfluens-varde-moter-vagor",
      varför: (klaraSteg) =>
        `Verktygslådan är full med ${String(klaraSteg)} steg i ryggen — Konfluens är mötet där fundamental värdering och våglära talar samma språk: den sammansatta metoden i fullt djup. Välkommen vidare (öppnas i Fas 3).`,
    },
  },
];

// ── Ikoner per rå kategori (spegling av larvag.ts IKONER — ärvda värden,
//    privat kopia för exklusivt filägarskap; ändras de, ändras båda) ──────────

const IKONER: Record<string, string> = {
  TILLVÄXT: "🌱",
  VÄRDERING: "⚖️",
  LÖNSAMHET: "💰",
  STABILITET: "🛡️",
  MOAT: "🏰",
  KATALYSATOR: "⚡",
  RISK: "⚠️",
  KAPITALSTRUKTUR: "🏦",
  "BOKFÖRING & ÅRSREDOVISNING": "📒",
  VÄRDERINGSMETODER: "⚖️",
  "RISKHANTERING & PORTFÖLJTEORI": "🛡️",
  BETEENDEFINANS: "🧠",
  SEKTORANALYS: "🔭",
  "SVENSK BOLAGSSKATT & JURIDIK": "🏛️",
  "MAKROEKONOMI & RÄNTA": "🌍",
  "OPTIONS & DERIVAT": "🎯",
  UTDELNINGSSTRATEGI: "💵",
  "PRIVATE EQUITY & INVESTMENTBOLAG": "💼",
  "AKTIEMARKNADEN I PRAKTIKEN": "📈",
  "AK1TS FÖRDJUPNING": "🌊",
  "PRAKTISKA CASE": "🧪",
  RISKHANTERING: "🛡️",
  PORTFÖLJHANTERING: "🧩",
  "SKATT & JURIDIK": "🏛️",
  MAKROEKONOMI: "🌍",
  BOKMASTER: "📕",
  EKOSYSTEM: "🧬",
};

// ── Hjälpare ─────────────────────────────────────────────────────────────────

/** Slugs → klara-steg-räknare (målets varför-rad bärs av framgången). */
function raknaKlaraSteg(profil: LarvagProfilRå, klaraKurser: readonly string[]): number {
  const klaraSet = new Set(klaraKurser);
  return profil.steg.filter((s) => klaraSet.has(s.slug)).length;
}

// ── API: lista + detalj (deterministiskt, SSR-säkert) ───────────────────────

/** Alla profiler som kompakta rader — listvyn (?profil saknas). */
export function profilLista(): ProfilRad[] {
  return LARVAG_PROFILER.map((p) => {
    const berikad = raknaProfil(p.id);
    return {
      id: p.id,
      titel: p.titel,
      kort: p.kort,
      ikon: p.ikon,
      antalSteg: berikad ? berikad.steg.length : p.steg.length,
      minuter: berikad ? berikad.minuter : 0,
    };
  });
}

/** Råprofilen ur id (okänd ⇒ undefined — routen svarar 404). */
export function profilUrId(id: string): LarvagProfilRå | undefined {
  return LARVAG_PROFILER.find((p) => p.id === id);
}

/**
 * Berika en profil ur kartan: titel, speltid, nivå och fas per steg +
 * total minutsumma + målkursens dynamiska varför-rad (antalet klara steg
 * bärs in av anroparen). Okänd steg-slug hoppas TYST över — synkverktyget
 * fångar sådan drift mekaniskt. Deterministiskt: samma indata ⇒ samma svar.
 */
export function raknaProfil(id: string, klaraKurser: readonly string[] = []): ProfilMedSteg | null {
  const rå = profilUrId(id);
  if (!rå) return null;

  const steg: ProfilSteg[] = [];
  for (const s of rå.steg) {
    const i = LARVAG_KARTA_INDEX.get(s.slug);
    if (i === undefined) continue; // defensivt — synken larmar
    const k = LARVAG_KARTA[i];
    steg.push({
      slug: k.slug,
      titel: k.titel,
      varför: s.varför,
      ikon: IKONER[k.kategori] ?? "📚",
      ordning: steg.length + 1,
      minuter: k.minuter,
      niva: k.niva,
      kraverFas: k.kraverFas,
    });
  }

  let mal: ProfilMal | null = null;
  if (rå.mal) {
    const i = LARVAG_KARTA_INDEX.get(rå.mal.slug);
    if (i !== undefined) {
      const k = LARVAG_KARTA[i];
      mal = {
        slug: k.slug,
        titel: k.titel,
        varför: rå.mal.varför(raknaKlaraSteg(rå, klaraKurser)),
        ikon: IKONER[k.kategori] ?? "📚",
        ordning: steg.length + 1,
        minuter: k.minuter,
        niva: k.niva,
        kraverFas: k.kraverFas,
        lasVidFas: k.kraverFas,
      };
    }
  }

  return {
    id: rå.id,
    titel: rå.titel,
    kort: rå.kort,
    ikon: rå.ikon,
    minuter: steg.reduce((summa, s) => summa + s.minuter, 0),
    steg,
    mal,
  };
}
