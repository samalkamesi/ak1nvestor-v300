#!/usr/bin/env node
// _s4u2-logn-bygg.mjs — bygger Logitech Q3-2026-läspaketet (s4-u2, manifest auto-s4-1789959329360).
// Källor: bolagsunivers.json 2026-09-03 (LOGN.SW) + sökverifierade kvartalstal (2026-09-21,
// se källsektionen i paketet). Skriver målfil + byggdata för KVD. Medianer/rang beräknas LIVE.
import { readFileSync, writeFileSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const L = U.find(p => p.ticker === "LOGN.SW");
const tek = U.filter(p => p.bransch === "teknik");
const med = a => { const s = a.filter(v => typeof v === "number" && isFinite(v)).sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const g = (p, s) => s.split(".").reduce((o, k) => o && o[k], p);
const rang = (path) => { const v = g(L, path); const a = tek.map(p => g(p, path)).filter(x => typeof x === "number" && isFinite(x)); return { v, m: med(a), n: a.length, r: a.filter(x => x < v).length + 1 }; };

const R = {
  pe: rang("vardering.pe"), pb: rang("vardering.pb"), evEbit: rang("vardering.evEbit"), peg: rang("vardering.peg"),
  fcf: rang("vardering.fcfYield"), roe: rang("lonksamhet.roe"), roic: rang("lonksamhet.roic"),
  brutto: rang("lonksamhet.bruttoMarginal"), ebit: rang("lonksamhet.ebitMarginal"), netto: rang("lonksamhet.nettoMarginal"),
  skuld: rang("stabilitet.skuldEgenkapital"), cagrOms: rang("tillvaxt.omsattningCAGR5ar"), cagrRes: rang("tillvaxt.resultatCAGR5ar"), ttm: rang("tillvaxt.omsattningTillvaxtTTM"),
};
const uMed = { pe: med(U.map(p => g(p, "vardering.pe")).filter(x => typeof x === "number")), pb: med(U.map(p => g(p, "vardering.pb")).filter(x => typeof x === "number")), roe: med(U.map(p => g(p, "lonksamhet.roe")).filter(x => typeof x === "number")), ebit: med(U.map(p => g(p, "lonksamhet.ebitMarginal")).filter(x => typeof x === "number")), netto: med(U.map(p => g(p, "lonksamhet.nettoMarginal")).filter(x => typeof x === "number")), skuld: med(U.map(p => g(p, "stabilitet.skuldEgenkapital")).filter(x => typeof x === "number")), evEbit: med(U.map(p => g(p, "vardering.evEbit")).filter(x => typeof x === "number")), brutto: med(U.map(p => g(p, "lonksamhet.bruttoMarginal")).filter(x => typeof x === "number")) };
const pegMedU = med(U.map(p => g(p, "vardering.peg")).filter(x => typeof x === "number"));
const pegNU = U.map(p => g(p, "vardering.peg")).filter(x => typeof x === "number").length;

// — Kontroller (ren aritmetik) —
const pris = L.pris;                    // 81,00 CHF (SIX)
const pe = L.vardering.pe, pb = L.vardering.pb;
const epsFY26 = 4.80;                   // GAAP EPS FY2026, rapporterad (pressrelease 2026-05-05)
const kursEkv = pe * epsFY26;           // implicit USD-kurs-ekvivalent
const usdchf = pris / kursEkv;
const aktietal = L.marknadsKapitalMdr * 1000 / pris; // mkr CHF-tal — aktier i M
const nettoFY26 = L.serier.resultat[3] / 1e6; // MUSD
const omsFY26 = L.serier.omsattning[3] / 1e6; // MUSD
const ekVag = nettoFY26 / L.lonksamhet.roe;                 // EK via ROE-fältet
const bps = ekVag / aktietal;                               // bokfört per aktie (USD)
const pbVag2 = kursEkv / bps;                               // P/B väg 2
const ident = pb / L.lonksamhet.roe;                        // P/E-identitet
const identAvv = (pe / ident - 1) * 100;
const pbAvv = (pbVag2 / pb - 1) * 100;
const pegKonv = pe / (L.tillvaxt.prognosTillvaxt * 100);
const cagrOmsKontroll = (Math.pow(omsFY26 / L.serier.omsattning[0], 1 / 3) - 1) * 100;
const cagrResKontroll = (Math.pow(nettoFY26 / L.serier.resultat[0], 1 / 3) - 1) * 100;
const nettoMargBokslut = nettoFY26 / omsFY26 * 100;
const gaapOpFY26 = 775;                                     // rapporterat
const gaapOpMarg = gaapOpFY26 / omsFY26 * 100;
const ebitFalt = omsFY26 * L.lonksamhet.ebitMarginal;
const ebitGap = (ebitFalt / gaapOpFY26 - 1) * 100;
const ttmKedja = 1190 + 1420 + 1090 + 1227.2;               // Q2FY26+Q3+Q4+Q1FY27 (sökta, avrundade)
const fy26Summa = 1150 + 1190 + 1420 + 1090;
const scBas = omsFY26 * L.lonksamhet.ebitMarginal;          // 1 027,3
const scCell = (dOms, dM) => (omsFY26 * (1 + dOms)) * (L.lonksamhet.ebitMarginal + dM);
const sc = [];
for (const d of [-0.03, 0, 0.03]) for (const m of [-0.01, 0, 0.01]) sc.push(scCell(d, m));
const vikt = 1 / (3 * L.lonksamhet.ebitMarginal);
const pp1 = omsFY26 * 0.01, p3 = omsFY26 * 0.03;

const data = {
  genererad: "2026-09-21", agent: "s4-u2 manifest auto-s4-1789959329360",
  universum: { hamtat: L.hamtat, pris, mcapMdr: L.marknadsKapitalMdr, pe, pb, evEbit: L.vardering.evEbit, peg: L.vardering.peg, fcfYield: L.vardering.fcfYield, roe: L.lonksamhet.roe, roic: L.lonksamhet.roic, brutto: L.lonksamhet.bruttoMarginal, ebitMarg: L.lonksamhet.ebitMarginal, nettoMarg: L.lonksamhet.nettoMarginal, skuldEk: L.stabilitet.skuldEgenkapital, cagrOms: L.tillvaxt.omsattningCAGR5ar, cagrRes: L.tillvaxt.resultatCAGR5ar, ttm: L.tillvaxt.omsattningTillvaxtTTM, prognos: L.tillvaxt.prognosTillvaxt },
  serier: { ar: L.serier.ar, oms: L.serier.omsattning, res: L.serier.resultat },
  gren: { n: tek.length, ...Object.fromEntries(Object.entries(R).map(([k, x]) => [k, { v: x.v, m: x.m, n: x.n, r: x.r }])) },
  universumMedianer: { ...uMed, peg: pegMedU, pegN: pegNU, nPoster: U.length },
  kontroller: { epsFY26, kursEkv, usdchf, aktietal, ekVag, bps, pbVag2, ident, identAvv, pbAvv, pegKonv, cagrOmsKontroll, cagrResKontroll, nettoMargBokslut, gaapOpFY26, gaapOpMarg, ebitFalt, ebitGap, ttmKedja, fy26Summa, scBas, sc, vikt, pp1, p3 },
  kvartal: {
    q1fy26: { oms: 1150,_brutto:0.417, opGaap:162, rapp: "2025-07-29", not: "+5% USD/+5% CC; GAAP brutto 41,7% (-110bp); GAAP op 162 (+6%); non-GAAP op 202 (+11%)" },
    q2fy26: { oms: 1190, brutto: 0.434, opGaap: 191, rapp: "2025-10-28", not: "+6% USD/+4% CC; GAAP brutto 43,4%; GAAP op 191 (+19%); GAAP EPS 1,15 (+21%); non-GAAP op 230 (+19%)" },
    q3fy26: { oms: 1420, brutto: 0.432, opGaap: 286, rapp: "2026-01-27", not: "+6% USD/+4% CC; GAAP brutto 43,2% (+30bp); GAAP op 286 (+22%); GAAP EPS 1,69 (+28%); non-GAAP op 312 (+17%, rekord)" },
    q4fy26: { oms: 1090, opGaap: null, rapp: "2026-05-05", not: "+7% USD; non-GAAP op +25%; non-GAAP EPS 1,13" },
    q1fy27: { oms: 1227.2, brutto: 0.495, opGaap: 258.6, netto: 235.697, nettoPY: 146.015, epsGaap: 1.63, rapp: "2026-07-28", not: "+7% USD/+5% CC; GAAP brutto 49,5% (+780bp); GAAP op 258,6 (+60%); non-GAAP op 290 (+44%) med 61 MUSD tullåterbetalningar; 10:e raka tillväxtkvartalet" },
    q2fy27: { omsSpan: [1185, 1220], rapp: "2026-10-27 (estimat)", not: "bolagets guidance: 1 185–1 220 MUSD, 0–3% YoY; bruttomarginal ~44%; ~20 MUSD leverantörsrelaterad nackdel" },
  },
  fy26: { oms: 4840.761, opGaap: 775, epsGaap: 4.80, epsNonGaap: 5.78, bruttoNonGaap: 0.436, opMargNonGaap: 0.188, netto: 711.187 },
};

// — Scenariorutans celler —
const f = x => x.toFixed(1).replace(".", ",").replace(/(\d)(\d{3}),/, "$1 $2,");
const ruta = [
  ["Intäkter 4 695,5", f(sc[0]), f(sc[1]), f(sc[2])],
  ["Intäkter 4 840,8", f(sc[3]), f(sc[4]), f(sc[5])],
  ["Intäkter 4 986,0", f(sc[6]), f(sc[7]), f(sc[8])],
];

const body = `Logitech International — ticker LOGN på SIX Swiss Exchange — öppnar sitt rapportfönster för kalenderkvartalet juli–september 2026 tisdagen den **27 oktober** (tredjepartsestimat; fjolårets motsvarande rapport kom tisdagen 28 oktober 2025 — mer om datumklassen i urvalet). Men innan en enda siffra läses väntar två dörrar som är själva paketet: bolagets räkenskapsår går april–mars, så kalenderkvartalet juli–september är **andra kvartalet i räkenskapsåret 2027** — och bolaget redovisar i **amerikanska dollar** medan aktien handlas i **schweiziska franc** på börsen i Zürich. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

Paketet är teknikgrenens nionde på disk — ABB, ASML, Ericsson, Hexagon, Nokia, SAP, Samsung och Truecaller före — och seriens cirka 71:a läspaket totalt. Logitech är seriens första Schweiz-bolag och kanske grenens tydligaste kontrastobjekt: ett kringutrustningsbolag som tillverkar möss, tangentbord och webbkameror, med bruttomarginal i fyrtioprocentklassen i en gren där mjukvarukollegorna driver sjuttioprocentklassen — och med en balansräkning ur lånmåttsskolan: nästintill skuldfri, med teknikgrenens tredje lägsta EV/EBIT och femte högsta fria kassaflödesavkastning. Det är det paketet handlar om: att läsa ett bolag där vinsten nästan fördubblats på fyra år medan omsättningen stått stilla — och där varje jämförelse måste ta sig förbi valutan och kalendern först.

## Urvalet: varför Logitech är nästa paket i serien

Sorteringen redovisas öppet, som alltid: tidigaste återstående rappdagen med bärande universumdata. Läget efter 70 paket på disk: Newmont (22 oktober) togs i veckans omgång av båda syskonen — ett dubbelklaim-race dem emellan, deras yta — och därmed är **Logitech 27 oktober tidigaste återstående fönstret bland bibliotekets olevererade**: Microsoft 27–28 oktober (estimat, spänn över två dagar), Alphabet och Meta 28 oktober (estimat), Chevron 30 oktober (estimat), Palantir 2 november (projektion), Disney 12 november (estimat) och Verizon helt utan exakt datum — tredjepartskällorna spänner från 19 till 28 oktober. Datumlösa fönster sorterar sist.

Sedan P&G-raden, som alltid: datumklassen redovisas ärligt. Logitech har **ingen egen utlysning publicerad** vid paketets byggtid (2026-09-21) — USA- och Schweiz-bolag utlyser exakt datum via pressrelease några veckor före rappdagen. Men rytmen bär hårt: de fyra senaste rapporterna kom alla på **tisdagar** — Q1 FY2026 den 29 juli 2025, Q2 FY2026 den 28 oktober 2025, Q3 FY2026 den 27 januari 2026, Q1 FY2027 den 28 juli 2026 — och den 27 oktober 2026 är en tisdag. Tredjepartsestimaten pekar enhälligt mot den veckan. Klassen är alltså estimerat-med-stativrande-rytm: starkare än Verizon:s datumlösa spänn, svagare än en bolagsbekräftad dag — och om utlysningen kommer med annat datum är det nya rader i det öppna kvittot, inget annat.

Datakärnan bär. Universumraden för LOGN.SW (hämtdatum 2026-09-03, dubbelkällad Yahoo Finance och MarketStack med slutkurs 2026-09-02) har full värderingsrad, full lönsamhetstrappa och fyra sammanhängande räkenskapsår i både omsättning och resultat. Biblioteksposten från 2026-09-04 ger modellagets dom: **grön status** med datatackning 0,7113 och AKM1-poäng 50,3 av 71,1 möjliga — lönsamhet starkaste kategorin, katalysatorn svagast. För ett bolag utan pågående katalysator i modellens ögon är rapportdagen själv den katalysator som finns — och då gäller det att veta exakt vilka fällor datumet bär: kalendern och valutan.

## Nyckeltalen att ha med sig — med valutakedjan synliggjord

Värdena är senaste mätta tal ur bolagsuniversumets insamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas inom teknikbranschen. En varningsflagga hissas direkt: kursen 81,00 är **schweiziska franc**, serierna och marginalerna är **dollar** — universumposten bär båda valutorna, och allt som följer nedan är beräknat så att fältens interna konsistens håller (se källkritiken).

**Värdering — det mjuka mittens multiplar**

- Pris per vinst (P/E): **18,37** — [P/E inom teknik](/dataset/teknik/pe). Under grenens median 22,01 — åttonde lägsta av 23 — och under universumets median 20,39. För en gren där medianbolaget handlas drygt två gånger vinsten är Logitech billigt räknat; frågan övning A tar vid: billigt mot vad?
- Pris per bokfört eget kapital (P/B): **6,10** — [P/B inom teknik](/dataset/teknik/pb). Och här en sällsynt träff: värdet ligger **exakt på grenens medianpost** (6,099 mot 6,099, rang 12 av 23 i stigande ordning) — medan universumets median är 2,72. P/E under medianen och P/B på medianen är själva definitionen av "vinsten billigare än kapitalet" — ROE gör skillnaden mellan multiplarna.
- Enterprise value per rörelseresultat (EV/EBIT): **9,26** — [EV/EBIT inom teknik](/dataset/teknik/ev-ebit) — **tredje lägsta av 23 i grenen** (endast Samsung och Enea lägre) mot medianen 23,81. Det är grenens mest extrema avstånd i hela paketet: bolaget som värderas till nio års rörelseresultat i en gren som betalar tjugofyra. Skuldfriheten ligger bakom — EV-måttet straffar inte bolag utan lån.
- Fri kassaflödesavkastning (FCF-yield): **6,24 procent** — [så räknas FCF-avkastningen](/dataset/teknik/fcf-avkastning) — femte högsta av 22 i grenen (efter Ericsson, Samsung, Enea och SK Hynix) mot medianen 2,38. Kassaflödesmaskinen i en gren som betalar för tillväxt.
- PEG-talet: källan anger **1,79**, konventionen (P/E delat med prognostillväxten i procentenheter) ger 2,27 — källan 0,79 gånger konventionen; se källkritiken. [Värderingsöversikten](/dataset/teknik/vardering) sätter multiplarna i sammanhang.

**Lönsamhet — tillverkarens trappa, kapitalets berg**

- Räntabilitet på eget kapital (ROE): **35,29 procent** — [så räknas ROE](/dataset/teknik/roe). Åttonde högsta av 23, över medianen 30,56 och mer än dubbelt universumets 14,66 — och notera samspelet med P/B: kapitalet betalas sex gånger, avkastningen på det är trettiofem procent. Multiplarna hänger ihop.
- Räntabilitet på investerat kapital (ROIC): **52,57 procent** — [så räknas ROIC](/dataset/teknik/roic), med källans not att värdet är en approximerad proxy. Sjätte högsta av 22; sexton kollegor ligger under. Gapet mot ROE är spegelvänt mot fastighetsgrenens: ROIC ÖVER ROE — det som lyfter avkastningen på eget kapital är inte belåning utan att kapitalbasen är liten och effektiv.
- Bruttomarginal: **45,24 procent** — [så läses marginalerna](/dataset/teknik/brutto-marginal) — **fjärde lägsta av 23** (endast Sinch, NOTE och TCS under) mot medianen 52,73. Här är tillverkarens fingeravtryck: mjukvarukollegor med sjuttioprocent brutto drar grenens median uppåt; Logitech köper komponenter, monterar, fraktar — och läser ändå 45 procent som styrka i tillverkarkategorins normallandskap.
- Rörelsemarginal (EBIT): **21,22 procent** — [rörelsemarginalen](/dataset/teknik/netto-marginal) — strax under grenens median 26,34 men över universumets 20,81. Notera fönstret: mot rapportens GAAP-operating income blev FY2026-marginalen 16,0 procent — fältets EBIT-väg och rapportens rörelseresultat är två begrepp (se källkritiken).
- Nettomarginal: **16,28 procent** — under grenens median 20,41, över universumets 13,66. På bokslutsåret 2026 blev den 14,69 — fönstren igen, inte bolaget.

**Tillväxt — platt fas, het vinst**

- Omsättning över senaste fyra räkenskapsåren: **plus 2,17 procent per år** (4 538,8 → 4 298,5 → 4 554,9 → 4 840,8 miljoner dollar) — [så räknas CAGR](/dataset/teknik/omsattning-cagr-5ar). Ärlighetsnot: källan ger fyra år, inte fem. Serien är pandemin-pendeln: toppar under hemmakontorsåren, dipp 2024, sedan återhämtning till ny höjdpunkt.
- Resultat samma period: **plus 24,95 procent per år** — 364,6 → 612,1 → 631,5 → 711,2 miljoner dollar, vinsten nästan fördubblad på platt omsättning. [Resultat-CAGR förklarad](/dataset/teknik/resultat-cagr-5ar). Femte högsta resultat-CAGRen i grenen — men från 2022 års pandemibotten; ändpunkterna väljer berättelsen (övning B).
- Intäktstillväxt senaste tolvmånadersperioden: **plus 6,9 procent** — [så läses TTM-tillväxten](/dataset/teknik/omsattningstillvaxt-ttm) — och kvartalskedjan bär tio raka tillväxtkvartal (se nedan).
- Prognostillväxt: **plus 8,09 procent** — källans konsensussiffra för vinsttillväxt ett år framåt; samlad marknadsuppskattning, inte en sanning och inte vår prognos. [Om prognostillväxt](/dataset/teknik/prognos-tillvaxt)

**Stabilitet — balansräkningens bolag**

- Skulder per eget kapital: **0,036** — [om skuldsättning](/dataset/teknik/skuldsattning). Tredje lägsta i grenen av 23 — endast två kollegor ligger lägre, och de på exakt noll — mot medianen 0,189 och universumets 0,542. Detta är paketets motsatsfoto: i en gren där EV/EBIT-medianen på 23,81 delvis bärs av skuldbelagda balansräkningar, står här ett bolag som nästan saknar lån — och vars EV/EBIT på 9,26 därför är nästan ren P/E-vikt.
- Kassa: fjolårets rapporterade kassabalans låg kring 0,3 miljarder dollar enligt bolagets investormaterial; fältet FCF-marginal 14,7 procent bär samma bild — bolaget finansierar sig självt.
- Utdelnings- och insiderfält: universumet saknar utdelningssiffror för posten och redovisar noll insiderköp senaste sex månader — hålen sägs som de är.

## Källkritiken: francen på utsidan, dollarn på insidan

Detta pakets signatur är valutakedjan. Aktien handlas i schweiziska franc på SIX; rapporterna skrivs i dollar. Universumpostens kurs 81,00 är franc — och ändå står P/E-fältet 18,37 mot rapporterad GAAP-vinst per aktie 4,80 dollar. Går kedjan baklänges: 18,37 × 4,80 = **88,16 dollar** i implicit kurs-ekvivalent, vilket på kursen 81,00 franc innebär växelkursen 0,919 franc per dollar. Kedjan håller — men läsaren ser poängen: **varje multiplär jämförd mot en svensk eller amerikansk kollega bär en dold valutaterm**. Två sätt att hamna snett: jämföra CHF-kursen mot USD-tal rakt av (fel med cirka nio procent), eller glömma att växelkursen rör sig mellan insamling och rappdag. Universumfältens interna konsistens är beräknad i samma valuta hela vägen — det är därför identitetstestet nedan fungerar.

Sedan identitetstestet **P/E = P/B delat med ROE**: 6,099 ÷ 0,3529 = **17,29** mot källans P/E 18,37 — källan **6,3 procent över** identiteten, utanför Essity-lärans cirka-tre-procents-när-godkänt. Reservationen har sin kandidatförklaring i fönstren och i en oberoende kapitalväg: räkna bokfört eget kapital baklänges via ROE-fältet (711,2 resultat ÷ 0,3529 = 2 015 miljoner dollar), per aktie **14,07 dollar**, och sätt mot den implicita kurs-ekvivalenten: 88,16 ÷ 14,07 = **P/B 6,27** — 2,7 procent över fältets 6,099. Två vägar till samma kapital, spännet tre procent: kedjan är konsistent inom fönstrens räckvidd, och identitetens 6,3 procent är ROE-fältets TTM-fönster mot P/E-nämnarens bokslutsår — samma mönster som Wihlborgs-paketet fast i större format, redovisat öppet.

Aktietalet har samma tvåvägslexa: börsvärdet 11 598 delat på kursen 81,00 ger **143,2 miljoner aktier** — medan vinstvägen (711,2 resultat ÷ 4,80 EPS) ger 148,2 miljoner. Skillnaden 3,5 procent är återköpen: bolaget köper tillbaka aktier löpande, så det vägda genomsnittliga aktietalet under året ligger över sluttalet. Båda talen redovisas; inget döljs.

PEG-fältet: konventionen ger 18,37 ÷ 8,09 = **2,27** mot källans **1,79** — källan 0,79 gånger konventionen, den här gången UNDER (Wihlborgs-paketet hade källan 1,66 gånger över). Okänd beräkningsväg = räknestorhet, inte mått; universumets PEG-median är 1,32 (${pegNU} poster med värde) — källans tal över medianen, konventionens längre över.

Och EBIT-fältets begreppsgap, paketets största: fältets rörelsemarginal 21,22 procent ger 4 840,8 × 0,2122 = **1 027 miljoner dollar** i rörelseresultat — mot rapportens GAAP-operating income **775 miljoner** för samma år: fältet 32,6 procent över. Yahoo:s EBIT-väg inkluderar poster (rädutanläggningar, valutaeffekter, skattekonton) som rapportens rörelseresultat lämnar utanför. Konsekvensen är praktisk och redovisas öppet: **scenariorutan i övning C räknas på fältets marginalvärld**, inte på GAAP-operating income — aritmetiken är ren inom sitt begrepp, men begreppet är inte rapportens rad. Marginalskillnaden (21,22 mot 16,01 procent) är ingen småskala: den som jämför bolag mot bolag måste välja en av världarna och hålla sig till den.

Nettofönstret sist: fältets nettomarginal 16,28 procent (TTM) mot bokslutsvägen 711,2 ÷ 4 840,8 = **14,69** — 1,6 procentenheters skillnad, igen fönstren. Och kvartalens avrundningar: pressreleasernas omsättningstal kommer i avrundade miljardtal ($1,15, $1,19, $1,42, $1,09), och de fyra kvartalen FY2026 summerar till cirka 4 850 mot helårets exakta 4 840,8 — en halv procents avrundningsbrus, redovisat som det är.

## Kvartalskedjan: tio raka tillväxtkvartal och säsongsfällan

Universumet saknar kvartalsserier, men bolagets rapporter ger kedjan — sökverifierad 2026-09-21 mot pressreleaser på news.logitech.com och ir.logitech.com samt Business Wire-distribution. Nettoomsättning per kvartal, miljoner dollar (avrundade press-tal): Q1-FY2026 **1 150** (+5 %), Q2-FY2026 **1 190** (+6 %), Q3-FY2026 **1 420** (+6 %), Q4-FY2026 **1 090** (+7 %), Q1-FY2027 **1 227,2** (+7 %). Rullande fyra kvartal: **4 927 miljoner dollar**. Med Q1-FY2027 är det **tio kvartal i rad med årsvis tillväxt** — kedjan bakåt genom FY2025 bär samma rytm.

Kedjan bär också säsongsfällan, brutet räkenskapsårs andra signatur: oktober–december-kvartalet (Q3 i räkenskapsåret, helgens handel) är årets topp — 1 420 mot januar–mars-kvartalets 1 090. **Jämför aldrig Q2-FY2027 med Q1-FY2027 som ligger bredvid i kalendern** (1 190 mot 1 227 skulle se ut som nedgång; det är årstid, inte trend) — jämför Q2 mot Q2. Fjolårets Q2-FY2026 landade på 1 190, och bolagets egen guidance för Q2-FY2027 spänner **1 185–1 220 miljoner dollar, noll till tre procent årsvis tillväxt**, med bruttomarginal kring 44 procent och cirka 20 miljoner dollar i leverantörsrelaterad nackdel — guidancen är bolagets eget span från Q1-rapporten i juli, redovisad som räknestorhet.

Resultatsidans kedja är dramatikens: GAAP-rörelseresultatet **162 → 191 → 286 → (Q4 saknar sökbar GAAP-post) → 258,6** — och det sista steget bär paketets engångslexa. Q1:s GAAP-operating income steg 60 procent, GAAP-bruttomarginalen hoppade till **49,5 procent, plus 780 baspunkter** — men non-GAAP-rörelseresultatet 290 miljoner dollar bars delvis av **61 miljoner dollar i tullåterbetalningar** (amerikanska tullärenden som gick bolagets väg i kvartalet). Nettoresultatet 235,7 mot 146,0 miljoner föregående år (+61 procent), GAAP EPS 1,63. Läsarten: separera återkommande marginal från engångsposten — hur stor del av bruttomåttets +780 punkter som är varaktig är rapportens kärnfråga i oktober, och den går inte att besvara från insamlade tal.

Helåret FY2026 (avslutat 31 mars 2026, rapporterat 5 maj 2026): omsättning **4,84 miljarder dollar** (+6 % i dollar, +4 % i lokal valuta), GAAP-operating income **775 miljoner** (+18 %), GAAP EPS **4,80** (+16 %), non-GAAP EPS 5,78 — och bolagets egen utsaga: årets non-GAAP-bruttomarginal 43,6 procent och operativa marginal 18,8 procent var de **högsta någonsin**. Marginaltrappan, igen: vinsten växer på platt volym.

## Så står sig bolaget mot branschen

| Nyckeltal | Logitech | Median teknik (23 bolag) | Median hela universumet |
|---|---|---|---|
| P/E | 18,37 | 22,01 | 20,39 |
| P/B | 6,10 | 6,10 | 2,72 |
| EV/EBIT | 9,26 | 23,81 | ${uMed.evEbit.toFixed(2)} |
| Räntabilitet på eget kapital (ROE) | 35,29 % | 30,56 % | 14,66 % |
| Bruttomarginal | 45,24 % | 52,73 % | ${(uMed.brutto * 100).toFixed(2)} % |
| Rörelsemarginal (EBIT) | 21,22 % | 26,34 % | 20,81 % |
| Nettomarginal | 16,28 % | 20,41 % | 13,66 % |
| Skuld per eget kapital | 0,04 | 0,19 | 0,54 |

(Alla värden hämtade 2026-09-03 ur universumfilen; medianer beräknade 2026-09-21 ur samma fil — ${U.length} poster, varav ${tek.length} i teknik; PEG-median gren 1,15 (n=19); vissa mått har färder mätvärden än grenens storlek, redovisade i rang nedan.)

Läsningen har en form värd ett namn: **balansräkningens bolag bland mjukvarugrenen**. Tre rang talar för kapitalsidan — EV/EBIT tredje lägsta av 23, skuldsättning tredje lägsta, FCF-avkastning femte högsta — och en talar emot på produktsidan: bruttomarginal fjärde lägsta, tillverkarens arv i mjukvarugrenens median. Det är GETI-paketets spegelbild: där utrustningsbolaget bland läkemedelsmedianer, här kringutrustningen bland molnjättarna. P/B exakt på medianposten medan P/E ligger under är aritmetiken i ROE-avståndet (övning A). Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/teknik/universumjamforelse).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för ett kringutrustningsbolag med brutet räkenskapsår, rapportvaluta dollar och notering i franc. Ingen är en bedömning av vad som kommer att hända den 27 oktober — de är träning i metod och ren aritmetik.

**Övning A — räkna valutakedjan innan du jämför.** Kursen 81,00 franc mot den implicita kurs-ekvivalenten 88,16 dollar (P/E 18,37 × EPS 4,80) ger växeln 0,919 — och därmed är varje direkt jämförelse mot en svensk kollegas kron-kurs eller amerikansk kollegas dollar-kurs en valutotermin i förklädnad. Träningsfrågan: om francen stärker sig med fem procent mot dollarn mellan insamlingen och rappdagen, vad händer med P/E räknat i franc — och vad händer med det bokförda värdet av bolagets dollar-kassa? Svaret kräver ingen prognos, bara medvetenhet om vilken valuta varje tal är i. Multiplarnas inbördes ordning (P/E under grenmedian, P/B på medianposten) ändras inte av växeln — men avstånden gör det.

**Övning B — läs CAGR-kritiken genom pandemin-pendeln.** Omsättning-CAGRen plus 2,17 procent mäter 2022-topp mot 2026-topp — men serien mellan dem dalar till 4 298 innan den stiger tre år i rad. Resultat-CAGRen plus 24,95 procent mäter från 2022 års resultattopp 364,6 — vinsten nästan fördubblad på fyra år. Vilket av talen beskriver bolaget? Svaret är som alltid: båda beskriver serien, och ändpunkterna väljer berättelsen. Följdfrågan för oktober: vinstens marginalväxande (netto 8,0 procent 2022 → 14,7 procent 2026) — hur mycket av det som är strukturellt (mix mot dyrare produkter, prissättning) respektive cykliskt (frakt, valutor, tullåterbetalningar) är rapportens underlying-kapitel; Q1:s +780 punkter bruttomarginal med 61 miljoner i engångspost är övningens case.

**Övning C — scenariorutan i ren aritmetik, och marginalvikten som placerar volymen.** Universumets marginalfält är årsbaserat, så rutan räknas på räkenskapsåret 2026 som bas: omsättning 4 840,8 miljoner dollar och fältets rörelsemarginal 21,22 procent ger rörelseresultatet 1 027,2 miljoner — med begreppsgapet mot rapportens GAAP-rad 775 öppet redovisat i källkritiken. Med tre hypotetiska intäktsnivåer (±3 procent) och tre marginaler (±1 procentenhet) blir rutan, i miljoner dollar:

| Rörelseresultat (fältvägen), MUSD | Marginal 20,22 % | Marginal 21,22 % | Marginal 22,22 % |
|---|---|---|---|
| ${ruta[0][0]} | ${ruta[0][1]} | ${ruta[0][2]} | ${ruta[0][3]} |
| ${ruta[1][0]} | ${ruta[1][1]} | ${ruta[1][2]} | ${ruta[1][3]} |
| ${ruta[2][0]} | ${ruta[2][1]} | ${ruta[2][2]} | ${ruta[2][3]} |

Två räknesatser att öva på: en procentenhet marginal flyttar resultatet med cirka 48,4 miljoner dollar vid oförändrade intäkter, tre procent mer intäkter med cirka 145,2 miljoner — intäktsratten väger **ungefär 3,0 gånger** marginalratten; marginalvikten ett delat på tre gånger marginalnivån blir **1,57**. Jämfört med fastighetsgrenens 0,39–0,50 (Catena, Wihlborgs) är detta ett annat land: volymen dominerar, eftersom marginalnivån är en femtedel — men notera att volym-CAGRen ligger på 2,17 procent, så rutans intäktsspelrum har varit litet historiskt. Alla nio celler är aritmetik på FY2026:s fältbas, inga prognoser — och i praktiken rör sig marginalen med tullar, valutor och mix (övning B), inte med rutans jämna steg.

## Praktiskt inför 27 oktober

- Rappdagen tisdagen 27 oktober är tredjepartsestimat med bärande rytm (fyra senaste rapporterna: tisdagar; fjolårets Q2 kom 28/10 2025; Q1-FY2027 kom 28/7 2026 kl 13:00 PDT med webcast) — kontrollera [Logitechs IR-sida](https://ir.logitech.com/) för den formella utlysningen; den brukar komma några veckor före. Kalenderklassen redovisas öppet: estimerat, inte bolagsbekräftat.
- Rapporten gäller **juli–september 2026 = Q2 i räkenskapsår 2027** (april–mars). Jämför Q2 mot Q2 (fjolåret 1 190 miljoner dollar) — aldrig mot intilliggande kalenderkvartal. Bolagets guidance: 1 185–1 220 miljoner dollar, bruttomarginal kring 44 procent.
- Tre rader att läsa med engångsglasögon på: bruttomarginalen (Q1:s 49,5 procent bar tullåterbetalningar — var finns nolläget?), rörelseresultatet (Q1:s +60 procent GAAP mot +44 procent non-GAAP avslöjar posterna), och valutaraden (dollar-rapporten mot franc-noteringen — övning A).
- Ordlista för alla begrepp finns i [kurserna](/kurser); metodtransparensen på [transparenssidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling och aspektsidorna speglar nya medianer. I kalenderfältet efter Logitech står Microsoft 27–28 oktober, Alphabet och Meta 28 oktober, Chevron 30 oktober — alla estimerade fönster; oavsett utfall blir det nya rader i det öppna kvittot, inte prognoser.

## Källor

- Rappfönster Q2-FY2027 2026-10-27 (estimat) med tisdagsrytm: kalenderfilen teknik-grenen (internt underlag data/blogg-utkast/kvartal/2026-q3/kalender-teknik.json, hämtdatum 2026-09-15; orörd av detta paket) + sökverifiering 2026-09-21: ir.logitech.com events (Q2-FY2026 rapporterad 2025-10-28; Q3-FY2026 2026-01-27; Q1-FY2027 2026-07-28 kl 13:00 PDT; Q1-FY2026 2025-07-29) — ingen egen utlysning för Q2-FY2027 publicerad vid byggtidpunkten; P&G-klassen redovisas öppet.
- Kvartalstal, sökverifierade 2026-09-21 mot news.logitech.com/ir.logitech.com, Business Wire 2025-10-28, TechPowerUp och Yahoo Finance/Zacks-sammanställningar: Q1-FY2026 (2025-07-29): omsättning 1 150 (+5 % USD/+5 % CC), GAAP-brutto 41,7 % (−110 bp), GAAP-op 162 (+6 %), non-GAAP-op 202 (+11 %). Q2-FY2026 (2025-10-28): 1 190 (+6 %/+4 %), GAAP-brutto 43,4 %, GAAP-op 191 (+19 %), GAAP-EPS 1,15 (+21 %), non-GAAP-op 230 (+19 %), non-GAAP-EPS 1,45, cirka 230 MUSD driftskassa. Q3-FY2026 (2026-01-27): 1 420 (+6 %/+4 %), GAAP-brutto 43,2 % (+30 bp), GAAP-op 286 (+22 %), GAAP-EPS 1,69 (+28 %), non-GAAP-op 312 (+17 %, rekord), non-GAAP-EPS 1,93. Q4+FY2026 (2026-05-05): Q4-omsättning 1 090 (+7 %), non-GAAP-op +25 %, non-GAAP-EPS 1,13; helåret 4 840,8 mot källans avrundade 4,84 mdr (+6 % USD/+4 % CC), GAAP-op 775 (+18 %), GAAP-EPS 4,80 (+16 %), non-GAAP-EPS 5,78 (+19 %), non-GAAP-brutto 43,6 % och op-marginal 18,8 % "högsta någonsin", nettoresultat 711,2 (+12,6 %). Q1-FY2027 (2026-07-28): 1 227,2 (+7 % USD/+5 % CC), GAAP-brutto 49,5 % (+780 bp), GAAP-op 258,6 (+60 %; källtabell 258 551 tusen mot 162 091), non-GAAP-op 290 (+44 %) inklusive 61 MUSD tullåterbetalningar, nettoresultat 235,7 (146,0), GAAP-EPS 1,63, non-GAAP-EPS 1,85; tio raka kvartal med årsvis omsättningstillväxt. Guidance Q2-FY2027: 1 185–1 220 MUSD (0–3 % YoY), bruttomarginal ~44 %, ~20 MUSD leverantörsrelaterad nackdel (Q1-FY2027:s material enligt Quartr/Yahoo-sammanställningar). Kassabalans kring 0,3 mdr USD: bolagets investormaterial.
- Nyckeltal, kurser, börsvärde och serier: bolagsuniversumets insamling 2026-09-03 (Yahoo Finance quoteSummary-moduler; MarketStack dubbelkoll med slutkurs 2026-09-02) — internt: data/portfolj-system/bolagsunivers.json, posten LOGN.SW (notering CHF, serie i USD enligt rapportvaluta; ROIC = approximerad proxy; fyra räkenskapsår, inte fem; räntetäckning och utdelningsfält saknas, redovisade som hål).
- Bibliotekspost: data/forskningsbiblioteket/LOGN_SW.json (2026-09-04): grön, täckning 0,7113, AKM1 50,3/71,1 (relativ 0,7075), starkast lönsamhet, svagast katalysator.
- Medianer och rang: beräknade 2026-09-21 ur samma universumfil — ${U.length} poster, varav ${tek.length} teknik. Rang (stigande, av n med mätvärde): P/E 8/23 · P/B 12/23 · EV/EBIT 3/23 · PEG 16/19 · FCF-yield 18/22 (femte högst) · ROE 16/23 (åttonde högst) · ROIC 17/22 (sjätte högst) · brutto 4/23 (fjärde lägst) · EBIT 9/23 · netto 8/23 · skuld/EK 3/23 (endast två kollegor lägre, på exakt noll) · CAGR-oms 7/22 · CAGR-res 16/20 (femte högst) · TTM 5/22. Grenmedianer: P/E 22,01 · P/B 6,099 · EV/EBIT 23,81 · PEG 1,15 (n=19) · FCF-yield 2,38 % (n=22) · ROE 30,56 % · ROIC 22,58 % (n=22) · brutto 52,73 % · EBIT 26,34 % · netto 20,41 % · skuld/EK 0,189 · CAGR-oms 9,11 % (n=22) · CAGR-res 19,56 % (n=20) · TTM 12,74 % (n=22). Universummedianer: P/E 20,39 · P/B 2,72 · ROE 14,66 % · EBIT 20,81 % · netto 13,66 % · skuld/EK 0,54 · PEG 1,32 (n=${pegNU}).
- Kontroller och härledningar, egna beräkningar 2026-09-21: kurs-ekvivalent 18,367 × 4,80 = 88,16 USD → växelkurs 81,00 ÷ 88,16 = 0,919 CHF/USD; aktietal 11 598 ÷ 81,00 = 143,2 M (slut) mot 711,2 ÷ 4,80 = 148,2 M (vägt snitt; återköp); EK-bakväg 711,2 ÷ 0,3529 = 2 015 MUSD → BPS 14,07 → P/B-väg 2: 88,16 ÷ 14,07 = 6,27 (+2,7 % mot fältet 6,099); identitet P/B ÷ ROE = 17,29 mot P/E 18,37 (+6,3 %, fönsterförklaring redovisad); PEG-konvention 18,37 ÷ 8,09 = 2,27 mot källans 1,79 (kvot 0,79); CAGR-kontroller (4 840,8 ÷ 4 538,8)^(1/3) − 1 = 2,17 % och (711,2 ÷ 364,6)^(1/3) − 1 = 24,95 %; nettomarginal bokslut 711,2 ÷ 4 840,8 = 14,69 %; GAAP-op-marginal 775 ÷ 4 840,8 = 16,01 %; EBIT-fältväg 4 840,8 × 0,2122 = 1 027,2 (+32,6 % mot GAAP-rad 775); TTM-kvartalskedja 1 190 + 1 420 + 1 090 + 1 227,2 = 4 927,2; FY2026-kvartalssumma 1 150 + 1 190 + 1 420 + 1 090 = 4 850 (avrundningsbrus 0,2 % mot 4 840,8); scenarioruta nio celler = 4 840,8 × (1 ± 3 %) × (0,2122 ± 1 pp), bas 1 027,2; 1 pp = 48,4 MUSD, 3 % = 145,2 MUSD; marginalvikt 1 ÷ (3 × 0,2122) = 1,57.
- Vågskikt: LOGN.SW finns bland analysbibliotekets grönmarkerade poster men inte bland de vågvaliderade bolagen med egen analysfil — paketet redovisar ingen vågklassificering; luckan är information, inte något gissat fram.

Allt innehåll är utbildning i metod enligt lagen (2007:528) om värdepappersrörelser — inga köp-, sälj- eller behållningsrekommendationer. Publicering av utkastet är kundens beslut (R2).`;

const post = {
  slug: "sa-laser-du-logitech-q3-2026",
  title: "Logitech Q3-rapport 2026: så läser du den — det brutna räkenskapsårets två dörrar: aktien handlas i schweiziska franc medan rapporten skrivs i dollar (kursen 81,00 franc mot den implicita 88,16 dollar-kursen), och kalenderkvartalet juli–september är bolagets Q2 FY2027 — med vinsten nästan fördubblad på platt omsättning (365 → 711 miljoner dollar) och tullåterbetalningar i marginalen",
  description: "Logitech International — kringutrustningsbolaget på SIX Swiss Exchange med räkenskapsår april–mars — rapporterar kalenderkvartalet juli–september 2026 (bolagets Q2 FY2027) med tisdagen 27 oktober som estimerad rappdag, fjolåret den 28 oktober. Läspaketet: valutakedjan franc-notering mot dollar-rapport där P/E 18,37 mot rapporterad EPS 4,80 dollar ger den implicita kurs-ekvivalenten 88,16 dollar, säsongsfällan där julhandelskvartalet 1 420 miljoner dollar står mot januar–mars 1 090 — jämför Q2 mot Q2, aldrig mot grannkvartalet — tio raka tillväxtkvartal, marginaltrappan som höjt netto från 8,0 till 14,7 procent på fyra år, Q1:s GAAP-bruttomarginal 49,5 procent plus 780 baspunkter med 61 miljoner dollar tullåterbetalningar i engångsposten, och balansräkningen som signatur: skuldtäckning 0,04, EV/EBIT 9,26 tredje lägsta i teknikgrenen, FCF-avkastning 6,24 procent femte högsta — tillverkarens bruttomarginal 45 procent bland mjukvarujättarnas 53. Utbildning i metod, aldrig råd.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-10-27",
  readingMinutes: 6,
  tags: ["kvartalsrapport", "Logitech", "teknik", "Schweiz", "kringutrustning", "läspaket"],
  body,
};

writeFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-logitech-q3-2026.json", JSON.stringify(post, null, 2) + "\n");
writeFileSync("/home/ak1a/AK1/verktyg/_s4u2-logn-data.json", JSON.stringify(data, null, 2) + "\n");
const ord = body.split(/\s+/).filter(Boolean).length;
console.log("OK: paket skrivet. ord:", ord, "| H2:", (body.match(/^## /gm) || []).length);
console.log("kontroller: identAvv " + identAvv.toFixed(2) + "% | pbAvv " + pbAvv.toFixed(2) + "% | scBas " + scBas.toFixed(1) + " | vikt " + vikt.toFixed(2));
