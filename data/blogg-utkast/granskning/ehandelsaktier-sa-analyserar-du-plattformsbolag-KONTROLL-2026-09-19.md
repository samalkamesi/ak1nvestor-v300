# KONTROLL 2026-09-19 — ehandelsaktier-sa-analyserar-du-plattformsbolag.json

**Granskare:** fabriksagent s1-u2 OM-DISPATCH (manifest auto-s1-1789829700743, spår 1 granskare 2/3).
**Anspråk:** data/vakten/auto-s1-1789829700743-u2-ansprak-2.md — disk-först, före mätning.
**Sond:** verktyg/_s1u2-ehandel-verify.mjs (100 kontrollrader: 94 OK · 2 FEL · 4 VARN; utmatning återgiven nedan).
**Dom: FLYTTKLAR EFTER RÄTTNING (B1–B3; C1 beslutas av ägaren). Publicering = kundens beslut (R2).**

## VAL (om-dispatch + pivot enligt köregeln)

Denna slot levererade redan i first dispatchen (livsmedelsaktier KONTROLL + diff,
commit 60b372da; status "klar" kod 0) — fabriken om-dispatchade malltexten "Granska
m9-utkast #2". Båda ordagranna objekt är täckta: m9-utkast #2 (branschmedianer-akm2)
sedan 09-16 (8448ef77), livsmedelsaktier sedan 60b372da. FIFO nästa objekt efter
syskonens val (u1 medie 09-16 22:16 · u2föregångare livsmedel 09-16 22:17 · u3 LYX
09-17 03:26 PÅGÅENDE — ytan orörd): **ehandelsaktier (svenska originalet, 09-17 03:28)**
— exakt det objekt u2-föregångarens och u3:s NOTIS-räknematrikel pekar ut som nästa
lediga. 0 kollisioner: 0 ehandelsaktier-filer i granskning/, 0 anspråk på originalet
(s3-o19 gällde ÖVERSÄTTNINGEN -en, spår 3, annat objekt). Källvintage LÅST till
byggtidens universum: **d27b727b** (byggcommit 2026-09-17 03:31, 144 poster) via
`git show` → /tmp; dagens träd (201+) används endast för glidningsinfo.

## GRANSKNINGENS FYND (B-klass = verkställs före flytt; söksträngar maskinverifierade unika ×1)

- **B1 readingMinutes 2 → 5.** 1 074 ord textrensat ⇒ ord/200-praxis 5 (537 ord/min
  vid nuvarande värde; publicerades max 240). TIONDE fallet i klassen (substansrabatt,
  halvledar, hälsa, konsumentaktier, försvar, spelaktier, detaljhandel, flyg,
  livsmedel — därtill detta). Byggd 09-17 03:31, före första domen 09-17.
- **B2 FALSK UNIVERSUMS-SUPERLATIV: "med universumets högsta tillväxttakt: 48,1
  procent".** Sondens maskinkoll mot byggtidens vintage: **8 bolag högre TTM-tillväxt**
  (INDU-C.ST +1 198 % · KINV-B.ST +164 % · INVE-B.ST +117 % · NVDA +106 % · VAR.OL
  +103 % · PLTR +93 % · CVX +54 % · AMD +50 %) — Sea Limited (48,1 %) är inte i
  närheten av universumets topp; idag är listan 11 bolag. Livsmedel-B1–B3:s felklass
  (falska universums-superlativer), här fjärde fallet i serien. Rättning: "med högsta
  tillväxttakten av de fem: 48,1 procent senaste tolvmånadersperioden" — påståendet
  är EXAKT sant i det scopet (sonden: tillväxtordning Sea 48,1 > MELI 46,0 >
  SHOP 33,7 > UBER 16,7 ✓).
- **B3 AMAZONS FCF-ORSAK FEL MOT KÄLLAN: "lager och logistik binder kapital".**
  Utkastet: Amazon "redovisar just därför en FCF-marginal på minus 1,5 procent —
  lager och logistik binder kapital som de lättare plattformarna slipper." Universumets
  egen not (vintage d27b727b) anger orsaken: **"FCF negativt TTM (−11,6 mdr USD:
  OCF 161,4 − capex 173,0 — AI-infrastrukturprogrammet)"** — driftkassan är starkt
  POSITIV (+161,4 mdr USD); det är capex-programmet (AI-infrastruktur) som väger
  över, inte lager/logistik (den klassiska retail-förklaringen). Talet −1,5 % är
  exakt och "kapitaltungt" håller — men mekanismen är källfeloaktig. Rättning (bevarar
  pedagogiken + kontrasten mot plattformarna): "…minus 1,5 procent — driftkassan är
  stark, men capexprogrammet (173 miljarder dollar, till stor del AI-infrastruktur,
  mot driftkassa 161) binder kapital som de lättare plattformarna slipper."

## C-förslag (ägaren beslutar; inte blockerande)

- **C1 modekedjornas spann "kring 54–56 procent" mot Inditex 56,5.** Universumets
  två modekedjor: H&M 54,1 % ✓ i spannet, Inditex 56,5 % — strax över övre gränsen.
  "Kring"-formuleringen bär det (avrundat heltal 56≈56,5), men "54–57" vore exaktare.
  Obs: bransch-etiketten i universumet är 'konsument' — "i detaljhandeln" i texten
  är sektoriell beskrivning av verksamheten (korrekt språkbruk om H&M/Inditex), inget
  påstående om en universumsbransch.

## GRÖNT DÄRUTÖVER (sondens mätning)

- **Källtalsparitet 42/42 EXAKTA** mot byggtidens vintage d27b727b: UBER (oms 52,017→
  52,0 mdr · fcf 9,763→9,8 · resultat −9 141/+10 053 M$ EXAKTA · brutto 40,75→40,8 ·
  P/E 15,58→15,6 · TTM 16,7) · SHOP (brutto 47,77→47,8 · P/E 94,58→94,6 · PEG 2,61 ·
  TTM 33,7 · skuld/EK 0,014→"0,01 krona" · oms 8,88/11,556→8,9/11,6 · resultat
  −3 460/132/2 019/1 231 — "vinst alla tre följande år" ✓ · fcfYield 0,86→0,9) ·
  MELI (oms 10,78/28,893→10,8/28,9 · skuld/EK 1,69 EXAKT · P/E 49,77→49,8 · PEG 3,4 ·
  TTM 46,0 · fcfYield 13,4 EXAKT) · ABNB (brutto 82,9 EXAKT · ROE 34,54→34,5 · P/E
  38,08→38,1 · PEG 1,42 · fcf 4 646 · resultat 2 511/4 792/2 648 EXAKTA) · SE (P/E
  43,556→43,6 · PEG 1,15 · TTM 48,1 EXAKT · fcfMarginal 0,24→0,2 · resultat
  −1 651/+1 578) · AMZN (mcap 2 680 EXAKT · fcfMarginal −1,5 EXAKT · bransch teknik ✓).
- **Ingressens källspann "(2026-09-03–16)" EXAKT** mot hamtat-fälten (SHOP+SE 09-03 ·
  MELI+ABNB+UBER+AMZN 09-16).
- **Aritmetik 5/5** egenomräknad: GMV-exemplet 10×8 %⇒0,8 mdr · MELI-CAGR
  (28,893/10,780)^(1/3)−1 = 38,91 % → "38,9" · SHOP-intäktstillväxt 11,556/8,880 =
  30,1 % → "30 procent" · ABNB fcf/resultat 4 646/2 511 = 1,850 → "1,85 gånger" ·
  P/E-spannet 94,6/15,6 = 6,06 → "mer än sexfalt".
- **Scoping-grönt**: UBER "lägst multipel av de fem" ✓ (15,6 lägst av 15,6/38,1/43,6/
  49,8/94,6) · tillväxtordningen Sea>MELI>SHOP>UBER ✓ · "universumet bär tre av dem"
  (vändningarna UBER/SE/SHOP) ✓ mot seriedata.
- **Juridik 2007:528 REN**: varumärkesgrinden 0/26 förbjudna mönster × 3 ytor
  (title/description/body) · rådglossor med ordgräns 3 träffar, samtliga deskriptiva
  företagsbeskrivningar ("bolag som säljer verktygen e-handeln byggs med" — ingress,
  "Vad e-handelsaktier säljer" — H2-fråga, "**Shopify** säljer verktygen" — modell-
  beskrivning) — noll imperativ, noll rikta-adressat · 0 lagrum i texten ⇒ ingen
  blandningsrisk · utbildningsram i ingressen ("Den här guiden går igenom mekaniken
  steg för steg") · disclaimer exakt sista rad ("_Detta är pedagogisk finansanalys,
  inte investeringsråd._").
- **911 = 0/6 mönster** (911, 9/11, 11 september, september 11, eleven september,
  nine eleven).
- **17/17 unika interna länkar HTTP 200 mot localhost** (deploy-låset kontrollerat
  fritt FÖRE testet — u1:s lärdom tillämpad) + **6/6 bloggmål live på disk** — därav
  viktiga: branschmedianer-akm2 (m9-stycket alltså publicerat) och peg-multipeln-
  svagheter-2026; kursankaret v15-natverkseffekter + km-006/km-003/km-004/km-009/
  km-027, v01/v03/v04/v07/v10. 0 utkastlänkar.
- **Struktur grön**: 7 H2 (inom serievariationen — inget fynd) · title 49/60 ·
  description 151/155 · sökordet "e-handelsaktier" i title+description+ingress+första
  H2 (4/4 ytor) · 5 tags · 0 mjuka bindestreck-FEL (sondens 35 träffar = etablerade
  sammansättningar: e-handelsaktier ×9, FCF-marginal/FCF-yielden, P/E-talen/-måttet/
  -djupdykningen, P/S-talet, PEG-multipeln/-kursen + URL-slugs) · publishedAt
  2026-09-17 = byggdatum (seriekonvention).
- **Universumglidning: INGEN RISK** — texten citerar noll branschmedianer (endast
  bolagsvärden; info: tillväxtgrenens P/E-median vintage 46,66 → idag 43,56, n 10→11).
- **-EN-SPEGELN talparitet 44/44** nyckeltal identiska i ehandelsaktier-…-en.json.

## NOTISER

- **N1 spegling -en**: ehandelsaktier-…-en.json (09-19 04:34, ogranskad, 1 275 ord)
  bär B1+B2+B3:s systrar verifierade ("the universe's highest growth rate: 48.1" ·
  "inventory and logistics tie up capital") — speglas vid verkställning: rm 2→6,
  "highest of the five", capex/AI-formulering.
- **N2 systemflagga rm**: TIONDE fallet — ord/200-kontrollen saknas fortfarande i
  byggarnas KVD-mall (samma eftersläpning som detaljhandel-F1/flyg/livsmedel noterat;
  verktygsägaren). Superlativ-kontrollen (N3) hör hemma i samma mallryck.
- **N3 systemflagga superlativer**: fjärde fallet i livsmedel-B1–B3-klassen —
  maskinkoll "superlativ + universumet" mot byggtidens vintage hade fångat B2 före
  publiceringsgrinden.
- **N4 sond-ärlighet**: sondens 2 diffsträng-VARN är verktygsartefakter, ej utkast-
  fynd ("minus 9 141 … 10 053" förekommer AVSEDD i både Hävstång-sektion och
  Sammanfattning; '"readingMinutes": 2' mättes mot stringifierad JSON utan mellanslag
  — i filen är strängen unik ×1, verifierad med grep -F). Livsmedel-precedensen:
  verifiera verktyget innan verktyget får döma.

## KVD

Endast data/ + verktyg/ + worklog berörs = INGET bygge; src/ orörd (tsc-baslinjen
bärs av pre-commit-grinden); R2 orörd (priser/tier/publicering); data/blogg/ orörd
(live-mappen); utkast-JSON:en orörd (granskaren skriver ej om andras filer);
syskonytor orörda (u3:s pågående lyxaktier-granskning + deras sond orörd); commit
MED pathspec.
