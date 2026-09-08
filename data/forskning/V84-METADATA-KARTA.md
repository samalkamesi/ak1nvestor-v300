# V84 — METADATA-KARTA (spike, agent V84-SPIKE 2026-09-07)

Underlag: STYRELSE-VAG84-PLAN (a) steg 0(ii) + steg 2 · STYRELSE-SPEGLAR-P2 §2
risk 2-3 · Källmätning: find/grep mot src/app 2026-09-07 (78 page.tsx:
52 sv + 13 en + 13 ar; 101 api-route.ts; Next 16.1.1). Kontrakt för
flytt-agenten (steg 2): varje rad = vad som flyttas, vart, vem som äger
layout/metadata/notFound. Spike-kod (DÖD, 0 aktiva importer):
src/components/ak1a/globalt-skal.tsx + src/lib/typografi.ts.

## 0. MÄTNINGEN I KORTHET

| Grupp | page.tsx | Egen metadata | Explicit canonical | Ärver rot-default |
|---|---|---|---|---|
| (huvud) sv+neutralt | 52 | 51 | 45 | **7** (admin + hela /pro) |
| (en) | 13 | 13 | 13 | 0 |
| (ar) | 13 | 13 | 13 | 0 |

"Explicit canonical" = sidan (eller dess metadata-byggare — pageMetadata/
sidaMetadata/courseMetadata/blogMetadata/analysisMetadata/caseMetadata/
spegelMetadata/kursSpegelGenerateMetadata/bloggSpegelGenerateMetadata)
sätter `alternates.canonical` självt. Next slår ihop metadata SHALLOW per
toppnyckel: sida utan egen `alternates` ÄRVER närmaste layouts — idag
rot-layoutens (canonical SITE_URL + start-hreflang).

**Slutsats risk 3 (dubbelkanonikaler):** NOLL en/ar-sidor ärver idag.
Fartröskeln ligger på FRAMTIDA spegel-sidor + gruppens not-found — därför
MÅSTE (en)/(ar)-rot-layouterna deklarera egen default med canonical mot
/${lang}: färdig fabrik `spegelRotMetadata("en"|"ar")` i globalt-skal.tsx.
(huvud) behåller ordagrann kopia av dagens rot-metadata (`huvudMetadata()`)
⇒ /admin + /pro/**-ärven är OFÖRÄNDRAD efter flyttet (idag: canonical =
SITE_URL, dvs. startsidan — existerande egenhet, flyttet röper ej).

## 1. ROUTE-GROUP (huvud) — 52 rutter (ALLT sv + neutralt)

Källkolonn: PM=pageMetadata, SM=sidaMetadata, CM=courseMetadata, BM=blogMetadata,
AM=analysisMetadata, KM=caseMetadata, EGEN=handskriven metadata i filen,
ÄRV=ingen/saknar alternates ⇒ ärver rot-layout. "alternates" = sidans
canonical-källa. NotFound-kolumn: "global" = täcks av gruppens not-found.

| Route | Metadata | Canonical | notFound |
|---|---|---|---|
| / | SM | PM-kluster (start, harSpeglar) | global |
| /admin | ÄRV (ingen metadata) | rot-default | global (UI.noindex-region) |
| /analyser | PM | PM | global |
| /analyser/[ticker] | AM | AM | notFound() i sidkod |
| /analyser/[ticker]/[variabel] | PM | PM | notFound() i sidkod |
| /ansvar | PM | PM | global |
| /badges | PM | PM | global |
| /bibliotek | EGEN | EGEN (handskriven) | global |
| /blogg | PM | PM | global |
| /blogg/[slug] | BM | BM (harSpeglar) | notFound() i sidkod |
| /certifikat | PM | PM | global |
| /cookiepolicy | EGEN | EGEN (handskriven) | global |
| /dagens-pass | PM | PM | global |
| /fas2-ansok | PM | PM | global |
| /fas3 | PM | PM | global |
| /finansiell-policy | PM | PM | global |
| /forskningsbiblioteket | PM | PM | global |
| /forskningsbiblioteket/[ticker] | PM | PM | notFound() i sidkod |
| /kalkylator | PM | PM | global |
| /kallor | PM | PM | global |
| /konfluens | PM | PM | global |
| /kurser | PM | PM | global |
| /kurser/[slug] | CM | CM (harSpeglar) | notFound() i sidkod |
| /labb | PM | PM | global |
| /labb/[id] | KM | KM | notFound() i sidkod |
| /laroplan | PM | PM | global |
| /logga-in | PM | PM | global |
| /manifest (INFO-sida) | PM | PM | global |
| /medlemskap | PM | PM | global |
| /min-portfolj | PM | PM | global |
| /min-sida | PM | PM | global |
| /netnet | PM | PM | global |
| /nyheter | PM | PM | global |
| /om-oss | EGEN | EGEN (handskriven) | global |
| /portfolj-forskning | PM | PM | global |
| /portfoljbyggare | PM | PM | global |
| /prenumeration | PM | PM | global |
| /privacy-policy | EGEN | EGEN (handskriven) | global |
| /pro | EGEN | ÄRV rot-default (b2b-noindex) | global |
| /pro/admin | ÄRV (ingen) | ÄRV rot-default | global |
| /pro/analys | EGEN | ÄRV rot-default | global |
| /pro/klienter | EGEN | ÄRV rot-default | global |
| /pro/priser | EGEN | ÄRV rot-default | global |
| /pro/rapporter | EGEN | ÄRV rot-default | global |
| /profil | PM | PM | global |
| /rapporter | PM | PM | global |
| /superanalys | PM | PM | global |
| /topplista | EGEN | EGEN (handskriven) | global |
| /transparens | PM | PM | global |
| /upphovsratt | PM | PM | global |
| /vagfundament | PM | PM | global |
| /villkor | PM | PM | global |

Layout-ägande i (huvud): rot-layout (huvud)/layout.tsx = tunn GlobaltSkal-
wrapper (lang="sv", huvudMetadata, globaltViewport, importerar
"@/app/globals.css") + NÄSTLAD (huvud)/pro/layout.tsx flyttas OFÖRÄNDRAD
(B2B-skalet äger ej html). Rot-filerna error.tsx (26 r, use client) +
loading.tsx (10 r) + not-found.tsx (123 r) flyttas till (huvud)/ oförändrade.

## 2. ROUTE-GROUP (en) — 13 rutter (spegel, SSR-lang=en)

| Route | Metadata | Canonical | notFound |
|---|---|---|---|
| /en | EGEN | EGEN (handskrivet kluster) | global-en |
| /en/blogg | spegelMetadata | spegel | global-en |
| /en/blogg/[slug] | bloggSpegelGenerateMetadata | spegel (villkorad, se nedan) | notFound() i sidkod |
| /en/fas2-ansok | spegelMetadata | spegel | global |
| /en/fas3 | spegelMetadata | spegel | global |
| /en/kurser | spegelMetadata | spegel | global |
| /en/kurser/[slug] | kursSpegelGenerateMetadata | spegel (villkorad, se nedan) | notFound() i sidkod |
| /en/logga-in | EGEN | EGEN (handskriven) | global |
| /en/manifest (INFO-sida) | EGEN | EGEN (handskriven) | global |
| /en/medlemskap | EGEN | EGEN (handskriven) | global |
| /en/om-oss | EGEN | EGEN (handskriven) | global |
| /en/prenumeration | spegelMetadata | spegel | global |
| /en/transparens | spegelMetadata | spegel | global |

Villkorad canonical (kurs/blogg-speglar): över KOR-tröskeln (80 %) ⇒
canonical = spegelns egen URL + hreflang-kluster; UNDER tröskeln ⇒ canonical
= SVENSKA originalet, inget kluster + noindex (kurs-speglar.ts:469,
blogg-speglar.ts:333). Båda fallen sätter explicit canonical ⇒ ingen
ärvsrisk. Sidorna flyttas OFÖRÄNDRADE under (en)/en/**; dagens
en/layout.tsx ersätts av rot-layout-wrapper (se globalt-skal.tsx header).

## 3. ROUTE-GROUP (ar) — 13 rutter (spegel, SSR-lang=ar dir=rtl)

Spegelbilden av §2, samma tabell med ar/ i sökvägarna (samma metadata-
källor, samma villkorade canonical). ar/layout.tsx ersätts av rot-layout-
wrapper med <html lang="ar" dir="rtl" suppressHydrationWarning>.

## 4. APP-ROTEN EFTER FLYTTET (kvar, berörs ej av layout)

| Fil | Not |
|---|---|
| sitemap.ts, robots.ts, manifest.ts (konventionsfiler — INGA layouter) | kvar på app-rot (plan steg 2; URL:er /sitemap.xml, /robots.txt, manifest-svaret) |
| globals.css | kvar; importeras per layout ("@/app/globals.css" ×3) |
| api/** (101 route.ts) | kvar — route handlers omfattas inte av layouter |
| layout.tsx, page.tsx, error.tsx, loading.tsx, not-found.tsx, en/, ar/ | FLYTTAS/bort (atomärt — inga sidor kvar direkt under app/ utöver konventionsfiler) |

## 5. NOT-FOUND PER GRUPP — DESIGN (EJ byggd; spikas av flytt-agenten)

Mekanik (Next 16, docs not-found.js): not-found.tsx i ett segment fångar
notFound() kastat i det segmentet; rot-not-found fångar dessutom OMATCHADE
URL:er. Med flera rot-layouter (route groups) finns ingen gemensam rot —
varje grupp behöver EGEN not-found + (senare) global-not-found.js
(experimental flag `experimental.globalNotFound`) som nät:
den BYPASSAR layouter (renderar eget <html>) och är Next:s dokumenterade
svar på "multiple root layouts"-fallet.

Design (språk-rätt 404 per grupp):

1. **(huvud)/not-found.tsx** = dagens src/app/not-found.tsx flyttad
   OFÖRÄNDRAD (sv marin-panel, KursForslag-fuzzy, robots noindex, metadata
   i filen). Täcker: notFound() i (huvud)-sidor + alla OMATCHADE toppnivå-
   URL:er (/xyz — (huvud) är prefixlös och blir träff-ytan).
2. **(en)/not-found.tsx + (ar)/not-found.tsx** — NYA, samma marin-panel-
   design översatt: 404-rubrik/brödtext/NAV_KORT på en/ar (handskrivna
   strängar, mönster som spegel-sidorna), länkkort → /${lang}, /${lang}/
   kurser, /${lang}/logga-in; hreflang-rens: ingen canonical (noindex
   räcker — Next injicerar robots noindex automatiskt på 404-status).
   dir="rtl" ärvs av (ar)-rot-layoutens <html>. Täcker: notFound() i
   spegel-sidor + OMATCHADE /${lang}/xyz.
3. **KursForslag-anpassning (rörs EJ av flyttet — noteras som skuld):**
   komponentens slug-match `^/kurser/…` träffar inte /en|/ar/kurser/… ⇒ på
   spegel-404:ar blir förslagen []. Fix i efterföljande våg: bredda regex
   `^\/(en\/|ar\/)?kurser\/` + behåll språkprefix i förslag-länkarna.
4. **error.tsx + loading.tsx per grupp:** rot-error/loading flyttas till
   (huvud)/; (en)/(ar) får KOPIOR i v1 (sv texter acceptabla — fel-/ladd-
   ytor är noindex-zoner; översättning = frivillig förbättring efter
   906=906-grinden). OBS: error.tsx är "use client" + window-/localStorage-
   referenser — kopia, ingen delning via GlobaltSkal (server-komponent).
5. **Äkta 404-status:** statiskt genererade sökvägar ⇒ 404-statuskod;
   force-static-dynamiska spegel-slugar förblir soft-404 (200-skal) —
   det är SPEGLAR-P2 §1:s separata middleware-spår (alt C), INTE detta
   flytts; not-found-gränserna ändrar inget där.
6. **Verifikation (flytt-agentens lokal-test innan deploy):** /xyz ⇒ sv-
   404 i (huvud)-skal; /en/xyz ⇒ en-404 med lang="en" i SSR-html; /ar/xyz
   ⇒ ar-404 dir="rtl"; curl -I ⇒ 404 på alla tre (ej 200).

## 6. SPIKE-KODENS STATUS (deploybar, död)

- src/components/ak1a/globalt-skal.tsx — GlobaltSkal (html+lang/dir+
  suppressHydrationWarning, body+fonts, StagingBanner, PageViewBeacon,
  JSON-LD per språk, ThemeProvider, SprakLeverantor/SpegelSprakLeverantor,
  Ak1aStoreProvider, Toaster, 6+2 lazy-globaler) + globaltViewport +
  huvudMetadata() + spegelRotMetadata(). 0 aktiva importer.
- src/lib/typografi.ts — de fyra next/font-singletonerna + typografiKlasser
  (exakta kopior ur layout.tsx:25-58,210-212). 0 aktiva importer.
- Beteendeförändring: INGEN — ingen aktiv rutt importerar dem; tsc-basen
  35 ⇒ 35 (verifierat). Build körs ej av spiken (main äger grinden).

— Agent V84-SPIKE, AI-styrelsen AK1A (våg 84, 2026-09-07)
