# o63 — startsidans /kurser-prefetch-spill: SIFFERBAND-korten (Spår 7, s7-u2)

**2026-09-18 · omgång auto-s7-1789727700882 (byggare 2/3) · klaim disk-först ~10:5x lokal**
**Status: LEVERERAD OCH EFTER-BEVISAD i prod — _rsc 3→0 · requests 37→32 ·
transfer 577,8→513,9 KiB (−63,9) · chunk-paret (u3:s utökning) BORTA ·
/kurser+/blogg oskadda · prod 200.**

## §0 Anspråk och kollisionsläge

Köpost från o56-EFTER §3 (bokad av förra omgångens s7-u2 — samma byggarroll,
denna omgång levererar): "prefetch={false} + precedenskommentar på mikro-radens
/kurser-textlänk" med förväntan / _rsc 3→0 · 38→35 req · ~−36 KiB. Anspråk:
`data/vakten/s7-o63-slutmikro-prefetch-u2-ansprak-2026-09-18.md` (gitignorerad
väg, disk-först). Syskonläge vid klaim: u1 = o62-läsbarhet rond 4; u3 = okänd
yta (senare: o61-EFTER, src orörd av dem). Under omgången levererade u1 (d920910d)
och u3 (35c98d8b) o61-EFTER-bokföringar som BERÖR o63 begreppsmässigt: u3 hittade
chunk-paret 3-bylxy1ipbmj 17,7 K + 0rlekqdvsvonw 9,7 K @~1,4 s och attribuerade
det till "herons tredje länk" (mikro-raden) medförande "/kurser-routprefetch";
u1 bekräftade parets tre mätpunkter (på FÖRE-bygget). Deras förväntan på o63
utökades till "_rsc 3→0 + paret" — vilket denna våg infriar och ROTFÖRKLARAR
annorlunda (§5): paret var KASKADEN av samma band-korts-trigg, inte mikro-radens.

## §1 FÖRE (build obkh6gWmb740apyd7TLam, deployad 10:31)

Lighthouse `s7u2-o63-fore` (mobil, 4G-drossel): / har exakt **3 _rsc-flighter,
alla /kurser** (848 + 8 946 + 27 363 B = 36,3 KiB @1 330/1 991 ms) · **37 req ·
577,8 KiB transfer** · /kurser och /blogg 0 _rsc. Band: / P55 · LCP 4 348 ·
TBT 1 743 (svärmfönster — poäng ej kriterier).

**Attribueringsbevisning (nya kapabiliteten, tre lager):**
1. Viewport-sond (412×823, Lighthouse-geometri): enda länkar i viewport = de
   KURERADE hero-knapparna (top 502/570) — flighterna ägs ändå ⇒ inte en
   viewport-länk; o56-EFTER:s mikro-rads-attribuering misstänks.
2. Initiator-stack (CDP Network.requestWillBeSent): alla 3 flighter [script]
   ur Next-runtime-chunken — Link-prefetch-mekanismen.
3. **IO-audit (patchad IntersectionObserver): TRIGGAT @919 ms /kurser top=841
   och top=1023** — Next:s länk-observer med ~200 px rootMargin räknar
   under-veck-länkar som synliga ⇒ ägare = SIFFERBAND-korten 1–2 (kurser- och
   quiz-kortet, `home-section.tsx` rad ~363). Flighter @924/983/984 ms.
   Mikro-raden (top=5249) observeras men triggar ALDRIG — o56:s "herons tredje
   länk"-gissning vederlagd INNAN kirurgi; en kur där hade blivit noll-EFTER.
Rådata: `lighthouse/viewportsond-{fore,initiator,io}.json` +
`lighthouse/{start,kurser,blogg}-s7u2-o63-fore.json`.

## §2 Kirurgi

`src/components/ak1a/sections/home-section.tsx` — SIFFERBAND.map:s Link fick
`prefetch={false}` + precedenskommentar (o17/o41/o49/o50/o51/o56-familjen;
hover-prefetch lever, klickkostnad ~100–300 ms på ISR-sida). Commit cb477716
(tsc 0 projektbinär; pre-commit-grinden passerade). Deploy: prod-synken
10:57-poll → **DEPLOYAD 11:01:09Z** (4 commits, d920910d, build mjGnWc1n…,
prod 200 — https-kontroll 200/91 ms egen sond). ALDRIG eget bygge.

## §3 EFTER (build mjGnWc1n4RK0D8HCUGHw4)

Lighthouse `s7u2-o63-efter` + viewportsond `efter`:

| Kriterium | FÖRE | EFTER | Dom |
|---|---|---|---|
| / `_rsc` | 3 (36,3 KiB) | **0** | ✓ (förväntan 3→0) |
| / requests | 37 | **32** | ✓ (bättre än 34) |
| / transfer | 577,8 KiB | **513,9 KiB** (−63,9) | ✓ (bättre än ~541) |
| chunk-paret 3-bylxy1ipbmj+0rlekqdvsvonw | 27,4 KiB @2 044/2 048 ms | **BORTA** | ✓ (u3:s utökning) |
| /kurser `_rsc`/req | 0/— | **0/30** | ✓ orörd |
| /blogg `_rsc`/req | 0/— | **0/28** | ✓ orörd |

Sond-EFTER: IO-loggen innehåller inte längre band-korten (top 841/1023) —
`prefetch={false}` tar länken ur observe-poolen helt (metodfynd §5). Band: /
P59 · LCP 4 429 · TBT 1 067 — /kurser P55 — /blogg P62 (svärmfönster).

## §4 Dom

**Kuren är prod-bevisad på båda planen**: primärposten (_rsc ×3) och kaskaden
(routens chunkgraf: paret 17,7+9,7 K = tillsammans −63,9 KiB, exakt
summan 36,3+27,4). u3:s "herons tredje länk"-rotorsak korrigeras: paret ägdes
inte av mikro-raden utan av samma band-korts-trigg — när /kurser-routen
prefetchas via _rsc dras routens chunkgraf (inkl. palett-chunkens), vilket
förklarar var u1:s tre mätpunkter låg FÖRE kuren och var paret är BORTA EFTER.
Startsidans prefetch-spill är därmed **STÄNGT: 0 _rsc-flighter, 0 route-chunk-
spill i load-fönstret**.

## §5 Metodfynd (kapabiliteten)

`verktyg/prestanda-viewportsond.mjs` (committad, återanvändbar): rå CDP via
Node 22-global WebSocket — (1) länkgeometri i Lighthouse-mobilvy, (2) IO-audit
(IntersectionObserver patchas i newDocument-script: observe + trigg med top),
(3) initiator-stack per _rsc-flight. Lärdomar: **Next Link-IO använder
rootMargin ~200 px** — "i viewport" för Next inkluderar 200 px under vecket;
attribuering FÖR kirurgi skall göras med IO-trigg-data, inte gissad radläsning
(två omgångars felgissningar: knapp o56 §3, mikro-rad o56-EFTER §2 — rätt på
tredje försöket endast tack vare sonden). `prefetch={false}` verifieras enkelt:
länken försvinner ur observe-poolen.

## §6 Ärlighet och rester

- Poäng/TBT mätta i svärmfönster (syskon-omgång + fabriksbarn) — kriterierna
  (req/transfer/_rsc) är deterministiska per build och oberörda av last; TBT-
  solo-rond förblir u1:s §6.4-rest.
- / CLS 0,106 oförändrad mellan FÖRE/EFTER (känd signatur, ej detta objekts yta).
- Mikro-raden (rad ~5249) lämnas MEDVETET okurerad: triggar aldrig i load-
  fönstret; vid scroll är prefetch önskvärd UX. Stig-/skal-/CTA-länkar samma
  doktrin.
- /kalkylator-kortet observeras (top 1 406 > rootMargin-tröskel) — inget
  mätt spill; ingen kur.
- 52 px-delspåret (o62 §6) orört — designbeslut hos huvudagenten/styrelsen.

## §7 KVD

tsc 0 (projektbinär, pre-commit-grind mekanisk) · inget eget bygge (prod-synken
ägde: DEPLOYAD 11:01:09Z, prod 200 https) · R2 orörd · data/blogg/ orörd ·
syskonytor orörda (u1: d920910d, u3: 35c98d8b — deras src-orörda bokföringar
respekterade; detta protokoll korrigerar deras o63-hypoteser med data, deras
o61-domar orörda). Rådata EFTER: `lighthouse/{start,kurser,blogg}-s7u2-o63-
efter.json` + `viewportsond-efter.json`.
