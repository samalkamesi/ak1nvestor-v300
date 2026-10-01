#!/usr/bin/env node
/**
 * s2-u3 omg34 kanon-extraktor — Frankrike/industri-trion Thales (HO),
 * Dassault Aviation (AM), Alstom (ALO). Ordagrant utdrag ur StockAnalysis-
 * html (curl:ade filer i /tmp) enligt _s2u2-kanon-extraktor.mjs-mönstret
 * (omg33-läxan: sammanfattningslagret kasseras, ALL data från denna kanon).
 *
 * Utdata: /tmp/{thales,dassault,alstom}-kanon.json (etikett→värde per yta).
 */
import { readFileSync, writeFileSync } from "node:fs";

function tabeller(fil) {
  const h = readFileSync(fil, "utf8");
  const rader = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = trRe.exec(h)) !== null) {
    const celler = [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)]
      .map(c => c[1].replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim())
      .filter(c => c.length > 0);
    if (celler.length >= 2) rader.push(celler);
  }
  return rader;
}
function karta(fil) {
  const k = {};
  for (const c of tabeller(fil)) k[c[0]] = c.slice(1).join(" | ");
  return k;
}
function huvudkurs(fil) {
  const h = readFileSync(fil, "utf8");
  const ld = h.match(/"price"\s*:\s*"?([0-9.]+)"?/);
  const cur = h.match(/"currency"\s*:\s*"([A-Z]{3})"/);
  const nm = h.match(/"name"\s*:\s*"([^"]+)"/);
  return { pris: ld ? ld[1] : null, valuta: cur ? cur[1] : null, namn: nm ? nm[1] : null };
}

const BOLAG = [["thales", "Thales"], ["dassault", "Dassault Aviation"], ["alstom", "Alstom"]];
const YTOR = [["ov", "översikt"], ["st", "statistics"], ["fi", "financials"], ["bs", "balance-sheet"], ["cf", "cash-flow"]];
for (const [slug, namn] of BOLAG) {
  const ut = { bolag: namn, hämtat: "2026-10-01", källa: "StockAnalysis /quote/epa/ (curl-html, ordagrant)" };
  for (const [kod] of YTOR) ut[kod] = karta(`/tmp/${slug}-${kod}.html`);
  ut.huvud = huvudkurs(`/tmp/${slug}-ov.html`);
  writeFileSync(`/tmp/${slug}-kanon.json`, JSON.stringify(ut, null, 1));
  const n = Object.values(ut).filter(v => v && typeof v === "object").reduce((a, v) => a + (Array.isArray(v) ? 0 : Object.keys(v).length), 0);
  console.log(`${slug}: kanon skriven — ~${n} fält; huvud: ${JSON.stringify(ut.huvud)}`);
}
