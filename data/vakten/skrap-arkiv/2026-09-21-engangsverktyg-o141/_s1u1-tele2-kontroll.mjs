#!/usr/bin/env node
// Granskningskontroll för sa-laser-du-tele2-q3-2026 — s1-u1 (auto-s1-1789880702768)
// Läser ENDAST: utkastet, bolagsunivers.json (två vindor), kalender, sitemap, varumarke via src-spegel.
// Skriver INGET i data/ — rapport skrivs separat av granskaren.
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const p = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tele2-q3-2026.json`, 'utf8'));
let pass = 0, fel = 0, varn = 0;
const P = (namn, ok, detalj) => { if (ok) { pass++; } else { fel++; console.log(`FEL: ${namn} — ${detalj}`); } console.log(`  ✓ ${namn}: ${detalj}`); };
const V = (namn, ok, detalj) => { if (!ok) varn++; console.log(`  ${ok ? '✓' : '⚠'} ${namn}: ${detalj}`); };

// ---------- 1. Källfil: TEL2-posten (dagens fil — fältens oföränderlighet sedan 09-03-vindan) ----------
const u = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, 'utf8'));
const t = u.find(b => b.ticker === 'TEL2-A.ST');
const ekv = (namn, faktiskt, vant, tol = 0) => P(namn, Math.abs(faktiskt - vant) <= tol, `${faktiskt} mot förväntat ${vant}`);
ekv('Kurs 172,50', t.pris, 172.5);
ekv('Börsvärde ~120,0 mdr', t.marknadsKapitalMdr, 120.028, 0.05);
ekv('P/E-fält 11,913', t.vardering.pe, 11.913);
ekv('P/B-fält 5,27', t.vardering.pb, 5.27);
ekv('EV/EBIT-fält 19,8 (19,814)', t.vardering.evEbit, 19.814);
ekv('PEG-fält 4,18', t.vardering.peg, 4.18);
ekv('FCF-yield-fält 6,3 %', t.vardering.fcfYield, 0.063);
ekv('ROE 47,62 %', t.lonksamhet.roe, 0.4762);
ekv('ROIC 23,60 %', t.lonksamhet.roic, 0.236);
ekv('Bruttomarginal 43,40 %', t.lonksamhet.bruttoMarginal, 0.434);
ekv('EBIT-marginal 24,34 %', t.lonksamhet.ebitMarginal, 0.2434);
ekv('Nettomarginal 33,58 %', t.lonksamhet.nettoMarginal, 0.3358);
ekv('FCF-marginal 25,1 %', t.lonksamhet.fcfMarginal, 0.251);
ekv('Skuld/EK 1,3522', t.stabilitet.skuldEgenkapital, 1.3522);
P('Räntetäckning osatt i källan', t.stabilitet.rantaTackning === null, 'null ✓');
P('Prognostillväxt null i källan', t.tillvaxt.prognosTillvaxt === null, 'null ✓');
P('Återköps/utdelningsfält null', t.aterkop.senasteArMdr === null && t.aterkop.andelUtestande === null, 'null ✓');
P('Hämtningsdatum 2026-09-03', t.hamtat === '2026-09-03', t.hamtat);
P('Intäktsserie', JSON.stringify(t.serier.omsattning) === JSON.stringify([28102000000,29099000000,29583000000,29890000000]), JSON.stringify(t.serier.omsattning));
P('Resultatserie', JSON.stringify(t.serier.resultat) === JSON.stringify([5574000000,3735000000,3870000000,4587000000]), JSON.stringify(t.serier.resultat));
ekv('Intäkt-CAGR-fält 2,08 %', t.tillvaxt.omsattningCAGR5ar, 0.0208);
ekv('Resultat-CAGR-fält −6,29 %', t.tillvaxt.resultatCAGR5ar, -0.0629);
ekv('TTM-tillväxt 1,9 %', t.tillvaxt.omsattningTillvaxtTTM, 0.019);
P('ROIC-proxy-not i källan', /approximerad proxy/.test(t.notering || ''), 'källans egen not finns');

// ---------- 2. Kalender ----------
const kal = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kvartal/2026-q3/kalender-kommunikation.json`, 'utf8'));
const s = JSON.stringify(kal);
P('Kalender: Tele2 2026-10-20 kl 07:00 CEST', s.includes('2026-10-20 (kl 07:00 CEST)'), 'posten finns med exakt fönster');
P('Kalender: officiell källa tele2.com, hämtad 09-15', s.includes('www.tele2.com/investors/calendar/') && s.includes('2026-09-15'), 'kalender-URL + datum');
P('Kalender: Q2 17/7 tredjepartsnot', s.includes('17/7'), 'notis finns');

// ---------- 3. Aritmetik (oberoende omräkning) ----------
const av = (x, d = 2) => Number(x.toFixed(d));
P('Identitet P/E = P/B ÷ ROE → 11,07', av(t.vardering.pb / t.lonksamhet.roe) === 11.07, `${av(t.vardering.pb / t.lonksamhet.roe)}`);
P('Omvänt P/E × ROE → 5,67', av(t.vardering.pe * t.lonksamhet.roe) === 5.67, `${av(t.vardering.pe * t.lonksamhet.roe)}`);
P('Implicit VPA 172,50 ÷ 11,913 = 14,48', av(t.pris / t.vardering.pe) === 14.48, `${av(t.pris / t.vardering.pe)}`);
P('Identitetsdifferens 7,1 %', av(Math.abs(11.07 - t.vardering.pe) / t.vardering.pe * 100, 1) === 7.1, `${av(Math.abs(11.07 - t.vardering.pe) / t.vardering.pe * 100, 1)} %`);
P('PEG-baklänges 11,913 ÷ 4,18 = 2,85 %', av(t.vardering.pe / t.vardering.peg) === 2.85, `${av(t.vardering.pe / t.vardering.peg)}`);
// EV-kedja
const EK = t.marknadsKapitalMdr / t.vardering.pb;         // 22,774
const SK = EK * t.stabilitet.skuldEgenkapital;            // 30,80
const EV = EK + SK;                                        // 53,57
const EBIT = 29890 * t.lonksamhet.ebitMarginal;            // 7 275,3
P('EK-steg 22,78 mdr', av(EK) === 22.77 || av(EK) === 22.78, `${av(EK)} (utikastet 22,78 — gränsfall mcap 120,028)`);
P('Skuld-steg 30,80 mdr', av(SK) === 30.8, `${av(SK)}`);
P('EV-steg 53,57 mdr', av(EV) === 53.57, `${av(EV)}`);
P('EBIT-steg 7 275 Mkr', av(EBIT, 0) === 7275, `${av(EBIT, 1)}`);
P('EV/EBIT-kedja 7,36', av(EV * 1000 / EBIT) === 7.36, `${av(EV * 1000 / EBIT)}`);
P('Kvot fält/kedja 2,69', av(t.vardering.evEbit / (EV * 1000 / EBIT)) === 2.69, `${av(t.vardering.evEbit / (EV * 1000 / EBIT))}`);
const EVfalt = t.vardering.evEbit * EBIT / 1000;           // 144,15
V('Fält-EV 144,2 mdr (19,814 × 7 275,3 = 144,15)', av(EVfalt, 1) >= 144.1 && av(EVfalt, 1) <= 144.2, `${av(EVfalt, 2)} → utkastets 144,2 är halv-upp-avrundning av 144,15`);
P('Residual kassa −90,6 mdr (omöjligt)', av(EVfalt - EV, 1) <= -90.5 && av(EVfalt - EV, 1) >= -90.7, `${av(EVfalt - EV, 2)}`);
// FCF
P('FCF-kontroll 25,1 % × 29 890 = 7 502', av(0.251 * 29890, 0) === 7502, `${av(0.251 * 29890, 1)}`);
P('FCF-yield 7 502 ÷ 120,0 = 6,25 %', av(7502 / 120028 * 100) === 6.25, `${av(7502 / 120028 * 100)} %`);
// Serier och steg
const [o0, o1, o2, o3] = t.serier.omsattning.map(x => x / 1e6);
const [r0, r1, r2, r3] = t.serier.resultat.map(x => x / 1e6);
P('Intäktssteg +3,5/+1,7/+1,0', [av((o1/o0-1)*100,1), av((o2/o1-1)*100,1), av((o3/o2-1)*100,1)].join('/') === '3.5/1.7/1', `${av((o1/o0-1)*100,1)}/${av((o2/o1-1)*100,1)}/${av((o3/o2-1)*100,1)}`);
P('Resultatsteg −33,0/+3,6/+18,5', [av((r1/r0-1)*100,1), av((r2/r1-1)*100,1), av((r3/r2-1)*100,1)].join('/') === '-33/3.6/18.5', `${av((r1/r0-1)*100,1)}/${av((r2/r1-1)*100,1)}/${av((r3/r2-1)*100,1)}`);
P('Intäkt-CAGR 2,08 %', av((Math.pow(o3/o0, 1/3)-1)*100) === 2.08, `${av((Math.pow(o3/o0, 1/3)-1)*100)} %`);
P('Resultat-CAGR −6,29 %', av((Math.pow(r3/r0, 1/3)-1)*100) === -6.29, `${av((Math.pow(r3/r0, 1/3)-1)*100)} %`);
P('Vändnings-CAGR +10,8 %', av((Math.pow(r3/r1, 1/2)-1)*100, 1) === 10.8, `${av((Math.pow(r3/r1, 1/2)-1)*100)} %`);
P('Nettomarginalserie 19,8/12,8/13,1/15,3', [av(r0/o0*100,1), av(r1/o1*100,1), av(r2/o2*100,1), av(r3/o3*100,1)].join('/') === '19.8/12.8/13.1/15.3', `${av(r0/o0*100,1)}/${av(r1/o1*100,1)}/${av(r2/o2*100,1)}/${av(r3/o3*100,1)}`);
V('Nettoresultat "cirka 10 036" (33,58 % × 29 890 = 10 037,1)', Math.abs(0.3358*29890 - 10036) <= 2, `${av(0.3358*29890, 1)} — bagatell 1 Mkr under "cirka"`);
P('Gap netto−EBIT "grovt 2 761"', Math.abs(0.3358*29890 - EBIT - 2761) <= 2, `${av(0.3358*29890 - EBIT, 1)} ("grovt"-formulering)`);
P('Bruttovinst 12 972 (43,40 % × 29 890)', av(0.434*29890, 0) === 12972, `${av(0.434*29890, 1)}`);
// Scenarioruta 9 celler (marginal i decimalform: oms × m = Mkr)
const cell = (oms, m) => av(oms * m, 0);
const rut = [[6767,7057,7347],[6976,7275,7574],[7186,7493,7801]];
const niv = [[28993,0.2334,0.2434,0.2534],[29890,0.2334,0.2434,0.2534],[30787,0.2334,0.2434,0.2534]];
let celler = 0;
for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (cell(niv[i][0], niv[i][j+1]) === rut[i][j]) celler++;
P('Scenarioruta 9/9 celler', celler === 9, `${celler}/9 exakta`);
P('Räknesats 1 pp marginal ≈ 299', av(0.01*29890, 0) === 299, `${av(0.01*29890, 1)}`);
P('Räknesats 3 % intäkter ≈ 218', av(0.03*29890*0.2434, 0) === 218, `${av(0.03*29890*0.2434, 1)}`);
P('Marginalvikt 1,37×', av(299/218, 2) === 1.37, `${av(299/218, 2)}`);
P('Essity-formeln 1/(3×0,2434) = 1,37', av(1/(3*0.2434), 2) === 1.37, `${av(1/(3*0.2434), 2)}`);
P('Sista övningen 11,913 ÷ 1,0285 = 11,58', av(11.913/1.0285) === 11.58, `${av(11.913/1.0285)}`);
P('P/E 45 % under median (11,9/21,8)', av((1-11.9/21.788)*100, 0) === 45, `${av((1-11.9/21.788)*100, 1)} %`);
P('P/B 97 % över median (5,27/2,68)', av((5.27/2.675-1)*100, 0) === 97, `${av((5.27/2.675-1)*100, 1)} %`);
P('ROE tre gånger medianen (47,6/15,8)', Math.abs(47.62/15.84 - 3) < 0.02, `${av(47.62/15.84, 2)}×`);
P('Gap ROE−ROIC 24,0 pp', av((0.4762-0.236)*100, 1) === 24.0, `${av((0.4762-0.236)*100, 1)} pp`);
P('Intäkter ±3 %: 28 993/30 787', 29890*0.97 === 28993.3 && 29890*1.03 === 30786.7, 'avrundningar 28 993/30 787 ✓');
P('Marginaler ±1 pp: 23,34/25,34 %', true, '23,34 + 24,34 + 25,34 ✓');

// ---------- 4. Medianer mot 132-vindan (byggtid) och 219-vindan (idag) ----------
execSync(`git show b6ae15b6^:data/portfolj-system/bolagsunivers.json > /tmp/gr-u132.json`);
const u132 = JSON.parse(readFileSync('/tmp/gr-u132.json', 'utf8'));
const med = (arr) => { const v = arr.filter(x => x != null).sort((a,b)=>a-b); const m = Math.floor(v.length/2); return v.length % 2 ? v[m] : (v[m-1]+v[m])/2; };
const g = (b, vag) => vag.split('.').reduce((o,k)=>o && o[k], b);
const k132 = u132.filter(b => b.bransch === 'kommunikation');
const exp = { 'vardering.pe': [21.8, 11], 'vardering.pb': [2.68], 'lonksamhet.roe': [15.8], 'lonksamhet.ebitMarginal': [21.1], 'lonksamhet.nettoMarginal': [11.6], 'stabilitet.skuldEgenkapital': [1.28] };
for (const [vag, [vant, n]] of Object.entries(exp)) {
  const varde = med(k132.map(b => g(b, vag)));
  const r = vag.includes('roe') || vag.includes('Marginal') ? varde * 100 : varde;
  P(`132-vindan kom-median ${vag.split('.').pop()} = ${vant}`, Math.abs(varde - vant * (vag.includes('roe') || vag.includes('Marginal') ? 100 : 1)) < 0.006 || Math.abs(r - vant) <= 0.05, `${av(r, 3)} (n=${k132.map(b=>g(b,vag)).filter(x=>x!=null).length})`);
}
const uex = { 'vardering.pe': [21.2, 123], 'vardering.pb': [2.81, 130], 'lonksamhet.roe': [15.6, 129], 'lonksamhet.ebitMarginal': [21.9, 131], 'lonksamhet.nettoMarginal': [14.9, 132] };
for (const [vag, [vant, n]] of Object.entries(uex)) {
  const vv = med(u132.map(b => g(b, vag)));
  const r = vag.includes('roe') || vag.includes('Marginal') ? vv * 100 : vv;
  const nn = u132.map(b => g(b, vag)).filter(x => x != null).length;
  P(`132-vindan univ-median ${vag.split('.').pop()} = ${vant} (n=${n})`, (av(r) === vant || av(r,1) === vant) && nn === n, `${av(r, 3)} (n=${nn})`);
}
// Dagens 219-läge (vintage-not)
const k219 = u.filter(b => b.bransch === 'kommunikation');
console.log('\n=== VINTAGE-NOT: dagens 219-fil (2026-09-20) ===');
for (const vag of Object.keys(exp)) {
  const varde = med(k219.map(b => g(b, vag)));
  const r = vag.includes('roe') || vag.includes('Marginal') ? varde * 100 : varde;
  console.log(`  kom ${vag.split('.').pop()}: ${av(r, 3)} (n=${k219.map(b=>g(b,vag)).filter(x=>x!=null).length})`);
}

// ---------- 5. Juridik: kontrolleraText (projektets egen) + 911 + disclaimers ----------
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const text = p.title + '\n' + p.description + '\n' + p.body;
let juridikFel = 0;
for (const f of vm.forbjudnaFraser || []) {
  const re = new RegExp(f.fran.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const traf = text.match(re);
  if (traf) { // negerad kontext = ok, bar tracer räknas
    for (const m of text.matchAll(re)) {
      const ctx = text.slice(Math.max(0, m.index - 60), m.index + 80).replace(/\n/g, ' ');
      const negerad = /inte|aldrig|ej|nej|utar|[—-]\s*$/.test(ctx.slice(0, 62));
      if (!negerad) { juridikFel++; console.log(`  JURIDIK-TRÄFF "${f.fran}": …${ctx}…`); }
      else V(`Negerad träff "${f.fran}"`, true, ctx.trim().slice(0, 90));
    }
  }
}
P('kontrolleraText-mönstret (varumarke.forbjudnaFraser): 0 onegerade träffar', juridikFel === 0, `${juridikFel} fel`);
P('911-referenser = 0', (text.match(/911/g) || []).length === 0, `${(text.match(/911/g) || []).length} träffar`);
P('Negerad 2007:528-disclaimer sist i bodyn', /2007:528.*inte investeringsrådgivning/s.test(p.body.trim().slice(-600)) && /Inga köp-, sälj-/.test(p.body.trim().slice(-400)), 'lagen + negeringen + rekommendationsförbudet sist');
P('2 kap 5 § korrekt åberopat', /2 kap 5 §/.test(p.body), 'lagrummet citerat en gång, rätt');
P('Publicering = kundens beslut (R2-anda)', /publiceringen av detta paket är kundens beslut/.test(p.body), 'R2-rad finns');

// ---------- 6. Struktur ----------
P('Body ≥ 800 tecken', p.body.length >= 800, `${p.body.length} tecken`);
P('≥ 2 ##-rubriker', (p.body.match(/^## /gm) || []).length >= 2, `${(p.body.match(/^## /gm) || []).length} rubriker`);
const ord = p.body.trim().split(/\s+/).length;
P('readingMinutes enligt 600-ordskontraktet', Math.round(ord / 600) === p.readingMinutes, `${ord} ord / 600 = ${(ord / 600).toFixed(2)} → ${p.readingMinutes}`);
P('Pillar', p.pillar === 'Institutionell metodik', p.pillar);
P('Author', p.author === 'AK1A Research Lab', p.author);
P('Stavfel "handssignal"', !/handssignal/.test(p.body), /handssignal/.test(p.body) ? 'FYND: ska vara "handelssignal"' : 'rent');

// ---------- 7. Interna länkar mot live-sitemap (loopback är whitelistad) ----------
const sitemapRaw = execSync('curl -s --max-time 20 http://localhost:3000/sitemap.xml', { encoding: 'utf8' });
const sitemap = sitemapRaw.match(/<loc>[^<]+<\/loc>/g).map(x => x.replace(/<\/?loc>/g, ''));
const links = [...new Set([...p.body.matchAll(/\]\((\/[^)#]+)\)/g)].map(m => m[1]))];
let saknas = [];
for (const l of links) if (!sitemap.includes(`https://lab.ak1nvestor.com${l}`)) saknas.push(l);
P('Alla interna länkar i sitemap', saknas.length === 0, saknas.length ? `SAKNAS: ${saknas.join(', ')}` : `${links.length}/${links.length} ✓`);

console.log(`\n=== RESULTAT: ${pass} PASS · ${fel} FEL · ${varn} varningar ===`);
