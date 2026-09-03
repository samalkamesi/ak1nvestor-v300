# AKM2-BESLUT — syntes av R1–R4 (normativt för byggagenter)
Skrivet av moderagenten 2026-09-03 efter R1 (nyckeltal), R2 (vikter),
R3 (dynamik), R4 (arkitektur). DETTA dokument är vad byggagenterna följer.
Full evidens i respektive rapport i data/forskning/.

## 0. Identitet
AK-Model 2 (förkortning AKM2). AKM1 = kärnprojektionen av AKM2 —
projektionsinvarianten (R4 §): `projiceraAKM1(raknaAKM2(k, {moduler: [],
viktprofil: "akm1-klassisk"})) === raknaAKM1(k)` ALLTID.

## 1. Nya variabler (R1 — lager 2, kundtak ≤ 10; vi bygger 8 kärn + 1 villkorad)
| ID | Namn | Kategori | Formel (kärna) | Vikt-standard |
|---|---|---|---|---|
| V21 | ROIC | Lönsamhet | NOPAT/investerat kapital | 8 % |
| V22 | Fri kassaflödesavkastning | Värdering | FCF/ev + FCF-konversion | 8 % |
| V23 | Redovisningskvalitet | Risk | Sloan-accruals (NI−CFO)/TA + Beneish-M-flagga | 5 % |
| V24 | Skuldbetjäningsförmåga | Stabilitet | Räntetäckning + nettoskuld/EBITDA | 4 % |
| V25 | Utspädning | Risk | Aktieantals-CAGR + SBC/omsättning | 5 % |
| V26 | Kapitalcykel | Lönsamhet | CapEx/omsättning-trend + kapitalomsättningshastighet | 3 % |
| V27 | Utdelningskontinuitet | Kapitalstruktur | År i rad med utdelning/payout ur FCF | 3 % |
| V28 | Earnings yield (EV/EBIT) | Värdering | EBIT/ev | 6 % |
| V29 | Insider-ägande (VILLKORAD — kräver FI-data, manuell modul) | Katalysator | Ägar-/insiderdata | inaktiv |

## 2. Viktprofilen "akm2-2026" (R2 — summerar exakt 100 %)
| Variabel | Ny vikt |
|---|---|
| V01 Försäljningstillväxt | 8 % |
| V02 ARR-tillväxt | 4 % |
| V03 Intäktsdiversifiering | 3 % |
| V04 P/S (SaaS-adapter: EV/Revenue) | 4 % |
| V05 P/B | 4 % |
| V06 EV/EBITDA | 11 % |
| V07 Bruttomarginal | 10 % (omankrad enl. R2: poängkurva, se §4) |
| V08 EBITDA-marginal | 6 % |
| V09 ROE | 6 % |
| V10 Skuldsättningsgrad | 4 % |
| V11 Likviditet | 4 % |
| V12 Intäktsstabilitet | 4 % |
| V13 Patent & IP | 4 % |
| V14 Varumärke | 3 % |
| V15 Nätverkseffekter | 3 % |
| V16 Produktlanseringar | 2 % |
| V17 Avtal & Partnerskap | 2 % |
| V18 Regulatoriska | 2 % |
| V19 Kassatäckning — nyemissionsrisk | 9 % + HÅRD PORT (se §5) |
| V20 Återköp av egna aktier | 4 % |
| V21–V28 (nya enligt §1) | 8+8+5+4+5+3+3+6 = 42 % → OBS: modulvikt separeras nedan |

**Två-spårs-modell (R4 lager 4):** profilen "akm1-klassisk" = exakt dagens
beteende (uniform V01–V20, projektion). Profilen "akm2-2026" = ovan V01–V20
(58 %) + modulblocket V21–V28 (42 %) — moduler som saknar data omfördelar
sin vikt proportionellt till aktiva variabler (dokumenterat i resultatet).

## 3. Kategorivikter (R2): Lönsamhet 24 · Värdering 20 · Risk/Stabilitet 20 ·
Tillväxt 16 · Moat 10 · Katalysator 6 · Kapitalstruktur 4 (= 100).

## 4. Poängkurvor (R2, icke-linjära för 5 variabler): implementera
tröskel-tabeller (0/1/2/3/4/5-poäng vid specificerade nivåer) för V07
(bruttmarginal: konkav — mjukvaru-gynning bort), V09 (ROE: konkav, tak vid
~35 %), V06 (EV/EBITDA: konvex lågt = bättre), V19 (månader kassa: hård
tröskel vid 12 mån), V01 (tillväxt: konkav, tak ~40 %). Exakta trösklar ur
r2-vikter-2026-09-03.md §poängkurvor.

## 5. Hård port (R2): kassa < 12 månader (V19) ⇒ AKM2-komposit max 45
oavsett övrigt (dokumenteras i forklaraPoang).

## 6. Dynamikmodulen (R3 — lager 3): vågfas-faktorer Φ per (variabel,
horisont) enligt r3-dynamisering-2026-09-03.md:
impulsvåg bekräftad ×1,20 / obekräftad ×1,10 / mogen ×1,20+varning /
basbygge ×1,00+watch / korrigering G≥3 ×0,80 / korrigering G≤2 ×0,90+
"value appearing"-flagga / osatt ×1,00-nivå men 0 dynamikbidrag.
**RIKTIGHETSINVERTERING (kritiskt):** V04, V05, V06, V10, V28 (flera av
värderings-/skuldvariablerna) — "gynnsam riktning" = sjunkande multiple,
inte stigande. Konvertera seriens tecken FÖR klassning (r3 §designvarning).
Dynamiktak: ±10 kompositpoäng. Konfluens-gate: teknisk 3/5 × fundamental
4/7 → statusmatris HÖG/KONFLIKT/DIVERGENS/NEUTRAL (speglar konfluens-motorn).

## 7. Fas-gating (R4): Fas 1 ser AKM1 (kalkylatorns klassiska läge).
Fas 2: AKM2 fundamental utan våglager. Fas 3 + portföljforskning: full AKM2.
Prenumerations-portföljen konsumerar AKM2-komposit + kravkontroller.

## 8. Prediction Log (R4): hash-kedjad append-only logg per snapshot —
AKM2-loggar bedömning, P5-uppföljningen dömer med verkligheten.

## Byggregler
- Fil-domäner (INGEN agent rör en annans filer):
  kärna: src/lib/akm2/karna.ts + src/lib/akm2/typer.ts
  dynamik: src/lib/akm2/dynamik.ts
  moduler: src/lib/akm2/moduler/ (en fil per branschfamilj + index)
  vikter: src/lib/akm2/vikter.ts
- Importera endast via `import type` från akm2/typer.ts + befintliga
  portfolj-forskning/typer.ts. `npx tsc --noEmit` = 0 nya fel.
- Testfil i verktyg/ per modul. ALLT på svenska med korrekta åäö.
  ALDRIG investeringsråd-formuleringar.
