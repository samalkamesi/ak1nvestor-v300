# KONTROLL 2026-09-21 — vagkartan-traffprocent (m9-6) FEMTE PASSET: aktualitet + FLYTTKLART PAKET

**Granskat objekt:** `data/blogg-utkast/m9-ko/vagkartan-traffprocent-v1.json` (v1, status utkast — det som ligger i kön) · manifest auto-s1-1789980325227 s1-u2 (granskare 2/3) · anspråk `data/vakten/auto-s1-1789980325227-s1-u2-ansprak.md` (disk-först, 0 syskonanspråk på objektet vid valet).

**Relation till tidigare pass:** 09-14 huvudgranskning (FLYTTKLAR 0 rättningar) · 09-16 kontrollgranskning (65 kontroller, byte-identisk rekonstruktion) · 09-16 maskinell diff (tom med avsikt). **Detta pass fyller seriens lucka: aktualitetsbevis på dagens träd + seriens femte EXPORTPAKET** (efter boerspsykologi 09-20, utdelningar 09-20, branschmedianer 09-21, kassaflödesanalys 09-21) — m9-familjen 6/6 när #5 forskningslaget paketeras (u3:s naturliga nästa).

**Val-motivering (pivot, femte fallet för mallen):** titelns "m9-utkast #2" är täckt i BÅDA numreringarna — m9-2 utdelningar-101 (sammanställningstabellen; FLYTTKLART-PAKET 449d4dfa 09-20) och "#2" branschmedianer (worklog-09-16-numreringen; FLYTTKLART-PAKET 12801b88 09-21 av föregående s1u2-instans). FIFO bland kvarvarande paketluckor: forskningslaget (äldst) lämnades fritt åt syskon; detta pass = vagkartan (m9-6).

**Off-gräns (R2):** publicering = kundens klick; inget har flyttats till `data/blogg/`; `publishedAt = null` medvetet i paketet; utkastfilen orörd.

## BEDÖMNING: GRÖN — FLYTTKLART PAKET LEVERERAT · 63 kontroller, 0 FEL

Sond `verktyg/_s1u2-vagkartan-paket.mjs` (omkörbar; **63 OK · 0 FEL · exit 0** efter tre ärligt bokförda och rättade sondbuggar, se § 8). Paketfil: `granskning/vagkartan-traffprocent-FLYTTKLART-PAKET-2026-09-21.json` (2 699 tkn).

## 1. Källor & aktualitet (dagens träd 2026-09-21)

| Källa | Md5 i kvitto | Md5 i dagens träd | Dom |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | ✓ oförändrad |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | ✓ oförändrad (talbärande källa) |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | ✓ oförändrad |

**Determinismkedjan hel även 2026-09-21:** kandidatMd5 `2cf06db0…` == kvittot == 09-16:s byte-identiska rekonstruktion · mall-md5 `e5ada75e…` (body-kvittot) · **seed `904e0fcc…` ÅTERLEDD ur DAGENS källor** (fabrikens dokumenterade formel verktyg/m9-fabrik.mjs:1338 — md5 av käll-md5:arna + månadsnyckel `2026-09|2026-09`) · hel body 3 904 tkn (== 09-16) · bodyMd5 `baa1beda…` låst som referens · **utkastet git-bevisat orört sedan kö-dumpen 584ffcf8** (`git diff HEAD` tom). Evergreen-regeln utlöses ej — källorna orörda sedan 09-03/04.

## 2. Siffror — oberoende omräkning ur källans rådomlista

Tre vägar per tal (källtabell · Totalt-rad · rådommar), allt egenmätt i sonden:

- **Rådomlistan parsad:** 12 tickerrader × 5 horisonter = 60 mätningar → **48 dömda + 12 osatta** ✓ (osatta 12/60 = **20 %**) · **25 träff + 23 miss = 48 → 25/48 = 52 %** ✓
- **Åtta celler exakta mot rådommarna:** mikro impulsvåg 3/4 = 75 % (n=4) · mikro basbygge 5/8 = 63 % (n=8) · kort impulsvåg 2/2 = 100 % (n=2) · kort basbygge 3/10 = 30 % (n=10) · medellång 6/6 = 100 % och 0/6 = 0 % · mega 6/6 = 100 % och 0/6 = 0 % ✓✓✓✓✓✓✓✓
- **lång: 12 × osatt = inga dömda** ✓ (utkastets förenkling av källans fyra tomma celler — korrekt)
- **Kedjekontroller:** cellsumma träffar 25 == totalträffen · cellsumma n 48 == dömda ✓
- **Tabell-paritet:** källtabellens 5 horisontrader ordagrant i utkastets lista (värde för värde) · Totalt-raden 52 %/48/20 % ✓
- **Protokollcitatet ordagrant:** utkastets Dom-protokoll-v1-stycke == källans protokollrad **tecken för tecken (414 == 414 tkn)** ✓
- **Kvittots 7 urdrag:** samtliga daterade 2026-09-04 och värdebärande mot källa/body ✓
- **"Oförändrad sedan senaste publicerade utgåvan" SANT:** publikfilens `fabrik.statistik` {52 %, 48, 20 %, 12} + `perHorisont` 5/5 horisonter värde för värde == utkastets tal ✓
- Inga median- eller värderingspåståenden — serien är ren träffstatistik med n överallt.

## 3. Juridik — lagen (2007:528): REN, mekaniskt bevisad

- **kontrolleraText-spegel** (exakt algoritm ur `src/lib/varumarke.ts:141` — `RegExp(fran,'giu')`, stateful-reset, FEL/VARNING per allvar; **26 fraser** ur data/varumarke.json): **0 FEL · 0 VARNING på BÅDE paket-ytan (title+description+body) och HELA utkast-ytan (inkl kvitto)** ✓
- Rådgivningsglossor (köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning): **0 träffar** ✓
- "investeringsråd" exakt **1** förekomst = negerad disclaimer sist ✓
- **Lagrum-renhet:** endast 2007:528; 0 träffar på 2022:260/2022:261/1985:716/2005:59/2022:482 ✓
- **Tickerläckor 0/12** (samtliga domlistans tickers testade mot paket-ytan) ✓
- Osäkerhetsmarkering genomgående: "ett öppet kvitto om det förflutna — aldrig en garanti om framtiden" i ingress, body och "Vad siffran är — och inte är"-sektionen ✓
- **Mekanisk oberoende dom:** `verktyg/juridikgrind-vakt.mjs --json` 2026-09-21: `vagkartan-traffprocent` **finns i flyttklara** (även KONTROLL-2026-09-16-raderna) · **0 fynd på objektet · 0 fynd i hela m9-ko-katalogen**. (Trädets totalstatus GUL/32 VARNING bor utanför vårt objekt — kontext, ej denna leverans.)

## 4. 911-referenser: REN (0/6)

Sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") mot HELA paket-JSON:en → **0 träffar** (sjätte m9-serien grön på metoden; "911" i uppdragstitlar = trunkerat UUID ur index.json, dokumenterat sedan boerspsykologi-passet).

## 5. Länkar — mot levande sajten (2026-09-21 10:53, FRIKT deploylås)

| Länk | Dom |
|---|---|
| `/kurser/ts-10-ak1ts-25cellers-matris` | 200 |
| `/blogg/vagfundament-indikatorer-ar-tidsserier` | 200 |
| `/forskningsbiblioteket` | 200 |

Statisk närvaro dessutom verifierad på disk (kurs-SEO-JSON + blogg-JSON; forskningsbiblioteket = app-route).

## 6. FLYTTKLART PAKET (seriens femte exportpaket)

`granskning/vagkartan-traffprocent-FLYTTKLART-PAKET-2026-09-21.json` — byggd programmatiskt av sonden med tre grindar (kontrolleraText 0/0 · disclaimer sist · struktur):

- **Kvitto-stripp** enligt E7-kontraktet (start→Status-raden, bodyns EGEN disclaimer behållen): hel body 3 904 → **ren body 2 121 tkn** · renBodyMd5 `e4256133…` · 0 kvitto-rester på 8 strukturella markörer · 5 "##"-rubriker · 3 "Fördjupa dig"-länkar bevarade.
- **Metadata:** title utan "(utkast)" (46 tkn) · **description == publikens == kö-ingressen ordagrant** (186 tkn — minsta nya ytan) · pillar "Institutionell metodik" + author "AK1A Research Lab" (våg 95-paketstandarden) · **publishedAt = null** (kundens klick = R2) · tags = publikens 5 · readingMinutes = round(300/200) = **2**.

**Divergens-not mot publikfilen (09-04) — rapport-only, inga fel:** author "Ak1 Apex Nexus" → "AK1A Research Lab" · readingMinutes 4 → 2 (round(ord/200); publikens 4 gäller ett bodyinnehåll som dessutom bär en extra generisk rad) · publishedAt 2026-09-04 → null · publikens body bär extra raden "Detta är en automatiskt genererad forskningsöversikt…" + kortare disclaimerrad — paketet följer utkastets mall-v2-form (fullständig negerad disclaimer sist). Dessa skillnader blir synliga som kosmetisk diff vid kundens nästa publicering av serien — konventionsbeslutet (author/rm) ägs av serieägaren.

## 7. Struktur

5 "##"-rubriker i ren body (krav ≥ 2) ✓ · 2 121 tkn (krav ≥ 800) ✓ · 300 ord ✓ · disclaimer sista rad ✓ · disposition totalrad → protokoll → lista → vad siffran är/inte är → förändring → fördjupning → disclaimer ✓ · ingress talbärande men tickerfri ✓.

## 8. Sondens egna buggar — ärligt bokförda, rättade, omkörda

1. **Sondfix 1:** tabell-regexen bar `\|\$` — escapead dollar är ett literal "$"-tecken i JS-regex ⇒ 0 träffar. Rättad till radslut-`$`.
2. **Sondfix 2:** C6 jämförde mot en hårdkodad avskrift (whitespace-känslig) — ersatt med det starkare testet: utkastets protokollstycke mot KÄLLANS protokollrad tecken för tecken (414==414).
3. **Sondfix 3:** kolumn-miss i C3-destruktureringen (grupp 4 = osatt-kolumnen togs i stället för grupp 3 = basbygge) — rättad.

Ingen av de tre rörde utkastets innehåll; samtliga toleransklassen "verktygsfel före dom" (presedens: livsmedelsaktier-passet).

## 9. Fyndlista + notiser

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya innehållsfynd** — utkastet identiskt med det 09-14/09-16 grönvitsade: varje tal trevägsverifierat även detta pass. | Ingen |
| N1 | NOTIS (serieägaren) | readingMinutes 2 (round(300/200)) mot publikens 4 — konventionsbeslut vid publicering. | Serieägaren |
| N2 | NOTIS | Publikens body bär mall-09-04-form (extra generisk rad + kortare disclaimer); paketet bär mall-v2-form — kosmetisk diff synlig vid nästa publicering. | Synlig vid export |
| N3 | NOTIS | Uppgiftstitelns "#2" var auto-platshållare (femte fallet) — fabrikskursen om status=klar-manifest om-dispatchas sent kvarstår (även u3 dokumenterat). | Fabriksägaren |

## 10. Diff-rapport

`granskning/vagkartan-traffprocent-diff-2026-09-21-s1u2.json` — **0 poster, TOM MED AVSIKT** (determinismkvittot: varje manuell strängändring i utkast-JSON:en bryter kandidatMd5-kedjan; innehållsändringar går via m9-fabrikens regenerering). Paketet är exportunderlaget.

## Slutsats

**GRÖN — FLYTTKLART PAKET LEVERERAT.** Källor 3/3 md5-exakta på dagens träd, determinismkedjan hel (seed återledd ur dagens källor → kandidatMd5 == 09-16:s byte-identiska rekonstruktion, filen git-orörd sedan 584ffcf8), 63/63 maskinella kontroller gröna (rådom-omräkning 25/48 = 52 %, 12/60 = 20 %, 8 celler + kedjesummor + 414-tkns protokollcitat ordagrant), juridik mekaniskt ren på två oberoende vägar (kontrolleraText-spegel 0/0 på båda ytorna + juridikgrind-vakt flyttklar/0 fynd), 911 = 0/6, länkar 3/3 = 200 med fritt deploylås. **Publicering = kundens beslut (R2).** Kö efter detta: m9-5 forskningslaget = sista paketluckan (u3:s naturliga) — därefter är m9-familjen 6/6 exportkapabel.
