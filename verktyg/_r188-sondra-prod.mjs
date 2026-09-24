#!/usr/bin/env node
// _r188-sondra-prod.mjs — varför avvisade prod pushen? (fil-skrivande enligt skal-kvoten)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const ut = [];
const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

ut.push('=== prod-trädets status (porcelain) ===');
ut.push(git(['status', '--porcelain'], PROD) || '(rent)');

ut.push('\n=== prod-trädets HEAD ===');
ut.push(git(['log', '--oneline', '-3'], PROD));

ut.push('\n=== fetch + commit-läge arbetsyta mot prod ===');
ut.push(git(['fetch', 'prod'], ROT));
const deSaknar = git(['log', '--oneline', 'HEAD..prod/develop'], ROT);
const viSaknar = git(['log', '--oneline', 'prod/develop..HEAD'], ROT);
ut.push('DE HAR (vi saknar):\n' + (deSaknar || '(inget)'));
ut.push('VI HAR (de saknar):\n' + (viSaknar || '(inget)'));

fs.writeFileSync('/tmp/r188-sondra.txt', ut.join('\n') + '\n');
console.log('skrev /tmp/r188-sondra.txt');
