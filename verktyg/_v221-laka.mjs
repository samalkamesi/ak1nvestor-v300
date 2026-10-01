// _v221-laka.mjs — läker 4566b806-theirs-förlusten: utvecklingstrådens sex kurser
// tillbaka via kanoniska pipeline → 507 → tsc → commit → push, allt i EN körning.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const MSG = '/home/ak1a/agent/ak1/verktyg/_v221-lak-msg.txt';
const LOGG = '/tmp/v221-laka.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };
const git = (args, t = 180000) => execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT, maxBuffer: 64 * 1024 * 1024 }).trim();
const nodeKor = (args, t = 180000) => execFileSync('node', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim();

// ── 0. Vakter: ytan ren? MERGE_HEAD borta? ──
const status = git(['status', '--porcelain']);
const smuts = status.split('\n').filter((r) => r.trim() && !r.startsWith('??'));
if (smuts.length) { logga('ABORT — ytan smutsig (spårade): ' + smuts.join(' | ').slice(0, 200)); process.exit(1); }
if (fs.existsSync(ROT + '/.git/MERGE_HEAD')) { logga('ABORT — MERGE_HEAD lever'); process.exit(1); }
logga('vakter OK — ren yta, ingen merge pågår');

// ── 1. Hämta mina sex register-rader ur historien (53543fcf = före merge) ──
const gamlaReg = execFileSync('git', ['show', '53543fcf:src/lib/ai-mentor-register.ts'], { encoding: 'utf8', cwd: ROT, maxBuffer: 16 * 1024 * 1024 });
const minaKurser = ['ud-10-ex-dagens-mekanik', 'bk-09-valutadifferenserna', 'mt-09-regleringsmoat', 'kt-11-indexinklusionen', 'vr-10-enhetsmultiplar', 'pe-09-utdelningsrekapitaliseringen'];
const minaRader = [];
for (const slug of minaKurser) {
  const rad = gamlaReg.split('\n').find((r) => r.includes(`slug: "${slug}"`));
  if (!rad) { logga(`ABORT — register-rad för ${slug} hittades ej i 53543fcf`); process.exit(1); }
  minaRader.push({ slug, rad: rad.trim() });
}
logga('sex register-rader hämtade ur 53543fcf');

// ── 2. lagg-till-kurs ×6 ──
for (const k of minaKurser) {
  const ut = nodeKor(['verktyg/lagg-till-kurs.mjs', `data/kurser-tillagg/${k}.json`]).split('\n')[0];
  logga('kurs: ' + ut);
  if (!ut.includes(k)) { logga(`ABORT — ${k} kom inte in`); process.exit(1); }
}

// ── 3. register-rader alfabetiskt ──
{
  const p = `${ROT}/src/lib/ai-mentor-register.ts`;
  let rader = fs.readFileSync(p, 'utf8').split('\n');
  for (const { slug, rad } of minaRader) {
    if (rader.some((r) => r.includes(`slug: "${slug}"`))) { logga(`register: ${slug} finns — hoppar`); continue; }
    const idx = rader.findIndex((r) => { const m = r.match(/slug: "([a-z0-9-]+)"/); return m && m[1] > slug; });
    if (idx < 0) { logga(`ABORT — infogningspunkt saknas för ${slug}`); process.exit(1); }
    rader.splice(idx, 0, '  ' + rad);
    logga(`register: +${slug}`);
  }
  fs.writeFileSync(p, rader.join('\n'));
}

// ── 4. kanoniska generatorer ──
logga('karta: ' + nodeKor(['scripts/bygg-larvag-karta.ts'], 300000).split('\n').slice(-2).join(' | ').slice(0, 200));
logga('sokindex: ' + nodeKor(['verktyg/kor-sokindex.mjs'], 120000).split('\n').slice(-1).join('').slice(0, 150));
logga('speglar: ' + nodeKor(['verktyg/kor-speglar-slugar.mjs'], 120000).split('\n').slice(-1).join('').slice(0, 150));
logga('siffror: ' + nodeKor(['verktyg/rakna-siffror.mjs'], 60000).split('\n').slice(-1).join('').slice(0, 150));

// ── 5. llms-tal ──
{
  const NBSP = '\u00a0';
  const dc = JSON.parse(fs.readFileSync(`${ROT}/public/deep-courses.json`, 'utf8'));
  const nyKurser = Object.keys(dc).length;
  const siffror = JSON.parse(fs.readFileSync(`${ROT}/data/siffror.json`, 'utf8'));
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  if (nyKurser !== 507) { logga(`ABORT — väntat 507 kurser, fick ${nyKurser}`); process.exit(1); }
  for (const { fil, stop } of [{ fil: 'public/llms.txt', stop: 6 }, { fil: 'public/llms-full.txt', stop: 4 }]) {
    let t = fs.readFileSync(`${ROT}/${fil}`, 'utf8');
    const m = t.match(/(\d+) kurser i 27 ämnesområden/);
    if (!m) { logga(`llms VAKT: ${fil} — VAD-raden saknas`); process.exit(1); }
    const gammalt = m[1];
    const traffar = (t.match(new RegExp(`${gammalt} kurser`, 'g')) || []).length;
    if (traffar !== stop) { logga(`llms VAKT: ${fil} — ${traffar} träffar ≠ ${stop}`); process.exit(1); }
    t = t.replace(new RegExp(`${gammalt} kurser`, 'g'), `${nyKurser} kurser`);
    t = t.replace(new RegExp(`\\d+${NBSP}\\d+ quiz`, 'g'), `${fmt(siffror.quiz)} quiz`)
         .replace(/\d+ \d+ quiz/g, `${fmt(siffror.quiz)} quiz`.replace(NBSP, ' '))
         .replace(new RegExp(`\\d+${NBSP}\\d+ XP`, 'g'), `${fmt(siffror.quizXp)} XP`);
    fs.writeFileSync(`${ROT}/${fil}`, t);
    logga(`llms ${fil}: ${gammalt}→${nyKurser} · quiz ${siffror.quiz} · XP ${siffror.quizXp}`);
  }
}

// ── 6. tsc (grund, hooken kör den igen) ──
logga('tsc startar...');
try { nodeKor(['node_modules/typescript/bin/tsc', '--noEmit'], 600000); logga('tsc: GRÖN 0 fel'); }
catch (e) { logga('tsc FEL:\n' + String(e.stdout || e.message).slice(0, 2500)); process.exit(1); }

// ── 7. commit + push ──
git(['add', 'public/deep-courses.json', 'public/llms.txt', 'public/llms-full.txt',
  'public/sok-index.json', 'public/speglar-slugar.json', 'data/siffror.json',
  'src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts']);
logga('add OK');
const com = git(['commit', '-F', MSG], 900000);
logga('commit: ' + com.split('\n').slice(0, 2).join(' | ').slice(0, 250));
const push = git(['push', 'prod', 'develop'], 180000);
logga('push: ' + push.split('\n').slice(-2).join(' | ').slice(0, 250));
logga('HEAD: ' + git(['log', '--oneline', '-1']).slice(0, 130));
logga('före prod: ' + git(['rev-list', '--count', 'prod/develop..develop']));
logga('KLAR — LÄKNING LANDAD');
