# GRANSKNING 2026-09-19 — Bilaktier: så analyserar du biltillverkare i omställningen

**Objekt:** `data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json` (äldsta ogranskade rotutkastet, mtime 2026-09-16 08:56)
**Granskad av:** fabrik auto-s1-1789781115807 s1-u1 (agentfabriken), 2026-09-19
**Bedömning: FLYTTKLAR EFTER RÄTTNING — 2 rättningar (B1 superlativ motbevisad, B2 readingMinutes), 3 frivilliga förslag.** I övrigt genomgående grönt: 25 universumstal + 3 tidsserier + räkneexempelens aritmetik exakta, tre externa källor källverifierade mot OICA/IEA, juridiken ren (2007:528), 911-kontroll 0, 13/13 länkar levande.

**Pivot-not (köregeln "duplikat = förlorat arbete"):** uppdraget hette m9-utkast #1, som är
levererat två gånger (09-14 huvudgranskning + 09-16 KONTROLL med exakt uppdragets fyra
punkter: källor/siffror/juridik/911 — FLYTTKLAR 0 fynd). Pivotten är dokumenterad i
`data/vakten/auto-s1-1789781115807-u1-ansprak.md`; detta är samma granskningsstandard
som m9-KONTROLLEN, tillämpad på köns nästa objekt.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen eller publiceringsdatum i produktion.

---

## 1. Källor — universumets rådata (hämtad 2026-09-03)

Utkastet anger "(rådata september 2026)"; källan är `data/portfolj-system/bolagsunivers.json`
(189 rader, källa Yahoo Finance/MarketStack, `hamtat: 2026-09-03` — fyra dagar före utkastets
datum, konsistent med "rådata september 2026"). Varje tal i utkastet mätt mot filen:

| Påstående i utkastet | Källvärde (bolagsunivers.json) | Dom |
|---|---|---|
| Volvo Cars P/E 6,0 | `vardering.pe = 5,957` | ✓ |
| Volvo Cars P/B 0,37 | `vardering.pb = 0,369` | ✓ |
| Volvo Cars EV/EBIT "över 21" | `vardering.evEbit = 21,219` | ✓ |
| Volvo Cars EBIT-marginal 2025 "0,8 procent" | `lonksamhet.ebitMarginal = 0,0084` | ✓ |
| Volvo Cars bruttomarginal 15,6 % | `lonksamhet.bruttoMarginal = 0,1562` | ✓ |
| Tesla P/E 334 | `vardering.pe = 333,654` | ✓ |
| Tesla PEG 4,3 | `vardering.peg = 4,26` | ✓ |
| Tesla bruttomarginal 18,9 % | `lonksamhet.bruttoMarginal = 0,1885` | ✓ |
| Polestar "P/E saknar nämnare" | `vardering.pe = null` (negativt resultat) | ✓ |
| PowerCell bruttomarginal 30,6 % | `lonksamhet.bruttoMarginal = 0,3055` | ✓ |
| PowerCell "positivt kassaflöde" | `lonksamhet.fcfMarginal = +0,1109` | ✓ |
| LVMH bruttomarginal 66 % | `lonksamhet.bruttoMarginal = 0,6636` | ✓ talet — ✗ superlativen (B1) |
| "universumets två vinstgivande biltillverkare" | endast VOLCAR (netto +0,028) och TSLA (+0,037) av ankarna; PSNY −0,77, PCELL är ej biltillverkare | ✓ |
| "mer än tre gånger högre" (LVMH vs biltillverkare) | 66,4/18,9 = 3,5×; 66,4/15,6 = 4,3× | ✓ |
| Polestar kassaräckvidd "cirka 15 månader" | `stabilitet.kassaManaderBurnRate = 15,2` | ✓ EXAKT |

## 2. Tidsserier — fyra räkenskapsår per bolag

| Påstående | Källvärde (serier.resultat/omsattning) | Dom |
|---|---|---|
| Volvo resultat 15,4 mdr kr 2024 | 15 401 Mkr | ✓ |
| Volvo "i princip noll" 2025 | 174 Mkr (0,05 % av omsättningen) | ✓ |
| Tesla 15,0 → 7,1 → 3,8 mdr USD | 14 997 / 7 091 / 3 794 MUSD | ✓ |
| "−53 och −46 procent" | −52,7 % och −46,5 % | ✓ |
| Polestar förlust 2,4 mdr USD 2025 | −2 357 MUSD | ✓ (avrundat) |
| "ungefär 200 miljoner i månaden" | 2 357/12 = 196,4 MUSD/mån | ✓ |
| PowerCell intäkter "245 till 385 miljoner kronor" | 244,691 → 384,958 Mkr (2022→2025) | ✓ |
| PowerCell "förlusten minskande" | −58,2 → −63,0 → −88,0 → −29,5 Mkr | ✓ endast senaste året — C2 |

## 3. Räkneexemplen — aritmetiken genomräknad

Fabriksexemplet (påhittade tal, redan deklarerat): 300 000 × 400 000 = 120 mdr ✓ ·
300 000 × 60 000 = 18 mdr ✓ · 18 − 12 = 6 mdr, EBIT-marginal 6/120 = 5,0 % ✓ ·
volymfall −15 %: 255 000 × 60 000 = 15,3 mdr, resultat 3,3 mdr = −45 % på −15 % volym
(hävstång 3×) ✓ · prisfall −5 %: 300 000 × 40 000 = 12 mdr, resultat 0 ✓.
All aritmetik exakt; deklarationen "påhittade men realistiska tal" upprätthåller
utbildningsramen.

## 4. Externa källor — källverifierade 2026-09-19

| Påstående | Källa | Dom |
|---|---|---|
| Världsproduktion 96,4 M motorfordon 2025, +3,9 % | [OICA](https://oica.net): 92,7 → 96,4 M (+3,9 %); [CEIC](https://www.ceicdata.com) bekräftar | ✓ |
| Kina byggde 34,5 M av 96,4 M | OICA: 34,53 M; kinesiska SCIO: >34 M | ✓ |
| Elbilar "över 21 miljoner" 2025, ">20 procent tillväxt", "var fjärde nybil" | [IEA Global Energy Review 2026](https://www.iea.org/reports/global-energy-review-2026/technology-electric-vehicles): 21 M, >20 % YoY, one in four | ✓ |
| IEA "projekterar cirka 23 miljoner för 2026" | IEA GEVO 2026 / Electrek 2026-05: 23 M väntas 2026 | ✓ |

## 5. Juridik — lagen (2007:528): REN

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-19 (denna granskning): **0 FEL, 0 VARNINGAR
  på denna fil** (filen ligger i vaktens skannade yta `data/blogg-utkast/*.json`).
- Rådglossor (köp/sälj/rekommendera/bör du/målkurs/målpris/undvik): enda "köp"-träffen är
  substantivet i "hushållens näst största **köp** efter bostaden" — kontextverifierad, inget råd.
- Utbildningsgrunden dubbel: tidigt ("Som alltid här: utbildning i metod, aldrig råd om
  enskilda aktier") + disclaimern som sista rad i bodyn ("_Detta är pedagogisk
  finansanalys, inte investeringsråd._").
- Fyra namngivna bolag förekommer — men uteslutande som jämförelseobjekt i metodiken
  ("tre prissättningsvärldar", "nämnaren är värd frågan"), aldrig med hållning eller
  uppmaning; samma mönster som syskonguider som dömts gröna.
- Inget lagrum nämns i texten ⇒ ingen risk för lagrumsblandning (tvärfall-ren).

## 6. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA utkastfilen (body + metadata, JSON som sträng) efter mönstren
"911", "11 september", "september 2001", "9/11", "terror", "Terrordåd" → **0 träffar**.

## 7. Länkar — 13/13 HTTP 200 mot levande sajten (2026-09-19)

km-009-pe · km-010-evebit · peg-multipeln-svagheter-2026 · ps-tal-nar-ar-det-anvandbart ·
v08-ebitda-marginal-analys · v07-bruttomarginal-analys · v12-intaktsstabilitet-analys ·
rk-02-emissionrisk · v19-kapitalforbranning-analys · km-006-kvartalsrapporten ·
hur-vi-analyserade-volvo-cars · se-09-bil · komplett-guide-svensk-aktieanalys-2026 —
samtliga 200 mot `localhost:3000` (loopback).

## 8. Struktur

7 "##"-rubriker ✓ · body 10 019 tecken / 1 376 textrensat ord ✓ · disclaimer sista rad ✓ ·
titel/beskrivning konsekventa med innehållet ✓ · tags (5 st) relevanta ✓.

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| B1 | Rättning | "universumets högsta bruttomarginal, LVMH:s 66 procent" — motbevisad: LVMH ligger på plats 52 av 186 i universumet (66,4 %); toppen håller 100 % (Industrivärden, Oresund, Evolution, Mastercard) och Kambi 98,9 %. Superlativen är objektivt falsk mot källan. | Byt enligt diff B1 (behåller 3×-jämförelsen, stryper superlativen) |
| B2 | Rättning | readingMinutes 2 — 1 376 textrensat ord ger round(1376/200) = 7. Sjätte fallet i klassen (substansrabatt-domen 09-17; halvledar-B1; hälsa-B4; konsumentaktier-B4; försvar-B2). | 2 → 7 |
| C1 | Förslag | "det dubbla mot biltillverkarnas" — exakt 1,96× mot Volvo men 1,62× mot Tesla; pluralen blir oprecis. | Förslag i diff C1 |
| C2 | Förslag | PowerCell "med förlusten minskande" — förlusten VÄXTE 2022→2024 (−58→−88 Mkr) och minskade först 2025 (−30); utan avgränsning antyds en trend som inte finns. | Förslag i diff C2 |
| D1 | Förslag | publishedAt 2026-09-16 är skapandedatum, inte publiceringsdag. | Sätts av exportvägen/vid flytt (R2) |

## Flaggor till ägarna (ej mina filer)

1. **Till -en-ägaren:** spegeln `bilaktier-sa-analyserar-du-biltillverkare-en.json`
   (09-18 04:40, ogranskad) bär sannolikt identiska B1+B2 — RÄTTNINGARNA SPEGLAS VID
   VERKSTÄLLNING (samma mönster som försvarsaktier-KONTROLLENS flagga).
2. **Till sammanställningsägaren:** 30 rotutkast saknar granskning totalt
   (bl.a. alla -en-speglar, krypto-, livsmedels-, medie-, lyx-, logistik-,
   utbildningsaktier) — kön lever.

## Diff-rapport

Maskinellt läsbart kvitto: `bilaktier-sa-analyserar-du-biltillverkare-diff.json`
(samma mapp). Alla "byt"-söksträngar maskinverifierade unika (exakt 1 träff i filen).
Utkastet bär INTE något determinismkvitto (till skillnad från m9-serien) — poster kan
verkställas som sök/ersätt utan att något kvitto bryts. Originalet ändras av guidens
ägare eller nästa våg, aldrig av granskaren.

## Slutsats

**FLYTTKLAR EFTER RÄTTNING.** B1 (superlativ mot universumet) och B2 (readingMinutes)
är två snabba, kirurgiska byten; därefter är guiden källfakta-grön, juridiskt ren och
länkverifierad. När kunden beslutar publicera (R2): verkställ diff-posterna, spegla i
-en.json, sätt publishedAt — sedan flyttklar.
