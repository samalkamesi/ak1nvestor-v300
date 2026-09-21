#!/usr/bin/env node
// _s8u1o145-normalisera-skral.mjs — ENGÅNGSSOND (o145 §3): normaliserar de 8
// bedömningsrader i feljakt-bedomningar.jsonl som feljakt-lage.mjs ignorerar
// (dom-fält utanför de fyra giltiga klasserna; fyra av dem dessutom med
// hemgjurd nyckel som aldrig matchat någon fyndrad).
//
// KIRURGIPRINCIPER (o145):
//   1. Historik förloras ALDRIG: gamla dom-texten bevaras i fältet domOriginal;
//      gamla nyckeln i nyckelOriginal; ursprunglig bedömningstid = domdTs.
//   2. Hierarkin bevaras: domdTs = radens ursprungliga ts ⇒ normaliserade
//      rader förlorar mot yngre giltiga domer på samma nyckel (kontraktet
//      "senaste domdTs vinner" avgör, inte normaliseringen).
//   3. Inga rader försvinner ur ledgern UTAN hemlösa (496/497: bedömde
//      FYNN-eskaleringar som aldrig skrev fyndrader — fel ledger från början)
//      som flyttas till feljakt-bedomningar-arkiv.jsonl med motivering.
//   4. Backup på skrap-arkivet FÖRE skrivning; idempotenskontroll — raderna
//      måste fortfarande vara skral när skriptet kör (annars avslås).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const BEDOM = path.join(VAKT, "feljakt-bedomningar.jsonl");
const ARKIV = path.join(VAKT, "feljakt-bedomningar-arkiv.jsonl");
const BACKUP = path.join(VAKT, "skrap-arkiv", "feljakt-bedomningar.backup-o145.jsonl");
const FYNDLOGG = path.join(VAKT, "feljakt-fynd.jsonl");

const DOMER = new Set(["falskt-pos", "rotkurad", "pagaende", "transient-design"]);
const lasJsonl = (fil) => fs.readFileSync(fil, "utf8").split("\n").filter((r) => r.trim()).map((r) => JSON.parse(r));
const nk = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;

const fynd = lasJsonl(FYNDLOGG);
const rader = lasJsonl(BEDOM);
const hitta = (del) => {
  const t = fynd.filter((f) => (f.fynd ?? "").includes(del));
  return t.length === 1 ? t[0] : null;
};

// Normaliseringsplan: radnummer (1-baserat i filn) → åtgärd.
// malsok = unik delsträng i FYNDLODGENs fyndtext (måste ge exakt 1 träff).
const PLAN = [
  { rad: 270, mal: "prod bygg-OOM-loop", dom: "rotkurad" },
  { rad: 271, mal: "PROD-manifest-offer rutt 3", dom: "rotkurad" },
  { rad: 272, mal: "/godkannande → 500", dom: "rotkurad" }, // 3 fyndrader — väljs nedan
  { rad: 273, mal: "/godkannande → 500", dom: "rotkurad", kvitto: true }, // samma mål som 272
  { rad: 717, dom: "rotkurad" }, // nyckeln är redan korrekt (fyndmatch 1)
  { rad: 718, dom: "rotkurad" }, // nyckeln är redan korrekt (fyndmatch 1)
];
const ARKIVERA = [496, 497];

const ut = [];
const arkivRader = [];
const rapport = { plan: [], arkiv: [], fel: [] };

//Förhandskontroll: varje planrad måste för närvarande vara skral
for (const p of [...PLAN.map((x) => x.rad), ...ARKIVERA]) {
  const b = rader[p - 1];
  if (!b) rapport.fel.push(`rad ${p} finns ej`);
  else if (DOMER.has(b.dom)) rapport.fel.push(`rad ${p} är redan giltig (dom=${b.dom}) — idempotensavslag`);
}

// Rad 272/273: tre fyndrader matchar "/godkannande → 500" — välj den som ligger
// närmast bedömningens ursprungliga tid (08:28) och som SAKNAR yngre giltig dom
// är alla tre täckta av rotkurad@19:31 — då är valet kronologiskt: närmast före.
if (!rapport.fel.length) {
  const godk = fynd.filter((f) => (f.fynd ?? "").includes("/godkannande → 500"));
  const kand = godk.filter((f) => f.ts <= "2026-09-19T08:28:09.467Z");
  const malFynd = kand[kand.length - 1] ?? godk[0];
  if (!malFynd) rapport.fel.push("inget godkannande-500-fynd hittades");
  else for (const p of PLAN) if (p.mal === "/godkannande → 500") p.malFynd = malFynd;
}

if (rapport.fel.length) {
  console.log(JSON.stringify({ ok: false, ...rapport }, null, 2));
  process.exit(1);
}

fs.copyFileSync(BEDOM, BACKUP);

rader.forEach((b, i) => {
  const nr = i + 1;
  const p = PLAN.find((x) => x.rad === nr);
  if (p) {
    const mal = p.malFynd ?? (p.mal ? hitta(p.mal) : null);
    if (p.mal && !mal) { rapport.fel.push(`rad ${nr}: målfynd ej unikt (${p.mal})`); ut.push(b); return; }
    const ny = mal
      ? {
          ...b,
          ts: mal.ts,
          "spår": mal["spår"] ?? mal.spar,
          allvar: mal.allvar ?? b.allvar,
          fynd: mal.fynd,
        }
      : { ...b };
    ny.dom = p.dom;
    ny.domdTs = b.domdTs ?? b.ts; // ursprunglig bedömningstid bevaras som domtid
    ny.domOriginal = b.dom;
    ny.normaliserad = "o145 s8-u1 §3 (skral-dom-kur)";
    if (nk(b) !== nk(ny)) ny.nyckelOriginal = { ts: b.ts, "spår": b["spår"] ?? b.spar ?? null, fynd: b.fynd };
    ut.push(ny);
    rapport.plan.push({ rad: nr, gamladom: b.dom, nyckel: nk(ny).slice(0, 70), domdTs: ny.domdTs });
  } else if (ARKIVERA.includes(nr)) {
    arkivRader.push({
      ...b,
      arkiverad: "o145 s8-u1 §3 — hemlös: bedömde FYNN-eskalering som aldrig skrev fyndrad; kontraktet gäller fyndrader",
    });
    rapport.arkiv.push({ rad: nr, ts: b.ts, fynd: (b.fynd ?? "").slice(0, 70) });
  } else {
    ut.push(b);
  }
});

if (rapport.fel.length) {
  console.log(JSON.stringify({ ok: false, ...rapport, notering: "INGET skrevs — fel upptäckta under körning" }, null, 2));
  process.exit(1);
}

fs.writeFileSync(BEDOM, ut.map((r) => JSON.stringify(r)).join("\n") + "\n");
if (arkivRader.length) {
  const befintligt = fs.existsSync(ARKIV) ? fs.readFileSync(ARKIV, "utf8") : "";
  fs.writeFileSync(ARKIV, befintligt + arkivRader.map((r) => JSON.stringify(r)).join("\n") + "\n");
}
rapport.ok = true;
rapport.backup = BACKUP;
rapport.arkivfil = ARKIV;
console.log(JSON.stringify(rapport, null, 2));
