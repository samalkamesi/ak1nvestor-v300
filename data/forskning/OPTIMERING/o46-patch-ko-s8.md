# o46 — PATCH-KÖEN: beroende-patchens rotorsaksruta (spår 8, s8-u1, manifest auto-s8-1789642527960)

Datum: 2026-09-17 · Agent: s8-u1 (vakt) · Anspråk: `data/vakten/auto-s8-1789642527960-u1-ansprak.md`

## 1. Objektval (duplikatkontroll)

Spårets kontextord "beroendeuppdateringar (patch)" granskades mot o9–o45:
mätväkten (beroende-vakten, omg 1) levererad men dess bokföring visar ett
OLEVERERAT rotorsakshål — se §2. Övriga kontextord stängda: tsc-baslinjen
(dagligt mekaniskt bevis, o39 kontroll 11), döda länkar (omg 1 externa +
kvalitetsvakten sektion 5 GRÖN), Mimosa-rotorsaker (o15+paritet GRÖN),
0-fynd-jakt (kvalitetsvakten 11/11 PASS 0 manuella 05:09Z). o45 upptaget
av s7-u3 (flight-kurs) → o46 ledigt.

## 2. Rotorsakan

**Fakta:** `node_modules/next` = 16.3.2 i prod-trädet. Två CRITICAL-advisories
gäller (GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4, båda fix ≥16.3.3; senaste
patch 16.3.5, verifierad mot registry.npmjs.org 2026-09-17: `next@16.3.5`,
engines node ≥20.9 — servern kör v22.23.2). Beroende-hälsorapportens
UPPDATERING 2026-09-15 18.20 larmade: "next är fortfarande 16.3.2
INSTALLERAT … LARM till huvudagenten: inkludera patchen i nästa deploy;
beroende-vakten larmar (exit 1) tills dess."

**Larmet infriades inte på 2 dygn** (mätt igen 2026-09-17 av denna våg)
trots ≥8 lyckade automatiska deploys under perioden. Mekanisk rotorsaka,
inte disciplin: prod-synkens byggsteg är `npm ci` — den följer
package-lock.json EXAKT och uppdaterar ALDRIG beroenden. Larmet pekar på
en manuell `npm install <paket>` som ingen äger och inget schema har.
Alternativet "ändra package.json till ^16.3.3" är en FÄLLA (påvisad, ej
provad): npm ci FAILAR när package.json och lock divergerar = alla deploys
dör tills någon kör npm install = prod-synkens revert-loop. Och att skriva
locken för hand utan npm är omöjligt att göra ärligt (integrity-SHASUM
per paket). Slutsats: systemet saknar en laglig väg från larm till
patchad prod — patch-flödet är rotorsakslöst.

## 3. Kuren — PATCH-KÖN

`verktyg/prod-synk.mjs` (o46-tilläggen) + committad köfil
`data/infra/patch-ko.json` + runtime-kvitto `data/vakten/patch-kvitton.jsonl`
(untracked — överlever `git checkout -- .`, precis som versionsloggen).

**Princip: installationen förblir prod-synkens ensamrätt.** Fabriksbarn är
fortfarande förbjudna npm install (regeln orubbad); kön är en DEKLARATIV
beställning som ENDAST prod-synken verkställer — under
`flock /tmp/ak1a-deploy.lock`, i sin egen instans, med hela
stoppregelverket (RAM-vakt, artefaktgrind, HTTPS-kontroll) kringkring.

Kontrakt (mekaniskt enforceat i `lasPatchKo`/`tulkPatchPost`/`aktivPatchPlan`):

| Regel | Mekanism |
|---|---|
| Endast befintliga beroenden | Set ur package.json (deps+devDeps); främmande paket vägras = leveranskedjeskydd (kön kan UPPDATERA, aldrig TILLFÖRA) |
| Fail-closed | Oläsbar package.json ⇒ tomt set ⇒ allt vägras |
| Exakt semver | `^\d+\.\d+\.\d+(-…)?$` — ranges/^~/latest vägras = determinism i kvittona |
| Injektionshärd | Paket+versions-regex vägrar skal-metatecken, mellanslag, `$( )`, `;`, `../` LÅNGT före bash-strängen; spawnet använder JSON.stringify som extra lager |
| Tak + dedup | Max 10 poster; samma paket = senaste raden vinner |
| Kvitto | jsonl per försök; ok skrivs ENDAST efter deploy+HTTPS+lock-commit; 3 misslyckade för exakt (paket,version) = död post (loop-skydd); versionbyte = nytt liv |
| Aldrig blockera kod | Misslyckad install ⇒ kvitto + deploy fortsätter på befintlig lock |
| Patchisolering | Byggfail med patchad lock ⇒ locken rivs (`git checkout -- package.json package-lock.json`) FÖRE revert-vägen + misslyckat-kvitto; OOM ⇒ locken rivs utan kvitto (infra, nytt försök nästa poll) |
| PatchMode utan ny kod | Aktiv kö väcker synken trots `HEAD == senaste-deployad`; byggfail UTAN ny kod ⇒ INGEN revert (HEAD är god kod sedan förra deployen — revert skulle förstöra diglig kod) |
| Bokföringsordning | lock-commit FÖRE DEPLOYAD-markören (annars ser nästa poll kvitto-commiten som ny kod); commit-fail ⇒ misslyckat-kvitto (patchen lever bara i arbetsytan, rivs nästa synk) |

Nytt loggspråk: `PATCH-KÖ aktiv/aktiverad/BOKFÖRD`, `PATCH-KÖ väcker
synken utan ny kod`, `DEPLOYAD (patch-kö, o46): …`.

## 4. Köns aktuella innehåll (levereras i samma commit)

`next@16.3.5` + `eslint-config-next@16.3.5` — båda inom deklarerat
intervall (`^16.1.1`), patch-nivå, stänger båda critical-advisorierna.
eslint-config-next (devDep) följer next:s version av verktygskäl. NÄSTA
prod-synk-rop (pumpor min%10==7) hämtar denna commit som NY KOD och
patchar i samma deploy — live-beviset sker alltså automatiskt; läs
tillbaka `data/vakten/prod-synk.log` + `patch-kvitton.jsonl` + `node -e
"console.log(require('./node_modules/next/package.json').version)"`.

## 5. Bevis

- Svit `verktyg/testa-prod-synk-patchko.mjs`: **35 PASS / 0 FAIL** (giltiga/
  ogiltiga poster ×13, injektionsklasser, filnivå VÄGRAR, leveranskedjeskydd,
  dedup, tak, kvitto-roundtrip, loop-skydd 2-levande/3-död, versionbytes-
  nollställning, ok-efter-misslyckad) — fixturer i mkdtemp (OS-tmp,
  zonavtalet; sviten kan inte läcka tmp_*.ts till tsc).
- o43:s kontrakt i SAMMA fil obrutet: `testa-prod-synk-arbetsytasynk.mjs`
  **34/34 PASS**; o32:s `testa-prod-synk-tidsstampel.mjs` **12/12 PASS**.
- Import-vakten (o43) verifierad: svitens modulimport skrev INGEN rad till
  prod-synk.loggen (main() endast vid direkt program — deploy-kedjan kan
  inte avfyras av en import).
- `node --check` ×2 (prod-synk.mjs + sviten).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinären;
  .mjs typas ej av tsconfig men baslinjen får ej rubbas).
- Mimosa-paritet `^verktyg/` = **GRÖN, 0 fynd** (nya bash-strängar bärs av
  JSON.stringify + regex-validerade tokens).
- Kvalitetsvakten HELKÖRD efter ändringarna: **ANTAL FEL 0 | MANUELLA 0 |
  STATUS GRÖN** (11:07Z).
- INGET bygge (regeln — prod-synken äger); src/ orörd; R2 orörd;
  data/blogg/ orörd; .env orörda.

## 6. Bokningar

1. **Live-verifikation** = nästa prod-synk-rop efter denna commit (läs
   loggen: PATCH-KÖ BOKFÖRD + versionsmätning + prod 200). Om installation
   eller bygg misslyckas: kvittofilen + /tmp/synk-patch.log bär rotorsaken;
   3 misslyckade dödar posten skyddat.
2. **Beroende-vakten** (ägare av rapporten) bör vid nästa omgång tömma/
   uppdatera patch-ko.json istället för att larma manuellt — könen är den
   mekaniska mottagaren av dess "fix inom intervall"-fynd. (Köfilen kan
   lämnas kvar när kvittona säger ok — planen blir tom automatiskt.)
3. js-yaml/sharp/fflate/prismjs/satori-klassen (fix kräver major) förblir
   köat till major-beslut — patch-kön är medvetet INTE den kanalen (exakt
   version + endast befintliga deps = patchkanal).

## 7. Lärdomar

- "Larma till huvudagenten" utan mekanik är ett postkontor, inte en kur:
  larm som kräver manuell handling av en part utan schema är rotorsakslösa
  by design. Kuren var att ge installationens ÄGARE (prod-synken) en
  deklarativ indata — ansvar och förmåga på samma plats.
- Deploy-kritiska felväxlar måste resonera om VEM som är misstänkt: med ny
  kod + patch är båda misstänkta (revert-vägen gäller, locken rivs först);
  med patch UTAN ny kod är HEAD bevisat god (revert är förbjudet — annars
   revertar man fungerande prod på grund av en patch).
