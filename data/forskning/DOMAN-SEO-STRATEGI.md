# DOMÄN- & SEO-STRATEGI — ak1nvestor.com + lab.ak1nvestor.com

> Kunddirektiv 2026-09-19: "google känner till ak1nvestor.com men inget av
> lab.ak1nvestor.com, så vi behöver få SEO... +10000 våningar inte bara 100"

## NULÄGE (sanningen)

| Domän | Vad | Google | Behov |
|---|---|---|---|
| **ak1nvestor.com** | WordPress + Thrive Themes (gammalt system) | ✅ Indexerad | Behålla SEO-värdet |
| **lab.ak1nvestor.com** | Next.js (AK1A Research Lab — 426 kurser, 386 poster) | ❌ Ej indexerad | Få Google att hitta den |

**Problemet:** Hela plattformen (kurser, dataset, verktyg) lever på lab.ak1nvestor.com som Google inte känner till. Allt SEO-arbetet organismen gjort (llms.txt, sitemap, speglar) hjälper inte om domänen inte är indexerad.

## STRATEGI (tre faser)

### FAS 1: Koppla samman ( direkt — 24h)

```
ak1nvestor.com (WordPress/Thrive)
  ├── Länkar till lab.ak1nvestor.com (menyn, sidorna)
  ├── Blogg-inlägg som länkar till kurserna
  └── Thrive Themes-landing → "Börja gratis på AK1A Lab"

lab.ak1nvestor.com (Next.js)
  ├── robots.txt: tillåt ALLA crawlers (redan gjort)
  ├── sitemap.xml: Alla 500+ sidor (redan genererad)
  ├── llms.txt: AI-sökmotorer (redan genererad)
  └── Interna länkar mellan alla sidor (redan byggt)
```

**Åtgärd hos kunden (one.com):**
1. Kontrollera att lab.ak1nvestor.com har DNS A-post → 5.189.162.162 (borde redan)
2. I WordPress: lägg till länk till lab.ak1nvestor.com i menyn
3. Skriv ETT blogginlägg på ak1nvestor.com som länkar till lab.ak1nvestor.com

**Åtgärd på servern (jag gör):**
1. Search Console-verifiering (meta-tag i layout)
2. Förbättrad sitemap med alla nya sidor
3. Canonical URLs på lab.ak1nvestor.com

### FAS 2: SEO-indexering (vecka 1)

```
Google Search Console:
  1. Lägg till lab.ak1nvestor.com som ny egendom
  2. Verifiera via DNS TXT-post (one.com)
  3. Skicka in sitemap.xml
  4. Begär indexering av nyckelsidor

Bing Webmaster Tools:
  1. Lägg till lab.ak1nvestor.com
  2. Skicka in sitemap

AI-sökmotorer (Perplexity, ChatGPT Search):
  1. llms.txt är redan live — AI:er kan läsa plattformen
  2. llms-full.txt med alla 500+ sidor
```

### FAS 3: Domän-konsolidering (månad 1-3)

**Rekommendation: Flytta plattformen till huvuddomänen**

| Steg | Vad | Varför |
|---|---|---|
| 1 | Byt Next.js-appen till **ak1nvestor.com** (huvuddomän) | Samla ALL SEO-authority på EN domän |
| 2 | Flytta WordPress till **blog.ak1nvestor.com** | Behåll gamla inlägg + Thrive Themes |
| 3 | 301-redirect alla gamla WordPress-URL:er | Behåll SEO-värde |
| 4 | lab.ak1nvestor.com → 301 till ak1nvestor.com | Samla allt |

**Resultat:**
```
ak1nvestor.com = HELA plattformen (kurser, dataset, studio)
blog.ak1nvestor.com = WordPress/Thrive (gamla inlägg, marknadsföring)
app.ak1nvestor.com = Studio (AI-chatten) [alternativ]
```

## 10 000 VÅNINGAR — vägen dit

Organismen producerar ~100 poster/dygn autonomt. För 10 000:

| | Poster/dygn | Dagar till 10 000 |
|---|---|---|
| Nu (1 VPS, 8 GB) | ~100 | 100 dagar |
| Med 32 GB RAM | ~400 | 25 dagar |
| Med extra VPS | ~800 | 12 dagar |

**Innehållspyer för 10 000 våningar:**

```
Nivå 1: Grundbegrepp (100 poster) — P/E, substans, risk...
Nivå 2: Branschguider (500 poster) — 50 branscher × 10 indikatorer
Nivå 3: Bolagsanalyser (2000 poster) — 200 bolag × 10 nyckeltal
Nivå 4: Kvartalsläspaket (4000 poster) — 200 bolag × 20 kvartal
Nivå 5: Dataset-aspekter (1500 poster) — 30 branscher × 50 aspekter
Nivå 6: Kurser & lärvägar (1000 poster) — djupgående utbildning
Nivå 7: M9-serier (1000 poster) — löpande marknadsanalyser
= TOTALT 10 100 poster
```

## AI-SEO-OPTIMERING (hur organismen optimerar)

Organismen kan redan:
1. **Generera SEO-optimerat innehåll** — titlar, meta, OpenGraph, H1-H3
2. **Internlänka** — 16+ interna länkar per text, verifierade 200
3. **Sitemap** — auto-genererad med alla nya sidor
4. **llms.txt** — AI-sökmotorer läser hela plattformen
5. **Trespråkiga speglar** — sv/en/ar (triple SEO-yta)
6. **Page Speed** — LCP < 3s, CLS 0, skelettkur, cache-headers
7. **Structured Data** — JSON-LD, FAQPage, Course schemas

Organismen behöver (för full SEO):
1. **Search Console API** — automatisk indexering av nya sidor
2. **Rank tracking** — övervaka positioner för nyckelord
3. **Content gap analysis** — hitta saknade ämnen som konkurrenter rankar för
4. **Backlink monitoring** — se vilka som länkar till oss

## NÄSTA STEG (kundens beslut)

| # | Beslut | Alternativ |
|---|---|---|
| 1 | **Domän-strategi** | A: Behåll lab. + länka från ak1nvestor.com / B: Flytta allt till ak1nvestor.com |
| 2 | **WordPress** | A: Behåll på ak1nvestor.com / B: Flytta till blog.ak1nvestor.com |
| 3 | **Search Console** | Lägg till lab.ak1nvestor.com (kund gör i Google-konto) |
| 4 | **Skala för 10 000** | A: 32 GB RAM (4x fart) / B: Extra VPS (8x fart) / C: Båda |

## VAD JAG KAN GÖRA AUTONOMT

- ✅ Publicering-panel i admin
- ✅ Sitemap-förbättringar
- ✅ robots.txt-optimering
- ✅ JSON-LD på alla sidor
- ✅ Internlänkar mellan alla 500+ sidor
- ✅ Meta-tags och OpenGraph
- ✅ Page Speed (redan optimerad)
- ✅ llms.txt och llms-full.txt
- ❌ DNS-ändringar (one.com — kundens konto)
- ❌ Search Console (Google-konto — kundens)
- ❌ Domän-flytt (R2 — kundens beslut)
