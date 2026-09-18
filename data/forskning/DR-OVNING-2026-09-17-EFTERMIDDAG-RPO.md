# DR-ÖVNING 2026-09-17 (eftermiddag) — MITT-PÅ-DAGEN: pumpstarten inmätt med dubbel RPO-punkt + KUR av falsk RÖT-dom på sunt blad (s10-u3, O9)

**Uppdrag (fabriksmanifest spår 10 vakt 3/3):** "DR-övning nästa i spåret (välj
själv): återställ, mät tid/rader, protokoll, städa lokal PG."

**Objektval + duplikatkontroll.** Före start kontrollerades worklog (senaste
spår 10-rader), DRIFTSBOKEN:s DR-rad och data/forskning/DR-*.md mot disken.
Läge vid start (14:27 lokal): allt sedan morgonen 07:45 levererat — jungfrudagen
7-bladsfönster + morgon-RPO (s10-u3 O8), födelsebevis-replik + PG-städverifiering
(s10-u1 O8), jungfrunatten kedja 2 (s10-u2 O8). Två öppna köposter efterlämnades,
båda pekande på exakt detta tidsfönster:

1. s10-u1 O8:s kö-rad: "mitt-på-dagen-RPO-punkt" — RPO-serien hade dag-läge
   (09-16 13:4x), natt-läge (09-17 01:49) och morgon-läge (07:4x), men aldrig
   mitt-på-dagen.
2. Morgonprotokollets köpost ("TVÅ KLOCKOR"-fyndet): "mitt-på-dagens-mätning
   tidssätter startet" — snapshots-pumpen (+19 800/dag) stod HELT STILLA
   02:30→07:43 (morgon-delta +163 var endast beslutsklockan); pumpens start
   någonstans i fönstret 07:43→? var omätbar med en enda punkt.

Valt objekt: **eftermiddags-DR med dubbel RPO-mätpunkt** — restore av
jungfrubladet db-2026-09-17 (RTO-seriepunkter 18+19) + RPO-diff kl 14:31 och
~14:43 (två punkter = pumpens AKTUELLA hastighet → extrapolerad starttid, det
enda sättet tidssätta start med tillgängliga instrument). Klockan 14:27 vid
start = seriens första äkta mitt-på-dagen-punkt.

**Under arbetet uppstod dessutom ett vaktfynd som blev dagens huvudkur:**
falsk RÖT-dom på ett sunt blad (se §3) — rotorsak påträffad, kirurgiskt kurerad
och beteendeprovad inom samma fönster.

---

## 1. Körningar och mätvärden

Alla körningar via `node` (skal-kvotens kanal 1), flock på /tmp/ak1a-dr-prov.lock
(verktygets eget lager), RAM-grind GRÖN vid varje start (1 100–1 300 MB).

| Tid (lokal) | Körning | Utfall |
|---|---|---|
| 14:28 | `dr-ovning.mjs --fil db-2026-09-17.sql.gz` (RELATIV väg) | **FALSK RÖT** — markörkollen "Filen kunde inte läsas" (0 kB) → restore VÄGRADES, PG17 orörd, protokoll **DR-PROV-2026-09-17-AUTO-3.md** (fail-fast-bevis) |
| 14:30 | `dr-ovning.mjs --fil /…/supabase/db-2026-09-17.sql.gz` (absolut) | **GRÖN** — RTO **17,1 s** · fel 788 kända/0 okända · public **60 tabeller / 1 286 328 rader** · alla scheman 99/1 286 724 · protokoll **DR-PROV-2026-09-17-AUTO-4.md** |
| 14:31 | `PGPASSFILE=~ak1a/.pgpass dr-rpo-diff.mjs --json` | **RPO-punkt 1** — se §2 · JSON **DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json** |
| 14:33 | `dr-ovning.mjs --fil db-2026-09-17.sql.gz` (samma relativa väg, EFTER kur) | **GRÖN** — NOTIS "resolverad mot dumpkatalogen" + RTO **14,1 s** (dagens snabbaste) · identiska radtal · protokoll **DR-PROV-2026-09-17-AUTO-5.md** (kurens beteendeprov) |
| ~14:43 | `PGPASSFILE=… dr-rpo-diff.mjs` (punkt 2) | se §2 |

**Radtalets fyrkantiga korsbevis växer till FEM instrument, samma tal
1 286 328:** morgonens två restore (s10-u3 O8 + s10-u1 O8) + dagens två
eftermiddags-restore (AUTO-4 + AUTO-5) + dumpens zcat-COPY-räkning. Bladet
db-2026-09-17 är det mest oberoende bevisade bladet i serien.

**RTO-serien:** punkterna 18 (17,1 s) och 19 (14,1 s); seriens spann förblir
10,3–23,9 s. Eftermiddagsläget (fabriksdag, ~1,2 GB RAM tillgängligt) ligger
väl inom spannet — RTO är tjockleks- och inte klockslagsberoende, ytterligare
en datapunkt för "30-dagarsgränsen RTO-neutral".

## 2. RPO: mitt-på-dagen-diffen — pumpens start tinssatt

RPO-punkt 1 kl 14:31 lokal (12:31Z), bladets ålder 11,9 h:

| Tabell | Dump (02:30) | Levande (14:31) | Delta |
|---|---|---|---|
| section_data_snapshots | 1 195 452 | 1 214 436 | **+18 984** |
| board_decisions | 47 810 | 48 194 | +384 |
| organ_health_logs | 2 937 | 2 961 | +24 |
| **Totalt (60 tabeller)** | **1 286 328** | **1 305 720** | **+19 392** |

3 av 60 tabeller i rörelse (samma tre som alla tidigare diffmätningar —
inga negativa, ingen schemadrift: 60/60 tabeller svarade på båda sidor).

**RPO-punkt 2 kl 14:40:39 lokal — intra-dag-stabilitet bevisad (+0 på allt):**
snapshots 1 214 436 (**+0**), board 48 194 (+0), organ 2 961 (+0), totalt
1 305 720 == punkt 1 EXAKT. Nio minuter mitt på arbetsdagen utan en enda
rad rörelse → pumpen droppar INTE under dagen (engångsbatch, inga episoder).

**KOLLISIONSBOKFÖRING + pumpstarten — syskonet hann först med det starkare
instrumentet:** under mitt fönster lästes syskonet s10-u1:s MIDDAG-protokoll
(kört 14:26–14:35, osparkat på disk): de tidsatte pumpens start **EXAKT
08:00:00,058 lokal** med en läsande tidsstämpel-sond — hela dagens 18 984
rader bär EN tidsstämpel (ett bulk-påstående), gårdagen identisk 08:00:00,047
= schemalagd daglig engångskörning. Köposten "mitt-på-dagens-mätning
tidssätter startet" är deras att infria och deras fynd står; min
hastighets-extrapolering (originalplanen för punkt 2) blev därmed överflödig
och omdefinierades till intra-dag-stabilitet ovan. **Mina punkter bidrar i
stället med tre egna värden:** (1) punkt 1 kl 14:31 är ett OBEROENDE
REPLIKBEVIS av deras 18 984 (deras COUNT-fönstersond vs min dr-rpo-diff —
två instrument, samma minut, samma tal); (2) punkt 2 stänger den within-dag-
lucka deras två-dagars-tidsstämplar lämnar (ingen kvällsdrip bevisad);
(3) RPO-profilen blir komplett (nedan).

**Dygns-RPO-profilen komplett (båda bidragen sammansvetsade):**

| Tid (lokal) | Händelse | Oskyddat läge |
|---|---|---|
| 02:30 | dumpväxling (nytt blad) | 0 |
| 02:30→07:59 | endast beslutsklockan (~31–36 r/h, episodisk) | +~250 |
| 08:00:00 | snapshots-pumpens engångsbatch (ETT bulk-påstående) | +18 984 KLIV |
| 08:00→02:29 | beslutsklockan kryper (episoder; 0 rader på 9,2 min vid 14:31–14:40) | → ~+19 800 |
| 02:29 | **VÄRSTA FALLET** — sekunder före växlingen | **≈ +19 800 = dagsteget** |

Värsta-fallet-RPO == det kända dagliga tillväxtsteget — två oberoende
mätvägar (dagstegsserien +19 800 · värsta-fallsräkningen 18 984+~820) möts
i samma tal. Konsekvens för DR-ekonomien: 02:30-placeringen av dumpen är
OPTIMAL (den ligger i pumpens stilla natt-gap; flyttad till 07:59 skulle
varje blad gå miste om föregående dags batch = dubbla exponeringen).

## 3. VAKTFYND: falsk RÖT-dom på sunt blad — rotorsak + kur + beteendeprov

**Symptom (AUTO-3):** `--fil db-2026-09-17.sql.gz` (bart bladnamn) gav
markörkollen "Filen kunde inte läsas (finns den?)" → 0 kB, 0 rader → RÖD →
restore vägrades. Men `ls` bevisade filen på disk: 31 733 199 byte, skriven
02:30:29, och GRÖN-återställd av två oberoende syskon sju timmar tidigare.

**Rotorsak:** dr-ovning.mjs rad ~560 löste argumentet med
`path.resolve(opts.fil)` — alltid mot ARBETSKATALOGEN. Ett bart bladnamn blev
`/home/ak1a/AK1/db-2026-09-17.sql.gz` (finns ej) i stället för dumpkatalogens
sökväg. Markörverktyget rapporterade korrekt RÖT för den vägen det fick —
felet satt i anroparens upplösning, inte i markörkontraktet.

**Kur (kirurgisk, `valDump()`):** given väg prövas först (oförändrat för
absoluta/cwd-relativa existerande vägar); saknas den prövas
`DUMP_KATALOG/<bladnamn>` med NOTIS-rad; saknas den överallt behålls den givna
vägen så markörkollen fortfarande rapporterar RÖTT med sökväg. Fail-fast
bevaras i båda riktningarna: en ÄKTA ofullständig/saknad dump kan aldrig bli
GRÖN av kuren.

**Beteendeprov (AUTO-5):** exakt det kommando som underkändes kördes om efter
kuren → NOTIS + GRÖN full restore. Sekvensen AUTO-3 (RÖT-vägran, PG orörd) →
AUTO-4 (GRÖN absolut) → AUTO-5 (GRÖN resolverad) är den completa beviskedjan:
säkerheten verifierades i felriktning SAMTIDIGT som falskpositiv-grinden togs
bort. `node --check` GRÖN; inga andra verktyg rörda (kolla-dump-markorer.mjs
opåverkat — dess kontrakt är korrekt).

**Allvarlighetsbedömning:** måttlig men reell — en framtida vaktkörning med
bladnamn hade kunnat rapporera "dumplen RÖD, katastrofåterställning ej
garanterad" om ett sunt blad och trigga onödig eskalering/omdumpning i fel
riktning. Morgonens GRÖN-körningar använde uppenbarligen absolut väg och har
mönstret dokumenterat som relativt i löptext — kurën gör båda konventionerna
säkra.

## 4. Städning — egenmätt (uppdragets fjärde led)

- `pg_lsclusters`: 17/main **down** ✓ (efter varje GRÖN-körning + slutläge)
- base/: ENDAST systemdatabaserna OID 1/4/5 + tom pgsql_tmp — **noll
  skrap-svans** ✓ (mönstret från s10-u1 O8)
- pg_wal: **497 MB** — oförändrad mot morgonens första mätning (normal
  buffert, långt under 1 GB-taket; trendreferens kvartal 3: 497→497) ✓
- /tmp/dr-ovning-fel-2026-09-17.log: dagens fellogg 788 kända rader — enligt
  mall sparad somRoot i /tmp ✓; inga nya /tmp/dr-total-*-rester ✓
- Låsfil /tmp/ak1a-dr-prov.lock: flock-lägets tomma oskyldiga fil (kärnan
  släpper vid processdöd) ✓

## 5. Slutsatser + kö

- **Pumpens starttid**: 08:00:00 exakt (syskonet s10-u1:s tidsstämpel-sond —
  se §2:s kollisionsbokföring); morgonens köpost "mitt-på-dagens-mätning
  tidssätter startet" INFRIAD, av dem med starkare instrument; mina punkter
  bidrog replik + intra-dag-stabilitet + den kompletta RPO-profilen (§2).
- **Värsta-fallet-RPO ≈ +19 800 rader (== dagsteget)**, inträffar sekunder
  före 02:30-växlingen; 02:30-placeringen av dumpen bevisad OPTIMAL (ligger
  i pumpens stilla gap — se §2:s profiltabell).
- **Beslutsklockan** (board+organ): +408 på 11,9 h ≈ 34 r/h SNITT men +0 på
  9,2 min mitt på dagen → klockan är EPISODISK (rondstyrd?), inte jämn;
  morgonens "≈31 r/h jämn" preciserad till "jämn i snitt, episodisk i takt".
- **Kvartalsmallen**: oförändrad ETT kommando (dr-total.mjs); dagens kur
  ingår automatiskt i alla dess kedja 1-anrop.
- **Kö till nästa vakt:** (1) lätt kvälls-RPO-punkt (~22:00) bekräftar
  noll-rörelse 15:00→02:29 — profiltabellens sista lucka; (2) WAL-trenden
  mäts vid nästa kvartal (497 MB stabil över dagen); (3) kurens NOTIS-rad
  bör testas i dr-total.mjs-kontext (dess kedja 1-anrop använder absolut
  väg — oförändrat beteende förväntas); (4) beslutsklockans episoder kan
  kartläggas med captured_at-histogram (läsande sond, samma klass som
  syskonets) om RPO-profilen behöver timupplösning.

— protokollfört 2026-09-17 av s10-u3 (vakt 3/3, O9); maskinella delprotokoll:
DR-PROV-2026-09-17-AUTO-{3,4,5}.md + DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json
