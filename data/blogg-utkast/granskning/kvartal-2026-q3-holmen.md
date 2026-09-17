# Granskning: sa-laser-du-holm-q3-2026.json (kvartalsbolagspaket 2026:3 — materialgrenens öppning)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-holm-q3-2026.json` (s4-r3:s nattbygge 2026-09-17 04:12, rappdag 2026-10-22)
**Granskad av:** agentfabrik s1-u3 (omgång auto-s1-1789625727468), 2026-09-17 — oberoende granskning; byggarens KVD-skript oanvänt, alla tal omräknade ur råfilerna
**Dom: FLYTTKLAR EFTER RÄTTNING** — 1 väsentligt fynd (A1: scenariorutans tabell transponerad) + 4 maskinella byten (B2–B5) + 5 beslutsförslag (C1–C5). Publicering väntar kunden (R2).

**Objektsval enligt köregeln:** Uppdragets "m9-utkast #3" var redan levererat 09-16 14:29 (s1-u2:s KONTROLL + korskonfirmation 14:35) — hela m9-serien 6/6 granskningsklar sedan 8448ef77. Systematisk diff granskningsmappen mot utkaststocken: ~18 rotguider + ~21 bolagspaket väntar. Holmen valdes framför FIFO-rotguider och tidigaste-rappdag-paketet (NP3 10-16, syskonens troliga val) dels för minimerad kollisionsrisk (anspråk skriven FÖRE arbetet, 06:20 UTC), dels därför att paketet bär spårets enda öppna beställning: s4-u1:s OMLEVERANS-NOT om absolutkontrollen ("granskningskön äger frågan") — besvarad i §2 C1 nedan.

---

## 1. Källkontroll — 3/3 källor existerar och bärs korrekt

| Källa | Status |
|---|---|
| `data/portfolj-system/bolagsunivers.json` (144 bolag) | HOLM-B.ST-raden fält för fält exakt: pris 326,60 · mcap 49,132 mdr · P/E 18,824 · P/B 0,907 · ROE 0,048 · ROIC 0,0362 · brutto 45,6 % · EBIT 7,24 % · netto 11,86 % · FCF 3,35 % · skuld/EK 0,1277 · räntetäckning null · insider 0 · återköp null · serier 23 952/22 795/22 759/22 056 och 5 874/3 697/2 861/2 879 Mkr · 4-årsnotisen återspeglad ("fyra år, inte fem") — kontroll A1–A21 |
| `data/blogg-utkast/kvartal/2026-q3/kalender-material.json` (2026-09-15) | Rappdag 10-22 "på morgonen" · Q2 2026-08-20 · Billerud ca 07:00 · Yara 08:00 · Newmont estimat · SCA 30 dagar (från ca 09-23) · Yara stängd från 09-25 · Stora Enso 21 dagar · Boliden 10-29 · SSAB/UPM 10-28 — kontroll F1–F5, G1 |
| `data/rapporter/vagvalidering-SENASTE.json` + `data/analyses/` | HOLM 0 träffar i vågvalideringen (utanför-notisernas presedens håller) · 0 analysfiler i biblioteket ("saknar analysfil" sant) — kontroll H1–H2 |

**Medianerna EGA beräknade ur 144-filen** (inte återberättade från byggaren): material n=14 med P/E-medianen på n=13 (Billerud null) — **Holmens 18,824 är det 7:e sorterade värdet av 13 och därmed medianelementet själv** (sorterad lista utskriven i sondloggen: 8,29 … 18,49, **18,82**, 19,43 … 96,74). P/B 1,396→"1,40" · ROE 7,17→"7,2" · EBIT 11,11→"11,1" · netto 9,34→"9,3" · skuld 0,320 · EV/EBIT 14,37 (n=13) · brutto 33,5. Universum: P/E 21,18 (n=135) · P/B 2,88 (141) · ROE 15,6 % (140) · EBIT 21,2 % (143) · netto 14,7 % (144) · skuld 0,52 (130) — kontroll B1–B12. Skuldkvotens rang: 0,1277 är det minsta av grenens 14 värden ("ingen lägre kvot" maskinellt sant).

## 2. Sifferkontroll — 102 maskinella kontroller (verktyg/_s1u3-holmen-verify.mjs)

Serier och steg: intäktssteg −4,83/−0,16/−3,09 % (−0,158 % korrekt avrundat till −0,16) · resultatsteg −37,06/−22,61/+0,63 % · CAGR −2,711/−21,156 % · härledd nettomarginalserie 24,52 → 16,22 → 12,57 → 13,05 % med fjärde året uppåt · "2 861 → 2 879 i princip plant" ✓ (C1–C6).

Räkneexempel egna omräknade: identitet P/B ÷ ROE = 18,8958 mot P/E 18,824 = **0,38 %** ("första icke-banken i bankzonen" — bankerna 0,3–0,9 %, Iberdrolas 1,9 % som "renaste utanför": Holmen slår den siffran, påståendet håller) · omvänt 18,824 × 0,048 = 0,9036 mot 0,907 · absolutkontroll mot årsserien +10,30 % ("10,3 procent" ✓) med omvänd 2 610 Mkr ✓ och P/E-direkt 17,07→"17,1" ✓ · PEG-triaden 1,735/2,85/3,81 % ✓ · EV-kedjan EK 54,17 · skuld 6,92 · EV 61,09 · EBIT 1 596,9 · EV/EBIT-kedja 38,25 mot fält 34,557 = kvot 1,107 ✓ · kassa-residual 867 Mkr = 0,87 mdr ("0,9" ✓) · FCF 738,9 Mkr → yield 1,50 % mot fält 1,52 ✓ · DuPont i prisform 0,650 ÷ 0,669 = 0,971 ✓ · marginalvikt 1/(3×0,0724) = 4,60 = "seriens nya rekord" ✓ · multiplövning 16,98→"17,0" ✓ · netto-över-EBIT-gap 4,62 pp = 1 019,0 Mkr ✓ (D1–D28).

Kalenderfakta 100 %: sexdubbla rappdagen 22/10 (Swedbank, Essity, Sandvik, Atlas Copco, Castellum, Holmen — samtliga sex i kalenderfilerna) · 14-paketet 20–23/10 med Volvo Car/Group/Saab den 23:e ur deras EGNA paket (23/10 kl 07:00/07:20/07:30; Volvo Group och Saab saknar kalenderposter — se N-notiser) · torsdag ✓ · Yaras identitetsgap 10,2 % ("kring tio procent" ✓) · Billeruds sorteringsfakta (pe null, ROE −0,15 %, ROIC −0,72 %, 4 590→711 Mkr = seriens första/sista år) ✓ (F1–F8, G1–G3).

**FYND A1 (väsentligt) — scenariorutans tabell är TRANSPOSERAD.** Alla nio talen är korrekt beräknade men placerade spegelvänt kring diagonalen: raderna är intäktsnivåer och kolumnerna marginaler, men värdena lagts in kolumnvis. Diagonalen (1 335, 1 597, 1 872) är rätt av symmetri; **sex av nio celler visar fel par** — läsaren som slår upp (Intäkter 21 394; Marginal 7,24 %) får 1 376, korrekt är 1 549. Korrekt matris maskinellt rekonstruerad: `[[1335,1549,1763],[1376,1597,1817],[1418,1645,1872]]`. Byggar-KVD:n kontrollerade värdemängden (alla 9 tal fanns) — inte placeringen. Räknesatserna (221/662 Mkr, kvot 3,0) berörs inte. Rättning: A1 i diff-filen (hela tabellblocket, U+00A0 bevarat).

**FYND B2–B5 (maskinella byten):** B2 stavfelet "handssignal"→"handsignal" · B3 "En tredjedel av branschmedianen" är fel bråkform — 0,1277 ÷ 0,320 = **39,9 % ≈ två femtedelar** (grannens "en fjärdedel av 0,52" = 24,8 % är korrekt) · B4+B5 divisionsformen "326,60 ÷ 18,8 = 17,35" stämmer inte som skriven (18,8 ger 17,37) — slutvärdet 17,35 är rätt, dividenden måste vara 18,824 (två spegelställen: källkritikmeningen + källor-sektionen).

**FYND C1 — s4-u1:s ombeställning BESVARAD:** deras sondering att absolutkontrollen stänger på nettoFÄLTET bekräftas oberoende: P/E × (22 056 × 11,86 % = 2 616 Mkr) = 49,24 mdr mot 49,132 = **+0,22 %**. Utkastet redovisar gapet +10,3 % mot ÅRSSERIEN med TTM som blott hypotes; nettofält-stängningen (kontroll D8) förvandlar hypotesen till bärande förklaring: fältens vinst-värld är nettofältet. Förslag C1 i diff-filen fogar stängningen i absolutkontrollmeningen. Sammanställningens Holmen-rad (s4-r3:s äga) bär samma "gapar +10,3 %; TTM-hypotes"-formulering — flaggas till sammanställningsägaren, ändras inte här.

**FYND C2–C4 (förslag):** C2 title 242 tkn (ericsson-precedensens mobilklipp; förslag 158) · C3 description 576 tkn = seriens längsta (förslag 330 som behåller alla budskap) · C4 "ungefär två procent av EV" — residualen är 1,4 % av kedje-EV 61,1 / 1,8 % av börsvärdet; förslag "knappt två procent av börsvärdet". C5 publishedAt 10-21 = dagen före rappdagen, konsistent med nike/hm-b — R2, kundens beslut.

## 3. Juridikgrind — REN enligt lagen (2007:528)

Rådverb-träffar: "köp "/"sälj" — **samtliga i manuellt verifierade neutrala/nekande kontexter**: (1) ingressen "inte en rekommendation att köpa, sälja eller behålla", (2) "underhåll och skogsköp äter skillnaden" (substans, saknad rådgivningsobjekt), (3) disclaimern "Inga köp-, sälj- eller hållningsrekommendationer", plus fältnamnen återköp/insiderköp. **Lagrum: endast 2007:528 2 kap 5 §** (disclaimern sista rad, maskinellt konstaterad — ingen lagrumsblandning). NAV-pedagogiken genomgående "hur man läser"; övningarnas "träning i metod och ren aritmetik"-ram och scenariorutans "inga prognoser"-gräns uttryckliga. Utbildningsramen hel.

## 4. 911-kontroll — 0 träffar på 6 mönster

"911", "11 september", "september 2001", "9/11", "terror", "Terrordåd" — 0 träffar i hela filen (title, description, body, metadata).

## 5. Interna länkar — 20/20 unika HTTP 200 mot localhost

Alla 20 unika interna målbärande länkar lever mot `http://localhost:3000`: 17 dataset-aspekter (material/pe, pb, ev-ebit, fcf-avkastning, peg, vardering, roe, roic, brutto-marginal, netto-marginal, omsattning-cagr-5ar, resultat-cagr-5ar, omsattningstillvaxt-ttm, prognos-tillvaxt, skuldsattning, universumjamforelse) + /bolag/holm-b-st + /kurser + /transparens + /kallor. 0 markdown-länkar till opublicerade utkast. **Extern:** holmen.com-kalendern svarade HTTP 500 i granskarkanalen — kanalfynd (NIKE-precedensen: IR-sidor nekar botar); kalenderfakta bärs internt av kalender-material.json (hämtad 09-15) — dubbelkolla mot browser-kanalen vid publiceringstillfället.

## 6. Strukturkontrakt

Ord 3 298 (titel+ingress+body) → readingMinutes = max(1, round(3 298/600)) = **5** — filens 5 ✓ (09-15-vintagens systematiska överskridning finns EJ här; s4-r3 levererade rätt från början). 7 H2-rubriker enligt seriemallen · disclaimern sist med exakt lagrum ✓ · 0 mjuka bindestreck · title/description-längder = fynd C2/C3 ovan.

## 7. N-notiser (ingen åtgärd — dokumentation)

- **N1 — källtäckning 23/10-trion:** Volvo Group och Saab saknar poster i kalenderfilerna; deras rappdagar (och klockslag) bärs av egna syskonpaket med officiella källor. Utkastets "14 läspaket"-räkning håller, men källor-sektionen i paketet redovisar inte den kedjan — notis till nästa regenerering.
- **N2 — holmen.com HTTP 500** i node-kanalen (kanalfynd, se §5).
- **N3 — seriepraxis på titel/description-längd** spretar (77–245 tkn): C2/C3 bör avgöras serieenhetligt, inte paketvis.
- **N4 — median-cadans:** medianerna beräknade 2026-09-17 ur 144-filen (utkastet redovisar detta öppet, inklusive att servade dataset-sidor visar äldre medianer till nästa prod-bygge) — korrekt hanterat; universumet har växt under dagen tidigare (126→132→144) och växer vidare.

## 8. Bedömning

**FLYTTKLAR EFTER RÄTTNING.** Verkställ A1 + B2–B5 (sex sök/ersätt-operationer, alla stränger maskinellt verifierade unika i filen), besluta C1–C4 (C1 rekommenderas starkt — den stänger spårets öppna datarättsfråga), C5 = R2. Källor, kalender, juridik, 911, länkar och struktur: gröna. Paketets kärna — medianbolagets tre lägen, identitetstestets bankzons-premiär för en icke-bank, netto-över-EBIT som tredje fall, cykeldecelerationen och marginalviktsrekordet 4,6 — håller helt mot källorna; felen är en tabellplacering, ett stavfel, en bråkform och två divisionsformuleringar.

*Publicering är kundens beslut (R2). Denna granskning flyttar aldrig filen till data/blogg/ och rör aldrig databasen. Originalet ändras av paketets ägare eller nästa våg — inte av granskaren.*
