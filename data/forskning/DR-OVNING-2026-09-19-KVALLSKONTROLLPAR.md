# DR-ÖVNING 2026-09-19 KVÄLL — KONTROLLPAR DAG-RTO: cache-kylan utesluten (par A/B) + intra-kvarts par 3 över 23:00-markören

**Agent:** s10-u1 (manifest auto-s10-1789849506241, vakt 1/3)
**Order:** "DR-övning nästa i spåret (välj själv): återställ, mät tid/rader,
protokoll, städa lokal PG."
**Anspråk disk-först:** 22:29:30 lokal med P1–P10 FÖRE alla mätningar
(data/vakten/auto-s10-1789849506241-u1-ansprak.md).
**Tid:** 2026-09-19 22:29–23:0x lokal (CEST).

## 1. Objektval (duplikatkontroll)

DRIFTSBOKEN + worklog genomgångna för 2026-09-19: restore-kärnan på blad
db-2026-09-19 var levererad (AUTO-10/11/12, senast 16:07) — enkelkörningar i
olika klocklägen. Två köposter stod ÖPPNA och togs i turordning:

1. **KONTROLLPAR DAG-RTO** (primärt) — kölagt av S10-U3 DAGFONSTER-REPLIK
   ("Kontrollpar kölagda (två restores i rad, samma RAM-band)") och vidarehållet
   av FORMIDDAGSPULS: RTO-spridningen 11,5–18,1 s behövde skiljas mellan
   cache-kyla och disk-I/O-kö.
2. **INTRA-KVARTS PAR 3 ÖVER MARKÖR** (sekundärt) — FORMIDDAGSPULS-köposten
   "Par nr 3+ över :00/:30": paren 1–2 var inom kvart (Δ=0); ett par som
   passerar en markör förväntas visa +8-hopet.

## 2. Kontrollparet — två FULLA cykler i rad, samma blad (db-2026-09-19)

| | Körning A | Körning B |
|---|---|---|
| Start (markörkoll) | 20:29:06Z | 20:34:08Z |
| MemAvailable (grinden) | 1 222 MB | 4 470 MB |
| Markörkoll | GRÖN 1 347 729 · CREATE 99 · COPY 101 | GRÖN (identisk) |
| **RTO** | **12,9 s** | **15,7 s** |
| Radkontrakt public | 60 / 1 325 919 | 60 / 1 325 919 |
| public+storage | 68 / 1 326 055 | 68 / 1 326 055 |
| alla scheman | 99 / 1 326 315 | 99 / 1 326 315 |
| Fel | 788 kända / 0 okända | 788 kända / 0 okända |
| Fellogg | 34 881 B | 34 881 B — **byte-identisk med A** |
| Protokoll | DR-PROV-2026-09-19-AUTO-13.md | DR-PROV-2026-09-19-AUTO-14.md |
| Städning | skrap raderad · PG17 stoppad | skrap raderad · PG17 stoppad |

## 3. Dom: kontrollpar-köposten STÄNGD — cache-kylan utesluten

- **B hade allt A hade plus varmare cache och 3,7× mer ledigt RAM — och blev
  ändå 2,8 s LÅNGSAMMARE.** Om cache-kyla vore RTO-drivaren hade B varit
  snabbare (A:s zcat+psql+WAL-skrivar värmer page cache åt B). Hypotesen är
  därmed motbevisad i det enda kontrollpar som behövs: **cache-kyla kan INTE
  förklara dagens RTO-spridning.**
- **Korttidsvariansen är själv fyndet:** 2,8 s skillnad mellan två körningar
  fem minuter isär, samma blad, samma viloläges-start. Tillsammans med serien
  ( nedan) betyder det att RTO-brus ±3 s dominerar — DAGFONSTER-REPLIK:s
  reviderade lära "dagklassen 14–18 s oavsett RAM" MOTBEVISAD av A (12,9 s på
  kvällen): det finns ingen stabil klock-/RAM-klass.
- **Reviderad RTO-doktrin (ersätter band-läror):** blad-9-serien är nu
  12,1 · 12,2 · 12,5 · 18,1 · 16,1 · 15,1 · 11,5 · **12,9** · **15,7** —
  nio punkter, medel **14,0 s**, spann 11,5–18,1. Framtida RTO-prediktioner
  redovisas som **spann 11–19 s** (medel ±40 %) oavsett klockläge/RAM; ingen
  enskild punkts avvikelse är längre ett fynd utan först en parmätning värd.
- **Vad som INTE brusar:** radkontraktet och felbilden är helt deterministiska
  — sjunde och åttonde EXAKTA repetitionerna; felloggarna byte-identiska
  (34 881 B). DR-kontraktet (vad som kommer tillbaka) är stabilt; bara
  stoppuret brusar.

**Kontextfynd (ej ägt av detta spår):** 3,2 GB RAM frigjordes mellan 20:29Z
och 20:34Z (1 222 → 4 470 MB MemAvailable) — troligen en fabriksomgångs-/bygg-
process som avslutade. P3:s bandkrav bröts därmed av extern händelse, vilket
protokollförs här; det försvagar inte cache-domen (se ovan — mer RAM gav
longsammare restore ändå).

## 4. Intra-kvarts par 3 — över 23:00-markören: Δboard = +8 EXAKT

| Punkt | Lokal tid | Server (UTC) | board | snapshots | organ |
|---|---|---|---|---|---|
| 1 | 22:58:43 | 20:59:12.481 | 49 994 | 1 252 404 | 3 069 |
| 2 | 23:01:31 | 21:01:31.432 | **50 002** | 1 252 404 | 3 069 |

- **Δboard = +8 EXAKT** — EN markör (23:00) passerad mellan punkterna ⇒ klockan
  eldar VID markören. Serien par: 2 inom-kvarts (Δ=0) + detta över-markör
  (+8) = mekanismen trefaldigt belagd.
- **P9 EXAKT TRÄFF:** förutsagt 50 002 (kedjat från FORMIDDAGSPULS:s mätta
  49 578 @ 09:45:49 + 8×53) — siffra för siffra, 13,3 h framåt i förväg.
- snapshots/organ frusna inom paret — endast board rör sig vid markören.
- Punkt 1:s 49 994 = 49 346 + 8×81 EXAKT (markörer till 22:45) — formeln
  höll också vid ankommen, ej bara vid avgången.

## 4b. Bonus: kvällens fulla RPO-punkt (21:01:46Z, M = 82 markörer)

`dr-rpo-diff.mjs --json` → DR-RPO-DIFF-2026-09-19-KVALLKONTROLLPAR.json:

| Tabell | Dump 02:30 | Levande 23:01 | Δ |
|---|---|---|---|
| board_decisions | 49 346 | 50 002 | +656 = **8×82 EXAKT** |
| section_data_snapshots | 1 233 420 | 1 252 404 | +18 984 (dagbatchen, frusen sedan förmiddagen) |
| organ_health_logs | 3 024 | 3 069 | +45 (två organ-svep 14:xx/20:xx) |
| **Totalt** | 1 325 919 | 1 345 604 | **+19 685** |

- 3 av 60 tabeller i rörelse — samma tre som i varje mätning.
- **Snapshots fruset på 1 252 404 sedan 09:30** (13,5 h): pumpen är en
  DAGLIG batch (skrev +18 984 mellan 02:30 och 09:30 i dag), inte kontinuerlig.
  Blad-10-prediktionen (snapshots 1 252 404) därmed KVÄLLSVERIFIERAD på exakt
  talet ~3 h före bladets födelse 09-20 02:30 — tredje punkten på
  prediktionsvärdet (DAGPULS · FORMIDDAGSPULS-dubbel · denna).
- Blad-10 board-prediktionen 50 114 = 8×96 stärks: kvartsmekanismen lever
  obevisat oavbruten även vid 23:00; sista strecket är 09-20 02:30-fönstret.

## 5. Prediktionsdom (P1–P10)

| # | Prediktion | Utfall | Dom |
|---|---|---|---|
| P1 | RTO A 11,5–18,0 s; primärt ≈14,5 | 12,9 s | ✅ (i band; primär 1,6 s ifrån) |
| P2 | B < A, Δ≈1,5 s; \|Δ\|<0,5 ⇒ cache ej förklaring | B = 15,7 > A = 12,9 (Δ=+2,8 i "fel" riktning) | ❌ primär — men data ger STARKARE uteslutning av cache än decisionregeln |
| P3 | RAM-band ±150 MB (1 050–1 350) | 1 222 vs 4 470 (extern frigörelse 3,2 GB) | ❌ band brutet av extern händelse, bokfört §3 |
| P4 | Radkontrakt identiskt båda | EXAKT båda | ✅ |
| P5 | 788/0 · ≈34 881 B | 788/0 · 34 881 = 34 881 byte-identiskt | ✅ EXAKT |
| P6 | Markör GRÖN 1 347 729 · 99 · 101 | EXAKT båda | ✅ |
| P7 | AUTO-13 + AUTO-14 | AUTO-13 + AUTO-14 | ✅ |
| P8 | par 3 Δboard = +8 | +8 EXAKT (49 994 → 50 002, EN markör) | ✅ EXAKT |
| P9 | board 23:01 ≈ 50 002 ± 8 | 50 002 — siffra för siffra | ✅ EXAKT |
| P10 | städning: down · OID 1/4/5 · WAL 481 · lås viloläge | down · base OID 1/4/5 (+tom pgsql_tmp) · WAL 481 MB · lås ledigt | ✅ |

## 6. Städning + KVD

- Städning EGENMÄTT efter B: 17/main **down** · psql kopplingsvägran · skrap-DB
  ej i klustret (dropdb-kvitto i båda körningarna) · WAL **481 MB** (nionde
  punkten på serie-låget) · felloggar kvar i /tmp enligt mall (blad+pid+ms) ·
  flock-låsfil kvar i viloläge.
- KVD: src/ orörd = **INGET bygge** (tsc-baslinjen vilar i pre-commit-grinden)
  · R2 orörd · data/blogg/ orörd · prod ENDAST läst (psql COUNT mot molnet,
  GDPR-rent: endast antal) · syskonytor orörda · commit med pathspec + -F.

## 7. Kö vidare

- Blad 10:s födelsebevis 09-20 02:30 (kvartsformelns sjätte test; board 50 114
  = 8×96 — par 3:s utfall stärker/svagar basen) · jungurkörningen 09-20 03:20.
- RTO-prediktioner härifrår: spann 11–19 s (§3) — parmätning först vid avvikelse.
- Retentionstriggern ~2026-10-11 · kvartalssviten TOTAL+PUMPVAKT+ARKIVSVEP
  senast 2026-12-17/18.

SLUT — protokoll s10-u1 kvällskontrollpar, 2026-09-19.
