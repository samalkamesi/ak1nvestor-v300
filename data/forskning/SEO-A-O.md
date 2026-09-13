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
| 2026-09-13 | H — Hreflang-städning (våg 129, organ Ψ) | pageMetadata-default deklarerade sv-SE+en+x-default som ALLA pekade på samma URL för speglolösa sidor (analyser, labb, forskningsbiblioteket, verktygssidor) — same-URL-brus som kunde läsas som en engelsk version som inte finns. harSpeglar-klustret (kurser/blogg/start/nyckelsidor) var korrekt och orört. | JA (våg 129): default = enbart sv-SE+x-default som självhänvisning; kirurgiskt i pageMetadata; kommentarer sanningsenliga i seo.tsx + spegel-metadata.ts; tsc 34 = baslinje, 0 nya fel |
| 2026-09-13 | A — Alt-texter + data/seo-korpusen (våg 133, organ Ψ) | Img-alt-inventering (mätt, hela src/): 10 `<img>` totalt — ALLA publika (studio-chat ×4, tenant-header, media-panel) har alt; Kallkort/KursArtiklar renderar INGA bilder (dokumentets gamlanot var inaktuell); endast blogg-panel (admin, ej publik) har 2 dekorativa `alt=""` = WCAG-giltigt. Korpusen: `node scripts/seo-generate.mjs` körd medvetet 13:26 — 399 filer omskrivna, 0 spårade filer ändrade = determinism empiriskt bevisad; 130 ospårade generatorfiler (103 kurser + 27 blogg) kvalitetsgranskade: 0 "[object Object]", 0 rådgivningsord i delta, stickprov pedagogiskt rena. | JA (våg 133): HELA korpusen committad (130 nya filer, dataleverans utan bygge — metadata baktas vid nästa bygge); avsnitt A:img-alt konstaterat OK |
| 2026-09-13 | J — JSON-LD-migration (våg 134, organ Ψ) | Samtliga JsonLd-KOMPONENTANROP migrerade till StrukturData: 0 `<JsonLd` kvar i hela src/, 34 filer renderar via `<StrukturData` (30 sidfiler + komponenter), JsonLd-renderern PENSIONERAD ur seo.tsx (dokumenterad i koden). Levererad av molnagent-session, commit 0fe32c6c + merge f4d2e657, deployad. | JA (våg 134) |
| 2026-09-13 | V — Verifiering Article-JSON-LD (våg 135, organ Ψ, hjärtslags-rond) | Sond (6 URL:er, localhost = prod-kod): giltig JSON i ALLA ld+json-block, 0 "[object Object]", 0 rådgivningsord, inLanguage "sv-SE" korrekt i alla Article-block. **FYND:** analys-Article saknade `dateModified` (bloggen hade det redan). | JA (våg 135): dateModified = verified \|\| analysisDate i analysisJsonLd, deployad; Search Console-täckning kvar = R2 (API-nyckel väntar kund) |
| 2026-09-13 | B — Brödsmulor (våg 136, organ Ψ, styrelserond) | Sond (9 steg, node/fetch mot localhost=prod): /labb/[id] och /forskningsbiblioteket/[ticker] renderar BreadcrumbList korrekt för giltiga params — avsnittets KVAR-rad var inaktuell (samma mönster som rond J). **SIDOFYND (större än brödsmulan):** ogiltiga URL:er på 6 force-static-[param]-rutter serverade layout-SKALET med HTTP 200 (skal-defaulttitel "Från utbildning till inkomst" + organisation/webbsajt-JSON-LD) i stället för 404-sidan = soft-404. Rot: force-static utan dynamicParams=false (blogg/[slug] + kurser/speglar hade raden sedan tidigare). | JA (våg 136): dynamicParams = false i 6 sidor (labb/[id], analyser/[ticker], forskningsbiblioteket/[ticker], dataset/[bransch] ×3 språk); tsc 0, deployad + prodmätt: ogiltig → 404, giltig → 200 med brödsmula |
| 2026-09-13 | F — Blogg-FAQ (våg 137 + 137-b, organ Ψ, hjärtslags-rond) | Implementering (våg 137, alternativ B): parser src/lib/blogg-faq.ts ("## FAQ"-sektion + **fråga**/svar-block) → villkorat FAQPage-block (id="jsonld-faq") via StrukturData — synligt innehåll + schema ur EN källa; 10 pelarposter × 3–4 utbildningsformulerade par; tsc 0. Verifiering (våg 137-b): prod-sond (node, localhost=prod) — komplett-guiden renderar synlig FAQ-rubrik + giltig FAQPage med 4 frågor (alla svar > 20 tecken, 0 rådgivningsord); kontrollpost utan FAQ renderar 0 block (villkoret håller). | JA (våg 137, prod-verifierad 137-b) |

---

## A — API/tillgänglighet + Alt-texter

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| llms.txt + /api/llms-txt levererar frågekorpus; robots.txt bjuder in GPTBot, ClaudeBot, PerplexityBot m.fl. (AI-SEO, kunddirektiv "nr 1 hos alla AI") | Fortsätt hålla AI-crawler-välkomstandet aktuellt när nya agenter dyker upp | OK | våg 50+ / Återkommande |
| OG-bilder har alt-texter (ogBildForPath, clamp 100 tecken); img-alt inventerat våg 133: ALLA publika `<img>` har alt (studio-chat, tenant-header, media-panel); Kallkort/KursArtiklar renderar inga bilder; blogg-panel (admin) har 2 dekorativa `alt=""` = WCAG-giltigt | Håll regeln vid nya komponenter: publik `<img>` = alltid beskrivande alt | OK (våg 133) | våg 133 / rond A |
| data/seo-korpusen: HELA korpusen committad våg 133 (399 filer: 333 kurser + 55 blogg + 11 analyser) efter medvetet generatorkör — determinism bevisad (0 spårade ändringar vid omskrivning); handkurerade beskrivningar följde generatorn som beslutat | Kör generatorn + commit vid varje metadata-rond härifrån (kontrakt: korpusen är generatorns, inte handens) | OK (våg 133) | våg 133 / rond A |

## B — Brödsmulor (BreadcrumbList)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurssidor ×3 språk: 4 nivåer via byggKursSchema; blogg/analyser: 2–3 nivåer; labb/[id] + forskningsbiblioteket/[ticker]: 2 nivåer via breadcrumbJsonLd + StrukturData, verifierade i prod våg 136 (sond: "Labbet" / "Forskningsbiblioteket \| <bolag>" renderas i ld+json) | Håll regeln vid nya detaljsidor: BreadcrumbList via StrukturData | OK (våg 136) | Rond B (våg 136) |

## C — Canonical

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| pageMetadata sätter canonical på ALLT; speglar under tröskel canonicalar mot sv-original (medvetet); B2B/tier-sidor grindas ur sitemap; ?query-parametrar självstämplar (bevisat våg 128: canonical byggs ur statisk path, seo.tsx:144) | Håll regelverket vid liv vid nya sidtyper | OK | våg 78 / rond C (våg 128) |

## D — Data-struktur (strukturerade data, översikt)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser ×3 språk: Course+FAQPage+BreadcrumbList (byggKursSchema, våg 99 G1) — komplett, ett block per typ | Bevara "ett block per sidtyp"-regeln vid nya sidtyper | OK | våg 99/122F |
| Blogg sv: Article+Breadcrumb; speglar en/ar: Article via bloggSpegelJsonLd (author Person = E-E-A-T-starkare än Organization — medvetet val) | — | OK | våg 122F |
| Analyser sv: Article — våg 122F fixade "[object Object]"-buggen + utbildningsformulering; våg 135 la till dateModified (verified \|\| analysisDate) och sonderade Article-kompletthet = grön | Search Console-status kvar (R2-nyckel) | OK (kod + sond våg 135) | våg 122F/135 |
| En/ar-speglar för analyser finns inte (404) — av design, metadatan är sv-only. BESLUTAT (våg 136, R2-neutralt): AVSTÅ — motiveringar citeras ordagrant på svenska (maskinöversättning av citerat forskningsmaterial riskerar feltolkning), speglolösa sidor deklarerar redan korrekt hreflang (våg 129), 44 extra sidor underhåll utan motsvarande söktryck; omprövas om AI-SEO-målet kräver det | — | AVGJORT: nej (våg 136) | Beslut (våg 136) |

## E — E-E-A-T-signaler

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| EducationalOrganization-schema, transparens-sida, källhänvisningar (Kallkort), verified-datum på analyser, author Person på blogg | Mät citattecken i AI-svar (manuell spot-check månatligt) | KVAR | Rond M+1 |

## F — FAQ

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser ×3 språk: FAQPage med 3–4 äkta par ur kursens eget innehåll (byggKursSchema) | — | OK | våg 99 |
| Startsidan: FAQPage (llms-fragor) | — | OK | FRONT A |
| Bloggposter: "## FAQ"-sektion i body + parser (src/lib/blogg-faq.ts) speglar till FAQPage via StrukturData — EN källa för synligt innehåll och schema. Våg 137: 10 pelarposter × 3–4 par, utbildningsformulerade. Våg 137-b prod-verifierad: synlig rubrik + giltig FAQPage (4 frågor på sondpost), kontrollpost utan FAQ = 0 block | Utöka inkrementellt ur frömaterialet (41/55 poster har ≥2 naturliga frågor i body), prioritera söktryck | OK (våg 137, prod-verifierad 137-b) | Rond F (våg 136 beslut → 137 levererad) |

## G — Generering/sitemap

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| src/app/sitemap.ts (force-dynamic) — prod-mätt 1 712 URL:er: sv 892, en 410, ar 410; kurser 999 (333×3), blogg 165 (55×3), analyser 231 (huvud + variabelsidor), forskningsbibliotek 22, labb 201, dataset 33 | Tröskel-grindar (b2bAktiv/tierAktiv) håller avstängda ytor ur sitemap — korrekt | OK | våg 78/97/99 |

## H — Hreflang

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| Kurser/blogg/start + speglar: sv-SE+en+ar+x-default, ömsesidigt (våg 78 C #4) — prodmätet OK | — | OK | våg 78 |
| Sidor UTAN speglar (analyser, labb m.fl.): städat våg 129 — default deklarerar enbart sv-SE+x-default som självhänvisning; den falska 'en'-raden borta | Håll regeln vid nya sidtyper: speglolös sida = sv-SE+x-default, aldrig same-URL-kluster | OK (våg 129) | våg 129 / rond H |

## I — Indexering

| Läge | Åtgärd | Status | Ägare |
|---|---|---|---|
| 1 712 URL:er i sitemap; noindex endast på grindade ytor (pro-layout, speglar under 80 % tröskel, /studio, /admin) | Jämför "Submitted vs Indexed" i Search Console; undersök luckor > 10 % | KVAR | V-avsnittet |

## J — JSON-LD (djup)

| Läge | Åtgärd | Status | Ägare |
|---|---|---|
| StrukturData = sajtens ENDA JSON-LD-renderer (våg 134): samtliga anropare migrerade (30 sidfiler + komponenter), escape:ar < samt U+2028/2029, ett block per anrop, valfritt DOM-id | Håll regeln: nya sidor renderar via StrukturData, aldrig egna script-block | OK (våg 134) | våg 134 / rond J |
| JsonLd-renderern i seo.tsx PENSIONERAD (våg 134) — borta ur koden, dokumenterad i seo.tsx-kommentar | — | OK (våg 134) | våg 134 / rond J |

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
| Externa länkar (källor, böcker) följs — transparens > länkjuice. Inventering våg 136 (mikroagent, hela src/): INGA user-genererade URL:er når publika crawlbara sidor (meetingLink + medlemmars RSS-flöden renderas inloggat; studio-chatt har eget schema-filter) → nofollow behövs ej; Bokus/Adlibris/Amazon = kuraterade domäner med datadriven query; 0 externa URL:er i data/blogg idag | Märk rel="sponsored" OM affiliation tillkommer. Följdåtgärder (säkerhet, ej SEO): schema-filter i blogg-markdown-renderare + https-validering av meetingLink | OK (våg 136) | Rond N (våg 136) |

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
| Rutgrupper (huvud)/(en)/(ar); speglar dyn. med 80 %-tröskel; html-lang korrekt i prod (sv/en/ar prodmätt); inLanguage i allt JSON-LD | Analyser + labb + forskningsbiblioteket saknar speglar — se D (avgjort våg 136: avstå) | OK (kärna) | våg 51–78/136 |

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
| Sitemap rapporteras via robots; Article-validitet SONDERAD våg 135 (efter våg 134-deploy): giltig JSON, 0 "[object Object]", alla obligatiska Article-fält nu kompletta (dateModified-fyndet rättat samma våg); inLanguage "sv-SE" överallt | Search Console-täckning ("Submitted vs Indexed" + Rich Results-status) = R2: kräver API-nyckel, väntar kund | OK (sond våg 135) / KVAR (Search Console = R2) | våg 135 / R2 |

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

1. **Sökordsinventering sv/en/ar** (▶ NÄSTA): styrelsens beslut 2026-09-13 20:19, åtgärd 3 — full inventering mappad mot de 333 kurserna + analysbiblioteket; identifiera täckningsglapp som plan för programmatiska long-tail-landningssidor.
2. **F — Blogg-FAQ-utökning**: 41/55 poster har frömaterial (≥2 naturliga frågor i body); nya par läggs inkrementellt, prioriterat efter söktryck.
3. **E — E-E-A-T-mätning**: manuell spot-check av citattecken i AI-svar (månadsvis).
4. **V — Search Console-täckning**: R2, väntar kundens API-nyckel.
5. Säkerhetsföljdåtgärder från rond N (ej SEO men bokförda): schema-filter i blogg-renderare; https-validering av meetingLink.

Klar ronder: A–Ö-genomgång (122F), C-Canonical (våg 128), H-Hreflang (våg 129), A-Alt-texter+korpusen (våg 133), J-JSON-LD-migration+pensionering (våg 134), V-Verifiering Article-sond+dateModified (våg 135), B-Brödsmulor verifierade + soft-404-fix (våg 136), N-nofollow-inventering (våg 136), D-analys-speglar avgjort: nej (våg 136), F-Blogg-FAQ top-10 levererad + prod-verifierad (våg 137/137-b).
