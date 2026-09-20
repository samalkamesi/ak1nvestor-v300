# KONTROLL 2026-09-20 — branschmedianer-akm2 v2-KANDIDAT (m9-familjen)

**Granskare:** agentfabrik auto-s1-1789925707056 **s1-u2 instans 2** (fortsättning
av samma order — ursprungsobjektet m9-utkast #2/utdelningar-101 levererat av
instans 1, commit `449d4dfa`; detta pass = köregeln "nästa icke-levererade
objekt", u3:s kandidatklass). **Sond:** `verktyg/_s1u2-branschmedianer-v2-kontroll.mjs`
(omkörbar, read-only) — **50 kontroller · 50 PASS · 0 FEL** (efter två ärligt
bokförda sondbuggar i förstakörningen: trailing-newline i --visa-parsningen +
mall-md5-radiens backtick-form — rättade, omkörda, grönt förtjänt).

**Objekt:** m9-fabrikens TORR-kandidat **branschmedianer-akm2** (status
GRANSKNINGSKLAR i TORR-läget 2026-09-20 ~19:5x; kandidat-md5
`0431dd6c885861fa3b03fc1c70f6eb8a`, mall-md5 `7b4a313a35ac6fb77204db4e176eb1a9`,
seed `904e0fcc…`). Kandidaten är **0 rader skriven till Supabase-kön** —
--skriv ägs av kö-underhållet (granskaren skriver ej om andras ytor).

## Varför detta objekt (duplikatkontroll)

- v1/v2-kontrollen 2026-09-16 gällde korstabellens 100-bolagsunderlag från
  2026-09-03 — men branschmedianer är den enda m9-serien vars kandidat nu är
  GRANSKNINGSKLAR utan att någon KONTROLL täcker **skillnaden mot publicerad
  utgåva** (se fyndet nedan: våg-95-kommafixen).
- Syskonläge: u1 klaimade ASML (anspråk 19:40); u3:s kassaflodesanalys-101
  v2 levererad (`b015dd36`); utdelningar-101 levererad (`449d4dfa`); av de sex
  serierna återstod branschmedianer (GRANSKNINGSKLAR, oröttr) och
  boerspsykologi (GRANSKNINGSKLAR — **nästa i kön**, se kö-notis).
- forskningslaget + vagkartan: OFÖRÄNDRAT (skip vid --skriv) — inget nytt.

## Resultat per kontrollfamilj

**A. Determinism (3/3):** `--visa` körd två gånger — byte-identisk body
(bodyMd5 `28651b04…`). TORR-status GRANSKNINGSKLAR bekräftad ur råutdata.

**B. Källintegritet (4/4):** korstabell-grund.json md5 `33fe62a0…` ·
varumarke.json `9b906e42…` · vagvalidering-SENASTE.md `b7194627…` — alla EXAKTA
mot kandidatens kvitto; korstabellen skapad 2026-09-03 = referensdatumet i texten.

**C. Statistik-spegel — oberoende omräkning ur källfilen (17/17):**
universum 100 rader i 10 kanoniska grupper à 10. **Alla tio branschrader
EXAKTA** mot egen beräkning (median enligt peer-kontraktet: jämnt antal →
medel av de två mittersta): teknik 61 (37–78, Sinch→Logitech International) ·
konsument 60,5 (19–70, Electrolux→H&M) · industri 60 (51–85, ASSA ABLOY→Industrivärden) ·
kommunikation 60 (39–68, Warner Bros. Discovery→Tele2) · energi 58 (31–77,
RWE→Chevron) · hälsa 56,5 (46–66, Fresenius→Novo Nordisk) · fastighet 50
(42–60, Prologis→Diös) · tillväxt 43 (25–58, Polestar→Truecaller) · material 42
(31–79, Stora Enso→Newmont) · finans 41 (30–80, Nordea Bank→Investor) — 10/10
mätta, 10/10 i gruppen. Första meningens 10-värdeslista i exakt
median-sjunkande ordning (tie-break localeCompare: industri före kommunikation);
"Högst: teknik 61 / Lägst: finans 41" korrekt; ingressens fyra ledande värden =
topp 4; PEER_MIN_GRUPP=5 uppfylld (10 rapporterade); jämförbarhetsnotens
investmentbolag == exakt Industrivärden (industri) + Investor (finans).

**D. Påståendet "Ingen branschmedian rörde sig" + GRANSKNINGSKLAR-rot (11/11):**
Påståendet **SANT** — samtliga 10 medianer (matta/min/max också) identiska med
den publicerade utgåvans fabrik.statistik. ROTEN till GRANSKNINGSKLAR (ej
OFÖRÄNDRAT) bevisad: **våg-95-kommafixen** — publik statistik bär
`"Prologis,"` och `"Warner Bros. Discovery,"` med kvarlämnat komma, kandidaten
bär de rena namnen; exakt 2 namnskillnader, inga andra fält (D3), och när
publikens två komman stryks i en kopia blir JSON.stringify identisk med
spegeln (D5) — alltså en **äkta kosmetisk förändring**, inte en
nyckelordnings-artefakt. Disk-v2 (kön, 09-14) == kandidatens body
byte-identisk (4733 tecken, 0 rörda rader) med samma seed, källor och
mall-md5. **Kandidat-md5 `0431dd6c…` reproducerad exakt ur egna komponenter**
(källor → egen statistik → urdrag → body → md5) — full determinism-kedja.
D11: publik **body** (inte bara kvitto-statistiken) bär kommat kvar — se fynd
D1 nedan.

**E. Juridik 2007:528 + 911 + struktur (11/11):** kontrolleraText-spegel
(exakt algoritm ur varumarke.ts, samma 26 regexer) — **FEL 0 · VARNINGAR 0**
på hel text (titel+ingress+body); rådgivningsglossor (köp/sälj/rekommendera/
bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning) = **0
träffar**; "investeringsråd" endast NEGERAT i disclaimern ("aldrig
investeringsrådgivning (lagen 2007:528)") som står SIST i ren body;
endast lagrum 2007:528 (2022:260/261, 1985:716, 2005:59, 2022:482 = 0 — ingen
blandning). **911-referenser = 0** på sex mönster (911, 11 september,
september 2001, 9/11, terror, terrordåd) — dimensionen tom, redovisad.
Kvitto-avsnittet strippas rent (4733 → 2808 tecken); 4 "##"-rubriker; body
2 808 ≥ 800 tecken; titelkonvention "september 2026 (utkast)" hel.

**F. Länkar (4/4):** /forskningsbiblioteket · /kurser/v07-bruttomarginal ·
/kurser/v09-roe — **3/3 HTTP 200** mot levande sajten samma kväll (loopback,
GRÄNSSNITTSVAKTENS baseline); exakt 3 interna länkar.

## Fynd — två frivilliga mallägarförslag + två notiser

- **C1 (förslag, mallägaren = verktyg/m9-fabrik.mjs rad ~630):** raden
  "Ingen branschmedian rörde sig sedan den publicerade utgåvan — oförändrat
  (att inget rörde sig är också ett utfall)." — på median-nivå sann, men
  **"— oförändrat" är missvisande** eftersom två ytterlighetsnamn faktiskt
  renodlas (kommafixen, se D3). Förslag: stryk "— oförändrat". Söksträngen
  unik 1/1 i mallen. FRIVILLIGT — kandidaten är flyttklar utan; ändring i
  mallen ändrar mall-md5 och kräver omgranskning av nästa kandidat.
- **C2 (förslag, mallägaren = verktyg/m9-fabrik.mjs rad ~618):** jämförbarhets-
  noten slutar "så finansgruppens median blandar två bolagsformer" — men
  Industrivärden ligger i **industri**gruppen, så även den blandar former.
  Förslag: "såväl industri- som finansgruppens median blandar två
  bolagsformer". Söksträngen unik 1/1. FRIVILLIGT.
- **D1 (notis till dataägaren):** den PUBLICERADE bodyn i
  data/blogg/branschmedianer-akm2.json bär "Prologis," och
  "Warner Bros. Discovery," med kvarlämnat komma (2 träffar i filen: body +
  fabrik.statistik) — våg-95:s polsk-commit `b375518` fixade "de publicerade
  filerna" men täckte ej denna. Nästa publicering av serien får en synlig
  (kosmetisk) skillnad: kommat försvinner. Ingen åtgärd krävs — notis för
  kunddialog om frågan dyker upp.
- **D2 (notis, fabriksägaren):** oförandrad-jämförelsen
  (`JSON.stringify(statistik) === stringify(publik)`) är
  nyckelordningskänslig — här var rotorsaken äkta (kommafixen), men en framtida
  omordning av perBransch-nycklar mellan fabrikversioner skulle ge falsk
  GRANSKNINGSKLAR. D4/D5-kontrollerna i sonden skiljer dessa fall åt.

## Diff disk-v2 (kön) → kandidat

**0 rörda rader, 52 == 52 rader, byte-identisk body** (4733 tecken). Kandidaten
== kö-raden v2 (09-14) — skillnaden mot PUBLICERAD utgåva (09-03) är enbart
kommafixen i de två namnen (se D3/D11). När kö-underhållet kör `--skriv` och
fabriken hoppar serierna korrekt landar detta innehåll; kontrollera att
fabriken redovisar kandidat-md5 `0431dd6c…` och mall-md5 `7b4a313a…` —
avviker någon ska granskningen omköras.

## Dom

**GRÖN — FLYTTKLAR (kandidatnivå).** Källor, siffror, juridik (2007:528),
911-referenser och länkar alla gröna; determinismkedjan md5-bevisad ända ner
till egna komponenter. C1/C2 är frivilliga mallägarförslag (granskaren skriver
ej om andras filer); D1/D2 notiser. Publicering förblir kundens klick (R2).

## Kö-notis

Efter detta pass återstår i m9-familjens kandidatkö: **boerspsykologi-
fallstugor** (GRANSKNINGSKLAR, kandidat-md5 `b90e7b95…`, 4 urdragsrader —
enklare pass); därefter väntar kö-underhållets `--skriv` (kandidat-md5-vakten
dokumenterad av u3).

## KVD

Endast nya filer (denna KONTROLL + diff.json + sond + anspråksfil + worklog):
**src/ orörd = INGET bygge** (tsc-baslinjen vilar i pre-commit-grinden) · R2
orörd (priser/tier/publicering; data/blogg/ ENDAST LÄST) · data/blogg/ orörd ·
Supabase-kön orörd (TORR-läge genomgående) · syskonens ytor orörda (u1:s ASML
respekterat) · commit med pathspec + -F-fil.
