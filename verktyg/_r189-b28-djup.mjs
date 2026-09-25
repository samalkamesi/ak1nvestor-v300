#!/usr/bin/env node
// _r189-b28-djup.mjs — B28: hela claimen + hela KVD-skriptet + hela guiden
import fs from 'node:fs';
const PROD = '/home/ak1a/AK1';
const ut = [];

ut.push('=== KLAIMFIL (hela) ===');
ut.push(fs.readFileSync(`${PROD}/data/vakten/s3-b28-investmentbolag-ansprak-2026-09-24.md`, 'utf8'));

ut.push('\n=== KVD-SKRIPTET (hela) ===');
ut.push(fs.readFileSync(`${PROD}/verktyg/_s3u1-b28-kvd-investmentbolag.mjs`, 'utf8'));

ut.push('\n=== GUIDENS KROPP (hela) ===');
ut.push(JSON.parse(fs.readFileSync(`${PROD}/data/blogg-utkast/investmentbolag-sa-analyserar-du-investmentbolag.json`, 'utf8')).body);

fs.writeFileSync('/tmp/r189-b28-djup.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r189-b28-djup.txt · ' + ut.join('\n').length + ' tecken');
