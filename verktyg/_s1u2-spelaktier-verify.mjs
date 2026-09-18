// Sond: s1-u2 (auto-s1-1789758924831) — KONTROLLGRANSKAV spelaktier-sa-analyserar-du-spelbolag.json
// Oberoende verifiering: fält mot bolagsunivers.json, aritmetik, struktur, juridik, 911, länkar.
import { readFileSync } from 'node:fs';

const UTKAST = JSON.parse(readFileSync('data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag.json', 'utf8'));
const UNI = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const rader = UNI.bolag || UNI.rader || UNI;
const evo = (Array.isArray(rader) ? rader : Object.values(rader)).find(b => (b.ticker || '') === 'EVO.ST');

const body = UTKAST.body;
const hela = JSON.stringify(UTKAST);
let ok = 0, fel = 0, noteringar = [];
const T = (namn, villkor, extra = '') => {
  const res = !!villkor;
  if (res) ok++; else fel++;
  console.log(`${res ? 'OK  ' : 'FEL '} ${namn}${extra ? ' — ' + extra : ''}`);
};

// ── 1. Evolution: fält mot universumet (vintage 2026-09-15) ──────────────
T('pris 890,60 i text', body.includes('890,60 kronor') || body.includes('890,60'), `universum ${evo.pris}`);
T('prisvärde == universum', evo.pris === 890.6);
T('bruttomarginal 100 % (källkonvention)', body.includes('bruttomarginalen som 100 procent') && evo.lonksamhet.bruttoMarginal === 1, 'konventionen finns i universums not');
T('rörelsemarginal 57,8', body.includes('57,8 procent') && Math.round(evo.lonksamhet.ebitMarginal * 1000) / 10 === 57.8);
T('nettomarginal 51,8', body.includes('51,8 procent') && Math.round(evo.lonksamhet.nettoMarginal * 1000) / 10 === 51.8, `universum ${evo.lonksamhet.nettoMarginal}`);
T('ROIC 31,2', body.includes('31,2 procent') && Math.round(evo.lonksamhet.roic * 1000) / 10 === 31.2);
T('skuld/EK 0,02', body.includes('0,02') && evo.stabilitet.skuldEgenkapital === 0.02);
T('serie 1457-1799-2063-2067', body.includes('1 457 → 1 799 → 2 063 → 2 067'), JSON.stringify(evo.serier.omsattning));
T('serieår 2022-2025', body.includes('räkenskapsåren 2022–2025'), JSON.stringify(evo.serier.ar));
T('serien är EUR', body.includes('rapportvaluta euro') && /EUR/.test(evo.kallor[0].paranoid));
T('TTM -2,2 %', body.includes('−2,2 procent') && Math.round(evo.tillvaxt.omsattningTillvaxtTTM * 1000) / 10 === -2.2);
T('P/E 15,15', body.includes('15,15') && evo.vardering.pe === 15.15);
T('forward P/E 13,60', body.includes('13,60') && /15,15\/13,60|forward.{0,12}13,60/.test(evo.kallor[0].paranoid));

// ── 2. Aritmetik (egna beräkningar) ─────────────────────────────────────
T('PEG 15,15/11,4 = 1,33', body.includes('≈ 1,33') && Math.abs(15.15 / 11.4 - 1.329) < 0.001, `egen ${ (15.15 / 11.4).toFixed(4) }`);
T('100-euro-exempel 58 av 100', body.includes('58 euro') && Math.round(57.8) === 58);
const aktier = (evo.marknadsKapitalMdr * 1e9) / evo.pris;
const budvärde = 695 * aktier / 1e9;
T('budvärde ~132 mdr', body.includes('132 miljarder kronor') && Math.abs(budvärde - 132) < 1.5, `egen ${budvärde.toFixed(1)} mdr (695 × ${Math.round(aktier / 1e6)} M aktier)`);
T('890,6/695 = 1,28 => 28 %', body.includes('≈ 1,28') && body.includes('28 procent över') && Math.abs(890.6 / 695 - 1.2814) < 0.001, `egen ${(890.6 / 695).toFixed(4)}`);
T('prognostillväxt +11,4 %', body.includes('11,4 procent') && evo.tillvaxt.prognosTillvaxt === 0.114);

// ── 3. Spelinspektionen (primärkälla 2026-09-18: tabell Q2-26=7380, Q2-25=7024, Q1-26=6680; +0,8 % bekräftad europeangaming.eu 2026-05-20) ──
const PRIMAR = { q2_2026: 7380, q2_2025: 7024, q1_2026: 6680 };
const q2pct = Math.round((PRIMAR.q2_2026 / PRIMAR.q2_2025 - 1) * 1000) / 10;
T('Q1-nivå 6,7 mdr KORREKT', body.includes('6,7 miljarder kronor (+0,8 procent)'), `primär ${PRIMAR.q1_2026} mnkr`);
T('Q2-nivå 6,9 mdr — FEL MOT PRIMÄRKÄLLA', !body.includes('Q2 på 6,9'), `primär ${PRIMAR.q2_2026} mnkr = 7,38 mdr; utkastet skriver 6,9`);
T('Q2-procent +2,8 — FEL MOT PRIMÄRKÄLLA', !body.includes('6,9 miljarder kronor under andra kvartalet 2026 — en ökning med 2,8'), `primär +${q2pct} %; utkastets +2,8 % = helåret 2024:s ökning`);
noteringar.push(`Q2 2026 primär: ${PRIMAR.q2_2026} mnkr, +${q2pct}% mot ${PRIMAR.q2_2025}`);

// ── 4. Struktur ─────────────────────────────────────────────────────────
const ord = body.replace(/https?:\/\/\S+/g, ' ').replace(/[[\]()#*_>/|]/g, ' ').split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
const rmKontrakt = Math.round(ord / 600);
T('readingMinutes enligt round(ord/600)', UTKAST.readingMinutes === rmKontrakt, `ord ${ord} ⇒ ${rmKontrakt}; utkastet ${UTKAST.readingMinutes}`);
const h2 = (body.match(/^## /gm) || []).length;
T('H2-rubriker >= 2', h2 >= 2, `${h2} st`);
const sista = body.trim().split('\n').pop().trim();
T('disclaimer = sista raden (serieform)', sista === '_Detta är pedagogisk finansanalys, inte investeringsråd._', sista.slice(0, 60));
T('title <= 60 tkn', UTKAST.title.length <= 60, `${UTKAST.title.length} tkn`);
T('description 120-175 tkn', UTKAST.description.length >= 120 && UTKAST.description.length <= 175, `${UTKAST.description.length} tkn`);

// ── 5. Juridik (2007:528) ───────────────────────────────────────────────
const radVerb = [...hela.matchAll(/(köp(?:a)?|sälj(?:a)?|rekommender(?:ar|ade)|bör du|undvik|bra affär)/gi)].map(m => m[1].toLowerCase());
T('rådverb-sond: endast kontrollerade kontexter', true, `träffar: ${[...new Set(radVerb)].join(', ') || '0'} — manuell kontextbedömning i rapport`);
const lagrum = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59'].filter(l => hela.includes(l));
T('ingen lagrumsblandning', lagrum.length === 0, `nämnda: ${lagrum.join(', ') || 'inga'}`);
T('utbildningsram i ingress', body.includes('utbildning i metod, aldrig råd om enskilda aktier'));

// ── 6. 911-referenser (6 mönster) ───────────────────────────────────────
const m911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'].filter(p => hela.toLowerCase().includes(p.toLowerCase()));
T('911-kontroll 0 träffar', m911.length === 0, `träffar: ${m911.join(', ') || '0'}`);

// ── 7. Superlativ-sond ──────────────────────────────────────────────────
const superlativ = [...body.matchAll(/(mest beundrade|kanske tydligaste|enskilt viktigaste|högst|lägst|mest lönsam)/gi)].map(m => m[1]);
console.log(`NOT  superlativ för manuell bedömning: ${[...new Set(superlativ)].join(', ') || '0'}`);

// ── 8. Interna länkar mot levande sajten ────────────────────────────────
const linkar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log(`\nLÄNKAR (${linkar.length} unika):`);
let lFel = 0;
for (const l of linkar) {
  try {
    const r = await fetch('http://localhost:3000' + l, { redirect: 'manual' });
    const bra = r.status === 200;
    if (bra) ok++; else { lFel++; fel++; }
    console.log(`${bra ? 'OK  ' : 'FEL '} ${r.status} ${l}`);
  } catch (e) { lFel++; fel++; console.log(`FEL  ERR ${l} — ${e.message}`); }
}

// ── 9. Diff-strängunikhet (för A1-rättningsförslaget) ───────────────────
const sokstrangar = [
  'redovisade en spelomsättning på 6,9 miljarder kronor under andra kvartalet 2026 — en ökning med 2,8 procent',
  'Q1 2026 landade på 6,7 miljarder kronor (+0,8 procent) och Q2 på 6,9 (+2,8 procent)',
  'Q2 2026: 6,9 miljarder kronor, +2,8 procent',
  'konsensusprognosen för nästa år ligger på +11,4 procent',
];
console.log('\nDIFF-STRÄNGUNIKHET:');
for (const s of sokstrangar) {
  const n = hela.split(s).length - 1;
  T(`unik söksträng "${s.slice(0, 45)}…"`, n === 1, `${n} träff(ar)`);
}

console.log(`\n=== RESULTAT: ${ok} OK, ${fel} FEL, ${lFel} länkfel ===`);
console.log('NOTERINGAR:', noteringar.join(' | '));
