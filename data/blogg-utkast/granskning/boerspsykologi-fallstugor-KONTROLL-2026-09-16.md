# KONTROLL-GRANSKNING 2026-09-16 — Börspsykologi: fallstugor september 2026 (m9-utkast #1)

**Objekt:** `data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json` (m9-fabriken, version 1, status utkast — series första rad i kön: först i `m9-ko/index.json` både i `slugar`-ordning och tidsordning)
**Granskad av:** fabrik auto-s1-u1 (agentfabrik auto-s1-1789513505701), 2026-09-16
**Bedömning: FLYTTKLAR — 0 rättningar, 0 nya fynd.** Tillsammans med
`boerspsykologi-fallstugor.md` (2026-09-14) är paketet nu komplett: rapport +
maskinell diff-rapport (`boerspsykologi-fallstugor-diff.json`, denna våg).

**Rollfördelning:** 09-14-rapporten (annan agent) är huvudgranskningen och
består — denna kontroll är (a) ett oberoende återintag med 2026-09-15-standarden
som saknades när m9-serien granskades (mekanisk juridikgrind, 911-sökning,
HTTP-länkverifiering, maskinell diff-fil) och (b) en aktualiseringskontroll:
källor, kursregister och sajten har rört sig sedan 09-14 (kursregistret
343→352, nya granskningsvågor) — utkastets tal och länkar har mätts mot
dagens läge, inte mot 09-14:s.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen.

---

## 1. Källor — md5 mot aktuellt träd (2026-09-16)

| Källa | Md5 i kvitto | Md5 i trädet | Dom |
|---|---|---|---|
| `data/rapporter/vagvalidering-SENASTE.json` | `42970c1a777eefe45791ad8839eae282` | `42970c1a777eefe45791ad8839eae282` | ✓ oförändrad (filer mtime 09-10) |
| `data/varumarke.json` | `9b906e4204a759db24c2c78b4b332e18` | `9b906e4204a759db24c2c78b4b332e18` | ✓ oförändrad |

Båda källorna fortfarande byte-identiska med kvittot — inget värde i utkastet
är föråldrat mot sin källa.

## 2. Siffror — mekanisk verifiering

**Skript `​.zcode/granskning-m9-verify.mjs` (omkörd 2026-09-16 av denna
granskning): 28 OK, 0 FEL.** Egna kompletterande node-sonder (2026-09-16):

| Påstående i utkastet | Källvärde (vagvalidering-SENASTE.json) | Dom |
|---|---|---|
| totalt 52 % träff, n=48 dömda, osatta 20 % | `totalt {52, 48, 20}` | ✓ |
| kort/impulsvåg 100 % på n=2 | `{kort, impulsvåg, 100, 2}` | ✓ |
| medellång basbygge 0 % (6 dömda) | `{medellång, basbygge, 0, 6}` | ✓ |
| mega basbygge 0 % (6 dömda) → 0/12 | `{mega, basbygge, 0, 6}` | ✓ |
| impulsvåg medellång 100 % (n=6) | `perHorisontKlass` | ✓ |
| impulsvåg mega 100 % (n=6) | `perHorisontKlass` | ✓ |
| räknare sedan 2026-09-04 | `rullandeSedan = "2026-09-04"` | ✓ |
| 12 tickers | `universumAntal = 12` | ✓ |
| tröskel ± 6 % ("motorns egen tröskel, hedervärd symmetri") | `domProtokollText` innehåller "|momentum| ≤ 6 %" | ✓ |
| dom-protokollet citerat ordagrant | stränglikhet EXAKT (`citat === kalla: true`, egen sond — inte ögonmått) | ✓ |
| n-konsistens | Σ nDomda per cell = 48 = `totalt.nDomda`; celler med n>0 = 8 | ✓ |
| totalträff rekonstruerad | 25/48 = 52,1 % ≈ 52 % | ✓ |
| P(2/2 \| slant) = 25 % | 0,5² = 25 % | ✓ |
| P(0/12 \| slant) ≈ 0,02 % | 0,5¹² ≈ 0,024 % | ✓ |
| tumregel 3/n, n=2 → 150 % ("ingen begränsning alls") | 3/2 = 150 % | ✓ |

## 3. Juridik — lagen (2007:528): REN, mekaniskt bevisad

- `verktyg/juridikgrind-vakt.mjs` körd 2026-09-16 (denna granskning):
  **0 FEL, 0 fynd på denna fil** — rådsförbud, grund (utbildnings-disclaimer)
  och tvärfall alla gröna; filen är i vaktens skannade yta (m9-ko/*-v*.json).
- Utbildningsramen genomgående: ingressen "utbildning, aldrig rådgivning" +
  disclaimern som sista rad i bodyn: "Pedagogisk forskning — aldrig
  investeringsrådgivning (lagen 2007:528)".
- **Inga tickers eller bolagsnamn i texten** (fallstudierna är anonymiserade
  vågklass/horisont-cellfall) — den renaste möjliga utbildningsformen.
- Endast lagrummet 2007:528 nämns — ingen lagrumsblandning.

## 4. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA utkastfilen (body + metadata, JSON som sträng) efter
sex mönster: "911", "11 september", "september 2001", "9/11", "terror",
"Terrordåd" → **0 träffar**. Inget att åtgärda. (Kontrollen saknades i
09-14-rapporten — därmed är även denna metodpunkt nu dokumenterad för
m9-utkast #1.)

## 5. Länkar — 3/3 HTTP 200 mot levande sajten (2026-09-16)

| Länk | Dom |
|---|---|
| `/kurser/km-019-bekraftelsefalla` | 200 |
| `/kurser/km-036-overconfidence` | 200 |
| `/blogg/mr-market-psykologi-svenska-borsen` | 200 |

09-14 verifierade mot filnärvaro; denna våg verifierar mot `localhost:3000`
(loopback) — starkare bevis eftersom kursregistret vuxit 343→352 sedan dess
och länkarna fortfarande lever.

## 6. Determinism — kvittot åter verifierat (2026-09-16)

`​.zcode/granskning-m9-rekonstruera.mjs` omkörd: body rekonstruerad
**byte-identisk, 4 995 tecken**; `mallMd5 fc608a6d…` och
`kandidatMd5 b90e7b95…` reproduceras exakt — utkastet **oekkat sedan
generering**. (Skriptets "URDRAG match: false" är känt 09-14-fynd F2 —
nyckelordningen i filens urdrag avviker från kodens hashordning; informativt,
inget fel i utkastet.)

**Konsekvens för diff-rapporten:** poster-listan är TOM med avsikt — varje
manuell ändring av utkast-JSON:en skulle bryta determinismkvittot. Rättningar
på m9-seriens innehåll går via `verktyg/m9-fabrik.mjs` (regenerering med nytt
kvitto) eller exportvägen (som redan stryker "(utkast)" i titeln och
kvittoavsnittet i bodyn).

## 7. Struktur

7 "##"-rubriker (krav ≥ 2) ✓ · body 4 995 tecken (krav ≥ 800) ✓ · disclaimer
sista rad ✓ · stämmer mot `fabrik.kontroll` i filen ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | 0 nya fynd. 09-14:s F1–F3 består (titelprefix hanteras av exportvägen; urdrags-nyckelordning informativ; fallback träder aldrig in). | Ingen |

## Flagga till sammanställningsägaren (ej min fil)

`GRANSKNINGSKO-SAMMANSTALLNING.md` (kön kunden ser, uppdaterad 09-15) saknar
helt m9-serien — de sex flyttklara månadsutkasten redovisas bara i
`granskning/SAMMANSTALLNING-2026-09-14.md`. Samma flagga-familj som s1-u3:s
"saknar 3 av 5 branschguider". M9-raderna (med diff-status) hör hemma i
aktuell sammanställning — huvudagentens/domänavägarens beslut.

## Diff-rapport

**0 poster.** `boerspsykologi-fallstugor-diff.json` (denna våg) — maskinellt
läsbart kvitto: bedömning FLYTTKLAR, tom poster-lista med motivering
(determinismkvitto, se § 6).

## Slutsats

**FLYTTKLAR — m9-utkast #1:s paket är komplett.** Källor oförändrade,
28/28 siffror + 15 kompletterande kontroller gröna, juridiken mekaniskt ren
(2007:528), 911-kontroll 0, länkar 3/200/3 verifierade mot levande sajten,
determinismkvittot reproducerat 2026-09-16. När kunden beslutar publicera
(R2): exportvägen tar bort kvittoavsnittet och "(utkast)" i titeln — därefter
är innehållet klart som blogginlägg.
