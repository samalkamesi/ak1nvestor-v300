// rond 157: granska smutsigt träd före städ-commit (härdat träd → prod)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const R = '/home/ak1a/agent/ak1';
const ut = [];

// 1. diff-statistik för modifierade filer
ut.push('── DIFF STAT (modifierade) ──');
ut.push(execFileSync('git', ['-C', R, 'diff', '--stat'], { encoding: 'utf8' }).trim());

// 2. nya sondfilers rubrikrad + radantal
ut.push('');
ut.push('── NYA FILER ──');
for (const f of ['_r153-gitfraga', '_r153-pushretry', '_r154-pushretry', '_r156-arkivkur',
  '_r156-gitfraga', '_r156-kvalitet', '_r156-lage', '_r156-lage2', '_r156-verifiera']) {
  const sokvag = `${R}/verktyg/${f}.mjs`;
  const rader = fs.readFileSync(sokvag, 'utf8').split('\n');
  ut.push(`${f}.mjs · ${rader.length} r · rubrik: ${(rader[0] || '').slice(0, 90)}`);
}

// 3. proveniens.jsonl-diffens karaktär (antal rader före/efter + sista raden)
ut.push('');
ut.push('── DATA-DIFFAR ──');
for (const rel of ['data/rapportintag/proveniens.jsonl', 'data/rapporter/motorervalidering-2026-09-02.md']) {
  const nu = fs.readFileSync(`${R}/${rel}`, 'utf8');
  ut.push(`${rel}: ${nu.split('\n').length} rader på disk`);
  ut.push(`  sista raden: ${(nu.trimEnd().split('\n').pop() || '').slice(0, 140)}`);
}

// 4. mimosa-koll: de 6 fyndfilerna i arbetsytan (snabb kontroll att härdning lever)
ut.push('');
ut.push('── MIMOSA-FYNDFILER I ARBETSYTAN (interpolerad execSync ska vara 0) ──');
for (const f of ['_r147-dod', '_r147-omstart', '_r153-dod-sond', '_s1u2-wihlborgs-q3-kontroll', '_s7u2o139efter-kor']) {
  const kod = fs.readFileSync(`${R}/verktyg/${f}.mjs`, 'utf8');
  const interp = (kod.match(/execSync\(`[^`]*\$\{/g) || []).length;
  ut.push(`${f}.mjs: interpolerade execSync = ${interp}`);
}

const rapport = ut.join('\n');
fs.writeFileSync('/home/ak1a/agent/ak1/data/vakten/r157-granskning.txt', rapport);
console.log(rapport);
