# KONTROLL 2026-09-19 — flygaktier-sa-analyserar-du-flygplansindustrin.json (B14)

**Granskare:** agentfabrik auto-s1-1789804748544 s1-u2 · **Sond:** `verktyg/_s1u2-flygaktier-verify.mjs` (58 OK / 1 FEL-rad = rådgloss-dom se punkt 4 / 1 VARNING = diff-posten B5) · **Objekt:** data/blogg-utkast/, byggd 2026-09-16 15:38 (s3-u1-generationen, commit 68618489-familjen) — detta är den OBEROENDE granskningen

## VAL och duplikatkontroll

Uppdragstitelns "m9-utkast #2" (branschmedianer-akm2 v2) är komplett levererat sedan
2026-09-16 14:35 (s1-u1:s KONTROLL + diff; hela m9-serien 6/6, commit 8448ef77) —
KONTROLLen täckte exakt uppdragets fyra punkter (källor/siffror/juridik-2007:528/911).
Köregeln duplikat = förlorat arbete tvingar pivot (tolvte pivot-fallet enligt worklog).
Klaim skriven FÖRE arbetet: `data/vakten/auto-s1-1789804748544-u2-ansprak.md`
(0 syskonanspråk på objektet; u1 tog kvartalsspåret — ABB Q3, deras leverans finns
redan i granskning/-mappen). **Val: FLYG = det enligt förra omgångens worklog (14626)
ENDA kvarvarande ogranskade rotutkastet av 09-16-generationen** ("två kvarvarande:
detailhandel + flyg" — detailhandel levererad av s1-u3 samma dag). Ingen gransknings-
artifact i någon av könens namnkonventioner (granskning/flygaktier* = 0 träffar).

## Kontrollen (09-15/16-standarden)

1. **KÄLTALSPARITET 21/21 gröna** mot `data/portfolj-system/bolagsunivers.json`
   (dagens träd): Airbus brutto 16,3 · EBIT 8,7 · ROIC 20,5 · P/E 25,9 · EV/EBIT 22,0 ·
   P/B 5,9 · PEG 4,0 (3,97) · prognosTillväxt 6,5 · skuld/EK 0,55 · FCF-marginal 6,1 ·
   fwd P/E 24,4 (not: 25,94/24,35); GE brutto 31,1 · EBIT 20,6 · ROIC 27,5 · P/E 39,0 ·
   EV/EBIT 33,8 · P/B 19,4 · PEG 4,2 (4,23) · prognosTillväxt 14,7 (GE-noteringen
   bekräftar "konsensus EPS-tillväxt +1 år" ⇒ textens "konsensusprognos" KORREKT för
   GE — spelaktier-B2:s fälla finns ej här); notfältsbärda kassa 13,1/skuld 14,3 mdr €.
   Båda halvorna klassade industri (textens eget påstående: sant).
2. **SERIER + ARITMETIK 17/17 gröna** (egna omräkningar): omsättning 58 763 → 65 446 →
   69 230 → 73 420 M€ (2023 +11,4 · 2025 +6,1 exakt); resultat 4 247 → 3 789 → 4 232 →
   5 221 M€ (−10,8 · +23,4 exakt); FCF 3 824 → 3 204 → 3 733 → 4 031 M€ — serien citerad
   ordagrant och "positivt samtliga fyra år" sant; räkneexemplet 8 000 ÷ 800 = 10 år;
   "nästan dubbelt" brutto = 1,90×; Airbus PEG = spårkonventionen exakt (25,94 ÷ 6,53
   = 3,97 — universums not dokumenterar derivationen).
3. **FYND B1 — "universum bär sektorn två bolag" är motbevisat (VÄSENTLIGT, glidnings-
   drivet).** Dagens universum bär FYRA flygplansindustri-bolag klassade industri:
   Airbus, Boeing, Embraer (plansidan) + GE Aerospace (motorsidan) — maskinell namn-
   sökning (Safran/MTU/Rolls/Saab m.fl. = 0 ytterligare; Saab är försvarsklassad).
   TIDSLINJEN (git-återkallad): byggtiden 15:38 läste en 14-industri-vintagen UTAN
   Boeing (3d9a5e89, committad 21:44 samma kväll; Boeing landade i c256c659 därefter,
   Embraer senare) — meningen var SANN mot byggtidens data och är FALSK mot det
   universum en läsare verifierar mot idag. B-seriens första rent innehållsdrivna
   universumglidnings-fynd (jfr halvledar-C1:s talklass). Duopolstycket i samma text
   namnger själv Boeing — läsaren möter motsägelsen utan att lämna artikeln.
   Rättning (diff B1) räknar honestly upp fyra bolag och behåller Airbus+GE som
   guidens huvudexempel — all pedagogik och alla efterföljande talversioner intakta.
4. **FYND B2 — industri-medianerna är föråldrade (VÄSENTLIGT, samma glidning).**
   Texten: "P/E 26,9 och EV/EBIT 21,8 på samma data (14 bolag)" — exakt byggtidens
   vintagen (26,85/21,794, n=14). Dagens träd: **P/E 28,0 (n=18) · EV/EBIT 21,5
   (n=17 — Boeing saknar EV/EBIT-fält)**. Formuleringen "på samma data" gör citatet
   dateringskänsligt; kontrasten i meningen håller även mot nya medianen (Airbus 25,9
   under, GE 39,0 över). Rättning (diff B2) sätter dagens tal + redovisar 18/17.
5. **FYND B3 — PEG-etiketten "på ettårsprognoser" gäller bara Airbus.** Airbus PEG
   3,97 = P/E ÷ etårsprognos (spårkonventionen, notbelagt). GE PEG 4,23 är INTE
   härledbar ur ettårslongen: 39,04 ÷ 14,68 = **2,66** — GE-noteringen saknar
   peg-derivationsnot (Yahoo-källans eget tal, traditionellt flerårsbasis). En läsare
   som räknar efter får 2,7, inte 4,2. Rättning (diff B3) märker talens olika ursprung;
   alternativ för ägaren: byt till spårkonventionens 2,7 (men då faller "båda högt").
   Klass: beläggsblandning, släkt med spelaktier-B2.
6. **FYND B4 — "båda PEG-talen över 4" är falskt för Airbus.** Universumfältet är
   3,97 — under, inte över. Sammanfattningens precisering (diff B4).
7. **JURIDIK 2007:528 REN:** varumärkesgrinden (varumarke.json 26 mönster × 3 ytor:
   title/description/body) = 0 FEL / 0 VARNING; rådgloss-kontrollen gav 4 träffar —
   **samtliga deskriptiva företagsbeskrivningar** ("ett linjebolag säljer transporter",
   "flygplansindustrin säljer flygplan och motorer", "att sälja ett helt flygplan en
   gång", "att sälja decennier av service") — tredje person/infinitiv, noll imperativ
   mot läsaren (spelaktier-precedensen "säljs till spelbolagen" = deskriptivt); inga
   lagrum = ingen blandningsrisk; disclaimern "_Detta är pedagogisk finansanalys, inte
   investeringsråd._" exakt sista raden; utbildningsramen i ingress ("utbildning i
   metod, aldrig råd om enskilda aktier").
8. **911 = 0 träffar** på 6 mönster ("911", "11 september", "september 2001", "9/11",
   "terror", "terrordåd") i hel filen.
9. **LÄNKAR 16/16 HTTP 200** mot levande sajten (loopback): 10 kurser + 6 bloggposter
   — kursankaret se-10-flyg lever; km-003-kassaflodesanalysen länkad två gånger,
   16 unika mål; 0 utkastlänkar.
10. **STRUKTUR:** 8 H2 · title 47/60 · description 145/155 · 0 mjuka bindestreck ·
    sökord i title/ingress/första H2 · 6 tags · 1 371 ord textrensat (1 379 raw).

## FYND (diff-fil: 6 byt + 2 förslag + 1 R2-notis)

- **B1 (BYT, väsentligt):** två-bolag-meningen — se punkt 3. Söksträngen unik (1 träff).
- **B2 (BYT, väsentligt):** median-meningen — se punkt 4. Söksträngen unik.
- **B3 (BYT):** PEG-etiketten — se punkt 5. Söksträngen unik.
- **B4 (BYT):** "båda PEG-talen över 4" — se punkt 6. Söksträngen unik.
- **B5 (BYT):** readingMinutes 2 → **7** (round(1 371/200); nuvarande värde ger 686
  ord/min mot de 55 publicerades max 240, median 171). Ytterligare ett fall i klassen:
  substansrabatt 09-17, halvledar, hälsa, konsument, försvar, spel, bil, detailhandel.
  Byggd 09-16 = före domens kodifiering.
- **B6 (BYT):** stavfelet "multipelar" → "multipler" (body, multipel-sektionens första
  mening — bilaktier-A1:s felstavningsklass, där i description; här i body). Spegeln
  stavar rätt ("multiples") — gäller ej -en.
- **C2 (FÖRSLAG):** "kapital som får arbetafinansiera produktionen" — "arbetafinansiera"
  är ej ett ord. Förslag: "medfinansiera" (alternativ "arbetsfinansiera"). FRIVILLIGT.
- **C3 (FÖRSLAG):** "tillgångar som balansräkningen bara skimrar" — oklar formation;
  idiomet för "knappt spegla värdet" är "skummar på ytan". Författarröst — FRIVILLIGT.
- **D1 (R2-NOTIS):** publishedAt 2026-09-16 = skapandedatum; exportvägen stämplar
  publiceringsdagen (publicering = kundens beslut).

## FLAGGOR

- **F1 (verktygsägaren):** readingMinutes-felet passerade byggarens KVD 09-16 —
  ord/200-konventionen finns fortfarande bara i granskarlaget (samma flagga som
  försvar-B2/detailhandel-F1 efterlämnade; klassen är nu åtta+ dokumenterade fall).
- **F2 (byggfabriken/sammanställningsägaren):** universumglidningen är nu SYSTEMATISK:
  B-seriens "på samma data (N bolag)"-medianer och universuminnehålls-påståenden
  förfaller när universumet växer (135 → 195 sedan 09-16). Förslag: as-of-datering i
  universumcitat ("median per 2026-09-16") eller motorisk omräkning vid flytt till
  data/blogg/. Flyg-B1 är det första fallet där ett INNEHÅLLSPÅSTÅENDE (inte bara ett
  tal) fallit — rotkön av 09-16-generationen är slut, men kvarvarande -en-speglar och
  kommande guider bär samma exponering.
- **F3 (verkställaren):** -en-spegeln (09-18 10:13, ogranskad) bär B1–B5:s systrar
  ("AK1A's universe carries two companies" · "P/E 26.9 / 21.8 / 14 companies" ·
  "one-year forecasts" · "both PEG ratios above 4" · rm 2 vid 1 392 ord ⇒ 7); B6 gäller
  ej spegeln — speglas vid verkställning.

## DOM

**FLYTTKLAR EFTER RÄTTNING** — B1–B6 verkställs (med spegling i -en enligt F3),
C2/C3 beslutas av ägaren, D1 vid export. Källor (21/21), aritmetik (17/17), juridik,
911 och länkar (16/16) fullständigt gröna. Publicering = kundens beslut (R2).

*Endast data/ + verktyg/ + worklog = INGET bygge; src/ orörd (tsc-baslinjen bärs av
pre-commit-grinden); utkast-JSON:en orörd av granskaren; data/blogg/ orörd.*
