#!/usr/bin/env node
// _s1u1-ehandels-verify.mjs — sond för granskning av ehandelsaktier-sa-analyserar-du-plattformsbolag.json
// Granskare: s1-u1 instans 2 (manifest auto-s1-1789829700743), 2026-09-19.
// Källa låst till byggtidens vintage: bolagsunivers.json @ 795fe396 (09-17 03:04,
// sista commiten före utkastets skapande 09-17 03:28 — 144 poster).
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const UTKAST = 'data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json';
const VINTAGE_REF = '795fe396';
const u = JSON.parse(readFileSync(UTKAST, 'utf8'));
const body = u.body;
const uni = JSON.parse(execSync(`git show ${VINTAGE_REF}:data/portfolj-system/bolagsunivers.json`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
const list = Array.isArray(uni) ? uni : (uni.bolag || uni.poster || Object.values(uni).find(Array.isArray));
const byTicker = Object.fromEntries(list.map(p => [p.ticker, p]));
const vm = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));

let ok = 0, fel = 0;
const kontroller = [];
function K(id, beskrivning, passerad, detalj) {
  kontroller.push({ id, beskrivning, resultat: passerad ? 'OK' : 'FEL', detalj });
  if (passerad) ok++; else fel++;
}
const sv = x => x.toLocaleString('sv-SE'); // tusentalsavgränsare ej kritiskt; talen jämförs numeriskt
const har = s => body.includes(s);
const r1 = x => Math.round(x * 10) / 10; // en decimal, halv-upp

// ---------- A. KÄLLTALSPARITET mot universum @ 795fe396 ----------
const SHOP = byTicker.SHOP, MELI = byTicker.MELI, ABNB = byTicker.ABNB, UBER = byTicker.UBER, SE = byTicker.SE, AMZN = byTicker.AMZN;
K('A1', 'Ubers bruttomarginal 40,8 (universum 40,75)', har('40,8') && Math.abs(UBER.lonksamhet.bruttoMarginal * 100 - 40.75) < 0.01,
  `universum ${(UBER.lonksamhet.bruttoMarginal * 100).toFixed(2)} %`);
K('A2', 'Shopifys bruttomarginal 47,8 (universum 47,77)', har('47,8') && Math.abs(SHOP.lonksamhet.bruttoMarginal * 100 - 47.77) < 0.01,
  `universum ${(SHOP.lonksamhet.bruttoMarginal * 100).toFixed(2)} %`);
K('A3', 'Airbnbs bruttomarginal 82,9 (universum 82,9)', har('82,9') && Math.abs(ABNB.lonksamhet.bruttoMarginal * 100 - 82.9) < 0.01,
  `universum ${(ABNB.lonksamhet.bruttoMarginal * 100).toFixed(2)} %`);
K('A4', 'Uber −9 141 M$ 2022 och "minus 9,1 miljarder"', har('minus 9 141') && har('minus 9,1 miljarder') && UBER.serier.resultat[0] === -9141000000,
  `universum ${UBER.serier.resultat[0]} (${UBER.serier.ar[0]})`);
K('A5', 'Uber +10 053 M$ 2025', har('10 053') && UBER.serier.resultat[3] === 10053000000, `universum ${UBER.serier.resultat[3]}`);
K('A6', 'Sea −1 651 M$ 2022', har('minus 1 651') && SE.serier.resultat[0] === -1651421000, `universum ${SE.serier.resultat[0]} (texten avrundat)`);
K('A7', 'Sea +1 578 M$ 2025', har('1 578') && Math.abs(SE.serier.resultat[3] / 1e6 - 1578.149) < 1, `universum ${SE.serier.resultat[3]}`);
K('A8', 'Shopify −3 460 M$ 2022', har('minus 3 460') && SHOP.serier.resultat[0] === -3460418000, `universum ${SHOP.serier.resultat[0]} (texten avrundat)`);
K('A9', 'Shopify vinst alla tre följande år (2023–2025)', SHOP.serier.resultat.slice(1).every(x => x > 0),
  `universum ${SHOP.serier.resultat.slice(1).join(' / ')}`);
K('A10', 'Shopify omsättning 8,9 (2024) → 11,6 mdr (2025)', har('8,9') && har('11,6') && SHOP.serier.omsattning[2] === 8880000000 && SHOP.serier.omsattning[3] === 11556000000,
  `universum ${SHOP.serier.omsattning[2]} → ${SHOP.serier.omsattning[3]}`);
K('A11', 'Shopify 2025-resultat 2 019 → 1 231 M$', har('2 019') && har('1 231') && SHOP.serier.resultat[2] === 2019000000 && SHOP.serier.resultat[3] === 1231000000,
  `universum ${SHOP.serier.resultat[2]} / ${SHOP.serier.resultat[3]}`);
K('A12', 'Shopify skuld/EK "0,01 krona per krona" (universum 0,014)', har('0,01 krona skuld per krona') && SHOP.stabilitet.skuldEgenkapital === 0.014,
  `universum ${SHOP.stabilitet.skuldEgenkapital} → avrundat 0,01`);
K('A13', 'MELI intäkt 10,8 (2022) → 28,9 mdr (2025)', har('10,8') && har('28,9') && MELI.serier.omsattning[0] === 10780000000 && MELI.serier.omsattning[3] === 28893000000,
  `universum ${MELI.serier.omsattning[0]} → ${MELI.serier.omsattning[3]}`);
K('A14', 'MELI CAGR "38,9 procent per år" (universum 0,3891)', har('38,9 procent per år') && Math.abs(MELI.tillvaxt.omsattningCAGR5ar - 0.3891) < 0.0005,
  `universum ${(MELI.tillvaxt.omsattningCAGR5ar * 100).toFixed(2)} %`);
K('A15', 'MELI skuldsättningsgrad 1,69 (två träffar: modell + rapportpunkt)', (body.match(/1,69/g) || []).length >= 2 && MELI.stabilitet.skuldEgenkapital === 1.69,
  `universum ${MELI.stabilitet.skuldEgenkapital}, träffar ${body.match(/1,69/g)?.length}`);
K('A16', 'Airbnb ROE 34,5 (universum 34,54)', har('ROE 34,5') && Math.abs(ABNB.lonksamhet.roe * 100 - 34.54) < 0.01,
  `universum ${(ABNB.lonksamhet.roe * 100).toFixed(2)} %`);
K('A17', 'Airbnb FCF 4 646 mot resultat 2 511 M$ 2025', har('4 646') && har('2 511') && ABNB.serier.fcf[3] === 4646000000 && ABNB.serier.resultat[3] === 2511000000,
  `universum fcf ${ABNB.serier.fcf[3]} / resultat ${ABNB.serier.resultat[3]}`);
K('A18', 'Airbnb resultat 4 792 (2023) → 2 648 M$ (2024), intäkt växte', har('4 792') && har('2 648') && ABNB.serier.resultat[1] === 4792000000 && ABNB.serier.resultat[2] === 2648000000 && ABNB.serier.omsattning[2] > ABNB.serier.omsattning[1],
  `universum ${ABNB.serier.resultat[1]} → ${ABNB.serier.resultat[2]}, oms ${ABNB.serier.omsattning[1]} → ${ABNB.serier.omsattning[2]}`);
K('A19', 'Uber 52,0 mdr intäkt 2025', har('52,0 miljarder dollar i intäkt') && UBER.serier.omsattning[3] === 52017000000, `universum ${UBER.serier.omsattning[3]}`);
K('A20', 'Uber 9,8 mdr fritt kassaflöde 2025', har('9,8 miljarder i fritt kassaflöde') && UBER.serier.fcf[3] === 9763000000, `universum ${UBER.serier.fcf[3]} (avrundat 9,8)`);
K('A21', 'P/E-femtupplet: Uber 15,6 / Airbnb 38,1 / Sea 43,6 / MELI 49,8 / Shopify 94,6',
  ['15,6', '38,1', '43,6', '49,8', '94,6'].every(har) && r1(UBER.vardering.pe) === 15.6 && r1(ABNB.vardering.pe) === 38.1 && r1(SE.vardering.pe) === 43.6 && r1(MELI.vardering.pe) === 49.8 && r1(SHOP.vardering.pe) === 94.6,
  `universum ${[UBER, ABNB, SE, MELI, SHOP].map(p => p.vardering.pe.toFixed(2)).join(' / ')}`);
K('A22', 'Tillväxttakten: Sea 48,1 / MELI 46,0 / Shopify 33,7 / Uber 16,7',
  ['48,1', '46,0', '33,7', '16,7'].every(har) && r1(SE.tillvaxt.omsattningTillvaxtTTM * 100) === 48.1 && r1(MELI.tillvaxt.omsattningTillvaxtTTM * 100) === 46 && r1(SHOP.tillvaxt.omsattningTillvaxtTTM * 100) === 33.7 && r1(UBER.tillvaxt.omsattningTillvaxtTTM * 100) === 16.7,
  `universum ${[SE, MELI, SHOP, UBER].map(p => (p.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1)).join(' / ')}`);
K('A23', 'PEG: Sea 1,15 / Airbnb 1,42 / Shopify 2,61 / MELI 3,4',
  ['1,15', '1,42', '2,61', '3,4'].every(har) && SE.vardering.peg === 1.15 && ABNB.vardering.peg === 1.42 && SHOP.vardering.peg === 2.61 && MELI.vardering.peg === 3.4,
  `universum ${[SE, ABNB, SHOP, MELI].map(p => p.vardering.peg).join(' / ')} (Uber osatt/null — utelämnas i texten, korrekt)`);
K('A24', 'MELI FCF-yield 13,4 % (universum 0,134)', har('13,4 procent') && MELI.vardering.fcfYield === 0.134, `universum ${(MELI.vardering.fcfYield * 100).toFixed(1)} %`);
K('A25', 'Shopify FCF-yield 0,9 % (universum 0,0086)', har('0,9 (Shopify)') && Math.abs(SHOP.vardering.fcfYield - 0.0086) < 0.0005,
  `universum ${(SHOP.vardering.fcfYield * 100).toFixed(2)} % → avrundat 0,9`);
K('A26', 'Sea FCF-marginal 0,2 % (universum 0,0024)', har('0,2 procent') && Math.abs(SE.lonksamhet.fcfMarginal - 0.0024) < 0.0005,
  `universum ${(SE.lonksamhet.fcfMarginal * 100).toFixed(2)} %`);
K('A27', 'Amazon 2 680 mdr börsvärde + FCF-marginal −1,5 %', har('2 680 miljarder') && har('minus 1,5 procent') && AMZN.marknadsKapitalMdr === 2680 && AMZN.lonksamhet.fcfMarginal === -0.015,
  `universum mcap ${AMZN.marknadsKapitalMdr} mdr / fcfMarg ${(AMZN.lonksamhet.fcfMarginal * 100).toFixed(1)} %`);
K('A28', 'Ingressens källspann 2026-09-03–16', har('(2026-09-03–16)'),
  `källor: SHOP ${SHOP.hamtat}, SE ${SE.hamtat}, MELI ${MELI.hamtat}, ABNB ${ABNB.hamtat}, UBER ${UBER.hamtat}, AMZN ${AMZN.hamtat}`);

// ---------- B. ARIKMETIK (egna omräkningar) ----------
K('B1', 'Take rate-exempel: 10 mdr × 8 % = 0,8 mdr (ingress + sammanfattning)', har('10 miljarder dollar på ett år och tar 8 procent') && har('0,8 miljarder') && 10 * 0.08 === 0.8, '10 × 0,08 = 0,8 EXAKT');
K('B2', '"mer än sexfalt": 94,58/15,58 = 6,07 > 6', har('mer än sexfalt') && SHOP.vardering.pe / UBER.vardering.pe > 6,
  `${(SHOP.vardering.pe / UBER.vardering.pe).toFixed(3)}×`);
K('B3', 'Shopify intäktstillväxt "30 procent": 11 556/8 880 = 30,1 %', har('alltså 30 procent') && Math.abs(11556 / 8880 - 1.3014) < 0.001,
  `${((11556 / 8880 - 1) * 100).toFixed(2)} %`);
K('B4', 'Airbnb FCF/resultat 1,85×: 4 646/2 511 = 1,850', har('1,85 gånger') && Math.abs(4646 / 2511 - 1.8503) < 0.001, `${(4646 / 2511).toFixed(4)}×`);
K('B5', 'MELI CAGR egen omräkning: (28 893/10 780)^(1/3) = 38,91 %', Math.abs(Math.pow(28893 / 10780, 1 / 3) - 1 - 0.3891) < 0.001,
  `${((Math.pow(28893 / 10780, 1 / 3) - 1) * 100).toFixed(2)} %/år`);

// ---------- C. SUPERLATIV & SPANN (mot hela vintage-universumet) ----------
const allaTTM = list.filter(p => p.tillvaxt?.omsattningTillvaxtTTM != null).map(p => ({ t: p.ticker, v: p.tillvaxt.omsattningTillvaxtTTM })).sort((a, b) => b.v - a.v);
K('C1', 'Sea = universumets HÖGSTA TTM-tillväxt (superlativ mot alla 144)', allaTTM[0]?.t === 'SE',
  `topp-3: ${allaTTM.slice(0, 3).map(x => x.t + ' ' + (x.v * 100).toFixed(1) + '%').join(', ')}`);
const femPE = [SHOP, MELI, ABNB, UBER, SE].map(p => p.vardering.pe);
K('C2', 'Uber = lägst P/E av de fem ("lägst multipel")', Math.min(...femPE) === UBER.vardering.pe, `min ${Math.min(...femPE).toFixed(2)} (UBER)`);
const sexFCF = [SHOP, MELI, ABNB, UBER, SE, AMZN].map(p => p.lonksamhet.fcfMarginal);
K('C3', 'Amazon = kapitaltungast (lägst FCF-marginal) bland de sex e-handelsbolagen', Math.min(...sexFCF) === AMZN.lonksamhet.fcfMarginal,
  `${(Math.min(...sexFCF) * 100).toFixed(1)} % (AMZN)`);
const femBrutto = [SHOP, MELI, ABNB, UBER, SE].map(p => p.lonksamhet.bruttoMarginal * 100);
K('C4', 'Bruttomarginal-spann 40,8–82,9 bland de fem (min UBER, max ABNB)', Math.abs(Math.min(...femBrutto) - 40.75) < 0.01 && Math.abs(Math.max(...femBrutto) - 82.9) < 0.01,
  `min ${Math.min(...femBrutto).toFixed(2)} / max ${Math.max(...femBrutto).toFixed(2)}`);
const ttmFem = [SE, MELI, SHOP, UBER, ABNB].map(p => p.tillvaxt.omsattningTillvaxtTTM);
K('C5', '"Sea och Mercado Libre växer snabbast" av de fem', Math.max(...ttmFem) === SE.tillvaxt.omsattningTillvaxtTTM && [...ttmFem].sort((a, b) => b - a)[1] === MELI.tillvaxt.omsattningTillvaxtTTM,
  `ordning: ${[SE, MELI, SHOP, UBER, ABNB].map(p => p.ticker + ' ' + (p.tillvaxt.omsattningTillvaxtTTM * 100).toFixed(1)).join(', ')}`);
// Modekedjor i detaljhandeln: brutto "kring 54–56".
// Population: H&M + Inditex (Industria de Diseño Textil) — LVMH är LYX (egen guide i serien),
// inte modekedja i detaljhandeln (första sondkörningens regex felmatchade "Hennessy"→"Hennes").
const mode = list.filter(p => /H & M Hennes|Industria de Dise/i.test(p.namn));
const modeBrutto = mode.map(p => `${p.namn.slice(0, 20)}: ${(p.lonksamhet.bruttoMarginal * 100).toFixed(1)}%`);
K('C6', 'Modekedjornas bruttomarginal "kring 54–56 procent" (H&M + Inditex; LVMH=lyx exkluderad)',
  mode.length === 2 && mode.every(p => p.lonksamhet.bruttoMarginal * 100 >= 53.5 && p.lonksamhet.bruttoMarginal * 100 <= 56.6),
  modeBrutto.join(' · '));
// FCF-yield-spannets undre ände bland de fem (fyndkontroll: texten säger "till 0,9 (Shopify)")
const femYield = [SHOP, MELI, ABNB, UBER, SE].map(p => ({ t: p.ticker, v: p.vardering.fcfYield })).sort((a, b) => a.v - b.v);
K('C7', 'FCF-yield-spannets undre ände bland de fem (texten: "till 0,9 (Shopify)")', femYield[0].t === 'SHOP',
  `ordning: ${femYield.map(x => x.t + ' ' + (x.v * 100).toFixed(2) + '%').join(', ')} — Sea ligger UNDER Shopifys 0,9`);

// ---------- D. JURIDIK 2007:528 ----------
const ytor = { title: u.title, description: u.description, body };
for (const [ytNamn, text] of Object.entries(ytor)) {
  const traffar = vm.forbjudnaFraser.filter(f => new RegExp(f.fran, 'i').test(text));
  K(`D-${ytNamn}`, `Förbjudna varumärkes-/rådgivningsfraser i ${ytNamn} (0/${vm.forbjudnaFraser.length})`, traffar.length === 0,
    traffar.map(t => t.fran).join(', ') || '0 träffar');
}
const radgMeningar = [...body.matchAll(/[^.!?]*\b(köpa|köper|köp|sälja|säljer|sälj|rekommenderar|rekommendera|bör du|borde du|råder dig)\b[^.!?]*[.!?]/gi)].map(m => m[0].trim());
const imperativa = radgMeningar.filter(m => /\b(du|dig|din|dina)\b/i.test(m));
K('D-radglossor', 'Rådglossor klassificerade: deskriptiva OK, imperativ FEL (0 imperativ)', imperativa.length === 0,
  radgMeningar.length === 0 ? '0 träffar' : `${radgMeningar.length} träffar, samtliga deskriptiva (0 imperativ): ${radgMeningar.map(m => '“' + m.slice(0, 60).trim() + '…”').join(' · ')}`);
const lagrum = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59', '2022:482'].filter(l => body.includes(l) || u.title.includes(l) || u.description.includes(l));
K('D-lagrum', 'Lagrum i texten (0 = ingen blandningsrisk)', lagrum.length === 0, lagrum.join(', ') || '0 träffar');
const sistaRad = body.trim().split('\n').pop().trim();
K('D-disclaimer', 'Disclaimer exakt sista rad', sistaRad === '_Detta är pedagogisk finansanalys, inte investeringsråd._', sistaRad);
K('D-utbildningsram', 'Utbildningsram i ingressen', /guiden går igenom|så fungerar|steg för steg/i.test(body.slice(0, 1200)), body.slice(0, 1200).match(/guiden går igenom[^.]*/i)?.[0] || 'saknas');

// ---------- E. 911-KONTROLL ----------
const p911 = ['911', '9/11', '11 september', 'september 11', 'eleven september', 'nine eleven'];
const t911 = p911.filter(p => new RegExp(p.replace(/\//g, '\\/'), 'i').test(body) || new RegExp(p.replace(/\//g, '\\/'), 'i').test(u.title));
K('E-911', '911-referenser (0/6 mönster)', t911.length === 0, t911.join(', ') || '0/6');

// ---------- F. STRUKTUR ----------
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
K('F-h2', 'H2-antal (seriekonvention ~8)', h2.length >= 6 && h2.length <= 9, `${h2.length} H2: ${h2.map(h => h.split('—')[0].trim()).join(' | ')}`);
K('F-title', 'Title ≤ 60 tecken', u.title.length <= 60, `${u.title.length}/60`);
K('F-desc', 'Description ≤ 155 tecken', u.description.length <= 155, `${u.description.length}/155`);
K('F-tags', '5 tags', u.tags.length === 5, u.tags.join(', '));
const sokord = 'e-handelsaktier';
K('F-sokord', `Sökordet "${sokord}" i title+description+ingress+första H2`,
  u.title.toLowerCase().includes(sokord) && u.description.toLowerCase().includes(sokord) && body.slice(0, 900).toLowerCase().includes(sokord) && h2[0].toLowerCase().includes(sokord),
  `title ${u.title.toLowerCase().includes(sokord) ? '✓' : '✗'} desc ${u.description.toLowerCase().includes(sokord) ? '✓' : '✗'} ingress ${body.slice(0, 900).toLowerCase().includes(sokord) ? '✓' : '✗'} h2 ${h2[0].toLowerCase().includes(sokord) ? '✓' : '✗'}`);
const mjuka = (body.match(/\u00AD/g) || []).length;
K('F-mjuka', 'Mjuka bindestreck (U+00AD) = 0', mjuka === 0, `${mjuka} träffar`);
const ord = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_>|]/g, ' ').split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
K('F-ord', `Ordräkning → readingMinutes-praxis ord/200 (nuvarande ${u.readingMinutes})`, true,
  `${ord} ord ⇒ praxis ${Math.max(1, Math.round(ord / 200))} min (deklarerat ${u.readingMinutes})`);
K('F-rm', 'readingMinutes stämmer mot ord/200-praxis', u.readingMinutes === Math.max(1, Math.round(ord / 200)),
  `deklarerat ${u.readingMinutes} mot praxis ${Math.max(1, Math.round(ord / 200))}`);
const forstaCommit = execSync(`git log --diff-filter=A --format=%ad --date=format:%Y-%m-%d -- ${UTKAST}`, { encoding: 'utf8' }).trim();
K('F-pubdatum', 'publishedAt = skapandedatum (första commit)', forstaCommit === u.publishedAt, `första commit ${forstaCommit} mot publishedAt ${u.publishedAt}`);

// ---------- G. LÄNKAR (flock-låset kontrollerat FRITT före dom — u1-instans-1:s läxa) ----------
const lankar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
const resultat = [];
for (const lank of lankar) {
  try {
    const r = await fetch(`http://localhost:3000${lank}`, { signal: AbortSignal.timeout(15000) });
    resultat.push({ lank, status: r.status });
  } catch (e) { resultat.push({ lank, status: 'FEL: ' + e.message }); }
}
const doda = resultat.filter(r => r.status !== 200);
K('G-lankar', `Interna länkar HTTP 200 mot localhost (${resultat.length - doda.length}/${resultat.length})`, doda.length === 0,
  doda.map(d => `${d.lank} → ${d.status}`).join(', ') || `alla ${resultat.length} OK`);
const bloggMal = lankar.filter(l => l.startsWith('/blogg/'));
const liveBlogg = bloggMal.filter(l => {
  try { execSync(`test -f data/blogg/${l.replace('/blogg/', '')}.json || test -f data/blogg/${l.replace('/blogg/', '')}.md`, { stdio: 'ignore' }); return true; } catch { return false; }
});
K('G-blogg', `Bloggmål motsvaras av live-fil i data/blogg/ (${liveBlogg.length}/${bloggMal.length})`, liveBlogg.length === bloggMal.length,
  bloggMal.map(b => `${b} ${liveBlogg.includes(b) ? 'LIVE' : 'SAKNAS'}`).join(' · '));

// ---------- H. DIFF-POSTERNAS SÖKSTRÄNGAR (unika ×1) ----------
const diffSok = [
  'FCF-yielden spänner från 13,4 procent (Mercado Libre) till 0,9 (Shopify)',
  'kundmedel gör 13,4 och 0,9 procent till olika saker',
];
for (const [i, s] of diffSok.entries()) {
  const n = body.split(s).length - 1;
  K(`H-unik${i + 1}`, `Söksträng unik ×1: "${s.slice(0, 60)}…"`, n === 1, `${n} träffar`);
}

// ---------- RAPPORT ----------
console.log(`\n=== SOND s1-u1 instans 2 — ehandelsaktier (vintage ${VINTAGE_REF}, ${list.length} poster) ===`);
for (const k of kontroller) console.log(`${k.resultat === 'OK' ? 'OK ' : 'FEL'} ${k.id}: ${k.beskrivning} — ${k.detalj}`);
console.log(`\nTOTALT: ${ok} OK / ${fel} FEL av ${kontroller.length} kontroller`);
