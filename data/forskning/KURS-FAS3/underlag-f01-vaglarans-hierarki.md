# F01 — Våglärans hierarki (AK1TS-flaggskeppet)

Underlag till Fas 3-djupet · våg 164 · 2026-09-24
Kursreferens: slug `ak1ts-vaglarans-hierarki` · Position: första kursen i Fas 3 — hierarkin är språket övriga kurser bygger på

## 1. Vad kursens kärna innebär i praktiken

Kursen handlar om en enda idé: **en prisrörelse är aldrig självförklarande — den
får sin betydelse av sin plats i en större rörelse.** Våghierarkin (gradtanken)
säger att kurser rör sig i svängar på många skalor samtidigt: en liten sväng
ingår i en medelstor, som ingår i en stor, som ingår i en ännu större. Ekosystemet
ger graderna namn — **mikro, kort, medellång, lång, mega** — fem nivåer av
sammanhang.

Praktisk skillnad: utan hierarkin frågar läsaren "steg kursen eller föll den?".
Med hierarkin frågar läsaren "är denna nedgång en hel egen rörelse, eller bara
en andel av den föregående uppgången?". Det andra är ett mycket starkare
frågeverktyg, mätbart i procent — därav kursens räknefokus.
Kursen är ingen bokrecension — den lär ut **metoden att gradera**.

## 2. Läsa det på en faktisk graf — från rå kurva till gradering

Steg-för-steg, samma ordning varje gång (regelbundet förfarande är poängen):

1. **Zooma ut först.** Öppna månadsgraf och notera den större bilden: var står
   kursen i det fleråriga spelet? Gradera aldrig först på den vyn du råkar ha.
2. **Välj ETT tidspann** för huvudläsningen (i exemplet nedan: dagavslut, trender
   på veckobasis) och förklara valet. Blanda inte vyer mitt i läsningen.
3. **Markera yttersvängarna**: senaste betydande botten och topp — de två
   priser som ramar in det du ska gradera.
4. **Dela upp rörelsen** mellan dem: svängar med trenden kallas impulsvågor
   (konventionellt fem), svängar mot trenden korrigeringar (tre). Räkningen
   börjar alltid i en ändpunkt, inte mitt i en sväng.
5. **Mät varje sväng i kronor och procent** och skriv datumet vid varje märke —
   ett märke utan datum är en åsikt, med datum är det ett dataexpanderbart påstående.
6. **Gradera neråt**: titta inside en av vågorna — finns där en mindre
   femsvängsstruktur? Då har du bevis för nästa lägre grad.
7. **Etikettera pågående vågor som hypotes**, avslutade som fakta. Notera i
   marginalen vilka observationer som skulle ändra läsningen.

## 3. Räkneexempel — Volvo B, covidbotten till 2021-topp (källmärkt)

Verkliga dagavslut, Volvo B (VOLV-B.ST), källa Yahoo Finance, hämtat 2026-09-24.
Så här ser metoden ut när den tillämpas — inte en rekommendation, en övning.

| Märke | Datum | Dagavslut | Uträkning |
|---|---|---|---|
| Botten | 2020-03-18 | 97,46 kr | — |
| Våg 1 topp | 2020-06-05 | 153,00 kr | +55,54 kr (+57,0 %) |
| Våg 2 botten | 2020-06-11 | 136,20 kr | −16,80 kr = **30,3 % retraktion** |
| Våg 3 topp | 2020-11-24 | 203,30 kr | +67,10 kr = **1,21 × våg 1** |
| Våg 4 botten | 2020-12-07 | 193,15 kr | −10,15 kr = **15,1 % retraktion** |
| Våg 5 topp | 2021-03-12 | 237,50 kr | +44,35 kr = **0,80 × våg 1** |

Läsningen: våg 2 gav tillbaka 30,3 % av våg 1 och våg 4 bara 15,1 % av våg 3 —
båda grunda, vilket är vanligt i starka trender. Våg 5 blev 0,80 × våg 1
(referens: ≈1,0 × våg 1 eller 0,618 × våg 3 — här 0,66 × våg 3, inne i zonen). En strukturregel kontrolleras alltid: våg 4:s botten
(193,15) fick aldrig hamna under våg 1:s topp (153,00) — den gjorde det inte,
strukturen håller som femvåg. Hela svepet: 97,46 → 237,50 kr = +143,7 % på
knappt tolvmånaders handel.

**Hierarkiska lyftet:** byt till månadsgraf — hela femvågssvepet ovan är där
EN enda uppåtsväng i det större spelet, följd av nedgången till 148,20 kr
(månadslåg april 2022, −37,6 % från toppen). Samma kurva, två grader, två
olika sanningar om vad som hände. Det är kursens kärna i ett enda exempel.

## 4. Fallgropar

- **Subjektiv gradering.** Två läsare kan rita två strukturer i samma kurva.
   Skyddet är förfarandet: fasta steg, mätta procent, dokumenterade datum —
   och att alltid redovisa det som skulle förändra läsningen.
- **Räkna vågor efteråt.** I efterhand passar allt — därför är retroaktiva
   räkningar värdelösa som bevis. Metoden är ett beskrivnings- och
   hypotesverktyg, inte en spådomsmaskin; kursen tränar att skilja dem.
- **Blanda tidsramar.** Dagssvängar räknade in i en veckostruktur ger
   graderingsförvirring (en "våg 4" på fel nivå). Lösning: steg 2 ovan —
   ett huvudtidspann, medvetna byten, aldrig automatik.
- **Sifferjakt.** Att prova Fibonacci-kombinationer tills en passar är inte
   analys utan kurvanpassning. Zoner (38,2/50/61,8 %), inte linjer.

## 5. Koppling till AK1A-ekosystemet

Fas 2 läste varje fundamental variabel (V01–V20) som ett värde i en
årsredovisning. Fas 3 gör om varje variabel till en **tidsserie som graderas
i samma fem nivåer**. Det lever redan i vågfundament-cachen
(`data/cache/vagfundament-VOLV_B_ST.json`, per 2026-06-30): varje V-indikator
bärs av mikro/kort/medellång/lång/mega med etiketterna impulsvåg (16 av 100
celler), basbygge (17) och korrigering (8) — resten osatt, för fundamentalserier
från Yahoo sträcker sig cirka fyra år. Volvos intäktsrad är exemplet: Fas 2
läste "+16,6 % 2023"; Fas 3 läser svängen +16,6 → −4,6 → −9,0 % som en
medellång korrigering i vad som kan vara en längre våg. V01–V20 blir därmed
samma typ av graderbara serier som priset — och kurs F03 (Konfluens) visar hur
de två världarna vägs samman. Fasprogressionen är verbprogression: Fas 1 beskriver,
Fas 2 analyserar, Fas 3 integrerar.

*Utbildningsmaterial — beskriver hur metoden läser och räknar; inga
investeringsråd, inga avkastningslöften (2007:528). Kurskurser är historiska
källmärkta exempel.*
