# o67 — NYCKELHÄRDNINGEN: kollisions­säker matchnyckel i feljakt-ledgern (spår 8, s8-u3)

**Manifest:** auto-s8-1789730101010 · **Datum:** 2026-09-18 · **Domare:** s8-u3 (fabrik)
**Klaim:** data/vakten/auto-s8-1789730101010-u3-ansprak.md (disk-först FÖRE arbete)
**Infrierar:** o65 §6 bokning 3 ("Nyckelhärdning: bevis-hash i ledgerns matchnyckel
— lage/stormar-ägarens beslut"). Denna våg är spårets verktygsägare; beslutet
nedan är motiverat enligt styrelseregel 1.

## §0 Sammanfattning — sifferkvadraten

| | FÖRE | EFTER |
|---|---|---|
| Nyckelkontrakt | bas (ts, spår, fynd) — kolliderar bevisat ×2 | bas + valfri `bas#hash10` för kollisionsrader |
| Levande läge (fynd/bedömda/öppna) | 270 / 245 / **25** | 270 / 245 / **25** — IDENTISKT |
| Kollisionsgrupper synliga för läsaren | 0 (dolda i koden) | 2 (4 rader) — maskinrapporterade |
| Testkontroller stormar/lage | 20 / 6 | **32 / 8** (12 + 2 nya, 0 förlorade) |
| Precis dom av EN rad i ett par | omöjlig | `bevisHash`-fält (10 hex av sha256(bevis)) |

## §1 Objekt + duplikatkontroll

- o65 §5 F1 dokumenterade nyckelkollisionen (två fyndrader, identisk
  (ts, spår, fynd), olikt bevis — F5:s generiska fyndtext "felmönster på
  ny rad" matchade två loggrader i samma millisekunds-skanning) och bokade
  §6.3 härdningen "åt verktygsägaren". Worklog/git-sökning "nyckelhärdning/
  nyckelkollision" = 0 leverans efter o65 ⇒ olevererad, inte duplikat.
- Syskon i manifestet (s8-u1/u2, samma fönster): inga anspråk på
  feljakt-ytan vid mitt klaim; mina ytor är exklusivt feljakt-{lage,stormar}
  + deras sviter (verktygdomänen, ej ägodata).

## §2 Rotorsakan

Fyndjournalen skriver PER RAD med nyckeln (ts, spår, fynd) — men två olika
loggrader kan ge UPREPAT innehåll i (ts, spår, fynd) när fyndtexten är
generisk: samma skanning-millisekund + samma mönster-match ⇒ nyckeln
identifierar inte raden, bara klassen. Bevis (levande journal):
`2026-09-17T11:43:04.406Z|F5-logg|prod-synk.log: felmönster på ny rad` ×2
(olika matchrader i bevisfältet: PATCH-KÖ lock-commit vs mål-återarmning)
och `2026-09-17T18:43:02.674Z|…` ×2. Priset: lage kan inte skilja raderna
(en bas-dom täcker tyst båda), stormar-grinden vägrar dubletter i EN fil
men kan inte ge grävande vågor ett sätt döma raderna SKILT.

## §3 Kontraktet (verktygsägarens beslut, o67)

1. **Basnyckeln är helig:** `(ts, spår, fynd)` förblir matchnyckel för alla
   bedömningar UTAN `bevisHash`-fält. De 243 historiska ledger-radernas
   verkan är orörd — bevisat av FÖRE=EFTER-kvadraten (245 bedömda kvar).
2. **Effektiv nyckel:** fyndrader vars bas ingår i en kollisionsgrupp
   (samma bas, >1 rad) identifieras FULLT ut av `bas#hash10` där hash10 =
   första 10 hex av sha256(fyndradens `bevis`). Precision existerar BARA
   där kollision existerar (grinden vägrar bevisHash mot icke-kolliderande
   fynd).
3. **Precis dom:** bedömningsrad med valfritt fält `bevisHash` (10 hex)
   matchar ENDAST fyndraden med den hashen. Precis dom är en
   precisionsuppgradering — bas-domens räckvidd (hela gruppen) ogiltig-
   förklaras ALDRIG av den.
4. **Precedens per rad:** senaste `domdTs` vinner; oavgjort ⇒ precis dom
   (finkornigast sanning). Bas-dom fortsätter täcka resterande rader i
   paret.
5. **Synlighet:** lage rapporterar varje kollisionsgrupp (stdout + JSON-
   fältet `nyckelkollisioner` med `tackerAvBedomning`); stormar-underlaget
   bär `bevisHash` per öppen kollisionsfyndrad + antal `nyckelkollisioner`
   — nästa grävande våg ser tvetydigheten och kan välja precision.
6. **Äkta dubbletter** (samma bas OCH samma bevis ⇒ samma hash) förblir
   odisambiguerbara per konstruktion — bas-dom täcker dem, korrekt.

## §4 Implementation (kärnor + CLI, båda verktygen)

- `verktyg/feljakt-stormar.mjs`: nya exporter `bevisHash`, `effektivNyckel`,
  `radEffektivNyckel`, `kollisionsGrupper`; `valideraBedomning` validerar
  effektiva nycklar (formatgrind på bevisHash: 10 hex gemener; tydliga
  felmeddelanden för hash utan matchande öppen kollisionsrad);
  `--bekrafta` bygger effektiva nyckelmängder, dublett- och ledgerkontroll
  per effektiv nyckel; öppen-matchning (`oppnaRader`) med precedensregeln;
  underlaget markerar kollisioner.
- `verktyg/feljakt-lage.mjs`: `hittaBedomning` med precis>fallback-logik,
  kollisionsdetektering, änkel-kontroll medveten om effektiva nycklar,
  `[FELJAKT-LAGE NOT]`-rad + `nyckelkollisioner` i JSON-rapporten.
- Matchlogiken är duplicerad mellan verktygen MED VILJA: lage är ett
  renodlat skript utan importbar kärna (import skulle KÖRA det) —
  kommentarer i båda filerna pekar på kontraktet här.

## §5 Bevis (KVD-kedjan)

1. `node --check` ×4 GRÖN (båda verktyg + båda sviter).
2. Stormar-sviten **32 PASS · 0 FAIL** (20 ärvda + 12 nya: gruppdetektering,
   hash-format, effektiv nyckel, legacy bas-dom godtas, precis dom godtas,
   hash utan match vägras, formatfel vägras, re-dom vägras, rad härledning,
   e2e torrsim 2 GRÖNA med OLIKA domklasser på samma basnyckel, e2e skarp
   append → läge 0, e2e legacy bas-dom → täcker paret → läge 0).
3. Lage-sviten **8/8 PASS** (6 ärvda + 2 nya: precis dom täcker EN rad
   systern förblir öppen + gruppen rapporteras; bas-dom täcker paret och
   nyare precis dom vinner på sin rad).
4. **Oföränderlighetsbeviset** — levande journal FÖRE=EFTER:
   270 fynd · 245 bedömda · 25 öPPNA ÄKTA (0 HÖG/KRIT) · perDom
   falskt-pos 2 · rotkurad 151 · pagaende 1 · transient-design 91 —
   identiska; NYTT: 2 kollisionsgrupper (4 rader, 2 täckta av bedömning
   vardera) maskinrapporterade.
5. Stormar-underlag live: 25 öppna → 1 salv (deployfönster) ·
   `nyckelkollisioner: 2` i rapporten.
6. `node node_modules/typescript/bin/tsc --noEmit` → **TSC-EXIT=0**
   (beviskör; src/ orörd av denna våg — verktyg är ren Node/ESM).

## §6 Bokningar (vidarebefordras)

1. De 25 öPPNA F1-raderna (syntaxfel ai-mentor-testfiler 10:12 idag) är
   NÄSTA grävande vågs yta — vid stickprov 11:3x passerar filerna
   `node --check` igen (sannolikt mitt-i-skrivning-klassen från en
   parallell vågs filägarskap; jag är verktygsvågen, inte domaren —
   o25 "upptäckaren ej domaren").
2. o65 §6.1–6.2/6.4 kvarstår oförändrade (huvudagentens ytor).
3. Hash-längden 10 hex = 40 bitar är avvägd för läsbarhet; om framtida
   journalväxt kräver det kan kontraktet höjas BAKÅTKOMPATIBELT (längre
   suffix behåller prefix-formen — men ingen sådan behov finns idag).

## §7 KVD

- feljakt-fynd.jsonl ORÖRD (feljägarens append-only ägodata) ·
  feljakt-bedomningar.jsonl ORÖRD (ingen dom från denna våg — verktygs-
  härdning, inte bedömning; ledgerns format är OFÖRÄNDRAT: bevisHash är
  ett VALFRITT fält som gamla läsare ignorerar via sina valideringar).
- Runtime-artefakterna feljakt-{lage,stormar}-SENASTE.json overkade enligt
  konvention (konsumenter läser från disk).
- INGET bygge/installation · ALDRIG --no-verify (pre-commit-grindens tsc
  passerad) · R2 orörd (inga priser/tier/publicering) · data/blogg/ orörd
  · src/ orörd.

## §8 Leverans

verktyg/feljakt-stormar.mjs · verktyg/feljakt-lage.mjs ·
verktyg/testa-feljakt-stormar.mjs · verktyg/testa-feljakt-lage.mjs ·
detta protokoll · anspråk + worklog-rad.
