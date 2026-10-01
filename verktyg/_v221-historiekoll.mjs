// _v221-historiekoll.mjs — diagnotiserar develop vs prod/develop efter avvisad push.
import { execFileSync } from 'node:child_process';

const MIN = '/home/ak1a/agent/ak1';
const PROD = '/home/ak1a/AK1';
const git = (cwd, args) => execFileSync('git', args, { encoding: 'utf8', timeout: 20000, cwd }).trim();

console.log('== prod-ytans HEAD-historik (senaste 8) ==');
try { console.log(git(PROD, ['log', '--oneline', '-8'])); } catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== develop..prod/develop (commits JAG saknar) ==');
try { console.log(git(MIN, ['log', '--oneline', 'develop..prod/develop'])); } catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== prod/develop..develop (commits PROD saknar) ==');
try { console.log(git(MIN, ['log', '--oneline', 'prod/develop..develop'])); } catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== merge-base develop prod/develop ==');
try { console.log(git(MIN, ['merge-base', 'develop', 'prod/develop'])); } catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== prod-ytans status just nu ==');
try {
  const s = git(PROD, ['status', '--porcelain']);
  console.log(s ? s.split('\n').slice(0, 12).join('\n') : '(ren)');
} catch (e) { console.log('FEL: ' + e.message); }

console.log('\n== prod-ytans HEAD ==');
try { console.log(git(PROD, ['log', '--oneline', '-1'])); } catch (e) { console.log('FEL: ' + e.message); }
