// _v221-historiekoll2.mjs — räknar och sammanfattar divergensen develop vs prod/develop.
import { execFileSync } from 'node:child_process';

const MIN = '/home/ak1a/agent/ak1';
const git = (args) => execFileSync('git', args, { encoding: 'utf8', timeout: 20000, cwd: MIN }).trim();

const saknarJag = git(['rev-list', '--count', 'develop..prod/develop']);
const saknarProd = git(['rev-list', '--count', 'prod/develop..develop']);
console.log(`Commits jag saknar (develop..prod/develop): ${saknarJag}`);
console.log(`Commits prod saknar (prod/develop..develop): ${saknarProd}`);
console.log(`Merge-base: ${git(['merge-base', 'develop', 'prod/develop'])}`);

console.log('\n== De 5 senaste commits jag saknar (kort) ==');
const mine = git(['log', '--format=%h %ci %s', '-5', 'develop..prod/develop']).split('\n');
for (const r of mine) console.log(r.slice(0, 110));

console.log('\n== Äldsta commit jag saknar (kort) ==');
const äldsta = git(['log', '--format=%h %ci %s', '--reverse', '-3', 'develop..prod/develop']).split('\n');
for (const r of äldsta) console.log(r.slice(0, 110));

console.log('\n== De 6 commits prod saknar (mitt håll, kort) ==');
const prodSaknar = git(['log', '--format=%h %ci %s', '-6', 'prod/develop..develop']).split('\n');
for (const r of prodSaknar) console.log(r.slice(0, 110));

console.log('\n== Prod-ytans arbetskatalog: kör zcode-rutten (d76a3db2) något bygge? ==');
const status = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8', timeout: 20000, cwd: '/home/ak1a/AK1' }).trim();
console.log(status ? status.split('\n').slice(0, 10).join('\n') : '(ren)');
