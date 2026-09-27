#!/usr/bin/env node
// _r194-kur-prob.mjs — metas avslut (för källsektionen), hm-b:s rubriker, jpmorgans alla datum
import fs from 'node:fs';
const DIR = '/home/ak1a/agent/ak1/data/blogg-utkast/kvartal/2026-q3';
const ut = [];

const meta = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-meta-q3-2026.json`, 'utf8'));
ut.push('=== META: H2 + sista 900 tkn + alla "data/"-/källträffar ===');
ut.push('H2: ' + (meta.body.match(/^## .*$/gm) || []).join(' | '));
ut.push('SLUT: …' + meta.body.trim().slice(-900));
ut.push('källträffar: ' + (meta.body.match(/(data\/[a-z/-]+\.json|Yahoo|MarketStack|StockAnalysis|IR-sida|kalender|pressrum|hämtad [0-9-]+)/gi) || []).join(' · '));

const hm = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-hm-b-q3-2026.json`, 'utf8'));
ut.push('\n=== HM-B: H2 + "läs/sätt"-träffar ===');
ut.push('H2: ' + (hm.body.match(/^## .*$/gm) || []).join(' | '));
ut.push('läs-träffar: ' + (hm.body.match(/[^.]*\b(l[aä]s|s[aä]tt|tolka)[^.]*\b/i) || []).slice(0, 3).join(' || '));

const jpm = JSON.parse(fs.readFileSync(`${DIR}/sa-laser-du-jpmorgan-q3-2026.json`, 'utf8'));
ut.push('\n=== JPMORGAN: alla datum i kroppen (2026-09/10/11) ===');
ut.push([...new Set([...jpm.body.matchAll(/2026-(09|10|11)-\d{2}|\d{1,2} (oktober|september|november)/gi)].map((m) => m[0]))].join(' · '));
ut.push('jpm: "sätt/läs"-träffar: ' + (jpm.body.match(/s[aä]tt att [a-zåäö]+|hur du [a-zåäö]+/gi) || []).slice(0, 4).join(' | '));

fs.writeFileSync('/tmp/r194-prob.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r194-prob.txt');
