# Språkexpert A — manuell granskning batch A (pass 1 av 2)

**Datum:** 2026-09-03 (granskad 2026-09-01)
**Fil:** `public/deep-courses.json`
**Omfattning:** Alfabetiskt första fjärdedelen = 84 kurser (100-baggers … km-036-overconfidence), 834 kapitel, 2 408 quizfrågor.
**Metod:** (1) Fulltäckande mönsterskanning av ALL text i de 84 kurserna (åäö-degenerering, "-ör/-är"-suffix, dubbelord, genusavvikelser, mojibake, tomma quiz-tips). (2) Manuell genomläsning av samtliga 84 kursers title/summary/why/learn + Graham/Lynch/AK1-sektioner + histories, samt ett roterande urvalskapitel med alla block och quiz per svenskproducerad kurs (ak1ts, akm1, bf-01…11, foretagsvardering, km-001…036). (3) Kirurgiska ersättningar med kontext och räknade förväntade träffar, scoped till batch A. (4) Verifiering: JSON-parse OK, chapters/quiz/blocks-antal oförändrade för alla 84 kurser, kvarvarande felsträngar = 0, kurser utanför batch A orörda av mig (parallell agent D:s ändringar i övriga batcher har lämnats intakta).

**Resultat: 316 rättade strängförekomster (ca 250 distinkta felmönster) i 74 av 84 kurser. 25 osäkra markeringar lämnade orörda.**

---

## 1. MASKINSPÅR (kritisk misstanke — bekräftad)

Saneringen har två systematiska skadebilder, båda konstaterade och åtgärdade:

### 1a. "-ör" som ska vara "-or" samt spegelvända varianter — 150+ förekomster
Det största enskilda fyndet: pluraländelsen "-or" har återställts felaktigt till "-ör".
- **"vågör" → "vågor": 136 förekomster** i 13 kurser (ak1ts, elliott, a-random-walk, all-about, bollinger, bull, charlie-munger, devil, fibonacci, flash-boys ("radiovågör"), fooled ("modetrendsvågör"), good-to-great ("sektorvågör", "budvågör", "prisvågör"), irrational, akm1). Samt sammansättningar: impulsvågör, delvågör, drivvågör, förbindarvågör, emissionsvågör, utspädningsvågör, tryckvågör, svallvågör, treårsvågör, X-vågör.
- "trädär fram" → "träder fram" (devil)
- "städär upp balansräkningen" → "städar upp" (interpretation)
- "förebådär" → "förebådar" (good-to-great)
- "nivåär" → "nivåer" (km-018)
- "därfär" → "därför" (akm1)
- "informationsöär" → "informationsöar" (km-018)
- "swinglägör" → "swinglägor" (japanese; mekanisk -ör→-or, ordet är husets term parallellt med "swinghöjder")
- "instabilar" → "instabila" (intermarket)

### 1b. Ogiltiga "återställda" ord (1–2 teckens fel)
- "langsamt"→"långsamt", "overdriver"→"överdriver", "overdrivna"→"överdrivna", "overstiger"→"överstiger" (bokstäver i "över"-familjen)
- "äkte edge"→"äkta edge" (against-the-gods), "enligt läg"→"enligt lag" ×8 (7 kurser; skilt från korrekta "lägsta värdets princip" som lämnats)
- "bokfords"→"bokförs" (akm1), "sannolikheten for"→"för" (km-004), "hyposen"→"hypotesen" (km-019), "spordes"→"spårades" (km-019), "läg om bokföring"→"lag om" + "infördes"→"införde" (km-001)
- "väg languaging" → "våg languaging" ×3 (ak1ts ch15) — motiverat: samma meningar innehåller det bevisat skadade "Elliott-vågör", termen betyder vågteoretiskt vagnspråk och "väg" (subst.) är meningslöst här. Rättad med resonemang dokumenterat; flaggas för pass 2.

### 1c. Främmande skrivtecken i svensk text
- km-026: "bolag som沃尔沃 och Investor" → "Volvo" samt "闭环" ×2 → "sluten loop" (kinesiska tecken rest sig genom hela saneringskedjan)
- km-026: "familjen Persson:s transaktioner" → "Perssons"

---

## 2. GRAMMATIK (genus, kongruens, ordföljd, särskrivning)

Urval av de ~120 grammatikrättningarna:
- **Genus:** "en dyrare sätt"→ett, "ett portfölj"→en (km-015), "ett skuld"→en (km-023), "en ramverk"→ett (km-002, competition), "en test"→ett (km-004, contrarian), "en krav"→ett (expectations), "en recept"→ett (km-009), "en låg P/E-tal"→ett lågt (km-010), "en stark kassaflöde"→ett starkt (km-032), "ett portfäljs"→en portfäljs (km-032), "ett psykologisk fenomen"→ett psykologiskt (km-035), "En statistisk mått"→ett statistiskt (km-013), "ett breda marknadsindex"→ett brett (km-033), "en lågvolativ…problematisk bolag"→lågvolatil…problematiskt (km-013/015), "den svenska retail-segmenten"→det svenska (km-005), "en bolags beta"→ett bolags ×2 (km-008), "intrinsikt/intrinsika"→intrinsiskt/intrinsiska ×5 (investment, km-027, km-030).
- **Kongruens/böjning:** "Tre idéer gör boken unika"→unik (penman), "korrelationer är instabilar"→instabila, "den ärlighetsövning … skylder"→ärlighetsövningen … skyldig (munger), "kräver den kontroversiell ärlighet"→den kontroversiella ärligheten (come-into), "Låånga"→Långa, "definiera"→definierar (km-018), "sjunk"→sjunkit (km-003), "analyserat"→skulle ha analyserat (km-030), "Sann/Sanna mästerskap"→"Sant mästerskap" i 17 km-kurser, "tillvädd(prognos)"→tillväxt ×3 (km-027), "framtiga"→framtida ×2 (km-008), "oförutsedga"→oförutsedda (km-033), "förbisetot"→förbisett (km-024), "lågvolativ"→lågvolatil, "Linjärt vs degressivt avskrivning"→Linjär vs degressiv ×2 (km-021), "familjeägd"→familjeägda (km-005), "förlustarna"→förlusterna (km-031), "pensionsåtagendernas"→-åtagandenas (km-025), "årst-tempo" mfl.
- **Ordföljd:** "Denna beta sedan 'levereras' upp"→levereras sedan (km-008), "Denna process inte bara dokumenterar"→dokumenterar inte bara (km-002), "bekräftelsefällan ofta maskeras"→maskeras ofta (km-019), "informationen ofta döljs"→döljs ofta (km-006), "när det borde göra det inte"→när det inte borde göra det ×2 (km-020), "kris emellertid tenderar"→kris tenderar emellertid (km-031), "Vi gör det inte … väljer vi transparency"→"genomskinlighet" (engelskaläcka, akm1).
- **Särskrivning/sammansättning:** "en struktur förändring"→strukturförändring (km-014), "avgifts matte"→avgiftsmatte (all-about), "fiber spole"→fiberspole ×3 (flash-boys), "värdet uppskattningar"→värdeuppskattningar (km-029), "bekräftelseförlänger sig själv"→bekräftelse förlänger sig själv (km-019), "matcherönskad"→matcher önskad (km-015), "komforthör" var redan korrekt ("komfort hör hemma" — falsklarm).
- **Dubbelord:** "att att rycka kunder"→att (competition), "om om företagets"→om (km-003), "om om dessa förväntningar"→om (km-028), "i i bokens"→i (come-into), "i i decennier"→i (foretagsvardering), "för för enbart balansomslutningen"→för (km-010). Legitima upprepningar lämnade ("rullas om om planen", "vänder vänder", "den den bästa").
- **Genitiv/artikel:** encyclopedia quiz "I koppen nedre tredjedel"→"I koppens nedre tredjedel" ×3 + "koppen form"→koppens form; "läsa priset inbakade förväntningar"→prisetS (expectations); "vilken två/tre frågor/egenskaper"→vilka (investment-valuation, blue-ocean); "den enda fråga som"→frågan (against-the-gods); "de fem dörrar"→dörrarna (creative); "den dolda värden"→de dolda värdena ×3 (km-012); "aktie verkligt värde"→akties verkliga (km-007).

---

## 3. AVKAPADE MENINGAR / TRANSKRIPTIONSFLICKAR
- creative summary: meningen saknade huvudsats ("Med fri kassaflödes alla definitioner, …") → inledande "Med" bortaget så att meningen blir en lista i stil med övrig summary.
- devil ch4: "— och 1717 köpa Mississippi-området" → "och att 1717 köpa …" (infinitivkoppling).
- km-031 AK1: "portföljer som inte bara maximal avkastning" → "maximerar" (verb saknades).
- km-035 why: "kan identifiera av detta beteende skydda" → "identifieringen … skydda".
- penman ch11: "bolaget moget — tjänar" → "bolaget är moget — tjänar".
- fibonacci ch11: "förtjänar inte vågas mot marknaden" → "förtjänar inte att vågas mot marknaden".
- km-017: "men aldrig [ha] råd att förlora" → "ha råd".
- EJ åtgärdade (osäkra, se §6): kreativa summary-blocken "sasongs" ×3 är dataförlust, inte avkapningar.

---

## 4. ENGELSKA LÄCKOR I SVENSK TEXT (citerade titlar/termer lämnade)
- distress: "köpa something i spillrån"→"köpa något"
- penman why: "prisets own riskpremie"→"egen riskpremie"
- km-022 intro: "långt beyond standardiserad redovisning"→"bortom"
- km-006: "tech-bolag like Spotify"→"som"
- km-034: "då even bolag"→"även"
- km-015: "dess inherenta risk"→"inneboende"
- km-033: "tail-risk hedling"→"hedging" (engelsk term rättstavad)
- akm1: "väljer vi transparency"→"genomskinlighet"
- konsekvent hus-anglicism "approach" (bl.a. bf, km-007/011/024) lämnad — etablerat husbruk, ändring skulle kräva beslut om hela stilen.
- Kvar-lämnade termer med avsikt: margin of safety, moat, peer comps, overhead supply, overfitting, data mining, cost averaging m.fl.

---

## 5. STAVNINGSFEL (urval)
- "Bernoulis"→Bernoullis ×2, "nackslogg"-familjen: "nackslag"→nackslogg, "studioli"→studior (bull), "vallgrävter"→vallgravar (good-to-great), "jämförelseseten"→jämförelsesettet, "försvarswerket"→försvarsverket (akm1), "kvantiteter"→kvanter (akm1), "Elliots djupsinne"→Elliotts (ak1ts), "förmågör"→förmågor + "dina egen"→dina egna (munger), "kartläcka"→kartlägga (km-014), "korelerade"→korrelerade (km-014), "engångsintäck"→engångsintäkt (km-006), "För honn"→honon→"honom" (km-006), "ofte"→ofta (km-010), "Shapers"→Sharpes ×2 (km-016), "förfondsförvaltare"→fondförvaltare (km-028), "svenska mäklars"→mäklares (come-into), "AK1M1"→AKM1 ×4 + "AK1M-metodiken"→AKM1 (bf-01, km-006/018/035/036), "AK1 Research Lab"→AK1A (km-016), "undvita"→undvika ×10, "underestimera(r)"→underskatta(r) ×3, "ohållig"→ohållbar, "översedd"/"aktor"/"fällaktighet" (osäkra, §6), "skrulas"→skruvas ×2, "KASSAFLÖDESET"→KASSAFLÖDET, "koplas"→kopplas, "trott förluster"→trots, "overtygelse"→övertygelse (contrarian), "urvalselet"→urvalset (fibonacci), "PR:är"→PR:ar ×4 (fooling), "Bokföringsprinciperna": "bokförningsförståelse"→bokföringsförståelse (km-001), "obeståndsfördringar"→obeståndsfordringar (distress), "working capital-knip"→knep ×4, "konkurrensadvantager"→konkurrensfördelar (km-010), "multipeler"→multipler ×17 (investment ×10, km-011 ×6, a-random-walk), "multiplicator(analys)"→multipel ×2 (km-012/030), "på job"→på jobb (distress), "Sum-of-the--parts"→Sum-of-the-parts ×2, "företagsvärde"-kongruens (km-022), "familjeärenden"→familjekontor (km-033; "family offices" felöversatt), "ränter"→räntor (km-028/029), "Lynch's"→Lynchs ×2, "'Mr. Market's'"→Mr. Markets ×2, "'mr. Market'"→Mr. Market, "'Mr. Markets'"→Mr. Markets, "multiplikateursvängningar" (osäker, §6).
- Mallfel bf-kurserna: "en av de vanligaste kognitiva bias bland"→"kognitiva biasarna bland" ×11; "dessa bias är robusta"→biasar ×10; "systematiska bias,"→biasar ×10; "från svenska börsen"→"från den svenska börsen" ×60 (bf+km-mallar).
- km-036-titel "Överconfidence"→"Overconfidence" (hybridord; svenskt alternativ är "Övermod" — valde minimal ändring, flaggas).
- "Sann mästerskap i aktieanalys" m.m. — se §2 (17 kurser).

---

## 6. OSÄKRA MARKERINGAR (25 st — orörda, original okänt: gissa aldrig)

| # | Kurs | Fynd | Misstanke |
|---|------|------|-----------|
| 1 | blue-ocean ch3.blocks[6] | Hela blockinnehållet är strängen "sasongs" | Dataförlust — block förstört, innehåll kan ej återskapas |
| 2 | blue-ocean ch12.blocks[6] | samma | samma |
| 3 | bull ch10.blocks[6] | samma | samma |
| 4 | penman ch9 | "köpa en lång krona av övervinster" | troligen "kedja" |
| 5 | against-the-gods why | "grevens ruin" | troligen "spelarens ruin" (gambler's ruin) |
| 6 | bull why | "en Mega-ressättning" | okänt ord ("resning"?) |
| 7 | blue-ocean learn | "som fullständigt genomfallet" (Cirque du Soleil) | troligen "genomgången" |
| 8 | 100-baggers summary | "steg minst 100 gånger — dollar för hundrade dollar" | olycklig/trasig idiom |
| 9 | elliott ch12 | "flera svitgnågör i rad" | okänt ord ("svängningar"?) |
| 10 | flash-boys tabell | "DJupbeställning" | okänt begrepp ("djup order"?) |
| 11 | fooling ch0 | "publicist och positionär är samma person" | troligen "positionstagare" |
| 12 | competition ch9 | "erosionsradarn — omkör nio-stegstestet årligen" | troligen "kör" |
| 13 | km-013 history | VIX "('rävens röst')" | troligen "rädslans röst" |
| 14 | km-025 origin | "Den moderna pensionsåterbäringen har sina rötter…" | troligen "pensionssystemet/åtagandena" |
| 15 | km-025 origin | "Företagsamma pensionsplaner" | troligen "Företagens" |
| 16 | km-027 lynch | "en aktie var översedd" | "förbisedd"/"undervärderad" |
| 17 | km-011 lynch | "en 'billig' aktor med en lägre P/E" | "aktör" (giltigt ord) eller "aktie"? |
| 18 | km-011 lynch | "en klassisk 'fällaktighet'" | inget svenskt ord; "fälla"? |
| 19 | km-029 lynch | "både i hög- och lågt konjunkturläge" | troligen "hög- och lågkonjunktur" |
| 20 | km-030 why | "särskilt viktigt för mindre kapital" | avkapad tankegång |
| 21 | km-031 why | "VaR är en avgörande metri" | "metrik"/"mått" |
| 22 | km-003 modern | "om vinsten är hävd på riktiga kassaflöden" | troligen "byggd/stödd" |
| 23 | km-001 modern | "följer samma principer som de små aktierna analyserar" | bakvänd sats |
| 24 | km-001 AK1 | "V07 (Skuldeget kapital)" | troligen "Skuld/eget kapital" |
| 25 | how-to-make-money ch0 | "årsfilen till V09 ROE" | troligen "årsiffran/årsvinsten"; även irrational "multiplikateursvängningar" samt flash-boys "kostnadsrak fibern" och all-about "Diversifieringens avkastande skal" + distress "en jämnlytande part" (okända ord, orörda). |

Obs: "väg languaging"→"våg languaging" rättades efter belägg (§1b) men visas gärna för pass 2 som gränsfall.

---

## 7. VERIFIERING
- `JSON.parse` OK efter varje ingrepp; filen serialiseras byteidentiskt med ursprungsformatet (2 indrag + LF).
- Kapitel-/quiz-/blockantal identiska med baslinje för alla 84 kurser (834 kapitel, 2 408 quiz).
- Slutskanning: 0 kvarvarande instanser av vågör-familjen, undvita, AK1M1, multipeler, "Sann/Sanna mästerskap", "enligt läg", konsensusenen m.fl. i batch A.
- Kurser utanför batch A: lämnade orörda av mig (parallell språkgranskar-process i samma fil har egna ändringar i övriga batcher — konflikt fri; en egenskapad artefakt "konsensusenen" upptäcktes vid självrannsakan och rättades).
- Backup av originalfil: `tmp_parts/sprak-A/backup-deep-courses.json`.

## 8. FYND STATISTIK
- Rättade förekomster totalt: **316** (fix1 263 + fix3 49 + fix4 4; alla verifierade slutgiltiga)
- Berörda kurser: 74 av 84
- Osäkra markeringar: **25**
- Värsta enskilda fynden: (1) vågör→vågor 136 ex + släktfel, (2) kinesiska tecken i km-026, (3) bf-mallens "undvita"/bias-plural/"svenska börsen" (81 mallinstanser) + km-mallens "Sann mästerskap" (17 kurser).
