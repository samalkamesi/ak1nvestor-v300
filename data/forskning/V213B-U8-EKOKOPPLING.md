# V213B-U8 — Kontraktssvit eko-koppling (fabriksleverans)

**Datum:** 2026-09-20 · **Våg:** 213b (uppgift u8 av 10) · **Resultat: 65/65 PASS — GRÖN**

## Vad som levererats

`verktyg/testa-motor-eko-koppling.mjs` — kontraktssvit för motorn
`src/lib/eko-koppling.ts` (eko-kopplingen: ekosystemets samverkansmotor,
där tracerns intresseprofil, kurstipsen, vågkartan, portföljen, quizzen,
veckoplanen och signal-bussen "samtalar" och väver samman pedagogiska
insikter som ingen källa ser ensam). V212:s motorregister konstaterade
102 motorer men bara 92 testade — våg 213B ger de 10 otestade minimala
kontraktssviter; detta är den åttonde.

## Metod

1. Motorfilen lästes FÖRST, rad för rad — inklusive dess tre beroenden
   (`signal-bus.ts`, `supabase-rest.ts`, `tracer.ts`) så att varje
   förväntan härstammar ur kod, aldrig påhittat beteende.
2. Miljöklass DETERMINISTISK: Supabase-env (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) stryks
   FÖRE import — `getSupabaseRest()` ⇒ null, inget skarpt anrop kan ske;
   `lasSignaler` andas vidare mot sina statiska signaler och
   `lasSenasteVagkarta` får sakna-läge. Transport- och E2E-kontrakten
   (portfölj-GET:arna, vågkartans system_events-läsning, signal-bussens
   flöde) verifieras istället under en kontrollerad `globalThis.fetch`-
   stub med ogiltig fake-konfig (`ekotest-fake.supabase.co` + uppdiktad
   nyckel): riktigt nätverk är onåbart, stubben registrerar varje anrop
   och svarar deterministiskt. Ingen server, inga timers som överlever
   processen, inga externa processer. Klientkontexten testas med en
   window-stub (node saknar window — motorns egen SSR-vakt).
3. TS-import via `verktyg/_o106-ts-import.mjs` (resolve-hook, Node ≥
   22.18 type stripping) — körs i REN node v22.23.2, tsx-återfall
   behövdes ej. Körtid 0,29 s (tak 60 s). Omkörning byte-identisk:
   determinism bevisad.

## Kontrollområden (65 kontroller)

- **A — modulkontraktet** (2): de fem exporterade funktionerna är
  funktioner; `EKO_FAS2_NIVA === 25` (dokumenterad Fas 2-tröskel).
- **B — renSlugLista, ren kärna** (7): icke-array ⇒ []; trim; svenska
  tecken åäöÅÄÖ giltiga; charset- och längdregler (ledande bindestryck,
  mellanslag, understreck, punkt, 81 tecken avvisas); icke-strängar
  hoppas; taket boundar FÖRE push (fem giltiga med max 3 ⇒ de tre
  första); max 0 ⇒ tomt.
- **C — lasKlientkontext i SSR** (2): node utan window ⇒ gästens form
  (nivå 1, tomt överallt, quiz 0/0, portfölj tom); exakt de tio
  dokumenterade nycklarna.
- **D — lasKlientkontext med lokal profil** (8, window-stub): xp →
  nivå `floor(xp/100)+1` med gränserna 99⇒1, 100⇒2, 9900⇒100, 1e18⇒100
  (klamp 1–100, xp-tak 1e8); trasig/ogatlig JSON ⇒ tyst nivå 1; klara
  kurser saneras genom slug-reglerna; streak `{ antal }` med tak 3650
  (tal-form och "många" ⇒ 0); tracerns profil flödar in (aktivTid,
  quiz 8/2, toppintresse fundamental); oavgjort toppoäng ⇒ första
  spåret i INTRESSE_NYCKLAR-ordning; portföljfälten lämnas ALLTID tomma
  av klientläsaren (servern fyller i — främmande localStorage-nycklar
  ignoreras).
- **E — lasPortfoljForMedlem fail-safe** (2): utan konfig och med tomt
  id ⇒ `{ antal: 0, sektorer: [] }`, aldrig kast.
- **F — raknaEkoInsikter, deterministisk kärna** (17): gäst (null och
  undefined) ⇒ exakt 2 insikter (fas2-kvar prio 4 + eko-koppling-
  fyllnad prio 5, sorterad); motorn aldrig tom; R1 tracer+kurstips med
  alla pass-regler ur koden (ts-/ak1ts, v\d{2}-, pf-/portfolj-,
  bf-/km-03[5-7] — km-034 blockerar INTE) och första-kurs-länkarna per
  spår; R3 quiz+veckoplan (träff < 50 % vid underlag ≥ 3; exakt 50 % ⇒
  tyst; 0/3 ⇒ synlig med "0 % träff"); R5 fas2 (25 ⇒ nådd prio 1 +
  /fas2-ansok; 24 ⇒ "1 kurs" singular prio 1; 19 ⇒ "6 kurser" prio 4)
  och textens mätare (nivå x av 25, klara kurser, "2 timmar"/"30
  minuter" av aktiv tid, bredd "1 av 4 spår" där skräpnycklar räknas
  bort); R2 kräver vågkarta (utan konfig ⇒ tyst även med portfölj);
  R4 mot den statiska andningen (fundamental matchas av statiska
  vagscan-signalen; teknisk ⇒ tyst då konfluens/netnet är fas2-dolda);
  sortering + dedupe; ALDRIG kast vid fientlig (men typad) kontext.
- **G — portföljens transportkontrakt under stub** (10): exakta URL:er
  (`client_portfolios?member_id=eq.<id>&select=id&order=created_at.desc&
  limit=1` → `client_holdings?portfolio_id=eq.<pid>&select=ticker,sector&
  limit=50`) med apikey/Authorization-header och cache no-store;
  sektormappning (antal = rader, sektorer unika+gemener+trimmade, tom
  sektor hoppas, tak 24 i första-förekomst-ordning); felvägar (rad utan
  giltigt id ⇒ INGET holdings-anrop, icke-array-json, 401, fetch-kast ⇒
  allesamman `{ 0, [] }` tyst); memberId trunkeras till 64 tecken och
  specialtecken encodeURIComponent:as ("a%26%3Fb").
- **H — raknaEkoInsikter E2E under stub** (10): R2 positivt (206
  impulsvågor mot 84 + 3 innehav utan värdesektorer ⇒ marknad, prio 3,
  /min-portfolj, texten räknar 206/84 + "3 innehav"); värdesektor-
  blockadens substring-matching BÅDA vägar ("finans" exakt,
  "storbank" innehåller "bank", "bank" innehåller "ban" ⇒ tyst;
  ["tech","healthcare"] ⇒ synlig); R2-grindar (impulsvågor ≤
  korrigeringar ⇒ tyst; 0 innehav ⇒ tyst); vågkartans två källor
  (universumSammanfattning ur system_events med renTal-sanering —
  talsträng accepteras, negativ nollställs — och summa-vakten 0/0, samt
  signal-fallback med regex "N impulsvågor … M korrigeringar"); R4 E2E
  (konfluens matchar teknisk: signalens rubrik + ikon, text trunkeras
  vid exakt 220, extern länk avvisas REDAN i bussen ⇒ insikten får
  fallback-dörren /min-sida — aldrig extern); mottagar-synlighet
  (fas2-signal dold för "alla" även när rader lästs); R4-området
  (beteende-topparing med tracer-signal ⇒ "beteende", annars "marknad").
- **I — raknaKallsystem, ren funktion** (5): "+ "-split med dedupe i
  första förekomst-ordning; null/undefined ⇒ []; tomma/skräp-källor
  hoppas; mellanslag kollapsas; käll-del > 40 tecken trunkeras.
- **J — EkoInsikt-invarianter** (2, över samtliga 30 insikter sviten
  producerat): område ∈ vokabulären {utbildning, verktyg, beteende,
  marknad, fas2}, strängfält icke-tomma, prioritet heltal 1–5; länkar
  endast interna relativa ("/…", aldrig "//", ≤ 200 tecken).

## Ärligt rött — ett kontrollfel ägdes och rättades FÖRE leverans

Första körningen gav 64/65: kontroll H7 förväntade sig att en insikt
vars signal bar en extern länk skulle sakna länk-nyckel. Det var ett
påhittat beteende — koden (signal-bussens `renSignal` + R4:s
`matchande.lank ?? "/min-sida"`) avvisar externa länkar REDAN när
signalen byggs, varpå insikten får den interna fallback-dörren
"/min-sida". Kontrollen skrevs om till det faktiska (strikare)
kontraktet: en extern länk får ALDRIG synas i insikten. Inget äkta
motorfel funnet; src/ orörd; inget test sänktes.

## Fynd av värde för vidare drift

- Motorns fail-safe-arkitektur höll i varje utfall: utan konfig, vid
  401, vid nätverkskast och vid icke-array-json levereras alltid det
  tomma läget — aldrig kast, aldrig delvis data.
- Dubbel försvarslinje för länkar bekräftad: både signal-buss och
  eko-koppling validerar "endast intern relativ länk" oberoende av
  varandra (försvar i djupled).
- `lasKlientkontext`-kontraktet "portföljen lämnas tom av klienten"
  gäller även när främmande nycklar finns i localStorage — P8/PGD-
  separationen (sammanfattad lokaldata, portföljen server-side) är
  mekanisk, inte konvention.

## KVD

- `node --check verktyg/testa-motor-eko-koppling.mjs` ⇒ OK.
- Körning: ren `node v22.23.2` (typstrippning + _o106-resolve-hook),
  65/65 PASS, exit 0, 0,29 s; omkörning byte-identisk (determinism).
- Senaste raden `RESULTAT: 65/65 PASS` — läsbar av fabriken.
- src/ orörd; R2-ytor orörda; ingen publicering i data/blogg/.

*Protokollet dokumenterar kvalitetsarbete och systemkontroller i en
utbildningsplattform — innehåller inga rekommendationer om värdepapper
(lag 2007:528; utbildning enligt 2 kap 5 §).*
