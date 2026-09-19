#!/usr/bin/env node
// ROND 103 — våg 209: skriv dataset-djup-manifestet (mönster auto-s2) till fabrikskön
import { writeFileSync, mkdirSync } from 'node:fs';

const PROD = '/home/ak1a/AK1';
const ARB = '/home/ak1a/agent/ak1';
const skapad = Date.now();
const id = `v209-datasetdjup-${skapad}`;

const kd = (n, fil, kontextKort) =>
  `Utöka dataset i spåret (välj själv): +${n} bolag (nordiska eller internationella), kvartiler + universumjämförelse, läckagevakt 0, prod 200.\n\nSpår 2 — DATASET-DJUP (citeringsmagneterna). Kontext: Utöka /dataset med fler bolag/kvartal/nyckeltal per bransch; varje ny dataset = ny Dataset-JSON-LD-sida + llms.txt-rad + sitemap-post. Universum: 207 bolag i data/portfolj-system/bolagsunivers.json — era bolag läggs till där (bevara befintliga fält/kontrakt).\nVälj själv nästa INTE redan levererade objekt i spåret (kontrollera bolagsunivers.json + worklog.md före start) — duplikat är förlorat arbete. R2 gäller: ALDRIG priser/tier/publicering; utkast till data/blogg-utkast/, ALDRIG data/blogg/.\nKVD (våg 209): varje tal källbelagt med rådata i protokollet (mönster s2-u3/omg18: protokoll-FIL data/forskning/V209-U${n}-*.md), tal-paritet mot källa, läckagevakt (universum läst ×2 — samma antal båda gångerna), llms.txt-regen HELREGEN, land.ts-modul om nytt land föds, sitemap aktuell. Juridikgrinden: ALDRIG investeringsråd (2007:528) — allt formuleras som utbildning ("så fungerar nyckeltalet"), ALDRIG "köp/sälj denna aktie".\nLeveranskriterier: konkreta filer, \`node node_modules/typescript/bin/tsc --noEmit\` = 0 om kod berörs (ALDRIG bygge), commit "studio: v209-u${n} <vad>", avsluta med LEVERANS:-rad.`;

const manifest = {
  id,
  titel: 'VÅG 209: Spår 2 — DATASET-DJUP nästa omgång (3 byggare ur evighetskatalogen)',
  skapad,
  auto: false,
  spar: 2,
  uppgifter: [
    { id: 'v209-u1', titel: `Våg 209 (byggare) 1/3: +1 bolag — kvartiler + universumjämförelse + läckagevakt`, roll: 'byggare', filer: [], prompt: kd(1) },
    { id: 'v209-u2', titel: `Våg 209 (byggare) 2/3: +2 bolag — kvartiler + universumjämförelse + läckagevakt`, roll: 'byggare', filer: [], prompt: kd(2) },
    { id: 'v209-u3', titel: `Våg 209 (byggare) 3/3: +3 bolag — kvartiler + universumjämförelse + läckagevakt`, roll: 'byggare', filer: [], prompt: kd(3) },
  ],
};

const json = JSON.stringify(manifest, null, 2);
for (const rot of [PROD, ARB]) {
  mkdirSync(`${rot}/data/vakten/agentfabrik/ko`, { recursive: true });
  writeFileSync(`${rot}/data/vakten/agentfabrik/ko/${id}.json`, json + '\n');
}
console.log('MANIFEST SKRIVEN:', id);
console.log('prod:', `${PROD}/data/vakten/agentfabrik/ko/${id}.json`);
console.log('arb:', `${ARB}/data/vakten/agentfabrik/ko/${id}.json`);
