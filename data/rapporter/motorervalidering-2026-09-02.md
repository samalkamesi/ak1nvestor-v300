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
---

# Motorervalidering — 2026-09-03T19:10:31.493Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 3.8 s (budget 90 s, inom budget)
- **Internt (tsx):** 1.6 s; startad 2026-09-03T19:10:29.796Z, klar 2026-09-03T19:10:31.436Z

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
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1091 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1093 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1093 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1094 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1094 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1094 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1094 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 1094 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 1094 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1094 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1094 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1094 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1095 |
| netnet/NCAV | GRAHAM_TROSKEL-konstant | **PASS** | 0.667 | exporterad konstant=0.667 (förväntat 0.667 = 2/3) | 1095 |
| konfluens | konfluens-fält i [0,100] | **SKIP** | 0 konfluens-fält hittade i motorernas output | ingen konfluens-motor i src/lib (vagfundament/analys/netnet saknar konfluens-fält i output — verifierat programmatiskt) — kontroll hoppas över enligt instruktion | 1096 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | hash-lik längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1277 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 1639 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 1639 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 1639 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 1639 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 1639 |

_Rapport genererad av verktyg/validera-motorer.mjs — kontroller: struktur, matematik (NCAV m.m.), determinism, gränser, robusthet (90 s)._
---

# Motorervalidering — 2026-09-03T19:15:00.916Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 3.5 s (budget 90 s, inom budget)
- **Internt (tsx):** 1.5 s; startad 2026-09-03T19:14:59.402Z, klar 2026-09-03T19:15:00.854Z

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
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 961 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 963 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 964 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 964 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 964 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 965 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 965 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 965 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppade) | 965 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 965 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 965 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 965 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 965 |
| netnet/NCAV | GRAHAM_TROSKEL-konstant | **PASS** | 0.667 | exporterad konstant=0.667 (förväntat 0.667 = 2/3) | 965 |
| konfluens | konfluens-fält i [0,100] | **SKIP** | 0 konfluens-fält hittade i motorernas output | ingen konfluens-motor i src/lib (vagfundament/analys/netnet saknar konfluens-fält i output — verifierat programmatiskt) — kontroll hoppas över enligt instruktion | 967 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | hash-lik längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1131 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 1452 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 1452 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 1452 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 1452 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 1452 |

_Rapport genererad av verktyg/validera-motorer.mjs — kontroller: struktur, matematik (NCAV m.m.), determinism, gränser, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:26:33.679Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 2.1 s (budget 90 s, inom budget)
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 0 PASS / 1 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| system | 0 | 1 | 0 |
| **Totalt** | **0** | **1** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| system | körning av tmp_motor_koll.ts via npx tsx | **FAIL** | node:internal/modules/run_main:123     triggerUncaughtException(     ^  Error: Transform failed with 21 errors: C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:60:12: ERR | ingen JSON-utdata att tolka (exitkod=1) | - |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

## stderr från tsx-körningen (trunkerad)

```
node:internal/modules/run_main:123
    triggerUncaughtException(
    ^

Error: Transform failed with 21 errors:
C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:60:12: ERROR: Top-level await is currently not supported with the "cjs" output format
C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:61:12: ERROR: Top-level await is currently not supported with the "cjs" output format
C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:62:12: ERROR: Top-level await is currently not supported with the "cjs" output format
C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:63:12: ERROR: Top-level await is currently not supported with the "cjs" output format
C:\Users\Workstation Z G4\.zcode\workspace\default\ak1\tmp_motor_koll.ts:64:12: ERROR: Top-level await is currently not supported with the "cjs" output format
...
    at failureErrorWithLog (C:\Users\Workstation Z G4\AppData\Local\npm-cache\_npx\fd45a72a545557e9\node_modules\esbuild\lib\main.js:1748:15)
    at C:\Users\Workstation Z G4\AppData\Local\npm-cache\_npx\fd45a72a545557e9\node_modules\esbuild\lib\main.js:1017:50
    at responseCallbacks.<computed> (C:\Users\Workstation Z G4\AppData\Local\npm-cache\_npx\fd45a72a545557e9\node_modules\esbuild\lib\main.js:884:9)
    at handleIncomingPacket (C:\Users\Workstation Z G4\AppData\Local\npm-cache\_npx\fd45a72a545557e9\node_modules\esbuild\lib\main.js:939:12)
    at Socket.readFro
```

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:27:29.423Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.9 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.8 s; startad 2026-09-03T19:27:26.604Z, klar 2026-09-03T19:27:29.355Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 48 PASS / 10 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 1 | 1 | 0 |
| kurstips | 1 | 1 | 0 |
| dashfraga | 0 | 2 | 0 |
| vagkon | 1 | 1 | 0 |
| spaced-repetition | 1 | 1 | 0 |
| veckoplan | 1 | 1 | 0 |
| briefing | 0 | 2 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 1 | 1 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **48** | **10** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1454 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1455 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1455 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1455 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1456 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1456 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1456 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1456 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1456 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1456 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1456 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1456 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1456 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1456 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1456 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1457 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1628 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 2050 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2220 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2380 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2703 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2703 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2703 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2703 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2703 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2703 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2703 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2707 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2708 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2709 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **FAIL** | tracer=2 xp=120 fragor=2 | tracerSidor=["/kurser/a","/kurser/b"] | 2709 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **FAIL** | antal=3 första=v01-forsaljningstillvaxt | första=v01-forsaljningstillvaxt poäng=undefined (förväntat v01, 100); poäng ej finit på v01-forsaljningstillvaxt; poäng ej finit på v02-arr-tillvaxt; poäng ej finit på v03-intaktsdiversifiering | 2709 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2710 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **FAIL** | streakLank=undefined | streak-svar: undefined; streak-länk=undefined; fallback: undefined; hej: undefined | 2711 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **FAIL** | ikon=undefined | väntat fallback-svar, fick: {} | 2711 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2711 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **FAIL** | n(ren)=5 | horisontval: ordning=["mega"]; 2 punkter ska vara otillräcklig; rensning: n=5 senaste=120 (förväntat 3, 120) | 2712 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2712 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **FAIL** | kort=140 kategorier=7 | facitgolv/×EF: {"facit":1.3,"intervall":130,"repetitioner":6,"nastRepetition":"2027-01-11"} | 2712 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2712 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **FAIL** | rader75=8 summa=74 rader25=5 | lasKlara=[0,2]; markeraKlar(1)=[0,1,2]; toggle markeraKlar(0)=[1,2] | 2713 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **FAIL** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | dominerande korrigeringar; dominerande impulser; dominerande basbygge | 2713 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **FAIL** | niva=undefined xp=undefined klara=undefined | niva=undefined; xp=undefined; klaraKurser=undefined; mening saknas; vagdata ska vara null från raknaBriefing (fylls av komponenten); mening saknas i 2:a körningen | 2714 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2734 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2735 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2739 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2739 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2739 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **FAIL** | HEL totalt=31 NUL totalt=0 | perKategori=8 | 2740 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2743 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2743 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2746 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2747 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2750 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2750 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2750 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2751 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2751 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:29:34.610Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.1 s (budget 90 s, inom budget)
- **Internt (tsx):** 3.0 s; startad 2026-09-03T19:29:31.554Z, klar 2026-09-03T19:29:34.541Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1407 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1408 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1408 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1408 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1408 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1408 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1408 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1408 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1408 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1408 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1408 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1408 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1408 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1408 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1408 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1409 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1588 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 2067 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2403 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2571 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2941 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2941 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2941 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2941 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2941 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2941 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2941 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2946 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2946 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2947 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2947 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2948 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2948 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2949 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2949 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2950 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2950 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2950 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2950 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2950 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2951 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2951 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2952 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2971 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2972 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2975 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2976 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2976 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2977 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2979 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2979 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2982 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2983 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2986 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2986 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2986 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2986 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2987 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:29:47.051Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.2 s (budget 90 s, inom budget)
- **Internt (tsx):** 3.1 s; startad 2026-09-03T19:29:43.870Z, klar 2026-09-03T19:29:46.988Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1164 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1165 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1165 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1165 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1165 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1165 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1165 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1165 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1166 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1166 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1166 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1166 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1166 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1166 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1166 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1166 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1510 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 2038 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2208 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2544 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 3072 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 3072 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 3072 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 3072 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 3072 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 3072 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 3073 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 3077 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 3078 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 3078 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 3078 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 3079 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 3079 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 3080 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 3080 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 3081 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 3081 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 3081 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 3082 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 3082 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 3082 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 3083 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 3083 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 3103 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 3103 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 3107 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 3107 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 3107 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 3108 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 3110 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 3110 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 3114 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 3115 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 3117 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 3117 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 3118 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 3118 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 3118 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:31:45.195Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.8 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.8 s; startad 2026-09-03T19:31:42.301Z, klar 2026-09-03T19:31:45.140Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1256 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1257 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1258 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1258 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1258 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1258 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1258 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1258 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1258 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1258 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1258 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1258 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1258 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1258 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1258 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1258 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1613 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1834 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2159 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2477 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2793 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2793 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2793 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2793 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2793 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2793 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2793 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2798 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2798 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2799 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2799 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2799 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2800 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2801 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2801 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2801 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2802 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2802 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2802 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2802 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2803 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2803 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2804 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2823 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2824 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2827 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2828 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2828 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2829 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2831 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2831 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2834 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2835 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2838 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2838 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2839 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2839 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2839 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:31:56.250Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.5 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.5 s; startad 2026-09-03T19:31:53.655Z, klar 2026-09-03T19:31:56.183Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1198 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1200 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1200 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1200 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1200 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1200 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1200 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1201 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1201 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1201 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1201 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1201 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1201 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1201 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1201 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1201 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1368 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1575 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1921 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2122 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2482 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2482 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2482 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2482 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2482 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2482 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2482 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2487 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2487 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2488 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2488 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2489 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2489 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2490 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2490 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2490 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2491 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2491 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2491 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2491 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2492 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2492 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2493 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2513 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2513 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2517 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2517 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2517 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2518 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2521 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2521 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2524 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2525 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2527 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2527 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2528 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2528 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2528 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:32:16.275Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.2 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.9 s; startad 2026-09-03T19:32:13.244Z, klar 2026-09-03T19:32:16.193Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 1 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| system | 0 | 1 | 0 |
| **Totalt** | **58** | **1** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1428 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1429 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1429 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1429 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1429 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1429 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1429 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1429 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1429 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1429 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1429 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1429 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1429 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1429 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1429 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1429 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1641 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1844 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2276 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2491 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2904 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2904 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2904 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2904 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2904 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2904 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2904 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2909 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2910 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2910 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2910 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2911 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2911 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2912 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2912 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2913 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2913 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2913 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2913 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2913 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2914 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2914 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2915 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2934 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2935 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2938 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2939 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2939 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2940 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2942 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2942 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2945 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2946 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2948 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2948 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2949 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2949 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2949 |
| system | TEMPORAR NEGATIV TEST | **FAIL** | - | injicerad rad för att verifiera FAIL-vägen i kvalitetsvakten | 2949 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:32:21.851Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.7 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.7 s; startad 2026-09-03T19:32:19.090Z, klar 2026-09-03T19:32:21.791Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 1 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| system | 0 | 1 | 0 |
| **Totalt** | **58** | **1** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1345 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1346 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1346 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1346 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1346 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1347 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1347 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1347 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1347 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1347 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1347 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1347 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1347 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1347 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1347 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1347 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1531 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1752 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1934 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2240 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2652 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2652 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2652 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2652 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2652 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2652 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2652 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2657 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2657 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2658 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2658 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2659 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2659 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2660 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2660 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2661 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2661 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2661 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2661 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2661 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2662 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2662 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2663 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2685 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2685 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2689 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2690 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2690 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2691 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2693 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2693 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2696 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2698 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2700 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2700 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2701 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2701 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2701 |
| system | TEMPORAR NEGATIV TEST | **FAIL** | - | injicerad rad för att verifiera FAIL-vägen i kvalitetsvakten | 2701 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:32:34.229Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.2 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.3 s; startad 2026-09-03T19:32:31.901Z, klar 2026-09-03T19:32:34.155Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1297 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1298 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1298 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1298 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1298 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1298 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1298 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1298 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1298 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1298 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1298 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1298 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1298 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1298 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1299 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1299 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1476 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1700 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1717 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1889 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2208 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2208 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2208 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2208 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2208 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2209 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2209 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2213 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2214 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2214 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2215 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2215 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2215 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2216 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2216 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2217 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2217 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2217 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2218 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2218 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2218 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2219 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2219 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2239 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2239 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2243 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2243 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2243 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2244 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2246 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2246 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2249 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2250 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2253 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2253 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2254 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2254 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2254 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:32:40.102Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.9 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.9 s; startad 2026-09-03T19:32:37.126Z, klar 2026-09-03T19:32:40.039Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1342 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1345 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1345 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1345 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1346 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1346 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1346 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1346 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1346 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1346 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1346 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1346 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1346 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1346 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1347 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1347 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1515 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1795 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2033 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2455 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2866 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2866 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2866 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2866 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2866 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2866 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2866 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2871 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2871 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2872 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2872 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2872 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2873 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2873 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2874 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2874 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2874 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2875 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2875 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2875 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2876 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2876 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2877 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2897 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2897 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2901 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2902 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2902 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2903 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2905 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2905 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2908 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2909 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2912 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2912 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2912 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2913 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2913 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:34:18.216Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.4 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.4 s; startad 2026-09-03T19:34:15.778Z, klar 2026-09-03T19:34:18.156Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1263 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1264 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1264 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1264 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1264 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1264 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1264 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1264 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1264 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1264 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1264 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1264 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1265 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1265 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1265 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1265 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1429 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1631 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1798 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2001 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2334 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2334 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2334 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2334 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2334 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2334 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2334 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2338 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2339 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2339 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2340 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2340 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2340 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2341 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2341 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2342 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2342 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2342 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2342 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2343 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2343 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2343 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2344 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2363 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2364 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2367 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2368 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2368 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2369 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2371 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2371 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2374 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2375 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2377 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2377 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2378 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2378 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2378 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:34:23.368Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.3 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.3 s; startad 2026-09-03T19:34:21.018Z, klar 2026-09-03T19:34:23.308Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1179 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1180 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1180 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1180 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1181 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1181 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1181 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1181 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1181 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1181 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1181 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1181 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1181 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1181 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1181 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1181 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1356 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1562 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1728 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1899 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2218 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2218 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2218 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2218 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2218 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2218 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2218 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2234 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2236 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2238 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2239 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2241 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2241 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2243 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2244 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2245 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2245 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2246 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2246 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2247 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2248 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2249 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2250 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2274 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2274 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2278 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2279 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2279 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2280 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2282 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2282 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2285 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2286 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2289 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2289 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2289 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2290 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2290 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:35:16.116Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.1 s (budget 90 s, inom budget)
- **Internt (tsx):** 3.1 s; startad 2026-09-03T19:35:12.947Z, klar 2026-09-03T19:35:16.056Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1568 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1570 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1570 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1571 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1571 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1571 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1571 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1571 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1571 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1571 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1571 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1571 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1571 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1571 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1572 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1572 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1825 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 2089 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2445 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2708 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 3063 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 3063 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 3063 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 3063 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 3063 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 3063 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 3063 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 3068 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 3069 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 3069 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 3069 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 3070 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 3070 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 3071 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 3071 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 3072 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 3072 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 3072 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 3072 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 3072 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 3073 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 3073 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 3074 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 3093 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 3094 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 3097 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 3098 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 3098 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 3099 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 3101 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 3101 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 3104 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 3105 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 3108 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 3108 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 3108 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 3108 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 3109 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:35:21.350Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.3 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.4 s; startad 2026-09-03T19:35:18.904Z, klar 2026-09-03T19:35:21.294Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1223 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1225 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1225 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1225 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1225 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1225 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1225 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1225 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1225 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1225 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1225 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1225 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1225 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1225 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1226 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1226 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1405 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1700 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1860 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2030 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2342 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2342 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2342 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2342 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2342 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2342 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2342 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2347 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2347 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2348 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2348 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2349 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2349 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2350 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2350 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2351 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2351 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2351 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2351 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2351 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2352 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2352 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2353 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2374 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2375 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2378 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2379 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2379 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2380 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2382 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2382 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2385 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2386 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2389 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2389 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2390 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2390 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2390 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T19:35:53.344Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.9 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.9 s; startad 2026-09-03T19:35:50.388Z, klar 2026-09-03T19:35:53.270Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1473 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1474 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1474 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1474 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1474 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1474 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1474 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1474 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1474 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=20.1446 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1474 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1474 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1474 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1474 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1474 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1475 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1475 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1676 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1884 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 2316 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 2477 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2826 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2826 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2826 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2826 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2826 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2826 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2826 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2831 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2831 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2832 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2832 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2832 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2833 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2834 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2834 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2834 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2835 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2835 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2835 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2835 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2836 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2836 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2837 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2856 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2856 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2860 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2860 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2861 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2862 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2864 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2865 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2874 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2877 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2881 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2881 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2882 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2882 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2882 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T20:57:29.296Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.2 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.3 s; startad 2026-09-03T20:57:26.946Z, klar 2026-09-03T20:57:29.222Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1208 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1209 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1209 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1209 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1209 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1209 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1209 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1209 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1209 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=19.7561 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1209 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1209 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1209 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1209 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1209 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1210 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1210 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1386 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1592 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1762 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1935 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2230 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2230 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2230 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2230 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2230 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2231 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2231 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2235 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2236 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2236 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2236 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2237 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2237 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2238 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2238 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2239 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2239 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2239 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2239 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2239 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2240 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2240 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2241 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2260 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2261 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2264 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2265 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2265 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2266 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2268 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2268 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2271 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2272 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2275 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2275 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2275 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2275 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2276 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-03T20:57:34.237Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 3.8 s (budget 90 s, inom budget)
- **Internt (tsx):** 1.9 s; startad 2026-09-03T20:57:32.256Z, klar 2026-09-03T20:57:34.178Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1118 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1119 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1119 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1119 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1119 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=348.3 pos52=0.83 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1119 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=597.7 pos52=0.723 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1119 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":0.0055,"kort":0.0834,"medellang":0.2073,"lang":0.5425,"mega":0.8114} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1119 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0678,"kort":0.1312,"medellang":0.1066,"lang":3.155,"mega":8.35} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1119 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=348.3 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=19.7561 pb=3.7146 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1119 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=597.7 ncavPerAktie=19.0639 forhallande=31.3525 klass=ej pe=45.5912 pb=6.4147 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1119 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1119 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1119 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1119 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1120 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1120 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1299 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1228 | två separata körningar gav byte-identisk JSON (1228 tecken) | 1354 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1368 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1544 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 1877 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 1877 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 1877 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 1877 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 1877 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 1877 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 1877 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 1882 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 1882 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 1883 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 1883 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 1883 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 1884 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 1884 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 1885 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 1885 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 1885 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-04"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-09"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-04"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 1886 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 1886 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 1886 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 1887 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 1887 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 1888 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 1907 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 1907 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 1911 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 1911 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God kväll, Elev — 1 kurs i ryggen och en rytm som  | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 1911 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 1912 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 1914 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 1914 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 1917 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 1919 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 1921 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 1921 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 1922 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 1922 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 1922 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-04T07:51:31.477Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 5.1 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.2 s; startad 2026-09-04T07:51:29.225Z, klar 2026-09-04T07:51:31.414Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1173 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1174 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1174 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1175 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1175 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=345.5 pos52=0.811 sammanfattning={"bull":16,"bear":0,"neutral":9} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1175 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=599.5 pos52=0.726 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1175 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":-0.0026,"kort":0.0747,"medellang":0.1976,"lang":0.5301,"mega":0.8154} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1175 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.065,"kort":0.1346,"medellang":0.11,"lang":3.1675,"mega":8.74} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1175 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=345.5 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=19.5973 pb=3.6847 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1175 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=599.5 ncavPerAktie=19.0639 forhallande=31.4469 klass=ej pe=45.7285 pb=6.434 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1175 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1175 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1175 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1175 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=27 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1175 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1175 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1450 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1236 | två separata körningar gav byte-identisk JSON (1236 tecken) | 1653 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=141 | två separata körningar gav byte-identisk JSON (141 tecken) | 1667 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1835 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2144 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2144 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2144 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2144 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2144 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2144 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2144 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2148 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2149 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2149 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2150 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2150 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2150 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2151 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2151 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2152 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2152 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-05"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-10"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-05"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2152 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2153 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2153 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2153 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2154 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2154 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2174 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2174 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2178 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2178 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God morgon, Elev — 1 kurs i ryggen och en rytm som | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2178 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2179 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2182 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2182 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2185 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2186 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2188 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2188 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2189 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2189 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2189 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
---

# Motorervalidering — 100%-väktaren — 2026-09-04T07:53:03.557Z

- **Skript:** `verktyg/validera-motorer.mjs` (genererar `tmp_motor_koll.ts`, kör via `npx --yes tsx`, städar efteråt)
- **Miljö:** node v22.19.0 på win32; tickers: VOLV-B.ST, SAAB-B.ST (närmarknad — frusen data)
- **Körtid:** 4.2 s (budget 90 s, inom budget)
- **Internt (tsx):** 2.2 s; startad 2026-09-04T07:53:01.275Z, klar 2026-09-04T07:53:03.500Z
- **Policy (våg 49):** varje deterministisk motor minst ett deterministiskt test; **SKIP är förbjudet** — under 100% PASS = FAIL.

**RESULTAT: 58 PASS / 0 FAIL / 0 SKIP**

## Sammanfattning

| Motor | PASS | FAIL | SKIP |
|---|---:|---:|---:|
| vagfundament | 5 | 0 | 0 |
| vagfundament/portfölj | 1 | 0 | 0 |
| analys | 5 | 0 | 0 |
| netnet | 3 | 0 | 0 |
| netnet/NCAV | 3 | 0 | 0 |
| konfluens | 4 | 0 | 0 |
| portfolj-vagor | 1 | 0 | 0 |
| gränser | 7 | 0 | 0 |
| chatbot-nlu | 2 | 0 | 0 |
| omtanke-motor | 2 | 0 | 0 |
| kurstips | 2 | 0 | 0 |
| dashfraga | 2 | 0 | 0 |
| vagkon | 2 | 0 | 0 |
| spaced-repetition | 2 | 0 | 0 |
| veckoplan | 2 | 0 | 0 |
| briefing | 2 | 0 | 0 |
| badges | 2 | 0 | 0 |
| analysbank | 1 | 0 | 0 |
| assistent | 2 | 0 | 0 |
| akm2/kärna | 2 | 0 | 0 |
| riskportfolj | 2 | 0 | 0 |
| fundamental-vagmotor | 2 | 0 | 0 |
| uppfoljning | 2 | 0 | 0 |
| **Totalt** | **58** | **0** | **0** |

## Kontroller i detalj

| Motor | Kontroll | Resultat | Värden | Detalj | T+ (ms) |
|---|---|---|---|---|---:|
| vagfundament | STRUKTUR 20×5-matris + indikatorer (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} sammanfattning={"impulsvag":16,"korrigering":8,"basbygge":17,"osatt":59} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1183 |
| vagfundament | STRUKTUR 20×5-matris + indikatorer (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} sammanfattning={"impulsvag":22,"korrigering":5,"basbygge":13,"osatt":60} valuta=SEK dataPer=2026-06-30 | matris 20×5, alla celler null eller heltal i [-1,1]; indikatorer 20; sammanfattning omräknad exakt | 1184 |
| vagfundament/portfölj | STRUKTUR portföljaggregering + procentfält | **PASS** | tackningProcent=100 totalText=Portföljen i genomsnitt: basbygge på mega | matris 20×5 i [-1,1]; kategorier 7×5; total 5; radTexter 7; tackningProcent i [0,100] | 1184 |
| vagfundament | MATEMATIK kategorier+total omräknade (VOLV-B.ST) | **PASS** | total={"mikro":0.542,"kort":0.167,"medellang":0.25,"lang":null,"mega":0.25} | 19 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000250 | 1184 |
| vagfundament | MATEMATIK kategorier+total omräknade (SAAB-B.ST) | **PASS** | total={"mikro":0.042,"kort":0.417,"medellang":0.667,"lang":null,"mega":0.667} | 20 kategoriceller + 4 totalceller omräknade för hand (viktade med AKM1-vikterna); största avvikelse kategori=0.000333 total=0.000313 | 1184 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (VOLV-B.ST) | **PASS** | pris=345 pos52=0.808 sammanfattning={"bull":15,"bear":0,"neutral":10} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1184 |
| analys | STRUKTUR 5×5-matris (25 celler) + data (SAAB-B.ST) | **PASS** | pris=599.1 pos52=0.725 sammanfattning={"bull":17,"bear":6,"neutral":2} kallor=1 | matris25=25 celler i {-1,0,1}; sammanfattning omräknad exakt; pris/spann/pos52 finita; momentum+vager 5 horisonter | 1184 |
| analys | MATEMATIK fib/pos52/vager omräknade (VOLV-B.ST) | **PASS** | fib38=315.7866 fib62=279.5134 momentum={"mikro":-0.004,"kort":0.0731,"medellang":0.1958,"lang":0.5279,"mega":0.8127} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1184 |
| analys | MATEMATIK fib/pos52/vager omräknade (SAAB-B.ST) | **PASS** | fib38=540.5718 fib62=411.9282 momentum={"mikro":-0.0657,"kort":0.1338,"medellang":0.1092,"lang":3.1641,"mega":8.7319} | fib38/fib62/pos52 omräknade ur hojd52/lag52/pris; sammanfattning exakt; 5 vågklasser omräknade (0 gränsfall hoppades i omräkningen — kontrollen själv hoppas aldrig) | 1184 |
| netnet | STRUKTUR screeningsrad (VOLV-B.ST) | **PASS** | kurs=345 ncavPerAktie=-44.7018 forhallande=null klass=ej pe=19.5689 pb=3.6794 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1184 |
| netnet | STRUKTUR screeningsrad (SAAB-B.ST) | **PASS** | kurs=599 ncavPerAktie=19.0639 forhallande=31.4207 klass=ej pe=45.6903 pb=6.4286 | kurs/ncavPerAktie/forhallande finita tal; klass i {net-net,nära,ej} | 1184 |
| netnet/NCAV | NCAV omräknad för hand (VOLV-B.ST) | **PASS** | CA=305570000000 CL=265914000000 LTD=130555000000 aktier=2033452084 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = -44.701816 ≈ motorns -44.7018; förhållande=kurs÷NCAV och Grahams klass stämmer | 1185 |
| netnet/NCAV | NCAV omräknad för hand (SAAB-B.ST) | **PASS** | CA=82578000000 CL=63744000000 LTD=8475000000 aktier=543383388 valuta=SEK | (omsättningstillgångar − (rörelseskulder + långfristig skuld)) ÷ aktieantal = 19.063888 ≈ motorns 19.0639; förhållande=kurs÷NCAV och Grahams klass stämmer | 1185 |
| netnet/NCAV | GRAHAM_TROSKEL- och MAX_TICKER_PER_ANROP-konstanter | **PASS** | 0.667/15 | GRAHAM_TROSKEL=0.667 (förväntat 0.667 = 2/3); MAX_TICKER_PER_ANROP=15 (förväntat 15) | 1185 |
| konfluens | STRUKTUR+SJÄLVKONTROLL skannaKonfluens (VOLV-B.ST, SAAB-B.ST) | **PASS** | VOLV-B.ST: konfluens=28 vg=5 klass=null \| SAAB-B.ST: konfluens=28 vg=0 klass=null | 2 rader i indataordning; motorns egna sjalvkontroll ok (poäng heltal 0–100/null, klass konsistent med trösklarna 70/50/3, tickers unika) | 1185 |
| portfolj-vagor | STRUKTUR+MATEMATIK viktat snitt omräknat ur perAktie (2 tickers, likavikter) | **PASS** | sammanfattning={"impulsvag":4,"korrigering":0.5,"basbygge":0.5,"osatt":0} | perAktie-profiler en-hot per horisont; portföljandelen omräknad för hand som Σ(vikt×andel)/Σvikt per klass och horisont; sammanfattningen summerar 5 | 1185 |
| vagfundament | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=10279 | två separata körningar gav byte-identisk JSON (10279 tecken) — konsistent med frusen marknadsdata | 1343 |
| analys | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=1235 | två separata körningar gav byte-identisk JSON (1235 tecken) | 1539 |
| netnet | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=139 | två separata körningar gav byte-identisk JSON (139 tecken) | 1699 |
| konfluens | DETERMINISM 2 körningar VOLV-B.ST (JSON identiskt) | **PASS** | längd=176 | två separata körningar gav byte-identisk JSON (176 tecken) — konfluenspoängen är reproducerbar ur de avrundade dimensionerna | 1864 |
| gränser | vagfundament okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen fundamentaldata (Yahoo fundamentals-timeseries)"} | snyggt fel: 'ingen fundamentaldata (Yahoo fundamentals-timeseries)' | 2180 |
| gränser | analys okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ingen data (Yahoo/MarketStack)"} | snyggt fel: 'ingen data (Yahoo/MarketStack)' | 2180 |
| gränser | netnet okänd ticker XXXX.ST → fel-rad utan krasch | **PASS** | {"ticker":"XXXX.ST","fel":"ofullständig balansdata","klass":null} | snyggt fel: 'ofullständig balansdata' | 2180 |
| gränser | netnet formatogiltig ticker 'BAD TICKER!' → valideringsfel | **PASS** | {"ticker":"BAD TICKER!","kurs":null,"ncavPerAktie":null,"forhallande":null,"klass":null,"fel":"ogiltig ticker"} | fel-text: 'ogiltig ticker' | 2180 |
| gränser | konfluens tom tickerlista → tomt svar utan krasch | **PASS** | 0 rader | skannaKonfluens([]) returnerade [] | 2180 |
| gränser | tomma tickerlistor → tomma svar (alla motorer) | **PASS** | 0 rader | vagfundament/analys/netnet returnerade alla [] utan krasch | 2180 |
| gränser | portfolj-vagor tom lista → tom struktur + pedagogisk text | **PASS** | {"impulsvag":0,"korrigering":0,"basbygge":0,"osatt":0} | perAktie={}, portföljprofil nollställd, totalText närvarande | 2180 |
| chatbot-nlu | FIXTUR normalisering + ämne + levenshtein + följdfråga | **PASS** | ren1='vad ar pe' ren2='borsen' | 'Vadd är P/E?'→'vad ar pe'→pe; 'brasken'→'borsen'; bruttomarginal→v07; mr market→mrmarket; levenshtein 0/1/2; 'och P/E?'=följdfråga men 'Vad är P/E?'=ej | 2185 |
| chatbot-nlu | DETERMINISM 5 frågor 2× (JSON identiskt) | **PASS** | ["pe","borsen","v07","v04","moat"] | [{"ren":"vad ar pe","amne":"pe"},{"ren":"borsen","amne":"borsen"},{"ren":"hur raknar man bruttomarginal","amne":"v07"},{"ren":"och ps","amne":"v04"},{"ren":"vad ar moat","amne":"moat"}] | 2185 |
| omtanke-motor | FIXTUR lasOmtanke: radslOro (prio 1), aterkomsten, harmoni=null | **PASS** | oro=radslOro aterkomsten=aterkomsten harmoni=null | 'förstår inte'→radslOro prio 1 länk /dagens-pass; 40 dagar borta→aterkomsten prio 2; lugn meny-surfare utan signaler→null (tystnad är omtanke); determinism 2× | 2186 |
| omtanke-motor | FIXTUR lasSignaler: tracer/member/chat-minne tolkas ur localStorage | **PASS** | tracer=2 xp=120 fragor=2 | 2 tracer-sidor, xp=120, 2 mentorfrågor med senaste text, senastAktiv från senaste ts, samtycke+profil=true | 2186 |
| kurstips | FIXTUR raknaKurstips: första steg v01 (100p), fälttyper, exkludering | **PASS** | antal=3 första=v01-forsaljningstillvaxt | ny elev (tom localStorage) → 1–3 tips, första = V01 Försäljningstillväxt med poäng 100, alla fält närvarande, exkluderaSlug utesluter | 2187 |
| kurstips | DETERMINISM raknaKurstips 2× (JSON identiskt) | **PASS** | längd=620 | samma shim-tillstånd → byte-identiska tips | 2187 |
| dashfraga | FIXTUR intents: streak → /dagens-pass, fallback, hälsning | **PASS** | streakLank=/dagens-pass | streak-fråga → streak-svar med länk /dagens-pass; okänd fråga → fallback-texten; 'hej' → välkomsttext; determinism 2× | 2188 |
| dashfraga | FIXTUR vågkarta-intent degraderar gracefult när nät saknas | **PASS** | ikon=🌊 | fetch mot /api/vagscan/senaste misslyckas i Node (relativ URL) → dokumenterad fallback 'Ingen vågkarta har sparats ännu' — modulen kraschar aldrig på nätfel | 2188 |
| vagkon | MATEMATIK σ + P10/P50/P90 omräknade för hand (S0·exp(z·σ·√t)) | **PASS** | sigma=0.08965827311693393 medianSlut(mega)=130 | σ (sampel, n−1) över log-returer omräknad med oberoende kodväg; medianen platt på S0=130; 48 stegs band verifierade mot √t-formeln; bandet breddar monoton | 2189 |
| vagkon | FIXTUR horisontval, otillräcklig data, icke-tal rensas, determinism | **PASS** | n(ren)=5 | delmängd ['mega'] → endast mega i kanonisk ordning; <3 punkter → otillracklig utan horisonter; icke-tal (NaN) rensas ur historiken (negativa/0 är äkta tal — de bidrar bara inte till σ); 2× körning JSON-identisk | 2189 |
| spaced-repetition | FIXTUR SM-2: EF'=EF+(0.1−q(0.08+(5−q)0.02)); 1→6→×EF; q<3 nollställer | **PASS** | [{"facit":2.2,"intervall":1,"repetitioner":1,"nastRepetition":"2026-09-05"},{"facit":1.9,"intervall":6,"repetitioner":2,"nastRepetition":"2026-09-10"},{"facit":1.72,"intervall":1,"repetitioner":0,"nastRepetition":"2026-09-05"},{"facit":1.42,"intervall":1,"repe | från jungfruligt kort: q5 → facit 2.2/rep 1/intervall 1; q4 → facit 1.9/rep 2/intervall 6; q2 → rep 0/intervall 1; q5 igen → rep 1 | 2189 |
| spaced-repetition | FIXTUR SM-2 forts: facitgolv, tak 365, default-status, kortunderlag, nästa datum | **PASS** | kort=140 kategorier=7 | facit 1.3 med q5 → 1.3 (SM-2-steget 1.0 under golvet 1.3), intervall round(100×1.3)=130; intervall 400 → tak 365; okänt kort → default 2.5/0/0/null; 140 kort med unika id:n i 7 kategorier; nastRepetition ≈ idag+intervall | 2189 |
| veckoplan | FIXTUR veckoNummer: ISO-veckor 2026-01-01→1, 2026-01-05→2, 2027-01-01→53 | **PASS** | v1/v2/v53 | ISO 8601-veckonummer (måndag start, torsdag definierar veckan): torsdag 1 jan 2026 → v1, måndag 5 jan → v2, fredag 1 jan 2027 → v53 | 2189 |
| veckoplan | FIXTUR raknaVeckoPlan 75/25 min + lasKlara/markeraKlar-toggle + determinism | **PASS** | rader75=8 summa=74 rader25=5 | 75 min → 5 pass (mån–fre, 5 min) + kurstillfällen ≤ budget; 25 min → exakt 5 pass; kryss läses/toggLAS per veckonummer; samma veckohash → identisk plan | 2190 |
| briefing | FIXTUR halsningFranTimme + vagLageFranVagdata + morgonMening exakt | **PASS** | m1='God morgon, Nivå 3 — vågkartan andas stigande impulser och d…' | morgon<11/dag/kväll>=17; argmax över universumsumman med mjuk null-degradering; morgonmeningen exakt mot mallen i alla tre streak-varianter (7/1/0) | 2190 |
| briefing | FIXTUR raknaBriefing: struktur + determinism (utom klockstyrd hälsning) | **PASS** | niva=1 xp=0 klara=0 | niva/xp/klaraKurser finita; vagdata=null (degradering utan nät); mening alltid närvarande; alla fält utom den klockstyrdda hälsningen byte-identiska 2× | 2191 |
| badges | FIXTUR BADGER-struktur (≥28, unika, 5 kategorier) + badgeStatus tom shim | **PASS** | badger=29 | 29 meriter med unika id:n, giltiga kategorier och komplett BADGE_MAP; tom shim → inga upplåsta, procent i [0,100], framsteg alltid text | 2209 |
| badges | FIXTUR nivå-trösklar: 550 XP→nivå 6 (niva-5=100%), 3 kurser→kurser-5=60%, streak-3=100%, quiz + geBadge-kontrakt | **PASS** | niva-5=100% kurser-5=60% | tröskelberäkningen (stapel = låst [0,mal], procent = min(100, round(nu/mal×100))) verifierad på fyra badges; geBadge true endast första gången, okänt id → false | 2210 |
| analysbank | FIXTUR spara/läsa/uppdatera (ny=true, samma id=false), nyast först, tak 50, ogiltig rad | **PASS** | rader efter 57 sparningar=0 | bankens localStorage-kontrakt: första sparning true, uppdatering false, datumsortering nyast först, MAX_RADER=50, normalisering avvisar rader utan id | 2213 |
| assistent | FIXTUR raknaProaktivaForslag (streak 0 → /dagens-pass prio 100) + frustration + optimal tid | **PASS** | forslag=1 forsta=/dagens-pass | bruten streak → högst prioritet /dagens-pass; listan aldrig tom, dedup på länk, maxAntal kapsar; frustration = bruten kedje + ≥30 min + 0<quiz<50%; dygnsrytm majoritetsregel med exakta texter | 2214 |
| assistent | FIXTUR genereraHalsning (klockprefix + namntilltal) + determinism | **PASS** | God morgon, Elev — 1 kurs i ryggen och en rytm som | hälsningen följer dygnsrytmen (morgon/dag/kväll), tilltalar eleven med namn och speglar läget; förslagen byte-identiska 2× | 2214 |
| akm2/kärna | FIXTUR raknaAKM1: HEL (Σpoang=totalt, 0–5, 7 kategorier) + NUL (allt osatt → 0) | **PASS** | HEL totalt=31 NUL totalt=0 | HEL-fixtur: 31/100 = Σ(V01–V20)-poäng omräknad exakt; NUL-fixtur: totalt 0 utan gissade poäng (ärlighetsprincipen); datum = k.hamtat | 2215 |
| akm2/kärna | FIXTUR projektionsinvarianten + hård kassa-port (NEG ≤ 45) + determinism | **PASS** | NEG komposit=2 HEL komposit=31 | projiceraAKM1(raknaAKM2(HEL, akm1-klassisk)) === raknaAKM1(HEL) byte-vis; NEG (kassa 10 mån) → komposit 2 ≤ 45; lager1 o modifierad; 2× JSON-identisk | 2217 |
| riskportfolj | FIXTUR 9 riskprofiler: horisontvikter summerar 1, spridningstak, MIN/MAX_INNEHAV | **PASS** | konservativ maxPerAktie=0.08 tillväxt=0.15 | 3 nivåer × 3 takter; varje profils horisontviktning summerar exakt 1 (mikro lägst); maxPerAktie ≤ maxPerBransch; konservativ tätare än tillväxt; 8–15 innehav | 2217 |
| riskportfolj | FIXTUR byggPortfolj syntetisk pool (15 kandidater, 5 branscher): 8–15 innehav, Σvikt=1, tak, inga BROTT | **PASS** | innehav=15 viktsumma=1 | 15 innehav; vikter inom maxPerAktie=0.11; Σvikt=1 exakt; branschbelastning ≤ maxPerBransch=0.3; inga strikta krav brutna; 2× JSON-identisk | 2220 |
| fundamental-vagmotor | FIXTUR klassaVag: stigande→impulsvag, fallande→korrigering, flat→basbygge (×5 horisonter), kort→osatt | **PASS** | rost a/b/c på stigande: impulsvag/impulsvag/impulsvag | trippelröstningen (teckenvändning + regression + delperiod, ≥2 av 3) enig på alla fem horisonter för rena monoton serier och plan serie; <3 punkter → osatt (gissar aldrig) | 2221 |
| fundamental-vagmotor | FIXTUR raknaFVag: 20 variabler, giltiga klasser/dynamik, NUL→osatt, determinism | **PASS** | variabler=20 | HEL-fixtur → alla 20 AKM1-variabler klassade med anteckning; NUL-fixtur → samtliga osatta (motorn gissar aldrig); 2× JSON-identisk | 2223 |
| uppfoljning | FIXTUR skapaSnapshot: förändringar mot föregående (AKM1 70→82, pris 100→125), datum härleds, ogiltig klass saneras | **PASS** | dAKM1=12 dpris=0.25 | ΔAKM1=12, prisförändring=0.25 (125/100−1) omräknade exakt; datum deterministiskt ur senastKontrollerad; ogiltig vågklass → 'osatt', aldrig gissad | 2224 |
| uppfoljning | FIXTUR jamforDåNu: delta/pris/vågbytes omräknade, betydelse stor/man/liten | **PASS** | betydelser=["stor","liten","man"] | J1: AKM1 +12 & fundamental byte på LÅNG → 'stor'; J2: delta 2 & pris +2,5 % utan bytes → 'liten'; J3: pris +30 % ≥ 20 % → 'man'; ny bolag utan tidigare mätning → delta null | 2224 |
| konfluens | FIXTUR sjalvkontroll: 6 giltiga fixture-rader (alla klassvägen i specifikationen) | **PASS** | ok=true fel=0 | Konfluens/Värde-sover/Vågor-utan-golv/null-på-gränsen/Ingen-bild(<3 källor)/null(3 källor, osatta pelare) — samtliga accepteras med rätt tickerordning | 2224 |
| konfluens | FIXTUR sjalvkontroll avvisar: poäng 101/-5, klassfel, dubletter, >10 tickers, datakallor 4 | **PASS** | 7 fall verifierade | sju korruptionsfall ger alla ok=false med förväntade felförklaringar; valideraKonfluens är ett sant alias för sjalvkontroll | 2225 |

## Täckningsgrad (våg 49)

Deterministiska motorer med egen testrad ovan: vagfundament, analys, netnet, konfluens, portfolj-vagor, chatbot-nlu, omtanke-, kurstips-, dashfraga-, vagkon-, spaced-repetition-, veckoplan-, briefing-, badges-, analysbank-, assistent-motorerna, akm2/kärna, riskportfolj, fundamental-vagmotor och uppföljning. Nätverksberoende delar har mockats ALDRIG — fixturtesten kör rena beräkningskärnor, och kvartetten vagfundament/analys/netnet/konfluens körs på frusen närmarknadsdata med matematiken omräknad för hand.

### Kravlista på main

- (tom) — alla deterministiska motorer har ren beräkningskärna nåbar från verktygslager; ingen motor kräver utbrytning.

_Rapport genererad av verktyg/validera-motorer.mjs (100%-väktaren) — kontroller: struktur, matematik (NCAV/σ/SM-2/AKM1 m.m.), determinism, gränser, fixturtest på rena kärnor, robusthet (90 s)._
