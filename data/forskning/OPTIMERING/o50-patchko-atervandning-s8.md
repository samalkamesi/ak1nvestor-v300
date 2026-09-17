# o50 — PATCH-KÖNS TYSTA DÖD: spurious-kvitton + förlorad diagnos + flock-förväxling (s8-u3)

**Spår 8 (vakt) 3/3 · 2026-09-17 · fabriksmanifest auto-s8-1789667729291 · protokollserie: o46 (patch-kön) → o47 → o48 → detta.**
Nummerflytt: o49 upptaget av s7 (o49-prestanda-loginprefetch) — o44-precedensen.

## 1. FYNDET: critical-RCE-patchen avstängd trots levande köfil

o46 (52734f74) levererade patch-kön laddad med next@16.3.5 +
eslint-config-next@16.3.5 (critical-RCE GHSA-p293-qw3h-jr36 +
GHSA-2xp9-vwfh-vxw4; installerad 16.3.2). Mätning i detta fönster:

- `node_modules/next/package.json` = **16.3.2** (sårbar) — prod kör den.
- `package-lock.json` = 16.3.2 — patchen aldrig bokförd.
- `data/infra/patch-ko.json` = fortfarande bärande next@16.3.5 + eslint@16.3.5.
- `data/vakten/patch-kvitton.jsonl` = **3 misslyckade** per post ⇒
  `aktivPatchPlan` filtrerat bort båda ⇒ köfilen lever men är mekaniskt
  avstängd (loop-skyddet, PATCH_MAX_FORSOK=3) — och `npm view next
  dist-tags.latest` = 16.3.5 ⇒ versionbyte-nollring OMÖJLIG (16.3.5 är
  senaste; ingen högre att byta till).

## 2. Rotorsakedjan (ur prod-synk.loggen + kvittofilen, tidsstämplar Z)

| Tid | Händelse | Klass |
|---|---|---|
| 11:28:12 | PATCH-KÖ installerad (npm install next@16.3.5 — lock uppdaterad i arbetsytan) | kanalen fungerar |
| 11:29:29 | kvitto "bygg misslyckades med patchad lock" ×2 | okänd orsak — se §2.1 |
| 11:33:13 | kvitto "lock-commit misslyckades" ×2 | **SPURIOUS — bugg, se §2.2** |
| 11:38–11:39 | ominstallation + kvitto "bygg misslyckades med patchad lock" ×2 | okänd orsak |
| efter 11:39 | inga PATCH-rader mer — 3/3 nått, kö tyst | följden |

### 2.1 De två äkta byggfelen: orsak OBESTÄMBAR i efterhand
/tmp/synk-npmci.log och /tmp/synk-build.log nollställs vid VARJE korBygg —
senare lyckade deploys (16:41, 17:43) skrev över bevisen. Tidsgapen 11:28:12 →
11:29:29 (77 s) utesluter inte flock-konkurrens (s7-vågens manuella deploy
höll /tmp/ak1a-deploy.lock i fönstret) och inte heller ett tidigt
npm ci-/build-fel. Diagnosen gick förlorad MEKANISKT.

### 2.2 Det spurious kvittot: prod-synkens EGNA bugg
Felogrenen river den patchade locken (`aterskapaPatchLas`) men
`patchInstallerad` förblev true i revert-vägen (ny kod i kön): byggmiss →
revert → lyckat ombygg → HTTPS 200 → commit-steget kör `git add package.json
package-lock.json` på OFÖRÄNDRADE filer → `git commit -F` svarar "nothing to
commit" exit 1 → misslyckad-kvitto som tröttade loop-skyddsräknaren utan att
patchen fått skulden. Detta var det tredje strecket som stängde kön.

## 3. KURERNA (verktyg/prod-synk.mjs)

- **Kur A (spurious-kvittona)**: `patchInstallerad = false` sätts i
  felgrenen direkt efter att locken rivits + misslyckad-kvitton skrivits —
  commit-steget kan ALDRIG nås med spök-patch. 11:33-klassen mekaniskt död.
- **Kur B (förlorad diagnos)**: `bevaraByggLoggar(mapp, kallor)` kopierar
  /tmp/synk-{npmci,build}.log till `data/vakten/patch-byggfel/<ts>-*.log`
  FÖRE rivning/revert vid patch-byggfel — nästa misslyckande är bestämbart.
- **Kur C (flock-förväxling)**: `bedomByggMisslyckande(npmciText, byggText)`
  → "startade-aldrig" (BÅDA loggarna tomma = barnet fick aldrig låset under
  flock -w 900 = deploy-konkurrens, INTE fel) | "oom" (befintlig klass) |
  "riktigt-fel". Startade-aldrig: inga kvitton, ingen revert, riv patchad
  lock, nytt försök nästa poll — OOM-grenens vänta-semantik.

## 4. ÅTERAKTIVERINGEN (bokförd ingripande, inte tyst dataåndring)

`verktyg/_s8u3-o49-kvittorensning.mjs` (engångsverktyg, behållet som
dokumentation): backup → `patch-kvitton.jsonl.backup-o49`, därefter bort de
TVÅ raderna 11:33:13 ("lock-commit misslyckades" — orsak: §2.2:s bugg).
De FYRA äkta byggfelskvittona (11:29, 11:39) LÄMNADES — historiken orörd,
räkning 2/3. Slutbevis via modulens egna funktioner mot riktiga filer:
`AKTIVA POSTER: [{next,16.3.5},{eslint-config-next,16.3.5}]`.

Nästa prod-synk-rop (RAM-vakten gäller) försöker alltså igen MED kurerna:
flock-fall → rätt klass, ingen räkning · riktigt fel → bevarad logg +
3/3-stängning MED diagnos på disk · lyckat → deploy + lock-commit +
ok-kvitton = RCE kurerad i prod. Alla vägar skyddar prod (ombygg på god
lock vid miss, artefaktgrind + manifestkontrakt FÖRE pm2-restart).

## 5. DRIFTSBOKEN vaccin 1 infriert (502-klassen 17:42–17:47Z)

s7-u3:s öppna rekommendation "GRINDA mot .next/prerender-manifest.json:s
existens FÖRE pm2 restart" — oägt, i vakts ytva: `verifieraArtefakt` fick
manifest-kontraktet `KRITISKA_FILER = [BUILD_ID, prerender-manifest.json,
routes-manifest.json]` (empiriskt giltigt: friskt .next bär alla tre) ⇒
prod-synkens deploygrind AND kraschvaktens ärlighetsgrind får skyddet
gratis. Incidentens exakta bild (BUILD_ID skriven + HTML komplett mot GAMLA
chunks ⇒ HTML-måttet grönt, servern dör på ENOENT) är nu trasig-status med
filnamn i meddelandet. Levande sond mot skarp .next: GRÖN 1667 HTML/81
referenser — noll falsklarm.

## 6. SIDOFYNDET: procfs-spinn (ny klass, dokumenterad i svit)

Testfixturen `bevaraByggLoggar("/proc/ompossible/x", …)` satte tre
svitprocesser i kernel-syscall-storm (R-läge, stime +227 ticks/3 s —
`fs.mkdirSync(recursive)` på procfs återkommer utan att kasta eller
returnera). INGREPP: manuellt död av pids 1708486, 1708844 (egna) + 1709260
(främande sessions barn, sess_e4658741 — samma svitfil, samma spinn; utan
död hade den snurrat tills fabrikens timeout). KUR: fixturen bytt till
ENOTDIR-väg (katalog under fil) — samma kontrakt, kastar direkt. Regeln
för framtida sviter: ALDRIG /proc som mål i fs-fixture. Bokförd i
DRIFTSBOKEN.

## 7. BEVIS

- testa-prod-synk-patchko.mjs **51 PASS / 0 FAIL** (35 befintliga + 16 nya:
  bedömningens tre klasser × 10 fall + bevararens kontrakt × 6).
- testa-prod-synk-arbetsytasynk.mjs **34/34** (syskonoberoende intakt).
- testa-artefakt-verifiering.mjs **15/15** (12 befintliga med manifest-nyckel
  i fixturen + 3 nya 502-klass-tester).
- `node node_modules/typescript/bin/tsc --noEmit` = **0** (projektbinären).
- mimosa-paritet `^verktyg/(prod-synk|testa-prod-synk-patchko)` GRÖN 0 fynd
  + `^verktyg/(artefakt-verifiering|testa-artefakt)` GRÖN 0 fynd.
- node --check × 4 filer OK. Prod HTTPS 200 under hela fönstret.
- src/ orörd · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd.

## 8. Köposter

1. **Bevaka nästa PATCH-KÖ-förlopp** i prod-synk.loggen: vid "riktigt fel"
   NU med bevarad logg i data/vakten/patch-byggfel/ → rotorsaksanalysera
   16.3.5-bygget (ev. next-regression) innan ny aktivering.
2. DRIFTSBOKEN vaccin 2 (pm2 stop → bygga klart → start, aldrig bara retry)
   och 3 (RAM-tröskel räknar med byggheap + cron) — oägda, öppna.
3. u3-föregångarens tmp-migrering REVERTAD utan motivering (72682834) —
   kvar hos manifestägaren (eskalerad i o48).

## 9. EFTERSKRIFT 20:2x — syskonkollision, attribution och det fullbordade läget

Syskonet s8-u1 (o55, commit **920c3221**) arbetade samma objekt parallellt
och landade under mitt fönster; följande uppdaterar detta protokoll till
slutläget:

- **Byggfelens VERKLIGA rotorsaka hittades av dem**: .next-tömningsracet —
   pm2:s live-ISR skriver i kategorier som rivs (ENOTEMPTY rmdir
   .next/server/app/ar/kurser). §2.1:s "obestämbar" var sant i mitt
   mätfönster (loggarna borta) men race-beviset fanns i deras källor. Deras
   kur: skapaPm2Vakt() (stoppa före patch-bygg, återstarta i finally).
- **Mina prod-synk.mjs-kurer (§3) lever i 920c3221** — deras commit tog
   filen koherent med mina Edits på disk ("syskonets pågående o49 … följer
   med i denna commit"). Denna commit (o50) bidrar därför ENDAST svitfilen,
   artefakt-manifestkontraktet (§5), engångsverktyget och dokumentationen.
- **Kvittokedjan dubbelverkade samtidigt**: min rensning (§4, 11:33-spurious
   borta, 4 äkta kvar i filen) → deras arkivering 20:15 (patch-kvitton-
   arkiv-2026-09-17T18Z.jsonl = exakt mina 4 rensade rader) flyttade filen
   → aktiva kvitton = 0 → räknare nollad → kö AKTIV via starkare väg än min
   2/3. Backup-kedjan: .backup-o49 (6 originalrader) + arkivet (4 äkta).
- Deras metodfynd "sviten hänger sandboxat på /proc-fixturen — notis till
   dem" = MITT §6-live-ingrepp, kurerat i fixturen innan deras osandboxade
   51/51-körning.
- Slutsnitt: nästa :x7-rop med RAM patchar prod MED både race-kur (deras)
   och felklass-skiljning + diagnosbevarande (§3) + artefaktgrindens
   manifestkontrakt (§5). Faller patchbygget ändå: r58-grenen + pm2-vakten
   återställer 16.3.2 automatiskt — alla utfall bokförda.
