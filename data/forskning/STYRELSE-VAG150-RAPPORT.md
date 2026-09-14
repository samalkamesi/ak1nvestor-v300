# STYRELSE-RAPPORT VÅG 150 — dataset-aspekter fas A: kontraktsavvägning + URL-inventarie

**Fas A-rapport (u6) · 2026-09-14 · organ Θ (dokumentation) · ägare: fabrikens u6-agent, slutledet = huvudagenten**
**Källor:** `src/lib/dataset-aspekter-kontrakt.ts`, `src/lib/dataset-medianer.ts` (filhuvud), `data/forskning/sokord/bransch-teman.md` (S7), `data/forskning/PIPELINE-KO.md` (våg 150-raderna), `data/forskning/SOKORDSINVENTERING-2026.md` (spår B2), modulerna i `src/lib/dataset-aspekter/`, KVD-rapporter i `data/vakten/agentfabrik/utdata/v150-dataset-aspekter-u{1,2,3}.log`, räknesond mot `data/portfolj-system/bolagsunivers.json` (u6:s egen verifiering).

---

## 1. BESLUTET — fas A nu, fas B väntar medveten omprövning (ej glömt)

**Fas A = kontraktssäkra teman** och är vad våg 150 levererar: 15 aspekter
(12 nyckeltal + sverige/usa + värderingshub), 100 % byggda på publika
marknadsnyckeltal ur `bolagsunivers.json` med n-redovisning. Kontraktet
(`src/lib/dataset-aspekter-kontrakt.ts`, våg 150) definierar gränsen i
filhuvudet: *"PUBLIKT: median/kvartiler/min/max av PUBLIKA marknadsnyckeltal
per bransch (eller land×bransch) med n-redovisning"*. Samma princip som
`dataset-medianer.ts` (våg 97/98), vars filhuvud lyder: *"Gränsen dras vid
poänglagen: inget som bär AKM-poäng (även som median) är publikt."*

**Fas B = teman som bär modellpoäng** och är MEDVETET parkerade:

| Tema (bransch-teman §4) | Innehåll som kolliderar | Sidor |
|---|---|---|
| 2 — AKM2-profil `/dataset/[bransch]/akm2` | akm2, akm2Skillnad, akm2Moduler ur korstabellen | 10 |
| 3 — Kategoriprofil `/dataset/[bransch]/[kategori]` | `akm1PerKategori` (7 kategoripoäng × 100 bolag) | 70 |
| 5 — Lägesbild `/dataset/[bransch]/lagesbild` | `fvagDynamik` + `fvagPerHorisont` (vågklasser) | ~10–15 |

Alla tre skulle publicera AKM-poäng och vågklasser på den programmatiska
dataset-ytan. Kontraktets filhuvud är explicit: *"ALDRIG i utdata: AKM-poäng
(AKM1/AKM2/kategoripoäng), vågklasser, fvag-fält, status, golv, portV19 —
och INGA bolagsnamn eller tickers"* och om just fas B: *"Tema 2/3/5 i
underlaget … publicerar modellpoäng och vågklasser på dataset-ytan och VÄNTAR
därför på A2-DATASET-KONTRAKT-omprövning — INGEN modul här får bära sådan
data."*

**Status för omprövningen:** parkerad och bokförd — PIPELINE-KO våg 152-rad:
*"fas B av dataset-teman (AKM-poäng-ytor) väntar fortfarande A2-omprövning"*.
Argumentationen vid omprövningen bör skilja på **redigerat innehåll** och
**automatgenererade ytor**: månadsserien `data/blogg/branschmedianer-akm2.json`
publicerar redan AKM2-medianer som GRANSKAD bloggpost (m9-spåret), medan
A2-kontraktet styr den programmatiska namnrymden där ingen redaktör ser
utdata före publicering. Beslutet om fas B är styrelsens (R1), med R2-risk
(juridik) — inte huvudagentens vardagsbeslut.

---

## 2. URL-INVENTARIE — 10 branscher × 15 aspekter = 150 teoretiska, **130 publiceras**

Gränsregeln (kontraktet `MIN_MATTA = 5`): sidor med matta < 5 exkluderas av
SLUTLEDETS register (modulerna räknar alltid ärligt och gissar aldrig).
Utfallen nedan är hämtade ur modulernas KVD-rapporter (u1–u3) respektive,
för u4 som ännu inte levererat, ur u6:s egen räknesond på rådata.

| Modul (uppgift) | Aspekt-slugs | Teoretiskt | Fallna (gränsregel) | Publiceras |
|---|---|---|---|---|
| nyckeltal-a.ts (u1, commit 87a688cb) | roe, roic, netto-marginal, brutto-marginal, ev-ebit, peg | 60 | 1 — roic/finans matta 0 (finansbolagens ROIC medvetet osatt) | **59** |
| nyckeltal-b.ts (u2, commit f047801c) | fcf-avkastning, egenkapitalmultipl, skuldsattning, omsattning-cagr-5ar, prognos-tillvaxt, resultat-cagr-5ar | 60 | 4 — fcf-avkastning/finans n=3 · skuldsattning/finans n=0 · resultat-cagr-5ar/finans n=4 · resultat-cagr-5ar/tillvaxt n=4 | **56** |
| land.ts (u3, commit 7fb22348) | sverige, usa | 20 | 15 — se tabell nedan | **5** |
| vardering.ts (u4, PÅGÅR — siffran räknad ur rådata) | vardering | 10 | 0 — P/E-matta per bransch: energi 10, fastighet 10, finans 10, halso 9, industri 10, kommunikation 8, konsument 9, material 9, teknik 10, tillvaxt 7 (alla ≥ 5) | **10** |
| **Summa fas A** | **15 slugs** | **150** | **20** | **130** |

Land-aspekternas fem publicerade (huvutmått P/E, MIN_MATTA=5):
`sverige/fastighet` (9 mätta), `sverige/industri` (8), `sverige/finans` (7),
`usa/tillvaxt` (6), `usa/kommunikation` (5 — exakt på gränsen, publiceras).

**Två ärlighetsnoteringar att bokföra:**
1. S7:s tema 4-skattning "~15–18 landssidor" byggde på bolagsantal, inte
   mätta värden — verkligheten blev 5/20. Rätt korrigering, inga nya sidor
   borde ha publicerats under gränsen.
2. Finans är den stora fallaren (4 av 15 aspekter faller just i finans:
   roic, fcf-avkastning, skuldsattning, resultat-cagr-5ar) eftersom banker
   och investmentbolag saknar dessa mått i universumet. Det är data-ärlighet,
   inte fel — och ett pedagogiskt ämne i sig ("varför banknyckeltal räknas
   annorlunda"). Gränspasset `resultat-cagr-5ar/kommunikation` (n=5 exakt)
   publiceras enligt regeln ≥ 5.

**Realistiskt publicerat antal för slutledet: 130 URL:er** (87 % av de
teoretiska 150). Sitemap bör exakt spegla registret — inte de teoretiska 150.

---

## 3. Juridikflaggorna (bransch-teman §6) — mekanik och placering

### 3.1 PREC-ST: osynligt genom kontraktets källrestriktion (flagga 1)

`data/stocks/PREC-ST/` innehåller rådata med `"recommendation": "FÖRSIKTIGT
KÖP (villkorat, spekulativt)"`, `recommendationScale: 2` och `priceTarget:
"Base: 1,40 SEK (+63 %)"` — köprekommendation + kursmål = investeringsrådgivning
(2007:528) om det når en publik sida. **Mekaniken som gör det riskfritt i våg 150
är strukturell, i tre lager:**

1. **Källrestriktion:** `lasAspektUniversum()` läser EN enda fil — `data/
   portfolj-system/bolagsunivers.json`. Ingen modul har en kodväg som öppnar
   `data/stocks/**`; kontraktets filhuvud förbjuder det uttryckligen och
   land.ts följer samma mönster med sitt eget publika utsnitt av samma fil.
2. **Typsnittsgränsvakt:** `AspektUniversumRad` (och land.ts:s
   `DatasetUniversumRad` + land) är strukturella utsnitt med ENBAST publika
   fält — recommendation/priceTarget finns inte i typen, "det finns inget sätt
   att nå det från denna modul" (dataset-medianer.ts:s formulering).
3. **Mekaniskt vitt test:** u5:s `verktyg/testa-dataset-aspekter.mjs` (omgång
   2, pågår) asserterar att JSON-utdata från VARJE modul × 10 branscher varken
   innehåller strängarna `FÖRSIKTIGT KÖP`, `priceTarget`, `recommendation`,
   `kursmål`, `AKM` eller något av de 100 bolagsnamnen/tickrarna.

Så länge inget framtida slutled läser data/stocks/** är flaggan mekaniskt
stängd — inte bara disciplinärt.

### 3.2 Omskrivningstabellen (varumarke.json:s 27 förbjudna fraser — de sex temanära)

| Förbjuden lockformulering | Juridik-säker ersättning (använd i fas A) |
|---|---|
| "bästa/köpvärda aktier inom [bransch]" | "så jämför du bolag inom [bransch]" |
| "aktietips", "köp-/säljrekommendation" | "pedagogisk analys med redovisad metodik" |
| "garanterad/riskfri avkastning" | "forskningsunderlag" / "riskmätt" |
| "[bransch] att investera i just nu" | "[bransch]ens nyckeltal — median och spridning" |
| "slå index varje år" | "redovisad, reproducerbar metodik" |
| "säker vinst" | "forskningsunderlag med redovisad risk" |

Fas A:s titelmönster "[X] inom [Bransch] — median, spridning och hur du läser
det" är redan omskrivningarnas anda; u2:s KVD körs även varningskontroll på
"köp "/"sälj "/"billig" i textfälten (u5 permanentar den).

### 3.3 Disclaimerns placering — VYN, alltså slutledets ansvar

Kontraktet: *"Disclaimern trycks av VYN ('Pedagogisk analys — inte
investeringsråd.') på varje sida — därför finns den inte i datatypen."*
Alltså: **ingen modul bär disclaimern och ingen JSON innehåller den — om
slutledets page.tsx glömmer den finns den INGENSTANS.** Rutten måste trycka
den synligt på varje aspektsida (båda teman, mobil + dator — KVD §7 punkt 4).

### 3.4 Utdelningsstemat-särregeln (flagga 2)

Utdelningsdata saknas helt i universumet (0/100) och sökordsinstinkten
"utdelningsaktier inom [bransch]" riskerar att bli råd UTAN datounderlag.
Fas A:s lösning är u2:s `fcf-avkastning` ("utdelningstemat, rätt gjort"):
kassaflödesavkastningen som råmaterial, med uttrycklig text om att
plattformen saknar utdelningsdata och därför visar kassaflödet — plus
internlänkar till utdelningskurserna. Direktutdelnings-data-insamling är en
egen framtida våg (R2-berörd ny datakälla enligt SOKORDSINVENTERINGEN §6.5).

---

## 4. INTERNLÄNKNING (tema 8) — mekanik + vilka kurser som toppar

**Mekaniken** (`hittaKurslankar(sokord, max=4)` i kontraktet): sökorden
matchas som delsträngar (skiftlägesokänsligt) mot `data/llms-fragor.json`
(333 frågor, kategori + frågetext); poäng = termträffar × 1000 + frågans egna
sökpoäng; tie-break på sökväg i svensk kollation; unika URL:ar; länktext =
frågetexten ("den pedagogiska frågan är länktext"); max 4 länkar. u1 noterade
änhetligheten: ROIC saknar egen fråga — LÖNSAMHET-kategorin + "kapital" ger
de närmaste kurserna (motorn är deterministisk, aldrig tom på gissningar).

**Toppkurser per aspektfamilj** (u6:s sond mot llms-fragor.json 2026-09-14,
samma algoritm som kontraktet):
- Värderingshub (['multipel','värdering','p/e','ev/ebit','peg']):
  vm-03-multipelval (164p), km-010-evebit (160p), v06-ev-ebitda (162p),
  km-027-pegratio (158p) — S7:s förutsägelse om topp100-frågor slår in, med
  km-010 + km-027 som bonus.
- ROE (['roe','avkastning','eget kapital']): v09-roe (156p), km-054-ranta,
  km-005-eget-kapital-utdelningar, km-016-sharpe-kvot.
- FCF/utdelning (['utdelning','kassaflöde']): km-007-dcf (154p),
  km-050-utdelningsskatt-30, ud-01-payout-ratio, ud-04-utdelningsfallor.
- Skuld (['skuld','soliditet','risk']): rk-03-skuldfalla, v19-
  kapitalforbranning, v10-skuldsattningsgrad (142p), km-015-beta-capm.
- Land (['svenska aktier','nyckeltal','jämföra']): **ENDAST 2 träffar** —
  se fyndet nedan.

**FYND (måste åtgärdas före vit-testet):** land.ts ger bara 2 kurslänkar
(mk-11-kinaekonomin 96p, km-058-valutor 70p) — under kontraktets 3–5 och
under u5:s planerade assertion `kurslankar.length >= 3`, dvs. vit-testet KOMMER
att faila på land.ts i nuvarande skick. Sond bevisar att bredare sökord
`['svenska aktier','nyckeltal','jämföra','aktier','balansräkning']` ger 4
pedagogiskt rimliga träffar (Kina-ekonomin, valutor, ränta, eget
kapital/utdelningar). **Rekommendation:** en liten justerings-commit av
sökorden i land.ts (3 rader, tsc 0) i slutledets första steg. Även §7 punkt
5:s "+ /forskningsbiblioteket" uppfylls enklast av VYN: en statisk länk till
/forskningsbiblioteket i aspektsidans sidfot.

---

## 5. KVD-CHECKLISTAN §7 — punkt för punkt

| # | Krav | Status i fas A |
|---|---|---|
| 1 | Gränsregeln implementerad (< 5 mätta ⇒ ingen sida, ingen påhittad median) | **KLAR i modulerna** (u1–u3 räknar ärlig matta; utfallen rapporterade, se §2). **Exkluderingen görs av SLUTLEDET** i generateStaticParams (matta >= MIN_MATTA). |
| 2 | PREC.ST-fälten exkluderade i generatorn (vitt test) | **KLAR strukturellt** (källrestriktion + typsnitt, §3.1). **u5:s vit-test mekaniserar den permanent** — körs i omgång 2, resultat rapporteras i dess log. |
| 3 | Kvalitetsvakten körd mot nya sidmönster — 0 fynd | **SLUTLEDET**: efter bygg, `verktyg/granssnittsvakt.mjs --bas=http://localhost:3000` tills GRÖN (båda teman × mobil/dator). |
| 4 | Disclaimer + "inte investeringsråd" på varje genererad sida | **SLUTLEDET** (vyn trycker den — finns ingenstans i data, se §3.3). |
| 5 | Internlänkar 3–5 kurser per sida (+ forskningsbiblioteket) | **KLAR för nyckeltalsmodulerna** (3–5 st). **FYND: land.ts 2 st** — fixa sökorden (§4) före vit-testet; /forskningsbiblioteket-länk i vyn. |
| 6 | m9-regeln (granskningskö) för autoinnehåll | **KLAR per design**: dataset-sidor med ren medianvisning omfattas ej — sidorna tas inte in i bloggflödet i fas A. |

---

## 6. SLUTLED-PLANEN för huvudagenten (ETT bygg, ägandeföljden)

0. **Läs in omgång 2:** `data/vakten/agentfabrik/status/v150-dataset-aspekter.json`
   tills u4 (vardering.ts) + u5 (vit-test) är klara — u4:s gränsutfall är
   förutsagt 10/10 (§2), u5 bör vara grönt EFTER steg 1.
1. **land.ts-kurslänksfix:** sökorden → `["svenska aktier","nyckeltal",
   "jämföra","aktier","balansräkning"]` → ger 4 träffar. Liten commit, tsc 0.
2. **Register:** `src/lib/dataset-aspekter/index.ts` — samlar `aspekter` ur
   nyckeltal-a + nyckeltal-b + land + vardering till en modulmap
   (aspekt-slug → AspektModule). Delas av rutten och sitemap så att filtret
   räknas EN gång.
3. **Route-fil:** `src/app/(huvud)/dataset/[bransch]/[aspekt]/page.tsx` —
   våg 97-mönstret: `export const dynamic = "force-static"`,
   `dynamicParams = false`, ISR 24 h, `notFound()` när `generera()` returnerar
   null. `generateStaticParams`: branschSlugs × modulslugs → generera() →
   behåll endast `matta >= MIN_MATTA` (**130 URL:er, exkludera de 20 fallna**).
   Vyn renderar: H1 + metadata (title = titel, description = beskrivning),
   ingress, statistikblock (median/p25/p75/min/max + "n = X bolag"),
   matTabell (land + hub), saRaknas (ol), saLaserDu (ul), fellerAttUndvika,
   kurslankar (länktext = titel), **disclaimern "Pedagogisk analys — inte
   investeringsråd."** + /forskningsbiblioteket-länk i sidfoten.
4. **Sitemap-koppling:** `src/app/sitemap.ts` lägger till registrets 130
   URL:er (samma matta-filter via registret — aldrig hårdkodat 150).
5. **Bygg under LÅS (ETT bygg):** `npx tsc --noEmit` = 0 → commit → `exec
   flock -n /tmp/ak1a-deploy.lock bash -c 'cd /home/ak1a/AK1 && npm ci
   --no-audit --no-fund && npm run build && pm2 restart ak1a'` (lås upptaget
   ⇒ vänta 3 min; misslyckas bygget ⇒ `git revert HEAD` + bygg om).
6. **Vaktkörning:** gränsnittsvakten mot `--bas=http://localhost:3000` tills
   0 fynd (WCAG, överflöd, klipp text — 130 nya sidor × 2 teman × mobil/dator).
7. **LEVERANS-KVD (beviskrav):**
   - u5-vit-testet grönt (0 fel) mot SAMTLIGA moduler × 10 branscher.
   - Stickprov URL:er: 200 = `/dataset/teknik/peg`,
     `/dataset/teknik/vardering`, `/dataset/finans/roe`,
     `/dataset/fastighet/sverige`, `/dataset/kommunikation/usa`;
     404 (gränsregeln bevisad) = `/dataset/finans/roic`,
     `/dataset/finans/skuldsattning`, `/dataset/energi/sverige`,
     `/dataset/teknik/finns-ej`.
   - Sitemap innehåller exakt 130 nya URL:er; `https://lab.ak1nvestor.com/` = 200.
8. **Bokföring:** worklog-rapportsrad + PIPELINE-KO: våg 150 → LEVERERAT med
   KVD-bevisen; **fas B-påminnelsen kvarstår** (våg 152-rad: A2-omprövning).

---

## Sammanfattning en rad

Fas A levererar 130 kontraktssäkra aspekt-URL:er (av 150 teoretiska — 20
faller ärligt på gränsregeln, främst finans- och landskombinationer), fas B
(~90–95 AKM-poäng-bärande sidor, tema 2/3/5) väntar medvetet på
A2-DATASET-KONTRAKT-omprövning enligt §1, och slutledet har en färdig plan:
land-fix → register → force-static-rutt med matta-filtret → sitemap → ETT
bygg under flock → vakten GRÖN → LEVERANS-KVD.

*Dokument: våg 150 u6 · organ Θ · källor citerade per avsnitt.*
