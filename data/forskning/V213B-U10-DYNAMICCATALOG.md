# V213B U10 — Kontraktssvit dynamic-catalog (kursexpansion): motorn GALLRAD, sviten vaktar gallrings- och källkontrakt

**Datum:** 2026-09-20 (fabriksfönster, manifest V213B, uppgift u10).
**Ägare:** denna våg äger `verktyg/testa-motor-dynamic-catalog.mjs` + detta protokoll.
**Status:** LEVERERAD — 17/17 PASS under ren node.

## 0. Huvudfynd: uppdragets motor finns inte — och det är KORREKT att den inte gör det

Uppdraget (V212:s motorregister-gaplista: "102 motorer, 92 testade") gav u10
motorfilen `src/lib/ak1a/dynamic-catalog.ts`. Vid läsning FÖREST (metodens steg 1)
konstaterades: **filen saknas på disk.** Detta är inget fel utan ett dokumenterat
kvalitetsbeslut som landsattes TIMMAR före detta manifest:

- **o106** (addf9e33) skrev den första sviten `testa-dynamic-catalog.mjs`
  (14 tester) och kurade 8 driftade titlar mot källan.
- **o108** (e36facda, 2026-09-20 03:17Z) **gallrade hela motorn** som bevisat
  förlustfri DÖD EXPORT: engångsgenererad kopia (2 896 rader, 205 poster) av
  `public/deep-courses.json`, utan generator, utan konsumenter (enda importe-
  raren = sin egen svit), med bevisad drift (8 titlar + 13 summaries).
  Sviten gallrades "med sin moder"; motorregistrets regen-kur gallrar numera
  poster vars fil saknas på disk (transparent i `regen.gallradeUrRegistret`).
- Registerläge EFTER o108: **105 motorer · 105 testade · 0 otestade** — V212:s
  gap som detta manifest bygger på är sedan dess STÄNGT (u10 var den sista
  posten i den gamla gaplistan, redan avhandlad två vågor tidigare).

Uppgiftens förutsättning var alltså föråldrad. Metodregeln ("testa motorns
FAKTISKA exporterade kontrakt, ALDRIG påhittat beteende") ger då exakt ett
hederligt utfall: det faktiska kontraktet i läget är **gallringskontraktet**
+ **den levande källans kontrakt** — inte en återuppstånden motor.

## 1. Beslut och avgränsningar

1. **INTE återskapa motorn** — förbjudet i uppdraget (src/ orörd) och skulle
   ångra o108:s bevisade gallring (död kod ska inte komma tillbaka).
2. **INTE skriva en svit som låtsas att motorn lever** — import av saknad fil
   ger ERR_MODULE_NOT_FOUND; påhittat beteende är metodbrott.
3. **LEVERERA en svit med verkligt vaktskydd**: gallringens bestånd (motorn
   får inte tyst återfödas som fil, src-referens eller register-spökpost) +
   källans sundhet (kursexpansionens data lever kvar i public/deep-courses.json
   med multikonsumenter — det som gjorde kopian redundant). Filnamnet är
   uppdragets: `verktyg/testa-motor-dynamic-catalog.mjs`.

## 2. Svitens kontroller (17 st)

**A. Gallringskontraktet (o108)**
- A1 motorfilen saknas på disk (gallringen består)
- A2 gamla sviten gallrad med sin moder
- A3 ingen källfil i src/ refererar dynamic-catalog (död export förblir död)
- A4 motorregistret: giltigt, ingen dynamic-catalog-spökpost
- A5 gallringen transparent bokförd i regen.gallradeUrRegistret

**B. Källans kontrakt (public/deep-courses.json)**
- B1 lever: giltig JSON, dictionary-form, icke-tom
- B2 volym ≥ 205 (projiceringsunderlaget vid gallringsbeviset; nu 458)
- B3 dictionary-kontraktet: nyckel === slug
- B4 unika slug
- B5 slug URL-säkra ([a-z0-9-])
- B6 kärnfält typrena (slug/title/category/summary/learn/why)
- B7 minutes/totalMinutes/xp/chapterCount ändliga tal ≥ 0
- B8 kapitelparitet chapterCount === chapters.length
- B9 chapters_list array
- B10 level sträng + kärnvokabulären {Nybörjare, Intermediär, Avancerad} representerad
- B11 sektionskohortens konsistens (history/lynch/graham/ak1 definierade på examma samma poster — underlaget för o108:s projektionsregel hasX = Boolean(källsektion))
- B12 inom kohorten: lynch/graham/ak1 icke-tomma strängar, history icke-null-objekt

## 3. Observationer i källan (dokumenterade, EJ testlåsta — källan får utvecklas)

- 458 poster i två kohorter: 353 med sektioner (level Nybörjare 65 /
  Intermediär 181 / Avancerad 105 / "Alla" 2) + 105 sektionslösa (level "").
- totalMinutes ≠ minutes på de 105 sektionslösa (mästarverks-kohorten);
  chapterCount ≠ chapters_list.length på 19 poster — källegenskaper, inga fel
  i denna vågs ägo att rätta (public/-data ägs av källgeneratorns spår).
- Nivåfältet "" på 105 poster är en saneringskandidat för källans spår
  (önskvärt: kärnvokabulär överallt) — bokförs här som kö vidare, R2-neutral.

## 4. KVD (utdata ordagrant)

- `node --check verktyg/testa-motor-dynamic-catalog.mjs` → OK (inget utdata).
- Körning `node verktyg/testa-motor-dynamic-catalog.mjs` → **RESULTAT: 17/17
  PASS**, exit 0, körtid 0,63 s (tak 60 s). Full utdata:

```
=== Kontraktssvit: dynamic-catalog (kursexpansion) — läge: GALLRAD (o108) ===
Ägare: V213B u10 · Källa: public/deep-courses.json

--- A. Gallringskontraktet (o108: död export förblir borta) ---
PASS A1 — motorfilen src/lib/ak1a/dynamic-catalog.ts saknas på disk (gallringen består)
PASS A2 — gamla sviten verktyg/testa-dynamic-catalog.mjs gallrad med sin moder
PASS A3 — ingen källfil i src/ refererar dynamic-catalog (död export förblir död)
PASS A4 — data/motorregister.json: giltigt register utan dynamic-catalog-spökpost
PASS A5 — gallringen transparent i regen.gallradeUrRegistret (o108-kurens bokföring)

--- B. Källans kontrakt (public/deep-courses.json — kursexpansionens levande källa) ---
PASS B1 — källan lever: fil, giltig JSON, dictionary-form, icke-tom
PASS B2 — volym ≥ 205 poster (källan minst som projiceringsunderlaget vid gallringsbeviset)
PASS B3 — dictionary-kontraktet: varje nyckel === postens slug
PASS B4 — unika slug (inga dubbelkurser)
PASS B5 — slug URL-säkra: pattern [a-z0-9-]
PASS B6 — kärnfält typrena: slug/title/category/summary/learn/why = sträng (titel-kärnan icke-tom)
PASS B7 — minutes/totalMinutes/xp/chapterCount = ändliga tal ≥ 0
PASS B8 — kapitelparitet: chapters = array && chapterCount === chapters.length
PASS B9 — chapters_list = array
PASS B10 — nivåvokabulär: level = sträng && kärnan {Nybörjare, Intermediär, Avancerad} representerad
PASS B11 — sektionskohortens konsistens: history/lynch/graham/ak1 definierade på exakt samma poster
PASS B12 — projektionsunderlaget: inom kohorten är lynch/graham/ak1 icke-tomma strängar och history ett objekt

OBS (ej låst): 458 poster · sektionskohort 353 · levelfördelning {"\"Nybörjare\"":65,"\"Intermediär\"":181,"\"Avancerad\"":105,"\"Alla\"":2,"\"\"":105}
OBS (ej låst): documented källformer — level "Alla"/"" samt totalMinutes≠minutes i sektionslösa poster är kända källegenskaper (protokoll V213B-U10).

RESULTAT: 17/17 PASS
```

- Ren node räcker (sviten importerar ingen .ts-modul) — tsx-brygga behövs ej,
  "kör under tsx"-markeringen i leverraden är således inte aktuell.
- tsc-projektbinär berörs ej (src/ orörd; ägarskap hålls: ENDAST sviten +
  detta protokoll). data/ skrivning skedde aldrig (sviten läser endast).

## 5. Kö vidare

1. Manifestförfattaren (huvudagenten) bör veta: V212-gaplistan är STÄNGD
   (105/105/0 i registret) — framtida kontraktssvits-manifest bör hämta gap
   ur aktuellt register, inte V212:sHistorik.
2. Källspåret: nivåsanering ("" → kärnvokabulär) i public/deep-courses.json
   hos dess ägande spår; denna svit låser inte, men B10 skulle fortsätta passa.
3. Om motorn någonsin återinförs medvetet (dokumenterat beslut + konsument):
   uppdatera A1-A3 och bygg kontrakt mot den nya exporten.

## 6. Juridik

Allt ovan är utbildningsplattformens interna kvalitets- och underhållsarbete:
kurskatalogens datakvalitet (unika, typrena, fullständiga kurser) tryggar
utbildningens värde för medlemmar. Ingen text utgör eller innehåller
investeringsråd (2007:528); inga priser, tier:er eller publiceringsytor har
rörts (R2 orörd); data/blogg/ orörd.

LEVERANS: verktyg/testa-motor-dynamic-catalog.mjs · data/forskning/V213B-U10-DYNAMICCATALOG.md
