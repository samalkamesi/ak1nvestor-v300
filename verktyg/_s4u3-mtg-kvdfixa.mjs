import fs from 'node:fs';
const f = '/home/ak1a/AK1/verktyg/_s4u3-mtg-kvd.mjs';
let s = fs.readFileSync(f, 'utf8');
const byten = [
  // NBSP-immun matchning + nbsp som egen språkgrind (motorn sanerar — 0 förväntas)
  ["const B = p.body, T = p.title, D = p.description;",
   "const B = p.body.replace(/\\u00a0/g, ' '), T = p.title, D = p.description;"],
  ["['dubbla mellanslag', /  /], ['tabb', /\\t/]",
   "['dubbla mellanslag', /  /], ['nbsp', /\\u00a0/], ['tabb', /\\t/]"],
  // pb: kolon i stället för punkt
  ["new RegExp(`ska ge P\\/E\\\\. ${MM}?(\\\\d+,\\\\d+) \\/`)",
   "new RegExp(`ska ge P\\/E: ${MM}?(\\\\d+,\\\\d+) \\/`)"],
  // negativa tal: U+2212-minusklass
  ["['fy25-netto', /GAAP-nettot blev (-?\\d+) miljoner/', 1, Q.fy25.netto",
   "['fy25-netto', new RegExp(`GAAP-nettot blev (${MM}?\\\\d+) miljoner`), 1, Q.fy25.netto"],
  ["['netto2025', /GAAP-nettot blev (-?\\d+) miljoner/, 1, mz.serier.resultat[3] / 1e6",
   "['netto2025', new RegExp(`GAAP-nettot blev (${MM}?\\\\d+) miljoner`), 1, mz.serier.resultat[3] / 1e6"],
  ["['fy25-eps', /EPS (-?\\d+,\\d\\d) kronor \\(2024/",
   "['fy25-eps', new RegExp(`EPS (${MM}?\\\\d+,\\\\d\\\\d) kronor \\\\(2024`)"],
  // pegKvot: stavfel \d+,d+ → \d+,\d+
  ["new RegExp(`Kvot (${MM}?\\\\d+,d+)`)",
   "new RegExp(`Kvot (${MM}?\\\\d+,\\\\d+)`)"],
  // procentenheter ×100
  ["1, mz.lonksamhet.bruttoMarginal - mz.lonksamhet.nettoMarginal, 0.06",
   "1, (mz.lonksamhet.bruttoMarginal - mz.lonksamhet.nettoMarginal) * 100, 0.06"],
  // dubbling ×100
  ["1, Q.fy25.intakt / 6015 - 1, 0.0006",
   "1, (Q.fy25.intakt / 6015 - 1) * 100, 0.06"],
  // viaplayAndel ×100
  ["1, mz.serier.resultat[0] / mz.serier.omsattning[0], 0.001",
   "1, mz.serier.resultat[0] / mz.serier.omsattning[0] * 100, 0.06"],
  // ebitImpl: faktisk form "(10,7 %) × 11 579 = 1 238 miljoner"
  ["  ['ebitImpl', new RegExp(`\\\\((${MM}?\\\\d+ %\\) × (${MM}?\\\\d+ \\\\d\\\\d\\\\d|\\\\d+ \\\\d+) = (${MM}?\\\\d+) miljoner`), 3, ebitImpl, 0.6],",
   "  ['ebitImpl', new RegExp(`\\\\((${MM}?\\\\d+,\\\\d %) × (\\\\d+ \\\\d\\\\d\\\\d) = (\\\\d+ \\\\d\\\\d\\\\d|\\\\d+) miljoner`), 3, ebitImpl, 0.6],"],
  // q126 EBITDA-marginal: mellanslag före punkten
  ["['q126-ebitdaM', /EBITDA-marginal (\\d+) %\\. Guiden/",
   "['q126-ebitdaM', /EBITDA-marginal (\\d+) % \\. Guiden/"],
  // ttm ur medR-listan → specialfall (raden bär rang, inte median)
  ["  ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM, /\\| Intäktstillväxt TTM \\| [^|]+ \\| [^|]+ \\| (\\d+):e högst av (\\d+) \\|/, 'fall'],",
   ""],
];
let n = 0;
for (const [g, ny] of byten) {
  if (!s.includes(g)) { console.log('SAKNAS:', g.slice(0, 70)); continue; }
  s = s.split(g).join(ny); n++;
}
// ttm-specialfall efter medR-loopen
const ankare = "  num(mt[2]) === (rikt === 'fall' ? fall : stig) ? pass++ : fejl('rang/' + namn, `väntade ${rikt === 'fall' ? fall : stig}, fann ${mt[2]}`);\n}";
const ttmSpec = ankare + `
// ttm-radens rang + n (raden bär rang, medianen står i cell 2)
{
  const vals = kom.map(b => b.tillvaxt?.omsattningTillvaxtTTM).filter(x => x != null);
  const fall = [...vals].sort((a, b) => b - a).indexOf(mz.tillvaxt.omsattningTillvaxtTTM) + 1;
  const mt = B.match(/\\| Intäktstillväxt TTM \\| [^|]+ \\| [^|]+ \\| (\\d+):e högst av (\\d+) \\|/);
  if (!mt) fejl('rang/ttm', 'rad hittas inte');
  else {
    num(mt[1]) === fall && num(mt[2]) === vals.length ? pass++ : fejl('rang/ttm', \`väntade \${fall} av \${vals.length}, fann \${mt[1]} av \${mt[2]}\`);
    num(mt[2]) === vals.length ? pass++ : fejl('rang/ttm-n', \`väntade n=\${vals.length}, fann \${mt[2]}\`);
  }
}`;
if (!s.includes(ankare)) { console.log('SAKNAS ankare'); } else { s = s.replace(ankare, ttmSpec); n++; }
fs.writeFileSync(f, s);
console.log(n, 'KVD-byten applicerade');
