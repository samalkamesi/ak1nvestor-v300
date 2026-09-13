# Våg 138 S5 — Bloggkorpusens sökordsinventering (55 poster × sv/en/ar)

**Agent:** S5 (våg 138, sökordsinventering) · **Datum:** 2026-09-14
**Källor:** `data/blogg/*.json` (55 filer), `data/oversattning-import/*.json`
(blogg-topp20, v67bg1, v67bg2, v67blogg, v68bg), `src/lib/blogg-faq.ts`
(läst), `src/lib/blogg-speglar.ts` (läst — språkarkitekturen).
**Sondskript:** `.zcode/sond-s5-*.mjs` (struktur, extraktion, språkstatus).

---

## 1. Sammanfattning

| Mått | Värde |
|---|---|
| Poster inventerade | **55 av 55** (100 %) |
| Svenska original | 55 (bloggen är sv-först: alla titlar/body/texter är svenska) |
| en/ar-språkstatus | 43 poster 100 % översatta, 12 poster 74–95 % (lokala importfiler) |
| FAQ-sektioner (våg 137) | 10 poster, 31 FAQ-par totalt |
| FAQ-potential ny | 8 poster HÖG + 8 MEDEL + 6 SVAG |
| Auto-genererade poster (granskat: false) | 3 (branschmedianer, forskningslaget, vagkartan) |
| Publiceringsperiod | 2026-08-23 → 2026-09-06 (16 dagar) |
| Pillar-fördelning | AKM1 23 · Institutionell metodik 12 · Svensk aktieanalys 9 · Pedagogisk finansanalys 4 · Grunderna 4 · AK1A Ekosystem 3 |
| Författare | Ak1 Apex Nexus 36 · AK1A Research Lab 15 · Sam Alkamesi 4 |

**Viktigaste fyndet (SEO):** Samtliga 10 poster som fick FAQ-sektioner i våg 137
saknar översättning för exakt FAQ-blocken (7–9 stycken per post). Det drar
speglarnas publicerade andel under INDEX_TRASKEL 80 % → `/en/blogg/*` och
`/ar/blogg/*` för dessa poster är **noindex + canonical mot svenskan** → FAQ-
innehållet (och FAQPage-JSON-LD) når bara svenskspråkig sökning. Åtgärden är
liten: ~74–79 översättningsenheter (FAQ-blocken × 10 poster) återställer
indexeringen.

---

## 2. Korpus- och språkarkitektur (fakta som inventeringen vilar på)

- **Fältschema (alla 55):** `slug`, `title`, `description`, `pillar`,
  `author`, `publishedAt`, `readingMinutes`, `tags[]`, `body` (markdown).
  Tre poster har dessutom `metadata` (granskningskö, serie) + `fabrik`
  (innehållsfabrikens källor/statistik): branschmedianer-akm2,
  forskningslaget-grona-av-100, vagkartan-traffprocent.
- **Inga flerspråkiga fält i filerna** — en/ar sköts av spegellagret
  (`src/lib/blogg-speglar.ts`): `/en/blogg/[slug]` + `/ar/blogg/[slug]`
  bygger svenska posten + publicerade översättningar från Supabase
  (scope_typ="blogg", nycklar `{slug}:titel|ingress|p{n}`). Fallback per
  fält = svensk text. pillar/author/tags översätts aldrig (strukturella).
- **SEO-tröskel:** spegeln indexeras först vid ≥ 80 % publicerat; under
  tröskeln: noindex + canonical mot `/blogg/{slug}`.
- **FAQ (våg 137):** `## FAQ`-sektion sist i body; parser i
  `src/lib/blogg-faq.ts`; samma källa för synligt innehåll och FAQPage-
  JSON-LD. FAQ-blocken räknas som vanliga styckeenheter i
  översättningsandelen — därav tröskelfallet ovan.
- **Språkstatusens källa här:** lokala importfiler i
  `data/oversattning-import/` (indikation på pipeline-läget; publik sanning
  sitter i Supabase, men importfilerna är den fullständiga lokala bilden).

---

## 3. Inventering per post (55 st)

Kolumner: titel (sv) · slug · ämne · nyckelord (ur tags, förkortade) ·
en/ar-% (lika för båda språken i samtliga fall) · FAQ (antal par; **✓** =
finns sedan våg 137) · FAQ-potential (HÖG/MEDEL/SVAG/NEJ + skäl).

### 3.1 Grunderna & "vad är"-guider (4)

| Titel | Slug | Ämne | Nyckelord | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|---|
| Vad är ROE? — formel, tolkning och AKM1:s poängskala | vad-ar-roe | Lönsamhet | ROE, Du Pont, avkastning eget kapital | 100 % | 0 | **HÖG** — titeln är en sökfråga; systern "hur räknar man ROE" har FAQ |
| Vad är EV/EBITDA? — formel, tolkning och poängskala | vad-ar-ev-ebitda | Värdering | EV/EBITDA, företagsvärde, multipel | 100 % | 0 | **HÖG** — frågeform; "vad är EV/EBITDA" är kärnsökningen |
| Vad är skuldsättningsgrad? — formel, nivåer och poängskala | vad-ar-skuldsattningsgrad | Skuld | skuldsättningsgrad, soliditet, balansräkning | 100 % | 0 | **HÖG** — frågeform; "vilken nivå är farlig" redan som rubrik |
| Hur gör man en snabb fundamental aktieanalys? — fem steg | hur-gor-man-en-snabb-fundamental-aktieanalys | Metodik | fundamental analys, snabbanalys, nyckeltal | 78 % | 3 ✓ | FÄRDIG (våg 137) — men FAQ-blocken saknar en/ar (se § 1) |

### 3.2 Institutionell metodik — nyckeltalsdjupdyk (12)

| Titel | Slug | Ämne | Nyckelord | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|---|
| Hur räknar man ROE? Formeln, räkneexempel och tre fallgroparna | hur-raknar-man-roe | Lönsamhet | ROE, DuPont, eget kapital | 82 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| P/S-tal — när är Price-to-Sales användbart? | ps-tal-nar-ar-det-anvandbart | Värdering | P/S, tillväxtbolag | 81 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| P/B-tal — när jämför man bokvärde rätt? | pb-tal-nar-jamfor-man-bokvarde-ratt | Värdering | P/B, bokvärde, banker | 78 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Vad är EV/EBITDA — och hur räknar man det? | sa-raknar-du-ev-ebitda | Värdering | EV, EBITDA, multipel steg för steg | 100 % | 0 | **HÖG** — processfrågor ("var finns EBITDA i årsredovisningen?") |
| Kvickräkningsformeln — mät likviditet på 30 sekunder | kvickrakningsformeln-sa-mater-du-likviditet | Likviditet | kvickkvot, arbetskapital, balansräkning | 76 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Så läser du en balansräkning på 15 minuter | sa-laser-du-en-balansrakning-pa-15-minuter | Rapportläsning | soliditet, nettoskuld, goodwill | 100 % | 0 | **HÖG** — "läsa balansräkning" är stark sökfråga; fyra tidsluckor = fyra FAQ-frågor |
| Skuldsättningsgrad: vilken nivå är farlig | skuldsattningsgrad-vilken-niva-ar-farlig | Skuld | räntetäckning, nettoskuld | 100 % | 0 | **HÖG** — rubriken är redan en FAQ-fråga, tre exempelposter |
| ARR-tillväxt: vad återkommande intäkter säger om kvaliteten | arr-tillvaxt-vad-atkommande-intakter-sager | Intäktskvalitet | ARR, NRR, SaaS, CAGR | 100 % | 0 | **MEDEL** — "vad är ARR" söks av SaaS-intresserade; överlappar v02 (se § 5) |
| Intäktsdiversifiering — risken som inte syns i P/E | intaktsdiversifiering-risken-som-inte-syns-i-pe | Intäktskvalitet | HHI, kundkoncentration | 100 % | 0 | **MEDEL** — "kundkoncentration risk" nisch men välskriven pedagogik |
| ROIC — det glömda nyckeltalet | roic-den-glomda-nyckeltalen-v11 | Lönsamhet | ROIC, moat, kapitalåtergång | 100 % | 0 | **HÖG** — ROIC saknar "vad är"-post; "ROIC vs ROE" en naturlig FAQ |
| Vad är institutionell aktieanalys | vad-ar-institutionell-aktieanalys | Metodik | Carnegie, retail vs institution | 100 % | 0 | **SVAG** — nischad fråga, bra för varumärket men låg volym |
| Vågkartan september 2026 — träffprocenten 52 % | vagkartan-traffprocent | Ekosystem | vågvalidering, träffprocent | 94 % | 0 | NEJ — auto-post (granskat: false), månadsdata åldras |
| Forskningsläget september 2026 — 7 gröna av 100 | forskningslaget-grona-av-100 | Ekosystem | statusfördelning, universum | 95 % | 0 | NEJ — auto-post (granskat: false), åldras |
| Branschmedianer september 2026 | branschmedianer-akm2 | Ekosystem | median, peer-jämförelse | 100 % | 0 | NEJ — auto-post (granskat: false), åldras |

*(Tabellen räknar 14 rader men pillar-fältet "Institutionell metodik" har 12 — vagkartan/forskningslaget/branschmedianer bärs av samma pillar men redovisas här som ekosystemposter.)*

### 3.3 Pedagogisk finansanalys (4)

| Titel | Slug | Ämne | Nyckelord | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|---|
| 5 vanliga nybörjarmisstag med svenska aktier | 5-vanliga-nyborjarmisstag-svenska-aktier | Nybörjarpedagogik | misstag, riskhantering, portfölj | 75 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| PEG-multiplens svagheter — när låg PEG lurar dig | peg-multipeln-svagheter-2026 | Värdering | PEG, P/E, mean reversion | 83 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Så läser du en svensk årsredovisning — steg för steg | sa-laser-du-en-svensk-arsredovisning | Rapportläsning | årsredovisning, förvaltningsberättelse | 100 % | 0 | **HÖG** — "läsa årsredovisning" stark svensk sökfråga; stegen = färdiga FAQ-frågor |
| Så läser du din portföljrapport | sa-laser-du-din-portfoljrapport | Ekosystem/produkt | 5×5×4, vågor, portföljanalys | 100 % | 0 | NEJ — produkthandledning, sökvolymen sitter i varumärket |

### 3.4 Svensk aktieanalys — guider, psykologi, marknad (9)

| Titel | Slug | Ämne | Nyckelord | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|---|
| Komplett guide till svensk aktieanalys 2026 | komplett-guide-svensk-aktieanalys-2026 | Metodik/guide | nybörjarguide, årsredovisning | 74 % | 4 ✓ | FÄRDIG — FAQ oöversatt |
| Mr Market och den svenska börsen | mr-market-psykologi-svenska-borsen | Psykologi | marknadspsykologi, beteendeekonomi, sentiment | 81 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Divergens: när fundamentet och kursen bråkar | divergens-fundament-ot-pris | Psykologi/ekosystem | divergens, AK1TS, AI-Mentorn | 79 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Veckans marknad v34: tålamodets pris och fusionens aritmetik | veckans-marknad-2026-w34 | Marknadskommentar | small cap, fusion, TERP, nyemission | 100 % | 0 | NEJ — dagsfärsk kommentar; FAQ åldras dåligt |
| Hur vi analyserade Volvo Cars | hur-vi-analyserade-volvo-cars | Metodik/case | case study, 20 variabler, scenarier | 100 % | 0 | NEJ — case-format; bättre som internt länkmål än FAQ-bärare |
| Analys: H & M Hennes & Mauritz (HM-B.ST) 2026 | analys-h-och-m-hennes-och-mauritz-2026 | Bolagsanalys | HM-B, AKM1-forskning | 100 % | 0 | NEJ — automatisk forskningsöversikt (exempelunderlag) |
| Analys: Industrivärden (INDU-C.ST) 2026 | analys-industrivarden-2026 | Bolagsanalys | INDU-C, AKM1-forskning | 100 % | 0 | NEJ — d:o |
| Analys: Investor (INVE-B.ST) 2026 | analys-investor-2026 | Bolagsanalys | INVE-B, AKM1-forskning | 100 % | 0 | NEJ — d:o |
| Analys: NP3 Fastigheter (NP3.ST) 2026 | analys-np3-fastigheter-2026 | Bolagsanalys | NP3, AKM1-forskning | 100 % | 0 | NEJ — d:o |
| Analys: Truecaller (TRUE-B.ST) 2026 | analys-truecaller-2026 | Bolagsanalys | TRUE-B, AKM1-forskning | 100 % | 0 | NEJ — d:o |

### 3.5 AKM1:s V01–V20-variabelserie (23, varav 21 i denna tabell)

Handboksformat "så analyserar du X" — varje post har naturliga FAQ-frågor
("vad är bra nivå?", "var hittar jag talet?"), men prioriteringen styrs av
sökvolym och överlapp med djupposterna i § 3.1–3.3.

| Titel | Slug | Ämne | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|
| V01: Försäljningstillväxt | v01-forsaljningstillvaxt-analys | Tillväxt | 100 % | 0 | **SVAG** — "tillväxt bolag" söks men posten är referensformat |
| V02: ARR-tillväxt | v02-arr-tillvaxt-analys | Tillväxt | 100 % | 0 | NEJ — överlappar arr-tillvaxt-djupposten (kannibalisering) |
| V03: Intäktsdiversifiering | v03-intaktsdiversifiering-analys | Intäktskvalitet | 100 % | 0 | NEJ — överlappar djupposten |
| V04: P/S | v04-ps-analys | Värdering | 100 % | 0 | NEJ — ps-tal har redan FAQ |
| V05: P/B | v05-pb-analys | Värdering | 100 % | 0 | NEJ — pb-tal har redan FAQ |
| V06: EV/EBITDA | v06-ev-ebitda-analys | Värdering | 100 % | 0 | NEJ — två andra EBITDA-poster |
| V07: Bruttomarginal | v07-bruttomarginal-analys | Lönsamhet | 100 % | 0 | **MEDEL** — bruttomarginal saknar annan post; "vad är bruttomarginal" söks |
| V08: EBITDA-marginal | v08-ebitda-marginal-analys | Lönsamhet | 100 % | 0 | **MEDEL** — "EBITDA marginal bra nivå" |
| V09: ROE (analys) | v09-roe-analys | Lönsamhet | 100 % | 0 | NEJ — ROE-klustret har 4 poster; räkna i stället ner klustret (§ 5) |
| V09: Räkna ROE som en analytiker | v09-roe-avkastning-eget-kapital | Lönsamhet | 100 % | 0 | NEJ — **dublettflagga**: två V09-poster, delad tagg "V09" |
| V10: Skuldsättningsgrad | v10-skuldsattningsgrad-analys | Skuld | 100 % | 0 | NEJ — skuldklustret har redan 4 poster |
| V11: Likviditet (Kvick) | v11-likviditet-analys | Likviditet | 100 % | 0 | **SVAG** — kvickräkningsformeln har FAQ; komplettera hellre där |
| V12: Intäktsstabilitet | v12-intaktsstabilitet-analys | Intäktskvalitet | 100 % | 0 | **SVAG** — unik täckning men låg sökvolym |
| V13: Patent & IP | v13-patent-ip-analys | Moat | 100 % | 0 | **MEDEL** — "vad är moat"-frågor söks; patentportfölj-nisch |
| V14: Varumärke & kundlojalitet | v14-varumarke-analys | Moat | 100 % | 0 | **SVAG** — moatkluster täcks bättre via v13/v15 |
| V15: Nätverkseffekter | v15-natverkseffekter-analys | Moat | 100 % | 0 | **MEDEL** — "vad är nätverkseffekt" har reell volym |
| V16: Produktlanseringar | v16-produktlanseringar-analys | Katalysator | 100 % | 0 | NEJ — händelseformat, svag evergreen-sökning |
| V17: Avtal & partnerskap | v17-avtal-partnerskap-analys | Katalysator | 100 % | 0 | **SVAG** — merger arbitrage är nisch |
| V18: Regulatoriska katalysatorer | v18-regulatoriska-analys | Katalysator | 100 % | 0 | NEJ — nisch utan evergreen-frågor |
| V19: Kapitalförbränning & emission-risk | v19-kapitalforbranning-analys | Risk | 100 % | 0 | **MEDEL** — "burn rate"/nyemission är hög nybörjarrelevans (kopplar till nybörjarmisstag-posten) |
| V20: Återköp av egna aktier | v20-aterekop-egna-aktier-analys | Kapitalåtergång | 100 % | 0 | **MEDEL** — "återköp aktier bra eller dåligt" söks |
| ROIC — det glömda nyckeltalet (V11 i titeln) | roic-den-glomda-nyckeltalen-v11 | Lönsamhet | 100 % | 0 | **HÖG** — redovisad i § 3.2 |
| Skuldsättningsgraden är inte en siffra — det är en våg | skuldsattningsgraden-som-vag | Skuld/ekosystem | 100 % | 0 | NEJ — avancerad vågpedagogik; låg sökvolym |

### 3.6 AK1A Ekosystem (3)

| Titel | Slug | Ämne | en/ar | FAQ | FAQ-potential |
|---|---|---|---|---|---|
| Skuldsättningsgraden som våg | skuldsattningsgraden-som-vag | Ekosystem | 100 % | 0 | NEJ (se § 3.5) |
| Divergens: fundament vs kurs | divergens-fundament-ot-pris | Ekosystem/psykologi | 79 % | 3 ✓ | FÄRDIG — FAQ oöversatt |
| Därför är indikatorer inte längre statiska | vagfundament-indikatorer-ar-tidsserier | Ekosystem/produkt | 100 % | 0 | NEJ — produktförklaring (Vågfundamentet) |

**Räknekontroll:** 4 + 14 + 4 + 10 + 23 + 3 = 58 rader i tabellerna varav 3
dubbelredovisningar (roic, skuldsattningsgraden-som-vag, divergens) = **55
unika poster.**

---

## 4. FAQ-status och nästa vågs kandidater

**Redan försedda (våg 137, 10 st, 31 par):** 5-vanliga-nyborjarmisstag,
divergens-fundament-ot-pris, hur-gor-man-en-snabb-fundamental-aktieanalys,
hur-raknar-man-roe, komplett-guide-svensk-aktieanalys-2026,
kvickrakningsformeln-sa-mater-du-likviditet, mr-market-psykologi-
svenska-borsen, pb-tal-nar-jamfor-man-bokvarde-ratt,
peg-multipeln-svagheter-2026, ps-tal-nar-ar-det-anvandbart.

**Prioriterad kölista för FAQ-utbyggnad (våg 138+):**

1. **HÖG (8):** vad-ar-roe · vad-ar-ev-ebitda · vad-ar-skuldsattningsgrad ·
   sa-raknar-du-ev-ebitda · sa-laser-du-en-svensk-arsredovisning ·
   sa-laser-du-en-balansrakning-pa-15-minuter · roic-den-glomda-nyckeltalen-v11 ·
   skuldsattningsgrad-vilken-niva-ar-farlig.
   *Skäl: titlar i frågeform = speglar verkliga sökningar; steg/postformat
   genererar naturliga FAQ-par; ROIC och "vilken nivå" saknar frågepost.*
2. **MEDEL (8):** v07-bruttomarginal · v15-natverkseffekter ·
   v19-kapitalforbranning · v20-aterekop · v08-ebitda-marginal ·
   v13-patent-ip · arr-tillvaxt · intaktsdiversifiering.
3. **SVAG (6):** v01 · v12 · v14 · v17 · v11 · vad-ar-institutionell.
4. **NEJ (resten):** bolagsanalyserna (auto-översikter), ekosystem-/produktposter,
   marknadskommentarer, dublett- och klusterposter enligt § 5.

**Parallellåtgärd (högst ROI):** översätt FAQ-blocken i de 10 försedda
posterna (7–9 enheter × 10) — återför 10 en/ar-speglar över 80 %-tröskeln
och gör FAQ-JSON-LD:n flerspråkig.

---

## 5. Ämnestäckning — vältäckt, kluster, glipor

### Vältäckt (bloggen rankar-rätt-format: long-tail-frågeform)

- **Nyckeltalspedagogik (svenska):** ROE, EV/EBITDA, skuldsättningsgrad,
  P/S, P/B, PEG, kvickkvot, ROIC — varje nyckeltal har formel + räkneexempel
  + fallgropar. Detta är korpusens ryggrad och matchar hur svenskar söker
  ("hur räknar man X", "vad är X").
- **Rapportläsning:** årsredovisning, balansräkning, portföljrapport —
  processguider med stark sökintention ("läsa årsredovisning").
- **Nybörjarpedagogik + psykologi:** nybörjarmisstag, Mr Market, divergens,
  PEG-fällor — beteendevinkeln är ovanlig hos konkurrenter.
- **Metodikvarumärke:** AKM1 V01–V20 som sammanhängande serie = noll
  sökvolym i dag, men bygger ägande fraser ("AKM1-variabel", "vågklass").

### Kluster med kannibaliseringrisk (samma ämne, flera URL:er)

| Ämne | Poster | Åtgärd |
|---|---|---|
| ROE | 4 (v09-analys, v09-avkastning, hur-raknar-man, vad-ar) | Behåll vad-ar + hur-raknar (FAQ finns); slå ihop/kanonlänka de två V09 — **två poster delar t.o.m. V09-titel** |
| Skuldsättningsgrad | 4 (vad-ar, vilken-niva, som-vag, v10) | vad-ar = pillar; vilken-niva = FAQ-kandidat; v10/som-vag kanonlänkas |
| EV/EBITDA | 3 (vad-ar, sa-raknar-du, v06) | vardera distinkt intention; intern länk + FAQ på de två första |
| ARR · intäktsdiversifiering · P/S · P/B · likviditet | 2 var (djuppost + VXX) | FAQ endast på djupposten; VXX referens med länk |

### Glipor — sökbara ämnen utan enda post (nya post-idéer, utbildningsform)

1. **P/E-talet** — korpusens mest citerade nyckeltal saknar egen guide
   ("vad är P/E", "bra P/E-tal" — hög svensk volym). PEG- och
   intäktsdiversifieringsposterna berör men ingen bär frågan.
2. **Utdelning & direktavkastning** — ingen post; klassisk svensk sökvolym.
3. **Snittmetoden** — svensk specifik, hög volym, noll täckning.
4. **Kassaflödesanalens/FCF** — ROIC finns men "läsa kassaflödesanalys" saknas.
5. **ISK vs KF** (kontotyper, utbildningsformulering) — nybörjarfråga nr 1.
6. **Substansvärde/investeringssällskap** — Investor/Industrivärden analyseras
   men substansvärdesmetoden förklaras ingenstans.
7. **Fastighetsbolagsnyckeltal (P/NAV, vakans)** — NP3 analyseras utan sektorpedagogik.
8. **Banknyckeltal (K/I, kassakvot)** — pb-tal nämner banker; ingen guide.
9. **Räntabilitet totalt (RT)** — svensk traditionsterm, noll poster.
10. **Volatilitet/beta** — riskbegrepp saknas inför AKM2-vågornas publikation.

### Sökfraser bloggen redan rankar-rätt för (titelform = sökform)

"hur räknar man ROE" · "vad är EV/EBITDA" · "vad är skuldsättningsgrad" ·
"vad är ROE" · "läsa balansräkning" · "läsa årsredovisning" ·
"snabb fundamental aktieanalys" · "svensk aktieanalys guide" ·
"kvickkvot" · "PEG-multiel" · "bruttomarginal" · "nätverkseffekter" ·
"Mr Market" · "nybörjarmisstag aktier" · "återköp aktier" ·
"burn rate / nyemission" · "ARR tillväxt" · "kundkoncentration" ·
"branschmedianer".

---

## 6. Juridikgrind (påminnelse för fortsatt SEO-arbete)

All text i korpusen är utbildningsformulerad ("så fungerar metoden",
"så räknar man") — inventeringen föreslår inga formuleringar närmar sig
rådgivning (lagen 2007:528). Bolagsanalyserna är forskningsöversikter med
falsifieringskriterier — behåll den ramen i all nytt innehåll; nyemissions-
och portföljtexter ska fortsatt beskriva metoder, inte styra handlingar.

---

## 7. KVD

- [x] Alla 55 poster inventerade (räknekontroll i § 3.6).
- [x] Per post: titel, ämne, nyckelord, språkstatus, FAQ-potential med skäl.
- [x] Språkstatus kvantifierad (en/ar-% per post, källa angiven).
- [x] FAQ-material: 10 försedda + prioriterad kölista (8 HÖG / 8 MEDEL / 6 SVAG).
- [x] Ämnestäckning: vältäckt, kluster/kannibalisering, 10 glipor.
- [x] Endast denna fil + sondskript i .zcode/ berörda. Ingen push (enligt direktiv).
