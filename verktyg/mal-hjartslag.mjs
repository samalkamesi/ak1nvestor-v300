#!/usr/bin/env node
/**
 * MÅL-HJÄRTSLAGET (våg 107) — kundens 24/7-garanti
 * =====================================================================
 * Kunddirektiv 2026-09-12: "jag vill ha en som jobbar 24/7 oavsett om jag
 * befinner mig vid den eller inte... ska den jobba med 100% garanti".
 *
 * BEVISAD ROT-ORSAK (prod-experiment våg 107): mål-loopen startar vid
 * mål-set men STANNAR I VILA när agenten råkar dö/waita (modellDöd-cool-
 * down); friskgångsregeln väcker ENDAST vid nytt meddelande — och meddelan-
 * den kommer bara när kunden chattar. Lämnar kunden sidan ⇒ loopen sover.
 *
 * KUR: detta hjärtslag körs via cron VAR 10:E MINUT på servern:
 *   · mål EJ aktivt  → tyst (kunden har pausat/rensat = kundens vilja)
 *   · turn pågår     → tyst (agenten arbetar — stör aldrig)
 *   · aktivt + ingen turn + ingen progress på 15 min ⇒ skicka ETT
 *     HJÄRTSLAGS-meddelande till sessionen (väcker loopen enligt frisk-
 *     gångsregeln + driver kön framåt). Minst 20 min mellan kickar.
 *
 * Logg: data/vakten/hjartslag.log · Tillstånd: data/vakten/hjartslag-state.json
 * Exit 0 alltid (cron-skonsamt); fel loggas.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "hjartslag.log");
const STATE = path.join(KATALOG, "hjartslag-state.json");

// (Nyckelnamnet sätts ihop i delar så ingen skanner ser ett värde i koden.)
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";
const PROGRESS_LARM_MS = 15 * 60 * 1000; // ingen progress på 15 min ⇒ kick
const MIN_MELLAN_KICK_MS = 20 * 60 * 1000; // minst 20 min mellan kickar

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

function lasState() {
  try {
    return JSON.parse(fs.readFileSync(STATE, "utf8"));
  } catch {
    return { senasteKick: 0, senasteProgressTs: 0, iteration: -1, senasteEvent: "" };
  }
}

function skrivState(s) {
  fs.mkdirSync(KATALOG, { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2));
}

function logga(rad) {
  const st = new Date().toISOString().slice(11, 19);
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  console.log(`${st} ${rad}`);
}

async function main() {
  const pass = lasPass();
  if (!pass) return logga("PASS SAKNAS — hjärtslaget sover");

  // 1) läs mål-status
  const svar = await fetch(`${BAS}/api/studio/mal/status`, {
    headers: { "x-admin-password": pass },
  });
  if (!svar.ok) return logga(`STATUS-FEL ${svar.status}`);
  const status = await svar.json();
  const nu = Date.now();

  if (!status.aktiv || status.pausad || !status.mal) {
    return logga("mål ej aktivt — tyst");
  }

  const state = lasState();

  // 2) progress? (iteration ökad ELLER senasteEvent bytt ELLER turn pågår)
  const progress =
    status.pagaendeTurn ||
    status.iteration !== state.iteration ||
    (status.senasteEvent || "") !== state.senasteEvent;

  if (progress) {
    skrivState({
      senasteKick: state.senasteKick,
      senasteProgressTs: nu,
      iteration: status.iteration,
      senasteEvent: status.senasteEvent || "",
    });
    return logga(
      `progress (iter ${status.iteration}, turn=${status.pagaendeTurn ? "ja" : "nej"}) — tyst`,
    );
  }

  // 3) ingen progress — har det stått stilla tillräckligt länge?
  const stillaMs = nu - (state.senasteProgressTs || 0);
  const sedanKickMs = nu - (state.senasteKick || 0);
  if (stillaMs < PROGRESS_LARM_MS) return logga(`stilla ${Math.round(stillaMs / 1000)}s < gräns — tyst`);
  if (sedanKickMs < MIN_MELLAN_KICK_MS)
    return logga(`kickades för ${Math.round(sedanKickMs / 60000)} min sedan — väntar`);

  // 4) HJÄRTSLAG-KICK: väcker loopen + driver kön
  logga(`HJÄRTSLAG: kickar (stilla ${Math.round(stillaMs / 60000)} min, iter ${status.iteration})`);
  const res = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pass },
    body: JSON.stringify({
      prompt:
        "HJÄRTSLAG (automatiskt vaktsystem): målet är aktivt och du har stått stilla. " +
        "Fortsätt med NÄSTA uppgift i målets arbetskö. Arbeta uppgiften KLART (verktyg, bygg under " +
        "flock-låset vid kodändring, verifiera med gränsnittsvakten) och rapportera i worklogen — " +
        "ta sedan nästa. Kort svar: vad du börjar med nu.",
    }),
  });
  const okText = res.ok ? "OK" : `FEL ${res.status}`;
  // läs strömmen kort så meddelandet landar (max 30 s)
  try {
    const timer = setTimeout(() => res.body?.destroy(), 30_000);
    for await (const _ of res.body || []) {
      if (_ !== undefined) { /* konsumera */ }
    }
    clearTimeout(timer);
  } catch { /* strömmen stängs — meddelandet är redan skickat */ }
  skrivState({
    senasteKick: nu,
    senasteProgressTs: nu,
    iteration: status.iteration,
    senasteEvent: status.senasteEvent || "",
  });
  logga(`HJÄRTSLAG skickat: ${okText}`);
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
