"use client";

/**
 * PRENUMERATION — klient-säker hjälpmodul för /prenumeration.
 *
 * Ansvarsområden:
 *  1. SERIALIZERBARA TYPER som speglar lasPriser() i
 *     src/lib/portfolj-forskning/korstabell-data.ts (servern läser
 *     data/portfolj-system/priser.json och skickar ner ren data — ALLA
 *     prisbelopp lever i JSON-filen, aldrig hårdkodade i komponenter).
 *  2. useFasRabatt — läs elevens fas-status ur member-local/kurs-access
 *     (ak1a-member + ak1a-fas2-override) EFTER montering: SSR-HTML:n visar
 *     alltid ordinarie pris och rabatten travas på i klienten (hydreringssäkert,
 *     samma mönster som Fas2Ansok).
 *  3. Pris-formatering sv-SE + rabattberäkning (avrundat till hela kronor).
 *  4. Aktiveringsintention i localStorage — nyckel
 *     "ak1a-prenumeration-intention-v1". Betallösningen är inte på plats än;
 *     intentionen är köpflödes-stommens minne fram till dess.
 *
 * ADMIN-NOTIFIERING (dokumenterat beslut): signal-bussens publiceraSignal
 * (src/lib/signal-bus.ts) är SERVER-SIDE och /api/signal POST kräver
 * x-admin-password för mottagare "admin" — admin-signaler får inte gå att
 * smida utifrån, och ett lösenord får aldrig läggas i klientkod. Därför:
 * AKTIVERINGSBEGÄRAN SPARAS ENBART I ELEVFNS LOCALSTORE + presenteras som
 * färdigifyllt e-postflöde till info@ak1nvestor.com (mänsklig aktivering).
 * När betalflödet byggs kan intentionen plockas upp härifrån.
 */

import { useEffect, useState } from "react";
import { harFas2Access, harFas3Access } from "@/lib/kurs-access";

// ── Typer (spegling av lasPriser()-utdata — måste hålla strukturell form) ────

export type PrenumerationNiva = {
  id: string;
  namn: string;
  prisManad: number;
  prisAr: number;
  beskrivning: string;
};

export type RabattFasInfo = {
  fas2: number;
  fas3: number;
  beskrivning: string;
};

// ── useFasRabatt — fas-statusdetektion efter montering ──────────────────────

export type FasStatus = "fas2" | "fas3" | null;

/**
 * Läs elevens fas-status och härled rabattanden ur priser.json.
 * fas3 är supermängd av fas2 (kurs-access.ts) — kontrollas i den ordningen.
 * Returnerar rabatt = 0 tills klienten monterats (SSR-neutral).
 */
export function useFasRabatt(rabattFas: RabattFasInfo): {
  hydrerad: boolean;
  fasStatus: FasStatus;
  /** Andel 0–1 ur priser.json (0 = ingen rabatt känns igen). */
  rabatt: number;
  harRabatt: boolean;
  /** Rabatten i hela procent, för visning (20 av 0.2). */
  rabattProcent: number;
} {
  const [fasStatus, setFasStatus] = useState<FasStatus>(null);
  const [hydrerad, setHydrerad] = useState(false);

  useEffect(() => {
    setFasStatus(harFas3Access() ? "fas3" : harFas2Access() ? "fas2" : null);
    setHydrerad(true);
  }, []);

  const rabatt =
    fasStatus === "fas3" ? rabattFas.fas3 : fasStatus === "fas2" ? rabattFas.fas2 : 0;
  return {
    hydrerad,
    fasStatus,
    rabatt,
    harRabatt: rabatt > 0,
    rabattProcent: Math.round(rabatt * 100),
  };
}

// ── Pris-hjälpare ────────────────────────────────────────────────────────────

/** "2 490 kr" — sv-SE-grupperat, avrundat till hela kronor. */
export function formateraKr(belopp: number): string {
  return `${Math.round(belopp).toLocaleString("sv-SE")} kr`;
}

/** Rabatterat pris, avrundat till hela kronor (249 × 0.8 → 199). */
export function rabatteratPris(pris: number, rabatt: number): number {
  return rabatt > 0 ? Math.round(pris * (1 - rabatt)) : pris;
}

/**
 * Hur många månader årspriset gör gratis (2 490 kr/år à 249 kr/mån → 2).
 * Returneras bara när det är ett helt antal ≥ 1 — annars null (vi hittar
 * aldrig på siffror; prisdata kan ändras av moderagenten).
 */
export function manaderGratis(prisManad: number, prisAr: number): number | null {
  if (!(prisManad > 0) || !(prisAr > 0)) return null;
  const diff = 12 - prisAr / prisManad;
  return Number.isInteger(diff) && diff >= 1 ? diff : null;
}

// ── Aktiveringsintention (localStorage) ──────────────────────────────────────

export const INTENTION_KEY = "ak1a-prenumeration-intention-v1";

export type PrenumerationIntention = {
  version: 1;
  nivaId: string;
  nivaNamn: string;
  period: "manad" | "ar";
  /** Ordinarie pris ur priser.json för vald period. */
  prisOrdinarie: number;
  /** Rabatterat pris om fas-rabatt kännas igen — annars null. */
  prisRabatterat: number | null;
  /** Rabattandelen 0–1 som gällde vid begäran. */
  rabattAndel: number;
  fasStatus: FasStatus;
  namn?: string;
  epost?: string;
  /** Frivillig nyhetsbrevscheck (VÅG 50): eleven vill ha morgon-briefingen
   *  + forskningsuppdateringar per mejl. Intentionen POSTas även till
   *  /api/email (typ=prenumeration-intention) och köas tills en mejl-
   *  leverantör konfigureras — se src/lib/email-sandare.ts. */
  nyhetsbrev?: boolean;
  /** ISO-timestamp för begäran. */
  skapad: string;
};

/** Status för nyhetsbrevs-intentionen (aktivera-panelens frivilliga check). */
export type PrenusbrevStatus = "" | "köad" | "skickad" | "fel";

/** Spara intention — returnerar true vid lyckad lagring. */
export function sparaPrenumerationIntention(i: PrenumerationIntention): boolean {
  try {
    localStorage.setItem(INTENTION_KEY, JSON.stringify(i));
    return true;
  } catch {
    return false;
  }
}

/** Läs senaste sparade intention — null om ingen finns/oförståelig data. */
export function lasPrenumerationIntention(): PrenumerationIntention | null {
  if (typeof window === "undefined") return null;
  try {
    const rå = localStorage.getItem(INTENTION_KEY);
    if (!rå) return null;
    const i = JSON.parse(rå) as PrenumerationIntention;
    return typeof i?.nivaId === "string" ? i : null;
  } catch {
    return null;
  }
}
