# Språkexpert C — manuell granskning + rättningar, batch C (kurser 168–252)

**Datum:** 2026-09-03 · **Pass:** 1 av 2 · **Fil:** `public/deep-courses.json`
**Omfattning:** 84 kurser (`pf-07`–`pf-14`, `poor-charlies-almanack`, `portfolj-ekosystemet`, `principles-of-corporate-finance`, `quality-of-earnings`, `quantitative-value`, `reminiscences-of-a-stock-operator`, `rk-01`–`rk-15`, `se-01`–`se-15`, `security-analysis`, `shoe-dog`, `sj-01`–`sj-05`, `stocks-for-the-long-run`, `tanka-snabbt-och-langsamt`, `technical-analysis-financial-markets`, `technical-analysis-of-stock-trends`, `teknisk-analys-med-johnny-torssell`, `the-*` ×27).

## Metod
- Fullständig genomläsning av title/summary/learn/why/history/lynch/graham/ak1-sektioner + 3 slumpvalda kapitel (seedat urval: kap 1, mitten, sista) per kurs = dump på ~5 150 rader.
- Därefter riktad sökning över **hela** kursobjekt (alla kapitel, även ej samplade) för varje identifierat felmönster — därför fångades även instanser i osamplade kapitel.
- Kirurgiska node-replacement (exakta strängar med kontext, verifierat träffantal per kurs); tre passer + en residualpass. Logg: `data/fixC-log.txt`, skript `data/fixC.js`, `data/fixC2.js`, `data/fixC3.js`.
- **Verifikation:** JSON parsar OK · **333 kurser** (oförändrat) · 84 i batch C · `chapters.length === chapterCount` för alla 84 · inga kända felmönster kvar vid slusskanning.

## Omfattning: 996 ersättningar
Pass 1: 875 (516 rättningsrader) · Pass 2: 11 · Swing-tilläggs: 2 · Pass 3 (globala residualer): 107 · Slutpass: 1.

## Rättningar per kategori (urval)

### 1. Maskinspår — ogiltiga ord nära giltiga
- verb-degenerering: `utspäddar→utspäder` (pf-09 ×2, little-book-of-value, master-swing), `skär→skärps`, `lette→leta`, `hanera→hantera`, `bedra→bedraga`, `utlöka→utlösa`, `lönär→lönar` (×8), `lönär sig→lönar sig`
- `läg→lag` systematiskt (10+ instanser): *Moore's läg*, *Newtons första läg*, *obligationslärans första läg*, *inte en läg utan undantag*, *Kassacykelns läg*, *Kursens återkommande läg*, *överraskningens läg*
- `ända→ände/ände`: *Chicago-skolans ända*, *bokens ända→bokens ände* (×14), *Mittensjö→Mittenvägen*
- böjningsgarblering: `överstigenande kapitaalkostnaden→överstigande kapitalkostnaden`, `möjliggör→möjliggjort`, `fluktuation→fluktuera`, `viktar med→viktas med`, `konsekrent→konsekvent`, `efterföllda→efterföljande`, `finansierer→finansierar`, `skaper→skapar`, `tillverkommer→tillverkar`, `bygggs→byggs`, `arbeta→arbetar`, `börjad→började`, `följer…(tvingas) förlöpå värde→förlora värde`, `försäkringingar→säkerhetskrav`
- sammansatta ord sönderfallna: `kapitaalkostnaden`, `skuldenedskrivningar→skuldnedskrivningar`, `tillväckstaktorer→tillväxtfaktorer`, `exponeringsiffror→exponeringssiffror`, `heltäcknde→heltäckande`, `värdeaddedtjänster→värdeadderade tjänster`, `prenumerationstjänist→prenumerationstjänst`, `infrastrakturfonder→infrastrukturfonder`, `markader→marknader`, `marknstress→marknadsstress`, `speltilverkare→speltillverkare`, `tiominutarestetet→tiominutestestet`, `stressresponen→stressresponsen`, `datadriviena/datadriverna→datadrivna`, `röstavakt→röstvärde`, `kapanskaffning→kapitalanskaffning`, `industricolag→industribolag`, `konjunktrötslag→konjunkturbotten`, `svanhandsrisken→svanrisken`, `rånoträffen→ränteträffen`, `risshanteringen→riskhanteringen`, `falsiska→falska`, `skytt(a→öt)t`, `sanningsen→sanningen`, `utbuds zon→utbudszon`, `reträment→retracement`, `multiplel(nivå)→multipel(nivå)`, `kostamma→kostsamma`, `transktion→transaktion`, `realisares→realiseras`, `protokol→protokoll`, `protokoll`
- åäö-degenerering: `åndning→andning` (×5), `underliggende→underliggande`, `aktiedepö→aktiedepå` (×4), `närliggande`, `äfven`-typ: `dyggs varsel→dygns varsel`, `Genöm→Genom`
- övriga garbleringar: `undvka→undvika`, `underliggaande→underliggande`, `oavett→oavsett`, `potentiavinsten→potentialvinsten`, `förmiga→förmåga till`, `värnesätt→värdesätt`, `lönsammarkant→lönsamhet markant`, `medskapacitet→lastkapacitet`, `heltäcknde`, `kärnekvitet` (se Osäkert), `förvarningsmönstret→varningsmönstret`, `kurvartik→kurvighet` (×7), `broott→brott`, `LÅGPLUNKTERNA→LÅGPUNKTERNA`, `böckvärdets→bokvärdets`, `formulierad→formulerad`, `sovohl`
- **kritiskt AI-spoläge:** kinesiska tecken i svensk mening — `identifiera潜在的 sårbarheter→identifiera potentiella sårbarheter` (rk-09, kap 6)

### 2. Engelska läckor (ej termer/titlar)
- `varför detta matters→varför detta är viktigt` (kapiteltitel, 20 kurser × 2 fält)
- `panik eller opportunity?→panik eller möjlighet?` (pf-07 summary+learn)
- `En systematisk approach→Ett systematiskt angreppssätt` (malltext ×~90) + `psykologisk/proaktiv/disciplinerad approach` (×3)
- `insidious→förrädisk`, `knivs edge→knivsegg`, `within→inom`, `coordination→koordinering`, `small size→liten storlek`, `Sweden→Sverige` (×2), `contraction→kontraktion` (×9), `operational→operativ` (×3), `elite glov→elitgolv`, `Valuesidans→värdesidans`
- `swing:trade:r/-a→swing-tradar/-a` (×15)

### 3. Grammatik: genus, kongruens, sin/sitt, ordföljd, särskrivning
- `en plötslig kursfall→ett plötsligt kursfall`, `Ett tidigt varningsflagg→En tidig varningsflagga`, `En finansiell nyckeltal→Ett finansiellt nyckeltal (…beräknad→beräknat)`, `en strategisk initiativ→ett strategiskt initiativ`, `En mästarteam→Ett mästarteam`, `En system eller struktur→Ett system…`, `en striktare krav→ett striktare krav`, `en enda dominerande narrativ eller ett geografiskt koncentration→ett … eller en geografisk koncentration`, `en prispåslag→ett prispåslag`, `en flexibel ramverk→ett flexibelt ramverk`, `en aktiebolags→ett aktiebolags`, `i en … regulatorisk landskap→i ett … regulatoriskt landskap`, `det kortaste rören→röret`, `att bygga en…→ett…`, `en heltäckande…`-familjen, `beräknad→beräknat`, `extremt händelser→extrema`, `En extrem snabb→extremt`, `det kortaste`, `hög belåtade kassaflöden känns→hos högt belånade bolag känns`
- kongruens: `Sanna mästerskap→Sant mästerskap` (×12), `är lyxsektorn drivet→driven`, `Marknader är driven→drivs`, `driven av en kombination→drivna`, `uppätet→uppätna`, `en medvetet→medveten`, `hundrårig→hundraårig`, `en gens.`: `förlustande optioner→optioner med förlust`
- sin/sitt & reflexiver: `sin risklandskap→sitt` (×2), `deras riskaptit→sin`, `sitt kassa- och bankmedel→sina`, `sin kundfordringar→sina`, `sin närvarans→närvaro`, `anpassas sig→anpassa sig`
- ordföljd: `En likviditetskris sällan kommer→kommer sällan`, `för en analytiker sällan finns→finns sällan`, `han aldrig tar illa upp→tar aldrig`, `som är inte bara robusta→inte bara är robusta`, `De alltid är dyra→De är alltid dyra`, `Association bara fungerar→fungerar bara`, `hur uppstår dem→hur de uppstår`, `den som inte spelar tajmingsspelet inte heller kan förlora→kan inte heller förlora`, `till proaktivt att designa→till att proaktivt designa`
- särskrivning: `30-dagars regeln→30-dagarsregeln`, `kassa buffert→kassabuffert`, `tillväxt potential→tillväxtpotential`, `aktieanalytiker missförstod` (versal), `finans Historiens→finanshistoriens`, `KursenDifferentierar→Kursen differentierar`, `kassaflödetavgör→kassaflödet avgör`, `prisMÅL→prismål`, `ärCombo→är Combo`, `egetkonto→eget konto`, `top-down betyg→top-down-betyg`, `AK1A:motorerna→AK1A-motorerna`, `värdeinvesterings hantverk→värdeinvesteringshantverket` (×2), `avgifts-minsräkning` (redan rättad av annan), `NPV tänkandet→NPV-tänkandet`, `options tänkandes grund→… optionstänkandets grund`
- dubbelord: `att att` (×14), `dolda och medvetet dolda→osynliga och…`, `enklare, billigare, mindre, enklare→…bekvämare`, `gammalt, tre hundra år gammalt` (lämnat, stilfigur)
- avkapade/brutna meningar: `som ett genererar→som ett företag genererar`, `Dessutom bör analysera→bör man analysera`, `får en mer realistisk bild→får man…`, `Banken Lehman Brothers kollaps [i sept 2008 efter att misslyckats]→kollapsade … efter att ha misslyckats`, `för den som först underliggande drivkrafter→för den som förstår de underliggande drivkrafterna`, `sträcker långt bortom→sträcker sig`, `I en tid ökade→I en tid med ökade`, `börjar inse hur läget faktiskt är exceptionellt` (lämnad), `Köper aktien vid brytpunkten uppåt→Bryts aktien uppåt vid brytpunkten`, `med den kassa tillväxten själv genererar→…kassa som tillväxten…`, `Dessa tre formationer… ur bokens ända`, `utmaningar. [lågcase-fragment] bidrog till vår förståelse` (pf-09/pf-14/se-06: originfragment gjorda till meningar)

### 4. Stavfel & versalisering
- `Esg→ESG` (×24+), `roa/roe/ebitda/p/e/arr→ROA/ROE/EBITDA/P/E/ARR` i quiz-tips (×~250), `nobelpristagare→Nobelpristagare`, `AK1M→AKM1` (×5), `VD:är→VD:ar` (×4), `Detailhandel→Detaljhandel` (×11), `Reglering kom→reglering`, `Aktieanalytiker→aktieanalytiker`, `kontant Insats→insats`, `breakouten Är→är`, `Annars→annars`
- `Garanttera→Garantera`, `Säga mörkaste kapitel→Sagans…`, `Genöm→Genom`, `bestömde→bestämde`, `dyggs→dygns`, `rese…` osv. enligt ovan

## Osäkra fall (rättade med omdöme — för pass 2 att granska)
`konjunktrötslag→konjunkturbotten` · `svanhandsrisken→svanrisken` · `försäkringingar→säkerhetskrav` (margin-call-kontext) · `elitglov→elitgolv` · `kurvartik→kurvighet(er)` (Greenblatt-kontext: svårt kurvande) · `folkdom→folksport` · `tvinar→tunnas ut` · `notoriteterna→resultaten` (Gotham Capital) · `virtuell cirkel→självförstärkande cirkel` · `värnesätt→värdesätt` · `förmiga tolkning→förmåga till tolkning` · `Bryts aktien uppåt…` (omskrivning av bruten konditional) · `övergiven av sin lärare→i lära hos sin lärare` · `fick en vers→fick revansch` · `det mekaniska sållar→sållet` · `tidscykeln→tajma cykeln` · `diskontant→rabatt` · `Värdesidans` · `balansens sida→balanssidan` · `Kelly-ärftet→Kelly-arvet` · `sannolika→osannolika` (rk-10, tail risk per definition osannolika) · `mångårige→mangeårige` · `medskapacitet→lastkapacitet` (fartyg) · `spannmålen vischar→piskar` · `Svansar du vinner→Svansar vinner du` · `Sant mästerskap` (singularistolkning) · `blockerar`-fällor kontrollerade (falska positiva).

## Medvetet lämnade (ej fel)
Konsekvent kursjargon/termer: `vågör`, `prickbubblor`, `kärnekvitet` (26 instanser — kursens term för "core equity"; pass 2 kan överväga `kärnkapital`), `cortisol`, `orderbook`, `bench`, `dis`, `kontratida`, `stop-loss` m.fl. Engelska boktitlar/citat orörda. Faktafel (ej språk): Ericsson-"rättegång" (rk-02), PostNord "börsades 2008" (se-04), "skattefria kapitalvinster >1 år" (pf-08), Spotify/Google-böter eur/kr (rk-13) — flaggas för innehållspass.

## Tredje värst (rekommendation)
1. **rk-09 kap 6:** kinesiska tecken mitt i svensk löptext — `identifiera潜在的 sårvarheter` (ögonlyft fixat till `potentiella sårbarheter`).
2. **Systematiskt `läg→lag`-fel** i elva varianter (`Moore's läg`, `Newtons första läg`, `bokens ända`-familjen ×14) — maskinellt avtryck i tryckt kärnmaterial, inkl. quiz och tabellrubriker.
3. **Ogiltiga ord i UI-synliga summaries/titlar:** `sälj låg, köj hög` (pf-12), `Emissioner utspäddar` (rk-02), `panik eller opportunity?` (pf-07) och kapiteltiteln `varför detta matters` i 20 kurser.

## Noteringar till coordinator
- Filen skrevs om (kompakt → pretty 2-space) av annan batch-agent under passet; jag detekterar och bevarar aktuellt format + avslutande NL vid varje skrivning. Race-risk kvarstår om flera agenter skriver samtidigt — rekommendera skrivserialisering mellan batch-passen.
- Mallfel som sannolikt finns även i batch A/B/D: `definitionen av roa/roe` (gemener), `varför detta matters`, `En systematisk approach`, `Sekorns utveckling`, `att att`, `från svenska börsen`, `AK1M`, `Sanna mästerskap`, `köj/utspäddar/löpå/läg`-familjen.
- Strukturavvikelse (ej språk, orörd): 9 kurser har kapitel med <2 quizfrågor (rk-02, rk-11, rk-14, se-02, se-03, se-04, se-05, sj-03, sj-04) — originaldata.
