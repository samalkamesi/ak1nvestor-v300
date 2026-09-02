/**
 * KURSTIPS-MOTORN — "rätt kurs till rätt människa, som ett tips aldrig ett tvång."
 *
 * Allt lokaldata (localStorage via member-local), aldrig nät: kurstipsen kan
 * beräknas i klienten utan SSR-fel och utan väntetid. Rankningen följer fyra
 * källor i prioritetsordning:
 *   1. Nästa i läroplansspåret (V01→V20 i ordning)
 *   2. Balans efter kategori (ekosystemets kategorier — bredd, inte ensidighet)
 *   3. BOKMASTER när grundlagt (≥ 8 klara kurser → flaggskeppen)
 *   4. Tidssuggestioner (hög streak → superanalys-förberedelse, låg XP → kortast)
 *
 * Tonen är ALWAYS personlig + uppmuntrande i du-form. Ett tips välkomnar,
 * aldrig dömer: "din", "du har", "välkommen" — aldrig "borde", "missade", "brister".
 */

import { lasKlaraKurser, lasStreak, lasXP } from "./member-local";

export type KursTips = {
  slug: string;
  titel: string;
  varför: string;
  poäng: number;
  ikon: string;
};

// ── Läroplansspåret: V01–V20 ────────────────────────────────────────────────
// Slugs + titlar + kategorier + speltid bakade ur public/deep-courses.json
// (klienten kan inte läsa filen synkront — därför en statisk konstant).

type SpårKurs = { slug: string; titel: string; kategori: Kategori; minuter: number };

const KATEGORIER = [
  "Tillväxt",
  "Värdering",
  "Lönsamhet",
  "Stabilitet",
  "Moat",
  "Katalysator",
  "Risk",
  "Kapitalstruktur",
] as const;

type Kategori = (typeof KATEGORIER)[number];

const V_SPÅR: SpårKurs[] = [
  { slug: "v01-forsäljningstillväxt", titel: "Försäljningstillväxt", kategori: "Tillväxt", minuter: 29 },
  { slug: "v02-arr-tillväxt", titel: "ARR-tillväxt (återkommande intäkter)", kategori: "Tillväxt", minuter: 31 },
  { slug: "v03-intaktsdiversifiering", titel: "Intäktsdiversifiering", kategori: "Tillväxt", minuter: 28 },
  { slug: "v04-ps", titel: "P/S (Price-to-Sales)", kategori: "Värdering", minuter: 29 },
  { slug: "v05-pb", titel: "P/B (Price-to-Book)", kategori: "Värdering", minuter: 29 },
  { slug: "v06-ev-ebitda", titel: "EV/EBITDA", kategori: "Värdering", minuter: 29 },
  { slug: "v07-bruttomarginal", titel: "Bruttomarginal", kategori: "Lönsamhet", minuter: 29 },
  { slug: "v08-ebitda-marginal", titel: "EBITDA-marginal", kategori: "Lönsamhet", minuter: 29 },
  { slug: "v09-roe", titel: "ROE (Return on Equity)", kategori: "Lönsamhet", minuter: 29 },
  { slug: "v10-skuldsattningsgrad", titel: "Skuldsättningsgrad", kategori: "Stabilitet", minuter: 28 },
  { slug: "v11-likviditet", titel: "Likviditet (Kvick)", kategori: "Stabilitet", minuter: 28 },
  { slug: "v12-intaktsstabilitet", titel: "Intäktsstabilitet", kategori: "Stabilitet", minuter: 28 },
  { slug: "v13-patent-ip", titel: "Patent & Immateriella rättigheter", kategori: "Moat", minuter: 33 },
  { slug: "v14-varumarke", titel: "Varumärke & Kundlojalitet", kategori: "Moat", minuter: 33 },
  { slug: "v15-natverkseffekter", titel: "Nätverkseffekter", kategori: "Moat", minuter: 33 },
  { slug: "v16-produktlanseringar", titel: "Produktlanseringar", kategori: "Katalysator", minuter: 33 },
  { slug: "v17-avtal-partnerskap", titel: "Avtal & Partnerskap", kategori: "Katalysator", minuter: 33 },
  { slug: "v18-regulatoriska", titel: "Regulatoriska katalysatorer", kategori: "Katalysator", minuter: 33 },
  { slug: "v19-kapitalforbranning", titel: "Kapitalförbränning & Emission-risk", kategori: "Risk", minuter: 52 },
  { slug: "v20-aterekop-egna-aktier", titel: "Återköp av egna aktier", kategori: "Kapitalstruktur", minuter: 32 },
];

// ── Flaggskeppen (BOKMASTER när grundlagt) ─────────────────────────────────

const FLAGGSKEPP: { slug: string; titel: string; varför: (klara: number) => string }[] = [
  {
    slug: "akm1-den-kontroversiella-modellen",
    titel: "AKM1 — Den Kontroversiella Modellen",
    varför: (n) =>
      `Med ${n} klara kurser har du grunden lagd — välkommen till AKM1 i fullt djup, modellen som sätter poäng på allt du redan kan.`,
  },
  {
    slug: "ak1ts-vaglarans-hierarki",
    titel: "AK1TS — Våglärans Hierarki",
    varför: (n) =>
      `Du har ${n} kurser i ryggen — AK1TS kompletterar din grund med våglärans fem horisonter, från Mikro till Mega.`,
  },
  {
    slug: "vagfundament-variablerna-som-tidsserier",
    titel: "Vågfundament — Variablerna som Tidsserier",
    varför: (n) =>
      `${n} kurser stark — Vågfundamentet visar hur variablerna rör sig som tidsserier, precis som ett riktigt analysarbete.`,
  },
  {
    slug: "the-intelligent-investor",
    titel: "The Intelligent Investor — Graham: KOMPLETT",
    varför: (n) =>
      `Med ${n} klara kurser är du väl förberedd för Grahams klassiker — boken som hela labbet vilar på.`,
  },
];

// ── Förberedelser inför Superanalysen (hög streak → nästa steg) ────────────

const FORBEREDELSE: { slug: string; titel: string; minuter: number }[] = [
  { slug: "ts-10-ak1ts-25cellers-matris", titel: "AK1TS 25-cellers matris", minuter: 35 },
  { slug: "portfolj-ekosystemet", titel: "Från aktie till portfölj — 5×5×4-ekosystemet i praktiken", minuter: 55 },
];

// ── Ikoner + visor per kategori ────────────────────────────────────────────

const IKONER: Record<Kategori, string> = {
  Tillväxt: "🌱",
  Värdering: "⚖️",
  Lönsamhet: "💰",
  Stabilitet: "🛡️",
  Moat: "🏰",
  Katalysator: "⚡",
  Risk: "⚠️",
  Kapitalstruktur: "🏦",
};

const VISOR: Record<Kategori, string> = {
  Tillväxt: "tillväxtens motor",
  Värdering: "värderingens vågskål",
  Lönsamhet: "lönsamhetens hjärta",
  Stabilitet: "stabilitetens grund",
  Moat: "moatens murar",
  Katalysator: "katalysatorns gnista",
  Risk: "riskens vakt",
  Kapitalstruktur: "kapitalets balans",
};

const BOK_IKON = "📕";
const KOMPASS_IKON = "🧭";

/** Tröskel för "grundlagt" — sedan öppnas bokhyllan med flaggskeppen. */
const GRUNDLAGT_ANTAL = 8;
/** Streak där nästa steg (superanalys-förberedelse) känns välkomnande. */
const STREAK_NASTA_STEG = 5;
/** Under denna XP är korta, konkreta kurssteg extra trevliga. */
const LAG_XP_GRANS = 300;

/**
 * Räkna fram personliga kurstips — helt ur lokaldata.
 * `begränsning.antal` (default 3) begränsar antalet tips,
 * `begränsning.exkluderaSlug` utesluter en kurs (t.ex. sidan eleven står på).
 *
 * Säker i SSR/Node: member-local läser localStorage inuti try/catch, så utan
 * window returneras helt enkelt tips för en ny elev.
 */
export function raknaKurstips(begränsning?: { antal?: number; exkluderaSlug?: string }): KursTips[] {
  const max = begränsning?.antal ?? 3;
  const klara = lasKlaraKurser();
  const klaraSet = new Set(klara);
  const xp = lasXP();
  const streak = lasStreak().antal;

  const kandidater: KursTips[] = [];
  const lämna = (slug: string, titel: string, varför: string, poäng: number, ikon: string) => {
    if (klaraSet.has(slug) || slug === begränsning?.exkluderaSlug) return;
    if (kandidater.some((k) => k.slug === slug)) return;
    kandidater.push({ slug, titel, varför, poäng, ikon });
  };

  // 1 ── Nästa i läroplansspåret (högsta prioritet)
  const klaraV = V_SPÅR.filter((v) => klaraSet.has(v.slug));
  const nästaSpår = V_SPÅR.find((v) => !klaraSet.has(v.slug));
  if (nästaSpår) {
    const senaste = klaraV.slice(-2).map((v) => v.slug.split("-")[0].toUpperCase());
    const varför =
      klaraV.length === 0
        ? `Välkommen in i spåret — ${nästaSpår.titel} är första steget, och allt du behöver följer med på vägen.`
        : senaste.length === 1
          ? `Eftersom du klarat ${senaste[0]} väntar ${nästaSpår.titel} — ${VISOR[nästaSpår.kategori]} öppnar sig för dig.`
          : `Du har ${senaste.join(" och ")} i ryggen — välkommen vidare till ${nästaSpår.titel}, ${VISOR[nästaSpår.kategori]}.`;
    lämna(nästaSpår.slug, nästaSpår.titel, varför, 100, IKONER[nästaSpår.kategori]);
  }

  // 2 ── Balans efter kategori: minst trampad kategori först
  const perKategori = new Map<Kategori, number>();
  for (const v of klaraV) perKategori.set(v.kategori, (perKategori.get(v.kategori) ?? 0) + 1);
  const mestKategori = [...perKategori.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const balansKandidat = V_SPÅR.filter(
    (v) => !klaraSet.has(v.slug) && v.slug !== nästaSpår?.slug && v.slug !== begränsning?.exkluderaSlug,
  )
    .sort(
      (a, b) =>
        (perKategori.get(a.kategori) ?? 0) - (perKategori.get(b.kategori) ?? 0) ||
        V_SPÅR.indexOf(a) - V_SPÅR.indexOf(b),
    )[0];
  if (balansKandidat) {
    const varför = mestKategori
      ? `Din tyngdpunkt ligger just nu på ${mestKategori.toLowerCase()} — ${balansKandidat.kategori.toLowerCase()} ger din analys fin balans, och ${balansKandidat.titel} är en mjuk ingång.`
      : `Du väljer själv vägen — ${balansKandidat.titel} är en lugn start i ${balansKandidat.kategori.toLowerCase()}.`;
    lämna(balansKandidat.slug, balansKandidat.titel, varför, 82, IKONER[balansKandidat.kategori]);
  }

  // 3 ── BOKMASTER när grundlagt (≥ 8 klara kurser)
  if (klara.length >= GRUNDLAGT_ANTAL) {
    for (const f of FLAGGSKEPP.filter((f) => !klaraSet.has(f.slug)).slice(0, 2)) {
      lämna(f.slug, f.titel, f.varför(klara.length), 70, BOK_IKON);
    }
  }

  // 4 ── Tidssuggestioner: streak → förberedelse, låg XP → kortast
  if (streak >= STREAK_NASTA_STEG) {
    const f = FORBEREDELSE.find((x) => !klaraSet.has(x.slug));
    if (f) {
      lämna(
        f.slug,
        f.titel,
        `Din streak ligger på ${streak} dagar i rad — den takten bär hela vägen till Superanalysen, och ${f.titel} är din förberedelse.`,
        58,
        KOMPASS_IKON,
      );
    }
  }
  if (xp < LAG_XP_GRANS) {
    const kortast = V_SPÅR.filter((v) => !klaraSet.has(v.slug) && v.slug !== begränsning?.exkluderaSlug).sort(
      (a, b) => a.minuter - b.minuter || V_SPÅR.indexOf(a) - V_SPÅR.indexOf(b),
    )[0];
    if (kortast) {
      lämna(
        kortast.slug,
        kortast.titel,
        `Dagen känns kort? ${kortast.titel} är spårets mest kompakta — bara ${kortast.minuter} minuter, och du är ett steg längre.`,
        56,
        "⏱️",
      );
    }
  }

  return kandidater.sort((a, b) => b.poäng - a.poäng).slice(0, Math.max(1, max));
}
