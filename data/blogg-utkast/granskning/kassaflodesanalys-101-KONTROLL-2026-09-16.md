# KONTROLLGRANSKNING m9 #4 — kassaflödesanalys 101 (v1) — 2026-09-16-standarden

**Objekt:** `data/blogg-utkast/m9-ko/kassaflodesanalys-101-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (d), seed `904e0fcc…`, kandidatMd5 `3331bfa4…`, mall-md5 `ad29b106…`)
**Granskad:** 2026-09-16 av fabrik auto-s1-u2 omgång 3 (agentfabrik auto-s1-1789537520972, spår 1)
**Relation till tidigare granskning:** huvudgranskad 2026-09-14 (v151, `granskning/kassaflodesanalys-101.md` — FLYTTKLAR EFTER RÄTTNING; fynd F1 rättat i utkastet, F2–F4 kosmetiska/informativa). Denna KONTROLL fyller 09-15/09-16-standardens gap (mekanisk juridikgrind, 911-kontroll, länkar mot LEVANDE sajten, maskinell diff-fil) och tillför seriens hittills starkaste determinismbevis: **full rekonstruktion med F1-backtrack** (se § 3).
**Val- och kollisionsnotis:** utkast #2 branschmedianer togs under mitt fönster av syskon s1-u1 (filer 07:53) — PIVOT till #4 enligt spårets köordning (#3 forskningsläget lämnas fritt; syskon s1-u3 valde energibolagens-utdelningspolitik ur mx1-serien). Kollisionskontroll mot granskningsmapp + syskonloggar före skrivning: kassaflödesanalys helt fri.
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd.

## BEDÖMNING: FLYTTKLAR — 0 nya rättningar, 0 nya fynd som kräver ändring

**87 maskinella kontroller (sonden `.zcode/granskning-m9-kassaflodesanalys-verify.mjs`): 87 OK · 0 FEL.**

---

## 1. Källor — md5 mot kvitto, original och dagens träd

| Källa | Kvitto-md5 | Status 2026-09-16 |
|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | `f4cee658…` | **SKILJER i dagens träd** (`1e02481c…`, 120 bolag) — väntat: spår 2:s dataset-djup har vuxit universumet 100→118+ sedan 2026-09-03. **Original återvunnet ur git (f3f56268, 100 bolag, senaste hämtat 2026-09-03): md5 `f4cee658…` EXAKT MATCH mot kvittot** — utkastets samtliga tal verifieras mot sitt eget dokumenterade underlag. |
| `data/varumarke.json` | `9b906e42…` | **MATCH** — oförändrad i dagens träd. |

Källan har alltså rört sig sedan genereringen — utkastet redovisar själv urvalsberoendet öppet ("underlag hämtat 2026-09-03", "universum är 100 bolag"), så åldrandet är hanterat i texten; frågan om regenerering är fabriksägarens cadans (se aktualiseringsnotis § 6).

## 2. Siffror — oberoende omräkning mot ORIGINAL-underlaget (87 kontroller gröna)

- **Medianer och n:** FCF-marginal 10,8 % på n=92 mätta av 100 · FCF-avkastning 3 % på n=87 · konverteringsgrad 0,78 på n=84 (krav: båda fälten mätta OCH nettoMarginal > 0 — filtret speglat exakt) · konverteringsgrad över 1,0: 29 bolag. **Alla egna omräknade ur original-filen, 10/10 exakta.**
- **Fördelningen:** >5 %: 26 · 2–5 %: 28 · <2 %: 33 · negativa: 9 — plus summakontrollen 26+28+33 = 87 = n mätta (grön). v151:s F1-rättning ("varav 9 negativa") gör delmängdsförhållandet entydigt — **rättningen verifierad korrekt**.
- **Topp 5 + botten 5:** alla 10 rader exakta på namn (kortNamn-mekaniken speglad — inkl. quirket att "(publ.)" med punkt INTE stryks: "Volvo Car AB (publ.)" korrekt kvar), ticker, bransch och procent: Kinnevik 65,6 · Öresund 63,9 · Industrivärden 62,4 · Prologis 56 · Netflix 52,5 / Aker BP −3 · Volvo Car −4,5 · Polestar −30,8 · RWE −69,6 · Castellum −72,9.
- **Konverteringstoppen:** Telia Company 4,26 · Fabege 4,09 · Vår Energi 3,57 — och härledningen aritmetiskt bevisad på Telia (fcfMarginal ÷ nettoMarginal = FCF ÷ nettoresultat, båda nämnarna omsättning): 4,26 återges exakt.
- **Kvittots 14 urdrag:** samtliga verifierade värde för värde (medianer, fördelning, 10 bolagsrader med noteringar).
- **Första-i-serien-påståendet:** `data/blogg/kassaflodesanalys-101.json` existerar inte ✓ — "Seriens första maskinutkast" är sant.
- v151:s F2 kvarstår dokumenterat (kvitto-noteringen "AKRBP lägst rankade (energi)" är global botten-5-etikett, inte branschpåstående — försvinner med kvittot vid export) och F4 (tredjeplatsen i konvertering oavgjord VAR.OL/SINCH.ST 3,57 — texten utesluter ingen, korrekt men ofullständig).

## 3. Determinism — full rekonstruktion med F1-BACKTRACK (seriens starkaste kedjebvis)

Sonden speglar fabrikens gren (d) (`raknaKassaflode` + `byggKassaflodesanalys` + `montera` + md5-kontrakten) rad för rad och bygger kandidaten OM:

1. **Mall-bodyn (hela innehållet före kvittot, med v151:s F1-rättning) är BYTE-IDENTISK** med utkastets — varje mening, tal och bolagsrad.
2. **Kvittots båda md5:er återger GENERERINGSTILLSTÅNDET exakt:** med F1-meningen återställd (v151:s diff exakt inverterad, träffar exakt en gång) reproduceras **både mallMd5 `ad29b10651c263f553daf1a30b4c63a9` OCH kandidatMd5 `3331bfa49edcc2dc7a9a0fab64f22fe6`** ur committad fabrikkod (bf9e06af, m9-fabrik-v2) + original-källorna ur git.
3. **Seed `904e0fcc…`** reproduceras (globala formeln: käll-md5:ar + månadsnyckel "2026-09|2026-09") — samma seed som seriens syskon, verifierat.
4. Skillnaden mellan nuvarande body och kvittots tillstånd är **exakt en dokumenterad granskningsrättning (v151 F1)** — kvittot lämnades medvetet orört ("kvittot är maskinens utsaga om vad som genererades, granskaren äger texten efteråt") och sonden assertar detta designade läge: rekonstruerad body = utkastet **utom** den inbäddade mall-md5-strängen.

Detta är det första m9-utkastet där HELA kedjan är maskinellt verifierad ända igenom: källor (git-återvunna, md5-exakta) → seed → mall → mallMd5 → body → kandidatMd5 → granskningsrättning → nuvarande body. Inget ocommittat tillstånd behövs för förklaringen (en tidigare hypotes om mall-drift motbevisades och övergavs).

## 4. Juridik — lagen (2007:528), mekanisk grind

- **Juridikgrind-vakten körd 2026-09-16:** filen = **flyttklar: true · grund: true · fynd: 0** (rådsförbud + grund + tvärfall). Vaktens totalvy (11 VARNING-fynd på ytan) berör inte detta objekt.
- **kontrolleraText-spegel** (varumarke.json, på mallen som fabrikens förkontroll): **FEL 0 · VARNINGAR 0** — överensstämmer med kvittot.
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning…): **0 träffar** i hela filen.
- **"investeringsrådgivning" endast NEGERAT** (disclaimerns sista rad) ✓ · **"inte en värdering"-avränsningen** finns i ingressen ✓ · endast lagrummet 2007:528 nämns — ingen lagrumsblandning.
- Negativa FCF-värden beskrivs deskriptivt ("bolaget förbrukade kassa under mätperioden") med länk till kapitalförbränningskursen — utbildningsramen hel.

## 5. 911-referenser och internlänkar

- **911: 0 träffar** på samtliga sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") i HELA filen inklusive metadata.
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-16):** `/kurser/km-003-kassaflodesanalysen` **200** (titel renderad: "Kassaflödesanalysen — AKM1-kurs") · `/forskningsbiblioteket` **200** · `/blogg/v19-kapitalforbranning-analys` **200** (titel renderad; live-fil bekräftad i data/blogg/). Kurs-slug konfirmerad i `src/lib/larvag-karta.ts`. **3/3 gröna.**

## 6. Aktualiseringsnotis — källan har växt (information, inget fel)

Dagens bolagsunivers.json (120 bolag) ger vid en framtida regenerering: fcf 110 mätta (median 11,2 %) · fcfYield 106 (median 3,4 %) · konvertering 102 (median 0,83, 39 över 1,0) · fördelning 37/32/37/11. Utkastet förblir korrekt mot sitt eget kvitto-underlag; när fabriksägaren väljer att regenerera flyttar sig talen och kvittot skrivs nytt (då ersätts även F1-formuleringen av mallens). Färskhetsvakten vid generering var grön (kvitto-datum 2026-09-03, gräns 45 dagar).

## 7. Struktur och metadata

7 `##`-rubriker i hel body (kvittots kontroll-block: 7 ✓; mallen 6 ✓) · strukturFel 0 · disclaimer sista rad ✓ · status "utkast" · version 1 · `fabrik.serie` "kassaflodesanalys" · `fabrik.manad` "2026-09" ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd.** v151:s F1 rättad och nu verifierad; F2–F4 kosmetiska/informativa, blockerar ej. | Ingen |

## Flaggor till ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md** saknar fortfarande hela m9-serien (#1–#2 kompletterade 09-16, detta paket gör #4 komplett; #3, #5, #6 väntar) — samma flagga-familj som s1-u1/s1-u3 (09-16). → sammanställningsägaren.
2. **Regenererings-cadans:** källan bolagsunivers.json har vuxit 100→120 sedan kvitto-datum; m9-serien (d)(e) bygger på den. → fabriksägaren (samma kö som B13:s korstabell-refresh-notis).

## Diff-rapport

**0 poster.** `kassaflodesanalys-101-diff.json` (denna våg) — maskinellt läsbart kvitto: bedömning FLYTTKLAR, tom postlista med motivering (v151:s F1 redan verkställd och verifierad; determinismkedjan sluten via F1-backtrack; innehållsändringar går via m9-fabrikens regenerering).

## Slutsats

**FLYTTKLAR — m9-utkast #4:s paket är komplett.** Källor verifierade mot git-återvunnet original (md5 exakt), 87/87 maskinella kontroller gröna (medianer, fördelning med summakontroll, 10 bolagsrader, konverterings-härledning aritmetiskt bevisad, första-i-serien-påståendet), determinismkedjan sluten ända ner till rådata med kvittots båda md5:er reproducerade över genereringstillståndet, juridiken mekaniskt ren (2007:528: 0 fynd, grund buren), 911 = 0 på sex mönster, 3/3 internlänkar levande och titelrenderade. Publicering väntar kunden (R2); exportvägen stryker "(utkast)" och kvitto-avsnittet.
