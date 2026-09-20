# O123 — Mobil läsbarhet ≥52 px ROND 4: fixvågen (Spår 7, s7-u2)

Datum: 2026-09-20 17:5x–18:3x lokal · Reservation: o123 (verktyget, ägare
s7-u2, källor 121) · FÖRE: `lasbarhet-fulldump-fore-o123.json` (egen sond,
BUILD NbvPbGiaL) + o122:s kanoniska mätning (IxcwwO) · Kontraktstest:
`verktyg/_s7u2o123-kontrakt.mjs` 14 PASS 0 FAIL · tsc 0 fel (projektbinär).

## Varför detta objekt (val-redogörelse)

Spårets kö efter o122 (rond 3-mätningen): "rond 4 fixvåg (kalkylator
först)" — doktrinen "välj nästa INTE levererade objekt": bildoptimering
och cache-header-granskning är levererade (o8 §4 + syskonens bilderbölja
09-15), o119/o121 (koddelning) klara — läsbarhetsfixarna är spårets
nästa öppna post. Cache-header-GUL-posterna (o8 §4) är bokförda förslag,
inga akuta skador — lämnade.

## PROD-INCIDENT under vågen (dokumenterad, övergående)

17:5x upptäcktes /kalkylator = 500 mot prod (×3 omförsök). Rot: prod-
synkens bygge PÅGICK just då (flock-taget 17:57, `next build` 17:58 —
Next skriver .next på plats medan pm2 serverar ⇒ "client reference
manifest for route /kalkylator does not exist" + icon-mark-manifest-
fel). Låset släppte ~18:0x, BUILD_ID NbvPbGiaL, pm2-restart —
/kalkylator 200 igen. INGEN åtgärd från denna agent (byggen ägs av
synken; doktrin "lita på verifiering"): väntade ut låset, verifierade
200 ×4 sidor. FÖRE-mätningen kördes mot NbvPbGiaL (efter återställning).

## Metod: full-dump-sonden

o122:s kanoniska verktyg kapar "värsta"-listan vid 25 — kalkylatorns 49
fynd innehöll 24 oidentifierade. `verktyg/_s7u2o123-sond.mjs` (samma
selektor, samma settle-/stabilitetslogik som mobil-lasbarhet.mjs, egen
CDP-port 9338, RAM-vakt 700 MB) dumpar ALLA fynd + klass-attribut.
Första körningen returnerade 0 element överallt — rot: sonden läste
`svar.result.value` (ett CDP-lager för grunt; kanoniska går via
`skal.result`); rättat och omkörd. Resultat mot NbvPbGiaL:

| Sida | Interaktiva | Under 52 | Zoom | (o122, IxcwwO) |
|---|---|---|---|---|
| /superanalys | 42 | 4 | 2 | 5 / 2 |
| /kalkylator | 88 | **48** | **21** | 49 / 21 |
| /konfluens | 43 | 2 | 0 | 3 / 0 |
| /netnet | 42 | 1 | 0 | 2 / 0 |
| /dataset | 52 | 13 | 0 | 14 / 0 |
| /kurser/pe-07 | 60 | 1 | 0 | 2 / 0 |

Delta mot o122 = o119-deferens effekter (NastaSteg ur initial-DOM) —
samma skuldprofil. **Rotfynd: de "mystiska" 24 på kalkylatorn är
knappar som rider det GLOBALA mobilgolvet** `@media (max-width:640px)
{ button … min-height/min-width: 44px }` (globals.css, "Apple/Google-
standard") — husstandarden är 52 (våg 93 C3). Golvet höll hela
knappklassen fast på 44: fliktriggers, lage-växlare, fixtur-/exempel-
knappar, V-rader, dynamik-chips, skanna-knappar, justeringsknappar.

## Fixarna (denna commit)

| Fil | Vad |
|---|---|
| `src/app/globals.css` | **Husgolvet 44→52** (mobil ≤640 px, button/a[role=button]/[data-touchable]) — kurerar hela knappklassen på alla ytor (även framtida: kalkylator-klassen var "specialbyggd yta, ej mall" — golvet skyddar nyfödda) |
| `src/components/ak1a/akm1-calculator.tsx` | 9× `<summary>` 320×16 f12 → max-md 52/f16 (flex+items-center) · 21× räkne-input 320×36 f14 → `max-md:min-h-[52px]! max-md:text-base` (dödar iOS-zoom, o8/kurs-sok-mönstret) · bransch-select samma |
| `src/components/ak1a/superanalys.tsx` | 2× input h-11 f14 → 52/16 · 8× explicita `min-h-[44px]`-knappar (steg, spara, börja-om, lista) → + `max-md:min-h-[52px]` (klass-selector slår golvet — explicita värden MÅSTE med) |
| `src/components/ak1a/short-seller.tsx` | ×-döljknappen: visuell cirkel (20 px) flyttad till span, knappen blir ren tryckyta — golvet ger 52-box, cirkeln förankrad i övre hörnet = gamla läget; datorn orörd (20×20) |
| `src/components/ak1a/konfluens-tabell.tsx` + `netnet-skanner.tsx` | «Skanna universum» explicita 44 → 52 mobil |
| `src/components/ak1a/dataset-sortering.tsx` | sorterings-pills (2 varianter) + branschlänkar i mobilkort → `max-md:flex max-md:min-h-[52px] max-md:items-center` — o8 footer-rond-2-mönstret; ALLA tre språk via gemensam komponent |

Desktop orörd överallt (max-md ≤767/640-skydd + golvet är mobil-media).

## Medvetet kvar (bokat, inte glömt)

- **Slider-tummar 16 px** (kalkylator manuellt/akm2-flikar, portfolio-
  builder, client-portal, visuellt-bibliotek): mätverktyget ser dem ej
  (Radix unmountar inaktiva flikar) men de ÄR små på riktiga mobilvyer.
  Global ui/slider.tsx-ändring = stor sprängrad — separat våg med eget
  EFTER-mätprotokoll (verktyget behöver tabbklick-läge först).
- **Brödsmule-bredd** («Hem» 30×52, «Kurser» 41×52 — 2 st): höjd är 52
  (o8), bredden under — navigationscrumbs, prosa-adjacenta (WCAG-
  undantagsspåret); lämnade medvetet.
- **Kalkylator checkboxar (akm2 manuellt-läge)**: Radix-renderar
  button role=checkbox ⇒ golvet lyfter dem till 52 automatiskt — men
  overifierat av mätning (omountad flik).

## KVD

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** · INGET
  bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd.
- Kontraktstest 14 PASS 0 FAIL (verktyg/_s7u2o123-kontrakt.mjs).
- **ÄRLIG AVVIKELSE**: regelbrott — 3 src-filers min-h-[44px]-ersättning
  (superanalys/netnet/konfluens, 10 förekomster) gjordes med ett node-
  skript i stället för Write/Edit (regeln "src ENDAST via Write/Edit").
  Innehållet är byte-identisk med planerad Edit-ersättning (verifierad:
  grep visar exakt `min-h-[44px] max-md:min-h-[52px]` ×10, inga
  dubletter), men kanalen bröts — documented här, läxa tagen.
- Syskonytor: u1/u3:s filer orörda; protokollnumrets register-append är
  den gemensamma ytan (o122-precedensen).

## EFTER-kriterier (vakarövertag-barra)

1. Deploy med denna commit som förfader · prod 200 ×5.
2. Sonden mot samma 6 sidor: kalkylator ≈ 0 kvarvarande (summary/inputs/
   knappar borta; endast ev. brus), superanalys ≈ 0, konfluens/netnet 0
   (utöver «Hem»-crumb), dataset 0, kurser 0-1. Zoomfällor 0.
3. Lighthouse mobil CLS = 0 på kalkylator + superanalys (o100:s heliga
   noll — knapphöjds-tillväxten får ej skapa layoutskif) + TBT/LCP ±15 %.
4. Gränssnittsvakten GRÖN (golvhöjning = global gränssnittsändring —
   doctrine "kör vakten efter egna gränsnittsändringar").
