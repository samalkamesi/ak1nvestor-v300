#!/usr/bin/env node
// ROND 107 — SVITHARMONISERING v2 (v210-eftersläpning). Våg 210 wireade
// svaraLokaltValutamekanik i chat-widget.tsx utan att harmonisera de ~42
// syskon-lagersviternas kedjekopior ⇒ aggregatorns första svep: 42 × L01-FAIL
// "okänd kedjekomponent: svaraLokaltValutamekanik".
//
// v2 (efter v1:s radbrytsläxa: kommentar-insättning åt upp samma-rads-innehåll
// i 3 filer — repareras här): array-scopad infogning UTAN kommentar (samme
// rad), stöd för BÅDA strukturerna (const KOMPONENTER = […] i u1/u2-familjen
// const kedjekomponenter = […] i case-familjen), och VARJE redigerad svit
// KÖRS som verifiering — svitens egen exit-kod är beviset, inte parsningen.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NY = "svaraLokaltValutamekanik";

// ── 0) reparera v1:s tre korrumperade redigeringar ────────────────────────
const V1_SPILL = '"svaraLokaltPraktik",\n    "' + NY + '", // rond 107-harmonisering: v210 wireade valutamekanik här (efter praktik, före portfoljgrund) utan syskon-harmonisering ';
const V1_RATT = '"svaraLokaltPraktik", "' + NY + '", ';
let reparerade = 0;
for (const f of fs.readdirSync(path.join(REPO, "verktyg"))) {
  if (!f.startsWith("testa-ai-mentor-")) continue;
  const p = path.join(REPO, "verktyg", f);
  let src = fs.readFileSync(p, "utf8");
  if (src.includes(V1_SPILL)) {
    src = src.replace(V1_SPILL, V1_RATT);
    fs.writeFileSync(p, src);
    reparerade++;
  }
}

/** Infoga NY i en array-deklarations text — returnerar ny källa eller null. */
function infogaIArray(kalla, arrayNamn) {
  const reStart = new RegExp(`const ${arrayNamn} = \\[`);
  const m = kalla.match(reStart);
  if (!m) return null;
  const startSlut = kalla.indexOf("[", kalla.search(reStart));
  const slut = kalla.indexOf("];", startSlut);
  if (startSlut < 0 || slut < 0) return null;
  const arr = kalla.slice(startSlut, slut);
  if (arr.includes(`"${NY}"`)) return "finns-sedan";
  const PRAKTIK = '"svaraLokaltPraktik",';
  const GRUND = '"svaraLokaltPortfoljgrund"';
  let nyArr;
  if (arr.includes(PRAKTIK)) {
    nyArr = arr.replace(PRAKTIK, `${PRAKTIK} "${NY}",`);
  } else if (arr.includes(GRUND)) {
    // praktik saknas i listan (case-familjen): före portfoljgrund = v210:s position
    nyArr = arr.replace(GRUND, `"${NY}", ${GRUND}`);
  } else {
    return "ankare-saknas";
  }
  return kalla.slice(0, startSlut) + nyArr + kalla.slice(slut);
}

// ── 1) harmonisera alla L01-sviter ─────────────────────────────────────────
const filer = fs
  .readdirSync(path.join(REPO, "verktyg"))
  .filter((f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs"))
  .sort();

const redigerade = [];
const manuella = [];
const finnssedan = [];
for (const f of filer) {
  const p = path.join(REPO, "verktyg", f);
  const src = fs.readFileSync(p, "utf8");
  if (!src.includes("okänd kedjekomponent")) continue; // bara L01-bärare
  if (src.includes(`"${NY}"`)) { finnssedan.push(f); continue; }
  const ny = infogaIArray(src, "KOMPONENTER") ?? infogaIArray(src, "kedjekomponenter");
  if (ny === null || ny === "ankare-saknas" || ny === "finns-sedan") {
    manuella.push(`${f} — ${ny === "ankare-saknas" ? "varken praktik eller portfoljgrund i arrayn" : String(ny)}`);
    continue;
  }
  fs.writeFileSync(p, ny);
  redigerade.push(f);
}

// ── 2) VERIFIERA: kör varje redigerad/reparerad svit — exit 0 = bevis ─────
const grona = [];
const roda = [];
for (const f of redigerade) {
  const r = spawnSync(process.execPath, [path.join(REPO, "verktyg", f)], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  const sista = (r.stdout || "").split("\n").filter((x) => x.trim()).pop() ?? "(tyst)";
  if (r.status === 0) grona.push(f);
  else roda.push(`${f} — exit ${r.status}: ${sista.slice(0, 120)}`);
}
// de tre v1-reparerade är redan KOMPONENTER-bärare med NY på plats — kör dem
for (const f of fs.readdirSync(path.join(REPO, "verktyg"))) {
  if (!f.startsWith("testa-ai-mentor-") || redigerade.includes(f)) continue;
  const p = path.join(REPO, "verktyg", f);
  if (!fs.readFileSync(p, "utf8").includes(`"${NY}"`)) continue;
  if (finnssedan.includes(f)) continue;
  const r = spawnSync(process.execPath, [p], { cwd: REPO, encoding: "utf8", timeout: 120_000 });
  const sista = (r.stdout || "").split("\n").filter((x) => x.trim()).pop() ?? "(tyst)";
  if (r.status === 0) grona.push("(v1-reparerad) " + f);
  else roda.push(`(v1-reparerad) ${f} — exit ${r.status}: ${sista.slice(0, 120)}`);
}

console.log(`reparerade v1-spill: ${reparerade} · harmoniserade: ${redigerade.length} · fanns-sedan: ${finnssedan.length} · manuella: ${manuella.length}`);
for (const m of manuella) console.log("  MANUELL: " + m);
console.log(`verifierade GRÖNA: ${grona.length} (av ${redigerade.length} harmoniserade + ${reparerade} v1-reparerade)`);
for (const r of roda) console.log("  RÖD EFTER REDIGERING: " + r);
if (grona.length === redigerade.length && manuella.length === 0) console.log("SVITHARMONISERING KLAR — samtliga verifierade gröna");
