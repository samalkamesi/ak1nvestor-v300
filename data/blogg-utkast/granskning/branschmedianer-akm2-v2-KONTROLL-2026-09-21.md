# KONTROLL 2026-09-21 — branschmedianer-akm2 v2 → FLYTTKLART PAKET (m9-familjen, pass 4)

**Granskare:** agentfabrik auto-s1-1789952123920 **s1-u2** (spår 1 — granskningskön).
**Sond:** `verktyg/_s1u2-branschmedianer-paket.mjs` (ny, read-only utom paketfilen) —
**26 kontroller · 26 PASS · 0 FEL** (efter en ärligt bokförd sondbugg i förstakörningen:
append-strippemetoden gav 2807 tkn mot E7-kontraktets 2808 — rättad till gårdagens
exakta metod [start→Status-raden, original-disclaimer behållen, en trailing newline],
omkört, grönt förtjänt).

**Objekt:** m9-utkast **#2 branschmedianer-akm2 (v2)** — titeln är denna gång INTE
malltext: worklog 09-16 dokumenterar seriens numrering (#1 boerspsykologi · #2
branschmedianer · #3 forskningslaget · #4 kassaflödesanalys · #5 utdelningar ·
#6 vagkartan) och rondens bokning våg 190 lyder EXAKT "m9-utkast #1–2 → flyttklart
paket". #1 fick sitt paket 09-20 19:57 (s1u1); detta pass levererar #2:s.

## Aktualitetsbevis (pass 4:s grund)

Gårdagens sond `verktyg/_s1u2-branschmedianer-v2-kontroll.mjs` (dokumenterad
omkörbar, read-only) kördes OM 2026-09-21 ~01:1x: **50 PASS · 0 FEL av 50** —
käll-md5 fortfarande exakta (korstabell-grund `33fe62a0…` · vagvalidering-SENASTE
`b7194627…` · varumarke `9b906e42…`), kandidat-md5 `0431dd6c…` reproducerad,
bodyMd5 `28651b04…` oförändrad, juridik/911 gröna, 3/3 länkar HTTP 200 mot
levande sajten (loopback). Källorna har alltså inte rört sig sedan 09-20 —
gröna domen står kvar och paketet bygger på bevist underlag.

## Paketet

`granskning/branschmedianer-akm2-v2-FLYTTKLART-PAKET-2026-09-21.json` (3 401 tkn)
— första exportpaketet för serien. Transformation enligt syskonstandarden
(boerspsykologi 09-20 · utdelningar 09-20):

| Fält | Värde | Källa/beslut |
|---|---|---|
| slug | `branschmedianer-akm2` | kö-raden |
| title | Branschmedianer september 2026 — varje branschs AKM2-profil | titel minus " (utkast)" |
| description | 194 tkn == kö-ingressen **ordagrant** | == publik utgåvas description (C2: identiska) = minsta nya granskningsytan |
| pillar | Institutionell metodik | våg 95-paketstandard (seriekonsekvens med de två föregående paketen) |
| author | AK1A Research Lab | våg 95-paketstandard |
| publishedAt | `null` | kundens klick (R2) |
| readingMinutes | 2 | round(405 ord / 200) — s1u1:s formel |
| tags | AKM2 · branschjämförelse · median · peer · portföljforskning | publikens 5 (seriekonsekventa) |
| body | 2 808 tkn · 4 "##"-rubriker · disclaimer SIST | kvitto strippat enl. E7-kontraktet; renBodyMd5 `888eb2c4…` == 09-20-granskningens ren body (identiskt exportunderlag) |

## Resultat per kontrollfamilj (sond 26/26)

**A. Underlag + aktualitet (7/7):** kö-raden v2/utkast bekräftad · bodyMd5
`28651b04…` oförändrad · 3/3 käll-md5 == kvitto · kandidatMd5 `0431dd6c…`.

**B. Kvitto-stripp (4/4):** markören på tkn 2 630 · ren body EXAKT 2 808 tkn ·
renBodyMd5 `888eb2c4…` reproducerad · bodyns EGEN disclaimer == standarddisclaimern.

**C. Metadata (4/4):** title-konvention hel utan "(utkast)" · description ==
publikens == ingressen (194 tkn) · readingMinutes 2 · tags == publikens.

**D. Juridik 2007:528 (6/6):** kontrolleraText-spegel (exakt algoritm ur
varumarke.ts: samma 26 fraser ur data/varumarke.json, flaggor "giu",
stateful-reset per fras, negerings-lookbehinden i "investeringsråd"-regexen
inbyggd) på title+description+body → **FEL 0 · VARNINGAR 0** · rådglossor
(köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad
avkastning) 0 träffar · "investeringsråd" exakt 1 gång = negerad disclaimern ·
endast lagrum 2007:528 (2022:260/261 · 1985:716 · 2005:59 · 2022:482 = 0 —
ingen blandning) · disclaimer sista raden.

**E. 911-referenser (1/1):** sex mönster (911 · 11 september · september 2001 ·
9/11 · terror · terrordåd) på HELA paket-JSON:n → **0 träffar** (femte
sammanhängande dagen för serien).

**F. Struktur + länkar (5/5):** 4 rubriker · body 2 808 ≥ 800 · kvitto-rester 0
(Granskningsunderlag/kandidatMd5/mall-md5/Determinism/Dataurdrag/seed…) · 3
"Fördjupa dig"-länkar bevarade (/forskningsbiblioteket · /kurser/v07-bruttomarginal ·
/kurser/v09-roe) · kurs-SEO-filerna statiskt närvarande; HTTP 200 mot levande
sajten bevisad i samma pass av omkörningen (se aktualitetsbeviset).

**G. Juridikgrind-vakten (mekanisk oberoende dom):** `node verktyg/juridikgrind-vakt.mjs
--json` → **m9-ko/branschmedianer-akm2-v2.json: flyttklar TRUE · grund TRUE ·
fynd 0** · vakten exit 0. (Paket-json:er i gransknings/ är inte vaktens skannyta —
paketets juridikbevis är D-familjens spegel på exakt samma underlag. Totalvyns
äldre notiser i larmfilen berör andra objekt, kända sedan 09-15.)

## Fynd — inga nya innehållsfynd; tre paketspecifika notiser

- **N1 (notis, divergens mot publicerad utgåva — kunddialog):** paketet byter
  metadata-konvention mot publikfilen (09-03): pillar "AKM1"→"Institutionell
  metodik" · author "Ak1 Apex Nexus"→"AK1A Research Lab" · readingMinutes 4→2 ·
  publishedAt→null. Pillar/author följer våg 95-paketstandarden som de två
  föregående m9-paketen; readingMinutes är omräknad (405 ord/200). Syns som
  metadataändring vid nästa publicering — medvetet, seriekonsekvent.
- **N2 (notis, ärvd D1):** den publicerade bodyn bär "Prologis," och "Warner
  Bros. Discovery," med kvarlämnat komma; paketet bär de rena namnen (våg-95-
  kommafixen) — kosmetisk skillnad blir synlig vid nästa publicering. Ägs av
  09-20-diffens D1; ingen åtgärd här.
- **N3 (notis, evergreen-hopp):** kandidaten är byte-identisk med kö-raden v2
  (09-14) — om kö-underhållets `--skriv` hoppar serien av evergreen-regeln
  landar inte innehållet i Supabase-kön; paketet här är disk-spegeln av samma
  innehåll och täcker exporten oavsett (09-20-diffens "anvandning"-not står
  kvar som sanning).

C1/C2 (frivilliga mallägarförslag "— oförändrat"-strykningen + "såväl industri-
som finansgruppens") och D2 (nyckelordningskänsligheten) ägs av gårdagens
diff-fil och tillämpas EJ i paketet — granskaren skriver inte om andras ytor,
och en malländring ändrar mall-md5 (kräver omgranskning av nästa kandidat).

## Dom

**GRÖN — FLYTTKLART PAKET levererat.** Källor, siffror, juridik (2007:528),
911-referenser och länkar alla gröna på dagens underlag; exportpaketet följer
serie_standarden och bär publiceringsformen (publishedAt null). Publicering
förblir kundens klick (R2). Våg 190:s bokning ("m9-utkast #1–2 → flyttklart
paket") är därmed **uppfylld 2/2**.

## Kö-notis (m9-familjen efter detta pass)

Flyttklara paket: boerspsykologi (#1) · **branschmedianer (#2 — detta pass)** ·
utdelningar (#5). Kvar utan exportpaket: forskningslaget (#3 — KONTROLL 09-16 +
korskonfirmation, grön) · kassaflödesanalys (#4 — v2-KONTROLL 09-20, grön) ·
vagkartan (#6 — KONTROLL 09-16, grön). Nästa granskarpass i spåret väljer där
(#3 är u3:s naturliga titelobjekt i denna omgång — respekteras).

## KVD

Endast nya filer (paket-json + denna KONTROLL + sond + anspråksfil + worklog):
**src/ orörd = INGET bygge** (tsc-baslinjen vilar i pre-commit-grinden) · R2
orörd (priser/tier/publicering; data/blogg/ ENDAST LÄST) · Supabase-kön orörd
(TORR-läge, --skriv ägs av kö-underhållet) · utkastfilen i m9-ko/ orörd ·
syskonens ytor orörda · commit med pathspec + -F-fil.
