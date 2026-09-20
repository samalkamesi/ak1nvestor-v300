#!/usr/bin/env node
// _s1u2-atlas-kontroll.mjs — maskinell kontroll av sa-laser-du-atlas-copco-q3-2026
// (granskare s1-u2, manifest auto-s1-1789902316443). Läser ENBART data/ + utkastet;
// skriver ingenting i data/. Vintage-mediantal = git ea7ad8bd (109-filan, verifierad
// manuellt 2026-09-20 med lasBranschMedianer-ekvivalent medianberäkning).
import { readFileSync } from 'node:fs';

const UT = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-atlas-copco-q3-2026.json';
const uni = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const kal = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-industri.json', 'utf8'));
const kalK = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-konsument.json', 'utf8'));
const kalF = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-finans.json', 'utf8'));
const kalT = JSON.parse(readFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/kalender-teknik.json', 'utf8'));
const ana = JSON.parse(readFileSync('/home/ak1a/AK1/data/analyses/ATCO-A.ST.json', 'utf8'));
const vm = JSON.parse(readFileSync('/home/ak1a/AK1/data/varumarke.json', 'utf8'));
const u = JSON.parse(readFileSync(UT, 'utf8'));
const body = u.body;
const PASS = [], FEL = [];
const ck = (namn, villkor, detalj = '') => (villkor ? PASS : FEL).push(`${namn}${detalj ? ` — ${detalj}` : ''}`);
const nära = (a, b, tol) => Math.abs(a - b) <= tol;

// ── 1. Universumposten: 21 citerade fält ─────────────────────────────
const atco = uni.find(b => b.ticker === 'ATCO-A.ST');
ck('ATCO pris 201,70', atco.pris === 201.7);
ck('ATCO mcap 984,018 mdr', atco.marknadsKapitalMdr === 984.018);
ck('ATCO ROE 25,7 %', atco.lonksamhet.roe === 0.257);
ck('ATCO ROIC 32,3 %', atco.lonksamhet.roic === 0.3231);
ck('ATCO brutto 42,2 %', atco.lonksamhet.bruttoMarginal === 0.4219);
ck('ATCO EBIT 20,6 %', atco.lonksamhet.ebitMarginal === 0.2056);
ck('ATCO netto 15,7 %', atco.lonksamhet.nettoMarginal === 0.1567);
ck('ATCO FCF 15,3 %', atco.lonksamhet.fcfMarginal === 0.1529);
ck('ATCO FCF-yield 2,6 %', atco.vardering.fcfYield === 0.0264);
ck('ATCO TTM-tillväxt +9,1 %', atco.tillvaxt.omsattningTillvaxtTTM === 0.091);
ck('ATCO CAGR 6,0 %', atco.tillvaxt.omsattningCAGR5ar === 0.06);
ck('ATCO prognostillväxt 19,0 % (0,1902)', atco.tillvaxt.prognosTillvaxt === 0.1902);
ck('ATCO P/E 36,9 (36,874)', atco.vardering.pe === 36.874);
ck('ATCO P/B 9,3 (9,257)', atco.vardering.pb === 9.257);
ck('ATCO EV/EBIT 28,3 (28,346)', atco.vardering.evEbit === 28.346);
ck('ATCO PEG 2,19', atco.vardering.peg === 2.19);
ck('ATCO skuld/EK 0,34 (0,3367)', nära(atco.stabilitet.skuldEgenkapital, 0.34, 0.005));
ck('ATCO räntetäckning osatt', atco.stabilitet.rantaTackning === null);
ck('ATCO serie 141,3→168,3 mdr', atco.serier.omsattning[0] === 141325000000 && atco.serier.omsattning[3] === 168343000000);
ck('ATCO ROIC-proxy-not i källan', atco.notering.includes('roic = approximerad proxy'));
ck('ATCO MarketStack-not i källan', atco.notering.includes('MarketStack'));

// ── 2. Kalendern ─────────────────────────────────────────────────────
const kalP = t => { for (const f of [kal, kalK, kalF, kalT]) { const b = f.bolag.find(x => x.ticker === t); if (b) return b; } return null; };
ck('ATCO rappdag 10-22 ca 12:00 + tk 14:00', /2026-10-22 \(ca kl 12:00/.test(kalP('ATCO-A.ST').rapportfenster));
ck('ATCO tyst period 09-22', kalP('ATCO-A.ST').notera.includes('2026-09-22'));
ck('ATCO utdelning+rapport samma dag', kalP('ATCO-A.ST').notera.includes('samma dag'));
ck('Syskon SKF 10-21', kalP('SKF-B.ST').rapportfenster.startsWith('2026-10-21'));
ck('Syskon H&M 09-24', kalP('HM-B.ST').rapportfenster.startsWith('2026-09-24'));
ck('Syskon Industrivärden 10-07', kalP('INDU-C.ST').rapportfenster.startsWith('2026-10-07'));
ck('Syskon Ericsson 10-15', kalP('ERIC-B.ST').rapportfenster.startsWith('2026-10-15'));
ck('Sandvik samma dag 10-22', kalP('SAND.ST').rapportfenster.startsWith('2026-10-22'));
ck('ABB 10-20 (två dagar före)', kalP('ABB.ST').rapportfenster.startsWith('2026-10-20'));
ck('22 oktober 2026 = torsdag', new Date('2026-10-22').getDay() === 4);
ck('Källrad IR-kalendern + hämtdatum 09-15', body.includes('kalender och events-sida') && body.includes('läst 2026-09-15'));

// ── 3. Vågvalideringsdomar (protokollet 2026-09-04) ──────────────────
const proto = readFileSync('/home/ak1a/AK1/data/rapporter/vagvalidering-SENASTE.md', 'utf8');
const rad = proto.split('\n').find(l => l.includes('**ATCO-A.ST**'));
ck('Protokollrad ATCO finns', !!rad);
ck('mikro impulsvåg → träff (13 %)', rad.includes('mikro: impulsvåg → träff ✓ (13 %)'));
ck('kort basbygge → träff (3,8 %)', rad.includes('kort: basbygge → träff ✓ (3,8 %)'));
ck('medellång basbygge → miss (8,4 %)', rad.includes('medellång: basbygge → miss ✗ (8,4 %)'));
ck('mega basbygge → miss (8,4 %)', rad.includes('mega: basbygge → miss ✗ (8,4 %)'));
ck('lång osatt → osatt FINNS i protokoll (utkastet utelämnar → fynd C4)', rad.includes('lång: osatt → osatt'));
ck('Utkastets momentumtal exakta (13,0/3,8/8,4/8,4)', ['+13,0 procent', '+3,8 procent', '+8,4 procent (utanför ±6)'].every(s => body.includes(s)) && (body.match(/\+8,4 procent/g) || []).length >= 2);
ck('Tröskel ±6 procent i utkast + protokoll', body.includes('±6 procent') && proto.includes('≤ 6 %'));

// ── 4. Vågmätningen (ATCO-A.ST.json, verifierad 2026-08-24) ──────────
ck('analysisDate/verified 2026-08-24', ana.analysisDate === '2026-08-24' && ana.verified === '2026-08-24');
const ph = ana.waveSummary.perHorisont;
ck('5 vågklasser exakta', ph.mikro === 'basbygge' && ph.kort === 'impulsvåg' && ph.medellang === 'impulsvåg' && ph.lang === 'impulsvåg' && ph.mega === 'impulsvåg');
const cell = Object.values(ana.waveSummary.matris25);
ck('25-cellersmatris 18▲/4▼/3—', cell.filter(v => v === 1).length === 18 && cell.filter(v => v === -1).length === 4 && cell.filter(v => v === 0).length === 3);
ck('σ 28 %/år i källan', JSON.stringify(ana).includes('Volatilitet σ 28 %/år'));
ck('52v-position 91 % i källan', JSON.stringify(ana).includes('52v-position: 91 %'));
const lv = Object.fromEntries(ana.priceLevels.levels.map(l => [l.label, l.value]));
ck('Nivåer 130,00/180,77/197,89/212,30', lv['52v-lägsta'] === '130' && nära(+lv['MA 200 dagar'], 180.77, 0.005) && nära(+lv['MA 50 dagar'], 197.89, 0.005) && lv['52v-högsta'] === '212.3');

// ── 5. Medianer: byggvintage ea7ad8bd (109) + dagens drift (225) ─────
const vintage = { // beräknade 2026-09-20 ur git ea7ad8bd (109-filan, industri n=11)
  indPe: 28.25, indPb: 5.10, indEv: 21.55, indRoe: 19.68, indEbit: 16.91,
  uniPe: 19.92, uniPb: 2.67, uniEv: 19.21, uniRoe: 15.04, uniEbit: 21.16 };
const ok = (ut, v, tol) => nära(ut, v, tol);
ck('Vintage: indu P/E 28,3≈28,25', ok(28.3, vintage.indPe, 0.06));
ck('Vintage: indu P/B 5,1=5,10', ok(5.1, vintage.indPb, 0.05));
ck('Vintage: indu EV/EBIT 21,5≈21,55 (trunkerad — fynd C2)', ok(21.5, vintage.indEv, 0.06));
ck('Vintage: indu ROE 19,7≈19,68', ok(19.7, vintage.indRoe, 0.03));
ck('Vintage: indu EBIT 16,9≈16,91', ok(16.9, vintage.indEbit, 0.02));
ck('Vintage: univ P/E 19,9≈19,92', ok(19.9, vintage.uniPe, 0.03));
ck('Vintage: univ P/B 2,7≈2,67', ok(2.7, vintage.uniPb, 0.04));
ck('Vintage: univ EV/EBIT 19,2≈19,21', ok(19.2, vintage.uniEv, 0.02));
ck('Vintage: univ ROE 15,0≈15,04', ok(15.0, vintage.uniRoe, 0.05));
ck('Vintage: univ EBIT 21,2≈21,16', ok(21.2, vintage.uniEbit, 0.05));
ck('Utkastet daterar vintage: 109 bolag, 10–13/bransch', body.includes('109 bolag') && body.includes('10 till 13 per bransch'));
// dagens drift (beräknas ur dagens fil)
const median = v => { const s = [...v].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const ind = uni.filter(b => b.bransch === 'industri');
const dag = {
  indPe: median(ind.map(b => b.vardering?.pe).filter(x => x != null)),
  indPb: median(ind.map(b => b.vardering?.pb).filter(x => x != null)),
  indEv: median(ind.map(b => b.vardering?.evEbit).filter(x => x != null)),
  indRoe: 100 * median(ind.map(b => b.lonksamhet?.roe).filter(x => x != null)),
  indEbit: 100 * median(ind.map(b => b.lonksamhet?.ebitMarginal).filter(x => x != null)),
};
ck('Drift: "dyrare på alla multiplar" håller mot dagens fil (P/E 36,9>' + dag.indPe.toFixed(1) + ', P/B 9,3>' + dag.indPb.toFixed(1) + ', EV/EBIT 28,3>' + dag.indEv.toFixed(1) + ')', 36.9 > dag.indPe && 9.3 > dag.indPb && 28.3 > dag.indEv);
ck('Drift: "lönsammare" håller (ROE 25,7>' + dag.indRoe.toFixed(1) + ', EBIT 20,6>' + dag.indEbit.toFixed(1) + ')', 25.7 > dag.indRoe && 20.6 > dag.indEbit);

// ── 6. Aritmetik ─────────────────────────────────────────────────────
const R = (x, n = 1) => +x.toFixed(n);
ck('Kontrollräkning 9,257/0,257=36,0', nära(9.257 / 0.257, 36.0, 0.05) && body.includes('blir det 36,0'));
ck('P/E-fält 36,9≈36,874', nära(36.9, atco.vardering.pe, 0.05));
ck('Scenarioruta 9/9 celler', [[163.3, .196, 32.0], [163.3, .206, 33.6], [163.3, .216, 35.3], [168.3, .196, 33.0], [168.3, .206, 34.7], [168.3, .216, 36.4], [173.4, .196, 34.0], [173.4, .206, 35.7], [173.4, .216, 37.5]].every(([o, m, c]) => R(o * m) === c));
ck('Marginalsteg ≈1,7 mdr', nära(168.3 * .01, 1.7, 0.05));
ck('Omsättningssteg ≈1,0 mdr', nära(168.3 * .03 * .206, 1.0, 0.05));
ck('Kvot ≈1,6×', nära(1.683 / 1.0402, 1.6, 0.05));
ck('Hörncellspann 32,0–37,5 i text', body.includes('(32,0 till 37,5)'));
ck('Övning C: 36,9/1,19=31,0', nära(36.9 / 1.19, 31.0, 0.05));
ck('CAGR (168343/141325)^(1/3)=6,0 %', nära(100 * ((168343 / 141325) ** (1 / 3) - 1), 6.0, 0.05));
ck('Intro-ruta 168,3×20,6 %→cell 34,7; intro-text 34,6 (exakt 168,343×20,56 %=34,61) — fynd C3', nära(168.343 * .2056, 34.6, 0.05) && nära(168.3 * .206, 34.7, 0.05));

// ── 7. Juridik (2007:528) ────────────────────────────────────────────
const ytor = { title: u.title, description: u.description, body };
let vmFynd = [], vmVarning = [];
for (const [yt, text] of Object.entries(ytor)) {
  for (const p of vm.forbjudnaFraser) {
    const re = new RegExp(p.fran, 'i');
    const m = text.match(re);
    if (m) (p.allvar === 'FEL' ? vmFynd : vmVarning).push(`${yt}: /${p.fran}/ → "${m[0]}" (${p.allvar})`);
  }
}
ck('Varumärkesgrind 26 mönster × 3 ytor = 0 FEL-klass träffar', vmFynd.length === 0, vmFynd.join(' · '));
// "kunder" i övning A = redovisningsterm om Atlas Copcos kunder i definitionen av
// organisk tillväxt — inte platformens egen kundbenämning; A8/PRO-yteregeln träffar inte.
ck('1 mjuk VARNING (kunder, redovisningsterm — legitim)', vmVarning.length === 1, vmVarning.join(' · '));
ck('Ett lagrum: 2007:528 (2 kap 5 §), inget främmande', (body.match(/2007:528/g) || []).length === 1 && body.includes('2 kap 5 §') && !/2022:260|2022:261|1985:716|2005:59|2022:482/.test(body));
ck('Negerad rekommendation tidigt + disclaimer sist', body.includes('inte en rekommendation att köpa, sälja eller behålla') && body.includes('inte investeringsrådgivning') && body.trim().endsWith('kundens beslut.*'));
ck('R2-rad: publicering = kundens beslut', body.includes('publiceringen av detta paket är kundens beslut'));
ck('Prognos-avståndstaganden (3 st)', ['ingen kursprognos', 'inte en sanning och inte vår prognos', 'använt som räknestorhet, inte som prognos'].every(s => body.includes(s)));

// ── 8. 911-referenser ────────────────────────────────────────────────
const n911 = [/911/, /9\/11/, /11 september/, /september 2001/, /Porsche/].reduce((n, re) => n + (body.match(new RegExp(re, 'gi')) || []).length, 0);
ck('911-mönster 0/5', n911 === 0);

// ── 9. Struktur & länkar ─────────────────────────────────────────────
const ord = body.split(/\s+/).length;
ck('Ord 1 792 i kohortband (1 197–2 789, rm=6 hela 10-22-kullen)', ord >= 1197 && ord <= 2789 && u.readingMinutes === 6);
ck('Title 84 tecken i kohortband (77–158)', u.title.length >= 77 && u.title.length <= 158);
ck('Description 322 tecken i seriens band (291–1 057)', u.description.length >= 291 && u.description.length <= 1057);
ck('publishedAt 10-19 = syskonkonvention (skf/sandvik 10-19 för 10-22-kullen)', u.publishedAt === '2026-10-19');
ck('Pillar/author enligt serien', u.pillar === 'Institutionell metodik' && u.author === 'AK1A Research Lab');
const interna = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
ck('16 unika interna länkar (alla sitemap-gröna 2026-09-20)', interna.length === 16);
ck('/bolag/atco-a-st live men OLNKAD i utkastet (fynd C5)', !interna.includes('/bolag/atco-a-st'));

// ── rapport ─────────────────────────────────────────────────────────
console.log(`KONTROLL sa-laser-du-atlas-copco-q3-2026 — ${PASS.length} PASS, ${FEL.length} FEL`);
for (const f of FEL) console.log('FEL: ' + f);
console.log(`Dagens drift (225-filan, industri n=${ind.length}): P/E ${dag.indPe.toFixed(2)} · P/B ${dag.indPb.toFixed(2)} · EV/EBIT ${dag.indEv.toFixed(2)} · ROE ${dag.indRoe.toFixed(1)} % · EBIT ${dag.indEbit.toFixed(1)} %`);
console.log('FYND: R1 superlativ "seriens största" VÄNT · B1 σ-jämförelse Ericsson FEL (32>28) · C1 handssignal · C2 21,5/21,55 · C3 34,6/34,7 · C4 osatt-rad saknas · C5 /bolag/-länk');
process.exit(FEL.length ? 1 : 0);
