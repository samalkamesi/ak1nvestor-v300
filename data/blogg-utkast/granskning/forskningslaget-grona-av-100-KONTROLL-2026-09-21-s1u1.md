# KONTROLL m9-5 — forskningslaget-grona-av-100 (v1) — FJÄRDE PASSET: PAKETKLASSEN — 2026-09-21

**Objekt:** `data/blogg-utkast/m9-ko/forskningslaget-grona-av-100-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (b), seed `904e0fcc…`, kandidatMd5 `60d18ca6…`, mall-md5 `f095edf7…`)
**Granskad:** 2026-09-21 av fabrik auto-s1-u1 omgång 1/3 (agentfabrik auto-s1-1789980325227, spår 1)
**Relation till tidigare granskningar:** huvudgranskad 2026-09-14 (v151 — F1 hög + F2 medel, rättade i utkast-JSON:en samma dag) · maskinell KONTROLL 2026-09-16 (47/47, determinismkedjan sluten, 0 nya fynd) · oberoende konfirmation rond 102 2026-09-19 (13 kontroller). **Detta pass fyller paketgapet** — m9-1/2/3/4 fick sina FLYTTKLART-PAKET 09-20/09-21; detta är det femte.
**Val- och kollisionsnotis:** uppdragstitelns "m9-utkast #1" = auto-platshållare (sjätte dokumenterade pivoten i släktet; m9 #1 bär paket sedan 09-20 — duplikat = förlorat arbete). Senaste könotis (worklog 16637): "Kö: m9-4–m9-6-paketen"; m9-4 levererat 03:03 ⇒ FIFO-val = **m9-5**. Anspråk disk-först `data/vakten/auto-s1-1789980325227-s1-u1-ansprak.md`; syskon u2/u3 rekommenderades m9-6 vagkartan + därefter -en-speglar. q3-kvartalsserien maskinkontrollerad 0 okända.
**Off-gräns:** publicering = kundens beslut (R2) — inget flyttat till `data/blogg/`, databasen orörd, paketets `publishedAt: null`. Notera: en post med slug `forskningslaget-grona-av-100` FINNS publicerad (utgåva 1, 2026-09-03, samma korstabell) — paketet ersätter slugen vid kundens export.

## BEDÖMNING: FLYTTKLART PAKET — 0 nya rättningar, 0 fynd

**66 maskinella kontroller (sonden `verktyg/_s1u1-m9forskning-paket-kontroll.mjs`, read-only utom paketfilen): 66 OK · 0 FEL · exit 0 på första körningen (0 sondbuggar att bokföra).**

---

## 1. Källor — md5 mot DAGENS träd (2026-09-21)

| Källa | Kvitto-md5 | Dagens träd 09-21 | Utslag |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | **MATCH** |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | **MATCH** |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | **MATCH** |

**AKTUALITET — seriens renaste fall står sig:** samtliga tre källor fortfarande oförändrade 18 dagar efter kvitto-datum (färskhetsgräns 45). D1-driftklassen som drabbade m9-3/m9-4 (bolagsunivers 231→237 gav nya okända kandidater) berör INTE denna serie — gren (b) läser korstabellen, inte bolagsunivers. Ingen ny granskningsomkörning krävs före eventuell publicering.

## 2. Siffror — oberoende omräkning ur korstabell-grund.json

- **Fördelningen:** grön=7 · gul=76 · röd=17 · osatt=0 egna ur filens 100 rader, summakontroll 7+76+17+0 = 100 = n. Överensstämmer med titel, ingress, body och kvitto.
- **Regimen:** andelGrona 0,07 < 0,08-tröskeln ⇒ magert; tröskeltexten i bodyn (rikt ≥10 %/≤30 %; magert <8 %>35 %) speglar fabrikskonstanterna exakt.
- **Lägestextcitatet** "Forskningsläget är magert — 7 av 100 bolag klarar de strikta kraven, selektion avgör." ordagrant = motorns formel vid grona=7, antal=100.
- **Topp-3 gröna:** Industrivärden INDU-C.ST (industri) 58,1/67 · Newmont NEM (material) 55,1/71,1 · Investor INVE-B.ST (finans) 54/62,9 — egen sortering (akm1Totalt fallande, ticker tie-break), tredjeplatsen entydig (54 > nästa gröna), aritmetiken 86,7 % · 77,5 % · 85,9 % samtliga > 70 %-tröskeln och exakta i bodyns divisionsrader.
- **statusRegler-citaten** (grön/gul/röd) tecken för tecken mot `korstabell.statusRegler`.
- **Universum:** 10 unika branscher × 10 bolag = 100 rader; dateringen 2026-09-03 = korstabellens egna `skapad`.
- **"Fördelningen oförändrad sedan den publicerade utgåvan":** SANT — den publicerade utgåvan (2026-09-03) bär identisk `fabrik.statistik` (100, 7/76/17/0, 0,07/0,17, magert, samma lägestext) och bygger på samma korstabell-md5.

## 3. Determinism — sluten kedja reproducerad (fabriksspegel)

Sonden speglar m9-fabriken gren (b) (`raknaForskningslage` + mall + md5-kontrakt) med domdatum **parsat ur rapporten på fabriken vis** (regex `**Domdatum:**` → 2026-09-04):

1. **Seed `904e0fcc…`** reproducerad ur dagens tre käll-md5:er + månadsnyckel `2026-09|2026-09`.
2. **statistik-objektet** (key-ordningskänsligt) byte-identiskt med den publicerade utgåvans `fabrik.statistik`.
3. **kallor-array + 5 urdrag** reproducerade fält för fält.
4. **Mall-bodyn (2 370 tkn) regenererad BYTE-IDENTISK ur dagens källor** — ingen git-återvinning av indata.
5. **mallMd5 `f095edf7…`** och **kandidatMd5 `60d18ca6…`** återvunna ur git 584ffcf8 och reproducerade exakt; kvittots inbäddade mall-md5-sträng matchar.
6. **Dagens body == original + EXAKT v151:s F1+F2** (F1: pedagogisk inramning av topp-3 med divisionsrader och negerat köp-/säljbud; F2: investmentbolags-jämförbarhetsnoten på exakt rätt position) — inget annat ändrat.

## 4. Juridik — lagen (2007:528), mekanisk grind

- **kontrolleraText-spegel** (varumarke.json:s 26 förbjudna fraser, `giu`) på mallen **OCH på hela paketytan** (body + handskriven description): **FEL 0 · VARNINGAR 0**.
- **Rådgivningsglossor:** 0 träffar. **"köp"/"sälj":** exakt 1 träff — negeringen "inget köp- eller säljbud". **"investeringsrådgivning":** endast negerad i disclaimerns sista rad.
- **Lagrum:** endast 2007:528 — ingen blandning (2022:260/2022:261/1985:716/2005:59/2022:482 frånvarande).
- **Utbildningsgrunden buren:** "så räknar metoden", fasta trösklar, "inte en värdering", urvals- och dateringsparagraf, investmentbolags-not, ingress namnfri.

## 5. 911-referenser

**0 träffar** på sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i HELA utkastfilen inklusive metadata — och 0 på paketytan. (Femte dagen i följd för dimensionen.)

## 6. Internlänkar — LIVE (2026-09-21)

`/forskningsbiblioteket` **200** · `/kurser/v09-roe` **200** · `/blogg/komplett-guide-svensk-aktieanalys-2026` **200** — 3/3 mot localhost:3000 (loopback, FRITT deploylås).

## 7. Struktur och metadata

6 `##` i hel body (kvittots kontroll-block ✓) · 5 i mallen ✓ · strukturFel 0 · disclaimer sista rad ✓ · body 4 565 tkn ≥ 800 ✓ · status "utkast" · version 1 · serie/manad/fabriksversion ✓ · kvitto-notis "MÄNSKLIG GRANSKNING" ✓.

## 8. PAKETET — `forskningslaget-grona-av-100-FLYTTKLART-PAKET-2026-09-21.json`

Syskonklassen (m9-1: 3 532 tkn · m9-3: 3 695 · m9-4-paketet) följd exakt:

- **Body 2 954 tkn** = utkastets body med kvitto-avsnittet stryket, disclaimer ordagrant sist; titel "Forskningsläget september 2026 — 7 gröna av 100" utan "(utkast)".
- **readingMinutes 2** = round(439 ord / 200) — syskonkonventionen (406→2, 518→3, 548→3, ~580→3).
- **Description handskriven** (239 tkn, syskonintervall 190–270): fördelning + regim + "en deskriptiv översikt, inte en värdering" + datering.
- **publishedAt null** — publiceringen är kundens klick (R2).
- **Tags** = seriens egna (identiska med publicerade utgåvans).
- **Tre grindar** i sonden vägrar skriva paketet vid rött; JSON giltig vid återläsning; md5 `413ea56073cc67f730a0a9e9266e2859`.
- kontrolleraText + 911 = 0/0 också på paketytan.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd.** v151:s F1+F2 rättade 09-14 och verifierade (tredje gången); källor, siffror, aritmetik, citat, struktur, länkar, juridik — allt grönt. | Ingen |

## Flaggor till ägare (ej mina filer)

1. **GRANSKNINGSKO-SAMMANSTALLNING.md** bär inte paketstatusen (m9-1..5 levererade paket 09-20/09-21; endast m9-6 vagkartan återstår) — samma flagg-familj som 09-16-ronden. → sammanställningsägaren.
2. **Regenererings-cadans:** korstabell-grund.json stillastående sedan 2026-09-03 — vid nästa refresh (spår 2) rör sig fördelningen och fabriken skriver nytt kvitto; ny granskning krävs då (evergreen-regeln). → fabriksägaren.
3. **Paket-titeln bär "september 2026"** medan publicering kan ske senare — seriens månadsnamn är underlagets (2026-09), konsekvent med syskonen; ingen åtgärd, notis vid kundexport.

## Slutsats

**FLYTTKLART PAKET — m9-5 komplett.** 66/66 kontroller gröna (källor 3/3 md5 exakta mot dagens träd — fortfarande seriens renaste källäge; fördelning + regim + topp-3 med full aritmetik; statusRegler- och lägestextcitat ordagrant; determinismkedjan sluten ända ner till rådata med F1+F2-fotspåret verifierat; juridik 2007:528 mekaniskt ren på både mall och paketyta; 911 = 0; 3/3 länkar live). Paketet levererat i syskonklassens exakta form (rm 2, publishedAt null, disclaimer sist). Publicering väntar kunden (R2); exportvägen ersätter den befintliga slugen (utgåva 1, 2026-09-03, samma statistik).
