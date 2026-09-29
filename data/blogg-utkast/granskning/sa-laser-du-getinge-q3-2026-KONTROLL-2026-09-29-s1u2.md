# KONTROLL — sa-laser-du-getinge-q3-2026.json (GETINGE Q3 2026, hälsogrenens 6:e paket)

**Granskare:** s1-u2 (manifest auto-s1-1790653512758, granskare 2/3) — 2026-09-29
**Uppdragstitel:** "Granska m9-utkast #2" — PIVOT (m9-ko-familjen 6/6 FLYTTKLARA sedan våg 208;
duplikatregeln) enligt släktets praxis till FIFO-kön: worklog 17074 kö-notis
"fabege/getinge 10-20" med u3:s anspråk på fabege samma omgång ⇒ **getinge = FIFO-tvåa**.
Anspråk: data/vakten/auto-s1-1790653512758-s1-u2-ansprak.md (FÖRE ingrepp).
**Sond:** verktyg/_s1u2-getinge-q3-kontroll.mjs — **122 OK · 4 FEL · 0 NOT** (deterministisk ×2).
**Utkast-JSON:en ORÖRD** — rättningar levereras enbart som diff (granskaren skriver aldrig andras filer).

## Dom: GRÖN EFTER DIFF — 4 B-fynd + 2 manusfynd (B-klass) + 3 C-notiser, alltså EJ flyttklar som den står

Utkastets datakärna är exceptionellt stark — alla 18 nyckeltalsfält, hela resultatsuget,
alla 32 medianer, alla 16 ranger och ~40 egna beräkningar replikeras mot byggvintagen — men
två av fynden sitter i TITEL/DESCRIPTION (sökmotorns ansikte utåt) och ett i scenariorutan
(pedagogikens kärncell). Verkställ diffen (7 rättesatser + 1 valfri) ⇒ flyttklar.

## Bevisläge (sondens radreferenser i parentes)

| Område | Dom | Bevis |
|---|---|---|
| Byggvintage | GRÖN | 73745b24 (09-19 04:10) = textens EGEN "samma 195-postfil"; GETI-rad **identisk vintage↔dagens fil på alla 18 fält** (drift-fri — Nordea-metoden behövs inte) (V01/V02) |
| Nyckeltalsfält | GRÖN | 18/18 exakta: pe 24,818 · pb 2,163 · evEbit 13,74 · peg 1,54 · fcfY 0,0425 · roe 0,0895 · roic 0,1381 · brutto 0,486 · ebit 0,1612 · netto 0,0782 · fcfMarg 0,0831 · skuldEK **0,3581** · prognos 0,0877 · resCAGR −0,0322 · omsCAGR 0,0732 · ttm 0,017 · kurs 245,70 · mcap 66 921 Mkr (T:*) |
| Serie 2022–2025 | GRÖN | oms 28 292/31 827/34 759/34 969 · res 2 491/2 412/1 638/2 258 Mkr — exakt (S01) |
| Medianer + rang | GRÖN | 16 mått × (hälso+universum): alla medianer inom avrundningstolerans, **alla 16 ranger korrekta** (15 fallande/högst=1 + skuld/EK stigande — textens egna konvention per mått, adjektiven konsistenta); n 20–22 i grenen / 155–195 i universumet = textens intervall (M:*) |
| Aritmetik | GRÖN utom 4 FEL | ~40 beräkningar ≤0,5 %: identitet 24,17 (2,6 %) · absolut 56 039 (−16,3 %) · implicit 2 696 · EV-kedja 5 637/30 939/**11 079 med fullprecision 0,3581**/78 000/13,84 (0,71 %)/77 452/548 · TTM 7,30/8,72/0,23/1,65/19,4 · FCF 2 906/4,34 (2,2 %)/23,5 · PEG 2,83/0,54×/16,1 · CAGR +7,32/−3,22 · marginaler 8,80/7,58/4,71/6,46 · steg +12,49/+9,21/+0,60/−3,17/−32,09/+37,85 · DuPont 32,5/8,3/66,9 · övning 2 566 (+13,7 %) · bilagetal 349,7/67,7/5,16/2,07 (A:*) |
| Juridik 2007:528 | **REN** | varumärkesgrinden 0/26 fraser på title+description+body · 1 rekommend-förekomst, negerad ("Inga köp-, sälj- eller hållningsrekommendationer") · **exakt en lagrumsfamilj** (blandningsregeln hel) · utbildningsgrunden bärande (J:*) |
| 911-referenser | **0** | 0 träffar i textytan, 0 råträffar (911) |
| Interna länkar | GRÖN | 18/18 HTTP 200 mot localhost:3000 (L:*) |
| Kalender | GRÖN | kalender-halso.json belägger alla fyra påståenden: 20/21-divergensen + Q1 04-21 + Q2 07-17 + pre-close 09-15 (KAL) |
| Gallringsunderlag | GRÖN | Kinnevik (0/936/23/0 + negativa år + P/E osatt), Billerud (−46,3 %), Viaplay (−9 747 Mkr 2023, ROE −52,87 %) — alla belagda i vintagen (GA:*) |
| Korsreferenser | GRÖN | cellavision 8/8 · novo 4/4 ("halvering" = novos "under hälften av det nuvarande", parafras OK) · goldman 2/2 · assa 3/3 citerade tal (X:*) |
| Struktur | GRÖN utom rm | titel 195 tkn ≤ tak 314 · 7 H2 · 8 tags · publishedAt 2026-10-20 = primära rappdagen (Kinnevik-konventionen, 21:a redovisas öppet) · disclaimer sist (ST:*) |

## FYND (B-klass — verkställ via diff innan flytt)

**B1 (VÄSENTLIGAST) — "seriens högsta netto-marginalvikt" är MOTBEVISAD.** Titelns grannfält
i description ("marginalvikten 5,2 är seriens högsta") och bodyns "Det är seriens högsta
netto-marginalvikt hittills (CellaVision 1,65, ASSA 1,98, Novo 1,01)" står emot seriens egna
två rekordpaket, båda på disk MER ÄN ETT DYGN FÖRE Getinge-bygget (09-19 03:09):
**Electrolux 10,45** ("seriens nya rekord, slår SCA:s 8,55", paket daterat 09-18 08:59,
sont bevisat) och **SCA 8,55** (citerat i ASSA/BS/JNJ/Nokia-paketen). Getinges 5,16 är som
bäst **seriens TREDJE högsta** — men **hälsogrenens högsta** (CellaVision 1,65 är grenens
näst högsta bland paketen), vilket är den räddande korrekta formuleringen. Sond: X:margvikt-rekord.

**B2 — scenariorutan TRANSPOSERAD (0/9 celler rättplacerade, 9/9 matchar transponatet).**
Etiketterna säger rader=marginal, kolumner=omsättning, men cellinnehållet är speglat över
diagonalen: kolumnen "Oms −3 %" innehåller hela marginalraden 4,46 % (1 512/1 559/1 605 för
−3/0/+3 %), kolumnen 0 % innehåller marginalraden 6,46 %, kolumnen +3 % raden 8,46 %.
Diagonalen (1 512 · 2 258 · 3 046) sitter rätt — därför ser tabellen "nästan rätt" ut vid
yttre ögats pass, men sex av nio celler lär ut fel kombination: läsaren som slår upp
"marginal 6,46 %, volym +3 %" hittar 2 957 (som i verkligheten är 8,46 % × +3 %). Alla nio
TAL är aritmetiskt korrekta (räknade på ostrunkerad basmarginal 6,457 %) — det är
PLACERINGEN som är fel. Kur: transponera cellvärdena (diff D4), talen är redan på plats.

**B3 — "833 miljoner lägre resultat" ska vara 853.** 2022–2024: 2 491 − 1 638 = **853** Mkr
(textens 833 är en cifraförväxling 5↔8). Sond: A:botten-resgap (2,4 % avvikelse).

**B4 — DuPont-noten tillskriver fel år.** "det är där 2024 års 1,75 marginalprocent gick
förlorade och där 2025 års återkomst började": 1,75 pp är **2025:S ÅTERKOMST** (4,71→6,46);
2024:S **förlust** var **2,87 pp** (7,58→4,71). Sonden bevisar båda stegen (A:margsteg-24/25).
Kur: D6.

**B5 (titel, B-klass genom placement) — "seriens tajtaste kontrollprofil" utan reservativ.**
Textens egen skalning: "den tajtaste i serien **sedan SAP**" — SAP var tajtare. Titeln
 överdrriver mot textens eget innehåll. Kur: D2 ("sedan SAP seriens tajtaste kontrollprofil").

**B6 — readingMinutes 4 bryter konventionen.** 2 770 ord → round(2 770/600) = **5**
(kvartalskonventionen; HB-precedensen worklog 16849). Kur: D7.

## C-notiser (ingen kur tvingande — bokförs för ägaren)

- **C1:** Titelns marginalsväng "8,8 → 4,7 → 6,5" komprimerar en FYRPUNKTSbana (2023 års
  7,58 utelämnas). Kompakt kur i diffen (D8, valfri) → "8,8 → 7,6 → 4,7 → 6,5"; description
  samma mönster. Titel förblir ≤ 314 tkn (214 efter D2+D8).
- **C2:** EBIT-marginal-raden länkar /dataset/halso/netto-marginal och FCF-marginal-raden
  /dataset/halso/fcf-avkastning — samma sidor som grannrader; dedikerade sidor finns ej
  (404, sonderat). Defensible "närmaste existerande begrepp", men vill vara en medveten
  convention i serien (nya paket bör göra likadant eller låta bli konsekvent).
- **C3:** "seriens 49:e paket" ej maskinellt verifierbart (byggordningen bland ~100 utkast
  på disk ej entydig); hälsogrenens 6:e är belagt (5 syskonpaket på disk).

## KVD

Endast NYA filer: 1 KONTROLL + 1 diff + 1 FLYTTKLART-PAKET + sond + anspråk + commitmsg +
worklog-rad. Utkast-JSON orörd. src/ orörd = **INGET bygge**; `node node_modules/typescript/bin/tsc
--noEmit` = 0 fel kördes som KVD-stämpel (kod berörs ej — verktyg/*.mjs ligger utanför src).
R2 orörd (publicering förblir kundens klick — FLYTTKLART ≠ publicerad). data/blogg/ orörd.
Syskonleveranser orörda (u3:s fabege-yta respekterad; deras fynd krediterade n/a — inga
överlapp fynd). Kö efter denna: getinge klar ⇒ 10-21-klustret (telia/iberdrola/var-energi/att)
enligt worklog 17074.
