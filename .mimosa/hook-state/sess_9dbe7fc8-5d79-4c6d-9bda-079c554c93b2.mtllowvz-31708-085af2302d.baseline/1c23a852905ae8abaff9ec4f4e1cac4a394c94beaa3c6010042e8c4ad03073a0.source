"use client";

/**
 * ANALYSBANKEN — elevens samlade verk (MEGA_PLAN_V3 Fas B: rapport-byggaren, steg 1).
 *
 * Banken är den gemensamma råvaran för redovisningsverkstan /rapporter: varje
 * analys eleven skapar — Superanalysen, Konfluensradarn, Net-net-skannern,
 * Vågfundament — landar här som EN rad med typ, titel, datum, sammanfattning
 * och hela analysens data som JSON-sträng (dataJson), så att rapportbyggaren
 * kan återge nyckeltal utan att känna motorernas interna format.
 *
 * LAGRING: localStorage "ak1a-analysbank-v1" (kap 50 rader, nyast först).
 * Sparade Superanalyser (lib/superanalys.ts, nyckel "ak1a-superanalys-sparade-v1")
 * importeras LIVE som rader vid varje läsning — banken äger dem aldrig själv,
 * så en redigerad analys speglas alltid i sin senaste skepnad.
 *
 * Hydration-säker: alla funktioner tystar på servern (tom lista / false).
 */

import {
  HORIZONTER,
  KATEGORIER,
  bedomning,
  lasSparade,
  raknaKategorier,
  raknaTotal,
  type SuperanalysData,
} from "./superanalys";

/** Typ av verk — vilken motor analysen föddes ur. */
export type BankTyp = "superanalys" | "konfluens" | "netnet" | "vagfundament";

/** En rad i analysbanken — elevens samlade verk. */
export type BankRad = {
  id: string;
  typ: BankTyp;
  ticker?: string;
  titel: string;
  /** ISO-datum (YYYY-MM-DD). */
  datum: string;
  /** Kort sammanfattning i naturlig text — visas i listan och i rapporten. */
  sammanfattning: string;
  /** Hela analysens data som JSON-sträng — rapporten läser nyckeltal härur. */
  dataJson: string;
};

const NYCKEL = "ak1a-analysbank-v1";
const TYPER: readonly BankTyp[] = ["superanalys", "konfluens", "netnet", "vagfundament"];
const MAX_RADER = 50;

const sv = (n: number) => n.toFixed(1).replace(".", ",");

/** Normaliserar en rå rad från localStorage (feltolerant — ogiltig → null). */
function normaliseraRad(rå: unknown): BankRad | null {
  if (typeof rå !== "object" || rå === null) return null;
  const r = rå as Partial<BankRad>;
  if (typeof r.id !== "string" || !r.id) return null;
  if (typeof r.titel !== "string" || !r.titel) return null;
  if (typeof r.datum !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(r.datum)) return null;
  if (typeof r.dataJson !== "string") return null;
  return {
    id: r.id,
    typ: TYPER.includes(r.typ as BankTyp) ? (r.typ as BankTyp) : "superanalys",
    ticker: typeof r.ticker === "string" && r.ticker ? r.ticker : undefined,
    titel: r.titel,
    datum: r.datum.slice(0, 10),
    sammanfattning: typeof r.sammanfattning === "string" ? r.sammanfattning : "",
    dataJson: r.dataJson,
  };
}

/** Läser endast bankens EGNA rader (utom superanalyser — de importeras live). */
function lasEgnaRader(): BankRad[] {
  if (typeof window === "undefined") return [];
  try {
    const lista = JSON.parse(localStorage.getItem(NYCKEL) || "[]");
    if (!Array.isArray(lista)) return [];
    return lista.map(normaliseraRad).filter((r): r is BankRad => r !== null);
  } catch {
    return [];
  }
}

/** Projektion: en sparad Superanalys → bankrad (beräknas ur senaste datan). */
function superanalysTillRad(d: SuperanalysData): BankRad {
  const total = raknaTotal(d.poang);
  const band = bedomning(total);
  const kat = raknaKategorier(d.poang);
  const starkast = KATEGORIER.reduce((a, b) => (kat[b.id] > kat[a.id] ? b : a));
  const svagast = KATEGORIER.reduce((a, b) => (kat[b.id] < kat[a.id] ? b : a));
  const vagAntal = HORIZONTER.filter((h) => d.vagor[h.id] !== "").length;
  const namn = d.ticker ? `${d.bolag} (${d.ticker.toUpperCase()})` : d.bolag;
  return {
    id: d.id,
    typ: "superanalys",
    ticker: d.ticker || undefined,
    titel: `Superanalys — ${namn}`,
    datum: d.datum,
    sammanfattning: [
      `Totalpoäng ${sv(total)}/100 — ${band.etikett}.`,
      `Starkast: ${starkast.namn} ${sv(kat[starkast.id])} · svagast: ${svagast.namn} ${sv(kat[svagast.id])}.`,
      vagAntal > 0
        ? `AK1TS: vågklass gissad för ${vagAntal} av 5 horisonter.`
        : "AK1TS: vågklasser ej gissade än.",
    ].join(" "),
    dataJson: JSON.stringify(d),
  };
}

/**
 * Hela analysbanken: egna rader (konfluens/netnet/vagfundament + framtida
 * verk) sammanvävd med LIVE-importerade sparade Superanalyser — dublettfria
 * (live-projektionen vinner) och sorterade på datum, nyast först.
 */
export function lasAnalysbank(): BankRad[] {
  if (typeof window === "undefined") return [];
  const importerade = lasSparade().map(superanalysTillRad);
  const importeradeId = new Set(importerade.map((r) => r.id));
  const egna = lasEgnaRader().filter((r) => !importeradeId.has(r.id));
  return [...egna, ...importerade].sort(
    (a, b) => b.datum.localeCompare(a.datum) || b.id.localeCompare(a.id)
  );
}

/**
 * Sparar (skapar eller uppdaterar på id) en rad i banken. Returnerar true om
 * raden var NY — samma kontrakt som superanalys.ts:s sparaAnalys.
 */
export function sparaIAnalysbank(rad: BankRad): boolean {
  if (typeof window === "undefined") return false;
  const ren = normaliseraRad(rad);
  if (!ren) return false;
  const befintliga = lasEgnaRader();
  const varNy = !befintliga.some((r) => r.id === ren.id);
  const nyLista = varNy
    ? [ren, ...befintliga].slice(0, MAX_RADER)
    : befintliga.map((r) => (r.id === ren.id ? ren : r));
  try {
    localStorage.setItem(NYCKEL, JSON.stringify(nyLista));
  } catch {
    return false; // fullt/minne — ignoreras
  }
  return varNy;
}
