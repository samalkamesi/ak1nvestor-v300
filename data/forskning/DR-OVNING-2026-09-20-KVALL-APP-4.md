# DR-ÖVNING 2026-09-20 KVÄLL — APPENS DATABAS PUNKT 4 (aufr): söndagens eftermiddag är redan i kvällstakt — trefasmodellens trappa gäller ej söndag

**Agent:** s10-u2 (manifest auto-s10-1789923906930, vakt 2/3) · **Fönster:**
anspråk 19:08:34 · körning 19:09:26–19:13:49 lokal (under DR-flock) ·
eftermätning 19:2x · **Order:** "DR-övning nästa i spåret (välj själv):
återställ, mät tid/rader, protokoll, städa lokal PG."

## 1. VAL + duplikatkontroll (disk-först)

rkaq-kärnan levererad idag ×3 (u2 AUTO 11,7 s · u3 AUTO-2 12,9 s · u1
dagpunkt) och aufr:s dagpunkt 12:41 + u3:s replik 12:43 — **kvällsfasen
saknades helt för dagen** (senaste DR-fil 12:48; /tmp utan dr-appdump efter
12:46; s9-anspråken 18:37–18:42 = SYSTEMKARTAN, disjunkt). Spårets bokförda
kö (MIDDAG §9 + DRIFTSBOK :2587 "kvällspunkt APP = kvällsfasens
tvåpunktsbas"): lördagskvällen 179,0 r/h var ENDA kvällspunkten —
**söndagskvällen osampad, och dagfasens fynd "söndag 0,75× lördag" saknade
sin kvällsspegel.** Objekt: kvällspunkt = APP-seriens punkt 4. Verktyg
`node verktyg/dr-appdump.mjs` OMODIFIERAT (u2-ytan, u3-precedensen).
Anspråk: data/vakten/auto-s10-1789923906930-s10-u2-ansprak-kvall-app-4.md ·
prediktioner låsta FÖRE körning:
/tmp/s10u2-kvall-prediktioner-1789924114.md (P1–P11, tidsstämplad
19:08:34, FÖRE låsförvärv 19:09:26).

## 2. Genomförande — orderns fyra led

| Led | Resultat |
|---|---|
| ÅTERSTÄLL | pg_dump aufr **177,7 s · 84,2 MB gz** (sha256 5067e913…, slutmarkör GRÖN, COPY 420/CREATE 418) → skrap-DB ak1a_dr_app i PG17 (var stoppad — korrekt viloläge) → restore **RTO 22,2 s** · fel 109 rader = 109 kända/**0 okända** → /tmp/dr-appdump-fel-aufr-p3854264-1789924398258.log |
| MÄT | public **372 tabeller/182 331 rader** · public+storage 380/183 676 · alla scheman 417/185 504 · system_events **170 174** · user_activities **6 271** · auth.users 45 · members 3 · board_decisions 77 · profiles 11 · ai_generated_courses 154 |
| PROTOKOLL | maskinellt DR-APPDUMP-2026-09-20-KEDJA0-3.md/.json + detta agentprotokoll + DRIFTSBOK-sektion + worklog-rad |
| STÄDA | skrap-DB raderad · PG17 stoppad · dumpfil raderad (GDPR) · dött flock-lås (egen pid) städat — OBEROENDE eftermätning §7 |

RAM-grinden: 1 806 MB tillgängligt > 1 000 ✓ (inget deploy-fönster igång;
MIDDAG §2:s deploy-beroende ej aktuellt). Verktygets 7 steg GRÖNA, exit 0.

## 3. Dygnsprofilen — punkt 6 + FYNDET: ingen trappa på söndagen

| Tidpunkt (lokal) | Källa | system_events | Växt | Fönster | Takt | Fas |
|---|---|---|---|---|---|---|
| 09-19 16:39 | KEDJA-0-dumpen | 167 219 | — | — | — | dag lördag |
| 09-19 22:32 | KEDJA-0-2-dumpen | 168 269 | +1 050 | 5,87 h | 179,0 r/h | kväll lördag |
| 09-20 02:40 | kedja-2 JSON (ENDA kopian) | 168 696 | +427 | 4,13 h | 103,4 r/h | natt |
| 09-20 12:41 | KEDJA-0-2 (middag) | 169 313 | +617 | 10,02 h | 61,6 r/h | fönstrets MEDEL |
| 09-20 19:12 | denna dumpen | **170 174** | **+861** | **6,52 h** | **132,0 r/h** | eftermiddag→kväll söndag |

**FYND — söndagens eftermiddag är REDAN i kvällstakt:** medeltakten
12:41→19:12 landar på **132,0 r/h = 0,74× lördagskvällens 179,0** — samma
kvot som dagfasens 0,75× (61,6/82,4). Trefasmodellens trappa (dag 62 →
kväll 179 vid ~17–18) finns inte på söndagen: bilden är **tvåläge** — låg
förmiddag, sedan en sammanhängande platå på ~132 r/h från tidig
eftermiddag rakt in i kvällen. P11:s tre domzoner (≤75 dag kvar · 75–135
mellan · ≥135 kväll) fick sitt svar på mellanzonens övre kant: inte
"dagen kvar", inte "övergång pågår" — **kvällsläget var etablerat redan
vid mätpunkten**; övergången ligger någonstans i 12:41–19:12-fönstret,
sannolikt tidigt (se §5:s systematiska miss).

## 4. Dekomposition EXAKT — fjärde punkten på "två skrivare"-bilden

public 181 143 → 182 331 = **+1 188 = system_events +861 + user_activities
+327 EXAKT** (+0 i övriga 370 tabellerna: board 77 · members 3 · profiles
11 · auth.users 45 · kurser alla stilla). UA:s takt 327/6,52 h = 50,2 r/h =
0,82× lördagskvällens 61,2 — samma söndagskvot-klass som SE:s 0,74×.

## 5. Prediktionståling (P1–P11 låsta på disk FÖRE körning)

| P | Förutsagt | Mätt | Dom |
|---|---|---|---|
| P1 system_events | band [169 650, 170 100] | **170 174** | ✗ **+74 över taket** |
| P2 user_activities | band [6 000, 6 250] | **6 271** | ✗ **+21 över taket** |
| P3 public rader | band [181 480, 181 950] | **182 331** | ✗ **+381 över taket** |
| P4 RTO | [18, 32] s | 22,2 s | ✅ |
| P5 fel | 109/0 EXAKT · logg 5 927 B | 109/0 · sha256 **IDENTISK** | ✅ EXAKT |
| P6 universum | 372/380/417 · 420 · 418 | identiskt | ✅ EXAKT |
| P7 dumpkontrakt | GRÖN · 83–86 MB | GRÖN · 84,2 | ✅ |
| P8 dumptid | [100, 300] s | 177,7 s | ✅ |
| P9 städning | full, egenmätt | bevisat §7 | ✅ |
| P10 kedja-2-fönstret | 168 696 · truncerad false | 168 696 · false | ✅ EXAKT |
| P11 BONUS fasdom | zonerna ≤75/75–135/≥135 | 132,0 r/h | ✅ dom: mellanzonens övre kant |

**7/11 + P11-dom; tre missar — alla i SAMMA riktning (tillväxten
underskattad).** Roten är en metodläxa, inte brus: modellerna A–D tog
MIDDAG-punktens "dag söndag 61,6 r/h" som en FAS-platå, men det talet är
ett 10-timmars FÖNSTERMEDEL (natt 103 + förmiddag ~35 blandat). **KUR:
fönstermedel ≠ fas** — nästa prediktion bygger på tvålägesprofilen per
veckodag (söndag: förmiddag ~35 · eftermiddag-kväll ~132; lördag har
trappan 82→179). MIDDAG:s 10/10 och mina 7/11 är båda fasmodellens
barn: middagen hade rätt fas, kvällen hade fel fönster-tolkning.

## 6. RPO vid kvällspunkten — appens oskyddade händelseminne

Gap mot ENDA kopian (system-events-full-2026-09-20.json.gz, 02:40,
168 696, truncerad false): **1 478 rader vid 19:12** (kopian 16,5 h gammal).
**Delprognos till 02:40-växlingen 09-21** (7,5 h kvar; två scenarier:
platå 132 hela vägen = +985 → 171 159 · platå till ~22:30 sedan natt ~103 =
+865 → 171 039): band **[170 950, 171 250]**, triangel ~171 080.
MIDDAG §5:s band [170 600, 171 100] landar min punkt i dess ÖVRE halva —
och **om platån håller hela vägen slår 171 159 igenom MIDDAG-taket**:
gränsfall som avgörs 02:40, två oberoende vägar (filens total-kontrakt +
blad 11:s restore). UA (saknas i ALLA kedjor, skyddskarta §7.5): 6 271 +
7,5 h × ~45–50 → **[6 580, 6 680]** vid 02:40.

## 7. Städning — OBEROENDE eftermätning (ej verktygets självrapport)

- `pg_lsclusters`: 17/main **down** ✓ · psql-socketvägran ✓
- Dumpkatalog i /tmp **BORTA** (GDPR; sha256 är beviset) ✓
- Fellogg kvar enligt mall (p3854264-1789924398258) — **sha256
  1ad5cfbee33f78d5… IDENTISK med både 12:43- och 09-19-körningarna:
  tredje dagen i rad, felbildens determinismenvå** ✓
- DR-låsfilen: verktygets flock-rad (egen pid, död efter avslut) **städad
  av mig** — viloläge rent åt nästa syskon (MIDDAG lämnade över till u3:s
  PÅGÅENDE fönster; här fanns inget pågående) ✓
- Retention 10 blad (09-11…09-20) orörda — crontabens -mtime +30 äger
  raderingen, db-2026-09-11 ~10 dagar ung ✓
- Disk 56 G ledigt ✓

## 8. Instrumentets reproducerbarhet — fjärde fulla körningen

- **Dumptid 177,7 s** — kvällens WAN-last högre än middagens 114,8
  (söndagskväll = folk online; spegelbild av RTO-läget) — bandet 105–415
  håller.
- **RTO 22,2 s** — mitt i u2-kodifieringen 20–30 s (serie 20,3–26,8),
  fjärde dagen.
- **Universum EXAKT ×4:** public 372 · +storage 380 · alla 417 · COPY 420 ·
  CREATE 418 — schemat statiskt över två dygn; dumpen 84,2 MB (oförändrat
  rundat; sha ny = datat rörde sig).
- **Fel 109/0 ×4** — determinismen nu korsbevisad över TRE dagar.

## 9. KVD + kö

**KVD:** src/ orörd = INGET bygge · R2 orörd (.pgpass/crontab/.env*
orörda; verktyget läser DATABASE_URL endast vid körning, env-till-barn,
ALDRIG loggat; prod-DB ENDAST läst) · GDPR: antal + tidsstämplar, dump
raderad · data/blogg/ orörd · data/backups endast läsning · syskonytor
orörda (dr-appdump.mjs omodifierat; u1/u3:s protokoll orörda) · commit MED
pathspec, commitmsg i /tmp.

**Kö vidare:** (1) 02:40 09-21 avgör dubbelprognosen (MIDDAG [170 600,
171 100] vs min [170 950, 171 250] — gränsfallet platå-taket) +
blad 11:s födelsebevis; (2) läran "fönstermedel ≠ fas" in i nästa
fasprediktion — tvåläge per veckodag, aldrig fönstermedel som platå;
(3) huvudagentens DUBBELPROJEKT-kur (crontab db-app-*.sql.gz, R2-nära) —
appens RPO-gap 1 478 rader vid 19:12 och ~2 100–2 600/dygn är priset tills
kuren landar; (4) UA:s växt nu mätt i tre faser (dag 13,9 · söndagskväll
50,2 · lördagskväll 61,2 r/h) — fortfarande oskyddad i alla kedjor.

SLUT — DR-ÖVNING 2026-09-20 KVÄLL APP-DB 4, genererad 2026-09-20T19:2x lokal
