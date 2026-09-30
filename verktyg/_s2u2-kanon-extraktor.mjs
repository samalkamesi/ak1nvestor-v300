#!/usr/bin/env node
/**
 * S2-U2 kanon-extraktor — ordagrant utdrag ur StockAnalysis-html (curl:ade
 * filer i /tmp). Sammanfattningslagret (webReader) visade sig bära fel tal
 * (omg32-läxan i praktiken: INGA "59,42" fanns inte på sidan; "32,64 (+3,67 %)"
 * var Price Target-raden) — ALL data byggs från denna kanon.
 *
 * Utdata: /tmp/inga-kanon.json + /tmp/heia-kanon.json (etikett→värde-mappar
 * per yta) som radbygget och aritmetikgrinden replikerar mot.
 */
import { readFileSync, writeFileSync } from "node:fs";

function tabeller(fil) {
  const h = readFileSync(fil, "utf8");
  // tabellrader → cell-listor (label följt av värden)
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
  // översiktens stora kurs: mönster som '€31.49' i schema/ld+json eller clap-text
  const ld = h.match(/"price"\s*:\s*"?([0-9.]+)"?/);
  const cur = h.match(/"currency"\s*:\s*"([A-Z]{3})"/);
  const nm = h.match(/"name"\s*:\s*"([^"]+)"/);
  return { pris: ld ? ld[1] : null, valuta: cur ? cur[1] : null, namn: nm ? nm[1] : null };
}

const BOLAG = [["inga", "ING Groep"], ["heia", "Heineken"]];
const YTOR = [["ov", "översikt"], ["st", "statistics"], ["fi", "financials"], ["bs", "balance-sheet"], ["cf", "cash-flow"]];
for (const [slug, namn] of BOLAG) {
  const ut = { bolag: namn, hämtat: "2026-09-30", källa: "StockAnalysis /quote/ams/ (curl-html, ordagrant)" };
  for (const [kod, yta] of YTOR) ut[yta] = karta(`/tmp/${slug}-${kod}.html`);
  ut.huvud = huvudkurs(`/tmp/${slug}-ov.html`);
  writeFileSync(`/tmp/${slug}-kanon.json`, JSON.stringify(ut, null, 1));
  const n = Object.values(ut).filter(v => v && typeof v === "object").reduce((a, v) => a + (Array.isArray(v) ? 0 : Object.keys(v).length), 0);
  console.log(`${slug}: kanon skriven — ~${n} fält; huvud: ${JSON.stringify(ut.huvud)}`);
}
