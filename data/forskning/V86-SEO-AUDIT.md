# V86-SEO — Produktionsaudit av SEO-grunden (2026-09-07)

**Agent:** V86-SEO · **Miljö:** PROD https://lab.ak1nvestor.com · **Metod:** node fetch (aldrig curl), read-only — inget i src ändrat.
**Verktyg (gitignorade):** `tool-results/v86-seo-audit.mjs` (huvudaudit, seedat RNG 20260907), `tool-results/v86-seo-audit-del2.mjs` (429-eftersläpning, 2 s pacing + backoff), `tool-results/v86-seo-audit-del3.mjs` (punktverifieringar). Rådata: `tool-results/v86-seo-audit-resultat.json`, `-resultat2.json`, `-resultat3.json`.

**Omfattning:** 1 684 sitemap-URL:er; 25 stratifierade stickprov (sv/en/ar-kurser, blogg, analyser, labb, forskning, statiskt); 10 kurs-kluster för hreflang-reciprocitet; 12 OG-kontroller; 15 title/desc; robots.txt + noindex-logik; 10 h1/lang-kontroller.

**Sammanfattning: PASS 14 · WARN 5 · FAIL 3.** Grundmönstret är starkt: sitemap, hreflang-reciprocitet, canonical, h1 och sv-lang är solidt. Tre konkreta defekter: OG 404 på analysvariabelsidor, og:image saknas helt på 776 speglar, samt /pro/priser som indexerbar trots stängd B2B-grind.

---

## Fyndtabell

| # | Område | Status | Fynd | Bevis (PROD) | Källrad |
|---|--------|--------|------|---------------|---------|
| 1.1 | Sitemap | **PASS** | /sitemap.xml HTTP 200, application/xml, exakt 1 684 URL:er — oförändrat mot senast känt (1 684) | `GET /sitemap.xml` | `src/app/sitemap.ts` (hela) |
| 1.2 | Sitemap | **PASS** | Fördelning rimlig: sv-kurser 333, en-kurser 333, ar-kurser 333, blogg 55×3, analyser+variabler 231, labb 201, forskning 22, statiskt 66 | sitemap-fördelning i rådata | `src/app/sitemap.ts:103-180` |
| 1.3 | Sitemap | **PASS** | Stickprov 25 slumpade URL:er: 25/25 HTTP 200; canonical matchar sig själv 25/25 (normaliserad jämförelse) | bl.a. `/kurser/rk-11-bedrageririsk`, `/en/blogg/hur-vi-analyserade-volvo-cars`, `/forskningsbiblioteket/MC.PA` | — |
| 1.4 | Sitemap | **PASS** | Alla 25 stickprov bär `robots: index, follow` (korrekt för sidor över tröskel) | samma stickprov | `src/lib/seo.tsx:162-174` |
| 2.1 | Hreflang | **PASS** | 10/10 kurs-kluster (v01, v08, v12, v18, ts-13, ts-21, bf-01, good-to-great, little-book, manias): sv-sidan bär sv-SE(self)+en+ar+x-default→sv | `/kurser/v01-forsaljningstillvaxt` alt-uppsättning | `src/lib/seo.tsx:147-161` (`harSpeglar`) |
| 2.2 | Hreflang | **PASS** | Reciprocitet: /en- och /ar-speglarna bär hela klustret TILLBAKA med sv-SE → svenska originalet; speglar över tröskel har egen canonical + index,follow | `/en/kurser/v18-regulatoriska`, `/ar/kurser/v18-regulatoriska` | `src/lib/kurs-speglar.ts:469-483` |
| 3.1 | OG-bilder | **PASS** | 8 av 12 kontrollerade sidor: og:image finns, bild svarar 200 image/png, alt ifylld (start, /kurser, /blogg, 2 kurser, 2 bloggposter, /analyser/ABB.ST huvudsida) | `/og/start.png`, `/og/kurser/se-08-media.png` m.fl. | `src/lib/seo.tsx:44-68` |
| 3.2 | OG-bilder | **FAIL** | Alla analysvariabelsidor pekar på OG-bild som 404:ar — `ogBildForPath` härleder `/og/analys/abb-st.png` ur URL:en men filerna heter `ABB.ST.png` (rå ticker). Drabbar samtliga 231 variabel-URLer i sitemap | `/analyser/abb-st/v02-arr-tillvaxt` → `GET /og/analys/abb-st.png` = 404 (text/html) | `src/lib/seo.tsx:60-66` + `src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx:51-52` (path-form `-st`) |
| 3.3 | OG-bilder | **FAIL** | og:image SAKNAS helt på kurs- och bloggspeglar: `kursSpegelMetadata` och `bloggSpegelMetadata` bygger openGraph utan `images` (twitter-card summary_large_image pekar på ingen bild). 666 kursspegel- + 110 bloggspegel-URLer utan social förhandsvisning | `/en/kurser/ts-14-macd` och `/ar/blogg/5-vanliga-nyborjarmisstag-svenska-aktier` — ingen og:image-meta alls | `src/lib/kurs-speglar.ts:495-503`; `src/lib/blogg-speglar.ts:356-369` |
| 4.1 | Title/desc | **PASS** | Titlar unika i stickprovet: 15/15, inga dublettitlar | rådata `titleDesc.dubbelTitlar = []` | — |
| 4.2 | Title/desc | **PASS** | Svenska original (kurser/blogg/analyser): title 35–58 tkn (clamp 60), desc 121–160 tkn, inga trunkeringar utom medveten ellips i 2 fall | `/blogg/vad-ar-ev-ebitda` (58/130), `/kurser/km-043-energisektorn` (46/121) | `src/lib/seo.tsx:195-221, 268-284` (clamp 60/158) |
| 4.3 | Title/desc | **WARN** | Titlar > 70 tkn på fyra sidklasser: kursspeglar 63–85 (ingen clamp), bloggspeglar upp till 102, forskningsöversikter 85, variabelsidor 85. Google klipper visningen ~60; full indexering sker men CTR-quality sjunker | `How to Make Money in Stocks — …` (85), ar-blogg (102), `LVMH …` (85) | `src/lib/kurs-speglar.ts:450-453`; `src/lib/blogg-speglar.ts:318-321`; `src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx:66`; `src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx:53` |
| 4.4 | Title/desc | **WARN** | Desc > 160 tkn på samma klasser: speglar clampas till 300 (uppmätt 172–300), forskning 211, variabelsida 183 — målet 70–160 överskrids; SERP klipper ~155–160 | spegel-desc 300 tkn på `/en/kurser/how-to-make-money-in-stocks` | `src/lib/kurs-speglar.ts:455-463`; `src/lib/blogg-speglar.ts:322-329`; `forskningsbiblioteket/[ticker]/page.tsx:67`; `[variabel]/page.tsx:54` |
| 5.1 | Robots | **PASS** | /robots.txt korrekt: `User-Agent: *` med Allow-lista, `Disallow: /admin` + `Disallow: /pro/admin`, Crawl-delay: 0, Sitemap- och Host-rader; 8 explicita AI-crawler-grupper (GPTBot, ClaudeBot, PerplexityBot m.fl.) — /pro korrekt ute ur Allow när B2B av | `GET /robots.txt` | `src/app/robots.ts:27-45, 83-109` |
| 5.2 | Robots | **PASS** | /pro = `noindex, nofollow` + canonical → startsidan (B2B-grinden VÅG 77 fungerar på huvudsidan) | `GET /pro` | `src/app/(huvud)/pro/layout.tsx:47` |
| 5.3 | Robots | **FAIL** | /pro/priser = `index, follow` med canonical → `/` trots stängd B2B-grind: sidan hårdkodar egen robots som ÖVERRIDER layoutens `b2bAktiv()`-villkor, och URL:en listas i sitemap → indexerbar halvfärdig B2B-sida + sitemap-signalbrott | `GET /pro/priser` (index,follow; canonical https://lab.ak1nvestor.com/) | `src/app/(huvud)/pro/priser/page.tsx:16` (robots index:true); `src/app/sitemap.ts:62` |
| 5.4 | Robots | **WARN** | /logga-in är medvetet indexerad (gratis-konto-landing, prio 0.3) — OK enligt design; DÄREMOT är /min-sida (personlig dashboard, innehållslös för utloggade) `index, follow` och sitemap-listad med prio 0.8 | `GET /min-sida` (index,follow) | `src/app/sitemap.ts:70-71`; `src/app/(huvud)/logga-in/page.tsx:9-17` |
| 5.5 | Robots | **WARN** | Sitemap listar URL:er som robot-logiken håller borta/nyanslöser: /pro + 4 pro-undersidor (noindex-träd), /min-sida, /min-portfolj — Search Console-rapporter "Submitted URL marked 'noindex'" för /pro-blocket; dessutom svarar /admin 200 på fetch (robots stoppar bara crawl, ej åtkomst) | sitemap vs. /pro-svar | `src/app/sitemap.ts:59-71` |
| 6.1 | Struktur | **PASS** | h1 exakt en per sida: 10/10 stickprov (kurser, speglar, analyser, labb, blogg, statiskt) | rådata `struktur` | — |
| 6.2 | Struktur | **PASS** | sv-sidor bär `<html lang="sv">` — 10/10 | alla sv-stickprov | `src/app/(huvud)/layout.tsx:25` |
| 6.3 | Struktur | **WARN** | en/ar-sidor svarar med `lang="sv"` och ar-sidor SAKNAR `dir="rtl"` i PROD — VÅG 85-koden är färdig i src ((en)/(ar)-layouter + GlobaltSkal sätter lang/dir korrekt) men ännu ej deployad. 776 spegel-URLer bär fel språksignal tills deploy | `/en/kurser/se-02-halvledarsektorn` → lang="sv"; `/ar/kurser/vm-04-cyklisk-justering` → lang="sv", dir saknas | Kod klar: `src/components/ak1a/globalt-skal.tsx:319-324`, `src/app/(en)/layout.tsx:27`, `src/app/(ar)/layout.tsx` — åtgärd = deploy |
| 7.1 | Extra | **WARN** | lastModified = genereringstillfället ("now") för i princip alla kurser/kapitel/bloggspeglar + `force-dynamic` — lastmod-signalen är konstant "nu" och Google kan lära sig ignorera den; /logga-in saknar lastmod helt | sitemap innehåll | `src/app/sitemap.ts:5, 30-96, 103-120` |

**Totalt: PASS 14 · WARN 5 · FAIL 3** (22 fyndrader).

### Observationer utan status (designval att känna till)
- Stickprovet 2.2 träffade bara speglar ÖVER tröskel (egen canonical, index) — under-tröskel-speglar (noindex + canonical→sv-originalet) är korrekt design men verifierades inte separat i denna omgång.
- robots.txt `Host:`-rad och `Crawl-delay: 0` är icke-standard-directiv (harmlösa; öppna AI-vendor-dokumentationer läser sina egna grupper korrekt).
- PROD ratelimit: ~30 snabba fetcher → HTTP 429 (fanns i del 1; del 2 med 2 s pacing klarade sig utan). Sannolikt edge/middleware-skydd — noteras bara, ingen åtgärd från SEO-sida.
- `verktyg/kor-sokindex.mjs` (⌘K-index, alltså INTE sökmotor-SEO): korrekt och idempotent, `public/sok-index.json` 333 kurser — utan SEO-relevans utöver att det är separat från /sitemap.xml. Påverkar inte auditens fynd.

---

## Prioriterad åtgärdslista

### P1 — gör i nästa våg (indexering/social-delning påverkas idag)
1. **/pro/priser indexerbar trots B2B-av.** Radera `robots: { index: true, follow: true }` på `src/app/(huvud)/pro/priser/page.tsx:16` så pro-layoutens `b2bAktiv()`-grind (`src/app/(huvud)/pro/layout.tsx:47`) styr, eller villkora mot `b2bAktiv()`. Kontrollera samtidigt att /pro/analys, /pro/klienter, /pro/rapporter (som saknar egen robots och därmed ärver korrekt) förblir oskyddade av misstag i framtiden — lägg gärna ett test.
2. **OG 404 på 231 analysvariabelsidor.** I `src/lib/seo.tsx:60-66` (`ogBildForPath`) matchas URL-formen (`abb-st`) inte filnamnet (`ABB.ST.png`). Fix: antingen (a) mappa segmentet tillbaka till rå ticker vid OG-härledning (samma normalisering som `hittaAnalyser`, omvänd `toLowerCase/replace(/\.st$/,"-st")` — obs. även versaler: `volcar-b` ↔ `VOLCAR-B.png` kräver case-återställning), eller (b) generera OG-bilder även i variabelform, eller (c) enklast: ge variabelsidorna översiktsbilden `/og/analys.png` via explicit `ogBild` i `src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx:51-54`.
3. **og:image saknas på 776 speglar (666 kurs + 110 blogg).** Lägg till `images` i openGraph i `src/lib/kurs-speglar.ts:495-503` och `src/lib/blogg-speglar.ts:356-369` — återanvänd redan genererade `/og/kurser/{slug}.png` och `/og/blogg/{slug}.png` (1200×630, alt = spegeltitel). Twitter summary_large_image utan bild ger fula delningar idag.

### P2 — planerad våg
4. **Deploya VÅG 85 (html-lang/dir).** Koden är klar (`src/app/(en)/layout.tsx`, `src/app/(ar)/layout.tsx`, `src/components/ak1a/globalt-skal.tsx:319-324`) men PROD svarar `lang="sv"` på alla 776 speglar och saknar `dir="rtl"` på ar. Enda åtgärd: rulla ut befintlig kod; verifiera efter deploy med `curl`-fri fetch av `/en` + `/ar`.
5. **Rensa sitemap mot index-logiken.** `src/app/sitemap.ts:59-71`: villkora /pro-blocket (rader 59-65) på `b2bAktiv()` och plocka bort /min-sida + /min-portfolj (personliga, bör även noindexas i sina page-metadata). Eliminerar "Submitted URL marked noindex" i Search Console.
6. **Title/desc-clamp på speglar + forskning + variabelsidor.** Fyra ställen saknar 60/160-disciplin: `src/lib/kurs-speglar.ts:450-453` (title, lägg clamp 60) och `:455-463` (desc, sänk 300→158); `src/lib/blogg-speglar.ts:318-321` (title) och `:322-329` (desc 300→158); `src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx:66-67`; `src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx:53-54`. Lägg clamp 60/158 (samma helper som `src/lib/seo.tsx:82-85`).

### P3 — förbättringar
7. **Äkta lastmod i sitemap.** `src/app/sitemap.ts` sätter `lastModified: now` överallt (rader 30-96 m.fl.) med `force-dynamic` (rad 5) — antingen äkta datum ur innehållskällorna (analysens `versionsdatum` görs redan rätt) eller stryk lastmod där inget äkta datum finns, så signalen behåller trovärdighet.
8. **/min-sida noindex** (hänger ihop med #5): metadata `robots: { index: false }` — sida utan publikt värde för utloggade.
9. **Dubbelssäkring av /pro i robots.txt** (valfri): när `NEXT_PUBLIC_B2B_AKTIV !== "1"` kan `Disallow: /pro` läggas till i `src/app/robots.ts:90-91` — idag skyddas /pro endast av noindex (Allow "/" gör hela trädet crawlbart).

---

## Metodnoteringar
- Stickprov slumpade med seedat RNG (mulberry32, seed 20260907) — fullt reproducerbart via `node tool-results/v86-seo-audit.mjs`.
- PROD ratelimiter (~30 req/min i burst): del 1 träffade 429 efter steg 2; del 2 körde om alla 429-drabbade kontroller med 2 s pacing + exponentiell backoff (20/40/80 s) — samtliga fynd ovan bygger på 200-svar, inte på 429-kroppar.
- Källkodsläsning: `src/lib/seo.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/kurs-speglar.ts`, `src/lib/blogg-speglar.ts`, `src/components/ak1a/globalt-skal.tsx`, `src/app/(huvud)/pro/**`, `src/app/(huvud)/analyser/[ticker]/[variabel]/page.tsx`, `src/app/(huvud)/forskningsbiblioteket/[ticker]/page.tsx`, `verktyg/kor-sokindex.mjs`.

*Pedagogisk forskning — aldrig investeringsråd.*
