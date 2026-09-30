# D1 — Datatäckning och skalade statuströsklar (2026-09-03)

AK1A Research Lab · pedagogisk forskning — **ALDRIG investeringsråd**.

## 1. Bakgrund — det strukturella datakvalitetsfyndet

Pass 1 bedömde 100 bolag med AKM1, men **0,0 % av modellens vikt**
vilar på variabler utan datakällor () — osatta variabler ger
ALLTID 0 poäng (ärlighetsprincipen: modellen gissar aldrig), vilket sänker det
teoretiska poängtaket till ≈ 100,0 för samtliga bolag.
Status-tröskeln ”grön = AKM1 ≥ 70” var därmed i praktiken ouppnåelig
(pass 1:s fasta trösklar gav: grön 0 · gul 6 · röd 316).
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

- **Grön 31 · gul 248 · röd 43** av 322 bedömda bolag
  (fasta trösklar: grön 0 · gul 6 · röd 316).
- **Täckningsspann:** 26,8–71,1 % av modellens vikt
  (maxMöjligt 26,8 → 71,1 poäng).
- **Port-brott (fortfarande röd oavsett kvot):** 1 bolag —
  VPLAY-B.ST.

## 4. Gröna bolag — poäng ≥ 70 % av maxMöjligt OCH täckning ≥ 60 %

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| INDU-C.ST | AB Industrivärden (publ) | industri | 58,1 | 67,0 | 87,0 % | 67,0 % |
| INVE-B.ST | Investor AB (publ) | finans | 54,0 | 62,9 | 86,0 % | 63,0 % |
| PBR | Petróleo Brasileiro S.A. - Petrobras | energi | 57,3 | 71,1 | 81,0 % | 71,0 % |
| 4503.T | Astellas Pharma Inc. | halso | 55,9 | 71,1 | 79,0 % | 71,0 % |
| HLUN.B | H. Lundbeck A/S | halso | 55,5 | 71,1 | 78,0 % | 71,0 % |
| 1605.T | INPEX Corporation | energi | 55,3 | 71,1 | 78,0 % | 71,0 % |
| NEM | Newmont Corporation | material | 55,1 | 71,1 | 77,0 % | 71,0 % |
| ABEV | Ambev S.A. | konsument | 54,6 | 71,1 | 77,0 % | 71,0 % |
| NTES | NetEase, Inc. | konsument | 54,6 | 71,1 | 77,0 % | 71,0 % |
| 005930.KS | Samsung Electronics Co., Ltd. | teknik | 54,2 | 71,1 | 76,0 % | 71,0 % |
| GSK.L | GSK plc | halso | 54,2 | 71,1 | 76,0 % | 71,0 % |
| NHY.OL | Norsk Hydro ASA | material | 53,4 | 71,1 | 75,0 % | 71,0 % |
| TCEHY | Tencent Holdings Limited | teknik | 53,2 | 71,1 | 75,0 % | 71,0 % |
| NOVO-B.CO | Novo Nordisk A/S | halso | 52,8 | 71,1 | 74,0 % | 71,0 % |
| EVO.ST | Evolution AB (publ) | konsument | 52,8 | 71,1 | 74,0 % | 71,0 % |
| 2914.T | Japan Tobacco Inc. | konsument | 52,8 | 71,1 | 74,0 % | 71,0 % |
| ABX | Barrick Gold Corporation | material | 52,8 | 71,1 | 74,0 % | 71,0 % |
| BHP | BHP Group | material | 52,2 | 71,1 | 73,0 % | 71,0 % |
| CMCSA | Comcast Corporation | kommunikation | 52,2 | 71,1 | 73,0 % | 71,0 % |
| T | AT&T Inc. | kommunikation | 52,0 | 71,1 | 73,0 % | 71,0 % |
| ITC.NS | ITC Limited | konsument | 47,0 | 64,9 | 72,0 % | 65,0 % |
| ENEA.ST | Enea AB (publ) | teknik | 51,3 | 71,1 | 72,0 % | 71,0 % |
| INFY.NS | Infosys Limited | teknik | 50,9 | 71,1 | 72,0 % | 71,0 % |
| TEL.OL | Telenor ASA | kommunikation | 50,7 | 71,1 | 71,0 % | 71,0 % |
| BUD | Anheuser-Busch InBev SA/NV | konsument | 50,7 | 71,1 | 71,0 % | 71,0 % |
| ONGC.NS | Oil and Natural Gas Corporation Limited | energi | 46,2 | 64,9 | 71,0 % | 65,0 % |
| LOGN.SW | Logitech International S.A. | teknik | 50,3 | 71,1 | 71,0 % | 71,0 % |
| 000660.KS | SK hynix | teknik | 50,3 | 71,1 | 71,0 % | 71,0 % |
| PUIG.MC | Puig Brands, S.A. | konsument | 50,3 | 71,1 | 71,0 % | 71,0 % |
| DNO.OL | DNO ASA | energi | 49,9 | 71,1 | 70,0 % | 71,0 % |
| FMG.AX | Fortescue Ltd | material | 49,9 | 71,1 | 70,0 % | 71,0 % |

## 5. Gula bolag — poäng 50–70 % av maxMöjligt

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| BBVA.MC | Banco Bilbao Vizcaya Argentaria, S.A. | finans | 31,5 | 42,3 | 74,0 % | 42,0 % |
| GS | The Goldman Sachs Group, Inc. | finans | 38,6 | 53,6 | 72,0 % | 54,0 % |
| FNT.DE | freenet AG | kommunikation | 41,0 | 57,7 | 71,0 % | 58,0 % |
| META | Meta Platforms, Inc. | kommunikation | 49,7 | 71,1 | 70,0 % | 71,0 % |
| GMAB | Genmab A/S | halso | 49,7 | 71,1 | 70,0 % | 71,0 % |
| BCE | BCE Inc. | kommunikation | 49,7 | 71,1 | 70,0 % | 71,0 % |
| RCI-B | Rogers Communications Inc. | kommunikation | 49,7 | 71,1 | 70,0 % | 71,0 % |
| DHL.DE | Deutsche Post AG | industri | 40,2 | 57,7 | 70,0 % | 58,0 % |
| ADYEN.AS | Adyen N.V. | tillvaxt | 43,1 | 61,9 | 70,0 % | 62,0 % |
| 8604.T | Nomura Holdings | finans | 32,2 | 46,4 | 69,0 % | 46,0 % |
| BSX | Boston Scientific Corporation | halso | 49,3 | 71,1 | 69,0 % | 71,0 % |
| REE.MC | Redeia Corporación, S.A. | energi | 49,3 | 71,1 | 69,0 % | 71,0 % |
| MC.PA | LVMH Moët Hennessy - Louis Vuitton, Société Européenne | konsument | 49,1 | 71,1 | 69,0 % | 71,0 % |
| VZ | Verizon Communications Inc. | kommunikation | 49,1 | 71,1 | 69,0 % | 71,0 % |
| BEI.DE | Beiersdorf AG | konsument | 49,1 | 71,1 | 69,0 % | 71,0 % |
| SAN.PA | Sanofi | halso | 49,1 | 71,1 | 69,0 % | 71,0 % |
| HEI.DE | Heidelberg Materials AG | material | 49,1 | 71,1 | 69,0 % | 71,0 % |
| MCD | McDonald's Corporation | konsument | 39,0 | 56,7 | 69,0 % | 57,0 % |
| NP3.ST | NP3 Fastigheter AB (publ) | fastighet | 48,9 | 71,1 | 69,0 % | 71,0 % |
| CNQ | Canadian Natural Resources Limited | energi | 48,9 | 71,1 | 69,0 % | 71,0 % |
| TCS.NS | Tata Consultancy Services Limited | teknik | 48,9 | 71,1 | 69,0 % | 71,0 % |
| RMS.PA | Hermès International | konsument | 48,9 | 71,1 | 69,0 % | 71,0 % |
| LI.PA | Klépierre S.A. | fastighet | 48,9 | 71,1 | 69,0 % | 71,0 % |
| CLN.MC | Cellnex Telecom, S.A. | kommunikation | 48,7 | 71,1 | 68,0 % | 71,0 % |
| AMUN.PA | Amundi S.A. | finans | 45,8 | 67,0 | 68,0 % | 67,0 % |
| EOAN.DE | E.ON SE | energi | 39,4 | 57,7 | 68,0 % | 58,0 % |
| SAP.DE | SAP SE | teknik | 48,5 | 71,1 | 68,0 % | 71,0 % |
| CF | CF Industries Holdings, Inc. | material | 48,2 | 71,1 | 68,0 % | 71,0 % |
| HEN3.DE | Henkel AG & Co. KGaA | konsument | 48,2 | 71,1 | 68,0 % | 71,0 % |
| SN.L | Smith & Nephew plc | halso | 48,2 | 71,1 | 68,0 % | 71,0 % |
| ITUB | Itaú Unibanco Holding S.A. | finans | 22,3 | 33,0 | 68,0 % | 33,0 % |
| NOVN.SW | Novartis AG | halso | 48,0 | 71,1 | 68,0 % | 71,0 % |
| NST.AX | Northern Star Resources Limited | material | 48,0 | 71,1 | 68,0 % | 71,0 % |
| NKE | NIKE, Inc. | konsument | 47,8 | 71,1 | 67,0 % | 71,0 % |
| CVX | Chevron Corporation | energi | 47,8 | 71,1 | 67,0 % | 71,0 % |
| ADS.DE | adidas AG | konsument | 47,8 | 71,1 | 67,0 % | 71,0 % |
| 4751.T | CyberAgent | kommunikation | 47,8 | 71,1 | 67,0 % | 71,0 % |
| BN.PA | Danone | konsument | 47,8 | 71,1 | 67,0 % | 71,0 % |
| RI.PA | Pernod Ricard | konsument | 47,8 | 71,1 | 67,0 % | 71,0 % |
| PG | The Procter & Gamble Company | konsument | 47,6 | 71,1 | 67,0 % | 71,0 % |
| GOOGL | Alphabet Inc. | teknik | 47,4 | 71,1 | 67,0 % | 71,0 % |
| PLTR | Palantir Technologies Inc. | tillvaxt | 47,4 | 71,1 | 67,0 % | 71,0 % |
| DIOS.ST | Diös Fastigheter AB (publ) | fastighet | 37,1 | 55,7 | 67,0 % | 56,0 % |
| BRK-B | Berkshire Hathaway Inc. | finans | 37,1 | 55,7 | 67,0 % | 56,0 % |
| TRUE-B.ST | Truecaller AB (publ) | tillvaxt | 47,2 | 71,1 | 66,0 % | 71,0 % |
| DTE.DE | Deutsche Telekom AG | kommunikation | 47,2 | 71,1 | 66,0 % | 71,0 % |
| FMX | Fomento Económico Mexicano S.A.B. de C.V. | konsument | 47,2 | 71,1 | 66,0 % | 71,0 % |
| DSY.PA | Dassault Systèmes SE | teknik | 47,2 | 71,1 | 66,0 % | 71,0 % |
| SWP.PA | Sword Group S.E. | teknik | 47,2 | 71,1 | 66,0 % | 71,0 % |
| 8411.T | Mizuho Financial Group | finans | 21,9 | 33,0 | 66,0 % | 33,0 % |
| NWG.L | NatWest Group plc | finans | 21,9 | 33,0 | 66,0 % | 33,0 % |
| ALV.DE | Allianz SE | finans | 44,3 | 67,0 | 66,0 % | 67,0 % |
| SAMPO.HE | Sampo Oyj | finans | 44,3 | 67,0 | 66,0 % | 67,0 % |
| RIO | Rio Tinto Group | material | 47,0 | 71,1 | 66,0 % | 71,0 % |
| DGE.L | Diageo plc | konsument | 47,0 | 71,1 | 66,0 % | 71,0 % |
| BHARTIARTL.NS | Bharti Airtel Limited | kommunikation | 46,8 | 71,1 | 66,0 % | 71,0 % |
| PUB.PA | Publicis Groupe S.A. | kommunikation | 46,8 | 71,1 | 66,0 % | 71,0 % |
| MSFT | Microsoft Corporation | teknik | 46,6 | 71,1 | 66,0 % | 71,0 % |
| HM-B.ST | H & M Hennes & Mauritz AB (publ) | konsument | 46,6 | 71,1 | 66,0 % | 71,0 % |
| TTE.PA | TotalEnergies SE | energi | 46,6 | 71,1 | 66,0 % | 71,0 % |
| MUV2.DE | Münchener Rückversicherungs-Gesellschaft AG | finans | 35,1 | 53,6 | 65,0 % | 54,0 % |
| DIS | The Walt Disney Company | kommunikation | 46,4 | 71,1 | 65,0 % | 71,0 % |
| ORES.ST | Investment AB Öresund (publ) | finans | 41,0 | 62,9 | 65,0 % | 63,0 % |
| HEXA-B.ST | Hexagon AB (publ) | industri | 46,2 | 71,1 | 65,0 % | 71,0 % |
| VALE | Vale S.A. | material | 46,2 | 71,1 | 65,0 % | 71,0 % |
| ERIC-B.ST | Telefonaktiebolaget LM Ericsson (publ) | teknik | 43,5 | 67,0 | 65,0 % | 67,0 % |
| BNP.PA | BNP Paribas | finans | 21,4 | 33,0 | 65,0 % | 33,0 % |
| GLE.PA | Société Générale S.A. | finans | 21,4 | 33,0 | 65,0 % | 33,0 % |
| BARC.L | Barclays plc | finans | 21,4 | 33,0 | 65,0 % | 33,0 % |
| COLO-B.CO | Coloplast A/S | halso | 46,0 | 71,1 | 65,0 % | 71,0 % |
| SUBC.OL | Subsea 7 S.A. | energi | 46,0 | 71,1 | 65,0 % | 71,0 % |
| TMUS | T-Mobile US, Inc. | kommunikation | 46,0 | 71,1 | 65,0 % | 71,0 % |
| CNR | Canadian National Railway Company | industri | 46,0 | 71,1 | 65,0 % | 71,0 % |
| AEM | Agnico Eagle Mines Limited | material | 46,0 | 71,1 | 65,0 % | 71,0 % |
| BT.L | BT Group plc | kommunikation | 37,3 | 57,7 | 65,0 % | 58,0 % |
| LLY | Eli Lilly and Company | halso | 45,8 | 71,1 | 64,0 % | 71,0 % |
| 9983.T | Fast Retailing Co., Ltd. | konsument | 45,8 | 71,1 | 64,0 % | 71,0 % |
| CARL-B.CO | Carlsberg A/S | konsument | 45,6 | 71,1 | 64,0 % | 71,0 % |
| ROG.SW | Roche Holding AG | halso | 45,6 | 71,1 | 64,0 % | 71,0 % |
| URW.PA | Unibail-Rodamco-Westfield SE | fastighet | 45,6 | 71,1 | 64,0 % | 71,0 % |
| PEP | PepsiCo, Inc. | konsument | 45,6 | 71,1 | 64,0 % | 71,0 % |
| SOBI.ST | Swedish Orphan Biovitrum AB (publ) | halso | 45,6 | 71,1 | 64,0 % | 71,0 % |
| 4063.T | Shin-Etsu Chemical Co., Ltd. | material | 45,6 | 71,1 | 64,0 % | 71,0 % |
| AT1.DE | Aroundtown SA | fastighet | 45,6 | 71,1 | 64,0 % | 71,0 % |
| 8750.T | Daiichi Life Group | finans | 42,9 | 67,0 | 64,0 % | 67,0 % |
| ABNB | Airbnb, Inc. | tillvaxt | 45,4 | 71,1 | 64,0 % | 71,0 % |
| HDFCBANK.NS | HDFC Bank Limited | finans | 21,0 | 33,0 | 64,0 % | 33,0 % |
| SAN.MC | Banco Santander | finans | 21,0 | 33,0 | 64,0 % | 33,0 % |
| ICICIBANK.NS | ICICI Bank Limited | finans | 21,0 | 33,0 | 64,0 % | 33,0 % |
| WIHL.ST | Wihlborgs Fastigheter AB (publ) | fastighet | 45,2 | 71,1 | 64,0 % | 71,0 % |
| CAP.PA | Capgemini SE | teknik | 45,2 | 71,1 | 64,0 % | 71,0 % |
| 6301.T | Komatsu Ltd. | industri | 45,2 | 71,1 | 64,0 % | 71,0 % |
| ENG.MC | Enagás, S.A. | nyttovalt | 45,2 | 71,1 | 64,0 % | 71,0 % |
| V | Visa Inc. | finans | 42,5 | 67,0 | 63,0 % | 67,0 % |
| MA | Mastercard Incorporated | finans | 42,5 | 67,0 | 63,0 % | 67,0 % |
| ABBV | AbbVie Inc. | halso | 35,9 | 56,7 | 63,0 % | 57,0 % |
| ASM.AS | ASM International NV | teknik | 44,9 | 71,1 | 63,0 % | 71,0 % |
| NVDA | NVIDIA Corporation | tillvaxt | 44,9 | 71,1 | 63,0 % | 71,0 % |
| ASML.AS | ASML Holding N.V. | teknik | 44,9 | 71,1 | 63,0 % | 71,0 % |
| RACE | Ferrari N.V. | konsument | 44,9 | 71,1 | 63,0 % | 71,0 % |
| 9433.T | KDDI Corporation | kommunikation | 44,9 | 71,1 | 63,0 % | 71,0 % |
| LSEG.L | London Stock Exchange Group | finans | 42,3 | 67,0 | 63,0 % | 67,0 % |
| SHEL | Shell plc | energi | 44,7 | 71,1 | 63,0 % | 71,0 % |
| ELE.MC | Endesa, S.A. | nyttovalt | 44,7 | 71,1 | 63,0 % | 71,0 % |
| BLK | BlackRock, Inc. | finans | 42,1 | 67,0 | 63,0 % | 67,0 % |
| TRN.MI | Terna S.p.A. | energi | 38,8 | 61,9 | 63,0 % | 62,0 % |
| SUNPHARMA.NS | Sun Pharmaceutical Industries Limited | halso | 44,5 | 71,1 | 63,0 % | 71,0 % |
| 8306.T | Mitsubishi UFJ Financial Group | finans | 20,6 | 33,0 | 62,0 % | 33,0 % |
| CATE.ST | Catena AB (publ) | fastighet | 44,1 | 71,1 | 62,0 % | 71,0 % |
| HUFV-A.ST | Hufvudstaden AB (publ) | fastighet | 44,1 | 71,1 | 62,0 % | 71,0 % |
| TEL2-A.ST | Tele2 AB (publ) | kommunikation | 44,1 | 71,1 | 62,0 % | 71,0 % |
| TSM | Taiwan Semiconductor Manufacturing (TSMC) | teknik | 44,1 | 71,1 | 62,0 % | 71,0 % |
| KO | The Coca-Cola Company | konsument | 44,1 | 71,1 | 62,0 % | 71,0 % |
| SOON.SW | Sonova Holding AG | halso | 44,1 | 71,1 | 62,0 % | 71,0 % |
| 4452.T | Kao Corporation | konsument | 44,1 | 71,1 | 62,0 % | 71,0 % |
| ESSITY-B.ST | Essity AB (publ) | konsument | 43,9 | 71,1 | 62,0 % | 71,0 % |
| NFLX | Netflix, Inc. | kommunikation | 43,9 | 71,1 | 62,0 % | 71,0 % |
| UBER | Uber Technologies, Inc. | tillvaxt | 43,9 | 71,1 | 62,0 % | 71,0 % |
| COP | ConocoPhillips | energi | 43,9 | 71,1 | 62,0 % | 71,0 % |
| ENGI.PA | Engie S.A. | energi | 43,9 | 71,1 | 62,0 % | 71,0 % |
| SGO.PA | Compagnie de Saint-Gobain S.A. | material | 43,9 | 71,1 | 62,0 % | 71,0 % |
| CEVI.ST | CellaVision AB (publ) | halso | 43,7 | 71,1 | 61,0 % | 71,0 % |
| PFE | Pfizer Inc. | halso | 43,7 | 71,1 | 61,0 % | 71,0 % |
| IVSO.ST | Invisio AB (publ) | kommunikation | 43,7 | 71,1 | 61,0 % | 71,0 % |
| FCX | Freeport-McMoRan Inc. | material | 43,7 | 71,1 | 61,0 % | 71,0 % |
| GETI-B.ST | Getinge AB (publ) | halso | 43,5 | 71,1 | 61,0 % | 71,0 % |
| MTG-B.ST | Modern Times Group MTG AB | kommunikation | 43,5 | 71,1 | 61,0 % | 71,0 % |
| MELI | MercadoLibre | tillvaxt | 43,5 | 71,1 | 61,0 % | 71,0 % |
| SGE.L | The Sage Group plc | teknik | 43,5 | 71,1 | 61,0 % | 71,0 % |
| PSON.L | Pearson plc | kommunikation | 43,5 | 71,1 | 61,0 % | 71,0 % |
| JNJ | Johnson & Johnson | halso | 43,3 | 71,1 | 61,0 % | 71,0 % |
| BALD-B.ST | Fastighets AB Balder (publ) | fastighet | 43,3 | 71,1 | 61,0 % | 71,0 % |
| FABG.ST | Fabege AB (publ) | fastighet | 43,3 | 71,1 | 61,0 % | 71,0 % |
| ARM | Arm Holdings plc | teknik | 43,3 | 71,1 | 61,0 % | 71,0 % |
| OR.PA | L'Oréal | konsument | 43,3 | 71,1 | 61,0 % | 71,0 % |
| LT.NS | Larsen & Toubro Limited | industri | 43,3 | 71,1 | 61,0 % | 71,0 % |
| HAL.NS | Hindustan Aeronautics Limited | industri | 43,3 | 71,1 | 61,0 % | 71,0 % |
| EQT.ST | EQT AB (publ) | finans | 40,8 | 67,0 | 61,0 % | 67,0 % |
| ULVR.L | Unilever PLC | konsument | 43,1 | 71,1 | 61,0 % | 71,0 % |
| BOL.ST | Boliden AB (publ) | material | 42,9 | 71,1 | 60,0 % | 71,0 % |
| AMBU.B | Ambu A/S | halso | 42,9 | 71,1 | 60,0 % | 71,0 % |
| 9434.T | SoftBank Corp | kommunikation | 42,9 | 71,1 | 60,0 % | 71,0 % |
| AMZN | Amazon.com, Inc. | teknik | 37,3 | 61,9 | 60,0 % | 62,0 % |
| UBSG.SW | UBS Group AG | finans | 19,8 | 33,0 | 60,0 % | 33,0 % |
| 9531.T | Tokyo Gas Co., Ltd. | energi | 34,6 | 57,7 | 60,0 % | 58,0 % |
| CAST.ST | Castellum AB (publ) | fastighet | 37,1 | 61,9 | 60,0 % | 62,0 % |
| SAND.ST | Sandvik AB (publ) | industri | 42,5 | 71,1 | 60,0 % | 71,0 % |
| AZN.ST | AstraZeneca PLC | halso | 42,5 | 71,1 | 60,0 % | 71,0 % |
| WALL-B.ST | Wallenstam AB (publ) | fastighet | 42,5 | 71,1 | 60,0 % | 71,0 % |
| XOM | ExxonMobil Holdings Corporation | energi | 42,5 | 71,1 | 60,0 % | 71,0 % |
| TELUS | TELUS Corporation | kommunikation | 42,5 | 71,1 | 60,0 % | 71,0 % |
| SHL.DE | Siemens Healthineers AG | halso | 42,5 | 71,1 | 60,0 % | 71,0 % |
| EL.PA | EssilorLuxottica S.A. | halso | 42,5 | 71,1 | 60,0 % | 71,0 % |
| 6501.T | Hitachi, Ltd. | industri | 34,4 | 57,7 | 60,0 % | 58,0 % |
| IBE.MC | Iberdrola, S.A. | energi | 42,3 | 71,1 | 59,0 % | 71,0 % |
| SAF.PA | Safran S.A. | industri | 42,3 | 71,1 | 59,0 % | 71,0 % |
| ASSA-B.ST | ASSA ABLOY AB (publ) | industri | 42,1 | 71,1 | 59,0 % | 71,0 % |
| ATT.ST | Attendo AB (publ) | halso | 42,1 | 71,1 | 59,0 % | 71,0 % |
| STMN.SW | Straumann Holding AG | halso | 42,1 | 71,1 | 59,0 % | 71,0 % |
| ORA.PA | Orange S.A. | kommunikation | 42,1 | 71,1 | 59,0 % | 71,0 % |
| AI.PA | Air Liquide S.A. | material | 42,1 | 71,1 | 59,0 % | 71,0 % |
| SOP.PA | Sopra Steria Group SA | teknik | 42,1 | 71,1 | 59,0 % | 71,0 % |
| ALFA.ST | Alfa Laval AB (publ) | industri | 41,9 | 71,1 | 59,0 % | 71,0 % |
| EQNR.OL | Equinor ASA | energi | 41,9 | 71,1 | 59,0 % | 71,0 % |
| CS.PA | AXA SA | finans | 24,9 | 42,3 | 59,0 % | 42,0 % |
| ACA.PA | Crédit Agricole S.A. | finans | 19,4 | 33,0 | 59,0 % | 33,0 % |
| TD | The Toronto-Dominion Bank | finans | 19,4 | 33,0 | 59,0 % | 33,0 % |
| NTDOY | Nintendo Co., Ltd. | kommunikation | 41,6 | 71,1 | 59,0 % | 71,0 % |
| AMT | American Tower Corporation | fastighet | 41,6 | 71,1 | 59,0 % | 71,0 % |
| 4568.T | Daiichi Sankyo Company, Limited | halso | 41,6 | 71,1 | 59,0 % | 71,0 % |
| PLD | Prologis, Inc. | fastighet | 39,2 | 67,0 | 59,0 % | 67,0 % |
| 4502.T | Takeda Pharmaceutical Company Limited | halso | 39,2 | 67,0 | 59,0 % | 67,0 % |
| HINDUNILVR.NS | Hindustan Unilever | konsument | 37,9 | 64,9 | 58,0 % | 65,0 % |
| AAPL | Apple Inc. | teknik | 41,4 | 71,1 | 58,0 % | 71,0 % |
| VNA.DE | Vonovia SE | fastighet | 41,4 | 71,1 | 58,0 % | 71,0 % |
| SIE.DE | Siemens AG | industri | 41,4 | 71,1 | 58,0 % | 71,0 % |
| CRWD | CrowdStrike Holdings, Inc. | tillvaxt | 34,8 | 59,8 | 58,0 % | 60,0 % |
| NESN.SW | Nestlé S.A. | konsument | 41,2 | 71,1 | 58,0 % | 71,0 % |
| PSA | Public Storage | fastighet | 41,2 | 71,1 | 58,0 % | 71,0 % |
| ORCL | Oracle Corporation | teknik | 35,7 | 61,9 | 58,0 % | 62,0 % |
| VIT-B.ST | Vitec Software Group AB (publ) | teknik | 35,7 | 61,9 | 58,0 % | 62,0 % |
| TELIA.ST | Telia Company AB (publ) | kommunikation | 41,0 | 71,1 | 58,0 % | 71,0 % |
| S32.AX | South32 Limited | material | 41,0 | 71,1 | 58,0 % | 71,0 % |
| VAR.OL | Vår Energi ASA | energi | 40,8 | 71,1 | 57,0 % | 71,0 % |
| SPG | Simon Property Group, Inc. | fastighet | 40,8 | 71,1 | 57,0 % | 71,0 % |
| CP | Canadian Pacific Kansas City Limited | industri | 40,8 | 71,1 | 57,0 % | 71,0 % |
| TRYG.CO | Tryg A/S | finans | 38,4 | 67,0 | 57,0 % | 67,0 % |
| ABB.ST | ABB Ltd | industri | 40,6 | 71,1 | 57,0 % | 71,0 % |
| SHOP | Shopify Inc. | tillvaxt | 40,6 | 71,1 | 57,0 % | 71,0 % |
| VER.VI | VERBUND AG | nyttovalt | 40,6 | 71,1 | 57,0 % | 71,0 % |
| HFG.DE | HelloFresh SE | tillvaxt | 38,1 | 67,0 | 57,0 % | 67,0 % |
| NESTE.HE | Neste Oyj | energi | 40,4 | 71,1 | 57,0 % | 71,0 % |
| RELIANCE.NS | Reliance Industries | energi | 40,4 | 71,1 | 57,0 % | 71,0 % |
| SPOT | Spotify Technology S.A. | kommunikation | 40,2 | 71,1 | 57,0 % | 71,0 % |
| EMBJ | Embraer S.A. | industri | 40,2 | 71,1 | 57,0 % | 71,0 % |
| BP.L | BP p.l.c. | energi | 40,2 | 71,1 | 57,0 % | 71,0 % |
| KINV-B.ST | Kinnevik AB | tillvaxt | 29,1 | 51,5 | 57,0 % | 52,0 % |
| RY | Royal Bank of Canada | finans | 18,6 | 33,0 | 56,0 % | 33,0 % |
| VIE.PA | Veolia Environnement S.A. | industri | 40,0 | 71,1 | 56,0 % | 71,0 % |
| 8035.T | Tokyo Electron Limited | teknik | 39,8 | 71,1 | 56,0 % | 71,0 % |
| ENEL.MI | Enel SpA | energi | 39,6 | 71,1 | 56,0 % | 71,0 % |
| 6752.T | Panasonic Holdings Corporation | teknik | 39,6 | 71,1 | 56,0 % | 71,0 % |
| GE | GE Aerospace | industri | 37,3 | 67,0 | 56,0 % | 67,0 % |
| LATO-B.ST | Investment AB Latour (publ) | finans | 37,3 | 67,0 | 56,0 % | 67,0 % |
| DUK | Duke Energy Corporation | nyttovalt | 34,4 | 61,9 | 56,0 % | 62,0 % |
| EXC | Exelon Corporation | nyttovalt | 34,4 | 61,9 | 56,0 % | 62,0 % |
| ATCO-A.ST | Atlas Copco AB (publ) | industri | 39,4 | 71,1 | 55,0 % | 71,0 % |
| 4661.T | Oriental Land Co., Ltd. | konsument | 39,4 | 71,1 | 55,0 % | 71,0 % |
| HSBA.L | HSBC Holdings plc | finans | 14,8 | 26,8 | 55,0 % | 27,0 % |
| O | Realty Income Corporation | fastighet | 34,0 | 61,9 | 55,0 % | 62,0 % |
| SHW | The Sherwin-Williams Company | material | 39,0 | 71,1 | 55,0 % | 71,0 % |
| APOLLOHOSP.NS | Apollo Hospitals Enterprise Limited | halso | 39,0 | 71,1 | 55,0 % | 71,0 % |
| LLOY.L | Lloyds Banking Group plc | finans | 18,1 | 33,0 | 55,0 % | 33,0 % |
| NTR | Nutrien Ltd. | material | 38,8 | 71,1 | 55,0 % | 71,0 % |
| ETN | Eaton Corporation plc | industri | 38,6 | 71,1 | 54,0 % | 71,0 % |
| HOLM-B.ST | Holmen AB (publ) | material | 38,6 | 71,1 | 54,0 % | 71,0 % |
| SE | Sea Limited | tillvaxt | 38,4 | 71,1 | 54,0 % | 71,0 % |
| RR.L | Rolls-Royce Holdings plc | industri | 38,4 | 71,1 | 54,0 % | 71,0 % |
| ITX.MC | Industria de Diseño Textil, S.A. | konsument | 31,1 | 57,7 | 54,0 % | 58,0 % |
| AKRBP.OL | Aker BP ASA | energi | 33,2 | 61,9 | 54,0 % | 62,0 % |
| SKA-B.ST | Skanska AB (publ) | industri | 38,1 | 71,1 | 54,0 % | 71,0 % |
| SLB | SLB (Schlumberger) | energi | 38,1 | 71,1 | 54,0 % | 71,0 % |
| AMD | Advanced Micro Devices, Inc. | tillvaxt | 37,9 | 71,1 | 53,0 % | 71,0 % |
| ENI.MI | Eni S.p.A. | energi | 37,9 | 71,1 | 53,0 % | 71,0 % |
| A3M.MC | Atresmedia Corporación de Medios de Comunicación, S.A. | kommunikation | 37,7 | 71,1 | 53,0 % | 71,0 % |
| KLAR | Klarna Group plc | tillvaxt | 24,5 | 46,4 | 53,0 % | 46,0 % |
| KAMBI.ST | Kambi Group plc | teknik | 37,5 | 71,1 | 53,0 % | 71,0 % |
| SCA-B.ST | Svenska Cellulosa Aktiebolaget SCA (publ) | material | 37,5 | 71,1 | 53,0 % | 71,0 % |
| JPM | JPMorgan Chase & Co. | finans | 28,2 | 53,6 | 53,0 % | 54,0 % |
| ENB | Enbridge Inc. | energi | 37,1 | 71,1 | 52,0 % | 71,0 % |
| NOKIA.HE | Nokia Oyj | teknik | 36,9 | 71,1 | 52,0 % | 71,0 % |
| YAR.OL | Yara International ASA | material | 36,9 | 71,1 | 52,0 % | 71,0 % |
| BIDU | Baidu, Inc. | teknik | 29,9 | 57,7 | 52,0 % | 58,0 % |
| NEE | NextEra Energy, Inc. | nyttovalt | 32,0 | 61,9 | 52,0 % | 62,0 % |
| CAT | Caterpillar Inc. | industri | 36,7 | 71,1 | 52,0 % | 71,0 % |
| BILL.ST | Billerud AB (publ) | material | 28,7 | 55,7 | 52,0 % | 56,0 % |
| TM | Toyota Motor Corporation | konsument | 31,8 | 61,9 | 51,0 % | 62,0 % |
| VOLV-B.ST | AB Volvo (publ) | industri | 36,5 | 71,1 | 51,0 % | 71,0 % |
| IFX.DE | Infineon Technologies AG | teknik | 36,5 | 71,1 | 51,0 % | 71,0 % |
| EKTA-B.ST | Elekta AB (publ) | halso | 34,2 | 67,0 | 51,0 % | 67,0 % |
| NG.L | National Grid plc | energi | 24,7 | 48,5 | 51,0 % | 48,0 % |
| 9432.T | Nippon Telegraph and Telephone | kommunikation | 31,3 | 61,9 | 51,0 % | 62,0 % |
| AIR.PA | Airbus SE | industri | 35,9 | 71,1 | 50,0 % | 71,0 % |
| BOOZT | Boozt AB (publ) | tillvaxt | 35,9 | 71,1 | 50,0 % | 71,0 % |
| GRNG-B.ST | Gränges AB (publ) | material | 31,1 | 61,9 | 50,0 % | 62,0 % |
| SKF-B.ST | AB SKF (publ) | industri | 35,7 | 71,1 | 50,0 % | 71,0 % |
| FORTUM.HE | Fortum Oyj | energi | 35,7 | 71,1 | 50,0 % | 71,0 % |
| DSV.CO | DSV A/S | industri | 35,7 | 71,1 | 50,0 % | 71,0 % |

## 6. Röda bolag — poäng < 50 % av maxMöjligt eller port-brott

| Ticker | Bolag | Bransch | AKM1 | Max | Kvot | Täckning |
|--------|-------|---------|------|-----|------|----------|
| HOLN.SW | Holcim AG | material | 35,5 | 71,1 | 50,0 % | 71,0 % |
| BA.L | BAE Systems plc | industri | 35,5 | 71,1 | 50,0 % | 71,0 % |
| NUE | Nucor Corporation | material | 35,3 | 71,1 | 50,0 % | 71,0 % |
| EQIX | Equinix, Inc. | fastighet | 30,7 | 61,9 | 50,0 % | 62,0 % |
| VWS.CO | Vestas Wind Systems A/S | energi | 35,1 | 71,1 | 49,0 % | 71,0 % |
| MBG.DE | Mercedes-Benz Group AG | konsument | 34,8 | 71,1 | 49,0 % | 71,0 % |
| SRT3.DE | Sartorius AG | tillvaxt | 34,8 | 71,1 | 49,0 % | 71,0 % |
| AXFO.ST | Axfood AB (publ) | konsument | 34,6 | 71,1 | 49,0 % | 71,0 % |
| SO | The Southern Company | nyttovalt | 30,1 | 61,9 | 49,0 % | 62,0 % |
| LMT | Lockheed Martin Corporation | industri | 34,2 | 71,1 | 48,0 % | 71,0 % |
| NOTE.ST | NOTE AB (publ) | teknik | 34,2 | 71,1 | 48,0 % | 71,0 % |
| BABA | Alibaba Group Holding Limited | konsument | 29,7 | 61,9 | 48,0 % | 62,0 % |
| AEP | American Electric Power Company, Inc. | nyttovalt | 29,7 | 61,9 | 48,0 % | 62,0 % |
| ORSTED.CO | Ørsted A/S | energi | 27,6 | 57,7 | 48,0 % | 58,0 % |
| WMT | Walmart Inc. | konsument | 33,8 | 71,1 | 48,0 % | 71,0 % |
| WBD | Warner Bros. Discovery, Inc. | kommunikation | 31,5 | 67,0 | 47,0 % | 67,0 % |
| FRE.DE | Fresenius SE & Co. KGaA | halso | 33,2 | 71,1 | 47,0 % | 71,0 % |
| 3382.T | Seven & i Holdings Co., Ltd. | konsument | 33,2 | 71,1 | 47,0 % | 71,0 % |
| SSAB-B.ST | SSAB AB (publ) | material | 28,7 | 61,9 | 46,0 % | 62,0 % |
| STERV.HE | Stora Enso Oyj | material | 32,6 | 71,1 | 46,0 % | 71,0 % |
| UPM.HE | UPM-Kymmene Oyj | material | 32,6 | 71,1 | 46,0 % | 71,0 % |
| MAERSK-B.CO | A.P. Møller - Mærsk A/S | industri | 28,0 | 61,9 | 45,0 % | 62,0 % |
| GALE.SW | Galenica AG | halso | 32,0 | 71,1 | 45,0 % | 71,0 % |
| SINCH.ST | Sinch AB (publ) | teknik | 31,8 | 71,1 | 45,0 % | 71,0 % |
| STMPA.PA | STMicroelectronics N.V. | teknik | 31,5 | 71,1 | 44,0 % | 71,0 % |
| VOW3.DE | Volkswagen AG | konsument | 31,1 | 71,1 | 44,0 % | 71,0 % |
| BAS.DE | BASF SE | material | 30,7 | 71,1 | 43,0 % | 71,0 % |
| SEB-A.ST | Skandinaviska Enskilda Banken AB (publ) | finans | 23,7 | 57,7 | 41,0 % | 58,0 % |
| 5401.T | Nippon Steel Corporation | material | 25,4 | 61,9 | 41,0 % | 62,0 % |
| MT | ArcelorMittal S.A. | material | 28,9 | 71,1 | 41,0 % | 71,0 % |
| 8316.T | Sumitomo Mitsui Financial Group | finans | 10,7 | 26,8 | 40,0 % | 27,0 % |
| PCELL.ST | PowerCell Sweden AB (publ) | tillvaxt | 21,9 | 55,7 | 39,0 % | 56,0 % |
| VOLCAR-B.ST | Volvo Car AB (publ.) | konsument | 24,1 | 61,9 | 39,0 % | 62,0 % |
| RWE.DE | RWE Aktiengesellschaft | energi | 23,9 | 61,9 | 39,0 % | 62,0 % |
| TSLA | Tesla, Inc. | tillvaxt | 26,8 | 71,1 | 38,0 % | 71,0 % |
| BMW.DE | Bayerische Motoren Werke Aktiengesellschaft | konsument | 23,3 | 61,9 | 38,0 % | 62,0 % |
| SHB-A.ST | Svenska Handelsbanken AB (publ) | finans | 21,4 | 57,7 | 37,0 % | 58,0 % |
| BA | The Boeing Company | industri | 22,1 | 59,8 | 37,0 % | 60,0 % |
| SWED-A.ST | Swedbank AB (publ) | finans | 19,8 | 57,7 | 34,0 % | 58,0 % |
| NDA-SE.ST | Nordea Bank Abp | finans | 19,0 | 57,7 | 33,0 % | 58,0 % |
| ELUX-B.ST | AB Electrolux (publ) | konsument | 17,9 | 55,7 | 32,0 % | 56,0 % |
| VPLAY-B.ST | Viaplay Group AB (publ) | kommunikation | 18,6 | 67,0 | 28,0 % | 67,0 % |
| PSNY | Polestar Automotive Holding UK PLC | tillvaxt | 6,6 | 41,2 | 16,0 % | 41,0 % |

## 7. Täckning per variabel (osatta av 100 bolag)

| Variabel | Namn | Vikt % | Osatta | Beräkningsbara |
|----------|------|--------|--------|----------------|
| V01 | Försäljningstillväxt | 8,0 | 0 | 100 |
| V02 | ARR-tillväxt | 4,0 | 322 | -222 |
| V03 | Intäktsdiversifiering | 3,0 | 322 | -222 |
| V04 | P/S | 4,0 | 13 | 87 |
| V05 | P/B | 4,0 | 3 | 97 |
| V06 | EV/EBITDA | 11,0 | 29 | 71 |
| V07 | Bruttomarginal | 10,0 | 27 | 73 |
| V08 | EBITDA-marginal | 6,0 | 2 | 98 |
| V09 | ROE | 6,0 | 7 | 93 |
| V10 | Skuldsättningsgrad | 4,0 | 44 | 56 |
| V11 | Likviditet | 4,0 | 322 | -222 |
| V12 | Intäktsstabilitet | 4,0 | 10 | 90 |
| V13 | Patent & IP | 4,0 | 322 | -222 |
| V14 | Varumärke & kundlojalitet | 3,0 | 27 | 73 |
| V15 | Nätverkseffekter | 3,0 | 322 | -222 |
| V16 | Produktlanseringar | 2,0 | 322 | -222 |
| V17 | Avtal & partnerskap | 2,0 | 322 | -222 |
| V18 | Regulatoriska katalysatorer | 2,0 | 322 | -222 |
| V19 | Kassatäckning — nyemissionsrisk | 9,0 | 54 | 46 |
| V20 | Återköp av egna aktier | 4,0 | 322 | -222 |

## 8. Varför täckningen skiljer sig mellan bolag

Alla bolag saknar de alltid-osatta variablerna ( —
0,0 viktenheter). Därtill kommer individuella
osattheter bland de beräkningsbara variablerna (V04, V05, V06, V09, V10, V12, V19):

| Extra osatta utöver de alltid-osatta | Viktenheter | Bolag | Täckning |
|--------------------------------------|-------------|-------|----------|
| V02, V03, V11, V13, V15, V16, V17, V18, V20 | 28,0 | 224 | 71,1 % |
| V02, V03, V04, V11, V13, V15, V16, V17, V18, V20 | 32,0 | 5 | 67,0 % |
| V02, V03, V10, V11, V13, V15, V16, V17, V18, V20 | 32,0 | 11 | 67,0 % |
| V02, V03, V11, V12, V13, V15, V16, V17, V18, V20 | 32,0 | 4 | 67,0 % |
| V02, V03, V09, V11, V13, V15, V16, V17, V18, V20 | 34,0 | 3 | 64,9 % |
| V02, V03, V10, V11, V12, V13, V15, V16, V17, V18, V20 | 36,0 | 2 | 62,9 % |
| V02, V03, V11, V13, V15, V16, V17, V18, V19, V20 | 37,0 | 24 | 61,9 % |
| V02, V03, V06, V11, V13, V15, V16, V17, V18, V20 | 39,0 | 2 | 59,8 % |
| V02, V03, V04, V11, V13, V15, V16, V17, V18, V19, V20 | 41,0 | 2 | 57,7 % |
| V02, V03, V07, V11, V13, V14, V15, V16, V17, V18, V20 | 41,0 | 6 | 57,7 % |
| V02, V03, V10, V11, V13, V15, V16, V17, V18, V19, V20 | 41,0 | 4 | 57,7 % |
| V02, V03, V11, V12, V13, V15, V16, V17, V18, V19, V20 | 41,0 | 1 | 57,7 % |
| V02, V03, V05, V09, V10, V11, V13, V15, V16, V17, V18, V20 | 42,0 | 2 | 56,7 % |
| V02, V03, V04, V06, V11, V13, V15, V16, V17, V18, V20 | 43,0 | 3 | 55,7 % |
| V02, V03, V06, V10, V11, V13, V15, V16, V17, V18, V20 | 43,0 | 1 | 55,7 % |
| V02, V03, V09, V11, V13, V15, V16, V17, V18, V19, V20 | 43,0 | 1 | 55,7 % |
| V02, V03, V07, V10, V11, V13, V14, V15, V16, V17, V18, V20 | 45,0 | 1 | 53,6 % |
| V02, V03, V10, V11, V12, V13, V15, V16, V17, V18, V19, V20 | 45,0 | 2 | 53,6 % |
| V02, V03, V04, V06, V11, V12, V13, V15, V16, V17, V18, V20 | 47,0 | 1 | 51,5 % |
| V02, V03, V07, V11, V13, V14, V15, V16, V17, V18, V19, V20 | 50,0 | 1 | 48,5 % |
| V02, V03, V04, V06, V11, V13, V15, V16, V17, V18, V19, V20 | 52,0 | 1 | 46,4 % |
| V02, V03, V06, V10, V11, V13, V15, V16, V17, V18, V19, V20 | 52,0 | 1 | 46,4 % |
| V02, V03, V06, V07, V10, V11, V13, V14, V15, V16, V17, V18, V20 | 56,0 | 2 | 42,3 % |
| V02, V03, V04, V05, V06, V09, V10, V11, V13, V15, V16, V17, V18, V20 | 57,0 | 1 | 41,2 % |
| V02, V03, V06, V07, V10, V11, V13, V14, V15, V16, V17, V18, V19, V20 | 65,0 | 15 | 33,0 % |
| V02, V03, V06, V07, V08, V10, V11, V13, V14, V15, V16, V17, V18, V19, V20 | 71,0 | 2 | 26,8 % |

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
