# DR-ÖVNING 2026-09-20 MORRON — BLAD 10:S FÖRSTA RESTORE, OBEROENDE REPLIK 2 (GRÖN)

**Spår 10 (DATAINTEGRITET & BACKUP) · s10-u3 · manifest auto-s10-1789878902744 ·
2026-09-20 06:38–06:45 CEST.** Order: "DR-övning nästa i spåret (välj själv):
återställ, mät tid/rader, protokoll, städa lokal PG." Detta protokoll är den
berättande delen; maskinprotokollen är `DR-PROV-2026-09-20-AUTO.md` (syskon u2,
replik 1) och `DR-PROV-2026-09-20-AUTO-2.md` (denna, replik 2).

## 1. Val och duplikatdom

**Val: blad 10 (db-2026-09-20.sql.gz, 31,6 MiB, född 02:30:43 i natt) — spårets
egen köpost tre gånger bokförd 09-19: "blad 10:s födelsebevis 09-20 02:30 —
board 50 114 · snapshots 1 252 404".** Blad 9 är restore-bevisat 13+ gånger
(AUTO-10…14, determinism korsbevisad); blad 10 hade ALDRIG återställts vid
dagens början.

**DUBBELDISPATCH, D20-dom (presedens 09-19: u1 AUTO-11 + u3 AUTO-12):** syskon
u2 anspråkade samma objekt 06:38, mitt anspråk (med egna låsta prediktioner)
lades på disk 06:41 FÖRE mätning — ingen avvisning: DR-flocken serialiserade
PG17-fönstret, u2:s restore följdes av min ~80 s senare, varje körning en
oberoende replik. Ytfördelning: u2 = 02:40-gap-prediktionen (deras P7) + sitt
protokoll; jag = seriefortsättning + blad-till-blad-dekomposition + oberoende
födelsedom + denna berättelse + DRIFTSBOK-rad. Syskonytor orörda.

## 2. Genomförande (orderns fyra steg)

| Steg | Resultat |
|---|---|
| Återställ | `node verktyg/dr-ovning.mjs` (senaste blad = blad 10) — GRÖN exit 0 |
| Mät tid/rader | markör GRÖN (1 367 628 dump-rader · CREATE 99 · COPY 101) · **RTO 12,9 s** · fel 788 kända/0 okända |
| Protokoll | DR-PROV-2026-09-20-AUTO-2.md (maskinellt) + denna fil |
| Städa lokal PG | skrap-DB raderad · PG17 stoppad + oberoende eftermätning §5 — allt grönt |

## 3. Födelsebeviset LEVERERAT — två instrument, samma siffror

Gårdagens kedjeprediktioner för blad 10, mätta i den återställda dumpen av
TVÅ oberoende restore-instrument (u2 06:37:58 · u3 06:39:05, ~80 s och ett
flock-fönster ifrån varandra):

| Prediktion (låst 09-19) | u2 replik 1 | u3 replik 2 (denna) | Dom |
|---|---|---|---|
| board_decisions = 50 114 | 50 114 | 50 114 | **EXAKT ×2 instrument** |
| section_data_snapshots = 1 252 404 | 1 252 404 | 1 252 404 | **EXAKT ×2 instrument** |
| public 60 tabeller | 60 / 1 345 719 | 60 / 1 345 719 | **IDENTISKA** |
| public+storage 68 · alla scheman 99 | 68/1 345 855 · 99/1 346 115 | samma | **IDENTISKA** |
| felprofil 788/0 | 788/0 | 788/0 | **IDENTISKA** |

Båda felloggarna är **byte-identiska 34 881 B** (samma determinismbevis som
gårdagens kontrollpar A/B). Radkontraktet är därmed korsbevisat för blad 10 på
samma sätt som blad 9 korsbevisades igår — födelsebeviset håller maskinens
måttstock: gårdagens formel (board 49 346 + 8×96 = 50 114) träffade siffra för
siffra på en dump som inte fanns när prediktionen låstes.

## 4. Dekomposition: det modala dagsteget +19 800 är tre namngivna skrivare

Blad 9 → blad 10 per tabell (mina nyckeltabeller mot AUTO-14:s, identiska i
båda dagens repliker):

| Tabell | Blad 9 | Blad 10 | Δ |
|---|---|---|---|
| section_data_snapshots | 1 233 420 | 1 252 404 | **+18 984** (pumpens dygnsbatch) |
| board_decisions | 49 346 | 50 114 | **+768** (8 rader × 96 kvartal) |
| organ_health_logs | 3 024 | 3 072 | **+48** (organpulser) |
| övriga 57 publika tabeller (däribland section_data 19 363 · era 18 933 · wave_signals 490 · forecast_log 429 · app_files 251 · courses 10 · auth.users 3) | — | — | **+0** |

**Summa: 768 + 18 984 + 48 = +19 800 EXAKT** = det modala dagsteg som mättes
ensoigt 09-19. Dagsteget är inte brus — det är tre kända skrivare, fullt
redovisade, och universum är stabilt (60/68/99 tabeller, oförändrat sedan
09-15).

## 5. Städning — oberoende egenmätt (06:44 CEST)

- `pg_lsclusters`: 17/main **down** · psql socketvägran (skrap-DB:s frånvaro
  bevisad) · base endast OID 1/4/5 · pgsql_tmp TOM
- Felloggar kvar i /tmp enligt mall (blad+pid+ms): p3423738 (u2) + p3424104
  (u3), båda 34 881 B — spårbara, ingen körning rör en annans fil
- DR-flock `/tmp/ak1a-dr-prov.lock`: ingen process håller den (viloläge)
- Retention: **10 blad** (09-11 … 09-20) orörda — 30-dagars-cron-raden äger
  radering; äldsta bladet 9 dagar gammalt
- Disk 58 G ledigt — oförändrat av övningen

## 6. RTO-serien (doktrin håller på nytt blad)

Blad 9 (09-19, 9 punkter): 12,1 · 12,2 · 12,5 · 18,1 · 16,1 · 15,1 · 11,5 ·
12,9 · 15,7 (medel 14,0). **Blad 10 (2 första punkter): 11,7 (u2) · 12,9
(u3)** — båda i doktrin-spannet 11–19 s; Δ 1,2 s mellan replikerna ligger
inom det dokumenterade ±3 s-korttidsbruset. Blad 10 är 0,5 MiB större än
blad 9 — RTO okänsligt för det (radmassa driver ej RTO; känt sedan KEDJA-0).

## 7. Prediktioner (låsta 06:41 FÖRE mätning): 9/9 — 6 EXAKTA

P1 markör/dump-rader ✓ (1 367 628 i bandet ≈1 367 500 · CREATE 99/COPY 101
EXAKT) · P2 RTO ∈ [11,19] ✓ (12,9) · P3 public 60/1 345 719 **EXAKT** ·
P4 68/1 345 855 · 99/1 346 115 **EXAKT×2** · P5 board 50 114 **EXAKT** ·
P6 snapshots 1 252 404 **EXAKT** · P7 fel 788/0 **EXAKT** · P8 identiskt
radkontrakt med u2:s replik ✓ (alla nivåer + nyckeltabeller + byte-identiska
felloggar) · P9 städning viloläge ✓ (§5). Inga missar — den delade basen
(gårdagens protokoll) bar hela vägen.

## 8. Kö åt nästa våg

- **Blad 11:s födelsebevis 09-21 02:30 (formelns sjunde test):** board
  50 114 + 768 = **50 882** · snapshots 1 252 404 + pumpbatch (modal +18 984 ⇒
  1 271 388) · organ ≈ +48 ⇒ 3 120 · public ≈ **1 365 519** om modala
  dagsteget upprepas — avvikelse = parmätning värd (doktrin).
- 02:40-gap-prediktionen (∈ [2 400, 2 950]) ägs av u2 (deras anspråk P7).
- Kvartalsövingen senast **2026-12-20**: `node verktyg/dr-ovning.mjs`.
- Retention-vakten: om blad 11 föder 11 blad imorgon — följer 30-dagars-cron
  radering (första kandidat db-2026-09-11 först ~10-11, ingen annan mekanism
  skall finnas; om äldre blad försvinner tidigare = FYND).

SLUT — s10-u3, 2026-09-20 06:45 CEST
