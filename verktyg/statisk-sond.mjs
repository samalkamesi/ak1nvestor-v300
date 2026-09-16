#!/usr/bin/env node
// statisk-sond.mjs — detekterar "HTML 200 men bygg-tillgångar trasiga"
// (spår 8, s8-u1 omgång 5, 2026-09-16 — incidentens egna instrumentlucka).
//
// BAKGRUND (bevis: incidenten 2026-09-16 10:02–10:2x UTC): prod-synkens
// bygge OOM-dödades mitt i .next-omskrivningen → .next/static/chunks blev
// TOM medan den körande pm2-processen fortsatte leverera HTML (ISR/minne)
// som refererade de borta chunk-hasharna → ALL CSS/JS svarade 500 i ~20+ min
// KUNDSYNLIGT (ostylade sidor), medan SAMTLIGA hälsokontroller var gröna:
// pulsvakten (GET / = 200), kraschvakten (status online), prod-synkens
// deploy-verifikation ("prod 200"), gränsnittsvaktens regel A (basHalsa 200)
// — ALLA blinda: ingen hämtar de STATISKA TILLGÅNGARNA som HTML:en själv
// referenserar. Detta verktyg stänger luckan: HTML:en är kontraktet —
// varje _next/static-ref den bär SKA svarar 200.
//
// Metod: hämta en sida (standard /), extrahera ALLA _next/static-referenser
// (href/src-attribut), HEAD:a varje unik tillgång (GET-fallback om servern
// ej stödjer HEAD), kräv 200. Felklasser:
//   gron        — sidan och alla refererade tillgångar 200
//   trasig-bygg — HTML 200 men ≥1 tillgång ≠ 200 (half-deployed/tömd .next:
//                 kunden ser ostylad sida; lagning = ombygge under
//                 deploylåset, prod-synkens/kraschvaktens ägande)
//   sida-nere   — HTML ej 200 (pulsvaktens klass; sonden rapporterar ändå
//                 för komplett lägesbild)
// 0 npm-beroenden. Bas MÅSTE vara localhost (middleware-whitelist,
// AGENTS.md) när servern mäts; https://lab.ak1nvestor.com för kundvy.
//
// Körning: node verktyg/statisk-sond.mjs [--bas=http://localhost:3000] [--sida=/kurser]
// Skriver: data/vakten/statisk-sond-SENASTE.json + sammanfattning på stdout.
// Exit: 0 = grönt, 1 = fynd, 2 = argumentfel.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ── Ren logik (exporteras för verktyg/testa-statisk-sond.mjs) ───────────────
export function extraheraStatiskaRefs(html) {
  const refs = new Set();
  const re = /(?:href|src)="([^"]*_next\/static\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html || ""))) refs.add(m[1]);
  return [...refs];
}

export function bedom({ sidaStatus, tillgangar }) {
  // tillgangar: [{ url, status }] — status 0 = hämtning misslyckades
  const trasiga = (tillgangar || []).filter((t) => t.status !== 200);
  if (sidaStatus !== 200) {
    return {
      status: "sida-nere",
      orsak: `sidan svarade ${sidaStatus} — pulsvaktens felklass, tillgångarna omöjliga att kontrakts testa`,
      trasiga: [],
    };
  }
  if (trasiga.length === 0) {
    return { status: "gron", orsak: `sidan och samtliga ${tillgangar.length} refererade bygg-tillgångar svarar 200`, trasiga: [] };
  }
  return {
    status: "trasig-bygg",
    orsak: `HTML 200 men ${trasiga.length}/${tillgangar.length} refererade bygg-tillgångar fel — kundsynligt ostylat; lagning = ombygge under deploylåset (prod-synk/kraschvakt äger)`,
    trasiga,
  };
}

// ── Huvudprogram (endast direktkörning — import dödar ALDRIG processen,
//    testen ska kunna läsa de exporterade funktionerna) ─────────────────────
const AR_MAIN = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

async function huvud() {
const args = process.argv.slice(2);
function argument(namn, standard) {
  const i = args.indexOf(`--${namn}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : standard;
}
const BAS = argument("bas", "http://localhost:3000").replace(/\/$/, "");
const SIDA = argument("sida", "/");
const TIDSGRANS_MS = 15_000;

const t0 = Date.now();
const url = BAS + SIDA;

async function hamta(metod, mal) {
  try {
    const r = await fetch(mal, {
      method: metod,
      headers: { "User-Agent": "AK1A-StatiskSond/1.0" },
      signal: AbortSignal.timeout(TIDSGRANS_MS),
    });
    return r.status;
  } catch {
    return 0;
  }
}

let sidaStatus = 0;
let html = "";
try {
  const r = await fetch(url, {
    headers: { "User-Agent": "AK1A-StatiskSond/1.0" },
    signal: AbortSignal.timeout(TIDSGRANS_MS),
  });
  sidaStatus = r.status;
  html = sidaStatus === 200 ? await r.text() : "";
} catch {
  sidaStatus = 0;
}

const refs = extraheraStatiskaRefs(html);
const tillgangar = [];
for (const ref of refs) {
  const absolut = ref.startsWith("http") ? ref : BAS + ref;
  let status = await hamta("HEAD", absolut);
  if (status === 405 || status === 501) status = await hamta("GET", absolut); // HEAD ej stödd
  tillgangar.push({ url: ref, status });
}

const dom = bedom({ sidaStatus, tillgangar });
const rapport = {
  ts: new Date().toISOString(),
  bas: BAS,
  sida: SIDA,
  sidaStatus,
  antalTillgangar: tillgangar.length,
  status: dom.status,
  orsak: dom.orsak,
  trasiga: dom.trasiga,
  varaktighetMs: Date.now() - t0,
};

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const katalog = path.join(ROT, "data", "vakten");
fs.mkdirSync(katalog, { recursive: true });
fs.writeFileSync(path.join(katalog, "statisk-sond-SENASTE.json"), JSON.stringify(rapport, null, 2));

console.log(`STATISK-SOND: ${dom.status.toUpperCase()} — ${dom.orsak}`);
if (dom.trasiga.length) for (const t of dom.trasiga) console.log(`  ✗ ${t.status} ${t.url}`);
console.log(`Rapport: ${path.join(katalog, "statisk-sond-SENASTE.json")}`);
process.exit(dom.status === "gron" ? 0 : 1);
}

if (AR_MAIN) await huvud();
