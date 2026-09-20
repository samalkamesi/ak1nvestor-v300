# V213B-U1 — Kontraktssvit: nyhets-motorn

**Datum:** 2026-09-20 · **Fabriksvåg:** v213b (10 otestade motorer, motorregister 2026-09-19)
**Motor:** `src/lib/nyhets-motor.ts` (gap 1 av 10) · **Svit:** `verktyg/testa-motor-nyhets-motor.mjs`
**Ägarskap:** endast dessa två filer — src/ orörd (testvåg; rättning är egen våg)

## Metod

Sviten lästes mot motorfilens FAKTISKA exporterade kontrakt — inga påhittade
beteenden. Sex testfamiljer, alla deterministiska (ingen server, inget nätverk,
ingen prod, inga miljöberoenden):

- **A parsRssXml** — RSS 2.0 + Atom-parsning: rubrik/https-länk/datum (RFC 822
  + ISO 8601), CDATA- och entitetsavkodning, http-länk underkänns, ogiltigt
  datum → `tid: null`, maxAntal-tak (explicit + default 12), item utan titel
  hophas, tom/skräp-XML → `[]`, determinism.
- **B valideraRssUrl** — SSRF-grinden: publika värdar godkänns (domän, publik
  IPv4 utanför privata intervall däribland kanten 172.32.0.1, publik IPv6);
  localhost/*.local/*.internal, privata/reserverade IPv4 (127/10/192.168/
  172.16–31/169.254/CGNAT 100.64), IPv6 loopback/ULA/link-local/mappad IPv4,
  numeriska/hex-värdar (2130706433, 0x7f.0.0.1), http, inloggningsuppgifter,
  tom/skräp/överlång URL — alla blockerade; avvisning bär felmeddelande.
- **C raknaPaverkan** — bas 10, konkurs vikt 50, bud/budget-lookahead,
  versalokänslighet, clamp till 100 vid full träffmängd, portföljbonus +20 /
  bevakning +10 / båda +30 med versalokänslig tickermatchning, ingen bonus
  utan tickerräff, determinism.
- **D raknaAk1aNot** — null vid tom/oträffad rubrik, max 2 V-variabler med
  mallordning (V20 före V19 vid tre träffar), specificitet (ev/ebitda → V06
  före V08), välformade V01–V20, **juridikgrind**: tanken är alltid en
  reflekterande FRÅGA — aldrig köp/sälj-råd (utbildning, lagen 2007:528) —
  samt determinism.
- **E STANDARD_AMNESKANALER** — fyra kanaler, unika id, icke-tomma strängfält,
  egna URL:er passerar motorns EGEN SSRF-grind.
- **F hämtarnas nätverksfria kontrakt** — ogiltig ticker/URL ger `[]` FÖRE
  någon hämtning (regex/SSRF-vallarna); `hamtaNyhetsFlode` kastar ALDRIG
  (P8-graceful) vid tom konfig, `undefined`/`null` och normaliserat bort-
  filtrerade ogiltiga indata.

Körning: **kör under tsx** (`npx --yes tsx verktyg/testa-motor-nyhets-motor.mjs`)
— ren node dör förväntat på motorns ändelselösa `./datacache`-import
(ERR_MODULE_NOT_FOUND; testaggregatorns R107-tsx-återfall hanterar det).
Enda diskrörelsen: `hamtaNyhetsFlode({})` cachar tom array i `data/cache/`
(gitignorerad accelerator, våg 121) — inga nätverksanrop sker eftersom alla
källistor är tomma vid normaliserade ogiltiga indata.

## Resultat

`node --check` = OK. Körning under tsx (utdrag; full logg i fabrikens
utdata-arkiv):

```
PASS  A1 parsRssXml: två giltiga items levereras (RSS 2.0)  — fick 2
…
PASS  F6 hamtaNyhetsFlode: undefined/null-handtag ⇒ [] (P8-graceful)
Tid: 0.0 s (46 kontroller)
RESULTAT: 46/46 PASS
```

**46/46 PASS, exit 0, 0,0 s** (tak <60 s med god marginal).

## Ärlighetsnoteringar

- Inga äkta fel påträffades — motorns rena kontrakt håller hela vägen: parser,
  SSRF-grind, ranking, pedagogisk not och P8-graceful. Inget test har sänkts
  för grönt; samtliga kontroller speglar kodens dokumenterade beteende.
- Metodnotis: nätverksvägarna (riktiga Yahoo-/RSS-hämtningar, redirect-
  omgranskning, 512 KB-tak) testas INTE här — de är per uppdragets
  determinismkrav utanför en kontraktssvit; vallarna som hindrar dem
  (ticker-regex, SSRF-validering FÖRE hämtning) testas i fall F.
- Syskonvy: `data/cache/analys-nyh_*.json` från svitkörningen är gitignorerad
  och lämnar trädet rent.

## Juridik

Sviten och detta protokoll testar kodkvalitet; all text om nyhter/påverkan är
formulerad som utbildning — den pedagogiska noten är alltid en fråga, aldrig
investeringsråd (lagen 2007:528 om värdepappersrörelser).
