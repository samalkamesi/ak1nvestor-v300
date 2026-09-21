# DR-ÖVNING 2026-09-21 KVÄLL — BLAD 11:S KVÄLLSPUNKT + RPO-KVÄLLSMÄTNING + KANONISK APP-BLADVERIFIKATION (spår 10, s10-u2, vakt 2/3)

**Manifest:** auto-s10-1790010927032 (omgång 19:18) · **Agent:** s10-u2 ·
**Fönster:** 19:2x–19:2x lokal (huvudkörning tog DR-flocken 19:20:30.078 —
164 ms efter syskonets fönsterslut, korsbevisat i båda riktningarna).
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG." Anspråk disk-först ~19:20 med P1–P12 låsta FÖRE
mätning (data/vakten/s10u2-kvallsdr-blad11-2026-09-21-ansprak.md).

## 1. Valet och kollisionskartan

Duplikatkontroll (worklog + data/forskning + kölistan i NATT-BLAD11 §10):
natten levererade blad 11:s födelsebevis + RPO-nattpunkt + app-blad ×3;
kvällens syskon s10-u1 tog (19:18, disk-först) KEDJA 2-kväll för 09-21 —
deras flock-fönster höll DR-låset när jag anlände; mitt verktyg flock-köade
enligt kontrakt. **Mitt val — tre disjunkta objekt:**
1. KVÄLLSPUNKT BLAD 11 (kedja 1-restore @ ~17 h åldring — seriens faspunkt;
   blad 10 har dagpunkt, blad 11 saknade kvällspunkt),
2. RPO-DIFF @ ~16,9 h (kvällspunkt på RPO-kurvan; natten mätte +19 784 @ 23,7 h),
3. SIDO: köpost 3 — kanoniska kommandot på app-bladet (AUTO-6-mönstret hos
   en efterföljare, inga /tmp-omvägar).

## 2. Huvudövning — kvällspunkt blad 11 (DR-PROV-2026-09-21-AUTO-7.md)

`node verktyg/dr-ovning.mjs` (OMODIFIERAT) · grind 1 521 MB / 50 GB ·
markörkontroll GRÖN på 11,9 s: **1 387 527 rader · CREATE 99 · COPY 101** —
EXAKT oförändrat sedan födelsen 02:30 (bladets integritet på disk bevisad
ännu en dag; inget bit-rot).

| Kontrakt | Inatt 02:5x | Denna (kväll) | Dom |
|---|---|---|---|
| public | 60 / 1 365 519 | **60 / 1 365 519** | EXAKT |
| public+storage | 68 / 1 365 655 | **68 / 1 365 655** | EXAKT |
| alla scheman | 99 / 1 365 915 | **99 / 1 365 915** | EXAKT |
| board_decisions | 50 882 | **50 882** | EXAKT |
| section_data_snapshots | 1 271 388 | **1 271 388** | EXAKT |
| organ_health_logs | 3 120 | **3 120** | EXAKT |
| fel kända/okända | 788 / 0 | **788 / 0** | EXAKT |
| **RTO** | 11,8 s | **36,9 s** | **3,1× — FYND F2** |

**FYND F2 (bärande) — RTO är FASBEROENDE, ~3× under kvälls-/fabrikslast.**
Tre oberoende instrument samma kväll, samma rot (load 6,48 · fabrikens 3
barn · 5,4 GB swap · kall cache):

| Instrument | Nattreferens | Kväll | Faktor |
|---|---|---|---|
| kedja 2 (syskonet s10-u1) | 34,3 s | 104,5 s | 3,0× |
| kedja 1 blad 11 (denna) | 11,8 s | **36,9 s** | **3,1×** |
| app-blad (denna, §4) | 22,6 s | 60,1 s | 2,7× |
| kedja 5 kirurgi (syskonet s10-u3, 19:21–19:25) | ~12 s | 34,9 s | ~3× |

Konsekvens (utökar syskonets F1-utbyggnad): DR-beredskapens RTO-budget
skall räknas i **värsta fas** (≈3× nattbandet), och kvartalsövningen
≤2026-12-21 kräver tom fabrik för RAM OCH RTO-band. 36,9 s är fortfarande
väl inom kundbehovet (minutklassen) — fyndet är budgetdisk, ej larm.

## 3. RPO-diff @ 16,9 h (DR-RPO-DIFF-2026-09-21-KVALL.json)

Blad 1 365 519 → levande **1 385 106** = **+19 587 oskyddade rader** sedan
02:30. Fyra tabeller i rörelse (av 60):

| Tabell | Blad | Levande 19:21 | Delta |
|---|---|---|---|
| section_data_snapshots | 1 271 388 | 1 290 372 | **+18 984 EXAKT = nästa pumpbatch** |
| board_decisions | 50 882 | 51 418 | +536 (5,6 burstar à 96) |
| organ_health_logs | 3 120 | 3 156 | +36 (+2/h håller) |
| forecast_outcomes | 237 | 268 | +31 (**FYND F5**: 4:e rörtabellen — tidigare RPO-protokoll redovisade 3) |

Non-batch-delta: +603 (board 536 + organ 36 + forecast 31) — den kontinuer-
liga driften ≈ 36 r/h. **FYND F3 — pumpens landningspunkt 3 (köpost 4 i
NATT-BLAD11 §10 STÄNGD):** blad 12:s batch (+18 984, storleken deterministisk
tredje dagen) landade mellan 02:30 och 17:21 — serien: blad 10-batch
04:39–10:40 · blad 11-batch före 02:12 · blad 12-batch före 17:21. Dom:
**batchstorleken deterministisk, landningstiden ej — fönstret ≥ 15 h brett
(natt→eftermiddag); pumpen är inte nattbunden.** RPO-tolkning: vid katastrof
kl ~19 var snapshots-exponeringen en HEL batch — men kedjan är skyddad av
app-bladet 02:50 + moln-JSON 02:40 (tre kolumner, skyddsmatrisen 09-20).

**FYND F4 — blad 12-prediktionens levande förankring ikväll:** board
51 418 @ 19:21 + ~2,4 återstående burstar ≈ 51 648 vs formulens 51 650;
public 1 385 106 levande vs formulens 1 385 319 — inom 213 rader REDAN vid
19:21. Formelns åttonde test (09-22 02:30) är väl förankrat.

## 4. Sido — kanonisk app-bladverifikation (DR-PROV-2026-09-21-AUTO-8.md)

Köpost 3: "efterföljare kontrollerar att AUTO-6-mönstret håller (app-blad
via kanoniskt kommando, inga /tmp-omvägar)". `node verktyg/dr-ovning.mjs
--fil db-app-2026-09-21.sql.gz` (bart namn resolverades mot dumpkatalogen —
O9-kuren verkade; grind 2 964 MB) · markör GRÖN 61,2 s: **2 289 971 rader ·
CREATE 418 · COPY 420** · restore RTO 60,1 s · **radkontrakt EXAKT som
AUTO-6**: public 372/183 326 · +storage 380/184 671 · alla 417/186 499 ·
fel 2 611 kända/0 okända. **Köpost 3 STÄNGD: mönstret håller — app-bladet
är ett rutinkommando, citeringskuren bär i trädet.** RTO 60,1 s = 2,7×
nattens (tredje belägget i F2-matrisen).

## 5. Städning lokal PG (orderns fjärde steg — oberoende eftermätt)

- **pg_lsclusters 17/main down** · psql-socketvägran mot BÅDA skrap-DB:arna
  (ak1a_dr_test + syskonets ak1a_dr_json — bådas frånvaro bevisad).
- DR-lås: flock-viloläge (pid-rad 562330, processen död — kärnans flock
  släpper vid processdöd; dokumenterat oskyldigt).
- /tmp enligt mall: felloggar blad+pid+ms —
  `dr-ovning-fel-blad-2026-09-21-p561547-1790011245852.log` (blad 11) ·
  `dr-ovning-fel-blad-app-2026-09-21-p562330-1790011544214.log` (app) —
  bevis kvarlämnade, inga kollisioner.
- Eftermätning: RAM 3 804 MB · disk 50 G ledigt · data/backups ENDAST LÄST
  (inga skrivningar; restores gick via zcat-rör).

## 6. Prediktionernas dom — 8/12 hela + 1 halv, ärligt bokförd

✅ P1 markör 1 387 527/99/101 EXAKT · P2 public 60/1 365 519 EXAKT ·
P3 board 50 882 EXAKT · P4 snapshots 1 271 388 EXAKT · P5 organ 3 120 EXAKT ·
P6 fel 788/0 EXAKT · P8 board levande 51 418 ∈ [51 300, 51 500] ·
P12 städning grön. ❌ P7 RTO 36,9 ∉ [11,22] (F2 — bandet satt efter
nattfas; nya fasband krävs) · P9 snapshots 1 290 372 ∉ [1 271 388,
1 273 000] (F3 — batchen landade före 17:21, min "nästa batch = 09-22"-
modell fel) · P10 totalt +19 587 ∉ [400, 900] (samma rot; non-batch
+603 ∈ band ✅) · P11 halv: kontrakt EXAKT ✅ men RTO 60,1 ∉ [19,30] (F2).
Mönstret: radkontrakt 100 % (determinismen oantastlig), tids-/batch-band
fel av ETT systemiskt skäl (fas- och landningsmodellerna omogna) — nästa
pass låser band per fas.

## 7. KVD

- src/ orörd = **INGET bygge** (inga kodändringar alls; dr-ovning.mjs +
  dr-rpo-diff.mjs KÖRDA omodifierade — citeringskurens trädversion är den
  som levererade AUTO-8-grönt). tsc ej aktuellt: ingen kod berörd.
- R2 orörd: .pgpass ENDAST PGPASSFILE-pekare · prod-DB ENDAST läst
  (COUNT) · inga priser/tier/publicering.
- GDPR: endast antal, tabellnamn, tider — inga personvärden.
- data/blogg/ orörd · data/backups ENDAST lästa · syskonytor orörda
  (s10-u1:s kedja-2-filer orörda; deras flock-fönster respekterat via
  verktygets egen kö).

## 8. Kö

1. Blad 12:s födelsebevis 09-22 02:30 — formeln förankrad (F4): board ≈
   51 650 · public ≈ 1 385 319 om modalt steg; säkringsrad: snapshots kan
   bära 1 290 372 (batchen redan landad) OM ingen ytterligare batch landar
   19:21→02:30 — annars 1 309 356.
2. Kurens dag-2-kvitto 09-22 02:50.
3. Kedja-2 blad 12 imorgon kväll (syskonets körad).
4. Oversättnings-stillastående: definitiv dom 10-01.
5. Kvartalsövning ≤ 2026-12-21 — TOM fabrik (F1 utökat: RAM + RTO-fasband).
6. Nytt från detta pass: RTO-fasbanden (natt ~12 s · kväll ~37 s för
   DB-blad) följs av nästa punkt innan de formaliseras i DRIFTSBOKEN.

SLUT — handprotokoll s10-u2 2026-09-21 ~19:2x lokal. Maskinella
delprotokoll: DR-PROV-2026-09-21-AUTO-7.md · DR-PROV-2026-09-21-AUTO-8.md ·
DR-RPO-DIFF-2026-09-21-KVALL.json.
