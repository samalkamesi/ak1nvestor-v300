# Granskning: H&M-paketet Q3 2026 (sa-laser-du-hm-b-q3-2026)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik s1-u3 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-hm-b-q3-2026.json` (1 549 ord, 6 källor)
· **Diff-förslag:** `kvartal-2026-q3-hm-b-diff.json` (samma mapp — maskinverkställbara rättningar)

**BEDÖMNING: EFTER RÄTTNING** — källorna och den juridiska grunden är i
toppklass (siffrorna mot H&M:s egna rapporter stämmer på sista siffran,
juridikgrinden ren), men 3 fel (A1–A3 nedan) måste rättas innan paketet är
flyttklart: en tabellcell, ett aritmetikpåstående och ett bolagsnamn. Alla
rättningar är enkla textbyten i diff-filen — inget behöver skrivas om.

**Val-motivering:** m9-utkasten och SEO-guiderna granskades 2026-09-14 och
kvartalsseriens kalendrar + kvartalsrapporten i morse (se
SAMMANSTALLNING-2026-09-14.md och kvartal-2026-q3-kalendrar.md). Spårets
nästa olevererade objekt är de tre bolagspaketen från v152 fas 3 — detta är
det tredje av dem (rad 3 i bolagspaketstabellen i
GRANSKNINGSKO-SAMMANSTALLNING.md) och det mest tidskritiska: H&M:s rappdag
2026-09-24 är säsongens tidigaste i hela biblioteket.

## Metod

1. Mekanisk kontroll av alla siffror mot angivna källor: universumtabellen
   (16 medianceller + 8 HM-värden) mot `data/portfolj-system/bolagsunivers.json`
   (hämtat 2026-09-03) med omräknade medianer; vågdatans 12 påståenden mot
   `data/analyses/HM-B.ST.json` (verifierad 2026-08-24, signalmatrixen cellräknad);
   all intern aritmetik omräknad (marginaler, förändringstakter, scenariotabellen
   cell för cell, CAGR-konsistens).
2. Oberoende hämtning av H&M:s tre primärkällor (finansiella kalendern,
   sexmånadersrapporten 2026, niomånadersrapporten 2025) + länkstatus på
   PDF och båda rapportsidorna.
3. Juridikgrind-genomläsning (skill: juridikgrind — lagen 2007:528:
   utbildning tillåtet enligt 2 kap 5 §, rådgivning kräver tillstånd) med
   kontextkontroll av varje verbträff.
4. Intern länkkontroll mot https://localhost:3000 (loopback whitelistad) —
   med mjuk-404-uteslutning: en påhittad aspekt-slug ger hård 404, så 200
   betyder verklig sida här.
5. 911-kontroll (sökning efter "911" i filen).

## Fynd A — blockerande för flytt (måste rättas)

**A1. Scenariotabellen: en cell är felaktig.**
Raden "Omsättning +3 % (58,7 mdr)" × marginal 9,6 % = 58,7 × 0,096 =
**5,6** miljarder — tabellen säger **6,4**. Övriga åtta celler är korrekta
(omräknade). Rättningen är ett teckenbyte-par i diff-filen.

**A2. Aritmetikpåståendet under tabellen håller inte.**
"I rutnätet flyttar en procentenhet marginal resultatet ungefär lika mycket
som tre procent omsättning" — stämmer inte: en procentenhet marginal är
värd 0,57 mdr (tabellens egen basenhet), medan tre procent omsättning vid
marginalerna 7,6–9,6 % flyttar resultatet 0,13–0,15 mdr. Förhållandet är
alltså ungefär **fyra gånger**, inte "lika mycket". Rubriken "Marginalen
slår omsättningen" blir sannare med rätt tal — diff-filen föreslår
"ungefär fyra gånger så mycket som tre procent omsättning". Eftersom
sektionen uttryckligen lovar "ren aritmetik … inga prognoser" måste varje
räknepåstående stämma.

**A3. Fel bolag: "Indutrade" ska vara "Industrivärden" (2 ställen).**
Analysbibliotekets bolag INDU-C.ST är **AB Industrivärden (publ)** — det
står så i `data/analyses/INDU-C.ST.json` och i kalender-industri.json, där
rappdagen 2026-10-07 kommer från Industrivärdens årsredovisning 2025
(MFN-PDF, hämtad 2026-09-15). Datumet i utkastet är rätt, bolagsnamnet är
fel — sannolikt en förväxling av tickern INDU-C. Förekommer två gånger:
bibliotekslistan ("…H&M, Indutrade, Sandvik…") och "från 7 oktober
(Indutrade)". Byts till "Industrivärden" på båda ställena.

## Fynd B — innehåll (rättas i samma diff, ej blockerande)

**B1. Antalspåståendet "100 bolag, tio per bransch" stämmer inte med filen.**
`bolagsunivers.json` (2026-09-03) har **103 bolag**: tio per bransch utom
energi som har 13. Medianerna i utkastet är beräknade på 103-posters filen —
jag räknade om alla 16 mediancellerna och de stämmer exakt — så det är bara
antalet i texten som avviker. Diff-förslag: "103 bolag — tio per bransch
utom energi, som har tretton —". (Not: kalendrarna i v152 tog medvetet 10
per bransch; om energi-filens tre extra poster gallras senare ska talet
ändras tillbaka.)

**B2. Resultatnivåerna 3,6 → 12,2 miljarder: gröna med källnot.**
Absolutnivåerna lagras inte i universumet (bara CAGR-talen), men de är
internt konsistenta: 3,6 → 12,2 mdr över tre räkenskapssteg (FY2022 →
senaste året, dvs. "senaste fyra räkenskapsåren" som texten säger) ger
50,2 % per år — mot universumets resultatCAGR5ar = 50,5 %. Talen kommer ur
samma Yahoo-serie (incomeStatementHistory) som byggde universumet. Ingen
rättning; noteras för transparens.

## Fynd C — juridik (lagen 2007:528): REN

Genomgång av all fritext mot juridikgrindens rekommendationsverb
(köp/sälj/rekommendera/bör du/målkurs/målpris/undvik). Resultat:

- **Inga rekommendationer.** Alla fem verbträffarna är: "försäljning"
  (omsättningsfakta ur H&M:s rapporter), "H&M har köpt tillbaka egna
  aktier" (bolagsfakta som förklarar P/B-mekaniken — pedagogik), samt två
  disclaimers ("inget beslutsunderlag om köp eller försäljning", "Inga köp-
  eller säljrekommendationer lämnas").
- **Scenariosektionen är mönsterrenskriven:** "ren aritmetik på fjolårets
  Q3-siffror … inga prognoser", basenheten förklarad, och
  volatilitetsstycket förklarar varför reaktionen inte står i proportion
  till siffran.
- **Vågdata-sektionen avgränsar sig själv:** "ingen kursprognos och inget
  beslutsunderlag om köp eller försäljning" — och den interna
  rekommendationsdata som finns i analysfilen har korrekt INTE läckt in i
  utkastet (kontrollerat mot HM-B.ST.json).
- **Slutdisclaimer** med korrekt lagrum (2007:528) och påminnelse om att
  publicering är kundens beslut (R2).

**Slutsats C:** juridiskt flyttklar utan ändring.

## Fynd D — länkar: 14/14 interna + 3/3 externa gröna

- 14 interna länkar svarar 200 med verkligt innehåll (sidtitlar
  verifierade): 4 dataset-aspekter + /dataset/konsument, 5 blogginlägg
  (alla finns live i data/blogg/), 2 kurser (km-044, km-009 finns i
  data/seo/kurser/), /bolag/hm-b-st, /transparens, /kallor.
- Mjuk-404 utesluten: påhittad aspekt-slug ger hård 404, så svaret 200 är
  ett bevis, inte en fallback.
- 3 externa H&M-URL:er lever (200): sexmånadersrapporten (HTML+PDF,
  content-type application/pdf verifierad) och niomånadersrapporten 2025.
  Reuters-länken är syntaxkontrollerad (bot-blockad risk — hanteras som i
  morgonrapporten: korrekt länkad källa, lämnas därhän).

**D-not (kvalitet, rightas i diff):** länktexten
"[rörelsemarginalen](/dataset/konsument/netto-marginal)" pekar på
nettomarginal-sidan — semantiskt glidande (inga ebit-marginal-aspekter
finns i systemet). Diff-förslag: länktexten blir "nettomarginalen"
(tabellen ovanför har en nettomarginalrad, så länken förblir relevant).

## 911-referenser

Sökning efter "911" i filen: **0 träffar**. Inget att åtgärda.

## Övriga kontroller — gröna

- **Q2/sexmånader 2026 mot primärkällan:** alla 12 talen exakta —
  nettoomsättning 54 828 (56 714), rörelseresultat 5 913 (5 914), marginal
  10,8 % (10,4), engångspost 679 (omstrukturering), exkl. 6 592/12,0 %,
  resultat efter skatt 3 963 (3 962), EPS 2,49 (2,48); sexmånader 104 435
  (112 047), 7 425 (7 117), 7,1 % (6,4), 4 667 (4 541); jun-uttalandet
  återges som bolagets eget ("on par with the same month the previous
  year") med korrekt källmarkering.
- **Q3-2025-jämförelsebasen mot primärkällan:** alla tal exakta — 57 017
  (59 011), 4 914 (3 507), 8,6 % (5,9), 3 212; "föll 3 % i kronor" =
  −3,38 %; "+2 % i lokala valutor" och "cirka 5 procentenheter"
  valutaeffekt är bolagets egna siffror.
- **Universumtabellen:** 8 HM-värden + 16 medianceller exakta mot
  bolagsunivers.json (P/E 22,474→22,5 · P/B 8,118→8,1 · EV/EBIT 13,699→13,7
  · ROE 34,67 % · brutto 54,12 % · EBIT 11,0 % · netto 5,57 % · skuld/EK
  2,2636→2,26; kurs 172,60 ✓). Tillväxtraden grön (0,7 %/50,5 %/−3,3 % +
  B2-konsistens ovan).
- **Vågdatan:** alla 12 påståenden exakta mot HM-B.ST.json — vågklasser
  5/5 (kort/medellång/lång impulsvåg, mikro/mega basbygge), signalmatrixen
  16 bullish/5 bearish/4 neutrala (cellräknad ur matris25), volatilitet
  25,41 %→25 %, ATR14 3,32→3,3, voltrend −21,5 %→−22 %, pos52 0,843→84 %,
  52v-spann 120–194,30, MA50 170,04→170, MA200 174,24→174.
- **Kalendern:** rappdag 2026-09-24, niomånadersperiod 1 dec 2025–31 aug
  2026, helårsrapport 2027-01-28 — bekräftat exakt mot H&M:s officiella
  finansiella kalender; "torsdagen 24 september" är rätt veckodag
  (datumkontroll); "säsongens tidigaste rappdag bland bibliotekets bolag"
  stämmer mot kalenderfilerna (H&M 09-24 → Industrivärden 10-07 →
  Ericsson 10-15 → ABB 10-20 → …).
- **Bibliotekslistan:** "elva bolag" stämmer exakt (data/analyses/ har 11
  filer; 9 namngivna "bland dem" — namnfelA3 undantaget).

## Verifieringar (oberoende hämtning 2026-09-15)

| Källa | Påstående i utkastet | Resultat |
|---|---|---|
| hmgroup.com — Financial calendar | 24 sep 2026 niomånadersrapport (1 dec 2025–31 aug 2026); 28 jan 2027 helårsrapport | **Bekräftad exakt** (båda datumen + periodfönstren) |
| hmgroup.com — Six-month report 2026 (2026-06-25) | Alla Q2-/sexmånadssiffrorna (12 tal) | **Bekräftad exakt** — varje siffra ordagrant |
| hmgroup.com — Nine-month report 2025 (2025-09-25) | Jämförelsebasen Q3 2025 (8 tal + valutamekaniken) | **Bekräftad exakt** — inkl. "2 % lokala valutor" och "~5 pp" kronaeffekt |
| hmgroup.com — rapport-PDF:n | Länken lever | **200, application/pdf** |
| data/analyses/INDU-C.ST.json + kalender-industri.json | "Indutrade"? | **Motsagd** — INDU-C.ST = AB Industrivärden (fynd A3) |
| data/analyses/*.json | "elva bolag med vågvalideringsdata" | **Bekräftad** — exakt 11 filer |
| localhost:3000 (loopback) | 14 interna länkar | **14/14 OK — alla 200 med verklig titel; okänd slug → 404 (inga mjuka)** |

## Nästa steg

1. Verkställ A1–A3 (+ B1, D-not) via `kvartal-2026-q3-hm-b-diff.json` —
   ägare: paketets byggare (auto-s4-u1) eller nästa våg; exklusivt
   filägarskap gäller. Alla söksträngar är verifierade unika i filen.
2. Därefter är paketet FLYTTKLART och väntar på kundens publiceringsbeslut
   (R2) — helst före rappdagen 2026-09-24, som är paketets poäng.
3. Syskonpaketen (Volvo Car, Ericsson) granskas separat — detta är
   bolagspaket 3 av 3 i kön.

*Granskningskvitto: 1 549 ord genomlästa; ~50 siffror kontrollerade mot 4
källor (varav 3 oberoende hämtade), 16 medianer omräknade, signalmatrixen
cellräknad, scenariotabellen omräknad cell för cell, juridikgrind +
911-kontroll + 14 länkar körda; diff med 6 poster (3 blockerande, 2
fakta, 1 kvalitet) levererad som ny fil — inga originalfiler ändrade av
granskaren. src/ orörd (tsc ej aktuellt).*
