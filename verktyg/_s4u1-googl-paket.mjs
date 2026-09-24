#!/usr/bin/env node
// _s4u1-googl-paket.mjs — bygger Alphabet Q3-2026-läspaketet (s4-u1 redispatch, klaim
// data/vakten/klaim-s4u1-googl-q3-2026.md). Källor: bolagsunivers.json 2026-09-03 (GOOGL)
// + sökverifierade rappdatum/kvartalstal 2026-09-21 (se källsektionen i paketet).
// Skriver målfil + byggdata för KVD. Medianer/rang beräknas LIVE ur universumet.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const A = U.find(p => p.ticker === "GOOGL");
const tek = U.filter(p => p.bransch === "teknik");
const med = a => { const s = a.filter(v => typeof v === "number" && isFinite(v)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const g = (p, s) => s.split(".").reduce((o, k) => o && o[k], p);
const rang = (path) => { const v = g(A, path); const a = tek.map(p => g(p, path)).filter(x => typeof x === "number" && isFinite(x)); return { v, m: med(a), n: a.length, r: a.filter(x => x < v).length + 1 }; };

const R = {
  pe: rang("vardering.pe"), pb: rang("vardering.pb"), evEbit: rang("vardering.evEbit"), peg: rang("vardering.peg"),
  fcf: rang("vardering.fcfYield"), roe: rang("lonksamhet.roe"), roic: rang("lonksamhet.roic"),
  brutto: rang("lonksamhet.bruttoMarginal"), ebit: rang("lonksamhet.ebitMarginal"), netto: rang("lonksamhet.nettoMarginal"),
  fcfMarg: rang("lonksamhet.fcfMarginal"), skuld: rang("stabilitet.skuldEgenkapital"),
  cagrOms: rang("tillvaxt.omsattningCAGR5ar"), cagrRes: rang("tillvaxt.resultatCAGR5ar"), ttm: rang("tillvaxt.omsattningTillvaxtTTM"), prognos: rang("tillvaxt.prognosTillvaxt"),
};
const uMed = {
  pe: med(U.map(p => g(p, "vardering.pe")).filter(x => typeof x === "number")),
  pb: med(U.map(p => g(p, "vardering.pb")).filter(x => typeof x === "number")),
  evEbit: med(U.map(p => g(p, "vardering.evEbit")).filter(x => typeof x === "number")),
  roe: med(U.map(p => g(p, "lonksamhet.roe")).filter(x => typeof x === "number")),
  ebit: med(U.map(p => g(p, "lonksamhet.ebitMarginal")).filter(x => typeof x === "number")),
  netto: med(U.map(p => g(p, "lonksamhet.nettoMarginal")).filter(x => typeof x === "number")),
  brutto: med(U.map(p => g(p, "lonksamhet.bruttoMarginal")).filter(x => typeof x === "number")),
  skuld: med(U.map(p => g(p, "stabilitet.skuldEgenkapital")).filter(x => typeof x === "number")),
  ttm: med(U.map(p => g(p, "tillvaxt.omsattningTillvaxtTTM")).filter(x => typeof x === "number")),
};

// — Formatering (svenska tal) —
const H = (v, d = 2) => v.toFixed(d).replace(".", ",").replace(/(\d)(\d{3}),/, "$1 $2,");
const P = v => (v * 100).toFixed(2).replace(".", ",");
const P1 = v => (v * 100).toFixed(1).replace(".", ",");
const T = v => Math.round(v).toString().replace(/(\d)(\d{3})$/, "$1 $2").replace(/(\d)(\d{3}) (\d{3})$/, "$1 $2 $3");

// — Kontroller (ren aritmetik) —
const pris = A.pris;                         // 337,12 USD
const pe = A.vardering.pe, pb = A.vardering.pb;
const ttmEps = pris / pe;                    // implicit TTM-EPS
const aktietal = A.marknadsKapitalMdr * 1000 / pris; // miljoner aktier
const ttmNetto = ttmEps * aktietal;          // MUSD
const q3_25 = 102.35, q1_26 = 109.9, q2_26 = 119.8;          // mdr USD, rapporterade
const q1_25 = 90.234, q2_25 = 96.428;                        // mdr USD, rapporterade
const fy25 = A.serier.omsattning[3] / 1e9;                   // 402,836
const q4_25 = fy25 - (q1_25 + q2_25 + q3_25);                // härledd
const ttmOms = q3_25 + q4_25 + q1_26 + q2_26;                // mdr USD
const ttmFcf = ttmOms * 1000 * A.lonksamhet.fcfMarginal;     // MUSD
const vinstKvot = ttmNetto / ttmFcf;
const ttmEbit = ttmOms * 1000 * A.lonksamhet.ebitMarginal;   // MUSD
const evVag = A.vardering.evEbit * ttmEbit;                  // MUSD — EV via fältet
const psIdent = pe * A.lonksamhet.nettoMarginal;
const psMcap = A.marknadsKapitalMdr / ttmOms;
const pegKonv = pe / Math.abs(A.tillvaxt.prognosTillvaxt * 100);
const cagrOmsK = (Math.pow(fy25 / (A.serier.omsattning[0] / 1e9), 1 / 3) - 1) * 100;
const cagrResK = (Math.pow((A.serier.resultat[3] / 1e6) / (A.serier.resultat[0] / 1e6), 1 / 3) - 1) * 100;
const nettoMargFy25 = (A.serier.resultat[3] / A.serier.omsattning[3]) * 100;
const q2opMarg = 40.8 / q2_26 * 100;
const q1opMarg = 36.1;                        // rapporterad
const cloudQ3_25 = 15.2, cloudQ1_26 = 20.03, cloudQ2_26 = 24.8;
const cloudAndel2 = cloudQ2_26 / q2_26 * 100;
const engangsEps = 6.26, epsQ2 = 9.11, epsQ1 = 5.11, epsFjol = 2.87, epsKonsFjol = 2.29;
const engangsAndel = engangsEps / epsQ2 * 100;
const scBas = fy25 * 1000 * A.lonksamhet.ebitMarginal;       // MUSD
const scCell = (dOms, dM) => (fy25 * 1000 * (1 + dOms)) * (A.lonksamhet.ebitMarginal + dM);
const sc = [];
for (const d of [-0.03, 0, 0.03]) for (const m of [-0.01, 0, 0.01]) sc.push(scCell(d, m));
const pp1 = fy25 * 1000 * 0.01, p3 = fy25 * 1000 * 0.03;
const konsensusOms = 126.85, konsensusEps = 2.99;
const konsensusTillv = (konsensusOms / q3_25 - 1) * 100;

// — Serieindex —
const dir = "/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/";
const paket = readdirSync(dir).filter(f => f.startsWith("sa-laser-du-") && f.endsWith(".json") && f !== "sa-laser-du-alphabet-q3-2026.json");
const serieNr = paket.length + 1;
const teknikSlug = ["abb", "asml", "ericsson", "hexagon", "logitech", "microsoft", "nokia", "sap", "samsung", "truecaller"];
const teknikPåDisk = teknikSlug.filter(s => paket.some(f => f.includes(s))).length;

const data = {
  genererad: "2026-09-21", agent: "s4-u1 redispatch (klaim klaim-s4u1-googl-q3-2026)",
  universum: { hamtat: A.hamtat, pris, mcapMdr: A.marknadsKapitalMdr, pe, pb, evEbit: A.vardering.evEbit, peg: A.vardering.peg, fcfYield: A.vardering.fcfYield, roe: A.lonksamhet.roe, roic: A.lonksamhet.roic, brutto: A.lonksamhet.bruttoMarginal, ebitMarg: A.lonksamhet.ebitMarginal, nettoMarg: A.lonksamhet.nettoMarginal, fcfMarg: A.lonksamhet.fcfMarginal, skuldEk: A.stabilitet.skuldEgenkapital, cagrOms: A.tillvaxt.omsattningCAGR5ar, cagrRes: A.tillvaxt.resultatCAGR5ar, ttm: A.tillvaxt.omsattningTillvaxtTTM, prognos: A.tillvaxt.prognosTillvaxt },
  serier: { ar: A.serier.ar, oms: A.serier.omsattning, res: A.serier.resultat },
  gren: { n: tek.length, ...Object.fromEntries(Object.entries(R).map(([k, x]) => [k, { v: x.v, m: x.m, n: x.n, r: x.r }])) },
  universumMedianer: { ...uMed, nPoster: U.length },
  kontroller: { ttmEps, aktietal, ttmNetto, q4_25, ttmOms, ttmFcf, vinstKvot, ttmEbit, evVag, psIdent, psMcap, pegKonv, cagrOmsK, cagrResK, nettoMargFy25, q2opMarg, cloudAndel2, engangsAndel, scBas, sc, pp1, p3, konsensusTillv, serieNr, teknikPåDisk },
  kvartal: {
    q3_25: { oms: q3_25, eps: epsFjol, rapp: "2025-10-28", not: "första 100-mdr-kvartalet; +16 % (15 % CC); netto ~35 mdr; Cloud 15,2 (+34 %) med op 3,6 (+85 %, marginal 23,7 %); orderstock 155 mdr; capexguidans 2025 höjd till 91–93 mdr" },
    q1_26: { oms: q1_26, op: 39.7, opMarg: q1opMarg, netto: 62.6, eps: epsQ1, rapp: "2026-04-29", not: "+22 %; op 39,7 (+30 %), marginal 36,1 % (+2 pp); netto 62,6 (+81 %) med icke-operativa poster; Cloud 20,03 (+63 %), Cloud-op 6,6 (tredjedelat); orderstock över 460 mdr; capexguidans 2026 höjd till upp till 190 mdr" },
    q2_26: { oms: q2_26, op: 40.8, opMarg: q2opMarg, netto: 112.1, eps: epsQ2, rapp: "2026-07-22", not: "+24 % (mot LSEG 116,93); op 40,8 (+30 %), marginal 34 %; netto 112,1 med 98 mdr i övriga räkningar; Cloud 24,8 (+82 %)" },
    q3_26: { omsKonsensus: konsensusOms, epsKonsensus: konsensusEps, rapp: "2026-10-27/28 (estimat, ej utlyst)", not: "investing.com bokar 27/10 med oms-förväntan 126,85 mdr; Public.com + Wall Street Horizon bokar 28/10 AMC (obekräftat) med EPS-estimat 2,99" },
  },
};

const f1c = x => (x / 1000).toFixed(1).replace(".", ",").replace(/(\d)(\d{3}),/, "$1 $2,");
const ruta = [
  ["Intäkter " + H(fy25 * 0.97, 1), f1c(sc[0]), f1c(sc[1]), f1c(sc[2])],
  ["Intäkter " + H(fy25, 1), f1c(sc[3]), f1c(sc[4]), f1c(sc[5])],
  ["Intäkter " + H(fy25 * 1.03, 1), f1c(sc[6]), f1c(sc[7]), f1c(sc[8])],
];

const body = `Alphabet — moderbolaget bakom Google, noterat som GOOG och GOOGL på Nasdaq — öppnar sitt rapportfönster för kalenderkvartalet juli–september 2026 i slutet av oktober: tredjepartskalendrarna bokar **onsdagen 28 oktober efter stängning** (Public.com och Wall Street Horizon; investing.com har tisdagen 27 — fönstret 27–28 oktober redovisas öppet nedan), och fjolårets motsvarande rapport kom den 28 oktober 2025. Men innan en enda siffra läses väntar detta pakets två dörrar: en **engångspost i hundramiljardklassen** som sitter kvar i alla rullande tal — och en **kapitalutgiftsmaskin** som gör att redovisad vinst och kassaflöde för närvarande är två olika världar. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är teknikgrenens elfte på disk — ABB, ASML, Ericsson, Hexagon, Logitech, Microsoft, Nokia, SAP, Samsung och Truecaller före — och seriens cirka ${serieNr}:e läspaket totalt. Alphabet är seriens största bolag hittills med börsvärde över fyra biljoner dollar i universumets huvudkälla, och paketets uppgift är att visa hur man läser ett bolag där nästan varje offentlig multipel just nu bär samma diagnos: resultaträkningens nederdel är under ombyggnad. Två kvartal i rad har poster utanför driften lyft nettovinsten till nivåer som får vinstmarginalen att se ut som ett mjukvaruföretags dröm — ${P1(A.lonksamhet.nettoMarginal)} procent i universumets mätfönster — samtidigt som det fria kassaflödet pressats till ${P1(A.lonksamhet.fcfMarginal)} procent av omsättningen. Skillnaden mellan de två talen är själva lektionen.

## Urvalet: varför Alphabet är nästa paket i serien

Sorteringen redovisas öppet, som alltid: tidigaste återstående rappdagen med bärande universumdata. Läget efter ${paket.length} paket på disk: förra fabriksomgången tog Newmont (22 oktober), Logitech (27 oktober) och Microsoft (27–28 oktober) — och därmed är **Alphabet 28 oktober tidigaste återstående fönstret bland bibliotekets olevererade**. Därefter i kön: Meta 28 oktober (estimat), Chevron 30 oktober (estimat), Palantir 2 november (projektion), Disney 12 november (estimat) och Verizon helt utan exakt datum. Alphabet väljs före Meta på listordningen i de två senaste paketens könoter — tie-breaket är dokumenterat i klaimfilen.

Sedan P&G-raden, som alltid: datumklassen redovisas ärligt. Alphabet har **ingen egen utlysning publicerad** vid paketets byggtid (2026-09-21) — USA-bolag bekräftar exakt datum via pressrelease veckorna före rappdagen. Men rytmen bär: 2026 års båda rapporter kom på **onsdagar** — Q1 den 29 april, Q2 den 22 juli — och 28 oktober 2026 är en onsdag. Två av tre tredjepartskällor bokar den dagen (den tredje dagen före). Klassen är estimerat-med-bärande-rytm, exakt som Logitech- och Newmont-paketens datum — och kommer bolagets utlysning med annat datum är det nya rader i det öppna kvittot, inget annat. Grenkalendern (kalender-teknik.json, hämtad 2026-09-15) bokar 28 oktober med noten "estimerat, ej officiellt bekräftat".

Datakärnan bär. Universumraden för GOOGL (hämtdatum 2026-09-03, dubbelkällad Yahoo Finance och MarketStack med slutkurs 2026-09-02) har full värderingsrad, full lönsamhetstrappa och fyra sammanhängande räkenskapsår i både omsättning och resultat. Biblioteksposten från 2026-09-04 ger modellagets dom: **gul status** med datatackning 0,7113 och AKM1-poäng 47,4 av 71,1 möjliga — lönsamhet starkaste kategorin (4,33 av 5), katalysatorn svagast (0 av 5). För ett bolag utan pågående katalysator i modellens ögon är rappdagen själv den katalysator som finns — och för detta bolag är rappdagen dessutom platsen där engångspostens efterspel får sin nästa uppföljning.

## Nyckeltalen att ha med sig — med engångspostens fingeravtryck synligt

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom teknikbranschen. En varningsflagga hissas direkt: fönstret är rullande tolv månader juli 2025 till juni 2026 — det innehåller **båda** de engångsstoffade kvartalen. Varje tal som rör vinsten i nederdelen av resultaträkningen bär fingeravtrycket.

**Värdering — multiplarna på ett blåst TTM-fönster**

- Pris per vinst (P/E): **${H(pe)}** — [P/E inom teknik](/dataset/teknik/pe). Sjunde lägsta av ${R.pe.n} i grenen, under medianen ${H(R.pe.m)} och under universumets median ${H(uMed.pe)}. Men läs det som det är: talet dividerar dagens kurs med en tolvmånadersvinst som innehåller ${H(epsQ1)} dollar i EPS från Q1 och ${H(epsQ2)} från Q2 — varav stora delar utanför driften. Den implicita rullande EPS:n är ${H(ttmEps)} dollar (kurs ${H(pris)} delat med P/E). Billig räknat på blåst underlag — det är inte en rekommendation, det är en mätvinkel.
- Pris per bokfört eget kapital (P/B): **${H(pb, 3)}** — [P/B inom teknik](/dataset/teknik/pb) — strax ovanför grenens medianpost ${H(R.pb.m, 3)} (rang ${R.pb.r} av ${R.pb.n}) och långt över universumets ${H(uMed.pb)}. Notera samspelet med ROE: kapitalbasen är återköpsmager, avkastningen på den enorm — multiplarna hänger ihop (se lönsamheten nedan).
- Enterprise value per rörelseresultat (EV/EBIT): **${H(A.vardering.evEbit)}** — [EV/EBIT inom teknik](/dataset/teknik/ev-ebit) — ovanför grenens median ${H(R.evEbit.m)} (rang ${R.evEbit.r} av ${R.evEbit.n}) och betydligt över universumets ${H(uMed.evEbit)}. Räknat bakväg landar företagsvärdet på cirka ${T(evVag / 1000)} miljarder dollar — strax UNDER börsvärdet: kassan väger tyngre än skulderna (skuldtäckning ${H(A.stabilitet.skuldEgenkapital, 4)} mot eget kapital).
- Fri kassaflödesavkastning (FCF-yield): **${P(A.vardering.fcfYield)} procent** — [så räknas FCF-avkastningen](/dataset/teknik/fcf-avkastning) — sjätte lägsta av ${R.fcf.n} i grenen. Endast Oracle (negativt), Amazon (negativt), Kambi, Microsoft (${P(0.45)} procent) och Arm ligger lägre. Notera klubbmedlemskapet: fyra av bottensex är molnjättar mitt i AI-kapitalcykeln. Detta är paketets andra signaturtal — FCF-marginalen ${P1(A.lonksamhet.fcfMarginal)} procent mot vinstmarginalen ${P1(A.lonksamhet.nettoMarginal)} procent.
- PEG-talet: källan anger **${H(A.vardering.peg)}**, grenens median är ${H(R.peg.m)} (rang ${R.peg.r} av ${R.peg.n}). Men konventionen (P/E delat med prognostillväxten i procentenheter) ger ${H(pegKonv)} — räknat på absolutbeloppet, eftersom källans prognostillväxt är minus ${P(Math.abs(A.tillvaxt.prognosTillvaxt))} procent. Ett PEG på ett bolag med negativ förväntad EPS-förändring är inte ett tal, det är en fråga — se källkritiken.

**Lönsamhet — kapitalets berg, vinstens asterisk**

- Räntabilitet på eget kapital (ROE): **${P(A.lonksamhet.roe)} procent** — [så räknas ROE](/dataset/teknik/roe). Fjärde högsta av ${R.roe.n} i grenen (efter Apple, SK Hynix och ASML), över medianen ${P(R.roe.m)} och mer än tre gånger universumets ${P(uMed.roe)}. Apple-typen av artefakt: åratal av återköp har krympt det bokförda kapitalet, avkastningen på det som är kvar blir ett berg.
- Räntabilitet på investerat kapital (ROIC): **${P(A.lonksamhet.roic)} procent** — [så räknas ROIC](/dataset/teknik/roic), med källans not att värdet är en approximerad proxy (rörelseresultat före skatt delat med skuld plus bokfört kapital). Åttonde högsta av ${R.roic.n}. Gapet mot ROE är denna gång spegelriktigt: ROE över ROIC — återköpsmager kapitalbas lyfter ägaravkastningen över driftsavkastningen.
- Bruttomarginal: **${P1(A.lonksamhet.bruttoMarginal)} procent** — [så läses marginalerna](/dataset/teknik/brutto-marginal) — över grenens median ${P1(R.brutto.m)} och i princip på universumets median. Sökandets annonsmaskin med trafikkostnader i motposten: sextio procents brutto är annonsvärldens normala landskap, långt under mjukvarukollegornas sjuttioåttio.
- Rörelsemarginal (EBIT): **${P(A.lonksamhet.ebitMarginal)} procent** — [rörelsemarginalen](/dataset/teknik/netto-marginal) — sjunde högsta av ${R.ebit.n}, väl över medianen ${P(R.ebit.m)} och universumets ${P(uMed.ebit)}. Och här en sällsynt träff: Q2-2026:s rapporterade rörelsemarginal blev ${H(q2opMarg, 1)} procent, Q1:s ${H(q1opMarg, 1)} — fältets rullande fönster och rapporternas driftsvärld faller nästan exakt ihop (den gången Logitech-paketet behövde trettiotvå procents avstånd förklarade valutorna och begreppen; här behövs ingenting).
- Nettomarginal: **${P1(A.lonksamhet.nettoMarginal)} procent** — näst högsta av ${R.netto.n} i grenen, nästan tre gånger medianen ${P1(R.netto.m)} — och därmed paketets största asterisk: talet innehåller de icke-operativa jätteposterna. På bokslutsåret 2025, före engångsposterna, var samma marginal ${H(nettoMargFy25, 1)} procent. Skillnaden mellan ${H(nettoMargFy25, 1)} och ${P1(A.lonksamhet.nettoMarginal)} är inte bolaget som blev bättre — det är fönstret som bytte innehåll.

**Tillväxt — trettioprocentig vinsttrappa på dubbelsiffervolymer**

- Omsättning över senaste fyra räkenskapsåren: **plus ${P1(A.tillvaxt.omsattningCAGR5ar)} procent per år** (${H(A.serier.omsattning[0] / 1e9, 1)} → ${H(A.serier.omsattning[1] / 1e9, 1)} → ${H(A.serier.omsattning[2] / 1e9, 1)} → ${H(A.serier.omsattning[3] / 1e9, 1)} miljarder dollar) — [så räknas CAGR](/dataset/teknik/omsattning-cagr-5ar). Ärlighetsnot: källan ger fyra år, inte fem.
- Resultat samma period: **plus ${P1(A.tillvaxt.resultatCAGR5ar)} procent per år** — ${T(A.serier.resultat[0] / 1e6)} → ${T(A.serier.resultat[1] / 1e6)} → ${T(A.serier.resultat[2] / 1e6)} → ${T(A.serier.resultat[3] / 1e6)} miljoner dollar, vinsten mer än fördubblad på fyra år. [Resultat-CAGR förklarad](/dataset/teknik/resultat-cagr-5ar). Tredje högsta i grenen av ${R.cagrRes.n}.
- Intäktstillväxt senaste tolvmånadersperioden: **plus ${P1(A.tillvaxt.omsattningTillvaxtTTM)} procent** — [så läses TTM-tillväxten](/dataset/teknik/omsattningstillvaxt-ttm) — femte högsta av ${R.ttm.n} i grenen, och universums median ligger på ${P1(uMed.ttm)} — kvartalskedjan nedan visar accelerationen i tre steg.
- Prognostillväxt: **minus ${P(Math.abs(A.tillvaxt.prognosTillvaxt))} procent** — källans konsensussiffra för EPS-förändringen ett år framåt. Endast två bolag i hela teknikgrenen har negativ prognostillväxt: Alphabet och Amazon — de två bolag vars rullande vinst just nu är som mest engångsblåst. Minustecknet är inte en förutsägelse av kollaps; det är aritmetiken i att nästa fönster saknar årets engångsposter. [Om prognostillväxt](/dataset/teknik/prognos-tillvaxt) — och därmed till källkritiken.

## Källkritiken: två källor, två börsvärden — och en PEG som inte går att räkna

Universumets dubbelkällning gör sitt största arbete just här, och noten ligger redan i insamlingsraden: **Yahoo anger börsvärde ${T(A.marknadsKapitalMdr)} miljarder dollar, MarketStack ${T(1978)}** — en avvikelse på 52 procent, långt över tröskeln på 15 som triggar noten. Den troligaste förklaringen är aktieklassfrågan: GOOGL (A-aktien) mot hela koncernens alla aktieklasser — men insamlaren kan inte avgöra det, och därför kan inte paketet heller. Alla multiplar ovan är beräknade i Yahoo-världen (kurs ${H(pris)}, P/E ${H(pe)} ger aktietalet ${T(aktietal)} miljoner aktier); i MarketStack-världen vore varenda multipl grovt halverad. Lärdomen är inte vilken källa som har rätt — det är att börsvärdesfältet är den enskilt farligaste cellen att importera blind. Paketets tal håller sig konsekvent till ena världen och redovisar den andra öppet. [Så jämförs universumet](/dataset/teknik/universumjamforelse).

PEG-talet får sin egen rad. Källans PEG ${H(A.vardering.peg)} förutsätter en positiv tillväxttalare som inte längre existerar i källans eget prognosfält (minus ${P(Math.abs(A.tillvaxt.prognosTillvaxt))} procent). Konventionens PEG — ${H(pe)} delat med ${P(Math.abs(A.tillvaxt.prognosTillvaxt))} — blir ${H(pegKonv)}, och det är lika meningslöst på andra hållet: division med absolutbeloppet av ett negativt tal är en operation, inte en analys. PEG är helt enkelt avstängt tills fönstret normaliserats — vilket är exakt den sortens "osatt är information"-hållning som metodiken föreskriver. Logitech-paketets PEG-not (källa emot konvention, kvot 0,79) var en kalibrering; här är frågan fundamentalare.

Sedan siffervärldarna: rapportens Q2-kvartal visar netto ${H(112.1, 1)} miljarder dollar på omsättning ${H(q2_26, 1)} — en kvartalsmarginal på nittiofyra procent som ingen borde läsa som lönsamhet. Analytikergenomlysningen (findog, augusti 2026) landar på att ${H(engangsEps)} dollar av EPS ${H(epsQ2)} kom från poster utanför driften — ${H(engangsAndel, 0)} procent av kvartalets vinst per aktie — knutna till uppskjutna skattefordon i spåren av 2025 års amerikanska skattereform (OBBBA), alltså icke-kontanta engångsposter. Q1:s EPS ${H(epsQ1)} bär samma typ av lyft (netto ${H(62.6, 1)} miljarder mot rörelseresultat ${H(39.7, 1)}). Paketets hela TTM-kedja — omsättning ${H(ttmOms, 1)} miljarder dollar, implicerat netto ${H(ttmNetto / 1000, 0)} — är konsekvent beräknad i fältvärlden och redovisas med den klassen.

## Kvartalskedjan: molntrappan, orderboken och engångsposten

Kalenderkvartalet som rapporteras i oktober är juli–september 2026 — och här är Alphabet enklast i hela serien: räkenskapsåret är kalenderåret, rapportvaluta och notisvaluta är samma dollar. Jämför Q3 mot Q3, så är kalendern redan klar. Fjolårets Q3 (28 oktober 2025) var historiens första hundramiljarderkvartal: omsättning ${H(q3_25, 2)} miljarder dollar, plus sexton procent, EPS ${H(epsFjol)} mot förväntade ${H(epsKonsFjol)}.

| Kvartal | Omsättning | Tillväxt | Rörelseresultat | Noterar |
| --- | --- | --- | --- | --- |
| Q3 2025 (28/10 2025) | ${H(q3_25, 2)} mdr | +16 % | marginal ~30 % | första 100-mdr-kvartalet; Cloud ${H(cloudQ3_25, 1)} mdr (+34 %); orderstock ${T(155)} mdr; capexguidans 2025: 91–93 mdr |
| Q1 2026 (29/4) | ${H(q1_26, 1)} mdr | +22 % | ${H(39.7, 1)} mdr, marginal ${H(q1opMarg, 1)} % | Cloud ${H(cloudQ1_26, 2)} mdr (+63 %), Cloud-resultat ${H(6.6, 1)} mdr; orderstock över ${T(460)} mdr; capexguidans 2026: upp till ${T(190)} mdr |
| Q2 2026 (22/7) | ${H(q2_26, 1)} mdr | +24 % | ${H(40.8, 1)} mdr, marginal ${H(q2opMarg, 1)} % | Cloud ${H(cloudQ2_26, 1)} mdr (+82 %); netto ${H(112.1, 1)} mdr varav ${T(98)} mdr övriga räkningar |
| Q3 2026 (27–28/10, estimat) | konsensus ${H(konsensusOms, 2)} mdr | +${H(konsensusTillv, 1)} % | — | EPS-estimat ${H(konsensusEps)} mot fjolårets ${H(epsFjol)} (+${H((konsensusEps / epsFjol - 1) * 100, 1)} %) |

Tre trappor att läsa — och en fälla. **Molntrappan**: Google Cloud ${H(cloudQ3_25, 1)} → ${H(cloudQ1_26, 2)} → ${H(cloudQ2_26, 1)} miljarder dollar, tillväxttakten +34 → +63 → +82 procent — acceleration tre kvartal i rad, och molnet bär nu ${H(cloudAndel2, 1)} procent av koncernomsättningen. **Orderboken**: ${T(155)} miljarder dollar i oktober till över ${T(460)} i april — nästan tredubblad på två kvartal, den enskilt starkaste drivkraften bakom kapitalmarknadens uppmärksamhet kring dessa rapporter. **Kapitaltrappan**: capexguidansen för 2025 höjdes på fjolårets Q3-rapport till 91–93 miljarder dollar — och för 2026 till upp till 190 miljarder. Det är den andra dubbleringen som förklarar FCF-marginalen: det fria kassaflödet i det rullande fönstret är cirka ${H(ttmFcf / 1000, 1)} miljarder dollar, mot ett implicerat netto på ${H(ttmNetto / 1000, 0)} — **vinsten är ${H(vinstKvot, 1)} gånger kassaflödet**. Och fällan: nettovinstens två jättekvartal skedde medan kassaflödet trycktes — resultaträkningens översta och nedersta rader rör sig just nu i motsatta riktningar, och den som bara läser en av dem läser fel.

## Så står sig bolaget mot branschen

Tillbaka till grenen — hela teknikgrenen, ${tek.length} bolag, medianer räknade live ur samma universumsinsamling. [Värderingsöversikten](/dataset/teknik/vardering) sätter multiplarna i sammanhang.

Alphabets profil i grenen är ett T: över median i lönsamhet på nästan varje våning (ROE fjärde högst, netto näst högst, EBIT sjunde högst av ${R.ebit.n}), under median i P/E (sjunde lägsta av ${R.pe.n}) — och botten i kassaflödesmått (FCF-yield ${P(A.vardering.fcfYield)} procent, sjätte lägsta; FCF-marginal femte lägsta av ${R.fcfMarg.n}). Skuldsättningen ${H(A.stabilitet.skuldEgenkapital, 4)} ligger exakt på grenens medianpost — ${H(R.skuld.m, 4)} — [om skuldsättning](/dataset/teknik/skuldsattning), en sällsynt exakt medianträff (Logitech-paketets P/B-träff av samma slag). Volymerna: tillväxten plus ${P1(A.tillvaxt.omsattningCAGR5ar)} procent per år är sjunde högsta i grenen, TTM-tillväxten plus ${P1(A.tillvaxt.omsattningTillvaxtTTM)} femte högsta — mot universummedianen ${P1(uMed.ttm)}. Grenen som helhet växer snabbare än universum; Alphabet växer snabbare än grenen.

Kontrastparen att minnas: mot Microsoft — grenens och seriens närmaste granne i FCF-botten (${P(0.45)} mot ${P(A.vardering.fcfYield)} procent) — är frågan vilkens kapitalcykel som är mest reversibel; mot Apple (ROE ${P(1.4875)} procent, samma återköpsartefakt) är frågan vad kapitalbasens storlek gör med multiplarna; mot Samsung och SK Hynix (P/E ${H(12.4, 1)} respektive ${H(8.2, 1)}) är frågan varför halvledarcykelns billiga multiplar inte möter samma skepsis som annonsmaskinens. Inget av paren har ett rätt svar — de är läsövningar, inte köpgrunder.

## Tre sätt att läsa utfallet — övningar i metod

**Övning A — ta bort engångsposten och räkna om.** P/E ${H(pe)} står på en EPS av ${H(ttmEps)} dollar. Stryk de icke-operativa lyften i Q1 och Q2 (analytikernas ${H(engangsEps)}-dollarspost i Q2 som riktpinne) och räkna vad ett driftsvinstfönster ger för multipl. Uppgiften är inte att landa en exakt kurs — den är att se hur många procent av "billigheten" i P/E som är engångspostens verk. Samma övning på prognostillväxten minus ${P(Math.abs(A.tillvaxt.prognosTillvaxt))} procent: vad återstår av minustecknet när fönstret byts?

**Övning B — FCF-fällan i tre frågor.** Vinstmarginal ${P1(A.lonksamhet.nettoMarginal)} procent, FCF-marginal ${P1(A.lonksamhet.fcfMarginal)} procent, capexguidans upp till ${T(190)} miljarder dollar för 2026. Fråga ett: hur mycket av gapet är investering i orderstocken (${T(460)} miljarder i april) mot underhåll? Fråga två: vad händer med FCF-yielden ${P(A.vardering.fcfYield)} procent om molnintäkterna ${H(cloudQ2_26, 1)} miljarder fortsätter växa med åttiototal utan att kapitalutgifterna växer lika fort? Fråga tre — ärlighetssidan: vad säger det att grenens två negativa prognostillväxtbolag också är de två med störst engångsposter? Svaren är läsövningens poäng, inte prognoser.

**Övning C — scenariorutan: volymens och marginalens aritmetik.** Bas: bokslutsåret 2025 (omsättning ${T(fy25 * 1000)} miljoner dollar, rörelsemarginal ${P(A.lonksamhet.ebitMarginal)} procent — fältvärlden, öppet deklarerat) ger ett rörelseresultat på cirka ${T(scBas / 1000)} miljoner dollar. Rutan varierar volymen ±3 procent och marginalen ±1 procentenhet:

| | Marginal 33,03 % | Marginal 34,03 % | Marginal 35,03 % |
| --- | --- | --- | --- |
| ${ruta[0][0]} | ${ruta[0][1]} | ${ruta[0][2]} | ${ruta[0][3]} |
| ${ruta[1][0]} | ${ruta[1][1]} | ${ruta[1][2]} | ${ruta[1][3]} |
| ${ruta[2][0]} | ${ruta[2][1]} | ${ruta[2][2]} | ${ruta[2][3]} |

Cellerna är miljoner dollar i rörelseresultat. Två aritmetiska grundtal: en procentenhet marginal är på denna bas värd exakt en procent volym — båda cirka ${T(pp1)} miljoner dollar i intäkter respektive resultat — och tre procents volym är ${T(p3)} miljoner. När marginalen är över trettio procent väger varje marginalpoäng lika tungt som en hel omsättningsprocent; det är därför molnverksamhetens marginalutveckling (fjolårets Q3: 23,7 procent, vårens ${H(6.6, 1)}-miljarderkvartal i molnet) är den rad täta analyser följer tätast. Notera igen rutans klass: fältvärldens rullande marginal — inte en prognos för Q3.

## Praktiskt inför 28 oktober

- **Datumet:** fönster 27–28 oktober, tyngdpunkt onsdagen 28 efter stängning (Public.com, Wall Street Horizon; investing.com bokar 27). Bolagets utlysning via [Alphabets investerarrelationer](https://abc.xyz/investor) är den enda officiella källan — kontrollera den före publicering av detta utkast.
- **Kalendern:** rak — kalenderkvartal mot kalenderkvartal, dollar mot dollar. Fjolårets jämförelsetal: omsättning ${H(q3_25, 2)} miljarder dollar, EPS ${H(epsFjol)}, Cloud ${H(cloudQ3_25, 1)} miljarder.
- **Tre rader att läsa först:** molnintäkten mot fjolårets ${H(cloudQ3_25, 1)} (tillväxttakten +34 → +63 → +82 — fortsätter trappan?); orderstocken mot ${T(460)}+ miljarder från april; och kapitalutgiftsradens utveckling mot guidansen upp till ${T(190)} miljarder.
- **Två asterisker att bära med sig:** nettovinsten (fjolårets Q3 var rent av engångsposter — årets fönster är det inte); och EPS-konsensusen ${H(konsensusEps)} mot fjolårets ${H(epsFjol)} — plus fyra procent på EPS medan omsättningsförväntan ligger på +${H(konsensusTillv, 0)} procent är kapitalkostnadernas berättelse i en enda rad.
- **Metodminnet:** läs inte P/E ${H(pe)} utan att fråga vad EPS:n innehåller; läs inte prognostillväxtens minustecken utan att fråga vad fönstret innehåller. [Transparens-sidan](/transparens) förklarar hela metodiken; [källsidan](/kallor) hur universumet samlas in.

Ordlista och fördjupning: [kurserna](/kurser) redogör för begreppen — [P/E](/dataset/teknik/pe), [FCF-avkastning](/dataset/teknik/fcf-avkastning) och [prognostillväxten](/dataset/teknik/prognos-tillvaxt) är detta pakets tre portar.

## Källor

- **Bolagsuniversumet**: data/portfolj-system/bolagsunivers.json, post GOOGL, hämtad 2026-09-03 (Yahoo Finance quoteSummary + MarketStack eod/latest; slutkurs 2026-09-02; divergensnot 52 procent i fältet, redovisad i källkritiken). Medianer och rang live ur ${tek.length}-bolagsgrenen.
- **Forskningsbiblioteket**: data/forskningsbiblioteket/GOOGL.json, version 2026-09-04 (gul, täckning 0,7113, AKM1 47,4/71,1).
- **Rappdatum**: Public.com (bokar 28/10, EPS-estimat 2,99) och Wall Street Horizon (28/10 efter stängning, obekräftat), investing.com (27/10, oms-förväntan 126,85 mdr) — sökverifierade 2026-09-21. Grenkalender kalender-teknik.json (2026-09-15): 28/10 estimerat.
- **Q3 2025**: Alphabets pressrelease "Alphabet Announces Third Quarter 2025 Results" (2025-10-28/29, SEC 8-K): omsättning 102,35 mdr (+16 %), Cloud 15,2 mdr (+34 %), Cloud-rörelseresultat 3,6 mdr (marginal 23,7 %), orderstock 155 mdr, capexguidans 2025 höjd till 91–93 mdr; CNBC och Reuters bekräftar.
- **Q1 2026**: Alphabets pressrelease "Alphabet Announces First Quarter 2026 Results" (2026-04-29): omsättning 109,9 mdr (+22 %), rörelseresultat 39,7 mdr (marginal 36,1 %), netto 62,6 mdr, EPS 5,11, Cloud 20,03 mdr (+63 %), Cloud-resultat 6,6 mdr, orderstock över 460 mdr, capexguidans 2026 upp till 190 mdr.
- **Q2 2026**: Alphabets rapport 2026-07-22, dokumenterad av Webull, Fortune och findog (augusti 2026): omsättning 119,8 mdr (+24 %, LSEG-konsensus 116,93), rörelseresultat 40,8 mdr (marginal 34 %), netto ~112 mdr, EPS 9,11 varav ~6,26 icke-operativt (övriga räkningar ~98 mdr), Cloud 24,8 mdr (+82 %).
- **Bolagets bevakningspunkt**: [abc.xyz/investor](https://abc.xyz/investor) — utlysningar, pressreleaser, webbsända resultatpresentationer.

Rygraden i detta paket är aritmetiken: varje tal i texten är antingen rapporterat av bolaget, hämtat ur universumets dubbelkällade insamling, eller beräknat ur de två — och beräkningsvägen redovisas. Inga köp-, sälj- eller behållningsrekommendationer förekommer; texten är utbildning i metodik enligt utbildningsundantaget (2 kap 5 § lagen 2007:528). Publicering av utkastet är kundens beslut (R2).`;

const paketJson = {
  slug: "sa-laser-du-alphabet-q3-2026",
  title: "Alphabet Q3-rapport 2026: så läser du den — engångsposten som lyfte nettovinsten till 112 miljarder dollar (98 miljarder i övriga räkningar) mot ett fritt kassaflöde på en tiondel av nettovinsten, medan Google Cloud accelererade tre kvartal i rad (15,2 → 20,0 → 24,8 miljarder dollar) och orderstocken tredubblades till över 460 miljarder — rapportfönstret 27–28 oktober (estimat)",
  description: "Alphabet (GOOGL, Nasdaq) — annons- och molnjätten med kalenderår som räkenskapsår — rapporterar juli–september 2026 i slutet av oktober (fönster 27–28, tyngdpunkt onsdagen 28 efter stängning enligt Public.com och Wall Street Horizon; fjolåret kom 28 oktober). Läspaketet: P/E 16,8 sjunde lägsta i teknikgrenen men beräknat på en rullande EPS om 20,06 dollar som bär Q1:s 5,11 och Q2:s 9,11 — varav omkring 6,26 dollar icke-operativt (uppskjutna skattefordon, OBBBA) — prognostillväxten minus 28 procent är normaliseringsaritmetik inte kollaps, vinstmarginal 54,8 mot FCF-marginal 5,1 procent med capexguidans dubblerad till upp till 190 miljarder dollar, källdivergensen 52 procent på börsvärdet (Yahoo 4 123 mot MarketStack 1 978 miljarder) som seriens tydligaste källkritiklektion, och kvartalskedjan +16 → +22 → +24 procent. Allt som utbildning, aldrig råd.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-28",
  readingMinutes: 6,
  tags: ["kvartalsrapport", "Alphabet", "teknik", "USA", "Google", "läspaket"],
  body,
};

writeFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-alphabet-q3-2026.json", JSON.stringify(paketJson, null, 2) + "\n");
writeFileSync("/home/ak1a/AK1/verktyg/_s4u1-googl-data.json", JSON.stringify(data, null, 2) + "\n");
const ord = body.split(/\s+/).filter(Boolean).length;
console.log(`OK: paket skrivet (${ord} ord), data skriven. Serie nr ${serieNr}, teknikgrenens nr ${teknikPåDisk + 1} (av ${teknikPåDisk} på disk).`);
