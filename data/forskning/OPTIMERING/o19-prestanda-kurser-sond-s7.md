# O19 — Prestanda: /kurser Style & Layout-sond + skelettkur (spår 7, 2026-09-16)

**Ägare:** fabriksagent s7-u3 (auto-s7-1789524905980) · **Status: sond LEVERERAD,
kod committad — Lighthouse EFTER bokas när prod-synken byggt (se §6)**

Uppdraget kör u1:s bokade sondobjekt (o18 §4.2: "/kurser Style & Layout
1 663 ms vid ~1 000 DOM-noder — ovanligt; rot ogrävd"). Sonden är kod-yta,
ej R2 — o18 §4.1:s kakpanelsfynd (R2-nära) är orört och kvar hos huvudagenten.

## 1. FÖRE-läge (u1:s mätning fore-161 + denna vågs sonder)

Lighthouse mobil: /kurser P55 · TBT 1 253 · **S&L 1 663 ms** (start 789,
blogg 721, bibliotek 1 607) — 2,2× syskonsidorna vid ~1,5× DOM-storlek.
CDP-sonder (390×844, CPU 4×, cacheDisabled, 15 s fönster): /kurser
UpdateLayoutTree n=125–199 + Layout n=90–123, största enskilda händelser
fullträds (dirty 1 314–1 422 objekt): Layout 460/351/211 ms,
UpdateLayoutTree 326/242 ms. /blogg: 14 recalcs. /bibliotek: 12 recalcs
(kostnaden i få STORA recalcs — u1:s CV-vågs domän, inte denna sonds).

## 2. Metod

1. `verktyg/prestanda-sond-sl.mjs` (ärvd ospårad från ett dött tidigare
   försök på denna uppgift) — **lagad**: Chrome 153 levererar trace-chunkar
   i `params.value`, verktyget läste `params.chunk` ⇒ 0 event. Fyx
   `params.chunk ?? params.value`; verktyget committas med denna våg.
2. Riktade CDP-prober: FunctionCall-fördelning per skript-URL korrelerad
   mot stora S&L-händelser; nätverksräkning av `/api/kurs/*`;
   `document.getAnimations()`-inventering; MutationObserver (1 754 poster)
   via `Page.addScriptToEvaluateOnNewDocument`.
3. **Kausalt A/B/C/D** — samma last med injicerad CSS före skript:
   A = bas (×2), B = `.animate-pulse{animation:none}`, C = B + alla
   transitions av, D = 529-familjen emasculerad (`.flex > *`/`.grid > *`
   min-width:auto, `[class*="Badge"]` avkapad).

## 3. Fynd

### 3.1 Huvudförbrukare: hydratiseringen av KursSoks klientträd (STRUKTURELLT)

- FunctionCall-tid: React DOM-chunk 1 833 ms / **849 anrop** + KurSok-sidans
  chunk 157 ms / 160 anrop — många små commits som var och en dirtar
  style/layout över det 1 357-noder stora trädet.
- MutationObserver: 1 754 mutationer, nästan alla 0–1,1 s (hydratisering),
  enstaka 7/11 s, **inget löpande** — ingen JS-loop/-ticking.
- **A/B/C/D: alla varianter 2,2–2,9 s S&L — skillnaderna ligger inom
  körningsvarians (±15 %).** Slutsats: u1:s misstanke på globals.css:529-
  familjen är **motbevisad på CSS-nivå** — väljarna är dyra per recalc men
  de orsakar inte ANTALET recalcs. Strukturell kur (serverrenderat register
  / färre klientnoder i trädet) är produktrefaktor ⇒ **bokas till
  huvudagent/styrelse**, ej barnkirurgi.

### 3.2 Rekt fel (KURRAD i denna våg): 24 oändliga skellett-animationer

Sond-bevis: vid last avfyras **noll** `/api/kurs/*` (IntersectionObserver:n
med rootMargin 400 px når aldrig registret som ligger under hero + utvalda
sektioner på mobil), men **24 `animate-pulse`-skellett kör för alltid**
(= `document.getAnimations()` 29 st efter 16 s; 24 = registrets kort).
Varje besökare som inte scrollar betalar CSS-animationsframes ≈ style-recalc
+ batteri i minuter för innehåll under vecket — o1 #10-andan (evig
bakgrundsaktivitet). Lighthouse-andelen modest (B-varianten −17 %, inom
varians — headless utan GPU drosslar redan offscreen-animationer; riktiga
enheter betalar mer), men fel är fel: **animation utan sluttillstånd för
innehåll som kanske aldrig hämtas**.

## 4. Kur (committad): `laddar`-state i RegisterKort

`src/components/ak1a/kurs-sok.tsx`: skellett-spanen får `animate-pulse`
ENDAST när hämtningen pågår (`laddar` sätts när IO avfyrar `starta()`,
 innan `fetch`). Statiskt skellett (samma höjdreserv `h-[3.25rem]`,
sama färg) tills dess; pulsen blir synbar feedback precis när den betyder
något. `detalj`/`misslyckades`-logiken orörd; speglar (en/ar) får kuren
automatiskt (samma komponent). tsc 0 (projektbinär).

## 5. Avstått med skäl

- Chatt-chunken (55 kB): spår 6:s testfiler binder importer (o17 §AVSTÅTT).
- Header-logotypens prefetch av /-rutten (laddar marknadsförings-chunkarna
  0c76zm 41 KiB + 3roxjn2 23 KiB på alla undersidor): u2:s medvetna val
  ("primära mål behåller prefetch") — produktprioritering, inte duplikat.
- Fonter (3:e filen upptäcks 1 380 ms): styrelsebeslut v96 D1 (preload:false
  för kursiv+mono) — typografi.ts låst av kommentar.
- /blogg LCP 6 183 ms: LCP-elementet är SSR-text med element-render-delay
  2 201 ms = samma huvudtrådsblockering som 3.1 + kakpanelens sena render —
  båda bokade (3.1 här, kakpanel hos huvudagenten).

## 6. METOD för EFTER (när prod-synken byggt batchen)

1. `node verktyg/prestanda-lighthouse.mjs r4b-efter / /kurser /blogg`
   (LH_JAMFOR=r4-fore) — /kurser S&L+TBT är primärt; prefekten: S&L oförändrad
   ± varians (kuren är battery/INP-klassad), TBT/`animate-pulse`-antalet = 0
   vid last (CDP-sond `document.getAnimations().length` före scroll ≈ 5, ej 29).
2. Funktionssonder: (a) skellett synligt statiskt vid last (getComputedStyle
   animationName = none), (b) efter scroll triggar IO hämtning + pulsen
   visas under hämtningen, (c) text ersätter skellett.
3. `curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/` = 200.
4. Gränsnittsvakten mot localhost (ren klass-flipp, inga färger/mått ändras).

## 7. Rådata

`sond-kurser-sl-2026-09-16.json` (A/B/C/D-körningar, mutationshistogram,
IO/animation-inventering, FunctionCall-fördelning, största händelser).
