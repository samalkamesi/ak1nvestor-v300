# Upphovsrättsgranskning (ÅTGÄRDAD 2026-09-01) av bokmasterkurser — 2026-09-01

**Mål:** `data/bokmaster/*.json` — granskning av kursinnehållets upphovsrättsrisker (upphovsrättslagen 1960:729).
**Metod:** 8 slumpvis valda böcker (5 styrda: security-analysis, var-ekonomi, your-money-and-your-brain, the-snowball, when-genius-failed — intelligent-investor.json finns ej i biblioteket; + 3 slumpade via `shuf`: the-psychology-of-money, the-dhandho-investor, the-most-important-thing). För varje bok: (1) maskinell genomgång av samtliga kapitel — alla textpassager inom citattecken (”…”/»…«) extraherade, ord räknade, citatandel per kapitel beräknad, blocktyps-fördelning; (2) fulltextläsning av 3 slumpkapitel per bok (24 kapitel totalt, seed 20260901) med bedömning av citat-, struktur-, substitut-, fras- och quizrisk; (3) strukturmätning mot böckernas faktiska innehållsförteckningar (allmänkunskap + LOC/Wikipedia-verifiering för Dhandho och When Genius Failed).
**Begränsningar:** 3 av 13–20 kapitel per bok har lästs i fulltext; maskinellen citatdetektering fångar citattecken och kan både över- (egna retoriska frågor och begrepp i citattecken räknas med) och underräkna (opmarkerade nära-citat upptäcks endast via fulltextläsning). Granskningen är en juridisk riskbedömning, inte ett juridiskt omdöme.

**Rättslig utgångspunkt:** idéer, fakta, metoder och teorier är fria (1 §, 2 § URL); verkets specifika utformning — formuleringar, disposition i detalj, exemplens sammansättning — är skyddad; korta citat med källangivelse är tillåtna enligt god sed (46 §). Kurserna ska vara fristående pedagogiska verk med egna förklaringar, exempel och quiz — inte referat som substituerar böckerna.

---

## Resultat översikt

| Bok | Citatandel* | Citat >25 ord | Struktur 1:1 | Egen övning/kapitel | Betyg |
|---|---|---|---|---|---|
| security-analysis | 10,9 % | 0 | Nej (20 mot bokens ~50) | Ja (utmaning i alla 20) | **GRÖN** |
| var-ekonomi | 11,7 % | 0 | Nej (15 mot ~60) | Ja (15/15) | **GRÖN** |
| your-money-and-your-brain | 14,6 % | 0 | Delvis (9 känslokapitel i bokens ordning) | Ja (14/14) | **GRÖN** |
| the-snowball | 11,4 % | 0 | Nej (16 mot ~47) | Ja (16/16) | **GRÖN** |
| when-genius-failed | 15,7 % | 0 | Nej (14 mot 11+epilog, egna rubriker) | Ja (14/14) | **GRÖN** |
| the-psychology-of-money | 12,4 % | **1 (49 ord)** | **Ja** (20 essäer → 14 i ordning) | Ja (14/14) | **GUL** |
| the-dhandho-investor | 14,1 % | 0 | Delvis (ramverksordning, omordnat + 3 egna kapitel) | Ja (13/13) | **GRÖN** |
| the-most-important-thing | **18,0 %** | **2 (36 + 28 ord)** | **Ja** (~21 kapitel → 15 i ordning) | Ja (15/15) | **GUL** |

\* Andel ord inom citattecken av samtliga blockord. **OBS: mätetalet är missvisande högt** — merparten ”citat” är egna begrepp ("too big to fail"), retoriska frågor och terminologi i citattecken, inte bokcitat. Verklig bokcitering finns i praktiken bara i the-psychology-of-money och the-most-important-thing (se nedan).

**Totalt: 6 GRÖN, 2 GUL, 0 RÖD.**

---

## 1. security-analysis.json — GRÖN

**Granskade kapitel:** K2 (Investering eller spekulering), K9 (Konvertibla obligationer), K14 (Marknadsnivåerna 1897–1949).

- **Citatrisk:** Inget citat över 25 ord i hela kursen; inga 15–25-ordscitat alls. Den berömda investeringsdefinitionen återges som attribuerad parafras: *”Enligt Graham & Dodd är en investering en operation som efter grundlig analys… lovar kapitalets säkerhet”* (K2 b0) — källangivelse i löptexten och originaltermerna inom parentes (thorough analysis, safety of principal). Korrekt hanterat: en definition är i grunden en idé/metod, och formuleringen är kort, översatt och angiven.
- **Strukturrisk:** Låg-måttlig. 20 kurskapitel mot bokens ~50 i 7 delar; ordningen följer bokens 
arkitektur (fast värde → seniora papper → common stock → intäktsredovisning → balansräkning) men rubrikerna är egna svenska synteser, inte översättningar av kapiteltitlarna. Ingen 1:1-spegling.
- **Substitutrisk:** Ingen. Varje kapitel har eget AKM1-analysblock, egen övning och egen tabell. K9 kopplar konvertibeln till optionslogik och V04–V06; K14 översätter avkastningsgapet till modern checklista.
- **Memorabla fraser:** "margin of safety", "Mr Market" nämns som fria begrepp, citeras aldrig.
- **Quiz:** Testar förståelse med egna distraktorer (K2: varför 'operation' i stället för 'värdepapper'). Historiska data (Dow 381→41) är fria fakta. OK.

**Åtgärd:** Ingen.

## 2. var-ekonomi.json — GRÖN

**Granskade kapitel:** K2 (Marknadens mekanik), K5 (BNP och tillväxt), K14 (Klimat och framtid).

- **Citatrisk:** Inga citat > 15 ord. Citattecknen används för begrepp. Lärobokens innehåll (knapphet, elasticitet, C+I+G+NX, Solow-rest) är textbook-fakta och teorier — fritt material.
- **Strukturrisk:** Låg. 15 kurskapitel mot Eklunds ~60 korta kapitel; kursen följer bokens tre delar (mikro → makro → värld) men med egna rubriker och egen AKM1-mappning.
- **Substitutrisk:** Ingen — tvärtom tydligt tilläggsvärde: K2 översätter elasticitetsläran till multiplmotivering; K5 till V01–V03; K14 bygger egen Stern-mot-Nordhaus-analys kring diskonteringsräntan. Egen svenska kontext (koldioxidskatten 1991, bankkrisen).
- **Memorabla fraser:** N/A (lärobok, inga skyddade signaturfraser återgivna).
- **Quiz:** Testar tillämpning ("Hur kopplar kursen elasticitetsläran till aktievärdering?"). OK.

**Åtgärd:** Ingen.

## 3. your-money-and-your-brain.json — GRÖN

**Granskade kapitel:** K1 (Zweig och den neuroekonomiska vändningen), K12 (Kontrovers II — fri vilja), K14 (Sammanfattning).

- **Citatrisk:** Inga citat > 15 ord. Grahams kända rad om att investerarens värste fiende bär investeraren själv på huvudet återges som attribuerad, omskriven parafras (K1 b2: *”investerarens värste fiende sitter troligen inte i marknaden utan i hans eget huvud”*, införd som ”Graham-formuleringen”). Gränsfall, men kort, angiven och ej ordagrann i originalet.
- **Strukturrisk:** **Måttlig — kursens tydligaste spegling.** Känslokapitlen K2–K10 följer bokens kapitelordning exakt (girighet → förutsägelse → självförtroende → risk → rädsla → överraskning → ånger → lycka → emotion) med rubriker som är nära översättningar. Uppvägs av: 5 egna kapitel (K1 bakgrund, K11–K12 kontroverser som ej finns i boken, K13–K14 kursens egen syntes) samt genomgående egen bearbetning.
- **Substitutrisk:** Ingen. K12 (Libet, Schurger, Dennett, Maguire, Lumosity-vitet) är kursens egen tilläggande analys; K14 bygger egen trappstegsmodell (medvetenhet → träning → struktur → återkoppling).
- **Memorabla fraser:** ”reflexiva/reflekterande hjärnan” nämns som Zweigs terminologi — fria begrepp med angiven källa. OK.
- **Quiz:** Egen pedagogik med distraktorer. OK.

**Åtgärd:** Ingen obligatorisk. Not: behåll andelen egna kapitel (K11–K12, K14) vid framtida upplagor — de är det som håller kursen på rätt sida om fristående-verk-linjen.

## 4. the-snowball.json — GRÖN

**Granskade kapitel:** K4 (Graham — Columbia, GEICO), K6 (Berkshire — bucklan), K16 (Replikerbar?).

- **Citatrisk (citat 15–25 ord: 3 st, samtliga OK):**
  - K1 b2: *”Livet är som en snöboll. Det viktigt är att hitta våt snö och en riktigt lång backe”* — 17 ord, inom citattecken, angiven källa (Buffett till Schroeder, prologen).
  - K12 b1: *”Förlorar ni pengar åt firman är jag förstående. Förlorar ni en flis av firman rykte, kommer jag att vara hänsynslös”* — 21 ord, citerat, angiven källa (Buffett till Salomon-personalen). **Gränsfall: över 20 ord — se policy §9.**
  - K16 b1: *”Du behöver inte vara raketforskare. Investering är inte ett spel där killen med IQ 160 slår killen med 130”* — 19 ord, angiven källa. OK.
  Samtliga är uttalanden av Buffett (personyttranden, återgivna av Schroeder), inte Schroeders egen prosa, och alla har källangivelse.
- **Strukturrisk:** Låg. 16 kurskapitel mot bokens ~47; biografins kronologi är historiska fakta och därmed fri.
- **Substitutrisk:** Ingen — K16 är en egen kritisk analys (n = 1, survivorship, float-struktur) som boken själv inte för fram på det sättet.
- **Memorabla fraser:** Mr Market, snöbollen, våt snö/lång backe används som fria begrepp; "sluta gräva när du sitter i ett hål" (K6 b2) attribueras löst ("hans egen formulering") — det är i grunden ett ordspråk, ok men kan preciseras.
- **Quiz:** Testar förståelse och kursens egen analys. OK.

**Åtgärd:** Ingen obligatorisk; frivillig att korta K12-citatet under 20 ord (t.ex. klippa efter ”…är jag förstående.”).

## 5. when-genius-failed.json — GRÖN

**Granskade kapitel:** K3 (Drömlaget), K7 (Guldtiden), K12 (Moral hazard).

- **Citatrisk:** Formell citatandel 15,7 % — men genomgång visar att citattecknen domineras av egna begrepp ("too big to fail", "riskfri") och egna retoriska frågor (K9 b3: »hur har dessa tillgångar rört sig historiskt?«). **Faktiskt bokcitat: i praktiken noll.** Lowenstein parafraseras med angivande källa ("Lowenstein noterar ironin", K3 b1).
- **Strukturrisk:** Låg. Verifierad innehållsförteckning: Meriwether / Hedge Fund / On the Run / Dear Investors / Tug-of-War / A Nobel Prize / Bank of Volatility / The Warning + epilog — kursens 14 kapitel har helt andra, egna tematiska rubriker och indelning; kronologin (Salomon → grundande → 1998 → rescue) är historiska händelser = fria fakta.
- **Substitutrisk:** Ingen. Egen svensk parallell (bankkrisen 1991–93, allmänna bankgarantin 1992 i K12), egen AKM1-mappning (V10/V20-speglingen av kapitalåterlämningen i K7).
- **Memorabla fraser:** N/A.
- **Quiz:** Testar mekanismer ("Varför föll avkastningen 1997?") med egna distraktorer. Siffrorna (43/41 %, 2 och 25, 3,625 md) är fria fakta. OK.

**Åtgärd:** Ingen.

## 6. the-psychology-of-money.json — GUL

**Granskade kapitel:** K5 (Ränta på ränta), K12 (Du förändras), K14 (Kontroversiell ärlighet).

- **Citatrisk — kursens huvudproblem:** Ett verbatim engelskt citat på **49 ord** (K5 b2): *”Good investing isn’t necessarily about earning the highest returns…”* — det är essäns centrala formulering citerad i sin helhet, med angiven källa men över längdgränsen och med substitutkaraktär (citatet bär budskapet, inte kursens egen formulering). Dessutom **staplade dubbelcitat** i K1 b2: *”doing well with money has little to do with how smart you are…”* (18 ord) direkt följt av *”Financial success is not a hard science…”* (22 ord) — sammanlagt ~40 ord verbatim engelska i ett block. Övriga citat är korrekta personcitat (Buffett LTCM-raden, 18 ord; Lynch-raden, 19 ord, båda angivna).
- **Strukturrisk:** **Hög.** 14 kurskapitel speglar bokens 20 essäer i exakt ordning med sammanslagningar (No One’s Crazy → ”Ingen är galen”, Tails You Win → ”Svansar du vinner”, Freedom → ”Frihet” osv.). Ordning och korta titlar är i sig svagt skyddade, och K14 (Housel mot kvant och EMH) är en helt egen kritisk syntes, men mönstret ska noteras.
- **Substitutrisk:** Låg overall — egna övningar, egen datakommentar (Netflix/Monster-statistiken hanteras egenständigt i K12), egen kontroversanalys i K14. Men K5 b0–b2 ligger nära ren referat-nivå: tre block som i huvudsak återger essäns Buffett/Simons-argument utan egen vinkel fram till sista meningen.
- **Memorabla fraser:** Housel-citat återges alltid inom citattecken med källa — bra.
- **Quiz:** Eget pedagogiskt syfte, inga bokens faktarader ordagrant. OK.

**Åtgärd (konkret):**
1. **K5 b2:** korta 49-ordscitatet till ≤ 20 ord (t.ex. behåll *”earning pretty good returns that you can stick with”*-kärnan) eller parafrasera med kvarvarande kort citatdel + källangivelse.
2. **K1 b2:** ta bort ett av de två staplade citaten (parafrasera det ena).
3. **K5 b0–b2:** lägg till ett eget analysblock (t.ex. AKM1-koppling av tidsfaktorn till V20/horisontplanering) så kapitlet inte enbart refererar essän.

## 7. the-dhandho-investor.json — GRÖN

**Granskade kapitel:** K2 (Pateli-motellen), K10 (Pioneer Drilling), K11 (Kleptomani-investeraren).

- **Citatrisk:** Ingen. Citatandelen 14,1 % består av tabellinnehåll och egna frågeformuleringar (falska positiva). Pabrai parafraseras med källangivelse ("Pabrai talar om att köpa… på 20–30 cent per dollar", K2 b1).
- **Strukturrisk:** Måttlig. Verifierad innehållsförteckning (LOC): Patels → Dhandho 101/102 → Man o’ War/Gandhi → Chakravyuha → ramverkskapitlen (Buy Existing, moats, distressed, Kelly, cloning…). Kursen speglar ramverkskapitlens ordning men **omordnar** fallen (Patels först), **hoppar över** fyra av bokens kapitel och **lägger till** tre egna (K3 de nio principerna, K7 motellkalkylen, K13 AKM1-syntes). Ej 1:1.
- **Substitutrisk:** Ingen — tydligast av alla granskade: egna svenska övningar (*”Välj ett cykelbolag på svensk eller nordisk lista”*, K10 b6), egen generalisering till shipping/skog/stål, egen klonboks-metodik i K11.
- **Memorabla fraser:** ”Heads I win, tails I don’t lose much” återges som svensk parafras i K1-rubriken (”vinna stort utan att kunna förlora stort”) — fri idékatalogisering, OK.
- **Quiz:** Testar mekanismer. OK.

**Åtgärd:** Ingen.

## 8. the-most-important-thing.json — GUL

**Granskade kapitel:** K1 (Second-level thinking), K8 (Cykler), K15 (Syntes).

- **Citatrisk — kursens huvudproblem (högst andel: 18,0 %):**
  - **K4 b0, 36 ord:** *”Det finns ingen tillgång så bra att den inte kan bli en dålig investering om priset är för högt…”* — Marks kärnmening citerad i sin helhet på svenska. Angiven källa, men över gränsen och med budskapsbärande karaktär.
  - **K8 b0, 28 ord:** *”Regel ett: de flesta saker visar sig vara cykliska. Regel två: några av de största tillfällena att vinna…”* — Marks två cykelregler citerade i helhet. Angiven källa, men över gränsen.
  - Korrekta korta citat: "You can’t predict. You can prepare." (6 ord, K8 b3); ”deep, complex and convoluted” (3 ord, K1 b1); Galbraith-raden (19 ord, K14 b0); ”Att ligga för tidigt framför sin tid är… oskiljaktigt från att ha fel” (15 ord, K13 b1) — samtliga med källa och under 20 ord.
  - Notera också att kursen har lägst totalordantal (5 175) och högst citatandel — citaten väger tyngst här av alla åtta.
- **Strukturrisk:** **Hög.** 15 kurskapitel speglar bokens ~21 kapitel i exakt ordning med direkttolkade rubriker (Second-Level Thinking, Value, Price/Value, Risk ×3, Cycles, Pendulum, Bargains…). Uppvägs delvis av egna synteser (AK1TS-kopplingen i K8, memo-övningen i K15).
- **Substitutrisk:** Låg-måttlig. Egen memo-pedagogik, egna tabeller, egen analys — men K8 b1–b2 är komprimerade referat av bokens fyra cykler respektive kreditcykelsmekanik utan egen vinkel utom AK1TS-orden.
- **Memorabla fraser:** Signaturfraser citeras alltid inom citattecken med källa. OK.
- **Quiz:** Testar tillämpning. OK.

**Åtgärd (konkret):**
1. **K4 b0:** korta 36-ordscitatet — behåll t.ex. *”ingen tillgång så bra att den inte kan bli en dålig investering”* och parafrasera resten.
2. **K8 b0:** behåll *”Regel ett: de flesta saker visar sig vara cykliska”* ordagrant, parafrasera regel två.
3. Överväg ett eget kapitel utanför bokens disposition (motsvarande Zweig-kursens K11–K12) för att tydligare bryta 1:1-speglingen.

---

## 9. Sammanfattning och policy

### Övergripande bedömning
Bokmasterbiblioteket håller **god upphovsrättslig nivå**: samtliga åtta granskade kurser är i huvudsak fristående pedagogiska verk — egen svenska prosa, egna övningar (utmaning i 100 % av 116 lästa kapitels bokfilsvärd), egna tabeller, konsekvent källangivning vid citat och parafras ("citerad öppet", "Marks:", "Lowenstein noterar"), samt quiz som testar tillämpning i stället för bokens faktarader. **Ingen kurs kräver omskrivning (0 RÖD).** Riskerna är koncentrerade till två kurser med för långa citerade kärnformuleringar och till ett generellt mönster av kapitelspegling.

### Två viktigaste fynden
1. **Tre citat överstiger 25 ord och bär budskapet i stället för att illustrera det:** the-psychology-of-money K5 b2 (49 ord, verbatim engelska), the-most-important-thing K4 b0 (36 ord) och K8 b0 (28 ord). Alla har källangivelse, men längd + budskapsbärande funktion gör dem till de tydligaste enskilda riskerna i biblioteket. Åtgärd: korta till ≤ 20 ord eller parafrasera. (GUL × 2.)
2. **Strukturmässig spegling hos essä-/ramverksböckerna:** the-psychology-of-money, the-most-important-thing och (i lägre grad) your-money-and-your-brain följer källböckernas kapitelordning 1:1 med nära översatta rubriker. Kapitelordning och korta titlar är svagt skyddade och kurserna är innehållsligt transformerande — men kombinationen förstärker intrycket av bearbetning av verket. De kurser som bryter dispositionen med egna kapitel (Zweig-kursens kontroverskapitel, Dhandho-syntesen) är modellen.

### Generella mönster
- **Citatteckens-statistiken överdriver risken:** 11–18 % ”citatandel” består till största delen av egna begrepp, terminologi och retoriska frågor. Verklig bokcitering finns i princip bara i the-psychology-of-money och the-most-important-thing.
- **Källangivelsedisiplinen är genomgående stark** — varje faktiskt citat i samtliga 24 lästa kapitel har författare/bok angiven i löptexten. Detta är grunden för 46 §-skyddet och bibehålls.
- **Substitutrisken är låg systematiskt:** varje läst kapitel innehåller eget analysblock (AKM1/AK1TS-brygga) + egen övning. De svagaste styckena är referatblock utan egen vinkel (PoM K5 b0–b2; TMIT K8 b1–b2) — inte olagliga, men de är ställen där eget tillägg billigast höjer fristående-karaktären.
- **Quiz är överlag säkra:** egna distraktorer, tillämpningsfrågor; historiska siffror och personfakta är fria fakta.

### Policyregler (förslag till stående regler vid produktion/revidering av bokmasterkurser)
1. **Max 1 citat per kapitel, högst 20 ord, alltid med källangivelse i löptexten** (författarnamn eller boktitel i anslutning till citattecknet).
2. **Inga citat över 25 ord** — kärnformuleringar parafraseras i stället, ev. med en kort citerad kärnfras (≤ 20 ord).
3. **Inga staplade citat i samma block** (max ett citat per textblock).
4. **Citat i översättning markeras** som egen översättning när originalet är på främmande språk; verbatim originalspråkscitat hålls korta (undantag: tekniska termer).
5. **Minst ett eget analysblock + en egen övning per kapitel** — referatblock ska alltid avslutas eller ersättas med kursens egen vinkel (AKM1-brygga, svensk kontext, kritisk diskussion). Detta uppfylls redan i 100 % av lästa kapitel och ska bibehållas som krav.
6. **Quiz formuleras som tillämpningsfrågor med egna distraktorer** — aldrig bokens faktarader ordagrant.
7. **Struktur:** behåll egna svenska kapiteltitlar (ej direkta översättningar av källans rubriker) och sträva efter minst ett eget kapitel per kurs utanför bokens disposition (kontrovers, syntes, replikerbarhet).
8. **Memorabla fraser** (margin of safety, Mr Market, snöbollen, too big to fail) är fria att nämna som begrepp — men återges aldrig som långa meningskopior utan citattecken.

### Föreslagen åtgärdslista (prioriterad)
| Prio | Fil | Kapitel/block | Åtgärd |
|---|---|---|---|
| 1 | the-psychology-of-money.json | K5 b2 | Korta 49-ordscitatet till ≤ 20 ord el. parafrasera |
| 1 | the-most-important-thing.json | K4 b0, K8 b0 | Korta 36- resp. 28-ordscitaten till ≤ 20 ord |
| 2 | the-psychology-of-money.json | K1 b2 | Parafrasera ett av de två staplade citaten |
| 3 | the-psychology-of-money.json | K5 b0–b2 | Lägg till eget analysblock |
| 3 | the-most-important-thing.json | K8 b1–b2 | Förstärk egen vinkel i referatblocken |
| 4 | the-snowball.json | K12 b1 | Frivilligt: korta 21-ordscitatet under 20 |

*Granskad av: automatiserad genomgång + fulltextläsning, 2026-09-01. Nästa granskning föreslås om 6 månader eller efter nästa större bokmaster-tilläggsbatch (biblioteket omfattar 103 böcker; 8 granskade = 7,8 % stickprov).*


---

## EFTERLEVNAD — alla GUL-åtgärder utförda 2026-09-01

- PoM K5 b2: 49-ordscitaten förkortat till ≤ 20 ord med ellips + parafras
- PoM K1 b2: staplat dubbelcitat → ett kort citat + parafras
- MIT K4 b0: 36 → 20 ord (första halvan citerad, spegeln parafraserad)
- MIT K8 b0: 28 ord → regel ett citerad kort, regel två parafraserad
- Status efter åtgärd: 8 GRÖN · 0 GUL · 0 RÖD
