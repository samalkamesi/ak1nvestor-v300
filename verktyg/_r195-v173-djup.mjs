#!/usr/bin/env node
// _r195-v173-djup.mjs — dataset-routerna, lib-källorna, llms-resten, senaste läckagevakten
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

// 1. Hitta dataset-relaterade filer i src
const find = execFileSync('find', [`${ROT}/src`, '-name', '*dataset*'], { encoding: 'utf8' }).trim().split('\n');
ut.push('=== find src -name "*dataset*" ===');
ut.push(find.map((f) => path.relative(ROT, f)).join('\n'));
// också route-kataloger som serverar /dataset (catch-all?)
const grepApp = execFileSync('grep', ['-rl', 'dataset', `${ROT}/src/app`, '--include=*.tsx', '--include=*.ts'], { encoding: 'utf8' }).trim().split('\n').slice(0, 20);
ut.push('\n=== src/app-filer som nämner dataset (första 20) ===');
ut.push(grepApp.map((f) => path.relative(ROT, f)).join('\n'));

// 2. lib-källorna (datakällan!) — tolerant: find-resultatet styr
const libFiler = [...new Set([...find.map((f) => f.replace(`${ROT}/`, '')), 'src/lib/dataset-aspekter.ts'])].filter((f) => fs.existsSync(`${ROT}/${f}`) && /\.(ts|tsx|mjs)$/.test(f));
for (const f of libFiler.slice(0, 4)) {
  const t = fs.readFileSync(`${ROT}/${f}`, 'utf8');
  ut.push(`\n=== ${f} (första 2200 tecknen) ===`);
  ut.push(t.slice(0, 2200));
}

// 3. llms.txt: dataset-rader 16–23
const llms = fs.readFileSync(`${ROT}/public/llms.txt`, 'utf8').split('\n').filter((l) => /dataset/i.test(l));
ut.push(`\n=== llms.txt dataset-rader 16–${llms.length} ===`);
ut.push(llms.slice(15).join('\n').slice(0, 3000));

// 4. Senaste läckagevakten (mönstermall)
ut.push('\n=== _s2u3o29-lackagevakt.mjs (första 1500 tecknen) ===');
ut.push(fs.readFileSync(`${ROT}/verktyg/_s2u3o29-lackagevakt.mjs`, 'utf8').slice(0, 1500));

fs.writeFileSync('/tmp/r195-djup.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r195-djup.txt · ' + ut.join('\n').length + ' tecken');
