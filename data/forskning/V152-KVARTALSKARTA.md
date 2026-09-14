# V152 — KVARTALSKARTA: förberedelse av kvartalsrapportsserien (Q3 2026)

**Status:** förberedelse (rond 20–21, 2026-09-14) · **Spår:** evighetskatalogen
spår 4 (kvartalsrapporter) · **Ägare:** molnagenten [organ:Θ]

## Syfte

Q3-2026-rapportsäsongen (svenska bolag ~okt–nov, USA ~nov) är plattformens
största återkommande trafik- och utbildningstillfälle. Serien ska knyta
samman det som redan levererar: /bolag-sidorna (v149, 100 bolag),
dataset-aspekterna (v150, 15 aspekter × branscher) och granskningskö-flödet
(v151, m9-utkast → granskning → kund). Allt formuleras som UTBILDNING
("så läser du X rapport") — aldrig råd (lagen 2007:528, 2 kap 5 §).

## Leveransplan (förslag till styrelsen)

| Fas | Leverans | Underlag | Kanal |
|---|---|---|---|
| 1 (denna våg) | Denna karta + mallstruktur + automationsunderlag | bolagsunivers.json, v150-registry | huvudagenten, datafil |
| 2 | Kalenderinläsning: rapportfönster per bolag (Q3) | bolagens IR- och pressrumssidor | fabrik (uppgift per bolaggrupp) |
| 3 | Mallar per rapportdag: "läsårt-paket" per bolag | fas 2-kalendern + AKM2-nyckeltal | fabrik (10x-mönstret) |
| 4 | Publiceringspaket → granskningskön (v151-mönstret) | fas 3-utkast | fabrik + kund (R2) |

## Mallstruktur per rapportdag (förslag)

Varje "läsårt-paket" (EN per bolag och kvartal) följer fast stomme:

1. **Vad som rapporterades** — siffror ur rapporten (omsättning, rörelse-
   resultat, FCF, utdelning) med källa och enhet. INGEN tolkning i sektion 1.
2. **Så läser du siffrorna** — koppling till AKM2:s dimensioner och de
   nyckeltal som v150-aspektsidorna förklarar (ROE/ROIC/nettomarginal/
   FCF-avkastning/EG/värderingsmultipel) per bolagets bransch.
3. **Vad marknaden vanligtvis tittar på** — pedagogik om förväntningar vs
   utfall (konsensusbegreppet), utan att förutsäga eller rekommendera.
4. **Ordlista & vidareläsning** — länkar till /kurser, ordlistan och bolagets
   /bolag-sida + relevanta aspektsidor.

## Automationsunderlag

- **Datakällor:** bolagsuniversum (data/portfolj-system/bolagsunivers.json,
  100 bolag med bransch) · bolagens egna IR-sidor/pressrum (fas 2 läser
  in rappFÖNSTER, inte siffror — siffror hämtas först när rapporten är
  publicerad av bolaget) · inga betalväggar, inga scrapar bakom login.
- **Flöde:** kalender (fas 2) → mall-utkast per dag (fas 3, fabrik med
  exklusivt filägarskap: data/blogg-utkast/kvartal/<ar>-q<q>/<slug>.json) →
  granskningskö (fas 4, samma rapportformat som v151: FLYTTKLAR/EFTER
  RÄTTNING/UNDERKÄND) → kund beslutar publicering (R2).
- **Belastning:** fas 3 = ~100 utkast under ~6 veckor ≈ 2–4 fabrikstill-
 verkningar per vecka (3 barn/omgång) — väl inom pipeline-max.
- **Återanvändning:** m9-granskningsformatet (v151) och SEO-guide-
  strukturen (SEO-GUIDER-2026-09.md) är mall-grunden; inga nya system.

## Juridik-grind (fast för hela serien)

- Formulering: "så läser du", "så räknar man", "detta är vad bolaget
  rapporterade" — ALDRIG "väntas", "köp", "undvik", målkurs.
- Konsensus nämns endast som pedagogiskt begrepp, aldrig som prognos.
- Källor anges per siffra; ingen automatiserad publicering (R2).

## Öppna beslut (till styrelserond 21)

1. Fas 2-start: direkt (kalenderinläsning kan börja närhelst) eller efter
   v151-slutledet (kö-disziplin i fabriken)?
2. Paketformat: en fil per bolag·kvartal (förslag ovan) eller dagliga
   sammanfattningar per bransch?
3. Språk: sv först (kundens kärna), en/ar i fas 5 (befintliga
   översättningsflödet).

*Filen är förberedelse — inga beslut är tagna förrän styrelsen sammanträder.*
