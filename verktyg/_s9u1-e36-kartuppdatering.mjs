// Kartuppdatering: E36 Mediebiblioteket (dokvåg s9-u1-omstart, auto-s9-1789731901131).
// Clobber-kur: läs + mtime-stämpel → 4 en-träff-ersättningar i minnet →
// omkontroll att filen är orörd → EN atomär skrivning (tmp+rename).
import { readFileSync, writeFileSync, renameSync, statSync } from 'node:fs';

const KARTA = 'data/forskning/SYSTEMKARTAN.md';
const original = readFileSync(KARTA, 'utf8');
const mtimeFore = statSync(KARTA).mtimeMs;
let text = original;

// Hjälp: exakt en träff krävs, annars ABORT utan skrivning.
const byt = (namn, fran, till) => {
  const n = text.split(fran).length - 1;
  if (n !== 1) { console.error(`ABORT: ankaret "${namn}" har ${n} träffar (krav: 1)`); process.exit(1); }
  text = text.replace(fran, till);
  console.log(`OK: ${namn}`);
};

// ── 1. Ny UPPDATERING-sektion före ÖVERSIKT (efter ursprungsu1:s E29-sektion) ──
const nySektion = `## UPPDATERING 2026-09-18 (dokvåg s9-u1-OMSTART, manifest auto-s9-1789731901131 — E36 mediebiblioteket återdiffad; E29-duplikat avstått)

OMSTARTSBOKFÖRING (ärlig): ursprungs-u1-processen levererade detta manifests
E29-uppdrag KOMPLETT under omstartens fönster — commit 62bb7b85 kl 13:56:47
(SYSTEMKARTAN + worklog; reflog-bevisat) — duplikat avstods enligt spårets
regel; omstartens oberoende korsvalidering (verktyg/_s9u1-e29-atermatning.mjs)
bekräftar samtliga E29-tal (146/147 klara manifest · 68 beslutsposter · pumpor
pm2 online 43 h ↺19, ps pid 1198464 · evighet 614 kontroller · svitgap
oförändrat · CRON_SECRET 0 · kunduppdragsfilerna frånvarande). ANDRA VALET:
E36 — kandidaterna C19/D20/D25/E36/D38 samtliga kodstilla sedan 09-16, men
E36 ensam bar DATA-drift (backup-filerna på disk). Anspråk på disk FÖRE
mätning (auto-s9-1789731901131-u1-ansprak2.md, gitignorerad väg); syskonen
u2 (7b7cff77) och u3 (5b959338) klara och orörda.

| Mått | Kartan (09-16-passningen) | Verkligheten 2026-09-18 (egenmätt) |
|---|---|---|
| media-filer-*.json | "manuell, 2 tillfällen 09-08/09-09, ingen cron" | **6 filer; AUTOMATISK nattlig** sedan s10-u1:s e97aa579 09-16 (användar-crontab "40 2 * * *" → backup-fran-molnet.mjs; första auto-filen 09-17 00:40:03 UTC, därefter 09-18 00:40:02 — variabler-exporterna samma sekund = samma körning) |
| Filernas innehåll | kallade "bucket-förteckning" | **INTE en bucket-förteckning** — exporten listar EVENT-TYPEN media_fil (backup-fran-molnet.mjs:79); antal=0 rader=[] i SAMTLIGA 6 = händelsetrömmen äkta tom sedan 09-08 (mediabibliotek.ts:65 SKRIVER media_fil vid varje uppladdning — ingen uppladdning/radering skett; s10-u3:s "äkta tomma"-klass) |
| Bucket-förteckningens backup | "manuell" (gap 4) | **FINNS EJ** — inget verktyg förtecknar Storage-objekten; det kartan trodde var backup är en tom event-export ⇒ GAP 4 SKÄRPT till DR-risk: bucketen vilar enbart på Supabase-plattformen |
| Svit + kontrakt | 18/18 (påstått 09-16) | **18/18 GRÖN EGEN** (exit 0) + kontrakt A7 REN (SVG-förbud, 2 MB-tak, magic-byte, uuid-nyckel, hermetik) |
| OG-koppling | 0 og-generate i deploy-skriptet; 404 OG-filer i git | **0 träffar återmätt · public/og = 404 trackade i git** (8 bloggbilder på toppnivå + kurs-OG i underkataloger; disk = git, arbetsytan ren) — fortfarande MANUELLT disciplinsteg |
| Kärnfilen | 577 r, oförändrad | **578 r**, senaste commit 7b2666c1 2026-09-07 — fortfarande kodstilla sedan 09-07 |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E36 | LEVER 9 → **LEVER 9** | Gap 4 föll isär i två fynd (automatisk event-export påvisad + bucket-förteckningens FRAÅVARO) men inget gap stängdes eller föll i funktion — E33/B14-precedensen; sviten grön igen, kärnan kodstilla |

Snitt **7,6 / 288 / 38 OFÖRÄNDRAT** (kunskapsdokvåg). Kö till huvudagenten:
(1) bucket-förtecknings-export i nattjobbet (Storage-objektlistan till
data/backups/ — stänger DR-gapet mekaniskt); (2) OG-kopplingen förblir manuell
(0 träffar återmätt; disciplinen bevisad sedan 09-09-leveransen).

## ÖVERSIKT — 38 system`;
byt('ÖVERSIKT-ankare', '## ÖVERSIKT — 38 system', nySektion);

// ── 2. E36-rubrikens stämpel + ny överst-i-block-uppdatering ──
const rubrikFran = '## E36. Mediebiblioteket — LEVER — 9/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16';
const rubrikTill = `## E36. Mediebiblioteket — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1-omstart, manifest auto-s9-1789731901131):
gap 4 föll ISÄR — media-filer-*.json är INTE en bucket-förteckning utan
nattjobbens export av EVENT-TYPEN media_fil (backup-fran-molnet.mjs:79), numera
AUTOMATISK kl 02:40 lokal sedan s10-u1:s e97aa579 09-16 (crontab "40 2 * * *";
första auto-filen 09-17 00:40 UTC), med antal=0 rader=[] i alla 6 filerna =
händelsetrömmen äkta tom sedan 09-08 (mediabibliotek.ts:65 skriver media_fil
vid varje uppladdning — ingen skett). SANNINGEN: Storage-bucketens förteckning
backas upp AV INGEN — gap 4 SKÄRPT till DR-risk. Återmätt GRÖNT: sviten 18/18
egen (exit 0, kontrakt A7 REN) · OG 0 träffar i deploy-skriptet + public/og
404 trackade i git (disk = git) · kärnfilen 578 r kodstilla sedan 7b2666c1
(09-07). Score 9 kvar (kunskap tillförd, inget gap stängt/fallet).*

*Uppdatering 2026-09-16`;
byt('E36-rubrik', rubrikFran, rubrikTill);

// ── 3. GAP-punkt 4 i detailblocket ──
byt(
  'GAP-4',
  '(4) bucket-förteckningens backup är manuell\n  (media-filer-*.json, 2 tillfällen 09-08/09-09 — ingen cron).',
  '(4) Storage-bucketens förteckning backas upp AV INGEN — media-filer-*.json\n  visade sig vara nattjobbens TOMMA event-export av typen media_fil (antal=0 ×6,\n  automatiserad 02:40 sedan s10-u1:s e97aa579) — DR-gap skärpt 09-18, kö till\n  huvudagenten: objektlistning av Storage-bucketen i nattjobbet.'
);

// ── 4. ÖVERSIKT-radens E36-topp-gap ──
byt(
  'ÖVERSIKT-rad E36',
  '18/18 mätt igen (09-15); OG-koppling manuellt kvar (0 träffar i deploy-skriptet, mätt); media-backup utan cadans',
  '18/18 GRÖN egen (09-18); OG manuellt kvar (0 träffar återmätt, public/og 404 i git); media-EVENT-exporten cronad 02:40 (s10-u1) men antal=0 ×6 OCH bucket-förteckningen backas av INGEN (gap skärpt)'
);

// ── Clobber-kontroll + EN atomär skrivning ──
const mtimeNu = statSync(KARTA).mtimeMs;
const foranStad = readFileSync(KARTA, 'utf8');
if (mtimeNu !== mtimeFore || foranStad !== original) {
  console.error('ABORT: kartan ändrades under fönstret (clobber-risk) — inget skrivet');
  process.exit(1);
}
writeFileSync('/tmp/_s9u1-karta-tmp.md', text);
renameSync('/tmp/_s9u1-karta-tmp.md', KARTA);
console.log('SKRIVEN: 4 ersättningar, en atomär skrivning, ' + (text.length - original.length) + ' tecken delta');
