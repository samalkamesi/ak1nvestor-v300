# FORSKNING B2B — Grunderna för "den andra sidan": pro-rapportbyggare för rådgivare och analytiker

**Datum:** 2026-09-01 · **Metod:** Strukturerad webbdjupforskning (officiella produkt-/pris-sidor, regulatoriska originalkällor ESMA/EUR-Lex/FI, branschjämförelser, produktionserfarenheter av PDF-generering i Next.js), syntes mot AK1A-ekosystemet (AKM1 20 variabler, AK1TS vågmatris 5×5×4, Konfluensmetodiken, VÅGFUNDAMENT 20×5, Fas 1–3-modellen 0 / 9 999 / 13 999 kr) · **Syfte:** Kunskapsbas och designunderlag för **/pro** — den skilda B2B-värld där rådgivare och analytiker bygger egna AK1A-DNA-rapporter baserat på portföljer.

**Kärnslutsats (för den otålige):** Marknaden har ett tydligt prisgap — TIKR/Koyfin Pro (~55–80 USD/mån, ingen white-label) och Morningstar Direct/FactSet (~17 000–25 000 USD/år/seat, full white-label). Mittenskiktet "Koyfin Advisor Core/Pro" (209–299 USD/mån, ~2 200–3 100 kr/mån) är närmaste referens. Ingen aktör — ingenstans i prissegmentet — säljer en *metodik* (deterministisk, hierarkisk fundamental- och prisvågsklassificering med konfluens-grind) som rättighetsstyrd rapportmodul. Det är AK1A:s blå hav. MVP = CSV-portföljimport + 3 låsta AK1A-rapportmallar med white-label + PDF-export via @react-pdf/renderer — inget drag-och-släpp i första versionen.

> **Ärlighetsdeklaration:** Institutionspriser (Morningstar Direct, FactSet, Metafore, Millistream) publiceras inte öppet — siffror nedan är tredjepartsskattningar/UPPGIFTER från procurementsajter och gamla SEC-filingar och är märkta [est.]. Konsument-/proffspriser för TIKR, Koyfin, Simply Wall St, YCharts är verifierade mot officiella pris- och produktsidor (2026-09-01). Allt som är Koyfin-specifikt kommer från deras egen prissida; allt ESMA/LVF-specifikt kommer från primära regulatoriska källor.

---

## DEL 1 — Hur proffs-plattformarna ser ut: rapportbyggare, priser, data-licenser

### 1.1 Jämförelsetabell (vertikal prissättning per analytiker-seat)

| Plattform | Pris (per användare/seat) | Rapportbyggare | White-label/branding | Data-licens |
|---|---|---|---|---|
| **Morningstar Direct** | Ej publicerat; [est.] ~17 500+ USD/år entry, enterprise-offert; historiskt ~6 000 USD/användare/år (SEC 10-K 2016, gällande "Office") | **Presentation Studio**: dra-och-släpp av Morningstar-diagram/tabeller + egna data, 60+ anpassningsbara mallar, mall-hierarki för firmakonsistens | Ja — "din unika logo och branding" | Ingår (Morningstar-data); extra betalning för tillägg |
| **FactSet** | 4 000–30 000 USD/användare/år; mediankontrakt 20 500–25 200 USD [est., procurementsajter]; ~24 000 USD standard med 2-årsbindning citeras på Quora | **Pitch Creator** (AI-driven, jan 2025) + Office-plugin: varumärkta slides, mallar, källlänkad data; "Report Builder"-API:er = datauttag (fundamentals/estimates), inte layout | Ja — "custom branded, deal-ready pitchbooks" | Ingår; à la carte-modell driver priset |
| **TIKR** | Plus ~10–15 USD/mån; **Pro 54,95 USD/mån**; Ultimate 79,95–119,95 USD/mån. Ingen teamplan — en sittning per analytiker | Ingen rapportbyggare — skärmdumpar/export ur terminalen; reverse-DCF, konsensus, 20 års historik (Pro) | Nej | Ingår (S&P Global-baserad); redistribueringsrätt saknas |
| **Koyfin** | Free / Plus 39 / **Premium 79** / Advisor Core 209 / **Advisor Pro 299 USD/mån** (≈ 2 100–3 100 kr/mån); team: offert; rabatt för rådgivare < 100 MUSD AUM | Dashboards + anpassningsbara rapportsidor; **klientrapporter volymbegränsade: 10/mån (Core), 200/mån (Pro)**; "fully customizable report pages" endast Pro | Delvis — klientriktade rapporter; ingen uttalad white-label på pris-sidan | Ingår; custodian-integrationer (Pro: flera + PMS) |
| **Simply Wall St** | Free (5 rapporter/mån) / Premium ~10 USD/mån [tredjepartsgranskning] / Unlimited (högre); "Business & Enterprise": kontakt | Färdig "Snowflake"-rapport per bolag (1 visuellt dokument), PDF/Excel-export på högre nivåer, portföljvyer | Nej (B2B via skräddade partnerintegrationer, t.ex. Class i Australien) | S&P Global Market Intelligence (återförsäljs i produkten) |
| **YCharts** | Standard 300 USD/användare/mån; Professional 500 [tredjepartsjämförelse]; team 500–1 500 USD/mån [est.] | "Report Builder"-funktioner med mallar för prospekt/förslag | **Ja — uttalad firm-branding i rapporter** | Ingår i prenumeration |

**Mönstret:** Priset skalar med (1) data-licensens bredd/djup, (2) om rapporten får bära *kundens* varumärke, (3) om klientvolym/rapportvolym är obegränsad. Rapportbyggaren är alltid produktens kärna på institutionsnivå (Morningstar lagar hela Presentation Studio som egen produktmodul) men är *frånvarande* på konsument-/proffsnivå under ~100 USD/mån — där får användaren dashboards, inte dokument.

### 1.2 rapportbyggarnas anatomi (vad "bygga en rapport" betyder 2026)

- **Morningstar Direct Presentation Studio** (referensmodellen): (a) basera ny rapport på mall eller befintlig rapport, (b) dra-och-släpp diagram/tabeller/grafter + egna data, (c) applicera firmans logo/färger, (d) spara som firmamall för konsistens "och enkla jämförelser", (e) exportera/distribvera. Källor: [Produktsida](https://www.morningstar.com/business/products/direct/presentation-studio) · [Using Templates (Morningstar Community)](https://community.morningstar.com/s/article/Using-Presentation-Studio-Templates) · [Presentation Studio Guide 2025 — 60+ mallar](https://www.scribd.com/document/836758158/Presentation-Studio-Guide-2025).
- **FactSet Pitch Creator**: AI + Office — juniorbankiren får källlänkad data i varumärkta mallar på minuter i stället för timmar. Källor: [FactSet Marketplace](https://www.factset.com/marketplace/catalog/product/pitch-creator) · [Pressrelease](https://investor.factset.com/news-releases/news-release-details/factset-launches-ai-powered-pitch-creator) · [Banker Efficiency Solutions](https://www.factset.com/solutions/banker-efficiency-solutions).
- **Koyfin Advisor-spåret** (närmaste affärsmodell för AK1A): Advisor Core/Pro = "full workflow plan for financial advisors" — importera en prospekts mäklarutdrag (Pro: PDF-upload) som klientportfölj, analysera innehaven, generera klientfärdiga förslag/rapporter (volymbegränsat), custodian-integrationer. Källor: [Koyfin pricing](https://www.koyfin.com/pricing/) · [Koyfin for Financial Advisors](https://www.koyfin.com/for-financial-advisors/financial-advisors/) · [Koyfin pricing-llm-info](https://www.koyfin.com/pricing-llm-info/).
- **YCharts**: bygg modelportföljer → generera prospekts-/klientrapporter med firmans branding; riktad mot "win new clients". Källor: [ycharts.com](https://ycharts.com/) · [LinkedIn-analys](https://www.linkedin.com/) · [US Tech Automations genomgång (team-priser)](https://ustechautomations.com/resources/blog/best-reporting-analytics-software-financial-advisors-2026).

### 1.3 Vad som krävs: data-licenserna (den dolda kostnaden)

- **Ingen proffsplattform äger sin data** — alla licenserar (S&P Global, Refinitiv/LSEG, FactSet content, Morningstar in-house). Simply Wall St bygger öppet på [S&P Global Market Intelligence](https://simplywall.st/).
- **Återförsäljning/redistribution är licensfråga nummer ett för B2B**: att visa data internt för en inloggad analytiker är en sak; att låta en rådgivares *klient* ta del av samma data i en exporterad PDF är redistribution och kräver databyggherrens medgivande (den är dyr). Därför har t.ex. TIKR ingen export-white-label.
- **Nordisk/Svensk datakälla**: [Millistream](https://millistream.com/) (svensk leverantör, realtid/historik från Nasdaq Nordic + fundamentals, nyckeltal, kalendrar — [Millistream Trader](https://millistreamtrader.com/)), SIX/VWD, Nasdaq Nordic egna feeds. Pris: offert, aldrig publicerat.
- **Konsekvens för AK1A:** dagens Yahoo-crumb-flöde räcker för pedagogisk plattform; en /pro-sektion med white-label-PDF mot slutkonsument (rådgivarens kund) = redistributebar data → kräver antingen (a) licens (Millistream är naturlig nordisk partner), eller (b) designval: AK1A-rapporten presenterar **AK1A:s egna klassificeringar och poäng** (vägklasser, nivåer, konfluensgrader) med priset/data endast som internt beräkningsunderlag — metodik-utdata är vår IP, inte databytet. Alternativ (b) är billigare, mer defensibelt och mer "Coca-Cola-syrup".

---

## DEL 2 — White-label-rapportering för wealth managers och svenska rådgivare

### 2.1 Kategorin i stort

- **Rådgivarplattformar med white-label-rapportering**: [Orion Advisor Tech](https://fundcount.com/best-portfolio-reporting-software/) (bäst på anpassningsbara, varumärkta rapporter + klientportal), [Aleta](https://aleta.io/white-label-family-office-software) (white-label family office-software, konsoliderad rapportering), [Asset Vantage](https://assetvantage.com/blogs/white-label-reporting-software/), [Masttro](https://masttro.com/wealth-management-software), [NeoXam PMS](https://www.neoxam.com/pms/), [Wize](https://www.wize.net/en/wize-asset-management-reporting). Gemensamt: rapporten är *plattformens* commodity — alla kan trycka en snygg PDF med kundens logo.
- **Innehålls-white-label (annan kategori, AK1A-relevant!)**: [MarketDesk White Label](https://marketdeskresearch.com/whitelabel) — 200+ wealth management-firmor köper färdiga nyhetsbrev/presentationer i Word/PPT, slänger på sin logo och skickar till klienter; leverans var 90:e dag, compliance-stöddokument ingår. **De säljer inte data — de säljer analys-innehåll under kundens varumärke.** Detta är exakt den affärsform AK1A:s metodik-modul kan ta (men med vår rapportmotor istället för Word-filer).
- **Familjekontor/RIA-verktyg** ([The Wealth Mosaic-katalog](https://www.thewealthmosaic.com/needs/portfolio-analysis-reporting-tools/)) bekräftar bilden: mängden "portföljanalys & rapportering"-verktyg är stor, men de är alla **beskrivande** (avkastning, allokering, risk) — ingen är **preskriptiv-metodisk** (vågklass × fundamentalnivå × konfluens med hård värde-grind).

### 2.2 Svenska marknaden: vad använder rådgivare idag?

| Segment | System (exempel) | Betydelse för AK1A |
|---|---|---|
| **Banker (storbankarna)** | Egna kedjor + [Tieto Savings & Wealth Management](https://www.tieto.com/en/industries/financial-services/savings-and-wealth-management/), FNZ-infrastruktur; diskretionär förvaltning t.ex. [Nordea från 500 000 kr](https://www.nordea.se/privat/produkter/kundprogram/diskretionar-forvaltning.html) | Hårt låsta — inte vår målgrupp i MVP |
| **Global plattform med svensk närvaro** | [FNZ](https://www.fnz.com/) (svensk bankfilial; [SAVR-partnerskap](https://www.fnz.com/news/savr-partners-with-fnz-to-launch-a-next-generation-nordic-investment-platform)) — modulär wealth-plattform, custody, rapport | Visar att nordiska "next-gen"-plattformar byggs — API-era, inte era av låsta svarta lådor |
| **Oberoende svenska rådgivare/kapitalförvaltare** | [**Metafore**](https://metafore.se/) — svensk SaaS: onboarding, rådgivning (lämplighetsprövning med interna kriterier/limiter), systematisk uppföljning & rapportering till kund/rådgivare/ledning/kontroll i flera standardformat; tankar data från **MIS, depåinstitut, Morningstar, SPIS** ([metafore.se/finansiell-radgivare](https://metafore.se/finansiell-radgivare/)) | **Nyckelinsikt**: rapporten i svenska rådgivningssystem är ett *compliance-dokument* (lämplighet, KSU, uppföljning). Inget av dem genererar *analysdjup* — där finns vi |
| **Oberoende (alternativ)** | [Alwy](https://alwy.se/) (svensk helhetsplattform för finansiella rådgivare) | Samma mönster |
| **Institutionell förvaltning** | NeoXam, [SimCorp-klass], [Tieto] | Ur räckhåll för MVP |

**Slutsats svensk marknad:** De oberoende svenska rådgivarna (den segmentstrategin "Formue/Custodia/Alcur-klassen" + de mindre-byråerna) är fastlåsta i system vars rapport är **lämplighets-/återrapporterings-fokuserad**. Ingen leverantör ger dem ett verktyg som låter dem * bygga en egenvarumärkt djupanalys i en egen metodik*. Morningstar Direct är för dyrt [est. 180 000+ kr/år]; Koyfin Advisor är amerikanskt, engelska, USD-fakturerat och custodian-kopplat mot USA-bolag. **Luckan: svensk-språkig, metodikburen, white-label-rapportbyggare till ett pris mellan TIKR och Koyfin Advisor.**

---

## DEL 3 — MVP-mönster för B2B-fintech-rapporter (PDF i Next.js)

### 3.1 Två tekniska vägar (dokumenterad konsensus)

| | **@react-pdf/renderer (react-pdf)** | **Puppeteer/Playwright (headless Chromium)** |
|---|---|---|
| Tolkningsäge | Deklarativa React-komponenter → PDF | Rendera HTML/CSS → skriv ut till PDF |
| Designstyrka | Eget layoutsystem (FlexBox-liknande); **AK1A:s papper/guld/serif-DNA måste byggas om i react-pdf-primitiver** | 100 % av befintlig CSS (återanvänd `assets/rapport.css` och HTML-rapportstrukturen direkt) |
| Resurser | Lättvikt; fungerar i serverless/Vercel-funktioner | Tungt: ~2 GB minne per Chromium-instans, CPU-tungt, stora filer — [dokumenterad skalningskritik](https://dev.to/ecyrbe/comment/1n0cm) |
| Volymer | Bra för medel-hög volym med enkla/strukturerade layouter | Kräver container (Cloud Run/K8s) vid bursty/skalning — [OpenFaaS-mönster](https://www.openfaas.com/blog/pdf-generation-at-scale-on-kubernetes/), [Cloud Run-mönster](https://oneuptime.com/blog/post/2026-02-17-how-to-build-a-serverless-pdf-generation-service-using-cloud-run-and-puppeteer/view) |
| Rekommendation i community | Standardvalet för serverless-Next.js ([r/nextjs](https://www.reddit.com/r/nextjs/comments/1pqkmeu/anyone_generating_pdfs_serverside_in_nextjs/)) | Väljs vid pixel-perfect-krav ([produktionscase Next.js 15 + Puppeteer + AWS SES](https://medium.com/aws-tip/how-we-built-a-fully-automated-pdf-report-generation-system-with-next-js-puppeteer-and-aws-ses-1400d26c28ad)) |

### 3.2 Mönster att kopiera rakt av

1. **Koyfins import-mönster**: Pro-nivå = "import a prospect's brokerage statement into a client portfolio" ([koyfin.com/pricing-llm-info](https://www.koyfin.com/pricing-llm-info/)). MVP-enkel variant: **CSV-upload** (Avanza/Nordnet/depå-export → mappningstabell → /min-portfolj-motorn). PDF-parsning av mäklarutdrag = fas 2+ (tungt).
2. **Morningstars mall-hierarki**: rapport baseras på mall → redigera → spara som ny firmamall. MVP: 3 *låsta* AK1A-mallar (Djupanalys 13 sidor, Portföljöversikt, Konfluens-sida) + white-label-fält (logo, firmnamn, kolofon, disclaimer-sida) — full drag-och-släpp-byggare senare.
3. **YCharts/Koyfin-volymtrappan**: rapportgenerering som *begränsningsenhet* i prisplan (Koyfin: 10/mån → 200/mån) — naturlig uppgraderingstrigg för AK1A /pro.
4. **MarketDesks leveransmodell**: färdigt innehåll + kundens logo + compliance-bilaga. AK1A-varianten: mallen genererar alltid med AK1A:s ansvars-/riskdeklarationssida (redan obligatorisk i ak1a-analys-skillen) — white-label ändrar aldrig den sidan.

### 3.3 Arkitekturskiss för AK1A /pro (Next.js, befintlig stack)

```
/pro (skild route-grupp, eigen layout: mörk labb-tonad, SSO-inloggning)
 ├─ /pro/portfoljer        CSV-upload → papaparse → normalisering → befintlig
 │                          portfölj-motor (vågskattning/fundament per innehav)
 ├─ /pro/rapporter         mallbibliotek (3 låsta mallar) → välj portfölj →
 │                          förhandsvy (HTML, befintligt rapport-DNA) →
 │                          POST /api/pro/report → @react-pdf/renderer →
 │                          streamad PDF (Vercel-function, timeouts på 60 s)
 ├─ /pro/branding          logo, firmnamn, färger (papper/guld/serif-palett +
 │                          kundens accent), kolofon, disclaimer-vy
 └─ /pro/admin             seat-hantering, rapportkvot, Stripe (per seat)
Dataflöde: metodik-motorer (AKM1-poäng, VÅGFUNDAMENT 20×5, AK1TS-prisvågor,
Konfluensgrad) körs server-side; PDF:en innehåller UTDATA (klasser/poäng/
diagram), inte rådata-serierna → redistributionsrisken minimal.
```

**Varför react-pdf före Puppeteer i MVP:** Vercel-Hobby/serverless utan container, förutsägbart minne, och rapportstrukturen är redan komponentiserad (block-modellen i bokmaster-kurserna + rapport-DNA i assets/rapport.css ger design-tokens att portera). Puppeteer-omvägen finns som senare "pixel-perfect HTML-spegling" om en kund kräver 1:1-med skärmrapporten.

---

## DEL 4 — Compliance-vinklar (kort: research vs råd)

### 4.1 Regulatorisk grund (primära källor)

- **Investeringsrådgivning = personliga rekommendationer.** Svensk lag, [LVF (2007:528)](https://www4.skatteverket.se/rattsligvagledning/edition/2026.12/2546.html): *"investeringsrådgivning: tillhandahållande av personliga rekommendationer…"* — implementering av MiFID II.
- **När blir en rekommendation "personlig"?** MiFID II:s delegerade direktiv 2017/593 (art. 3(7)): rekommendationen framställs som lämplig för klienten eller grundas på hänsyn till dennes personliga förhållanden. ESMA:s rådgivningsguideline ([ESMA 09-665](https://www.esma.europa.eu/sites/default/files/library/2015/11/09_665.pdf)): rekommendationer som sprids **exklusivt till allmänheten/distributionskanaler** (investeringsforskning, finansiell media) är *inte* personliga rekommendationer. Bekräftat i [Delegerad förordning 2017/565 skäl 14](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017R0565): råd till allmänheten ska inte anses personliga. (Brittisk parallell: [FCA PERG 8.30B](https://handbook.fca.org.uk/handbook/perg8/perg8s41).)
- **Lämplighetsprövning** (MiFID II art. 25, [ESMA Single Rulebook](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-25-assessment-suitability-and)) triggas bara vid personliga rekommendationer.
- **Forskning är inte en investeringstjänst** — ren forskningsproduktion/distribution kräver inte värdepappersinstitut-tillstånd i den mån utdatan håller sig på den generiska sidan om linjen.
- **Köper en förvaltare vår forskning**: MiFID II:s forskningsbetalningsregler gäller *dem*, inte oss — och de har precis mjukats: 2024 års Listing Act/MiFIR-översyn tillåter **joint payments** (först små/b medelstora emittenter, sedan alla) och återintroducerar betalning från egna medel utan budget ([ESMA](https://www.esma.europa.eu/trading/mifid-ii-and-mifir-review) · [Regulation Tomorrow](https://www.regulationtomorrow.com/2024/10/esma-consults-on-amendments-to-mifid-research-regime/) · [Finanssivalvonta](https://www.finanssivalvonta.fi/sv/regelverk/regelverk/mifid-ii-och-mifir/)). En svensk förvaltare kan alltså *lättare* 2026 köpa AK1A-metodik som forskning än 2019.
- **Oberoende rådgivning = inga tredjepartsersättningar** ([FI, Reglerna i korthet](https://www.fi.se/sv/marknad/vardepappersmarknad-mifidmifir/reglerna-i-korthet/)) — vår prissättning mot rådgivaren måste vara transparent flat-fee per seat, aldrig rev-share kopplad till klientens affärer.
- **Marknadsföring**: ESMA:s krav på objektiv presentation av investeringsrekommendationer i sociala medier ([ESMA news](https://www.esma.europa.eu/press-news/esma-news/requirements-when-posting-investments-recommendations-social-media)) — fakta åtskilt från opinion, identifiebar avsändare — stämmer redan med AK1A:s "Deklarera före resultat"-kodex.

### 4.2 Riskbilden för AK1A (tre ringar)

1. **AK1A som producent (låg risk):** Våra rapporter innehåller klassificerade uttryck (STARKT KÖP → SÄLJ) men är generiska, metod-omfattande och offentligt formulerade — på rätt sida om "personlig rekommendation"-linjen *så länge* vi aldrig (a) kopplar en rapport till en namngiven persons ekonomi, (b) skriver "lämplig för din klient". Inga personliga data om slutklienter får någonsin begäras in i /pro (CSV:n innehåller *instrument och vikter*, inte personnummer/skuldlista — designregel!).
2. **AK1A som verktygsleverantör till rådgivare (medel risk):** White-label ändrar dokumentets avsändare. Rådgivaren blir ansvarig utgivare för det de skickar till sin klient; vi är verktyg. Skydd: (a) oföränderlig metod- och ansvarsblankett på varje export ("framtaget med AK1A-metodiken; pedagogisk analys, ej personlig rekommendation"), (b)white-label får aldrig kunna radera falsifierbarhets-/risk-delen av mallen, (c) villkor i /pro-avtalet om att kunden själv bär värdepappersinstitut-ansvaret för sin rådgivning. Försäljning av prenumerationsverktyg kräver inte tillstånd från Finansinspektionen — men håll linjen: vi säljer analysverktyg, inte rådgivning.
3. **AK1A som forskningsleverantör till förvaltare (låg-medel):** Metodik-licensen = forskning. Om en förvaltare använder AKM1/Konfluens-utdata i sin förvaltning ska de kunna budgetera det som forskning — fakturamodell per seat/år underlättar deras compliance. Undvik success fee mot prestanda (då blir det tjänst, inte forskning).

**Slutrader för riskbilden** (bordet att resa i SE-styrelsen när den finns): (i) CSV-import = instrument + vikt, aldrig personuppgifter; (ii) disclaimer-blocket är mal-låst; (iii) rättslig granskning av /pro-villkoren innan första rådgivarkund (en gång, timmar inte veckor); (iv) aldrig skriva klientspecifika omdömen i support.

---

## DEL 5 — SYNTES: AK1A /pro — koncept, priser, MVP-väg, differentiering

### 5.1 Konceptet i en mening

> **/pro är en skild värld bakom egen inloggning där en Fas 3-certifierad analytiker eller rådgivare importerar en portfölj (CSV), väljer en AK1A-DNA-rapportmall, sätter sitt varumärke på den och exporterar en tryckklar PDF — med AKM1/AK1TS/Konfluens-metodiken som rättighetsstyrd modul under huven.**

Tre världar, ett DNA (papper/guld/serif återanvänt, aldrig omförhandlat):
1. **Pedagogiska plattformen** (Fas 1–2, offentlig) — lär ut metoden.
2. **/pro** (B2B/B2Pro, inloggning) — *använd* metoden på egna portföljer, bygg rapporter.
3. **Metodik-licensmodulen** (rättighetsstyrd, "Coca-Cola-syrup") — kurserna lär ut koncepten öppet; trösklar/algoritmer/report-utdatan är licensierad IP (redan princip i VAGFUNDAMENT-SPEC P8 och worklog Q2-beslutet).

### 5.2 Prissättning per analytiker-seat (3 nivåer, föreslag)

Referenspriser: TIKR Pro ~550 kr/mån · Koyfin Premium ~820 kr/mån · Koyfin Advisor Core/Pro ~2 200/3 100 kr/mån · YCharts ~3 100–5 200 kr/mån · Morningstar Direct ~150 000+ kr/år [est.]. Svensk oberoende rådgivare betalar idag gärna 500–2 000 kr/mån för verktyg som skapar synligt klientvärde (Metafore-klassens system är offert-baserade och betydligt dyrare).

| Nivå | Pris (förslag) | Innehåll | Motsvarighet hos konkurrent |
|---|---|---|---|
| **PRO ANALYTIKER** | **499 kr/mån** (5 988 kr/år; fas3-medlem: 299 kr/mån första året) | 1 seat · obegränsad CSV-import · 3 låsta AK1A-mallar · 20 PDF-rapporter/mån · AK1A-branding | TIKR Pro/Koyfin Premium — men med rapportbyggare, vilket de saknar |
| **PRO STUDIO** | **1 499 kr/mån** (14 988 kr/år) | 5 seats · **white-label** (logo/färger/kolofon) · 100 rapporter/mån · portföljöversikts-sidor · delade mallbibliotek · prioriterad support | Koyfin Advisor Core/Pro-nivån — svensk-språkigt, metodikburset |
| **PRO INSTITUTION/METODIK-LICENS** | **4 999 kr/mån** (avtal, årsbindning) | 10+ seats · obegränsat rapportskapande · **rättighetsstyrd metodikmodul** (AKM1/VÅGFUNDAMENT/AK1TS/Konfluens-utdata via API) · SLA · onboarding av analysavdelningen | Ingen motsvarighet — detta är den blå hav-produkten |

Logik: nivå 1 erövrar Fas 3-analytikern (naturlig nästa steg efter certifieringen "arbeta med oss"), nivå 2 är den lönsamma rådgivarprodukten (white-label = *den* funktion som historiskt tiodubblar priset i branschen — jämför Koyfin Premium 79 → Advisor Pro 299 USD), nivå 3 är licensärligen intäktsmaskinen mot kapitalförvaltare som vill ha metodik-utdata i sin process.

### 5.3 MVP-vägen (minsta värde först — strikt ordning)

**Steg 1 — CSV-importen (vecka 1–2).** /pro/portfoljer: upload → papaparse → mappningstabell (ticker/antal/typ) → befintliga motorer (fundament + vågskattning per innehav, portföljsaggregering enligt VÅGFUNDAMENT P6). *Värde: rådgivaren ser sin eller prospektets klientportfölj genom AK1A:s glasögon inom 2 minuter. Detta finns redan tekniskt — bara skalning av /min-portfolj.*

**Steg 2 — Tre låsta mallar + PDF (vecka 3–5).** Mallar: (a) *Portföljöversikt* (20×5-värmematris + kategorirader + divergensflaggor), (b) *Djupanalys-kort* per innehav (nivå+våg per variabel, riskrad), (c) *Konfluens-sida* (värde-grind-status per innehav). Bygg med @react-pdf/renderer; portera tokens från assets/rapport.css. Mal-låst: ansvars-/riskdeklarationssidan + data-t.o.m.-deklaration (redan metodens hårda regel 5).

**Steg 3 — White-label + seats + Stripe (vecka 6–7).** Branding-fält; seat-admin; rapportkvot; fakturering. Säljorder: 5 pilotrådgivare (nätverket kring Fas 3-gemenskapen) → deras första 10 klientrapporter blir case-studies.

**Steg 4 (efter MVP) — Mallbyggaren.** Morningstar-mönstret: block-bibliotek (drag-drop av komponenter: matris, riskmatris, scenario, trigger) → spara som firmamall. Block-modellen finns redan i kurs-JSON (text/insikt/tabell/visuell) — återanvänd mentalt ramverk.

**Steg 5 — Metodik-API:et.** Rättighetsstyrd slutpunkt som returnerar P7-JSON med licensnyckel; rate-limits per avtal.

**Vad som INTE byggs i MVP:** PDF-parsning av mäklarutdrag, custodian-integrationer (svenska depå-API:er är fragmenterade — vänta), realtidsdata-licens (Millistream-förhandling är parallellspår, ej MVP-blockerande tack vare utdata-IP-designet i 1.3), drag-och-släpp-byggare, team-hierarkier.

### 5.4 Vad som SKILJER oss (differentieringen, härdad)

1. **Vi säljer metodik, inte data.** Alla konkurrenter (Morningstar → YCharts) säljer *data + redskap*; analysramverket är användarens eget. AK1A säljer ett *hierarkiskt, deterministiskt, falsifierbart analysramverk* (AKM1 20 variabler × VÅGFUNDAMENT-vågor × AK1TS prisvågmatris × Konfluens-värdegrind) som rapportens ryggrad. Rapporten blir därmed **reproducerbar och granskningsbar** — "samma data → samma vågklass" är en compliance-egenskap ingen konkurrent kan kopiera utan att kopiera metoden.
2. **Konfluens-rapporten finns inte på marknaden.** Portföljrapporteringsverktygen är beskrivande (avkastning/allokering/volatilitet); research-plattformarna är bolagcentrerade. Ingen produkt aggregerar *fundamental vågklass per variabel per horisont* till portföljnivå med divergens-signaler (VÅGFUNDAMENT P4.5/P6). Detta är rapportmallens unika innehåll — svårt att prissätta jämförbart, lätt att demo:a.
3. **Svenska språket + svenska CSV-format + svensk compliance-ton.** Koyfin Advisor är engelskt/US-custodian-fokuserat; svenska system (Metafore/Alwy) är lämplighets-/återrapporterings-fokuserade utan analysdjup. /pro sitter exakt mellan: analysdjup på svenska, med automatiskt korrekt disclaimer-klass (pedagogisk analys, ej personlig rekommendation).
4. **Fas 3-trappan är distributionen.** Varje Fas 3-certifierad "AK1A-analytiker" är en potentiell Pro Analytiker-kund med inövad metodik — noll utbildningskostnad, direkt omvandling. Ingen konkurrent har en utbildningspipeline som matar en verktygsprodukt (tvärtom: deras verktyg förutsätter utbildning de inte levererar).
5. **Rättighetsstyrd modul = återkommande intäkt som inte äts av data-kostnader.** Eftersom PDF:en bär vår metodiks utdata (inte rådatapriser) slipper vi redistribution-licensfällan i nivå 1–2 — marginalen blir mjukvarumarginal, inte datamarginal.

### 5.5 Risker med konceptet (ärlighetslistan)

- **Rådgivares köpkraft/byteströghet**: svenska oberoende firmor är få och vana vid offert-system. Motmedel: pilot-pris + Fas 3-nätverket + rapporten säljer sig själv i klientmötet.
- **White-label-varumärkesrisk**: white-label-kunder kan vilja sudda ut AK1A helt; metodblanketten och "framtaget med AK1A-metodiken"-raden är icke-förhandlingsbar (varumärkesbygge + ansvar).
- **Data-beroende kvarstår** för beräkningarna: Yahoo-flödets robusthet måste övervakas; Millistream-licens är nästa steg när /pro får betalande kunder.
- **Regulatorisk gråzon vid mallens "rekommendationsord"**: klasstruket STARKT KÖP → SÄLJ är generiskt; villkoret är att mall-aldrig tillåter individanpassade omdömen — mal-låsning + spärr mot fritextfält kring "lämplig för [namn]".

---

## KÄLLOR (urval, alla besökta 2026-09-01)

**Plattformar/priser:** [Morningstar Direct — Presentation Studio](https://www.morningstar.com/business/products/direct/presentation-studio) · [Presentation Studio Guide 2025 (60+ mallar)](https://www.scribd.com/document/836758158/Presentation-Studio-Guide-2025) · [Morningstar Community — Templates](https://community.morningstar.com/s/article/Using-Presentation-Studio-Templates) · [FactSet Pitch Creator](https://www.factset.com/marketplace/catalog/product/pitch-creator) · [FactSet pressrelease](https://investor.factset.com/news-releases/news-release-details/factset-launches-ai-powered-pitch-creator) · [FactSet Banker Efficiency](https://www.factset.com/solutions/banker-efficiency-solutions) · [FactSet prisdata via Vendr](https://www.vendr.com/marketplace/factset) · [TIKR pricing](https://www.tikr.com/pricing) · [Koyfin pricing](https://www.koyfin.com/pricing/) · [Koyfin pricing-llm-info](https://www.koyfin.com/pricing-llm-info/) · [Koyfin for Financial Advisors](https://www.koyfin.com/for-financial-advisors/financial-advisors/) · [Simply Wall St plans](https://simplywall.st/plans) · [Simply Wall St](https://simplywall.st/) · [StockUnlock-granskning SWS](https://stockunlock.com/simply-wall-st-review.html) · [YCharts](https://ycharts.com/) · [US Tech Automations — advisor reporting tools 2026](https://ustechautomations.com/resources/blog/best-reporting-analytics-software-financial-advisors-2026) · [TraderHQ Koyfin vs TIKR](https://traderhq.com/) · [FinancialModelsHub Koyfin-review](https://financialmodelshub.com/koyfin-review-2026-pricing-pros-cons-features-alternatives-20-off-voucher/)

**White-label/svenska marknaden:** [MarketDesk White Label](https://marketdeskresearch.com/whitelabel) · [Aleta](https://aleta.io/white-label-family-office-software) · [Asset Vantage](https://assetvantage.com/blogs/white-label-reporting-software/) · [FundCount — bästa portföljrapportering 2026](https://fundcount.com/best-portfolio-reporting-software) · [The Wealth Mosaic-katalog](https://www.thewealthmosaic.com/needs/portfolio-analysis-reporting-tools/) · [Metafore](https://metafore.se/) · [Metafore — finansiell rådgivare](https://metafore.se/finansiell-radgivare/) · [FNZ](https://www.fnz.com/) · [FNZ × SAVR](https://www.fnz.com/news/savr-partners-with-fnz-to-launch-a-next-generation-nordic-investment-platform) · [Tieto Savings & WM](https://www.tieto.com/en/industries/financial-services/savings-and-wealth-management/) · [NeoXam PMS](https://www.neoxam.com/pms/) · [Wize](https://www.wize.net/en/wize-asset-management-reporting) · [Nordea diskretionär förvaltning](https://www.nordea.se/privat/produkter/kundprogram/diskretionar-forvaltning.html) · [Millistream](https://millistream.com/) · [Millistream Trader](https://millistreamtrader.com/)

**PDF-teknik:** [r/nextjs — server-side PDF](https://www.reddit.com/r/nextjs/comments/1pqkmeu/anyone_generating_pdfs_serverside_in_nextjs/) · [ecyrbe — react-pdf vs Puppeteer skalning](https://dev.to/ecyrbe/comment/1n0cm) · [Code Pasta — optimering Puppeteer](https://www.codepasta.com/2024/04/19/optimizing-puppeteer-pdf-generation) · [Medium — Next.js 15 + Puppeteer + SES i produktion](https://medium.com/aws-tip/how-we-built-a-fully-automated-pdf-report-generation-system-with-next-js-puppeteer-and-aws-ses-1400d26c28ad) · [OpenFaaS — PDF at scale](https://www.openfaas.com/blog/pdf-generation-at-scale-on-kubernetes/) · [Cloud Run + Puppeteer](https://oneuptime.com/blog/post/2026-02-17-how-to-build-a-serverless-pdf-generation-service-using-cloud-run-and-puppeteer/view)

**Compliance:** [LVF (2007:528) — Skatteverket rättslig vägledning](https://www4.skatteverket.se/rattsligvagledning/edition/2026.12/2546.html) · [ESMA — Understanding the definition of advice under MiFID (09-665)](https://www.esma.europa.eu/sites/default/files/library/2015/11/09_665.pdf) · [Delegerad förordning 2017/565, skäl 14](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017R0565) · [Delegerat direktiv 2017/593](https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017L0593) · [MiFID II art. 25 — Single Rulebook](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mifid-ii/article-25-assessment-suitability-and) · [FCA PERG 8.30B](https://handbook.fca.org.uk/handbook/perg8/perg8s41) · [Dillon Eustace — definition of advice](https://www.dilloneustace.com/insights/legal-insights/the-definition-of-advice-under-mifid/) · [ESMA — MiFID II/MiFIR review (forskningsbetalning)](https://www.esma.europa.eu/trading/mifid-ii-and-mifir-review) · [Regulation Tomorrow — ESMA research-regime](https://www.regulationtomorrow.com/2024/10/esma-consults-on-amendments-to-mifid-research-regime/) · [Finanssivalvonta — MiFID II ändringar 2024](https://www.finanssivalvonta.fi/sv/regelverk/regelverk/mifid-ii-och-mifir/) · [FI — Reglerna i korthet](https://www.fi.se/sv/marknad/vardepappersmarknad-mifidmifir/reglerna-i-korthet/) · [ESMA — rekommendationer i sociala medier](https://www.esma.europa.eu/press-news/esma-news/requirements-when-posting-investments-recommendations-social-media)

**Internt underlag:** MEGA_PLAN_V2.md · VAGFUNDAMENT-SPEC.md (P4.5, P6–P8) · MEGA_PROJEKT.md (Fas 1–3-prismodellen) · ak1a-analys-skillen (hårda regler 1–8, rapport-DNA) · strategy/blue-ocean-purity.md · src/app/medlemskap/page.tsx (0 / 9 999 / 13 999 kr) · data/rapporter/forskning-konfluens-2026-09-02.md (Konfluensradarns evidensbas).
