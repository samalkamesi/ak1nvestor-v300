// Rond 174: kvitto-pushkedja — worklog + PIPELINE-stängning + v166-släpp till ko
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const ws = '/home/ak1a/agent/ak1', prod = '/home/ak1a/AK1';
const git = (args, cwd = ws, t = 300000) => execFileSync('git', args, { cwd, timeout: t }).toString().trim();

// 1. Worklog-kvitto
fs.appendFileSync(`${ws}/worklog.md`, `
## ROND 174 KVITTO [organ:Φ] — PUSH-KEDJAN LANDAD + PROD-VAKT GRÖN + v166 SLÄPPT — 2026-09-24 14:0x lokal
Superdirigent v2 (pid 3284533, logg /tmp/r174-dirigent2.log) fullförde hela kedjan i ETT fönster (14:00:55–14:01:38Z): emottag+merge av s9:s sista leveranser → PUSH-GRÖN ws=prod=0107095f (mimosa-härden a42933df + v164-totalstängningen + rond 173-174:s samtliga commits NU I PROD) → PROD-VAKT i prod-trädet: 13 delkontroller, ANTAL FEL 0, MANUELLA 0, STATUS GRÖN → PROD HTTPS 200. "Kör vakten till 0 fynd" därmed STÄNGT i prod (GUL→GRÖN bevisad i loggen). Lärdom bokförd: dirigent-logg till fil är blockbuffrad — ps är sanningen; poll-grep måste matcha skriptnamnet exakt (pushdirigent≠dirigent2 — falskt DÖD-fynd). v165 STÄNGD (var: push-kedjan). v166-manifestet (24 djupkapitel-uppgifter, DESIGN-v166 fastställd denna rond) SLÄPPT till prod-ko — släppregeln uppfylld (push landade FÖRE släppet, sekvensregeln höll).
`);

// 2. PIPELINE-uppdatering (ersätt v165-raden)
const pipePath = `${ws}/data/forskning/PIPELINE-KO.md`;
let pipe = fs.readFileSync(pipePath, 'utf8');
pipe = pipe.replace(
  '| V165 | PUSH-KEDJAN: ws→prod (mimosa-härden a42933df + v164-stängning + rund 173) + färsk prod-vakt GRÖN (mål 13/13) — push-dirigent äger (_r173-pushdirigent, deadline-regler; gamla poll-instansen död 13:20Z) | PÅGÅR — väntar rent prod-fönster (s8-omgången) |',
  '| V165 | PUSH-KEDJAN: ws→prod + prod-vakt GRÖN | ✓ STÄNGD rond 174: PUSH-GRÖN 0107095f + PROD-VAKT 0 fel GRÖN + HTTPS 200 (bevis /tmp/r174-dirigent2.log) |'
);
pipe = pipe.replace(
  '| V166 | FAS 3-DJUPINTEGRERING: bind underlagen f01-f24 in i kurserna (förslag: ett avslutande djupkapitel "Från bok till egen analys" per kurs, blocks/quiz enligt kontrakt; design GRANSKAS FÖRST av nästa rond — manifest skrivs då; sekvensregel: push FÖRE fabriksmanifest) | BOKAD — design granskas rond 174 |',
  '| V166 | FAS 3-DJUPINTEGRERING: 24 djupkapitel (design FASTSTÄLLD rond 174: DESIGN-v166-djupintegrering.md) | SLÄPPT — manifest i prod-ko, fabriken plockar vid nästa rop |'
);
fs.writeFileSync(pipePath, pipe);

// 3. v166-manifest → prod-ko (släppregeln uppfylld)
const manifest = JSON.parse(fs.readFileSync(`${ws}/data/forskning/KURS-FAS3/manifest-v166-fas3-djupintegrering.json`, 'utf8'));
const koKopia = { ...manifest, parked: false, slaupt: Date.now() };
fs.writeFileSync(`${prod}/data/vakten/agentfabrik/ko/v166-fas3-djupintegrering.json`, JSON.stringify(koKopia, null, 2));
console.log('v166 släppt till prod-ko:', fs.readdirSync(`${prod}/data/vakten/agentfabrik/ko`).join(', '));

// 4. Commit
fs.writeFileSync('/tmp/r174d.txt', 'studio: rond 174 kvitto [organ:\u03a6] \u2014 PUSH-GR\u00d6N 0107095f + PROD-VAKT 0 fel GR\u00d6N + HTTPS 200: v165 st\u00e4ngd, v166-manifest sl\u00e4ppt till ko (24 djupkapitel), pipelinen uppdaterad');
console.log(git(['add', 'worklog.md', 'data/forskning/PIPELINE-KO.md']));
console.log(git(['commit', '-F', '/tmp/r174d.txt']).split('\n')[0]);
console.log('ws HEAD:', git(['log', '--oneline', '-1']));
console.log('prod HEAD:', git(['log', '--oneline', '-1'], prod));
