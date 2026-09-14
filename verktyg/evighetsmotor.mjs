#!/usr/bin/env node
/**
 * EVIGHETSMOTORN (våg 147) — "så den aldrig slocknar igen"
 * =====================================================================
 * Kunddirektiv 2026-09-14 (efter bilder på iteration 15 + 67 nya
 * meddelanden): "bygga vidare så den aldrig slocknar igen."
 *
 * Den sista otäckta slockningsrisken: målet rapporterar aktivt men
 * iterationen FRYSER (turn hängd, agent sysslolös, kö tom) — inget larm
 * täcker det (hjärtat :x1 återaktiverar bara SAKNAT mål, kraschvakten
 * :x4 bara pm2-omstartsmönster, pulsvakten bara HTTP). Motorn mäter
 * RÖRELSE (mal-status iteration + uppdaterad-tidsstämpel) och kickar
 * agenten med en vaktprompt vid stillastående — alltid med bränsle ur
 * data/infra/evighetskatalog.md (kön kan aldrig bli tom).
 *
 * Schema: pumpor-daemonen min%10==8 (xx:08, :18, :28, …).
 * Regler: kundens PAUS (pausad=true) respekteras HELT — motorn tiger;
 * tak 1 vaktprompt/25 min (state-fil); pumpor skriver ALDRIG i
 * git-spårade filer (state + logg bor i data/vakten/).
 */
import fs from "node:fs";

const NYCKELN = "ADMIN" + "_PASSWORD";
const BAS = process.env.AK1A_BAS_URL || "http://localhost:3000";
const ROT = "/home/ak1a/AK1";
const STATE = `${ROT}/data/vakten/evighetsmotor-state.json`;
const LOGG = `${ROT}/data/vakten/evighetsmotor.log`;
const STILLESTÅND_MS = 20 * 60_000; // ingen händelse på 20 min + ingen turn
const PROMPT_TAK_MS = 25 * 60_000; // max 1 vaktprompt per 25 min

function lasPass() {
  try {
    const rad = fs
      .readFileSync(`${ROT}/.env.production.local`, "utf8")
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
    return {};
  }
}

function sparaState(s) {
  try {
    fs.mkdirSync(`${ROT}/data/vakten`, { recursive: true });
    fs.writeFileSync(STATE, JSON.stringify({ ...s, senastKontroll: new Date().toISOString() }, null, 2));
  } catch {
    /* state får aldrig krascha motorn */
  }
}

function logga(rad) {
  const stampel = new Date().toISOString().slice(11, 19);
  console.log(`${stampel} ${rad}`);
  try {
    const svans = fs.readFileSync(LOGG, "utf8").split("\n");
    svans.push(`${new Date().toISOString()} ${rad}`);
    fs.writeFileSync(LOGG, svans.slice(-200).join("\n") + "\n");
  } catch {
    /* logg är bäst-förmåga */
  }
}

async function malStatus(pass) {
  for (let försök = 1; försök <= 2; försök++) {
    try {
      const r = await fetch(`${BAS}/api/studio/mal/status`, {
        headers: { "x-admin-password": pass },
        signal: AbortSignal.timeout(15_000),
      });
      if (r.ok) return (await r.json());
    } catch {
      /* retry */
    }
    await new Promise((s) => setTimeout(s, 5000));
  }
  return null;
}

async function skickaVaktprompt(pass, text) {
  for (let försök = 1; försök <= 2; försök++) {
    try {
      const r = await fetch(`${BAS}/api/studio/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pass },
        body: JSON.stringify({ prompt: text }),
        signal: AbortSignal.timeout(30_000),
      });
      if (r.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((s) => setTimeout(s, 8000));
  }
  return false;
}

// ── huvud ────────────────────────────────────────────────────────────────────

const pass = lasPass();
if (!pass) {
  logga("FEL: admin-nyckel kunde ej läsas — avslutar");
  process.exit(0);
}

const m = await malStatus(pass);
if (!m) {
  logga("mål-status OSVARBAR (två försök) — hjärtat :x1 äger återaktivering; loggar och avslutar");
  process.exit(0);
}

const state = lasState();
state.kontroller = (state.kontroller ?? 0) + 1;

if (m.pausad) {
  logga("målet PAUSAT av kunden — motorn tiger (paus är heligt)");
  sparaState(state);
  process.exit(0);
}
if (!m.aktiv) {
  // Hjärtat :x1 + ronden återaktiverar saknade mål — motorn duplicerar inte
  // det jobbet utan bara vittnar (undvik konkurrerande malSatt-krockar).
  logga("målet INAKTIVT — lämnas åt hjärtat :x1/ronden");
  sparaState(state);
  process.exit(0);
}

const ålderMs = typeof m.uppdaterad === "number" ? Date.now() - m.uppdaterad : null;
const stilla = ålderMs !== null && ålderMs > STILLESTÅND_MS && m.pagaendeTurn !== true;
const promptTidig = typeof state.sistaVaktprompt === "number" && Date.now() - state.sistaVaktprompt < PROMPT_TAK_MS;

logga(
  `iteration ${m.iteration ?? "?"} · ålder ${ålderMs === null ? "?" : Math.round(ålderMs / 60000)} min · turn ${m.pagaendeTurn ? "pågår" : "nej"}${stilla ? " · STILLASTÅENDE" : ""}${promptTidig ? " · prompt-tak aktiv" : ""}`,
);

if (stilla && !promptTidig) {
  const minuter = Math.round(ålderMs / 60000);
  const ok = await skickaVaktprompt(
    pass,
    `EVIGHETSMOTORN (våg 147, kontroll :x8): iteration ${m.iteration ?? "?"} har varit stillastående i ${minuter} min utan pågående turn — kunddirektivet är "bygga vidare så den aldrig slocknar igen". VERKSTÄLL NU: (1) läs data/forskning/PIPELINE-KO.md — finns pågående våg? Fortsätt den. (2) Kön tom/tunn? Välj nästa våg ur data/infra/evighetskatalog.md (rotera spår, minst 3 nya poster bokade i PIPELINE-KO) — granskningskön (7 m9 + 8 SEO + kvartalsrapporter) är förstahandsval när den icke-tom. (3) Verkställ: ≤3 Agent-tool direkt, 4+ uppgifter = agentfabriks-manifest (data/vakten/agentfabrik/ko/, se AGENTS.md § AGENTFABRIKEN). (4) Avsluta med worklog-rad + beslutsminne-rad. ALDRIG R2-ytor (priser/publicering/domän/nycklar).`,
  );
  state.sistaVaktprompt = Date.now();
  state.vaktprompter = (state.vaktprompter ?? 0) + 1;
  logga(ok ? "VAKTPROMPT skickad (agenten kickad)" : "VAKTPROMPT MISSLYCKADES (två försök) — nästa :x8 försöker igen");
} else if (stilla && promptTidig) {
  logga("stillastående men prompt-tak aktiv — avvaktar (agenten har fått sin kick)");
}

sparaState(state);
