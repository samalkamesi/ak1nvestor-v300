# S2-U3 — Dataset-djup: energi +3 bolag + universumjämförelse-hub (2026-09-15)

**Spår:** 2 DATASET-DJUP (evighetskatalogen, citeringsmagneterna) · **Agent:** s2-u3 (byggare, agentfabrik auto-s2)

## Leverans 1 — universumet 100 → 103 (energi 10 → 13)

Tre nya bolagsrader i `data/portfolj-system/bolagsunivers.json`, alla med
verkliga publika nyckeltal hämtade 2026-09-15 från stockanalysis.com
(översikt + statistics + financials; underlag S&P Global Market
Intelligence, sid-as-of 2026-09-14):

| Ticker | Bolag | Land | Valuta | P/E | P/B | ROE | Notering |
|---|---|---|---|---|---|---|---|
| TTE.PA | TotalEnergies SE | Frankrike | EUR | 11,3 | 1,5 | 14,5 % | serier i USD (källan standardiserar) |
| NESTE.HE | Neste Oyj | Finland | EUR | 16,1 | 2,9 | 19,4 % | prognos härledd ur trailing/forward-P/E |
| ORSTED.CO | Ørsted A/S | Danmark | DKK | osatt | 1,1 | −1,4 % | negativt TTM-resultat — pe/peg osatta |

Metodnoteringar (ärlighet om härledningar, per radens `notering`-fält):
prognosTillvaxt = implicit EPS-tillväxt +1 år ur trailing/forward-P/E
(TTE +30,4 %, NESTE +37,8 %, ORSTED osatt); peg = P/E/prognostillväxt;
CAGR över 4 räkenskapsår 2022–2025 (ENEL-konventionen); utdelningsfält
förblir null (plattformskonventionen "saknar utdelningsdata" håller).

**Effekt på medianer (omräknade med projektets egen `lasBranschMedianer`):**
energi P/E 18,7 → 16,5 (n=12) · omsättningstillväxt 39,7 → 15,4 % — de tre
nya europeiska energibolagen har alla negativ 4-årstillväxt och drar
medianen kraftigt ned; totalt universum P/E 20,5 → 20,4 (n=94 av 103).
Det är den ärliga effekten av att branschen växer från 10 till 13 bolag.

## Leverans 2 — ny aspektmodul `universumjamforelse` (exklusiv fil)

`src/lib/dataset-aspekter/universum.ts`: jämförelsehubben
`/dataset/[bransch]/universumjamforelse` — branschens P/E (median,
kvartiler, spridning i statistikblocket) mot HELA universumets (kvartiler
i ingressen), plus sex mått i parvisa matTabell-rader (P/E, P/B, EV/EBIT,
ROE, bruttomarginal, omsättning-CAGR — branschrad + universumrad per
mått). Radnivå-gränsregeln som värderingshubben (median null under
MIN_MATTA); sidnivå-dubbelgrind på bransch-P/E. 10 nya URL:er (alla 10
branscher passerar gränsen). Kompletterar s2-u2:s universumfält i
nyckeltalssidorna — samma mått och metod, egen sida.

Vy/rutt: `dataset-aspekt-vy.tsx` underrubrik now dynamisk
("{N}-bolagsuniversumet" via ny `antalBolag`-prop från page.tsx) — den
statiska "100"-texten skulle blivit osann vid 103 bolag.

## Leverans 3 — llms.txt (3 rader uppdaterade + 1 ny)

Dataset-sektionens intro + index-rad + energirad omräknade (103 bolag,
nya medianer, dubbla rådatumsdatum 2026-09-03 + 2026-09-15) + en ny rad
för `/dataset/energi/universumjamforelse`. Övriga branschrader opåverkade.

## KVD-bevis

- `npx tsc --noEmit` = **0 fel** (med syskonens parallella leveranser på disk)
- Vit-test `verktyg/testa-dataset-aspekter.mjs` = **GRÖNT, 0 fel** (160
  sidkontroller, 18 aspekter — bolagsläckage 0, juridikgrinden hel)
- `aspektParametrar()` = 170 aspekt-URL:er (varav 10 universumjamforelse)
- Prod `https://lab.ak1nvestor.com/` = **200**
- v98-dataset-vakt (läckagevakt mot byggda sidor) kan inte köras utan
  `next build` (byggen ägs av prod-synken under flock) — vit-testet + de
  strukturella gränsvakterna täcker modulutdata; v98 körs vid nästa
  byggande slag.

## Skuld till nästa våg (dokumenterad, inte blockerande)

1. "100-bolagsuniversumet"-formuleringar kvar i ~33 träffar i src (flesta
   i filhuvudkommentarer; synliga undantag: nyckeltal-b.ts "0 av 100
   bolag", vy-texter i bolags-sidor). Föreslagen våg: global sweep till
   dynamiska tal.
2. Nya sidor (3 bolagssidor + 10 aspektsidor) föds vid nästa prod-bygge
   (SSG/ISR — datafiler läses vid byggtillfället).
3. s2-u1:s modul `omsattning-tillvaxt-ttm.ts` låg ocommittad vid mitt
   commit-tillfälle — hantering dokumenterad i commit-meddelandet.

## Koordinering (parallell omgång — våg 104-reglerna)

u2 (24c1d61b) levererade kontraktets universumfält + P/E-/P/B-aspekter;
u1:s TTM-modul på disk. Delade filer (index.ts, llms.txt) redigerade med
Read-current/Edit-verktyget (aldrig fullfilje-Write) för att bevara
syskonens rader; bolagsunivers.json via node read-modify-write med
idempotensguard. Inga syskonrader skadades — verifierat i diff före commit.
