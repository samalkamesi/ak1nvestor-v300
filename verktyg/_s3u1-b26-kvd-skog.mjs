#!/usr/bin/env node
// KVD s3-u1 B26 skogsaktier — maskinell leveranskontroll (syskonkonventionen)
// Kör: node verktyg/_s3u1-b26-kvd-skog.mjs
import { readFileSync, readdirSync } from 'node:fs';

const UT = 'data/blogg-utkast/skogsaktier-sa-analyserar-du-skogsbolag.json';
const p = JSON.parse(readFileSync(UT, 'utf8'));
const vm = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
const uni = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const kurser = Object.keys(JSON.parse(readFileSync('public/deep-courses.json', 'utf8')));
const blogg = readdirSync('data/blogg').filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));

let fel = 0, kontroller = 0;
const F = m => { console.log('FEL: ' + m); fel++; kontroller++; };
const O = m => { console.log('OK: ' + m); kontroller++; };
const near = (a, b, tol, motiv) => Math.abs(a - b) <= tol ? null : (motiv || `${a} ≠ ${b} (tol ${tol})`);

// 1. Fältform (BlogPost)
const falt = ['slug','title','description','pillar','author','publishedAt','readingMinutes','tags','body'];
const saknas = falt.filter(k => p[k] === undefined || p[k] === '');
saknas.length ? F('fält saknas/tomma: ' + saknas.join(',')) : O('BlogPost-fält 9/9 (' + p.tags.length + ' tags)');

const body = p.body;
const H2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);

// 2. Varumärkesgrind: egna regexer ur data/varumarke.json × 3 ytor
{
  const ytor = { title: p.title, description: p.description, body };
  let vmFel = 0, vmVarning = 0, antal = 0;
  for (const regel of vm.forbjudnaFraser) {
    antal++;
    const re = new RegExp(regel.fran, 'giu');
    for (const [namn, yta] of Object.entries(ytor)) {
      const traf = yta.match(re);
      if (traf) {
        const rad = `varumärkesgrind [${regel.allvar}] ${namn}: "${traf[0]}" (regel: ${regel.fran}) — ${regel.motiv}`;
        if (regel.allvar === 'FEL') { console.log('FEL: ' + rad); fel++; vmFel++; }
        else { console.log('VARNING: ' + rad); vmVarning++; }
      }
    }
    kontroller++;
  }
  console.log(`OK: varumärkesgrind ${antal} regexer × 3 ytor = ${vmFel} FEL, ${vmVarning} VARNING`);
}

// 3. Rådverb SV (juridikgrindens snabbkontroll — imperativ/rekommendation)
{
  const re = /\b(köp|sälj|rekommendera|rekommenderar|bör du|borde du|råder jag|min rekommendation)\b/gi;
  const traf = body.match(re) || [];
  traf.length ? F('rådverb SV: ' + traf.join(', ')) : O('rådverb SV 0 (köp/sälj/rekommendera/bör du/…) i body');
  const trafTd = (p.title + ' ' + p.description).match(re) || [];
  trafTd.length ? F('rådverb SV i title/description: ' + trafTd.join(', ')) : O('rådverb SV 0 i title+description');
}

// 4. Sökord i title + ingress + minst 2 H2
{
  const sok = 'skogsaktier';
  const ingress = body.slice(0, 900);
  p.title.toLowerCase().includes(sok) ? O(`sökord "${sok}" i title (H1-ekvivalent)`) : F('sökord saknas i title');
  ingress.toLowerCase().includes(sok) ? O(`sökord "${sok}" i ingress`) : F('sökord saknas i ingress');
  const h2traff = H2.filter(h => h.toLowerCase().includes(sok)).length;
  h2traff >= 2 ? O(`sökord "${sok}" i ${h2traff} H2 (krav ≥2)`) : F(`sökord "${sok}" i endast ${h2traff} H2 (krav ≥2)`);
}

// 5. Title ≤ 60, OG-description ≤ 155
p.title.length <= 60 ? O(`title ${p.title.length}/60`) : F(`title ${p.title.length} > 60`);
p.description.length <= 155 ? O(`OG-description ${p.description.length}/155`) : F(`OG-description ${p.description.length} > 155`);

// 6. Ordantal (body, whitespace-rått — syskonens raw-mått)
{
  const ord = body.split(/\s+/).filter(Boolean).length;
  (ord >= 1100 && ord <= 1400) ? O(`ord ${ord} (mallband 1100–1400, målvärde ~1200)`) : F(`ord ${ord} utanför band 1100–1400`);
  const rm = Math.round(ord / 600);
  p.readingMinutes === rm ? O(`readingMinutes ${p.readingMinutes} = round(${ord}/600)`) : F(`readingMinutes ${p.readingMinutes} ≠ round(${ord}/600)=${rm}`);
}

// 7. H1 saknas (originalets konvention), H2 = 6, disclaimer exakt sista rad
(/^# [^#]/m.test(body)) ? F('H1 förekommer i body (originalet saknar H1)') : O('H1 0 (originalets konvention)');
H2.length === 6 ? O('H2 = 6') : F('H2 = ' + H2.length + ' (väntat 6)');
{
  const sista = body.trimEnd().split('\n').pop().trim();
  sista === '_Detta är pedagogisk finansanalys, inte investeringsråd._' ? O('disclaimer exakt sista rad') : F('disclaimer-sista-rad fel: "' + sista + '"');
}

// 8. Korslänkar: kurser mot deep-courses, blogg mot publicerade, 0 mot utkast
{
  const lnkar = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
  let brutna = 0;
  for (const l of lnkar) {
    if (l.startsWith('/kurser/')) { kurser.includes(l.slice('/kurser/'.length)) ? null : (brutna++, console.log('FEL: kurslänk ej publicerad: ' + l)); }
    else if (l.startsWith('/blogg/')) { blogg.includes(l.slice('/blogg/'.length)) ? null : (brutna++, console.log('FEL: blogglänk ej publicerad: ' + l)); }
    else { brutna++; console.log('FEL: okänd intern länk: ' + l); }
  }
  kontroller++;
  brutna ? (fel += brutna) : O(`korslänkar ${lnkar.length}/${lnkar.length} verifierade mot publicerade ytor (0 mot utkast)`);
}

// 9. Externa URL:er = exakt de 3 live-/sökindexverifierade (unika värden; slu.se/srh får förekomma 2×)
{
  const ext = [...body.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
  const unika = [...new Set(ext)];
  const vantade = ['https://skogsindustrierna.se', 'https://www.skogsstyrelsen.se', 'https://www.slu.se/srh'];
  const samma = unika.length === vantade.length && vantade.every(v => unika.includes(v));
  samma ? O(`externa URL:er ${unika.length}/${vantade.length} exakt (${ext.length} länkar, 0 overifierade)`) : F('externa URL:er avviker: ' + unika.join(' | '));
}

// 10. Aritmetik motorräknad (utfall, hävstång, andelar, medianer, spann)
{
  const b = uni.filter(x => ['SCA-B.ST','HOLM-B.ST','BILL.ST','STERV.HE','UPM.HE'].includes(x.ticker));
  const V = t => b.find(x => x.ticker === t);
  const oms = (t, i) => V(t).serier.omsattning[i], res = (t, i) => V(t).serier.resultat[i];
  const sum3 = i => oms('SCA-B.ST', i) + oms('HOLM-B.ST', i) + oms('BILL.ST', i);
  const sum3r = i => res('SCA-B.ST', i) + res('HOLM-B.ST', i) + res('BILL.ST', i);
  const R = [];
  // omsättning 87,3 → 82,1 mdr, utfall ~6 %
  R.push(near(sum3(0) / 1e9, 87.3, 0.05, 'oms 2022 ' + (sum3(0)/1e9).toFixed(2) + ' ≠ 87,3'));
  R.push(near(sum3(1) / 1e9, 82.1, 0.05, 'oms 2023 ' + (sum3(1)/1e9).toFixed(2) + ' ≠ 82,1'));
  R.push(near((sum3(0) - sum3(1)) / sum3(0) * 100, 6.0, 0.1, 'oms-utfall ' + ((sum3(0)-sum3(1))/sum3(0)*100).toFixed(2) + ' ≠ 6,0'));
  // resultat 17,3 → 7,8 mdr, utfall ~55 %
  R.push(near(sum3r(0) / 1e9, 17.3, 0.05, 'res 2022 ' + (sum3r(0)/1e9).toFixed(2) + ' ≠ 17,3'));
  R.push(near(sum3r(1) / 1e9, 7.8, 0.05, 'res 2023 ' + (sum3r(1)/1e9).toFixed(2) + ' ≠ 7,8'));
  R.push(near((sum3r(0) - sum3r(1)) / sum3r(0) * 100, 55, 0.6, 'res-utfall ' + ((sum3r(0)-sum3r(1))/sum3r(0)*100).toFixed(2) + ' ≠ 55 (tol 0,6 pp på "cirka 55")'));
  // hävstång ≈ 9× (55/6)
  R.push(near((sum3r(0)-sum3r(1))/sum3r(0) / ((sum3(0)-sum3(1))/sum3(0)), 9, 0.4, 'hävstång ≠ ~9'));
  // SCA −47 % (nästan halverat), Billerud −89 % (nära 90), UPM −75 % (tre fjärdedelar), Holmen −37 % (drygt tredjedel)
  R.push(near((res('SCA-B.ST',0)-res('SCA-B.ST',1))/res('SCA-B.ST',0)*100, 47, 0.6, 'SCA-utfall'));
  R.push(near((res('BILL.ST',0)-res('BILL.ST',1))/res('BILL.ST',0)*100, 90, 0.7, 'Billerud "nära 90"'));
  R.push(near((res('UPM.HE',0)-res('UPM.HE',1))/res('UPM.HE',0)*100, 75, 0.6, 'UPM "tre fjärdedelar"'));
  R.push(near((res('HOLM-B.ST',0)-res('HOLM-B.ST',1))/res('HOLM-B.ST',0)*100, 37, 0.6, 'Holmen "drygt en tredjedel"'));
  // bruttospann 69,4 − 12,2 = 57,2 → "mer än 57 procentenheter"
  R.push(near(69.4 - 12.2, 57.2, 0.01, 'bruttospann'));
  // P/B-median 0,80; fyra av fem < 1,0
  const pb = b.map(x => x.vardering.pb).sort((a, z) => a - z);
  R.push(near(pb[2], 0.80, 0.005, 'P/B-median ' + pb[2]));
  R.push(pb.filter(x => x < 1.0).length === 4 ? null : 'P/B under 1,0 = ' + pb.filter(x => x < 1).length + ' (väntat 4)');
  // ROIC: negativt för Billerud, max 6,8 (UPM); skuld/EK-spann 0,13–0,38
  R.push(near(Math.min(...b.map(x => x.lonksamhet.roic * 100)), -0.72, 0.05, 'ROIC-min (Billerud negativt)'));
  R.push(near(Math.max(...b.map(x => x.lonksamhet.roic * 100)), 6.8, 0.05, 'ROIC-max'));
  // normalåret: (17,3 + 7,8)/2 ≈ 12,5; SV-res 2025 = 6,8 mdr; 1 − 6,8/12,5 ≈ 46 %
  R.push(near((sum3r(0) / 1e9 + sum3r(1) / 1e9) / 2, 12.5, 0.06, 'normalår ≠ 12,5'));
  R.push(near(sum3r(3) / 1e9, 6.8, 0.06, 'SV-res 2025 ≠ 6,8'));
  R.push(near((1 - sum3r(3) / ((sum3r(0) + sum3r(1)) / 2)) * 100, 46, 0.7, 'normalårsavstånd ≠ ~46 %'));
  R.push(near(Math.min(...b.map(x => x.stabilitet.skuldEgenkapital)), 0.13, 0.005, 'skuld/EK-min'));
  R.push(near(Math.max(...b.map(x => x.stabilitet.skuldEgenkapital)), 0.38, 0.005, 'skuld/EK-max'));
  const felaktig = R.filter(x => x !== null);
  felaktig.length ? F('aritmetik ' + felaktig.length + ' avvikelser: ' + felaktig.join(' ; ')) : O(`aritmetik ${R.length}/${R.length} motorräknad mot rådata (utfall, hävstång, andelar, medianer, spann, normalår)`);
}

// 11. Talparitet: varje använt bolagstal finns i rådata
{
  const b = uni.filter(x => ['SCA-B.ST','HOLM-B.ST','BILL.ST','STERV.HE','UPM.HE'].includes(x.ticker));
  const V = t => b.find(x => x.ticker === t);
  const kollar = [
    ['SCA resultat 2022/2023', V('SCA-B.ST').serier.resultat[0] === 6821000000 && V('SCA-B.ST').serier.resultat[1] === 3625000000],
    ['Billerud resultat 2022/2023', V('BILL.ST').serier.resultat[0] === 4590000000 && V('BILL.ST').serier.resultat[1] === 484000000],
    ['UPM resultat 2022/2023', V('UPM.HE').serier.resultat[0] === 1526000000 && V('UPM.HE').serier.resultat[1] === 388000000],
    ['Holmen resultat 2022/2023', V('HOLM-B.ST').serier.resultat[0] === 5874000000 && V('HOLM-B.ST').serier.resultat[1] === 3697000000],
    ['Stora Enso vinst→förlust', V('STERV.HE').serier.resultat[0] === 1536000000 && V('STERV.HE').serier.resultat[1] === -357000000],
    ['bruttotrappan 69,4/46,1/45,6/24,7/12,2', [V('SCA-B.ST'),V('BILL.ST'),V('HOLM-B.ST'),V('STERV.HE'),V('UPM.HE')].every((x,i) => Math.abs(x.lonksamhet.bruttoMarginal*100 - [69.4,46.1,45.6,24.7,12.2][i]) <= 0.051)],
    ['EBIT SCA 3,9 / UPM 9,8', Math.abs(V('SCA-B.ST').lonksamhet.ebitMarginal*100-3.9)<0.05 && Math.abs(V('UPM.HE').lonksamhet.ebitMarginal*100-9.8)<0.05],
    ['P/B 0,72/0,74/0,80/0,91/1,28', [V('BILL.ST'),V('STERV.HE'),V('SCA-B.ST'),V('HOLM-B.ST'),V('UPM.HE')].every((x,i) => Math.abs(x.vardering.pb-[0.72,0.74,0.80,0.91,1.28][i]) < 0.005)],
    ['P/E SCA 36,5 / Stora Enso 14,1', Math.abs(V('SCA-B.ST').vardering.pe-36.5)<0.05 && Math.abs(V('STERV.HE').vardering.pe-14.1)<0.05],
    ['PEG Billerud 4,03', Math.abs(V('BILL.ST').vardering.peg-4.03)<0.01],
    ['ROE SCA 2,2', Math.abs(V('SCA-B.ST').lonksamhet.roe*100-2.2)<0.05],
    ['ROIC Billerud negativt / SCA 0,8 / UPM 6,8', V('BILL.ST').lonksamhet.roic < 0 && Math.abs(V('SCA-B.ST').lonksamhet.roic*100-0.8)<0.05 && Math.abs(V('UPM.HE').lonksamhet.roic*100-6.8)<0.05],
    ['resultat 2025: SCA 3205/Holmen 2879/Billerud 711/StoraEnso 695/UPM 480', V('SCA-B.ST').serier.resultat[3]===3205000000 && V('HOLM-B.ST').serier.resultat[3]===2879000000 && V('BILL.ST').serier.resultat[3]===711000000 && V('STERV.HE').serier.resultat[3]===695000000 && V('UPM.HE').serier.resultat[3]===480000000],
    ['Billerud P/E null (negativt E)', V('BILL.ST').vardering.pe === null],
  ];
  const miss = kollar.filter(([namn, ok]) => !ok).map(([namn]) => namn);
  miss.length ? F('talparitet miss: ' + miss.join(', ')) : O(`talparitet ${kollar.length}/${kollar.length} grupper verifierade mot bolagsunivers.json (rådata 2026-09-03)`);
}

// 12. Textmängdsduplikat: slug oanvänd bland publicerade + bland ÖVRIGA utkast (den egna filen exkluderad)
{
  const dupB = blogg.includes(p.slug);
  const egnaFil = UT.split('/').pop();
  const dupU = readdirSync('data/blogg-utkast').filter(f => f.endsWith('.json') && f !== egnaFil).includes(p.slug + '.json');
  !dupB && !dupU ? O('slug unik (varken publicerad eller i annat utkast)') : F('slug kolliderar');
}

console.log('\n=== KVD: ' + kontroller + ' kontroller, ' + fel + ' FEL ===');
process.exit(fel ? 1 : 0);
