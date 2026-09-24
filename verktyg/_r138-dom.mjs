#!/usr/bin/env node
// Rond 138: doma FYNN-fyndet 2026-09-21T08:59:22.046Z (transportsvält med
// luftiga grind-mått) i prod-ledgern — körs ENDAST efter grönt eldprov v5.1.
import fs from 'node:fs';
const LEDGER = '/home/ak1a/AK1/data/vakten/feljakt-bedomningar.jsonl';
const rad = JSON.stringify({
  ts: '2026-09-21T08:59:22.046Z',
  domdTs: new Date().toISOString(),
  spår: 'F3-api',
  allvar: 'HÖG',
  fynd: '/andringar nätverksfel',
  dom: 'transient-design',
  rotorsaka: 'Transport-RPC-svält med LUFTIGA grind-mått — FYNN nr 4-grindens blinda fläck (klassens 5:e offer): TimeoutError + omtest misslyckades men rot LEVER, och lasten FÖLL UNDER nr 4-trösklarna (MemAvailable ~1 802 MB > 1 500; 1 zcode-barn < 2 — prod-synk.log 08:57:25Z VÄNTAR-RAM 732 MB med chrome-cron + 1 barn; bevakarloggen 08:58:03Z 2 027 → 08:59:33Z 1 802 MB). Kontext: OOM-byggserien 07:40–08:40 (sex döda byggen, .next-läkebackup-återställningar) + chrome-cron + webchat-poll — transportbarnet svälvs även när RAM-måttet andas.',
  kur: 'FYNN nr 5-TIMEOUT-DOmen i verktyg/feljagaren.mjs: felKLASSEN avgör — TimeoutError/AbortError + rot 200 ⇒ MEDEL svältklass OAVSETT last-mått (både mätt gren och kaskad-syskon via forstaFelTimeout); HÖG kräver icke-timeout-fel (refused/hangup = äkta API-död). Strukturellt: klassens samtliga 5 offer (14:57/18:44/22:28/06:44/08:59) bar rot-200 + timeout — signaturen ÄR svälten.',
  bevis: 'Färskmätning POST /api/studio/andringar 405 på 0,05 s (rot-ytan lever, 09:0xZ) · prod-synk.log 08:47/08:57 VÄNTAR-RAM-rader · bevakarlogg RAM-kurva 08:52–09:02 · eldprov v5.1 (verktyg/testa-f3-nr5.mjs): fall A 08:59-signaturen med luftig last ⇒ MEDEL 0 HÖG, fall B äkta felklass ⇒ HÖG bevarat, fall C rond 50-regression ⇒ självläkt — se svitens PASS-rad i rundans logg.',
  lag: '1 (färskmätning + tre loggkällor + eldprov) · 2 (rot: nr 4-grinden mätte fel dimension — felklassen, inte lasten, skiljer svält från död) · 6 (vaccin v5 + denna dom)',
  protokoll: 'rond 138 [organ:Ψ] + FYNN nr 2/3/4-precedens (rond 122/123/134, samma filosofi: miljö dominerar över eskalering)'
}) + '\n';
fs.appendFileSync(LEDGER, rad);
console.log('dom-rad skriven:', LEDGER);
