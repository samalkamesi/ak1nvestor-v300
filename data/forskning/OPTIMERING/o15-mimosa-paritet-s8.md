# o15 — Mimosa-paritet: skannerns döda öga + server-paritet (spår 8, s8-u3 omgång 3)

(o15 efter o14-f7-sakerhetshardning.md — syskonet s8-u1 omgång 3 tog o14
under mitt fönster; nummer valt efter ls-kontroll av serien.)

Datum: 2026-09-15 · Agent: auto-s8-u3 (fabrik) · Status: LEVERERAD, baslinje GRÖN

## Objekt

Spårets kontextord "Mimosa-fyndens rotorsaker" — enda ordet i spår 8:s lista
utan levererad våg (omgång 1: grind/be­roenden/döda länkar; omgång 2:
tsc-determinism/feljägaren F5/vaktens 0-fynd-jakt). Duplikatkontroll mot
worklog före start: inget syskon hade tagit Mimosa-spåret.

## Del 1 — Grävning: vad Mimosa EGENTLIGEN är (fynd i .mimosa/)

`.mimosa/` i reporoten (gitignorad, speglad från arbetsstationen) är
Kundens säkerhetsskanner Mimosa: semgrep-baserad hook (zcode-hook,
PreToolUse + Stop) i arbetsstationens Z-Code på Windows
(spawnSync C:\Program Files\nodejs\node.exe). Struktur:
finding-ledger/v1 (165 event-filer), history (133 run-filer
2026-08-10 → 2026-09-10), hook-state, reports (task-review per session).

### ROTORSAKA 1 — Skannerns döda öga (bevisat i historiken)

- 46 "completed" + 87 "inconclusive" körningar totalt; de sista åtta
  (2026-09-08 → 09-10) ÄR samtliga inconclusive med
  `scanner_failed: spawnSync node.exe ETIMEDOUT` = 0 skannade filer.
- Sista körningen överhuvudtaget: 2026-09-10 10:49Z (speglad 12:56 lokal).
  Sedan dess TOTAL TYSTNAD — 5 dygn utan scanning på arbetsstationen
  (eller: speglingen dog; skillnaden kan bara kunden verifiera på
  arbetsstationen — serverbeviset är detsamma: inga nya fynd sedan 09-09).
- ROTEN: node.exe-timeout på Windows + att speglingen/körningen upphörde.
  Kan ALDRIG lagas från servern → KUNDNOTIS via huvudagenten (se bokningar).

### ROTORSAKA 2 — Fabriksträdet har ALDRIG skannats

Mimosas hook bor i ARBETSSTATIONENS sessioner (hook_observed_diff = filer
ändrade i den sessionen). Fabrikens 12-i-manifest-agenterna och
huvudagentens server-sessioner committar i SERVER-trädet — deras kod
passerar ALDRIG Mimosa oavsett om skannern lever. Säkerhetsögat har
alltså täckt högst en del av kodflödet, och sedan 09-10 noll.

### ROTORSAKA 3 — Fynden upptäcks först vid arbetsstations-push

Historiska worklog-lärdomar (våg 85: "3 försök krävdes", push blockerad
×4, kundgodkännande för [medium]) — rotorsaken till FRIKTIONEN är att
fyndklasserna inte kontrolleras serverside FÖRE push.

## Del 2 — Mimosa:s bevisade fyndklasser (underlag för paritetsreglerna)

Utvunna ur .mimosa/reports (finding_events med regel/severity/kategori)
+ worklog-lärdomar:

| Klass | Bevis | Allvarlighetsgrad |
|---|---|---|
| Path traversal (路径穿越) | minne/route.ts:287-288 block 2026-09-09 23:29, reparerad 23:31, static_rescan_passed | high |
| Skal-säkerhet (安全风险) | setup-prod.sh:7,20 block 2026-09-08 16:38, reparerad (gpg-mönstret) | high |
| SSRF — fetch-sträng/variabel-i-URL | worklog 5014 (sträng ur env), 9075 (variabel i sökväg = HIGH, motgift: regex-intyg + "+"-konkat) | high/medium |
| Skal-injektion i child_process | worklog 9586 (kompile-tidskonstanter), 10026 (resolvorBinär) | high |
| Lösenords-placeholder + autoComplete | worklog 9329 (autoComplete bort = passerar) | hög-historisk |
| Falska positiver | 3860/3906 (korsfilstänk intern konstant), 4226 (open på modulkonstant) | — |

## Del 3 — Leverans: verktyg/mimosa-paritet.mjs (+ test)

Server-side paritet: deterministisk regex-skanning av DOMÄNEN src/ +
data/infra/ (Mimosa:s bevisade fyndområden — setup-prod.sh ligger i
data/infra). Noll beroenden, node 22. Regler:

- SSRF_INTERPOLERAD_FETCH (high): fetch(`${...}`) / fetch("..."+x) med
  EXTERN eller variabel-host. Kontext-förmildran exakt enligt
  Mimosa-lärdomarna: getSupabaseRest i filen (2662-helpern), kontroll-
  före-fetch (9075-receptet), versalkonstant-host (kompile-tidsvärd),
  req.nextUrl.origin (same-origin-idiom), radfönster ±14.
- Relativa `/api/...`-URL:er: internal same-origin — kan ALDRIG vara
  SSRF, hoppas (kalibreringsfynd, se Del 4).
- SSRF_LOOPBACK / SSRF_EXTERN_LITERAL: info-klass — rapporteras i
  rådata, blockerar aldrig.
- PATH_API (high): request-data (searchParams/params/body) →
  path.join/resolve/läsning utan vitlista/prefixkontroll i kontexten
  (VITTNEN_PATH — URL-objekt-vittnet är medvetet FÖRBYTT mot
  path-klasspecifika vittnen, se Del 4).
- CHILD_PROC_INTERP (high): exec/execSync med interpolerat kommando;
  execFile/spawn med array-argument = per definition utan skal.
- SHELL_PIPE (high): curl/wget | sh/bash — gpg --dearmor-pipen är
  härdningsmönstret och tiger.
- SHELL_URL_VARIABEL (medium): URL ur skal-variabel; loopback-sonder =
  info.

CLI: `node verktyg/mimosa-paritet.mjs [--katalog VÄG] [--json FIL]
[--tyst]`; exit 0 = grönt, 1 = fynd, 2 = argumentfel.

Test: verktyg/testa-mimosa-paritet.mjs — 16/16 PASS (6 farliga mönster
flaggas med rätt klass, 8 härdade mönster tiger inkl. minne/route.ts-
mönstret + setup-prod.sh-mönstret + versalkonstant + loopback + relativ
fetch, info-klasser rapporteras utan blockering, JSON-utdata).

## Del 4 — METODFYND: kalibreringsresan 168 → 0 (falska positiver är regressionsskyddets död)

Första helkörningen (breda regler, hela trädet): 168 fynd — men ~97 %
systematiska falska positiver av FYRA klasser: (1) relativa `/api/...`-
fetch i klientkomponenter (same-origin, ej SSRF), (2) loopback-mätverktyg
(127.0.0.1), (3) verktygskatalogens versalkonstant-hostar (BAS/ORIGIN),
(4) kataloger utanför Mimosa:s domän (verktyg/, scripts/, .zcode/,
.zscripts/, tool-results/ — väktarnas egen domän). YTTERLIGARE en
regelbugg upptäcktes i debuggen: `new URL(req.url)` (Next.js
standardparsning) immuniserade hela routes mot PATH_API när
URL-objektet låg i det GENERELLA vittnesfönstret — kuren är
KLASSSPECIFIKA vittneslistor (VITTNEN_FETCH vs VITTNEN_PATH).
Lärdom för alla framtida väktare: kontextvittnen måste vara
målklassspecifika, annars blir standardidiom frikort.

## Del 5 — BEVIS: färsk baslinje GRÖN på aktuellt träd

- Skanning: 671 filer, **0 fynd**, 87 rapportrader:
  80 SSRF_INTERPOLERAD_FETCH härdade kontexter (50 filer — supabase-
  helper-ekosystemet; stickprov verifierat: stats/migrate/ai-analys/
  stock-data bär rena rest.origin-/same-origin-mönster),
  1 PATH_API härdad (src/app/api/studio/minne/route.ts — Mimosa:s
  SISTA äkta fynd 09-09; namn-vitlista + inneslutningsvakt verifierad
  I TRÄDET = arbetsstationens reparation LANDADE),
  5 SSRF_EXTERN_LITERAL (fc.yahoo.com/query1/query2-crumbflödet, fasta
  betrodda literaler), 1 SHELL_URL_LOOPBACK (ak1a-varm.sh ISR-sond).
- Rådata: mimosa-paritet-baslinje-2026-09-15.json (samma katalog).
- Scenariotest 16/16 PASS; node --check ×2 OK.
- tsc 0 (projektbinär) — ingen src berörd, kördes ändå som bevis.

## Bokningar till huvudagenten / kunden

1. KUNDNOTIS (kan ej lösas från servern): arbetsstationens Mimosa är
   inconclusive/ETIMEDOUT sedan 09-08 och speglingen tyst sedan
   09-10 12:56 — kunden bör kontrollera Mimosa-hookens node.exe på
   Windows-arbetsstationen. Server-pariteten är nu kompensation, inte
   ersättning.
2. Verktygskatalogens 6 CHILD_PROC_INTERP-mönster utanför domän
   (.zcode/v2-git.mjs `git ${args}`, .zcode/vag102-prod-stada.mjs,
   .zscripts/dev.sh, verktyg/agentfabrik.mjs:277, verktyg/feljagaren.mjs:107,
   verktyg/testa-studio-tabbar.mjs:259) — samtliga interpolerar INTERNA
   värden (git-hashar, PID), låg risk; bokas som framtida härdning
   (execFile-arrayform) om spåret väljer det.
3. Vid nästa våg som röra src/: kör mimosa-paritet som KVD-steg —
   integration i pre-commit-grinden är ett styrelsebeslut (våg 138-
   grinden är kundens kvalitetslag; utökning kräver bevisad 0-falsk-
   positiv baslinje över tid, vilken denna våg etablerar).

R2 orörd: inga priser/tier/publicering; inga .env/nyckelfiler;
.mimosa/ läst endast (gitignorad, ocommittad).
