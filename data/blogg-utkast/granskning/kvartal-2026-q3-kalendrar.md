# Granskning: kvartalskalendrar Q3 2026 (v152 fas 2 — 10 branschfiler, 100 bolag)

**Granskad:** 2026-09-15 · **Granskare:** agentfabrik s1-u3 (spår 1 — granskningskön)
· **Objekt:** `data/blogg-utkast/kvartal/2026-q3/kalender-*.json` (10 filer)
· **Diff-förslag:** `kvartal-2026-q3-kalendrar-diff.json` (samma mapp — maskinverkställbara rättningar)

**BEDÖMNING: EFTER RÄTTNING** — innehållet är juridiskt rent och källorna
i gott skick, men 3 mekaniska fel (A1–A3 nedan) måste rättas innan paketet
är flyttklart. Rättningarna verkställs från diff-filen; inget behöver skrivas om.

OBS: m9-utkasten och SEO-guiderna granskades redan i v151 (2026-09-14,
se SAMMANSTALLNING-2026-09-14.md) — detta är spårets nästa olevererade
objekt: kvartalskalendrarna från v152 fas 2, som enligt V152-KVARTALSKARTA
fas 4 ska genom granskningskön innan publiceringsbeslut (R2 — kunden).

## Metod

1. Mekanisk genomgång av alla 10 filer / 100 bolag med script
   (node): JSON-giltighet, schema, antal bolag, datumvaliditet och
   rappfönster-läge, källors fält, URL-syntax, riskord.
2. Korskontroll av alla tickers, namn och länder mot
   `data/portfolj-system/bolagsunivers.json` (100/100 match).
3. Juridikgrind-genomläsning (skill: juridikgrind — lagen 2007:528:
   utbildning tillåtet enligt 2 kap 5 §, rådgivning kräver tillstånd).
4. Källverifiering med oberoende hämtning (Ericsson, Nokia, Kambi,
   Public.com, Sandvik) — se avsnitt Verifieringar.

## Fynd A — blockerande för flytt (måste rättas)

**A1. Bolagsnamn med HTML-escape (kalender-halso.json).**
Johnson & Johnson heter "Johnson &amp; Johnson" i filen — ett kvarvarande
HTML-escape som skulle synas ordagrant i publika ytor. Universum har det
korrekta namnet ("Johnson & Johnson"); felet uppstod i kalendergenereringen.

**A2. Trasig käll-URL (kalender-industri.json, SAND.ST).**
URL:en `https://www.home.sandvik/en/investors/...` saknar `.com` — värden
"www.home.sandvik" går inte att slå upp. Korrekt domän: `home.sandvik.com`.

**A3. Tre olika fältnamn för hämtdatum — 8 av 10 filer avviker.**
Sammanställningen per fil:

| Fil | Fält |
|---|---|
| teknik, halso | `hamtat` (referensvarianten) |
| fastighet, finans, industri, kommunikation, material | `hamtdatum` |
| energi, konsument | **saknas helt** (hämtdatumet står bara i källnamnet som text) |
| tillvaxt | blandar `hamtat` och `hamtad` (AMD har båda varianter) |

Konsekvens: en konsument som läser `hamtat` får ogiltigt värde för 80 % av
källorna, och energi/konsument saknar maskinläsbart hämtdatum helt (sämre
spårbarhet). Rättning: normalisera samtliga källor till `hamtat:
"2026-09-15"` — värdena är redan korrekta där fältet finns.

## Fynd B — innehållsfel med uppströms orsak (flaggas, koordineras)

**B1. Shell plc har land "USA" (kalender-energi.json).**
Shell plc är brittiskt (huvudnotering London; SHEL på NYSE är sekundär
notering). Värdet ÄRS dock ifrån `bolagsunivers.json` (SHEL: land "USA"
där också) — kalenderfilen är konsekvent med universum. Rättningen måste
gå via universum först, annars skapas inkonsekvens mellan systemen.

**B2. "ExxonMobil Holdings Corporation" (kalender-energi.json).**
Bolagets juridiska namn är "Exxon Mobil Corporation". Även detta namn ÄRS
från universum — samma koordinerade rättning rekommenderas.

B1/B2 ligger i diff-filen som flaggor av typen `uppstroms` med förslag på
rätt värde i båda filerna — verkställs av universumets ägare (eller nästa
våg) i ett steg: universum först, sedan kalendern.

## Fynd C — juridik (lagen 2007:528): REN, med 8 stilrättningar

Genomgång av all fritext (rapportfenster + notera + källnamn) mot
juridikgrindens rekommendationsverb (köp/sälj/rekommendera/bör du/
målkurs/målpris/undvik) och V152-kartans stilarbeten. Resultat:

- **Inga rekommendationer.** 0 träffar på köp/sälj-råd, målkurs, målpris
  eller prognos om kurser/resultat. "Sälj"-träffen i PSNY är ordledet i
  "försäljningsvolymer" (retail sales volumes) — kalenderfakta, helt rent.
- **Disklamern konsekvent:** energi-filen bär "Endast kalenderfakta —
  inga siffror, inga råd" på varje rad; teknikfilen använder "Så här
  läser du"-ton. Inga finansiella siffror förekommer alls i paketet.
- **8 träffar på "väntas"** — var och en avser NÄR en rapport/
  officiell bekräftelse PUBLICERAS (kalenderfakta), aldrig nivåer eller
  handlingar. Exempel: "resultat väntas före börsöppning" (PLD),
  "årsrapport 2026 väntas 2027-02-09" (LATO-B), "Q4 2026 väntas i
  slutet av januari 2027" (SKF-B). Detta är JURIDISKT rent (ingen
  rådgivning), men V152-KVARTALSKARTA fastslår stilen "ALDRIG 'väntas'"
  — diff-filen föreslår därför omformuleringar av alla 8 (t.ex.
  "publiceras", "kommer enligt bolagets kalender").

**Slutsats C:** grunden är trygg — utbildningsformuleringen håller för
2007:528. Stilrättningarna är kvalitet, inte juridisk nödvändighet.

## Fynd D — transparens (förbättringsförslag, ej blockerande)

Statusfördelningen över de 100 raderna: **24** datum ur bolagets egna
officiella kalender, **34** tredjepartsestimat (-flaggat i text, inkl.
divergerande estimat för Enel 11/11 vs 12/11, XOM 30/10 vs 23/10 och
PSNY 5/11 vs 12/11 — bra källkritik i PSNY-fallet), **42** ur historiskt
rapportmönster utan explicit bekräftelseliknande formulering.
Förslag: export-/publiceringssteget bör ge varje rad ett maskinläsbart
statusfält (`officiell | estimat | historiskt`) så läsaren ser
skillnaden — det stärker den pedagogiska linjen (källkritik är
utbildning). Lagras som förslag i diff-filen, typ `förslag`.

## 911-referenser

Sökning efter "911" i alla 10 filer: **0 träffar** (endast en UUID i
index.json innehåller tecknen). Inget att åtgärda.

## Övriga kontroller — gröna

- Alla 10 filer är giltiga JSON med 10 bolag each, `genererad:
  2026-09-15` (stämmer med leveransdagen), korrekt `bransch`-värde.
- Alla rapportfönsterdatum är giltiga ISO-datum i säsongen — utom
  HM-B (2026-09-24) som är KORREKT: H&M:s brutna räkenskapsår (dec–nov)
  ger Q3-rapport i september, och notera-fältet förklarar det. MC.PA
  (månadsfönster, dag ej offentliggjord) och AMD (veckoformat) saknar
  ISO-dag men motiverar det transparent i text; diff-filen föreslår
  ISO-liknande format på AMD (icke blockerande).

## Verifieringar (oberoende hämtning 2026-09-15)

| Källa | Påstående i fil | Resultat |
|---|---|---|
| Ericsson finansiella kalender | Q3 2026: 2026-10-15 kl 07:00 | **Bekräftad exakt** ("Oct 15, 2026 07:00"). Finjustering i diff: sidan skriver "approximately 7:00 AM CEST" → "ca 07:00 CEST" |
| Nokias finansiella kalender 2026 | Q3: 2026-10-22 | **Bekräftad exakt** ("22 October 2026" i Nokias egna pressrelease) |
| Kambi financial calendar | Q3: 2026-11-04 kl 07:45 CET | **Bekräftad exakt** ("4 November 2026, 07:45 GMT+0100") |
| Public.com — AAPL earnings | Estimat 2026-10-29 | Sidan hittad och av rätt typ; exakt estimatvärde ej synligt i maskinläsbart utdrag (JS-renderad) — lämnas som tredjepartsestimat, korrekt flaggat i filen |
| home.sandvik.com (Sandvik IR) | — | Korrekt domän bekräftad; filens URL saknar `.com` (fynd A2) |

Övriga ~200 käll-URL:er är syntaxkontrollerade (giltiga, rätta
domäner — ett undantag: A2). Investor-sidor som blockerar robotar
(Ericsson/Nokia gav 403 mot första verktyget) verifierades via
webReader-kanalen i stället.

## Nästa steg

1. Verkställ A1–A3 + stilrättningarna via
   `kvartal-2026-q3-kalendrar-diff.json` (ägare: kalendrarnas ägare
   eller nästa våg — exklusivt filägarskap gäller).
2. B1/B2 koordineras med universumets ägare (universum först).
3. Därefter är paketet FLYTTKLART och väntar på kundens
   publiceringsbeslut (R2) — inget publiceras automatiskt.

*Granskningskvitto: 100 bolag mekaniskt kontrollerade, 5 källor
oberoende verifierade, juridikgrind + 911-kontroll körd, diff med 23
poster (19 verkställningsbara nu, 2 uppströms, 2 förslag) levererad som
ny fil — inga originalfiler ändrade av granskaren.*
