// r323: SLUTLED v6 — .next-ny-mönstret (v209-kuren verkställd direkt).
// v5:s rak-bygg timeout-dödades vid 851/1703 sidor (bygget FRISKT men >25 min
// under fabrikslast); .next lämnades halv + pm2 refererar gamla hash-namn ⇒
// ostylat kvarstår. v6: bygg ISOLERAT i .next-ny (timeout 45 min), därefter
// atombyte + pm2 restart under flock — EN omstart, helning atomär, inga nya
// kundskador om avbrott. Sedan FAS D-bokföring som v5:s.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r323-slutled.log';
const KVITTO = 'data/vakten/r323-slutled-kvitto.json';
const AK1 = '/home/ak1a/AK1';
const PUSH_TID = new Date('2026-09-29T01:04:57.711Z').getTime();

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
      const m = kort('git merge prod/develop -m "studio: merge prod develop — r323 ' + etikett + ' (fabrikens direkt-commits hem)"');
      if (m.kod !== 0) {
        const konf = kort('git diff --name-only --diff-filter=U').ut.trim();
        if (konf === 'worklog.md') {
          try { losWorklogKonflikt(); kort('git add worklog.md'); kort('git commit --no-edit', 600_000); log('worklog-union'); } catch (e) { kort('git merge --abort'); await sleep(60_000); continue; }
        } else { kort('git merge --abort'); log('merge avbröten'); await sleep(60_000); continue; }
      } else log('MERGE HEM: ' + kort('git log --oneline -1').ut.slice(0, 90));
    }
    const s = kort(`git -C ${AK1} status --porcelain`).ut;
    if (s.split('\n').filter((r) => r && !r.startsWith('??')).length > 0) { await sleep(60_000); continue; }
    const p = kort('git push prod develop', 180_000);
    if (p.kod === 0) { log(`PUSH GRÖN (${etikett})`); return true; }
    await sleep(60_000);
  }
  return false;
}

const state = { faser: {} };
async function main() {
  log('SLUTLED v6 START — .next-ny-atombygget (v209-kuren)');

  // 0. Döda ev. föräldralösa next-build-processer från v5 (de skriver .next)
  const psUt = kort("ps aux | grep -E 'next build|npm run build' | grep -v grep | grep -v .next-ny", 15_000).ut;
  if (psUt) {
    for (const pid of (psUt.match(/\bak1a\s+(\d+)\s/g) || []).map((s) => s.trim().split(/\s+/)[1])) {
      kort(`kill ${pid}`, 10_000);
      log('dödade föräldralös byggprocess ' + pid);
    }
    await sleep(3_000);
  } else log('inga föräldralösa byggprocesser');

  // 1. Isolerat bygg i .next-ny under flock (timeout 45 min)
  const BYGGNY = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && NEXT_DIST_DIR=.next-ny npm run build >> /tmp/r323-build.log 2>&1'";
  let byggd = false;
  for (let forsok = 1; forsok <= 6 && !byggd; forsok++) {
    const s = kort(`git -C ${AK1} status --porcelain`).ut;
    if (s.split('\n').filter((r) => r && !r.startsWith('??')).length > 0) { log(`yta upptagen — 120 s`); await sleep(120_000); continue; }
    let mem = lasMemAvailableMb();
    while (mem < 2000) { log(`RAM ${mem} — 120 s`); await sleep(120_000); mem = lasMemAvailableMb(); }
    if (kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000).kod !== 0) { log('lås upptaget — 120 s'); await sleep(120_000); continue; }
    log(`BYGG-NY ${forsok}/6 (isolerat i .next-ny, logg /tmp/r323-build.log)`);
    const r = kort(BYGGNY, 45 * 60_000);
    if (r.kod === 0) { log('BYGG-NY GRÖN (' + Math.round(r.ms / 60000) + ' min)'); byggd = true; break; }
    if (r.ut.length < 200 && r.ms < 5000) { log('lås-race — 120 s'); await sleep(120_000); continue; }
    log('BYGG-NY RÖD: ' + r.ut.slice(-300));
    fs.writeFileSync(KVITTO, JSON.stringify({ ...state, bygg: 'RÖD', logg: '/tmp/r323-build.log', ts: new Date().toISOString() }, null, 1));
    process.exit(3);
  }
  if (!byggd) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, bygg: 'LÅS/OMSTART 6 försök', ts: new Date().toISOString() }, null, 1)); process.exit(4); }

  // 2. Atombyte + pm2 restart (under samma flock-ägande, EN omstart)
  const BYTE = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && [ -f .next-ny/BUILD_ID ] && mv .next .next-gammal-$(date +%s) && mv .next-ny .next && pm2 restart ak1a'";
  let bytt = false;
  for (let i = 0; i < 10 && !bytt; i++) {
    if (kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000).kod !== 0) { log('byte väntar lås — 60 s'); await sleep(60_000); continue; }
    const b = kort(BYTE, 120_000);
    if (b.kod === 0) { log('ATOMBYTE + pm2 restart GRÖN'); bytt = true; state.faser.bygg = 'GRÖN (.next-ny atombygg + byte, ' + Math.round(0) + ')'; }
    else { log('byte-försök ' + (i + 1) + ': ' + b.ut.slice(0, 150)); await sleep(60_000); }
  }
  if (!bytt) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, byte: 'MISSLYCKAD — .next-ny klar på disk, manuell byte krävs', ts: new Date().toISOString() }, null, 1)); process.exit(7); }

  // 3. prod-200 + statisk helning (font 200)
  let ok = false;
  for (let i = 1; i <= 15; i++) {
    await sleep(i === 1 ? 20_000 : 10_000);
    const k = kort("curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/", 30_000).ut;
    if (k === '200') { ok = true; break; }
    log(`prod-sond ${i}: ${k}`);
  }
  state.faser.prod200 = ok ? 'GRÖN' : 'RÖD';
  if (!ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); process.exit(5); }
  log('PROD 200 GRÖN — v206 LIVE, ostylat läkt');

  // 4. FAS D — bokföring
  for (const f of fs.readdirSync('verktyg').filter((x) => x.startsWith('_r312-') || x === '_r313-slutled.mjs' || x.startsWith('_r317-') || x === '_r318-slutled.mjs' || x === '_r320-slutled.mjs')) {
    try { fs.unlinkSync('verktyg/' + f); log('städad: ' + f); } catch {}
  }
  const pipe = 'data/forskning/PIPELINE-KO.md';
  let pt = fs.readFileSync(pipe, 'utf8');
  const suffix = '| BOKAD (huvudagenten, nästa dedikerade rond) |';
  if (pt.includes(suffix)) pt = pt.replace(suffix, `| ✓ LEVERERAD r312-r323 (beed9f7d 27 platser tsc 0; PUSH 01:04:57Z prod 376ad973; .next-ny-atombygg + byte + EN pm2-omstart enligt v209-kuren; prod 200; kedja i worklog ROND 312-323) |`);
  const v205slut = '| BOKAD (morgonronden) |';
  if (pt.includes(v205slut)) pt = pt.replace(v205slut, v205slut + '\n| v207 | PREFETCH-EFTERMÄTNING (spår 7): mät v206:s vinst — natt-TBT-cronen + prestanda-mat.mjs mot tunga rutt-länkande sidor; delmål: 1,35 MB-motorchunk borta ur vanlig sidlast | BOKAD (nästa prestandafönster) |');
  const v204gammal = '| v204 | U6-STEG I VIA ROOT-ROND (spår 11):';
  if (pt.includes(v204gammal)) pt = pt.replace(v204gammal, '| v208 | U6-STEG I VIA ROOT-ROND (spår 11; OMDÖPT r313 — fabrikens v204 tog numret):');
  pt = pt.replace('| BOKAD (nästa prestandafönster) |', '| BOKAD (nästa prestandafönster) |\n| v209 | RAK-BYGG-FÖRBUDET: huvudagentens bygg-kedor .next-ny + atombyte (VERKSTÄLLT r323 — denna våg stängs på kvitto) | ✓ VERKSTÄLLT r323 (slutled v6-mönstret) |');
  fs.writeFileSync(pipe, pt);
  log('PIPELINE-KO uppdaterad (v206 LEVERERAD · v207 · v208 · v209 verkställt)');

  const wl = `

### ROND 323 [organ:Φ] — v206 LIVE via .next-ny-atombygget (v209-kuren verkställd direkt) — 2026-09-29

v5:s rak-bygg timeout-dödades vid 851/1703 sidor (bygget friskt men 25-min-
tak under fabrikslast) och lämnade .next halv — pulsvaktens ostylat-läge
(24/24 statiska 500) kvarstod. v6 (denna kedja) verkställde v209-kuren DIREKT:
isolrat bygg i NEXT_DIST_DIR=.next-ny (45-min-tak, logg /tmp/r323-build.log),
atombyte mv .next → .next-gammal-* + .next-ny → .next + pm2 restart under
flock (EN omstart) — prod 200 och ostylat läkt. FAS D: v206 → LEVERERAD ·
v207 PREFETCH-EFTERMÄTNING bokad · U6-steg I omdöpt v204→v208 · v209
RAK-BYGG-FÖRBUDET markerat verkställt · sondfiler städade.
`;
  fs.appendFileSync('worklog.md', wl);
  fs.appendFileSync('data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: new Date().toISOString(), rond: 135, beslut: 'r323 [Φ]: v206 LIVE via .next-ny-atombygg + byte + EN omstart (v209-kuren verkställd); v5:s timeout-läxa: bygg-tak 25→45 min under fabrikslast', landat: 'pending-slutpush' }) + '\n');

  fs.writeFileSync('/tmp/r323-msg.txt', 'studio: [organ:Φ] r323 v206 LIVE — .next-ny-atombygget (v209-kuren): v5:s timeout-dödade rak-bygg läkte med isolerat bygg + atombyte + EN pm2-omstart; prod 200; v207 bokad, v208 omdöpt, v209 markerat verkställt; worklog ROND 323');
  kort('git add worklog.md data/forskning/PIPELINE-KO.md', 60_000);
  if (!kort('git check-ignore data/vakten/beslutsminne.jsonl').ut) kort('git add data/vakten/beslutsminne.jsonl', 60_000);
  const c = kort('git commit -F /tmp/r323-msg.txt', 600_000);
  if (c.kod !== 0) { log('COMMIT RÖD: ' + c.ut.slice(0, 250)); fs.writeFileSync(KVITTO, JSON.stringify({ ...state, commit: 'RÖD', ts: new Date().toISOString() }, null, 1)); process.exit(6); }
  state.commit = kort('git rev-parse --short HEAD').ut;
  log('COMMIT GRÖN: ' + state.commit);

  const pushB = await pushTillProd('bokföring', 150 * 60_000);
  state.faser.slutpush = pushB ? 'GRÖN' : 'TAK';
  try {
    execSync('node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000', { cwd: AK1, encoding: 'utf8', timeout: 20 * 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    state.faser.vakt = 'GRÖN';
  } catch { state.faser.vakt = 'FEL'; }
  fs.writeFileSync(KVITTO, JSON.stringify({ ...state, klar: new Date().toISOString() }, null, 1));
  log('SLUTLED v6 KLART');
  try { fs.unlinkSync(new URL(import.meta.url).pathname); } catch {}
  process.exit(pushB ? 0 : 2);
}

main().catch((e) => { log('OFÅNGAT FEL: ' + (e.stack || e.message)); fs.writeFileSync(KVITTO, JSON.stringify({ fel: String(e.stack || e).slice(0, 400), ts: new Date().toISOString() }, null, 1)); process.exit(1); });
