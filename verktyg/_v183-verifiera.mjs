// v183: live-verifikation av v167:s 20 övningskapitel mot API + registerbevis i prod-trädet.
// Fil-skrivande variant (skal-kvoten: stdout kan förloras vid skal-häng).
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const ut = [];
const TITEL = 'Från teorin till egen räkning';

// 1) Fil-läge: hitta de 20 kurserna och mät strukturen
const dc = JSON.parse(readFileSync('/home/ak1a/agent/ak1/public/deep-courses.json', 'utf8'));
const traeff = Object.entries(dc).filter(([s, k]) => Array.isArray(k.chapters) && k.chapters.some(c => c && c.title === TITEL));
ut.push(`FIL: kurser med övningskapitel ${traeff.length} (förväntat 20)`);

let pass = 0, fel = 0;
if (traeff.length !== 20) { fel++; ut.push('FEL antal kurser ' + traeff.length + ' ≠ 20'); }

for (const [slug, k] of traeff) {
  const cs = k.chapters;
  const antal = cs.filter(c => c.title === TITEL).length;
  const sist = cs[cs.length - 1];
  const r = [];
  if (antal !== 1) r.push('antal=' + antal);
  if (!sist || sist.title !== TITEL) { r.push('inte-sist'); }
  else {
    if (sist.num !== cs.length) r.push('num=' + sist.num + '/' + cs.length);
    if (sist.minutes !== 8) r.push('min=' + sist.minutes);
    if (!Array.isArray(sist.quiz) || sist.quiz.length !== 3) r.push('quiz=' + (sist.quiz || []).length);
    if (k.chapterCount !== cs.length) r.push('chapterCount=' + k.chapterCount + '/' + cs.length);
  }
  // 2) Live via API (localhost = whitelistat i middleware)
  let api = 'n/a';
  try {
    const resp = await fetch('http://localhost:3000/api/kurs/' + slug, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) { api = 'HTTP' + resp.status; r.push(api); }
    else {
      const j = JSON.parse(await resp.text());
      const kurs = j.chapters ? j : (j.kurs || j.data || j);
      const live = kurs.chapters ? kurs.chapters[kurs.chapters.length - 1] : null;
      api = (!live || live.title !== TITEL) ? 'live-saknar-kap' : 'live-ok';
      if (api !== 'live-ok') r.push(api);
    }
  } catch (e) { api = 'fetch-fel:' + e.message; r.push(api); }
  if (r.length) { fel++; ut.push('FEL ' + slug + ' — ' + r.join(' · ')); }
  else { pass++; ut.push('PASS ' + slug + ' kap ' + sist.num + '/' + cs.length + ' · ' + sist.minutes + ' min · quiz 3 · ' + api); }
}
ut.push('API-STATISTIK: ' + pass + ' PASS · ' + fel + ' FEL');

// 3) Sajten
for (const [namn, url, tak] of [['localhost', 'http://localhost:3000/', 10000], ['https', 'https://lab.ak1nvestor.com/', 20000]]) {
  try { const h = await fetch(url, { signal: AbortSignal.timeout(tak) }); ut.push('SAJT ' + namn + ': ' + h.status); }
  catch (e) { ut.push('SAJT ' + namn + ': FEL ' + e.message); fel++; }
}

// 4) Registerbevis: prod-trädets register identiskt med arbetsytans harmoniserade + byggmärke
try {
  const regWs = readFileSync('/home/ak1a/agent/ak1/src/lib/ai-mentor-register.ts', 'utf8');
  const regProd = readFileSync('/home/ak1a/AK1/src/lib/ai-mentor-register.ts', 'utf8');
  ut.push('REGISTER prod-trädet ≡ arbetsyta (harmoniserad): ' + (regWs === regProd ? 'JA' : 'NEJ'));
} catch (e) { ut.push('REGISTERjämförelse: FEL ' + e.message); fel++; }
try { ut.push('BUILD_ID mtime: ' + statSync('/home/ak1a/AK1/.next/BUILD_ID').mtime.toISOString()); }
catch (e) { ut.push('BUILD_ID: saknas'); fel++; }

ut.push('TOTALT: ' + pass + ' PASS · ' + fel + ' FEL');
writeFileSync('/tmp/v183-verif.txt', ut.join('\n') + '\n');
console.log('KLAR ' + pass + '/' + (pass + fel));
