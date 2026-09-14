# Granskning m9 — Utdelningar 101 september 2026

- **Utkast:** `data/blogg-utkast/m9-ko/utdelningar-101-v1.json` (m9-fabriken, version 1, status utkast)
- **Granskare:** m9-granskningsagent (agentfabriksomgång), 2026-09-14
- **Bedömning: FLYTTKLAR EFTER RÄTTNING** — 1 rättning (F1) gjord i utkast-JSON:en; därefter grönt i alla led.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen. "Flyttklar" betyder: innehållet håller
för export när kunden beslutar.

---

## 1. Källor — md5 mot aktuell fil

| Källa | Md5 i kvitto | Md5 i trädet | Utfall |
|---|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | `f4cee65860922e53ded546aefaf7ca02` | `f4cee65860922e53ded546aefaf7ca02` | MATCHAR — oförändrad |
| `data/varumarke.json` | `9b906e4204a759db24c2c78b4b332e18` | `9b906e4204a759db24c2c78b4b332e18` | MATCHAR — oförändrad |

Båda källorna är byte-identiska med det urdraget bygger på — inget värde behöver
härledas om.

## 2. Siffror — mekanisk verifiering (15/15 gröna)

Verifierade mot `bolagsunivers.json` (fcfYield = andel i källan; 0,227 = 22,7 %):

| Påstående i utkastet | Källvärde (egen beräkning) | Utfall |
|---|---|---|
| fcfYield mätt för 87 av 100 bolag | 87 rader med numeriskt `vardering.fcfYield` | STÄMMER |
| median 3 % | 3,01 % (mittersta av 87) → `pct()` → "3 %" | STÄMMER |
| 26 bolag över 5 % | `> 0,05` → 26 | STÄMMER |
| 28 mellan 2 och 5 % | `> 0,02 && ≤ 0,05` → 28 | STÄMMER |
| 33 under 2 % | `≤ 0,02` → 33 (inkl. negativa — se F1) | STÄMMER |
| 9 negativa | `< 0` → 9 | STÄMMER |
| återköp mätta 0/100 | `aterkop.senasteArMdr` numerisk i 0 rader | STÄMMER |
| insiderköp mätta 100/100 | `aterkop.insiderkopSenaste6man` numerisk i 100 rader | STÄMMER |
| WBD 22,7 % (kommunikation) | 22,7 % · bransch kommunikation | STÄMMER |
| INDU-C.ST 17,1 % (industri) | 17,1 % · industri | STÄMMER |
| TELIA.ST 11,9 % (kommunikation) | 11,9 % · kommunikation | STÄMMER |
| NHY.OL 10,8 % (material) | 10,8 % · material | STÄMMER |
| ERIC-B.ST 9,7 % (teknik) | 9,7 % · teknik | STÄMMER |
| underlag hämtat 2026-09-03 | `hamtat` = 2026-09-03 i samtliga rader | STÄMMER |
| räkneexempel: 4/10 kr = 40 % andel · 4/100 kr = 4 % direktavkastning | 4÷10 = 0,40 · 4÷100 = 0,04 (märkta "valda tal, inte ur underlaget") | STÄMMER |

- **n-mätta-kontroll:** 26 + 28 + 33 = 87 ✓ — där "under 2 %" (≤ 2 %, 33 st)
  innehåller de 9 negativa (0–2 % = 24 st). Utdragens notering "av 87 mätta"
  stämmer; se fynd F1 om löptextens formulering.
- **Topp-5-ordningen** (WBD → INDU → TELIA → NHY → ERIC) är korrekt fallande;
  noteringarnas branschetiketter stämmer alla fem. De tre följande i källan
  (STERV.HE 9,4 %, SHEL 8,4 %, VZ 8,4 %) redovisas inte — korrekt avgränsning.
- **Utdelningsutrymmesberäkningar:** serien gör två räkneexempel (båda
  verifierade ovan) + det begreppsliga taket (FCF-avkastning som övre band på
  hållbar direktavkastning) — enbart deskriptivt, inga per-bolagsutdelningar
  påhittade (källorna saknar fältet; texten redovisar luckan öppet).

## 3. Determinism — kvittot reproducerat PRE-edit

Skript speglar `raknaUtdelningsunderlag` + `montera` + `kandidatMd5` ur
`verktyg/m9-fabrik.mjs` (exakta predikat, `pct`/`median`-hjälpare, kodens
nyckelordningar i urdrag `{varde, datum, notering}` — filens
`{datum, varde, notering}` är endast lagringsordning, samma fynd-klass som
tidigare granskares F2). Ur källfilen + filens bodyMarkdown återskapades:

- **mallMd5 `4ba2f35bdcb2de23e2f0f4822407ac9c`: reproducerad exakt.**
- **kandidatMd5 `2b2cf3e53a5f4d1a9817fb4ed7de8d01`: reproducerad exakt.**
- Urdragen i filen ≡ kodens urdrag (efter nyckelordningsjustering) ✓.

Slutsats: utkastet var **oekkat sedan generering** när granskningen inleddes.
F1-rättningen bryter naturligt nog hasharna; nya post-edit-värden (framräknade
med samma metod på den rättade filen): **mallMd5 `e1450a5e2d1b2eb158198b877d298723`
· kandidatMd5 `7293885e372d5b87fed3bce04ff683a9`**. Rättelsens grund är den
oberoende talverifieringen i § 2 — inte hashen.

## 4. Juristgranskning — REN (lagen 2007:528, utbildningsformen)

- **Ingen rådgivningsformulering:** genomgående "så räknar du"-form. Låsningen
  är uttrycklig på de känsliga ställena: "listan är en sortering av data, ingen
  värdering", "Ett utrymme är inte ett löfte", "en fråga att ställa, inte ett
  svar", "avgörs per bolag i den manuella analysen".
- **Bolagsnamn förekommer** (WBD, Industrivärden, Telia, Norsk Hydro, Ericsson)
  men ENBART deskriptivt (högst mätta FCF-avkastningen i källan) — ingen
  "bra utdelningsaktie att köpa"-ton nånstans; texten varnar tvärtom för att
  hög direktavkastning ofta speglar marknadens osäkerhet.
- **Skatt/regler:** nämns inte alls (texten talar om kassabehållning/skuld som
  finansieringspedagogik, inte skatteregler) — därmed noll risk för skatteråd.
- **Lagrum:** endast 2007:528, i disclaimern, korrekt använt — inga blandade
  lagrum.
- **kontrolleraText-spegeln** (varumarke.json `forbjudnaFraser`) körd på den
  RÄTTADE mall-bodyn och hela bodyn: **FEL 0 · VARNINGAR 0** — rättningen
  introducerade ingen förbjuden fras.

## 5. Kvalitet

- **Titel:** informativ (serie + månad + vinkel). Se F2 om "(utkast)"-suffixet.
- **Disposition:** ingress → begreppen (utdelningsandel, direktavkastning) →
  taket (FCF) → ärlighetsredovisning av källbristen → ändringslogg (första
  utgåvan — korrekt deklarerat) → fördjupning → kvitto (tas bort vid export) →
  disclaimer. Logisk och välskriven svensk.
- **Internlänkar 3/3 verifierade:** `/kurser/km-063-direktavkastning`,
  `/kurser/km-064-utdelningstillvaxt`, `/kurser/km-005-eget-kapital-utdelningar`
  finns alla i `src/lib/ak1a/deep-courses-data.ts`.
- **Disclaimer sist:** ja — och förblir sista raden även efter att
  kvittoavsnittet tas bort vid export.
- **fabrik.kontroll** stämmer: 7 "##"-rubriker i hela bodyn (6 i mallen +
  kvittots rubrik — konsistent med kvittots egen "6 i mallen"), strukturFel 0,
  kontrolleraText 0/0 — bekräftat av mina mätningar även post-edit.

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| F1 | MEDEL | Löptextens fördelning "26 bolag över 5 %, 28 mellan 2 och 5 %, 33 under 2 % och 9 negativa" presenterar överlappande kategorier som vore de uteslutande — skenbar summa 96 ≠ 87 mätta. Källan: fabrikens `fyUnderTva` = ≤ 2 % (33 st) **inkluderar** de 9 negativa (rent 0–2 % är 24 st). | **RÄTTAD** i utkast-JSON:en → "33 under 2 % — varav 9 negativa". Summan blir synligt korrekt: 26 + 28 + 33 = 87. |
| F2 | LÅG | Titeln bär "(utkast)" — ska strykas av exportvägen samtidigt som kvittoavsnittet tas bort (samma tvättklass som tidigare granskningar konstaterat). | Exportvägens jobb, ej utkastets. Noterad. |
| F3 | LÅG | Bristen i F1 lever i **källkoden**: `verktyg/m9-fabrik.mjs` (`byggUtdelningar`, "Taket"-stycket) fogar `${fyUnderTva} under 2 % och ${fyNegativa} negativa` — nästa generering återintroducerar tvetydigheten. | Huvudagenten äger fabrikkoden (utanför denna granskings filägarskap): föreslås "— varav ${fyNegativa} negativa" i mallen vid nästa fabriksrörelse. |
| F4 | INFO | kandidatMd5/mallMd5 i kvitto-avsnittet avser pre-granskningsläget och gäller inte den rättade filen. | Dokumenterad här med nya post-edit-värden (§ 3). Ingen åtgärd i filen — kvittot är maskinens ordagranna utdrag och ska spegla genereringen. |

Inga HÖGA fynd.

## Diff-rapport

**1 rättning** i `data/blogg-utkast/m9-ko/utdelningar-101-v1.json`, fältet
`bodyMarkdown` (löptexten i sektionen "Taket: utdelningar betalas med kassa"):

```diff
- …28 mellan 2 och 5 %, 33 under 2 % och 9 negativa. Högst FCF-avkastning: …
+ …28 mellan 2 och 5 %, 33 under 2 % — varav 9 negativa. Högst FCF-avkastning: …
```

Ingen annan ändring: `status` ("utkast"), `titel`, `ingress`, hela
`fabrik`-blocket (seed, urdrag, källor, kontroll, kvitthashar) orörda.
Post-edit-kontroller: JSON giltig · kontrolleraText FEL 0/VARNINGAR 0 ·
7 "##"-rubriker · disclaimer sista raden · gammal formulering borta.

## Slutsats

**FLYTTKLAR EFTER RÄTTNING.** Källor oförändrade (md5 ✓), 15/15
sifferkontroller gröna, determinismkvitto reproducerat exakt pre-edit,
juristgranskningen ren (utbildningsform, inga råd, inga blandade lagrum) och
kvaliteten hög. F1:s kategorioverlapp är rättat till "varav"-form; när kunden
beslutar publicera tar exportvägen bort "Granskningsunderlag"-avsnittet och
"(utkast)" i titeln — därefter är innehållet klart att leva som blogginlägg.
