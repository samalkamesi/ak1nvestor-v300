# o75 — Prestanda: /ar + /en-speglingarnas prefetch-spill ("/ar-resten" ur o61 §5.3:s kö)

**Ägare:** fabriksagent s7-u1 (byggare 1/3) · **Datum:** 2026-09-19
**Status: KUR LEVERERAD (commit 6f7482da, tsc 0 projektbinär) — EFTER
väntar prod-synkens deploy (o66/o71-precedensen); kriterier i §4.**
· Anspråk (disk-först 22:39Z, FÖRE mätstart):
`data/vakten/s7-o75-ar-en-prefetch-u1-ansprak-2026-09-19.md`

## §0 Objektval

o61 §5.3:s kö-rad "/ar-resten": /-sidans prefetch-spill stängdes av
o49–o63 (senast o63: _rsc 3→0, transfer −63,9 KiB), men de två SSR-
speglingarna `/ar` + `/en` bar samma mönster okurerat — ~18 `<Link>` per
spegel till tunga svenska verktygsrutter (/kurser ×5, /kalkylator,
/superanalys, /portfoljbyggare, /netnet, /konfluens, /vagfundament …)
samt hero-CTA till {språk}/logga-in. Ingen `prefetch` fanns någonstans i
filerna vid anspråkstillfället (grep-kontroll). Duplikatkontroll: inga
*o75*/*ar*/*en*-prefetch-filer i OPTIMERING (ls 22:39Z, o74 högst).
Lämnade åt andra: react-trädbantning (o45 §1 — huvudagentens strukturella
yta), §6.1 SSR-preload, lager-lazy per yta (s6-buntan), CLS 0,106
(lastartefakt-hypoes; solo-rondens CLS 0 ×3), /blogg drift-sondering.

Metodfynd under fönstret (ärligt bokfört): första byggstatuskontrollen gav
falskt alarm — `pgrep -f 'next build|npm ci'` matchade DEN EGEN bash-
wrapperens argv (mönstertexten bars av sondkommandot själv) = exakt
F2-klassen från o64. Omkontroll med släktexkludering via /proc-visning:
INGA byggprocesser; senaste deploy gårdagen 22:31:00Z (BUILD_ID
5AotUdlvjeJdi4jmPz1qL, /tmp/synk-build.log mtime stämmer). Mätfönstret
var rent från första mätningen.

## §1 FÖRE-mätning (bygge 5AotUdlvjeJdi4jmPz1qL, 22:4xZ)

Fönstret: load 1,67 fallande, RAM-grind GRÖN (1 726 MB tillgängligt),
ingen parallell Lighthouse (processvisning med släktexkludering), ISR
triggad ×2 + 8 s (svar 8–10 ms = varm). Loopback enligt regeln.

`node verktyg/prestanda-lighthouse.mjs s7u1o75fore /ar /en`:

| Sida | Poäng | LCP | TBT | CLS |
|---|---|---|---|---|
| /ar | **68** | 4 528 | 613 | 0 |
| /en | **79** | 4 483 | 259 | 0 |

Rådata: `lighthouse/{ar,en}-s7u1o75fore.json` + sammanfattning.
(total-byte-weight 552/550 KiB.)

## §2 Attribuering — viewportsonden (o63:s standardinstrument)

`node verktyg/prestanda-viewportsond.mjs s7u1o75fore-{ar,en} <url>` —
IDENTISK bild på båda speglarna:

| Flight | /ar | /en | Triggare |
|---|---|---|---|
| {språk}/logga-in ×3 | 663 + 9 162 + 2 860 = 12 685 B | 663 + 8 875 + 2 610 = 12 148 B | hero-CTA top 524/586, TRIGGAT @928/873 ms |
| /kurser ×3 | 657 + 8 891 + 27 472 = 37 020 B | dito 37 020 B | hero-knapp top 592/654 + band-kort top 989/1093 (×2), TRIGGAT @~930 ms |
| **Summa** | **49 705 B ≈ 48,5 KiB** | **49 168 B ≈ 48,0 KiB** | 6 flygningar per kall entré |

IO-loggen visar dessutom ~25 länkar OBSERVERADE (Next:s länk-IO med
rootMargin) — vid scrollning triggar varje sektionskort prefetch av hela
tunga verktygsbuntar (kalkylator/superanalys/portfoljbyggare/…) som få
läser. Headern /logga-in-länk (top=2) stod UTANFÖR observer-poolen och
ägde ingen flight — seo-page-shell orörd behovs ej.

## §3 Kuren (commit 6f7482da)

`prefetch={false}` + precedenskommentar på samtliga 7 länkställen per
spegel (`src/app/(ar)/ar/page.tsx` + `src/app/(en)/en/page.tsx`, enbart
Write/Edit enligt fabriksregeln):

1. Hero-CTA {språk}/logga-in (o17/o41/o49-familjen)
2. Hero-knapp /kurser (o50 §2 multiomgångs-mönstret)
3. BAND-map (o63-bandmönstret — kort 1–2 inom rootMargin)
4. Vision-länk {språk}/medlemskap
5. SEKTIONER-map (15 djuplänkar; scroll-spill)
6. Slut-CTA {språk}/logga-in
7. Mikro-raden /kurser (o63:s tveksam-länk)

Hover-prefetch lever kvar (Next-beteende vid prefetch={false}) — UX vid
verklig intent oskadd. tsc 0 FEL via projektbinär
(`node node_modules/typescript/bin/tsc --noEmit`); pre-commit-grinden
passerad mekaniskt.

## §4 EFTER (pending deploy — prod-synken äger bygget)

Kriterier: (a) _rsc-flygningar → 0 vid kall entré på /ar + /en
(viewportsond) (b) Lighthouse-transfer/-vikt minskar motsvarande ~48 KiB
(c) prod 200 ×2 på https (d) Lighthouse i jämförbart lastfönster (ingen
parallell Lighthouse, inget byggfönster — deklarerat). Utförs av mig om
fönstret räcker, annars nästa våg (o66/o71-precedensen).

**Deploystatus 22:47:19Z:** synkens poll SEDE kuren (HEAD effb9429) men
RAM-grinden vägrade: "VÄNTAR-RAM: 1 505 MB tillgängligt (< 2 500 = 2 200
bygg + 300 reserv; 1 zcode-barn)" — o63-agentens identiska läge 2026-09-18
(deras kur åkte med i syskonens deployfönster 40 min senare). Nytt försök
var 10:e minut; HEAD orört. Observation åt drift-spåret (inte min yta):
synkens loggrad bär datumet 2026-09-18 vid realtid 2026-09-19 —
tidsstämpelbugg i prod-synk.mjs (dagens rader är oskiljbara från gårdagens
i grep; rad-ordning + innehåll skiljer dem).

## §4b EFTER-VÄNTESTATUS + PROD-500-FYND — 2026-09-19 05:12–05:2xZ (s7-u2 fn2)

**FYND ÄN VIKTIGARE ÄN KRITERIET: /ar + /en svarar 500 på prod** (https
+ localhost, verifierat ×4 curl 05:12–05:16Z). Rot: `ChunkLoadError:
Failed to load chunk server/chunks/ssr/_0802uae._.js — Cannot find
module` (pm2 fellogg; stack via app/(ar)/ar/blogg/[slug]/page.js →
turbopack-runtime lazy-chunk). **Orsak: prod-synkens fyra OOM-döda
byggen 03:19–05:09Z har lämnat .next halvtrasigt** (BUILD_ID raderad,
en del SSR-chunkar borta; flertalet sidor lever — deras chunkar finns
kvar — men ar-familjens lazy-chunkar saknas → 500). Kuren = prod-
synkens nästa FULLT genomförda bygg + pm2-restart; ALDRIG eget bygge
(våg 100). Eskalering: worklog-rad + detta protokoll; gränsnitts-
vakten/chrome-cron + fabriksbarn tryckte RAM hela fönstret (grunder
2 500–4 124 MB, tillgängligt 350–2 961 MB, poll 05:17Z vägrade vid
2 961 < 3 524).

Kriterierna (a) _rsc→0 (sond) och (b) transfer −48 KiB kan INTE mätas
mot sidor som 500:ar; (c) prod 200 ×2 på speglarna = just nu FAIL av
ovanstående infraorsak, ej av kuren (kuren lever i trädet — se o76 §4:s
deploy 23:43Z som bar 6f7482da till prod; prod-HTML-hash-bevis 28yatov).
(d) jämförbart fönster: Lighthouse SEQ kördes men speglarna gav
"Runtime error: … (Status code: 500)".

**NÄSTA VÅG (exekveringsorder):** 1) vänta in prod-synkens lyckade
bygg (RAM-fönster öppnar när chrome-cron/fabriksbarn avslutar); 2)
verifiera /ar /en = 200; 3) kör `node verktyg/prestanda-o75o76o77-efter.mjs`
(fas 0 kräver `.next/BUILD_ID` — återskapad av lyckat bygg; OBS
verktyget mäter även o76/o77 som redan är dömda — o76 §4 negativ,
o77 §5b GRÖN — bär endast o75-kriterierna (a)(b)(c) vidare).

## §5 Rest + läxor

- LCP ~4,5 s på speglarna delar /-sidans strukturägarskap (hero-rendering
  + hydratisering) — huvudagentens yta, berörs ej här.
- Spegel-sidorna /en/*, /ar/* underrutter (blogg/kurser-speglar) bär
  Link-ytor som kan ha samma mönster — kartläggs vid nästa rond om
  mätvärt (samma sond, 5 min).
- F2-läxan BÄRS VIDARE (o64): processgrindar med pgrep SKALL köra
  släktexkludering — första egna kontrollen föll i exakt den dokumenterade
  fällan denna rond.
