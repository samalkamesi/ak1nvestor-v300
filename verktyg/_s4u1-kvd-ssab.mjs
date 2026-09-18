#!/usr/bin/env node
// KVD för SSAB Q3-läspaket (s4-u1, manifest auto-s4-1789742101501, pivot v2).
// Oberoende omräkning: paketets tal kontrolleras mot bolagsuniversumets
// SSAB-B.ST-post och mot egen aritmetik — inte mot byggskriptets utdata.
// Grupper: struktur, källtalsparitet, aritmetik, medianer/rang, scenarioruta,
// juridikgrind, interna länkar, ordräkning.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-ssab-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const j = JSON.parse(readFileSync(PAKET, 'utf8'));
const u = JSON.parse(readFileSync(UNI, 'utf8'));
const list = Array.isArray(u) ? u : (u.bolag || u.universum);
const p = list.find(x => x.ticker === 'SSAB-B.ST');
const B = j.body;

let pass = 0, fel = 0, varn = 0;
const ok = (villkor, namn) => { if (villkor) pass++; else { fel++; console.log('FEL: ' + namn); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sv = (x, d = 0) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/\u00A0/g, ' ');
const har = (str) => B.includes(str);

console.log('===== KVD: ' + PAKET.split('/').pop() + ' =====');

// ===== 1. STRUKTUR =====
ok(j.slug === 'sa-laser-du-ssab-q3-2026', 'slug matchar filnamn');
ok(j.publishedAt === '2026-10-28', 'publishedAt = rappdagen 2026-10-28');
ok(j.pillar === 'Institutionell metodik' && j.author === 'AK1A Research Lab', 'pillar/author enligt serien');
ok(Array.isArray(j.tags) && j.tags.length === 6 && j.tags.includes('kvartalsrapport') && j.tags.includes('SSAB'), 'tags 6 st med seriens kärna');
ok(j.title.length <= 292, 'title ≤ 292 tkn (' + j.title.length + ')');
ok(j.description.length >= 140 && j.description.length <= 605, 'desc 140–605 tkn (' + j.description.length + ')');
ok(!/\u00AD/.test(JSON.stringify(j)), '0 mjuka bindestreck i hela filen');
const ord = B.replace(/\|/g, ' ').split(/\s+/).filter(Boolean).length;
ok(j.readingMinutes === Math.round(ord / 600), 'readingMinutes ' + j.readingMinutes + ' = round(' + ord + '/600)');
ok(ord >= 2400 && ord <= 3600, 'ordtal i seriens spann 2 400–3 600 (' + ord + ')');
ok(har('## Urvalet') && har('## Nyckeltalen') && har('## Datavakten') && har('## Så står sig bolaget mot branschen') && har('## Tre sätt att läsa utfallet') && har('## Praktiskt inför 28 oktober') && har('## Källor'), 'seriens sju H2-sektioner');

// ===== 2. KÄLLTALSPARITET (pakettext mot universumposten) =====
const paritet = [
  ['18,49', p.vardering.pe], ['1,457', p.vardering.pb], ['9,758', p.vardering.evEbit], ['3,76', p.vardering.peg],
  ['8,13', p.lonksamhet.roe * 100], ['14,02', p.lonksamhet.bruttoMarginal * 100], ['9,67', p.lonksamhet.ebitMarginal * 100],
  ['5,73', p.lonksamhet.nettoMarginal * 100], ['2,91', Math.abs(p.lonksamhet.fcfMarginal) * 100],
  ['0,153', p.stabilitet.skuldEgenkapital], ['103,55', p.pris],
  ['25,53', p.tillvaxt.prognosTillvaxt * 100], ['9,25', Math.abs(p.tillvaxt.omsattningCAGR5ar) * 100], ['7,2', p.tillvaxt.omsattningTillvaxtTTM * 100],
];
for (const [txt, fält] of paritet) ok(har(txt) && near(parseFloat(txt.replace(',', '.')), fält, 0.005 + Math.abs(fält) * 0.0005), 'källtalsparitet: ' + txt + ' i text && = postens ' + fält);
const serOms = p.serier.omsattning.map(x => x / 1e6), serRes = p.serier.resultat.map(x => x / 1e6);
for (const v of [128745, 119489, 103418, 96220]) ok(serOms.includes(v) && har(sv(v)), 'omsättningsserie ' + sv(v) + ' Mkr i text && post');
for (const v of [-10886, 13029, 6522, 4902]) ok(serRes.includes(v) && (v < 0 ? har(sv(v)) : har(sv(v))), 'resultatserie ' + sv(v) + ' Mkr i text && post');
ok(p.tillvaxt.resultatCAGR5ar === null && har('CAGR-fält är null'), 'resultatCAGR null redovisas');
ok(p.marknadsKapitalMdr === null && har('börsvärdesfältet är null'), 'mcap-null redovisas öppet');
ok(JSON.stringify(p.serier.ar) === '["2022","2023","2024","2025"]', 'fyra räkenskapsår 2022–2025');

// ===== 3. ARITMETIK (oberoende omräkning) =====
const { pe, pb, evEbit, peg } = p.vardering;
const { roe, nettoMarginal, ebitMarginal, fcfMarginal } = p.lonksamhet;
const ident = pb / roe;
ok(near(ident, 17.92, 0.005) && har('17,92'), 'identitet P/B÷ROE = 17,92');
ok(near(Math.abs(pe - ident) / pe * 100, 3.1, 0.05) && har('3,1 procent'), 'identitetsavvikelse 3,1 %');
ok(near(pe * roe, 1.50, 0.005) && har('1,50'), 'omvänd identitet P/E×ROE = 1,50');
ok(near(p.pris / pe, 5.60, 0.005) && har('5,60 kronor'), 'implicit EPS 5,60 kr');
const ttmOms = serOms[3] * (1 + p.tillvaxt.omsattningTillvaxtTTM);
ok(near(ttmOms, 103148, 1) && har(sv(103148)), 'TTM-omsättning 103 148 Mkr');
const nettoTTM = nettoMarginal * ttmOms;
ok(near(nettoTTM, 5910, 1) && har(sv(5910)), 'netto TTM 5 910 Mkr');
const mcapPE = pe * nettoTTM / 1000, ekROE = nettoTTM / roe / 1000, mcapPB = pb * ekROE;
ok(near(mcapPE, 109.3, 0.05) && har('109,3'), 'mcap P/E-vägen 109,3 mdr');
ok(near(ekROE, 72.7, 0.05) && har('72,7'), 'EK ur ROE 72,7 mdr');
ok(near(mcapPB, 105.9, 0.05) && har('105,9'), 'mcap P/B-vägen 105,9 mdr');
ok(near(Math.abs(mcapPE - mcapPB) / mcapPE * 100, 3.1, 0.05) && har('3,1 procent'), 'väg-spridning 3,1 %');
ok(near(mcapPB * 1000 / serRes[3], 21.6, 0.05) && har('21,6'), 'bokförd-vinst-P/E P/B-vägen 21,6');
ok(near(mcapPE * 1000 / serRes[3], 22.3, 0.05) && har('22,3'), 'bokförd-vinst-P/E P/E-vägen 22,3');
ok(near((nettoTTM / serRes[3] - 1) * 100, 20.6, 0.1) && har('20,6 procent'), 'TTM netto över bokförd +20,6 %');
const pegConv = pe / (p.tillvaxt.prognosTillvaxt * 100);
ok(near(pegConv, 0.72, 0.005) && har('0,72'), 'PEG-konvention 0,72');
ok(near(peg / pegConv, 5.2, 0.05) && har('5,2'), 'PEG-kvot 5,2');
ok(near(pe / peg, 4.92, 0.005) && har('4,92 procent'), 'PEG implicit tillväxt 4,92 %');
const skuldKvot = p.stabilitet.skuldEgenkapital;
const skuld = ekROE * skuldKvot, evKedja = ekROE + skuld;
ok(near(skuld, 11.1, 0.05) && har('11,1'), 'skuld 11,1 mdr (0,153 × EK)');
ok(near(evKedja, 83.8, 0.05) && har('83,8'), 'EV-balanskedja 83,8 mdr');
const ebitTTM = ebitMarginal * ttmOms;
ok(near(ebitTTM, 9974, 1) && har(sv(9974)), 'EBIT TTM 9 974 Mkr');
const evFalt = evEbit * ebitTTM / 1000;
ok(near(evFalt, 97.3, 0.1) && har('97,3'), 'EV fältvägen 97,3 mdr');
ok(near(evKedja / evFalt, 0.86, 0.005) && har('0,86'), 'EV-kvot kedja/fält 0,86');
ok(near(evFalt - evKedja, 13.5, 0.1) && har('13,5 miljarder'), 'EV-residual +13,5 mdr (kassapost-hypotes)');
ok(near(mcapPE - evFalt, 12.0, 0.1) && har('12,0 miljarder under'), 'fält-EV 12,0 mdr under mcap (nettar kassa)');
ok(har('12–13,5 miljarder'), 'kassaspannet 12–13,5 mdr redovisas');
const fcf2025 = fcfMarginal * serOms[3], fcfTTM = fcfMarginal * ttmOms;
ok(near(fcf2025, -2800, 1) && har(sv(2800)), 'FCF marginalvägen 2025: −2 800 Mkr');
ok(near(fcfTTM, -3002, 1) && har(sv(3002)), 'FCF TTM −3 002 Mkr');
ok(near((nettoMarginal - fcfMarginal) * serOms[3], 8313, 1) && har(sv(8313)), 'kassagap 8 313 Mkr');
ok(near(nettoMarginal - fcfMarginal, 0.0864, 0.0005) && har('8,64 procentenheter'), 'kassagap 8,64 pp');
ok(har('minus 36') && mcapPE * 1000 / fcfTTM < -35, 'P/FCF minus 36 pensionerat som multipel');
// Marginalserie + steg + CAGR
const margSerie = serRes.map((r, i) => r / serOms[i] * 100);
for (const [i, m] of [[0, -8.46], [1, 10.90], [2, 6.31], [3, 5.09]]) ok(near(margSerie[i], m, 0.005) && (m < 0 ? har('minus 8,46') : true) && har(sv(Math.abs(m), 2)), 'nettomarginalserie år ' + i + ': ' + m);
ok(har('minus 8,46, 10,90, 6,31, 5,09 procent'), 'marginalserien som sammanhängande rad');
const stegO = [-7.19, -13.45, -6.96];
for (let i = 1; i < 4; i++) ok(near((serOms[i] / serOms[i - 1] - 1) * 100, stegO[i - 1], 0.005) && har('minus ' + sv(Math.abs(stegO[i - 1]), 2)), 'oms-steg ' + i + ': minus ' + sv(Math.abs(stegO[i - 1]), 2));
ok(near((serRes[2] / serRes[1] - 1) * 100, -49.94, 0.005) && har('minus 49,94'), 'res-steg 2023→2024: minus 49,94');
ok(near((serRes[3] / serRes[2] - 1) * 100, -24.84, 0.005) && har('minus 24,84'), 'res-steg 2024→2025: minus 24,84');
const cagrO = (Math.pow(serOms[3] / serOms[0], 1 / 3) - 1) * 100;
ok(near(cagrO, -9.25, 0.005) && near(cagrO, p.tillvaxt.omsattningCAGR5ar * 100, 0.005), 'oms-CAGR replikerar fältet −9,25 exakt');
// DuPont (trefaktor: marginal × tillgångssnurra × hävstång)
ok(near(ttmOms / (evKedja * 1000), 1.23, 0.005) && har('tillgångssnurra cirka 1,23'), 'tillgångssnurra 1,23 (oms/balansomslutning)');
ok(near(1 + skuldKvot, 1.15, 0.005) && har('hävstång 1,15'), 'hävstång 1,15');
ok(near(nettoMarginal * (ttmOms / (evKedja * 1000)) * (1 + skuldKvot), roe, 0.0005), 'DuPont-trefaktorn stänger till ROE');

// ===== 4. MEDIANER + RANG (oberoende ur 183-postfilen) =====
const gren = list.filter(x => x.bransch === 'material');
const med = (a) => { const v = a.filter(x => x != null && Number.isFinite(x)).sort((m, n) => m - n); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2; };
const rangAsc = (a, m) => a.filter(x => x != null).sort((q, r) => q - r).indexOf(m) + 1;
const rangDesc = (a, m) => a.filter(x => x != null).sort((q, r) => r - q).indexOf(m) + 1;
const nAv = (a) => a.filter(x => x != null).length;
const spec = [
  ['P/E', gren.map(x => x.vardering?.pe), p.vardering.pe, 19.98, 'asc', '8/20'],
  ['P/B', gren.map(x => x.vardering?.pb), p.vardering.pb, 1.58, 'asc', '9/21'],
  ['EV/EBIT', gren.map(x => x.vardering?.evEbit), p.vardering.evEbit, 14.85, 'asc', '6/20'],
  ['PEG', gren.map(x => x.vardering?.peg), p.vardering.peg, 1.01, 'asc', '16/20'],
  ['ROE', gren.map(x => x.lonksamhet?.roe), p.lonksamhet.roe, 0.0943, 'desc', '12/21'],
  ['brutto', gren.map(x => x.lonksamhet?.bruttoMarginal), p.lonksamhet.bruttoMarginal, 0.3492, 'desc', '19/21'],
  ['EBIT', gren.map(x => x.lonksamhet?.ebitMarginal), p.lonksamhet.ebitMarginal, 0.1241, 'desc', '14/21'],
  ['netto', gren.map(x => x.lonksamhet?.nettoMarginal), p.lonksamhet.nettoMarginal, 0.0926, 'desc', '15/21'],
  ['fcfMarg', gren.map(x => x.lonksamhet?.fcfMarginal), p.lonksamhet.fcfMarginal, 0.0809, 'desc', '21/21 (botten)'],
  ['skuld/EK', gren.map(x => x.stabilitet?.skuldEgenkapital), p.stabilitet.skuldEgenkapital, 0.32, 'asc', '2/21 (näst lägst)'],
  ['prognos', gren.map(x => x.tillvaxt?.prognosTillvaxt), p.tillvaxt.prognosTillvaxt, 0.2553, 'desc', '11/21 (medianvärdet)'],
];
for (const [namn, arr, mitt, medianV, dir, rangE] of spec) {
  const m = med(arr), r = dir === 'asc' ? rangAsc(arr, mitt) : rangDesc(arr, mitt);
  ok(near(m, medianV, Math.abs(medianV) * 0.002 + 0.0005), 'median ' + namn + ' = ' + sv(m, 4) + ' (förväntat ' + medianV + ')');
  ok(r + '/' + nAv(arr) === rangE.split(' ')[0] && har(rangE), 'rang ' + namn + ' = ' + r + '/' + nAv(arr) + ' (' + rangE + ')');
}
ok(near(med(gren.map(x => x.tillvaxt?.prognosTillvaxt)), p.tillvaxt.prognosTillvaxt, 1e-9), 'prognostillväxten ÄR materialmedianen exakt (medianbolaget på fältet)');
ok(near(med(gren.map(x => x.lonksamhet?.roic)), 0.0834, 0.0005) && har('8,34 procent (n=20)'), 'ROIC-medianen 8,34 % (n=20) i text och tabell');
ok(list.length === 183, 'universumfilen 183 poster (' + list.length + ')');
ok(gren.length === 21, 'materialgrenen 21 bolag (' + gren.length + ')');
for (const [namn, v] of [['P/E uni', '21,15'], ['P/B uni', '2,79'], ['EV/EBIT uni', '18,13'], ['PEG uni', '1,44'], ['ROE uni', '15,11'], ['brutto uni', '47,75'], ['netto uni', '13,66'], ['FCF-marg uni', '12,55']]) ok(har(v), 'universummedian i tabell: ' + namn + ' ' + v);

// ===== 5. SCENARIORUTAN (9 celler + räknesatser) =====
const bas = 96220, nivaer = [bas * 0.97, bas, bas * 1.03], marger = [ebitMarginal - 0.01, ebitMarginal, ebitMarginal + 0.01];
const expCeller = [];
for (const m of marger) for (const o of nivaer) expCeller.push(Math.round(o * m));
for (const c of expCeller) ok(har(sv(c)), 'scenariocell ' + sv(c) + ' Mkr finns i tabell');
ok(near(bas * 0.01, 962, 0.5) && har(sv(962)), 'räknesats 1 pp marginal = 962 Mkr');
ok(near(bas * 0.03, 2887, 0.5) && har(sv(2887)), 'räknesats 3 % intäkter = 2 887 Mkr');
ok(near(1 / (3 * ebitMarginal), 3.45, 0.005) && har('3,45'), 'marginalvikt 3,45');
ok(har(sv(9304)) && near(bas * ebitMarginal, 9304.5, 1), 'bas-EBIT 9 304 Mkr');
const mult = pe / (1 + p.tillvaxt.prognosTillvaxt);
ok(near(mult, 14.73, 0.005) && har('14,73'), 'multiplövning 14,73');
ok(har(sv(93333)) && har(sv(99107)), 'intäktsnivåer 93 333/99 107 i tabellrubriker');

// ===== 6. JURIDIKGRIND =====
const lagrum = (B.match(/2007:528/g) || []).length;
ok(lagrum === 1, 'exakt ett lagrum 2007:528 (' + lagrum + ')');
const disembow = B.lastIndexOf('*Detta är pedagogisk');
ok(disembow > 0 && B.slice(disembow).includes('2 kap 5 §') && B.slice(disembow).includes('inte investeringsrådgivning'), 'disclaimer sista stycket med lagrum + nekan');
// Rådord med KONTEXTANALYS (lärdomen från ASSA-runden: token räcker inte)
const radMatches = [...B.matchAll(/(?<![åA-Za-z])(köp\w*|sälj\w*)/gi)];
const tillatnaKontext = [/inte en rekommendation att köpa, sälja eller behålla/i, /Inga köp-, sälj- eller hållningsrekommendationer/i, /återköp/i, /noll köp senaste/i, /stålproducent köper järnmalm/];
const brott = radMatches.filter(m => { const ctx = B.slice(Math.max(0, m.index - 60), m.index + 60); return !tillatnaKontext.some(re => re.test(ctx)); });
ok(brott.length === 0, 'rådorden köp/sälj endast i neknings-/neutrala kontexter (' + radMatches.length + ' förekomster, ' + brott.length + ' avvikande)');
ok(!/vi rekommenderar|rekommenderar (dig|att du)/i.test(B), 'inga rekommendationsfraser');
ok(!/\]\(\/?data\/blogg\//.test(B), 'inga markdown-länkar till live-mappen data/blogg/');
const hrefs = [...B.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
ok(hrefs.length > 0 && hrefs.every(h => !h.includes('utkast')), '0 länkar till utkastmappen (' + hrefs.length + ' hrefs)');

// ===== 7. INTERNA LÄNKAR HTTP 200 =====
const unika = [...new Set(hrefs)];
let lankOK = 0, lankFel = 0;
for (const h of unika) {
  const code = execSync(`curl -s -o /dev/null -w '%{http_code}' --max-time 15 'http://localhost:3000${h}'`).toString().trim();
  if (code === '200') lankOK++; else { lankFel++; console.log('LÄNK-FEL ' + code + ': ' + h); }
}
ok(unika.length >= 20, 'minst 20 unika interna länkar (' + unika.length + ')');
ok(lankFel === 0, 'samtliga ' + unika.length + ' unika interna länkar HTTP 200 (' + lankOK + ' gröna, ' + lankFel + ' fel)');

// ===== SAMMANFATTNING =====
console.log('\n===== RESULTAT: ' + pass + ' PASS · ' + fel + ' FEL · ' + varn + ' VARNING · ' + unika.length + ' länkar 200 · ' + ord + ' ord / readingMinutes ' + j.readingMinutes + ' =====');
process.exit(fel > 0 ? 1 : 0);
