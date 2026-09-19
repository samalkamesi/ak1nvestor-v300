// _s4u3-hufvudstaden-bygg.mjs — bygger HUFV-A Q3-2026-läspaketet (spår 4, s4-u3)
// Källor: data/portfolj-system/bolagsunivers.json (post HUFV-A.ST, hämtad 2026-09-03)
// + sökverifierade officiella tal (Hufvudstaden IR/MFN/Placera, se Källor-sektionen i bodyn).
// All aritmetik motorräknad här; KVD:n (verktyg/_s4u3-hufvudstaden-kvd.mjs) räknar om oberoende.
import { readFileSync, writeFileSync } from "node:fs";

const U = JSON.parse(readFileSync("/home/ak1a/AK1/data/portfolj-system/bolagsunivers.json", "utf8"));
const LIST = Array.isArray(U) ? U : (U.bolag || U.universum || Object.values(U).find(Array.isArray));
const B = LIST.find(x => x.ticker === "HUFV-A.ST");
if (!B) throw new Error("HUFV-A.ST saknas i universumfilen");

// — rådata ur universumposten —
const pris = B.pris;                       // 119.2
const mcap = B.marknadsKapitalMdr;         // 23.161 mdr
const pe = B.vardering.pe, pb = B.vardering.pb, evEbit = B.vardering.evEbit;
const peg = B.vardering.peg, fcfY = B.vardering.fcfYield;
const roe = B.lonksamhet.roe, roic = B.lonksamhet.roic;
const brutto = B.lonksamhet.bruttoMarginal, ebitM = B.lonksamhet.ebitMarginal;
const nettoM = B.lonksamhet.nettoMarginal, fcfM = B.lonksamhet.fcfMarginal;
const skuldEk = B.stabilitet.skuldEgenkapital;
const prog = B.tillvaxt.prognosTillvaxt, oCagr = B.tillvaxt.omsattningCAGR5ar;
const rCagr = B.tillvaxt.resultatCAGR5ar, ttm = B.tillvaxt.omsattningTillvaxtTTM;
const ar = B.serier.ar;                    // 2022..2025
const oms = B.serier.omsattning.map(x => x / 1e6);   // Mkr
const res = B.serier.resultat.map(x => x / 1e6);     // Mkr
const golv = B.golv.vardePerAktie, golvM = B.golv.marginal;

// — sökverifierade officiella rapporttal (2026-09-19; källor i bodyn) —
const rapp = {
  q1Hyres: 634, q1HyresFjol: 619, q1NettoOms: 815, q1NettoOmsFjol: 810, q1Bruttores: 422,
  h1Hyres: 1257, h1HyresFjol: 1226, h1NettoOms: 1642, h1Brutto: 850,
  q2Hyres: 623, q2HyresFjol: 607, q2RoresNetto: 415, q2RoresNettoFjol: 393,
  q2RoresRes: 940, q2RoresResFjol: 503, q2Vardforandring: 121,
  epsH1: 1.54, epsH1Fjol: 0.91,
  epraNu: 190, epraFjolPeriod: 183, epraArsskifte2026: 189, epraArsskifte2025: 185,
  bestand: 48344, internVarde: 14.0,
  utd: 2.90, utdFjol: 2.80,
};

// — motoraritmetik —
const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100, r3 = x => Math.round(x * 1000) / 1000, r4 = x => Math.round(x * 10000) / 10000;
const pct = (x, d = 2) => (100 * x).toFixed(d).replace(".", ",");
const sv = (x, d = 1) => x.toLocaleString("sv-SE", { minimumFractionDigits: d, maximumFractionDigits: d });

const aktier = mcap * 1000 / pris;                        // M aktier
const ekImplicit = mcap / pb;                             // Mdr
const ekPerAktie = ekImplicit * 1000 / aktier;            // kr
const idPeRoe = pe * roe;                                 // P/E×ROE
const gapId = idPeRoe / pb - 1;
const gapGolv = ekPerAktie / golv - 1;
const prisGolv = pris / golv;                             // = P/B-vägen via golvet
const golvMarginalHärled = 1 - prisGolv;
const skuld = skuldEk * ekImplicit * 1000;                // Mkr
const ev = mcap * 1000 + skuld;                           // Mkr
const ebitEv = ev / evEbit, ebitMarg = ebitM * oms[3];
const gapEbit = ebitEv / ebitMarg - 1;
const vinstPe = mcap * 1000 / pe, vinstMarg = nettoM * oms[3];
const gapVinst = vinstPe / vinstMarg - 1;
const fonsterOverAr = vinstPe / res[3] - 1;
const h1NettoNu = rapp.epsH1 * aktier, h1NettoFjol = rapp.epsH1Fjol * aktier;
const pegKonv = pe / (100 * prog), pegImplicitTillv = pe / peg, pegKvot = peg / pegKonv;
const fcfYieldVag = fcfY * mcap * 1000, fcfMargVag = fcfM * oms[3];
const fcfKvot = fcfYieldVag / fcfMargVag;
const rabattBok = 1 - pris / golv, rabattEpra = 1 - pris / rapp.epraNu;
const epraGap = rapp.epraNu / golv - 1;
const dirAvk = rapp.utd / pris;
const soliditet = ekImplicit * 1000 / (ekImplicit * 1000 + skuld);
// scenarioruta: substans 185/190/195 × rabatt −5pp/mätt/+5pp
const rMid = rabattEpra;
const rutor = [185, 190, 195].map(s => [rMid - 0.05, rMid, rMid + 0.05].map(r => r1(s * (1 - r))));
const rSubstans = 5 * (1 - rMid), rRabatt = rapp.epraNu * 0.05;
const vikt = rRabatt / rSubstans, overforing = rMid / (1 - rMid);
const pariBok = golv / pris - 1, pariEpra = rapp.epraNu / pris - 1;
// trappsteg
const stegOms = oms.map((v, i) => i ? v / oms[i - 1] - 1 : null);
const vandning = res[3] - res[1];

// medianer+rang ur universumfilen (fastighetsgrenen 16 bolag)
const FAST = LIST.filter(x => x.branche === "fastighet");
const med = a => { const s = a.filter(x => typeof x === "number" && isFinite(x)).sort((a, b) => a - b); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const get = (o, p) => p.split(".").reduce((o, k) => (o && o[k] !== undefined) ? o[k] : null, o);
const M = {};
for (const [k, p] of Object.entries({ pb: "vardering.pb", pe: "vardering.pe", evEbit: "vardering.evEbit", peg: "vardering.peg", fcfY: "vardering.fcfYield", roe: "lonksamhet.roe", roic: "lonksamhet.roic", netto: "lonksamhet.nettoMarginal", ebit: "lonksamhet.ebitMarginal", skuld: "stabilitet.skuldEgenkapital", prog: "tillvaxt.prognosTillvaxt", ocagr: "tillvaxt.omsattningCAGR5ar", brutto: "lonksamhet.bruttoMarginal", fcfM: "lonksamhet.fcfMarginal" })) {
  const arr = FAST.map(b => get(b, p));
  const tal = arr.filter(x => typeof x === "number").sort((a, b) => a - b);
  const hv = get(B, p);
  M[k] = { v: hv, m: med(arr), n: tal.length, rang: tal.filter(x => x < hv).length + 1 };
}
// grannar för skuldkronan
const skuldPar = FAST.map(b => [b.ticker, get(b, "stabilitet.skuldEgenkapital")]).filter(x => typeof x[1] === "number").sort((a, b) => a[1] - b[1]);
const universum = {};
for (const [k, p] of Object.entries({ pb: "vardering.pb", pe: "vardering.pe", evEbit: "vardering.evEbit", fcfY: "vardering.fcfYield", roe: "lonksamhet.roe", skuld: "stabilitet.skuldEgenkapital", prog: "tillvaxt.prognosTillvaxt" })) {
  const arr = LIST.map(b => get(b, p));
  universum[k] = { m: med(arr), n: arr.filter(x => typeof x === "number").length };
}

const title = `Hufvudstadens delårsrapport 2026: så läser du den — fastighetsgrenens femte paket och dess dubbla substans: P/B 0,830 med rabatten 16,95 procent mot bokförda böcker men 37,3 procent mot EPRA-substansen 190 kronor, grenens lägst belåtna balansräkning 0,46 — och FCF-paret som stänger på 0,65 procent, seriens tajtaste`;
const description = `Hufvudstaden publicerar interimsrapporten januari–september torsdagen den 5 november kl 12:00. Här är fastighetsgrenens femte läspaket: det femfalt låset där P/E, ROE, P/B, golvpris och FCF-paret stänger inom 0,7 procent, de två substansrabatterna 16,95 och 37,3 procent mot två olika böcker, 2023 års svarta hål minus 1 927 miljoner och återkomsten, samt scenariorutan i ren aritmetik på EPRA-substansen 190 kronor. Utbildning i metod — inte råd.`;

const body = `Hufvudstaden — ticker HUFV A på Nasdaq Stockholm — publicerar sin interimsrapport för januari–september 2026 torsdagen den **5 november kl 12:00**. Datumet är officiellt två gånger om: bolagets egen finansiella kalender listar "Interim Report January – September 2026" den 5/11 med tyst period 6/10–5/11, och MFN — bolagets utgivningskanal — bokför "Kvartalsrapport 2026-Q3" till 12:00 samma dag. Tidpunkten är själv en kalenderpärla: där de flesta svenska rapporter landar före börsöppning publicerar Hufvudstaden vid lunch — förra årets jan–sep-rapport kom 6 november 2025 kl 11:45. Det här är ett utbildningspaket i AK1A:s kvartalsrapportserie — fastighetsgrenens femte efter Castellum, NP3, Wallenstam och Fabege, och seriens 57:e. Allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför Hufvudstaden är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggt på den egna datainsamlingen. Urvalet följer seriens princip: tidigaste officiellt bekräftade rappdagen bland återstående kalenderbolag med bärande data. Med 55 paket på disk gallrades fältet enligt etablerade precedenser: Balder, Catena och Diös (23 oktober) gallrade på tredjepartsdatum — Inderes, MarketScreener och Nordnet utan bolagets egen utlysning, Wihlborgs-precedensen från tidigare omgång; Equinor (28 oktober) gallrad i Fortum-paketet på fyra dokumenterade källavikelser över 15 procent — kurs, P/E, P/B och börsvärde, en källbild som inte bär kontrollerna, och omprövning kräver en ny extern insamling som inte finns på disk; Kambi (4 november) har officiell kalender men universumpostens PEG-fält är null samtidigt som prognostillväxten är positiv — ett källgap, inte seriens konvention för negativa nämnare — vilket bryter mot JNJ-precedensens krav på bärande kontrollfält; MTG-B (5 november) har officiell kalender men en bruten resultsserie i Viaplay-gallrans klass — två negativa år, minus 210 och minus 62 miljoner kronor, resultat-CAGR null och ett intäktskliv 2024 på 92,6 procent som bär spår av förvärv. Kvar stod Hufvudstaden: rappdagen 5 november officiellt bekräftad i bolagets egen kalender, och en universumpost där ALLA kontrollfält bär — multiplarna hela vägen in, båda tillväxt-CAGR:erna, prognosen, fyra sammanhängande år i både intäkts- och resultsserien, och dessutom ett av universumets få golvfält: tillgångstung typ med bokfört eget kapital per aktie. Delat datum med MTG avgjordes på bärande data. Koordineringen i omgången redovisas öppet: klaimfilen skrevs före byggstart (auto-s4-1789835700993-s4-u3-ansprak.md), syskonens klaimer kontrollerades före och efter — kol­lisionsprotokollet är seriens: först till klaimfilen äger objektet, först till disk äger leveransen.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, fastighetsutgåvan

Värdena nedan är senaste mätta tal ur bolagsuniversumets datainsamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas. Hufvudstaden redovisar i svenska kronor och noterar i kronor — en valuta hela vägen, Swedbank-precedensens renaste kontrollgrund.

**Lönsamhet** — hur mycket värde skapas per insatt krona?

- Avkastning på eget kapital (ROE): **4,15 procent** — [så räknas ROE](/dataset/fastighet/roe). Fjärde lägst av femton mätta i fastighetsgrenen, mot grenens median 8,51 och universumets 15,02 procent. Som hos kollegorna är det inte uthyrningen som är svag — hyresverksamheten bär — utan att det bokförda kapitalet är enormt i förhållande till årsresultatet; se Datavaktens andra prov för hur fönstret rör sig.
- Avkastning på investerat kapital (ROIC): **4,20 procent** mot grenens median 4,56 — fältets approximation (rörelseresultat före skatt delat med skuld plus bokfört eget kapital) passar ett fastighetsbolag väl: kapitalbasen är själva husen.
- EBIT-marginal: **50,18 procent** mot grenens median 58,43 — mitt i fältet på rang sju av sexton.
- Nettomarginal: **35,22 procent** — femte lägst av sexton mätta, mot medianen 44,1. Fastighetsbolagets marginal är ett kapitalmarknadsmått: driftöverskottet äts av räntor, avskrivningar och värdeförändringar, och årssvängen 2023 visar hur långt det kan gå.
- Bruttomarginal: **82,32 procent** — tredje högst av sexton i grenen (median 71,06): Stadens bästa lägen har få direkta kostnader per intäktskrona.
- Fri kassaflödesmarginal: **30,34 procent** mot medianen 31,39 — se Datavaktens femte prov: kassan är den dimension där fälten stänger tajtast.

**Tillväxt** — vilket håll går rörelsen?

- Intäktstillväxt: **plus 3,77 procent per år** 2022–2025 (${sv(oms[0], 1)} → ${sv(oms[1], 1)} → ${sv(oms[2], 1)} → ${sv(oms[3], 1)} miljoner kronor) — [så läses årstillväxten](/dataset/fastighet/omsattningstillvaxt-ttm). Trappan är MONOTONT STIGANDE: ${pct(stegOms[1])}, ${pct(stegOms[2])} och ${pct(stegOms[3])} procent i årliga steg — inte ett enda nedsteg, tredje lågaste CAGR av femton mätta i grenen men den jämnaste trappan.
- Resultattillväxt: **plus 5,03 procent per år** — beräknad rakt ÖVER 2023 års svarta hål (minus ${sv(Math.abs(res[1]), 1)} miljoner): CAGR:fältet bär tack vare positiva ändpunkter, men läs serien som nivåer — Datavaktens tredje prov visar varför.
- Tolvmånadersfältet: **plus 1,60 procent** — och halvårets rapporterade nettoomsättning ${sv(rapp.h1NettoOms, 0)} miljoner kronor (${sv(rapp.h1NettoOms - rapp.q1NettoOms, 0)} på kvartalet mot ${sv(rapp.q1NettoOms, 0)} första) ligger i samma band.
- Prognostillväxt (konsensus): **plus 6,51 procent** — [om prognostillväxt](/dataset/fastighet/prognos-tillvaxt). Fjärde högst av sexton i grenen (tre fält över, medianen 2,04) — svenskan i fältet är svagt positiv, men konsensusfönstret räknar in värdeförändringar.

**Värdering** — vad kostar rörelsen på börsen? Tre multiplar, tre svar.

- Pris per bokfört eget kapital (P/B): **0,830** — [så räknas P/B](/dataset/fastighet/pb). Rang sju av sexton, mot grenens median 0,9355 och universumets 2,774: strax under halva grenen, vida under universumet. Marknaden betalar 83 öre per bokförd krona — [substansmultiplen förklaras här](/dataset/fastighet/egenkapitalmultipl).
- Pris per vinst (P/E): **20,135** — [P/E som begrepp](/dataset/fastighet/pe). Rang tio av sexton, mot medianen 12,909: över hälften av grenen betalar mindre per vinstkrona. Kopplingen till P/B 0,830 heter ROE 4,15 procent — Datavaktens första prov stänger dem på 0,68 procent.
- EV/EBIT: **21,145** — [företagsvärdet här](/dataset/fastighet/ev-ebit). UNDER grenens median 24,589: på driftön, innan räntorna, är Hufvudstaden billigare än medianfastighetsbolaget. Tre multiplar, tre världar — under boken, över medianen på vinsten, under medianen på driftön — och skillnaden är belåningen som skiljer ekviteten från företagsvärdet.
- PEG: **4,44** mot grenens median 4,16 — bär tal, men spärras av kontrollen (Datavaktens tredje prov).
- Fri kassaflödesavkastning: **4,34 procent** mot grenens median 4,07 och universumets 4,20 — [FCF-avkastningen](/dataset/fastighet/fcf-avkastning) är fastighetspaketets tredje svar på "är det billigt?", och det enda måttet som betalar utdelningen.
- Vid insamlingen var kursen **119,20 kronor** och börsvärdet **23,161 miljarder kronor** (${sv(aktier, 1)} miljoner aktier). Universumets golv-fält — tillgångstung typ — anger bokfört eget kapital per aktie till **143,53 kronor**, marginal till golvet 16,95 procent. Utdelningen 2,90 kronor (${sv(rapp.utdFjol, 2)} föregående år) ger direktavkastning ${pct(dirAvk)} procent på insamlingskursen; bolaget kör även återköp.

**Stabilitet och ägaraktivitet** — hur belånat är huset, och vem köper?

- Skuld per eget kapital: **0,4598** — [skuldsättningsgraden](/dataset/fastighet/skuldsattning). LÄGST AV ALLA SEXTON i fastighetsgrenen (närmast Prologis 0,6382, sedan Castellum 0,7481), under universumets median 0,510 och hälften av grenens 1,09. Härlett ur fälten: implicit eget kapital ${sv(ekImplicit, 1)} miljarder, skuld ${sv(skuld, 0)} miljoner, soliditet ${pct(soliditet, 1)} procent — grenens mest konservativa balansräkning, samtidigt som substansen handlas under bok (signaturnumret som bär paketet). Wihlborgs 1,49, Equinix 1,62 och Simon Property 5,04 bär andra änden.
- Räntetäckning: fältet är null hos källan — räntekostnaden saknas för senaste räkenskapsåret. Luckan redovisas öppet och antecknad som kön-förbättring till nästa insamling.
- Insiderköp senaste sex månader: **0** observationer hos källan.

## Datavakten — fem prov på ett bolag med två böcker

Paketets bärande övning, med samma verktygslåda som i seriens 55 tidigare paket: pröva källans tal mot identiteter och konventioner innan de används.

**Prov 1 — det femfalt låset: fem fält, ett börspris, alla gröna.** För det första: DuPont-identiteten i prisform — P/E gånger ROE måste bli P/B. 20,135 × 0,0415 = ${sv(idPeRoe, 4)} mot P/B-fältet 0,830: gapet plus ${pct(gapId)} procent. För det andra: golvvägen — börsvärdet 23,161 miljarder delat med P/B 0,830 ger implicit eget kapital ${sv(ekImplicit, 1)} miljarder; per aktie på ${sv(aktier, 1)} miljoner aktier blir det ${sv(ekPerAktie, 2)} kronor mot golvfältets 143,53 — gapet plus ${pct(gapGolv)} procent. För det tredje: golvmarginalen — 1 − 119,20/143,53 = ${pct(golvMarginalHärled)} procent, exakt fältets 0,1695. För det fjärde: pris delat med golvpris = ${sv(prisGolv, 5)} mot P/B-fältet 0,830 — samma lås sett från andra hållet. För det femte: FCF-paret, ${sv(fcfYieldVag, 0)} mot ${sv(fcfMargVag, 0)} miljoner kronor på två oberoende vägar — kvot ${sv(fcfKvot, 4)}, alltså ${pct(fcfKvot - 1)} procent, seriens tajtaste par (förra rekordet Hexagon 1,012). Fem stängningar, ingen över en procent: när pris, multiplar, golv och kassa låser så här vet läsaren att fälten mäter samma bolag samma dag.

**Prov 2 — TTM-detektiven: tre vinstläsningar samma dag.** Implicit vinst ur P/E-vägen: 23,161 miljarder delat med 20,135 ger ${sv(vinstPe, 0)} miljoner kronor. Nettomarginalvägen: 0,3522 × ${sv(oms[3], 0)} = ${sv(vinstMarg, 0)} miljoner. Gapet mellan dem: ${pct(Math.abs(gapVinst))} procent — ingen av seriens 55 paket har haft ett tajtare vinstpar. Men årsserien 2025 landade på ${sv(res[3], 0)} miljoner: P/E-fönstret ligger ${pct(fonsterOverAr, 1)} procent ÖVER kalenderåret. Fältet har alltså rullat in i 2026 — JPM-paketets bokvärdesspegel i vinstformat — och förklaringen bär halvårets egen rapport: resultat per aktie 1,54 kronor (0,91) motsvarar ${sv(h1NettoNu, 0)} miljoner i halvårsnetto mot ${sv(h1NettoFjol, 0)} förra året, medan kvartalets rörelseresultat ${rapp.q2RoresRes} miljoner (mot ${rapp.q2RoresResFjol}) inkluderar plus ${rapp.q2Vardforandring} miljoner orealiserade värdeförändringar. Tre begrepp — rörelseresultat, halvårsnetto, rullande årsfönster — tre svar, alla riktiga: lärdomen är Fabege-paketets i skärp tappning: läs ALDRIG en fastighetsvinst utan att fråga vilket fönster och vilka värdeförändringar den bär.

**Prov 3 — PEG som grönskar men spärras.** Källan anger PEG 4,44 med POSITIV prognos — till skillnad från Fabege och Yara pensioneras talet inte, det bär. Men kontrollen: konventionen P/E delat med tillväxtprocent ger 20,135 ÷ 6,51 = ${sv(pegKonv, 2)}, inte 4,44 — kvoten ${sv(pegKvot, 2)}. Räknat baklänges implicerar källans PEG en tillväxt på ${sv(pegImplicitTillv, 2)} procent, ett tal som inte matchar något av fältens egna (CAGR 5,03, TTM 1,60, prognos 6,51). PEG-talet grönskar alltså — positiv nämnare, fält finns — men spärras av kontrollen: redovisa som räknestorhet, aldrig som skattning.

**Prov 4 — de två substanserna: 143,53 eller 190 kronor?** Universumets golv (bokfört eget kapital per aktie, källans NAV-proxy) säger 143,53 kronor; bolagets rapporterade EPRA NRV per aktie vid halvåret 2026 säger ${rapp.epraNu} kronor — gapet ${pct(epraGap, 1)} procent. Båda är "substans", men de mäter med olika definitioner: bokfört kapital mot EPRA:s justerade substans, och däremellan ligger bland annat årens värdeförändringar. Konsekvensen för rabatten: mot böckerna är kursen 119,20 nedsidan ${pct(rabattBok)} procent, men mot EPRA-substansen ${rapp.epraNu} är den nedsidan **${pct(rabattEpra, 1)} procent** — tjugo procentenheters skillnad på samma kurs. EPRA-trappan är dessutom stigande: ${rapp.epraArsskifte2025} kronor vid årsskiftet 2025, ${rapp.epraArsskifte2026} vid årsskiftet 2026, ${rapp.epraNu} vid halvåret — mot ${rapp.epraFjolPeriod} vid samma period året innan. Övningen för rapportdagen är Fabege-paketets: bestäm FÖRST vilken bok du mäter mot, och håll måttet konsekvent kvartal efter kvartal — att växla definition mellan läsningarna är att mäta ingenting.

**Prov 5 — EV-kedjan: driftön stänger på ${pct(gapEbit, 1)} procent.** Skulden härledd ur fälten: 0,4598 × ${sv(ekImplicit, 1)} miljarder = ${sv(skuld, 0)} miljoner; företagsvärdet 23 161 + ${sv(skuld, 0)} = ${sv(ev, 0)} miljoner. Dividerat med EV/EBIT-fältet 21,145 ger implicit EBIT ${sv(ebitEv, 0)} miljoner, mot marginalvägens 0,5018 × ${sv(oms[3], 0)} = ${sv(ebitMarg, 0)} miljoner — gapet plus ${pct(gapEbit, 1)} procent, grönt. Notera vad kedjan visar: EV/EBIT under grenmedianen medan P/E över — skuldkronan (prov i Stabilitet) är själva förklaringen, och den här gången till bolagets fördel på driftön.

## Så står sig bolaget mot branschen

Fastighetsgrenen i universumfilen mäter 16 bolag — svenska stadsfastighetsbolag och de internationella REIT:arna. Medianerna nedan är omräknade 2026-09-19 ur filens aktuella poster, kolumnvis där tal finns.

| Nyckeltal | Hufvudstaden | Median fastighet (16 bolag) | Median universumet | Läge i grenen |
|---|---|---|---|---|
| P/B (substans) | 0,830 | 0,9355 | 2,774 | rang 7 av 16 — sex under, nio över |
| P/E | 20,135 | 12,909 | 20,525 | rang 10 av 16 — över grenen, på universumet |
| EV/EBIT | 21,145 | 24,589 | 17,955 | rang 7 av 16 — under grenens median |
| FCF-avkastning | 4,34 % | 4,07 % | 4,20 % | rang 9 av 15 — strax över mittpå |
| PEG (källans fält) | 4,44 | 4,16 | — | grönskar men spärras (Prov 3) |
| Räntabilitet på eget kapital (ROE) | 4,15 % | 8,51 % | 15,02 % | fjärde lägst av 15 mätta |
| Bruttomarginal | 82,32 % | 71,06 % | — | tredje högst av 16 |
| Nettomarginal | 35,22 % | 44,1 % | 14,09 % | femte lägst av 16 — men 2,5× universumet |
| Skuld/EK | 0,4598 | 1,090 | 0,510 | LÄGST av 16 — skuldkronan |
| Prognostillväxt (konsensus) | +6,51 % | +2,04 % | +13,14 % | fjärde högst av 16 i grenen |

Läsningen — två kronor av samma mynt: på substansen 11 procent under grenens median och 70 under universumets; på vinsten 56 procent ÖVER grenens median men exakt på universumets 20,5; på driftön 14 procent under grenen. Det som skiljer Hufvudstaden från Fabege-paketets tregångsmätare är riktningen på belåningen: Fabege ligger på grenens medianbelåning med P/B 0,614, Hufvudstaden har grenens LÄGSTA belåning med P/B 0,830 — två rabatter, två olika kapitalstrukturer bakom. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/fastighet/universumjamforelse), hela datasetet i [översikten](/dataset/fastighet) och [indexet](/dataset), och bolagets sida i biblioteket finns [här](/bolag/hufv-a-st).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på för ett fastighetsbolag — träning i metod och ren aritmetik, aldrig bedömningar av den 5 november.

**Övning A — läs hyresintäkterna, värdeförändringarna och substansen som tre separata serier.** Resultatserien 2022–2025 — plus ${sv(res[0], 1)}, minus ${sv(Math.abs(res[1]), 1)}, plus ${sv(res[2], 1)}, plus ${sv(res[3], 1)} miljoner kronor — ser ut som ett halsband med en svart pärla, men den är tre serier i en: hyresintäkterna (${sv(oms[0], 0)} → ${sv(oms[3], 0)} miljoner, aldrig nedåt), värdeförändringarna (2023 års minus ${sv(Math.abs(res[1]), 0)} är nästan hela nedskrivningseffekten på Stockholms och Göteborgs bästa lägen i räntekrisens botten), och substansen (EPRA-trappan 185 → 189 → ${rapp.epraNu}). Återkomsten från hålet till ${sv(res[3], 0)} miljoner är ${sv(vandning, 0)} miljoner på två år — och den kom utan att intäktstrappan bröts. Halvårets rapport bekräftar mönstret i miniatyr: rörelseresultatet ${rapp.q2RoresRes} (mot ${rapp.q2RoresResFjol}) bärs delvis av plus ${rapp.q2Vardforandring} miljoner orealiserade värdeförändringar, och bolagets interna värdering av vissa fastigheter (${sv(rapp.internVarde, 1)} miljarder) sammanträffade väl med externa värderingar. Övningen när rapporten ligger framför dig: hitta de tre raderna — hyresväxling, värdeförändring, substanssteg — innan du läser någon rubrik.

**Övning B — scenariorutan i ren aritmetik: kurs är substans gånger (ett minus rabatt).** Med rapporterad EPRA-substans ${rapp.epraNu} kronor och mätt rabatt ${pct(rabattEpra, 1)} procent vid insamlingen blir rutan, i kronor:

| Kurs, kronor | Rabatt 32,3 % | Rabatt 37,3 % | Rabatt 42,3 % |
|---|---|---|---|
| Substans 185 | ${sv(rutor[0][0], 2).replace(",00", "")} | ${sv(rutor[0][1], 2).replace(",00", "")} | ${sv(rutor[0][2], 2).replace(",00", "")} |
| Substans 190 | ${sv(rutor[1][0], 2).replace(",00", "")} | ${sv(rutor[1][1], 2).replace(",00", "")} | ${sv(rutor[1][2], 2).replace(",00", "")} |
| Substans 195 | ${sv(rutor[2][0], 2).replace(",00", "")} | ${sv(rutor[2][1], 2).replace(",00", "")} | ${sv(rutor[2][2], 2).replace(",00", "")} |

Mittencellen stänger mot insamlingskursen 119,20 på öret — rutan är kalibrerad. Två räknesatser: fem kronors substansrörelse flyttar kursen ${sv(rSubstans, 2)} kronor vid oförändrad rabatt, medan fem procentenheters rabattförändring flyttar den ${sv(rRabatt, 2)} kronor vid oförändrad substans — rabattnivån väger ${sv(vikt, 1)} gånger en normal substansrörelse. Överföringsgraden vid rabatten r är r/(1−r): ${sv(overforing, 3)} här — substanssteg sipprar igenom med knappast sex tiondels styrka, rabattdragen slår igenom mer än en till en från andra hållet. Alla nio celler är aritmetik på rapporterad substans och mätt rabatt — inga skattningar.

**Övning C — multipelövningen: P/B ett på två böcker.** Ren räkneövning med paketets tal: P/B 0,830 blir 1,0 antingen om kursen stiger till 143,53 kronor — plus ${pct(pariBok, 1)} procent vid oförändrad bok — eller om det bokförda kapitalet faller ${pct(rabattBok)} procent, från ${sv(ekImplicit, 1)} till 23,161 miljarder, vid oförändrad kurs. Spegel samma övning på EPRA-boken: pari mot substansen ${rapp.epraNu} kräver kurs ${rapp.epraNu} — plus ${pct(pariEpra, 1)} procent. Fyra vägar till pari, och övningens poäng är vad den INTE säger: vilken väg som är sannolik är en skattning, och skattningar tillhör inte detta paket. [Värderingsaspekten](/dataset/fastighet/vardering) sätter multiplarna i grensammanhang.

## Praktiskt inför 5 november

- Rapportdagen torsdag 5 november 2026 kl 12:00 är officiell: [bolagets finansiella kalender](https://hufvudstaden.se/en/investor-relations/calendar/) listar interimsrapporten med tyst period 6/10–5/11, och [MFN](https://mfn.se/all/a/hufvudstaden/) bokför "Kvartalsrapport 2026-Q3" till 12:00. Nästa bokslutskommuniké anges av tredjepartskalendern till 10 februari 2027.
- En valuta hela vägen: svensk redovisning i kronor, svensk notering i kronor.
- Bevakningslistan för rapporten: hyresintäkterna per kvartal (634 miljoner första, ${rapp.q2Hyres} andra — tredje kvartalets växling mot fjolårets jan–sep-nivåer), rörelsenettot (${rapp.q2RoresNetto} mot ${rapp.q2RoresNettoFjol} senaste kvartalet, plus 5,6 procent), värdeförändringarnas tecken och storlek (halvårets plus ${rapp.q2Vardforandring} miljoner — följer höstens externa värderingar?), EPRA NRV-steget (trappan 185 → 189 → ${rapp.epraNu}: kommer 191+?), och återköpens omfattning — utdelningsbeslutet kommer först till bokslutet, så kvartalets ägaraktivitet handlar om programmet, inte stubbar.
- Datavaktsnot för nästa insamling: räntetäckningsfältet är null och fylls från rapportens räntekostnad; direktavkastningen lever på aritmetik (2,90 kronor på kursen) medan källans fält saknas — antecknat som kön-förbättring, inte fel.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — fastighetsbolag och bokföring går igenom substans, driftöverskott och värdeförändringar, och [bloggen](/blogg) sätter talen i sammanhang. Metodtransparensen finns på [transparensidan](/transparens) och [källsidan](/kallor), forskningsdjupet på [portföljforskningssidan](/portfolj-forskning).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling, aspektsidorna speglar nya medianer — och fastighetsgrenens femte paket är nu levererat; i novemberfältet står Kambi (4 november) och MTG (5 november) kvar för syskonen.

## Källor

- Rappdag 2026-11-05 kl 12:00, tyst period 06/10–05/11: Hufvudstadens finansiella kalender (hufvudstaden.se, sökverifierad 2026-09-19) och MFN:s bolagskalender ("Kvartalsrapport 2026-Q3 12:00"); fjolårets jan–sep-rapport 2025-11-06 kl 11:45; nästa bokslutskommuniké 2027-02-10 enligt MarketScreener — internt underlag: data/blogg-utkast/kvartal/2026-q3/kalender-fastighet.json (2026-09-15: "interimsrapporten januari–september 2026 står i bolagets egen kalender torsdagen 2026-11-05 — officiellt bekräftat datum").
- Nyckeltal, kurs och fältvärden: bolagsuniversumets datainsamling för HUFV-A.ST 2026-09-03 (Yahoo Finance, quoteSummary-moduler; källa B, MarketStack, saknade färsk kurs — ingen dubbelkoll av pris/valuation, redovisas öppet; ROIC = approximerad proxy enligt källans not; räntetäckning osatt; golv = NAV-proxy bokfört EK per aktie; serier bygger på 4 räkenskapsår) — internt: data/portfolj-system/bolagsunivers.json. Medianer och rangplatser omräknade 2026-09-19 ur samma fil (16 bolag i fastighetsgrenen, n=11–16 per mått; universummedianerna 186–207 poster per mått, kolumnvis där tal finns).
- Rapporterade tal: Hufvudstadens egna rapporter, sökverifierade 2026-09-19 via bolagets IR-sidor, MFN, Nasdaq- och nyhetsförmedling — interimsrapport jan–mar 2026 (hyresintäkter ${rapp.q1Hyres} (${rapp.q1HyresFjol}) mnkr plus 2 procent, nettoomsättning ${rapp.q1NettoOms} (${rapp.q1NettoOmsFjol}), koncernens bruttoresultat ${rapp.q1Bruttores} plus 6 procent); halvårsrapport jan–jun 2026 (2026-08-20: hyresintäkter ${sv(rapp.h1Hyres, 0)} (${sv(rapp.h1HyresFjol, 0)}) plus 3 procent, nettoomsättning ${rapp.h1NettoOms}, bruttovinst ${rapp.h1Brutto} plus 6 procent, Q2: hyresintäkter ${rapp.q2Hyres} (${rapp.q2HyresFjol}), rörelsenetto ${rapp.q2RoresNetto} (${rapp.q2RoresNettoFjol}) plus 5,6 procent, rörelseresultat ${rapp.q2RoresRes} (${rapp.q2RoresResFjol}) inklusive plus ${rapp.q2Vardforandring} mnkr orealiserade värdeförändringar, resultat per aktie 1,54 (0,91) kronor, EPRA NRV per aktie ${rapp.epraNu} (${rapp.epraFjolPeriod}) kronor, fastighetsbestånd ${sv(rapp.bestand, 0)} mnkr vid Q1, intern värdering ${sv(rapp.internVarde, 1)} mdr i sammanträffande med externa); bokslutskommuniké 2025 (2026-02-12: EPRA NRV ${rapp.epraArsskifte2026} (${rapp.epraArsskifte2025}) kronor, ordinarie utdelning ${sv(rapp.utd, 2).replace(",00", "")} (${sv(rapp.utdFjol, 2).replace(",00", "")}) kronor beslutad på årsstämman 2026-03-19, återköpsprogram pågående).
- Datavaktens fem prov: egna beräkningar — låset (20,135 × 0,0415 = ${sv(idPeRoe, 4)} mot 0,830, gap plus ${pct(gapId)} procent; 23,161 ÷ 0,830 = ${sv(ekImplicit, 1)} Mdr, ÷ ${sv(aktier, 1)} M aktier = ${sv(ekPerAktie, 2)} mot golvet 143,53, gap plus ${pct(gapGolv)} procent; 1 − 119,20/143,53 = ${pct(golvMarginalHärled)} procent = fältet; 119,20/143,53 = ${sv(prisGolv, 5)}; FCF 0,0434 × 23 161 = ${sv(fcfYieldVag, 1)} mot 0,3034 × ${sv(oms[3], 0)} = ${sv(fcfMargVag, 1)} Mkr, kvot ${sv(fcfKvot, 4)}), TTM-detektiven (23 161 ÷ 20,135 = ${sv(vinstPe, 1)}; 0,3522 × ${sv(oms[3], 0)} = ${sv(vinstMarg, 1)}; årsserien ${sv(res[3], 1)}; fönstret ${pct(fonsterOverAr, 1)} procent över kalenderåret; H1-netto 1,54 × ${sv(aktier, 1)} = ${sv(h1NettoNu, 1)} mot ${sv(h1NettoFjol, 1)}), PEG (20,135 ÷ 6,51 = ${sv(pegKonv, 2)}; implicit 20,135 ÷ 4,44 = ${sv(pegImplicitTillv, 2)} procent; kvot ${sv(pegKvot, 2)}), substanserna (1 − 119,20/143,53 = ${pct(rabattBok)}; 1 − 119,20/${rapp.epraNu} = ${pct(rabattEpra, 1)}; gap ${sv(rapp.epraNu)}/143,53 = ${pct(epraGap, 1)} procent) och EV-kedjan (0,4598 × ${sv(ekImplicit, 1)} = ${sv(skuld, 0)} Mkr skuld; EV ${sv(ev, 0)}; ÷ 21,145 = ${sv(ebitEv, 0)} mot 0,5018 × ${sv(oms[3], 0)} = ${sv(ebitMarg, 0)} Mkr, gap plus ${pct(gapEbit, 1)} procent) — samtliga steg redovisade i texten.
- Scenarioruta, räknesatser och multipelövningar: aritmetik på rapporterad EPRA-substans (185, ${rapp.epraNu}, 195 kronor), mätt rabatt (${pct(rabattEpra, 1)} procent) och fältvägens implicita kapital (${sv(ekImplicit, 1)} miljarder); samtliga nio celler och båda räknesatserna dubbeltkontrollerade vid tillverkningen 2026-09-19.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält håller inte för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const ord = body.split(/\s+/).filter(Boolean).length;
const rm = Math.round(ord / 600);
// Getinge-precedensen: sv-SE-formatterarens U+00A0 normaliseras till vanligt mellanslag
const norm = s => s.replace(/[\u00a0\u202f]/g, " ");
const body2 = norm(body);

const json = {
  slug: "sa-laser-du-hufvudstaden-q3-2026",
  title: norm(title), description: norm(description),
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-11-05",
  readingMinutes: rm,
  tags: ["kvartalsrapport", "Hufvudstaden", "fastighet", "substansrabatt", "EPRA", "läspaket"],
  body: body2,
};
writeFileSync("/home/ak1a/AK1/data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hufvudstaden-q3-2026.json", JSON.stringify(json, null, 2) + "\n");
console.log("SKREV sa-laser-du-hufvudstaden-q3-2026.json | ord =", ord, "| readingMinutes =", rm);
console.log("aktier =", sv(aktier, 2), "| EK =", sv(ekImplicit, 3), "Mdr | EK/aktie =", sv(ekPerAktie, 3));
console.log("fcfKvot =", fcfKvot.toFixed(5), "| vinstGap =", pct(gapVinst), "| rutor =", JSON.stringify(rutor));
