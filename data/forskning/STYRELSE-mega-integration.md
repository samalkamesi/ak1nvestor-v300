# STYRELSE-mega-integration — råd om de 5 bästa OBYGGDA integrationsmöjligheterna

- **Datum:** 2026-09-04
- **Mandat:** kundens ord — "Vi ska utveckla fler Mega integrerade system."
- **Underlag:** data/motorregister.json (VÅG 49) + manuell genomgång av src/lib,
  src/components, src/app/api/cron, vercel.json, data/portfolj-system/ och git-historik.
- **Karaktär:** RÅD, ej kod. Inget committat.

---

## 0. Lägeskorrigeringsnot — registret är delvis föråldrat (viktigt före beslut)

Motorregistret skrevs före commit `3f24914` ("autonomi+integration"). Följande
registergap är REDAN STÄNGA och ska inte byggas om:

| Registergap | Verklighet i koden (2026-09-04) |
|---|---|
| "NotisCenter läser aldrig /api/signal" | notis-center.tsx läser `/api/signal` vid panelöppning (60 s cache) — signalströmmen når eleven |
| "eko-koppling har noll komponentkonsumenter" | assistent-panel.tsx konsumerar eko-kopplingen |
| "PortfoljVagProfil dockad ingenstans" | monterad i portfolio-system.tsx (rad 431) |
| "AktieNyheter gör egen Yahoo-hämtning" | går via motorns giltiga kanaler |
| "kurstips saknas på /laroplan" | monterad |

**Konsekvens:** de verkligagapen som återstår är (i) hela AKM2-stacken omonterad,
(ii) korstabellens 100-bolagsforskning når bara /portfolj-forskning + /prenumeration,
(iii) uppföljningscronen har inga verkliga portföljer att följa, (iv) mejl-rondan
kör i kö-läge (ingen leverantör konfigurerad).

## 1. Nuläge i korthet (fakta som styr råden)

- 42 motorer; 7 registret-omonterade, varav **4 = AKM2-stacken** (kärna, moduler,
  dynamik, vikter) — byggd, testad i verktyg/, noll produktionstyta.
- **korstabell-grund.json: 100 bolag, 7 gröna, daterad 2026-09-03** (P6-leverans,
  manuell takt). Dessutom data/analyses/ med 11 datadrivna föranalyser.
- **data/portfolj-system/uppfoljning/ innehåller bara EXEMPEL.json** — månads-
  cronen (1:a 07:00 UTC) har inget att följa; kedjan cron → publiceraSignal →
  NotisCenter är byggd och fungerar, men matas aldrig.
- Mejl: köas i system_events; skickas först när EMAIL_LEVERANTOR/EMAIL_API_KEY sätts.
- Vercel-filsystem är read-only i produktion — cron/portfolj-uppfoljning dokumenterar
  redan att fil-skrivning kan misslyckas. Persistensbeslut (M5) måste ta detta på allvar.

---

## 2. De 5 bästa obyggda integrationerna (M1–M5)

### M1 — AI-mentorn svarar med BOLAGSFAKTA ur korstabellen ("hur står Volvo i V19?")

- **Motorer:** chatbot-nlu (ämnesregistret) + zai (LLM-brygga) + korstabell-data
  (P6-underlaget) + data/analyses (föranalyser).
- **Vad eleven får:** frågar mentorn om ett verkligt bolag får hen ett
  deterministiskt faktsvar FÖRE eventuell LLM-text: AKM1-total andel av max,
  grön/gul/röd status, vågklass per horisont, golv-marginal, "senast kontrollerad
  2026-09-03" + länk till /portfolj-forskning. Mentorn går från teori till
  sajtens EGET forskningsarbete — 100 bolags korpus når sajtens mest använda yta
  (chat-widgeten är global).
- **Nytta/kostnad:** HÖGST daglig kundnytta av alla förslag; alla frågor om
  verkliga bolag blir idag mötta av allmän teori. Kostnad L–M (2–4 dagar).
- **Filer & beröringsytor:** src/lib/chatbot-nlu.ts (ny entitetstyp "bolag":
  ticker-/namnmatchning mot korstabellens 100 rader, accentnormaliseringen finns
  redan), src/app/api/chatbot/route.ts (nytt svarslager "bolagsfakta" före
  LLM-lagret; berika zai-prompten med radens fakta), lasKorstabellGrund()
  oförändrad källa. Berör: chat-widget (global), deep-consultation, senare dashfraga.
- **Risker:** namnmatchning ("Volvo" kan vara VOLV-B.ST eller Volvo Cars i
  data/analyses — vid tvetydighet: klarande motfråga, mentorn gissar aldrig);
  dataålder MÅSTE bäras i svaret (ärlighetsprincipen); lagen 2007:528 — fakta
  beskrivs, döms aldrig; fs-läsning per request (100 rader — försumbar, cacheas
  gärna i modul).

### M2 — AKM2-läge i kalkylatorn (projektionsinvarianten gör det riskfritt)

- **Motorer:** akm2-kärna + akm2-vikter + akm2-moduler (lager 2; dynamiken senare,
  default av) × akm1-calculator (RAKNARE).
- **Vad eleven får:** samma 20 nyckeltal ger TVÅ avläsningar på en ny flik:
  kalkylatorns klassiska summa och AKM2-kompositen (modulvikter, osatt-vikt
  omfördelas, hårda V19-porten synliggörs). Första gången hela AKM2-stacken
  monteras — 4 omonterade motorer blir 1 yta.
- **Varför riskfritt:** projektionsinvarianten projiceraAKM1(raknaAKM2(k)) ===
  raknaAKM1(k) garanterar att neutrala defaults ALDRIG kan motsäga kalkylatorn;
  avvikelse = bugg som dev-assert fångar. karna.ts är ren TS (endast typ- +
  vikter-import) — klientsäker att importera oförändrad.
- **Nytta/kostnad:** strategisk grundinvestering som alla senare AKM2-ytor
  (superanalys, pro) bygger på. Kostnad M (3–5 dagar inkl pedagogisk UX-text).
- **Filer & beröringsytor:** src/components/ak1a/akm1-calculator.tsx (ny flik
  "AKM2-vy"), verktyg/validera-motorer.mjs (ta med invariant- och viktsumma-testen
  i huvudvalideringen). Berör: /kalkylator, senare /superanalys och /pro.
- **Risker:** pedagogisk förvirring över två poäng — UX måste förklara VARFÖR de
  skiljer (osatta variabler, modulvikter); insidermodulen V29 förblir av
  (dokumenterat inaktiv); försök inte fusa in dynamiklagret i samma veva.

### M3 — Forskningsläget når eleven: Min Sida-kort + Kunskapsflödets "veckans research-bolag"

- **Motorer:** korstabell-data (via befintlig GET /api/portfolj-forskning som
  redan returnerar finns/antal/rader) + riskportfoljens statusregler (grön/gul/röd
  återanvänds, ej omimplementeras) × min-sida + kunskaps-flode.
- **Vad eleven får:** (e) ett kort på Min Sida: "Forskningsläget: 7 gröna av 100 —
  Apple, Sandvik … senast kontrollerad 2026-09-03" med länk; (c) en flik i
  Kunskapsflödet: "Denna veckans research-bolag" — deterministiskt veckourval ur
  gröna/gul-toppen (hash ur veckonumret, samma mönster som veckoplan).
- **Nytta/kostnad:** snabbast kvitt-vinst per timme — ingen ny API-route behövs,
  data och statuslogik finns. Kostnad L (1–2 dagar).
- **Filer & beröringsytor:** ny komponent forskningslage-kort.tsx, montering i
  src/components/ak1a/min-sida.tsx; ny flik i src/components/ak1a/kunskaps-flode.tsx
  (hämtar samma GET). Berör: /min-sida, kunskapsflödets ytmonteringar.
- **Risker:** inbillad färskhet — korstabellen är manuellt levererad; visa ALLTID
  datum + "osatt"-andel, aldrig "just nu på börsen"; veckourvalet måste vara
  deterministiskt (samma vecka = samma bolag) annars skapas en prognospil som
  strider mot vagkon-filosofin; no-store på 100 rader per sidvisning — sammanfatta
  eller cachea svaret kort.

### M4 — Mejl-briefing med topp-3 ur forskningsbiblioteket

- **Motorer:** email-mallar (morgonMejl) + cron/email + korstabell-data.
- **Vad eleven får:** morgonmejlet får en sektion "Forskningens topp-3" (gröna
  bolag med högst AKM-andel av max + en rad motivering ur radens data) med länk
  till /portfolj-forskning — forskningen når eleven även före inloggning.
- **Nytta/kostnad:** billig (L, ~1 dag) och rider gärna på M3:s urvalslogik.
- **Filer & beröringsytor:** src/lib/email-mallar.ts (ny sektion i morgonMejl),
  src/app/api/cron/email/route.ts (lasKorstabellGrund + topp-3, samma
  deterministiska urval som M3).
- **Risker:** rådgivningsgränsen är EXTRA känslig i e-post (disclaimern måste
  följa med i sektionen); utan leverantör blir det kö-läge — besluta om/ när
  EMAIL_LEVERANTOR sätts; samma topp-3 till alla medlemmar är korrekt
  (deterministiskt) men ska inte maskeras som personligt. OBS: elevens EGNA
  analysbank (localStorage) kan ALDRIG läsas server-side — "personlig topp-3 ur
  elevens analyser" i mejl kräver kluven arkitektur och bör inte eftersträvas nu.

### M5 — Vågklass-notiser som når eleven: aktivera då-vs-nu-uppföljningen (+ kravglidning)

- **Motorer:** uppfoljning (då-vs-nu) + signal-bus + NotisCenter × riskportfolj
  (kontrolleraKrav) + portfolj-system/bygg-portfolj-kort.
- **Det verkliga gapet:** hela kedjan cron → jamforDåNu → raknaNotisTexter →
  publiceraSignal → NotisCenter är BYGGD — men inga verkliga portföljer finns
  (uppfoljning/ = bara EXEMPEL.json) och sparade riskportföljsförslag sparas
  aldrig ("valet sparas inte någonstans förrän du är medlem" — bygg-portfolj-kort).
  Dessutom övervakas inte kravglidning (kandidat tappar golvmarginal/vågkrav) —
  ett uttryckligt kunddirektiv i registret.
- **Vad eleven får:** månadsnotis med vågklassbyten ("fundamental våg på lång
  sikt har gått från impulsvåg till korrigering") OCH "kandidat X uppfyller inte
  längre golvmarginal-kravet" — plus länk till /min-portfolj. Ordagrant
  kunddirektivet: samma aktier, jämförelse då vs nu, notis, ta hen till sidan.
- **Nytta/kostnad:** uppfyller kundens kärndirektiv; men dyrast (M–H, 5–8 dagar)
  för att ett PERSISTENSBESLUT krävs: Vercel read-only fs gör dagens
  fil-antagande olösligt — portföljer ska sparas i Supabase (medlemstabell eller
  egen tabell; system_events passar INTE som sanningskälla: retention 500 rader/
  30 dagar raderar snapshots). Cron-routen läser i stället från Supabase.
- **Filer & beröringsytor:** src/components/ak1a/portfolj-forskning/bygg-portfolj-kort.tsx
  + riskval-panel.tsx (spara för medlem), ny route /api/portfolj-forskning/spara,
  src/app/api/cron/portfolj-uppfoljning/route.ts (källa: Supabas; kör även
  kontrolleraKrav per rond = kravglidningsnotis), riskportfolj.ts (återanvänd oförändrad).
- **Risker:** persondata (portföljinnehav) — samtycke, minsta möjliga data,
  dokumenterad gallring; notis-tak (max en per typ/dag) respekteras;
  "beskriver aldrig dömer"-tonen är redan inbyggd i motorn — behåll den.

---

## 3. Rekommenderad byggordning (kundnytta först)

| Ordning | Integrering | Motivering | Storlek |
|---|---|---|---|
| 1 | **M3 Forskningsläget** (Min Sida + Kunskapsflödet) | Snabbast kundnytta per timme; ingen ny infrastruktur; synliggör P6-arbetet direkt | L |
| 2 | **M1 AI-mentorn + bolagsfakta** | Störst daglig beröring — varje chattfråga om verkliga bolag uppgraderas; mentorn blir konkret | L–M |
| 3 | **M2 AKM2 i kalkylatorn** | Riskfri (invarianten), monterar 4 döda motorer, grund för all framtida AKM2-yta | M |
| 4 | **M4 Mejl-topp-3** | Ridder på M3:s urval; men kräv beslut om mejl-leverantör först | L |
| 5 | **M5 Uppföljningsaktivering** | Högst direktivsvärde men kräver persistensbeslut (Supabase) — gör det medvetet, sist | M–H |

M1 och M3 kan parallelliseras (skilda ytor); M4 startar först när M3:s urvalslogik
landat; M5 föregås av ett kort styrelsebeslut om datamodell (Supabase-tabell).

## 4. Vad som INTE bör byggas (över-engineering)

1. **Superanalys + AKM2-moduler (förslag g) som eget megaprojekt nu.** Superanalysens
   24-stegs-UX fungerar och är elevens arbetsredskap; foga AKM2 först när M2
   kalibrerats i kalkylatorn. Annars riskeras två halvfärdiga sanningar.
2. **Cron-schemaläggning av organ-bus/styrelse-rundor.** Internt självstyrelse-
   teater utan kundnytta; system_events-kvoten är en bunded resurs.
3. **Push-notiser / fler notiskanaler.** Ingen idé före M5 — kanalen (NotisCenter)
   saknar fortfarande verklig portföljdata att andas.
4. **Sammanslagning av dashfraga- och chatbot-NLU till ett gemensamt ramverk.**
   Refaktor utan ny förmåga; M1 utökar NLU:n där den nyttas istället.
5. **Live-FVag som ersättning för korstabell-grund på /portfolj-forskning.**
   P6:s leveransprocess fungerar; fundamental-vagmotorn i produktion är ett eget
   projekt (own cron, own caching) — inte en integration.
6. **Insidermodulen V29.** Dokumenterat inaktiv i väntan på manuell
   Finansinspektionen-data.
7. **Rewiring av cron/expand-courses till dynamic-catalog-modulen.** 2 896 rader,
   noll elevnytta, hög regressionsrisk — notera gapet, rörs inte.
8. **Konfluens-kolumn på /topplista + lasEllerHamta på /api/konfluens.** Rätt
   önskningar men småfynd — lägg som "städvåg" efter M1–M5, inte i mandatet "Mega".

## 5. Genomgående risker & principer (styrkort för samtliga M)

- **Lagen 2007:528:** alla nya ytor beskriver, dömer aldrig — disclaimern följer
  med i chatt, kort OCH mejl.
- **Ärlighetsprincipen:** korstabellen är daterad 2026-09-03 — varje ny yta bär
  "senast kontrollerad"; "osatt" är ett svar, inte ett fel.
- **Determinism:** veckourval (M3) och topp-3 (M4) haschas ur datum/veckonummer —
  samma indata ger samma svar, inga prognospilar.
- **Vercel read-only fs:** all persistens till Supabase, aldrig filer (M5).
- **Testdisciplin:** varje M levererar med tilfälle i verktyg/validera-motorer.mjs
  (idag har bara 4 av 42 motorer validering) — M2:s invariant-test är redan skrivet
  i verktyg/testa-akm2-karna.mjs och bör flyttas in i huvudvalideringen.

## 6. Källor

- data/motorregister.json (VÅG 49, 2026-09-03) — med korrigeringar enligt §0
- src/lib: chatbot-nlu.ts, korstabell-data.ts, uppfoljning.ts, riskportfolj.ts,
  analysbank.ts, signal-bus.ts, notiser.ts, email-mallar.ts, akm2/karna.ts,
  akm2/vikter.ts, akm2/moduler/index.ts, superanalys.ts
- src/app/api: chatbot/route.ts, cron/email/route.ts, cron/portfolj-uppfoljning/route.ts,
  portfolj-forskning/route.ts · vercel.json (cron-schema)
- src/components/ak1a: notis-center.tsx, kunskaps-flode.tsx, min-sida.tsx,
  akm1-calculator.tsx, portfolj-forskning/bygg-portfolj-kort.tsx, portfolio-system.tsx
- data/portfolj-system: korstabell-grund.json (100 rader, 7 gröna), uppfoljning/EXEMPEL.json
- Git: commit 3f24914 ("autonomi+integration") — stängda registergap
