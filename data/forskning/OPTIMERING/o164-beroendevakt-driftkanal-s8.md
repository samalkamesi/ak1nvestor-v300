# o164 — Beroendevaktens driftkanal: instrumentdöden (o50-klassen) kurad med cron + idempotent git-yta + klass-svit

Datum: 2026-09-24 (~15:18–15:4x lokal) · Barn: auto-s8-1790255714145 vakt 3/3 ·
Föregångare: s8-u2 2026-09-15 (vakten skapad: next-CRITICAL-lärdomen), o46/o50
(patch-kön + instrumentens tysta död), o73 (omgång 2, manuell körning), o85/o87
(o85-doktrinen: tunn cron-wrapper, klass ur verktygets EGEN utdata), o94/o95
(cron-driftsättningar av syskonvakter), o124 (senaste rapporten 09-20)

## 1. OBJEVT (duplikatkontroll före start)

Spår 8-objektet "beroendeuppdateringar (patch)" + "vakten 0-fynd-jakt". Valet låst
disk-först (data/vakten/auto-s8-1790255714145-s8-u3-ansprak.md 15:2x) + nummerpoolen
atomärt (o164; o163 var DEN EGEN anspråksfilens träff i verktygets källskanning —
redan uppgraderat i anspråket). Syskonen i manifestet lästa och respekterade:
u1/o161 (gränsnittsvaktens utdatakontrakt + F1-timeout — deras smutsiga trädyta
verktyg/granssnittsvakt.mjs orörd här), u2/o162 (ledgerns 15 HÖGA, F6/F2-domning).
Ingen tidigare våg driftsatt beroendevakten: grep "beroende-vakt-cron" i worklog +
OPTIMERING = 0 träffar.

## 2. ROTORSAKA — instrumentet som föddes ur lärdomen dog av den

`verktyg/beroende-vakt.mjs` skapades 2026-09-15 EFTER fyndet att next 16.3.2 bar
en CRITICAL-RCE med fix inom intervallet — oupptäckt "för att ingen kör npm audit
i rutin" (verktygets egna hdr). Men vakten fick ALDRIG någon driftkanal: crontab
(verifyad 15:18 lokal) saknade raden; livstecknen var manuella agentkörningar
09-18 (o73), 09-19, 09-20 ×3 — sedan TYST DÖD i 4 dygn (senaste timestamp-json:
beroende-vakt-2026-09-20T16-10-40.json). Detta är o50-klassen EXAKT ("instrument
utan mekanisk puls dör tyst") fast på instrumentet som själv föddes ur den
lärdomen. Meta-rot: kunskapen "vakten skall köras i rutin" bodde i huvuden, inte
i maskinen — samma glidningsklass som o148 (kunskap i prosa i stället för härledd
ur källa).

## 3. KUREN — tre nivåer

1. **Driftkanal**: `data/infra/contabo/beroende-vakt-cron.sh` (o85-doktrinen:
   tunn wrapper — kör verktyget, LÄS KLASS UR VERKTYGETS EGEN UTDATA, logga en
   ärlig rad, larma molnagenten vid fynd). Loggklasser: GRÖN (exit 0 +
   RESULTAT_JSON) · FYND-larm (exit 1) · VAKTFEL-larm (exit 2/okända) · OVÄNTAD
   EXIT utan RESULTAT_JSON (våg 142-doktrinen: verktygshälso-anomali, inget
   falsklarm) · SKIPPAD (deploylåset hålls — flock -n -c true-test, tar+släpper
   atomiskt när fritt; o55 §2). Larmbryggan = etablerat mönster (skyddad nyckel
   i delar, aldrig ekkad; session via /api/studio/mal/status, post till
   /api/studio/stream). Installerad i crontab: **37 5 * * *** (idempotent
   installation; fritt fönster: dödlänkarnas ~04:30-slut före, rop-hälsan 06:27
   efter; npm audit tar sekunder, ingen chrome-RAM). FYND-prompten bär o46-
   kontraktet: bokför ev. patch-köpost, ALDRIG npm install själv (prod-synkens
   ägo under deploylåset).
2. **Idempotent git-yta** (instrumentet som smutsar trädet är ett NYTT instrument-
   fel): SENASTE.md är committad yta och hade ISO-tid i RUBRIKRADEN — cron 05:37
   hade skrivit om den VARJE morgon (smutsigt träd = prod-synk-larm, "håll trädet
   committat"-regeln bruten dagligen). Kur i verktyget: kroppen (allt utom
   rubrikraden) jämförs före skrivning — oförändrad läge ⇒ INGEN skrivning
   (SENASTE=oforandrad; mätningstiden bor i gitignorade timestamp-json:n). Wrappern
   committar rapporten ENDAST vid SENASTE=ny ("vakt: …", passerar pre-commit-
   kroken; blockerad commit loggas ärligt — larmvägen bär fyndet ändå).
   Utdatakontrakt utökat: raden `SENASTE=ny|oforandrad` före RESULTAT_JSON.
3. **Svit** `verktyg/testa-beroende-vakt-cron.mjs` — 16 påståenden i två domäner:
   V (ÄKTA verktyget mot mockad npm via PATH-injektion, utdata till tmp genom
   nya överridningarna BERODEVAKT_RAPPORTKATALOG/VAKTKATALOG): idempotens (SENASTE=
   ny → oforandrad + mtime bevarad), high-skifte (exit 1 + SENASTE=ny), npm tystnar
   (exit 2, ej falskgrön), räknekontrakt. W (ÄKTA wrappern mot mockade kommandon):
   alla loggklasser, git-mock-anrop vid SENASTE=ny (OCH ingen git vid oforandrad),
   dummy-env ⇒ larmvägen kan ALDRIG posta skarpt, SKIPPAD under hållande flock,
   retention ≤ 30, okänd exit-kod. Svitens egen leverans fällde två buggar i
   svitens mockar (saknad +x: Node fortsätter PATH-sökningen vid EACCES ⇒ V-domänen
   körde skarp npm — ofarligt, utdata till tmp — och W-mockarna gav 126; stringify
   gjorde \n till tecken så ^…$-ankren dog) — konstruktörsfången (o69) verksamt.

## 4. FRISK MÄTNING (i fritt fönster, låset verifieras ledigt före)

`node verktyg/beroende-vakt.mjs` 15:28 lokal → **7 sårbarheter (critical 0 ·
high 1 · moderate 6) · 7 inom intervall · 11 major-steg · exit 1** (opipat
bevisat = vaktens arbetskod). Jämförelse 09-20 → 09-24: sårbarhetsläget
IDENTISKT (high = js-yaml, transitivt via @mdxeditor/editor, fix kräver
@mdxeditor MAJOR = känd öppen kodvåg enligt o124 — ingen patch-köpost; inga NYA
critical/high). Rapportdiffen är REELL lägesförändring, ej tid-cosmetik:
o124:s fyra patchar (tailwind-merge, puppeteer-core 25.11.0, @reactuses/core,
bun-types) är installerade och borta ur listan; sju nya inom-intervall-versioner
tillgängliga (next 16.3.6 patch, next-intl 4.14.7, supabase-js 2.117.1 m.fl. —
prod-synkens fönster, patch-köns ägo). Andra körningen skrev EJ om rapporten
(rubriktid 13:28:55Z bevarad) — idempotenskontraktet SKARPT bevisat.

## 5. BEVIS

- Svit: **16 PASS / 0 FAIL** (två omgångar röda under konstruktion — varje fail
  rotspårad, se §3.3).
- `node --check` grönt (verktyg + svit) · `bash -n` grönt (wrapper).
- `node node_modules/typescript/bin/tsc --noEmit` = **exit 0** (projektbinären;
  mina ytor .mjs/.sh/.md kan ej typas fel — baslinjen håller).
- Crontab: `37 5 * * * …/beroende-vakt-cron.sh` installerad (idempotent nop vid
  ominstallation).
- Verktygets exit=1 opipat; SENASTE=ny/oforandrad-kontraktet bevisat skarpt (§4).
- Inget bygge (src/ orörd — installation/build ägs av prod-synken).

## 6. KVD

R2 orörd (priser/tier/publicering) · data/blogg/ (live) orörd · ALDRIG npm
ci/install/build · syskonytor orörda (u1:s granssnittsvakt.mjs + deras
protokollnummer-poster lämnade i fred — poolfilen commit:as hel eftersom varje
post är en atomiskt låst reservation, delad mekanisk sanningsyta) · pre-commit-
grinden bärs (commit med -F + explicit pathspec) · R2-ytor (env/nycklar) ENDAST
lästa av wrappern enligt etablerat cron-mönster (värden aldrig ekkade/loggade).

## 7. KÖPOSTER

- js-yaml-high (via @mdxeditor/editor major) = öppen kodvåg, kräver styrelse-
  beslut vid framtida @mdxeditor-uppgradering — MAJOR-steg, aldrig patch-kö.
- 7 inom-intervall-versioner (bland dem next 16.3.6 patch) — notis till
  prod-synkens nästa patchfönster (kön ägs där, PATCH_MAX_POSTER 15 redan full).
- Cron-larmkedjan är obevisad i skarpt läge (fynd-larm + studio-post testas först
  när verkligt fynd inträffar — samma OBS-klass som o157 §kö).
- morgondagens 05:37-körning = första mekaniska pulsen; loggrad i
  data/vakten/beroende-vakt-cron.log är kvittot (gränsnittsvaktens :x1-mönster).
