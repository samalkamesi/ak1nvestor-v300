# O55 — Döda länkar: INSTRUMENTKUR + återmätning 3 473/0 (Spår 8, s8-u2)

Datum: 2026-09-17 · Agent: s8-u2 (manifest auto-s8-1789667729291) · Företrädare: o9 (3 012/0 varm), o47 (3 227/1 616 — ALLT driftfel, ogiltigförklarat som länkmätning)

## §1 Objekt och duplikatkontroll

- o47 REST: "äkta länkgrafåtermätning EFTER läkningsverifiering (/kurser + /analyser 200)" + o48-bokning "döda länkar-återmätningen levererades aldrig och förblir öppen". Prod-läkning verifierad FÖRE anspråk (localhost / /kurser /analyser /blogg = 200 alla). Två omgångars bokning infriad.
- METODFUND under arbetet: o47 §2:s kurer fanns ENDAST i protokollet — verktyget var orört ("verktyget orört" var o47:s egen formulering). En metodkur som bara lever i ett dokument skyddar inte nästa mätning: instrumentet kurades, inte bara metoden.

## §2 Instrumentkurer (verktyg/doda-lankar.mjs)

1. **Mätfönster-grind FÖRE crawl** (o47 §2 inbyggt): (a) fuser på deploy-låset — ÄGANDE av öppna fd:n, ALDRIV låsfilens existens (flock lämnar filen kvar); (b) byggprocess-grind pgrep -f; (c) hälsogrind / + /kurser = 200. Missar ⇒ avbrott KOD 1 INNAN mätvärde producerats.
2. **Driftfel-tak EFTER crawl**: > 5 % av sidorna på 5xx/nätfel ⇒ rapporten KASSERAS, ingen fyndfil, KOD 2 (artefaktdoktrinen — o47:s 1 616×500-klass kan aldrig mer bokföras som "döda länkar"). Byggfönster som öppnar MITT I mätningen fångas här.
3. **Filskydd**: rapportfil skrivs ALDRIG över — klockslagssuffix vid kollision (o47:s bevisfil 13:46 överlevde denna mätning VERIFIERAT, md5 9973a5d6…, mtime orörd).
4. **--tvinga**: diagnostikläge (hoppar grunder+tak), utdatafil märks "diagnostik" — är ALDRIG mätvärde.
5. **Avslutskoder**: 0 = mätvärde · 1 = grind/fel (fönstret ej mätbart) · 2 = driftfönster kasserat.
6. Miljövariabler för testbarhet: AK1A_DEPLOY_LAS, AK1A_BYGG_MONSTER.

## §3 Återmätningsresultat — o47:s REST STÄNGD

Fönster: verifierat stilli (fuser tom; prod-synk VÄNTAR-RAM sedan 18:07:29Z — inget bygge igång; grindarna gröna i verktygets egen logg "matfonster: {grunder: gröna}").

**3 473 unika sökvägar · DÖDA LÄNKAR 0 · omdirigeringar 0 · 793 s (ljummen/kall ISR-klass, jfr o47 772 s) · exit 0.**

Grafens tillväxt: o9 3 012 → o47 3 227 → o55 3 473 (register-vågen 396 kurser + /en + /ar-speglar: /en/kurser 403 + /ar/kurser 403 + /en/blogg 56 + /ar/blogg 56 + datasetdjup). **ÄKTA döda länkar: 0 — grafen HEL trots 461 nya sökvägar sedan senaste friska mätning** (0-fynd-jakten: fyndet är frånvaron).

## §4 Metodfynd — två FALSKLARMSKLASSER funna på levande processverkligheten

- **F1 "next"-mönstret**: första implementationen splittrade "next build npm ci" på whitespace ⇒ pgrep -f "next" matchar pm2-servern ('ak1a' kör `npm run start` → `next start`-barn bär "next" i cmdline DAGLIGEN) ⇒ verktyget kunde ALDRIG mäta. Bevis: första prod-försöket avbröts "bygg/install-process pågår (next)" i ett fönster där fuser var tom och inget bygge körde.
- **F2 "npm ci" i agentprompter**: pgrep -f "npm ci" matchar FABRIKSAGENTERNAS EGENA zcode-processer — fabrikens uppdragsprompter innehåller ju regeln "ALDRIG `npm ci`…" och hela prompten syns i cmdline (levande bevis: 3 zcode-barn vid varje våg). Medan agentfabriken lever (= alltid) hade breda mönster deckat varje mätning.
- **KUR**: kommaseparerade HELA mönster — standard "next build,npm ci --no-audit": "next build"-sekvensen finns bara i ett ÄKTA bygg (pm2:s "next start" innehåller den aldrig) och "--no-audit" bara i deploy-kontraktets installationsanrop (i prompter står blott "npm ci"). Klassregel för alla pgrep-baserade vakter: **mönstret måste väljas mot serverns FULLA processverklighet** (pm2 + fabriksbarn + skalkommandon) — samma läxa som o43 §5 "skyddscheckar ska fråga det de skyddar".
- Svitbugg (stang): server.closeAllConnections tar INGEN callback och stänger ej lyssnaren — close() måste alltid köras; sviten hängde annars på keep-alive-rest efter PASS A.

## §5 Bevis

- Svit verktyg/testa-doda-lankar.mjs: **24 PASS · 0 FAIL · 0 SKIP** (A hälsogrind · B drift-tak kasserar exit 2 utan fyndfil · C mätvärde med död länk + källor · D filskydd byte-identisk · E pgrep-grind (argv0-fejkbyggare, deterministiskt isolerad via AK1A_BYGG_MONSTER) · F fuser-ÄGANDE inkl. F4: samma låsfil utan ägare mäts fint = existens är INTE indikator · G smala mönster mot LEVANDE fabrik = inget falsklarm).
- Fixturer i mkdtemp under OS-tmp — sviten kan aldrig skriva i repot eller mäta prod.
- Återmätning: data/vakten/doda-lankar-2026-09-17-182642.json (exit 0; o47:s 13:46-fil orörd, filskyddet levande bevisat).
- Kvalitetsvakten helkörning --kör-motorer 18:13:42Z: **11/11 PASS · FEL 0 · MANUELLA 0 · GRÖN** (inkl. typbaslinjen).
- tsc: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär; verktyg/*.mjs berörs ej av tsconfig men kedjan kördes); node --check ×2 OK.
- src/ orörd · INGET bygge (prod-synken äger) · R2 orörd · data/blogg orörd · syskonytor orörda (s8-u1:s pågående prod-synk.mjs-kur lämnad helt ifred — den berördes av mitt objektval inte alls).

## §6 Bokningar / ärvda köer

1. Externa länkar (doda-lankar-externa.mjs) saknar samma grindar — nästa våg kan bära över §2-mönstret (oresonligt brådskande; externa mäter ej prod-hälsa).
2. 793 s = ljummen klass; en varm mätning (44 s-klassen) ger bättre jämförbarhet med o9 — lämplig som punktprov vid nästa stilla varma fönster.
3. s9-u3 omgång 12:s köpost "vaktens SSR-500-detektering" förblir ÖPPEN hos kvalitetsvakten (min kur skyddar döda-länkar-verktyget; vakten själv mäter fortfarande inte prod-HTTP-hälsa) — ägs av kvalitetsvakt-ytan.
