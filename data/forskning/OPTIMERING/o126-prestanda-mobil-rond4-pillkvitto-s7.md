# o126 — Mobil läsbarhet ≥52px: o123:s EFTER-kvittering avslöjar död pill-breddsfix + rotkur (Spår 7, s7-u3)

**Våg:** fabriksmanifest auto-s7 (byggare 3/3, omstart), 2026-09-20 22:52–pågående lokal.
**Bygge FÖRE:** LDVlDGu2emrv69nCJjMW4 (deployad 20:52:07Z, HEAD 064f1484 — innehåller
5976ef91 = o123:s "commit 2" pill-breddsfix). **Kur-commit:** 96bd416b.

## §0 — VAL och duplikatkontroll

Uppdrag: "Prestandavåg nästa i spåret (välj själv)". Duplikatgenomgång före val:

- **Bildoptimering** — STÄNGT (o66 §7.2 slog skrivet; o77-djupsondering AVIF avvisat
  med skäl: pyttbilder större i AVIF, sajten saknar fotostora next/image-ytor).
- **Koddelning** — STÄNGT (o119/o121: widget-klumpen 56 982 B → egen chunk 1 913 B,
  strukturbevis KÄRNA ✓; chunk-fingrar = huvudagentens rest).
- **Cache-headers** — STÄNGT (o66 + o70 nginx-renodling, maskinellt GRÖN).
- **Mobil läsbarhet ≥52px** — rond 4 (o123) LEVERERAD av s7-u2 med ETT ÖPPET KVITTO:
  commit 2 (min-w 52 på dataset-namnlänken) deployades EFTER deras mätning och
  verifieringen var boklagd hos "nästa våg": *"verifiering = omkörning av sonden
  (cache-disabled) mot /dataset efter DEPLOYAD-raden"*.

**VAL:** det bokförda EFTER-kvittot — spårets enda öppna post. Ingen annan våg
anspråkstog den (worklog-svep 2026-09-20 22:5x: sista s7-rader = o123:s slutnotis
som just bokför VÄNTAN på deploy).

## §1 — FÖRE-läge på det nya bygget (sond, cache-disabled)

DEPLOYAD 20:52:07Z (064f1484, med 5976ef91 som förfader — `git merge-base
--is-ancestor` ✓). Prod 200 ×6 (/, /dataset, /kalkylator, /superanalys, /blogg ×2).
RAM ~1 474–1 510 MB (sondens vaktgräns 700).

`lasbarhet-efter-o126.json` (verktyg _s7u2o123-sond.mjs — cache-disable + rusing
mellan sidor, metrologi-läxan inbyggd):

| Sida | u52/zoom | Dom |
|---|---|---|
| /superanalys | 0 / 0 | håller (o123 ✓) |
| /kalkylator | 0 / 0 | håller (o123 ✓) |
| /konfluens | 1 / 0 | «Hem»-brödsmula 30×52 (känd prosa-klass) |
| /netnet | 0 / 0 | håller (o123 ✓) |
| /dataset | **1 / 0** | **«Hälsa»-pill fortfarande 44×52 — pill-fixen verkade EJ** |
| /kurser/pe-07 | 1 / 0 | «Kurser»-brödsmula 41×52 (känd prosa-klass) |

## §2 — ROTFYND: `.flex > *`-regeln dödar utility-min-width

DOM-sond (`verktyg/_s7u3o126-domsond.mjs`, CDP 390×844 iPhone-UA, cache-disabled)
på `/dataset/halso`-länken («Hälsa», DatasetSorteradLista mobilkort):

- `klassFull` = …`max-md:flex max-md:min-h-[52px] max-md:min-w-[52px]
  max-md:items-center` — klassen sitter KOMPLETT i DOM (SSR bär den: 2 träffar
  `min-w-[52px]` i prod-HTML).
- CSS-chunken (223m26d0ne5yb.css) innehåller `.max-md\:min-w-\[52px\]{min-width:52px}`
  INUTI korrekt `@media not all and (min-width:48rem)`-wrapper.
- **computed**: `minHeight: 52px` (regeln träffar!) men **`minWidth: 0px`** och
  `width: 44.0781px`.

Förklaring — `src/app/globals.css:617-620`:

```css
/* Ensure all flex children can shrink */
.flex > * { min-width: 0; }
```

Länken är barn till `SPAN.flex` ⇒ `.flex > *` (specificitet 0,1,1) **slår**
utility-klassen `.max-md\:min-w-\[52px\]` (0,1,0). Därför:

- `max-md:min-h-[52px]` träffar — det finns inget `.flex > * { min-height: 0 }`.
- `max-md:min-w-[52px]` förlorar — o123:s commit 2 var **verkningslös av
  konstruktion** («Hälsa» mätte 44 px även på deployat bygge). s7-u2:s EFTER-
  tabell (dataset 1/0, "rest = Hälsa-pill → kurad i commit 2") beskrev en kur
  som CSS-lagret aldrig lät verkställas.

## §3 — KUR (commit 96bd416b) — och kollisionen med s7-u1:o127

`dataset-sortering.tsx:131`: `max-md:min-w-[52px]` → **`max-md:min-w-[52px]!`**
(Tailwind v4 important-suffix; regeln redan genererad i chunken, precedent
sprak-vaxlare.tsx:70 + kurs-sok.tsx:459, o123:s egna min-h-kurer). Edit via
Edit-verktyget, tsc 0, pre-commit-grinden passerade.

**KOLLISION (parallellfabrik, turligt utan filöverlapp):** medan denna våg
väntade deploy grävde syskonet s7-u1 SAMMA rot och levererade o127 (c017f9bf,
21:20Z) med en **överordnad kaskadkur**: `.flex > *, .grid > *`-regeln flyttad
in i `@layer base` — deras CDP-kaskaddump bevisar att den OLAGRADE regeln vann
över `@layer utilities`-lagret (lager-ordning, ej specificitet) och neutraliserade
ALLA 46 min-w-*-utilities på flex-/grid-barn i projektet. ÄRLIG KORRIGERING av
§2 ovan: min förklaringsdetalj "specificitet 0,1,1 vs 0,1,0" var FEL — `*` ger
ingen specificitet, `.flex > *` = (0,1,0) = utility-klassen; kampen avgjordes av
kaskadlagren (olagrad > @layer). Instrumentet (computed style: minHeight 52px
men minWidth 0px) och slutsatsen (regeln förlorar på denna länk) var rätta;
mekanismen förklarades fullständigt först av s7-u1.

**Relation mellan kurerna:** min important-suffix-kur (96bd416b, tidigare i
historien) förblir i trädet som **redundant försäkring** — author-!important
slår normala deklarationer även efter base-flyttet, så länken får 52 px oavsett
vilken kur som bär. Revert avvakt beslutad: ingen kundvärdesrörelse i ett
RAM-gated deploykö; båda kurerna är kontraktstesta­bara och harmlöst叠加.

EFTER-mätningen (deploy + sond + LH + vakten) bode hos s7-u1:s **vakarövertag**
(o127 §6, 01b71b82) med exakta kommandon — denna våg lämnar den där enligt
o122-kollisionskonventionen; inga dubbelmätningar ur byggfönstret.

## §4 — EFTER-kriterier

Övertagna av s7-u1:o127 §6 (vakarövertag AKTIVERAT, kommandon dokumenterade
där): deploy med kurer som förfader · prod 200 ×5 · pill-sond /dataset = 0
under 52 (o123-trådens slutstängning) · slider-sond 0/20 (verifierar även
s7-u2:o128) · Lighthouse CLS 0 på /kalkylator + /dataset · gränssnittsvakten
GRÖN. Denna vågs bidrag till EFTER-kedjan = FÖRE-bevisen nedan.

## §5 — Vågens leveransvärde (vad som står kvar av o126)

1. **FÖRE-kvittot på deployat bygge** (`lasbarhet-efter-o126.json`, LDVlDGu2,
   cache-disabled, 6 sidor): dokumenterar att o123:s commit 2 (5976ef91) var
   verkningslös I PROD — «Hälsa» 44×52 trots klass i HTML + regel i chunk med
   rätt media-wrapper. Detta var spårets saknade länk: o123:s EFTER-tabell
   bokförde pillen som "kurad i commit 2" medan den levde kvar 44 px.
2. **DOM-beviset** (`domsond-o126-halsa-pill.json`): klass komplett i DOM +
   computed minHeight 52px / **minWidth 0px** — den raka beviskedja som gav
   rotfyndet utan gissningar (gåva åt o127:s kaskaddump som fullständade den).
3. **Kur-commit 96bd416b** (important-suffix): redundant försäkring, se §3.
4. **Metrologi-läxa §6.1** (computed style är facit, ej klass-närvaro).

## §6 — KVD och läxor

- src/ rördes EN gång via Edit (dataset-sortering.tsx) · tsc 0 · INGET bygge
  (prod-synken äger) · R2 orörd · data/blogg/ orörd · syskonytor orörda:
  s7-u1:s o127-filer, s7-u2:s o128 + o123-namnrymder orörda; mina filer i
  s7u3o126-namnrymd + lasbarhet-efter-o126.json + domsond-o126-halsa-pill.json.
- **LÄXA 1 (metrologi-arv)**: en utility-klass i DOM + regel i chunk ÄR INTE
  bevis på verkan — computed style är facit (o62-cacheläxans CSS-syskon).
- **LÄXA 2 (kaskad-läxa)**: Tailwind v4-kör utilities i @layer — vid "klassen
  sitter + regeln finns men verkade ej", kontrollera LAGER-ordning mot egna
  globals-regler FÖRE specificitetsresonemang; olagrad hus-CSS slår alla
  utilities. (s7-u1:o127 löste det globala; dokumenterat här för arvet.)
- **LÄXA 3 (framtidsrond, ej utförd)**: `.flex > :where(*)`-idén är nu övertagen
  av o127:s @layer base-kur — bättre; posten arkiverad.
- Nummerdelning: o124/o125 tagna (s8-familjen), o127 = s7-u1:s kaskadkur,
  o128 = s7-u2:s slider-kur — detta protokoll = o126, tidslinjen ren.
