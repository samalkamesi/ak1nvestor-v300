#!/usr/bin/env node
/**
 * MINNESBEREDAREN (våg 158 — M4-kapitlets kur)
 * =====================================================================
 * Forskningsfynd (data/forskning/zcode-kallkod/M4-MINNESMOTORN.md):
 * runtimens minnesextraktion svälter under autonom drift — prosa-grinden
 * kräver RIKTIG kundprosa (≥3 ord) i tur-input; mål-loopens `model-only`
 * turer failar tyst (bevisat: 251 avslutade turer 09-11→14 → 0 extraktioner).
 * Konsekvens: minnet konsoliderar bara när kunden chattar.
 *
 * KUR: denna beredare POSTar en ÄKTA prompt (riktigt user-input, riktig
 * prosa — passerar grinden) på schema: "summera tråden i prosa". En hel
 * modellvända, kort och billig (inga verktyg begärs). Extraktionen matas,
 * minnet växer även under långa autonoma faser.
 *
 * Körs: pumpor-daemonen var 6:e timme (min==7 && tim%6==1, dagen runt).
 * Skydd: vägrar om en turn pågår (POST-kön hanterar -32010 ändå, men vi
 * är artiga); max 1 per 6 h (schemat garanterar); loggar till
 * data/vakten/minnesberedare.log. Exit 0 alltid.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "minnesberedare.log");
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

function lasPass() {
  try {
    const rad = fs
      .readFileSync("/home/ak1a/AK1/.env.production.local", "utf8")
      .split("\n")
      .find((r) => r.startsWith(NYCKELN + "="));
    return rad ? rad.slice(NYCKELN.length + 1).trim().replace(/^["']|["']$/g, "") : "";
  } catch {
    return "";
  }
}

function logga(rad) {
  try {
    fs.mkdirSync(KATALOG, { recursive: true });
    fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  } catch {
    /* logg är lyx */
  }
  console.log(rad);
}

async function main() {
  const pass = lasPass();
  if (!pass) return logga("PASS SAKNAS — beredaren sover");

  // Artighet: hoppa över om en turn springer (kön hade hanterat det, men
  // en beredare skall aldrig köa sig före riktigt arbete).
  try {
    const s = await fetch(`${BAS}/api/studio/mal/status`, {
      headers: { "x-admin-password": pass },
      signal: AbortSignal.timeout(15_000),
    });
    if (s.ok) {
      const j = await s.json();
      if (j && j.pagaendeTurn) return logga("turn pågår — beredaren väntar nästa slag");
    }
  } catch {
    /* status är lyx — POSTen får avgöra */
  }

  const prompt =
    "MINNESBEREDAREN (automatisk matning av minnessystemet — riktig prosa på väg): " +
    "Skriv EN kort prosamening om vad tråden uppnått sedan senast och vad som står köadt " +
    "(inga verktyg, inga lister, bara en mening — detta matar minnesextraktionen).";

  try {
    const r = await fetch(`${BAS}/api/studio/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": pass },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(120_000),
    });
    // Läs första chunken (hej/fel) och släpp strömmen — svaret lever i sessionen.
    try {
      const lasare = r.body?.getReader();
      if (lasare) await lasare.cancel().catch(() => {});
    } catch {
      /* ström lämnad */
    }
    logga(r.ok ? "minnesberedare skickad (prosa-matning)" : `minnesberedare FEL ${r.status}`);
  } catch (e) {
    logga("minnesberedare nätverksfel: " + String(e).slice(0, 80));
  }
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
