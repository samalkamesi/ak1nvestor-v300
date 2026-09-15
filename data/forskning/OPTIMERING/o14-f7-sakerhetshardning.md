# o14 — F7-säkerhetshärdning: feljägarens nyckelbevakning (spår 8, s8-u1 omgång 3)

Datum: 2026-09-15 · Agent: fabriksagent s8-u1 (vakt) · Status: LEVERERAD

## Objekt och duplikatkontroll

Spår 8 (KVALITET & SÄKERhet) kontext "Mimosa-fyndens rotorsaker / vakten
0-fynd-jakt". Innan start kontrollerades worklog + data/: sex tidigare
spår 8-leveranser (grindens bevis + R2-härdning u1, beroendevakten u2,
dödlänksvakt u3, tsc-determinism u1-omg2, 0-fynd-jakt + vaktkraschkur
u2-omg2, F5-rotorsaksfix u3-omg2) + ROND 39:s F1-vaccin. F7 har RÖRTS exakt
en gång (4cf1bd32 13:09: falska positiva vid tom grep-svans). Kvarvarande
icke-levererade objekt: F7:s latenta konstruktionsbrister — detta protokoll.

## Fyndkedjan

1. **11:08:11Z-larmet rotbundet som FALSKT POSITIVT** — feljakt-fynd.jsonl
   rad 2 bär spårets enda F7-KRITISK någonsin. Git-historiken löser den:
   feljägaren föddes 0ea7fb1f 13:07 lokal (11:07Z), första körningen kraschade
   F1 (gitTopp-scope) 11:07:58Z, och F7 larmade 11:08:11Z på en TOM sträng —
   `grep … | head -3 || echo REN` kör echo endast på HEAD:s exit-kod, och
   head lyckas (exit 0) även när grep är tom ⇒ tom sträng ≠ "REN" ⇒ larm.
   Kurad samma dag i 4cf1bd32 (tomhetskontroll `grepResult &&`). Ingen äkta
   nyckelläcka har alltså någonsin bevisats — men bristerna i larmvägen
   itself var kvar.

2. **Baslinje med säker sond** (nya värdet lämnar aldrig processen, endast
   fil+räknare återges): HELA data/vakten rekursivt = 460 filer, 0 träffar
   på prefix (12 tkn) och 0 på fulla värdet. F7:s falsklarmshistoria + grön
   baslinje = utgångsläget dokumenterat.

## Tre rotorsaksbrister i F7 (aktuella koden före härdningen)

| # | Brister | Konsekvens |
|---|---------|-----------|
| B1 | `bokfor(…, grepResult.slice(0, 80))` — bevisfältet bar grep:ets utdata, som inleds med nyckelns 12 första tecken | Vid första ÄKTA träffen skrivs nyckelfragmentet permanent in i feljakt-fynd.jsonl — som F7:s egen sökning skannar varje jakt: en självreplikerande nyckelläcka som aldrig kan gröna |
| B2 | Glob `data/vakten/*.log *.jsonl` = endast toppnivå, två tillägg | Blinda fläckar: agentfabrikens underkataloger (ko/, status/, utdata/ — barnens FULLA svar loggas där) + .json/.txt/.md |
| B3 | `execSync(`grep -r "${pass.slice(0,12)}" …`)` — nyckelfragmentet interpolerat i ett skalkommando | Citationstecken/specialtecken i framtida lösenord bryter sökningen tyst (och skickar fragmentet genom processlistan) |

## Kuren (verktyg/feljagaren.mjs, F7-sektionen)

- Ny `sokNyckel(katalog, prefix)`: in-process rekursiv vandring, ALLA
  filtyper, oläsbara filer hopas över; returnerar fil + radnummer + antal —
  aldrig radinnehåll. Skal-fri (B3 död), täckande (B2 död).
- Bevisfältet vid äkta träff: `fil:rad | fil:rad | …` (max 3) — nyckeln kan
  aldrig nå fyndloggen (B1 död). Fyndtexten bär filräknare för lägeskänsla.
- Grön rad vid ren yta: `nyckel ej i vakt-ytan (N filer, rekursivt)` —
  täckningen syns i loggen.
- Testläge `--f7-test <katalog>` med fast TESTPREFIX (aldrig ett riktigt
  värde) — speglar --f5-test-mönstret; fyndloggen orörd i testläge.

## Bevis

1. **Syntax**: `node --check` ✓.
2. **Scenariotest** (/tmp/f7test, 5 filer): a.log rad 2 ✓, data.json rad 1 ✓
   (B2-fläck), under/nestad.log rad 1 ✓ (B2-fläck), oskyldig.txt tyst ✓,
   feljakt-fynd.jsonl med simulerad FIL:RAD-baserad fyndpost tyst ✓
   (självlarm-loopen B1 bevisad död: posten innehåller inte prefixet).
   Resultat: `filer=5 traff=3` — korrekt.
3. **Kontrast mot gamla globben**: samma katalog med gamla mönstret
   `grep -r P /tmp/f7test/*.log *.jsonl` = 1 träff av 3 äkta —
   täckningsgapet B2 mätt, inte påstått.
4. **Äkta fullkörning** (prod 200 före): samtliga 7 spår — F7 GRÖN
   `nyckel ej i vakt-ytan (460 filer, rekursivt)` = oberoende kongruens
   med sondens 460-tal. F1 hoppade (src/ oändrad sedan stamp), F2 4/4,
   F3 18/18, F4 3/3, F5 0 fynd, F6 prod 200/disk 20 %.
5. **tsc**: projektbinär `node node_modules/typescript/bin/tsc --noEmit` = 0
   (src/ orörd — härdningen berör endast verktyg/).

## Sidofynd (bokförs, åtgärdas ej här)

- F6-drift MEDEL: RAM MemAvailable 443 MB vid fullkörningen (< 800 MB-tröskeln,
  > 300 MB-kritiska) — känd serverbeläggning med aktiva fabriksagenter; inget
  nytt larm, pumpornas jakt loggar det löpande.
- NyckelROTATION (om en äkta träff en dag visas med fil:rad-bevis) är R2
  (API-nycklar/nycklar = kundens veto) — detta verktyg levererar beviset,
  beslutet om rotation är kundens/huvudagentens.

## Regelram

Endast verktyg/feljagaren.mjs + data/ berörda = inget bygge; src/ orörd;
R2 orörd (inga priser/tier/publicering; .env läses enligt repots eget
lasPass-kontrakt, värdet återges aldrig); data/blogg/ orörd; commit via
`git commit -F` med explicit pathspec; pre-commit-grinden passerad.
