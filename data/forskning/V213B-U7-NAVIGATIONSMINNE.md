# V213B-U7 — Kontraktssvit: navigationsminne

**Motor:** `src/lib/navigationsminne.ts` (mönsterigenkänning per elev: besökta
sidor i localStorage, personliga nästa-steg-förslag — ren klient-logik)
**Svit:** `verktyg/testa-motor-navigationsminne.mjs`
**Resultat: 36/39 PASS** — 3 FAIL, alla äkta kantfynd (2 distinkta rötter),
inget test sänkt, `src/` orörd (äganderegeln).
**Körning:** ren `node` (v22.23.2 tolkar `.ts`-importen direkt — tsx-återfallet
outnyttjat). `node --check` + körning: 0,0 s, deterministisk, ingen server,
inget nätverk, ingen prod.

## Metod

1. Motorfilen lästes FÖRST; sviten testar endast de FAKTISKA exporterade
   kontrakten (`Besok`-formen, `registreraBesok`, `besok`, `titelFranSida`,
   `MAX_BESOK = 24`, nyckeln `ak1a:navigationsminne`) — aldrig påhittat beteende.
2. Motorn läser `window.localStorage` med SSR-vakt (`typeof window ===
   "undefined"`). Sviten mockar `globalThis.window = { localStorage: Map-butik }`
   i processen — ingen disk, inga data/-filer. Riktiga DOM-funktioner utöver
   localStorage finns inte i motorn och testas därmed inte (ej heller
   webbläsarspecifik kvot-/event-hantering: endast kastande-butik-vägen).
3. Husets `kontroll()`-mönster (PASS/FAIL-rader), exit 0 endast vid alla PASS,
   sista raden exakt `RESULTAT: N/M PASS`.

## Kontraktskarta

| Fall | Område | Kontroller |
|------|--------|-----------|
| A | Exporter (3 funktioner) | 1 |
| B | Fönsterlös grundform: SSR-vakten, tyst fail-safe i `spara`, rent fönsterlöst `titelFranSida` | 4 |
| C | Alla 22 kända tabelltitlar exakt | 1 |
| D | `/kurser/*`- och `/blogg/*`-derivat (bindestreck→mellanslag, %-avkodning), okända sökvägar, prefix-kantar, tomma prefix-rester, ogiltig %-kodning | 11 |
| E | `registreraBesok`: titel/fallback/tid, nyast först, dubblett flyttas upp med ny tid, direkt upprepning = no-op med oförändrad tid, tom/undefined sida = no-op | 9 |
| F | `MAX_BESOK`: 30 registreringar ⇒ exakt 24, äldsta kapade, strikt omvänd ordning, form/unikhet | 4 |
| G | Butiksform: exakt en nyckel, råvärde = JSON-array med exakt `sida/titel/tid` | 2 |
| H | Fail-safe: korrupt JSON, kastande butik (läs+skriv), återhämtning, samt 2 äkta kantfynd | 6 |
| I | Fönster återborttaget + determinism | 2 |

## Äkta fynd (FAIL kvarstår — ärligt rött, src orörd)

### Fynd 1 — D11: `titelFranSida` kastar URIError på ogiltig %-kodning

`titelFranSida("/kurser/100%")` kastar `URIError: URI malformed`. Roten:
`decodeURIComponent(sida.replace(...))` (navigationsminne.ts rad 74 och 77) ligger
UTANFÖR all try/catch. Konsekvens: `registreraBesok` anropar `titelFranSida`
INNAN `spara`:s try-block (rad 37) → kastet propagerar hela vägen ut till
anroparen (t.ex. en React-effekt), vilket bryter modulens annars konsekventa
tysta fail-safe-anda (`las`/`spara` sväljer allt). Uppträdande: kräver en sökväg
med ogiltig %-sekvens — normala interna länkar (korrekt URL-kodade) påverkas
ej; risken är felkodade externa länkar in till sajten. Förslag till framtida
våg (ÄGARSKAP: denna våg rör ej src): linda avkodningen, t.ex.
`safeDecode = (s) => { try { return decodeURIComponent(s); } catch { return s; } }`.

### Fynd 2 — H5+H6: `besok()` bryter `Besok[]`-returtypslöftet vid främmande data i butiken

Sås `"null"` (giltig JSON, fel typ) eller ett icke-array-objekt under nyckeln ⇒
`besok()` returnerar `null` respektive objektet — inte en array. Roten: `las()`
gör `return rå ? (JSON.parse(rå) as Besok[]) : [];` (rad 20) — typ-casten döljer
att JSON.parse kan ge annat än arrayer; catch-grenen fångar bara parse-FEL, inte
parse-RESULTAT av fel typ. Anropare som gör `besok().map(...)` kraschar.
Uppträdande: motorn själv skriver alltid korrekta arrayer via `spara` — felet
kräver externt sådd/manipulerad localStorage, varför praktisk påverkan på
sajten är låg; kontraktet är ändå brutet mot den exporterade signaturen.
Förslag till framtida våg: `const v = JSON.parse(rå); return Array.isArray(v) ? v : [];`.

Båda fynden är kvalitetsobservationer på utbildningsplattformens egna verktyg —
ingen juridisk eller rådgivande dimension (utbildningsundantaget 2 kap 5 §
lagen 2007:528 är ouppnått här: ren teknik).

## Svit-egna rättelser FÖRE leverans (redovisade, inte motorfel)

- **D1:** väntad titel var felstavad ("mera för…" fast slugen är `for`) — motorn
  rätt: `mera for miljarder`. Rättat i sviten.
- **D6:** `%C3%A4` är `ä`, inte `å` — testet byttes till `%C3%A5rsvinst` →
  `Blogg: årsvinst`. Motorn rätt hela vägen; `ä`-fall täcks av D3. Rättat i sviten.

Ingen kontroll togs bort eller sänktes i samband med rättelserna — endast de
två väntade värdena korrigerades till motorns faktiska (korrekta) kontrakt.

## KVD

- `node --check verktyg/testa-motor-navigationsminne.mjs` → OK.
- `node verktyg/testa-motor-navigationsminne.mjs` → `RESULTAT: 36/39 PASS`,
  exit 1 (3 dokumenterade äkta fynd — avsett), 0,0 s, 39 kontroller.
- Full utdata klistrad nedan.

```
PASS  A1 modulen exporterar registreraBesok, besok, titelFranSida som funktioner
PASS  B1 utan window ⇒ besok() returnerar exakt [] (SSR-vakten)  — typeof window === "undefined"
PASS  B2 utan window ⇒ registreraBesok kastar inte (spara sväljer felet tyst)
PASS  B3 utan window ⇒ besok() fortfarande [] efter misslyckad registrering
PASS  B4 titelFranSida är fönsterlöst rent kontrakt: /kurser → Alla kurser
PASS  C1 alla 22 kända sökvägar ger exakt tabelltiteln
PASS  D1 /kurser/mera-for-miljarder → mera for miljarder (bindestreck→mellanslag)  — "mera for miljarder"
PASS  D2 /kurser/kassaflodesanalys-101 → kassaflodesanalys 101 (flera bindestreck)  — "kassaflodesanalys 101"
PASS  D3 /kurser/%C3%B6vningar-i-fonder → övningar i fonder (%-avkodad åäö)  — "övningar i fonder"
PASS  D4 /blogg/valpokuten → Blogg: valpokuten  — "Blogg: valpokuten"
PASS  D5 /blogg/det-stora-bankraaset → Blogg: det stora bankraaset  — "Blogg: det stora bankraaset"
PASS  D6 /blogg/%C3%A5rsvinst → Blogg: årsvinst (%-avkodad å; ä täcks av D3)  — "Blogg: årsvinst"
PASS  D7 okänd /xyz/abc returneras oförändrad  — "/xyz/abc"
PASS  D8 prefixliknande utan slash (/kurserxyz) röras inte — startsWith(«/kurser/») är falskt  — "/kurserxyz"
PASS  D9 kant /kurser/ → tom rest efter prefix ger exakt "" (dokumenterat faktiskt beteende)  — ""
PASS  D10 kant /blogg/ → exakt "Blogg: " (dokumenterat faktiskt beteende)  — "Blogg: "
FAIL  D11 ogiltig %-kodning (/kurser/100%) sväljs utan kast — P8-andan för ogiltiga indata  — kast URIError: URI malformed (decodeURIComponent utan try/catch — rot: titelFranSida)
PASS  E1 given titel används exakt: [0].titel, [0].sida  — {"sida":"/kurser/mera-for-miljarder","titel":"Mera för miljarder","tid":…}
PASS  E2 utan titel ⇒ titelFranSida-fallback (/kurser → Alla kurser)  — {"sida":"/kurser","titel":"Alla kurser","tid":…}
PASS  E3 tid är number inom nu-fönstret (Date.now() vid registreringen)
PASS  E4 nyast först: A,B,C ⇒ exakt [C,B,A]  — ["/c","/b","/a"]
PASS  E5 dubblett djupare i listan flyttas upp (ej duplicerad): A,B,A ⇒ [/a,/b]  — ["/a","/b"]
PASS  E5b flyttad dubblett får ny tid och angiven titel
PASS  E6 direkt upprepning (samma sida som [0]) är no-op: längd 1, tid OFÖRÄNDRAD
PASS  E7 tom sträng och undefined sida ⇒ no-op utan kast, listan orörd
PASS  F1 30 registreringar ⇒ exakt 24 kvar i minnet (MAX_BESOK-trunkering)  — längd=24
PASS  F2 [0] = senaste (s30) och [23] = s7 — de 6 äldsta (s1–s6) kapade  — [0]=/s30 [23]=/s07
PASS  F3 alla 24 är formkorrekta Besok och sidorna unika  — formOK=true unika=true
PASS  F4 hela listan i strikt omvänd registreringsordning s30…s07  — /s30,/s29,/s28 …
PASS  G1 exakt en nyckel i butiken med namnet ak1a:navigationsminne  — ["ak1a:navigationsminne"]
PASS  G2 råvärdet är JSON-array med exakt fälten sida/titel/tid (inga extrafält)
PASS  H1 korrupt JSON i butiken ⇒ besok() → [] (catch-grenen i las)  — []
PASS  H2 återhämtning: registrering efter korrupt data skriver över och fungerar
PASS  H3 kastande butik ⇒ besok() → [] utan kast (läs-fail-safe)
PASS  H4 kastande butik ⇒ registreraBesok utan kast (skriv-fail-safe, privat läge)
FAIL  H5 sådd "null" i butiken ⇒ besok() håller Besok[]-löftet (väntar array)  — fick: null — rot: las() returnerar JSON.parse(rå) okontrollerat när rå är truthy
FAIL  H6 sått icke-array-objekt ⇒ besok() håller Besok[]-löftet (väntar array)  — fick: {"sida":"/x","titel":"t","tid":1} — samma rot som H5
PASS  I1 window borttagen efter data ⇒ besok() → [] (SSR-vakten igen)
PASS  I2 determinism: identisk sekvens på två färska butiker ⇒ identiskt minne (sida+titel)
Tid: 0.0 s (39 kontroller)
RESULTAT: 36/39 PASS
```

(Tidstämplar i utdraget förkortade med `…` — de är `Date.now()`-beroende per
körning och påverkar inget kontrakt; varje körning ger annars identiska rader.)

## Ägarskap & leverans

- Ägda filer: `verktyg/testa-motor-navigationsminne.mjs` + detta protokoll.
- `src/`, `data/blogg/`, andra testfiler, `.env*`, nycklar: orörda. R2 orörd.
- Inget `npm ci`/`npm install`/`npm run build`/`npx tsc` — sviten kräver ingen
  typinstallation (ren node tolkar `.ts` direkt).
