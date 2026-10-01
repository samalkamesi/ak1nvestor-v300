# KONTROLL — sa-laser-du-essity-q3-2026 (Essity Q3 2026-läspaketet)

**Datum:** 2026-10-01 · **Granskare:** fabriksagent s1-u2, manifest auto-s1-1790858103968
(spår 1, granskningskön 2/3 — PIVOT från "m9-utkast #2": m9-2 utdelningar-101 bär
flyttklart paket sedan 2026-09-20 (449d4dfa) och var pivotkälla redan 2026-09-30;
detta pass = FIFO-etta bland helt ogranskade i 22:a-klustret enligt AT&T-passets
kö-notis: essity/swedbank/sandvik/atlas-copco/castellum/nokia)
**Sond:** `verktyg/_s1u2-essity-kontroll.mjs` — omkörbar, allt egenmätt.
**Dom: GRÖN EFTER DIFF — FLYTTKLART MED RÄTTNINGAR (publicering = kundens beslut, R2).**

## Utkastets läge

- Utkast: `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-essity-q3-2026.json` (v1,
  byggd 2026-09-16 av auto-s4-u1 rond 4) — **orört** (md5 `c0272d3d…`, git-diff mot
  HEAD tom; granskaren skriver inte andras filer).
- Byggvintage låst och verifierad: **9839c5304** (2026-09-16 01:44, exakt 120
  poster — byggarens deklarerade medianunderlag) + dagens träd (328 poster).
- Källor: vågvalidering-SENASTE.md (domrond 2026-09-04) · bolagsunivers.json
  (ESSITY-B.ST, hämtat 2026-09-03) · kalender-konsument.json (2026-09-15, Essitys
  officiella IR-kalender) · varumarke.json (kontrolleraText-spegel).

## Sondens dom: 93 OK · 8 FEL (= fyndens belägg) · 3 NOT

Tre sondbuggar bokförda+rättade+omkörda FÖRE domen (parseFloat dör på
tusentelspace i "15 610,2" · felaktig egen konstant 1,6208 för Sandvik/Atlas →
1,6178 · await inuti icke-async callback) — samtliga toleransklassen, ingen rörde
utkastet.

### Kärnan GRÖN (urdrag)

- **Källfält 24/24**: samtliga ESSITY-fält identiska i dagens träd, vintagen och
  utkastet (pris 272,50 · mcap 184,258 · tillväxt −3,93/+31,49/+2,6/+8,83 % ·
  lönsamhet 13,96/13,62/33,29/12,62/8,81/6,53 % · skuld/EK 0,4573→"0,46" ·
  värdering 15,607/1,993/12,823/3,4/4,87 %) + serier 4+4 exakta + räntetäckning
  null + fyra notis-citat (ROIC-proxy, 4-års-CAGR, utdelning null, MarketStack
  utan dubbelkoll) speglade.
- **Medianer 12/12 omräknade ur vintagen**: konsument n=13 (pe/pb/roe n=12 —
  "ett bolag saknar fälten" sant): 20,447→20,4 · 3,94 · 24,19→24,2 · 14,61→14,6 ·
  8,38→8,4; universum n=111–120 per mått: 20,519→20,5 · 2,79 · 15,34→15,3 ·
  21,11→21,1 · 14,31→14,3. Tabellen håller i sin helhet.
- **Vågkvitto-tabellen exakt** mot källraden (mikro träff −5,6 innanför ±6 ·
  kort miss −8,1 · medellång miss +11,1 · mega miss +11,1 · lång osatt) +
  jämförelsetalen NDA +33,7/SHB +22 ("kort: basbygge-miss") + 12 tickerrader +
  "en negativ, två positiva" missar.
- **Aritmetik ~30 poster egenräknad, alla gröna**: totalfall −11,32 % · fyra
  monotont fallande intäktsår (156 173→147 147→145 546→138 494 — "fyra år av
  fallande intäkter" är SANT, inte bara endpoint) · CAGR −3,93/+31,50 mot
  källfälten −3,93/+31,49 (källans avrundning, källtrogen) · fördubbling 2,27×
  → "+127 %" · topp-fall 2024→2025 = −39,40 % · ROE−ROIC 0,34 pp ("inom 0,4") ·
  brutto−EBIT 20,67 ("cirka 21") · identitet 1,993/0,1396 = 14,28 mot 15,61 =
  +9,3 % ("cirka 9 procent") · PEG-konvention 15,607/8,83 = 1,767→1,77 med
  kvartett-kvoterna 4,05/7,96/4,45/1,92 (textens 4,1/8,0/4,5/1,9) ·
  scenariorutans 9 celler + bas 17 477,9 + räknesatser 1 384,94→"1 385" och
  524,34→"524" + rätte 2,641 ("2,6") + formeln 1/(3×0,1262) · ABB 1,972 ("2,0") ·
  Sandvik/Atlas 1,6178 ("1,6–1,7") · brytpunkt 33 % · multiplövning 15,607/1,0883
  = 14,341 ("14,34") · medianläsningens fem jämförelser.
- **Juridik 2007:528 REN på två vägar**: kontrolleraText-spegel (varumarke.json
  egna regexer, "giu", stateful reset — exakt src/lib/varumarke.ts:141-logiken)
  0 FEL/0 VARN på hel utkast-yta OCH publicerbar yta · exakt en lagrumsfamilj
  {2007:528:1, övriga:0} · köp/sälj endast negerat ("inte en rekommendation att
  köpa…" · "Inga köp-, sälj- eller hållningsrekommendationer") · "investeringsråd"
  1 = negerad disclaimer sist · utbildningsgrunden buren.
- **911 = 0 på sex mönster** (hel fil inkl. metadata).
- **Länkar 19/19 interna HTTP 200** mot localhost:3000 (16 aspektsidor + bolagssidan
  + /kurser + /transparens + /kallor) · essity.com/investors/calendar/ live 200.
- **Struktur**: 8 H2 · disclaimer sist med 2007:528 + R2-skyddet · title 158 ≤ 314
  (wihlborgs-taket) · description 519 tkn (syskonspann 777) · slug/metadata enligt
  seriekontraktet.

### FYND = diff-satserna (verifierade exakt-en-träff; verkställs i PAKETET, utkastet orört)

| # | Klass | Fynd | Rättning |
|---|---|---|---|
| F1 | VÄSENTLIGT (3 ytor) | "universumets renodlade basbygge-fall" (body) + "universumets renaste basbygge-profil" (body + description) antyder unikhet — källan visar **fyra** hel-basbygge-bolag: ESSITY, ERIC-B, AZN, SKF-B (samtliga fyra dömda horisonter = basbygge). Essitys försvarbara superlativ är *minsta rörelsen* (missrymd 12,3 pp mot AZN 61,2 · ERIC 60,3 · SKF 385,7) | Tre satser: "ett av universumets fyra hel-basbygge-bolag (med Ericsson, AstraZeneca och SKF) men det med minst rörelse i klassen" · "en hel-basbygge-profil och klassens minsta rörelser" · description dito |
| F2 | Aritmetik/jämförelserad | "Bankerna (50–54): vikten 0,5" — textens EGEN utskrivna formel 1/(3×marginal) ger 1/(3×0,50)=0,667 … 1/(3×0,54)=0,617; 0,5 håller inte (intäktsratten "1,5–1,6 gånger" = 3×m stämmer och är formelviktens invers) | "vikten 0,6–0,67" |
| B1 | Metadata | publishedAt "2026-10-20" mot kalenderkällans rappdag 2026-10-22 (syskonkontraktet: Vår Energi-paketet bär sin rappdag) | "2026-10-22" |
| B2 | Metadata | readingMinutes 6 mot 600-ordskontraktet round(2 789/600) = 5 (fabege-F6-precedensen; byggaren deklarerade själv 2 789 ord) | 5 |
| C1 | Språk | "aldrig en handssignal" — wihlborgs-B3/iberdrola-C1-felklassen | "aldrig en handelssignal" |
| C2 | Språk | "Träningsfrågorna är dubbelt Eckliga" — inget svenskt ord | "dubbelt kluriga" |
| C3 | Språk | "Måttet är meningsfullt här (olik bankerna) men bära med källans not" — två grammatikbrott i en mening | "(till skillnad från bankerna) men bär med sig källans not" |

### NOT (ingen rättning)

- **M13 drift**: dagens träd 328 poster ger konsument pe-median 19,713 (n=43) ·
  universum 19,429 (n=315) — utkastet deklarerar öppet sin vintage (2026-09-03 /
  medianer 2026-09-16 ur 120-bolagsfilen); först vid nästa underlagsrefresh tas
  nya medianer. Drift-not till serieägaren, inte fel i utkastet.
- **A10**: tröskel-±6-konstanten bär tre gånger (m9-6-konstanten, konsistent).
- **P3**: "med sju paket i böcken" — talspråklig kollokation, serieägarens stilval.

## KVD

Data-only · src/ orörd (tsc-baslinjen vilar i pre-commit-grinden) · R2 orörd
(data/blogg/ ENDAST LÄST; paketets publicering = kundens beslut) · utkastfilen
orörd (md5 `c0272d3d…`) · syskonytor orörda · commit med explicit pathspec + -F-fil.

**Paket:** `sa-laser-du-essity-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u2.json`
(9 satser verkställda + efterverifiering: gamla strängar 0 träffar, nya på plats,
kontrolleraText 0/0 på paketytan, JSON giltig, rm = round(ord/600) konsistent).
**Diff:** `sa-laser-du-essity-q3-2026-diff-2026-10-01-s1u2.json`.
