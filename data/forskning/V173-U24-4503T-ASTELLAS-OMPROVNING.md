# V173 dataset-djup — U24: ASTELLAS PHARMA 4503.T (Japan/hälsa, +1 bolag) — OMPRÖVNINGEN LEVERERAD

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 220 · **Föregångare:** U1–U23
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"

## DEL 1 — OMPRÖVNINGARNA (rondens direktiv)

**Astellas 4503.T — VÄNDNINGEN KONFIRMERAD ⇒ LEVERERAD.** U17 avvisade Astellas på
P/E-bärarkriteriet med mätvärdet TTM −47 mdr JPY (patentklippur + nedskrivningar).
Dagens färskpanel (S&P Global Market Intelligence, uppdaterad 2026-09-24; fyra paneler,
cache-bypass): **TTM-netto +364,9 mdr JPY (+347 %)** med HELA FY-serien positiv
[124,1 · 98,7 · 17,0 · 50,7 · 291,5 mdr] — något negativt fönster finns ej i panelen.
**Ärlighetsdokumentationen:** U17:s avvisning var korrekt mot sitt underlag; dagens
leverans är korrekt mot sitt — mätvärdet bokförs som supersederat av källpanelens
uppdatering, och kedjan (avvisning → villkor → konfirmation → leverans) är protokollets
kärna. Marginalerna i normal ordning (netto-M 16,05 % < EBIT-M 20,79 % — Kirin-U3-fallets
kontroll gjord innan leverans).

**Kirin 2503.T — HUVUDKRITERIET URVÄRDERAT, LEVERANS SKJUTEN.** U3 avvisade Kirin på
engångspostsignaturen: netto-M 16,86 % > EBIT-M 12,56 % (Fancl/Myanmar-kontexten).
Dagens färskpanel: **signaturen är BORTA** (netto-M 7,81 % < EBIT-M 11,76 %, normal
ordning) med TTM-netto +196,4 mdr JPY och omsättning +5,7 %. Kvarstår: netto +264,9 %
-hoppet och fwd P/E 12,78 > trailing 11,60 (marknadens normaliserade EPS-förväntan
−9,2 % — mot −26,5 % i U3). **DOM:** leverans skjuten till Q3-rapporten 2026-11-11
(nästa bekräftade rappdag) — ett helt normaliserat TTM-fönster utan signaturer
godkänns då utan förbehåll. Fyndet bokförs: U3:s huvudkriterium var rätt fråga och
panelen har rört sig i normaliserad riktning.

## DEL 2 — KÄLLDATA (StockAnalysis TYO 4503, hämtat 2026-09-25, fyra paneler)

TYO-primär i JPY; april–mars-bokslut (serien märkt räkenskapsårets slutår). Pris
2 359 JPY (föregående close — källans P/E-rad låser mot den; öppning 2 389, spann
2 379–2 413); mcap 4 230 mdr JPY på 1,79 mdr aktier.

**Nio replikeringslås:** P/E 11,62 EXAKT mot close-basen (0,01 %) · PS 1,86 EXAKT ·
P/B 2,18 EXAKT · netto-M 16,05 % EXAKT · FCF-M 23,49 % EXAKT · D/E 0,30 ·
EPS×aktier = netto 0,4 % · mcap 0,2 % · **EV-dekompositionen REN — vågens enda utan
dolda poster** (4 230 + 589,87 − 244,70 = 4 575,2 mot källans 4 580 = 0,1 %).

**FCF-serien intern låst (HEI-klassen):** OCF − capex = FCF exakt i samtliga fem
fönster; FCF-yield 12,63 % (534,3/4 230) · FCF/aktie 297,27 (källrad).

**Vändningen (datafakta, ingen prognos):** netto [98,7 · 17,0 · 50,7 · 291,5] —
patentklippurdalen FY2024 och återhämtningen till FY26-rekord; rak 3-årig CAGR FY23→FY26
oms +12,10 % · netto +43,47 %. EPS-serien [54,09 · 9,47 · 28,24 · 162,22].

**Modellnoter:** ROIC 16,18 % mot WACC 4,34 % — **gap +11,8 punkter, vågens bredaste**
(patentmoatens avtryck) · bruttomarginal 80,8 % (cellens högsta — farmacins immateriella
struktur) · ROE-raden 21,30 % (replik 18,8 %, snitt-bas noterad) · räntetäckning 41,87 ·
Debt/EBITDA 0,88 · Altman 2,73 gränszon · Piotroski 7 · beta 0,09 (vågens lägsta) ·
utdelning 80,00 JPY (3,35 %) med EPS-payout 39,4 % (källraden 38,29 % annat fönster) ·
minoritetsgapet CF/IS-panel FY26 (376,6 mot 291,5 = 85 mdr) dokumenterat ·
prognosTillväxt NULL (fwd P/E 11,37 ⇒ implied EPS +2,2 % — endast referens) ·
**rappdag 2026-10-30 INOM v172-fönstret** (10-20→11-04) — könotis.

**Cellmotivationen:** Japan/hälsa 2→3 — cellens tre modeller: Takeda (global
diversifierad farmaka) · Daiichi Sankyo (onkologi-EU-sprint) · Astellas
(specialty-vändningen). Hälsocellen 28→29, Japan 26→27.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 285→286 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · nio lås på första försöket |
| llms HELREGEN (diskdrivet, tjugoförsta+körningen) | GRÖN 286-läget · K2 round-trip · halso-raden n=27 (median P/E 25,7) · totalt n 273→274 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 286 bolag · 515 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (4503.T), kirurgisk append 285+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 286-läget
- `verktyg/_r220-u24-*.mjs` — sond/inlägg/avslut + llms-regen/lackagevakt
- `data/forskning/V173-U24-4503T-ASTELLAS-OMPROVNING.md` — detta protokoll
- `worklog.md` — rond 220-rad

## KÖ

1. Kirin 2503.T — leverans skjuten till Q3-rapporten 2026-11-11 (normaliseringsbevis).
2. Rappdagarna 10-20→11-04 → v172-kön; **4503 rappdag 2026-10-30** med i kalendern.
3. Nya länder/celler (Spanien/Storbritannien/Kanada har öppna 1-grenar) eller
   spårrotation enligt evighetskatalogen.

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; vändningen dokumenteras som konstaterad
data (aldrig som förväntan), fwd-implied EPS redovisas med sin natur (referens).
Omröstningen av U17:s avvisning visar metoden: samma bolag kan levereras när
underlaget ändras — kriterierna är mekaniska, inte känslomässiga. Analytikerlägen
syndikeras aldrig.
