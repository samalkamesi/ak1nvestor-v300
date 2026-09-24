# F10 — Intermarket Analysis (Murphy): marknaderna som ett nätverk

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `intermarket-analysis` · Fas 3 — helhetsläsningens nätkurs

## 1. Kärnan — fyra tillgångsvärldar och rotationskedjan

Murphys intermarketläsning vidgar fönstret från en marknad till alla.
Ingen marknad rör sig i vakuum: **obligationer, aktier, råvaror och
valutor** är fyra grenar av samma träd, och den som läser en gren i
isolering läser fel kapitel.

Kärnan är en riktningsexpedition genom kedjan: en **stark dollar** pressar
råvarorna (de prissätts i USD), fallande råvaror dämpar inflationsförvänt-
ningarna, lägre inflation gynnar obligationerna, och stark obligationsmarknad
har historiskt varit en god miljö för aktier. Länkad åt andra hållet —
fallande dollar, stigande råvaror, stigande räntor — vänder läsningen mot
energi- och materialtunga grenar framför låntagningsskänkliga tillväxtaktier.
Så uppstår **rotationskedjan**: pengarna lämnar inte marknaden, de flyttar
mellan dess grenar — tidigt i cykeln till finans och konsument, senare till
råvaror och energi, i slutet till försvarslinjer som stabil utdelning.

Klassiska par kursen memorerar: guld och dollar (ofta motsatta håll),
råvaror och obligationer (motsatta), olja och aktiemarknadens energigren
(samma håll), räntor och fastigheter (motsatta). Intermarketanalys är alltså
inte en ny indikator utan en fråga: *vad gör de andra marknaderna just nu?*

## 2. Praktisk läsning — korrelationspar att följa

Arbetet är att hålla ett fåtal par under uppsikt och läsa dem som ett
korsförhör, inte var för sig:

- **Kronan och exportbolagen.** Svenska exportörer (i vårt universum:
  Ericsson, SKF, Autoliv) rapporterar i andra valutor. En svagare krona
  syns i översatta intäkter; en starkare krona pressar dem. Frågan vid
  varje bolagsläsning: hjälpte eller skadade valutan det jag ser i
  resultatraden?
- **Räntan och de räntekänsliga grenarna.** Statsräntan prövas mot
  fastigheter, finans och utdelningsstarka bolag — de vars värdering
  väger framtida kassaflöden hårdast.
- **Oljan och energi- respektive materialgrenen.** Energi är både en
  egen bransch och en insatsfaktor i andras kostnadslister (se exemplet
  nedan).
- **Verktyget: ratio-grafen.** Murphy lär teknikern dividera — bransch
  delat med index, bolag delat med bransch — så syns relativ styrka utan
  att absoluta kursnivåer stör. Kontrasten mellan graferna är budskapet.

## 3. Räkneexempel — 2022→2023: oljan och skogen föll tillsammans

Ur plattformens dataset (`data/portfolj-system/bolagsunivers.json`, källa
Yahoo Finance, hämtat 2026-09-03; årsresultat i miljarder lokal valuta):

| Bolag (gren) | Resultat 2022 | Resultat 2023 | Förändring |
|---|---|---|---|
| Equinor (energi, NOK) | 28,7 | 11,9 | **−59 %** |
| Shell (energi, USD) | 42,3 | 19,4 | **−54 %** |
| SCA (material/skog, SEK) | 6,8 | 3,6 | **−47 %** |
| Holmen (material/skog, SEK) | 5,9 | 3,7 | **−37 %** |
| Billerud (material/skog, SEK) | 4,6 | 0,5 | **−89 %** |

Genomräkningen: **10 av 10 bolag** i datasetets olje-/energigren och
skogsgren hade lägre resultat 2023 än 2022. Gruppsnitten: energi
**−51 %**, skog **−74 %** (Stora Enso och UPM föll likaså; Vår Energi
och DNO med). 2022 var energiutgångens extraår — höga energipriser gav
oljebolagen rekordmarginaler *och* skogsindustrin rekordhöga massa- och
papperspriser; när energin normaliserades 2023 svek underlaget för båda
grenarna samtidigt. Det är intermarknadssignaturen: en gemensam faktor —
energipriset — rör två branschgrenar som formellt sett inget har med
varandra att göra. Exemplet visar hur metoden läser samspelet; det säger
inget om vad någon bör göra (2007:528).

## 4. Fallgropar

- **Korrelation är inte orsak.** Att två serier svänger tillsammans
  bevisar ingen mekanism — båda kan ridas av en tredje faktor (som
  energipriset ovan). Fråga alltid *varför* sambandet finns, och räkna
  med att svaret kan saknas.
- **Samband som bryter.** Murphys eget varnande: obligations- och
  aktiemarknadernas positiva samvariation under 1980–90-talen bröts kring
  sekelskiftet och har vandrat sedan dess. Ett pars historia är ingen
  garanti — varje generation får sina egna brytningar.
- **Valuta och enheter i serierna.** Exemplet ovan blandar NOK, USD, SEK
  och EUR. Procentförändringen *inom* ett bolag är valutaneutral, men
  gruppjämförelser över valutor — där valutan själv påverkar resultaten —
  kan dubbelräkna valutaeffekten. Märk enheten varje gång.
- **Korta fönster.** Tio bolag över ett årssteg är en observation av ett
  gemensamt chockår, inte en lag. Korrelation läses över långa fönster
  och helst flera perioder — annars är det anekdot med decimaler.

## 5. Koppling till ekosystemet

Datasetets tio branschgrenar är kursens intermarknadsytor: energi och
material är råvaruytorna (exemplet i §3), finans och fastighet
ränteytorna, industri och teknik export- och konjunkturytorna där kronan
spelar huvudroll, konsument och hälsa efterfrågeytorna, tillväxtgrenen
räntekänslighetens yttersta spets. Det är samma trappa som F06:s top-down
läsning — index, bransch, bolag — nu med valutor och räntor tillagda som
fjärde och femte vittne, och samma serier som F02 gjorde till tidsserier.
I nyckeltalsguiden och på datasetsidorna syns branschmedianerna som
kursens övningsgolv, och i AKM2-analyserna loggas branschläget som ett
av flera vittnen. AI-Mentorn kan slutligen låta eleven förklara *varför*
två grenar rörde sig tillsammans — och examinera om svaret var en mekanism
eller bara en samröre. Kursen övar plattformens grundtema: att läsa många
bilder som en.

*Utbildningsmaterial — beskriver hur metoden läser, väger och räknar; inga
investeringsråd, inga avkastningslöften (2007:528).*
