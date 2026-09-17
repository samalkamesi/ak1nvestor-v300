# Granskning: sa-laser-du-industrivarden-q3-2026.json (kvartalsbolagspaket 2026:3)

**Granskad:** 2026-09-17 · **Granskare:** agentfabrik s1-u2 (omgång auto-s1-1789604126983)
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-industrivarden-q3-2026.json`
**Bedömning: FLYTTKLAR EFTER EN RÄTTNING** (B1 readingMinutes; C1–C4 är förslag som kräver beslut)

**Pivot-notering:** Uppdragets ordagrunda objekt (m9-utkast #2, branschmedianer-akm2) var
redan levererat — kontrollgranskning 2026-09-16 av s1-u1 (commit 390fb61e: "56/56 gröna,
seed återledd, determinismkedjan hel till rådata"); hela m9-serien 6/6 granskningsklar sedan
2026-09-16 14:35 (8448ef77). Köregeln ("nästa icke levererade — duplikat är förlorat
arbete") påbjöd pivot, samma mönster som föregående omgångens syskon (s1-u1 → Ericsson-
paketet 36fa3913, s1-u3 → NIKE-paketet abe20b72). Valet föll på **Industrivärden-paketet =
kvartalsseriens tidigaste återstående ogranskade rappdag (2026-10-07)** — H&M (2026-09-24,
seriens allra tidigaste) granskad 775b6536 + komplement 2dd699b9, NIKE (10-01) abe20b72,
Ericsson (10-15) 36fa3913 — och köns sammanställning utropar den "Bibliotekets nästa
rappdag". Anspråk registrerad före arbete (data/vakten/auto-s1-1789604126983-u2-ansprak.md).

---

## 1. Källkontroll — 4/4 källor existerar och bärs korrekt

| Källa | Fil | Status |
|---|---|---|
| Våganalys (klasser, 25-cell, volatilitet, nivåer) | data/analyses/INDU-C.ST.json (verified 2026-08-24) | Finns; samtliga värden återfinns (se §2) |
| Nyckeltal, kurs, börsvärde | data/portfolj-system/bolagsunivers.json, rad INDU-C.ST (hämtat 2026-09-03; dagens 138-bolagsfil — posten oförändrad) | Finns; samtliga 18 värden återfinns |
| Rapportdatum, redovisningsrytm | kalender-industri.json, INDU-raden (källor hämtade 2026-09-15: årsredovisning 2025 MFN-PDF + pressrum) | Finns; samtliga 5 uppgifter återfinns |
| Vågvalideringsuniversum (12 tickers) | data/rapporter/vagvalidering-SENASTE.md | Finns; INDU 0 träffar i filen = "utanför"-påståendet sant; utkastets 12-namnslista i källsektionen överensstämmer namn för namn |

Källbeskrivningen i utkastet stämmer till punkt och pricka: MarketStack-noten ("saknade
färsk kurs och kunde inte dubbelkolla") är källans egen notering ordagrant ("eod/latest:
ingen färsk data"), ROIC-proxyn beskrivs exakt som källans notering ("EBIT före skatt /
(skuld + bokfört EK)"), ärlighetsraden om serier med hål och saknad räntetäckning speglar
källans notering fält för fält. Utkastets källrad "verifierad 2026-08-24" matchar filens
`verified`-fält.

## 2. Sifferkontroll — 56/56 gröna (egna omräkningar/avrundningar mot källfilerna)

**Vågdata (14):** vågklasser per horisont mikro=basbygge, kort=basbygge, medellång=impulsvåg,
lång=impulsvåg, mega=impulsvåg — exakt mot `waveSummary.perHorisont`. "Impulsvåg på tre av
fem horisonter" ✓. 25-cellernas 15▲/5▼/5— bekräftad med EGEN cellräkning i `matris25`
(15 positiva, 5 negativa, 5 nollor — summa 25 ✓, identisk med källans egen bullet).
"Alla fem fallande cellerna är
volymteorin" ✓ (volym.mikro/kort/medellang/lang/mega = −1 ×5, inga andra negativa).
"Elliots, Fibonacci, Gann och Lucas enhälligt positiva på de tre längsta horisonterna" ✓
(12 celler = 1 på medellång/lång/mega). Volatilitet 19,9 % ✓ (sigmaAr 0,1987 → 19,87).
52v-position 86 % ✓ (pos52 0,855 — korrekt knuten till MÄTDATUM, se N2). "Verifierad
2026-08-24" ✓.

**Prisnivåer (6):** 52v-låg 298,80 (298,8) · Fib 61,8 % 401,18 (401,176) · Fib 38,2 %
464,42 (464,424) · MA200 472,76 (472,7635) · MA50 527,54 (527,536) · 52v-högst 566,80 —
samtliga korrekta avrundningar av filens `priceLevels`.

**Nyckeltal (18):** kurs 534,20 (pris 534,2) · börsvärde "cirka 231 miljarder"
(marknadsKapitalMdr 230,721) · ROE 32,3 % (0,3227) · ROIC 52,2 % (0,5217) ·
FCF-avkastning 17,1 % (fcfYield 0,171) · bruttomarginal 100 % (1) · rörelsemarginal 99,9 %
(0,9988) · nettomarginal 99,3 % (0,9931) · TTM-tillväxt +12,0 % (11,979) · prognostillväxt
osatt (null) · P/B 1,03 (1,029) · P/B-premien "cirka tre procent" (1,029 ⇒ 2,9 %) · P/E 3,7
(3,671 — OBEROENDE korsbekräftad av den live bolagssidans titel "P/E 3,7x") · EV/EBIT 3,6
(3,624) · PEG redovisas ej med motivering (källans fält 5,47 vilar på prognos null — se N1)
· skuld/EK 0,028 · branschklassningen industri · kurs-datum "septemberinsamlingen" (2026-09-03).

**Ärlighetsraden (4):** "femårsserierna bygger på fyra år med hål i" ✓ (serier.ar =
[2020, 2021, 2022, 2024] — 2023 saknas, plus nollvärden i omsättning 2022 och resultat
2024) · "därför redovisas inga CAGR-tal" ✓ (källans absurdaste fält — omsattningCAGR5ar
0,9083 = 90,8 %/år på 657 Mkr-basen 2020 — återges inte, se N4) · räntetäckning ej
beräknelig ✓ (rantaTackning null + källnot) · enkelkällat pris ✓ (MarketStack-noten).

**Kalender (7):** rappdag 7 oktober 2026 ✓ ("rapportfenster": "2026-10-07") · "onsdagen"
✓ (egen dagberäkning: 2026-10-07 = onsdag) · "vecka 41" ✓ (egen ISO-veckoräkning: 41) ·
Q1 10 april ✓ (2026-04-10) · Q2 8 juli ✓ (2026-07-08) · "kalendern anger datum men inte
klockslag" ✓ · källorna "lästa 2026-09-15" ✓ (kalenderfilens hamtdatum).

**Ordning och universum (4):** "efter H&M (24 september)" ✓ (HM-B 2026-09-24 08:00) ·
"Industrivärden nästa rapportdag i ordningen" bland analysbibliotekets 11 bolag ✓ (egen
genomgång: AZN 10-30/november, Evolution ~10-23, Precise ~11-13 — ingen mellan 09-24 och
10-07) · "nästan två veckor före höstens industriomgång" ✓ (första industri-kollegan ABB
10-20 = 13 dygn) · "ingår inte i vågvalideringens tolvbolagsuniversum" ✓ (0 träffar i
data/rapporter/vagvalidering-SENASTE.md; utkastets källuppräkning av tolvan korrekt namn för namn).

**Övningsaritmetik (3):** "ROE på 32 procent och nettomarginalen på 99" ✓ · "50-dagars-
medelvärdet (527,54) nära insamlingskursen (534,20)" ✓ (avvikelse 1,3 %) · spannet
"298,80–566,80" som ram ✓.

## 3. Juridikgrind — REN enligt 2007:528

Genomläsning enligt juridikgrindens snabbkontroll: **två** träffar på
rekommendationsmänniskor, båda i nekande konstruktioner ("Det är inte en rekommendation att
köpa, sälja eller behålla några värdepapper" + slut-raden "Inga köp-, sälj- eller
hållningsrekommendationer förekommer") — exakt nekningskontexten serien kräver. Uppdraget
"räkna fram det själva" och "ingen riktning, ingen signal — bara övning" håller hela paketet
i utbildningsramen; NAV-pedagogikenformulerar konsekvent "hur man läser", aldrig "vad man
bör göra". **Lagrum: endast 2007:528 2 kap 5 §** i sista raden — ingen lagrumsblandning
(varken 2022:260/261, 1985:716, 2005:59 eller LEK åberopas). Sista raden uppfyller
strukturkravet (innehåller "investeringsrådgivning" i nekanse).

## 4. 911-kontroll — 0 träffar på 6 mönster

`911` · `11 september` · `september 11` · `9/11` · `9-11` · `\b2001\b` — noll träffar i
title, description, body och tags. Ren.

## 5. Interna länkar — 16/16 unika HTTP 200 mot localhost (17 förekomster)

Alla 16 unika målväger svarar 200: 13 dataset-aspekter under /dataset/industri/ (roe,
roic, fcf-avkastning, brutto-marginal, netto-marginal, omsattningstillvaxt-ttm,
prognos-tillvaxt, pb, pe, ev-ebit, vardering ×2, skuldsattning, universumjamforelse) +
/bolag/indu-c-st + /kurser + /transparens. Titelstickprov 4/4 relevanta och korrekta:
"P/B inom Industri — median, spridning…" · "AB Industrivärden (publ) (INDU-C) nyckeltal —
P/E 3,7x…" (korsbekräftar samtidigt utkastets P/E) · "Transparens — din data och dina
rättigheter…" · "Industri mot hela universumet…".

## 6. Strukturkontrakt

- Body 12 336 tecken ≥ 800 ✓ · rubriker 6 ≥ 2 ✓ · disclaimer-sista-rad ✓
- **readingMinutes 6 ≠ kontraktets 3** — `src/lib/blogg-utkast.ts` (ORD_PER_MINUT=600,
  Math.max(1, Math.round(ord/600)), helaTexten = titel+ingress+body): egen exakt räkning
  **1 736 ord → 3**. → B1.
- Titel 102 tecken (serie-spann 77–245), description 242 tecken — se C3/C4.
- publishedAt 2026-10-05 (två dagar före rappdagen) — R2-not, se C1.
- Inga externa markdown-länkar i bodyn (källorna redovisas som filvägar i källsektionen) ✓.

## 7. N-notiser (ingen åtgärd — dokumentation)

- **N1 — källans PEG-fält är 5,47 trots prognostillväxt null.** Utkastet redovisar det
  inte och motiverar: "att räkna PEG på osatt grund vore fejkprecision" — korrekt hantering.
  Backstage: implicit tillväxt 3,671 ÷ 5,47 ≈ 0,67 % — samma implicita nolla som SHB-fallet
  (18,54 ⇒ 0,67 %, Swedbank-paketet) — ytterligare en observation i PEG-fältets dokumenterade
  instabilitetsserie (kvotspridning 0,76–8,0, null-fall, okontrollerbara fall).
- **N2 — två prisdatum i paketet, korrekt hanterat men värde att känna:** vågmätningens
  2026-08-24 (kurs då ≈ 527,90 given pos52 0,855) och universumets 2026-09-03 (534,20).
  Räknat på 534,20 vore 52v-positionen 87,8 % — utkastet skriver "vid mätningen" och undviker
  förväxlingen. Framtida paket: pos52 är mätdatusberoende.
- **N3 — ord-räkemetodik:** kön-sammanställningens rad anger "1 666 ord" (body-räkning);
  readingMinutes-kontraktet räknar titel+ingress+body = 1 736. Olika metoder, ingen
  sakdisput — men kontraktet gäller fältet readingMinutes.
- **N4 — CAGR-fällan sedd och undveken:** källans omsattningCAGR5ar = 0,9083 (90,8 %/år)
  är artefakt av håliga serier (657 Mkr-basen 2020, nollåret 2022); utkastet redovisar
  inga CAGR med explicit motivering — seriens renaste exempel på ärlighetsraden i praktiken.
- **N5 — seriebred readingMinutes-flagga (åt kö-ägaren):** av seriens 22 paket matchar
  endast sena 09-16-vintagen kontraktet exakt (Castellum, Iberdrola, NP3, Tele2 = 5/5);
  09-15-vintagen + tidig 09-16 överskrider systematiskt (6–7 mot kontrakt 2–5). Korrigeringen
  fåste alltså hos byggarna efter att granskarna började flagga — de ~14 ännu ogranskade
  paketen i gamla vintagen bär felet kvar och rightas bäst vid respektive granskning
  (samma B-post som här).

## 8. Bedömning

**FLYTTKLAR EFTER EN RÄTTNING.** 56/56 sifferkontroller gröna mot källfilerna i dagens
träd; juridikgrinden ren; 911 ren; 16/16 länkar levande; investmentbolags-pedagogiken
(marginlernan, P/E-fällan, P/B som huvudtal, NAV-mekaniken, dom-universum-notisen) korrekt
och källburen i varje led. B1 är maskinell (readingMinutes 6→3); C1–C4 förslag kräver
beslut (publiceringsdatum = R2; ordningen "tredje format"; SEO-längder på titel/description).
Verkställande sker av paketets ägare eller nästa våg — inte av granskaren. Publicering
förblir kundens beslut (R2). Diff: `kvartal-2026-q3-industrivarden-diff.json` (1 byt +
4 förslag, samtliga strängar maskinellt verifierade unika i filen).
