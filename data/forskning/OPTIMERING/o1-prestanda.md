# O1 — Prestandamätning & problemranking (MEGA-OPTIMERING fas A)

Datum: 2026-09-05 · Mätare: node fetch (brotli, 3 körningar/sida) mot
https://lab.ak1nvestor.com + statisk kodanalys. Arbetslogg: VÅG 63 O1.

## 1. Produktionsmätningar (node fetch)

| Sida | TTFB kall (1:a träff) | TTFB median (varm) | Total varm | HTML (br) | Var DK | kommentar |
|---|---|---|---|---|---|---|
| `/` | 185 ms | 70 ms | 73 ms | 112 kB | — | snabb; men 1,2 MB JS (se §2) |
| `/kurser` | 459 ms | 59 ms | 67 ms | 475 kB | ~348 kB | RSC/flight bär hela kursregistret |
| `/kurser/the-intelligent-investor` | 722 ms | 59 ms | 62 ms | 216 kB | ~156 kB | kapiteldata i flight |
| `/portfolj-forskning` | 936 ms | 69 ms | 87 ms | **2 266 kB** | 319 kB | KRITISK — se problem #1 |
| `/forskningsbiblioteket` | 749 ms | 58 ms | 61 ms | 170 kB | — | ok |

Tolkning: CDN-cachning (varm ~60 ms) fungerar — problemen är (a) kall TTFB
459–936 ms (serverless bootstrap, se #3) och (b) payload-storlekar.

## 2. Bundel & resurser (mätda mot prod)

- **JS på `/`: 18 chunk = 1 201 kB rå** (top: 224 + 187 + 162 + 112 + 110 kB).
- **Fonter: 4 woff2 preload = 187 kB** (Inter + Source Serif ×2 + JetBrains Mono).
- **`/deep-courses.json`: 16,6 MB över wire (br), 1 042 ms TTFB / 1 312 ms total**
  — hämtas av KLIENTEN vid första ⌘K-sökning (se #2).
  `cache-control: public, max-age=0, must-revalidate` → omvalideras var gång.
- **`/api/notiser`: 835 ms kall** — anropas vid VARJE sidladdning (NotisCenter).
- **deep-courses.json lokalt: 17,4 MB, 333 kurser**; snittfältvikt:
  `chapters` 32,3 kB/kurs (≈10,7 MB av totalen), `history` 1,7 kB/kurs.
- **Ordlista `src/lib/ordlista.ts`: 42 kB källkod i klientbunt** (via header,
  notis-center, sprak-leverantor, kommandopalett — alla i layout).
- **OG-bilder: 389 st / 7,9 MB** (`public/og/kurser` 6,6 MB, snitt ~18 kB/st) —
  används ENDAST i sociala meta-taggar, laddas aldrig i viewport → **inget
  LCP-problem, ingen åtgärd**. `scripts/fonts/` (308 kB TTF) används bara av
  `scripts/og-generate.mjs` → ej i browser, ok.
- **Bilder i DOM:** next/image används (logo preload via `/_next/image`); 1 rå
  `<img>` i `src/components/ak1a/pro/tenant-header.tsx` — låg prio.
- **Layout (`src/app/layout.tsx` rad 196–208) monterar 9 globala klientkomponenter
  på ALLA sidor:** ChatWidget (1 118 r), ShortSeller (804 r), Kommandopalett,
  NotisCenter (471 r), PwaRegistrerare, TracerMount, TrafikRapportor,
  CookieConsent, SprakLeverantor + Toaster/ThemeProvider/Ak1aStoreProvider.
- **Bakgrundsaktivitet per sidladdning:** `/api/track`-beacon (ok) +
  `/api/notiser`-fetch + trafikpuls (3 min-intervall) + tracer-hjärta
  (`setInterval` i tracer-mount.tsx:229).

## 3. Topp-10 problem, rankade (LCP/CLS/TTFB-risk)

### #1 /portfolj-forskning: 2,27 MB HTML — 1,9 MB synlig DOM — LCP/parse (SVÅRAST)
- **Fakta:** 2 510 `<td>`, 9 287 `<span>`, 112 `<tr>` — korstabellen renderar
  100 bolag × ~23 kolumner med chips + tooltips (Tailwind-klasssträngar),
  DUBBELT: DOM 1 894 kB + RSC-flight 319 kB (korstabell är `"use client"`).
- **Risk:** LCP (mobil: flera sekunder före första bild/text), style/recalc,
  hydratisering av tusentals noder. CLS vid tabellrendering.
- **Fix:** `src/components/ak1a/portfolj-forskning/korstabell.tsx` +
  `vag-stil.tsx`: (a) rendera topp-10 per bransch kollapsad med expander
  (`<details>` = noll JS), (b) flytta chips-tooltips till CSS `data-*`-attribut,
  (c) pinnkolumnerna mikro/kort horisont — resten på begäran.
- **Vinst:** HTML 2 266 → ~400 kB (−80 %), LCP-till-text dramatiskt ner på mobil.

### #2 Kommandopaletten laddar ner 16,6 MB vid första sökning
- **Fakta:** `src/lib/sokindex.ts:71` — `fetch("/deep-courses.json")` i klienten
  vid första ⌘K. 333 kurser varav `chapters` (~32 kB/kurs) aldrig behövs för
  sökning. `max-age=0` ⇒ omvalidera på nytt.
- **Risk:** 16,6 MB nät + JSON.parse av 17 MB på huvudtråden (fryst UI flera s
  på mobil); konkurrerar med LCP om användaren söker tidigt.
- **Fix:** bygg slimmigt sökindex vid build (slug+title+kategori+nycklar ≈
  120–150 kB) som `/api/sokindex` eller statisk fil; `sokindex.ts` hämtar det.
- **Vinst:** −16,4 MB nätverk, −1,3 s+ på snabb linje, värst på mobil 4G.

### #3 Kall TTFB 459–936 ms: 17,4 MB readFileSync + JSON.parse i bootstrap
- **Fakta:** `src/lib/content.ts:99` (modul-cache — bra) men kall serverless =
  läs+parse 17,4 MB innan rendering. `src/lib/data-access.ts:14`
  (`getBackendStatus`) läser OM hela filen utan cache per anrop.
- **Risk:** TTFB vid cache-miss (edge revalidate, ny region, deploy).
- **Fix:** (a) splitta till `data/kurser/<slug>.json` + litet manifest (~100 kB)
  som `getCourses()` bygger lista ifrån; (b) cachea `getBackendStatus`
  (modulvariabel, som content.ts); (c) ISR `revalidate` i stället för rent
  `force-static` där data ändå är statisk.
- **Vinst:** kall TTFB −300–800 ms på kurssidor; admin-stats blixtsnabbt.

### #4 /kurser: 333 kursers `learn`-texter i klient-props (flight ~348 kB)
- **Fakta:** `src/app/kurser/page.tsx:242` mappar ALLA kurser med `learn` till
  klientkomponenten `KursSok` ("INGEN databorttagning" — kommentar rad 26).
- **Risk:** LCP (större HTML + hydratisering), bandbredd.
- **Fix:** stryk `learn` (och `quiz`) ur props — visa i kortexpansion via
  `/api/kurs/[slug]` som redan finns; behåll slug/title/kategori/kapitel.
- **Vinst:** flight 348 → ~90 kB (−75 %); HTML 475 → ~220 kB.

### #5 1,2 MB JS på alla sidor: 9 globala klientkomponenter i layout
- **Fakta:** layout.tsx rad 200–207 monterar bl.a. ChatWidget (1 118 r +
  spaced-repetition, chat-minne, badges, member-local) och ShortSeller (804 r)
  på varje sida. 18 chunk / 1 201 kB på startsidan.
- **Risk:** LCP (hydratisering), TBT/INP, mobil CPU.
- **Fix:** `next/dynamic` med `ssr:false` + idle-mount för ChatWidget,
  ShortSeller, Kommandopalett, NotisCenter (montera på `requestIdleCallback`
  eller vid första interaktion);CookieConsent kan vara ren HTML+CSS.
- **Vinst:** uppskattat −300–500 kB kritisk JS + tidigare interaktivitet.

### #6 /api/notiser anropas vid varje sidladdning (835 ms kall)
- **Fakta:** `src/components/ak1a/notis-center.tsx:188` — useEffect-fetch vid
  mount; serverless-funktionen läser vagkarta/mm.
- **Risk:** konkurrerar om anslutning/H2-prioritet med LCP-resurser; kall
  invocation 835 ms.
- **Fix:** hämta först när användaren öppnar klockan (eller efter `idle`), swr-
  cachea i localStorage; logik i notis-center.tsx.
- **Vinst:** −1 request/sidvisning, snabbare LCP på mobil.

### #7 Ordlista 42 kB i klientbunt (på alla sidor)
- **Fakta:** `src/lib/ordlista.ts` (42 kB) importeras av header.tsx,
  notis-center.tsx, sprak-leverantor.tsx (alla globala).
- **Risk:** bundle-storlek; marginell TTFB/LCP via JS-tid.
- **Fix:** ladda ordlista som komprimerad JSON-endpoint vid språkval (sv är
  default och behöver den sällan), eller skär `OrdlistaNyckel`-typen från
  datat (import type redan OK — problemet är värdena i klientmodulen).
- **Vinst:** −40 kB JS på alla sidor.

### #8 Kurssida: 156 kB flight (kapitelblock)
- **Fakta:** `/kurser/[slug]` (216 kB HTML) serialiserar kapitel-block i RSC.
- **Risk:** måttlig LCP-påverkan på mobil; acceptabelt på desktop.
- **Fix:** ladda kapitel 2+ vid scroll via befintlig `/api/kurs/[slug]`.
- **Vinst:** −100–150 kB HTML på 333 kurssidor.

### #9 Fonter: 187 kB preload (4 filer), Source Serif i 6 stiler
- **Fakta:** layout.tsx rad 24–30: Source Serif 4 med 400/600/700 ×
  normal/italic + Inter + JetBrains Mono; 4 preloadas.
- **Risk:** bandbreddskonkurrens med LCP; italic-versioner sällan ovanför fold.
- **Fix:** skär `style: ["normal"]` (behåll italic enbart där använd) — nästa/
  font laddar bara det deklarerade; behåll `display: swap` (redan OK).
- **Vinst:** ~50–90 kB mindre kritisk bandbredd.

### #10 Eviga intervall: tracer-härta + trafikpuls (batteri/CPU)
- **Fakta:** `src/components/ak1a/tracer-mount.tsx:229` setInterval-hjärta;
  `src/components/ak1a/trafik-rapportor.tsx:38` puls var 3:e minut.
- **Risk:** INP/batteri; wakelocks på flikar i bakgrund.
- **Fix:** pausa med `document.hidden` (visibilitychange).
- **Vinst:** låg men gratis.

## 4. Icke-problem (avskrivna med mätning)
- OG-bilder 389 st: endast meta-taggar, aldrig i viewport — ingen åtgärd.
- `scripts/fonts/` 308 kB: bara OG-generering offline — ej levererad.
- next/image: används korrekt på logotyp; 1 rå `<img>` (tenant-header) trivial.
- `cache-control` på HTML (`max-age=0, must-revalidate` + CDN): varm TTFB
  58–70 ms visar att edge-cachen fungerar.

## 5. Föreslagen åtgärdsordning (optimering fas B)
1. #2 sökindex (störst vinst/minst risk — en fil + ett endpoint-läge)
2. #1 korstabell-kollaps (störst LCP-vinst på en sida)
3. #3 JSON-split + cachat getBackendStatus (kall TTFB, alla kurssidor)
4. #4 stryk `learn` ur KursSok-props
5. #5 dynamic-import av globala klientkomponenter
6. #6–#10 tillsammans som ett "clientsmil"-pass

Mätvärdena ovan är baslinj; om-mät med samma skript efter varje fix.
