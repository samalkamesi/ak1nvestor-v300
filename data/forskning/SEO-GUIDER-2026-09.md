# SEO-GUIDER 2026-09 — 8 guide-utkast som bloggposter (VÅG 95)

**Status: UTKAST — kundens granskningskö.** BlogPost-formen (src/lib/content.ts) saknar statusfält och bloggroutern (force-static) renderar allt i `data/blogg/*.json` — därför bärs utkast-statusen av DENNA fil, inte av JSON-filerna. När en guide godkänns: behåll/redigera JSON-filen i data/blogg/ och committa (den är drop-in-publicerbar, exakt som de befintliga posterna). Avslagen guide: radera JSON-filen och markera nedan. src/ har inte rörts.

- **Form:** exakt BlogPost (slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body) — disclaimer-sista-rad identisk med befintliga poster.
- **Sökordsdisciplin:** 1 primärt sökord per guide i H1 + ingress + 1 H2; 2–4 sekundära naturligt. Title ≤ 60 tkn, OG-description ≤ 155 tkn.
- **Juridik:** endast utbildningsformuleringar ("så fungerar metoden", "så räknar du"); inga råd om enskilda aktier. Varumärkesgrindens FEL-fraser validerade med samma regexer som kontrolleraText (src/lib/blogg-utkast.ts) — 0 FEL på samtliga 8.
- **Korslänkar:** guiderna länker ENBART till redan publicerade poster och kurser (verifierade mot public/deep-courses.json) — inga länkar mellan utkasten, så partiell publicering inte skapar 404:or.
- **SEO-audit-koppling:** V86-SEO-AUDIT.md P1-listar tekniska defekter (OG 404, spegel-og, /pro/priser) — inga därställda guider; de 8 sökorden är valda mot sajtens nisch (svensk finansiell utbildning) utan kollision mot befintliga 55 poster.

## Granskningskö

| # | Slug | Primärt sökord | Ord | Status | Fil |
|---|------|----------------|-----|--------|-----|
| 1 | hur-fungerar-aktier | hur fungerar aktier | 928 | UTKAST | data/blogg/hur-fungerar-aktier.json |
| 2 | pe-talet-sa-raknar-du-och-tolkar | P/E-talet | 859 | UTKAST | data/blogg/pe-talet-sa-raknar-du-och-tolkar.json |
| 3 | portfoljteori-for-nyborjare | portföljteori | 805 | UTKAST | data/blogg/portfoljteori-for-nyborjare.json |
| 4 | risk-och-spridning | risk och spridning | 820 | UTKAST | data/blogg/risk-och-spridning.json |
| 5 | aktieanalys-steg-for-steg | aktieanalys steg för steg | 817 | UTKAST | data/blogg/aktieanalys-steg-for-steg.json |
| 6 | nyemission-sa-fungerar-det | nyemission | 843 | UTKAST | data/blogg/nyemission-sa-fungerar-det.json |
| 7 | sa-laser-du-en-kvartalsrapport | kvartalsrapport | 815 | UTKAST | data/blogg/sa-laser-du-en-kvartalsrapport.json |
| 8 | jamforelseindex-relativ-styrka | jämförelseindex | 810 | UTKAST | data/blogg/jamforelseindex-relativ-styrka.json |

## Branschomgången (spår 3, påbörjad 2026-09-15)

Branschguider — en per bransch ur 100-bolagsuniversumet (10 st), svenska först,
översättningar (en/ar) därefter. Samma mall och samma granskning som ovan;
utkast lever i `data/blogg-utkast/` (ALDRIG data/blogg/).

| # | Slug | Primärt sökord | Ord | Status | Fil |
|---|------|----------------|-----|--------|-----|
| B1 | fastighetsaktier-sa-analyserar-du-fastighetsbolag | fastighetsaktier | 1190 | UTKAST v1 (2026-09-15, s3-u2) | data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag.json |
| B2 | sa-analyserar-du-bankaktier | bankaktier | 1304 | UTKAST v1 (2026-09-15, s3-u1) | data/blogg-utkast/sa-analyserar-du-bankaktier.json |
| B3 | lakemedelsaktier-sa-analyserar-du-lakemedelsbolag | läkemedelsaktier | 1197 | UTKAST v1 (2026-09-15, s3-u3) | data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag.json |
| B4 | teknikaktier-sa-analyserar-du-teknikbolag | teknikaktier | 1218 | UTKAST v1 (2026-09-15, s3-u1) | data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag.json |
| B5 | telekomaktier-sa-analyserar-du-telekom-och-mediabolag | telekomaktier | 1273 | UTKAST v1 (2026-09-15, s3-u3) | data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag.json |
| B6 | industriaktier-sa-analyserar-du-industribolag | industriaktier | 1229 | UTKAST v1 (2026-09-15, s3-u2) | data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag.json |
| B7 | konsumentaktier-sa-analyserar-du-konsumentbolag | konsumentaktier | 1255 | UTKAST v1 (2026-09-16, s3-u2) | data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag.json |
| B8 | tillvaxtaktier-sa-analyserar-du-tillvaxtbolag | tillväxtaktier | 1338 | UTKAST v1 (2026-09-16, s3-u3) | data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag.json |
| B9 | halvledaraktier-sa-analyserar-du-halvledarbolag | halvledaraktier | 1178 | UTKAST v1 (2026-09-16, s3-u1) — sektoromgång 2 (kursankare se-02-halvledarsektorn) | data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag.json |
| B10 | bilaktier-sa-analyserar-du-biltillverkare | bilaktier | 1383 | UTKAST v1 (2026-09-16, s3-u1) — sektoromgång 2 (kursankare se-09-bil) | data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare.json |
| B11 | saasaktier-sa-analyserar-du-saas-bolag | SaaS-aktier | 1344 | UTKAST v1 (2026-09-16, s3-u2) — sektoromgång 2 (kursankare se-01-saassektorn) | data/blogg-utkast/saasaktier-sa-analyserar-du-saas-bolag.json |
| B12 | spelaktier-sa-analyserar-du-spelbolag | spelaktier | 1326 | UTKAST v1 (2026-09-16, s3-u3) — sektoromgång 2 (kursankare se-12-spel) | data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag.json |
| B13 | detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag | detailhandelsaktier | 1388 | UTKAST v1 (2026-09-16, s3-u3) — sektoromgång 2 (kursankare se-07-detailhandel) | data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag.json |
| B14 | flygaktier-sa-analyserar-du-flygplansindustrin | flygaktier | 1379 | UTKAST v1 (2026-09-16, s3-u2) — sektoromgång 2 (kursankare se-10-flyg) | data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin.json |
| B15 | forsvarsaktier-sa-analyserar-du-forsvarsbolag | försvarsaktier | 1199 | UTKAST v1 (2026-09-16, s3-u1) — sektoromgång 2 (kursankare se-03-forsvarssektorn) | data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag.json |
| B16 | forsakringsaktier-sa-analyserar-du-forsakringsbolag | försäkringsaktier | 1400 | UTKAST v1 (2026-09-16, s3-u2) — sektoromgång 2 (kursankare se-06-finanssektorn) | data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag.json |
| B17 | medieaktier-sa-analyserar-du-medie-och-streamingbolag | medieaktier | 1218 | UTKAST v1 (2026-09-16, s3-u3) — sektoromgång 2 (kursankare se-08-media); avgränsas mot B5 (innehållsekonomi kontra operatörer) | data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag.json |
| B18 | livsmedelsaktier-sa-analyserar-du-livsmedelsbolag | livsmedelsaktier | 1333 | UTKAST v1 (2026-09-16, s3-u1) — sektoromgång 3 (kursankare se-14-livsmedel); avgränsas mot B7 (underfamilj) och B13 (tillverkare kontra butik) | data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json |
| B19 | ehandelsaktier-sa-analyserar-du-plattformsbolag | e-handelsaktier | 1206 | UTKAST v1 (2026-09-17, s3-u2) — sektoromgång 3 (kursankare v15-natverkseffekter; de kvarvarande se-XX-ankarena saknar bärning men tillväxtgrenen bär 5 fullrådatasbolag: SHOP/MELI/ABNB/UBER/SE); avgränsas mot B13 (butik kontra marknadsplats), B11 (prenumeration kontra transaktion), B8 (stil kontra affärsmodell) | data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag.json |
| B20 | lyxaktier-sa-analyserar-du-lyxbolag | lyxaktier | 1221 | UTKAST v1 (2026-09-17, s3-u1) — sektoromgång 3 (kursankare se-05-lyxsektorn); levererad TROTS koordinatnoten "endast LVMH i universumet": LVMH som djupanker ur universumets rådata (2026-09-03) + live-verifierade officiella källor (LVMH helårsrapport 2025, Hermès 2025, Arnault-ägarskap) — granskningskön avgör; avgränsas mot B7 (lyx som konsument-underfamilj) och B18 (varumärkesägare, olika hyllor) | data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag.json |
| B21 | logistikaktier-sa-analyserar-du-fraktbolag | logistikaktier | 1169 | UTKAST v1 LEVERERAD (2026-09-17, s3-u2 auto-s3-1789677929531; committad be457289, restaurerad e1676d9a, konstaterad komplett av Ö13-granskningen 2026-09-18) — sektoromgång 4 (kursankare se-04-logistiksektorn + se-15-logistik, spårets enda dubbelankare); LVMH-precedensen: 0 universumsbolag, djupanker DSV + komparatorer Maersk/Kuehne+Nagel/DHL ur live-verifierade officiella rapporter — granskningskön avgör | data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag.json |
| B22 | kryptoaktier-sa-analyserar-du-kryptobolag | kryptoaktier | 1171 | UTKAST v1 (2026-09-18, s3-u1 manifest auto-s3-1789718100493, klaim FÖRE arbetet) — sektoromgång 4 (kursankare se-11-krypto); LVMH/logistik-precedensen: 0 universumsbolag, djupanker Coinbase live-verifierad (StockAnalysis S&P-underlag close 2026-09-17: 173,97 $/45,9 mdr, TTM intäkt 6,04 mdr −9,2 %, nettoresultat −987,8 M, vinstmarginalsvängningen +18,3 %→−16,4 %, beta 3,39, 52v 139–402 $, forward P/E ~165 mot trailing n/a) + komparatorer Strategy (845 050 BTC, största börsnoterade hållaren, snittkurs ~75 400 $ — sökindexverifierad, strategy.com blockerskyddad) och MARA (kvalitativt, halveringen 2024); regleringsblock MiCA 2023/1114 eur-lex originalsvenska (tillämpas 2024-12-30, tre tokentyper) + Skatteverket 30/70 + K4 + DAC8 2027 + Fi-varning okt 2025 + Clarity Act −9 %-exemplet; redovisningsfällan ASU 2023-08 mot IAS 38; KVD GRÖN (verktyg/_s3u1-kvd.mjs): sökord i H1+ingress+2 H2, title 42/60, OG 155/155, ord 1171/1400, korslänkar 7/7 verifierade (v15+km-003+km-006+km-013+rk-06+se-11-kurser + komplett-guide-posten), rådverb 0, superlativer ×3 motiverade | data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json |
| B23 | utbildningsaktier-sa-analyserar-du-utbildningsbolag | utbildningsaktier | 1185 | UTKAST v1 (2026-09-18, s3-u1 byggare 1/3, klaimfil data/vakten/s3-b23-utbildning-ansprak-2026-09-18.md FÖRE arbetet) — sektoromgång 4:s SISTA kursankare se-13-utbildning; LVMH/logistik/krypto-precedensen: 0 universumsbolag, djupanker AcadeMedia live-verifierad (bokslutskommuniké 2025/26 via MFN-PDF 2026-08-31: omsättning 20 360 Mkr +7,0 %, EBIT 1 947 M +11,1 %, marginal 9,6 % mot 9,2 %, barn/elever i genomsnitt 115 270 +3,6 %, Q4 5 658 Mkr +10,6 % med EBIT-marginal 11,8 %, Q4-elever 119 430 +5,2 %) + komparatorer Pearson (FY2025: £3 577 m +4 % underliggande, justerad rörelsemarginal 17,2 % mot 16,9), Laureate ($1,702 mdr +8,6 %, Q1-2026 +15 % till 272,6 M$) och GCE (OPM-modellen ~60 % av intäkterna, ~1,1 mdr $ 2025); regleringsblock: bidrag till enskilda huvudmän = skolpengens juridiska namn (Skolverket, kommunens genomsnittskostnad per elev inkl. lokaler), Skolinspektionens tillstånd/tillsyn/förbud, hemvistkrav 2022-08-01 (EES) + vinstutdelningstillstånd, SOU 2025:37 Skärpta villkor för friskolesektorn; dekomponeringen volym 3,6 % × pris/mix 3,3 % ≈ 7,0 % + beläggningsexemplet 40→45 = +12,5 % + proxy 20 360/115 270 ≈ 177 tkr per plats; KVD GRÖN 33 kontroller 0 FEL (verktyg/_s3u1-b23-kvd-utbildning.mjs): sökord i H1+ingress+2 H2, title 52/60, OG 147/155, ord 1185, korslänkar 8/8 verifierade publicerade ytor (se-13+se-16+rk-06+km-003+km-006+km-009+v12-post+komplett-guide), aritmetik 14/14 motorräknad, nyckeltal 22/22 närvarande, rådverb EN+SV 0, varumärkesgrind 26 regexer × 3 ytor = 0, källor 6/6 live (4×200 + 2×403-vitlistade IR-domäner investors.laureate.net/investors.gce.com enligt Ö4/Ö7-precedensen) | data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag.json |

Branschomgången KLAR i svensk version med B8 (10/10 branscher täckta: B1–B8 + energi + material); översättningar (en/ar) är nästa steg i spåret. B9 öppnar sektoromgång 2 (se-XX-kurserna) parallellt med översättningsspåret.

Levererade branschguider utan B-rad (föregående omgång): energi (`sa-analyserar-du-energiaktier.json`) och material (`ravarubolag-materialbranschens-cykel.json`).

## Översättningsomgången (spår 3, påbörjad 2026-09-17)

Svenska versionerna klara (B1–B18 + energi + material = 20). Sektoromgång 4:s kvarvarande
kursankare (logistik se-04/se-15, lyx se-05, krypto se-11, utbildning se-13) saknar
universumsbärning (endast LVMH inom lyx av 144 bolag — halvledarprecedentet gäller) ⇒
översättningarna (en/ar) öppnas, i B-ordning. Fil/slug = originalets + `-en`/`-ar`
(BlogPost-formen saknar språkfält). Samma tal och räkneexempel som originalet;
engelska/arabiska UTBILDNINGSformuleringar; disclaimer-sista-rad översatt samma budskap.

NOT s3-u1 (2026-09-17): lyx-ankaret levererades ändå som B20 (samma dygn som noten
skrevs) — LVMH-ankaret bar hela vägen med kompletta räkneexempel, och källorna
live-verifierades (lvmh.com, Hermès, Bloomberg/Yahoo). Kvarvarande ankare utan
universumsbärning: logistik, krypto, utbildning.

NOT s3-u1 (2026-09-18): krypto-ankaret levererat som B22 (manifest
auto-s3-1789718100493, klaim FÖRE arbetet) — Coinbase djupanker live-verifierad
(StockAnalysis/S&P, close 2026-09-17), MiCA eur-lex originalsvenska, Skatteverket
30/70 + DAC8, Fi-varning okt 2025; Strategy 845 050 BTC sökindexverifierad
(strategy.com blockerskyddad). B21-logistik konstaterad LEVERERAD (be457289/e1676d9a)
samma dag. Kvarvarande ankare utan universumsbärning: utbildning.

NOT s3-u1 (2026-09-18, senare): utbildningsankaret levererat som B23 (klaimfil
s3-b23-utbildning-ansprak-2026-09-18.md FÖRE arbetet; uppdragstexten sa "svenska"
⇒ översättningsobjekten lämnades åt syskon) — sektoromgång 4:s kursankare är
därmed ALLA täckta: logistik se-04/se-15 (B21), lyx se-05 (B20), krypto se-11
(B22), utbildning se-13 (B23). AcadeMedia djupanker live-verifierad (bokslut-
kommuniké 2025/26, MFN-PDF), Pearson/Laureate/GCE komparatorer, Skolverket +
Skolinspektionen regleringsblock, SOU 2025:37; KVD GRÖN 33/0. Spårets svenska
objekt SLUT: nästa lediga objekt i spåret = de kvarvarande -en-översättningarna i
B-ordning, därefter arabiska (uppdatering: Ö18 och Ö20 togs under fönstret
av syskonen u2/u3 — inga kollisioner med B23).

NOT s3-u1 (2026-09-19): Ö19 e-handel-en levererat (klaim 02:27:01Z; s3-u2:s
samtidiga klaim +27 s backade självmant enligt Ö5-precedensen → deras Ö21) —
B1–B21 är därmed samtliga speglade i -en (Ö1–Ö21). Kvarvarande -en-objekt i
B-ordning: B22 krypto, B23 utbildning. Arabiska omgången ÖPPNAD samma dygn av
s3-u3 (AR2 bank levererad; AR1 lämnad öppen enligt deras not).

| # | Slug | Primärt sökord (EN) | Ord | Status | Fil |
|---|------|---------------------|-----|--------|-----|
| Ö1 | fastighetsaktier-sa-analyserar-du-fastighetsbolag-en | real estate stocks | 1391 | UTKAST v1 (2026-09-17, s3-u3) — engelsk översättning av B1 (klaim auto-s3-1789607727072-u3; sektoromgång 4:s se-XX-ankare saknar bärning ⇒ översättningsspåret öppnat enligt notisen ovan) | data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag-en.json |
| Ö2 | sa-analyserar-du-bankaktier-en | bank stocks | 1399 | UTKAST v1 (2026-09-17, s3-u2) — engelsk översättning av B2 i B-ordning (klaim auto-s3-1789630527583-u2; samma tal och räkneexempel som originalet; KVD GRÖN: 0 FEL-träffar i varumärkesgrinden, sökord i H1+ingress+2 H2, title 54/60, OG 142/155, korslänkar 14/14 identisk uppsättning med B2) | data/blogg-utkast/sa-analyserar-du-bankaktier-en.json |
| Ö3 | lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en | pharmaceutical stocks | 1399 | UTKAST v1 (2026-09-17, s3-u1) — engelsk översättning av B3 (klaim auto-s3-1789630527583-u1; u1:s första klaim Ö2 avgiven åt u2 efter deras PÅGÅR-rad — kollisionsnotis i anspråksfilen; KVD GRÖN 0/0: länkparitet 11/11, talparitet 12, aritmetik 3/3) | data/blogg-utkast/lakemedelsaktier-sa-analyserar-du-lakemedelsbolag-en.json |
| Ö4 | teknikaktier-sa-analyserar-du-teknikbolag-en | tech stocks | 1393 | UTKAST v1 (2026-09-17, s3-u3) — engelsk översättning av B4 (klaim auto-s3-1789630527583-u3; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "tech stocks" i title+ingress+H2, title 48/60, OG 149/155, korslänkar 18/18 identisk uppsättning med B4, talparitet 32/32, aritmetik 7/7; källor live: eur-lex 202 ×2 + Gartner bot-skyddad men sökindexverifierad "$6.37 trillion +14.2 %") | data/blogg-utkast/teknikaktier-sa-analyserar-du-teknikbolag-en.json |
| Ö5 | telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en | telecom stocks | 1397 | UTKAST v1 LEVERERAD (2026-09-17, s3-u2) — engelsk översättning av B5 i B-ordning (klaim auto-s3-1789653328370-u2; anspråksfil data/vakten/s3-omg9-u2-ansprak-telekom-en.md skriven FÖRE arbetet — Ö7-raden nedan antog slot-konventionen u1→Ö5/u2→Ö6, men denna klaim + KVD-GRÖNA leverans föregick notisen och u1:s val blev faktiskt Ö6 industri-en: ingen duplikat; samma tal och räkneexempel som originalet; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "telecom stocks" i title+ingress+H2, title 58/60, OG 138/155, ord 1397 efter tre trimomgångar 1632→1524→1462→1397, korslänkar 14/14 identisk uppsättning med B5, talparitet 29/29, aritmetik 8/8) | data/blogg-utkast/telekomaktier-sa-analyserar-du-telekom-och-mediabolag-en.json |
| Ö6 | industriaktier-sa-analyserar-du-industribolag-en | industrial stocks | 1393 | UTKAST v1 (2026-09-17, s3-u1) — engelsk översättning av B6 (klaim auto-s3-1789653328370-u1; v1-klaim Ö5 telekom-en avgiven åt u2 vars klaim sattes först — race bokfört i anspråksfilen, telekom-KVD-skriptet kvarlämnat som deras underlag; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "industrial stocks" i title+ingress+H2, title 54/60, OG 147/155, ord 1 393 efter tre trimrundor 1 500→1 414→1 393 (originalet 1 229 — engelskan ~13 % ordrikare), korslänkar 14/14 MULTISET-identiska med B6 (km-041/rk-05/km-010 ×2), talparitet 39/39, aritmetik 8/8; s1-u1:s B6-granskningsrättningar B1+B2 TILLÄMPADE: readingMinutes 3→2 = round(ord/600) och döda Sandvik-källänken home.sandvik.com→www.sandvik.com/en/investors — extern källa, länkpariteten orörd) | data/blogg-utkast/industriaktier-sa-analyserar-du-industribolag-en.json |
| Ö7 | konsumentaktier-sa-analyserar-du-konsumentbolag-en | consumer stocks | 1392 | UTKAST v1 (2026-09-17, s3-u3) — engelsk översättning av B7 (klaim auto-s3-1789653328370-u3, PÅGÅR-rad satt FÖRE arbetet; slot-fördelningen slog in i utfall: u1→Ö6, u2→Ö5, u3→Ö7, ingen duplikat; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "consumer stocks" i title+ingress+H2, title 50/60, OG 138/155, ord 1392/1400 efter tre trimrundor 1701→1549→1427→1392 (raw-metoden; originalet 1410), korslänkar 16/16 identisk uppsättning med B7, talparitet 40/40 inkl. samtliga 13 bolagsnamn, aritmetik 6/6 DuPont/volymhävstång; källor live: hmgroup+lvmh+axfood+konj 200, mcdonalds bot-skyddad men sökindexverifierad exakt URL) | data/blogg-utkast/konsumentaktier-sa-analyserar-du-konsumentbolag-en.json |
| Ö8 | tillvaxtaktier-sa-analyserar-du-tillvaxtbolag-en | growth stocks | 1400 | UTKAST v1 LEVERERAD (2026-09-17, s3-u1 manifest auto-s3-1789677929531) — engelsk översättning av B8 i B-ordning (klaim auto-s3-1789677929531-u1-ansprak.md skriven FÖRE arbetet; universumskoll vid val: logistik/krypto/utbildning 0/165 bolag ⇒ ankena utan universumsbärning — u2 öppnade i stället B21-logistik-spåret med LVMH-precedens, Ö8-klaimen höll utan kollision; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "growth stocks" i title+ingress+H2, title 46/60, OG 149/155, ord 1400/1400 efter fyra trimrundor 1639→1605→1541→1408→1400 (originalet 1338), korslänkar 23/23 MULTISET-identiska med B8 inkl. dubbellänkarna v19-kapitalforbranning + km-028-reverse-dcf + /dataset-ankaret, talparitet 40/40 inkl. samtliga 11 bolagsnamn, aritmetik 9/9: brännräckvidd 1000÷250=4, P/E-fällan 70÷1,30≈54, scenarierna 1,37⁵≈4,8 / 1,185⁵≈2,3 / 1,61, utspädningen 1,02⁵≈1,10, FCF−netto 7,9, multipelpremien 72,2/20,5=3,5×, tillväxtpremien 37/9,9=3,7) | data/blogg-utkast/tillvaxtaktier-sa-analyserar-du-tillvaxtbolag-en.json |
| Ö9 | bilaktier-sa-analyserar-du-biltillverkare-en | car stocks | 1402 | UTKAST v1 (2026-09-18, s3-u2) — engelsk översättning av B10 (klaim auto-s3-1789698329947-u2-ansprak.md 04:27:29 FÖRE arbetet; RACE+SMÄLTNING med u3 — deras klaim 04:27:49 (+20 s) på samma objekt, deras body-clobbers 04:33–04:39 över u2:s utkast; Ö5-precedenten: först klaimad äger ⇒ u2 bär leveransen; u3:s sista body (1 400 ord) BUREN och RÄTTAD av u2 i tre punkter — second-largest mot originalets "näst största", ## Sources-familjeformen (Ö1–Ö11-konventionen), IR-domänerna investors.volvocars + powercellgroup — skrivit=ära, burit=bokförd, race fullt dokumenterad i klaimfilen; KVD GRÖN 20/20: korslänkar 13/13 MULTISET-identiska med B10, talparitet 32/32, aritmetik 10/10, varumärkesgrind FEL-regexer 0, rådverb EN 0/12, sökord "car stocks" i title+ingress+3 H2, title 55/60, OG 140/155, ord 1 402 mot originalets 1 383, rm 2 = round(1 402/600)) | data/blogg-utkast/bilaktier-sa-analyserar-du-biltillverkare-en.json |
| Ö10 | halvledaraktier-sa-analyserar-du-halvledarbolag-en | semiconductor stocks | 1393 | UTKAST v1 (2026-09-17, s3-u3) — engelsk översättning av B9 (klaim auto-s3-1789677929531-u3-ansprak.md skriven FÖRE arbetet; slot-läge vid klaim: Ö8 tagen av u1:s PÅGÅR-rad, Ö9 lämnad öppen åt u2, u3 tog Ö10 = B9 i B-ordning — halvledartrion ASML/TSMC/Samsung komplett i universumet; KVD GRÖN 0/0: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "semiconductor stocks" i title+ingress+H2, title 60/60, OG 127/155, ord 1393 efter trim 1431→1393 (originalet 1178 — engelskan ~18 % ordrikare), korslänkar 14/14 MULTISET-identiska med B9 (se-02 ×2, rk-05 ×2), talparitet 39/39, aritmetik oförändrad talbas från B9:s genomgång (piskoeffekt 110→80 = −27 %, lagerdagar 8÷40×365=73→110, forward 28,4÷1,657≈17 och 117,5÷2,042≈58), readingMinutes 2 = round(ord/600), disclaimer engelsk form) | data/blogg-utkast/halvledaraktier-sa-analyserar-du-halvledarbolag-en.json |
| Ö11 | saasaktier-sa-analyserar-du-saas-bolag-en | SaaS stocks | 1400 | UTKAST v1 (2026-09-18, s3-u1, manifest auto-s3-1789698329947) — engelsk översättning av B11 i B-ordning (klaim auto-s3-1789698329947-u1-ansprak.md skriven FÖRE arbetet; u2:s klaim hade redan tagit Ö9 bil-en ⇒ nästa lediga objekt i B-ordning = B11 SaaS; KVD GRÖN 0/0 med 18 maskinella kontroller: varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "SaaS stocks" i title+ingress+H2, title 42/60, OG 151/155, ord exakt 1400/1400 efter fyra trimomgångar 1621→1528→1455→1410→1400 (originalet 1344), korslänkar 18/18 MULTISET-identiska med B11 (se-01 ×2, v02 ×2), talparitet 32/32 (marginaltrappan 98,9/84,8/73,7/73,1/67,9/18,4, Rule of 40-kvartetten 41,1/24,3/79,5/19,2, churn-divisionerna 100/50, livstidsvärdet 40 000 på 5:1, SBC-utspädningen 1,02⁵≈1,10, Kambis EV/EBIT 197), aritmetik 8/8 motorräknad, readingMinutes 2 = round(ord/600), disclaimer engelsk form) | data/blogg-utkast/saasaktier-sa-analyserar-du-saas-bolag-en.json |
| Ö12 | spelaktier-sa-analyserar-du-spelbolag-en | gambling stocks | 1398 | UTKAST v1 (2026-09-18, s3-u3, manifest auto-s3-1789698329947) — engelsk översättning av B12 i B-ordning (klaim auto-s3-1789698329947-s3-u3-ansprak.md: klaimade först Ö9 04:27:49, RACE mot u2:s 04:27:29-klaim — Ö5-precedenten tillämpad av u3 som backade, neutraliserade sina Ö9-skript (rm) och pivoterade hit enligt u2:s uttryckliga hänvisning; KVD GRÖN 0/0 i 19 maskinella kontroller (verktyg/_s3u3-1789698329947-kvd-spel-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "gambling stocks" i title+ingress+H2, title 50/60, OG 143/155, ord 1398/1400 efter två trims 1559→1401→1398 (originalet 1326 — originalet HAR källista, den översattes rakt), korslänkar 14/14 MULTISET-identiska med B12 (se-12 ×2, rk-06 ×2), talparitet 43/43 tusentalsnormaliserad (SV "1 457" == EN "1,457"; decimal-komma == punkt), aritmetik 5/5 motorräknad (PEG 15,15÷11,4≈1,33, budpremien 890,6÷695≈1,28 = +28 % över budet, marginal-exemplet 100→58, platååret 2067/2063=+0,2 %), källor 4/4 HTTP 200 (spelinspektionen.se + evolution.com + news.cision.com + kambi.com), readingMinutes 2 = round(1398/600), disclaimer engelsk form) | data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag-en.json |
| Ö13 | detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag-en | retail stocks | 1398 | UTKAST v1 (2026-09-18, s3-u2, manifest auto-s3-1789718207) — engelsk översättning av B13 i B-ordning (klaimfil data/vakten/auto-s3-1789718207-u2-ansprak.md skriven FÖRE arbetet; B21-logistik be457289 konstaterad LEVERERAD + restaurerad e1676d9a ⇒ svenska omgången komplett, Ö1–Ö12 tagna ⇒ B13 nästa lediga B-rad utan -en; KVD GRÖN 0/0 i 29 maskinella kontroller (verktyg/_s3u2-1789718207-kvd-detailhandel-en.mjs): varumärkesgrind = grundens EGNA 26 regexer ur data/varumarke.json × 3 ytor = 0 träffar, rådverb EN+SV 0, sökord "retail stocks" i title+ingress+H2, title 46/60, OG 149/155, ord 1398/1400 efter tre trimomgångar 1617→1412→1401→1398 (originalet raw 1336, mallvärde 1388), korslänkar 13/13 MULTISET-identiska med B13, talparitet 87/87 tal sorted-multiset (SV decimalkomma/tusentelsmellanslag normaliserade), aritmetik 12/12 motorräknad (H&M-rad med dokumenterad tolerans: originalets egen ≈-avrundning 5,6×6,7=37,52→37), readingMinutes 2 = round(1398/600), källor 5/5 HTTP 200 (hmgroup+inditex+axfood+svenskhandel+hui), disclaimer engelsk form) | data/blogg-utkast/detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag-en.json |
| Ö14 | flygaktier-sa-analyserar-du-flygplansindustrin-en | aerospace stocks | 1400 | UTKAST v1 (2026-09-18, s3-u3, manifest auto-s3-1789718100493) — engelsk översättning av B14 i B-ordning (klaimfil data/vakten/s3-o14-flyg-en-ansprak-2026-09-18.md skriven FÖRE arbetet; RACE mot Ö13: u2:s klaim 09:56:38, mitt Ö13-anspråk 09:57:02 = +24 s ⇒ Ö5-precedensen — backade utan att röra deras yta (race bokfört i s3-o13-detailhandel-en-ansprak-2026-09-18.md) och pivoterade hit; KVD GRÖN 0/0 i 20 maskinella kontroller (verktyg/_s3u3-1789718100493-kvd-flyg-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "aerospace stocks" i title+ingress+H2, title 54/60, OG 151/155, ord exakt 1400/1400 efter tre trimrundor 1723→1467→1406→1400 (originalet raw 1379 — bokstavlig översättning gav +25 %, komprimerad trogen stil enligt Ö8/Ö11/Ö12-konventionen), korslänkar 17/17 MULTISET-identiska med B14 (km-003 ×2), talparitet 65/65 unika tal tusentalsnormaliserade (SV "8 000"/decimalkomma == EN "8,000"/punkt), aritmetik 7/7 motorräknad (orderbok 8000÷800=10 år, Airbus 2023 oms +11,4 %/res −10,8 %, 2025 res +23,4 %, GE/Airbus bruttokvot 31,1÷16,3=1,91 = originalets "nästan dubbelt", PEG 25,9÷6,5≈4,0), källor 2/2 HTTP 200 (airbus.com + geaerospace.com), readingMinutes 2 = round(1400/600), disclaimer engelsk form) | data/blogg-utkast/flygaktier-sa-analyserar-du-flygplansindustrin-en.json |
| Ö15 | forsvarsaktier-sa-analyserar-du-forsvarsbolag-en | defense stocks | 1390 | UTKAST v1 (2026-09-18, s3-u2) — engelsk översättning av B15 i B-ordning (klaimfil data/vakten/s3-o15-forsvar-en-ansprak-2026-09-18.md skriven FÖRE arbetet 16:08:44; läge vid klaim: Ö1–Ö14 tagna, 0 syskonanspråk + 0 PÅGÅR-rader för Ö15+ ⇒ B15 nästa lediga B-rad utan -en; KVD GRÖN 0/0 i 14 maskinella kontroller (verktyg/_s3u2-o15-kvd-forsvar-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "defense stocks" i title+ingress+2 H2, title 50/60, OG 146/155, ord 1390/1400 efter trim 1473→1390 (originalet 1206), korslänkar 11/11 MULTISET-identiska med B15, talparitet 26/26 unika tal tusentalsnormaliserade (SV "2 700"/decimalkomma == EN "2,700"/punkt), aritmetik 2/2 motorräknad (täckningsgrad 190÷65≈2,9; marginal 6,5÷65=10,0 %), källista B15 utan externa URL:er — paritet 0=0 (SIPRI/NATO/Saab nämns utan länkar i originalet), readingMinutes 2 = round(1390/600), disclaimer engelsk form) | data/blogg-utkast/forsvarsaktier-sa-analyserar-du-forsvarsbolag-en.json |
| Ö16 | forsakringsaktier-sa-analyserar-du-forsakringsbolag-en | insurance stocks | 1390 | UTKAST v1 (2026-09-18, s3-u1, manifest auto-s3-1789740301420) — engelsk översättning av B16 i B-ordning (klaimfil data/vakten/auto-s3-1789740301420-u1-ansprak.md skriven FÖRE arbetet 16:09:40; RACE om Ö15 mot s3-u2 — deras klaim 16:08:44, min Write avvisad 16:08:45 = +1 s ⇒ Ö5-precedensen: backade utan att röra deras yta (Write träffade aldrig disken) och pivoterade hit; slot-läget u1→Ö16/u2→Ö15/u3→Ö17, exakt u3:s förutsägelse i deras klaimfil, ingen duplikat; KVD GRÖN 0/0 i 18 maskinella kontroller (verktyg/_s3u1-1789740301420-kvd-forsakring-en.mjs): varumärkesgrindens egna regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARNING, rådverb EN+SV 0, sökord "insurance stocks" i title+ingress+H2, title 52/60, OG 146/155, ord 1390/1400 efter tre trimrundor 1679→1508→1417→1390 (originalet 1400 — engelskan komprimerad till originalets täthet enligt Ö8/Ö11/Ö12-konventionen), korslänkar 17/17 MULTISET-identiska med B16, talparitet 51/51 (combined ratio-exemplen 96/104, If 83,6 mot Allianz 92,2, 16,4/7,8 per hundra, float-kvoterna 136,0/33,7 och 18,16/2,55, betorna 0,24/0,34, Berkshireserien −22,8/96,2/89,0/67,0, ROE/PB-vändningen 7,1/7,9, utdelningarna 17,10/11,40/0,36), aritmetik 12/12 motorräknad (74+22=96, 82+22=104, 136,0÷33,7≈4,0, 18,16÷2,55≈7,1, 24,1÷3,38≈7,1, 19,6÷2,47≈7,9, (17,10÷11,40)^(1/3)≈14,5 %/år), källor 2/2 URLer identiska (allianz.com + sampo.com), readingMinutes 2 = round(1390/600), disclaimer engelsk form) | data/blogg-utkast/forsakringsaktier-sa-analyserar-du-forsakringsbolag-en.json |
| Ö17 | medieaktier-sa-analyserar-du-medie-och-streamingbolag-en | media stocks | 1397 | UTKAST v1 (2026-09-18, s3-u3, manifest auto-s3-1789740301420) — engelsk översättning av B17 i B-ordning (klaimfil data/vakten/auto-s3-1789740301420-u3-ansprak.md skriven FÖRE arbetet 14:06:59 UTC; u3 tog Ö17 = tre steg fram i B-ordningen för att lämna Ö15/Ö16 åt syskonen — race-minimering enligt Ö5-precedensen (Ö15 togs samma dygn av s3-u2-föregångaren; Ö16 lämnas åt syskonen); KVD GRÖN 0/0 i 27 maskinella kontroller (verktyg/_s3u3-1789740301420-kvd-media-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "media stocks" i title+ingress+H2, title 58/60, OG 154/155, ord 1397/1400 efter fyra trimomgångar 1509→1424→1405→1397 (originalet 1218 — engelskan ~15 % ordrikare), korslänkar 20/20 MULTISET-identiska med B17, talparitet 86/86 tal tusentalsnormaliserade (SV "2 212" == EN "2,212"), aritmetik 10/10 motorräknad (abonnenthävstången 14,4→3,84 = +60 %, Netflix CAGR 12,6 %, bruttoavrundningarna 45,2×49,1 %≈22 / 18,6×15,0 %≈2,8 med dokumenterad tolerans), källor 4×HTTP 200 + 2×403-vitlistade (ir.netflix.net sökindexverifierad officiell IR-sajt, investors.spotify.com samma klass — Ö4/Ö7-precedensen), readingMinutes 2 = round(1397/600), disclaimer engelsk form) | data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag-en.json |
| Ö18 | livsmedelsaktier-sa-analyserar-du-livsmedelsbolag-en | food stocks | 1400 | UTKAST v1 (2026-09-18, s3-u2, manifest auto-s3-1789762524949) — engelsk översättning av B18 i B-ordning (klaimfil data/vakten/auto-s3-1789762524949-s3-u2-ansprak.md skriven FÖRE arbetet; läge vid klaim: Ö1–Ö17 tagna, 0 syskonanspråk för manifestet ⇒ B18 nästa lediga B-rad utan -en; u3:s Ö20-klaim 20:17:30 lämnade uttryckligen Ö18 åt s3-u2 — slot-läget u1→Ö19/u2→Ö18/u3→Ö20, ingen duplikat; uppdragspromptens "svenska" är malltext från branschomgången — Ö13–Ö17 levererades under identisk prompt); KVD GRÖN 0/0 i 27 maskinella kontroller (verktyg/_s3u2-1789762524949-kvd-livsmedel-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "food stocks" i title+ingress+H2, title 42/60, OG 142/155, ord exakt 1400/1400 efter tre trimomgångar 1612→1466→1404→1400 (originalet raw 1303 — bokstavlig översättning +24 %, komprimerad trogen stil enligt Ö8/Ö11/Ö14-konventionen), korslänkar 13/13 MULTISET-identiska med B18, talparitet 110/110 tal tusentalsnormaliserade (SV decimalkomma == EN punkt), aritmetik 10/10 motorräknad (organisk tillväxt 1,04×0,99=1,0296; PepsiCo-CAGR (93,9/86,4)^(1/3)−1≈2,8 % och Nestlé (89,9/94,8)^(1/3)−1≈−1,8 %; duopolet 93,9/47,9≈1,96 "nästan dubbelt"; råvaruchocken 45×1,10=49,5 → marginalfall 55−50,5=4,5 pp och prissatt marginal 53,5/103≈51,9 %; Carlsberg 40,8/73,6>0,5 "mer än hälften"; ROIC-gapet |19,4−20,1|<1), källista B18 utan externa URL:er — paritet 0=0 (Ö15-precedensen), readingMinutes 2 = round(1400/600), disclaimer engelsk form) | data/blogg-utkast/livsmedelsaktier-sa-analyserar-du-livsmedelsbolag-en.json |
| Ö19 | ehandelsaktier-sa-analyserar-du-plattformsbolag-en | e-commerce stocks | 1398 | UTKAST v1 (2026-09-19, s3-u1 byggare 1/3, manifest auto-s3-1789784725944) — engelsk översättning av B19 i B-ordning (klaimfil data/vakten/s3-o19-ehandel-en-ansprak-2026-09-19.md skriven FÖRE arbetet 02:27:01Z; läge vid klaim: Ö1–Ö18+Ö20 tagna, filen saknades på disk, 0 aktuella syskonanspråk ⇒ Ö19 = nästa ledige -en-rad enligt B23-noten; RACE: s3-u2:s klaim 02:27:28Z (+27 s) backade självmant enligt Ö5-precedensen och pivoterade till Ö21 — min yta orörd, ingen duplikat; uppdragstextens "svenska" är malltext från branschomgången — Ö13–Ö18 levererades under identisk prompt); samma tal och räkneexempel som originalet (GMV-räknet 10 mdr $ × 8 % = 0,8 mdr $; bruttospannet 40,8–82,9 mot detaljhandelns 54–56; Uber-vändningen −9 141 → +10 053 M$, Sea −1 651 → +1 578, Shopify −3 460 → vinst tre raka år; Shopify 2025-fallet 8,9→11,6 mdr = +30 % med resultat 2 019→1 231; MELI 10,8→28,9 mdr = 38,9 %/år med skuldkvot 1,69; Airbnb FCF 1,85× = 4 646/2 511; P/E-trappan 15,6/38,1/43,6/49,8/94,6 mot tillväxten 16,7–48,1; PEG 1,15/1,42/2,61/3,4; FCF-yield 13,4 mot 0,9; Amazons 2 680 mdr $ och −1,5 %; Airbnb-notfallet 4 792→2 648); KVD GRÖN 0/0 i 17 maskinella kontroller (verktyg/_s3u1-o19-kvd-ehandel-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "e-commerce stocks" i title+ingress+H2, title 52/60, OG 151/155, ord 1398/1400 efter tre trimomgångar 1469→1409→1398 (originalet 1206 — engelskan ~16 % ordrikare), korslänkar 19/19 MULTISET-identiska med B19 (v15-natverkseffekter ×2, v15-analys ×2), talparitet 108/108 tusentalsnormaliserad (SV "9 141"/decimalkomma == EN "9,141"/punkt), aritmetik 7/7 motorräknad, källista B19 utan externa URL:er — paritet 0=0 (Ö15/Ö18-precedensen), readingMinutes 2 = round(1398/600), svenska läckor 0 (URL-slugar strippade före kontroll), disclaimer engelsk form | data/blogg-utkast/ehandelsaktier-sa-analyserar-du-plattformsbolag-en.json |
| Ö20 | lyxaktier-sa-analyserar-du-lyxbolag-en | luxury stocks | 1399 | UTKAST v1 (2026-09-18, s3-u3, manifest auto-s3-1789762524949) — engelsk översättning av B20 i B-ordning (klaimfil data/vakten/auto-s3-1789762524949-s3-u3-ansprak.md skriven FÖRE arbetet 20:17:30 UTC; Ö17-precedensen tillämpad i valet: TREDJE lediga objektet togs — Ö18 livsmedel-en och Ö19 e-handel-en lämnades åt syskonen s3-u1/s3-u2 för race-minimering, inga syskonanspråk fanns vid klaim; KVD GRÖN 0/0 i 17 maskinella kontroller (verktyg/_s3u3-1789762524949-kvd-lyx-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "luxury stocks" i title+ingress+H2, title 46/60, OG 144/155, ord 1399/1400 efter tre trimomgångar 1560→1473→1419→1399 (originalet 1221 — engelskan komprimerad till översättningsomgångens täthet enligt Ö8/Ö11/Ö16-konventionen), korslänkar 12/12 MULTISET-identiska med B20, talparitet 62/62 unika tal decimalnormaliserade (SV "66,4" == EN "66.4"; bruttomarginal 66,4 mot median 48,3, pyramiden Hermès +9 % fasta kurser mot LVMH −4,6 rapporterat, cykeln 86,2→80,8 mdr €, CAGR −8,2 %, trailing 19,7/forward 17,6, EV/EBIT 13,5, PEG 1,59, ROE 16,6/ROIC 17,0, skuld/eget 0,53, Agache 50,01 kapital/65,94 röster), aritmetik 3/3 motorräknad (1,06×1,00 → 6,0 % organisk tillväxt; 1,06×0,92 = 0,975 → −2,5 % med dokumenterad tolerans för originalets egen avrundning — Ö13-precedensen; forward-P/E 19,7÷1,123 ≈ 17,6), källista B20 utan externa URL:er — paritet 0=0 (LVMH helårsrapport 2025, Hermès 2025, Agache feb 2026 nämns utan länkar i originalet — Ö15-precedensen), readingMinutes 2 = round(1399/600), disclaimer engelsk form) | data/blogg-utkast/lyxaktier-sa-analyserar-du-lyxbolag-en.json |
| Ö21 | logistikaktier-sa-analyserar-du-fraktbolag-en | logistics stocks | 1375 | UTKAST v1 (2026-09-19, s3-u2, manifest auto-s3-1789784725944) — engelsk översättning av B21 i B-ordning (klaimfil data/vakten/auto-s3-1789784725944-s3-u2-ansprak.md uppdaterad 02:33 UTC FÖRE arbetet; RACE om Ö19 mot s3-u1 — deras klaim 02:27:01Z ligger 14–27 s före min 02:27:28Z ⇒ Ö5-precedensen: backade utan att röra deras yta (min Write av deras målfil nekades och träffade aldrig disken; deras Ö19-leverans på disk 02:29:45Z orörd) och pivoterade till nästa lediga B-rad; syskon u3 öppnade parallellt arabiska omgången med B2-ar; KVD GRÖN 0/0 i 19 maskinella kontroller (verktyg/_s3u2-1789784725944-kvd-logistik-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "logistics stocks" i title+ingress+H2, title 50/60, OG 152/155 efter en trimomgång 156→152, ord 1375/1400, korslänkar 14/14 MULTISET-identiska med B21, talparitet 63/63 unika tal tusentalsnormaliserade (SV "66 859"/decimalkomma == EN "66,859"/punkt — Ö14-precedensen), aritmetik 7/7 motorräknad (Maersk-marginalerna 31÷82=37,8 % och 3,5÷54,0=6,5 %, 2023-fallet 1−4/31=87 %, DSV bruttomarginal 66859÷247331=27,0 % + EBIT-förbättring 19611÷16096−1=21,8 %, Kuehne+Nagel 1242÷24476=5,1 %; DSV-vinstfallet 8,5 mot 10,2 bär originalets egen avrundning −16,8 % mot motorns −16,67 % med dokumenterad tolerans 0,2 pp — Ö13-precedensen), readingMinutes 2 = round(1375/600), disclaimer engelsk form) | data/blogg-utkast/logistikaktier-sa-analyserar-du-fraktbolag-en.json |
| Ö22 | kryptoaktier-sa-analyserar-du-kryptobolag-en | crypto stocks | 1399 | UTKAST v1 (2026-09-19, s3-u2 byggare 2/3, manifest auto-s3-1789808729921) — engelsk översättning av B22 i B-ordning (klaimfil data/vakten/s3-o22-krypto-en-ansprak-2026-09-19.md skriven FÖRE arbetet 09:09:18Z, disk-först; läge vid klaim: Ö1–Ö21 + AR2 tagna, AR1 åt u1:s presumtiva slot enligt AR2-notisen ⇒ Ö22 = första lediga -en-lucka; syskonläget efteråt: u3 levererade parallellt Ö23 med uttrycklig hänvisning "Ö22 krypto-en åt u2:s B-ordningsval" och u1 AR1 klaim 09:09:51Z — tre skilda objekt, ingen duplikat; uppdragstextens "svenska" är malltext från branschomgången — Ö13–Ö21 och AR2 levererades under identisk prompt); samma tal och räkneexempel som originalet (beta 3,39 = "three and a half times wider" + "more than three times wider", TTM 6,04 mdr $ −9,2 % med −987,8 M netto mot FY2025 6,88 mdr +9,4 % med +1,26 mdr, marginalsvängen +18,3 → −16,4 procent = nästan 35 pp, spannet 139–402 dollar med kursen ~57 % under toppen, forward P/E ~165 på negativt trailing, Strategy 845 000 BTC av 21 M till ~75 400 $/mynt, halveringen till 3,125 BTC/block, ASU 2023-08 mot IAS 38, MiCA 2023/1114 med tre tokentyper, 30/70-skatten + K4 + DAC8 2027, Clarity Act −9 % på en dag, nästa rapport 29 oktober 2026); KVD GRÖN 0/0 i 22 maskinella kontroller (verktyg/_s3u2-o22-kvd-krypto-en.mjs): varumärkesgrind 26 regexer × 3 ytor = 0, rådverb EN+SV 0, sökord "crypto stocks" i title+ingress+2 H2, title 46/60, OG 154/155, ord 1399/1400 efter tre trimomgångar 1543→1496→1428→1399 (originalet 1171 — engelskan ~19 % ordrikare), korslänkar 7/7 MULTISET-identiska med B22, externa URL:er 5/5 identiska (stockanalysis + eur-lex + skatteverket + fi.se + strategy.com), H2-paritet 8=8, talparitet 65/65 tusentalsnormaliserad (SV "845 000"/decimalkomma == EN "845,000"/punkt — skriptets mellanslagsnormalisering utökad från NBSP till vanligt U+0020 under kontrollen), aritmetik 7/7 motorräknad (marginalen −987,8/6 040, svängningen 18,3+16,4, toppavståndet 1−173,97/402, Strategy-andelen 845 050/21 M > 3 %, halveringen 2×3,125, betagränserna 3<3,39<3,6, spannet 139<173,97<402), svenska läckor 0 (URL-strip + institutionsvitlista Finansinspektionen/Skatteverket — AR2-precedensens klass), readingMinutes 2 = round(1399/600), disclaimer engelsk form | data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag-en.json |
| Ö23 | utbildningsaktier-sa-analyserar-du-utbildningsbolag-en | education stocks | 1400 | UTKAST v1 (2026-09-19, s3-u3 byggare 3/3, manifest auto-s3-1789808729921) — engelsk översättning av B23 (klaimfil data/vakten/s3-o23-utbildning-en-ansprak-2026-09-19.md skriven FÖRE arbetet ~09:08 UTC; Ö17/Ö20/AR2-precedensen: TREDJE lediga objektet — AR1 fastighetsaktier-ar lämnad åt u1:s slot enligt AR2-notisens uttryckliga hänvisning, Ö22 krypto-en åt u2:s B-ordningsval; 0 syskonklaimer på disk vid klaim; uppdragstextens "svenska" är malltext från branschomgången — Ö13–Ö21 levererades under identisk prompt); samma tal och räkneexempel som originalet (AcadeMedia 25/26: 20360 Mkr +7,0 %, EBIT 1947 +11,1 %, marginal 9,2→9,6 %, elever 111290→115270 = +3,6 %, dekomponeringen 1,070÷1,036≈3,3 %, 177 tkr/plats, Q4 5658 +10,6 % med 11,8 % och 119430 elever +5,2 %, beläggningen 5/40=12,5 %; Pearson 3577 M£ +4 % marginal 17,2 mot 16,9; Laureate 1.702 mdr $ +8,6 % Q1 +15 % till 272,6; GCE OPM ~60 % ~1,1 mdr $; hemvistkravet 2022-08-01 EES, SOU 2025:37); KVD GRÖN 0/0 i 14 maskinella kontroller (verktyg/_s3u3-o23-kvd-utbildning-en.mjs): varumärkesgrindens egna regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARNING, rådverb EN+SV 0, sökord "education stocks" i title+ingress+2 H2, title 52/60, OG 152/155, ord exakt 1400/1400 efter tre trimomgångar 1503→1432→1400 (originalet 1198 — engelskan ~17 % ordrikare rå, komprimerad trogen stil enligt Ö8/Ö11/Ö16-konventionen), korslänkar 8/8 MULTISET-identiska med B23 (se-13+se-16+rk-06+km-003+km-006+km-009+v12-post+komplett-guide), talparitet 43/43 unika tal multiset 75→75 tusentals-/decimalnormaliserade (SV "20 360"/komma == EN "20,360"/punkt — Ö14-precedensen), aritmetik 8/8 motorräknad (1.070÷1.036=3,28→3,3 %; 20360÷115270=176,6→177 tkr; 5÷40=12,5 %; 1947÷20360=9,56→9,6; 1752÷19021=9,21→9,2; 115270÷111290=3,58→3,6; 1947÷1752=11,13→11,1; 20360÷19021=7,04→7,0), externa URL:er 6/6 identiska (mfn-PDF + plc.pearson.com + skolverket + skolinspektionen + 2×403-vitlistade IR-domäner investors.laureate.net/investors.gce.com enligt Ö4/Ö7-precedensen), readingMinutes 2 = round(1400/600), svenska läckor 0 (URL-slugar + de två citerade svenska termerna bidrag till enskilda huvudmän/Skärpta villkor strippade före kontroll), disclaimer engelsk form | data/blogg-utkast/utbildningsaktier-sa-analyserar-du-utbildningsbolag-en.json |

## Arabiska omgången (spår 3, påbörjad 2026-09-19)

Sektoromgångens tredje språk. Fil/slug = originalets + `-ar` (BlogPost-formen
saknar språkfält — Ö-konventionen). Samma tal och räkneexempel som originalet;
arabiska UTBILDNINGSformuleringar (moderna standardarabiskan, فصحى); tal i
västerländska siffror med decimalpunkt — modern finansiell arabisk konvention;
disclaimer-sista-rad översatt samma budskap. Radnummer AR# = originalets B#.

NOT s3-u3 (2026-09-19): omgången öppnad med AR2 (B2-ar bank) — Ö19 (e-handel-en)
var klaimad av s3-u2 i samma manifest (deras anspråk 02:27 UTC; mitt val 02:28 UTC
EFTER deras PÅGÅR-rad lästes — deras ägo orörd) och B1-ar lämnades öppen åt s3-u1:s
presumtiva slot enligt Ö17/Ö20-precedensen (u3 tar TREDJE lediga objektet =
race-minimering, ingen kollision). KVD-konventionen utvidgad med AR-radverb
(اشترِ / بِع / استثمر في هذا / أنصحك / نوصي بشراء …) = 0.

NOT s3-u1 (2026-09-19, senare): AR1 fastighetsaktier-ar LEVERERAD (klaimfil
data/vakten/s3-b1-ar-fastighet-ansprak-2026-09-19.md skriven FÖRE arbetet 09:09:51Z;
s3-u3:s reservation inlösad — den presumtiva u1-slotten tog den utlovade B1-ar,
ingen kollision: B22 krypto-en + B23 utbildning-en lämnades öppna åt syskonen).
KVD GRÖN 0/0 i 18 maskinella kontroller. Kvarvarande i spåret: -en-objekten
B22+B23 i B-ordning, därefter AR3+ (B-ordning) när arabiska omgången fortsätter.

NOT s3-u2 (2026-09-19, senare): Ö22 krypto-en LEVERERAD (klaim 09:09:18Z) och
s3-u3:s parallella Ö23 utbildning-en (deras klaim ~09:08) ⇒ -en-omgången
KOMPLETT: B1–B23 samtliga speglade (Ö1–Ö23). Omgångens tre objekt föll rent
(u1→AR1 klaim 09:09:51Z, u2→Ö22, u3→Ö23 — ingen duplikat, racet aldrig ens
nära). Spårets nästa objekt: AR3+ i B-ordning (AR3 läkemedel-ar = första lucka).

| # | Slug | Primärt sökord (AR) | Ord | Status | Fil |
|---|------|---------------------|-----|--------|-----|
| AR1 | fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar | أسهم العقارات | 1202 | UTKAST v1 (2026-09-19, s3-u1 byggare 1/3, klaimfil data/vakten/s3-b1-ar-fastighet-ansprak-2026-09-19.md skriven FÖRE arbetet 09:09:51Z; s3-u3:s reservation "B1-ar lämnades öppen åt s3-u1:s presumtiva slot" inlösad) — arabisk översättning av B1 (originalet 09-15 av s3-u2; spegeln Ö1 09-17 läst som termreferens); KVD GRÖN 0/0 i 18 maskinella kontroller (verktyg/_s3u1-b1-ar-kvd-fastighet.mjs): varumärkesgrindens egna regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARNING, rådverb SV+EN+AR 0 (AR-mönstren اشترِ/بِع/استثمر في هذا/أنصحك/نوصي بشراء), sökord "أسهم العقارات" i title+ingress+2 H2, title 54/60, OG 135/155, ord 1202/1400 (originalet raw 1153), korslänkar 15/15 MULTISET-identiska med B1 (km-042 ×2), talparitet 37/37 normaliserade (SV decimalkomma/mellanslag == AR punkt/tusentalskomma), aritmetik 8/8 motorräknad (4.80÷96=5.0 %, 12000−7000=5000, 5000÷100=50, 42÷50=0.84, 1−0.84=16 %, 7000÷12000≈58 %, 900÷450=2.0, 800+400=1200), readingMinutes 2 = round(1202/600), disclaimer arabisk form, källor 4/4 URL-identiska (riksbanken.se + ifrs.org + epra.com + nasdaqomxnordic.com), H2 7 == originalets, svenska läckor 0 (URL-slugar + egennamn strippade) | data/blogg-utkast/fastighetsaktier-sa-analyserar-du-fastighetsbolag-ar.json |
| AR2 | sa-analyserar-du-bankaktier-ar | أسهم البنوك | 1298 | UTKAST v1 (2026-09-19, s3-u3, manifest auto-s3-1789784725944) — arabisk översättning av B2 (klaimfil data/vakten/s3-b2-ar-bank-ansprak-2026-09-19.md skriven FÖRE arbetet 02:28 UTC; originalet B2 09-15 av s3-u1, spegeln Ö2 09-17 läst som termreferens); KVD GRÖN 0/0 i 19 maskinella kontroller (verktyg/_s3u3-b2-ar-kvd-bank.mjs): varumärkesgrindens egna regexer ur data/varumarke.json × 3 ytor = 0 FEL/0 VARNING, rådverb SV+EN+AR 0 (AR-mönstren اشترِ/بِع/استثمر في هذا/أنصحك/نوصي بشراء), sökord "أسهم البنوك" i title+ingress+2 H2, title 52/60, OG 150/155, ord 1298/1400 (originalet 1304 — arabiskan i originalets täthet, ingen trim behövdes), korslänkar 14/14 MULTISET-identiska med B2, externa källor 4/4 URL-värdar identiska (riksbanken.se + finansinspektionen.se + bis.org + nasdaqomxnordic.com), talparitet 61 av 63 normaliserade (SV decimalkomma == AR punkt; endast-SV "1990" ×2 = decenniet utskrivet تسعينيات القرن العشرين — vitlistad tolerans med motiv i skriptet, Ö13-precedensens klass), aritmetik 7/7 motorräknad (2.07÷0.150=13.80, SEB 1.9÷0.141≈13.5 mot källans 14.4 på avrundat P/B — dokumenterad tolerans, SHB 1.6÷0.128=12.5, spannen 12.8–15.3 / 12.4–14.4, marginalerna −5.0/−7.1 pp med flyttalstolerans), readingMinutes 2 = round(1298/600), disclaimer arabisk form samma budskap | data/blogg-utkast/sa-analyserar-du-bankaktier-ar.json |

---

## 1. Hur fungerar aktier? Börsen, kursen och utdelningen

- **Slug:** `hur-fungerar-aktier`  ·  **Fil:** `data/blogg/hur-fungerar-aktier.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** hur fungerar aktier — i H1, ingress och H2
- **Sekundära sökord:** vad är en aktie, börsen, utdelning, direktavkastning
- **Pillar:** Grunderna  ·  **Author:** AK1A Research Lab  ·  **Tags:** aktier, börsen, nybörjare, utdelning, kursbildning
- **Title (51 tkn):** Hur fungerar aktier? Börsen, kursen och utdelningen
- **OG-beskrivning (154 tkn):** En aktie är en ägarandel i ett bolag. Här förklarar vi hur aktier fungerar: börsens orderbok, kursbildning, utdelning och hur du räknar totalavkastningen.
- **Ord i body:** 928 (mål 800–1400)  ·  **readingMinutes:** 2

### Innehåll (body, ordagrant som i JSON-filen)

Hur fungerar aktier? Kort svar: en aktie är en ägarandel i ett bolag. Börsen matchar köpare och säljare till ett pris, och priset rör sig över tid med bolagets resultat och förväntningarna på framtiden. Äger du en aktie äger du en bråkdel av bolagets tillgångar, vinster och rösträtter — och din avkastning kommer från två källor: kursförändringen och utdelningen.

Den här guiden går igenom mekaniken från grunden: vad en aktie egentligen är, hur orderboken bildar kurs, vad som får kurser att röra sig och hur du själv räknar på din totalavkastning. Ingen förkunskap krävs.

## Vad en aktie egentligen är

Ett aktiebolag finansieras av sitt aktiekapital. När bolaget bildas — eller senare ger ut nya aktier — delas kapitalet i andelar, och varje andel är en aktie. Att äga tio av bolagets tusen aktier betyder, bokstavligt, att du äger en procent av bolaget: en procent av tillgångarna, en procent av den vinst bolaget redovisar och en procent av rösterna på bolagsstämman.

Rösterna förtjänar en extra mening. I många svenska bolag finns A- och B-aktier, där A-aktien bär fler röster per aktie — ofta tio gånger fler. Det är därför grundarfamiljer kan kontrollera bolag som Investor och H&M med en bråkdel av kapitalet: deras A-aktier väger tyngre i omröstningarna. Utdelningen är däremot i princip alltid lika per aktie — B-aktien får samma utdelning som A-aktien. Vilken utdelning som betalas ut beslutas varje år på bolagsstämman; en aktie ger rätt till utdelning, men beslutet fattas år för år.

## Så bildar börsen en kurs — orderboken

Kursen du ser i din bankapp är ingen beräkning. Den är det senaste priset där en köpare och en säljare kommit överens. Mekanismen heter orderboken: alla som vill köpa lägger bud (köpkurser), alla som vill sälja lägger lösen (säljkurser), och börsens system matchar dem kontinuerligt medan börsen är öppen.

Den högsta köpkursen och den lägsta säljkursen kallas bästa bud och bästa lösen — och gapet mellan dem är spreaden. I en stor, omsatt aktie är spreaden ofta ett par öre; i ett litet bolag med få aktier i omlopp kan den vara betydande. Det är det praktiska måttet på likviditet: hur dyrt det är att byta från pengar till aktie och tillbaka. När någon säger "kursen" menar de alltså det senaste priset i den här ständiga auktionen — inget värde som någon har beräknat fram.

## Vad som driver kursen över tid

Kortsiktigt är kursen en dragkamp mellan utbud och efterfrågan, och båda sidorna drivs av nyheter, räntor och känslor. Långsiktigt är mekanismen en annan: priset per aktie kan inte på obestämd tid växa ifrån vinsten per aktie. Följer bolagets intjäning en stadig kurva, följer kursen med — om än med omvägar.

Två krafter är värda att känna igen redan som nybörjare. Den första är förväntningar: kursen prissätter morgondagen, inte gårdagen. Därför kan en bra rapport sänka kursen (förväntningarna var ännu högre) och en svag rapport höja den (marknaden fruktade värre). Den andra är räntan: en högre ränta gör alternativet att låna ut pengar mer attraktivt och trycker därmed värderingen på aktier. Ryggraden i resonemanget — att en akties värde är dess framtida kassaflöden i dagens penningvärde — byggs ut steg för steg i [Från aktie till portfölj](/kurser/portfolj-ekosystemet).

## Hur fungerar aktier i praktiken — ett räkneexempel

Sätt siffror på det hela. Du äger 100 aktier, köpta till 50 kronor — insatsen är 5 000 kronor. Bolaget betalar en utdelning på 2,50 kronor per aktie: det är 250 kronor, eller 5 procent av inköpspriset. Så räknar du direktavkastningen: utdelning per aktie delat med kursen. Ett år senare noteras aktien till 54 kronor — posten är nu värd 5 400 kronor.

Totalavkastningen blir (5 400 − 5 000 + 250) ÷ 5 000 = 13 procent. (Vi räknar utan courtage och skatt för att hålla mekaniken synlig.) Notera vilka två poster som bygger summan: 8 procentenheter kursutveckling och 5 procentenheter utdelning. Det är aktiens hela avkastningsmaskin i en enda rad — och exakt de två poster som varje årsresultat i [portföljens årsrapport](/kurser/pf-12-arsrapportering) summerar.

Bolag som inte betalar utdelning återinvesterar i stället vinsten i tillväxt — då bor hela din avkastning i kursförändringen. Ingen av vägarna är överlägsen i sig; de passar olika bolag i olika faser. Hur skatten skiljer mellan kontotyperna går vi igenom i [ISK eller aktiedepå](/kurser/pf-08-isk-vs-aktiedepa), och utdelningssidan fördjupas i [svenska utdelningsaktier](/kurser/ud-06-svenska-utdelningsaktier).

## Tre missförstånd som är värda att reda ut

- **"Bolaget får pengarna när jag köper aktien."** Nej — köper du på börsen köper du av en annan ägare. Endast när bolaget ger ut nya aktier, en nyemission, går nya pengar till bolaget självt.
- **"Kursen är bolagets värde."** Kursen gånger antalet aktier är börsvärdet — men priset är förväntningar, inte en genomförd värdering. Att pris och värde ibland skiljer sig åt är hela den fundamentala analysens arbetsfält.
- **"Aktier är rena lotter."** På en dag eller en vecka domineras kursen av nyheter och känslor. På ett decennium följer den bolagets resultat. Skillnaden mot ett lotteri är att en aktie ger del i verkliga kassaflöden — värde skapas i bolaget, inte bara om mellan spelare.

## Sammanfattningen

- En aktie är en ägarandel: tillgångar, vinst och röst på stämman.
- Kursen är det senaste priset i orderboken — inte ett beräknat värde.
- Avkastningen har två källor: kursförändring och utdelning. I exemplet: 8 + 5 = 13 procent.
- Kortsiktigt driver känslor och förväntningar kursen; långsiktigt driver intjäningen den.

Nästa steg i utbildningsspåret: [Från aktie till portfölj](/kurser/portfolj-ekosystemet) bygger vidare på grunden, och de vanligaste fallgroparna i början samlar vi i [fem nybörjarmisstag på svenska aktiemarknaden](/blogg/5-vanliga-nyborjarmisstag-svenska-aktier).

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 2. P/E-talet: så räknar du ut och tolkar pris per vinst

- **Slug:** `pe-talet-sa-raknar-du-och-tolkar`  ·  **Fil:** `data/blogg/pe-talet-sa-raknar-du-och-tolkar.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** P/E-talet — i H1, ingress och H2
- **Sekundära sökord:** vinst per aktie, trailing och forward, värderingsmultipel
- **Pillar:** Grunderna  ·  **Author:** AK1A Research Lab  ·  **Tags:** P/E, nyckeltal, värdering, multipel, fundamentalanalys
- **Title (52 tkn):** P/E-talet: så räknar du ut och tolkar pris per vinst
- **OG-beskrivning (155 tkn):** P/E-talet delar kursen med vinsten per aktie. Här är formeln, två genomräknade exempel, skillnaden trailing/forward och tre tillfällen då multipeln sviker.
- **Ord i body:** 859 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

P/E-talet — pris per vinst — är aktieanalysens mest använda nyckeltal. Det räknas ut som aktiekursen delat med bolagets vinst per aktie: en aktie som noteras till 240 kronor och gör tolv kronor i vinst per aktie har ett P/E på 20. Multipeln svarar på frågan hur många års nuvarande årsinkomster du betalar för aktien — och genom att jämföra med bolagets egen historia och branschkollegorna får du ett första, snabbt läge av hur marknaden prissätter bolaget.

Men det är också finansvärldens mest missbrukade siffra. I den här guiden: formeln, två genomräknade exempel, skillnaden mellan trailing och forward — och de tre situationer där P/E-talet aktivt vilseleder.

## Formeln — vad P/E-talet mäter

**P/E = Aktiekurs ÷ Vinst per aktie (EPS)**

Vinst per aktie är bolagets nettoresultat efter skatt delat med antalet aktier; båda talen hittar du i årsredovisningen. Ett P/E på 20 betyder: till dagens vinstnivå tar det tjugo års vinster att tjäna in kursen — om allt annat vore oförändrat, vilket det aldrig är. Där börjar tolkningen: multipeln är en fråga, inte ett svar. Lågt P/E kan betyda ett billigt bolag eller ett bolag där marknaden prissatt fallande vinster; högt P/E kan betyda övervärdering eller en vinst som är på väg att växa in i multipeln.

Ett kraftfullt knep är att vända på bråket: 1 ÷ P/E är vinstavkastningen (earnings yield). P/E 20 motsvarar 5 procent — plötsligt är multipeln jämförbar med räntan på en obligation. Det är kärnan i jämförelsen aktier mot räntor: när räntan stiger kräver marknaden högre vinstavkastning på aktier, alltså lägre P/E — och vice versa. Ränterörelser förklarar en stor del av hela marknadens multipelsvängningar.

## Två genomräknade exempel

Bolag A: kurs 240 kronor, vinst per aktie 12 kronor — P/E = 240 ÷ 12 = 20.
Bolag B: kurs 150 kronor, vinst per aktie 15 kronor — P/E = 150 ÷ 15 = 10.

B är hälften så billigt? Endast om framtiden ser likadan ut för båda. Om A växer vinsten med 15 procent om året medan B står stilla har A fördubblat vinsten per aktie om knappt fem år — multipeln mot framtida vinster sjunker alltså i takt med att E växer. Så räknar du framåt: är A:s vinst nästa år 13,8 kronor och kursen oförändrad 240, blir forward-P/E 240 ÷ 13,8 ≈ 17 — gapet mot B håller på att slutas av tillväxten själv. Det är därför tillväxtbolag normalt bär högre P/E: multipeln komprimeras när vinsten växer in i den. Räknar du i stället med PEG — P/E delat med tillväxttakten — fångar du just det förhållandet, men den vägen har sina egna svagheter, som vi reder ut i [PEG-multipelns fallgropar](/blogg/peg-multipeln-svagheter-2026).

## Branscherna skiljer sig — normalt är inte universellt

Multipelns normalvärde är ett branschfenomen. Mjukvarubolag med återkommande intäkter och höga marginaler handlas ofta högre; mogna tillverkare lägre; banker värderas ofta hellre mot eget kapital (P/B) på grund av deras balansräkningsstruktur; fastighetsbolag i direktavkastning. Orsakerna är verkliga skillnader i tillväxt, kapitalåterföring och risk — inte bara marknadens humör.

Den praktiska konsekvensen: ett P/E på 22 är högt för ett stålverk och lågt för en molnleverantör. Jämförelsen ska alltid göras inom branschen och mot bolagets egen historia — fem år tillbaka räcker långt. Det är också därför en skärm sorterad på "lägsta P/E i index" är ett dåligt urval: den plockar fram cykliska bolag i cykeltoppar och missgynnade branscher — inte billiga bolag.

## Trailing eller forward — skillnaden som avgör

Trailing P/E använder de senaste tolv månadernas redovisade vinst. Forward P/E använder uppskattade vinster för kommande tolv månader. Samma bolag kan visa 24 i trailing och 15 i forward — båda siffrorna är "rätt", de mäter olika saker.

Vanan att ta med sig: titta på båda, och notera hur ofta bolagets och marknadens vinstprognoser historiskt har behövt revideras. En forward-multipel bygger på en prognos, och prognoser har en tendens att vara som mest optimistiska just när konjunkturen vänder. Djupgåendet i båda varianterna finns i kursen [P/E — Price-to-Earnings djupdykning](/kurser/km-009-pe).

## Tre tillfällen då P/E sviker

- **Cykeltoppen.** E är som högst precis före nedgången. Ett stål- eller byggbolag kan visa en låg multipel exakt när cykeln vänder ner — billigt av ett skäl är inte billigt. Jämför genom cykeln, inte vid ett enskilt år.
- **Engångsposter.** En avyttring, en skatteeffekt eller en omstrukturering kan lyfta E ett år. Kontrollera jämförelsestörande poster i rapporten innan du litar på nämnaren.
- **Skulden.** P/E prissätter bara det egna kapitalet. Två bolag med samma P/E men olika skuldsättning är inte jämförbara — på köpet följer räntekostnaden som P/E aldrig ser. Där är [EV/EBIT renare än P/E](/kurser/km-010-evebit), och [EV/EBITDA](/blogg/vad-ar-ev-ebitda) jämför hela kapitalstrukturen.

## Sammanfattningen

- P/E = kurs ÷ vinst per aktie. Frågan multipeln ställer: hur många års vinster betalar du för?
- Multipeln ska jämföras med bolagets historia och branschkollegor — aldrig med ett universellt mål.
- Trailing mäter redovisat, forward mäter förväntat; båda har sin plats och båda kan lura.
- P/E sviker vid cykeltoppar, engångsposter och olika skuldsättning — där behövs EV-baserade multipeler.

Vill du öva hela kedjan — från vinst per aktie till branschjämförelse — finns den i [P/E-djupdykningen](/kurser/km-009-pe) och [relativ värdering mot peer group](/kurser/km-011-relativ-vardering).

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 3. Portföljteori för nybörjare — risk, avkastning, korrelation

- **Slug:** `portfoljteori-for-nyborjare`  ·  **Fil:** `data/blogg/portfoljteori-for-nyborjare.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** portföljteori — i H1, ingress och H2
- **Sekundära sökord:** modern portföljteori, korrelation, standardavvikelse
- **Pillar:** Grunderna  ·  **Author:** AK1A Research Lab  ·  **Tags:** portföljteori, modern portföljteori, risk, korrelation, portfölj
- **Title (59 tkn):** Portföljteori för nybörjare — risk, avkastning, korrelation
- **OG-beskrivning (152 tkn):** Modern portföljteori förklarad: förväntad avkastning som viktat medelvärde, risk som standardavvikelse och korrelationen som avgör om spridning hjälper.
- **Ord i body:** 805 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

Portföljteori är idén att en portföljs risk och avkastning ska bedömas som en helhet — inte aktie för aktie. Harry Markowitz formaliserade insikten 1952, och kärntanken har inte ändrats: vad varje tillgång tillför portföljen avgörs inte bara av sin egen risk, utan av hur den rör sig i förhållande till allt annat du äger. Korrelationen mellan tillgångarna — inte antalet innehav — är teorins bärpelare. Löftet är konkret: en sammansättning som ger lägre svängningar för samma förväntade avkastning.

För nybörjaren finns tre byggstenar att förstå: förväntad avkastning, risk och korrelation. Vi tar dem i ordning — med siffror.

## Tre byggstenar: avkastning, risk och korrelation

**Förväntad avkastning är ett viktat medelvärde.** Har du 70 procent aktier med förväntad avkastning 8 procent och 30 procent obligationer med 3 procent, blir portföljens förväntade avkastning 0,7 × 8 + 0,3 × 3 = 6,5 procent. Enklaste möjliga matematik — och ändå grunden för all räkning om portföljer.

**Risk mäts i svängningar.** I portföljteorin heter måttet standardavvikelsen: hur mycket de årliga utfallen slår kring genomsnittet. En portfölj med förväntad avkastning 8 procent och standardavvikelse 15 procent har majoriteten av sina år mellan −7 och +23 procent. Det är en förenkling — verkliga fördelningar har feta svansar — men som tankeredskap räcker den långt.

**Korrelationen (r) mäter samvariation.** r = +1 betyder att två tillgångar alltid rör sig tillsammans, r = 0 att de är oberoende, r = −1 att de rör sig spegelvända. Talet är hela skillnaden mellan ägande som sprider risk och ägande som bara dubblerar detsamma.

## Portföljteori i siffror — korrelationens effekt

Två tillgångar, båda med förväntad avkastning 8 procent och standardavvikelse 20 procent. Du äger hälften av vardera.

- Korrelation +1: portföljrisken blir exakt 20 procent. Spridningen har inte hjälpt alls — det är samma satsning, delad i två namn.
- Korrelation 0: portföljrisken faller till 20 × √0,5 ≈ 14 procent. Samma förväntade avkastning, cirka 30 procent mindre svängningar — skapad ur rena sammanvägningen.
- Korrelation −1: svängningarna kan till och med ta ut varandra.

Så räknar du fallet med två tillgångar: portföljens varians = v₁²σ₁² + v₂²σ₂² + 2·v₁·v₂·r·σ₁·σ₂, där v är vikterna, σ standardavvikelserna och r korrelationen. Notera vad som inte står i formeln: inget annat än r skiljer de tre fallen ovan. Med tre tillgångar tillkommer korrelationstermer för varje par, och med tjugo innehav är de 190 stycken — det är därför ingen räknar portföljrisk för hand i verkligheten. Men slutsatsen är begriplig ändå: varje tillgångs bidrag till portföljrisken avgörs av dess korrelation med allt annat, viktat med sin storlek. Hela kursen [Korrelation och diversifiering](/kurser/km-014-korrelation-diversifiering) är byggd på den här ena termen.

## Den effektiva fronten — och vad teorin inte säger

Markowitz matematik visar att det för varje risknivå finns en sammansättning som ger högst förväntad avkastning. Mängden av dessa bästa portföljer kallas den effektiva fronten — kurvan som allt tal om "balanserad portfölj" egentligen refererar till.

Men teorin säger inte vilken punkt på fronten du ska välja; det är en fråga om din tålighet för svängningar, inte om matematik. Väljer du en punkt längre ut på fronten köper du mer förväntad avkastning med mer svängningar — det är hela avvägningen, och ingen formel kan göra den åt dig. Och teorin vilar på tre förbehåll som varje nybörjare bör känna till: förväntade avkastningar är uppskattningar (inte kända tal), korrelationer är inte stabila (i kriser söker de sig mot +1, precis när skyddet behövs som mest), och normalfördelningen underskattar extrema dagar. Portföljteori är kartan — inte territoriet.

Ett vardagsexempel med tre tillgångar: 60 procent svenska aktier, 25 procent räntor och 15 procent globala aktier. Räntorna, med låg korrelation till aktierna, drar ned helhetens svängningar; de globala aktierna tillför valutor och konjunkturer som bara delvis samvarierar med Sverige. Poängen är inte exakten — den är riktningen: det är sammansättningen, inte det enskilda innehavet, som bestämmer portföljens riskprofil. Arvtagaren CAPM, som binder samman risk och förväntad avkastning via beta, går vi igenom i [Beta och CAPM](/kurser/km-015-beta-capm).

## Nybörjarens tre lärdomar

- **Räkna på helheten.** En aktie som svänger mycket kan ändå sänka portföljens totala risk — om den inte samvarierar med resten av innehaven.
- **Kontrollera korrelationen, inte antalet.** Tjugo innehav som reagerar på samma nyheter är en enda satsning i förklädnad.
- **Viktningen är en beslutsvariabel.** Hur mycket du äger av varje tillgång väger minst lika tungt som vilka du äger.

## Sammanfattningen

- Portföljteori bedömer risk och avkastning för helheten — aktie för aktie är fel nivå.
- Förväntad avkastning = viktat medel; risk = standardavvikelse; korrelationen avgör om spridning fungerar.
- I exemplet föll risken från 20 till cirka 14 procent — enda skillnaden var korrelationen.
- Teorin är karta, inte territorium: uppskattningar in, förbehåll ut.

Vill du bygga vidare finns spåret redo: [Portfölj-byggande](/kurser/pf-01-portfoljbyggande) tar teorin till beslut, och [Diversifiering](/kurser/pf-03-diversifiering) visar den i praktiken.

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 4. Risk och spridning: så minskar du risken i aktieportföljen

- **Slug:** `risk-och-spridning`  ·  **Fil:** `data/blogg/risk-och-spridning.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** risk och spridning — i H1, ingress och H2
- **Sekundära sökord:** diversifiering, systematisk risk, koncentrationsrisk
- **Pillar:** Grunderna  ·  **Author:** AK1A Research Lab  ·  **Tags:** risk, spridning, diversifiering, koncentrationsrisk, portfölj
- **Title (58 tkn):** Risk och spridning: så minskar du risken i aktieportföljen
- **OG-beskrivning (149 tkn):** Risk och spridning: osystematisk risk går att sprida bort, systematisk inte. Här är mekanismen, korrelationens roll och hur många innehav du behöver.
- **Ord i body:** 820 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

Risk och spridning är aktiesparandets viktigaste par. Mekanismen är enkel att formulera: en del av aktiemarknadens risk går att sprida bort genom att äga många olika bolag — och en del går inte att sprida bort, hur många du än äger. Den första kallas osystematisk risk (bolagsspecifik), den andra systematisk risk (marknadsrisk). Spridning angriper bara den förra. Det är hela idén i en mening — resten av guiden visar varför det stämmer, när spridning är en illusion och hur många innehav som faktiskt behövs.

## Två sorters risk — och bara en går att sprida bort

Osystematisk risk är det som kan gå fel i ett enskilt bolag: en produkt som floppar, en VD som avgår, ett bedrägeri, en förlorad stor kund. Äger du femton bolag och ett av dem går i konkurs är skadan en femtondedel av portföljen — inte allt. Spridning är sitt eget skydd mot den sortens risk, utan kostnad utöver administrationen.

Systematisk risk är det som slår mot allt på en gång: recessioner, räntechocker, kriser. Den går inte att sprida bort, eftersom alla innehav drabbas samtidigt. Historiska nedgångar — 2008, 2020, 2022 — påminner om att korrelationerna söker sig mot +1 när det blåser som mest, exakt när spridningsskyddet behövs som bäst. Det som återstår är tid, tålighet och en portfölj byggd för svängningar man faktiskt står ut med.

Ett sätt att minnas skillnaden: osystematisk risk är ojämn — den drabbar bolag olika — medan systematisk risk är gemensam och drabbar alla på samma gång. Spridning bygger på ojämnheten. När ojämnheten försvinner, som i kriser, försvinner också spridningseffekten — därav det äldsta förbehållet i branschen: spridningen bestäms före krisen, inte under den.

## Risk och spridning i praktiken — hur många bolag räcker?

Den klassiska bilden från empiriska studier av aktieportföljer är tydlig: de första tillskotten gör mest jobbet. Från ett till tio innehav elimineras merparten av den osystematiska risken; från tio till tjugo läggs ytterligare en bit; efter ungefär 25–30 innehav är den ytterligare riskminskningen försumbar, medan arbetsbördan fortsätter växa. Kontrolltalet är alltså inte "så många som möjligt" utan "tillräckligt många som är tillräckligt olika".

Ett hantverksmått för den som vill ha en tumregel: med 20 positioner är ett tak på 10 procent per position ett vanligt sätt att begränsa koncentrationsrisken — pedagogisk hantverksnorm, inte en regel för just din situation. Hur du vrider på tak, sektorer och tillgångsslag byggs i kursen [Portfölj-byggande](/kurser/pf-01-portfoljbyggande).

## Korrelationen avgör om det är spridning

Det är inte antalet innehav utan skillnaden mellan dem som skapar skyddet. Tjugo svenska storbanker är i praktiken en enda satsning på svensk kreditmarknad — vänder räntan eller kreditförlusterna, vänder alla tjugo. Samma antal innehav spridda över banker, mjukvara, hälsovård och förpackade varor är något helt annat.

Räkneexemplet från portföljteorin gör det synligt: två tillgångar med varsin standardavvikelse på 20 procent ger, vid korrelation +1, en portföljstandardavvikelse på exakt 20 procent — ingen spridningseffekt alls. Vid korrelation 0 faller den till cirka 14 procent. Samma siffror, samma vikter — enda skillnaden är hur innehaven samvarierar. Tänk också i tid: bolag som rapporterar olika kvartal, finansieras olika och verkar i olika delar av cykeln slår sällan i takt — det är korrelationens praktiska sida. Matematiken och termen går djupare i [Korrelation och diversifiering](/kurser/km-014-korrelation-diversifiering), och riskmåtten i [Volatilitet och standardavvikelse](/kurser/km-013-volatilitet-standardavvikelse).

## Tre plan för spridning — och deras gränser

- **Över bolag.** 15–25 innehav täcker merparten av den osystematiska risken. Färre bolag kan fungera för den som vill koncentrera — men det är ett aktivt val av högre risk, inte ett mellanting. [Koncentrerad portfölj](/kurser/pf-11-koncentrerad-portfolj) visar avvägningen rakt.
- **Över branscher och länder.** Ett tak per bransch hindrar att "många bolag" i praktiken blir "en bransch". Geografisk spridning tar dessutom med valutarisk och olika konjunkturcykler. Räkneexempel på branschtak: 20 positioner med högst två per bransch ger automatiskt minst tio branscher representerade — och inget enskilt branschbeslut kan väga mer än en tiondel av portföljen. Samma logik baklänges: har du åtta av 20 positioner i samma bransch är det inte 40 procent spridning utan 40 procent koncentration — siffran ser ut som ägande, beteendet är en satsning.
- **Över tillgångsslag.** Aktier, räntor och kontanter reagerar olika på samma nyhet — det är den äldsta formen av korrelationsskydd.

Gränsen: spridning skyddar mot katastrofen i enskilda bolag, inte mot svängningar i marknaden som helhet. En väl spridd portfölj föll 2008 — det var poängen. Skillnaden var att den föll med marknaden, inte på grund av ett enda bolags sammanbrott.

## Sammanfattningen

- Osystematisk risk (enskilda bolag) går att sprida bort; systematisk risk (hela marknaden) går inte.
- De första 10–20 innehaven gör mest; efter 25–30 är ytterligare vinst liten.
- Korrelationen — inte antalet — avgör om ägandet verkligen sprider risk.
- Spridning skyddar mot bolagsspecifik katastrof, inte mot marknadssvängningar.

Vill du gå vidare: [Diversifiering](/kurser/pf-03-diversifiering) och [Koncentrationsrisk](/kurser/rk-09-koncentrationsrisk) täcker ämnets båda sidor, och [Korrelationsrisk](/kurser/rk-10-korrelationsrisk) visar vad som händer när alla mått samtidigt drar åt samma håll.

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 5. Aktieanalys steg för steg: från idé till slutsats

- **Slug:** `aktieanalys-steg-for-steg`  ·  **Fil:** `data/blogg/aktieanalys-steg-for-steg.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** aktieanalys steg för steg — i H1, ingress och H2
- **Sekundära sökord:** fundamentalanalys, nyckeltal, värdering
- **Pillar:** Institutionell metodik  ·  **Author:** AK1A Research Lab  ·  **Tags:** aktieanalys, fundamentalanalys, nyckeltal, metodik, checklista
- **Title (49 tkn):** Aktieanalys steg för steg: från idé till slutsats
- **OG-beskrivning (149 tkn):** Aktieanalys steg för steg: sju steg från affärsidé och bransch till nyckeltal, värdering, risker och en motiverad slutsats — med genomgående exempel.
- **Ord i body:** 817 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

Aktieanalys steg för steg ser i grunden likadan ut oavsett om du är nybörjare eller institution: förstå affären, placera den i sin bransch, läs räkenskaperna, räkna nyckeltalen, värdera, identifiera riskerna — och landa i en motiverad slutsats. Skillnaden mellan ytan och djupet ligger inte i antalet steg utan i hur många av dem som går att hoppa över. Svaret är: inga. Här är arbetsflödet i sju steg, med ett genomgående exempel.

Exemplet är ett förenklat, påhittat bolag — inget verkligt — bara siffror att räkna på: en tillverkare av industriella pumpar med 60 procent av intäkterna från eftermarknaden, alltså reservdelar och service.

## De sju stegen — aktieanalys steg för steg

- **Steg 1.** Affärsmodellen: vad tjänar bolaget pengar på?
- **Steg 2.** Branschen: cyklisk eller strukturellt växande — och vem är jämförelsegruppen?
- **Steg 3.** Årsredovisningen: läsordning och notläsning.
- **Steg 4.** Nyckeltalen: tillväxt, lönsamhet, skuld, likviditet.
- **Steg 5.** Värderingen: multipel mot historia och bransch.
- **Steg 6.** Riskerna: de tre som skulle göra analysen mest fel.
- **Steg 7.** Slutsatsen: tes, siffra, falsifiering — dokumenterad.

## Steg 1–2: affären och branschen

Börja med affären, inte med kursen. Vad säljer bolaget, till vem, och varför återkommer kunderna? Frågan ska gå att besvara i en mening: "Bolaget tjänar pengar på …" — kan du inte fylla i meningen är steg ett inte klart. Det är där en ekonomisk vallgrav syns: återkommande eftermarknadsintäkter (som i exempelbolaget), varumärke, nätverkseffekter eller kostnadsfördelar. Vallgravarna är värda att namnge eftersom de är skillnaden mellan en marginal som håller och en som konkurrensen äter upp — [Varumärke](/kurser/v14-varumarke) och [Nätverkseffekter](/kurser/v15-natverkseffekter) går igenom var och en.

Placera sedan bolaget i sin bransch. En pumpmakare är cyklisk; en programvaruleverantör är det mindre. Branschen definierar vad "normalt" är: normal lönsamhet, normal skuld, normal multipel. Utan den referensramen blir varje nyckeltal en siffra i luften.

## Steg 3–4: årsredovisningen och nyckeltalen

Läs årsredovisningen i ordning: förvaltningsberättelsen (vad lovades förra året — och hölls det?), resultaträkningen, balansräkningen, kassaflödesanalysen och till sist noterna, där detaljerna bor. Hela läsordningen finns i [Så läser du en svensk årsredovisning](/blogg/sa-laser-du-en-svensk-arsredovisning), och kursen [Förvaltningsberättelsen](/kurser/km-002-forvaltningsberattelsen) går på djupet i just det egna resonemanget från bolagsledningen.

Därefter nyckeltalen, i fyra familjer: tillväxt (försäljning, orderstock, ARR), lönsamhet (marginaler, [ROE](/blogg/hur-raknar-man-roe)), skuld (skuldsättningsgrad) och likviditet. Exempelbolaget: nettoresultat 36 Mkr, eget kapital 200 Mkr — ROE blir 36 ÷ 200 = 18 procent. Vinst per aktie 6,00 kronor, kurs 96 kronor — P/E blir 16. Två divisioner, och lönsamheten och värderingen ligger redan på bordet. Så räknar du; tolkningen kommer från jämförelsen med branschkollegorna.

## Steg 5–6: värderingen och riskerna

Värderingen bygger på nyckeltalen: ställ exempelbolagets P/E 16 mot bolagets egen femårshistoria och mot branschmedianen. Sätt tal på läget: historien ligger på 14, branschmedianen på 18 — bolaget handlas under branschen men över sin egen norm. Splittringen tvingar fram en förklaring: en tillfällig vinsttopp (cykeln), en svag orderstock, eller att marknaden missat eftermarknadens andel av intäkterna. Notera vad som händer — frågan "varför avviker multipeln?" är i sig analysens kärna. En kontroll av vad priset förutsätter (vilken tillväxt och marginal måste inträffa för att motivera kursen) binder ihop multipeln med verkligheten.

Riskerna skrivs ner som de tre som skulle göra analysen mest fel: för exempelbolaget kanske kundkoncentration, cykelvändning och [emissionsrisken](/kurser/rk-02-emissionrisk) om balansräkningen är tunn. För varje risk: vad skulle synas i räkenskaperna om den börjar materialiseras? Det är praktisk falsifiering — du bestämmer i förväg vilka observationer som skulle göra tesen fel.

## Steg 7: slutsatsen — tes, siffra, dokumentation

Slutsatsen ska gå att läsa högt i tre meningar: affärsmodellen (återkommande eftermarknadsintäkter), siffran som avgör (ROE och marginalens hållbarhet), risken som kan spränga det hela (cykelvändningen). En dokumenterad tes för exempelbolaget kan lyda: "Eftermarknadsandelen 60 procent ger stabil marginal; ROE 18 procent hållen i fem år; risken är cykelvändningen — den syns i orderstocken innan den syns i resultaten." I AKM1:s metod poängsätts varje variabel 0–5 och totalen motiveras i text — strukturen tvingar fram ett "varför", inte bara ett "vad". Dokumentera alltid: datum, siffror, tes, falsifiering. Om du om ett halvt år undrar varför du trodde som du trodde, ska svaret finnas i din egen text.

Metoden i sin helhet — med alla 20 variablerna och poängsättningen — går vi igenom i [AKM1 — Den Kontroversiella Modellen](/kurser/akm1-den-kontroversiella-modellen).

## Sammanfattningen

- Steg 1–2: förstå affären och vallgraven, definiera jämförelsegruppen.
- Steg 3–4: läs årsredovisningen i ordning, räkna nyckeltal i fyra familjer.
- Steg 5–6: värdera mot historia och bransch, skriv ner de tre största riskerna med falsifiering.
- Steg 7: tre meningar — tes, siffra, risk — och en dokumentation som håller.
- Rutinen är metoden: samma sju steg varje kvartal gör utvecklingen mätbar — en enskild analys åldras, ett återkommande flöde byggs.

Har du en kvart och vill göra en första grov genomgång finns snabbversionen i [Hur gör man en snabb fundamental aktieanalys](/blogg/hur-gor-man-en-snabb-fundamental-aktieanalys), och hela kartan i [den kompletta guiden till svensk aktieanalys](/blogg/komplett-guide-svensk-aktieanalys-2026).

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 6. Nyemission: så fungerar teckningsrätter och utspädning

- **Slug:** `nyemission-sa-fungerar-det`  ·  **Fil:** `data/blogg/nyemission-sa-fungerar-det.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** nyemission — i H1, ingress och H2
- **Sekundära sökord:** teckningsrätter, utspädning, företrädesemission
- **Pillar:** Grunderna  ·  **Author:** AK1A Research Lab  ·  **Tags:** nyemission, teckningsrätter, utspädning, företrädesemission, aktiemarknaden
- **Title (54 tkn):** Nyemission: så fungerar teckningsrätter och utspädning
- **OG-beskrivning (139 tkn):** Vad händer med dina aktier vid en nyemission? Här är mekaniken kring teckningsrätter, företrädesrätt och utspädning — med ett räkneexempel.
- **Ord i body:** 843 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

En nyemission betyder att ett bolag ger ut nya aktier för att ta in kapital. För dig som redan äger aktier innebär det tre saker: du får teckningsrätter, din ägarandel riskerar att spädas ut — och du står inför tre konkreta val. Den här guiden går igenom mekaniken steg för steg, med ett genomräknat exempel där utspädningen syns i svart och vitt.

## Varför bolag gör nyemissioner

Ett bolag emissionerar av tre huvudskäl: att finansiera tillväxt eller förvärv, att stärka balansräkningen — betala ned skuld — eller att täcka ett underskott i kassaflödet. En emission är i sig varken bra eller dålig; budskapet sitter i vad kapitalet ska göra. Kapital som finansierar förvärv med hög avkastning är en annan historia än kapital som täpper ett hål i kassaflödet — och den skillnaden är analysens kärna. Kursen [Emission-risk — utspädning](/kurser/rk-02-emissionrisk) går igenom bedömningen variabel för variabel.

## Tre former: företrädes-, riktad och kontantemission

- **Företrädesemission** är huvudregeln i svenska aktiebolagslagen: befintliga ägare erbjuds först att teckna nya aktier i förhållande till sitt ägande, till ett förhandsbestämt pris — ofta under marknadskursen.
- **Riktad emission** vänder sig till utvalda investerare i stället för till alla ägare. Den är snabbare men kringgår företrädesrätten, kräver stämmobeslut och debatteras därför ofta.
- **Kontantemission** är en emission där betalning ska ske kontant, normalt med företrädesrätt för befintliga ägare.

Gemensamt för alla tre: antalet aktier ökar och varje akties andel av bolaget minskar — mekaniken i nästa sektion.

## Teckningsrätternas mekanik

Vid en företrädesemission får varje befintlig aktie en teckningsrätt. Emissionsvillkoret skrivs som ett förhållande: "1:4 till kurs 60 kronor" betyder att fyra teckningsrätter ger rätt att teckna en ny aktie till 60 kronor. Rättigheterna handlas på börsen under en avgränsad period — de har ett värde, och de har en sista handelsdag innan teckningsstoppet. Två saker att ha koll på: teckningskursen ligger nästan alltid under dagens kurs (annars tecknar ingen), och rättigheter som varken används eller säljs löper ut värdelösa — passivitet har ett pris.

## Nyemission i siffror — utspädningen genomräknad

Du äger 100 aktier i ett bolag som noteras till 100 kronor — värdet 10 000 kronor. Totalt finns 1 000 aktier, du äger 10 procent. Bolaget genomför en företrädesemission 1:4 till teckningskursen 60 kronor — 250 nya aktier på 1 000 befintliga.

Före emissionen: 1 000 aktier × 100 kr = 100 000 kr.
Nytt kapital: 250 × 60 = 15 000 kr.
Efter emissionen: 1 250 aktier som gemensamt representerar 115 000 kr — teoretisk kurs 115 000 ÷ 1 250 = 92 kr.

Kursen "faller" alltså mekaniskt med 8 procent — men du har inte förlorat något. Dina 100 aktier är värda 9 200 kronor och dina 100 teckningsrätter motsvarar 25 × 32 = 800 kronor (den teoretiska rätten per ny aktie: 92 − 60 = 32 kr). Summa: 10 000 kronor — värdet är bara flyttat från aktierna till rättigheterna. Så räknar du, och det är därför kurstrycket i sig inte är samma sak som förlust.

Den teoretiska kursen är en uträkning, inte en prognos. Efter emissionen handlas aktien över eller under 92 kronor efter hur marknaden bedömer vad det nya kapitalet räcker till. Två bolag kan emissionera på identiska villkor och mötas av motsatt reaktion — ett som finansierar en förvärvad tillgång med hög avkastning, ett som täpper ett hål i kassaflödet. Mekaniken är densamma; bedömningen är inte.

Utspädningen av ägarandelen är den andra sidan: tecknar du inte alls sjunker din andel från 100 ÷ 1 000 = 10 procent till 100 ÷ 1 250 = 8 procent. Tecknar du med alla dina rättigheter — 25 nya aktier — behåller du 125 ÷ 1 250 = 10 procent. Det är hela valet i en enda division.

## Dina tre val — teckna, sälja eller låta löpa

- **Teckna:** betala in teckningskursen och behåll din andel av bolaget. Valet förutsätter att du vill behålla exponeringen och har kapital avsatt.
- **Sälja rättigheterna:** realisera deras värde på börsen och acceptera utspädningen. Ditt ägande blir mindre, men du får del av emissionspriset.
- **Låta löpa:** rättigheterna utgår utan värde när perioden slutar. Det är den enda av de tre vägarna som alltid är en ren förlust — därför är "att inte välja" i praktiken också ett val.

Här säger vi det rakt: den här guiden är pedagogik om mekaniken, inte råd om ditt unika läge — valet beror på din skattesituation, din bild av bolagets användning av kapitalet och resten av din portfölj.

## Sammanfattningen

- Nyemission = bolaget tar in kapital genom att ge ut nya aktier; teckningsrätterna är din kompensationsmekanism.
- Efter emissionen faller kursen mekaniskt (i exemplet 100 → 92 kr), men totalvärdet flyttas — det försvinner inte.
- Utspädningen: tecknar du inte sjunker din andel (10 → 8 procent i exemplet); tecknar du behåller du den.
- Rättigheter som varken används eller säljs löper ut värdelösa — kalendern är en del av mekaniken.

Fortsättningsspåret: [Emission-risk — utspädning](/kurser/rk-02-emissionrisk) för bedömningssidan, [Bolagsstämma och rösträtt](/kurser/sj-03-bolagsstamma-och-rostratt) för beslutsprocessen och [Eget kapital och utdelningar](/kurser/km-005-eget-kapital-utdelningar) för hur emissionen syns i balansräkningen.

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 7. Så läser du en kvartalsrapport: siffrorna som styr kursen

- **Slug:** `sa-laser-du-en-kvartalsrapport`  ·  **Fil:** `data/blogg/sa-laser-du-en-kvartalsrapport.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** kvartalsrapport — i H1, ingress och H2
- **Sekundära sökord:** delårsrapport, rörelseresultat, jämförelsestörande poster
- **Pillar:** Institutionell metodik  ·  **Author:** AK1A Research Lab  ·  **Tags:** kvartalsrapport, delårsrapport, rapportanalys, nyckeltal, fundamentalanalys
- **Title (57 tkn):** Så läser du en kvartalsrapport: siffrorna som styr kursen
- **OG-beskrivning (154 tkn):** Kvartalsrapporten kommer fyra gånger om året — och kurserna reagerar inom minuter. Här är läsordningen, marginalräkningen och de två största fallgroparna.
- **Ord i body:** 815 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

En kvartalsrapport — på svenska ofta kallad delårsrapport — visar bolagets intäkter, resultat och kassaflöde för de senaste tre månaderna. Den kommer, för de flesta större svenska listbolag, fyra gånger om året — och eftersom den är det första officiella kvittot på hur verksamheten går reagerar kurserna ofta inom minuter efter publicering. Nyckeln till att läsa den: veta i vilken ordning siffrorna ska läsas — och vad de ska jämföras mot.

Den här guiden ger läsordningen, ett genomräknat exempel på marginalräkningen och de två fallgroparna som fångar flest läsare.

## Vad rapporten innehåller — och vad den inte är

En kvartalsrapport innehåller rörelseintäkter, rörelseresultat, resultat efter skatt, vinst per aktie, kassaflöde, balansräkning med nettoskuld, segmentuppgifter och en kommentar från bolagsledningen. Den är dock ingen årsredovisning i miniatyr: noterna är färre, och revisorernas granskning är översiktlig snarare än fullständig. Det påverkar hur mycket detaljer du kan kräva ut av den — men inte läsordningen.

## Kvartalsrapporten steg för steg — läsordningen

- **Intäkterna först.** Svensk praxis är jämförelse mot samma kvartal förra året (inte föregående kvartal — säsongen ska bort). Skilj på organisk tillväxt och tillväxt som drivits av förvärv eller valutor.
- **Rörelseresultatet och marginalen.** Så räknar du: rörelsemarginal = rörelseresultat ÷ intäkter. Marginalen tål jämförelse mellan kvartalen — den rensar bort storlekseffekten.
- **Kassaflödet.** Ett kvartalsresultat kan prydas av bokföringsmässiga poster; kontantflödet är svårare att sminka. Jämför kassaflödet från löpande verksamhet med rörelseresultatet.
- **Balansräkningen.** Nettoskuld och kapitalstruktur — särskilt i cykliska och skuldsatta bolag.
- **Segmenten.** Var kom tillväxten ifrån? Ett segment som bär och tre som släpar är en annan historia än jämn tillväxt.
- **Ledningens kommentar och framtidsuttalanden.** Jämför med förra kvartalets utsagor — det är den snabbaste läsningen av om utsikterna håller eller justeras ned.
- **Jämförelsestörande poster.** Engångsposter som avyttringar och omstruktureringar — kontrollera alltid hur stor del av resultatet som är justerat.

Hela strukturen finns som kurs i [Kvartalsrapporten](/kurser/km-006-kvartalsrapporten), med facitövningar på varje steg.

## Ett exempel: från intäkt till marginal

Ett exempelbolag redovisar intäkter på 1 000 Mkr mot 940 Mkr samma kvartal förra året — tillväxten 60 ÷ 940 = 6,4 procent. Rörelseresultatet landar på 147 Mkr mot 131 Mkr. Marginalen: 147 ÷ 1 000 = 14,7 procent mot förra årets 131 ÷ 940 = 13,9 — marginalen har alltså utvidgats med 0,8 procentenheter.

Det är de två raderna — tillväxt och marginalutveckling — som tillsammans säger om affären förbättras eller bara växer. Till det: vinst per aktie 1,20 kronor och kassaflöde från löpande verksamhet på 120 Mkr, vilket ger träffkvoten 120 ÷ 147 ≈ 0,8. En träffkvot under ett är i sig inte fel — växande bolag bygger upp kundfordringar — men den är en notläsningsväckare: följer kassaflödet resultatet över tid? Balansräkningen kompletterar: nettoskuld 310 Mkr mot rörelseresultatet före avskrivningar (EBITDA) 210 Mkr ger nettoskuld/EBITDA ≈ 1,5 — ett mått som är stabilt kvartal till kvartal och avslöjar om balansräkningen byggs eller rivs medan resultatet växer. Så räknar du, och kassaflödessidan fördjupas i [Kassaflödesanalysen](/kurser/km-003-kassaflodesanalysen).

## Fallgrop 1: jämförelsestörande poster

Bolag redovisar ofta både rapporterat och "justerat" resultat — det senare rensat för engångsposter. Justeringar kan vara motiverade (en avyttring återkommer inte), men de kan också bli en vana som flyttar måttbandet varje kvartal. Kontrollen: läs hur stor del av resultathöjningen som kommer från justeringar, och jämför bolagets justerade resultat med det redovisade över fyra kvartal. Kurserna reagerar ofta mer på det justerade — din uppgift är att veta vilket du tittar på. Noterna är hemmaplan för den som vill vidare: [Noter — den dolda informationen](/kurser/km-004-noter).

## Fallgrop 2: ett kvartal är inte en trend

Ett kvartal kan vara säsong, valutatiming eller en enskild stor affär. Kontrollen: rulla fyra kvartal bakåt och läs trenderna på rullande tolvmånadersbasis innan du skriver om en bolagsbild. Ett praktiskt hantverk: för över tolv månaders intäkter och resultat i en enkel tabell varje kvartal — nästa rapport tillför en rad och stryker den äldsta, och trenden du ser är alltid rullande, aldrig färgad av en enskild säsong eller engångspost. Och kom ihåg vad kursen reagerar på: överraskningen mot förväntningarna — inte siffran i sig. Ett bra kvartal kan sänka kursen om marknaden räknat med bättre; ett svagt kan höja den om farhågorna var värre. Därför har rapportläsning två lager: vad bolaget presterade, och vad som redan var prissatt.

## Sammanfattningen

- Läs i ordning: intäkter, marginal, kassaflöde, balansräkning, segment, ledningens kommentar, engångsposter.
- Jämför alltid med samma kvartal förra året; räkna marginalen själv.
- Kontrollera hur stor del av resultatet som är "justerat" — och om justeringarna återkommer.
- Kursen reagerar på överraskningen mot förväntningarna; ett kvartal är en datapunkt, inte en trend.
- Rutinen gör skillnad: samma läsordning varje kvartal gör trenden synlig — engångsläsningar åldras, återkommande blir kunskap.

Nästa steg: [Så läser du en svensk årsredovisning](/blogg/sa-laser-du-en-svensk-arsredovisning) tar dig till helåret, och [balansräkningen på 15 minuter](/blogg/sa-laser-du-en-balansrakning-pa-15-minuter) tränar just den del som kvartalsrapporten bara skimrar.

_Detta är pedagogisk finansanalys, inte investeringsråd._

---

## 8. Jämförelseindex och relativ styrka — slå börsen eller inte

- **Slug:** `jamforelseindex-relativ-styrka`  ·  **Fil:** `data/blogg/jamforelseindex-relativ-styrka.json`  ·  **Status:** UTKAST v1 (2026-09-09)
- **Primärt sökord:** jämförelseindex — i H1, ingress och H2
- **Sekundära sökord:** relativ styrka, benchmark, OMX Stockholm
- **Pillar:** Institutionell metodik  ·  **Author:** AK1A Research Lab  ·  **Tags:** jämförelseindex, relativ styrka, teknisk analys, benchmark, OMX
- **Title (58 tkn):** Jämförelseindex och relativ styrka — slå börsen eller inte
- **OG-beskrivning (154 tkn):** Jämförelseindex visar om en aktie utvecklas bättre eller sämre än börsen. Så räknar du relativ styrka, läser RS-linjen — och var verktyget slutar fungera.
- **Ord i body:** 810 (mål 800–1400)  ·  **readingMinutes:** 1

### Innehåll (body, ordagrant som i JSON-filen)

Ett jämförelseindex är måttstocken du ställer en akties kursutveckling mot — i Sverige oftast OMX Stockholm All-Share (OMXSPI) eller OMX Stockholm 30. Mätningen kallas relativ styrka: dela aktiens kurs med börsindexet och du får en linje som stiger när aktien utvecklas bättre än börsen och faller när den halkar efter. En aktie kan stiga åtta procent och ändå ha tappat mark — om börsen steg tolv. Jämförelseindex är verktyget som ser det.

Så fungerar mätningen, från beräkningen till de tre mönster som brukar läsas ut ur linjen — och var verktyget slutar fungera.

## Vad ett jämförelseindex är

Ett index representerar "marknaden": OMX Stockholm All-Share samlar i princip alla svenska listade bolag, OMXS30 de trettio största på Stockholmsbörsen. Absolut avkastning säger bara hur det gick för aktien; relativ avkastning säger om det gick bättre än alternativet — att äga hela börsen via ett index. Därför är jämförelseindex grundläggande i såväl den tekniska analysen som i förvaltarnas värld: mätstocken definierar vad "bra" betyder. Jämförelsen har också en tidsdimension: ett halvårs underprestation är brus, fem års är en struktur — och RS-linjen är sättet att skilja dem åt, något ögat inte klarar i två separata kurvor. Den som vill väga avkastning mot risk gör samma övning med [Sharpe-kvoten](/kurser/km-016-sharpe-kvot).

## Så räknar du jämförelseindex — relativ styrka

RS-linjen är aktiekursen delat med jämförelseindexet, normaliserat till en gemensam startpunkt.

Dag ett: aktien noteras till 100 och indexet till 1 000 — RS-linjen startar på 100 ÷ 1 000 = 0,100.
Ett år senare: aktien står i 108 och indexet i 1 120 — RS = 108 ÷ 1 120 = 0,096.

Linjen har fallit trots att aktien stigit åtta procent. Börsen steg tolv procent, och aktien har underpresterat med fyra procentenheter. Så räknar du — och ritar du divisionen som diagram har du exakt den kurva som tekniska analytiker kallar RS-linjan eller jämförelseindex-kurvan. I den svenska tekniska analysens standardverk är jämförelseindexet en av hörnstenarna; [Teknisk analys med Johnny Torssell](/kurser/teknisk-analys-med-johnny-torssell) bygger hela kapitel på den.

## Tre mönster i RS-linjen

- **Stigande RS.** Aktien bär mer än marknaden — en ledare i uppgången. Mönstret säger i sig inget om orsaken (bättre resultat, sektorsvind eller sentiment), bara att kapitalet hittat den.
- **Fallande RS.** Aktien halkar efter börsen — ibland till och med i en stigande marknad. En aktie som inte orkar med i uppgången är ofta svagare ännu i nedgången; det är observationen bakom tesen "den starka blir starkare".
- **RS-utbrott.** När linjen bryter ur en etablerad nedåt- eller sidledestrend läses det som ett skifte i styrkebalansen. Bekräftelse söks i volymen — ett utbrott utan omsättning är ett svagare material: [Volymanalys](/kurser/ts-08-volymanalys) och [Volume Spread Analysis](/kurser/ts-23-volume-spread-analysis-vsa) täcker verktyget.

Ibland ligger ledarskapet inte i enskilda aktier utan i hela sektorer eller marknader mot varandra — aktier mot räntor, råvaror mot aktier. Det spåret heter [Intermarket Analysis](/kurser/intermarket-analysis) och är jämförelseindex-tanken i större format. Kombinationen som ofta lyfts fram: en aktie med stigande RS i en sektor vars egen RS-linje också stiger har två bevis — den klassiska observationen "ledare i ledande sektor".

## Tre misstag när man mäter

- **Fel index.** En svensk mellanstor aktie mätt mot OMXS30 (bara storbolag) säger mer om storleksskillnad än om styrka. Välj jämförelseindex som matchar bolagets hemmamarknad och börskategori.
- **Prisindex i stället för totalavkastningsindex.** Ett prisindex räknar bort utdelningarna. För utdelningsbolag kan RS-linjan falla i åratal medan den totala avkastningen ligger jäms med börsen — kontrollera vilket index din kurva bygger på.
- **Startpunktseffekten.** RS-linjens utseende beror på var den startas: mätt från en botten ser tre års utveckling stark ut, mätt från en topp svag. Använd långa fönster, eller flera fönster vid sidan av varandra, innan du kallar något en trend.

## Verktygets gränser — indexet säger inget om värde

RS-linjen mäter momentum, inte pris mot fundamental värde. En aktie kan överprestera börsen i åratal och bli dyrare för varje dag — linjen är glad ändå. Om analysen bygger på nyckeltal och kassaflöden måste den dras parallellt med RS-bilden, inte ersättas av den; i AK1A:s metodik hålls den fundamentala sidan och prismönstret isär medvetet.

Två praktiska förbehåll till: fönsterval — tre månaders RS berättar en annan historia än tre års, så välj fönster efter din tidshorisont — och indexval — mät svenska aktier mot svenskt index, globala mot globalt, annars blandar du in valuta- och marknadsskillnader i det du trodde var en styrkemätning.

## Sammanfattningen

- Jämförelseindex = aktiens kurs ÷ börsindexet; linjen stiger när aktien utvecklas bättre än börsen.
- I exemplet: +8 procent för aktien, +12 för börsen — underprestation med fyra punkter, synlig bara i RS-linjan.
- Tre mönster: stigande (ledare), fallande (eftersläpare), utbrott (skifte i styrkebalansen — volymen bekräftar).
- RS mäter momentum — inte värde, inte risk; den fundamentala analysen dras bredvid, inte bort.

Vill du fortsätta på prissidan: [Intermarket Analysis](/kurser/intermarket-analysis) vidgar mätstocken, och [Sharpe-kvoten](/kurser/km-016-sharpe-kvot) lägger risken i nämnaren.

_Detta är pedagogisk finansanalys, inte investeringsråd._

---
