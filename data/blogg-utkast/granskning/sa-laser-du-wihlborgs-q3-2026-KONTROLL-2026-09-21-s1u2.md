# KONTROLL sa-laser-du-wihlborgs-q3-2026 — 2026-09-21 s1-u2

**Fabriksagent s1-u2** (manifest auto-s1-1790012730031, granskningskön 2/3).
Anspråk disk-först: `data/vakten/auto-s1-1790012730031-s1-u2-ansprak.md` (20:29 lokal).

## VAL (pivot, sjunde fallet i släktet)

Uppdragstitelns "m9-utkast #2" = malltext — m9-familjen är 6/6 exportkapabel
sedan 09-21 (m9-1/2 09-20 · m9-3/4 09-21 03:0x · m9-5 10:52 · m9-6 10:59).
Könotisen i worklog 16849 ger FIFO:n efter handelsbanken Q3 (ledd av u3):
**wihlborgs** → fabege/getinge 10-20 → 10-21-klustret. Wihlborgs saknade
KONTROLL i granskningsmappen (0 träffar) ⇒ INTE duplikat.

*Not till köföraren: könotisens rappdag "wihlborgs 10-13" avvek från
kalenderunderlagets 20/21 oktober — objektet var rätt, datumet i notisen
slarvigt; utkastets egen kalenderläsning (21/10, bolagsverifierad) är den
kontrollbelagda.*

## METOD

Sond `verktyg/_s1u2-wihlborgs-q3-kontroll.mjs` (läser ENDAST, skriver inget):
källor + git-orördhet + vintage-jämförelse · fältkontroller mot universumposten
· grenstatistik (medianer/rang/n) mot **byggvintagen 79d8f765** (utkastets egen
commit 09-20 21:24 — Nordea-metoden: byggets läge, aldrig dagens fil) · 48
aritmetiska omräkningar + scenariorutans 9 celler + driftsmarginalcellerna ·
juridik via kontrolleraText-exakt spegel (`data/varumarke.json`, RegExp "giu",
stateful reset — varumarke.ts:141-algoritmen) · 911 på sex mönster · struktur.
Länkar: 18 interna + 2 externa med HTTP mot localhost (deploylåset FRITT vid
mättillfället — medie-lärdomen följd).

## RESULTAT — 140 GRÖNA · 4 FYND · 0 sondfel

**Sond: 120 PASS · 4 FAIL (= fyndens belägg) · 2 NOT. Länkar 20/20 HTTP 200.**

### Grönt (urval)

- **Källor**: utkastet git-bevisat orört sedan bygget (diff 79d8f765..HEAD tom;
  md5 a73ab4ac). WIHL-posten identisk mellan byggvintagen och dagens fil —
  universumdriften 237→249 berör inte objektet.
- **Vintage-kongruens**: utkastets "237 poster, varav 17 fastighet" = EXAKT
  byggvintagen 79d8f765 (dagens fil: 249/17). Medianerna stämmer på vintagen:
  P/E 14,38 · P/B 0,946 (mittersta = Castellum exakt) · ROE 8,57 (n=16) ·
  EBIT 57,37 · netto 43,58 · skuld 1,10 · universum 20,39/2,72/14,75/20,81/
  13,90/0,53 · PEG-median 1,32 (mittersta 1,30+1,33 → 1,315, halva uppåt —
  korrekt) med n=194 EXAKT.
- **Fält**: samtliga 21 nyckeltal mot WIHL-posten exakta (pris 79,65 · P/B
  1,013 · P/E 11,203 · EV/EBIT 17,955 · FCF 6,10 % · ROE 9,27 % · skuld/EK
  1,4875 — textens "1,49" och belåningsräknet "1,4875" bär filens exakta tal ·
  golv 78,66/−1,26 % · serier 3335/3881/4174/4354 och 2288/−27/1706/2220 ·
  räntetäckning osatt + ROIC-proxy + 4-årsnot + MarketStack-not — postens alla
  noteringar ärligt burna i texten).
- **Rang**: P/B 10/17 stigande · ROE 7/16 · EBIT 3/17 · FCF 3/16 · skuld 4/17 —
  alla exakta på vintagen. "Nio kollegor under 0,95" exakt (9 st < 0,95).
  Kollegtal: URW 9,51 · Fabege 7,70 · Catena 5,26 · Balder 5,05 · Catena EBIT
  84,86 · NP3 EBIT 74,88 · Balder skuld 1,48 · Balder-rabatt 32,20 % → "32
  procent" korrekt · Catena-rabatt 5,4 %.
- **Aritmetik 48+9+1 kontroller**: identitetstest 10,928 (gap 2,52 %) ·
  kapitalträff 78,63/78,66 (0,04 %) · premie 1,26 % · implicit EPS 7,11 ·
  aktier 307,4 M · P/E-bokslut 11,03 · PEG-konvention 1,19 (kvot 1,66) ·
  belåningsgrad 59,8 % · direktavkastning 4,14 % · CAGR 9,29/−1,00 ·
  årssteg +16,4/+7,5/+4,3 · kvartalscellerna (Q2-25 = 2 142−1 045 · Q3-25 =
  3 243−2 142 · Q4-25 = 4 354−3 243) · rullande 4 536/3 227 · vinstkvartal
  +27,1/−33,2 · värdeposter +28/−255 · återhämtning 2 247 · **scenariorutan
  9/9 celler exakta** · marginalvikt 0,47 · P/E÷1,0944 = 10,24 · netto-2025
  50,99 · netto-2023 −0,70.
- **Juridik 2007:528 REN**: kontrolleraText-spegel **0 FEL 0 VARNING** på hela
  ytan (title+description+body) · rekommendationsglossor endast negerade
  ("inte en rekommendation att köpa, sälja eller behålla") · exakt en
  lagrumsfamilj (2007:528; 0 träffar på 2022:260/2022:261/1985:716/2005:59/
  2022:482) · utbildningsgrunden buren · disclaimer + R2-not sist.
- **911 = 0 på sex mönster** (title+description+body).
- **Länkar 20/20 HTTP 200**: 14 /dataset/fastighet-aspekter + /bolag/wihl-st +
  /kurser + /transparens + /kallor + 2 externa wihlborgs.se (IR + reports).
- **Vågskikt-påståendet SANT**: 0 WIHL-träffar i vagvalidering-SENASTE.md och
  0 analysfiler i data/analyses — utkastet redovisar luckan som information.
- **Kalenderns divergensberättelse KONGRUEMT**: kalender-fastighet.json bär
  WIHL-radens "divergerar mellan 20 och 21 oktober… ej officiellt bekräftat";
  utkastet upplöser mot egen verifiering (21/10) och redovisar kalenderfilens
  estimat som internt underlag — källkedlan hänger ihop.

### FYND (diff: sa-laser-du-wihlborgs-q3-2026-diff-2026-09-21-s1u2.json)

**B1 VÄSENTLIGT — "enda europeiska bolaget över pari" är FALSKT på FYRA
ställen.** Byggvintagen: NP3.ST (Sverige) handlas till P/B **1,422** —
eftersom NP3 är europeiskt (Umeå) är Wihlborgs INTE ensamt över pari utan
**ett av två** europeiska bolag (de övriga sex över pari är USA: O, PLD, EQIX,
PSA, SPG, AMT). Förekomster: title ("enda europeiska kollegan med P/B över
pari") · nyckeltalssektionen ("enda bolaget i det europeiska hyresgänget över
pari") · jämförelsestycket ("det enda europeiska bolaget över pari") ·
källsektionen ("enda europeiska bolag över pari"). Observera: rangen 10/17
och "nio under 0,95" är korrekta — felet är exklusivitetspåståendet.
Utkastets kärntema (premien på 1,26 % i en rabattgren) ÖVERLEVER felet, men
"premievändaren som ensam över pari" blir "premievändaren i pari-klubb med
NP3". Komplicerande: utkastet räknar själv upp NP3 74,88 (EBIT-marginal) i
samma text utan att koppla till P/B — fyndet är en glömd kolumn, inte fel
data. Kirurgisk kur i diffen (4 poster).

**B2 — driftsmarginalens intervall fel i toppen.** Texten: "rör sig mellan
69,6 och 73,6 procent". Cellerna: 70,0 · **74,1** (Q2-2025: 813/1 097 —
båda cellerna härledda ur H1-poster) · 71,8 · 69,6 · 69,6 · 73,6. Toppen är
74,1 %, inte 73,6 (som är Q2-2026). Kur i diffen.

**B3 (lindrigt) — källsektionens aktieavrundning.** "aktietal 24 487 ÷ 79,65
= 307,5 miljoner": korrekt är **307,4** (307,4325) — bodyn har rätt (307,4),
källraden slarvar. Kur i diffen.

**B4 (lindrigt) — avrundning nedåt.** "netto under EBIT med 23,7
procentenheter": 71,09 − 47,34 = **23,75** → halva uppåt ger 23,8. Kur i
diffen (alternativt "nära 24").

### Noteringar (ingen åtgärd)

- N1: universumdrift 237→249 sedan bygget; samtliga medianer/rang i utkastet
  låsta mot byggvintagen (Nordea-metoden) — vid nästa version av paketet
  omräkning mot dåvarande vintage.
- N2: 3 522 ord i bodyn · readingMinutes 6 (kvartalskonventionen ~round(/600)
  ger 3 — syskonfyndet från handelsbanken B2 upprepar sig här; serieägarens
  konventionsbeslut, börs ej i diffen).
- N3: externa kvartalstal (vakanser 89/87, förvärv 13,3 mdr, hyresvärde 5,0
  mdr, 2023-tal) sökverifierade av byggaren — maskinellt ej dubbelkollbara
  internt; källhänvisningarna fullständiga i källsektionen.

## KVD

Endast NYA filer (denna KONTROLL + diff + sond + anspråk + worklog-rad).
Utkast-JSON:en orörd (fynden verkställs av ägaren/nästa våg via diff — alla
from-strängar maskinellt unika). src/ orörd = INGET bygge. data/blogg/ (live)
orörd — publicering = kundens klick (R2). Syskonytor orörda (u1/u3 utan
anspråk vid mitt val; wihlborgs namngivet exklusivt i mitt anspråk). Commit
med explicit pathspec + -F-fil.

**Dom: FLYTTKLAR EFTER RÄTTNING — B1 måste rättas före publicering (titeln
bär felet); B2-B4 i samma korrigeringspass. Däreör paketet i samma klass som
handelsbanken/sandvik-leveranserna.**
