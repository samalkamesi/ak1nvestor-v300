# KONTROLL 2026-09-20 — sa-laser-du-skf-b-q3-2026 (oberoende granskningsrond, agentfabrik auto-s1-1789902316443 s1-u1)

**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-skf-b-q3-2026.json` — SKF B Q3 2026, kvartalsläspaket #4 i serien (byggt 2026-09-15 15:15, commit `3f01c752` "auto s4-u2 kvartalsläspaket SKF Q3 2026 — tidigaste rappdagen bland [...]").

**Granskningsproveniens:** agentfabrik-auto, spår 1 (granskare) 1/3. Uppdragsmallens "m9-utkast #1" är ett duplikat — m9-serien är 6/6 granskad FLYTTKLAR sedan 2026-09-16/19 (konsoliderad KONTROLL i denna mapp) — duplikatregeln tvingar pivot enligt omgångens koordinering: **SKF B = äldsta ogranskade objektet i hela granskningskön** (kvartalsmappens FIFO: skf-b 15:15 → atlas-copco 15:21 → sandvik 21:21; äldre än samtliga -en/-ar-översättningar 09-17+). Klaim `data/vakten/auto-s1-1789902316443-s1-u1-ansprak.md` skriven 11:12 UTC FÖRE granskningen; syskon u2:s klaim (Atlas Copco, 11:08) förutsatte just SKF som u1:s val — noll kollision, tre skilda objekt i omgången.

**Bedömning: FLYTTKLAR EFTER RÄTTNING** — sond `verktyg/_s1u1-skf-kontroll.mjs`: **123 kontroller, 120 PASS / 3 STILLAS** (de tre förregistrerade byggfelen B1a–B1c; allt annat grönt). Rättningsserien: [diff](./sa-laser-du-skf-b-q3-2026-diff.json) — 15 mekaniska byte (samtliga gammalt-strängar verifierade UNIKA) + 1 icke-tvingande notis. Efter verkställande ger sonden 0 STILLAS ("RÄTTNINGAR VERKSTÄLLDA"). **Publicering förblir kundens beslut (R2).**

## Metod — vintage-disciplin och konventioner

Medianerna verifierades mot **byggtidens vintage** (git `ea7ad8bd`, 109 poster, committad 2026-09-15 14:31 — läget vid utkastets födelse 15:15) under **projektets kanoniska medianfunktion** (`src/lib/dataset-nyckeltal.ts:72`: jämnt antal → medel av de två mittersta) — samma discipl som ABB-kontrollen 2026-09-19. Driftmätningen mot **dagens 225-postfil** (2026-09-20 07:59) följer tele2-rondens presedens ("dagens tal + as-of-datering" — sajten servar dagens fil). Övriga källor: `data/analyses/SKF-B.ST.json` (verifierad 2026-08-24), `data/rapporter/vagvalidering-SENASTE.{md,json}` (rond 2026-09-04), `kalender-industri.json`/`kalender-finans.json` (2026-09-15), `data/analyses/` (medlemskapstest för urvalspåståendet), localhost:3000 (länkar).

## 1. Källor och siffror — grönt hela vägen utom median-fynden (se 2)

- **Vågdata 13/13 EXAKTA** mot `SKF-B.ST.json`: fem horisontklasser (mikro=basbygge, övriga fyra impulsvåg), 25-cellersmatrisen **15▲/5▼/5—** (omräknad cell för cell), volatilitet **28,7 %** = fältet `sigmaAr 0.2874` (texten Är MER exakt än källans egna visningsbullet "29 %" — bra), 52v-position **93 %** (`pos52 0.932`), samtliga fyra datastyrda nivåer (157,70 / 255,82 / 245,00 / 270,10 — MA50/MA200 omräknade till två decimaler). De två tidslägena är korrekt åtskilda i texten: vågmätning 08-24 (93 % i spannet) ≠ nyckeltalsinsamling 09-03 (kurs exakt vid toppnoteringen) — inget uppvisningsfel.
- **Vågvalidering 9/9 ORDAGRANT**: SKF-raden i `vagvalidering-SENASTE.md` (rad 34, rond 2026-09-04) återges exakt — mikro träff ✓ (−2,8 %), kort miss ✗ (228,1 %), medellång miss ✗ (87,8 %), lång osatt ("döms aldrig"), mega miss ✗ (87,8 %) — plus domprotokollets trösklar (impulsvåg=positiv momentum; basbygge inom ±6 %) och universumAntal 12. "Tre av fyra dömda klasser missade — öppet, med siffrorna synliga" är precis systemets egen ärlighetsidé.
- **SKF:s egna tal 26/26 EXAKTA** mot universumposten (`SKF-B.ST`, identisk vintage↔idag): kurs 270,10, mcap 122,99≈"cirka 123 mdr", ROE 8,3 / ROIC 11,5 / brutto 28,6 / EBIT 9,6 / netto 5,0 / FCF-marginal 3,5, TTM +0,1, CAGR −1,9/−4,2, prognos +14,3, P/E 27,8 / P/B 2,1 / EV/EBIT 15,3 / FCF-avkastning 2,6 / skuld-EK 0,34, seriebasen 91,583→"91,6 mdr", netto 6 474→3 927 Mkr ("minus 39 procent" = −39,3 ✓). **Ärlighetsraden är sann i varje led**: räntetäckning null, tomma serier för EK/FCF, fyra (inte fem) redovisade år, ROIC-proxyn formulerad exakt som källans notering, "kvartalsnivåer finns inte i vårt underlag" (universumet bär bara helårsserier). MarketStack-bristen ("kunde inte dubbelkolla") bekänns öppet.
- **Aritmetik 16/16**: rutnätets 9 celler omräknade på ourådad bas (91,583 — textens "88,8" vid −3 % är RÄTT mot obehandlad bas; avrundad 91,6 hade gett 88,9), 1 pp marginal = 0,92 mdr, 3 % omsättning = 0,26 mdr, kvoten 3,5×, spannet +32 % ≈ "omkring en tredjedel", EBIT-marginalen 9,6 konsekvent.
- **Kalender + urval 11/11**: rappdag 2026-10-21 = **onsdag** ✓ och exakt kalenderposten; "preliminär avstämningsdag dagen före" står ordagrant i kalenderns notera; Atlas Copco 22/10 ✓, Sandvik 22/10 ✓, "ett dygn före" ✓; H&M 24/9 + Ericsson 15/10 + Volvo Cars 23/10 ✓ mot syskonpaketen. **Urvalspåståendet är mängdlogiskt SANT och verifierat**: analysbiblioteket (`data/analyses/`) ∩ vågvalideringens 12 tickers = {ATCO, AZN, ERIC, SAND, SKF}; med Ericsson redan levererad är SKF:s 21/10 tidigast (22/22/nov). Konkurrensen kontrollerad: Nordea (vågvalideringsmedlem, rappdag 15/10) finns INTE i analysbiblioteket — textens snäva formulering "bolag i analysbiblioteket som också ingår i vågvalideringens universum" exkluderar den korrekt. SKICKLIGT SKRIVEN mening — den håller strikt.

## 2. Medianer — 10 gröna, 3 byggfel (B1), drift-serien (B2)

- **Tio av tretton medianer EXAKTA mot vintage** under kanonisk konvention (ROE 19,7; brutto 40,3; EBIT 16,9; netto 12,8; FCF-marg 11,2; TTM +9,1; P/E 28,3; EV/EBIT 21,5; P/B 5,1; skuld-EK 0,46 — n=11 udda, konventionsokänsliga).
- **B1 — rotorsak: övre median i stället för projektets kanoniska funktion vid JÄMNT n** (byggfel, fel redan på byggtidens vintage):
  - **B1a** ROIC-median "17,7" → kanoniskt **17,4** (n=10: s[4]=17,14, s[5]=17,71, medel 17,43; byggfelet tog övre mittelementet).
  - **B1b** "FCF-avkastning 2,6 procent — **exakt industrimedianen**" → likhetspåståendet är **falskt**: kanonisk median 2,34→2,3 (n=10); SKF:s eget 2,56 ÄR det övre mittelementet — alltså aldrig medianen. Starkaste rättningen i paketet (ett "exakt" som inte exakt är).
  - **B1c** universummedian P/E "20,1 (100 bolag)" → kanoniskt **19,9** (n=100: 19,713+20,135 / 2 = 19,92; byggfelet tog övre mittelementet 20,135).
- **B2 — drift 109→225 poster** (tele2/flygaktier-precedensen: dagens tal + as-of-datering; industri n=11→20, universum P/E-n 100→215): tio medianvärden, två n-utsagor och källraden uppdateras i diff-posterna B2a–B2l. **Båda huvudpåståendena överlever driften** (sond F, grönt): SKF under medianen i ALLA lönsamhetsmått + tillväxt (brutto närmast: 28,6 < 30,4) och P/E "i nivå med branschmedianen" (27,8 vs 28,0).

## 3. Juridik (2007:528) — REN

Exakt **ett** lagrum i hela paketet: "lagen (2007:528) 2 kap 5 §" — rätt lagrum, rätt paragraf (utbildningsundantaget), i juridikfootern (kursiv, sista rad). **0 främmande lagrum** (blandningsrisken 2022:260/2022:261/1985:716/2005:59/2022:482: noll träffar). Rådordsgrinden: "rekommendation att köpa, sälja eller behålla" och "Inga köp-, sälj- eller hållningsrekommendationer" — endast negerade kontexter; "investeringsrådgivning" endast negerad; inget "väntas"-vendel. Utbildningsramen genomgående: observationer-not ("inte nivåer kursen borde nå"), konsensus-tvåningen ("inte en prognos från oss" / "inte en måttstock på rätt eller fel"), "aldrig en handssignal". Scenarieövningarna är de renaste i klassen — hela Övning A–C är skrivna som "övning i vad man vanligtvis tittar på".

## 4. 911-referenser — REN (0/6)

"911", "11 september", "september 2001", "9/11", "terror", "terrordåd": **0 träffar** i title + description + body.

## 5. Länkar — 13/13 LEVANDE

Alla tretton unika interna länkarna HTTP 200 mot localhost:3000 (tio aspektsidor under /dataset/industri/, universumjämförelsen, /bolag/skf-b-st, /kurser).

## 6. Struktur och format — familjenormen vid byggtiden

Titel 77 tkn och description 228 tkn ligger inom tidiga seriens fönster (77–94 / 204–291); rm 6 vid 1 621 ord är syskonnormen (hm-b 1 548→7, volvo-car 1 386→6, ericsson 1 197→6, ABB 2 023→6) — det senare 600-ordskontraktet (round=3) infördes EFTER denna byggnation och lämnas orörd som **notis N1** (seriegenomgång = huvudagentens beslut). »«-citat (6 st) = ericsson/ABB-normen vid samma byggtid. Tabeller well-formed (19 rör-pipes, 3 separatorer); 0 typografiska citattecken, 0 CJK, 0 dubbla mellanslag, decimalkomma konsekvent.

## Dom

**FLYTTKLAR EFTER RÄTTNING.** Verkställ diff-posterna B1a–B2l (15 byte, alla strängar unika; SKF:s EGNA tal rörs INTE — endast medianjämförelser, n-utsagor och källrad), kör `node verktyg/_s1u1-skf-kontroll.mjs` → 0 STILLAS. Källbottnen är i övrigt den starkaste klassen i seriens tidiga paket: samtliga 55 käll-/sifferkontroller exakta, vågvalideringsdomarna ordagrant, urvalsmängden mängdlogiskt bevisad, ärlighetsraden sann i varje null. Publicering = kundens beslut (R2); exportvägen stryker utkastmarkörer.

— agentfabrik s1-u1, 2026-09-20 · klaim FÖRE arbete · sonden läser ALDRIG, skriver ALDRIG · 0 R2-ytor rörda
