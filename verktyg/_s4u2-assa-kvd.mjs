// _s4u2-assa-kvd.mjs — kvalitetsverifiering av ASSA ABLOY Q3-2026-läspaketet
// (spår 4, auto-s4-1789742101501 u2). Kör: node verktyg/_s4u2-assa-kvd.mjs
// Alla källtal läses ur bolagsunivers.json vid körningen — inga hårdkodade källvärden.
import { readFileSync } from 'node:fs';

const P = JSON.parse(readFileSync(new URL('../data/blogg-utkast/kvartal/2026-q3/sa-laser-du-assa-abloy-q3-2026.json', import.meta.url), 'utf8'));
const U = JSON.parse(readFileSync(new URL('../data/portfolj-system/bolagsunivers.json', import.meta.url), 'utf8'));
const arr = Array.isArray(U) ? U : (U.bolag || U.universum || Object.values(U)[0]);
const A = arr.find(p => p.ticker === 'ASSA-B.ST');
const ind = arr.filter(p => p.bransch === 'industri');

let pass = 0, fel = [], varn = [];
const ok = (villkor, namn, detalj) => { if (villkor) pass++; else fel.push(namn + (detalj ? ': ' + detalj : '')); };
const varning = namn => varn.push(namn);

// ---------- 1. STRUKTUR ----------
const body = P.body;
ok(Object.keys(P).length === 9, 'struktur.antalFalt', 'väntade 9 fält, fick ' + Object.keys(P).length);
ok(['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'].every(k => k in P), 'struktur.faltnamn');
const ord = (body.match(/\S+/g) || []).length;
ok(ord >= 2600 && ord <= 3840, 'struktur.ordSpann', ord + ' ord');
ok(P.readingMinutes === Math.round(ord / 600), 'struktur.readingMinutes', P.readingMinutes + ' mot ' + Math.round(ord / 600));
ok(P.title.length >= 60 && P.title.length <= 300, 'struktur.titleLangd', P.title.length + ' tkn');
ok(P.description.length >= 300 && P.description.length <= 620, 'struktur.descLangd', P.description.length + ' tkn');
ok(P.publishedAt === '2026-10-27', 'struktur.publishedAtRappdag', P.publishedAt);
ok(!body.includes('­'), 'struktur.ingaMjukaBindestreck');
ok(!body.includes(' '), 'struktur.ingaNbsp');
ok(!/[\u200B-\u200D\uFEFF]/.test(body), 'struktur.ingaOsynligaTecken');
ok(P.tags.length === 6, 'struktur.tags');
// tabeller välformade: lika många celler per rad inom varje sammanhängande tabellblock
const raderna = body.split('\n');
let tabellFel = 0, forrPipe = null;
for (let i = 0; i <= raderna.length; i++) {
  const r = i < raderna.length ? raderna[i] : '';
  if (r.trim().startsWith('|')) {
    const p = (r.match(/\|/g) || []).length;
    if (forrPipe !== null && p !== forrPipe) tabellFel++;
    forrPipe = p;
  } else forrPipe = null;
}
ok(tabellFel === 0, 'struktur.tabellerValformade', tabellFel + ' radbrott');
const sista = body.trimEnd().split('\n').pop();
ok(sista.startsWith('*') && sista.includes('2007:528') && sista.includes('inte investeringsrådgivning'), 'struktur.disclaimerSistaRad');
// rubriker
const h2 = (body.match(/^## /gm) || []).length;
ok(h2 === 7, 'struktur.h2Antal', h2 + ' st');

// ---------- 2. JURIDIK ----------
const lagrum = (body.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'juridik.exaktEttLagrum', lagrum + ' träffar');
ok((body.match(/2 kap 5 §/g) || []).length === 1, 'juridik.paragrafEnGang');
ok(!/\b(2022:260|2022:261|1985:716|2005:59|2022:482)\b/.test(body), 'juridik.ingaFrammandeLagrum');
// varje "rekommendation" i negationskontext
const rek = [...body.matchAll(/[^.]*rekommendation[^.]*/g)].map(m => m[0]);
ok(rek.length >= 2 && rek.every(s => /inte en rekommendation|Inga köp-|ingen rekommendation/i.test(s)), 'juridik.rekommendationerNegerade', JSON.stringify(rek));
// rådmönster (imperativ/handling) får ej förekomma alls
ok(!/(rekommenderar|bra köp|köp aktien|sälj aktien|aktie att köpa|bör köpa|bör sälja|köp nu|sälj nu|vi råder|råder vi att)/i.test(body), 'juridik.ingaRadmonster');
// köp/sälj-ord endast i negations- eller faktakontext (insiderköp, utdelning)
const kopSaldj = [...body.matchAll(/[^.]*(köp|sälj|behåll)[^.]*$/gim)].map(m => m[0].trim());
ok(kopSaldj.every(s => /inte en rekommendation|Inga köp-|insider|aldrig en handelssignal|publiceringen/i.test(s)), 'juridik.kopSaldjKontext', JSON.stringify(kopSaldj.filter(s => !/inte en rekommendation|Inga köp-|insider|aldrig en handelssignal|publiceringen/i.test(s))));

// ---------- 3. LÄNKAR ----------
const lnkar = [...new Set([...body.matchAll(/\]\((\/[a-z0-9\/\-]+)\)/g)].map(m => m[1]))];
ok(lnkar.length === 20, 'lankar.antaUnika', lnkar.length + ' st');
ok(lnkar.every(l => !l.includes('blogg-utkast')), 'lankar.ingaUtkastlankar');
ok(!/https?:\/\//.test(body), 'lankar.ingaExternaUrler');
const http = await Promise.all(lnkar.map(async l => {
  try { const r = await fetch('http://localhost:3000' + l, { redirect: 'manual' }); return [l, r.status]; }
  catch { return [l, 0]; }
}));
ok(http.every(([, s]) => s === 200), 'lankar.allaHttp200', JSON.stringify(http.filter(([, s]) => s !== 200)));

// ---------- 4. KÄLLTALSPARITET (body-tal mot universumposten) ----------
const f = {
  pe: p => p.vardering?.pe, pb: p => p.vardering?.pb, evEbit: p => p.vardering?.evEbit,
  peg: p => p.vardering?.peg, roe: p => p.lonksamhet?.roe, brutto: p => p.lonksamhet?.bruttoMarginal,
  ebit: p => p.lonksamhet?.ebitMarginal, netto: p => p.lonksamhet?.nettoMarginal,
  fcfM: p => p.lonksamhet?.fcfMarginal, skuldEK: p => p.stabilitet?.skuldEgenkapital,
  omsCagr: p => p.tillvaxt?.omsattningCAGR5ar, resCagr: p => p.tillvaxt?.resultatCAGR5ar,
  ttm: p => p.tillvaxt?.omsattningTillvaxtTTM, prognos: p => p.tillvaxt?.prognosTillvaxt,
};
const sv = x => x.toFixed(2).replace('.', ',');              // 15,57
const sv3 = x => x.toFixed(3).replace('.', ',');             // 3,531
const svpct = x => (x * 100).toFixed(2).replace('.', ',');    // 15,57
const Mkr = x => String(Math.round(x / 1e6)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // 152 409 med vanligt mellanslag (sv-SE-lokalen ger hårda)
const paritet = [
  ['353,50', A.pris.toFixed(2).replace('.', ','), 'kurs'],
  [sv(f.pe(A)), null, 'P/E'], [sv3(f.pb(A)), null, 'P/B'], [String(f.evEbit(A)).replace('.', ','), null, 'EV/EBIT'],
  [String(f.peg(A)).replace('.', ','), null, 'PEG'],
  [svpct(f.roe(A)), null, 'ROE'], [svpct(f.brutto(A)), null, 'brutto'], [svpct(f.ebit(A)), null, 'EBIT'],
  [svpct(f.netto(A)), null, 'netto'], [svpct(f.fcfM(A)), null, 'FCF-marginal'],
  [String(f.skuldEK(A)).replace('.', ','), null, 'skuld/EK'],
  [svpct(f.omsCagr(A)), null, 'omsCAGR'], [svpct(f.resCagr(A)), null, 'resCAGR'],
  [svpct(f.ttm(A)), null, 'TTM'], [svpct(f.prognos(A)), null, 'prognos'],
  ...A.serier.omsattning.map(v => [Mkr(v), null, 'serie omsättning']),
  ...A.serier.resultat.map(v => [Mkr(v), null, 'serie resultat']),
];
for (const [str] of paritet) ok(body.includes(str), 'paritet.' + str, 'saknas i body');
ok(body.includes('2022') && body.includes('2025'), 'paritet.serieAr');
// nullfält redovisas öppet
ok(/null i källposten|börsvärdet saknas/i.test(body) && body.includes('källan anger inget värde') && body.includes('osatt'), 'paritet.nullfaltRedovisade');

// ---------- 5. ARITMETIK (oberoende omräkning) ----------
const [o1, o2, o3, o4] = A.serier.omsattning, [r1, r2, r3, r4] = A.serier.resultat;
const steg = (a, b) => ((b / a - 1) * 100).toFixed(2).replace('.', ',');
for (const s of [steg(o1, o2), steg(o2, o3), steg(o3, o4)]) ok(body.includes(s) || body.includes(s.replace('-', 'minus ')), 'aritmetik.omsSteg ' + s);
for (const s of [steg(r1, r2), steg(r2, r3), steg(r3, r4)]) ok(body.includes(s) || body.includes(s.replace('-', 'minus ')), 'aritmetik.resSteg ' + s);
const cagr = (a, b) => ((Math.pow(b / a, 1 / 3) - 1) * 100).toFixed(2).replace('.', ',');
ok(body.includes(cagr(o1, o4)) && body.includes(cagr(r1, r4)), 'aritmetik.cagrReplicerade');
for (let i = 0; i < 4; i++) ok(body.includes(((A.serier.resultat[i] / A.serier.omsattning[i]) * 100).toFixed(2).replace('.', ',')), 'aritmetik.nettomarginalSerie ' + i);
const ttmOms = o4 * (1 + f.ttm(A)), ttmNetto = f.netto(A) * ttmOms, ttmEbit = f.ebit(A) * ttmOms, ttmFcf = f.fcfM(A) * ttmOms;
ok(body.includes(Mkr(ttmOms)) && body.includes(Mkr(ttmNetto)) && body.includes(Mkr(ttmEbit)) && body.includes(Mkr(ttmFcf)), 'aritmetik.ttmVarden');
// identitet + per-andel
const peId = f.pb(A) / f.roe(A);
ok(body.includes(peId.toFixed(3).replace('.', ',')), 'aritmetik.identitetVarde');
ok(body.includes(((f.pe(A) / peId - 1) * 100).toFixed(2).replace('.', ',')), 'aritmetik.identitetGap');
const eps = A.pris / f.pe(A), bps = A.pris / f.pb(A);
ok(body.includes(eps.toFixed(2).replace('.', ',')) && body.includes(bps.toFixed(2).replace('.', ',')), 'aritmetik.epsBps');
ok(body.includes(((eps / bps) * 100).toFixed(2).replace('.', ',')), 'aritmetik.epsBpsKvot');
// EV-kedjan baklänges
const ev = f.evEbit(A) * ttmEbit, ekH = ev / (f.pb(A) + f.skuldEK(A)), mcapH = f.pb(A) * ekH, skuldH = f.skuldEK(A) * ekH;
ok(body.includes((ev / 1e9).toFixed(1).replace('.', ',')) && body.includes((ekH / 1e9).toFixed(1).replace('.', ',')) && body.includes((mcapH / 1e9).toFixed(1).replace('.', ',')) && body.includes((skuldH / 1e9).toFixed(1).replace('.', ',')), 'aritmetik.evKedjaMdr');
ok(body.includes((f.pe(A) * ttmNetto / 1e9).toFixed(1).replace('.', ',')), 'aritmetik.absolutkontroll');
ok(body.includes(((f.pe(A) * ttmNetto / mcapH - 1) * 100).toFixed(2).replace('.', ',')), 'aritmetik.absolutResidual');
ok(body.includes(((ttmNetto / ekH) * 100).toFixed(2).replace('.', ',')) && body.includes((ttmNetto / ekH / f.roe(A)).toFixed(3).replace('.', ',')), 'aritmetik.roeKors');
ok(body.includes(Mkr(mcapH / A.pris)), 'aritmetik.aktietal');
// underlagsdetektiven
ok(body.includes((ttmNetto / r4).toFixed(3).replace('.', ',')) && body.includes(((ttmNetto / r4 - 1) * 100).toFixed(1).replace('.', ',')), 'aritmetik.underlagskvot');
// PEG
const pegKonv = f.pe(A) / (f.prognos(A) * 100);
ok(body.includes(pegKonv.toFixed(3).replace('.', ',')) && body.includes((f.peg(A) / pegKonv).toFixed(3).replace('.', ',')) && body.includes((f.pe(A) / f.peg(A)).toFixed(2).replace('.', ',')), 'aritmetik.peg');
// scenarioruta EBIT: 9 celler + vikter
const ebitBas = o4 * f.ebit(A);
ok(body.includes(Mkr(ebitBas)), 'aritmetik.scenarieBas');
const rutor = [o4 * 0.97, o4, o4 * 1.03], kolo = [f.ebit(A) - 0.01, f.ebit(A), f.ebit(A) + 0.01];
let celler = 0;
for (const r of rutor) for (const k of kolo) { if (body.includes(Mkr(r * k))) celler++; }
ok(celler === 9, 'aritmetik.scenarieCeller9', celler + '/9');
ok(body.includes(Mkr(o4 * 0.01)) && body.includes(Mkr(ebitBas * 0.03)), 'aritmetik.riktesatser');
ok(body.includes((1 / (3 * f.ebit(A))).toFixed(2).replace('.', ',')), 'aritmetik.marginalvikt');
const kolb = [f.brutto(A) - 0.01, f.brutto(A), f.brutto(A) + 0.01];
let bceller = 0;
for (const r of rutor) for (const k of kolb) { if (body.includes(Mkr(r * k))) bceller++; }
ok(bceller === 9, 'aritmetik.bruttoCeller9', bceller + '/9');
ok(body.includes(Mkr(o4 * f.brutto(A) * 0.03)), 'aritmetik.bruttoVolymVikt');
// kostnadstrappa + fcf-andel
ok(body.includes(((f.brutto(A) - f.ebit(A)) * 100).toFixed(2).replace('.', ',')), 'aritmetik.bruttoEbitFall');
ok(body.includes(Math.round(f.fcfM(A) / f.netto(A) * 100) + ' procent'), 'aritmetik.fcfAndelAvNetto');
// multipelövning
ok(body.includes((f.pe(A) / (1 + f.prognos(A))).toFixed(2).replace('.', ',')), 'aritmetik.multipelOvning');

// ---------- 6. MEDIANER + RANG (kodvägs ur 183-filen) ----------
const med = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); const n = s.length; return n === 0 ? null : n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const mInd = {}, mAll = {};
for (const [k, fn] of Object.entries(f)) { mInd[k] = med(ind.map(fn)); mAll[k] = med(arr.map(fn)); }
const fmtM = (k, v) => ['pe','pb','evEbit','peg'].includes(k) ? String(Math.round(v * 1000) / 1000).replace('.', ',') : k === 'skuldEK' ? v.toFixed(2).replace('.', ',') : (v * 100).toFixed(2).replace('.', ',') + ' %';
// medianer: multiplar matchas på naturlig representation — 2 eller 3 decimaler, båda avrundningarna för halva medelvärden (t.ex. 21,7945)
const harTal = v => {
  const kand = new Set([
    v.toFixed(2).replace('.', ','), v.toFixed(3).replace('.', ','),
    (Math.floor(v * 1000) / 1000).toFixed(3).replace('.', ','),
    (Math.ceil(v * 1000) / 1000).toFixed(3).replace('.', ','),
  ]);
  for (const s of kand) if (body.includes(s)) return true;
  return false;
};
for (const k of ['pe','pb','evEbit','peg','roe','brutto','ebit','netto','fcfM','skuldEK','omsCagr','resCagr','ttm','prognos']) {
  const mult = ['pe','pb','evEbit','peg'].includes(k);
  if (mInd[k] != null) ok(mult ? harTal(mInd[k]) : body.includes(fmtM(k, mInd[k])), 'median.industri.' + k, fmtM(k, mInd[k]) + ' saknas');
  if (mAll[k] != null) ok(mult ? harTal(mAll[k]) : body.includes(fmtM(k, mAll[k])), 'median.universum.' + k, fmtM(k, mAll[k]) + ' saknas');
}
const rang = (v, vals) => { const s = vals.filter(x => x != null).sort((x, y) => x - y); return (s.indexOf(v) + 1) + '/' + s.length; };
for (const [k, fn] of Object.entries(f)) {
  const a = fn(A);
  if (a != null) ok(body.includes(rang(a, ind.map(fn))), 'rang.' + k, rang(a, ind.map(fn)) + ' saknas');
}
// netto exakt median
ok(Math.abs(mInd.netto - f.netto(A)) < 5e-5, 'median.nettoExaktPaMedian', mInd.netto + ' mot ' + f.netto(A));

console.log('KVD ASSA ABLOY Q3-2026:', pass, 'PASS,', fel.length, 'FEL,', varn.length, 'VARNINGAR');
for (const e of fel) console.log('FEL:', e);
for (const v of varn) console.log('VARNING:', v);
process.exit(fel.length ? 1 : 0);
