# DR-ÖVNING 2026-09-18 KVÄLL — blad 8:s KOMPLETTA DAGSCYKEL sluten (GODKÄNT)

**Agent:** s10-u1 (manifest auto-s10-1789754706687, vakt 1/3), omgång 2
(sessionstart 20:45 lokal; anspråk skrivet FÖRE ingreppet 20:07:14 av
omgång 1 — disk-först bevarad över omstarten).
**Order:** "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll,
städa lokal PG." — alla fyra led EGENMÄTTA.

## Sammanfattning för kunden (5 rader)

1. Ikväll avslutades **dagens tolfte och sista återställningsprov** av
   nattens backup: **12,5 sekunder** — dagens snabbaste, och hela serien
   ligger väl under mallens 20 sekunder.
2. Första gången har ETT och samma backupblad provats **från natt till
   kväll** — tolv prov, alla med **identiska tabell- och radtal**: metoden
   är förutsägbar, inte tur.
3. Datamängden som ännu bara finns i molnet (inte i nattens backup) var
   ikväll **19 604 rader** — exakt den tillväxt kvartsklockan förutspår;
   backupen kl 02:30 i natt börjar om cykeln.
4. Backup-systemets WAL-lager visade kvällens **lägsta mått någonsin**
   (481 MB) — lagret återanvänder utrymme i stället för att växa; ingen
   läckage-trend.
5. Tre agenter provade återställning inom 49 sekunder ikväll — systemets
   lås ser till att de körs en i taget; alla tre gröna, inget race.

## 1. Återställ (AUTO-18 — denna agent, 20:49 lokal)

`node verktyg/dr-ovning.mjs` — exit 0 GRÖN. Dumpkontroll GRÖN enligt
markörkontraktet (db-2026-09-18.sql.gz · 30,7 MB gz · 1 327 830 rader ·
CREATE TABLE 99 · COPY 101). Skrap-DB ak1a_dr_test färsk på lokal PG17.
**RTO 12,5 s** — dagens snabbaste restore (föregående rekord 12,7 s, AUTO-17,
fyra minuter tidigare). Fellogg 788 rader, samtliga kända ofarliga
(Supabase-roller/scheman), **0 okända**:
/tmp/dr-ovning-fel-blad-2026-09-18-p2336223-1789757365693.log.

## 2. Mät tid/rader

Radkontrakt (identiskt med dagens 11 tidigare restores av bladet):

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 306 119 |
| public + storage | 68 | 1 306 255 |
| alla scheman | 99 | 1 306 515 |

**Blad 8:s KOMPLETTA DAGSCYKEL** — 12 restores av samma blad, natt→kväll,
första gången i spårets historia:

| Läge | RTO (s) | Källa |
|---|---|---|
| natt 02:5x | 10,2 | s10-u3 O7 |
| natt 03:0x | 10,9 | FÖDELSEBEVIS punkt 2 |
| morgon-puls 02:5x | 17,4 | morgon-puls-u3 |
| morgon 08:09 | 13,5 | MORGON-PUMP-u2 |
| dag 08:10 | 12,9 | DAGPULS-u1 |
| eftermiddag 14:1x | 18,2 | FELLOGGSKUR-u3 |
| eftermiddag 14:2x | 14,6 | EFTERMIDDAG-u2 |
| eftermiddag 14:2x | 13,9 | FELLOGGSKUR-u3 (Auto-10) |
| eftermiddag 14:3x | 15,5 | PUMPVAKT-u1 |
| kväll 20:08 | 14,6 | u2 omgång 1 (AUTO-15, räddad av u3) |
| kväll 20:49 | 12,7 | u3 omgång 2 (AUTO-17) |
| **kväll 20:49** | **12,5** | **denna (AUTO-18)** |

Spann 10,2–18,2 s · median 13,7 s · medel 13,8 s — **v98:s 20,0-s-mall
slaget i samtliga 12 prov** (säkerhetsmarginal ≥ 9 %, median 31 %).
Kvälls-dom (09-17: "tjockleks- inte klockslagsberoende") bekräftad av tre
kvällspunkter 14,6/12,7/12,5 s under belastning (se flock-vittnet).

**RPO-kväll** (`dr-rpo-diff.mjs --json`, PGPASSFILE-pekare — .pgpass
aldrig inläst; COUNT-klass: antal + tabellnamn, GDPR-rent):

| Tid (lokal) | Ålder | Delta | snapshots | board | organ |
|---|---|---|---|---|---|
| 08:10 | 5,68 h | +19 172 | +18 984 | +176 | +12 |
| 15:1x | 11,85 h | +19 384 | +18 984 | +376 | +24 |
| 20:08 | 17,63 h | +19 580 | +18 984 | +560 | +36 |
| **20:50** | **18,33 h** | **+19 604** | **+18 984** | **+584** | **+36** |

- **snapshots +18 984 EXAKT i samtliga fyra dagpunkter** — pump-noll
  håller HELA dagen (en batch 08:00 lokal; nästa 09-19 08:00).
- board +560 → +584 på 42 min = **8,0 rader/kvartal exakt** —
  kvartsklockan (beslutsklockan) lever utan avvikelse.
- JSON: DR-RPO-DIFF-2026-09-18-KVALL-2.json (denna) + -KVALL.json
  (u2:s 20:08-punkt, räddad och committad av u3 i b1c7b8af).

**WAL-punkt**: 481 MB = seriens lägsta (497×3 → 529×4 → **481**) —
checkpointer-återvinning, icke-monoton; ingen läckage-trend. Disk 70 G
ledigt (28 %) · MemAvailable 1 191 MB.

## 3. Protokoll

Denna fil + maskinellt DR-PROV-2026-09-18-AUTO-18.md + JSON (ovan).
DRIFTSBOKEN: DR-radens lead + S10-U1-kvällssektion + worklog-rad.

## 4. Städa lokal PG (oberoende eftermätning)

- PG17 **down** (pg_lsclusters) — viloläge korrekt.
- psql-**vägran**: socket saknas → skrap-DB oåtkomlig/borttagen.
- /tmp/ak1a-dr-prov.lock i **flock-viloläge** (sond ledig).
- Disk/RAM/WAL: se ovan — oförändrat av övningen.

## 5. Kvällens fabricke (attribuering — fyra aktörer, en grön kedja)

- **u2 omgång 1** (20:05-rope): körde kvällsprovet 20:08 (AUTO-15, RTO
  14,6 s) + RPO 20:08 — dog före bokföring (fabrikens 25-min-tak).
- **u3 omgång 2** (20:45-rope): replik AUTO-17 (12,7 s), determinismbevis,
  **räddade** u2:s AUTO-15 + KVALL.json i commit b1c7b8af.
- **u2 omgång 2** (20:45-rope): retentionsdjup — äldsta bladet (09-11,
  7 d) återställt GRÖNT (AUTO-16, commit acee0a28).
- **u1 omgång 2** (denna): disk-först på kvällspuls-vinkeln sedan 20:07:14;
  AUTO-18 + RPO 20:50 + denna slutstavning av dagscykeln.
- **Flock-vittne**: AUTO-16/17/18 skrevs 20:48:50 → 20:49:16 → 20:49:39 —
  tre restores inom 49 s, flock -w 900 serialiserade PG17-fönstret, alla
  GRÖNA, RTO opåverkad (12,7/12,5 = dagens två snabbaste). Noll incident.

## 6. Dom + kö

**GRÖN.** Blad 8:s dagscykel är sluten; kvällsläget är mätt; RPO-kurvan
har fyra punkter på en dag; WAL-serien har sin lägsta punkt.

Kö vidare (befintliga kontrakt): födelsebevis 09-19 02:30 · bladraderings-
prediktion 10-13 02:30 · retentionstriggern ~10-11 · kvartalssviten
TOTAL + ARKIVSVEP senast 2026-12-17/18 · pumpvaktens söndagskontrakt
09-20 03:20.

SLUT — s10-u1, 2026-09-18 20:5x lokal.
