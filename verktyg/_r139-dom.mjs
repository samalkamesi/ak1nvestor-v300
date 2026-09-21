#!/usr/bin/env node
// Rond 139: doma FYNN:s 15 fyndrader 2026-09-21T09:13:13.668–.988Z (429-serien)
// i prod-ledgern — körs ENDAST efter grönt eldprov v5.2.
import fs from 'node:fs';
const LEDGER = '/home/ak1a/AK1/data/vakten/feljakt-bedomningar.jsonl';

const FYND = [
  ['09:13:13.668', '/fardigheter'], ['09:13:13.687', '/filer'], ['09:13:13.711', '/minne'],
  ['09:13:13.731', '/anvandning'], ['09:13:13.744', '/andringar'], ['09:13:13.764', '/interaktion'],
  ['09:13:13.795', '/subagenter'], ['09:13:13.830', '/audit'], ['09:13:13.848', '/godkannande'],
  ['09:13:13.864', '/maskin'], ['09:13:13.903', '/mal/status'], ['09:13:13.922', '/session'],
  ['09:13:13.961', '/uppladdning'], ['09:13:13.975', '/tjanster/automation'], ['09:13:13.988', '/tjanster/bakgrund'],
];

const gemensam = {
  dom: 'transient-design',
  rotorsaka: 'Admin-authens in-memory rate-limit på FELAKTIGA lösenordsförsök (10/min, 60 s-fönster; src/lib/admin-auth.ts "För många felaktiga försök") triggad av huvudagentens eldprov v5:0-miscall: 20+ anrop med fel lösenord ("x") mot SKARPA localhost:3000 (BAS fryst före env-sättningen) sekunder före jakten ⇒ det globala låset avvisade FYNN:s korrekta anrop på 15 endpoints under fönstret. Skyddsmekanismen arbetade som designad — felet var verktygskörningens, inte API:ts. Färska sonder 09:2xZ: 401 (låset utgått), allt friskt.',
  kur: 'FYNN nr 6-429-DOmen i verktyg/feljagaren.mjs: HTTP 429 ⇒ MEDEL "rate-limit — skyddsmekanism aktiv" ALDRIG HÖG (endpointen frisk; Retry-After 60 s). Strukturellt eldprovsskydd: testa-f3-nr5.mjs VÄGRAR BAS med localhost/:3000 (v5:0-läxan) — eldprovet kör endast mot egen mock.',
  bevis: 'Färgmätning: POST /puls + /session utan pass ⇒ 401 (lås utgånget) 09:2xZ · admin-auth.ts:228-229 (429-rad) · v5:0-loggens 401→429-övergång (de första anropen 401, sedan taket) · FYNN-serien 09:13:13.668-.988 (0,32 s — inom låsfönstret) · eldprov v5.2 fall D: mock-429 ⇒ MEDEL 0 HÖG.',
  lag: '1 (färskmätning 401 ×2 + källkodsläsning) · 2 (rot: eldprovs-miscall triggade skydd; FYNN:s HÖG-dom var skyddsblind) · 6 (vaccin nr 6 + dessa domer)',
  protokoll: 'rond 139 [organ:Ψ] + FYNN nr 2/3/4/5-precedens (rond 122/123/134/138) — miljö och skyddsmekanismer dominerar över eskalering'
};

const domdTs = new Date().toISOString();
let n = 0;
for (const [klock, endpoint] of FYND) {
  const rad = JSON.stringify({
    ts: `2026-09-21T${klock}Z`,
    domdTs,
    spår: 'F3-api',
    allvar: 'HÖG',
    fynd: `${endpoint} → 429`,
    ...gemensam
  }) + '\n';
  fs.appendFileSync(LEDGER, rad);
  n++;
}
console.log(`${n} dom-rader skrivna:`, LEDGER);
