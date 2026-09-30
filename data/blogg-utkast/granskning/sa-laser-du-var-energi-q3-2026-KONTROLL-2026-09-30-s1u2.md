# KONTROLL — sa-laser-du-var-energi-q3-2026.json (oberoende granskning)

**Granskare:** fabriksagent s1-u2, manifest auto-s1-1790796926223 (2026-09-30).
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-var-energi-q3-2026.json`
(byggt 2026-09-18, energigrenens andra paket, seriens kvartalsserie).
**Metod:** sond `verktyg/_s1u2-varenergi-q3-kontroll.mjs` — 172 maskinella kontroller,
**165 OK · 4 FEL · 3 NOT**, dubbelkört deterministisk (körning 3 == körning 4, identiska rader).
Utkast-JSON:n ORÖRD — rättningar levereras som diff + flyttklart paket (nya filer).

## Källålåsning

Textens källrad deklarerar: *"medianerna beräknade 2026-09-18 ur samma fil (177 poster,
varav 19 i energi; P/E-medianen n=18 … universumets n per mått: P/E 167, P/B 174, ROE 173,
EBIT 176, netto 177, skuld/EK 162)"*. Universumfilens git-historik runt byggtiden:
04:23 = 171 poster → 09:21 = 172 → 09:38 = 174 → 09:52 = **177 (75d04140)**.
**Vintage låst till 75d04140** — den ENDA versionen vars universum-n (167/174/173/176/177/162)
och huvuddelen av medianerna reproducerar textens tal exakt. VAR-rad (VAR.OL) identisk
vintage↔dagens fil på samtliga 19 fält — källposten drift-fri, alla domslut drift-säkra.

## GRÖNT (kärnan håller)

- **Källtalsparitet 18/18 exakt** mot vintagen: P/E 10,177 · P/B 57,915 · EV/EBIT 20,373 ·
  PEG null · FCF-yield 3,94 % · ROE 93,98 % · ROIC 76,52 % · brutto 88,11 % · EBIT 59,41 % ·
  netto 13,02 % · FCF-marginal 46,51 % · skuld/EK 3,0773 · prognos −34,05 % · resCAGR −5,70 % ·
  omsCAGR −6,26 % · TTM +102,7 % · kurs 50,48 · mcap 126 011 Mkr. Serier 2022–2025 exakta
  (oms 9 827,6/6 849,7/7 450,1/8 095,6 · res 936,4/610,2/311,5/785,2 M$).
- **Medianer**: 13 av 16 kontrollerade par exakta mot vintagen, däribland ALLA
  energi-medianer utom P/E (P/B 2,28 · EV/EBIT 13,44 · FCF 5,28 · ROE 12,91 · ROIC 11,63 ·
  brutto 40,13 · EBIT 18,22 · netto 9,08 · skuld 0,50 · omsCAGR −8,44) och universums
  P/E 21,15 (n=167) · P/B 2,81 (n=174) · ROE 15,34 (n=173) · netto 14,09 (n=177) ·
  prognos 12,3 · skuld 0,51*. Avvikelserna = fynden nedan.
- **Aritmetik ~60 poster** (tolerans 0,05–1 %): identitetstestet P/B ÷ ROE = 61,63 mot P/E
  10,177 (kvot 6,06, +505 %; omvänt 9,56; EPS 4,96) · valutatestet (BVPS 0,8716, underlag
  0,819, kvot 6,055 — växelkursen förkortas ut, stuprör-logiken algebraiskt korrekt) ·
  DuPont (oms/EK 3,72 → 48,4 % × hävstång 4,08 → 197,5 % mot fältets 93,98, faktor 2,10) ·
  EV-kedjan fem steg (EK 2,176 → skuld 6,697 → EV 8,873 mdr; EBIT 4 810; kedje-EV/EBIT 1,85
  mot fältets 20,373 = kvot 0,091; fältet implicerar EV 98,0 med nettokassa 28 mot kedjans
  nettoskuld 4,5) · FCF-paret (3 766 M$; blandläsning 2,99 % mot fältets 3,94, kvot 0,76) ·
  CAGR-replikering EXAKT (−6,26 och −5,70) · sex årssteg (−30,30/+8,76/+8,66;
  −34,83/−48,95/+152,06) · fyra härledda nettomarginaler (9,53/8,91/4,18/9,70) · klipp
  (28,7 pp; 46,39 pp; 78,1 % av EBIT; skatten 22+56 = 78) · **scenarioruta 9/9 celler
  korrekta OCH rätt placerade** (rader = intäkter × kolumner = marginaler — ej transponerad,
  kontrast mot Getinge-paketets B2) · räknesatser (81 M$/pp; 243 M$/3 %; Essity-vikt
  1 ÷ (3 × 0,5941) = 0,56) · bottenårets parallellräkning (338 M$; 14× huvudcellen) ·
  multiplövning 10,177 ÷ 0,6595 = 15,43 · PEG-konventionen 0,30 med teckenbyte ·
  aktier 2 496 M · ROIC-kedja 54,2 % (kvot 0,71) · sjutton procent-/kvot-påståenden i
  löptexten (37→38 se B1; 52; 25×; 21×; 120; 85; 226; 43; 8; 7×; 6×; 6×; 3,6×).
- **Rang 8/8** mot vintagen: P/E näst lägsta av 18 (under IBE.MC 24,8) · P/B grenens
  högsta (57,9 mot tvåan ENEL 3,6) · brutto näst högsta (efter AKRBP 90,7) · EBIT näst
  högsta (efter AKRBP 75,8) · ROE grenens högsta · skuld/EK grenens högsta · prognos
  grenens mest negativa av 18 · ROIC 6,58× medianen.
- **Juridik 2007:528 REN**: varumärkesgrinden 0/26 fraser på title+description+body ·
  2 rekommend-förekomster, båda negerade ("inte en rekommendation att köpa, sälja eller
  behålla") · exakt en lagrumsfamilj (2007:528 — ingen lagrumsblandning) · utbildningsgrunden
  bärande · köp/sälj-former pedagogiskt inramade · disclaimer med lagrum sist i bodyn.
- **911-referenser: 0.**
- **Länkar**: 17 unika interna /dataset/energi/*, /bolag/var-ol, /kurser, /transparens,
  /kallor — samtliga HTTP 200 mot localhost:3000; extern varenergi.no-kalender 200.
- **Kalender 5/5**: kalender-energi.json bär 21/10 kl 07:00 norsk tid + trading update
  12/10 + hämtdatum 09-15 · energikalendern 10 bolag ("ett paketerat bolag av tio") ·
  dagen delad med Handelsbanken, Iberdrola (09:30 spansk tid), SKF och Telia — alla fyra
  belagga i respektive kalenderfil.
- **Gallransunderlag**: Kinnevik-serien 0/936/23/0 Mkr + negativt basår ✓ (se C2 för
  antalsformuleringen).
- **Korsreferenser 15 paket + 3 beräkningar**: Yara (0,12 · 2,47 · 2,53 · "NOK hela vägen") ·
  Iberdrola ("Vår Energi … nästa" — utpekningen belagd) · NP3 (14 procent — filens egen
  formulering "seriens största avvikelse i en enda valuta") · Nokia (8 % · 4,20) ·
  Nordea (21,5/2,0/10,8) · Telia 1,89 · Tele2 1,37 · SCA 8,55 · Boliden 2,69 ·
  Volvo Groups trappa (3,2 · "Alfa Laval 2,1 ≈ ABB 2,0" · "Sandvik/Atlas Copco 1,6–1,7" ·
  "0,5–0,6") · Atlas 1,7 · Hydro 1,20 · Nike/Essity 2,6 · Wallenstam 0,5 ·
  Holmen 4,60 (ur granskning/kvartal-2026-q3-holmen.md). Beräkningar: Yara behöll
  68,5 % av EBIT ("68 procent" ✓) · VAR behåller 21,9 % ("22" ✓) · marginalvikten 0,56
  på botten av syskonens trappa ✓.
- **Struktur**: 3 840 ord → readingMinutes 6 ✓ (round(3 840/600)) · 7 H2 (familjestilen) ·
  publishedAt 2026-10-21 = rappdagen · 7 tags · disclaimer sist.

## FYND

### B1 (väsentligast) — energi-P/E-medianen 16,05 oreproducerbar
Löptexten: *"37 procent under branschmedianen 16,05 (n=18)"* + tabellraden
`| P/E | 10,18 | 16,05 (n=18) | …`. Den deklarerade 177-filen (75d04140) ger energigrenens
P/E-median **16,5325** (n=18) — och samtliga alternativa vintager likaså (171-postfilen:
16,5325; 174-postfilen: 16,5325; VAR exkluderad: 17,02, n=17). 16,05 finns i INGEN
kandidatkälla; trolig transkription av 16,53 (sifferkast). Kur: **16,05 → 16,53** på båda
ytorna + följdytan **"37 procent" → "38 procent"** (10,177/16,5325 → 38,4 % under).

### B2 — vintage-läckage i tre universumsmedianer (källraden deklarerar 177-filen)
- **EV/EBIT-univ 18,17** — 177-filen ger **18,22** (n=168 ✓); 18,17 är 171/174-vintagernas
  värde. Kur: 18,17 → 18,22 ("12 procent över" förblir 12: 11,8 %).
- **EBIT-univ 21,11** (två ytor: löptext + tabell) — 177-filen ger **21,165 → 21,17**
  (n=176 ✓); 21,11 är 174-vintagens exakta värde. Kur: 21,11 → 21,17 + följdytan
  **"182 procent över" → "181"** (59,41/21,165 → 180,7 %).
- **FCF-univ 3,80** — 177-filen ger **3,835 → 3,84**. Kur: 3,80 → 3,84.
Mönstret: fyra medianer (inkl. B1:s granne EV/EBIT) bär äldre vintage medan n:en och
övriga elva medianer är 177-filens — konsistent med utkastets egen varning *"servade
dataset-sidor visar äldre medianer tills nästa prod-bygge"*; de tre här kan spåras till
174-vintagens värden (servade sidors medianer kunde inte maskinellt beläggas — de renderas
ej statiskt i HTML; rot-hypotesen är därför sannolik men öppen). Texten deklarerar
 själv 177-filen som källa ⇒ värdena ska vara filens.

### B3 — title 334 tecken > taket 314
Seriens längsta titel hittills (syskonmax Kinnevik 313 = gränsen; getinge- och
fabege-sonderna fastlade taket 314). Kur: stryk V-svansen
*", och resultatformen som ett V: 936 → 610 → 312 → 785 miljoner dollar"* (V-formen lever
kvar i description och ingress) → 268 tkn.

### C1 — skuld-univ-medianen 0,51 trunkerad
Filen ger 0,515 → korrekt tvådecimal **0,52**; texten "0,51" (två ytor: löptext + tabell).
Gränsfall (fabege-precedensen accepterade 0,51 — men där som en annan vintages faktiska
median; här är 0,515 DEN DEKLARERADE filens median). Kur: 0,51 → 0,52.

### C2 — "nollor tre av fyra år" (Kinnevik-gallran) oprecis
Serien är 0/936/23/0 Mkr = **två** exakta nollor + ett år på 23 Mkr (2,5 % av toppåret).
Läsbar som tre år utan meningsfull omsättning, men "nollor tre av fyra" är tekniskt fel.
Valfri kur: "noll eller nästan noll tre av fyra år".

### NOT (ingen åtgärd)
- Description 777 tkn = seriens längsta men utan känd hård gräns (telia 654 och
  iberdrola 656 levererade flyttklara) — konventionsnot, ej fynd.
- NP3-jämförelsen "14 procent" gäller NP3-paketets egna formulering ("största avvikelse
  i en enda valuta") — korrekt citerad, men notera att VAR-paketets brott (6,06×) är ett
  annat slags brott (kvoten mot identiteten, inte avvikelse i procent) — inget fel i texten.
- TTM +102,7 % mot årssteg +8,66 "största avståndet i serien hittills" — ej maskinellt
  verifierbart mot samtliga paket; påståendet är öppet formulerat och lämnas.

## DIFF + PAKET

- `sa-laser-du-var-energi-q3-2026-diff-2026-09-30-s1u2.json` — 10 satser (D1a–D7),
  samtliga from-strängar maskinellt unika (1 träff) i utkastet.
- `sa-laser-du-var-energi-q3-2026-FLYTTKLART-PAKET-2026-09-30-s1u2.json` — genererat ur
  utkastet med EXAKT-EN-TRÄFF-assert per sats; efterverifierat (gamla felsträngar 0 träffar,
  nya värden på plats, utkastet självt orört).

## DOM

**GRÖN EFTER DIFF — FLYTTKLAR med villkoret att paketets tio satser verkställs vid
publiceringstillfället.** Kärnan (källor, serier, aritmetik, rang, juridik, 911, länkar,
kalender) är seriens Genreferens-klass: identitetsbrottets valutabefriade bevisning och
EV-kedjans extremkvot är metodiskt sunda. Fynden är begränsade (två medianvärde-ytor +
följdytor, en titellängd, en trunkering, en antalsformulering). Publicering = kundens
beslut (R2).

*Kontrollen läser endast — utkast-JSON:n orörd (md5 7f7c6e573ca68f357e7235a40d45eb26
vid kontrolltillfället; se paketets kvitto). Granskaren skriver aldrig andras filer.*
