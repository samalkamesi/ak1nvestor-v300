# DR-PROV 2026-09-18 — ARKIVSVEP: helarkivets restore-barhet per blad (GODKÄNT)

**Körd av:** `verktyg/dr-arkivsvep.mjs` (spår 10, s10-u3 manifest auto-s10-1789711500221) —
svep av SAMTLIGA 8 natt-dumpar på disk, äldst→yngst. Detta protokoll
genererades maskinellt av verktyget vid körningen.

**Gapet svepet stänger:** kedja 5:s retentionssvep bevisar gzip-integritet per blad —
men "gzip-gillighet är inte restore-barhet" (DRIFTSBOKEN:s läxa 2026-09-16: ett
strukturellt helt block kan bära oläslig data). Restore var bevisat endast på yngsta
bladet (dr-ovning-serien ~22+ RTO-punkter) och äldsta+yngsta (dr-fonsterdjup 09-16).
**MITTEN av arkivet hade aldrig restore-bevisats.** Efter detta svep gäller: varje
blad på disk är bevisat återställningsbart med exakt radkontrakt — katastrofutrymmet
"fel mittenblad valt vid återhämtning" är stängt.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi provade att återställa databasen **från varenda backup som finns på servern** —
   8 dagars backupper i rad, 106.2 s sammanlagd återställningstid.
2. Varje backup kontrollerades först (komplett ända till sista raden?) och jämfördes
   sedan med **två oberoende räkningar** (backupfilens egna rader mot databasens) —
   alla tal matchade exakt.
3. Produktionen påverkades inte: allt skedde i en avskild testdatabas som raderades
   efter varje blad (och serverns viloläge återställdes).
4. Svepet lyfter hela arkivet från "filerna ser friska ut" till "varje fil är bevisat
   återställningsbar" — om en katastrof upptäcks sent är det just ett äldre blad som gäller.
5. Nästa svep: vid nästa kvartalsövning, eller direkt `node verktyg/dr-arkivsvep.mjs`.

## 2. Blad för blad (äldst → yngst)

| Blad | MB gz | Markörer | Dumpens public-rader | psql public-rader | Radkontrakt | RTO s | Fel kända/okända | Dom |
|---|---|---|---|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28.0 | GRÖN | 1 186 890 | 1 186 890 | EXAKT | 13.8 | 780/0 | GRÖN |
| db-2026-09-12.sql.gz | 28.1 | GRÖN | 1 187 329 | 1 187 329 | EXAKT | 11.8 | 780/0 | GRÖN |
| db-2026-09-13.sql.gz | 28.5 | GRÖN | 1 207 134 | 1 207 134 | EXAKT | 13.9 | 780/0 | GRÖN |
| db-2026-09-14.sql.gz | 29.0 | GRÖN | 1 226 931 | 1 226 931 | EXAKT | 13.0 | 780/0 | GRÖN |
| db-2026-09-15.sql.gz | 29.4 | GRÖN | 1 246 728 | 1 246 728 | EXAKT | 12.2 | 780/0 | GRÖN |
| db-2026-09-16.sql.gz | 29.8 | GRÖN | 1 266 528 | 1 266 528 | EXAKT | 11.2 | 788/0 | GRÖN |
| db-2026-09-17.sql.gz | 30.3 | GRÖN | 1 286 328 | 1 286 328 | EXAKT | 16.8 | 788/0 | GRÖN |
| db-2026-09-18.sql.gz | 30.7 | GRÖN | 1 306 119 | 1 306 119 | EXAKT | 13.5 | 788/0 | GRÖN |

Noteringar:
- Radkontraktet omfattar ALLA scheman utom `cron` (pg_cron-ägt, skapas ej i lokal
  skrap-DB — kördhistorik, ej kunddata; u3:s radräkningsformel 2026-09-18).
- Kända fel = Supabase-molnets roller/scheman/extensions som inte finns i lokal PG
  (ofarliga; återskapas i målmiljön vid äkta katastrof — v98 F3-slutsatsen).

## 3. Tillväxten blad→blad

| Steg | Δ public-rader | Δ/dag | Störst tillväxt |
|---|---|---|---|
| 2026-09-11 → 2026-09-12 | 439 | 439 | board_decisions +419, organ_health_logs +24 |
| 2026-09-12 → 2026-09-13 | 19 805 | 19 805 | section_data_snapshots +18 984, board_decisions +773, organ_health_logs +48 |
| 2026-09-13 → 2026-09-14 | 19 797 | 19 797 | section_data_snapshots +18 984, board_decisions +765, organ_health_logs +48 |
| 2026-09-14 → 2026-09-15 | 19 797 | 19 797 | section_data_snapshots +18 984, board_decisions +768, organ_health_logs +45 |
| 2026-09-15 → 2026-09-16 | 19 800 | 19 800 | section_data_snapshots +18 984, board_decisions +768, organ_health_logs +48 |
| 2026-09-16 → 2026-09-17 | 19 800 | 19 800 | section_data_snapshots +18 984, board_decisions +768, organ_health_logs +48 |
| 2026-09-17 → 2026-09-18 | 19 791 | 19 791 | section_data_snapshots +18 984, board_decisions +768, organ_health_logs +39 |

## 4. Städning (kontraktet)

- Skrap-DB `ak1a_dr_arkiv`: raderad (mellan blad: raderad före nästa restore).
- PG17: stoppad (viloläge återställt).
- Lås /tmp/ak1a-dr-prov.lock: släppt (flock-läget lämnar den tomma filen åt nästa tagare — oskyldigt).
- Felloggor kvar i /tmp/dr-arkivsvep-fel-*.log (medvetet — bevismaterial).


## 5. Kontext

- Självtest av blockräknaren (fixtures + trunkeringsvägran): PASS.
- Grind: MemAvailable 2841 MB · 71 GB ledigt vid start · vid slut 2616 MB.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.
- GDPR: protokollet redovisar endast antal, tabellnamn och tider — inga personvärden.

## 6. Status

- Verktyget: `verktyg/dr-arkivsvep.mjs` — helarkivsvepet är ETT kommando.
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **GRÖN — helarkivets restore-barhet bevisad**.

SLUT — maskinellt genererat av dr-arkivsvep.mjs 2026-09-18T06:20:47.979Z
