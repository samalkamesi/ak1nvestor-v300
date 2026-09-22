#!/usr/bin/env node
// _s4u1-nvda-byggdata.mjs — byggmotor för NVIDIA Q3-läspaket 2026 (s4-u1, manifest auto-s4-1790046905434)
// Talbank: universumraden NVDA läses LIVE ur data/portfolj-system/bolagsunivers.json;
// kvartalstal sökverifierade 2026-09-22 (NVIDIA newsroom/IR via sök + Wall Street Horizon/MarketChameleon).
// All aritmetik motorräknas här och interpoleras in i texten — inga handskrivna produkter.
// Användning: node verktyg/_s4u1-nvda-byggdata.mjs
import fs from 'node:fs';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nvda-q3-2026.json';

const uni = JSON.parse(fs.readFileSync(UNI, 'utf8'));
const nv = uni.find(b => b.ticker === 'NVDA');
if (!nv) throw new Error('NVDA saknas i universumfilen');
const gren = uni.filter(b => b.bransch === 'tillvaxt');

//Median och rang LIVE ur grenen (tillvaxt, 19 bolag)
const med = v => { const x = v.filter(t => typeof t === 'number' && isFinite(t)).sort((a, b) => a - b); return x.length ? x[Math.floor(x.length / 2)] : null; };
const rang = (val, f, dir) => {
  const xs = gren.map(f).filter(t => typeof t === 'number' && isFinite(t)).sort((a, b) => dir === 'hogt' ? b - a : a - b);
  return { r: xs.indexOf(val) + 1, n: xs.length };
};
const M = {
  pe: med(gren.map(b => b.vardering.pe)), pb: med(gren.map(b => b.vardering.pb)),
  evEbit: med(gren.map(b => b.vardering.evEbit)), peg: med(gren.map(b => b.vardering.peg)),
  fcfY: med(gren.map(b => b.vardering.fcfYield)), roe: med(gren.map(b => b.lonksamhet.roe)),
  roic: med(gren.map(b => b.lonksamhet.roic)), brutto: med(gren.map(b => b.lonksamhet.bruttoMarginal)),
  ebit: med(gren.map(b => b.lonksamhet.ebitMarginal)), netto: med(gren.map(b => b.lonksamhet.nettoMarginal)),
  skuldEk: med(gren.map(b => b.stabilitet.skuldEgenkapital)),
  ttm: med(gren.map(b => b.tillvaxt.omsattningTillvaxtTTM)), cagr: med(gren.map(b => b.tillvaxt.omsattningCAGR5ar))
};
const R = {
  pe: rang(nv.vardering.pe, b => b.vardering.pe, 'hogt'), pb: rang(nv.vardering.pb, b => b.vardering.pb, 'hogt'),
  evEbit: rang(nv.vardering.evEbit, b => b.vardering.evEbit, 'hogt'), peg: rang(nv.vardering.peg, b => b.vardering.peg, 'lagt'),
  fcfY: rang(nv.vardering.fcfYield, b => b.vardering.fcfYield, 'hogt'), roe: rang(nv.lonksamhet.roe, b => b.lonksamhet.roe, 'hogt'),
  roic: rang(nv.lonksamhet.roic, b => b.lonksamhet.roic, 'hogt'), brutto: rang(nv.lonksamhet.bruttoMarginal, b => b.lonksamhet.bruttoMarginal, 'hogt'),
  ebit: rang(nv.lonksamhet.ebitMarginal, b => b.lonksamhet.ebitMarginal, 'hogt'), netto: rang(nv.lonksamhet.nettoMarginal, b => b.lonksamhet.nettoMarginal, 'hogt'),
  skuldEk: rang(nv.stabilitet.skuldEgenkapital, b => b.stabilitet.skuldEgenkapital, 'lagt'),
  ttm: rang(nv.tillvaxt.omsattningTillvaxtTTM, b => b.tillvaxt.omsattningTillvaxtTTM, 'hogt'),
  cagr: rang(nv.tillvaxt.omsattningCAGR5ar, b => b.tillvaxt.omsattningCAGR5ar, 'hogt')
};

// ---------- KVARTALSTALBANK (sökverifierad 2026-09-22) ----------
const KV = {
  q3fy26: { rapp: '2025-11-19', intakt: 57.006, yy: 62, dc: 51.2, dcyy: 66, gaming: 4.3, netto: 31.910, nettoyy: 65, eps: 1.30, epsFjor: 0.78, retur9m: 37.0, guideQ4: 65.0 },
  q4fy26: { rapp: '2026-02-25', intakt: 68.127, qq: 20, yy: 73, dc: 62.3, netto: 42.960, eps: 1.76, epsNG: 1.62, brutto: 75.2, fcf: 34.9 },
  fy26: { intakt: 215.938, yy: 65, dc: 197.3, rorelse: 130.4, netto: 120.067, epsG: 4.90, epsNG: 4.77, fcf: 96.6 },
  q1fy27: { rapp: '2026-05-20', intakt: 81.615, qq: 20, yy: 85, dc: 75.2, dcyy: 92, netto: 58.321, nettoyy: 126, eps: 2.39, bruttoG: 74.9, bruttoNG: 75.0, guideQ2: 91.0, utd: 0.25, utdFjor: 0.01, aterkopNytt: 80, aterkopKvar: 39 },
  q2fy27: { rapp: '2026-08-26', intakt: 96.221, qq: 18, yy: 106, dc: 89.02, dcqq: 18, dcyy: 117, netto: 59.688, nettoqq: 2, nettoyy: 126, epsG: 2.46, epsNG: 2.22, brutto: 75.0, retur: 26, konsensus: 92.1 },
  q3guide: { intakt: 108.0, spann: 2, brutto: 74.0, bottenLo: 71, bottenHi: 72 },
  rappdag: '2026-11-17'
};

// ---------- HÄRLEDADE TAL (motorräknade) ----------
const pris = nv.pris, mcap = nv.marknadsKapitalMdr;
const epsBasFalt = pris / nv.vardering.pe;                       // P/E-fältets nämnare bakväg
const rullEPS = KV.q3fy26.eps + KV.q4fy26.eps + KV.q1fy27.eps + KV.q2fy27.epsG;  // 7,91
const peKedja = pris / rullEPS;
const peGap = Math.abs(peKedja - nv.vardering.pe) / nv.vardering.pe * 100;
const yyKvot = KV.q2fy27.intakt / 46.743;                        // Q2-FY27 mot Q2-FY26
const ttmIntakt = KV.q3fy26.intakt + KV.q4fy26.intakt + KV.q1fy27.intakt + KV.q2fy27.intakt;      // 302,969
const ttmFjor = 35.082 + 39.331 + 44.062 + 46.743;               // Q3-FY25 → Q2-FY26
const ttmTillv = (ttmIntakt / ttmFjor - 1) * 100;                // +83,4 %
const rullNetto = KV.q3fy26.netto + KV.q4fy26.netto + KV.q1fy27.netto + KV.q2fy27.netto;          // 192,879
const rullNettoM = rullNetto / ttmIntakt * 100;                  // 63,66 %
const ekSlut = mcap / nv.vardering.pb;                           // 229,0
const ekMedel = rullNetto / nv.lonksamhet.roe;                   // 164,6
const ekTillv = (ekSlut / ekMedel - 1) * 100;                    // +39,2 %
const ebitTtm = nv.lonksamhet.ebitMarginal * ttmIntakt;          // 200,7
const ev = nv.vardering.evEbit * ebitTtm;                        // 5 384,8
const nettokassa = mcap - ev;                                    // 34,0
const aktierGrund = mcap / pris;                                 // 24,147
const aktierUtspadd = KV.q2fy27.netto / KV.q2fy27.epsG;          // 24,263
const utdAr = KV.q1fy27.utd * 4;                                 // 1,00
const dirAvk = utdAr / pris * 100;                               // 0,45 %
const guideKvot = (KV.q3guide.intakt / KV.q3fy26.intakt - 1) * 100;  // +89,4 %
const dcAndel = KV.q2fy27.dc / KV.q2fy27.intakt * 100;           // 92,5 %
const pegFaltN = nv.vardering.pe / nv.vardering.peg;             // 50,7
const pegKonv = nv.vardering.pe / (nv.tillvaxt.prognosTillvaxt * 100);  // 0,432
const pegKvart = nv.vardering.pe / (nv.tillvaxt.omsattningTillvaxtTTM * 100); // 0,268
const bryt25 = pris / 25, x25 = bryt25 - (KV.q4fy26.eps + KV.q1fy27.eps + KV.q2fy27.epsG);  // 2,37
const bryt22 = pris / 22, x22 = bryt22 - (KV.q4fy26.eps + KV.q1fy27.eps + KV.q2fy27.epsG);  // 3,59
const slagQ1 = (KV.q1fy27.intakt / 78.0 - 1) * 100;              // +4,6
const slagQ4 = (KV.q4fy26.intakt / KV.q3fy26.guideQ4 - 1) * 100; // +4,8
const slagQ2 = (KV.q2fy27.intakt / KV.q1fy27.guideQ2 - 1) * 100; // +5,7
const fcf26marg = KV.fy26.fcf / KV.fy26.intakt * 100;            // 44,7
const fcfPerAktie = KV.fy26.fcf / aktierUtspadd;                 // 3,98
const fcfYieldReal = fcfPerAktie / pris * 100;                   // 1,77
const marginalTick = KV.q3guide.intakt * 0.01 / aktierUtspadd;   // 0,0445 USD/aktie per marginalpunkt
const roeSlutEk = rullNetto / ekSlut * 100;                      // 84,2 % på slut-EK
const guideQQ = (KV.q3guide.intakt / KV.q2fy27.intakt - 1) * 100; // +12,2 % mot förra kvartalet
const resetKostnad = (KV.q2fy27.brutto - KV.q3guide.bottenLo) * KV.q3guide.intakt / 100; // 75→71 = 4,3 mdr
const mcapRang = rang(mcap, b => b.marknadsKapitalMdr, 'hogt');

//Scenarioruta: tre intäktslägen (guide-spannet) × tre GAAP-nettomarginaler
const scInt = [KV.q3guide.intakt * (1 - KV.q3guide.spann / 100), KV.q3guide.intakt, KV.q3guide.intakt * (1 + KV.q3guide.spann / 100)];
const scMarg = [0.58, 0.61, 0.64];
const scCell = (i, m) => {
  const netto = i * m, eps = netto / aktierUtspadd;
  const nyRull = KV.q4fy26.eps + KV.q1fy27.eps + KV.q2fy27.epsG + eps;
  return { netto, eps, pe: pris / nyRull };
};
const sc = scMarg.map(m => scInt.map(i => scCell(i, m)));

//Svenskt talformat: komma som decimaltecken
const f = (x, d = 1) => x.toFixed(d).replace('.', ',');
const pct = (x, d = 1) => f(x, d) + ' %';
const inTol = (a, b, tol) => Math.abs(a - b) <= tol;

//Konsistenskontroller inom byggmotorn (kokvittering före skriv)
const asserts = [
  ['rullEPS', rullEPS, 7.91, 0.001], ['peKedja', peKedja, 28.37, 0.01],
  ['peGap<0.2%', peGap, 0.11, 0.06], ['yyKvot==TTM-fältet', yyKvot - 1, nv.tillvaxt.omsattningTillvaxtTTM, 0.001],
  ['rullNettoM==fältet', rullNettoM, nv.lonksamhet.nettoMarginal * 100, 0.01],
  ['ttmIntakt', ttmIntakt, 302.969, 0.001], ['ekSlut', ekSlut, 228.98, 0.05],
  ['ebitTtm', ebitTtm, 200.69, 0.05], ['aktierUtspadd', aktierUtspadd, 24.263, 0.01],
  ['guideKvot', guideKvot, 89.4, 0.15], ['dcAndel', dcAndel, 92.5, 0.05],
  ['x25', x25, 2.37, 0.01], ['x22', x22, 3.59, 0.01],
  ['fy26-summa', 44.062 + 46.743 + KV.q3fy26.intakt + KV.q4fy26.intakt, KV.fy26.intakt, 0.001]
];
for (const [namn, fick, vant, tol] of asserts) if (!inTol(fick, vant, tol)) throw new Error(`TALBANK ${namn}: fick ${fick}, väntade ≈${vant}`);
if (Math.abs(KV.fy26.netto - nv.serier.resultat[3] / 1e9) > 0.001) throw new Error('FY26-netto matchar inte universumserien');
if (Math.abs(KV.fy26.intakt - nv.serier.omsattning[3] / 1e9) > 0.001) throw new Error('FY26-intäkt matchar inte universumserien');

// ---------- TEXT ----------
const body = `NVIDIA — halvledarjätten bakom GPU:erna som driver AI-byggandet, noterad som NVDA på NASDAQ och ${f(mcap, 1)} miljarder dollar i börsvärde (${mcapRang.r}:a tyngst av ${mcapRang.n} rader i universumet) — rapporterar kalender-Q3, som i NVIDIA:s brutna räkenskapsår är **Q3 FY2027** (kvartalet 27 juli–25 oktober 2026), **tisdagen 17 november 2026 efter amerikansk börsstängning** enligt Wall Street Horizon och MarketChameleon (tredjepartskonfirmerad datumklass; fjolårets Q3 kom onsdagen 19 november 2025, tredje novemberveckan är rytmen). Tre dörrar väntar innan en enda siffra läses: **kvartalskedjan som återvinner P/E-fältet** — EPS 1,30 + 1,76 + 2,39 + 2,46 = ${f(rullEPS, 2)} dollar rullande, och kursen ${f(pris, 2)} delat med den ger ${f(peKedja, 1)} mot universumfältets ${f(nv.vardering.pe, 1)} (gap ${f(peGap, 2)} procent); **guide-hissen mot marginalresetsen** — intäktsguiden ${f(KV.q3guide.intakt, 1)} miljarder dollar (±2 procent), ${f(guideKvot, 1)} procent över fjolårets Q3-intäkt, samtidigt som bruttomarginalen guidades ned från ${f(KV.q2fy27.brutto, 1)} till ${f(KV.q3guide.brutto, 1)} procent med en botten på ${KV.q3guide.bottenLo}–${KV.q3guide.bottenHi} procent i Q4 — volymen hissas medan marginalen släpper; och **EPS-världarna omvända** — GAAP-EPS 2,46 dollar ligger ÖVER det justerade 2,22, seriens spegelbild av MTG-paketets tiofaldiga klyfta åt andra hållet. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är tillväxtgrenens första NVIDIA-paket och seriens ~84:e läspaket på disk (ordinalen redovisas öppet enligt Microsoft-precedensen — syskonens Latour- och Netflix-paketer levererades parallellt med detta, KO-dedup äger slutnumret). Sorteringen redovisas öppet: spårets stående könot (Equinor- och MTG-paketens köer) listar **NVDA 17/11 som kö-ettan bland återstående objekt** — tredjepartskonfirmerad datumklass, bolagsbekräftelse kommer i NVIDIA:s egen IR-kalender när den uppdateras (MTG-paketets konvention: bolagsbekräftat träder framför estimerat, men bland kvarvarande fanns ingen tidigare bekräftad dag). Duplikatkontrollen vid klaimen (2026-09-22 03:17 lokal tid, disk-först i data/vakten/klaim-s4u1-nvda-q3-2026.md): inget NVDA-paket bland de 81 på disk, ingen NVDA-klaim i katalogen, syskonen i omgången (u2, u3) utan klaimer på disk vid skrivandet. NVIDIA:s uppgift i serien är att visa hur man läser ett bolag där **brutet räkenskapsår, guidekultur och fönstergeometri** loopas ihop: kalender-Q3 är inte räkenskapsårets Q3, guiderna är seriens slagkraftigaste (tre rakslag på raken), och fönstren skiljer sig så mycket att identitetstestet faller 29 procent utan att ett enda tal är fel.

## Urvalet: varför NVIDIA är nästa paket i serien

Datumklassen är konfirmerat-tredjepart och redovisas som sådan: Wall Street Horizon (tisdagen 17/11 2026, efter stängning) och MarketChameleon (samma dag, AMC) — medan bolagets egen IR-sida hittills listar genomgångna event (Q2 den 26 augusti) men ännu inte Q3-dagen; när kalendern uppdateras går datumet upp en klass, och paketets praktiska avsnitt pekar ut var. Rytmen bär: Q3-FY2026 kom 19 november 2025, Q2-FY2027 den 26 augusti 2026 — novembervecka tre är normen, och amerikansk rapport efter stängning (AMC) betyder svensk tid natten mot onsdagen den 18 november: den som bevakar från Sverige läser rapporten onsdag morgon.

Kalenderkopplingen är seriens renaste sedan Microsoft-paketet: **kalender-Q3 2026 = Q3 FY2027**, kvartalet 27 juli–25 oktober 2026, med två månader av juli–september-kvartalet omslutna. Datakärnan: universumraden NVDA (hämtdatum 2026-09-03) har full värderingsrad, full lönsamhetstrappa och fyra räkenskapsår i både omsättning och resultat — och till skillnad från MTG-radens ensamhet har raden **dubbelkällsstatus: Yahoo Finance med MarketStack-dubbelkoll av pris, P/E, P/B och marknadsvärde** (slutkurs 2026-09-02), radens egen källnot redovisar det. Biblioteksposten saknas — NVIDIA är som Equinor och MTG plockat utanför de 22 vågvaliderade bolagen, ur spårets stående kö — och paketet säger det öppet: AKM1-dom och täckningsgrad finns inte för detta objekt; universumraden plus detta pakets nya primärinsamling är hela modellunderlaget (äganderegeln: den som gör den nya insamlingen äger objektet — fyra kvartalsrapporter, årsutdelningen, återköpsprogrammen och rappdagen sökverifierade 2026-09-22).

## Nyckeltalen att ha med sig — med fönstrens fyra världar i ryggsäcken

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom tillväxtbranschen. Varningsflaggan hissas först: **fyra olika fönster levererar fyra olika bilder av samma bolag** — se källkritiken. Värderingsraden:

- **P/E ${f(nv.vardering.pe, 1)}** ([så räknas det](/dataset/tillvaxt/pe)) — ${R.pe.r}:e högst av ${R.pe.n} i grenen (median ${f(M.pe, 1)}): bland de ${R.pe.n - R.pe.r + 1} billigaste på vinsten i hela tillväxtgrenen.
- **P/B ${f(nv.vardering.pb, 2)}** ([aspekt](/dataset/tillvaxt/pb)) — ${R.pb.r}:e högst av ${R.pb.n} (median ${f(M.pb, 2)}): bokföringsmässigt i grenens topp.
- **EV/EBIT ${f(nv.vardering.evEbit, 1)}** ([aspekt](/dataset/tillvaxt/ev-ebit)) — ${R.evEbit.n - R.evEbit.r + 1}:e lägst av ${R.evEbit.n} (median ${f(M.evEbit, 1)}): under medianen, med ett EV-imperativ som pekar på nettokassa (övning två).
- **PEG ${f(nv.vardering.peg, 2)}** ([aspekt](/dataset/tillvaxt/peg)) — ${R.peg.r}:e lägst av ${R.peg.n} (median ${f(M.peg, 2)}), men med seriens känsligaste nämnarfråga (övning tre).
- **FCF-avkastning ${pct(nv.vardering.fcfYield * 100, 2)}** ([aspekt](/dataset/tillvaxt/fcf-avkastning)) — ${R.fcfY.n - R.fcfY.r + 1}:e lägst av ${R.fcfY.n} (median ${pct(M.fcfY * 100, 2)}): fältets fönster avviker kraftigt från kassarealiteten — källkritikens tredje fynd.

Lönsamhetstrappan ([ROE](/dataset/tillvaxt/roe) ${pct(nv.lonksamhet.roe * 100, 1)} mot median ${pct(M.roe * 100, 1)}; [ROIC](/dataset/tillvaxt/roic) ${pct(nv.lonksamhet.roic * 100, 1)} mot ${pct(M.roic * 100, 1)}; [bruttomarginal](/dataset/tillvaxt/brutto-marginal) ${pct(nv.lonksamhet.bruttoMarginal * 100, 1)} mot ${pct(M.brutto * 100, 1)}; EBIT-marginal ${pct(nv.lonksamhet.ebitMarginal * 100, 1)}; [nettomarginal](/dataset/tillvaxt/netto-marginal) ${pct(nv.lonksamhet.nettoMarginal * 100, 2)} mot ${pct(M.netto * 100, 1)}): **tre förstaplatser och en andraplats i grenen** — ROE, ROIC och nettomarginal alla ${R.roe.r}:a högst, EBIT-marginalen ${R.ebit.r}:a, bruttomarginalen ${R.brutto.r}:e högst — på en aktie som samtidigt handlas i grenens billigaste P/E-kvartil. Det är tillväxtgrenens paradox i ett stycke: grenen prissätter tillväxt, NVIDIA levererar lönsamhet. [Intäktstillväxten TTM](/dataset/tillvaxt/omsattningstillvaxt-ttm) +${f(nv.tillvaxt.omsattningTillvaxtTTM * 100, 1)} procent (2:a högst av ${R.ttm.n}) och femårstillväxten +${f(nv.tillvaxt.omsattningCAGR5ar * 100, 1)} procent per år (1:a högst) — med basårsläxan från Kambi- och MTG-paketen: CAGR:n bygger på fyra räkenskapsår från FY2023:s ${f(nv.serier.omsattning[0] / 1e9, 3)} miljarder, och enserie-CAGR läses aldrig utan att fråga vad som hände mellan ändpunkterna. Återbetalningarna: utdelningen höjdes maj 2026 från 0,01 till **0,25 dollar per kvartal** (25-faldigt) = ${f(utdAr, 2)} dollar om åren = ${pct(dirAvk, 2)} direktavkastning på kursen — och återköpsbehörigheten utökades med 80 miljarder dollar på 39 kvarstående. Balansräkningen lugn: skuld/eget kapital ${f(nv.stabilitet.skuldEgenkapital, 2)} (${R.skuldEk.r}:e lägsta av ${R.skuldEk.n}, median ${f(M.skuldEk, 2)}); radens insiderfält noterar 26 köp senaste sex månader.

## Källkritiken: P/E-fältet som återvinns — och tre fält som inte håller

Kärnfyndet är **P/E-fältets nämnare, återvunnen ur kvartalskedjan** (Prologis-paketets signaturmetod). Universumfältet ${f(nv.vardering.pe, 3)} på kursen ${f(pris, 2)} implicerar en EPS-bas på ${f(epsBasFalt, 3)} dollar; de fyra sökverifierade kvartalen Q3-FY2026 till Q2-FY2027 ger 1,30 + 1,76 + 2,39 + 2,46 = ${f(rullEPS, 2)} dollar — gap ${f(peGap, 2)} procent. Fyra officiella kvartal återvinner alltså Yahoo-nämnaren exakt: fältet är friskt, fönstret är rullande GAAP, och det är samma fönster som nettofältet: rullande netto ${f(rullNetto, 3)} miljarder på TTM-intäkten ${f(ttmIntakt, 3)} = nettomarginal ${pct(rullNettoM, 2)}, mot universumfältets ${pct(nv.lonksamhet.nettoMarginal * 100, 2)} — träff på hundradelen.

**Andra fyndet: identitetstestet som faller 29 procent — utan att ett enda tal är fel.** P/B delat med ROE ska ge P/E: ${f(nv.vardering.pb, 3)} / ${pct(nv.lonksamhet.roe * 100, 2)} = ${f(nv.vardering.pb / nv.lonksamhet.roe, 1)} mot P/E ${f(nv.vardering.pe, 1)} — gap ${f(Math.abs(nv.vardering.pb / nv.lonksamhet.roe / nv.vardering.pe - 1) * 100, 1)} procent, seriens största (MTG:s rekordtajta 0,18 är andra änden). Roten är fönstergeometrin, inte fel: ROE-fältets nämnare är ett MEDEL-ekvitet (${f(rullNetto, 3)} / 1,1721 = ${f(ekMedel, 1)} miljarder dollar) medan P/B:s är SLUT-ekvitetet (${f(mcap, 1)} / ${f(nv.vardering.pb, 3)} = ${f(ekSlut, 1)} miljarder) — och mellan mätpunkterna växte eget kapital ${pct(ekTillv, 1)} (Kambi-läxan, förnyad och skärpd: provet är aldrig fel, fönstret är frågan — och när balansräkningen växer i NVIDIA-fart skiljer fönstren nästan en tredjedel).

**Tredje fyndet: fälten som inte håller kedjekontrollen.** TTM-fältet säger +${f(nv.tillvaxt.omsattningTillvaxtTTM * 100, 1)} procent — men det är exakt Q2-kvartalets årspå-år (${f(KV.q2fy27.intakt, 3)} / 46,743 = ${pct((yyKvot - 1) * 100, 1)}), inte tolv månaders tillväxt: den äkta TTM-räknningen är ${f(ttmIntakt, 3)} mot ${f(ttmFjor, 3)} = +${f(ttmTillv, 1)} procent. FCF-fältet: marginal ${pct(nv.lonksamhet.fcfMarginal * 100, 1)} och avkastning ${pct(nv.vardering.fcfYield * 100, 2)} — mot FY2026:s realitet ${f(KV.fy26.fcf, 1)} miljarder fritt kassaflöde på ${f(KV.fy26.intakt, 1)} = ${pct(fcf26marg, 1)} marginal, ${f(fcfPerAktie, 2)} dollar per aktie = ${pct(fcfYieldReal, 2)} avkastning. Pris, marknadsvärde, P/E och P/B håller; tillväxt- och kassaflödesfälten faller — Equinor-paketets huvudläxa i ny tappning: **en källa är ett knippe fält, varje fält bär eller faller på sin egen kedjekontroll.**

**Fjärde fyndet: EPS-världarna omvända.** Q2-FY2027 redovisar GAAP-EPS 2,46 dollar och justerad (non-GAAP) 2,22 — det justerade LIGGER UNDER GAAP, kvot 0,90. MTG-paketets tiofaldiga klyfta åt andra hållet (justerat tio gånger högre) och Disney- och Verizon-paketens 20-procentsgap har alla samma riktning: justerat över GAAP. Här är det spegeln — engångsposterna som suddas ur det justerade är i huvudsak VINSTER (bokförda på investeringsportföljen), inte kostnader. Läxan blir den omvända: när källan visar justerat under GAAP, leta efter vad bolaget inte räknar med — och jämför aldrig P/E mellan källor utan att fråga efter EPS-världen. Valutan är rak — amerikansk aktie, amerikansk rapport, dollar hela vägen — men tidszonen är noten: rapporten efter stängning den 17 november svensk natt betyder att kursreaktionen syns onsdagen den 18.

## Kvartalskedjan: dubblingen som guidad, marginalen som resatt

Kedjan bakåt från senaste rapporterade kvartal, varje rad sökverifierad 2026-09-22:

- **Q3 FY2026 (19 november 2025):** intäkt ${f(KV.q3fy26.intakt, 3)} miljarder dollar (+${KV.q3fy26.yy} procent mot året före), Data Center ${f(KV.q3fy26.dc, 1)} (+${KV.q3fy26.dcyy} procent), Gaming ${f(KV.q3fy26.gaming, 1)}; GAAP-netto ${f(KV.q3fy26.netto, 3)} (+${KV.q3fy26.nettoyy} procent), GAAP-EPS ${f(KV.q3fy26.eps, 2)} mot ${f(KV.q3fy26.epsFjor, 2)} året före. Nio månader FY2026: ${f(KV.q3fy26.retur9m, 1)} miljarder returnerade (återköp + utdelning). Guide Q4: ${f(KV.q3fy26.guideQ4, 1)} ±2 procent.
- **Q4/FY2026 (25 februari 2026):** intäkt ${f(KV.q4fy26.intakt, 3)} (+${KV.q4fy26.qq} procent mot förra kvartalet, +${KV.q4fy26.yy} procent mot året före — slog guiden ${f(KV.q3fy26.guideQ4, 1)} med ${f(slagQ4, 1)} procent), Data Center ${f(KV.q4fy26.dc, 1)}; GAAP-netto ${f(KV.q4fy26.netto, 3)}, GAAP-EPS ${f(KV.q4fy26.eps, 2)} (justerad EPS ${f(KV.q4fy26.epsNG, 2)} mot väntade ~1,53), bruttomarginal ${pct(KV.q4fy26.brutto, 1)}, fritt kassaflöde ${f(KV.q4fy26.fcf, 1)} i kvartalet. Helåret FY2026: intäkt ${f(KV.fy26.intakt, 1)} (+${KV.fy26.yy} procent — universumseriens exakta tal), Data Center ${f(KV.fy26.dc, 1)}, rörelseresultat ${f(KV.fy26.rorelse, 1)}, GAAP-netto ${f(KV.fy26.netto, 1)}, EPS ${f(KV.fy26.epsG, 2)} GAAP / ${f(KV.fy26.epsNG, 2)} justerad, fritt kassaflöde ${f(KV.fy26.fcf, 1)}.
- **Q1 FY2027 (20 maj 2026):** intäkt ${f(KV.q1fy27.intakt, 3)} (+${KV.q1fy27.qq} procent mot förra kvartalet, +${KV.q1fy27.yy} procent mot året före — slog guiden 78,0 med ${f(slagQ1, 1)} procent), Data Center ${f(KV.q1fy27.dc, 1)} (+${KV.q1fy27.dcyy} procent); GAAP-netto ${f(KV.q1fy27.netto, 3)} (+${KV.q1fy27.nettoyy} procent), GAAP-EPS ${f(KV.q1fy27.eps, 2)}, bruttomarginal ${pct(KV.q1fy27.bruttoG, 1)} GAAP / ${pct(KV.q1fy27.bruttoNG, 1)} justerad. Kapitalbesluten: utdelningen 0,01 → 0,25 dollar per kvartal, nytt återköpsprogram på ${KV.q1fy27.aterkopNytt} miljarder (på ${KV.q1fy27.aterkopKvar} kvarstående). Guide Q2: ${f(KV.q1fy27.guideQ2, 1)} ±2 procent.
- **Q2 FY2027 (26 augusti 2026):** intäkt ${f(KV.q2fy27.intakt, 3)} (+${KV.q2fy27.qq} procent mot förra kvartalet, +${KV.q2fy27.yy} procent mot året före — slog guiden ${f(KV.q1fy27.guideQ2, 1)} med ${f(slagQ2, 1)} procent och konsensus ~${f(KV.q2fy27.konsensus, 1)}), Data Center ${f(KV.q2fy27.dc, 2)} (+${KV.q2fy27.dcqq} procent mot förra kvartalet, +${KV.q2fy27.dcyy} procent mot året före — ${pct(dcAndel, 1)} av koncernintäkten); GAAP-netto ${f(KV.q2fy27.netto, 3)} (+${KV.q2fy27.nettoqq} procent mot förra kvartalet, +${KV.q2fy27.nettoyy} procent mot året före), GAAP-EPS ${f(KV.q2fy27.epsG, 2)} mot justerad ${f(KV.q2fy27.epsNG, 2)}, bruttomarginal ${pct(KV.q2fy27.brutto, 1)}, rekord i returnerat kapital: ${KV.q2fy27.retur} miljarder i kvartalet (utdelning + återköp).

Tre mönster att läsa kedjan efter. **Guide-slags-triaden:** tre kvartal i rad har bolaget slagit sin egen intäktsguide — ${f(slagQ1, 1)}, ${f(slagQ4, 1)} och ${f(slagQ2, 1)} procent — och Q3-guiden ${f(KV.q3guide.intakt, 1)} ±2 procent bär samma fråga: slagen håller eller trenden bryts. **Dubblingen som guidad:** ${f(KV.q3guide.intakt, 1)} mot ${f(KV.q3fy26.intakt, 1)} ett år tidigare = +${f(guideKvot, 1)} procent — kvartalet nästan dubbleras på årsbasis MEDAN bruttomarginalen guidades ned till ${pct(KV.q3guide.brutto, 1)} (±50 baspunkter) med förväntad botten ${KV.q3guide.bottenLo}–${KV.q3guide.bottenHi} procent i Q4 FY2027 innan återhämtning — bolagets egen förklaring är minneskomponentkostnader, och guiden antar inget Data Center-intäkt från Kina alls. **Nettoparadoxen i Q2:** intäkten +${KV.q2fy27.qq} procent mot förra kvartalet men GAAP-nettot bara +${KV.q2fy27.nettoqq} — kostnadssidan (forskning och utveckling) växer med affären; bruttomarginalens ${pct(KV.q2fy27.brutto, 1)} är oförändrad mot Q1, så trycket bor under bruttoraden. Hävstångsläxan från skogs- och byggpaketen, i megaskala: på guide-intäkten ${f(KV.q3guide.intakt, 1)} miljarder är varje bruttomarginalpunkt ${f(KV.q3guide.intakt / 100, 2)} miljarder dollar — från ${f(KV.q2fy27.brutto, 1)} till ${KV.q3guide.bottenLo} är ${f(resetKostnad, 1)} miljarder på ett kvartal, i nivå med hela Gaming-segmentets kvartalsintäkt.

## Så står sig bolaget mot branschen

Tillväxtgrenen i bolagsuniversumet: ${gren.length} bolag (AMD, Palantir, Tesla, Sea, Shopify, Mercado Libre, Adyen, CrowdStrike med flera), medianer räknade LIVE ur filen (n varierar med fältens täckning). Tabellen läses: NVIDIA-värde, grenens median, NVIDIA:s rang.

| Nyckeltal | NVIDIA | Grenens median | Rang |
|---|---|---|---|
| P/E | ${f(nv.vardering.pe, 1)} | ${f(M.pe, 1)} | ${R.pe.r}:e högst av ${R.pe.n} (${R.pe.n - R.pe.r + 1}:e lägst) |
| P/B | ${f(nv.vardering.pb, 2)} | ${f(M.pb, 2)} | ${R.pb.r}:e högst av ${R.pb.n} |
| EV/EBIT | ${f(nv.vardering.evEbit, 1)} | ${f(M.evEbit, 1)} | ${R.evEbit.n - R.evEbit.r + 1}:e lägst av ${R.evEbit.n} |
| PEG | ${f(nv.vardering.peg, 2)} | ${f(M.peg, 2)} | ${R.peg.r}:e lägst av ${R.peg.n} |
| FCF-avkastning | ${pct(nv.vardering.fcfYield * 100, 2)} | ${pct(M.fcfY * 100, 2)} | ${R.fcfY.n - R.fcfY.r + 1}:e lägst av ${R.fcfY.n} |
| ROE | ${pct(nv.lonksamhet.roe * 100, 1)} | ${pct(M.roe * 100, 1)} | ${R.roe.r}:a högst av ${R.roe.n} |
| ROIC | ${pct(nv.lonksamhet.roic * 100, 1)} | ${pct(M.roic * 100, 1)} | ${R.roic.r}:a högst av ${R.roic.n} |
| Bruttomarginal | ${pct(nv.lonksamhet.bruttoMarginal * 100, 1)} | ${pct(M.brutto * 100, 1)} | ${R.brutto.r}:e högst av ${R.brutto.n} |
| EBIT-marginal | ${pct(nv.lonksamhet.ebitMarginal * 100, 1)} | ${pct(M.ebit * 100, 1)} | ${R.ebit.r}:a högst av ${R.ebit.n} |
| Nettomarginal | ${pct(nv.lonksamhet.nettoMarginal * 100, 2)} | ${pct(M.netto * 100, 1)} | ${R.netto.r}:a högst av ${R.netto.n} |
| Skuld/eget kapital | ${f(nv.stabilitet.skuldEgenkapital, 2)} | ${f(M.skuldEk, 2)} | ${R.skuldEk.r}:e lägsta av ${R.skuldEk.n} |
| Intäktstillväxt TTM-fält | +${f(nv.tillvaxt.omsattningTillvaxtTTM * 100, 1)} % | +${f(M.ttm * 100, 1)} % | ${R.ttm.r}:a högst av ${R.ttm.n} |

Läsarten i tre rader: **grenens högsta lönsamhet till grenens lägsta vinstmultipel** — ROE, ROIC och nettomarginal alla etta, P/E tredje lägst; ingen annan rad i serien bär den kombinationen, och den är grenens prismekanik i ett stycke (tillväxtgrenen betalar för tillväxt; den som redan levererar lönsamhet prissätts på annat sätt — utbildningsfrågan att bära med sig, inte ett handlingsbeslut). **Bruttomarginalen ${pct(nv.lonksamhet.bruttoMarginal * 100, 1)} mot medianen ${pct(M.brutto * 100, 1)}** — och resets-guiden ${pct(KV.q3guide.brutto, 1)} närmar sig fortfarande medianen uppifrån: marginalernas tyngdläge. **Balansräkningen lugn** (skuldkvot under medianen) — ROE över ROIC kommer här inte från belåning utan från EK:ts snabba omlöp (källkritikens fönsterfynd), och radens not om ROIC som approximerad proxy (rörelseresultat före skatt delat på skuld plus bokfört eget kapital) redovisas öppet. Jämförelseklassen i grenen: halvledarkollegan AMD och mjukvarukollegan Palantir, plattformarna Adyen och Shopify, tillväxtveteranerna Tesla och Mercado Libre — NVIDIA är tornet mitt i grenen. [Universumjämförelsen i sin helhet](/dataset/tillvaxt/universumjamforelse) visar alla lager.

## Tre sätt att läsa utfallet — övningar i metod

**Övning ett — fönstrets rotation och P/E-brytpunkterna.** Rullande GAAP-EPS är ${f(rullEPS, 2)} dollar (P/E ${f(nv.vardering.pe, 1)}); efter Q3-rapporten rullar Q3-FY2026:s ${f(KV.q3fy26.eps, 2)} UR och det nya kvartalets EPS rullar IN. Brytpunkterna: för att P/E ska sjunka till 25 krävs rullande ${f(bryt25, 2)} dollar, alltså Q3-EPS ${f(x25, 2)} — UNDER förra kvartalets 2,46; för P/E 22 krävs ${f(x22, 2)}. Det är övningens kärna: en del av vinsttillväxten är mekaniskt inbakad i fönstrets rotation — upprepar EPS bara förra kvartalets nivå sjunker P/E automatiskt (se scenariorutan), och guiden ${f(KV.q3guide.intakt, 1)} miljarder (+${f(guideQQ, 1)} procent mot förra kvartalet i spannets mitt) gör upprepning till ett lågt golv — medan marginalresetsen äter en bit. Kontrollen att bära in i rapporten: bolagets CFO-commentary redovisar alltid både GAAP- och non-GAAP-bryggan — läs den före rubriken, och minns källkritikens fjärde fynd om vilken värld som är vilken.

**Övning två — identitetstestets tre egetkapital och EV-imperativet.** Tre väger: P/B-vägen ger slut-EK ${f(mcap, 1)} / ${f(nv.vardering.pb, 3)} = ${f(ekSlut, 1)} miljarder (${f(ekSlut / aktierGrund, 2)} dollar per aktie på ${f(aktierGrund, 3)} miljarder aktier); ROE-vägen ger medel-EK ${f(rullNetto, 3)} / 1,1721 = ${f(ekMedel, 1)} miljarder; skillnaden ${pct(ekTillv, 1)} är återinvesteringens spår under fönstret — FY2026:s netto ${f(KV.fy26.netto, 1)} miljarder mot slut-EK ${f(ekSlut, 1)} är +52 procent potentiell EK-tillväxt per år om inget returnerades; återköpen (kvartalsfart ${KV.q2fy27.retur} miljarder) och utdelningen bromsar. ROE-kontrollen med båda nämnarna: ${f(rullNetto, 3)} / ${f(ekMedel, 1)} = ${pct(nv.lonksamhet.roe * 100, 2)} (fältets tal — medel-EK-vägen, där medel-EK är härledd ur fältet självt: provet visar kompatibilitet, inte oberoende bevis) och ${f(rullNetto, 3)} / ${f(ekSlut, 1)} = ${pct(roeSlutEk, 2)} på dagens slut-EK — två riktiga ROE med olika nämnare, och skillnaden mellan dem ÄR fönsterläxan. EV-sidan är ett imperativ, inte en rapporterad kedja (Tele2-precedensen, luckan redovisas öppet): EBIT TTM = ${pct(nv.lonksamhet.ebitMarginal * 100, 2)} × ${f(ttmIntakt, 3)} = ${f(ebitTtm, 1)} miljarder; EV = ${f(nv.vardering.evEbit, 3)} × ${f(ebitTtm, 1)} = ${f(ev, 0)} miljarder — ${f(nettokassa, 0)} miljarder UNDER marknadsvärdet ${f(mcap, 1)}: EV-fältet implicerar en nettokassa på cirka ${f(nettokassa, 0)} miljarder dollar (kassa över räntebärande skuld). Härlett imperativ, inte rapporterad post — men fullt konsistent med utdelnings- och återköpsmaskinen som kapitalkälla, och med aktieantalet: utspädda aktier ur EPS-vägen ${f(KV.q2fy27.netto, 3)} / 2,46 = ${f(aktierUtspadd, 3)} miljarder mot marknadsvärdets ${f(aktierGrund, 3)} — återköpen syns i differensen.

**Övning tre — PEG:s tre nämnare.** Fältet säger PEG ${f(nv.vardering.peg, 2)}: P/E ${f(nv.vardering.pe, 3)} delat med det implicerar tillväxt ${f(pegFaltN, 1)} procent per år. Konventionens nämnare — radens konsensusfält, prognostillväxten +${f(nv.tillvaxt.prognosTillvaxt * 100, 2)} procent — ger PEG ${f(pegKonv, 3)}. Och kvartalsfältets +${f(nv.tillvaxt.omsattningTillvaxtTTM * 100, 1)} procent ger ${f(pegKvart, 3)}. Tre PEG på samma kurs — ${f(nv.vardering.peg, 2)}, ${f(pegKonv, 3)} och ${f(pegKvart, 3)} — och ingen är fel i sig, de mäter olika fönster av samma tillväxt. Läxan från Verizon- och MTG-paketet förlängs till sin renaste form: räkna PEG själv, från en tillväxtdefinition du kan försvara (EPS-tillväxt? intäktstillväxt? vilket fönster?), och redovisa nämnaren — ett PEG utan nämnare är tre tal att välja mellan, inte ett mått.

**Scenariorutan** — metod, inte prognos: basen är bolagets egen Q3-guide ${f(KV.q3guide.intakt, 1)} ±2 procent, tre intäktslägen mot tre GAAP-nettomarginaler (58 procent djup reset under kedjans rullande ${pct(rullNettoM, 1)}; 61 procent mitt; 64 procent över rullande fönster). Cellerna: netto (miljarder dollar), EPS (dollar), nytt rullande P/E på kursen ${f(pris, 2)}.

| Intäkt → marginal ↓ | Guide-låg (${f(scInt[0], 2)} mdr) | Guide-mitt (${f(scInt[1], 1)} mdr) | Guide-hög (${f(scInt[2], 2)} mdr) |
|---|---|---|---|
| **58 %** | ${f(sc[0][0].netto, 1)} · ${f(sc[0][0].eps, 2)} · ${f(sc[0][0].pe, 1)} | ${f(sc[0][1].netto, 1)} · ${f(sc[0][1].eps, 2)} · ${f(sc[0][1].pe, 1)} | ${f(sc[0][2].netto, 1)} · ${f(sc[0][2].eps, 2)} · ${f(sc[0][2].pe, 1)} |
| **61 %** | ${f(sc[1][0].netto, 1)} · ${f(sc[1][0].eps, 2)} · ${f(sc[1][0].pe, 1)} | ${f(sc[1][1].netto, 1)} · ${f(sc[1][1].eps, 2)} · ${f(sc[1][1].pe, 1)} | ${f(sc[1][2].netto, 1)} · ${f(sc[1][2].eps, 2)} · ${f(sc[1][2].pe, 1)} |
| **64 %** | ${f(sc[2][0].netto, 1)} · ${f(sc[2][0].eps, 2)} · ${f(sc[2][0].pe, 1)} | ${f(sc[2][1].netto, 1)} · ${f(sc[2][1].eps, 2)} · ${f(sc[2][1].pe, 1)} | ${f(sc[2][2].netto, 1)} · ${f(sc[2][2].eps, 2)} · ${f(sc[2][2].pe, 1)} |

Vikterna att minnas: hela rutan landar P/E ${f(sc[2][2].pe, 1)}–${f(sc[0][0].pe, 1)} mot dagens ${f(nv.vardering.pe, 1)} — **fönstrets rotation gör hela jobbet vid i princip oförändrade marginaler**, det är övning ett igen, nu i nio celler. Marginaltickaren: varje netto-marginalpunkt på guide-mitt är ${f(KV.q3guide.intakt / 100, 2)} miljarder = ${f(marginalTick, 3)} dollar i EPS; hela reset-spannet 64 → 58 procent flyttar EPS ${f((0.64 - 0.58) * KV.q3guide.intakt / aktierUtspadd, 2)} dollar. Och intäktssidan: guide-spannet ±2 procent är ±${f(KV.q3guide.intakt * 0.02, 1)} miljarder = ${f(KV.q3guide.intakt * 0.02 / aktierUtspadd, 2)} dollar per aktie — marginalfrågan är tre gånger större än intäktsfrågan i den här rutan.

## Praktiskt inför tisdagen 17 november — Q3 FY2027

Tre saker att göra före rapporten, i fallande ordning. **Först: boka bevakningspunkten** — [investor.nvidia.com](https://investor.nvidia.com) (IR-kalendern, webcast och CFO-commentary publiceras där; tredjepartskonfirmansen 17/11 AMC gäller tills bolaget själv bekräftar — datumklassen rapporteras upp när det sker). **Andra: bygg dina fönster innan rapporten** — rullande GAAP-EPS ${f(rullEPS, 2)} dollar med brytpunkterna ${f(x25, 2)} (för P/E 25) och ${f(x22, 2)} (för P/E 22), samt GAAP- och non-GAAP-världarna åtskilda från dag ett (källkritikens fjärde fynd). **Tredje: de tre talen att läsa först** — intäkten mot guiden ${f(KV.q3guide.intakt, 1)} ±2 (guide-slags-triaden ${f(slagQ1, 1)}/${f(slagQ4, 1)}/${f(slagQ2, 1)} procent: slagen håller eller trenden bryts), bruttomarginalen mot ${pct(KV.q3guide.brutto, 1)} ±50 baspunkter (och Q4-vägledningens botten ${KV.q3guide.bottenLo}–${KV.q3guide.bottenHi} — minneskostnadsförklaringen att följa), och Data Center-andelen (${pct(dcAndel, 1)} i Q2 — koncentrationen mot en kundkrets är rapportens röda tråd). Bakom dem: Kina-noten (guiden antar noll Data Center-intäkt från Kina — en exogen variabel som inte bor i multipeln), kapitalåterföringstakten (${KV.q2fy27.retur} miljarder i kvartalsfart mot utdelningen ${f(utdAr, 2)} dollar om året — EPS-vippan från återköpen), och aktieantalet (${f(aktierUtspadd, 3)} miljarder utspädda — varje procent återköpt lyfter EPS mekaniskt). [Ordlistan](/kurser) och [transparensen](/transparens) förklarar metodens delar; [källöversikten](/kallor) redovisar hela underlaget.

## Källor

- **Universumraden NVDA** — [bolagsunivers.json](/dataset/tillvaxt/universumjamforelse), hämtad 2026-09-03 (Yahoo Finance med MarketStack-dubbelkoll av pris, P/E, P/B och marknadsvärde — slutkurs 2026-09-02; filens md5 6e540c87): alla värderings-, lönsamhets- och serietal; radens egna noter (ROIC-proxy, fyra räkenskapsår i serierna) redovisas i texten.
- **Bolagets egna rapporter** — [nvidianews.nvidia.com](https://nvidianews.nvidia.com) och [investor.nvidia.com](https://investor.nvidia.com): Q3 FY2026 (2025-11-19), Q4/FY2026 (2026-02-25), Q1 FY2027 (2026-05-20), Q2 FY2027 (2026-08-26) med CFO-commentary och Q3-guiden 108,0 ±2 procent.
- **Rappdagen** — Wall Street Horizon (tisdagen 2026-11-17, after market close) och MarketChameleon (samma dag, AMC): tredjepartskonfirmerad datumklass, sökverifierad 2026-09-22; bolagets egen kalender ännu utan Q3-post när detta skrivs.
- **Kapitalåterföringen** — kvartalsreleaserna (utdelningshöjningen 0,01 → 0,25 dollar och programmen 80 + 39 miljarder; ${KV.q2fy27.retur} miljarder returnerade i Q2); analytikerprognoser om framtida återföringar (~115 respektive ~230 miljarder dollar 2026/2027, Yahoo Finance-citerad analys) är tredjepartsprognoser och redovisas som sådana.
- **Kvartalsdetaljer sökverifierade 2026-09-22** — NVIDIA newsroom och IR via sök, CNBC, StockTitan, Yahoo Finance; divergenser mellan fält (TTM-mätet, FCF-fönstret, EPS-världarna) redovisas öppet i källkritiken.

Rygraden i detta paket är aritmetiken: varje tal i texten är antingen rapporterat av bolaget, hämtat ur universumets insamling (med dess enskilda-källnot redovisad), sökverifierat hos namngiven tredjepart, eller beräknat ur de tre — och beräkningsvägen redovisas, härledda imperativ inklusive. Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).`;

const title = `NVIDIA Q3-rapport 2026: så läser du den — P/E 28,4 på grenens högsta ROE (kvartalskedjan som återvinner P/E-fältet: EPS 1,30+1,76+2,39+2,46 = ${f(rullEPS, 2)} dollar ⇒ ${f(pris, 2)}/${f(rullEPS, 2)} = ${f(peKedja, 1)}), guiden 108 miljarder (+${f(guideKvot, 1)} procent på årsbasis) mot marginalresetsen 75,0 → 74,0 → botten 71–72, och EPS-världarna omvända (GAAP 2,46 över justerat 2,22) — rappdagen tisdagen 17 november (tredjepartskonfirmerad)`;

const description = `NVIDIA (NVDA, NASDAQ) — halvledarjätten, ${f(mcap, 1)} miljarder dollar i börsvärde — rapporterar Q3 FY2027 (kalender-Q3 i brutet räkenskapsår) tisdagen 17 november 2026 efter amerikansk stängning enligt Wall Street Horizon och MarketChameleon. Läspaketet: kvartalskedjan 57,0 → 68,1 → 81,6 → 96,2 miljarder dollar som återvinner P/E-fältet (rullande EPS ${f(rullEPS, 2)} dollar ger P/E ${f(peKedja, 1)} mot fältets ${f(nv.vardering.pe, 1)}); guide-hissen 108,0 ±2 miljarder (+${f(guideKvot, 1)} procent mot fjolårets Q3) samtidigt som bruttomarginalen guidades ned mot botten 71–72 procent (minneskostnader, noll Kina-antagande); EPS-världarna omvända — GAAP 2,46 dollar över justerat 2,22 — och identitetstestet som faller 29 procent utan att ett tal är fel (fönstrens geometri). Tillväxtgrenens paradox: billigaste P/E-kvartilen på grenens högsta ROE 117,2, ROIC 74,9 och nettomarginal 63,7 procent. Allt som utbildning, aldrig råd.`;

const paket = {
  slug: 'sa-laser-du-nvda-q3-2026',
  title, description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-11-17',
  readingMinutes: Math.max(3, Math.round(body.trim().split(/\s+/).length / 600)),
  tags: ['kvartalsrapport', 'NVIDIA', 'tillväxt', 'USA', 'halvledare', 'läspaket'],
  body: body.trimEnd()
};

fs.writeFileSync(PAKET, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', PAKET);
console.log('ord:', paket.body.trim().split(/\s+/).length, '| rm:', paket.readingMinutes,
  '| desc-tecken:', description.length, '| H2:', (body.match(/^## /gm) || []).length);
console.log('kontroller: rullEPS', rullEPS.toFixed(3), '| peKedja', peKedja.toFixed(3),
  '| peGap %', peGap.toFixed(3), '| nettomarg', rullNettoM.toFixed(2), '| scenario-P/E-spann',
  sc[2][2].pe.toFixed(1), '–', sc[0][0].pe.toFixed(1));
