# Granskning v151 — SEO-guide: nyemission-sa-fungerar-det

- **Objekt:** `data/blogg-utkast/nyemission-sa-fungerar-det.json` (SEO-guiderna våg 95, #6 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v151), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar; utkast-JSON:en är orörd.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/nyemission-sa-fungerar-det.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §6

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `nyemission-sa-fungerar-det`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 54) | 54 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 139) | 139 tkn — stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 843) | 843 ord (rå räkning) — exakt specens tal | ✅ |
| readingMinutes 1 | 1 | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab — pillar finns bland de publicerade posterna (6 pillars i data/blogg/) | ✅ |
| Tags | nyemission, teckningsrätter, utspädning, företrädesemission, aktiemarknaden — exakt specens lista | ✅ |
| Primärt sökord i H1 + ingress + H2 | title "Nyemission: så fungerar…" (H1), ingressens första mening "En nyemission betyder…", H2 "Varför bolag gör nyemissioner" + "Nyemission i siffror — utspädningen genomräknad" | ✅ |
| Sekundära naturligt (2–4) | teckningsrätter ✓ (5 träffar), utspädning ✓ (7), företrädesemission ✓ (3) — ämnets kärntermer, naturlig täthet | ✅ |
| Body ordagrant enligt spec | normaliserad diff spec↔JSON: IDENTISK (5 323 tkn båda) | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |
| Strukturgrind (kontrolleratextRad-porten) | body 5 323 tkn (≥ 800), 6 st "## "-rubriker (≥ 2) | ✅ |

## 2. FAKTA — aritmetik och mekanik (alla gröna)

Räkneexemplet (företrädesemission 1:4 till 60 kr på 1 000 aktier à 100 kr)
 verifierat rad för rad:

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| Före: 1 000 aktier × 100 kr = 100 000 kr | 1 000 × 100 = 100 000 | ✅ |
| Emission 1:4 → 250 nya aktier på 1 000 befintliga | 1 000 ÷ 4 = 250 | ✅ |
| Nytt kapital: 250 × 60 = 15 000 kr | 250 × 60 = 15 000 | ✅ |
| Teoretisk kurs (TERP): 115 000 ÷ 1 250 = 92 kr | (100 000 + 15 000) ÷ 1 250 = 92 exakt | ✅ |
| Kurstryck: "faller mekaniskt med 8 procent" | (100 − 92) ÷ 100 = 8,0 % | ✅ |
| Dina 100 aktier värda 9 200 kr | 100 × 92 = 9 200 | ✅ |
| 100 teckningsrätter = 25 × 32 = 800 kr (rätten per ny aktie: 92 − 60 = 32) | 100 ÷ 4 = 25 nya aktier à (92 − 60) = 32 → 800; per rättighet 8 kr (32 ÷ 4) — konsistent kedja | ✅ |
| Summa 9 200 + 800 = 10 000 = värdet före | 10 000 — värdetransport aktier→rättigheter, ej förlust; klassisk TERP-identitet håller exakt | ✅ |
| Utspädning utan teckning: 10 % → 8 % | 100 ÷ 1 000 = 10,0 %; 100 ÷ 1 250 = 8,0 % | ✅ |
| Full teckning: 125 ÷ 1 250 = 10 % | 125 ÷ 1 250 = 10,0 % — andelen bevarad | ✅ |

Mekanik- och metodpåståenden:

| Påstående | Verifiering | Utfall |
|---|---|---|
| "1:4 till kurs 60" = fyra teckningsrätter ger rätt att teckna en ny aktie till 60 kr | korrekt svensk emissionsnotation (1 ny per 4 befintliga) | ✅ |
| Företrädesemission är huvudregeln i aktiebolagslagen (ägare erbjuds först, pro rata, förhandsbestämt pris ofta under kursen) | korrekt (huvudregeln om företrädesrätt vid nyemission) | ✅ |
| Riktad emission: utvalda investerare, kringgår företrädesrätten, kräver stämmobeslut, debatteras | korrekt (se dock INFO-observation nedan) | ✅ |
| Kontantemission: kontant betalning, normalt med företrädesrätt | korrekt (kontant betalning till skillnad från apport; "normalt" täcker att den även kan vara riktad) | ✅ |
| Teckningsrätter handlas på börsen, har sista handelsdag innan teckningsstopp; oanvända/osålda löper ut värdelösa | korrekt svensk mekanik; "passivitet har ett pris" är sakligt | ✅ |
| Teoretisk kurs är en uträkning, inte en prognos; kursen efter emissionen styrs av marknadens bedömning av kapitalanvändningen | korrekt och viktigt pedagogisk förbehåll | ✅ |
| Tre skäl till nyemission (tillväxt/förvärv, stärka balansräkningen, täcka kassaflödesunderskott) | korrekt standardindelning | ✅ |

## 3. LÄNKAR — 3 unika internlänkar, alla levande

| Länk | HTTP mot localhost:3000 | I public/deep-courses.json | Utfall |
|---|---|---|---|
| `/kurser/rk-02-emissionrisk` (2 förekomster) | 200 | ✓ | ✅ |
| `/kurser/sj-03-bolagsstamma-och-rostratt` | 200 | ✓ | ✅ |
| `/kurser/km-005-eget-kapital-utdelningar` | 200 | ✓ | ✅ |

Korslänksregeln håller: enbart redan publicerade kurser, inga länkar till
andra utkast och inga /blogg/-länkar alls — partiell publicering skapar inga 404:or.

## 4. JURISTEN — grön

- **Varumärkesgrind:** `kontrolleraText` (samma regexar ur `data/varumarke.json`, spegel av src/lib/varumarke.ts) körd på title+description+body: **0 FEL, 0 VARNINGAR**.
- **Inga råd:** "Dina tre val" beskriver mekaniken neutralt per alternativ (vad valet innebär, inte vad läsaren bör välja), följs av den explicita raden "den här guiden är pedagogik om mekaniken, inte råd om ditt unika läge — valet beror på din skattesituation, din bild av bolagets användning av kapitalet och resten av din portfölj".
- **Disclaimer sist:** "_Detta är pedagogisk finansanalys, inte investeringsråd._" — sista raden i body, teckenför-tecken identisk med publicerade poster (jämförd mot data/blogg/5-vanliga-nyborjarmisstag-svenska-aktier.json).
- **Lagrum:** inga paragrafer citeras (endast "svenska aktiebolagslagen" i löp text) — inga blandade lagrum möjliga.

## 5. SPRÅK — grön

Svenska, rak ton, du-tilltal konsekvent. Terminologin hålls isär (teckningsrätt/rättighet används medvetet om vardera). Siffror med mellanslagsgruppering (10 000 kr) och procent med blanktecken genomgående. Inga anglicismer, inga passiva konstruktioner i instruktionsläge.

## Observation (INFO — inget fynd, ingen rättning)

Sektionen "Tre former" skriver att riktad emission "kräver stämmobeslut". Påståendet
är sant men gäller i praktiken alla nyemissioner (stämmobeslut eller bemyndigande);
det särskiljande för den riktade är beslutet om UNDANTAG från företrädesrätten.
Texten innehåller ingen felaktighet och implikationen är mild, så den lämnas orörd —
eventuell framtida skärpning är en redaktionell smaksak, inte ett granskningsfynd.

## Diff-rapport

Ingen — 0 rättningar. `data/blogg-utkast/nyemission-sa-fungerar-det.json` är
orörd av denna granskning (är fortfarande byte-identisk med specens §6-body).

## Slutsats

**FLYTTKLAR** — spec ✓, fakta ✓ (utspädningsaritmetiken håller exakt, rad för rad),
länkar ✓ (3/3 levande), juridik ✓ (0 FEL, disclaimer identisk), språk ✓.
0 fynd som kräver åtgärd, 0 rättningar.

LEVERANS: nyemission-sa-fungerar-det bedömning=FLYTTKLAR fynd=0 rättningar=0
