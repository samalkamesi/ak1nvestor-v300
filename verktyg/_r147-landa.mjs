// Rond 147-landning: DRIFTSBOKEN-notis + worklog + beslutsminne + git add/commit/push (node-kanalen)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/agent/ak1';
const S = (cmd, args, t = 60000) => execFileSync(cmd, args, { encoding: 'utf8', timeout: t, cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
const ut = { nu: new Date().toISOString() };

// (1) DRIFTSBOKEN — datum, symptom, rot, åtgärd, utfall (drift-ops-SKILL:ns krav)
fs.appendFileSync(ROT + '/data/DRIFTSBOKEN.md', `
## ROND 147 [organ:Ψ] — F6 RAM-NÖD STÄNGD I ROTTEN MED VACCIN (2026-09-21, GODKÄNT)

- **Symptom:** FYNN F6-rop "RAM 266 MB"; byggfönstret stängt, OOM-dödat bygg
  17:14Z, synkens poll vägrade (krav 3 224 MB).
- **Rot (Lag 2):** prod-next-serverns RSS-läcka — 4 339 MB efter 22 h drift
  (eftersond 17:xx bevis). Inte fabriklast: färskmätning vid dom = 5 219 MB.
- **Kur, två steg:** (1) målhjärtats överlevnadsomstart 17:52 lokal (journal:
  frusen turn 50 min) + auto-deploy 136 commits 27a582a0 → prod 200;
  (2) verktyg/_f6-vaccin.mjs väntade ut deploylåset, journal 18:07:14Z
  (kanal fynn-f6-vaccin, pid 587256), omstart med tak — dog efter verkställandet
  med utfallsfilen oskriven (våg 148-mönstret: verkställt, svar förlorat).
- **Vaccin (Lag 6):** max_memory_restart 2500M — LIVE (pm2 jlist 2621440000)
  + PERSISTENT (pm2 save, dump.pm2 bär taket). Läckan är nu självhelande:
  pm2 startar om ak1a mekaniskt vid 2,5 GB RSS.
- **Utfall:** prod 200 + /rapportakademin 200 (tre mättillfällen 18:24–18:27Z)
  · ak1a online RSS 68 MB · dom-rad i data/vakten/feljakt-bedomningar.jsonl
  (båda träden). RAM pendling 5 219→1 200 MB = fabriklast — fabriks-RAM-vakten
  (1 500 MB) + det nya taket äger det fortsatta förloppet.

SLUT — sektion inlagd av huvudagenten (rond 147) 2026-09-21.
`);

// (2) worklog
fs.appendFileSync(ROT + '/worklog.md', `

## ROND 147 [organ:Ψ] — F6 STÄNGD I ROTTEN MED VACCIN: FYNN:s RAM-rop (266 MB) rotorsakat till prod-next-serverns RSS-läcka (4 339 MB/22 h), kuren i två steg (målhjärtat 17:52 + auto-deploy 27a582a0; vaccin-skriptets lås-respekterande omstart 20:07, journal pid 587256), VACCINET max_memory_restart 2500M LIVE (jlist 2621440000) + persistent (pm2 save, dump-grep 1) — läckan självhelande vid 2,5 GB. Bevis: prod 200 ×3 + /rapportakademin 200 (snittets DoD hålls), dom-rad i bedömningsledgern båda träden, DRIFTSBOKEN-notis. Trädet landat: 38 rondverktyg r137–r147 + proveniens.jsonl (synkens rent-träd-krav). Öppet till nästa rond: läsguidegranskning v2:s två fynd (ATCO källmarkörer + citatparning).
`);

// (3) beslutsminne (båda träden)
const rad = JSON.stringify({
  ts: ut.nu, rond: 147,
  beslut: 'F6 stängt med vaccin: next-serverns RSS-läcka (4,3 GB/22 h) fick mekaniskt tak max_memory_restart 2500M — LIVE + pm2-save-persistent; kuren journal-bevisad i två steg; prod 200 ×3 + /rapportakademin 200; trädet landat (38 filer, synkkrav); läsguidegranskningens två fynd köade',
  landat: 'se commit'
}) + '\n';
for (const t of [ROT + '/data/vakten/beslutsminne.jsonl', '/home/ak1a/AK1/data/vakten/beslutsminne.jsonl']) { try { fs.appendFileSync(t, rad); ut['minne:' + (t.includes('AK1/') ? 'prod' : 'agent')] = 'OK'; } catch (e) { ut['minneFEL:' + t] = e.message.slice(0, 80); } }

// (4) commit + push
const msg = `studio: rond 147 [organ:Ψ] — F6 RAM-ropet stängt i roten MED VACCIN: next-serverns RSS-läcka (4,3 GB/22 h) fick mekaniskt tak max_memory_restart 2500M (LIVE jlist 2621440000 + pm2 save persistent, dump-grep 1) — läckan självhelande vid 2,5 GB; kuren journal-bevisad i två steg (målhjärtat 17:52 + auto-deploy 27a582a0 prod 200; _f6-vaccin.mjs 20:07 pid 587256, dödsfall efter verkställande = våg 148-mönstret); dom-rad i FYNN-bedömningsledgern + DRIFTSBOKEN-notis (datum/symptom/rot/åtgärd/utfall); rondverktyg r137–r147 + proveniens.jsonl landade = synkens rent-träd-krav uppfyllt (38 filer); prod 200 ×3 + /rapportakademin 200`;
fs.writeFileSync(ROT + '/verktyg/_r147-commitmsg.txt', msg);
ut.add = S('git', ['add', '-A'], 60000).length;
try { ut.commit = S('git', ['commit', '-F', 'verktyg/_r147-commitmsg.txt'], 300000).split('\n').find(r => /files changed|master|develop/i.test(r)) || 'OK'; } catch (e) { ut.commit = 'FEL: ' + e.message.slice(0, 300); }
try { ut.push = S('git', ['push', 'prod', 'develop'], 120000).split('\n').filter(r => /develop|->|reject/i.test(r)).join(' | ').slice(0, 200); } catch (e) { ut.push = 'FEL: ' + e.message.slice(0, 300); }
try { ut.statusEfter = S('git', ['status', '--porcelain'], 30000).trim(); ut.ren = ut.statusEfter === '' || (ut.statusEfter.split('\n').filter(Boolean).length <= 1); } catch (e) { ut.statusEfter = 'FEL'; }

console.log(JSON.stringify(ut, null, 1));
