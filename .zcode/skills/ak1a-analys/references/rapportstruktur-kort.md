# Rapportstruktur — Kort-nivån (storbolag)

Standard: 13 sidor. Samma designsystem (`assets/rapport.css`), samma 5×5×4-genomslag men komprimerat: horisonterna paras två och två, teorierna får boxar i stället för egna sidor. Femte teorin = **Intermarket** (valuta, räntor, konjunktur) — inte Lucas. Pedagogisk ton: `beginner-box` (förklarar termer) och `analogy-box` (vardagsliknelser) är bärande element.

## Sidkarta

| Sid | Innehåll |
|---|---|
| 1 | Omslag (mörk): bolag, ticker, rekommendationsbadge, KPI-rad |
| 2 | "Det viktigaste i korthet" — rekommendation, tre skäl, tre risker, brytpunkter |
| 3 | "Innan du börjar — läs detta" + "Vad gör [bolaget] — och hur går det?" (verksamhet, intäkter, kassaläge på vanlig svenska) |
| 4 | "Så fungerar AK1A-ramverket" — 5 horisonter (`horizon-grid`), 5 teorier i tabell, beginner-box + vädertjänst-analogin |
| 5 | Marknadssnapshot: KPI-rader (pris, YTD, direktavkastning, P/E, RSI, volatilitet) + prisstatistiktabell (52v, SMA 20/50/200, ATR, drawdown) + tekniskt läge i löpande text |
| 6 | Mikro & Kort: Elliott-box + Fibonacci-box (etc. i `two-col`) med Våg/Pris/Tid/Brytpunkt per box |
| 7 | Medellång: teori-boxar + sammanvägning |
| 8 | Lång & Mega: cykelposition, sekulära drivkrafter |
| 9 | Fundamental analys: "vad får du för pengarna?" — multipel, utdelning, kassaflöde vs peer |
| 10 | Tre scenarier (`scenario-grid`: Bull/Base/Bear med pris, sannolikhet, beskrivning) |
| 11 | Topp 5 risker (risk-cards med sannolikhet × påverkan) |
| 12 | Rekommendation: dom + motivering + entry/stopp/mål i tabellform |
| 13 | FAQ + ansvarsfriskrivning i komprimerad form |

## Ton och nivå

- Skriv som till en placerare som kan läsa en nyckeltalstabell men inte vill deklarera lognormalfördelningar: konkreta tal, förklarade termer, alltid horisontangivna påståenden.
- Varje påstående om riktning får horizonsetikett + brytpunkt — komprimerat 4D ("Brytpunkt: fall under 336 ogiltigförklarar impulsen").
- Kvantspåret förenklas: scenarier med sannolikheter behålls, MC/Bayes/Kelly nämns som underlag i en ruta i stället för egna sidor (fulla beräkningar kan köras med `scripts/` och refereras).
- Intermarket-läsningen är alltid med: valuta (exportörer), räntor (flernivå), konjunkturindikatorer, relevanta råvaror.

## Skillnader mot Avancerad-nivån (checklista)

- 5 teorier med Intermarket i stället för Lucas; tidscykel-djupet (Lucas/GANN-kalendrar) kan reduceras till en not.
- Ingen Del-numrering; sektioner heter som ovan.
- Ordlistan integreras i löpande text (beginner-boxar) i stället för egna sidor.
- Ansvarsfriskrivningen behålls i helhet (regel 1 gäller alla nivåer) — komprimerad layout.
- Valideringslogg förs precis som på Avancerad-nivån (regel 7).
