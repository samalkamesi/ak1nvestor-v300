# S2-U3 (auto-s2 omgång 2) — +3 svenska citeringsmagneter: Spotify, Skanska, Evolution

Fabriksagent s2-u3 (manifest auto-s2-1789470925967), 2026-09-15.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## OMSTART (försök 2, 13:57–14:0x) — förra försöket dog före commit

Föregående försök av samma uppgift (förmiddagen) gjorde hela jobbet —
forskning, dataskript (`/tmp/s2u3-lagg-till.mjs`), KVD — men dog före
`git commit`: bolagsunivers.json-ändringen föll bort när trädet
återställdes under 502-incidenten (kraschvaktens/prod-synkens
trädrengöring; de ospårade forskningsfilerna överlevde, den spårade
JSON-filen återställdes). Fabriken körde om manifestet 13:55. Denna
omstart ÅTERANVÄNDE det bevarade /tmp-skriptet (identisk data,
idempotensguard) och committade OMGÅENDE efter verifiering — läxan:
skriv → verifiera → commit i ett enda fönster, aldrig ligga med
ocommittade spårade ändringar när prod-synken/kraschvakten kan röra
trädet. All data nedan är oförändrad från första försökens research.

## Objektval (inga duplikat)

Föregående auto-s2-runda (06:43) levererade: TTM-aspekten (u1), universumfältet
på aspektlagret + P/E + P/B (u2), +3 energibolag → universum 103 +
universumjamforelse-hubben (u3). Denna rundas syskon valde (verifierat via
git diff på delad fil, se koordinering): u1 HSBC (finans +1), u2 Telenor +
Deutsche Telekom (kommunikation +2). Mitt val: TRE svenska bolag som alla
saknades och som är starka citeringsmagneter på en svensk plattform — i tre
ANDRA branscher än syskonens huvudfokus:

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| Spotify Technology S.A. | SPOT | kommunikation | Svenskgrundat, världens mest citerade strömmingtjänst — glupande cita­tionshål i universumet |
| Skanska AB (publ) | SKA-B.ST | industri | Svensk byggjätte, stor sökvolym, kompletterar industri-svenskarna (ABB/Atlas/Sandvik/SKF) |
| Evolution AB (publ) | EVO.ST | konsument | Svensk speljätte (B2B live casino), hög vinstmarginal — intressant pedagogisk kontrast i konsumentmedianen |

Universum: 103 → **106 (committat av mig)**. Syskonen u1 (HSBC, finans)
och u2 (Telenor + Deutsche Telekom, kommunikation) körde om samtidigt
(13:55) och landar sina rader i egna commits — vid deras klara läge är
universumet 109. Kommunikation 10→11 (→13 med syskonens), industri
10→11, konsument 10→11, finans 10→11 (syskonets).

## Data (reell, källhärledd — StockAnalysis/S&P Global, sid-as-of 2026-09-14)

Alla tre raderna följer universumets konventioner exakt: serier 2022–2025 (4
räenskapsår, 3 perioder), StockAnalysis-källa med paranoid-beskrivning,
härledningar dokumenterade per rad i `notering`-fältet.

- **Spotify**: pris 556,31 USD · börsvärde 114,37 mdr · P/E 30,58 (forward
  35,20 ⇒ prognostillväxt −13,1 %, implicit EPS-normalisering) · P/B 11,94 ·
  EV/EBIT 35,28 · ROE 44,5 % · ROIC 124,5 % (liten kapitalbas — redovisat
  ärligt) · serier i EUR (rapportvaluta). resultatCAGR OSATT (startåret 2022
  negativt — teckenväxling), peg OSATT vid negativ prognostillväxt
  (Ørsted-precedens). land=Sverige enligt huvudortskonventionen
  (Kambi-precedens; bolaget registrerat i Luxemburg).
- **Skanska**: pris 262,80 SEK · börsvärde 108,61 mdr · P/E 16,41 (forward
  14,80 ⇒ +10,9 %) · P/B 1,76 · EV/EBIT 13,77 · ROE 11,1 % · låga marginaler
  (brutto 8,9 %, EBIT 3,9 %) med jämförbarhetsnot — branschnormalt för
  byggkoncerner. Allt i SEK. FCF negativt 2022, positivt därefter.
- **Evolution**: pris 890,60 SEK · börsvärde 169,86 mdr · P/E 15,15 (forward
  13,60 ⇒ +11,4 %) · P/B 3,62 · EV/EBIT 12,04 · ROE 26,7 % · EBIT-marginal
  57,8 % · serier i EUR. Bruttomarginal 100 % = källans konvention (netto
  av spelavgifter). Augusti 2026:s offentliggjorda uppköpserbjudande (Candle
  Lake ~695 SEK/aktie) noterat som marknadskontext — inget värdeomdöme.

## Medianeffekter (mätta med projektets EGEN kod raknaBranschMedianer)

| Bransch | Före | Efter (106-bolagsuniversum, mätt av mig) |
|---|---|---|
| Universe­median P/E | 20,4 (n=94 av 103) | **20,4 (n=97 av 106)** |
| Industri P/E | 28,4 (n=10) | 28,3 (n=11), kvartiler P25–P75 20,2–36,1 (Skanska vidgar nedåt) |
| Konsument P/E | 19,7 (n=9) | 18,9 (n=10), kvartiler 16,2–22 (Evolution drar ned medianen) |
| Kommunikation P/E | 21,8 (n=8) | 21,9 (n=9), kvartiler 13,1–30,6 (Spotify lyfter P75) |
| Finans (syskonets HSBC) | 13,4 (n=10) | oförändrat i min commit — syskonets rad landar i dess egen |

Kvartiler + universumjämförelse behövs INTE byggas manuellt: hela
datasetlagret (19 aspektmoduler × branscher, /dataset-sidorna,
/data/nyckeltalsguide, JSON-LD, /api/llms-txt) räknas ur bolagsunivers.json
vid bygget — nya rader flödar automatiskt in i medianer, kvartiler och
universumjämförelser. Bonus: våg 149:s /bolag/{slug}-lager får tre nya
programmatiska bolagssidor gratis (spot, ska-b-st, evo-st). Sitemap följer
registret automatiskt.

## llms.txt

`public/llms.txt` regenererad ur projektets EGEN kod (lasBranschMedianer
+ exakt mall ur seo.tsx, u2:s bevisade mönster): 106 bolag · totalt median
P/E 20,4 (n=97) · branschrader omräknade (kommunikation/industri/konsument
nya tal + kvartiler). llms-full.txt bär inga dataset-tal — orörd.

## Koordinering (delat träd — fabrikens kända lek)

Syskonen u1/u2 körde om samtidigt (13:55). Vid min skrivning (13:58) hade
inget syskon ännu skrivit bolagsunivers.json (verifierat: 0 av
HSBA/TEL/DTE i trädet efter min append) — min read-modify-write trampade
alltså ingen. Idempotensguarden (skip befintlig ticker, append i slutet)
skyddar om ett syskon skriver före en framtida omkörning. Strategin denna
gång: applicera → verifiera → commit i ETT fönster, så att varje commit
är självbärande (trädet växer monont; syskonens commits bygger ovanpå).

## DRIFTFYND under första försöket: prod nere + kraschvaktens autonomi

*(Historik från försök 1, 13:29–13:34 — behålls för huvudagenten.)*

Vid prod-kontrollen (~13:29 lokal) svarade sajten **502**: port 3000 utan
lyssnare, pm2-crashloop ("Could not find a production build in the '.next'
directory" = .next bortstädad av ett avbrutet bygge), prod-synkens logg tyst
sedan 11:33 (fastnade mitt i "NY KOD"-detektering). **Ingen manuell åtgärd
krävdes**: kraschvakten (våg 137, ropas av pumpor xx:4) detekterade
kraschloopen 13:34:10 lokal och startade RÄDDNINGSBYGG (stopp → rm .next →
npm ci + build under deploy-låset → restart → 200-verifikation) helt
autonomt — systemet botade sig själgt inom sina designade 10-minutersrutor.
Slutverifikation nedan är gjord EFTER läkning. Notering till huvudagenten:
prod-synkens 2-timmars tystnad från 11:33 förtjänar en titt (loggen slutar
mitt i detekteringen — kanske en hängd git-operation); kraschvakten dolde
felet genom att läka, men rotorsaken till det avbrutna bygget är oidentifierad.

## KVD-bevis

- **Läckagevakt 0**: `npx tsx verktyg/testa-dataset-aspekter.mjs` = GRÖNT,
  0 fel, 160 sidkontroller — bolagsvakten läser bolagsunivers.json dynamiskt
  (nu 106 namn/tickers förbjudna, mina tre inkluderade) och hittar 0 träffar;
  kontrakt + juridikgrind gröna. (v98-dataset-vakten kräver `next build`-
  utdata och ägs av prod-synken — körs vid nästa byggslag.)
- **Kvartiler + universumjämförelse**: verifierade via lasBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **tsc**: `npx tsc --noEmit` = 0 fel, mätt direkt denna omstart (13:59).
- **prod 200**: `https://lab.ak1nvestor.com/` och `/dataset` = 200 (14:00).
- **R2**: priser/tier/publicering orörda; allt är utbildningsdata med
  disclaimers enligt kontraktet §5; inga rådsformuleringar (vit-testet vaktar).

## Filägarskap

- Exklusiva: data/forskning/S2-U3-BOLAGSUTOKNING-OMG2.md (denna), /tmp-skript
  (/tmp/s2u3-lagg-till.mjs från försök 1, /tmp/s2u3-llms.mjs ny denna omstart —
  föroppnar ej repot).
- Delade (read-modify-write/regenererad): data/portfolj-system/bolagsunivers.json,
  public/llms.txt, worklog.md (append).
