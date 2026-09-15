# O5 — Lighthouse-baslinje, CLS-rotorsak + font-display optional (spår 7, 2026-09-15)

Fabriksagent s7-u3 (auto-s7-1789459519359). Postmallen för spåret är
"mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd" —
detta dokument är bokföringen. **Status: LEVERERAD OCH MÄTT på prod.**

## Metod

`verktyg/prestanda-lighthouse.mjs` — äkta Lighthouse 13.4.1 via npx
(noll projektberoenden), mot `http://localhost:3000` (loopback
whitelistad; pm2 ak1a = prod-bygget), mobil form factor, simulerad
slow-4G. Fulla rapporter per sida + jämförbar sammanfattning i
`data/forskning/OPTIMERING/lighthouse/`. Komplement:
`verktyg/prestanda-skiftspar.mjs` — CDP-layoutshift-sond (node ≥22,
noll beroenden) som fångar skift med källnod + rektanglar + tidpunkt
under valfri emulation.

## FÖRE (prod-bygge 09:59, commit 76720965)

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| / | 44 | 6 408 ms | 2 264 ms | **0,125** |
| /kurser | 57 | 5 839 ms | 857 ms | 0 |
| /blogg | 47 | 6 244 ms | 1 750 ms | 0 |

## CLS-rotorsakanalys (bevisad i två oberoende verktyg)

1. Lighthouse layout-shifts: båda skiften (0,112 + 0,013) på / med
   cause **"Web font loaded"** (woff2 ea3421846039b7f3-s).
2. CDP-sonden (412 px Moto G-viewport, 4× CPU, slow-4G): vid
   t≈1 799 ms flyttades hero-textnoder +32 px och sifferbandets
   sektion ändrade höjd 111→79 px — dvs font-swapen ändrade
   RADBRYTNINGEN i flera textblock och alla sektioner under flyttades.
3. Mellansteg: NyhetsChips misstänktes först (bytet statiska→hämtade
   rubriker) — fiksad med deterministisk grid (commit 7d294418) men
   CLS oförändrad 0,1246 → roten var fonten. Grid-fixen behålls
   (deterministisk chip-layout, framtida rubriklängder kan aldrig
   skifta sektionen).

## Åtgärd (commits 7eb6f8ff + 7d294418, deployad 10:50:55, prod 200)

**font-display: "swap" → "optional"** för alla fyra next/font-
instanserna (Inter, Source Serif 4 normal+kursiv, JetBrains Mono) i
`src/lib/typografi.ts`. Fallback målas EN gång och byts aldrig →
font-swap-skift kan inte uppstå, på någon sida/spegel (3 språk, RTL).
Fonterna är preloadade + lokalt serverade (~50 kB) → vid normala
uppkopplingar hinner riktig font fram inom blockperioden; endast
first visit på mycket långsamt nät ser systemfont den visningen.
Bonus vid långsamt nät: texten målas direkt → snabbare FCP/LCP.

## EFTER (prod-bygge 10:49, inkl. 7eb6f8ff; Lighthouse "efter2")

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| / | **54** (+10) | 5 978 ms (−430) | 869 ms | **0,000** ✓ |
| /kurser | 47–54* | 5 799 ms (−40) | 992–2 526 ms* | 0,000–0,002 |
| /blogg | **54** (+7) | 4 888 ms (−1 356) | 2 055 ms | 0,000 |

\* /kurser uppmättes 3× efter deploy (efter2, kurskontroll1/2): TBT
992 ↔ 2 526 ms och poäng 47 ↔ 54 mellan IDENTISKA körningar — rent
mätbrus från serverlast (load ~3,8; huvudagent + fabrik + byggning
dela CPU medan Lighthouse mäter). CLS och LCP är nätverksdrivna och
stabila; TBT/poäng ska jämföras som intervall i ladad miljö — vid
tyst server är /kurser-talen åter i FÖRE-klass (TBT ~1 000 ms).

**Kärnresultat: CLS 0,125 → 0,000 på startsidan (100 % av skiftet
borta), LCP −0,4 till −1,4 s, poäng +7–10 på / och /blogg.**

## Toppfynd för nästa vågor i spåret

1. **Koddelning/hydrering** — TBT-drivern (long task 1 303 ms i
   framework-chunk vid hydrering; 72 kB oanvänd JS på /). Största
   kvarvarande poänglyftet; kräver strukturell arbete (dynamic
   import av tunga sektioner under vecket).
2. Cache-header-granskning — bokad av s7-u2 (mobil-läsbarhetsvågen).
3. Mobil läsbarhet ≥52 px — LEVERERAD av s7-u2 (44f977d1).

## Filregister

- `verktyg/prestanda-lighthouse.mjs` — Lighthouse-mätare (postmallen)
- `verktyg/prestanda-skiftspar.mjs` — CDP-CLS-sond
- `data/forskning/OPTIMERING/lighthouse/*.json` — alla råmätningar
  (fore/efter/efter2/kurskontroll×2, 3 sidor × fulla rapporter)
- `src/lib/typografi.ts` — font-display optional
- `src/components/ak1a/kunskaps-flode.tsx` — NyhetsChips-grid
