#!/usr/bin/env node
// _s1u1-iberdrola-paket.mjs — bygger FLYTTKLART-PAKET för sa-laser-du-iberdrola-q3-2026
// (s1-u1, manifest auto-s1-1790796926223). Fabege-precedensen: alla kurer maskinellt
// tillämpade med EXAKT-EN-TRÄFF-assert; efterverifiering (kontrolleraText, 911, gamla
// felsträngar 0, nya räknesatser omräknade); utkast-JSON:n på ORIGINALPLATSEN lämnas orörd.
import fs from 'node:fs';
import crypto from 'node:crypto';

const ROT = '/home/ak1a/AK1';
const KALLA = `${ROT}/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json`;
const VM = JSON.parse(fs.readFileSync(`${ROT}/data/varumarke.json`, 'utf8'));
const original = fs.readFileSync(KALLA, 'utf8');
const U = JSON.parse(original);
const md5 = s => crypto.createHash('md5').update(s).digest('hex');

// ── Kurerna (from-strängarna verifierade UNIKA i utkastet; to saknas före) ──
const KURER = [
  // B1 — rappfönstret: telia-paketet (rappdag 21/10, på disk 2026-09-29) gör fönstret 14;
  // telia-paketets EGEN C4-kur fastställde "14 … 2+4+5+3" — seriens sanning vid publiceringen
  { id: 'B1a', klass: 'B', yta: 'body/Praktiskt', från: '13 läspaket över fyra dagar', till: '14 läspaket över fyra dagar',
    motiv: 'Telia Q3-paketet (rappdag 21/10 enligt Telias officiella kalender) byggdes 2026-09-29, efter detta pakets 2026-09-16 — fönstret 20–23 oktober är 14 läspaket (2+4+5+3); telia-granskningens C4-kur fastställde samma tal' },
  { id: 'B1b', klass: 'B', yta: 'body/Praktiskt', från: 'SKF, Handelsbanken och Iberdrola den 21:a', till: 'SKF, Handelsbanken, Iberdrola och Telia den 21:a',
    motiv: '21 oktober har FYRA paket (SKF, Handelsbanken, Iberdrola, Telia) — telia-paketets C4-kur: 2+4+5+3 = 14' },
  // B2 — Fabege F2-klassen: räknesatserna redovisar fältens fulla precision (P/E 24,842,
  // P/B 2,536, FCF-marginal 5,76, mcap 130,96) så textens synliga tal bär sina egna resultat
  { id: 'B2a', klass: 'B', yta: 'body/Källkritik', från: 'ta P/B 2,54, dividera med ROE 0,1002', till: 'ta P/B 2,536, dividera med ROE 0,1002',
    motiv: '2,536 ÷ 0,1002 = 25,31 (textens resultat); visat 2,54 ger 25,35 — F2-klassen' },
  { id: 'B2b', klass: 'B', yta: 'body/Källkritik', från: 'Källans eget P/E-tal är 24,8.', till: 'Källans eget P/E-tal är 24,842.',
    motiv: 'gapet 1,9 procent gäller mot 24,842 (25,31/24,842 = 1,019); mot visat 24,8 blir det 2,1' },
  { id: 'B2c', klass: 'B', yta: 'body/Källkritik', från: 'Omvänt: 24,8 multiplicerat med 0,1002', till: 'Omvänt: 24,842 multiplicerat med 0,1002',
    motiv: '24,842 × 0,1002 = 2,489 → 2,49 (textens resultat); visat 24,8 ger 2,48' },
  { id: 'B2d', klass: 'B', yta: 'body/Källkritik', från: 'P/E-fältet 24,8 multiplicerat med årsresultatet 6 285', till: 'P/E-fältet 24,842 multiplicerat med årsresultatet 6 285',
    motiv: '24,842 × 6 285 M€ = 156,13 mdr → textens 156,1; visat 24,8 ger 155,9' },
  { id: 'B2e', klass: 'B', yta: 'body/Värdering', från: 'FCF-marginalen 5,8 procent gånger intäkterna', till: 'FCF-marginalen 5,76 procent gånger intäkterna',
    motiv: 'fältet 0,0576 × 45 547 = 2 623 M€ (textens resultat); visat 5,8 % ger 2 642 — Fabege F2: redovisa fältets precision i räknesatsen' },
  { id: 'B2f', klass: 'B', yta: 'body/Övning C', från: 'P/E 24,8 delat med 1,0705', till: 'P/E 24,842 delat med 1,0705',
    motiv: '24,842 ÷ 1,0705 = 23,21 (textens resultat); visat 24,8 ger 23,17' },
  { id: 'B2g', klass: 'B', yta: 'body/Källkritik (EV-steg 1)', från: 'börsvärdet 131,0 delat med P/B 2,54', till: 'börsvärdet 130,96 delat med P/B 2,536',
    motiv: '130,96 ÷ 2,536 = 51,64 → 51,6 och skuld 51,66 → 51,7 (textens båda steg); visat 131,0/2,54 ger 51,57 → skuld 51,6 ≠ 51,7' },
  { id: 'B2h', klass: 'B', yta: 'källrad/identitet', från: '2,54 ÷ 0,1002 = 25,31 mot källans P/E 24,8; differens 1,9 procent; omvänt 24,8 × 0,1002 = 2,49', till: '2,536 ÷ 0,1002 = 25,31 mot källans P/E 24,842; differens 1,9 procent; omvänt 24,842 × 0,1002 = 2,49',
    motiv: 'källradens identitetssats med full precision (samma kur som B2a–c)' },
  { id: 'B2i', klass: 'B', yta: 'källrad/absolutkontroll', från: 'Absolutkontroll: 24,8 × 6 285 M€', till: 'Absolutkontroll: 24,842 × 6 285 M€', motiv: 'samma kur som B2d' },
  { id: 'B2j', klass: 'B', yta: 'källrad/PEG', från: 'implicit tillväxt ur fältet 24,8 ÷ 3,02 = 8,23 procent', till: 'implicit tillväxt ur fältet 24,842 ÷ 3,02 = 8,23 procent', motiv: '24,842 ÷ 3,02 = 8,23; visat 24,8 ger 8,21' },
  { id: 'B2k', klass: 'B', yta: 'källrad/FCF', från: 'FCF-kontroll: 5,8 % × 45 547', till: 'FCF-kontroll: 5,76 % × 45 547', motiv: 'samma kur som B2e' },
  { id: 'B2l', klass: 'B', yta: 'källrad/EV-kedja', från: 'EK 131,0 ÷ 2,54 = 51,6', till: 'EK 130,96 ÷ 2,536 = 51,6', motiv: 'samma kur som B2g' },
  // C — mindre rättningar
  { id: 'C1', klass: 'C', yta: 'body/Övning C', från: 'inte en handssignal', till: 'inte en handelssignal',
    motiv: 'stavfel "handssignal" → "handelssignal" (wihlborgs-B3:s exakta felklass)' },
  { id: 'C2', klass: 'C', yta: 'fält/readingMinutes', från: 5, till: 6,
    motiv: 'släktets ordräkning (match(/\\S+/g)) ger 3 352 ord efter kurerna → round(ord/600) = 6 (fabege F6-precedensen; byggarens 3 067 var en alfanum-tokenräkning)' },
  { id: 'C3', klass: 'C', yta: 'body/Värdering', från: 'Strax över branschmedianen 2,27 (11 procent)', till: 'Strax över branschmedianen 2,27 (12 procent)',
    motiv: '2,536 ÷ 2,27 = 1,117 → 11,7 procent avrundat 12 (trunkeringen till 11 lämnar fel siffra)' },
  { id: 'C4', klass: 'C', yta: 'body/Stabilitet', från: 'energigrenens spann är universumets bredaste', till: 'energigrenens spann är ett av universumets bredaste',
    motiv: 'byggvintagen: industrins spann är bredare på båda mått (absolut 7,88 mot energins 2,92; kvot 282× mot 19× pga nollskuldsbolag) — energi är bland de bredaste' },
];

// ── tillämpa med asserts ──
let body = U.body;
const tillämpade = [];
for (const k of KURER) {
  if (k.yta === 'fält/readingMinutes') {
    if (U.readingMinutes !== k.från) throw new Error(`${k.id}: rm = ${U.readingMinutes}, väntade ${k.från}`);
    U.readingMinutes = k.till;
    tillämpade.push(k.id);
    continue;
  }
  const n = body.split(k.från).length - 1;
  if (n !== 1) throw new Error(`${k.id}: "${k.från.slice(0, 50)}" har ${n} träffar (väntade 1)`);
  if (body.includes(k.till)) throw new Error(`${k.id}: to-strängen finns redan före kur`);
  body = body.replace(k.från, k.till);
  tillämpade.push(k.id);
}
U.body = body;

// ── efterverifiering ──
const kontroller = [];
const K = (id, ok, txt) => { kontroller.push({ id, ok, txt }); if (!ok) { console.error(`  FEL ${id}: ${txt}`); process.exitCode = 1; } };

// gamla strängar borta, nya närvarande exakt en gång
for (const k of KURER) {
  if (k.yta === 'fält/readingMinutes') continue;
  K(`gammal-${k.id}`, !body.includes(k.från), `"${k.från.slice(0, 40)}" borta`);
  K(`ny-${k.id}`, body.split(k.till).length - 1 === 1, `"${k.till.slice(0, 40)}" exakt 1×`);
}
// kontrolleraText-spegel × 3 ytor
let frasFel = 0;
for (const fras of VM.forbjudnaFraser) {
  const re = new RegExp(fras.fran, 'gu');
  for (const text of [U.title, U.description, body]) if (re.test(text)) frasFel++;
}
K('kontrolleraText', frasFel === 0, `${VM.forbjudnaFraser.length} mönster × 3 ytor = ${frasFel} träff(ar)`);
// 911
const p911 = [/\b911\b/, /9\s*\/\s*11/, /11\s+september/i, /september\s+11/i, /nine[-\s]?eleven/i, /9-1-1/];
K('911', p911.every(re => !(U.title + U.description + body).match(re)), '0 träffar (sex mönster)');
// lagrum
const lagrum = [...new Set((U.title + U.description + body).match(/\b\d{4}:\d+\b/g) || [])];
K('lagrum', lagrum.length === 1 && lagrum[0] === '2007:528', `exakt en familj: ${lagrum.join(',')}`);
// disclaimer sist
const sista = body.trimEnd().split('\n').pop();
K('disclaimer-sist', /2007:528/.test(sista) && /inte investeringsrådgivning/.test(sista) && /kundens beslut/.test(sista), 'disclaimer + R2 sist');
// nya räknesatser omräknade
const P = 24.842, PB = 2.536, ROE = 0.1002, MCAP = 130.96, RES = 6285, OMS = 45547, FCFM = 0.0576;
K('nv-identitet', Math.abs(PB / ROE - 25.31) < 0.005 && Math.abs(P * ROE - 2.49) < 0.005, '2,536/0,1002 = 25,31 · 24,842×0,1002 = 2,49');
K('nv-absolut', Math.abs(P * RES / 1000 - 156.1) < 0.05, `24,842×6 285 = ${(P * RES / 1000).toFixed(2)} mdr → 156,1`);
K('nv-peg', Math.abs(P / 3.02 - 8.23) < 0.005 && Math.abs(P / 1.0705 - 23.21) < 0.005, `24,842/3,02 = ${(P / 3.02).toFixed(3)} · /1,0705 = ${(P / 1.0705).toFixed(3)}`);
K('nv-fcf', Math.abs(FCFM * OMS - 2623) < 1 && Math.abs(MCAP / PB - 51.6) < 0.05 && Math.abs(MCAP / PB * 1.0003 - 51.7) < 0.05, `5,76 %×45 547 = ${(FCFM * OMS).toFixed(0)} · EK 51,6 · skuld 51,7`);
// ord + rm
const ord = body.match(/\S+/g)?.length ?? 0;
const rm = Math.round(ord / 600);
K('ord-rm', rm === U.readingMinutes, `${ord} ord → rm ${rm} = fältets ${U.readingMinutes}`);
// original orört
K('original-orört', md5(fs.readFileSync(KALLA, 'utf8')) === md5(original), `utkast-JSON:n orörd (md5 ${md5(original).slice(0, 8)}…)`);

// ── skriv FLYTTKLART-PAKET + diff ──
const paket = {
  slug: U.slug, title: U.title, description: U.description, pillar: U.pillar, author: U.author,
  publishedAt: U.publishedAt, readingMinutes: U.readingMinutes, tags: U.tags, body,
  _flyttklart: {
    baseradPaa: 'data/blogg-utkast/kvartal/2026-q3/sa-laser-du-iberdrola-q3-2026.json (md5 ' + md5(original).slice(0, 8) + ', orört)',
    granskadAv: 's1-u1, manifest auto-s1-1790796926223 (2026-09-30)',
    sond: 'verktyg/_s1u1-iberdrola-kontroll.mjs — 109 OK · 10 FEL · 5 NOT (felen = fyndens belägg, alla kurerade här)',
    kurer: tillämpade.length, kurDetaljer: KURER.map(k => ({ id: k.id, klass: k.klass, yta: k.yta, motiv: k.motiv })),
    efterverifiering: kontroller.map(k => `${k.ok ? 'PASS' : 'FEL'} ${k.id}`),
    publicering: 'kundens beslut (R2) — denna fil är ett paket, ingen publicering',
  },
};
const UT = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-iberdrola-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u1.json`;
fs.writeFileSync(UT, JSON.stringify(paket, null, 1) + '\n');
const diff = {
  slug: U.slug, granskadAv: 's1-u1', datum: '2026-09-30',
  typ: 'kompletterande diff med verkställningsguide',
  ordning: 'B1 (fönstret) → B2 (full precision, a→l i textordning) → C1 stavfel → C2 rm → C3 P/B-premie → C4 spann',
  poster: KURER.map(k => ({ id: k.id, klass: k.klass, yta: k.yta, från: k.från, till: k.till, motiv: k.motiv })),
  efterverifiering: kontroller.every(k => k.ok) ? 'ALLA PASS' : 'FEL FINNS — verkställ ej',
};
const DF = `${ROT}/data/blogg-utkast/granskning/sa-laser-du-iberdrola-q3-2026-diff-2026-09-30-s1u1.json`;
fs.writeFileSync(DF, JSON.stringify(diff, null, 1) + '\n');

console.log(`KURER: ${tillämpade.length} tillämpade (${tillämpade.join(', ')})`);
console.log(`ETTERVERIFIERING: ${kontroller.filter(k => k.ok).length}/${kontroller.length} PASS`);
console.log(`PAKET: ${UT}`);
console.log(`DIFF: ${DF}`);
console.log(`ORD: ${ord} → rm ${rm}`);
