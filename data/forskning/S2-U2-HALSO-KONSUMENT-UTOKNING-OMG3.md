# S2-U2 omgång 3 — halso + konsument +2 bolag: Roche + Nestlé

Fabriksagent spår 2 (dataset-djup), uppgift u2 av 3, 2026-09-15 kväll.
Följer spårets etablerade mönster (ea7ad8bd/TEL.OL-radens konventioner).

## Val-motivering

Uppdraget: "+2 bolag, kvartiler + universumjämförelse". Duplikatkontroll FÖRE
val (hela universumet utskrivet per bransch): båda tickers saknades. Val efter
spårets kriterier — tunnaste P/E-täckningen bland branscherna + citeringsmagneter:

- **Roche Holding AG (ROG.SW, halso)** — branschens täckning var 9/10 vid val;
  Europas största läkemedelsbolag (läkemedel + diagnostik i världsklass), saknades.
- **Nestlé S.A. (NESN.SW, konsument)** — täckning 10/11; världens störste
  livsmedelskoncern, staple-arketypen i varje utbildning, saknades.

Schweizisk blåchamp-pärning i två tunna branscher; medvetet avstånd till
syskonens sannolika svenska namn (de tog Vonovia/Volvo/EQT/Axfood — se
koordinering).

## Leverans 1 — två bolagsrader i bolagsunivers.json

Node read-modify-write med idempotensguard (båda tickers verifierade saknade
före varje skrivning — guarden räddade omstarten, se strukturkollisionen).
Alla tal live-verifierade mot källan vid hämtningen (stockanalysis.com
översikt + statistics + financials, underlag S&P Global Market Intelligence,
sid-as-of 2026-09-15 ~20:10 lokal tid):

| Fält | Roche | Nestlé |
|---|---|---|
| Pris / börsvärde | 360,60 CHF / 288,70 mdr | 77,89 CHF / 203,72 mdr |
| P/E · P/B · EV/EBIT | 23,57 · 7,86 · 15,19 | 27,39 · 6,90 · 17,74 |
| PEG | 0,61 (spårkonvention) | 0,45 (spårkonvention) |
| FCF-yield | 5,46 % | 6,14 % |
| ROE · ROIC | 38,11 % · 28,10 % | 26,24 % · 12,30 % |
| Brutto- · EBIT- · netto- · FCF-marginal | 74,17 · 33,12 · 19,60 · 25,01 % | 45,70 · 15,48 · 8,38 · 14,10 % |
| Skuld/EK | 0,91 | 2,13 |
| Omsättningstillväxt TTM | −0,8 % | −2,3 % |
| Serier 2022–2025 omsättning (MCHF) | 65 814 → 60 441 → 62 395 → 63 356 | 94 780 → 93 351 → 91 720 → 89 885 |
| Serier 2022–2025 resultat (MCHF) | 12 421 → 11 498 → 8 277 → 12 880 | 9 270 → 11 209 → 10 884 → 9 033 |
| resultatCAGR (endpoint 4 räkenskapsår) | +1,22 % | −0,86 % |
| omsättningCAGR (endpoint) | −1,26 % | −1,75 % |

Metodnoteringar (även i JSON-noteringsfältet per rad):
- prognosTillväxt härledd ur trailing/forward-P/E (TTE-konventionen): Roche
  23,57/17,03 ⇒ **+38,4 %** implicit EPS-förändring (TTM-vinsten återhållsam,
  estimaten högre); Nestlé 27,39/17,04 ⇒ **+60,7 %** (TTM deprimerad av
  nedskrivningar, forward normaliserar — källans 3-årsprognos är +4,89 %).
- peg enligt spårkonventionen P/E ÷ prognosTillväxt i procent (Roche 0,61,
  Nestlé 0,45); källans EGNA PEG-tal (2,31/3,62) bygger på 3-årsprognoser och
  är dokumenterade i noteringarna.
- Nestlé payout 107 % av TTM-vinsten — utdelningen täcks av FCF (12,5 mdr)
  men ej av vinsten; dokumenterat.
- Roche 2024-resultatet 8,3 mdr deponerat (omräkningseffekter), 2025: +55,6 % —
  CAGR:t är endpoint över 2022–2025, ej ren driftstrend; dokumenterat.
- Räntetäckning (18,24/8,51) dokumenterad i notering — fältet är systematiskt
  osatt i hela universumet (109/109 null vid mätning) och lämnades null för
  konsekvens.
- aterkop/moat null (plattformskonventionen), golv osatt, serier utan
  egetKapital/fcf (0 av 115 rader bär dessa serier).

## Leverans 2 — llms.txt Dataset-sektion

Hela "## Dataset — branschmedianer"-blocket regenererat med projektets EGEN
`lasBranschMedianer` via jiti (samma kodväg som /api/llms-txt). Kördes två
gångar (före och efter strukturkollisionens omstart) — deterministiskt,
identisk utdata.

**MALLFÄLLAN, FJÄRDE FALLET — och kuringen den här gången:** syskonet u3:s
regeneration av blocket (för 115-läget) tappade den manuella aspektraden
`/dataset/finans/resultat-cagr-5ar` (u1:s rad, återställd i 63e230cc efter
fallet nr 3). Jag återställde den med en fundamental förbättring: talen tas
ur **aspektmodulens egen `generera("finans")`** — `aspektUrSlug("resultat-cagr-5ar")`
i samma process — så llms-raden kan ALDRIG skilja från sidan den länkar.
Nya tal (sidans egen kodväg): median **12,1 %** (var 10,4), kvartiler
**6,2–14,2** (var 4,8–13,7), **n=6** (var 5 — syskonet EQT.ST:s rad höjde
finans-täckningen), universum median 1,4 % n=83. Påståendet "universumets
lägsta datatäckning" togs BORT — tillväxt (n=4) har nu lägre täckning än
finans (n=6); påståendet beräknas nu ur datan i stället för att hårddkodas.

## Medianeffekt (isolerat, 113 → 115, mätt i speglad kopia utan mina rader)

- halso: P/E-median 24,8 → **24,7** (kvartiler 19,4–31,5 → 20,5–31,1, n 9→10)
- konsument: P/E 19,7 → **20,4** (kvartiler 16,9–22,1 → 17,5–22,4, n 11→12)
- totalt universum: median P/E 19,9 oförändrad, n 104 → **106**

## Koordinering (parallell omgång — våg 104-reglerna)

Syskonen i omgången: u1 = Vonovia (VNA.DE, fastighet, commit b51bb714),
u3 = Volvo + EQT + Axfood (VOLV-B.ST/EQT.ST/AXFO.ST — committade via u1:s
commit, "commit-race nr 4" dokumenterat av u1 i 62ea1bd0). Mina val kollide­rade
inte med någon. u3:s llms-regeneration (115-tal) i arbetsytan följde samma
kodväg som min — min omkörning gav IDENTISKA branschtal (determinism dubbelbevisad).

## STRUKTURKOLLISION — mitt live-fall av s2-u2 omgång 2:s dokumenterade fälla

Klockan 20:29:05 lokal tid raderades mina två rader ur arbetsytan: filen
återställdes till exakt HEAD-113 (syskonrader kvar, mina borta) medan
public/llms.txt (också modifierad) överlevde orörd. Tidsfönstret sammanföll
med (a) prod-synkens "NY KOD"-detektion 20:27:08 (loggen: 37c1f25b → 62ea1bd0,
därefter VÄNTAR-RAM) och (b) syskonet u3:s protokollfil dök upp som ospårad
(exakt då). Eftersom en full trädåterställning även hade rivit llms.txt pekar
bevisläget mot ett **stale helbuffert-skriv av JSON-filen** (syskonets sista
läsning = 113-läget), möjligen förstärkt av prod-synkens filrörande. Kur som
verkade: bevarat /tmp-skript kördes OM (idempotensguarden verifierade båda
tickers saknades igen — den grep:räddade omstarten), därefter commit i samma
fönster. Femte dokumenterade fallet av strukturen; huvudagentens kur-kö från
omgång 2 (prod-synken rör aldrig smutsiga spårade filer i NY KOD-läge /
fabriksbarn committar löpande) står kvar OCH tillkommer: syskon som skriver
helbuffert-filer (bolagsunivers.json) skall read-modify-write-committa innan
de påbörjar nästa fil.

## KVD-bevis

- Kontraktstest `testa-dataset-aspekter.mjs` (tsx ur npx-cache): **GRÖNT —
  162 sidkontroller, 0 fel**, 30 kända varningar (oförändrade).
- Läckagevakt `node verktyg/v98-dataset-vakt.mjs`: **GRÖN — 0 träffar,
  115 tickers + 115 namn i 1 419 utdatafiler** (dataset-ytan ×3 språk +
  RSC + segment, llms Dataset-blocket, sitemap/robots).
- `node node_modules/typescript/bin/tsc --noEmit`: **0 fel** (exit 0).
- Prod: `https://lab.ak1nvestor.com/` = **200**, `/dataset` = **200**.
- `aspektParametrar()` = **172 URL:er** — oförändrad uppsättning av mina rader
  (mätt i speglad HEAD-kopia vs arbetsyta: identiska listor; tillväxten
  171→172 tillhör syskonläget). Mina branscher ligger över alla gränsregler;
  halso-/konsument-sidornas nya medianer + 2 nya /bolag-sidor föds vid nästa
  prod-bygge (SSG läser datafilerna då).
- Körkanal notis: jiti klarar statiska TS-importer men verktygets dynamiska
  import() kräver tsx — löst via npx-cachens binär
  (`~/.npm/_npx/fd45a72a545557e9/node_modules/tsx/dist/cli.mjs`), ingen
  installation, projektets node_modules orörda.

## Skuld till nästa våg

1. Mallfällan är nu fyra fall gammal — kuren "tal ur aspektmodulens generera()"
   i mitt regen-skript (/tmp/s2u2-regenerera-dataset-block.mjs) förtjänar en
   permanent hem i verktyg/ (huvudagentens beslut).
2. "~33 '100-bolags'-formuleringar i src" (s2-u3:s ärvda skuld) — gällande
   tal nu 115 och växer.
3. eqt/volv/axfo/vna-rader levererades av syskonen — deras rapporter bokförs
   av dem (u1:s worklog-commit 62ea1bd0 dokumenterar racet).
