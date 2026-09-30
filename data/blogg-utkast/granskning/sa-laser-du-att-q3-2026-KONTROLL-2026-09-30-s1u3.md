# KONTROLL 2026-09-30 s1-u3 — sa-laser-du-att-q3-2026 (AT&T Q3 2026)

**Fabriksagent s1-u3 (granskare 3/3, manifest auto-s1-1790796926223).**
PIVOT (öppen, duplikatregeln): ursprungsordern "m9-utkast #3"
(kassaflodesanalys-101) levererad minst fyra gånger (worklog 17305:
m9-familjen 6/6 FLYTTKLAR sedan 09-21; FLYTTKLART-PAKET på disk sedan
09-21 03:07; tre föregående s1-u3-instanser pivoterade B24→fabege).
FIFO enligt fabege-könotisen ("kö efter denna: getinge → 10-21-klustret
telia/iberdrola/var-energi/att") + syskonens anspråk i samma omgång:
**u1 = iberdrola, u2 = var-energi, u3 = AT&T** (släktkonventionen konvergerar
i båda syskonens anspråksfiler; AT&T = rappdag 21/10, delad FIFO-etta med
iberdrola bland kontrolllösa). 0 att-filer i granskning/ före arbetet.
Anspråk disk-först: data/vakten/auto-s1-1790796926223-s1-u3-ansprak.md.

## Objekt

- Utkast: `kvartal/2026-q3/sa-laser-du-att-q3-2026.json` (byggare fabrik
  s4-u2, commit fe37b0b8 2026-09-17 16:50; 30 324 byte; på disk md5
  **bb880241** = byggcommittens — utkastet orört sedan leveransen).
- Källor: bolagsunivers.json byggvintage fe37b0b8 (**159 poster**,
  T-posten fältnivå identisk med DAGENS 322-posters träd — ingen
  D1-drift berör T), kalender-kommunikation.json 2026-09-15,
  vagvalidering-SENASTE.json 2026-09-04.

## Granskningsresultat: GRÖN GRUND → FLYTTKLAR EFTER RÄTTNINGAR F1–F3

Sond `verktyg/_s1u3-att-q3-kontroll.mjs` (v2 efter sex ärligt bokförda +
rättade v1-sondbuggar: matchAll utan /g, isFinite(null)=true i
rangfiltret, enhetsblandningar USD/MUSD, 21889→21.889, pp-tolerans mot
avrundade tal, disclaimer-split på semikolon):
**utkast-läge 140 OK · 0 FEL · 5 NOT; paket-läge 157 OK · 0 FEL · 4 NOT.**

### Källor och fält — GRÖNT 31/31

T-posten exakt mot vintage på ALLA fält: pris 25,95 · mcap 177,819 ·
CAGR 1,34 % · resultatCAGR null ("negativt/noll resultat basåret" —
textens CAGR-vägrar-notering är källans egen) · TTM 2,3 % · prognos
9,67 % · ROE 18,34 · ROIC 11,44 (proxy-not ordagrant) · brutto 59,72 ·
EBIT 24,79 · netto 16,94 · FCF-marginal 7,97 · skuld/EK 1,2905 ·
räntetäckning null (luckan redovisas) · P/E 8,593 · P/B 1,616 ·
EV/EBIT 10,908 · PEG 1,58 · FCF-yield 5,70 · serier 120 741/122 428/
122 336/125 648 mot −8 727/+14 192/+10 746/+21 889. Verizon-duopolet
10/10 fält (brutto 59,45 · EBIT 23,00 · netto 11,64 · ROE 15,84 ·
FCF 12,58 · skuld 1,8408→1,84 · P/E 13,112→13,11 · P/B 2,008→2,01 ·
yield 8,37 · prognos 5,35). MarketStack-dubbelkällan (pris/P-E/PB/mcap
mot slutkurs 2026-09-02) är postens egen paranoid-not — textens
"dubbelkällsbelagd" är sann.

### Medianer och rang — GRÖNT 16/16 + 2/2

Alla medianer EGENBERÄKNADE ur 159-vintagen med exakta n:
universum P/E 20,52 (150) · P/B 2,83 (156) · ROE 15,57 % (155) ·
EBIT 20,71 % (158) · netto 13,66 % (159); gren P/E 21,85 (12) ·
P/B 2,70 (14) · EV/EBIT 16,27 (14) · PEG 1,49 (11) · FCF-yield 6,77 %
(14) · ROE 17,09 % (14) · brutto 49,64 % (14) · EBIT 20,21 % (14) ·
netto 12,31 % (14) · FCF 15,31 % (14) · skuld/EK 1,11 (14).
Brutto-gränsfallet: egna beräkningen 0,49635 exakt — halv-upp ger
49,64 = textens tal (seriens avrundningskonvention, grönt).
Rang: P/E **lägst av grenens tolv P/E-bärande** ✓ · brutto **fjärde
högst av 14** ✓.

### Aritmetik — GRÖNT med ett väsentligt undantag (F1)

~60 egenräknade poster: nettomarginalserie −7,23/+11,59/+8,78/+17,42 ✓ ·
steg +1,40/−0,08/+2,71 ✓ · CAGR 1,34 % ✓ · identitet 1,616÷0,1834 =
8,81 (+2,53 %) med omvänd väg 1,576 (−2,48 %) och implicit EPS 3,02 ✓ ·
absolutkontroll 8,593×21 889 = 188,1 mdr = +5,8 % residual, TTM-vägen
187,1 = +5,2 %, implicit vinst 20 693 = −5,5 % ✓ · TTM-omsättningen
128 538 MUSD = 125 648×(1+2,3 %-fältet) — härledningen reproducerbar ✓ ·
PEG-trippeln 0,89/1,78/5,4 ✓ · EV-kedjan EK 110,0 → skuld 142,0 →
EV 252,0 mot fältvägen 339,7 = **residual −87,7 mdr omöjligt negativt** —
telekomgrenens TREDJE brytande EV-paket (Tele2 −90,6, Telia −121,9,
AT&T −87,7: grenens samtliga tre) med kedjekvot 8,09 mot fält 10,908
(0,74) ✓ · FCF-kontrollen 0,0797×128 538 = 10 244; yield 5,76 % mot
fältets 5,70 — se F3 · FCF/vinst 47,0 % ✓ · rättesatser 1 pp =
1 256 MUSD, 3 % = 3 769, vikt 3,0×, marginalvikt 1÷(3×0,2479) = 1,34 ✓ ·
multiplövning 8,593÷1,0967 = 7,84 ✓ · medianlägen −61/−40/−33 %,
+10,1/+4,6/+4,6 pp, −7,3 pp, "halva medianen" 0,52 ✓ · duopolgap
brutto 0,27 pp och P/E 13,11/8,59 = +52,6 % → "53 procent" ✓ ·
prognos/TTM 9,67/2,3 = 4,2× → "nästan fyra gånger" ✓.

### Juridik 2007:528 — REN

Rådglossor (köp/sälj/rekommendera/rekommendation/bör du/buy/sell/go
long m.fl., 13 mönster) × 3 ytor (title/description/body) = **0 träffar**.
Negerade rådformer 2 ("inte investeringsråd", "rådgivning kräver
tillstånd"). **Exakt en lagrumsfamilj: 2007:528** (2 kap 5 §) — inga
främmande lagrum. Disclaimer + R2-sats är bodyns avslutande meningssats.
Utbildningsdeklaration i ingressen ("utbildningspaket i AK1A:s
kvartalsrapportserie").

### 911-referenser — 0/6 mönster

### Struktur — GRÖNT med gränsnot

H2 13 · **title 314 tkn = exakt wihlborgs-taket** (grönt men på
gränsen; syskon: fabege 257, telia 295, wihlborgs-kur 295) ·
ord 2 365 → readingMinutes 4 = round(2365/600) ✓ · tags 6 ·
mjuka bindestreck 0 · description 625 tkn (seriepraxis 328–654:
fabege 394, telia 654, getinge 328 — OG-taket 155 gäller inte
JSON-fältet i denna serie) · publishedAt 2026-10-19 = två dagar före
rappdagen (seriepraxis: telia 10-19 mot 21/10, abb 10-16 mot 20/10,
volvo-car 09-15 mot 23/10).

### Länkar — 20 interna, alla kända sökvägsformer

/kurser, /transparens, /kallor, /bolag/t + 16 /dataset/kommunikation/-aspekter.
(HTTP-kontroll mot localhost körs vid fritt deploylås — se worklog.)

### Kalender — GRÖNT med räknefyndet F2

Rappdag 21/10 officiellt bekräftad ("AT&T to Release Third-Quarter 2026
Earnings on October 21"), före börsöppning + telefonkonferens samma dag,
Q2 2026 = 22/7 — allt exakt mot kalender-kommunikation.json. SAP samma
dag ca 22:05 svensk tid ✓ · "Nokia och SEB kommer 22 oktober" — RÄTT mot
kalendern (Nokia 2026-10-22; NOT: nokia-SYSKONETS publishedAt bär 10-20,
det är detta pakets objekt att lägga i kön, inte AT&T:s fel) ·
veckolistan dag-för-dag stämmer mot kalenderfilerna.

## FYND (kurerade i FLYTTKLART-PAKETET)

**F1 (VÄSENTLIGT — aritmetikfel):** Scenariorutans nedersta rad
"Intäkter 121 978" — korrekt är 125 648 × 0,97 = **121 879** (v1 bär en
transposition 87↔97); radens tre celler 27 799/30 238/32 678 är internt
konsistenta med felbasen och omräknas med: **27 776/30 214/32 651**
(121 878,56 × 0,2279/0,2479/0,2679). Rättesatserna och övriga sex celler
ogrönare — felet är isolerat till nedersta raden.

**F2 (räknekonsistens):** Veckolistan uppräknar 19 bolagsnamn men texten
säger "arton av seriens läspaket … med AT&T som det nittonde" (2 ställen).
Alla 19 namn — inklusive Nokia (kalenderdag 22/10 källsann; paketet på
disk sedan 09-18, före publiceringstillfället) — har utkast i serien:
kurren är omräkning, inte strykning: "med AT&T **tjugo** av seriens
läspaket" + "**nitton** av seriens läspaket … med AT&T som det
**tjugonde**".

**F3 (formulering):** FCF-kontrollens "håller inom en procent relativt" —
egen beräkning 5,7635 mot 5,70 = **+1,07 % relativt** (0,06 procentenheter):
strikt över en procent. Kur: "inom" → "cirka".

## NOTER (utan kur)

- Bruttomedianens 49,64 = halv-upp på exakt 49,635 — grönt med seriens
  konvention.
- Description 625 tkn och publishedAt 19/10 = seriepraxis (se Struktur).
- TTM-omsättningen 128 538 är härledd (2025 × 1+TTM-fältet) — reproducerbar
  ur källradens egna tal, transparent nog.
- Vidarebefordras till granskningskön: nokia-utkastets publishedAt 10-20
  mot kalenderns 22/10 (Nokia-paketets eget kontrollobjekt).
- u1:s iberdrola-rad noterar kö efter deras: var-energi/att — denna
  leverans stänger att; nästa FIFO bland kontrolllösa: 22:a-paketen
  (essity/swedbank/sandvik/atlas-copco/castellum/nokia, publishedAt
  10-20-floran) → novemberfältet.

## LEVERANS

- `granskning/sa-laser-du-att-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u3.json`
  (alla tre kurer maskinellt tillämpade ur utkastet med EXAKT-EN-TRÄFF-
  assert av `verktyg/_s1u3-att-q3-paket.mjs`; efterverifierat av sonden:
  157 OK · 0 FEL — gamla felsträngar 0, nya tal omräknade, nycklar
  intakta, utkastet på disk orört md5 bb880241)
- `granskning/sa-laser-du-att-q3-2026-diff-2026-09-30-s1u3.json`
- `granskning/sa-laser-du-att-q3-2026-KONTROLL-2026-09-30-s1u3.md` (denna fil)
- Sond `verktyg/_s1u3-att-q3-kontroll.mjs` + paketbyggare
  `verktyg/_s1u3-att-q3-paket.mjs`
- KO-rader i GRANSKNINGSKO-SAMMANSTALLNING.md (additiva; byggarens rader orörda)

Publicering = kundens beslut (R2). Utkasts-JSON:n orörd — granskaren
skriver inte andras filer. src/ orörd = INGET bygge; tsc oberoende av
denna leverans (data-only).
