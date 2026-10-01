// _v221-losa-merge.mjs — löser v221-mergen: union 507 kurser via kanoniska pipeline.
// Steg: diagnostisera llms-konfliktblock → checkout --ours → lagg-till-kurs ×6 →
// register-rader → karta → sokindex → speglar → siffror → llms-tal → tsc.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const ROT = '/home/ak1a/agent/ak1';
const LOGG = '/tmp/v221-losa-merge.log';
fs.writeFileSync(LOGG, `start ${new Date().toISOString()}\n`);
const logga = (s) => { fs.appendFileSync(LOGG, s + '\n'); console.log(s); };
const git = (args, t = 60000) => execFileSync('git', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim();
const nodeKor = (args, t = 120000) => execFileSync('node', args, { encoding: 'utf8', timeout: t, cwd: ROT }).trim();

// ── 1. Diagnostik: llms-konfliktblock (före checkout) ──
for (const f of ['public/llms.txt', 'public/llms-full.txt']) {
  const txt = fs.readFileSync(`${ROT}/${f}`, 'utf8');
  const block = txt.split('\n').filter((r) => r.includes('<<<<<<<') || r.includes('=======') || r.includes('>>>>>>>'));
  logga(`${f}: ${block.length} konfliktmarkörsrader`);
  const rader = txt.split('\n');
  for (let i = 0; i < rader.length; i++) {
    if (rader[i].includes('<<<<<<<')) {
      const slut = rader.findIndex((r, j) => j > i && r.includes('>>>>>>>'));
      for (let j = Math.max(0, i - 1); j <= Math.min(rader.length - 1, slut + 1); j++) logga(`  ${j}: ${rader[j].slice(0, 130)}`);
      i = slut;
    }
  }
}

// ── 2. checkout --ours på konfliktfilerna ──
const konfliktFiler = [
  'data/siffror.json', 'public/deep-courses.json', 'public/llms-full.txt',
  'public/llms.txt', 'public/sok-index.json', 'public/speglar-slugar.json',
  'src/lib/ai-mentor-register.ts', 'src/lib/larvag-karta.ts',
];
git(['checkout', '--ours', '--', ...konfliktFiler]);
logga('checkout --ours OK (8 filer)');

// ── 3. lagg-till-kurs ×6 (idempotent, serieordning) ──
const nyaKurser = ['am-10-insynslistan', 'bk-10-verkligt-varde-hierarkin', 'kt-12-vd-bytet', 'mt-10-erfarenhetskurvan', 'st-09-konkursordningen', 'vm-12-reverserad-dcf'];
for (const k of nyaKurser) logga('kurs: ' + nodeKor(['verktyg/lagg-till-kurs.mjs', `data/kurser-tillagg/${k}.json`]).split('\n')[0]);

// ── 4. register-rader: infoga 6 rader alfabetiskt ──
const nyaRader = [
  { slug: 'am-10-insynslistan', rad: '  { slug: "am-10-insynslistan", titel: "Insynslistan — ledningens köp, karenstiden och signalens värde", kategori: "AKTIEMARKNADEN I PRAKTIKEN", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },' },
  { slug: 'bk-10-verkligt-varde-hierarkin', rad: '  { slug: "bk-10-verkligt-varde-hierarkin", titel: "Verkligt värde-hierarkin — nivåernas tre sanningar", kategori: "BOKFÖRING & ÅRSREDOVISNING", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },' },
  { slug: 'kt-12-vd-bytet', rad: '  { slug: "kt-12-vd-bytet", titel: "VD-bytet — förväntningsnollställningen", kategori: "KATALYSATOR", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },' },
  { slug: 'mt-10-erfarenhetskurvan', rad: '  { slug: "mt-10-erfarenhetskurvan", titel: "Erfarenhetskurvan — moaten som ackumuleras bakåt", kategori: "MOAT", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },' },
  { slug: 'st-09-konkursordningen', rad: '  { slug: "st-09-konkursordningen", titel: "Konkursordningen — betalningsförbudet, rekonstruktionen och borgenärernas tur", kategori: "STABILITET", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Intermediär" },' },
  { slug: 'vm-12-reverserad-dcf', rad: '  { slug: "vm-12-reverserad-dcf", titel: "Reverserad DCF — att läsa vad priset redan tror", kategori: "VÄRDERINGSMETODER", variabel: undefined, kapitel: 6, quiz: 0, minuter: 24, niva: "Avancerad" },' },
];
{
  const p = `${ROT}/src/lib/ai-mentor-register.ts`;
  let rader = fs.readFileSync(p, 'utf8').split('\n');
  for (const { slug, rad } of nyaRader) {
    if (rader.some((r) => r.includes(`slug: "${slug}"`))) { logga(`register: ${slug} finns redan — hoppar`); continue; }
    const idx = rader.findIndex((r) => {
      const m = r.match(/slug: "([a-z0-9-]+)"/);
      return m && m[1] > slug;
    });
    if (idx < 0) { logga(`register: FEL hittar inte infogningspunkt för ${slug}`); process.exit(1); }
    rader.splice(idx, 0, rad);
    logga(`register: +${slug} (före rad ${idx}: ${rader[idx + 1]?.match(/slug: "([a-z0-9-]+)"/)?.[1]})`);
  }
  fs.writeFileSync(p, rader.join('\n'));
}

// ── 5-8. kanoniska generatorer ──
logga('karta: ' + nodeKor(['scripts/bygg-larvag-karta.ts'], 180000).split('\n').slice(-3).join(' | ').slice(0, 250));
logga('sokindex: ' + nodeKor(['verktyg/kor-sokindex.mjs'], 120000).split('\n').slice(-2).join(' | ').slice(0, 200));
logga('speglar: ' + nodeKor(['verktyg/kor-speglar-slugar.mjs'], 120000).split('\n').slice(-2).join(' | ').slice(0, 200));
logga('siffror: ' + nodeKor(['verktyg/rakna-siffror.mjs'], 60000).split('\n').slice(-2).join(' | ').slice(0, 200));

// ── 9. llms-tal-regen (barnens mönster, mot ARBETSYTAN, 501→nya) ──
{
  const NBSP = '\u00a0';
  const dc = JSON.parse(fs.readFileSync(`${ROT}/public/deep-courses.json`, 'utf8'));
  const nyKurser = Object.keys(dc).length;
  const siffror = JSON.parse(fs.readFileSync(`${ROT}/data/siffror.json`, 'utf8'));
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  for (const { fil, stop } of [{ fil: 'public/llms.txt', stop: 6 }, { fil: 'public/llms-full.txt', stop: 4 }]) {
    let t = fs.readFileSync(`${ROT}/${fil}`, 'utf8');
    const m = t.match(/(\d+) kurser i 27 ämnesområden/);
    if (!m) { logga(`llms VAKT: ${fil} — hittar inte VAD-raden (lämnas orörd)`); continue; }
    const gammalt = m[1];
    const traffar = (t.match(new RegExp(`${gammalt} kurser`, 'g')) || []).length;
    if (traffar !== stop) { logga(`llms VAKT: ${fil} — ${traffar} träffar ≠ ${stop} (lämnas orörd)`); continue; }
    t = t.replace(new RegExp(`${gammalt} kurser`, 'g'), `${nyKurser} kurser`);
    t = t.replace(new RegExp(`\\d+${NBSP}\\d+ quiz`, 'g'), `${fmt(siffror.quiz)} quiz`)
         .replace(/\d+ \d+ quiz/g, `${fmt(siffror.quiz)} quiz`.replace(NBSP, ' '))
         .replace(new RegExp(`\\d+${NBSP}\\d+ XP`, 'g'), `${fmt(siffror.quizXp)} XP`);
    fs.writeFileSync(`${ROT}/${fil}`, t);
    logga(`llms ${fil}: ${gammalt}→${nyKurser} kurser · quiz ${siffror.quiz} · XP ${siffror.quizXp}`);
  }
}

// ── 10. tsc baslinje 0 ──
logga('tsc startar (kan ta minuter)...');
try {
  const tscUt = nodeKor(['node_modules/typescript/bin/tsc', '--noEmit'], 600000);
  logga('tsc: GRÖN (0 fel)');
} catch (e) {
  logga('tsc: FEL —\n' + String(e.stdout || e.message).slice(0, 3000));
  process.exit(1);
}

logga('\nALLA STEG GRÖNA — redo för git add + commit');
