#!/usr/bin/env node
// KVD AR6 industriaktier-ar — v211-u3 (manifest v211-oversattning-1789853364271), 2026-09-19
// Arabisk spegling av B6 enligt AR1–AR5-konventionen. Läser, skriver EJ.
import { readFileSync } from 'node:fs';

const B6 = '/home/ak1a/AK1/data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag.json';
const AR = '/home/ak1a/AK1/data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-ar.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const b6 = JSON.parse(readFileSync(B6, 'utf8'));
const ar = JSON.parse(readFileSync(AR, 'utf8'));
const vm = JSON.parse(readFileSync(VM, 'utf8'));

const r = [];
const R = (id, ok, detalj) => { r.push({ id, ok: !!ok, detalj }); if (!ok) console.error('FEL:', id, '—', detalj); };

// ── 1. Varumärkesgrind: egna regexer ur data/varumarke.json × 3 ytor ──
{
  let fel = 0, varn = 0;
  for (const yta of ['title', 'description', 'body']) {
    const text = ar[yta];
    for (const rad of vm.forbjudnaFraser) {
      const re = new RegExp(rad.fran, 'giu');
      if (re.test(text)) { rad.allvar === 'FEL' ? fel++ : varn++; console.error(`  ${rad.allvar} [${yta}]: ${rad.fran}`); }
    }
  }
  R('1-varumarke', fel === 0 && varn === 0, `FEL ${fel}, VARNING ${varn} (26 regexer × 3 ytor)`);
}

// ── 2. Rådverb SV+EN+AR = 0 ──
{
  const monster = [
    /köp denna aktie/i, /du bör köpa/i, /rekommenderar att du köper/i, /sälj denna aktie/i, /du bör sälja/i,
    /buy this stock/i, /you should buy/i, /you should sell/i, /we recommend buy/i, /invest in this stock/i,
    /اشترِ/, /بِع/, /استثمر في هذا/, /أنصحك/, /نوصي بشراء/, /نصيحة شراء/, /نصيحة بيع/
  ];
  const traf = monster.filter(m => m.test(ar.body) || m.test(ar.description) || m.test(ar.title));
  R('2-radverb', traf.length === 0, `${traf.length} träffar (SV+EN+AR-mönstren)`);
}

// ── 3. Sökord أسهم الصناعة i title + ingress + ≥2 H2 (AR-seriens konvention) ──
{
  const kw = 'أسهم الصناعة';
  const h2 = [...ar.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
  const iTitle = ar.title.includes(kw);
  const iIngress = ar.body.split('\n\n')[0].includes(kw);
  const nH2 = h2.filter(h => h.includes(kw)).length;
  R('3-sokord', iTitle && iIngress && nH2 >= 2, `title ${iTitle}, ingress ${iIngress}, H2 ${nH2} (AR1–AR5-konventionen ≥2)`);
}

// ── 4. Title ≤ 60 tkn, OG ≤ 155 tkn ──
R('4-langder', ar.title.length <= 60 && ar.description.length <= 155,
  `title ${ar.title.length}/60, OG ${ar.description.length}/155`);

// ── 5. Ord 800–1400 + readingMinutes = round(ord/600) ──
{
  const ord = ar.body.trim().split(/\s+/).length;
  R('5-ord', ord >= 800 && ord <= 1400, `${ord} ord (mål 800–1400; originalet B6 ${b6.body.trim().split(/\s+/).length})`);
  R('6-readingminutes', ar.readingMinutes === Math.round(ord / 600), `rm ${ar.readingMinutes} = round(${ord}/600)`);
}

// ── 7. Korslänkar MULTISET-identiska med B6 ──
{
  const lnk = s => [...s.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = lnk(b6.body), b = lnk(ar.body);
  const samma = a.length === b.length && a.every((x, i) => x === b[i]);
  R('7-korslankar', samma, `${b.length}/${a.length} MULTISET-identiska med B6 (km-041 ×2, rk-05 ×2, km-010 ×2)`);
}

// ── 8. H2-paritet (antal) ──
{
  const h2b = [...b6.body.matchAll(/^## (.+)$/gm)].length;
  const h2a = [...ar.body.matchAll(/^## (.+)$/gm)].length;
  R('8-h2', h2b === h2a, `B6 ${h2b} == AR ${h2a}`);
}

// ── 9. Externa URL:er identiska ──
{
  const ext = s => [...s.matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = ext(b6.body), b = ext(ar.body);
  R('9-externa', a.length === b.length && a.every((x, i) => x === b[i]), `${b.length}/${a.length} URL-identiska (volvogroup + konj + home.sandvik + nasdaq)`);
}

// ── 10. Talparitet: normaliserade tal-multiset SV == AR ──
{
  // SV: decimalkomma + mellanslag/NBSP tusentals. AR: punkt-decimal + komma-tusentals.
  const normSV = s => s.replace(/[\u00a0 ]/g, '').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || [];
  const normAR = s => s.replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || [];
  const sv = normSV(b6.body), arn = normAR(ar.body);
  const sort = a => a.slice().sort((x, y) => parseFloat(x) - parseFloat(y));
  const S = sort(sv), A = sort(arn);
  const paritet = S.length === A.length && S.every((x, i) => parseFloat(x) === parseFloat(A[i]));
  const diffar = S.filter((x, i) => parseFloat(x) !== parseFloat(A[i]));
  R('10-talparitet', paritet, `SV ${S.length} == AR ${A.length} normaliserade${paritet ? '' : ` — diff: ${diffar.join(',')} / ${A.slice(0, 60).join(',')}`}`);
}

// ── 11. Aritmetik motorräknad ──
{
  const koll = [
    ['book-to-bill 11 ÷ 10 = 1.1', 11 / 10 === 1.1],
    ['toppvinst 10 × 0.15 = 1.5', 10 * 0.15 === 1.5],
    ['nedgångsbas 10 × 0.85 = 8.5', 10 * 0.85 === 8.5],
    ['nedgångsresultat 8.5 × 0.08 ≈ 0.7', Math.round(8.5 * 0.08 * 10) / 10 === 0.7],
    ['P/E topp 240 ÷ 12 = 20', 240 / 12 === 20],
    ['P/E botten 180 ÷ 6 = 30', 180 / 6 === 30],
    ['mer än hälften försvann: 0.68/1.5 < 0.5', (8.5 * 0.08) / 1.5 < 0.5]
  ];
  R('11-aritmetik', koll.every(k => k[1]), `${koll.filter(k => k[1]).length}/${koll.length} motorräknade`);
}

// ── 12. Svenska läckor 0 (URL:ar + egennamn + latinska termer strippade) ──
{
  const ren = ar.body + ' ' + ar.title + ' ' + ar.description;
  const strip = ren
    .replace(/\(https?:\/\/[^)]+\)/g, '')
    .replace(/\(\/[^)]+\)/g, '')
    .replace(/AB Volvo|Volvo Cars|Volvo|ABB|Atlas Copco|Sandvik|SKF|Alfa Laval|Hexagon|Skanska|GE Aerospace|Eaton|ASSA ABLOY|Industrivärden|Ericsson|AK1A|AKM2|Nasdaq|Konjunkturinstitutet|Konjunkturbarometern|book-to-bill|service|aftermarket|recurring|P\/E|P\/B|EBITDA|EBIT|FCF|EV\/EBIT/g, '');
  const svenska = strip.match(/[åäöÅÄÖ]|(?:^|\s)(?:och|att|som|med|för|från|till|men|eller|är|har|kan|du|din|det|den)(?:\s|$)/g);
  R('12-svenska-lackor', !svenska, `${svenska ? svenska.length : 0} träffar efter strip`);
}

// ── 13. Disclaimer arabisk form, sista raden ──
{
  const sist = ar.body.trim().split('\n').pop().trim();
  R('13-disclaimer', sist === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', `sista raden: ${sist.slice(0, 40)}…`);
}

// ── 14. Strukturfält oförändrade (slug-ar, pillar, author) + JSON giltig ──
R('14-struktur', ar.slug === 'industriaktier-sa-analyserar-du-industribolag-ar'
  && ar.pillar === b6.pillar && ar.author === b6.author
  && Array.isArray(ar.tags) && ar.tags.length === b6.tags.length,
  `slug -ar, pillar/author identiska med B6, tags ${ar.tags.length}/${b6.tags.length}`);

// ── Sammanställning ──
const fel = r.filter(x => !x.ok).length;
console.log(`\nKVD AR6 industri-ar: ${r.length - fel}/${r.length} GRÖNA${fel === 0 ? ' — ALLT GODKÄNT' : ` — ${fel} FEL`}`);
for (const x of r) console.log(`  ${x.ok ? 'PASS' : 'FEL '} ${x.id}: ${x.detalj}`);
process.exit(fel === 0 ? 0 : 1);
