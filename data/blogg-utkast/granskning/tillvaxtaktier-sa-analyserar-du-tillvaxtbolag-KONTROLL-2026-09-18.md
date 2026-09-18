# KONTROLL 2026-09-18 — tillvaxtaktier-sa-analyserar-du-tillvaxtbolag.json (B8/B10 i branschomgången)

**Granskare:** agentfabrik s1-u2 (manifest auto-s1-1789735501260, 2/3) · anspråk
`data/vakten/auto-s1-1789735501260-u2-ansprak.md` FÖRE arbetet (klaim-protokollet).
**Objekt:** `data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag.json` —
FIFO-nästa olevererade (mtime 09-16 02:21; u1 tog steget före = halvledaraktier 02:20,
deras anspråk utropade uttryckällt "u2 → tillvaxtaktier").
**Pivot:** uppdragsrubrikens "m9-utkast #2" (branschmedianer-akm2) = auto-platshållare
(åttonde omgången med denna pivot enligt syskonbokföring) — m9-ko 6/6 KONTOLL 09-16
och #2 dessutom dubbelbevisat (KONTROLL 07:53 + korskonfirmerande 153-kontrollssond,
worklog ~rad 11503). Duplikat = förlorat arbete.
**Metod:** git-låst vintage + egna omräkningar (peer-kontraktet) + juridikgrind-vakt
+ HTTP-kontroll + mönstersökningar. Sond `.zcode/granskning-s1u2-tillvaxtaktier.mjs`
+ `.zcode/granskning-s1u2-lankar.mjs` (lokala, gitignorerade). Utkast-JSON:n orörd.

## Dom: FLYTTKLAR EFTER EN RÄTTNING (B1) + TRE KURRER (C1–C3) + EN R2-NOTIS (D1)

Publicering förblir kundens beslut (R2). Seriens B1-superlativfelklass (åtta fynd på
sex filer) **träffar inte denna guide** — första branschguiden i omgången utan
universums-superlativ.

---

## 1. KÄLLOR — LÅSTA OCH VERIFIERADE

- **Vintage:** utkastets egen commit **83a5fe10** (2026-09-16 02:22, "bransch 10/10").
  `git diff 83a5fe10 HEAD -- <filen>` = TOM → dagens träd = vintagen (inget glidit).
- **Universumet:** `data/portfolj-system/bolagsunivers.json` vid 83a5fe10 = **120 bolag**.
  Tillväxtbranschen = **exakt 11**: AMD, Kinnevik, Nvidia, PowerCell, Palantir, Polestar,
  Sea, Shopify, Truecaller, Tesla, MercadoLibre → textens "elva bolag" **SANT**; de nio
  namngivna + två onämnda (AMD, Sea) — namngivningsurvalet korrekt beskrivet ("varav"
  exemplen).
- **Hämtdatum:** 10 av 11 bolag hämtade **2026-09-03** (Yahoo Finance + MarketStack
  dubbelkällat per rad), MercadoLibre **2026-09-16** (StockAnalysis) → källradens
  "hämtade september 2026" **SANT**. Branschmedian-länkens "(underlag 2026-09-03)"
  beskriver den PUBLICERADE postens underlag (branschmedianer-akm2 bygger på 09-03) —
  korrekt åtskillnad, ingen konflikt.
- **Kinnevik-utpekningen:** universumet placerar Kinnevik i **tillväxt** ✓ och
  **Industrivärden i industri** ✓ → "samma läxa som Industrivärden i industrilådan"
  **SANT** i guidens egen taxonomi.
- **Källsektionen:** 4 externa rader (Tesla 10-K sec.gov, NVIDIA årsredovisning,
  Truecaller rapporter, Nasdaq bolagslista) är tematiska stöd — inga av guidens tal
  hämtas ur dem; den talbärande källan är universumraden (rad 5). Se C4-nedanför i
  diff (förslag om huvudkälla-markering).

## 2. SIFFROR — 15/15 TALPÅSTÅENDEN EXAKTA, ARITMETIK 12/12 GRÖN

**Branschmedianer (peer-kontraktet: mittersta-par vid jämnt n), egna omräkningar:**

| Påstående i utkastet | Egen omräkning | Dom |
|---|---|---|
| prognostillväxt "cirka 37 procent" (n=10) | 37,24 % (n=10; Kinnevik null) | ✓ EXAKT |
| median-P/E 72,2 (n=8) | 72,17 (n=8; KINV/PCELL/PSNY null) | ✓ EXAKT |
| median-PEG 2,2 (n=8) | 2,17 (n=8; PCELL/PSNY/TRUE null) | ✓ EXAKT |
| ROE 15,1 (n=10) | 15,13 (n=10; PSNY null) | ✓ EXAKT |
| ROIC 14,5 (n=10) | 14,51 (n=10) | ✓ EXAKT |
| bruttomarginal 47,8 (n=11) | 47,75 (n=11, 0 null) | ✓ EXAKT |
| nettomarginal 5,9 (n=11) | 5,91 (n=11) | ✓ EXAKT |
| FCF-marginal 13,8 (n=11) | 13,80 (n=11) | ✓ EXAKT |
| FCF-yield 0,8 (n=11) | 0,77 (n=11) | ✓ EXAKT |

**Universumstal (samma vintage):** P/E **20,52** → "20,5" ✓ · prognostillväxt
**9,93 %** → "9,9" ✓ · ROE **15,34 %** → "15,3" ✓ ("i praktiken exakt universumets 15,3"
med 15,13 mot 15,34 — sant).

**Spridning:** "från 15 till över 100 procent" — MIN MELI 14,6 % (→"15"), MAX AMD
104,2 % ("över 100") ✓. Konsensusskepsis-framställningen korrekt (median 37,2 med
spridning 14,6–104,2).

**Aritmetik 12/12:** räckvidd 1 000÷250 = **4 år** ✓ · 1,37⁵ = 4,826 → "≈4,8" /
"nästan femdubblad" ✓ · 1,185⁵ = 2,337 → "≈2,3" + "mer än fördubblad" ✓ · 1,1⁵ =
1,611 → "1,61" / "61 procent" ✓ · 1,02⁵ = 1,104 → "≈1,10" + "drygt 10 procent" ✓ ·
P/E-fällan 70÷1,30 = 53,8 → "≈54" ✓ · multipelutjämning 1−20/70 = 71,4 % → "cirka
70 procent" ✓ · FCF−netto 13,80−5,91 = **7,9 pp** → "nästan åtta procentenheter" ✓ ·
multipelpremien 72,17÷20,52 = **3,52×** → "tre och en halv gånger" ✓ · tillväxtpremien
37,24÷9,93 = **3,75×** → "nästan fyra gånger" ✓ · "72 kronor per krona i årsvinst" ✓
(P/E 72,2) + "priset per krona i årets kassaflöde är ännu högre" ✓ (1÷0,0077 ≈ 130 > 72)
· PEG-förklaringen "grovt räknat P/E 72 delat med prognostillväxt 37" = 1,94 mot
median-PEG 2,17 — hederligt avstånd redovisat ("grovt") ✓.

**Superlativtest (B1-klassen):** 0 universums-superlativer. Mönsterträffarna är två
oskyldiga ("en enda prognos", "För det första") + branschINTERNA graderingar ("branschens
viktigaste sorteringssteg", "branschens mest kontraintutiva fynd") som aldrig mäts mot
universumet — **första guiden i omgången ren på denna fyndklass**. PEG-fältets kända
konventionsinstabilitet (AZN C1) immun här: texten formulerar själv om till kvot.

## 3. JURIDIK (2007:528) — REN

- **Juridikgrind-vakt** (`verktyg/juridikgrind-vakt.mjs --json`): fynd **0** + grund
  **true** på filen. (Not: `flyttklar: false` är förväntat pre-leverans — flaggan
  följer granskningspostens FLYTTKLAR-dom, som denna commit tillför.)
- Rådord: **1 träff** ("råd") — ingressens "utbildning i metod, **aldrig råd** om
  enskilda aktier" = negerad kontext ✓. Disclaimern sist i bodyn: "_Detta är pedagogisk
  finansanalys, inte investeringsråd._" ✓ signaturform.
- **Lagrum i body: 0** ⇒ lagrumsblandning (AGENTS.md "blanda ALDRIM") omöjlig.
- Köp/sälj/behåll/målkurs/undvik: 0 träffar. Texten håller observationsläget genomgående
  ("Frågan är inte om…", "Räkneexempel på mekaniken").

## 4. 911-REFERENSER — RENA

**0 träffar på 6 mönster** (911 · 11 september · september 2001 · 9/11 · terror ·
onslaught) i title/description/body/tags.

## 5. LÄNKAR — 21/21 INTERNA HTTP 200 + EXTERNA LEVANDE

- **21/21 unika interna** 200 mot `http://localhost:3000` (loopback-whitelistad bas):
  15 kurser + 5 bloggposter + /dataset. **0 länkar mot opublicerade utkast** — alla
  fem bloggmål lever i data/blogg/ live (branschmedianer-akm2 bekräftad publicerad).
- Multiset 23 interna (21 unika): dubbellänkarna v19-kapitalforbranning +
  km-028-reverse-dcf — **MULTISET-identiska med -en-spegeln Ö8** (deras granskningsnot
  "23/23 MULTISET-identiska inkl. dubbellänkarna" korsbekräftad från svenska sidan).
- **Externa 4:** sec.gov Tesla 10-K **200** · nvidia.com **307** (redirect, känd
  acceptklass enligt hmgroup/lvmh-precedensen) · truecaller.com **200** · nasdaq.com
  **200** (ingen bot-blockad denna gång).

## 6. STRUKTUR

- Ord: **1 338 rå / 1 200 textrensat** — SEO-mallens B8-rad "1338" = **EXAKT råord**
  (jfr konsumentaktier B7 där mallraden missade; notis D2 till mallägaren: fastställ
  enhet rå vs textrensat i mallen).
- Rubriker: 8 `##` + ingress · title 46 tkn (inom familjepraxis) · description 155 tkn
  (inom 240) · publishedAt = skapandedatum (D1, R2-notis).
- **FYND B1 — readingMinutes 2 → 6**: 1 200 textrensat ord på 2 minuter = **600
  ord/min** mot publicerad bloggfamiljs-praxis ~ord/200 (konsumentaktier-dom 09-18:
  1 401 ord → rm 7; skuldsättnings-dom: 871 → rm 4). round(1 200÷200) = **6**.
  Fjärde rm-felet i serien och det tredje med underskattning (2→7, 3→4, 2→6) —
  systemflagga till mx/bygg-fabriken: rm SKA beräknas ur ordtalet, aldrig gissas.

## 7. FYND-SAMMANFATTNING

| Id | Klass | Innehåll | Kur |
|---|---|---|---|
| B1 | VÄSENTLIGT | readingMinutes 2 (600 ord/min) | byt till **6** |
| C1 | kurr | "ligger på tvären med universumets median" — siffersant (47,75 mot 47,77!) men tvetydig svenska | "ligger i nivå med universumets median" |
| C2 | kurr | description "kapital**förbrukning**" — guidens term (rubrik, kropp, kärnlänk v19) är "kapital**förbränning**" | byt i description |
| C3 | kurr | tags[2] "kapitalförbrukning" — samma avvikelse | byt i tags |
| C4 | förslag | Källsektionen: universumraden är den talbärande huvudkällan men står sist | markera "huvudkälla för guidens alla medianer och per-bolagstal" |
| D1 | R2-notis | publishedAt 2026-09-16 = skapandedatum | publiceringsdag sätts av kunden vid flytt |

Alla `byt`-strängar maskinvaliderade: gammalt ×1 unikt i filen, nytt frånvarande.

## 8. KÖNOTISER

1. **u3 (syskon i manifestet)**: saasaktier (09-16 08:55) är utropat som ditt steg;
   därefter spel/bil (08:55–08:56) → försvar/detaljhandel/flyg → försäkring/media/
   livsmedel → e-handel/lyx → -en-speglar + kvartalspaket utan granskningsfil.
2. **-en-familjens ägare:** juridikgrind-vakten ger `grund: false` på
   tillvaxtaktier-…-en.json (Ö8) — engelsk disclaimer känns inte igen som
   signatur-grund; modersmålets svenska `grund: true` måtta mot vaktens
   mönsterbibliotek.
3. **Mallägaren (SEO-GUIDER):** fastställ ordtalsenhet (rå vs textrensat) — B7-radens
   1 255 matchade inget av dem, B8-radens 1 338 = rå exakt.
4. **Superlativsystemflaggan** (från mx1#5 + konsumentaktier) upprepas med positiva
   tecken: B8/B10 visar att prompten KAN producera superlativfria guider —
   förebild för kommande branschguider.

## KVD

Endast data/ + worklog = **INGET bygge**; src/ orörd (tsc-baslinjen bärs av
pre-commit-grinden); R2 orörd (priser/tier/publicering; data/blogg/ orörd);
syskonens ytor orörda (u1:s halvledaraktier-pågående arbete, u3:s saasaktier-reservation).
