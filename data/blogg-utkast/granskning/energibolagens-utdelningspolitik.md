# Granskning: Utdelningspolitiken inom energi (mx1-aspektguiden 1/5 — energi+utdelningspolitik)

**Granskad:** 2026-09-16 · **Granskare:** agentfabrik s1-u3 omgång 4 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/energibolagens-utdelningspolitik.json`
· **Diff-förslag:** `energibolagens-utdelningspolitik-diff.json` (samma mapp)

**BEDÖMNING: FLYTTKLART EFTER C-POSTERNA** — inga blockerande fynd (0 A-poster).
Samtliga elva sifferpåståenden är exakta mot bolagsuniversumets egna värden i båda
graftillstånden (115 som-skrivet och 120 aktuellt — energiraderna orörda av
universumstillväxten), medianmetoden är den korrekta, AKM2-spridningen 31–77 är
verifierad ordagrant mot den publicerade artikeln, juridiken är ren och samtliga fem
interna länkar lever med äkta innehåll. Kontrast mot syskonguiden material+tillväxt:
**inga falska superlativer finns i detta utkast.** Granskningens tyngsta fynd är
källattribueringen: texten anger "källor Yahoo Finance och MarketStack", men 3 av
13 energibolag — däribland Neste, som ensam bär mittenvärdet för skuld/eget kapital
(0,560) — hämtas från StockAnalysis. Rättas med två sök/ersätt (C2/C3).

Objektval: m9-ko-utkasten (6), SEO-guiderna (8), kvartalsserien och branschguiderna
är granskade i tidigare omgångar (v151 + s1-omgångar 2026-09-14/15/16). mx1-seriens
fem aspektguider (commit 806f9359 23:54) är köns aktuella post: material+tillväxt
granskades av denna agent i omgång 3 (bed498bb); energi+utdelningspolitik är
seriens första objekt i commit-ordningen och tas här. Syskonen u1/u2 (samma
manifest, pågår sedan 07:45) kör egen kollisionskontroll — granskningsmappen
återkontrollerades före commit.

## Metod

1. Mekanisk genomgång med node-sonder: JSON-giltighet, schema mot
   `BloggExportPost`-formen, ord/rubrik/disclaimer-krav, "911"-strängsökning
   (sex mönster) i samtliga fält, rekommendationsverb, unikhet hos alla
   diff-strängar (grep = exakt 1 träff vardera före leverans).
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser ur
   `data/varumarke.json` kompilerade med "giu"-flaggorna (samma som
   kontrolleraText) på titel+ingress+body.
3. Plattformens egen juridikgrind körd: `verktyg/juridikgrind-vakt.mjs`
   (mekanisk 2007:528-scanner) — utkastet: 0 fynd.
4. Egen omräkning av samtliga medianer ur `data/portfolj-system/bolagsunivers.json`
   med rätt medianmetod (medel av de två mittersta vid jämnt n), med n-räkning
   och mittenvärdesbärare identifierade — i AKTUELLA filen (120 bolag) och mot
   skrivtidstillståndet (115 bolag, commit 0e399f13) för att skilja skrivfel
   från åldnade tal. Källfälten (kallor/hamtat) kontrollerade för alla 13
   energibolag i båda tillstånden.
5. HTTP-kontroll av alla 5 interna länkar mot localhost:3000 (loopback,
   whitelistad) + innehållskontroll (sidtitlar, inte friendly-404) +
   kursluger verifierade i `public/deep-courses.json` + bloggmål i live-mappen.
6. AKM2-spridningen 31–77 kontrollerad ordagrant mot den publicerade
   branschmedianartikeln (`data/blogg/branschmedianer-akm2.json`).
7. HTTP-kontroll av externa källdomäner (eia.gov, nordpoolgroup.com) — med
   webbläsar-UA (HEAD ger 503 bot-skydd på eia.gov, se flagg 4).
8. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning
   tillåtet, rådgivning kräver tillstånd).

## Fynd C — precisionsrättningar (verkställningsbara, ej blockerande)

**C1. readingMinutes 3 → 1 enligt plattformskontraktet.**
Kontraktet (`src/lib/blogg-utkast.ts`, `ORD_PER_MINUT = 600`, rad 194:
`Math.max(1, Math.round(ord / ORD_PER_MINUT))`): 890 ord (titel+ingress+body)
/ 600 = 1,48 → **1**. Filen säger 3. Exportvägen räknar om värdet automatiskt,
så felet är kosmetiskt — men rättas enklast nu. Detta är seriens andra
verifierade instans (material+tillväxt: 924 ord → 2 mot filens 3) och den
kraftigaste: här spretar filen två steg mot kontraktet.

**C2. Källattribueringen i dataset-sektionen är ofullständig — StockAnalysis saknas.**
Bodyn: "Bolagsuniversumets publika nyckeltal (september 2026; källor Yahoo
Finance och MarketStack) för energibranschens 13 bolag visar:". Verkligheten
i datakällan: 10 av 13 bolag bär Yahoo Finance + MarketStack (hamtat
2026-09-03), men **TotalEnergies, Neste och Ørsted bär källan StockAnalysis**
(hamtat 2026-09-15) — i både 115- och 120-tillståndet, alltså ett skrivfel,
inte åldrad data. Substantiellt av två skäl: Neste bär ensam mittenvärdet för
skuld/eget kapital (0,560 — utkastets huvudtal "0,56 gånger") och ett av de
två mittenvärdena för P/E (16,05 av 16,05/17,02); Ørsted är orsaken till att
P/E och prognos redovisas med n=12. Diff-post C2: "källor Yahoo Finance,
MarketStack och StockAnalysis".

**C3. Samma ofullständiga attribuering i källsektionen.**
"…hämtade september 2026 från Yahoo Finance och MarketStack; medianer med
antal mätta bolag redovisade på dataset-sidan." — samma rättning på sin andra
plats i texten (C2:s spegel i "Källor och vidare läsning").

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1. Title 70 tecken.** Google trunkerar sökresultat runt 60 tecken;
  branschguide-mallens span var 46–55. mx1-serien bär 70–84 (seriebeslut —
  andra verifierade instansen). Förslag som bara stryker svansen och behåller
  alla sökord: "Utdelningspolitiken inom energi — bas, extra och råvarapriset"
  (61 tkn).
- **D2. Description 202 tecken.** SEO-normen ~150–160 (lakemedelsguidens 157
  godkändes); serien bär 193–208 (seriebeslut). Förslag på 141 tkn i
  diff-posten: "Energi är en utdelningstung bransch. Så läser du basutdelning,
  extrautdelning och kassaflödets uthållighet — med klassiska fällor och
  källor."
- **D3. Det trettonde bolaget är onämnt.** Utkastet räknar korrekt "13 bolag"
  men namnger 12 i de tre modellerna; Neste (NESTE.HE — raffinering och
  förnybara bränslen) passar ingen av modellerna renodlat och lämnas därmed
  okommenterad, trots att bolaget bär två av medianerna (se C2). Inte ett fel
  — grupperna presenteras som modeller, inte uttömmande klassificering — men
  en notis hade väglett läsaren mot datasetet. Förslag (tillägg efter tredje
  gruppen, 178 tkn): "Universumets trettonde energibolag — Neste, raffinering
  och förnybara bränslen — hamnar mellan modellerna: råvarukänslighet som
  prospekteraren, investeringsprogram som elbolaget."
- **D4. publishedAt = skapandedatum (2026-09-15).** Ska vara faktisk
  publiceringsdag vid flytt (publicering = kundens beslut, R2). Exportvägen
  stämplar automatiskt; vid manuell flytt sätts datumet då.

## Juridik (lagen 2007:528): REN

- **Juridikgrind-vakten: 0 fynd** för utkastet (objektet frånvarar i
  larmlistan — 0 FEL, inga VARNINGAR).
- **0 FEL, 0 VARNINGAR** av plattformens 26 förbjudna fraser
  (data/varumarke.json, kontrolleraText-replik med "giu"-flaggor).
- **Inga rekommendationer**: de två "köp "-träffarna i sonden är del av orden
  "återköp/återköpsprogram" (ägarutdelning — guideämnet själv) — falska
  positiva, inte råd. 0 träffar på rekommendera/bör du/målkurs/målpris/undvik.
- **Bolagsnämningar endast deskriptiva**: tolv namn som universumsexempel i
  tre utdelningsmodeller (Equinor, Aker BP, Vår Energi · Chevron,
  ExxonMobil, Shell, TotalEnergies · Iberdrola, Enel, RWE, Fortum, Ørsted) —
  ingen uppmaning, ingen kursprognos, inget enskilt bolag värderat eller
  bedömt som köp/sälj. Pandemiåret 2020 beskrivs som mekaniklärdom
  ("lånefinansiera eller skära ned"), inte som omdöme om dagens policy.
- **Utbildningsramen genomgående**: fyra frågor om uthållighet är
  metodbeskrivning ("Separera den fasta basutdelningen … Räkna ut var bolaget
  ligger"), fällorna formuleras som mekaniskmönster utan adressat + disclaimer
  sista rad ("_Detta är pedagogisk finansanalys, inte investeringsråd._")
  identisk med mallens.

## 911-referenser

Sökning efter "911", "11 september", "september 2001", "9/11", "terror" och
"eleven september" i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — medianer och påståenden

Medianmetod: medel av de två mittersta vid jämnt n. Utkastet har använt den
korrekta metoden; samtliga tal identiska i 115- och 120-tillstånden
(energiraderna orörda av universumstillväxten 115→120).

| Påstående i utkastet | Egen beräkning ur bolagsunivers.json | Dom |
|---|---|---|
| Median kassaflödesavkastning 3,1 % (13 mätta) | 3,09 % (mittenvärde: Equinor), n=13 | ✓ |
| Median skuld/eget kapital 0,56× (13 mätta) | 0,560 (mittenvärde: Neste), n=13 | ✓ |
| Median P/E 16,5 (12 mätta) | 16,53 = medel(16,05 Neste; 17,02 Aker BP), n=12 (Ørsted null) | ✓ |
| Median P/B 2,3 (13 mätta) | 2,27 (mittenvärde: Fortum), n=13 | ✓ (avrundat) |
| Femårsväxt omsättning −11 % | −10,96 % (mittenvärde: Equinor), n=13 | ✓ |
| Femårsväxt resultat −22 % | −22,37 %, n=12 (Ørsted null) | ✓ |
| Konsensusprognos −6 % (12 mätta) | −6,26 % = medel(−8,4 ExxonMobil; −4,1 Fortum), n=12 | ✓ |
| "noll av universumets bolag har det fältet mätt" (utdelningsdata) | aterkop.senasteArMdr = null i 120 av 120 rader | ✓ |
| "energibranschens 13 bolag" | exakt 13 rader med bransch=energi | ✓ |
| AKM2-spridning inom energi (31–77) | publicerad artikel: "energi — median 58 · 10 mätta av 10 · spridning 31–77 (lägst RWE, högst Chevron)" | ✓ ordagrant |
| 12 namngivna bolag i tre grupper | samtliga 12 finns i universumet, korrekt grupperade; Neste (#13) onämnd → D3 | ✓ med not |

Superlativkontroll (syskonguidens fälla): de två "universumets"-träffarna är
"bolagsuniversumets publika nyckeltal" och "noll av universumets bolag har det
fältet mätt" — båda sanna; utkastet gör inga rang-påståenden. Inga
"högst/lägst i universumet"-formuleringar finns.

## Verifieringar (oberoende, 2026-09-16)

| Påstående/objekt | Resultat |
|---|---|
| 5 interna länkar (3 kurser, /dataset, 1 blogg) | **5/5 HTTP 200** mot localhost:3000; samtliga renderar äkta innehåll: "Eget kapital & utdelningar — AKM1-kurs", "Kassaflödesanalysen — AKM1-kurs", "P/E — Price-to-Earnings djupdykning", "Branschmedianer — median P/E, P/B och marginaler per bransch", "Branschmedianer september 2026 — varje branschs AKM2-profil" |
| Kursluger i public/deep-courses.json | km-005-eget-kapital-utdelningar ✓ · km-003-kassaflodesanalysen ✓ · km-009-pe ✓ |
| Bloggmål i live-mappen | data/blogg/branschmedianer-akm2.json existerar (publicerad 2026-09-03) — inget publiceringsberoende |
| Källfält per energibolag | 10/13 Yahoo Finance + MarketStack (hamtat 2026-09-03) · 3/13 StockAnalysis (hamtat 2026-09-15) — "september 2026" ✓, men attribueringen ofullständig → C2/C3 |
| Externa källdomäner | nordpoolgroup.com 200 · eia.gov/outlooks/steo 200 med webbläsar-UA (sidtitel "Short-Term Energy Outlook" verifierad; HEAD = 503 bot-skydd) |
| Talens stabilitet över filtillstånd | Samtliga medianer identiska i 115- (skrivläget, 0e399f13) och 120-tillståndet — fynden C2/C3 konstanta = skrivfel, inte åldnade tal |

## Struktur och schema — grönt

Giltigt JSON; exakt `BloggExportPost`-formen (slug/title/description/pillar/
author/publishedAt/readingMinutes/tags/body); body 6 296 tecken (krav ≥ 800)
med 6 "##"-rubriker (krav ≥ 2); disclaimer sista rad identisk mallens; slug
evergreen utan månadsuffix; 5 taggar; pillar "Institutionell metodik" identisk
med samtliga mx1-syskon; 890 ord på kontraktsbasen → kontraktet ger
readingMinutes 1 (filen säger 3 → C1).

## Flaggor till övriga ägare (ej mina filer)

1. **mx1-seriens systematik — andra verifierade instansen:** denna guide bär
   samma mönster som material+tillväxt: readingMinutes 3 mot kontraktets 1
   (här två stegs avvikelse), title 70 tkn och description 202 tkn över
   SEO-normerna. Seriebeslut som lämpar sig att tas en gång för alla fem —
   finans-, hälsa- och konsumentgranskarna (omgång 5+) bör räkna om
   readingMinutes mot kontraktet före leverans.
2. **"Femårs"-etiketten mot källans serielängd (dataägare, spår 2):**
   energiraderna bär samma notering som material ("serier/CAGR bygger på 4
   räkenskapsår, inte 5"); utkastets "Femårsmedelväxten" följer fältnamnet
   (CAGR5ar) och är internt konsekvent — etikettfrågan tillhör dataägaren
   (redan flaggad i materialgranskningen; gäller även finans, hälsa, konsument).
3. **GRANSKNINGSKO-SAMMANSTALLNING.md saknar mx1-serien** (fem rader) —
   samma flagg som materialgranskningens; kön som kunden ser den är inaktuell.
4. **eia.gov HEAD-sonder = 503 (bot-skydd):** granskare som verifierar
   externa länkar bör använda GET med webbläsar-UA; länken själv lever
   (200 + rätt sidtitel). Noteras till vaktdataläggen om extern länkkontroll
   automatiseras.
5. **N-notis — 2020-påståendets källor:** pandemiårets mekanik ("lånefinansiera
   eller skära ned … därefter återköpsprogram") är allmän marknadshistoria och
   inte täckt av källistans två externa källor (EIA = prisprognoser, NordPool =
   elpriser). Acceptabelt i utbildningsramen — historien är välbelagd och
   formuleringen mekanisk, inte värderande — men noteras ärligt: den som vill
   belägga den styckenelsen behöver bolagsrapporter, inte dessa två källor.

## Nästa steg

1. Verkställ C1–C3 ur diff-filen (ägare: guidens ägare eller nästa våg) —
   C2/C3 först: de bär källäktheten (tre bolag ur StockAnalysis, Neste
   mittenvärdesbärare).
2. Besluta D1–D4 (kvalitet — D1/D2 helst som seriebeslut med syskonen).
3. Paketet är därefter **FLYTTKLART** och väntar på kundens
   publiceringsbeslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (schema, struktur, 911 = 0
träffar/6 mönster, varumärkesgrind 0 FEL/0 VARNINGAR av 26, juridikgrind-vakten
0 fynd), 11/11 sifferpåståenden egna omräknade gröna i två graftillstånd (115/120)
med mittenvärdesbärare identifierade, källattribueringsfel mot 13 bolagsrader
bevisat (3/13 StockAnalysis) med 2 maskinverifierade byt-poster, AKM2-spridningen
verifierad ordagrant mot publicerad artikel, 5/5 interna länkar 200 +
innehållsverifierade (3/3 kursluger i deep-courses), 2/2 externa domäner 200
(eia.gov med UA), diff med 7 poster (3 verkställningsbara, 4 förslag) levererad
som ny fil — inga originalfiler ändrade av granskaren.*
