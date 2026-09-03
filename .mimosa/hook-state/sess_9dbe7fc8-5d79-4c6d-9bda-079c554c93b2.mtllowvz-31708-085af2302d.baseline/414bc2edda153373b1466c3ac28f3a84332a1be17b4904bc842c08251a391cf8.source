"use client";

/**
 * Medlems-session + XP/nivå lokalt (v1 — ingen serverautentisering:enkelt och
 * integritetsvänligt; nivå = min(100, xp/100), stjärnor per avslutad övning).
 */

export type Medlem = { id: string; email: string; namn?: string };

const M_KEY = "ak1a-member";
const XP_KEY = "ak1a-xp";
const STJARNOR_KEY = "ak1a-stjarnor";
const KLARA_KEY = "ak1a-klara-kurser";

export function lasMedlem(): Medlem | null {
  try {
    const rå = localStorage.getItem(M_KEY);
    return rå ? (JSON.parse(rå) as Medlem) : null;
  } catch {
    return null;
  }
}

export function sparaMedlem(m: Medlem) {
  try {
    localStorage.setItem(M_KEY, JSON.stringify(m));
  } catch {}
}

export function loggaUt() {
  try {
    localStorage.removeItem(M_KEY);
  } catch {}
}

export function lasXP(): number {
  try {
    return Number(localStorage.getItem(XP_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function lasStjarnor(): number {
  try {
    return Number(localStorage.getItem(STJARNOR_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Lägger till XP; returnerar ny nivå (1–100). Varje XP-förtjänad aktivitet
 *  matar också streak-räknaren (glömskekurvan älskar daglig närvaro). */
export function addXP(delta: number): number {
  const ny = lasXP() + delta;
  try {
    localStorage.setItem(XP_KEY, String(ny));
  } catch {}
  rapporteraAktivitet();
  return nivaFranXP(ny);
}

// ── Streak (daglig aktivitetskedja, Duo-stil) ───────────────────────────────

const STREAK_KEY = "ak1a-streak";

export type Streak = { antal: number; basta: number; senast: string };

export function lasStreak(): Streak {
  if (typeof window === "undefined") return { antal: 0, basta: 0, senast: "" };
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || "null") || { antal: 0, basta: 0, senast: "" };
  } catch {
    return { antal: 0, basta: 0, senast: "" };
  }
}

/** Registrera dagens aktivitet: igår → +1, idag → oförändrat, gap → nollställ. */
export function rapporteraAktivitet(): Streak {
  const s = lasStreak();
  const idag = new Date().toISOString().slice(0, 10);
  const igår = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let antal = s.antal;
  if (s.senast === idag) {
    return s; // redan räknad idag
  }
  antal = s.senast === igår ? s.antal + 1 : 1;
  const ny: Streak = { antal, basta: Math.max(antal, s.basta), senast: idag };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(ny));
  } catch {}
  return ny;
}

export function addStjarna(): number {
  const ny = lasStjarnor() + 1;
  try {
    localStorage.setItem(STJARNOR_KEY, String(ny));
  } catch {}
  return ny;
}

/** Nivå 1–100: 100 XP per nivå. */
export function nivaFranXP(xp: number): number {
  return Math.max(1, Math.min(100, Math.floor(xp / 100) + 1));
}

export function niva(): number {
  return nivaFranXP(lasXP());
}

/** Fas 2-lock öppnas vid nivå 25 (Fas 1 genomgånget substantiellt). */
export function fas2Upplast(): boolean {
  return niva() >= 25;
}

export function markeraKursKlar(slug: string): boolean {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(KLARA_KEY) || "[]");
    if (list.includes(slug)) return false;
    list.push(slug);
    localStorage.setItem(KLARA_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function lasKlaraKurser(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KLARA_KEY) || "[]");
  } catch {
    return [];
  }
}
