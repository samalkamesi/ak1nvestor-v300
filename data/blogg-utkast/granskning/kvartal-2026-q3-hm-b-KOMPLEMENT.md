# Komplementgranskning: H&M-paketet Q3 2026 (sa-laser-du-hm-b-q3-2026)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik **s1-u2** (spår 1 — granskningskön, manifest auto-s1-1789469123143)
**Komplement till:** `kvartal-2026-q3-hm-b.md` (s1-u3, samma dag 12:59) — syskonets rapport är **huvuddokumentet**; detta komplement tillför tre fynd som saknas där samt en oberoende replikation av syskonets fynd.

**Kollisionsredovisning (ärlig):** s1-u3 och s1-u2 valde oberoende samma objekt — båda följde promptens regel "nästa icke levererade objekt i spåret" och båda prioriterade H&M för rappdagens skull (2026-09-24, säsongens tidigaste). Dubbelarbetet är dokumenterat, inte dolt; värdet av det är den oberoende replikationen nedan (två agenter, separata hämtningar och omräkningar, samma slutsatser) och de tre nya fynden. Lärdomen till huvudagenten är känd sedan s10-u3:s fabrikkollisionsfynd: unika objekt per manifest-uppgift.

## Sammanfattning

**3 nya fynd: 1 medel (exportblockerande i systemflödet) · 2 låga. Diff-poster D5–D6 i [kvartal-2026-q3-hm-b-KOMPLEMENT-diff.json](./kvartal-2026-q3-hm-b-KOMPLEMENT-diff.json)** — verkställs i samma pass som s1-u3:s sex poster. Efter A1–A3 (syskonet) + D5 (detta komplement) är paketet flyttklart; publicering förblir kundens beslut (R2).

---

## K1 (MEDEL — exportblockerande i systemflödet): disclaimern triggar kontrolleraText-FEL

Slutraden i bodyn lyder: "…inte investeringsrådgivning (lagen 2007:528). **Inga köp- eller säljrekommendationer lämnas.** Utkast i granskningskön: publicering är kundens beslut."

Formuleringen är juridiskt korrekt och negerad — men den **triggar systemets egen förbjudenfras-grind**:

- `data/varumarke.json` förbjudna fraser bär mönstret `\b(köp|sälj)[\s\-–]*rekommendation\w*` med allvar **FEL** (motiv P2/MAR).
- `kontrolleraText` (src/lib/varumarke.ts:148–159) kör mönstret **utan kontextnegation** — negationsundantaget finns inbakat ENDAST i "investeringsråd"-regexen (dess lookbehind för inte/ej/aldrig/ingen/…). "säljrekommendationer" i "Inga köp- eller **säljrekommendationer** lämnas" ger alltså **1 FEL** (bevis: granskarens spegelkörning av kontrolleraText-logiken mot titel+description+body: FEL 1, träff "säljrekommendationer").
- Konsekvensen i flödet: `exporteraKlarPost` (src/lib/blogg-utkast.ts:520–528) kastar `BloggValideringsFel("Export nekas — 0 FEL krärs (våg 66-grinden)…")` vid varje FEL, och statusbyte utkast→granskad kräver samma 0 FEL (rad 404). **Paketet nekas alltså export/ påteckning i nuvarande skick — även efter s1-u3:s rättningar A1–A3.** Syskonets slutsats "därefter är paketet FLYTTKLART" gäller först när även detta är löst.
- Jämförelse: systemets standarddisclaimer (SIGNATUR.disclaimer) lyder "Pedagogisk analys — inte investeringsråd" och de publicerade m9-posternas slutsatz innehåller inte tillägget — formuleringen är paketbyggarens improvisation.
- **Rättning D5** (testad mot mönstret: 0 träffar): "Inga rekommendationer om köp eller försäljning lämnas." — bytet ersätter hela slutraden och löser samtidigt K3 nedan.
- **Separat förslag till huvudagenten (gemensam yta — EJ verkställt av mig):** ge köp/sälj-mönstret i `data/varumarke.json` samma negationslookbehind som investeringsråd-mönstret bär, så att negerad standardformulering ("Inga köp- eller säljrekommendationer lämnas") är gångbar i alla framtida utkast. Det är den rotor-lix som gör D5:onödig som textändring — men ändringen rör varumärkesgrunden (speglas i src/lib/varumarke.ts + kvalitetsvakten) och lämnas därmed till ägaren av den ytan.

## K2 (LÅG): "kl 08:00" i description utan försiktighetsmarkör

Description-fältet öppnar "H&M rapporterar 24 september **kl 08:00** — säsongens tidigaste rappdag…". Granskarens egen hämtning av H&M:s finansiella kalender (hmgroup.com, 2026-09-15) visar att webbsidan anger **endast datum** — inga klockslag för rapporterna. Källraden i repots kalender-konsument.json (samma ursprung) skriver "ca 08:00 CEST". Bodyn har "cirka kl 08:00" ✓ — description saknar markören. **Rättning D6:** "24 september ca kl 08:00".

## K3 (LÅG): kö-lägesmening i publiceringsbar body

"Utkast i granskningskön: publicering är kundens beslut" står i bodyns slutrad. Det är korrekt information **i granskningskön**, men den får inte följa med ut i `data/blogg/` — på sajten skulle meningen tala om för besökaren att de läser ett utkast som aldrig blev godkänt. Publicerad text ska inte bära sin egen kö-metadata (samma princip som m9-flödets kvitto-avsnitt som ska tas bort före export). **Löses av D5-bytet** av hela slutraden.

---

## Oberoende replikation av s1-u3:s fynd och kontroller

Genomfört med separata hämtningar/omräkningar (webbhämtningar från hmgroup.com 2026-09-15; node-omräkningar mot `data/portfolj-system/bolagsunivers.json`, `data/analyses/HM-B.ST.json`, `data/analyses/INDU-C.ST.json`, samtliga tio branschkalendrarna; länktest mot localhost:3000):

| Område | Resultat | Samsyn med s1-u3 |
|---|---|---|
| A1 scenariotabellen | **Bekräftad** — 58,7275 × 9,6 % = 5,64 ⇒ cellen ska vara 5,6 (icke 6,4); övriga 8 celler exakta | ✓ |
| A2 marginalobservation | **Bekräftad** — +1 %-enhet ≈ 0,57 mdr mot +3 % omsättning ≈ 0,15 mdr ⇒ ~4×, ej "lika mycket" | ✓ |
| A3 Indutride → Industrivärden | **Bekräftad** — INDU-C.ST.json: company "AB Industrivärden (publ)"; kalender-industri.json 2026-10-07 med två källor; 2 förekomster i texten | ✓ |
| B1 100 → 103 bolag | **Bekräftad** — 103 rader (energi 13); alla 16 medianer + 8 HM-värden omräknade exakt på 103-filen | ✓ |
| Q2/sexmånader (12 tal) | **Bekräftad** — samtliga exakta mot hmgroup.com; därutöver: "drygt 3 %" = −3,33 % ✓, EPS 2,49/2,48 ✓ | ✓ |
| Jämförelsebas Q3 2025 | **Bekräftad** — 57 017 (59 011), 4 914 (3 507), 8,6 % (5,9), 3 212; −3,38 % SEK / +2 % lokalt / ~5 pp | ✓ |
| Vågdata (12 påståenden) | **Bekräftad** — inkl. signalmatrisen cellräknad (16/5/4 ur matris25) och pos52 0,843 ⇒ 84 % | ✓ |
| Kalender + veckodagar | **Bekräftad** + tillägg: **28 jan 2027 är också torsdag**; inget biblioteksbolag rapporterar mellan 24 sep och 7 okt (tiovägs kalenderkontroll) | ✓ |
| 14 interna länkar | **Bekräftad** — 14/14 HTTP 200 mot localhost:3000 | ✓ |
| "elva bolag" | **Bekräftad** — exakt 11 filer i data/analyses/ | ✓ |
| Juridik 2007:528 | **Bekräftad ren** med ett undantag som syskonet inte hade: kontrolleraText-träffen i disclaimern (K1 ovan); därutöver: lagrumssökning ger ENDAST 2007:528 — ingen lagrumsblandning | delvis |
| "911-referenser" | **Bekräftad** — 0 träffar i texten (sökning efter "911"); ingen "11 september"-hänvisning finns; datumkonsekvens i övrigt hel (publishedAt 2026-09-23 = D−1, "hämtad 2026-09-15" = granskningsdagen) | ✓ |
| PREC-målkurs ej syndikerad | **Verifierad** — 194,30 presenteras som 52v-spannets topp (priceLevels), aldrig som priceTarget/rekommendation | ✓ (tillägg) |

**Replikationens slutsats:** s1-u3:s fynd A1–A3, B1 och samtliga gröna kontroller håller vid oberoende omräkning — bedömningen EFTER RÄTTNING står, med tillägget att D5 är villkoret för att exportvägen alls ska släppa paketet igenom.

## Nästa steg

1. Verkställ s1-u3:s sex poster (A1–A3, B1, C2) + detta komplements D5 (blockerande i flödet) och D6 (rekommenderad) — båda diff-filerna är byggda för samma pass, söksträngarna är verifierade unika i filen (även sinsemellan).
2. Rotorsaksförslag till huvudagenten (se K1): negationslookbehond i varumarke.json:s köp/sälj-mönster — huvudagentens yta, föreslaget här.
3. Därefter: paketet väntar kundens publiceringsbeslut (R2), helst före rappdagen 2026-09-24.
4. Syskonpaketen Volvo Car (rappdag 2026-10-23) och Ericsson (2026-10-15) återstår i granskningskön — nästa våg väljer dem före nya objekt.

*Granskningskvitto: helt oberoende andra genomläsning av samma objekt (kollision med s1-u3 redovisad); tre egna fynd varav ett exportblockerande med kodbevis; diff med 2 poster (1 blockerande, 1 rekommenderad) levererad som ny fil — inga originalfiler ändrade av granskaren. src/ orörd (tsc ej aktuellt).*
