# S2-U3 FRANKRIKE|INDUSTRI-UTÖKNING OMG34 — THALES HO.PA + DASSAULT AVIATION AM.PA + ALSTOM ALO.PA (fabriksagent s2-u3, manifest auto-s2-1790861711679)

**Uppgift:** "Utöka dataset nästa i spåret: +3 bolag, kvartiler +
universumjämförelse, läckagevakt 0, prod 200." · **Leverans:** 2026-10-01 ·
**Protokollförfattare:** s2-u3-byggaren (denna agent).

## SAMMANFATTNING

Universum 330→333 med mina tre rader (diskens slutläge 334 med syskonet
u1:s omappade Celltrion-rad ovanpå): **Frankrike|industri 5→8** — cellen
 hade nått mattan 5 genom syskonet u2:s Schneider+Legrand (commit
0fde4472e, samma manifestomgång); mina +3 tar den till 8 och gör
**/dataset/industri/frankrike till en av universumets folkrikaste
landsidor vid nästa gröna bygg** (Vonovia-precedensen: sidan föds
datadrivet ur frankrike-modulen i src/lib/dataset-aspekter/land.ts — omg21,
generisk per bransch, INGEN src-ändring; kontraktstestets sidkontroller
189→190 BEVISAR födelsen i data).

Cellens pedagogik efter omgången — ÅTTA industriella arketyper i EN cell:
flygkroppen (Airbus) + motorn (Safran) + kretsloppet (Veolia) +
elektrifieringen ×2 (Schneider, Legrand — syskon) + **försvarselektroniken
(Thales) + stridsflyget (Dassault) + tågen (Alstom)** — min trio. Valdetalj:
omrustningserans tre citeringsmagneter, samtliga EPA/EUR (AIR.PA-
precedensen), alla med orderbok-serier i källan (försvars-/järnvägs-
backlog = cellens signaturdata).

**INDUSTRI efter omgången (median, kvartiler P25–P75):** P/E 28,21
(21,70–34,47, n=36; före 28,25/20,88–35,12, n=33) · P/B 4,79→4,68 ·
EV/EBIT 19,67→18,85 · EBIT-marginal 13,9→13,0 % · FCF-marginal 11,6→11,8 %
· omsättningstillväxt 5,2 % oförändrad · **resultat-CAGR 4,5→6,8 %/år
(n 27→29 — Thales +11,4 % och Dassault +12,7 % bär; Alstom NULL enligt
negativ-start-konventionen)** · ROE 19,1→18,8 · ROIC 13,2→12,6 %.
**UNIVERSUM:** 333 (mina) median P/E 19,68→19,73 (n 317→320); diskens
334-läge (med Celltrion): 19,7 (n=321) — llms-regenens tal bekräftade av
min oberoende replik.

## VAL-ANALYS (anspråk disk-först 14:17:44Z, FÖRE hämtning)

Cellmatrisen vid start (328-trädet): sex celler på 3, inga på 4 — +3 i en
3-celle når mattan 6. Kollisionskontroll: HO/AM/ALO + namn = 0 träffar i
universumet, worklog, llms. Syskonanspråk lästa FÖRE append: u2 (14:14Z,
FÖRE mitt) hade valt SAMMA cell med Schneider+Legrand — deras duo + min
trio = konvergent cellval utan tickerkollision (OMG33-mönstret "deras
rader deras ägo"); u2:s anspråk namngav Thales som opreciserad
pivot-reserv som ALDRIG togs — min anspråk (3,5 min senare) tog trion
öppet. u1 (14:16Z) valde Sydkorea|hälso (Celltrion) — skild yta.

Alternativ som lämnades: Kanada|material (royalty-trion, cell även på 3),
Japan|halso, Kanada|kommunikation, Italien|energi — samtliga dokumenterade
i anspråket för syskonens nästa omgångar.

## KÄLLOR OCH KANON

StockAnalysis EPA-vägen × fem ytor × 3 bolag (15 lyckade curl-hämtningar
2026-10-01; S&P GMI-underlag; kanon: verktyg/_s2u3o34-kanon.mjs →
/tmp/{thales,dassault,alstom}-kanon.json — s2u2-mönstret ordagrant ur
html, sammanfattningslagret kasseras). **Pris-måltals-fällan fångad ×3:**
grep:ens första €-tal (293,32/360,65/21,10) var källans Price Target —
riktiga kurser ur huvudelementet: **Thales 224,40 · Dassault 282,80 ·
Alstom 15,32 EUR** ( dokumenterat i paranoid).

## FYND PER BOLAG (tal i paranoid, här urval)

- **THALES:** Defence = 56,8 % av omsättningen (12 969 av 22 821 M€ TTM);
  orderbok 53 323 M€ = 2,41× årsomsättningen (backlog-serien +53 % på fyra
  år); FCF-marginal 17,54 % > netto 6,55 (orderförskotten: obförd intäkt
  12 480 M, working capital −4 530 M — kunderna finansierar tillverkningen);
  ROIC-gap +18,02 pp; bruttomarginal fem raka stigande; kurs −15,6 % 52v
  UNDER båda MA medan orderboken växer (kvartilpedagogikens kontrastfall).
- **DASSAULT:** NETTKASSA 9 914 M€ = 127,60 EUR/aktie = 45,1 % av kursen —
  EV 11,97 mot mcap 21,88 (kassan halverar företagsvärdet; EV/EBIT 10,18
  mot P/E 21,97 = basisvalens pedagogik); orderbok 46 596 M€ = 6,14×
  årsomsättningen (cellens högsta täckning); netto-M 11,29 > EBIT-M 8,67
  (räntenettot = den andra fabriken); FY23:s OCF −673 M mot FY22 +5 110
  (avanceringsflödets timing); float 21,5 % (familjeholding-blocket).
- **ALSTOM:** VÄNDNINGSÅRET — P/E 24,93 mot fwd 8,87 (prognos +181 %,
  Sartorius-klassen); resultatserien −581→+280 M€ (resCAGR NULL, BASF-
  klassen); P/B 0,64 = GRENENS LÄGSTA (rang 1/36) = substansrabatt 36 %
  mot ROIC-gap −3,62 pp (negativt — integrationens arv, ärligt bokfört);
  orderbok 104 412 M€ = 5,45× (cellens största i absoluta tal); netto-skuld
  halverad; aktiebas +23,7 % (nyemission 2023, nyemissionerSenaste5ar=1);
  utdelning återfödd 0,25 EUR; **bokföringsår april–mars med årsetikett =
  slutår — universumets ANDRA brutna räkenskapsår (BHP-precedenten)**;
  källans mcap-bas = prev close 14,96 (mot dagskurs 15,32 — dokumenterad).

## ARITMETIKGRIND (63/63 GRÖN FÖRE skrivning)

Första körningen 55 PASS / 8 FEL — grunden fångade egna fel (nyttovalt-u1:s
mönster): (1–3) tre grindbuggar i MIN kontrollkod: B/M-suffix-enheterna i
st-ytorna (5.58B tolkades som 5,58 M), EV-identitetens minoritetsterm
saknades (Alstom 121 M€), ESM-låsrensare (require i .mjs); (4) en REELL
precisionsrättning: Dassault omsCAGR 0,0086→0,00857; (5) Alstoms
dokumenterade kursbas 14,96 lagd i grunden. Andra körningen: 63/63.
Kontroller per bolag: mcap-replik, P/E-replik, EV-identitet (mcap+skuld−
kassa+minoritet — EXAKT ×3), P/B, D/E, FCF-identitet, fcfYield, fcf-/
brutto-/EBIT-/netto-marginal, omsCAGR, prognosTillväxt (pe/fwd−1), peg,
resCAGR/null-regeln, fcmått-serier, moat-medel/spread, utdelning-betald,
nyemissionsflagga, serielängder.

## RACES OCH TRÄDÅTERSTÄLLNINGEN (ärligt bokförd)

1. Första appenden kördes på 331 (u1:s då ocommittade Celltrion ovanpå
   u2:s 330-disk) → 334. Därefter återställde kraschvakten/prod-synken
   trädet mot HEAD (byggfönstret, minnesklassen 2026-09-29): mina 3 rader
   OCH u1:s Celltrion raderades; u2:s duo överlevde via sin commit
   0fde4472e. KUR (OMG32-läxan): append-skriptet är idempotent → omkörning
   330→333 + OMEDELBAR skyddscommit — AMENDERAD till kirurgisk diff
   (406+/0−; första versionen bar hel-fils-formateringsdiff: min serializer
   skrev indent 1 mot filens kanoniska 2 — värde-identitet maskinverifierad
   före amend: 330 gamla rader JSON-identiska).
2. u1 omappade Celltrion (334) + regenerationerade llms.txt på 334-läget —
   deras ocommittade arbete på den DELADE ytan lämnas åt deras commit;
   deras regen verifierad mot min oberoende medianreplik (industri 28,2/
   21,7–34,5/n 36, totalt 19,7/n 321, hälsa med Celltrion-tal) —
   determinism dubbelbevisad.
3. Låsmekaniken: /tmp-lås + Atomics.wait; spirrande låsfil från ESM-buggen
   städad; omkörning bevisar idempotens ("ingen ny skrivning").

## KVD (fullständigt)

- **Läckagevakt v98:** GRÖN — 334 tickers + 334 namn, 0 träffar i 1 762
  utdatafiler.
- **Kontraktstest:** GRÖNT — 190 sidkontroller / 0 FEL / 30 kända
  varningar (189→190 = frankrike-industri-födelsen i data; omgångens
  gemensamma bedrift med u2:s matta-rad).
- **tsc:** 0 fel via projektbinär (src orörd, INGET bygge — data-only).
- **prod:** 200 ×5 (/, /dataset, /dataset/industri, /llms.txt,
  /api/data/nyckeltalsguide); /dataset/industri/frankrike = 404 tills
  nästa gröna bygg (Vonovia-precedensen — byggen ägs av prod-synken).
- **llms.txt:** servat "på 334 bolag" = disk live round-trip; 311-
  regressionen (v221-mergeens PROD-sida) LÄKT. /dataset-sidornas ISR-
  cache bär fortfarande 328-läget (medianerna sammanträffar avrundat —
  ärligt bokfört; ISR-cykeln för in 334-läget).
- **R2 orörd:** priser/tier/publicering orörda; data/blogg/ orörd (inga
  utkast behövdes — ren datasetleverans).

## KÖ-NOTISER TILL NÄSTA OMGÅNG

- Kanada|material 3 (royalty-trion FNV/WPM/IVN — cellen på 3, +2 når
  mattan) · Japan|halso 3 (Eisai/Chugai/Otsuka) · Kanada|kommunikation 3 ·
  Italien|energi 3 (Snam lämnad where u3:noterade dubbelprofil).
- Frankrike saknar fortfarande: tillväxt + nyttovalt (12 grenar; 36 bolag).
- Läxan att bära vidare: append-serialiserare MÅSTE skriva filens
  kanoniska indentering (indent 2) — hel-fils-diff döljer kirurgin.

## FILER

- data/portfolj-system/bolagsunivers.json (+3 rader; commit 518e39c2a)
- verktyg/_s2u3o34-kanon.mjs · _s2u3o34-rader.mjs (innehåller grinden) ·
  _s2u3o34-append.mjs
- data/vakten/auto-s2-1790861711679-s2-u3-ansprak.md (disk-först)
- detta protokoll + worklog-rad
