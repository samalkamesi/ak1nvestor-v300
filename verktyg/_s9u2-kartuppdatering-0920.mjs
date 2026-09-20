#!/usr/bin/env node
// s9-u2 dokvåg 2026-09-20 — SYSTEMKARTAN-mätning: E36 Mediebiblioteket + D24 Fas 2/3-access.
// Read-only: disk + GET/HEAD endast, inga nycklar, inga skrivningar utanför stdout.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const ut = { ts: new Date().toISOString(), E36: {}, D24: {}, ovrigt: {} };

// ---------- E36: Mediebiblioteket ----------
const register = JSON.parse(readFileSync(`${ROT}/public/deep-courses.json`, 'utf8'));
const kursIdn = Object.keys(register);
ut.E36.kurserIRegistret = kursIdn.length;

const ogFiler = readdirSync(`${ROT}/public/og/kurser`).filter(f => f.endsWith('.png'));
ut.E36.ogKursbilder = ogFiler.length;
const ogSet = new Set(ogFiler.map(f => f.replace(/\.png$/, '')));
ut.E36.kurserUtanOg = kursIdn.filter(id => !ogSet.has(id));
ut.E36.ogUtanKurs = ogFiler.map(f => f.replace(/\.png$/, '')).filter(id => !register[id]);

// mtime-fördelning = bevis på v207:s rerun (2026-09-19) + det frusna gamla beståndet (09-05)
const mtimeDagar = {};
for (const f of ogFiler) {
  const d = statSync(`${ROT}/public/og/kurser/${f}`).mtime.toISOString().slice(0, 10);
  mtimeDagar[d] = (mtimeDagar[d] || 0) + 1;
}
ut.E36.ogMtimeFordelning = Object.fromEntries(Object.entries(mtimeDagar).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8));

// og/-katalogens övriga bestånd (analys, blogg, översikter)
for (const sub of ['analys', 'blogg']) {
  try { ut.E36[`og${sub}`] = readdirSync(`${ROT}/public/og/${sub}`).length; } catch { ut.E36[`og${sub}`] = 'saknas'; }
}

// media_fil-eventexporten (nattjobb 02:40) — senaste filens antal
const mediaSenaste = JSON.parse(readFileSync(`${ROT}/data/backups/media-filer-2026-09-20.json`, 'utf8'));
ut.E36.mediaFilExportSenaste = { datum: '2026-09-20', antal: mediaSenaste.antal ?? mediaSenaste.rows?.length ?? null };

// OG-generatorn + deploy-kopplingen (gap 1: manuell)
ut.E36.ogGenerator = statSync(`${ROT}/scripts/og-generate.mjs`).mtime.toISOString();
for (const f of ['verktyg/deploya-contabo.sh', 'verktyg/prod-synk.mjs']) {
  const txt = readFileSync(`${ROT}/${f}`, 'utf8');
  ut.E36[`ogTräffar_${f.split('/').pop()}`] = (txt.match(/og-generate|og\/kurser/g) || []).length;
}

// kärnfilens kodstillhet
ut.E36.mediebibKarnfilSenasteCommit = execFileSync('git', ['-C', ROT, 'log', '-1', '--format=%h %ad %s', '--date=short', '--', 'src/lib/mediabibliotek.ts'], { encoding: 'utf8' }).trim();

// live-sonder (statiska filer = disk; live-beviset bekräftar servningen)
async function sond(url, metod = 'GET') {
  try {
    const r = await fetch(url, { method: metod, redirect: 'manual', signal: AbortSignal.timeout(10000) });
    return r.status;
  } catch (e) { return `FEL:${e.cause?.code || e.name}`; }
}
ut.E36.livePc21OgBild = await sond('http://localhost:3000/og/kurser/pc-21-ditt-forsta-case.png', 'HEAD');
ut.E36.livePc21Kurs = await sond('http://localhost:3000/kurser/pc-21-ditt-forsta-case');
ut.E36.liveNyKursUtanOg = {
  rk16OgBild: await sond('http://localhost:3000/og/kurser/rk-16-kontrahentrisken.png', 'HEAD'),
  rk16Kurs: await sond('http://localhost:3000/kurser/rk-16-kontrahentrisken'),
};

// ---------- D24: Fas 2/3-access ----------
const ka = readFileSync(`${ROT}/src/lib/kurs-access.ts`, 'utf8');
function raknaSet(namn) {
  const m = ka.match(new RegExp(`const ${namn}[^=]*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!m) return null;
  return (m[1].match(/['"`][^'"`]+['"`]/g) || []).length;
}
ut.D24.fas2Kurser = raknaSet('FAS2_KURSER');
ut.D24.fas3Kurser = raknaSet('FAS3_KURSER');
ut.D24.kursAccessSenasteCommit = execFileSync('git', ['-C', ROT, 'log', '-1', '--format=%h %ad %s', '--date=short', '--', 'src/lib/kurs-access.ts'], { encoding: 'utf8' }).trim();

// underlag + siffrors korsfält (fas-talen lever i båda ändar)
const siffror = JSON.parse(readFileSync(`${ROT}/data/siffror.json`, 'utf8'));
ut.D24.siffror = { kurser: siffror.kurser, quiz: siffror.quiz, quizXp: siffror.quizXp, fas2Kurser: siffror.fas2Kurser, fas3Kurser: siffror.fas3Kurser, uppdaterad: siffror.uppdaterad };
ut.D24.fasAndel = {
  fas2: +(100 * (ut.D24.fas2Kurser || 0) / kursIdn.length).toFixed(1),
  fas3: +(100 * (ut.D24.fas3Kurser || 0) / kursIdn.length).toFixed(1),
};

// ytor + grindar
ut.D24.ytor = {
  fas2sv: await sond('http://localhost:3000/fas2-ansok'),
  fas2en: await sond('http://localhost:3000/en/fas2-ansok'),
  fas2ar: await sond('http://localhost:3000/ar/fas2-ansok'),
  fas3: await sond('http://localhost:3000/fas3'),
};
ut.D24.grindar = {
  fas2ansokGET: await sond('http://localhost:3000/api/fas2-ansok'),
  adminFas2Access: await sond('http://localhost:3000/api/admin/fas2-access'),
};
// valideringsgren: POST med tom kropp ska avslås 400 FÖRE skrivning
try {
  const r = await fetch('http://localhost:3000/api/fas2-ansok', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}', signal: AbortSignal.timeout(10000) });
  ut.D24.grindar.fas2ansokPOSTtom = r.status;
} catch (e) { ut.D24.grindar.fas2ansokPOSTtom = `FEL:${e.cause?.code || e.name}`; }

// gap 4: rate-limit i rutten?
const fas2route = readFileSync(`${ROT}/src/app/api/fas2-ansok/route.ts`, 'utf8');
ut.D24.rateLimitTraffarIFas2Rutt = (fas2route.match(/rate|Rate|TAK|tak/g) || []).length;
ut.D24.emailRuttReferens = ((readFileSync(`${ROT}/src/app/api/email/route.ts`, 'utf8').match(/10.*?min|min.*?10|rateLimit|RATE/ig) || []).length > 0) ? 'referens finns' : 'okänd';

console.log(JSON.stringify(ut, null, 2));
