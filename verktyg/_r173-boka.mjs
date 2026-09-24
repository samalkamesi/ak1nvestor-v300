// Rond 173: boka våg 165-167 i PIPELINE-KO + worklog-tillägg + commit
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const git = (args, t = 300000) => execFileSync('git', args, { cwd: ws, timeout: t }).toString().trim();

const pipe = `

## VÅG 165-167 — BOKADE rond 173 [organ:Φ] (2026-09-24; efter v164-totalstängningen)

Kontext: v164 STÄNGT 24/24 (rond 171-173, 171 kontroller) — Fas 3:s
djupunderlag komplett. VIKTIG FYNDSLAGA: samtliga 24 Fas 3-kursposter FINNS
redan i bokmaster med fyllda chapters (14-20 kapitel; ak1ts-vaglarans-
hierarki 20/220 min) — underlagen är DJUPUNDERLAG för integrering, inte
byggstenar för saknade kurser.

| Våg | Innehåll | Status |
|---|---|---|
| V165 | PUSH-KEDJAN: ws→prod (mimosa-härden a42933df + v164-stängning + rund 173) + färsk prod-vakt GRÖN (mål 13/13) — push-dirigent äger (_r173-pushdirigent, deadline-regler; gamla poll-instansen död 13:20Z) | PÅGÅR — väntar rent prod-fönster (s8-omgången) |
| V166 | FAS 3-DJUPINTEGRERING: bind underlagen f01-f24 in i kurserna (förslag: ett avslutande djupkapitel "Från bok till egen analys" per kurs, blocks/quiz enligt kontrakt; design GRANSKAS FÖRST av nästa rond — manifest skrivs då; sekvensregel: push FÖRE fabriksmanifest) | BOKAD — design granskas rond 174 |
| V167 | FAS 2-DJUPINTEGRERING: v159:s 20 indikatorunderlag (indikatorer-01-10/11-20) binds till variabelkurserna V01-V20 (samma designmönster som v166) | BOKAD — efter v166 |

R2 orörd: kursinnehåll = utbildning (2007:528); inga pris-/publicerings-
ändringar. Fas 3-kurserna förbler låsta enligt kurs-access (under byggnation).
`;

fs.appendFileSync(`${ws}/data/forskning/PIPELINE-KO.md`, pipe);

const wl = `
## ROND 173 tillägg [organ:Φ] — vågbokning 165-167 efter v164-stängningen — 2026-09-24
PIPELINE-KO uppdaterad: V165 = push-kedjan (pågående, dirigent äger), V166 = Fas 3-djupintegrering (fynd: alla 24 kursposter redan byggda — underlagen är djupunderlag; design granskas rond 174, manifest därefter), V167 = Fas 2-djupintegrering (v159:s indikatorunderlag → V01-V20). Sekvensregeln hålls: push FÖRE nya fabriksmanifest. Verktyg: _r173-{las-manifest,las-bm,las-bm2,las-bm3,las-bm4,boka}.mjs.
`;
fs.appendFileSync(`${ws}/worklog.md`, wl);

fs.writeFileSync('/tmp/r173d.txt', 'studio: rond 173 [organ:\u03a6] \u2014 vågbokning 165-167: push-kedjan p\u00e5g\u00e5ende (dirigent), Fas 3-djupintegrering design-granskas rond 174 (fynd: 24/24 kursposter redan byggda), Fas 2-djupintegrering d\u00e4refter');
console.log(git(['add', 'data/forskning/PIPELINE-KO.md', 'worklog.md',
  'verktyg/_r173-las-manifest.mjs', 'verktyg/_r173-las-bm.mjs', 'verktyg/_r173-las-bm2.mjs',
  'verktyg/_r173-las-bm3.mjs', 'verktyg/_r173-las-bm4.mjs', 'verktyg/_r173-boka.mjs']));
console.log(git(['commit', '-F', '/tmp/r173d.txt']).split('\n')[0]);
console.log('HEAD:', git(['log', '--oneline', '-1']));
console.log('STATUS:', git(['status', '--porcelain']) || '(ren)');
