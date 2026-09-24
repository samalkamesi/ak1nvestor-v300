#!/usr/bin/env node
// Rond 141-bokföring: worklog + beslutsminne
import fs from 'node:fs';

const worklog = `

## ROND 141 [organ:Ψ] — FYNN-ESKALERING NR 4 (samma 429 × 4) STÄNGD I NOTISROTER: alla HÖG domerade, öppnaHogaKritiska = 0. LAG 1: fyndfilen fortfarande 773 rader (noll nya sedan 09:28:36); färsksond 401; LÄGE-filen var SENAST skriven 06:45 — tre jakter utan LÄGE-uppdatering = notationsslået ( FYNN-notis-pumpen återutsände öppna-listan). ROT: eftersläpning + ETT ogdomat HÖG kvar: 05:28:19.389Z "ak1a = errored" (F2, restarts 7 325 — nattens OOM-kraschloop). KUR: (a) färsk LÄGE byggd (feljakt-lage.mjs körd manuellt via wrapper — cd-skal hänger känt); (b) 05:28-fyndet domerat transient-design med rotkurad-kedja (räddningsbygg 05:31 + V235-sekvensering LIVE (+850 i synkloggen)); (c) RESULTAT_JSON efter: 760 bedömda, 13 öppna (endast MEDEL — ingen notisgrund), 0 öppna HÖG. FYNN:s nästa poll får en helt domtäckt bild. [huvudagenten]
`;
fs.appendFileSync('/home/ak1a/agent/ak1/worklog.md', worklog);
console.log('worklog bokförd');

const rad = JSON.stringify({
  ts: new Date().toISOString(),
  rond: 141,
  beslut: 'FYNN nr 4-identisk eskalering stängd i notisroten: noll nya fynd, LÄGE-slå (06:45) bröts genom manuell körning, sista öppna HÖG (05:28 ak1a=errored, nattens OOM-loop) domerat transient-design rotkurad — 0 öppna HÖG kvar; 429-notisens grund borta; kurer väntar fortfarande push (90-min-cykeln löper)',
  landat: ''
}) + '\n';
for (const trad of ['/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) {
  try { fs.appendFileSync(trad, rad); console.log('bokförd:', trad); }
  catch (e) { console.log('FEL', trad, e.message); }
}
