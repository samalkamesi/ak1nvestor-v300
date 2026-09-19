# KONTROLL-GRANSKNING 2026-09-19 — Bilaktier: så analyserar du biltillverkare i omställningen (B10)

**Objekt:** `data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json` (SEO-branschguide B10, commit `68618489` 2026-09-16, byggare s3-u1; status utkast)
**Granskad av:** fabrik auto-s1-1789781115807-s1-u2 (agentfabrik spår 1, 2/3), 2026-09-19 — anspråk `data/vakten/auto-s1-1789781115807-s1-u2-ansprak.md` skrivet 01:28:21Z FÖRE arbetet (klaim-protokollet)
**Roll: OBEROENDE KORSKONFIRMERANDE KONTROLL + KOMPLEMENT** — syskon u1 (samma manifest) levererade parallellt huvudgranskningen `bilaktier-sa-analyserar-du-biltillverkare.md` + `-diff.json` (anspråk 01:29:04Z, 43 s efter mitt; leverans 01:35Z; racet dokumenterat av u3:s anspråk 01:30Z). Denna KONTROLL konfirmerar oberoende u1:s samtliga fynd (B1/B2/C1/C2/D1 — samma domar, samma ersättningssträngar i B1/B2-kärnan) och tillför **tre nya: A1 (felstavning i description — u1 missade den), C3 (grammatik i sammanfattningen), C4 (IEA-källprecision)**. Kompletteringens unika poster levereras i `bilaktier-sa-analyserar-du-biltillverkare-KOMPLEMENT-s1u2-diff.json`; u1:s diff förblir det sammanhängande rättningspaketet.
**Bedömning: FLYTTKLAR EFTER RÄTTNING** (A1: felstavning i description — "multipelar" ska vara "multipler"; B1: superlativpåståendet "universumets högsta bruttomarginal, LVMH:s 66 procent" är **motbevisat av universumets egna data: 51 bolag ligger över** — LVMH är rank 52 av 186 värderade (189 poster i trädet), med Industrivärden/Öresund/Evolution/Mastercard på 100,0 % i topp; B2: readingMinutes 2 → 7, **femte bekräftade fallet** i seriens systematiska underskattningsklass — u1 räknar med substansrabatt-domen och kallar det sjätte; räknesätt, ingen oenighet) **+ 4 C-poster** (C1 "det dubbla mot biltillverkarnas" exakt bara mot Volvo; C2 PowerCells förlustserie; C3 grammatisk kongruens i sammanfattningen; C4 "över 20 procent" vs IEA:s "20 procent") **+ 1 notis** (D1 publishedAt). I övrigt grönt hela vägen: **25/25 universumfält EXAKTA** mot `data/portfolj-system/bolagsunivers.json` (rådata 2026-09-03, 189 bolag — samma värden i dagens träd som vid bygget), **aritmetiken 7/7 exakt** (fabriksexemplet, båda stressfallen, hävstången 3×, fallprocenterna −53/−46), **OICA källverifierad ordagrant** (92,7 → 96,4 miljoner motorfordon 2025, +3,9 %, Kina 34,5 miljoner), **IEA källverifierad** (>21 miljoner elbilar 2025, var fjärde nybil, ~23 miljoner prognos 2026), juridiken ren (rådglossor 0 problemkontexter; varumärkesgrind 26 regexer **0 FEL 0 VARNING** — renaste mätningen i serien), 911 ren (0/6 mönster), **13/13 unika interna länkar HTTP 200** inklusive kursankaret se-09-bil. Utkast-JSON:en orörd av granskningen (nya filer endast).

**Pivot-notis (köprotokollet):** uppdragsrubrikens "m9-utkast #2" = auto-platshållare — hela m9-serien 6/6 granskningsklar sedan 2026-09-16 14:35 (`8448ef77`); tionde omgången i raden som duplikatregeln tvingar pivot (syskonbokfört mönster sedan 09-17). FIFO bland ogranskade: **bilaktier = äldsta ogranskade utkastet** i `data/blogg-utkast/` (maskinell genomgång 01:27 UTC: 30 ogranskade, denna först). Gårdagens omgång (auto-s1-1789758924831) lämnade bil åt sitt u1 — som valde Goldman Sachs-paketet; objektet förblev obebyggt.

**Race-protokoll (dokumentation åt fabriken):** mitt anspråk 01:28:21Z → u1:s anspråk 01:29:04Z (43 s senare — race-fönstret mellan läsning och skrivning; u1:s anspråk uppmanar syskonen välja bland "övriga 29", ovetet om mitt) → u3:s anspråk 01:30:33Z **dokumenterar racet uttryckligen** ("u1+u2 har båda anspråkat bilaktier, 01:28 vs 01:29") och väljer JPMorgan-paketet i stället → u1:s leverans 01:35Z → denna KONTROLL 01:36–01:38Z. Dubbelgranskningen blev i efterhand ett **oberoende replikvärde**: två agenter, skilda verktyg (u1: juridikgrind-vakt; u2: kontrolleraText-replik + egen sond), samma domar på B1/B2/C1/C2/D1 — och skilda kompletterande fynd (u1:s C2-formulering bär talgapet; u2 tillför A1+C3+C4). Lärdom åt fabriken: anspråksfönstret är ~1 minut — komplettera anspråksläsning med `ls -t granskning/ | head` omedelbart före leverans.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till `data/blogg/`. Rättningarna levereras som diff-poster: u1:s paket `bilaktier-sa-analyserar-du-biltillverkare-diff.json` (B1+B2+C1+C2+D1) + denna gransknings unika poster i `bilaktier-sa-analyserar-du-biltillverkare-KOMPLEMENT-s1u2-diff.json` (A1+C3+C4; samtliga söksträngar maskinverifierade unika = exakt 1 träff i filen) för byggaragenten/kunden att verkställa.

---

## 1. Källor — två externa talbärare, båda källverifierade

| Påstående i utkastet | Granskning | Dom |
|---|---|---|
| OICA: "Världsproduktionen nådde 96,4 miljoner motorfordon 2025, en ökning med 3,9 procent" | **Webbverifierad mot OICA:s egen publicering** ("Auto industry growth shifted east in 2025"): "production rose from 92.7 million units in 2024 to 96.4 million in 2025 (+3.9 %)". Källans egna procentsats citeras — intern omräkning av de avrundade slutpunkterna ger +4,0 %, men källans +3,9 % (räknat på orundade tal) är gällande | ✓ exakt |
| "Kina byggde 34,5 miljoner av världens 96,4 miljoner fordon 2025" | OICA-statistiken: Kina #1 med 34 530 738 fordon | ✓ |
| IEA: "över 21 miljoner bilar 2025 … var fjärde nybil — och projekterar cirka 23 miljoner för 2026" | **Webbverifierad** (IEA Global EV Outlook 2026, executive summary + Electrek 2026-05-19): elbilsförsäljningen >21 M 2025 = var fjärde nybil (one-quarter), prognos ~23 M för 2026 trots långsammare Q1 | ✓ exakt |
| "över 20 procent tillväxt på ett år" | IEA:s egna rubriksiffra är "grew by **20 %** globally" — "över 20" påstår strikt mer än källans avrundade tal | ✓− → **C4** (frivillig precision) |
| "där [Kina] är elbilsandelen högst" | IEA: Kina är det största och andelsmässigt högsta elbilsmarknaden | ✓ |
| "Motorfordon"-avgränsningen | OICA:s 96,4 M omfattar personbilar OCH nyttofordon — guiden skriver korrekt "motorfordon" (och skiljer därmed från "personbilar" i IEA-påståendet) | ✓ precision i källanvändningen |

## 2. Universumet — 25/25 fält EXAKTA (sond `verktyg/_s1u2-bilaktier-verify.mjs`)

| Bolag | Fält i utkastet | Universum (2026-09-03) | Dom |
|---|---|---|---|
| Volvo Cars | P/E 6,0 · P/B 0,37 · EV/EBIT "över 21" · EBIT-marginal 0,8 % · brutto 15,6 % · resultat 15,4 mdr 2024 → "i princip noll" 2025 | 5,957 · 0,369 · 21,219 · 0,84 % · 15,62 % · 15 401 M → 174 M | ✓ 7/7 EXAKTA (avrundningarna ärliga) |
| Tesla | P/E 334 · PEG 4,3 · brutto 18,9 % · vinst 15,0 → 7,1 → 3,8 mdr USD ("−53 och −46 procent") | 333,654 · 4,26 · 18,85 % · 14 997 → 7 091 → 3 794 MUSD (−52,7/−46,5) | ✓ 6/6 EXAKTA |
| Polestar | "P/E saknar nämnare" · förlust 2,4 mdr USD · ~200 M/mån · kassaräckvidd "cirka 15 månader" (2 ställen) | P/E null · −2 357 MUSD (2 357/12 = 196,4 ≈ 200) · kassaManaderBurnRate 15,2 | ✓ 4/4 EXAKTA |
| PowerCell | brutto 30,6 % · intäkter 245 → 385 Mkr "på fyra år" · positivt kassaflöde · "förlusten minskande" | 30,55 % · 244,7 → 385,0 Mkr (2022–2025 = 4 räkenskapsår) · fcfMarginal +11,1 % · resultat −58,2 → −63,0 → −88,0 → −29,5 Mkr | ✓ talen; trendformuleringen → **C2** |
| LVMH | "universumets högsta bruttomarginal, LVMH:s 66 procent" | Talet ✓ (66,36 %). **RANKEN ✗✗: 51 bolag över** — topp: Industrivärden, Öresund, Evolution, Mastercard (100,0), Kambi (98,9), Visa (97,7), ARM (97,5), Genmab (93,0) … LVMH rank 52 av 189 | ✗ → **B1** |
| LVMH-kontrasten | "ligger mer än tre gånger högre" [än tillverkarnas] | 66,36/15,62 = 4,25× Volvo · 66,36/18,85 = 3,52× Tesla | ✓ mot båda |
| Ramverk | "universumets två vinstgivande biltillverkare" · "fyra ankare" · "värderingar spänner från P/E 6 till obefintlig" | Volvo +174 Mkr, Tesla +3 794 MUSD, Polestar −2 357 MUSD; VOLCAR-B/TSLA/PSNY/PCELL = exakt 4; P/E-spannet 5,957 → null | ✓ |
| "det dubbla mot biltillverkarnas" [PowerCell] | 30,55/15,62 = 1,96× (Volvo ✓) men 30,55/18,85 = 1,62× (Tesla ✗) | pluralpåståendet håller bara mot en av de två | ✓− → **C1** |

**B1 är superlativfällan igen** (B7-lärdomen; s3-u2 fångade samma klass i SaaS-guiden FÖRE publicering: "Kambi är INTE universumets högsta bruttomarginal"). Biltillverkarguidens byggare rankkontrollerade inte — och LVMH faller ännu längre: inte topp-8 utan **rank 52**. Rättningen är kirurgisk: stryk superlativet, behåll talet och den pedagogiska kontrasten (den är guidens poäng och förblir sann).

## 3. Siffror — oberoende omräkning 7/7 EXAKT

| Påstående | Omräkning | Dom |
|---|---|---|
| 300 000 × 400 000 = 120 mdr | ✓ | ✓ |
| 300 000 × 60 000 = 18 mdr; 18 − 12 = 6 mdr; 6/120 = 5,0 % | ✓ | ✓ |
| Volym −15 %: 255 000 × 60 000 = 15,3 mdr; 15,3 − 12 = 3,3 mdr; −45 % på −15 % = 3× hävstång | ✓ ((6−3,3)/6 = 45,0; 45/15 = 3) | ✓ |
| Pris −5 %: 380 000 kr → täckning 40 000 → 12 mdr → resultat 0 | ✓ | ✓ |
| Polestar "ungefär 200 miljoner i månaden" | 2 357/12 = 196,4 | ✓ |
| Tesla "halverades i princip två år i rad … −53 och −46 procent" | −52,7 och −46,5 — "i princip"-kvalificeraren bär ärligt det andra året | ✓ |
| "kassaräckvidden till cirka 15 månader" | universumets kassaManaderBurnRate = 15,2 | ✓ |

Exempelaritmetiken är den granskade seriens renaste: alla sju steg stämmer, och fabrikstalet deklareras "påhittade men realistiska" — ärlig källhantering.

## 4. Juridiken — 2007:528 (utbildning, aldrig rådgivning): REN

- **Rådglossor** (maskinell sond, kontextbedömd): enda träffen "köp" i "hushållens **näst största köp** efter bostaden" + "och **köpet** låter sig skjutas upp" — substantiv i branschbeskrivning, subjekt är hushållet, inte läsaren; B8-precedenten friar ordagrant detta mönster. **0 problemkontexter.**
- **Utbildningsdeklarationer**: ingressen "Som alltid här: utbildning i metod, aldrig råd om enskilda aktier" ✓ · disclaimer-sista-rad "_Detta är pedagogisk finansanalys, inte investeringsråd._" ✓.
- **Varumärkesgrind** (exakt replik av `kontrolleraText`, 26 regexer × 3 ytor): **0 FEL, 0 VARNING** — inte ens A8-"kunder" träffar. Renaste mätningen i den granskade serien (syskonen: försvar 3 A8, spel 1 A8).
- **Lagrum:** inga åberopas (OICA/IEA är källor) ⇒ ingen lagrumsblandning möjlig.

## 5. 911-referenser — REN

0 träffar på seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i title + description + body.

## 6. Länkar — 13/13 unika interna levande, verifierade mot sajten

| Länk | HTTP |
|---|---|
| /kurser/km-009-pe · /kurser/km-010-evebit · /blogg/peg-multipeln-svagheter-2026 · /blogg/ps-tal-nar-ar-det-anvandbart · /blogg/v08-ebitda-marginal-analys · /blogg/v07-bruttomarginal-analys · /blogg/v12-intaktsstabilitet-analys · /kurser/rk-02-emissionrisk · /blogg/v19-kapitalforbranning-analys · /kurser/km-006-kvartalsrapporten · /blogg/hur-vi-analyserade-volvo-cars · /kurser/se-09-bil · /blogg/komplett-guide-svensk-aktieanalys-2026 | **13 × 200 ✓** |

Byggarens KVD-anspråk "14 korslänkar verifierade" = 14 förekomster, 13 unika (v07-bruttomarginal länkas två gånger) — konsistent. Kursankaret se-09-bil levande — guiden länkar hem till sitt kursankare som den ska. 0 länkar till utkast.

## 7. Struktur och metadata

- Body **1 359 ord textrensat / ~1 383 rå** (byggarens räknesätt) — inom mallspannet 800–1 400 ✓. 7 `##`-rubriker · disclaimer sist ✓.
- **readingMinutes 2 → 7 (B2):** 1 359 ord på 2 minuter = 679,5 ord/min — snabbare än samtliga 55 publicerade (max 240, konsumentaktier-mätningen 09-18). Bloggfamiljens kontrakt ~ord/200 (substansrabatt-domen 09-17; 0/55 följer ord/600): round(1 359/200) = **7**. **Femte bekräftade fallet i klassen** (halvledar-B1, hälsa-B4, konsumentaktier-B4, försvar-B2).
- **A1:** description bär felstavningen "**multipelar**" (skall vara "multipler") — body:n stavar rätt ("jämför aldrig multipler"); felstavningen sitter i SEO-ytan som sökmotorer och förhandsvisningar bär. Efter rättning: 150 tkn.
- Sökordsdisciplin: "bilaktier" i title ✓ + ingress ✓ + H2 ("Vad är bilaktier — en industri med två klockor") ✓.
- Title 58 tkn ≤ 60 ✓. Description 151 tkn (150 efter A1) ≤ 155 ✓. 5 tags ✓.
- **D1 (notis):** publishedAt 2026-09-16 = skapandedatum — exportvägen stämplar vid flytt; publicering förblir kundens (R2).

## 8. Flaggor

1. **Till -en-ägaren:** spegeln `bilaktier-sa-analyserar-du-biltillverkare-en.json` (09-18 02:40, ogranskad) bär **identiska B1+B2+C4-fel**: "The universe's highest, LVMH's 66 percent, sits more than three times higher" · readingMinutes 2 · "above 20 percent growth". Däremot är dess description korrekt ("multiples") — A1 gäller INTE spegeln. Rättningarna speglas vid verkställning.
2. **Till byggarspåret (systemmönster):** superlativfällan "universumets högsta X" har nu fångats i TVÅ guider (SaaS 09-16 förlagd, bil märkt här) — rankingsonden före leverans (B7-lärdomen) förtjänar att bli obligatorisk del av byggar-KVD:n.
3. **Till byggaren:** B1-rättningen GÖR MENINGEN STARKARE — utan superlativet blir LVMH-kontrasten (66 % mot 15,6/18,9) en siffra som talar för sig själv; den pedagogiska poängen ("tunn marginal är branschens konstruktion") överlever oskadd.
4. **Notis:** C4 är frivillig precision — IEA:s rubriksiffra är "20 %"; "över 20 procent" påstår marginellt mer än källan säger. Ingen tvingande rättning.

## 9. Könotis åt nästa omgång

Ogranskade svenska rotguider efter denna (FIFO): detaljhandel (09-16 15:36), flyg (15:38), försäkring (22:16), media (22:16), livsmedel (22:17), lyx (09-17 03:26), e-handel (03:28), logistik (22:58), krypto (09-18 10:11), utbildning (09-18 20:29 — ny, saknar worklog-bokföring) + 16 -en-speglar + kvartalspaket utan granskningsfil. Kollisionskontroll mot worklog + granskningsmapp + anspråksfiler före start. **Systemmönster att vänta:** readingMinutes 2 vid 935–1 400 ord förefaller seriegbrett (sjätte fallet i kön) — sonda det FÖRST; superlativ-sonden ("universumets högsta/största X") är nu två gångers gärningsman — kör den mot bolagsunivers.json FÖRE varje talgranskning.
