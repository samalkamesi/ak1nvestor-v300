// Rond 173: worklog-append + commit (data-only, ingen push — prod-fönstret upptaget av s8-barn)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1';
const p = (...a) => console.log(...a);

const rad = `
## ROND 173 [organ:Φ] — v164 EMOTTAG DEL 3 + TOTALSTÄNGNING: f22-f24 GODKÄNT 24/24 — vågen komplett 24/24 underlag (171 kontroller) — 2026-09-24 ~15:3x lokal
Emottag merge fc925694 (prod c4b0b4cc): f22 dog-and-wolf + f23 market-mind-games + f24 money-and-brain (fabriken klar 24/24, kod 0; f24 rode-along i f22-committen 2f3a5319) + s8-fönstrets o161 vaktkontrakt/F1-slutstängning och o162 ledgerns 15 höga domade. GRANSKNING del 3 (mekanisk _r173-granska-v164-del3.mjs + manuell dom): inledande 3 FEL var granskarens blindfläck — psykologiklassens FJÄRDE ärliga exempelform ("tankeexperiment i pappersform"/"hypotetisk övningsmodell pappersdata"/"hypotetiska exempel") domgodkänd och domregeln utökad FÖRE slutdom. Kontrollräknad aritmetik: f22 hela tabellen (positioner, väntevärden +200/+60/+500, serie 3V/7F −800/−400/−2 000, binomial 7,5 %/26 % vid p=0,55) ✓; f23 omviktarkedjan (+1/−1/+3 %, 20 punkter, spread 4, 0,45³≈9 %/0,55³≈17 %) ✓; f24 (0,99-resor, 0,99²⁰≈82, Barber & Odean 11,4/17,9) ✓ — utom ETT ÄKTA FYND: "−9,9 % från toppen" = 99/110−1 = −10,0 % exakt → kirurgiskt kurat till "−10 %" (f19-precedensen). Slutdom: 24 PASS 0 FEL. V164 TOTALSTÄNGD: f01-f12 (84/84, rond 171) + f13-f21 (63/63, rond 172, 1 dublett kasserad + 1 fras kurad) + f22-f24 (24/24) = 24/24 underlag godkända — Fas 3-kursbygget har komplett underlag. Rapport: data/forskning/KURS-FAS3/GRANSKNING-v164-del3.md. Push-kedjan väntar rent prod-fönster (s8-omgången lever; mimosa-härd a42933df + denna rond + emottagsmergen kör via push-pollen) — vakten GRÖN i prod stängs när härden landat. Verktyg: _r173-{sond,sond2,sond3,sond4,emottag,granska-v164-del3,bokfor}.mjs.
`;

fs.appendFileSync(`${ws}/worklog.md`, rad);
p('worklog uppdaterad');

// Commit med -F-mönstret
const msg = `studio: rond 173 [organ:\u03a6] — v164 ST\u00c4NGT 24/24: f22-f24 godk\u00e4nda (24 PASS 0 FEL), f24 procentfel \u22129,9\u2192\u221210 kurat, psykologiklassens fj\u00e4rde exempelform domgodk\u00e4nd \u2014 totalt 171 kontroller, Fas 3-underlaget komplett`;
fs.writeFileSync('/tmp/r173-commitmsg.txt', msg);
const git = (args) => execFileSync('git', args, { cwd: ws, timeout: 300000 }).toString().trim();
p(git(['add', 'worklog.md',
  'data/forskning/KURS-FAS3/GRANSKNING-v164-del3.md',
  'data/forskning/KURS-FAS3/underlag-f24-money-and-brain.md',
  'verktyg/_r173-sond.mjs', 'verktyg/_r173-sond2.mjs', 'verktyg/_r173-sond3.mjs', 'verktyg/_r173-sond4.mjs',
  'verktyg/_r173-emottag.mjs', 'verktyg/_r173-granska-v164-del3.mjs', 'verktyg/_r173-bokfor.mjs']));
p(git(['commit', '-F', '/tmp/r173-commitmsg.txt']));
p('HEAD:', git(['log', '--oneline', '-2']));
p('STATUS:', git(['status', '--porcelain']) || '(ren)');
