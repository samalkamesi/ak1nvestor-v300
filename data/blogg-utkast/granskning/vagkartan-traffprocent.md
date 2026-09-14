# Granskning m9 — Vågkartan september 2026: träffprocenten 52 %

- **Utkast:** `data/blogg-utkast/m9-ko/vagkartan-traffprocent-v1.json` (m9-fabriken, version 1, status utkast)
- **Granskare:** m9-granskningsagent (agentfabriksomgång), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar behövdes, utkastet är orört sedan generering.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen. "Färdigt att flyttas" betyder: innehållet
håller för export när kunden beslutar.

---

## 1. Källor — md5 mot aktuell fil

| Källa | Md5 i kvitto | Md5 i trädet | Utfall |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0c617e8339024851c6361bd6a` | `33fe62a0c617e8339024851c6361bd6a` | MATCHAR — oförändrad |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627c055d2ddb5503009a544cff8` | `b7194627c055d2ddb5503009a544cff8` | MATCHAR — oförändrad |
| `data/varumarke.json` | `9b906e4204a759db24c2c78b4b332e18` | `9b906e4204a759db24c2c78b4b332e18` | MATCHAR — oförändrad |

Alla tre källorna är byte-identiska med det urdragen bygger på — inget värde
behöver härledas om. (Korstabellen ingår i seedet/manadsnyckeln men bär inga tal
i bodyn; de båda övriga bär rapportdata respektive varumärkesreglerna.)

## 2. Siffror — det särskilda 52 %-påståendet och samtliga urdrag

Kravet var minst 5 verifierade urdrag; **samtliga 7 granskades** — och på tre
oberoende vägar: (a) mot rapportens tabell/Totalt-rad, (b) genom omräkning ur
rapportens rådomlista ("Dagens domar", 12 tickers × 5 rader), (c) genom byte-identisk
rekonstruktion av hela utkastet ur källfilerna (§ 3).

| Påstående i utkastet | Källvärde (tabell) | Omräkning ur rådommarna | Utfall |
|---|---|---|---|
| **träff 52 % (n=48 dömda, osatta 20 %)** | Totalt-raden: 52 % (n=48, osatta 20 %) | **25 träff + 23 miss = 48 dömda → 52,1 % ≈ 52 % · 12 osatta av 60 = 20 %** | STÄMMER |
| 12 tickers, 5 horisonter; räknare sedan 2026-09-04 | Universum: 12 tickers · rullande sedan 2026-09-04 · 5 horisonter i tabellen | 12 ticker-rader; 5 horisonter (mikro/kort/medellång/lång/mega); 12×5=60 mätningar varav 48 dömda + 12 osatta — internt konsistent | STÄMMER |
| mikro: impulsvåg 75 % (n=4) · basbygge 63 % (n=8) | `75 % (n=4)` / `63 % (n=8)` | 3/4 · 5/8 | STÄMMER |
| kort: impulsvåg 100 % (n=2) · basbygge 30 % (n=10) | `100 % (n=2)` / `30 % (n=10)` | 2/2 · 3/10 | STÄMMER |
| medellång: impulsvåg 100 % (n=6) · basbygge 0 % (n=6) | `100 % (n=6)` / `0 % (n=6)` | 6/6 · 0/6 | STÄMMER |
| lång: inga dömda | alla celler `— (n=0)` | 0 dömda i rådommarna (osatt för alla 12 tickers) | STÄMMER |
| mega: impulsvåg 100 % (n=6) · basbygge 0 % (n=6) | `100 % (n=6)` / `0 % (n=6)` | 6/6 · 0/6 | STÄMMER |

Nolls summering: 12+12+12+12 = 48 dömda (= fyra dömda horisonter × 12 tickers)
och cellernas träffsumma 3+5+2+3+6+0+6+0 = 25 → 25/48 ≈ 52 % — tabellen,
totalraden och rådommarna hänger samman: inget tal står ensamt. Inga
median-/värderingspåståenden förekommer (serien är ren träffstatistik).

## 3. Determinism — kvittot reproducerat (starkare än förra granskningen)

Skript: `.zcode/granskning-m9-vagkartan-rekonstruera.mjs` (spegling av
`lasVagvalidering` + seed-/källblocket + `byggVagkartan` + `montera` +
`granskningsunderlagAvsnitt` + `kandidatMd5` ur `verktyg/m9-fabrik.mjs`).
Till skillnad från börspsykologi-granskningen kunde HÄR även **seedet
reproduceras fullt ut** (vagkartan bygger på det globala källor-seedet):
`md5(käll-md5:er + ":2026-09|2026-09")` → `904e0fcc917798642aa9bd0a1c44d04b`.

- **bodyMarkdown: byte-identisk** med utkastets (3 904 tecken) — titel, ingress,
  urdrag och källor likaså.
- **mallMd5 `e5ada75e66fc9a243dc16860c8c2abbd`: reproduceras exakt.**
- **kandidatMd5 `2cf06db04af679b2d8b54e228aabdf98`: reproduceras exakt.**

Slutsats: utkastet är **oekat sedan generering** — integritetskvittot håller hela
vägen, och raden "Träffprocenten oförändrad sedan den publicerade utgåvan"
stämmer mot den publicerade utgåvans `fabrik.statistik` ({52, 48} — oförändrad).

## 4. Juridik — REN (lagen 2007:528, utbildningsformen)

- **Inga köpsignal-formuleringar:** regex-genomlysning av titel+ingress+body
  (köp/sälj/rekommendera/"pekar på köp"/handelssignal/tidsrekommendation/bör du/
  prognos) → **0 träffar**. Texten beskriver METODENS historiska träffprocent,
  aldrig läget just nu.
- **Osäkerhetsmarkering enligt direktivet:** "ett öppet kvitto om det förflutna,
  aldrig en garanti om framtiden" (ingress + body), "Vad siffran är — och inte är",
  och varje procent redovisas med n — småurvalsdisiplinen genomgående.
- **Inga tickers eller bolagsnamn** i utkastet (kontrollerat mot rapportens 12
  tickers; de enda skenbara träffarna var "fundament*", "endast" m.m. — vanliga
  ord). Vågklasserna presenteras som mätningsklasser, inte som lägeskarta.
- **Disclaimer sist:** "Pedagogisk forskning — aldrig investeringsrådgivning
  (lagen 2007:528)" — kvarvarande sista rad även efter att kvittoavsnittet tas
  bort vid export. Endast 2007:528 nämns — inga blandade lagrum.

## 5. Kvalitet

- **Titel:** informativ (serie + månad + nyckeltal). Se fynd F1 om "(utkast)"-suffixet.
- **Disposition:** dom-protokollet först (så döms historiken) → tabellen per
  horisont/klass → "Vad siffran är — och inte är" → ändringslogg → fördjupning →
  kvitto (tas bort vid export) → disclaimer. Logisk och välskriven svensk.
- **Internlänkar 3/3 verifierade:** `/kurser/ts-10-ak1ts-25cellers-matris` finns
  som `sokvag` i `data/llms-fragor.json`; `/blogg/vagfundament-indikatorer-ar-tidsserier`
  finns som publicerad fil i `data/blogg/`; `/forskningsbiblioteket` finns som
  route i `src/app/(huvud)/`.
- **fabrik.kontroll** stämmer: 6 "##"-rubriker i hela bodyn (5 i mallen + kvittots
  rubrik), strukturfel 0, kontrolleraText 0 fel/0 varningar — bekräftade: mallen
  bär 5 rubriker ≥ 2, body ≥ 800 tecken, disclaimer sista rad ja (grinden släppte
  igenom kandidaten vid generering — ett avslag hade blockerat utkastet).

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| F1 | LÅG | Titeln bär "(utkast)" — stryks av exportvägen samtidigt som kvittoavsnittet tas bort (samma tvättklass som kvittot dokumenterar). | Exportvägens jobb, ej utkastets. Noterad. |
| F2 | LÅG | Utkastfilen lagrar urdragen med nyckelordning `{datum, varde, notering}` medan kandidatMd5 beräknades med kodens `{varde, datum, notering}` — en granskare som återskapar hashen ur utkastfilen ensam (utan källkod) får fel resultat. Denna granskning verifierade mot källkoden: kvittot ÄR korrekt. | Informativ för framtida granskare; ingen ändring. |
| F3 | LÅG | Bodyns "Ändringen sedan senaste publicerade utgåvan"-rad läser `data/blogg/vagkartan-traffprocent.json` (publicerade utgåvans statistik) — en fil som inte står i kvittots källista. Här verifierad: {52, 48} = aktuella tal, "oförändrad" korrekt. | Fabrikens design (versionsjämförelse, ej datakälla); noterad för framtida granskare när talet väl ändras. |

Inga HÖGA eller MEDELA fynd.

## Diff-rapport

**0 rättningar.** Utkast-JSON:en är lämnad byte-identisk — kandidatMd5 och mallMd5
reproduceras exakt (se § 3), så varje ändring från min sida skulle bara ha brutit
kvittot.

## Slutsats

**FLYTTKLAR.** Tre källor oförändrade, 52 %-påståendet och samtliga 7 urdrag
gröna på två oberoende beräkningsvägar, determinismkvitto reproducerat exakt
(tom. seed), juridiken ren (metodhistorik med osäkerhetsmarkering, inga köpsignaler,
inga tickers) och kvaliteten hög. När kunden beslutar publicera: exportvägen tar
bort "Granskningsunderlag"-avsnittet och "(utkast)" i titeln — därefter är
innehållet klart att leva som blogginlägg.
