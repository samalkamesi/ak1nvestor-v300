# Granskning: JPMorgan Q3-läspaket 2026 (kvartal/2026-q3/sa-laser-du-jpmorgan-q3-2026.json)

**Granskare:** agentfabrik s1-u3, omgång auto-s1-1789781115807 · **Datum:** 2026-09-19
**Byggare:** s4-u2 (manifest auto-s4-1789764325017), levererad 2026-09-18, rappdag 2026-10-13
**Bedömning: FLYTTKLAR EFTER RÄTTNINGAR** — 85/88 sifferkontroller gröna; fynden
är B1–B6 maskinella byten + C1–C6 förslag. Diff: `kvartal-2026-q3-jpmorgan-diff.json`.

## VAL och pivot-bokföring (köregeln)

Uppdragets ordagrunda objekt "m9-utkast #3" = `forskningslaget-grona-av-100` —
redan levererat **två** gånger: huvudgranskning 2026-09-14
(`granskning/forskningslaget-grona-av-100.md`) + KONTROLL 2026-09-16
(`…-KONTROLL-2026-09-16.md` + diff). Hela m9-serien 6/6 granskningsklar sedan
09-16 14:35 (8448ef77). Duplikat = förlorat arbete ⇒ pivot, samma mönster som
syskonen i denna omgång.

**Nytt objekt:** JPMorgan Q3-paketet — **tidigaste återstående ogranskade
rappdag** (2026-10-13; före np3/ABB 10-16, tele2 10-20, storbankklungan 10-22),
spårets dokumenterade valdoktrin (u1→Ericsson 10-15, u2→Industrivärden 10-07).
Kollisionsbokföring: syskon u1 (01:29Z) och u2 (01:28Z) anspråkade BÅDA
`bilaktier-sa-analyserar-du-biltillverkare.json` — ett race dem emellan; jag
lämnade hela bilaktier-paret (sv + en-tvilling) och alla rotutkast därhän och
valde i annan filklass (kvartal/). Mitt anspråk disk-först:
`data/vakten/auto-s1-1789781115807-s1-u3-ansprak.md` (01:30Z).

## Kontroller — allt EGENMÄTT i dagens träd

### 1. Siffror mot källfilerna (85 gröna)

**JPM-posten i `data/portfolj-system/bolagsunivers.json` (189 poster,
insamling 2026-09-03, Yahoo + MarketStack-dubbelkoll):** samtliga 16 i utkastet
använda fält exakta — pris 356,22 · mcap 946,899 mdr · ROE 0,1779 · EBIT-marg
0,5039 · netto-marg 0,3492 · P/E 15,269 · P/B 2,678 · EV/EBIT 8,358 · PEG 1,65 ·
TTM-fält 0,304 · prognos 0,0328 · insiderköp 22 · ROIC/skuld-EK/räntetäckning
null · serier tomma · noteringen "resultaträkningshistorik saknas" ordagrant
motiverar utkastets luckredovisning.

**Tabellen "Så står sig bolaget" — 14 tal EGENOMRÄKNADE ur 189-postfilen:**
finansgrenens medianer (20 bolag; EBIT n=19, prognos n=17): P/E 14,9845 →
14,985 ✓ · P/B 2,574 ✓ · ROE 15,47 % ✓ · EBIT 45,70 % ✓ · netto 35,06 % ✓ ·
prognos 10,23 % ✓ · TTM 9,56 % ✓. Universummedianer (177–189 poster per mått):
21,170 ✓ · 2,806 ✓ · 15,34 % ✓ · 20,96 % ✓ · 13,66 % ✓ · 13,14 % ✓ · 6,95 % ✓.
Rangplatser: 11/20 · 11/20 · 14/20 · 12/19 · 10/20 · 3/17 · 18/20 — **alla
exakta**, inklusive "tredje högsta TTM" och "tredje lägsta prognos".

**Datavaktens fem test — omräknade steg för steg, GRÖNA:** identiteten
(2,678 ÷ 0,1779 = 15,053 mot 15,269 = 1,4 %; spegeln 15,269 × 0,1779 = 2,716
mot 2,678) · TTM-detektiven (946,9 ÷ 15,269 = 62,0; 946,899 ÷ 2,678 = 353,6 ×
0,1779 = 62,9; 14,4+13,0+16,5+21,2 = 65,1; ex-notable 66,8; EK 362 mot 353,6 =
−2,3 %) · absolutkontrollen (15,269 × 57,0 = 870,3 → +8,8 %; × 65,1 = 994,0 →
−4,7 %) · PEG (15,269 ÷ 3,28 = 4,66; 15,269 ÷ 1,65 = 9,25; faktor 0,35) ·
tillväxtfältsprövningen (+41 %, +47 %, +17 %) och bokvärdesdetektiven
(356,22 ÷ 126,99 = 2,805; 356,22 ÷ 2,678 = 133,0 = +4,7 %; årssteget
126,99/116,07 = +9,4 %).

**Scenariorutan:** 47,1+46,8+50,5+57,3 = 201,7 · 201,7 × 0,5039 = 101,6 ≈ 102 ·
alla 9 celler (97–107) ✓ · räknesatserna (1 pp = 2,0; 3 % intäkter = 3,0;
1,5×) · marginalvikten 1 ÷ (3 × 0,5039) = 0,66 ✓. Multiplövningarna 14,78 och
14,5 ✓.

**Aktietalstrappan härledd:** FY25 57,0/20,02 = 2,847 · Q4-25 13,0/4,63 =
2,808 · Q2-26 21,2/7,71 ≈ 2,750 · kursimplierat 946,899/356,22 = 2,658 ·
totalt −6,6 % ✓. (Not: byggarens KO-rad skriver 2,810 för Q4-25 — utkastets
2,808 är den korrekta avrundningen.)

**Tvillingjämförelserna:** GS-posten P/E 15,479 · P/B 2,774 · ROE 0,169 ·
insider 7 · mcap 292,458 → 946,899/292,458 = 3,24 = "mer än tre gånger" ✓ ·
21,2/6,6 = 3,2× ✓ · 57,3/20,3 = 2,8× ✓ · aktietalet 2,658/0,291 = 9,1× ≈ "nio
gånger" ✓ · konsensusgapen 0,304/0,0328 = 9,27 → "9,3×" mot GS 0,425/0,0468 =
9,08 → "9,1×" ✓.

**Övriga trunkontroller:** de fyra nordiska bankpaketen insider 0
(SWED-A/SEB-A/SHB-A/NDA-SE alla 0) ✓ · JNJ 663,228 mdr USD < JPM ✓ ·
`kalender-finans.json`: rappdag 2026-10-13 tisdag, samtal 08:30 ET, officiell
JPMorganChase-källa, hämtat 2026-09-15, "Q2 2026 redovisades 2026-07-14" ✓ ·
"Med 45 paket på disk": 48 paket idag − de tre senaste (carlsberg, jpm,
fortum — mtime-ordning) = 45 ✓ · "JPMorgan står inte i vågvalideringskartan":
0 JPM-träffar i `vagvalidering-SENASTE.md` ✓ · nettomarginalkvartalen
32,8/30,6/32,7/37,0 egenräknade (15,0/45,7 · 14,4/47,1 · 16,5/50,5 · 21,2/57,3)
✓ · ord 3 191 → readingMinutes 5 korrekt (3191/600 = 5,3).

### 2. Webb-stickprov (2026-09-19)

Q2 2026 bekräftat av Yahoo Finance ("JPMorgan Chase Q2 2026 earnings: Record
profit", 2026-07-14), bolagets officiella 2Q26-pressmeddelande och StockTitan:
netto **21,2 mdr** (bankens största kvartalsvinst någonsin) · Visa-vinsten
**4,6 mdr** · rapportdag **2026-07-14**. **Avvikelse hittad: officiell EPS är
7,70, inte utkastets 7,71** (pressmeddelandets egen rubrik: "NET INCOME OF
$21.2 BILLION ($7.70 PER SHARE)") → diff B2–B4. Procenträkningen opåverkad
(7,70/5,25 = +46,7 → "+47").

### 3. Juridik (2007:528) — REN

Lagen (2007:528) åberopas exakt en gång, i disclaimern, med rätt paragraf
(2 kap 5 § — utbildningsundantaget). Inga andra svenska lagrum i texten
(Basel, CET1, SEC-filingar = regelverk/myndighetsmaterial, ej lagrum —
lagrumsblandning omöjlig). Ingressen negerar rådgivning ("inte en
rekommendation att köpa, sälja eller behålla"), slutdisclaimern upprepar
negeringen och placerar publiceringen hos kunden. Samtliga sex "köp"-träffar
oskyldiga (negeringar, rubrikfrågan "vem köper?", insiderköp, "Återköp:") —
B8-precedensen. **Ett stavfel i den juridiskt viktigaste meningen: "aldrig en
handssignal" ska vara "handelssignal"** → B1.

### 4. 911-referenser — REN

0 träffar på samtliga sex mönster (911, 9/11, 11 september, September 11,
11/9, nine-eleven).

### 5. Internlänkar — 13/13 HTTP 200

nio /dataset/finans-sidor + /bolag/jpm + /kurser + /transparens + /kallor,
alla verifierade mot localhost:3000.

## FYND (diff-poster)

**C1 — VÄSENTLIGT: superlativet "seriens största paket på börsvärde, före
Samsung" är FALSKT.** Filens egen Samsung-post (005930.KS): valuta KRW, mcap
1 610 830 mdr KRW, pris 252 500 KRW — internt konsistent (≈ 6,4 mdr aktier ×
priset). Vid varje historisk USD/KRW-kurs (940–1 450 de senaste 15 åren) är
det ≈ 1,1–1,7 **biljoner** USD — vida över JPM:s 946,899 mdr USD; ens det råa
filetalet är större. JNJ-delen är sann (663,228 mdr). Kur i mx1-stil: behåll
kraften, ringskriv superlativet ("största amerikanska paketet i serien …;
Samsungs won-notering är i konverterad läsning ännu större"). KO-not: byggarens
worklog-rad och GRANSKNINGSKO-SAMMANSTALLNING bär samma överdrift.

**C2 — VÄSENTLIGT: enhetssystematik i övning B + källraden — "miljoner
dollar" ska vara "miljarder dollar" på 8 ställen.** JPM:s kvartalsintäkter är
47,1–57,3 **miljarder**; scenariorutans etiketter ger läsaren 1000× fel skala.
Siffrorna är internt korrekta i miljarder-läsning (201,7 × 0,5039 ≈ 102 osv.) —
det är etiketterna som felar. KO-not: GS-tvillingen bär samma felklass (1
"miljoner"-träff i dess body).

**B2–B4 — officiell EPS 7,70 mot utkastets 7,71** (3 ställen; se
webb-stickprovet).

**B1 — stavfelet "handssignal" → "handelssignal"** i Övning A:s
juridikmening.

**B5–B6 — decimalpunkter i svensk löptext** ("14.4", "16.5", "21.2" i test 2;
samma kvartal står med komma i Tillväxt-sektionen).

**C3 — talet 34,88 saknar förankring** ("mot rapporterad intäktsbas 34,88"):
finns varken i JPM-posten (fältet är 34,92), kalender-finans.json eller
byggarens logg. Förslag: visa den faktiska räkningen (16,5 netto på 50,5
managed) i stället.

**C4/C5 — title 149 tkn** (seriens längsta; syskonen 81/110/133; tak ~60,
serienorm 70–84) och **description 423 tkn** (syskonen 204–368; SEO-fönstret
~155–160) — förslag med bevarad sökkärna.

**C6 — "ligger mitt i raden"** är generöst: raden 30,6–37,0 med median 32,75;
34,92 ligger i övre halvan. Lägst prioritet.

## R2 och ägarskap

`publishedAt` = rappdagen (serienorm; Ericsson/Nordea/GS identiska) —
publiceringen är kundens beslut och rörs ej. Utkasts-JSON:en orörd av
granskaren; diff-posterna verkställs av paketets ägare (s4) eller nästa våg.
`data/blogg/` orörd.

## Kö vidare i spåret

35 kvartalspaket väntar fortfarande granskning; nästa tidigaste rappdagar:
np3/ABB 10-16, handelsbanken/skf-b 10-19, tele2 10-20, sedan
tvillingklungan 10-21/10-22 (för JPM:s del: B/C-rättningar + GS:s
"miljoner"-felklass + KO-superlativen). Rotutkast: ~30 ogranskade (bilaktier
kräver först race-lösning mellan u1/u2 enligt deras anspråk).
