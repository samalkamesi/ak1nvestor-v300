# Bransch- och dataset-teman för programmatiska long-tail-sidor (våg 138, S7)

**Uppdrag**: Inventera bransch- och dataset-ytorna och föreslå BRANSCHTEMAN för
programmatiska landningssidor — pedagogiskt formulerade, juridiskt säkra
(utbildning, aldrig råd enligt lagen 2007:528).

**Sondad 2026-09-14** med `.zcode/sond-s7-bransch.py` + `.zcode/sond-s7-bransch2.py`
(läser endast, skriver inget i src/). Alla sökvägar och antal nedan är verifierade
mot faktiska filer i arbetsytan.

---

## 1. Inventerade datakällor (sökväg + omfattning)

| Källa | Antal | Innehåll relevant för teman |
|---|---|---|
| `data/blogg/branschmedianer-akm2.json` | 1 post (7,4 kB) | AKM2-median per bransch: 10 grupper, 10/10 mätta var, min/max + ytterlighetsbolag, gränsregel (grupp < 5 mätta redovisas aldrig). Serie "branschmedianer" (månadsutgåva, första 2026-09-03) |
| `data/seo/blogg/branschmedianer-akm2.json` | 1 SEO-post | Titel/keywords-spegel av ovan |
| `data/portfolj-system/korstabell-grund.json` | **100 rader** | ticker, namn, bransch, akm1Totalt, akm1PerKategori (7 kategorier), fvagPerHorisont (5 horisonter), fvagDynamik, golvMarginal, portV19, datatackning, akm1MaxMojligt, status, akm2, akm2Skillnad, akm2Moduler |
| `data/portfolj-system/bolagsunivers.json` | **100 bolag** | land, valuta, marknadsKapitalMdr + nyckeltalsgrupper (se §3) |
| `data/cache/fundamental-*.json` | **100 st** | Råa nyckeltal per bolag med datatackning 4–100 % per fält (se §3) |
| `data/cache/akm1-*.json` | 100 st | V01–V20-poäng + motiveringar per variabel |
| `data/cache/akm2-*.json` | **100 st (100 med komposit)** | viktprofil akm2-2026, 4 lager, perKategori, band, osäkerhet, moduler |
| `data/stocks/PREC-ST/` | **1 bolag** (metadata.json + fundamentals.json) | Specialfallsbolag — **JURIDIKRISK, se §6** |
| `data/forskningsbiblioteket/` | 22 bolagsblurbbar | Kortpresentationer (BSX, CVX, DIS, GOOGL …) |
| `data/llms-fragor.json` | **333 frågor** med sökpoäng | Fråga/svar/kategori/sökväg/poäng/topp100 — internlänkmål per tema |
| `data/varumarke.json` | 27 förbjudna fraser + 10 tonregler | Juridikgrindens maskinläsbara underlag (se §6) |
| `data/seo/kurser/` + `data/seo/blogg/` + `data/seo/analyser/` | 333 + 55 + 11 | Befintliga URL-mönster att länka till (aldrig duplicera) |

**Befintlig programmatisk grund (viktigt!)**: `/dataset` och `/dataset/[bransch]`
lever redan (`src/app/(huvud)/dataset/[bransch]/page.tsx`, våg 97 E1) — SSG med
10 branschsidor som visar fem medianer (P/E, P/B, EBIT-marginal, FCF-marginal,
omsättningstillväxt) ur `data/portfolj-system/` via `src/lib/dataset-medianer.ts`.
Alla teman nedan bygger VIDARE på den namnrymden — inga kollisioner.

---

## 2. Branscherna (10 × 10 bolag = 100-bolagsuniversumet)

Källa: `korstabell-grund.json` (rader) × `branschmedianer-akm2.json` (medianer).

| Bransch (slug) | Svenskt namn | Bolag | AKM2-median | Spridning (min–max) | Exempel-tickers |
|---|---|---|---|---|---|
| teknik | Teknik | 10 | 61 | 37–78 (Sinch–Logitech) | AAPL, ERIC-B.ST, GOOGL, SAP.DE |
| konsument | Konsument | 10 | 60,5 | 19–70 (Electrolux–H&M) | ELUX-B.ST, ESSITY-B.ST, HM-B.ST |
| industri | Industri | 10 | 60 | 51–85 (ASSA–Industrivärden) | ABB.ST, ALFA.ST, ATCO-A.ST |
| kommunikation | Kommunikation | 10 | 60 | 39–68 (WBD–Tele2) | DIS, META, MTG-B.ST, NFLX |
| energi | Energi | 10 | 58 | 31–77 (RWE–Chevron) | AKRBP.OL, CVX, EQNR.OL, ENEL.MI |
| halso | Hälsa | 10 | 56,5 | 46–66 (Fresenius–Novo Nordisk) | AZN.ST, BSX, COLO-B.CO |
| fastighet | Fastighet | 10 | 50 | 42–60 (Prologis–Diös) | BALD-B.ST, CAST.ST, DIOS.ST |
| tillvaxt | Tillväxt (särskild grupp, ej GICS) | 10 | 43 | 25–58 (Polestar–Truecaller) | AMD, NVDA, PCELL.ST, KINV-B.ST |
| material | Material | 10 | 42 | 31–79 (Stora Enso–Newmont) | BILL.ST, BOL.ST, HOLM-B.ST, NEM |
| finans | Finans | 10 | 41 | 30–80 (Nordea–Investor) | BRK-B, GS, INVE-B.ST, JPM |

Övriga fördelningar som kan bli sidinnehåll (ur `bolagsunivers.json`):
- **Land**: Sverige 47 · USA 32 · Norge 5 · Finland 4 · Tyskland 3 · Danmark 3 · Spanien 2 · NL/CH/FR/IT 1 cada.
- **Valuta**: SEK 47 · USD 32 · EUR 12 · NOK 5 · DKK 3 · CHF 1.
- **Status** (korstabellen): gul 76 · grön 7 · röd 17.
- **F-vågsdynamik**: stabilt 39 · förbättras 38 · försämras 16 · osatt 7; horisonter
  mikro/kort/medellång/lång/mega med signalerna impulsvag/korrigering/osatt.
- Noterad jämförbarhetsfälla (redan i medianer-posten): Industrivärden och Investor
  är investmentbolag — substans, inte drift — bra pedagogiskt avsnitt per tema.

---

## 3. Dataset-fält som kan bli sidinnehåll (med datatackning av 100)

Källa: `data/cache/fundamental-*.json`. Gränsregeln från peer-motorn gäller alla
teman: **branschgrupp under 5 mätta bolag redovisas aldrig** ("för få mätta").

| Fält | Mätta | Temapotential |
|---|---|---|
| lonksamhet.bruttoMarginal | 100 | Prissättningsmakt per bransch |
| lonksamhet.ebitMarginal | 100 | Driftslönsamhet (finns redan på /dataset) |
| lonksamhet.nettoMarginal | 100 | Vinstmarginal efter allt |
| tillvaxt.omsattningTillvaxtTTM | 100 | Senaste årets tillväxt (finns redan) |
| aterkop.insiderkopSenaste6man | 100 | Insidarvariabel — OBS: värdesätt försiktigt, kan vara false-horisont |
| vardering.pb | 98 | Substansvärdering (finns redan) |
| vardering.egenKapitalMultipl | 98 | Graham-varning per bransch |
| lonksamhet.roe | 97 | Avkastning på eget kapital |
| vardering.evEbit | 95 | Kapitalstruktur-neutral multipel |
| tillvaxt.prognosTillvaxt | 93 | Framåtblickande (källa = konsensus, redovisa det) |
| vardering.pe | 92 | P/E (finns redan) |
| lonksamhet.fcfMarginal | 92 | FCF-marginal (finns redan) |
| tillvaxt.omsattningCAGR5ar | 91 | 5-årstillväxt |
| vardering.peg | 88 | Tillväxtjusterad multipel |
| stabilitet.skuldEgenkapital | 88 | Soliditet per bransch |
| vardering.fcfYield | 87 | Kassaflödesavkastning — "utdelningstemat" utan utdelningsdata |
| lonksamhet.roic | 84 | Kapitalavkastning inkl. skuld |
| tillvaxt.resultatCAGR5ar | 70 | Resultattillväxt (lägre täckning — gränsregel!)
| golv.vardePerAktie / golv.marginal | 10 | Värdegolv — endast fastighet (+ ev. enstaka) → kan INTE bli 10 branschsidor |
| stabilitet.kassaManaderBurnRate | 4 | Endast tillväxtgrupp — endast 1 temaside möjlig |
| **utdelning/dividend** | **0 — SAKNAS** | Utdelningsdata finns INTE i datasetet (se tema 6 och §6) |
| rantaTackning, fcfPositivaSenaste5, nyemissionerSenaste5ar, aterkop.senasteArMdr, aterkop.andelUtestande, moat.* | 0 | Saknas i pass 1 — framtida insamling, inga sidor nu |

Dessutom per bolag i `korstabell-grund.json`: `akm1PerKategori` (7 kategorier:
tillväxt, värdering, lönsamhet, stabilitet, moat, katalysator, risk) och i
`akm2-*.json`: komposit, 4 lager, band, osäkerhet, moduler.

---

## 4. BRANSCHTEMAN — förslag (prioriterade)

Alla rubrikmönster följer mönstret "så jämför du / så läser du / så räknas" =
utbildningsformulering (2 kap 5 §). Antal = teoretiskt max efter gränsregeln.

### Tema 1 — Nyckeltalsdjup per bransch (STÖRST YTTA)
- **Idé**: "[Nyckeltal] inom [bransch] — median, spridning och hur du läser det"
- **Datakälla**: `data/cache/fundamental-*.json` (100 st) via samma medianmotor som `src/lib/dataset-medianer.ts` redan använder; 12 NYCKELTAL utöver de fem som redan lever på /dataset/[bransch]: roe, roic, nettoMarginal, bruttoMarginal, evEbit, peg, fcfYield, egenKapitalMultipl, skuldEgenkapital, omsattningCAGR5ar, prognosTillvaxt (resultatCAGR5ar endast där gränsregeln klaras).
- **Antal sidor**: 12 fält × 10 branscher = **120** (minus gränsregelutfall, realistiskt ~115; resultatCAGR5ar med 70 % täckning faller på 2–3 branscher).
- **URL-mönster**: `/dataset/[bransch]/[nyckeltal]` — t.ex. `/dataset/teknik/peg`, `/dataset/finans/roe`, `/dataset/fastighet/skuldsattning`.
- **Juridik-säker formulering**: "PEG inom teknik — medianen och spridningen i 100-bolagsuniversumet. Så räknas talet, så tolkar du gapet mot branschens median — och varför multipeln inte säger köp eller sälj." Aldrig "attraktivt värderad bransch".

### Tema 2 — AKM2-profil per bransch
- **Idé**: "[Bransch] i AKM2 — så ligger gruppen mot övriga branscher"
- **Datakälla**: `korstabell-grund.json` (akm2, akm2Skillnad, akm2Moduler) + `data/blogg/branschmedianer-akm2.json` (median/min/max/ytterlighetsbolag).
- **Antal sidor**: **10** (en per bransch; månadsserien ger färskhet).
- **URL-mönster**: `/dataset/[bransch]/akm2`.
- **Juridik-säker formulering**: "Teknik i AKM2 — median 61, spridning 37–78. Så räknas kompositen, så vägs branschmodulerna, och så läs spridningen som metodinformation — inte som rangordning." (Samma ton som medianer-postens egen text.)

### Tema 3 — Kategoriprofil per bransch
- **Idé**: "[Kategori] inom [bransch] — så skiljer sig gruppens bolag"
- **Datakälla**: `korstabell-grund.json` fält `akm1PerKategori` (7 kategorier × 100 bolag).
- **Antal sidor**: 7 × 10 = **70**.
- **URL-mönster**: `/dataset/[bransch]/[kategori]` — t.ex. `/dataset/finans/lonsamhet`, `/dataset/teknik/moat`.
- **Juridik-säker formulering**: "Lönsamhet inom finans — därför räknas banker och investmentbolag annorlunda (substans vs drift). Så jämför du kategoripoängen utan att blanda bolagsformer." (Investmentbolags-noten är redan forskningsunderlag i medianer-posten.)

### Tema 4 — Land × bransch ("svenska [bransch]bolag")
- **Idé**: "Svenska [bransch]bolag i forskningsuniversumet — så ligger de mot branschmedianen"
- **Datakälla**: `bolagsunivers.json` (land-fältet: Sverige 47, USA 32) + korstabellen.
- **Antal sidor**: Sverige ~**8–10** (47 bolag fördelade på 10 branscher; gränsregeln kan fälla 1–2 grupper) + USA ~**6–8** = **~15–18**.
- **URL-mönster**: `/dataset/[bransch]/sverige` resp. `/dataset/[bransch]/usa`.
- **Juridik-säker formulering**: "Så jämför du svenska fastighetsbolag med branschens median — urval, valuta (SEK) och vad jämförelsen inte säger." Aldrig lista "bäst svenska aktier".

### Tema 5 — Lägesbild/dynamik per bransch
- **Idé**: "[Bransch]ens lägesbild — förbättras, försämras eller stabila lägen"
- **Datakälla**: `korstabell-grund.json` fält `fvagDynamik` (förbättras 38, stabilt 39, försämras 16, osatt 7) + `fvagPerHorisont` (mikro→mega).
- **Antal sidor**: **10–15** (en per bransch där ≥5 bolag har satt dynamik; 7 osatta bolag faller bort).
- **URL-mönster**: `/dataset/[bransch]/lagesbild`.
- **Juridik-säker formulering**: "Så läs en lägesbild: vad 'förbättras' betyder i modellen (poängbild, inte kursprognos) och hur fem tidshorisonter skiljer sig." Signalklippen impulsvag/korrigering är deskriptiva mätetal — aldrig "nu är läget att agera".

### Tema 6 — Kassaflödesavkastning per bransch ("utdelningstemat, rätt gjort")
- **Idé**: "Kassaflödesavkastning inom [bransch] — utdelningsförmågans råmaterial"
- **Datakälla**: `vardering.fcfYield` (87/100 mätta — klarar gränsregeln i 10/10 branscher sannolikt; kontrollera per grupp).
- **Antal sidor**: **10**.
- **URL-mönster**: `/dataset/[bransch]/fcf-avkastning` (kan också vara tema 1-fallet).
- **Juridik-säker formulering**: "FCF-avkastning inom energi — så räknas talet och hur det förhåller sig till utdelning. OBS: plattformen har ingen direkt utdelningsdata i universumet — därför visar vi kassaflödet, inte utdelningsbeslut."
- **VIKTIGT FYND**: "Utdelningsaktier inom [bransch]" kan INTE byggas på data ännu — utdelningsfält saknas helt (0/100). Bygg temat på fcfYield + internlänka till kurserna `ud-03-dividend-aristocrats`, `ud-04-utdelningsfallor`, `ud-06-svenska-utdelningsaktier`, `vm-06-dividend-discount-model-ddm`.

### Tema 7 — Värderingshubb per bransch (sammanvävning)
- **Idé**: "Värdering inom [bransch] — vilken multipel att använda när" (hub-sida som binder tema 1-sidorna: pe, pb, evEbit, peg, fcfYield, egenKapitalMultipl).
- **Datakälla**: tema 1 + `data/llms-fragor.json` (kategori VÄRDERING/VÄRDERINGSMETODER: bl.a. vm-03-multipelval 164 p, v06-ev-ebitda 162 p, km-009-pe 160 p — alla topp100-frågor = efterfrågan finns).
- **Antal sidor**: **10** (en per bransch).
- **URL-mönster**: `/dataset/[bransch]/vardering`.
- **Juridik-säker formulering**: "Värdering inom teknik — när P/E fungerar, när EV/EBIT är ärligare, och varför branschens median bara är en utgångspunkt för ditt eget resonemang."

### Tema 8 — Frågeanknytning (inga nya sidor — internlänkning)
- **Idé**: Varje temasida länkar 3–5 matchande kurser/frågor ur `data/llms-fragor.json` (333 st, sorterade på sökpoäng) och tillhörande `data/seo/kurser/*.json` (333) — long-tail-svaret blir djupare än konkurrenternas.
- **Datakälla**: llms-fragor.json:s kategorier + poäng.
- **Antal**: 0 nya sidor; lyft på samtliga ~250 teman.

### Summa nya möjliga sidor
| Tema | Antal |
|---|---|
| 1 Nyckeltalsdjup | ~115–120 |
| 2 AKM2-profil | 10 |
| 3 Kategoriprofil | 70 |
| 4 Land × bransch | ~15–18 |
| 5 Lägesbild | ~10–15 |
| 6 FCF-avkastning | 10 |
| 7 Värderingshubb | 10 |
| **Total** | **~240–253** |

Rekommenderad startordning: 1 (störst ytta, infrastruktur finns) → 7 → 2 → 3 → 6 → 4 → 5.

---

## 5. Tekniska förutsättningar (för senare vågor — inget byggs nu)

- Mallen finns: `/dataset/[bransch]/page.tsx` (force-static + `dynamicParams = false`
  + ISR 24 h + 404 vid okänd grupp) — samma mönster för `/dataset/[bransch]/[nyckeltal]`.
- Medianmotor finns: `src/lib/dataset-medianer.ts` + `branschSlugs`/`branschUrSlug`.
- Gränsregeln (< 5 mätta ⇒ aldrig redovisa) MÅSTE implementeras i varje generator —
  motorn gissar aldrig, sidorna får inte heller göra det.
- Datafiler läses från disk = leveransprotokoll 1 (ingen deploy av kod för innehåll).

---

## 6. Juridikgrind — flaggor och omskrivningar (P2/2007:528)

**FLAGGA 1 (allvarligast — rådata, inte publicerad sida)**:
`data/stocks/PREC-ST/metadata.json` och `fundamentals.json` innehåller
`"recommendation": "FÖRSIKTIGT KÖP (villkorat, spekulativt)"`, `recommendationScale: 2`
och `priceTarget: "Base: 1,40 SEK (+63 %)"`. Det är köprekommendation +
kursmål = investeringsrådgivning om det når en publik sida. **Regel**: PREC.ST-data
får ALDRIG syndikeras till programmatiska sidor; om bolaget senare ingår i ett tema
måste fälten `recommendation`, `recommendationScale` och `priceTarget` strykas
och ersättas med variabelpoängen (V01–V20) som är pedagogisk metodik. Följs upp av
någon annan ägare (S7 skriver endast denna fil — src/ rörs ej).

**FLAGGA 2**: Sökordsinstinkten "utdelningsaktier inom [bransch]" Riskerar bli råd
("aktier att köpa") och SAKNAR datounderlag (0/100). Omskrivning: "så analyserar du
utdelningsförmåga inom [bransch]" med fcfYield-data + utdelningskurserna.

**Omskrivningstabell** (från varumarke.json:s 27 förbjudna fraser, alla P2/MAR):
| Förbjuden lockformulering | Juridik-säker ersättning |
|---|---|
| "bästa/köpvärda aktier inom [bransch]" | "så jämför du bolag inom [bransch]" |
| "aktietips", "köp-/säljrekommendation" | "pedagogisk analys med redovisad metodik" |
| "garanterad/riskfri avkastning" | "forskningsunderlag" / "riskmätt" |
| "[bransch] att investera i just nu" | "[bransch]ens nyckeltal — median och spridning" |
| "slå index varje år" | "redovisad, reproducerbar metodik" |
| "säker vinst" | "forskningsunderlag med redovisad risk" |

Signatur-disclaimer på varje temaside (ur varumarke.json):
"Pedagogisk analys — inte investeringsråd." Plus medianer-postens egen ton:
"Det är information, inte fel" om jämförbarhetsfällor (investmentbolag etc.).

Tonregler som gäller sidorna: Du-form, siffror ur data (aldrig hårdkodade),
osäkerhet skrivs ut ("saknar vetenskapligt belagt prediktiv förmåga"), gravör
aldrig casino (inga countdown/FOMO — båda förbjudna i varumarke.json).

---

## 7. KVD-checklista för genomförandevågen

1. Gränsregeln implementerad (< 5 mätta ⇒ sidan genereras ej, ingen påhittad median).
2. PREC.ST-fälten recommendation/priceTarget exkluderade i generatorn (vitt test).
3. Kvalitetsvakten (`verktyg/granssnittsvakt.mjs`) körd mot nya sidmönster — 0 fynd.
4. Disclaimer + "inte investeringsråd" på varje genererad sida, båda teman, mobil/dator.
5. Internlänkar: varje temasida → 3–5 kurser (llms-fragor) + /forskningsbiblioteket.
6. m9-regeln för autoinnehåll: granskningskö (granskadAv-tvång) gäller om sidorna
   tas in i bloggflödet — dataset-sidor med ren medianvisning omfattas ej.

*Dokument: våg 138 S7 · underlag sonderat 2026-09-14 · källor citerade per rad.*
