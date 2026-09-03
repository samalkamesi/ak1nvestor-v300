# Branding-audit — AK1A Research Lab

**Datum:** 2026-09-02
**Direktiv (AI-styrelsen):** "Kontrollera att branding är korrekt från första till sista sida."
**Omfattning:** hela `src/` (app + components) samt `public/deep-courses.json` och `data/` för tal-verifiering. Endast läsning — inga kodändringar.
**Metod:** systematisk genomgång av 8 kontrollpunkter med grep + filgranskning.

**Resultat: 7 PASS / 1 FAIL** (kontroll 7, kursantal, fallerar)

| # | Kontroll | Utfall |
|---|----------|--------|
| 1 | Header/AK1A-logo på alla sidor | **PASS** |
| 2 | Sidfooter på alla sidtyper | **PASS** (2 designnoteringar) |
| 3 | Disclaimer per analysverktyg | **PASS** (8/8 verktyg) |
| 4 | AK1A-DNA-token (marin/guld/serif) | **PASS** |
| 5 | Tagline "Tydligare än en bank" | **PASS** |
| 6 | /fas2-ansok-länkar | **PASS** (2 svaga ställen) |
| 7 | Kursantal 324 | **FAIL** |
| 8 | Metadata/SEO med AK1A-namn | **PASS** (2 noindex-undantag) |

---

## Kontroll 1 — Header: AK1A-logo på ALLA sidor — PASS

Alla fyra sidtyper har AK1A-logo i toppen:

- **SeoPageShell (34 sidor)** — text-logo `AK1A Research Lab` (font-serif, guld-A) i sticky header.
  Källa: `src/components/ak1a/seo-page-shell.tsx` rad 26–31.
  Användare (34 st): analyser, analyser/[ticker], analyser/[ticker]/[variabel], badges, bibliotek, blogg, blogg/[slug], certifikat, dagens-pass, fas2-ansok, fas3, finansiell-policy, kalkylator, konfluens, kurser, kurser/[slug], labb, labb/[id], laroplan, logga-in, manifest, medlemskap, min-portfolj, min-sida, netnet, om-oss, portfoljbyggare, privacy-policy, profil, rapporter, superanalys, terms, topplista, vagfundament.
- **SPA-startsidan (/)** — `Header` med grafisk `Ak1aLogo` (primitives.tsx, 3 storlekar).
  Källa: `src/components/ak1a/spa-hem.tsx` rad 6+112; `src/components/ak1a/header.tsx` rad 207.
- **/pro** — egen marin header `AK1A` + guld `PRO`-badge + guldknapp "Boka demo".
  Källa: `src/app/pro/layout.tsx` rad 59–86.
- **/pro/admin** — PRO-skalet via layout + egen `AK1A PRO ADMIN`-badge på skyddsgrinden.
  Källa: `src/app/pro/admin/page.tsx` rad 63+117.
- **/admin (intern)** — `Ak1aLogo` + "AK1A Research Lab — administrativ översikt".
  Källa: `src/app/admin/page.tsx` rad 212+218.

**Slutsats:** Ingen sida utan logo. Text-logon i SeoPageShell följer DNA (serif + `text-gold`).

## Kontroll 2 — Footer: Sidfooter på alla SeoPageShell-sidor — PASS (med noteringar)

- **Alla 34 SeoPageShell-sidor** renderar `<Sidfooter />` garanterat via skalet (`src/components/ak1a/seo-page-shell.tsx` rad 70) + `NastaSteg`. Sidfootern är i fullt AK1A-DNA: `paper-texture`, `hjarlinje`, serif-rubriker, guldknapp "Ansök Fas 2", disclaimer-rad (`src/components/ak1a/sidfooter.tsx` rad 65–113).
- **SPA /** använder `Footer` (`src/components/ak1a/footer.tsx`) — disclaimer och guld finns, men footern är tunn: endast extern länk AK1nvestor.com + mailto. Ingen intern navigation, ingen /fas2-ansok-länk. Se kontroll 6.
- **/pro + /pro/admin saknar Sidfooter** — detta är ett **dokumenterat designval** ("en skild värld", `src/app/pro/layout.tsx` rad 4–13): egen institutionell marin B2B-footer med metod- och ansvarsdeklaration som "aldrig kan suddas ut av white-label" (rad 91–127). Bedöms korrekt branding, inte ett breach.

**Slutsats:** PASS. Notering: SPA-footern är den svagaste branding-ytan på sajten.

## Kontroll 3 — Disclaimer per analysverktyg — PASS (8/8)

Alla åtta verktygen visar "…inte investeringsråd" i UI (25 disclaimers i 19 komponenter i `src/components/ak1a/`):

| Verktyg | Källa (fil:rad) | Formulering |
|---|---|---|
| AKM1-kalkylatorn (/kalkylator) | akm1-calculator.tsx:581 | "Pedagogisk finansanalys — inte investeringsråd." |
| Superanalysen (/superanalys) | superanalys.tsx:304 + 565 | "Pedagogisk analys — inte investeringsråd." (2 st) |
| Vågfundamentet (/vagfundament) | vagfundament-matris.tsx:415 | "Pedagogiskt verktyg — inte investeringsråd." |
| Konfluensradarn (/konfluens) | konfluens-tabell.tsx:487 | "Pedagogisk analys — inte investeringsråd." |
| Net-net-skannern (/netnet) | netnet-skanner.tsx:438 | "Pedagogiskt screeningverktyg — inte investeringsråd." |
| Portföljbyggaren (/portfoljbyggare) | portfoljbyggare.tsx:662 | "Pedagogiskt verktyg — inte investeringsråd." |
| Min portfölj (/min-portfolj) | min-portfolj-kort.tsx:435+614, page.tsx | 3 disclaimers |
| Dagens Pass (/dagens-pass) | dagens-pass.tsx:605 | "pedagogiskt verktyg, inte investeringsråd." |

Dessutom: footer.tsx, sidfooter.tsx, root layout (`src/app/layout.tsx`), /pro-layout, pro/page.tsx, terms, om-oss, analyser-sidor, morgon-briefing, aktie-nyheter, sankey-portfolj, portfolj-vagprofil, vagkarta-kort, visuell-block, overlays, client-portal, sasongs-grid.

**Slutsats:** PASS. Mindre notering: tre ordföljningsvarianter finns ("Pedagogisk analys" / "Pedagogiskt verktyg" / "Pedagogiskt screeningverktyg") — juridiskt ekvivalenta, ev. harmoniseringsläge.

## Kontroll 4 — AK1A-DNA-token (marin/guld/serif) — PASS

- **`font-serif`:** 55 av ~68 tsx-filer i `src/components/ak1a/` använder serif-rubriker. Topp: stock-analysis-view.tsx (56 förekomster), client-portal.tsx (26), superanalys.tsx (19), min-sida.tsx (16), portfolio-builder.tsx + portfolio-system.tsx (14 ea), dagens-pass.tsx (12).
- **`.marin-panel`:** 21 filer / 30 förekomster i ak1a-komponenter + `src/app/pro/layout.tsx` (header + footer). Klasserna `.marin-panel` och `.hjarlinje` är definierade och kontrast-dokumenterade i `src/app/globals.css` (rad 309+, "13.9:1").
- **`text-gold`:** header.tsx (13), superanalys.tsx (16), footer.tsx (5), seo-page-shell.tsx + sidfooter.tsx (1 ea).
- **`.hjarlinje`** återkommer i sidfooter, pro-layout, spa-hem m.fl.

**Slutsats:** PASS — marin/guld/serif är konsekvent implementerat i nyckelkomponenterna. Notering: `spa-hem.tsx` har 0 egen `text-gold` (guldet bor i dess child-sektioner, t.ex. home-section.tsx) — inget åtgärdsbehov.

## Kontroll 5 — Tagline — PASS

- `grep -r "Ärligare" src/ data/` → **0 träffar**. Gamla taglinen är helt borta.
- "Djupare än en blogg. **Tydligare än en bank.** Snabbare än en utbildning." finns på 6 platser:
  - `src/app/page.tsx:7` (metadata-description)
  - `src/app/layout.tsx:47 + 75` (root metadata + OG)
  - `src/app/manifest/page.tsx:410`
  - `src/app/om-oss/page.tsx:78`
  - `src/components/ak1a/sections/home-section.tsx:44` (synlig hem-sektion)

**Slutsats:** PASS — identisk formulering på alla platser.

## Kontroll 6 — Kontakt/CTA: /fas2-ansok — PASS (2 svaga ställen)

Direktlänkar till /fas2-ansok (≈17 platser i kodbasen):
- Navigation: `huvudmeny.tsx:62`, `mobilmeny.tsx:61+264`, SPA-`header.tsx:512`, `sidfooter.tsx:46+56` (guldknapp "Ansök Fas 2" — alla 34 SEO-sidor via skalet)
- Sidor: `medlemskap/page.tsx:203`, `fas3`, `bibliotek.tsx`, `laroplan.tsx`, `kurs-sok.tsx`, `portfolj-vagprofil.tsx`
- System: chatbot-routern, chat-widget, fas2-gate, sokindex, navigationsminne, `sitemap.ts`

Svaga ställen:
1. **SPA-footern** (`footer.tsx`) länker inte /fas2-ansok — enda nav-ytan utan CTA:n.
2. **om-oss body** nämner inte Fas 2 (men Sidfootern på sidan har guldknappen).

Hem-sidans CTA går via /medlemskap → fas2-ansok (indirekt, fungerande).

**Slutsats:** PASS — full täckning via menyer + Sidfooter; de två svaga ställena är förbättringspotential, inte fel.

## Kontroll 7 — Kursantal — FAIL (viktigaste fyndet)

**Faktiskt läge:** `public/deep-courses.json` innehåller **324 kurser** (varav **93 BOKMASTER**).

### 7a. Direktivets gamla tal (285/298/313/318/320) — 1 träff
- `src/lib/sokindex.ts:23` — söknyckel `"bibliotek 285 kurser"` på posten "Alla kurser". Användare som söker "324" i ⌘K-paletten får ingen träff.

### 7b. Större problem: kodbasen är synkad till **307/78** (2026-09-01) men data har vuxit till **324/93**

SEO-/användarsynliga (P1):
| Plats | Innehåll |
|---|---|
| `src/app/kurser/page.tsx:14+16` | **SEO-title: "Kurser i institutionell aktieanalys — 307 kurser | AK1A"** + description "307 kurser" |
| `src/app/logga-in/page.tsx:13` | description: "alla 307 kurser" |
| `src/app/manifest/page.tsx:14` | description: "307 kurser, 78 böcker" |
| `src/app/api/chatbot/route.ts:41+369+388` | chattbot-svar: "307 kurser" (3 st) |
| `src/components/ak1a/chat-widget.tsx:182` | **Funktionsfel:** `ctx.klaraKurser / 307` — procent blir fel när biblioteket har 324 |
| `src/components/ak1a/chat-widget.tsx:187+231+264+387` | AI-mentor-texter: "307 kurser", "78 BOKMASTER-böcker" |
| `data/blogg/5-vanliga-nyborjarmisstag…json` + `data/blogg/komplett-guide…json` | "alla 307 kurserna" (2 publicerade inlägg) |

Funktionella fallbackar (P2): `manifest/page.tsx:29+31` (`|| 307` / `|| 78`), `laroplan/page.tsx:11+13` ("73 kurser" i description — läroplansurval, korrekt, men "av totalt 307" i kommentar).

Ej synliga kommentarer (P3): om-oss:16–17, kurser:13, logga-in:11, manifest:12, chatbot:78, footer:82+95, deep-consultation.tsx:51, laroplan.tsx:71 ("78 böcker" i UI-beskrivning — **synlig**, dra till P2).

Dynamiskt korrekta (bra mönster att efterlikna): `om-oss/page.tsx` (kurserLista.length), `manifest/page.tsx:55` (`{kurser} kurser` räknas), `api/chatbot/route.ts:79+86` (antalKurser), `spa-hem`/`laroplan.tsx` (totalKurser).

**Slutsats:** FAIL. Direktivets förväntade gamla tal (285–320) stämde inte med verkligheten — det aktuella inaktuella talet är **307** (och BOKMASTER **78** vs faktiskt **93**).

## Kontroll 8 — Metadata/SEO — PASS (2 noindex-undantag)

- Alla publika pages (34 SeoPageShell-sidor + SPA-hem + /pro + /fas3 etc.) har `export const metadata` eller `generateMetadata`, i regel via `pageMetadata()` (`src/lib/seo.tsx:39`) med "| AK1A" i titeln, canonical, hreflang och OG.
- Root-layouten (`src/app/layout.tsx:46`) sätter default-titel "AK1A Research Lab — Från utbildning till inkomst | Ak1 Apex Nexus".
- Dynamiska sidor (analyser/[ticker] via `analysisMetadata`, blogg/[slug], kurser/[slug], labb/[id]) har metadata-genererare med AK1A-namn.
- **Undantag (båda ok men värda noindex-meta):** `src/app/admin/page.tsx` och `src/app/pro/admin/page.tsx` saknar metadata-export ("use client"). De är lösenordsskyddade och `disallow` i `src/app/robots.ts:29` (`/admin`, `/pro/admin`), och ärver AK1A-namnet från root-layouten.

**Slutsats:** PASS.

---

## Prioriterad fix-lista

**P1 — gör nu (SEO- och funktion påverkan)**
1. Kursantalssynk 307→324 (och BOKMASTER 78→93) på alla användarsynliga ställen: `src/app/kurser/page.tsx` (title+description), `src/app/logga-in/page.tsx`, `src/app/manifest/page.tsx` (description), `src/app/api/chatbot/route.ts` (3 st), `src/components/ak1a/chat-widget.tsx` (4 st). Bäst: byt hårdkodade tal mot `getCourseList().length` där möjligt; i statisk metadata använd 324/93.
2. Fixa räknefelet i `src/components/ak1a/chat-widget.tsx:182` — divisor 307 → dynamiskt antal (324), annars visar elevens klarhetsprocent fel.
3. Byt söknyckel i `src/lib/sokindex.ts:23`: "bibliotek 285 kurser" → "bibliotek 324 kurser" (eller generera dynamiskt).
4. Uppdatera 2 publicerade blogginlägg i `data/blogg/` ("alla 307 kurserna" → 324).

**P2 — snarast**
5. Fallback-talen i `src/app/manifest/page.tsx:29+31` (`|| 307`, `|| 78`) → 324/93.
6. `src/components/ak1a/laroplan.tsx:71` — UI-beskrivning "78 kompletta böckers visdom" → 93.
7. Lägg /fas2-ansok-CTA i SPA-footern (`src/components/ak1a/footer.tsx`) — enda nav-yta utan den.

**P3 — hygien**
8. Uppdatera inaktuella datumskommentarer ("Uppdaterad 2026-09-01: 307 kurser") i om-oss, kurser, laroplan, logga-in, manifest, chatbot:78, footer:82+95, deep-consultation:51.
9. Överväg `metadata: { robots: { index: false } }`/noindex-export för /admin och /pro/admin (är redan robots-disallowade; metadata är defense-in-depth).
10. Ev. harmonisera disclaimer-formuleringen till en kanonisk sträng ("Pedagogisk analys — inte investeringsråd") i de tre verktyg som idag skriver "Pedagogiskt verktyg/screeningverktyg".

**Systemiskt förslag:** inför en enda källa för siffrorna (t.ex. `getStats()` i `src/lib/content.ts` som returnerar kurser/bokmaster/quiz) och låt chatbot, chat-widget och statiska metadatas referera den — då kan inte detta hända igen vid nästa kurstillväxt.

---

*Rapport genererad av AI-styrelsens branding-audit, 2026-09-02. Alla fynd verifierade med grep + filläsning; inga kodändringar har gjorts.*
