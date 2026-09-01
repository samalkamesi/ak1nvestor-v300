"use client";

/**
 * SPACED REPETITION — SM-2 (SuperMemo 2) enligt Ebbinghaus glömskekurva.
 * KortUnderlag: data/spaced-repetition.json (100 kort, 5 kategorier).
 * Status persist i localStorage — ingen server behövs.
 * Princip: poängen FÖRTJÄNAS — +5 XP per kort svarat Bra/Lätt (en gång per kort och dag).
 */

import kortData from "../../data/spaced-repetition.json";

export type SRKort = {
  id: string;
  framsida: string;
  baksida: string;
  kategori: string;
  svårighet: number;
};

export type SRKortStatus = {
  facit: number;        // SM-2 ease factor (start 2.5, min 1.3)
  intervall: number;    // dagar till nästa repetition
  repetitioner: number;
  nastRepetition: string | null; // ISO-datum (YYYY-MM-DD) eller null = aldrig sedd
};

type SRState = { [kortId: string]: SRKortStatus };

const STATE_NYCKEL = "ak1a-sr-v1";
const XP_LOCK_NYCKEL = "ak1a-sr-xp-v1"; // { "2026-09-01": ["sr-001", ...] }

export const ALLA_KORT: SRKort[] = (kortData.kort as SRKort[]).map((k) => ({
  id: k.id,
  framsida: k.framsida,
  baksida: k.baksida,
  kategori: k.kategori,
  svårighet: k.svårighet,
}));

export const SR_KATEGORIER = Array.from(new Set(ALLA_KORT.map((k) => k.kategori)));

function idag(): string {
  return new Date().toISOString().slice(0, 10);
}

function lasState(): SRState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STATE_NYCKEL) || "{}");
  } catch {
    return {};
  }
}

function sparaState(s: SRState) {
  try {
    localStorage.setItem(STATE_NYCKEL, JSON.stringify(s));
  } catch {
    /* quota — ignoreras */
  }
}

export function statusFor(kortId: string): SRKortStatus {
  const s = lasState();
  return s[kortId] || { facit: 2.5, intervall: 0, repetitioner: 0, nastRepetition: null };
}

/** Kort som är förfallna idag (aldrig sedda eller nastRepetition <= idag) */
export function forfallnaKort(limit = 10): SRKort[] {
  const d = idag();
  const s = lasState();
  return ALLA_KORT
    .filter((k) => {
      const st = s[k.id];
      return !st || !st.nastRepetition || st.nastRepetition <= d;
    })
    .sort((a, b) => a.svårighet - b.svårighet) // lättaste först
    .slice(0, limit);
}

/**
 * SM-2-bedömning. kvalitet: 0–5 (används: Svår=2, Bra=4, Lätt=5).
 * q < 3 → repetitioner nollställs, intervall = 1 dag.
 * q >= 3 → intervall växer: 1 → 6 → föregående × facit.
 */
export function bedomKort(kortId: string, kvalitet: number): SRKortStatus {
  const s = lasState();
  const st: SRKortStatus = s[kortId] || { facit: 2.5, intervall: 0, repetitioner: 0, nastRepetition: null };

  // EF-uppdatering enligt SM-2: EF' = EF + (0.1 − q·(0.08 + (5−q)·0.02))
  const nyFacit = Math.max(1.3, st.facit + (0.1 - kvalitet * (0.08 + (5 - kvalitet) * 0.02)));

  let nyIntervall: number;
  let nyRepetitioner: number;
  if (kvalitet < 3) {
    nyRepetitioner = 0;
    nyIntervall = 1;
  } else {
    nyRepetitioner = st.repetitioner + 1;
    nyIntervall = nyRepetitioner === 1 ? 1 : nyRepetitioner === 2 ? 6 : Math.round(st.intervall * nyFacit);
  }
  nyIntervall = Math.min(nyIntervall, 365);

  const nast = new Date();
  nast.setDate(nast.getDate() + nyIntervall);

  const ny: SRKortStatus = {
    facit: Math.round(nyFacit * 100) / 100,
    intervall: nyIntervall,
    repetitioner: nyRepetitioner,
    nastRepetition: nast.toISOString().slice(0, 10),
  };
  s[kortId] = ny;
  sparaState(s);
  return ny;
}

/** +5 XP en gång per kort och dag — bara första gången (returnerar true om XP förtjänades) */
export function forjanaXP(kortId: string): boolean {
  if (typeof window === "undefined") return false;
  const d = idag();
  let lock: Record<string, string[]> = {};
  try {
    lock = JSON.parse(localStorage.getItem(XP_LOCK_NYCKEL) || "{}");
  } catch {
    lock = {};
  }
  const sedda = lock[d] || [];
  if (sedda.includes(kortId)) return false;
  lock[d] = [...sedda, kortId];
  // behåll bara 60 dagar av lås
  const dagar = Object.keys(lock).sort().slice(-60);
  const trimmad: Record<string, string[]> = {};
  dagar.forEach((k) => (trimmad[k] = lock[k]));
  try {
    localStorage.setItem(XP_LOCK_NYCKEL, JSON.stringify(trimmad));
  } catch {
    /* ignoreras */
  }
  return true;
}

export type SRStatistik = {
  totalt: number;
  sedda: number;
  beharskade: number;   // intervall ≥ 21 dagar = sitter i långt minne
  forfallna: number;    // due idag
  repetitionerTotalt: number;
  nastaNasta: string | null; // nästa dag kort förfaller
};

export function srStatistik(): SRStatistik {
  const s = lasState();
  const d = idag();
  const status = ALLA_KORT.map((k) => s[k.id]).filter(Boolean) as SRKortStatus[];
  const framtida = status
    .map((st) => st.nastRepetition)
    .filter((n): n is string => Boolean(n) && n > d)
    .sort();
  return {
    totalt: ALLA_KORT.length,
    sedda: status.length,
    beharskade: status.filter((st) => st.intervall >= 21).length,
    forfallna: forfallnaKort(1000).length,
    repetitionerTotalt: status.reduce((sum, st) => sum + st.repetitioner, 0),
    nastaNasta: framtida[0] || null,
  };
}
