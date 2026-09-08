# STYRELSE — SPEGLAR P2 (forskning våg 82 del D, agent V82-SPEGLING 2026-09-07)

Underlag: STYRELSE-VAG82-BYGG.md §D · STYRELSE-VAG81-MEDIABIBLIOTEK.md §C
(prodverifieringens fynd) · .next-artefakter från senaste build (2026-09-07
23:28, BUILD_ID verifierad). Agenten forskar — bygger INET av detta.

## 1. SOFT-404 PÅ SPEGLARNA (dynamicParams=true = 200-skal på okända slug)

### Nuläge (uppmätt i .next/prerender-manifest.json)
- `/kurser/[slug]`: fallback **false** — våg 81-fixen lever (äkta 404, 333
  förbyggda sidor i .next/server/app/kurser).
- `/en/kurser/[slug]` + `/ar/kurser/[slug]` (+ `/en|/ar/blogg/[slug]`,
  `/analyser/[ticker]`, `/labb/[id]`, `/forskningsbiblioteket/[ticker]`):
  fallback **null** = dynamisk on-demand-generering. Sidkoden anropar
  notFound() vid okänd slug, MEN med `dynamic="force-static"` +
  dynamicParams=true når aldrig det anropet statuskoden — våg 81:s
  prodverifiering: "prod svarar 200 på allt — soft-404-fällan".
- Totalt 906 förbyggda HTML-sidor i senaste build; en/ar har 10 st each
  (nyckelsidorna). Sitemap 1 684 URL:er (endast äkta).

### Alternativ A — full generateStaticParams (333×2 = 666 extra sidor)
Byggkostnad (skalfaktor-estimat; .next/page-counts och bygglogg finns ej —
.trace:ns absoluta durations är sömn-inflaterade [next-build-span rapporterar
31 341 s] och används inte):
- Sidvolym 906 → 1 572 (+74 %). Kurssidor i build idag: 333 st; A lägger
  666 till ≈ 3× kurs-sidvolymen, ≈ +50–75 % på prerender-fasen totalt.
- Speglarna är TYNGRE än sv-sidorna: varje sida kör hamtaKursLager → upp
  till 2 Supabase-REST-anrop (6 s timeout) + events-fallback-läsning. Utan
  env i CI ⇒ tom fallback direkt (billigt); med env ⇒ 666–1 332 kalla
  REST-anrop, est. +2–8 min beroende på konkurrens.
- HTML+RSC ~40–90 kB/sida ⇒ .next växer est. +40–90 MB.
Nackdelar utöver kostnaden: (i) bryter kunddirektivet "inget förbygge —
allt live" (kurs-speglar.ts filhuvud); (ii) med dynamicParams=false blir
NYA kurser/kapitel hårda 404:or till nästa deploy; (iii) översättnings-
andelen (noindex-tröskeln 80 %) fryser vid byggtillfället — ISR 1 h
rättar efter första träff, men build-utdata visar gamla procent.

### Alternativ B — acceptera + robots/noindex-aspekter
Google:s crawler detekterar soft-404:s och behandlar dem som 404 — praktisk
skada begränsad till crawl-budget och fördröjd tid. Skydd som REDAN finns:
sitemap listar endast äkta URL:er; interna länkar pekar bara på riktiga
slug:ar; okänd slug renderar 404-UI (notFound) i 200-skalet ⇒ klassificeras
snabbt. Kvarvarande risk: oändlig URL-rymd (params-attacker) äter crawl-
budget + Search Console-brus. Kostnad 0. "Gör inget"-alternativet är
försvarbart men lämnar fällan öppen för blogg-speglarna också.

### Alternativ C — middleware/rewrite-404
src/middleware.ts finns (223 rader, matcher = allt utom statiskt). Lägg till:
matcha `/:lang/kurser/:slug` (+ `/:lang/blogg/:slug`), validera slug mot en
destillerad slug-lista — deep-courses.json är 17 MB (för tung för edge-
bundlen) men en genererad slug-modul är ~10 kB (333 slug:ar; samma destillat
som verktyg/kor-sokindex.mjs redan producerar till sok-index.json 76 kB).
Okänd slug ⇒ NextResponse med status 404 (för stylad sida: rewrite till en
icke-existerande statisk sökväg — ger 404-status + default not-found; **det
sista är en 30-min-spike att verifiera** innan sankning). Kostnad: ~1–3
ms/req i middleware, +~10 kB edge-bundle, noll byggökning. Bevarar live-
modellen helt. Risk: dubbel sanning (slug-listan) — genereras av befintligt
verktyg i build-steget, aldrig handredigeras.

### REKOMMENDATION (1)
**C** — middleware-404 mot destillerad slug-lista (täcker kurser + blogg-
speglar, noll byggkostnad, kunddirektivet "live" intakt), med B som skydd
tills C landat och en 30-min-spike som grind (rewrite måste ge äkta 404-
status + rendering). A sankas som fallback ENDAST om spiken fallerar —
då enbart för kurserna (666 sidor) och med accepterad byggökning ovan.

## 2. HTML LANG="SV" PÅ /en|/ar — rot-layouten äger <html>

### Nuläge
src/app/layout.tsx:209 äger `<html lang="sv" suppressHydrationWarning>`.
SprakLeverantor sätter lang/dir på documentElement först vid hydrering —
SSR-HTML:en (och därmed crawler-vyn) har lang="sv" på alla speglar. Speglarna
kompenserar delvis: innehållscontainern får `<div lang={lang} dir=...>`
(kurs-spegel-sida.tsx:137) och /ar-sidorna dir="rtl"; per-sida hreflang-
kluster är korrekt (spegelMetadata/kursSpegelMetadata).

### Route-group-skiss (enda App Router-mekanismen — layouten får inget pathname)
- Flytta allt svenskt + neutralt till `src/app/(huvud)/` med egen layout.tsx
  (html lang="sv"). Speglarna blir `src/app/(en)/en/…` och `src/app/(ar)/ar/…`
  med varsin root-layout (html lang="en" / lang="ar" dir="rtl"). URL:erna
  är OFÖRÄNDRADE (gruppmapparna räknas inte i sökvägen). Rot-layouten
  src/app/layout.tsx försvinner; sitemap.ts/robots.ts får ligga kvar på
  app-rot (är ej layouter).
- Lyft allt gemensamt ur dagens layout till återanvändbara bitar så ingen
  kod skrivs i tre kopior: `src/lib/typografi.ts` (de fyra next/font-
  instanserna är modul-singletons — importerade av båda layouterna) + en
  server-komponent `<GlobaltSkal lang="sv|en|ar">` (ThemeProvider,
  SprakLeverantor, Ak1aStoreProvider, Toaster, StagingBanner,
  PageViewBeacon, organisation/website-JSON-LD, de sex lazy-globalerna).

### Risklista (vad bryter?)
1. **Massflytt**: ~200+ sidfiler får ny sökväg — maximal git-churn och
   konflikt-yta MITT I våg-parallellbygget. Får köras i egen våg, ensam.
2. **not-found/error per grupp**: med flera root-layouter kräver Next egen
   not-found.tsx per grupp (annars vit/saknad 404-yta) — också verktyget
   för ev. soft-404-lösning §1C; spika utseende FÖRE flyttet.
3. **Metadata-defaults**: rot-layoutens canonical (SITE_URL) + start-
   klustrets hreflang gäller alla sidor UTAN egen metadata — en/ar-grupperna
   måste få canonical mot /en|/ar-rot, annars dubbelkanonikaler. Kartlägg
   vilka sidor som FÖLJER rot-defaulten (mest /pro, verktygssidor).
4. **Pre-paint/skript**: StagingBanner + PageViewBeacon är inline-skript i
   <body>-toppen — de följer med i GlobaltSkal; ThemeProvider
   (defaultTheme="light", enableSystem=false) sätter class vid hydrering,
   inget pre-paint-theme-skript finns idag ⇒ ingen ny flash-risk, men
   VERIFIERA att ingen grupp glömmer skal-komponenten (annars osynkat).
5. **SprakLeverantor**: skriver fortfarande imperativt till
   documentElement.lang/dir vid klientväxling — med SSR-rätt lang per grupp
   blir det redundant men ofarligt; behåll suppressHydrationWarning på
   <html> i alla tre. Testa sv↔en↔ar-växling på spegel + original.
6. **PWA/manifest + viewport + icons** är layout-meta som måste dupliceras
   korrekt per grupp (viewport-exporten i GlobaltSkal-modulen).
7. **SSG-paritet**: route groups ändrar ej routing, men kräver full
   regressionsgrind: 906 förbyggda sidor ska vara EXAKT 906 (samma uppsätt-
   ning) efter flyttet — kör next build + jämför .next/server/app-inventarie
   före/efter. + build-tid oförändrad i princip.

### REKOMMENDATION (2)
Genomför INTE i våg 82 (kontraktsenligt: forskning endast). Prioritera som
egen våg: först 30-min-spike (not-found per grupp + metadata-default-
kartläggning), sedan massflyttet enskilt med punkt 7 som grind. Skördat
värde är främst korrekt lang/dir i SSR-HTML för crawlers och skärmläsare;
tills dess ger div-lang + hreflang-klustret god kompensations-signal
(Google detekterar språk främst ur innehållet, ej html-lang).

— Agent V82-SPEGLING, AI-styrelsen AK1A (våg 82, 2026-09-07)
