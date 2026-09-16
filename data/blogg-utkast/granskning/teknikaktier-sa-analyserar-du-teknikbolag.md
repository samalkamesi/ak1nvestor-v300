# Granskning: Teknikaktier — så analyserar du teknikbolag

**Objekt:** `data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag.json` (UTKAST v1, 2026-09-15 20:53, **olistad** i GRANSKNINGSKO-SAMMANSTALLNING.md — branschguider-tabellen har endast ravarubolag + bankaktier)
**Granskad av:** fabrik auto-s1-u2 (2026-09-16)
**Bedömning: FLYTTKLAR EFTER EN RÄTTNING (C1) — D1 rekommenderas starkt, D2–D3 är beslutsfrågor.** Alla fjorton sifferkontroller gröna (universumstal exakta mot korstabell-grund, samtliga räkneexempel omräknade), juridiken ren enligt 2007:528, 18/18 interna länkar levande. Guiden är sjätte branschguiden i serien och den som öppnar teknikdjupet (mjukvara/hårdvara) — inget annat utkast täcker ARR, nettoexpandering, Rule of 40 eller P/S-med-marginal-pedagogiken.

## Fynd C — rättningar (verkställningsbara)

**C1 — `readingMinutes: 3` strider mot plattformskontraktet.**
1 223 ord (titel + body) ÷ 600 (ORD_PER_MINUT, `src/lib/blogg-utkast.ts`) = 2,0 → avrundat **2**. Samma fyndklass som lakemedelsguidens C1, som där flaggades som SYSTEMATISKT ("gäller även ravarubolag + bankaktier-varianten") — detta är **fjärde konstaterade instansen** (lakemedels och ravarubolag har fortfarande 3 i arbetsytan; bankaktier-varianten rättad i granskningsunderlaget). Exportvägen räknar om automatiskt, men kontraktsavvikelsen rättas enklast nu.

## Fynd D — förslag (kräver beslut)

**D1 — "AK1A:s 100-bolagsuniversum" bör heta "korstabellens 100-bolagsuniversum" (med datum).**
Alla universumstal i texten är **exakta** mot `data/portfolj-system/korstabell-grund.json` (skapad 2026-09-03, AKM2-berikad 2026-09-04; teknik = exakt 10 bolag, median 61, spann 37–78). Men den kanoniska universumsfilen `bolagsunivers.json` är numera **115 bolag** och syskonmaterial redovisar 109/115 — possessivet "AK1A:s" utan bestämning kan läsas som den aktuella filen. Den publicerade branschmedianer-guiden använder "korstabellens 100-bolagsuniversum" som term; samma term här gör serien konsekvent. Extra skäl för datering: "högst AKM2-median" vinner med **0,5 poäng** över konsument (61 mot 60,5) — en tät marginal som bör vara ärligt tidsbunden till underlaget.

**D2 — bruttomarginalbandets gränsfall i eget universum förtjänar en notis.**
Texten placerar "molnkommunikationsbolaget Sinch" i mjukvaruvärlden direkt efter meningen om "bruttomarginaler på 70–85 procent". Universumets egna värden avviker dock: **Sinch 18,4 %** (trafikkostnader i CPaaS-modellen äter brutomarginalen), Kambi 98,9 %, Microsoft 67,9 %. Påståendet "typiskt 70–85" är branschkorrekt, men utan notis kan läsaren tillämpa bandet på det namngivna exemplet. Förslag på tilläggsmening i diff-filen.

**D3 — `publishedAt`** är skapandedatum (2026-09-15); vid flytt stämplas publiceringsdagen (R2 — kundens klick). Seriestandard.

## Noter (ingen ändring)

**N1 — juridikgrind-vaktens TVÄRFALL-varning är en falsk positiv.**
Vakten ([VARNING] tvärfall-digitalt-innehall-utan-lagrum) triggas av "mjukvaran och digitala tjänster" — men subjektet är teknikbolagens affärsmodeller, inte AK1A:s konsumenterbjudande, och texten åberopar inga konsumentlagrum alls (2022:260/2022:261/1985:716/2005:59 frånvarande ⇒ ingen verklig lagrumsblandning möjlig). Noterat för vaktdataläggen: tvärfallsregeln kan inte skilja "bolag som säljer digitala tjänster" från "plattformen säljer digitala tjänster".

**N2 — Gartner-länkens direktrespons 403 = bottskydd, inte död länk.**
Talet 6,37 biljoner dollar / +14,2 % 2026 är bekräftat via oberoende bevakning av samma pressrelease (2026-07-27): The Hindu BusinessLine, HPCwire (omtryck), New Indian Express, Channel Dive. Källhänvisningen är korrekt.

**N3 — sanktionsnivåerna korrekta:** GDPR art 83(5) = 20 M€ eller 4 % av global årsomsättning (texten: ✓); DMA = upp till 10 % av världsomspännande omsättning för portvakter (✓). Eur-lex-länkarna svarar 200.

## Juridik (lagen 2007:528): REN

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-16: **0 rådgivningsfynd på denna fil** (endast N1:s falska TVÄRFALL-posiv).
- **Utbildningsramen genomgående**: ingressen "utbildning i metod, aldrig råd om enskilda aktier" + negerad disclaimer-sista-rad (serieidentisk med syskonguiderna).
- **Räkneexemplen är påhittade och omöjliga att förväxla med marknadsdata**: "ett bolag med ARR på 1 000 Mkr", "Bolag med intäkter på 1 000 Mkr" — inga namn kopplade till talen.
- **Bolagsnämningar endast deskriptiva**: Sinch, Logitech, Truecaller, Ericsson, Nokia, ASM International förekommer som universumsurdrag/affärsmodellbeskrivningar utan värdeomdömen.
- Mekanisk verbsökning: 0 träffar på köp/sälj-imperativ/rekommendera/bör du/målkurs/målpris/undvik — samtliga "sälj*-träffar är affärsord (säljer, säljs, säljning, säljmaskin, nyförsäljningen).
- "Tillväxten är värd sin prisbiljett" (Rule of 40) beskriver hur ett mått läses — metodelärande, inte uppmaning.

## 911-referenser

Mekanisk sökning (seriestandard, sex mönster: "911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i body + metadata: **0 träffar på samtliga sex.** Inget att åtgärda.

## Sifferkontroll — fjorton kontroller, samtliga GRÖNA

| Påstående i texten | Kontroll | Dom |
|---|---|---|
| Tekniken högst AKM2-median: 61 poäng av 100 | korstabell-grund: (61+61)/2 = 61; nästa bransch konsument 60,5 | ✓ exakt |
| Spridning 37–78, från Sinch till Logitech | Sinch 37 (lägst), Logitech 78 (högst) av teknikens 10 | ✓ exakt |
| Nettoexpandering: ARR 1 000 Mkr × 110 % = 1 100 Mkr | 1 100,0 | ✓ |
| Rule of 40: 30 % tillväxt + 12 % EBITDA-marginal = 42 | 42,0 | ✓ |
| Stillastående bolag behöver 40 i marginal för summa 40 | 0 + 40 = 40 | ✓ |
| P/S-exempel: 1 000 Mkr × 5 = 5 000 Mkr värde | 5 000,0 | ✓ |
| Nettomarginal 25 % ⇒ vinst 250 Mkr ⇒ implicit P/E 20 | 5 000 ÷ 250 = 20,0 | ✓ |
| Marginal 30 % ⇒ P/E "knappt 17" | 5 000 ÷ 300 = 16,67 | ✓ |
| +20 %/år i två år ⇒ P/S 3,5 vid oförändrad kurs | 5 000 ÷ 1 440 = 3,47 | ✓ |
| 80 % mot 35 % bruttomarginal = "mer än dubbelt" | 2,29× | ✓ |
| GDPR: böter upp till 4 % av global årsomsättning eller 20 M€ | art 83(5) | ✓ |
| DMA: böter upp till 10 % av världsomspännande omsättningen | art 30 | ✓ |
| Gartner: it-spendning 6,37 biljoner dollar 2026, +14,2 % | pressrelease 2026-07-27 + oberoende bevakning (N2) | ✓ |
| Bruttomarginal band mjukvara 70–85 / hårdvara 30–50 ("typiskt") | branschkorrekt; universumavvikelser se D2 | ✓ med not |

## Länkar och struktur

- **18 unika interna länkar, samtliga HTTP 200** mot `http://localhost:3000` (2026-09-16). Alla sex blogg-mål konfirmerade som live-filer i `data/blogg/` (arr-tillvaxt, intaktsdiversifiering, ps-tal, peg-multipeln, komplett-guide — och branschmedianer-akm2, dvs länken går till en publicerad post, inte till utkastet).
- Struktur grönt: sju "##"-rubriker + negerad disclaimer sist; `pillar: Institutionell metodik` seriekonsekvent; `readingMinutes` är enda kontraktsavvikelsen (C1).

## Nästa steg

1. Ägaren (eller nästa våg) verkställer C1 exakt ur diff-filen och beslutar D1–D3 (D1 rekommenderas — serieskillnaden "korstabellens" är redan publicerad norm i branschmedianer-guiden).
2. **Köanteckning åt sammanställningsägaren:** GRANSKNINGSKO-SAMMANSTALLNING.md saknar rader för teknikaktier + syskonguiderna industri/telekom (09-15 20:53–20:58) och mx1-femman (energibolagens-utdelningspolitik, finansbolagens-riskhantering, halsobolagens-lonsamhet, konsumentbolagens-skuldsattning, materialbolagens-tillvaxt, 09-15 23:54) — samma lucka som s1-u1 och s1-u3 flaggat för tidigare objekt.
3. **Publicering = kundens beslut (R2).**
