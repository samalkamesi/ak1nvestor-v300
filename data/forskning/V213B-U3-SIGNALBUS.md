# V213B-U3 — Kontraktssvit: signal-bus (src/lib/signal-bus.ts)

**Våg:** 213(b) — "10 otestade motorer får minimala kontraktssviter" (kvalitetsspåret,
V212:fyndlista). Manifest `v213b-kontraktssviter-1789873200000`, uppgift u3.
**Datum:** 2026-09-20 · **Roll:** byggare (agentfabriken) · **Ägarskap:** endast
`verktyg/testa-motor-signal-bus.mjs` + detta protokoll.

## Uppdrag

Signal-bus var en av motorregistrets otestade motorer (V212: 102 motorer / 92 testade).
Leveransen: EN deterministisk kontraktssvit som testar motorns FAKTISKA exporter —
kontrakt lästa ur källkoden, aldrig påhittade beteenden.

## Metod

1. **Motorfilen först.** `src/lib/signal-bus.ts` (577 rader) lästes i sin helhet.
   Exporter: konstanterna `SIGNAL_TYPER`/`SIGNAL_MOTTAGARE`, `statiskaSignaler()`,
   `lasSignaler()`/`lasSignalerForElev()` (SYNLIHET-monotoni + filter + clamp),
   `publiceraSignal()` + fem trigg-hjälpare (konfluens/vågkarta/netnet/cache/tracer),
   och de rena streak-hjälparna `raknaStreakRisk()`/`byggStreakRiskSignal()`.
2. **Beroenden verifierade före sviten.** `getSupabaseRest()` returnerar null utan
   miljövariabler (Node laddar inte .env) och `publiceraOrganEvent()` är fail-safe
   (returnerar false, kastar aldrig) — hela publicerings-/läsgrenarna är offline
   körbara. Type-only-importer (KonfluensRad/NetnetRad) raderas av type stripping.
3. **Sviten** (`verktyg/testa-motor-signal-bus.mjs`): ren node-ESM med
   `_o106-ts-import.mjs`-resolve-hooken (o106-precedensen). Supabase-env stryks
   FÖRE import och återställs efteråt — inget nätverksanrop kan ske. Alla
   tidsberoenden fryses via explicita `nu`-argument; midnattstestet beräknar
   väntat värde före/efter anropet (midnattsglidningssäkrat). Miljöklass:
   DETERMINISTISK. Runtime-mått: 0,23 s (tak < 60 s).

## Kontrakt som bevisas (62 kontroller, åtta sektioner)

- **A modulkontraktet** — alla elva exporter är funktioner, konstanter är arrayer.
- **B vokabulär-låset** — `SIGNAL_TYPER` = exakt `["info","varning","mojlighet","beslut"]`,
  `SIGNAL_MOTTAGARE` = exakt `["alla","fas2","admin"]`.
- **C statiskaSignaler** — exakt 4 signaler (vagscan/konfluens/netnet/datacache),
  mottagarspridning alla/fas2/fas2/admin, tid = dagens LOKALA midnatt
  (deterministisk), välformade unika id:n, interna exakta länkar, byte-identisk
  determinism vid två anrop.
- **D lasSignaler utan konfig** — fail-safe-kontraktet (statiska signaler som
  andning), SYNLIHET-monotonin: gäst 1 / fas2 3 / admin 4, okänd mottagarsträng ⇒
  "alla"-fallback, `lasSignalerForElev` visar ALDRIG admin för elever, kalla-/typ-
  filter (tomt resultat ⇒ [], aldrig filter-bypass), maxAntal-clamp 1..100
  (0 och -5 ⇒ 1), saniterad Signal-form i resultatet.
- **E publiceraSignal fail-safe** — kastar ALDRIG: tom indata (renSignals
  dokumenterade standardvärden), full indata, ogiltiga fältvärden — alla löser void.
- **F trigg-hjälparna** — dokumenterade returvärden: konfluens 0 för []/null/fel
  klass, 2 för två träffar (varav en utan namn ⇒ ticker-fallback, konfluens null);
  vågkarta true (även sum?-vakttäckt null); netnet 0 för []/null/"nära", 1 för
  net-net; cache- och tracer-hjälparna löser void även med null (skrivna
  `info?`-/`insikt?.`-vaktgrenar — testat beteende är det som står i koden).
- **G raknaStreakRisk** — aktiv idag/framtid (≥-kontraktet), risk igår med
  timmarKvar 0<t≤24 på en decimal, 23:30 ⇒ ≈0,5 h, bruten för äldre/ogiltigt
  datum/antal 0/negativt/null, full determinism givet nu.
- **H byggStreakRiskSignal** — null för aktiv/bruten/kort kedja, signal vid
  MIN_STREAK_FOR_RISK-gränsen ≥ 3, formkontrakt (kalla "streak", typ "varning",
  mottagare "alla", länk "/dagens-pass"), tid = inmatat nu, texten bär antalet
  dagar med uppmuntrande ton.

## Fynd

- **Inga motorfel.** 62/62 GRÖNT — signal-bus håller sitt dokumenterade kontrakt
  i samtliga testade grenar (offline-klass). Inga src-ändringar behövdes (och
  är som alltid förbjudna för denna roll).
- **Befintlig delsvit finns**: `verktyg/testa-signal-bus.mjs` (o106) täcker redan
  konstanter + statiska + streak-matematik men saknar lasSignaler/filter/SYNLIHET
  och samtliga publicerare — samt aggregatorns `RESULTAT: N/M PASS`-kvittorad.
  Denna svit är den FULLSTÄNDIGA kontraktssviten under testaggregatorns
  namn-/kvitto-konvention (`testa-motor-*.mjs`, sista raden RESULTAT); den
  befintliga berörs ej (den är o106:s ägodel).
- **Motorregistret** (`data/motorregister.json`) noterade `testverktyg: ""` med
  gamla sviten i `testverktygAlla` — nästa motorregen bör knyta
  `testa-motor-signal-bus.mjs` som primärt testverktyg (registerregen ägs av
  ronden, ej av denna uppgift).

## Bevis (KVD)

- `node --check verktyg/testa-motor-signal-bus.mjs` ⇒ OK.
- Körning: `node verktyg/testa-motor-signal-bus.mjs` ⇒ **62 PASS / 0 FAIL**,
  exit 0, runtime 0,23 s, sista raden exakt `RESULTAT: 62/62 PASS`.
- **Ren node räcker** — ingen `ERR_MODULE_NOT_FOUND` (resolve-hooken löser
  ändelselösa TS-importer), tsx-återfallet behövdes ej.
- Full utdata (ur körningen):

```
A — modulkontraktet: exporterna finns
  PASS A1 SIGNAL_TYPER/SIGNAL_MOTTAGARE är arrayer
  PASS A2 samtliga elva exporterade funktioner är funktioner
B — vokabulär-låset: konstanter exakta
  PASS B1 SIGNAL_TYPER = ["info","varning","mojlighet","beslut"]
  PASS B2 SIGNAL_MOTTAGARE = ["alla","fas2","admin"]
C — statiskaSignaler: dagens andning (fallback-kontraktet)
  PASS C1 exakt fyra signaler (en per huvudorgan)
  PASS C2 källor ["vagscan","konfluens","netnet","datacache"]
  PASS C3 mottagarspridning ["alla","fas2","fas2","admin"]
  PASS C4 typ ∈ SIGNAL_TYPER (samtliga)
  PASS C5 tid = dagens lokala midnatt (deterministisk, känns aktuell varje dag)
  PASS C6 välformade + unika id:n (id/kalla/rubrik/text/ikon icke-tomma, tid number)
  PASS C7 länkar exakta och enbart interna relativa
  PASS C8 determinism (två anrop samma dag ⇒ identiska)
D — lasSignaler utan konfig: SYNLIHET-monotonin + filter + clamp
  PASS D1 returnerar Promise<Signal[]> (formkontraktet)
  PASS D2 gäst-vy (default): bara publika — 1 signal, källa vagscan
  PASS D3 fas2: publikt + fas2 — 3 signaler (admin exkluderad)
  PASS D4 admin: allt — 4 signaler
  PASS D5 okänd mottagarsträng ⇒ fallback "alla"-synlighet (1)
  PASS D6 lasSignalerForElev(false) = gäst-vyn (1)
  PASS D7 lasSignalerForElev(true) = fas2-vyn (3) — admin syns ALDRIG för elever
  PASS D8 kalla-filter: netnet ⇒ 1 med rätt källa
  PASS D9 typ-filter: mojlighet + fas2 ⇒ 2
  PASS D10 typ-filter utan träff ⇒ [] (tomt är tomt — aldrig filter-bypass)
  PASS D11 maxAntal 0 ⇒ clampas till 1
  PASS D12 maxAntal -5 ⇒ clampas till 1
  PASS D13 maxAntal 2 ⇒ 2 (gällande tak)
  PASS D14 resultat är saniterad Signal-form (typ/mottagare ∈ vokabulären)
E — publiceraSignal: fail-safe (kastar ALDRIG utan konfig)
  PASS E1 tom indata ⇒ löser void (renSignals dokumenterade standardvärden)
  PASS E2 full indata ⇒ löser void (skrivningen no-op utan konfig)
  PASS E3 ogiltiga fältvärden ⇒ löser (sanering faller aldrig utanför vokabulären)
F — trigg-hjälparna: dokumenterade returvärden utan konfig
  PASS F1 publiceraKonfluensSignaler([]) ⇒ 0 (inga träffar ⇒ ingen signal)
  PASS F2 publiceraKonfluensSignaler(null) ⇒ 0 (rader ?? []-vakten)
  PASS F3 rader utan konfluensklass ⇒ 0
  PASS F4 två träffar (varav en utan namn ⇒ ticker, konfluens null) ⇒ 2
  PASS F5 publiceraVagkartaSignal(giltig summa) ⇒ true
  PASS F6 publiceraVagkartaSignal(null) ⇒ löser true (sum?-vakten)
  PASS F7 publiceraNetnetSignaler([]) ⇒ 0
  PASS F8 publiceraNetnetSignaler(null) ⇒ 0 (rader ?? []-vakten)
  PASS F9 klass "nära" räknas ej (endast "net-net") ⇒ 0
  PASS F10 en net-net-träff ⇒ 1
  PASS F11 publiceraCacheFylltSignal(kvitto) ⇒ löser void
  PASS F12 publiceraCacheFylltSignal(null) ⇒ löser (info?-vakten)
  PASS F13 publiceraTracerInsiktSignal(insikt) ⇒ löser void
  PASS F14 publiceraTracerInsiktSignal(null) ⇒ löser (insikt?-vakten)
G — raknaStreakRisk: midnattsmatematiken (ren, given nu)
  PASS G1 senast idag ⇒ aktiv, timmarKvar null
  PASS G2 senast i framtiden ⇒ aktiv (≥ idag-kontraktet)
  PASS G3 senast igår ⇒ risk, timmarKvar 0 < t ≤ 24
  PASS G4 timmarKvar med högst en decimal (avrundat 0.1)
  PASS G5 30 minuter till midnatt ⇒ ≈ 0.5 h kvar
  PASS G6 äldre än igår ⇒ bruten, timmarKvar null
  PASS G7 ogiltigt datumformat ("inte-datum") ⇒ bruten
  PASS G8 antal 0 ⇒ bruten (kedjan finns inte)
  PASS G9 negativt antal ⇒ bruten (Math.max(0, …)-golvet)
  PASS G10 null-indata ⇒ bruten (s?.-vakten, aldrig kast)
  PASS G11 determinism (samma nu ⇒ byte-identiskt svar)
H — byggStreakRiskSignal: lokal signal endast när kedjan är värd att rädda
  PASS H1 aktiv kedja ⇒ null (inget buller)
  PASS H2 bruten kedja ⇒ null
  PASS H3 risk-kedja med 2 dagar ⇒ null (MIN_STREAK_FOR_RISK = 3)
  PASS H4 risk-kedja med 3 dagar ⇒ signal (gränsen är ≥ 3)
  PASS H5 signalform: kalla "streak", typ "varning", mottagare "alla", länk "/dagens-pass"
  PASS H6 tid = inmatat nu (determinist, inte Date.now())
  PASS H7 id är icke-tom sträng (lokal signal, publiceras aldrig)
  PASS H8 texten bär antalet dagar och uppmuntran (aldrig dömande ton)

SVIT MOTOR SIGNAL-BUS: 62 PASS / 0 FAIL av 62 kontroller
RESULTAT: 62/62 PASS
```

## Juridik

Protokollet och svitens texter är kvalitets-/utbildningsdokumentation: de
beskriver HUR motorn andas och testas. Inga investeringsråd (2007:528) — signaler
med exempeltexter är motorns egna pedagogiska formuleringar, okompilerade.

## Ägarskap och ruta

- Committat: `verktyg/testa-motor-signal-bus.mjs` + `data/forskning/V213B-U3-SIGNALBUS.md`.
- `src/**` orörd · `data/blogg/**` orörd · R2-ytor orörda · äldre svit
  `testa-signal-bus.mjs` orörd · syskonuppgifternas ytor orörda.
- Ingen bygge/installation — sviten är verktygsscope, prod-synken äger byggen.
