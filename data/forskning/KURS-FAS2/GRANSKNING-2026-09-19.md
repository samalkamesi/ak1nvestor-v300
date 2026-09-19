# GRANSKNING — Fas 2-underlagen V01–V20 · 2026-09-19

Granskningsagentens dom för kodintegration (våg 200). Ämbetsplikt: denna fil
är granskningens enda artefakt — ingen kod, inga commits, ingen git.

## Metod

Verifierade mot följande källor (läsning, omräkning, exakt jämförelse):

- **Modellkärnan**: `src/lib/akm2/karna.ts` (914 rader) — scorV01/scorV05/
  scorV06 (poangEvEbitda)/scorV07/scorV09/raknaV10/scorV11/scorV12/
  scorV19/scorV20/scorKvalitativ + konstanter `KASSA_PORT_MANADER = 12`,
  `KASSA_PORT_MAX_KOMPOSIT = 45` + VARIABEL_META (kurs-slugar, källrader).
- **Kalkylatorns RAKNARE**: `src/components/ak1a/akm1-calculator.tsx`
  (räknare för V01/V04/V05/V06/V07/V08/V09/V10/V19).
- **Vikterna**: `src/lib/akm2/vikter.ts` — "akm1-klassisk" = UNIFORM 1/20
  (procenttabellen 5×8 % + 12×6 % + 3×KRITISK sommar 112 % och är
  ÖVERGIVEN enligt R2 §2; "KRITISK" är pedagogisk etikett, inte vikt).
- **Datakällan**: `data/portfolj-system/bolagsunivers.json` — **195 bolag**
  (grep -c '"ticker"' = 195). Stickprov med exakt fältjämförelse för 28
  bolag + egen omräkning av samtliga 12 CV-värden i V12 och samtliga
  P/S-divisioner i V04.
- **Dataskrapen evEbit**: bekräftad i källan (ABB.ST `"evEbit": 275.537`).

**Skalärlighet (ärlighetsregel):** studions skal hänger på sammansatta
kommandon, pipelines med sort/awk och node -e (skal-kvotan gällde under
sessionen). Följande är därför **overifierat**: universummedianerna (V07
"47,8 %", V08 "20,8 %", V09 "15,3 %", V10 "0,52×") — värdena kräver
sortering av 195 tal som inte kunde utföras; V05:s uppgift "Sinch 2024:
−6,4 mdr resultat" (fält ej lokaliserat i JSON). Allt annat i rapporten är
verifierat med citat/jämförelsetal.

## Systemfynd (gäller flera filer)

1. **189 vs 195**: källan har 195 bolag. V01–V05 och README skriver
   "189-bolagsuniversum" — FEL. V07–V20 skriver 195 — RÄTT. README skriver
   dessutom "10 branscher × 10" (= 100) som inte stämmer med något av talen.
2. **Två tröskelvärldar**: kärnan (karna.ts) har R2 §6-kurvor för
   V01/V06/V07/V09/V19 som SKILJER SIG från kalkylatorns linjära RAKNARE.
   Underlagen våg 197–199 (V06/V07/V09/V19/V20) citerar KÄRNAN — korrekt.
   Underlag V01 (våg 192) citerar KALKYATORNS linjära tabell — avviker från
   kärnans goldilocks-kurva (se V01 nedan). V04/V05/V10 matchar båda
   (kärnan dokumenterar kalkylatorns linjära trösklar i sin osatt-text).
3. **Viktetiketter**: alla underlags rubriker + README-status-tabellen bär
   den övergivna procenttabellen ("KRITISK vikt", "8 % vikt", "6 % vikt").
   Enligt vikter.ts är KRITISK en etikett och klassisk profil = uniform 1/20.
   Inte tröskelfel, men ska dokumenteras rätt före kodintegration.
4. **evEbit-skrapen**: ABB 275,5× bekräftad i JSON. INGET underlag lutar
   på evEbit — V06 nämner fältet endast som skäl till osatt och pekar på
   V28. KORREKT hanterat i hela biblioteket.
5. **Talpariteten i övrigt är en styrka**: i princip ALLA stickprovstal
   stämmer EXAKT mot JSON (TTM-värden, marginaler, skuld/EK, P/B, serier,
   CV-värden, kassatäckning, insiderköp, fältantal 4/51/108). En enda
   talmotsägelse hittad (V05: 148,8 vs 148,7 %).

## Dom per underlag

### V01 Försäljningstillväxt — GUL
- Tröskeltabellen (rad 80–88: "≥ 30 % | 5 … < 0 % | 1", källa "RAKNARE,
  V01") är KALKYATORNS linjära kurva, INTE kärnans goldilocks (kärnan:
  < −10 % ⇒ 0; −10–0 % ⇒ 1; 45–60 % och > 60 % ⇒ 4 med
  hållbarhetsrabatt; 30–45 % ⇒ 5 ENDAST med bruttomarginal ≥ 30 %).
  Rubriken "modellens trösklar" stämmer alltså inte mot modellkärnan.
  Exempelpoängen råkar stämma med båda kurvorna (Volvo −5,7 → 1, Sandvik
  23,7 → 4), men tabellen vilseleder vid kodintegration.
- "ur universumets 189" (rad 36) — källan har 195.
- Talen: Alfa Laval/Volvo/Sinch-serierna EXAKTA (473 479/552 252/526 816/
  479 183 osv.); TTM-värdena +7,7/−5,7/+9,1/+23,7/+13,5/+16,4 % alla
  bekräftade mot fältet `omsattningTillvaxtTTM`.
- Juridikgränsfall (godkänt men noteras): "hög tillväxt är som sämst som
  köptillfälle-indikation när den är cykeldriven" — talar om köpbegrepp
  men ramas in som utbildningsexempel på att en variabel aldrig räcker.

### V02 ARR-tillväxt — GUL
- Textfel: "Det är itself en lärdom" (rad 22 — engelska i svensk text);
  "possum-tillväxten" (rad 58 — icke-existerande ord); "Baklog ≠ ARR"
  (rad 71 — ska vara Backlog).
- Tröskeltabellen (rad 82–88) är märkt "(riktlinje)" men står under
  rubriken "Koppling till AKM1 — modellens trösklar". Kärnans scorV02 är
  ALLTID osatt ("ARR redovisas inte i P1:s datakontrakt") — modellens
  trösklar för V02 finns alltså inte i kod. Missvisande rubrik.
- Talen: Microsoft +17,7 % TTM ✓, Kambi +13,5 % ✓, Sinch +3,8 % ✓;
  Microsoft-serien 211 915/245 122/281 724/331 839 MUSD — tre första
  EXAKTA mot JSON-serien, fjärde indirekt bekräftad (P/S-divisionen i
  V04 ger exakt 11,12). "189-bolagsuniversum" (rad 19) — fel, 195.

### V03 Intäktsdiversifiering — GUL
- Textfel: "åtta produktlinjer från åtta förvärv kan vara åtta*sinat
  integrationsrisk" (rad 62–63 — "sinat" är nonsens); "60 % av intäkterna
  egentligen beroende av två slutkunder" (rad 53–54 — verbet "är" saknas).
- Samma rubrikproblem som V02: riktlinjetabell under "modellens trösklar"
  — kärnans scorV03 är alltid osatt.
- Talen: Ericsson TTM −6,1 % ✓, bruttomarginal 48,1 % ✓, P/B 3,1 ✓;
  Kambi brutto 98,9 % ✓, P/B 29,2 ✓; Atlas Copco 168 mdr ✓.

### V04 P/S — GRÖN (med anmärkningar)
- Trösklar EXAKTA mot kärnans dokumentation och RAKNARE
  (<1⇒5, <2⇒4, <3⇒3, <5⇒2, ≥5⇒1).
- Egna uträkningar verifierade: Sinch 31 757/27 080 = 1,17 ✓; Alfa Laval
  231 545/69 674 = 3,32 ✓ (börsvärde `marknadsKapitalMdr` 231.545 ✓);
  Atlas Copco 984 018/168 343 = 5,85 ✓; Microsoft 3 689 160/331 839 =
  11,12 ✓ + EBIT-marginaler 2,5/16,2/20,6/45,1 % ✓.
- Anmärkningar: " billigast" (rad 44, dubbelt mellanslag); "en gratis
  pojke" (rad 84, tveksam idiomatik); "ur universumets 189" (rad 32) —
  195. Juridiken explicit trygg ("vi ger utbildning, inte råd").

### V05 P/B — GUL
- INTERN MOTSÄGELSE (endast i hela materialet): tabellen "Apple | 44,15 |
  148,8 %" (rad 42) mot löptexten "bolaget gör 148,7 % ROE" (rad 84–85).
  Källan: `roe: 1.4875` → 148,8 % är rätt avrundat; 148,7 är fel.
- Textfel: "kunnigor" (rad 15 — ska vara kunnande); "tolkas
  motsubstansvärde" (rad 64 — saknar mellanslag); tabellkolumnen "Les"
  (rad 36 — oklar rubrik, ska troligen vara "Läs"); "välutfodrade bolag"
  (rad 60 — icke-ord); "högt ROE-driver multippel" (rad 40 — blandat
  språk + dubbel-p); indenteringsfel rad 15.
- Trösklar EXAKTA mot kärnan/RAKNARE. Talen Sinch 1,38 ✓ (pb 1.382),
  Ericsson 3,09 ✓ (3.087), Atlas 9,26 ✓ (9.257), Kambi 29,18 ✓ (29.183),
  Apple 44,15 ✓ (44.152) + samtliga ROE/skuld-EK ✓. "Sinch 2024: −6,4 mdr
  resultat" — overifierat (fält ej hittat i JSON).

### V06 EV/EBITDA — GUL
- Tröskeltabellen (rad 81–91) STÄMMER EXAKT mot kärnans `poangEvEbitda`
  inklusive värdefallehålet ("< 4× | 5 ENDAST om V19 ≥ 3 — annars max 3")
  och negativ-EBITDA ⇒ 0. Osatt-haneringen (evEbitda saknas i kontraktet)
  redovisas ärligt och korrekt. Genomräkningen 115/20 = 5,75× ✓.
- FEL: parenthesen "(V19 kvalitet på kassaflödet/fonden)" (rad 57) — V19
  är KASSATÄCKNING/nyemissionsrisk i kärnan, inte "fonden"; villkoret
  (V19 ≥ 3) är dock korrekt angivet.
- Tveksam riktning: "att lägga EV på EBIT … skulle systematiskt
  övervärdera kapitalintensiva bolag" (rad 95–96) — kärnans egen logik
  (scorV08, rad 259 i karna.ts) säger "systematiskt underskatta"; EV/EBIT
  är JÄMFÖRT med EV/EBITDA-trösklar alltid högre → poängen underskattas.
  Underlagets "övervärdera" är bakvänt eller minst förvirrande.
- Textfel: "deras bankers" (rad 25 — engelsk genitiv); "multipliceln"
  (rad 51); "imple-/menterad" (rad 97, avstavat utan bindestreck);
  "ser ut som ett kap" (rad 57 — oklar formulering).

### V07 Bruttomarginal — GUL
- Tröskeltabellen STÄMMER EXAKT mot kärnans scorV07 (R2 §6 konkav med
  platt topp, 5 p endast med 5-årigt snitt > 70 %) — inklusive rätt
  exempel-poäng (Volvo 24,4 % → 1; Kambi 98,9 % → 4 med *-villkor).
- Talen alla bekräftade: Evolution 100,0 ✓ (bruttoMarginal 1), Kambi
  98,9 ✓, Atlas 42,2 ✓, Assa 43,1 ✓, Alfa Laval 36,3 ✓, Volvo 24,4 ✓,
  Sinch 18,4 ✓, Swedbank 0,0 ✓. "ur universumets 195" — RÄTT.
- Textfel: "noterna är din friend" (rad 79 — engelska direkt till svenska
  kunden); "Industrivärden/Kinnevik-visar" (rad 73 — mellanslagsfel som
  bryter meningen).
- Universummedianen 47,8 % — overifierbar i studions skal (se metod).

### V08 EBITDA-marginal — GUL
- SUBSTANS: påståendet att tröskelfamiljen som väntar är "lönsamhets-
  kategoriens konkava mönster (som V07/V09)" (rad 96–98) MOTSÄGER kärnan,
  som dokumenterar LINJÄRA trösklar för V08 i scorV08:s osatt-text:
  "≥25 ⇒ 5, ≥15 ⇒ 4, ≥10 ⇒ 3, ≥5 ⇒ 2, annars 1" (samma som RAKNARE).
- Talen bekräftade: Industrivärden 99,9 ✓ (0.9988), Evolution 57,8 ✓,
  Swedbank 51,4 ✓, Atlas 20,6 ✓, Sandvik 19,7 ✓, Alfa Laval 16,2 ✓,
  Assa 16,9 ✓, Volvo 10,4 ✓, Ericsson 12,5 ✓, Sinch 2,5 ✓.
- Textfel: "ser Arsenal-lönsamma ut" (rad 72 — nonsens-ord); "är ingen
  kornett" (rad 74 — obegripligt); "modellens datoheder" (rad 100 — ska
  vara dataheder); "Evolution brutto 100 % → EBITDA-drift 57,8 %"
  (rad 66 — det är EBIT, inte EBITDA; tabellen säger rätt).

### V09 ROE — GUL
- Tröskeltabellen STÄMMER EXAKT mot kärnans scorV09 (<9 ⇒ 0 … >35 med
  5-årssnitt OCH skuld/EK ≤ 2 ⇒ 5) och samtliga 10 exempelpoäng är rätt
  med hävstångs- och uthållighetslogik (Mastercard 4 p pga 4,40 > 2 —
  kärnans v10Forhand-mekanism korrekt beskriven).
- Talen alla bekräftade: MA 241,2/4,40 ✓, Boeing 173,5/7,91 ✓, Apple
  148,8/0,78 ✓, Ericsson 26,1/0,38 ✓, Atlas 25,7/0,34 ✓, Volvo 20,9/1,47
  ✓, Alfa Laval 19,1/0,46 ✓, Handelsbanken 12,8 ✓ (0.1275), Sinch 1,9 ✓,
  Kinnevik −21,6 ✓.
- Textfel: "balansräkningen är MEGET skuldfylld" (rad 79 — norskt
  adverb; svenska = MYCKET); "Närmaren till 9 %" (rad 69 — konstig
  rubrik). "ur universumets 195" — RÄTT. Median 15,3 % — overifierbar.

### V10 Skuldsättningsgrad — GUL
- Trösklar EXAKTA mot kärnans raknaV10 inklusive negativt-EK ⇒ osatt;
  samtliga exempel-poäng rätt (Nintendo 0,00→5 … Boeing 7,91→1).
- Talen bekräftade exakt: Nintendo 0,00 ✓, Beiersdorf 0,01 ✓, Evolution
  0,02 ✓, Industrivärden 0,03 ✓ (0.028), Alfa Laval 0,46 ✓ (0.4575),
  Volvo 1,47 ✓, Boeing 7,91 ✓, Simon Property 5,04 ✓, Mastercard 4,40 ✓.
- Textfel (flest i biblioteket): "hur djårt ett bolag kan falla" (rad 19);
  "kýnda återbetalningsprofiler" (rad 36); "(rörande resultat ÷ finansiella
  kostnader)" (rad 33–34 — ska vara rörelseresultat); "ränttäckningen"
  (rad 35); "olika snitt av skuldorna" (rad 31 — skulderna); "högrofitabelt"
  (rad 79); "underwater-presterar" (rad 80 — ånglicism); "femborgarna"
  (rad 56 — oklart ord); mjuk bindestreck i tabellcellen
  "finansieringsbolag" (rad 51 — renderas fel i UI).
- Median 0,52× — overifierbar (skal).

### V11 Likviditet — GRÖN
- Exempel på hur osatt ska hanteras: citerar kärnans egen dokumentation
  ("karna.ts rad 304" — korrekt rad) och ger förslagstrappen EXPLICIT
  märkt "inte modellens kod". Övningsräkningarna kontrollräknade:
  13,6/9,8 = 1,39 ✓; 19,6/9,8 = 2,0 ✓; 6,0/8,7 = 0,69 ✓.
- Mindre: "Kvoten 1,0 betyder jämna svar" (rad 16 — konstig formulering).
- Inga källtal att missa — kvalitativt korrekt mot kärnan (scorV11 osatt).

### V12 Intäktsstabilitet — GUL
- Trösklarna STÄMMER EXAKT mot kärnan (CV ≤5⇒5, ≤10⇒4, ≤20⇒3, ≤35⇒2,
  >35⇒1, osatt-grenar). TOLV bolags CV omräknade från källans serier —
  ALLA stämmer: H&M 2,2 % ✓, Sinch 2,5 % ✓, Truecaller 4,0 % ✓, Nordea
  5,9 % ✓, Volvo 6,5 % ✓, Axfood 6,9 % ✓, Atlas 8,4 % ✓, HB 8,6 % ✓,
  Alfa Laval 10,6 % ✓, SSAB 11,5 % ✓, AZN 11,7 % ✓, Kinnevik 167,7 % ✓
  (EXAKT med råserien 0/936/23/0 Mkr). Starkaste talunderlaget i hela
  biblioteket.
- METODFEL med poängpåverkan: kalkylbladsformeln "`=STDAV.S(...)/MEDEL
  (...)`" (rad 24) — STDAV.S är STICKPROVSSD (÷ n−1) men kärnan räknar
  POPULATION (÷ antal år, karna.ts rad 322 delar på tal.length). Med 4
  år ger elevens uträkning ~15 % högre CV än kärnan — kan flytta poäng
  vid trösklarna (t.ex. H&M 2,4 % vs kärnans 2,2 %; värsta fallet: tal
  precis vid en tröskel). Rättning: STDAV.P.
- Funktionsnamnet "raknaV12" (rad 76) — heter scorV12 i kärnan.
- Textfel: "note om valutaeffekter" (rad 69 — engelska). Kärnans
  minimumkrav "≥ 3 årtal" nämns inte bland osatt-grenarna (mindre).
- "universumet bär fyra bokförda år, 2022–2025" — ✓ bekräftat i serierna.

### V13 Patent & IP — GRÖN
- Kvalitativ utan påhittade trösklar — korrekt mot kärnans scorKvalitativ.
  Moat-uppgiften "ifyllda hos 51 av 195 bolag" ✓ EXAKT (grep -c = 51).
  IFRS-notisen om internt skapad IP pedagogiskt stark. Inga fel hittade.

### V14 Varumärke — GRÖN (med anmärkningar)
- Kvalitativ, korrekt mot kärnan. Anmärkningar: "IFRS-notis igen"
  (rad 31 — norska; svenska = not); "Mode och cykel varumärken förslits"
  (rad 62–63 — särskrivning); "tillfällig pristäkt position" (rad 82 —
  oklart ord). Strukturen komplett, kundsäker ton.

### V15 Nätverkseffekter — GRÖN
- Kvalitativ, korrekt mot kärnan. Metcalfe n² korrekt beskriven med
  förnuftig nyansering ("i praktiken oftast långsammare"). Gränsdragningen
  nätverk/ekosystem/skala (Truecaller/Microsoft/Sinch/Evolution) håller
  måttet. Inga fel hittade.

### V16 Produktlanseringar — GUL
- Kärncitatet (rad 67–72) ÅTERGES EXAKT från scorKvalitativ — korrekt.
- Textfel (sex): "kollektionsbara händelser" (rad 17 — nonsens-ord);
  "kvartals- eller årstdatum" (rad 23); "det är indikators råmaterial"
  (rad 23–24 — ska vara indikatorns); "Volvo visarprogram med långa
  beslutsled" (rad 47–48 — saknat mellanslag bryter meningen);
  "säljarstal per titel" (rad 41 — ska vara säljtal); "efterfråge-
  katylyser" (rad 62 — stavfel).

### V17 Avtal & Partnerskap — GRÖN (med anmärkningar)
- Kvalitativ, korrekt mot kärnan (scorKvalitativ osatt). Poängguiden är
  analytikernivå, rimlig. Anmärkningar: "licentieringsavtal" (rad 10 —
  ska vara licensieringsavtal); "Pressmeddelandets vs redovisningens
  språk" (rad 57 — engelsk förkortning); "LoI/MoU i pressmeddelandet,
  saknas avtalet i rapporten" (rad 31–32 — haltande meningsbyggnad).

### V18 Regulatoriska — GRÖN (med anmärkningar)
- Kvalitativ, korrekt mot kärnan. Anmärkningar: "saknation/export"
  (rad 50 — ska vara sanktion); "riskavsnitten listar allt lagliga"
  (rad 63 — grammatik, ska vara t.ex. "allt som är lagligt"); "regulatorik"
  (rad 23 — icke-etablerat ord).

### V19 Kassatäckning — nyemissionsrisk — GRÖN (med anmärkningar)
- DEN KRITISKA FILLEN ÄR SUBSTANSMASSIGT PERFEKT: klippkurvan STÄMMER
  EXAKT mot kärnan (<12 ⇒ 0 + HÅRD PORT komposit max 45/100; 12–18 ⇒ 1;
  18–30 ⇒ 2; 30–48 ⇒ 3; >48 ⇒ 4; FCF 5/5-proxy ⇒ 5) med exakta talen
  12/45 och BESLUT §5-referens. Kurs-slug "v19-kapitalforbranning" ✓
  matchar VARIABEL_META (filnamnet avviker medvetet — ok).
- Talen bekräftade EXAKT: VPLAY-B 6,8 ✓, PSNY 15,2 ✓, PCELL 16 ✓,
  Kinnevik 813,5 ✓; "ifyllt hos fyra bolag" ✓ (grep = 4) och "övriga
  191" ✓ (195−4 internt konsistent).
- Anmärkningar: "Det är juridiken i modellform" (rad 91–92 — förvirrande,
  borde vara logiken; V19 har inget med juridik att göra); "månadsburn"
  (rad 25 — ånglicism; texten använder annars månadsförbrukning).

### V20 Återköp av egna aktier — GRÖN (med anmärkningar)
- Trösklar + ALLA reservgrenar STÄMMER EXAKT mot kärnans scorV20
  (≥5⇒5 … utspädning ⇒ 0; belopp⇒3; insider ≥3⇒2; nyemissioner⇒0;
  andel > 1 vägras som utom intervall). Slug ✓.
- Talen bekräftade: Apple insiderköp 10 ✓, Microsoft 6 ✓, "ifyllt hos
  108 bolag" ✓ (grep = 108).
- Anmärkningar: tabellraden "övriga 106 | 0 | osatt" (rad 41) är
  förvirrande — poängkolumnen säger 0 och Not osatt (stämmer med
  kärnans visningslogik men bör förklaras); "schablonmässiga planpjässer"
  (rad 60–61 — oklart ord).

## README.md (status-tabellen) — FEL ATT RÄTTA FÖRE VÅG 200
- 20 rader ✓, LEVERERAT-indikatorer ✓ (alla filer existerar), indikator-/
  kategorinamn ✓ mot VARIABEL_META — MEN: "189 noterade bolag, 10
  branscher × 10" är fel på två sätt (antal = 195; 10×10 = 100 stämmer
  med inget); vikt-kolumnen (8 %/6 %/KRITISK) är den övergivna
  112 %-tabellen — bör få en not om uniform 1/20 i akm1-klassisk
  (KRITISK = pedagogisk etikett) med hänvisning till src/lib/akm2/vikter.ts.

## HELHETS-DOM: NO-GO för kodintegration (våg 200) — tills 8 rättningar

Substansen är stark: trösklarna i V04–V12/V19/V20 stämmer EXAKT mot
modellkärnan (inklusive V19:s hård port 12 mån/45 p), talpariteten mot
bolagsunivers.json är nästan felfri (28 bolag stickprovsmätta; tolv tolv
CV-värden omräknade utan avvikelse), inget underlag lutar på evEbit-
skrapen, och juridikgrinden håller i alla 20 (utbildningsform överallt,
korrekt lagrum 2007:528, inga köp/sälj-påståenden). MEN: 11 av 20 filer
har kundsynliga språkbrott och tre har substansavvikelser som inte får
 nå kunden eller kodmappningen ("aldrig igen nå kundens ögon", våg 105).
 Rättningarna är snabba (textbearbetning + en tabellbyte) — därefter GO.

Blockerande rättningar (nummerordning = prioritet):

1. `underlag-v01-forsaljningstillvaxt.md` — BYT tröskeltabellen (rad
   82–88) till kärnans goldilocks-kurva ur scorV01 (< −10 % ⇒ 0; −10–0 %
   ⇒ 1; 0–10 ⇒ 2; 10–20 ⇒ 3; 20–30 ⇒ 4; 30–45 % ⇒ 5 ENDAST med
   bruttomarginal ≥ 30 %, annars 4; 45–60 % och > 60 % ⇒ 4 med
   hållbarhetsrabatt) — eller märk nuvarande tabell explicit som
   "kalkylatorns AKM1-läge" och lägg kärnans kurva bredvid. Tröskel-
   pariteten är kodintegrationens kärnkrav.
2. `underlag-v08-ebitda-marginal.md` — RÄTT tröskelpåståendet (rad 95–98):
   tröskelfamiljen som väntar är LINJÄR (≥25⇒5, ≥15⇒4, ≥10⇒3, ≥5⇒2,
   annars 1 — kärnans dokumentation + RAKNARE), inte "konkava mönster
   (som V07/V09)"; rätt även "Arsenal-lönsamma", "kornett", "datoheder"
   och "EBITDA-drift 57,8 %" (det är EBIT).
3. `underlag-v12-intaktsstabilitet.md` — BYT `=STDAV.S(...)` till
   `=STDAV.P(...)` (kärnan räknar population: SD ÷ antal år, inte n−1 —
   annars får eleven ett annat poängutfall än modellen vid trösklar);
   rätt funktionsnamnet raknaV12 → scorV12; "note" → "not".
4. `underlag-v05-pb.md` — RÄTT "148,7 % ROE" (rad 84–85) till 148,8 %
   (källan 1.4875; tabellen redan rätt); rätt "kunnigor", "motsubstans-
   värde", "välutfodrade", kolumnrubriken "Les", "ROE-driver multippel".
5. `underlag-v06-ev-ebitda.md` — RÄTT V19-beskrivningen "(kvalitet på
   kassaflödet/fonden)" till kassatäckningspoängen (V19 ≥ 3 = minst
   30–48 mån kassatäckning enligt klippkurvan); vänd "övervärdera" →
   "underskatta" (kärnans logik: EV/EBIT på EBITDA-trösklar ger för låg
   poäng); rätt "bankers", "multipliceln", avstavningen "imple-
   menterad", "ett kap".
6. Språkrensning (kundsynliga brott): `v02` "itself", "possum-
   tillväxten", "Baklog" + rubriken "modellens trösklar" → "riktlinje
   vid manuell poängsättning" (samma ändring i `v03`); `v03`
   "åtta*sinat" + verbet "är"; `v07` "friend", "Industrivärden/Kinnevik-
   visar"; `v09` "MEGET"; `v10` "djårt", "kýnda", "rörande resultat",
   "ränttäckningen", "skuldorna", "högrofitabelt", "underwater-
   presterar", mjuka bindestreck i tabellcell; `v16` "kollektionsbara",
   "årstdatum", "indikators", "visarprogram", "säljarstal",
   "katylyser"; `v18` "saknation", "listar allt lagliga"; `v14`
   "notis"; `v17` "licentieringsavtal"; `v19` "juridiken i modellform",
   "månadsburn".
7. `README.md` + `v01`–`v05`: "189" → 195 överallt; README:s "10
   branscher × 10" rättas till faktiskt antal; lägg not om vikterna
   (uniform 1/20 i akm1-klassisk, KRITISK = etikett — källa
   src/lib/akm2/vikter.ts) i status-tabellen.
8. Efter punkterna 1–7: kör gränssnittsvakten mot de nya sidorna om
   underlagen publiceras som publika sidor (de är i första hand
   deep-courses-innehåll; textkvalitet mäts inte automatiskt — denna
   gransknings textpass är därför den sista spärren).

## Overifierat (ärlighetsregeln)
- Universummedianerna i V07/V08/V09/V10 (47,8 % / 20,8 % / 15,3 % /
  0,52×): oförifierade — studions skal tillät inte sortering/median-
  beräkning av 195 tal (sammansatta kommandon, awk-pipelines och node -e
  hängde; skal-kvotan). Sannolika men ej bevisade.
- V05:s "Sinch 2024: −6,4 mdr resultat": fältet hittades inte i JSON —
  överifierat som källa.
- V01:s Apple-tal "−2,8/+2,0/+6,4 % räkenskapsår": ej sökbara i JSON
  (TTM-fältet 0.164 ✓ är verifierat; årsförändringarna inte).

## Sammanställning
GRÖN 9 · GUL 11 · RÖD 0. Ingen fil är arkitektoniskt fel; inga
trösklar är bakvända utom V01:s tabellval och V08:s tröskelpåstående;
en enda talmotsägelse (V05). HELHETS-DOM: NO-GO tills rättningarna
1–7 ovan är verkställda — därefter är biblioteket MOGET för våg 200.
