// v206 (r312): PUSH-BEVAKARE — r311-mönstret. Fabrikens barn committar direkt
// i AK1 och håller ytan smutsig; updateInstead avvisar tills barnet levererar.
// Denna bevakare: poll 60 s · tak 90 min · cykel = fetch + merge hem + push.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r312-pushbevakare.log';
const KVITTO = 'data/vakten/r312-push-kvitto.json';
const TAK_MS = 90 * 60 * 1000;
const start = Date.now();

function log(rad) {
  const line = `${new Date().toISOString()} ${rad}\n`;
  fs.appendFileSync(LOGG, line);
  console.log(line.trim());
}
function kort(cmd) {
  try { return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: 30_000 }).trim() }; }
  catch (e) { return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim() }; };
}

const startad = Date.now();
log(`BEVAKARE START — mål: v206 beed9f7d (+merges) i prod`);

while (Date.now() - start < TAK_MS) {
  // 1. Hämta hem fabrikens direkt-commits i AK1 (merge i arbetsytan)
  const fetch = kort('git fetch prod develop');
  const mergeBas = kort('git merge-base HEAD prod/develop');
  const head = kort('git rev-parse HEAD').ut;
  const senasteMerge = kort('git log --oneline -1').ut;
  if (mergeBas.ut !== head) {
    // prod/develop har commits vi saknar (fabriken) — merge hem
    const merge = kort('git merge prod/develop -m "studio: merge prod develop — r312 v206-fönster (fabrikens direkt-commits hem)"');
    log(merge.kod === 0 ? `MERGE HEM: ${kort('git log --oneline -1').ut}` : `MERGE FEL: ${merge.ut.slice(0, 200)}`);
    if (merge.kod !== 0) {
      kort('git merge --abort');
      log('Merge avbröts — nytt försök nästa varv');
    }
  }
  // 2. Ren yta i AK1?
  const smuts = kort('git -C /home/ak1a/AK1 status --porcelain').ut;
  if (smuts) {
    log(`Ytan smutsig (${smuts.split('\n').length} rader) — barn levererar, sover 60 s`);
    await sleep(60_000);
    continue;
  }
  // 3. Pusha
  const push = kort('git push prod develop');
  if (push.kod === 0) {
    const prodHead = kort('git -C /home/ak1a/AK1 log --oneline -1').ut;
    log(`PUSH GRÖN — prod HEAD: ${prodHead}`);
    fs.writeFileSync(KVITTO, JSON.stringify({
      ts: new Date().toISOString(), våg: 'v206', commit: 'beed9f7d',
      push: 'GRÖN', prodHead, bevakareMs: Date.now() - start,
    }, null, 1));
    process.exit(0);
  }
  log(`Push avvisad: ${push.ut.split('\n').slice(-3).join(' | ').slice(0, 200)} — sover 60 s`);
  await sleep(60_000);
}
log('TAK 90 MIN — bevakaren avslutar; nästa rond tar över');
process.exit(2);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
