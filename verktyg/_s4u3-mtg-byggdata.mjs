#!/usr/bin/env node
// _s4u3-mtg-byggdata.mjs — beräkningsmotor + paketbyggare för MTG-B Q3-läspaket 2026
// Alla pakettal härleds EN gång här. Rådata: universumrad MTG-B.ST i
// data/portfolj-system/bolagsunivers.json (Yahoo 2026-09-03; MarketStack saknade
// färsk kurs — universumradens egen fotnot, redovisas öppet) + sökverifierad
// kvartalskedja 2026-09-21 (källor i paketet). Ingen gissning: saknas tal lämnas
// luckan öppen (Tele2-precedensen).
import fs from 'node:fs';
import crypto from 'node:crypto';

const UNI_SOKVAG = '/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json';
const UTFIL = '/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-mtg-b-q3-2026.json';
const TALBANK = '/home/ak1a/AK1/verktyg/_s4u3-mtg-talbank.json';

const uni = JSON.parse(fs.readFileSync(UNI_SOKVAG, 'utf8'));
const md5 = crypto.createHash('md5').update(fs.readFileSync(UNI_SOKVAG)).digest('hex');
const mtg = uni.find(b => b.ticker === 'MTG-B.ST');

const sv = (x, dec = 1) => x.toLocaleString('sv-SE', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/\u00a0/g, ' ');
const sv0 = x => x.toLocaleString('sv-SE', { maximumFractionDigits: 0 }).replace(/\u00a0/g, ' ');
const pct = (x, dec = 1) => sv(x * 100, dec) + ' %';
const pctS = (x, dec = 1) => (x >= 0 ? '+' : '−') + sv(Math.abs(x) * 100, dec) + ' %';

const U = {
  pris: mtg.pris, mcap: mtg.marknadsKapitalMdr,
  pe: mtg.vardering.pe, pb: mtg.vardering.pb, evEbit: mtg.vardering.evEbit,
  peg: mtg.vardering.peg, fcfYield: mtg.vardering.fcfYield,
  roe: mtg.lonksamhet.roe, roic: mtg.lonksamhet.roic, brutto: mtg.lonksamhet.bruttoMarginal,
  ebitM: mtg.lonksamhet.ebitMarginal, nettoM: mtg.lonksamhet.nettoMarginal, fcfM: mtg.lonksamhet.fcfMarginal,
  skuldEk: mtg.stabilitet.skuldEgenkapital, insider: mtg.aterkop.insiderkopSenaste6man,
  omsCAGR: mtg.tillvaxt.omsattningCAGR5ar, resCAGR: mtg.tillvaxt.resultatCAGR5ar,
  ttm: mtg.tillvaxt.omsattningTillvaxtTTM, prognos: mtg.tillvaxt.prognosTillvaxt,
  ar: mtg.serier.ar, oms: mtg.serier.omsattning, res: mtg.serier.resultat,
};

// Sökverifierad kvartals- och verksamhetsdata (2026-09-21; källor i paketet)
const S = {
  q325: { intakt: 2987, organisk: 0.15, ebitda: 675, ebitdaM: 0.226, ro: 232, dag: '2025-11-13 kl 07:30 CET' },
  fy25: { intakt: 11579, netto: -62, eps: -0.53, ebitdaAr: 2600, organisk: 0.094, dag: '2026-02-05', fy24netto: -210, fy24eps: -1.74 },
  q126: { intakt: 3159, q125: 2557, proforma: 0.14, ebitdaM: 0.25, dag: '2026-04-29' },
  q226: { intakt: 2965, organisk: 0.06, ebitdaM: 0.24, cashConv: 0.81, dag: '2026-07-21' },
  guide26: { tillvaxtLow: 0.05, tillvaxtHigh: 0.08, ebitdaMLow: 0.22, ebitdaMHigh: 0.24 },
  plarium: { annonserat: '2024-11-11', konsoliderat: '2025-02-01', r12MUSD: 613 },
  epsJusteradRullande: 14.72, nettoJusteratRullandeMdr: 1.8,
  rappdag: '2026-11-05',
};

// serier.* lagras i KRONOR i universumfilen — Mkr-konvertering EN gång här
const omsM = U.oms.map(x => x / 1e6);
const resM = U.res.map(x => x / 1e6);

const H = {};
H.aktier = U.mcap * 1000 / U.pris;                       // M aktier (mcap Mkr)
H.epsFalt = U.pris / U.pe;                               // kr
H.nettoTTM = H.epsFalt * H.aktier;                       // Mkr
H.peJ = U.pris / S.epsJusteradRullande;
H.peKvot = U.pe / H.peJ;
H.epsKvot = S.epsJusteradRullande / H.epsFalt;
H.pbRoe = U.pb / U.roe;
H.idGap = (H.pbRoe - U.pe) / U.pe;
H.ekHärled = U.mcap * 1000 / U.pb;                       // Mkr
H.bvps = H.ekHärled / H.aktier;
H.kursBvps = U.pris / H.bvps;
H.roeKontroll = H.nettoTTM / H.ekHärled;
H.ebitImpl = U.ebitM * S.fy25.intakt;                    // Mkr
H.skurdUrKvot = H.ekHärled * U.skuldEk;                  // Mkr
H.roicProxy = H.ebitImpl / (H.skurdUrKvot + H.ekHärled);
H.evFalt = U.evEbit * H.ebitImpl / 1000;                 // mdr
H.implNettoskuld = H.evFalt - U.mcap;                    // mdr
H.implKassa = H.skurdUrKvot / 1000 - H.implNettoskuld;   // mdr
H.pegKonv = U.pe / (U.prognos * 100);
H.pegKvot = U.peg / H.pegKonv;
H.pegImplTillv = U.pe / U.peg;
H.bruttoNetto = U.brutto - U.nettoM;
H.dubbling = S.fy25.intakt / omsM[2] - 1;                // +92,5 % (11 579 mot 6 015 Mkr)
H.viaplayAndel = resM[0] / omsM[0];
H.q4ebitdaImplicit = S.fy25.ebitdaAr - 1931;             // 9M-25 justerad EBITDA 1 931
H.viaplaySomAndelAvOms = resM[0] / omsM[0];
// scenarioruta 9/9: bas FY2025, tillväxt {2, 5,5, 9} %, GAAP-nettomarginal {0,5, 1,4, 2,5} %
H.scen = [];
for (const t of [0.02, 0.055, 0.09]) for (const m of [0.005, U.nettoM, 0.025]) {
  const intakt = S.fy25.intakt * (1 + t), netto = intakt * m, eps = netto / H.aktier;
  H.scen.push({ t, m, intakt, netto, eps, pe: U.pris / eps });
}
H.marginalViktMkr = S.fy25.intakt * 1.055 * 0.01;
H.marginalViktKrona = H.marginalViktMkr / H.aktier;
H.vandning = H.nettoTTM - S.fy25.netto;                  // TTM-fönstret mot kalenderåret

// grenmedianer + rang LIVE
const kom = uni.filter(b => b.bransch === 'kommunikation');
const median = vals => { const v = vals.filter(x => x != null).sort((a, b) => a - b); if (!v.length) return null; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };
const falt = [
  ['pe', b => b.vardering?.pe], ['pb', b => b.vardering?.pb], ['evEbit', b => b.vardering?.evEbit],
  ['peg', b => b.vardering?.peg], ['fcfYield', b => b.vardering?.fcfYield], ['roe', b => b.lonksamhet?.roe],
  ['roic', b => b.lonksamhet?.roic], ['brutto', b => b.lonksamhet?.bruttoMarginal], ['ebitM', b => b.lonksamhet?.ebitMarginal],
  ['netto', b => b.lonksamhet?.nettoMarginal], ['fcfM', b => b.lonksamhet?.fcfMarginal],
  ['skuldEk', b => b.stabilitet?.skuldEgenkapital], ['ttm', b => b.tillvaxt?.omsattningTillvaxtTTM],
];
const M = {};
for (const [namn, fn] of falt) {
  const vals = kom.map(fn); const v = vals.filter(x => x != null); const mv = fn(mtg);
  M[namn] = { n: v.length, median: median(vals), vz: mv, fall: [...v].sort((a, b) => b - a).indexOf(mv) + 1, stig: [...v].sort((a, b) => a - b).indexOf(mv) + 1 };
}

const title = `MTG Q3-rapport 2026: så läser du den — P/E 93,6 eller 9,0 på samma kurs (${sv(U.pe)} mot ${sv(H.peJ)}: tiofaldiga EPS-världar när Plarium dubblat intäkterna till ${sv0(S.fy25.intakt)} miljoner kronor medan GAAP-nettot visar −62 miljoner), seriens tajtaste identitetstest (P/B ÷ ROE ${sv(H.pbRoe)} mot P/E ${sv(U.pe)} — gap ${sv(H.idGap * 100, 2)} procent), bruttomarginal 67,5 mot netto 1,4 och PEG:s två världar 0,52/9,8 — rappdagen torsdagen 5 november (officiellt bekräftat)`;

const description = `Modern Times Group (MTG B, Nasdaq Stockholm) — spelkoncernen bakom Plarium, InnoGames, Ninja Kiwi och PlaySimple, 15,8 miljarder kronor — rapporterar Q3 & 9M 2026 torsdagen 5 november enligt bolagets egen kalender (fjolårets Q3 kom 13 november kl 07:30). Läspaketet: den brutna serien — 2022 års resultat 6 475 miljoner var den sålda Viaplay-rörelsens engångsvinst, större än årets omsättning — och Plarium-konsolideringen som dubblat intäkterna till 11 579 miljoner (+92,5 procent; organiskt +9,4); P/E-klyftan 93,6 mot 9,0 (GAAP-fältet mot justerat rullande EPS 14,72 kronor, kvot 10,4); identitetstestet P/B ÷ ROE 93,76 mot P/E 93,59 = gap 0,18 procent seriens tajtaste; bruttomarginal 67,5 mot netto 1,4 procent; PEG 0,52 mot konventionens 9,8; kvartalskedjan Q3-25 → Q2-26 med rekordmarginaler och guiden 5–8 procent. Allt som utbildning, aldrig råd.`;

const kallorMd = `
## Källor

- **Universumraden MTG-B.ST** — [bolagsunivers.json](/dataset/kommunikation/universumjamforelse), hämtad 2026-09-03 (Yahoo Finance; MarketStack saknade färsk kurs — universumradens egen fotnot, ingen dubbelkoll av pris/valuation; filens md5 ${md5.slice(0, 8)}): alla värderings-, lönsamhets- och serietal.
- **Bolagets egna rapporter och kalender** — [mtg.com/reports-presentations](https://www.mtg.com/reports-presentations) och [mtg.com/financial-calendar](https://www.mtg.com/financial-calendar): Q3-2025 (2025-11-13 07:30 CET), Q4/FY2025 (2026-02-05), Q1-2026 (2026-04-29), Q2-2026 (2026-07-21), finansiella kalenderns *Q3 & 9 Months 2026 Financial Report* 2026-11-05.
- **Kvartalsdetaljer sökverifierade 2026-09-21** — MTG:s pressrum via Cision/mb.cision, Quartr, Investing.com, StockAnalysis, InDerès; divergenser (rapporterat mot konstant valuta, ADR-kurs mot Stockholmskursen) redovisas öppet i källkritiken.
- **Plarium-förvärvet** — tillkännagivet 2024-11-11, konsoliderat från 2025-02-01, rullande 12-månadersintäkt cirka 613 miljoner dollar (tillkännagivandet) — dubblingen av koncernintäkterna är konsolideringens aritmetik, inte organisk tillväxt.
`;

const nettoJusteradTxt = sv(S.nettoJusteratRullandeMdr, 1);
const body = `MTG — spelkoncernen som efter Viaplay-avyttringen byggde om sig till renodlad spelföretag med Plarium, InnoGames, Ninja Kiwi och PlaySimple i stallen, noterat som MTG B på Nasdaq Stockholm, ${sv(U.mcap, 3)} miljarder kronor i börsvärde — har som ett av få bolag i serien ett rappdatum som inte behöver estimater: **Q3 & 9M 2026 Financial Report står uppsatt på torsdagen 5 november 2026 i bolagets egen finansiella kalender** (fjolårets Q3 kom torsdagen 13 november kl 07:30 CET). Innan en enda siffra läses väntar detta pakets dörrar: en **P/E-klyfta på tiofaldig nivå** — universumfältet säger ${sv(U.pe)}, bolagets eget justerade rullande EPS säger ${sv(H.peJ)} på samma kurs ${sv(U.pris, 2)} kronor — och bakom den en **bruten serie** där 2022 års resultat (6 475 miljoner kronor) var större än årets hela omsättning, medan 2025 års omsättning dubblades av ett förvärv som samtidigt lämnade GAAP-nettot i minus. Därtill seriens tajtaste identitetstest hittills (gap ${sv(H.idGap * 100, 2)} procent) och en bruttomarginal på ${pct(U.brutto)} som möter en nettomarginal på ${pct(U.nettoM, 2)}. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är kommunikationgrenens sjunde på disk — AT&T, Tele2, Telia, Meta, Disney och Verizon före — och seriens ~80:e läspaket totalt. Sorteringen och pivoten redovisas öppet: förstavalet Verizon förlorades mot syskonagenten u2:s klaim (deras disk-klaim 2:06 före denna agents; klaim-mtime-konventionen äger, deras paket committat 854d89b0 med KVD GRÖN — detta bygge kasserades utan git-spår, VZ-klaimfilen kvarstår som tidslinjebevis). Med Verizon levererat är analysbibliotekets 22 vågvalideringsbolag slutkörda — och spårets stående kö ur Shell- och Kambi-noterna lever vidare: bland dess poster har **MTG enda bolagsbekräftade rappdatum** (NVDA 17/11 är tredjepartskonfirmerat, novemberfältets övriga estimerat; Shell-precedensen bolagsbekräftat framför estimerat avgjorde). MTG:s uppgift i serien är att visa hur man läser ett bolag där **konsolidering och organisk tillväxt kör i filéer**: koncernintäkterna +${sv(H.dubbling * 100)} procent på ett år medan den organiska tillväxten var +${sv(S.fy25.organisk * 100)} — och där samma rörelse ger två helt olika vinstbilder beroende på vilka poster man läser.

## Urvalet: varför MTG är nästa paket i serien

Duplikatkontrollen vid klaimen (2026-09-21 23:20, disk-först i data/vakten/klaim-s4u3-mtg-q3-2026.md med full pivot-bokföring): inget MTG-paket på disk, ingen MTG-rad i granskningsköns tabeller, syskonen i omgången på skilda objekt (u2 VZ levererat, u1 EQNR enligt egen klaim — båda orörda). Datumklassen är den bästa som finns: bolagets egen kalender, ingen tredjepartsestimering av datum behövs — P&G-klassens motsats och seriens lugnaste datumkapitel hittills. Historikrytmen bär: Q3-2024 kom 24 oktober, Q3-2025 den 13 november — november-halvan av fönstret är normen, och 2026 års kalender väljer den 5:e. Tidszon och språk: svensk rapport på engelska, Morgon Stockholm 07:30 CET fjolåret — telefonkonferens samma förmiddag.

Datakärnan bär, med en fotnot på ryggen: universumraden MTG-B.ST (hämtdatum 2026-09-03) har full värderingsrad, full lönsamhetstrappa och fyra räkenskapsår i både omsättning och resultat — men **MarketStack-källan saknade färsk kurs vid insamlingen**, så pris och värdering vilar på Yahoo ensam (radens egen not; i källkritiken nedan vad det betyder). Biblioteksposten saknas — MTG är inte bland de 22 vågvalideringsvaliderade bolagen utan plockat ur spårets stående kö — och paketet säger det öppet: AKM1-dom och täckningsgrad finns inte för detta objekt; universumraden är hela modellunderlaget, vilket är en läxa i sig (seriens första paket utan bibliotekspost sedan de tidiga kommunikationspaketen). Noten om bruten serie i äldre könoter (Viaplay-avvecklingen) bekräftas av universumserien och hanteras som paketets bärande källkritik, inte som galler.

## Nyckeltalen att ha med sig — med tio EPS-världar i ryggsäcken

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom kommunationsbranschen. Varningsflaggan hissas först: **alla vinst- och värderingsmått beror på EPS-världen** — se källkritiken; GAAP-fönstret och det justerade skiljer sig tiofalt. Värderingsraden:

- **P/E ${sv(U.pe)}** ([så räknas det](/dataset/kommunikation/pe)) — ${M.pe.fall}:e högst av ${M.pe.n} i grenen (median ${sv(M.pe.median)}) på GAAP-basen; den justerade världen ger ${sv(H.peJ)} — båda talen är sanna, om olika saker.
- **P/B ${sv(U.pb, 3)}** ([aspekt](/dataset/kommunikation/pb)) — ${M.pb.stig}:e lägst av ${M.pb.n} (median ${sv(M.pb.median)}).
- **EV/EBIT ${sv(U.evEbit)}** ([aspekt](/dataset/kommunikation/ev-ebit)) — strax under medianen ${sv(M.evEbit.median)} (${M.evEbit.fall}:e av ${M.evEbit.n}); branschens egen favorit EBITDA redovisas separat i kvartalskedjan.
- **PEG ${sv(U.peg, 2)}** ([aspekt](/dataset/kommunikation/peg)) — under medianen ${sv(M.peg.median, 2)}, men med seriens mest extrema nämnarfråga (övning tre).
- **FCF-avkastning ${pct(U.fcfYield, 2)}** ([aspekt](/dataset/kommunikation/fcf-avkastning)) — ${M.fcfYield.stig}:e lägst av ${M.fcfYield.n} (median ${pct(M.fcfYield.median, 2)}) (fönstrets FCF-marginal ${pct(U.fcfM, 2)}): kassaflödet är tunt i GAAP-fönstret.

Lönsamhetstrappan ([ROE](/dataset/kommunikation/roe) ${pct(U.roe, 2)} mot median ${pct(M.roe.median, 2)}; [ROIC](/dataset/kommunikation/roic) ${pct(U.roic, 2)} mot ${pct(M.roic.median, 2)}; [bruttomarginal](/dataset/kommunikation/brutto-marginal) ${pct(U.brutto)} mot ${pct(M.brutto.median)}; EBIT-marginal ${pct(U.ebitM)}; [nettomarginal](/dataset/kommunikation/netto-marginal) ${pct(U.nettoM, 2)} mot ${pct(M.netto.median, 2)}): notera ordningen — **ROE långt under ROIC är Verizon-paketets exakta spegelbild**. Där lyfte belåningen (1,84 i skuld/eget kapital) avkastningen på eget kapital över kapitalbasens; här är balansräkningen lugn (skuld/eget kapital ${sv(U.skuldEk, 2)}, ${M.skuldEk.stig}:e lägsta av ${M.skuldEk.n}) och det är resultatraden som är tunn — ROE ${pct(U.roe, 2)} på GAAP-fönstret medan kapitalet som helhet tjänar ${pct(U.roic, 2)}. [Intäktstillväxten TTM](/dataset/kommunikation/omsattningstillvaxt-ttm) ${pctS(U.ttm, 1)} — under medianen ${pctS(M.ttm.median, 1)}: det rapporterade talet dämpas av valutor och förvärvskalendern (Plarium inne i båda fönstren nu). Ingen utdelning förekommer (radens återköpsfält tomt; ${U.insider} insiderköp senaste sex månader) — utdelnings-kontrasten mot granngrenens utdelningsmaskiner är total: kassaflödet stannar i spelutvecklingen.

## Källkritiken: P/E-klyftan som tiofaldig — och en källa som saknar dubbelkoll

Kärnfyndet är **EPS-världarnas tiofaldiga klyfta**, seriens största med marginal. Universumfältets P/E ${sv(U.pe)} bygger på GAAP-EPS ${sv(H.epsFalt, 2)} kronor rullande (kursen ${sv(U.pris, 2)} delat med fältet bakväg). Bolagets egna Q3-2025-material redovisar **justerat rullande EPS 14,72 kronor** (justerat rullande netto cirka ${nettoJusteradTxt} miljarder) — samma kurs delat med det ger **P/E ${sv(H.peJ)}**. Kvot: ${sv(H.peKvot, 1)}×. Skillnaden på ${sv(S.epsJusteradRullande - H.epsFalt, 2)} kronor per aktie —${sv((S.epsJusteradRullande - H.epsFalt) / S.epsJusteradRullande * 100)} procent av det justerade — är inte justeringskosmetik i vanlig mening: det är förvärvsbokföringens kärna, där Plariumköpet (goodwill, avskrivningar, integrationskostnader, amorteringar) bor i GAAP-raden men suddas ur det justerade. Disney-paketets gap var 1,51 dollar (23,7 procent av justerat), Verizons 1,04 dollar (21,3) — MTG:s klyfta är en storleksklass för sig, och läxan är densamma skärpt: läsaren som jämför P/E mellan källor utan att fråga efter EPS-världen jämför inte samma bolag, och här skiljer världarna en faktor tio.

**Identitetstestet — seriens tajtaste, med en twist.** P/B delat med ROE ska ge P/E: ${sv(U.pb, 3)} / ${pct(U.roe, 2)} = ${sv(H.pbRoe, 2)} mot P/E ${sv(U.pe)} — gap ${sv(H.idGap * 100, 2)} procent (förra rekordet: Verizon 0,26). Men provets skönhet är vad det bär: bägge talen bor i samma GAAP-TTM-fönster (EPS ${sv(H.epsFalt, 2)}; ROE ${pct(U.roe, 2)} som netto ${sv(H.nettoTTM, 0)} miljoner delat med härlett eget kapital ${sv(H.ekHärled / 1000, 1)} miljarder — kontrollen ger ${pct(H.roeKontroll, 2)}) — provet är aldrig fel, det är fönstret som är frågan (Kambi-paketets läxa, förnyad). Och samtidigt som fönstret stämmer inom ${sv(H.idGap * 100, 2)} procent ligger det justerade fönstret en faktor ${sv(H.epsKvot, 1)} därifrån. **Valutan är rak** — svensk aktie, svensk rapport, kronor hela vägen — med en fotnot: en nyhetsförmedlares premarket-citat på ~122 dollar var ADR-kursen i dollar, inte Stockholmskursen ${sv(U.pris, 2)} kronor; Shell-valutaläxans omvända form, redovisad för att rycket på 17,3 procent efter Q2 inte ska läsas i fel valuta.

**Källtäckningens fotnot**: universumraden bär Yahoo ensam — MarketStack saknade färsk kurs vid insamlingen 2026-09-03 (radens egen not), så pris och värdering har ingen dubbelkälls-konfirmans. Skillnaden mot syskonpaketen redovisas här öppet; seriekonventionen dubbelkällar, här finns en källa. **Procentblandningens fälla**: Q3-2025-redovisningen citeras i olika källor som +108 och +126 procent — det är rapporterat mot konstant valuta (kronans styrka mot dollar valutadämpar spelintäkterna); paketet bär +108 rapporterat med konstant-valuta-noten. **Proforma-begreppet**: guiden 5–8 procent avser pro forma-intäkt (som om Plarium ägts även fjolårets jämförelsemånader) — inte rapporterad tillväxt; se övningarnas scenarioruta för vad det gör med basen.

## Kvartalskedjan: rekordmarginaler på en GAAP-förlust

Kedjan bakåt från senaste rapporterade kvartal, varje rad sökverifierad 2026-09-21:

- **Q3-2025 (13 november 2025, 07:30 CET):** nettointäkt ${sv0(S.q325.intakt)} miljoner kronor (+108 procent rapporterat; +126 i konstant valuta; organisk +${sv(S.q325.organisk * 100)} procent), justerad EBITDA ${sv0(S.q325.ebitda)} miljoner (${pct(S.q325.ebitdaM)} — mot 27,1 året före: Plarium-konsolideringen är marginallöpande i dyningen), rörelseresultat ${sv0(S.q325.ro)} miljoner.
- **Q4/FY2025 (5 februari 2026):** helåret landade på ${sv0(S.fy25.intakt)} miljoner (+${sv(H.dubbling * 100)} procent mot 2024 — dubbleringen är Plarium, konsoliderad från 1 februari 2025; organisk tillväxt +${sv(S.fy25.organisk * 100)} procent, över den egna guiden 7–9), justerad EBITDA rekord cirka ${sv0(S.fy25.ebitdaAr)} miljoner för året — medan GAAP-nettot blev ${sv0(S.fy25.netto)} miljoner och EPS ${sv(S.fy25.eps, 2)} kronor (2024: ${sv0(S.fy25.fy24netto)} miljoner, EPS ${sv(S.fy25.fy24eps, 2)}). Q4:s justerade EBITDA implicit: ${sv0(S.fy25.ebitdaAr)} − 9M:s 1 931 = ${sv0(H.q4ebitdaImplicit)} miljoner.
- **Q1-2026 (29 april 2026):** nettointäkt ${sv0(S.q126.intakt)} miljoner (+24 procent mot ${sv0(S.q126.q125)}; pro forma +${sv(S.q126.proforma * 100)} procent — rekordkvartal), justerad EBITDA-marginal ${pct(S.q126.ebitdaM)}. Guiden för 2026 satt: pro forma-intäktstillväxt +${sv(S.guide26.tillvaxtLow * 100)}–${sv(S.guide26.tillvaxtHigh * 100)} procent, justerad EBITDA-marginal ${pct(S.guide26.ebitdaMLow)}–${pct(S.guide26.ebitdaMHigh)}.
- **Q2-2026 (21 juli 2026):** nettointäkt ${sv0(S.q226.intakt)} miljoner (+${sv(S.q226.organisk * 100)} procent organisk i konstant valuta; +2 rapporterat), justerad EBITDA-marginal ${pct(S.q226.ebitdaM)}, kassakonvertering ${pct(S.q226.cashConv)} — aktien +17,3 procent på rapportdagen (ADR-notet ovan).

Tre mönster att läsa kedjan efter. **Marginallöpningen**: 22,6 → ${pct(S.q126.ebitdaM)} → ${pct(S.q226.ebitdaM)} — rekordmarginaler mitt i konsolideringen, och Q3-2026 ligger guide-mitt ${pct(S.guide26.ebitdaMLow, 0)}–${pct(S.guide26.ebitdaMHigh, 0)} i sikte. **De två rapportspråken**: varje rapport talar EBITDA och organisk tillväxt i rubriken, GAAP i fotnoten — ${sv0(S.fy25.netto)} miljoner i helårsnetto mot ${sv0(S.fy25.ebitdaAr)} i justerad EBITDA är samma verksamhet på två språk. **Serien som skor**: 2022 års resultat ${sv0(resM[0])} miljoner — ${sv(H.viaplayAndel * 100)} procent av årets omsättning — är den sålda Viaplay-rörelsens engångsvinst (avknoppningen till NENT 2022); sedan ${sv0(resM[1])}, ${sv0(resM[2])}, ${sv0(resM[3])}. Universumradens resultatCAGR är null (förlustbasår — Newmont- och Kambi-klassens konvention: CAGR från negativ bas är meningslös och beräknas ej), och omsättningstillväxten +${sv(U.omsCAGR * 100)} procent per år är basårs- och förvärvsdriven: den organiska motorn står i +${sv(S.fy25.organisk * 100)} (FY25) och +${sv(S.q226.organisk * 100)} (Q2-26). CAGR läses aldrig utan att fråga vad som hände mellan ändpunkterna — MTG är seriens renaste exempel.

## Så står sig bolaget mot branschen

Kommunikationsgrenen i bolagsuniversumet: ${kom.length} bolag, medianer räknade LIVE ur filen (n varierar med fältens täckning). Tabellen läses: MTG-värde, grenens median, MTG:s rang.

| Nyckeltal | MTG | Grenens median | Rang |
|---|---|---|---|
| P/E | ${sv(U.pe)} | ${sv(M.pe.median)} | ${M.pe.fall}:e högst av ${M.pe.n} |
| P/B | ${sv(U.pb, 3)} | ${sv(M.pb.median)} | ${M.pb.stig}:e lägst av ${M.pb.n} |
| EV/EBIT | ${sv(U.evEbit)} | ${sv(M.evEbit.median)} | ${M.evEbit.fall}:e av ${M.evEbit.n} |
| PEG | ${sv(U.peg, 2)} | ${sv(M.peg.median, 2)} | ${M.peg.stig}:e lägst av ${M.peg.n} |
| FCF-avkastning | ${pct(U.fcfYield, 2)} | ${pct(M.fcfYield.median, 2)} | ${M.fcfYield.stig}:e lägst av ${M.fcfYield.n} |
| ROE | ${pct(U.roe, 2)} | ${pct(M.roe.median, 2)} | ${M.roe.stig}:e lägst av ${M.roe.n} |
| ROIC | ${pct(U.roic, 2)} | ${pct(M.roic.median, 2)} | ${M.roic.fall}:e högst av ${M.roic.n} |
| Bruttomarginal | ${pct(U.brutto)} | ${pct(M.brutto.median)} | ${M.brutto.fall}:e högst av ${M.brutto.n} |
| EBIT-marginal | ${pct(U.ebitM)} | ${pct(M.ebitM.median)} | ${M.ebitM.fall}:e högst av ${M.ebitM.n} |
| Nettomarginal | ${pct(U.nettoM, 2)} | ${pct(M.netto.median, 2)} | ${M.netto.stig}:e lägst av ${M.netto.n} |
| Skuld/eget kapital | ${sv(U.skuldEk, 2)} | ${sv(M.skuldEk.median, 2)} | ${M.skuldEk.stig}:e lägsta av ${M.skuldEk.n} |
| Intäktstillväxt TTM | ${pctS(U.ttm, 1)} | ${pctS(M.ttm.median, 1)} | ${M.ttm.fall}:e högst av ${M.ttm.n} |

Läsarten i tre rader: MTG är **grenens dyraste aktie på GAAP-P/E** (${M.pe.fall}:e av ${M.pe.n}) och bland de billigaste på P/B (${M.pb.stig}:e lägst) — samma klyfta som EPS-världarna, nu i grenspegeln; **bruttomarginalen ${pct(U.brutto)} är ${M.brutto.fall}:e högst** (datorspelslicensernas ekonomi) men vägen till netto ${pct(U.nettoM, 2)} slukar ${sv(H.bruttoNetto * 100)} procentenheter — utvecklingskostnader, marknadsföring, Plarium-avskrivningar; **balansräkningen är lugn** (${M.skuldEk.stig}:e lägsta skuldkvoten) medan resultatraden är tunn — omvända Verizon. Jämförelseklassen i grenen: spel- och plattformsbolag (Meta, Netflix, Spotify) och tornoperatörer (AT&T, Telia, Tele2, Verizon) — MTG är den lilla spelkoncernen bland giganterna, och per talrad hamnar den i ytterlägena. [Universumjämförelsen i sin helhet](/dataset/kommunikation/universumjamforelse) visar alla lager.

## Tre sätt att läsa utfallet — övningar i metod

**Övning ett — P/E-tiofaldigten.** Kursen ${sv(U.pris, 2)} kronor delat med GAAP-EPS ${sv(H.epsFalt, 2)} ger ${sv(U.pe)}; delat med justerat rullande EPS ${sv(S.epsJusteradRullande, 2)} ger ${sv(H.peJ)} — kvot ${sv(H.peKvot, 1)}. Frågan övningen tränar: var bor differensen på ${sv(S.epsJusteradRullande - H.epsFalt, 2)} kronor? Sökord: avskrivningar på förvärvat goodwill, avbrytbara integrationskostnader, valutaeffekter. Kontrollen att bära in i Q3-rapporten: bolaget redovisar själv bryggan mellan GAAP och justerat i varje rapport — läs den tabellen före rubriken, och notera att det justerade rullande talet ${sv(S.epsJusteradRullande, 2)} kronor är Q3-2025-rapportens tal (fönstret Q2-24 till Q3-25), alltså tre kvartal gammalt vid nästa rapport — efter Q3-2026 finns ett färskt, och det är då paritetsprovet (VZ-paketets signatur) kan köras för MTG med full precision.

**Övning två — identitetstestet och EV-imperativet.** Tre väger: ${sv(U.pb, 3)} / ${pct(U.roe, 2)} = ${sv(H.pbRoe, 2)} mot P/E ${sv(U.pe)} (gap ${sv(H.idGap * 100, 2)} procent — seriens tajtaste); EK härlett ur P/B ${sv(U.mcap)} miljarder / ${sv(U.pb, 3)} = ${sv(H.ekHärled / 1000, 1)} miljarder; bokfört per aktie ${sv(H.bvps, 2)} kronor, kurs delat med bokfört ${sv(H.kursBvps, 3)} — P/B-fältet igen. ROE-kontrollen stänger: netto ${sv(H.nettoTTM, 0)} miljoner / EK ${sv(H.ekHärled / 1000, 1)} miljarder = ${pct(H.roeKontroll, 2)} mot fältets ${pct(U.roe, 2)}. EV-sidan är ett imperativ, inte en kedja — kassapost saknas i universumraden (Tele2-precedensen: luckan lämnas öppen): EV/EBIT ${sv(U.evEbit)} × EBIT-imperativet (${pct(U.ebitM)} × ${sv0(S.fy25.intakt)} = ${sv0(H.ebitImpl)} miljoner) ger EV ${sv(H.evFalt, 1)} miljarder ⇒ implicit nettoskuld ${sv(H.implNettoskuld, 1)} miljarder mot skuld-ur-kvot ${sv(H.skurdUrKvot / 1000, 1)} miljarder ⇒ imperativ kassa runt ${sv(H.implKassa, 1)} miljarder — talen är härledda, inte rapporterade, och redovisas som sådana. ROIC-proxyn samma väg: ${sv0(H.ebitImpl)} / (${sv(H.skurdUrKvot / 1000, 1)} + ${sv(H.ekHärled / 1000, 1)}) = ${pct(H.roicProxy, 2)} mot fältets ${pct(U.roic, 2)} (gap ${sv(Math.abs(H.roicProxy - U.roic) / U.roic * 100)} procent — proxyns årsbas mot fältets fönster, redovisas öppet).

**Övning tre — PEG:s omöjliga nämnare.** Fältet säger PEG ${sv(U.peg, 2)}: P/E ${sv(U.pe)} delat med det implicerar en vinsttillväxt på ${sv(H.pegImplTillv, 0)} procent per år. Konsensusfältet i samma rad: prognostillväxt ${pctS(U.prognos, 2)} procent, som nämnare ger PEG ${sv(H.pegKonv)}. Kvot ${sv(H.pegKvot, 3)} — seriens mest extremt isärdrivna PEG-par (Verizons 0,36, Prologis universumrekord 121,6 bland motsatserna): källans PEG-nämnare härstammar sannolikt från en tillväxtperiod eller beräkning som varken är fältets prognos eller något bolaget guidar. Läxan från VZ-paketet förlängs: räkna PEG själv, från en tillväxtdefinition du kan försvara — och när källans och konventionens PEG skiljer med en faktor tjugo är svaret aldrig att välja den billigaste.

**Scenariorutan** — metod, inte prognos: basen är FY2025:s rapporterade intäkt ${sv0(S.fy25.intakt)} miljoner (guidens 5–8 procent gäller pro forma — basen är därför den rapporterade, med proforma-noten redovisad), tre tillväxtlägen (${pctS(0.02)} svagt, ${pctS(0.055)} mitt, ${pctS(0.09)} starkt organiskt) mot tre GAAP-nettomarginaler (${pct(0.005, 1)} nu-nivå, ${pct(U.nettoM, 2)} universumradens, ${pct(0.025, 1)} halverat gap mot EBIT-marginalen). Cellerna: netto (miljoner), EPS (kronor), P/E på dagens kurs.

| Intäkt → marginal ↓ | ${pctS(0.02)} (${sv0(H.scen[0].intakt)} Mkr) | ${pctS(0.055)} (${sv0(H.scen[3].intakt)} Mkr) | ${pctS(0.09)} (${sv0(H.scen[6].intakt)} Mkr) |
|---|---|---|---|
| **${pct(0.005, 1)}** | ${sv(H.scen[0].netto, 1)} · ${sv(H.scen[0].eps, 2)} · ${sv(H.scen[0].pe)} | ${sv(H.scen[3].netto, 1)} · ${sv(H.scen[3].eps, 2)} · ${sv(H.scen[3].pe)} | ${sv(H.scen[6].netto, 1)} · ${sv(H.scen[6].eps, 2)} · ${sv(H.scen[6].pe)} |
| **${pct(U.nettoM, 2)}** | ${sv(H.scen[1].netto, 1)} · ${sv(H.scen[1].eps, 2)} · ${sv(H.scen[1].pe)} | ${sv(H.scen[4].netto, 1)} · ${sv(H.scen[4].eps, 2)} · ${sv(H.scen[4].pe)} | ${sv(H.scen[7].netto, 1)} · ${sv(H.scen[7].eps, 2)} · ${sv(H.scen[7].pe)} |
| **${pct(0.025, 1)}** | ${sv(H.scen[2].netto, 1)} · ${sv(H.scen[2].eps, 2)} · ${sv(H.scen[2].pe)} | ${sv(H.scen[5].netto, 1)} · ${sv(H.scen[5].eps, 2)} · ${sv(H.scen[5].pe)} | ${sv(H.scen[8].netto, 1)} · ${sv(H.scen[8].eps, 2)} · ${sv(H.scen[8].pe)} |

Vikterna att minnas: en procentenhet GAAP-nettomarginal på mittens intäkt flyttar nettot ${sv0(H.marginalViktMkr)} miljoner = ${sv(H.marginalViktKrona, 2)} kronor per aktie — och för varje sådan krona sjunker P/E från ${sv(U.pe)} steg mot det justerade ${sv(H.peJ)}. Rutan visar också varför branschen läser EBITDA: GAAP-marginalens känslighet gör EV/EBITDA-rutan (${pct(S.guide26.ebitdaMLow)}–${pct(S.guide26.ebitdaMHigh)} på samma intäkter) till den stabilare läsningen — de två språken igen, nu i övningsformat. Och vändningsräkningen: TTM-fönstret bär netto ${sv(H.nettoTTM, 0)} miljoner mot kalenderårets ${sv0(S.fy25.netto)} — differensen ${sv0(H.vandning)} miljoner är de två första 2026-kvartalens sammanlagda sväng från förlust till (fönstervinst), rapportens räkenskapliga kärna att följa vid Q3.

## Praktiskt inför torsdagen 5 november

Tre saker att göra före rapporten, i fallande ordning. **Först: boka bevakningspunkten** — [mtg.com/financial-calendar](https://www.mtg.com/financial-calendar) — datumet står redan där (Q3 & 9M 2026, 5 november); fjolårets rytm 07:30 CET med webcast samma förmiddag är tidsnormen att räkna med. **Andra: bygg dina två fönster innan rapporten** — det justerade rullande EPS ${sv(S.epsJusteradRullande, 2)} kronor (Q3-25-rapportens tal, tre kvartal gammalt) och GAAP-fönstrets ${sv(H.epsFalt, 2)} kronor — Q3-2025:rullar ur, Q3-2026 rullar in i bägge, och rapportens första läsning är hur de två summorna rör sig. **Tredje: de tre talen att läsa först** — organisk tillväxt (kedjan +${sv(S.q226.organisk * 100)} (Q2-26) mot +${sv(S.q325.organisk * 100)} (Q3-25): trenden att slå eller bryta), justerad EBITDA-marginal mot guidens ${pct(S.guide26.ebitdaMLow)}–${pct(S.guide26.ebitdaMHigh)} (Q2 landade ${pct(S.q226.ebitdaM)}), och GAAP-nettots bana (vändningsräkningen ${sv0(H.vandning)} miljoner ovan). Bakom dem: pro forma-avstämningen (rapporterat mot pro forma i samma rapport — basen i scenariorutan) och Plarium-avskrivningarnas årsbana. [Ordlistan](/kurser) och [transparensen](/transparens) förklarar metodens delar; [källöversikten](/kallor) redovisar hela underlaget.
${kallorMd}
Rygraden i detta paket är aritmetiken: varje tal i texten är antingen rapporterat av bolaget, hämtat ur universumets insamling (med dess enskilda-källnot redovisad), sökverifierat hos namngiven tredjepart, eller beräknat ur de tre — och beräkningsvägen redovisas, härledda imperativ inklusive. Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).`;

const paket = {
  slug: 'sa-laser-du-mtg-b-q3-2026',
  title,
  description,
  pillar: 'Institutionell metodik',
  author: 'AK1A Research Lab',
  publishedAt: '2026-11-05',
  readingMinutes: Math.max(3, Math.round(body.trim().split(/\s+/).length / 600)),
  tags: ['kvartalsrapport', 'MTG', 'kommunikation', 'Sverige', 'datorspel', 'läspaket'],
  body,
};

fs.writeFileSync(UTFIL, JSON.stringify(paket, null, 1) + '\n');
fs.writeFileSync(TALBANK, JSON.stringify({ md5, U, S, H, M, scen: H.scen }, null, 1) + '\n');

console.log('SKREV', UTFIL);
console.log('ord:', body.trim().split(/\s+/).length, '| desc tecken:', description.length);
console.log('md5:', md5);
console.log('aktier M:', sv(H.aktier, 2), '| epsFalt:', sv(H.epsFalt, 2), '| nettoTTM Mkr:', sv(H.nettoTTM, 0));
console.log('peJ:', sv(H.peJ), '| kvot:', sv(H.peKvot, 1), '| pbRoe:', sv(H.pbRoe, 2), '| idGap %:', sv(H.idGap * 100, 2));
console.log('scen-mitt:', sv0(H.scen[4].netto), 'EPS', sv(H.scen[4].eps, 2), 'P/E', sv(H.scen[4].pe));
console.log('P/E-rang:', M.pe.fall, 'av', M.pe.n, '| brutto-rang:', M.brutto.fall, '| P/B-lägst:', M.pb.stig, 'av', M.pb.n);
