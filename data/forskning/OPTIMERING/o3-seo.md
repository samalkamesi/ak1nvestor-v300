# O3 — SEO/AI-SYNLIGHET: MÄTNING & TOPP-10 (MEGA-OPTIMERING FAS A)

**Datum:** 2026-09-05 · **Ägare:** SEO-granskaren · **Worklog:** VÅG 63 O3 · INGET committat
**Källor:** src/app/sitemap.ts, robots.ts, layout.tsx, src/lib/seo.tsx, spegel-metadata.ts,
verktyg/kvalitetsvakt.mjs + data/rapporter/kvalitetsrapport-SENASTE.md, public/llms.txt,
data/blogg/*.json, data/forskning/ORGANISK-TILLVAXT-PLAN.md. Alla tal självräknade.

---

## 1. NULÄGESMÄTNING

### 1.1 Sitemap vs faktiska rutter
- **Sitemap: 887 URL:er** = 60 statiska + 333 kurser + 231 (11 analyser × 21:
  1 analys + 20 variabelsidor) + 22 forskningsbibliotek + 201 labb-case + 40 bloggposter.
- **Faktiska rutter:** 78 page.tsx = 70 statiska sidor + 8 dynamiska mallar
  (analyser/[ticker], analyser/[ticker]/[variabel], forskningsbiblioteket/[ticker],
  kurser/[slug] ×3 språk, blogg/[slug] ×3, labb/[id]).
- Sitemap är `force-dynamic` — genereras vid varje anrop. Alla 60 statiska mappar
  mot existerande route (0 spök-URL:er). Backlinks: sitemap lämnas korrekt i
  robots (`host` + `sitemap`-rad).

### 1.2 Sitemap-diff (route finns, indexbar, men SAKNAS i sitemap)
| Route | Status idag | Bedömning |
|---|---|---|
| /pro/priser, /pro/analys, /pro/klienter, /pro/rapporter | `robots index:true` | 4 B2B-pengasidor osynliga för upptäckt — lägg i sitemap |
| /en/blogg, /ar/blogg | indexbar (ingen robots-meta alls) | Speglar utan canonical/hreflang — duplikatkandidater |
| /en/kurser/[slug] ×333, /ar/kurser/[slug] ×333, /en|ar/blogg/[slug] ×40 | noindex + canonical→SV tills 80 % (INDEX_TRASKEL) | Korrekt idag, MEN när tröskeln nås aktiveras index vid render-tid utan att sitemap (bygg-tid) hänger med → planera sync |

### 1.3 Kanoniska/duplikat — speglar en+/ar
- **Bra:** kurs- och blogg-slug-speglar under 80 % översättning = noindex +
  canonical mot svensk original (src/lib/spegel-metadata.ts, INDEX_TRASKEL).
- **BUGG (P1): hreflang är enkelriktad.** Endast speglarna deklarerar kluster
  (sv-SE + en + ar + x-default, t.ex. src/app/en/page.tsx:39). **Inget av de 10
  svenska originalen** (/, medlemskap, manifest, logga-in, om-oss, kurser,
  fas2-ansok, fas3, prenumeration, transparens) deklarerar `languages` —
  grep "languages:" ger 0 träffar på samtliga. Google kräver ömsesidighet →
  hreflang ignoreras i praktiken; sv/en/ar konkurrerar i stället om samma frågor.
- **/en/blogg + /ar/blogg:** varken canonical, hreflang eller robots-meta —
  helt oskyddade (endast hreflang-fria listningspeglar).
- **Död kod:** src/app/seo-layout.tsx importeras ingenstans och bär avvikande
  metadata (bl.a.keywords med "Volvo Cars") — bort eller levandegör.

### 1.4 llms.txt
- **Finns och är stark:** public/llms.txt (693 rader) + dynamisk /api/llms-txt
  (levande kurs-/case-/bloggdata). Sektioner: 20 kanoniska frågor→kurs-URL,
  Kärn-URL:er (14), Ämnesområden, 333 kurser, 201 labb, 40 blogg, 11 analyser,
  metadata med guldkälla. Robots bjuder in GPTBot/OAI-SearchBot/ChatGPT-User,
  ClaudeBot-familjen, Perplexity, Google-Extended, Applebot-Extended, Meta,
  Amazonbot, CCBot — explicitt per vendor. Gap: frågekartan pekar på kurser;
  när frågeformade guider publiceras (§2) ska kartan peka om/utökas.

### 1.5 robots.txt (src/app/robots.ts → genererad)
- Allow-lista + disallow /admin, /pro/admin; crawl-delay 0; sitemap + host.
- Smärre: /en/ och /ar/ saknas i PUBLIKA_YTOR — inget disallow finns så de
  crawlas ändå, men den symboliska AI-inbjudan (som övriga ytor får) saknas.

### 1.6 JSON-LD-täckning (28 sidor + global Organization/WebSite i layout.tsx)
- **Har sid-specifik schema:** / (FAQPage), kurser + kurser/[slug] (Course),
  analyser + [ticker] + [variabel], blogg/[slug] (Article+Breadcrumb),
  forskningsbiblioteket/[ticker], labb/[id], kalkylator, konfluens, medlemskap
  (FAQPage), fas3, min-portfolj, netnet, nyheter, portfolj-forskning,
  portfoljbyggare, rapporter, superanalys, en/ar: /, kurser, medlemskap, fas3.
- **SAKLAR (sorterat på sitemap-prio):** /laroplan (**1.0**), /vagfundament
  (**1.0**), /manifest (0.9), /dagens-pass (0.9), /bibliotek (0.9), /topplista
  (0.8), /pro (0.9) + 4 under, /blogg-, /labb-, /forskningsbiblioteket-översikter
  (ItemList/CollectionPage), /certifikat, /profil, /badges, /en/blogg, /ar/blogg.
- Bloggposter saknar FAQPage (ORGANISK-PLAN §2 kräver det vid frågeinlägg).

### 1.7 OG-bilder — 389 PNG, koppling
- Faktiskt: 5 rot (start/kurs/blogg/analys/default) + 333 kurser + 40 blogg +
  11 analyser = 389. Diff mot innehållet (tsx-script, båda riktningar):
  **0 kurser, 0 blogg, 0 analyser saknar bild; 0 PNG är överbliven.** 100 %.
- Alla sidor får og:image: pageMetadata→ogBildForPath ger per-slug-bild eller
  default.png; sidor med handskriven metadata ärver rot-layoutens start.png
  (fungerar, men generisk — 34 sidor, bl.a. topplista/bibliotek/pro/en-ar).

### 1.8 Interna länkars hälsa
- **Kvalitetsvakten 2026-09-05: GRÖN** (0 fel, 2 manuella) — men länkkontrollen
  verifierar bara **4 länkar** (sokindex+huvudmeny+sidfooter). Ytlig.
- **Manuell svep (denna granskning):** 109 unika interna href/url/lank i
  src/**\*.tsx + 40 unika markdown-länkar i data/blogg/*.json, kontrollerade
  mot rutter + slug-filer:
  - tsx-lagret: **0 döda**.
  - markdown: **5 DÖDA** — `/blogg/komplett-guide-svenska-aktieanalys-2026`
    i analys-industrivarden/investor/np3-fastigheter/truecaller/h-och-m
    (filen heter `komplett-guide-svensk-aktieanalys-2026.json` — "svensk" ej
    "svenska") → 404 + läckande länkekvitet från 5 FB-genererade poster.
- **Orphan-sidor:** /en och /ar har **inga synliga interna länkar** (endast
  hreflang/JSON-LD-referenser; MENY_REGISTER i src/lib/meny-register.ts saknar
  språkväljare) → sämre crawl-prioritet och användare hittar aldrig speglarna.

---

## 2. INNEHÅLLS-GAP: 20 long-tail (ORGANISK-TILLVAXT-PLAN §3)

| # | Ämne | Kurs | Bloggpost idag | Frågeguide? |
|---|---|---|---|---|
| 1 | Hur räknar man ROE? | v09-roe ✓ | v09-roe-analys + v09-roe-avkastning-eget-kapital ("V09: ROE — så analyserar du den") | **NEJ** |
| 2 | EV/EBITDA | v06 ✓ | v06-ev-ebitda-analys | **NEJ** |
| 3 | Balansräkning 15 min | v05-pb ✓ | sa-laser-du-en-balansrakning-pa-15-minuter (närmast guideformat) | **NEJ** |
| 4–20 | Bruttomarginal, P/S, skuldsättningsgrad, kvick, ARR, diversifiering, EBITDA-marginal, återköp, kapitalförbränning, nätverkseffekter, varumärke, patent/IP, regulatoriskt, produktlansering, avtal, P/B, intäktsstabilitet | alla vXX ✓ | alla vXX-analys ✓ | **NEJ (17 st)** |

**Slutsats:** 20/20 har kurs + analysformat-post + rad i llms.txt-frågekartan —
men **0/20** har planens frågeformat (H1 = frågan, rakt svar + formel i första
stycket, FAQPage-schema, dubbelriktad länkning kurs↔guide). Obesvarade sökord =
alla 20 i frågeform. Planens vecka 1–4-prioritet: #1 ROE, #2 EV/EBITDA,
#6 skuldsättningsgrad, #7 kvickräkning — börja där (högst volym).

---

## 3. TOPP-10 SEO/AI-FÖRBÄTTRINGAR — rankade

| # | Åtgärd | Fil(er) | Est. trafikpåverkan |
|---|---|---|---|
| 1 | **Publicera 20 frågeformade "Hur räknar man…?"-guider** enligt plan (H1=fråga, svar+formel direkt, FAQPage, länk kurs↔guide↔kalkylator, tal ur siffror.ts) + uppdatera llms.txt-frågekartan vid varje publicering | nya data/blogg/*.json + src/lib/seo.tsx (FAQPage i blogMetadata-väg) | **Hög** — planens mål: 500+ klick/mån dag 90, 3x impressioner; även AI-citatsugg |
| 2 | **Fixa hreflang-reciprocitet:** lägg `languages` (sv-SE/en/ar/x-default) på de 10 SV-originalen — enklast via alternates i respektive page.tsx eller i pageMetadata() | src/app/page.tsx, src/app/{medlemskap,manifest,logga-in,om-oss,kurser,fas2-ansok,fas3,prenumeration,transparens}/page.tsx (eller src/lib/seo.tsx pageMetadata) | **Medel-hög** — aktiverar hela sv/en/ar-klustret; i dag ignoreras hreflang |
| 3 | **Fixa 5 döda markdown-länkar** ("svenska"→"svensk") — antingen döp om filen till …svenska… (kräver uppdatering av og/blogg-referenser) eller sök-ersätt i de 5 JSON-bodyrna | data/blogg/analys-{industrivarden,investor,np3-fastigheter,truecaller,h-och-m-hennes-och-mauritz}-2026.json | **Låg-medel** — stoppar 404 + länkekvitet från 5 sajtens djupaste poster |
| 4 | **Sitemap-påslag:** /pro/{priser,analys,klienter,rapporter} + /en/blogg + /ar/blogg; sistnämnda även canonical + hreflang via spegel-metadata | src/app/sitemap.ts, src/app/{en,ar}/blogg/page.tsx | **Medel** — B2B-sidor + speglar blir upptäckbara; undviker duplikat |
| 5 | **JSON-LD på 7 saknade högprio-sidor:** laroplan+vagfundament (1.0), manifest, dagens-pass, bibliotek, topplista, pro | respektive src/app/*/page.tsx + hjälpfunktioner i src/lib/seo.tsx | **Medel** — rich results + AI-entitetsförståelse på flaggskeppen |
| 6 | **Språkväljare + interna länkar till /en, /ar** (meny/footer) — speglarna är orphans idag | src/lib/meny-register.ts, src/components/ak1a/sidfooter.tsx | **Medel** — crawlväg + verklig användarupptäckt av 22 spegelsidor |
| 7 | **ItemList/CollectionPage-schema på översikterna** /blogg, /labb, /forskningsbiblioteket (201 case + 22 översikter sitter utan samlings-schema) | src/app/{blogg,labb,forskningsbiblioteket}/page.tsx | **Låg-medel** — bättre sitelinks/struktur i SERP |
| 8 | **FAQPage på bloggposter som besvarar en tydlig fråga** (plan §2-krav; idag bara Article+Breadcrumb) | src/app/blogg/[slug]/page.tsx + src/lib/seo.tsx (articleJsonLd) | **Låg-medel** — expanderar SERP-yta per inlägg |
| 9 | **robots: lägg /en/, /ar/ i PUBLIKA_YTOR** (symbolisk AI-inbjudan i linje med "nr 1 hos alla AI") | src/app/robots.ts | **Låg** — signal, ej mekanik |
| 10 | **Äkta lastmod i sitemap:** 333 kurser + 60 statiska får `now`/daily — Google lär sig strunta i lastmod; kurser har inga datumfält men statiska sidor kan bära äkta updatedAt; logga avvikelsen medvetet | src/app/sitemap.ts (+ ev. datumfält i public/deep-courses.json) | **Låg** — crawl-effektivitet, långsiktig |

**Avskrivet med motivering:** OG-bilder (100 % täckta, 0 överblivna — inget
att fixa); Kvalitetsvakten länksektion (GRÖN men svag — förbättring förslag:
utöka kontroll 4 till markdown-länkar i data/blogg, se verktyg/kvalitetsvakt.mjs
kontroll 4; fångar inte fallet i #3 idag).

---

## 4. SITEMAP-DIFF (sammanfattning)

```
SITEMAP (887)          RUTTER (78 mallar → ~1 100 möjliga URL:er)
├─ 60 statiska         ├─ 70 statiska sidor
│   └─ 0 spök-URL:er   │   ├─ /admin, /pro/admin (robots-stängda — korrekt ute)
├─ 333 kurser          │   ├─ SAKNAS i sitemap: /pro/priser, /pro/analys,
├─ 231 analys+variabel │   │   /pro/klienter, /pro/rapporter, /en/blogg, /ar/blogg
├─ 22 FB-översikter    │   └─ övriga 64: täckta ✓
├─ 201 labb-case       ├─ 8 dynamiska mallar
└─ 40 bloggposter          ├─ sv: täckta ✓ (333+40+11+220+22+201)
                            └─ en/ar-slug: noindex idag — framtids-sync vid 80 %
```

*Pedagogisk analys — inte investeringsråd.*
