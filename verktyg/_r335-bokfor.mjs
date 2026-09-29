// r335 bokför: beslutsminne + PIPELINE-rad + pollarbyte (döda 45-min, spawn 5-tim) + commit
import { execSync } from 'node:child_process';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 120000) => {
  try { return { ok: true, ut: execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim() }; }
  catch (e) { return { ok: false, ut: ((e.stdout || '') + '\n' + (e.stderr || '')).trim().slice(0, 300) }; }
};

// beslutsminne r335
fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 335,
  beslut: "r335 FÖNSTER-LUCKAN LÄKT I SKARP DRIFT: prod-synkens 09:37-bygge (från df331ae2, utan r330-r333 som avvisats av updateInstead under fabriksbarnens yta) suddade r332:s .meta-märkning — framtids-slugar svarade 200 igen. Lager 1 (skarp): _r335-markera.mjs om-märkte 8/8; Sandvik-slug (jungfrulig i processen) bevisar ÄKTA 404, tre sidors 200 = egen sonds in-memory-cache, självläker vid revalidate. Lager 2 (beständig): långpollare levererar develop vid AK1:s rent-yta-fönster (postbuild-steget ad39ed97 märker vid varje framtigt bygg). r336 bokad: ISR-omrenderingens meta-beteende efter revalidate — bevaras 404 eller skrivs statuslös meta?",
  landat: "7281b6c4 (worklog r335 + markera/sond/slutpush-skript)"
}) + '\n');

// PIPELINE-KO-rad
fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 335 [organ:Φ] (2026-09-29) — FÖNSTER-LUCKAN LÄKT I SKARP DRIFT + pushkanalen robust

| Post | Innehåll | Status |
|---|---|---|
| v211-fönstret | 09:37-bygget suddade .meta-märkningen (byggde utan ad39ed97 som fastnat i pushkö bakom updateInstead) | ✓ LÄKT r335 — om-märkt 8/8; jungfrulig slug bevisar 404; långpollare (5 h) levererar postbuild-committen vid rent fönster |
| r336 BOKAD | ISR-omrenderingens meta-beteende efter revalidate (bevaras 404-markering?) | sonder Ericsson-slugen efter >1 h |
`);

// pollarbyte: döda 45-min-pollaren (pid ur ps), starta långpollaren avknoppad
const gamla = sh('pgrep -f _r333-pushpollare.mjs');
if (gamla.ok && gamla.ut) {
  for (const pid of gamla.ut.split('\n').filter(p => p && p !== String(process.pid))) {
    const k = sh(`kill ${pid.trim()} 2>/dev/null`);
    console.log(`dödade gamla pollaren pid ${pid.trim()}: ${k.ok ? 'ok' : k.ut.slice(0, 80)}`);
  }
} else console.log('ingen gammal pollare hittad (' + gamla.ut.slice(0, 60) + ')');

const ut = fs.openSync(`${YTA}/data/vakten/r333-pushpollare-ut.log`, 'a');
const barn = spawn('node', [`${YTA}/verktyg/_r333-langpollare.mjs`], { detached: true, stdio: ['ignore', ut, ut], cwd: YTA });
barn.unref();
console.log('långpollare avknoppad pid ' + barn.pid);

// commit
const msg = 'studio: [organ:Φ] r335-bokföring beslutsminne + PIPELINE-rad + långpollare (5 h tak — 45-min-pollaren räcker ej mot eftervaktens 6 h): fönsterluckan läkt lager 1 (om-märkt, bevisat), lager 2 (postbuild-commit) levereras vid AK1:s rent-yta-fönster; r336 bokad: ISR-revalidate-sonden';
fs.writeFileSync(`${YTA}/verktyg/_r335-commitmsg2.txt`, msg + '\n');
const add = sh(`git add data/forskning/beslutsminne.jsonl data/forskning/PIPELINE-KO.md verktyg/_r333-langpollare.mjs verktyg/_r335-bokfor.mjs verktyg/_r335-commitmsg2.txt`);
console.log('add: ' + (add.ok ? 'OK' : add.ut));
const com = sh('git commit -F verktyg/_r335-commitmsg2.txt');
console.log('commit: ' + (com.ok ? com.ut.split('\n')[0] : com.ut));
const head = sh('git log --oneline -1');
console.log('HEAD: ' + (head.ok ? head.ut.slice(0, 90) : head.ut));
console.log('KLAR r335-bokfor');
