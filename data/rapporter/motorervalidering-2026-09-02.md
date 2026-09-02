---

# Motorervalidering — 2026-09-02T12:10:03.939Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 3.8 s (budget 90 s, inom budget)
- **Internt (tsx):** 1.7 s; startad 2026-09-02T12:10:02.218Z, klar 2026-09-02T12:10:03.883Z

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 4 | 0 | 0 |
| netnet | 2 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 0 | 0 | 1 |
| gränser | 5 | 0 | 0 |
| **Totalt** | **20** | **0** | **1** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1098 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1100 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1100 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1101 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1101 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=339.1 pos52=0.77 sammanfattning={"bull":15,"bear":0,"neutral":10} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1101 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=606.8 pos52=0.739 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1102 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":-0.0347,"kort":0.0408,"medellang":0.1657,"lang":0.5018,"mega":0.7636} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 1102 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0535,"kort":0.1541,"medellang":0.1338,"lang":3.2183,"mega":8.4924} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 1102 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=339.1 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=19.2452 pb=3.6164 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1102 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=606.8 ncavPerAktie=19.0639 forhallande=31.8298 klass=ej pe=46.1094 pb=6.5123 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1102 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1102 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1102 |
| netnet/NCAV | GRAHAM_TROSKEL-konstant | **PASS** | 0.667 | exporterad konstant=0.667 (förväntat 0.667 = 2/3) | 1102 |
| konfluens | konfluens-fält i [0,100] | **SKIP** | 0 konfluens-fält hittade i motorernas output | ingen konfluens-motor i src/lib (vagfundament/analys/netnet saknar konfluens-fält i output — verifierat programmatiskt) — kontroll hoppas över enligt instruktion | 1104 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | hash-lik längd=10267 | två separata körningar gav byte-identisk JSON (10267 tecken) — konsistent med frusen marknadsdata | 1294 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 1665 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 1665 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 1665 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 1665 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 1665 |

_Rapport genererad av verktyg/validera-motorer.mjs — kontroller: struktur, matematik (NCAV m.m.), determinism, gränser, robusthet (90 s)._
