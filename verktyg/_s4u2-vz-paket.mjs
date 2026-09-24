#!/usr/bin/env node
// _s4u2-vz-paket.mjs — byggmotor för Verizon Q3-2026-läspaketet (spår 4, s4-u2).
// Läser bolagsuniversumet + forskningsbiblioteket, räknar ALLA tal i texten,
// skriver paket-JSON + beräkningsdump. ABORT-grindar: NaN/null/Infinity, EV-kedje-klyfta > 5 %.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const U = JSON.parse(readFileSync('/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json', 'utf8'));
const B = JSON.parse(readFileSync('/home/ak1a/AK1/data/forskningsbiblioteket/VZ.json', 'utf8'));
const V = U.find(b => b.ticker === 'VZ');
if (!V) { console.error('ABORT: VZ-rad saknas i universumet'); process.exit(1); }

const gren = U.filter(b => b.bransch === 'kommunikation');
const nGren = gren.length;
const nUniv = U.length;
const metaRad = gren.find(b => b.ticker === 'META');
if (!metaRad) { console.error('ABORT: META saknas i grenen'); process.exit(1); }

// — median/rang-hjälpare (live ur samma fil som texten hänvisar till) —
function med(arr) { const v = arr.filter(x => x !== null && x !== undefined).sort((a, b) => a - b); const n = v.length; return n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2; }
function rangBotten(f) { const a = gren.map(b => ({ t: b.ticker, v: f(b) })).filter(x => x.v !== null && x.v !== undefined).sort((x, y) => x.v - y.v); return { n: a.length, pos: a.findIndex(x => x.t === 'VZ') + 1 }; }
const P = 100; // procentform

// — universumfält —
const f = {
  pe: V.vardering.pe, pb: V.vardering.pb, evEbit: V.vardering.evEbit, peg: V.vardering.peg, fcfY: V.vardering.fcfYield,
  roe: V.lonksamhet.roe, roic: V.lonksamhet.roic, brutto: V.lonksamhet.bruttoMarginal, ebitM: V.lonksamhet.ebitMarginal,
  nettoM: V.lonksamhet.nettoMarginal, fcfM: V.lonksamhet.fcfMarginal, skuldEk: V.stabilitet.skuldEgenkapital,
  ttm: V.tillvaxt.omsattningTillvaxtTTM, prognos: V.tillvaxt.prognosTillvaxt, revCagr: V.tillvaxt.omsattningCAGR5ar, resCagr: V.tillvaxt.resultatCAGR5ar,
};
for (const [k, v] of Object.entries(f)) if (v === null || v === undefined || Number.isNaN(v)) { console.error('ABORT: fält ' + k + ' NaN/null'); process.exit(1); }
const g = (fn) => med(gren.map(fn));
const u = (fn) => med(U.map(fn));
const r = {
  pe: rangBotten(b => b.vardering.pe), pb: rangBotten(b => b.vardering.pb), evEbit: rangBotten(b => b.vardering.evEbit),
  peg: rangBotten(b => b.vardering.peg), fcfY: rangBotten(b => b.vardering.fcfYield), roe: rangBotten(b => b.lonksamhet.roe),
  roic: rangBotten(b => b.lonksamhet.roic), brutto: rangBotten(b => b.lonksamhet.bruttoMarginal), ebitM: rangBotten(b => b.lonksamhet.ebitMarginal),
  nettoM: rangBotten(b => b.lonksamhet.nettoMarginal), fcfM: rangBotten(b => b.lonksamhet.fcfMarginal), skuldEk: rangBotten(b => b.stabilitet.skuldEgenkapital),
  ttm: rangBotten(b => b.tillvaxt.omsattningTillvaxtTTM), prognos: rangBotten(b => b.tillvaxt.prognosTillvaxt), revCagr: rangBotten(b => b.tillvaxt.omsattningCAGR5ar), resCagr: rangBotten(b => b.tillvaxt.resultatCAGR5ar),
};

// — basbelopp —
const pris = V.pris, mcap = V.marknadsKapitalMdr;
const epsFalt = pris / f.pe;                      // implicit rullande EPS ur fältet
const nettoFalt = mcap / f.pe;                    // rullande netto ur fältet (mdr)
const ebitFalt = nettoFalt * (f.ebitM / f.nettoM);// rullande EBIT härlett via marginalkvoten
const evVarde = f.evEbit * ebitFalt;              // EV ur värderingsmultipeln
const ekFalt = mcap / f.pb;                       // bokfört EK ur P/B
const skuldKvot = f.skuldEk * ekFalt;             // skuld ur skuld/EK × EK
const evBalans = mcap + skuldKvot;                // EV ur balansräkningsvägen
const nettoSkuldPek = evVarde - mcap;             // nettoskuldpekare
const evKvotMCap = evVarde / mcap;
const balansKlyfta = Math.abs(evVarde - evBalans) / evBalans;

// — kvartalskedjor (sökverifierade 2026-09-21; härledda poster markerade) —
const gaapK = [1.17, 0.44, 1.22, 0.92];           // Q3-25, Q4-25 (härlemt ur FY 4,06 − 9M 3,62), Q1-26 (härlemt 5,15/4,23), Q2-26
const justK = [1.21, 1.09, 1.28, 1.30];
const sum = a => a.reduce((x, y) => x + y, 0);
const gaapSum = sum(gaapK), justSum = sum(justK);
const paritet = (epsFalt - gaapSum) / gaapSum;    // fält mot GAAP-kedja
const peGaap = pris / gaapSum, peJust = pris / justSum;
const gapJust = justSum - gaapSum;                // dollar/aktie
const gapJustPct = gapJust / justSum;
const peKonv = f.pe / (f.prognos * P);            // PEG-konventionen (procentenheter)
const pegKvot = f.peg / peKonv;
const implicitTillv = f.pe / f.peg / P;           // källans PEG omvänt: tillväxt i procent

// — utdelning & FCF —
const utdKv = 0.7075, utdAr = utdKv * 4;          // 20:e årliga höjningen jan 2026
const direkt = utdAr / pris;
const aktierFY = 17.174 / 4.06;                   // mdr aktier ur FY25-netto/EPS
const utdBudget = utdAr * aktierFY;               // mdr/år
const fcfAr = f.fcfM * 138.191;                   // års-FCF ur marginal × 2025-omsättning
const utdTack = utdBudget / fcfAr;

// — årsserier —
const oms = [136.835, 133.974, 134.788, 138.191], res = [21.256, 11.614, 17.506, 17.174];
const revCagrKontroll = Math.pow(oms[3] / oms[0], 1 / 3) - 1;
const resCagrKontroll = Math.pow(res[3] / res[0], 1 / 3) - 1;
const omsTotal = oms[3] / oms[0] - 1, resTotal = res[3] / res[0] - 1;
const dip23 = res[1] / res[0] - 1, at24 = res[2] / res[1] - 1, res25 = res[3] / res[2] - 1;

// — scenarioruta på 2025-basen —
const basInt = 138.191, basMarg = f.ebitM;
const basEbit = basInt * basMarg;
const vol = [-0.03, 0, 0.03].map(d => basInt * (1 + d));
const marg = [basMarg - 0.01, basMarg, basMarg + 0.01];
const cell = (i, m) => vol[i] * marg[m];
const volPris = basInt * 0.01, margPris = basInt * 0.01, volEbit = basInt * 0.01 * basMarg, kvot = margPris / volEbit;

// — guide-aritmetik —
const guide = [4.99, 5.04], h1 = justK[2] + justK[3];
const q3est = 1.28;                                // Public.com-konsensus
const q4Impl = [guide[0] - h1 - q3est, guide[1] - h1 - q3est];
const q4Tillv = [q4Impl[0] / justK[1] - 1, q4Impl[1] / justK[1] - 1];

// — seriekoordinater (omräknas vid varje körning — Disney-lektionen) —
// KOLLISION 2026-09-21 22:49: syskon u3:s klaim 22:49:02 kom 2:06 efter denna agents
// 22:46:56 (klaim-mtime äger — Newmont-precedensen) men deras duplikatfil
// sa-laser-du-verizon-q3-2026.json (slug 'verizon', avvikande från seriekonventionen)
// skrevs 22:58:12; den räknas INTE in i serien — deras yta lämnas untracked åt dem.
const paDisk = readdirSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3')
  .filter(x => x.startsWith('sa-laser-du-') && x.endsWith('.json') && x !== 'sa-laser-du-verizon-q3-2026.json' && x !== 'sa-laser-du-vz-q3-2026.json').length;
const serienNr = paDisk + 1;

// — beräkningsdump för KVD —
const dump = {
  genererad: new Date().toISOString(), ticker: 'VZ', paDiskFore: paDisk, serienNr,
  f, rang: r, grenMedian: { pe: g(b => b.vardering.pe), pb: g(b => b.vardering.pb), evEbit: g(b => b.vardering.evEbit), peg: g(b => b.vardering.peg), fcfY: g(b => b.vardering.fcfYield), roe: g(b => b.lonksamhet.roe), roic: g(b => b.lonksamhet.roic), brutto: g(b => b.lonksamhet.bruttoMarginal), ebitM: g(b => b.lonksamhet.ebitMarginal), nettoM: g(b => b.lonksamhet.nettoMarginal), fcfM: g(b => b.lonksamhet.fcfMarginal), skuldEk: g(b => b.stabilitet.skuldEgenkapital), ttm: g(b => b.tillvaxt.omsattningTillvaxtTTM), prognos: g(b => b.tillvaxt.prognosTillvaxt), revCagr: g(b => b.tillvaxt.omsattningCAGR5ar), resCagr: g(b => b.tillvaxt.resultatCAGR5ar) },
  univMedian: { pe: u(b => b.vardering.pe), pb: u(b => b.vardering.pb), evEbit: u(b => b.vardering.evEbit), peg: u(b => b.vardering.peg), fcfY: u(b => b.vardering.fcfYield), roe: u(b => b.lonksamhet.roe), roic: u(b => b.lonksamhet.roic), brutto: u(b => b.lonksamhet.bruttoMarginal), ebitM: u(b => b.lonksamhet.ebitMarginal), nettoM: u(b => b.lonksamhet.nettoMarginal), fcfM: u(b => b.lonksamhet.fcfMarginal), skuldEk: u(b => b.stabilitet.skuldEgenkapital), ttm: u(b => b.tillvaxt.omsattningTillvaxtTTM), prognos: u(b => b.tillvaxt.prognosTillvaxt), revCagr: u(b => b.tillvaxt.omsattningCAGR5ar), resCagr: u(b => b.tillvaxt.resultatCAGR5ar) },
  nGren, nUniv,
  harledda: { pris, mcap, epsFalt, nettoFalt, ebitFalt, evVarde, ekFalt, skuldKvot, evBalans, nettoSkuldPek, evKvotMCap, balansKlyfta, gaapSum, justSum, paritet, peGaap, peJust, gapJust, gapJustPct, peKonv, pegKvot, implicitTillv, utdKv, utdAr, direkt, aktierFY, utdBudget, fcfAr, utdTack, revCagrKontroll, resCagrKontroll, omsTotal, resTotal, dip23, at24, res25, basEbit, kvot, h1, q4Impl, q4Tillv, guide, q3est },
  scenarie: { vol, marg, celler: [0, 1, 2].map(i => [cell(i, 0), cell(i, 1), cell(i, 2)]) },
  kvartal: { gaapK, justK },
};
for (const [k, v] of Object.entries(dump.harledda)) {
  const flat = Array.isArray(v) ? v : [v];
  for (const x of flat) if (x === null || x === undefined || Number.isNaN(x) || !Number.isFinite(x)) { console.error('ABORT: härlett tal ' + k + ' = ' + x); process.exit(1); }
}
if (balansKlyfta > 0.05) { console.error('ABORT: EV-kedjan stänger inte (klyfta ' + (balansKlyfta * 100).toFixed(2) + ' %)'); process.exit(1); }

// — svenska talformaterare —
const T = (x, d = 2) => x.toLocaleString('sv-SE', { minimumFractionDigits: d, maximumFractionDigits: d });
const PCT = (x, d = 2) => T(x * P, d);
const pbT = T(f.pb, 3); // "2,008" — P/B redovisas med tre decimaler enligt seriekonventionen

const body = `Verizon — telekomjätten som bär hela USA:s mobilnät plus ett växande fibernät, noterad som VZ på NYSE — rapporterar kalenderkvartalet juli–september 2026 i slutet av oktober: bokningen här står på **onsdagen 28 oktober** (tredjepartsestimat, obekräftat; fjolårets Q3 kom onsdagen 29 oktober 2025). Och detta paket är seriens sista öppna objekt i analysbiblioteket: med Verizon på disk har vartenda biblioteksbolag sitt Q3-läspaket — härmed är urvalskedjan för denna rapportsäsong slutförd, och nästa omgång börjar med nästa vågvalidering. Bolaget som avslutar serien gör det med seriens mest stillastående intäkter: omsättningen flyttade sig ${PCT(omsTotal, 1)} procent på fyra räkenskapsår (${T(oms[0], 1)} → ${T(oms[3], 1)} miljarder dollar), resultatet föll ${PCT(Math.abs(resCagrKontroll), 2)} procent per år från ${T(res[0], 1)} till ${T(res[3], 1)} miljarder — och ändå betalar aktien ${T(f.pe)} gånger vinsten medan kassan rinner: fri kassaflödesavkastning ${PCT(f.fcfY)} procent och en utdelning som höjts tjugo år i rad. Stillastående är inte samma sak som stilla — men det är samma metodfråga som hela serien övat på: vad betalar man för, och vilken siffra bär svaret? Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är kommunikationgrenens sjätte på disk — AT&T, Tele2, Telia, Meta och Disney före — och seriens ${serienNr}:e läspaket totalt, samt det sista objektet ur analysbibliotekets urvalsgrund (vågvalidering 2026-09-03). Verizons uppgift i serien är att visa hur man läser ett bolag där **balansräkningen väger mer än resultaträkningen rör sig**: skuldsättningsgraden ${T(f.skuldEk)} är grenens tredje högsta av ${r.skuldEk.n}, företagsvärdet ligger ${T(evKvotMCap)} gånger över börsvärdet — och Frontier-förvärvet på omkring 20 miljarder dollar, tillträtt 20 januari 2026, sitter i båda. Disney-paketet (föregångaren) var vinsttrappan på stilla intäkter; Verizon är spegelbilden: stilla intäkter, ingen trappa — men en kassa som betalar utdelningen, nätbygget och räntan samtidigt. Tre telekomläspaket har serien redan (AT&T, Tele2, Telia); detta är det första som bär ett stort förvärv inne i kvartalskedjan.

## Urvalet: varför Verizon är seriens sista biblioteksobjekt

Sorteringen redovisas öppet, som alltid: tidigaste återstående rappdagen med bärande universumdata. Läget vid paketets klaim (2026-09-21 22:46 lokal, klaimfil skriven disk-först före all sökverifiering enligt META-läxan): könoterna i Palantir-, Chevron- och Disney-paketen listar alla samma rest — "VZ datumlöst" — och med Disney levererat samma dag står Verizon ensamt kvar som analysbibliotekets sista olevererade objekt. FIFO bland återstående med exakt ett objekt är inget race: urvalet var bestämt redan vid omgångens start, och klaimfilen (data/vakten/klaim-s4u2-vz-q3-2026.md) dokumenterar att syskonbyggen i samma manifest inte kan välja något annat biblioteksobjekt. Med detta paket på disk är nästa omgångs urval åter hänvisat till vågvalideringens nästa tillskott — gallrorna för tidigare kandidater (Netflix, Billerud, Diös, Equinor, Shell med flera) står kvar oförändrade i sina paket.

Sedan P&G-raden, som alltid: datumklassen redovisas ärligt. Verizon har **ingen egen utlysning publicerad** vid paketets byggtid (2026-09-21). Tredjepartskalandrarna divergerar: Public.com bokar 28 oktober med EPS-estimat 1,28 dollar, MarketBeat estimerar 20 oktober på historisk rytm, MarketChameleon ger fönstret 23–28 oktober — och fjolårets Q3 kom onsdagen 29 oktober 2025 med telefonkonferens 08:30 ET. Årets rytm: fredag 30 januari, måndag 27 april, fredag 24 juli — ingen rak veckodagskedja, men oktober-onsdagen är fjolårsmönstret och slutet av MarketChameleons fönster. Grenkalendern (kalender-kommunikation.json, hämtad 2026-09-15) redovisar hela estimatfönstret 19–28 oktober öppet. Klassen är estimerat-obekräftat-med-fjolårets-mönster — kommer bolagets utlysning med annat datum är det nya rader i det öppna kvittot, inget annat. Verizon rapporterar i kalenderår (inget brutet räkenskapsår) — Q3 2026 är kalenderkvartalet juli–september, seriens egen titelkonvention utan asterisker den här gången; den enda kalendernoten istället: Frontier tillträdde 20 januari 2026, så kvartalskedjans jämförelser bär förvärvet från och med Q1 2026.

Datakärnan bär. Universumraden för VZ (hämtdatum 2026-09-03, dubbelkällad Yahoo Finance och MarketStack med slutkurs 2026-09-02) har full värderingsrad, full lönsamhetstrappa och fyra sammanhängande räkenskapsår i både omsättning och resultat — postens egna fotnoter (fyra år inte fem, ROIC som approximerad proxy, räntetäckning osatt, moat-fält tomma) redovisas öppet i källkritiken. Biblioteksposten från 2026-09-04 ger modellagets dom: **gul status** med datatackning ${T(B.urval.datatackning, 4)} och AKM1-poäng ${T(B.akm1.totalt, 1)} av ${T(B.akm1.maxMojligt, 1)} möjliga — värdering starkaste kategorin (${T(B.akm1.perKategori.vardering, 2)} av 5 — precis som Meta, Alphabet och Disney i samma gren), katalysatorn svagast (0 av 5 — rappdagen ÄR katalysatorn, seriens stående gren-not). Toppmotiveringarna är paketets ryggrad: intäktsstabilitet 5 av 5 (intäktsvolatilitet σ(yoy) 1,9 procent — bland det lugnaste universumet mätt) och kassatäckning 5 av 5 (FCF-marginal positiv, själfinansierande). Bottenmotiveringarna är ryggradens andra sida: skuldsättningsgrad 2 av 5 (kvoten ${T(f.skuldEk)}), ROE 2 av 5 och försäljningstillväxt 2 av 5. Ett bolag med lugnast tänkbara intäkter och tjugoårig utdelningstradition — och en balansräkning som bär nätet. Rappdagen är platsen där den geometrin får nytt material: första hela kalenderhalvåret med Frontier inne.

## Nyckeltalen att ha med sig — nätets ränta, kassans takt

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom kommunikationsbranschen. En varningsflagga hissas direkt: mätfönstret är rullande tolv månader fram till insamlingen — juli 2025 till augusti 2026 med Q2 2026 som sista rapporterade kvartal. Fönstret bär alltså Frontier från och med 20 januari 2026 men inga Frontier-jämförelsetal för hösten 2025 — varje årspå-årstal i kedjan nedan är en blandräkning av med och utan förvärv, och det redovisas öppet.

**Värdering — billig på allt utom kassan**

- Pris per vinst (P/E): **${T(f.pe)}** — [P/E inom kommunikation](/dataset/kommunikation/pe). Sjunde lägsta av ${r.pe.n} mätbara i grenen, under medianen ${T(g(b => b.vardering.pe))} och universumets ${T(u(b => b.vardering.pe))}. Men läs nämnaren först: fältets implicita rullande EPS är ${T(epsFalt)} dollar, och bolagets justerade kedja landar på ${T(justSum)} — gapet är paketets andra signatur, se källkritiken. Tre P/E-vägar: ${T(f.pe)} på fältet, ${T(peGaap)} på GAAP-kedjan, ${T(peJust)} på den justerade.
- Pris per bokfört eget kapital (P/B): **${pbT}** — [P/B inom kommunikation](/dataset/kommunikation/pb) — nionde lägsta av ${r.pb.n}, under medianen ${T(g(b => b.vardering.pb))} och universumets ${T(u(b => b.vardering.pb))}. Men bokfört eget kapital är bara ${T(ekFalt, 1)} miljarder i en balansräkning där skulden är ${T(skuldKvot, 1)} miljarder — P/B mäter ägarsidan av en tvättbräda, inte brädan.
- Enterprise value per rörelseresultat (EV/EBIT): **${T(f.evEbit)}** — [EV/EBIT inom kommunikation](/dataset/kommunikation/ev-ebit) — sjunde lägsta av ${r.evEbit.n}, under medianen ${T(g(b => b.vardering.evEbit))} och universumets ${T(u(b => b.vardering.evEbit))}. Här är telekomlektyren: företagsvärdet ${T(evVarde, 0)} miljarder är ${T(evKvotMCap)} gånger börsvärdet ${T(mcap, 1)} — varje EV-multipel på denna aktie bär ${T(nettoSkuldPek, 0)} miljarder i nettoskuldpekare (källkritiken stänger kedjan mot balansräkningen).
- Fri kassaflödesavkastning (FCF-yield): **${PCT(f.fcfY)} procent** — [så räknas FCF-avkastningen](/dataset/kommunikation/fcf-avkastning) — tionde högst av ${r.fcfY.n} mot medianen ${PCT(g(b => b.vardering.fcfYield))} och universumets ${PCT(u(b => b.vardering.fcfYield))}. Grenens kassastarka halva — och utdelningens finansiering: års-FCF ur marginalen är ${T(fcfAr, 1)} miljarder mot en utdelningsbudget på ${T(utdBudget, 1)} miljarder = ${PCT(utdTack, 1)} procent av kassan.
- PEG-talet: källan anger **${T(f.peg)}** (sjunde lägsta av ${r.peg.n} mätbara, median ${T(g(b => b.vardering.peg))}). Konventionen (P/E delat med prognostillväxtens absolutbelopp i procentenheter) ger ${T(f.pe)} delat med ${T(f.prognos * P, 2)} — det är **${T(peKonv)}**, och kvoten mellan källans och konventionens tal är ${T(pegKvot, 2)}. Detta är seriens största PEG-klyfta hittills — Disney-paketets 0,985 var nästan paritet, Chevron stängde av sitt mått, Palantir och Meta redovisade 0,50-klassens luckor — och förklaringen sitter i tillväxttalet: källans PEG antyder en implicit tillväxt på ${PCT(implicitTillv, 1)} procent mot prognosfältets ${PCT(f.prognos, 2)}. Två världar i samma tal: fem procents konsensustillväxt i nämnaren — eller källans egna längre horisont. PEG är här köpt på den ena världen och sålt på den andra; ingen av dem är "rätt", båda är redovisade.

**Lönsamhet — mittposten som råkar vara exakt medianen**

- Räntabilitet på investerat kapital (ROIC): **${PCT(f.roic)} procent** — [så räknas ROIC](/dataset/kommunikation/roic) — tolfte av ${r.roic.n}, och värdet är EXAKT grenens median ${PCT(g(b => b.lonksamhet.roic))} (universumets ${PCT(u(b => b.lonksamhet.roic))}). Verizon är bokstavligt grenens mittpunkt på kapitalavkastning: ${r.roic.n} mätbara, mittposten. Med källans not att värdet är en approximerad proxy — EBIT före skatt delat på skuld plus bokfört eget kapital — och just därför pedagogiskt: proxyns nämnare är hela telekombalansräkningen.
- Räntabilitet på eget kapital (ROE): **${PCT(f.roe)} procent** — [så räknas ROE](/dataset/kommunikation/roe) — elfte av ${r.roe.n}, strax under medianen ${PCT(g(b => b.lonksamhet.roe))}, över universumets ${PCT(u(b => b.lonksamhet.roe))}. Notera ordningen mot Disney: ROE ${PCT(f.roe)} ÖVER ROIC ${PCT(f.roic)} — hävstångens klassiska spår, och läsanvisningen: skillnaden drivs av skuldkvoten ${T(f.skuldEk)}, inte av att ägarkapitalet arbetar bättre än det investerade. AKM1:s konkava kurva ger 2 av 5 — men notera att modellens varning (ROE under kapitalkostnad) som bar Disneys paket här är en annan fråga: kapitalkostnaden står osatt i underlaget, och modellen gissar aldrig.
- Bruttomarginal: **${PCT(f.brutto, 2)} procent** — [så läses marginalerna](/dataset/kommunikation/brutto-marginal) — sjunde högsta av ${r.brutto.n}, över medianen ${PCT(g(b => b.lonksamhet.bruttoMarginal))} och universumets ${PCT(u(b => b.lonksamhet.bruttoMarginal))}. Nätets värld: abonnemangsintäkter med nätets marginaler — betydligt över medianen, betydligt under Metas mjukvarutopp ${PCT(metaRad.lonksamhet.bruttoMarginal)}.
- Rörelsemarginal (EBIT): **${PCT(f.ebitM, 1)} procent** — sjätte högsta av ${r.ebitM.n}, över medianen ${PCT(g(b => b.lonksamhet.ebitMarginal), 1)} och universumets ${PCT(u(b => b.lonksamhet.ebitMarginal), 1)}. En av grenens bästa driftsmarginaler på en av grenens svagaste tillväxter — telekomtricket: marginalen köps med kapital, inte med volym.
- Nettomarginal: **${PCT(f.nettoM)} procent** — trettonde av ${r.nettoM.n}, strax över medianen ${PCT(g(b => b.lonksamhet.nettoMarginal))}, under universumets ${PCT(u(b => b.lonksamhet.nettoMarginal))}. Från ${PCT(f.ebitM, 1)} i rörelsen till ${PCT(f.nettoM)} i nettot: avskrivningarna på nätet (och nu Frontier-goodwill) samt räntan på skulden tar mer än hälften — avskrivningar och ränta är telekomresultaträkningens fasta inventarier.
- Fritt kassaflödes marginal: **${PCT(f.fcfM)} procent** — [FCF-avkastningens sida](/dataset/kommunikation/fcf-avkastning) — elfte av ${r.fcfM.n}, och värdet ligger EXAKT på grenens median ${PCT(g(b => b.lonksamhet.fcfMarginal))} (universumets ${PCT(u(b => b.lonksamhet.fcfMarginal))}). Två mittposter i samma bolag (ROIC och FCF-marginal) — Verizon är grenens mittpunkt på två sätt, och det är paketets stilla poäng: inga ytterligheter, bara geometrin.

**Tillväxt — stillaståendet som blir seriens avslutning**

- Omsättning över senaste fyra räkenskapsåren: **${PCT(revCagrKontroll, 2)} procent per år** (${T(oms[0], 3)} → ${T(oms[1], 3)} → ${T(oms[2], 3)} → ${T(oms[3], 3)} miljarder dollar) — [TTM-tillväxten](/dataset/kommunikation/omsattningstillvaxt-ttm) — fjärde lägsta av ${r.revCagr.n} mätbara mot medianen ${PCT(g(b => b.tillvaxt.omsattningCAGR5ar), 2)}. Fyra års sammanlagd rörelse: ${PCT(omsTotal, 1)} procent. Ärlighetsnot: källan ger fyra datapunkter men kallar fältet femårs-CAGR, och universumspostens fotnot konstaterar samma sak.
- Resultat samma period: **${PCT(resCagrKontroll, 2)} procent per år** — ${T(res[0], 3)} → ${T(res[1], 3)} → ${T(res[2], 3)} → ${T(res[3], 3)} miljarder dollar, **näst lägst av ${r.resCagr.n} mätbara i grenen** (endast Telenor lägre; median ${PCT(g(b => b.tillvaxt.resultatCAGR5ar), 2)}). Staplarnas historia: dippen ${PCT(dip23, 1)} procent 2023, återhämtningen ${PCT(at24, 1)} procent 2024 — och ${PCT(res25, 1)} procent fall 2025 igen. CAGR:fallet på årsbasis ${PCT(Math.abs(resCagrKontroll), 2)} motsvarar ett totalt fall på ${PCT(Math.abs(resTotal), 1)} procent — basårets aritmetik bär talet, Chevron-paketets varning i telekom.
- Intäktstillväxt senaste tolvmånadersperioden: **${PCT(f.ttm, 1)} procent enligt fältet** — näst lägst av ${r.ttm.n} (endast WBD lägre) mot medianen ${PCT(g(b => b.tillvaxt.omsattningTillvaxtTTM), 2)} och universumets ${PCT(u(b => b.tillvaxt.omsattningTillvaxtTTM), 2)}. Med Frontier inne från 20 januari är fältets fönster en blandräkning — och ändå negativt. Läsanvisningen: serviceintäkterna växer (kvartalskedjan: mobility- och bredbandsservice +2,8 procent i Q2) medan equipment-försäljningen sjunker — telekomintäktens två hastigheter.
- Prognostillväxt: **${PCT(f.prognos, 2)} procent** — sjunde lägsta av ${r.prognos.n} mot medianen ${PCT(g(b => b.tillvaxt.prognosTillvaxt), 2)} och universumets ${PCT(u(b => b.tillvaxt.prognosTillvaxt), 2)}. Konsensus tror på återhämtningstakt — men se PEG-klyftan ovan: källans PEG-värld antyder det nästan dubbla.

## Källkritiken: fältet som inte hunnit med Frontier, PEG:s två världar och EV-kedjan som stänger

Först pariteten. Fältvägen (insamlingens slutkurs 50,22 dollar delat med P/E ${T(f.pe)}) ger rullande EPS ${T(epsFalt)} dollar. Rapportvägen — kvartalskedjans GAAP-EPS ${T(gaapK[0])} + ${T(gaapK[1])} + ${T(gaapK[2])} + ${T(gaapK[3])} — ger ${T(gaapSum)}. Skillnaden är +${PCT(paritet, 1)} procent (fältet över kedjan) — seriens mittskick: Chevrons 0,29 och Disneys +1,4 är träffklassen, och här kommer +2,1 med en ärlighetsnot: två av kedjans fyra poster är härledda, inte direkt rapporterade. Q4 2025:s GAAP-EPS ${T(gaapK[1])} är räknat baklänges ur bolagets helårstal (FY-EPS 4,06 minus nio månaders 1,27 + 1,18 + 1,17 — samma bakvägs-metod som seriens andra härledda kvartal), och Q1 2026:s ${T(gaapK[2])} ur nettot 5,15 miljarder delat med ${T(aktierFY, 2)} miljarder aktier (aktietalet i sin tur härlett ur helårets netto och EPS). Båda vägarna redovisade, båda osäkerheter — inte dolda.

Sedan klyftan som är paketets andra signatur: **GAAP mot justerat**. Den justerade kedjan ${T(justK[0])} + ${T(justK[1])} + ${T(justK[2])} + ${T(justK[3])} = ${T(justSum)} mot GAAP-kedjans ${T(gaapSum)} — skillnaden ${T(gapJust)} dollar per aktie är ${PCT(gapJustPct, 1)} procent av det justerade talet. Posterna däremellan är Frontier-processens och omstruktureringsfenomenens: Q4 2025:s gap ${T(justK[1] - gaapK[1])} dollar (förvärvsslutet nästföljande månad — transaktionskostnaderna i fjolårets kvartal) och Q2 2026:s ${T(justK[3] - gaapK[3])} (integrationsposter — bolaget redovisar special items per kvartal). FY2025 i helår: GAAP 4,06 mot justerat 4,71, gap 0,65 dollar = 13,8 procent. De tre P/E-vägarna (${T(f.pe)} / ${T(peGaap)} / ${T(peJust)}) står på samma aktie och tre olika frågor — övning A tar den.

Sedan EV-kedjan, som här stänger hårdare än i något tidigare telekom-paket. Värderingsvägen: rullande netto ${T(nettoFalt, 1)} miljarder (marknadsvärdet delat med P/E), rullande EBIT ${T(ebitFalt, 1)} (nettot gånger marginalkvoten ${PCT(f.ebitM, 1)}/${PCT(f.nettoM)}), EV = ${T(f.evEbit)} × ${T(ebitFalt, 1)} = ${T(evVarde, 0)} miljarder. Balansvägen: bokfört EK ur P/B = ${T(mcap, 1)}/${pbT} = ${T(ekFalt, 1)} miljarder, skuld ur kvoten ${T(f.skuldEk)} × ${T(ekFalt, 1)} = ${T(skuldKvot, 1)}, EV = ${T(mcap, 1)} + ${T(skuldKvot, 1)} = ${T(evBalans, 0)} miljarder. Klyftan mellan vägarna: ${PCT(balansKlyfta, 1)} procent — två oberoende vägar, samma balansrad, och nettoskuldpekaren ${T(nettoSkuldPek, 0)} miljarder är storleken på Frontier-förvärvet (omkring 20 miljarder i EV) gånger nio. Det är första signaturens aritmetik: varje multipl som börjar med "EV" bär skulden — och varje multipl som börjar med "P" (P/E ${T(f.pe)}, P/B ${pbT}) gör det inte.

Och de stilla noterna: universumspostens återköpsfält är tomt (null är information — Verizon köpte tillbaka aktier under 2025 enligt bevakningen, men fältet förmår inte berätta det), insiderfältet anger ${V.aterkop.insiderkopSenaste6man} köp utan kontext, räntetäckning saknas med källans egen not (skuldbördans kostnadssida omätbar i underlaget — i en balansräkning med ${T(skuldKvot, 0)} miljarder skuld är det seriens tydligaste osatt-varning), moat-fälten tomma (ingen femårig bruttomarginalhistorik hos källan). Efter insamlingsdatumet har marknaden rört sig — alla multiplar här är insamlingens ögonblicksbild, inte rappdagens. Och den största stilla noten av alla: fältens fönster hann inte med Frontier-kvartalen i jämförelseunderlaget — TTM-tillväxten ${PCT(f.ttm, 1)} procent är en värld där förvärvet finns i täljaren men saknar motsvarighet i nämnaren. Blandat, inte rent — och så redovisat.

## Kvartalskedjan: Frontier-kvartalet, specialposterna och guiden som stigit tre gånger

Rapporten i slutet av oktober täcker kalenderkvartalet juli–september 2026. Fjolårets jämförelsetal i tabellens första rad. Alla tal sökverifierade 2026-09-21 mot bolagets pressreleaser och etablerad bevakning; härledda poster (Q4-25 och Q1-26 på GAAP-vägen) markerade och genomgångna i källkritiken ovan.

| Kvartal | Netto / EPS (GAAP) | Justerat EPS | Intäkt | Noterar |
| --- | --- | --- | --- | --- |
| Q3 2025 (29/10 2025) | ~5,1 mdr / 1,17 | 1,21 (+1,7 % y/y) | 33,8 mdr (+1,5 %) | adj EBITDA 12,8 mdr (+2,3 %); postpaid phone +44 k totalt (konsument −7 k, Business +51 k) — kvartalsvolymens lågvattenmärke |
| Q4 2025 (30/1 2026) | ~1,9 mdr / 0,44 (härlemt: FY 4,06 − 9M 3,62) | 1,09 — slagen (från 1,10, −0,9 % y/y) | 36,38 mdr | Frontier tillträtt 20/1 — Q4:s GAAP bär transaktionskostnader (gap 0,65/aktie); postpaid phone +616 k (från 504 k); trådlös service 21,0 mdr (+1,1 %); FY25: GAAP-EPS 4,06, justerad 4,71 (från 4,59), oms 138,2 mdr; 2026-guiden öppnad: justerad EPS 4,90–4,95 (+4–5 %) över konsensus 4,76 |
| Q1 2026 (27/4 2026) | 5,15 mdr (+3,3 %) / ~1,22 (härlemt ur netto/aktier) | 1,28 mot est ~1,21–1,23 — slagen (+7,6 % y/y från 1,19) | 34,44 mdr (+2,9 %; lätt under est ~34,95) | första kvartalet med Frontier konsoliderat (20/1–31/3); adj EBITDA 13,4 mdr över est; FCF ~3,8 mdr (+4 %); postpaid phone +55 k; guiden höjd till +5–6 % (första höjningen); utdelningen höjd i januari +2,5 % till 0,7075/kv = tjugonde årliga höjningen i rad |
| Q2 2026 (24/7 2026) | 3,9 mdr / 0,92 (−22 % y/y från 1,18) | 1,30 mot est 1,27 — slagen (+6,6 % y/y; sjätte raka slaget) | 34,25 mdr (−0,7 %; miss mot est 35,16) | adj EBITDA 13,7 mdr (+7,2 %, rekord); FCF 6,4 mdr (+24,4 %); postpaid phone +184 k — bästa konsument-Q2 på fem år; GAAP-gap 0,38/aktie (integrations-/specialposter); nettomarginal 11,5 % (från 14,8); guiden höjd igen: justerad EPS 4,99–5,04 (+6–7 %), FCF-tillväxt +9–10 %, mobility- och bredbandsservice +2,5–3 % |
| Q3 2026 (28/10, estimat) | — | konsensus ~1,28 (Public.com) | konsensus ~34,8 mdr | läs mot Q3-25:s 1,21 och guide-aritmetiken i övning B; Frontier-jämförelsen blir fortsatt blandad (Q3-25 utan, Q3-26 med) |

Tre berättelser att läsa — och en aritmetik. **Frontier-kvartalet som aldrig blir rent**: förvärvet (avtal september 2024, alla godkännanden 15 januari 2026, tillträde 20 januari, omkring 20 miljarder dollar i EV enligt Reuters-klassen av bevakning, 8,5× EV/EBITDA på 2025E, närmare 10 miljoner fiberkunder, synergier över 1 miljard dollar i run-rate till 2028 enligt Q2-samtalet) gör varje årspå-årstal från och med Q1 2026 till en blandräkning: Q1:s intäktstillväxt +2,9 procent bär två och en halv månad Frontier; Q2:s totala −0,7 procent sker MED Frontier inne — och är ändå negativ, därför att equipment-försäljningen faller medan serviceintäkterna växer 2,8 procent. **Specialposternas takt**: GAAP-gapet per kvartal (0,65 i Q4-25, 0,38 i Q2-26) är Frontier-processens dubbla slagga — transaktionen först, integrationen sedan; den justerade kedjan tar bort båda, och därmed är P/E ${T(peJust)} på den justerade världen paketets mest generösa multipl. **Utdelningsmaskinen**: januari 2026 = tjugonde årliga höjningen i rad (+2,5 procent till 0,7075 dollar per kvartal, 2,83 per år), september-deklarationen höll nivån med utbetalning 2 november 2026 — direktavkastning ${PCT(direkt)} procent på insamlingens kurs, utdelningen ${PCT(utdTack, 1)} procent av års-FCF. Och aritmetiken som binder paketet: guiden har stigit tre gånger på sex månader (4,90–4,95 öppnad i januari, +5–6 i april, +6–7 i juli) — på en omsättning som inte växer. Det är marginalexpansionens och kassaflödets värld, inte volymens — och den är exakt Disney-paketets spegelbild: där stod vinsttrappan stilla intäkters fel, här står guiden stilla intäkters rätt.

## Så står sig bolaget mot branschen

Tillbaka till grenen — hela kommunikationsgrenen, ${nGren} bolag, medianer räknade live ur samma universumsinsamling (${nUniv} poster totalt). [Universumjämförelsen](/dataset/kommunikation/universumjamforelse) sätter allt i sammanhang.

Verizons profil är en balansräkning med en kassamaskin på: värderingssidan billig på allt (P/E ${T(f.pe)} sjunde lägst, EV/EBIT ${T(f.evEbit)} sjunde lägst, P/B under medianen) — stabilitetssidan grenens tredje högst skuldta (skuld/EK ${T(f.skuldEk)} mot medianen ${T(g(b => b.stabilitet.skuldEgenkapital))} och universumets ${T(u(b => b.stabilitet.skuldEgenkapital))}, [om skuldsättning](/dataset/kommunikation/skuldsattning)) — lönsamhetssidan dubbel mittpost (ROIC och FCF-marginal exakt på medianerna) — tillväxtsidan bottenskiktet (TTM ${PCT(f.ttm, 1)} näst lägst, resultat-CAGR ${PCT(resCagrKontroll, 2)} näst lägst). Ingen annan kombination i grenen sprider sig så mellan balans och kassa.

Kontrastparen att minnas: mot **AT&T** — grenens andra telekomjätte och seriens telekomöppning — är frågan samma som då: vad väger nätets kapitalkostnad mot serviceintäkternas säkerhet, och vem bär den tyngst; mot **Disney** — föregående paketet — är speglingen total: vinst-CAGR +58 mot ${PCT(resCagrKontroll, 2)}, skuld/EK 0,394 mot ${T(f.skuldEk)}, FCF-marginal 4,92 mot ${PCT(f.fcfM)} — innehållscykelns hävstångsfria värld mot nätets skuldbärande; mot **T-Mobile** — grenens skuldtopp ovanför Verizon — frågan vad tillväxtvärlden kostar i balansräkningen; mot **Meta** — mjukvaragrenens motsats med PEG 0,77 mot källans ${T(f.peg)} (och konventionens ${T(peKonv)}). Inget av paren har ett rätt svar — de är läsövningar, inte köpgrunder.

## Tre sätt att läsa utfallet — övningar i metod

**Övning A — tre P/E och skuldens frånvaro.** ${T(f.pe)} står på fältfönstret ${T(epsFalt)}; ${T(peGaap)} på GAAP-kedjan ${T(gaapSum)}; ${T(peJust)} på den justerade ${T(justSum)}. Uppgiften är inte att välja den billigaste — den är att lista posterna bakom gapet ${T(gapJust)} dollar per aktie (Frontier-transaktion, integrationskostnader, omstrukturering) och bedöma vilka som återkommer nästa fönster och vilka som är engångs. Och sedan den telekomspecifika frågan: varför säger ingen av de tre något om skulden på ${T(skuldKvot, 0)} miljarder dollar — och vad händer med var och en av dem om räntan flyttar en halv procentenhet? (Räntetäckningen står osatt i underlaget — det är själva övningen.)

**Övning B — guide-aritmetik på tre höjningar.** Årets justerade EPS-guide: 4,99–5,04 dollar. Första halvåret rapporterat: 1,28 + 1,30 = ${T(h1)}. Q3-konsensus 1,28 (Public.com). Q4 implicit: 4,99 − ${T(h1)} − 1,28 = ${T(q4Impl[0])} till 5,04 − ${T(h1)} − 1,28 = ${T(q4Impl[1])} dollar — mot fjolårets Q4 1,09: **${PCT(q4Tillv[0], 1)} till ${PCT(q4Tillv[1], 1)} procent tillväxt i ett kvartal, i ett bolag som knappt växer alls på årsnivå**. Räkna omvägen: hur mycket av Q4-steget är postpaid-telefonernas årstid (fjärde kvartalet är alltid det starka: 616 000 av fjolårets nettounderskrifter landade där), hur mycket är Frontier, hur mycket är marginal? Guidens tre höjningar på stilla intäkter pekar på det tredje — men övningens svar finns först i rapportens kostnadsrader.

**Övning C — scenariorutan: marginalpoängen mot volymprocenten.** Bas: räkenskapsåret 2025 (intäkter 138,191 miljarder dollar, rörelsemarginal ${PCT(basMarg, 1)} — fältvärlden, öppet deklarerat) ger rörelseresultat ${T(basEbit, 2)} miljarder. Rutan varierar volymen ±3 procent och marginalen ±1 procentenhet:

| | Marginal ${PCT(marg[0], 1)} % | Marginal ${PCT(marg[1], 1)} % | Marginal ${PCT(marg[2], 1)} % |
| --- | --- | --- | --- |
| Intäkter ${T(vol[0], 1)} | ${T(cell(0, 0))} | ${T(cell(0, 1))} | ${T(cell(0, 2))} |
| Intäkter ${T(vol[1], 1)} | ${T(cell(1, 0))} | ${T(cell(1, 1))} | ${T(cell(1, 2))} |
| Intäkter ${T(vol[2], 1)} | ${T(cell(2, 0))} | ${T(cell(2, 1))} | ${T(cell(2, 2))} |

Cellerna är miljarder dollar i rörelseresultat. Två aritmetiska grundtal, i seriens konvention (intäkter respektive resultat): en procent volym är ${T(volPris, 3)} miljarder i intäkter, en procentenhet marginal är ${T(margPris, 3)} miljarder i resultat. Men i rutans valuta — rörelseresultatet — bär volymprocenten bara ${T(volEbit, 3)} miljarder (intäktsökningen gånger marginalen), medan marginalpoängen bär hela ${T(margPris, 3)}: **förhållandet ${T(kvot, 2)} gånger**. Seriens kedja fortsätter: Meta 2,9 vid 35 procent, Verizon ${T(kvot, 2)} vid ${PCT(basMarg, 1)}, Disney 5,2 vid 19,3, Chevron 4,6 vid 21,9 — och telekommarginen styrs av abonnentstockens pris- och blandningsbeslut (halvstyrbart, långsamt) mot Disneys tre rörliga delar och Chevrons ena ostyrbara. Rutans klass är fortfarande fältvärldens räkenskapsår — ingen prognos för Q3.

## Praktiskt inför 28 oktober

- **Datumet:** onsdagen 28 oktober (estimat, obekräftat — Public.com bokar dagen med EPS-estimat 1,28; MarketBeat estimerar 20/10, MarketChameleon fönstret 23–28/10; fjolårets Q3 kom onsdagen 29/10 2025 med samtal 08:30 ET). Bolagets utlysning via [Verizons investerarrelationer](https://www.verizon.com/about/investors) är den enda officiella källan — kontrollera den före publicering av detta utkast.
- **Kalenderns läge:** Verizon rapporterar i kalenderår — Q3 2026 är juli–september, ingen asterisk. Däremot: Frontier inne sedan 20 januari gör årspå-år-talen blandade genom hela 2026; Q3-25 är det sista rena före-kvartalet.
- **Tre rader att läsa först:** justerad EPS mot konsensus 1,28 och guide-aritmetikens Q4-implicit ${T(q4Impl[0])}–${T(q4Impl[1])}; postpaid phone net adds mot fjolårets +44 k (lågvattnet) och Q4-säsongens tyngd; FCF mot guidade +9–10 procents årsfart och utdelningens ${PCT(utdTack, 1)} procents andel av kassan.
- **Två asterisker att bära med sig:** alla P-multiplar (P/E ${T(f.pe)}, P/B ${pbT}) är blinda för skulden på ${T(skuldKvot, 0)} miljarder — EV-familjen bär den, och Frontier-synergivärlden (1 miljard till 2028) är ledningens tal, inte rapporterade; och PEG ${T(f.peg)} mot konventionens ${T(peKonv)} är samma aktie i två världar — redovisa vilken du använder.
- **Metodminnet:** läs inte "tjugonde årliga utdelningshöjningen" utan att fråga vad som finansierar den (FCF-marginal ${PCT(f.fcfM)}, ${PCT(utdTack, 1)} procent av kassan); läs inte resultat-CAGR ${PCT(resCagrKontroll, 2)} utan att fråga vad basåret bar. [Transparens-sidan](/transparens) förklarar hela metodiken; [källsidan](/kallor) hur universumet samlas in.

Ordlista och fördjupning: [kurserna](/kurser) redogör för begreppen — [FCF-avkastningen](/dataset/kommunikation/fcf-avkastning), [skuldsättningen](/dataset/kommunikation/skuldsattning) och [EV/EBIT](/dataset/kommunikation/ev-ebit) är detta pakets tre portar.

## Källor

- **Bolagsuniversumet**: data/portfolj-system/bolagsunivers.json, post VZ, hämtad 2026-09-03 (Yahoo Finance quoteSummary + MarketStack eod/latest; slutkurs 2026-09-02; postens egna fotnoter om fyraårsserie, ROIC-proxy och osatt räntetäckning redovisade i källkritiken). Medianer och rang live ur ${nGren}-bolagsgrenen, universummedianer ur samtliga ${nUniv} poster.
- **Forskningsbiblioteket**: data/forskningsbiblioteket/VZ.json, version 2026-09-04 (gul, täckning ${T(B.urval.datatackning, 4)}, AKM1 ${T(B.akm1.totalt, 1)}/${T(B.akm1.maxMojligt, 1)} = ${T(B.urval.relativAkm1, 4)} relativt; värdering starkast ${T(B.akm1.perKategori.vardering, 2)}/5, katalysator svagast 0/5; topp: intäktsstabilitet 5/5 σ 1,9 %, kassatäckning 5/5; botten: skuldsättningsgrad 2/5, ROE 2/5, försäljningstillväxt 2/5).
- **Rappdatum**: kalender-kommunikation.json (2026-09-15): estimatfönster 19–28 oktober 2026 med divergerande tredjepartskalendrar (TipRanks 19/10, MarketBeat 20/10, MarketChameleon 23–28/10) och fjolårets Q3 onsdagen 29/10 2025 med telefonkonferens 08:30 ET; Public.com 28/10 med EPS-estimat 1,28 — sökverifierade 2026-09-21; ingen bolagsutlysning vid byggtiden.
- **Q3 2025**: Verizon rapport 2025-10-29: intäkt 33,8 mdr (+1,5 %), GAAP-EPS 1,17 (netto omkring 5,1 mdr), justerad 1,21 (+1,7 %), adj EBITDA 12,8 mdr (+2,3 %); postpaid phone +44 k totalt (konsument −7 k med churn 0,98 %, Business +51 k); gross adds +8,4 % (Verizon pressrelease och 10-Q, Yahoo Finance, moomoo).
- **Q4 2025 + FY2025**: "Verizon Delivers on 2025 Financial Guidance…" (2026-01-30): FY-EPS 4,06 GAAP, justerad 4,71 (från 4,59), årsomsättning 138,2 mdr; Q4: intäkt 36,38 mdr, trådlös service 21,0 mdr (+1,1 %), justerad EPS 1,09 (från 1,10) över est, postpaid phone +616 k (från 504 k); 2026-guiden 4,90–4,95 (+4–5 %) över konsensus 4,76 (verizon.com, Yahoo Finance, Globe and Mail, 247wallst, Investors Business Daily). Q4-GAAP ${T(gaapK[1])} härlemt ur FY- och 9M-tal — vägen redovisas i källkritiken.
- **Q1 2026**: "Company Raises Adjusted EPS Guidance" (2026-04-27): intäkt 34,44 mdr (+2,9 %, under est ~34,95), netto 5,15 mdr (+3,3 %), justerad EPS 1,28 (från 1,19; est ~1,21–1,23), adj EBITDA 13,4 mdr, FCF ~3,8 mdr (+4 %), postpaid phone +55 k; guiden höjd till +5–6 % (verizon.com, StockStory, Investing.com, TradingView).
- **Q2 2026**: "Verizon Delivers Record 2Q26 Results…" (2026-07-24): intäkt 34,25 mdr (−0,7 %, miss mot est 35,16), GAAP-netto 3,9 mdr / EPS 0,92 (från 1,18; nettomarginal 11,5 mot 14,8), justerad 1,30 (+6,6 %; est 1,27; sjätte raka), adj EBITDA 13,7 mdr (+7,2 %, rekord), FCF 6,4 mdr (+24,4 %), postpaid phone +184 k (bästa konsument-Q2 på fem år); guiden höjd: justerad EPS 4,99–5,04 (+6–7 %), FCF-tillväxt +9–10 %, mobility- och bredbandsservice +2,5–3 % (verizon.com, Fortune-transkript, MarketBeat, TIKR, Seeking Alpha, Counterpoint).
- **Frontier**: avtal 2024-09-04/05 (Reuters: omkring 20 mdr EV, 37 % premie, närmare 10 M fiberkunder); "received all regulatory approvals" 2026-01-15 med tillträde 2026-01-20 (verizon.com); 8,5× EV/EBITDA 2025E och synergier över 1 mdr run-rate till 2028 (Q2 2026-samtalet).
- **Utdelning**: januari 2026 tjugonde årliga höjningen +2,5 % till 0,7075 dollar/kvartal (TIKR, Yahoo Finance); deklaration 2026-09-09 oförändrad 0,7075, utbetalning 2026-11-02 med record-dag 2026-10-09 (verizon.com).
- **Bolagets bevakningspunkt**: [verizon.com/about/investors](https://www.verizon.com/about/investors) — utlysningar, pressreleaser och webbsända resultatpresentationer.

Ryggraden i detta paket är aritmetiken: varje tal i texten är antingen rapporterat av bolaget, hämtat ur universumets dubbelkällade insamling, eller beräknat ur de två — och beräkningsvägen redovisas (härledda poster markerade). Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).`;

const ord = body.trim().split(/\s+/).length;
const rm = Math.max(3, Math.round(ord / 550));

const titel = `Verizon Q3-rapport 2026: så läser du den — utdelningsmaskinen med stillastående vinst`;

const paket = {
  slug: 'sa-laser-du-vz-q3-2026',
  title: titel,
  description: `Verizon (VZ, NYSE) — telekomjätten med USA:s mobilnät och ett växande fibernät — rapporterar kalenderkvartalet juli–september 2026 onsdagen 28 oktober (tredjepartsestimat, obekräftat; fjolårets Q3 kom 29 oktober 2025). Läspaketet — analysbibliotekets sista objekt, seriens ${serienNr}:e: omsättningen ${PCT(omsTotal, 1)} procent på fyra år (${T(oms[0], 1)} → ${T(oms[3], 1)} miljarder dollar) med resultatet fallande ${PCT(Math.abs(resCagrKontroll), 2)} procent per år; skuldsättningsgraden ${T(f.skuldEk)} grenens tredje högsta med företagsvärdet ${T(evKvotMCap)} gånger börsvärdet och nettoskuldpekaren ${T(nettoSkuldPek, 0)} miljarder (Frontier tillträtt 20/1 2026, omkring 20 miljarder i EV); tre P/E-vägar ${T(f.pe)} / ${T(peGaap)} / ${T(peJust)} med GAAP-gapet ${T(gapJust)} dollar per aktie; PEG källans ${T(f.peg)} mot konventionens ${T(peKonv)} — seriens största klyfta; FCF-avkastning ${PCT(f.fcfY)} procent, utdelningen höjd tjugonde året i rad och ${PCT(utdTack, 1)} procent av kassan; guiden höjd tre gånger på sex månader till +6–7 procent. Allt som utbildning, aldrig råd.`,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-10-28',
  readingMinutes: rm,
  tags: ['kvartalsrapport', 'Verizon', 'kommunikation', 'USA', 'telekom', 'läspaket'],
  body,
};

writeFileSync('/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-vz-q3-2026.json', JSON.stringify(paket, null, 1) + '\n');
writeFileSync('/home/ak1a/AK1/verktyg/_s4u2-vz-berakning.json', JSON.stringify(dump, null, 1) + '\n');
console.log('PAKET SKRIVET: ord=' + ord + ' rm=' + rm + ' serienNr=' + serienNr + ' (paDiskFore=' + paDisk + ')');
console.log('EV-kedja: varde=' + T(evVarde, 1) + ' balans=' + T(evBalans, 1) + ' klyfta=' + PCT(balansKlyfta, 2) + ' %');
console.log('PEG: kalla=' + f.peg + ' konv=' + T(peKonv) + ' kvot=' + T(pegKvot));
console.log('Titellangd: ' + titel.length + ' tkn');
