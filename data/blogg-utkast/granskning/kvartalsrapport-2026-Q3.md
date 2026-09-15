# Granskning — Kvartalsrapport 2026:3: vågmotorns öppna kvitto

- **Utkast:** `data/blogg-utkast/kvartalsrapport-2026-Q3.md` (generator `verktyg/kvartalsrapport.mjs`, utkast v1, genererad 2026-09-11)
- **Granskare:** agentfabrik auto-s1 uppgift s1-u1 (spår 1 — granskningskön), 2026-09-15
- **Bedömning: FLYTTKLAR EFTER RÄTTNING** — 1 saklig rättning (datumfel i sektion 5) + 3 rekommenderade förbättringar. Diff bifogad i `granskning/kvartalsrapport-2026-Q3.diff` (`git apply --check` körd och godkänd vid granskningstillfället).

**Objektval:** spårets 6 m9-utkast och 8 SEO-guider granskades redan av våg 151
(14/14 flyttklara, se `SAMMANSTALLNING-2026-09-14.md`) — detta var spårets nästa
ej levererade objekt enligt `GRANSKNINGSKO-SAMMANSTALLNING.md` ("UTKAST v1 … väntar").

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör inte originalet. Som granskare levereras rapport + diff;
rättningen verkställs av filens ägare (regenerering) eller vid exportbeslut.

---

## 1. Källor — existens, md5 och snapshot-fräschhet

| Källa | Finns | Md5 (2026-09-15) | Kommentar |
|---|---|---|---|
| `data/rapporter/vagvalidering-SENASTE.json` | ja | `42970c1a777eefe45791ad8839eae282` | spegel av 2026-09-04-ronden — oförändrad sedan utkastet skrevs |
| `data/portfolj-system/regime-logg.json` | ja | `b930090940ac9578a86ee69e8a2161eb` | 1 rad (2026-09-03) — oförändrad |
| `data/portfolj-system/prediktionslogg-akm3.json` | **nej** | — | utkastets eget påstående "finns ännu inte" är VERIFIERAT SANT |
| `data/portfolj-system/kalibrering-logg.json` | ja | `e794db02812d8b7699539cfca5e68ae8` | 1 mätning (2026-09-04) — oförändrad |
| `data/rapporter/kvalitetsrapport-SENASTE.md` | ja | `cfdf14eabb70b03234e961f3a7bfd5fc` | bär nu en **2026-09-10**-rapport (win32/arbetsstation) — äldre än det datum utkastet citerar, se fynd F1 |

Utkastets md5 vid granskning: `03d1b05f77b637569537680e51a4bd25` (orört sedan generering).

**Snapshot-fräschhet:** fyra av fem källor har inte rört sig sedan utkastet
genererades 2026-09-11 — siffrorna är fortfarande källkorrekta. Undantaget är
kvalitetsrapporten (F1 nedan). Observera att Q3 slutar 2026-09-30: publiceras
rapporten efter att nya vågronder eller kalibreringsmätningar lagts till bör
generatorn köras en gång till innan export (utkastets sektion 6 lovar just det).

## 2. Siffror — samtliga påståenden mot källorna

### 2.1 Vågvalidering (spegel-JSON)

| Påstående i utkastet | Källvärde | Utfall |
|---|---|---|
| 1 rond med domslut, domdatum 2026-09-04 | `domdatum: 2026-09-04` | STÄMMER |
| räknarna startade 2026-09-04 | `rullandeSedan: 2026-09-04` | STÄMMER |
| historikV1 tom — tidigare körningar kan inte räknas ihop | `historikV1: null` | STÄMMER |
| universum 12 tickers, namnges aldrig | `universumAntal: 12` | STÄMMER |
| 48 mätningar kunde dömas | `totalt.nDomda: 48` | STÄMMER |
| 20 % osatta (osatta räknas aldrig som fel) | `osattAndelProcent: 20` | STÄMMER (formuleringen — se F2) |
| total träffbild 52 % (n=48) | `totalt.traffProcent: 52` | STÄMMER |
| tabell mikro: impulsvåg 75 % (n=4), basbygge 63 % (n=8) | `75/4`, `63/8` | STÄMMER |
| tabell kort: impulsvåg 100 % (n=2), basbygge 30 % (n=10) | `100/2`, `30/10` | STÄMMER |
| tabell medellång: impulsvåg 100 % (n=6), basbygge 0 % (n=6) | `100/6`, `0/6` | STÄMMER |
| tabell lång: alla celler streck (n=0) | `null/0` i samtliga | STÄMMER |
| tabell mega: impulsvåg 100 % (n=6), basbygge 0 % (n=6) | `100/6`, `0/6` | STÄMMER |
| korrigering n=0 i alla horisonter | `null/0` i samtliga | STÄMMER |
| 8 celler med dömt underlag; spridning 2–10 mätningar per cell | 8 rader med n>0; min 2, max 10 | STÄMMER |

Konsistenskontroller (egna omräkningar): cellernas n summerar till 48
(4+8+2+10+6+6+6+6) = totalradens nDomda ✓. Kvartilernas cellvärden är
{75, 63, 100, 30, 100, 0, 100, 0}; sorterat {0, 0, 30, 63, 75, 100, 100, 100}
ger **median 69** ✓ och med linjär interpolering (inkluderande metod, Excels
QUARTILE/NumPy "linear") **Q1 = 22,5** ✓ och **Q3 = 100** ✓ — alla tre
kvartilvärdena i utkastet är reproducerade. Andra kvartildefinitioner ger andra
värden, vilket utkastet inte säger — se F3.

### 2.2 Regime (regime-logg.json)

| Påstående | Källvärde | Utfall |
|---|---|---|
| 1 regimehändelse, varav 1 regimbyte | 1 rad, `byte: true` | STÄMMER |
| laget magert | `regime: "magert"` | STÄMMER |
| senaste mätning 2026-09-03 | `datum: 2026-09-03` | STÄMMER |
| grön andel 7 %, röd andel 17 % | `0.07` / `0.17` | STÄMMER |
| netto-vågbredd osatt (vagscan ej läsbart) | `nettoVagbredd: null` + nOsattOrsak | STÄMMER |
| loggcitat (stycket i kursiv) | ordagrant identiskt med `beskrivning` | STÄMMER |

### 2.3 Prediktionsloggen

Påståendet "finns ännu inte i trädet … raden lämnas ärligt tom" — verifierat:
filen saknas. Ärlighetspåståendet i sig är sant. STÄMMER.

### 2.4 Kalibrering (kalibrering-logg.json)

| Påstående | Källvärde | Utfall |
|---|---|---|
| 1 mätning i kvartalet (2026-09-04, månad 2026-09) | 1 rad, `datum/manad` | STÄMMER |
| grind LÅST, ΔΦ = 0 | `grindLasad: true`, `deltaPhi: 0` | STÄMMER |
| 0 episoder, 0 domrader, clean-start 2026-09-04 | `episoderTotalt: 0`, `domRader: 0`, `cleanFran` | STÄMMER |
| ρ̄ = 0,45 med källangivelse "fallback (för få par: 0)" | `rho: 0.45`, `rhoKalla` | STÄMMER |
| cirka 2,2 effektiva observationer per dag | `effektivaPerDag: 2.2` | STÄMMER (formuleringen — se F4) |
| 6 faser vantar-grind; krav n_eff ≥ 20 | 6 faser, alla `vantar-grind`, villkor `nEff20` | STÄMMER |
| Φ-förslag enbart framtida kandidater | `phiForslag` finns men grinden låst | STÄMMER |

Observandum (ej blockerande): värdet 2,2 finns i källan och citeras korrekt;
generatorns interna härledning av fältet `effektivaPerDag` är utanför detta
dokuments granskning (det är motorns eget fält, inte kvartalsrapportens tal).

### 2.5 Kvalitetsvakten (kvalitetsrapport-SENASTE.md)

| Påstående | Källvärde | Utfall |
|---|---|---|
| senaste rapporten genererad **2026-09-11** | rapporten är daterad **2026-09-10** (2026-09-10T13:42:25Z) | **STÄMMER EJ — fynd F1** |
| status GRÖN, 0 fel, 4 poster för manuell granskning | `STATUS: GRÖN`, 0 fel, 4 manuella | STÄMMER |
| motorvalidering 107 PASS / 0 FAIL / 0 SKIP | `107 PASS / 0 FAIL / 0 SKIP` | STÄMMER |

## 3. Juridik — lagen (2007:528), juridikgrinden

- **Rekommendationsverb-sökning** (köp/sälj/rekommendera/bör du/bra affär):
  **0 träffar** i hela texten. Ren.
- **Disclaimer närvarande och korrekt:** sista raden — "pedagogisk utbildning,
  inte investeringsrådgivning (lagen 2007:528). Inga bolagsrekommendationer
  lämnas." Rätt lagrum för rätt fråga.
- **Bolag namnges aldrig** — universumet beskrivs som "12 tickers (namnges aldrig
  här — det här är metodik, inte bolagsval)". Modellen för hinder mot rådgivning
  håller.
- **Icke-prognostiska formuleringar** genomgående och explicit: träffprocent är
  "ett kvitto på det förflutna — aldrig en garanti om framtiden" (twå gånger),
  regime är "ett lägesbeskrivande verktyg, inte en marknadstimingssignal",
  kalibreringen "kan inte och skall inte omvandla vågmotorn till en kursprognos".
- **Inga andra lagrum åberopas** (2022:260/2022:261/1985:716, GDPR, kakor) →
  ingen risk för lagrumsblandning i detta dokument.

**Juridisk bedömning: GODKÄND** — texten är konsekvent utbildningsformulerad.

## 4. Datum- och "911"-referenser

Texten innehåller inga referenser till 11 september som händelse. Samtliga fem
datumpåståenden kontrollerade: 2026-09-03 (regime) ✓, 2026-09-04 (domdatum,
clean-start, kalibreringsmätning) ✓, 2026-09-11 (kvalitetsrapporten) ✗ → F1.
Frontmatter `publishedAt: 2026-09-11` är utkastets genereringsdatum — ska
hållas öppen och sättas först vid ett publiceringsbeslut (R2), vilket utkastets
egen HTML-kommentar också anger (konvertering till BlogPost-JSON i `data/blogg/`).

## 5. Fynd och rättningar

| # | Typ | Allvarlighet | Fynd | Rättning (i diffen) |
|---|---|---|---|---|
| F1 | sakligt — datum | **mellan** (enda faktafelet) | Sektion 5: "genererad 2026-09-11" — källan bär 2026-09-10. Rot: kvalitetsrapport-SENASTE.md har EFTER utkastets generering skrivits över av en äldre rapport från arbetsstationen (win32); generatorn läste rätt vid tillfället (verktyg/kvartalsrapport.mjs rad 100 läser `- **Genererad:**`-raden). | "2026-09-11" → "2026-09-10" |
| F2 | språk | låg | "20 % höll klassen osatt" är otydligt (det är andelen mätningar som lämnades osatta, inte något som "hölls") | "och 20 % av mätningarna lämnades osatta" |
| F3 | metod | låg | Kvartilvärdena redovisas utan metod; Q1 22,5 % gäller only med linjär interpolering (inkluderande) | fotnot efter kvartilstycket |
| F4 | språk | låg | "2,2 effektiva observationer per dag — dagar räknas aldrig som observationer" läses som självmotsägelse | omformulering som klargör att källfältet är `effektivaPerDag` men att episoder är observationsenheten |

**Diff:** `data/blogg-utkast/granskning/kvartalsrapport-2026-Q3.diff` — fyra
hunkar (F1, F2, F3, F4), verifierad med `git apply --check` mot originalet vid
granskningstillfället (utgång = godkännande; inget applicerats — originalet är
orört, md5 oförändrat).

**Driftobservation att eskalera till huvudagenten (utanför denna granskares
filägarskap):** kvalitetsvaktens SENASTE-rapport är från 2026-09-10 och bär
win32-signatur — serverns dagliga cron (07:00 UTC) har alltså inte levererat på
fyra dygn, och en äldre arbestationsrapport ligger nu överst. Det är samma rot
som F1 och bör diagnostiseras i vaktsystemet, inte rättas i detta utkast.

## 6. Flyttklart paket — steg vid kundens publiceringsbeslut (R2)

1. Verkställ F1 (applicera diffen) ELLER — ännu hellre, eftersom dokumentet är
   automatgenererat — kör `node verktyg/kvartalsrapport.mjs` en gång till; den
   läser då aktuell källa och självrättar datumet (F2–F4 följer med diffen om
   generatorns text inte justeras).
2. Kontrollera att inga källor rört sig (Q3 slutar 2026-09-30): vågvalideringens
   domdatum, kalibreringens månad och kvalitetsrapportens datum ska vara
   aktuella vid exporttidpunkten.
3. Konvertera till BlogPost-JSON i `data/blogg/` enligt utkastets egen
   HTML-kommentar; sätt `publishedAt` då.
4. Uppdatera raden i `GRANSKNINGSKO-SAMMANSTALLNING.md` ( kön-ägarens fil —
   inte denna granskares).

---

_Kvitto: granskad av agentfabrik auto-s1 / s1-u1 2026-09-15. Källornas md5 och
utkastets md5 redovisade i sektion 1. Bedömning: FLYTTKLAR EFTER RÄTTNING (F1
nödvändig, F2–F4 rekommenderade). Publicering = kundens beslut (R2)._
