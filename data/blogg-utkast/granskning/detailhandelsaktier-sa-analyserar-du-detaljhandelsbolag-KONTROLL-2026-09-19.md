# KONTROLL 2026-09-19 — detailhandelsaktier-sa-analyserar-du-detaljhandelsbolag.json (B13)

**Granskare:** agentfabrik auto-s1-1789804529817 s1-u3 · **Sond:** `verktyg/_s1u3-detailhandel-verify.mjs` (62 OK / 0 FEL / 1 VARNING = diff-posten B2) · **Objekt:** data/blogg-utkast/, byggd 2026-09-16 av s3-u3 omgång 5 (byggarens KVD grön — detta är den OBEROENDE granskningen)

## VAL och duplikatkontroll

Uppdragstitelns "m9-utkast #3" (forskningslaget-grona-av-100) är komplett levererat sedan
2026-09-16 14:29 (s1-u2, korskonfirmerat av dåvarande s1-u3; hela m9-serien 6/6 sedan 14:35,
commit 8448ef77) — platshållar-texten i fabriksmallen (nionde pivot-fallet enligt worklog).
Köregeln ⇒ nästa INTE levererade: telekom-granskarens kölista från 09-16 (worklog ~12061)
räknade 15 guider i rotkön; efter syskonleveranserna (råvaru, energi, industri, skuldsättning,
riskhantering, lönsamhet, konsument, halvledar, tillväxt, saas, spel, försvar 09-18, bil 09-19)
återstår **detailhandel + flyg** — detailhandel är äldst (B13 09-16 15:36; flyg B14 15:38).
Klaim skriven FÖRE arbetet: `data/vakten/auto-s1-1789804529817-u3-ansprak.md`
(0 syskonanspråk på objektet vid skrivandet; u1/u2:s ytor orörda).

## Kontrollen (09-15/16-standarden)

1. **KÄLLTALSPARITET 27/27 gröna** mot `data/portfolj-system/bolagsunivers.json`
   (hämtat 2026-09-03): brutto 54,1/56,5/14,8 · ROE 34,7/34,0/36,3 · EBIT 11,0/20,1 ·
   netto 5,6/2,7 · skuld/EK 2,26/2,24/0,32 · P/B 8,1/9,3/7,5 · mcap 275,5/53,1 ·
   Inditex TTM +5,8 · Axfood P/E 21,9, prognos 8,4, PEG 2,6 (== universumts eget fält 2,63) ·
   serierna (H&M oms/res, Axfood oms/res) — samtliga EXAKTA. Byggarens kontrakt
   "externa tal = endast universumts" håller; källraderna i Källor-sektionen är
   räkenskaps-/IR-ursprungsbeteckningar utan egna avvikande tal.
2. **ARITMETIK 14/14 gröna** (egna omräkningar): EK Axfood 53,1÷7,5 = 7,08 ≈ 7,1 ·
   kapitalomsättning 12,6 (exakt 12,60 ur fält) · 2,7 % × 12,6 = 34,0 % = "huvuddelen av
   ROE 36,3" (94 %) · EK H&M 34,0 · kapitalomsättning 6,7 · rea-exemplet 97−46 = 51,
   EBIT 11→8 = −27,3 % ("mer än en fjärdedel") · H&M-tripling 3,41× · Axfood CAGR
   (89,152/73,474)^(1/3) = 6,66 % ≈ 6,7 · PEG 2,61 ≈ 2,6 · EBIT-gap 9,07 pp ("över nio"
   knappt men sant) · brutto-gap 2,36 pp ("nära varandra").
3. **FYND B1 — H&M-omensättningens tidsfönster är förskjutet (VÄSENTLIGT).**
   Texten: "H&Ms serie 2022–2025 … omsättningen föll från 236,0 till 228,3". Universumets
   serie: **223,6 (2022) → 236,0 (2023) → 234,5 (2024) → 228,3 (2025)** — endpoint
   2022→2025 är STIGANDE (+4,7 mdr, +2,1 %); fallet till 228,3 kräver 2023-topp som start.
   Samma menings resultatled (3,6→12,2) är däremot sant för 2022→2025 — meningen binder
   två olika fönster till samma "serie 2022–2025". En läsare som kontrollerar mot källan
   finner stigande omsättning, inte fall. Rättning (diff B1) behåller hela berättelsen:
   resultat-tredubblingen är 2022→2025-sann, omsättningsfallet 2023→2025-sant.
   Klass: kvartalsseriens "fönsterblandning" (jfr CAGR-kritiken) — siffrorna rätta,
   tidsramen fel.
4. **JURIDIK 2007:528 REN:** varumärkesgrinden (varumarke.json 26 mönster × 3 ytor) =
   0 FEL; rådglossor med ordgräns = 0 träffar (falsk positiv "inköp" eliminerad av
   gränsen); inga lagrum i texten = ingen blandrisk; disclaimern
   "_Detta är pedagogisk finansanalys, inte investeringsråd._" exakt sista raden;
   "Jämför hellre multiplicer …" = metodråd (utbildning), inte värdepappersråd.
5. **911 = 0 träffar** på 6 mönster ("911", "11 september", "september 2001", "9/11",
   "terror", "Terrordåd") i hel filen.
6. **LÄNKAR 13/13 HTTP 200** mot levande sajten (loopback): 6 kurser (v09-roe,
   v07-bruttomarginal, v10-skuldsattningsgrad, km-011, km-006, se-07-detailhandel —
   kursankaret lever) + 7 bloggposter; 0 länkar till utkast.
7. **STRUKTUR:** 8 H2 · title 56/60 · description 154/155 · 0 mjuka bindestreck ·
   sökord i title/ingress/första H2 · 5 tags · ord 1 313 textrensat (1 336 raw).

## FYND (diff-fil: 2 byt + 2 förslag + 1 R2-notis)

- **B1 (BYT, väsentligt):** H&M-fönstret — se punkt 3. Söksträngen unik (1 träff).
  **-en-spegeln (Ö13) bär systerfelet** ("sales fell from 236.0 to 228.3" i
  "2022–2025 series") och speglas vid verkställning.
- **B2 (BYT):** readingMinutes 2 → **7** (round(1 313/200); nuvarande värde ger 657 ord/min
  mot de 55 publicerades max 240, median 171). Sjätte fallet i klassen: substansrabatt 09-17,
  halvledar-B1, hälsa-B4, konsumentaktier-B4, försvar-B2. Byggd 09-16 = före domen 09-17.
  Spegeln (-en, 1 398 ord, rm 2 → 699 ord/min) speglas till 7.
- **C1 (FÖRSLAG):** H&M-radets approximation "5,6 % × 6,7 ≈ 37" ÖVERSKRIDER ROE 34,7
  (108 %; P/B-vägens kapital med rullande marginal) medan Axfood-radet anknyts explicit
  ("huvuddelen av ROE-talet 36,3"). Förslag: spegla anknytningen — "≈ 37 — grovt mot
  ROE-talet 34,7; gapet är tidsmetrik (rullande marginal mot bokfört årsresultat)".
  Texten bär ≈ och påstår ingen identitet ⇒ förslag, ej fel.
- **C2 (FÖRSLAG):** "Inditex slutligen växte både i omsättning (+5,8 % …) och i
  lönsamhet" — "i lönsamhet" saknar belägg i universumet (ITX.serier tomma; byggarens
  eget kontrakt: externa tal = endast universumts). Förslag: stryk "och i lönsamhet"
  eller belägg med aktuellt fält vid verkställning.
- **D1 (R2-NOTIS):** publishedAt 2026-09-16 = skapandedatum; exportvägen stämplar
  publiceringsdagen (publicering = kundens beslut).

## FLAGGOR

- **F1 (verktygsägaren):** readingMinutes-felet passerade byggarens KVD 09-16 och
  kvalitetsgrinden — ord/200-konventionen finns endast i granskarlaget, ej kodifierad
  i byggarnas KVD-mall. (Samma flagga som försvar-B2 efterlämnade.)
- **F2 (sammanställningsägaren):** GRANSKNINGSKO-SAMMANSTALLNING.md:s rotkö från 09-16
  kan nu radas: detailhandel granskad 2026-09-19 (flyttklar efter B1+B2); kvar i rotkön
  av den generationen endast flyg.

## DOM

**FLYTTKLAR EFTER RÄTTNING** — B1 + B2 verkställs (med spegling i -en), C1/C2 beslutas
av ägaren, D1 vid export. Källor, aritmetik, juridik, 911 och länkar fullständigt gröna.
Publicering = kundens beslut (R2).

*Endast data/ + verktyg/ + worklog = INGET bygge; src/ orörd (tsc-baslinjen orörd —
pre-commit-grinden verifierar); utkast-JSON:en orörd av granskaren; data/blogg/ orörd.*
