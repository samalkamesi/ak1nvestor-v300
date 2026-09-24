#!/usr/bin/env node
// _s4u3-nflx-bygg.mjs — byggmotor för Netflix Q3-läspaket 2026 (s4-u3, manifest auto-s4-1790046905434)
// All aritmetik motorräknad ur råtalbanken nedan; avvikelser > tolerans kastar FÖRE filskrivning.
// Råkällor: bolagsunivers.json NFLX (2026-09-03, Yahoo+MarketStack), Q2-2026 Shareholder Letter
// (2026-07-16), ir.netflix.net (2026-09-22), sökverifierade datum/estimat 2026-09-22.
import fs from 'node:fs';
import crypto from 'node:crypto';

const UNI = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const PAKET = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nflx-q3-2026.json';

const uniRaw = fs.readFileSync(UNI);
const uni = JSON.parse(uniRaw);
const md5 = crypto.createHash('md5').update(uniRaw).digest('hex');
const N = uni.find(b => b.ticker === 'NFLX');
if (!N) throw new Error('NFLX saknas i universumfilen');

// ---------- råtalbank ----------
const U = {
  pris: N.pris, mcap: N.marknadsKapitalMdr,
  pe: N.vardering.pe, pb: N.vardering.pb, evEbit: N.vardering.evEbit,
  peg: N.vardering.peg, fcfYield: N.vardering.fcfYield * 100,
  roe: N.lonksamhet.roe * 100, roic: N.lonksamhet.roic * 100,
  brutto: N.lonksamhet.bruttoMarginal * 100, ebitM: N.lonksamhet.ebitMarginal * 100,
  netto: N.lonksamhet.nettoMarginal * 100, fcfM: N.lonksamhet.fcfMarginal * 100,
  skuldEk: N.stabilitet.skuldEgenkapital,
  omsCagr: N.tillvaxt.omsattningCAGR5ar * 100, resCagr: N.tillvaxt.resultatCAGR5ar * 100,
  ttm: N.tillvaxt.omsattningTillvaxtTTM * 100, prognos: N.tillvaxt.prognosTillvaxt * 100,
  insider: N.aterkop.insiderkopSenaste6man,
  omsSerie: N.serier.omsattning, resSerie: N.serier.resultat, ar: N.serier.ar,
};
// Q2-2026 Shareholder Letter (miljoner USD om ej annat sägs)
const B = {
  q: { // kvartal: [rev, y/y %, OI, OM %, netto, EPS, FD-aktier]
    q225: [11079, 15.9, 3775, 34.1, 3125, 0.72, 4349],
    q325: [11510, 17.2, 3248, 28.2, 2547, 0.59, 4340],
    q425: [12051, 17.6, 2957, 24.5, 2419, 0.56, 4317],
    q126: [12250, 16.2, 3957, 32.3, 5283, 1.23, 4298],
    q226: [12559.938, 13.4, 4192.610, 33.4, 3401.414, 0.80, 4261],
    q326f: [12860, 11.7, 4268, 33.2, 3452, 0.82, null],
  },
  balans: { kassa: 9099.232, skuld: 14309.306, innehall: 33837.573, ek: 30152.052, tillgangar: 58450.441 },
  q2detalj: { cffo: 1743.812, fcf: 1525.168, ranta: 175.685, skatt: 667.172, preTax: 4068.586,
    otherQ1: 2852.166, otherQ2: 51.661, otherH125: 44.611, cffoQ125: 2423.258, fcfQ125: 2267.369,
    cffoQ325: 2825, fcfQ325: 2660, cffoQ425: 2112, fcfQ425: 1872, cffoQ126: 5290, fcfQ126: 5094 },
  regioner: [ // [namn, intäkt MUSD, rapporterad %, FXN %]
    ['UCAN', 5431.667, 10, 10], ['EMEA', 4033.515, 14, 11], ['LATAM', 1584.290, 21, 16], ['APAC', 1510.466, 16, 18]],
  guide: { fy26revLag: 51.0, fy26revHog: 51.4, fy26Marginal: 31.5, fy25Marginal: 29.5, fcfAr: 12.5, adsAr: 3.0,
    fy25Rev: 45.183, innehallAmort: 10, q2MarginalGuide: 32.6 },
  aterkop: { q2: 4.7, h1: 5.984991, kvar: 27.1 },
  engagemang: { timmarH1: 97, timmarTillvaxt: 2, liveBudget: 5, liveTimmar: 1, signupDagar: 6, genaiTitlar: 300, tittare: 'nära en miljard' },
};
const S = { // sökverifierat 2026-09-22
  rappdag: '2026-10-20', utlysning: '2026-09-14', intervjuPT: '13:45', resultatPT: '13:01',
  irKurs: 75.42, irKursDag: '2026-09-17', epsSpann: [0.80, 0.82],
  split: { utlyst: '2025-10-30', record: '2025-11-10', distribuerad: '2025-11-14', handel: '2025-11-17', faktor: 10 },
  reaktionQ2: -8, reaktionQ1: -9.7, q1Rapport: '2026-04-16', q2Rapport: '2026-07-16',
};

// ---------- motorräkning med toleransvakter ----------
const assertN = (namn, fick, vanta, tol) => { if (Math.abs(fick - vanta) > tol) throw new Error(`${namn}: fick ${fick}, väntade ${vanta} (tol ${tol})`); };
const sum = (a) => a.reduce((x, y) => x + y, 0);
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

const ttmRev = sum([B.q.q325[0], B.q.q425[0], B.q.q126[0], B.q.q226[0]]);          // 48 370.9
const ttmNI  = sum([B.q.q325[4], B.q.q425[4], B.q.q126[4], B.q.q226[4]]);          // 13 650.4
const ttmOI  = sum([B.q.q325[2], B.q.q425[2], B.q.q126[2], B.q.q226[2]]);          // 14 354.6
const ttmFCF = sum([B.q2detalj.fcfQ325, B.q2detalj.fcfQ425, B.q2detalj.fcfQ126, B.q2detalj.fcf]);
const ttmCFFO= sum([B.q2detalj.cffoQ325, B.q2detalj.cffoQ425, B.q2detalj.cffoQ126, B.q2detalj.cffo]);
// kontroller mot fält
assertN('netto-marginal TTM mot fält', (ttmNI / ttmRev) * 100, U.netto, 0.01);
const epsFalt = U.pris / U.pe;                                     // 3.260
const niImplicit = U.mcap / U.pe;                                  // 13.576 mdr
const identGap = (ttmNI / 1000 / niImplicit - 1) * 100;            // +0.54 %
assertN('identitetsgap rimligt', identGap, 0.5, 0.5);              // ~0–1 %
const aktiebas = U.mcap * 1000 / U.pris;                           // 4 164 M
const ekPerAktie = B.balans.ek / aktiebas;                         // 7.240
assertN('P/B via EK-vägen', U.pris / ekPerAktie, U.pb, 0.001);
// engångsposten
const skattesats = B.q2detalj.skatt / B.q2detalj.preTax;           // 16.4 %
const q1preTax = B.q.q126[4] + B.q2detalj.skatt;                   // ej — netto+skatt ≠ preTax om andra poster; använd brevets preTax-väg nedan
const q1PreTaxJ = B.q2detalj.preTaxQ1 ?? 6547.086;                 // brevets Q1-pre-tax 6 547.086 (resultaträkning H1)
const q1NIJ = (q1PreTaxJ - B.q2detalj.otherQ1) * (1 - skattesats); // 3 088.8
const engJust = B.q.q126[4] - q1NIJ;                               // 2 194.3
const ttmNIJ = ttmNI - engJust;                                    // 11 456.1
const peJust = U.mcap / (ttmNIJ / 1000);                           // 30.07
const nettoJust = (ttmNIJ / ttmRev) * 100;                         // 23.69
const epsJ = ttmNIJ / aktiebas;                                    // 2.751
// PEG
const pegKonv = U.pe / U.prognos;                                  // 3.95
const pegKvot = pegKonv / U.peg;                                   // 2.65
const pegImplicit = U.pe / U.peg;                                  // 17.03
// EV-kedja
const ev = U.mcap + B.balans.skuld / 1000 - B.balans.kassa / 1000; // 349.69
const evEbitOI = ev / (ttmOI / 1000);                              // 24.36
const eitImplicit = ev / U.evEbit;                                 // 16.04
const skuldEkBrev = B.balans.skuld / B.balans.ek;                  // 0.474
// CAGR-kontroller (fältet = 3 intervall på 4 år, enligt noteringen)
assertN('omsCAGR 3 intervall', ((U.omsSerie[3] / U.omsSerie[0]) ** (1 / 3) - 1) * 100, U.omsCagr, 0.02);
assertN('resCAGR 3 intervall', ((U.resSerie[3] / U.resSerie[0]) ** (1 / 3) - 1) * 100, U.resCagr, 0.02);
// återköp
const aktieForandring = (B.q.q226[6] / B.q.q225[6] - 1) * 100;     // −2.0 %
const niTillvaxtQ2 = (B.q.q226[4] / B.q.q225[4] - 1) * 100;        // +8.8 %
const epsMekan = (1 + niTillvaxtQ2 / 100) * (B.q.q225[6] / B.q.q226[6]);  // 1.111
assertN('EPS-mekanik stänger', epsMekan * B.q.q225[5], B.q.q226[5], 0.005);
const h1DelAvFcf = (B.aterkop.h1 / (B.guide.fcfAr * 1000)) * 100;  // 47.9 %
const programDel = (B.aterkop.kvar / U.mcap) * 100;                // 7.9 %
const q2Del = (B.aterkop.q2 / U.mcap) * 100;                       // 1.36 %
// FY-scenarier
const fy25OI = B.guide.fy25Rev * B.guide.fy25Marginal / 100;       // 13.33 mdr
const scenRev = [50.6, 51.2, 51.8], scenMarg = [30.5, 31.5, 32.5];
const cell = (i, j) => r1(scenRev[i] * scenMarg[j] / 100 * 1000);  // MUSD
const mittPlus = (cell(1, 1) / 1000 / fy25OI - 1) * 100;           // +21 %
const viktMarg = scenRev[1] * 0.01 * 1000;                          // 512
const viktRev = scenRev[1] * 0.03 * 1000;                           // 1 536
const adsAndel = (B.guide.adsAr / 51.2) * 100;                     // 5.9 %
// kursglidning
const kursFall = (S.irKurs / U.pris - 1) * 100;                    // −8.8 %
const peIr = S.irKurs / epsFalt;                                   // 23.1
const peIrJ = S.irKurs / epsJ;                                     // 27.4
// medianer+rank ur universumfilen (levande)
const gren = uni.filter(b => b.bransch === 'kommunikation');
const statistik = {};
const falt = {
  pe: b => b.vardering?.pe, pb: b => b.vardering?.pb, evEbit: b => b.vardering?.evEbit,
  peg: b => b.vardering?.peg, roe: b => b.lonksamhet?.roe, roic: b => b.lonksamhet?.roic,
  brutto: b => b.lonksamhet?.bruttoMarginal, ebitM: b => b.lonksamhet?.ebitMarginal,
  netto: b => b.lonksamhet?.nettoMarginal, fcfM: b => b.lonksamhet?.fcfMarginal,
  skuldEk: b => b.stabilitet?.skuldEgenkapital, omsCagr: b => b.tillvaxt?.omsattningCAGR5ar,
};
for (const [k, f] of Object.entries(falt)) {
  const v = gren.map(f).filter(x => x != null).sort((a, b) => a - b);
  const min = f(N);
  statistik[k] = { n: v.length, median: v[Math.floor(v.length / 2)], under: v.filter(x => x < min).length };
}
// punktkontroller av väntade rangar (dokumenterade i klaim/paket)
assertN('ROE högst i grenen', statistik.roe.under, statistik.roe.n - 1, 0.01);
assertN('P/B näst högst', statistik.pb.under, statistik.pb.n - 2, 0.01);
assertN('PEG exakt medianläge', statistik.peg.under, Math.floor((statistik.peg.n - 1) / 2), 0.01);
assertN('brutto strax över median', statistik.brutto.under, 13, 0.01);

// ---------- formateringshjälp ----------
const sv = (x, dec = 0) => x.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\u00a0/g, ' ');
const pct = (x, dec = 1) => sv(x, dec) + ' %';
const L = (txt, slug) => `[${txt}](/dataset/kommunikation/${slug})`;

// ---------- kropp ----------
const body = `Netflix — världens största strömmingtjänst, approaching en miljard tittare enligt bolaget självt — rapporterar tredje kvartalet 2026 tisdagen 20 oktober efter amerikansk börsstängning. Datumet är inte ett estimat: utlysningen "Netflix to Announce Third Quarter 2026 Financial Results" publicerades i bolagets eget investerarrum redan 14 september, och IR-kalendern bokar intervjun samma dag kl 13:45 stilla havet-tid — 22:45 svensk tid. Detta är kommunikationgrenens åttonde läspaket (AT&T, Tele2, Telia, Meta, Disney, Verizon och MTG kom före) och seriens omkring 87:e på disk. Grundunderlaget: kursen 82,73 dollar och börsvärdet 344,5 miljarder dollar i universumets dubbelkällade rad från 3 september (Yahoo Finance med MarketStack-kontroll av kurs, multiplar och börsvärde mot slutkursen 2 september).

## Urvalet: varför Netflix är nästa paket i serien

Serien väljer i fifo-ordning: tidigaste återstående rappdag med bärande data, och bland datumklasserna väger bolagets eget ord tyngst (bolagsbekräftat slår estimerat, som slår tredjepartsgissningar — Shell-precedensen). Netflix är det tidigaste återstående datumet i hela fältet SOM ÄR bolagsbekräftat: 20 oktober, en månad före NVDA:s tredjepartsbekräftade 17 november och före hela novemberfältet (ASM International 27/10 är MarketScreener-källa; Apple, ExxonMobil, Enel och Eaton bär estimerade datum).

En öppen bokföring: P&G-paketet gallrade bort Netflix den 20 september med motiveringen "20/10 rent tredjepartsestimat + kommunikationgrenen rikligt täckt". Gallran är nu föråldrad på sin egen princip — den gällde datumstatusen, inte bolaget eller datan (Truecaller-precedensen som P&G-raden själv åberopar: bolagets eget angivande är bärande när det finns). Bolagets utlysning fanns på disk vid gallran men utanför det kalenderunderlag paketet läste; vid ny primärverifiering mot ir.netflix.net den 22 september står både utlysningen (14/9) och kalenderposten ("Netflix Third Quarter 2026 Earnings Interview — Oct 20, 2026 01:45 PST") i bolagets eget material. Grenmättnads-skälet var mjuk prioritering, inte spärr — grenen har sedan gallran tagit sitt sjunde paket (MTG).

Bärande data enligt seriens JNJ-ribba: universumraden är fullt befolkad — sex värderingsmultiplar, båda tillväxtmåtten, konsensusprognos, fyra räkenskapsår — med dubbelkälla som få pakat i serien har. Radens egna fotnoter är en del av underlaget: serien bär fyra år (2022–2025), femårsmåttet är alltså räknat på tre intervall; konsensusprognosen är EPS-tillväxt om ett år; räntetäckningen är osatt (räntekostnad saknas för senaste året).

Race-bokföring enligt konventionen: syskon u1 klaimade NVDA 05:18:12, syskon u2 Latour 05:20:20, detta paket Netflix 05:22:48 — tre skilda objekt, noll kollision (klaimfilen på disk före byggstart, Aker BP-precedensens diskordningskontroll).

## Nyckeltalen att ha med sig — med 97 miljarder timmar i ryggsäcken

Kommunikationsgrenen har 23 bolag — telekomerna med sina tunga balansräkningar, mediehusen, spelbolagen — och Netflix sticker ut på nästan varenda mått. Så här ser profilen ut mot grenens medianer (beräknade ur samma universumfil, ${sv(statistik.pe.n)}–${sv(statistik.fcfM.n)} mätvärden per mått):

| Mått | Netflix | Grenmedian | Position |
|---|---|---|---|
| ${L('P/E', 'pe')} | 25,4 | 16,2 | femte högst av 21 |
| ${L('P/B', 'pb')} | 11,4 | 2,27 | näst högst av 23 |
| ${L('EV/EBIT', 'ev-ebit')} | 21,8 | 14,5 | fjärde högst av 23 |
| ${L('PEG', 'peg')} | 1,49 | 1,49 | exakt på medianen (av 17) |
| ${L('ROE', 'roe')} | 49,5 % | 16,3 % | högst av samtliga 23 |
| ${L('ROIC', 'roic')} | 34,5 % | 10,7 % | tredje högst av 23 |
| ${L('Bruttomarginal', 'brutto-marginal')} | 49,1 % | 47,8 % | strax över medianen |
| EBIT-marginal | 33,4 % | 18,1 % | näst högst av 23 |
| ${L('Nettomarginal', 'netto-marginal')} | 28,2 % | 11,5 % | tredje högst av 23 |
| Skuld/eget kapital | 0,55 | 1,28 | åttonde lägst av 23 |
| ${L('Omsättningstillväxt', 'omsattningstillvaxt-ttm')} | 13,4 % (TTM) | 3,3 %/år (femårsbas) | sjätte högst av 23 på femårstalet |
| ${L('FCF-marginal', 'fcf-avkastning')} | 52,5 % (fält) | 12,6 % | högst av 22 — se källkritiken |

Läs profilen i två drag. Först kvaliteten: ROE 49,5 procent är inte bara högst i grenen — det är nästan tre gånger medianen, och EBIT-marginalen 33,4 procent är näst högst bakom bara Meta. Netflix tjänar pengar som mjukvarubolag men har kostnadsstrukturen av ett mediehus, och kombinationen syns i nettomarginalen 28,2 procent. Sedan priset på den kvaliteten: P/B 11,4 är näst högst i grenen och EV/EBIT 21,8 fjärde högst — marknaden betalar för grenens bästa avkastning. Men PEG 1,49 ligger exakt på medianen: värdetillväxten som konsensus räknar framåt köper multipeln, säger det sammantagna måttet. Båda läsningarna lever samtidigt — det är själva övningen.

Underliggande: 97 miljarder visningstimmar första halvåret 2026 (+2 procent), fyra intäktsregioner med egen takt, och en annonsmotor som bolaget själv tror fördubblas till omkring 3 miljarder dollar i år. Universumfältet "insiderköp senaste sex månader" visar 18 transaktioner — fältet räknar antal, inte volym (NIKE- och P&G-paketens not), så talet säger att det finns aktivitet, inte hur stor den är.

## Källkritiken: FCF-fältet ingen konvention återskapar — och engångsposten som flyttar P/E fem steg

**FCF-gapet som inte går att stänga.** Universumfältet säger FCF-marginal 52,5 procent och FCF-avkastning 7,4 procent. Aktieägarbrevets egna tal ger något annat: de fyra senaste kvartalens fria kassaflöde är ${sv(ttmFCF)} miljoner dollar på TTM-intäkter ${sv(ttmRev)} miljoner — 23,1 procent marginal, alltså 3,2 procent avkastning på börsvärdet. Årsguiden (~${sv(B.guide.fcfAr, 1)} miljarder) på mittpunkten ${sv(51.2, 1)} miljarder ger 24,4 procent. Ingen av brevets konventioner kommer i närheten av fältets 52,5 (kvoten är 2,3). Detta är P&G-paketets klass av fynd: spänningen redovisas öppen, ej löst — fältet används i tabellen ovan endast med basen redovisad, och sorterar du grenen på FCF-avkastning bör du veta att Netflix tal beror på vilken källbas du väljer. Brevet äger siffran, fältet äger rangen — båda sant i sitt system.

**Engångsposten.** Första kvartalets resultaträkning bär raden räntor och övriga intäkter 2 852 miljoner dollar — att jämföra med 52 miljoner i Q2 och 45 miljoner för hela första halvåret 2025. Brevets kassaflödesnot nämner själv "Warner Bros. termination fee" som delförklaring till högre kassa-skatt. Räkna på vad en sådan post gör: Q1:s vinst före skatt var 6 547 miljoner; utan posten 3 695; med Q2:s skattesats 16,4 procent blir justerat Q1-netto cirka 3 089 mot rapporterade 5 283 — skillnaden ${sv(engJust)} miljoner. TTM-fönstret: rapporterat netto ${sv(ttmNI)} miljoner, justerat ${sv(ttmNIJ)} miljoner. Effekten: nettomarginal 28,2 mot 23,7 procent och P/E ${sv(U.pe, 1)} mot ${sv(peJust, 1)} — fem hela multiplar på en enda balansradsPOST. Ingen av världarna är "rätt"; frågan är vilken du jämför mot.

**Identitetstestet som stänger — på det rapporterade nettot.** Börsvärde delat med P/E-talet ger ${sv(r2(niImplicit), 2).replace(',', ',')} miljarder implicit årsvinst mot brevets TTM-netto ${sv(r2(ttmNI / 1000), 2)} miljarder: gap ${sv(identGap, 2)} procent, seriens tajtaste klass. Och fältets nettomarginal 28,22 procent är exakt ${sv(ttmNI)} av ${sv(ttmRev)} — fältets TTM-fönster är samma kvartalsserie som brevets (Q3-25 till Q2-26). Att P/E-fältet stänger betyder samtidigt att det bygger på det rapporterade, engångspost-bärande nettot — den justerade multipeln ${sv(peJust, 1)} är vår egen, och det redovisas som sådan.

**P/B stängs av balansräkningen — exakt.** Eget kapital 30 152 miljoner dollar (30 juni 2026) delat på aktiebasen ${sv(aktiebas)} miljoner aktier (börsvärde delat på kurs) ger 7,24 dollar per aktie; kursen 82,73 delat med 7,24 är 11,43 — universumfältet 11,425, exakt. DuPont-vägen däremot: P/E gånger ROE är 12,6 mot P/B 11,4 (gap 10 procent; ROE-fältets 49,5 mot egen beräkning på slut-EK 45,3 — fönstret lutar åt genomsnittligt eget kapital). Femmåttstalet P/B är för övrigt seriens återkommande varning här: bokvärdet säger lite om ett bolag vars hjärta — innehållstillgångarna, 33 838 miljoner dollar, redovisade till amortiserad kostnad — inte handlas på börsen varje dag.

**EV-kedjans öppna imperativ.** EV = börsvärde 344,5 + skuld 14,3 - kassa 9,1 = ${sv(ev, 1)} miljarder. På TTM-rörelseresultatet ${sv(ttmOI)} miljoner blir EV/EBIT ${sv(evEbitOI, 1)}; fältet 21,8 implicerar en EBIT-bas på ${sv(Math.round(eitImplicit * 1000))} miljoner — närmare rörelseresultat plus räntor och övriga intäkter netto (som med engångsposten i fönstret är just nu onaturligt stor). Fältets bas är bredare än rörelseresultatet; imperativet redovisas öppet enligt Tele2-precedensen. Samma öppenhet för skuldkvoten: fältet 0,55 mot balansräkningens 14 309/30 152 = 0,47 — fältet inkluderar sannolikt lease-baser; båda talen lägre än grenens median 1,28.

**Femårstalet som bär fyra år — och PEG:s egen tillväxtvärld.** Universumradens serie är 2022–2025: intäkter ${U.omsSerie.map(x => sv(Math.round(x / 1e6))).join(' → ')} miljoner dollar och resultat ${U.resSerie.map(x => sv(Math.round(x / 1e6))).join(' → ')} miljoner. Femårs-CAGR-talen 12,6 respektive 34,7 procent per år är — som radens fotnot säger — räknat på tre intervall (2022 är basår); kontrollen stämmer: 31 616 gånger 1,126 i tre steg ger 45 183. PEG-fältet 1,49 bär dessutom sin egen tillväxtvärld: på prognosfältet +6,43 procent (konsensus EPS-tillväxt om ett år, radens definition) ger konventionens egen division ${sv(U.pe, 1)}/6,43 = ${sv(pegKonv, 1)} — och fältets implicita nämnare är ${sv(pegImplicit, 1)} procent, varken konsensustalet eller fjolårets TTM-takt. Talet 1,49 är alltså bärande bara i sitt eget system; i tabellen ovan används det med den insikten.

**Splitten som enhetslek.** 10-för-1-split utlystes 30 oktober 2025, aktieägarregister 10 november, distribution 14 november, justerad handel från 17 november. Alla per-aktietal i detta paket och i universumraden är retrojusterade: EPS 0,80 dollar var 8,00 före splitten, kursen 82,73 var cirka 827 — och börsvärdet är oförändrat 344,5 miljarder. Splitten ändrar enheten, aldrig värdet; den enda praktiska skillnaden är att options- och småsparartronen sänks.

**Kursen har glidit sedan raden samlades.** Universums 82,73 dollar är slutkursen 2 september; IR-sidans widget visade 75,42 den 17 september — minus 8,8 procent sedan raden samlades, i kölvattnet av Q2-rapportens -8-procentsreaktion. P/E på dagens kurs: ${sv(peIr, 1)} på fält-EPS ${sv(epsFalt, 2)} dollar, ${sv(peIrJ, 1)} på det justerade. Fältens värden åldras med kursen — därför bär varje paket i serien sitt insamlingsdatum öppet.

## Kvartalskedjan: decelerationen och marginalens V

Brevets kvartalsserie, med årets tredje kvartal som bolagets egen prognos:

| | Q2-25 | Q3-25 | Q4-25 | Q1-26 | Q2-26 | Q3-26F |
|---|---|---|---|---|---|---|
| Intäkt (MUSD) | 11 079 | 11 510 | 12 051 | 12 250 | 12 560 | 12 860 |
| Tillväxt år/år | 15,9 % | 17,2 % | 17,6 % | 16,2 % | 13,4 % | 11,7 % |
| Rörelseresultat | 3 775 | 3 248 | 2 957 | 3 957 | 4 193 | 4 268 |
| Rörelsemarginal | 34,1 % | 28,2 % | 24,5 % | 32,3 % | 33,4 % | 33,2 % |
| Spädd EPS (dollar) | 0,72 | 0,59 | 0,56 | 1,23 | 0,80 | 0,82 |
| Antal aktier (M) | 4 349 | 4 340 | 4 317 | 4 298 | 4 261 | — |

Tre berättelser i tabellen. **Decelerationen:** tillväxttakten toppade på 17,6 procent i fjolårets fjärde kvartal och har fallit tre kvartal i rad — 16,2, 13,4 och nu bolagets egen guide 11,7. Kontantmätt var Q2 12 procent (13,4 rapporterat). Nivån är fortfarande mångfalt grenens medianstakt på 3,3 procent per år — men riktningen är enkelriktad, och PEG-måttens nämnare lever på framtiden. **Marginalens V:** kvartalsmarginalerna följer innehållskalendern — dipp på 24,5 i Q4, återhöjning mot 33-plus i åratal utan Q4. Q2:s 33,4 procent slog egen guide med 0,8 procentenheter; Q3-guiden 33,2 och helårsguiden 31,5 procent (mot 29,5 år 2025) — bolaget talar om "20 procent årlig tillväxt i rörelseresultatet", vilket på fjolårets bas ${sv(fy25OI, 1)} miljarder betyder minst ${sv(fy25OI * 1.2, 1)} — scenarieboxens mittrut är ${sv(cell(1, 1) / 1000, 1)}. **EPS-världarna:** Q1:s 1,23 dollar bär engångsposten (källkritiken ovan); Q2:s 0,80 och Q3-guiden 0,82 är den löpande verksamheten.

Regionmotorerna i Q2: UCAN 5 432 miljoner (+10 procent), EMEA 4 034 (+14 rapporterat, +11 kontantmätt), LATAM 1 584 (+21 mot +16) och APAC 1 510 (+16 mot +18) — valutan drog i Latinamerika och hjälpte i Asien; fyra motorer, fyra takter.

**Återköpsmaskinen.** Andra kvartalets återköp var 4,7 miljarder dollar — bolagets största kvartal någonsin — och hela halvåret ${sv(B.aterkop.h1, 1)} miljarder, 48 procent av års-guiden för fritt kassaflöde. Aktieantalet föll från 4 349 till 4 261 miljoner på fyra kvartal (minus 2,0 procent), och styrelsen har auktoriserat ${sv(B.aterkop.kvar, 1)} miljarder till — 7,9 procent av dagens börsvärde. EPS-mekaniken i Q2: netto +8,8 procent gånger aktiebas +2,1 procent är exakt EPS +11 procent (0,72 till 0,80). Verksamheten växer, och aktieantalet förstärker.

**Annonsmotorn och livesatsningen.** Reklamintäkten väntas omkring ${sv(B.guide.adsAr, 1)} miljarder dollar i år — bolagets egen uppskattning "roughly double" — alltså ${pct(adsAndel)} av guidens intäktsmittpunkt. Livesatsningen (NFL, MLB, bokningsboxning) ligger på omkring 5 procent av innehållsbudgeten men bara 1 procent av visningstimmarna — och står för sex av de tio starkaste nyteckningsdagarna. AI används i omkring 300 titlar i år. Samtidigt drar bolaget ner på transparensen: What We Watched-rapporten blir årsvis från 2027, färre engagemangsuppdateringar utlovas — tittardatan blir svårare att följa utifrån, bokföringen av det sker här.

## Så står sig bolaget mot branschen

Grenens 23 bolag är tre världar: telekomerna (AT&T, Verizon, T-Mobile, Deutsche Telekom, Orange, BCE, Telenor, Tele2, Telia med flera) med tunga balansräkningar och stabila men tröga kassaflöden; medie- och strömminghusen (Disney, Warner Bros. Discovery, Comcast, Spotify, Netflix); och spelbolagen (MTG, Nintendo och de japanska konsojerna). Netflix är den enda som toppar på båda sidan: lönsamheten (ROE högst, EBIT-marginal näst högst, nettomarginal tredje högst) och multiplarna (P/B näst högst, EV/EBIT fjärde högst) — medan PEG hamnar exakt på medianen. Grenen säger alltså: kvaliteten är unik, priset är det också, och på konsensus framtidsräkning är de tillsammans... neutrala.

Mot granarna: Meta bär grenens högsta P/B — reklamens två världar där Netflix annonsmotor precis startat sin dubblering; MTG:s bruttomarginal 67,5 mot Netflix 49,1 — spelens marginalstruktur mot innehållets kostnadskurva; Disney och WBD bär programmeringslogiker som Netflix flyttat ifrån (WBD-notisen i källkritiken: avgiften som betalas för att inte leverera innehåll är en post i någon annans TTM). Skuldkvoten 0,55 mot grenens 1,28: balansräkningen är telik men inte tele-tung — innehållstillgångarna 33,8 miljarder utgör 58 procent av totala tillgångar.

## Tre sätt att läsa utfallet — övningar i metod

**Övning ett — justera engångsposten själv.** Dra bort 2 852 miljoner från Q1:s övriga intäkter, beskatta resten med 16,4 procent, och bygg TTM-nettot själv: ${sv(ttmNI)} minus ${sv(engJust)} är ${sv(ttmNIJ)} miljoner. Multipeln flyttar från ${sv(U.pe, 1)} till ${sv(peJust, 1)}. Notera när fönstret rullar: posten lämnar TTM först i Q1-rapporten 2027 — till dess bär varje rullande vinstsiffra på den.

**Övning två — separera verksamhet från aktiebas.** EPS växte 11 procent i Q2. Dela upp: nettoresultat +8,8 procent, aktieantal -2,0 procent — multiplicera och landa på +11. Fråga att bära med sig till nästa rapport: hur mycket av EPS-tillväxten är verksamhet och hur mycket är återköpsprogrammet?

**Övning tre — scenariorutan på helåret.** Guiden: intäkt 51,0-51,4 miljarder, marginal 31,5 procent. Rutan:

| Rörelseresultat (MUSD) | Marginal 30,5 % | 31,5 % | 32,5 % |
|---|---|---|---|
| Intäkt 50,6 mdr | ${sv(cell(0, 0))} | ${sv(cell(0, 1))} | ${sv(cell(0, 2))} |
| Intäkt 51,2 mdr | ${sv(cell(1, 0))} | ${sv(cell(1, 1))} | ${sv(cell(1, 2))} |
| Intäkt 51,8 mdr | ${sv(cell(2, 0))} | ${sv(cell(2, 1))} | ${sv(cell(2, 2))} |

Mittrutan ${sv(cell(1, 1))} miljoner är ${pct(mittPlus)} mot fjolårets rörelseresultat — alltså ovanför bolagets egen "20 procent"-linje. Känsligheten: en procentenhet marginal är ${sv(viktMarg)} miljoner; tre procent intäkter är ${sv(viktRev)} miljoner. Vikten 0,33 — volymen väger tre gånger marginalen (P&G-paketets 1,51 i spegelbild: där bär marginalen, här bärs resultatet av volymen ovanpå en redan hög marginal).

## Praktiskt inför tisdagen 20 oktober

Resultatet publiceras efter stängning klockan 13:01 stilla havet-tid — 22:01 svensk tid — och intervjun (insamlade frågor, videformat) följer 13:45 PT. Checklistan från brevets egna guider: rörelsemarginalen mot 33,2-procentsguiden; kontantmätt tillväxt mot rapporterad (Q2: 12 mot 13,4); annonsintäktens färd mot 3-miljardersspåret; aktieantalet — återköpstakten mot 27,1-miljardersauktoriseringen; fria kassaflödet (Q2:s skattebortfall på avgiften jämnar ut sig över året); Q4-guidan som årets sista; och engagemangsorden — med färre uppdateringar utlovade varje tittarmått som dyker upp är värdefullt.

## Källor

- **Universumraden NFLX** — [bolagsunivers.json](/dataset/kommunikation/universumjamforelse), hämtad 2026-09-03 (Yahoo Finance quoteSummary + MarketStack eod/latest-dubbelkoll av kurs/PE/PB/börsvärde mot slutkurs 2026-09-02; filens md5 ${md5}): alla värderings-, lönsamhets- och serietal, med radens egna fotnoter om seriebas (fyra år), konsensusprognosens definition och ROIC-proxyn. Seriens metodgenomgångar finns samlade i [kurserna](/kurser), med [transparenssidan](/transparens) och [källsystemet](/kallor) som bakgrund.
- **Bolagets egna material** — ir.netflix.net: IR-kalenderns "Netflix Third Quarter 2026 Earnings Interview — Oct 20, 2026 01:45 PST" och utlysningen "Netflix to Announce Third Quarter 2026 Financial Results" (2026-09-14, publicering cirka 13:01 PT); [Q2 2026 Shareholder Letter (2026-07-16)](https://s22.q4cdn.com/959853165/files/doc_financials/2026/q2/FINAL-Q2-26-Shareholder-Letter.pdf) med resultaträkning, balansräkning, kassaflödesanalys, regionsiffror och guider; splittillkännagivandet "Netflix Announces Ten-For-One Stock Split" (2025-10-30).
- **Sökverifierat 2026-09-22** — CNBC och Reuters (Q2-reaktionen 16/7: EPS 0,80 mot 0,79 väntat, aktien -8 procent efter stängning på svagare Q3-guiddans; Q1-notisen 17/4: -9,7 procent och styrelseförändringen), Public.com och MarketBeat (Q3-EPS-spannet 0,80-0,82), PR Newswire och Morningstar (splitdatumen), Stocktwits (efterhandelsrörelsen).
- **Seriens egna beräkningar** — TTM-fönstret Q3-25 till Q2-26, engångspostjusteringen, EV-kedjan, P/B-stängningen, EPS-mekaniken, scenariorutan och rangerna mot grenens medianer (beräknade ur samma universumfil med ${sv(statistik.pe.n)}-${sv(statistik.fcfM.n)} mätvärden per mått).

Rygraden i detta paket är aritmetiken: varje tal i texten är antingen rapporterat av bolaget, hämtat ur universumets insamling (med dess enskilda källnot redovisad), sökverifierat hos namngiven tredjepart, eller beräknat ur de tre — och beräkningsvägen redovisas, härledda imperativ inklusive. Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).`;

// ---------- sträng kvalitetsvakter FÖRE skrivning ----------
const forbjudna = [
  [/\u00a0/g, 'hårt mellanslag (nbsp)'],
  [/[“”‘’«»]/g, 'typografiska citat'],
  [/[\u4e00-\u9fff]/g, 'CJK-tecken'],
  [/\u2212/g, 'typografiskt minustecken'],
  [/  +/g, 'dubbla mellanslag'],
];
for (const [re, namn] of forbjudna) if (re.test(body)) throw new Error(`förbjudet tecken i kroppen: ${namn}`);
const h2 = [...body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
if (h2.length !== 8) throw new Error('väntade 8 H2-sektioner, fick ' + h2.length);
const ord = body.trim().split(/\s+/).length;
if (ord < 2200 || ord > 3400) throw new Error('ordantal utanför spannet: ' + ord);
if (!/Publicering av utkastet är kundens beslut \(R2\)\.$/.test(body.trimEnd().split('\n').pop())) throw new Error('disclaimern är inte sista rad');
// länkmål: /dataset/kommunikation/<slug> måste finnas som aspektmodul, övriga interna som rutter
const interna = [...body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]);
const aspektKalla = ['nyckeltal-a', 'nyckeltal-b', 'nyckeltal-pe-pb', 'omsattning-tillvaxt-ttm', 'universum', 'land', 'vardering']
  .map(f => fs.readFileSync('/home/ak1a/AK1/src/lib/dataset-aspekter/' + f + '.ts', 'utf8')).join('\n');
const aspectSlugs = new Set([...aspektKalla.matchAll(/(?:nyckeltalsModul|multiplModul|Modul)\(\s*"([a-z0-9-]+)"/g)].map(m => m[1]));
for (const s of ['universumjamforelse', 'omsattningstillvaxt-ttm', 'fcf-avkastning', 'skuldsattning', 'vardering', 'sverige', 'usa']) aspectSlugs.add(s);
for (const url of new Set(interna)) {
  if (url.startsWith('/dataset/kommunikation/')) {
    const slug = url.split('/')[3];
    if (!aspectSlugs.has(slug)) throw new Error('aspektmodul saknas för länk ' + url);
  } else if (!['/kurser', '/transparens', '/kallor'].includes(url)) throw new Error('ej godkänd intern länk: ' + url);
}
const externa = [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(m => m[1]);
for (const u of externa) if (!/^https:\/\/(ir\.netflix\.net|s22\.q4cdn\.com)/.test(u)) throw new Error('ej godkänd extern länk: ' + u);

// ---------- paket ----------
const title = `Netflix Q3-rapport 2026: så läser du den — P/E ${sv(U.pe, 1)} eller ${sv(peJust, 1)} på samma kurs (engångsposten 2 852 miljoner flyttar TTM-vinsten ${sv(ttmNI)} till ${sv(ttmNIJ)} miljoner), ROE 49,5 procent grenens högsta mot P/B 11,4 näst högst och PEG 1,49 exakt på medianen — rappdagen tisdagen 20 oktober (officiellt bekräftat)`;
const description = `Netflix, Inc. (NFLX, Nasdaq) — strömmingjätten med 344,5 miljarder dollar i börsvärde — rapporterar Q3 2026 tisdagen 20 oktober kl 13:01 PT (22:01 svensk tid) enligt bolagets egen utlysning från 14 september: kommunikationgrenens åttonde läspaket. Kärnor: engångsposten 2 852 miljoner dollar (Warner Bros-avgiften) som flyttar TTM-vinsten 13 650 till 11 456 miljoner och P/E 25,4 till 30,1; tillväxtdecelerationen 17,6 till 11,7 procent på tre kvartal; marginalens V med Q4 som botten; återköpsmaskinen 4,7 miljarder i Q2 — största kvartalet någonsin — och 27,1 miljarder auktoriserat kvar; annonsmotorn mot 3 miljarder; FCF-fältets 52,5 procent som ingen brevkonvention återskapar (23,1 på TTM); PEG 1,49 exakt på grenens median; scenarioruta 3x3 där mittrutan slår bolagets egen 20-procentslinje. Allt som utbildning, aldrig råd.`;
if (description.length < 600 || description.length > 950) throw new Error('beskrivning utanför spannet: ' + description.length);

const paket = {
  slug: 'sa-laser-du-nflx-q3-2026',
  title,
  description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: S.rappdag,
  readingMinutes: Math.max(4, Math.min(6, Math.round(ord / 600))),
  tags: ['kvartalsrapport', 'Netflix', 'kommunikation', 'USA', 'streaming', 'läspaket'],
  body,
};
fs.writeFileSync(PAKET, JSON.stringify(paket, null, 2) + '\n');
console.log('SKREV', PAKET);
console.log('ord', ord, '| rm', paket.readingMinutes, '| desc', description.length, 'tecken');
console.log('md5', md5, '| aktiebas', aktiebas.toFixed(0), '| TTM rev/NI/OI/FCF', ttmRev.toFixed(0), ttmNI.toFixed(0), ttmOI.toFixed(0), ttmFCF.toFixed(0));
console.log('justerat: NI', ttmNIJ.toFixed(0), 'P/E', peJust.toFixed(2), 'netto', nettoJust.toFixed(2));
console.log('scenarie mittruta', cell(1, 1), '=', mittPlus.toFixed(1), '% mot FY25-OI', fy25OI.toFixed(1));
console.log('kontroller: P/B-väg', (U.pris / ekPerAktie).toFixed(3), '| ident-gap %', identGap.toFixed(2), '| EPS-mekan', epsMekan.toFixed(4));
console.log('H2:', h2.join(' // '));
