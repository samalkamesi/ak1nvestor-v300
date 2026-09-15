# O5 — Lighthouse-baslinje + CLS-fix nyhetschips (spår 7, 2026-09-15)

Fabriksagent s7-u3 (auto-s7-1789459519359). Postmallen för spåret är
"mät före/efter (Lighthouse), deploy, prod 200, mätning bokförd" —
detta dokument är bokföringen.

## Metod

`verktyg/prestanda-lighthouse.mjs` — äkta Lighthouse 13.4.1 via npx
(noll projektberoenden), mot `http://localhost:3000` (loopback är
whitelistad i middleware; pm2 ak1a = prod-bygget), mobil form factor,
simulerad 4G-drossel (reproducerbart). Fulla rapporter per sida + en
jämförbar sammanfattning ligger i `data/forskning/OPTIMERING/lighthouse/`.

## FÖRE (prod-bygge 2026-09-15 09:59, commit 76720965)

| Sida | Poäng | LCP | TBT | CLS | FCP | SI |
|---|---|---|---|---|---|---|
| / | **44** | 6 408 ms | 2 264 ms | **0,125** | 1 571 ms | 4 441 ms |
| /kurser | **57** | 5 839 ms | 857 ms | 0 | 1 559 ms | 4 003 ms |
| /blogg | **47** | 6 244 ms | 1 750 ms | 0 | 1 499 ms | 4 248 ms |

(FCP/SI ur fulla rapporter; total vikt / = 759 kB — nätet är INTE
flaskan, exekveringen är det.)

## Toppfynd (ur FÖRE-rapporterna)

1. **CLS 0,125 på /** — roten: `NyhetsChips` (kunskaps-flode.tsx)
   SSR:ar tre statiska kunskapsrubriker,byter till API-hämtade
   nyhetsrubriker i `useEffect`; flex-wrap-chips med rubriker upp till
   90 tecken → radantalet varierar → sektionerna under skiftar.
   Lighthouse attribuerar skiften (0,112 + 0,013) till `bg-muted/30`-
   sektionerna under.
2. **TBT 2 264 ms / bootup 3,9 s / mainthread 7,5 s på /** — en enda
   long task på 1 303 ms (framework-chunk 3tc9l_yj-kftz.js) + 72 kB
   oanvänt JS. Nästa vågs högsta avkastning: koddelning/hydrering.
3. Bilder: INGA fynd (modern-image-formats, offscreen, optimering —
   allt grönt); /kurser och /blogg har CLS 0 — felet är isolerat till
   startsidans nyhetschips.

## Åtgärd denna våg (commit 7d294418)

NyhetsChips-chippen: flex-wrap → **deterministisk grid** (1 kol mobil /
2 kol sm / 4 kol lg) med `truncate` per cell — radantalet per
brytpunkt är konstant oavsett rubriklängd; nyhetsbytet kan aldrig ändra
sektionens höjd. Visuellt: jämnbredda pill-cells i samma gold-stil.

## EFTER (mäts när prod-synken byggt commit 7d294418)

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| / | _väntar deploy_ | | | |
| /kurser | _väntar deploy_ | | | |
| /blogg | _väntar deploy_ | | | |

Byggen ägs av prod-synken (fabriksregeln) — EFTER-raden fylls i av
mätning `node verktyg/prestanda-lighthouse.mjs efter` + jämförelse
`LH_JAMFOR=fore`.

## Nästa vågor i spåret (rekommenderad ordning)

1. Koddelning/hydrering (TBT 2,3 s → största poänglyftet).
2. Cache-header-granskning (uses-long-cache-ttl granskas i nästa mätning).
3. Mobil läsbarhet ≥52 px-target (touch-ytor — ej mätt av Lighthouse).
