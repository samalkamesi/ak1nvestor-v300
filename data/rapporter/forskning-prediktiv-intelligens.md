# Forskning: Prediktiv intelligens — "förstå eleven innan eleven vet vad den vill"

Datum 2026-09-01. Underlag till nästa generations elevintelligens i AK1A: hur vi går
från dagens reaktiva, regelbaserade tips till ett **prediktivt, proaktivt — men aldrig
störande — system** som vet vad eleven behöver nästa. Källor: genomläsning av
src/lib (tracer, kurtips, elevkarna, dashfraga, signal-bus, pedagogik) + webbforskning
(länkar i §4). Detta är underlaget till patentidén **Förståelse-Först-Assistenten** (§3).

---

## 1. Nuläge: AK1A:s sex sinnen i dag

| Sinn | Fil | Vad den fångar | Brist (prediktivt) |
|---|---|---|---|
| Beteendetracern | `src/lib/tracer.ts` | Sidvisningar, verktyg, quiz R/F, aktiva timmar, intressespår (4), aktiv tid med idle-filter (≤30 min) | Endast **aggregat** — ingen sekvens, ingen ordning, ingen micro-nivå (scroll/dwell) |
| Kurstips-motorn | `src/lib/kurstips.ts` | Regelranking: spår → balans → flaggskepp (≥8 klara) → streak/låg-XP | Statisk poängsättning (100/82/70/58/56) — lär sig ALDRIG av om tips följs |
| Elevkärnan | `src/lib/elevkarna.ts` | MÅL, horisont, intressen, min/vecka, välfärdsmål (grad 0–3) | Sätts en gång, används inte som prediktiv feature |
| Fråga dashboarden | `src/lib/dashfraga.ts` | NLQ via deterministisk regex-intent (11 intents) | Ren **reaktiv** — svarar bara på frågor, förutsäger inget |
| Signal-bussen | `src/lib/signal-bus.ts` | Kanal för proaktiva signaler (info/varning/möjlighet), streak-risk Beräknas lokalt | Ingen **timing-logik** — signaler sänds när de uppstår, inte när de landar bra |
| Pedagogiken | `src/lib/pedagogik.ts` | Rösten: hjälpa-aldrig-döma, tipsa-inte-tvinga, välfärd-först, tacksamhet | Ton är konvention i text — inte ännu en **verifierbar systemkonstraint** |

Sammanfattning: vi har en **beteende-profil** (vad eleven GÖR) men ingen
**förståelse-profil** (vad eleven FÖRSTÅR, var hon fastnar, när hon är redo). Det är
precis gapet forskningen nedan visar hur man fyller.

---

## 2. Forskningsläge

### 2.1 Prediktiva användarmodeller — hur giganterna gör
Netflix lager-modellerar: kandidat-generering (two-tower) → ranking, och viktigast för
oss: **session-intent** — modellen FM-Intent förutsäger vad användaren är på väg att
göra *i denna session* med hierarkisk multi-task-learning, och in-session-adaptiva
rekommendationer anpassar sig inom sekunder. Spotifys Discover Weekly vilar på tre
ben: kollaborativ filtrering (co-occurrence-matriser), NLP på text om innehållet, och
innehållsanalys — dvs **beteende + semantik**, inte bara klick. TikTok/ByteDances
Monolith kör **online learning med realtids-feedback-loop**: embedding-tabeller
uppdateras minut-för-minut; varje swipe är både signal och belöning. Lärdom:
prediction-vinsten ligger i *sekvens + kontext*, inte i aggregat. AK1A:s tracer
aggregerar; den spelar in ingen ordning.

### 2.2 Clickstream i utbildning — MOOC-litteraturen
MOOC-fullföljandegraden ligger typiskt **under 10 %** (Moreno-Marcos et al. 2020) —
därför är drop-out-prediktion utbildningsdatans grundproblem. Dass et al. (2021)
prediktar dag-för-dag om en elev ska hoppa av med **87,5 % träffsäkerhet / 94,5 % AUC**
enbart på clickstream-feature (videointeraktioner, sidvisningar, distans mellan
aktiviteter). Signifikanta mönster: avtagande aktivitet föregår drop-off; **spikmönster
följt av tystnad**; låg quiz-deltagande tidigt. AK1A:s `raknaStreakRisk` är en
one-feature-version av detta — Fas 2-generaliseringen är en riskpoäng av streak +
quiz-trend + aktiv-tids-trend, beräknad lokalt (samma integritetsgrund).

### 2.3 Proaktivitet: från Clippy till timing-regler
Clippy-forskningen (Horvitz CHI '99; Swartz "Why People Hate the Paperclip") gav
canon-reglerna för mixed-initiative: proaktivitet ska bara triggas när **värdet av
initiativet överstiger avbrottskostnaden**; systemet måste inferera avsikt — Clippy
antog värde utan att validera behov och avbröt utan hänsyn. Modern forskning
(bland annat CHI 2025 "Need Help?"; Bérubé et al. 2024 systematisk review) bekräftar:
**timing är den avgörande variabeln** — samma förslag upplevs hjälpsamt vid naturliga
brytpunkter och störande mitt i pågående uppgift; **användarkontroll** (kunna nonchalera/
avvisa) bevarar förtroende, medan upprepade fel-tajmade avbrott eroderar det; riktigt
proaktiva system lyssnar på kontext (aktivitet, tid, stillhet) istället för fasta
triggers. Konkreta regler för AK1A: (1) aldrig avbryta quiz/pågående läsning —
leverans endast vid **naturliga brytpunkter** (quiz avslutat, sidbyte, återkomst),
(2) **frekvenstak**: max 1 proaktiv signal per session, (3) every nudge dismissbar,
(4) timing-fönster från tracerns `typiskaTimmar` (redan insamlat!), (5) värdet måste
formuleras i elevkärnans välfärdstermer — annars hålls tyst. Detta är signal-bussens
saknade lager.

### 2.4 Micro-interaktioner: scroll, dwell, mus — och integritet
Guo & Crestani (WWW 2012) visade att **musrörelser korrelerar med blick** och därmed
med uppmärksamhet/relevans; ACM-dataset (2021) kopplar mus+öga till **förvirring**;
D'Mello-skolan detekterar affect (flow, förvirring, uttråkning, nyfikenhet) från
lågkostnads-beteendesignaler. Praktisk översättning för en läsplattform: **dwell-time
på avsnitt** (lång + ingen scroll = brottning; kort + djup scroll = skumning),
**scroll-rytm** (mycket tillbaka-bläddrande = förvirring), **idle mitt i quiz** =
osäkerhet. Aggregering till admin skall ske integritetssäkert: Apples differentiellt
integritets-mönster (aggregata skisser + kalibrerat brus) och DP-som-GDPR-argument
(Georgia Tech) visar vägen — AK1A:s "allt lokalt, dela sammanfattning frivilligt"
redesignar detta: rå-mikrodata lämnar ALDRIG browsern, admin ser brusade kollektiva
mönster (redan signal-bussens P8/PGD-linje).

### 2.5 Knowledge tracing, repetition, ZPD
**BKT** (Bayesian Knowledge Tracing) modellerar per-färdighet-mastery som hidden
Markov: P(kan|sekvens av rätt/fel) — tolkbart, smådata-vänligt. **DKT** (RNN/LSTM på
svarssekvenser, Piech et al. 2015) prediktar bättre men sämre tolkbart; 2025-litteraturen
(DKVMN m.fl.) fortsätter spåret. För AK1A räcker **BKT per grundvariabel (V01–V20)**:
quiz-rätt/fel i tracer är redan insamlat, saknar bara mastery-uppskattning. Repetition:
Duolingo's **half-life regression** (Settles & Meeder 2016) tränar glömskekurvor per
elev-item-par — "glömskekurvan" finns redan i vår pedagogiska ton, Fas 2 ger den en
modell bakom orden. Svårighet: **ZPD-detektering** = håll predikterad träffsäkerhet i
bandet ~70–85 % (Schütt et al. EDM 2023: snabb dynamic difficulty adjustment funkar
även med små dataset). Tracerns 80 %-tröskel är redan en mastery-grind; Fas 2 gör den
kontinuerlig.

### 2.6 Kontextuella banditer för utbildning
Explore/exploit-dilemmat: alltid exploit → filterbubble i lärandet (eleven fastnar i
bekvämt); alltid explore → slump. Kontextuella banditer (INFORMS 2025 om pedagogiska
rekommendationer; neurala varianter arXiv 2312.14037; praktik: Eugene Yan) väljer arm
(kurs/övning) condicerat på elevens kontext, med ε-greedy/Thompson-exploration.
Utbildningsspecifika krav: exploration måste vara **pedagogiskt ofarlig** — utforska
INOM ZPD-bandet och spåret, aldrig slumpvis; belöningen är inte klick utan **lärande +
välfärd** (completion, quiz-trend, retur). AK1A-översättning: kurtips poängsättning
behålls som prior (exploit), banditen styr en liten andel slots mot underrepresenterade
kategorier (redan "balans"-logikens anda) och lär av vad eleven faktiskt öppnar/klarar.

---

## 3. Syntes: FÖRSTÅELSE-FÖRST-ASSISTENTEN (patentidén)

### 3.1 Förståelse-Profilen — en profil, fyra frågor
Fusion av dagens sex sinnen till ETT läsbar objekt (lokalt, frivilligt delbart):

| Fråga | Källa (befintlig → Fas 2) | Metod |
|---|---|---|
| VAD förstår eleven? | quiz rätt/fel → per-koncept BKT (V01–V20) | knowledge tracing |
| VAR fastnar eleven? | fel-mönster + dwell/scroll/idle-signaler | micro-interaktionsanalys (§2.4) |
| VAD motiverar eleven? | tracer-intressespår + elevkärna (mål, välfärd) | beteende + deklarerat mål |
| NÄR är eleven redo? | mastery ≥ tröskel + streak/retur-trend + riskpoäng | BKT + drop-off-modell (§2.2) |

### 3.2 Fyra förmågor (bygger på varandra)
1. **Förutsäga nästa behov** — session-intent i Netflix-stil: var är eleven på väg
   just nu (sekvens, inte aggregat)?
2. **Föreslå proaktivt — aldrig störande** — signal-bussen + timing-reglerna §2.3
   (brytpunkter, frekvenstak, dismissbar, välfärdsformulerat värde).
3. **Anpassa svårighet** — ZPD-band 70–85 % predikterad träffsäkerhet.
4. **Varna admin om mönster** — drop-off-risk/frustration i brusade aggregat (DP),
   aldrig individrapportering utöver elevens frivilliga delning.

### 3.3 Novelty — vad som är patentvärt (triaden)
Ingen källa kombinerar följande tre; varje del enskild är känd, **kombinationen med
den hårt konstruerade målfunktionen är ny**:

- **(a) Aldrig-dömande-ton som systemkonstraint**: pedagogik.ts:s principer görs från
  konvention till **verifierbar constraint** — varje systemgenererad elevtext måste
  passera en deterministisk ton-validering (förbjudna bristmönster: "borde", "missade",
  "efter"; krav: "välkommen", "din resa") innan den når signal-bussen. Tone-as-code.
- **(b) Tre mätsystem i EN Förståelse-Profil, integritets-först**: deterministisk
  kunskapsmätning (quiz/BKT) + passiv beteendetracering + micro-interaktions-signaler
  fusioneras **på klienten** (localStorage) — profilen lämnar eleven endast som
  frivillig, sammanfattad nivå. Jämför: plattformsgiganterna fusionerar på servern.
- **(c) Fas 2-tratt-optimering som målfunktion**: hela systemet optimerar inte klick
  eller time-on-site utan **"eleven når redo-tillståndet vid rätt tid"** — varken för
  tidigt (frustration, ZPD-brist) eller aldrig (drop-off). Bandit-belöning, timing-
  regler och ZPD-band härleds ALLA ur samma målfunktion. Att målfunktionen är en
  pedagogisk travers-tid (tid-till-redo), mätt med knowledge tracing, är det som
  skiljer den från engagemangsoptimerare.

### 3.4 Tidslinje

| Fas | Tid | Leveranser |
|---|---|---|
| **1** (nu → 1 mån) | Grunden | Förståelse-Profil v1 (fusion, läsbar på Min Sida); tracer v2 med micro-signaler (scroll-djup, dwell, idle) — fortfarande allt lokalt; drop-off-riskpoäng v1 (regelbaserad: streak + quiz-trend + aktivtids-trend); ton-validering (a) implementerad som funktion + tester |
| **2** (→ 3 mån) | Tracing & timing | BKT per V01–V20-koncept; HLR-glömskekurva → "Dagens Repetition"; ZPD-band i quiz-val; timing-regler på signal-bussen (brytpunkt + frekvenstak + dismiss); kontextuell bandit (ε-greedy inom spår+ZPD) på kurstips-slots; admin-aggregat med DP-brus |
| **3** (→ 6 mån) | Prediktion & patent | Drop-off-modell tränad på frivilligt delade profiler (federerat/lokt); session-intent-prediktion (sekvensmodell på lokal data); komplett Förståelse-Först-loop med trätt-målfunktionen (c) mätt och rapporterad; patentansökanläge: novelty-sök + ansökan enligt triaden |

---

## 4. Källor

**Industri-prediktion:** Netflix FM-Intent — netflixtechblog.com/fm-intent-predicting-user-session-intent-with-hierarchical-multi-task-learning-94c75e18f4b8 · Netflix in-session adaptive (RecSys '22) — dl.acm.org/doi/fullHtml/10.1145/3523227.3547407 · Spotify Discover Weekly — medium.com/the-sound-of-ai/spotifys-discover-weekly-explained-breaking-from-your-music-bubble-or-maybe-not-b506da144123 · ByteDance Monolith — arxiv.org/pdf/2209.07663

**MOOC/clickstream:** Moreno-Marcos et al. — sciencedirect.com/science/article/abs/pii/S0360131519302817 · Dass et al. 2021 — mdpi.com/2078-2489/12/11/476

**Proaktivitet:** Horvitz '99 Lumière — erichorvitz.com/lum.htm · Swartz, Why People Hate the Paperclip — xenon.stanford.edu/~lswartz/paperclip/paperclip.doc · Need Help? CHI 2025 — dl.acm.org/doi/full/10.1145/3706598.3714002 · Bérubé et al. 2024 — sciencedirect.com/science/article/pii/S2451958824000447 · Trust in proactive assistants — researchgate.net/publication/353781578

**Micro-interaktioner & integritet:** Guo & Crestani WWW '12 — archives.iw3c2.org/www2012/proceedings/proceedings/p569.pdf · Confusion dataset (mus+öga) — dl.acm.org/doi/10.1145/3386392.3399289 · Myers 2021 affect — pmc.ncbi.nlm.nih.gov/articles/PMC7998267 · Apple DP-aggregat — machinelearning.apple.com/research/differential-privacy-aggregate-trends · DP+GDPR — bpb-us-e1.wpmucdn.com/sites.gatech.edu/dist/c/679/files/2018/09/GDPR_DiffPrivacy.pdf

**Knowledge tracing/ZPD/repetition:** DKT i ITS (2025) — nature.com/articles/s41598-025-07422-7 · BKT/DKT-jämförelse — beardeer.github.io/wpi_public_html/papers/edm_2016_xiong_zhao.pdf · Settles & Meeder HLR — aclanthology.org/anthology-files/pdf/P/P16/P16-1174.pdf · Tabibian 2019 — pmc.ncbi.nlm.nih.gov/articles/PMC6410796 · Schütt EDM '23 DDA — educationaldatamining.org/EDM2023/proceedings/2023.EDM-posters.54/index.html · Duolingo elevmodell — blog.duolingo.com/how-we-learn-how-you-learn/

**Banditer:** Bandit-baserade pedagogiska rekommendationer (INFORMS 2025) — pubsonline.informs.org/doi/10.1287/ited.2025.0174 · Neural contextual bandits — arxiv.org/html/2312.14037v1 · Eugene Yan — eugeneyan.com/writing/bandits/
