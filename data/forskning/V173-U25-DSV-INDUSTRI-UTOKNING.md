# V173 dataset-djup — U25: DSV A/S DSV.CO (Danmark/industri, +1 bolag) — AZN-kollisionen tagen av grunden

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 221 · **Föregångare:** U1–U24
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"

## DEL 1 — KOLLISIONSGRINDEN TRÄFFADE FÖRST (UK/hälsa-duon avbröts)

Rondens första kandidat var **Storbritannien/hälsa: GSK + AstraZeneca** (ny kontrasttyp
för vågen). Sonden träffade kollision på första körningen: **AZN.ST finns redan i
universumet** — AstraZeneca PLC levererad 2026-09-03 som AZN.ST (land=Sverige,
Stockholmsnoteringen som källa, SEK). Ingen leverans skedde; Sony/Honda-doktrinens
kollisionskontroll gjorde sitt jobb. **Läxa bokförd:** kollisionskontrollen måste söka
både primär- och sekundärnoteringar — AZN noterad LSE + Stockholm + NYSE-ADR.

**Ersättarkandidat med vågens renaste modellkontrast sedan freenet:** Danmark/industri —
Maersk (tillgångstungt integrerat containerrederi, äger flottan) + **DSV** (tillgångslös
fraktförmedling, hyr kapaciteten — post-Schenker världens största forwarder) =
**ägare-mot-hyrare-kontrasten** (freenet/Telekom-klassen).

## DEL 2 — KÄLLDATA (StockAnalysis CPH DSV, hämtat 2026-09-25, fyra paneler)

CPH-primär i DKK. Pris 1 235 DKK (föregående close; spann 1 182–1 247); mcap 282,23 mdr
på 238,77 M aktier. **P/E-bärarkontroll FÖRE leverans GRÖN (TTM-netto 6 869 M DKK > 0).**

**Kursbasfyndet (leveransens viktigaste observation):** källans mcap-rad (282,23) och
P/E-rad (39,25) bär äldre prisbaser än citatpanelen — mcap-raden motsvarar ≈1 182
DKK/aktie och P/E-raden ≈1 134 (nedre 52v-zonen). Replikerna 42,8 (pris/EPS) och 41,1
(GAAP mcap/netto) noterade öppet; **fälten bär källans egna rader** (E.ON/freenet-
precedenserna) och leveransen bärs av **TIO PRISNEUTRALA LÅS**: PS 0,9706 (0,97) ·
P/B 2,2403 (2,24) · **EV-dekompositionen 0,1 % REN** (282,23 + 95,53 − 10,06 = 367,70
mot 368,07 — Schenker-lånet syns i skuldposten) · netto-M 2,36 % · FCF-M 3,36 % ·
FCF-yield 3,46 % DUBBELT (källrad + 1/P·FCF 1/28,90) · D/E 0,76 · EPS×aktier = netto
0,4 % · payout 24,2 % (källrad 24,50) · FCF-serien.

**FCF-serien intern låst (HEI/Astellas-klassen):** OCF − capex = FCF exakt i samtliga
fem fönster (25 332 · 14 428 · 9 559 · 19 416 · 9 766 M DKK). En enhetsbugg (TTM-tupeln
mdr/M) fångades av grindsystemet FÖRE append — vågens femte, maskin före hand.

**Integrationsprofilen (datafakta, aldrig råd):** oms [235 665 · 150 785 · 167 106 ·
247 331] med Schenker-konsolideringen FY2025 +48,0 % och TTM +52,0 % (**förvärvsdriven —
basblandningen dokumenterad i fältet**); netto [17 568 · 12 315 · 10 109 · 8 095]
**fallande varje år** (fraktrecensionen + integrationskostnader; rak CAGR −22,8 % på
positiv bas); EPS [76,20 · 57,10 · 47,00 · 34,27]. Marknadens normalisering: fwd P/E
17,39 mot trailing 39,25 ⇒ implied EPS +126 % (konsensus +24,85 %/3 år — scenariot,
inte löftet). ROIC 7,17 % < WACC 7,82 % = integrationsårets finansiering (datafakta med
kontext). Altman 3,0 exakt gränsen · Piotroski 8 · beta 0,96 · räntetäckning 5,58 ·
utdelning 7,00 DKK (0,59 %) med FCF-payout 17,1 % · aktieantalet +3,86 % YoY (emission/
aktieprogram) ⇒ nyemission 1 dokumenterad · insider 9,77 % · 52v −10,76 % ·
**rappdag 2026-10-21 INOM v172-fönstret** — könotis.

**Cellmotivationen:** Danmark/industri 1→2 — två logikmodeller i samma cell: Maersk
äger flottan (kapitalbundet, cykelbart) mot DSV hyr kapaciteten (lätt balansräkning,
integrationsbart). Industri-cellen 26→27, Danmark 10→11, universum 286→287.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 286→287 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · tio lås + en enhetsbugg fångad FÖRE append |
| llms HELREGEN (diskdrivet) | GRÖN 287-läget · K2 round-trip · industri-raden n=27 (median P/E 27,8) · totalt n 274→275 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 287 bolag · 517 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (DSV.CO), kirurgisk append 286+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 287-läget
- `verktyg/_r221-u25-*.mjs` — sond×2/inlägg/avslut + llms-regen/lackagevakt
- `data/forskning/V173-U25-DSV-INDUSTRI-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 221-rad

## KÖ

1. Rappdagarna 10-20→11-04 → v172-kön: **DSV 10-21 · Astellas 10-30 · Kirin Q3 11-11**.
2. Fler celler: Storbritannien har fyra kvarvarande 1-grenar (energi/industri/konsument/
   teknik — hälsa tog AZN-kollisionen); Kanada energi/finans; Spanien finans/konsument.
3. Spårrotation enligt evighetskatalogen vid celltrötthet.

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; integrationsprofilens fallande netto och
normaliseringsscenario (+126 % fwd-implied) redovisas med sin natur (konsensusförväntan,
aldrig löfte); ROIC<WACC dokumenteras med kontext (integrationsåret) så fältet ej
feltolkas; AZN-kollisionen visar metoden: universumets integritet väger tyngre än
celltäthet. Analytikerlägen (Strong Buy) syndikeras aldrig.
