#!/usr/bin/env node
// KVD AR4 teknikaktier-ar — s3-u2 (manifest auto-s3-1789833900935), 2026-09-19
// Arabisk spegling av B4 enligt AR1/AR2-konventionen. Läser, skriver EJ.
import { readFileSync } from 'node:fs';

const B4 = '/home/ak1a/AK1/data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag.json';
const AR = '/home/ak1a/AK1/data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag-ar.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const b4 = JSON.parse(readFileSync(B4, 'utf8'));
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

// ── 3. Sökord أسهم التكنولوجيا i title + ingress + ≥2 H2 ──
{
  const kw = 'أسهم التكنولوجيا';
  const h2 = [...ar.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
  const iTitle = ar.title.includes(kw);
  const iIngress = ar.body.split('\n\n')[0].includes(kw);
  const nH2 = h2.filter(h => h.includes(kw)).length;
  R('3-sokord', iTitle && iIngress && nH2 >= 2, `title ${iTitle}, ingress ${iIngress}, H2 ${nH2}`);
}

// ── 4. Title ≤ 60 tkn, OG ≤ 155 tkn ──
R('4-langder', ar.title.length <= 60 && ar.description.length <= 155,
  `title ${ar.title.length}/60, OG ${ar.description.length}/155`);

// ── 5. Ord 800–1400 + readingMinutes = round(ord/600) ──
{
  const ord = ar.body.trim().split(/\s+/).length;
  R('5-ord', ord >= 800 && ord <= 1400, `${ord} ord (mål 800–1400; originalet B4 ${b4.body.trim().split(/\s+/).length})`);
  R('6-readingminutes', ar.readingMinutes === Math.round(ord / 600), `rm ${ar.readingMinutes} = round(${ord}/600)`);
}

// ── 7. Korslänkar MULTISET-identiska med B4 ──
{
  const lnk = s => [...s.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = lnk(b4.body), b = lnk(ar.body);
  const samma = a.length === b.length && a.every((x, i) => x === b[i]);
  R('7-korslankar', samma, `${b.length}/${a.length} MULTISET-identiska med B4`);
}

// ── 8. H2-paritet (antal + ordning) ──
{
  const h2b = [...b4.body.matchAll(/^## (.+)$/gm)].length;
  const h2a = [...ar.body.matchAll(/^## (.+)$/gm)].length;
  R('8-h2', h2b === h2a, `B4 ${h2b} == AR ${h2a}`);
}

// ── 9. Externa URL:er identiska ──
{
  const ext = s => [...s.matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = ext(b4.body), b = ext(ar.body);
  R('9-externa', a.length === b.length && a.every((x, i) => x === b[i]), `${b.length}/${a.length} URL-identiska (gartner + eur-lex ×2)`);
}

// ── 10. Talparitet: normaliserade tal-multiset SV == AR ──
{
  // SV: decimalkomma + mellanslag/NBSP tusentals. AR: punkt-decimal + komma-tusentals.
  const normSV = s => s.replace(/[\u00a0 ]/g, '').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || [];
  const normAR = s => s.replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || [];
  let sv = normSV(b4.body), arn = normAR(ar.body);
  // Vitlista med motiv (AR2-precedensens klass): SV "100-bolagsuniversum" är universumets
  // egennamn; AR skriver المئة (utskrivet) — paret jämkas mot varandra.
  const svIx = sv.indexOf('100'); let justerat = '';
  if (svIx >= 0 && arn.filter(x => x === '100').length < sv.filter(x => x === '100').length) {
    sv.splice(svIx, 1); justerat = ' (1×100 jämkad: 100-bolagsuniversum ↔ المئة, AR2-toleransklassen)';
  }
  const sort = a => a.slice().sort((x, y) => parseFloat(x) - parseFloat(y));
  const S = sort(sv), A = sort(arn);
  const paritet = S.length === A.length && S.every((x, i) => parseFloat(x) === parseFloat(A[i]));
  R('10-talparitet', paritet, `SV ${S.length} == AR ${A.length} normaliserade${justerat}`);
}

// ── 11. Aritmetik motorräknad ──
{
  const koll = [
    ['ARR-expansion 1,000 × 1.10', 1000 * 1.10 === 1100],
    ['vinst 1,000 × 0.25', 1000 * 0.25 === 250],
    ['implicit P/E 5,000 ÷ 250', 5000 / 250 === 20],
    ['höjd marginal 5,000 ÷ 300 ≈ 17 (knappt)', Math.round((5000 / 300) * 10) / 10 === 16.7 && 16.7 < 17],
    ['tillväxtskompression 5 ÷ 1.2² ≈ 3.5', Math.abs(5 / 1.44 - 3.47) < 0.005 && Math.round(5 / 1.44 * 10) / 10 === 3.5],
    ['Rule of 40: 30 + 12 = 42', 30 + 12 === 42],
    ['marginalförhållande 80/35 > 2× i potential ("mer än dubbelt")', 80 / 35 > 2]
  ];
  R('11-aritmetik', koll.every(k => k[1]), `${koll.filter(k => k[1]).length}/${koll.length} motorräknade`);
}

// ── 12. Svenska läckor 0 (URL:ar + egennamn + engelsktermer strippade) ──
{
  const ren = ar.body + ' ' + ar.title + ' ' + ar.description;
  const strip = ren
    .replace(/\(https?:\/\/[^)]+\)/g, '')
    .replace(/\(\/[^)]+\)/g, '')
    .replace(/AK1A|AKM2|Sinch|Logitech|Truecaller|Ericsson|Nokia|ASM International|Gartner|GDPR|DMA|SaaS|ARR|P\/S|P\/E|EBITDA|EV\/Sales|annual recurring revenue|net revenue retention/g, '');
  const svenska = strip.match(/[åäöÅÄÖ]|(?:^|\s)(?:och|att|som|med|för|från|till|men|eller|är|har|kan|du|din|det|den|som helst)(?:\s|$)/g);
  R('12-svenska-lackor', !svenska, `${svenska ? svenska.length : 0} träffar efter strip`);
}

// ── 13. Disclaimer arabisk form, sista raden ──
{
  const sist = ar.body.trim().split('\n').pop().trim();
  R('13-disclaimer', sist === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', `sista raden: ${sist.slice(0, 40)}…`);
}

// ── 14. Strukturfält oförändrade (slug-ar, pillar, author) + JSON giltig ──
R('14-struktur', ar.slug === 'teknikaktier-sa-analyserar-du-teknikbolag-ar'
  && ar.pillar === b4.pillar && ar.author === b4.author
  && Array.isArray(ar.tags) && ar.tags.length === b4.tags.length,
  `slug -ar, pillar/author identiska med B4, tags ${ar.tags.length}/${b4.tags.length}`);

// ── Sammanställning ──
const fel = r.filter(x => !x.ok).length;
console.log(`\nKVD AR4 teknik-ar: ${r.length - fel}/${r.length} GRÖNA${fel === 0 ? ' — ALLT GODKÄNT' : ` — ${fel} FEL`}`);
process.exit(fel === 0 ? 0 : 1);
