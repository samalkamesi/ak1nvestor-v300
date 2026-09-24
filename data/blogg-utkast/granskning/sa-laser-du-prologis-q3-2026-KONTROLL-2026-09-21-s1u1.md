# KONTROLL 2026-09-21 (s1u1) — Prologis Q3-paketet: källor, siffror, juridik (2007:528), 911-referenser

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-prologis-q3-2026.json` (byggt 2026-09-20, fabrik s4; rapported 2026-10-15)
**Granskare:** agentfabrik auto-s1-1790012730031 s1-u1 (2026-09-21)
**Dom: FLYTTKLAR EFTER FEM SMÅ RÄTTNINGAR** — samtliga verkställda i paketfilen; inget blockerande fynd.

## Pivot-bokföring (uppdragets objekt var redan levererat)

Uppdraget sa "m9-utkast #1". Kontroll före start: m9-familjen (6 filer, 7 DB-rader) är **komplett levererad** — boerspsykologi-fallstugor (m9-1) har KONTROLL 2026-09-16 + 2026-09-20-s1u1 + FLYTTKLART-PAKET 2026-09-20; övriga fem syskon likaså (sammanställningens m9-sektion: "SAMTLIGA granskade FLYTTKLARA, familjen komplett 2026-09-19"). Duplikat = förlorat arbete; spårets pivotpresedens gäller (Ericsson-pivoten 2026-09-21, nike-pivoten före den).

**Nästa icke-levererade objekt valdes på rappdagsordning** (spårets kundnytta: tidigast rapport = tidigast publicerbar): maskinell matchning av alla 78 bolagspaket mot granskningsmappen visade 12 djupgranskade (asml, sandvik, handelsbanken, nike, ericsson, hm-b, holmen, industrivarden, jpmorgan, nordea, skf-b, volvo-car). Bland de övriga har **Prologis tidigaste rappdagen (2026-10-15)** — före investor-ab (10-16), wihlborgs/getinge/fabege (10-20), iberdrola/alphabet/eli-lilly/sap (10-21). r146:s ytprov (11:38 idag) nådde bara radverb/disclaimer/källmarkörer/struktur — ingen siffer- eller källgranskning.

## Källkontroller

| Källa | Kontroll | Utfall |
|---|---|---|
| Universumraden PLD (bolagsunivers.json, hämtad 2026-09-03) | 20 fält jämförda ordagrant | **ALLA EXAKTA**: pris 136,59 · börsvärde 132,778 · P/E 30,421 · P/B 2,375 · EV/EBIT 40,242 · PEG 121,59 · fcfYield 4,07 · brutto 75,55 · EBIT-marg 43,03 · netto 43,58 · fcf-marg 55,99 · ROE 7,75 · ROIC 4,53 · skuld/EK 0,6382 · TTM 12,3 % · prognos 2,25 % · insiderköp 11 · NAV-proxy 57,52 · golv-marginal −1,3749 (= "137,5 % över") · serier tomma |
| Dubbelkällan | not-fält i raden | MarketStack "eod/latest dubbelkoll av pris/PE/PB/marknadsvärde (slutkurs 2026-09-02)" ✓ — textens dubbelkällspåstående är radens eget not-fält |
| ROIC-proxy | radens not | "EBIT före skatt / (skuld + bokfört EK)" ✓ — textens parentes är ordagrant |
| Kalender-fastighet.json | PLD-post | "2026-10-15 (konferenssamtal kl 09:00 PDT; resultat väntas före börsöppning samma dag)" ✓; IR-bokningens titel matchar |
| Tidszonen | 09:00 PDT → svensk tid | PDT=UTC−7, CEST=UTC+2 ⇒ 18:00 ✓ |
| Grannkalendrar | Öresund/Tesla/Balder/Catena/Diös/Billerud/PowerCell/Investor | Öresund 10-09 ✓ · Tesla 10-21 ✓ · Balder+Catena+Diös 10-23 ✓ ("på 23 oktober") · Billerud+PowerCell 10-22 ✓ ("20 oktober och framåt") · Investor 10-16 ✓ inkl. Inderes-noten ordagrant |
| Urvalsdogmernas underlag | Öresund/Investor i universumfilen | Öresund: serier.ar = 4 spridda år (2013/2014/2018/2019), resultat [0,0,0,0], EK tomt ✓ = textens "icke-kontinuerliga … resultatraden noll i samtliga, eget kapital tomt" · Investor: marknadsKapitalMdr = null ✓ = "universumraden saknar börsvärde" |
| Anspråksfil | data/vakten/auto-s4-1789886103053-s4-u1-ansprak.md | finns på disk ✓ |
| Externa källdomäner | curl | ir.prologis.com **200** · pressreleaselänken **403 mot curl** (bot-skydd, ej död länk — utkastet anger sökverifiering 2026-09-20; mänsklig åtkomst OK) |
| Vågvalideringsnot | PLD utanför 12-tickeruniversumet | stämmer: ingen analysfil, inget dom-underlag — paketet redovisar luckan ärligt (ABB-presedens) |

## Sifferkontroller (alla egna omräknade)

**Aritmetik — 34 kontroller, samtliga exakta:**

- Identitetstest 1: 2,375 ÷ 0,0775 = 30,645; differens mot 30,421 = 0,736 % ≈ **0,74 %** ✓; omvänt 30,421 × 0,0775 = 2,358 ✓
- Kvartalskedjan: 0,82+1,49+1,05+1,13 = **4,49** ✓; 136,59 ÷ 4,49 = 30,42 ✓; 132,778 md ÷ 136,59 ≈ **972 M aktier** ✓; 4,49 ÷ 57,52 = **7,80 %** ✓ (glapp 0,6–0,7 % mot ROE 7,75 — textens "samma 0,7-procentsglapp" aritm. försvarbart)
- NAV-kvot: 136,59 ÷ 57,52 = **2,375** ✓ = P/B-fältet
- PEG: 30,421 ÷ 2,25 = **13,52** ✓; källans 121,59 implierar 30,421 ÷ 121,59 = **0,25 %** ✓
- EV-kedja: 132,778 + 35,0 = **167,8** ✓; ÷ 40,242 = **4,17** ✓; ÷ 0,4303 = **9,7** ✓ (och kedjan lämnas öppen — universumraden saknar kassafält, ärligt deklarerat)
- Scenariorutan: 9/9 celler omräknade exakta (8 526/8 790/9 054 × 42,03/43,03/44,03 %); räknesatser 87,9≈88 ✓, 113,5≈113 ✓, 113,5÷87,9 = 1,29≈**1,3** ✓; marginalvikt 1÷(3×0,4303) = 0,775≈**0,77** ✓
- Övning C: mittpunkter 4,475/6,26 ✓; 136,59÷4,475 = 30,5 ✓; ÷6,26 = 21,8 ✓; (30,5−21,8)÷30,5 = 28,5≈**29 %** ✓; 4,28÷6,26 = 68,4≈**68 %** ✓; 4,28÷4,475 = 95,5≈**96 %** ✓
- Promenaden: 1,05+1,13 = **2,18** ✓; 1,50+1,63 = **3,13** ✓; 4,475−2,18 = 2,295≈**2,29** ✓; 6,26−3,13 = **3,13** ✓; helårskontroll 2025: 0,63+0,61+0,82+1,49 = 3,55 ≈ 3,56 ✓
- Medianavvikelser: P/E +111,6≈**112 %** ✓ · P/B +151,0≈**151 %** ✓ · EV/EBIT +61,7≈**62 %** ✓ · FCF 4,67−4,07 = **0,60 pp** ✓ · ROE 8,51−7,75 = **0,76≈0,8 pp** ✓
- Övrigt: 4,28÷136,59 = 3,134≈**3,13 %** ✓ · 35,0÷132,778 = 26,4 % ≈ "en fjärdedel" ✓ · 2,375→"2,4 gånger" ✓ · 62 M ft² × 0,092903 = 5,76≈**5,8 M m²** ✓ · 1,46−1,44 = "två cent" ✓ · 2,16 < 2,43 ("konsensus under Q2") ✓

**Branschmedianer — alla verifierade mot universumfilen** (17 fastighetsbolag: 11 europeiska varav 9 svenska + 6 USA-REIT ✓): P/E 14,380 (n 17) ✓ · P/B 0,946 (n 17) ✓ · EV/EBIT 24,894 (n 17) ✓ · PEG 4,16 (n 11) ✓ · ROE 8,51 (n 16) ✓ · FCF 4,67 (n 13) ✓ — se dock NOT N2 om konventionen.

**USA-REIT-jämförelsen**: Realty 1,37 · PLD 2,375 · Equinix 7,04 · Public Storage 10,91 · Simon 15,03 · American Tower 21,79 — sex värden exakta ✓; "näst billigast av sex" ✓. **PEG-universumet**: 121,59 = högsta ✓ (näst högst 55,33 ✓ — gapet robust). Grannar: Wallenstam P/B 0,798≈0,80 ✓ · Equinix EV/EBIT 52,49 ✓.

## Juridik (2007:528) — GRÖN

- Disclaimern: "pedagogisk finansutbildning enligt lagen (2007:528) 2 kap 5 § — inte investeringsrådgivning … Inga köp-, sälj- eller hållningsrekommendationer förekommer" — lagrum och paragraf korrekta, ingen lagrumsblandning i texten.
- Inledningens dubbelnegation "inte en rekommendation att köpa, sälja eller behålla" ✓; övningssektionen "ett begrepp att förstå, inte en måttstock att döma utfallet med" + "aldrig en handelssignal" ✓.
- Rådverbssökning (köp/sälj/rekommendera/bör du/råder dig/…): **0 icke-negerade träffar** — alla funna "köp/sälj" är deskriptiva (insiderköp, fastighetsförsäljningar) eller negationer i disclaimern.
- **Varumärkesgrind (varumarke.json, 26 regler på titel+desc+varje kroppsrad): 0 FEL, 0 VARNING.**
- REIT-fakta ("minst 90 % av beskattningsbar inkomst ska delas ut") är korrekt framställt som utbildningsfact om bolagsformen.

## 911-referenser — GRÖN

Fem mönster ("911", "9/11", "11 september", "september 11", "nine-eleven") mot titel+description+body: **0 träffar**.

## Struktur — GRÖN

- **readingMinutes 5 KORREKT** mot plattformskontraktet (src/lib/blogg-utkast.ts:122,194 — ORD_PER_MINUT=600, round): 2 703 ord (titel+ingress+body) ÷ 600 = 4,505 → 5. (Kalibrerad mot nike/ericsson-syskonen; ingen B2-korrektion behövs — sällsynt i serien.)
- publishedAt 2026-10-15 = rappdagen, seriekonvention bland kvartalspaketen (nike 09-30, ericsson 10-13) ✓ — publicering förblir kundens beslut (R2).
- **13/13 interna länkar = HTTP 200** mot localhost (pb, pe, ev-ebit, peg, fcf-avkastning, netto-marginal, roe, roic, skuldsattning, omsattningstillvaxt-ttm, prognos-tillvaxt, universumjamforelse, vardering).
- Titellängd 158 tkn — inom seriens familjestil (nike 192, ericsson 81).

## FYND — fem rättningar (samtliga verkställda i paketfilen)

| # | Klass | Fynd | Verkställning |
|---|---|---|---|
| F1 | faktafel (siffra mot egen data) | "fyra procentenheter från direktavkastningen" — 4,07 − 3,13 = **0,94 pp**, inte fyra | → "knappt en procentenhet över direktavkastningen" |
| F2 | faktafel (siffra mot egen data) | "nästan tolv procentenheter över nettomarginalen" — 55,99 − 43,58 = **12,41 pp** = drygt tolv, inte nästan (förekom i body OCH description) | → "drygt tolv procentenheter" (båda ytorna) |
| F3 | texttekniskt | mjukt bindestreck U+00AD i "medi­anerna" — osynligt men bryter sök/skaläsning | → "medianerna" |
| F4/F5 | källbrist | "American Towers 98-procentspayout" bärs av inget fält i paketets källor (universumradens utdelningsfält bär inte payout-relationen) | → "kollegor med payout nära hela den bokförda vinsten" (källsäkert: REIT-tvånget är redan belagt i texten) |

Inga blockerande fynd (nike-A-klass). F1/F2 är samma Systematik-klass som seriens B2-fynd: påstådda differenser i löptext som inte omräknats mot de egna talen.

## NOT (icke blockande, inga verkställningsposter)

- **N1 — källan har rört sig:** universumet växte 225→249 den 2026-09-21 (git: DSY+CAP, AI.PA, RMS/BN/RI, BARC/NWG/LLOY; PEG-värden 185→206, median 1,26→1,25). Textens "av 185 bolag med PEG-värde" och källradens "(225 bolag…)" är tidsstämplade 2026-09-20 och sanna mot det läget; kärpåståendet (121,59 = universumets högsta, näst högst 55,33) består mot dagens fil. Rekommendation vid publicering: behåll tidsstämpeln (paketet är fruset vid tillverkningen) — ingen omskrivning krävs.
- **N2 — mediankonvention:** paketet räknar median som mittersta värdet vid jämnt n (ROE 8,51 n 16 · USA-median 7,04 n 6) och exkluderar negativa avkastningsvärden (FCF 4,67 n 13). Konventionen är okonventionell (standard: medel av två mittersta; hade gett USA-median 8,98 och "74 % under") men **internt konsekvent genom hela paketet** och verifierad korrekt mot filen under konventionen. Förslag till serieägaren: en metodnot i kalldelen vid publicering.
- **N3 — seriebokföring:** "61 levererade paket / seriens 62:a" är byggarens räkning fryst 2026-09-20; inte mekaniskt verifierbar från mappen (78 sa-laser-du-filer varav många ogranskade). Lämnas som byggarens påstående.
- **N4 — pressreleaselänken** ger 403 mot curl (bot-skydd) — se källtabellen; ej död länk.

## Leverans

- `sa-laser-du-prologis-q3-2026-FLYTTKLART-PAKET-2026-09-21.json` — publicerbar JSON med F1–F5 verkställda; md5 `2fd5e0b872b6fded6619e47bfcb48624` (original `664e019dfe54f7001096580f04ace03c`); ord 2 709 → readingMinutes 5 består; publishedAt 2026-10-15 (seriekonvention; publicering = kundens beslut, R2).
- `sa-laser-du-prologis-q3-2026-diff-2026-09-21-s1u1.json` — fem byt-poster, samtliga strängar verifierade unika i originalfilen; utkast-JSON:en orörd av granskaren.

**KVD:** endast nya filer i data/blogg-utkast/granskning/ + worklog-rad — data-only, inget bygge, src/ orörd (tsc-baslinjen orörd), R2 orörd (ingen publicering, inga priser), data/blogg/ orörd, utkastet orört.
