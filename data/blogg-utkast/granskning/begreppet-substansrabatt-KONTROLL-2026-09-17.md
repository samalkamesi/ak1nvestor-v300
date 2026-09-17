# KONTROLLGRANSKNING — begreppet-substansrabatt (m9-tillskott #2 av 2026-09) — 2026-09-16/17-standarden

**Objekt:** `data/blogg-utkast/begreppet-substansrabatt.json` (slug `begreppet-substansrabatt`, publishedAt 2026-09-15, pillar Grunderna, 5 läsminter, 6 taggar)
**Granskad:** 2026-09-17 kl 15:0x CEST (13:0x UTC) av fabrik auto-s1-u2 omgång 1789649728193 (agentfabrik, spår 1 — granskare)
**Relation till tidigare granskning:** skapad av huvudagentens våg 171 (commit `4ce26f70`, 2026-09-15 23:59) med EGNA förkontroller ("0 juridikfel, 25 nyckeltal omräknade, 13 länkar verifierade" — commitmeddelandet). Denna KONTROLL är objektets **första oberoende granskning** och fyller 09-15/09-16-standardens paket: mekanisk juridikgrind, 911-kontroll, länkar mot LEVANDE sajten, maskinell diff-fil.
**Val- och kollisionsnotis:** uppdragstextens "m9-utkast #2" i gamla m9-ko-serien (branschmedianer-akm2) är komplett sedan 09-16 (s1-u1 våg 1789537520972; hela m9-ko 6/6 sedan 14:35). Köregeln gav valet: våg 171:s tre tillskott saknar oberoende KONTROLL-paket — **#2 = substansrabatt** enligt våg 171:s egen listordning (utdelningskalender → substansrabatt → rörelsekapital; syskon u1/u1:s naturliga val är #1/#3 med samma malltext). Anspråksfil `data/vakten/auto-s1-1789649728193-u2-ansprak.md` satt 12:59 UTC FÖRE arbetet; kollisionskontroll mot granskningsmapp (0 träffar), worklog (0 leveranser på objektet), syskonloggar (inga ännu) och git log (endast skapande-commiten).
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, inga priser/tier rörda, utkast-JSON:n orörd av granskaren.

## BEDÖMNING: FLYTTKLAR EFTER RÄTTNING — 1 icke-juridisk rättning (B1), 0 juridikfynd, 0 sifferfel mot källan

**43 enskilda kontroller: 15 käll-/sifferkontroller · 8 juridikkontroller · 6 911-mönster · 8 länkkontroller · 6 strukturkontroller — 1 fynd (B1), allt annat grönt.**

---

## 1. Källor — universumet vid våg 171 (git-återkallat) OCH dagens träd

Utkastet anger "AK1A:s bolagsuniversum (insamling 2026-09-03, källor Yahoo Finance och MarketStack)". Universumet växer kontinuerligt (spår 2:s dataset-djup), så granskningen mäter mot BÅDA lägena:

| Läge | md5 | Bolag | De fyra investmentbolagens rader |
|---|---|---|---|
| Vid våg 171 (git `4ce26f70`, 2026-09-15 23:59) | `51fb5de9…` | 115 | **IDENTISKA tal** (pb/pe/nettomarginal, `hamtat` 2026-09-03) |
| Dagens träd (2026-09-17) | — | 153 | **IDENTISKA tal** — tillväxten 115→153 (38 nya rader) har EJ rört de fyra raderna |

Alla fyra rader bär `kallor` = [Yahoo Finance, MarketStack] med `hamtat` 2026-09-03 — källangivelsen i utkastet är exakt. **Talen gäller fortfarande i dagens träd** — ingen aktualiseringsvarning behövs (tvärtom: förstärkande).

## 2. Siffror — oberoende omräkning (15 kontroller, alla gröna)

**De fyra bolagen (tabellen + body):**

| Bolag | Ticker i utkast | Källrad | Källvärde | Utkast | Dom |
|---|---|---|---|---|---|
| Industrivärden | INDU C | `INDU-C.ST` | pb 1,029 | 1,03 | ✓ exakt avrundat |
| Investor | INVE B | `INVE-B.ST` | pb 1,159 | 1,16 | ✓ |
| Öresund | ÖRES | `ORES.ST` | pb 1,167 | 1,17 | ✓ |
| Latour | LATO B | `LATO-B.ST` | pb 3,128 | 3,13 | ✓ |

- **P/E-fällan:** Industrivärdens `vardering.pe` = 3,671 → utkastets "3,7" ✓ · `lonksamhet.nettoMarginal` = 0,9931 → "99,3 procent" ✓.
- **Spannet:** "P/B från 1,03 till 3,13" = min/max av de fyra ✓. Tolkningarna ("i praktiken till substansen", "modest premie", "mer än trippelt bokfört värde") är rimliga läsningar av 1,03/1,16–1,17/3,13.
- **"Fyra svenska investmentbolag":** EXHAUSTIVT verifierat — bred namn-/tickersökning i v171-filen på kända svenska investmentbolag (Ratos, Bure, Svolder, Creades, Traction, Havsfrun, Kapralka, Lundbergs, m.fl.) ger ENDAST dessa fyra. Se dock avgränsningsnotis A1 nedan.
- **Räkneexemplen** ((100 − 10) ÷ 0,9 = 100 kr; 85/100 = 0,85 → 15 % rabatt; 112/100 = 1,12 → 12 % premie): aritmetiskt korrekta och korrekt märkta "valda tal (inte ur underlaget)" ✓.
- **Tickerformat:** utkastet skriver `INDU-C.ST` → "INDU C" etc. — samma konvention som seriens övriga guider ✓.

## 3. Integritet/determinism — handskrivet våg 171-utkast (ingen fabrikkedja)

Objektet är huvudagentens handskrivna utkast (inte m9-fabrikens generering) — det finns ingen fabrikkod att spegla. Integitetsbeviset är i stället: filen är **innehålls-oförändrad sedan skapande-commiten** (git status ren; mtime 09-17 14:41 = prod-synkens checkout, ej innehållsändring) och **varje tal har återförts till sin exakta källrad** i § 2. Korsbevis mot publik data: källans kurs 534,20 kr (2026-09-03) mot Industrivärdens publika substansvärde 532 kr/aktie (31 aug 2026) ≈ kvot 1,004 — bekräftar oberoende att "handlas i praktiken till substansen".

## 4. Juridik — lagen (2007:528), mekanisk grind (8 kontroller, alla gröna)

- **Juridikgrind-vakten körd 2026-09-17 13:00 UTC (`--json`):** objektet registrerat med **`grund: true · fynd: 0`** — inga RÅDSFÖRBUD, inga TVÄRFALL. (Vaktens `flyttklar: false` är VÄNTLÄGE: flaggan speglar att ingen granskningspost ännu dömt slugen — denna KONTROLL ändrar det dokumentärt; se flagga 1.)
- **Rådgivningsglossor** (rekommenderar/rekommendation/aktietips/kursmål/målkurs/målpris/riskfri/säker vinst/garanterad avkastning/köp denna/sälj denna): **0 träffar** i hela filen.
- **"investeringsråd":** 2 träffar, BÅDA negerade — ingressens "Det är utbildning, inte investeringsråd" + disclaimerns "_Detta är pedagogisk finansanalys, inte investeringsråd._" (sista raden ✓).
- **Lagrum:** 0 st nämns — lagrumsblandning (AGENTS.md) ej möjlig; konsumenträtts-/GDPR-/kak-triggers 0.
- **Utbildningsramarna håller** i de juridiskt känsliga passagerna: rabattorsakerna är "mekanismer, inte lagar", "att rabatten 'måste' slutas är en hypotes, inte något marknaden garanterar", P/E-fällan presenteras som "mäter portföljens svängningar, inte förvaltningens kvalitet". Bolagsnamnen är enbart deskriptiva sorteringsunderlag ("en sortering av data"-familjen).

## 5. 911-referenser och internlänkar (6 + 8 kontroller, alla gröna)

- **911: 0 träffar** på samtliga sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "Terrordåd") i HELA filen inklusive metadata.
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-17):** `/blogg/pb-tal-nar-jamfor-man-bokvarde-ratt` **200** · `/kurser/km-011-relativ-vardering` **200** · `/kurser/km-067-investmentbolag` **200** · `/kurser/km-002-forvaltningsberattelsen` **200** — **4/4 gröna**. Kurs-sluggarna konfirmerade i `src/lib/ak1a/deep-courses-data.ts` (3/3); bloggmålet är en PUBLICERAD fil i `data/blogg/` (seriestandarden "0 länkar mot outgivna utkast" håller).

## 6. Struktur och metadata (6 kontroller, alla gröna)

7 `##`-rubriker · tabell 3 kolumner × 4 bolagsrader välformad (6 `|`-rader) · title 64 tkn (gränsfall mot mobila klipp-tak ~60 — se C-notis nedan) · description 181 tkn (inom seriepraxis) · räkneexempel märkta · källnot + disclaimer sista raden ✓.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| B1 | Bör rättas (icke-juridisk, icke-blockerande) | "Några bolag — som Industrivärden — redovisar substansvärdet **kvartalsvis**" — Industrivärden redovisar substansvärdet per aktie **månadsvis** (månadsslutspressmeddelanden: 504 kr 31 maj → 521 kr 30 juni → 532 kr 31 aug 2026). Underdriften går i försiktig riktning och argumentet ("tätare uppdateringar än de flesta branscher") förstärks av sanningen — men som faktapåstående är "kvartalsvis" felaktigt. | Diff-post B1: byt till "månadsvis" (strängen verifierad unik i filen) |
| A1 | Notis (ingen ändring) | Avgränsningen "fyra svenska investmentbolag" är namnbaserad (bolagsform), inte branschfältsbaserad: Industrivärden bär bransch `industri` i universumet (de tre övriga `finans`), och EQT (`finans`, pb 4,21) exkluderas — korrekt, då EQT är ett förvaltnings-/tjänstebolag, inte ett portföljägande investmentbolag. Utkastet binder inte påståendet till branschfältet ⇒ sant som skrivet. | Ingen (dokumenterad här) |
| A2 | Notis (förstärkning) | Publik NAV 532 kr/aktie (31 aug 2026) mot källkurs 534,20 ⇒ kvot ≈ 1,004 — oberoende korsbevis på huvudläsningen. Kan vävas in som C1-förslag. | Valfri (C1) |

## Flaggor till ägare (ej mina filer)

1. **Juridikgrindens flyttklar-vy:** vakten härleder granskningsposters slug ur FILNAMNET (`begreppet-substansrabatt-KONTROLL-2026-09-17` ≠ utkastets slug `begreppet-substansrabatt`), så utkastet förblir `flyttklar: false` i vaktens dokumentvy tills en granskningspost med exakt slug-filnamn finns (syskonens KONTROLL:er har samma egenskap; deras utkast fick true via sina äldre .md-huvudgranskningar). Medvetet läge — ingen åtgärd krävs, men registret visar 3 väntande (de tre tillskotten) som alla får sina KONTROLL:er idag om syskonen infriar. → vaktagaren/huvudagenten.
2. **GRANSKNINGSKO-SAMMANSTALLNING.md** saknar våg 171:s tre tillskott (samma flagga-familj som s1-u1/u2/u3 noterade 09-16). → sammanställningsägaren.
3. **Titellängd 64 tkn** — klipps möjligen i mobila sökträffar (tak ~60; ericsson-/holmen-precedenserna). Seriepraxis spretar (59–245) ⇒ endast notis, inget krav.

## Diff-rapport

`begreppet-substansrabatt-diff.json` (denna våg): bedömning FLYTTKLAR EFTER RÄTTNING, **1 byt-post (B1)** + **1 förslagspost (C1)** — maskinellt läsbart, stränger verifierade unika; originalet ändras av paketets ägare eller nästa våg, aldrig av granskaren.

## 8. Tillägg — svar på s1-u3:s systemfynd-leverans (worklog `5aae6e26`, nådde mig efter huvudgranskningen)

Syskonet s1-u3 mätte i sin granskning av #3 (rörelsekapital) att "samtliga tre våg 171-tillskott delar fältavvikelserna (title 64/76/64 tkn, desc 175/181/162 tkn, readingMinutes 5 mot 1 enligt kontraktet round(len/600))" och levererade mätningen till denna pågående granskning. Sedan svaret hunnit landa har varje mått prövats mot den PUBLICERADE blogg-familjen (`data/blogg/`, 55 poster) — med ett annat utfall än syskonets:

| Fält | Objektet | Publicerad praxis (55 poster) | Dom |
|---|---|---|---|
| readingMinutes | 5 (935 ord) | ≈ ord/200 — v08 927 ord→5 · v15 904→5 · v12 1 061→5 · analyserna ~800→6 · pb-tal 1 234→8; **0 av 55** följer ord/600 | **KONSISTENT — inget fynd på detta objekt** |
| title | 64 tkn | 13 av 55 > 60 tkn; max 84 (ps-tal, balansräkning, mr-market) | **Inom praxis** — nedgraderar § 6:s "gränsfall"-notis till ren info |
| description | 181 tkn | 17 av 55 > 181; max 240 | **Inom praxis** |

**Grundskillnaden:** `round(ord/600)` är SEO-GUIDER-familjens konvikt (`data/forskning/SEO-GUIDER-2026-09.md` — den seriens egna guider bär 1–2 min vid 800–1 400 ord), medan våg 171:s tillskott är BlogPost i **blogg-familjen**, vars samtliga 55 publicerade poster ligger på mänsklig lästakt (~ord/200). readingMinutes 5 vid 935 ord är alltså exakt familjepraxis (grannposter 904–1 061 ord → 4–5).

**Flagga till s1-u3:s paket (deras fil — ändras ej här):** deras B3-rättning "readingMinutes 5→1 (round(762/600))" bygger på SEO-GUIDER-kontraktet applicerat på en bloggpost — rekommenderas omprövad av paketägaren mot släktskapet, om inte ett globalt varumärkeskontrakt dikterar ord/600 även för bloggen (inget sådant dokument har återfunnits i denna granskning; bloggens 55 publicerade poster vittnar tvärtom). Samma reservatio gäller deras title/desc-rättningar i den utsträckning de motiverats enbart av takvärden från andra serien.

## Slutsats

**FLYTTKLAR EFTER RÄTTNING (B1).** Paketet komplett enligt 09-15/09-16-standarden: källorna verifierade i BÅDA lägena (våg 171:s universum git-återkallat, 115 bolag + dagens 153 — de fyra raderna identiska), 15 siffer-/sanningskontroller alla exakta (fyra P/B, P/E 3,7, nettomarginal 99,3 %, spannet, exhaustiv "fyra"-verifikation, tre räkneexempel), juridiken mekaniskt ren (grund true, 0 fynd, rådgivningsglossor 0, investeringsråd endast negerat, 0 lagrum ⇒ 0 blandningsrisk), 911 = 0 på sex mönster, 4/4 länkar levande mot prod (1 publicerad blogg + 3 kurser i registret). Enda rättningen är frekvensfakta i Industrivärden-meningen (kvartalsvis → månadsvis, publikt belagt) — juridik och källdata opåverkade. Publicering väntar kunden (R2); exportvägen stryker eventuella utkastmarkörer.
