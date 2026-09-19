#!/usr/bin/env node
// Byggskript s4-u1 — COLOPLAST Q3-LÄSPAKET (kvartalsrapportserien, halso-grenen)
// Källor: data/portfolj-system/bolagsunivers.json (COLO-B.ST→COLO-B.CO-post 2026-09-03),
// kalender-halso.json 2026-09-15, sökverifierade rapportdata 2026-09-19.
// Klaim: auto-s4-1789789095700-u1-ansprak.md (2026-09-19 03:38:15Z, FÖRE byggstart).
import fs from "node:fs";

const slug = "sa-laser-du-coloplast-q3-2026";
const title =
  "Coloplasts rapport 3 november: så läser du den — hälsogrenens sjunde paket och seriens första helårsrapport under kvartalssäsongen: brutet räkenskapsår oktober–september förvandlar kalenderkvartal tre till räkenskapsårets sista, CAGR-saxen gapar 15,5 procentenheter (intäkter plus 7,27 mot resultat minus 8,24 procent), nettomarginaltrappan faller fyra år i rad 20,8 → 13,0 procent, och Datavaktens fem test: identitetsgapet 10,2 procent, EV-kedjans skuldberg 21,6 miljarder, nämnarfönstret 24 procent, PEG-rakbladet 1,2 mot konventionens 7,8 — och FCF-paret som stänger på 1,9 procent";
const description =
  "Coloplasts höstrapport 3 november är en helårsrapport — brutet räkenskapsår. Läspaketet ger nyckeltal, scenarioruta och källkritik: utbildning, aldrig råd.";

const body = `Coloplast — ticker COLO B på Nasdaq Copenhagen — publicerar sin höstrapport tisdagen den **3 november 2026**, och till skillnad från alla andra paket i den här serien är det ingen delårsrapport: räkenskapsåret oktober–september gör kalenderkvartalet juli–september till räkenskapsårets fjärde och sista, och rapporten som läggs fram är **helårsrapporten 2025/26**. Datumet är officiellt i bolagets egen events-kalender — och den bär en historia i sig, för den är flyttad: kalendern angav först den 5 november innan den justerades till den 3:e. Det här är ett utbildningspaket i AK1A:s kvartalsrapportserie — seriens 52:a på disk vid skrivningen, hälsogrenens sjunde — och allt här är utbildning i metod: inte en rekommendation att köpa, sälja eller behålla några värdepapper.

## Urvalet: varför Coloplast är nästa paket i serien

Kvartalsrapportserien ger varje rapporterande bolag i universumet ett läspaket inför Q3 2026 — urval, nyckeltal, källkritik och övningar, allt byggt på den egna datainsamlingen. Urvalet följer seriens princip: tidigaste officiellt bekräftade rappdagen bland återstående kalenderbolag med bärande data. Med 51 paket på disk gallrades fältet enligt etablerade precedenser: Equinor diskat (källbilden — fyra dokumenterade avvikelser över 15 procent i universumposten; omprövningsobjektet kräver ny insamling innan paket, enligt granskningsköns notis), Kambi diskat (reserverat åt syskon i omgången enligt köns reservationstabell), Elekta diskat (P/E-fältet null och negativt resultatår — Boliden-precedensen — dessutom rappdag först 25 november), Eli Lilly diskat (rapportdag utan bolagets egen utlysning — Wihlborgs-precedensen). Kvar stod Coloplast som novemberfönstrets första återstående rappdag med bärande data: den 3 november, utlyst i bolagets egen kalender, med datumflytten 5 → 3 november dokumenterad av kalenderkällorna. Och dataunderlaget bär på alla kontrollfält som seriens Datavakten kräver: båda CAGR-fälten är satta, PEG, prognos och prisruta finns, och resultattalangen håller fyra raka positiva år — JNJ-precedensens datamotivering. En extra styrka bjöds dessutom gratis: universumfilens serieår 2025 visar sig vara identisk med räkenskapsåret 2024/25 — intäkterna 27 874 miljoner danska kronor stämmer på kronan med helårsrapportens publicerade summa, vilket bevisar att filens kalenderårsserie för det här bolaget speglar räkenskapsåren. Seriens andra Danmarksbolag efter Carlsberg-paketet: danska kronor hela vägen, Köpenhamn-börsens morgonrytm.

## Nyckeltalen att ha med sig — AKM2:s fyra dimensioner, helårsutgåvan

Värdena nedan är senaste mätta tal ur bolagsuniversumets datainsamling (2026-09-03), med länkar till aspektsidor som lär ut hur talet räknas och tolkas.

**Lönsamhet** — hur mycket värde skapas per insatt krona?

- Avkastning på eget kapital (ROE): **18,53 procent** — [så räknas ROE](/dataset/halso/roe). Över hälsogrenens median 15,41 och universumets 15,34 procent — men läs talet mot balansräkningen: med en skuldkvot på 1,78 är det tunna eget kapitalet som lyfter kvoten, och samma mekanik som belönar goda år förvärrar dåliga. Rang 9 av 21 mätta i grenen.
- Avkastning på investerat kapital (ROIC): **20,66 procent** — [om ROIC](/dataset/halso/roic). Fältets approximation (rörelseresultat före skatt delat med skuld plus bokfört eget kapital) rankar bolaget 6 av 21 — kapitalet arbetar tämligen oavsett hur det är finansierat.
- Bruttomarginal: **67,23 procent** — [bruttomarginalen förklaras](/dataset/halso/brutto-marginal). Detta är kärntalet i moat-läsningen: nästan 68 öre av varje krona lämnar produktionsledet kvar som brutowinst. Under hälsogrenens median 71,03 (läkemedelsjättarnas patentmarginaler drar upp medianen — Getinge-paketets måttstocksdiskussion) men vida över universumets 47,76 procent.
- Rörelsemarginal (EBIT): **26,23 procent** — [EBIT-marginalen](/dataset/halso/ev-ebit). Fyrtio procentenheter under brutton: kostnadsledet äter 41,0 procentenheter — distribution, forskning och säljkår är den verkliga prislappen på varan.
- Nettomarginal: **9,72 procent** — [nettomarginalen](/dataset/halso/netto-marginal). Under grenens median 12,97 — och fältets tal är bara den senaste punkten i en trappa som fallit fyra år i rad (se Datavaktens tredje test).
- Fri kassaflödesmarginal: **16,41 procent** — [FCF-marginalen](/dataset/halso/fcf-avkastning). Över grenens median 14,37 — vinsten är inte bara bokförd, den är också inkasserad.

**Tillväxt** — vilket håll går rörelsen?

- Intäkter senaste fyra åren, miljoner danska kronor: **22 579 → 24 500 → 27 030 → 27 874** — steg plus 8,51, plus 10,33 och plus 3,12 procent. [Om intäktstillväxt](/dataset/halso/omsattning-cagr-5ar)
- Intäkts-CAGR: **plus 7,27 procent** — i praktiken på hälsogrenens median 7,30 (avståndet tre hundradelar; CellaVision-mönstret "medianen själv" i tillväxtformat).
- Resultat senaste fyra åren: **4 706 → 4 783 → 5 052 → 3 636 miljoner** — steg plus 1,64, plus 5,62 och **minus 28,03 procent**. Resultat-CAGR: **minus 8,24 procent** — rang 16 av 20 mätta, medan intäkts-CAGR:t rankas mitt i grenen. [Om resultat-CAGR](/dataset/halso/resultat-cagr-5ar)
- TTM-tillväxt (tolvmånadersfältet): **plus 5,70 procent** — [så läses TTM-tillväxten](/dataset/halso/omsattningstillvaxt-ttm). Medan helårsrapporten 2024/25 redovisade plus 3 procent i danska kronor och plus 7 procent organiskt, och niomånadersperioden 2025/26 (publicerad i augusti 2026) redovisade 6 procent organisk tillväxt i såväl kvartal som nio månader — valuta gapar mellan organisk och rapporterad tillväxt, och det är en av rapportens huvudläsarter.
- Prognostillväxt (konsensusfältet): **plus 4,94 procent** — [om prognostillväxt](/dataset/halso/prognos-tillvaxt). Grenens tredje lägsta mätta tal (3 av 22 — endast Novo Nordisk och Boston Scientific lägre) — och märk ordningen: konsensusfältet ligger under bolagets egen guidning på omkring 7 procent organisk tillväxt. Marknadens vinstförväntningar och bolagets intäktsförväntningar lever inte i samma fönster.

**Värdering** — vad kostar rörelsen på börsen?

- Pris per vinst (P/E): **38,65** — [P/E som begrepp](/dataset/halso/pe). Femte högsta av 21 mätta i grenen, mot median 26,08 och universumets 21,15. Men notera redan här: fältets nämnare är inte serieårets bokförda resultat (Datavaktens tredje test).
- Pris per bokfört eget kapital (P/B): **7,976** — [så räknas P/B](/dataset/halso/pb). Tredje högsta av 21 mätta, 2,20 gånger grenens median 3,620 — börsen betalar åtta kronor per bokförd kapitalkrona.
- EV/EBIT: **17,543** — [EV/EBIT](/dataset/halso/ev-ebit). Mitt i grenen: rang 12 av 22 mot medianen 17,86. Paketets största spänning bor här — samma bolag är bland de dyraste på kapital och exakt median på rörelse. Övning C reder ut varför.
- PEG: källan anger **1,2** — [PEG-talet](/dataset/halso/peg). Med konventionen P/E delat med prognostillväxten i procent blir svaret 7,82 — källans rakblad ligger djupt under konventionens (Datavaktens fjärde test).
- Vid insamlingen var kursen **473,50 danska kronor** och börsvärdet **106,712 miljarder**. Det implicita eget kapitalet — börsvärdet delat med P/B — blir 13 379 miljoner, eller 59,37 kronor per aktie på fältvägens 225,4 miljoner aktier; kontrollenkursen delat med kapitalet per aktie stänger tillbaka på 7,976 exakt.
- Fri kassaflödesavkastning: **4,37 procent** — [FCF-avkastningen](/dataset/halso/fcf-avkastning). PÅ grenens median 4,31 — och P/FCF blir 22,88 mot P/E 38,65: kassaflödet prisas mer än en tredjedel under vinsten.

**Stabilitet och ägaraktivitet** — hur belånat är huset, och vem köper?

- Skuld per eget kapital: **1,7807** — [skuldsättningsgraden](/dataset/halso/skuldsattning). Grenens näst högsta av 21 mätta (median 0,6422, universumet 0,52). Förvärvshistoriken bor i balansräkningen — och EV-kedjans test visar vad den väger i kronor.
- Insiderköp senaste sex månader: **0** observationer hos källan. Utdelningsbeslut tillhör helårsrapporten — danska bolag beslutar utdelning på årsstämman, och det är en av skillnaderna mot seriens kvartalsrytmbolag.

## Datavakten — fem prov på ett bolag med helårsbokföring

Paketets bärande övning, med samma verktygslåda som i seriens 51 tidigare paket: pröva källans tal mot identiteter och konventioner innan de används.

**Test 1 — identitetstestet: gapet på 10,2 procent.** Konventionen säger att P/E gånger ROE ska återge P/B (vinstmultiplen gånger avkastningen på kapitalet är kapitalmultiplen). Här: 38,65 gånger 0,1853 ger 7,16 mot P/B-fältets 7,976 — läst baklänges ger P/B delat med ROE en implicit vinstmultipel på 43,04, tio procent över fältets eget P/E. Gapet är inte ett räknefel utan tre olika fönster på samma bolag: tre vägar till "senaste vinsten" ger 2 761 miljoner (P/E-fältets nämnare), 2 479 (ROE gånger implicit kapital) och 2 709 (nettomarginalen gånger årets intäkter) — tre tal i samma storleksordning men ingetdera är serieårets bokförda 3 636. Notera också källans interna spegel: fältet egen kapitalmultipl är 7,976 — exakt P/B. Identiteten lever, men fönstren dansar.

**Test 2 — EV-kedjan: skuldberget på 21,6 miljarder.** Fem steg: rörelseresultatet 0,2623 gånger 27 874 ger EBIT 7 311 miljoner; gånger EV/EBIT 17,543 ger företagsvärdet 128 263; minus börsvärdet 106 712 ger implicit nettoskuld 21 551 miljoner — 95,63 kronor per aktie, och per-aktie-kontrollen stänger (EV per aktie 569,13 minus kurs 473,50). Skuldkvotens egen väg: 1,7807 gånger det implicita kapitalet 13 379 ger bruttoskuld 23 824 miljoner — och residualen mot nettoskulden är en kassa på omkring 2 273 miljoner. Läsningen: kassan är blygsam, skuldberget är grenens näst högsta, och hela klyvningen mellan P/B 7,976 och EV/EBIT 17,543 bor här — Getinge-paketets nettoläsning i större skala.

**Test 3 — nämnarfönstret: P/E:t bygger på en vinst 24 procent under böckerna.** P/E-fältets implicita vinst är 106 712 delat med 38,65 — 2 761 miljoner, eller 12,25 kronor per aktie. Serieårets bokförda resultat är 3 636 miljoner, alltså 16,13 per aktie — gapet minus 24,1 procent. TTM-fältet ger konsistens: intäkterna plus 5,70 procent rullat på serieåret ger 29 463 miljoner, och nettomarginalfältet läst på den basen ger 2 864 miljoner — inom 3,7 procent av P/E-nämnaren. Slutsatsen är Goldman Sachs-paketets teckenväxlare i Coloplast-dräkt: fält-P/E:t är räknat på ett rullande tolvmånadersfönster som fångar marginalfallet, medan kalenderårets bokförda vinst är ett annat fönster. Läsaren som jämför "P/E 38" med helårsrapportens redovisade vinst per aktie möter två olika nämnare — och ska veta det i förväg. Medan nettomarginaltrappan ändå står där: 20,84 → 19,52 → 18,69 → 13,04 procent, fyra fallande år på monotont stigande intäkter — 2025 års kombination plus 3,12 procent volym och minus 28,03 procent resultat är marginalsvångets renaste årsprov i serien sedan Getinge. CAGR-saxen summerar: intäkter plus 7,27 mot resultat minus 8,24 — 15,51 procentenheters gap mellan tillväxtens två berättelser. Marginalvikten landar på 2,56 — en procentenhet netto väger 278,7 miljoner mot tre procent volym på 109,1 miljoner, i aritmetikens egen våg.

**Test 4 — PEG-rakbladet: 1,2 mot konventionens 7,82.** Konventionen P/E delat med prognostillväxt i procent ger 38,65 delat med 4,94 — 7,82. Källans fält säger 1,2. Räknat baklänges implicerar PEG 1,2 antingen en tillväxt på 32,2 procent vid P/E 38,65 (inget tillväxtfält i närheten: prognos 4,94, TTM 5,70, resultat-CAGR minus 8,24) eller ett P/E på 5,93 vid tillväxten 4,94 — sex och en halv gånger under fältets eget vinstmått. Efter GS-paketets sex fall och Getinges tredje nedåt-fall på raken är mönstret etablerat: PEG-fältet räknas på en tillväxtdefinition källan inte redovisar. Talet redovisas här som räknestorhet — inte som skattning.

**Test 5 — FCF-paret som stänger: 1,9 procent.** Fri kassaflödesavkastning 4,37 procent av börsvärdet ger 4 663 miljoner; FCF-marginalen 16,41 procent gånger serieårets intäkter ger 4 574 miljoner — gapet 1,91 procent, på TTM-basen 4 835. Efter Kinnevik-paketets inre motsägelse är detta spegelvägen: två oberoende fält som återger samma kassaflöde inom två procent. Paret bär paketets stabilaste tal — och P/FCF 22,88 mot P/E 38,65 är fältens eget vittnesmål om att vinsten har större multipel än flödet.

## Så står sig bolaget mot branschen

Hälsogrenen i universumfilen mäter 22 bolag — läkemedelsjättar, utrustningsbolag och specialiserad vård på båda sidor Atlanten. Medianerna nedan är omräknade 2026-09-19 ur filens aktuella poster, kolumnvis där tal finns.

| Nyckeltal | Coloplast | Median hälsa (22 bolag) | Median universumet | Rang i grenen |
|---|---|---|---|---|
| P/E | 38,65 | 26,08 | 21,15 | 5 högst av 21 mätta |
| P/B | 7,976 | 3,620 | 2,806 | 3 högst av 21 mätta |
| EV/EBIT | 17,54 | 17,86 | 18,26 | 12 av 22 — på medianen |
| PEG (källans fält) | 1,2 | 0,79 | 1,375 | 6 högst av 21 mätta |
| FCF-avkastning | 4,37 % | 4,31 % | 3,94 % | 12 av 21 — på medianen |
| Räntabilitet (ROE) | 18,53 % | 15,41 % | 15,34 % | 9 av 21 mätta |
| Bruttomarginal | 67,23 % | 71,03 % | 47,76 % | 16 av 22 mätta |
| Nettomarginal | 9,72 % | 12,97 % | 13,05 % | 14 av 22 mätta |
| Intäkts-CAGR | +7,27 % | +7,30 % | — | 12 av 22 — på medianen |
| Resultat-CAGR | −8,24 % | +4,54 % | — | 16 av 20 mätta |
| Prognostillväxt | +4,94 % | +24,22 % | +13,60 % | 3 lägst av 22 |
| Skuld/EK | 1,78 | 0,64 | 0,52 | näst högst av 21 mätta |

Läsningen — tre mått på medianen och två ytterligheter: på rörelsen (EV/EBIT), kassaflödet (FCF-avkastning) och tillväxten (intäkts-CAGR) är Coloplast bokstavligen hälsogrenens mittpost. Samma bolag står samtidigt som grenens tredje dyraste på kapital (P/B), näst högst belåtade och med tredje lägsta konsensustillväxt. Där ligger seriens pedagogiska spänning: multipelklyvningen mellan kapitalpris och rörelsepris är skulden, marginaltrappan är kostnadsledet, och båda övningarna återkommer nedan. Jämförelsen mot samtliga kollegor finns i [universumjämförelsen](/dataset/halso/universumjamforelse), grenens danska bolag samlas under [Danmark-vyn](/dataset/halso/danmark), hela datasetet i [översikten](/dataset/halso) och [indexet](/dataset), och bolagets sida i biblioteket finns [här](/bolag/colo-b-co).

## Tre sätt att läsa utfallet — övningar i metod

Tre övningar i vad en rapportläsare vanligtvis tittar på när ett bolag med brutet räkenskapsår lägger fram helåret — träning i metod och ren aritmetik, aldrig bedömningar av den 3 november.

**Övning A — det brutna årets kalenderövning: guidningsaritmetik.** Först översättningen: kalenderkvartal tre (jul–sep) är räkenskapsårets fjärde kvartal, och helårsrapporten som läggs fram den 3 november avslutar 2025/26. Sedan aritmetiken på bolagets egna publicerade tal: nio månader har växt 6 procent organiskt, helårsguidningen ligger på omkring 7 procent — och nio månader bär tre fjärdedelar av året. Konsekvensräkningen: 0,75 gånger 6 plus 0,25 gånger x lika med 7 ger x lika med 10 — det fjärde kvartalet ligger aritmetiskt på omkring 10 procents organisk tillväxt för att guidningen ska slås in. Det är ingen bedömning av hur det går — det är vad redan publicerade tal implicerar, och övningen finns i flera av seriens paket som påminnelse om att guidningar är aritmetik bakåt och beslut framåt. Notera också vad rapporten INTE är: en Q3-rapport i kalendermening — den som jämför med svensk kvartalsrapportering jämför halvår mot helår.

**Övning B — scenariorutan i ren aritmetik: kurs är multipel gånger vinst.** Med fält-P/E:t 38,65 och den implicita vinsten per aktie 12,25 kronor (Datavaktens tredje test) blir rutan, i danska kronor:

| Kurs, kronor | P/E 30 | P/E 38,65 | P/E 47 |
|---|---|---|---|
| Vinst/aktie 11,03 | 330,75 | 426,15 | 518,18 |
| Vinst/aktie 12,25 | 367,50 | **473,50** | 575,75 |
| Vinst/aktie 13,48 | 404,25 | 520,85 | 633,33 |

Mittcellen stänger på insamlingskursen 473,50 exakt — rutan är kalibrerad. Två räknesatser: tio procent vinst per aktie flyttar kursen 47,35 kronor vid oförändrad multipel, medan tio multipelenheter flyttar den 122,50 kronor vid oförändrad vinst — multipeln väger 2,6 gånger vinsten per typsteg i den här konfigurationen. Och grannläsningen: för att kursen 473,50 ska motsvara grenens medianmultipel 26,08 krävs en vinst per aktie på 18,16 kronor — 48,2 procent över fältets implicita nivå. Alla nio celler är aritmetik på fältens egna tal; ingen av dem är en skattning.

**Övning C — multipelklyvningen: samma bolag, två prislappar, skillnaden heter skuld.** P/B 7,976 är 2,20 gånger grenens median — EV/EBIT 17,54 är 0,98 av medianen, exakt mitt i. Ren räkneövning i vad kapitalstrukturen gör mot måtten: P/B-vägen till medianen kräver antingen att kursen faller 54,6 procent (till 214,90) eller att det bokförda kapitalet växer 120 procent (från 13 379 till 29 478 miljoner) — medan EV-vägen redan är där. DuPont-trappan förklarar resten: bruttomarginal 67,23 procent, EBIT 26,23, netto 9,72 — kostnadsledet äter 41,0 procentenheter och finans- och skatteledet ytterligare 16,5. Notera vad övningen INTE säger: vilken multipel som är "rätt" är en avvägning, och avvägningar tillhör inte detta paket. [Värderingsaspekten](/dataset/halso/vardering) sätter multiplarna i grensammanhang.

## Praktiskt inför 3 november

- Rapportdagen tisdagen den 3 november 2026 är officiell: [bolagets events-kalender](https://www.coloplast.com/investor-relations/events-calendar/) listar helårsrapporten 2025/26 — och [kalenderkällan som dokumenterar flytten](https://uk.finance.yahoo.com/news/coloplast-updated-financial-calendar-2025-143600329.html) från 5 till 3 november, båda hämtade 2026-09-15. Dansk morgonrytm enligt Carlsberg-precedensen; telefonkonferens samma förmiddag.
- En valuta hela vägen: dansk redovisning i danska kronor, dansk notering i danska kronor — rena kontroller utan valutamixning.
- Bevakningslistan för rapporten: organisk mot rapporterad tillväxt (valutaeffekten — helåret 2024/25 visade plus 7 organiskt mot plus 3 i kronor; nio månader 2025/26 visade 6 mot omkring plus 3 i kronor, ett upplagt spänn på omkring 3 procentenheter), EBIT-marginalens nivå mot förra helårets redovisade omkring 28 procent (universumfältet 26,23 mäter ett annat fönster — båda redovisas, ingen göms), kostnadsledets utveckling i marginaltrappan, och balansräkningens skuldberg med den blygsamma kassan. Ostomy Care-basen: 9 897 miljoner och plus 4 procent i kronor senaste helåret.
- Vågvalideringsnot: Coloplast står inte i seriens vågvalideringskarta — paketet vilar på universumdata, kalenderfakta och sökverifierade rapportdata enligt Iberdrola-precedensen, och säger det öppet.
- Ordlista för alla begrepp finns i [kurserna](/kurser) — företagsekonomikurserna går igenom brutet räkenskapsår och kapitalstruktur, och [bloggen](/blogg) sätter talen i sammanhang. Metodtransparensen finns på [transparensidan](/transparens) och [källsidan](/kallor).
- Efter rapporten uppdateras bolagsuniversumets nyckeltal vid nästa insamling, aspektsidorna speglar nya medianer — och novemberfönstret fortsätter: Novo Nordisk 4 november, MTG 5 november, Elekta 25 november.

## Källor

- Rappdag 2026-11-03, helårsrapport 2025/26 (brutet räkenskapsår oktober–september; datum flyttat från 2026-11-05): Coloplasts events-kalender och Yahoo Finance UK:s kalendernotis, båda hämtade 2026-09-15 — internt underlag: data/blogg-utkast/kvartal/2026-q3/kalender-halso.json. Niomånadersrapporten 2025/26 publicerades i mitten av augusti 2026 (kalenderunderlaget: 17/8; sökverifieringens sammanfattning daterar 18/8 — dagsdivergensen redovisas öppet enligt Getinge-precedensen).
- Nyckeltal, kurs och fältvärden: bolagsuniversumets datainsamling för COLO-B.CO 2026-09-03 (Yahoo Finance quoteSummary-moduler; källa B, MarketStack, saknade färsk kurs — ingen dubbelkoll, redovisas öppet) — internt: data/portfolj-system/bolagsunivers.json. Medianer och rangplatser omräknade 2026-09-19 ur samma fil (195 poster; hälsogrenen 22 bolag, 20–22 mätta per mått, universummedianerna 162–195 poster per mått, kolumnvis där tal finns).
- Sökverifierade rapportdata 2026-09-19: helårsrapporten 2024/25 (publicerad i november 2025: intäkter 27 874 miljoner danska kronor, plus 3 procent i kronor och plus 7 organiskt; EBIT-marginal redovisad omkring 28 procent; Ostomy Care 6 procent organiskt med rapporterade 9 897 miljoner, plus 4 procent), niomånadersrapporten 2025/26 (augusti 2026: 6 procent organisk tillväxt i kvartal och nio månader, EBIT-tillväxt 5 procent i fasta valutor, rapporterade intäkter plus 568 miljoner omkring plus 3 procent) och bolagets oförändrade helårsguidning 2025/26 (omkring 7 procent organisk tillväxt och omkring 7 procent EBIT-tillväxt, påpekad vid både årsskiftet och niomånadersrapporten) — via bolagets IR-sidor och finansmarknadens sammanställningar.
- Datavaktens fem test: egna beräkningar — identitetstestet (38,65 × 0,1853 = 7,16 mot 7,976; baklänges 43,04; vinstvägarna 2 761/2 479/2 709 mot bokförda 3 636), EV-kedjan (EBIT 7 311 → EV 128 263 → nettoskuld 21 551 → bruttoskuld 23 824 → kassa 2 273 miljoner; per aktie 569,13 − 473,50 = 95,63), nämnarfönstret (implicit vinst 2 761 = 12,25 per aktie mot bokförda 16,13; TTM-basen 29 463 × 9,72 procent = 2 864), PEG-rakbladet (38,65 ÷ 4,94 = 7,82 mot källans 1,2; implicita läsningarna 32,2 procent och 5,93) och FCF-paret (4 663 mot 4 574 miljoner, gap 1,91 procent) — samtliga steg redovisade i texten.
- Scenarioruta, räknesatser och multipelövningar: aritmetik på fältens egna tal (P/E 38,65, implicit vinst per aktie 12,25, grenens medianer 26,08 och 3,620); samtliga nio celler och båda räknesatserna dubbeltkontrollerade vid tillverkningen 2026-09-19.

*Detta är pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning. Alla siffror är hämtade ur AK1A:s egna datainsamlingar eller bolagets egna resultatmeddelanden med källa och datum angivna; där en källa saknar data står det explicit, och där ett källfält håller inte för kontrollräkning redovisas beräkningen i stället. Inga köp-, sälj- eller hållningsrekommendationer förekommer, och publiceringen av detta paket är kundens beslut.*`;

const ord = body.split(/\s+/).filter(Boolean).length;
const paket = {
  slug,
  title,
  description,
  pillar: "Institutionell metodik",
  author: "AK1A Research Lab",
  publishedAt: "2026-11-03",
  readingMinutes: Math.round(ord / 600),
  tags: ["kvartalsrapport", "Coloplast", "halso", "nyckeltal", "läspaket", "helårsrapport", "marginaler", "PEG"],
  body,
};

const fil = `data/blogg-utkast/kvartal/2026-q3/${slug}.json`;
fs.writeFileSync(fil, JSON.stringify(paket, null, 2) + "\n");
console.log(`SKREV ${fil}`);
console.log(`ord=${ord} readingMinutes=${paket.readingMinutes} descriptionLen=${description.length}`);
