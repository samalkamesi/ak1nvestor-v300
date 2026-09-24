#!/usr/bin/env node
// ── SPRÅKKONTRAKTET (o156, spår 8 — svaret på o152 §restpost 2) ────────────────
//
// BAKGRUND (utredningen 2026-09-24): /en/data/nyckeltalsguide + /ar/… = 404
// bokades som restpost av o152 med ordalydelsen "vill utredas … innan något
// döms". Utredningens DOM: AVSIKT, ej defekt — guiden är våg 87:s svensk
// SEO-citeringsmagnet (svenska sökord, svenska decimaler, hårdkodad svenska),
// (en)/en/data + (ar)/ar/data har ALDRIG funnits (git-tomt = ingen
// regression), INGEN intern länk når den från en/ar-kontext (språklänkar
// byggs enbart via datasetPrefix(lang) inom speglade familjer — "länkarna
// stannar på samma språkyta"), och sitemap lovar den inte i något språk
// (o147:s livskontrakt förblev 0 fel). Enbart-sv är NORM för data-/verktygs-
// ytor (topplistan, portfolj-forskning, kalkylator …) medan KUNDRESAN är
// speglad (14 ytor vid o156). 404 på en ospeglad ytas språkvariant är alltså
// det KORREKTA svaret — samma klass som vaktens forvantade401 (o149).
//
// META-ROTORSAKAN till restpostens uppkomst: platsens språkstatus fanns
// ENDAST i huvuden (vågsdokument, git-historik) — varje sond/våg som råkar
// mäta en språkvariant av en ospeglad yta måste om-utreda från noll. Denna
// svit gör domens underlag MASKINLÄSBART och SJÄLVUNDERHÅLLANDE: kontraktet
// härleds ur filstrukturen (app/(huvud), (en)/en, (ar)/ar) — inga manuella
// register att glömma uppdatera när en spegel byggs eller rivs.
//
// KONTRAKT (tre regler):
//   R1 SPEGLAT: sv-rutt X där BÅDE (en)/en/X och (ar)/ar/X finns ⇒
//      GET /X, /en/X, /ar/X skall svara 200 (redirect bokförs, döms ej grönt).
//   R2 SV-ONLY (avsiktlig dom): sv-rutt utan spegel ⇒ språkvarianterna
//      GET /en/X, /ar/X förväntas svara 404 — det är KORREKT (ingen spegel
//      är byggd). Annat svar än 404 ⇒ OBS-varning: någons designändring
//      (t.ex. en global språk-redirect) är på väg att ändra kontraktet.
//   R3 ASYMMETRI: (en)/en/X utan (ar)/ar/X eller tvärtom ⇒ OBS-varning —
//      en påbörjad spegling som inte landat i båda språken.
//
//   Dynamiska rutter ([slug]/[bransch]/…) mäts EJ här — barnen ägs av
//   sitemap-livskontraktet (o147) och bolags-ledgern (o146).
//   429/5xx: omprov ×1; förblir 429 ⇒ "oprovad" (ALDRIG falsgrönt —
//   o147-precedensen). >10 % oprovade ⇒ exit 2.
//
// Exit: 0 = grönt (0 fel) · 1 = fel (R1-brrott eller rötter) · 2 = för litet
// mätt underlag. Rapport: data/vakten/sprakkontrakt-SENASTE.json.
//
// Användning: node verktyg/testa-sprakkontrakt.mjs [--bas=http://localhost:3000]
//             [--snabb]   (hoppar R2:s 404-verifiering — enbart R1+rötter)

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const HÄR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HÄR, "..");
const APP = path.join(ROT, "src", "app");

function lasArg(namn, standard) {
  const i = process.argv.indexOf(`--${namn}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : standard;
}
const BAS = lasArg("bas", "http://localhost:3000").replace(/\/$/, "");
const SNABB = process.argv.includes("--snabb");

let fel = 0;
let varningar = 0;
let oprovade = 0;
let mätta = 0;

function FAIL(msg) {
  fel++;
  console.error(`FEL: ${msg}`);
}
function VARN(msg) {
  varningar++;
  console.warn(`OBS: ${msg}`);
}
function PASS(msg) {
  console.log(`PASS: ${msg}`);
}

// ── KÄLLA: rutter ur filstrukturen ───────────────────────────────────────────

/** Alla page.tsx under en rot → rutt-sökvägar ("/blogg", "/data/nyckeltal…"). */
function lasRutter(rotRel) {
  const bas = path.join(APP, rotRel);
  const ut = [];
  if (!existsSync(bas)) return ut;
  const stack = [bas];
  while (stack.length) {
    const mapp = stack.pop();
    for (const post of readdirSafe(mapp)) {
      const full = path.join(mapp, post.name);
      if (post.isDirectory()) stack.push(full);
      else if (post.isFile() && post.name === "page.tsx") {
        const relativ = path.relative(bas, mapp);
        const segment = relativ.split(path.sep).filter(Boolean);
        ut.push("/" + segment.join("/"));
      }
    }
  }
  return ut;
}

function readdirSafe(mapp) {
  try {
    return readdirSync(mapp, { withFileTypes: true });
  } catch {
    return [];
  }
}

const svRutter = lasRutter("(huvud)");
const enRutter = lasRutter("(en)/en");
const arRutter = lasRutter("(ar)/ar");

/** true om rutten innehåller ett dynamiskt segment ([slug] etc). */
const arDynamisk = (r) => r.includes("[");

const svStatiska = svRutter.filter((r) => !arDynamisk(r));
const svDynamiska = svRutter.filter(arDynamisk);
const enMängd = new Set(enRutter);
const arMängd = new Set(arRutter);

const speglade = svRutter.filter((r) => enMängd.has(r) && arMängd.has(r));
const svOnly = svStatiska.filter((r) => !enMängd.has(r) && !arMängd.has(r));
const asymmetrier = [
  ...enRutter.filter((r) => !arMängd.has(r)).map((r) => ({ yta: r, saknas: "ar" })),
  ...arRutter.filter((r) => !enMängd.has(r)).map((r) => ({ yta: r, saknas: "en" })),
];

console.log(
  `KÄLLA: ${svRutter.length} sv-rutter (${svStatiska.length} statiska, ${svDynamiska.length} dynamiska — ej mätta här) · ` +
    `${enRutter.length} en · ${arRutter.length} ar · ${speglade.length} speglade · ${svOnly.length} sv-only (avsikt) · ${asymmetrier.length} asymmetrier`,
);

// ── MÄTNING ──────────────────────────────────────────────────────────────────

/** GET med timeout + 429-omprov. Returnerar {status} — ALDRIG falsgrönt.
 *  Trailing slash trimmas: Next kanonicerar /en (icke /en/) — sonden skall
 *  mäta kanon form (första körningen: /en/ gav 308 mot /en:s 200). */
async function mät(sökväg) {
  const url = BAS + (sökväg === "/" ? "/" : sökväg.replace(/\/+$/, ""));
  for (let försök = 1; försök <= 2; försök++) {
    try {
      const kontroll = new AbortController();
      const timer = setTimeout(() => kontroll.abort(), 15_000);
      const res = await fetch(url, { redirect: "manual", signal: kontroll.signal });
      clearTimeout(timer);
      if (res.status === 429 && försök === 1) {
        await new Promise((l) => setTimeout(l, 2_000));
        continue;
      }
      mätta++;
      if (res.status === 429) {
        oprovade++;
        return { status: 429, oprovad: true };
      }
      return { status: res.status };
    } catch (e) {
      if (försök === 2) {
        mätta++;
        oprovade++;
        return { status: 0, oprovad: true, fel: String(e && e.message || e) };
      }
      await new Promise((l) => setTimeout(l, 1_000));
    }
  }
  return { status: 0, oprovad: true };
}

function domStatus(s) {
  if (s.oprovad) return "OPROVAD";
  if (s.status === 200) return "GRÖN";
  if (s.status >= 300 && s.status < 400) return `REDIRECT-${s.status}`;
  return `AVVIKELSE-${s.status}`;
}

const rapport = {
  ts: new Date().toISOString(),
  bas: BAS,
  snabb: SNABB,
  källa: { svRutter, enRutter, arRutter, dynamiskaEjMätta: svDynamiska },
  dom: {
    nyckeltalsguide:
      "/data/nyckeltalsguide är AVSIKTLIGT enbart-sv (o156-utredningen: våg 87:s svenska citeringsmagnet; speglar har aldrig funnits; ingen intern länk- eller sitemap-väg kan nå en 404-varianten). 404 på /en|/ar-data/nyckeltalsguide är det KORREKTA svaret.",
  },
  rötter: {},
  speglade: [],
  svOnly: [],
  asymmetrier,
};

// Rötter: hem + språk-rötter — kontraktets fundament.
for (const [namn, sökväg] of [
  ["sv-hem", "/"],
  ["en-rot", "/en"],
  ["ar-rot", "/ar"],
]) {
  const r = await mät(sökväg);
  rapport.rötter[namn] = { ...r, dom: domStatus(r) };
  if (r.status === 200) PASS(`rot ${sökväg} → 200`);
  else if (r.oprovad) VARN(`rot ${sökväg} kunde ej mätas (${r.status})`);
  else FAIL(`rot ${sökväg} → ${r.status} (förväntat 200)`);
}

// R1: speglade ytor ⇒ 200 ×3.
for (const yta of speglade) {
  if (arDynamisk(yta)) continue;
  const sv = await mät(yta);
  const en = await mät("/en" + yta);
  const ar = await mät("/ar" + yta);
  const dom = [sv, en, ar].map(domStatus).join("/");
  rapport.speglade.push({ yta, sv: sv.status, en: en.status, ar: ar.status, dom });
  if (sv.status === 200 && en.status === 200 && ar.status === 200) {
    PASS(`speglat ${yta} → 200/200/200`);
  } else if ([sv, en, ar].some((x) => x.oprovad)) {
    VARN(`speglat ${yta} → ${dom} (oprovat — mät om)`);
  } else {
    FAIL(`speglat ${yta} → ${dom} (kontraktet kräver 200/200/200)`);
  }
}

// R2: sv-only-ytor ⇒ språkvarianterna SKALL 404 (avsiktlig dom, o156).
if (!SNABB) {
  for (const yta of svOnly) {
    const en = await mät("/en" + yta);
    const ar = await mät("/ar" + yta);
    const dom = `${domStatus(en)}/${domStatus(ar)}`;
    const rad = { yta, en: en.status, ar: ar.status, dom };
    // "/" (sv-hem) hamnar här via lasRutter — dess språkvarianter ÄR rötterna.
    if (yta === "/") {
      rapport.rötter["sv-only-notis"] = "hem-rutten mäts under rötter";
      continue;
    }
    rapport.svOnly.push(rad);
    if (en.status === 404 && ar.status === 404) PASS(`sv-only ${yta} → en/ar 404 (korrekt: ingen spegel byggd)`);
    else if ([en, ar].some((x) => x.oprovad)) VARN(`sv-only ${yta} → ${dom} (oprovat)`);
    else VARN(`sv-only ${yta} → ${dom} — icke-404 på ospeglad yta: designändring på väg? (o156-dom: 404 är korrekt)`);
  }
} else {
  rapport.svOnly = "ej mätt (--snabb)";
}

// R3: asymmetrier.
for (const a of asymmetrier) {
  if (arDynamisk(a.yta)) continue;
  VARN(`asymmetri: ${a.yta} saknar ${a.saknas}-spegel — påbörjad spegling?`);
}

// ── DOM + RAPPORT ────────────────────────────────────────────────────────────

const andelOprovad = mätta > 0 ? oprovade / mätta : 1;
rapport.sammanfattning = { fel, varningar, mätta, oprovade, andelOprovad: Number(andelOprovad.toFixed(4)) };

const rapportSökväg = path.join(ROT, "data", "vakten", "sprakkontrakt-SENASTE.json");
try {
  mkdirSync(path.dirname(rapportSökväg), { recursive: true });
  writeFileSync(rapportSökväg, JSON.stringify(rapport, null, 2) + "\n");
  console.log(`\nRapport: ${path.relative(ROT, rapportSökväg)}`);
} catch (e) {
  console.error(`Kunde ej skriva rapport: ${e && e.message}`);
}

console.log(
  `\nSPRÅKKONTRAKTET: ${fel} fel · ${varningar} OBS · ${oprovade}/${mätta} oprovade · rutter ${svRutter.length}/${enRutter.length}/${arRutter.length} (sv/en/ar)`,
);

if (fel > 0) process.exit(1);
if (andelOprovad > 0.1) {
  console.error("För stort oprovat underlag (>10 %) — exit 2 (o147-precedensen: aldrig falsgrönt)");
  process.exit(2);
}
process.exit(0);
