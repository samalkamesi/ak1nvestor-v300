# O143 — /dataset CLS 0,2367: Suspense-null-fönstret vid hydrering (ROTBEVISAT + KURERAT) · TBT-dom av o137:s köpost · manifest-ikon-404 live-kurerad

Datum: 2026-09-21 14:35–15:5x lokal · Ägare: s7-u1 (manifest
auto-s7-1790001325956, byggare 1/3) · Reservation: o143 i
protokollnummer.json · Anspråk disk-först:
`data/vakten/auto-s7-1790001325956-s7-u1-ansprak.md` (kur-ytorna meddelade
där FÖRE Write/Edit).

## §0 VAL (redogörelse)

Köposten: o137 §"Kö" — "/dataset TBT/LCP till TBT-spåret" (P53 · LCP 4 865 ·
TBT 2 272, enskild mätning under fabrikshelgen) — mot o139:s giltiga ×5-baslinje
samma dag (/dataset TBT 372, nattmätt). Motsättningen krävde lösning innan
rotjakt (o139-precedensen). Duplikatkontroll: ingen /dataset-CLS/TBT-leverans i
worklog/OPTIMERING; syskonens ytor (o139: .cv-widget-super/.cv-widget-kalk +
2 page.tsx; o128: slider.tsx; o126: dataset-sortering.tsx pill-del — REDAN
LEVERERAD, min kur bevarar pillklassarna ordagrant, kontrakt C4) respekterade.

## §1 FÖRE-baslinje (kanoniska verktyget, mobil, ×5 + 6 jaktförsök)

| omgång | P | LCP | TBT | CLS |
|---|---|---|---|---|
| fore1 | 29 | 5 398 | 8 081 | **0,2366902995198716** |
| fore2 | 55 | 4 598 | 2 405 | 0 |
| fore3 | 53 | 4 596 | 2 725 | 0 |
| fore4 | 45 | 4 286 | 2 102 | **0,2366902995198716** |
| fore5 | 56 | 4 571 | 1 767 | 0 |
| jakten (×6, lhspår) | — | — | 979–2 722 | 0 · **0,2367 (1/6)** · 0 · 0 · 0 · 0 |

Median TBT 2 405 = o137:s 2 272 REPRODUCERBAR dagtid; o139:s 372 är
nattmätt. **CLS 0,2366902995198716 i 3 av 11 laster (27 %), IDENTISK till
sista siffran** — deterministisk defekt, ej brus. Rådata:
`lighthouse/dataset-s7u1o143-fore1..5.json` + sammanfattningar +
`lighthouse/lhspår-o143-fangad.json`.

## §2 ROTJAKT CLS — kedjan stängd med tre oberoende bevis

1. **AUDIT-BEVIS** (Lighthouse layout-shifts-audit, fore1+fore4 identiskt):
   skiftande element = `div.mx-auto > main > section.mt-8 > div.mt-4` =
   **KallaOchLicens-raden** ("Universum och aggregering … rådata: offentliga
   marknadskällo…"), bounding top 1 916 (under viewport 823) — elementet låg
   vid underkant och trycktes UR synfältet.
2. **TRACE-BEVIS** (fångad Lighthouse-trace, `--save-assets`, bakgrundsjakt
   försök 1): EN LayoutShift +1 276 ms (FCP 980). impacted_nodes 17/71/72:
   old_rect y 554–791 (inom viewport) → new_rect [0,0,0,0] = BORT ur DOM;
   overall_max_distance **1 268 px** = hela DatasetSorteradLista-subträdets
   höjd (pills + mobila kort).
3. **MEKANISM-BEVIS** (samma trace, kontext): React-commit i
   2feezv-iveko5.js → UpdateLayoutTree 37 ms → Layout 33 ms → skift → Paint.
   = **hydreringen målade Suspense-gränsens fallback (null)**: subträdet
   togs bort en paint och återkom 1 268 px längre ner. Snabb hydrering fyller
   fönstret inom en paint ⇒ CLS 0 (73 % av laster); belastad server (vår
   dagtid) ⇒ fönstret målats ⇒ exakt 0,2366902995198716 varje gång.

**Varför bara /dataset**: kodkartan — `/dataset` (+ /en//ar-speglar) är den
ENDA publika STATISKA ytan med `useSearchParams` + `Suspense fallback={null}`
(dataset-sidor.tsx ⇒ dataset-sortering.tsx). ref-mottagare/logga-in kör
useSearchParams på DYNAMISKA medlemssidor (ingen Suspense tvång).
Sondfynd som AVSKRIVER andra misstänkta: fonter `display:"optional"` (byter
aldrig — s7-u3-beslutet), CookieConsure `fixed` overlay (trycker ej),
server-HTML innehåller samtliga 10 kort (curl-bevis — inte SSR-brist).

## §3 TBT-DOMEN (o137:s köpost besvarad)

Parad sondsession (CDP, 4× CPU + Slow-4G, samma lastläge):
/dataset TBT-fönster 1 493 ms mot **/konfluens 2 251 ms** — syskonet VÄRRE;
odrosslad /dataset: 104 ms, 10 longtasks. Slutsats: **ingen sidspecifik
/dataset-anomali** — dagtidens TBT (o137 2 272, min median 2 405) är
SERVERBELASTNING som lantern skalar ×4; o139:s nattvärde 372 är sidans egen
nivå. TBT på denna server är endast jämförbart inom samma lastfönster —
metrologiregel för spåret. **Sidofynd (metrologi):** direkthämtad mät-Chrome
lastar Docs-Offline-tillägget
(chrome-extension://ghbmnnjooekpmoecnnnilnnbdlolhkhi/service_worker_bin_prod.js,
200–330 ms i longtask-attributionen) — o143-sonden kör nu `--disable-extensions`.

## §4 KUREN (src ENDAST Write/Edit · tsc 0)

**Rotkur, ej symptomgips** (reserverad fallback-höjd hade lämnat blinken och
krävt höjdunderhåll — o92/o129-disciplinen): suspensionen eliminerad.

- `src/components/ak1a/dataset-sortering.tsx`: `useSearchParams` BORT;
  `?sortera=` läses ur `window.location.search` i useEffect (SSR/hydrering
  renderar A–Ö = server-HTML, aldrig mismatch) + `popstate`-listener (bakåt/
  framåt). Pillarna: Link → `type="button"` + `valj()` = `setSortering` +
  `router.push("?sortera=" + id, { scroll: false })` — delbar adressbar-länk
  och historik-push bevarade; o126:s 52px-klasser ordagrant kvar.
  Sidovinst SEO: de tre `?sortera=`-dublett-URL:arna blir ej längre crawlbara
  länkar (sorteringen var ändå alltid klienttillstånd — force-static ignorerar
  query server-side, ingen beteendeförlust: direktbesök med ?sortera= fungerar
  som förut via mount-effekten).
- `src/components/ak1a/dataset-sidor.tsx`: `Suspense`-gränsen + importen BORT —
  komponenten hydreras på plats, fallback-fönstret KAN inte uppstå.
  **Täckning: sv + /en + /ar-speglarna** (alla tre via DatasetIndexVy).

## §5 SIDOKUR: manifest-ikon-404 (o128 §"Sidofynd"-köpost — LIVE-kurerad)

`public/manifest.json` (den HTML-länkade, `rel=manifest href=/manifest.json`)
peckade på `/ak1a/logo/ikon-192.png` + `ikon-512.png` = **404 på prod** (kurl
bevisat; katalogen `public/ak1a/logo/` innehåller bara skulpturbilder). Kuren:
src → `/ak1a/ikon-192.png` + `/ak1a/ikon-512.png` + maskable →
`/ak1a/ikon-maskable-512.png` (i linje med app/manifest.ts ikonuppsättning).
public/ servas från disk av next start ⇒ **LIVE UTAN BYGGE**: kontrakt C11–C13
(serverad manifest bär kuren, tre ikoner 200, gamla sökvägen orefererad).

## §6 KVD (FÖRE deploy)

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär).
- Kontrakt `verktyg/_s7u1o143-kontrakt.mjs`: **15 PASS 0 FAIL** (kodfrånvaro
  av useSearchParams/Suspense, beteendekontrakt, o126-klasser, determinism,
  manifest + live-HTTP).
- INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
  syskonytor orörda (o139:s globals.css/page.tsx, o128:s slider, u3:s yta) ·
  commit med explicit pathspec + `-F`-fil (index-kollisionsläxan).

## §7 EFTER-facit (VAKARÖVERTAG — som o139 §7)

Prod kör d401d719-avkomma; o143-curen deployas av prod-synkens RAM-/fabrikfönster
(u3:s 14:57Z-poll: krav 6 624 MB mot 1 114 tillgängligt — korrekt OOM-disciplin).
När DEPLOYAD-raden landat (merge-base SANT mot denna commit):
1. **Lighthouse ×5** på /dataset: CLS 0 ×5 (o100:s heliga noll; avvikelse ⇒
   lhspår-jakt omgående — verktyget finns och är lagat).
2. LCP inom ±15 % av §1-medianen (4 571) i jämförbart lastfönster.
3. TBT-kontroll: ej sämre än lastfönstrets syskonreferens (parad /konfluens).
4. **Funktionstest**: pillklick växler aria-current + URL (`?sortera=`) +
   kortordning; bakåtknapp återställer (popstate). ×3 språk.
5. Gränssnittsvakten 0 fynd (konsolfel: manifest-404:n borta).
6. prod 200 ×3 (/dataset, /en/dataset, /ar/dataset) + speglarna bär kuren.
Verktyg levererade för ronden: `_s7u1o143-sond.mjs` (CDP + skift-attribution +
A/B-css + --disable-extensions), `_s7u1o143-lhspår.mjs` (lagad trace-läsare),
`_s7u1o143-kontrakt.mjs`.

**FACIT 2026-09-21 17:54–17:56Z + 23:0xZ (verkställaren _s7u2o144 + s7-u1
slutförde funktionsteget) — SLUTSTÄNGD GRÖN:**

1. **CLS 0 ×5 UPPFYLLD** (o144-efter1..5; skiftet 0,2367 borta i alla fem —
   Suspense-kurens mål).
2. **LCP median 4 277 = −6,4 %** mot 4 571 UPPFYLLD (±15 %).
3. TBT-observation: 594–2 524 (median 1 134, dagfönster) — §3:s
   metrologiregel står; ingen sidspecifik anomali (§3:s par-dom kvarstår).
4. **Funktionstest 12/12 PASS ×3 språk** (funktion-o144.json; efter 3
   verktygsfixar + kontraktskorrigeringen defaultValdFore — o144 §6:
   A–Ö vald som designat default enligt tolkaSortera).
5. Manifest-ikonerna /ak1a/ikon-192.png · ikon-512.png ·
   ikon-maskable-512.png = 200 ×3 på aktuellt träd; vakten = cron-kadansen.
6. **prod 200 ×3** (/dataset, /en/dataset, /ar/dataset) + speglarna bär
   kuren — kanalbevis ×2 träd (27a582a0 + 496466f6, o144 §3).

## §8 Kö vidare

- o120:s /blogg kall-TBT-arkitekturpost (oförändrat öppen, ej min yta idag).
- Docs-Offline-fyndet: granska om även kanoniska Lighthouse (chrome-launcher)
  lastar tillägget — i så fall påverkar det ALLA historiska TBT-värden med
  ~0,3 s systematik (separat metrologivåg, s8-spåret).
- o138 §6.1 ar-microjustering villkorad (oförändrad).
