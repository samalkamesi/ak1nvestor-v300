# KONTROLL 2026-09-20 — sa-laser-du-atlas-copco-q3-2026 (kvartalsseriens sjunde läspaket)

**Granskare:** agentfabrik s1-u2 (manifest auto-s1-1789902316443, granskningskön 2/3).
**Uppdrag:** "Granska m9-utkast #2: källor, siffror, juridik-språk (2007:528),
911-referenser → flyttklart paket med diff-rapport."
**PIVOT (köregeln — duplikat = förlorat arbete):** m9-familjen är 6/6 granskad
FLYTTKLAR sedan 2026-09-16/19 (rond 101–102 = våg 208 LEVERERAD+STÄNGD;
GRANSKNINGSKO-SAMMANSTALLNING.md §m9: "SAMTLIGA granskade FLYTTKLARA, familjen
kompletterad 2026-09-19" — sjätte+sjunde s1-omgången i raden med samma läge).
**VAL:** FIFO bland kvartalstabellens ogranskade paket: SKF (10-21, förstavalet
→ syskon u1) → **Atlas Copco Q3 2026 (byggd 09-15 15:21)** — u2:s andralucka,
kollisionsminimerat mot syskon som följer spårets FIFO-mönster. Klaim skriven
före all granskning: `data/vakten/auto-s1-1789902316443-s1-u2-ansprak.md`.

**DOM: FLYTTKLAR EFTER RÄTTNINGAR** — R1 (superlativ "seriens största bolag
hittills" motbevisad av seriens nuvarande läge) + B1 (σ-jämförelsefel mot
Ericsson) + C1 (stavfel). I övrigt exceptionellt välmåttat: **83 maskinella
kontroller 0 fel** (`verktyg/_s1u2-atlas-kontroll.mjs`), källorna fält-för-fält
exakta, kalendern exakt, medianerna exakta mot byggvintagen, aritmetiken grön
i samtliga 25 omräkningar, juridiken ren.

---

## 1. Källor — GRÖN (36 kontroller)

- **Bolagsuniversumet, ATCO-A.ST-posten:** samtliga 21 citerade fält EXAKTA —
  kurs 201,70 · börsvärde 984,018 mdr ("nära/cirka 984 miljarder" ✓) ·
  ROE 0,257 · ROIC 0,3231 · brutto 0,4219 · EBIT 0,2056 · netto 0,1567 ·
  FCF 0,1529 · FCF-yield 0,0264 · TTM-tillväxt 0,091 · CAGR-fält 0,06 ·
  prognostillväxt 0,1902 · P/E 36,874 · P/B 9,257 · EV/EBIT 28,346 · PEG 2,19 ·
  skuld/EK 0,3367 · räntetäckning null · serier 141 325→168 343 Mdr (4 år).
  Källans egna noter är ÅTERGIVNA i utkastet (ROIC-proxyn, 4-årserien,
  MarketStack-saknaden, räntetäckningshålet) — hederlighetsskedet grönt.
- **Kalenderunderlaget (kalender-industri.json):** ATCO-posten EXAKT —
  "2026-10-22 (ca kl 12:00 CEST, telefonkonferens 14:00)", tyst period från
  2026-09-22, halvårsutdelning samma dag, IR-källan atlascopcogroup.com
  hämtad 2026-09-15 — allt korrekt återspeglat i body + källorsektion.
  **Extern länk live: IR-kalendern 200** (curl 2026-09-20).
- **Syskonrappdagarna:** H&M 2026-09-24 · Industrivärden 2026-10-07 ·
  Ericsson 2026-10-15 · SKF 2026-10-21 · Sandvik 2026-10-22 ("samma dag" ✓) ·
  ABB 2026-10-20 ("två dagar tidigare" ✓) — samtliga verifierade mot
  kalenderkommunikation/konsument/finans/industri/teknik. 22 oktober 2026 =
  torsdag ✓.
- **Vågvalideringsprotokollet (2026-09-04):** ATCO-raden exakt — mikro
  impulsvåg → träff (13 %) · kort basbygge → träff (3,8 %) · medellång
  basbygge → miss (8,4 %) · mega basbygge → miss (8,4 %) = **2 träffar +
  2 missar ✓**, tröskeln ±6 % korrekt citerad (protokollets "≤ 6 %").
- **Vågmätningen (data/analyses/ATCO-A.ST.json, verifierad 2026-08-24):**
  5 vågklasser exakta (basbygge/impulsvåg ×4) · 25-cellersmatrisen
  18▲/4▼/3— exakt omräknad cell för cell · σ 28 %/år · 52v-position 91 % ·
  nivåerna 130,00/180,77 (MA200 180,7738)/197,89 (MA50 197,891)/212,30.
- **Urvalspåståendet "tidigaste återstående rappdagen bland bibliotekets
  tolvuniversumsbolag" — VERIFIERAD SANN mot byggläget:** analysbiblioteket
  (data/analyses/, 11 filer) ∩ tolvuniversumet = {ATCO, SAND, ERIC, AZN, SKF};
  vid bygget 15:21 fanns paket för ERIC (10-15) och SKF (10-21) — kvar stod
  ATCO+SAND (10-22) och AZN (10-30). Nordea (10-15) och SHB (10-21) rapporterar
  tidigare men ligger UTANFÖR biblioteket — ingen motsägelse. ABB (10-20)
  korrekt hanterat som utanför tolvuniversumet.

## 2. Siffror — GRÖN utom B1/C3 (52 kontroller, alla oberoende omräknade)

- **Identitetstest P/E = P/B ÷ ROE:** 9,257 ÷ 0,257 = **36,02** ✓ ("blir det
  36,0") mot redovisat P/E 36,874 → brottet 2,3 % — korrekt förklarat
  pedagogiskt ("talen kommer från olika tidpunkter"; seriens standardfras).
- **Scenariorutan: 9/9 celler EXAKTA** (163,3/168,3/173,4 × 19,6/20,6/21,6 % —
  alla halv-upp-avrundningar korrekta, däribland 33,9968→32,0-klassens
  gränsceller). Marginalvikterna: 1 procentenhet ≈ **1,683 mdr** ("cirka 1,7" ✓)
  · 3 % omsättning ≈ **1,040 mdr** ("cirka 1,0" ✓) · kvot **1,62×**
  ("ungefär 1,6 gånger" ✓) · hörncellspann 32,0–37,5 ✓.
- **Övning C:** 36,9 ÷ 1,19 = **31,008** → "31,0" ✓ (även med fältets exakta
  36,874 ÷ 1,1902 = 30,98 ✓).
- **CAGR:** (168 343 ÷ 141 325)^(1/3) = **6,004 %** → "6,0 procent per år" ✓
  med ärlighetsnoten "källan ger fyra år, inte fem" ✓.
- **Medianer mot byggvindan (109-filan, git `ea7ad8bd` 09-15 14:31 — fönstret
  14:31–20:23 omsluter bygget 15:21):** **10/10 EXAKTA** inkl. n-tal —
  indu P/E 28,25→"28,3" · P/B 5,10 · EV/EBIT **21,549→"21,5" korrekt
  halv-upp-avrundat** (granskarens första python-utskrift 21,55 var själv
  avrundad — exakt värde 21,549, utkastet RÄTT) · ROE 19,68→"19,7" ·
  EBIT 16,91→"16,9" · univ P/E 19,92→"19,9" · P/B 2,67→"2,7" ·
  EV/EBIT 19,21→"19,2" · ROE 15,04→"15,0" · EBIT 21,16→"21,2".
  Parentesen "109 bolag — 10 till 13 per bransch" ✓ (spannet exakt 10–13).
- **Dagens drift (225-filan, industri n=20):** P/E 28,01 · P/B 4,94 ·
  EV/EBIT 19,98 · ROE 20,3 % · EBIT 14,3 % — **samtliga innehållspåståenden
  HÅLLER** ("dyrare än branschen på alla multiplar, men också lönsammare":
  36,9>28,0 · 9,3>4,9 · 28,3>20,0 · 25,7>20,3 · 20,6>14,3). Ingen Tele2-klass
  VÄNT bland medianpåståendena; tabellen bär dessutom sin egen vintage-datering.
- **NOTERING (ingen åtgärd):** parentesens "Alla värden är hämtade 2026-09-03"
  — 10/11 industriposter är hämtade 09-03 (Skanska 09-15); Atlas egna tal 09-03
  ✓. Mikro-nuans i samlingsdatum, under seriens tolerans.

## 3. Juridik — REN (lagen 2007:528)

- **Varumärkesgrinden** (data/varumarke.json, 26 mönster × 3 ytor
  title/description/body): **0 FEL-klass träffar**. Enda träffen är mjuk
  VARNING: "kunder" i övning A — men det är **redovisningsterminologi om Atlas
  Copcos kunder i definitionen av organisk tillväxt** ("samma bolag, samma
  kunder"), inte platformens egen kundbenämning; A8-regeln ("sägs elev")
  /PRO-yteundantaget träffar inte. Ingen åtgärd.
- **Lagrum:** 2007:528 2 kap 5 § citerat korrekt, **ett** lagrum, inga
  blandningar med 2022:260/2022:261/1985:716/2005:59/2022:482.
- **Negerad rekommendation tidigt + disclaimer sist:** "inte en rekommendation
  att köpa, sälja eller behålla" (ingress) + "inte investeringsrådgivning" +
  R2-raden "publiceringen av detta paket är kundens beslut" (sista raden).
- **Ton:** genomgående utbildningsform — tre explicita prognos-
  avståndstaganden ("ingen kursprognos", "inte en sanning och inte vår
  prognos", "räknestorhet, inte som prognos") + "inga prognoser" om rutan +
  "Det är observerade lägen i efterhand — inte nivåer kursen borde nå".
  **FYND C1:** samma stavfel som Tele2-C1 — "aldrig en **handssignal**" ska
  vara "**handelssignal**" (övning C:s sista mening). Byggfamiljens
  systematiska slip, tredje dokumenterade fallet.

## 4. 911-referenser + struktur + länkar — GRÖN

- **911: 0 träffar** (mönstren 911 · 9/11 · 11 september · september 2001 ·
  Porsche — samtliga 0).
- **Struktur:** body 12 448 tecken · 1 792 ord — readingMinutes **6 följer
  10-22-kullens konvention** (skf 1 621 ord→6 · sandvik 2 120→7 · swedbank
  2 761→6; kvartalsserien använder INTE m9-seriens /600-regel) · title 84
  tecken i kohortbandet 77–158 · description 322 i seriens band 291–1 057 ·
  pillar/author enligt serien · publishedAt **2026-10-19 = exakt syskonkonven-
  tionen** (skf + sandvik, samma rappdag 10-22, publicerade 10-19).
- **Interna länkar: 16/16 i live-sitemapen** (localhost:3000/sitemap.xml,
  2 526 urler) — 13 × /dataset/industri/* + /kurser + /transparens + /kallor.
  **/bolag/atco-a-st finns live men är OLNKAD** (fynd C5; 4/5 syskon länkar
  bolagssidan). Externa: IR-kalendern 200 (live-kontroll ovan).

## 5. FYND R1 (VÄSENTLIG — verkställbar): superlativet föll sex timmar efter bygget

Utkastet: *"seriens största bolag hittills, med ett börsvärde på nära 984
miljarder kronor"* — **sant vid bygget 09-15 15:21** (då fanns sex paket;
största syskon Ericsson 317,5 mdr), men **ABB-paketet byggdes 21:25 samma
kväll** med ABB.ST på 1 662,9 mdr SEK — och i dag innehåller serien minst nio
större bolag (Eli Lilly ~10 700 · JPMorgan ~9 800 · Samsung · ASML ~5 900 ·
PG ~3 500 · Goldman Sachs ~3 000 · SAP ~2 400 · Novo Nordisk ~2 000 mdr
SEK-ekvivalenter, alla byggda 09-17–09-20). Påståendet är motbevisbart av
seriens egna publika läge — samma klass som Tele2-R1 ("ligger PÅ branschmedianen")
och flygaktier-B1/B2: innehållspåstående som faller rättas till vintage-sann
form. Diff R1 verkställer: superlativet → "ett av seriens tyngsta bolag — när
paketet byggdes det största". Kvarvarande "bland de tyngsta på hela
Stockholmsbörsen" HÅLLER (984 mdr är toppskiktet bland de svenska noteringarna
i universumet: ABB 1 663 > ATCO 984 > Volvo 672 ≈ Nordea 671).

## 6. FYND B1 (sifferfel — verkställbar): σ-jämförelsen

Utkastet: σ "cirka 28 procent per år **(högre än syskonpaketen Ericsson och
Industrivärden)**" — Ericsson-paketet redovisar **σ 32 procent per år** (samma
verifieringsdatum 2026-08-24, fullt jämförbart): 28 är LÄGRE, inte högre.
Industrivärden 19,9 % är korrekt refererat. Diff B1: "högre än syskonpaketet
Industrivärden på 19,9 procent, lägre än Ericsson-paketets 32". (SKF, det
närmaste syskonet, mätte 28,7 % — nära Atlas, utkastet gör inget påstående om
SKF.)

## 7. Övriga fynd

- **C1 (språk, verkställbar):** "handssignal" → "handelssignal" (övning C).
- **C3 (talhed, förslag):** introraden "ger ett rörelseresultat på ungefär
  **34,6** miljarder" — meningens egna avrundade indata ger 34,67→34,7 och
  rutans mittcell säger 34,7 (exakt räkning på källans tal 168,343 × 20,56 % =
  34,61 → 34,6; ingen form är "fel", men text+cell bör säga samma). Förslag.
- **C4 (öppenhet, förslag):** kvittotabellen visar de fyra dömda raderna men
  protokollets femte rad "lång: **osatt** → osatt" saknas — seriens princip
  ("missar redovisas lika öppet"; "osatta räknas i täckningsbråket, aldrig som
  fel") talar för att raden syns. Förslag: tabellrad enligt diff C4.
- **C5 (navigering, förslag):** /bolag/atco-a-st live men olnkad — 4/5 syskon
  länkar bolagssidan i anslutning till universumjämförelsen (SKF/ABB-konven-
  tionen). Förslag enligt diff C5.

## 8. Verkställande och ansvar

Diff-fil: `sa-laser-du-atlas-copco-q3-2026-diff.json` (samma katalog) —
samtliga gammalt-strängar maskinellt verifierade **UNIKA** i filen (6/6,
kontroll 2026-09-20). Originalet ändras av paketets ägare (s4-släktet) eller
nästa våg — **inte av granskaren**. Verkställ R1 + B1 + C1 (C3/C4/C5 efter
behag), kör paketets egen KVD vid flytt till data/blogg/. **Publicering
förblir kundens beslut (R2).**

*Kontrollskript: `verktyg/_s1u2-atlas-kontroll.mjs` (read-only mot data/,
skriver inget i data/). Total dom: 83 kontroller 0 fel · 1 väsentligt fynd
(R1) · 1 sifferfynd (B1) · 1 språkfynd (C1) · 3 förslag (C3–C5) · juridik
0 FEL (1 mjuk VARNING, legitim) · 911 = 0 · länkar 16/16 interna + 1 extern.*
