// Worklog-append: s9-u1-omstartens E36-dokvåg (data/ = bash/node tillåtet;
// append via node-kanal enligt skal-kvotens kur 1).
import { readFileSync, writeFileSync, renameSync, statSync } from 'node:fs';

const W = 'worklog.md';
const original = readFileSync(W, 'utf8');
if (!original.endsWith('\n')) { console.error('ABORT: oväntat format (saknar slutradstecken)'); process.exit(1); }
const mtimeFore = statSync(W).mtimeMs;

const sektion = `
## SPÅR 9 s9-u1-OMSTART (manifest auto-s9-1789731901131, extra leverans) — 2026-09-18 ~14:0x–14:2x lokal: SYSTEMKARTAN-dokvåg — E36 MEDIEBIBLIOTEKET återdiffad efter E29-duplikatavstånd; gap 4 föll ISÄR (event-export ≠ bucket-förteckning) [fabrik]

OMSTARTSBOKFÖRING: ursprungsu1-processen levererade manifestets E29-uppdrag KOMPLETT under omstartens fönster — commit 62bb7b85 kl 13:56:47 (SYSTEMKARTAN + worklog, reflog + git show-bevisat) — duplikat AVSTÅTT enligt spårets regel ("duplikat = förlorat arbete"); omstartens oberoende korsvalideringssond (verktyg/_s9u1-e29-atermatning.mjs, 11:57Z) bekräftar samtliga E29-tal grönt: fabriken 146 klara/147 · beslutsminnet 68 poster (rond 51 11:43:03Z) · pumpor pm2 online 43 h ↺19 (ps pid 1198464 pumpor-daemon.mjs; första ps-greppet missade den för pm2-namnet syns ej i cmd-raden — mät-detajl bokförd) · evighetsmotorn 614 kontroller · svitgapet oförändrat · CRON_SECRET 0 env-namnträff · kunduppdragsfilerna frånvarande. ANDRA VALET: E36 (anspråk2 på disk FÖRE mätning; kandidaterna C19/D20/D25/E36/D38 samtliga kodstilla sedan 09-16 — E36 ensam bar data-drift; D25 medvetet lämnad: ytan gränsar till u3:s färska B14-crontab-fynd). FYND KÄRNA: kartans gap 4 ("bucket-förteckningens backup manuell, 2 tillfällen, ingen cron") föll ISÄR i två — (1) media-filer-*.json är INTE en bucket-förteckning utan nattjobbens export av EVENT-TYPEN media_fil (backup-fran-molnet.mjs:79), numera AUTOMATISK kl 02:40 lokal sedan s10-u1:s e97aa579 09-16 (användar-crontab "40 2 * * *"; första auto-filen 09-17 00:40:03 UTC, 09-18 00:40:02 — variabler-exporterna samma sekund = samma körning); (2) antal=0 rader=[] i SAMTLIGA 6 filerna = händelsetrömmen äkta tom sedan 09-08 (mediabibliotek.ts:65 skriver media_fil vid varje uppladdning — ingen skett; s10-u3:s "äkta tomma"-klass) ⇒ SANNINGEN: Storage-bucketens förteckning backas upp AV INGEN = gap 4 SKÄRPT till DR-risk, kö: objektlistning av bucketen i nattjobbet. Återmätt GRÖNT: sviten 18/18 EGEN exit 0 + kontrakt A7 REN · OG 0 og-generate-träffar i deploya-contabo.sh + public/og 404 trackade i git (8 bloggbilder toppnivå + kurs-OG under; disk=git) · kärnfilen 578 r kodstilla sedan 7b2666c1 2026-09-07. Score LEVER 9 kvar (E33/B14-precedensen); snitt 7,6/288/38 oförändrat. KVD: endast SYSTEMKARTAN + denna worklog-rad + 3 sondskript (_s9u1-e29-atermatning · _s9u1-e36-matning · _s9u1-e36-kartuppdatering) — INGET bygge (deploy ägs av prod-synken); src/ orörd (tsc-baslinjen vilar i pre-commit-grinden); R2 orörd; data/blogg/ orörd; syskonens ytor orörda (u2 A2+C17 · u3 B10/B11/B14 · ursprungsu1 E29 — deras sektioner orörda); redigering via node-kanal med clobber-abortgrind + EN atomär skrivning; commit MED pathspec (s9-u2-läxan). Rådata: data/vakten/e36-matning-2026-09-18-s9u1.txt + e29-atermatning-2026-09-18-s9u1.txt (gitignorerade vägar). [fabrik]
`;

const mtimeNu = statSync(W).mtimeMs;
if (mtimeNu !== mtimeFore || readFileSync(W, 'utf8') !== original) {
  console.error('ABORT: worklog ändrad under fönstret — inget skrivet'); process.exit(1);
}
writeFileSync('/tmp/_s9u1-worklog-tmp.md', original + sektion);
renameSync('/tmp/_s9u1-worklog-tmp.md', W);
console.log('APPENDERAD: ' + sektion.length + ' tecken');
