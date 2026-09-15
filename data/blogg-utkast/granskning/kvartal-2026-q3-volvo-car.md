# Granskning: Volvo Car-paketet Q3 2026 (sa-laser-du-volvo-car-q3-2026)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik s1-u1 (spår 1 — granskningskön, omgång 2)
· **Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-volvo-car-q3-2026.json` (1 386 ord i bodyn, 1 445 ord totalt, 3 källor)
· **Diff-förslag:** `kvartal-2026-q3-volvo-car-diff.json` (samma mapp — maskinverkställbara rättningar, samtliga bytsträngar verifierade unika i filen)

**BEDÖMNING: EFTER RÄTTNING** — källgrunden är stark (20 sifferpåståenden
mot två filer, 18 gröna varav en med efterföljande tidsnot, se N1) och
juridikgrinden är ren, men 4 fel (A1–A4) måste rättas innan paketet är
flyttklart: ett kvartalsdatum som avviker från sin källa, en trasig ordstam
i källraden, en felaktig resultatterm i övning A och en stavfel. Därtill
3 enklare byten (B1–B3) och 4 förslag som kräver beslut (C1–C4). Alla
rättningar utom C3 är rena textbyten — inget behöver skrivas om.

**Val-motivering:** uppdragets ordagrunda objekt (m9-utkast #1) var redan
levererat — samtliga sex m9-utkast granskades 2026-09-14 av våg 151 (m1–m6,
se `SAMMANSTALLNING-2026-09-14.md` och de sex rapporterna i denna mapp),
och spårets regel är "nästa INTE redan levererade objekt". Kvar i kön står
bolagspaketen från v152 fas 3 (Ericsson, Volvo Car, SKF, Industrivärden,
Atlas Copco — H&M granskat 2026-09-15 av s1-u3) samt branschguider.
Volvo Car-paketet är det äldsta ogranskade bolagspaketet (skapat 08:42,
rad 1 i bolagspaketstabellen i GRANSKNINGSKO-SAMMANSTALLNING.md) med
rappdag 2026-10-23. Syskonkontroll: inga volvo/ericsson-filer i
granskning/ vid start; mitt Write-läshinder är reservskydd.

## Metod

1. Mekanisk kontroll av alla siffror mot angivna källor:
   `data/analyses/VOLCAR-B.json` (verifierad 2026-08-08 — businessAreas,
   companyInfo, keyEvents, V-nyckeltal, stats) och
   `data/portfolj-system/bolagsunivers.json` (Yahoo Finance, hämtad
   2026-09-03 — VOLCAR-B.ST: lönsamhet, tillväxt, värdering); all intern
   aritmetik omräknad (marginalhävarmen, övning A).
2. Juridikgrind-genomläsning (skill: juridikgrind — lagen 2007:528:
   utbildning tillåtet enligt 2 kap 5 §, rådgivning kräver tillstånd) med
   kontextkontroll av varje verbträff (köp/sälj/köpa/sälja/rekommendera/
   bör du/råd/tipsa/handelsbud/prognos).
3. Intern länkkontroll mot http://localhost:3000 (loopback whitelistad).
4. 911-kontroll (sökning efter "911" i filen — samma kontroll som
   hm-b-granskningens metodpunkt 5).
5. Plattformskontraktskontroll av readingMinutes mot
   `src/lib/blogg-utkast.ts` (ORD_PER_MINUT = 600, avrundat).

## Fynd A — blockerande för flytt (måste rättas)

**A1. Q4-datumet avviker från källan: "4 februari" ska vara "5 februari".**
Utkastet: "Q1 rapporterades 29 april, Q2 den 17 juli och Q4 kommer
4 februari 2027." Källan — analysens händelsekalender — anger
"2027-02-05 · Q4-rapport 2026 + utdelningsförslag". Ingen tillgänglig
källa stödjer 4 februari; sannolikt en avskrivning av 05→4. En dag fel i
ett rappdatum är precis den sortens siffra som förstör ett läspaket.
Rättning: ett teckenbyte i diff-filen.

**A2. Källraden inleds med trasig ordstam: "rappFÖNSTER".**
Sista stycket: "_Källor per avsnitt: rappFÖNSTER och tider — Volvo Cars
finansiella kalender…". Ordet är en hopklabbning (troligen "rapportfönster"
avklippt mitt i) och lämnar ett redigerarfel synligt i den rad som ska
 bära textens källtrovärdighet. Rättning: "Rappdatum och tider".

**A3. Övning A redovisar EBITDA-skillnaden under fel term.**
"…EBITDA-marginal på 10 procent i stället för 12. På oförändrade
intäkter om 350 miljarder är skillnaden 7 miljarder kronor i årlig
ränta- och avskrivningsresultat." Aritmetiken är korrekt
((0,12−0,10) × 350 = 7,0 mdr) men termen är fel: skillnaden mellan två
EBITDA-marginaler är skillnad i EBITDA — resultaträkningens rad FÖRE
avskrivningar (och före ränta). "Ränta- och avskrivningsresultat" är
ingen rapportrad och förvirrar en nybörjare som just ska lära sig
marginaltrappan (avsnitt 2). Rättning: "i årligt EBITDA-resultat".

**A4. Stavfel i nyckeltalsavsnittet: "väga" ska vara "värda".**
"Det avgör vilka nyckeltal som är väga att titta på och vilka som är
brus." Rättning: ett bokstavsbyte.

## Fynd B — bör rättas (enkla byten, försämrar inte blockering)

**B1. "råvarueexponering" → "råvaruexponering"** (dubbel-e, övning B).
**B2. "rapsiffror" → "rapportsiffror"** (avklippt ordstam i
vidareläsningsavsnittet: "hela kedjan från rapsiffror till slutsats").
**B3. readingMinutes 6 → 2.** Plattformskontraktet
(`src/lib/blogg-utkast.ts` rad 122+194: ORD_PER_MINUT = 600,
`Math.max(1, Math.round(ord / ORD_PER_MINUT))`): 1 445 ord
(titel 13 + ingress 46 + body 1 386) / 600 avrundat = 2. Värdet 6
motsvarar en läshastighet på 232 ord/min som plattformen inte använder.
Samma kur som fastighetsgranskningens C2 (2026-09-15).

## Fynd C — förslag som kräver beslut (verkställs inte blint)

**C1. "…själva rapportens uppgift att träda över" — otydlig formulering.**
"Analysen redovisar historisk ROE kring 12 procent medan universumets
TTM-fönster ligger kring 4 procent — spannet mellan dem är själva
rapportens uppgift att träda över." "Träda över" är inte en etablerad
svensk konstruktion och syftningen blir oklar. Förslag i diff-filen:
"…spannet mellan dem är det som rapporten kommer att pröva."

**C2. Internt processpråk i kundtext.** "Två guider till — en generell
i att läsa kvartalsrapporter och en om P/E-talet — ligger färdigskrivna
i plattformens granskningskö och publiceras när kunden beslutar."
Påståendet är sant (båda granskade 2026-09-14: `sa-laser-du-en-
kvartalsrapport.md`, `pe-talet-sa-raknar-du-och-tolkar.md`) men
"granskningskö" och "publiceras när kunden beslutar" läcker internt
beslutsflöde i en text som ska kunna publiceras tidlöst. Förslag: stryk
meningen eller byt mot "Plattformen har även en generell guide i att
läsa kvartalsrapporter och en om P/E-talet." (publiceringsstatus = R2,
nämns inte i kundkanal).

**C3. "Q1 rapporterades 29 april" — ej källbelagt.** Analysens
händelsekalender börjar 2026-07-17 (Q2); universumet innehåller inga
rappdatum. Q2 (17 juli) är belagt i analysen två gånger, men Q1-datumet
29 april har ingen källa i utkastets referenser. Alternativ i diff-filen:
(a) stryk Q1-datumet — rekommenderat, meningen bär inte på det; eller
(b) verifiera mot Volvo Cars finansiella kalender före publicering
(samma källa som N2-notisen).

**C4. "volume-drivet" → "volymdrivet"** (anglicism i inledningen av
nyckeltalsavsnittet; plattformens övriga text säger "volymdrivet" —
se t.ex. "volume-driven" saknas i övriga granskade paket).

## Notiser N — källkonflikter och begränsningar (ingen ändring i utkastet)

**N1. Q3-datum: utkastet rätt mot en åldrad källa.** Analysens
händelsekalender (2026-08-08) anger Q3-rapporten till **2026-10-29**;
utkastet använder **2026-10-23 kl 07:00** med hänvisning till bolagets
egna finansiella kalender (investors.volvocars.com, hämtad 2026-09-15).
Prioriteringen är korrekt — bolagets kalender är primärkällan och är
färskare — men analysens keyEvents är nu inaktuella på denna punkt.
**Kur till analysunderhållet:** uppdatera keyEvents i VOLCAR-B.json vid
nästa analysrevision (tillsammans med Q4-datumet som A1 rättar i
utkastet). Notera att analysens Q3-post dessutom säger "första fulla
kvartalet med EX90 volym" medan EX90-volymproduktionen enligt samma
kalender startar 2026-10-15 — invändningen är analysens, inte utkastets.

**N2. Rappdatumet ej oberoende re-verifierat i denna session.**
Oberoende hämtning av investors.volvocars.com/financial-calendar/ gav
404 i granskarens kanal. Bedömningen 23/10 07:00 vilar på byggagentens
hämtning 2026-09-15 + GRANSKNINGSKO-SAMMANSTALLNINGens "officiellt
bekräftar" (två samstämmiga bokföringar). **Vid publicering: dubbelkolla
datum och klockslag mot pressrummet** — samma rutin som gäller för alla
rappdagarna i serien.

**N3. 911-kontroll: grön.** Sökning efter "911" i filen ger 0 träffar.

## Juridikgrinden — GRÖN (lagen 2007:528)

Genomläsning enligt skill: juridikgrind. Konstruktionen är genomgående
utbildande: "utbildningspaket", "träna på scenariemetoden",
"klassrumssituation", "övningar". Varje verbträff på köp/sälj/köpa/sälja
står i nekande konstruktion: "Det är inte en rekommendation att köpa,
sälja eller behålla några värdepapper — sådana beslut hör hemma hos dig
och, om du vill ha sådant, hos ett tillståndspliktigt rådgivningsbolag"
samt "inte ett sätt att gissa kursen, och definitivt inte ett handelsbud".
Värderingsavsnittet skyddar sig själv ("Det är mekaniken, ingen prognos
om den kommer att inträffa"), konsensusavsnittet definierar begreppet
som pedagogik. Utdelningsdiskussionen handlar om policy-mekanik, inte
utdelningsprognos. Inget lagrum åberopas i texten — därmed ingen risk
för lagrummsblandning (2007:528 / 2022:260 / 2022:261 / 1985:716 är
olörda). Personuppgifter saknas. Beskrivningen "utan köp- eller säljbud"
i metadatan är korrekt. Inget att rätta.

## Sifferverifikation — 18 gröna + A1 (rött) + C3 (obelagt)

| Utkastets påstående | Källa | Utfall |
|---|---|---|
| Rappdag 23 oktober 2026 kl 07:00 | IR-kalender via byggagent + sammanställning | Grön med N2-notis (analysen säger 29/10 — N1) |
| ~800 000 sålda bilar 2025, ~50 % laddbara | Analys stats + keyfigures: "~800k+", "~50 % ELV" | Grön |
| Intäkter ~350 mdr kr (2025) | Analys "~350 md SEK (2025)"; universumserien 2025: 357,3 mdr | Grön |
| EBITDA-marginal ~12 % (proforma) | Analys "~12 % marginal · ~42 md SEK (2025) proforma" | Grön |
| Utdelningspolicy 50 % av vinsten | Analys "utdelning 50 % av vinst" + keyEvents 2027-02-05 | Grön |
| Personbilar ~330 mdr / ~11 % marginal | Analys businessAreas "~330 md SEK (~94 %)" / "~11 %" | Grön |
| Tjänster ~15 mdr / ~25 % | Analys "~15 md SEK (~4 %)" / "~25 %" | Grön |
| Reservdelar ~5 mdr / ~30 % | Analys "~5 md SEK (~2 %)" / "~30 %" | Grön |
| Nettoskuld 70–100 mdr | Analys V10 "Nettoskuld ~70–100 md SEK" | Grön |
| TTM rörelsemarginal under 1 % | Universum ebitMarginal 0,0084 = 0,84 % | Grön |
| TTM kassaflödesmarginal negativ | Universum fcfMarginal −0,0454 | Grön |
| Omsättning backat ~17 % | Universum omsattningTillvaxtTTM −0,169 | Grön |
| ROE historisk ~12 % / TTM ~4 % | Analys V09 "~12 %" / universum roe 0,0365 | Grön |
| Bruttomarginal 17–20 % historiskt | Analys V07 "~17–20 %" | Grön |
| P/E trailing ~8 / EV/EBITDA ~5 | Analys stats "~8x" / V06 "~5x" | Grön |
| USA ~15 %, Europa ~50 %, Kina ~25 % av volymen | Analys companyInfo.customers | Grön |
| EX90 volymproduktion mitten av oktober | Analys keyEvents 2026-10-15 | Grön |
| ELV-tullbeslut väntat hösten 2026 | Analys keyEvents "förväntat hösten 2026" | Grön |
| Q2 2026 avverkades 17 juli | Analys lede + keyEvents 2026-07-17 (ordvalet "avverkad" är källans) | Grön |
| **Q4 kommer 4 februari 2027** | Analys keyEvents 2027-02-05 | **RÖTT — A1** |
| Q1 rapporterades 29 april | Ingen källa i utkastets referenser | Obelagt — C3 |

**Intern aritmetik:** 1 procentenhet på 350 mdr = 3,5 mdr ✓ (avsnitt 2);
övning A: (0,12−0,10) × 350 = 7,0 mdr ✓ (termen fel — A3).

**Interna länkar (3/3 = 200 mot localhost):** `/blogg/hur-vi-analyserade-volvo-cars` ✓ · `/blogg/hur-raknar-man-roe` ✓ · `/bolag/volcar-b-st` ✓.

## KVD

Datafiler endast (två nya i `data/blogg-utkast/granskning/`) — `src/`
orörd, inget bygge, R2 orörd (publicering förblir kundens beslut,
utkastet ligger kvar i `data/blogg-utkast/`), tsc via projektbinär
`node node_modules/typescript/bin/tsc --noEmit` = 0 fel (baslinje
orörd — kontrollen körs som bevis, ingen kod berörd). Uppdragets
"911-r" tolkat som 911-kontroll enligt hm-b-granskningens metodpunkt 5
(hm-b-rapporten, samma manifesttradition): utförd, grön.

**Dom: EFTER RÄTTNING → FLYTTKLAR.** Verkställ A1–A4 + B1–B3 ur
diff-filen (exakta byten), besluta C1–C4, och dubbelkolla rappdatumet
mot pressrummet vid publiceringstillfället (N2). Därefter är paketet
klart för kundens publiceringsbeslut.
