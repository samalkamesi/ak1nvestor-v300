# KONTROLL 2026-09-18 — kvartalspaket sa-laser-du-wallenstam-q3-2026 (Wallenstam, rappdag 2026-10-15)

**Granskare:** agentfabrik s1-u1 (omgång auto-s1-1789694729881) · **Anspråk:** `data/vakten/auto-s1-1789694729881-u1-ansprak.md` (satt ~03:4x lokal, FÖRE arbetet)
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-wallenstam-q3-2026.json` — byggt 2026-09-16 av s4-u1 (commit `9e973f07`), KVD:at av byggaren, detta = första **oberoende** granskningspaketet
**Sonder:** `verktyg/_s1u1-wallenstam-verify.mjs` (läser, skriver inget) + curl för länkkontroll · utkast-JSON:n orörd av granskaren

## 0. Val enligt köregeln (pivot bokförd)

Uppdragstitelns "m9-utkast #1" är mall-platshållare: m9-ko-serien är 6/6 komplett sedan
2026-09-16 14:35 — m9-utkast #1 (boerspsykologi-fallstugor) levererades av
auto-s1-1789585526448-u1 med just detta uppdrag (kontrollgranskning + maskinell diff,
juridikgrind 0 fel, 911 = 0 träffar/6 mönster), våg 171-tillskotten #1–#3 levererade
2026-09-17, JNJ Q3 2026-09-17 21:57 ⇒ duplikat = förlorat arbete. Pivot till
kvartalsseriens dokumenterade FIFO-regel ("tidigaste återstående rappdag", tre omgångars
praxis): granskade är volvo-car, hm-b 09-24, nike 10-01, industrivärden 10-07,
ericsson/jnj/nordea 10-13, holmen 10-21 ⇒ **tidigaste återstående = Wallenstam
2026-10-15** (samma morgon som Nordea/Ericsson). NP3 10-16 utpekat som syskonens
troliga val (holmen-omgångens bokföring) — Wallenstam även kollisionsminimerat.

## 1. Källor — grönt, med vintage-låsning

- **Universumet git-låst vid byggcommiten:** `git show 9e973f07:…bolagsunivers.json` =
  **126 bolag, 12 i fastighet** — utkastets siffror exakta, och **WALL B-raden är
  byte-identisk vintage→idag** (dagens fil 165/13 är tillväxt i övriga rader; inget har
  rörtts under paketets liv). Medianernas "beräknade 2026-09-16 ur samma fil" är låst
  till 126-bolagsvintagen — korrekt redovisat i tabellnoten.
- **WALL B-raden fält för fält (26 kontroller):** pris 41,02 · MV 25,924 mdr ("cirka
  25,9") · P/E 10,005 · P/B 0,798 · EV/EBIT 32,05 ("32,1") · PEG 4,16 · FCF-avk 3,73 % ·
  ROE 8,37 % · ROIC 2,95 % (med källans proxy-not ordagrant) · brutto 65,42 % · EBIT 57,37 %
  · netto 80,80 % · FCF-marg 29,38 % · skuld/EK 1,0747 ("1,07") · omsCAGR 7,31 % ·
  resCAGR 32,47 % · TTM 0,9 % · prognos 1,82 % · NAV-proxy 51,40 (golv, typ tillgångstung)
  · golv-marginal 0,2019 · räntetäckning null · utdelningsfält null ×2 · serier år
  2022–2025 med omsättning 2 490/2 730/2 922/3 077 Mkr och resultat 1 103/−450/774/2 564
  Mkr — **ALLA exakta mot filen**.
- **Kalender:** `kalender-fastighet.json` WALL-B-post = rappdag 2026-10-15 · X-dag
  2026-10-27 · bokslut 2027-02-04 · tyst period cirka 30 dagar · Cision-citatet
  "Interim report Q3, 2026 – October 15, 2026" **ordagrant** i noten · kompletterande
  källa MarketScreener **finns med i postens källor** (utkastets "kompletterande
  MarketScreener" ✓). Sond: 2026-10-15 = torsdag (UTC) ✓. Wallenstams externa rapportsida
  (wallenstam.se/reports) är kalenderkällan — korrekt länkad två gånger i paketet.
- **Urvalsmotiveringen verifierad:** Öresund finns i **kalender-finans.json** med
  rappdag 2026-10-09 kl 08:00 (preliminär, MFN) — utkastets "rapporterar tidigare
  (9 oktober)" ✓ — och universumraden har exakt de påstådda luckorna: serier
  2013/2014/2018/2019, CAGR+prognos null. Kinnevik: P/E null + ROE −21,64 % ✓.
  NP3 = 2026-10-16 (officiell) · Wihlborgs 2026-10-20/21 (estimat, markerat) · Fabege
  2026-10-21 · Castellum 2026-10-22 ✓. WALL-B finns inte i
  `vagvalidering-SENASTE.json` — paketets vågvalideringsnot ("ingen dom, ingen
  25-cellersmatris, ABB-paketets presedens") håller maskinellt.
- **Kvintett-påståendet** (PEG-kvoter "från 1,3 till 8,0" för Nordea/Handelsbanken/
  Swedbank/Essity/Alfa Laval): spot-kontroll Nordea = källa 8,87 mot konvention 2,19 ⇒
  kvot 4,05 — inom spannet. (JNJ, som tillkom senare i serien: 1,55.)

## 2. Siffror — medianer i kanonmetod + ~30 aritmetikkontroller

- **Tabellen (5 mått × bolag/bransch/universum):** Wallenstams egna värden ALLA exakta
  (se §1). Medianerna **reproducerade ur 126-bolagsvintagen med KANONMETODEN** (medel av
  mittersta vid jämnt antal — `src/lib/dataset-nyckeltal.ts` `median()`): P/E 11,3/20,5 ·
  P/B 0,81/2,79 · ROE 8,37/15,3 · EBIT-marginal 63,9/21,2 · nettomarginal 46,0/14,7 —
  **10/10 träff**, med nämnare n=12/11 (fastighet), n=117–126 (universum per mått),
  exakt som tabellnoten anger. **Metodfynd (positivt):** till skillnad från JNJ-paketet
  (s1-u2:s C1: övre-mittersta gav avvikelser mot datasetsidorna) följer detta paket
  kanonmetoden — paketet och de länkade dataset-aspektsidorna talar samma medianmetod,
  ingen motsägelse ett klick bort.
- **Aritmetik (egna omräkningar, alla gröna):** kurs/NAV 41,02/51,40 = 0,79805 ("0,798")
  · rabatt 20,19 % ("cirka 20 procent", filens golv.marginal 0,2019) · identitet 0,798 ÷
  0,0837 = 9,534 ("9,53") med differens 4,71 % ("4,7 procent") · omvänd 10,005 × 0,0837 =
  0,837 · implicit EPS 41,02 ÷ 10,005 = 4,10 · PEG-konvention 10,005 ÷ 1,82 = 5,497
  ("5,50") med kvot 0,757 ("0,76" — seriens första underläge, korrekt läst) ·
  multiplövning 10,005 ÷ 1,0182 = 9,826 ("9,83") · oms-CAGR (3 077/2 490)^(1/3) = 7,31 %
  · totalt +23,6 % · årliga steg +9,64/+7,03/+5,30 ("+9,6/+7,0/+5,3") · res-CAGR
  (2 564/1 103)^(1/3) = 32,47 % · EBIT 2025 = 3 077 × 57,37 % = 1 765,3 ("1 765") ·
  netto−EBIT = 798,8 ("grovt 800") · 1 pp marginal = 30,8 Mkr ("cirka 31") · 3 %
  intäkter = 53,0 Mkr · intäktsratten 1,72× ("cirka 1,7") · marginalvikt 0,581 ("0,58",
  Essity-formeln 1/(3×0,5737) = 0,581) · EK-konsistens: aktier 0,63179 mdr × 51,40 =
  32,48 mdr = MV/PB-vägen 32,49 mdr (NAV-proxyn, P/B och MV stänger inbördes).
- **Scenariorutan:** mittraden (3 077,0) exakt; **sex kantceller avviker ≤ 0,2 Mkr** från
  ren omräkning (t.ex. 2 984,7 × 57,37 % = 1 712,3 mot rutans 1 712,5; 2 984,7 × 56,37 %
  = 1 682,5 mot 1 682,4) — svansavrundning vid tillverkningen, 0,01 % av cellvärdet,
  räknesatserna (31/53/1,7×/0,58) opåverkade. C1 i diff.json; inget tvång.
- **Notiser utan rättning (paketet motsäger sig inte):** ROE-kors 2 564/32,5 = 7,9 %
  mot fältets 8,37 % (definitionsskillnad senaste-år/medel-EK — paketet gör ingen sådan
  korsning) · EV-kors (MV+skuld)/EBIT = 34,5 mot fältets 32,05 (pakets texten citerar
  endast fältet OCH varnar redan för att EV-måttet för belånade fastighetsbolag "säger
  mer om skuldstrukturen än om värderingen") — båda C-klass, se diff.json.

## 3. Fynd — 0 byt (A/B) + 5 förslag (C) + 1 ägarflagga

| Id | Klass | Kort |
|---|---|---|
| C1 | förslag | Scenariorutans sex kantceller ±0,2 Mkr från ren omräkning (svansavrundning; exakta tal i diff.json om ägaren vill synka — mittraden och räknesatserna redan exakta) |
| C2 | förslag | Descriptionen: "kursen 41 kronor" mot bodyns konsekventa 41,02 — i samma mening står "51,40 kronor" med decimaler; förslag "41,02 kronor" |
| C3 | notis | EV/EBIT-fältet 32,05 ~7 % under egen korsräkning 34,5 — paketet citerar fältet med belåningsvarning; beräkningsvägen okänd (JNJ:s EV-fynd i samma klass, men ingen självmotsägelse här) |
| C4 | notis | ROE-fältet 8,37 % mot årskors 7,9 % — definitionsnotis; ingen korsning görs i paketet |
| C5 | R2-notis | publishedAt = 2026-10-13, rappdag 10-15 — dagen-före-praxis (nike/hm-b/holmen); publiceringstidpunkten är kundens beslut |
| — | ägarflagga | **Inte denna fil:** syskonpaketet sa-laser-du-np3-q3-2026.json bär publishedAt 2026-10-14, men kalenderns NP3-post är officiellt bekräftad 2026-10-16 — till NP3-paketets ägare |

**Inga A- eller B-poster: inga väsentliga fel, inga konkreta felaktigheter.** Detta är
seriens renaste granskningsresultat hittills under 09-15-standarden (jfr JNJ: 9 A + 7 B).

## 4. Juridik (2007:528) — REN

- **Varumärkesgrind** (kontrolleraText-replik: `data/varumarke.json` 26 regexer på title +
  description + hela bodyn): **0 FEL, 0 varningar**.
- **Rådord** "köp"/"köpa"/"sälj"/"sälja"/"rekommendation": enbart i **negerade
  konstruktioner** — ingressen "inte en rekommendation att köpa, sälja eller behålla
  några värdepapper" och disclaimern "Inga köp-, sälj- eller hållningsrekommendationer
  förekommer" — kontextverifierade.
- **Investeringsråd endast negerat:** rabattläsningen är formulerad som "en beskrivning
  av en kvot, inte ett omdöme om värdet"; övningarna är "träning i metod och ren
  aritmetik"; prognossiffran märks "inte en sanning och inte vår prognos" ✓.
- **Lagrum:** endast 2007:528 2 kap 5 § (disclaimern, sist i bodyn) — ingen
  lagrumsblandning (2022:260/261, 1985:716, 2005:59, 2022:482, GDPR: 0 träffar).
- **911-kontroll: 0 träffar på 6 mönster** (911 · 9/11 · 11 september · september 11 ·
  nine-eleven · 9-1-1).
- **Personnamn:** inga individer nämns (manuell genomläsning — endast bolagsnamn).

## 5. Länkar — 18/18 gröna

18 unika interna länkar, **alla HTTP 200 mot localhost** (14 dataset-aspekter under
/dataset/fastighet/ + /dataset/fastighet/universumjamforelse + /bolag/wall-b-st +
/kurser + /transparens + /kallor); 0 länkar till outgivna utkast. Extern länk
wallenstam.se/reports = kalenderkällan (postens officiella källa, hämtad 2026-09-15).

## 6. Struktur — inom familjepraxis (inga fynd)

9 fält (BlogPost) ✓ · slug = filnamn ✓ · pillar "Institutionell metodik" ✓ · author
"AK1A Research Lab" ✓ · **2 634 ord (exakt byggcommitens angivna tal)** · title 189 /
desc 655 tkn / readingMinutes 5 — inom kvartalsfamiljens span (syskon: ord 1 068–2 742,
minuter 4–7, title max 314, desc max 1 057) · 7 H2-rubriker · 0 mjuka bindestreck ·
body ≥ 800 tkn ✓ · negerad disclaimer sist ✓.

## 7. Dom

**FLYTTKLAR UTAN RÄTTNING.** Källor (vintage-låsta och reproducerbara), siffror (26
fält + 10 medianer i kanonmetod + ~30 aritmetikkontroller), kalenderfakta, juridik,
länkar och struktur genomgående gröna; innehållets alla slutsatser (NAV-rabatten,
identitetstestets 4,7 %-nivå, PEG-riktningsbytet med kvot 0,76, CAGR-kritiken mot
serien 1 103 → −450 → 774 → 2 564, netto-över-rörelse-marginalen, marginalvikten 0,58)
sondbekräftade med egna omräkningar. C-posterna = ägarens beslut (C2 är den enda
strängändringen värd att överväga; C1 kosmetik; C3–C4 notiser; C5 = R2).
Publicering = kundens klick (R2). **src/ orörd = INGET bygge** (tsc-baslinjen vilar i
pre-commit-grinden); R2 orörd (priser/tier/publicering); data/blogg/ orörd;
utkast-JSON:n orörd av granskaren.
