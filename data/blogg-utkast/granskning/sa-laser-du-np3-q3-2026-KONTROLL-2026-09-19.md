# KONTROLL 2026-09-19 — NP3 Q3-2026-läspaket (oberoende granskning)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-np3-q3-2026.json` (byggd 2026-09-16 16:21, s4-fabriken)
**Granskare:** agentfabrik s1-u1, INSTANS 2 (omgång auto-s1-1789804529817; anspråk instans2-np3 på disk före arbetet, gitignorerad väg)
**Metod:** samtliga tal EGENOMRÄKNADE ur aktuella källor på disk; medianer replikerade mot byggvintagen med projektets egna konvention (`median()` i src/lib/dataset-nyckeltal.ts: udda → mittersta, jämnt → medel av de två mittersta, null exkluderas aldrig som noll); utkast-JSON:en orörd.

## Dom

**FLYTTKLAR EFTER RÄTTNINGAR.** 68 maskinella kontroller gröna; tre B-fynd (två väsentliga narrativfel + ett ordinalfel med tre ställen) och fyra C-beslut. B-posterna är kirurgiska byten med maskinellt unika strängar; C-posterna kräver ägarbeslut. Publicering förblir kundens beslut (R2).

## Kontrollblock

**Källor och vintage.** Universumraden NP3.ST (data/portfolj-system/bolagsunivers.json, insamling 2026-09-03): samtligt 25+ fält exakta — pris 260 · mcap 16,025 mdr · P/E 11,374 · P/B 1,422 · EV/EBIT 17,505 · PEG null · FCF-yield 4,67 % · ROE 14,53 % · ROIC 6,55 % (proxy-not) · brutto 75,94 · EBIT 74,88 · netto 64,04 · FCF-marginal 31,39 % · skuld/EK 1,4152 → visas 1,42 ✓ · oms-CAGR 13,60 % · res-CAGR 1,40 % · TTM +10,1 % · prognos −5,7 % · insider 0 · golv 182,88 (tillgångstung; marginal −0,4217 ≙ kursen +42,2 % över) · serier 2022–2025 cell för cell (omsättning 1 551/1 797/1 992/2 274 Mkr; resultat 1 224/−62/914/1 276 Mkr). Median-vintagen LÅST till commit 6b227943 (2026-09-16 15:04, 132 poster, 12 fastighet) — textens egen datering "beräknade 2026-09-16 … 132 bolag" korrekt; dagens fil (195 poster) ger andra tal och texten ska inte rättas till den (Nordea-vintage-metoden).

**Medianer 10/10 EXAKTA** mot vintagen med konventionsrepliken: fastighet P/E 11,29→11,3 · P/B 0,81 · ROE 8,37 % (n=11 — ett bolag saknar fältet, stmmer) · EBIT 63,9 % · netto 46,0 %; universum 21,2 · 2,81 · 15,6 % · 21,9 % · 14,9 %; universum-n pe=123/pb=130 inom textens "n=123–132 per mått" ✓. P/B-fördelningen: endast NP3 (1,422) och Prologis (2,375) över 1,4 ✓; Wihlborgs 1,013 = "strax över 1:an" ✓; samtliga övriga under 1 ✓; NP3 enda nordiska bolaget med klar premie ✓.

**Aritmetik 30+ kontroller gröna.** Intäktssteg +15,9/+10,9/+14,2 % (15,86/10,85/14,16) · totalt +46,6 % · CAGR 13,60 %/år · resultatändpunkter +4,2 % (+4,25) och CAGR +1,40 %/år (+1,397) · härledd måttserie 78,9/−3,5/45,9/56,1 % (78,91/−3,45/45,88/56,11) · identitet 1,422 ÷ 0,1453 = 9,79 mot 11,374 = −13,95 % ≙ "cirka 14 procent" ✓ · omvänd 11,374 × 0,1453 = 1,6525 → 1,65, +16,22 % ≙ "16 procent" (C4) · implicit EPS 22,86 · tre vinstvägar: 16 025 ÷ 1 276 = 12,56 → 12,6; 16 025 ÷ 11,374 = 1 408,9 → 1 409; TTM 2 274 × 1,101 = 2 503,7 → ≈2 504, × 64,04 % = 1 603,4, P/E 10,0 — intervallet 10,0–12,6 ✓ · PEG-konventionen 11,374 ÷ (−5,7) = −2,0 ✓ · DuPont median-P/E × NP3-ROE = 1,64 ✓ med ärlighetsnoten om stridspunkten (1,65 ≠ 1,42) ✓ · P/E-övningen 11,374 ÷ 0,943 = 12,06 ✓ · premie 260/182,88 = 1,4217 → 1,422 och +42,2 % ✓ · scenariorutan 9/9 celler exakta (1 629,6/1 651,7/1 673,7; 1 680,0/1 702,8/1 725,5; 1 730,4/1 753,9/1 777,3) på basen 2 274 × 74,88 % = 1 702,8 och intäktsnivåerna ±3 % (2 205,78/2 342,22) · räknesatser 1 pp = 22,7 Mkr och 3 % = 51,1 Mkr · kvot 2,2 ✓ · marginalvikt 1/(3 × 0,7488) = 0,45 enligt Essity-formeln ✓.

**PEG-jämförelsetalen SAMTLIGA 7 omräknade exakta:** Nordea 8,87/2,19 = 4,05 · Handelsbanken 18,54/2,33 = 7,96 ≈ 8,0 (intervallets topp) · Swedbank 6,99/1,57 = 4,45 · Essity 3,4/1,77 = 1,92 · Alfa Laval 2,4/1,84 = 1,30 (intervallets botten) · NIKE 1,48/0,54 = 2,75 · Wallenstam 0,76 (enda underläget) — textens "sex över (kvoter 1,30–8,0), en under (0,76)" EXAKT.

**Seriepåståenden.** Marginalvikten 0,45 = bottenrekord SANT (Castellum 0,53 och Wallenstam 0,58 närmast; övriga dokumenterade 0,66–10,45) · "största avvikelsen i en enda valuta (14 %)" SANT — dokumenterade en-valuta-avvikelser före NP3: 0,3–11,6 % (Swedbank 0,3 … Essity 9 med reservation, EVO 10,4–11,6 efter byggtid); Nordea/ABB = tiopotens-/valutaklass, korrekt åtskilda i texten · "avvikelser från 0,3 till 14 procent" ✓.

**Kalender.** Rappdag 2026-10-16 fredag ✓ med ordagrant kalenderbevis ("2026-10-16: Interim report January–September 2026") · nästa kalenderpost 2027-02-05 ✓ · presentation/webcast-sedvana ur källraden ✓ · dagen-efter-kedjan Wallenstam 15/10 (kalender-fastighet) + Nordea 15/10 (kalender-finans, officiell) + Ericsson 15/10 kl 07:00 (kalender-teknik, officiellt bekräftad) ✓ · Prologis 15/10 = bokad konferens, ej publiceringstid ✓ (korrekt sorterad med datamotivering: tomma serier bekräftade) · nästa fastighetskandidat Castellum 22/10 officiell ("Interim Report January-September 2026" som kommande event) ✓, Wihlborgs 20/21 estimat ✓, Fabege 21/10 Inderes (tredjepart) ✓ · ingen X-dag i oktober för NP3 ✓.

**Syskonkorsreferenser.** Wallenstam: ROE 8,37/ROIC 2,95/skuld 1,07/oms-CAGR 7,3/netto 80,8/EBIT 57,4 ✓ · NAV-rabatten "cirka 20 procent under" (41,02/51,40 = 0,798) ✓ · "grovt 800 miljoner … poster nedanför rörelseresultatet" ordagrant i syskonet ✓ · CAGR 32,47 ✓ · övningens sjunkande P/E (10,005 ÷ 1,0182 = 9,83) ✓ · NIKE:s elva insidertransaktioner ✓ · omgångens syskonanspråk (Volvo Group 23/10 + Tele2 20/10) bekräfs av byggordningen 16:06/16:24 kring NP3 16:21 ✓.

**Vågvalidering/analyslucka.** NP3 finns ej i data/rapporter/vagvaldering-SENASTE.md (0 träffar) och saknar analysfil i data/analyses/ — textens "ingen dom och ingen 25-cellersmatris" är den ärliga redovisningen (ABB-/Wallenstam-presedens) ✓.

**Struktur.** Bodyn 2 920 ord · readingMinutes 5 = round(2 920/600) ✓ (N5-kontraktet) · title 232 tkn inom kvartalsfamiljens 77–314 · description 1 057 tkn = EXAKT på familjetaket 204–1 057 (C3-notis).

**Juridik — REN enligt 2007:528.** Exakt ett lagrum i hela paketet (2007:528, 2 kap 5 §, i disclaimerns sista rad); ingen lagrumsblandning möjlig. Fem unika verbträffar, samtliga verifierade i nekande/neutral kontext: "inte en rekommendation att köpa, sälja eller behålla några värdepapper" (ingress), "Inga köp-, sälj- eller hållningsrekommendationer förekommer" (disclaimer), "rådata … redovisas utan signalvärde" (insiderrad, neutral). Prognostillväxten explicit "inte en sanning och inte vår prognos" ✓. Budgivnings-/rådslös konflikt: ingen.

**911-referenser.** 0 träffar / 6 mönster (911 · 9/11 · 9-11 · "11 september" · "september 11" · "nine eleven") i title/description/body.

**Länkar.** 18 unika interna länkar — 18/18 HTTP 200 mot localhost:3000 (14 dataset/fastighet-aspekter + /bolag/np3-st + /kurser + /transparens + /kallor); 0 länkar till utkast; externa kalenderlänkarna (np3fastigheter.se) svarar 200 vid livekontroll.

## Fynd

**B1 (VÄSENTLIGT — superlativfelklassen, serie-fynd nr 10):** "P/B:n är seriens första där två oberoende vägar ger exakt samma tal" (description) och "seriens första P/B där två oberoende vägar (kurs ÷ golv och fältet) ger samma siffra" (body) — FALSKT. Wallenstam-paketet (fastighetsspårets första, byggd 09-16 09:39, alltså FÖRE NP3) förevisar exakt samma konvergens med orden "kvoten 0,798, alltså samma läsning som P/B": kurs 41,02 ÷ golv 51,40 = 0,798 = P/B-fältet 0,798. Konvergensen är SANN för NP3 (1,4217 ≙ 1,422) men inte först i serien. Kur enligt finans-precedensen: rangen rättas, kraften behålls — NP3 är fastighetsduons ANDRA konvergens och spegeln av Wallenstams. (I filen konvergerar fält och kurs÷golv dessutom för samtliga svenska fastighetsrader + Prologis — fältet verkar härlett ur golvposten; det gör påståendet-på-stil viktigt att rätt fokusera: konvergensen bekräftar golv-proxyns konsistens, inte två oberoende mätpunkter i strikt mening. Notis, ingen ytterligare rättning.)

**B2 (VÄSENTLIGT — urvalsberättelsens kalenderfakta; ABB-A2:s felklass, tredje fallet i serien):** "De amerikanska mönsterdatumen runt 13 oktober är estimat enligt kalendrarnas egen metodnot" — FALSKT mot den interna källan. Kalender-finans (oförändrad sedan hämtning 09-15 05:46, dvs FÖRE byggtiden) ger "Datumet är officiellt" för JPM 13/10 OCH GS 13/10; kalender-halso ger samma för JNJ 13/10. Ingen av deras paket fanns vid NP3:s byggtid (JNJ byggd 09-17 14:41, GS 09-18 10:46, JPM 09-18 23:03 — alla EFTER). Därmed håller inte hörnpåståendet "tidigaste återstående officiellt bekräftade rappdagen bland kalenderbolagen med bärande universumdata" (tre tidigare officiella datum med bärande data fanns olevererade). Den RIKTIGA urvalsmotiveringen står redan i texten: Wallenstam-paketet utropade NP3 som spårets nästa kandidat, och syskonen i omgången tog Volvo Group + Tele2 — fastighetsspårets turordning. Kur: skriv om avfärdningen till sanningen och SJÄLVA hörnpåståendet till spårturordningen.

**B3 (ordinalfel, tre ställen):** "Källkritikens åttonde ronda" (rubrik) + "identitetstestets åttonde rond" (description) + "Med det åttonde identitetstestet i böcken" (body) — NP3 är i byggordning det NIONDE testet. Seriegenealogin (grep "identitetstest" + substans, sorterad på mtime): 1 Nordea (09-15) · 2 Handelsbanken · 3 Swedbank · 4 Essity · 5 Alfa Laval · 6 Wallenstam (self: "sjätte" ✓) · 7 NIKE · 8 Volvo Group (self: "åttonde runda" ✓ — samma omgång, byggd 16:06, 15 min före NP3) · 9 NP3 · 10 Tele2 · 11 Castellum (self: "nionde" ✗). KOLLISION: alla tre paketen i kvällsomgången 09-16 (Volvo Group 16:06, NP3 16:21, Tele2 16:24) skrev "åttonde ronda" — parallellbyggandets blinda fönster; var och en räknade sju föregångare och inga syskon. Kur för detta paket: åttonde → nionde på alla tre ställen. (Kö-notiser till syskonens ägare nedan.)

**C1 (förslag):** PEG-passageens "NP3 ger det åttonde tillståndet" blandar paketnummer med tillståndsnummer — descriptionen räknar rätt ("PEG-fältets fjärde tillstånd"). Förslag: "NP3 är det åttonde paketet som prövar fältet — och ger dess fjärde tillstånd".

**C2 (beslut, R2):** publishedAt 2026-10-14 = rappdag −2 dagar. Seriekonventionen varierar (Volvo-paketet bär skapandedatum; AZN C4: publiceringsdag sätts vid flytt). Ingen ändring föreslås; publiceringstidpunkten är kundens beslut.

**C3 (notis):** description 1 057 tkn = exakt kvartalsfamiljens takvärde (204–1 057 enligt EVO-granskningens 55-posters mätning). Grönt, men nästa paket i familjen bör hålla sig under taket.

**C4 (valfri skärpning):** "16 procent åt andra hållet" är 16,22 % — "cirka 16 procent" vore stringentare; avvikelserna i övrigt förs "cirka".

## Kö-notiser (till ägare/nästa våg)

1. **Ordinalklustret** (Volvo Group åttonde=korrekt · NP3 åttonde→nionde · Tele2 åttonde→tionde · Castellum nionde→elfte): seriens byggprompt bör förbjuda ordinala serieanspråk i parallella omgångar, eller kräva räkning av syskon på disk FÖRE skrivning.
2. **Superlativfelklassen ≥ 10 fynd** (mx1: finans 2 + hälsa 3 + konsument 1 · mx2/EVO 2 · JPM: Samsung · ABB B1 · NP3 B1): mekaniskt superlativtest mot serien FÖRE bygg — upprepad systemflagga, alltmer belastad.
3. **"Estimat"-avfärdningen av officiella amerikanska datum** är nu påvisad i minst tre paket (ABB A2 + NP3 B2 + JPM-granskningens not): urvalsmallen behöver en kalenderfaktakoll ("källans egen notera-rad vinner över mallens avfärdningstext").
4. **EVO:s replikerade PEG** (källa == konvention, 09-18) åldrar NP3:s "sex över/en gång under"-räkning — sann vid byggtiden 09-16, kompletteras vid eventuell uppdatering.
5. **Golv-härledningen:** P/B-fältet == kurs ÷ golv för alla tolv golv-bärande rader utom VNA.DE/URW.PA (0,56/0,48 och 0,826/0,62) — dataägaren bör dokumentera fältkonventionen (golv-härledd P/B vs fristående) eftersom "två oberoende vägar"-retoriken bärs av den.

## KVD

Endast nya filer (KONTROLL + diff + verktyg/_s1u1b-np3-kontroll.mjs + worklog-rader + anspråk på gitignorerad väg). Utkast-JSON:en orörd; src/ orörd = INGET bygge (tsc-baslinjen vilar i pre-commit-grinden); R2 orörd (priser/tier/publicering; data/blogg/ orörd); syskonytor orörda (Volvo Group-/Tele2-/Castellum-/Wallenstam-/NIKE-paketen endast lästa; ABB-leveransen från instans 1 bokas i worklog här, dess filer redan committade a3e158a2). Commit med explicit pathspec.
