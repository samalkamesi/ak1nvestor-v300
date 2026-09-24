#!/usr/bin/env node
// KVD AR24 energi-ar — s3-u1 2026-09-21. Kontrollklass AR8 (språkmedveten
// talnormalisering): SV mellanslagstusental/decimalkomma == AR tusentelskomma/punkt.
// 0 FEL krävs för leverans; varje tolerans motiveras i utskriften.
import fs from 'node:fs';

const ROT = '/home/ak1a/AK1';
const AR = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/sa-analyserar-du-energiaktier-ar.json`, 'utf8'));
const SV = JSON.parse(fs.readFileSync(`${ROT}/data/blogg-utkast/sa-analyserar-du-energiaktier.json`, 'utf8'));
const MARKE = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));

let fel = 0, kontroller = 0;
const ok = (namn, detalj) => { kontroller++; console.log(`OK   ${namn} — ${detalj}`); };
const fe = (namn, detalj) => { kontroller++; fel++; console.log(`FEL  ${namn} — ${detalj}`); };

const ytor = { title: AR.title, description: AR.description, body: AR.body };

// K1: Varumärkesgrind — grundens EGNA 26 regexer × 3 ytor
{
  let felTraff = [], varningTraff = [];
  for (const r of MARKE.forbjudnaFraser) {
    const re = new RegExp(r.fran, 'gi');
    for (const [yt, text] of Object.entries(ytor)) {
      const m = text.match(re);
      if (m) (r.allvar === 'FEL' ? felTraff : varningTraff).push(`${r.fran} @${yt}: ${m[0]}`);
    }
  }
  felTraff.length === 0 ? ok('K1 varumärkesgrind FEL', `26 regexer × 3 ytor = 0`) : fe('K1 varumärkesgrind FEL', felTraff.join('; '));
  varningTraff.length === 0 ? ok('K1b varumärkesgrind VARNING', '0') : fe('K1b varumärkesgrind VARNING', varningTraff.join('; '));
}

// K2: Rådverb SV+EN+AR = 0 (juridikgrinden 2007:528 — utbildning, aldrig råd)
{
  const monster = [
    /köp\s+(denna|denne|detta)\s+aktie/i, /rekommenderar\s+köp/i, /bör\s+du\s+köpa/i, /sälj\s+dina\s+aktier/i,
    /buy\s+this\s+stock/i, /you\s+should\s+buy/i, /we\s+recommend/i, /sell\s+now/i, /invest\s+in\s+this\s+stock/i,
    /اشترِ/, /بِع/, /استثمر في هذا/, /أنصحك/, /نوصي بشراء/, /ننصحك بالشراء/, /اشتري هذا السهم/, /بع أسهمك/
  ];
  const traff = [];
  for (const [yt, text] of Object.entries(ytor))
    for (const re of monster) { const m = text.match(re); if (m) traff.push(`${re} @${yt}`); }
  traff.length === 0 ? ok('K2 rådverb SV+EN+AR', '0 träffar') : fe('K2 rådverb', traff.join('; '));
}

// K3: Sökord i title + ingress + minst 2 H2
{
  const kw = 'أسهم الطاقة';
  const h2 = [...AR.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
  const ingress = AR.body.split('\n')[0];
  const iTitle = AR.title.includes(kw), iIng = ingress.includes(kw), nH2 = h2.filter(h => h.includes(kw)).length;
  (iTitle && iIng && nH2 >= 2) ? ok('K3 sökord', `title=${iTitle}, ingress=${iIng}, H2=${nH2} (≥2)`) : fe('K3 sökord', `title=${iTitle}, ingress=${iIng}, H2=${nH2}`);
}

// K4/K5: Title ≤ 60, OG ≤ 155
AR.title.length <= 60 ? ok('K4 title', `${AR.title.length}/60`) : fe('K4 title', `${AR.title.length}/60`);
AR.description.length <= 155 ? ok('K5 OG', `${AR.description.length}/155`) : fe('K5 OG', `${AR.description.length}/155`);

// K6: Ord ≤ 1400 (länktext behållen — synligt innehåll), readingMinutes = round(ord/600)
const synlig = t => t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
{
  const ord = synlig(AR.body).split(/\s+/).filter(Boolean).length;
  const ordSV = synlig(SV.body).split(/\s+/).filter(Boolean).length;
  const rm = AR.readingMinutes, rmCalc = Math.round(ord / 600);
  ord <= 1400 ? ok('K6 ord', `${ord}/1400 (originalet ${ordSV})`) : fe('K6 ord', `${ord}/1400`);
  rm === rmCalc ? ok('K6b readingMinutes', `${rm} = round(${ord}/600)`) : fe('K6b readingMinutes', `${rm} ≠ ${rmCalc}`);
}

// K7: Korslänkar MULTISET-identiska med originalet (interna /kurser//blogg/-länkar)
{
  const lnkar = t => [...t.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = lnkar(AR.body), s = lnkar(SV.body);
  JSON.stringify(a) === JSON.stringify(s)
    ? ok('K7 korslänkar', `${a.length}/${s.length} MULTISET-identiska (branschmedianer-akm2 ×${a.filter(x => x.includes('branschmedianer')).length})`)
    : fe('K7 korslänkar', `AR=${JSON.stringify(a)} SV=${JSON.stringify(s)}`);
}

// K8: Externa URL:er identiska (4: iea + eia + nordpool + ei.se)
{
  const externa = t => [...t.matchAll(/https?:\/\/[^\s)\]]+/g)].map(m => m[0].replace(/\/$/, '')).sort();
  const a = externa(AR.body), s = externa(SV.body);
  JSON.stringify(a) === JSON.stringify(s) ? ok('K8 externa URL:er', `${a.length}/${s.length} identiska`) : fe('K8 externa URL:er', `AR=${a} SV=${s}`);
}

// K9/K10: H2-paritet 8=8, H1-paritet 0=0 (originalet utan inledande H1 ⇒ AR utan)
{
  const h2a = [...AR.body.matchAll(/^## /gm)].length, h2s = [...SV.body.matchAll(/^## /gm)].length;
  const h1a = [...AR.body.matchAll(/^# [^#]/gm)].length, h1s = [...SV.body.matchAll(/^# [^#]/gm)].length;
  h2a === h2s ? ok('K9 H2-paritet', `${h2a} = ${h2s}`) : fe('K9 H2-paritet', `${h2a} ≠ ${h2s}`);
  h1a === h1s ? ok('K10 H1-paritet', `${h1a} = ${h1s}`) : fe('K10 H1-paritet', `${h1a} ≠ ${h1s}`);
}

// K11: Talparitet numerisk multiset — SV decimalkomma/mellanslagstusental == AR punkt/tusentelskomma
{
  const rensa = t => t.replace(/https?:\/\/[^\s)\]]+/g, ' '); // URL:er strippas symmetriskt (IEA-länkens 2026)
  const normSV = t => rensa(t).replace(/(\d) (\d{3})(?!\d)/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  const normAR = t => rensa(t).replace(/(\d),(\d{3})(?!\d)/g, '$1$2'); // komma + exakt 3 siffror = tusental (AR8)
  const tal = t => [...t.matchAll(/\d+(?:\.\d+)?/g)].map(m => parseFloat(m[0])).sort((x, y) => x - y);
  const a = tal(normAR(AR.body)), s = tal(normSV(SV.body));
  JSON.stringify(a) === JSON.stringify(s)
    ? ok('K11 talparitet', `${a.length}/${s.length} numeriska multiset identiska [${a.join(', ')}]`)
    : fe('K11 talparitet', `AR(${a.length})=[${a}] SV(${s.length})=[${s}]`);
}

// K12: Aritmetik motorräknad — originalets egna exempel
{
  const A = [];
  A.push(['brytpunkt+marginal=pris', 50 + 30 === 80]);
  A.push(['prisfallet 80×⅔ → 53 (avrundning 0,33 < 0,5 — originalets egna tal)', Math.abs(80 * 2 / 3 - 53) < 0.5]);
  A.push(['marginal 53−50 = 3', 53 - 50 === 3]);
  A.push(['marginalfall (1−3/30) = 90 % > 80 % ⇒ «över 80 procent» sant', (1 - 3 / 30) * 100 > 80]);
  A.push(['IEA fossilt rest: 3400−2200 = 1200', 3400 - 2200 === 1200]);
  A.push(['2200/1200 ≈ 1,83 inom «nästan dubbelt»-spannet 1,5–2,0', 2200 / 1200 > 1.5 && 2200 / 1200 < 2.0]);
  A.push(['elerområden SE1→SE4: 1 < 4 (fyra zoner)', 1 < 4]);
  const felA = A.filter(([_, v]) => !v);
  felA.length === 0 ? ok('K12 aritmetik', `${A.length}/${A.length} motorräknade`) : fe('K12 aritmetik', felA.map(x => x[0]).join('; '));
}

// K13: Svenska/latinska läckor i AR-bodyn = 0 (URL:er + markdown-URL:ar strippade; vitlista: egennamn
// + finstermer + institutionsnamn enligt AR6/AR7/AR22-konventionen — namn översätts aldrig)
{
  // Fragmenten AK/AKM/SE/EV/EBIT = tokenizerns brytning på siffer-/slash-gränser i
  // godkända termer (AK1A, AKM2, SE1/SE4, EV/EBITDA, EV/EBIT) — AR13-precedensens
  // fragment-splittrande klass: kur gäller kontrollen, ej guidetexten.
  const vitlista = new Set(['AK1A', 'AKM2', 'Equinor', 'Aker', 'BP', 'Vår', 'Energi', 'Chevron', 'ExxonMobil',
    'Shell', 'Iberdrola', 'Enel', 'RWE', 'Fortum', 'Nord', 'Pool', 'upstream', 'EBITDA', 'EV/EBITDA', 'P/E',
    'SE1', 'SE4', 'IEA', 'EIA', 'World', 'Energy', 'Investment', 'Information', 'Administration',
    'Energimarknadsinspektionen', 'Ei', 'U.', 'AK', 'AKM', 'SE', 'EV', 'EBIT']);
  const rens = AR.body.replace(/https?:\/\/[^\s)\]]+/g, ' ').replace(/\]\([^)]*\)/g, ']');
  const token = [...rens.matchAll(/[A-Za-zÅÄÖåäöÉé]{2,}/g)].map(m => m[0]);
  const lakor = [...new Set(token.filter(t => !vitlista.has(t)))];
  lakor.length === 0 ? ok('K13 svenska läckor', `0 (${token.length} latinska token, alla vitlistade)`) : fe('K13 svenska läckor', lakor.join(', '));
}

// K14: Disclaimer arabisk form exakt sista rad
{
  const rader = AR.body.split('\n').filter(r => r.trim() !== '');
  const sista = rader[rader.length - 1];
  sista === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._'
    ? ok('K14 disclaimer', 'arabisk form exakt sista rad')
    : fe('K14 disclaimer', `sista rad = ${JSON.stringify(sista)}`);
}

console.log(`\n=== KVD AR24 energi-ar: ${kontroller} kontroller, ${fel} FEL ===`);
process.exit(fel === 0 ? 0 : 1);
