# KONTROLL 2026-09-19 — forsakringsaktier-sa-analyserar-du-forsakringsbolag.json (B16)

**Granskare:** agentfabrik auto-s1-1789804529817 s1-u3 **ANDRA INSTANS** (omstartsbokföring enligt s9-u2-D20/s10-u3-presedensen: första u3-instansen levererade detailhandelsaktier-KONTROLLEN och är bokförd klar i status — detta är en fristående granskning av nästa objekt, inte duplikat) · **Sond:** `verktyg/_s1u3-forsakring-verify.mjs` (73 OK / 0 FEL / 2 VARNING = S8 readingMinutes + X1 allianz-403) · **Objekt:** data/blogg-utkast/, byggd 2026-09-16 20:16 av s3-u2 omgång 6 (byggarens KVD grön — detta är den OBEROENDE granskningen) · Engelsk spegel: `…-en.json` (Ö16, s3-u1 2026-09-18, 51/51 talparitet enligt byggarens KVD)

## VAL och duplikatkontroll

Uppdragstitelns "m9-utkast #3" (forskningslaget-grona-av-100) är komplett levererat sedan
2026-09-16 14:29 (s1-u2, korskonfirmerat; hela m9-serien 6/6 sedan 14:35, commit 8448ef77)
— platshållar-texten i fabriksmallen. Nästa steg i FIFO-kön: detailhandel (B13) levererad av
första u3-instansen 2026-09-19 (worklog 14626), **flyg (B14) är anspråkat av syskonomgången**
auto-s1-1789804748544-u2 (anspråksfil på disk), ABB-kvartalspaketet levererat av dess u1 ⇒
**försäkring (B16, 2026-09-16 20:16) är äldsta återstående rotguide utan granskningsartefakt**
(granskning/forsakringsaktier* = 0 träffar i båda namnkonventionerna; syskonleveranserna
09-17→09-19 täckte råvaru→bil men inte 20:16-generationens försäkring/medie/livsmedel —
telekomlistans "två kvarvarande" från 09-16 skrevs före dessa byggdes). Klaim skriven FÖRE
arbetet: `data/vakten/auto-s1-1789804529817-u3-ansprak-2-instans.md`.

## Kontrollen (09-15/16-standarden)

1. **KÄLLTALSPARITET 28/28 gröna** mot `data/portfolj-system/bolagsunivers.json` (dagens
   träd, 195 bolag; Allianz/Sampo-raderna hämtade 2026-09-16): Sampo ROE 24,1 · P/B 3,38 ·
   P/E 14,7 · forward 16,2 (noteringens 16,24) · skuld/EK 0,35 · netto 1 998 M€ · +73 % ·
   utdelning 0,36 €/3,7 % (3,69) · kassa/skuld 18,16/2,55 · beta 0,24 · payout 55,9 ("i
   princip samma" som 55) · koncernsammansättning; Allianz ROE 19,6 · P/B 2,47 · P/E 14,6
   (14,58) · skuld/EK 0,51 · FCF-yield 16,7 (16,73) · kassa/skuld 136,0/33,7 · utdelning
   17,10 €/3,8 % · payout 55 (54,8) · 11,40→17,10 på tre år (+14,5 %/år) · EBT-gap 2,1 mdr
   (19 952−17 899); Berkshire P/E 12,6 (12,625) · resultatserien −22,8/96,2/89,0/67,0 EXAKT;
   Coca-Cola beta 0,34; normaliseringspåståendet (prognosTillväxt −9,5 %) och CR-målet < 85
   "år från år" bärs av noteringarna. Byggarens kontrakt "externa tal = källurl:erna" håller.
2. **EXTERNA KÄLLOR KORSBELAGDA 2026-09-19** (oberoende webbsökning utöver byggarens
   live-kontroll 09-16): Allianz FY2025 CR **92,2 (från 93,4)** — bekräftad av två
   oberoende sammanställningar av 4Q-releasen; **solvens 218 % vid årsskiftet** — bekräftad
   av allianz.com:s egna Q2-2026-release ("225 %, +7 pp mot helåret 2025 (218 %)") och
   intjäningscallen; Sampo FSR: koncern-CR **83,6 (84,3), −0,7 pp** · tekniskt resultat
   **1 485 M€ (+12 %)** · målet < 85 — allt bekräftat. sampo.com-PDF:n lever (HTTP 200);
   allianz.com-releasen svarar **403 mot maskinell hämtning (bot-skydd, ej död länk)** —
   innehållet verifierat via oberoende källor i stället.
3. **ARITMETIK 14/14 gröna** (egna omräkningar): räkneexemplena 74+22=96 och 82+22=104 ·
   float-exemplet 100×4 %=4 ⇒ nollresultat · 100−83,6=16,4 och 100−92,2=7,8 ("mer än
   dubbelt" = 2,10×) · 136,0/33,7=4,04 ("fyra gånger") · 18,16/2,55=7,12 ("mer än sju") ·
   ROE÷P/B 7,14/7,94 ("7,1/7,9") · utdelnings-CAGR (17,10/11,40)^(1/3)=+14,5 % ·
   1 998/1 154=+73,1 % · 19 952−17 899=2 053 ("omkring 2,1 mdr") · forward 16,24>trailing
   14,70.
4. **FYND B1 — "koncernens bästa år" binder rekordet till nettoresultatet, som serien
   motsäger (VÄSENTLIGT).** Universumets egen serie: **2 107 (2022) → 1 323 → 1 154 →
   1 998 (2025) M€** — 2022 är HÖGRE än 2025. Noteringen förklarar varför ("2022 års
   2 107 M€ bär Nordea-exittens realisationsvinster") men kallar samma rad "FY2025 var
   rekordår" — noteringens interna spänning har smittat texten. En läsare som kontrollerar
   mot källan finner ett högre tal fyra år tidigare. Rättningen (diff B1) bevarar hela
   argumentet (basåret är en topp ⇒ konsensen normaliserar ⇒ forward>trailing) men binder
   rekordet korrekt. Klass: detailhandel-B1:s "fönsterblandnings"-familj — siffrorna rätta,
   ramen binder fel. OBS: påståendet "73 procent upp" är sant (1 154→1 998).
5. **FYND B2 — finansmedianen har drivit: textens 2,47/15,3 är dagens 2,57/15,5
   (AKTUALISERING).** Byggarens KVD (`_s3u2o6-kvd-forsakring.mjs` rad 103–104) assertade
   2,47/15,3 mot DÅVARANDE universum och passerade — talet var **vintage-sant** vid
   bygget 09-16. Universumet har sedan vuxit (finansgrenen n=20 i dagens träd) och medianen
   drivit till P/B 2,57 / ROE 15,5 %. Textens "båda koncernerna avkastar alltså klart över
   grenens mittläge" håller även med dagens tal (24,1/19,6 > 15,5) — endast de två
   median­siffrorna behöver uppdateras vid verkställning (eller frysas med en
   dateringsnot). Första dokumenterade fallet där en härledd universums-aggregatdrift
   träffar ett publiceringsklart utkast.
6. **FYND B3 — readingMinutes 2 → 7** (1 379 ord textrensat = 690 ord/min mot de 55
   publicerades max 240, median 171; round(1 379/200)). Sjunde fallet i klassen
   (substansrabatt 09-17, halvledar-B1, hälsa-B4, konsumentaktier-B4, försvar-B2,
   detailhandel-B2) — byggd 09-16, före domen 09-17. Spegeln (-en, 1 369 ord, rm 2 = 685
   ord/min) speglas till 7.
7. **JURIDIK 2007:528 REN:** varumärkesgrinden (varumarke.json 26 mönster × 3 ytor) =
   0 FEL; rådglossor med ordgräns = 0 träffar; inga lagrum i texten = ingen blandrisk;
   disclaimern "_Detta är pedagogisk finansanalys, inte investeringsråd._" exakt sista
   raden; utbildningsgrunden uttryckt redan i ingressen ("utbildning i metod, aldrig råd om
   enskilda aktier"); "Följ därför reservförändringen" och "kontrollera" är metodråd
   (utbildning), inte värdepappersråd.
8. **911 = 0 träffar** på 6 mönster ("911", "11 september", "september 2001", "9/11",
   "terror", "Terrordåd") i båda språkversionerna.
9. **LÄNKAR 17/17 HTTP 200** mot levande sajten (loopback): 11 kurser (inkl.
   kursankaret se-06-finanssektorn + v05-pb, km-003/005/006/009/054, mt-01, pf-03, v12,
   ud-06) + 6 bloggposter; 0 länkar till utkast. -en-spegelns länkar 17/17
   multiset-identiska med originalet.
10. **STRUKTUR:** 8 H2 · title 52/60 · description 154/155 · 0 mjuka bindestreck · sökord
    i title/ingress/första H2 · 5 tags · ord 1 400 raw/1 379 textrensat.

## FYND (diff-fil: 3 byt + 1 förslag + 1 R2-notis)

- **B1 (BYT, väsentligt):** rekordsbindningen — se punkt 4. Söksträngen unik (1 träff).
  **-en-spegeln bär systerformuleringen** ("2025 was the group's best year (net result
  1,998 million euro, up 73 percent)") och speglas vid verkställning.
- **B2 (BYT):** "median 2,47 och 15,3" → "median 2,57 och 15,5" (dagens universum,
  finans n=20; vintage-bevisad drift — se punkt 5). Söksträngen unik (1 träff). -en:
  "against the finance branch median 2.47 and 15.3" → "2.57 and 15.5".
- **B3 (BYT):** readingMinutes 2 → **7**. -en: 2 → 7.
- **C1 (FÖRSLAG):** "If P&C"-etiketten på koncernnivåtal: FSR:s 83,6/−0,7 pp/1 485 M€/+12 %
  är **Sampo-koncernens** tal ("Sampo Group … combined ratio … 83.6 (84.3)"); If P&C-segmentets
  eget CR är 83,4 enligt Ifs SFCR 2025. Guiden definierar själv koncernen som "If P&C,
  Topdanmark och Hastings" — förslaget är att låta "Sampokoncernen" bära siffrorna i
  kombinerad-ratio-avsnittet, sammanfattningen ("If 83,6 mot Allianz 92,2") och källa-raden
  ("If combined ratio 83,6" → "koncernens combined ratio 83,6"). Siffrorna är sanna på
  koncernnivå och berättelsen oförändrad (0,2 pp:s segmentdelta ändrar ingen slutsats) ⇒
  förslag, ej fel. FRIVILLIGT — ägaren beslutar.
- **D1 (R2-NOTIS):** publishedAt 2026-09-16 = skapandedatum; exportvägen stämplar
  publiceringsdagen (publicering = kundens beslut).

## FLAGGOR

- **F1 (verktygsägaren):** readingMinutes-felet passerade byggarens KVD (600-ordskontraktet
  i byggarmallen) — sjunde fallet; ord/200-konventionen finns fortfarande endast i
  granskarlaget, ej kodifierad i byggarnas KVD-mall. (Samma flagga som detailhandel-F1.)
- **F2 (sammanställningsägaren):** rotkön: försäkring granskad 2026-09-19 (flyttklar efter
  B1+B2+B3). Kvar av 09-16-kvällsgenerationen: medie + livsmedel (20:16/20:17; flyg är
  anspråkat av syskonomgången auto-s1-1789804748544-u2).
- **F3 (universumägaren):** härledda aggregat (grenmedianer) i guide text åldras när
  universumet växer — B16 är första dokumenterade fallet. Överväg i byggprompts:
  "medianer beräknas om vid verkställningstillfället" eller fryst median-vintage per
  guide-generation.
- **F4 (dataägaren, notering):** SAMPO.HE-noteringens interna spänning — "FY2025 var
  rekordår (netto 1 998 M€)" i samma not som "2022 års 2 107 M€ bär Nordea-exittens
  realisationsvinster" — är B1:s källa; överväg "rekordår i försäkringsrörelsen" i noteringen.

## DOM

**FLYTTKLAR EFTER RÄTTNING** — B1 + B2 + B3 verkställs (med spegling i -en), C1 beslutas
av ägaren, D1 vid export. Källtal 28/28, aritmetik 14/14, externa källor korsbelagda,
juridik, 911 och länkar fullständigt gröna. Publicering = kundens beslut (R2).

*Endast data/ + verktyg/ + worklog = INGET bygge; src/ orörd (tsc-baslinjen orörd —
pre-commit-grinden verifierar); utkast-JSON:en orörd av granskaren; data/blogg/ orörd.*
