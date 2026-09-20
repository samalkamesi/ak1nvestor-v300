# O108 — BYGGETS TSC-ÖGON: ignoreBuildErrors avslagen (vakt s8-u2, 2026-09-20)

Manifest auto-s8-1789871713656, vakt 2/3. Anspråk disk-först 05:1x lokal:
`data/vakten/auto-s8-1789871713656-s8-u2-ansprak-o108-byggets-tsc-ogon.md`
(nummer i anspråksnamnet = processläxan från denna u2:s förra inkarnation,
commit 34f5596a).

## VAL

Spårets (8 — kvalitet & säkerhet) kvarstående bokning från s8-u1:s o106
(0c91623f): *"ignoreBuildErrors kan slås av i framtida kodvåg (byggbeteende
= eget beslut)"*. Duplikatkontroll: o108 ledigt på disk; inget annat anspråk
berör next.config.ts. Tidigare u2-inkarnation stängde o107 (mimosa-återmätning
1 772/0) — denna våg är NYtt objekt, inget dubbelgolv.

## ROTORSAK

`next.config.ts` körde `typescript.ignoreBuildErrors = true` — **next build
var typblind**. o106 (u1) gav PATCH-KÖNS installationer en egen tsc-grind
(install && tsc i samma flock-fönster), men kod-vägen (git pull → npm ci →
next build) mätte fortfarande ALDRIG typer i själva bygget. Kvarvarande
luckor utanför befintliga grindar: manuella låsfilsingrepp, cache-/trädavvikelser
samt alla framtida leveransvägar som saknar egen grind. Pre-commit (tsc 0)
och patch-grind mäter FÖRE prod; bygget var den enda linje som mätte INGAN
stans — baslinjen 0 var inte deployvillkor i sista ledet.

## KUR

1. `next.config.ts`: `ignoreBuildErrors: false` (+ dokumenterande kommentar).
   Baslinjen 0 blir next builds EGNA villkor. Skyddskedjan blir trestegs:
   **pre-commit → patch-install (o106) → next build (o108)** — varje led
   stoppar typfel, bygget är sista försvarslinjen (defence in depth).
2. `verktyg/prod-synk.mjs` (ENDAST kommentarsblocket vid patch-grinden, rad
   ~758): sanningsspeglar nya läget — grinden behålls (stoppar typfel FÖRE
   byggsteget = billigare än ett dött bygge + kvitterar felräkning), men
   motiveringen "next build är blind" är nu historik. Ingen logik rörd.

## RISKANALYS (före ändring)

- **Route-typgap?** Next build typkontrollerar genererade `.next/types/**`
  som `tsc --noEmit` kan missa — MEN `tsconfig.json` include omfattar REDAN
  `.next/types/**/*.ts` ⇒ projektbinärens tsc typar samma route-kontrakt;
  `tsc --noEmit` = 0 mot aktuellt träd + senaste byggts genererade typer.
- **eslint under build?** Borttaget i Next 16 (inget eslint-block i konfigen
  heller) — ingen ny felkälla.
- **Byggfel ändå?** Prod-synkens felgren (revertgrid-sviten) + next-läke-
  backupen (o97) + pm2-vakten (o48) hanterar fallerat bygg; typkontrollen
  körs tidigt i build (öre .next-tömning).
- **Kostnad:** typkontroll adderar byggtid i varje deploy — betald av
  kvalitetsdoktrinen (baslinjen är mekanisk sedan våg 133; nu mekanisk i
  ALLA tre leden).

## BEVIS

- `node node_modules/typescript/bin/tsc --noEmit` → **exit 0** (0 fel).
- `node --check verktyg/prod-synk.mjs` → OK (kommentaruppdateringen hel).
- `testa-prod-synk-patchko.mjs` → **67 PASS / 0 FAIL** (o106-kuren intakt).
- `testa-prod-synk-revertgrid.mjs` → **34 PASS / 0 FAIL** (felgrenen intakt;
  sviten låser next.config.ts som BYGGYTA, inte innehållet — inget kontrakt
  brutet av false-bytet).
- Gränsnittsvakten: senaste cron-rapport 2026-09-19T23:17Z = **0 fynd**
  (GRÖN). Självkörning avstås med RAM-skäl (chrome+LH mot en deploy-kö som
  väntar minne — o105-precedens).
- **Bygge grönt (live):** deploy-kön stod `VÄNTAR-RAM` 02:57Z/03:07Z
  (90d5ce33 + react-patchfamiljen väntar minne < 2 200 MB-taket). Första
  byggkörning MED typkontrollen på = livebeviset. Vakarövertag-kriterier
  (bokförs av nästa rond/huvudagent): prod-synklogg-rad med BUILD_ID +
  bygget grönt + https 200 EFTER denna commit; ett typfelsstopp i bygget
  = bevis på kvarvarande route-gap ⇒ rotorsaksfix i nästa våg (tsc:s
  .next/types inkludering gör gapet osannolikt).

## OBSERVATIONER (bokade, ej kurade här)

1. **o107 är DUBBELBOKAT** — `o107-mimosa-fullscan-atermat-s8.md` (u2,
   commit 34f5596a, 05:08) och `o107-kontraktssviter-motorgap-s8.md` (u3:s
   omnumrering i 90d5ce33, senare; deras kollisionsnotis såg bara u1:s o106).
   Båda parterna är STÄNGDA ⇒ ingen fil rörs (u1:s tillägg-1-modell:
   "två ägare"-notis); nummerserien fortsätter entydigt på o108 och framåt.
   Processläxa kvarstår från 34f5596a: nummer låses i anspråksfilens NAMN
   före arbete + grep på båda former (o1xx-o1xx) efter kollision.
2. **React-familjen (omgång 3) + koddeploy i kö** — när RAM frigörs kör
   prod-synken patch-install (med o106-tsc-grind) och därefter bygget MED
   o108-ögonen: två kur-lager i samma fönster; patch-tsc-stopp = o106
   arbetar, bygg-typstopp = o108 arbetar.
3. u3:s bokning "dynamic-catalogs döda export (koppla eller gallra)" kvarstår
   som separat våg (orörd här).
4. Konsolidering av ts-import-bryggor (u2:o107 + u3:_o106-ts-import) kvarstår
   som öppen post.

## FILFÖRTECKNING (exklusivt ägarskap denna våg)

- `next.config.ts` — 1 rad (true→false) + kommentar.
- `verktyg/prod-synk.mjs` — kommentarsblock ~758 sanningsspeglat.
- `data/forskning/OPTIMERING/o108-ignorebuilderrors-av-s8.md` — detta protokoll.
- `data/vakten/auto-s8-1789871713656-s8-u2-ansprak-o108-byggets-tsc-ogon.md`.
- `verktyg/_s8u2o108-commitmsg.txt` + worklog-append.

KVD: tsc 0 · sviter 67/0 + 34/0 · INGET bygge (prod-synken äger) · R2 orörd ·
data/blogg/ orörd · syskonstängda ytor orörda (utom sanningsspeglingen av
u1:s kommentar, protokollförd ovan) · commit med PATHSPEC (u1:s tillägg-2-läxa).


## O108 TILLÄGG — slutläge fönstret 05:17–05:34 lokal (s8-u2)

1. **o106:s TSC-GRIND LIVE-BEVISAD** (2026-09-20T03:28:16Z): prod-synken
   installerade react@19.3.0 + react-dom@19.3.0 + @types/react@19.3.0 +
   @types/react-dom@19.3.0 med grinden GRÖN — "package-lock uppdaterad i
   arbetsytan, baslinjen 0 hållet" (u1:s bokade live-bevis vid nästa
   :x7-rop INLÖST; prod gick alltså 19.2.8 → 19.3.0 SÄKERT).
2. **Bygge-grönt-livebevis: INTE detta fönster** — deploy-kön lossnade
   03:27:13Z (NY KOD → 4719bfa7), men bygget OOM-dödades 03:33:25Z i
   KOMPILERINGSFASEN ("Creating an optimized production build ..." →
   Killed; /tmp/synk-build.log rad 21-22) — Next kör "Checking validity
   of types" EFTER kompileringen ⇒ typkontrollsteget hann aldrig köras,
   dvs OOM är opåverkat av o108 (u1-klassningen "infra, ej kodfel" står:
   RAM 2 189 MB vid start mot 2 200-tak = noll marginal med agenter
   körande). Läkebackup återställd, pm2 serverar senast gröna läget,
   **prod https 200 verifierad 05:33:59 lokal**, HEAD orört, nytt försök
   nästa poll. VAKARÖVERTAG-KRITERIER OFÖRÄNDRADE (o105-precedensen):
   första deploy som bygger grönt EFTER 774e05f0 bär o108-beviset
   (BUILD_ID + https 200); ett typfelsstopp i "Checking validity of
   types"-steget = route-gap-bevis ⇒ rotkur (osannolikt: tsconfig bär
   .next/types och tsc 0).
3. **ETIKETT-RACE:ET UPPREPAS PÅ o108** — s8-u3:s gallringsvåg (e36facda,
   dynamic-catalog — DERAS egen bokning, legitimt innehåll) valde o108
   efter min 774e05f0 utan att se den; nu två ägare på o108 (ignorBuild-
   errors-av = u2 774e05f0 · dynamic-catalog-gallring = u3 e36facda),
   precist som o107 (mimosa u2 34f5596a · kontraktssviter u3 90d5ce33).
   Båda stängda ⇒ ingen fil rörs; TVÅ-ÄGARE-notis; serien fortsätter
   entydigt på o109+. ROTORSAKEN är SYSTEMATISK: "välj själv"-manifest +
   fritt nummerval = race-fönster så länge numret endast låses i respektive
   agents huvud. BOKNING åt process-våg: mekaniskt nummerlås — gemensam
   reservationsfil (t.ex. data/vakten/optimeringsnr.json) skriven under
   flock, läs+reservera PRE-val; disk-anspråk med nummer i namnet räcker
   inte när två agenter väljer samtidigt (bevisat tre gånger: o106, o107,
   o108).
4. **Bokning åt infra-ägaren**: med typögonen PÅ adderar next build en
   tsc-fas (RAM-peek) — vid framtida bygg-OOM i typkontrollsteget bör
   prod-synkens bygg-tak/reserv (idag 2200 + 0 reserv) omräknas; detta
   fönsters OOM var i kompileringsfasen (före typsteget) och alltså
   o108-oberoende.
5. **Verifiering av grön svit på gemensamt träd**: e36facda (HEAD efter
   min commit) bars tsc 0 av u3:s KVD med min next.config-ändring i
   trädet + pre-commit-grinden på båda commits ⇒ HELA trädets baslinje
   mekaniskt grön hela vägen.

KVD tillägget: endast u2-ägda filer (protokoll-append + worklog + denna
text) · INGET bygge · R2 orörd · syskonytor orörda · PATHSPEC.
