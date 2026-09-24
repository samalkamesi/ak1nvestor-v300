# KONTROLL 2026-09-20 — bilaktier-sa-analyserar-du-biltillverkare-ar.json (AR10)

**Granskare:** s1-u3, ANDRA INSTANSEN, agentfabrik auto-s1-1789925707056 (3/3).
**Ar-version byggd:** 2026-09-20 01:03 av s3-u3 (manifest auto-s3-1789858506564;
deras KVD 14 kontroller GRÖN — denna granskning OBEROENDE: egen sond + ärvtest
mot B10:s dubbelgranskningsliggare). **Objekt:** arabisk spegling av B10
bilaktier — body 1 394 ord, 7 H2.
**Dom: FLYTTKLAR EFTER RÄTTNING (B1-AR)** — speglar originalets dom
(FLYTTKLAR EFTER RÄTTNING, s1-u1 + s1-u2 2026-09-19). Publicering väntar
kunden (R2).

## SLOTDUBBEL-bokföring (duplikatregeln, D24/u1-precedensen)

Uppdragets ordagrunda objekt **"m9-utkast #3" är LEVERERAT** av detta manifests
första s1-u3-instans: commit **b015dd36** (kassaflodesanalys-101 v2-KANDIDAT,
49 kontroller 0 fel; fabriksstatus "klar" kod 0). Syskonet s1-u2 likaså klart
(449d4dfa). Pivot ⇒ köregeln + u1-precedensen: FIFO bland ogranskade.
Lägerekonstruktion vid valet (19:46–19:50, egen ls/stat-mätning): AR1–AR5 domar
09-19 (fastighet/bank/läkemedel/teknik/telekom) · AR6 industriaktier dom
09-20 13:17 · **ogranskade i FIFO-ordning: AR10 bil 01:03 ← VAL** · AR7
konsument 01:04 · AR9 halvledar 01:05 · AR11 saas 08:15 · AR12 spel 08:16 ·
AR13 detaljhandel 08:17 · flyg 14:23 · försäkring 14:28 · försvar 14:28.
Anspråk disk-först (data/vakten/auto-s1-1789925707056-s1-u3-ansprak-2-ar10-bil.md);
inga syskonanspråk på disk efter 18:09 vid valet (den levande u1-instansen,
start 19:35, hade då ingen anspråksfil — disk-först äger).

## Dom per klass (rond 99/AR6:s 13-klassformat)

| # | Klass | Dom |
|---|---|---|
| 1 | slug = originalet + `-ar` | **GRÖN** |
| 2 | BlogPost-form exakt (9 fält) | **GRÖN** |
| 3 | pillar/author = Institutionell metodik / AK1A Research Lab | **GRÖN** |
| 4 | title 54/60 tkn | **GRÖN** |
| 5 | OG-description 147/155 tkn — och FRI från originalets A1-felstavning ("multipelar" är svenskt och existerar ej i arabiskan) | **GRÖN** |
| 6 | tags 5 = originalets 5 (arabiska speglar: أسهم السيارات/مصنعو السيارات/السيارات الكهربائية/الهامش الإجمالي/دورة الاقتصاد) | **GRÖN** |
| 7 | body 1 394 ord / mallspann 800–1 400 (originalet 1 383; total title+desc+body 1 428) | **GRÖN** |
| 8 | readingMinutes 2 = round(1 428/600) — ar-fabrikens konvention (se B2-AR-koordination) | **GRÖN m not** |
| 9 | H2-paritet 7 = 7 | **GRÖN** |
| 10 | disclaimer negerad arabisk form exakt sista rad "_هذا تحليل مالي تعليمي، وليس نصيحة استثمارية._" | **GRÖN** |
| 11 | rådgivningsmönster AR utanför disclaimer: **0 på 8 mönster** (اشترِ/بِعْ/أنصحك/نوصي بشراء/استثمر في هذا/توصية بالشراء/توصية بالبيع/ننصحك) | **GRÖN** |
| 12 | svenska läckor (å/ä/ö efter URL/parentes-strip) | **GRÖN** — 0 träffar (latinska egennamn Volvo Cars/Tesla/Polestar/PowerCell/LVMH/OICA/IEA/AK1A/Volvo Group/Scania bär inga diakriter) |
| 13 | publishedAt 2026-09-20 = byggdagskonventionen (AR6 09-19→09-19; AR1–AR5 09-17/09-19) | **GRÖN** (D1-not nedan) |

## Sifferparitet — 87/87 token multiset IDENTISKA

SV 87 siffertoken · AR 87 siffertoken · diff **INGEN** — ar-familjens renaste
jämsides AR6:s 61/61 (AR1 52/52, AR2 89/92). Normalisering: SV mellanslagstusental
+ decimalkomma ↔ AR engelsk tusentelskomma + decimalpunkt (AR10:s "300,000" =
SV "300 000"). Nyckeltalsbärare alla närvarande: OICA 96,4/3,9 · Volvo Cars
P/E 6,0/P/B 0,37/EV/EBIT 21/EBIT-marginal 0,8/brutto 15,6 · Tesla 334/4,3/
18,9/15,0/7,1/3,8/−53/−46 · Polestar 2,4/200/15 · IEA 21/20/23/34,5 ·
fabriksexemplet 300/400/340/120/60/18/12/6/5/255/15,3/3,3/45/380 · PowerCell
30,6/245/385 · LVMH 66 · rådatum 2026.

## Källgrundning — ärvtestad från B10:s DUBBELGRANSKNING (09-19)

B10-sv granskades 09-19 av två oberoende agenter (s1-u1 huvudpaket +
s1-u2 KONTROLL/KOMPLEMENT): universumfälten **25/25 EXAKTA** mot
bolagsunivers vintagen 2026-09-03 (189 poster), OICA + IEA webbverifierade
ordagrant, aritmetiken 7/7 exakt. AR10 bär exakt samma tal (87/87 ovan) ⇒
källkraften ÄRVD och bekräftad. Egen eftersyn mot DAGENS fil (231 poster,
hämtad 09-20 07:59): Volvo Cars pe 5,957/pb 0,369/evEbit 21,219/
ebitMarginal 0,84 % · Tesla pe 333,7/peg 4,26/brutto 18,9 % · Polestar
pe null · PowerCell brutto 30,6 %/fcf +11,1 % — oförändrat mot textens tal.
Median-drift är fabriksägarens flagga; texten bär sitt eget rådatum
(سبتمبر 2026) och påstår inget om "idag".

## Juridik (2007:528) — REN

- **Disclaimer** negerad arabisk form exakt sista rad (klass 10).
- **Bärande formel** i ingressen: "تعليم في المنهجية، لا إرشاداً بشأن أسهم
  بعينها" (= "utbildning i metodik, inte vägledning om enskilda aktier").
- **Rådgivningsmönster 0 på 8 arabiska** utanför disclaimern (klass 11).
- **Varumärkesgrind:** exakt kontrolleraText-replik (26 regexer ur
  data/varumarke.json × 3 ytor title/desc/body) = **0 FEL / 0 VARNING**.
- **Inga lagrum alls** i texten ⇒ 0 risk för lagrumsblandning (AR6-klassen).
  "لا تقارن المضاعفات … دون أن تسأل كم يساوي المقام" ("jämför aldrig
  multipler utan att fråga vad nämnaren är värd") = metodregel i pedagogisk
  form, ej råd.

## 911-referenser — 0 träffar (uppdragets dimension)

0 träffar i title+desc+body på arabiska och västerländska mönster (911 ·
9/11 · 11 سبتمبر · سبتمبر 2001 · إرهاب · 2001) — konsistent med B10-sv:s
0/6. Dimensionen tom och redovisad så.

## Länkar — 13/13 interna multiset-identiska, 13/13 HTTP 200, 0 externa

Interna markdown-länkar SV 13 = AR 13, multiset IDENTISKA (km-009/km-010/
peg-multipeln/ps-tal/v08/v07/v12/rk-02/v19/km-006/hur-vi-analyserade-volvo-cars/
se-09-bil/komplett-guide). Alla 13 unika mål **HTTP 200 mot
localhost:3000** (mätt 2026-09-20 av sonden). Externa URL:er 0 = 0 — OICA/IEA
nämns med namn utan länkar (Ö15/Ö18/Ö20-precedensen). 0 länkar till utkast.

## FYND

### B1-AR — LVMH-superativet ÄRVT och motbevisat (BYT — speglar u1:s B1)
AR: "أعلى هامش إجمالي في عالم التحليل، هامش LVMH عند 66 بالمئة" =
"universums HÖGSTA bruttomarginal, LVMH:s 66 procent". u1:s B1 (09-19)
motbevisade superlativet i 2026-09-03-vintagen (rank 52 av 189; 51 bolag
över — fyra på 100,0 %). **Egen rankkontroll i DAGENS universum (231 poster,
hämtade 09-20 07:59): 58 bolag över LVMH:s 66,36 % — rank 59 av 218 värderade**
(Industrivärden 100,0 % i topp med flera) — superlativet falskt även i dagens
underlag. Rättning speglar u1:s exakt: superlativet stryks, LVMH presenteras
som lyxkoncernen, talet 66 och den pedagogiska kontrasten (mer än 3× mot
15,6/18,9 — motorverifierad 4,2×/3,5×) består oskadd. Strängen maskinellt
unik i AR-filen (1 gammal/0 ny).

### C1-AR — "det dubbla" plural ÄRVT (FÖRSLAG — speglar u1:s C1)
AR: "(الضعف مقارنة بمصنّعي السيارات)" = "det dubbla mot biltillverkarnas" —
exakt 1,96× mot Volvo (15,6) men 1,62× mot Tesla (18,9); pluralen håller bara
mot en av två. u1:s rättning: "det dubbla mot Volvo Cars bruttomarginal".
AR-förslag speglar den. Strängen unik (1/0).

### C2-AR — PowerCell förlusttrend ÄRVT (FÖRSLAG — speglar u1:s C2)
AR: "مع خسارة متراجعة" = "med förlusten minskande" — universumserien
−58,2 → −63,0 → −88,0 → −29,5 Mkr är INTE monoton; först 2025 halverades
förlusten (−66 %). u1:s rättning preciserar: "mer än halverad det senaste
räkenskapsåret (från −88 till −30 miljoner)". AR-förslag speglar — OBS
KOORDINERING: rättningen tillför talen 88/30, som u1:s SV-rättning också
gör; verkställ AR och SV tillsammans för att hålla 87/87-pariteten (annars
tillfällig token-diff 2). Strängen unik (1/0).

### C4-AR — "över 20 procent" ÄRVT (FÖRSLAG — speglar u2:s C4)
AR: "نمو يفوق 20 بالمئة" = "tillväxt som överstiger 20 procent" — IEA:s egna
rubriksiffra är "grew by 20 % globally"; "över" påstår strikt mer än källan.
Förslag "بنحو 20 بالمئة" ("omkring 20 procent"). Strängen unik (1/0).

### B2-AR — readingMinutes-koordination (BYT VILLKORAD)
AR bär rm 2 (round(1 428/600) = ar-fabrikens konvention; AR1–AR6 godtagna
så). MEN B-guidernas granskningskontrakt ~ord/200 (substansrabatt-domen
09-17; 0 av 55 publicerade följer ord/600) gav B10-sv öppen B2-rättning
2 → 7, och round(1 428/200) = 7. Originalets rättning är ännu EJ verkställd
i någon fil. Speglingskontraktet: när originalets B2 verkställs skall AR
följa (2 → 7) — koordinationspost till ägaren, inte fristående rättning
här (undviker att spegeln och originalet driver isär).

### D1-AR — publishedAt (NOTIS)
2026-09-20 = byggdagen; exportvägen stämplar vid flytt — publicering förblir
kundens (R2). Samma notis som originalets D1.

### SYSTEMFYND till byggarspåret — ar-mallen speglar ORIGINALET, inte granskningsdiffen
AR10 byggdes 09-20 01:03, **~22 timmar EFTER** att B10:s granskningsdiffar
låg på disk (09-19 ~03:28 lokal) — ändå ärvdes 4 av 6 poster (B1/C1/C2/C4;
A1 och C3 var språkspecifika och berör ej arabiskan). AR6 fick samma mönster
med Sandvik-länken. Två fall = systemmönster: **ar-byggaren läser inte
granskning/katalogen före spegling.** Förslag: ar-fabriken/byggaren
kontrollerar `<slug>-diff.json` + `-KOMPLEMENT-*-diff.json` i granskning/
före leverans och verkställer tvingande byt-poster (eller speglar dem i
nästa revision). Koordinationsgapet gäller sannolikt ÄVEN -en-speglar
(B10-en bär B1+B2+C4 enligt u2:s flagga 8.1) och framtida AR7/AR9/AR11+.

## Protokoll

Sond: `verktyg/_s1u3-ar10-bil-verify.mjs` — **27 kontroller: 23 GRÖN
(PASS) + 4 redovisade NOT (koordinations-/referensposter) + 0 FEL**;
sifferparitet motorräknad; 13 interna länkar HTTP-mätta mot localhost;
rankkontroll mot dagens bolagsunivers; diff-strängar maskinellt unika
(1 gammal/0 ny för alla fyra). Sondens egen vaccination, ärligt bokförd:
första körningens S7 mätte title+desc+body (1 428) mot body-spannet — fel
räknesätt, korrigerat till mallens body-mått (1 394; AR6:s jämförelsetotal
redovisas som info); U2:s tickeruppslag saknade .ST-suffix — rättat.
AR- och SV-utkast-JSON:erna ORÖRDA (read-only). Endast data/ + verktyg/ +
worklog berörda — INGET bygge, src/ orörd (tsc-baslinjen bärs av
pre-commit-grinden), R2 orörd (priser/tier/publicering), data/blogg/
(live) orörd. Publicering av AR10 (likt AR1–AR6) = kundens beslut.
