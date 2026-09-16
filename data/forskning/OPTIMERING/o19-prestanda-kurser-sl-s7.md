# O19 — Prestanda: /kurser Style & Layout-rot + content-visibility-kur (spår 7, 2026-09-16)

Fabriksagent s7-u4 (batch auto-s7-1789524905980, fjärde vågen i fönstret).
Uppdrag: "Prestandavåg nästa i spåret (välj själv)". **Status: FÖRE + rot
bevisad, kod committad, EFTER (Lighthouse) bokförs när prod-synken byggt** —
samma ärliga bokföring som o16/o17/o18 (VÄNTAR-RAM-kön stod redan tre
commits djup vid min start).

## 1. Urval och duplikatkontroll

Spårets kö efter o16/o17/o18: brotli (huvudagent/infra), språkresolvens-CLS
(produktbeslut), dölj-undantaget (kundens estetikval), kakpanel-LCP
(R2-nära, o18 §4.1 — huvudagent), chatt-chunken (spår 6:s testdesign).
KVAR barnägt: **o18 §4.2 — /kurser Style & Layout 1 663 ms vid ~1 000
noder, "bokat som sondobjekt, rot ogrävd"**. Detta är den vågen: sond +
rot + kur. Kollisionskontroll: o18 ägs av u1 (orörd), deras globals.css-
regel `.cv-kort` lästes men modifierades ej — mina regler läggs EFTER deras
block; u2:s cookie-consent/footer orörda; u3:s studio-filer orörda.
Anspråksfil: data/vakten/s7-1789524905980-u4-ansprak.md (gitignorad).

## 2. Verktyg: prestanda-sond-sl.mjs (NY, trackad)

DevTools-trace-sond under Lighthouse-liknande villkor (mobil 390×844, kall
cache via färsk profil) som bryter ner UpdateLayoutTree (style recalc) +
Layout per event: antal, dur, dirtyObjects/elementCount (args.beginData),
tidspunkt och intervallnästlad utlösare. **Tre protokollfynd (Chrome 153,
2026-09-16), dokumenterade i verktyget:** (1) `Tracing.dataCollected`
levererar arrayen i fältet `value`, inte `chunk` (fladdrande leverans
förklarades); (2) tracing på page-sessionen kräver `-*,devtools.timeline`
— browser-endpointen ger 0 events; kategorin
`disabled-by-default-devtools.timeline.stack` döder ALL tracing här; (3)
aktiva Network-/Emulation-domäner på targetet (även via annan session)
gör att tracingComplete levereras UTAN data-chunks ⇒ CPU-throttle 4× är
otillgängligt i kombination: sondtalen är OTHROTTLADE (Lighthouse-mobilens
S&L ≈ 4× dessa — proportionaliteten verifierad: 594 oth × ~2,8 ≈ 1 663).

## 3. FÖRE (localhost = 9b01c0d4-bygget, u1:s rådata + egna sonder)

Lighthouse mobil (u1:s fore-161): /kurser P55 · LCP 5 474 ms · **TBT 1 253
ms** · main-thread S&L **1 663 ms**. Egen sond (othrottat):

| Sida | S&L-summa | Layout-events | största Layout | dirtyObjects |
|---|---|---|---|---|
| /kurser | **594 ms** | **128** | **241 ms** | 1 348/1 348 (hela dok, layoutRoot #document) |
| /en/kurser | 395 ms | 17 | 250 ms | — (samma monster UTAN utvalda sektioner) |
| /ar/kurser | 181 ms | 19 | 94 ms | — (arabisk text billigare att mäta) |
| / (ref) | 286 ms | 91 | 109 ms | 573 |
| /blogg (ref) | 215 ms | 8 | 117 ms | 1 494 |
| /bibliotek (ref) | 219 ms | 7 | 156 ms | 5 084 — 0,031 ms/objekt vs /kurser 0,13 |

## 4. Roten (bevisad med isolerings-AB på räddad SSR-HTML, se §5)

Tre lager, alla /kurser-specifika eller där förstärkta:

1. **Registrets kort är linjärt layout-dyra**: 24 kort ≈ 70–140 ms
   othrottat av den initiala layouten; 12 kort = 45 ms, 6 kort = 28 ms ⇒
   ~2,8–4 ms PER kort (23 DOM-noder styck). Referens: /bibliotek layoutar
   5 084 objekt på 156 ms. Bidragsgivare per kort (del-AB): skeleton-
   spanen (`h-[3.25rem] max-w-[38ch]`), metadataraden (tabular-nums) och
   titelns serif-textmätning.
2. **Optional-webfontens dubbla layoutpass** layoutar om hela listan:
   JS-av med webfont = TVÅ monster-layouter (151+130 ms); JS-av + remote
   fonts av = EN (178 ms). Next/font (font-display:optional + preload +
   metrics-fallback) är korrekt konfigurerad — dubblingen är optional-
   fontens natur och finns på alla sidor, men KOSTAR mest där (1) är värst.
3. **JS-vågen**: med JS på = 128 Layout-events (mot /blogg 8), 362
   IntersectionObserverController::computeIntersections, 180 FireAnimation-
   Frame: per-kort-IO (rootMargin 400px ⇒ alla 24 kortens fetcher triggar
   nästan direkt vid load) + skeleton→learn-text-swap per resolve + 24 st
   `animate-pulse` som håller rAF-loopen varm. /en/kurser JS-av: 29 ms
   (mot 250 med JS) — hydratisering+swappen driver ~220 ms.

## 5. Metod: isolation-AB på räddad SSR-HTML (spårets nya mönster)

`curl /kurser` + lokala CSS-kopior → file://-load i sond-Chrome
(--disable-javascript --disable-remote-fonts = isolerar SSR-trädets
layoutkostnad från JS-våg och font-swap). `display:none`-varianter per
sektion + DOM-halvering av registret + delradering i korten. Brus mellan
körningar är verkligt (fabrikssyskons CPU-last) — interna jämförelser
inom omgång håller; rådata + samtliga tabeller i
`lighthouse/s7u4-kurser-sl-ab-2026-09-16.json`.

## 6. KUR (committad): .cv-registerkort + .cv-utvalt (o18-mekaniken på /kurser)

- `src/app/globals.css`: `.cv-registerkort { content-visibility: auto;
  contain-intrinsic-size: auto 9rem; }` + md-brytpunkt 3rem (kompaktraden);
  `.cv-utvalt { … auto 12rem; }`. Plan CSS (o18:s JIT-argument).
- `src/components/ak1a/kurs-sok.tsx`: RegisterKort `<li>` får klassen —
  verkar på /kurser, /en/kurser, /ar/kurser (samma komponent; /en hade
  samma 250 ms-monster i sonden).
- `src/app/(huvud)/kurser/page.tsx`: UtvaltKort `<li>` får `.cv-utvalt`
  (endast svenska originalet renderar utvalda sektioner).

Effekt: offscreen kort (mestadelen av 24+18 vid förstabesök i mobilvy)
hoppar över style/layout/paint — lager (1) krymper till de ~2–3 synliga
korten, (2) dubbellayoutpassen layoutar bara renderade kort, (3) offscreen
kort renderas ej heller vid skeleton→text-swap. **Bevis FÖRE bygget**
(file://-AB, samma motor): FÖRE 119 ms → MED CV 60 ms SSR-S&L i minst
störda omgång; CV-varianten stabil 60–68 ms i samtliga tre omgångar.
DOM, SEO-text, hydrering och tillgänglighetsträd opåverkade (ren CSS,
o18 §3-samma argument; find-in-page/ankare fungerar; auto-nyckeln minns
renderad höjd). IO:n (rootMargin 400px) fungerar oförändrat — boxen finns
kvar med reservation.

## 7. Attribution (ärlig bokföring mot syskonen i samma bygge)

- **u1:s "rena CV-mått" (S&L-delta /bibliotek) bevaras**: mina klasser
  matchar inget på /bibliotek (`.cv-registerkort`/`.cv-utvalt` saknas
  där; bibliotek.tsx orörd); globals.css-tilläggen är nya regler, inga
  ändringar av deras.
- u2:s prefetch-EFTER (nätverksnivå): orörd av ren CSS + li-klasser.
- u3:s /studio-cache: orörd.
- Bygget innehåller nu fyra agenters vågor (f2256432 + 184c6dc7 +
  210dd518 + denna) — EFTER-mätningarna bokförs var för sig när synken
  byggt; Lighthouse-poäng/TBT på /kurser blir blandat u1-CV+u2-prefetch+
  denna — S&L-delta på /kurser attribueras denna våg enligt samma
  reservationslogik som o18 §5.

## 8. Deploy-kö

prod-synken stod i VÄNTAR-RAM sedan 02:27Z (1 328–1 909 MB tillgängligt
vid mina observationspunkter; poll var 10:e minut min%10==7). Denna commit
köar i samma batch. **EFTER bokförs här när bygget landat:** Lighthouse
mobil /kurser (förväntan: S&L/tumbling TBT-poäng), CDP-sond
(`node verktyg/prestanda-sond-sl.mjs http://localhost:3000 /tmp/efter.json
/kurser` — väntat: Layout-eventantal närmare /blogg:s ensiffror och
monster-layout nära referenssidornas), funktionssond (klass närvarande i
SSR + getComputedStyle), gränsnittsvakt GRÖN, prod 200.

## 9. EFTER (bokförs efter deploy)

<!-- fylls i: Lighthouse /kurser före→efter, sond Layout-antal/dur,
     funktionssond, gränsnittsvakt, prod 200 -->
