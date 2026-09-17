# Granskning: NIKE-paketet Q3 2026 (sa-laser-du-nike-q3-2026)

**Granskad:** 2026-09-16 · **Granskare:** agentfabrik s1-u3 (spår 1 — granskningskön, omgång auto-s1-1789585526448)
· **Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nike-q3-2026.json` (3 080 ord i bodyn, 3 192 ord totalt, 4 källor)
· **Diff-förslag:** `kvartal-2026-q3-nike-diff.json` (samma mapp — maskinverkställbara rättningar, samtliga bytsträngar verifierade unika i filen)

**BEDÖMNING: EFTER RÄTTNING** — källgrunden är stark (91 maskinella kontroller
 gröna, se sifferverifikationen) och juridiken ren, men 2 fel (A1–A2) måste
rättas innan paketet är flyttklart: EV-kedjans skrivna subtraktionsordning är
omvänd (meningen ger −9,0 miljarder, sluttalet +9,0 är rätt), och urvalsberättelsen
kallar tre rappdatum för estimat fast paketets egna kalendrar markerar dem
officiellt bekräftade. Därtill 4 enklare byten (B1–B4) och 1 förslag som kräver
beslut (C1). Alla rättningar är rena textbyten — inget behöver skrivas om.

**Val-motivering (PIVOT):** uppdragets ordagrunda objekt — m9-utkast #3
(forskningslaget-grona-av-100) — var redan komplett levererat av syskon s1-u2
kl 14:29 (`forskningslaget-grona-av-100-KONTROLL-2026-09-16.md`, 47 kontroller)
med korskonfirmation av dåvarande s1-u3 kl 14:35: **hela m9-serien 6/6 har
granskningsklara 09-16-paket**. Spårets regel "nästa INTE redan levererade
objekt — duplikat är förlorat arbete" tvingar pivot, och kvartalsseriens
bolagspaket är spårets största obehandlade block: 21 paket, endast hm-b
(granskad 2026-09-15 av s1-u3) och volvo-car (2026-09-15 av s1-u1) granskade —
19 väntar. NIKE valdes som det paket med **tidigaste rappdagen bland de
ogranskade: 2026-10-01** (nästa är Industrivärden 10-07 — men dess paket är
skrivet; bland ännu ogranskade paket är NP3 10-16 närmast efter NIKE).
Klaim-protokoll: `data/vakten/auto-s1-1789585526448-u3-ansprak.md` skriven
21:09 lokal FÖRE arbetet; inga syskonanspråk fanns för omgången vid
valtillfället; granskningsmappen saknade nike-filer (0 duplikat).

## Metod

1. Maskinell sond (`.zcode/granskning-kvartal-nike.mjs` + två tilläggsmoduler,
   lokala omkörningsfiler enligt våg 149-hygienen): 19 källfält värde för
   värde mot bolagsuniversumets NIKE-rad, samtliga serieår/CAGR/årssteg,
   identitet- och EV-kedjor, PEG-triaden, 9 scenarieceller, båda räknesatserna,
   multiplövningarna, 10 medianer mot BYGGTRÄDETS 126-bolagstillstånd
   (`git show 6ecb409d:…bolagsunivers.json`) och mot dagens 132-träd,
   n-konventioner, urvalsfakta (Öresund/Kinnevik, paketantal vid bygget,
   vågskannerns 12-tickeruniversum, insiderfält, rondräkning i serien).
2. Juridikgrind-genomläsning (skill: juridikgrind — lagen 2007:528: utbildning
   tillåtet enligt 2 kap 5 §, rådgivning kräver tillstånd) med kontextkontroll
   av varje verbträff;_NOT_: verktyget `juridikgrind-vakt.mjs` skannar ENDAST
   `data/blogg-utkast/*.json + m9-ko/* + granskning/*.md` — kvartalsmappen är
   OSYNLIG för den mekaniska grinden (flagga F1 nedan), varför denna granskning
   vilar på manuell genomläsning + maskinell verbkontextsond.
3. Plattformskontraktskontroll av readingMinutes mot `src/lib/blogg-utkast.ts`
   (ORD_PER_MINUT = 600, ord = titel+ingress+body, Math.round).
4. Intern länkkontroll mot http://localhost:3000 (loopback whitelistad) — 19 unika länkar.
5. 911-kontroll: sex mönster ("911", "11 september", "september 2001", "9/11",
   "terror", "Terrordåd") mot hela filen — seriestandard sedan m9-kontrollerna.
6. Källintegritet: NIKE-raden + kalenderposten + byggcommitens dokumentation
   (`6ecb409d`, auto-s4-u3) avstämda; skillnader redovisas i notiserna.

## Fynd A — blockerande för flytt (måste rättas)

**A1. EV-kedjans subtraktion står i omvänd ordning — meningen räknar −9,0,
sluttalet +9,0 är rätt.** Källkritikavsnittet: "Och skillnaden visar balansen:
EV 58,8 minus börsvärde 56,7 minus skuld 11,0 ger en härledd kassa på cirka
9,0 miljarder dollar." Så som operationen står blir resultatet −9,0 miljarder.
Kassan härleds ur EV-definitionen (EV = börsvärde + skuld − kassa, alltså
kassa = börsvärde + skuld − EV): 56,729 + 11,046 − 58,769 = **+9,01 ≈ 9,0** —
sluttalet i texten är korrekt och hela kedjans övriga fem länk verifierade
gröna (EK 14,87, skuld 11,05, EBIT 5 887,9, EV 58,76), men i avsnittet som
presenters som "seriens starkaste interna konsistensbevis" — och i titeln
("en EV-kedja som håller länk för länk") — måste det skrivna räknesteget
stå i rätt riktning. Rättning: byte av ledens ordning (diff A1).

**A2. Tre rappdatum kallas estimat — paketets egna kalendrar säger officiellt.**
Urvalsavsnittet: "de amerikanska mönsterdatumen den 13 oktober (Johnson &
Johnson, Goldman Sachs, JPMorgan) är estimat enligt kalendrarnas egna
metodnoter och inte bolagsbekräftade." Källorna säger motsatsen:
kalender-finans.json:s GS-post "**Datumet är officiellt** — bolaget har lyft
ut samtliga 2026 rappdatum i pressrummet"; JPM-posten "**Datumet är
officiellt** — bolaget tillkännagav samtliga 2026 rappdatum i förväg";
kalender-halso.json:s JNJ-post "Datumet är **officiellt utlagt på bolagets
IR-sida**". Metodnoten som åberopas reserverar sig för datum som INTE är
bolagsbekräftade — dessa tre är explicit bekräftade med namngivna bolagskällor.
Urvalsslutsatsen överlever rättningen och förstärks: NIKE:s 1 oktober ligger
tolv dagar före nästa amerikanska kollega. Rättning: byte (diff A2). Samma
formuleringsfamilj finns i byggcommiten och i sammanställningens NIKE-rad —
se flaggorna.

## Fynd B — bör rättas (enkla byten)

**B1. readingMinutes 6 → 5.** Plattformskontraktet (`src/lib/blogg-utkast.ts`:
ORD_PER_MINUT = 600, `Math.max(1, Math.round(ord / ORD_PER_MINUT))` där ord =
titel + ingress + body): 3 192 ord (titel 29 + ingress 83 + body 3 080) / 600
= 5,3 → 5. Volvo-car-granskningens B3-precedens. Seriebred not: serien saknar
enhetlig praxis (np3 3 098 ord → 5, NIKE 3 080 → 6 i utkastet) — kontraktet är
normen (flagga F2).

**B2. Descriptions rondräkning avviker från bodyns egen.** Description:
"identitetstestets **sjätte** runda (4,9 % nära-godkännande)" — men bodyns
eget avsnitt heter "Källkritikens **sjunde** runda", PEG-delen räknar "sju
observationer" (fem första + Wallenstam + NIKE), och seriens numrering är
maskinellt slagfast: essity = fjärde, alfa-laval = femte, wallenstam = sjätte,
**NIKE = sjunde** (np3/tele2/volvo-group = åttonde). Endast descriptionsfältet
räknar NIKE som sjätte. Rättning: ett ord (diff B2).

**B3. "insystare" → "insiders"** (stabilitetsavsnittet: "Elva registrerade köp
av insystare"). Inget svenskt ord; texten själv använder "insiderköp",
"Insiderfältets" och "insidersammanhang" — seriens term är "insiders".

**B4. "alla tidigare paketbolag hade värdet 0" — två av dem hade inte.**
Universumfilen: Evolution (EVO.ST, paket före NIKE) bär insider=NULL och
Precise Biometrics saknar rad i filen helt. Byggcommitens egen formulering
"0 eller saknas" är den exakta. Premiären — första VÄRDET ÖVER NOLL — påverkas
inte (inget tidigare paketbolag har > 0; descriptionens "första värde över
noll" är sann som den står). Rättning: "hade värdet 0 eller saknade värde".

## Fynd C — förslag som kräver beslut (verkställs inte blint)

**C1. "Det första paketet byggt på bolag utanför seriens kanoniska kärna" —
Wallenstam var där först.** Maskinell kontroll av byggtillståndet (trädet vid
`6ecb409d`): Wallenstam-paketet fanns i trädet FÖRE NIKE:s commit, och
Wallenstam står utanför BÅDA kärnkällorna — inte i vågskannerns 12-tickeruniversum
(mätt mot `/api/vagscan/senaste`: VOLV-B, SAAB-B, ATCO-A, SAND, SWED-A,
ESSITY-B, ERIC-B, AZN, NDA-SE, SKF-B, ALFA, SHB-B) och utan analysfil — precis
som NIKE. Texten erkänner själv syskonet i urvalsavsnittet ("Syskonpaketet på
Wallenstam … levererades parallellt i samma omgång") men premierar ändå NIKE
som först. Dessutom täckte de "sjutton tidigare" inte helt kärnkällorna:
vågvalideringskalenderbolaget Volvo Group saknade paket vid bygget (16 av 17
kom från dom-tolvan eller analysbiblioteket). Förslag i diff-filen: ge
Wallenstam äran i samma mening (kvarstår "första USA-paketet", "första brutna
räenskapsåret hos US-bolag" — de rent tekniska premiärerna som är NIKE:s egna).
Alternativ: stryk kärna-premiären helt.

## Notiser N — källkonflikter och begränsningar (ingen ändring i utkastet)

**N1. Medianerna exakta mot byggträdet; dagens träd har drivit.** Samtliga 10
medianer + n-konventioner (konsument 13 där P/E-P/B-ROE n=12; universum
n=117–126) ÅTERGES EXAKT ur 126-bolagsträdet vid bygget — granskarens egen
beräkning: konsument P/E 20,45/P/B 3,94/ROE 24,19/EBIT 14,61/netto 8,38,
universum 20,52/2,79/15,34/21,22/14,66. Dagens fil: 132 bolag, konsument 13→14
— nu gäller konsument P/E 21,18/ROE 26,24/EBIT 15,04, universum 21,18/15,57/
21,87 (NIKE:s tal oförändrade i roten). Cadans-not till fabriksägaren: samma
drift-familj som syskonnotiserna (100→126→132 under ett dygn).

**N2. Rappdagen ej oberoende re-verifierad i denna session.** Oberoende
hämtning av NIKE:s IR-sida gav 403 (bot-skydd) i granskarens kanal — samma
mönster som Gartner-källan i teknikaktier-granskningen. Bedömningen 1 oktober
ca 13:15 PT (ca 22:15 svensk tid) + konferenssamtal ca 14:00 PT + annonserat
28 augusti vilar på byggagentens hämtning 2026-09-15 + kalender-konsument.json:s
post (två samstämmiga bokföringar med namngiven URL). **Vid publicering:
dubbelkolla datum och klockslag mot investerar-sidan** — volvo-car-N2:s rutin.

**N3. 911-kontroll: grön.** 0 träffar på samtliga sex mönster i hel filen.

**N4. Resultat-CAGR: källfält −15,05 % mot serieändpunkter −15,051 %.** Paketet
citerar källans fält (korrekt attribution); den egna omräkningen ur
5 070 → 3 108 ger −15,068 % — skillnaden är källans avrundning, ingen åtgärd.

**N5. "Två veckor före nästa officiellt bekräftade datum" — håller under båda
läsningarna.** Vid bygget: bland återstående kalenderbolag var nästa officiella
datum NP3 10-16 (bolagets egen kalender: "officiellt bekräftat datum") = 15
dagar, eller Kinnevik 10-15 (officiell IR-kalender men dataexkluderat ur serien)
= exakt 14. Industrivärdens 10-07 räknas ej — paketet fanns redan. Grön med
denna läsnot.

**N6. Titel 192 tecken / description 660 tecken.** Över SEO-allmänna normer
men inom seriens egen praxis, som spänner 77–244 (titel) och 204–1 057
(description; np3 längst). Serieflagga (F2), inte NIKE-post.

## Juridikgrinden — GRÖN (lagen 2007:528)

Genomläsning enligt skill: juridikgrind, med maskinell verbkontextsond.
Konstruktionen är genomgående utbildande: "utbildningspaket",
"utbildningsmaterial", "träning i metod", "övningar". Varje verbträff står i
nekande eller neutral konstruktion: "inte en rekommendation att köpa, sälja
eller behålla några värdepapper" (inledningen), "Inga köp-, sälj- eller
hållningsrekommendationer förekommer" (disclaimern), "aldrig en handsignal"
(övning A), "ett neutralt värde, inte en signal" (insidernotisen), "använt som
räknestorhet, inte som prognos" (övning C), "konsensus … inte en sanning och
inte vår prognos". Lagrummet 2007:528 2 kap 5 § åberopas korrekt i
disclaimer-sista-rad (plattformskontraktets `/investeringsråd/i`-test uppfyllt
av "inte investeringsrådgivning"); INGA andra lagrum nämns — därmed ingen
risk för lagrumsblandning. Konsensusbegreppet definieras pedagogiskt ("samlad
marknadsuppskattning"). Scenariorutan är "ren aritmetik … inga prognoser".
Personuppgifter saknas. Inget att rätta.

## Sifferverifikation — 91 maskinella kontroller, 0 fel

| Område | Kontroller | Utfall |
|---|---|---|
| Källfält mot NIKE-raden (kurs, börsvärde, 4 tillväxt-, 6 lönsamhets-, 2 stabilitets-, 5 värderingsfält, insider, räntetäckning-osatt) | 20 | Gröna, värde för värde |
| Serieår FY2023–FY2026 + ändpunkter (51 217→46 398; 5 070→3 108) | 3 | Gröna |
| CAGR (−3,24 %; −15,05 % mot källfält, se N4) + årssteg (−9,8/+0,2/+12,4/−43,5/−3,4) | 7 | Gröna |
| Resultatomarginell 9,9 → 6,7 % + "mer än fyra gånger" (4,65×) | 2 | Gröna |
| Identitetstest 3,815 ÷ 0,2214 = 17,23, avvikelse 4,9 % | 2 | Gröna |
| EV-kedjan: EK 14,9 / skuld 11,0 / EBIT 5 888 / EV 58,8 / kassa +9,0 | 5 | Gröna (men A1: meningens operation omvänd) |
| PEG: konvention 0,54 / kvot 2,75 / implicit tillväxt 12,2 % | 3 | Gröna |
| Scenarioruta 9 celler + marginalsteg 464 M + intäktssteg 177 M + vikt 2,63 + kvoten 2,6 | 13 | Gröna |
| Övning C: 13,55 och 16,2 | 2 | Gröna |
| Universumsjämförelse: P/B-premie +37 % / P/E-rabatt −12 % | 2 | Gröna |
| Medianer 10 st mot 126-byggträd + n-konventioner + antal (13/126) | 13 | Gröna (aktualisering N1) |
| Urvalsfakta: Öresund/Kinnevik-datamotivering, 18 läspaket vid bygget ("sjutton tidigare"), NIKE-kalenderpost (10-01/13:15 PT/28 aug) | 4 | Gröna |
| Insiderpremiär + Wallenstam-insider=0 | 2 | Gröna (precision B4) |
| Rondräkning (källkritik/identitet/PEG: NIKE = 7) | 1 | Grön i bodyn (B2: description avviker) |
| Struktur: 8 rubriker, 21 733 tecken, disclaimer-sista-rad | 3 | Gröna |
| readingMinutes mot plattformskontraktet | 1 | **Avvikelse — B1** |
| 19 unika interna länkar mot localhost:3000 | 19 | Alla 200 |

**Interna länkar (19/19 = 200):** 15 konsument-aspekter (roe, roic,
brutto-marginal, netto-marginal, omsattningstillvaxt-ttm, omsattning-cagr-5ar,
resultat-cagr-5ar, prognos-tillvaxt, pe, pb, ev-ebit, fcf-avkastning,
vardering, skuldsattning, universumjamforelse) + `/bolag/nke` + `/kurser` +
`/transparens` + `/kallor`. Extern länk (investors.nike.com): se N2.

## Flaggor till ägare (ej verkställda här — andras filer)

- **F1 (verktygsägaren):** `juridikgrind-vakt.mjs` skannar inte
  `data/blogg-utkast/kvartal/**/*.json` — hela kvartalsserien (21 paket +
  kalendrar) är osynlig för den mekaniska juridikgrinden. Samma gap gällde
  m9-serien fram till att den togs in. Föreslås: ta med kvartalsmappen i
  verktygsscanningen.
- **F2 (fabriksägaren, seriebred):** readingMinutes utan enhetlig praxis i
  kvartalsserien (np3 3 098 ord → 5, NIKE 3 080 → 6; hm-b 1 548 → 7) —
  plattformskontraktet round(ord/600) gäller och bör byggas in i
  paketfabrikationen. Titel-/description-längder spänner lika brett.
- **F3 (sammanställningsägaren):** GRANSKNINGSKO-SAMMANSTALLNINGens NIKE-rad
  bär samma "USA-mönsterdatumen 10-13"-formulering som A2 rättar i utkastet —
  justeras i sammanställningen vid nästa uppdatering (min rad för NIKE-paketets
  granskningsstatus kan bokföras samtidigt).
- **F4 (fabriksägaren):** median-cadans — bolagsuniversum växte 126→132 under
  granskningsdagen; kvartalspaketens medianer åldras med filen (N1).

## KVD

Datafiler endast (två nya i `data/blogg-utkast/granskning/` + anspråksfil +
worklog) — `src/` orörd, inget bygge (installation/byggen ägs av
prod-synken/kraschvakten under /tmp/ak1a-deploy.lock), R2 orörd: inga
priser/tier/publicering, `data/blogg/` orörd, utkastet ligger kvar i
`data/blogg-utkast/kvartal/2026-q3/`. Typkontroll via projektbinär
`node node_modules/typescript/bin/tsc --noEmit` = 0 fel (körd som bevis —
ingen kod berörd; pre-commit-grinden verifierar mekaniskt). Uppdragets
"911-r" tolkat som 911-kontroll enligt seriens standard (hm-b metodpunkt 5,
m9-kontrollernas sex mönster): utförd, grön.

**Dom: EFTER RÄTTNING → FLYTTKLAR.** Verkställ A1–A2 + B1–B4 ur diff-filen
(exakta byten), besluta C1, och dubbelkolla rappdatumet mot NIKE:s
investerar-sida vid publiceringstillfället (N2). Därefter är paketet klart
för kundens publiceringsbeslut (R2) — med rappdagen 2026-10-01 som seriens
tidigaste USA-premiär.
