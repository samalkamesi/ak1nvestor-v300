# F15 — Torssell: teknisk analys med regler

Underlag till Fas 3-kursbygget · v164 (agentfabrik) · 2026-09-24
Kursreferens: slug `teknisk-analys-med-johnny-torssell` · Fas 3 — den svenska regelboken

## 1. Kärnan — det svenska standardverket: regler i stället för tyckande

Johnny Torssells *Teknisk analys — en översiktlig handbok* är det svenska
standardverket i ämnet, i flera uppdaterade upplagor sedan 1990-talet. Dess
tes är kursens röda tråd: teknisk analys blir hantverk att lita på först när
den görs **kvantitativ** — varje verktyg ska ha en entydig definition, en
mätmetod och ett svar som inte beror av läsarens humör.

- **Samma graf, samma slutsats.** En trendlinje, en formation, ett utbrott
  ska kunna mätas så att två oberoende läsare får samma resultat. Det som
  inte kan mätas kan inte granskas — och därmed inte läras ut.
- **Priset är utbud och efterfrågan i ett.** Kursen sammanfattar alla
  deltagares sammanvägda handlande; uppgiften är att läsa avtrycket, inte
  att gissa bakom det.
- **Trender består tills de är brutna** — och brottet ska vara mätt och
  bekräftat, inte bara känt.

Verket täcker verktygen (trendlinjer, stöd och motstånd, formationer,
glidande medelvärden, oscillatorer) men håller fast vid att verktygen är
mindre viktiga än **disciplinen i definitionerna**. Det är detta kursen
lyfter: reglerna är budskapet.

## 2. Praktisk läsning — att mäta trend och kanaler

Torssells hantverk i arbetsordning:

1. **Trenden först.** Uppåtgående trend = stigande bottnar; nedåtgående =
   sjunkande toppar. Trendlinjen dras genom bottnarna (uppåt) respektive
   topparna (nedåt) och ska beröra minst två punkter — tre ger säkrare
   fäste.
2. **Kanalen.** En parallell linje på motsidan av trendlinjen bildar en
   kanal: kursen pendlar mellan väggarna så länge trenden lever. Kanalen
   gör pendlingen mätbar i stället för "den verkar gå upp och ner".
3. **Allt i procent.** Kanalens bredd, avstånd till ett motstånd, storleken
   på ett utbrott uttrycks i procent av kursnivån — aldrig i ögonmått.
   Procent gör mätningen jämförbar mellan en aktie på 20 kr och en på
   500 kr.
4. **Bekräftelse.** Ett brott gäller först när (a) slutkursen — inte
   dagsinträdet — hamnar rätt om linjen och (b) brottet är tillräckligt
   stort i procent för att skilja verklig rörelse från brus. Kursen
   använder 3 % som övningsvärde på tröskeln; poängen är att tröskeln är
   fast och satt i förväg, inte dess exakta värde.

## 3. Räkneexempel — kanalbredd och utbrott i procent på svensk kursdata

Talunderlag (källmärkt): `data/analyses/ERIC-B.ST.json` — Ericsson B,
AK1A Analysis Engine, källa Yahoo Finance, analys 2026-08-24. Nivåer:
52-veckors högsta 128,45 kr, lägst 65,94 kr; MA 50 = 101,43 kr;
MA 200 = 101,78 kr. Genomgången är en kursräkning på nivåerna — ingen
bedömning av aktien.

- **Kanalbredd (årsbandet).** Bredd = (128,45 − 65,94) ÷ 65,94 = 62,51 ÷
  65,94 ≈ **94,8 %** av botten. Relativt bandets mittpunkt ((128,45 +
  65,94) ÷ 2 = 97,20) är samma bredd 62,51 ÷ 97,20 ≈ **64,3 %**. Samma
  band, två räknesätt — kursen lär att alltid ange vilket som används.
- **Linjer som ser likadana ut.** MA 50 och MA 200 ligger 101,78 − 101,43
  = 0,35 kr isär; 0,35 ÷ 101,43 ≈ **0,3 %**. I grafen sammanfaller de
  nästan — i procent syns att avståndet är litet. Det är hela poängen
  med att mäta.
- **Utbrottstest (antagna övningskurser).** En slutkurs på 130,00 kr mot
  toppnivån ger (130,00 − 128,45) ÷ 128,45 ≈ **1,2 %** — under
  3 %-tröskeln: inget bekräftat brott. En nästföljande slutkurs på
  132,50 ger (132,50 − 128,45) ÷ 128,45 ≈ **3,2 %** — över tröskeln:
  bekräftat enligt regeln. Skillnaden mellan brus och brott sitter i en
  subtraktion och en division, inte i känslan.

## 4. Fallgropar

- **Regler utan förståelse.** Att mekaniskt räkna 3 % utan att förstå vad
  tröskeln skyddar mot (brus, tillfälliga stick) ger falsk precision.
  Regeln är ett stöd för omdömet, inte en ersättning.
- **Att blanda system.** Olika böcker definierar utbrott olika (slutkurs
  mot dagskurs, olika trösklar). Den som plockar en definition här och en
  där får signaler som inte kan jämföras — och kan inte heller lära av
  sina egna träffar och missar. Välj ett definitionsverk och håll det.
- **Omritning efteråt.** En trendlinje som flyttas varje gång kursen bryter
  den kan aldrig ha brutits — regeln tappar sitt värde. Kravet på i
  förväg satta regler är just skyddet mot detta.
- **Procent utan kontext.** 3 % betyder olika i en trång kanal och ett
  brett årsband (jmf 94,8 % ovan), i lugn och i orolig marknad. Måttet
  ska läsas mot sin egen referensram.

## 5. Koppling till ekosystemet

Torssell är den svenska grunden i Fas 3:s bokspår: där Murphy (F06) och
DeMark (F17) bygger system på samma idé, visar Torssell hur den ser ut på
svenska bolag och index — samma universum som plattformens analyser.
Repets analysmotor producerar redan datastyrda nivåer (MA 50/200,
52-veckorsbandet) i tal — exakt Torssells anda: nivåer i siffror, inte
tyckande — och kursens räkneövningar återanvänder samma datafiler. Den
kvantitativa kulturen är också AKM2:s: entydiga regler som kan loggas,
granskas och rättas gör lärandet testbart, och i AI-Mentorn kan eleven
jämföra sin egen kanalmätning mot modellens. Kursen övar vad plattformen
gör: att läsa svenska grafer med måttband, inte med magkänsla.

*Utbildningsmaterial — beskriver hur metoden mäter och räknar; inga
investeringsråd, inga avkastningslöften (2007:528).*
