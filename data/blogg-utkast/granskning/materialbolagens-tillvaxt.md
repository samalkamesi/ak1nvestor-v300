# Granskning: Tillväxt inom material (mx1-aspektguiden 3/5 — material+tillväxt)

**Granskad:** 2026-09-16 · **Granskare:** agentfabrik s1-u3 omgång 3 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/materialbolagens-tillvaxt.json`
· **Diff-förslag:** `materialbolagens-tillvaxt-diff.json` (samma mapp)

**BEDÖMNING: FLYTTKLART EFTER C-POSTERNA** — inga blockerande fynd (0 A-poster).
Granskningens tyngsta fynd är två falska superlativer i datasetets paradoxavsnitt:
"den högsta i hela universumet" (prognosen) och "universumets lägsta" (P/B) —
båda motsagda av bolagsuniversumets egna medianer i samtliga graftillstånd
(107/109/115 bolag). Däremot är samtliga åtta mediantal MED n-uppgifter exakta,
medianmetoden är den korrekta (medel av de två mittersta vid jämnt n — felet
som fällde bankaktierdubleten är inte närvarande), AKM2-spridningen 31–79 är
verifierad ordagrant mot den publicerade artikeln, juridiken är ren och samtliga
fem interna länkar lever med sunt innehåll.

Objektval: m9-ko-utkasten (6), SEO-guiderna (8), kvartalsserien och
branschguiderna är granskade i tidigare omgångar (v151 + s1-omgångar 2026-09-14/15).
Kvar i kön stod mx1-seriens fem aspektguider (energi+utdelningspolitik,
finans+riskhantering, material+tillväxt, hälsa+lönsamhet, konsument+skuldsättning
— commit 806f9359 23:54). Manifesttiteln "#3" pekar på seriens tredje objekt i
commit-ordningen; syskonen u1/u2 med identiska prompts torde ta #1/#2 — valet
minimerar duplikatrisken enligt spårets kända kollisionsmönster.

## Metod

1. Mekanisk genomgång med node-sonder: JSON-giltighet, schema mot
   `BloggExportPost`-formen, ord/rubrik/disclaimer-krav, "911"-strängsökning
   i samtliga fält, rekommendationsverb, unikhet hos alla diff-strängar
   (grep = exakt 1 träff vardera före leverans).
2. Plattformens egen textgrind replikerad: samtliga 26 förbjudna fraser ur
   `data/varumarke.json` med samma flaggor som kontrolleraText ("giu") på
   titel+ingress+body.
3. Plattformens egen juridikgrind körd: `verktyg/juridikgrind-vakt.mjs`
   (mekanisk 2007:528-scanner, 57 dokument) — utkastet: 0 fynd, grund bär.
4. Egen omräkning av samtliga åtta medianer ur `data/portfolj-system/
   bolagsunivers.json` (115 bolag) med rätt medianmetod, plus
   universumsjämförelser per bransch — och mot historiska filtillstånd
   (107/109/115 via git show) för att fastställa om felen är nya eller ärvda.
5. HTTP-kontroll av alla 5 interna länkar mot localhost:3000 (loopback,
   whitelistad) + innehållskontroll (titel-rendering, inte friendly-404) +
   bekräftelse i live-mappen att bloggmålen existerar som filer.
6. AKM2-spridningen 31–79 kontrollerad ordagrant mot den publicerade
   branschmedianartikeln (`data/blogg/branschmedianer-akm2.json`).
7. HTTP-kontroll av externa källdomäner (sgu.se, scb.se).
8. Juridikgrind-genomläsning (lagen 2007:528 — 2 kap 5 §: utbildning
   tillåtet, rådgivning kräver tillstånd).

## Fynd C — precisionsrättningar (verkställningsbara, ej blockerande)

**C1. "Den högsta i hela universumet" är falskt — material är näst högst.**
Paradoxbulleten: "Konsensusprognosen för kommande tillväxt: median +24 procent
(10 mätta) — den högsta i hela universumet." Universumet hyser en egen
tillväxtbransch (n=10: Nvidia, Tesla, Palantir, Shopify m.fl.) med
prognosmedianen **+37,3 %** mot materials +24,1 %. Påståendet är falskt i
samtliga graftillstånd (107-, 109- och 115-bolagsfilen — tillväxtbranschen
ligger över i alla), alltså inte ett åldrande-tal-fel utan ett fel vid
skrivandet. Diff-post C1: "den näst högsta i hela universumet (endast
tillväxtbolagens +37 ligger högre)" — påståendet hålls kvar, bara rangen
rättas. Sammanfattningen upprepar INTE superlativen (bara "+24 procent"),
så en enda rad behöver röras.

**C2. "Universumets lägsta" P/B är falskt — fastighet ligger under.**
Paradoxbulleten: "Median P/B 1,3 (10 mätta) — universumets lägsta — och P/E
18,5 (9 mätta)." Fastighetsbranschens median-P/B är **0,83** (n=11; 0,88 i
109-tillståndet) mot materials 1,31. Material är näst lägst. Diff-post C2
byter till "universumets näst lägsta, efter fastighetsbolagens 0,8".

**C3. Sammanfattningens "P/B det lägsta (1,3)" — samma fel, andra raden.**
Sammanfattningen: "Lönsamheten är universumets lägsta (ROIC 3,6 procent) och
P/B det lägsta (1,3)". Lönsamhetsdelen är SANN (se tabell — både ROIC och ROE
är universumets lägst), men P/B-delen är samma falska superlativ som C2.
Diff-post C3: "P/B det näst lägsta (1,3, efter fastighetsbolagens 0,8)".

**C4. readingMinutes 3 → 2 enligt plattformskontraktet.**
Kontraktet (src/lib/blogg-utkast.ts, `ORD_PER_MINUT = 600`): lästid =
ord(titel+ingress+body)/600 avrundat. Texten är 924 ord på den basen → 2.
Exportvägen räknar om värdet automatiskt, så felet är kosmetiskt — men
rättas enklast nu. Systematiskt: hela mx1-serien bär 3 mot kontraktets 1–2
(syskonen 890–999 ord, filens 3 — se flaggor).

## Fynd D — förslag (kräver beslut, ej blockerande)

- **D1. Title 78 tecken.** Google trunkerar sökresultat runt 60 tecken;
  branschguide-mallens span var 46–55. mx1-serien använder långa litterära
  titlar (70–84 hos syskonen) — seriebeslut. Förslag som bevarar rytm och
  sökord: "Tillväxt inom material — cykelns våg och prognosens mod" (55 tkn).
- **D2. Description 176 tecken.** SEO-normen ~150–160 (lakemedelsguidens 157
  godkändes); speglarna (en/ar) clampar först vid 300. Förslag på 132 tkn i
  diff-posten.
- **D3. "Efter två år av fallande råvarupriser" — texten motsäger sig själv.**
  Paradoxavsnittets förklaringsmening sätter fallen råvarupris som orsak —
  men två rader senare står "branschgruppen hyser både nedcyklade skogsbolag
  och guldgruva i uppgång", och datasetets egen Newmont-rad bär
  omsättningstillväxt +23,9 %/år (enda stort positiva i branschen). Guldet
  steg under perioden; det som föll var industriråvaror och virke. Förslag:
  "fallande priser på industriråvaror och virke".
- **D4. publishedAt = skapandedatum (2026-09-15).** Ska vara faktisk
  publiceringsdag vid flytt (publicering = kundens beslut, R2).

## Juridik (lagen 2007:528): REN

- **Juridikgrind-vakten: 0 fynd** för utkastet (av 57 skannade dokument),
  utbildningsgrunden bär (grund: true).
- **0 FEL, 0 VARNINGAR** av plattformens 26 förbjudna fraser
  (data/varumarke.json, kontrolleraText-replik med "giu"-flaggor).
- **Inga rekommendationer**: 0 träffar på rekommendera/bör du/målkurs/
  målpris/undvik; de två "sälj"-träffarna i sonden är del av orden
  "försäljning(stillväxt)" — falska positiva, inte råd.
- **Bolagsnämningar endast deskriptiva**: tio namn som universumsexempel i
  branschfamiljerna (Stora Enso, SCA, Holmen, Billerud, UPM, Boliden, SSAB,
  Norsk Hydro, Newmont, Yara) — ingen uppmaning, ingen kursprognos, inget
enskilt bolag värderat. AKM2-spridningen citerar modellpoäng ur en
publicerad artikel, inte omdömen.
- **Utbildningsramen genomgående**: steg-fem-listan är metodbeskrivning
  ("Väg prognosens kvalitet … behandla den som ett scenario bland flera") +
  disclaimer-sista-rad ("_Detta är pedagogisk finansanalys, inte
  investeringsråd._") identisk med mallens.

## 911-referenser

Sökning efter "911", "11 september", "september 2001", "9/11" och "terror"
i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — medianer och påståenden

Medianmetod: medel av de två mittersta vid jämnt n (s1-u2:s konvention efter
bankaktierdublettens C1a/C1b-fynd) — utkastet har använt den korrekta metoden.

| Påstående i utkastet | Egen beräkning ur bolagsunivers.json | Dom |
|---|---|---|
| Prognos median +24 % (10 mätta) | +24,1 % = medel(22,7; 25,5), n=10 | ✓ |
| Resultat-CAGR −23 % (8 mätta) | −23,25 % = medel(−23,3; −23,2), n=8 (2 null) | ✓ |
| Omsättnings-CAGR −2,2 % (10 mätta) | −2,2 % exakt = medel(−2,7; −1,7), n=10 | ✓ |
| ROIC 3,6 % (9 mätta) | 3,6 % (mittenvärde, n=9), span −0,7 till 40,8 | ✓ |
| ROE 7,2 % (10 mätta) | 7,15 % = medel(6,2; 8,1) → 7,2, n=10 | ✓ |
| P/B 1,3 (10 mätta) | 1,31 = medel(1,28; 1,33), n=10 | ✓ |
| P/E 18,5 (9 mätta) | 18,49 (mittenvärde, n=9; 1 null) | ✓ |
| "…den högsta i hela universumet" | tillväxtbranschen +37,3 % > material +24,1 % | ✗ → C1 |
| "Universumets lägsta lönsamhet" | ROIC 3,6 % lägst av 10 branscher OCH ROE 7,2 % lägst | ✓ |
| P/B "universumets lägsta" | fastighet 0,83 (n=11) < material 1,31 | ✗ → C2/C3 |
| 10 materialbolag, tio namngivna | exakt medlemmarna; inga extra, ingen saknad | ✓ |
| AKM2-spridning 31–79 (Stora Enso → Newmont) | publicerad artikel: "material — median 42 · spridning 31–79 (lägst Stora Enso, högst Newmont)" | ✓ ordagrant |
| "Prognosen för nästa år starkt positiv" | fältet = konsensus EPS-tillväxt +1 år (earningsTrend) | ✓ tidsmässigt |

## Verifieringar (oberoende, 2026-09-16)

| Påstående/objekt | Resultat |
|---|---|
| 5 interna länkar (tx-01, v01-kurs, /dataset, 2 blogginlägg) | **5/5 HTTP 200** mot localhost:3000; samtliga renderar real innehåll (sidtitlar verifierade — inte friendly-404) |
| tx-01-organisk-mot-forvarvad-tillvaxt | **ÄKTA kurs** i public/deep-courses.json (352 kurser): titel "Organisk vs förvärvad tillväxt — spåra källan". Worklog-notisen om "tx-01-fantomen" gäller stavningen "forvarad" (utan v) i ai-mentor-kod — en annan sträng; denna länk är korrekt |
| Bloggmålen i live-mappen | branschmedianer-akm2.json (publicerad 2026-09-03) + v01-forsaljningstillvaxt-analys.json existerar i data/blogg/ (55 publicerade) — inget publiceringsberoende |
| Universumspåståenden mot historik | Felen i C1/C2 är konstanta: tillväxt 37,3 % över materials prognos och fastighet under materials P/B i 107-, 109- och 115-tillstånden — felen är ärvda från skrivandet, inte åldnade |
| Externa källdomäner | sgu.se 200, scb.se 200 (HEAD-kontroller 2026-09-16) |
| AKM2-artikeln | Spridningen och ändpunkterna ordagrant identiska med utkastets mening |

## Struktur och schema — grönt

Giltigt JSON; exakt `BloggExportPost`-formen (slug/title/description/pillar/
author/publishedAt/readingMinutes/tags/body); body 6 296 tecken (krav ≥ 800)
med 6 "##"-rubriker (krav ≥ 2); disclaimer sista rad identisk mallens; slug
evergreen utan månadsuffix; 5 taggar; pillar "Institutionell metodik" identisk
med samtliga fyra mx1-syskon; 924 ord på kontraktsbasen (titel+ingress+body) →
kontraktet ger readingMinutes 2 (filen säger 3 → C4).

## Flaggor till övriga ägare (ej mina filer)

1. **mx1-seriens systematik (syskongränsskarnas bord):** samtliga fem utkast
   bär readingMinutes 3 mot kontraktets 1–2 (890–999 ord), titlar 70–84 tkn
   och beskrivningar 193–208 tkn över SEO-normerna. C4/D1/D2 här är
   seriebeslut — information till energi-, finans-, hälsa- och
   konsumentgranskarna.
2. **"Femårs"-etiketten mot källans serielängd (dataägare, spår 2):** 102 av
   115 bolagsrader — samtliga 10 i material — bär noteringen "serier/CAGR
   bygger på 4 räkenskapsår (källan ger 4, inte 5)". Utkastet skriver
   "femårsmedelväxt" efter fältnamnet (CAGR5ar) och är konsekvent med
   datasetet — men hela datasetet, /dataset-sidan och samtliga utkast som
   citerar fälten mäter fem år på fyra räkenskapsår. Etikettbeslutet tillhör
   dataägaren, inte granskaren; påverkar även denna guides fyra syskon.
3. **GRANSKNINGSKO-SAMMANSTALLNING.md saknar mx1-serien** (fem rader) — kön
   som kunden ser den är inaktuell även här; ägare: sammanställningens
   upprätthållare (samma flagg som lakemedelsgranskningens, nu med fem nya
   objekt).

## Nästa steg

1. Verkställ C1–C4 ur diff-filen (ägare: guidens ägare eller nästa våg) —
   C1/C2/C3 först: de bär faktainnehållet (universumspåståendena).
2. Besluta D1–D4 (kvalitet — D1/D2 helst som seriebeslut med syskonen).
3. Paketet är därefter **FLYTTKLART** och väntar på kundens
   publiceringsbeslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 1 utkast mekaniskt kontrollerat (schema, struktur, 911,
varumarke-grind 0 FEL/0 VARNINGAR av 26, juridikgrind-vakten 0 fynd), 8/8
mediantal egna omräknade med rätt medianmetod och exakta n, 2 universums-
superlativer bevisade falska mot tre graftillstånd (107/109/115), AKM2-
spridningen verifierad ordagrant mot publicerad artikel, 5/5 interna länkar
200 + innehållsverifierade (tx-01 bevisad äkt kurs), 2/2 externa domäner 200,
diff med 8 poster (4 verkställningsbara, 4 förslag) levererad som ny fil —
inga originalfiler ändrade av granskaren.*
