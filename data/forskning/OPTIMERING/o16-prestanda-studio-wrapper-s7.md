# O16 — Prestanda spår 7: /studio-årslåset dött (server-wrapper-kirurgi) (s7-u3, 2026-09-16)

**Ägare:** studio/fabrik s7-u3 · **Status:** KOD LEVERERAD (f2256432),
EFTER bokförs nedan.

## Uppdrag och urval (duplikatkontroll gjord före start)

Uppdraget: "mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd".
Spårets kö efter o13:s EFTER-karta (årslås 30→1): endast **/studio** var
kur-bart av barnagent — övriga poster är bokade med ägarskäl: brotli
(huvudagent/infra — nginx utanför repot), språkresolvens-CLS a/b/c
(produktbeslut), global 44→52 (designbeslut). VALET: /studio-wrapper.
Kollisionskontroll: anspråksfil `data/vakten/s7-1789524905980-u3-ansprak.md`
före byggstart; inget syskon (u1/u2 i auto-s7-1789524905980) bokat ytan.

## FÖRE (2026-09-16 02:20–02:21, HEAD = 9b01c0d4, prod i synk)

**Cache-header (localhost OCH prod, identiska):**

```
HTTP/1.1 200 OK
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
Cache-Control: s-maxage=31536000        ← ÅRSLÅS, ingen swr
```

**Lighthouse mobil (verktyg/prestanda-lighthouse.mjs, 4G-drossel):**

| Mått | Värde |
|---|---|
| Prestanda | **55** |
| LCP | 5 863 ms |
| FCP | 1 699 ms |
| TBT | 909 ms |
| CLS | 0 |
| TTI | 6 138 ms |
| SI | 4 001 ms |
| unused-javascript | 141 KiB est. besparing |
| bootup-time | 2,4 s |
| mainthread-work | 4,7 s |
| total-byte-weight | 679 KiB (poäng 1,0 — OK) |
| tillgänglighet / bästa praxis / SEO | 1,0 / 0,96 / 0,66 |

Rådata: `lighthouse/studio-fore.json` + `lighthouse/fore-sammanfattning.json`.

Notering för kommande vågor: SEO 0,66 och unused-JS 141 KiB på /studio är
EGNA poster — SEO-drabbningen beror troligen på låsvynens tunna text-yta
(meta/robots ur studio-layouten), unused-JS på att hela StudioChat-bunten
laddas före inloggning. Båda bokas nedan som nya köobjekt, ej kurade här.

## KUR — commit f2256432

- `src/app/(huvud)/studio/page.tsx`: "use client"-sidan (136 rader) tunnades
  till en tunn SERVER-komponent: `export const revalidate = 3600` +
  `<StudioKlient />`. Segment-config-exporter är endast tillåtna i
  serverkomponenter — samma Next-regel som studio/layout.tsx redan
  dokumenterar för viewport (våg 87-precedensen).
- `src/app/(huvud)/studio/studio-klient.tsx` (NY): hela klientinnehållet
  (lås-vy + StudioChat + sessionskontrollen), logiken oförändrad.
- Varför cache-bar: SSR-yn är ALLTID den personligt neutrala låsvyn
  (`authad=false` initialtillstånd; personligt innehåll hämtas först
  klient-side via auth:ade API-rutter) — ingen skillnad mot innan; enda
  förändringen är HTTP-huvudet. 3600 + swr = husets gröna mönster (o13).
- tsc 0 (projektbinär). R2 orörd. Pre-commit-grind passerad.

## EFTER — LIVE BEVISAD (deploy 03:33:00, 10 commits 9b01c0d4→50463d80, prod 200)

Prod-synken deployade samlingsbatchen (RAM-kön: VÄNTAR-RAM 02:27/02:37/
02:47/02:57/03:07/03:17 — sex poller under tre agentfönster; bygget startade
vid 03:27-pollen). HTTPS 200 verifierad av prod-synken; curl `/` = 200.

**Cache-header (localhost OCH prod, identiska, dubbel curl + 9 s = ingen
ISR-stale-artefakt):**

```
HTTP/1.1 200 OK
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-nextjs-stale-time: 300
Cache-Control: s-maxage=3600, stale-while-revalidate=31532400   ← GRÖNT mönster
```

Funktionellt: SSR-låsvyn renderar ("Låser upp studion" i HTML:en),
`x-nextjs-prerender: 1` kvar — sidan är fortfarande statiskt genererad,
endast HTTP-huvudet förändrat. Grannsidor / och /kurser gröna (3600+swr).

**Lighthouse mobil /studio (samma verktyg, samma 4G-drossel):**

| Mått | FÖRE | EFTER | Δ |
|---|---|---|---|
| Prestanda | 55 | **63** | +8 |
| LCP | 5 863 ms | 5 027 ms | −836 ms |
| TBT | 909 ms | 638 ms | −271 ms |
| FCP | 1 699 ms | 1 736 ms | ±0 (brus) |
| TTI | 6 138 ms | 5 663 ms | −475 ms |
| SI | 4 001 ms | 4 098 ms | ±0 (brus) |
| CLS | 0 | 0 | 0 |
| bootup-time | 2,4 s | 1,6 s | −0,8 s |
| mainthread-work | 4,7 s | 3,6 s | −1,1 s |
| total-byte-weight | 679 KiB | 625 KiB | −54 KiB |

Rådata: `lighthouse/studio-efter.json` + `lighthouse/efter-sammanfattning.json`.

**Ärlig tilldelning:** EFTER-mätningen mätte samlingsdeployns 10 commits.
Lighthouse-förbättringen (P+8, TBT −271) bär huvudsakligen syskon u2:s
prefetch-kur (184c6dc7: kakbanner + footer-länkar prefetch={false} —
footern/kakpanelen sitter i (huvud)-layouten och thus på /studio med) och
eventuellt u1:s övriga kur; DENNA vågs eget deterministiska bevis är
cache-headern ovan (årslås → grönt mönster, oberoende av mätvärden).
Cachelogiken i sig påverkar inte Lighthouse-labbet (ingen CDN i mätkedjan).

**SPÅRETS CACHE-KARTA ÄR NU HELT GRÖN: 0 årslås kvar** (o13:s 30 → 0 via
två ronder + denna wrapper; /studio var den sista).

## Nya köobjekt (bokas av denna våg)

| Objekt | Ägare | Orsak |
|---|---|---|
| /studio SEO 0,66 (låsvyns metadata) | nästa prestandavåg | Lighthouse FÖRE ovan |
| /studio unused-JS 141 KiB (StudioChat-bunten före auth) | nästa prestandavåg | Lighthouse FÖRE ovan |
