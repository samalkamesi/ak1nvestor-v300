/**
 * AK1A-NOTISER — den tysta mentorn (notismotor, helt lokal).
 *
 * Filosofi (pedagogik.ts): vi hjälper — vi dömer aldrig. En notis är ett
 * välkomnande "vi sparar din plats", aldrig "du ligger efter". Därför
 * återanvänder de automatiska texterna pedagogik-rösten (uppmuntran) och
 * pratar om vad som VÄNTAR — aldrig vad som missats.
 *
 * LAGRING (klient-sida, localStorage):
 *   - ak1a-notiser-v1     → Notis[] (senaste först)
 *   - ak1a-notiser-dag-v1 → { [typ]: "YYYY-MM-DD" } — daglig avstängning:
 *                           max EN automatisk notis per typ per dag.
 *   - ak1a-nyheter-top    → LÄSES av typ "nyhet" (skrivs av Senaste nytt/
 *                           Nyhetscentralen): dagens högsta påverkannyhet.
 *
 * ARKITEKTUR: servern (GET /api/notiser) levererar levande underlag (dagens
 * pass-aktie + vågkartans sammanfattning — saker som bara servern kan läsa);
 * genereraAutomatiskaNotiser() på klienten avgör vilka som gäller eleven
 * (streak, nivå, pass klarat) och FÄSTER dem här i localStorage.
 *
 * SSR-säkert: allt localStorage-beroende är try/cattat och vaktat mot
 * `window` — på servern är lasNotiser tom och generatorn en no-op.
 */

import { lasStreak, niva } from "./member-local";
import { uppmuntran } from "./pedagogik";
import { ekosystemPuls, omtankeTillaten } from "./omtanke-motor";

// ── Typer ────────────────────────────────────────────────────────────────────

/** En notis i centret. ikon = emoji, lank = intern route (ej extern URL). */
export type Notis = {
  id: string;
  rubrik: string;
  text: string;
  ikon: string;
  typ: "streak" | "pass" | "fas2" | "vagkarta" | "nyhet" | "omtanje" | "info";
  lank?: string;
  skapad: number;
  last?: boolean;
};

/** Server-levererat underlag (GET /api/notiser) — levande data eleven själv
 *  inte kan räkna fram: dagens pass-aktie och vågkartans sammanfattning. */
export type NotisUnderlag = {
  datum: string;
  pass?: { ticker: string; namn: string } | null;
  vagkarta?: { sammanfattning: string; genererad?: string } | null;
};

const NYCKEL = "ak1a-notiser-v1";
const DAG_NYCKEL = "ak1a-notiser-dag-v1";

/** Standard-golvet för rensaGamla: en månads historik räcker gott. */
const STANDARD_MAX_ALDER_DAGAR = 30;

// ── Lagring (privathjälpmedel) ───────────────────────────────────────────────

function lasRaa(): Notis[] {
  try {
    const rå = localStorage.getItem(NYCKEL);
    if (!rå) return [];
    const lista = JSON.parse(rå) as Notis[];
    return Array.isArray(lista) ? lista.filter((n) => n && typeof n.id === "string") : [];
  } catch {
    return [];
  }
}

function sparaRaa(lista: Notis[]) {
  try {
    localStorage.setItem(NYCKEL, JSON.stringify(lista.slice(0, 100)));
  } catch {
    /* privat läge / kvot fullt — inte fatalt */
  }
}

function lasDagsregister(): Partial<Record<Notis["typ"], string>> {
  try {
    const rå = localStorage.getItem(DAG_NYCKEL);
    return rå ? (JSON.parse(rå) as Partial<Record<Notis["typ"], string>>) : {};
  } catch {
    return {};
  }
}

function sparaDagsregister(reg: Partial<Record<Notis["typ"], string>>) {
  try {
    localStorage.setItem(DAG_NYCKEL, JSON.stringify(reg));
  } catch {
    /* ignoreras */
  }
}

function nyttId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Dagens datum i samma UTC-konvention som streak och quiz-låsen
 *  (new Date().toISOString().slice(0, 10)) — inga tidszons-race. */
export function dagensDatum(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Hela dagar mellan två YYYY-MM-DD (b − a); NaN-säker med 0 som fallback. */
function dagarMellan(a: string, b: string): number {
  const t1 = Date.parse(a);
  const t2 = Date.parse(b);
  if (Number.isNaN(t1) || Number.isNaN(t2)) return 0;
  return Math.round((t2 - t1) / 86_400_000);
}

/** Lås-nyckel enligt quiz-konventionen (samma som dagens-pass.tsx). */
function lasLock(nyckel: string): boolean {
  try {
    return localStorage.getItem(nyckel) === "1";
  } catch {
    return false;
  }
}

/** "ak1a-nyheter-top" (skrivs av Senaste nytt-kortet och Nyhetscentralen):
 *  dagens högsta påverkannyhet → { dag: "YYYY-MM-DD", rubrik, paverkan }.
 *  Lib:et är klientside och kan inte hämta flödet självt — notis-typ "nyhet"
 *  byggs enbart ur detta minne. Defensive: ogiltig/gammal data → null. */
const NYHETER_TOPP_NYCKEL = "ak1a-nyheter-top";
const NYHET_TROSKEL_PAVERKAN = 70;

type NyhetsTopp = { dag: string; rubrik: string; paverkan: number };

function lasNyhetsTopp(): NyhetsTopp | null {
  try {
    const rå = localStorage.getItem(NYHETER_TOPP_NYCKEL);
    if (!rå) return null;
    const t = JSON.parse(rå) as Record<string, unknown>;
    const rubrik = typeof t.rubrik === "string" ? t.rubrik.trim() : "";
    const paverkan =
      typeof t.paverkan === "number" && Number.isFinite(t.paverkan) ? Math.round(t.paverkan) : 0;
    // dag som "YYYY-MM-DD" — accepterar även datum/tid-fält från framtida skrivare
    let dag = typeof t.dag === "string" ? t.dag : typeof t.datum === "string" ? t.datum : "";
    if (!dag && typeof t.tid === "number" && Number.isFinite(t.tid)) {
      dag = new Date(t.tid).toISOString().slice(0, 10);
    }
    if (!dag || !rubrik || !/^\d{4}-\d{2}-\d{2}$/.test(dag)) return null;
    return { dag, rubrik, paverkan };
  } catch {
    return null;
  }
}

// ── Publikt API ──────────────────────────────────────────────────────────────

/** Alla notiser, senaste först. Tom lista på servern/vid fel. */
export function lasNotiser(): Notis[] {
  if (typeof window === "undefined") return [];
  return lasRaa().sort((a, b) => b.skapad - a.skapad);
}

/**
 * Skapa och fäst en notis. Manuella anrop (typ "info") går alltid igenom —
 * dags-gränsen gäller enbart de automatiska (se genereraAutomatiskaNotiser).
 */
export function skapaNotis(n: Omit<Notis, "id" | "skapad">): void {
  if (typeof window === "undefined") return;
  skapaIntern(n);
}

/** Intern: skapar och returnerar notisen (eller null vid ogiltig input). */
function skapaIntern(n: Omit<Notis, "id" | "skapad">): Notis | null {
  if (typeof window === "undefined") return null;
  if (!n || typeof n.rubrik !== "string" || !n.rubrik.trim()) return null;
  const notis: Notis = {
    ...n,
    rubrik: n.rubrik.trim().slice(0, 120),
    text: (n.text || "").trim().slice(0, 400),
    id: nyttId(),
    skapad: Date.now(),
    last: false,
  };
  sparaRaa([notis, ...lasRaa()]);
  return notis;
}

/** Markera en notis som läst (ingen-op om id saknas). */
export function markeraLast(id: string): void {
  if (typeof window === "undefined") return;
  sparaRaa(lasRaa().map((n) => (n.id === id ? { ...n, last: true } : n)));
}

/** Markera ALLA som lästa — notis-centrets "Markera alla lästa". */
export function markeraAllaLasta(): void {
  if (typeof window === "undefined") return;
  sparaRaa(lasRaa().map((n) => ({ ...n, last: true })));
}

/** Radera hela listan — dags-registret behålls så att dagens automatiska
 *  notiser inte återföds direkt efter en rensning (max 1 per typ per dag). */
export function rensaAlla(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(NYCKEL);
  } catch {
    /* ignoreras */
  }
}

/** Radera notiser äldre än maxAlderDagar (standard 30; 0 = allt äldre än nu).
 *  Returnerar antal borta. */
export function rensaGamla(maxAlderDagar?: number): number {
  if (typeof window === "undefined") return 0;
  const dagar =
    typeof maxAlderDagar === "number" && Number.isFinite(maxAlderDagar)
      ? Math.max(0, maxAlderDagar)
      : STANDARD_MAX_ALDER_DAGAR;
  const grans = Date.now() - dagar * 86_400_000;
  const lista = lasRaa();
  const kvar = lista.filter((n) => typeof n.skapad === "number" && n.skapad >= grans);
  if (kvar.length !== lista.length) sparaRaa(kvar);
  return lista.length - kvar.length;
}

/** Antal olästa — siffran i notisklockans röda badge. */
export function raknaOlasta(): number {
  if (typeof window === "undefined") return 0;
  return lasRaa().filter((n) => !n.last).length;
}

// ── Automatiska notiser (triggas av NotisCenter vid sidvisning) ──────────────

/**
 * Genererar + fäster dagens automatiska notiser utifrån underlaget och eleven
 * lokala state (streak, nivå, pass-lås). Returnerar de NYSS skapade notiserna
 * — NotisCenter använder dem för push-notis och service worker-meddelande.
 *
 * Regler (alla med pedagogik-rösten — tips, aldrig tvingan):
 *   streak   — senaste aktivitet > 1 dag sedan → streaken väntar
 *   pass     — dagens quiz-lås olåst → Dagens Pass väntar med dagens aktie
 *   fas2     — nivå ≥ 25 → redo för Fas 2 (18 fundamentala mästarverk)
 *   vagkarta — dagens autonom vågmätning finns → sammanfattningen är klar
 *   nyhet    — "ak1a-nyheter-top" (från Senaste nytt/Nyhetscentralen) har en
 *              nyhet från idag med paverkan ≥ 70 → "Värdefull nyhet" väntar
 *
 * DUBBEL-SKYDD mot spam: max en per typ per dag, vaktat av BOTH dags-registret
 * AND en genomskanning av redan fästa notiser skapade idag.
 */
export function genereraAutomatiskaNotiser(underlag?: NotisUnderlag | null): Notis[] {
  if (typeof window === "undefined") return [];

  const u: NotisUnderlag = underlag ?? { datum: dagensDatum() };
  const idag = dagensDatum();
  const startIdag = Date.parse(idag) || 0;

  const kandidater: Array<Omit<Notis, "id" | "skapad">> = [];

  // 1 · STREAK — gap på mer än en hel dag sedan senaste aktiviteten.
  //    (senast = igår → streaken lever fortfarande, inget påtvingande)
  const s = lasStreak();
  if (s.senast && dagarMellan(s.senast, idag) > 1) {
    kandidater.push({
      typ: "streak",
      ikon: "🔥",
      rubrik: "Din streak väntar",
      text: `En kurs idag håller den levande. ${uppmuntran("aterkomst")}`,
      lank: "/kurser",
    });
  }

  // 2 · DAGENS PASS — dagens huvud-fråga olåst → påminnelse med dagens aktie.
  const aktie = u.pass?.namn || u.pass?.ticker || "";
  if (!lasLock(`ak1a-quiz-dagens-pass-${u.datum}`)) {
    kandidater.push({
      typ: "pass",
      ikon: "🎯",
      rubrik: "Dagens Pass",
      text: aktie
        ? `Dagens Pass väntar: ${aktie} — 5 minuter räcker.`
        : "Dagens Pass väntar — 5 minuter räcker.",
      lank: "/dagens-pass",
    });
  }

  // 3 · FAS 2 — nivå 25 = hela Fas 1 substantiellt genomgånget.
  if (niva() >= 25) {
    kandidater.push({
      typ: "fas2",
      ikon: "🎓",
      rubrik: "Nivå 25 nådd",
      text: "Du är redo för Fas 2 — 18 fundamentala mästarverk väntar.",
      lank: "/fas2-ansok",
    });
  }

  // 4 · VÅGKARTAN — servern läser den autonoma mätningen; finns en från idag
  //     är sammanfattningen klar att hälsas (band, aldrig pil).
  if (u.vagkarta?.sammanfattning) {
    kandidater.push({
      typ: "vagkarta",
      ikon: "🌊",
      rubrik: "Dagens vågkarta",
      text: `Dagens vågmätning är klar: ${u.vagkarta.sammanfattning}.`,
      lank: "/vagfundament",
    });
  }

  // 5 · NYHET — Senaste nytt/Nyhetscentralen sparar dagens tyngsta nyhet i
  //     localStorage ("ak1a-nyheter-top"); lib:et kan inte hämta flödet själv
  //     (klientside), så notisen byggs ur minnet. Bara från idag + paverkan ≥ 70.
  const nyhetsTopp = lasNyhetsTopp();
  if (nyhetsTopp && nyhetsTopp.dag === idag && nyhetsTopp.paverkan >= NYHET_TROSKEL_PAVERKAN) {
    kandidater.push({
      typ: "nyhet",
      ikon: "📰",
      rubrik: "Värdefull nyhet",
      text: nyhetsTopp.rubrik,
      lank: "/nyheter",
    });
  }

  // 6 · OMTANKE — ekosystemets nervsystem (omtanke-motor.ts) härleder
  //     klientens läge FÖRE frågan: oro i chatten, fastnad, återkomst,
  //     ny utan start. Max en per 24 h (motorns egen cooldown + dagsregistret).
  //     Kärnan i kunddirektivet: "veta vad klienten vill innan den tänker".
  try {
    if (omtankeTillaten()) {
      const puls = ekosystemPuls();
      if (puls.omtanke) {
        const o = puls.omtanke;
        kandidater.push({
          typ: "omtanje",
          ikon: "🤍",
          rubrik: "Vi har tänkt på dig",
          text: o.notisText,
          lank: o.lank,
        });
      }
    }
  } catch {
    /* omtanke-lagret får aldrig bryta notiserna */
  }

  // DUBBEL-SKYDD: dags-registret + redan fästa notiser av samma typ idag.
  const register = lasDagsregister();
  const befintliga = lasRaa();
  const skapade: Notis[] = [];

  for (const k of kandidater) {
    if (register[k.typ] === idag) continue; // skydd 1 — registret
    const redanIdag = befintliga.some(
      (n) => n.typ === k.typ && typeof n.skapad === "number" && n.skapad >= startIdag
    );
    if (redanIdag) continue; // skydd 2 — själva listan

    const n = skapaIntern(k);
    if (n) {
      skapade.push(n);
      befintliga.push(n);
      register[k.typ] = idag;
    }
  }

  if (skapade.length > 0) sparaDagsregister(register);
  return skapade;
}
