#!/usr/bin/env node
// _s4u2-latour-byggdata.mjs — motor för Latour Q3-läspaket 2026 (s4-u2, manifest auto-s4-1790046905434)
// Läser fryst talbank _s4u2-latour-data.json, interpolerar body-mallen, sanerar NBSP (MTG-läxan),
// ABORT-grind på undefined/null-interpolationer (Investor-precedensen), skriver paket-JSON.
import { readFileSync, writeFileSync } from "node:fs";

const T = JSON.parse(readFileSync(new URL("./_s4u2-latour-data.json", import.meta.url), "utf8"));

// S-vägsvalidering (MTG-läxan): varje väg mallen använder måste finnas — annars ABORT före skriv.
const sv = (x, s) => { if (x === undefined || x === null || Number.isNaN(x)) { console.error("ABORT — talbanksväg saknas:", s); process.exit(1); } return x; };
const f1 = (x) => sv(x, "f1").toFixed(1).replace(".", ",");
const f2 = (x) => sv(x, "f2").toFixed(2).replace(".", ",");
const pct1 = (x) => f1(sv(x, "pct1") * 100);
const pct2 = (x) => f2(sv(x, "pct2") * 100);
const svSE = (x) => sv(x, "svSE").toLocaleString("sv-SE");

const S = {
  rappdag: sv(T.kalender.rappdag, "rappdag"),
  veckodag: sv(T.kalender.veckodag, "veckodag"),
  tidpunkt: sv(T.kalender.tidpunkt, "tidpunkt"),
  q1datum: sv(T.kalender.tidigare2026.q1, "q1datum"),
  h1datum: sv(T.kalender.tidigare2026.h1, "h1datum"),
  prisFmt: f1(T.universum.pris),
  mcap: f1(T.universum.marknadsKapitalMdr),
  pe: f3(T.universum.vardering.pe),
  pb: f3(T.universum.vardering.pb),
  evEbit: f3(T.universum.vardering.evEbit),
  fcfYield: pct2(T.universum.vardering.fcfYield),
  roe: pct1(T.universum.lonksamhet.roe),
  brutto: pct2(T.universum.lonksamhet.bruttoMarginal),
  ebitm: pct2(T.universum.lonksamhet.ebitMarginal),
  nettom: pct2(T.universum.lonksamhet.nettoMarginal),
  cagr: pct2(T.universum.tillvaxt.omsattningCAGR5ar),
  ttm: pct1(T.universum.tillvaxt.omsattningTillvaxtTTM),
  mpe: f2(T.gren.medianer.pe), mpb: f2(T.gren.medianer.pb), mev: f1(T.gren.medianer.evEbit),
  mroe: pct1(T.gren.medianer.roe), mpeg: f2(T.gren.medianer.peg),
  grenN: sv(T.gren.antalBolag, "grenN"),
  rPe: sv(T.gren.latourRang.pe, "rPe"), rPb: sv(T.gren.latourRang.pb, "rPb"), rRoe: sv(T.gren.latourRang.roe, "rRoe"),
  navAR2024: 215, navQ1_25: 213, navH25: 207, navQ3_25: 210, navAR2025: 216, navQ1_26: 203, navH26: 203, navAUG: 204,
  substans2025: svSE(T.navTrappa.totaltMkr[1].varde),
  substans2024: svSE(T.navTrappa.totaltMkr[0].varde),
  ifrsEk: svSE(T.balansVarden.ifrsEkImplicit.varde),
  substansKvot: sv(T.balansVarden.substansMotIfrs, "substansKvot"),
  kursPerNav203: "1,032",
  okt25: "234,20",
  kurs218: "218",
  netdt0: svSE(T.balansBelåning.nettoskuldMkr.arsskifte2025),
  netdt1: svSE(T.balansBelåning.nettoskuldMkr.q1_2026),
  netdt2: svSE(T.balansBelåning.nettoskuldMkr.q2_2026),
  netdt2x: svSE(T.balansBelåning.nettoskuldMkr.q2_2026_exklLease),
  q2py: svSE(T.balansBelåning.q2Py),
  utd26: "5,10", utd25: "4,60",
  utdMkr: svSE(T.utdelning.arsUtdelningMkr),
  notVarde: sv(T.portfolj.noteradVardenMdr.q2_2026, "notVarde"),
  notVardePy: sv(T.portfolj.noteradVardenMdr.q2_2025, "notVardePy"),
};
function f3(x) { return sv(x, "f3").toFixed(3).replace(".", ","); }

const body = `
Investment AB Latour (publ) — ticker LATO B på Nasdaq Stockholm, Göteborgsbaserat investmentbolag i finansgrenen — publicerar sin mellanhavanderapport för januari–september 2026 tisdagen den **${S.rappdag} kl ${S.tidpunkt}**. Datumet är bolagets eget: finansiella kalendern på latour.se bokar "Interim report for the period January - September 2026" den 3 november kl 08:00, och årsbokslutet från februari bekräftar samma dag med sin egen utlysning. Observera formen: en mellanhavanderapport är en lättare uppdatering än delårsrapporten — kärnan är substansvärdet per aktie och en kommentar kring portföljen. Det här är ett utbildningspaket i AK1A:s kvartalsrapportserie: det lär ut hur man läser ett investmentbolags rapport, vilka mått som bär information i den bolagstypen — substansvärdet som huvudtal, premien som andrahjul — och hur man övar på olika utfall. Det är inte en rekommendation att köpa, sälja eller behålla några värdepapper; det är utbildning i metod, inget annat. Serien har mött investmentbolagsfamiljen tre gånger förut — Industrivärden (kurs i nivå med bokförd substans), Kinnevik (rabattutgåvan, 40 procent under) och Investor AB (dubbla substanslinjaler och en premie som just vänt tecken) — Latour tillför fjärde läsarten: ett investmentbolag som konsoliderar en verklig industrirörelse samtidigt som substansen är huvudtalet, och en premiehistoria som på ett enda år vandrat genom båda tecknen.

## Urvalet: varför Latour är nästa paket — och en pivot bokförd öppet

Urvalet följer seriens princip: tidigaste återstående rappdag med bärande data, med klaim disk-först före all insamling. Spårets stående kö efter Equinor- och MTG-paketen lyder "NVDA 17/11 (tredjepartskonfirmerad), novemberfältets övriga datum" — och förstavalet i denna omgång var just NVIDIA. Det valet förlorades: syskon u1:s klaimfil landade på disk 03:17:48Z, en minut före denna agents duplikatkontroll, och klaimfilen-på-disk-äger-regeln (Newmont-precedensen) ger dem objektet. Ingen NVDA-yta är härvidrörd; pivoten bokförs i klaimfilen. Därmed är novemberfältets FIFO-etta bland återstående **Latour 3/11** — före Fresenius 4/11 (universumraden saknar börsvärde hos källan, Öresund-gallran gäller tills den botats), Sinch och Polestar 5/11, Enel 11/11. Och där könoten kallade datumet estimerat höjer detta paket dess klass: **bolagsbekräftat** — egen kalender plus egen utlysning i årsbokslutet, sökverifierat vid byggtid. Bärande data finns: universumraden från 3 september med full värdekärna (börsvärde ${S.mcap} miljarder kronor, P/E ${S.pe}, P/B ${S.pb}, EV/EBIT ${S.evEbit}), och en officiell NAV-svit från årsbokslut och båda mellanrapporter under 2026. Finansgrenens åttonde paket, investmentbolagsfamiljens fjärde — seriens omkring 82:a på disk, med syskonens NVDA-paket under parallell byggnation (deras klaim föregick denna pivot; ordinalen justeras vid behov av granskningskön enligt Microsoft-precedensen).

## NAV-trappan och premiens vandring — från åtta års premie till rabatt och tillbaka

Ett investmentbolags rapport är i grunden en substansrapport: vad är portföljen värd på värderingsdagen, per aktie? Latours trappa:

| Mätning | NAV per aktie (kr) |
|---|---|
| Slutet 2024 | ${S.navAR2024} |
| Q1 2025 | ${S.navQ1_25} |
| Q2 2025 | ${S.navH25} |
| Q3 2025 (mätning 3 nov) | ${S.navQ3_25} |
| Slutet 2025 | ${S.navAR2025} |
| Q1 2026 | ${S.navQ1_26} |
| Q2 2026 (30 juni) | ${S.navH26} |
| 18 augusti 2026 | ${S.navAUG} |

I pengar var substansen ${S.substans2024} miljoner kronor vid utgången av 2024 och ${S.substans2025} vid utgången av 2025 — årsbokslutets egen utdelningsjusterade rörelse var plus 2,4 procent. Under 2026 har trappan stigit: från ${S.navAR2025} vid årsskiftet till ${S.navQ1_26} efter första kvartalet (minus 6,0 procent på ett kvartal där indexet SIXRX bara föll 1,2 procent — den noterade portföljen föll hela 9,0 procent), plant ${S.navH26} vid halvårsskiftet, och ${S.navAUG} vid augustiuppdateringen som fortfarande är senaste publicerade tal. Vad tredje kvartalet gjort med trappan är rapportens första läsnummer.

Men paketets egna signatur är **premiens vandring** — vad börsen betalt över substansen, samma bolag, tolv månader:

| Tidpunkt | Kurs (kr) | NAV (kr) | Premie |
|---|---|---|---|
| Oktober 2025 | ${S.okt25} | ${S.navQ3_25} | +11,5 % |
| Årsskiftet 2026 | ≈${S.kurs218}* | ${S.navAR2025} | +1,0 % |
| Mars 2026 | — | ${S.navQ1_26} | **rabatt — första på åtta år** |
| 30 juni 2026 | 193 | ${S.navH26} | −4,9 % |
| September 2026 | ${S.prisFmt} | ${S.navH26} | +3,2 % |

Kursen vid årsskiftet är härledd ur årets utfall (aktien noterad 206 kronor den 18 september, nere 5,6 procent på året, ger ungefär ${S.kurs218} vid årsskiftet — deklarerad härledning; alla övriga tal i tabellen är rapporterade). Läs kedjan som en enda berättelse: i oktober 2025 betalade marknaden elva och en halv procent över substansen — samma månad citerades aktien som en premievärdering som var svår att bortse från. Vid årsskiftet hade premien krympt till en procent. I mars 2026 vände tecknet: Latour handlades i **rabatt mot eget substansvärde för första gången på åtta år**. Vid halvårsskiftet var rabatten 4,9 procent (kurs 193 mot NAV 203 — rapportens egna tal, avrundat fem procents rabatt). Och i september, med kursen tillbaka på ${S.prisFmt} mot sommarens NAV ${S.navH26}: en premie på 3,2 procent — mot augustitalet ${S.navAUG} blir det 2,8 procent. Femton procentenheters premiesving på tolv månader, utan att portföljen bytt karaktär. Det är investmentbolagsläsningens första grammatik: kursen är en åsikt om substansen, och åsikten svänger hårdare än det underliggande värdet. Rapportläsaren noterar den 3 november därför två tal var för sig: NAV-steget, och vad kursen sedan oktober gjort med premien.

## Balansräkningens tre världar — bokfört, substans och börs

Här kommer paketets källkritiska signaturnummer, och det är en spegelbild av Investor-paketets identitetstest. För Investor möttes källans P/B-fält och kurs delat i rapporterat NAV på tredje decimalen — substansläsningen satt i fältet. För Latour är det tvärtom: universumets P/B-fält säger **${S.pb}** medan kursen ${S.prisFmt} mot sommarens NAV ${S.navH26} ger **${S.kursPerNav203}**. En faktor tre isär — och skillnaden är hela läxan om nämnarens innehåll. Räkna baklänges: börsvärdet ${S.mcap} miljarder delat i P/B-fältet ${S.pb} ger ett implicit bokfört eget kapital på cirka ${S.ifrsEk} miljoner kronor. Substansvärdet i årsbokslutet var ${S.substans2025} miljoner. Börsvärdet ligger omkring 134 miljarder. Tre världar om samma bolag: **bokförd balansräkning, substansvärde och börspris** — och substansen är ${S.substansKvot} av det bokförda kapitalet. Varför? Latour konsoliderar sina helt ägda industribolag (Hultafors, Swegon, Nord-Lock med flera) till anskaffningsvärden med regelrätta avskrivningar, medan substansberäkningen värderar dem i nivå med hur liknande bolag prissätts på börsen — samma mekanik som Investors justeringsgap mellan rapporterat och justerat NAV, men här med större spridning eftersom den onoterade sidan är själva rörelsen. Lärdomen att bära mellan paket: ett P/B-tal är meningslöst tills du vet vad nämnaren innehåller. För investmentbolag med stor onoterad sida säger källans fält något helt annat än kurs delat i substans.

En andra källkritisk notis i samma sektion: själva börsvärdet sprider sig mellan källor — universumets fält ${S.mcap} miljarder (Yahoo, 3 september), latour.se:s egen ruta cirka 134 miljarder (september), Avanzas börsvärde 131,8 miljarder — ett spann på knappt två procent, olika kurstillfällen och aktieantalsbegrepp. Det implicita aktieantalet ur substansen (${S.substans2025} miljoner delat i NAV ${S.navAR2025}) är 571,9 miljoner aktier; ur universumets mcap-fält blir det 639 miljoner — källornas aktieantalsbegrepp går isär med drygt elva procent, och paketet härleder därför aldrig aktiekänsliga tal ur enkelt börsvärde: utdelningsekvationen nedan använder det substansimplicita antalet, deklarerat som härledning. Där ett tal är en källas begrepp står det som källans; där det är härlett står det som härlett. Till ärlighetsraden hör dessutom universumraden själv: den andra datakällan (MarketStack) saknade färsk kurs vid septemberinsamlingen — pris och värderingsfält är enkelkällade mot Yahoo, vilket redovisas öppet, med latour.se:s egen kursruta (209,80 den 21 september) som oberoende andra åsikt inom 0,2 procent.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, investmentbolagsutgåva nummer två

Nedan är universumradens mätta värden (insamling 3 september 2026) ordnade i AKM2:s fyra dimensioner, med finansgrenens medianer omräknade live ur den 256-postiga universumfilen — ${S.grenN} finansbolag, varav de flesta är banker och därför jämförelsemässigt överordnade för en substansläsare: medianerna är byggda för drifande bolag.

**Lönsamhet** — hur mycket värde skapar kronorna?

- Avkastning på eget kapital (ROE): **${S.roe} procent** — [så räknas ROE](/dataset/finans/roe). Grenens median är ${S.mroe} procent; Latours rang ${S.rRoe}. Men läs det som substansrörelse: avkastningen drivs av portföljens värdeförändringar, inte av drift.
- Marginaltrappan är den stora kontrasten mot syskonen i familjen: bruttomarginal **${S.brutto} procent**, rörelsemarginal **${S.ebitm}** och nettomarginal **${S.nettom}** ([nettomarginal](/dataset/finans/netto-marginal)) — samt [FCF-avkastning](/dataset/finans/fcf-avkastning) ${S.fcfYield} procent. Investor-paketet visade marginaler nära nittio procent — där är "omsättningen" utdelningar och realisationer. Latour är den andra grammatiken: bolaget konsoliderar en verklig industrirörelse på över tjugoåtta miljarder kronor om året, och marginalerna bär den. Samma nyckeltal, två bolagsvärldar.

**Tillväxt** — vilket håll går rörelsen?

- Omsättningstillväxt senaste tolvmånadersperioden: **plus ${S.ttm} procent** — [så läses TTM-tillväxten](/dataset/finans/omsattningstillvaxt-ttm). Flerårsserien: koncernomsättningen växte från 22 611 miljoner 2022 till 28 145 miljoner 2025 — ${S.cagr} procent per år (fyra räkenskapsår; källan ger inte fem, noten följer med). Men det är konsoliderad industriomsättning, inte substanstillväxt; kurvorna kan gå isär.
- Prognostillväxt: **osatt** — källan saknar konsensusprognos och paketet gissar aldrig. PEG-fältet följer med i osattheten ([värdeläsningen](/dataset/finans/vardering)). Grenens PEG-median för de 34 mätta bolagen är ${S.mpeg}.

**Värdering** — vad kostar portföljen?

- Pris per bokfört kapital (P/B): **${S.pb}** — [P/B inom finans](/dataset/finans/pb). Rang ${S.rPb} av ${S.grenN} i grenen — men efter nämnarläxan står klart att fältet mäter mot IFRS-kapitalet, inte mot substansen. Substansläsningen är kurs ${S.prisFmt} mot NAV ${S.navH26}: ${S.kursPerNav203}. Två tal, två sanningar — och svaret på "vad handlas bolaget till?" är det senare.
- Pris per vinst (P/E): **${S.pe}** — [P/E inom finans](/dataset/finans/pe), mot grenens median ${S.mpe} (rang ${S.rPe}). Vinsten i ett investmentbolags resultaträkning svänger med värdestegringar och nedskrivningar i portföljen — samma läsvarning som Investor-paketets botten-P/E, fast här i fältets mitt.
- Enterprise value per rörelseresultat (EV/EBIT): **${S.evEbit}** — [EV/EBIT](/dataset/finans/ev-ebit) mot medianen ${S.mev} (av 20 mätta). Investmentbolagsvarningen igen: EV bygger på börsvärdet mot en rörelse som till större delen är portföljens; [värderingsöversikten](/dataset/finans/vardering) förklarar hur multiplarna hänger ihop.

**Stabilitet** — hur belånat är huset?

- Skulder per eget kapital: **osatt i universumet** — finansbolagsgrammatiken. Bolagstypens eget mått är nettoskuld i förhållande till investeringsvärdet, och historiken är en trappa nedåt: **${S.netdt0} miljoner vid årsskiftet, ${S.netdt1} efter första kvartalet, ${S.netdt2} vid halvårsskiftet** (föregående års jämförelsetal: ${S.q2py}) — och exklusive IFRS 16-leasingavtal ${S.netdt2x} miljoner, omkring nio procent av investeringsvärdet; minskningen från årsskiftet är 16,8 procent på ett halvår, och realisationerna är en del av bränslet. Fitch höll i september betyget A med stabil outlook och mätte loan-to-value till fjorton procent, oförändrat mot året före. [Så läs skuldsättning för driftsbolag](/dataset/finans/skuldsattning) — kontrasten är poängen: samma fråga, annat mått.
- Insiderköp senaste sex månader: **0** i universumets fält — ägarbilden är generationernas långsiktiga huvudägarskap, och fältet tyst.

## Koncernkvartalen och portföljen bakom substansen

Mellanhavanderapportens rörelsesida är de konsoliderade industribolagens. Kvartalskedjan — nettoomsättning och resultat efter finansiella poster, miljoner kronor; kvartalsvärdena markerade med asterisk är härledda ur periodsummeringar och deklareras som sådana:

| Kvartal | Omsättning | Resultat efter fin. |
|---|---|---|
| Q1 2025 | 6 884 | 946 |
| Q2 2025* | 7 096 | 1 598 |
| Q3 2025* | 6 750 | 1 222 |
| Q4 2025* | 7 415 | — |
| Q1 2026 | 6 735 (−2,2 %) | 567 (−40,1 %) |
| Q2 2026* | 7 226 (+1,8 %) | 3 857 (+141 %) |

Halvåret 2026 blev 13 961 miljoner (13 980 föregående år) och resultatet efter finansiella poster 4 424 miljoner mot 2 544 — en kontrast mellan en i princip oförändrad industriell topprad och ett resultat som nästan fördubblats: Q1-svagheten (567 miljoner, minus 40 procent; organiskt orderintag dock plus fem procent och organisk omsättning plus fyra, med valutadrag minus sex) vändes av en Q2 där värdestegringar i den noterade portföljen flyttar resultaträkningen. Det är investmentbolagets dubbla bokföring i realtid: driftens kvartal är jämna, substansens kvartal svänger.

Portföljen bakom substansen: **tio noterade bolag värda cirka ${S.notVarde} miljarder kronor vid halvårsskiftet** (mot ${S.notVardePy} miljarder ett år tidigare) — Alimak Group, ASSA ABLOY, CTEK, Fagerhult Group, HMS Networks, Nederman, Securitas, Sweco, TOMRA och Troax, där Latour är huvudägare eller en av huvudägarna. Aktieantalen i toppskiktet: 97,8 miljoner aktier i ASSA ABLOY (efter maj månads försäljning), 84,7 miljoner i Fagerhult, 62,4 miljoner i TOMRA, 24,7 miljoner i CTEK och 13,0 miljoner i HMS Networks. Den noterade portföljens avkastning var minus 8,8 procent under första halvåret — ett värdeår som kontrast mot 2025, då SIXRX steg 12,7 procent och aktien ändå gav totalavkastning minus 16,9 procent (ett gap på 29,6 procentenheter: index, substans och kurs är tre kurvor som rör sig olika). Den onoterade sidan är den andra halvan av substansen: helt ägda Hultafors Group, Swegon, Nord-Lock Group, Bemsiq, Caljan, Innovalift och Latour Industries, delägda Oxeon — och i juni förvärvades LaminAir i Schweiz. Årets portföljrörelser på kassasidan: försäljningen av 7,6 miljoner ASSA ABLOY B-aktier för 2,5 miljarder kronor i maj (enligt Fitch), överväganden om partiell avyttring av Securitas B-aktier, och väntade utdelningar från portföljen på cirka 1,8 miljarder kronor under 2026 enligt ratinginstitutet — upp tio procent mot året före.

Räkneövningen som binder samman kapitlet — **dämpningen**: NAV föll 6,0 procent under halvåret medan den noterade portföljen föll 8,8 procent. Varför? Den noterade portföljen är ${S.notVarde} av substansens drygt 123 miljarder — knappt sextio procent. Minus 8,8 multiplicerat med 0,60 är minus 5,3; resten av NAV-fallet kommer utöver det från den onoterade sidan (som rör sig långsammare och värderas vid värderingsdagen, inte dagligen), realisationer och belåningsförändringar. Substansen är alltså en dämpad version av börsen — investmentbolagets riskprofil i en enda multiplikation.

## Tre sätt att öva på utfallet — övningar i metod

Så här kan en rapportläsare tänka kring tre övningsrum. Ingen av dem är en bedömning av vad som kommer att hända — de är träning i relationer.

**Övning A — premiematematiken.** Kursen ${S.prisFmt} mot senaste publicerade NAV ${S.navAUG} (18 augusti) är en premie på 2,8 procent. Räkna båda vägarna till noll-premie: kursen faller 2,8 procent, eller substansen stiger 2,9 procent (204 gånger 1,029 är strax över 209). Substanssteg och kursfall möts alltså inte mitt emellan — vid låg premie gör ett procentsteg i NAV hela jobbet, medan samma procentsteg i kurs förskjuter premien exakt en procent (täljarskalningen: kursen är täljaren i kurs/NAV). Träna sedan känsligheten baklänges: hur stor kursfall krävs för att rabatten från mars ska återkomma, om substansen samtidigt stiger ett steg? Svaret är summan av premien och substanssteget — två rörliga delar, en övning i att hålla isär dem.

**Övning B — värderingsdagen och det åldrande talet.** NAV ${S.navAUG} är mätt 18 augusti; rapportens november-tal mäter slutet av september (fjolårets Q3-mätning togs per 3 november 2025 — själva rapportsdagen; värderingsdagen följs alltså per rapport). Övningen: interpolera inte — räkna med vikter istället. Om SIXRX rör sig tio procent under ett kvartal och den noterade portföljen väger knappt sextio procent av substansen, fångar substansen grovt sex procent (dämpningen från koncernkapitlet som osäkerhetsmarginal; den onoterade sidan och valutor gör utfallet i individuella fall annat). De noterade innehaven rapporterar själva under oktober — ASSA ABLOY, Latours tyngsta, är seriens ASSA-paket redan på spåret — och deras kurser vid värderingsdagen är indata som står på bordet före tredje november. En mellanhavanderapport innehåller inga konsensusestimat att "slå"; övningsfrågorna är relationer: kurs mot substans, premie mot historia, vikt mot avkastning.

**Övning C — utdelnings- och realisationsekvationen.** Styrelsen höjde utdelningen till ${S.utd26} kronor för 2026 (från ${S.utd25} föregående år, en höjning med 10,9 procent), utbetald i maj. På det substansimplicita aktieantalet (571,9 miljoner aktier, deklarerad härledning) är årsutdelningen ${S.utdMkr} miljoner kronor — direktavkastning 2,4 procent på septemberkursen, 2,5 procent på sommarens NAV. Nu ekvationen: de väntade portföljutdelningarna är 1,8 miljarder — de täcker 62 procent av utdelningen. Resterande del kommer från realisationer eller balansräkning, och maj månads ASSA-försäljning på 2,5 miljarder motsvarar i sig 86 procent av helårets utdelning. Räkna vidare: utdelningen som andel av substansen är 5,10 delat i 216 — 2,4 procent; substansen betalar alltså sin egen "ränta" genom att minska motsvarande vid utdelningstillfället. Ingen riktning, ingen signal — mekanikträning i hur ett investmentbolag finansierar sin utdelning.

## Praktiskt inför tisdagen 3 november

- Rapporten publiceras kl ${S.tidpunkt} på bolagets webbplats och via Cision; telefonkonferens anordnas sedvanligt samma förmiddag — exakt tidtabell finns i pressrummet. Årets rytm: Q1 den ${S.q1datum}, delårsrapporten den ${S.h1datum}.
- Förvänta dig NAV per aktie, portföljkommentar och rörelser i de konsoliderade bolagen; fullständiga finansiella rapportdelar kommer med årsbokslutet den 9 februari 2027. Nästa kalendersteg efter Q3 är alltså årsbokslutet — Q1 2027 kommer först den 29 april.
- Tvillingläsningar i kalendern: Investor AB:s Capital Markets Update den 4 november — dagen efter Latours rapport — och ASSA ABLOY:s rapport i oktober (seriens ASSA-paket täcker den): Latours tyngsta noterade innehav är indata i Latour-NAV:et, och att lägga läsningen till att först läsa innehavens rapporter är själva övningen i hur en substanssiffra byggs underifrån.
- Två oberoende kurstal att bära med sig: universumets ${S.prisFmt} (3 september) och latour.se:s egen ruta 209,80 (21 september) — inom 0,2 procent om varandra; vilket NAV-tal de möter (30 juni-talet ${S.navH26} eller 18 augusti-talet ${S.navAUG}) avgör om premiändringen läses som 3,2 eller 2,8 procent.
- En ärlighetsnotis i seriens anda: kurs- och värderingsfälten är enkelkällade (MarketStack saknade färsk kurs vid insamlingen), insiderköp noll, prognostillväxt osatt — paketet gissar aldrig där fältet är tomt; NAV per 18 augusti var senaste publicerade tal när detta skrevs. Fler nyckeltal och [universumjämförelsen](/dataset/finans/universumjamforelse) finns på [Latours bolagssida](/bolag/lato-b-st) — med investmentbolagsvarningen påmind: [medianerna](/dataset/finans/pe) är byggda för drifande bolag. Ordlista och metodens regler finns i [kurserna](/kurser) och på [transparenssidan](/transparens).

## Källor

- Rappdag och kalender: latour.se finansiella kalender ("2026-11-03 08:00 Interim report for the period January - September 2026"; årsbokslut 2027-02-09, Q1 2027-04-29; hämtad 2026-09-22) samt årsbokslut 2025 (publicerat 2026-02-11): "The interim report for January – September 2026 will be published on 3 November 2026". Tredjepartsinstämmande: Simply Wall St (3 nov 2026).
- NAV-sviten: årsbokslut 2025 (NAV 216 kr mot 215; substans ${S.substans2025} mot ${S.substans2024} Mkr; +2,4 % utdelningsjusterat; NAV 218 kr per 2026-02-10; nettoskuld ${S.netdt0} Mkr; utdelning ${S.utd26} kr med utbetalning 2026-05-19; SIXRX +12,7 %, aktien −16,9 %); Q1 2026 (2026-04-29: NAV 203 mot 216, noterad portfölj −9,0 % mot SIXRX −1,2 %, aktien −10,8 %, nettoomsättning 6 735 (6 884) Mkr, resultat efter finansiella poster 567 (946) Mkr, nettoskuld 15,3 mdr, organiskt orderintag +5 % och organisk omsättning +4 % med valuta −6 %); H1 2026 (2026-08-19: NAV 203, kurs 193 = fem procents rabatt, portfölj −8,8 %, nettoomsättning 13 961 (13 980) Mkr, resultat efter finansiella poster 4 424 (2 544) Mkr, nettoskuld 13 929 (18 521) Mkr, exkl. IFRS 16 12 281 Mkr, noterad portfölj 74 mdr kr); NAV 204 kr per 2026-08-18 (latour.se NAV-sida); Q3 2025 (2025-11-04: NAV 210 kr mätt per 2025-11-03, nettoomsättning jan–sep 20 730 (18 871) Mkr, resultat efter finansiella poster 3 766 Mkr).
- Kurscykel: oktober 2025 slutkurs 234,20 (premiecitat); mars 2026 rabatt första gången på åtta år (EFN/MarketScreener); 2026-09-18 kurs 206,00 och YTD −5,6 % (Dagens industri-citerat); 2026-09-20 209,70 (Stockopedia); 2026-09-21 209,80 kl 17:29 (latour.se:s egen kursruta); börsvärde 131 807 Mkr (Avanza) och cirka 134 mdr (latour.se).
- Portfölj: latour.se investment portfolio (tio noterade bolag med aktieantal, hämtad 2026-09-22; ASSA 97 828 305, Fagerhult 84 708 480, HMS 13 014 532, TOMRA 62 420 000, CTEK 24 706 950, Securitas A 19,9 M + B 42,6 M); Fitch Ratings september 2026 (A/stabilt, LTV 14 %, ASSA-försäljning 7,6 M B-aktier för 2,5 mdr kr i maj, portföljutdelningar 1,8 mdr kr 2026 = +10 %, övervägd partiell Securitas B-avyttring); LaminAir-förvärv 2026-06-23 (latour.se pressrum).
- Nyckeltal, kurs ${S.prisFmt} och värderingsfält: bolagsuniversumets datainsamling 2026-09-03 (Yahoo Finance quoteSummary-moduler; MarketStack saknade färsk kurs — enkelkällat, redovisas öppet) — internt: data/portfolj-system/bolagsunivers.json, 256 poster, md5 6e540c8753d28f8b905a2aab9f15b29d.
- Finansgrenens medianer och rang (P/E ${S.mpe}, P/B ${S.mpb}, EV/EBIT ${S.mev} vid n 20, ROE ${S.mroe} procent, PEG ${S.mpeg} vid n 34; Latour P/E-rang ${S.rPe}, P/B-rang ${S.rPb}, ROE-rang ${S.rRoe}; grenen ${S.grenN} bolag): omräknade live 2026-09-22 ur samma 256-postfil.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar och officiella källor med datum angivna; härledda tal är deklarerade som sådana, och där källa saknar data står det explicit. Inga köp-, sälj- eller hållningsrekommendationer förekommer.*
`.trim();

// NBSP-sanering (MTG-läxan) + skräpteckenrensning
let ren = body.replace(/\u00A0/g, " ").replace(/个体vis/g, "i individuella fall ").replace(/ +/g, " ").replace(/ ([,.;:])/g, "$1");
ren = ren.replace(/\n {2,}/g, "\n"); // skydd: tabellindrag ska vara exakt — återsätt markdown-tabellrader
ren = ren.replace(/"([^"]+)"/g, "”$1”"); // raka citattecken → svenska gångjärn (MTG-läxan)
ren = ren.replace(/^(\|.*)$/gm, (m) => m.replace(/\|  +/g, "| ").replace(/  +\|/g, " |"));

const paket = {
  slug: "sa-laser-du-latour-q3-2026",
  title: "Latours Q3-rapport 3 november 2026: så läser du den — läspaket med NAV-trappan 216 → 203 → 204 kronor, åttaårspremiens väg genom rabatten och tillbaka, och balansräkningens tre världar (43 bokförda, 124 i substans, 134 på börsen — miljarder)",
  description: "Investment AB Latour redovisar mellanhavanderapporten januari–september 2026 tisdagen 3 november kl 08:00. Läspaketet lär ut NAV-trappan, premieläsningen, IFRS-nämnarens fälla och belåningsgrammatiken, med källa per tal. Utbildning, aldrig råd.",
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: T.kalender.rappdag,
  readingMinutes: Math.max(3, Math.round(ren.split(/\s+/).length / 600)),
  tags: ["kvartalsrapport", "Latour", "finans", "Sverige", "investmentbolag", "läspaket"],
  body: ren,
};

// Sista raden måste vara disclaimern (KVD-krav) — verifiera före skriv
const rader = ren.split("\n");
const sista = rader[rader.length - 1].trim();
if (!sista.startsWith("*Detta är pedagogisk finansutbildning") || !sista.includes("2007:528")) {
  console.error("ABORT — disclaimer är inte sista raden:", sista.slice(0, 80));
  process.exit(1);
}

const ut = "data/blogg-utkast/kvartal/2026-q3/sa-laser-du-latour-q3-2026.json";
writeFileSync(ut, JSON.stringify(paket, null, 1) + "\n");
console.log("SKREV", ut, "| ord:", ren.split(/\s+/).length, "| rm:", paket.readingMinutes, "| H2:", (ren.match(/^## /gm) || []).length);
