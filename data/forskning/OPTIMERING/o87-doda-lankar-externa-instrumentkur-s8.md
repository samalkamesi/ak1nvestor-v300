# O87 — Döda länkar EXTERNA: instrumentkur (Spår 8, s8-u2)

Datum: 2026-09-19 · Agent: s8-u2 (manifest auto-s8-1789797929474, vakt 2/3) ·
Företrädare: o9 (interna baslinje), o14 (externa vakt + baslinje), o47
(artefaktdoktrinen), o55 (INTERN instrumentkur — §6.1:s köpost = detta objekt)

## §0 Val och duplikatkontroll

- Anspråk disk-först: `data/vakten/auto-s8-1789797929474-s8-u2-ansprak-o87.md`
  06:18:31Z, FÖRE kur. o87 ledigt (ls: o85 levererat av u1; o86 anspråkat av
  u3 = gränsnittsvaktens driftblindhet — deras ytor orörda hela vågen).
- OBJEKT = o55 §6.1 ORDAGRANT: "Externa länkar (doda-lankar-externa.mjs)
  saknar samma grindar — nästa våg kan bära över §2-mönstret". Ingen tidigare
  våg levererat det (OPTIMERING-listan: o14 byggde verktyget, o47/o55 kurade
  det INTERNA verktyget).
- Syskon-ytor lämnade ifred: granssnittsvakt.mjs + granssnitt-drift.mjs +
  testa-granssnitt-drift.mjs (u3:o86), granssnittsvakt-cron.sh +
  testa-granssnitt-cron-* (o85), doda-lankar.mjs + testa-doda-lankar.mjs
  (o55 — LÄSTA som mönster, ändrades ej), verktyg/_s9u3-kartuppdatering-*.mjs
  (s9-u3:s staged-fil — commit med pathspec, lämnad staged).

## §1 Rotorsaka (kodbelagd i verktyget FÖRE kur)

Verktyget crawlar 2 400+ LOKALA sidor (sitemap-frö + länkgraf mot localhost)
och hade INGEN av o55 §2:s skydd:

1. **Ingen mätfönster-grind** — varken fuser-kontroll av deploy-låset,
   byggprocess-grind eller hälsogrind. En körning mitt i ett halvtrasigt
   .next-fönster (bevisat scenario: fem OOM-döda synkbyggen 03:19–05:29Z,
   o83 §4 — chunk-500 med HTML-200) samlar in en FALSK länkgraf (sidor som
   inte kan parsas ger inga externa mål) och bokför den som mätvärde. Det är
   exakt o47:s artefaktklass: 1 616×500 bokfördes som "döda länkar" av det
   interna verktyget innan o55.
2. **Inget drift-tak** — crawl-fel räknades inte ens (sidor utanför 2xx/3xx
   hoppades tyst över); ett driftfönster kunde aldrig upptäckas EFTERÅT.
3. **Inget filskydd** — `doda-lankar-externa-<datum>.json` och
   `-insamling.json` skrevs över vid samma-dag-omkörning (bevisfarligt).
4. **Inget exitkodskontrakt** — 0/1/2-semantic saknades; --tvinga fanns ej.
5. **Bakdörr**: mellanlagret (insamlingen) kunde skrivas i ett driftfönster
   och senare ÅTERUPPTAS (--validera-fran) till ett "mätvärde".

## §2 Kur (verktyg/doda-lankar-externa.mjs — o55 §2:s kontrakt ordagrant bärt)

1. **Mätfönster-grind FÖRE allt** (även --validera-fran): fuser-ÄGANDE av
   deploy-låset (öppna fd:n — existens är inte indikator, flock lämnar
   filen), pgrep med HELA mönster (`next build,npm ci --no-audit` — pm2:s
   "next start" och fabriksagenteras prompt-cmdlines matchas aldrig; o55 §4:s
   F1/F2-läxor ärvda), hälsogrind / + /kurser = 200. Miss ⇒ exit 1 INNAN
   mätvärde.
2. **Drift-tak EFTER crawl**: > 5 % av LOKALA sidor på 5xx/nätfel ⇒ rapport
   kasseras, exit 2, ingen fyndfil. Mellanlagret bevaras MÄRKT
   `driftfonster: true` + `driftAndel` (diagnostikunderlag), och
   återupptagning till mätvärde VÄGRAS exit 1 (endast --tvinga). Externa
   måls SERVERFEL räknas INTE i taket — externa värdars fel, redan egen
   klass (o14 §2).
3. **Filskydd**: rapport + mellanlager skrivs ALDRIG över — klockslagssuffix
   vid samma-dag-kollision (utökat från o55: skyddar även mellanlagret).
4. **--tvinga** = diagnostikläge: hoppar grunder + tak, märker ALLA
   utdatafiler "diagnostik", stdout märks "[DIAGNOSTIK — ej mätvärde]".
5. **Exitkodskontrakt** 0/1/2 + miljövariabler AK1A_DEPLOY_LAS /
   AK1A_BYGG_MONSTER (svit-isolering; skarpt läge opåverkat).
6. Rapportfält: `tvingad`, `matfonster` ("grönt"|"diagnostik"),
   `aterupptagen`, `driftAndel` (null vid återupptagning ur omarkerat
   mellanlager — ärligt), `felSidor`-stickprov i mellanlagret.

## §3 Bevis — svit

- **Nya sviten `verktyg/testa-doda-lankar-externa.mjs`**: A hälsogrind
  (kod 1, ingen fil) · B drift-tak (kod 2, ingen fyndfil, mellanlager MÄRKT,
  återupptagning VÄGRAS kod 1) · C HELA kedjan offline — externa "mål" mot
  127.0.0.1-fejkserver (hostname passerar verktygets externa filter men
  lämnar aldrig maskinen): OK + DOD med källor + mätvärdes-märken · D
  filskydd byte-identiskt för båda filtyperna · E pgrep-grind (argv0-
  fejkbyggare, deterministiskt isolerad) · F fuser-ÄGANDE inkl. F4-existens-
  fällan (samma låsfil utan ägare = mätning går) · G hela mönster mot
  LEVANDE processverklighet (äkta byggfönster under svit ⇒ SKIP, aldrig
  falskt rött) · H --tvinga märker rapport + mellanlager + stdout.
- Resultat mot committad kod: **31 PASS · 0 FAIL · 1 SKIP** (G skip — ett
  äkta byggfönster pågick; skip-semantiken är kontraktet). Funktionsidentisk
  pre-wipe-version: **33 PASS · 0 FAIL · 0 SKIP** 06:24Z (enda skillnaden:
  en härdad `|| 0` i vägransmeddelandet). Sammanlagt: noll FAIL i alla körningar.
- Inbyggt självtest `--självtest` 6/6 (o14:s klassificerare oskurd, inkl.
  imy-HEAD/GET-fallet).
- Regression o55-sviten `testa-doda-lankar.mjs`: **24 PASS · 0 FAIL** (det
  interna verktyget orört).
- `node --check` · `node node_modules/typescript/bin/tsc --noEmit` =
  **0 fel** (projektbinär; verktyg/*.mjs berörs ej av tsconfig men kedjan
  kördes — o55-precedensen).

## §4 Skarp återmätning (baslinjen)

- **06:50–07:03Z** (fönster manuellt verifierat FÖRE start: fuser tom, inget
  bygg, / + /kurser 200): **2 422 sidor crawlide · 308 unika externa mål ·
  DÖDA 0 · OUPPNÅBARA 0 · SERVERFEL 0 · OK 104 · BLOCKERAD 204 · 756 s**.
  Mönstret identiskt med o14-basen (09-15: 2 050 sidor, 308 mål, 0 döda;
  adlibris+bokus 429-vägran = BLOCKERAD, amazon 200 ×102). Grafen växt
  2 050 → 2 422 sidor på fyra dagar — **baslinjen 0 döda externa länkar
  STÅR**; 0-fynd-jakten: fyndet är frånvaron. Syskonbevis samma dag: interna
  vaktens 06:34Z-rapport 3 743 sidor · 0 döda (disk, data/vakten/).
- ÄRLIGHET: denna körning skedde med URSPPRUNGSVERKTYGET — prod-synkens
  rent-träd (git checkout -- . vid byggstart 06:42Z) hade raderat de
  unstaged verktygsändringarna innan launch (se §5). Crawl+valideringslogik
  är identisk mellan versioner (kuren ADDERAR grindar/tak/märkningar, ändrar
  ej mätlogik); fönstret var manuellt grönt; 308 hittade mål (oförändrat
  mot baslinjen) utesluter dolda crawl-fel — sidor som inte går att hämta
  ger inga mål.

## §5 Metodfynd — rent-träd-racet (tredje beviset för o83-läxan)

- Prod-synkens rent-träd-steg raderade mina UNSTAGED verktygsändringar
  **TVÅ GÅNGER** under fönstret: 06:42Z (deploy av 6e4a6668-familjen) och
  07:07Z (byggstart — Write landade 09:07 lokal och revertades inom
  sekunder; bevis: svit 13 PASS/20 FAIL mot den tyst återställda filen).
  o83 (d694ae81) bokade läxan "committa verktygsändringar FÖRE byggfönster"
  efter ETT sådant raderande — detta fönster bevisar att läxan måste
  mekaniseras HÄRDARE: med synkcykler var 10:e minut hinner "committa i
  tid" inte alltid.
- **KUR (dokumenterad för fabriksfamiljen)**: Write + OMEDELBART `git add`
  i nästa andetag — STAGED innehåll överlever `git checkout -- .` (steget
  skriver INDEX-versionen till arbesträdet). Commit därefter med EXPLICIT
  PATHSPEC (`git commit -F <fil> -- <egna filer>`) så syskons staged-filer
  aldrig dras med (s9-u3:s _s9u3-kartuppdatering-0919-v2.mjs lämnades
  staged och orörd — deras commit, deras ägarskap).
- Sekvensen i denna våg: Write → grep-verifiering (verifyeraMatfonster = 2
  träffar) → git add → svit → commit 24c220d6. Ingen tredje radering.

## §6 KVD

src/ orörd = INGET bygge (prod-synken äger; tsc 0 via projektbinär). R2
orörd (inga priser/tier/publicering). data/blogg/ orörd. data/vakten/ =
gitignorerade diskbevis (rapport + mellanlager 2026-09-19 bevarade). Kö:
(1) full crawl-återmätning med KURAT verktyg i stilla ~13-min-fönster —
validerings-vägen --validera-fran bevisad skarp nedan; (2) externa vakten i
cron-schema (manuell today — internal vakt har cron, externa saknar det);
(3) ev. DRIFTARTEFAKT-klass-läsning hos o86-ägaren om deras dom införs
(diskret gränssnitt: rapport.status Är deras yta — inte rörd här).

## §7 Skarp validerings-väg med KURAT verktyg — dubbelbevis

07:30:50Z (fönster: inget bygg, lås fritt, 200 ×2 — kontrollerat med
självmatchningsfritt mönster, se §8): `node verktyg/doda-lankar-externa.mjs
--validera-fran data/vakten/doda-lankar-externa-2026-09-19-insamling.json`:

- **Grindarna SKARPT GRÖNA**: loggrad `matfonster: {grunder: "gröna"}` —
  fuser + pgrep + hälsogrind kördes på riktiga processläget.
- **308 mål omvaliderade på 34 s · DÖDA 0 · OUPPNÅBARA 0 · SERVERFEL 0 ·
  OK 104 · BLOCKERAD 204 · exit 0** — baslinjen oberoende återbevisad med
  det kurerade (och 07:12Z DEPLOYADE, commit 24c220d6) verktyget.
- **FILSKYDDET SKARPT BEVISAT**: rapporten skrevs som
  `doda-lankar-externa-2026-09-19-073050.json` — klockslagssuffixet trädde i
  kraft eftersom 06:50-rapporten redan ägde dagens namn (222 809 B bevarad
  byte-för-byte, den nya 222 900 B separat). Kontraktet "en rapportfil
  skrivs ALDRIG över" har levande skarpt bevis.
- Rapportfält: `tvingad: false · matfonster: "grönt" · aterupptagen: true ·
  driftAndel: null` — ärlig hållning: återupptagning ur ett omarkerat
  (pre-o87) mellanlager kan inte redovisa drift-tal.

## §8 Metodfynd 2 — övervakningsskalets självmatchning (o55 §4 F-klass, arv)

Under fönsterjakten rapporterade mina polls falskt "bygg pågår" i ~10 min:
`pgrep -f "next build"` i ett sammansatt bash-kommando matchar DET EGNA
bash-cmdlinet (som ju innehåller mönstret). Exakt samma klass som o55 §4:s
F1 ("next" matchade pm2) och F2 ("npm ci" matchade fabriksprompter) — nu i
ad-hoc övervakning i stället för i verktyg. KUR: självmatchningsfritt
mönster (`pgrep -f "next [b]uild"` — klammern bryter självträffen) eller
`ps -o args`-kontroll. Verktygets EGEN grind är osårbar av en annan mekanism:
dess processexistens och dess pgrep-anrop sker i samma process — pgrep
exkluderar sig själv, och verktyget cmdline innehåller mönstret ENDAST som
pgrep-argument (aldrig som exekverbar sekvens). Fabriksläxa: alla
processövervakande kommandon SKALL skrivas med klammer-mönster direkt.
