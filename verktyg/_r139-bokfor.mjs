#!/usr/bin/env node
// Rond 139-bokföring: worklog-append + beslutsminnesrad i båda träden
import fs from 'node:fs';

const worklog = `

## ROND 139 [organ:Ψ] — FYNN NR 6: 429-DOMEN (rate-limit är skydd, ej API-fel). KUNDORDER (5 endpoints 429) visade sig vara 15 fynd 09:13:13.668-.988Z. LAG 1: färsksonder 401 ×2 (/puls, /session) — låset utgånget, allt friskt; serien satt i ett 60 s-fönster. LAG 2 (rot): admin-authens in-memory rate-limit på FELAKTIGA lösenordsförsök (10/min, admin-auth.ts:228) triggad av huvudagentens EGEN eldprovs-miscall v5:0 (20+ fel-pass-anrop mot skarpa localhost:3000 — BAS fryst före env) — det globala låset avvisade FYNN:s KORREKTA jakt på 15 endpoints; middlewares flödesvakt oskyldig (loopback-immun rad 178). Skyddet arbetade som designat — felet var verktygets. KUR: FYNN nr 6 i feljagaren — HTTP 429 ⇒ MEDEL "rate-limit — skyddsmekanism aktiv" ALDRIG HÖG + strukturellt eldprovsskydd (barnet VÄGRAR BAS på localhost/:3000 — v5:0-klassen kan ej återkomma). BEVIS: eldprov v5.2 10/10 PASS (fall D mock-429 ⇒ 18 MEDEL 0 HÖG; A/B/C gröna orörda) · 15 dom-rader med exakta ts-nycklar i prod-ledgern · commit e5b94a19. ÄRLIGHET: incidentens orsak var huvudagentens verktygsmiscall — läxan bokförd i koden (VÄGRAR-grinden) och här. [huvudagenten]
`;
fs.appendFileSync('/home/ak1a/agent/ak1/worklog.md', worklog);
console.log('worklog bokförd');

const rad = JSON.stringify({
  ts: new Date().toISOString(),
  rond: 139,
  beslut: 'FYNN nr 6 (15 fynd 429 09:13:13Z) domerade transient-design: admin-authens fel-lösenordslås (10/min, 60 s) triggat av huvudagentens eldprovs-miscall v5:0 — skyddet arbetade, felet var verktygets; KUR: 429 ⇒ MEDEL skyddsmekanism aldrig HÖG + eldprovets VÄGRAR-skarp-BAS-grind; eldprov 10/10; 15 dom-rader i ledgern',
  landat: 'e5b94a19'
}) + '\n';
for (const trad of ['/home/ak1a/agent/ak1/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) {
  try { fs.appendFileSync(trad, rad); console.log('bokförd:', trad); }
  catch (e) { console.log('FEL', trad, e.message); }
}
