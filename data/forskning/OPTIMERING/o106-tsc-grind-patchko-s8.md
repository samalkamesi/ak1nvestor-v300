# o106 — PATCH-KÖNS TSC-GRIND: baslinjen 0 blir deployvillkor (spår 8)

DATUM: 2026-09-20 · Agent: s8-u1 (manifest auto-s8-1789871713656, vakt 1/3) · Status: LEVERERAD

## 1. ROTORSAKEN

`next.config.ts` kör `typescript.ignoreBuildErrors: true` — **next build är
blind för typfel**. Patch-kön (o46) kan därför leverera en höjning av
`@types/*` eller `typescript` som **bryter tsc-baslinjen 0 och deployas
GRÖNT ändå**. Därefter kräver pre-commit-grinden 0 fel på repets sida medan
prod-sidan aldrig mätte: asymmetrin är baslinjens dödsfälla — alla framtida
commits blockerade i efterhand, prod körande på typer koden inte typar mot.

Hotbilden var inte teoretisk: o73 §REST-bokade redan "omgång 3 =
react-familjen @types 19.3.0" — exakt den paketklassen — och sharp-kvittot
(2026-09-18 17:32:04Z, ok) låste upp omgången. Utan kur hade omgång 3
kunnat döda baslinjen utan att ett enda byggsteg reagerat.

## 2. KUREN (verktyg/prod-synk.mjs, TILLÄGG i o46-sektionerna — gamla kontrakt orörda)

- **`byggPatchInstallKommando(spec)`** (ren, exporterad): installationsbarnets
  inre kommando kedjar nu `npm install <spec> … >> /tmp/synk-patch.log 2>&1
  && node node_modules/typescript/bin/tsc --noEmit >> /tmp/synk-patch.log 2>&1`
  — tsc körs i SAMMA flock-fönster som installationen (inget race-fönster
  emellan), med **projektbinären, ALDRIG npx** (deployfönstrets
  cachedummy-fälla, AGENTS-doktrinen).
- **`raknaTsFel(loggText)`** (ren): räknar `error TS<kod>:`-rader —
  kvitto-detalj + klassning. Kräver felkod med kolon: citerad text i löpande
  logg räknas ej.
- **`bedomPatchInstall(exitOk, loggText)`** (ren): klassar `"ok"` /
  `"tsc-fel"` / `"install-fel"`. Med && -kedjan ger tsc alltid exit 1 vid
  typfel och skriver då `error TS`-rader — det är skiljetecknet mot vanliga
  npm-fel (tom logg = flock-startade-aldrig-klassen).
- **korSynk-grenar**: `tsc-fel` ⇒ **locken riven FÖRE byggsteget**
  (`aterskapaPatchLas`, flyttad upp före installationsblocket), misslyckat
  kvitto med felräkning, deploy fortsätter på god lock — patch-fel blockerar
  aldrig kodleverans (o46-semantiken bärd). `ok`-vägen loggar
  "installerad + TSC-GRIND GRÖN". Loop-skyddet (3 försök per exakt
  paket+version, versionbyte = nytt liv) gäller oförändrat.

## 3. BEVIS

- patchkö-sviten `verktyg/testa-prod-synk-patchko.mjs`: **52 → 67 PASS,
  0 FAIL** (15 nya: kommandokontrakt — install-delen orörd, && -kedja mot
  projektbinär, ALDRIG npx, exakt EN &&, inga skal-metatecken utöver
  validerat spec; klassning — 6 utfall inkl. null-logg och tom logg;
  tsc-fel-kvittons loop-skydd dödar posten som idag).
- ALLA åtta prod-synk-sviter gröna efter kuren: arbetsytasynk 34/34 ·
  nextlaeke 29/0 · **patchko 67/0** · pm2vakt 35/0 · ramvakt 17/17 ·
  revertgrid 34/0 · vaktrapport 16/0 · tidsstampel exit 0.
- `node --check` ×2 (prod-synk.mjs + sviten) · **tsc 0 FEL via
  projektbinären** (repets baslinje) · mimosa-paritet `^verktyg/` **GRÖN —
  0 ohärdade fynd** · import-vakten intakt (prod-synk.loggens sista rad
  oförändrad 02:41:53Z efter alla svitkörningar — sviternas modulimport
  väcker inte synken).
- INGET bygge, INGEN npm install (prod-synken äger installationen) ·
  R2 orört · data/blogg/ orörd · src/ orörd · syskonytor orörda.

## 4. OMGÅNG 3 LASTAD I KÖN (data/infra/patch-ko.json)

o73 §REST-bokningen inlöst: `react@19.3.0`, `react-dom@19.3.0`,
`@types/react@19.3.0`, `@types/react-dom@19.3.0` — alla fyra
registry-verifierade exakta versioner (npm view 2026-09-20), alla kända
paket i package.json (deps + devDeps), 4 ≤ tak 10 poster.

Kompatibilitetsbevis i trädet: next 16.3.5 peer `react ^19.0.0` ·
framer-motion 12 peer `^19.0.0` · react-day-picker peer `>=16.8.0` ·
react-dom kräver react i samversion (19.3.0 = 19.3.0) · installerad
@types/react-dom peer `@types/react ^19.2.0` (uppfylls av 19.3.0).

**LIVE-BEVIS sker automatiskt**: nästa :x7-rop med RAM-utrymme installerar +
tsc-kontrollerar + bygger + kvitterar. Bevaka `data/vakten/prod-synk.log`
+ `data/vakten/patch-kvitton.jsonl` + `node_modules/react/package.json`.
**Om TSC-GRINDEN stoppar omgången är det kuren som ARBETAR, inte fel**:
@types 19.3.0 gick inte hem mot baslinjen ⇒ misslyckat kvitto med
felräkning, prod förblir på 19.2.8, posten dör efter 3 försök.

## 5. VERIFIERAD ICKE-ANOMALI (protokollförd åt nästa vakt)

Kvarvarande `sharp@0.35.4` i köfilen trots ok-kvitto = **design, ej bug**:
`aktivPatchPlan` filtrerar ok-kvitterade poster ur planen (kön är deklarativ
historik), och loggen visare inga "PATCH-KÖ aktiv: sharp"-rader efter
17:32:04Z 09-18. Jagas ej igen.

## 6. KÖ / BOKNINGAR

1. `ignoreBuildErrors: true` är arv från före våg 133 — baslinjen 0 gör att
   flaggan KAN slås av i en framtida KODVÅG (byggbeteendeändring = eget
   beslut, aldrig patch-kön). Med flaggan av bär next build själv
   baslinjen; tsc-grinden blir då dubbelssäkring. Bokas, ej gjort här.
2. Periferin (next-intl 4.14.5 / supabase / react-query / react-hook-form /
   zod / tailwind-merge / puppeteer-core enligt o73 §2) = omgång 4 EFTER
   react-familjens kvitto.
3. Hälsorapportkörning efter kvitto (o73 §4-hygienen gäller).
