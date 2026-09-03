# D1 — Datatäckning och skalade statuströsklar (2026-09-03)

AK1A Research Lab · pedagogisk forskning — **ALDRIG investeringsråd**.

## 1. Bakgrund — det strukturella datakvalitetsfyndet

Pass 1 bedömde 100 bolag med AKM1, men **28,9 % av modellens vikt**
vilar på variabler utan datakällor (V02, V03, V11, V13, V15, V16, V17, V18, V20) — osatta variabler ger
ALLTID 0 poäng (ärlighetsprincipen: modellen gissar aldrig), vilket sänker det
teoretiska poängtaket till ≈ 71,1 för samtliga bolag.
Status-tröskeln ”grön = AKM1 ≥ 70” var därmed i praktiken ouppnåelig
(pass 1:s fasta trösklar gav: grön 0 · gul 2 · röd 98).
Detta är ett **datakvalitetsfynd**, inte en bolagsbedömning — D1 åtgärdar
redovisningen av fyndet, inte bolagspoängen.

## 2. Nya regler (D1)

```
datatackning   = Σ vikt över beräkningsbara (icke-osatta) variabler / 97
akm1MaxMojligt = Σ vikt över beräkningsbara × 5 × (20/97)  (= datatackning × 100)

grön = AKM1 ≥ 70 % av akm1MaxMojligt OCH datatackning ≥ 60 % OCH inget port-brott
gul  = AKM1 50–70 % av akm1MaxMojligt OCH inget port-brott
röd  = AKM1 < 50 % av akm1MaxMojligt ELLER port-brott (V19 < 12 mån)
```

Saknad data sänker **taket** (maxMöjligt), aldrig poängen — modellen straffar
inte saknad data. Samtidigt kan täckning < 60 % ALDRIG ge grön status: sämre
underlag måste synas, inte döljas bakom en skalad tröskel.

## 3. Statusfördelning NU (efter skalning)

- **Grön 7 · gul 76 · röd 17** av 100 bedömda bolag
  (fasta trösklar: grön 0 · gul 2 · röd 98).
- **Täckningsspann:** 41,2–71,1 % av modellens vikt
  (maxMöjligt 41,2 → 71,1 poäng).
- **Port-brott (fortfarande röd oavsett kvot):** 1 bolag —
  VPLAY-B.ST.

## 4. Gröna bolag — poäng ≥ 70 % av maxMöjligt OCH täckning ≥ 60 %

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| INDU-C.ST | AB Industrivärden (publ) | industri | 58,1 | 67,0 | 87,0 % | 67,0 % |
| INVE-B.ST | Investor AB (publ) | finans | 54,0 | 62,9 | 86,0 % | 63,0 % |
| NEM | Newmont Corporation | material | 55,1 | 71,1 | 77,0 % | 71,0 % |
| NHY.OL | Norsk Hydro ASA | material | 53,4 | 71,1 | 75,0 % | 71,0 % |
| NOVO-B.CO | Novo Nordisk A/S | halso | 52,8 | 71,1 | 74,0 % | 71,0 % |
| T | AT&T Inc. | kommunikation | 52,0 | 71,1 | 73,0 % | 71,0 % |
| LOGN.SW | Logitech International S.A. | teknik | 50,3 | 71,1 | 71,0 % | 71,0 % |

## 5. Gula bolag — poäng 50–70 % av maxMöjligt

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| GS | The Goldman Sachs Group, Inc. | finans | 38,6 | 53,6 | 72,0 % | 54,0 % |
| META | Meta Platforms, Inc. | kommunikation | 49,7 | 71,1 | 70,0 % | 71,0 % |
| BSX | Boston Scientific Corporation | halso | 49,3 | 71,1 | 69,0 % | 71,0 % |
| MC.PA | LVMH Moët Hennessy - Louis Vuitton, Société Européenne | konsument | 49,1 | 71,1 | 69,0 % | 71,0 % |
| VZ | Verizon Communications Inc. | kommunikation | 49,1 | 71,1 | 69,0 % | 71,0 % |
| MCD | McDonald's Corporation | konsument | 39,0 | 56,7 | 69,0 % | 57,0 % |
| NP3.ST | NP3 Fastigheter AB (publ) | fastighet | 48,9 | 71,1 | 69,0 % | 71,0 % |
| SAP.DE | SAP SE | teknik | 48,5 | 71,1 | 68,0 % | 71,0 % |
| NKE | NIKE, Inc. | konsument | 47,8 | 71,1 | 67,0 % | 71,0 % |
| CVX | Chevron Corporation | energi | 47,8 | 71,1 | 67,0 % | 71,0 % |
| PG | The Procter & Gamble Company | konsument | 47,6 | 71,1 | 67,0 % | 71,0 % |
| GOOGL | Alphabet Inc. | teknik | 47,4 | 71,1 | 67,0 % | 71,0 % |
| PLTR | Palantir Technologies Inc. | tillvaxt | 47,4 | 71,1 | 67,0 % | 71,0 % |
| DIOS.ST | Diös Fastigheter AB (publ) | fastighet | 37,1 | 55,7 | 67,0 % | 56,0 % |
| BRK-B | Berkshire Hathaway Inc. | finans | 37,1 | 55,7 | 67,0 % | 56,0 % |
| TRUE-B.ST | Truecaller AB (publ) | tillvaxt | 47,2 | 71,1 | 66,0 % | 71,0 % |
| MSFT | Microsoft Corporation | teknik | 46,6 | 71,1 | 66,0 % | 71,0 % |
| HM-B.ST | H & M Hennes & Mauritz AB (publ) | konsument | 46,6 | 71,1 | 66,0 % | 71,0 % |
| DIS | The Walt Disney Company | kommunikation | 46,4 | 71,1 | 65,0 % | 71,0 % |
| ORES.ST | Investment AB Öresund (publ) | finans | 41,0 | 62,9 | 65,0 % | 63,0 % |
| HEXA-B.ST | Hexagon AB (publ) | industri | 46,2 | 71,1 | 65,0 % | 71,0 % |
| ERIC-B.ST | Telefonaktiebolaget LM Ericsson (publ) | teknik | 43,5 | 67,0 | 65,0 % | 67,0 % |
| COLO-B.CO | Coloplast A/S | halso | 46,0 | 71,1 | 65,0 % | 71,0 % |
| LLY | Eli Lilly and Company | halso | 45,8 | 71,1 | 64,0 % | 71,0 % |
| CARL-B.CO | Carlsberg A/S | konsument | 45,6 | 71,1 | 64,0 % | 71,0 % |
| WIHL.ST | Wihlborgs Fastigheter AB (publ) | fastighet | 45,2 | 71,1 | 64,0 % | 71,0 % |
| ASM.AS | ASM International NV | teknik | 44,9 | 71,1 | 63,0 % | 71,0 % |
| NVDA | NVIDIA Corporation | tillvaxt | 44,9 | 71,1 | 63,0 % | 71,0 % |
| SHEL | Shell plc | energi | 44,7 | 71,1 | 63,0 % | 71,0 % |
| CATE.ST | Catena AB (publ) | fastighet | 44,1 | 71,1 | 62,0 % | 71,0 % |
| HUFV-A.ST | Hufvudstaden AB (publ) | fastighet | 44,1 | 71,1 | 62,0 % | 71,0 % |
| TEL2-A.ST | Tele2 AB (publ) | kommunikation | 44,1 | 71,1 | 62,0 % | 71,0 % |
| ESSITY-B.ST | Essity AB (publ) | konsument | 43,9 | 71,1 | 62,0 % | 71,0 % |
| NFLX | Netflix, Inc. | kommunikation | 43,9 | 71,1 | 62,0 % | 71,0 % |
| CEVI.ST | CellaVision AB (publ) | halso | 43,7 | 71,1 | 61,0 % | 71,0 % |
| GETI-B.ST | Getinge AB (publ) | halso | 43,5 | 71,1 | 61,0 % | 71,0 % |
| MTG-B.ST | Modern Times Group MTG AB | kommunikation | 43,5 | 71,1 | 61,0 % | 71,0 % |
| JNJ | Johnson & Johnson | halso | 43,3 | 71,1 | 61,0 % | 71,0 % |
| BALD-B.ST | Fastighets AB Balder (publ) | fastighet | 43,3 | 71,1 | 61,0 % | 71,0 % |
| FABG.ST | Fabege AB (publ) | fastighet | 43,3 | 71,1 | 61,0 % | 71,0 % |
| BOL.ST | Boliden AB (publ) | material | 42,9 | 71,1 | 60,0 % | 71,0 % |
| CAST.ST | Castellum AB (publ) | fastighet | 37,1 | 61,9 | 60,0 % | 62,0 % |
| SAND.ST | Sandvik AB (publ) | industri | 42,5 | 71,1 | 60,0 % | 71,0 % |
| AZN.ST | AstraZeneca PLC | halso | 42,5 | 71,1 | 60,0 % | 71,0 % |
| WALL-B.ST | Wallenstam AB (publ) | fastighet | 42,5 | 71,1 | 60,0 % | 71,0 % |
| XOM | ExxonMobil Holdings Corporation | energi | 42,5 | 71,1 | 60,0 % | 71,0 % |
| IBE.MC | Iberdrola, S.A. | energi | 42,3 | 71,1 | 59,0 % | 71,0 % |
| ASSA-B.ST | ASSA ABLOY AB (publ) | industri | 42,1 | 71,1 | 59,0 % | 71,0 % |
| ALFA.ST | Alfa Laval AB (publ) | industri | 41,9 | 71,1 | 59,0 % | 71,0 % |
| EQNR.OL | Equinor ASA | energi | 41,9 | 71,1 | 59,0 % | 71,0 % |
| PLD | Prologis, Inc. | fastighet | 39,2 | 67,0 | 59,0 % | 67,0 % |
| AAPL | Apple Inc. | teknik | 41,4 | 71,1 | 58,0 % | 71,0 % |
| TELIA.ST | Telia Company AB (publ) | kommunikation | 41,0 | 71,1 | 58,0 % | 71,0 % |
| VAR.OL | Vår Energi ASA | energi | 40,8 | 71,1 | 57,0 % | 71,0 % |
| ABB.ST | ABB Ltd | industri | 40,6 | 71,1 | 57,0 % | 71,0 % |
| SHOP | Shopify Inc. | tillvaxt | 40,6 | 71,1 | 57,0 % | 71,0 % |
| KINV-B.ST | Kinnevik AB | tillvaxt | 29,1 | 51,5 | 57,0 % | 52,0 % |
| ENEL.MI | Enel SpA | energi | 39,6 | 71,1 | 56,0 % | 71,0 % |
| GE | GE Aerospace | industri | 37,3 | 67,0 | 56,0 % | 67,0 % |
| LATO-B.ST | Investment AB Latour (publ) | finans | 37,3 | 67,0 | 56,0 % | 67,0 % |
| ATCO-A.ST | Atlas Copco AB (publ) | industri | 39,4 | 71,1 | 55,0 % | 71,0 % |
| ETN | Eaton Corporation plc | industri | 38,6 | 71,1 | 54,0 % | 71,0 % |
| HOLM-B.ST | Holmen AB (publ) | material | 38,6 | 71,1 | 54,0 % | 71,0 % |
| SE | Sea Limited | tillvaxt | 38,4 | 71,1 | 54,0 % | 71,0 % |
| ITX.MC | Industria de Diseño Textil, S.A. | konsument | 31,1 | 57,7 | 54,0 % | 58,0 % |
| AKRBP.OL | Aker BP ASA | energi | 33,2 | 61,9 | 54,0 % | 62,0 % |
| AMD | Advanced Micro Devices, Inc. | tillvaxt | 37,9 | 71,1 | 53,0 % | 71,0 % |
| KAMBI.ST | Kambi Group plc | teknik | 37,5 | 71,1 | 53,0 % | 71,0 % |
| SCA-B.ST | Svenska Cellulosa Aktiebolaget SCA (publ) | material | 37,5 | 71,1 | 53,0 % | 71,0 % |
| JPM | JPMorgan Chase & Co. | finans | 28,2 | 53,6 | 53,0 % | 54,0 % |
| NOKIA.HE | Nokia Oyj | teknik | 36,9 | 71,1 | 52,0 % | 71,0 % |
| YAR.OL | Yara International ASA | material | 36,9 | 71,1 | 52,0 % | 71,0 % |
| BILL.ST | Billerud AB (publ) | material | 28,7 | 55,7 | 52,0 % | 56,0 % |
| EKTA-B.ST | Elekta AB (publ) | halso | 34,2 | 67,0 | 51,0 % | 67,0 % |
| SKF-B.ST | AB SKF (publ) | industri | 35,7 | 71,1 | 50,0 % | 71,0 % |
| FORTUM.HE | Fortum Oyj | energi | 35,7 | 71,1 | 50,0 % | 71,0 % |

## 6. Röda bolag — poäng < 50 % av maxMöjligt eller port-brott

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| WBD | Warner Bros. Discovery, Inc. | kommunikation | 31,5 | 67,0 | 47,0 % | 67,0 % |
| FRE.DE | Fresenius SE & Co. KGaA | halso | 33,2 | 71,1 | 47,0 % | 71,0 % |
| SSAB-B.ST | SSAB AB (publ) | material | 28,7 | 61,9 | 46,0 % | 62,0 % |
| STERV.HE | Stora Enso Oyj | material | 32,6 | 71,1 | 46,0 % | 71,0 % |
| UPM.HE | UPM-Kymmene Oyj | material | 32,6 | 71,1 | 46,0 % | 71,0 % |
| SINCH.ST | Sinch AB (publ) | teknik | 31,8 | 71,1 | 45,0 % | 71,0 % |
| SEB-A.ST | Skandinaviska Enskilda Banken AB (publ) | finans | 23,7 | 57,7 | 41,0 % | 58,0 % |
| PCELL.ST | PowerCell Sweden AB (publ) | tillvaxt | 21,9 | 55,7 | 39,0 % | 56,0 % |
| VOLCAR-B.ST | Volvo Car AB (publ.) | konsument | 24,1 | 61,9 | 39,0 % | 62,0 % |
| RWE.DE | RWE Aktiengesellschaft | energi | 23,9 | 61,9 | 39,0 % | 62,0 % |
| TSLA | Tesla, Inc. | tillvaxt | 26,8 | 71,1 | 38,0 % | 71,0 % |
| SHB-A.ST | Svenska Handelsbanken AB (publ) | finans | 21,4 | 57,7 | 37,0 % | 58,0 % |
| SWED-A.ST | Swedbank AB (publ) | finans | 19,8 | 57,7 | 34,0 % | 58,0 % |
| NDA-SE.ST | Nordea Bank Abp | finans | 19,0 | 57,7 | 33,0 % | 58,0 % |
| ELUX-B.ST | AB Electrolux (publ) | konsument | 17,9 | 55,7 | 32,0 % | 56,0 % |
| VPLAY-B.ST | Viaplay Group AB (publ) | kommunikation | 18,6 | 67,0 | 28,0 % | 67,0 % |
| PSNY | Polestar Automotive Holding UK PLC | tillvaxt | 6,6 | 41,2 | 16,0 % | 41,0 % |

## 7. Täckning per variabel (osatta av 100 bolag)

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

## 8. Varför täckningen skiljer sig mellan bolag

Alla bolag saknar de alltid-osatta variablerna (V02, V03, V11, V13, V15, V16, V17, V18, V20 —
28,0 viktenheter). Därtill kommer individuella
osattheter bland de beräkningsbara variablerna (V04, V05, V06, V09, V10, V12, V19):

| Extra osatta utöver de alltid-osatta | Viktenheter | Bolag | Täckning |
|--------------------------------------|-------------|-------|----------|
| — (endast de alltid-osatta) | 0,0 | 70 | 71,1 % |
| V04 | 4,0 | 3 | 67,0 % |
| V10 | 4,0 | 1 | 67,0 % |
| V12 | 4,0 | 4 | 67,0 % |
| V10, V12 | 8,0 | 2 | 62,9 % |
| V19 | 9,0 | 5 | 61,9 % |
| V10, V19 | 13,0 | 4 | 57,7 % |
| V12, V19 | 13,0 | 1 | 57,7 % |
| V05, V09, V10 | 14,0 | 1 | 56,7 % |
| V04, V06 | 15,0 | 3 | 55,7 % |
| V06, V10 | 15,0 | 1 | 55,7 % |
| V09, V19 | 15,0 | 1 | 55,7 % |
| V10, V12, V19 | 17,0 | 2 | 53,6 % |
| V04, V06, V12 | 19,0 | 1 | 51,5 % |
| V04, V05, V06, V09, V10 | 29,0 | 1 | 41,2 % |

## 9. Återföring

1. D1 är en **redovisningskalibrering**: bolagspoängen är oförändrade — endast
   status-trösklarna och UI:t visar nu taket som datatäckningen sätter.
2. Varje grön bedömning med täckning < 100 % bör läsas mot sitt maxMöjligt
   (”poäng/max” i korstabellen) — 70 % av ett lägt tak är ett svagare utlåtande.
3. Bästa vägen till täckning ≥ 80 % (grönt täckningschip) förblir pass 2:
   bruttovinsthistorik (V14), aktieantalshistorik (V20), balanshistorik (V11),
   ARR/segment (V02–V03) — se P6 §9.

---

*Verktyg: `verktyg/python/sammanstalla_korstabell.py` (D1-tillägg 2026-09-03,
samma skript som P6-korstabellen — inget nätverk, läser befintliga cacher).*

*AK1A Research Lab — pedagogisk forskning. ALDRIG investeringsråd.*
