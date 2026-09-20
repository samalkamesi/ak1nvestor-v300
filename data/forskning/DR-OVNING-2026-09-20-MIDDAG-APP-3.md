# DR-ÖVNING 2026-09-20 MIDDAG — APPENS DATABAS PUNKT 3 (aufr): första fulla dygncykeln + RAM-grindens eldprov (GODKÄNT)

**Agent:** s10-u2 (manifest auto-s10-1789900509524, vakt 2/3) · **Fönster:**
anspråk ~12:39:3x · körning 12:40:23–12:43:33 lokal (under DR-flock) ·
eftermätning 12:45–12:5x · **Order:** "DR-övning nästa i spåret (välj själv):
återställ, mät tid/rader, protokoll, städa lokal PG."

## 1. VAL + anspråkscap (ärligt bokförd)

rkaq-kärnan var levererad för dagen (blad 10 ×2 inom 82 s i morse: u2 AUTO
11,7 s · u3 AUTO-2 12,9 s, radkontrakt identiskt; blad 9 ×13+) — en tredje
blad-10-restore samma dygn = duplikat. **APPENS databas (aufr) hade exakt två
punkter någonsin (båda 09-19: 16:39 + 22:32) — ingen middag/dagpunkt fanns, och
dygnsprofilen saknade sin dag-söndags-fas.** Mitt objekt = punkt 3 med första
fulla dygncykeln. Verktyg: `node verktyg/dr-appdump.mjs` OMODIFIERAT
(u2-föregångarens yta, u3-precedensen).

**Anspråkscap:** u3:s anspråk (samma objekt, ramat "DAGPUNKT aufr") var FÖRST
på disk 12:38:27; mitt ~12:39:3x. Min duplikatkontroll avsåg 12:37 (före båda)
men läsningen var ~90 s färskare än skrivningen — korrigerat i anspråksfilen.
D20-dom: ingen avvisning. **Min körning tog flock-fönstret först**
(12:40:23–12:43:33); u3:s replik startade exakt vid min release (låsfil
pid 3625737 12:43:33, pågående vid mitt protokollskrivande — deras yta orörd,
deras leverans deras). u1 valde blad 10:s dagpunkt (rkaq) — disjunkt.

## 2. Genomförande — RAM-grindens eldprov (orderns fyra led)

FÖRSTA försöket 12:39 vägrades korrekt: **MemAvailable 832 MB < 1 000 MB —
exit 75** (prod-synkens next-build höll 5,1 GB; deployfönstret äger servern).
Grinden AVRIM sig inte: övningen skippades, servern skyddades, inget OOM-läge.
Node-wrapper i **/tmp** (skraphygien — ingen ny _-fil i verktyg/) bevakade
fönstret: öppnades 12:39:53 vid **5 795 MB** (bygget landade), körning startad
12:40:23 @ 5 607 MB. **DR-beredskap på 8 GB-servern är deploy-fönsterberoende —
ett DR-prov under pågående prod-bygge vägras; detta är korrekt beteende, inte
ett fel, och nu ett dokumenterat driftläge.**

| Led | Resultat |
|---|---|
| ÅTERSTÄLL | pg_dump aufr **114,8 s · 84,1 MB gz** (sha256 223b6e8189ce4021…, slutmarkör GRÖN, COPY 420/CREATE 418) → skrap-DB ak1a_dr_app i PG17 → restore **RTO 20,4 s** · fel 109 rader = 109 kända/**0 okända** → /tmp/dr-appdump-fel-aufr-p3620937-1789900983600.log |
| MÄT | public **372 tabeller/181 143 rader** · public+storage 380/182 488 · alla scheman 417/184 307 · system_events **169 313** · user_activities **5 944** · auth.users 45 · members 3 · board_decisions 77 · profiles 11 · ai_generated_courses 154 |
| PROTOKOLL | maskinellt DR-APPDUMP-2026-09-20-KEDJA0.md/.json (unikVag) + detta agentprotokoll + DRIFTSBOK-sektion + worklog-rad |
| STÄDA | skrap-DB raderad · PG17 stoppad · dumpfil raderad (GDPR) — OBEROENDE eftermätning §8 |

Verktygets 7 steg GRÖNA, exit 0.

## 3. Dygnsprofilen — FÖRSTA FULLA CYKELN (5 punkter, 34 h)

| Tidpunkt (lokal) | Källa | system_events | Växt | Fönster | Takt | Fas |
|---|---|---|---|---|---|---|
| 09-19 02:40 | kedja-2 JSON (ENDA kopian) | 166 067 | — | — | — | natt |
| 09-19 16:39 | KEDJA-0-dumpen | 167 219 | +1 152 | 13,98 h | **82,4 r/h** | dag lördag |
| 09-19 22:32 | KEDJA-0-2-dumpen | 168 269 | +1 050 | 5,87 h | **179,0 r/h** | kväll |
| 09-20 02:40 | kedja-2 JSON | 168 696 | +427 | 4,13 h | **103,4 r/h** | natt |
| 09-20 12:41 | denna dumpen | 169 313 | +617 | 10,02 h | **61,6 r/h** | dag söndag |

**FYND — dagfasen är INTE konstant:** söndagsmiddag 61,6 r/h är **0,75×**
lördagseftermiddagen 82,4 r/h. Gångens tvåledsmodell (dag/kväll) förfaller till
**tre faser med helgdagsvarians i dagläget: natt ~103 · dag 62–82 · kväll ~179
r/h** (kvällen = 2,9× dag). u3:s kvällsläxa ("tvåpunktsbas per tabell OCH per
dygnsfas") utökas: **per veckodag också** — lördag ≠ söndag är nu mätt.

## 4. Dekomposition EXAKT (dump-till-dump, 22:32 → 12:41 = 14,15 h)

public 179 902 → 181 143 = **+1 241 = system_events +1 044 + user_activities
+197** (+0 i övriga 370 tabellerna: board 77 · members 3 · profiles 11 ·
auth.users 45 alla stilla — tredje punkten på "två skrivare"-bilden).

Dumpsidan delelar EXAKT mot fasprofilen: system_events +1 044 = natt +427
(103,4 r/h) + dag +617 (61,6 r/h) — kedja-2:s 02:40-värde är fungerande
delpunkt, fasmodellen och dumpserien är samma verklighet.

**user_activities ANDRA växtpunkten:** 5 747 → 5 944 = +197 på 14,15 h =
**13,9 r/h dag** mot 61,2 r/h kväll (4,4×) — tabellen som saknas i ALLA
backup-kedjor (skyddskarta §7.5) växer nu med mätt takt i två faser.

## 5. RPO vid middag — appens oskyddade händelseminne

ENDA kopian (system-events-full-2026-09-20.json.gz, 02:40, truncerad false,
168 696): gap **617 rader/10,02 h = 61,6 r/h exponering** vid mätpunkten.
**Prognos till nästa 02:40-växling** (kväll ~1 050 + natt ~427 återstår):
totalt gap ≈ **+2 100, band [1 900, 2 400]** → system-events-full-2026-09-21.json.gz
≈ **[170 600, 171 100]** — verifierbar två oberoende vägar (filens
total-kontrakt + nästa dags restore).

## 6. Instrumentets reproducerbarhet — tredje fulla körningen

- **Dumptid 114,8 s** — seriens snabbaste fullpunkt (band 105–415 håller;
  söndagsmiddag = låg WAN-last, spegelbild av RTO-läget).
- **RTO 20,4 s** — bandets snabba kant (serie 20,3–26,8; u2:s kodifiering
  20–30 s håller tredje dagen; 372 tabellers DDL driver RTO, ej radmassa).
- **Fel 109 kända/0 okända ×3 fulla körningar** och felloggarna **BYTE-IDENTISKA
  5 927 B** över två dagar (p3620937 idag == p3178691 igår) — felbildens
  determinismenvå, oberoende av dataflytten under den.
- **Universum EXAKT ×3:** public 372 · +storage 380 · alla 417 · COPY 420 ·
  CREATE 418 — schemat statiskt över dygnet; dumpen 84,1 MB gz (oförändrat
  rundat; sha ny = datat rörde sig).

## 7. Prediktionsdom (P1–P9 låsta på disk FÖRE körning)

| P | Förutsagt | Mätt | Dom |
|---|---|---|---|
| P1 system_events | band [169 200, 170 900] | **169 313** | ✅ (lägre halvan — söndagstakten) |
| P2 public rader | band [180 900, 182 900] | **181 143** | ✅ |
| P3 RTO | 20–30 s | 20,4 s | ✅ (bandets kant) |
| P4 fel | 109/0 EXAKT | 109/0 | ✅ EXAKT |
| P5 universum | 372/380/417 | identiskt | ✅ EXAKT |
| P6 dumpkontrakt | GRÖN · 420 · 418 · 83–86 MB | GRÖN · 420 · 418 · 84,1 | ✅ |
| P7 dumptid | 100–500 s | 114,8 s | ✅ |
| P8 städning | full, egenmätt | bevisat §8 | ✅ |
| P9 kedja-2-fönstret | 168 696 · truncerad false | 168 696 · false | ✅ EXAKT |
| Bonus user_activities | [5 850, 6 250] | 5 944 | ✅ |

**10/10 — första helgrenna prediktionstålingen i APP-serien.** Gårdagens
3-miss-dagar (båda kvällspunkterna) kom av fasblinda modeller; fasmedvetna
band (natt/dag/kväll + marginal för helgdag) håller. Läxan verifierad:
fasmedvetenhet ÄR kuren.

## 8. Städning — OBEROENDE eftermätning (ej verktygets självrapport)

- `pg_lsclusters`: 17/main **down** ✓ · psql-socketvägran ✓
- Min dumpkatalog `/tmp/dr-appdump-aufr-*-p3620937` BORTA (GDPR; sha256 är
  beviset) ✓ — katalogen som SYNDS i /tmp (p3625737) är **u3:s PÅGÅENDE
  replik-dump** (deras yta, orörd)
- Fellogg kvar enligt mall: p3620937-1789900983600 (pid+ms) ✓
- DR-låsfilen: **överlämnad till u3:s pågående flock-fönster** (pid 3625737) —
  ej viloläge just nu pga deras körning, vilket är KORREKT läge, inte städbrist
- Retention 10 blad (09-11…09-20) orörda — raderingsprediktion 10–13 intakt ✓
- Disk 57 G ledigt ✓

## 9. KVD + kö

**KVD:** src/ orörd = INGET bygge (tsc-baslinjen bärs av pre-commit-grinden) ·
R2 orörd (.pgpass/crontab/.env skriftligen orörda; verktygets kontrakt läser
DATABASE_URL endast vid körning, env-till-barn, ALDRIG loggat; prod-DB ENDAST
läst; GDPR: antal + tidsstämplar, dump raderad) · data/blogg/ orörd ·
data/backups endast läsning · syskonytor orörda (dr-appdump.mjs omodifierat;
u3:s pågående replik + u1:s blad-10-dagpunkt orörda) · commit MED pathspec,
commitmsg i /tmp (ROND 96-köposten).

**Kö vidare:** (1) u3:s replik läses av dem — determinismens fjärde korsbevis
väntar i deras protokoll; (2) blad 11:s födelsebevis 09-21 02:30 (board 50 882
· snapshots ≈1 271 388 · public ≈1 365 519) + APP-prognosen §5 mot
system-events-full-2026-09-21.json.gz; (3) retention-vakten: db-2026-09-11
först (~10–11); (4) DR-beredskapens deploy-beroende (§2) nu driftbokat — vid
DR-brand under deployfönster: vänta in fönstret, ALDRIG kringgå RAM-grinden;
(5) huvudagentens DUBBELPROJEKT-kur består (.pgpass + crontab db-app-*.sql.gz,
R2-nära) — appens RPO-gap (617 rader vid middag, ~2 100/dygn) är kurens pris.

SLUT — DR-OVNING 2026-09-20 MIDDAG APP-DB 3, genererad 2026-09-20T12:5x lokal
