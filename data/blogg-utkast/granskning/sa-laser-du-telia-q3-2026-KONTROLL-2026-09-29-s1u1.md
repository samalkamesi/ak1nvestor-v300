# KONTROLL — sa-laser-du-telia-q3-2026.json

**Granskad av:** agentfabrik auto-s1-1790653512758 s1-u1 (2026-09-29)
**Dom: FLYTTKLAR EFTER FYRA KIRURGISKA RÄTTNINGAR — 129 maskinella kontroller · 121 PASS · 0 FEL-varumärke · 21/21 länkar HTTP 200**
**Sond:** `verktyg/_s1u1-telia-kontroll.mjs` (read-only, stdout-rapport)

## Val och FIFO

Uppdragstitelns "m9-utkast #1" (boerspsykologi-fallstugor) är levererad sedan 2026-09-20
(FLYTTKLART-PAKET) och m9-familjen 6/6 exportkapabel sedan 09-21 — pivot enligt släktets
praxis. Kö-notisen (worklog 17074, s1-u3 2026-09-21): "Kö efter denna: fabege/getinge
10-20 → 10-21-klustret (telia/iberdrola/var-energi/att)". Syskonen i omgången tog fabege
(u3) och getinge (u2) enligt deras anspråk ⇒ **telia = FIFO-trea bland kontrolllösa**
(0 "telia"-träffar i gransknings/ vid anspråkstillfället). Anspråk disk-först:
`data/vakten/auto-s1-1790653512758-s1-u1-ansprak.md`.

## Källor

- **Universumrad TELIA.ST: 28/28 fält exakta** mot LÅST byggvinda — commit `795fe396`
  (2026-09-17 03:04:45, **144 poster** — 39 minuter efter utkastets byggtid 02:25, dvs
  byggarens egen commit av läget den läste). Dagens fil (316 poster) redovisas som drift
  och används INTE som domslut — textens tal är tidsstämplade mot vindan.
  Kurs 44,77 · mcap 176,041 mdr · P/E 35,816 · P/B 3,532 · EV/EBIT 17,885 (textens 17,9 ✓)
  · PEG 1,97 · FCF-yield 11,95 % · ROE 10,56 % · ROIC 10,30 % · brutto 50,15 % · EBIT
  17,68 % · netto 6,03 % · FCF 25,71 % · skuld/EK 1,6914 · CAGR −3,75 % · TTM +4,6 % ·
  prognos 6,55 % · intäktsserie 90 827→88 785→89 127→80 982 Mkr · resultatserie
  −14 638→303→7 079→3 525 Mkr · resultatCAGR null · räntetäckning null · insider 0 ·
  källnoter (4 år, ROIC-proxy, ingen bruttohistorik) — allt i texten med svensk
  avrundning. Aktieantalet 3 932 M härlett: 176 041/44,77 = 3 931,6 M.
- **Rappdag 2026-10-21** med divergensnot mot tredjepartskalender (22/10): båda i
  `kalender-kommunikation.json` ("enligt officiell kalender; tredjepart har visat
  2026-10-22") — texten citerar korrekt. Kollegodagarna verifierade mot kalenderfilerna:
  ABB+Tele2 20/10, SKF+Handelsbanken+Iberdrola 21/10, Yara+Billerud 22/10, SCA+Hydro
  23/10, SSAB+UPM 28/10, Boliden 29/10, Stora Enso 30/10 — **samtliga gröna**.
- **Seriepåståenden mot vindan:** Tele2 ROE 47,6 % / skuld 1,35 / P/E 11,9 / ROE−ROIC-gap
  24 pp — 4/4 exakta. Iberdrola FCF-yield 1,96 % / netto 15,9 % / FCF 5,8 % — 3/3 exakta.

## Siffror — medianer (oberoende omräknade ur vindan)

Kommunikation n=13: P/B 2,68 · ROE 15,84 % · EBIT 21,11 % · netto 11,64 % · skuld 1,28 —
5/5 exakta; P/E-medianen 21,8 exakt men **n=11, inte 12** (se fynd C3). Universum:
P/E 21,2 (n=135) · P/B 2,88 (n=141) · ROE 15,58 % (n=140) · EBIT 21,22 % (n=143) · netto
14,67 % (n=144) · skuld 0,52 (n=130) — 6/6 n-värden exakta, värdena exakta med not om tre
mittpunktsavrundningar (se D2).

## Siffror — aritmetik (50+ poster, samtliga omräknade)

Identitetstest P/E = P/B ÷ ROE: 3,532/0,1056 = 33,45 (−6,6 %) ✓ · omvänt 3,78 ✓ · implicit
EPS 1,25 ✓ · absolutkontroll väg ett 4 883 Mkr → 174,9 mdr, residual −0,6 % ✓ (med
oavrundat netto −0,6497 % — sondens v1 avrundade netto först och fick −0,7: **sondbugg 1,
ärligt bokförd**) · väg två 126,3 mdr, −28,3 % ✓ · vinstbegreppsgap 38,53 % → "39 % isär" ✓
· PEG-konvention 5,47, kvot 0,36, implicit tillväxt 18,2 ✓✓✓ · EV-kedjan EK 49,8 / skuld
84,3 / EV 134,1 / EBIT 14 318 / kedja 9,37 / kvot 0,52 — alla exakta; residualen (se D1) ·
FCF-kontroll 20 820 Mkr → 11,83 %, gap 0,12 pp = "tolv hundradelar" ✓ ·
nettomarginalserie −16,12/+0,34/+7,94/+4,35 ✓✓✓✓ · intäktssteg −2,25/+0,39/−9,14 ✓ ·
CAGR −3,75 ✓ · halveringen −50,2 ✓ · marginalgap 32,5/11,7/44,1 pp ✓✓✓ · scenarioruta
9/9 celler ✓ · räknesatser 810/430 Mkr, vikt 1,89 = Essity-formeln ✓ · FCF-nivåer
20 196/20 820/21 445 (bodyn) ✓ · yield-spann 11,5–12,2 % ✓ · återbetalningsår 8,45 →
"åtta–nio" ✓ · P/E/(1+g) = 33,61 ✓ · 4,3× = 25,71/6,03 ✓ · relativtal mot medianer
64/69/32/23/16/48/33/32 % och 3× ✓ (alle x).

**CAGR-vägranstabellen:** källans resultatCAGR-fält är null — korrekt speglat; härledd
nettomarginalserie korrekt; "därefter halveringen 2025 (−50,2 %)" korrekt. DÄREMOT kan
"+227 procent på två år" inte reproduceras ur serien (se fynd C1).

## Kalender och paketlandskap

Rappdagskartan byggd ur alla tio kalender-filer; textens kollegodagar gröna (ovan).
**Läspaketsräkningen ("15 läspaket: ... sju den 22:a ... SCA och Saab den 23:e") håller
inte** mot git-tillkomstdatumen: vid byggtiden 02:25 fanns i fönstret 20–23/10 exakt
ABB, Tele2 (20:e), Telia, SKF, Handelsbanken, Iberdrola (21:a), Atlas Copco, Castellum,
Essity, Sandvik, Swedbank (22:a), Volvo Car, Volvo Group (23:e) = **13**; Saab tillkom
04:06 (före Telias egen commit 04:28) = **14 vid commit**; SCA tillkom 11:16 och Yara
11:00 samma förmiddag — parentesen "ännu utan paket" var sann vid bygget men föråldras
vid publicering. Se fynd C4. `publishedAt 2026-10-19` ≤ rappdag 21/10 — i linje med
publicerade syskon (skf-b/sandvik publicerade 10-19 med rappdagar 21/22; holm 10-21 mot
22/10): konventionen är läspaket FÖRE rapporten; Investor-passets "=rappdag" var inte
seriens regel (se D4).

## Juridik (2007:528)

Varumärkesgrindens samtliga 26 mönster ur `data/varumarke.json` (regex-formen `fran`,
exakt kontrolleraText-spegel ur src/lib/varumarke.ts) × title+description+body =
**0 FEL, 0 VARN**. Exakt **ett** lagrum: 2007:528 2 kap 5 § — inga blandade lagrum
(2022:260/261/716, 2005:59 = 0 träffar). Utbildningsram i ingressen
("utbildningspaket", "utbildning i metod") + negerad räd-fras + italic-disclaimer exakt
sista raden. Rådglossorna "köp"/"sälj" enbart i negerad form; "borde" i metaforn "allt de
borde köpa" (se D3). **911-referenser: 0** (sex mönster: 911, 9/11, 11 september,
September 11, nine-eleven, 9-1-1 × alla ytor).

## Struktur och länkar

Ord 3 169 → readingMinutes 5 = round(3169/600) ✓ · description 654 tkn (seriens spann
283–762) · tags 6 med serie+bolag ✓ · pillar/author = seriestandarden ✓ · 7 H2 ✓ · inget
maskinkvitto ✓. Titel 295 tkn — se D5 (fynd AVVISAD). **Länkar: 21/21 HTTP 200**
(16 /dataset/kommunikation/* + /bolag/telia-st + /kurser + /transparens + /kallor mot
localhost:3000; https://www.teliacompany.com/en/investors/reports-presentations/ live).

## Fynd och domar

**0 B (blockerande) · 4 C (kirurgiska, 6 strängbyten) · 5 D (dokumenterade, inga ingrepp):**

- **C1 — CAGR-vandringens tal fel.** Texten: "bilden är +227 procent på två år". Serien
  303→7 079→3 525 ger: totalt två år **+1 063 %** (3 525/303 = 11,63×), per år +241 %,
  ett år +2 236 % — inget beräkningssätt ger 227. Rättning: `+227 procent på två år` →
  `+1 063 procent på två år`. (Hela stycket handlar om CAGR-ärlighet — talet ska stämma.)
- **C2 — källradens FCF-nivåer avviker från bodyns.** Bodyn (korrekt): 20 196/20 820/
  21 445 Mkr ur 25,71 % × 78 553/80 982/83 411. Källraden: "20 203/20 820/21 437".
  Rättning: `20 203/20 820/21 437` → `20 196/20 820/21 445`.
- **C3 — P/E-medianens n (två ställen).** Vindan: 13 kommunikationsbolag varav TVÅ saknar
  P/E-fältet (VPLAY-B.ST, WBD) ⇒ n=11, median 21,788 → 21,8 (värdet i texten ✓). Texten:
  "n=12 eftersom ett bolag saknar fältet" samt tabellraden "21,8 (n=12)". Rättningar:
  `n=12 eftersom ett bolag saknar fältet` → `n=11 eftersom två bolag saknar fältet`;
  `21,8 (n=12)` → `21,8 (n=11)`.
- **C4 — läspaketsantalen (tre ställen).** Empiri (git-tillkomst + rappdagsfönster):
  14 paket vid textens commit — 2 (20:e) + 4 (21:a) + **5** (22:a: Atlas Copco, Sandvik,
  Essity, Castellum, Swedbank) + **3** (23:e: Volvo Car, Volvo Group, Saab). SCA saknade
  paket (till 11:16, efter commit) OCH står i textens egen "ännu utan paket"-parentes —
  att ändå lista SCA bland 23:e-paketen är en intern motsägelse. Rättningar:
  `15 läspaket` → `14 läspaket`; `sju den 22:a` → `fem den 22:a`;
  `Volvo Car, Volvo Group, SCA och Saab den 23:e` → `Volvo Car, Volvo Group och Saab den 23:e`.
  Efter bytena: 2+4+5+3 = 14 ✓ internt konsistent. Parentesen "Yara, Billerud och SCA
  ännu utan paket" lämnas oförändrad som byggtidsstämpel (Yara-/SCA-paketen kom samma
  förmiddag; Billerud har ännu inget) — verkställaren får stryka den om publikationsdatum
  ligger sent i oktober.
- **D1 — EV-residualens sista decimal.** Texten −121,9 mdr; rakt beräknat −122,0 (med
  fältet 17,885) eller −122,2 (med 17,9). Byggarens kedja 134,1 − 14,3×17,9 = −121,9 är
  konsekvent med egna avrundningssteg — bevaras (Investor-C2-precedens: egna steg räcker).
- **D2 — tre mittpunktsavrundningar.** P/B-median 2,675 → text 2,68; skuldmedian 0,515 →
  0,52; ROE-median 15,585 → 15,58. Jämnmedianer på exakt halvtal — half-up/half-down båda
  defensible; textens val bevaras.
- **D3 — "allt de borde köpa".** Metafor med oklart subjekt i utbildningstext; grunden
  ger 0 FEL men formuleringen ligger nära rådgivningsvokabulär. Frivilligt förslag:
  `allt de borde köpa` → `allt som borde vara starkt`. Lämnas som förslag, ej krav.
- **D4 — publishedAt-konvention.** 2026-10-19 (måndag) före rappdagen 21/10 — i linje med
  publicerade syskon (skf-b/sandvik 10-19). Ingen ändring.
- **D5 — titellängd 295 tkn: FYND AVVISAD.** Sondens spann (201–229) byggde på två
  datapunkter; full empiri: 39 av 84 kvartalsutkast överstiger 229 tkn (max 585) — 295 är
  inom seriens normalform (**sondbugg 3: felkalibrerat kriterium**, bokförd). Titel
  behålls oförändrad.

## Flyttklart

Paketet är **FLYTTKLART för kundens publiceringsbeslut (R2) efter de fyra C-rättningarna**
i `sa-laser-du-telia-q3-2026-diff-2026-09-29-s1u1.json` — samtliga sex strängar
unik-verifierade ×1 i bodyn/title. `data/blogg/` (live) orörd; utkast-JSON:en orörd
(granskaren skriver aldrig andras filer); src/ orörd = inget bygge. Rappdag 2026-10-21.
