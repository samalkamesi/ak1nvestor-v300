# DR-PROV 2026-09-16 — KEDJA 3: SERVERFILS-ARKIVET ( Spår 10, s10-u3 omgång 3 )

**Objekt:** DR-övning av den tredje och sista obevisade kedjan — serverfils-
arkivet (kod-tarball + git-historik + konfigsnapshots + env-backup). Kedja 1
(SQL-dump) är mätt 5× och kedja 2 (moln-JSON system_events) 1× — kedja 3 hade
ALDRIG restore-testats, och natten bevisade att den inte bara var obevisad
utan delvis DÖD.

**Val-motivering (kollisionskontroll):** uppdragstexten "DR-övning nästa i
spåret (välj själv)" är identisk med s10-u1/u2/u3(1)/u3(2)/u1(2)/u4:s — spårets
kända kollisionsmönster. Ett sjätte restore-lopp på SQL-kedjan (verktyget
`dr-ovning.mjs`) vore duplikat (5 RTO-punkter finns; ett syskon körde det
redan ikväll — `M verktyg/dr-ovning.mjs` + DR-PROV-2026-09-15-AUTO-4.md i
arbetsytan). Kedja 3 var spårets nästa icke-levererade objekt.

---

## 1. UPPGÅNGEN HÄLSOKOLL AV ARKIVEN (mätning)

| Artefakt | Mätning | Dom |
|---|---|---|
| server-repo-2026-09-09.tar.gz (250 927 456 B) | `tar -tzf` dör efter 681 poster, `gzip: invalid compressed data` | **RÖD — KORRUPT** |
| server-repo-2026-09-08.tar.gz (249 978 579 B) | full listning exit 0: 2 967 poster (751 src) | GRÖN |
| server-env-backup | 1 098 B, 18 nyckelNAMN (värden aldrig lästa/loggade), chmod **644** | FYND — doktrinen kräver 600 |
| server-pm2-dump.json | JSON.parse OK | GRÖN (men 7 d gammal) |
| server-crontab.txt / server-nginx-ak1a.conf | 27 / 46 rader, läsbara | GRÖN (men 7 d gamla) |
| system-events-full-2026-09-{08,09}.json.gz | senaste arkiv 09-09 → RPO-gap 7 dygn | FYND (u3:2:s fynd 3 lever) |

**Allvarligaste fyndet (F1):** det "senaste" kodarkivet (09-09) har varit
OBRUKBART i 7 dagar — obevisat kedjekontrakt är inget kontrakt. Vid
serverförlust hade DRIFTSBOKEN scenario b) pekat på just det arkivet.

## 2. ROTORSAKER (3 oberoende, alla bevisade)

- **F2 — integritetsgapet:** `backup-server-filer.mjs` godtog arkivet på
  ssh-exit-kod 0 + mottagna byte, men verifierade ALDRIG gzip-strömmen. En
  bruten ström med exit 0 (nätverksavbrott i slutet) blev ett "godkänt"
  arkiv. Samma buggklass som s10-u1 fann på pg_dump-dumparna — nu på
  tar-kedjan.
- **F3 — namndrift hetzner_key ↔ contabo_key:** verktyget letade
  `~/.ssh/hetzner_key` (gamla leverantören) medan `synka-dator.cmd` kontrollerar
  `contabo_key` — bevis i hybrid-sync.log: "ssh-nyckel saknas (…hetzner_key)
  — hoppar" (2026-09-09 20:09). Contabo-flyttingen dödade alltså tar+env-
  steget SILENT; de två arkiven är från före flytten.
- **F4 — hybrid-sync på datorn tyst sedan 2026-09-09 20:09:** inga moln-JSON-
  arkiv, inga konfigsnapshots från valvet sedan dess (Schemaläggaren/start-
  mappen lever ej). Kan INTE kuras från servern — eskaleras (§6).

## 3. KURER LEVERERADE I SAMMA NATT

1. **`verktyg/backup-server-filer.mjs` härdad** (3 kirurgiska ingrepp):
   - NYCKELFIL: `hetzner_key` → `contabo_key` (DRIFTSBOKEN §5:s nyckel).
   - Ny `gzipIntakt(fil)`: strömmande zlib-verifiering (konstant minne,
     portabel — inget gzip-binär-krav på Windows) FÖRE `renameSync`;
     underkänd ström → filen raderas + FEL-rad, ALDRIG ett godkänt arkiv.
   - KOMMANDO_TAR exkluderar numera även `.git`, `tool-results/`,
     `data/cache/`, `data/backups/` (motiv i F5/F6 nedan).
   - `node --check` GRÖN. Datorn drar kuren vid nästa hybrid-sync
     (git pull-steget).
2. **`chmod 600 data/backups/server-env-backup`** (doktrinkur; värden lästes
   aldrig — endast nyckelnamn, Mimosa-kontraktet).
3. **Färska VERIFIERADE arkiv skapade på SERVERN** (server-side tar eliminerar
   ssh-strömrisken helt) — se §4.

## 4. NYA ARKIV + MÄTTAL (kvällens övning)

**Arkiv A — `data/backups/server-repo-2026-09-16.tar.gz`** (arbetsytan: kod +
data + konfig, UTAN .git/node_modules/.next/tool-results/data-cache/data-backups):
- Skapande 16,4 s · **132 MB** (doktrinsvakten 500 MB: OK med marginal).
- Verifiering: `gzip -t` GRÖN · full `tar -tzf` exit 0: **8 436 poster** ·
  exkluderingskontraktet 0 brott (0 poster av de sex uteslutna).
- **Restore-test: 3,9 s → 7 903 filer** (+533 kataloger = 8 436, exakt) ·
  src 666 ts/tsx-filer, **200 991 rader kod** · spot-diff 4/4 IDENTISK mot
  levande trädet (package.json, next.config.ts, data/DRIFTSBOKEN.md,
  src/lib/seo.tsx).

**Arkiv B — `data/backups/server-git-2026-09-16.bundle`** (hela historiken):
- Skapande 17,6 s · **139 MB** · `git bundle verify`: "records a complete
  history", HEAD = 59939c18 (dagens develop-topp).
- **Restore-test: `git clone` från bundlen 8,3 s → 1 067 commits**, klonad
  HEAD = 59939c1, nuvarande toppen bevisat i klonad historia.

**Referensmätning på gamla friska arkivet (09-08):** restore 3,2 s · 2 564
filer + 403 kataloger = 2 967 poster (0 avvikelse mot listan) · src 522
filer/144 752 rader · **arkivets `.git`-HEAD = 023e9f95 — bevisad
föregångare till dagens HEAD OCH samma hash som worklog dokumenterar som
deploy-punkt 09-09** (arkivet var alltså en känd bra punkt; 09-09-filen som
ERSATTE den i "senaste"-ordningen var trasig).

**Total RTO kedja 3 (arkiv A + B):** ~12,2 s arbetsyta + historik (ella på
Contabo-disk; nätverksöverföring till ny VPS tillkommer i verklig katastrof).

## 5. FORTSATTA FYND (F5–F8, protokollförda)

- **F5 — .git 502 MB (x2 sedan 09-08):** med .git i tarballen passerade
  arkivet 500 MB-vakten (595,9 MB mätt — filen raderades och gjordes om).
  Historiken bär bl.a. gamla committade tool-results-blobbar. FYND: bundlen
  packar SAMMA historia till 139 MB (3,6× bättre) → `git gc` vid lugnt fönster
  skulle kraftigt krympa .git. **Kö till huvudagenten** (ALDRIG under aktiv
  fabriksdrift — tre agenter commitar).
- **F6 — rekursivt backup-i-backup:** gamla verktygslistan tog MED
  data/backups (500 MB gamla arkiv inuti nya arkivet) + tool-results (temp-
  filer) + data/cache (rörlig) → alla tre exkluderas numera (kur 3:an ovan).
- **F7 — RPO-gapet moln-JSON stängt server-side:** färsk körning av
  `backup-fran-molnet.mjs` PÅ SERVERN (servern kan alltså själv stänga gapet
  när datorn är tyst): **160 928 rader / 33 sidor / 26,2 MB på 42,0 s**,
  verify med `aterstall-system-events.mjs` **GRÖN alla 4 domar** (0 felaktiga,
  0 dubblett-id — bättre än 09-09-arkivets 6), tidsfönster 2026-09-03 …
  2026-09-15T22:40Z, verify-tid 22,6 s. OBS filnamnet bär UTC-datum
  (-2026-09-15) trots skapelse 09-16 00:49 lokal — namnkonvention, inte fel.
  **Kapacitetsfynd:** tillväxt +14 201 rader på 6,5 dygn = **+2 185/dag**
  (91 % typen `oversattning`) → det hårda taket 200 000 rader (40 sidor) nås
  om ~18 dagar. Verktyget markerar taket HEDERLIGT (`truncerad` i header +
  varningstext — motbevisar farhågan om tyst trunkering), men kapaciteten
  räcker inte i nuvarande takt: **kö till huvudagenten** (höj taket eller
  se över gallring av översättnings-events).
- **F8 — spårbarhet:** serverns `data/backups/` är en 7 dagar gammal KOPIA av
  datorns valv (hybrid-sync.log med Windows-sökvägar finns på servern; hur
  valvet synades hit är odokumenterat). Värdet är reellt (09-08-arkivet +
  env-backup + 5 SQL-dumpar fanns här) men kopplingen bör huvudagenten
  dokumentera eller schemalägga — server-side-arkiv är nu levererat (§4) och
  rekommendation: cron för vecko-arkivering (installerades EJ av denna övning
  — /etc/crontab ägs av huvudagenten, samma kö som s10-u1:s radbyten).

## 6. ESKALERINGAR (utom min jurisdiktion)

1. **Kundens dator:** hybrid-sync (Schemaläggaren + startmappen) har inte
   kört sedan 2026-09-09 20:09 — valvets samtliga kedjor står stilla. Kur
   hos kunden (huvudagenten formulerar kundnotis; ingrepp i datorns
   Schemaläggare kan ej göras från servern).
2. **`git gc`** vid lugnt fönster (F5).
3. **200k-taket** i backup-fran-molnet.mjs (F7).
4. **Cron för server-side arkivering** (F8) — tills dess är manuell kur:
   se §4:s kommandon.

**Kollision bevis nr 4 (dokumenterad i worklog):** ett syskons checkout/restore raderade verktygskurerna ur arbetsytan EFTER denna protokollsektions Edits men FÖRE commit — kurena omlevererades i EN Write och låstes i commit 55ddba50 (diff-mot-HEAD tom, node --check GRÖN).

## 7. KVD & STÄDNING

- `node --check` på kurerat verktyg: GRÖN · `node node_modules/typescript/
  bin/tsc --noEmit`: **0 fel** (baslinjen hel; src/ orörd — inga byggen).
- R2: orörd — inga nyckelvärden lästa, loggade eller committade (env-backup
  rördes endast med chmod; data/backups korrekt gitignorerat — en tidig
  misstanke om git-spårad env-backup MOTBEVISADES av `git ls-files --stage`
  tom + check-ignore).
- Städning: båda /tmp-restore-katalogerna + 9 tmp-filer raderade · **PG17
  rördes ALDRIG av denna övning** (kedja 3 använder ingen databa) — status
  verifierad DOWN före och efter · RAM efter körningar: grönt · disk 76 GB
  ledigt.
- Databasen orörd; inga deployrörningar; inga priser/tier/publicering.

## 8. KVAR I SPÅRET (nästa objekt)

- Kedja 3 kvartalskommando (föreslagen mall): packa + verifiera arkiv A
  (gzip -t + tar -tzf + spot-diff) och arkiv B (git bundle verify + klon),
  mät RTO, protokolla — fullt manuellt beskrivet ovan, mekanisering av
  `dr-ovning.mjs` är en naturlig fortsättning (annan agent än författaren).
- Datorns hybrid-sync-återupptagning (eskalering 1) — spårets största
  återstående risk.

*Levererat av fabriksagent s10-u3 (omgång 3), 2026-09-16 kl 00:37–01:25 lokal.*
