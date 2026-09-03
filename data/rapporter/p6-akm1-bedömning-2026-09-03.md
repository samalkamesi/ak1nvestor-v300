# P6 — AKM1-bedömning och fundamental vågklassning (2026-09-03)

AK1A Research Lab · pedagogisk forskning — **ALDRIG investeringsråd**.

## 1. Sammanfattning

- **100 bolag** bedömda (AKM1 V01–V20) och vågklassade (FVagAnalys); saknade underlagsfiler: 0.
- **Medelpoäng 39,6 / 100**, median 41,9, span 6,6–58,1.
- **Statusfördelning (D1, skalad efter datatäckning):** grön 7 · gul 76 · röd 17 · osatt 0. Med pass 1:s ursprungliga fasta trösklar (grön ≥ 70, gul 55–69) var fördelningen grön 0 · gul 2 · röd 98 — se D1-rapporten (`data/rapporter/d1-datatackning-2026-09-03.md`).
- **Port-brott (V19 kassatäckning < 12 mån):** 1 bolag — VPLAY-B.ST.
- **Beräkningsbara variabler:** 11 av 20 (V01, V04, V05, V06, V07, V08, V09, V10, V12, V14, V19) — resterande 9 är osatta för samtliga bolag i pass 1 (V02, V03, V11, V13, V15, V16, V17, V18, V20).
- **Strukturell tak-effekt:** 28,9 % av vikten vilar på variabler som saknar data för alla bolag — det teoretiska maximala totalpoängtalet är därför ≈ 71,1 i pass 1. Gröna nivån (≥ 70) är med pass-1-data i praktiken ouppnåelig; detta är ett **datakvalitetsfynd**, inte en bedömning av bolagen.

## 2. Formel och vikter (dokumentation)

```
totalt = Σ(vikt_norm(Vxx) × poäng(Vxx)) × 20
vikt_norm(Vxx) = vikt(Vxx) / 97    (akm2-2026, AKM2-BESLUT §2 första spåret)
```

BESLUT §2:s V01–V20-tabell (8+4+3+4+4+11+10+6+6+4+4+4+4+3+3+2+2+2+9+4) summerar
de facto **97 %** — vikterna normaliseras till Σ1 i beräkningen. Spårtexten i BESLUT
(”58 % V01–V20 + 42 % moduler”) avser fulla AKM2-kompositen där modulblocket V21–V28
ingår; modulerna ingår INTE i AKM1-lagret. Alternativa tabellen i r2-vikter §4.2
(summerar 100 %) har medvetet EJ använts — BESLUT-dokumentet är normerande.
Osatt variabel ⇒ **0 poäng** och motivering som inleds med ”osatt” (ärlighetsprincipen:
modellen gissar aldrig). Poängkurvor enligt AKM2-BESLUT §4/r2 §6: V01 goldilocks
(tak ~40–45 %), V06 konvex med värdefalle-hål, V07/V09 konkava (tak vid höga nivåer
då uthållighet ej kan verifieras), V19 klippfunktion. Övriga linjära band.

## 3. Topp-10 (högst AKM1-total)

| # | Ticker | Bolag | Bransch | AKM1 | Kategorier (tillv/värd/löns/stab/moat/kat/risk) | Dynamik | Status |
|---|--------|-------|---------|------|------------------|---------|--------|
| 1 | INDU-C.ST | AB Industrivärden (publ) | industri | 58,1 | 1,3/3,7/4,3/1,7/1,3/0,0/2,5 | stabilt | gron |
| 2 | NEM | Newmont Corporation | material | 55,1 | 1,3/2,3/4,3/2,3/1,3/0,0/2,5 | forbattras | gron |
| 3 | INVE-B.ST | Investor AB (publ) | finans | 54,0 | 1,3/3,7/4,3/0,0/1,3/0,0/2,5 | osatt | gron |
| 4 | NHY.OL | Norsk Hydro ASA | material | 53,4 | 0,7/4,7/3,0/2,7/1,0/0,0/2,5 | stabilt | gron |
| 5 | NOVO-B.CO | Novo Nordisk A/S | halso | 52,8 | 1,3/2,0/4,3/2,3/1,3/0,0/2,5 | forbattras | gron |
| 6 | T | AT&T Inc. | kommunikation | 52,0 | 0,7/3,7/3,7/2,7/1,3/0,0/2,5 | stabilt | gron |
| 7 | LOGN.SW | Logitech International S.A. | teknik | 50,3 | 0,7/2,7/3,7/3,0/1,0/0,0/2,5 | forbattras | gron |
| 8 | META | Meta Platforms, Inc. | kommunikation | 49,7 | 1,0/1,3/4,3/3,0/1,3/0,0/2,5 | forbattras | gul |
| 9 | BSX | Boston Scientific Corporation | halso | 49,3 | 1,0/2,7/3,3/3,0/1,3/0,0/2,5 | forbattras | gul |
| 10 | MC.PA | LVMH Moët Hennessy - Louis Vuitton, Société Européenne | konsument | 49,1 | 0,7/3,0/3,3/2,7/1,3/0,0/2,5 | stabilt | gul |

## 4. Botten-5 (lägst AKM1-total)

| # | Ticker | Bolag | Bransch | AKM1 | Lägsta poäng (alltid-osatta variabler exkluderade) | Status |
|---|--------|-------|---------|------|--------------------------|--------|
| — | SWED-A.ST | Swedbank AB (publ) | finans | 19,8 | V07:0p, V10:0p, V19:0p, V04:1p, V06:1p, V14:1p | rod |
| — | NDA-SE.ST | Nordea Bank Abp | finans | 19,0 | V05:0p, V07:0p, V10:0p, V19:0p, V04:1p, V06:1p | rod |
| — | VPLAY-B.ST | Viaplay Group AB (publ) | kommunikation | 18,6 | V04:0p, V07:0p, V09:0p, V19:0p, V08:1p, V10:1p | rod |
| — | ELUX-B.ST | AB Electrolux (publ) | konsument | 17,9 | V04:0p, V06:0p, V07:0p, V08:0p, V09:0p, V01:1p | rod |
| — | PSNY | Polestar Automotive Holding UK PLC | tillvaxt | 6,6 | V04:0p, V05:0p, V06:0p, V07:0p, V08:0p, V09:0p | rod |

## 5. Null-fördelning per variabel (osatta av 100 bolag)

| Variabel | Namn | Vikt % | Osatta | Beräkningsbara |
|----------|------|--------|--------|----------------|
| V01 | Försäljningstillväxt | 8,0 | 0 | 100 |
| V02 | ARR-tillväxt | 4,0 | 100 | 0 |
| V03 | Intäktsdiversifiering | 3,0 | 100 | 0 |
| V04 | P/S | 4,0 | 8 | 92 |
| V05 | P/B | 4,0 | 2 | 98 |
| V06 | EV/EBITDA | 11,0 | 6 | 94 |
| V07 | Bruttomarginal | 10,0 | 0 | 100 |
| V08 | EBITDA-marginal | 6,0 | 0 | 100 |
| V09 | ROE | 6,0 | 3 | 97 |
| V10 | Skuldsättningsgrad | 4,0 | 12 | 88 |
| V11 | Likviditet | 4,0 | 100 | 0 |
| V12 | Intäktsstabilitet | 4,0 | 10 | 90 |
| V13 | Patent & IP | 4,0 | 100 | 0 |
| V14 | Varumärke & kundlojalitet | 3,0 | 0 | 100 |
| V15 | Nätverkseffekter | 3,0 | 100 | 0 |
| V16 | Produktlanseringar | 2,0 | 100 | 0 |
| V17 | Avtal & partnerskap | 2,0 | 100 | 0 |
| V18 | Regulatoriska katalysatorer | 2,0 | 100 | 0 |
| V19 | Kassatäckning — nyemissionsrisk | 9,0 | 13 | 87 |
| V20 | Återköp av egna aktier | 4,0 | 100 | 0 |

Alltid osatta (pass 1): V02 ARR, V03 diversifiering, V11 kvick-likviditet, V13 patent,
V15 nätverkseffekter, V16–V18 katalysatorer, V20 återköp — tillsammans
28,0 viktenheter av 97. Detta matchar P1:s
kända begränsningar (manifest.json): källorna saknar ARR, segmentdata,
balansräkningshistorik, återköpsbelopp och aktieantalshistorik.

## 6. Port-brott (V19 HÅRD PORT)

- **VPLAY-B.ST (Viaplay Group AB (publ))** — totalt 18,6 (tak 45 tillämpat): Kassatäckning 6,8 mån → klippband 0/5 — HÅRD PORT: < 12 mån ⇒ totalpoäng max 45 (AKM2-BESLUT §5) (OBS: FCF-marginal 2,2 % är samtidigt positiv — motstridiga källfält, burn-raten ges företräde enligt P1:s metodik och flaggas här)

## 7. Fundamental vågbild (FVag — kort kommentar)

Sammanvägd dynamik över bolagen: förbättras 38 ·
stabilt 39 · försvagas 16 ·
osatt 7. Med pass 1:s fyra räkenskapsår kan fundamental-vagmotorns
fönsterkrav (kort ≥ 4, medellång ≥ 5, lång ≥ 6 punkter) bara uppfyllas för
omsättningsseriens mikro-fönster — perHorisont är därför huvudsakligen ”osatt”, vilket
är motorns ärliga svar på korta serier, inte ett fel. När P7+ kompletterar med
kvartalsdata/längre historik växer vågbilden fram.

## 8. Kända dataartefakter (dokumenterade, ej lösta i pass 1)

- **Holding-/investmentbolag:** INDU-C.ST (Industrivärden) och INVE-B.ST (Investor)
  redovisar bruttomarginal 100 % och EBIT-marginal ~100 % hos källan (koncernstrukturens
  art) — deras höga AKM1-placeringar drivs delvis av denna artefakt, inte av
  verksamhetslönsamhet. Läs topp-listan med detta i minnet.
- **Kraftigt negativ FCF utan känd kassatäckning:** CAST.ST (−72,9 % FCF-marginal)
  och RWE.DE (−69,6 %) är V19-osatta (0 poäng) eftersom kassatäckning i månader ej
  finns hos källan — porten utlöses INTE av osatt värde, men båda flaggas här för
  manuell granskning i nästa pass (investeringstung verksamhet kan förklara FCF).
- **Finansbranschen:** P1 sätter metodiskt skuld/EK = null (V10 osatt) och bankernas
  bruttomarginal är 0 % hos källan (V07 = 0) — banker får systematiskt låga AKM1-totaler
  av branschdatans art, inte av bolagens kvalitet. NDA-SE.ST:s P/B 21,5x är med stor
  sannolikhet en källartefakt (SEB 1,9x, SHB 1,6x).
- **V06-proxy:** fältet evEbit är EV/EBIT, inte EV/EBITDA. EV/EBIT ≥ EV/EBITDA alltid
  ⇒ poängen är en dokumenterad nedre gräns (systematiskt sträng, värst för
  kapitalintensiva branscher).
- **V08-proxy:** EBIT-marginal som nedre gräns för EBITDA-marginal (samma logik).
- **V14:** grov subjektiv poäng ur bruttomarginalens nivå — korrelerar med V07 och
  dubbelräknar delvis moat-evidens (r2 §4.1 varnar för just detta).
- **Källavvikelser >15 %** enligt manifestet (EQNR, GOOGL, BRK-B, NKE) påverkar
  prisberoende mått (V04–V06).

## 9. Återföring

1. Nyckeltalspass 2 bör prioritera: bruttovinsthistorik (V07 uthållighetskrav, V14-aggregat),
   aktieantalshistorik (V20, V25-utspädning), balanshistorik (V11), ARR/segment (V02–V03).
2. Fyra bolag har känd kassatäckning — V19:s klippfunktion är svagt belyst i pass 1;
   kassaflödeshistorik tänder den variabeln mer än någon annan.
3. Grönnivån ≥ 70 kräver att alltid-osatt-vikten (≈29 %) får data — annars bör
   trösklarna kalibreras om i nästa beslutsrunda (separat forskningsbeslut).
   *Uppföljning: kalibreringen genomfördes i D1 (2026-09-03) — trösklarna
   skalas nu per bolag efter datatäckningen; se
   `data/rapporter/d1-datatackning-2026-09-03.md`.*

---

*Verktyg: `verktyg/python/bedom_akm1.py` (AKM1) · `verktyg/kor-fvag.mjs` (FVag via
tsx) · `verktyg/python/sammanstalla_korstabell.py` (denna korstabell + rapport).*

*AK1A Research Lab — pedagogisk forskning. ALDRIG investeringsråd.*
