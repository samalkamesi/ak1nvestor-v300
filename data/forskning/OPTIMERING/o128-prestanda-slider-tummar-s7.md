# O128 — Slider-tummar 16→52 px: den bokade separata vågen (Spår 7, s7-u2)

Datum: 2026-09-20 21:0x– pågående lokal · Reservation: o128 (verktyget,
ägare s7-u2, källor 127) · Anspråk disk-först 21:03:30Z
(`data/vakten/auto-s7-1789937943-u2-ansprak.md`, katalogen gitignorerad).

## Varför detta objekt (val-redogörelse)

o123 §"Medvetet kvar" post 1 bokade uttryckligen: "Global ui/slider.tsx-
ändring = stor sprängrad — separat våg med eget EFTER-mätprotokoll
(verktyget behöver tabbklick-läge först)". Duplikatkontroll: worklog har
ingen slider-leverans; OPTIMERING/ har inga *slider*-filer utför o123:s
notis. Spårets övriga poster levererade (bild/cache o8 §4, koddelning
o119/o121, rond 4-fixarna o123) eller medvetna undantag (brödsmule-bredd,
prosa-adjacent WCAG-spår). Syskonet s7-u3:o126 tog pill-breddsfixens
EFTER — ingen kollision (deras fil: dataset-sortering.tsx).

## ROTBEVIS — tre oberoende vägar (mot prod, 2026-09-20 ~21:05Z)

1. **KÄLLBEVIS** (`node_modules/@radix-ui/react-slider@1.4.7/dist/index.mjs`):
   Thumb renderas som `Primitive.span` med `role="slider"` — INTE button
   (äldre Radix-used button; 1.4.x har span). Inga storleks-inline-stilar
   på tummen (endast transform/position på den yttre wrappern) ⇒ storleken
   är HELT CSS-styrd.
2. **CSS-ISOLERAT MÄTBEVIS** (`verktyg/_s7u2o128-bevis.mjs`, prodens
   stilmallar, viewport 390×844): span med tummens EXAKTA klasssträng =
   **16×16 px, min-height/min-width = 0** — medan samma klasser på ett
   button-element = **52×52** (golvet globals.css:553 `@media (max-width:
   640px){button{min-height:52px;min-width:52px}}`). Slutsats: golvet når
   ALDRIG tummen ⇒ **16×16 px tryckyta på riktiga mobilvyer** — 36 px
   under husstandarden (våg 93 C3). o123:s antagande bevisat.
3. **METODBEVIS** (varför ingen sett det): kanoniska
   mobil-lasbarhet.mjs-selektorn saknar `[role='slider']` OCH Radix
   unmountar inaktiva flikar ⇒ tummarna osedda av alla rundmätningar.
   Flikklicks-sond (`_s7u2o128-slider-sond.mjs`) + hydratiseringsprobe:
   React-hydratisering fungerar på prod (aria-pressed-växlaren togglas
   bevisat), men flik-activation via syntetiska events förblev ostabil i
   headless (både DOM-click och CDP-musklick lämnade data-state inactive)
   — därav CSS-isolerade vägen som deterministisk FÖRE-siffra.

Rådata: `slider-tummar-fore-o128.json` (tredelat bevis) +
`slider-tummar-fore-sond-o128.json` (flikklicks-sond).

## KUREN (commit 54c95abd, src/components/ui/slider.tsx, ENDAST Write/Edit)

Mönster: o123:s shortseller-× ("visuell cirkel i span, knappen ren
tryckyta") applicerat på Radix-tummen:

- **Tum-spannen** får `max-md:flex max-md:size-[52px] max-md:items-center
  max-md:justify-center max-md:rounded-none max-md:border-transparent
  max-md:bg-transparent max-md:shadow-none` — ren 52×52-tryckyta på mobil
  (≤767 px), boxen själv osynlig.
- **Barn-span** `hidden max-md:block size-4 rounded-full border
  border-primary bg-background shadow-sm` — visuell 16 px-cirkel med
  tummens exakta gamla visuella klasser, endast mobil. Desktop ≥768:
  tummen är fortfarande den visuella 16 px-cirkeln (barnet hidden) —
  **desktop utseende identiskt med före**.
- **Explicit `size-[52px]`** (inte min-): immunitet bevisad mot
  s7-u3:o126:s specificitetsfynd `.flex > * {min-width: 0}`
  (globals.css:618) — den regeln sätter min-width, size sätter width;
  dessutom är tummens förälder Radix position:absolute-wrapper, inte
  .flex-barn. `shrink-0` (grundklasserna) skyddar mot flex-krympning i
  Root.
- Radix mäter tumstorleken runtime (useSize) ⇒ thumbInBoundsOffset
  anpassas automatiskt — inga positionsjusteringar.
- TÄCKTA YTOR via global komponent: kalkylator flik manuellt (5+
  poängsliders) + akm2 (modulvikter + täckning), client-portal
  kassaposition (startsidans lazy-sektion); portfolio-builder importeras
  ej idag men täcks mekaniskt vid ev. framtida bruk.

**Layout/CLS-analys**: tummens 36 px höjdtillväxt sker ENDAST i
användaraktiverade tillstånd (omonterade flikar / lazy-sektion efter
scroll) ⇒ "hadRecentInput"-undantaget gör CLS-påverkan 0 i praktiken;
Lighthouse (ingen interaktion) ser aldrig monterade sliders. CLS mäts ändå
i EFTER-ronden (o100:s heliga noll).

## KVD (FÖRE-deploy)

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**.
- Kontrakt `verktyg/_s7u2o128-kontrakt.mjs` **12 PASS 0 FAIL** (mönster,
  desktop-intakthet, golvet orört, endast slider.tsx i src-diff, Radix-
  span-rotbevis kontrakterat).
- INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
  globals.css orört · syskonytor orörda.

## Sidofynd (bokförs, ej denna vågs yta)

- 404 på `/ak1a/logo/ikon-192.png` (konsolfel vid /kalkylator-load) —
  logotyp-ikon saknas i public-trädet; köpost till evighetskatalogens
  kvalitetsspår.

## EFTER-facit

**SLUTSTÄNGT 2026-09-21 (bokföringsstängning av s7-u2:o144) — kvitterat
av syskonet s7-u1:o137 §3 på äkta deployat träd:**

- DEPLOYAD 02:12:24Z **d401d719** med `git merge-base --is-ancestor
  54c95abd d401d719` SANT (o137 §1:s deploybevis, kanal giltig).
- Slider-sond (flikklick "Poängsätt manuellt" — Radix-unmountade tummar
  mäts): tummar under 52 px **20/20 → 0/20**; tumbox **16×16 → 52×52,
  font 16** (o137-slider-efter.json). GRÖN — size-52-paketet verksamt.
- Protokoll §"Layout/CLS-analys"-prognosen höll: LH /dataset CLS 0 i
  o137 §4 (tummens 36 px höjdtillväxt syntes aldrig i mätlaster).
- `_s7u2o128-efter.mjs` behövs EJ — o137:s `_s7u1o127-slidersond.mjs`
  levererade mätningen (vakarövertaget enligt o130 §2-kedjan).
