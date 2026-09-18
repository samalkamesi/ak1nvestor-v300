# KONTROLL 2026-09-17 — kvartalspaket sa-laser-du-jnj-q3-2026 (Johnson & Johnson, rappdag 2026-10-13)

**Granskare:** agentfabrik s1-u2 (omgång auto-s1-1789673729457) · **Anspråk:** `data/vakten/auto-s1-1789673729457-u2-ansprak.md` (satt ~21:52 lokal, FÖRE arbetet)
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-jnj-q3-2026.json` — byggt 2026-09-17 16:44 av s4-u3 (commit `30cf322a`), KVD:at av byggaren, detta = första **oberoende** granskningspaketet
**Sonder:** `verktyg/_s1u2-jnj-verify.mjs` (läser, skriver inget) + `verktyg/_s1u2-jnj-diff.mjs` (bygger diff.json) · utkast-JSON:n orörd av granskaren

## 0. Val enligt köregeln (pivot bokförd)

Uppdragstitelns "m9-utkast #2" är mall-platshållare: gamla m9-ko #2 (branschmedianer-akm2)
komplett sedan 09-16 07:53, våg 171-tillskott #2 (substansrabatt) levererat 09-17 15:11,
hela m9-ko 6/6 sedan 09-16 14:35. m9-ytans enda kvarvarande (tillskott #1
sa-tolkar-du-utdelningskalendern) **klaimat 21:38 lokal av syskon u3 i denna omgång**
(anspråksfil läst FÖRE mitt val; klaim-protokollet: först till kvarn) ⇒ pivot till
kvartalsseriens dokumenterade FIFO-regel ("tidigaste återstående rappdag", två omgångars
praxis): granskade är hm-b 09-24, nike 10-01, industrivärden 10-07, ericsson/nordea 10-15,
volvo-car, holmen ⇒ **tidigaste ogranskade = JNJ 2026-10-13**. NP3 10-16 historiskt utpekat
som syskonens val — JNJ även kollisionsminimerat.

## 1. Källor — grönt, med vintage-låsning

- **Universumet git-låst vid byggcommiten:** `git show 30cf322a:…bolagsunivers.json` = **159
  bolag, 16 i hälsa** — utkastets påståenden exakta, och **dagens träd är oförändrat 159/16**
  (vintage = aktuellt; inget har rörtts under paketets liv).
- **JNJ-raden fält för fält:** pris 275,21 · MV 663,228 mdr · USD · Yahoo 2026-09-03
  (quoteSummary-moduler) + MarketStack dubbelkoll (slutkurs 2026-09-02) — allt överensstämmer
  med utkastets källnotis i detalj (även MarketStack-datumet).
- **Osatta fält verifierade som osatta:** räntetäckning null, återköp null, moat-fält null ×3 —
  utkastets ärlighetsavsnitt ("Där filen är tyst är paketet tyst") håller maskinellt.
  `insiderkopSenaste6man = 6` ✓ ("filen noterar 6 insiderköp").
- **Kalender:** `kalender-halso.json` JNJ-post = "2026-10-13 (tisdag; siffror och webcast samma
  morgon, samtal cirka 08:30 ET)" med bolagets IR-sida som källa ✓. Sond: 2026-10-13 = tisdag
  (UTC). "En vecka före huvudfönstret 20–23/10" = 7 dagar ✓.
- **Urvalsmotiveringen verifierad:** GS och JPM finns i universumet med **tomma
  resultatserier** (`serier.resultat = []`) — utkastet påstående "saknar resultaträkningshistorik
  hos källan (serierna är tomma)" är sant; JNJ:s "fyra räkenskapsår" = seriens 4 år ✓.
- **SEB-notisen:** kalender-finans listar SEB med tyst period 2026-10-01–10-21 (~3 veckor) —
  "SEB:s ett dygn till flera veckor" får stöd för veckoränden; spannet "ett dygn" inte
  motbevisat (notis, ingen rättning).

## 2. Siffror — 15/15 tabellvärden + 15/15 rang + ~40 aritmetikkontroller

- **Tabellen (15 mått × värde/hälso-median/universum-median/rang):** JNJ:s egna värden ALLA
  exakta mot filen (P/E 31,453 · P/B 7,80 · EV/EBIT 24,191 · PEG 4,32 · FCF-avk 2,55 % ·
  ROE 25,74 % · ROIC 21,32 % · brutto 68,14 % · EBIT 29,19 % · netto 21,48 % · FCF-marg
  17,24 % · skuld/EK 0,58 (0,5771) · prognos 11,3 % · res-CAGR 14,32 % · oms-CAGR −0,26 %).
  **Alla 15 rangpositioner exakta** med egen omräkning (fallande sortering per mått; nämnarna
  14/15/16 = mätta per fält, korrekt redovisade).
- **METODFYND (C1):** samtliga 45 medianceller följer **övre-mittersta-metoden** vid jämnt
  antal mätta; projektets kanon (`src/lib/dataset-nyckeltal.ts` `median()` och peer.ts) använder
  **medel av mittersta**. 6 hälsomedianer + 5 universummedianer skiljer mellan metoderna
  (brutto 72,79/70,99 · EBIT 29,19/27,71 · netto 17,02/13,41 · FCF-marg 14,27/14,08 ·
  prognos 19,9/15,6 · res-CAGR 9,0/5,1 · universum: EBIT 20,81/20,71 · FCF-marg 12,51/12,32 ·
  FCF-avk 3,80/3,77 · P/B 2,850/2,829 · P/E 20,525/20,522). **Konsistenskonsekvens:** den
  länkade datasetsidan `/dataset/halso/netto-marginal` visar LIVE **"Median 13,4 %"** medan
  paketet skriver 17,02 för samma mått — kunden som klickar ser två tal. Ingen tabellcell är
  i sig fel; metodvalet är odeklarerat och skiljer mot länkade ytor. (Holmen-paketets notis
  "servade dataset-sidor visar äldre medianer tills nästa prod-bygge" gäller cache, inte
  metod — 13,4 % är kanonmetodens tal på aktuellt underlag.)
- **Aritmetik (egna omräkningar, konsekventa mdr USD):** identitet 30,30/3,8 %/3,30 % ✓ ·
  absolutkontroll 843,1 mdr, residual +27,1 % (= descriptionens eget tal), implicit 21,08 mdr,
  21 % lägre än bokfört ✓ · EK 85,0 · ROE-kors 24,80 % (inom en procentenhet av fältet) ✓ ·
  skuld 85,03×0,5771 = 49,1 ✓ · EV 712,3 ✓ · EBIT 27,49 mdr ✓ · EV/EBIT med/utan skuld
  25,9/24,12 (0,3 % från fältet = slutsatsen "fältet räknar EV utan skulden" HÅLLER) ·
  FCF 16,24 mdr → 2,45 % (4,0 % från fältet — inom hållhaken, som texten påstår) · PEG 2,78 /
  implicit 7,28 ✓ · CAGR 14,32/−0,26 på öret ✓ · steg ±95,94/−59,99/+90,56 ✓ ·
  nettomarginalserie 18,90/41,28/15,84/28,46 ✓ · **scenarioruta 9/9 celler exakta** (som
  tusen-USD-tal — se fynd A1g) · marginalvikt 1,14 ✓ · 0,94 mdr/procentspånga ✓ ·
  TTM-marginal 22,4 % · P/E-premie 26,7 % ✓ · Lilly 1 034 mdr ✓.
- **Kenvue-historiken korrekt:** 2023 = separationsåret (IPO maj 2023, full avveckling aug
  2023), 2024 = första hela året utan — textens "vulkanåret" och seriens steg stämmer med
  bolagets redovisade historia.

## 3. Fynd — 9 byt (A1a–i + A2) + 6 byt (B) + 6 förslag (C) i diff.json

| Id | Klass | Kort |
|---|---|---|
| A1a–i | **byt, väsentligt** | **Systematiskt enhetsfel:** universumfilens serier lagras i USD (26 804 000 000 = 26,804 mdr); utkastet har klistrat in råtalen och märkt dem MUSD/mdr — derivaten blir förstorade tusenfalt: "843066212,0 mdr USD", "+127115494,0 procent" (descriptionen själv skriver +27,1 %!), "31523277,06 %", "27494936,7 mdr USD", EV-kedjans "0,00 (+-100,0 procent)", FCF-parets "2448460,14 % … inom femprocentiga hållhaken" (självmotsägande), "941 930 000 MUSD", scenariorutans 9 celler (tusental märkta mdr), serietabellens "MUSD"-rubrik. **Alla rättvärden sondbekräftar; slutsatserna opåverkade — presentationen rättas i 9 poster** |
| A2 | byt | "TTM-spårets runt 0,0 %" → runt **22,4 %** (21,086/94,193); "0,0 %" stöds av inget tal i paketet |
| B1 | byt | Övning 2:s räkneväg: "24,82 × 663,228 ÷ 31,45 ≈ 523,3 mdr … 2382 procent över" — rätt: 663,228 ÷ 24,82 ≈ **26,7 mdr** (27 % över); uttrycket saknar ekonomisk tolkning |
| B2 | byt | "volym slår marginal — tre procent försäljning flyttar EBIT mindre" — självmotsägande; sond: 2 pp marginal = 1,88 mdr > 3 % volym = 0,82 mdr ⇒ "marginalen slår volymen" |
| B3a+b | byt | Dubbelpåstående: "fjärde plats … bland de USA-noterade" OCH "näst störst efter Eli Lilly" — filen: LLY 1 034 > JNJ 663 > **ABBV 462,9** > PFE 157 > BSX 70; JNJ är 2:a, och **Abbott finns inte i universumet** (bolaget efter JNJ är AbbVie) |
| B4 | byt | "rightfärdigar" → "rättfärdigar" |
| B5 | byt | Citationsteckenfel: `" borde"` → `"borde"` (mellanslag inuti citatet) |
| B6 | byt | "mer än en recessionsår" → "ett recessionsår" |
| C1 | förslag | Medianmetod-deklaration (se §2) + omformulering av "0,3-procentaren … precis på medianen" som endast gäller upper-metoden (med kanon ligger JNJ 1,5 pp över) |
| C2 | förslag | "18 paket" i fönstret 20–23/10 — sammanställningen räknar 19 (inkl. AT&T, byggd parallellt; 18 plausibelt byggläge) |
| C3 | R2-notis | publishedAt = rappdagen 10-13; nike/hm-b/holmen-praxis = dagen före (10-12) — publiceringstidpunkten är kundens beslut |
| C4 | förslag | "det är fältet som hållhaken lit på" — bruten formulering |
| C5 | förslag | EBIT-marginal-raden länkar /dataset/halso/netto-marginal (annat mått; ingen EBIT-aspekt finns) — avlänka el. behåll som medveten konvention |

Samtliga 22 posters sökstränger **maskinellt verifierade unika** i filen (U+00A0 i
tusentalsavgränsningarna bevarad i gamla stränger; A1g + A1i är blockposter — verkställ helt
eller inte alls).

## 4. Juridik (2007:528) — REN

- **Varumärkesgrind** (kontrolleraText-replik: `data/varumarke.json` 26 regexer på title +
  description + varje kroppsrad): **0 FEL, 0 varningar**.
- **Rådord** "köp"/"sälj": 2 träffar, **båda i den negerade disclaimern** ("Inga köp-, sälj-
  eller hållningsrekommendationer förekommer") — kontextverifierade.
- **Investeringsråd endast negerat:** ingress syftar inte, men slutsatsmeningen "ett
  utbildningsmoment, inte ett handläge" + disclaimern "finansutbildning … inte
  investeringsrådgivning" (sista rad, negerad) ✓. "borde"-citatet i negerad konstruktion ✓.
- **Lagrum:** endast 2007:528 2 kap 5 § (disclaimern) — ingen lagrumsblandning.
- **911-kontroll: 0 träffar på 6 mönster** (911 · 9/11 · 11 september · september 11 ·
  nine-eleven · 9-1-1).
- **Personnamn:** inga individer nämns (manuell genomläsning; Reg FD-beskrivningen är
  lagtextfri och korrekt).

## 5. Länkar — 20/20 gröna

20 unika interna länkar, **alla HTTP 200 mot localhost** (17 dataset-aspekter + /bolag/jnj +
/transparens + /kallor + /kurser); 0 länkar till outgivna utkast. Dubbellänksnotisen = C5.
Residualtrappan korsbevisad mot syskonpaketen: holm +10,3 ✓ · yara −9,2 ✓ ·
hydro −31,2 ✓ · sca −44,4 ✓.

## 6. Struktur — inom familjepraxis (inga fynd)

9 fält (BlogPost) ✓ · slug ✓ · pillar "Institutionell metodik" ✓ · author ✓ · 1 859 ord ·
**title 100 / desc 564 tkn / readingMinutes 4 — inom kvartalsfamiljens samtliga span**
(syskon: ord 1 068–2 742, minuter 4–7, title max 314, desc max 1 057; mätt 2026-09-17 på
fönstrets 35 paket — u2:s TILLÄGG-läxa tillämpad: prissättning mot RÄTT släktes praxis) ·
8 H2 · 0 mjuka bindestreck · body ≥ 800 ✓.

## 7. Dom

**FLYTTKLAR EFTER RÄTTNING.** Källor, värden, rang, kalender och juridik genomgående gröna;
innehållets alla slutsatser (identitet, absolutkontrollens riktning, TTM-konvergensen,
EV-utan-skuld-fyndet, CAGR-fällan, marginalvikten) sondbekräftade med egna omräkningar.
Rättningarna är presentationens: A1-serien samlar det systematiska enhetsfelet i nio
blockposter, A2 + B1–B6 är konkreta felaktigheter (varav B3 namnfelet Abbott/AbbVie och
platsfelet 4→2). C-posterna = ägarens beslut (C1 metoddeklaration rekommenderas varmast —
datasetsidornas live-tal annars ett klick från att motsäga paketet). Publicering = kundens
klick (R2). **src/ orörd = INGET bygge** (tsc-baslinjen vilar i pre-commit-grinden); R2 orörd
(priser/tier/publicering); data/blogg/ orörd; utkast-JSON:n orörd av granskaren.
