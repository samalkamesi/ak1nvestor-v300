/**
 * MORGON-BRIEFINGEN — Kommandocentralens första kaffe (MEGA_PLAN_V3 Fas A4).
 *
 * Samlar elevens lokala morgon-läge till ETT tidningskort: nivå/XP, streak,
 * klara kurser, nästa kurstips och veckoplanens nästa rad. Allt läs ur
 * lokaldata (localStorage via member-local/kurstips/veckoplan — SSR-säkert,
 * null-säkert, aldrig nät). Vågdata lämnas TOMT här: vågkartan lever i
 * Supabase och hämtas av komponenten via /api/vagscan/senaste, som sedan
 * stoppas in i `vagdata` och smakar på morgonmeningen via `morgonMening`.
 *
 * Ton: AK1A-pedagogiken — välkommen, aldrig dömande. Morgonposten från en
 * privatbank: saklig, varm, personlig.
 */

import { lasKlaraKurser, lasStreak, lasXP, nivaFranXP } from "./member-local";
import { raknaKurstips } from "./kurstips";
import { raknaVeckoPlan, type PlanRad } from "./veckoplan";

// ── Typer ───────────────────────────────────────────────────────────────────

/** Vågkartans form som briefing-komponenten använder (speglar /api/vagscan/senaste). */
export type BriefingVagdata = {
  genererad?: string;
  universumSammanfattning?: {
    impulsvag: number;
    korrigering: number;
    basbygge: number;
    osatt: number;
  };
  topRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
  botRorelse?: { variabel: string; namn: string; antalBolag: number; text: string }[];
};

/** Veckoplanens nästa rad, urklippt till det briefing-kortet behöver. */
export type BriefingVeckoNasta = {
  dag: string;
  aktivitet: string;
  minut: number;
  typ: PlanRad["typ"];
  lank: string;
};

/** Morgon-briefingens fulla innehåll — allt graceful/null-säkert. */
export type Briefing = {
  /** Nivå 1–100 (100 XP per nivå). */
  niva: number;
  /** Totalt insamlade XP. */
  xp: number;
  /** Streak just nu + bästa genom tiderna. */
  streak: { antal: number; basta: number };
  /** Antal klara kurser (läroplanen). */
  klaraKurser: number;
  /** Nästa kurstips ur kurstips-motorn — eller null (allt klart/ny elev). */
  nastaKurs: { slug: string; titel: string } | null;
  /** Veckoplanens nästa oklara rad från och med idag — eller null. */
  veckoNasta: BriefingVeckoNasta | null;
  /**
   * TOM plats för vågdata — lib:t läser aldrig nät. Komponenten fyller
   * via fetch("/api/vagscan/senaste") och stoppar in svaret här (eller null).
   */
  vagdata: BriefingVagdata | null;
  /** Personlig morgonmening i pedagogik-ton (utan våg-läge tills vagdata finns). */
  mening: string;
};

// ── Tid ─────────────────────────────────────────────────────────────────────

/** Veckoplanens dag-ordning (måndag först) — lokal kopia för dag-index. */
const DAGAR = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];

/** Tidsmedveten hälsning: morgon <11 · dag · kväll >=17. */
export function halsningFranTimme(timme: number): string {
  if (timme < 11) return "God morgon";
  if (timme >= 17) return "God kväll";
  return "God dag";
}

// ── Text-generator (pedagogik-ton) ──────────────────────────────────────────

/**
 * Vågkartans läge som en andande fras — "vågkartan andas …".
 * Dominant vågform → sin egen ton; saknad data → null (meningen vilar mjukt).
 */
export function vagLageFranVagdata(v: BriefingVagdata | null): string | null {
  const s = v?.universumSammanfattning;
  if (!s) return null;
  const max = Math.max(s.impulsvag, s.korrigering, s.basbygge);
  if (max <= 0) return null;
  if (s.impulsvag === max) return "stigande impulser";
  if (s.korrigering === max) return "utvilande korrigeringar";
  return "tålmodigt basbygge";
}

/**
 * Den personliga morgonmeningen.
 * Mall: "God morgon, Nivå X — vågkartan andas [läge] och din vecka väntar med [nästa]."
 * Varje del degraderar mjukt: utan vågdata vilar kartan, utan nästa steg
 * väntar dagen med ett färskt pass. Aldrig dömande — alltid välkommen.
 */
export function morgonMening(delar: {
  halsning: string;
  niva: number;
  vagLage?: string | null;
  nastaText?: string | null;
  streak?: number;
}): string {
  const vag = delar.vagLage
    ? `vågkartan andas ${delar.vagLage}`
    : "vågkartan vilar tills dagens mätning";
  const nasta = delar.nastaText
    ? `din vecka väntar med ${delar.nastaText}`
    : "din dag väntar med ett färskt pass";
  const svans =
    delar.streak && delar.streak >= 7
      ? " Vanan sitter — kedjan bär dig idag."
      : delar.streak && delar.streak >= 1
        ? " En dag i taget — kedjan växer med dig."
        : "";
  return `${delar.halsning}, Nivå ${delar.niva} — ${vag} och ${nasta}.${svans}`;
}

// ── Insamlare ───────────────────────────────────────────────────────────────

/**
 * Veckoplanens nästa rad: första oklara rad från och med idag;
 * annars veckans första oklara rad; annars null. Planen körs på klienten
 * (lokaldata) och fallbackar mjukt på servern.
 */
function nastaVeckorad(): BriefingVeckoNasta | null {
  const rader = raknaVeckoPlan();
  const idagIndex = (new Date().getDay() + 6) % 7; // måndag = 0
  const medDagIndex = rader.map((rad) => ({
    rad,
    dagIndex: DAGAR.indexOf(rad.dag),
  }));
  const kommande = medDagIndex.find(({ rad, dagIndex }) => !rad.klar && dagIndex >= idagIndex);
  const vald = kommande ?? medDagIndex.find(({ rad }) => !rad.klar);
  if (!vald) return null;
  const { dag, aktivitet, minut, typ, lank } = vald.rad;
  return { dag, aktivitet, minut, typ, lank };
}

/** Kort "nästa"-text till morgonmeningen — kursen eller veckoraden, tyckt fint. */
export function nastaTextFranBriefing(b: Briefing): string | null {
  if (b.veckoNasta) {
    const aktivitet = b.veckoNasta.aktivitet.replace(/^(Fördjupning|Nästa steg|Kurs|Resan fortsätter): /u, "");
    return `${aktivitet} (${b.veckoNasta.minut} min, ${b.veckoNasta.dag.toLowerCase()})`;
  }
  if (b.nastaKurs) return b.nastaKurs.titel;
  return null;
}

/**
 * Räkna ihop morgon-briefingen — allt ur lokaldata, allt graceful.
 * Async av symmetri (komponenten await:ar); någon nätträff sker aldrig här.
 */
export async function raknaBriefing(): Promise<Briefing> {
  try {
    const xp = lasXP();
    const streak = lasStreak();
    const klara = lasKlaraKurser();
    const tips = raknaKurstips({ antal: 1 });
    const nastaKurs = tips[0]
      ? { slug: tips[0].slug, titel: tips[0].titel }
      : null;

    const briefing: Briefing = {
      niva: nivaFranXP(xp),
      xp,
      streak: { antal: streak.antal, basta: streak.basta },
      klaraKurser: Array.isArray(klara) ? klara.length : 0,
      nastaKurs,
      veckoNasta: nastaVeckorad(),
      vagdata: null, // TOM — komponenten fyller via /api/vagscan/senaste
      mening: "",
    };

    briefing.mening = morgonMening({
      halsning: halsningFranTimme(new Date().getHours()),
      niva: briefing.niva,
      vagLage: null,
      nastaText: nastaTextFranBriefing(briefing),
      streak: briefing.streak.antal,
    });

    return briefing;
  } catch {
    // Ogripbar lokaldata → en varm, tom briefing (komponenten visar skeleton-läge)
    return {
      niva: 1,
      xp: 0,
      streak: { antal: 0, basta: 0 },
      klaraKurser: 0,
      nastaKurs: null,
      veckoNasta: null,
      vagdata: null,
      mening: morgonMening({
        halsning: halsningFranTimme(new Date().getHours()),
        niva: 1,
        vagLage: null,
        nastaText: null,
        streak: 0,
      }),
    };
  }
}
