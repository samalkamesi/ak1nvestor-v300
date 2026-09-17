# KONTROLL 2026-09-16 — telekomaktier-sa-analyserar-du-telekom-och-mediabolag

**DOM: FLYTTKLART EFTER EN RÄTTNING (C1)** — därefter grön i samtliga dimensioner.

| | |
|---|---|
| Objekt | `data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag.json` (utkast v1, skrivet 2026-09-15 20:54 av spår 3 s3-u3 omgång 2) |
| Granskare | Fabriksagent **s1-u2**, våg `auto-s1-1789585526448` (startad 19:05:26 UTC) — granskad 19:1x–19:4x UTC 2026-09-16 |
| Dimensioner | Källor, siffror, juridik-språk (2007:528), 911-referenser, strukturkontrakt, interna länkar, räkneexempel → flyttklart paket med diff-rapport |
| Diff | `telekomaktier-sa-analyserar-du-telekom-och-mediabolag-diff.json` (1 byt-post C1 + 4 förslag D1–D4; samtliga söksträngar maskinellt verifierade unika i källfilen) |

## 0. Objektsval och duplikatkontroll

Uppdraget sa "m9-utkast #2" — men **m9-ko-serien är redan 6/6 granskningsklar**
(worklog 2026-09-16: #2 branschmedianer-akm2 = s1-u1 våg 1789537520972, #4
kassaflödesanalys = s1-u2 omgång 3, #3/#5/#6 = våg 1789560918402, #1
boerspsykologi KONTROLL 01:10 — duplikat är förlorat arbete enligt
manifestregeln). Nästa olevererade objekt i granskningskön valdes enligt
spårets kollisionsdoktrin (s1-u3 2026-09-15: "olistad i sammanställningen +
oreserverad = lägst kollisionsrisk"):

- **ravarubolag-materialbranschens-cykel** = FIFO-förstaval (äldst, 09-15
  07:02, listad först i kundens kö-vy) — lämnas åt syskon med samma
  topp-av-kön-resonemang.
- **sa-analyserar-du-energiaktier** = reserverat "åt kommande våg" av
  s1-u1-ledet (worklog 2026-09-15) — syskonet u1:s rimliga förstavalsobjekt.
- **VAL: telekomaktier** — fjärde äldsta i kön (09-15 20:54), oreserverad,
  olistad i sammanställningen, aldrig granskad. Anspråk skrevs tidigt
  (skriv-tidigt-klaim-kuren, s3-u2:s kollisionsläxa 2026-09-15) i denna fil
  19:1x UTC; syskonloggar och nya träd-filer kontrollerades före och under
  arbetet (u1/u3 hade vid senaste kontroll ej levererat något objekt).

## 1. Strukturkontrakt — GRÖNT

| Kontroll | Mätning | Dom |
|---|---|---|
| Ord (bokstavsord) | 1 144 (byggarens metod "alla token": 1 273) | Span 800–1400 ✓ (mallmål 1 200 — inom span med båda metoderna) |
| Title | "Telekomaktier: så analyserar du telekom- och mediabolag" = 55 tkn | ✓ |
| OG-desc | 135 tkn | ✓ |
| readingMinutes | 2 — kontrakt round(ord/600): 1 144→1,9→2 ✓, 1 273→2,1→2 ✓ | **GRÖNT — INTE det systematiska 3-slippet** (lakemedels/ravarubolag/bankaktier-familjen) |
| Sökord "telekomaktier" | title ✓ · ingress ✓ · H2 ("Telekomaktier i praktiken…") ✓ | ✓ |
| H2-rubriker | 9 st (varav Källor) | ✓ (≥ 2) |
| Disclaimer | Sista raden: "_Detta är pedagogisk finansanalys, inte investeringsråd._" — negerat investeringsråd | ✓ |
| pillar/author | "Institutionell metodik" / "AK1A Research Lab" | ✓ |
| Body-längd | 9 937 tkn | ✓ (≥ 800) |
| Kollision | Ingen telekom-post i data/blogg/ (ny post); syskonvarianten "…telekombolag.json" från 09-15 är städad ur trädet | ✓ |

## 2. Juridik-språk (2007:528) — GRÖNT

- **Varumärkesgrind (kontrolleraText-replik):** samtliga 26 förbjudna fraser
  ur `data/varumarke.json` (samma källa som `src/lib/varumarke.ts`) körda
  mot titel + description + varje kroppsrad: **0 FEL, 0 varningar**. Notera
  att den negerade "investeringsråd"-träffen i disclaimer-raden korrekt
  passerar lookbehind-regexen (negerat = tillåtet — det är signaturdisclaimern).
- **Rådgivningsverb:** 0 träffar (köp/sälj/rekommendera/bör du köpa/tipsa dig
  om att). Texten är genomgående deskriptiv metodik ("så fungerar metoden",
  läsinstruktioner, "läs alltid … med capex och skuld bredvid" = läs-lära,
  ej handlingsuppmaning).
- **Lagrum:** endast **LEK 2022:482** nämns — korrekt lagrum för
  elektronisk kommunikation inklusive kakreglerna, korrekt att kakreglerna
  förs dit (samma lag, annan del — ingen lagrumsblandning), korrekt
  tillsynsmyndighet (PTS). **Inga** konsumentlagrum (2022:260/2022:261/
  1985:716), **inget** 2007:528, **inget** 2005:59 i texten — blandningsförbudet
  håller.
- Bolagsnamnen (Telia, Tele2, Deutsche Telekom, Telenor, Netflix, Spotify,
  Meta, Viaplay) används endast som branschexempel utan omdömen om enskild
  aktie — utbildningsformen (2 kap 5 §) ren.

## 3. 911-referenser — GRÖNT

0 träffar på sex mönster (911 · 9/11 · 11 september · september 11 ·
nine-eleven · 9-1-1) i titel + description + body. Seriestandard hållen.

## 4. Interna länkar — 14/14 GRÖNT

Alla 14 korslänkar verifierade mot live-förråden: 7 /kurser/ i
`public/deep-courses.json` (v15-natverkseffekter, km-003-kassaflodesanalysen,
v19-kapitalforbranning, v02-arr-tillvaxt, km-010-evebit, km-063-direktavkastning,
v18-regulatoriska, km-046-telekomsektorn) + 7 /blogg/ som live-filer i
`data/blogg/` (v08-ebitda-marginal-analys, sa-raknar-du-ev-ebitda,
skuldsattningsgrad-vilken-niva-ar-farlig, arr-tillvaxt-vad-atkomliga-intakter-sager,
branschmedianer-akm2, komplett-guide-svensk-aktieanalys-2026).
**0 länkar mot outgivna utkast.**

## 5. Siffror — räkneexempel 8/8 exakta + 1 riktningsfynd (C1)

Egen omräkning (verktyg/_s1u2-telekom-kontroll.mjs, ej committat):

| Exempel | Texten | Omräknat | Dom |
|---|---|---|---|
| ARPU 150 kr/mån → år | 1 800 kr | 150×12 = 1 800 | ✓ |
| Churn 1,5 %/mån → relationslängd | ≈ 67 månader | 1÷0,015 = 66,7 | ✓ |
| Livstidsvärde | ≈ 10 000 kr | 150 × 66,67 = 10 000 | ✓ exakt |
| …årsformulering | "knappt fem och ett halvt år" | 66,7/12 = **5,56 år** | ✗ → **C1: "drygt"** |
| EBITDA-marginal | 40 % | 12/30 = 40,0 % | ✓ |
| Capexandel | 20 % | 6/30 = 20,0 % | ✓ |
| Kassaflöde före ränta/skatt | 6 mdr | 12−6 = 6 | ✓ |
| Efter ränta 1,2 mdr | 4,8 mdr | 6−1,2 = 4,8 | ✓ |
| Nettoskuld/EBITDA | 2,5× | 30/12 = 2,5 | ✓ |

C1 är hela fyndet i sifferdimensionen: riktningen på "knappt" är fel (66,7
månader = strax ÖVER 5,5 år). Meningens övriga tal är exakta.

## 6. Externa källor — 6/6 GRÖNA (webverifierade 2026-09-16)

| Påstående i texten | Källa (primär) | Dom |
|---|---|---|
| PTS 5G-auktion 3,5+2,3 GHz: "2,3 miljarder på en enda auktionsdag; Telia 760 Mkr för 120 MHz" | PTS/Cision: "en dags auktion och fyra budrundor", total 2 317 000 000 kr; Telia 120 MHz (3500–3620) till 760 Mkr, tillstånd till 2045 | ✓ EXAKT (avrundning 2,317→2,3 standard) |
| "Auktionen i 900-, 2100- och 2600 MHz-banden 2023 gav ytterligare 4,2 miljarder" | PTS/TT: 900 MHz/2,1/2,6 GHz, 3 dagar + 26 klockrundor, total 4,23 mdr; Telia 1,55 mdr (release 2023-09-21) | ✓ EXAKT (årtal, band, belopp) |
| "7,6 biljoner dollar 2025 — 6,4 % av världens BNP enligt GSMA" | GSMA The Mobile Economy 2026: "In 2025, mobile technologies and services generated $7.6 trillion … equivalent to 6.4% of GDP" | ✓ ORDAGRANNE |
| "5G-prenumerationer passerat tre miljarder, väntas nå 6,4 miljarder i slutet av 2031" (Ericsson Mobility Report) | Ericsson pressrelease juni 2026: "5G subscriptions top three billion"; Mobile subscriptions outlook: "6.4bn by the end of 2031" | ✓ EXAKT |
| Netflix "över 325 miljoner betalande hushåll Q4 2025; intäktsprognos 2026: 50,7–51,7 mdr USD" | Reuters/Variety 2026-01-20: passerade 325 M under Q4 2025; prognos $50,7–51,7 bn | ✓ tal exakta · terminologi → D1 ("hushåll" vs källans "paid memberships") |
| Spotify "761 miljoner månatliga användare varav 293 miljoner betalande Q1 2026" | Spotify Newsroom 2026-04-28: MAU 761 M (+12 %), Premium 293 M (+9 %) | ✓ EXAKT |
| Viaplay "omarbeta sina innehållsåtaganden 2023" efter sporträttighetsköp | Allmän etablerad händelse (Viaplays omstrukturering 2023); inga tal i texten | ✓ |
| Tumregler: capex "normalt 15–20 % av intäkterna", nettoskuld "ofta kring 2–3 års EBITDA" | Branschnorm (hedgade formuleringar; i linje med GSMA/operatörsrapport) | ✓ som pedagogiskt spann |

## 7. Diff-rapporten

Se `-diff.json`: **C1** (byt "knappt"→"drygt fem och ett halvt år") + **D1**
(Netflix-måttets term), **D2** (publishedAt = flyttdagen, R2), **D3**
(PTS-djuplänk till Genomförda auktioner), **D4** (PTS:s bandbeteckningar
900 MHz/2,1 GHz/2,6 GHz). Alla söksträngar unika i källfilen
(maskinverifierat).

## 8. Flyttinstruktion (kundens steg — R2)

1. Verkställ C1 (en sök/ersätt), besluta om D1–D4.
2. Guiden är ett spår 3-bygge (inget kvitto-avsnitt att radera — till skillnad
   från m9-fabrikens utkast); disclaimern sitter redan sist.
3. Vid export: publishedAt = faktisk publiceringsdag (D2).
4. Publicering = kundens beslut (R2) — maskinen flyttar aldrig till
   `data/blogg/`.

## 9. Köanteckning åt sammanställningsägaren

`GRANSKNINGSKO-SAMMANSTALLNING.md` saknar fortfarande teknik + industri +
telekom + mx1-femman (befintlig flagga från s1-u1/s1-u3) — telekom är nu
granskat och kan radas som "granskad 2026-09-16, flyttklar efter C1" när
sammanställningen förnyas (C16-köposten i SYSTEMKARTAN). Efter denna granskning
återstår i rotkön 15 olevererade guider: ravarubolag, energiaktier, industri,
konsumentbolagens-skuldsattning, finansbolagens-riskhantering,
halsobolagens-lonsamhet, konsumentaktier, halvledaraktier, tillvaxtaktier,
saasaktier, spelaktier, bilaktier, forsvarsaktier, detailhandelsaktier,
flygaktier — + kvartalsserien och SEO-guider enligt spårets kontext.

*Granskat med: verktyg/_s1u2-telekom-kontroll.mjs (maskinkontroller,
okommittat replik-skript) + webbverifiering av sex primärkällor 2026-09-16.
Endast data/ berörd; src/ orörd; tsc-baslinjen orörd; R2 orörd;
data/blogg/ orörd.*
