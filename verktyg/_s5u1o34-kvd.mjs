#!/usr/bin/env node
// _s5u1o34-kvd.mjs — KVD för s5-u1 o34: EN kurs (ma-10-jamviktsrantan).
// Körs FÖRE registerinsert (o27-modellen): korpusen byggs av registret + kursfilen.
// Kontroller: struktur (18 fält + chapters_list-paritet + ma-familjesedens blockkonvention),
// aritmetik (oberoende omräkning av kursens ekvationer), texttalmarkörer, språkgrind
// (CJK/kyrilliska/grekiska, dubbelord, dubbla mellanslag, kända felord, engelska läckor),
// juridikgrind (rådsfraser, R2-pristal, utbildningsframing), sondbelägg (kärntermerna ägs
// av nya kursen och INGEN annan), korslänkar (registeräkta), familjeimplikationer
// (ma-09-konsistens: tal ma-09 etablerade återanvänds orörda).
import { readFileSync } from 'node:fs';

const ROTT = '/home/ak1a/AK1';
const reg = JSON.parse(readFileSync(`${ROTT}/public/deep-courses.json`, 'utf8'));
const slugs = Object.keys(reg);
const SLUG = 'ma-10-jamviktsrantan';
const k = JSON.parse(readFileSync(`${ROTT}/data/kurser-tillagg/${SLUG}.json`, 'utf8'));
let pass = 0, fel = 0, varn = 0;
const P = (ok, namn, detalj) => { if (ok) { pass++; } else { fel++; console.log(`  FEL: ${namn} — ${detalj}`); } };
const W = (ok, namn, detalj) => { if (ok) { pass++; } else { varn++; console.log(`  VARN: ${namn} — ${detalj}`); } };
const approx = (faktisk, väntad, tolerans = 0.006) => Math.abs(faktisk - väntad) <= tolerans;

// ── 1. STRUKTUR ─────────────────────────────────────────────────────────────
console.log('== STRUKTUR ==');
const falt = ['slug','category','weight','chapterCount','totalMinutes','title','summary','minutes','xp','level','why','learn','history','chapters_list','lynchSection','grahamSection','ak1Section','chapters'];
P(JSON.stringify(Object.keys(k)) === JSON.stringify(falt), 'fält', Object.keys(k).join(','));
P(k.slug === SLUG, 'slug', k.slug);
P(k.chapterCount === 6 && k.chapters.length === 6 && k.chapters_list.length === 6, 'kapitelantal', `${k.chapters?.length}/${k.chapters_list?.length}`);
const sumMin = k.chapters.reduce((a, c) => a + c.minutes, 0);
P(sumMin === k.totalMinutes && k.totalMinutes === 24, 'minuter', `summa ${sumMin} mot ${k.totalMinutes}`);
P(k.chapters.every((c, i) => c.num === i + 1 && c.title === k.chapters_list[i].title && c.minutes === k.chapters_list[i].minutes), 'chapters_list-paritet', 'title/minutes/num');
// ma-familjesed (o27): kap1 text+definition+insight, kap2 text+tabell+insight, kap3 text+definition+insight,
// kap4 text+tabell+insight, kap5 text+tabell+insight, kap6 text+utmaning+insight
const sed = [['text','definition','insight'],['text','tabell','insight'],['text','definition','insight'],['text','tabell','insight'],['text','tabell','insight'],['text','utmaning','insight']];
P(k.chapters.every((c, i) => JSON.stringify(c.blocks.map(b => b.type)) === JSON.stringify(sed[i])), 'ma-familjesed blockkonvention', k.chapters.map(c => c.blocks.map(b => b.type).join('+')).join(' | '));
P(k.weight === '—' && k.xp === 50 && k.minutes === 24, 'vikt/xp/minutes', `${k.weight}/${k.xp}/${k.minutes}`);
P(k.level === 'Avancerad', 'nivå', k.level);
P(k.category === 'MAKROEKONOMI & RÄNTA', 'kategori', k.category);
P(typeof k.history === 'object' && ['origin','evolution','modern'].every(f => typeof k.history[f] === 'string' && k.history[f].length > 100), 'history-block', 'ofullständigt');
P(k.chapters.every(c => c.blocks.every(b => Object.keys(b).length === 2 && b.type && typeof b.content === 'string' && b.content.length > 50)), 'blockfält', 'okonventionella block');
P(k.chapters.every(c => typeof c.intro === 'string' && c.intro.length > 30), 'kapitelintro', 'saknas');

// ── 2. ARITMETIK (oberoende omräkning) ─────────────────────────────────────
console.log('== ARITMETIK ==');
const ekv = [
  // kap 2: grinden + kumulativa hjulet
  ['grind I', 240 + 24 * 1.0, 264], ['grind S', 240 - 12 * 1.0, 228],
  ['grind glapp', 264 - 228, 36], ['grind gap-proc', 36 / 4600, 0.0078],
  ['phillips v1', 2.0 + 0.5 * 0.8, 2.4],
  ['real v2', 3.0 - 2.4, 0.6], ['delta v2', 2.0 - 0.6, 1.4],
  ['I v2', 240 + 24 * 1.4, 273.6], ['S v2', 240 - 12 * 1.4, 223.2],
  ['glapp v2', 273.6 - 223.2, 50.4], ['gap v2', 50.4 / 4600, 0.011],
  ['phillips v2 exakt', 2.0 + 0.5 * 1.1, 2.55, 0.001],
  // kap 3: hållningen
  ['real styrränta', 3.50 - 2.0, 1.50, 0.001],
  ['hållning broms', 1.50 - 1.0, 0.50, 0.001], ['hållning gas', 1.50 - 2.0, -0.50, 0.001],
  // kap 4: felbandet
  ['band nedre', 1.0 - 0.75, 0.25, 0.001], ['band övre', 1.0 + 0.75, 1.75, 0.001],
  ['span nedre', 1.50 - 1.75, -0.25, 0.001], ['span övre', 1.50 - 0.25, 1.25, 0.001],
  ['span bredd', 1.25 - (-0.25), 1.50, 0.001],
  ['proxy summa', 1.0 + 0.4, 1.40, 0.001],
  // kap 5: Taylor omräkning (regel: r* + pi + 0,5(pi-2) + 0,5*gap)
  ['taylor lugn r2', 2.0 + 2.0 + 0.5 * 0 + 0.5 * 0, 4.0, 0.001],
  ['taylor lugn r1', 1.0 + 2.0 + 0.5 * 0 + 0.5 * 0, 3.0, 0.001],
  ['taylor överh r1', 1.0 + 4.0 + 0.5 * 2.0 + 0.5 * 1.5, 6.75, 0.001],
  ['taylor kris r2', 2.0 + 0.0 + 0.5 * -2.0 + 0.5 * -4.0, -1.0, 0.001],
  ['taylor kris r1', 1.0 + 0.0 + 0.5 * -2.0 + 0.5 * -4.0, -2.0, 0.001],
  ['taylor överh r2 (ma-09 arv)', 2.0 + 4.0 + 0.5 * 2.0 + 0.5 * 1.5, 7.75, 0.001],
  // kap 6: Norrverk + evigheten
  ['växt broms', 4 - 4 * 0.5, 2, 0.001], ['växt gas', 4 - 4 * -0.5, 6, 0.001],
  ['order broms', 7800 + 75 * 2, 7950], ['order gas', 7800 + 75 * 6, 8250],
  ['beläggning broms', 7950 / 10000, 0.795, 0.001], ['beläggning gas', 8250 / 10000, 0.825, 0.001],
  ['orderskillnad', 8250 - 7950, 300],
  ['evighet A', 8.0 / 0.040, 200, 0.001], ['evighet B', 8.0 / 0.030, 266.67, 0.01],
  ['evighet-premie', 267 / 200 - 1, 0.335, 0.001],
  // utmaning
  ['u real', 4.25 - 2.5, 1.75, 0.001], ['u hållning', 1.75 - 1.0, 0.75, 0.001],
  ['u taylor', 1.25 + 2.0 + 0.5 * 0 + 0.5 * 0, 3.25, 0.001],
  ['u kris', 0.50 + 0.0 + 0.5 * -2.0 + 0.5 * -4.0, -2.5, 0.001],
  ['u växt', 4 - 4 * 0.25, 3, 0.001], ['u order', 7800 + 75 * 3, 8025],
  ['u beläggning', 8025 / 10000, 0.8025, 0.001],
];
for (const [namn, a, b, tol] of ekv) P(approx(a, b, tol ?? 0.006), `aritmetik ${namn}`, `${a} ≠ ${b}`);

// text-talmarkörer (de tal texten UTTRYCKLIGT skriver måste finnas med)
console.log('== TEXTTALMARKÖRER ==');
const markorer = ['240', '264', '228', '36', '273,6', '223,2', '50,4', '2,4', '2,55', '3,50', '1,50', '+0,50', '−0,50', '0,25–1,75', '−0,25', '+1,25', '4,0', '3,0', '6,75', '7,75', '−1,0', '−2,0', '3,0', '2,0', '0,5', '1,0', '7 950', '79,5', '8 250', '82,5', '300', '200', '267', '33,5', '8 025', '80,25', '3,25', '−2,5', '0,75', '1,75', '4 600', '2,2', '1,2'];
const txt = JSON.stringify(k);
for (const t of markorer) P(txt.includes(t), `tal "${t}"`, 'saknas i texten');

// ── 3. SPRÅKGRIND ───────────────────────────────────────────────────────────
console.log('== SPRÅKGRIND ==');
const forbjudna = /[\u4e00-\u9fff\u3040-\u30ff\u0400-\u04ff\u0370-\u03ff]/;
const kandaFel = ['own hemvist', 'perpetual', 'baseline', 'swoopar', 'åtballa', 'KRAX', 'höllning', 'lån Räntan', 'stress scenario', 'ärkursens', 'DE STORA SAMMANHANGET', 'osäkra tal:-'];
const engelska = ['own hemvist', 'perpetual kassaflöde', 'stress scenario', ' the ', ' and ', ' with ', 'swoopar', 'baseline', 'high, low'];
P(!forbjudna.test(txt), 'CJK/kyrilliska/grekiska', 'läcka hittad');
const dubbel = txt.match(/\b(\w{3,})\s+\1\b/g) || [];
P(dubbel.length === 0, 'dubbelord', dubbel.slice(0, 3).join('; '));
const mellanslag = (txt.match(/[^"\\]  /g) || []).length;
P(mellanslag === 0, 'dubbla mellanslag', `${mellanslag} st`);
P(!txt.includes('\t'), 'tabbar', 'hittad');
P(!txt.includes('­'), 'mjuka bindestreck', 'hittad');
for (const f of [...kandaFel, ...engelska]) P(!txt.toLowerCase().includes(f.toLowerCase()), `felord/engelska "${f}"`, 'kvar');

// ── 4. JURIDIKGRIND ────────────────────────────────────────────────────────
console.log('== JURIDIKGRIND ==');
const radsMönster = [/köp (aktien|detta|bolaget|nu)/i, /sälj (aktien|nu)/i, /rekommenderar (köp|att köpa|sälj)/i, /bör du (köpa|sälja)/i, /slå till på/i, /dags att köpa/i];
const pristal = [9999, 13999, '249 kr', '449 kr', '799 kr'];
for (const m of radsMönster) P(!m.test(txt), `rådsfras ${m}`, 'träff');
for (const p of pristal) P(!txt.includes(String(p)), `R2-pristal ${p}`, 'träff');
const utbildning = (txt.toLowerCase().match(/aldrig placeringsråd/g) || []).length;
P(utbildning >= 3, 'utbildningsframing', `"aldrig placeringsråd" ${utbildning} st (vill ha >= 3: summary/learn/ak1Section/kap6)`);
P(txt.toLowerCase().includes('påhittat') || txt.toLowerCase().includes('påhittade'), 'påhittade-tal-deklaration', 'saknas');

// ── 5. SONDBELÄGG (korpus = registret + kursfilen; kärntermerna ägs av ma-10) ─
console.log('== SONDBELÄGG ==');
function textOf(kurs) {
  const out = [];
  (function walk(v) { if (typeof v === 'string') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(kurs);
  return out.join('\n').toLowerCase();
}
const corpus = new Map();
for (const s of slugs) corpus.set(s, textOf(reg[s]));
corpus.set(SLUG, textOf(k)); // kursfilen med i korpusen (KVD körs FÖRE insert)
const ägare = (t) => [...corpus].filter(([, v]) => v.includes(t)).map(([s]) => s);
const sond = [
  ['jämviktsränta'], ['neutralränta'], ['r-stjärna'], ['potentialränta'], ['naturliga räntan'], ['det kumulativa hjulet'], ['hållningsspannet'], ['golvmarginal'],
];
for (const [term] of sond) {
  const träffar = ägare(term);
  P(träffar.includes(SLUG), `sond «${term}» ägs av ma-10`, 'saknar termen');
  P(träffar.every(s => s === SLUG), `sond «${term}» ej andra ägare`, `även: ${träffar.filter(s => s !== SLUG).join(', ')}`);
}
// gränsvittnen: grannarna nämner sina delar — pelarbegreppet ska vara ma-10:s
const gransVittnen = [
  ['neutral ränta', 'ma-09-produktionsgapet'], // grannen nämner ingången — gräns dokumenterad
  ['neutrala räntan', 'km-056-centralbanker'],
  ['wicksell', 'ma-01-transmissionsmekaniken'],
];
for (const [term, granne] of gransVittnen) {
  P(ägare(term).includes(granne), `gränsvittne «${term}» nämns av ${granne}`, 'grannen nämner den ej (gränsen sage är falsk)');
  P(ägare(term).includes(SLUG), `gränsvittne «${term}» bärs också i ma-10:s text`, 'ma-10 refererar grannen');
}

// ── 6. KORSLÄNKKAR ─────────────────────────────────────────────────────────
console.log('== KORSLÄNKKAR ==');
// Prosa utan slug-fältet (kursen själv är inte i registret vid pre-insert-KVD)
const prosa = JSON.stringify({ ...k, slug: '' });
const toks = [...new Set([...prosa.matchAll(/\b([a-z]{1,5}-\d{1,3})\b/g)].map(m => m[1].toLowerCase()))];
for (const t of toks) {
  const registeräkta = slugs.some(s => s.toLowerCase().startsWith(t));
  P(registeräkta, `länk ${t}`, 'varken register eller känd kurs');
}

// ── 7. MA-09-KONSISTENS (familjens tal återanvänds orörda) ─────────────────
console.log('== MA-09-KONSISTENS ==');
const ma09 = reg['ma-09-produktionsgapet'];
const ma09txt = JSON.stringify(ma09);
for (const tal of ['4 600', '2,0', '7,75', '−1,0', '7 800', '10 000']) {
  P(ma09txt.includes(tal), `ma-09 etablerar «${tal}»`, 'grannens tal hittades ej (gränsen vilar på det)');
}
P(txt.includes('4 600') && txt.includes('7 800') && txt.includes('10 000'), 'ma-10 återanvänder Svealand-/Norrverk-talen', 'potential/order/kapacitet saknas');
P(ma09txt.includes('neutral ränta 2,0') || ma09txt.includes('neutral realränta'), 'ma-09:s neutral-tal är kursens arv', 'arvet oklart');

console.log(`\nKVD: ${pass} PASS · ${fel} FEL · ${varn} VARNINGAR`);
process.exit(fel > 0 ? 1 : 0);
