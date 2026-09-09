"use client";

/**
 * MEDLEM-PROGRESS KLIENT — den klientständiga halvan av L2-synket (våg 87,
 * kontrakt §B: "localStorage förblir cache (L2-linjen)").
 *
 * DUBBEL-SKRIVNING (§C.5–6): varje XP-skrivare (kurs-quiz, kurs-steg,
 * NivaBar) skriver LOKALT (member-local — offline-cache, gästar-lägets
 * sanning) och SKUGG-POSTAR till /api/medlem/progress fire-and-forget när
 * nätet finns. Gästens POST avvisas tyst av servern (401) — gästen får
 * ALDRIG ett fel i UI: beteendet "gäst = bara lokal" följer gratis.
 *
 * Hydrering-egisen (KursGate) och migreringsbannern läser GET — en rundtur
 * bär både session och progress (§C.4). Tokens bor i httpOnly-kakor och
 * hanteras uteslutande av servern — denna fil ser ALDRIG en token.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { lasKlaraKurser, lasStjarnor, lasXP } from "./member-local";

// ── Typer (speglar serverns MedlemProgress) ──────────────────────────────────

export type MedlemProgressAggregat = {
  xp: number;
  stjarnor: number;
  klaraKurser: string[];
  importGjord: boolean;
};

export type MedlemProgressSvar =
  | { inloggad: false }
  | { inloggad: true; progress: MedlemProgressAggregat };

// ── GET: session + progress i EN rundtur (egisen enda beroende) ─────────────

/**
 * lasMedlemProgressKlient — GET /api/medlem/progress. Ogiltigt svar, nät-
 * verksfel eller okänd form ⇒ { inloggad: false } (TYST — egisen renderar
 * då gästvyn; en flackande session får aldrig krascha kurssidan).
 */
export async function lasMedlemProgressKlient(): Promise<MedlemProgressSvar> {
  try {
    const res = await fetch("/api/medlem/progress", { cache: "no-store" });
    if (!res.ok) return { inloggad: false };
    const kropp = (await res.json()) as Record<string, unknown> | null;
    if (!kropp || typeof kropp !== "object" || kropp.inloggad !== true) {
      return { inloggad: false };
    }
    const p = kropp.progress as Partial<MedlemProgressAggregat> | undefined;
    if (!p || typeof p !== "object") return { inloggad: false };
    return {
      inloggad: true,
      progress: {
        xp: typeof p.xp === "number" && Number.isFinite(p.xp) ? Math.max(0, Math.floor(p.xp)) : 0,
        stjarnor: typeof p.stjarnor === "number" && Number.isFinite(p.stjarnor) ? Math.max(0, Math.floor(p.stjarnor)) : 0,
        klaraKurser: Array.isArray(p.klaraKurser) ? p.klaraKurser.filter((s): s is string => typeof s === "string") : [],
        importGjord: p.importGjord === true,
      },
    };
  } catch {
    return { inloggad: false };
  }
}

// ── Lokal progress (migreringsflaggan — "finns något att importera?") ───────

/** Sant när enheten bär lokal progress (XP/stjärnor/klara kurser — §A.2). */
export function harLokalProgress(): boolean {
  return lasXP() > 0 || lasStjarnor() > 0 || lasKlaraKurser().length > 0;
}

// ── Skugg-POST:ar (fire-and-forget — ALDRIG await:ad av UI) ─────────────────

/**
 * skugga — POST med keepalive (överlever navigation); fel SVÄLJS tyst.
 * Klassen är medvetet primitiv: skuggan får aldrig blockera belöningen.
 */
function skugga(body: Record<string, unknown>): void {
  try {
    fetch("/api/medlem/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tyst — den lokala skrivningen är redan gjord */
  }
}

/** Rätt quiz-svar: skugga quiz:<slug>:<kap>:<i> (server fastställer 10 XP). */
export function synkaQuiz(slug: string, kap: number, i: number): void {
  skugga({ typ: "quiz", slug, kap, i });
}

/** Kurs klar: skugga kursklar:<slug> + stjarna:<slug> (50 XP + 1 ★). */
export function synkaKursklar(slug: string): void {
  skugga({ typ: "kursklar", slug });
}

// ── Importen (migreringsknappen — §A.3, ENDAST aggregat sänds) ──────────────

export type ImportResultat = { ok: boolean; fel?: string; redan?: boolean };

/**
 * importeraLokalProgress — läser lasXP/lasStjarnor/lasKlaraKurser och POSTAR
 * typ:"import" EN gång (servern nekar andra försöket med 409). Ingen e-post
 * sänds — authId identifierar kontot via httpOnly-sessionen. GDPR-minimering:
 * knapptrycket är det explicita samtycket.
 */
export async function importeraLokalProgress(): Promise<ImportResultat> {
  try {
    const res = await fetch("/api/medlem/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        typ: "import",
        xp: lasXP(),
        stjarnor: lasStjarnor(),
        klaraKurser: lasKlaraKurser(),
      }),
    });
    if (res.ok) return { ok: true };
    let fel = "Importen misslyckades — försök igen.";
    let redan = false;
    try {
      const kropp = (await res.json()) as { fel?: unknown } | null;
      if (kropp && typeof kropp.fel === "string") fel = kropp.fel;
    } catch {
      /* behåll fallback-texten */
    }
    if (res.status === 409) {
      redan = true;
      fel = "Din lokala progress är redan importerad.";
    }
    return { ok: false, fel, redan };
  } catch {
    return { ok: false, fel: "Nätverksfel — försök igen." };
  }
}
