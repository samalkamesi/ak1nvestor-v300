# o68 — Gränsnittsvaktens rotationsblindhet: 86 % av sajten kunde ALDRIG mätas (rotkur + bevis)

*(Nummerflytt o67→o68 enligt o44-precedensen: syskonen s8-u1 (commit 84050486,
o67-driftsboken-vaccin23) och s8-u3 (o67-nyckelhardning-feljakt-ledger) tog
båda o67 under samma manifestfönster — denna våg upptäckte kollisionen vid
worklog-läsning FÖRE commit och flyttade sitt eget nummer.)*

**Spår:** 8 KVALITET & SÄKERHET · **Våg:** s8-u2 (manifest auto-s8-1789730101010, vakt 2/3)
**Datum:** 2026-09-18 · **Fönster:** ~13:15–13:4x lokal · **Yta:** verktyg/granssnittsvakt.mjs + ny verktyg/granssnitt-urval.mjs + ny verktyg/testa-granssnitt-urval.mjs
**ALDRIG:** src/ (inget bygge), data/blogg/, R2-ytor, syskonens ytor (u1: kraschvakt + prod-synk-RAM · u3: feljakt-ledgerns nyckelhärdning).

## §1 Fyndet

Gränsnittsvakten (kunddirektivet våg 105: "aldrig igen nå kundens ögon") har
en **permanent mätblindhet på 86 % av sajten**: 1 738 av 1 943 sitemap-sidor
har ALDRIG mätts (journal 264 poster, varav 58 gällande borttagna sökvägar).
Blinda ytor inkluderar kundens kärnlover:

| Sektion | Sidor | Mätta | Notering |
|---|---|---|---|
| /en | 410 | 0 | tre-språkslöftet (100 % översatt) |
| /ar | 410 | 0 | tre-språkslöftet |
| /kurser | 334 | 0 | kundens 333 kurser ×3 språk |
| /labb | 202 | 0 | |
| /analyser | 232 | 63 | arv från före våg 157 |
| /bolag | 101 | 0 | |
| /blogg | 56 | 0 | |
| /dataset | 141 | **141** | prioriterad sektion — FULLTÄCKT sedan 09-15 |
| rotnivåsidor (/superanalys, /kalkylator, /netnet, /medlemskap, /villkor …) | 43 | 0 | s9-u2:s bokade köpost: "/superanalys + /kalkylator SAKNAS … ytan rutinmäts ej" |

## §2 Rotorsakan

`urvalMedJournal()` (v157, granssnittsvakt.mjs) sorterade med
`prio(a)-prio(b) || (journal[a]??0)-(journal[b]??0) || localeCompare` —
dvs. **PRIORITERADE_SEKTIONER gällde FÖRE mätåldern**. Konsekvensen är en
strukturell svältmekanik:

1. PRIORITERADE_SEKTIONER = ["/dataset"] = 141 sidor > 21 rotationsplatser
   (SIDOR_MAX 24 − 3 bas-sidor).
2. Varje /dataset-sida — ÄVEN redan mätt — sorterar före VARJE icke-dataset-
   sida (prio 0 < prio 1), oavsett ålder.
3. Sedan /dataset:s journaltäckning blev komplett (2026-09-15) har rotationen
   därför varit **låst i rundtur inom /dataset för evinnerligen**: 21/21
   platser till dataset-sidor mätta 09-15, 0 aldrig-mätta — bevisat med
   simulering mot verkliga journalen (§3 FÖRE).

v157:s avsikt ("aldrig-mätta sidor väljs FÖRST" + sektionsprioritering för
/dataset-aspekternas 130 nya sidor) var en **kö-hoppning för NYA sidor** —
men implementationen gav sektionen **evigt monopol även efter full täckning**,
och listan skulle enligt sin egen kommentar "tas bort när dess
journaltäckning är komplett" — den togs aldrig bort (09-15 → 09-18, tre dygn).

Detta är felklassen "prioriterad konsument svälter ut kön" (rotorsaksmönstret
bekräftar o58/o65-lärdomen: felet satt inte i mätvärdena utan i
urvalsmekaniken — vaktens rapporter var GRÖNA och sanna för det de mätte;
det de aldrig mätte syntes ingenstans).

## §3 Bevis

**Sond:** verktyg/_s8u2-urvalssimulering.mjs — FÖRE (v157-algoritmen
ordagrant, inline-kopia) mot EFTER (granssnitt-urval.mjs) på VERKLIGA
sitemap (localhost, 1 943 unika) + VERKLIGA journalen (264 poster).
Rådata: data/vakten/urvalssimulering-2026-09-18-s8u2.txt (53 rader,
deterministisk — journalen orörd av sonden; --sidor-läge roterar ej journalen,
rad 716 i vakten).

- **FÖRE:** 21/21 platser till REDAN-MÄTTA dataset-sidor (mätstämplar
  2026-09-15), 0 aldrig-mätta. Nästa cron-körning hade mätt /dataset/halso/*
  + /dataset/industri/* — igen.
- **EFTER:** 21/21 platser till ALDRIG-MÄTTA sidor, rotnivåsidor först
  (grunda sökvägar = unika mallar/verktygsytor): /ansvar, /ar, /badges,
  /bibliotek, /blogg, /bolag, … **/kalkylator når FÖRSTA svepet**,
  /superanalys (sen i alfabetet bland rotnivåsidorna) inom ~2-3 svep —
  vid 4 cron-svep/dygn är båda mätta inom ~12 h organiskt.

**Svit:** verktyg/testa-granssnitt-urval.mjs — **PASS 14/14, exit 0**
(fixturen speglar rotfallet strukturellt: 18 dataset-sidor mätta 09-15,
22 aldrig-mätta, bas mätt). Kontrakt: R1 aldrig-mätta fyller rotationen ·
R2 noll redan-mätta dataset-sidor medan aldrig-mätta finns · R3 /superanalys
+ /kalkylator når rotationen (s9-u2:s köpost) · R4 bas först · R5 taket ·
R6 aldrigMatte-räknaren · P1 vågprioritering lever bland aldrig-mätta
(v157:s avsikt bevarad) · G1 grunda före djupa · F1-F2 full täckning ⇒
global äldst-först (monopolet kan inte återkomma) · B1-B2 FALLBACK-kontraktet
(/superanalys + /kalkylator tillagda, v105:s sex kvar) · N1-N2 ren funktion +
mekanismen utbyggbar.

**Syntax:** node --check ×3 (vakt + modul + svit) = OK.

## §4 Kuren

1. **Ny ren modul verktyg/granssnitt-urval.mjs** (granssnitt-konsol.mjs-
   precedensen: vakten är ett toppnivåskript som sveper hela sajten vid
   import — urvalslogiken extraherad så sviten kör DEN RIKTIGA koden
   offline). Ny sorteringsdoktrin "mät det kunden ser först":
   - bas (/, /studio, /admin) varje körning;
   - **aldrig-mätta FÖRE allt** — bland dem vågprioriterade sektioner
     (kö-hoppning för nya täckningsvågor, v157:s avsikt), därefter **grunda
     sökvägar före djupa** (rotnivåsidor = unika mallar/verktygsytor;
     djupa sökvägar = mallkloner — maximal unik-mall-täckning per svep);
   - därefter **GLOBAL äldst-mätt-först** — ingen sektion företräde.
   Rotkur på klassnivå: en sektion med fler sidor än rotationsplatser kan
   ALDRIG igen låsa rotationen — PRIORITERADE_SEKTIONER får stanna kvar
   ofarlig när en våg glömmer städa bort den.
2. **granssnittsvakt.mjs**: lokal urvalskod ersatt av import + tunn adapter
   (journal läses fortfarande av vakten; modulen ren). FALLBACK_SIDOR (vid
   sitemap-fel) utökad med /superanalys + /kalkylator enligt s9-u2:s
   förslag — 6→8 sidor, de ursprungliga sex orörda (svitsäkert B2).
3. Bakåtkompatibilitet: journalformatet oförändrat (sökväg → epok-ms);
   cron-skrivningen (rad ~716) orörd; --sidor/--snabb/tema/skärmväggar
   orörda; rapportformatet orört. Verktyg/.mjs berör inte tsc:s projekt-
   typning och Next-bygget läser inte verktyg/ — **commiten är live för
   cronen direkt, inget bygge krävs eller körs**.

## §5 KVD

- Svit 14/14 PASS exit 0 · node --check ×3 OK.
- src/ orörd → tsc-projektbinären opåverkad (pre-commit-grinden verifierar
  baslinjen mekaniskt vid commit).
- R2 orörd · data/blogg/ orörd · INGET bygge (prod-synken äger).
- Syskonens ytor orörda (u1: verktyg/kraschvakt.mjs + verktyg/prod-synk.mjs;
  u3: verktyg/feljakt-lage.mjs + verktyg/feljakt-stormar.mjs + dess svit).

## §6 EFTER-bokföring + öppna poster

1. **ORGANISKT LIVE-BEVIS (primär):** nästa cron-körning (var 6:e timme)
   väljer enligt den nya rotationen — förväntan: rapport med
   "sitemap+journal (1 943 url:ar, 1 738 aldrig mätta)" + ≥17 aldrig-mätta
   rotnivåsidor mätta, journalen växer 264 → ~285+. /kalkylator i första
   svepet, /superanalys inom ~2-3. Återrapporteras av vaktposten.
2. **Riktad FÖRE/EFTER-mätning --sidor=/superanalys,/kalkylator:** väntar
   RAM (fönstret hade 762–906 MB tillgängligt; chrome-vakten ~1 GB;
   fabriksRAM-tröskel 1 500 MB — syskon aktiva). Körs när minnet frigörs
   (2 sidor × 2 teman × 2 skärmar = 8 kombinationer); fynd där ägs av
   nästa våg enligt rotorsaksprotokollen.
3. **Täckningsprognos:** 1 738 aldrig-mätta / (24-3) platser × 4 svep/dygn
   ≈ 18 dygn till full journa täckning; därefter global round-robin med
   återbesök ~var 81:a dag per sida (1 943/24 platser) — bas-sidorna
   fortfarande varje svep.
4. **Notis åt vaktposten:** journalfilens 58 döda poster (sidor ur
   sitemapen) är ofarliga för urvalet men kan städas vid DR-våg om önskat.
