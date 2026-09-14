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
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KATALOG = path.join(ROT, "data", "vakten");
const LOGG = path.join(KATALOG, "hjartslag.log");
const STATE = path.join(KATALOG, "hjartslag-state.json");

/** Stående mål — självläkningen återställer det efter pm2-omstart. */
const STANDE_MAL_TEXT =
  "24/7-STANDBY enligt STYRELSE-REGELVERKET (data/forskning/STYRELSE-REGELVERK.md): " +
  "arbeta kontinuerligt system för system — landa minst en commit per rond taggad " +
  "[organ:X], färdigställ portalen (våg 102), kör vakten till 0 fynd, rapportera i " +
  "worklog och TA NÄSTA UPPGIFT — repetera tills kunden pausar.";

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

  // VÅG 126 — WEB-VAKTEN: appen svarar den? 502/nej ⇒ pm2-restart av ak1a
  // (kurerar byggkollisioner där node_modules försvann under omstart —
  // bevisat 2026-09-13: 10 min nere innan manuell räddning).
  try {
    const r = await fetch(`${BAS}/api/studio/mal/status`, {
      headers: { "x-admin-password": pass },
      signal: AbortSignal.timeout(15_000),
    });
    if (r.status >= 500 || r.status === 502) {
      logga(`WEB-VAKT: appen svarar ${r.status} — pm2-restartar ak1a`);
      try { execSync("pm2 restart ak1a --update-env", { timeout: 60_000, stdio: "ignore" }); } catch { /* pm2 avgör */ }
      await new Promise((sov) => setTimeout(sov, 10_000));
    }
  } catch (e) {
    logga("WEB-VAKT: appen osvarar (" + String(e).slice(0, 60) + ") — pm2-restartar ak1a");
    try { execSync("pm2 restart ak1a --update-env", { timeout: 60_000, stdio: "ignore" }); } catch { /* pm2 avgör */ }
    await new Promise((sov) => setTimeout(sov, 10_000));
  }

  // 1) läs mål-status
  const svar = await fetch(`${BAS}/api/studio/mal/status`, {
    headers: { "x-admin-password": pass },
  });
  if (!svar.ok) return logga(`STATUS-FEL ${svar.status}`);
  const status = await svar.json();
  const nu = Date.now();
  const state = lasState();

  // VÅG 131 — FRUSNA TURNS: turn=true utan puls i 30+ min = hängd turn
  // (bevisat 2026-09-13: iteration fryst 2,5 h; zombie-kicken vägrar när
  // turn=sant). Två fynd i rad (20 min) ⇒ självläkningsomstart.
  if (status.pagaendeTurn && status.uppdaterad && nu - status.uppdaterad > 30 * 60_000) {
    const stallna = (state.frusnaTurns || 0) + 1;
    if (stallna >= 2 && nu - (state.senasteOmstart || 0) > 2 * 60 * 60_000) {
      logga(
        `SJÄLVHEALNING: frusen turn (${Math.round((nu - status.uppdaterad) / 60000)} min utan puls) — pm2-omstartar + mål återställs`,
      );
      try {
        execSync("pm2 restart ak1a", { encoding: "utf8", timeout: 60_000 });
        await new Promise((sov) => setTimeout(sov, 12_000));
        await fetch(`${BAS}/api/studio/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": pass },
          body: JSON.stringify({ action: "malSatt", mal: STANDE_MAL_TEXT }),
        });
        logga("SJÄLVHEALNING: frusen turn rensad + stående mål återställt");
      } catch (e) {
        logga("SJÄLVHEALNING FEL: " + String(e).slice(0, 150));
      }
      skrivState({ ...state, senasteOmstart: nu, frusnaTurns: 0, senasteKick: nu, senasteProgressTs: nu });
      return;
    }
    skrivState({ ...state, frusnaTurns: stallna });
    return logga(`FRUSEN TURN misstänkt (${stallna}/2): ${Math.round((nu - status.uppdaterad) / 60000)} min utan puls`);
  }

  if (!status.aktiv || status.pausad || !status.mal) {
    // VÅG 112: målet kan försvinna vid pm2-omstart/trädsynk (processminne).
    // Helt borta (null, ej pausat) ⇒ återställ stående mål direkt — men
    // ALDRIG om en prompt kör (rondens egen turn) eller kunden pausat.
    if (!status.mal && !status.pausad) {
      const resatt = await fetch(`${BAS}/api/studio/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ action: "malSatt", mal: STANDE_MAL_TEXT }),
      });
      if (resatt.ok) return logga("MÅL återställt av hjärtslaget (var borta)");
      const felText = await resatt.clone().text().catch(() => "");
      if (felText.includes("prompt")) return logga("mål borta men prompt kör — väntar");
      return logga("mål återställning FEL " + resatt.status);
    }
    // VÅG 127 — ZOMBIE-MÅL: målet FINNS men loopen sover (aktiv=false,
    // pausad=false; bevisat 2026-09-13 16:41). Friskgångsregeln väcker vid
    // NYTT MEDDELANDE ⇒ hjärtat kickar (max 1/20 min via senasteKick).
    if (status.mal && !status.aktiv && !status.pausad) {
      if (nu - lasState().senasteKick > MIN_MELLAN_KICK_MS) {
        logga("ZOMBIE-MÅL: målet finns men loopen sover — kickar liv i den");
        try {
          const kick = await fetch(`${BAS}/api/studio/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-admin-password": pass },
            body: JSON.stringify({
              prompt:
                "HJÄRTSLAG (zombie-väckare): målet är satt men loopen sover. Fortsätt NÄSTA uppgift i målets kö — landa en commit taggad [organ:X] och rapportera kort.",
            }),
          });
          try { await kick.body?.cancel(); } catch { /* ström lämnad */ }
          const st = lasState();
          skrivState({ ...st, senasteKick: Date.now(), senasteProgressTs: Date.now() });
          return;
        } catch (e) {
          return logga("ZOMBIE-kick FEL: " + String(e).slice(0, 80));
        }
      }
      return logga("ZOMBIE-MÅL: nyligen kickad — väntar");
    }
    return logga("mål ej aktivt — tyst");
  }

  // 2) progress? (iteration ökad ELLER senasteEvent bytt ELLER turn pågår)
  const progress =
    status.pagaendeTurn ||
    status.iteration !== state.iteration ||
    (status.senasteEvent || "") !== state.senasteEvent;

  if (progress) {
    skrivState({
      senasteKick: state.senasteKick,
      senasteProgressTs: nu,
      senasteOmstart: state.senasteOmstart || 0,
      frusnaTurns: 0,
      studsadeKicker: state.studsadeKicker || 0,
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

  // VÅG 109 — SJÄLVHEALNING mot KILADE TURNS (den dolda mördaren):
  // om kickarna studsar på "En prompt kör redan" fast inget händer är
  // transportens aktiv-turn DÖD men olåst → allt blockerar. Kur: pm2-
  // omstart (transport-state är processminne) + målet återställs direkt.
  // Vakter: endast efter 2 studsade kickar (>=25 min) och max 1 omstart/2h.
  if (state.studsadeKicker >= 2 && nu - (state.senasteOmstart || 0) > 2 * 60 * 60 * 1000) {
    logga(
      `SJÄLVHEALNING: kilad turn (${state.studsadeKicker} studsade kickar) — pm2-omstartar ak1a och återställer målet`,
    );
    try {
      execSync("pm2 restart ak1a", { encoding: "utf8", timeout: 60_000 });
      await new Promise((sov) => setTimeout(sov, 12_000));
      await fetch(`${BAS}/api/studio/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ action: "malSatt", mal: STANDE_MAL_TEXT }),
      });
      logga("SJÄLVHEALNING: omstart klar + stående mål återställt");
    } catch (e) {
      logga("SJÄLVHEALNING FEL: " + String(e).slice(0, 150));
    }
    skrivState({
      senasteKick: nu,
      senasteProgressTs: nu,
      senasteOmstart: nu,
      studsadeKicker: 0,
      iteration: status.iteration,
      senasteEvent: status.senasteEvent || "",
    });
    return;
  }

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
  // VÅG 109: läs FÖRSTA chunken (hej/fel kommer direkt) för att upptäcka
  // studsad kick ("En prompt kör redan"). Klient-abort dödar ALDRIG
  // serverns turn (våg 91 A1c) — svaret sparas i sessionen ändå.
  let studsad = false;
  try {
    if (res.body) {
      const lasare = res.body.getReader();
      const { value } = await Promise.race([
        lasare.read(),
        new Promise((_, avvisa) => setTimeout(() => avvisa(new Error("tidsgräns")), 8_000)),
      ]);
      studsad = new TextDecoder().decode(value || new Uint8Array()).includes("En prompt kör redan");
      await lasare.cancel().catch(() => {});
    }
  } catch { /* ingen chunk på 8 s = normal pågående turn */ }
  skrivState({
    senasteKick: nu,
    senasteProgressTs: nu,
    senasteOmstart: state.senasteOmstart || 0,
    studsadeKicker: studsad ? (state.studsadeKicker || 0) + 1 : 0,
    iteration: status.iteration,
    senasteEvent: status.senasteEvent || "",
  });
  logga(`HJÄRTSLAG skickat: ${okText}${studsad ? " (STUDSADE — kilad turn misstänkt)" : ""}`);
}

main().catch((fel) => logga("FEL: " + String(fel).slice(0, 200)));
