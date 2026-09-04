# M8 — Social distribution + delningsekonomin (2026-09-04)

Forskningsleverans till MARKNADSMOTORN. Granskning av kodbasen + webbforskning 2026 + design + implementeringsskiss. BYGGT HAR INGET — allt nedan är skiss.

---

## 1. GRANSKNING — nuläget i koden

### 1.1 OG-bilder: FINNS EJ (största hålet)

- `src/lib/seo.tsx` — `pageMetadata()` (rad 83–97) bygger `openGraph` **utan `images`** och `twitter` med `card: "summary_large_image"` men **utan `images`**. Konsekvens: sajten deklarerar "stor bild" på varje sida men levererar ingen → Facebook/LinkedIn/X/WhatsApp/Slack-visar rena textlänkar (eller slumpmässig ikon).
- `src/app/layout.tsx` (rad 77–91) — root-metadata har `openGraph` utan `images`; dessutom `url: "https://ak1nvestor.com"` som **avviker** från `SITE_URL` (`lab.ak1nvestor.com`, seo.tsx rad 12).
- `public/` — ingen 1200×630-bild finns: bara `ak1a/favicon.svg`, `apple-touch-icon.png`, `ikon-192/512.png`, loggor/skulpturer. Ingen `opengraph-image.tsx`-filkonvention, ingen `/api/og` (api-katalogen saknar den).
- `articleJsonLd`/`analysisJsonLd` (seo.tsx rad 292–324) saknar `image`-fält → svagare Article-rich-results.
- NOT: `DelaKort` (dela-kort.tsx) bevisar att 1200×630-mallar med varumärkes-DNA redan finns i form av SVG-kod (marin `#0E1B2E`, guld `#E8C766`, crème `#EDE6D6`, Georgia-serif) — återanvändningsbar grund.

### 1.2 Vad DelaKort delar (idag)

`src/components/ak1a/dela-kort.tsx` — används i `min-sida.tsx` + `kurs-steg.tsx` (efter klarad kurs); `certifikat.tsx` har egen share-logik:

- Elevkort SVG → canvas → PNG 1200×630 med nivå/kurser/streak + **egen QR-kodare** (GF(256), Reed-Solomon, EC-M, version 1–6 — helt utan beroenden) → QR pekar alltid på **startsidan** `lab.ak1nvestor.com`.
- Web Share API (`navigator.share` + `canShare({files})`) med clipboard-fallback — redan 2026-best practice-mönstret.
- Helt frivilligt ("tipsa, tvinga aldrig"), ritas lokalt i browsern, ingen data lämnar klienten.

### 1.3 Övrigt

- **Blogg** (`src/app/blogg/[slug]/page.tsx`) och **analyser** (`src/app/analyser/[ticker]/page.tsx`): `force-static` + `generateStaticParams`, korrekt metadata/JSON-LD — men **noll del-funktionalitet**. 40 bloggposter (`data/blogg`), 11 analyser (`data/analyses`).
- **Footer** (`footer.tsx`): inga sociala profil-länkar alls (endast e-post + egen domän).
- **Vbout** (`src/lib/vbout.ts`): `skickaVboutLead()` — lead-webhook via `VBOUT_WEBHOOK_URL` (host-vitlista, DNS-rebinding-skydd, 10 s timeout, kastar aldrig). `kalla`-värden: medlem/fas2-ansok/prenumeration/nyhetsbrev/manuell. **Ingen API-nyckel → inga utskick möjliga.**
- **Mall att efterfölja**: `scripts/seo-generate.mjs` — deterministisk build-generator → `data/seo/{kurser,analyser,blogg}/*.json` som `loadGeneratedMeta()` läser. Samönstret passar OG-förlagning. `sharp ^0.34.3` finns redan i `package.json`.

---

## 2. FORSKNING 2026 (källor i §5)

### 2.1 OG-image best practice

- **1200×630 px (1.91:1) är fortfarande universell standard 2026**; minimum 600×315; PNG eller JPG (80–90 % kvalitet).
- Text måste vara **läsbar i tumnailsstorlek** (previews visas ofta små); kritiskt innehåll centrerat med marginal mot beskärning (LinkedIn beskär ogärna, X föredrar 2:1 men accepterar 1.91:1).
- Checklist: inga 404, rätt dimensioner, läsbar text, konsekvent varumärke.

### 2.2 Share-to-unlock vs öppen generositet — BEDÖMNING: ÖPPEN VINNER (för AK1A)

- Gating kan lyfta leadkonversion ~40 % (varma besökare) men **dödar reach, förtroende, SEO och AI-synlighet** — direkt mot kundens strategi (llms.txt + öppna AI-crawlers + "Håll know-how, redovisa generöst").
- "Pay with a tweet"-mekaniken är en 2011–2014-företeelse: ingen modern benchmark stödjer den; API-restriktioner och integritetsförändringar har begränsat den; forskning är i princip frånvarande.
- Organisk/earned delning ger **28 % högre engagemang och 4× CTR** än varumärkesinnehåll — frivillighet (DelaKort-modellen) är rätt mekanik; tvångsdelande avfördas.
- Slutsats: AK1A ska aldrig låsa innehåll bakom delning. Dela = erbjudande, aldrig vägg. Det är också det pedagogiska varumärkeslöftet ("tipsa, tvinga aldrig").

### 2.3 Social distribution för edtech/fintech 2026

- Fintech-CAC **+40 % sedan 2023** → organisk/content-LEDbreven växer; social SEO (sök inuti TikTok/YouTube/IG) är ny top-of-funnel — för AK1A mest relevant som Google+AI-sök (redan täckt av llms.txt-arbetet); delningsbara analyskort är den realistiska "sociala" ytan för en textburen svensk metodikplattform.
- Community + zero-party data ersätter betald retargeting; en-knapps-delning (Web Share API) med copy-link-fallback är 2025/26-konsensus — gamla per-nätverk-knapprader har nästan noll engagemang.

### 2.4 OG-generation: förlagda vs dynamisk endpoint

- Next `opengraph-image.tsx` + `generateStaticParams()` → **statiskt vid build** (inga runtime-anrop); `/api/og`-edge ger alltid-färskt men kostar function-invocations och `next/og`-PNG:er är tunga.
- SSG-sajt (force-static överallt) + deterministisk kultur (seo-generate.mjs, siffor.ts) → **förlagda PNG:er vid build via script (satori+sharp) är den SSG-vänliga vägen**; metadata pekar på `/og/*.png` som CDN:as som vanliga statiska filer. DelaKort-QR-kodaren kan t.o.m. återanvändas server-side (ren TS) för analys-OG med QR.

---

## 3. DESIGN

### (a) OG-bilder — förlagda per sidtyp (SSG-vänligt)

- Nyläge som idag: runtime `/api/og` avvisas ( bryter mot force-static-DNA, cold starts, tunga PNG:er). Istället: **`scripts/og-generate.mjs`** i seo-generate-mönstret:
  - Mallar (satori, JSX-lik syntax; Georgia/system-serif + marin/guld/crème ur DelaKort): `start` (fast), `kurs`, `blogg`, `analys` — titel-overlay + sidtyps-etikett + domän.
  - Utdata `public/og/`: `start.png` + en per bloggpost/analys/kurs (titel inbakad) + `default.png`.
  - Server-side QR återanvänder DelaKort:s encoder (är ren TS) → analys-OG:n får QR till analys-URL:en (differentiering mot generiska previews).
- `pageMetadata()` utökas: `openGraph.images: [{ url, width: 1200, height: 630, alt }]` + `twitter.images`; root-layouten pekas mot `/og/start.png` och `lab.ak1nvestor.com`. `articleJsonLd`/`analysisJsonLd` får `image`.
- Bloggtitlar är långa → mall med automatisk 2-raders brytning + clamp (~70 tecken) i scriptet (deterministiskt, testbart).

### (b) Delningsväggen → "del-raden" (öppen, diskret)

- Ny klientkomponent `src/components/ak1a/del-rad.tsx`: **en** "Dela"-knapp (Web Share API: title + text + URL) + "Kopiera länk" (clipboard + toast) + subtil "Hittade du detta värdefullt? Dela gärna." — ingen belöning, inget lås, inga tredjepartsskript.
- Placering: slutet av varje bloggpost (`blogg/[slug]`) och analysdetaljsida (`analyser/[ticker]`), före nästa-steg-blocket.
- **DelaKort på analyser**: generalisera `byggKortSvg` med `typ: "elev" | "analys"` — analyskort visar bolag, ticker, rekommendation, AKM1-poäng + QR till analys-URL:en (inte startsidan). QR-modulerna kräver att skalan/position parametriseras — encoder är redan URL-agnostisk.

### (c) Vbout djupare — krav dokumenteras, ej byggs

- Idag: lead in. Nyhetsbrevsutskick ("publicerad analys → ämne") kräver **`VBOUT_API_KEY`** (autenticering per anrop, developers.vbout.com) — kunden måste generera och lämna nyckeln via Settings i sitt Vbout-konto; env-variabel + hemlighetshantering som `VBOUT_WEBHOOK_URL`.
- Tills nyckel finns (ärlig dokumentation): (1) publicerings-flödet kan skicka ett **lead-formatat event** på befintlig webhook med `kalla: "analys-publicerad"` + `notering: "XYZ.ST — rubrik"` — kundens Vbout-automation kan sedan trigga utskick redigerat i Vbout-editorn (mappningen sker kundsida); (2) helt manuellt: ny analys = ämne i Vbout-editorn.
- Ingen API-nyckel i kod/exempel/loggar — samma policy som webhooken.

### (d) Sociala profil-länkar — platshållare

- Ny `src/lib/sociala.ts`: `SOCIALA_PROFILER = [{ id: "linkedin", url: "" | null }, { id: "youtube", … }, { id: "x", … }, { id: "instagram", … }]` — **endast ifyllda renderas** (aldrig döda länkar), med TODO-kommentar "URL:er levereras av kunden".
- Footer: diskret ikonrad (lucide-ikoner, aria-label) + samma data matar `sameAs` i `organizationJsonLd()` när ifyllt.

---

## 4. IMPLEMENTERINGSSKISS — BYGG EJ (ordning = beroende)

```
1. deps:      bun add satori                       // sharp finns redan (^0.34.3)
2. scripts/og-generate.mjs                         // seo-generate-mönstret
   - mallar: og/mallar/{start,kurs,blogg,analys}.tsx-lik (satori JSX)
   - loop: data/blogg (40), data/analyses (11), public/deep-courses.json
   - ut: public/og/{start,default}.png + {slug|ticker}.png (1200×630)
   - analys-mall: bolag + ticker + rek + AKM1-poäng + QR (återanvänd
     dela-kort.tsx:s QR-encoder — extrahera till src/lib/qr.ts, ren TS)
3. src/lib/seo.tsx
   - pageMetadata(): + images (og + twitter), alt-text per sidtyp
   - layout.tsx: openGraph.url → lab.ak1nvestor.com, images → /og/start.png
   - articleJsonLd/analysisJsonLd: + image: `${SITE_URL}/og/...`
4. src/components/ak1a/del-rad.tsx  ("use client")
   - navigator.share({title,text,url}) → fallback clipboard + toast (useToast)
   - prop: { titel, beskrivning, path }
5. dela-kort.tsx: byggKortSvg({ typ: "analys", bolag, ticker, rek, poäng, url })
   - QR mot analys-URL; används på analyser/[ticker] under del-raden
6. src/lib/sociala.ts + footer.tsx: ikonrad (endast ifyllda) + sameAs
7. Vbout: DOKUMENTERA kravet VBOUT_API_KEY (denna fil §3c räcker tills
   kunden lämnar nyckel; inget nytt flöde byggs)
8. package.json: "og": "node scripts/og-generate.mjs" + koppla till
   befintlig build/cron-kedja (samma plats som seo-generate körs)
```

Kostnad: ~1–1,5 dag byggtid när beslut fattas; inga runtime-kostnader (allt statiskt).

### Trea-rekommendationer (prioriterade)

1. **Förlagda OG-bilder per sidtyp** (§3a) — störst effekt per timme: varje delning på LinkedIn/X/WhatsApp/Slack får plötsligt ett professionellt kort; idag deklarerar sajten large_image som inte finns. SSG-ren, deterministisk, CDN-cachad.
2. **Öppen del-rad + analys-DelaKort** (§3b) — Web Share + kopiera-länk på 51 sidor (40 blogg + 11 analyser); förstärker varumärket "generös, aldrig tvingande" och ger analyserna en QR-rak länk in.
3. **Sociala platshållare + Vbout-kravsdokumentation** (§3c–d) — 30 minuter jobb; blockerad input markeras ärligt (profil-URL:er + `VBOUT_API_KEY` levereras av kunden), sameAs kopplad när data finns.

---

## 5. KÄLLOR

**OG-bild:**
- [Krumzi — OG-sizes 2026 (1200×630)](https://www.krumzi.com/blog/open-graph-image-sizes-for-social-media-the-complete-2026-guide)
- [Pagethen — OG best practices 2026](https://pagethen.com/blog/og-image-best-practices)
- [OpenGraphPlus — Facebook images](https://opengraphplus.com/consumers/facebook/images) · [iamturns — OG-size](https://iamturns.com/open-graph-image-size/) · [Screenhance](https://screenhance.com/blog/og-image-size-guide)

**Share-to-unlock vs öppen:**
- [Passionfruit — gated content-paradoxen (+41 % leads)](https://www.getpassionfruit.com/blog/how-to-use-gated-content-for-lead-generation-without-killing-your-seo-or-ai-visibility)
- [ProductLed — när man ska ungate (SEO/AI-synlighet)](https://productled.com/blog/when-you-should-ungate-content)
- [LeadSpot — gated vs ungated B2B-data](https://lead-spot.net/research/gated-vs-ungated-content-why-high-value-gated-assets-still-win-big-in-b2b-demand-gen/)
- [Sprinklr — earned sharing 28 % engagemang / 4× CTR](https://www.sprinklr.com/blog/social-media-marketing-statistics/)
- [Elegant Themes — pay-with-a-tweet-eran](https://www.elegantthemes.com/blog/tips-tricks/allowing-visitors-to-pay-for-content-with-social-media-interaction)

**Web Share API / del-knappar:**
- [Can I use — navigator.share](https://caniuse.com/wf-share) · [MDN — Navigator.share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share)
- [Bryan Braun — Web Share API](https://www.bryanbraun.com/2023/03/17/theres-a-lot-to-like-about-the-web-share-api/)
- [FreshJuice — share buttons are dead](https://freshjuice.dev/blog/social-share-buttons-are-dead/) · [LogRocket — Web Share API-engagemang](https://blog.logrocket.com/how-to-improve-social-engagement-with-the-web-share-api/)

**Edtech/fintech-distribution 2026:**
- [Data Ally — fintech-marknadsstatistik 2026 (CAC +40 %)](https://www.dataally.ai/blog/fintech-marketing-trends)
- [Coalition Technologies — social SEO ny top-of-funnel](https://coalitiontechnologies.com/blog/6-social-media-trends-to-shape-your-marketing-strategy-in-2026)
- [Hootsuite — Social Trends 2026](https://www.hootsuite.com/research/social-trends) · [Sprout Social — 7 trender 2026](https://sproutsocial.com/insights/social-media-trends/)
- [Aurelius — EdTech Marketing 2026](https://www.aureliusmedia.co/blog/edtech-marketing) · [DataIntelo — financial literacy-marknaden ($12,8 B → $28,6 B)](https://dataintelo.com/report/financial-literacy-education-market)

**Next.js OG-generation:**
- [Next.js docs — opengraph-image-filkonvention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)
- [Vercel — OG Image Generation](https://vercel.com/docs/og-image-generation) · [MakerKit — dynamic OG med Next 16](https://makerkit.dev/blog/tutorials/dynamic-og-image)
- [thedon — OG vid build-time](https://www.thedon.com.br/blog/create-next-og-image-at-build-time) · [dev.to — OG-overengineering](https://dev.to/topcat/overengineering-opengraph-image-generation-on-vercel-5fh) · [Next.js #60366 (tunga PNG:er)](https://github.com/vercel/next.js/discussions/60366)

**Vbout:**
- [VBOUT Developer Network — API-dokumentation (API-nyckel)](https://developers.vbout.com/docs/) · [VBOUT Help Center — API & kopplingar](https://help.vbout.com/knowledge-base/api-and-connectors/)
