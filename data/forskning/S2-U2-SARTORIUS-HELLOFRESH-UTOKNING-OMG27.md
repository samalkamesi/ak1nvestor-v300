# S2-U2 OMG27 — SARTORIUS (SRT3.DE) + HELLOFRESH (HFG.DE): TYSKLAND/TILLVÄXT 0→2 ⇒ TYSKLAND 10/10

**Fabriksagent s2-u2 (byggare 2/3, manifest auto-s2-1790017500456, omgång 27).**
Anspråk disk-först 2026-09-21 ~19:2x UTC: `data/vakten/auto-s2-1790017500456-s2-u2-ansprak.md`.
Universum vid anspråk: 249 (läst på disk). Vid append: 253 (race 17, se §7). Slutläge: **255**.

## 1. VALET

**Tyskland/tillvaxt 0→2** — enda tomma tyska grenen (Tyskland hade 9/10 grenar:
teknik SAP · hälsa FRE · energi RWE · kommunikation DTE · fastighet VNA ·
material BAS · finans ALV · industri SIE · konsument 6 st). Efter leveransen:
**Tyskland 10/10 — det ANDRA landet efter USA (10/10) med samtliga grenar;
16 bolag.** Tillväxt-grenen fick sitt första tyska par och 18→19 bolag.

**Cell-pedagogiken (DSY+CAP-mönstret, omg26):** moat-marginal mot volym-marginal
i EN cell —

| | Sartorius (SRT3.DE) | HelloFresh (HFG.DE) |
|---|---|---|
| Arketype | bio-process-labb (B2B, 156 år, Göttingen 1870) | meal-kit-volymmotor (B2C, 15 år, Berlin 2011) |
| P/E TTM | 78,58 (vändningsåret: netto +88,4 %) | n/a (förlust −34,8 M € TTM; fwd 6,86) |
| Bruttomarginal | 45,71 % | 60,42 % (råvaran bär, logistiken äter) |
| EBIT-marginal | 17,20 % | 0,86 % — ENPROCENTSMASKINEN |
| fcfYield | 3,05 % | 30,61 % (kassflödet lever, vinsten saknas) |
| ROIC − WACC | 5,54 − 10,29 = **−4,75 pp** | 4,81 − 4,38 = **+0,43 pp** |
| rev/anställd | 250 837 € | 439 736 € (1,75×) |
| Balans | nettoskuld 3 761 M € · täckning 4,19 · Altman 2,47 | nettoskuld 503,8 M € · täckning 1,67 · Altman 3,3 |
| Återköp/utdelning | DPS 0,74 (0,30 %) — KLIPPT −48,61 % 2023, 3 platta år | aldrig utdelning; återköp 132,6 M € FY25 = 8,15 % yield |

**Avvisade alternativ** (anspråksfilen): Frankrike/tillväxt (svagare magnet),
UK/fastighet 0→2 (SEGRO+British Land — bara 6→7/10), Japan/energi (redan djupt),
Indien/kommunikation (tunn cell). **Duplikatkontroll:** SRT*/HFG/DHER/ZAL = 0
träffar i universumet före append.

## 2. KÄLLOR (StockAnalysis ETR-primär, Xetra; EPA-precedenserna)

`stockanalysis.com/quote/etr/SRT3/` och `/quote/etr/HFG/` — vardera
`/` (overview) + `/statistics/` + `/financials/` + `/financials/balance-sheet/`
+ `/financials/cash-flow-statement/` (SRT3:s financials togs via webReader-
kanalen efter två tomma WebFetch-extraktioner). Underlag: S&P Global Market
Intelligence (GMI, uppdaterad 2026-08-13) + S&P Capital IQ financials-tabell
(SRT3). Intradag 2026-09-21 ~17:35–17:36 CET. FY = kalenderår (tysk konvention).
Valuta EUR.

## 3. KÄLLSPRIDNINGAR (dokumenterade, CAP.PA-precedensens stil)

- **SRT3 mcap-bas:** källfält 15,41 mdr ⇒ implicit TTM-bas 61,96 M aktier mot
  aktiefältets 69,04 M (BVPS-pariteten 39,20 × 69,05 = 2 707 = common-EK FY25
  EXAKT håller 69-basen). Källans mcap/P/E internt konsistenta — källfält följs.
- **SRT3 EV:** källfält 20,35 mdr (bas 4 940 ≈ FY2023-nettoskuld 4 917) mot
  TTM-replik 19,17 (15 410 + 4 052 − 291,3) — 5,8 %; båda belagda.
- **SRT3 FY2023-netto:** GMI-översiktens nyrad skjuten ett år (visar 84,0 = FY24);
  CapIQ-tabell 205,2 korsbelagd av EPS 3,01 × 68,42 = 205,9 (0,3 %) — **205,2**
  i serien (två oberoende ytor).
- **SRT3 EBITDA-bas:** källans EV/EBITDA 20,89 ⇒ bas 974 mot tabell-EBITDA 938,5
  (3,7 %). **HFG EBITDA-bas:** källans 3,51 ⇒ bas 252,3 mot tabell 156,0 (61,7 % —
  lease-/justeringsbas; endast konstaterande).
- **HFG mcap-bas:** källfält 385,13 M ⇒ bas 146,2 M mot aktiefält 144,08 M
  (1,5 %; aktiebasen KRYMPER −8,15 % YoY — återköpsmaskinen).
- **HFG prognosTillväxt +259,9 %** = vändningsräkning ur källans fwd-PE:
  fwd-EPS 2,633/6,86 = 0,3838 mot TTM −0,24 ⇒ (0,3838+0,24)/0,24 (ELUX-mönstret).
- **HFG resultatCAGR = null** (negativt slutår — EKTA/ELUX-konventionen).

## 4. ARITMETIKGRIND — 58/58 GRÖN på FÖRSTA försöket (0 ABORT)

`verktyg/_s2u2o27-aritmetikgrind.mjs`: P/E 15 410/196,1 = 78,58 EXAKT ·
PS 4,302 ✓ · PB 3,854 ✓ · P/FCF 32,75 ✓ · marginaler brutto/EBIT/netto/FCF
✓✓✓✓ · fcfYield 3,05 ✓ · D/E 1,013 ✓ · skatt 124,7/404,4 = 30,84 ✓ ·
DPS-klipp −48,61 % ✓ · CAGR-identiteter ✓ · segment FY25-summa 2 865+673 =
3 538 EXAKT · HFG: PB 0,6079 ✓ · EV/EBIT 16,16 EXAKT · fcfYield 30,61 ✓ ·
D/E 1,191 ✓ · skatt-identitet −4,0−31,9 = −35,9 ≈ −34,8 ✓ · aktiebas
−16,79 % ✓ · återköp 39,6+93,0 = 132,6 ✓ · brutto-FALL −6,36 % ✓.

## 5. RADFÄLT (fulla belägg i `kallor[0].paranoid`)

**SRT3.DE:** pris 248,70 · mcap 15,41 mdr · pe 78,58 · pb 3,85 · evEbit 33,20 ·
peg 2,66 (källans fält 3,32 på 3-års-prognos — båda belagda) · fcfYield 0,0305 ·
roe 0,0718 · roic 0,0554 · brutto 0,4571 · ebit 0,1720 · netto 0,0548 ·
fcf 0,1314 · D/E 1,01 · täckning 4,19 · fcfPos 5/5 · DPS-tratta 1,26→1,44→0,74×3 ·
moat 0,4869/0,0822 (DET BREDA PANDEMI-BANDET — mot DSY:s 0,17 pp smalaste) ·
serier rev [3 449, 4 175, 3 396, 3 381, 3 538] · res [318,9, 678,1, 205,2,
84,0, 154,9] — PANDEMIKAVAJEN (topp FY22 → botten FY24 → vändning TTM 196,1,
+88,4 %) · signaturtal: ROIC 5,54 < WACC 10,29 på P/E 78,6 = PREMIUM-MULTIPEL
PÅ SUB-WACC-AVKASTNING (vändningscykelns pris) · nästa rapp 2026-10-22 (Q3).

**HFG.DE:** pris 2,633 · mcap 0,385 mdr · pe null · pb 0,61 · evEbit 16,16 ·
peg null · fcfYield 0,3061 · roe −0,0533 · roic 0,0481 · brutto 0,6042 ·
ebit 0,0086 · netto −0,0055 · fcf 0,0186 · D/E 1,19 · täckning 1,67 · fcfPos
4/5 · moat 0,6407/0,0419 (FEM RAKA FALLANDE bruttoår) · serier rev [5 993,
7 607, 7 597, 7 661, 6 761] · res [242,8, 127,0, 19,4, −136,4, −92,6] —
FÖRLUSTTRAPPAN · signaturtal: PS 0,06 — sex miljarder omsättning till 385 M
börsvärde · NETTOPENDELN nettokassa +365,4 (FY21) → nettoskuld −503,8 (TTM) ·
52-v −65,87 % · nästa rapp 2026-11-05 (Q3).

## 6. KVARTILER + UNIVERSUMJÄMFÖRELSE (uppgiftens kärna, egen replik)

- **Tillväxt-grenen:** P/E n 13→14 mätbara (av 18→19 bolag) · median 43,6→46,7 ·
  kvartiler P25–P75 30,8–117,5 → **31,4–111,8** · resCAGR-median (llms): 17,2 %
  (n 9).
- **Universumet:** total median P/E 20,4 → 20,4 (n 242→243 av 255) — stabilt.
- **Placering:** SRT3 78,58 = rad 9/14 i tillväxt · rad 233/243 i universumet
  (näst högsta multiplar-klassen). HFG pe=null — "osatt är information"
  (Ørsted/VWS-precedenserna).
- llms.txt HELREGEN matt-driven: huvudrad 253→255, TILLVÄXT-raden n=14,
  totalt 20,4 (n=243).

## 7. RACE 17 (syskonsamordning)

u1 (+1 Takeda 4502.T, Japan/halso) och u3 (+3 STMPA/SOP/SWP, Frankrike/teknik
2→5 ⇒ landsida född — deras ägo) landade under mitt datafönster. Min append körde
på diskens faktiska 253-läge; u1:s commit 38c74233 bar MINA två rader ride-along
(HEAD == disk == 255, byte-identiskt verifierat — HDFC/omg19-mönstret, ägarskap
SRT3+HFG = s2-u2 dokumenterat här). Noll koordinatkollision. llms-regen matt-
driven på 255 ⇒ konvergent oavsett commit-ordning.

## 8. KVD

Aritmetikgrind 58/58 · append RONDELL 0 förändrade gamla rader (json-bevis,
255 gamla identifierade) · 1-mellanslagsformat = HEAD:s (od-bevisat; 2-mellanslags-
försöket gav 23 149 raders kosmetisk helbytesdiff, `git diff -w` tom — omg22-
epologens spegelbild) · llms REGEN GRÖN round-trip · **läckagevakt v3 GRÖN
0 träffar (458 sökningar)** — 0 dataset-html i .next (deployfönstrets mixed-
state, se §9; llms Dataset-sektionen = enda ändrade yta, kontrollerad GRÖN) ·
kontraktstest **189/0/30 GRÖNT** (u3:s landsida med; inga nya aspektsidor från
min cell — matta ej nåd) · tsc: INGEN src berörd (land.ts-tyskland finns sedan
omg17; protokollfil + data + verktyg only) · R2 orörd · data/blogg/ orörd ·
juridikgrinden: allt utbildning/källbelägg, ALDRIG råd (2007:528) — paranoid-
texterna bär bara konstateranden.

## 9. PROD-LÄGET (ärlig bokföring)

`/` 200 · `/llms.txt` 200 · `/dataset` 500 · `/dataset/tillvaxt` 404 ·
`/portfolj-forskning` 500. **ROTEN är INTE min leverans:** .next omstrukturerades
20:47–20:51 lokal av ett avbrutet bygg (client reference manifest saknas för
/dataset i pm2-loggen sedan 21:18 lokal; u3:s 18:58-fynd + u1:s 20:5x-bokföring
samma klass C17/o113 — KÄND deployfönster-artefakt, omgången delar bilden).
Pulsvakten ropar aktivt hogprio ("ombygge under deploylåset — prod-synk/
kraschvakt äger"). Kraschvakten triggas EJ (app online + omstarter +0 — S8-U2-
klassens blinda fläck, bokförd). Läkning: prod-synkens ombygge (bygger på
diskens 255-läge; vid deploy blir /dataset + /dataset/tillvaxt 200 med
Tyskland 10/10 och kvartilerna ovan live). Fabriksagenter bygger ALDRIG.

FIFO: SRT3 Q3 2026-10-22 · HFG Q3 2026-11-05.
