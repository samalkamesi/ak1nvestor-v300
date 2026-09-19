// Sond: s1-u2 (auto-s1-1789781115807) — KONTROLLGRANSKAR bilaktier-sa-analyserar-du-biltillverkare.json
// Oberoende verifiering: universumfält mot bolagsunivers.json, aritmetik, struktur,
// juridik 2007:528 (rådglossor + varumärkesgrind-replik av kontrolleraText), 911, länkar.
import { readFileSync } from 'node:fs';

const UTKAST = JSON.parse(readFileSync('data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json', 'utf8'));
const UNI = JSON.parse(readFileSync('data/portfolj-system/bolagsunivers.json', 'utf8'));
const VM = JSON.parse(readFileSync('data/varumarke.json', 'utf8'));
const rader = UNI.bolag || UNI.rader || UNI;
const arr = Array.isArray(rader) ? rader : Object.values(rader);
const B = (t) => arr.find(b => b.ticker === t);

const vol = B('VOLCAR-B.ST'), tsla = B('TSLA'), psny = B('PSNY'), pcell = B('PCELL.ST'), lvmh = B('MC.PA');
const body = UTKAST.body;
const hela = JSON.stringify(UTKAST);
let ok = 0, fel = 0;
const T = (namn, villkor, extra = '') => {
  const res = !!villkor;
  if (res) ok++; else fel++;
  console.log(`${res ? 'OK  ' : 'FEL '} ${namn}${extra ? ' — ' + extra : ''}`);
};
const pct = (x) => Math.round(x * 1000) / 10;

// ── 1. Universumfält (trädet 189 bolag, rådata 2026-09-03; byggtidens vintage samma tal) ──
T('Volvo P/E 5,957 → "P/E 6,0"', body.includes('P/E 6,0') && Math.round(vol.vardering.pe * 10) / 10 === 6.0, `universum ${vol.vardering.pe}`);
T('Volvo P/B 0,369 → "0,37"', body.includes('0,37') && Math.round(vol.vardering.pb * 100) / 100 === 0.37, `universum ${vol.vardering.pb}`);
T('Volvo EV/EBIT 21,219 → "över 21"', body.includes('över 21') && vol.vardering.evEbit > 21 && vol.vardering.evEbit < 22, `universum ${vol.vardering.evEbit}`);
T('Volvo EBIT-marginal 0,84 % → "0,8 procent"', body.includes('0,8 procent') && pct(vol.lonksamhet.ebitMarginal) === 0.8, `universum ${vol.lonksamhet.ebitMarginal}`);
T('Volvo brutto 15,62 % → "15,6 procent"', body.includes('15,6 procent') && pct(vol.lonksamhet.bruttoMarginal) === 15.6, `universum ${vol.lonksamhet.bruttoMarginal}`);
T('Volvo resultat 15 401 M 2024 → "15,4 miljarder kronor 2024"', body.includes('15,4 miljarder kronor 2024') && vol.serier.resultat[2] === 15401000000, `universum ${vol.serier.resultat[2]}`);
T('Volvo resultat 174 M 2025 → "i princip noll"', body.includes('i princip noll') && vol.serier.resultat[3] === 174000000, `universum ${vol.serier.resultat[3]}`);
T('Tesla P/E 333,654 → "334"', body.includes('P/E 334') && Math.round(tsla.vardering.pe) === 334, `universum ${tsla.vardering.pe}`);
T('Tesla PEG 4,26 → "4,3"', body.includes('PEG på 4,3') && Math.round(tsla.vardering.peg * 10) / 10 === 4.3, `universum ${tsla.vardering.peg}`);
T('Tesla brutto 18,85 % → "18,9 procent"', body.includes('18,9 procent') && pct(tsla.lonksamhet.bruttoMarginal) === 18.9, `universum ${tsla.lonksamhet.bruttoMarginal}`);
T('Tesla vinstserie 15,0 → 7,1 → 3,8 mdr USD', body.includes('från 15,0 miljarder dollar 2023 till 7,1 och vidare till 3,8') && tsla.serier.resultat[1] === 14997000000 && tsla.serier.resultat[2] === 7091000000 && tsla.serier.resultat[3] === 3794000000, `universum ${JSON.stringify(tsla.serier.resultat)}`);
T('Tesla −53 %', body.includes('−53') && Math.round((7091 / 14997 - 1) * 1000) / 10 === -52.7, `egen ${(7091 / 14997 - 1) * 100 .toFixed(1)} %`);
T('Tesla −46 %', body.includes('−46') && Math.round((3794 / 7091 - 1) * 1000) / 10 === -46.5, `egen ${(3794 / 7091 - 1) * 100 .toFixed(1)} %`);
T('Polestar P/E null → "P/E saknar nämnare" + "obefintlig"', body.includes('P/E saknar nämnare') && psny.vardering.pe === null, `universum ${psny.vardering.pe}`);
T('Polestar förlust 2 357 MUSD 2025 → "2,4 miljarder dollar"', body.includes('2,4 miljarder dollar') && psny.serier.resultat[3] === -2357000000, `universum ${psny.serier.resultat[3]}`);
T('Polestar ~200 MUSD/mån', body.includes('200 miljoner i månaden') && Math.abs(2357 / 12 - 196.4) < 0.1, `egen ${(2357 / 12).toFixed(1)}`);
T('Polestar kassaräckvidd 15,2 → "cirka 15 månader" (2 st)', (body.match(/cirka 15 månader/g) || []).length === 2 && psny.stabilitet.kassaManaderBurnRate === 15.2, `universum ${psny.stabilitet.kassaManaderBurnRate}, träffar ${(body.match(/cirka 15 månader/g) || []).length}`);
T('PowerCell brutto 30,55 % → "30,6 procent"', body.includes('30,6 procent') && pct(pcell.lonksamhet.bruttoMarginal) === 30.6, `universum ${pcell.lonksamhet.bruttoMarginal}`);
T('PowerCell intäkter 245 → 385 Mkr på fyra år', body.includes('245 till 385 miljoner kronor på fyra år') && pcell.serier.omsattning[0] === 244691000 && pcell.serier.omsattning[3] === 384958000 && pcell.serier.ar.length === 4, `universum ${JSON.stringify(pcell.serier.omsattning)}`);
T('PowerCell positivt kassaflöde (fcfMarginal +11,1 %)', body.includes('positivt kassaflöde') && pcell.lonksamhet.fcfMarginal > 0, `universum ${pcell.lonksamhet.fcfMarginal}`);
T('PowerCell förlust senaste året kraftigt minskad', pcell.serier.resultat[3] === -29530000 && pcell.serier.resultat[2] === -87903000, `−88,0 → −29,5 Mkr`);
T('LVMH 66,36 % → "66 procent" (talet)', body.includes('66 procent') && pct(lvmh.lonksamhet.bruttoMarginal) === 66.4, `universum ${lvmh.lonksamhet.bruttoMarginal}`);
const overLvmh = arr.filter(b => (b.lonksamhet?.bruttoMarginal ?? -1) > lvmh.lonksamhet.bruttoMarginal).length;
T('B1-FYND: "universumets HÖGSTA bruttomarginal, LVMH" — MOTBEVISAD', overLvmh > 0, `${overLvmh} bolag över LVMH (bl.a. Industrivärden/Öresund/Evolution/Mastercard 100,0, Kambi 98,9, Visa 97,7, ARM 97,5, Genmab 93,0)`);
T('LVMH "mer än tre gånger högre" än tillverkarnas', 66.36 / 15.62 > 3 && 66.36 / 18.85 > 3, `4,25× Volvo, 3,52× Tesla`);
T('"universumets två vinstgivande biltillverkare"', vol.serier.resultat[3] > 0 && tsla.serier.resultat[3] > 0 && psny.serier.resultat[3] < 0, 'Volvo +174 Mkr, Tesla +3 794 MUSD, Polestar −2 357 MUSD');

// ── 2. Aritmetik (fabriksexempel + egna omräkningar) ─────────────────────
T('300 000 × 400 000 = 120 mdr', body.includes('120 miljarder') && 300000 * 400000 === 1.2e11);
T('300 000 × 60 000 = 18 mdr', body.includes('18 miljarder') && 300000 * 60000 === 1.8e10);
T('EBIT 18 − 12 = 6 mdr → marginal 5 %', body.includes('6 miljarder') && body.includes('5 procent') && 18 - 12 === 6 && Math.round((6 / 120) * 1000) / 10 === 5.0);
T('volymfall: 255 000 × 60 000 = 15,3 mdr', body.includes('15,3 miljarder') && 255000 * 60000 === 1.53e10);
T('resultat 3,3 mdr = −45 % på volym −15 % (3× hävstång)', body.includes('3,3 miljarder') && body.includes('45 procent') && Math.abs((3.3 - 6) / 6 + 0.45) < 0.001 && 45 / 15 === 3);
T('prisfall: 380 000 kr → täckning 40k → 12 mdr → resultat 0', body.includes('380 000') && body.includes('12 miljarder') && 300000 * (380000 - 340000) === 1.2e10 && 12 - 12 === 0);
T('OICA 96,4/92,7: källans +3,9 % citeras (intern omräkning +4,0)', body.includes('3,9 procent') && Math.round((96.4 / 92.7 - 1) * 1000) / 10 === 4.0, `egen ${(96.4 / 92.7 - 1) * 100 .toFixed(2)} % — källans egna procentsatta är gällande`);

// ── 3. Struktur ─────────────────────────────────────────────────────────
const ord = body.replace(/https?:\/\/\S+/g, ' ').replace(/\[[^\]]*\]\([^)]*\)/g, m => m.replace(/[\[\]()]/g, ' ')).replace(/[[\]()#*_>/|]/g, ' ').split(/\s+/).filter(w => /[a-zA-ZåäöÅÄÖ0-9]/.test(w)).length;
T('ord i spannet 800–1 400', ord >= 800 && ord <= 1400, `${ord} ord textrensat`);
T('B2-FYND: readingMinutes enligt bloggfamiljens round(ord/200)', UTKAST.readingMinutes === Math.round(ord / 200), `round(${ord}/200) = ${Math.round(ord / 200)}; utkastet ${UTKAST.readingMinutes} (round(ord/600) = ${Math.round(ord / 600)})`);
const h2 = (body.match(/^## /gm) || []).length;
T('H2-rubriker >= 2', h2 >= 2, `${h2} st`);
const sista = body.trim().split('\n').pop().trim();
T('disclaimer = sista raden (serieform)', sista === '_Detta är pedagogisk finansanalys, inte investeringsråd._', sista.slice(0, 60));
T('title <= 60 tkn', UTKAST.title.length <= 60, `${UTKAST.title.length} tkn`);
T('description 120-155 tkn', UTKAST.description.length >= 120 && UTKAST.description.length <= 155, `${UTKAST.description.length} tkn`);
T('A1-FYND: felstavning "multipelar" i description', !UTKAST.description.includes('multipelar'), 'träff på "multipelar" — ska vara "multipler"');
T('sökord "bilaktier" i title + ingress + H2', UTKAST.title.toLowerCase().startsWith('bilaktier') && body.startsWith('Bilaktier är') && /## Vad är bilaktier/.test(body));
T('5 tags', Array.isArray(UTKAST.tags) && UTKAST.tags.length === 5, `${UTKAST.tags?.length} st`);

// ── 4. Juridik 2007:528 ─────────────────────────────────────────────────
const radGlossor = [...hela.matchAll(/\b(köp(?:a)?|sälj(?:a)?|rekommender(?:ar|ade)|bör du|undvik|aktietips|garanterad\s*avkastning)\b/gi)].map(m => m[1].toLowerCase());
console.log(`NOT  rådglossor för manuell kontextbedömning: ${[...new Set(radGlossor)].join(', ') || '0'}`);
const lagrum = ['2007:528', '2022:260', '2022:261', '1985:716', '2005:59'].filter(l => hela.includes(l));
T('ingen lagrumsblandning (inget lagrum åberopas)', lagrum.length === 0, `nämnda: ${lagrum.join(', ') || 'inga'}`);
T('utbildningsram i ingress', body.includes('utbildning i metod, aldrig råd om enskilda aktier'));
// Varumärkesgrind: exakt replik av kontrolleraText (src/lib/varumarke.ts) — 26 regexer, "giu", ej PRO-yta
const traffar = [];
for (const { fran, istallet, allvar } of VM.forbjudnaFraser) {
  const re = new RegExp(fran, 'giu');
  re.lastIndex = 0;
  let m;
  const yta = UTKAST.title + '\n' + UTKAST.description + '\n' + body;
  while ((m = re.exec(yta)) !== null) traffar.push({ fras: m[0], allvar, istallet });
}
const vmFel = traffar.filter(t => t.allvar === 'FEL');
const vmVar = traffar.filter(t => t.allvar !== 'FEL');
T('varumärkesgrind 26 regexer: 0 FEL', vmFel.length === 0, `träffar totalt ${traffar.length}: ${traffar.map(t => `${t.fras}(${t.allvar})`).join(', ') || '0'}`);
console.log(`NOT  varumärkesgrind VARNING: ${vmVar.map(t => `"${t.fras}"`).join(', ') || '0'} — manuell bedömning i rapport`);

// ── 5. 911-referenser (6 mönster) ───────────────────────────────────────
const m911 = ['911', '11 september', 'september 2001', '9/11', 'terror', 'terrordåd'].filter(p => hela.toLowerCase().includes(p.toLowerCase()));
T('911-kontroll 0 träffar', m911.length === 0, `träffar: ${m911.join(', ') || '0'}`);

// ── 6. Superlativ-sond (manuell bedömning) ──────────────────────────────
const superlativ = [...body.matchAll(/\b(högst|högsta|lägst|lägsta|störst|största|viktigaste|mest lönsam)\b/gi)].map(m => m[1].toLowerCase());
console.log(`NOT  superlativ för manuell bedömning: ${[...new Set(superlativ)].join(', ') || '0'}`);

// ── 7. Interna länkar mot levande sajten ────────────────────────────────
const linkar = [...new Set([...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log(`\nLÄNKAR (${linkar.length} unika):`);
let lFel = 0;
for (const l of linkar) {
  try {
    const r = await fetch('http://localhost:3000' + l, { redirect: 'manual' });
    const bra = r.status === 200;
    if (bra) ok++; else { lFel++; fel++; }
    console.log(`${bra ? 'OK  ' : 'FEL '} ${r.status} ${l}`);
  } catch (e) { lFel++; fel++; console.log(`FEL  ERR ${l} — ${e.message}`); }
}
T('kursankaret se-09-bil levande (guiden länkar hem)', linkar.includes('/kurser/se-09-bil'));
T('0 länkar till ogranskade utkast (data/blogg-utkast)', linkar.every(l => !l.includes('utkast')));

// ── 8. Diff-strängunikhet (för rättningsposterna) ───────────────────────
const sokstrangar = [
  'multipelar',
  'universumets högsta bruttomarginal, LVMH:s 66 procent',
  '(det dubbla mot biltillverkarnas)',
  'med förlusten minskande',
  'Marginalhävstången är kärnriskerna',
  'över 20 procent tillväxt på ett år',
];
console.log('\nDIFF-STRÄNGUNIKHET:');
for (const s of sokstrangar) {
  const n = hela.split(s).length - 1;
  T(`unik söksträng "${s.slice(0, 45)}…"`, n === 1, `${n} träff(ar)`);
}

console.log(`\n=== RESULTAT: ${ok} OK, ${fel} FEL, ${lFel} länkfel ===`);
