# DR-PROV 2026-09-15 — KEDJA 2: MOLN-JSON (system_events) — GODKÄNT

**Spår:** 10 dataintegritet & backup, s10-u3 omgång 2 · **Datum:** 2026-09-15 19:2x ·
**Roll:** vakt (agentfabrik) · **Fönster:** under `flock /tmp/ak1a-dr-prov.lock` (S10-U3:s kur tillämpad — en agent äger PG-fönstret)

## Val-motivering (kollisionskontroll enligt fabrikinslaget)

Uppdragstexten ("DR-övning … återställ, mät tid/rader, protokoll, städa lokal PG") är
IDENTISK med den som s10-u2 och s10-u3 omgång 1 redan levererat under dagen: SQL-kedjan
är återställningsbevisad TRE gånger (v98 F3: 20 s · S10-U2: 17,7 s · S10-U3: 14,7 s).
En fjärde SQL-restore vore duplikat = förlorat arbete. Spårets enda obevisade
restore-objekt var den ANDRA kedjan: DRIFTSBOKEN scenario (c) — "DATA FÖRLORAT …
valvets system-events-full-<datum>.json.gz = senaste snapshot … Återinläsning sker via
Supabase REST/API … dokumentera engångs-skript" — dvs. JSON-kedjan var integritets-
bevisad (2026-09-13) men ALDRIG återställningsbevisad, och återinläsningsskriptet
skulle improviseras vid katastrofen. Detta prov bevisar den kedjan.

## Kontrakt som bevisas

system_events (händelseloggen) finns INTE i SQL-nattdumpen (S10-U2:s slutgiltiga fynd:
tabellen tom i dumpen). Komplett DR = **SQL-nattdump (allt utom loggen) + moln-JSON-
arkiv (loggen)**. Från och med detta protokoll är BÅDA kedjorna restore-bevisade med
mätta RTO och testade verktyg — inget improvisationssteg kvar.

## Arkiven (data/backups/, gitignorat — valvet)

| Arkiv | Gyptat | Okomprimerat | antal (header) | sidor | truncerad | Dubblett-id |
|---|---|---|---|---|---|---|
| system-events-full-2026-09-08.json.gz | 26,8 MB | 353,6 MB | 146 623 | 30 | false | **0** |
| system-events-full-2026-09-09.json.gz | 26,6 MB | 350,0 MB | 146 727 | 30 | false | **6** |

## Verktyget — verktyg/aterstall-system-events.mjs (nytt, versionerat)

Återställningsinstrument för kedja 2, fyra lägen:
- `--fil X` — verifiering: gzip-ström + header-kontrakt (typ/datum/antal/sidor/
  truncerad) + radantal-eftal + per-rad giltighet (id/event_type|type/message/
  created_at) + fördelning/tidsfönster/dubblett-id. **Strömmande, konstant minne**
  (egen rad-splitter, ingen jq/npm-beroende) — arkivet är 350 MB okomprimerat och
  servern hade 764 MB ledigt RAM vid provet; full JSON.parse är förbjuden klass.
- `--fil X --db DBNAMN` — verifiering + återställning i lokal PG via
  `psql … COPY … FROM STDIN` (escape: \\ \n \r \t, \N=NULL; details→jsonb).
- `--fil X --jsonl-ut FIL [--begransa N]` — konverterar till JSONL med PROD-kolumn-
  namn (type→event_type) = katastroftidens REST-inmatningsfiler.
- `--fil X --plan-supabase` — batch-plan för REST-återinläsningen. Verktyget läser
  ALDRIG .env/nycklar — planen redogör för vad huvudagenten tillför.
Exit 0 endast när samtliga domar GRÖNA.

## Sabotagebevis (3/3 gripna, RÖD + exit 1)

1. **Trunkerad gzip** (15,0 MB av 26,6 MB av äkta 09-09-arkiv): Z_BUF_ERROR
   "unexpected end of file" ELLER radantalsmismatch (71 421 lästa av 146 727 utlovade)
   — domas RÖD på två oberoende vägar.
2. **Förfalskat antal** (header utlovar 146 727, 3 verkliga rader): RÖD.
3. **truncerad:true** (arkivet själv flaggar ofullständighet): RÖD direkt i
   header-kontraktet.
Under utvecklingen greps också ett eget verktygsfel av övningen: `psql -q` tystar
"COPY n"-tagen som domen tolkar (verdictet föll RÖT trots lyckad restore — kör 1).
Lapp: -q borttagen; kör 2 GRÖN med COPY-n=146 727. (Beviset på övningars värde:
instrumentet döms av samma grind som arkivet.)

## Mätresultat

**Verifiering (ren verify, konstant minne):**
- 09-08: 25,9 s resp. 28,1 s (två körningar) · GRÖN · 146 623 rader, 0 felaktiga
- 09-09: 36,9 s · GRÖN · 146 727 rader, 0 felaktiga
→ verify-RTO ≈ 26–37 s per arkiv (CPU-bunden skanning, ~10–14 MB/s okomprimerat).

**Återställning i lokal PG17-skrap-DB (ak1a_dr_json, schema ur db-2026-09-15.sql.gz):**

| Körning | Väggklocka-RTO | COPY-räknat | Dom | Not |
|---|---|---|---|---|
| 1 | **51,6 s** | (psql -q-bugg: n=null) | RÖD* | *restore LYCKADES — verifierad i PG; verktygsfel kurat |
| 2 | **57,6 s** | 146 727 | **GRÖN, exit 0** | efter lapp |

→ kedja 2 RTO **≈ 52–58 s för 146 727 rader** (~2 600–2 850 rader/s inkl. parse).
Jämförelse kedja 1 (SQL, hela databasen): 14,7–20 s. Kedja 2 är ~3× långsammare men
wederbörligen begränsad till loggen — total återställning båda kedjorna ≈ 70–80 s.

**Oberoende verifiering I PostgreSQL (ej verktygets egna tal):**
- `count(*) = 146 727` ✓ · `count(distinct id) = 146 721` (→ fynd 2)
- 9 event_type: oversattning 144 803 · trafik 1 505 · sakerhet 293 · akm2_snapshot 100
  · organ 14 · signal 7 · email_kö 3 · vagvalidering 1 · vagscan 1 (summa ✓)
- tidsfönster `2026-09-03 22:43:12.603298+02 … 2026-09-09 19:09:01.599488+02` —
  sekundexakt mot verktygets ström ✓
- details landat som ÄKTA jsonb: `details->>'dag'` läsbar ✓
- severity: info 146 463 · warning 264

## FYND (6)

1. **Schemadrift i arkiven — restore skulle misslyckats med naiv import.** Arkivet
   2026-09-09 bär nyckeln `type` (exportören gör `select=*` mot PostgREST); SQL-dumpen
   2026-09-15 har kolumnen `event_type` — namnbyte skedde alltså mellan 09-10 och
   09-15. Verktyget mappar BÅDA nycklarna; katastrofplanen bygger JSONL med prod-namn.
   Utan provet hade engångs-skriptet vid katastrofen kört mot fel kolumn.
2. **6 dubblett-id i 09-09-arkivet (09-08: 0).** Tabellen saknar primärnyckel (CREATE
   TABLE i dumpen bär ingen PK-sats). Trolig rotorsak: exportörens offset-baserade
   Range-paginering under högt skrivtryck (rad inlagd mitt i exporten skjuter
   efterföljande sidor → samma rad på två sidor; 09-09 mitt i översättningsmaraton),
   alternativt äkta dubbelinsättningar i tabellen. Kur (huvudagenten): keyset-
   paginering (created_at,id < sista) i backup-fran-molnet.mjs; ev. unik nyckel på id
   i Supabase är ett DR-fönster-beslut (dubbletter måste rensas först). Verktyget
   rapporterar dubblett-id vid varje körning.
3. **RPO-gap: senaste JSON-arkiv på valvsdisken är 6 dagar gammalt.** DRIFTSBOKEN
   lovar "max ett dygn gammal när datorn varit på" — ingen system-events-full har
   landat sedan 2026-09-09 19:09 (hybrid-sync tyst; SQL-nattcronen lever, så felet
   är på datorsidan av kedjan). Skärpning därutill: den LEVANDE tabellen har gallrats
   — 09-08-arkivet når till 2026-08-09, 09-09-arkivet endast till 2026-09-03 — så
   händelsehistoriken före 2026-09-03 finns NU ENDAST i 09-08-arkivet. Konsekvens-
   regler: (a) system-events-full-*.json.gz är ARKIVHANDLINGAR — den 30-dagars-
   retentionen gäller ALDRIG dem; (b) sync-tystnaden sedan 09-09 är ett DR-larm,
   inte kosmetik (värdet som går förlorat är unik historik, inte bara färskhet).
4. **Tillväxten är ~+104 rader/dag** (146 623→146 727) trots aktiv trafik — loggen
   hålls ~stationär av gallringen. Exportörens 200k-tak (40 sidor) är årtionden
   borta; inget trunkeringshot.
5. **psql -q-buggen** (se sabotageavsnittet) — egen, gripen och kurad inom provet.
6. **Låsprotokoll-mismatch mot s10-u4:s dr-ovning.mjs** (bokförd efter att syskonet
   landade 19:25, mellan mina förkontroller och PG-fönstret): u3:s kur ordagrant är
   "låsfil /tmp/ak1a-dr-prov.lock, flock-mönstret" — detta prov använde flock;
   s10-u4:s verktyg implementerar ATOMÄR FILSKAPANDE + pid/starttid (upptaget =
   exit 3, dött lås tas över efter 30 min). De två mekanismerna utesluter INTE
   varandra (flock-rådgivande lås syns inte för filexistens-kollen, och en
   existensfil syns inte för flock) — hade fönstren krockat hade kuren varit en
   skenbar trygghet. Faktiska fönster denna dag: s10-u4 klar 19:25:16, detta probs
   fönster 19:28–19:31 — ingen kollision, men det var tur, inte skydd. flock lämnar
   dessutom kvar filen på disken efteråt (städad manuellt i detta prov — deras
   verktyg hade annars vägrat nästa körning). KUR till huvudagenten: lås dr-ovning.mjs FLOCK-på-samma-fil I TILLÄGG
   till filprotokollet (två mekanismer, ett fönster), alt. ett gemensamt hjälpskript.

## Katastrofplan (sammanfattning; `--plan-supabase` skriver ut den färdiga)

1. `node verktyg/aterstall-system-events.mjs --fil <arkiv>` → GRÖN
2. `--jsonl-ut /tmp/se-full.jsonl` + `split -l 500 /tmp/se-full.jsonl /tmp/se-batch-`
3. POST `{SUPABASE_URL}/rest/v1/system_events` per batch (apikey/Authorization =
   huvudagentens .env) — **ALDRIG `Prefer: resolution=ignore-duplicates`** (ON
   CONFLICT kräver unik nyckel → fel; trogen restore behåller dubbletterna)
4. Efterkoll: radantal i Supabase === header.antal innan arkivet får raderas.

## Städning (fönstret stängs alltid: dropdb + stop)

ak1a_dr_json droppad (båda körningarna) · PG17 stoppad och verifierad `down` ·
sabotagefiler + /tmp/dr-fonster-s10u3.sh + flock-låsfilen rensade · disk 78 GB
ledigt · DR-låset frigjort vid fönstrets slut. Rollen `ak1a` skapades i
skrap-klustret (createuser -s; endast lokalt kluster 17 — vidrör inte Supabase).

## KVD

Endast `verktyg/*.mjs` + `data/**.md` berörda — src/ orörd, inget bygge, tsc-baslinjen
orörd (grinden kör vid commit). Inga nycklar lästa eller återgivna. R2-ytor orörda.

## Nästa övning

Kvartalsövning senast **2026-12-15** — mallen är nu BÅDA kedjorna: SQL-nattdump
(14,7–20 s) + moln-JSON (52–58 s), samt u1:s dump-markörsvakt GRÖN och detta verktyg
GRÖN på senaste arkivet. Öppna kurer till huvudagenten: se FYND 2–3.
