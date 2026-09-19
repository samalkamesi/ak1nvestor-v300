# V11 — Likviditet (Stabilitet, 6 % vikt)

Underlag till Fas 2-fördjupningen · våg 198 · 2026-09-19
Kursreferens: slug `v11-likviditet` · Modell: AKM1 V11

## 1. Vad indikatorn innebär i praktiken

Likviditeten mäter **luftgapet mellan vad bolaget har inom räckhåll och vad
det måste betala inom ett år**: omsättningstillgångar ÷ kortfristiga
skulder. Kan bolaget betala leverantörer, löner och korta lån som förfaller
— utan att själv tvingas sälja något i hast?

Den klassiska formen är **kvickkvoten**, där varulagret räknas bort eller
ned: i en kris säljs lager långsamt och med rabatt, medan kassa, bank och
kundfordringar är det som är *kvickt* nära pengar. Kvoten 1,0 betyder
jämna svar; 1,5 betyder buffert; 0,7 betyder att korten måste skötas
aktivt varje vecka.

Skillnaden mot grannindikatorerna — tre frågor, tre svar:
- **V10 Skuldsättningsgrad:** hur är strukturen finansierad på lång sikt?
- **V11 Likviditet:** klarar bolaget året som kommer?
- **V19 Kassatäckning:** bränner bolaget kassan — finns nyemissionsrisk?

## 2. Läsa det i en faktisk årsredovisning

1. **Omsättningstillgångar** i balansräkningen: varulager + kundfordringar
   + kassa och bank + kortfristiga placeringar.
2. **Kortfristiga skulder:** leverantörsskulder + kortfristig del av lån +
   obetalda kostnader och skatter. (Posten heter "Kortfristiga skulder och
   övriga förpliktelser" i många svenska redovisningar.)
3. Räkna kvickkvoten: (omsättningstillgångar − varulager) ÷ kortfristiga
   skulder. Kalkylatorns källrad lyder "både åren" — jämför även förra
   året: en stigande kortfristig låneandel är en tidig signal.
4. **Not om kundfordringar:** äldresalden och individuell värdering —
   fordringar som är gamla eller osäkra är inte riktiga pengar.
5. **Förvaltningsberättelsen:** bekräftade kassakreditlinjer — outnyttjad
   kredit är likviditetens andra hälft och står inte i balansräkningen.

## 3. Räkneexempel — övningstal och verkliga strukturer

Universumets datakontrakt saknar balansräkningsdetaljer (därför är V11
osatt i modellen, se sektion 5) — exemplen blir träningsräkning:

**Övningstal A (industribolag, mdr):** kassa 4,2 + kundfordringar 8,1 +
kortfristiga placeringar 1,3 = 13,6; varulager 6,0; kortfristiga skulder
9,8. Kvick = 13,6 ÷ 9,8 = **1,39**. Med lagret (kassakvoten) = 19,6 ÷ 9,8
= 2,0 — skillnaden mellan kvoterna är lagrets andel: 31 %.

**Övningstal B (projektbolag, mdr):** kassa 1,1 + certifierade fordringar
4,9 = 6,0; kortfristiga skulder 8,7. Kvick = **0,69** — men noten visar
att 3,4 av fordringarna är pågående projekt med fakturering vid milstolpar:
gapet är timing, inte förlust. Likviditet läses alltid tillsammans med
noterna.

**Verkliga strukturer att känna igen (kvalitativ läsning):**
- *Dagligvaruhandel* (Axfood-klassen i universumet): kunderna betalar i
  hyllan innan leverantörerna betalas — negativt rörelsekapital är en
  **styrka**, inte en kris.
- *Förskottsmodeller* (prenumerationsaffärer): kassan kommer först,
  kvicken ser god ut även med tunn marginal.

## 4. Kritiskt tänkande — fällor

- **Kvick under 1,0 är inte automatisk nöd** — dagligvaruhandel och
  förskottsaffärer driver den medvetet lågt. Fråga alltid *varför* gapet
  ser ut som det gör.
- **Kvick över 1,0 är inte automatisk hälsa** — svällande, osäkra
  kundfordringar räknas med i nämnarens motpost: notens äldstanalys är
  sanningen, inte balansraden.
- **Säsong och balansdagen:** detaljhandeln efter julhelgen har kassatopp;
  projektbolag före milstolpe har botten. En dag gör inte ett år.
- **Banker och finansbolag:** deras balansräkning är in- och utlåning —
  kvickkvoten är meningslös där (samma undantag som V10).
- **IFRS 16:** leasingåtaganden finns bland de kortfristiga skulderna —
  butiks- och flygbolag ser trängre ut än före 2019.

## 5. Koppling till AKM1 — modellens läge

V11 bär **6 % vikt** i kategorin Stabilitet. Kärnan (karna.ts rad 304)
dokumenterar sitt eget val: *"V11 Likviditet (kvickkvot) — saknas i
datakontraktet: osatt"* — `scorV11()` lämnar osatt eftersom universumets
datafält inte bär balansräkningsdetaljer. Poängsättningen är **manuell**:
 läs balansräkningen och sätt poängen själv.

Förslagstrappa vid manuell poängsättning (ett resonemangsmönster att
utgå ifrån — inte modellens kod): kvick ≥ 2,0 ⇒ 5 · 1,5–2,0 ⇒ 4 ·
1,0–1,5 ⇒ 3 · 0,5–1,0 ⇒ 2 · < 0,5 ⇒ 1 — och justera för branschens
arbetskapitalstruktur (handel vs projekt) innan poängen sätts.

Syskopplingen: V10 äger den långsiktiga strukturen, V19 äger
varningslampan — V11 är skillnaden mellan att överleva ett halvår och att
bara se bra ut på pappret.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd (2007:528).*
