/**
 * LÄRVÄGSMOTORN (våg 88 — B1-LARVAG): raknaLarvag — "rätt kurs till rätt
 * människa, som ett tips aldrig ett tvång", nu på SERVERN ur medlemmens
 * progress + läsandekontext.
 *
 * ── KONTRAKTET (rekonstruerat ur uppdragsspec — B1-filen saknades) ──────────
 * REK-FORMELN: poäng = BAS (ÄRVD ur kurstips.ts — samma ekonomi, samma
 * trösklar, samma spår) + PÅSLAG +4 (nivåmatch: kursens level-tolkning
 * matchar läsarens lästillstånd) och +2 (V-spåret — fundamentet först).
 *
 * SEX REGLER (nomineringsordning = regelprioritet; första nomineringen
 * vinner per slug — varför-raden kommer från den VINNANDE regeln):
 *   1. spar-nasta        BAS 100 — nästa oklara i V-spåret (kurstips regel 1)
 *   2. svagheten         BAS  90 — quiz-svaghetens argmax-kurs (≥ 3 delar;
 *                              anonym räknare, se /api/quiz/svaghet)
 *   3. kategori-balans   BAS  82 — minst trampad kategori (kurstips regel 2)
 *   4. bokmaster         BAS  70 — flaggskeppen när grundlagt ≥ 8 (regel 3)
 *   5. streak-forberedelse BAS 58 — superanalys-förberedelse vid streak ≥ 5
 *   6. kortast-kurs      BAS  56 — spårets mest kompakta steg vid låg XP
 *
 * HÅRT FAS-FILTER: kraverFas > läsarens fas ⇒ kandidaten UTESLUTS helt
 * (aldrig nedviktad, aldrig synlig) — gaten tipsar, den stänger inte.
 *
 * DETERMINISTISK BRYTNING: sortering poäng desc, därefter LARVAG_KARTA-
 * index asc (deep-courses-ordningen). Argmax-oavgång: högre antal vinner,
 * därefter lägre kartindex. Samma indata ⇒ alltid samma svar.
 *
 * REN KÄRNA: deps = larvag-karta.ts + kurstips.ts (återanvändning, ALDRIG
 * duplikat) — inget nät, ingen fs, ingen localStorage. SSR-/test-säker.
 *
 * Tonen ALWAYS personlig + uppmuntrande i du-form (kurstips-DNA:t).
 * Pedagogisk plattform — inte investeringsråd.
 */

import { LARVAG_KARTA, LARVAG_KARTA_INDEX, type LarvagKurs } from "./larvag-karta";
import {
  FLAGGSKEPP,
  FORBEREDELSE,
  GRUNDLAGT_ANTAL,
  LAG_XP_GRANS,
  STREAK_NASTA_STEG,
  V_SPÅR,
  VISOR,
} from "./kurstips";

// ── Typer ────────────────────────────────────────────────────────────────────

/** Progress-vyn raknaLarvag behöver (MedlemProgress på servern, agregat i
 *  klienten — strukturell typning, inga beroenden till Supabase-lagret). */
export type LarvagProgress = {
  xp: number;
  klaraKurser: string[];
};

/** Läsarens kontext — sammanfattad, aldrig personuppgifter (eko-mönstret). */
export type LasandeKontext = {
  lasTillstand: "nybörjare" | "växande" | "avancerad" | "fas2-redo";
  /** Läsarens fas (1 gratis / 2 / 3 — Fas 3 öppnar Fas 2, supermängd). */
  fas: 1 | 2 | 3;
  /** Streak i dagar (klientens sanning — streak förblir lokal, v1-scope). */
  streak: number;
  /** Anonym räknare: antal registrerade svaghetsdelar per kurs-slug. */
  svagheter: Record<string, number>;
  /** Kurs eleven står på just nu (utesluts ur tipsen). */
  exkluderaSlug?: string;
};

/** Reglerna i nomineringsordning — varför-raden kommer från vinnaren. */
export type LarvagRegel =
  | "spar-nasta"
  | "svagheten"
  | "kategori-balans"
  | "bokmaster"
  | "streak-forberedelse"
  | "kortast-kurs";

/** Ett lärvägstips — samma form som KursTips + regel (spårbarhet). */
export type LarvagRek = {
  slug: string;
  titel: string;
  varför: string;
  poäng: number;
  ikon: string;
  regel: LarvagRegel;
};

// ── BAS-ekonomin (ÄRVS från kurstips — samma tal, en källa) ─────────────────

const BAS = {
  sparNasta: 100,
  svagheten: 90,
  kategoriBalans: 82,
  bokmaster: 70,
  streakForberedelse: 58,
  kortastKurs: 56,
} as const;

/** Påslag — ÖVER BAS, aldrig under (basen är ärvd och helig). */
export const PASLAG_NIVA_MATCH = 4;
export const PASLAG_V_SPAR = 2;

/** Svaghets-argmaxen kräver minst så många besvarade delar (kontraktet). */
export const MIN_SVAGHET_DELAR = 3;

/** Lästillstånd → mål-nivå (nivåmatchens +4). fas2-redo möter mästarverk. */
const MALNIVA: Record<LasandeKontext["lasTillstand"], number> = {
  nybörjare: 1,
  växande: 2,
  avancerad: 3,
  "fas2-redo": 3,
};

// ── Ikoner per rå kategori (kurstips IKONER breddad till hela universum) ─────

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

function ikonFranKurs(k: LarvagKurs): string {
  return IKONER[k.kategori] ?? "📚";
}

// ── Hjälpare ─────────────────────────────────────────────────────────────────

function kursUrKarta(slug: string): LarvagKurs | undefined {
  const i = LARVAG_KARTA_INDEX.get(slug);
  return i === undefined ? undefined : LARVAG_KARTA[i];
}

/** Poäng = BAS + påslag. +4 endast vid FAKTISK nivåmatch (0 = allmän
 *  matchar aldrig), +2 för V-spåret — fundamentet först. */
function raknaPoang(bas: number, k: LarvagKurs, malniva: number): number {
  const paslag =
    (k.niva > 0 && k.niva === malniva ? PASLAG_NIVA_MATCH : 0) + (k.vIndex >= 0 ? PASLAG_V_SPAR : 0);
  return bas + paslag;
}

// ── Varför-rader (från den VINNANDE regeln — kurstips-DNA:t) ────────────────

function varforSparNasta(slug: string, titel: string, klaraVSlugs: string[]): string {
  const senaste = klaraVSlugs.slice(-2).map((s) => s.split("-")[0].toUpperCase());
  const kategori = V_SPÅR.find((v) => v.slug === slug)?.kategori;
  const viso = kategori ? VISOR[kategori] : "spåret";
  if (klaraVSlugs.length === 0) {
    return `Välkommen in i spåret — ${titel} är första steget, och allt du behöver följer med på vägen.`;
  }
  if (senaste.length === 1) {
    return `Eftersom du klarat ${senaste[0]} väntar ${titel} — ${viso} öppnar sig för dig.`;
  }
  return `Du har ${senaste.join(" och ")} i ryggen — välkommen vidare till ${titel}, ${viso}.`;
}

function varforSvaghet(titel: string, delar: number): string {
  return `Quiz-signalen lyser just nu på ${titel} — ${String(delar)} delar väntar på en omgång till, och sedan sitter kunskapen.`;
}

function varforBalans(slug: string, titel: string, mestKategori: string | undefined): string {
  const kategori = V_SPÅR.find((v) => v.slug === slug)?.kategori;
  const katText = kategori ? kategori.toLowerCase() : "grunden";
  if (mestKategori) {
    return `Din tyngdpunkt ligger just nu på ${mestKategori.toLowerCase()} — ${katText} ger din analys fin balans, och ${titel} är en mjuk ingång.`;
  }
  return `Du väljer själv vägen — ${titel} är en lugn start i ${katText}.`;
}

function varforStreak(titel: string, streak: number): string {
  return `Din streak ligger på ${String(streak)} dagar i rad — den takten bär hela vägen till Superanalysen, och ${titel} är din förberedelse.`;
}

function varforKortast(slug: string, titel: string): string {
  const minuter = V_SPÅR.find((v) => v.slug === slug)?.minuter ?? kursUrKarta(slug)?.minuter ?? 0;
  return `Dagen känns kort? ${titel} är spårets mest kompakta — bara ${String(minuter)} minuter, och du är ett steg längre.`;
}

// ── raknaLarvag — kärnan (REN: inga deps utom kartan + kurstips) ────────────

/**
 * Räkna fram lärvägstips ur progress + läsandekontext. `begränsning.antal`
 * (default 3) begränsar listan, `begränsning.exkluderaSlug` utesluter en
 * kurs (t.ex. sidan eleven står på — se också lasande.exkluderaSlug).
 *
 * Deterministisk: samma indata ⇒ samma output, alltid (brytning:
 * poäng desc → kartindex asc).
 */
export function raknaLarvag(
  progress: LarvagProgress,
  lasande: LasandeKontext,
  begränsning?: { antal?: number; exkluderaSlug?: string },
): LarvagRek[] {
  const max = Math.max(1, begränsning?.antal ?? 3);
  const klaraSet = new Set(progress.klaraKurser);
  const exkludera = begränsning?.exkluderaSlug ?? lasande.exkluderaSlug;
  const malniva = MALNIVA[lasande.lasTillstand] ?? 1;

  /** HÅRT fas-filter + klar-/exkluderingsvakt — kandidatens hela port. */
  const kanNomineras = (slug: string): LarvagKurs | undefined => {
    if (!slug || slug === exkludera || klaraSet.has(slug)) return undefined;
    const k = kursUrKarta(slug);
    if (!k) return undefined;
    if (k.kraverFas > lasande.fas) return undefined; // hårt: aldrig synlig
    return k;
  };

  const kandidater: LarvagRek[] = [];
  const nominerade = new Set<string>();
  const lamna = (slug: string, bas: number, regel: LarvagRegel, varför: string): void => {
    const k = kanNomineras(slug);
    if (!k || nominerade.has(slug)) return; // första nomineringen vinner
    nominerade.add(slug);
    kandidater.push({
      slug,
      titel: k.titel,
      varför,
      poäng: raknaPoang(bas, k, malniva),
      ikon: ikonFranKurs(k),
      regel,
    });
  };

  const klaraV = V_SPÅR.filter((v) => klaraSet.has(v.slug));
  const klaraVSlugs = klaraV.map((v) => v.slug);

  // 1 ── Nästa i läroplansspåret (BAS 100 — högsta prioriteten)
  const nästaSpår = V_SPÅR.find((v) => kanNomineras(v.slug));
  if (nästaSpår) {
    lamna(
      nästaSpår.slug,
      BAS.sparNasta,
      "spar-nasta",
      varforSparNasta(nästaSpår.slug, nästaSpår.titel, klaraVSlugs),
    );
  }

  // 2 ── Svagheten (BAS 90): argmax över anonyma räknare, minst 3 delar.
  //      Oavgång: högre antal → lägre kartindex (deterministiskt).
  let svaghetSlug: string | null = null;
  let svaghetDelar = 0;
  for (const [slug, delar] of Object.entries(lasande.svagheter ?? {})) {
    if (typeof delar !== "number" || !Number.isFinite(delar) || delar < MIN_SVAGHET_DELAR) continue;
    if (!kanNomineras(slug)) continue;
    const kartIdx = LARVAG_KARTA_INDEX.get(slug) ?? Number.MAX_SAFE_INTEGER;
    const nuIdx = svaghetSlug ? (LARVAG_KARTA_INDEX.get(svaghetSlug) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
    if (delar > svaghetDelar || (delar === svaghetDelar && kartIdx < nuIdx)) {
      svaghetSlug = slug;
      svaghetDelar = delar;
    }
  }
  if (svaghetSlug) {
    const k = kursUrKarta(svaghetSlug);
    lamna(svaghetSlug, BAS.svagheten, "svagheten", varforSvaghet(k?.titel ?? svaghetSlug, svaghetDelar));
  }

  // 3 ── Balans efter kategori (BAS 82): minst trampad kategori först
  const perKategori = new Map<string, number>();
  for (const v of klaraV) perKategori.set(v.kategori, (perKategori.get(v.kategori) ?? 0) + 1);
  const mestKategori = [...perKategori.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const balansKandidat = V_SPÅR.filter((v) => kanNomineras(v.slug) && !nominerade.has(v.slug)).sort(
    (a, b) =>
      (perKategori.get(a.kategori) ?? 0) - (perKategori.get(b.kategori) ?? 0) ||
      V_SPÅR.indexOf(a) - V_SPÅR.indexOf(b),
  )[0];
  if (balansKandidat) {
    lamna(
      balansKandidat.slug,
      BAS.kategoriBalans,
      "kategori-balans",
      varforBalans(balansKandidat.slug, balansKandidat.titel, mestKategori),
    );
  }

  // 4 ── BOKMASTER när grundlagt (BAS 70 × högst 2) — varför-raden återanvänder
  //      FLAGGSKEPPENS egna texter (kurstips): sann återanvändning, ingen kopia.
  if (klaraSet.size >= GRUNDLAGT_ANTAL) {
    for (const f of FLAGGSKEPP.filter((f) => kanNomineras(f.slug)).slice(0, 2)) {
      lamna(f.slug, BAS.bokmaster, "bokmaster", f.varför(klaraSet.size));
    }
  }

  // 5 ── Streak → superanalys-förberedelse (BAS 58)
  if (lasande.streak >= STREAK_NASTA_STEG) {
    const f = FORBEREDELSE.find((x) => kanNomineras(x.slug));
    if (f) {
      lamna(f.slug, BAS.streakForberedelse, "streak-forberedelse", varforStreak(f.titel, lasande.streak));
    }
  }

  // 6 ── Låg XP → kortaste steget (BAS 56)
  if (progress.xp < LAG_XP_GRANS) {
    const kortast = V_SPÅR.filter((v) => kanNomineras(v.slug) && !nominerade.has(v.slug)).sort(
      (a, b) => a.minuter - b.minuter || V_SPÅR.indexOf(a) - V_SPÅR.indexOf(b),
    )[0];
    if (kortast) {
      lamna(kortast.slug, BAS.kortastKurs, "kortast-kurs", varforKortast(kortast.slug, kortast.titel));
    }
  }

  // Deterministisk sortering: poäng desc → kartindex asc (aldrig slump).
  return kandidater
    .sort(
      (a, b) =>
        b.poäng - a.poäng ||
        (LARVAG_KARTA_INDEX.get(a.slug) ?? 0) - (LARVAG_KARTA_INDEX.get(b.slug) ?? 0),
    )
    .slice(0, max);
}
