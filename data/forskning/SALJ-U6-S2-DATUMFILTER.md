# SALJ-U6 S2 — Bloggens framtidsläckage stoppat (publishedAt-filter)

**Datum:** 2026-09-29 · **Fabriksagent:** S2 (BYGGARE) · **Karta:** SALJ-KARTA-2026-09-29.md rad A2 (prioritet A — "ska vara fixat före säljstart")

## Före — läget som kartan bevisade

8 Q3-granskningar låg i `data/blogg/` med `publishedAt` 2026-10-05 → 2026-10-21 och
var **helt publika på prod** (lista + detaljsidor HTTP 200, "senaste 2026-10-21"
syns på sajten). Orsak: `getBlogPosts()` i `src/lib/content.ts` läste ALLA filer i
`data/blogg/` och sorterade bara på datumet — inget-filter, inget jämförande
mot "idag". Trovärdighetsläckage inför säljstart + kommande innehåll läckt
före rapportdatum.

De 8 läckande (inventerade 2026-09-29):

| slug | publishedAt |
|---|---|
| sa-laser-du-industrivarden-q3-2026 | 2026-10-05 |
| sa-laser-du-ericsson-q3-2026 | 2026-10-13 |
| sa-laser-du-goldman-sachs-q3-2026 | 2026-10-13 |
| sa-laser-du-nordea-q3-2026 | 2026-10-13 |
| sa-laser-du-sandvik-q3-2026 | 2026-10-19 |
| sa-laser-du-skf-b-q3-2026 | 2026-10-19 |
| sa-laser-du-evolution-q3-2026 | 2026-10-20 |
| sa-laser-du-holm-q3-2026 | 2026-10-21 |

## Åtgärd — EN punkt i källagarlagret

`src/lib/content.ts`:

1. **`bloggDagensDatum()`** — dagens datum som `YYYY-MM-DD` i **Europe/Stockholm**,
   läst **vid anropet** (= render-/ISR-tid, inte byggtid). sv-SE:s kortform är exakt
   ISO; alla 94 befintliga `publishedAt` har samma form ⇒ lexikal jämförelse är korrekt.
2. **`bloggArPublicerad(post, idag?)`** — `publishedAt <= idag`, dag-granulärt,
   **dagens datum inklusive** ("publicerad idag" är publicerad). Ogiltigt datumformat
   ⇒ `false` + larm i pm2-loggen — **fail-closed**, samma filosofi som kf1: tydligt
   larm, aldrig tyst läckage.
3. **`getBlogPosts(opts?)`** — filtrerar bort framtidsdiskade som standard. Option
   `inkluderaFramtida: true` ENBART till `generateStaticParams` (se beslut 2).

Eftersom ALLT publikt äter via `getBlogPosts()`/`getBlogPost()` täcker en punkt
alla ytor:

| Yta | Läckage före | Efter |
|---|---|---|
| `/blogg` (lista, sv) | 8 framtidskort + "senaste 2026-10-21" | 86 publika, senaste 2026-09-24 |
| `/en/blogg` + `/ar/blogg` (spegellistor) | samma 8 kort | samma 86 |
| `/blogg/[slug]` (sv detalj) | 200 på framtida slug | **404** (se beslut 1) |
| `/en|ar/blogg/[slug]` (spegeldetaljer) | 200 | **404** |
| `sitemap.ts` (blogg-URLer + 110 spegel-URLer) | framtida URLer deklarerade | borta |
| `/api/llms-txt` (`buildLlmsTxt`) | framtida rader | borta |
| "Läs också"-moduler (related) | kunde länka framtidsinlägg | bara publicerade |
| `/api/chatbot` + `/api/cron/seo-refresh` (antal) | räknade 94 | räknar 86 (korrekt semantik: "antal publicerade") |

**Admin orörd:** bloggpanelen läser utkast från Supabase via `src/lib/blogg-utkast.ts`
— INTE `getBlogPosts()` — så schemalagda inlägg försvinner aldrig ur redigeringsytan;
publiceringsflödet (export → fil-drop i `data/blogg/` → commit) är oförändrat.
**Statisk `public/llms.txt`:** kontrollerad 2026-09-29 — innehåller INGA framtidsslugs
(genererad före dem); den dynamiska rutten täcks av filtret.

## Två motiverade beslut

**1. Detaljsidor: GÖMDA (404), inte kvar-200.** Kartan tillät båda; valet faller på
404 via befintligt `notFound()`-mönster (våg 81: "äkta 404", `dynamicParams=false`)
av tre skäl: (a) konsistens — speglarna (en/ar, `dynamicParams=true`) har redan
`notFound()` som okänd-slug-svar, så EN semantik för alla sex detaljrutter; (b) en
redirect mot `/blogg` bekräftar indirekt att URLen finns och ger soft-404-problematik
i sök (våg 81:s systemfynd var exakt HTTP 200 + 404-innehåll); (c) ärlighet —
inlägget finns inte för publikt än, då ska servern säga det. 404 snor också URLen
ur sökindex snabbast.

**2. `generateStaticParams` behåller ALLA slug:ar (även framtida).** Sidplatsen vid
bygget + `getBlogPost ⇒ null ⇒ notFound()` i renderingen ger: schemalagt inlägg =
404 idag, och **vakar till live av sig självt** vid nästa ISR-omrendering
(`revalidate = 3600`) när publiceringsdagen kommer — utan nytt bygge. Vore
framtidsslugs:arna uteslutna ur params (med `dynamicParams = false`) krävdes en
deploy per publiceringstillfälle. Begränsning dokumenterad: byggtids-404:or lever i
ISR-cachen tills omrendering — värsta fallet blir första besökaren efter midnatt
serverad en stale 404, därefter live (revalidate binder force-staticens årslås
enligt o10 §2-kommentaren i ruttfilen).

## Efter — bevismätning

Nod-test `verktyg/testa/blogg-datumfilter.mjs` kör den **riktiga modulen**
`src/lib/content.ts` (Node ≥ 22.6 `--experimental-strip-types`, ingen logikkopia)
mot riktiga `data/blogg/*.json`, med kartans exempel `sa-laser-du-holm-q3-2026`
(2026-10-21) som känt framtidsfall. Resultat 2026-09-29 — **13/13 PASS**:

- `bloggDagensDatum()` ⇒ "2026-09-29" (ISO-form, svensk tidszon)
- kartans ex: **inte** publicerat idag; **inte** publicerat "2026-10-20"
  (dagen innan); **live** på "2026-10-21" (egen dag, inclusive)
- dagens datum räknas som publicerat samma dag (dag-granularitet)
- ogiltiga format ("13/10-2026", "") döljs UTAN kast (+ larmrad i loggen)
- publika listan 86 = alla 94 − 8 framtida; inget framtidsslug läcker;
  alla kvarvarande datum ≤ idag
- `getBlogPost("sa-laser-du-holm-q3-2026")` ⇒ `null` (⇒ notFound på rutten);
  publicerat slug ⇒ inlägg

Återkörning: `node --experimental-strip-types verktyg/testa/blogg-datumfilter.mjs`

## KVD

- `node node_modules/typescript/bin/tsc --noEmit` ⇒ **exit 0, 0 fel** (baslinjen hållen).
- Nod-test: 13/13 PASS (ovan).
- **Deploy-kvito väntar** — ärligt: jag bygger INTE (fabriksregeln; byggen ägs av
  prod-synken under `/tmp/ak1a-deploy.lock`). Läckaget lever i prod tills nästa
  deploy av develop — därefter: `/blogg` visar 86 inlägg, `/blogg/sa-laser-du-holm-q3-2026`
  ⇒ 404, sitemap/llms.txt utan framtidsslugs. **ROTKÖ: verifiera med
  `curl -s https://lab.ak1nvestor.com/blogg/sa-laser-du-holm-q3-2026 -o /dev/null -w "%{http_code}"`
  efter deploy (förväntat 404, inte 200).**
- Känd restrisk (accepterad, utanför uppdraget): statiska OG-bilder för framtids-
  inlägg kan ligga kvar under `public/og/blogg/<slug>.png` — ostrukturerad tillgång
  kräver känt slug, länkas ej från någon yta; og-genereringen körs per publiceringsvåg.

## Filer

- `src/lib/content.ts` — datumhjälpare + filter i `getBlogPosts` (ENDAST Write/Edit använt).
- `src/app/(huvud)/blogg/[slug]/page.tsx` — `generateStaticParams` med `inkluderaFramtida` + motivering.
- `verktyg/testa/blogg-datumfilter.mjs` — bevistest (återkörbart).
- `data/forskning/SALJ-U6-S2-DATUMFILTER.md` — detta protokoll.
