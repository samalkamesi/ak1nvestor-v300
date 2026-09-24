# KONTROLL — sa-laser-du-investor-ab-q3-2026.json (ÅTERLEVERANS)

**Granskad av:** agentfabrik auto-s1-1790235302376 s1-u2 (2026-09-24)
**Dom: FLYTTKLAR — 67 maskinella kontroller · 0 FEL · 2 VARN (exit 0)**
**Sond:** `verktyg/_s1u2-investor-ater-kontroll.mjs` (read-only, stdout-rapport)

## Varför en återleverans

Första granskningen (auto-s1-1790039720753 s1-u2, 2026-09-22, 116 kontroller gröna,
commit 02e73dd5) **förlorades i en branch-reset**: commiten nås inte av develop-ref,
filerna togs bort från disken. Bevis: `git log --all -- *investor-ab-q3-2026-KONTROLL*`
= tomt; reflog `HEAD@{2026-09-24 09:45:02} reset: moving to 6e15cbac` förkastade
v161-linjen; fabriksstatusen rapporterar ändå "klar kod 0". Denna granskning är en
fristående ommätning — inga värden har hämtats från det förlorade passet; dess logg
(`data/vakten/agentfabrik/utdata/auto-s1-1790039720753-s1-u2.log`) har enbart använts
som REFERENS för vilka fynd som väntade bekräftelse.

## Källor

- **Universumrad INVE-B.ST: 11/11 fält exakta** mot låst byggvinda — commit
  `29763fe5` (231 poster, md5 cfa7a9f1), samma filversion som textens EGNA källrad
  angiver ("omräknade 20 september 2026 ur universumets 231-postfil"). Dagens fil
  (256 poster, finansgrenen vuxen 33→37) redovisas som drift och används INTE som
  domslut — medianerna i texten är tidsstämplade mot byggvindan och är korrekta mot den.
- Kurs 410,75 · P/E 4,792 · P/B 1,159 · EV/EBIT 4,644 · PEG 5,08 · ROE 27,25 % ·
  brutto 89,44 · EBIT 88,7 · netto 80,07 · FCF 50,61 · TTM +1,17 % — alla 11 i texten
  med korrekt avrundning (svenskt decimalkomma).
- Referensbolag i ingressen verifierade: Industrivärden P/B 1,03 och Kinnevik P/B
  0,598 (=40,2 % under bokfört) mot samma vindversion.
- Rappdag 2026-10-16: bolagets egen kalender (Q2-PDF) + Inderes via kalender-finans.json —
  överensstämmande; publiceringsdatum `publishedAt: 2026-10-16` = rappdagen (seriens form).

## Siffror — medianer/rang (oberoende omräknade ur den låsta vindan)

| Mått | Texten | Beräknat | Dom |
|---|---|---|---|
| Finansgrenen n | 33 | 33 | PASS |
| Median P/E | 14,37 | 14,37 | PASS |
| Median P/B | 1,77 | 1,77 | PASS |
| Median EV/EBIT | 15,02 | 15,02 | PASS |
| Median PEG (n mätta) | 1,25 (30) | 1,25 (30) | PASS |
| Median ROE | 13,6 % | 13,6 % | PASS |
| Investor P/E rang | lägsta av 33 | 4,792 = min (n=33) | PASS |
| Investor ROE rang | 3:e högsta; V + Mastercard över | 2 bolag över: Visa, Mastercard | PASS |
| P/E undre kvartil | 12,41 | 12,41 | PASS |
| P/B-kvartiler | 1,51–2,72 | 1,51–2,72 | PASS |

## Siffror — aritmetik (30 poster, samtliga omräknade)

NAV-trappan 355→367→397 (+11,8 %) och rapporterat 311→354 (+13,8 %) · pengatrappan
1 087 082→1 125 062→1 214 733 Mkr (+11,7 %) · NAV/aktie härledd 354,45 och 396,51 ur
aktieantalet 3 063 530 101 · gap 1 214 733−1 085 862 = 128 871 Mkr = 42,07 kr/aktie =
11,9 % av rapporterat · premier 410,75÷354,45 = 1,159 (+15,9 %) och ÷396,51 = 1,036
(+3,6 %) · kursstegen +7,2/+13,6/+21,8 % · premievändningen −6,9 % → +1,5 % = 8,45 pp
("åtta och en halv procentenhet") · börsvärde härlett 410,75 × 3 063,53 M = 1 258 mdr ·
börsvärdestillväxt 1 009 998→1 225 307 = +21,3 % · netto 28 800−52 100 = −23 300 ·
belåning 23 300/1 214 733 = 1,9 % · noterade 946 199 = 77,9 % (årsskiftet 73,4 %,
tabellsumman 797 898/1 087 082) · ABB 23,0 % av substansen, tre största 44,2 %, ABB
halvår +52,5 %, Saab-vikt 6,8 %, AZ-vikt 7,7 %, viktmechaniken 10 %×23,0 % = 2,3 % —
**alla exakta**. Identitetstestet P/B 1,159 vs kurs÷NAVr 1,1588: beräknad avvikelse
**0,0134 %** — textens "0,013 procent" är KORREKT (se dom C2 nedan).

## Juridik (2007:528)

Varumärkesgrindens samtliga 26 mönster ur `data/varumarke.json` (regex-formen `fran`,
negerings-lookbehind) × title+description+body = **0 FEL, 0 VARN**. Exakt **ett**
lagrum i hela paketet: 2007:528 2 kap 5 § — inga blandade lagrum. Utbildningsram i
ingressen ("utbildningspaket", "utbildning i metod, inget annat") + negerad räd-fras
("inte en rekommendation att köpa, sälja eller behålla") + disclaimer exakt sista
raden. VARN 1: orden "köp"/"sälj" förekommer — manuellt kontextverifierade: enbart i
negerade/utbildningsformer. **911-referenser: 0** (sex mönster: 911, 9/11, 11 september,
September 11, nine-eleven, nine eleven × alla ytor).

## Struktur

Ord 2 941 → readingMinutes 5 = round(2941/600) ✓ · description 283 tkn och title
201 tkn = **kvartalsseriens konvention** (publicerade serieposter har 228/77 tkn;
m9-seriens 155/60-gränser gäller inte här) · tags 7 med serie+bolag ✓ ·
publishedAt = rappdagen, flytt till data/blogg/ = kundens beslut (R2) ✓.
VARN 2: interna länkar ej HTTP-kontrollerade i denna sond (mönstret
/dataset/finans/*, /bolag/inve-b-st, /kurser, /transparens närvarar); föregående
passets 116-kontrollsrunda mätte grönt.

## Fynd och domar

**0 B (blockerande) · 2 C (kirurgiska) · 1 avvisad C från förlorat pass:**

- **C1 — belåningsårsskiftet trunkerat.** Texten: "(2,1 vid årsskiftet)". Beräknat:
  23 387/1 087 082 = **2,151 %** — trunkering till 2,1, källans avrundning är 2,2.
  Rättning: `2,1` → `2,2` (samma dom som förlorat pass — bekräftad oberoende).
- **C3 — biblioteksmarginalen felaktigt räkneord.** Texten: "den ligger idag på 62,9
  procent, med marginalen alltså en tiondel". 62,9−60 = 2,9 pp = nära TRE tiondelar.
  Rättning: "en tiondel" → "nära tre tiondelar" (samma dom som förlorat Pass — bekräftad).
- **C2 — AVVISAD (ny dom, avvikande från förlorat pass).** Förlorat pass föreslog
  "0,013"→"0,014 procent". Ny mätning med exakt aktieantal: (1,159−1,158845)/1,158845
  = **0,0134 %** — med textens två värdesiffror är "0,013 procent" korrekt avrundat
  (0,0134 → 0,013). Texten behålls OFÖRÄNDRAD; ingen diff-post.

## Flyttklart

Paketet är **FLYTTKLART för kundens publiceringsbeslut (R2)** efter de två C-bytena i
diff-filen `sa-laser-du-investor-ab-q3-2026-diff-2026-09-24-s1u2.json` (båda strängarna
unik-verifierade ×1 i bodyn). `data/blogg/` (live) orörd; utkast-JSON orörd (granskaren
skriver aldrig andras filer); src/ orörd = inget bygge. Rappdag 2026-10-16.
