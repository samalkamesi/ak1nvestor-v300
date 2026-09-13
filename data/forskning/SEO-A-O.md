# SEO-A-Ö — levande checklista för lab.ak1nvestor.com

> **Skapat:** våg 122F (organ Ψ), 2026-09-13 — beslut mtzou25g åtgärd 7+8.
> **Status:** LEVANDE DOKUMENT — granskas och förväntas förändras.
> **Sanningshierarki:** detta dokument är SEO-ämnesområdets arbetschecklista;
> STYRELSE-*.md (senaste = sant) styr vid konflikt.

---

## ⚙️ MEKANIK: Ett avsnitt per styrelserond

Checklistan arbetas av i takt med styrelseronderna (var 3:e timme, verktyg/
styrelse-rond.mjs): **en rond = ett avsnitt lyfts, granskas (kod + prod),
åtgärdas eller konstateras OK, och loggas nedan.** Avsnittet som är näst på
tur markeras med `▶ NÄSTA`. Prioriteringsordning följer status: GAP först,
sedan KVAR, sedan OK-åter verifiering. När hela alfabetet är OK igen börjar
ronden om från A (SEO är aldrig "klart" — konkurrenter och Google rör sig).

### Rond-logg

| Datum | Avsnitt | Fynd | Åtgärdat |
|---|---|---|---|
| 2026-09-13 | Genomgång A–Ö (våg 122F) | Sitemap 1 712 URL:er × sv/en/ar = OK. Hreflang sv-SE+en+ar+x-default korrekt på kurser/blogg/start (obs: Next 16 renderar `hrefLang` kamelnotation — skilj på bugg och regex-fel). Robots OK med sitemap-rad + AI-crawlers. JSON-LD komplett på kurser (×3 språk) och blogg (sv+speglar). **BUGG:** analyssidornas Article-description = "[object Object]" (String på motivation-objekt) + metabeskrivning bar ordet "Rekommendation" (rådgivningsspråk). | JA (våg 122F): analysisJsonLd/analysisMetadata omskrivna till utbildningsformulering + typsäker objektläsning; scripts/seo-generate.mjs omformulerad; 11 analys-metafiler regenererade; ny generisk renderer src/components/seo/StrukturData.tsx applicerad på 4 rutter |
| 2026-09-13 | C — Canonical (våg 128, organ Ψ) | Sond (8 URL:er, localhost=prod-kod): /kurser?q=rgb, /blogg?tag=…, /en/kurser?q=…, /analyser?filter=…, /forskningsbiblioteket?visa=…, /labb?sort=… — ALLA självstämplar canonical mot den rena URL:n (query följer aldrig med). Rot: pageMetadata bygger canonical ur statisk path (src/lib/seo.tsx:144,171) — sökparametrar kan inte nå canonical. Q-raden (?q-dubletter) därmed också verifierad. | Ingen kodändring behövs — konstaterat OK (våg 128) |
| — | ▶ NÄSTA: H — Hreflang-städning | (väntar på rond) | — |

---

## A — API/tillgänglighet + Alt-texter

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| llms.txt + /api/llms-txt levererar frågekorpus; robots.txt bjuder in GPTBot, ClaudeBot, PerplexityBot m.fl. (AI-SEO, kunddirektiv "nr 1 hos alla AI") | Fortsätt hålla AI-crawler-välkomstandet aktuellt när nya agenter dyker upp | OK | våg 50+ / Återkommande |
| OG-bilder har alt-texter (ogBildForPath, clamp 100 tecken); vanliga <img> saknar delvis alt | Inventera img-alt på innehållssidor (Kallkort, KursArtiklar) | KVAR | Rond C+1 |
| data/seo-korpusen: 130 genererade metafiler ligger ocommittade i arbetsytan; kurser/blogg-meta delvis handkurerat (generatorn skriver över) | Kör `node scripts/seo-generate.mjs` medvetet + committa HELA korpusen vid nästa metadata-rond — notera att handkurerade kursbeskrivningar då följer generatorn | KVAR | Rond C+1 |

## B — Brödsmulor (BreadcrumbList)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurssidor ×3 språk: 4 nivåer via byggKursSchema; blogg/analyser: 2–3 nivåer; renderade via StrukturData/JsonLd | Kontrollera att även /labb/[id] och /forskningsbiblioteket/[ticker] har BreadcrumbList | KVAR | Rond C+2 |

## C — Canonical

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| pageMetadata sätter canonical på ALLT; speglar under tröskel canonicalar mot sv-original (medvetet); B2B/tier-sidor grindas ur sitemap; ?query-parametrar självstämplar (bevisat våg 128: canonical byggs ur statisk path, seo.tsx:144) | Håll regelverket vid liv vid nya sidtyper | OK | våg 78 / rond C (våg 128) |

## D — Data-struktur (strukturerade data, översikt)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser ×3 språk: Course+FAQPage+BreadcrumbList (byggKursSchema, våg 99 G1) — komplett, ett block per typ | Bevara "ett block per sidtyp"-regeln vid nya sidtyper | OK | våg 99/122F |
| Blogg sv: Article+Breadcrumb; speglar en/ar: Article via bloggSpegelJsonLd (author Person = E-E-A-T-starkare än Organization — medvetet val) | — | OK | våg 122F |
| Analyser sv: Article — våg 122F fixade "[object Object]"-buggen + utbildningsformulering ("utbildningsgenomgång av analysmodellen för X") | Verifiera Rich Results-status i Search Console efter deploy | OK (kod) / KVAR (verifiering) | våg 122F |
| En/ar-speglar för analyser finns inte (404) — av design, metadatan är sv-only | Besluta (styrelsen) om analys-speglar är värda 22 × 2 sidor | KVAR | Beslut |

## E — E-E-A-T-signaler

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| EducationalOrganization-schema, transparens-sida, källhänvisningar (Kallkort), verified-datum på analyser, author Person på blogg | Mät citattecken i AI-svar (manuell spot-check månatligt) | KVAR | Rond M+1 |

## F — FAQ

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser ×3 språk: FAQPage med 3–4 äkta par ur kursens eget innehåll (byggKursSchema) | — | OK | våg 99 |
| Startsidan: FAQPage (llms-fragor) | — | OK | FRONT A |
| Bloggposter: ingen FAQ-data i BlogPost-strukturen (slug/title/description/pillar/author/dates/tags/body) | Kräver innehållsbeslut: FAQ-block i bloggmarkdown (`## FAQ`?) + spegling till FAQPage — ta till styrelsen, R2-neutral | KVAR | Beslut + rond |

## G — Generering/sitemap

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| src/app/sitemap.ts (force-dynamic) — prod-mätt 1 712 URL:er: sv 892, en 410, ar 410; kurser 999 (333×3), blogg 165 (55×3), analyser 231 (huvud + variabelsidor), forskningsbibliotek 22, labb 201, dataset 33 | Tröskel-grindar (b2bAktiv/tierAktiv) håller avstängda ytor ur sitemap — korrekt | OK | våg 78/97/99 |

## H — Hreflang

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser/blogg/start + speglar: sv-SE+en+ar+x-default, ömsesidigt (våg 78 C #4) — prodmätet OK | — | OK | våg 78 |
| Sidor UTAN speglar (analyser, labb m.fl.): pageMetadata-default deklarerar sv-SE/en/x-default som alla pekar på SAMMA URL — brus, inte fel, men städas bäst bort | ▶ NÄSTA AVSNITT: ändra default till enbart sv-SE+x-default (självhänvisning) när speglar saknas — kirurgiskt i pageMetadata, testa alla anropare | KVAR | Rond näst |

## I — Indexering

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| 1 712 URL:er i sitemap; noindex endast på grindade ytor (pro-layout, speglar under 80 % tröskel, /studio, /admin) | Jämför "Submitted vs Indexed" i Search Console; undersök luckor > 10 % | KVAR | V-avsnittet |

## J — JSON-LD (djup)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|
| StrukturData (våg 122F) = sajtens generiska renderer — escape:ar < samt U+2028/2029, ett block per anrop | Migrera övriga JsonLd-användare (startsidan, dataset, verktygssidor) stegvis till StrukturData | KVAR | Rond D+1 |
| JsonLd i seo.tsx lever kvar som bakåtkompatibel renderer (samma output) | Behåll tills alla anropare migrerats, därefter pensionera | KVAR | senare |

## K — Kärnbusiness-mätning

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Sökandelen till kurser/analyser/blogg mäts ej systematiskt | Koppla Search Console-data (klick per sivtyp) till rond-loggen när API-nyckel finns (R2: nycklar väntar kund) | KVAR | R2 + beslut |

## L — LCP/hastighet

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| ISR (revalidate 3600) på kurser/speglar; OG-bilder förhandsgenererade PNG | Mät LCP i fält (CrUX/pageSpeed) för kurssida + start på mobil | KVAR | Rond P |

## M — Metadata/OG + Mobil

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| OG 1200×630 per sidtyp + externa medieomslag vitlistas; twitter summary_large_image; gränssnittsvakten (våg 105) bevakar mobil/dator × två teman | — | OK | våg 1a/105 |
| analyzeMetaDescription för analyser: våg 122F omformulerad (utbildning, ej rådgivning) | Språkväxling saknas (sv-only) — analyser har inga speglar, accepterat | OK (sv) | våg 122F |

## N — Nofollow

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Externa länkar (källor, böcker) följs — transparens > länkjuice | Inventera ev. otillförlitliga utgående länkar (user-genererat i labbet?) | KVAR | Rond U |

## O — Orgånisation-data + OG-bilder

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Organization + EducationalOrganization på start (sv) + speglar (en/ar) med sameAs enbart för ifyllda profiler | Lägg till sameAs när sociala profiler etableras | OK | våg 1a |

## P — Prestanda (Core Web Vitals)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Se L; dessutom: komprimering/brotli via nginx, font-strategi (scripts/fonts) | Verifiera nginx-gzip/brotli + cache-headers en gång per kvartal | KVAR | Drift-rond |

## Q — Query-sök (intern sök)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| SearchAction-schema pekar på /kurser?q= (WebSite-potentialAction ×3 språk); ?q-varianter självstämplar canonical (bevisat rond C våg 128 — inga dubletter) | — | OK | Rond C (våg 128) |

## R — Robots

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| robots.ts: `*`-grupp + 9 AI-vendor-grupper, allow-lista publika ytor, disallow admin/studio; sitemap + host-deklarerad; prod-mät 200 | Håll AI-crawlerlistan aktuell (halvårsvis) | OK | våg 77+ |

## S — Språk (sv/en/ar)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Rutgrupper (huvud)/(en)/(ar); speglar dyn. med 80 %-tröskel; html-lang korrekt i prod (sv/en/ar prodmätt); inLanguage i allt JSON-LD | Analyser + labb + forskningsbiblioteket saknar speglar — se D | OK (kärna) / KVAR (analyser) | våg 51–78 |

## T — Titel-taggar

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Mall "%s | AK1A Research Lab"; kurser/analyser/blogg clamp 60; data/seo-override | Granska titellängder i Search Console (truncering) | KVAR | V-rond |

## U — URL-struktur

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kebab-slugar; ticker encode:ad (ABB.ST); /en//ar-prefix konsekvent | Analyser använder rå ticker-case i URL — behåll (etablerat), aldrig blanda med -st-form i länkar | OK | — |

## V — Verifiering (Search Console)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Sitemap rapporteras via robots; Rich Results ej systematiskt verifierade | Efter deploy av våg 122F: kontrollera Article-validitet för /analyser/* i Rich Results Test (nu giltig JSON, inte "[object Object]") | KVAR | Efter deploy |

## W — WWW/kanon (domänkanon)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| metadataBase + canonical = https://lab.ak1nvestor.com (utan www); nginx styr eventuell www-omdirigering | Verifiera att www→icke-www 301 fungerar från utsidan | KVAR | Drift-rond |

## X — X-default

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| x-default pekar på sv-original på alla kluster (prodmätt) | — | OK | våg 55/78 |

## Y — Yt-CTR (klickfrekvens i sökresultat)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Metabeskrivningar clamp 158 med värdeord ("gratis", antal kurser) | Mät CTR per sidtyp i Search Console; justera formuleringar med lägst CTR | KVAR | K-rond |

## Z — Zippad överföring

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Next-standards; gzip/brotli antas på i nginx | Verifiera Content-Encoding på tunga sidor (dataset-tabeller) | KVAR | P-rond |

## Å — Återkommande granskning

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| DETTA DOKUMENT: ett avsnitt per styrelserond (mekaniken överst) | Rundorna dokumenteras i rond-loggen; när A–Ö är OK → börja om från A | OK (mekanik på plats) | Alla ronder |

## Ä — Äkthet/källor

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Tal ur guldkällan data/siffror.json; källor redovisas (Kallkort, dataset n=); "aldrig investeringsråd" i policy + sidfotter | Juridikgrinds-check per SEO-textändring (regelverk § BESLUTSLOGG) | OK | löpande |

## Ö — Övervakning

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Gränssnittsvakten (våg 105, var 6:e timme) fångar visuella defekt; SEO-larm saknas (404-toppar, sitemap-fel) | Överväg SEO-larmregel i vakten: sitemap != 200 eller URL-antal avviker > 20 % → larm | KVAR | Rond Ö (senare) |

---

## Kvar-lista nästa ronder (sammanfattning)

1. **H — Hreflang-städning** (▶ NÄSTA): sidor utan speglar deklarerar same-URL-kluster — städa till sv-SE+x-default.
2. **A — Alt-texter** + data/seo-korpusen: kör generatorn medvetet, committa hela korpusen.
3. **J — JSON-LD-migration**: återstående JsonLd-anropare → StrukturData.
4. **V — Verifiering**: Rich Results Test på analyser efter deploy; Search Console täckning.
5. **B — Brödsmulor**: labb + forskningsbiblioteket.
6. **F — Blogg-FAQ**: innehållsbeslut till styrelsen.

Klar ronder: A–Ö-genomgång (122F), C-Canonical (våg 128).
