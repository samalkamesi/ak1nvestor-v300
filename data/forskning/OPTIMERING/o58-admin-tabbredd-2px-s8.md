# o58 — Våg 185 (s8-u1): /admin:s konstanta 2px-mobilöverflöd — rotorsaksfix tabbradens utbrytarmarginal

**Spår:** 8 KVALITET & SÄKERET (evighetskatalogen) · **Objekt:** PIPELINE-KO våg 185,
den återstående halvan ("horisontell överflöd 2px" på /admin, light/390px, alla flikar).
**Datum:** 2026-09-18 (fabriksagent s8-u1, manifest auto-s8) · **Status: KOD LEVERERAD,
EFTER-mätning väntar prod-synkens nästa deploy** (byggen ägs av prod-synken — ALDRIG fabriksbarn).

## 1. Fyndet och dess historia

Gränsnittsvakten har rapporterat `överflöd 2px` (document.scrollWidth 392 i 390px-vy) på
**samtliga /admin-flikar, båda teman, endast mobil (390px)** i varje mätning sedan
minst 2026-09-13 (skanning av alla 29 arkiverade granssnitt-*.json: 44 av 88
admin-kombinationer i varje fullkärd rapport). Fyndet ligger under vaktens 6px-fyndtröskel
och räknas därför självt aldrig som fel — men det är dokumenterat i DRIFTSBOKEN som
"2px-admin = normalmönster", och igår 19:17 (granssnitt-2026-09-17T1725) felklassade
cronen 22 kombinationer när **databeroende** innehåll dessutom tryckte ett element förbi
kanten (se §4) — våg 185 bokades i pipelinen på det fyndet.

## 2. Diagnosmetod (fem sonder, node-kanalen, mot localhost:3000 = aktuellt prod-bygge)

Sonderna loggade in på /admin exakt som vakten (ADMIN_PASSWORD ur
.env.production.local lästes I skriptet, aldrig loggat) och mätte med puppeteer-core
+ /usr/bin/google-chrome i 390×844, tema light:

| Sond | Fråga | Resultat |
|---|---|---|
| 1 | Vilka element sticker ut per flik? | Tabbraden (w-max 2 200px) + blogg-URL-chip — men båda inuti scrollcontainrar |
| 2 | Vad driver body.scrollWidth=392? | `body.sw=392`, minX av bodyns barn = **−2** |
| 3 | Råa offenders med DOM-sökväg | `div.-mx-4.overflow-x-auto.px-4` = **l=−2, bredd=394, höger=392** |
| 4 | Förfaderkedjans mått | Kedjan som ger −2/394 (se tabell nedan) |
| 5 | Vem äger blogg-chipen? | ActivityRow i admin-skalet → **syskonet s8-u3:s objekt** (redan kurerat, se §4) |

**Kedjemätning (sond 4, FÖRE):**

```
div.-mx-4.overflow-x-auto.px-4.pb-1  l=−2  v=394  pad=0 14px 4px  mar=0 −16px  ovx=auto
div.flex.flex-col.gap-2.mt-8         l=14  v=362  pad=0             mar=32 0 0
div.mx-auto.max-w-7xl.px-4.py-8      l=0   v=390  pad=32px 14px
div.paper-texture.min-h-screen       l=0   v=390
body                                 sw=392 cw=390
```

## 3. ROTORSAKEN

`src/app/globals.css` (MEGA MOBILE OPTIMIZATION, @media ≤640px) omdefinierar
`.px-4 { padding: 0.875rem }` = **14px** ("Smaller padding on mobile to fit more
content") — men `-mx-4` behåller Tailwind-basen **−16px**. Våg 104:s tabbradsutbrytning
`-mx-4 … px-4` i `src/app/(huvud)/admin/page.tsx` antog symmetri (16=16) som inte
finns på mobil: marginalen −16px mot padding 14px ⇒ **2px spill per sida** ⇒
scrollcontainern landar på (−2, 392) ⇒ body.scrollWidth 392 ⇒ vaktens eviga 2px.
Asymmetrin är strukturell och datamässigt konstant — därför 2px i ALLA rapporter,
till skillnad från §4:s databeroende del.

**Kollisionskoll:** `-mx-4 … px-4` är den ENDASTE px-4-parade utbrytningen i src
(grep: övriga `-mx-1 px-1` är symmetriska — override rör bara px-4/py-*). En enda rad ägs
av felet.

## 4. Gräns mot syskonet s8-u3 (duplikat undveket)

Våg 185:s bokning hade två delar: 2px-överflödet (konstant) + "1 element utanför
viewport" (databeroende). Syskonet **s8-u3 (commit 37071551, 2026-09-18 01:32)**
levererade redan den databeroende halvan: ActivityRow-spanen `shrink-0` med lång
blogg-slug vägrade krympa (→ `min-w-0 truncate` + rotkommentar, rad ~974). Denna våg
(s8-u1) rör **endast rad 475** (tabbradens klass + kommentar) — noll överlapp i diffen,
verifierat mot syskonets commit-stat innan edit. Sond 1:s "blogg-URL-chip utanför"
mot localhost var gamla prod-bygget som ännu inte bär s8-u3:s fix (deployad HEAD
55ab4795 < 37071551) — korrekt gränsdragning, inget dubbelarbete.

## 5. KUREN (en rad + dokumentation av kopplingen)

```diff
- <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
+ <div className="-mx-[0.875rem] overflow-x-auto px-4 pb-1 [scrollbar-width:thin] sm:mx-0 sm:px-0">
```

plus kommentar vid raden som dokumenterar kopplingen till globals.css-override:n
(constraint koden inte kan visa: marginalen MASTE följa mobil-paddingens rem-värde).
Aritmetik: förälder `max-w-7xl px-4` (390, padding 14) ⇒ innehåll (14, 376) ⇒
barn med −14px marginal ⇒ **(0, 390)** exakt — inget spill, `sm:`-grenen oförändrad
(≥640px: override av, mx-0 som förut). Fliknavets funktionella kontrakt orört:
fortfarande horisontell scroll (overflow-x-auto), tryckytor ≥44px, whitespace-nowrap.

**KVD:** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär,
deterministisk kanal). INGET bygge — prod-synken äger (stoppregel).

## 6. EFTER-bevis (bokas, utförs efter nästa deploy)

1. `node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000 --sidor=/admin`
   ⇒ förväntan: alla admin-kombinationer `överflöd 0px` (idag 2px × 44).
2. Kedjesonden (behållen som `verktyg/_s8u1-strippmatning.mjs`) ⇒ förväntan:
   tabbraden `l=0 v=390 hö=390`, body.scrollWidth 390.
3. Cron-vaktens nästa fulla rop (17 1,7,13,19) intygar samma på prod.

## 7. Lärdom (bokförd för framtida vågor)

Globala spacing-overrides bryter Tailwinds kontrakt `px-N ⇔ -mx-N`. innan en
utbrytarmarginal paras med en padding-klass: mät den beräknade paddingen på målbrytpunkten
(sådan sond finns nu i trädet), eller para med samma godtyckliga värde som paddingen.
"Normalmönster"-statusen i DRIFTSBOKEN (2px-admin) bör strykas när EFTER visar 0.

— fabriksagent s8-u1, spår 8, 2026-09-18
