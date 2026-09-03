# ÅÄÖ-djupkontroll — andra opinionen (2026-09-03)

**Uppdrag:** Oberoende djupkontroll av 20 slumpvis valda kurser ur `public/deep-courses.json` — jaga svenska språkfel utöver den genomförda åäö-saneringen. Ägande: denna rapport + rätt att fixa `data/bokmaster/*.json` + `public/deep-courses.json` för påvisade fel.

## Metod

- **Urval (reproducerbart, mulberry32-seed `20260903`):** 5 obligatoriska + 15 slumpade ur 333 kurser = 214 kapitel, 617 quiz.
  - Obligatoriska: the-intelligent-investor (II), security-analysis (SA), one-up-on-wall-street (OU), tanka-snabbt-och-langsamt (TS), bull-a-history-of-boom-and-bust (BULL)
  - Slumpade: km-046-telekomsektorn, shoe-dog, teknisk-analys-med-johnny-torssell (TORSS), pc-06-case-hm, km-026-relaterade-parter, km-025-pensionsataganden, km-049-bolagsskatt-206, the-warren-buffett-portfolio (WBP), km-050-utdelningsskatt-30, the-black-swan (TBS), se-12-spel, km-035-flockbeteende, km-030-margin-of-safety, km-057-konjunkturcykler, bollinger-on-bollinger-bands (BOL)
- **Detektorer:** (1) korpus-härledd ordbok — 25 155 korrekta åäö-ord → 25 021 degenereringsvarianter avsökta i urvalet; (2) homoglyf-skanning (kyrilliska, grekiska, ł, U+00AD, U+2212, U+00A0); (3) dubbelordsregex; (4) meningsavslutningsanalys; (5) engelsk funktionsords-heuristik (4+ ord i följd); (6) quizstrukturvalidering (ratt 0–3 och < antal alternativ, tomma alternativ/frågor/tips, dubbletter).
- **Manuell djupläsning:** II kap 1–5, 8, 20 (de degenererade) + SA kap 8, 10, 20, OU kap 6, 8, 9, TS kap 5, 7, 13, BULL kap 3, 5, 12 (slumpade, seed 7) + samtliga 617 quiz granskade.
- **Rättningsprincip:** exakta strängbytten på verifierad kontext, aldrig blind replace. Strukturinvariant kontroll (antal kap/block/quiz + ratt-intervall) före/efter varje filskrivning; JSON re-parse efter varje skrivning.

## VIKTIGT OPERATIONELLT FYND: parallell sanerare aktiv under sessionen

`public/deep-courses.json` modifierades av en annan process **mitt under granskningen** (mtime 2026-09-03 10:57:16). II:s kap 1–5/8/20 var kraftigt degenererade vid mitt första läs (t.ex. "Innan du laser vidare … For varje … Om fler an två", "havstang + amatorer", "Forestall dig att du ager … en gard … till din dorr", "borjsvarde", "istallet for 3") men var åtgärdade när jag applicerade mina fixar (~40 träffar som jag verifierat först och som saneraren hann före). Alla kvarvarande fel nedan är mitt ansvar och åtgärdade av mig. Slutsats: "den stora saneringen" var inte helt avslutad vid uppdragets start — eller körs omperiodiskt. **Rekommendation: lås filen för parallella skrivare under granskningspass.**

## FYND PER KATEGORI (åtgärdat = inom urval, av mig)

### K1. Kvarvarande degenerering — 176 åtgärdade i urvalet (102 i deep-courses + 74 i bokmaster)

**Nya systematiska klasser som automatiken missat helt (största fyndet):**

| Mönster | Orsak | Antal deep-courses (urval) | Antal bokmaster | Exempel |
|---|---|---|---|---|
| `köpå` → `köpa` | omvänd vokalkorruption a→å i sluten | 67 (15 kurser) | 19 (one-up) | "rätten att köpå aktier", "skulle jag köpå den här positionen", "Centralbanken tvingade dem att köpå" |
| `frågör` → `frågor` | pluraländelse -or → -ör | 39 (12 kurser) | 18 (5 filer) | "ställ tre frågör till varje rad", "Formationer är frågör; volym och brytning är svaren" |
| `portfoljbyggaren` → `portföljbyggaren` | klassisk å→a, verktygsnamn | 8 (WBP) + 1 utanför urval (little-book, fixad) | 10 (WBP) | "Kelly-logik i portfoljbyggaren" |
| `KAUP mer` → `KÖP mer` | u→Ö | 1 | – | II kap 4 |
| `återköpå` → `återköpa` | som köpå | 1 (OU) | täcks av köpå | "kan betala, återköpå och växa sig ur problem" |

**Punktvisa degenereringar (urval, åtgärdade):** `(salu högt!)`→`(sälja högt!)` (II k4); tabellrubriker `Troskel/Overlevnad/Uthallighet/20+ är`→`Tröskel/Överlevnad/Uthållighet/20+ år` (II k5); `Mr Market-laran`→`-läran`, `Overvag`→`Överväg` (II k8); `Kopa/portfolj/Forutsagbarhet/Krava` i marginaltabellen (II k20); `rod vid nedgång`→`röd` (TORSS k11); `Oversätt`→`Översätt` (TS k5, tabell); `Eftegerskrift`/`eftegerskriftet`→`Efterskrift` (II k21, titel + quiz); `Ratt`→`Rätt` (II k4, tabellrubrik).

### K2. Homoglyfer/främmande skript — 1 äkta fel (åtgärdat), 35 ej fel

- **Äkta:** `Höga avgifter激活 förvaltning` — kinesiska tecken i quizalternativ (II kap 9 q2 alt 2) → `Höga avgifter aktiverar förvaltningen`.
- **Ej fel:** 35 träffar U+2212 (matteminus i formler, t.ex. `(pris − medel) / σ` i BOL) = korrekt typografi, lämnat medvetet. Inga kyrilliska а/е/о, inget ł, inget U+00AD, inga grekiska bokstänger i löptext.

### K3. Dubbelord — 0 äkta fel

102 råträffar var tabellrubrik+första rad-kollisioner (t.ex. "…fyra steg Steg | Symptom…") och grammatiskt korrekta konstruktioner ("är det det starkaste beviset", "kund till den den skulle granska"). `högsta högsta och lägsta lägsta` (BOL k2 + quiz) = etablerad term för Donchians highest high/lowest low — lämnat. (Se dock K6: `Investeraaren` var ett äkta dubbelbokstavsfel, åtgärdat.)

### K4. Avkapade meningar — 2 äkta fel (åtgärdade), 0 blockningsnivå

Automatisk slut punctuation-skanning över 1 100+ textblock/intro: 1 kvarvarande = tidslinje-JSON (ej löptext). Äkta semantiska avkapningar funna vid läsning:
- WBP k12: "en portfölj som presterar lika bra som en **omsorgsfullt vald av experterna**" — huvudord saknas → "…omsorgsfullt vald **portfölj** av experterna".
- OU k8-tabell: rubriken `PEG-rå` → `PEG-tal` (avkapad i JSON-tabellsträng).
- Närliggande icke-ord/avkapat: `rutger ger`→`rutor ger` (WBP k13), `marknar`→`marknader` (OU k6 quizalt), `köpreg`→`köprek` (II k10 quizalt), `räkneuret`→`räkneverket` (OU k9 tips), `aga proaktivt`→`agera proaktivt` ×2 + `tolta`→`tolka` (km-057), `ledarlövningsbana`→`ledarlös hinderbana` (TS k7 — intron säger "hinderbana"), `enmeningars`→omskrivet "pressmeddelande på en enda mening" (BULL k3).

### K5. Engelska läckor i svensk löptext — 12 äkta fel (åtgärdade)

`whole` ("Investeringens whole historia", II k20); `gets` ("ett mönster som gets eget kapitel här efter", TS k5); `ALWAYS` ("Detta känns ALWAYS fel", II k4); `exactly` (II k12 quizalt); `mediocre` ×2 (WBP k13 block + quiz); `celebrities` (BULL k5); `passivity` (BULL k12); `holding perioden` ×2 → `hållperioden` (WBP k5 block + quizfråga); `realize toppen`→`realisera` (TORSS k7); 激活 (K2 ovan). Legitima engelska citat/låneord lämnade: "know what you own, and know why you own it — vet vad du äger" (OU), "WYSIATI — what you see is all there is" (TS), "Interest Cost on Pension Liability" (km-025), Mr Market, moat m.fl.

### K6. Grammatik/kongruens/icke-ord — 24 äkta fel (åtgärdade)

`kr för samma sakerna`→`samma saker` (II k2); `Frågar aktier skydda mot detta?`→`Fråga: skyddar aktier mot detta?` (II k2); `inget förfallodag`→`ingen` (SA k8); `pappret är värda`→`värt` (SA k20 quiz); `historikuriosa`→`historiekuriosa` + `genomskåda`→`genomskådning` (SA k20); `i bokens ända`→`änden` (OU k8); `räntläget`→`ränteläget` (OU k8); `de 25 rådgivare vars`→`de 25 rådgivarna vars` (TS k7, intro+b0); `Det botar dem`→`Det som botar dem` (TS k7); `fast du/man mätt linjerna`→`har mätt` ×2 (TS k7 block+quiz); `i stället i punkter`→`i stället för punkter` (TS k7); `båda väg.`→`båda vägar.` (II k3 tips); `historier större`→`historiskt större` (II k5); `löste sitt Nobelpris`→`löste ut` (TS k5); `Yterligheterna`→`Ytterligheterna` (II k4); `brusset`→`bruset` (WBP k9); `Investeraaren`→`Investeraren` (WBP k13 quiz); `fortsätt mata`→`fortsätter mata` (TBS k2); `läg:`→`lag:` (BULL k5); `ett enda, favoritindikator`→`en enda favoritindikator` (km-057); `Tvingas`→`tvingas` versal mitt i mening (II k4); inledande blanksteg i quizalt `" Insiderinfo"` (II k6); `Värdepappersanalys för leken`→`för lekmannen` (II k11-titel — Grahams "lay investor").

### K7. Quizfel — 63 strukturella fel (åtgärdade) + 2 designobservationer (lämnade)

- **60 tomma quiz-tips i the-intelligent-investor** (systematiskt: endast 3 av 63 quiz hade tips) → samtliga försedda med korta tips i kursens befintliga stil (pekar på kapitelkärnan, avslöjar inte svaret), t.ex. k20q1 "Marginalen är rätten att ha fel."
- **Kinesiska tecken i alternativ** (II k9q2) och **avkapade alternativ** `marknar`, `mediocre`, `exactly`, `köpreg`, `" Insiderinfo"` — åtgärdade ovan.
- **ratt-index:** 0 fel globalt (8 211 quiz: ingen ratt utanför 0–3, ingen ratt ≥ antal alternativ, inga tomma alternativ).
- **Lämnat med motivering:** 1 291 quiz globalt (varav 54 i urvalet, km/pc/se/rk/pf/ts-serierna) har 3 alternativ i stället för 4 — 100 % konsekvent design inom dessa serier (ratt alltid 0–2), bedömt som medvetet, inte fel. Ej åtgärdat; flagga för produktbeslut om enhetlighet önskas.
- **Svag design noterad:** II k18q2 är ja/nej-fråga med alternativen "Nej/Ja/Bara om tech/Bara vid kris" (ratt=1) — fungerar men låg pedagogisk kvalitet. Lämnad.
- **tips på fel fråga:** 0 fynd bland granskade quiz — samtliga tips i urvalet matchar sin fråga (efter att II:s 60 tomma fylldes).

## Sammanställning åtgärdat

| Fil | Ändringar |
|---|---|
| public/deep-courses.json | 53 punktfixar + 67 köpå + 39 frågör + 9 portföljbyggare (8 WBP + 1 little-book) + 60 quiz-tips = **228** |
| data/bokmaster/security-analysis.json | 4 + 3 frågör |
| data/bokmaster/one-up-on-wall-street.json | 3 + 19 köpå + 6 frågör |
| data/bokmaster/tanka-snabbt-och-langsamt.json | 9 |
| data/bokmaster/bull-a-history-of-boom-and-bust.json | 3 |
| data/bokmaster/shoe-dog.json | 2 frågör |
| data/bokmaster/teknisk-analys-med-johnny-torssell.json | 2 |
| data/bokmaster/the-warren-buffett-portfolio.json | 6 + 5 frågör + 10 portföljbyggare |
| data/bokmaster/the-black-swan.json | 1 |
| data/bokmaster/bollinger-on-bollinger-bands.json | 2 frågör |
| **Totalt** | **~320 kontextuella ändringar, 11 filer** |

**Verifiering efter varje skrivning:** JSON re-parse OK; 333 kurser kvar; urvalets 214 kap/617 quiz oförändrade i antal; 0 ratt-fel; 0 kvarvarande `köpå`/`frågör`/`portfoljbyggaren` i urvalet (både deep-courses och bokmaster); II 0 tomma tips kvar.

## Lämnade ofixade — och varför

| Fynd | Plats | Varför orört |
|---|---|---|
| "kundavi substanser" | OU kap 6 b2 ("kapacitetsutnyttjande; kundavi substanser") | Meningsfragment utan säker rekonstruktion — ingen blind gissning |
| "tittarsiffror, **dejtingsonområde** för börs" | BULL kap 5 tabellproxy | Dito — tabellcellen är garblerad, originalmening otydbar |
| "information som nådde köparna **okammad**" | BULL kap 12 tabell | Möjligen avsiktlig nybildning ("okammad"=orörd/okammat); osäker |
| "högsta högsta och lägsta lägsta" | BOL kap 2 + quiz | Etablerad svensk term för Donchians highest high/lowest low |
| U+2212 i matteformler (35 st) | fr.a. BOL | Korrekt typografiskt minustecken |
| Nybildningar: takbelagd, tätningsmätning, multiplpercentil, långslag, driftsmekanisk, stoj | OU/BULL | Konsekvent kreatörsröst, förståeliga, ej entydigt fel |
| "Samma monster varje gång" | II kap 3 | Grammatiskt korrekt och semantiskt fungerande även om "mönster" var möjlig källa — den parallella saneraren valde att behålla, som läses fungerar |
| 3-alternativsquiz (54 i urvalet, 1 291 globalt) | km/pc/se/rk/pf/ts-serier | Konsekvent design, ej språkfel |

## SPILL UTANFÖR URVAL (rekommenderad nästa åtgärd — ej utförd enligt "aldrig blind replace"-mandat)

Samma två systematiska klasser finns kvar i resten av korpusen, nu exakt kvantifierade:
- `köpå`→`köpa`: **823** förekomster till i deep-courses (185 kurser utanför urvalet) + **193** i bokmaster (17 filer; tyngst: how-to-make-money-in-stocks 27, of-permanent-value 21, the-outsiders 21, distress-investing 18, you-can-be-a-stock-market-genius 18, flash-boys 17, margin-of-safety 17).
- `frågör`→`frågor`: **400** förekomster till i deep-courses (123 kurser) + **151** i bokmaster (30 filer; tyngst: the-art-of-short-selling 25, vagfundament 12, market-mind-games 9).

Båda klasserna var 100 % deterministiska i samtliga 250+ kontextuellt verifierade förekomster inom urvalet. Ett mekaniskt svep med manuell stickprovsverifiering (samma skript, `node dk-apply.js`-mönstret) torde vara säkert — men det ligger utanför detta uppdrags 20-kursers mandat.

---
*Rapportgenererad av djupkontrollsagent (andra opinionen), 2026-09-03. Urval och kapitelurval reproducerbara via seed 20260903 respektive 7 (mulberry32).*
