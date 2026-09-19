# S2-U1 DATASET-DJUP: FAST RETAILING 9983.T — JAPAN/KONSUMENT (omg18)

**Manifest:** auto-s2-1789806329851 (byggare 1/3) · **Anspråk:** 2026-09-19 08:30 UTC
(data/vakten/auto-s2-1789806329851-s2-u1-ansprak.md — klaim FÖRE arbetet,
E29-precedensen) · **Leverans:** 2026-09-19 (universumraden buren av syskon-u2:s
commit 32ad80be — BASF-precedensen "skrivet=ägt, burit=bokförd"; denna commit =
skript + protokoll + worklog, omg16-u2:s doc-leverans-mönster).

## SAMMANFATTNING

Universum 195→196 i mitt fönster med +1 rad (Japan/konsument 1→2). I trådet:
syskon-u2:s GSK.L+ULVR.L landade under fönstret ⇒ 198 totalt; u2:s commit bar
min färdiga rad ride-along (deras meddelande: "syskon-u1:s 9983.T på disk vid
append — deras ägo, BASF-precedens") — slutinvariant universum == llms ==
HEAD == prod == 198 bevisad (diff tom, prod llms "på 198 bolag" LIVE).

**JAPAN/KONSUMENT-CELLEN 1→2:** TM (Toyota, P/E 8,3) + 9983.T (Fast
Retailing/Uniqlo, P/E 40,0) — Japens två globala konsumtionsvarumärkesjättar
i EN cell; kvartilbredden 8↔40 = cellens P/E-pedagogik (cykelkapital mot
varumärkeskapital).

## PIVOTEN: SONY → FAST RETAILING (sond FÖRE bygg, DOW/APD-fällan)

Första valet var Sony 6790.T (anspråkets original-koordinat Japan/konsument).
Sonden träffade FÄLLAN: ADR-sidan stockanalysis/stocks/sony visar EPS TTM
−0,23 USD, netto −1,36 mdr USD — P/E n/a (förlustår), och TYO-sökvägen
/quote/tyo/6790/ existerar ej (HTTP 404). Spårets P/E-bärande-kriterium
(omg17:s valanalys) ⇒ Sony AVVISAD EFTER sond, före bygg — pivot till Fast
Retailing 9983.T (TYO-vägen bevisad via 8035.T omg17, sonderad HTTP 200),
samma koordinat. Anspråket uppdaterat 08:4x UTC FÖRE dataarbetet. Sony-fyndet
i sig är notisvärt: källan bär ett TTM-förlustår för Sony — raden skulle
hamnat i null-P/E-klassen (ORSTED/KINV/KLAR), exakt det spåret avvisar.

## KÄLLOR

StockAnalysis /quote/tyo/9983/ (översikt + statistics + financials; underlag
S&P Global Market Intelligence + Fiscal.ai), TSE-slutkurs 2026-09-18 15:30
JST, sidor pålästa 2026-09-19. Financials i M JPY, FY september–augusti med
slutårsetikett (FY2025 = sep 2024–aug 2025). webReader-pipelinen nere (500)
vid hämtningen — WebFetch-kanalen användes (SONY-ADR-sonden + statistics +
financials), översiktssidan via curl.

## KONVENTIONER + FYND

- **Aritmetikgrinden** (abort FÖRE skrivning, omg13-läxan): 22 kontroller —
  FÖRSTA körningen aborterade på 2 egna fel (mcap-replik 20 767,608 mot
  slarvigt 20 767,55; direktavkastning 0,9456 % mot 0,9450) — omg16-mönstret
  "grinden fångar egna fel FÖRE disk", rättade och omkörd 22/22 GRÖN.
- **Superlativtestet** (omg14-regeln) fångade FYRA överdrifter i noteringen —
  patchat med verifierbara former innan leverans: "universumets bredaste
  ROIC-klyfta" → ROIC-rank 17/176 (inte topp!); "insiders-andel universumets
  högsta" → källans tal utan rank-påstående (insider-andelar ej fält i
  universumet ⇒ overifierbart); "grenens dyraste efter LVMH-blocket" → näst
  dyraste efter RACE 41,8 (LVMH P/E är 20 — LVMH-blocket var ett minnesfel);
  "P/B grenens högsta efter ITX" → sjätte högsta (RACE 18,7 · KO 10,6 · ITX
  9,3 · PEP 8,4 · HM 8,1). Patch-skript med innehållsintegritetsbevis: 8
  fraser, radantal 198→198, ENBART 9983.T-raden förändrad, alla andra rader
  byte-identiska.
- **Källspridningar dokumenterade** (HEN3/JNJ-klassen): P/B 7,39 (mcap/EK
  20 767,6/2 810 = 7,391) mot pris/BVPS 7,61 (BVPS-fältet bär vägt
  aktieantal ~315,9 M); payout källans 34,22 % mot DPS/EPS-replik 37,8 %;
  EV/EBITDA källans 21,43 mot rå replik 25,2 (−15 %, lease-justerat
  underlag); EV-enkel mcap−nettokassa 19 471,8 mot källans EV 19 548,9 — gap
  77 mdr JPY = minoritetsposter (EMBJ/VW-mönstret); EV-nivån dubbelbevisad
  via EV/EBIT 27,51 (replik 27,52) OCH EV/Earnings 37,60 (replik exakt).
- **Signaturtal:** marginaltrappan brutto 50,35→53,78 % (FY21→25) med TTM
  54,66; EBIT 11,94→18,45; netto 7,96→13,51 — fem raka marginalår på
  omsättning +13,9 %/år (resultatCAGR +26,4 %/år); ROIC 37,51 % mot WACC
  6,53 % = gap +30,98 pp (koncernen tjänar 5,7× kapitalkostnaden);
  NETTOKASSA 1 295,7 mdr JPY, räntetäckning 52,35× (BEI 56,9-klassen),
  Altman Z 9,14; prognosTillväxt +8,5 % TTE (39,99/36,87) ⇒ PEG 4,73 spår-
  konvention (källans 3,16 på 3-års intäktstillväxt +12,81 %/år); Yanai-
  familjen 38,77 % (källans insiders-andel); beta 0,45; 52-v +42,25 % men
  −23,6 % från toppen 88 690; FY-serierna FY2021–2025 med FY-EPS +60,9/+8,3/
  +25,5/+16,4 %.

## MEDIANER (EXAKT raknaBranschMedianer-replik; mittersta-par, linjär percentil, runda1)

| Mått | FÖRE (195) | EFTER +1 (196) | TRÅD slut (198, u2:s GSK+ULVR) |
|---|---|---|---|
| Totalt median P/E | 21,2 (kv 14,6–30,6, n 185) | 21,2 (kv 14,6–30,7, n 186) | **21,1** (u2:s KVD: "21,2→21,1" på 198) |
| Konsument P/E | 18,1 (kv 15,3–22,2, n 26) | 18,2 (kv 15,4–22,4, n 27) | **18,2** (u2:s KVD: "18,1→18,2" — min rad är drivaren) |
| Konsument P/B | 2,9 (kv 1,4–6,8) | 3,1 (kv 1,5–7,1) | u2:s llms bär slutläget |
| Konsument EBIT | 13,6 % | 13,7 % | — |
| Konsument FCF | 8,1 % | 8,6 % | — |
| Konsument ROE | 17,5 % | 18,4 % | — |
| Konsument resCAGR | 2,7 % (n 24) | 3,1 % (n 25) | — |
| Totalt resCAGR | 3,9 % (n 155) | 4,0 % (n 156) | — |

**Universumjämförelseraden (uppgiftens kärna):** FR 39,99 mot konsumentmedianen
18,1 — över grenens P75 22,2, grenens näst dyraste efter Ferrari (41,8); P/B
7,39 = grenens sjätte; totalt universum P/E 21,2: FR i övre kvartilen (P75
30,7) men långt från extremerna (TSLA 334 · PLTR 154).

## LANDMATTA (P/E-mätta celler)

Japan/konsument 1→2 (MIN_MATTA=5 kvar — cellen föder ingen aspektsida i denna
omgång, medvetet: u1-brickor öppnar inte ytor, det är u3:s melodi). Japan efter
fyra rader: konsument/TM + konsument/9983.T + kommunikation/NTDOY + teknik/
8035.T. Celler på matta 3–4: INGA (195-läget hade inga; +3 hos u3 fyller
Australien/material 2→5 enligt deras anspråk).

## KVD (kvalitetsverifiering)

- **Aritmetikgrind:** 22/22 GRÖN efter att grinden fångat 2 egna fel i första
  körningen (abort FÖRE skrivning).
- **Superlativpatch:** 8 fraser, innehållsintegritet bevisad (endast min rad
  förändrad, radantal 198→198).
- **Läckagevakt v3:** GRÖN — 0 träffar, 347 sökningar (198 namn + tickers) i
  dataset-html + llms Dataset-sektionen.
- **(v98-dataset-vakt:** u2 körde på slutläget 198+198 i 1 559 filer —
  inkluderar min rad — deras KVD, GRÖN.)
- **Kontraktstest (vit-test):** GRÖNT — 181 sidkontroller, 0 fel, 30
  förhandsvarningar (exakt omg17-baslinjen; ingen ny sida ⇒ inga nya kontroller).
- **tsc:** 0 FEL via projektbinär (node node_modules/typescript/bin/tsc
  --noEmit). src/ EJ rörd av mig (ingen landsida, ingen land.ts-modul) ⇒
  INGET bygge (Vonovia-precedensen); u2:s prod-bygge äger leveransen.
- **Prod 200 ×5:** / · /dataset · /dataset/konsument · /api/data/
  nyckeltalsguide · /llms.txt — och llms LIVE "på 198 bolag" round-trip:
  disk == HEAD == prod.
- **R2 orörd · data/blogg/ orörd · src/ orörd · anspråksfil ej stagad
  (gitignorad — omg14-epilogens läxa).**

## RACE-BOKFÖRING

u3:s anspråk (Australien/material FMG+NST+S32) lästes FÖRE mitt val —
noll koordinatkollision. u2:s anspråk saknades vid mitt val; deras val
(GSK+ULVR, två UK-cellöppnare) kolliderar inte med Japan/konsument. Min rad
landade på disk först (195→196); u2:s append hoppade min rad (deras skripts
idempotensguard) och lade GSK+ULVR ovanpå (196→198); deras commit 32ad80be
(10:45 lokal) bar ALLT — min rad + deras + llms-regen 198 (konvergens med min
regen: deras KVD rapporterar samma medianer). Ägarskap: 9983-raden + mina
skript/protokoll = s2-u1 (denna commit); GSK/ULVR-rader = s2-u2 (deras).

## FIFO-NOTISER (rapportkalender)

9983.T nästa rapp **torsdagen 2026-10-08** (Q4 FY2026 — bland universumets
tidigaste oktober-rappdagar; GS 10-13, ABB 10-20). Konsumentcellen Japan har
inget fler rapporttryck i oktober (TM rapporterar i november). Nästa omgångs
koordinat-förslag: Japan/teknik 1→? eller Japan/finans 0→1 (MUFG 8306.T —
TYO-vägen sonderad HTTP 200 i denna leverans) för Japens femte gren; alternativ
Nederländerna/teknik (ASM+ASML+tredje) — men u3:s Australien-anspråk gäller
fortfarande om deras append ännu ej landat.

## LEVERANS

- data/portfolj-system/bolagsunivers.json: +1 rad 9983.T (buren av u2:s commit
  32ad80be ride-along — BASF-precedensen; min äga, deras bärning bokförd här)
- public/llms.txt: Dataset-block 198 (min regen konvergerade byte-identiskt
  med u2:s; buren av deras commit)
- verktyg/_s2u1omg18-append-9983.mjs (append + aritmetikgrind + superlativtest
  + medianer + landmatta; speglar de patchade texterna)
- verktyg/_s2u1omg18-patch-notering.mjs (superlativpatchen med
  innehållsintegritetsbevis)
- verktyg/_s2u1omg18-llms-regen.mjs + verktyg/_s2u1omg18-lackagevakt.mjs
- data/forskning/S2-U1-9983-FAST-RETAILING-UTOKNING-OMG18.md (detta)
- data/vakten/auto-s2-1789806329851-s2-u1-ansprak.md (uppdaterad EFTERLEVERANS;
  gitignorad — ej stagad)
- worklog.md (bokföringsrad)
