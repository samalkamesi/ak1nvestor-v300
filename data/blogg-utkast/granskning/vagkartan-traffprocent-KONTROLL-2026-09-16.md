# KONTROLL-GRANSKNING 2026-09-16 — Vågkartan september 2026: träffprocenten 52 % (m9-utkast #6)

**Objekt:** `data/blogg-utkast/m9-ko/vagkartan-traffprocent-v1.json` (m9-fabriken, version 1, status utkast — seriens SISTA objekt utan 09-16-paket; med denna kontroll är HELA m9-serien 6/6 komplett)
**Granskad av:** fabrik auto-s1-u3 (agentfabrik auto-s1-1789560918402, 3/3), 2026-09-16 — anspråksfil `data/vakten/auto-s1-1789560918402-u3-ansprak.md` (klaim-protokollet, med PIVOT-notis)
**Bedömning: FLYTTKLAR — 0 rättningar, 0 nya fynd.** Tillsammans med
`vagkartan-traffprocent.md` (2026-09-14, annan agent — huvudgranskning, FLYTTKLAR
0 rättningar) är paketet komplett: huvudgranskning + kontrollgranskning enligt
09-15-standarden + maskinell diff-rapport (`vagkartan-traffprocent-diff.json`,
denna våg).

**PIVOT-notis (köprotokollet):** uppdragsobjektet m9 #3 forskningslaget togs kl
14:29 av syskon s1-u2 (deras val skedde före mitt anspråk 14:20 landade — deras
leverans är komplett: 47/47 kontroller, samma kandidatMd5-bevis). Mitt färdiga
#3-arbete (42/42 gröna i `.zcode/granskning-m9-forskningslaget.mjs`, oberoende
av u2:s sond) bokförs här som KORSKONFIRMATION — två oberoende verktyg, samma
dom: källor 3/3 md5-exakta, samtliga tal gröna, kandidatMd5 `60d18ca6…` +
mallMd5 `f095edf7…` + seed `904e0fcc…` reproducerade, v151:s F1+F2 = filens
enda avvikelse från fabrikskandidaten, juridik/911/länkar gröna. **Ett nytt
fynd u2:s rapport saknar — FABRIKSFLAGGA: F1+F2-mall-fixen är EJ backporterad
till `verktyg/m9-fabrik.mjs`** (dagens committade fabrik genererar fortfarande
"De tre högt rankade gröna bolagen"-texten; kassaflode-seriens motsvarande fix
committades in i mallen — bevisat av mitt F1-läge-spår: dagens fabrik
reproducerar kvittets PRE-fix-kandidatMd5). Nästa regenerering av forskningslaget
återföder den juridiska riskbild 09-14 graderade HÖG. → fabriksägaren.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen. Utkast-JSON:en orörd (nya filer endast).

---

## 1. Källor — md5 mot aktuellt träd (2026-09-16)

| Källa | Md5 i kvitto | Md5 i trädet | Dom |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | ✓ oförändrad (bär seed/månadsnyckel, inga kroppstal) |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | ✓ oförändrad (seriens talbärande källa) |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | ✓ oförändrad |

## 2. Siffror — tabell + OBEROENDE rådomsomräkning

**Skript `.zcode/granskning-m9-vagkartan.mjs` (skrivet + kört 2026-09-16 av
denna granskning): 65 OK, 0 FEL.** Tre oberoende vägar: tabellceller,
Totalt-raden och — starkare än 09-14:s manuell räkning — maskinell
omräkning ur rapportens rådomlista "Dagens domar" (12 tickerrader):

| Påstående i utkastet | Tabell | Rådomarna | Dom |
|---|---|---|---|
| träff 52 % (n=48 dömda, osatta 20 %) | 52 % (n=48, 20 %) | **25✓ + 23✗ = 48 → 25/48 = 52 % · 12 osatta/60 = 20 %** | ✓ |
| 12 tickers · 5 horisonter · sedan 2026-09-04 | 12 · 5 · 09-04 | 12 tickerrader × 5 segment = 60 | ✓ |
| mikro: impulsvåg 75 % (n=4) · basbygge 63 % (n=8) | 75 % (n=4) / 63 % (n=8) | 3/4 · 5/8 | ✓ |
| kort: impulsvåg 100 % (n=2) · basbygge 30 % (n=10) | 100 % / 30 % | 2/2 · 3/10 | ✓ |
| medellång: impulsvåg 100 % (n=6) · basbygge 0 % (n=6) | 100 % / 0 % | 6/6 · 0/6 | ✓ |
| lång: inga dömda mätningar | alla celler — (n=0) | 12× osatt (döms aldrig) | ✓ |
| mega: impulsvåg 100 % (n=6) · basbygge 0 % (n=6) | 100 % / 0 % | 6/6 · 0/6 | ✓ |

Kedjekontroller: cellsumman 3+5+2+3+6+0+6+0 = 25 = totalträffen ✓ ·
n-summan 4+8+2+10+6+6+6+6 = 48 = dömda ✓ · protokollcitatet "vagvalidering/1
v1" + dom-protokollets text ordagrant ur rapporten ✓ · samtliga 7 kvitto-urdrag
värde för värde mot bodyn ✓. Inga median- eller värderingspåståanden (serien är
ren träffstatistik).

**"Träffprocenten oförändrad sedan den publicerade utgåvan":** sant — den
publicerade utgåvan (`data/blogg/vagkartan-traffprocent.json`, publishedAt
2026-09-04) bär `fabrik.statistik` {52 %, 48} — identiskt.

## 3. Juridik — lagen (2007:528): REN, mekaniskt bevisad

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-16 (denna granskning), filtrerat
  på filen: **flyttklar: true · grund: true · fynd: 0** — rådsförbud, grund och
  tvärfall alla gröna. (Även 09-14-rapporten i granskningskatalogen: 0 fynd.)
- Egen verb-sond (titel+ingress+body mot rekommendera/köp/sälj/bör du/ni bör/
  undvik denna/bra affär/handelssignal/tidsrekommendation med negeringsvakt):
  **0 träffar.**
- **Inga tickers i utkastet:** samtliga 12 tickers ur domlistan (VOLV-B.ST,
  SAAB-B.ST, ATCO-A.ST, SAND.ST, SWED-A.ST, ESSITY-B.ST, ERIC-B.ST …) testade
  mot titel+ingress+body — 0 läckor. Vågklasserna presenteras som
  mätningsklasser, aldrig lägeskarta.
- Osäkerhetsmarkeringen genomgående: "ett öppet kvitto om det förflutna — aldrig
  en garanti om framtiden" i både ingress och body, varje procent med n.
- Endast lagrummet 2007:528 nämns (sond mot 2022:260/2022:261/1985:716/2005:59
  = 0) — ingen lagrumsblandning. Disclaimern är bodyns sista rad.

## 4. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA utkastfilen (body + metadata, JSON som sträng) efter sex
mönster: "911", "11 september", "september 2001", "9/11", "terror",
"Terrordåd" → **0 träffar**. Inget att åtgärda. (Kontrollen saknades i
09-14-rapporten — därmed är metodpunkten dokumenterad för samtliga sex
m9-serierna.)

## 5. Länkar + publicerade utgåvan — mot levande sajten (2026-09-16)

| Länk | Dom |
|---|---|
| `/kurser/ts-10-ak1ts-25cellers-matris` | 200 |
| `/blogg/vagfundament-indikatorer-ar-tidsserier` | 200 |
| `/forskningsbiblioteket` | 200 |

09-14 verifierade mot källkodsnärvaro; denna våg verifierar mot
`localhost:3000` (loopback) — länkarna lever på dagens build.

## 6. Determinism — FULL rekonstruktion (2026-09-16)

`.zcode/granskning-m9-vagkartan.mjs` speglar m9-fabrikens vagkartan-gren
(`lasVagvalidering` + `byggVagkartan` + `montera`/`kandidatMd5` +
kontrolleraText/grind-spegeln) och bygger kandidaten från grunden ur källfilerna:

- **Body rekonstruerad BYTE-IDENTISK — 3 904 tecken.** Utkastet är **oekat
  sedan generering** (2026-09-11) — 09-14:s "0 rättningar"-läge bekräftat.
- **kandidatMd5 `2cf06db0…` reproduceras exakt** · **mallMd5 `e5ada75e…`
  reproduceras exakt** · titel, ingress, urdrag (7 rader, semantiskt),
  käll-array, statistik: samtliga reproducerade.
- **Seed `904e0fcc…` ÅTERLEDD ur trädets källor** — md5 av de tre käll-md5:arna
  + månadsnyckel "2026-09|2026-09". Determinismkedjan hel ända ner till
  rådata: källor → seed → body → kandidatMd5.
- Kontroll-blocket i JSON:en (rubriker 6 · strukturFel 0 · kontrolleraText 0/0 ·
  disclaimer sist) bekräftat på MEKANISK grind (till skillnad från 09-14:s
  verktyg, som antog varningarna 0): mallen 5 rubriker/0/0, helkroppen
  6/0/0 — kvitto-raden "VARNINGAR 0" är alltså sann, inte antagen.

**Konsekvens för diff-rapporten:** poster-listan är TOM MED AVSIKT — varje
manuell ändring av utkast-JSON:en skulle bryta determinismkvittot. Rättningar på
m9-seriens innehåll går via `verktyg/m9-fabrik.mjs` (regenerering med nytt
kvitto) eller exportvägen (som stryker "(utkast)" i titeln och
kvittoavsnittet i bodyn).

## 7. Struktur

6 "##"-rubriker i hel body (krav ≥ 2) ✓ · body 3 904 tecken (krav ≥ 800) ✓ ·
disclaimer sista rad ✓ · disposition totalrad → protokoll → tabell → vad
siffran är/inte är → förändring → fördjupning → kvitto → disclaimer ✓ ·
ingress talbärande men tickerfri ✓.

## 8. Fyndlista + flaggor (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | 0 nya fynd i utkastet. 09-14:s F1–F3 (LÅGA) består: "(utkast)"-suffix + kvitto = exportvägens tvätt; urdragens nyckelordning i DB-raden; versionsjämförelsen läser publicerad statistik (design, ej datakälla). | Ingen |
| F4 | FLAGGA (fabriksägaren) | **Forskningslagets mall-fix ej backporterad** (korskonfirmationsfynd från #3, se PIVOT-notisen): `byggForskningslaget` genererar fortfarande pre-F1-texten. | Backportera F1+F2 till fabriken före nästa regenerering |
| F5 | FLAGGA (sammanställningsägaren) | `GRANSKNINGSKO-SAMMANSTALLNING.md` saknar fortfarande hela m9-serien — nu är samtliga sex komplett granskade (09-14 huvudgranskning + 09-16 kontroll): #1 boerspsykologi · #2 branschmedianer · #3 forskningslaget · #4 kassaflodesanalys · #5 utdelningar · #6 vagkartan. | m9-sektion i sammanställningen |

**Aktualiseringsnotiser (information, inga fel):**

1. Färskhetsvakten: korstabellen 13 dagar av 45, vågvalideringsrapporten 12
   dagar av 45 — regenerering inte hotad. Octoberutgåvor kräver att underlagen
   rör sig (evergreen-regeln) — räknaren är unga (sedan 2026-09-04) och varje ny
   rond väger tyngre.
2. Vid nästa rond växer n: "Träffprocenten oförändrad"-raden byts då mot
   deltaText automatiskt (mallens else-gren, speglad i § 6).

## Diff-rapport

**0 poster.** `vagkartan-traffprocent-diff.json` (denna våg) — maskinellt
läsbart kvitto: bedömning FLYTTKLAR, tom poster-lista med motivering
(determinismkvitto, se § 6).

## Slutsats

**FLYTTKLAR — m9-utkast #6:s paket är komplett och därmed HELA m9-serien
(6/6) granskningsklar.** Källor oförändrade, 65/65 maskinella kontroller gröna
(tre oberoende beräkningsvägar per tal: tabell, Totalt-rad, rådommar),
juridiken mekaniskt ren (2007:528; juridikgrind-vakt 0 fynd; 0 rådverb; 0
tickerläckor), 911-kontroll 0, länkar 3/3 verifierade mot levande sajten,
determinismkedjan hel ner till rådata (seed + mallMd5 + kandidatMd5
återledda, body byte-identisk). När kunden beslutar publicera (R2): exportvägen
tar bort kvittoavsnittet och "(utkast)" i titeln. Fabriksflagga F4
(forskningslagets mall-backport) bokförd för oktoberutgåvan.
