# KONTROLL 2026-10-01 s1-u3 — Tesla (TSLA) Q3 2026: GRÖN GRUND → FLYTTKLAR EFTER RÄTTNINGAR F1–F4

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-tesla-q3-2026.json` (utkast v1, byggd av s4-u1, commit 2c30664a8 2026-09-30 22:45:56Z — seriens ~89:e paket, tillväxtgrenens femte)
**Granskare:** s1-u3, manifest auto-s1-1790858103968 (granskningskön 3/3). Anspråk disk-först: `data/vakten/auto-s1-1790858103968-s1-u3-ansprak.md`.
**Dom:** **GRÖN GRUND — FLYTTKLAR EFTER RÄTTNINGAR F1–F4.** Kärnan (källfält, medianer, rang, aritmetik, juridik, kalender) är grön rakt igenom; fynden är två strukturgrindsöverträdelser (title 461 tkn, description 905 tkn), ett osynligt tecken (mjukt bindestreck) och ett n-klassfel i tabellen — alla fyra kurerade i FLYTTKLART-PAKETET, paketläget 0 FEL.

## Pivot (öppen bokföring, duplikatregeln)

Ursprungsordern "m9-utkast #3" = kassaflodesanalys-101 — FLERFALDIGT levererad
(KONTROLL 09-16 + 09-19 + v2 09-20 + 09-21-s1u3 med diff och FLYTTKLART-PAKET;
m9-familjen 6/6 FLYTTKLAR sedan 2026-09-21). Fyra föregående s1-ronder
pivoterade från samma order. Valet följer syskon u1:s koordinatrad i dennes
anspråk ("u3 → tesla (21/10)"; u1 tog nflx, u2 tog essity — tre skilda objekt,
noll kollisionsyta). Tesla saknade ALL granskningsyta på disk vid anspråket
(mätt: 0 tesla-filer i granskning/).

## Sond

`verktyg/_s1u3-tesla-q3-kontroll.mjs` — **utkastläge 114 PASS · 3 FEL · 5 NOT,
paketläge 117 PASS · 0 FEL · 5 NOT**. Fyra egna v1-sondbuggar ärligt bokförda
och rättade under arbetet (avrundningstolerans för heltalsprocenter,
MUSD-enhetsblandning i intäkt-per-fordon, magnitudklassen på årsfältsgapet —
AT&T-passets sondbuggklass upprepas). Node-kanalen hela vägen (skal-kvoten).

## Kärnan grön — vad som mättes

**Universumparitet 26/26** mot TSLA-radens fältnivå i dagens 328-posters träd:
pris 357,01 · mcap 1 410,028 · P/E 333,654 · P/B 16,231 · EV/EBIT 946,761 ·
PEG 4,26 · FCF-avk 0,34 % · ROE 4,67 · ROIC 1,42 · brutto 18,85 · EBIT 1,41 ·
netto 3,67 % · skuld/eget 0,1837 · intäkt-TTM +25,5 · prognos +21,77 · resCAGR
−32,9 % · årsse rier 2022–2025 (oms 81 462→94 827, netto 12 556→3 794) ·
utdelning null · insiderköp 10 · räntetäckning null (dokumentklass i texten ✓)
· EK/FCF-serier tomma (dokumentklass i texten ✓). **Byggvintage bevisad utan
glidning:** universumet nådde 328 poster i db5e5f13e 21:17:41Z — tesla-commiten
22:45:56Z kom 1,5 h senare; paketet byggdes mot exakt dagens träd.

**Medianer och rang 24/24 LIVE ur filen** (tillväxtgrenen n=19, fältens täckning
n=12–19 per mått): alla tolv tabellmedianer återgivna inom avrundning (P/E 46,66→46,7
· P/B 6,386→6,39 · EV/EBIT 30,83→30,8 · PEG 1,575→1,58 · FCF 1,020→1,02 · ROE 12,90
· ROIC 12,16 · brutto 47,75 · EBIT 12,13 · netto 5,48 → textens 5,48 · skuld
0,1775 · intäkt-TTM 25,50) och alla tolv rangtal exakta — däribland det
säregna påståendet "EXAKT på grenens median" som VISADE SIG SANT: medianen av
grenens 19 intäktstillväxttal ÄR 25,5 % = Teslas eget värde (udda n, medianen
är ett verkligt bolags tal). Universumrang egenmätt: P/E rang 2 av 315 bärande
(CRWD 5419,71 över), EV/EBIT rang 1 av 297 bärande, ARM närmaste följare 310,87
(textens "310,9" = fältet avrundat) — ARM är universumets 2:a högsta, kvoten
946,761/310,9 = 3,05× = textens "drygt tre gånger".

**Aritmetik 40 poster egenräknade:** EPS-identiteten 0,39+0,23+0,13+0,32 = 1,07
mot P/E-fältets implicita 357,01/333,654 = 1,0700 (paritet på fjärde decimalen —
paketets kärnpåstående håller); aktiebas-världarna 3 949,5→3 950 (mcap/pris)
och 3 501,9→3 502 (nettokedja/EPS), gap 12,8 %; nettokedjan 1 370+800+477+1 100
= 3 747; Q4-EPS 800/3 500 = 0,229→0,23 (avrundningsklassen som texten själv
deklarerar); P/B÷ROE 347,6 mot P/E-gap 4,2 %; intäktskedjan 2025 = 94 748 mot
årsfältet 94 827 (gap 0,08 %, texten "0,1 procent" = magnitudavrundning) och
nettokedjan 3 737 mot 3 794 (1,5 %); resultatfallet −69,8 % och CAGR −32,9 %
(räknat ur serien: (3 794/12 556)^(1/3)−1 = exakt fältet); TTM 103 640;
brytpunkterna P/E 300/250/200 ⇒ EPS 0,51/0,75/1,11 (+30,8/+91,8/+183,3 % —
samtliga replikerbara med outrundad division på kurs 357,01 och utrullad bas
0,68); fördubbling → P/E 245 och halvering P/E 167 ⇒ 1,46 = 3,7× kedjetoppen;
Narayan-gapet −6,7 %; intäkt/fordon 42 740 → "cirka 42 700"; fordonsandel
72,7 %; **scenariorutan 9/9 celler** (netto · EPS · P/E med aktiebas 3 500 —
hela rutan landar 299–395); marginaltickarn 280 M$ = 0,08 EPS, marginalspannet
0,24 mot intäktsspannet 0,05 = "nästan fem gånger" (4,7×); kvartalsprocenterna
+16/+26/+12/−37/−3/−46 alla inom heltalsklassen på kända kvartalsbaser
(Q1-25 19 335 · Q2-25 22 413 · Q3-24 25 182/2 167 · FY24 97 690/7 091).

**Juridik 2007:528 ren:** rådglossmönster 13 × 3 ytor = 0 träffar · båda negerade
rådformerna närvarande · EXAKT EN lagrumsfamilj (2007:528 med 2 kap 5 §, inga
främmande lagrum) · utbildningsdeklaration i body ("utbildning i metod") ·
R2-disclaimern ("Publicering av utkastet är kundens beslut") är bodyns sista rad.
Målkursspannet 250–480 i källsektionen redovisas med öppen tredjepartsnot —
källkritik, inte råd (grönt med NOT).

**911-referenser: 0** (7 mönster × 3 ytor: 911/9-11/11 september/september 11/
nine-eleven/nine eleven/terror — med vitlista för 911 som del av längre tal).

**Kalender och länkar:** datumpanelen är öppen och klassärlig — obekräftad
rappdag 21/10 AMC med namngiven konvergens (WSH "UNCONFIRMED" + Public.com +
Yahoo), MarketChameleon 21–23/10, Zacks divergerar 28/10, ir.tesla.com äger
(GETI/Newmont-praxis; kontrollera utlysningen före publicering); rytmbeläggen
ons 22/4 + ons 22/7 + fjolårets ons 22/10 internt konsistenta. **16/16 interna
länkar HTTP 200 mot localhost:3000** (dataset-tillväxt-ytorna + /kurser +
/transparens + /kallor — oberoende om AT&T-passet som fick vänta på låset).

## Fynd och kurer (detalj i diff-json)

- **F1 (VÄSENTLIGT)** title 461 tkn — 147 ÖVER wihlborgs-taket 314 (AT&T-passet
  var gränsvärt 314). Kur: 309 tkn med alla sex signaturtal + rappdagsklassen.
- **F2 (VÄSENTLIGT)** description 905 tkn — 251 över seriepraxis 328–654. Kur:
  653 tkn; datumpanelen stramad, utbildningsdisclaimern behållen sist.
- **F3 (formulering)** ett mjukt bindestreck U+00AD i "TTM-intäktstillväxten" —
  osynligt men levande i sök/kopiering. Kur: borttaget (exakt en träff).
- **F4 (n-klass)** tabellens "(universumets näst högsta/högsta av 328)" bär
  totalantalet; punktlistan ovanför har rätt bärande klass. Kur: "av 315 bärande"
  respektive "av 297 bärande" — påståendena var sanna, klasserna missvisande.

NOT utan kur: "5 år"-etiketten på resultatCAGR-fältet (fältet är kanon, radens
notering dokumenterar 4 räkenskapsår — AT&T-precedensen) · publishedAt 21/10 =
rappdagen (seriepraxis var 2 dagar före; kundens val, R2) · kalendern saknar
Tesla-rad (egen datumpanel, öppen datumklass — grönt).

## Leverans

- `granskning/sa-laser-du-tesla-q3-2026-KONTROLL-2026-10-01-s1u3.md` (denna rapport)
- `granskning/sa-laser-du-tesla-q3-2026-diff-2026-10-01-s1u3.json` (fynd + belägg)
- `granskning/sa-laser-du-tesla-q3-2026-FLYTTKLART-PAKET-2026-10-01-s1u3.json`
  (kurer tillämpade av `verktyg/_s1u3-tesla-q3-paket.mjs` med EXAKT-EN-TRÄFF-
  assert per kur; efterverifierat: gamla felsträngar 0 · mjuka bindestreck 0 ·
  nya title/description inom taken · 70 övriga nycklar bitidentiska · **utkastet
  på disk orört, md5 76fc745200e5ac27f3add76d89267cfb**)
- Sond + paketbyggare i `verktyg/` med `_s1u3-`-prefix.
- KO-rader (GRANSKAD) i båda sammanställningstabellerna — additiva, syskonens
  rader orörda.

## KVD

Data-only — src/ orörd = INGET bygge (tsc obehövd: ingen kod yta utanför
verktyg/_s1u3-* som är fristående node-skript) · R2 orörd (data/blogg/ orörd,
publicering = kundens klick; utkastet i data/blogg-utkast/ orört) ·
kalender-kommunikation.json enbart läst · node-kanalen hela vägen ·
syskonens ytor (u1 nflx, u2 essity) orörda · anslutna körningar mot
localhost enbart läsningar (16 GET).

## Kö efter denna (vidarebefordras)

22:a-klustret efter syskonens pass: swedbank/castellum/nokia/yara/seb/pg/newmont
(essity taget av u2; sandvik+atlas-copco har KONTROLL men saknar flyttklart
paket) → därefter oktoberfältet (sap/tesla var u1:s koordinat — tesla klart
här; sap väntar) → novemberfältet. Vidarebefordras: nokia-utkastets
publishedAt 10-20 mot kalenderns 22/10 (AT&T-passets not, fortfarande öppet).
