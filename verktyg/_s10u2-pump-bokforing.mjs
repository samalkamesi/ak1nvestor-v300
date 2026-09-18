#!/usr/bin/env node
// _s10u2-pump-bokforing.mjs — bokför MORGON-PUMP-DR i DRIFTSBOKEN (DR-rad
// lead-prepend) + worklog.md (append). En-träff-ankare + abort-grind utan
// skrivning (clobber-kuren). Syskonytorna (u1:s DAGPULS-lead ur 930c2097)
// lämnas ordagrant intakta.

import { readFileSync, writeFileSync } from 'node:fs';

const BOK = '/home/ak1a/AK1/data/DRIFTSBOKEN.md';
const WORKLOG = '/home/ak1a/AK1/worklog.md';

function enTraff(text, nagel, namn) {
  const n = text.split(nagel).length - 1;
  if (n !== 1) throw new Error(`ANKARE ${namn}: ${n} träffar (kräver exakt 1) — ABORT, inget skrivet`);
}

// --- 1. DRIFTSBOKEN: lead-prepend av DR-raden ---
let bok = readFileSync(BOK, 'utf8');

const leadAnkare = 'senast bevisade restore: **DAGPULS-DR 2026-09-18 08:10 lokal (s10-u1 manifest auto-s10-1789711500221';
enTraff(bok, leadAnkare, 'DR-lead');

const nyLead =
  'senast bevisade restore: **MORGON-PUMP-DR 2026-09-18 08:09–08:13 lokal (s10-u2 manifest auto-s10-1789704300078 vakt 2/3, PGPASSFILE-pekare + `node verktyg/dr-ovning.mjs --fil` GRÖN exit 0; protokoll DR-OVNING-2026-09-18-MORGON-PUMP.md + maskinellt DR-PROV-2026-09-18-AUTO-4.md + JSON DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json): PUMPENS LEVANDE LANDNING — första realtidsmätningen i 08:00-fönstret (dr-rpo-diff kl 08:09:16, 9 min 16 s efter batchen) med FÖRHANDSREGISTRADE prediktioner i anspråksfilen FÖRE mätstart (08:07): snapshots **+18 984 EXAKT** == gårdagens batch = pump-noll-hypotesen bevisad LEVANDE, tredje oberoende vägen (1 retro blad-diff u1 · 2 captured_at-sond u1 · 3 denna realtids-diff — alla tre == 18 984) · board_decisions **+176 EXAKT** = 22/22 kvartsbatchar 02:45→08:00, 0 missade · organ +12 · övriga 57 tabeller +0 · RPO-delta +19 172 på 5,64 h — SAMTLIGA 5 PREDIKTIONER INFRIADE (totaltintervall 19 140–19 260, mätt mitt i) · restore RTO 13,5 s (bonusprediktion 10–18 s; blad 8:s punkter 10,2/10,9/17,4/13,5) · fel 788 kända/0 okända · public 60/1 306 119 (public+storage 68/1 306 255 · alla scheman 99/1 306 515) · RACE mot syskon-u1 (samma minutfönster, oberoende manifest): flock-generationsskifte **90 ms** (mitt AUTO-4 skrivet 08:10:05.600 → deras barn pid 1991343 tog flocken 08:10:05.690) = seriens snabbaste, noll dödtid, båda GRÖNA, identiska RPO-tal på 90 s isär = dubbel oberoende instrumentering · ÄRLIGHETSNOTIS: min första "oberoende" städmätning (08:11) fångade deras AKTIVA fönster (PG17 online + färsk OID 193869 = deras skrap-DB) — jag rörde det ej, ommeätt efter deras exit: PG17 down · psql-vägran · base endast OID 1/4/5 · pg_wal 529 MB SJÄTTE punkten (två restores till rörde ej) · disk 72 G · låsfil flock-viloläge · FYND (köpost till verktygsägaren): dr-ovning.mjs:s fellogg namnges per DATUM (/tmp/dr-ovning-fel-<datum>.log) — två agenter samma dag skriver SAMMA fil (idag kolliderade min och u1:s 788-radersloggar; innehåll identiska, men en äkta RÖT-log kan skrivas över av syskons GRÖNA körning) — pid-/sekundsuffix önskas; verktyget orört denna omgång (COMMIT-NORMEN: kur + beteendeprov + commit i samma fönster)**; dessförinnan **DAGPULS-DR 2026-09-18 08:10 lokal (s10-u1 manifest auto-s10-1789711500221';

bok = bok.replace(leadAnkare, nyLead);

const filAnkare = 'DR-OVNING-2026-09-18-MORGON-RETENTION.md (morgon-puls-DR + retentionens andra prov: namn-vs-mtime + sekundprediktion 10-13; maskinellt delprotokoll DR-PROV-2026-09-18-AUTO-3.md) |';
enTraff(bok, filAnkare, 'DR-fillista');
bok = bok.replace(filAnkare,
  'DR-OVNING-2026-09-18-MORGON-RETENTION.md (morgon-puls-DR + retentionens andra prov: namn-vs-mtime + sekundprediktion 10-13; maskinellt delprotokoll DR-PROV-2026-09-18-AUTO-3.md) + DR-OVNING-2026-09-18-MORGON-PUMP.md (morgon-pump-DR: pumpens levande landning + 5/5 förhandsregistrerade prediktioner + 90-ms-flockskiftet; maskinellt DR-PROV-2026-09-18-AUTO-4.md + JSON DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json) |');

writeFileSync(BOK, bok);
console.log('DRIFTSBOKEN: DR-rad lead-prepend + fillista — SKRIVEN');

// --- 2. worklog.md: append av min sektion ---
const sektion = `
## SPÅR 10 s10-u2 (manifest auto-s10-1789704300078, vakt 2/3) — 2026-09-18 08:07–08:13 lokal: MORGON-PUMP-DR — pumpens LEVANDE landning bevisad med FÖRHANDSREGISTRADE prediktioner 5/5 (snapshots +18 984 EXAKT · board +176 EXAKT) + flockskifte 90 ms mot syskon-u1 [fabrik]

OBJEKT (anspråk FÖRE mätstart 08:07, data/vakten/auto-s10-1789704300078-u2-ansprak.md med prediktionstabell): duplikatkontroll mot worklogs s10-sektioner + DRIFTSBOKEN DR-rad + data/forskning/DR-* visade blad 8 restore-bevisat ×3 (natt/morgon) och pump-noll ENDAST retrospektivt (blad-diff) + sond-baserat (captured_at EN ts) — ingen hade mätt 08:00-fönstret LEVANDE samma morgon batchen landar. VINKEL: realtids-diff med förhandsregistrerade prediktioner (u1:s natt-metod portad till dagsläget) + fjärde restore-punkten (seriens första post-pump).

LEVERANS: (A) PGPASSFILE-pekare + node verktyg/dr-rpo-diff.mjs --json kl 08:09:16 lokal (9 min 16 s efter pumpen): blad 1 306 119 / levande 1 325 291 / **RPO +19 172** på 5,64 h i 3 av 60 tabeller — PREDIKTIONER 5/5 INFRIADE: snapshots **+18 984 EXAKT** (intervallet ±100; == gårdagens batch = pump-noll LEVANDE, tredje oberoende vägen) · board_decisions **+176 EXAKT** (±24; 22 kvart × 8, 0 missade kvartsbatchar) · organ_health_logs +12 (0–18) · övriga 57 +0 (≤10) · totalt +19 172 (19 140–19 260, mitt i). JSON DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json. (B) node verktyg/dr-ovning.mjs --fil db-2026-09-18 GRÖN exit 0: markörer GRÖN 1 327 830 rader/CREATE 99/COPY 101 (5,5 s) · **RTO 13,5 s** (bonusprediktion 10–18 s; blad 8:s fyra punkter 10,2/10,9/17,4/13,5) · fel 788 kända/0 okända · public 60/1 306 119 == dump-COPY == nattens tre restores. Maskinellt DR-PROV-2026-09-18-AUTO-4.md. (C) RACE-BOKFÖRING (symmetrisk): syskon s10-u1 (manifest auto-s10-1789711500221, commit 930c2097 DAGPULS-DR) valde oberoende samma fönster — mitt flock-barn (pid 1991162) höll DR-låset, deras barn (pid 1991343) tog flocken **90 ms** efter mitt AUTO-4-skrivande (08:10:05.600 → .690): seriens snappaste generationsskifte, noll dödtid, båda GRÖNA; deras RPO-mätning 08:10:47 == mina tal exakt (90 s isär, board 8/kvart förklarar oförändradhet) = DUBBEL oberoende instrumentering av pumpens landning; deras ytor orörda, deras captured_at-sond korroborerar min realtids-diff. (D) STÄDNING med ärlighetsnotis: min första "oberoende" mätning 08:11 fångade deras AKTIVA PG-fönster (PG17 online + färsk OID 193869 = deras skrap-DB) — jag rörde deras fönster ej, väntade ut deras exit och mätte om 08:12:4x: PG17 down (pg_lsclusters) · psql-vägran (skrap-DB:s frånvaro bevisad) · base ENDAST OID 1/4/5 (noll skrap-svans) · pg_wal 529 MB SJÄTTE punkten i serien (497×3→529→529→529→529: två restores till rörde ej) · disk 72 GB · låsfil flock-viloläge. FYND (lågt, köpost till verktygsägaren): dr-ovning.mjs:s fellogg namnges per DATUM — två agenter samma dag skriver SAMMA /tmp-fil (min + u1:s 788-radersloggar kolliderade idag, identiskt innehåll denna gång; pid-/sekundsuffix önskas — verktyget orört, COMMIT-NORMEN gäller vid kur). KVD: src/ orörd = INGET bygge (node node_modules/typescript/bin/tsc --noEmit egenmätt 0 rader; pre-commit-grinden verifierar baslinjen) · R2 orörd (.pgpass ENDAST PGPASSFILE-pekare till psql, aldrig inläst; prod endast LÄST — GDPR-rent: antal + tidsstämplar) · data/blogg/ orörd · data/backups/ endast lästa · syskonens ytor orörda. Protokoll: DR-OVNING-2026-09-18-MORGON-PUMP.md + JSON + AUTO-4 + DRIFTSBOKEN (DR-radens lead + fillista) + denna sektion. Kö: retentionstriggern ~2026-10-11 · TOTAL i kvartalssviten senast 2026-12-18 · födelsebevis 09-19 02:30 · felloggs-kuren åt verktygsägaren. [fabrik]
`;

let wl = readFileSync(WORKLOG, 'utf8');
const wlAnkare = '## SPÅR 10 s10-u1 (manifest auto-s10-1789711500221, vakt 1/3)';
enTraff(wl, wlAnkare, 'worklog-u1-sektion');
if (!wl.endsWith('\n')) wl += '\n';
wl += sektion;
writeFileSync(WORKLOG, wl);
console.log('worklog.md: s10-u2-sektion appendad');
