#!/usr/bin/env node
/**
 * _r205-u10-underlag.mjs — v173 U10-kandidatunderlag åt nästa styrelserond:
 * tunnaste land×bransch-cellerna (≤2 bolag, land med ≥4 totalt — landsidor
 * näringsbara) + dokumenterade lediga/koordinat-namn i protokollen utanför
 * BCE-listan (exakt disk-match som alltid). Kvitto: /tmp/r205-u10.txt
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const u = JSON.parse(readFileSync("data/portfolj-system/bolagsunivers.json", "utf8"));
const paDisk = new Set(u.map((b) => b.ticker));
const ut = [];

// 1) land-summering + tunna celler i betydande länder
const land = {}, cell = {};
for (const b of u) {
  land[b.land] = (land[b.land] ?? 0) + 1;
  const k = `${b.land}/${b.bransch}`;
  cell[k] = (cell[k] ?? 0) + 1;
}
ut.push("=== länder ≥4 bolag med celler ≤2 ===");
for (const [k, n] of Object.entries(cell).sort((a, b) => a[1] - b[1])) {
  const [l] = k.split("/");
  if (n <= 2 && (land[l] ?? 0) >= 4) ut.push(`  ${k}: ${n} (landet ${land[l]} totalt)`);
}

// 2) dokumenterade koordinater i protokollen utanför BCE-listan (kö-notiser/avsända som ännu ej togs)
ut.push("=== protokollens koordinat-namn (ej BCE-listan), disk-checkade ===");
const namn = [
  ["Rogers RCU/RCI-B", "RCI-B"], ["Kirin 2503.T (villkor: normaliserad TTM)", "2503.T"],
  ["Cellnex (Spanien/kommunikation-alt)", "CLN.MC"], ["Redeia (Spanien alt)", "REE.MC"],
  ["BT (UK/kommunikation alt)", "BT.L"], ["Rogers+TELUS-koordinater", "TELUS"],
];
for (const [beskrivning, tk] of namn) {
  ut.push(`  ${beskrivning}: ${paDisk.has(tk) ? "UPPTAGEN" : "ledig?? (kräver P/E-bärarkontroll + färskdata)"}`);
}
ut.push("(obs: 'ledig??' = disk-checkad mot universumet men kandidaturen kräver dokumenterad motivering per styrelserond — godtyckligt val förbjudet)");

// 3) Japans tunna celler (land 22 bolag)
ut.push("=== Japan-celler ≤2 ===");
for (const [k, n] of Object.entries(cell)) if (k.startsWith("Japan/") && n <= 2) ut.push(`  ${k}: ${n}`);

writeFileSync("/tmp/r205-u10.txt", ut.join("\n"));
console.log(ut.join("\n"));
