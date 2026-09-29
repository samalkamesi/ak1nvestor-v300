// r339 bokför: beslutsminne + PIPELINE-bokning (r340-r342) + commit
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || '')).trim().slice(0, 300) }; }
};

fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 339,
  beslut: "r339 v211:permanent LEVERERAD I KOD: FRAMTIDS-404-gren (gren 5) i src/proxy.ts — äkta 404 FÖRE routern för schemalagda blogginlägg, omrenderings-/cache-/kallstartsokänslig. Svenskt syskonblock till våg 83 B:s SPEGLAR-404 (samma mönster: exakt regex, inline-404 i marin design, fail-open). Datafil-driven: läser data/blogg från disk med 60 s-cache — publiceringsdagen släpper igenom inom 60 s och S2-ISR publicerar (autopubliceringen bevarad). v211 har tre oberoende lager: postbuild (L1) + cron-vakt var 10:e minut (L2) + proxy-barriären (L3). tsc 0. Driftbevis bokat r340 (bygg under flock när pushkön landat).",
  landat: "54912f0c (src/proxy.ts gren 5 + worklog r339)"
}) + '\n');

fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 339 [organ:Φ] (2026-09-29) — v211:permanent i kod; tre bokningar framåt

| Post | Innehåll | Status |
|---|---|---|
| v211:permanent | FRAMTIDS-404-gren i src/proxy.ts (L3-barriären; L1 postbuild + L2 cron-vakt lever) | ✓ LEVERERAD I KOD r339 (54912f0c) — driftbevis väntar deploy |
| r340 BOKAD | Bygg under flock när pushkön landat + DRIFTBEVIS: framtids-slug ⇒ 404 MED Server-Timing-signatur (proxy-vägen, ej .meta), kontrollpost + publicerat inlägg ⇒ 200, prod 200 | nästa iteration |
| r341 BOKAD | Vaktkvitto 13:17-cronsvepet (180 kombinationer mot aktuellt träd) + systemkoll: cron-vaktens loggfönster (första */10-varven) | efter r340 |
| r342 BOKAD | S7-familjens emottag: o562/o563/o564-domerna när deras eftervakter landar (adoptera dom-JSON:er enligt deras commit-meddelanden) | löpande |
`);

const msg = 'studio: [organ:Φ] r339-bokföring beslutsminne + PIPELINE tre bokningar (r340 bygg+driftbevis proxy-grenen · r341 vaktkvitto 13:17 + cron-vaktsfönster · r342 s7-emottag av o562-564-domer)';
fs.writeFileSync(`${YTA}/verktyg/_r339-commitmsg2.txt`, msg + '\n');
const add = sh('git add data/forskning/beslutsminne.jsonl data/forskning/PIPELINE-KO.md verktyg/_r339-bokfor.mjs verktyg/_r339-commitmsg2.txt');
console.log('add: ' + (add.ok ? 'OK' : add.ut));
const com = sh('git commit -F verktyg/_r339-commitmsg2.txt');
console.log('commit: ' + (com.ok ? com.ut.split('\n')[0] : com.ut));
const head = sh('git log --oneline -1');
console.log('HEAD: ' + (head.ok ? head.ut.slice(0, 80) : head.ut));
console.log('KLAR r339-bokfor');
