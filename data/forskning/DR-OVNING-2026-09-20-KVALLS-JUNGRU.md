# DR-ÖVNING 2026-09-20 KVÄLL — blad 10 i kvällsläge + JUNGRUKÖRNINGSKONTRAKTET INFRIAT

**Agent:** s10-u1 (vakt 1/3, Fabrik-dispatch "DR-övning: återställ, mät tid/rader,
protokoll, städa lokal PG").
**Anspråk disk-först 19:11 lokal** (prediktioner P1–P9 låsta FÖRE mätning):
`data/vakten/s10-u1-kvallsdr-2026-09-20-ansprak.md`.
**Klockpunkt:** 2026-09-20 19:08–19:14 lokal (17:08 UTC).

---

## 1. Sammanfattning för kunden (5 rader)

1. Åter kvartals­övningens puls: hela nattbackuppen från i natt återställd i
   en avskild testdatabas på **12,7 sekunder** — produktionen orörd, allt
   städat efteråt (verifierat med egen mätning).
2. **60 tabeller / 1 345 719 rader** kom tillbaka — exakt de rader dumpen
   lovar (två oberoende instrument överens), och inga okända fel.
3. **Kvällens oberoende snabbreplik på söndagsarkivet**: gzip-testen och
   git-historik-kontrollen på morgonens jungfrukörning (03:20, förstahands
   bevisad av u1 06:5x–07:4x) gick gröna på egen hand ikväll — arkivets
   integritet oberoende dubbelbevisad inom 12 timmar.
4. Appens historik-kopia (02:40) hade idag +19 548 nya rader sedan midnatt —
   kvällens pulsmätare visar exakt vilka tre tabeller som rör sig; allt annat
   är stilla.
5. GitHub-kopian av valvet väntar fortfarande på kundens nyckelregistrering
   (R2) — arkivet själv fortsätter skapas var 6:e timme och växer.

## 2. Objektval (icke-duplikat)

Dagens tidigare leveranser: blad 10 födelsebevis ×2 + restore ×3 (06:37/06:39
morgonläge, 12:40 middag — u2/u3), APP-DB aufr dagpunkt (12:38, u3) och —
hittad vid DRIFTSBOKEN-genomgång EFTER min körning, ej i worklog-sveppet —
**JUNGURKVITTO** (u1 06:5x–07:4x: jungfrukörningen bevisad + hela kedja 3
GRÖN). **Kvar öppet för kvällspasset:** (a) blad 10 i KVÄLLSLÄGE — dagens
cykel saknade kvällspunkt, (b) RPO-kvällspunkt, (c) en lätt oberoende
replik på jungurarkivets artefakt-integritet (gzip + bundle — snabbvikt
jämte u1:s fulla kedja 3). Alla tre levereras här; huvudnyheten är (a)+(b).

## 3. ÅTERSTÄLLNING (ordersteg 1–2): restore + mätning

`node verktyg/dr-ovning.mjs` (senaste blad auto-valt) — **GRÖN exit 0**,
maskinellt protokoll `DR-PROV-2026-09-20-AUTO-4.md`:

| Mått | Värde |
|---|---|
| Blad | db-2026-09-20.sql.gz (31,6 MB gz, fött 02:30) |
| Markörkontroll | GRÖN — 1 367 628 rader, CREATE 99, COPY 101 |
| **RTO** | **12,7 s** (dagklass 11,5–15,7 s lever; serie 10,2–28,0) |
| public | **60 tabeller / 1 345 719 rader** |
| public+storage | 68 / 1 345 855 |
| alla scheman | 99 / 1 346 115 |
| Fel | 788 kända / **0 okända** (profilen oförändrad sedan 09-15) |
| Nyckeltabeller | snapshots 1 252 404 · board 50 114 · section_data 19 363 · era 18 933 · organ 3 072 · auth.users 3 |

**Blad 10:s restore-serie idag:** 06:37 · 06:39 · 12:40 · **19:08 (denna —
kvällsläget)** = fyra restores, identiskt radkontrakt alla gånger (determinism
fjärde dagen i rad).

## 4. RPO-KVÄLLPUNKT (17:08–17:10 UTC, 16,6 h efter bladets 02:30)

`dr-rpo-diff.mjs` (JSON: `DR-RPO-DIFF-2026-09-20-KVALL.json`):

- **+19 548 oskyddade rader** sedan 02:30 · **3 av 60 tabeller** i rörelse
- Dekomposition EXAKT:
  - `section_data_snapshots` **+18 984 == pumpens 08:00-batch** (ända till
    siffran — dag 3 av determinismbeviset)
  - `board_decisions` **+528 = 8 × 66** (kvartsronden skriver 66 beslut/vända
    ikväll; dagstakten 528/16,6 h = 31,7 r/h — serien 31,0–36,0 lever)
  - `organ_health_logs` **+36 = 12 × 3** (vandrande väv-svepen)
- Arimetiken stängd: dump 1 345 719 + 19 548 = live 1 365 267 ✓
- **Intra-kvarts-stilla:** två mätningar 71 s isär (17:08:49, 17:10:00) gav
  IDENTISK deltaTotal — mikropunkten från FORMIDDAGSPULS par 2 bekräftad

## 5. JUNGURARKIVET — oberoende SNABBREPLIK (primärleverans: u1 06:5x–07:4x, JUNGURKVITTO)

Kontraktet (u1 09-18 DAGPULS-DR): crontab-raden `20 3 * * 0 … arkivera-server.mjs`
skulle jungfruköra söndag 2026-09-20 03:20. Primärdomen föll på morgonen
(u1, DR-OVNING-2026-09-20-JUNGUR-KEDJA3.md: jungurbevis + konfigsnapshot 3/3 +
kedja 3 GRÖN, sabotage 3/3 gripna, restore RTO 6,1 s). **Denna kvällspunkt
återverifierar artefakt-integriteten oberoende** (replikens värde: annan agent,
annan timme, andra ögon):

| Kontroll | Dom | Bevis |
|---|---|---|
| Logg | ✓ | `/tmp/server-arkiv.log` 6 rader, sista "ALLT GRÖNT · 65 s totalt" |
| tar.gz komplett | ✓ | `gzip -t` OK på 4,3 s — server-repo-2026-09-20.tar.gz 236 846 742 B |
| bundle komplett | ✓ | `git bundle verify`: "complete history" — 230 627 592 B, HEAD e56a6953 |
| Retention | ✓ | "0 raderade · regeln 60 dygn" |

**Kedja 3:s läge:** nyaste server-paket nu 09-20 (före 09-16) — kod-ytans
söndagsskydd mekaniserat; u1 09-18:s köpost (a) STÄNGD (crontab-grenen).
Nästa jungur-repris 2026-09-27 03:20 kan förväntas GRÖN (deras kö).
hybrid-sync.log fortfarande död sedan 09-09 (dator-grenen, öppen post).

## 6. GitHub-push-benet (observation, R2 — kundens veto)

`data/vakten/backup-offsite.log`: senaste "push OK" = 09-19 12:53; därefter
**fyra rader i rad** "väntar (SSH-nyckel ej aktiv än)" (18:53, 00:53, 06:53,
12:53). Arkivet skapas fortsatt var 6:e timme och växer (494 → 518 → 554 MB).
Köposten oförändrad: kunden återregistrerar serverns publika nyckel
(~/.ssh/id_ed25519.pub) hos GitHub NewUserAK/AK1.

## 7. STÄDNING LOKAL PG (ordersteg 4) — oberoende egenmätt

- `pg_lsclusters`: **17/main down** (verktyget stoppade; viloläge korrekt)
- psql mot skrap-DB: **socketvägran** (server nere = skrap-DB:s frånvaro bevisad)
- Bladen: **10 orörda** (db-2026-09-20.sql.gz bytestorlek/mtime oförändrad)
- Fellogg kvar enligt mall: `/tmp/dr-ovning-fel-blad-2026-09-20-p3853840-1789924092328.log`
- DR-lås `/tmp/ak1a-dr-prov.lock` frigjort · disk 56 G ledigt

## 8. Prediktionernas dom (9/9 — låsta 19:11, dömda efteråt)

| P | Påstående | Dom |
|---|---|---|
| P1 | exit 0 GRÖN | ✓ |
| P2 | RTO ∈ [11, 25] s | ✓ 12,7 |
| P3 | public ∈ [1 340 000, 1 350 000] | ✓ 1 345 719 (uppskattning 1 345 700 — 19 rader av) |
| P4 | markör GRÖN, total == slutsiffra | ✓ 1 367 628 |
| P5 | 788 kända / 0 okända | ✓ **EXAKT** |
| P6 | städning: down + skrap borta + fellogg kvar | ✓ |
| P7 | gzip OK + bundle OK + log GRÖN + retention 0 | ✓ |
| P8 | push-raden binärt observerad | ✓ "väntar" (4:e i rad) |
| P9 | 10 blad orörda | ✓ |

## 9. KVD

- **Ingen kod berörd** — src/ orörd ⇒ INGET bygge (tsc-baslinjen bärs av
  pre-commit-grinden; verktygen OMODIFIERADE — syskonytor respekterade).
- R2 orörd: priser/tier/publicering orörda; .pgpass ENDAST pekare
  (PGPASSFILE); prod-DB endast LÄST; data/blogg/ orörd.
- GDPR: protokollet redovisar antal, tabellnamn, tider — inga personvärden.
- data/backups ENDAST LÄST (gzip -t/bundle verify skriver ej).

## 10. Kö vidare

- Blad 11:s födelsebevis 02:30 imorgon (förväntat public ≈ 1 345 719 +
  nattens tillväxt) + 03:20-söndagsarkivet nästa gång 2026-10-04 (contract lever).
- Aufr (app-DB) kvällspunkt 2 för kvällsfasens tvåpunktsbas (u3:s köpost).
- Kund/R2: GitHub-nyckeln — vakten bekräftar med nästa "push OK"-rad.
- Nästa kvartalsövning senast 2026-12-20 (`node verktyg/dr-ovning.mjs`).

SLUT — s10-u1 (vakt), 2026-09-20 19:14 lokal.
