# KONTROLL-GRANSKNING 2026-09-18 — Spelaktier: så analyserar du spelbolag (svenska rotguiden, B-serien)

**Objekt:** `data/blogg-utkast/spelaktier-sa-analyserar-du-spelbolag.json` (byggd 2026-09-16 08:55, 1 281 ord, 8 H2-rubriker)
**Granskad av:** fabrik auto-s1-u2 (agentfabrik auto-s1-1789758924831), 2026-09-18, anspråk 21:20 lokal FÖRE arbetet
**Bedömning: FLYTTKLAR EFTER RÄTTNING.** Ett väsentligt sifferfel (Spelinspektionens Q2 2026, tre
förekomster) + readingMinutes enligt seriepraxis + en källstatus-precisering. I övrigt HELT GRÖN:
samtliga 25 Evolution-tal exakta mot universumets vintage, aritmetiken 5/5 egenomräknad, budpliktsfakta
webbverifierad mot primärkällor, juridiken ren, 911 = 0, 12/12 interna länkar levande.

**Köregel-bokföring:** uppdragstitelns "m9-utkast #2" (branschmedianer-akm2 v2) var KOMPLETT levererat
redan 2026-09-16 (huvudgranskning 09-14 + KONTROLL 07:53 av auto-s1-u1 med diff; serien 6/6 sedan
14:35 samma dag) ⇒ pivot enligt spårets regel. FIFO bland ogranskade svenska rotguider: spelaktier
09-16 08:55 = ÄLDST i kön (bil 09-16 08:56 lämnades åt u1; försvar klagat av u3 21:18 — klaimfilerna
i `data/vakten/` är beviset). Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG
filen till `data/blogg/` och skriver ALDRIG om utkast-JSON:en.

---

## 1. Källor

| Källa | Kontroll | Dom |
|---|---|---|
| `data/portfolj-system/bolagsunivers.json` — EVO.ST-rad, vintage 2026-09-15 (StockAnalysis/S&P) | samtliga universumstal i utkastet mätta fält för fält (§ 2) | ✓ |
| Universumets EVO-not | "serier i EUR (rapportvaluta; Nasdaq Stockholm-notering i SEK)", "bruttomarginal 100 % är källans konvention (netto av spelavgifter)", "prognosTillväxt härledd ur trailing/forward-P/E (15,15/13,60 ⇒ +11,4 % implicit EPS-tillväxt)", "augusti 2026: Candle Lake ~695 SEK/aktie noterat som marknadskontext" | ✓ utkastet återger samtliga konventioner ÄRLIGT — bruttomarginal-100 %-konventionen förklaras till och med i texten |
| Spelinspektionen, spelmarknadsstatistik (spelinspektionen.se/om-oss/statistik/, hämtad 2026-09-18) | primärkällans tabell: **Q2 2026 = 7 380 mnkr, Q2 2025 = 7 024, Q1 2026 = 6 680** | ✗ Q2-påståendet AVVIKER (se A1–A3); Q1 ✓ |
| europeangaming.eu 2026-05-20 (+ Gambling911, next.io) | Q1 2026: 6,68 mdr, +0,8 % — bekräftar utkastets Q1-tal | ✓ |
| hurbra.se 2026-08-31 + iGaming Future | Q2 2026: 7,38 mdr, +5,1 % | ✗ mot utkastet (bekräftar primärkällan) |
| Evolution AB board statement (evolution.com, 2026-08-24) | "recommends the shareholders … not accept the public cash offer of SEK 695" | ✓ utkastets styrelse-redogörelse korrekt |
| Reuters/Cision 2026-08-13 + Pulse2 | bud 695 kr kontant 13 aug; värde ~131,7 mdr; budplikt vid >30 % 24 juli | ✓ |

**Felursprung A1 (sannolikt):** Spelinspektionens eget nyhetsrum (2025-02-20) rapporterar **helåret
2024: 27,8 miljarder, +2,8 procent** — utkastets "+2,8 procent" är HELÅRETS ökning, flyttad till
Q2 2026. Talet "6,9 miljarder" har ingen hittad publicerad källa (ingen träff i sökningar; primär-
källan ger 7,38). Byggarens Q1-tal (6,7/+0,8) är däremot korrekta — felet är isolerat till Q2.

## 2. Siffror — Evolution mot universumet + egen aritmetik (sond `verktyg/_s1u2-spelaktier-verify.mjs`)

**42 maskinella kontroller + 2 manuell konfirmation, 2 äkta fynd (= A1:s båda halvor).**
Sondens två FEL-rader "serien är EUR" och "forward P/E 13,60" är SONDFEL (sökningen riktades mot
`kallor[0].paranoid` i stället för universums not-fält) — båda uppgifterna bekräftas MANUELLT gröna
mot not-texten ovan; läxan "verifiera verktyget innan verktyget får döma" (Industrivärden-K1)
tillämpad och dokumenterad.

| Påstående i utkastet | Universum 2026-09-15 / egen beräkning | Dom |
|---|---|---|
| pris 890,60 kr | 890.6 | ✓ |
| bruttomarginal 100 % (källkonvention, förklarad i text) | bruttoMarginal 1 + not | ✓ |
| rörelsemarginal 57,8 % | ebitMarginal 0.578 | ✓ |
| nettomarginal 51,8 % | nettoMarginal 0.5177 → 51,8 | ✓ |
| ROIC 31,2 % | roic 0.3119 → 31,2 | ✓ |
| skuld/EK 0,02 | 0.02 | ✓ |
| serie 1 457 → 1 799 → 2 063 → 2 067 M€, FY 2022–2025, euro | serier.omsattning + ar + "serier i EUR" | ✓ |
| TTM −2,2 % | −0.0221 → −2,2 | ✓ |
| prognostillväxt +11,4 % | 0.114 | ✓ (men se B2: källstatus) |
| P/E 15,15 · forward 13,60 | pe 15.15 + not "15,15/13,60" | ✓ |
| PEG = 15,15 ÷ 11,4 ≈ 1,33 | egen 1,3289 | ✓ |
| "av varje 100 euro … 58 euro rörelseresultat" | round(57,8) = 58 | ✓ |
| bud "cirka 132 miljarder kronor" | egen 695 × 191 M aktier (ur mcap 169,86/890,60) = 132,6 mdr; webb 131,7 | ✓ |
| "890,6 ÷ 695 ≈ 1,28, 28 procent över budkursen" | egen 1,2814 | ✓ |
| Q1 2026: 6,7 mdr (+0,8 %) | primär 6 680 mnkr; europeangaming 6,68/+0,8 | ✓ |
| **Q2 2026: 6,9 mdr (+2,8 %)** | **primär 7 380 mnkr = 7,38 mdr, +5,1 % (7 024)** | **✗ A1–A3, tre ställen** |
| budplikt: 24 juli 2026, 30,02 %, bud 13 aug 695 kr | Reuters/Cision/Evolution: 24 juli >30 %, 13 aug 695 kr kontant | ✓ (30,02 % i budhandlingarna; "cirka 132 mdr" mot webbens 131,7 = korrekt avrundning) |
| budet "5,7 procent under stängskursen dagen före" | webb "about 6 % below" — 5,7 % är den exaktare siffran ur budhandling (695/736,9) | ✓ rimlig; notis N2 |
| spelskatt 18 % av nettoomsättningen · omreglering 1 jan 2019 · budpliktströskel 30 % | etablerad svensk fakta (skattelagstiftning respektive LAG 2006:451) | ✓ |

## 3. Juridik — lagen (2007:528): REN

- Rådverb-sond (köp/sälj/rekommendera/bör du/undvik/bra affär): 2 träffar, båda kontext-verifierade:
  "teknik och tjänster som **säljs** till spelbolagen" (deskriptiv affärsmodell) och "Evolutions
  styrelse … **rekommenderade** aktieägarna att avstå" (bolagets EGET yttrande, webbverifierat
  2026-08-24, omedelbart följt av "bolagets eget ställningstagande" — redogörelse, inte AK1A:s
  röst). 0 rådgivande konstruktioner från guiden själv; guiden avstår uttryckligen från utfallsgissning.
- Utbildningsram i ingress: "Som alltid här: utbildning i metod, aldrig råd om enskilda aktier" ✓.
- Disclaimer = bodyns sista rad: "_Detta är pedagogisk finansanalys, inte investeringsråd._" —
  identisk med syskonen halvledar/saas/tillväxt (seriekonventionen för B-guiderna; m9-seriens
  2007:528-form är en annan serie) ✓.
- Lagrumssond (2007:528, 2022:260, 2022:261, 1985:716, 2005:59): 0 träffar i hela filen — ingen
  lagrumsblandning, heller inget felaktigt lagrum ✓.

## 4. 911-referenser: GRÖN (0 träffar)

Mekanisk sökning i HELA filen (body + metadata som sträng) efter sex mönster — "911", "11 september",
"september 2001", "9/11", "terror", "terrordåd" → **0 träffar**.

## 5. Länkar — 12/12 HTTP 200 mot levande sajten (localhost:3000, 2026-09-18 kväll)

`/kurser/se-12-spel` · `/kurser/rk-09-koncentrationsrisk` · `/kurser/rk-06-regulatorisk-risk` ·
`/kurser/v18-regulatoriska` · `/kurser/rk-07-valutarisk` · `/kurser/km-006-kvartalsrapporten` ·
`/blogg/hur-raknar-man-roe` · `/blogg/v09-roe-analys` · `/blogg/peg-multipeln-svagheter-2026` ·
`/blogg/v12-intaktsstabilitet-analys` · `/blogg/sa-raknar-du-ev-ebitda` ·
`/blogg/komplett-guide-svensk-aktieanalys-2026` — alla 200. 0 länkar mot opublicerade utkast.

## 6. Struktur

8 H2-rubriker (krav ≥ 2) ✓ · disposition affärsmodell → licens → marginaler → tillväxt → budplikt →
rapportläsning → sammanfattning → källor ✓ · title 38 tkn (≤ 60) ✓ · description 145 tkn (120–175) ✓ ·
disclaimer sist ✓ · **readingMinutes 2 — FYND B1**: 1 281 ord på 2 minuter = 640 ord/min. Färsk
seriepraxis satt av domarna 09-17/09-18 (substansrabatt, konsumentaktier 1 401 ord → rm 7,
skuldsättning 871 → rm 4, tillväxt 1 200 → rm 6): **~200 ord/min** ⇒ round(1 281/200) = **6**.
Femte rm-felet i serien, fjärde med underskattning — systemflagga till byggfabriken bekräftad.

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| A1 | VÄSENTLIGT | Ingressen: "spelomsättning på 6,9 miljarder kronor under andra kvartalet 2026 — en ökning med 2,8 procent … enligt Spelinspektionen". Primärkällan (statistiksidan 2026-09-18): Q2 2026 = 7 380 mnkr mot Q2 2025 = 7 024 ⇒ **7,4 mdr, +5,1 %**. Felkälla sannolikt: +2,8 % är HELÅRET 2024:s ökning (27,8 mdr). Citerad källa kontradikerad = allvarligaste felfamiljen. | Byt (diff A1) |
| A2 | VÄSENTLIGT (samma rotorsak) | Tillväxtsektionen: "Q1 2026 landade på 6,7 … och Q2 på 6,9 (+2,8 procent)" | Byt (diff A2) |
| A3 | VÄSENTLIGT (samma rotorsak) | Sammanfattningen: "Q2 2026: 6,9 miljarder kronor, +2,8 procent" | Byt (diff A3) |
| B1 | RÄTTNING | readingMinutes 2 ⇒ 6 enligt ~ord/200-seriepraxis (1 281 ord; femte fallet i serien) | Byt (diff B1) |
| B2 | RÄTTNING | "konsensusprognosen för nästa år ligger på +11,4 procent" — universumet Härleder 11,4 % som implicit EPS-tillväxt ur P/E 15,15/13,60, ingen extern konsensus. Källstatus överdriven. | Byt (diff B2) |

## Notiser (ingen åtgärd)

1. **N2:** budrabatten "5,7 procent under stängskursen" kunde webbverifieras bara som "about 6 %"
   (Reuters-eKO); 5,7 % är den exakta siffran ur budhandlingen (695/736,9 kr) och lämnad som
   trovärdig — dubbelkolla mot budhandlingarna vid publicering (NIKE-IR-precedensen).
2. publishedAt 2026-09-16 = skapandedatum — seriekonvention (NIKE D3, Holmen C5), kundens export
   beslutar publiceringsdatum.
3. Superlativ-sond: "sektorns mest beundrade siffror", "guidens kanske tydligaste pedagogiska
   exempel", "den enskilt viktigaste riskposten" — samtliga författarröst/pedagogisk prioritering,
   INTE mätbara universums-superlativer (felfamiljen från hälsobolag/konsumentbolag): GRÖN.
4. Utkastets engelska syskon `spelaktier-…-en.json` (09-16 08:55/04:47) väntar separat granskning —
   A1–A3 bör synkas dit av dess granskare (siffrorna är serieidentiska).

## Diff-rapport

**5 poster (A1–A3, B1–B2), samtliga "byt".** Maskinellt kvitto:
`granskning/spelaktier-sa-analyserar-du-spelbolag-diff.json` — alla 5 gammalt-strängar
verifierade UNIKA (exakt 1 träff i filen), samtliga nytt-strängar frånvarande i originalet.

## Slutsats

**EFTER RÄTTNING → FLYTTKLAR.** Utan A1–A3 kontradikerar guiden sin egen citerade primärkälla
(Spelinspektionen) i ingressen — det är ett publiceringsblockerande fel av samma klass som
seriens tidigare sifferfynd. Med de fem bytena applicerade (7,4 mdr/+5,1 % på tre ställen, rm 6,
källstatus-precisering) är paketet komplett: 25/25 universumstal exakta, aritmetik 5/5, budplikt
och Q1 webbverifierade, juridik ren, 911 = 0, länkar 12/12. Verkställandet görs av guidens ägare
eller exportvägen — inte av granskaren. Publicering förblir kundens beslut (R2).
