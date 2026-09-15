# S2-U1: HSBC — finans +1 bolag, ny landstäckning, sidvippning resultat-cagr-5ar

**Manifest:** auto-s2-1789470925967 (uppgift s2-u1, byggare) · **Datum:** 2026-09-15 · **Agent:** fabriksbarn s2-u1 (omgång 2 — leverans slutförd efter rundans skrivkollisioner, se "Incidenten")

## Vad levererades

**+1 bolag i bolagsuniversum: HSBC Holdings plc (HSBA.L), bransch finans, land Storbritannien**
— universumets FÖRSTA brittiska bolag (länderna 11 → 12). Alla tal verifierade mot
stockanalysis.com/quote/lon/HSBA (översikt + statistics + financials; underlag S&P Global
Market Intelligence; sid-as-of 2026-09-15, hämtade 2026-09-15 vid leveranstillfället):

| Mått | Värde | Notering |
|---|---|---|
| Pris / börsvärde | 1 531,20 GBX / 263,34 mdr GBP | kvotvaluta GBX; serier i USD |
| P/E | 16,60 | trailing; forward 11,38 |
| P/B | 1,77 | = egenKapitalMultipl (bankkonvention) |
| PEG | 0,36 | härledd: P/E / prognostillväxt % (TTE.PA-konventionen; källans egen PEG 1,28 bygger på 3-årsprognos +10,79 % — båda dokumenterade i radens notering) |
| prognosTillvaxt | +45,9 % | implicit EPS-tillväxt ur trailing/forward-P/E (16,60/11,38) |
| omsattningCAGR5ar | +10,90 % | 46 358 → 63 224 MUSD, 4 räkenskapsår 2022–2025 (3 perioder) |
| resultatCAGR5ar | +13,73 % | 14 346 → 21 102 MUSD, samma period |
| omsattningTillvaxtTTM | +20,0 % | källans egen TTM-etikett (67,4 mdr USD rullande) |
| ROE | 13,11 % | statistics-sidan |
| nettoMarginal | 37,8 % | brutto-/EBIT-/FCF-marginal n/a (bank) → null |
| fcfYield | null | källans FCF −54,7 mdr USD = kundmedelsflöden; bankkonvention som GS/JPM-raderna |
| skuldEgenkapital | null | källan n/a (bankbalansräkning) |

## Effekt — ny dataset-sida (gränsregeln vippar)

Finans hade resultatCAGR5ar-matta = 4 (NDA-SE, SEB-A, SHB-A, SWED-A) — under MIN_MATTA=5.
HSBC:s +13,73 % gör mattan = 5 ⇒ **/dataset/finans/resultat-cagr-5ar föds**: median 10,4 %,
kvartiler P25–P75 4,8–13,7 % (min 3,4 / max 14,4), universumjämförelse median 2,2 %
(n=76). aspektParametrar gick 170 → **171 URL:er** (registret + sitemap + Dataset-JSON-LD
via vyn — automatiskt, inga src-ändringar krävdes).

Medianförskjutningar (projektets egen lasBranschMedianer, mätt vid 107-bolagstillståndet
= u3:s 106 + HSBC): finans P/E 13,4 → 13,8 (kvartiler 12,5–15,4, n=11) · finans P/B
2 → 1,9 · finans omsättningstillväxt TTM 4,1 → 5,8 % (kvartiler 1,7–25,2, n=11) ·
totalt median P/E 20,4 → 20,2 (n=98 av 107).

## llms.txt

1. **Ny rad för /dataset/finans/resultat-cagr-5ar** (tal ovan) — sektionens första
   aspektrad sedan förra rundans rader försvann i 1245141e:s stale-skrivning.
2. **Totaltal 106 → 107** (intro + huvudrad + alla branschraders universumjämförelse;
   median P/E 20,4 → 20,2, n=97 → 98).
3. **Finansraden 10 → 11 bolag** med de förskjutna medianerna ovan.

## Incidenten — tre agenagers skrivkollisioner på delade filer (dokumenterad för fabriken)

Rundans tre barn (u1 HSBC, u2 Telenor+DTE, u3 Spotify+Skanska+Evolution) skrev
read-modify-write på samma två filer (bolagsunivers.json + llms.txt). Förlopp i korthet:
u3 commitade 106 klart (a9b5df17) → u2 skrev sina +2 rader och llms-tal räknade på 109
(inklusive mitt HSBA.L som då låg i filen) → en stale-återskrivning 14:07:04 återställde
båda filerna till HEAD-läget 106 och raderade därmed ALLA tre agenternas icke-committade
rader (mitt HSBA.L, u2:s TEL.OL/DTE.DE försvann ur arbetsytan). Upptäckt av mig via
läckagevaktens tickerantal (106 i stället för 109) + omräkning. **Kur för min del:**
pathspec-commit (`git commit -- <mina sökvägar>`) som bara committar mina filer och
lämnar syskonens stegade index orört. **Kur till fabriken/huvudagenten (mönster, ej
ny sak):** delade datafiler i manifest kräver antingen en ägare per fil, commit-först-
-skriv-sedan-disciplin, eller ett lås (jämför PG17-dr-fönstret /tmp/ak1a-dr-prov.lock
från s10-u3:s fynd). u2:s datarader (TEL.OL, DTE.DE) saknas fortfarande i filen vid
mitt commit-tillfälle — deras forskningsfil (S2-U2-KOMMUNIKATION-UTOKNING.md) bär alla
tal som behövs för återinföring; det är u2:s/fabrikens att återställa, inte min (våg
104: exklusivt filägarskap).

## KVD-bevis

- **Kontraktstest:** `npx tsx verktyg/testa-dataset-aspekter.mjs` = GRÖNT, 161
  sidkontroller, 0 fel (gränsregel-ärlighet, juridikgrind, bolagsläckage i modulutdata).
  (Rak node är trasig — ERR_MODULE_NOT_FOUND ./ordlista — känt sedan bd6c74cb; tsx är
  den körbara kanalen.)
- **Läckagevakt:** `node verktyg/v98-dataset-vakt.mjs` = GRÖN — 0 träffar (tickers +
  namn sökta i dataset-ytans alla utdatafiler, llms Dataset-blocket, sitemap/robots).
- **Verifiering av nya sidan:** aspektParametrar() = 171 URL:er; finans inkluderar
  resultat-cagr-5ar med matta 5, median 10,4, universum median 2,2 (n=76).
- **tsc:** src/ orörd av denna leverans (ren dataleverans) — baslinjen intakt via
  pre-commit-grinden som passerade commiten.
- **Prod:** HTTPS 200 verifierad efter commit.

## Filer i leveransen

- data/portfolj-system/bolagsunivers.json (+1 rad: HSBA.L, append sist)
- public/llms.txt (1 ny aspektrad + total-/finans-tal)
- data/forskning/S2-U1-HSBC-FINANS-UTOKNING.md (denna fil)
