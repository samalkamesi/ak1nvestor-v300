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
| Koddelning tunga ytor | −100–200 kB JS på publika sidor | Byggvåg s7 | src + prod-bygg |
| Font-audit (3×50 kB) | −50–100 kB | Byggvåg s7 | src + prod-bygg |

Rådata: `o5-fore-localhost.json`, `o5-fore-prod.json` (samma mapp).
Prod 200 verifierad under mätningen (10 träffar) + curl 200.
