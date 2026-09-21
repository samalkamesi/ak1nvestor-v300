# o152 — Deploykvitto-vågen: fullvals-vaktsvep EFTER läkebytesbygget (o149 §restpost 3)

**Våg:** SPÅR 8 s8-u1 (manifest auto-s8-1790033719974, vakt 1/3), 2026-09-21
23:38–23:52Z (lokal 01:38–01:52 09-22).
**Anspråk (disk-först):** data/vakten/auto-s8-1790033719974-s8-u1-ansprak-o152-deploykvitto.md
+ protokollnummer.json post o152 — FÖRE mätning.
**KVD:** tsc 0 projektbinär (före och oförändrat efter — src/ orörd) · INGET
bygge (prod-synkens ägo) · R2 orörd · data/blogg orörd.

## §0 — KOLLISIONSHISTORIK OCH VIKTNING (ärligt bokförd, o151-precedensen)

Syskonet s8-u3 rullade PARRALLELLT (o153, protokoll på disk vid mitt
bokföringstillfälle) samma tre kvitton mot samma deployat läge — med
merge-base-bevis mot gröna bygget 496466f6 (DEPLOYAD 22:28:54Z; läkebackupen
23:35Z är återställningen av samma bygge), dessutom o148:s EFTER-GRÖN
metadatakvitto (som denna våg inte körde) + F2-deployfönstergrind
(rotorsaksfix) + svitadoption + hygienrond. **VIKTNING: o153 äger
huvudkvittot** (tyngre evidens-bredd). Detta o152 bokförs som vad det
faktiskt är: (a) den OBEROENDE REPLIKERINGEN — tre kvitton + fullsvepet
körda av två agenter utan kunskapsdelning, identiskt GRÖNA utfall
(256/0/0 · 0 fel · 0 fynd/180, förväntade401 klassad) = starkaste
bevisformen maskinen har; (b) unika tilläggsbevis som o153 saknar:
textnegativsonden (bevis 4), rotationsfriandet, grannrapport-identifieringen,
nyckeltalsguide en/ar-restposten. Nummerkollision redovisas öppet: s8-u2:s
`_s8u2o152-tillaggsbevis.mjs` (Docs-Offline-metrologi, o143 §8-kö) bär
"o152" i FILNAMN utan pool-reservation — protokollnummer.json (kanonisk
mekanism, o117) ger o152 till s8-u1 sedan 23:45Z; u2:s objekt är
innehållsmässigt disjunkt (metrologi, inte deploykvitto) och bör bokas under
nästa lediga nummer — notis lämnad på disk.

## VAL

o149 §RESTPOSTER post 3 — "Fullvals-vaktsvep efter deploy: 0-förväntat i alla
klasser (både bolag-404 och studio-401 kurade i träd)" — spårets bokade öppna
post. Dubbelarbetskontroll: senaste anspråk = s7/s6/s5/s2/s3-bolagpaket; ingen
rogen vaktsvepet. Syskon u2/u3 startade 01:35 lokal med samma "välj själv" —
deras val lämnas fria (meddelande i anspråksfilen).

## DEPLOY-LÄGET (detta kvitto gäller)

Prod-synkens bygg 2026-09-21 ~20:xxZ OOM-dödades 23:35Z; .next ÅTERSTÄLLD ur
läkebackup (senast gröna) 23:35:48Z; ny kod e09cb4eb VÄNTAR-RAM för ombygge
(prod-synk.log). **Läkebackupen innehåller o146+o147+o148+o149-kurerna** —
live-bevis: /bolag title "256 bolag i 10 branscher" (o148:s datadrivna tal;
gammal kod sa hårdkodat "100"), /dataset "256-bolagsuniversumet" (o149),
/data/nyckeltalsguide visar (n=244) (o149:s n-syns-alltid-kur). Efterkommande
ombygge på e09cb4eb ändrar inget av detta (kurerna redan i trädet då
läkebygget togs).

## UNIVERSUMTILLVÄXTEN 249 → 256 (friad, ej avvikelse)

o149 mätte 249 bolag 09-21 18:3xZ. Nu: data/portfolj-system/bolagsunivers.json
= 256 poster · ledger data/cache/bolags-publicerade.json = 256 slugs (ts
22:26:43Z — 7 nya AR-paket publicerade kvällen 09-21 av s3-agenterna). Det
datadrivna 256-talet prod visar är därför SANT mot båda källorna — exakt den
glidningssäkerhet o148:s kur byggde för; siffran följde datan utan kodrörelse.

## BEVIS (alla GRÖNA)

1. **o146-sonden** `node verktyg/_s8u3o146-bolag-sond.mjs` → "256 lovade |
   404: 0 | övriga: 0 — DOM: GRÖN" (facit data/vakten/_s8u3o146-bolag-sond-
   2026-09-21-1790034027544.json). o146:s EFTER-kvitto: publiceringskontraktet
   håller med de 7 nya sidorna.
2. **o147-livskontraktet** `node verktyg/testa-sitemap-livskontrakt.mjs` →
   "0 FEL · 0 varningar · 0 oprovade · LIVSKONTRAKTET GRÖNT" — 2 655 sitemap-
   URL:er, 486 byggfrusna probade mot localhost. o147:s EFTER-kvitto §5:2.
3. **Fullvaktsvep** `node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000`
   → "0 fynd bland 180 kombinationer" (rapport data/vakten/granssnitt-
   2026-09-21T234835.json; 45 unika sidor × 2 teman × 2 bredder). o149:s
   instrumentkur lever i produktionsträdet: `forvantade401: 1` per /studio-
   kombination (4 totalt) bokförd ÖPPET, exkluderad ur felAntal = 0 — o146:s
   bolag-404-klass och o149:s auth-401-falsklarm är BÅDA borta ur fyndbilden.
4. **Negativsond texter** (curade ytor, loopback): 0 träffar på gamla mönstret
   ("100-bolagsuniversum|100 bolag|10 branscher × 10|10 × 10") på /dataset,
   /dataset/teknik/vardering, /data/nyckeltalsguide, /en/dataset, /ar/dataset,
   /dataset/energi/brutto-marginal — nya datadrivna värden lever ("256-
   bolagsuniversumet", (n=244)).
5. **tsc** `node node_modules/typescript/bin/tsc --noEmit` → 0 fel.
6. **prod 200** (https://lab.ak1nvestor.com/) + localhost 200 + deploylåset
   ledigt vid mättillfället.

## UNDERSÖKT OCH FRIAD (viktig negativ kunskap)

- **Fullsvepets urval innehöll inte /rapportakademin eller datasetgrenen** —
  ingen glipa: urvalet är en 24-platsrotation (granssnitt-urval.mjs, o68:s
  rotkur), aldrig-mätta sidor först (därför 20 färska bolagssidor t–v från
  AR-tillväxten). /rapportakademin mättes 06:27:09Z (journal) och DoD-
  bevakarens riktade svep 23:47:57Z = 0 fynd/4 kombinationer (grannrapport
  granssnitt-2026-09-21T234820.json — inte min körning, redovisas ärligt).
  Datasetgrenen: 209 sidor journalerade, roterar i global äldst-först.
- Journalen skrevs av mitt svep (23:49:40Z på /bolag/vz m.fl.) — rotationen
  fortgår. 642/2 655 journalerade totalt.
- /en/data/nyckeltalsguide + /ar/data/nyckeltalsguide = 404: inte i sitemap
  (livskontraktssviten 0 fel ⇒ inget dött löfte); guiden verkar enbart-sv —
  ev. flerspråksgap att undersöka i framtida våg, INTE ett vaktfynd.

## ROTORSAKSFIX?

Inget att fixa — alla fyndklasser tomma, siffror sanna, kontrakt gröna.
Vågens värde: EFTER-kvittot som o146+o147+o148+o149 alla bokade som villkor
("rids nästa gröna bygge") är LEVERERAT — huvudkvittot i s8-u3:o153 (som även
tog o148:s metadatakvitto), oberoende replikerat här med sexfaldigt bevis,
inklusive första mätningen av universumstillväxtens datadrivna beteende i
prod (249→256 utan kodrörelse = o148-kontraktets levnadskraft bevisad).

## RESTPOSTER (öppet bokförda)

1. Prenumerationssidor ×3 språk (o149 restpost 1) — R2-yta, väntar kund.
2. /data/nyckeltalsguide en/ar-språkfrågan (ovan) — vill utredas av framtida
   våg med källkoll i src/app/(huvud)/data/nyckeltalsguide innan något döms.
3. Fullsvepets nästa 6-timmarssvep (cron) — bör förbli 0 medaning rotationen
   tar sig an de 20 färska bolagssidornas grannar (a–s-mätningarna 09-21 +
   t–v 09-22 ⇒ bolagsgrenen nästan komplett journalerad).
