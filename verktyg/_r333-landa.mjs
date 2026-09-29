// r333 landa: PIPELINE-KO + beslutsminne bokföring + merge prod + push (node-kanalen)
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const YTA = '/home/ak1a/agent/ak1';
const sh = (cmd, timeout = 180000) => {
  try { return execSync(cmd, { cwd: YTA, shell: '/bin/bash', encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }
  catch (e) { return 'FEL: ' + ((e.stdout || '') + (e.stderr || e.message)).split('\n').filter(l => !l.startsWith('hint:') && !l.startsWith(' ')).join(' ').slice(0, 400); }
};

// 1) bokföring: PIPELINE-KO + beslutsminne (worklog + rapporter + verktyg landade i b22ebbd7)
fs.appendFileSync(`${YTA}/data/forskning/PIPELINE-KO.md`, `

## ROND 333+334 [organ:Φ] (2026-09-29) — v207 EFTERMÄTNINGEN LEVERERAD OCH GRÖN

| Post | Innehåll | Status |
|---|---|---|
| v207 | Prefetch-eftermätning: puppeteer-browser-mätning av v206-kuren (initial- + scroll-las på /, /blogg, /dataset, /kurser) | ✓ LEVERERAD r333+r334 — GRÖN: 9 motorchunkar i artefakten, 0 laddas på vanliga sidor (två bygggenerationer, samma dom) |
| r334-läran | Falska positiva: 'monteCarlo\|kelly\|bayes' träffar KURSTEXT — äkta signaturer = export-/Konstant-namn ur motorerna | ✓ BOKFÖRD i verktyg/prefetch-eftermatning.mjs:s huvud (robust mot nästa bygges hash-namn) |
| v211-rest | /en/ + /ar/-speglar (on-demand, inga statiska platser) | bokfad — kvarstår till publiceringsdagarna |
`);

fs.appendFileSync(`${YTA}/data/forskning/beslutsminne.jsonl`, JSON.stringify({
  ts: new Date().toISOString(), rond: 334,
  beslut: "r333+r334 v207 EFTERMÄTNINGEN GRÖN: verktyg/prefetch-eftermatning.mjs (puppeteer, chromeSokvag-mönstret) bevisar v206-kurens mål i browser — 9 motorchunkar (äkta kodsignaturer) i artefakten, 0 laddas på /, /blogg, /dataset, /kurser i initial- ELLER scroll-las. R334-läran: textgrepp 'monteCarlo|kelly|bayes' ger falska positiva (kurstext nämner orden); äkta signaturer = export-/Konstant-namn (skannaKonfluens, AKM1_VARIABLER m.fl.) som är robusta mot bygg-hashar. Beviskedja: v207-eftermatning-2026-09-29{0858,0916,0920}.json — 0858 falska-positiv-beviset, 0916+0920 gröna domarna (två bygggenerationer). Prefetch mäts ENDAST i runtime — serverad HTML kan aldrig visa effekten (r327).",
  landat: "b22ebbd7 (verktyg + 3 rapporter + 6 sondskript + worklog r333+r334)"
}) + '\n');

// 2) commit bokföringen
const msg = 'studio: [organ:Φ] r333-tillägg v207 EFTERMÄTNING GRÖN — bokföring: PIPELINE-KO-tabell (v207 LEVERERAD, r334-läran, v211-rest bokfad) + beslutsminne r334; leveransen landad i b22ebbd7 (prefetch-eftermatning.mjs + beviskedja 0858/0916/0920 + sondskript + worklog)';
fs.writeFileSync(`${YTA}/verktyg/_r333-commitmsg2.txt`, msg + '\n');
const steg = (n, f, kritisk = true) => {
  const ut = sh(f);
  const fel = ut.startsWith('FEL');
  console.log(`[${fel ? 'FEL' : 'OK'}] ${n}: ${ut.slice(0, 300)}`);
  if (fel && kritisk) process.exit(1);
  return ut;
};

steg('git add', `git add data/forskning/PIPELINE-KO.md data/forskning/beslutsminne.jsonl verktyg/_r333-landa.mjs verktyg/_r333-commitmsg2.txt`);
steg('commit', 'git commit -F verktyg/_r333-commitmsg2.txt');

// 3) hämta prod + merge om divergens (fabriksbarn/fabrikssynk committar i AK1)
steg('fetch', 'git fetch prod');
const divergens = sh('git log --oneline develop..prod/develop');
if (divergens && !divergens.startsWith('FEL')) {
  console.log('prod-divergens:\n' + divergens.split('\n').slice(0, 12).join('\n'));
  const merge = steg('merge', 'git merge prod/develop --no-edit');
  if (merge.startsWith('FEL')) { console.log('MERGE-KONFLIKT — löses manuellt'); process.exit(1); }
} else {
  console.log('ingen prod-divergens (eller fetch fel: ' + divergens.slice(0, 120) + ')');
}

// 4) push
const push = steg('push', 'git push prod develop', false);
steg('HEAD', 'git log --oneline -1');
steg('status', 'git status --porcelain | head -5');
console.log('\nKLAR r333-landa');
