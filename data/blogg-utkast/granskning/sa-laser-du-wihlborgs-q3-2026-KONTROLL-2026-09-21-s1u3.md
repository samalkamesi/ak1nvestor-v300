# KONTROLL — sa-laser-du-wihlborgs-q3-2026 (fastighetsgrenens nionde paket)

**Granskare:** fabriksagent s1-u3 (manifest auto-s1-1790012730031, granskningskön 3/3) · 2026-09-21 20:30–21:0x lokal
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wihlborgs-q3-2026.json` (v1, byggare auto-s4-1789931110711-s4-u2, 2026-09-20 21:21 · utkast-md5 `a73ab4ac7196badc259fa635a1281e30` — orört av denna granskning)
**Uppdrag:** källor, siffror, juridik-språk (2007:528), 911-referenser → flyttklart paket med diff-rapport.
**Pivot (öppet bokförd):** titelns "m9-utkast #3" (kassaflodesanalys-101) redan levererad två gånger — sammanställningens m9-3 GRÖN (rond 101, 09-19) + FLYTTKLART-PAKET 09-21 03:07 av förra s1-u3-instansen; m9-familjen 6/6 exportkapabel ⇒ FIFO enligt förra s1-u3:s kö-notis (worklog 16849): **wihlborgs 21/10 = tidigaste rappdagen bland kontrolllösa**. Anspråk disk-först 20:30:24 (data/vakten/auto-s1-1790012730031-s1-u3-ansprak.md); syskon u1/u2 hade inga anspråk på disk.

## Dom: GRÖN GRUND — FLYTTKLAR EFTER RÄTTNINGAR (B1–B7 via diff)

Sond `verktyg/_s1u3-wihlborgs-q3-kontroll.mjs`: **66 OK · 10 FEL (= fyndens belägg) · 5 NOT** efter två ärligt bokförda+rättade+omkörda sondbuggar (p1 utan argument → NaN vid Balder-kontrollen; nr-toleranser: PEG-gränsen ≤0,005, aktietalets 1-decimals-facit, trailing 1 dec, marginalgap-flyttal). Sonden LÄSER ENDAST.

## Gröna domäner (det starka)

- **KÄLLOR 13/13**: WIHL-raden exakt mot dagens universumfil på ALLA fält (pris 79,65 · P/E 11,203 · P/B 1,013 · EV/EBIT 17,955 · PEG 1,97 · FCF-yield 6,10 · ROE 9,27 · ROIC 5,46 · marginaler 71,69/71,09/47,34/32,33 · skuld/EK 1,4875 · golv-NAV 78,66 · serier 3 335→4 354 och 2 288→−27→1 706→2 220). Noteringens alla förbehåll (4 år ej 5, ROIC-proxy, räntetäckning osatt, ingen MarketStack-dubbelkoll) speglas ärligt i texten.
- **BYGGVINTAGE låst**: 78b39e9b (09-20 20:23, 237 rader) = utkastets egna "237 poster" — **samtliga 7 universum-medianer + PEG n=194 reproducerade exakt** (P/E 20,39 · P/B 2,72 · ROE 14,75 · EBIT 20,81 · netto 13,90 · skuld 0,5266→0,53 · PEG 1,315→1,32). Fastighetsgrenens medianer (14,38/0,946/8,57/57,37/43,58/1,10) exakta.
- **RANG 7/7**: P/B 10/17 stigande · nio under 0,95 · ROE 7/16 · EBIT 3/17 efter CATE 84,86 och NP3 74,88 (citat exakta) · FCF 3/16 (URW 9,51 → FABG 7,70 → WIHL → CATE 5,26 → BALD 5,05) · skuld 4/17 med Balder 1,480 · Balder −32 %/Catena −5,4 % under bok.
- **ARITMETIK ~30 kontroller**: premie 1,26 % · kapitalträff 78,63/78,66 (0,04 %) · identitet 10,928 mot 11,203 = +2,52 % · implicit EPS 7,11 → 2 186 Mkr · PEG-konvention 1,19 mot 1,97 (1,66×) · CAGR 9,29 med steg +16,4/+7,5/+4,3 · resultat-CAGR −1,00 · kvartalskedjan (härledda celler 1 097/1 111 = ren subtraktion; H1 2 324/1 664; rullande 4 536/3 227; +10/+7/+8 %; vinst +27,1/−33,2; värdeposter +28/−255) · V-form 2 247 · 2023-marginal −0,70 · 50,99/1 408/5,75/4,14/59,8 % · **scenarioruta 9/9 celler exakta** · rättesatser 43,5/92,9/2,1×/0,47 · EBIT-fält 0,4 % från drift 3 107 · P/E-förräkning 10,24.
- **JURIDIK 2007:528 REN på alla vägar**: kontrolleraText-spegel (26 fraser ur data/varumarke.json, RegExp giu) **0 FEL 0 VARN på hela ytan** (title+desc+tags+body) · rådglossor 0 · "rekommendation" 2 träffar, båda negerade (ingress + slutdisclaimer) · exakt en lagrumsfamilj (2007:528), ingen blandning · utbildningsgrunden bärande ("utbildning i metod", "inte vår prognos", "räknestorhet, inte prognos", övningsramen).
- **911 = 0** på sex mönster (sjunde granskade serien i släktet — ren).
- **LÄNKAR 20/20**: 18 interna HTTP 200 mot localhost:3000 (deploylåset FRITT — medie-lärdomen) + 2 externa wihlborgs.se 200.
- **STRUKTUR GRÖN**: H2 = 8 · **readingMinutes 6 = round(3 522/600) — kvartalskonventionen FÖLJD** (HB:s B2-gapa finns ej här) · desc 674 inom spann · **publishedAt 2026-10-21 = rappdagen (Kinnevik-konventionen FÖLJD)** · tags 6 (familjespann 6–7) · källor + disclaimer + R2-rad sist.

## FYND — B1 väsentligt, B2–B7 rättningar (kurer i diff-filen)

**B1 (VÄSENTLIGT — narrativbärande, 3 ytor): "enda europeiska kollegan/bolaget med P/B över pari" är FALSKT.**
Vintagens egna data (78b39e9b — samma 237-postfil texten deklarerar): **två europeiska bolag över pari — WIHL 1,013 och NP3 1,422 (land=Sverige)**; därtill sex USA-bolag (O 1,37 · PLD 2,375 · EQIX 7,04 · PSA 10,91 · SPG 15,03 · AMT 21,79). Korsbelägg: **grenens eget NP3-paket (granskat 09-19) redovisar uttryckligen "P/B: 1,42 — nu med premie"**. Felet sitter i (1) TITELN ("enda europeiska kollegan med P/B över pari"), (2) nyckeltalsstycket ("enda bolaget i det europeiska hyresgänget över pari"), (3) sammanfattande läsningen ("det enda europeiska bolaget över pari"). Rangpåståendena runt om (10/17, nio under 0,95) är korrekta — det är "enda" som är fel.

**B2 (sifferfel): driftsmarginalens övre intervallgräns.** Texten: "rör sig mellan 69,6 och 73,6 procent". Verkligt max = **Q2-2025: 813/1 097 = 74,1 %** (textens 73,6 är Q2-2026 — det näst högsta). Undre gränsen 69,6 ✓ (Q1-26 69,57). Kur: 73,6 → 74,1.

**B3 (stavfel): "handssignal" → "handelsingnal"** ("inte en handssignal" i P/E-övningen).

**B4 (konvention): title 344 tkn > familjetaket 314** (syskonens max Kinnevik 313). Kur som också botar B1:s titelyta: stryka "medan nio av sjutton handlas under 0,95"-detaljen (står i bodyn) → 300 tkn.

**B5 (källkonflikt, låg): webcast-tiden.** Texten "webcast kl 09:00 samma förmiddag (Q2:s rytm)" — kalenderunderlaget (09-15) bar 09:00, men bolagets IR-sida anger Q2-2026 webcast **08:30**. Kur: 08:30 enligt IR-sidan, eller neutral "samma förmiddag".

**B6 (sifferdetalj): avstämningsdagen.** Texten: "avstämningsdag och årsstämma 2026-04-22". Stämman 22/4 ✓ men kallelse (2026-03-16) föreslog och stämman beslutade **avstämningsdag fredagen 24 april 2026**. Kur: dela raden.

**B7 (avrundningsfel i källraden): "aktietal 24 487 ÷ 79,65 = 307,5"** — korrekt 1 dec av 307,432 är **307,4** (bodyn bär rätt 307,4; källraden 307,5 = intern inkonsekvens).

## C-notiser (ägarens val, inget tvång)

1. **Quick-facts-drift**: "bokfört fastighetsvärde kring 64 mdr / hyresvärde kring 5,0" är HELÅRS-2025-tal (källraden daterar dem ✓); bolagets quick facts visar efter 13,3-mdr-förvärvet 66,2 mdr / 5,2 — inget fel, men presensformen kan förtydligas vid nästa ratt.
2. **Vintage-drift (Nordea-metoden)**: universum-medianerna låsta till 237-vintagen; dagens fil 249 (P/B 2,70 · ROE 14,57 · EBIT 21,11 · PEG 1,26 n=206). Texten rättas EJ — den deklarerar sin vintage.
3. **Externa rappdagen**: kalendervyn laddas dynamiskt — 21/10 vilar på byggarens 09-20-liveverifiering (.ics) + sammanställningens not; arkivsidan bekräftar rytmerna runt om (helår 2026-02-10 · fjolårets jan–sep torsdagen 2025-10-23 · Q1 2026-04-21 · Q2 2026-07-06 07:00 — alla verifierade av denna granskning).
4. **Marginalgap-randfallet**: EBIT−netto = 23,75 exakt; textens "23,7 pp" = flyttalstrunkering (node: 23.749999…) — defensible, lämnad orörd.
5. **"cirka 68:e paketet"**: ej exakt verifierbart — "cirka" bär osäkerheten ärligt.

## RACE + KORSKONFIRMATION (bokförd öppet — samma fönsterklass som förra omgångens forskningslaget-race)

Syskon u2 lade anspråk på wihlborgs 20:29:00 — **69 sekunder före mitt (20:30:24)** — och levererade 20:34–35 (deras fem filer landade committade via u1:s ff7a0d00 som ride-along; worklog-svansen bår båda notiserna). Min anspråkskontroll kl 20:29 låg i sekvensfönstret mellan deras skrivning och min läsning. Dubbelarbete uppstod — vänt till värde enligt släktets precedens:

- **KÄRNFYNDEN KORSKONFIRMERADE av två oberoende agenter**: B1 ("enda europeiska över pari" falskt — NP3 1,422 Sverige i textens egen vintage), B2 (driftsmarginal-max 74,1 %) och aktieavrundningen (307,5 → 307,4). Två oberoende sonder, samma belägg.
- **u2 tillförde B1-fjärde ytan** (källsektionens "enda europeiska bolag över pari, nio kollegor under 0,95") — bekräftad av denna granskning; verkställs ur deras diff.
- **Denna granskning tillför FYRA fynd u2 saknar**: B3 (stavfelet "handssignal"), B4 (titellängden 344 > tak 314 — u2:s B1a-kur lämnar titeln på 373 tkn, fortfarande över taket; min title-kur botar B1+B4 i en rättesats → 295 tkn), B5 (webcast 09:00 mot IR-sidans 08:30), B6 (avstämningsdagen 24/4, ej 22/4).
- **AVVISNING (AV1)**: u2:s notis N2 ("readingMinutes 6 … konventionen ~3") är ett omräkningsfel — round(3 522/600) = round(5,87) = **6**; rm 6 ÄR kvartalskonventionen. u2 kopierade handelsbankens tal (1 955/600 = 3,26 → 3) utan att räkna om. Verkställ INTE 6→3.
- **DIVERGENS (D1)**: marginalgapet 23,75 exakt — u2 kurerar 23,7→23,8 (halva uppåt); denna granskning lämnar orörd (node-flyttalet 23.7499… gör 23,7 defensible). Ägarens val; inget felbelägg mot texten från någon sida.
- **Vintage-paritet**: u2 låste mot 79d8f765 (utkastets egen commit 21:24), s1u3 mot 78b39e9b (universum-commit 20:23) — samma data (n=237), samtliga medianer identiska; ingen konflikt.

**Verkställningsguide** (i diff-filen): u2:s B1d + B2 + B3 först; title/B1b/B1c-ytorna = ENDAST en diff per yta (rekommendation: s1u3:s title-kur + u2:s B1b/B1c); s1u3:s N1+N3+N4 därefter; D1 = ägarens val; AV1 = verkställ ej. Omkör sonden efteråt (förväntat 0 FEL).

## Verkställighet

Alla kurer maskinella i `sa-laser-du-wihlborgs-q3-2026-diff-2026-09-21-s1u3.json` (7 rättesatser, från-strängar unika i utkastet). Granskaren skriver ALDRIG andras filer: utkast-JSON:en orörd (md5 oförändrad), diffen verkställs av ägaren/nästa våg. Efter verkställning: omkör sond (förväntad 0 FEL) → FLYTTKLART.

KVD: endast nya filer (KONTROLL + diff + sond + anspråk + worklog-rad) = INGET bygge · src/ orörd (tsc-baslinjen vilar i pre-commit-grinden) · R2 orörd (publicering = kundens klick) · data/blogg/ ENDAST LÄST · utkast-JSON:en orörd · syskonytor orörda · commit med explicit pathspec enligt fabrikskursen.

— s1-u3 (granskare 3/3), 2026-09-21
