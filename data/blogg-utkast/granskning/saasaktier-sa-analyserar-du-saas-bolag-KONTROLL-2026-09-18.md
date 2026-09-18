# KONTROLL 2026-09-18 — saasaktier-sa-analyserar-du-saas-bolag.json (B11)

**Granskare:** fabrik auto-s1-1789735501260 u3 (granskare 3/3). **Anspråk FÖRE arbetet:**
`data/vakten/auto-s1-1789735501260-u3-ansprak.md` (klaim-protokollet; syskon u1 tog
halvledaraktier 14:48 och hänvisade mig hit — u2:s yta orörd).

**Bedömning: FLYTTKLAR EFTER RÄTTNING** (B1 Rule of 40-märkningen + B2 superlativen
"från Kambi" + B3 "sektorns tyngsta lönsamhet" + B4–B5 stafel + B6 readingMinutes
2→6) **+ 3 förslag** (C1 scoping, C2 dataflagga, C3 källdatum) **+ 3 notiser**
(D1 publishedAt/R2, D2 EN-spegelns rm, D3 registrets ordkonvention). I övrigt grönt
hela vägen: sex bruttomarginaltal + EV/EBIT EXAKTA mot rådata i FYRA kandidat-vintager,
8/8 räkneexempel korrekta, juridiken ren (vakt: 0 fynd, grund true), 911 = 0 träffar,
16/16 interna + 5/5 externa länkar levande. Publicering = kundens beslut (R2).
Utkast-JSON:en orörd av granskningen (nya filer endast).

**Objektval enligt spårets köregel:** uppdragsrubrikens "m9-utkast #3"
(indexordning: kassaflodesanalys-101) är en auto-platshållare — m9-ytan är KOMPLETT
(m9-ko 6/6 KONTROLL-2026-09-16; våg 171:s tillskott 09-17). Nionde omgången med
denna pivot (syskonbokfört mönster). FIFO-steget efter u1:s halvledarval = saasaktier
(09-16 08:55; 0 granskningsfiler vid anspråket).

## 1. Källor — GRÖNT (kedjan sluten på fyra ben)

Byggcommit **68618489 2026-09-16 08:57** (s3-u2:s B11-filer följde med s3-u1:s
B10-commit via delat staging — dokumenterat i ce970036; innehållet intakt).
Utkastet deklarerar "AK1A:s analysuniversum — bolagsrådata, hämtad 2026-09-15".
Universumglidningen samma morgon (115→120→123→125→126 bolag 09-15 20:31–09-16 08:40)
gör vintage tvetydig — testat mot **fyra kandidat-vintager** (0e399f13 115 · 9839c530
120 · 37aecd55 125 · 6c4cc758 126): **samtliga sju namngivna bolagsposter är
IDENTISKA i alla fyra** (SaaS-bolagen orörda av tillskotten) ⇒ källkedjan sluten
oavsett vilken dragningspunkt byggaren använde. Not: posternas eget `hamtat`-datum =
2026-09-03 (Yahoo) — "2026-09-15" är universumfilens dragning (C3, konventionsnotis).

Externa källor (källsektionens 5 + universum): alla 5 URL:er levande HTTP 200
(redirects följda). Bessemer/Cloud Benchmarks korrekt angiven som Rule of 40-konventionens
hem — vilket själv blir måttstocken i fynd B1.

## 2. Siffror — 6+1 TAL EXAKTA, 8/8 RÄKNEEXEMPEL GRÖNA, MEN FYND B1–B3

**Exakta mot rådata (alla fyra vintager):** bruttomarginaltrappan Kambi 98,9
(0,9885) · Palantir 84,8 · SAP 73,7 · Truecaller 73,1 · Microsoft 67,9 · Sinch 18,4
(0,184) — sex för sex; Kambi EV/EBIT 197 (196,989). Sinch "når inte 19" ✓ (18,4).

**Aritmetik 8/8:** R40-summor 17,3+23,8=41,1 · 19,3+5,0=24,3 · 44,4+35,1=79,5 ·
13,1+6,1=19,2 alla korrekta; churn 1÷0,01=100 månader ("över åtta år" ✓ = 8,3) och
2 % → 50 månader; LTV 800×50=40 000 kr mot CAC 8 000 = 5:1; SBC 1,02⁵=1,104→"tio
procent fler aktier" ✓; NDR 110 % = +10 % ✓.

**B1 (VÄSENTLIGT — felmärkt mått i sektionens bärande exempel):** texten definierar
Rule of 40 som "tillväxttakten i procent plus kassaflödesmarginalen" och räknar med
17,3/19,3/44,4/13,1 — i rådata är dessa **prognosTillväxt = konsensus EPS-tillväxt
+1 år** (earningsTrend; fältets egen notering), inte intäktstillväxt. Konventionen
i utkastets EGNA källa (Bessemer) = intäktstillväxt + FCF-marginal. Konsekvens:
**SAP "precis över" 40 vänder sig med intäktstillväxt** — omsCAGR5 6,0 + fcfMarginal
23,8 = **29,8**, TTM 9,4 + 23,8 = 33,2, båda UNDER strecket. Microsoft (21,1/22,7),
Palantir (68,0/127,9) och Sinch (5,3/9,9) håller sina slutsatser (under/över/under)
vid byte. Kassaflödessidan är RÄTT märkt (fcfMarginal) — endast tillväxtsidan är
felmärkt. Rättning: märk måttet ärligt ELLER räkta på intäktstillväxt (då SAP-exemplet
byts/omformuleras — Palantir bär "över"-rollen lika bra).

**B2 (VÄSENTLIGT — superlativfelklassen, seriens nionde fyndplats):** ingressen
"I AK1A:s analysuniversum finns hela spannet av mjukvaruekonomi: från Kambi (98,9)
… till Sinch" — **Kambi är rang 4 av 114 mätta** i utkastets eget underlag: Industrivärden
100,0 + Öresund 100,0 + **Evolution 100,0** (källans nettokonvention, definierad i
syskonguiden B12) ligger över; bland mjukvarubolag är Evolution ensam över Kambi.
Sinch-änden SANN (mjukvarubotten 18,4; bankernas 0,0 och Polestars −1,1 är inte
mjukvaruekonomi). Kur enligt finans-precedensen: rangen rättas, kraften behålls.

**B3 (samma felklass):** "Microsoft, med sektorns tyngsta lönsamhet" — falskt på
marginaler i utkastets eget SaaS-set: Palantir ebit 47,1/netto 49,0/fcf 35,1 >
Microsoft 45,1/40,3/5,0 (Evolution högre än båda om mjukvaruekonomi räknas:
57,8/51,8/59,2). Sant endast i absoluta tal. Byte till "världens största mjukvarabolag"
= sant på alla läsningar och behåller poängen (storlek förklarar kassans väg).

**B4 (stavfel som byter ord):** "där den marginella **kusten** är nära noll" →
"kostnaden" — "kusten" är ett annat substantiv, inte bara ett stavfel.

**B5 (stavfel):** sammanfattningen "fjärran kassaflöden är **räntkänsliga**" →
"räntekänsliga" (kroppens risksektion stavar rätt: "känsligare … för räntan").

**B6 (metadata):** readingMinutes **2 → 6**. 1 239 ord textrensat (1 344 rå) vid
rm 2 = **620 ord/min = 2,8× publicerat max** (55 publicerade poster: 51–224 wpm,
0 över 240 — egen mätning idag, konsumentaktier-precedensen). Textrensat ord/200:
round(1 239/200) = 6. (Råkonventionen ger 6,7→7; textrensat-mått valt efter dagens
precedens.)

## 3. Juridik (2007:528) — REN

`juridikgrind-vakt --json`: **fynd 0 (0 FEL + 0 VARNING), grund true** — flyttklar=
false beror enbart på saknad granskningspost (denna leverans stänger det). Ingressen
bär utbildningsgrunden explicit ("utbildning i metod, aldrig råd om enskilda aktier")
och disclaimern står sist ("Detta är pedagogisk finansanalys, inte investeringsråd").
Rådverbsträffar: 2, båda "bolag som **säljer** mjukvara" — verksamhetsbeskrivning,
falska positiva. **Inget lagrum åberopas i texten** ⇒ lagrumsblandning (2007:528 /
2022:260 / 2022:261 / 1985:716) omöjlig. Inga prediktionsformuleringar; värderings-
avsnittet håller mekanikform ("kontrollera baklänges vad som är prissatt").

## 4. 911-referenser — REN

**0 träffar på 7 mönster** (911 · 9/11 · 11 september · september 11 · september 2001 ·
nine-eleven · 9-1-1) i title + description + hel body. Seriestandarden håller.

## 5. Länkar — GRÖNT

**16/16 unika interna HTTP 200 mot localhost:3000** (10 kurser + 6 blogg; loopback
enligt AGENTS.md). Inga länkar till outgivna utkast. **5/5 externa källor 200**
(microsoft.com/investor · sap.com/investors · kambi.com/investors · sinch.com ·
bvp.com/atlas).

## 6. Struktur/metadata

Title 40 tkn (praxis-max 84) ✓; description 155 tkn (max 240) ✓; 9 H2 med sökords-
disciplin ("SaaS-aktier" i title + ingress + första H2) ✓; källsektion 6 poster ✓;
disclaimer-sista-rad ✓; readingMinutes = enda metadatafelet (B6). publishedAt
2026-09-16 = skapandedatum — vid flytt sätts publiceringsdag (D1, R2).

## Dom

**FLYTTKLAR EFTER RÄTTNING (B1–B6; B1+B2 bärande) — publicering väntar kunden (R2).**
Diff-paket: `saasaktier-sa-analyserar-du-saas-bolag-diff.json` (12 poster; söksträngar
maskinellt unika i filen). Vid rättning av B1 rekommenderas den ärliga märkningen
(konsensus-EPS) hellre än omräkning — guiden lär ut konventioner och konventionens
två varianter är i sig lärorikt; men då ska SAP-exemplet inte bära "precis över"-slutsatsen.

## Könotiser

1. **Till Ö11-granskningen:** EN-spegeln saasaktier-…-en.json bär samma rm-fel
   (rm 2 vid 1 400 ord = 700 wpm; dess register-not dokumenterar round(ord/600) —
   600-konventionen står i konflikt med publicerad praxis 0/55 över 240 wpm).
2. **Till mallägaren (SEO-GUIDER):** B11-raden redovisar 1 344 ord = RÅkonventionen
   (min råmätning 1 344 exakt; textrensat 1 239) — samma konventionsskillnad som
   konsumentaktier-flaggan 09-18; välj ETT mått i mallen.
3. **Till dataägaren (spår 2):** Microsoft fcfMarginal 5,0 i kontrast mot ebit 45,1/
   netto 40,3 — proportionsföljden internt märklig; fältdefinition/period värd att
   dubbelkolla (C2). Universumglidningen 115→ aktuell fortsätter göra "universumets"-
   påståenden vintage-känsliga — superlativtest mot egen rådata FÖRE bygg (seriens
   skrivprompt, nionte fyndplatsen nu).
4. **Till sammanställningsägaren:** branschguide-B-serien saknas fortfarande som
   systematiska rader i GRANSKNINGSKO-SAMMANSTALLNING.md (mx1-flaggan 09-18 03:40
   upprepas här).
