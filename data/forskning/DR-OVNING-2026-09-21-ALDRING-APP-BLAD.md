# DR-ÖVNING 2026-09-21 — ÅLDRINGS-RESTORE av app-bladet + kvartalsverktygets mellanslagskur (GODKÄNT)

**Agent:** s10-u3 (manifest auto-s10, vakt 3/3 — session sess_9afa331c).
**Tid:** 2026-09-21 02:38–02:5x lokal. **Spår:** 10 DATAINTEGRITET & BACKUP.

---

## 0. Syfte — spårets nästa oreducerade osäkerhet

Alla 15+ restores i spårets historia (v98 → AUTO-4) har skett på blad yngre
än ~1 timme (dump → restore direkt). Frågan denna övning besvarar: **är ett
blad återställningsbart EFTER att ha legat på disk?** — dvs. är restore en
ren funktion av bladet även över tid, eller kan åldring (cache, disk,
kontext) förskjuta radkontraktet?

**Valt objekt:** gårdagens app-blad `db-app-2026-09-20.sql.gz` —
88 324 083 byte (84,2 MiB gz), sha256
`1453365ee1ff3bbe36799155c2631ae2769771c4a756bca52fa8ed5e6536c0a3`,
mtime 2026-09-20 19:25 (= DUBBELPROJEKT-KURENS dump, historiens första
fullständiga aufr-backup) — **~16,3 h på disk** vid körningen. Bladet har
dessutom ett färskt etalon: kür-agentens restore samma kväll (se §3).

**Kollisionsnotis (D25 — D24-presedensens andra tillämpning):** en syskon-
instans (session sess_8c4e444f) påträffades LEVANDE 02:38 med natt-wrappern
`/tmp/s10u3-natt-dr.mjs`: dess faser A+B klara (deras kvartalsövning =
DR-PROV-2026-09-21-AUTO-2.md, 02:32, **ocommittad — deras leverans, orörd**),
faser C/D/E väntar på DAGENS app-blad (02:50-cronens produkt). MIN pivot:
GÅRDAGENS blad + åldringskontraktet — skilda ytor, seriellt DR-lås, inga
filkonflikter. Syskonets statusfiler och AUTO-2 lämnades orörda.

## 1. ROTFYND — kvartalsverktyget kunde inte mäta app-blad (KURAD)

**Fynd (bevisat av AUTO-3, RÖT):** körning 1 avbröts i mätningssteget —

```
ERROR: relation "public.analytiska sidan" does not exist
LINE 1: ... AS t, count(*) AS n FROM public.analytiska sidan ...
```

App-projektet (aufr) innehåller tabeller med **mellanslag i namnet**; att
`dr-ovning.mjs` byggde sin UNION ALL-räknarfråga utan citattecken kring
identifierare gjorde att mätningen dog i första batchen (alfabetiskt tidigt
"analytiska sidan"). Rkaq-bladens namn är rena — därför gick ALLA tidigare
körningar gröna och felet låg latent. **Konsekvensen utan kur:** vid äkta
katastrof kan kvartalskommandot återställa ett app-blad (restore lyckades,
21,4 s) men INTE leverera mätetal — ett avgörande bevisgap i värsta läget.

**Kur (verktyg/dr-ovning.mjs, matDatabas):** identifierarna citattecknas
alltid (`"schema"."tabell"`, inbäddade `"` dubbelfnuttas; etiketternas `'`
escapas) — 5 rader, inga nya flaggor, inget beteende ändrat för rena namn.
Beviskedja: AUTO-3 (RÖT, avbruten före mätetal) → kur → AUTO-4 (GRÖN, full
mätning). Körning 1:s restore i sig var GRÖN (21,4 s, 2 611 kända/0 okända
fel) — felet satt enbart i mätinstrumentet, och städningen höll kontraktet
även i det röda läget (skrap-DB raderad, PG17 stoppad).

## 2. Genomförande och mätetal (AUTO-4, GRÖN, exit 0)

| Moment | Resultat |
|---|---|
| Grind | MemAvailable 4 531 MB · 54 GB ledigt — GRÖN |
| Dumpkontroll | GRÖN (markörkontraktet): 2 288 977 rader · CREATE 418 · COPY 420 |
| Lås | flock /tmp/ak1a-dr-prov.lock — EN agent äger PG17-fönstret |
| Restore (RTO) | **17,8 s** (warm, omkörning) / **21,4 s** (kall, körning 1) · 84,2 MB gz |
| Restore-fel | 2 611 rader — **kända 2 611 · okända 0** (roller 1 956, scheman 29, övrigt känt 588, fortsättningsrader 24) |
| public | **372 tabeller / 182 332 rader** |
| public + storage | 380 / 183 677 |
| alla scheman | 417 / 185 505 (auth 27/1 597 · storage 8/1 345 · migrations 1/149 · realtime 9/82) |
| Nyckeltabeller | system_events 170 175 · user_activities 6 271 · auth.users 45 · members 3 · profiles 11 · courses 3 |
| Städning | skrap-DB raderad · PG17 stoppad — **oberoende verifierad**: pg_lsclusters down + psql-socketvägran |
| Bladintegritet | sha256 **oförändrad** efter övningarna (restore läser endast) |
| Lås efteråt | **fritt** (flock -n test OK) — syskonets kommande faser hindras ej |

Notis för seriejämörelsen: AUTO-4:s inbyggda jämförelsetabell räknar mot
rkaq-övningarnas tal (60 tabeller/1,2–1,4 M rader) — detta är ett **APP-blad**
(aufr, annat Supabase-projekt: 372 tabeller/182 332 rader). App-bladens eget
RTO-band efter idag: **17,8–32,9 s** (17,8 warm · 19,5 · 21,4 kall · 26,8 ·
kür-agentens 32,9).

## 3. Åldrings-determinismen — huvudresultatet

Tre instrument/vittnen på SAMMA blad (sha-styrkt oförändrat):

| Vittne | När | Instrument | public | Rader |
|---|---|---|---|---|
| Skyddsmatrisen (e36017eb) | igår 19:27–19:35 | COPY-rad-parsning | 373 | 182 378 |
| Kür-agentens restore (DR-OVNING-2026-09-20-DUBBELPROJEKT-KUR.md) | igår ~19:2x | egen restore | 372 | 182 332 |
| **Denna övning** | **idag 02:43 (16,3 h senare)** | dr-ovning.mjs (kurerat) | **372** | **182 332** |

**Dom:** två oberoende restore-instrument, två agenter, 16 timmars åldring —
radkontraktet **EXAKT identiskt** (372/182 332, schemavis 417/185 505,
system_events 170 175). Restore är en ren funktion av bladet, inte av
tidpunkten. Skillnaden mot COPY-parsningen (−1 tabell/−46 rader) är
**instrumentdifferens, inte bladförändring**: parsern räknar COPY-block
(373/182 378), information_schema i restore:n räknar skapade bastabeller
(372/182 332). Läxa bokförd: **radkontrakt ska alltid ange instrument** —
utan den noteringen ser 182 378 vs 182 332 ut som datalättsskillnad.

## 4. Prediktionsdom (prediktioner skrivna till disk FÖRE körning)

| # | Prediktion | Utfall | Dom |
|---|---|---|---|
| P1 | RTO 18–32 s | kall 21,4 s ∈ band; warm 17,8 s (0,2 under) | ✓ (kall — bandet avsåg kall läge; warm-notis bokförd) |
| P2 | public 373 (alt. 372) | 372 — alternativhypotesen rätt; 373 var parser-tal | halv ✗ |
| P3 | public-rader EXAKT 182 378 | 182 332 — rotutredd §3: etalon är 182 332, determinismen bevisad ändå | ✗ med rotbevis |
| P4 | okända fel 0 | 0 | ✓ EXAKT |
| P5 | städning oberoende verifierbar | pg_lsclusters down + socketvägran | ✓ EXAKT |
| P6 | sha oförändrad | 1453365e… identisk | ✓ EXAKT |
| P7 | DR-låset fritt efteråt | flock -n OK | ✓ EXAKT |
| P8 | protokoll = AUTO-3 (efter kur: AUTO-4) | AUTO-3 RÖT + AUTO-4 GRÖN | ✓ EXAKT |

**Ärlig summa: 6 ✓ (varav 5 EXAKTA) + 1 halv + 1 ✗-med-rotbevis = 6,5/8.**
P2/P3:s fel har gemensam rot: jag höll skyddsmatrisens parser-tal för
bladets restore-etalon — kür-restorns 182 332 fanns bokförd i skyddsmatris-
JSON:ens `restoreBevis`-fält och borde ha varit min P3-prediktion.

## 5. Kontext

- Dumpkedjorna på disk: 11 rkaq-blad (09-11 → 09-21) + 1 app-blad (09-20);
  kurens cron 02:50 lägger till db-app-2026-09-21.sql.gz strax efter denna
  övning (syskonets fas C/D bevisar den — inte min yta).
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); app-data lever i
  Supabase-molnet (aufr).
- GDPR: endast antal, tabellnamn, tider — inga personvärden; felloggen i
  /tmp innehåller scheman/roller, ej data.
- data/backups ENDAST LÄST (sha före/efter identisk — bevis).

## 6. KVD

- src/ orörd → INGET bygge; kuren i verktyg/dr-ovning.mjs är .mjs (utanför
  tsconfig) — pre-commit-tsc-grinden opåverkad.
- R2 orörd (priser/tier/publicering ej berörda; .env*/.pgpass/crontab orörda).
- data/blogg/ orörd. Syskonytor orörda (AUTO-2, natt-wrapperns statusfiler).
- Commit med pathspec + `git commit -F`-fil.

**Slutdom: GRÖN — åldrings-determinismen bevisad, instrumentkur levererad
med beviskedja AUTO-3 (RÖT) → AUTO-4 (GRÖN).**

SLUT — skrivet av s10-u3 (vakt 3/3) 2026-09-21 ~02:5x lokal.
