// r318: SLUTLED v4 — v206 är REDAN PUSHAD till prod (01:04:57Z, HEAD 376ad973).
// Återstår: bygg (med korrigerad flock-tystnads-klassning + redan-deployad-
// detektion), prod-200, FAS D-bokföring (worklog+PIPELINE+beslutsminne+commit+
// slutpush+vakt) och städning. Bakgrundsuppdrag; självraderar sist.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r318-slutled.log';
const KVITTO = 'data/vakten/r318-slutled-kvitto.json';
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
  const fil = 'worklog.md';
  let t = fs.readFileSync(fil, 'utf8');
  t = t.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]*\n/g, (_m, ours, theirs) => `${theirs}\n${ours}\n`);
  if (/^(<<<<<<<|=======$|>>>>>>>)/m.test(t)) throw new Error('konfliktmarkörer kvar');
  fs.writeFileSync(fil, t);
}

async function pushTillProd(etikett, takMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < takMs) {
    kort('git fetch prod develop', 120_000);
    const mb = kort('git merge-base HEAD prod/develop').ut;
    const head = kort('git rev-parse HEAD').ut;
    if (mb !== head) {
      const m = kort('git merge prod/develop -m "studio: merge prod develop — r318 ' + etikett + ' (fabrikens direkt-commits hem)"');
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
    if (trackad.length > 0) { log(`AK1-ytan har ${trackad.length} trackade ändringar — väntar 60 s`); await sleep(60_000); continue; }
    const p = kort('git push prod develop', 180_000);
    if (p.kod === 0) { log(`PUSH GRÖN (${etikett}) — prod: ${kort(`git -C ${AK1} log --oneline -1`).ut.slice(0, 90)}`); return true; }
    log('push avvisad: ' + p.ut.split('\n').slice(-2).join(' ').slice(0, 160));
    await sleep(60_000);
  }
  return false;
}

const state = { faser: {} };
async function main() {
  log('SLUTLED v4 START — v206 redan pushad; bygg + bokföring återstår');

  // 0. Synka hem (pushen skedde ur detta träd — men fabriken kan ha landat mer)
  await pushTillProd('synk', 10 * 60_000);

  // 1. REDAN-DEPLOYAD-detektion: pm2 ak1a omstartad efter push? BUILD_ID nyare än push?
  let redanDeployad = false;
  const pm2 = kort('pm2 jlist', 30_000).ut;
  const ak1aProc = (pm2.match(/\{[^{}]*"name":"ak1a"[^{}]*\}/) || [''])[0];
  const pmUptime = Number((ak1aProc.match(/"pm_uptime":(\d+)/) || [])[1] || 0);
  const buildIdMtime = (() => { try { return fs.statSync(AK1 + '/.next/BUILD_ID').mtimeMs; } catch { return 0; } })();
  const prodHead = kort(`git -C ${AK1} rev-parse HEAD`).ut;
  const lokalHead = kort('git rev-parse HEAD').ut;
  if (prodHead === lokalHead && (pmUptime > PUSH_TID || buildIdMtime > PUSH_TID)) {
    redanDeployad = true;
    state.faser.deploy = 'REDAN SKEDD (prod-synk/fabrik byggde efter pushen)';
    log(`REDAN DEPLOYAD-detekt: pm_uptime ${new Date(pmUptime).toISOString()}, BUILD_ID-mtime ${new Date(buildIdMtime).toISOString()} — båda efter push 01:04:57Z`);
  } else {
    log(`ej deployad ännu (pm_uptime ${pmUptime ? new Date(pmUptime).toISOString() : '?'}, BUILD_ID ${buildIdMtime ? new Date(buildIdMtime).toISOString() : '?'})`);
  }

  // 2. BYGG — korrigerad klassning: flock -n vägrar TYSST (exit 1, tom utdata,
  //    <5 s) vid upptaget lås => retry, ALDRIG felklassa som byggfel.
  if (!redanDeployad) {
    const BYGG = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a'";
    let byggd = false;
    for (let forsok = 1; forsok <= 12 && !byggd; forsok++) {
      const s = kort(`git -C ${AK1} status --porcelain`).ut;
      const trackad = s.split('\n').filter((r) => r && !r.startsWith('??'));
      if (trackad.length > 0) { log(`bygg uppskjuten — ${trackad.length} trackade ändringar i ytan; 120 s`); await sleep(120_000); continue; }
      let mem = lasMemAvailableMb();
      while (mem < 2000) { log(`RAM ${mem} MB < 2000 — 120 s`); await sleep(120_000); mem = lasMemAvailableMb(); }
      const lastest = kort('flock -n /tmp/ak1a-deploy.lock -c true', 10_000);
      if (lastest.kod !== 0) { log('deploylåset upptaget (tyst flock-vägran) — 180 s'); await sleep(180_000); continue; }
      log(`BYGGFÖRSÖK ${forsok}/12 (flock -n, låstest grönt, RAM ${mem} MB)`);
      const r = kort(BYGG, 20 * 60_000);
      if (r.kod === 0) { log('BYGG GRÖN — pm2 omstartad'); byggd = true; state.faser.bygg = 'GRÖN'; break; }
      const tystOchKort = r.ut.length < 200 && r.ms < 5000;
      if (tystOchKort) { log(`lås-race (tyst ${r.ms} ms) — 180 s`); await sleep(180_000); continue; }
      log('BYGG RÖD (äkt): ' + r.ut.split('\n').slice(-6).join(' | ').slice(0, 350));
      state.faser.bygg = 'RÖD';
      fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1));
      process.exit(3);
    }
    if (!byggd && !state.faser.bygg) { state.faser.bygg = 'LÅS 12 försök'; fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); process.exit(4); }
  }

  // 3. prod-200
  let ok = false;
  for (let i = 1; i <= 12; i++) {
    await sleep(i === 1 ? 25_000 : 10_000);
    const k = kort("curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/", 30_000).ut;
    if (k === '200') { ok = true; break; }
    log(`prod-sond ${i}: ${k}`);
  }
  state.faser.prod200 = ok ? 'GRÖN' : 'RÖD';
  if (!ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); process.exit(5); }
  log('PROD 200 GRÖN');

  // 4. FAS D — bokföring
  for (const f of fs.readdirSync('verktyg').filter((x) => x.startsWith('_r312-') || x === '_r313-slutled.mjs' || x.startsWith('_r317-'))) {
    try { fs.unlinkSync('verktyg/' + f); log('städad: verktyg/' + f); } catch (e) { log('städ miss: ' + f); }
  }
  const pipe = 'data/forskning/PIPELINE-KO.md';
  let pt = fs.readFileSync(pipe, 'utf8');
  const suffix = '| BOKAD (huvudagenten, nästa dedikerade rond) |';
  if (!pt.includes(suffix)) throw new Error('v206-suffix saknas');
  pt = pt.replace(suffix, `| ✓ LEVERERAD r312-r318 (beed9f7d 27 platser tsc 0; PUSH GRÖN 01:04:57Z prod 376ad973; bygg ${state.faser.bygg || state.faser.deploy}; prod 200; full kedja i worklog ROND 312-318) |`);
  const v205slut = '| BOKAD (morgonronden) |';
  if (!pt.includes(v205slut)) throw new Error('v205-suffix saknas');
  pt = pt.replace(v205slut, v205slut + '\n| v207 | PREFETCH-EFTERMÄTNING (spår 7): mät v206:s faktiska vinst — natt-TBT-cronen + prestanda-mat.mjs (CHROME_PATH-kurad sedan r304) mäter tunga rutt-länkande sidor efter bygget; delmål: o557:s 1,35 MB-motorchunk syns ej längre i vanlig sidlast | BOKAD (nästa prestandafönster) |');
  const v204gammal = '| v204 | U6-STEG I VIA ROOT-ROND (spår 11):';
  if (pt.includes(v204gammal)) { pt = pt.replace(v204gammal, '| v208 | U6-STEG I VIA ROOT-ROND (spår 11; OMDÖPT r313 — fabrikens v204-desk-fördjupning tog numret):'); log('v204→v208 omdöpt'); }
  fs.writeFileSync(pipe, pt);
  log('PIPELINE-KO: v206 → LEVERERAD, v207 bokad, v208 omdöpt');

  const wl = `

### ROND 312–318 [organ:Φ] — v206 PREFETCH-KUREN levererad till prod: push genom fabrikens nattsväp + bygg + bokföring — 2026-09-29

r312 (beed9f7d): 27 tunga rutt-länkar prefetch={false} (o557:s produktnivå-bokning;
startsida SKAL-kort+chips, NastaSteg, meny-chip, fas3/prenumeration ×3 språk,
forskningsbiblioteket, pro/nyheter-ytor; footer/sidfooter redan kurade o17/o52/o63/o75).
tsc 0 · KVD: 27 platser mekaniskt verifierade.

r313-r317 (push-resan): pm2-bevakarstart verkställdes aldrig (pgrep-bevis) →
node-slutled (skal-kvotens kur); fabrikens barn höll ytan 75+90 min → tak ×2;
desk-halsa.mjs övergiven diff landad med U13V2 fynd B-kur (5515c7c1, xrandr-
current-invariant); o558-eftervaktens dödsdom landad (e17795e9); PUSH GRÖN
01:04:57Z — prod 376ad973 ⊇ beed9f7d + r313-r316 (strömmätare, remote-bevis,
Kur A, pumpor-raden).

r318 (bygg+bokföring): slutled v3 felklassade flock -n:s TYSTA vägran (exit 1,
tom utdata, 230 ms) som byggfel — METODLÄXA: upptaget deploylås klassas på
kort+tyst, låstest före bygg; v4 detekterar redan-deployad (pm_uptime/BUILD_ID
efter push) och bygger under flock med ren-yta-grind + RAM-grind. Bygg:
${state.faser.bygg || state.faser.deploy}. prod 200 GRÖN. Bokföring: v206 →
LEVERERAD · v207 PREFETCH-EFTERMÄTNING bokad (spår 7) · U6-steg I omdöpt
v204→v208 · sondfiler städade · gap-registret uttömt 36/36 — vågval enligt
strategiska skiftet. Strömbevakaren levererar pumpor-omstarten när detta träd
landat i AK1.
`;
  fs.appendFileSync('worklog.md', wl);
  fs.appendFileSync('data/vakten/beslutsminne.jsonl', JSON.stringify({ ts: new Date().toISOString(), rond: 134, beslut: 'r318 [Φ]: v206 prefetch-kuren levererad till prod (PUSH 01:04:57Z 376ad973, bygg under flock, prod 200) efter 3 tak-maraton mot fabrikens nattsväp; flock-tystnads-metodläxa bokförd; v207 bokad, v208 omdöpt', landat: 'pending-slutpush' }) + '\n');
  log('worklog + beslutsminne skrivna');

  fs.writeFileSync('/tmp/r318-msg.txt', 'studio: [organ:Φ] r318 v206 SLUTLED SLUTFÖRT — prefetch-kuren prod-levererad (PUSH 01:04:57Z 376ad973; bygg ' + (state.faser.bygg || state.faser.deploy) + '; prod 200); flock-tystnads-läxan bokförd; v207 bokad + v208 omdöpt i PIPELINE; worklog ROND 312-318; sondfiler städade');
  kort('git add worklog.md data/forskning/PIPELINE-KO.md', 60_000);
  const ign = kort('git check-ignore data/vakten/beslutsminne.jsonl').ut;
  if (!ign) kort('git add data/vakten/beslutsminne.jsonl', 60_000);
  const c = kort('git commit -F /tmp/r318-msg.txt', 600_000);
  if (c.kod !== 0) { log('COMMIT RÖD: ' + c.ut.slice(0, 250)); fs.writeFileSync(KVITTO, JSON.stringify({ ...state, commit: 'RÖD', ts: new Date().toISOString() }, null, 1)); process.exit(6); }
  const hash = kort('git rev-parse --short HEAD').ut;
  state.commit = hash;
  log('COMMIT GRÖN: ' + hash);

  const pushB = await pushTillProd('bokföring', 150 * 60_000);
  state.faser.slutpush = pushB ? 'GRÖN' : 'TAK';
  state.prodHead = kort(`git -C ${AK1} log --oneline -1`).ut.slice(0, 100);

  try {
    const v = execSync('node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000', { cwd: AK1, encoding: 'utf8', timeout: 20 * 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    log('VAKT exit 0'); state.faser.vakt = 'GRÖN';
  } catch (e) {
    log('VAKT fel (icke-fatal): ' + ((e.stdout || '') + (e.stderr || '')).split('\n').slice(-2).join(' ').slice(0, 160)); state.faser.vakt = 'FEL';
  }

  fs.writeFileSync(KVITTO, JSON.stringify({ ...state, klar: new Date().toISOString() }, null, 1));
  log('SLUTLED v4 KLART — kvitto: ' + KVITTO);
  try { fs.unlinkSync(new URL(import.meta.url).pathname); } catch (e) { log('självstädning: ' + e.message); }
  process.exit(pushB ? 0 : 2);
}

main().catch((e) => { log('OFÅNGAT FEL: ' + (e.stack || e.message)); fs.writeFileSync(KVITTO, JSON.stringify({ fel: String(e.stack || e).slice(0, 400), ts: new Date().toISOString() }, null, 1)); process.exit(1); });
