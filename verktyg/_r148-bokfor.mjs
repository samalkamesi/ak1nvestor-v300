// Rond 148-bokföring: worklog + beslutsminne + commit + push
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const A = '/home/ak1a/agent/ak1';
const P = '/home/ak1a/AK1';
const S = (cwd, cmd, args, t = 60000) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd, maxBuffer: 32 * 1024 * 1024 }); } catch (e) { return 'FEL: ' + (e.message || '').slice(0, 250); } };
const blockerare = () => S(P, 'git', ['status', '--porcelain'], 30000).trim().split('\n').filter(r => r && !r.startsWith('??'));
const ut = { nu: new Date().toISOString() };

const wl = [
  '',
  '## ROND 148 [organ:Δ] — GRÄNSSNITTSVAKT PÅ SNITTET: 4 FYND, EN ROT, KUR LEVERERAD (141c7e77 pushad 067f7c1b; bygg hos prod-synken enligt V235-sekvens).',
  'DoD-spårets sista bit: riktad vakt på /rapportakademin (första fulla körningen — vaccin-skriptet dog före sitt steg 4):',
  'layout REN (överflöd 0, kontrast 0, utanför 0, alla 4 kombinationer) men 1 konsolfel per visning — rot:',
  'GET /api/rapportakademin/pass svarar 401 för gäst (AVSIKTLIG design, klienten visar inloggningsvyn) men webbläsaren',
  'loggar varje 4xx-fetch som resursfel i devtools — kundsynligt brus, vaktens 0-fynd-krav.',
  'KUR (kirurgisk): GET bär koden i KROPPEN (200 + ok:false + kod:inloggning/fas2), POST behåller 401/403 (mutationens',
  'status), klienten hanterar båda formerna = sömlös över deployfönstret. Skyddet oförändrat: skalet/facit exponeras aldrig.',
  'tsc 0 · commit 141c7e77 · merge med fabrikens våg · push GRÖN 067f7c1b.',
  'VACCINATION (ärad): mitt egna flock-bygg via node-execFile fick 540 s-timeout mitt i npm ci (.next rivet, pm2 serverar',
  'friskt) — tunga byggen är prod-synkens/flock-kanalens ensamrätt, ALDRIG node-execFile; synken ser NY KOD 067f7c1b och',
  'sekvenserar bakom fabrikens aktiva manifest (auto-s1). DoD-bevakare (r148-bevakare.mjs) pollar i bakgrunden: när kuren',
  'är live körs riktad vakt → 0 fynd = DoD STÄNGT (utfall: data/vakten/r148-dod-utfall.json).',
  'BRANDING-kartläggning (nästa våg): STRATEGISKT-SKIFTE spår 11 — startsida value prop 3 s · CTA · visuell hierarki ·',
  'mobil 52px · konsekvent AK1A-känsla.',
  ''
].join('\n');
fs.appendFileSync(A + '/worklog.md', wl);

const rad = JSON.stringify({
  ts: ut.nu, rond: 148,
  beslut: 'Gränsnittsvaktskur /rapportakademin: GET svarar 200+kod-i-kropp för gäst/fas1 (webbläsarens 401-resursloggning i devtools = vaktens 4 fynd, en rot), POST behåller 401/403; tsc 0, pushad 067f7c1b; bygg sekvenseras av prod-synken (V235), DoD-bevakare pollar för 0-fynd-stängning; lärdom: tunga byggen aldrig via node-execFile-timeout',
  landat: '141c7e77 + bokföring'
}) + '\n';
for (const t of [A + '/data/vakten/beslutsminne.jsonl', P + '/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); ut['minne:' + (t === P ? 'prod' : 'agent')] = 'OK'; } catch (e) { ut.minneFEL = e.message.slice(0, 80); } }

S(A, 'git', ['add', '-A']);
ut.commit = S(A, 'git', ['commit', '-m', 'studio: rond 148 bokföring [organ:Ψ] — vakt-kur levererad (141c7e77/067f7c1b), bygg hos synken (V235), DoD-bevakare pollar, branding-kartlagd för nästa våg'], 300000).split('\n').find(r => /files changed|develop/i.test(r)) || 'OK';
for (let i = 1; i <= 4; i++) {
  if ((blockerare() || []).length === 0) {
    S(A, 'git', ['fetch', 'prod', 'develop'], 60000);
    const bakom = +(S(A, 'git', ['rev-list', '--count', 'HEAD..prod/develop'], 30000).trim() || '0');
    if (bakom > 0) S(A, 'git', ['merge', 'prod/develop', '--no-edit', '-m', 'studio: merge prod → develop (rond 148 bokföring)'], 120000);
    const push = S(A, 'git', ['push', 'prod', 'develop'], 120000);
    if (!/FEL/.test(push)) { ut.pushad = true; ut.push = push.split('\n').filter(r => /develop|->/.test(r)).join(' ').slice(0, 120); break; }
    ut['retry' + i] = push.slice(0, 100);
  } else { ut['vantar' + i] = blockerare().slice(0, 2); }
  if (i < 4) await new Promise(r => setTimeout(r, 50000));
}
ut.head = S(A, 'git', ['log', '--oneline', '-1'], 30000).trim().slice(0, 70);
console.log(JSON.stringify(ut, null, 1));
