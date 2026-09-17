# O45 — Flight-kuren: 393 kursobjekt ur VARJE sidas RSC-flight (not-found-gränsens KursForslag) — /kurser-TBT:s första rot (spår 7)

**Ägare:** fabriksagent s7-u3 (byggare 3/3, manifest auto-s7-1789640127873)
· **Status: KUR LEVERERAD (committad, deploy-väntar prod-synkens RAM-fönster)
— EFTER-mätning BOKAD SOM REST** (s7-u1-redispatch-precedensen: deployunderlag
bevisas, mätning hos förste agent på nytt bygge)
· Anspråk (disk-först): `data/vakten/auto-s7-1789640127873-u3-ansprak.md`

## §0 Objektval — SYSTEMKARTANS köpost

223140e1 (omgång 8, E37) bokade kön: "registerrebake 358→390 (STÄNGD av
s5-u3: 358→396), **/kurser-TBT förstahandsobjekt nästa prestandarond**,
footer-rond 2 + språkresolvens a/b/c orörda." Morgonfacit o42:
/kurser TBT 1 636 ms = facitets värsta tmpunkt. Duplikatkontroll: prefetch-
kurerna (o37/o41) gällde /blogg:s kortlänkar; skelett-/CV-kurerna (o16-o20)
gällde /kurser:s LCP/S&L — TBT-roten otäckt. Syskon i manifestet: u1 tog
o41:s EFTER-mätning (mätvåg, INGEN src/), u2 levererade densamma — noll
filöverlapp med denna kur.

## §1 FÖRE-mätning (deployat bygge c8e4b940, BUILD_ID 2rW0uv 11:39)

`node verktyg/prestanda-lighthouse.mjs s7u3d-fore /kurser` (12:2x lokal,
localhost enligt loopback-regeln):

| Sida | Poäng | FCP | LCP | TBT | TTI | CLS |
|---|---|---|---|---|---|---|
| /kurser | **50** | 1 439 | 5 513 | **2 418** | 7 357 | 0 |

Rådata: `lighthouse/kurser-s7u3d-fore.json` (+ sammanfattning). Noterat:
TBT 2 418 mot o42:s 1 636 på i princip samma kod = driftbandet lever (tre
fabriksagenter körs samtidigt — mätdisciplinen enligt o28 talar om att solo-
mätning krävs för definitiva tal; FÖRE/EFTER-par i samma lastläge är det
ärliga jämförelsen).

Long-tasks-fördelning (TBT-fönstret, summa blocking 2 504 ms):

| Bidrag | Blockande ms | Andel |
|---|---|---|
| `kurser` (dokumentet + inline-flight, hydratisering) | 656+63+11+7+1 ≈ 738 | 29 % |
| `3tc9l_yj-kftz.js` (react-dom+auth, hydratiserings-exekvering) | 612+444+282+99+30+13+5 ≈ 1 485 | 59 % |
| `2ecierimwxqep.js` (chat-widget/AI-mentor-chunk, idle-mount) | 127 | 5 % |
| Övrigt (CSS, 452iyves, 0ghd343qi) | ~154 | 6 % |

Style & Layout 2 808 ms · Script Evaluation 3 205 ms (mobil-drossel).

## §2 Rotanalys — fyndet: kursregistret DUBBELT i flighten (och på ALLA sidor)

`verktyg/_s7u3-sond-flight2.mjs` (avescapar inline-flighten ur live-HTML):

- /kurser:s flight (155 K avescapad) innehåller **789 kursobjekt**:
  396 × `{slug,title,category,kapitel,minuter,xp}` (KursSok:s registerprop —
  funktionell, sök/filter behöver den) **+ 393 × `{slug,titel}`** ≈ 42 K.
- De 393 objekten ägs av `$L13` = **KursForslag i `(huvud)/not-found.tsx`** —
  Next serialiserar gruppens not-found-gräns in i VARJE sidas flight inom
  gruppen (för mjuka 404-navigeringar). Bevis (rå flight-kontext, sond v3):
  `$L13 … "kurser":[{"slug":"100-baggers","titel":"100 Baggers — …` direkt
  efter 404-panelens "Sidan hittades inte"-markup.
- **Globalt slöseri, verifierat mot live-HTML:** / (114 K HTML) 393 objekt ·
  /blogg (224 K) 393 · /om (48 K!) 393 · varje kurssida (193 K) 397 ·
  detsamma i (en)- och (ar)-grupperna via deras not-found-filer.
- KursForslag använder arrayen ENDAST när pathname matchar
  `/^\/(en\/|ar\/)?kurser\/.+$/` (en faktisk kurs-404) — annars `[]`/null.
  Matchningen (Levenshtein) behöver bara **slugs**; titlarna är visnings-
  polering. Alltså: ~42 K död vikt på varje sidvisning, tre språk.

## §3 Kuren — slugs i flighten, titlar löst vid behov

PRINCIP: ändrar bara TRANSPORTEN, inte beteendet (o1 #4-mönstret).

1. `src/components/ak1a/kurs-forslag.tsx` — prop `kurser: KursSlug[]` →
   `sluggar: string[]`. Levenshtein + våg-85-spegelregex OFÖRÄNDRADE (samma
   förslag, samma ordning, samma tröskel). SSR-etikett = läsbar slug
   ("100-baggers" → "100 Baggers"); titel-polering via
   `/api/kurs-titlar` i en effect ENDAST när förslag visas (max 3 slugs,
   deterministisk på servern ⇒ ingen hydreringsmismatch; våg 81:s no-JS-
   kontrakt består — länkarna syns i server-HTML, titeln är progressiv
   förbättring; nätverksfel ⇒ slug-etiketten består).
2. `src/app/api/kurs-titlar/route.ts` — NY: `?slugs=a,b,c` (≤10, längd-
   gräns 200) → `{slug: titel}` ur public/sok-index.json med mtime-cache
   (samma mönster som /api/kurs/[slug]). `Cache-Control: public, max-age=3600`.
3. `(huvud)/not-found.tsx`, `(en)/not-found.tsx`, `(ar)/not-found.tsx`,
   `src/app/global-not-found.js` — passerar `sluggar={SLUGGAR}` (slug-lista,
   ~11 K) i stället för `{slug,titel}`-objekten (~42 K).

**Förväntad effekt:** flight −31 K på ALLA sidor i tre språkgrupper
(/om: HTML 48 K → ~27 K; /kurser flight 155 K → ~124 K) ⇒ mindre inline-JS
att parsa+deserialisera i FCP→TTI-fönstret (den 706 ms-långa `kurser`-tasken
och react-chunkens hydratiseringsjobb båda äter av flighten). Dessutom:
/ not-found-gränsen slutar växa med registret (393 → 500 kurser skulle annars
ha vattnat varje sida).

## §4 Kvalitetsgrind

- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinären,
  baslinje 0 sedan våg 133).
- Inga kvarvarande `KursForslag kurser={`-anrop (grep-verifierat).
- KursSlug-typen exporteras inte längre — inga externa importer fanns
  (grep-verifierat; veckoplan.ts:s `senasteVKursSlug` är egen namnrymd).
- INGET bygge (fabriksregeln — deploy ägs av prod-synken under
  /tmp/ak1a-deploy.lock). R2 orörd. data/blogg/ orörd.

## §5 Rest — EFTER-mätning (bokad)

Kuren committas + pushas till prod; prod-synken bygger vid nästa RAM-fönster
(≥2 200 MB; stod i VÄNTAR-RAM 1 619 MB vid kurstillfället med 4 committer
i kö). **EFTER-mätning hos förste s7-agent på nya BUILD_ID:** solo-rond
(spq-verifierat) på minst /kurser + / + /om med
`prestanda-lighthouse.mjs <namn> /kurser / /om`; jämför flight-bytes
(förväntat −31 K/sida) och TBT i samma lastläge som §1. Chat-chunken
`2ecierimwxqep.js` (97 K gz, 74 K oanvänd — idle-mount i TBT-fönstret,
§1:s 127 ms + TTI-förskjutning) är spårets nästa kurobjekt; react-chunkens
hydratiseringsdominans (59 %) kräver strukturell trädbantning — båda bokade
som observationer, ej tagna.

## §6 Kollisionsbokföring

Zerofold: ytan (kurs-forslag.tsx + 4 not-found-filer + ny api-route) rördes
senast av våg 81/85/86 (045925e6/891345fe) — inget aktivt syskonägarskap.
u1 (mätvåg, INGEN src/) och u2 (o41-EFTER, klara) verifierade via anspråks-
filer före min commit. Sonden verktyg/_s7u3-sond-*.mjs är mina egna
(o-trackade, kvitto i LEVERANS-rad).
