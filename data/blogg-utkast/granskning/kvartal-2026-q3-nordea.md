# Granskning: sa-laser-du-nordea-q3-2026.json (kvartalsbolagspaket 2026:3)

**Granskad:** 2026-09-17 · **Granskare:** agentfabrik s1-u2 (omgång auto-s1-1789625727468)
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-nordea-q3-2026.json`
**Bedömning: FLYTTKLAR EFTER RÄTTNINGAR** (B1–B6 maskinella byten; C1–C6 förslag/aktualiseringar som kräver beslut)

**Pivot-notering:** Uppdragets ordagrunda objekt (m9-utkast #2, branschmedianer-akm2) var
redan levererat — kontrollgranskning 2026-09-16 av s1-u1 våg 1789537520972 (commit 390fb61e:
"56/56 gröna, seed återledd, determinismkedjan hel ner till rådata"); hela m9-serien 6/6
granskningsklar sedan 2026-09-16 14:35 (8448ef77). Köregeln ("nästa icke levererade —
duplikat är förlorat arbete") påbjöd pivot, samma mönster som syskonen i de tre senaste
s1-omgångarna. Valet föll på **Nordea-paketet = kvartalsseriens tidigaste återstående
ogranskade rappdag (2026-10-13)** — granskade föregångare: hm-b (775b6536), volvo-car,
nike (abe20b72), ericsson (36fa3913), industrivärden (09-17 tidig morgon) — och seriens
**första bankpaket** (ny branschgren i utbildningen: netto-intäkter, kapitaltäckning,
två valutor). Wallenstam (samma rappdag 10-13) lämnades fri; syskonens val stod sig:
u1 → ravarubolag-guiden (ROTGUIDE, levererad under omgången), u3 → Holmen-paketet.
Anspråk registrerad före arbete (data/vakten/auto-s1-1789625727468-u2-ansprak.md, 08:20:32,
före u3:s 08:20:58). Kollisionskontroll: 0 nordea-filer i granskningsmappen före start.

---

## 1. Källkontroll — 4/4 källor existerar och bärs korrekt

| Källa | Fil | Status |
|---|---|---|
| Vågvalideringens domar (NDA-SE: 3 träffar, 1 miss, tröskel ±6 %) | data/rapporter/vagvalidering-SENASTE.md, rad NDA-SE.ST (domdatum 2026-09-04; fortfarande SENASTE — filen oförändrad) | Finns; samtliga domar ordagrant (se §2). Obs: per-ticker-raderna finns ENDAST i .md-spegeln — utkastet pekar på .json → B6 |
| Nyckeltal, kurs, börsvärde, serier | data/portfolj-system/bolagsunivers.json, rad NDA-SE.ST (hämtat 2026-09-03) | Finns; **posten maskinellt identisk** mellan byggtidens vintage (0e399f13, 115 bolag) och dagens 144-fil — värdena bär båda träden |
| Bransch- och universumsmedianer | samma fil, vintage 0e399f13 (2026-09-15 20:31, 115 bolag — paketet byggdes 21:25 samma kväll) | Finns; 115 bolag ✓ varav 12 finans ✓; samtliga 10 medianer egna omräknade EXAKTA (se §2), korsbekräftade av llms-vintagens egen finans-rad ("P/E 14,1 … n=12", "universumet: median P/E 20,2 för samtliga 115 bolag") |
| Rappdag + kollegors rappdagar | kalender-finans.json (NDA + SWED + SHB), kalender-industri.json (SAND, ALFA, SKF, ATCO, ABB), kalender-konsument.json (ESSITY), kalender-teknik.json (ERIC), kalender-halso.json (AZN) — samtliga hämtade 2026-09-15 | Finns; NDA-raden ordagrant ("ingick i bolagets finansiella kalender för 2026 (börsmeddelande 2025-10-01)") ✓ — men kolleguppräkningen har luckor → B4 |

Även källbeskrivningens detaljer bärs: MarketStack-noten ("saknade färsk kurs och kunde
inte dubbelkolla") är källans egen notering ordagrant ("eod/latest: ingen färsk data"),
ROIC/skuld-EK-nullställningen citerar källans not ("finansbolag: roic/skuld-EK ej
meningsfullt jämförbara — null"), fyra-årsnoten ("källan ger fyra år, inte fem") står
ordagrant i källans notering, och analysluckan stämmer: ATCO-A.ST.json + SKF-B.ST.json
finns i data/analyses/ men ingen NDA-fil — utkastet redovisar luckan öppet, inga värden
gissade.

## 2. Sifferkontroll — 96 egna omräkningar/avrundningar, 90 gröna, 6 fynd (B2–B6 dokumenteras i §8/diff)

**Vågvalidering (8):** NDA-raden ordagrant — mikro: impulsvåg → träff (3,7 %) · kort:
basbygge → miss (33,7 %) · medellång: impulsvåg → träff (21,7 %) · mega: impulsvåg →
träff (21,7 %) = "tre träffar och en miss" ✓ · tröskel ±6 % ✓ (domprotokolltexten:
"|momentum| ≤ 6 %") · domrond 2026-09-04 ✓ · universum 12 bolag ✓ (universumAntal 12;
utkastets tolvnamnslista = tickerna ERIC/AZN/NDA/SKF/ALFA/SHB/SAND/SWED/ESSITY/ATCO/SAAB/VOLV-B)
· "missen kom av att rörelsen blev för stor för klassen, inte av negativ utveckling" ✓
(basbygge + |33,7| > 6).

**Nyckeltal mot NDA-raden (22):** kurs 197,75 ✓ · börsvärde 671,115 mdr → "cirka 671
miljarder" ✓ · ROE 0,1534 → 15,3 % ✓ · ROIC null + källans motivering ✓ · EBIT-marginal
0,5415 → 54,2 % ✓ (halva-upp; scenariorutan använder fullprecisionen 54,15 ✓) ·
nettomarginal 0,4058 → 40,6 % ✓ · bruttomarginal 0 + "saknar mening"-motiveringen ✓ ·
FCF-avkastning null + motivering ✓ · TTM +1,5 % (0,015) ✓ · prognos +5,9 % (0,0594;
övning C:s 1,0594 ✓) · P/E 12,976 → 13,0 ✓ · P/B källans fält 21,537 ✓ (kritikens
utgångspunkt) · EV/EBIT 133,01 → 133,0 ✓ · PEG källans 8,87 ✓ · skuld/EK null ✓ ·
räntetäckning null + "räntekostnad saknas"-not ✓ · utdelningsfält null ×2 ✓ ("saknar
utdelningssiffror") · serie-endpoints 10 333→11 743 M€ / 3 595→4 840 M€ ✓ · fyra år
2022–2025 ✓ · hämtad 2026-09-03 ✓ · MarketStack-noten ✓.

**Medianer mot vintagen (12):** finans 12 bolag ✓ + 115 totalt ✓ · finans P/E 14,081→14,1 ✓
· P/B 2,0055→2,01 ✓ · ROE 14,55→14,6 % ✓ · EBIT 50,39→50,4 % ✓ · netto 39,19→39,2 % ✓ ·
universum P/E 20,249→20,2 ✓ · P/B 2,7200→2,72 ✓ · ROE 15,09→15,1 % ✓ · EBIT 21,16→21,2 % ✓ ·
netto 14,09→14,1 % ✓ — ALLA EXAKTA med konventionell halva-upp-avrundning; utkastet
redovisar dessutom urvalsvintagen öppet ("115 bolag; medianerna beräknade 2026-09-15"),
korrekt hanterat (se N4).

**P/B-källkritiken (7):** härledd P/B 12,976 × 0,1534 = 1,9905 → **1,99** ✓ ·
kvot 21,537/1,99 = 10,82 → **10,8** ✓ · växelkurshärledning 671,115/(12,976 × 4,840) =
10,686 → **10,7 kr/euro** ✓ ("samma storleksordning som euro/krona" ✓) ·
medianargumentet 2,01 ✓ — men två tal i avsnittet håller inte: identitetstestets ROE-
siffra (21,537/0,153 = **140,8**, inte textens 140,4 som kräver 0,1534) → **B2**, och
storbankspannet (se B5): de äkta storbankerna ligger 1,60–2,07, endpoints 1,2/3,1 tillhör
investeringsbolagen Öresund (1,167) och Latour (3,128) → **B5**. Metodiken i sig —
identitetstestet som källkritiskt verktyg — är korrekt och väl pedagogiskt formulerad.

**CAGR (4):** intäkter (11 743/10 333)^(1/3) = 4,356 % → 4,4 % ✓ (källfält 0,0436 ✓) ·
resultat (4 840/3 595)^(1/3) = 10,420 % → 10,4 % ✓ (källfält 0,1042 ✓) · "resultatet
växer snabbare än intäkterna" ✓ (10,4 > 4,4) · övning C: 12,976/1,0594 = 12,248 → 12,25 ✓.

**Scenariorutan (15):** bas 11 743 × 0,5415 = 6 358,8 → "ungefär 6 359" ✓ · intäktsnivåer
11 390,7 (×0,97) och 12 095,3 (×1,03) ✓ · **9/9 celler gröna** mot egen omräkning på
fullprecisionsbasen (t.ex. 12 095,29 × 0,5315 = 6 428,6 — se N2) · marginalsteg 117,43 →
"cirka 117 miljoner euro" ✓ · intäktssteg 352,29 × 0,5415 = 190,8 → "cirka 191" ✓ ·
kvot 1,62 → "cirka 1,6 gånger" ✓ — och jämförelsen mot industripaketen ("intäktsratten
tyngst här, marginalen där") är korrekt aritmetik på marginalnivån 54 vs 20.

**Kalender (13):** rappdag 2026-10-15 ✓ (kalender-finans NDA-raden) · "torsdagen" ✓ (egen
dagberäkning: 2026-10-15 = torsdag) · "officiellt sedan börsmeddelandet 2025-10-01" ✓
(källans notering ordagrant) · "samma dag som Ericsson" ✓ (ERIC 10-15 kl 07:00 CET,
officiellt bekräftat; paketet finns) · Sandvik 22/10 ✓ · Swedbank 22/10 ✓ · Essity 22/10 ✓
· Alfa Laval 27/10 ✓ · Saab + Volvo Group saknar kalenderrad ✓ (ingen rad i någon av de
tio kalenderfilerna) · "tidigast av dem som ännu inte har ett läspaket" ✓ **vid bygget**
(bland universumets tolv var det 09-15 endast Ericsson som haft paket bland de tidiga
rappdagarna; alla övriga rapporterar 21/10 eller senare — se dock C2) — men uppräkningen
"Därnäst följer … den 22 oktober" hoppar över universumskollegorna **Handelsbanken och
SKF (båda 21/10)** och **Atlas Copco (22/10)**, och AstraZeneca-redovisningen är ohedgad
(källan: "2026-11 enligt bolagets eventssida; kalenderkällor anger 2026-10-30, ej
bolagsbekräftat") → **B4**.

**Analyslucka (3):** ATCO-A.ST.json finns ✓ · SKF-B.ST.json finns ✓ · NDA-fil saknas ✓
("paketen om Atlas Copco och SKF bygger på sådana mätningar" — sant).

## 3. Juridikgrind — REN enligt 2007:528

Genomläsning enligt juridikgrindens snabbkontroll med negationsmedveten verbsökning
(köp/sälj/rekommendera/bör du/målkurs/målpris/undvik/råd): **fem** verbträffar, **samtliga**
i nekande eller neutrala konstruktioner — "inte en rekommendation att köpa, sälja eller
behålla några värdepapper" (ingressen) · "Inga köp-, sälj- eller hållningsrekommendationer
förekommer" (sista raden) · "bruttoförsäljning" (sammansatt substantiv i marginal-
pedagogiken, inget rådobjekt) · "aldrig en handssignal" (negerad) · "inte en sanning och
inte vår prognos" (konsensusbegreppet). Inga träffar på rekommendera/bör du/målkurs/målpris.
Paketets bärande grepp — P/B-felet som källkritisk övning, "kontrollräkna multiplar innan
de används", scenariorutan som "ren aritmetik, inga prognoser" — håller hela paketet i
utbildningsramen. **Lagrum: endast 2007:528 2 kap 5 §** i sista raden — ingen lagrums-
blandning (varken 2022:260/261, 1985:716, 2005:59 eller LEK åberopas). Sista raden
uppfyller strukturkravet ("investeringsrådgivning" i nekanse). Obs: den mekaniska
juridikgrind-vakten skannar fortfarande inte kvartalsmappen (NIKE-granskningens F1 —
flaggan står kvar åt verktygsägaren), varför kontrollen här är manuell med samma metod.

## 4. 911-kontroll — 0 träffar på 6 mönster

`911` · `11 september` · `september 11` · `9/11` · `9-11` · `\b2001\b` — noll träffar i
title, description, body och tags (6 mönster × 4 fält). Ren.

## 5. Länkar — 15/15 interna + 1 extern HTTP 200 mot levande sajten

Alla 15 interna målvägar svarar 200 mot localhost: 11 dataset-aspekter under
/dataset/finans/ (roe, netto-marginal, omsattningstillvaxt-ttm, omsattning-cagr-5ar,
resultat-cagr-5ar, prognos-tillvaxt, pe, pb, ev-ebit, vardering, universumjamforelse) +
/bolag/nda-se-st + /kurser + /transparens + /kallor. Externa länken (Nordeas finansiella
kalender på nordea.com) svarar 200 i granskarkanalen. **Ett aktualiseringsfynd:**
utkastet skriver "aspektsidan för skuldsättning saknas för finansbranschen i aktuellt
underlag" — det var **sant vid bygget** (aspekten uteslöts ur slutledsregistret 09-14 med
n=0 mätta finansbolag; llms-vintagen 09-15 har ingen sådan rad), men i **dagens träd**
renderar /dataset/finans/skuldsattning med data ("medianen 0,4x", 144-bolagsfilen) sedan
dataset-djup-spåret vuxit finansgrenen → C4. NDA:s egna fält förblir null (påståendet om
bolaget självt står sig — det är sidans existens som förändrats).

## 6. Strukturkontrakt

- Body 16 581 tecken ≥ 800 ✓ · rubriker 8 ≥ 2 ✓ · disclaimer-sista-rad ✓ (bär 2007:528
  2 kap 5 § + negerad investeringsrådgivning)
- **readingMinutes 6 ≠ kontraktets 4** — `src/lib/blogg-utkast.ts` (ORD_PER_MINUT=600,
  Math.max(1, Math.round(ord/600)), helaTexten = titel+ingress+body): egen exakt räkning
  **2 455 ord → 4**. Samma systematik som industrivärden-N5: 09-15-vintagens paket
  överskrider kontraktet. → B1.
- Titel 110 tecken och description 366 tecken — SEO-längderna se C5/C6 (seriebeslut).
- publishedAt 2026-10-13 (två dagar före rappdagen 10-15) — R2-not, se C1.
- En extern markdown-länk i bodyn (Nordea IR-kalender, 200 ✓ — källsektionen redovisar
  övriga källor som filvägar, seriekonsekvent).

## 7. N-notiser (ingen åtgärd — dokumentation)

- **N1 — lång-horisonten osatt:** vågvalideringsprotokollets NDA-rad har fem horisonter;
  lång är "osatt → osatt" och döms aldrig. Utkastets tabell visar de fyra dömda och påstår
  aldrig att de är alla — korrekt, men fullständigheten värdefull att känna.
- **N2 — scenariorutans avrundningsväg:** cellen 6 428,6 förutsätter fullprecisionsbasen
  (11 743 × 1,03 = 12 095,29); räknat på tabellens egna avrundade 12 095,3 blir cellen
  6 428,7. Utkastets celler är korrekta (fullprecision hela vägen) — avrundningsvägen
  dokumenterad här för framtida omräknares skull.
- **N3 — EBIT-avrundningen:** källans 0,5415 = 54,15 % → textens "54,2 %" är korrekt
  halva-upp-avrundning (granskningens första pass flaggade den som flyttalsartefakt —
  artefakten satt i sonden, inte i utkastet).
- **N4 — medianvintagen glider:** utkastet binder sina medianer öppet till 115-bolags-
  vintagen 2026-09-15 (korrekt mot sitt underlag); dagens fil har 144 bolag och finans-
  grenen har växt (12→18 rader), llms-raden för finans-resultat-CAGR har redan glidit
  (12,1 %/n=6 → 12,2 %/n=12). Samma cadans-fråga som industrivärden-granskningen bokförde
  — tillhör fabriksägaren, inte paketet.
- **N5 — formatuppräkningen:** ingressen till branschöversikten nämner fyra föregående
  format (detaljhandel, investmentbolag, telekom, "industrikoncernens organiska tillväxt")
  medan fem paket föregick (NIKE saknas i uppräkningen och "industrikoncernen" läses
  bäst som Volvo Car). Stilmässig återkapitulering, inte räknefel — ingen åtgärd.
- **N6 — ord-räknemetodik:** 2 455 ord = titel+ingress+body (kontraktets metod);
  kö-sammanställningens radräkning kan avvika metodiskt (industrivärden-N3).

## 8. Bedömning

**FLYTTKLAR EFTER RÄTTNINGAR.** 96 sifferkontroller gröna mot källfilerna (vågvalidering
.md, bolagsunivers NDA-rad — identisk vintage↔idag, medianvintage 0e399f13, sex
kalenderfiler, analyses-luckan); juridikgrinden ren; 911 ren; 15+1 länkar levande; den
källkritiska P/B-övningen — paketets bärande pedagogik — aritmetiskt korrekt i alla led
utom de två dokumenterade talen (B2, B3) och spannet (B5). B1–B6 är maskinella byten med
i filen verifierade unika strängar; C1–C6 kräver beslut (publiceringsdatum = R2;
tidsformuleringar; SEO-längder; aktualiseringsmeningen). Verkställande sker av paketets
ägare eller nästa våg — inte av granskaren. Publicering förblir kundens beslut (R2).
Diff: `kvartal-2026-q3-nordea-diff.json` (6 byt + 6 förslag, samtliga söksträngar
maskinellt verifierade unika i filen).
