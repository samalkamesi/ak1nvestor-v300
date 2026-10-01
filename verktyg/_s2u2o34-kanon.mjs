#!/usr/bin/env node
/**
 * S2-U2 omg34 kanon-extraktor — ordagnet utdrag ur StockAnalysis-html för
 * Schneider (SU.PA) + Legrand (LR.PA), curl-filer i /tmp/s2u2/ (minnet:
 * sammanfattningslagret bär fel SA-tal — ALL data byggs från denna kanon).
 * Utdata: /tmp/s2u2/su-kanon.json + lr-kanon.json (etikett→värde per yta).
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
  const pris = h.match(/"price"\s*:\s*"?([0-9.]+)"?/);
  const valuta = h.match(/"currency"\s*:\s*"([A-Z]{3})"/);
  const namn = h.match(/"name"\s*:\s*"([^"]+)"/);
  const sektor = h.match(/"sector"\s*:\s*"([^"]+)"/) || h.match(/"sectorOrIndustry"\s*:\s*"([^"]+)"/);
  return { pris: pris ? pris[1] : null, valuta: valuta ? valuta[1] : null, namn: namn ? namn[1] : null, sektor: sektor ? sektor[1] : null };
}

const BOLAG = [["su", "sa-SU-overview.html", "sa-SU-statistics.html", "sa-SU-financials.html", "sa-SU-balans.html", "sa-SU-cashflow.html"],
               ["lr", "sa-LR-overview.html", "sa-LR-statistics.html", "sa-LR-financials.html", "sa-LR-balans.html", "sa-LR-cashflow.html"]];
for (const [slug, ov, st, fi, bs, cf] of BOLAG) {
  const ut = { bolag: slug.toUpperCase(), hämtat: "2026-10-01", källa: "StockAnalysis /quote/epa/ (curl-html, ordagrant)" };
  ut.översikt = karta(`/tmp/s2u2/${ov}`);
  ut.statistics = karta(`/tmp/s2u2/${st}`);
  ut.financials = karta(`/tmp/s2u2/${fi}`);
  ut.balans = karta(`/tmp/s2u2/${bs}`);
  ut.cashflow = karta(`/tmp/s2u2/${cf}`);
  ut.huvud = huvudkurs(`/tmp/s2u2/${ov}`);
  writeFileSync(`/tmp/s2u2/${slug}-kanon.json`, JSON.stringify(ut, null, 1));
  const n = ["översikt","statistics","financials","balans","cashflow"].reduce((a,y)=>a+Object.keys(ut[y]).length,0);
  console.log(`${slug}: ${n} fält; huvud: ${JSON.stringify(ut.huvud)}`);
}
