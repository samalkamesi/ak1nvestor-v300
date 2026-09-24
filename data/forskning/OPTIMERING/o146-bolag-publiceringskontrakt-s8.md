# o146 — Publiceringskontraktet för bolagssidorna (spår 8, kvalitetsvåg)

**Agent:** fabriken s8-u3 (vakt 3/3) · **Datum:** 2026-09-21 · **Status:** KOD KURERAD,
tsc 0 — deploy-bygget (prod-synkens fönster) aktiverar och bevisar.

## 1. Fynd

Gränsnittsvaktens svep 2026-09-21T11:30Z rapporterade 28 konsolfel i 180
kombinationer. Röntgen av mönstret: exakt 1 fel per kombination, samma 7
sidor i alla teman/skärmar — 24 av 28 var `/bolag/{ai-pa,barc-l,cap-pa,
dsy-pa,lloy-l,nwg-l}` med **404 på dokumentet självt**, 4 var `/studio`
(401 på gästens poll av /api/studio/stream — korrekt autentiseringssvar,
bokförs i §7).

## 2. Rotbevis

- `sitemap.xml` är `force-dynamic` och listar `bolagSlugs()` **live** ur
  `data/portfolj-system/bolagsunivers.json` → 249 bolags-URL:er lovade.
- `/bolag/[slug]` är `force-static` + `dynamicParams = false` (våg 81: RÖR
  EJ — `true` ger i Next 16 soft-404, notFound-HTML med HTTP 200, prodmätt
  2026-09-07) → **243** sidor existerar (senaste deploy d401d719 04:06
  byggde med dagens-filens 243).
- Git-bevis på när gapet föddes: dataleveranser **efter** deployen la till
  6 bolag — AI.PA 11:30 (ad6883a9), DSY.PA+CAP.PA 11:38 (00a8db01), +
  BARC-L/LLOY-L/NWG-L — korrekt enligt data-doktrinen ("datafiler behöver
  inget bygge"), men rutten är byggfryst ⇒ 249 lovade mot 243 byggda.
- Maskinellt FÖRE-facit (sond `verktyg/_s8u3o146-bolag-sond.mjs`, sitemap
  mot localhost=prod): **249 lovade | 6 × 404 | 0 övriga** —
  `data/vakten/_s8u3o146-bolag-sond-2026-09-21-1790007523667.json`.
- Sekundära exponeringsytor samma rot: `/bolag`-registret (force-static +
  ISR 24 h läser universumet live vid revalidation → kundklickbara döda
  länkar) och syskonlänkarna på ISR-revalidaterade bolagssidor.

## 3. Rotorsak

Doktrinkollision: **live-ytor** (sitemap force-dynamic, registret+ISR)
lovar ur filen medan **rutten** är fryst till byggögonblicket. Någon
måste veta "vad som faktiskt är byggt" — ingen gjorde det.

## 4. Kur — publiceringskontraktet (o146)

Bygget är sanningen om vad som existerar:

1. `src/lib/bolags-sidor.ts` — `skrivPubliceradeSlugs()` (generateStaticParams
   tecknar ned de byggda slugs till `data/cache/bolags-publicerade.json`,
   gitignorad runtime-cache enligt våg 121-mönstret: skrivfel kastar ALDRIG)
   + `publiceradeBolagSlugs()` / `publiceradeBolagSidor()` med **fallback =
   hela universumet** (dagens beteende) när nedteckningen saknas/ogiltig —
   kontraktet degraderar mjukt, aldrig hårt. `syskonBolag()` listar nu
   enbart publicerade syskon.
2. `src/app/(huvud)/bolag/[slug]/page.tsx` — generateStaticParams skriver
   kontraktet; `dynamicParams = false` O-RÖRD (våg 81-doktrinen kvarstår:
   äkta 404 på okända slug:ar).
3. `src/app/(huvud)/bolag/page.tsx` — registret listar `publiceradeBolagSidor()`.
4. `src/app/sitemap.ts` — bolagsgrenen lovar `publiceradeBolagSlugs()`.

Egenskap: universumväxt utan deploy (data-doktrinen) syns fortsatt LIVE på
datasetsidorna (oförändrade — de läser medianlagret), men lovar aldrig en
/bolag-sida förrän bygget levererat den. Sitemap ↔ register ↔ syskonlänkar
↔ ruttdoktrin — fyra sanningsytor, ett kontrakt.

## 5. Bevis

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (baslinjen hållen).
- Sond-syntax `node --check` = OK; FÖRE-dom: RÖD 6 döda löften (se §2).
- Mekanikeldprov (skriv→läs→validera→fallback→Set-filtrering, i /tmp utan att
  röra prod-cachen): 4/4 gröna — ogiltig JSON avvisas, saknad fil triggar
  fallback, filtrering exkluderar icke-byggda ur registret.
- `data/cache/` ägs av ak1a (byggprocessens user), `.gitkeep`-undantaget
  bekräftar gitignore — nedteckningen smutsar aldrig git-ytan (AGENTS.md:
  smutsig yta blockerar prod-synken).

## 6. Efter-deploy-dom (för nästa vakt/fönster — ett kommando)

`node verktyg/_s8u3o146-bolag-sond.mjs` ⇒ väntat: **249 lovade (eller
dåvarande universum) | 0 × 404 | DOM GRÖN**; därefter gränsnittsvaktens
nästa svep = 24 konsolfel färre. Vid RÖD: läs cache-filens `ts` — står den
före senaste DEPLOYAD i prod-synk.loggen har bygget aldrig kört
generateStaticParams (oförklarligt — eskalera), annars fallback-grenens
värde i universumfilen.

## 7. Kvarvarande fynd (bokförda, ej kurade här)

- `/studio` 401 på `/api/studio/stream` för gäster (4 vaktfynd): korrekt
  server­svar, men klienten pollar före inloggning — kunde kuras i
  studio-klienten (vänta på auth innan poll); lämnas åt studio-spåret
  (våg 81–93-ytan är kundens chatt — ej min ägandesida).
- `/bolag`-metadata fastnar i "100 bolag i tio branscher" (universumet är
  249) — copy-föråldring, SEO-yta, oskadlig men bör uppdateras av ägande spår.
- Latent samma klass: `/dataset/[bransch]` + speglar kör också
  `dynamicParams = false` medan `branschSlugs()` läses live i sitemap;
  i dagsläget 0 gap (branschmängden stabil), men ny LANDSIDA-bransch utan
  deploy skulle återskapa mönstret — publiceringskontraktet är
  generaliserbart om det slår till.

## 8. Kronologi

15:5x–16:3x lokal: fynd → rot → sond FÖRE (249/243/6) → kur 4 filer → tsc 0 →
mekanikprov → denna rapport. Deploy-bygget ägs av prod-synken (OOM-disciplin);
inget bygge har körts av agenten (fabriksregeln).
