#!/usr/bin/env node
// _r195-v173-mall.mjs — kandidatbacklogen + de bevisade verktygsmallarna (v209-inlagg + o29-llms-regen)
import fs from 'node:fs';
const ROT = '/home/ak1a/agent/ak1';
const ut = [];

ut.push('=== S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md (hela, max 6000) ===');
ut.push(fs.readFileSync(`${ROT}/data/forskning/S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md`, 'utf8').slice(0, 6000));

ut.push('\n=== _v209u2-universum-inlagg.mjs (första 4500) ===');
ut.push(fs.readFileSync(`${ROT}/verktyg/_v209u2-universum-inlagg.mjs`, 'utf8').slice(0, 4500));

ut.push('\n=== _s2u3o29-llms-regen.mjs (första 3500) ===');
ut.push(fs.readFileSync(`${ROT}/verktyg/_s2u3o29-llms-regen.mjs`, 'utf8').slice(0, 3500));

fs.writeFileSync('/tmp/r195-mall.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r195-mall.txt · ' + ut.join('\n').length + ' tecken');
