# KONTROLL 2026-09-30 — sa-laser-du-iberdrola-q3-2026 (s1-u1, manifest auto-s1-1790796926223)

**Dom: GRÖN GRUND → FLYTTKLAR EFTER 18 RÄTTNINGAR (B1–B2, C1–C4).** Paket + diff
levererade maskinellt; utkast-JSON:n orörd (md5 290b4f98…). Publicering = kundens
beslut (R2).

## Val och pivot (öppen bokföring)

Titelns m9-utkast #1 (boerspsykologi-fallstugor) är levererat minst tre gånger
(KONTROLL 2026-09-16 + KONTROLL 2026-09-20-s1u1 + FLYTTKLART-PAKET 2026-09-20) och
m9-familjen är 6/6 FLYTTKLAR sedan 2026-09-21 — worklog 18805 dokumenterar att
förra omgångens s1-u1 med samma prompttext pivoterad från just m9 #1. Pivot enligt
släktets praxis och uppdragets duplikatregel. FIFO-etta bland kontrolllösa: alla
tre förra omgångens kö-notiser konvergerar på 10-21-klustret "telia/iberdrola/
var-energi/att" (worklog 18800/18804/18805); telia och getinge tagna — iberdrola
nämnt före var-energi/att. Mätt i arbetsytan 2026-09-30: utkast på disk, 0
granskningsfiler för slugen. Anspråk disk-först: data/vakten/auto-s1-1790796926223-s1-u1-ansprak.md.
Syskonen u2/u3 antas ta var-energi/att.

## Sond

`verktyg/_s1u1-iberdrola-kontroll.mjs` — **109 OK · 10 FEL (= fyndens belägg) · 5 NOT**,
deterministisk, körd ×2 med identiskt utfall. Byggvintage identifierad via git:
utkastet committat c0684b79 2026-09-16 22:59; bolagsunivers.json senaste commit före
bygget = **c256c659 2026-09-16 21:51, 138 poster** — exakt den 138-bolagsfil bygg-KVD:n
deklarerar. Dagens fil (322 poster) används endast som drift-referens.

**Ärligt bokförade sondbuggar, rättade + omkörda (fyra):**
1. C2 jämförde tickern mot `'RWE'` men filen bär `RWE.DE` — rang 2 + RWE-topp var
   grönt hela vägen; efter prefixmatch: OK.
2. D5/D6 enhetsglidning (M€ mot mdr): 24,842 × 6 285 M€ = 156,13 mdr → textens
   156,1 var korrekt; efter divisionskorrigering: OK.
3. C3 spann-mått max/min sprängs av nollskuldsbolag (industrins 282× på min 0,028) —
   kompletterat med absolut bredd; se fynd C4 nedan.
4. G2 ordräkning: `split(/\s+/)` gav 3 350; släktets konvention (fabege-sonden rad
   191: `match(/\S+/g)`) bekräftad — samma tal, metoden dokumenterad i sonden.

## Kärnan GRÖN (allt egenmätt mot vintagen)

- **Källfält 27/27 exakta** mot IBE.MC-posten (pris 19,625 · mcap 130,96 · P/E 24,842 ·
  P/B 2,536 · EV/EBIT 18,085 · PEG 3,02 · FCF-yield 1,96 % · ROE 10,02 % · ROIC 9,53 %
  · brutto 53,89 % · EBIT 24,47 % · netto 15,88 % · FCF-marginal 5,76 % · skuld/EK
  1,0003 · CAGR −5,49/+13,15 · TTM +9,8 · prognos 7,05 · serier 53 949→45 547 /
  4 339→6 285 M€ med fyra årtal 2022–2025 · räntetäckning null · återköp null ·
  noteringens förbehåll ärligt speglade · EUR/Spanien · MarketStack-dubbelkoll saknas
  = källradens egen uppgift).
- **Medianer 11/11 exakta med exakta n**: energi n=13 (P/E n=12: 16,5 · P/B 2,27 ·
  ROE 12,3 · EBIT 18,0 · netto 9,1 · skuld/EK 0,56) och universum n=129–138 (21,2 ·
  3,09 · 16,2 · 21,2 · 14,9) — omräknade ur vintagens 138-post-fil.
- **Rang**: P/E 24,842 grenens HÖGSTA av 12 ifyllda ✓; netto 15,88 näst högst efter
  RWE ✓; spann-bolagen (Vår Energi 3,08 · Enel 1,48 · CVX 0,19 · XOM 0,159) ✓;
  Vår Energi-sorteringsmotiveringen fullt belagd (P/B 57,9 mot P/E 10,2 = 6,1× ·
  PEG + räntetäckning null · prognos −34,1 %) ✓.
- **Aritmetik 48 poster egenräknade** (D1–D43 + F2-a→e): identitet båda vägrar
  (2,536 ÷ 0,1002 = 25,31, gap 1,88 % → 1,9; omvänd 2,489 → 2,49), VPA 0,79,
  absolutkontroll 156,13 mdr med residual 16,12 % på P/E-nämnaren, årsresultats-PE
  20,84, PEG-replikering 2,96 / 3,52 / 8,23, EV-kedjan fem steg (51,64 · 51,66 ·
  103,30 · 11 145 · 9,27 mot fältets 18,1, kvot 1,95, implicerat EV 202 mdr, residual
  98 mdr), FCF-kontrollen HÅLLER (5,76 % × 45 547 = 2 623 ÷ 130 960 = 2,00 % mot
  1,96), båda CAGR med alla årliga steg, härledd nettomarginalserie 8,0/9,7/12,5/13,8,
  samtliga premier, scenariorutan **9/9 celler**, räknesatser 455/334, Essity-vikt
  1,362, resultatserien monotont stigande.
- **JURIDIK 2007:528 REN**: kontrolleraText-spegel (26 mönster ur data/varumarke.json)
  × 3 ytor = 0 träff; exakt EN lagrumsfamilj (2007:528 2 kap 5 §) — ingen
  lagrumsblandning; "rekommendation" endast i negerade konstruktioner ("inte en
  rekommendation att köpa, sälja eller behålla", "Inga köp-, sälj- eller
  hållningsrekommendationer"); utbildningsramen explicit; disclaimer + R2-rad exakt
  sist i bodyn.
- **911 = 0** (sex mönster × alla ytor; nionde serien i släktets räkning).
- **Länkar 20/20 interna HTTP 200** mot localhost (deploylåset fridlyst — ren
  läskontroll); extern iberdrola.com 403 = bot-skydd, redovisat i textens egen källrad.
- **Kalender 10/10** mot kalender-energi.json + disk: rappdag 21/10 09:30 spansk tid
  med nio-månaders-not, presentation 09:30–11:00, Vår Energi 07:00 samma morgon +
  trading update 12/10, CMD 24/9, kvartalsschema, samtliga 13 nämnda paket på disk.
- **Struktur**: 7 H2 (familjestil) · title 245 ≤ 314 · description 656 (seriepraxis
  204–660) · tags 6 · inga dubbla mellanslag.

## FYND (kurerade i paketet — 18 byten, alla maskinellt tillämpade)

- **B1 (VÄSENTLIGAST — rappfönstret passerat av utvecklingen):** texten "13 läspaket
  över fyra dagar (20–23 oktober) — ABB och Tele2 den 20:e, SKF, Handelsbanken och
  Iberdrola den 21:a …" är byggdagens (2026-09-16) läge. Telia-paketet (rappdag 21/10
  enligt Telias officiella kalender, granskad av förra omgångens s1-u1) byggdes
  2026-09-29 och gör fönstret **14 = 2+4+5+3** — telia-granskningens C4-kur
  fastställde exakt det talet ("14 … fem … Volvo Car, Volvo Group och Saab"). Vid
  publiceringstillfället (publishedAt 2026-10-19) är 13 fel. Kur B1a+B1b: "14
  läspaket" + "SKF, Handelsbanken, Iberdrola och Telia den 21:a".
- **B2 (Fabege F2-klassen — fem räknesatser där textens SYNLIGA tal inte bär
  textens resultat; 13 byten a→l):** texten redovisar fältvärdena avrundade (P/E 24,8 ·
  P/B 2,54 · FCF-marginal 5,8 · mcap 131,0) men låter resultaten följa fältens fulla
  precision (24,842 · 2,536 · 5,76 · 130,96). Exempel: "5,8 procent × 45 547 ger
  2 623" — synliga tal ger 2 642; "24,8 ÷ 3,02 = 8,23" — synliga ger 8,21; EV-steg
  1–2 "131,0 ÷ 2,54 = 51,6 … skuld 51,7" — synliga ger 51,6. Kur enligt Fabege F2:
  redovisa fältets fulla precision I räknesatsen (nyckeltalssektionens 1-decimalvisning
  orörd — kurerna sitter enbart i källkritikavsnittet, övning C och källraden).
- **C1:** stavfelet "handssignal" → "handelssignal" (wihlborgs-B3:s exakta felklass —
  andra paketet i serien med samma stavfelsgen).
- **C2:** readingMinutes 5 → 6 (3 353 ord efter kurer ÷ 600 = 5,59 → 6; fabege
  F6-precedensen; byggarens 3 067 var en alfanum-tokenräkning, konventionen räknar
  \S+-token).
- **C3:** P/B-premien "(11 procent)" → 12 (2,536 ÷ 2,27 = 11,72 % — trunkeringen
  lämnar fel siffra).
- **C4:** "energigrenens spann är universumets bredaste på detta mått" håller inte i
  vintagen på något av två mått (absolut bredd: industri 7,88 mot energi 2,92; kvot:
  282× mot 19× — nollskuldsbolag spränger kvotmåttet) → "ett av universumets
  bredaste".

## Efterverifiering av paketet (44/44 PASS)

`verktyg/_s1u1-iberdrola-paket.mjs`: alla 18 from-strängar EXAKT-EN-TRÄFF-assertade ·
gamla strängar 0 · nya exakt 1× · kontrolleraText 0/0 · 911 = 0 · exakt en
lagrumsfamilj · disclaimer sist · nya räknesatser omräknade (25,31 · 2,49 · 156,1 ·
8,23 · 23,21 · 2 623 · 51,6/51,7) · ord 3 353 → rm 6 · **utkast-JSON:n orörd**
(md5-oförändrad skrivkontroll).

## KVD

- Endast NYA filer: denna KONTROLL + diff + FLYTTKLART-PAKET (granskning/) + sond +
  paket-skript + unikhetsprov + anspråk + KO-rader + worklog-rad. src/ orörd = inget
  bygge, tsc-grinden opåverkad. R2 orörd: data/blogg/ ENDAST LÄST, paketet bär
  "publicering = kundens beslut". Utkastet (byggarens fil) orört — granskaren skriver
  aldrig andras filer. Syskonens presumtiva ytor (var-energi/att) orörda. Commit med
  explicit pathspec.

Kö efter denna: var-energi/att (10-21-klustrets kontrolllösa rest, syskonen) →
norsk-hydro/pg/sca/seb (22:a) → novemberfältet.
