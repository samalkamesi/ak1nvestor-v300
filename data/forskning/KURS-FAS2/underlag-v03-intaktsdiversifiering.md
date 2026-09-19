# V03 — Intäktsdiversifiering (Tillväxt, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 192 · 2026-09-18
Kursreferens: slug `v03-intaktsdiversifiering` · Modell: AKM1 V03

## 1. Vad indikatorn innebär i praktiken

Intäktsdiversifiering matar på frågan: **om EN kund, EN produkt eller EN
marknad försvinner — hur stor del av intäkterna står kvar?** Ett bolag med
tusen kunder i tio branscher på fyra kontinenter har en helt annan
motståndskraft än ett bolag vars tre största kunder bär halva omsättningen.

Det är tillväxtkategorins försäkring: diversifierade intäkter gör tillväxten
mer hållbar (V01) och återkommande strukturerna mer pålitliga (V02).
Koncentration är inte alltid fel — ett nischbolag KAN vara excellent — men
risken är annan, och modellen ska se den.

## 2. Läsa det i en faktisk årsredovisning

1. **Segmentnoten** (i svenska årsredovisningar ofta not med "Segment" i
   titeln): verksamhetsgrenar med intäkter per segment — börja där.
2. **Geografinot** (ofta intill): intäkter per land/region — svensk andel
   vs utlandet.
3. **Storkundsnot / kundkoncentration**: vissa branscher (försvar,
   underleverantörer, plattformar) redovisar "största kund andel av
   intäkterna" eller "fem största kunderna" — det är V03:s viktigaste rad.
4. **Produktgruppsuppdelning** i intäktsnoten eller förvaltningsberättelsens
   avsnitt per affärsområde.
5. Tänk: **diversifiering på tre axlar** — kunder, produkter, geografier.
   En axel kan vara koncentrerad utan att bolaget är det (om de andra bär).

## 3. Räkneexempel på riktiga bolag (ur universumets 195)

Universumets data visar strukturen indirekt — segmentdata finns i
redovisningarna, inte i datasettet; det är läsövningens poäng. Vad datasettet
VISAR är kontrasten i affärsmodell:

- **Ericsson** (ERIC-B.ST): omsättningstillväxt TTM −6,1 % men bred
  struktur — nätverk/molnprogramvara/företagstjänster över samtliga
  världsdelar. En svag region eller kund kan inte fälla helheten.
  Bruttomarginal 48,1 %, P/B 3,1.
- **Kambi** (KAMBI.ST): en plattform (sportsbook-motor), ett begränsat
  antal operatörskunder — hög koncentration på båda axlarna. Samma bransch-
  etikett ("teknik") som Ericsson men helt annan riskform. Bruttomarginal
  98,9 % (rena mjukvaruintäkter), P/B 29,2 — marknaden betalar för
  kontraktskassan, koncentrationen är motvikten.
- **Atlas Copco** (ATCO-A.ST): fyra affärsområden, globalt, tusentals
  distributörer — omsättning 168 mdr SEK med ingen enskild kund i närheten
  av dominans (redovisar koncentration under tröskeln).

**Räkneövning med storkundsnot (princip):** största kund 28 % av intäkterna
→ koncentrationsmått 28 % (hög). Fem största 55 % → mycket hög. Jämför:
även en "bredd" på 40 länder kan dölja att 60 % av intäkterna egentligen
är beroende av två slutkunder i värdekedjan — läs kundnot OCH geografinot
tillsammans, aldrig var för sig.

## 4. Kritiskt tänkande — fällor

- **Korrelerade segment.** Fyra segment som alla säljer till samma
  slutmarknad (t.ex. biltillverkare) diversifierar inte — de svänger
  tillsammans. Fråga: vem betalar i slutändan, i varje segment?
- **Diversifiering genom uppköp.** åtta produktlinjer från åtta förvärv kan
  vara åtta separata integrationsrisker snarare än balans. Förvärvshistoriken i
  förvaltningsberättelsen avgör.
- **Storkundsnotens tröskeldämpning.** Många bolag redovisar koncentration
  bara om den överstiger t.ex. 10 % — "inget att redovisa" betyder inte
  "fin fördelning", bara "under tröskeln". (Utbildningsexempel på att läsa
  vad en NOT INTE säger.)
- **Geografisk redovisning efter faktureringsland.** Irland/Luxemburg-
  bolag kan visa "Irland 40 %" som är skattevägar, inte kunder — notens
  fotnot om hur geografi mäts är avgörande.
- **Kambi-paradoxen:** hög koncentration kan vara en medveten strategi
  (få, djupa partnerskap) med stark kontraktsbindning — indikatorn mäter
  riskform, inte kvalitet. Poängen ska tolkas ihop med kassaflöde och
  avtalstyper, aldrig ensam.

## 5. Koppling till AKM1 — riktlinje vid manuell poängsättning

Källan är kvalitativ (segmentnot + storkundsnot, 6 % vikt). Kärnans
`scorV03` är osatt i kod — tabellen är utbildningens riktlinje:

| Intäktsstruktur | Poäng |
|---|---|
| Bred på ≥ 2 axlar (kunder, produkter, länder) utan dominans | 5 |
| Bred på en axel, måttlig på en till | 4 |
| Medelkoncentration (största kund/produkt 15–25 %) | 3 |
| Hög koncentration på en axel (>25 %) | 2 |
| Extrem koncentration (en kund/produkt bär helheten) | 1 |

Universumexempel: Atlas Copco → 5 p-landskapet · Ericsson → 4 p ·
Kambi → 2 p (kundaxeln, trots produktens styrka). Dokumentera vilken not
som bar poängen — spårbarhet är del av utbildningen.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
