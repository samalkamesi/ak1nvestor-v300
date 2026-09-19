#!/usr/bin/env node
// _s1u3-lyxaktier-diffcheck.mjs — uppföljning: råvärden + vintage-EBIT-medianer (omstartsinstans)
// Granskare s1-u3, manifest auto-s1-1789829700743. Läser, skriver ALDRIG källfiler.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROT = '/home/ak1a/AK1';
const las = p => JSON.parse(readFileSync(ROT + p, 'utf8'));
const median = a => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

const uIdag = las('/data/portfolj-system/bolagsunivers.json');
const vintageJson = execFileSync('git', ['-C', ROT, 'show', '795fe396:data/portfolj-system/bolagsunivers.json'], { maxBuffer: 64e6 });
const uVint = JSON.parse(vintageJson.toString());

// 1. Nettoresultatfallet 2025 på RÅVÄRDEN (sondens avrundningsfel-misstanke)
const lvmh = uIdag.find(b => b.ticker === 'MC.PA');
const [r0, r1, r2, r3] = lvmh.serier.resultat;
console.log(`RA resultat rå: 2022=${r0} 2023=${r1} 2024=${r2} 2025=${r3}`);
console.log(`RA fallet rått 2025: ${((r3 / r2 - 1) * 100).toFixed(3)} % (avrundat ${( (r3/r2-1)*100 ).toFixed(1)})`);
console.log(`RA fallet på avrundade 10.9/12.6: ${((10.9 / 12.6 - 1) * 100).toFixed(3)} %`);
console.log(`RA CAGR rå 2022→2025: ${(Math.pow(r3 / r0, 1 / 3) - 1) * 100 > 0 ? '+' : ''}${((Math.pow(r3 / r0, 1 / 3) - 1) * 100).toFixed(2)} %`);

// 2. EBIT-medianer: alla + konsumentgrenen, vintage vs idag
for (const [tag, u] of [['VINTAGE 795fe396 (byggtid 09-17)', uVint], ['IDAG HEAD', uIdag]]) {
  const ebitAlla = u.map(b => b.lonksamhet?.ebitMarginal).filter(v => typeof v === 'number');
  const ebitK = u.filter(b => b.bransch === 'konsument').map(b => b.lonksamhet?.ebitMarginal).filter(v => typeof v === 'number');
  console.log(`${tag}: EBIT-median ALLA ${(median(ebitAlla) * 100).toFixed(2)} % (n=${ebitAlla.length}) · KONSUMENT ${(median(ebitK) * 100).toFixed(2)} % (n=${ebitK.length})`);
}

// 3. Finns Hermès i universumet? (textens Hermès-tal = externa → webbkällor krävs)
const herm = uIdag.filter(b => /herm|Hermès|RMS/i.test(b.namn + ' ' + b.ticker));
console.log(`HERMÈS i universumet: ${herm.length ? herm.map(b => `${b.namn} (${b.ticker})`).join(', ') : 'ABSENT — externa tal kan ej paritetskontrolleras internt'}`);

// 4. LVMH-råbytes: P/E, omsättningsserie rå (för ev. U+00A0-användning i diff)
const oms = lvmh.serier.omsattning;
console.log(`RA omsättning rå: ${oms.join(' / ')}`);
console.log(`RA fallet oms 2025 rått: ${((oms[3] / oms[2] - 1) * 100).toFixed(3)} %`);

// 5. Konsumentgrenens n + median, brutto: vintage (n=16, 48,28) vs idag (n=29, 50,87) — bekräfta
for (const [tag, u] of [['VINTAGE', uVint], ['IDAG', uIdag]]) {
  const k = u.filter(b => b.bransch === 'konsument');
  const br = k.map(b => b.lonksamhet?.bruttoMarginal).filter(v => typeof v === 'number');
  console.log(`${tag}: konsument n=${k.length} (mätbara brutto n=${br.length}), bruttomedian ${(median(br) * 100).toFixed(2)} %`);
}

// 6. -en-spegeln: systerrader för EBIT-etiketten + glidning + nettofall
const en = las('/data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-en.json');
console.log(`EN innehåller "universe's EBIT margin of 22.5": ${/22\.5/.test(en.body)} · "48.3": ${en.body.includes('48.3')} · "16 consumer": ${/16 consumer|sixteen/i.test(en.body)} · "13.3": ${en.body.includes('13.3')} · "rentkänslig" n/a · rälsens eng syster: ${/interest.?rate/i.test(en.body)}`);
console.log(`EN rm=${en.readingMinutes}, publishedAt=${en.publishedAt}, slug=${en.slug}`);
