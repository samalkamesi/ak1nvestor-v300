# KONTROLLGRANSKNING m9 #3 — forskningslaget-grona-av-100 (v1) — 2026-09-16-standarden

**Objekt:** `data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (b), seed `904e0fcc…`, kandidatMd5 `60d18ca6…`, mall-md5 `f095edf7…`)
**Granskad:** 2026-09-16 av fabrik auto-s1-u2 omgång 4 (agentfabrik auto-s1-1789560918402, spår 1)
**Relation till tidigare granskning:** huvudgranskad 2026-09-14 (v151, `granskning/forskningslaget-grona-av-100.md` — FLYTTKLAR EFTER RÄTTNING; fynd F1 hög + F2 medel, båda rättade i utkast-JSON:en samma dag). Denna KONTROLL fyller 09-15/09-16-standardens gap (mekanisk juridikgrind, 911-kontroll, länkar mot LEVANDE sajten, maskinell diff-fil) och tillför determinismbevis i seriens renaste form — se § 3.
**Val- och kollisionsnotis:** uppdragstitelns "#2" är auto-platshållare — #1 (02224ea4), #2 (390fb61e) och #4 (6a528f00) var levererade vid start; #5 togs av syskon s1-u1 under fönstret (filer 14:25, worklog-entry "utdelningar-101"); KLAIM på #3 satt 14:19:21 lokal FÖRE arbetet — **syskonkollisionen:** s1-u3:s klaim på SAMMA objekt landade 14:19:25 (4,3 s efter min; deras kollisionskontroll hade hunnit köras i luckan före min Write) — först-till-kvarn enligt klaim-protokollet ger s1-u2 objektet; kollisionsnotis + pivot-förslag (#6 vagkartan, seriens sista olevererade) har skrivits i min anspråksfil och bokförs i worklog.
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd. Notera: en post med slug `forskningslaget-grona-av-100` FINNS publicerad (utgåva 1, 2026-09-03, samma korstabell) — utkastet är seriens uppföljande utgåva och vid export ersätter den befintliga slugen.

## BEDÖMNING: FLYTTKLAR — 0 nya rättningar, 0 nya fynd som kräver ändring

**47 maskinella kontroller (sonden `.zcode/granskning-m9-forskningslaget-verify.mjs`): 47 OK · 0 FEL.**

---

## 1. Källor — md5 mot kvitto och dagens träd

| Källa | Kvitto-md5 | Dagens träd 2026-09-16 | Utslag |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | **MATCH — oförändrad sedan urdrag** |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | **MATCH** |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | **MATCH** |

Seriens renaste källäge: till skillnad mot #4/#5 (där bolagsunivers.json återvunnits ur git efter tillväxt 100→126) är ALLA tre källor oförändrade i dagens träd — hela kedjan verifieras mot levande filer, ingen git-återvinning behövs.

## 2. Siffror — oberoende omräkning ur korstabell-grund.json (samtliga gröna)

- **Fördelningen:** grön=7 · gul=76 · röd=17 · osatt=0 räknade egna ur filens 100 rader, med summakontroll 7+76+17+0 = 100 = n. Överensstämmer med ingress, body, titel ("7 gröna av 100") och kvitto.
- **Regimen:** andelGrona 0,07 < 0,08-tröskeln ⇒ typ "magert" — fabrikskonstanterna (rikt ≥0,10/≤0,30; magert <0,08/>0,35) speglade och korrekta; tröskeltexten i bodyn överensstämmer tecken för tecken.
- **Lägestextcitatet** "Forskningsläget är magert — 7 av 100 bolag klarar de strikta kraven, selektion avgör." återgivet ordagrant med citationstecken och är exakt motorns formel vid grona=7, antal=100.
- **Topp-3 gröna (efter v151:s F1 nu "exempel ur det gröna utfallet"):** Industrivärden INDU-C.ST (industri) 58,1/67 · Newmont NEM (material) 55,1/71,1 · Investor INVE-B.ST (finans) 54/62,9 — sorteringen (akm1Totalt fallande) egen omräknad, tredjeplatsen entydig (54 > nästa gröna). Aritmetiken: 58,1/67 = 86,7 % · 55,1/71,1 = 77,5 % · 54/62,9 = 85,9 % — samtliga över gröntröskeln 70 %, samtligatal exakta i bodyns divisionsrader.
- **statusRegler-citaten:** bodyns tre punkter (grön/gul/röd) tecken för tecken identiska med `korstabell.statusRegler` i källfilen — "citerat ordagrant" håller.
- **Universum-påståendet:** 10 unika branscher × 10 bolag = 100 rader verifierat mot filen.
- **"Fördelningen oförändrad sedan den publicerade utgåvan":** SANT — den publicerade utgåvan (2026-09-03) bär `fabrik.statistik` {100, 7/76/17/0, 0,07/0,17, magert, samma lägestext} och bygger på samma korstabell-md5 `33fe62a0…`.
- **Kvittots 5 urdrag** (fördelning · andelar · tre toppbolag) reproducerade värde för värde. (Not: direkt-strängjämförelsen kräver nyckelordnings-okänslig match — dumpfilen bär datum-först, fabrikens md5-payload varde-först; att innehållet ändå är identiskt i payload-ordning bevisas av att mallMd5 med mina omräknade urdrag träffar exakt, se § 3.)

## 3. Determinism — SLUTEN KEDJA MOT DAGENS TRÄD (seriens renaste bevis)

Sonden speglar fabrikens gren (b) (`raknaForskningslage` + `byggForskningslaget` + `montera` + md5-kontrakten) rad för rad:

1. **Seed `904e0fcc917798642aa9bd0a1c44d04b`** reproduceras ur dagens tre käll-md5:er + månadsnyckeln "2026-09|2026-09" (underlagens egna datum) — samma globala seed som seriens syskon.
2. **Statistik-objektet** (key-ordningskänsligt) reproducerat och är **byte-identiskt med den publicerade utgåvans `fabrik.statistik`** — kö-utkastet och live-utgåvan knyts till samma beräkning.
3. **Mall-bodyn regenererad BYTE-IDENTISK ur DAGENS källor** (2 370 tecken) med fabrikens ORIGINALmall ("De tre högt rankade gröna bolagen") — ingen git-återvinning, inga antaganden om försvunna tillstånd: dagens oförändrade källor ⇒ exakt samma text.
4. **mallMd5 `f095edf7541c259ad560e7faa60d3d22`** reproduceras exakt (payload: slug+titel+ingress+bodyMall+statistik+urdrag+kallor+seed+version i fabrikens ordning) — och kvittots inbäddade mall-md5-sträng bär samma värde.
5. **kandidatMd5 `60d18ca6c0ae272c95555c6dd18f891d`** reproduceras över HELA genereringstillståndets body (mall + kvitto + disclaimer, återvunnen ur git 584ffcf8).
6. **Dagens body == original + EXAKT v151:s F1+F2:** sonden applicerar de två dokumenterade rättningarna (F1: rubrik + inramning + divisionsrader — talen orörda; F2: jämförbarhetsnoten om investmentbolagen insatt på exakt rätt position) på originalet och får dagens body tecken för tecken — inget annat ändrats; kvittot och kandidatMd5 lämnades medvetet orörda av v151 ("kvittot är maskinens utsaga om vad som genererades") och sonden assertar detta designade läge.

Kedjan är därmed hel i EN enda pass: dagens källor → mall → mallMd5 → kvitto → kandidatMd5 → granskningsrättningar → nuvarande body. Detta är det första m9-utkastet i serien där determinismen bevisas utan någon enda git-återvunnen indata.

## 4. Juridik — lagen (2007:528), mekanisk grind

- **Juridikgrind-vakten körd 2026-09-16 (`--json`):** filen = **flyttklar: true · grund: true · fynd: 0** (rådsförbud + grund + tvärfall). Vaktens totalvy (11 VARNING-fynd på 68 dokument) berör inte detta objekt.
- **kontrolleraText-spegel** (varumarke.json:s 26 förbjudna fraser, körd på mallen = det som överlever export): **FEL 0 · VARNINGAR 0** — överensstämmer med kvittots förkontroll.
- **Rådgivningsglossor** (rekommendera/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning/du bör köpa/köp denna…): **0 träffar.**
- **"köp"/"sälj":** exakt 1 träff — i v151-F1:s negering "inget köp- eller säljbud" ✓. **"investeringsrådgivning" endast negerad** (disclaimerns sista rad) ✓.
- **Endast lagrummet 2007:528** förekommer — ingen lagrumsblandning (2022:260/2022:261/1985:716/2005:59/2022:482 frånvarande).
- **Utbildningsgrunden buren genomgående:** metodbeskrivningen ("så räknar metoden", fasta trösklar, "inte en värdering"), urvals- och dateringsparagrafen, investmentbolags-noten — v151:s F1-rättning (HÖG) verifierad i verket: de tre namngivna bolagen är nu INRAMADE som illustrativa beräkningsexempel, ej topplista.

## 5. 911-referenser och internlänkar

- **911: 0 träffar** på samtliga sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") i HELA filen inklusive metadata.
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-16):** `/forskningsbiblioteket` **200** (titel renderad: "Forskningsbiblioteket — automatiska bolagsanalyser, AKM1") · `/kurser/v09-roe` **200** ("ROE (Return on Equity) — AKM1-kurs"; slug konfirmerad i `src/lib/larvag-karta.ts:39`) · `/blogg/komplett-guide-svensk-aktieanalys-2026` **200** (titel renderad; live-fil i `data/blogg/`). **3/3 gröna.**

## 6. Aktualiseringsnotis — källan STILLASTÅENDE (information, inget fel)

korstabell-grund.json är oförändrad sedan kvitto-datum 2026-09-03 (13 dagar vid granskningstillfället; färskhetsgränsen 45 dagar) — till skillnad från syskonserierna (d)(e) där bolagsunivers.json vuxit 100→126 under dagen finns här INGEN aktualitetsgap: utkastets tal gäller fortfarande exakt. Vid nästa korstabells-refresh (spår 2:s dataset-djup) flyttar sig fördelningen och fabriken skriver nytt kvitto — cadans-frågan tillhör fabriksägaren (samma kö som B13:notisen).

## 7. Struktur och metadata

6 `##`-rubriker i hel body (kvittots kontroll-block ✓) · 5 i mallen (kvittots struktur-rad ✓ — mallen är det som blir kvar när kvittot stryks före export) · strukturFel 0 · disclaimer sista rad ✓ · body 4 565 tecken ≥ 800 ✓ · status "utkast" · version 1 · `fabrik.serie` "forskningslaget" · `fabrik.manad` "2026-09" · titel bär "(utkast)"-markören (stryks vid export) · **ingressen namnfri** (ingen bolagsnamn — endast fördelning + regim + datering) ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd.** v151:s F1+F2 rättade 2026-09-14 och nu verifierade (F1:s inramning bär juridiken; F2:s jämförbarhetsnot på exakt rätt position); inga siffer-, käll-, struktur- eller länkavvikelser. | Ingen |

## Flaggor till ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md** saknar fortfarande hela m9-serien (#1+#2+#4+#5 kompletterade under 09-16; detta paket gör #3 komplett; #6 vagkartan väntar — se kollisionsnotisen) — samma flagga-familj som s1-u1/s1-u2/s1-u3 (09-16). → sammanställningsägaren.
2. **Klaim-kollisionsfönstret (4,3 s):** s1-u3:s anspråk på #3 hann skrivas innan min klaim syntes i deras kontroll — fabrikens klaim-protokoll har ett race-fönster mellan "kollisionskontroll körd" och "Write landat". PIVOT-FÖRSLAG till u3: #6 vagkartan-traffprocent. → syskonet + fabriksägaren (protokollets fönster är känt; Worklogs kollisionsbokföring fångar fallet).
3. **Regenererings-cadans:** korstabell-grund.json stillastående sedan 2026-09-03; serien (a)(b)(c) bygger på den. → fabriksägaren (samma kö som B13:s korstabell-refresh-notis).

## Diff-rapport

**0 poster.** `forskningslaget-grona-av-100-diff.json` (denna våg — ny fil; ingen tidigare -diff.json fanns för detta objekt) — maskinellt läsbart kvitto: bedömning FLYTTKLAR, tom postlista med motivering (v151:s F1+F2 redan verkställda och nu verifierade; determinismkedjan sluten mot dagens träd; innehållsändringar går via m9-fabrikens regenerering).

## Slutsats

**FLYTTKLAR — m9-utkast #3:s paket är komplett.** Källor verifierade mot dagens oförändrade träd (3/3 md5 exakta — seriens renaste källäge), 47/47 maskinella kontroller gröna (fördelning med summakontroll, regim med trösklar, lägestextcitat ordagrant, topp-3 med aritmetik, statusRegler-citat, 10×10-universum, "oförändrad"-påståendet korsbelagt mot den publicerade utgåvan), determinismkedjan sluten i en enda pass ända ner till rådata (seed + mallMd5 + kandidatMd5 samtliga reproducerade; mall-bodyn byte-identiskt regenererad ur DAGENS källor; dagens body == original + exakt de två dokumenterade rättningarna), juridiken mekaniskt ren (2007:528: juridikgrind-vakt flyttklar/grund/0 fynd; spegel 0/0; köp/sälj enbart negerat), 911 = 0 på sex mönster, 3/3 internlänkar levande och titelrenderade. Publicering väntar kunden (R2); exportvägen stryker "(utkast)" och kvitto-avsnittet.
