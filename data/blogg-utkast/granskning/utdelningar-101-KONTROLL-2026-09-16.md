# KONTROLLGRANSKNING m9 #5 — utdelningar 101 (v1) — 2026-09-16-standarden

**Objekt:** `data/blogg-utkast/m9-ko/utdelningar-101-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (e), seed `904e0fcc…`, kandidatMd5 `2b2cf3e5…` [genereringstillståndet], mall-md5 `4ba2f35b…` [dito])
**Granskad:** 2026-09-16 kl 14:2x CEST av fabrik auto-s1-u1 omgång 1789560918402 (agentfabrik, spår 1)
**Relation till tidigare granskning:** huvudgranskad 2026-09-14 (`granskning/utdelningar-101.md` — FLYTTKLAR EFTER RÄTTNING; fynd F1 rättat i utkastet 09-14, F2–F4 kosmetiska/informativa). Denna KONTROLL fyller 09-15/09-16-standardens gap (mekanisk juridikgrind, 911-kontroll, länkar mot LEVANDE sajten, maskinell diff-fil) och tillför seriens första **dubbelriktade determinismbevis**: både genereringstillståndets OCH post-rättningslägets md5-kvitton är maskinellt reproducerade (se § 3).
**Val- och kollisionsnotis:** uppdragstextens "m9-utkast #1" var redan komplett (09-16 01:10, tidigare omgång) — enligt spårets köregel valdes nästa INTE levererade. #2 och #4 kompletterades av syskon 07:53/08:09; worklog bjuder ut #3 forskningsläget "nästa omgång" (syskonet u3:s naturliga val) ⇒ valet föll på **#5 utdelningar-101**. Kollisionskontroll mot granskningsmapp + git + syskonloggar före skrivning: utdelningar-101 helt fri.
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd, inga priser/tier rörda.

## BEDÖMNING: FLYTTKLAR — 0 nya rättningar, 0 nya fynd som kräver ändring

**74 maskinella kontroller (sonden `.zcode/granskning-m9-utdelningar-verify.mjs`, spegling av m9-fabrik.mjs gren (e) rad 1040–1123 + montera-rad 1230–1271): 74 OK · 0 FEL.**

---

## 1. Källor — md5 mot kvitto, original och dagens träd

| Källa | Kvitto-md5 | Status 2026-09-16 |
|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | `f4cee658…` | **SKILJER i dagens träd** (`5ef5c556…`, **126 bolag** — har vuxit ytterligare 120→126 under dagen; spår 2:s dataset-djup). **Original återvunnet ur git (f3f56268, 100 bolag, samtliga rader hämtade 2026-09-03): md5 `f4cee658…` EXAKT MATCH mot kvittot** — utkastets samtliga tal verifieras mot sitt eget dokumenterade underlag. |
| `data/varumarke.json` | `9b906e42…` | **MATCH** — oförändrad i dagens träd. |

Utkastet redovisar urvalsberoendet öppet ("underlag hämtat 2026-09-03", "87 av 100 bolag"); åldrandet är hanterat i texten. Regenereringsfrågan tillhör fabriksägarens cadans (§ 6).

## 2. Siffror — oberoende omräkning mot ORIGINAL-underlaget ( Alla gröna )

- **n och median:** fcfYield mätt för 87 av 100 · median 3 % (pct-formatering speglad) — **egna omräknade, exakta**.
- **Fördelningen:** >5 %: 26 · 2–5 %: 28 · <2 %: 33 · negativa: 9 — plus **summakontrollen 26+28+33 = 87 = n mätta** och delmängds kontrollen **rent 0–2 % = 24** (33 − 9). v151:s F1-rättning ("under 2 % — varav 9 negativa") gör kategorisumman entydig — **rättningen verifierad korrekt med egen omräkning**.
- **Källbrist-ärligheten:** återköp mätta 0/100 (`aterkop.senasteArMdr` numerisk i 0 rader) · insiderköp mätta 100/100 (`insiderkopSenaste6man`) — textens kärnpåstående "per-bolags utdelningsdata levereras inte av källorna och påhittas aldrig" är SANT mot filerna.
- **Topp 5:** WBD 22,7 % (kommunikation) · INDU-C.ST 17,1 % (industri) · TELIA.ST 11,9 % (kommunikation) · NHY.OL 10,8 % (material) · ERIC-B.ST 9,7 % (teknik) — alla fem exakta på kortnamn, ticker, procent och branschnotering (urdrag + body).
- **Avgränsningen:** 6:e–8:e i källan (STERV.HE 9,4 % · SHEL 8,4 % · VZ 8,4 %) förekommer INTE i urdrag eller body — korrekt avgränsning till topp 5.
- **Datum:** samtliga 100 originalrader `hamtat` = 2026-09-03 ✓. **Första-i-serien-påståendet:** `data/blogg/utdelningar-101.json` existerar inte ✓.
- **Räkneexemplen** (10 kr vinst / 4 kr utdelning → 40 % andel; 4 kr / 100 kr kurs → 4 % direktavkastning) är märkta "valda tal (inte ur underlaget)" och aritmetiskt korrekta.

## 3. Determinism — DUBBELRIKTAT F1-bevis (seriens första; kedjan sluten på BÅDA sidor om rättningen)

Sonden speglar fabrikens gren (e) (`raknaUtdelningsunderlag` + `byggUtdelningar` + `montera` + `kandidatMd5`) rad för rad och bygger kandidaten OM ur committad fabrikkod + original-källorna ur git:

1. **Genereringstillståndet (pre-edit):** mallen byggs med fabrikkodens formulering "33 under 2 % och 9 negativa" (dagens committade utdelningsmall är OFÖRÄNDRAD — den bär fortfarande pre-edit-formen; se fynd-flagga 3) ⇒ **mallMd5 `4ba2f35bdcb2de23e2f0f4822407ac9c` OCH kandidatMd5 `2b2cf3e53a5f4d1a9817fb4ed7de8d01` reproduceras EXAKT** — kvittots båda värden bevisade.
2. **Filens nuvarande läge (post-edit):** md5 beräknad över filens faktiska mall/body med sondens statistik/urdrag/källor/seed ⇒ **mallMd5 `e1450a5e2d1b2eb158198b877d298723` OCH kandidatMd5 `7293885e372d5b87fed3bce04ff683a9`** — **exakt de värden huvudgranskaren dokumenterade 09-14 efter sin F1-rättning.** Filen är alltså **OECKKAD sedan 09-14-rättningen** — första m9-utkastet där detta bevisas med dokumenterade post-edit-hashar.
3. **F1-formuleringen** ("33 under 2 % — varav 9 negativa") förekommer exakt EN gång i filen; filens body med F1 inverterad är byte-identisk med den fullt rekonstruerade genererade bodyn (mall + kvitto + disclaimer, 5 265 tecken).
4. **Kvittot lämnades medvetet orört** vid 09-14-rättningen (därav den inbäddade mall-md5:n 4ba2f35b… i kvitto-texten) — verifierat som genereringstillståndets.
5. **Seed `904e0fcc917798642aa9bd0a1c44d04b`** återlett exakt (korstabell + vagvalidering-SENASTE.md + varumarke md5:ar + månadsnyckel) — samma globala seed som seriens syskon #2 och #4 bevisade samma dag.

Kedjan källor (git-återvunna, md5-exakta) → seed → mall → mallMd5 → body → kandidatMd5 → granskningsrättning → nuvarande body är sluten i **båda riktningarna**: inget ocommittat tillstånd behövs, och filens integritet sedan huvudgranskningen är maskinellt kvittad.

## 4. Juridik — lagen (2007:528), mekanisk grind

- **Juridikgrind-vakten körd 2026-09-16 (--json-dokumentregistret):** `flyttklar: true · grund: true · fynd: 0` på filen — positiv dom, inte bara frånvaro av fynd. Vaktens totalvy (11 VARNING-fynd på ytan) berör inte detta objekt.
- **kontrolleraText-spegel** (varumarke.json `forbjudnaFraser`, på hel fil): **FEL 0 · VARNINGAR 0** — överensstämmer med kvittots förkontroll.
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning…): **0 träffar** i hela filen.
- **"investeringsrådgivning" endast NEGERAT** (disclaimerns sista rad) ✓ · **"ingen värdering"-avränsningen** finns i Taket-stycket ✓ · **endast lagrummet 2007:528** nämns — inga blandade lagrum (kontrollerad mot 2022:260/2022:261/1985:716/2005:59/2022:482) ✓.
- Seriens juridiskt känsligaste konstruktion — FCF-taket som "största hållbara direktavkastning" med bolagsnamn — är låst på tre ställen: "Ett utrymme är inte ett löfte", "listan är en sortering av data, ingen värdering", "en fråga att ställa, inte ett svar". Bolagsnamnen är enbart deskriptiva (högst mätta värden i källan).

## 5. 911-referenser och internlänkar

- **911: 0 träffar** på samtliga sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") i HELA filen inklusive metadata.
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-16):** `/kurser/km-063-direktavkastning` **200** (titelrenderad "Direktavkastning") · `/kurser/km-064-utdelningstillvaxt` **200** ("Utdelningstillväxt") · `/kurser/km-005-eget-kapital-utdelningar` **200** ("Eget kapital") — samtliga tre kurs-slugar konfirmerade i `src/lib/ak1a/deep-courses-data.ts`. **3/3 gröna.**

## 6. Aktualiseringsnotis — källan växer vidare (information, inget fel)

Dagens bolagsunivers.json har under dagen vuxit **120 → 126 bolag** (md5 `5ef5c556…`; syskongranskning #4 mätte 120 vid 08:09). Samma statistik på dagens fil: fyMatta 112 (median 3,6 %) · fördelning 41/34/37/11 · topp-5 delvis ny (WBD 22,7 kvar etta; DTE.DE 20,8, ALV.DE 16,7, MELI 13,4 nya; INDU-C.ST 17,1 kvar) · aterkopMatta fortfarande 0. Utkastet förblir korrekt mot sitt eget kvitto-underlag; vid fabriksägarens regenerering flyttar sig talen och kvittot skrivs nytt.

## 7. Struktur och metadata

7 `##`-rubriker i hel body (kvittots kontroll-block: 7 ✓; mallen 6 ✓) · strukturFel 0 · kontrolleraText 0/0 · disclaimer sista rad ✓ · status "utkast" · version 1 · `fabrik.serie` "utdelningar" · `fabrik.manad` "2026-09" · `fabrik.version` "m9-fabrik-v2" ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd.** v151:s F1 rättad 09-14 och nu verifierad med dubbelriktat hash-bevis; F2 ((utkast)-suffixet — exportvägens tvätt), F4 (kvitto-hashar avser genereringstillståndet — designat) kvarstår dokumenterade, blockerar ej. | Ingen |

## Flaggor till ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md** saknar fortfarande hela m9-serien (#1, #2, #4, #5 nu kompletta 09-16; #3, #6 väntar) — samma flagga-familj som s1-u1/s1-u2/s1-u3 (09-16). → sammanställningsägaren.
2. **Regenererings-cadans:** källan bolagsunivers.json har vuxit 100→126 sedan kvitto-datum (120→126 bara under idag); m9-serierna (d)(e) bygger på den. → fabriksägaren.
3. **v151:s F3 lever kvar i fabrikkoden:** utdelningsmallen (`verktyg/m9-fabrik.mjs` rad 1079) fogar fortfarande "under 2 % och ${fyNegativa} negativa" — kassaflödes-grenen fick F1-formuleringen inbyggd men utdelnings-grenen fick den EJ. **Nästa regenerering av utdelningar-101 återintroducerar kategorioverlappet** (skenbar summa 96 ≠ 87) och kräver omgranskning. Föreslås "— varav ${fyNegativa} negativa" vid nästa fabriksrörelse. → fabriksägaren (huvudagentens kö, samma klass som v151 F3).

## Diff-rapport

**0 poster.** `utdelningar-101-diff.json` (denna våg) — maskinellt läsbart kvitto: bedömning FLYTTKLAR, tom postlista med motivering (v151:s F1 redan verkställd 09-14 och nu verifierad med dubbelriktat determinismbevis; innehållsändringar går via m9-fabrikens regenerering).

## Slutsats

**FLYTTKLAR — m9-utkast #5:s paket är komplett.** Källor verifierade mot git-återvunnet original (md5 exakt), 74/74 maskinella kontroller gröna (fördelning med summa- och delmängdskontroll, topp-5 med avgränsningskontroll, källbrist-påståendena 0/100 och 100/100, första-i-serien), determinismkedjan sluten i båda riktningarna (kvittots pre-edit-hashar reproducerade ur committad fabrik + original-källor; huvudgranskarens post-edit-hashar bekräftade = filen oekkad sedan 09-14), juridiken mekaniskt ren (2007:528: flyttklar/grund/0 fynd, endast negerat råd, inga blandade lagrum), 911 = 0 på sex mönster, 3/3 internlänkar levande och titelrenderade mot prod. Publicering väntar kunden (R2); exportvägen stryker "(utkast)" och kvitto-avsnittet.
