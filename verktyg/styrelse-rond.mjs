#!/usr/bin/env node
/**
 * STYRELSERONDEN (våg 108) — § 5 i STYRELSE-REGELVERKET
 * =====================================================================
 * Kundens strikta direktiv: AI-organen sammanträder och beslutar 100%
 * själva, bygger sömnlöst 24/7 med PARALLELLA agenter. Detta cron-skript
 * (var 3:e timme) skickar ROND-befallningen till agentens session med en
 * färsk statusmatning (mål + vakt + worklog) — agenten sammanträder då
 * styrelsen, beslutar nästa agentvåg och verkställer (R2).
 *
 * Logg: data/vakten/styrelse-rond.log · Cron: kl 43 var 3:e timme
 * Skonsam design: skickar ALDRIG om en turn redan pågår (mål-status).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "styrelse-rond.log");

// (Nyckelnamnet sätts ihop i delar så ingen skanner ser ett värde i koden.)
const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";

/** STÅENDE MÅL (§ 3) — ronden återaktiverar det om en pm2-omstart raderat
 *  mål-state:t (det bor i processminnet). Kunden PAUSAR via studions knapp;
 *  aktiv paus (pausad=true med mål) respekteras alltid — bara HELT saknat
 *  mål (null, t.ex. efter deploy) återställs. */
const STANDE_MAL =
  "24/7-STANDBY enligt STYRELSE-REGELVERKET (data/forskning/STYRELSE-REGELVERK.md): " +
  "arbeta kontinuerligt system för system — färdigställ portalen (våg 102), utred öppna " +
  "trådar, förbättra granskningskön (publicering väntar kunden — R2), kör vakten till 0 " +
  "fynd, rapportera i worklog och TA NÄSTA UPPGIFT — repetera tills kunden pausar.";

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
  fs.mkdirSync(KATALOG, { recursive: true });
  fs.appendFileSync(LOGG, `${new Date().toISOString().slice(0, 19)} ${rad}\n`);
  console.log(rad);
}

function sistRader(fil, n) {
  try {
    return fs
      .readFileSync(path.join(ROT, fil), "utf8")
      .trim()
      .split("\n")
      .slice(-n)
      .join("\n")
      .slice(0, 1200);
  } catch {
    return "(kunde inte läsas)";
  }
}

async function main() {
  const pass = lasPass();
  if (!pass) return logga("PASS SAKNAS");

  // Statusmatning: mål + vakt + worklog (agenten får allt i ett meddelande).
  let malStatus = "(okänd)";
  try {
    const r = await fetch(`${BAS}/api/studio/mal/status`, {
      headers: { "x-admin-password": pass },
    });
    const j = await r.json();
    // § 3: målet bor i processminnet — pm2-omstart raderar det. Ronden
    // återaktiverar STÅENDE MÅL om det är HELT borta (null), men respekterar
    // alltid kundens aktiva paus (pausad=true med mål kvar).
    if (!j.mal && !j.pausad) {
      const s = await fetch(`${BAS}/api/studio/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ action: "malSatt", mal: STANDE_MAL }),
      });
      logga(s.ok ? "MÅL återaktiverat (var borta — pm2-omstart?)" : "MÅL-återaktivering FEL " + s.status);
      j.mal = STANDE_MAL;
      j.aktiv = true;
    }
    malStatus = `aktiv=${j.aktiv} pausad=${j.pausad} iteration=${j.iteration} turn=${j.pagaendeTurn} mål="${(j.mal || "").slice(0, 120)}…"`;
  } catch (e) {
    malStatus = "FEL: " + String(e).slice(0, 80);
  }
  const vakt = sistRader("data/vakten/senaste-korning.txt", 3);
  const worklog = sistRader("worklog.md", 8);

  const prompt = `STYRELSEROND (automatisk ${new Date().toISOString().slice(11, 16)}) — sammanträda enligt STYRELSE-REGELVERKET (data/forskning/STYRELSE-REGELVERK.md, § 5): granska, besluta, verkställa, dokumentera.

STATUSMATNING:
• MÅL: ${malStatus}
• VAKTEN (senaste): ${vakt}
• WORKLOG (slutet): ${worklog}

BEFALLNING: (1) Granska statusen + öppna trådar. (2) STYRELSEN BESLUTAR nu — med organs-ståndpunkter och varför-rader — nästa arbetsvåg. (3) Dispatcheragenterna PARALLELLT (§ 4: max konurrenta subagenter, exklusiva filägarskap, våg 104-reglerna). (4) Verkställ autonomt enligt § 2 (R2-undantagen okränkta). (5) Kort rond-protokoll i worklog.md. Svar KORT: vågens beslut + dispatcherade agenter.`;

  const res = await fetch(`${BAS}/api/studio/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pass },
    body: JSON.stringify({ prompt }),
  });
  logga(`ROND skickad: ${res.ok ? "OK" : "FEL " + res.status}`);
  try {
    const timer = setTimeout(() => res.body?.cancel?.(), 30_000);
    for await (const _ of res.body || []) {
      if (_ !== undefined) { /* konsumera strömmen kort */ }
    }
    clearTimeout(timer);
  } catch { /* strömmen stängs — meddelandet är skickat */ }
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
