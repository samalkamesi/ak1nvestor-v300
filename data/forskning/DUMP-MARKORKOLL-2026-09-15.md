# DUMP-MARKORKOLL 2026-09-15 — slutmarkörsvakt för natt-dumparna (SLUTFÖRD)

**Utförd av:** fabriksagent s10-u1 (roll: vakt), spår 10 — DATAINTEGRITET &
BACKUP, 2026-09-15 kl 12:12–12:20 CEST.

**Val-motivering:** Alla tre syskon i spår 10 fick identisk "välj själv"-prompt.
Syskonet s10-u2 valde och levererade DR-övningen (full PG-återställning,
commit `d29888d4`: 17,7 s / 68 tabeller / 1 246 728 rader — se
DR-PROV-2026-09-15.md). För att undvika duplikat ("duplikat är förlorat
arbete") valde denna agent spårets nästa olevererade objekt: **dump-slutmarkörer**
— verifiering att natt-dumparna är KOMPLETTA, inte bara giltiga gzip-arkiv.

---

## 1. Sammanfattning för kunden (5 rader)

1. Natt-dumparna har hittills ALDRIG kontrollerats på att vara kompletta — en
   avbruten dump hade upptäckts först vid en verklig katastrof. Det är nu kurat.
2. Ny vakt `verktyg/kolla-dump-markorer.mjs` bevisar dumpens start- och
   slutmarkörer (pg_dump 17: `\restrict`/`\unrestrict` med matchande token +
   "dump complete"-raden) samt gzip-integriteten — streaming, ~6 s per dump.
3. Vakten är BEVISAD på tre sabotagefall (trunkerad fil, avklippt slut,
   förfalskad slutmarkör — alla tre gripna med RÖD dom) och på de 5 riktiga
   dumparna (5/5 GRÖNA, 11–15 september).
4. **Säkerhetsfynd:** natt-cronen kör pg_dump med databasens lösenord direkt i
   kommandoraden — under dumpens ~2 minuter syns lösenordet för alla användare
   på servern via processlistan. Åtgärdsförslag (flytta till ~/.pgpass) är
   dokumenterat; inget värde finns i denna rapport.
5. Bra nytt i spåret: 30-dagars-retentionen visade sig REDAN mekaniserad i
   cron-raden — och förslaget på exakt en rad tilläg till crontab (nattläget av
   markörvakten) ligger klart för huvudagenten.

## 2. Problemet en van kund förstår

Varje natt kl 02:30 kopierar servern hela databasen till en komprimerad fil —
plattformens försäkring. Men komprimeringen lyckas även om kopieringen bröts
mittpå (nätverkshicka, omstart): filen finns, är öppningsbar — men innehåller
 bara halva databasen. Utan slutmarkörskontroll upptäcks det först den dag
försäkringen behövs. Denna vakt läser varje dump ända till sista raden och
kräver att pg_dump:s egna start- och slutsignaturer finns och matchar
varandra — då och bara då är filen grön.

## 3. Markörkontraktet (bevisat empiriskt 2026-09-15)

Dumparna skapas av pg_dump 17.11 (databas 17.6, Supabase) och följer detta
exakta mönster (token förkortad — den är slumpad per dump):

```
Start (rad ~5):  \restrict 3sqWBvFR…7ucyKvN
…
Slut:            -- PostgreSQL database dump complete
                 --
                 \unrestrict 3sqWBvFR…7ucyKvN     ← SISTA icke-tomma raden
```

`restrict`/`unrestrict` är pg_dump 17:5+-skyddet mot manipulerade dumpar: vid
återställning vägrar psql avsluta om tokenparet inte matchar. Vakten kontrollerar
alltså SAMMA kontrakt som återställaren kommer att kräva — innan katastrofen.

## 4. Verktyget — `verktyg/kolla-dump-markorer.mjs`

| Läge | Vad | Exit-kod |
|---|---|---|
| (inget arg) | ALLA `db-*.sql.gz` i `data/backups/supabase/` (baslinje/kvartal) | 0 = alla GRÖNA, annars 1 |
| `--natt` | endast DAGENS dump; saknas den = RÖD (fångar även "cron körde inte") | som ovan |
| `--fil <väg>` | en enda fil (testläge) | som ovan |
| `--katalog <väg>` | annan dumpkatalog | — |

Ren node (node:zlib + node:fs), inga beroenden, streaming med konstant minne.
Per fil redovisas: gzip-integritet, startmarkör + token, slutmarkör + token-
matchning, "dump complete"-rad, rad-/CREATE TABLE-/COPY-antal, pg_dump-version.

## 5. Bevis (körda 2026-09-15)

### 5a. Negativa test — vakten griper alla tre felslagen

| Test | Framställning | Dom | Gripning |
|---|---|---|---|
| T1 trunkerad fil | första 5 MB av riktig dump | **RÖD** (exit 1) | "gzip-strömmen avbröts … unexpected end of file" + saknade slutmarkörer |
| T2 avklippt slut | riktig dump utan sista 6 raderna (GILTIG gzip) | **RÖD** (exit 1) | slutmarkör `\unrestrict` saknas + "dump complete"-rad saknas |
| T3 förfalskad token | slutmarkörens token utbytt | **RÖD** (exit 1) | token-matchning saknas: `\restrict "3sqW…" ≠ \unrestrict "TAMPERADTOKEN"` |

T3 är viktigast: en dump kan vara "öppningsbar och fullstor" men manipulerad
eller felaktigt ihopsatt — tokenparet avslöjar det före återställning.

### 5b. Positiv baslinje — alla 5 befintliga dumpar GRÖNA (30,2 s totalt)

| Dump | Storlek | Rader | CREATE TABLE | COPY | Dom |
|---|---|---|---|---|---|
| db-2026-09-11.sql.gz | 28,0 MB | 1 207 625 | 95 | 97 | GRÖN |
| db-2026-09-12.sql.gz | 28,1 MB | 1 208 107 | 95 | 97 | GRÖN |
| db-2026-09-13.sql.gz | 28,5 MB | 1 228 011 | 95 | 97 | GRÖN |
| db-2026-09-14.sql.gz | 29,0 MB | 1 247 907 | 95 | 97 | GRÖN |
| db-2026-09-15.sql.gz | 29,4 MB | 1 267 803 | 95 | 97 | GRÖN |

Tillväxt ~10 000–20 000 rader/dag (levande data). `--natt`-läget testat separat:
dagens dump GRÖN, exit 0, 7,9 s. (95 CREATE TABLE = HELA dumpen inkl
auth/storage-schema; u2:s "68 publika tabeller" = public-schema — båda stämmer.)

## 6. Fynd

1. **SÄKERHET — lösenord i klartext på kommandoraden (natt-cronen).** Cron-
   raden (användare ak1a, 02:30) anropar pg_dump med
   `password=<Supabase-db-lösenordet>` synligt i kommandoraden. Under dumpens
   ~1–2 minuter kan ALLA användare på servern läsa det via processlistan
   (`/proc/*/cmdline`). Värdet återges INTE här. Åtgärd (förslag till
   huvudagent/kund): lägg credials i `~/.pgpass` (chmod 600, format
   `host:port:db:user:lösen`) och låt cron använda `PGPASSFILE=~/.pgpass
   pg_dump "host=… user=…"` utan lösenord i argumenten. Crontab-spoolen i sig
   är skyddad (600), men kommandorads-exponeringen är den reella risken.
2. **30-dagars-retentionen är REDAN mekaniserad.** Samma cron-rad slutar med
   `find data/backups/supabase -name "db-*.sql.gz" -mtime +30 -delete`. Spårets
   retention-objekt är därmed i praktiken levererat sedan tidigare — behöver
   nu bara dokumenteras (sker i DRIFTSBOKEN §S10-U1) och ev. bevakas (5 dumpar
   idag, äldst 11 sep = 4 dagar; regeln tom ännu, korrekt).
3. **Fem rena nätter:** pg_dump:s stderr-logg `/tmp/supabase-backup.log` är
   tom (0 byte) — inga fel eller varningar från dumpjobbet 11–15 sep.
4. **system_events bekräftat ur dump-sidan:** COPY-blocket för
   `public.system_events` finns men med 0 datarader och kolumnen `event_type`
   — konsistent med u2:s slutgiltiga fynd (händelseloggen återställs via
   moln-JSON-kedjan, DR-PROV-2026-09-15.md §5).

## 7. Väntande (för huvudagenten — ej applicerat av denna agent)

Prod-crontab är huvudagentens yta; radbytena är förberedda och testade:

1. **Markörvakt per natt** — lägg till i slutet av 02:30-radens kommandokedja:
   `&& node verktyg/kolla-dump-markorer.mjs --natt >> /tmp/supabase-backup.log 2>&1`
   (då misslyckas kedjan GRÖNT→loggat vid RÖD dump; retention-raden efter
   bör bindas med `;` om den ska köras även vid röd dom — idag körs den via
   `&&` och hoppas då över, vilket är ACCEPTABELT: en röd natt lämnar filen
   kvar för analys).
2. **Lösenordshantering** enligt fynd 1 (~/.pgpass) — kan kombineras med
   radbytet ovan i samma ingrepp.

## 8. Källor

- Verktyg: `verktyg/kolla-dump-markorer.mjs` (denna leverans, kört live ovan).
- Dumpar: `data/backups/supabase/db-2026-09-{11..15}.sql.gz` (gitignorerade).
- Tidigare bevis: DR-PROV-2026-09-13.md (integritet via gzip -t + räkning),
  DR-PROV-2026-09-15.md (u2: full restore + slutgiltiga system_events-fyndet),
  DRIFTSBOKEN §VÅG 98 F3 och §S10-U2.
- Crontab (användare ak1a): 02:30-dumpen + retention + stderr-logg.
- GDPR: rapporten innehåller endast ANTAL, filnamn, versionssträngar och
  förkortad token — inga personvärden, inga hemligheter.

SLUT — verktyget + baslinjen + fynden är leveransen; inga src/-ändringar
(tsc berörs ej), ingen crontab ändrad, inga byggen.
