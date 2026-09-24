#!/usr/bin/env node
// s1-u3 (auto-s1-1790235302376): bygg FLYTTKLART-PAKET för B24 medtech (sv + en).
// Läser original, applicerar granskningsposterna, verifierar enkelträff, skriver paket.
import { readFileSync, writeFileSync } from 'node:fs';

const rot = '/home/ak1a/AK1/data/blogg-utkast';
const las = (p) => JSON.parse(readFileSync(p, 'utf8'));

const svPoster = [
  ['varje operation, varje hörselanpassning, varje sångomsättning genererar en ny försäljning', 'varje operation, varje hörselanpassning, varje såromsättning genererar en ny försäljning'],
  ['För det tredig byggs moaten', 'För det tredje byggs moaten'],
  ['(MDR, 2017/745), som sortera produkter', '(MDR, 2017/745), som sorterar produkter'],
  ['ett certifierat produktbibliotek byggda över årter är svårt att kopiera', 'ett certifierat produktbibliotek byggt över år är svårt att kopiera'],
  ['Hörapparaten går genom audnologen som anpassar den', 'Hörapparaten går genom audiologen som anpassar den'],
  ['med universumets egna tal (rådata 2026-09-03).', 'med universumets egna tal (rådata 2026-09-03/17/18).'],
  ['_Källor: AK1A:s 100-bolagsuniversum (Yahoo Finance/MarketStack, rådata 2026-09-03);', '_Källor: AK1A:s 100-bolagsuniversum (Yahoo Finance/MarketStack/StockAnalysis med S&P-underlag, rådata 2026-09-03/17/18);'],
];
const enPoster = [
  ['with the universe\'s own numbers (raw data 2026-09-03)', 'with the universe\'s own numbers (raw data 2026-09-03/17/18)'],
  ["_Sources: AK1A's 100-company universe (Yahoo Finance/MarketStack, raw data 2026-09-03);", "_Sources: AK1A's 100-company universe (Yahoo Finance/MarketStack/StockAnalysis with S&P data, raw data 2026-09-03/17/18);"],
  ['every operation, every hearing aid fitting, every bed turnover generates a new sale', 'every operation, every hearing aid fitting, every wound care turnover generates a new sale'],
];

function anvand(doc, poster, sprak) {
  let b = doc.body;
  for (const [g, n] of poster) {
    const antal = b.split(g).length - 1;
    if (antal !== 1) throw new Error(`${sprak}: "${g.slice(0, 60)}" träffar ${antal} gånger (väntat 1)`);
    b = b.replace(g, n);
  }
  doc.body = b;
  doc.granskningsnot = {
    granskad: '2026-09-24 av fabriksagent auto-s1-1790235302376 s1-u3',
    dom: `FLYTTKLAR EFTER RÄTTNING — ${poster.length} poster applicerade, 0 talfel`,
    diff: `granskning/medtechaktier-sa-analyserar-du-medicintekniska-bolag${sprak === 'en' ? '-en' : ''}-diff-2026-09-24-s1u3.json`,
    kontroll: `granskning/medtechaktier-sa-analyserar-du-medicintekniska-bolag-KONTROLL-2026-09-24-s1u3.md`,
    publicering: 'kundens beslut (R2)',
  };
  if (sprak === 'en') {
    doc.granskningsnot.kalla = 'EN-filen återställd ur git-objekt fcff5f84 (saknas i arbetsträdet efter reset 6e15cbac) — se KONTROLLENS fynd F1';
  }
  return doc;
}

const sv = anvand(las(`${rot}/medtechaktier-sa-analyserar-du-medicintekniska-bolag.json`), svPoster, 'sv');
writeFileSync(`${rot}/granskning/medtechaktier-sa-analyserar-du-medicintekniska-bolag-FLYTTKLART-PAKET-2026-09-24-s1u3.json`, JSON.stringify(sv, null, 2) + '\n');
console.log('SV-PAKET ok —', svPoster.length, 'poster');

// EN: läs ur git-objektet (fcff5f84) via execSync-git show
import { execSync } from 'node:child_process';
const rå = execSync('git -C /home/ak1a/AK1 show fcff5f84:data/blogg-utkast/medtechaktier-sa-analyserar-du-medicintekniska-bolag-en.json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
const en = anvand(JSON.parse(rå), enPoster, 'en');
writeFileSync(`${rot}/granskning/medtechaktier-sa-analyserar-du-medicintekniska-bolag-en-FLYTTKLART-PAKET-2026-09-24-s1u3.json`, JSON.stringify(en, null, 2) + '\n');
console.log('EN-PAKET ok —', enPoster.length, 'poster');
