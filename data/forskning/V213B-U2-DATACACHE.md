# V213B-U2 · Kontraktssvit DATACACHE — verktyg/testa-motor-datacache.mjs

**Våg:** V213B (tio otestade motorer får minimala kontraktssviter; V212:s
motorregister 102 motorer / 92 testade ⇒ detta steg täcker datacache).
**Uppgift:** u2 · **Ägareskap:** `verktyg/testa-motor-datacache.mjs` + detta
protokoll. `src/` orörd — R2 orörd — `data/blogg/` orörd.
**Datum:** 2026-09-20 · **Byggare:** agentfabrik-manifest V213B.

---

## Uppdraget

Skriva EN deterministisk kontraktssvit för motorn `src/lib/datacache.ts`
(datacentralen: daglig lokal cache av motor-data), mot dess FAKTISKA
exporterade kontrakt — aldrig påhittat beteende.

## Motorns publika kontrakt (lästa ur källan före testerna)

| Export | Signatur | Löfte |
|---|---|---|
| `lasCache` | `(ticker, typ, maxAlderMin?) → CacheRad \| null` | Läser huvudkatalog (`<cwd>/data/cache`) först, reserv (`<TMPDIR\|/tmp>/datacache`) efter; för gammal rad ⇒ genomfall till nästa katalog; ogiltigt ticker/typ ⇒ null; korrupt rad ⇒ null — aldrig kast. |
| `sparaCache` | `(ticker, typ, data, kalla?) → "data/cache" \| "/tmp/datacache" \| "no-cache"` | Skrivkedja i tre steg med graceful fall; `kalla` normaliseras: allt utom `"cron"` ⇒ `"on-demand"`; ogiltigt indata ⇒ `"no-cache"` utan skrivspår. |
| `lasEllerHamta` | `(ticker, typ, hamta, maxAlderMin?) → { data, franCache }` | Frisk rad ⇒ serveras utan hämtanrop; miss ⇒ hämtaren + on-demand-fyllnad; hämtaren kastar + gammal rad ⇒ nätverksreserv (franCache=true); ingen rad ⇒ hämtarens fel vidare. `data:null`/saknad räknas som miss. |
| `cacheStatistik` | `() → { rader, aldst, yngst, perTyp }` | Hälsoläget över båda katalogerna; huvudkatalogen vinner vid dublettfilnamn; sopor/ogiltiga rader hopphas; saknad katalog ⇒ nulfyllt svar — aldrig kast. |

Under kontraktet: filnamnssanering `[^A-Za-z0-9] ⇒ _` (blockerar
path-traversal; `VOLV-B.ST` ⇒ `analys-VOLV_B_ST.json`) och tickervalidatoren
`/^[A-Za-z0-9.\-]{1,12}$/`.

## Determinismmetoden

Motorn äger två kataloger som styrs av processen: `process.cwd()/data/cache`
och TMPDIR. Sviten `process.chdir:ar` därför till en sandlåda under OS-temp
och pekar om `TMPDIR` — repots riktiga `data/cache` berörs aldrig, varken
läs eller skriv (verifierat: `git status data/cache` tomt + sandlåan rivs i
`finally`). Ingen server, inget nätverk, ingen prod. Motorn stödjer ingen
injicerad klocka ⇒ tidsberoendet fryses genom att cacherader sås med VALDA
`cachad`-tidsstämplar (4/6 min gamla mot ett 5-minutersfönster = ±60 s
marginal; sviten går på 0,17 s). Blockerade kataloger simuleras genom att
katalogsökvägen görs till en FIL (fungerar oavsett användarrettigheter —
till skillnad från chmod) vilket tvingar motorns graceful-kedja deterministiskt.

## Kontroller (23 st)

1. Exportkontrakt: fyra funktioner.
2. `sparaCache` ⇒ "data/cache" + sanerat filnamn (`analys-VOLV_B_ST.json`).
3. `lasCache` round-trip: ticker/typ/data bevarade, `kalla="cron"`, `cachad` ≈ nu.
4. `kalla`-normalisering: undefined/skräp ⇒ "on-demand", "cron" ⇒ "cron".
5. Ogiltiga tickers (tom, mellanslag, slash, 13 tecken, parentes) ⇒ null/"no-cache" utan skrivspår.
6. Ogiltig typ (utanför de fyra) ⇒ null/"no-cache" utan skrivspår.
7. Färskhetsfönster: 4 min gammal rad inom 5-minutersfönstret ⇒ träff.
8. 6 min gammal rad utanför fönstret ⇒ null.
9. Utan maxAlderMin serveras raden oavsett ålder (nätverksreservläget).
10. Gammal huvudrad + frisk reservrad ⇒ reserven serveras (genomfall).
11. Frisk rad i båda katalogerna ⇒ huvudkatalogen vinner.
12. Ogiltig JSON i cachefilen ⇒ null, aldrig kast.
13. Radfältsvalidering: främmande ticker / fel typ / `cachad` som sträng / `kalla="manuell"` ⇒ null.
14. `lasEllerHamta` frisk träff: franCache=true, hämtaren ALDRIG kallad.
15. Miss: hämtaren körs, franCache=false, raden fylld `kalla="on-demand"`.
16. `data:null` och saknat data-fält ⇒ miss (dokumenterat kontrakt i motorns dokumentation).
17. Nätverksreserv: hämtaren kastar + gammal rad ⇒ gamla datan, franCache=true.
18. Ingen rad + hämtaren kastar ⇒ hämtarens fel vidare (samma meddelande).
19. Skrivreserv: `data/cache` blockerad ⇒ "/tmp/datacache" + läsning hittar reservraden.
20. Totalkollaps: huvud OCH reserv blockerade ⇒ "no-cache" + null — graceful, inget kast.
21. `cacheStatistik` tomma kataloger ⇒ nulfyllt svar.
22. `cacheStatistik`: 4 giltiga rader, sopor/ogiltig typ/txt hopphas, dublett räknas en gång (huvudet vinner; äldst 1000, yngst 5000).
23. `cacheStatistik` saknade kataloger ⇒ nulfyllt svar, aldrig kast.

## KVD — körda bevis (2026-09-20)

- `node --check verktyg/testa-motor-datacache.mjs` ⇒ OK (syntax).
- `node verktyg/testa-motor-datacache.mjs` (node v22.23.2, inbyggd TS-tolk)
  ⇒ **23/23 PASS, exit 0, 0,17 s** — full utdata nedan.
- `npx --yes tsx verktyg/testa-motor-datacache.mjs` (aggregatorns återfallskanal)
  ⇒ **23/23 PASS, exit 0** — samma bild, kör under både node och tsx.
- Sandlåda: 0 kvar i OS-temp efter körning; `git status data/cache` tomt —
  repots riktiga cache orörd av sviten.

```
PASS   1 · Exportkontrakt: lasCache, sparaCache, lasEllerHamta, cacheStatistik är funktioner
PASS   2 · sparaCache ⇒ 'data/cache' med sanerat filnamn (VOLV-B.ST ⇒ analys-VOLV_B_ST.json) — lagring=data/cache
PASS   3 · lasCache round-trip: ticker/typ/data bevarade, kalla='cron', cachad ≈ nu (ändligt epok-ms)
PASS   4 · kalla-normalisering: undefined/skräp ⇒ 'on-demand', 'cron' ⇒ 'cron'
PASS   5 · Ogiltiga tickers ⇒ lasCache null + sparaCache 'no-cache' (tom, mellanslag, slash, 13 tecken, parentes)
PASS   6 · Ogiltig typ (utanför de fyra) ⇒ null/'no-cache' — fortfarande inget skrivspår
PASS   7 · maxAlderMin: 4 min gammal rad inom 5-minutersfönstret ⇒ träff
PASS   8 · maxAlderMin: 6 min gammal rad utanför fönstret ⇒ null (cache-miss)
PASS   9 · Utan maxAlderMin serveras raden oavsett ålder (nätverksreservläget i lasEllerHamta)
PASS  10 · Gammal huvudrad + frisk reservrad ⇒ reserven serveras (genomfall till nästa katalog)
PASS  11 · Frisk rad i BÅDA katalogerna ⇒ huvudkatalogen vinner
PASS  12 · Ogiltig JSON i cachefilen ⇒ null, aldrig kast
PASS  13 · Radfältsvalidering: främmande ticker, fel typ, cachad=sträng, kalla='manuell' ⇒ null
PASS  14 · lasEllerHamta frisk träff: franCache=true, data ur cachen, hämtaren ALDRIG kallad
PASS  15 · lasEllerHamta miss: hämtaren körs, franCache=false, raden fylld med kalla='on-demand'
PASS  16 · data:null och data-fältet saknas i cacheraden räknas som miss (dokumenterat kontrakt)
PASS  17 · Nätverksreserv: hämtaren kastar + gammal rad finns ⇒ gamla datan serveras, franCache=true
PASS  18 · Ingen rad + hämtaren kastar ⇒ hämtarens fel kastas vidare (samma meddelande)
PASS  19 · Skrivreserv: data/cache blockerad ⇒ sparaCache '/tmp/datacache' + lasCache hittar reservraden — lagring=/tmp/datacache
PASS  20 · Totalkollaps: huvud OCH reserv blockerade ⇒ 'no-cache' + lasCache null — graceful, inget kast — lagring=no-cache
PASS  21 · cacheStatistik på tomma kataloger ⇒ { rader: 0, aldst: null, yngst: null, perTyp: {} }
PASS  22 · cacheStatistik: 4 giltiga rader, sopor/ogiltig typ/txt hopphas, dubbertrad räknas en gång (huvudet vinner)
PASS  23 · cacheStatistik på saknade kataloger ⇒ nulfyllt svar, aldrig kast

[testa-motor-datacache] 23/23 kontroller gröna.
RESULTAT: 23/23 PASS
```

## Fynd och anmärkningar

- **Inga motorfel.** Alla 23 kontrakt gröna i båda körcanalerna — inget
  behöver rappas; `src/` orörd.
- **Bifogad notis (inte fel):** ren node ≥ 22.18 skriver en
  `MODULE_TYPELESS_PACKAGE_JSON`-varning till **stderr** när motorns .ts-fil
  tolkas (package.json saknar `"type": "module"`). Den påverkar varken
  stdout (RESULTAT-raden förblir sista utdata-rad) eller avslutskoden.
- **Aggregator-notis:** sviten byter `process.cwd()` + `TMPDIR` under
  körningen och återställer båda i `finally` — den kan köras i samma process
  som andra sviter utan läckage. Om en framtida kanal kör med äldre node än
  22.18 går samma fil under `npx --yes tsx` (bevisat ovan).
- **Metodnotis för syskon:** "katalog blockerad" testas billigt och
  rättighetsneutralt genom att katalogsökvägen görs till en fil — chmod hade
  varit en dead end under root-lika användare.

## Juridik

Sviten och detta protokoll är ren intern kvalitetssäkring av plattformens
cachemekanik för utbildningsinnehåll — inget innehåll, inga råd, inga
kundsynliga ytor (utbildning är tillåten verksamhet enligt 2 kap 5 § lagen
2007:528; något som kunne tolkas som råd förekommer ej).

## Commit

`studio: v213b-u2 kontraktssvit datacache — 23/23 PASS [fabrik]` — filer:
`verktyg/testa-motor-datacache.mjs` + detta protokoll. Data-only leverans
(test + dokumentation); inget bygge krävs, `src/` orörd.
