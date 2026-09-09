/**
 * KLIENTKONTEXTEN (v1) — den högra handens förståelse av eleven.
 *
 * "Förstå eleven innan eleven vet vad den vill": ALLT eleven är — medlem,
 * XP/nivå, streak, klara kurser, elevkärnan (varför), beteendetracern
 * (hur) och navigationsminnet (var) — samlas här till EN enhetlig
 * KlientKontext. Assistenen och framtida system läser ENDAST härifrån:
 * en källa, en sanning, aldrig gissningar utspridda i komponenter.
 *
 * Källor:
 * - member-local: medlem, XP/nivå, streak, klara kurser
 * - elevkarna: huvudmålet (elevens "varför")
 * - tracer: intresseprofil, aktiv tid, typiska timmar, quiz, verktygsvanor
 * - navigationsminne: senaste meningsfulla sida (Min Sida hoppas över)
 *
 * Allt lokaldata (localStorage) och SSR-säkert: respektive lib läser via
 * window-guards/try-catch, så ett anrop på servern ger en ny elevs
 * kontext — aldrig krasch, aldrig nät.
 */

import { lasKlaraKurser, lasMedlem, lasStreak, lasXP, nivaFranXP } from "./member-local";
import { lasElevKarna } from "./elevkarna";
import { lasBeteende } from "./tracer";
import { besok, titelFranSida } from "./navigationsminne";
import { raknaKurstips } from "./kurstips";

// ── Typer ───────────────────────────────────────────────────────────────────

/** Elevens härledda lästillstånd — en resa, inte ett betyg. */
export type LasTillstand = "nybörjare" | "växande" | "avancerad" | "fas2-redo";

/** Den enhetliga klientförståelsen — ALLA system läser härifrån. */
export type KlientKontext = {
  namn: string | null;
  niva: number;
  xp: number;
  streak: number;
  klaraKurser: string[];
  /** Huvudmålet ur elevkärnan (MAL_ALTERNATIV) — elevens "varför". */
  mal: string | null;
  /** Intresseprofil ur tracern: "teknisk"|"fundamental"|"portfölj"|"beteende" → poäng. */
  intresseProfil: Record<string, number>;
  /** Aktiv tid i minuter (tracern räknar sekunder). */
  aktivTid: number;
  /** Vilka timmar (0–23) eleven är aktiv. */
  typiskaTimmar: number[];
  /** Andel rätt på quiz i procent (0 när inga quiz svarats ännu). */
  quizTraff: number;
  /** Vilka verktyg eleven använt → antal gånger. */
  verktygsVanor: Record<string, number>;
  /** Senaste meningsfulla sidan (Min Sida hoppas över, som i dashfraga). */
  senasteSida: string;
  /** Härleds ur allt ovan — ALDRIG satt för hand. */
  lasTillstand: LasTillstand;
  /**
   * Lärvägens serverräknade nästa kurs (våg 88 — AI-Mentorns kontext).
   * Berikas ASYNKRONT via berikaLarvag (larvag-klient.ts): kärnan bor på
   * servern (raknaLarvag via /api/larvag). Saknas tills svaret landat —
   * ALDRIG gissad lokalt (en källa, en sanning).
   */
  larvag?: { slug: string; titel: string; varför: string } | null;
};

/** Nästa steg-assistentens gissning — ödmjuk (sakerhet 0–100 %), aldrig ett tvång. */
export type NastaSteg = { suggestion: string; lank: string; ikon: string; sakerhet: number };

// ── Intressespårens flaggskepp ──────────────────────────────────────────────

/** När nyfikenheten får välja dörren: varje spårs naturliga nästa kurs. */
export const INTRESSE_KURS: Record<
  string,
  { slug: string; titel: string; omrade: string; ikon: string; text: string }
> = {
  teknisk: {
    slug: "ak1ts-vaglarans-hierarki",
    titel: "AK1TS — Våglärans Hierarki",
    omrade: "vågor och timing",
    ikon: "🌊",
    text: "Din nyfikenhet söker sig till vågor, mönster och timing — AK1TS fördjupar precis det spåret, från Mikro till Mega.",
  },
  fundamental: {
    slug: "the-intelligent-investor",
    titel: "The Intelligent Investor — Graham",
    omrade: "värde och substans",
    ikon: "🏛️",
    text: "Din tyngdpunkt ligger på värde och bolagens verkliga substans — Grahams klassiker är spårets flaggskepp.",
  },
  portfölj: {
    slug: "portfolj-ekosystemet",
    titel: "Från aktie till portfölj — 5×5×4-ekosystemet i praktiken",
    omrade: "portföljtänket",
    ikon: "🧩",
    text: "Du samlar kunskapen till något större — ekosystem-kursen väver trådarna till en portfölj som bär.",
  },
  beteende: {
    slug: "the-psychology-of-money",
    titel: "The Psychology of Money — Housel",
    omrade: "beteende och psykologi",
    ikon: "🧠",
    text: "Du studerar den viktigaste aktören — dig själv. Housels bok fördjupar just det hemliga vapnet.",
  },
};

// ── Hjälpfunktioner ─────────────────────────────────────────────────────────

/** Toppintresset ur en profil (klientkontextens form) — eller null. */
export function toppIntresseUrProfil(profil: Record<string, number>): string | null {
  let topp: string | null = null;
  let max = 0;
  for (const [nyckel, poang] of Object.entries(profil)) {
    if (poang > max) {
      max = poang;
      topp = nyckel;
    }
  }
  return topp;
}

/**
 * Kurs eleven besökt senast men ännu inte klarat → "påbörjad kurs".
 * Läses ur navigationsminnets senaste meningsfulla sida; kursdjupa
 * undervägar (med "/") och redan klarade kurser räknas inte.
 */
export function paborjadKurs(
  k: KlientKontext,
): { slug: string; titel: string; lank: string } | null {
  if (!k.senasteSida.startsWith("/kurser/")) return null;
  const slug = decodeURIComponent(k.senasteSida.replace("/kurser/", "").replace(/\/$/, ""));
  if (!slug || slug.includes("/")) return null;
  if (k.klaraKurser.includes(slug)) return null;
  const titel = titelFranSida(k.senasteSida).replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  return { slug, titel, lank: `/kurser/${slug}` };
}

// ── Lästillstånd ────────────────────────────────────────────────────────────

/**
 * Härled lästillståndet ur hela resan — högsta tillståndet först:
 * nivå ≥ 25 öppnar Fas 2 oavsett quiz; > 10 kurser + > 70 % träff är
 * avancerad; 3–10 kurser är växande; under 3 kurser med tunn träff är
 * nybörjare. Få kurser men stark träff växer redan — aldrig ett bristperspektiv.
 */
export function detekteraLasTillstand(k: KlientKontext): LasTillstand {
  if (k.niva >= 25) return "fas2-redo";
  if (k.klaraKurser.length > 10 && k.quizTraff > 70) return "avancerad";
  if (k.klaraKurser.length >= 3) return "växande";
  if (k.quizTraff < 60) return "nybörjare";
  return "växande";
}

// ── Bygg kontexten ──────────────────────────────────────────────────────────

/** Bygg den enhetliga klientkontexten ur ALLA källor — SSR-säkert. */
export function lasKlientkontext(): KlientKontext {
  const medlem = lasMedlem();
  const xp = lasXP();
  const beteende = lasBeteende();
  const karna = lasElevKarna();

  const quizTotalt = beteende["quiz ratt"] + beteende["quiz fel"];
  const quizTraff = quizTotalt > 0 ? Math.round((beteende["quiz ratt"] / quizTotalt) * 100) : 0;

  // Senaste meningsfulla sidan — Min Sida själv räknas inte (som dashfraga).
  const senasteSida = besok().find((b) => b.sida !== "/min-sida")?.sida ?? "";

  const k: KlientKontext = {
    namn: medlem ? medlem.namn || medlem.email.split("@")[0] || null : null,
    niva: nivaFranXP(xp),
    xp,
    streak: lasStreak().antal,
    klaraKurser: lasKlaraKurser(),
    mal: karna?.mal || null,
    intresseProfil: beteende.intresseProfil,
    aktivTid: Math.round(beteende.aktivTid / 60),
    typiskaTimmar: beteende.typiskaTimmar,
    quizTraff,
    verktygsVanor: beteende.verktygsAnvandning,
    senasteSida,
    lasTillstand: "nybörjare", // sätts nedan — härleds aldrig för hand
  };
  k.lasTillstand = detekteraLasTillstand(k);
  return k;
}

// ── Prediktion ──────────────────────────────────────────────────────────────

/**
 * Assistentens bästa gissning på elevens nästa steg — prioriterad ordning:
 *   1. Streak bruten/aldrig tänd → Dagens Pass
 *   2. Kurs påbörjad men ej klarad → nästa kapitel
 *   3. Tunn quiz-träff (0 < träff < 50) → repetition
 *   4. Intresseprofilens topp → kurs i just det området
 *   5. Lästillstånd "fas2-redo" → Fas 2-nudge
 * Fallback: kurstips-motorns nästa steg (eller biblioteket när allt är klart).
 *
 * Återkomsten är en gissning med sakerhet 0–100 % — eleven väljer alltid själv.
 */
export function predikteraNastaSteg(k: KlientKontext): NastaSteg {
  // 1. Kedjan bruten (eller aldrig tänd) → fem minuter tänder den igen.
  if (k.streak <= 0) {
    return {
      suggestion: "tända dagens pass — fem minuter räcker för att kedjan ska växa igen",
      lank: "/dagens-pass",
      ikon: "🔥",
      sakerhet: 88,
    };
  }

  // 2. Kurs påbörjad men inte klarad → nästa kapitel mitt i resan.
  const paborjad = paborjadKurs(k);
  if (paborjad) {
    return {
      suggestion: `fortsätta i "${paborjad.titel}" — du stod mitt i en påbörjad resa`,
      lank: paborjad.lank,
      ikon: "📖",
      sakerhet: 82,
    };
  }

  // 3. Tunn träff på quiz → repetition (glömskekurvan är normal, inte ett baksteg).
  if (k.quizTraff > 0 && k.quizTraff < 50) {
    return {
      suggestion: "repetera med dagens pass — repetition är hur hjärnan bygger",
      lank: "/dagens-pass",
      ikon: "🔁",
      sakerhet: 68,
    };
  }

  // 4. Intressets topp → flaggskeppet i området (om det inte redan är klarat).
  const topp = toppIntresseUrProfil(k.intresseProfil);
  if (topp) {
    const kurs = INTRESSE_KURS[topp];
    if (kurs && !k.klaraKurser.includes(kurs.slug)) {
      return {
        suggestion: `öppna ${kurs.titel} — din nyfikenhet lyser starkast i ${kurs.omrade}`,
        lank: `/kurser/${kurs.slug}`,
        ikon: kurs.ikon,
        sakerhet: 62,
      };
    }
  }

  // 5. Grunden lagd för nästa kapitel i labbet.
  if (k.lasTillstand === "fas2-redo") {
    return {
      suggestion: "se över Fas 2 — din grund är lagd för labbets nästa kapitel",
      lank: "/fas2-ansok",
      ikon: "🏛️",
      sakerhet: 55,
    };
  }

  // Fallback: nästa steg i spåret — eller biblioteket när allt är klarat.
  const tips = raknaKurstips({ antal: 1 })[0];
  if (tips) {
    return {
      suggestion: `ta nästa steg i spåret — ${tips.titel}`,
      lank: `/kurser/${tips.slug}`,
      ikon: tips.ikon,
      sakerhet: 50,
    };
  }
  return {
    suggestion: "välja nästa kurs i biblioteket — resan är din",
    lank: "/kurser",
    ikon: "🧭",
    sakerhet: 45,
  };
}
