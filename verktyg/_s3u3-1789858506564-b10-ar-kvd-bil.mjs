#!/usr/bin/env node
// KVD AR10 bilaktier-ar — s3-u3 byggare 3/3 (manifest auto-s3-1789858506564), 2026-09-20
// Arabisk spegling av B10 enligt AR1–AR8-konventionen. Läser, skriver EJ.
import { readFileSync } from 'node:fs';

const B10 = '/home/ak1a/AK1/data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json';
const AR = '/home/ak1a/AK1/data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare-ar.json';
const VM = '/home/ak1a/AK1/data/varumarke.json';

const b10 = JSON.parse(readFileSync(B10, 'utf8'));
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

// ── 3. Sökord أسهم السيارات i title + ingress + ≥2 H2 (AR-seriens konvention) ──
{
  const kw = 'أسهم السيارات';
  const h2 = [...ar.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
  const iTitle = ar.title.includes(kw);
  const iIngress = ar.body.split('\n\n')[0].includes(kw);
  const nH2 = h2.filter(h => h.includes(kw)).length;
  R('3-sokord', iTitle && iIngress && nH2 >= 2, `title ${iTitle}, ingress ${iIngress}, H2 ${nH2} (AR1–AR8-konventionen ≥2)`);
}

// ── 4. Title ≤ 60 tkn, OG ≤ 155 tkn ──
R('4-langder', ar.title.length <= 60 && ar.description.length <= 155,
  `title ${ar.title.length}/60, OG ${ar.description.length}/155`);

// ── 5. Ord 800–1400 + readingMinutes = round(ord/600) ──
{
  const ord = ar.body.trim().split(/\s+/).length;
  R('5-ord', ord >= 800 && ord <= 1400, `${ord} ord (mål 800–1400; originalet B10 ${b10.body.trim().split(/\s+/).length})`);
  R('6-readingminutes', ar.readingMinutes === Math.round(ord / 600), `rm ${ar.readingMinutes} = round(${ord}/600)`);
}

// ── 7. Korslänkar MULTISET-identiska med B10 ──
{
  const lnk = s => [...s.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = lnk(b10.body), b = lnk(ar.body);
  const samma = a.length === b.length && a.every((x, i) => x === b[i]);
  R('7-korslankar', samma, `${b.length}/${a.length} MULTISET-identiska med B10 (km-009, km-010, km-006, rk-02, se-09 + 8 blogg)`);
}

// ── 8. H2-paritet (antal) ──
{
  const h2b = [...b10.body.matchAll(/^## (.+)$/gm)].length;
  const h2a = [...ar.body.matchAll(/^## (.+)$/gm)].length;
  R('8-h2', h2b === h2a, `B10 ${h2b} == AR ${h2a}`);
}

// ── 9. Externa URL:er identiska (B10 utan källista — Ö15/Ö18/Ö20-precedensen, paritet 0=0) ──
{
  const ext = s => [...s.matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1]).sort();
  const a = ext(b10.body), b = ext(ar.body);
  R('9-externa', a.length === b.length && a.every((x, i) => x === b[i]), `${b.length}/${a.length} URL-identiska (B10 nämner OICA/IEA utan länkar)`);
}

// ── 10. Talparitet: normaliserade tal-multiset SV == AR ──
{
  // SV: decimalkomma + mellanslag/NBSP tusentals. AR: punkt-decimal + komma-tusentals.
  const normSV = s => s.replace(/[\u00a0 ]/g, '').replace(/(\d),(\d)/g, '$1.$2').match(/\d+(?:\.\d+)?/g) || [];
  const normAR = s => s.replace(/(\d),(\d{3})/g, '$1$2').match(/\d+(?:\.\d+)?/g) || [];
  const sv = normSV(b10.body), arn = normAR(ar.body);
  const sort = a => a.slice().sort((x, y) => parseFloat(x) - parseFloat(y));
  const S = sort(sv), A = sort(arn);
  const paritet = S.length === A.length && S.every((x, i) => parseFloat(x) === parseFloat(A[i]));
  const diffar = S.filter((x, i) => parseFloat(x) !== parseFloat(A[i]));
  R('10-talparitet', paritet, `SV ${S.length} == AR ${A.length} normaliserade${paritet ? '' : ` — diff SV: ${diffar.join(',')} | AR: ${A.slice(0, 70).join(',')}`}`);
}

// ── 11. Aritmetik motorräknad (B10:s exempel, speglad i AR10) ──
{
  const koll = [
    ['intäkt 300000 × 400000 = 120 mdr', 300000 * 400000 === 1.2e11],
    ['täckning/bil 400000 − 340000 = 60000', 400000 - 340000 === 60000],
    ['TB 300000 × 60000 = 18 mdr', 300000 * 60000 === 1.8e10],
    ['EBIT 18 − 12 = 6', 18 - 12 === 6],
    ['EBIT-marginal 6 ÷ 120 = 5 %', 6 / 120 === 0.05],
    ['stress-volym 255000 × 60000 = 15.3 mdr', 255000 * 60000 === 1.53e10],
    ['stress-resultat 15.3 − 12 = 3.3', Math.round((15.3 - 12) * 10) / 10 === 3.3],
    ['resultatfall (6−3.3)÷6 = 45 %', Math.round((6 - 3.3) / 6 * 100) === 45],
    ['prisfall-täckning 380000 − 340000 = 40000', 380000 - 340000 === 40000],
    ['prisfall-TB 300000 × 40000 = 12 mdr', 300000 * 40000 === 1.2e10],
    ['prisfall-resultat 12 − 12 = 0', 12 - 12 === 0],
    ['Tesla 7.1÷15.0−1 ≈ −53 (avrundat)', Math.round((7.1 / 15.0 - 1) * 100) === -53],
    ['Tesla 3.8÷7.1−1 ≈ −46 (avrundat)', Math.round((3.8 / 7.1 - 1) * 100) === -46],
    ['LVMH 66÷18.9 > 3 (mer än tre gånger)', 66 / 18.9 > 3],
    ['PowerCell 30.6÷15.6 ≈ 2 (det dubbla — originalets egen avrundning, 1.96)', Math.abs(30.6 / 15.6 - 2) < 0.05],
    ['Polestar-bränna 2400÷12 = 200 M/månad', 2400 / 12 === 200]
  ];
  R('11-aritmetik', koll.every(k => k[1]), `${koll.filter(k => k[1]).length}/${koll.length} motorräknade`);
}

// ── 12. Svenska läckor 0 (URL:ar + egennamn + latinska termer strippade) ──
{
  const ren = ar.body + ' ' + ar.title + ' ' + ar.description;
  const strip = ren
    .replace(/\(https?:\/\/[^)]+\)/g, '')
    .replace(/\(\/[^)]+\)/g, '')
    .replace(/Volvo Cars|Volvo Group|Volvo|Tesla|Polestar|PowerCell|LVMH|Scania|AK1A|AKM2|OICA|IEA|Global EV Outlook|Nasdaq|P\/E|P\/B|P\/S|EV\/EBIT|PEG|EBITDA|EBIT|FCF/g, '');
  const svenska = strip.match(/[åäöÅÄÖ]|(?:^|\s)(?:och|att|som|med|för|från|till|men|eller|är|har|kan|du|din|det|den)(?:\s|$)/g);
  R('12-svenska-lackor', !svenska, `${svenska ? svenska.length : 0} träffar efter strip`);
}

// ── 13. Disclaimer arabisk form, sista raden ──
{
  const sist = ar.body.trim().split('\n').pop().trim();
  R('13-disclaimer', sist === '_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._', `sista raden: ${sist.slice(0, 40)}…`);
}

// ── 14. Strukturfält oförändrade (slug-ar, pillar, author) + JSON giltig ──
R('14-struktur', ar.slug === 'bilaktier-sa-analyserar-du-biltillverkare-ar'
  && ar.pillar === b10.pillar && ar.author === b10.author
  && Array.isArray(ar.tags) && ar.tags.length === b10.tags.length,
  `slug -ar, pillar/author identiska med B10, tags ${ar.tags.length}/${b10.tags.length}`);

// ── Sammanställning ──
const fel = r.filter(x => !x.ok).length;
console.log(`\nKVD AR10 bil-ar: ${r.length - fel}/${r.length} GRÖNA${fel === 0 ? ' — ALLT GODKÄNT' : ` — ${fel} FEL`}`);
for (const x of r) console.log(`  ${x.ok ? 'PASS' : 'FEL '} ${x.id}: ${x.detalj}`);
process.exit(fel === 0 ? 0 : 1);
