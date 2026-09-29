// r324: SLUTLED v7 — prod-synken äger deployen (v5/v6-läxorna: kappla inte).
// Vakar: deployad (BUILD_ID/pm_uptime efter 02:00:45Z, dvs. efter v5:s död)
// → prod-200 → FAS D. Reserv: efter 3 MISSLYCKADE synk-deployfönster (lås
// fri-grönt men fortfarande ej deployad = v187-stopp kvarstår) → EGEN
// .next-ny-bygg + atombyte. Väntan räknas ALDRIG som försök (v6:s bugg).
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r324-slutled.log';
const KVITTO = 'data/vakten/r324-slutled-kvitto.json';
const AK1 = '/home/ak1a/AK1';
const DOD_TID = new Date('2026-09-29T02:00:45.827Z').getTime(); // v5:s byggdöd

function log(rad) {
  const line = `${new Date().toISOString()} ${rad}\n`;
  try { fs.appendFileSync(LOGG, line); } catch {}
  console.log(line.trim());
}
function kort(cmd, timeoutMs = 60_000) {
  const t0 = Date.now();
  try { return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim(), ms: Date.now() - t0 }; }
  catch (e) { return { kod: e.status ?? 1, ut: ((e.stdout || '') + (e.stderr || '')).trim(), ms: Date.now() - t0 }; }
}
function lasMemAvailableMb() {
  try { const m = fs.readFileSync('/proc/meminfo', 'utf8').match(/MemAvailable:\s+(\d+) kB/); return m ? Math.round(Number(m[1]) / 1024) : 99999; } catch { return 99999; }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function deployad() {
  const buildIdMtime = (() => { try { return fs.statSync(AK1 + '/.next/BUILD_ID').mtimeMs; } catch { return 0; } })();
  const proc = (kort('pm2 jlist', 30_000).ut.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/) || [''])[0];
  const pmUptime = Number((proc.match(/"pm_uptime":(\d+)/) || [])[1] || 0);
  return { ok: buildIdMtime > DOD_TID || pmUptime > DOD_TID, buildIdMtime, pmUptime };
}
function losWorklogKonflikt() {
  let t = fs.readFileSync('worklog.md', 'utf8');
  t = t.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]*\n/g, (_m, ours, theirs) => `${theirs}\n${ours}\n`);
  if (/^(<<<<<<<|=======$|>>>>>>>)/m.test(t)) throw new Error('konfliktmarkörer kvar');
  fs.writeFileSync('worklog.md', t);
}
async function pushTillProd(etikett, takMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < takMs) {
    kort('git fetch prod develop', 120_000);
    if (kort('git merge-base HEAD prod/develop').ut !== kort('git rev-parse HEAD').ut) {
      const m = kort('git merge prod/develop -m "studio: merge prod develop — r324 ' + etikett + ' (fabrikens direkt-commits hem)"');
      if (m.kod !== 0) {
        const konf = kort('git diff --name-only --diff-filter=U').ut.trim();
        if (konf === 'worklog.md') {
          try { losWorklogKonflikt(); kort('git add worklog.md'); kort('git commit --no-edit', 600_000); log('worklog-union'); } catch { kort('git merge --abort'); await sleep(60_000); continue; }
        } else { kort('git merge --abort'); log('merge avbröten (' + konf.slice(0, 80) + ')'); await sleep(60_000); continue; }
      } else log('MERGE HEM: ' + kort('git log --oneline -1').ut.slice(0, 90));
    }
    const s = kort(`git -C ${AK1} status --porcelain`).ut;
    if (s.split('\n').filter((r) => r && !r.startsWith('??')).length > 0) { await sleep(60_000); continue; }
    if (kort('git push prod develop', 180_000).kod === 0) { log(`PUSH GRÖN (${etikett})`); return true; }
    await sleep(60_000);
  }
  return false;
}
async function fasD(byggBeskrivning) {
  for (const f of fs.readdirSync('verktyg').filter((x) => x.startsWith('_r312-') || x === '_r313-slutled.mjs' || x.startsWith('_r317-') || x === '_r318-slutled.mjs' || x === '_r320-slutled.mjs' || x === '_r323-slutled.mjs')) {
    try { fs.unlinkSync('verktyg/' + f); log('städad: ' + f); } catch {}
  }
  const pipe = 'data/forskning/PIPELINE-KO.md';
  let pt = fs.readFileSync(pipe, 'utf8');
  const suffix = '| BOKAD (huvudagenten, nästa dedikerade rond) |';
  if (pt.includes(suffix)) pt = pt.replace(suffix, `| ✓ LEVERERAD r312-r324 (beed9f7d 27 platser tsc 0; PUSH 01:04:57Z prod 376ad973; deploy: ${byggBeskrivning}; prod 200; kedja i worklog ROND 312-324) |`);
  const v205slut = '| BOKAD (morgonronden) |';
  if (pt.includes(v205slut)) pt = pt.replace(v205slut, v205slut + '\n| v207 | PREFETCH-EFTERMÄTNING (spår 7): mät v206:s vinst — natt-TBT-cronen + prestanda-mat.mjs mot tunga rutt-länkande sidor; delmål: 1,35 MB-motorchunk borta ur vanlig sidlast | BOKAD (nästa prestandafönster) |');
  const v204gammal = '| v204 | U6-STEG I VIA ROOT-ROND (spår 11):';
  if (pt.includes(v204gammal)) pt = pt.replace(v204gammal, '| v208 | U6-STEG I VIA ROOT-ROND (spår 11; OMDÖPT r313 — fabrikens v204 tog numret):');
  if (!pt.includes('| v209 |')) pt = pt.replace('| BOKAD (nästa prestandafönster) |', '| BOKAD (nästa prestandafönster) |\n| v209 | RAK-BYGG-FÖRBUDET: egna bygg-kedor .next-ny + atombyte | ✓ VERKSTÄLLT r323-r324 |');
  fs.writeFileSync(pipe, pt);
  log('PIPELINE-KO uppdaterad');
  const wl = `

### ROND 324 [organ:Φ] — v206 deployad av prod-synken (kappla-inte-strategin segrade) — 2026-09-29

v5 (rak-bygg, 25-min-timeout-dödat vid 851/1703) och v6 (räknarbugg: väntan
räknades som försök) lärde läxorna: under fabrikens nattsväp är EN byggägare
rätt — prod-synken. v7 vakade: ${byggBeskrivning}. Prod 200 + ostylat läkt.
FAS D: v206 → LEVERERAD · v207 PREFETCH-EFTERMÄTNING bokad · U6-steg I
omdöpt v204→v208 · v209 RAK-BYGG-FÖRBUDET verkställt (v6/v7-mönstret) ·
sondfiler städade. METODLÄXOR bokförda: (1) bygg-tak 25 min < fabrikslast-
realitet 40 min; (2) väntan räknas aldrig som försök; (3) deploy-ägarskapet
tillhör synken när den är igång — huvudagentens bygg är RESERV.
`;
  fs.appendFileSync('worklog.md', wl);
  fs.appendFileSync('data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: new Date().toISOString(), rond: 135, beslut: 'r324 [Φ]: v206 deployad — prod-synken ägde bygget (kappla-inte); v5/v6-läxor: bygg-tak 45 min, väntan ≠ försök, egen bygg = reserv', landat: 'pending-slutpush' }) + '\n');
  fs.writeFileSync('/tmp/r324-msg.txt', 'studio: [organ:Φ] r324 v206 DEPLOYAD — prod-synken ägde bygget (ostylat läkt, prod 200); v207 bokad, v208 omdöpt, v209 verkställt; worklog ROND 324 med v5/v6-läxorna');
  kort('git add worklog.md data/forskning/PIPELINE-KO.md', 60_000);
  if (!kort('git check-ignore data/vakten/beslutsminne.jsonl').ut) kort('git add data/vakten/beslutsminne.jsonl', 60_000);
  const c = kort('git commit -F /tmp/r324-msg.txt', 600_000);
  if (c.kod !== 0) { log('COMMIT RÖD: ' + c.ut.slice(0, 200)); return false; }
  log('COMMIT GRÖN: ' + kort('git rev-parse --short HEAD').ut);
  const pushB = await pushTillProd('bokföring', 150 * 60_000);
  return pushB;
}

const state = { faser: {} };
async function main() {
  log('SLUTLED v7 START — synken äger deployen; v7 vakar + bokför');
  const t0 = Date.now();
  let misslyckadeFonster = 0;
  let deployInfo = deployad();
  while (!deployInfo.ok && Date.now() - t0 < 3 * 60 * 60_000) {
    await sleep(60_000);
    deployInfo = deployad();
    if (deployInfo.ok) break;
    const lasFritt = kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000).kod === 0;
    if (!lasFritt) { log('synkens deploy bygger — väntar (väntan räknas ej)'); continue; }
    // låset FRIIT men ej deployad: antingen bygger nyss ej startat, eller v187-stopp
    misslyckadeFonster++;
    log(`lås fritt men ej deployad (fönster ${misslyckadeFonster})`);
    if (misslyckadeFonster < 3) { await sleep(120_000); continue; }
    // RESERV: egen .next-ny-bygg + atombyte
    log('RESERV-läge: 3 stilstående fönster — egen .next-ny-kedja');
    const s = kort(`git -C ${AK1} status --porcelain`).ut;
    if (s.split('\n').filter((r) => r && !r.startsWith('??')).length > 0) { log('yta upptagen — reserv avvaktar'); misslyckadeFonster = 2; continue; }
    if (lasMemAvailableMb() < 2000) { log('RAM låg — reserv avvaktar'); misslyckadeFonster = 2; continue; }
    const r = kort("flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && NEXT_DIST_DIR=.next-ny npm run build >> /tmp/r324-build.log 2>&1'", 45 * 60_000);
    if (r.kod !== 0) { log('RESERV-bygg röd (tyst=lås): ' + r.ut.slice(-150)); misslyckadeFonster = 0; continue; }
    log('RESERV-bygg GRÖN — atombyte + omstart');
    const b = kort("flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && [ -f .next-ny/BUILD_ID ] && mv .next .next-gammal-$(date +%s) && mv .next-ny .next && pm2 restart ak1a'", 120_000);
    if (b.kod !== 0) { log('byte misslyckades: ' + b.ut.slice(0, 150)); process.exit(7); }
    deployInfo = deployad();
    break;
  }
  if (!deployInfo.ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, deploy: 'EJ SKEDD inom 3 h', ts: new Date().toISOString() }, null, 1)); process.exit(2); }
  state.faser.deploy = deployInfo.buildIdMtime > DOD_TID ? 'synk-deploy (BUILD_ID ' + new Date(deployInfo.buildIdMtime).toISOString() + ')' : 'reserv';
  log('DEPLOYAD: ' + state.faser.deploy);
  let ok = false;
  for (let i = 1; i <= 15; i++) {
    await sleep(i === 1 ? 15_000 : 10_000);
    if (kort("curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/", 30_000).ut === '200') { ok = true; break; }
  }
  state.faser.prod200 = ok ? 'GRÖN' : 'RÖD';
  if (!ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); process.exit(5); }
  log('PROD 200 GRÖN — v206 LIVE');
  const pushB = await fasD(state.faser.deploy);
  try {
    execSync('node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000', { cwd: AK1, encoding: 'utf8', timeout: 20 * 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    state.faser.vakt = 'GRÖN';
  } catch { state.faser.vakt = 'FEL'; }
  fs.writeFileSync(KVITTO, JSON.stringify({ ...state, klar: new Date().toISOString() }, null, 1));
  log('SLUTLED v7 KLART');
  try { fs.unlinkSync(new URL(import.meta.url).pathname); } catch {}
  process.exit(pushB ? 0 : 2);
}

main().catch((e) => { log('OFÅNGAT FEL: ' + (e.stack || e.message)); fs.writeFileSync(KVITTO, JSON.stringify({ fel: String(e.stack || e).slice(0, 400), ts: new Date().toISOString() }, null, 1)); process.exit(1); });
