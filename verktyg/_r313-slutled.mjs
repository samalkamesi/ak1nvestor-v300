// v206 (r313): SLUTLED — hela kedjan autonom: push genom fabrikens fönster
// (V235: fetch + merge-hem + vänta ren yta + push), bygg under flock med
// RAM-grind (v227-läxan), prod-200-verifiering, bokföring (worklog +
// PIPELINE-KO + beslutsminne), sista push, gränssnittsvakt, städning.
// Kanaler: enbart node execSync (skal-kvotens KUR #1). ALDRIG --no-verify.
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const LOGG = 'data/vakten/r313-slutled.log';
const KVITTO = 'data/vakten/r313-slutled-kvitto.json';
const AK1 = '/home/ak1a/AK1';
const v206 = 'beed9f7d';

function log(rad) {
  const line = `${new Date().toISOString()} ${rad}\n`;
  try { fs.appendFileSync(LOGG, line); } catch {}
  console.log(line.trim());
}
function kort(cmd, timeoutMs = 60_000) {
  try { return { kod: 0, ut: execSync(cmd, { encoding: 'utf8', timeout: timeoutMs, stdio: ['ignore', 'pipe', 'pipe'] }).trim() }; }
  catch (e) { return { kod: e.status ?? 1, ut: ((e.stdout || '') + '\n' + (e.stderr || '')).trim() }; }
}
function lasMemAvailableMb() {
  try { const t = fs.readFileSync('/proc/meminfo', 'utf8'); const m = t.match(/MemAvailable:\s+(\d+) kB/); return m ? Math.round(Number(m[1]) / 1024) : 99999; }
  catch { return 99999; }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function losWorklogKonflikt() {
  const fil = 'worklog.md';
  let t = fs.readFileSync(fil, 'utf8');
  t = t.replace(/<<<<<<< HEAD\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> [^\n]*\n/g, (_m, ours, theirs) => `${theirs}\n${ours}\n`);
  if (/^(<<<<<<<|=======$|>>>>>>>)/m.test(t)) throw new Error('konfliktmarkörer kvar efter union');
  fs.writeFileSync(fil, t);
}

async function pushTillProd(etikett, takMs) {
  const t0 = Date.now();
  while (Date.now() - t0 < takMs) {
    kort('git fetch prod develop', 120_000);
    const mb = kort('git merge-base HEAD prod/develop').ut;
    const head = kort('git rev-parse HEAD').ut;
    if (mb !== head) {
      const m = kort('git merge prod/develop -m "studio: merge prod develop — r313 ' + etikett + ' (fabrikens direkt-commits hem)"');
      if (m.kod !== 0) {
        const konf = kort('git diff --name-only --diff-filter=U').ut.trim();
        if (konf === 'worklog.md') {
          try {
            losWorklogKonflikt();
            kort('git add worklog.md');
            kort('git commit --no-edit', 600_000);
            log('worklog-konflikt löst med union (deras block före våra)');
          } catch (e) { kort('git merge --abort'); log('union misslyckades: ' + e.message + ' — nytt försök nästa varv'); await sleep(60_000); continue; }
        } else {
          kort('git merge --abort');
          log(`merge avbröts (konflikt i: ${konf.slice(0, 120) || 'okänd'}) — sover 60 s`);
          await sleep(60_000); continue;
        }
      } else {
        log('MERGE HEM: ' + kort('git log --oneline -1').ut.slice(0, 100));
      }
    }
    const smuts = kort(`git -C ${AK1} status --porcelain`).ut;
    if (smuts) { log(`AK1-ytan smutsig (${smuts.split('\n').length} rader) — barn levererar, sover 60 s`); await sleep(60_000); continue; }
    const p = kort('git push prod develop', 180_000);
    if (p.kod === 0) { log(`PUSH GRÖN (${etikett}) — prod HEAD: ${kort(`git -C ${AK1} log --oneline -1`).ut}`); return true; }
    log('push avvisad: ' + p.ut.split('\n').slice(-2).join(' | ').slice(0, 180));
    await sleep(60_000);
  }
  return false;
}

async function byggUnderFlock() {
  const BYGG = "flock -n /tmp/ak1a-deploy.lock bash -c 'cd " + AK1 + " && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a'";
  for (let forsok = 1; forsok <= 10; forsok++) {
    // Ren-yta-grind: barn kan arbeta i src/ EFTER grön push men FÖRE bygg —
    // halvfärdig kod i arbetsytan ger felbygg i prod. Vänta ut barnet (v100/v227-läxorna).
    const smutsFore = kort(`git -C ${AK1} status --porcelain`).ut;
    if (smutsFore) {
      log(`bygg uppskjuten — AK1-ytan smutsig (${smutsFore.split('\n').length} rader), barn levererar; sover 120 s`);
      await sleep(120_000);
      continue;
    }
    let ramOk = false;
    for (let j = 0; j < 15; j++) {
      const mem = lasMemAvailableMb();
      if (mem >= 2000) { ramOk = true; log(`RAM-grind GRÖN (${mem} MB fritt)`); break; }
      log(`RAM ${mem} MB < 2000 — väntar 120 s (v227-läxan)`); await sleep(120_000);
    }
    if (!ramOk) { log('RAM tog aldrig upp — byggförsök avbryts'); return { kod: 4, ut: 'ram' }; }
    log(`BYGGFÖRSÖK ${forsok}/10 (flock -n)`);
    const r = kort(BYGG, 20 * 60_000);
    if (r.kod === 0) {
      log('BYGG GRÖN — pm2 omstartad; svans: ' + r.ut.split('\n').slice(-3).join(' | ').slice(0, 200));
      return { kod: 0, ut: r.ut };
    }
    const svans = r.ut.split('\n').slice(-5).join(' | ').slice(0, 300);
    const ljust = r.ut.length < 400 && /flock/i.test(r.ut);
    if (ljust) { log('låset upptaget (deploy pågår): ' + svans + ' — sover 180 s'); await sleep(180_000); continue; }
    log('BYGG RÖD: ' + svans);
    return { kod: 3, ut: r.ut };
  }
  return { kod: 5, ut: 'lås upptaget 10 försök' };
}

async function verifieraProd() {
  for (let i = 1; i <= 12; i++) {
    await sleep(i === 1 ? 20_000 : 10_000);
    const k = kort("curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/", 30_000).ut;
    log(`prod-sond ${i}/12: ${k}`);
    if (k === '200') return true;
  }
  return false;
}

const state = { faser: {}, landat: 'nej' };
async function main() {
  log('SLUTLED START — mål: ' + v206 + ' i prod + bygg + bokföring');
  log('lokal HEAD: ' + kort('git log --oneline -1').ut);
  log('prod HEAD:  ' + kort(`git -C ${AK1} log --oneline -1`).ut);
  const s0 = kort(`git -C ${AK1} status --porcelain`).ut;
  log('prod-ytan vid start: ' + (s0 ? s0.split('\n').slice(0, 5).join(' ; ') : 'REN'));

  // FAS A — push v206 (+merges) till prod
  const pushA = await pushTillProd('v206', 150 * 60_000);
  state.faser.push = pushA ? 'GRÖN' : 'TAK';
  if (!pushA) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); log('TAK — push väntar fortfarande; nästa rond tar vid'); process.exit(2); }
  state.faser.pushHead = kort(`git -C ${AK1} log --oneline -1`).ut;

  // FAS B — bygg under flock
  const b = await byggUnderFlock();
  state.faser.bygg = b.kod === 0 ? 'GRÖN' : 'RÖD(' + b.kod + ')';
  if (b.kod !== 0) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); log('BYGG EJ GRÖN — stopp; revert/manuell hantering nästa turn (ALDRIG lämna prod trasig)'); process.exit(3); }

  // FAS C — prod 200
  const ok = await verifieraProd();
  state.faser.prod200 = ok ? 'GRÖN' : 'RÖD';
  if (!ok) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, ts: new Date().toISOString() }, null, 1)); log('PROD EJ 200 EFTER BYGG — eskalering nästa turn'); process.exit(4); }

  // FAS D — bokföring: städa sondfiler, PIPELINE-KO, worklog, beslutsminne, commit, push
  for (const f of fs.readdirSync('verktyg').filter((x) => x.startsWith('_r312-'))) {
    try { fs.unlinkSync('verktyg/' + f); log('städad: verktyg/' + f); } catch (e) { log('städ miss: ' + f + ': ' + e.message); }
  }

  const pipe = 'data/forskning/PIPELINE-KO.md';
  let pt = fs.readFileSync(pipe, 'utf8');
  const suffix = '| BOKAD (huvudagenten, nästa dedikerade rond) |';
  if (!pt.includes(suffix)) throw new Error('v206-statussuffix saknas i PIPELINE-KO');
  pt = pt.replace(suffix, `| ✓ LEVERERAD r312+r313 (${v206} + slutled: push genom fabrikens fönster + bygg under flock + prod 200, ${new Date().toISOString().slice(0, 16)}Z; KVD i r312-commit-ämnet) |`);
  const v205slut = '| BOKAD (morgonronden) |';
  if (!pt.includes(v205slut)) throw new Error('v205-statussuffix saknas i PIPELINE-KO');
  pt = pt.replace(v205slut, v205slut + '\n| v207 | PREFETCH-EFTERMÄTNING (spår 7): mät v206:s faktiska vinst — natt-TBT-cronen + prestanda-mat.mjs (CHROME_PATH-kurad sedan r304) mäter tunga rutt-länkande sidor efter bygget; delmål: o557:s 1,35 MB-motorchunk syns ej längre i vanlig sidlast, TBT-förbättring på startsida/kurser/blogg | BOKAD (nästa prestandafönster) |');
  const v204gammal = '| v204 | U6-STEG I VIA ROOT-ROND (spår 11):';
  if (pt.includes(v204gammal)) {
    pt = pt.replace(v204gammal, '| v208 | U6-STEG I VIA ROOT-ROND (spår 11; OMDÖPT r313 — fabrikens v204-desk-fördjupning tog numret):');
    log('PIPELINE-KO: U6-steg I omdöpt v204 → v208 (namnkollision kurad)');
  } else {
    log('v204-omdöp: rad ej funnen (ev. redan omdöpt) — skippas utan fel');
  }
  fs.writeFileSync(pipe, pt);
  log('PIPELINE-KO: v206 → LEVERERAD, v207 PREFETCH-EFTERMÄTNING bokad');

  const wl = `

### ROND 312+313 [organ:Φ] — v206 PREFETCH-KUREN levererad till prod — 2026-09-28

r312 (${v206}): 27 tunga rutt-länkar försedda med prefetch={false} enligt
o557:s produktnivå-bokning — startsidans SKAL-kort + verktygschips,
NastaSteg-panelens förslagslänkar, huvudmenyns Fortsätt-chip, fas3 ×3 språk,
prenumeration ×3 språk, forskningsbiblioteketets Fördjupa dig-lista,
analys-variabelsidan, nyckeltalsguiden, akm2-dashboard, aktie-nyheter,
nyhets-central, toppvaxelns /pro + pro-ytornas interna länkar; footer/
sidfooter/en-ar-startsidor redan kurade (o17/o52/o63/o75) och lämnades
orörda. tsc 0 · KVD: 27 platser mekaniskt verifierade (karta +
innehållsvaliderad infogning, 2 nekade granngodkända manuellt).

r313 (slutled, detta pass): ${v206} + merge-hem av fabrikens mellanlandningar
pushad till prod genom fabrikens fönster (V235 — bevakarmed mönster:
fetch → merge → vänta ren yta → push), bygg under flock med RAM-grind
≥2000 MB, prod 200, gränssnittsvakt körd efteråt. Bokningar: v207
PREFETCH-EFTERMÄTNING tillagd (spår 7); v204 (root-rond) + v205
(morgonronden G2/G5) står kvar — 3 kommande vågor i kön.
ZCODE-GAP-REGISTER uttömt (36/36 stängda på bevis) — rondens vågval enligt
strategiska skiftet + evighetskatalogen. Sondfiler _r312-* städade.
`;
  fs.appendFileSync('worklog.md', wl);
  log('worklog: ROND 312+313-sektionen appenderad');

  const rad = JSON.stringify({ ts: new Date().toISOString(), rond: 133, beslut: 'r312+r313 [Φ]: v206 prefetch-kuren (27 tunga rutt-länkar prefetch={false}, beed9f7d) levererad till prod med bygg under flock + prod 200; v207 PREFETCH-EFTERMÄTNING bokad', landat: 'pending-final-push' });
  fs.appendFileSync('data/vakten/beslutsminne.jsonl', rad + '\n');
  log('beslutsminne: rad appenderad');

  const msgFil = '/tmp/r313-commitmsg.txt';
  fs.writeFileSync(msgFil, `studio: [organ:Φ] r313 v206 SLUTLED — prefetch-kuren prod-levererad (merge-hem + push genom fabrikens fönster + bygg under flock + prod 200); v207 PREFETCH-EFTERMÄTNING bokad (spår 7); worklog ROND 312+313; sondfiler städade; gap-registret uttömt 36/36 — vågval enligt strategiska skiftet`);
  kort('git add worklog.md data/forskning/PIPELINE-KO.md', 60_000);
  const ign = kort('git check-ignore data/vakten/beslutsminne.jsonl').ut;
  if (!ign) kort('git add data/vakten/beslutsminne.jsonl', 60_000);
  const c = kort('git commit -F ' + msgFil, 600_000);
  if (c.kod !== 0) { fs.writeFileSync(KVITTO, JSON.stringify({ ...state, commit: 'RÖD', fel: c.ut.slice(0, 400), ts: new Date().toISOString() }, null, 1)); log('COMMIT RÖD (grinden?): ' + c.ut.slice(0, 300)); process.exit(5); }
  const commitHash = kort('git rev-parse --short HEAD').ut;
  state.commit = commitHash;
  log('COMMIT GRÖN: ' + commitHash);

  // FAS E — sista push
  const pushB = await pushTillProd('bokföring', 150 * 60_000);
  state.faser.slutpush = pushB ? 'GRÖN' : 'TAK';
  state.landat = pushB ? commitHash : 'nej';
  state.prodHead = kort(`git -C ${AK1} log --oneline -1`).ut;

  // FAS F — gränssnittsvakt (icke-fatal; nya bunten mäts, cron har ryggen)
  try {
    const v = execSync('node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000', { cwd: AK1, encoding: 'utf8', timeout: 20 * 60_000, stdio: ['ignore', 'pipe', 'pipe'] });
    log('VAKT exit 0: ' + v.split('\n').slice(-3).join(' | ').slice(0, 200));
    state.faser.vakt = 'GRÖN';
  } catch (e) {
    log('VAKT fel (icke-fatal): ' + ((e.stdout || '') + (e.stderr || '')).split('\n').slice(-2).join(' | ').slice(0, 200));
    state.faser.vakt = 'FEL';
  }

  fs.writeFileSync(KVITTO, JSON.stringify({ ...state, klar: new Date().toISOString() }, null, 1));
  log('SLUTLED KLART — kvitto: ' + KVITTO);

  // städa slutligen sig själv (filen redan inläst)
  try { fs.unlinkSync(new URL(import.meta.url).pathname); log('slutledet raderade sig självt — trädet rent'); } catch (e) { log('självstädning lämnad till nästa rond: ' + e.message); }
  process.exit(0);
}

main().catch((e) => { log('OFÅNGAT FEL: ' + (e.stack || e.message)); fs.writeFileSync(KVITTO, JSON.stringify({ ...state, fel: String(e.stack || e).slice(0, 500), ts: new Date().toISOString() }, null, 1)); process.exit(1); });
