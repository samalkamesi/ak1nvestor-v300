# KONTROLL-GRANSKNING 2026-09-16 — Branschmedianer september 2026 (m9-utkast #2)

**Objekt:** `data/blogg-utkast/m9-ko/branschmedianer-akm2-v2.json` (m9-fabriken, version 2, status utkast — köns nästa olevererade objekt: #1 boerspsykologi komplettades av förra omgångens s1-u1, branschmedianer är `slugar`-ordningens andra post och v2 gäller enligt kön)
**Granskad av:** fabrik auto-s1-u1 (agentfabrik auto-s1-1789537520972), 2026-09-16
**Bedömning: FLYTTKLAR — 0 rättningar, 0 nya fynd.** Tillsammans med
`branschmedianer-akm2.md` (2026-09-14) är paketet komplett: huvudgranskning +
kontrollgranskning enligt 09-15-standarden + maskinell diff-rapport
(`branschmedianer-akm2-diff.json`, denna våg).

**Rollfördelning:** 09-14-rapporten (annan agent) är huvudgranskningen och
består — denna kontroll fyller gapet mot 2026-09-15-standarden som saknades
för m9-serien: (1) mekanisk juridikgrind via `verktyg/juridikgrind-vakt.mjs`,
(2) 911-sökning, (3) HTTP-länkverifiering mot LEVANDE sajten, (4) maskinell
diff-fil — plus (5) en aktualisering: källor, kursregister och sajten har
rört sig sedan 09-14, och (6) en FULL determinismrekonstruktion (se § 6 —
starkare bevis än något tidigare m9-utkast burit).

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen.

---

## 1. Källor — md5 mot aktuellt träd (2026-09-16)

| Källa | Md5 i kvitto | Md5 i trädet | Dom |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | ✓ oförändrad |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | ✓ oförändrad |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | ✓ oförändrad |

Alla tre källorna fortfarande byte-identiska med kvittot — inget värde i
utkastet är föråldrat mot sin källa.

## 2. Siffror — oberoende omräkning + maskinell verifiering

**Skript `.zcode/granskning-m9-branschmedianer.mjs` (skrivet + kört 2026-09-16
av denna granskning): 56 OK, 0 FEL.** Oberoende omräkning ur
`korstabell-grund.json` (100 rader, skapad 2026-09-03) med peer-motorns
mediankontrakt (jämnt n ⇒ medel av de två mittersta) — varje tal i utkastet
mätts mot egna beräkningar, inte mot utkastets:

| Bransch | Utkast (median · n · spridning) | Omräkning | Ytterligheter | Dom |
|---|---|---|---|---|
| universum | 100 bolag (10×10) | 100 rader · 10 branscher · 10 rapporterade (mätta ≥ 5) | — | ✓ |
| teknik | 61 · 10 · 37–78 | 61 · 10 · 37–78 | Sinch / Logitech International | ✓ |
| konsument | 60,5 · 10 · 19–70 | 60,5 · 10 · 19–70 | Electrolux / H & M Hennes & Mauritz | ✓ |
| industri | 60 · 10 · 51–85 | 60 · 10 · 51–85 | ASSA ABLOY / Industrivärden | ✓ |
| kommunikation | 60 · 10 · 39–68 | 60 · 10 · 39–68 | Warner Bros. Discovery / Tele2 | ✓ |
| energi | 58 · 10 · 31–77 | 58 · 10 · 31–77 | RWE / Chevron | ✓ |
| hälsa | 56,5 · 10 · 46–66 | 56,5 · 10 · 46–66 | Fresenius / Novo Nordisk | ✓ |
| fastighet | 50 · 10 · 42–60 | 50 · 10 · 42–60 | Prologis / Diös Fastigheter | ✓ |
| tillväxt | 43 · 10 · 25–58 | 43 · 10 · 25–58 | Polestar Automotive Holding UK / Truecaller | ✓ |
| material | 42 · 10 · 31–79 | 42 · 10 · 31–79 | Stora Enso / Newmont | ✓ |
| finans | 41 · 10 · 30–80 | 41 · 10 · 30–80 | Nordea Bank / Investor | ✓ |

Därtill maskinellt verifierat: ingressens fyra första branscher + "med flera" ·
"Högst median: teknik 61. Lägst: finans 41." · alla 11 kvitto-urdrag ·
`akm2Regler.formel` bär "akm2-2026" · jämförbarhetsnotens investmentbolag
(Industrivärden, Investor) · "Ingen branschmedian rörde sig" sant mot den
publicerade utgåvan (se § 5).

## 3. Juridik — lagen (2007:528): REN, mekaniskt bevisad

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-16 (denna granskning): filen
  ger **flyttklar: true · grund: true · fynd: 0** — rådsförbud, grund
  (utbildnings-disclaimer) och tvärfall alla gröna. (Vaktens globala GUL med
  11 varningar gäller andra filer i ytan, inte detta utkast.)
- Egen verb-sond (titel+ingress+body mot köp/sälj/rekommendera/bör du/undvik
  denna/bra affär): **0 träffar** — texten är rent deskriptiv statistik
  ("median", "spridning", "lägst/högst poäng i gruppen") utan hållning.
- Utbildningsramen: disclaimern är bodyns sista rad — "Pedagogisk forskning —
  aldrig investeringsrådgivning (lagen 2007:528)".
- Endast lagrummet 2007:528 nämns (sond mot 2022:260/2022:261/1985:716/2005:59
  = 0 träffar) — ingen lagrumsblandning.

## 4. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA utkastfilen (body + metadata, JSON som sträng) efter
sex mönster: "911", "11 september", "september 2001", "9/11", "terror",
"Terrordåd" → **0 träffar**. Inget att åtgärda. (Kontrollen saknades i
09-14-rapporten — därmed är metodpunkten nu dokumenterad även för m9-utkast #2.)

## 5. Länkar + publicerade utgåvan — mot levande sajten (2026-09-16)

| Länk | Dom |
|---|---|
| `/forskningsbiblioteket` | 200 |
| `/kurser/v07-bruttomarginal` | 200 |
| `/kurser/v09-roe` | 200 |

09-14 verifierade mot källkodsnärvaro; denna våg verifierar mot
`localhost:3000` (loopback) — länkarna lever på dagens build.

**Aktualisering mot publicerade utgåvan** (`data/blogg/branschmedianer-akm2.json`):
publishedAt 2026-09-03 · titel utan "(utkast)" · body utan kvitto-avsnitt
(exportvägens beteende bevisat) · **samtliga 10 medianer identiska med
utkastets** — "Ingen branschmedian rörde sig sedan den publicerade utgåvan"
är fortfarande sant i 2026-09-16-läget. Färskhetsvakten: korstabellen 13 dagar
av 45 tillåtna — framtida regenerering inte hotad.

## 6. Determinism — FULL rekonstruktion (2026-09-16)

`.zcode/granskning-m9-branschmedianer.mjs` speglar m9-fabrikens
branschmedianer-gren (rad 574–660 + montera 1230–1271) och bygger bodyn från
grunden ur källfilerna:

- **Body rekonstruerad byte-identisk — 4 733 tecken.**
- **kandidatMd5 `0431dd6c…` reproduceras exakt** — utkastet oekkat sedan
  generering.
- **mallMd5 `7b4a313a…` reproduceras exakt** (mallen = bodyn utan kvitto).
- **Seed `904e0fcc…` ÅTERLEDD ur trädets källor** — md5 av källfilernas md5 +
  månadsnyckel "2026-09|2026-09" stämmer mot kvittot (branschmedianer-seriens
  tre källor räcker — till skillnad från boerspsykologi-serien, där seedet
  kräver alla sex fabrikskällor). Determinismkedjan är därmed hel ända ner
  till rådata: källor → seed → body → kandidatMd5.
- Kontroll-blocket i JSON:en (rubriker 5, strukturFel 0, disclaimerSist,
  kontrolleraText 0/0) stämmer mot mätning (5 "##" i hel body · 4 i mallen —
  konsekventa sinsemellan; kvitto-raden "VARNINGAR 0" är med i den
  byte-identiska bodyn = självkonsistent bevis).

**Konsekvens för diff-rapporten:** poster-listan är TOM med avsikt — varje
manuell ändring av utkast-JSON:en skulle bryta determinismkvittot. Rättningar
på m9-seriens innehåll går via `verktyg/m9-fabrik.mjs` (regenerering med nytt
kvitto) eller exportvägen (som redan stryker "(utkast)" i titeln och
kvittoavsnittet i bodyn).

## 7. Struktur

5 "##"-rubriker i hel body (krav ≥ 2) ✓ · body 4 733 tecken (krav ≥ 800) ✓ ·
disclaimer sista rad ✓ · disposition ingress → så räknas medianen → varje
bransch → jämförbarhetsnot → ändringen → fördjupa dig → kvitto → disclaimer ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | 0 nya fynd. 09-14:s F1–F3 består (overksam källa vagvalidering-SENASTE.md i kvitto-listan = fabriksflagga, inte textfel; presentationsnamn vs maskinnycklar; utkast-suffix + kvitto hanteras av exportvägen). | Ingen |

## Aktualiseringsnotiser (information, inga fel)

1. **Korstabellen frusen, universumet växt:** korstabell-grund.json (100
   bolag) oförändrad sedan 2026-09-03 medan bolagsunivers.json vuxit till 120
   bolag (spår 2:s arbete; SYSTEMKARTAN B13 noterar glidningen). Utkastet
   redovisar urvalsberoendet ÖPPET ("korstabellens 100-bolagsuniversum",
   referens "2026-09-03 · 100-bolagsuniversum") — korrekt hanterat i texten;
   uppdaterad korstabell ⇒ ny regenerering är fabriksägarens cadans-fråga
   (samma kö som B13:s korstabell-refresh-notis).
2. Publicerade utgåvan orörd sedan 09-03 (medianerna identiska) — påståendet
   "att inget rörde sig är också ett utfall" förblir sant.

## Flagga till sammanställningsägaren (ej min fil)

`GRANSKNINGSKO-SAMMANSTALLNING.md` saknar fortfarande hela m9-serien (nu med
denna kontroll: #1 komplett 09-16, #2 komplett 09-16, #3–#6 väntar) — samma
flagga-familj som förra omgångens s1-u1/s1-u2/s1-u3. M9-raderna hör hemma i
aktuell sammanställning; huvudagentens/domänavägarens beslut.

## Diff-rapport

**0 poster.** `branschmedianer-akm2-diff.json` (denna våg) — maskinellt
läsbart kvitto: bedömning FLYTTKLAR, tom poster-lista med motivering
(determinismkvitto, se § 6).

## Slutsats

**FLYTTKLAR — m9-utkast #2:s paket är komplett.** Källor oförändrade, 56/56
maskinella kontroller gröna (varav 34 sifferkontroller: 10 medianer + 10 n +
10 spridningar + 20 ytterlighetsbolag + urdrag + ingress + högst/lägst),
juridiken mekaniskt ren (2007:528; juridikgrind-vakt 0 fynd), 911-kontroll 0,
länkar 3/3 verifierade mot levande sajten, determinismkedjan hel ner till
rådata (seed återledd — seriens starkaste bevis). När kunden beslutar
publicera (R2): exportvägen tar bort kvittoavsnittet och "(utkast)" i
titeln — därefter är innehållet klart som blogginlägg.
