# Granskning: Bankaktier — så analyserar du banker (m9-branschguide 2/3) + DUBBETTDOM

**Objekt:** `data/blogg-utkast/sa-analyserar-du-bankaktier.json` (UTKAST v1, 2026-09-15, registrerad i GRANSKNINGSKO-SAMMANSTALLNING.md)
**Granskad av:** fabrik auto-s1-u2 (2026-09-15)
**Bedömning: FLYTTKLAR EFTER RÄTTNING — 1 precisionsrättning (C1) + 3 förslag (D-poster).** Inga blockerande fynd; siffrorna, juridiken, länkarna och de externa referenserna håller.

## Dublettdomen (läs detta först)

Samma dag finns **två** bankaktierguider i utkastmappen:

| Fil | Registrerad i kön | Vinkel | Bedömning |
|---|---|---|---|
| `sa-analyserar-du-bankaktier.json` (denna) | JA (sammanställningens branschguide-rad) | Bankens mekanik: spegelvända balansräkningen, P/B + ROE med identitetsbevis, räntecykeln med ÄKTA dataserie, 90-talskrisen, kapitaltäckning, checklista | Flyttklar efter 1 rättning |
| `bankaktier-sa-analyserar-du-banker-och-finansbolag.json` | NEJ | Komplementvinkel: räkneexempel i påhittad bank, investmentbolagsfällan, finansgruppens medianer | EJ flyttklar — 3 rättningar; se egen rapport |

Trolig orsak: två byggagenter fick samma "välj själv"-uppdrag (känt fabriksfenomen, jfr fabrik­kollission bevis nr 2, commit 640daa80). **Dom:** båda texterna är oberoende skrivna med olika vinkel — ingen är en kopia av den andra, och innehållet kompletterar snarare än duplicerar (överlapp: P/E = P/B ÷ ROE, som båda bär). Rekommendation: behåll denna fil som huvudguide och fil 2 som komplement (H&M-KOMPLEMENT-mönstret) — men valet om EN eller BÅDA publiceras är kundens (R2). Ingen av filerna har raderats; granskaren skriver inte om andras filer.

## Metod

Samma protokoll som m9-branschguide 1/3 (fastighetsaktier): varje tal i texten slaget upp mot källfilen `data/portfolj-system/bolagsunivers.json` (109 bolag, hämtad 2026-09-03) med egna node-sonder; härledda serier omräknade från rådata; externa påståenden kontrollerade mot etablerad historia; juridik via `verktyg/juridikgrind-vakt.mjs` (mekanisk 2007:528-scanner) + manuell läsning; interna länkar mot `http://localhost:3000` (loopback); "911"-strängsökning i body + metadata.

## Fynd C — precisionsrättningar (verkställningsbara, ej blockerande)

**C1 — "P/B saknas i källdatan" är osant mot källfilen (Nordea-raden).**
Texten: "Nordea: ROE 15,3 procent, P/E 13,0 (P/B saknas i källdatan — talet utelämnas, det gissas inte)".
Faktum: källfilen HAR `vardering.pb = 21,537` för Nordea Bank Abp — ett uppenbart källfel (övriga storbanker ligger 1,6–2,1; inget financierat bolag i filen är i närheten). **Beslutet att inte trycka talet är RÄTT — men motiveringen är fel:** en granskare (eller kund) som slår upp källan hittar ett värde och tror att texten ljuger. Rättning (exakt strängbyte i diff-filen): formulera om till att fältet bär ett uppenbart felaktigt värde och därför utelämnas. Detta är också ett källtäthetsfynd värt en not till dataägaren: Nordeas P/B i bolagsunivers.json bör märkas eller åtgärdas vid nästa universumsuppdatering.

## Fynd D — förslag (kräver beslut, ej blockerande)

**D1 — redovisa härledningen av nettomarginalserien.** Räntecykelstyckets tal ("Handelsbanken från 46,8 till 41,8 procent, SEB från 47,5 till 40,4 och Nordea från 42,0 till 41,2 — medan Swedbank är undantaget (46,7 mot 47,7)") är EXAKTA men härledda: resultat ÷ omsättning per år ur `serier` (2023 → 2025). Fältet `lonksamhet.nettoMarginal` bär andra (aktuella TTM-) värden. Förslaget är en ordagrant tillsats "I universumets seriedata (resultat ÷ omsättning per år) syns det direkt" i stället för "I universumets data syns det direkt" — så nästa granskare inte behöver härleda metoden (jag gjorde det; det tog en sond).

**D2 — källraden Riksbanken får djuplänk** (styrräntesidan, 200-verifierad 2026-09-15 av denna granskning): stärker spårbarheten för textens tyngsta externa påstående (0 → 4 %). Övriga tre källor (Finansinspektionen, BIS, Nasdaq) lämnas på toppnivå — djuplänkar ej verifierade här.

**D3 — `publishedAt` är skapandedatum** — vid eventuell flytt till data/blogg/ stämplas publiceringsdagen (publicering = kundens beslut, R2; exportvägen sköter det automatiskt).

## Juridik (lagen 2007:528): REN

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-15: **0 fynd på denna fil** (rådsförbud, grund och tvärfall alla gröna).
- **Utbildningsramen genomgående**: "Alla bankexempel är räkneexempel och verkliga nyckeltal ur vårt bolagsuniversum — pedagogik om metoden, inte vägledning om enskilda aktier" (ingress) + negerad disclaimer-sista-rad ("_Detta är pedagogisk finansanalys, inte investeringsråd._").
- **Bolagsnämningar endast deskriptiva**: storbankerna förekommer som dataurdrag med källdatum (2026-09-03, verifierad 2026-09-15) — ingen uppmaning, ingen kursprognos, inga måltal. Tolkningarna är marknadsbeskrivande ("marknaden bedömer", "marknaden ifrågasätter").
- 90-talskrisen och penningtvättsärendet skrivs som historisk utbildning ("läxan gratis", "visade att efterlevnadsrisk kan slå hårt") — inga nuvarande anklagelser, inga bolagsomdömen.

## 911-referenser

Mekanisk sökning efter "911" i body + metadata: **0 träffar.** Inget att åtgärda.

## Sifferkontroll — tretton kontroller, alla GRÖNA utom C1:s formulering

| Påstående i texten | Källvärde (bolagsunivers.json) | Dom |
|---|---|---|
| Swedbank ROE 15,0 % | lonksamhet.roe = 0,1502 | ✓ |
| Swedbank P/B 2,07 ("2,1" i listan) | vardering.pb = 2,066 | ✓ |
| Swedbank P/E 13,8 | vardering.pe = 13,79 | ✓ |
| Identiteten 2,07 ÷ 0,150 ≈ 13,8 | 13,80 mot fältets 13,79 | ✓ (avrundningskonsistent) |
| Nordea ROE 15,3 % / P/E 13,0 | 0,1534 / 12,976 | ✓ |
| Nordea "P/B saknas i källdatan" | pb = 21,537 FINNS (uppenbart källfel) | ✗ formulering — fynd C1 |
| SEB ROE 14,1 / P/B 1,9 / P/E 14,4 | 0,1408 / 1,945 / 14,371 | ✓ |
| Handelsbanken ROE 12,8 / P/B 1,6 / P/E 12,4 | 0,1275 / 1,596 / 12,414 | ✓ |
| Sammanfattning: ROE 12,8–15,3 %, P/E 12,4–14,4 | intervall över fyra bolag stämmer | ✓ |
| Nettomarginal SHB 46,8 → 41,8 | serier 2023: 46,8 % · 2025: 41,8 % | ✓ (härledd — se D1) |
| Nettomarginal SEB 47,5 → 40,4 | 47,5 % → 40,4 % | ✓ |
| Nettomarginal Nordea 42,0 → 41,2 | 42,0 % → 41,2 % | ✓ |
| Nettomarginal Swedbank 46,7 mot 47,7 (undantaget, stigande) | 46,7 % → 47,7 % | ✓ — "tre av fyra fallande" stämmer |

## Verifieringar — externa referenser (2026-09-15)

| Påstående | Kontroll | Dom |
|---|---|---|
| "Riksbanken höjde styrräntan från noll till fyra procent på under två år, varefter den trappades ned" | Historisk sekvens: 0 % → 4,00 % mellan februari 2021 och augusti 2023 (~18 månader); därefter sänkningar 2024–2025 | ✓ |
| 90-talskrisen: "Nordbanken och Gota hamnade i statlig ägo med statligt stöd — därefter byggdes den svenska tillsynsmodellen upp" | Statens övertagande 1992 av Nordbanken och Gota Bank; sammanslagning 1993; tillsynsreformen földe ur krisen | ✓ |
| "Penningtvättsärendet kring Swedbank 2019" | Offentligt ärende; årtal och formulering korrekta | ✓ |
| Basel III: grundkvot + buffertar; Finansinspektionen fastställer kraven i Sverige; systemriskbuffert för de största bankerna | Korrekt beskrivning av kapitaltäckningsramverket | ✓ |
| Källor med domäner (Riksbanken, Finansinspektionen, BIS, Nasdaq) | Fyra källor angivna; riksbanksdjuplänk 200-verifierad (förslag D2) | ✓ |

## Länkar och struktur — grönt

- **12 unika interna länkar, samtliga HTTP 200** mot `http://localhost:3000` (loopback, 2026-09-15): kurserna bk-01, km-040, km-054, km-056, rk-08, pc-03, st-01, vm-06 och bloggposterna balansräkningen-15-min, skuldsättningsgrad, P/B-talet, ROE, branschmedianer, komplett-guide.
- **Struktur mot plattformskontraktet** (`src/lib/blogg-utkast.ts`): 1 335 ord (titel+ingress+body) ÷ 600 = 2,2 → `readingMinutes: 2` ✓ (filens värde stämmer). Titel, description, pillar "Institutionell metodik", author, tags, negerad disclaimer sist — alla i skick. Sex "##"-rubriker + källavsnitt.

## Flaggor till övriga ägare (ej mina filer)

1. **Till dataägaren av `bolagsunivers.json`:** Nordeas `vardering.pb = 21,537` är ett uppenbart källfel (ingen verifierbar banknoterad P/B i den storleken). Märk eller åtgärda vid nästa universumsuppdatering — C1:t rättar texten, inte källan.
2. **Till ägaren av GRANSKNINGSKO-SAMMANSTALLNING.md:** dublettfilen `bankaktier-sa-analyserar-du-banker-och-finansbolag.json` saknar rad i sammanställningen — kunden ser den inte i kön som den ser ut idag. Rapporten bredvid denna dokumenterar den.

## Nästa steg

1. Ägaren (eller nästa våg) verkställer C1 exakt ur diff-filen och beslutar om D1–D3.
2. Därefter är guiden flyttklar; publicering = kundens beslut (R2) — säg "publicera" så sköter exporten kvitto-städning och datum.
3. Komplementfrågan (EN eller BÅDA bankaktierguider) avgörs av kunden tillsammans med publiceringsbeslutet — se dublettdomen ovan och komplementrapporten `bankaktier-sa-analyserar-du-banker-och-finansbolag.md`.
