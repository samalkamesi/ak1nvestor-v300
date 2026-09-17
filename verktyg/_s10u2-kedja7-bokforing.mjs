#!/usr/bin/env node
// _s10u2-kedja7-bokforing.mjs — EN-skript-bokföring av KEDJA 7 i DRIFTSBOKEN + worklog
// (clobber-kuren: varje ersättning verifierar EXAKT EN träff, annars abort UTAN skrivning)
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';

const BOK = '/home/ak1a/AK1/data/DRIFTSBOKEN.md';
const WORKLOG = '/home/ak1a/AK1/worklog.md';

function ersattEnTraff(text, nal, ny, etikett) {
  const forst = text.indexOf(nal);
  if (forst === -1) throw new Error(`ABORT: nålen hittades ej (${etikett}) — boken omlästes?`);
  if (text.indexOf(nal, forst + 1) !== -1) throw new Error(`ABORT: nålen har FLERA träffar (${etikett})`);
  console.log(`  OK en träff: ${etikett}`);
  return text.slice(0, forst) + ny + text.slice(forst + nal.length);
}

let bok = readFileSync(BOK, 'utf8');
console.log('DRIFTSBOKEN läst:', bok.length, 'tecken');

// 1) DR-raden: lead-prepend framför nuvarande lead (EFTERMIDDAGS-DR, s10-u3 O9)
const NAL_LEAD = 'senast bevisade restore: **EFTERMIDDAGS-DR 2026-09-17';
const NY_LEAD = `senast bevisade restore: **KEDJA 7 — KIRURGIRECEPTET FÖR BOARD_DECISIONS BEVISAT 2026-09-17 14:43 lokal (s10-u2 O9, \`node verktyg/dr-kedja7.mjs\` GRÖN exit 0; agentprotokoll DR-KEDJA7-2026-09-17-BOARD-RECEPT.md + maskinella DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md = RÖT/RÖT/GRÖN-beviskedjan): spårets äldsta öppna köpost STÄNGD — kedja 5:s FYND 1 (board_decisions kan EJ kirurgeras: FK:n forecast_log.board_decision_id ON DELETE SET NULL gör att kirurgins DELETE UPDATE:a forecast_log, där trg_forecast_log_immutable vägrar allt) har nu sitt bevisade recept: \`SET LOCAL session_replication_role = replica\` i kirurgins ENDA transaktion (superuser — lokal PG-postgres är det) — replica-läget stänger av triggrar OCH FK-enforsering: SET NULL-kaskaden eldas ALDRIG (0 ärr: forecast_log 429 rader/113 referenser OBERÖRDA, till skillnad från FK-paus-varianter) men FK validerar ej heller under appliceringen ⇒ verktygets OBLIGATORISKA efterkontrakt, alla GRÖNA: rader 47 810 == källa · checksumma 8e16c9e7… IDENTISK · hängande-referenssond 0 · skyddstriggrar 2/2 aktiva (tgenabled=O) · LIVE-bevis — engångs-UPDATE i forecast_log VÄGRAS fortfarande efteråt · roll \`origin\` (SET LOCAL dog med transaktionen). Mätvärden: full restore 15,2 s (fel 788 kända/0 okända; kedja 7-serie 17,5/13,1/15,2) · extraktion 47 810 rader/80,9 MiB/1,1 s (antalskontrakt == källa) · KATASTROF-mutation (buggig migrering, consensus_level=-1) 500 rader LANDADE (sondbekräftat) · NAIVA kirurgin (kedja 5:s recept) VÄGRAD på 0,5 s exakt av "AK1A prognosmotor: UPDATE på forecast_log är förbjuden" + HEL rullbak, katastrofen kvar (fynd 1 mekaniskt återbevisat) · sabotage (mitt-rads-kolumnfel i receptfilen) vägrat + rullbak · RECEPET 4,2 s. FYND: (a) SKIKTAT SKYDD — en olycks-DELETE av board_decisions stoppas REDAN av skyddet via kaskaden; den farliga katastrofen är MUTATION (tabellen själv triggerfri — konsensusförfalskning landar obehindrat) och ENDAST replica-receptet läker den; (b) två instrumentbuggar bokförda enligt ärlighetsdoktrinen: kör 1 RÖT på conrelid::regclass::text utan public.-prefix (search_path) → normaliseringskur; kör 2 RÖT på psql -q som döljer UPDATE-n-ekot → oberoende sond-kur (process-eko är inget mått); (c) runbook för prod tillämpning i sektionen nedan. Städning ägar + oberoende mätt: skrap-DB ak1a_dr_k7 raderad, PG17 stoppad, tmp raderade (fellogg medvetet kvar), låsfil utan hållare.** Dessförinnan **EFTERMIDDAGS-DR 2026-09-17`;
bok = ersattEnTraff(bok, NAL_LEAD, NY_LEAD, 'DR-radens lead-prepend');

// 2) DR-radens fillista: lägg till KEDJA 7-filerna i protokollfillistan
const NAL_LISTA = 'DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json) |';
const NY_LISTA = 'DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json) + DR-KEDJA7-2026-09-17-BOARD-RECEPT.md (agentprotokoll: recept + runbook + fynd) + DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md (maskinella; RÖT/RÖT/GRÖN) |';
bok = ersattEnTraff(bok, NAL_LISTA, NY_LISTA, 'DR-radens fillista');

// 3) Ny sektion före VÅG 148–150-blocket
const NAL_SEKT = '## VÅG 148–150 — TRÅDENS TRIO';
const SEKTION = `## S10-U2 (O9) — KEDJA 7: KIRURGIRECEPTET FÖR TRIGGERBLOCKADE board_decisions \`verktyg/dr-kedja7.mjs\` (2026-09-17, GODKÄNT)

Kedja 5:s FYND 1 löst: board_decisions (organens beslutsregister, 47 810 rader)
kirurgeras med \`SET LOCAL session_replication_role = replica\` i kirurgins ENDA
transaktion. Bevisad i skrap-DB på db-2026-09-17 (GRÖN exit 0, körning 3 — körning
1 och 2 RÖTA på vardera en instrumentbugg, se nedan):

| Moment | Värde |
|---|---|
| Full restore (källmåttstock) | 15,2 s · fel 788 kända/0 okända |
| Källa | 47 810 rader · checksumma 8e16c9e70d173a338352c2affac71abe |
| Kollateralbaslinje | forecast_log 429 rader · 113 refererar board_decisions |
| Katastrof (buggig migrering) | 500 rader muterade (consensus_level=-1) — LANDADE |
| Naiv kirurgi (kedja 5:s recept) | VÄGRAD 0,5 s — prognosmotor-feltexten + HEL rullbak |
| Sabotage (mitt-rads-kolumnfel) | VÄGRAD + rullbak (gäller även under replica-läge) |
| RECEPET (replica + DELETE + COPY) | 4,2 s · 47 810 rader · checksumma IDENTISK |
| Efterkontrakt | 0 ärr (113==113) · 0 hängande · triggrar 2/2 · live-UPDATE vägras · roll origin |

Varför säkert: replica-läget är PG:s egen kanal för logiska replikeringar —
SET LOCAL dör med transaktionen, ingen DDL, inga bestående spår; kaskaden eldas
aldrig så grannen bibehålls bit-för-bit; FK:n var avstängd ⇒ hängande-sonden +
live-triggerbeviset är OBLIGATORISKA efter varje verklig applicering (verktyget
bär båda). Runbook: (1) kör dr-kedja7.mjs mot dagens dump; (2) receptfil =
SET LOCAL + DELETE + COPY-block, EN transaktion, ON_ERROR_STOP; (3) mot Supabase
krävs superuser-rättigheter + lågtrafik + huvudagentens ägande (R2); (4) verifiera
rader/checksumma/hängande/live-skydd efteråt. Gränser: pausar ALLA triggrar under
transaktionen — aldrig mot tabeller vars triggrar bär affärslogik för COPY-datan;
håll transaktionen minimal.

Fynd: skiktat skydd (olycks-DELETE stoppas redan av kaskaden; katastrofen som
behöver receptet är MUTATION av den triggerfria tabellen) · instrumentbuggarna
regclass-prefix (search_path) och psql -q-dolt rowcount-eko (sond-kur) — båda
protokollförda i RÖT-delprotokollen.

KVD: src/ orörd (rent node-verktyg utanför src/, tsc-baslinjen orörd via grinden,
INGET bygge) · prod RÖRDES ALDRIG · R2 orörd · data/blogg/ orörd · syskonytor
orörda (s10-u1:s MIDDAGS-DR 07dd6aa0 och s10-u3:s O9 lästa, deras sektioner orörda;
DR-fönstret taget först efter u1:s låssläpp).

`;
bok = ersattEnTraff(bok, NAL_SEKT, SEKTION + NAL_SEKT, 'ny sektion före VÅG 148–150');
writeFileSync(BOK, bok);
console.log('DRIFTSBOKEN skriven:', bok.length, 'tecken');

// 4) worklog-sektion
const WL = `
## SPÅR 10 s10-u2 (manifest auto-s10-1789647928135, 2/3) — 2026-09-17 ~14:5x lokal: KEDJA 7 — KIRURGIRECEPTET FÖR board_decisions (spårets äldsta öppna köpost stängd) [fabrik]

OBJEKT (anspråk FÖRE ingreppet, data/vakten/auto-s10-1789647928135-u2-ansprak.md): duplikatkontroll visade kedja 1 (09-17) taget av två syskon i morse, kedja 2 (jungfrunatten) mitt eget O8, kedja 4 + middags-RPO + per-typ-diagnos VALT AV SYSKON s10-u1 (deras anspråksfil läst före val; deras restore-process höll DR-låset — fönstret togs först efter låssläpp) ⇒ kvar stod spårets äldsta ÖPPNA köpost: kedja 5:s FYND 1 — board_decisions kan EJ kirurgeras (FK:n forecast_log.board_decision_id ON DELETE SET NULL gör att kirurgins DELETE UPDATE:a forecast_log där trg_forecast_log_immutable vägrar allt; recept bokat "till huvudagenten" sedan 09-16). LEVERANS: verktyg/dr-kedja7.mjs (familjekontraktet: flock-kö, RAM-/diskgrind exit 75, markörkontroll, felkategorisering, maskinellt protokoll, garanterad finally-städning) + RECEPET BEVISAT GRÖNT exit 0 på db-2026-09-17: SET LOCAL session_replication_role=replica i kirurgins ENDA transaktion — restore 15,2 s (fel 788/0) · källa 47 810 rader/checksumma 8e16c9e7… · kollateral 429/113 · extraktion 1,1 s antalskontrakt OK · KATASTROF-mutation 500 rader LANDADE · NAIVA kirurgin VÄGRAD 0,5 s exakt av prognosmotor-feltexten + HEL rullbak (fynd 1 mekaniskt återbevisat) · sabotage vägrat · RECEPET 4,2 s, checksumma IDENTISK · efterkontrakt ALLA GRÖNA: 0 SET NULL-ärr (113==113 — kaskaden eldades aldrig), 0 hängande referenser, triggrar 2/2 aktiva, LIVE-bevis (engångs-UPDATE i forecast_log VÄGRAS fortfarande), roll origin (SET LOCAL dog med transaktionen). FYND: (a) skiktat skydd — olycks-DELETE stoppas redan av kaskaden, farlig katastrof = MUTATION av den triggerfria tabellen, endast receptet läker; (b) instrumentbuggar bokförda: kör 1 RÖT (conrelid::regclass::text utan public.-prefix i search_path → normaliseringskur), kör 2 RÖT (psql -q döljer UPDATE-n-eko → oberoende sond-kur: process-eko är inget mått) — tre körningar protokollförda RÖT/RÖT/GRÖN; (c) runbook för prod i agentprotokollet (superuser + lågtrafik + huvudagentens R2-ägande; hängande-sond + live-triggerbevis OBLIGATORISKA efteråt eftersom FK:n var avstängd). Städning ägar + oberoende mätt: skrap-DB raderad, PG17 stoppad, tmp borta (fellogg medvetet kvar), låsfil utan hållare. KVD: src/ orörd (rent nodeverktyg, INGET bygge — grinden verifierar baslinjen) · R2 orörd (prod rördes aldrig) · data/blogg/ orörd · syskonytor orörda. Protokoll: data/forskning/DR-KEDJA7-2026-09-17-BOARD-RECEPT.md + DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md; DRIFTSBOKEN DR-rad + sektion S10-U2 (O9). [fabrik]
`;
appendFileSync(WORKLOG, WL);
console.log('worklog appendad:', WL.length, 'tecken');
console.log('BOKFÖRING KLAR');
