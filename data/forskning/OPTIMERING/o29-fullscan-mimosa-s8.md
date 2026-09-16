# o29 — Våg 178 Mimosa full-scan (spår 8, s8-u3): hela trädet mätt, falskt-positiv-klassens rotorsaka kurad, GRÖN 906/0

Datum: 2026-09-16 · Fabrikmanifest: auto-s8-1789553713123 (u3, 3/3) · Föregångare: o15/o23 (mimosa-paritet v1.0–v1.3), o21 (skalfritt skal)

## §0 Objektval + duplikatkontroll

Uppdraget: "Kvalitetsvåg: nästa i spåret (välj själv)". Granskning av spårets
16 levererade objekt (worklog: o14-f7 → o26-larmeskalering, inkl. redispatcher)
visade att RONDENS EGEN BOKNING våg 178 "Mimosa full-scan (spår 8)" (worklog
r 11500, evighetsmotorns regel 8) var OLEVERERAD — varken worklog eller git
bar någon full-scan-leverans efter bokningen. Mimosa-pariteten hade mätts
ENDAST på standarddomänen (src/ + data/infra/, 682 filer GRÖN) och
väktardomänen (verktyg/ + .zcode + .zscripts, o23) — ALDRIG hela trädet.
Protokollnummer: o28 togs under fönstret av s7-u2:s mätvåg (61bf96b1) —
ls-kontroll gav o29 (s8-u3-försök-3-precedensen).

## §1 FÖRE-mätning (full träddomän, rådata: fullscan-fore-2026-09-16.json)

`node verktyg/mimosa-paritet.mjs --doman .` → **905 filer, 16 fynd** (exit 1).
Kartläggning av ostrannade ytor (find .ts/.tsx/.mjs/.sh exkl.
node_modules/.next/.git):

| Yta | Fil(er) | Status före |
|---|---|---|
| src/ + data/infra/ | 682 | GRÖN (o23-baslinjen, oförändrad) |
| verktyg/ | 139 | GRÖN (väktardomänen o23) |
| scripts/ | 23 | ALDRIG skannad — 0 fynd |
| .zcode/ + .zscripts/ | 25+8 | väktardomänen delvis; dev.sh = dokumenterat medium-fynd |
| tool-results/ | 4 (.mjs) | ALDRIG skannad — 11 high-fynd (v85-e2e) |
| .tmp/ | 12 | ALDRIG skannad (gitignorad körningsdata) — 0 fynd |
| tests/ + examples/ + rotkonfig | 5+6 | ALDRIG skannade — 0 fynd |

Fyndens tre familjer:
1. **tool-results/v85-f4f5-e2e-prod.mjs — 11 × SSRF_INTERPOLERAD_FETCH high**
2. **verktyg/testa-mimosa-paritet.mjs — 4 × CHILD_PROC_INTERP** (egen
   testfixture: farliga mönster som STRÄNGDATA, dokumenterat undantag sedan
   o15/o23)
3. **.zscripts/dev.sh:93 — 1 × SHELL_URL_VARIABEL medium** (o23:s
   "granskad-lämna": host/port ur args med inre citering, anropad med
   literaler — verifierad låg risk men levererad som UNDANTAG, inte härdning)

## §2 Rotorsaksanalyser

### R1 — Falskt-positiv-KLASSEN "konstant-literal utanför vittnesfönstret"
v85-e2e:s samtliga 11 fynd: `const bas = "http://localhost:3000"` (rad 14)
används som `${bas}` på rader 31–178. Definitionen ligger 17+ rader från
användningarna — utanför hardadKontext ±14 — och variabeln är gemen (versal-
konstant-vittnet träffar ej). Skannern kan alltså inte skilja
"kompileringsfast loopback-literal" från "runtime-styrd host". Detta är en
instrumentbrist (o24 §5:s metodläxa: instrument skall skilja måttobjekt från
mätblindhet — här: skilja fast URL från styrd URL), ingen kodrisk i målet.

### R2 — Körverktyg i körningsdata-katalogen
tool-results/ är gitignorad (".gitignore:44:tool-results/") och ägs av
bash/grep-utdata — men rymmer fyra .mjs-KÖRVERKTYG från våg 85 (e2e-huvud +
3 sonder). Konsekvens: återanvändbar e2e-kod (som dessutom bär
prod-inloggningsflödet) är OSYNLIG för git-historien, code review och alla
standarddomän-skanningar. Rotorsak: våg 85 skrev verktygen direkt i
utdata-katalogen.

### R3 — Härdning levererad som undantag
o23 lät dev.sh förbli medium-fynd med manuell granskningsnotis
("granskad-lämna") i stället för kodhärdning. Undantagslistan växer med
varje manuell bedömning = regressionsrisk (nya wait_for_service-anrop
ärver "lita på anroparna"-antagandet). Filosofin från o23: "farliga mönster
SKALL flaggas i leveranskod" — äkta kur = input-validering I koden.

## §3 Kur (tre ben, alla rotorsaksfixar)

### K1 — mimosa-paritet v1.4: konstant-propagering (verktyg/mimosa-paritet.mjs)
Ny helper `konstantUrl(text, namn)`: filscope-`const X = "http(s)://…"` med
REN strängliteral i RHS (env/ternary/uttryck matchar ALDRIG). I fetch-grenen
propageras ENDAST det HOST-BÄRANDE interpolatet (mallsträngens första
`${enkeltNamn}` eller det efter `schema://`) — path/query-interpolat kan
aldrig byta host och påverkar inte bedömningen. Fast konstant-literal:
loopback → SSRF_LOOPBACK-info ("konstant-literal"), annan → SSRF_EXTERN_
LITERAL-info ("konstant-literal") — samma riskbild som en bokstavlig
fetch-URL (klassen som alltid varit info). Param/args/env-host propagerar
ej → high-bedömning kvarstår (bevisat av två nya avgränsningstester).

### K2 — mimosa-paritet v1.4: SHELL-case-vittne + dev.sh riktighamrd
Ny `VITTNEN_SHELL_URL = [/^\s*(localhost|127\.0\.0\.1)[^)]*\)\s*;;/]` — ett
case-skelett som accepterar ENDAST loopback är EXEKVERAD input-validering
(default-reject: annan host når aldrig curl), inte dokumentation. Fönstret
för SHELL_URL_VARIABEL 5→8 rader (case-skelettet är flerradigt) med KLASS-
SPECIFIKA vittnen i stället för FETCH-listan (som aldrig passade skal).
dev.sh:wait_for_service härdat med exakt detta skelett — o23:s
"granskad-lämna"-undantag är därmed AVVECKLAT i koden (skannern bevisar:
SHELL_URL_VARIABEL 1 träff = "härdad-kontext", 0 fynd på riktig kod).

### K3 — v85-e2e tillrättavisad hemvist
`tool-results/v85-f4f5-e2e-prod.mjs` → `verktyg/e2e-prod-studio-v85.mjs`
(git-trackad, skannad i väktardomänen av både mimosa-paritet och
skalfri-vakten; rubriknotis dokumenterar flytten). Filen ändrades i övrigt
ENDAST med dokumentationsrubrik — inget beteende, inga nya env-rymdar.
De tre v85-sonderna lämnas som körningsdata (engångssonder, 0 fynd) —
noterat, ingen flytt (scope).

## §4 Bevis

- `node --check` × 4 (mimosa-paritet, testa-mimosa-paritet, e2e, dev.sh via
  bash -n) — GRÖN.
- **Scenariotest 26/26 PASS** (verktyg/testa-mimosa-paritet.mjs; 20 gamla
  oförändrade + 6 nya: konstant-literal loopback → info; konstant-literal
  extern → info; param-host + query-interpolat → high kvarstår; env-ternary-
  RHS → high kvarstår; case-loopback-skelett i skal → härdad; [femte/
  sjätte new = avgränsningarna]).
- **FULL-SCAN EFTER GRÖN: 906 filer, 0 fynd** (exit 0;
  fullscan-efter-2026-09-16.json) med ENDAST det dokumenterade
  fixture-undantaget `--hoppa-over 'testa-mimosa-paritet\.mjs$'` (filosofin
  oförändrad sedan o15/o23: farliga mönster som STRÄNGDATA i testsviten).
  Klassförskjutning FÖRE→EFTER: SSRF_INTERPOLERAD_FETCH 158→139 träffar
  (11 omklassade till SSRF_LOOPBACK "konstant-literal"), SSRF_LOOPBACK
  7→18 info, CHILD_PROC_INTERP 4→0 (fixture-undantag), SHELL_URL_VARIABEL
  1 oskyddad → 1 härdad-kontext.
- **Standarddomänen OFÖRÄNDRAD GRÖN**: 682 filer 0 fynd (v1.4 kan bara
  undanta från fynd, aldrig skapa — men kört som mekaniskt bevis).
- **Korsinstrument skalfri-vakt GRÖN**: 175 filer (+1 = e2e:n), 0 fynd,
  55 härdade arrayform — två oberoende instrument eniga om väktardomänen
  (o23 §3-mönstret).
- **tsc 0** (`node node_modules/typescript/bin/tsc --noEmit`, projektbinär).
- INGET bygge från denna våg; deploylåset verifierat fritt före commit
  (s8-u1-redispatch-läxan tillämpad); src/ orörd.

## §5 Bokningar / läxor

1. **Full-scan är nu en definerbar KVD-punkt**: kommande större vågor kan
   köra `--doman . --hoppa-over 'testa-mimosa-paritet\.mjs$'` som
   helhetstäckning (906/0 = ny referensbaslinje; standarddomän 682/0).
   Baslinjen SKAL återmätas efter varje våg som tillför .mjs/.sh/.ts-filer
   utanför src/ (annars tyst glidning — detta var exakt våg 178:s fynd).
2. tool-results/ rymmer fortfarande 3 v85-sonder (.mjs, 0 fynd, gitignorade)
   + .tmp/ 12 gitignorade sondskript (0 fynd) — båda YTORNA lever utanför
   git; ny policy-följdfråga till strukturbokningen: kör-verktyg skall födas
   i verktyg/ direkt (rotorsaka R2 gäller fortsatt för framtida vågor).
3. mimosa-paritetens CHILD_PROC_INTERP saknar (medvetet, av o15-design)
   konstant-propagering — om en verktygsfil med `const KMD = "git …"` +
   exec(`${KMD}`) dyker upp i framtiden klassas den high tills vittne
   finns (execFile-arrayform är den föredragna formen; o21:s doktrin).
4. Våg 177 (zcode §11.4-registerposter) förblev olevererad i detta fönster
   — huvudagent-yta, bokas kvar (inte spår 8-agentens att ta).

## §6 Syskonnotiser

- **o28-nummerkollision**: s7-u2:s mätvåg tog o28 under fönstret (61bf96b1)
  — detta protokoll blev o29 efter ls-kontroll (etablerad precedens).
- **verktyg/granssnittsvakt.mjs MODIFIERAD av aktivt syskon** under fönstret
  (git status M, ej min fil, orörd/ostegad av mig — race-familjens
  grundregel).
- Noll övrigt filöverlapp: mimosa-paritet + testa-mimosa-paritet + e2e +
  dev.sh + o29 + 2 rådatafiler + worklog-append = hela min yta.

R2 orörd — inga priser/tier/publicering; data/blogg/ orörd; .env*-filer
orörda (e2e:n LÄSER .env.production.local som den alltid gjort, ändrad
endast med dokumentationsrubrik).
