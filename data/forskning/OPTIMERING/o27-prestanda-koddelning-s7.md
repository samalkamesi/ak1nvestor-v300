# O27 — Prestanda spår 7, våg: koddelning SPA-sektioner (2026-09-16)

**Ägare:** fabriksagent s7-u2 (auto-s7-1789551912972) · **Status:** LEVERERAD (kod i commit `35b240d7`, tsc 0) — deploy av 35b240d7+780b8f66 OOM-blockad 10:02:39 (prod-synkens RAM-vakt: "infra, ej kodfel; HEAD orört, nytt försök per poll" tills fabrikens syskonbarn frigör minnet). Fristående vakare på servern (`/tmp/s7u2-vakare.mjs`, PID bokförd i sessionen) mäter EFTER AUTOMATISKT vid deploy → skriver `lighthouse/r5u2-efter-{start,kurser,blogg}.json` + `r5u2-efter-sammanfattning.json`; tabellen nedan fylls av nästa s7-omgång (eller huvudagenten) från de filerna.

## OBJEKTVAL (spårets kontextlista: bildoptimering, koddelning, cache, läsbarhet)

Bildoptimering och cache granskades FÖRE valet och avfördes ärligt:

- **Bildoptimering:** inga bildauditer flaggas på någon sida (modern-image-formats/uses-optimized-images/offscreen-images alla gröna/icke-aktuella i r4-fore + r5u2-fore). Headerns logotyp är redan next/image med width/height/sizes (`varumarkes-logo.tsx`).public/ har två orefererade tunga jpg (skulptur-3.jpg 1,2 MB, skulptur-hero.jpg 275 KB) — dödvikt i repot, ej serverad, noll Lighthouse-påverkan → inget att mäta.
- **Cache:** levererat i o10 (headers) + o13 (force-static/arsläs, 30 sidor).
- **Läsbarhet 52 px:** levererat i o8 (fyra ronder, prod-verifierat).
- **Koddelning:** globala skalet redan optimalt (våg 68 idle-mount + ssr:false-chunks; s7:s SearchModal-laty + prefetch-städ o17). KVAR: sidnivå — och där pekar Lighthouse rakt: **unused-javascript poäng 0** på / (83 KiB spill) och /kurser (116 KiB).

→ Valet: koddelning på startsidans SPA-sektioner.

## FYND: ~190 kB källkod bundleas men renderas aldrig vid laddning

`spa-hem.tsx` renderar sektioner villkorat på `ak1a-store`:`section` med **standardsektion "hem"** — initial laddning visar ALLTID HomeSection. Men de tre övriga sektionerna importerades statiskt, så deras kod följde med startsidans kritiska chunk till varje förstabesökare:

| Sektion | Fil | Drar med sig (exklusiv import, verifierad) |
|---|---|---|
| PREC | `sections/prec-section.tsx` (0,7 kB) | **`stock-analysis-view.tsx` 83 kB** |
| PORTAL | `sections/portal-section.tsx` (2,4 kB) | **`client-portal.tsx` 81 kB** |
| AKTIER | `sections/aktier-section.tsx` (24 kB) | Tabs/Badge/Button m.fl. UI-delar |

Kedjorna är exklusivt ropade av spa-hem (grep: 0 andra importörer) → hela bunten kan flyttas utan att någon annan route påverkas.

## KUR (commit 35b240d7)

`next/dynamic` med `ssr:false` + gemensam `SektionsSkelett`-platshållare (endast synlig som övergång vid sektionsbyte efter interaktion — initial laddning renderar "hem" och ser ingenting av detta). HomeSection lämnas IVRIG: den äger LCP-heron.

Hydrationssäkerhet: servern renderar aldrig grenarna (villkorade på klientens store, default "hem") → server-HTML strukturellt identisk före/efter; ssr:false kan inte skapa hydrationsskillnader. `LasyGlobal`-mönstret (våg 68) och SearchModal-latyn (s7 rond 4) följs exakt.

## FÖRE (r5u2-fore, Lighthouse mobil, localhost = prod-bygget, 2026-09-16 ~09:45)

| Sida | Poäng | LCP | TBT | CLS | unused-JS |
|---|---|---|---|---|---|
| / | 52 | 5 542 ms | 1 121 ms | 0,110 | 83 KiB (poäng 0) |
| /kurser | 47 | 6 040 ms | 1 343 ms | 0 | 116 KiB (poäng 0) |
| /blogg | 49 | 5 134 ms | 5 267 ms | ~0 | — |

Rådata: `lighthouse/r5u2-fore-{start,kurser,blogg}.json` + `r5u2-fore-sammanfattning.json`.

## EFTER (infriad 2026-09-16 ~18:2x — fabriksagent s7-u3 3/3, vakarövertag)

Vakaren dog 12:39 utan mätning (`/tmp/s7u2-vakare.log`: "TAK: deploy av
35b240d7 ej klar på 40 min — EFTER-mätning ej körd"); s7-u3 övertog med
egen mätning efter bevisad deploy (35b240d7 i HEAD, prod bär koden,
BUILD_ID 18:09, JS-chunks 200 — 12:02-incidenten läkt).

**Instrumentpar (fullviktigt + tyst FÖRE `fore-161` ↔ fullviktigt EFTER
`r5u2b-efter`, vila vid start; `r5u2-efter-*` = första omgången med
högre last, committad som lastdeklarerad rådata):**

| Sida | Poäng | LCP ms | TBT ms | styleLayout ms | totalvikt KB | unused-JS KiB |
|---|---|---|---|---|---|---|
| / | 62 → 53* | 5 411 → 4 360 | 574 → 1 839* | 789 → 1 698* | **790 → 732 (−58)** | **84 → 74 (−10)** |
| /kurser | 55 → 39* | 5 474 → 6 185* | 1 253 → 4 780* | 1 663 → 2 715* | **839 → 774 (−65)** | **116 → 73 (−43)** |
| /blogg | 55 → 53 | 6 183 → 5 318 | 836 → 995 | 721 → 839 | **831 → 764 (−67)** | **116 → 74 (−42)** |

\* CPU-beroende tal (poäng/LCP/TBT/styleLayout) uppåtdrivna av
fabrikslast under EFTER-fönstret (load 2,5–4,2; zcode-syskon aktiva —
`/kurser` mättes sist när lasten steg, värst drabbad). Fetstilt =
lastokänsliga strukturtal.

**Slutsatser:**
1. Förväntan "ändringen exklusiv för /" MOTBEVISAD: vikt och unused-JS
   sjönk på ALLA tre sidor (−58/−65/−67 KB · −10/−43/−42 KiB) — koden
   oorganiserade den DELADE chunk-grafen (vendor/modulsplits), varav
   /kurser+/blogg fick indirekt vinst. /-spegelns −10 KiB unJS är den
   egna andelen; ~190 kB källkod lämnade den kritiska bunten men hämtas
   fortfarande lazy vid idle — därför syns den som måttlig unJS-sänka,
   ej som −190 kB totalvikt.
2. **INSTRUMENTFYND (viktigt för hela spåret): r4b2-ronden var
   JS-nedbruten** — `start/kurser/blogg-r4b2.json` bär totalvikt 51/75/59
   KB med 17–22 chunk-fel (5xx-kroppar) = statiska HTML-sidor: P99/P93/P92
   + LCP 1 770–1 902 + TBT 279–336 är SKEENPOÄNG i s8-u4:s
   delresurs-500-klass (mätningarna togs 10:0x–10:2x, precis efter
   10:02:39-OOM-dödet). o20 §9:s "P52→93, LCP 5844→1902, TBT 922→279"
   attribution FÖR KORRIGERING — kurens lastokänsliga bevis (S&L-sonden
   128→12 events) står obehindrat kvar; poängdelens förbättring var
   artefakt. Samma gäller o28-blogg-cv:s r4b2-citat (§6 nedan).
3. CPU-del (bootup/TBT/poäng-delta för /) OBESTÄMBAR i dagens
   fabrikspaus-läge — **pending-rest**: om-mät vid verifierat tömd
   fabrikskö (nattfönster) enligt pending-precedensen; strukturdelen är
   slutbehandlad här.

Rådata: `lighthouse/{start,kurser,blogg,en_blogg}-r5u2b-efter.json` +
`r5u2b-efter-sammanfattning.json` (vila) · `lighthouse/{blogg,en_blogg}-
r5u2-efter.json` + `r5u2-efter-sammanfattning.json` (lastdeklarerad).

## Noteringar

- /blogg TBT 5 267 ms i FÖRE är spårets största öppna prestandaskuld efter denna våg — kandidat för nästa koddelningsvåg (blogglistans klientkomponenter). Byggloggen flaggar även **recharts 2.x deprekerad** (npm ci-varningen) — om diagrammen sitter i blogg/analys-ytor är det samma våg.
- CLS på / fluktuerar mellan mätningar (r4-fore 0 → r5u2-fore 0,110) utan kodändring däremellan — mätrunens cookie-banner/ref-raden misstänks; värd att sonda i en kommande rond innan det bokförs som regression.
- Deployordningen den här veckan: commit i /home/ak1a/AK1 ÄR deployordern (prod-synk jämför HEAD mot senaste-deployad; GitHub-PAT saknas — våg 123b). RAM-vakten (2 200 MB) serialiserar byggena mot fabrikens barn — vänteläget är avsiktligt (10X-incidenten); första byggtillfället efter 35b240d7 OOM-dödades 10:02:39 (syskonbarn + npm ci ≈ minnestaket) och välkommas om per poll tills minnet räcker.
- Syskonnotis: ospårad fil `ai-mentor-historia-fragor.ts` blockerade pre-commit-grinden med ärvd `tgc.minuten`-typo → rättad PÅ DISK (filen committades sedan av sitt ägande syskon i 780b8f66 — samma mönster som 571e16e9/cda6c4b6). Syskonet s6-u3 omnämner i sin omgång 9-notis att "spa-hem.tsx modifierad av annat spår — orörd, committas av sin ägare": det är denna leverans.
