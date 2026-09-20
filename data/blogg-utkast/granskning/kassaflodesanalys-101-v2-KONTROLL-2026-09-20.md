# KONTROLL 2026-09-20 — kassaflodesanalys-101 KANDIDAT v2 (m9-3, nytt underlag)

**Granskat objekt:** m9-fabrikens kandidat för `kassaflodesanalys-101` **v2** — evergreen-
regeln har släppt igenom en ny utgåva eftersom `data/portfolj-system/bolagsunivers.json`
rörde sig 2026-09-20 07:59 (universumets tillväxtvåg 100 → 231 bolag). Kandidaten är
genererad i fabrikens **TORR-läge** (läsning, 0 rader skrivna till kön) och granskas här
INNAN kö-skrivningen — granskningsliggaren ligger redo när `--skriv` landar utkastet.

- Kandidat-md5 (fabrikens kvitto): `d8e135f50c9aee6f84434f6ef3929adb` · mall-md5 `e857b504…`
- Källor (fabrikskvitto, båda verifierade): bolagsunivers.json `cfa7a9f1…` · varumarke.json `9b906e42…`
- Föregångare: v1 KONTROLL 2026-09-19 (rond 101, 26 kontroller) — gällde 100-bolagsunderlaget;
  **detta är v2-kandidatens första granskning** (inget duplikat: samtliga tal är nya).

**Bedömning: GRÖN — FLYTTKLAR (kandidatnivå).** 49 kontroller, **0 fel**:
37 skriptkontroller (`verktyg/_s1u3-m9kassa-v2-kontroll.mjs`) · 6 911-mönster ·
3 HTTP-länkar · 3 statiska länkbevis. Ett frivilligt formuleringsförslag (C1) och en
notis (D1) — inga rättningar krävs för flytt.

## 1. Källor och determinism

| Kontroll | Väntat (kvitto) | Faktiskt | Dom |
|---|---|---|---|
| md5 bolagsunivers.json | cfa7a9f1e65ecdc52c17881b7a5882a0 | samma | ✅ |
| md5 varumarke.json | 9b906e4204a759db24c2c78b4b332e18 | samma | ✅ |
| Universum | 231 bolag | 231 | ✅ |
| Färskhet | bolagsunivers 0 d (gräns 45 d) | 2026-09-20 | ✅ |

Determinismkedjan intakt: samma källfiler + månadsnyckel ⇒ byte-identiskt utkast vid
`--skriv` (fabrikens garantibevis, kandidat-md5 oförändrat mellan två TORR-körningar).

## 2. Siffror — samtliga omräknade oberoende ur källfilen (21 talvärden)

| Tal i kandidaten | Omräknat | Dom |
|---|---|---|
| FCF-marginal: 206 av 231 mätta, median 12,7 % | 206 · 12,7 % (medel-av-mittersta) | ✅ |
| FCF-avkastning: 202 mätta, median 4,2 % | 202 · 4,2 % (metodrobust: även nedre mittersta = 4,2) | ✅ |
| Konverteringsgrad härledbar för 198 (båda fälten + positivt netto) | 206 har båda mätta, 198 med netto > 0 | ✅ |
| Konverteringsmedian 0,97 · 94 av 198 över 1,0 | 0,97 · 94 | ✅ |
| Fördelning fcfYield: >5 % 86 · 2–5 % 62 · <2 % 54 · negativa 21 | 86 · 62 · 54 · 21; **86+62+54 = 202 = n mätta** (negativa är delmängd av <2 %) | ✅ |
| Topp 5 FCF-marginal: FCX 176,2 · KINV-B 65,6 · ORES 63,9 · INDU-C 62,4 · EVO 59,2 | identiska (namn+ticker+bransch+värde) | ✅ |
| Botten 5: PSNY −30,8 · O −32,6 · ORCL −40 · RWE −69,6 · CAST −72,9 | identiska (stigande ordning i listan = fallande i data) | ✅ |
| Konverteringstopp: CRWD 35,92 · FCX 15,48 · MELI 6,65 | identiska (fcfMarginal ÷ nettoMarginal omräknad) | ✅ |

**kortNamn-transformeringen** (våg 95/96-fixens arv) verifierad på samtliga 12 namngivna
bolag: "(publ)" stryks, inledande "AB " stryks ("AB Industrivärden" → "Industrivärden"),
slut-suffix med komma stryks ("CrowdStrike Holdings, Inc." → "CrowdStrike Holdings",
"RWE Aktiengesellschaft" → "RWE", "Polestar Automotive Holding UK PLC" → "… UK"),
mittens-AB behålls ("Investment AB Öresund"). Branschfältets ASCII-värde "tillvaxt"
presenteras korrekt som "tillväxt". **0 dubbeltkommatecken** (kortNamn-buggens klass).

## 3. Juridik — lagen (2007:528): utbildning, aldrig rådgivning

Mekanisk sökning (titel + ingress + mall-body = det som publiceras):
- Rekommendationsmönster (köp/sälj/rekommendera/bör du/aktietips/garanterad avkastning/
  bra affär för dig): **0 träffar**.
- Deskriptiva ramformuleringar på plats: "en deskriptiv översikt, **inte en värdering**"
  (inledande rad), "sortering av data, inte omdömen" (topp/botten), "beskriver utfall,
  inte framtida hållbarhet" (fördelningen), "vad som gäller i det enskilda bolaget avgörs
  i den manuella analysen" (konverteringen).
- Negerad disclaimer sista raden: "aldrig investeringsrådgivning (lagen 2007:528)" ✅.
- Inga lagrum ur konsumenträtts-systemet nämns ⇒ ingen blandningsrisk.

## 4. 911-referenser: REN (0/6)

Seriens sex mönster ("911", "11 september", "september 2001", "9/11", "terror",
"terrordåd") sökta i HELA kandidaten inklusive kvitto-avsnitt: **0 träffar**.

## 5. Referenser och länkar: 3/3 levande

| Länk i "Fördjupa dig" | Bevis | Dom |
|---|---|---|
| /kurser/km-003-kassaflodesanalysen | HTTP **200** mot localhost:3000 + registerrad i `src/lib/larvag-karta.ts:53` + llms-fragor | ✅ |
| /forskningsbiblioteket | HTTP **200** + rutt `src/app/(huvud)/forskningsbiblioteket` | ✅ |
| /blogg/v19-kapitalforbranning-analys | HTTP **200** + fil `data/blogg/v19-kapitalforbranning-analys.json` | ✅ |

## 6. Struktur

Titel bär "(utkast)" ✅ · mall-body 7 "##"-rubriker (krav ≥ 2) ✅ · längd ≥ 800 tecken ✅ ·
kvitto-avsnitt avskiljt och märkt för borttagning före export ✅ · disclaimer sist ✅.

## 7. Diff v1 (granskad 09-19) → kandidat v2 — 16 rörda rader, alla väntade

- **Underlagsdatum + universumstorlek:** 2026-09-03/100 → 2026-09-20/231 (två rader).
- **Alla statistiktal** (medianer, n, fördelning): 92/10,8 % → 206/12,7 % · 87/3 % →
  202/4,2 % · 84/0,78/29 → 198/0,97/94 · 26/28/33/9 → 86/62/54/21.
- **Ytterlighetsbolagen byts** (universum mer än dubblat): topp Prologis/Netflix/… →
  FCX/KINV-B/ORES/INDU-C/EVO; botten Aker BP/Volvo Car/… → PSNY/O/ORCL/RWE/CAST;
  konverteringstopp Telia/Fabege/Vår Energi → CRWD/FCX/MELI.
- Mallens förklarande prosa, rubriker, länkar och juridik-ram: **oförändrade** (diffen
  berör enbart datums-/talrader och bolagslistor).

Maskinell diff: `kassaflodesanalys-101-v2-diff.json` (samma mapp).

## 8. Observationer (kräver ingen rättning)

- **C1 (frivilligt förslag):** fördelningsmeningen lyder "54 under 2 % — och 21 är
  negativa"; v1 formulerade delmängden tydligare ("varav 9 negativa"). Aritmetiken
  stämmer (86+62+54 = 202), men "varav 21 negativa" skulle omöjliggöra den additiva
  feläsningen 223. Mallägarbeslut — se diff-post C1.
- **D1 (notis):** FCX FCF-marginal 176,2 % (FCF > omsättning) är äkta ur källan och
  textens urvalsberoende-notis täcker fenomenet (investmentbolagsliknande rador
  omsättningsdefinitioner); ingen åtgärd, men värd att känna till vid kunddialog.

## 9. Dom och nästa steg

**GRÖN — FLYTTKLAR (kandidatnivå).** Samtliga tal spårbara till md5-exakt källfil,
juridik/911/länkar/struktur rent. Nästa steg i kedjan: (1) kö-underhållet kör
`node verktyg/m9-fabrik.mjs --skriv` — kandidaten landar i Supabase-kön som v2 med
status "utkast" (kandidat-md5 `d8e135f5…` = det granskade innehållet); (2) kundens
granskning i panelen (§1 i M9-GRANSKNING): läs, ta bort kvitto-avsnittet, "Skicka till
granskad"; (3) publicering = kundens klick (R2). Om `--skriv` skriver med en mall-md5
som avviker från `e857b504…` ska granskningen omköras (determinism-vakten).

*Granskat av agentfabrik auto-s1-1789925707056 s1-u3 (granskare 3/3), 2026-09-20.
Anspråk: data/vakten/auto-s1-1789925707056-s1-u3-ansprak.md. Skript: verktyg/_s1u3-m9kassa-v2-kontroll.mjs (37 kontroller, omkörbart).*
