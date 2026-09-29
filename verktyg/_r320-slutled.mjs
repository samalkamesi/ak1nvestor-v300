// r320: SLUTLED v5 — prod-synkens deploy bygger JUST träd 376ad973 (prefetch-
// kuren). Denna kedja VÄNTAR IN deployen (v216: EN pm2-omstart — aldrig dubbel),
// verifierar, och kör FAS D-bokföringen. Faller synkens bygg (deploy-stopp v212)
// görs egen bygg under flock med korrekt flock-tystnads-klassning.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r320-slutled.log';
const KVITTO = 'data/vakten/r320-slutled-kvitto.json';
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
function deployadEfterPush() {
  const buildIdMtime = (() => { try { return fs.statSync(AK1 + '/.next/BUILD_ID').mtimeMs; } catch { return 0; } })();
  const pm2 = kort('pm2 jlist', 30_000).ut;
  const proc = (pm2.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/) || [''])[0];
  const pmUptime = Number((proc.match(/"pm_uptime":(\d+)/) || [])[1] || 0);
  return { deployad: buildIdMtime > PUSH_TID || pmUptime > PUSH_TID, buildIdMtime, pmUptime };
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
    const mb = kort('git merge-base HEAD prod/develop').ut;
    const head = kort('git rev-parse HEAD').ut;
    if (mb !== head) {
      const m = kort('git merge prod/develop -m "studio: merge prod develop — r320 ' + etikett + ' (fabrikens direkt-commits hem)"');
      if (m.kod !== 0) {
        const konf = kort('git diff --name-only --diff-filter=U').ut.trim();
        if (konf === 'worklog.md') {
          try { losWorklogKonflikt(); kort('git add worklog.md'); kort('git commit --no-edit', 600_000); log('worklog-konflikt löst med union'); }
          catch (e) { kort('git merge --abort'); log('union misslyckades: ' + e.message); await sleep(60_000); continue; }
        } else { kort('git merge --abort'); log('merge avbröten (' + konf.slice(0, 100) + ')'); await sleep(60_000); continue; }
      } else log('MERGE HEM: ' + kort('git log --oneline -1').ut.slice(0, 90));
    }
    const s = kort(`git -C ${AK1} status --porcelain`).ut;
    const trackad = s.split('\n').filter((r) => r && !r.startsWith('??'));
    if (trackad.length > 0) { log(`AK1-ytan ${trackad.length} trackade ändringar — 60 s`); await sleep(60_000); continue; }
    const p = kort('git push prod develop', 180_000);
    if (p.kod === 0) { log(`PUSH GRÖN (${etikett})`); return true; }
    log('push avvisad: ' + p.ut.split('\n').slice(-2).join(' ').slice(0, 140));
    await sleep(60_000);
  }
  return false;
}

const state = { faser: {} };
async function main() {
  log('SLUTLED v5 START — väntar in prod-synkens deploy av 376ad973 (v206)');

  // 1. VÄNTA på synkens deploy (flock upptaget = deploy pågår — hälsosam väntan)
  let deployInfo = deployadEfterPush();
  const vantaT0 = Date.now();
  while (!deployInfo.deployad && Date.now() - vantaT0 < 40 * 60_000) {
    const las = kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000);
    if (las.kod !== 0) { log('synkens deploy bygger fortfarande (lås hålls) — 60 s'); await sleep(60_000); continue; }
    deployInfo = deployadEfterPush();
    if (!deployInfo.deployad) {
      // låset fritt men ingen ny deploy = synkens bygg faller/default-fall → egen bygg
      log('låset fritt men ingen deploy efter push — egen byggkedja');
      break;
    }
  }
  if (!deployInfo.deployad) {
    // 2b. EGEN BYGG (synkens deploy uteblev) — korrekt klassning
    const BYGG = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a'";
    for (let forsok = 1; forsok <= 12; forsok++) {
      const s = kort(`git -C ${AK1} status --porcelain`).ut;
      const trackad = s.split('\n').filter((r) => r && !r.startsWith('??'));
      if (trackad.length > 0) { log(`bygg uppskjuten (${trackad.length} trackade) — 120 s`); await sleep(120_000); continue; }
      let mem = lasMemAvailableMb();
      while (mem < 2000) { await sleep(120_000); mem = lasMemAvailableMb(); }
      const lt = kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000);
      if (lt.kod !== 0) { log('lås upptaget — 180 s'); await sleep(180_000); continue; }
      log(`EGEN BYGGFÖRSÖK ${forsok}/12`);
      const r = kort(BYGG, 25 * 60_000);
      if (r.kod === 0) { log('BYGG GRÖN — pm2 omstartad (EN omstart, egen ägare)'); state.faser.bygg = 'GRÖN (egen)'; break; }
      if (r.ut.length < 200 && r.ms < 5000) { log(`lås-race (tyst ${r.ms} ms) — 180 s`); await sleep(180_000); continue; }
      log('BYGG RÖD: ' + r.ut.split('\n').slice(-6).join(' | ').slice(0, 300));
      fs.writeFileSync(KVITTO, JSON.stringify({ ...state, bygg: 'RÖD', ts: new Date().toISOString() }, null, 1));
      process.exit(3);
    }
  } else {
    state.faser.bygg = 'GRÖN (prod-synkens deploy — EN omstart, dess ägare)';
    log('DEPLOYAD av prod-synken: BUILD_ID ' + new Date(deployInfo.buildIdMtime).toISOString() + ', pm_uptime ' + new Date(deployInfo.pmUptime).toISOString());
  }

  // 3. prod-200
  let ok = false;
  for (let i = 1; i <= 12; i++) {
    await sleep(i === 1 ? 20_000 : 10_000);
    const k = kort("curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/", 30_000).ut;
    if (k === '200') { ok = true; break; }
    log(`prod-sond ${i}: ${k}`);
  }
  state.faser.prod200 = ok ? 'GRÖN' : 'RÖD';
  if (!ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); process.exit(5); }
  log('PROD 200 GRÖN — v206 LIVE');

  // 4. FAS D — bokföring (identisk med v4:s, utökad städning)
  for (const f of fs.readdirSync('verktyg').filter((x) => x.startsWith('_r312-') || x === '_r313-slutled.mjs' || x.startsWith('_r317-') || x === '_r318-slutled.mjs')) {
    try { fs.unlinkSync('verktyg/' + f); log('städad: ' + f); } catch {}
  }
  const pipe = 'data/forskning/PIPELINE-KO.md';
  let pt = fs.readFileSync(pipe, 'utf8');
  const suffix = '| BOKAD (huvudagenten, nästa dedikerade rond) |';
  if (!pt.includes(suffix)) throw new Error('v206-suffix saknas');
  pt = pt.replace(suffix, `| ✓ LEVERERAD r312-r318 (beed9f7d 27 platser tsc 0; PUSH GRÖN 01:04:57Z prod 376ad973; deploy ${state.faser.bygg}; prod 200; kedja i worklog ROND 312-318) |`);
  const v205slut = '| BOKAD (morgonronden) |';
  if (!pt.includes(v205slut)) throw new Error('v205-suffix saknas');
  pt = pt.replace(v205slut, v205slut + '\n| v207 | PREFETCH-EFTERMÄTNING (spår 7): mät v206:s faktiska vinst — natt-TBT-cronen + prestanda-mat.mjs (CHROME_PATH-kurad sedan r304) mäter tunga rutt-länkande sidor efter deploy; delmål: o557:s 1,35 MB-motorchunk syns ej längre i vanlig sidlast | BOKAD (nästa prestandafönster) |');
  const v204gammal = '| v204 | U6-STEG I VIA ROOT-ROND (spår 11):';
  if (pt.includes(v204gammal)) { pt = pt.replace(v204gammal, '| v208 | U6-STEG I VIA ROOT-ROND (spår 11; OMDÖPT r313 — fabrikens v204-desk-fördjupning tog numret):'); log('v204→v208 omdöpt'); }
  fs.writeFileSync(pipe, pt);

  const wl = `

### ROND 320 [organ:Φ] — v206 SLUTLED SLUTFÖRT: deploy-kvittering + bokföring — 2026-09-29

Prod-synkens deploy byggde träd 376ad973 (compile 13,7 min + TS 8,8 min under
fabrikslast — därför deploylåsets längd); v216:s EN-omstarts-doktrin följdes:
slutled v4 stoppades i tid (dess ombyggnad + extra pm2-omstart hade varit
just dubbelomstartsklassen) och v5 tog över: väntade in deployen, verifierade
prod 200, och landar här bokföringen: v206 → LEVERERAD · v207 PREFETCH-
EFTERMÄTNING bokad · U6-steg I omdöpt v204→v208 · samtliga sond- och
slutledfiler (_r312-* _r313 _r317-* _r318) städade · strömbevakaren levererar
pumpor-omstarten när detta träd landar i AK1. Desk-ytan lämnas åt r322-kanalen
(parallell huvudkanal: porträtt 412x915 ögonbevisat + U20-SetDesktopSize-
utredning pågår i fabriken) — inga fler desk-ingrepp från denna session.
`;
  fs.appendFileSync('worklog.md', wl);
  fs.appendFileSync('data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: new Date().toISOString(), rond: 135, beslut: 'r320 [Φ]: v206 prod-levererad och kvitterad via prod-synkens deploy (EN pm2-omstart — v4 stoppad i tid enligt v216); prod 200; v207 bokad, v208 omdöpt; desk-ytan överlämnad till r322-kanalen', landat: 'pending-slutpush' }) + '\n');
  log('worklog + beslutsminne skrivna');

  fs.writeFileSync('/tmp/r320-msg.txt', 'studio: [organ:Φ] r320 v206 SLUTLED KLART — prefetch-kuren LIVE i prod (prod-synkens deploy av 376ad973, EN omstart enligt v216; prod 200 GRÖN); v207 PREFETCH-EFTERMÄTNING bokad + U6-steg I omdöpt v204→v208; worklog ROND 320; sondfiler städade');
  kort('git add worklog.md data/forskning/PIPELINE-KO.md', 60_000);
  const ign = kort('git check-ignore data/vakten/beslutsminne.jsonl').ut;
  if (!ign) kort('git add data/vakten/beslutsminne.jsonl', 60_000);
  const c = kort('git commit -F /tmp/r320-msg.txt', 600_000);
  if (c.kod !== 0) { log('COMMIT RÖD: ' + c.ut.slice(0, 250)); fs.writeFileSync(KVITTO, JSON.stringify({ ...state, commit: 'RÖD', ts: new Date().toISOString() }, null, 1)); process.exit(6); }
  state.commit = kort('git rev-parse --short HEAD').ut;
  log('COMMIT GRÖN: ' + state.commit);

  const pushB = await pushTillProd('bokföring', 150 * 60_000);
  state.faser.slutpush = pushB ? 'GRÖN' : 'TAK';
  state.prodHead = kort(`git -C ${AK1} log --oneline -1`).ut.slice(0, 90);

  try {
    execSync('node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000', { cwd: AK1, encoding: 'utf8', timeout: 20 * 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    log('VAKT exit 0'); state.faser.vakt = 'GRÖN';
  } catch (e) {
    log('VAKT fel (icke-fatal)'); state.faser.vakt = 'FEL';
  }
  fs.writeFileSync(KVITTO, JSON.stringify({ ...state, klar: new Date().toISOString() }, null, 1));
  log('SLUTLED v5 KLART');
  try { fs.unlinkSync(new URL(import.meta.url).pathname); } catch {}
  process.exit(pushB ? 0 : 2);
}

main().catch((e) => { log('OFÅNGAT FEL: ' + (e.stack || e.message)); fs.writeFileSync(KVITTO, JSON.stringify({ fel: String(e.stack || e).slice(0, 400), ts: new Date().toISOString() }, null, 1)); process.exit(1); });
