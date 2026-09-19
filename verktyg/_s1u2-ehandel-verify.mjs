#!/usr/bin/env node
// _s1u2-ehandel-verify.mjs — granskningssond för ehandelsaktier-utkastet (s1-u2 om-dispatch, auto-s1-1789829700743)
// Kontrakt: läs utkast-JSON + bolagsunivers VINTAGE (byggcommit d27b727b, utcheckad till /tmp) +
// dagens universum + varumarke.json, kör kontroller, skriv ENDAST stdout.
// Granskaren skriver ej om andras filer — sonden är read-only mot allt utom egen utmatning.
import { readFileSync, existsSync } from 'node:fs';

const ROT = '/home/ak1a/AK1';
const las = (p) => readFileSync(p.startsWith('/') ? p : ROT + '/' + p, 'utf8');
const ut = JSON.parse(las('data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json'));
const en = JSON.parse(las('data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag-en.json'));
const uniV = JSON.parse(las('/tmp/bolagsunivers-vintage-b19.json')); // vintage = byggcommit d27b727b 2026-09-17 03:31
const uniD = JSON.parse(las('data/portfolj-system/bolagsunivers.json')); // dagens träd
const vm = JSON.parse(las('data/varumarke.json'));

const body = ut.body ?? '';
const ytor = { title: ut.title ?? '', description: ut.description ?? '', body };
const allt = ytor.title + '\n' + ytor.description + '\n' + body;

let ok = 0, fel = 0, varn = 0;
const rad = (status, namn, detalj) => {
  if (status === 'OK') ok++; else if (status === 'FEL') fel++; else varn++;
  console.log(`${status} ${namn} — ${detalj}`);
};

// ---------- 1. KÄLLTALSPARITET mot bolagsunivers VINTAGE (d27b727b) ----------
const B = (t) => uniV.find((x) => x.ticker === t); // EXAKT match — 'SE' får inte fånga SEB-A
const SHOP = B('SHOP'), MELI = B('MELI'), ABNB = B('ABNB'), UBER = B('UBER'), SE = B('SE'), AMZN = B('AMZN');
for (const [t, b] of [['SHOP', SHOP], ['MELI', MELI], ['ABNB', ABNB], ['UBER', UBER], ['SE', SE], ['AMZN', AMZN]])
  if (!b) rad('FEL', 'universum', `${t} saknas i vintageuniversumet`);

const K = [
  // [namn, faktavärde, textvärde, relativ tolerans, absolut tolerans]
  ['UBER oms 2025 Mdr', UBER.serier.omsattning[3] / 1e9, 52.0, 0.005, 0.05],
  ['UBER fcf 2025 Mdr', UBER.serier.fcf[3] / 1e9, 9.8, 0.01, 0.05],
  ['UBER resultat 2022 M', UBER.serier.resultat[0] / 1e6, -9141, 0.005, 1],
  ['UBER resultat 2025 M', UBER.serier.resultat[3] / 1e6, 10053, 0.005, 1],
  ['UBER brutto %', UBER.lonksamhet.bruttoMarginal * 100, 40.8, 0.005, 0.05],
  ['UBER P/E', UBER.vardering.pe, 15.6, 0.005, 0.05],
  ['UBER TTM %', UBER.tillvaxt.omsattningTillvaxtTTM * 100, 16.7, 0.005, 0.05],
  ['SHOP brutto %', SHOP.lonksamhet.bruttoMarginal * 100, 47.8, 0.005, 0.05],
  ['SHOP P/E', SHOP.vardering.pe, 94.6, 0.005, 0.05],
  ['SHOP PEG', SHOP.vardering.peg, 2.61, 0.005, 0.01],
  ['SHOP TTM %', SHOP.tillvaxt.omsattningTillvaxtTTM * 100, 33.7, 0.005, 0.05],
  ['SHOP skuld/EK', SHOP.stabilitet.skuldEgenkapital, 0.01, 0.05, 0.005],
  ['SHOP oms 2024 Mdr', SHOP.serier.omsattning[2] / 1e9, 8.9, 0.005, 0.05],
  ['SHOP oms 2025 Mdr', SHOP.serier.omsattning[3] / 1e9, 11.6, 0.005, 0.05],
  ['SHOP resultat 2022 M', SHOP.serier.resultat[0] / 1e6, -3460, 0.005, 1],
  ['SHOP resultat 2024 M', SHOP.serier.resultat[2] / 1e6, 2019, 0.005, 1],
  ['SHOP resultat 2025 M', SHOP.serier.resultat[3] / 1e6, 1231, 0.005, 1],
  ['SHOP fcfYield %', SHOP.vardering.fcfYield * 100, 0.9, 0.05, 0.05],
  ['MELI oms 2022 Mdr', MELI.serier.omsattning[0] / 1e9, 10.8, 0.005, 0.05],
  ['MELI oms 2025 Mdr', MELI.serier.omsattning[3] / 1e9, 28.9, 0.005, 0.05],
  ['MELI skuld/EK', MELI.stabilitet.skuldEgenkapital, 1.69, 0.005, 0.01],
  ['MELI P/E', MELI.vardering.pe, 49.8, 0.005, 0.05],
  ['MELI PEG', MELI.vardering.peg, 3.4, 0.005, 0.05],
  ['MELI TTM %', MELI.tillvaxt.omsattningTillvaxtTTM * 100, 46.0, 0.005, 0.05],
  ['MELI fcfYield %', MELI.vardering.fcfYield * 100, 13.4, 0.005, 0.05],
  ['ABNB brutto %', ABNB.lonksamhet.bruttoMarginal * 100, 82.9, 0.005, 0.05],
  ['ABNB ROE %', ABNB.lonksamhet.roe * 100, 34.5, 0.005, 0.05],
  ['ABNB P/E', ABNB.vardering.pe, 38.1, 0.005, 0.05],
  ['ABNB PEG', ABNB.vardering.peg, 1.42, 0.005, 0.01],
  ['ABNB fcf 2025 M', ABNB.serier.fcf[3] / 1e6, 4646, 0.005, 1],
  ['ABNB resultat 2025 M', ABNB.serier.resultat[3] / 1e6, 2511, 0.005, 1],
  ['ABNB resultat 2023 M', ABNB.serier.resultat[1] / 1e6, 4792, 0.005, 1],
  ['ABNB resultat 2024 M', ABNB.serier.resultat[2] / 1e6, 2648, 0.005, 1],
  ['SE P/E', SE.vardering.pe, 43.6, 0.005, 0.05],
  ['SE PEG', SE.vardering.peg, 1.15, 0.005, 0.01],
  ['SE TTM %', SE.tillvaxt.omsattningTillvaxtTTM * 100, 48.1, 0.005, 0.05],
  ['SE fcfMarginal %', SE.lonksamhet.fcfMarginal * 100, 0.2, 0.1, 0.05],
  ['SE resultat 2022 M', SE.serier.resultat[0] / 1e6, -1651, 0.005, 1],
  ['SE resultat 2025 M', SE.serier.resultat[3] / 1e6, 1578, 0.005, 1],
  ['AMZN mcap Mdr', AMZN.marknadsKapitalMdr, 2680, 0.005, 5],
  ['AMZN fcfMarginal %', AMZN.lonksamhet.fcfMarginal * 100, -1.5, 0.05, 0.05],
  ['AMZN bransch', AMZN.bransch === 'teknik' ? 1 : 0, 1, 0, 0],
];
for (const [namn, fakta, text, tolRel, tolAbs] of K) {
  const avvik = Math.abs(fakta - text);
  const grans = Math.max(tolAbs, tolRel * Math.abs(fakta));
  rad(avvik <= grans ? 'OK' : 'FEL', 'källtal ' + namn, `vintage ${typeof fakta === 'number' ? fakta.toFixed(4) : fakta} mot text ${text} (avvik ${avvik.toFixed(4)})`);
}
// "vinst alla tre följande år" (SHOP 2023–2025) + Uber 2022 "−9,1 mdr" i vallgravsstycket
rad(SHOP.serier.resultat.slice(1).every((v) => v > 0) ? 'OK' : 'FEL', 'SHOP vinst 2023–2025', SHOP.serier.resultat.slice(1).map((v) => Math.round(v / 1e6)).join(', '));
rad(Math.abs(UBER.serier.resultat[0] / 1e9 + 9.1) <= 0.05 ? 'OK' : 'FEL', 'UBER 2022 −9,1 Mdr (vallgravsstycke)', (UBER.serier.resultat[0] / 1e9).toFixed(4));
// ingressens källspann 2026-09-03–16 mot hamtat-fälten
const hamtade = [SHOP, MELI, ABNB, UBER, SE, AMZN].map((b) => b.ticker + '=' + b.hamtat);
const inSpan = hamtade.every((s) => { const d = s.split('=')[1]; return d >= '2026-09-03' && d <= '2026-09-16'; });
rad(inSpan ? 'OK' : 'FEL', 'källspann 2026-09-03–16', hamtade.join(' · '));
// modekedjorna 54–56 % (HM-B + Inditex, bransch=konsument i universumet)
const HM = B('HM-B.ST'), ITX = B('ITX.MC');
if (HM && ITX) {
  const s = [HM.lonksamhet.bruttoMarginal * 100, ITX.lonksamhet.bruttoMarginal * 100];
  rad(s[0] >= 53.5 && s[0] <= 54.5 ? 'OK' : 'VARN', 'modekedja HM brutto %', s[0].toFixed(1) + ' (textens "54")');
  rad(s[1] >= 55.5 && s[1] <= 57.5 ? 'OK' : 'VARN', 'modekedja Inditex brutto %', s[1].toFixed(1) + ' (textens "56" — spannet "kring 54–56")');
}

// ---------- 2. ARITMETIK (egna omräkningar) ----------
const A = [
  ['GMV-exempel 10×0,08 Mdr', 10 * 0.08, 0.8, 0.001],
  ['MELI CAGR (28,9/10,8)^(1/3)-1 %', ((MELI.serier.omsattning[3] / MELI.serier.omsattning[0]) ** (1 / 3) - 1) * 100, 38.9, 0.05],
  ['SHOP intäktstillväxt 11,556/8,880 %', ((SHOP.serier.omsattning[3] / SHOP.serier.omsattning[2]) - 1) * 100, 30, 0.5],
  ['ABNB fcf/resultat 4646/2511', ABNB.serier.fcf[3] / ABNB.serier.resultat[3], 1.85, 0.005],
  ['P/E-spann 94,6/15,6 (mer än sexfalt)', 94.6 / 15.6, 6.06, 0.01],
];
for (const [namn, raknat, text, tol] of A)
  rad(Math.abs(raknat - text) <= tol ? 'OK' : 'FEL', 'aritmetik ' + namn, `egen=${raknat.toFixed(4)} mot text ${text}`);

// ---------- 3. SUPERLATIV & SCOPING ----------
const ttmLista = uniV.filter((x) => typeof x.tillvaxt?.omsattningTillvaxtTTM === 'number')
  .map((x) => ({ t: x.ticker, v: x.tillvaxt.omsattningTillvaxtTTM })).sort((a, b) => b.v - a.v);
const over = ttmLista.filter((x) => x.v > SE.tillvaxt.omsattningTillvaxtTTM);
rad(over.length === 0 ? 'OK' : 'FEL', 'superlativ "universumets högsta tillväxttakt" (SE 48,1 %)', over.length === 0 ? 'EXAKT — högst i universumet' : `FALSK — ${over.length} bolag högre i vintagen: ${over.slice(0, 8).map((x) => x.t + ' ' + (x.v * 100).toFixed(0) + '%').join(', ')}`);
const fem = [UBER, ABNB, SE, MELI, SHOP];
rad(fem.every((b) => UBER.vardering.pe <= b.vardering.pe) ? 'OK' : 'FEL', 'UBER "lägst multipel av de fem"', `P/E ${fem.map((b) => b.ticker + ' ' + b.vardering.pe.toFixed(1)).join(', ')}`);
const ordning = [['Sea', SE.tillvaxt.omsattningTillvaxtTTM, 48.1], ['MELI', MELI.tillvaxt.omsattningTillvaxtTTM, 46.0], ['SHOP', SHOP.tillvaxt.omsattningTillvaxtTTM, 33.7], ['UBER', UBER.tillvaxt.omsattningTillvaxtTTM, 16.7]];
rad(ordning.every(([n, f, t]) => Math.abs(f * 100 - t) < 0.05) && SE.tillvaxt.omsattningTillvaxtTTM > MELI.tillvaxt.omsattningTillvaxtTTM ? 'OK' : 'FEL', 'tillväxtordning Sea>MELI>SHOP>UBER', JSON.stringify(ordning.map(([n, f]) => n + ' ' + (f * 100).toFixed(1) + '%')));
// AMZN-orsaken: universumnoten om FCF
const amznFCFnot = /FCF negativt[^;.]*/i.exec(AMZN.notering ?? '')?.[0] ?? '';
rad(/capex|AI-infra/i.test(amznFCFnot) ? 'OK' : 'VARN', 'AMZN FCF-orsak i universumnoten', amznFCFnot.slice(0, 120) || 'not saknar FCF-orsak');

// ---------- 4. JURIDIK 2007:528 ----------
const radmin = /\b(köp|köps|köper|köpa|sälj|sälja|säljer|sålt|rekommendera\w*|bör du|borde du|råder dig|råd till dig|min rekommendation|tips[a]?)\b/gi;
const radTr = [...allt.matchAll(radmin)].map((m) => m[0]);
rad(radTr.length === 0 ? 'OK' : 'VARN', 'rådglossor med ordgräns', radTr.length === 0 ? '0 träffar' : `${radTr.length}: ${[...new Set(radTr)].join(', ')} (manuell bedömning deskriptiv/imperativ krävs)`);
const lagrum = [...allt.matchAll(/(2007:528|2022:260|2022:261|1985:716|2005:59|2022:482)/g)].map((m) => m[1]);
rad(lagrum.length === 0 ? 'OK' : 'VARN', 'lagrum i text', lagrum.length === 0 ? '0 lagrum → ingen blandningsrisk' : lagrum.join(', '));
for (const [yt, txt] of Object.entries(ytor)) {
  const traff = [];
  for (const f of vm.forbjudnaFraser ?? []) {
    try { if (new RegExp(f.fran, 'giu').test(txt)) traff.push(f.fran); } catch { /* mönsterfel i källan beivras ej här */ }
  }
  rad(traff.length === 0 ? 'OK' : 'FEL', `varumärkesgrind ${yt}`, traff.length === 0 ? `0/${vm.forbjudnaFraser.length} mönster` : `TRÄFF: ${traff.join(' | ')}`);
}
rad(/_Detta är pedagogisk finansanalys, inte investeringsråd\._\s*$/.test(body) ? 'OK' : 'FEL', 'disclaimer exakt sista rad', JSON.stringify(body.slice(-60)));
rad(/går igenom|så fungerar|Den här guiden/i.test(body.slice(0, 900)) ? 'OK' : 'VARN', 'utbildningsram i ingress', 'metod-/guideformulering i första stycket');

// ---------- 5. 911-KONTROLL (6 mönster) ----------
const m911 = ['911', '9/11', '11 september', 'september 11', 'eleven september', 'nine eleven'];
const traff911 = m911.filter((p) => new RegExp(p.replace(/\//g, '\\/'), 'i').test(allt));
rad(traff911.length === 0 ? 'OK' : 'VARN', '911-referenser (6 mönster)', traff911.length === 0 ? '0/6' : traff911.join(', '));

// ---------- 6. INTERNA LÄNKAR ----------
const lankar = [...body.matchAll(/\[([^\]]+)\]\((\/[^)]+)\)/g)].map((m) => m[2]);
const unika = [...new Set(lankar)];
console.log(`INFO länkar — ${lankar.length} totalt, ${unika.length} unika: ${unika.join(' ')}`);
// disk-kontroll: /blogg/-mål måste finnas live (data/blogg/), /kurser/-mål i kursregistret
for (const lank of unika) {
  const m = /^\/blogg\/(.+)$/.exec(lank);
  if (m) rad(existsSync(ROT + '/data/blogg/' + m[1] + '.json') ? 'OK' : 'FEL', 'bloggmål live på disk', lank);
}
if (process.env.LANKKOLL !== 'nej') {
  for (const lank of unika) {
    try {
      const r = await fetch('http://localhost:3000' + lank, { redirect: 'follow' });
      rad(r.status === 200 ? 'OK' : 'FEL', 'länk ' + lank, `HTTP ${r.status}`);
    } catch (e) {
      rad('VARN', 'länk ' + lank, 'fetch-fel: ' + e.message);
    }
  }
}

// ---------- 7. STRUKTUR ----------
const h2 = [...body.matchAll(/^## (.+)$/gm)].length;
console.log(`INFO H2-antal: ${h2} (manuell jämförelse mot seriekonvention)`);
rad(ut.title.length <= 60 ? 'OK' : 'FEL', 'title-längd', `${ut.title.length}/60`);
rad(ut.description.length <= 155 ? 'OK' : 'FEL', 'description-längd', `${ut.description.length}/155`);
const ordRen = body.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`|-]/g, ' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
console.log(`INFO ord (textrensat): ${ordRen}`);
const rmBor = Math.max(1, Math.round(ordRen / 200));
rad(ut.readingMinutes >= rmBor ? 'OK' : 'FEL', 'readingMinutes', `${ut.readingMinutes} mot ord/200-praxis ≥ ${rmBor} (${Math.round(ordRen / ut.readingMinutes)} ord/min vid nuvarande)`);
rad(/^\d{4}-\d{2}-\d{2}$/.test(ut.publishedAt) ? 'OK' : 'FEL', 'publishedAt-format', ut.publishedAt);
rad(ut.publishedAt === '2026-09-17' ? 'OK' : 'VARN', 'publishedAt = byggdatum', ut.publishedAt);
const mjuk = (body.match(/[a-zåäö]-[a-zåäö]/gi) ?? []).length;
rad(mjuk === 0 ? 'OK' : 'VARN', 'mjuka bindestreck i body', `${mjuk}`);
const sokord = 'e-handelsaktier';
const sokYtor = { title: ut.title.toLowerCase().includes(sokord), description: ut.description.toLowerCase().includes(sokord), ingress: body.slice(0, 400).toLowerCase().includes(sokord), forstaH2: (/^## (.+)$/m.exec(body)?.[1] ?? '').toLowerCase().includes(sokord) };
rad(Object.values(sokYtor).every(Boolean) ? 'OK' : 'VARN', 'sökord i title+desc+ingress+första H2', JSON.stringify(sokYtor));

// ---------- 8. UNIVERSUMGLIDNING ----------
const peTillvaxtV = uniV.filter((x) => x.bransch === 'tillvaxt' && typeof x.vardering?.pe === 'number' && x.vardering.pe > 0).map((x) => x.vardering.pe).sort((a, b) => a - b);
const peTillvaxtD = uniD.filter((x) => x.bransch === 'tillvaxt' && typeof x.vardering?.pe === 'number' && x.vardering.pe > 0).map((x) => x.vardering.pe).sort((a, b) => a - b);
const med = (a) => a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
console.log(`INFO glidning — tillväxtbranschens P/E: vintage n=${peTillvaxtV.length} median ${med(peTillvaxtV).toFixed(2)} · idag n=${peTillvaxtD.length} median ${med(peTillvaxtD).toFixed(2)} (texten citaer INGEN branschmedian — endast bolagsvärden)`);
const ttmD = uniD.filter((x) => typeof x.tillvaxt?.omsattningTillvaxtTTM === 'number' && x.tillvaxt.omsattningTillvaxtTTM > 0.481).length;
console.log(`INFO glidning — TTM > 48,1 % idag: ${ttmD} bolag (vintage: ${over.length})`);

// ---------- 9. -EN-SPEGELN: talparitet ----------
const nyckeltal = ['15,6', '38,1', '43,6', '49,8', '94,6', '16,7', '33,7', '46,0', '48,1', '1,15', '1,42', '2,61', '3,4', '13,4', '0,9', '40,8', '47,8', '82,9', '34,5', '1,69', '0,01', '30', '38,9', '1,85', '0,2', '1,5', '9 141', '10 053', '1 651', '1 578', '3 460', '2 019', '1 231', '4 646', '2 511', '4 792', '2 648', '52,0', '9,8', '10,8', '28,9', '8,9', '11,6', '2 680'];
const enBody = (en.body ?? '');
let paritet = 0, paritetSaknas = [];
for (const tal of nyckeltal) {
  const enTal = tal.replace(/,/g, '.').replace(/ /g, (t) => (t === ' ' ? ',' : t)); // sv "9 141" → en "9,141"; "15,6" → "15.6"
  const enFormat = tal.includes(' ') ? tal.replace(/ /g, ',') : tal.replace(/,/g, '.');
  if (enBody.includes(enFormat)) paritet++;
  else paritetSaknas.push(tal + '(en:' + enFormat + ')');
}
rad(paritetSaknas.length === 0 ? 'OK' : 'VARN', '-en talparitet', `${paritet}/${nyckeltal.length} nyckeltal i spegeln${paritetSaknas.length ? ' — saknas: ' + paritetSaknas.join(', ') : ''}`);
const enH2 = [...enBody.matchAll(/^## (.+)$/gm)].length;
console.log(`INFO -en: ${enH2} H2, title ${en.title?.length ?? '?'} tkn, rm ${en.readingMinutes ?? '?'}, publicerad ${en.publishedAt ?? '?'}`);
const enOrd = enBody.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*_>`|-]/g, ' ').split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
console.log(`INFO -en ord: ${enOrd} (ord/200-praxis ${Math.max(1, Math.round(enOrd / 200))})`);

// ---------- 10. DIFF-SÖKSTRÄNGAR (unikhet i utkastet) ----------
const diffSok = ['universumets högsta tillväxttakt', 'lager och logistik binder kapital', 'marknadsplatsen som blev bank', 'minus 9 141 miljoner dollar 2022 till plus 10 053', '"readingMinutes": 2'];
const utkastStr = JSON.stringify(ut);
for (const s of diffSok) {
  const antal = (utkastStr.match(new RegExp(s.replace(/"/g, '\\"').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length;
  rad(antal === 1 ? 'OK' : antal === 0 ? 'VARN' : 'VARN', 'diffsträng unik: ' + s, `${antal} träffar`);
}

console.log(`\nSAMMANFATTNING: ${ok} OK · ${fel} FEL · ${varn} VARN`);
process.exit(0);
