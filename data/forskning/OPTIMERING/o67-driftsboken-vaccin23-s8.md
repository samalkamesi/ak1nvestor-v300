# o67 — DRIFTSBOKEN vaccin 2+3 infriade: kraschvaktens artefaktgrind vid misslyckat räddningsbygg + prod-synkens RAM-tak räknar med tunga processers tillväxt (s8-u1, manifest auto-s8-1789730101010)

Datum: 2026-09-18 · Spår 8 (kvalitet & säkerhet) · Anspråk: data/vakten/auto-s8-1789730101010-u1-ansprak.md

## OBJEKT

DRIFTSBOKEN-posten 2026-09-17 17:42–17:47Z (prod 502, o53 §4) bokade två
oägda vaccin som stått öppna sedan s8-u3/o50 §6 infriade vaccin 1
(verifieraArtefakt KRITISKA_FILER). Duplikatkontroll: worklog s8-familjen
o46–o65 + feljakt-läge 245/245 bedömda (0 öppna) + PATCH-kön levererad —
inget av vaccinerna tagna.

## VACCIN 2 — kraschvakt.mjs: ALDRIG pm2-restart mot ofullständigt .next

Roten (DRIFTSBOKEN 17:42): "pm2-restart mot ofullständigt .next ger
kraschloop som pm2 inte hämtar sig från — stop → bygga klart → start är
rätt ordning, aldrig bara retry." Överträdelsen satt i raddningsbygg()
felsgren: bash-kommandot gör `rm -rf .next && npm ci && build` — ett
misslyckat/avbrutet/OOM-dödat bygg lämnar alltså artefakten SAKNAD eller
PARTIELL, men felsgrenen körde `pm2 restart ak1a` villkorslöst = start
mot ENOENT (bevisat ↺ 3 700+, nginx 502 ~5 min). Dessutom: kooldown 120
sattes FÖRE bygget (state-atomiteten) och felsparades ALDRRI om — 2 h
låst vakttillstånd medan appen loopar.

Kur:
- Ny ren beslutstabell `planeraStartEfterMisslyckatBygg(artefaktStatus)`
  (exporterad, samma idiom som planeraAtguard): `gron` → startaPm2
  (artefakten restart-bar trots byggfelet — verifieraArtefakt är
  domaren); `trasig`/`okand` → pm2 lämnas STOPPAD + kooldown 30.
- Felsgrenen mäter nu `verifieraArtefakt()` FÖRE start, startar endast
  bakom `if (start.startaPm2)`, och sparar KORT kooldown (30, kurens (4)
  osäkert-läges-doktrin — botten "120 kvar trots fel" botad). Stoppad
  app + kort kooldown = nästa poll BYGGER KLART (rätt ordning), aldrig
  bara retry.

## VACCIN 3 — prod-synk.mjs: RAM-taket räknar med byggheap + tunga klasser

Roten (DRIFTSBOKEN 17:42): "Bygg under samtidig tung cron (gränssnitts-
vakten ~1 GB chrome) + fabrikens barn = OOM-fälla; RAM-vaktens tröskel
bör räkna med byggheap + cron, inte bara ledig RAM." Befintlig vakt:
engångsmätning `MemAvailable < 2200` — mäter NU, ser inte att tunga
processer kan VÄXA under byggets ~3 min (17:42-OOM:ens formel).

Kur:
- `raknaTungaProcesser(ps -eo args=-rader)` — SMALA klasser (o55 F2-
  läxan): chrome-klassen matchar ENDAST första token (körbara filen:
  chrome/chromium/headless_shell/chrome_headless); zcode-klassen kräver
  ".zcode"-sökväg i args (bara zcode-cli/node-repl-mcp-barn bär den).
  pm2:s "next start", prompters "npm ci"-regeltext och "grep chrome"
  kan aldrig träffa.
- `bedomByggUtrymme({ ramMB, tunga })` — behov = MIN_RAM_MB 2200
  (byggheap-basen, 10X-empirin, oförändrad) + klassreserver: chrome-
  cron levande ⇒ +1024 (oavsett antal delprocesser — chrome forkar
  renderers); zcode-barn ⇒ +300/st med cap 4. ramMB null ⇒ ok
  (fail-open, oförändrat: målfel vårdar aldrig deployer i evighet).
- korSynk steg 2 samlar ps-rader (fail-open vid ps-fel), ropar båda,
  och VÄNTAR-RAM-loggen bär behov + reserv + detalj (prefixet och
  "HEAD orört, nytt försök nästa poll" bevarade — vaktkön läser dem).

## BEVIS

- Ny svit verktyg/testa-prod-synk-ramvakt.mjs: **17/17 PASS** (basens
  gräns inklusiv · chrome-klassens 1024-reserv · zcode-barn 300/st +
  cap 4 (12-barnssvärm ⇒ 3400, inte 5800) · kombination 2200+1024+600
  · null-fail-open · detalj/meddelandefält · F2-falska-vännerna npm
  run start/next start/pumpor-daemon/npm ci-regeltext/grep chrome/vi
  = 0 träffar · strukturkontrakt ordagranna mot källan).
- testa-kraschvakt.mjs utökad 19 → **26/26 PASS** (gron/trasig/okand-
  besluten · kooldown 30 aktiv vid 15 min · strukturkontrakt: felgrenen
  ropar verifieraArtefakt + planeraStart..., pm2-restart ENDAST bakom
  if (start.startaPm2), sparaState med kooldownMin: start.kooldownMin).
- Regression syskon-ytor: testa-prod-synk-pm2vakt **35/35** · arbets-
  ytasynk **34/34** · tidsstampel **12/12** · node --check ×4 OK ·
  `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
- SKARPT belägg mot levande verkligheten (177 ps-rader på servern):
  klassificeringen hittar chrome 0 + zcodeBarn 2 (denna fabrikansomgång)
  — NOLL falska träffar bland 177 rader; MemAvailable 913 MB ⇒ bedömning
  ok=false behov 2800 = korrekt vårdat läge (synken ska inte bygga nu).
- Observationsnot (ingen åtgärd, ej reproducerbar): patchko-sviten
  visade 50/1 en gång vid körning i svitsekvens, därefter 51/51 ensam
  och i båda ordningsmönstren — engångsartefakt av typen "äkta cron-rop
  muterar runtime-fil mitt i svitfönstret" (o47 §2-artefaktdoktrinen:
  aldrig bokföra engångsfall utan reproduktion).

## KVD

src/ orört (tsc 0 ändå kört — grönt). ALDRIG bygge — deploy ägs av
prod-synken; koden är verktygslager som pumporna laddar från disk vid
nästa rop. R2 orört (priser/tier/publicering orörda). data/blogg/
orörd. Syskonytor: prod-synk.mjs rördes i RAM-vaktssteget + exporter —
pm2vakt/patchko/arbetsytasynk/tidsstampel-sviterna GRÖNA efteråt;
kraschvakt.mjs rördes i felsgren + ny export — dess svit GRÖN.

## REST / nästa

- Långtidsbevis: när nästa misslyckade räddning/patch-bygg inträffar
  ska kraschvakt.log visa artefaktstatus + STOPPAD-grenens nya rad —
  bevaka i ronden.
- Prod-synkens nästa VÄNTAR-RAM-rad i prod-synk.log bär nu behov/reserv-
  formatet — rundläsningen kan följa reservens klasser över dygnet
  (chrome-cronens 6-timmarsrytm synliggörs).
- DRIFTSBOKEN 19:17-cronincidentens vaccin (1) "diagnos FÖRE npm ci" —
  fortfarande öppen om någon vill ta den; rundens vaccin 2+3 stängs här.
