# DASHBOARD 1000X + REDOVISNINGSPLATTFORM — Forskningsunderlag

**Datum:** 2026-09-01 · **Metod:** Strukturerad webbforskning (state-of-the-art inom finansiella dashboards, NL-frågegränssnitt utan LLM, morgon-briefing-mönster, dashboard-informationsarkitektur) + kodgranskning av nuvarande /min-sida (`src/components/ak1a/min-sida.tsx`, `vecko-plan.tsx`, `kurstips-kort.tsx`, `vagkarta-kort.tsx`, `src/lib/member-local.ts`, `veckoplan.ts`, `kurstips.ts`, `spaced-repetition.ts`, `navigationsminne.ts`, `superanalys.ts`, `kommandopalett.tsx`) · **Syfte:** Designunderlag för nästa steg på Min Sida — "Fråga din dashboard" (deterministisk intent-parser), morgon-briefing, rullande 7-dagarsvy, mål-progression — samt rapport-byggaren (redovisningsplattformen där eleven samlar analyser/kurser/vågdata till formatterad rapport).

**Kärnslutsats ( hela rapporten stödjer detta):** De bästa plattformarna (Koyfin, Simply Wall St, TIKR) vinner inte på *mer* data utan på tre saker: (1) en 5-sekunders-överblick överst, (2) deterministiska frågevägar ner i detaljen, (3) en daglig ritual som gör återkomsten värdefull. AK1A har redan de intelligenta motorerna (veckoplan, kurstips, vågkarta, SM-2, navigationsminne) men de är *visnings-ytor*, inte *fråge-ytor*. 1000x-steget är att låta eleven ställa frågor till sina egna data — med en grammatikbaserad intent-parser (Tableau Ask Data-modellen), helt utan LLM, helt ur localStorage.

> **Ärlighetsdeklaration:** Uppdraget nämnde "(koyfin/morningmarketchat?)" som exempel på query-your-portfolio-lösningar. **"Morningmarketchat" kunde INTE verifieras** — ingen finansprodukt med det namnet finns indexerad (träffar är fastighetsvideor på Instagram och en generisk SDK-blogg). Koyfin har heller ingen NL-frågefunktion för privatpersoner. Den verkliga, verifierade state-of-the-art för "fråga din data utan ren LLM" är BI-världens grammatikbaserade NLI:er — **Tableau Ask Data** (semantisk grammatik + intermediärspråket Arklang), **Power BI Q&A** och Microsoft Research **DataTone** — dokumenterade i §3. Alla övriga källor är verifierade med URL.

---

## 1. NULÄGE — Min Sida idag (kodgranskning)

**Vad som finns (ordning på sidan):** (a) hero-rad nivå/XP/streak/stjärnor → (a2) välfärdspanelen (kunskapsväxt-kurva, vanan-streak, tryggheten-V01–V20) → elevkärnan → (a3) veckoplanen → (a5) dagens vågkarta → (a4) kurstips → (b) läroplans-progress med 8 nyckelkurser → (c) badges/flashcards/certifikat → (d) verktygsgatan → (e) topplista.

**Styrkor (redan i toppklass):**
- **Deterministiska personliga motorer:** `raknaVeckoPlan()` (vecko-hashad variation, XP-adapterad tidsbudget, navigationsminne-prioritering), `raknaKurstips()` (4 källor i prioritetsordning), SM-2-statistik, `besok()`-mönsterigenkänning. Allt lokaldata, allt hydration-säkert.
- **Progressive disclosure finns redan i embryot:** välfärdspanelen visar *en* punkt per tema; detaljen bor i underliggande sidor.
- **Ton:** alltid uppmuntrande, "aldrig du ligger efter" — matchar Duolingos habit-forskning (§4).

**Luckor (var 1000x-steget tar vid):**
1. **Allt är vy, inget är dialog.** Elevens enda sätt att nå sin data är att *läsa panelerna i sidans ordning*. Det finns ingen väg att *fråga* "hur går det med mig just nu?" — trots att alla svar redan finns i localStorage.
2. **Ingen tidsdimension.** Dashboarden visar nuläge (streak=7, XP=1240) men ingen historik — ingen rullande 7-dagarsvy, ingen progression mot mål över tid. `ak1a-sr-xp-v1` och streak-nyckeln har faktiskt historikdata (per-dag) som aldrig visualiseras.
3. **Ingen morgon-ritual.** Sidan är en statussida, inte ett *möte* — inget som förändrats sedan igår lyfts fram ("vad är nytt sedan senast?").
4. **Kommandopaletten (⌘K) söker bara navigation** (sidor, verktyg, 307 kurser) — den svarar aldrig på frågor. Detta är den perfekta bärande strukturen för fråge-funktionen (§6).

**Tillgängliga datakällor för en intent-parser (alla redan i kodbasen):**

| Datakälla | Nyckel/API | Ger svar på |
|---|---|---|
| `member-local.ts` | `ak1a-xp`, `ak1a-streak`, `ak1a-stjarnor`, `ak1a-klara-kurser` | nivå, streak, bästastreak, kurser kvar, nästa nyckelkurs |
| `spaced-repetition.ts` | `ak1a-sr-v1` via `srStatistik()` | förfallna idag, behärskade, nästa förfallo-dag, totala repetitioner |
| `veckoplan.ts` | `ak1a-veckoplan-v1` via `raknaVeckoPlan()`/`lasKlara()` | veckans klara/totala, minuter kvar, dagens rad |
| `kurstips.ts` | `raknaKurstips()` | "vilken kurs nu?" + varför-motivering i naturlig text |
| `vagkarta-kort.tsx` | `GET /api/vagscan/senaste` | universum-läge (impulsvågor/korrigeringar/basbyggen), stigande/fallande fundament, "vad säger vågkartan om X?" |
| `superanalys.ts` | `ak1a-superanalys-sparade-v1` via `lasSparade()` | sparade analyser, betyg, AK1TS-vågklasser → rapport-byggarens råmaterial |
| `navigationsminne.ts` | `ak1a:navigationsminne` | "var var jag senast?", senaste V-kurs |
| `badges.ts` | `ak1a-badges` via `badgeStatus()` | nästa badge, X kvar till upplåsning |
| `member-local.ts` | `fas2Upplast()` | fas 2-lås (nivå 25) |

---

## 2. STATE OF THE ART — finansiella dashboards för privatpersoner och proffs

### 2.1 Koyfin (pro-analytiker-verktyget, "Bloomberg för alla")

Konkreta funktioner ([koyfin.com](https://www.koyfin.com/), [G2-recensioner](https://www.g2.com/products/koyfin/reviews), [quantroutine-review](https://quantroutine.com/tools/koyfin/), [financialmodelshub](https://financialmodelshub.com/koyfin-review-2026-pricing-pros-cons-features-alternatives-20-off-voucher/)):

- **Modulära "My dashboards":** fully customizable — lägg till nya element (chart, watchlist, kolumn) med ett klick, spara multiple dashboards per syfte (ex. "morgon", "portfölj", "macro").
- **Prebyggda Macro Dashboards:** buntar av "aspects of the financial landscape" med kontext — användaren börjar från en mall och anpassar.
- **Watchlists "that come alive":** kolumner med nyckeltal som leverer med data, sorterbara, grupperade.
- **Equity Screener:** 100 000+ globala värdepapper, 5 900+ filterkriterier.
- **Multi-assetöverblick:** aktier, ETF:er, fonder, statsräntor (40 länder), index, valutor, råvaror, krypto, makroekonomi — i en och samma vy.
- **Transkript-sök:** nyckelordssökning "i alla bolags earnings-samtal på sekunder" + sentiment.
- **Client-ready reports / delning:** dashboardar exporteras som rapporter (riktad till advisors — exakt rapport-byggar-mönstret).
- **Model Portfolio + Client Portfolio** (G2-användare lyfter fram detta som främsta styrka).
- Free tier: 2 watchlists + 2 screens ([simplemarkets](https://simplemarkets.io/blog/post/koyfin-review)).

**Mönster för AK1A:** Koyfins kärna är *komponerbarheten* — dashboarden är en yta eleven äger och arrangerar, inte en fast lista. Näst bäst lärdom: mallarna ("pre-built dashboards") sänker tröskeln att komma igång.

### 2.2 Simply Wall St (visuella berättelser)

Konkreta funktioner ([simplywall.st](https://simplywall.st/), [Snowflake-dokumentation](https://support.simplywall.st/hc/en-us/articles/360001740916-How-does-the-Snowflake-work), [öppen analysmodell på GitHub](https://github.com/SimplyWallSt/Company-Analysis-Model/blob/master/MODEL.markdown), [StockUnlock-review](https://stockunlock.com/simply-wall-st-review.html)):

- **Snowflaken:** visuell sammanfattning av bolaget över exakt **5 dimensioner — Value, Future, Past, Health, Dividends** — förstått "at a glance". Hela metodiken är öppen källkod (GitHub) och deterministisk.
- **Portfölj-Snowflake:** hela portföljens profil och hälsa som EN snöflinga — "var du vinner och var du är exponerad"; aggregerad intrinsic value vs marknadspris; realiserade/orealiserade vinster, IRR, dividendprognos med stress-test.
- **Visuella rapporter:** "tusentals datapunkter i en visuell rapport" med fasta sektioner: Past Performance, Risks & Rewards, Valuation & Comparison, Growth Forecast, Financial Health, Dividend Quality, Management, Insider Transactions.
- **Narratives (community-tävcke):** tre-stegs-ramverk — identifiera bolag → formulera tes → sätt fair value — teser byggs, spåras och utvecklas över tid med alerts. *Detta är i praktiken en rapport-byggare för investeraringsteser.*
- **Smart Alerts:** dagliga notiser på rapporter, utdelningar, värderingsförändringar, insiderköp.
- 120 000 bolag, 90 marknader, S&P Global-data.

**Mönster för AK1A:** SWS bevisar att en fast femdimensionell visuell metafor (snowflaken) kan bära ett helt företag — AK1A:s motsvarighet är redan på väg: vågkartans ▲▼◼·-chips + V01–V20-ringen kan bli elevens "personliga snöflinga". SWS **Narratives** är den starkaste externa valideringen av rapport-byggar-konceptet: en tes som dokumenteras, spåras och revideras är produkten, inte biprodukten.

### 2.3 TIKR (Bloomberg-alternativet med värderingsfokus)

Konkreta funktioner ([tikr.com](https://www.tikr.com/), [portföljspårning](https://www.tikr.com/stock-portfolio-tracking), [watchlist-guide](https://www.tikr.com/blog/how-to-build-an-advanced-stock-watchlist), [reverse DCF](https://www.tikr.com/blog/how-to-reverse-engineer-a-stocks-implied-growth-rate), [quantroutine](https://quantroutine.com/tools/tikr/)):

- **Superinvestor-tracking:** portföljer hos 10 000+ institutionella investerare — "följ de bästa".
- **Valuation Model Builder:** framåtblickande DCF utan kalkylblad — fair value "på under 60 sekunder"; dessutom **reverse DCF**: justera tillväxtantaganden tills modellens värde matchar dagens kurs → läs av *marknadens implicita tillväxtförväntning* och bedöm om den är rimlig.
- **Watchlist med kontext:** inte bara kursrörelse utan "om rörelsen faktiskt spelar roll" — fundamentala nyckeltal spåras över tid per bevakat bolag.
- 100 000+ globala aktier, 20 år finansiell data, analytikerkonsensus och prismål.

**Mönster för AK1A:** Reverse-DCF-tänket är pedagogiskt guld och översätts direkt: *istället för att prognostisera, fråga vad dagens läge implicerar*. "Vad säger vågkartan om X?" ska fungera likadant — svar ur data, inte tyckande.

### 2.4 Yahoo Finance-portföljen (massmarknad-basen)

Konkreta funktioner ([finance.yahoo.com/portfolios](https://finance.yahoo.com/portfolios/), [hjälpcenter](https://help.yahoo.com/kb/overview-portfolio-yahoo-finance-sln36784.html), [Sharesight-jämförelse](https://www.sharesight.com/blog/yahoo-finance-vs-sharesight-comparing-portfolio-trackers/), [Investopedia](https://www.investopedia.com/articles/investing/092214/tracking-your-portfolio-yahoo-finance.asp)):

- Holdningslista med snabböverblick och jämförelser; **transaktioner, lots, kontanthantering, utdelningshantering** (Premium); prestandadiagram per hållning och hel portfölj.
- **Dokumenterad svaghet:** prestandaberäkningen exkluderar historiskt utdelningar → underskattad avkastning — tredjepartsspårare (Portseido, Sharesight) existerar just för att rätta detta.

**Mönster för AK1A:** Även massmarknadens baseline har transaktions-/lots-granularitet. Aviseringen: *beräkna alltid ärligt och visa hur* — AK1A:s "pedagogisk analys, inte investeringsråd"-disclaimer är rätt inställning.

### 2.5 Tvärsnittande mönster

| Mönster | Koyfin | SWS | TIKR | Yahoo | → AK1A-översättning |
|---|---|---|---|---|---|
| Fast visuell metafor för helhetsöverblick | dashboard-moduler | **snowflaken (5 dim)** | – | – | våg-chips + V-ring + kurva = elevens snöflinga |
| Deterministisk poäng/signal, öppen metodik | screener-regler | **GitHub-öppen modell** | reverse DCF | – | motorerna är redan deterministiska + dokumenterade i /data/rapporter |
| Tes/rapport som förstklassigt objekt | client reports | **Narratives** | valuation models | – | rapport-byggaren (§7) |
| Daglig förändring lyfts fram | news feed | smart alerts | watchlist-rörelser | – | morgon-briefing: "ändrat sedan igår" |
| Fråga/väga sig ner i detalj | ⌘-sökning + filter | screener | kolumnval | sortering | **intent-parser (§3, §6)** |

---

## 3. NATURLIGA SPRÅK-FRÅGOR MOT DATA — UTAN LLM (deterministiska intents)

### 3.1 Tableau Ask Data — den bevisade grammatikmodellen

Tableaus Ask Data (nu del av [Tableau Pulse](https://www.tableau.com/blog/tableau-metrics-and-natural-language-query-evolve-tableau-pulse)) är det främsta kommersiella exemplet på NL-frågor som **inte** kräver en generativ modell:

- **Nyckelordsbaserad grammatik:** systemet mappar användarens ord mot en *analytisk grammatik* med fem uttryckstyper — **aggregering, gruppering, filter, sortering, tidsserier** — och översätter till en deterministisk fråga ([ forskningsbloggen](https://www.tableau.com/blog/overcoming-ambiguity-natural-language-research-behind-ask-data)). Samma forskning hanterar öppet **ambiguitet**: ord som "låg", "bra", "mycket" tolkas mot fältens synonymuppsättning.
- **Intermediärspråk:** internt parsas frågan till det lätta mellanrepresentationsspråket **Arklang** som slutför under specificerade frågor ([NL2VIS-survey, Luo et al.](https://luoyuyu.vip/files/NL2VIS_Survey.pdf)); ofullständiga frågor ger parse-träd-fel medan användaren skriver — dvs. *inkrementell tolkning med direkt feedback* ([arXiv 2110.12596](https://arxiv.org/html/2110.12596v1)).
- **Konfigurerbar förståelse, inte träning:** dataägaren definierar **synonymer per fält** och utesluter irrelevanta värden ([Optimize Data for Ask Data](https://help.tableau.com/current/server/en-us/ask_data_optimize.htm)); **"lenses"** koncentrerar frågeytan mot en publik med förslag på frågor ([Create Lenses](https://help.tableau.com/current/online/en-us/ask_data_lenses.htm)). matchning mot beräknade/kolumn-/grupp-/bin-fält ([whitepaper](https://www.tableau.com/learn/whitepapers/preparing-data-nlp-in-ask-data)).
- **Släktträd:** Microsoft Research **DataTone** (Gao et al. 2015) — "mixed-initiative"-hantering av ambiguitet i NL-gränssnitt för visualisering: systemet föreslår tolkningar och låter användaren välja, istället för att gissa ([DataTone-artikel](https://www.researchgate.net/publication/301462085_DataTone_Managing_Ambiguity_in_Natural_Language_Interfaces_for_Data_Visualization)). Power BI:s **Q&A** bygger vidare på denna linje ([översikt](https://medium.com/@adnanmasold/talking-to-your-data-how-natural-language-to-sql-is-shaping-the-future-of-data-interaction-021fd0d8687a)).

### 3.2 Varför deterministisk > LLM just för "Fråga din dashboard"

1. **Sanningsgaranti:** svaret beräknas ur eleven egen data med ren kod — inga hallucinationer, inga API-kostnader, ingen latency. (Kontrast: LLM-baserade FinAI-assistenter utvärderas fortfarande på om de ens kan återge en tidsserie korrekt — [arXiv 2510.14162](https://arxiv.org/html/2510.14162v2).)
2. **Komponerbar grammatik:** AK1A:s frågeyta är *mindre* än Tableaus — fyra entitetstyper (streak/XP, kurser, repetition, vågkartan) räcker långt. En liten sluten grammatik gör precisionsproblemet hanterbart.
3. **DataTone-mönstret löser misslyckande graceful:** när parsningen inte träffar, visa *chips med förslag på vad som kan frågas* (äkta frågor ur registret) — användaren lär sig grammatiken på en sekund. Detta är också exakt hur kommandopaletten redan beter sig.
4. **LLM kan adderas senare som förstärkning, inte grund:** AI-mentorn (chat-widgeten) finns redan — intent-parsern kan vara det deterministiska första svaret och mentorn felsäkringen, aldrig tvärtom.

### 3.3 Sluten grammatik för AK1A (förslag)

| Fråga (exempel eleven kan skriva) | Intent | Datakälla | Svar-typ |
|---|---|---|---|
| "hur går min streak?" / "streak?" / "vanan?" | `streak.läge` | `lasStreak()` | siffer-svar + färg-ton (redan i `vanFarg()`) |
| "vad är mitt bästa?" | `streak.rekord` | `lasStreak().basta` | siffer-svar |
| "vilken kurs nu?" / "vad ska jag läsa?" | `kurs.nasta` | `raknaKurstips({antal:1})` | kort + varför-rad + länk |
| "hur många kurser kvar?" / "procent av läroplanen?" | `progress.laroplan` | `lasKlaraKurser()` | räknare + %-svar |
| "vad ska jag göra idag?" | `dag.aktivitet` | `raknaVeckoPlan()` + `forfallnaKort()` | dagens rad(er) + länkar |
| "hur går det med repetitionen?" / "förfallna?" | `sr.statistik` | `srStatistik()` | förfallna idag / behärskade |
| "vad säger vågkartan?" / "läget i marknaden?" | `vagkarta.lage` | `/api/vagscan/senaste` | chips-svar + top-rörelse |
| "vad säger vågkartan om ⟨variabel⟩?" | `vagkarta.variabel` | samma API, filtrera `topRorelse/botRorelse` | rörelse-text för V⟨nn⟩ |
| "mina analyser?" / "vad har jag sparat?" | `analys.lista` | `lasSparade()` | lista + betyg |
| "nästa badge?" / "vad låser upp?" | `badge.nasta` | `badgeStatus()` | badge + kvar-krav |
| "var var jag?" / "senast?" | `nav.minne` | `besok()[0]` | sida + länk |
| "hur länge till nivå ⟨n⟩?" | `niva.kvar` | `lasXP()` | "X XP kvar" |

Implementationsskiss: `src/lib/fraga-dashboard.ts` — ett intent-register (id, mönster-regexps med svenska synonymer, resolver-funktion, svars-formaterare). Normalisering: gemener, diakriter, ta bort interpunktion. Matchning: först längsta träff på entitet + attribut;多条 träff → DataTone-disambiguering (visa 2 tolkningar som chips). Ingen träff → "Jag kan svara på frågor om: streak · kurser · repetition · veckan · vågkartan · badges · analyser" (klickbara exempel). Hela registret < 300 rader kod, helt testbart, SSR-säkert (samma useEffect-mönster som övriga kort).

---

## 4. PERSONALISERADE MORGON-RUTINER — briefing-mönster

### 4.1 Dagliga finansiella briefings (Finimize, Morning Brew, Robinhood Snacks)

- **Finimize Daily Brief:** "förstå dagens finansiella nyheter på 3 minuter" — största storyn + *analystinsikter som säger vad man kan göra*; 1M+ prenumeranter, förvärvat av abrdn ([finimize.com/newsletter](https://finimize.com/newsletter), [Simon Owens-intervju](https://simonowens.substack.com/p/how-finimize-grew-to-over-1-million)). Mission: "empower users to become their own financial advisers" — identisk med AK1A:s.
- **Morning Brew:** snabba, insiktsfulla dagliga uppdateringar; växte till 2,5M+ prenumeranter ([morningbrew.com](https://www.morningbrew.com/), [SparkLoop-analys](https://sparkloop.app/blog/the-secrets-behind-morning-brews-growth-to-2-million-newsletter-subscribers-6)).
- **Robinhood Snacks:** "tre minuter, de två största storyn" — ~36M prenumeranter som top-of-funnel ([RightMetric-case](https://rightmetric.co/outsight-library/pro-members-how-robinhood-created-a-newsletter-with-36-million-subscribers), [Robinhood newsroom](https://www.robinhood.com/us/en/newsroom/robinhood-snacks-launches-new-video-series)).

**Formatmönster som alla tre delar (→ morgon-briefingens designregler):**
1. **Radikal korthet med fast löfte** — "3 minuter" är produkten.
2. **Fast struktur varje dag** — förutsägbar sektionsordning skapar ritualen (habit loop: cue → routine → reward).
3. **En personlig krok överst** — "din portfölj" före "världen".
4. **Jargonfritt språk med personlighet.**
5. **Avslut med en enda handling** — "gör detta ena idag".

### 4.2 Vanepsykologin (Duolingo-forskningen)

- Streak designades med vetenskaplig habit-forskning som grund; **användare med 7-dagars streak är 3,6x mer benägna att stanna**; "Streak Freeze"-förlåtelsemekanik minskade churn markant ([Duolingo-bloggen](https://blog.duolingo.com/how-duolingo-streak-builds-habit/), [omdesignen](https://blog.duolingo.com/improving-the-streak/), [Orizon-analys](https://www.orizon.co/blog/duolingos-gamification-secrets), [streak-design utan burnout](https://yukaichou.com/gamification-analysis/streak-design-gamification-motivation-burnout/)).
- Nyckelprinciper: lågfriktion daglig handling, **förlustaversion** (AK1A har streak; saknar ännu: synliggöra *vad som riskeras* vänligt), förlåtelse-mekanik, multi-touchpoint (widget → AK1A-motsvarighet: PWA + briefing-kort överst).
- Personaliseringens värde i nyhets-appar: relevans + tidsbesparing är de två dokumenterade vinsterna ([Taylor & Francis-studie](https://www.tandfonline.com/doi/full/10.1080/21670811.2020.1773291), [MDPI](https://www.mdpi.com/2078-2489/11/1/33)).

### 4.3 Morgon-briefing för AK1A (syntes)

Ett kort överst på /min-sida (eller route /morgon), genererat helt ur lokaldata vid besökstillfället, max 5 rader:

```
God måndag, Anna.                          ← personligt + tidsstämpel
🔥 Streak 12 dagar — igår repeterade du    ← vad som hände senast (förlustaversion, vänligt)
   6 kort; 4 förfallna idag.
📘 Idag: V09 ROE (29 min) — på onsdag      ← dagens enda handling (ur veckoplanen)
   väntar V10 Skuldsättningsgrad.
🌊 Vågkartan: 14 impulsvågor ▲ 6            ← ett värde från världen (vågkarta-API)
   korrigeringar ▼ — stigande: V01, V04.
[ Börja dagens pass → ]                     ← EN primär CTA
```

Alla rader är deterministiska funktioner som redan finns (`lasStreak`, `srStatistik`, `raknaVeckoPlan`, `/api/vagscan/senaste`). Kort-försvinner-logik: rad som inte ändrats sedan iget kan tonas ner ("oförändrad") — ritualen belönar *förändring*, inte upprepning.

---

## 5. DASHBOARD-INFORMATIONSARKITEKTUR — vad överst, vad djupare

### 5.1 Etablerade principer

- **5-sekundersregeln:** betraktaren ska fatta nyckelinsikten på 5 sekunder — annars har designen misslyckats; detta tvingar de viktigaste sammanfattande värdena längst upp ([Domo](https://www.domo.com/learn/article/what-should-be-on-an-executive-dashboard), [Tooldox](https://www.tooldox.io/guides/dashboard-design), [Improvado](https://improvado.io/blog/kpi-dashboard)).
- **Progressive disclosure:** avancerad information skjuts till sekundära ytor (drill-down, expander, sekundära skärmar) — dokumenterad som både taktiskt mönster och strategisk IA ([IxDF](https://ixdf.org/literature/topics/progressive-disclosure), [Medium-enterprise](https://medium.com/@theuxarchitect/progressive-disclosure-in-enterprise-design-less-is-more-until-it-isnt-01c8c6b57da9), [dev3lop visualisering](https://dev3lop.com/blog/progressive-disclosure-in-complex-visualization-interfaces/), [Power BI card pattern](https://prathy.com/2020/04/powerbi-reports-landing-page-tips-and-tricks-progressive-disclosure-design-approach-in-power-bi-using-card-pattern/), [UX Pilot](https://uxpilot.ai/blogs/dashboard-design-principles), [Pencil & Paper-mönsterbibliotek](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards)).
- **Sammanfattning → detalj-navigering** är det dominerande mönstret i datadashboards; kort/landningssida först, detalj vid interaktion.
- **Command palette (⌘K) som komplement, inte ersättning:** "search-as-navigation plattar hierarkier" — användaren skriver *vad* de vill ha istället för att minnas *var* det bor; nybörjare klickar fortfarande menyer ([Superhuman](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/), [Linear changelog](https://linear.app/changelog/2019-12-18-new-command-menu), [Retool](https://retool.com/blog/designing-the-command-palette), [uxpatterns.dev](https://uxpatterns.dev/patterns/advanced/command-palette)). AK1A har redan ⌘K-palett (`kommandopalett.tsx`) — den söker navigation; fråge-funktionen är dess naturliga vuxensteg.

### 5.2 Tillämpad ordning för Min Sida (target)

| Nivå | Yta | Innehåll | Princip |
|---|---|---|---|
| 0 — 5 sek | Morgon-briefing + hero | hälsning, streak, dagens enda handling, vågläge | 5-sekundersregeln |
| 1 — 30 sek | Välfärdspanel (befintlig) + rullande 7-dagarsvy | snöflingan: kurvan, vanan, ringen + tidsdimensen | fast visuell metafor |
| 2 — 2 min | Veckoplan, vågkarta, kurstips (befintliga) | veckans detalj, marknadens detalj, nästa steg | progressive disclosure |
| 3 — fråga | **Fråga din dashboard** (⌘K + fält på sidan) | alla intents i §3.3, svar med länk nedåt | command palette + NL-grammatik |
| 4 — arkiv | Rapport-byggaren / min historik | sparade analyser, rapporter, certifikat | förstklassiga objekt |

---

## 6. SYNTES FÖR AK1A — prioriterad funktionslista (1000x-steget)

**P0 — "Fråga din dashboard" (deterministisk intent-parser).** *Bästa enskilda 1000x-idén.* Ny modul `src/lib/fraga-dashboard.ts` + UI-yta: (a) frågefält i morgon-briefingen, (b) fråge-resultat i kommandopaletten (⌘K) när inmatningen börjar med "hur/vad/vilken/när". Grammatik enligt §3.3 — entsregistret ~12 intents täcker streak, kurser, läroplan, repetition, veckan, vågkarta (även per variabel), analyser, badges, nivå, navigationsminne. DataTone-fallback: chips med förslag. Noll LLM, noll nät (utom vågkarta-API som redan finns), ~0 kostnad, testbar. Bygger direkt på bevisad teknik (Tableau Ask Data-linjen) och på befintlig infrastruktur (palett + lokaldata-motorer).

**P1 — Morgon-briefing** enligt §4.3: 5 rader, EN CTA, personlig krok, "ändrat sedan igår"-logik. Route-oberoende komponent `morgon-briefing.tsx`, monteras överst på /min-sida; kan även bli PWA-notis senare.

**P2 — Rullande 7-dagarsvy:** sparkline-aggregat av det som redan loggas per dag (`ak1a-sr-xp-v1` har redan per-dag-historik; utöka med en liten `ak1a-aktivitet-v1` daglig sammanfattning: XP-förändring, kort repade, kurser klarade, pass gjort). Visas i välfärdspanelen som fjärde kort eller inuti vanan-kortet. Ger dashboarden dess saknade tidsdimension och gör streaken till en *kurva*, inte ett tal.

**P3 — Mål-progression:** låt eleven sätta 1–3 mål (ex. "20 V-kurser", "streak 30", "första Superanalys") i elevkärnan; varje mål får deterministisk progress-bar + plats i briefing ("3 kurser kvar till målet"). Källor: SWS Narratives (mål = tes), Koyfin-model-portfolio (explicita målvyer), Duolingo-daily-quests (nära, lågfriktion).

**P4 — Elevens snöflinga (frivillig konsolidering):** välfärdspanelens tre kort + vågkartan renodlas till en enda visuell signatur (kurva + streak-punkter + V-ring runt en våg-chip) — Simply Wall St-lektionen: en metafor, fem dimensioner, oändligt återanvändbar (även i rapporten, §7, och i framtida topplista-visor).

**P5 — Kommandopalett-v2:** paletten får intents som förslag (skriv "streak" → direkt svar, inte bara sidträff) — samma register som P0, ingen ny motor.

---

## 7. RAPPORT-BYGGAREN — redovisningsplattform (koncept)

**Idé:** eleven samlar sitt arbete — sparade Superanalyser, klarade kurser, vågskattningar, rep-historik, badges, certifikat — till en formatterad, delbar rapport: "min period som aktie" / terminsredovisning / föräldra- eller arbetsgivarunderlag. Råmaterialet finns redan: `lasSparade()` (analyser med betyg och AK1TS-vågklasser), `lasKlaraKurser()`, `srStatistik()`, `/api/vagscan/senaste`, `badgeStatus()`, certifikatsidan.

**Struktur (SWS visuell rapport + Finimize-format som mallar):**

1. **Omslag** — namn, period, nivå/XP, elevens snöflinga (P4).
2. **Sammanfattning på 3 minuter** — briefing-format: vad hände, vad lärde jag mig, vad är nästa steg (elevens egna reflektioner i rik-text, sparas lokalt).
3. **Kurser & kunskap** — klarade kurser per kategori (V-spårets 8 kategorier), SM-2-statistik (behärskade/förfallna), rep-historik-sparkline.
4. **Analyser** — varje sparad Superanalys som sektion: bolag, totalpoäng/band, AK1TS-vågklasser, länk till full analys.
5. **Marknadsläget under perioden** — vågkartans universumssummering vid periodens slut + elevens tolkning.
6. **Mål & nästa period** — mål-progression (P3) + veckoplanens nästa steg.
7. **Meritförteckning** — badges, certifikat, topplista-position.

**Teknik:** deterministisk HTML-generering på klienten ( samma mönster som tryckklar HTML-rapport i ak1a-analys-skill), utskrift via webbläsarens print-to-PDF, ev. markdown-export. Delning = fil, integritet bevaras (allt lokalt, i linje med "kostnadsfritt, för alltid; sparas lokalt"). Framtida tillägg: Koyfin "client-ready"-mönstret — mallar per mottagare (förälder, lärare, arbetsgivare, eleven själv).

**Varför detta är rätt nästa plattform-steg:** SWS Narratives visar att tes-dokumentation är en produkt; TIKR/Koyfin visar att proffs betalar för just "samlat, formatterat, delbart". För AK1A blir rapporten *beviset på välfärdsresan* — kärnbudskapet i välfärdspanelen, nu i eleven hand.

---

## 8. KÄLLOR

**Dashboards:** [Koyfin](https://www.koyfin.com/) · [Koyfin G2](https://www.g2.com/products/koyfin/reviews) · [Koyfin quantroutine](https://quantroutine.com/tools/koyfin/) · [Koyfin financialmodelshub](https://financialmodelshub.com/koyfin-review-2026-pricing-pros-cons-features-alternatives-20-off-voucher/) · [Koyfin simplemarkets](https://simplemarkets.io/blog/post/koyfin-review) · [Simply Wall St](https://simplywall.st/) · [SWS Snowflake](https://support.simplywall.st/hc/en-us/articles/360001740916-How-does-the-Snowflake-work) · [SWS modell GitHub](https://github.com/SimplyWallSt/Company-Analysis-Model/blob/master/MODEL.markdown) · [SWS StockUnlock](https://stockunlock.com/simply-wall-st-review.html) · [TIKR](https://www.tikr.com/) · [TIKR portfölj](https://www.tikr.com/stock-portfolio-tracking) · [TIKR watchlist](https://www.tikr.com/blog/how-to-build-an-advanced-stock-watchlist) · [TIKR reverse DCF](https://www.tikr.com/blog/how-to-reverse-engineer-a-stocks-implied-growth-rate) · [TIKR quantroutine](https://quantroutine.com/tools/tikr/) · [Yahoo portföljer](https://finance.yahoo.com/portfolios/) · [Yahoo hjälp](https://help.yahoo.com/kb/overview-portfolio-yahoo-finance-sln36784.html) · [Yahoo vs Sharesight](https://www.sharesight.com/blog/yahoo-finance-vs-sharesight-comparing-portfolio-trackers/) · [Investopedia](https://www.investopedia.com/articles/investing/092214/tracking-your-portfolio-yahoo-finance.asp)

**NLQ utan LLM:** [Tableau Ask Data-forskning](https://www.tableau.com/blog/overcoming-ambiguity-natural-language-research-behind-ask-data) · [Tableau Pulse/NLQ](https://www.tableau.com/blog/tableau-metrics-and-natural-language-query-evolve-tableau-pulse) · [Ask Data whitepaper](https://www.tableau.com/learn/whitepapers/preparing-data-nlp-in-ask-data) · [Synonyms-optimering](https://help.tableau.com/current/server/en-us/ask_data_optimize.htm) · [Lenses](https://help.tableau.com/current/online/en-us/ask_data_lenses.htm) · [NL2VIS-survey (Arklang)](https://luoyuyu.vip/files/NL2VIS_Survey.pdf) · [arXiv 2110.12596](https://arxiv.org/html/2110.12596v1) · [DataTone](https://www.researchgate.net/publication/301462085_DataTone_Managing_Ambiguity_in_Natural_Language_Interfaces_for_Data_Visualization) · [NL2SQL-översikt](https://medium.com/@adnanmasold/talking-to-your-data-how-natural-language-to-sql-is-shaping-the-future-of-data-interaction-021fd0d8687a) · [FinAI LLM-kontrast](https://arxiv.org/html/2510.14162v2) · [Financial query parsing](https://globalfintechseries.com/featured/real-time-financial-query-parsing-building-natural-language-interfaces-for-investment-platforms/)

**Briefing & vanor:** [Finimize](https://finimize.com/newsletter) · [Finimize-tillväxt](https://simonowens.substack.com/p/how-finimize-grew-to-over-1-million) · [Morning Brew](https://www.morningbrew.com/) · [Morning Brew-tillväxt](https://sparkloop.app/blog/the-secrets-behind-morning-brews-growth-to-2-million-newsletter-subscribers-6) · [Robinhood Snacks](https://www.robinhood.com/us/en/newsroom/robinhood-snacks-launches-new-video-series) · [Snacks-case](https://rightmetric.co/outsight-library/pro-members-how-robinhood-created-a-newsletter-with-36-million-subscribers) · [Duolingo streak-vetenskap](https://blog.duolingo.com/how-duolingo-streak-builds-habit/) · [Duolingo streak-omdesign](https://blog.duolingo.com/improving-the-streak/) · [Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets) · [Streak utan burnout](https://yukaichou.com/gamification-analysis/streak-design-gamification-motivation-burnout/) · [Personaliseringsstudie](https://www.tandfonline.com/doi/full/10.1080/21670811.2020.1773291) · [MDPI](https://www.mdpi.com/2078-2489/11/1/33)

**Dashboard-IA:** [Domo 5-sek-regeln](https://www.domo.com/learn/article/what-should-be-on-an-executive-dashboard) · [Tooldox](https://www.tooldox.io/guides/dashboard-design) · [Improvado](https://improvado.io/blog/kpi-dashboard) · [IxDF progressive disclosure](https://ixdf.org/literature/topics/progressive-disclosure) · [Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-data-dashboards) · [Power BI card pattern](https://prathy.com/2020/04/powerbi-reports-landing-page-tips-and-tricks-progressive-disclosure-design-approach-in-power-bi-using-card-pattern/) · [Superhuman-palett](https://blog.superhuman.com/how-to-build-a-remarkable-command-palette/) · [Linear cmd-k](https://linear.app/changelog/2019-12-18-new-command-menu) · [Retool](https://retool.com/blog/designing-the-command-palette) · [uxpatterns.dev](https://uxpatterns.dev/patterns/advanced/command-palette)
