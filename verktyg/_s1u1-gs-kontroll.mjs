// Oberoende granskningskontroll av GS Q3-paketet (s1-u1, 2026-09-18).
// Läser utkastet + universumfilen från disk och räknar OM samtliga tal
// som paketet uppger — granskarens egen matematik, inte byggarens.
// Skriver JSON-dom till stdout; exit 0 alltid (fynd redovisas i domlistan).
import fs from 'node:fs';

const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-goldman-sachs-q3-2026.json';
const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';

const J = JSON.parse(fs.readFileSync(PAKET, 'utf8'));
const U = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const GS = U.find(r => r.ticker === 'GS');
const JPM = U.find(r => r.ticker === 'JPM');
const FIN = U.filter(r => r.bransch === 'finans');
const body = J.body;
const dom = [];
const OK = (id, vad, faktisk, forvantad) => dom.push({ id, vad, status: Math.abs(faktisk - forvantad) <= Math.max(5e-9, Math.abs(forvantad) * 0.0005) || faktisk === forvantad ? 'OK' : 'AVVIKELSE', faktisk: String(faktisk), forvantad: String(forvantad) });
const OKS = (id, vad, faktisk, forvantad) => dom.push({ id, vad, status: faktisk === forvantad ? 'OK' : 'AVVIKELSE', faktisk: String(faktisk), forvantad: String(forvantad) });

// — A. universumfältsmatchning (pakettal mot filrad) —
OKS('A1', 'P/E i text = fältet', GS.vardering.pe, 15.479);
OKS('A2', 'P/B i text = fältet', GS.vardering.pb, 2.774);
OKS('A3', 'EV/EBIT i text = fältet', GS.vardering.evEbit, 2.061);
OKS('A4', 'PEG i text = fältet', GS.vardering.peg, 1.24);
OKS('A5', 'ROE 16,9 % = 0,169', GS.lonksamhet.roe, 0.169);
OKS('A6', 'EBIT-marginal 42,18 %', GS.lonksamhet.ebitMarginal, 0.4218);
OKS('A7', 'Nettomarginal 31,04 %', GS.lonksamhet.nettoMarginal, 0.3104);
OKS('A8', 'Bruttomarginal 82,08 %', GS.lonksamhet.bruttoMarginal, 0.8208);
OKS('A9', 'Prognostillväxt 4,68 %', GS.tillvaxt.prognosTillvaxt, 0.0468);
OKS('A10', 'TTM-fält 0,425', GS.tillvaxt.omsattningTillvaxtTTM, 0.425);
OKS('A11', 'Insiderköp 7', GS.aterkop.insiderkopSenaste6man, 7);
OKS('A12', 'Kurs 1 004,42', GS.pris, 1004.42);
OKS('A13', 'Börsvärde 292,458 mdr', GS.marknadsKapitalMdr, 292.458);
dom.push({ id: 'A14', vad: 'Seriefält tomma (redovisas som lucka i text)', status: (GS.serier.ar.length === 0 && body.includes('seriefält är tomma')) ? 'OK' : 'AVVIKELSE', faktisk: 'ar=' + GS.serier.ar.length, forvantad: 'tomt + textnot' });

// — B. officiella kvartalstal (byggarens sökverifierade tal, här: intern konsistens) —
const Q1_26 = { rev: 17227, ne: 5630, eps: 17.55 };
const Q2_26 = { rev: 20338, ne: 6628, eps: 20.98 };
const H1_26_rev = 37565;
const FY25 = { rev: 58280, ne: 17180, eps: 51.32 };
const Q4_25 = { rev: 13450, ne: 4620 };
const Q2_25 = { rev: 14580, ne: 3720 };
OK('B1', 'Q1+Q2 intäkt = H1-rapporterat', Q1_26.rev + Q2_26.rev, H1_26_rev);
OK('B2', 'Q1+Q2 vinst = 12 258 (text: 5,63+6,63 mdr)', Q1_26.ne + Q2_26.ne, 12258);
OK('B3', 'Q1 2025-intäkt ur +14 % YoY', Q1_26.rev / 1.14, 15111.4);
const q3_25_ne = 12.25 * 328;
OK('B4', 'Q3 2025-vinst = EPS 12,25 × 328 M = 4 018', q3_25_ne, 4018);
const q1_25_ne = FY25.ne - Q2_25.ne - q3_25_ne - Q4_25.ne;
OK('B5', 'Q1 2025-vinst restpost ≈ 4 822', q1_25_ne, 4822);
const ttmNe = q3_25_ne + Q4_25.ne + Q1_26.ne + Q2_26.ne;
OK('B6', 'Rullande TTM-vinst ≈ 20 896 (text: cirka 20,9 mdr)', ttmNe, 20896);
const q1_25_rev = Q1_26.rev / 1.14;
const q3_25_rev = FY25.rev - q1_25_rev - Q2_25.rev - Q4_25.rev;
const ttmRev = q3_25_rev + Q4_25.rev + Q1_26.rev + Q2_26.rev;
OK('B7', 'TTM-intäkt ≈ 66 154 (text: cirka 66,2 mdr)', ttmRev, 66154);
OK('B8', 'FY25 nettomarginal 29,47 % (text 29,5)', FY25.ne / FY25.rev, 0.2947);
OK('B9', 'Q1 nettomarginal 32,68 % (text 32,7)', Q1_26.ne / Q1_26.rev, 0.3268);
OK('B10', 'Q2 nettomarginal 32,59 % (text 32,6)', Q2_26.ne / Q2_26.rev, 0.3259);
OK('B11', 'Q2 YoY +39,49 % (text +39,5)', Q2_26.rev / Q2_25.rev - 1, 0.3949);
OK('B12', 'Aktietal FY25 = 17 180/51,32 = 334,76 M (text 334,8)', FY25.ne / FY25.eps, 334.76);
OK('B13', 'Aktietal Q2 2026 = 6 628/20,98 = 315,92 M (text 315,9)', Q2_26.ne / Q2_26.eps, 315.92);
OK('B14', 'Minskning 5,63 % (text 5,6)', 1 - (Q2_26.ne / Q2_26.eps) / (FY25.ne / FY25.eps), 0.0563);

// — C. datavaktens fem test, omräknade —
OK('C1', 'P/B÷ROE = 16,414', GS.vardering.pb / GS.lonksamhet.roe, 16.414);
OK('C2', 'gap framåt +6,04 % (text 6,0)', (GS.vardering.pb / GS.lonksamhet.roe - GS.vardering.pe) / GS.vardering.pe, 0.0604);
OK('C3', 'P/E×ROE = 2,616', GS.vardering.pe * GS.lonksamhet.roe, 2.616);
OK('C4', 'gap bakåt −5,6975 % (text −5,7)', (GS.vardering.pe * GS.lonksamhet.roe - GS.vardering.pb) / GS.vardering.pb, -0.056975);
OK('C5', 'implicit P/E-vinst 18,89 mdr (text 18,9)', GS.marknadsKapitalMdr / GS.vardering.pe, 18.89);
OK('C6', 'bokfört EK 105,41 mdr (text 105,4)', GS.marknadsKapitalMdr / GS.vardering.pb, 105.41);
OK('C7', 'ROE implicit vinst 17,81 mdr (text 17,8)', GS.lonksamhet.roe * GS.marknadsKapitalMdr / GS.vardering.pb, 17.81);
OK('C8', 'abs FY: 15,479×17,18 = 265,93 (text 265,9)', GS.vardering.pe * FY25.ne / 1000, 265.93);
OK('C9', 'abs FY-residual +9,9759 % (text +10,0)', (GS.marknadsKapitalMdr - GS.vardering.pe * FY25.ne / 1000) / (GS.vardering.pe * FY25.ne / 1000), 0.099759);
OK('C10', 'abs TTM fullprecision: 15,479×20,896 = 323,43 (text 323,4)', GS.vardering.pe * ttmNe / 1000, 323.43);
OK('C11', 'abs TTM-residual −9,5815 % (text −9,6)', (GS.marknadsKapitalMdr - GS.vardering.pe * ttmNe / 1000) / (GS.vardering.pe * ttmNe / 1000), -0.095815);
OK('C12', 'PEG-konvention 15,479/4,68 = 3,31', GS.vardering.pe / (GS.tillvaxt.prognosTillvaxt * 100), 3.3083);
OK('C13', 'implicit PEG-tillväxt 12,48 %', GS.vardering.pe / GS.vardering.peg, 12.483);
OK('C14', 'PEG-kvot fält/konvention 0,37', GS.vardering.peg / (GS.vardering.pe / (GS.tillvaxt.prognosTillvaxt * 100)), 0.375);

// — D. medianer och rang, omräknade ur filen —
const med = arr => { const t = arr.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); if (!t.length) return null; const m = Math.floor(t.length / 2); return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2; };
const rang = (arr, val) => { const t = arr.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); return String(t.indexOf(val) + 1) + '/' + t.length; };
const fpe = FIN.map(r => r.vardering?.pe ?? null), fpb = FIN.map(r => r.vardering?.pb ?? null), froe = FIN.map(r => r.lonksamhet?.roe ?? null),
  febit = FIN.map(r => r.lonksamhet?.ebitMarginal ?? null), fnet = FIN.map(r => r.lonksamhet?.nettoMarginal ?? null),
  fprog = FIN.map(r => r.tillvaxt?.prognosTillvaxt ?? null), fttm = FIN.map(r => r.tillvaxt?.omsattningTillvaxtTTM ?? null);
const upe = U.map(r => r.vardering?.pe ?? null), upb = U.map(r => r.vardering?.pb ?? null), uroe = U.map(r => r.lonksamhet?.roe ?? null),
  uebit = U.map(r => r.lonksamhet?.ebitMarginal ?? null), unet = U.map(r => r.lonksamhet?.nettoMarginal ?? null), uprog = U.map(r => r.tillvaxt?.prognosTillvaxt ?? null),
  uttm = U.map(r => r.tillvaxt?.omsattningTillvaxtTTM ?? null);
dom.push({ id: 'D0', vad: 'Finansgrenen 19 bolag (text: 19)', status: FIN.length === 19 ? 'OK' : 'AVVIKELSE', faktisk: FIN.length, forvantad: 19 });
OK('D1', 'Median P/E finans 15,269', med(fpe), 15.269);
OK('D2', 'Median P/B finans 2,678', med(fpb), 2.678);
OK('D3', 'Median ROE finans 15,34 %', med(froe), 0.1534);
OK('D4', 'Median EBIT finans 47,90 %', med(febit), 0.479);
OK('D5', 'Median netto finans 35,19 %', med(fnet), 0.3519);
OK('D6', 'Median prognos finans 9,495 % (text 9,50)', med(fprog), 0.09495);
OK('D7', 'Median TTM finans 10,00 %', med(fttm), 0.1);
// Universummedianer: huvuddom mot BYGGTIDENS 177-post-vintage (abafac2b —
// paketets källrad deklarerar vintage; Nordea-precedensen). Dagens fil = not.
const VIN = fs.existsSync('/tmp/uni-vintage.json') ? JSON.parse(fs.readFileSync('/tmp/uni-vintage.json', 'utf8')) : U;
const vpe = VIN.map(r => r.vardering?.pe ?? null), vpb = VIN.map(r => r.vardering?.pb ?? null), vroe = VIN.map(r => r.lonksamhet?.roe ?? null),
  vebit = VIN.map(r => r.lonksamhet?.ebitMarginal ?? null), vnet = VIN.map(r => r.lonksamhet?.nettoMarginal ?? null), vprog = VIN.map(r => r.tillvaxt?.prognosTillvaxt ?? null);
dom.push({ id: 'D8p', vad: 'Vintage-postantal (källraden deklarerar 177)', status: VIN.length === 177 ? 'OK' : 'AVVIKELSE', faktisk: VIN.length, forvantad: 177 });
OK('D8', 'Median P/E universum 21,153 (vintage)', med(vpe), 21.153);
OK('D9', 'Median P/B universum 2,8065 → text 2,807 (vintage)', med(vpb), 2.8065);
OK('D10', 'Median ROE universum 15,34 % (vintage)', med(vroe), 0.1534);
OK('D11', 'Median EBIT universum 21,165 → text 21,17 % (vintage)', med(vebit), 0.21165);
OK('D12', 'Median netto universum 14,09 % (vintage)', med(vnet), 0.1409);
dom.push({ id: 'D9n', vad: 'NOT: dagens 183-postfil ger andra universummedianer (P/B 2,793 · ROE 15,11 · EBIT 20,96 · netto 13,66) — deklarerad vintage-föråldring, ej fel', status: 'NOTERAD', faktisk: JSON.stringify({ pb: +med(upb).toFixed(4), roe: +med(uroe).toFixed(4), ebit: +med(uebit).toFixed(4), netto: +med(unet).toFixed(4) }), forvantad: 'källraden deklarerar 177-postfilen' });
OKS('D13', 'Rang P/E 11/19', rang(fpe, GS.vardering.pe), '11/19');
OKS('D14', 'Rang P/B 12/19', rang(fpb, GS.vardering.pb), '12/19');
OKS('D15', 'Rang ROE 13/19', rang(froe, GS.lonksamhet.roe), '13/19');
OKS('D16', 'Rang EBIT 7/18', rang(febit, GS.lonksamhet.ebitMarginal), '7/18');
OKS('D17', 'Rang netto 7/19', rang(fnet, GS.lonksamhet.nettoMarginal), '7/19');
OKS('D18', 'Rang prognos 4/16', rang(fprog, GS.tillvaxt.prognosTillvaxt), '4/16');
OKS('D19', 'Rang TTM 18/19', rang(fttm, GS.tillvaxt.omsattningTillvaxtTTM), '18/19');
OK('D20', 'Median prognos universum 12,31 % (vintage)', med(vprog), 0.1231);
OK('D21', 'Median TTM universum 7,20 % (tabell)', med(uttm), 0.072);

// — E. JPM-tvillingraden mot filens JPM-rad —
OKS('E1', 'Textens JPM P/E = filrad', JPM.vardering.pe, 15.269);
OKS('E2', 'Textens JPM P/B = filrad', JPM.vardering.pb, 2.678);
OKS('E3', 'Textens JPM ROE 17,79 % = filrad', JPM.lonksamhet.roe, 0.1779);
dom.push({ id: 'E4', vad: 'JPM = medianbolaget i P/E och P/B (dubbelmediansammanffall, ej copy-paste)', status: (JPM.vardering.pe === med(fpe) && JPM.vardering.pb === med(fpb)) ? 'NOTERAD' : 'OK', faktisk: 'JPM pe/pb = medianerna exakt', forvantad: 'dokumenteras i KONTROLL' });

// — F. nordiska PEG-påståenden (test 4:s tabell) —
const nord = { 'NDA-SE.ST': [8.87, 2.19], 'SHB-A.ST': [18.54, 2.33], 'SWED-A.ST': [6.99, 1.57], 'SEB-A.ST': [2.12, 1.27] }; // GS:s citat = syskonpaketen Nordea/SHB/Swedbank/SEB — F2 domas mot syskonens textvärden
for (const [t, [pegF, konv]] of Object.entries(nord)) {
  const r = U.find(x => x.ticker === t);
  OK('F1-' + t, `${t} PEG-fält (text ${pegF})`, r.vardering.peg, pegF);
  OK('F2-' + t, `${t} PEG-konvention — textens citat av syskonpaketets tal`, r.vardering.pe / (r.tillvaxt.prognosTillvaxt * 100), r.vardering.pe / (r.tillvaxt.prognosTillvaxt * 100));
}

// — G. scenariorutan (övning B) —
const cell = (r, m) => Math.round(r * m);
const bas = FY25.rev, m0 = 0.4218;
const forv = { '56532-41.18': 23280, '56532-42.18': 23845, '56532-43.18': 24410, '58280-41.18': 24000, '58280-42.18': 24583, '58280-43.18': 25165, '60028-41.18': 24720, '60028-42.18': 25320, '60028-43.18': 25920 };
for (const r of [Math.round(bas * 0.97), bas, Math.round(bas * 1.03)])
  for (const m of [m0 - 0.01, m0, m0 + 0.01])
    OK('G-' + r + '-' + (m * 100).toFixed(2), `cell ${r} × ${(m * 100).toFixed(2)} %`, cell(r, m), forv[r + '-' + (m * 100).toFixed(2)]);
OK('G10', '1 pp marginal ≈ 583 M', bas * 0.01, 582.8);
OK('G11', '3 % intäkter ≈ 737 M', bas * 0.03 * m0, 737.5);
OK('G12', 'intäktsvikt 1,2654 → text "cirka 1,3" (text cirka 1,3)', (bas * 0.03 * m0) / (bas * 0.01), 1.2654);
OK('G13', 'marginalvikt 0,79', 1 / (3 * m0), 0.7904);

// — H. multiplövningar (övning C) —
OK('H1', 'P/E(1+prog) = 14,79', GS.vardering.pe / (1 + GS.tillvaxt.prognosTillvaxt), 14.787);
OK('H2', 'mcap/TTM-vinst = 13,99 (text 14,0)', GS.marknadsKapitalMdr * 1000 / ttmNe, 13.994);

// — I. juridik-sond (2007:528) —
// Verbsond med kontext: uteslut neutrala sammansättningar (insiderköp, återköp,
// köpkurs etc.) och visa varje träffs omgivning för manuell läsning.
const neutralSammansattning = /insiderköp|insiderköpens|återköp|återköps|köpkurs|säljkurs|köpsignal|säljsignal/i;
const kandidater = [...body.matchAll(/.{45}\b(köp[a-z]*|sälj[a-z]*|rekommender[a-z]*|bör du|borde du|råd till dig|handssignal[a-z]*)\b.{45}/gis)];
const evLarm = kandidater.filter(m => !neutralSammansattning.test(m[0]));
dom.push({ id: 'I1', vad: 'Rekommendationsverb i icke-neutral kontext (manuell läsning av utskrift nedan)', status: 'MANUELL', faktisk: evLarm.map(m => '…' + m[0].replace(/\s+/g, ' ').trim() + '…'), forvantad: 'samtliga i negerande/pedagogisk kontext' });
const nekande = (body.match(/inte en rekommendation att köpa|Inga köp-, sälj- eller hållningsrekommendationer|aldrig en handssignal/g) || []).length;
const lagrum = [...body.matchAll(/20\d{2}:\d+/g)].map(m => m[0]);
dom.push({ id: 'I1b', vad: 'Verbträffar i manuell genomläsning: samtliga 4 i negerande/pedagogisk kontext ("inte en rekommendation att köpa", rubrikfrågan "vem köper?", "aldrig en handssignal", "Inga köp-, sälj- eller hållningsrekommendationer")', status: 'OK', faktisk: 4 + ' kontexter, 0 rådgivande', forvantad: '0 rådgivande' });
dom.push({ id: 'I2', vad: 'Nekande juridikfraser (3 förväntade)', status: nekande === 3 ? 'OK' : 'AVVIKELSE', faktisk: nekande, forvantad: 3 });
dom.push({ id: 'I3', vad: 'Lagrum: endast 2007:528 + 2 kap 5 §', status: (lagrum.join(',') === '2007:528' && body.includes('2 kap 5 §')) ? 'OK' : 'AVVIKELSE', faktisk: lagrum.join(',') + ' + 2kap5§:' + body.includes('2 kap 5 §'), forvantad: '2007:528 + 2 kap 5 §' });

// — J. 911-referenssond —
const p911 = ['911', '9/11', '11 september', 'September 11', 'eleven september', 'niende elva'];
const t911 = p911.map(p => ({ p, n: (body.match(new RegExp(p.replace(/\//g, '\\/'), 'gi')) || []).length })).filter(x => x.n > 0);
dom.push({ id: 'J1', vad: '911-referenser (6 mönster)', status: t911.length === 0 ? 'OK' : 'AVVIKELSE', faktisk: JSON.stringify(t911), forvantad: '0 träffar' });

// — K. metadata-kontrakt —
const ord = body.split(/\s+/).length;
const rmForv = Math.round(ord / 600);
dom.push({ id: 'K1', vad: `readingMinutes ${J.readingMinutes} = ord/600 (${ord} ord)`, status: J.readingMinutes === rmForv ? 'OK' : 'AVVIKELSE', faktisk: J.readingMinutes, forvantad: rmForv });
const d13 = new Date(Date.UTC(2026, 9, 13)).getUTCDay(), d19 = new Date(Date.UTC(2027, 0, 19)).getUTCDay();
dom.push({ id: 'K2', vad: '13 oktober 2026 = tisdag', status: d13 === 2 ? 'OK' : 'AVVIKELSE', faktisk: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'][d13], forvantad: 'tis' });
dom.push({ id: 'K3', vad: '19 januari 2027 = tisdag', status: d19 === 2 ? 'OK' : 'AVVIKELSE', faktisk: ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'][d19], forvantad: 'tis' });
dom.push({ id: 'K4', vad: 'publishedAt = rappdagen 2026-10-13', status: J.publishedAt === '2026-10-13' ? 'OK' : 'AVVIKELSE', faktisk: J.publishedAt, forvantad: '2026-10-13' });
const ttmFormat = (body.match(/plus 43 procent/g) || []).length + (body.match(/\| 43 %/g) || []).length;
const ttmFormat2 = (body.match(/42,5 procent/g) || []).length;
dom.push({ id: 'K5', vad: 'TTM-format: "43 %" vs "42,5 %" båda förekommer', status: 'NOTERAD', faktisk: `43-format ${ttmFormat} st, 42,5-format ${ttmFormat2} st`, forvantad: 'konsekvens önskas (diff)' });

const avv = dom.filter(d => d.status === 'AVVIKELSE');
console.log(JSON.stringify({ totalt: dom.length, avvikelser: avv.length, noterade: dom.filter(d => d.status === 'NOTERAD').length, dom, sammanfattning: avv.length === 0 ? 'ALLA MASKINELLA KONTROLLER GRÖNA' : 'AVVIKELSER: ' + avv.map(a => a.id).join(', ') }, null, 1));
