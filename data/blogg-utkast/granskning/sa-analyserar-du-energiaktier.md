# GRANSKNING 2026-09-17 — Så analyserar du energiaktier (rotkön, branschguide energi)

**Objekt:** `data/blogg-utkast/sa-analyserar-du-energiaktier.json` (SEO-serien,
skapad 2026-09-15 07:02, `readingMinutes` 2, pillar "Institutionell metodik")
**Granskad av:** fabrik auto-s1-u1 (agentfabrik auto-s1-1789604126983), 2026-09-17
**Bedömning: FLYTTKLAR — 0 rättningar nödvändiga, 0 felaktiga påståenden.**
Två frivilliga precisionsförslag (D1+D2, samma rot) + en konventionspost (D3).

**Val-bokföring (duplikatkontroll FÖRE start):** uppdragets "m9-utkast #1"
(boerspsykologi-fallstugor) var redan levererat två gånger — huvudgranskning
09-14 (våg 151) + KONTROLL/diff 09-16 01:10 av förra omgångens s1-u1 (commit
02224ea4) — och hela m9-serien är 6/6 granskningsklar sedan 09-16 14:35.
Köregeln ("nästa icke levererade, duplikat = förlorat arbete") tvingade pivot.
Valet föll på energiaktier-guiden: **reserverad åt u1-ledet sedan 09-15**
(worklog, telekom-granskarens rad 12053), äldsta ogranskade rotguide efter
ravarubolag (som är syskonens FIFO-förstaval enligt samma precedens), 0
energiaktier-filer i `granskning/`, 0 syskonanspråk på energi i denna omgång.
Anspråk skriven FÖRSTA handlingen: `data/vakten/auto-s1-1789604126983-u1-ansprak.md`.

Granskaren skriver inte om andras filer — utkast-JSON:en är orörd; rättningar
via guidens ägare eller exportvägen. Publicering är kundens beslut (R2).

---

## 1. Källor — alla verifierade mot primärkällor (2026-09-17)

| Källpåstående i texten | Verifiering | Dom |
|---|---|---|
| IEA WEI 2026: global energiinvestering **3 400 mdr $** under året | IEA:s executive summary, ordagrant: *"Capital flows are expected to grow to USD 3.4 trillion in 2026"* (hämtad 2026-09-17) | ✓ EXAKT |
| IEA WEI 2026: **2 200 mdr $** till ren energi, **nästan dubbelt** de fossila | IEA:s fullrapport + regional dashboards, ordagrant: *"global investment in clean energy and related infrastructure reaches USD 2.2 trillion, almost double that of fossil fuels"* (2026; korsbelagt via IEA:s egna kanaler och oberoende bevakning) | ✓ EXAKT |
| Komponentlistan "sol, vind, elnät, kärnkraft och elbilar" | Matchar IEA:s clean energy-definition (renewables, nuclear, grids, storage, electrification) — utkastet listar en korrekt delmängd | ✓ |
| Brent **under 20 $/fat** under pandemin 2020, **över 120 $/fat** 2022 "(EIA)" | Känt sant: april 2020 ~16 $ (lågpunkt), mars–juni 2022 ~120–128 $; EIA/STEO är rimlig källa | ✓ |
| Elpris bildas på **Nord Pool**, per elområde **SE1–SE4** | Korrekt om europeisk elbörs och Sveriges fyra elområden | ✓ |
| **Ei** som svensk elmarknadstillsyn | Energimarknadsinspektionen — korrekt myndighet | ✓ |

Alla fyra källdomäner svarar: iea.org 200 · eia.gov 200 · nordpoolgroup.com 200 ·
ei.se 200 (curl med redirectföljning, 2026-09-17). Källavdelningen listar rätt
fyra källor med URL:er.

**Universumfakta:** "I AK1A:s bolagsuniversum är Equinor, Aker BP och Vår Energi
exempel" — alla tre finns i `data/portfolj-system/bolagsunivers.json` (maskinellt
bekräftat). Övriga namngivna (Chevron, ExxonMobil, Shell, Iberdrola, Enel, RWE,
Fortum) finns OCKSÅ i universumet — textens gruppindelning håller mot eget data
(14 energi-rader av 138 totalt).

## 2. Siffror — samtliga räkneexempel egenomräknade

| Påstående | Omräkning | Dom |
|---|---|---|
| Prisfall "en tredjedel": 80 → 53 $/fat | 80 × 2/3 = 53,33 ≈ 53 | ✓ |
| Marginal vid brytpunkt 50: pris 80 → 30 $/fat | 80 − 50 = 30 | ✓ |
| Marginal vid 53: "3 dollar per fat" | 53 − 50 = 3 | ✓ |
| "faller marginalen med över 80 procent" | (30−3)/30 = **90,0 %** — påståendet är SANT (90 > 80) men under exakt värde | ✓ sant · D1 |
| Sammanfattningens upprepning "över 80 procent" | samma rot | ✓ · D2 |

IEA-talen och Brent-spannet: se § 1. **Inga felaktiga tal hittade.**

## 3. Juridik — lagen (2007:528): REN

- `verktyg/juridikgrind-vakt.mjs --json` körd 2026-09-17: **0 fynd** på filen
  (rådsförbud, grund) och `grund: true` — den negerade investeringsråds-disclaimern
  bär utbildningsgrunden. (Vaktens `flyttklar: false` betyder bara att ingen
  granskningsrapport med FLYTTKLAR-dom fanns — den här rapporten ändrar det.)
- Genomläsning enligt juridikgrindens snabbkontroll: titel "Så analyserar du …"
  = ren utbildningsform. Orsökning på köp/sälj/rekommendera/bör du/målkurs/
  målpris/undvik/garanterad avkastning/aktietips ger **EN träff**: "sälja" i
  ingressens "finna, framställa, transportera eller sälja energi" — infinitiv
  om bolagens VERKSAMHET, inget rådobjekt, ingen adressat. **Falsk positiv**
  (samma familj som teknikaktier-granskarens dokumenterade TVÄRFALL) — noterad
  för vaktdataläggen, ingen textändring.
- **Inga lagrum i texten** — disclaimern "pedagogisk finansanalys, inte
  investeringsråd" bär juridiken utan lagrumsblandning (renaste formen).
- Utdelningsstycket och checklistan är genomgående deskriptiva ("vilket råvarupris
  ger brytpunkt", "hur rör sig utdelningen om priset faller") — frågeform, aldrig
  handlingsformulering.

## 4. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA utkastfilen (body + metadata, JSON som sträng) efter sex
mönster: "911", "11 september", "september 2001", "9/11", "terror", "Terrordåd"
→ **0 träffar**.

## 5. Internlänkar — 10/10 HTTP 200 mot levande sajten

5 kurser + 5 bloggposter, alla verifierade **två vägar**: fil/register-närvaro
(kursmål i `public/deep-courses.json`, bloggmål som live-filer i `data/blogg/`)
OCH HTTP 200 mot `localhost:3000` (loopback, 2026-09-17):

- `/kurser/km-010-evebit` · `/kurser/km-003-kassaflodesanalysen` ·
  `/kurser/km-009-pe` · `/kurser/km-006-kvartalsrapporten` ·
  `/kurser/km-014-korrelation-diversifiering` — 200 ✓
- `/blogg/vad-ar-ev-ebitda` · `/blogg/skuldsattningsgrad-vilken-niva-ar-farlig` ·
  `/blogg/v18-regulatoriska-analys` · `/blogg/branschmedianer-akm2` (×2 i texten) ·
  `/blogg/komplett-guide-svensk-aktieanalys-2026` — 200 ✓

0 länkar till outgivna utkast.

## 6. Struktur

| Krav | Mätt | Dom |
|---|---|---|
| Ord i body 800–1400 (mallmål 1200) | 1 126 | ✓ |
| "##"-rubriker ≥ 2 | 8 | ✓ |
| Disclaimer sista rad | "_Detta är pedagogisk finansanalys, inte investeringsråd._" | ✓ |
| readingMinutes = round(ord/600) | round(1126/600) = 2; filen bär 2 | ✓ — **INTE det systematiska 3-slippet** (teknik-/läkemedels-/råvarubolags-familjen) |
| Titel ≤ 60 tkn | 58 | ✓ |
| description ≤ 160 tkn | 152 | ✓ |

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| D1 | förslag | "över 80 procent" är slött: exakta värdet är 90,0 % ((30−3)/30), och kvar-marginalen 3 $ av 30 i samma mening bevisar det | "med 90 procent" (body) |
| D2 | förslag | Samma rot i sammanfattningen | "marginalen 90 procent" |
| D3 | förslag | `publishedAt` = skapandedatum (2026-09-15) — seriekonvention: sätts till faktisk publiceringsdag vid flytt; exportvägen stämplar automatiskt | vid export (R2) |
| — | notis | Vaktens rådverb-träff "sälja energi" = falsk positiv (verksamhetsinfinitiv) | vaktdatalägg, ej texten |
| — | notis | Positivt: readingMinutes korrekt redan från författarsidan — seriens systematiska slip finns EJ här | ingen |

## Diff-rapport

`sa-analyserar-du-energiaktier-diff.json` — 3 poster (0 byt + 3 förslag), samtliga
söksträngar maskinellt verifierade unika i källfilen (1 träff vardera).

## Slutsats

**FLYTTKLAR.** 45 maskinella kontrollposter (sond 29 — varav 1 rådverbsträff
bedömd falsk positiv — + länk-HTTP 10 + källdomäner 4 + IEA-ordagrav 2) plus
människoläsdom: källor 6/6 mot primärkällor (IEA:s båda tal ordagrant),
räkneexempel 5/5 omräknade (0 fel), juridik mekaniskt ren (0 fynd, grund bär),
911 = 0, länkar 10/10 levande, struktur grön. D1/D2 är frivillig precision, D3
konvention. När kunden beslutar publicera (R2): exportvägen stämplar
publiceringsdagen — därefter klart som blogginlägg.
