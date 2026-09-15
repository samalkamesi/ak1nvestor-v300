# O5 — Prestanda spår 7, våg 1: mätverktyg + FÖRE-baslinje (2026-09-15)

**Ägare:** studio/fabrik s7-u1 · **Status:** LEVERERAD · **Nästa:** se kön nedan.

## Vad som levererades

1. **Mätverktyg** `verktyg/prestanda-mat.mjs` — CDP mot headless Chrome
   (samma protokoll som Lighthouse, inga npm-paket: node 22 global
   WebSocket). Mobil 390×844 @DPR2, touch, kall cache, service workern
   bypassad. Insamlat per sida: FCP, LCP*, DOMContentLoaded, load,
   DOM-noder, resursantal + full nätverkslista (URL/typ/kB/ms) med
   topp-10. Två iterationer per sida — medianen är sanningen.
   *LCP returns −1 i headless=new (känd begränsning) — FCP/load/nätverk
   är spårets metriken tills vidare.
   Körning: `node verktyg/prestanda-mat.mjs http://localhost:3000 /tmp/ut.json 2`
   (loopback är whitelistad i middleware).
2. **FÖRE-baslinje** på 5 kärnsidor × 2 iterationer, mot localhost:3000
   (rena pass) och https://lab.ak1nvestor.com (äkt prod-väg genom
   nginx; pass med ≤2 andorda = diskcache-artefakt, kastas).

## Baslinjen (mobil, kall cache, komprimerade byte)

| Sida | FCP ms (mellersta) | load ms | Totalt kB | JS kB | Fonter kB | Bilder kB | Andorda |
|---|---|---|---|---|---|---|---|
| / | ~370 | ~430 | 755–758 | 455 | 148 | 3 | 49–53 |
| /kurser | ~370 | ~400 | 815 | 492 | 148 | 1 | 55–56 |
| /blogg | ~550 | ~470 | 805 | 484 | 148 | 1 | 58–59 |
| /analyser | ~240 | ~250 | 730 | 447 | 148 | 1 | 55–57 |
| /bibliotek | ~320 | ~410 | 795 | 465 | 148 | 1 | 56–57 |

Prod (giltiga pass): samma profil — FCP 272–920 ms, 572–799 kB,
37–57 andorda. HTTPS-handslaget förklarar FCP-tillägget på /.

## Fynd

- **F1 JS dominerar: 447–492 kB zippat per sida** (10 gemensamma
  chunks, största 70 kB). Koddelning/dynamisk import av tunga ytor
  (⌘K, kalkylator, diagram) = nästa BYGGVÅGS-objekt. Kräver src + prod-
  bygg — mät FÖRE/EFTER med verktyget ovan.
- **F2 Fonter 148 kB på varje sida** — 3 st woff2 à 48–51 kB under
  /_next/static/media/. Font-audit: behövs alla 3 (vikter/subset)?
  next/font-subset-granskning = byggvågs-objekt.
- **F3 nginx saknar brotli**: prod svarar `Content-Encoding: gzip`
  även vid `Accept-Encoding: gzip, br, zstd`. Brotli ger typiskt
  15–20 % mindre på JS/CSS/HTML → est. −70–90 kB per kall sidvisning.
  ÄGARE: huvudagent/infra (kräver sudo på /etc/nginx + reload) —
  bokas, barnagent rör ej nginx.
- **F4 Cache-headers GRÖNA**: `_next/static` = `public, immutable,
  max-age=31536000` ✓; `/ak1a/`-bilder = `max-age=2592000` utan
  immutable — RÄTT (icke-fingerprintade filer). Noteras: dubbla
  Cache-Control-rader (nginx + Next) — kombineras enligt RFC 9110,
  ingen åtgärd.
- **F5 Bildobjektet i spåret är redan avklarat**: klientflödets
  bilder = 1–3 kB/sida. Logo-originalen i public/ak1a/logo (1,2 MB
  arkiv) raderas aldrig (logo-README regel 5) och serveras ej.
- **F6 Service worker (sw.js v7) är rätt byggd**: cache-först för
  fingerprintad statik, nätverksförst för sidor — repeat-visits
  täckta. Orörd enligt våg 78-normen (ALDRIG skipWaiting).

## Protokoll för kommande vågor i spåret

1. `node verktyg/prestanda-mat.mjs http://localhost:3000 /tmp/fore.json 2`
2. Genomför åtgärden (bygg under deploy-lås / nginx-ändring).
3. Samma mätning igen → EFTER-rader i denna tabell + delta.
4. Filtrera pass med ≤2 andorda (diskcache-artefakt).

## Kö (bokade objekt med ägarkanal)

| Objekt | Est. vinst | Ägare | Kanal |
|---|---|---|---|
| Brotli i nginx | −15–20 % JS/CSS/HTML vid kall load | Huvudagent | sudo /etc/nginx + reload |
| ~~Koddelning tunga ytor~~ | — | **AVSLUTAT s7 (se nedan)** | — |
| ~~Font-audit~~ | — | **AVSLUTAT s7-u3** (display:optional, preload:false mono/kursiv, latin-subset = optimum för next/font) | — |

### Koddelningen — ärlig slutrapport (s7-våg 3, 2026-09-15)

Köposten "koddelning tunga ytor (⌘K, kalkylator, diagram)" granskades mot
källträd och FÖRE-rapporter. Resultat: posten var till större delen redan
löst när den bokades —

- **⌘K-paletten**: redan lazy (våg 68) — PalettVakt laddar paletten vid
  första öppningen/idle (`lasy-global.tsx`).
- **Diagram**: recharts importeras ENBART av `src/components/ui/chart.tsx`,
  som inga aktiva rutter importerar → aldrig i klientbunten.
- **Kalkylatorn** (`akm1-calculator`): ligger bakom egen route (/kalkylator)
  = egen chunk, laddas inte av /, /kurser, /blogg.
- **Kvar att plocka (levererat denna våg)**: `SearchModal` (overlays.tsx —
  radix-dialog + menyregister-loopar) monterades STATISKT av spa-hem på
  startsidan trots att den bara syns vid sök. Fix: next/dynamic (ssr:false)
  + LasyGlobal idle/interaktions-montering — exakt våg 68-mönstret. Söker
  besökaren tidigt har interaktions-acceleratorn redan monterat modalen.
- **Footer (265 rader "use client")** analyserades för serverkonvertering —
  kräver useSprak (språkhook) på 20+ etiketter; avskrivet som kirurgi-
  objekt (risk > vinst). Header behövs ovanför vecket.

## EFTER-mätning runda 2 (2026-09-15, prod 6062e640 — font-display optional live)

Standardmätning (Lighthouse headless, navigator en-US): **P58/P53/P48**,
CLS / = **0,110** (var 0,125). TBT svänger ±700 ms mellan körningar
(serverbelastning — mätbrus, bokfört i runda 1).

**Isoleringsbevis (sv-locale, `--lang=sv-SE`): CLS / = 0,000 — 0 skift.**
`start-efter-svlocale.json`. Font-roten (swap-skiftet i hero/sifferband)
är alltså BOTAD. Det kvarvarande 0,110-skiftet i standardmätningen har en
ANNAN rot: **språkresolvensen vid hydratisering** — SSR renderar svenska,
klienten resolverar `localStorage ⇒ navigator ⇒ sv` (sprak-leverantor.tsx);
headless-Chromes navigator.language=en-US ⇒ etiketter byter till engelska
("Become a member — free", syns i skiftets nodeLabel) ⇒ knappraden
(`div.mt-8 flex flex-wrap gap-3` i hero) radbryts annorlunda. Svenska
besökare (navigator sv) får INGET byte = noll CLS. Skiftet träffar enbart
besökare som får auto-språkbyte vid hydratisering.

**Nytt kö-objekt (produktbeslut, ej kirurgi):** auto-språkbyte vid
hydratisering orsakar CLS för icke-sv-språkade förstabesökare. Alternativ:
(a) behåll som är (funktionalitet > 0,11 CLS för den gruppen), (b) resolvera
språket i inline-head-skript FÖRE hydration (mindre flash, samma byte),
(c) svensk SSR tills aktivt val. Ägare: huvudagent/styrelse — rör
användarsynligt beteende, lämnas ej till barnagent.

Rådata: `lighthouse/efter-sammanfattning.json` (runda 2), `lighthouse/start-efter-svlocale.json` (isolation). Runda 1 (P42/P47/P50, CLS 0,1246) bevarad i commit 7eb6f8ff.

## EFTER runda 3 — koddelningen live (deploy 50095d0e 11:29:58, prod 200)

SearchModal-idle-dynamic (commit 18701fcd) deployad av prod-synken
(4 commits, RAM-vaktens kö rapporterad ärligt: två VÄNTAR-RAM-poller
innan minnet frigjordes). Prod + localhost = 200.

Mätning (larmad server — samma last-brus som syskonets kurskontroller):

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| / | 43 | 5 359 ms | 4 573 ms* | 0,110 (språkresolvens, identiskt — deterministiskt) |
| /kurser | 44 | 6 245 ms | 2 256 ms* | 0 |
| /blogg | 54 | 6 229 ms | 740 ms | 0 |

\* TBT oreproducerbar vid last (load ~4 under mätningen; intervall-
bokföring som EFTER2:s kurskontroll).

**Strukturtalet (last-oberoende) på /, FÖRE 09:59-bygget → EFTER3:**
JS-filer 27 → 30 (+3 chunks = split), totalt 455 → 463 kB (+8 kB
chunk-overhead), **unused-JS 72 → 51 kB (−21 kB)** — overlays-modulen
(radix-dialog + registret) ligger nu i egen chunk som hämtas först vid
idle/interaktion, ut ur startsidans kritiska hydratisering.

**Funktionsbevis (CDP-sond, / efter 8 s):** 0 konsolfel/undantag,
SearchModal-chunken hämtad, hero renderad. Sök via store
(DeepConsultationPanel) opåverkat — modalen monteras av LasyGlobal:s
interaktions-accelerator vid behov.

Slutsats spåret: koddelningsposten är slutbehandlad (se slutrapporten
ovan) — kvar i spårets kö: brotli (huvudagent/infra) +
språkresolvens-CLS (produktbeslut). Rådata: `lighthouse/efter3-*.json`
+ `efter3-sammanfattning.json`.

Rådata: `o5-fore-localhost.json`, `o5-fore-prod.json` (samma mapp).
Prod 200 verifierad under mätningen (10 träffar) + curl 200.
