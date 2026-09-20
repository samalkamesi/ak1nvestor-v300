#!/usr/bin/env node
// Omgång 25 s6-u3 — SVITHARMONISERING (r107-v2-mönstret). Omgång 25 wireade
// tre lager i chat-widget.tsx (u1:s svaraLokaltEtfmekanik + u2:s
// svaraLokaltKontrahent + detta lagers svaraLokaltMarknadsrytm) — utan
// harmonisering ger varje syskon-svits L01 "okänd kedjekomponent".
// De två syskonnamnen bärs RIDE-ALANG (BASF-precedensen — deras leverans,
// min harmonisering, bokförs i worklog).
// v2-läxorna tillämpade: array-scopad infogning UTAN kommentar, stöd för
// BÅDA strukturerna (const KOMPONENTER / const kedjekomponenter), VARJE
// redigerad svit KÖRS — svitens egen exit-kod är beviset.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NYA = ["svaraLokaltEtfmekanik", "svaraLokaltKontrahent", "svaraLokaltMarknadsrytm"];
const ANKARE = ["svaraLokaltNyaTerritorier", "svaraLokaltMoatdjup", "svaraLokaltForsakring"];

/** Infoga NYA (i ordning) i en array-deklaration — returnerar [nyKälla, status]. */
function infogaIArray(kalla, arrayNamn) {
  const reStart = new RegExp(`const ${arrayNamn} = \\[`);
  if (!reStart.test(kalla)) return [null, "saknas"];
  const startSlut = kalla.indexOf("[", kalla.search(reStart));
  const slut = kalla.indexOf("];", startSlut);
  if (startSlut < 0 || slut < 0) return [null, "ofullständig"];
  const arr = kalla.slice(startSlut, slut);
  if (arr.includes(`"${NYA[NYA.length - 1]}"`)) return [null, "finns-sedan"];
  let nyArr = arr;
  for (const ny of [...NYA].reverse()) {
    if (nyArr.includes(`"${ny}"`)) continue;
    const nySista = NYA[NYA.length - 1];
    if (nyArr.includes(`"${nySista}"`)) {
      // sista namnet redan infogat av en tidigare omgång — resten före det
      nyArr = nyArr.replace(`"${nySista}"`, `"${ny}", "${nySista}"`);
      continue;
    }
    let insatt = false;
    for (const a of ANKARE) {
      const A = `"${a}",`;
      if (nyArr.includes(A)) {
        // infoga alla saknade efter ankaret (ankaret är sista kända före vårt fönster)
        const saknade = NYA.filter((n) => !arr.includes(`"${n}"`));
        nyArr = nyArr.replace(A, A + " " + saknade.map((n) => `"${n}"`).join(", ") + ",");
        insatt = true;
        break;
      }
    }
    if (!insatt) return [null, "ankare-saknas"];
    break;
  }
  return [kalla.slice(0, startSlut) + nyArr + kalla.slice(slut), "ok"];
}

const filer = fs
  .readdirSync(path.join(REPO, "verktyg"))
  .filter((f) => f.startsWith("testa-ai-mentor-") && f.endsWith(".mjs"))
  .sort();

const redigerade = [];
const manuella = [];
const finnssedan = [];
const ingetL01 = [];
for (const f of filer) {
  const p = path.join(REPO, "verktyg", f);
  const src = fs.readFileSync(p, "utf8");
  if (!src.includes("okänd kedjekomponent")) { ingetL01.push(f); continue; }
  if (src.includes(`"${NYA[NYA.length - 1]}"`)) { finnssedan.push(f); continue; }
  let ny = infogaIArray(src, "KOMPONENTER");
  if (ny[1] === "saknas") ny = infogaIArray(src, "kedjekomponenter");
  if (ny[0] === null || (ny[1] !== "ok")) {
    if (ny[1] === "finns-sedan") finnssedan.push(f);
    else manuella.push(`${f} — ${ny[1]}`);
    continue;
  }
  fs.writeFileSync(p, ny[0]);
  redigerade.push(f);
}

// Verifiering: KÖR varje redigerad svit + de som redan har namnet
const attKora = [...redigerade, ...finnssedan].filter((f) => f !== "testa-ai-mentor-marknadsrytm.mjs");
const röda = [];
const grön = [];
for (const f of attKora) {
  const r = spawnSync("node", [path.join(REPO, "verktyg", f)], { encoding: "utf8", timeout: 120000 });
  const sista = (r.stdout || "").trim().split("\n").filter(Boolean).pop() || "(ingen utdata)";
  if (r.status === 0) grön.push(f); else röda.push(`${f}: ${sista}`);
}

console.log("HARMONISERING omgång 25 (3 komponenter: " + NYA.join(", ") + ")");
console.log("  redigerade: " + redigerade.length);
console.log("  fanns sedan: " + finnssedan.length);
console.log("  utan L01-vakt (behöver ej): " + ingetL01.length);
console.log("  manuella: " + (manuella.length ? "\n    " + manuella.join("\n    ") : "0"));
console.log("  KÖRVERIFIERADE GRÖNA: " + grön.length + "/" + attKora.length);
if (röda.length) {
  console.log("  RÖDA efter harmonisering:");
  for (const r of röda) console.log("    " + r);
  process.exit(1);
}
console.log("  ALLA GRÖNA.");
