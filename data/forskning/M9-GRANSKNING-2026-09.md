# M9-GRANSKNING 2026-09 — kundens första riktiga granskningskö

**Läge (våg 95, M9-FABRIKEN):** m9-fabriken (`verktyg/m9-fabrik.mjs`, m9-fabrik-v2)
har levererat sitt första produktionsinnehåll till granskningskön i Supabase:
**3 utkast** — ett per evergreen-serie — med `av="m9-fabriken"`, `status="utkast"`
och fullständigt granskningsunderlag inbakat i varje utkast. Sonden kördes först
(skriv → återläs → städa → verifiera; kön lämnades opåverkad), därefter
produktionsskrivningen. En oberoende återläsning (`tool-results/m9-verifiera-koe.mjs`,
57 kontroller) bekräftar: kontraktet enligt `src/lib/blogg-utkast.ts` håller,
källornas md5 stämmer mot de faktiska filerna, determinism-seedet går att räkna om,
och kontrolleraText kört med **0 FEL, 0 varningar** på samtliga utkast.

**Läge (våg 96, D3 — M9 SERIE 4-6):** fabriken bär nu **sex** evergreen-serier;
tre nya utkast (v1 var) + `branschmedianer-akm2` v2 ligger i kön — se §7.

**Grundregeln består (våg 66):** maskinen kan ALDRIG sätta "granskad" eller
"publicerad". Statusen är härdenkodad "utkast" i fabrikens skrivfunktion, och
publicering sker endast via exportvägen — efter ditt klick. Din granskning är
inte formalia; den är hela poängen med systemet (lagen 2007:528: utbildning,
aldrig rådgivning — människan äger publiceringen).

---

## 1. Så granskar du — steg för steg i panelen

1. **Logga in i admin.** Öppna `/admin` och lås upp med ADMIN_PASSWORD.
2. **Öppna fliken "Blogg ✍️".** Listan hämtar granskningskön live
   (senaste-vinner per slug; cachad 60 sekunder — uppdatera sidan om du just
   granskat). Filtrera gärna på **"Utkast"**.
3. **Öppna ett utkast** (de tre slugar du ska se finns i §2 nedan). Editorn
   visar titel, ingress och hela bodyn i markdown.
4. **Läs igenom och stäm av.** Varje utkast bär ett avsnitt
   **"## Granskningsunderlag — maskinens kvitto"** i slutet av bodyn: källor
   (fil + md5), dataurdrag (värde · datum · notering), determinism-seed och
   kontrollresultat. Kontrollera även att:
   - talen i texten överensstämmer med dataurdraget (samma tal, samma datum),
   - inget låter som rådgivning (se §4 — kontrolleraText fångar de förbjudna
     fraser som FEL, men din bedömning gäller för tonen),
   - texten låter som AK1A: rak, varm, professionell — inga påhitt.
5. **Redigera om du vill.** Du kan ändra texten direkt i editorn och spara —
   det skrivs en ny version (v2, v3 …) och historiken bevaras som
   granskningsspår. Mindre ändringar är normala; fabriken levererar utkast,
   inte färdigprosa.
6. **Ta BORT kvitto-avsnittet före export.** När du är nöjd: radera hela
   avsnittet "## Granskningsunderlag — maskinens kvitto" (fram till och med
   raden om status) ur bodyn och spara. Kvittot är arbetsmaterial för din
   granskning — det ska aldrig publiceras. Den negerade disclaimern sist i
   bodyn ska däremot stå kvar (exportvägen kompletterar den om den saknas).
7. **"Skicka till granskad".** Knappen aktiveras först när serverns egen
   kontrolleraText-kontroll på den EXAKT sparade texten visar 0 FEL —
   det är grinden utkast → granskad. Nu har DU granskat; maskinen har bara
   passerat sin del.
8. **Publicera — två vägar (välj en):**
   - **"Publicera (skickar till agent)"** (våg 82 B2): kör samma 0-FEL-grind,
     sätter status "publicerad" och postar en agent-påminnelse som main-agenten
     plockar — filen droppas i `data/blogg/<slug>.json` + commit → live vid
     nästa main-push. Utkastet visas då under filtret **"Väntar på agent"**.
   - **"Exportera klar post"** (Läge A, reservväg): kopierar/laddar ner
     JSON-paketet (exakt BlogPost-formen: pillar "Institutionell metodik",
     author "AK1A Research Lab", publishedAt = dagens datum, disclaimer
     säkerställd sist). Paketet droppas manuellt i `data/blogg/<slug>.json`
     + committas av main/agent.

**Första gången:** öva gärna flödet på ett utkast i panelen utan att publicera
— det kostar inget; raderna ligger kvar i kön tills du agerar.

---

## 2. De tre evergreen-serierna — vad de handlar om

Serierna är månadsvisa, evergreen-uppdaterade poster ur forskningsdatan
(aldrig månadsduplikat: oförändrat underlag ⇒ inget nytt utkast). Samma slug
uppdateras; "Ändringen sedan senaste publicerade utgåvan" redovisas i texten.

| Slug | Serie | Vad den redovisar | Underlag (datum) |
|---|---|---|---|
| `branschmedianer-akm2` | Branschmedianer | AKM2-medianen per bransch i korstabellens 100-bolagsuniversum, med antal mätta, spridning, ytterlighetsbolag, peer-motorns regler (n ≥ 5, jämnt antal ⇒ medel av mittersta) och investmentbolags-not | korstabell-grund.json (2026-09-03) |
| `forskningslaget-grona-av-100` | Forskningsläget | Statusfördelningen gröna/gula/röda/osatta + regimen (rikt/balanserat/magert) enligt FASTA trösklar; lägestexterna ordagrant ur motorn; de tre högst rankade gröna bolagen (deskriptiv rankning, ej värdering) | korstabell-grund.json (2026-09-03) |
| `vagkartan-traffprocent` | Vågkartan | Vågmotorns rullande träffprocent per horisont och vågklass, dom-protokollet ordagrant, osatta andel (räknas aldrig som fel) — "ett öppet kvitto om det förflutna, aldrig en garanti om framtiden" | vagvalidering-SENASTE.md (domdatum 2026-09-04) |

Septemberutgåvans tal i korthet: teknik högst median (61), finans lägst (41) ·
7 gröna av 100 ⇒ regimen magert (andel gröna 7 % < 8 %-tröskeln) · träffprocent
52 % på 48 dömda mätningar (osatta 20 %).

---

## 3. Septemberutgåvorna är REDAN live — vad det betyder för dig

Våg 66:s pilot publicerade septemberutgåvorna direkt i `data/blogg/` (sedermera
handpolskade, commit `b375518`) — **utanför** granskningskön. Därför skrevs det
här köutkastet med fabrikens nya bootstrap-undantag `--tvinga` (se §5): underlaget
har inte rört sig sedan pilotutgåvan, men du har aldrig fått granska den i systemet.

Konkret för din granskning:

- Utkastens tal är identiska med de live publicerade septemberposternas (samma
  källor, samma datum) — kvittot i varje utkast bevisar det.
- **Om du exporterar/publicerar ett köutkast ersätter utkastets body den
  finslipade live-texten** för den slugen. Septemberposterna på sajten är
  handpolskade varianter; fabriken skriver om sina mallar. Vill du behålla de
  live texterna: granska utkasten, öva flödet, och låt septemberutgåvorna stå —
  nästa månads utkast (nytt underlag) kommer då helt via kön.
- Filhistoriken i `data/blogg/` är din rollback om något skulle kännas fel.

---

## 4. Maskinens kvitto vs ditt eget — vem ansvarar för vad

**Maskinens kvitto (redovisat, inte påstått):**
- `details.fabrik` i varje körad: version, seed, kandidat-md5, källor (fil+md5),
  dataurdrag (värde+datum), kontrollresultat — maskinläsbart för
  gransknings-agenten, osynligt för panelen.
- Avsnittet "Granskningsunderlag — maskinens kvitto" i bodyn — samma
  underlag, synligt för dig i editorn.
- kontrolleraText (spegel av `data/varumarke.json`, samma källa som
  `src/lib/varumarke.ts`) på titel + ingress + varje kroppsrad: 0 FEL,
  0 varningar denna omgång; strukturen kontrollerad (body ≥ 800 tecken,
  ≥ 2 "##"-rubriker, negerad disclaimer sist).
- Determinism: seed = md5 av källfilernas md5 + månadsnyckel ur underlagens
  EGNA datum (aldrig klockan). Samma källfiler ⇒ byte-identiskt utkast.

Maskinen redovisar alltså **var talen kommer ifrån och att reglerna följts**.

**Ditt eget (kan inte maskineras):**
- Läsa texten som människa: stämmer det, är det begripligt, är tonen AK1A?
- Döma om innehållet är lämpligt att publicera — just nu, i ditt namn.
- Ta bort kvitto-avsnittet, sätta "granskad", välja exportväg.
- Ansvaret för att publiceringen håller lag (2007:528), varumärke och
  sanning. Grinden ser till att texten är rensad från förbjudna formuleringar
  ("garanterad avkastning", "aktietips", o-negerat "investeringsråd" …) —
  men granskad-status och publicering är och förblir ditt klick.

---

## 5. Fabrikändringar denna våg (dokumentation, `verktyg/m9-fabrik.mjs` endast)

1. **`--tvinga` (bootstrap-undantag, ny flagga):** evergreen-regeln jämför mot
   senast publicerade utgåva i `data/blogg/<slug>.json` — men våg 66:s pilot
   publicerade septemberutgåvorna utanför kön, så kön kunde aldrig fyllas första
   gången. `--skriv --tvinga` skriver utkast även för oförändrat underlag, som
   medvetet val (spegling av våg 66-pilotens egen `--tvinga`-spärr för
   granskade poster). Default utan flaggan är oförändrat: evergreen-regeln gäller.
2. **`kortNamn`-buggfix (dubbeltkommatecken):** "Warner Bros. Discovery, Inc." /
   "Prologis, Inc." lämnade ett kvarvarande komma när suffixet ströks
   ("Discovery,,") — samma fel som polsk-commit `b375518` åtgärdade i de
   publicerade filerna; nu fixat i mallen (suffix-regexen äter även kommat framför
   suffixet). Alla tre serier omkontrollerade efter fixen: 0 FEL, 0 varningar,
   0 dubbeltkommatecken.

`src/` är orört. Källfiler (`data/portfolj-system/`, `data/rapporter/`,
`data/varumarke.json`) är lästa, aldrig skrivna. Verifieringsskriptet
`tool-results/m9-verifiera-koe.mjs` (gitignorerad katalog) läser nycklar ur
`.env` vid körning — nycklar loggas eller skrivs aldrig.

---

## 6. Verifieringsresultat (2026-09-11, `tool-results/m9-verifiera-koe.mjs`)

- **Sond:** 3 skrivna · 3 återlästa (form-korrekt) · 3 städade · 0 kvar ·
  granskningskön opåverkad (0 rader före och efter).
- **Produktionsskrivning:** 3 utkast, v1 per slug, `av="m9-fabriken"`,
  `status="utkast"`, `severity="info"`, `source="blogg"`,
  `message="[blogg] <slug> v1 utkast"`.
- **Oberoende omkörning:** kontrakt 19/19 per utkast ✓ · källornas md5 mot
  faktiska filer ✓ · seed omräknat ur käll-md5 + månadsnyckel (determinism
  bevisad, `904e0fcc…`) ✓ · kontrolleraText 0 FEL 0 varningar ✓ · struktur
  (längd, rubriker, disclaimer sist) ✓ · negerad investeringsråds-disclaimer
  sist i varje body ✓.
- **Röst/läsning (manuell):** rak, varm, professionell; svenska talformat
  (60,5 · 52 %); rankningar uttryckligen deskriptiva ("inte en värdering");
  inga rådgivningsformuleringar.

*Nästa omgång: när korstabellen/vågvalideringen rör sig (ny månad) körs
`node verktyg/m9-fabrik.mjs --skriv` utan flaggor — evergreen-regeln släpper
då igenom nya utkast automatiskt, och oktoberutgåvorna går hela vägen genom
sex seriers granskningskö — den du nu lärt känna.*

---

## 7. Våg 96 (D3): serierna 4-6 — kassaflöde, utdelningar, börspsykologi

Fabriken har vuxit från tre till **sex** evergreen-serier (ändring ENBART i
`verktyg/m9-fabrik.mjs`; `src/` orört). Tre nya utkast ligger nu i kön — v1
var, `av="m9-fabriken"`, `status="utkast"`, samma hårda grindar som serierna
1-3 (kontrolleraText-spegel, strukturkrav, md5-kvitton, härdenkodad utkast-
status). Granskningsflödet i §1 gäller oförändrat: läs, stäm av mot kvittot,
ta bort kvitto-avsnittet, "Skicka till granskad", export.

### De tre nya serierna

| Slug | Serie | Vad den redovisar | Underlag (datum) |
|---|---|---|---|
| `kassaflodesanalys-101` | Kassaflödesanalys 101 | Fria kassaflöden i universum: FCF-marginal (92/100 mätta, median 10,8 %), FCF-avkastning (87/100, median 3 %) och **härledd** konverteringsgrad (fcfMarginal ÷ nettoMarginal, 84 mätbara, median 0,78, 29 över 1,0) — härledningen redovisas öppet i texten. Deskriptiva rankningar (topp/botten-5), aldrig råd | bolagsunivers.json (hämtat 2026-09-03) |
| `utdelningar-101` | Utdelningar 101 | Utdelningsandel + direktavkastning som **begrepp** (räkneexempel med tydligt märkta tal, "inte ur underlaget") + det som FINNS i data: FCF-avkastningen som tak på hållbar utdelning (26 bolag > 5 % · 28 st 2–5 % · 33 st < 2 % · 9 negativa). **Ärlighetsvinkel:** per-bolags utdelningsdata levereras inte av källorna (återköpsfältet 0/100 mätt) — fabriken upprepar aldrig utdelningstal den inte har | bolagsunivers.json (hämtat 2026-09-03) |
| `boerspsykologi-fallstugor` | Börspsykologi: fallstudier | Tre undervisningscase ur vågvalideringens dömda historik: (1) "100 % träff" på n=2 — P(2/2 \| slant) = 25 %, alltså förklarar slumpen utfallet; (2) basbygge 0 träffar på n=12 (medellång + mega) — P(0/12 \| slant) ≈ 0,02 %, antagandet "lugn period" var det som föll; (3) osatt döms ALDRIG — disciplinen att inte tolka luckor. Inga personnamn: vågdata bär bara tickers och horisonter | vagvalidering-SENASTE.json (domdatum 2026-09-04) |

### Dataanpassningen (viktigt att känna till som granskare)

Uppdraget var kassaflöde/utdelning/psykologi — men fabriken bygger ENBART på
fält som finns i repoets datafiler. Därför: kassaflödesserien läser
`lonksamhet.fcfMarginal`, `lonksamhet.nettoMarginal` och `vardering.fcfYield`
(riktiga, mätta fält) och härleder konverteringsgraden ur två av dem med
omsättningen som gemensam nämnare — aritmetik som redovisas i både text och
kvitto. Utdelningsserien hade INGA utdelningsfält att läsa (`aterkop`-fälten
är null i samtliga 100 rader) — därför lär den ut begreppen och redovisar
FCF-taket + täckningen i stället, med luckan öppet nämnd i texten. När
källorna börjar leverera utdelningsdata kan serien byta vinkel. Detta är
systemet som designat: fabrikens tal är alltid spårbara till fil.

### Källor och determinism (serierna 4-6)

- **Nya läs-only-källor:** `data/portfolj-system/bolagsunivers.json` och
  `data/rapporter/vagvalidering-SENASTE.json` — båda md5-redovisade i varje
  utkasts kvitto (serierna 4-6 bär EGNA käll-arrayer med två filer var;
  serierna 1-3 bär de ursprungliga tre). Båda ingår i färskhetsvakten (45 d).
- **Globala seedet är OFÖRÄNDRAT** (`904e0fcc…` — fortfarande md5 av de tre
  våg 95-källorna + månadsnyckel ur underlagens egna datum), så våg 95:s
  kö-rader förblir verifierbara. De nya källornas md5 ingår i kandidat-md5,
  vilket ger samma determinismbevis (samma filer ⇒ byte-identiskt utkast).

### Vad just DU granskar i serierna 4-6 (utöver §1:s generella steg)

1. **Kassaflödesanalys:** att konverteringsgraden presenteras som härledd
   (inte som mätt fält), och att topp/botten-listorna formuleras som
   sorteringar av data — inte omdömen om bolagen.
2. **Utdelningar:** att räkneexemplen är märkta "inte ur underlaget" (de är
   pedagogiska tal, fyrkantiga och tydligt avgränsade), och att serien
   inte läcker in något som liknar direktavkastningstal per bolag.
3. **Börspsykologi:** att binomialräkningarna stämmer med n i kvittot
   (25 % respektive 0,02 %), att fallen är skrivna som utbildning (vad
   antagandet var, hur det föll), och att ingen människa nämns vid namn.
4. **Samma juridik som alltid:** utbildningsexempel i AK1A-röst, svenska,
   aldrig investeringsråd-formuleringar — grinden fångar de förbjudna
   fraserna, men tonen är ditt.

### Utfall denna våg (2026-09-11)

- **Sond först:** 6 skrivna · 6 återlästa (form-korrekt) · 6 städade · 0
  kvar · kön opåverkad (7 rader före och efter).
- **Produktionsskrivning (`--skriv`, ingen `--tvinga` behövdes):**
  `kassaflodesanalys-101` v1 · `utdelningar-101` v1 ·
  `boerspsykologi-fallstugor` v1 + `branschmedianer-akm2` **v2** —
  statistiken rörde sig sedan den publicerade utgåvan, men bara genom
  kortNamn-buggfixen från våg 95 ("Prologis," → "Prologis",
  "Warner Bros. Discovery," → "Warner Bros. Discovery" i statistikens
  ytterlighetsbolag; medianerna är identiska). `forskningslaget-grona-av-100`
  och `vagkartan-traffprocent` skippades korrekt (OFÖRÄNDRAT — evergreen-
  regeln).
- **Oberoende verifiering** (`tool-results/m9-verifiera-koe-v96.mjs`, våg 95-
  mönstret + talgrunding): alla 6 utkast OK — kontrakt, källornas md5 mot
  faktiska filer, global seed omräknad, kontrolleraText 0 FEL 0 varningar,
  strukturkrav, negerad disclaimer sist, kvitto-avsnitt närvarande, och
  nyckeltalen omräknade ur källfilerna (medianer, räkningar, binomial).

---

## 8. Uppdatering 2026-09-16 (dokvåg s9-u2) — kön har vuxit bortom serierna

§1–7 ovan speglar våg 95/96-läget (2026-09-11): sex evergreen-serier i
Supabase-kön. Sedan dess har granskningskön vuxit till ett träd med fyra
delar — allt nedan MÄTT i arbetsytan 2026-09-16 (ls per katalog, räknat
fil för fil — inte läst ur worklog):

| Del | Innehåll | Mätning 2026-09-16 |
|---|---|---|
| Roten `data/blogg-utkast/*.json` | Bransch- och nyckeltalsguider (bankaktier, halvledare, P/E-talet, portföljteori, nyemission …) | **28 JSON** |
| `m9-ko/` | Sex M9-serierna (§2 + §7) + index.json | **6 utkast** |
| `kvartal/2026-q3/` | Kvartalsserien (V152 fas 2–3): "Så läser du …"-läspaket per bolag + branschkalendrar | **28 filer = 18 bolagspaket + 10 kalendrar** |
| `granskning/` | Granskningsunderlag: MD-versioner, diff-filer, kontrollrapporter | **47 filer** (31 MD · 14 diff.json · kontroller) |
| `GRANSKNINGSKO-SAMMANSTALLNING.md` | **Kundens kö-vy** — hela kön som en lista | 38 kB, senast uppdaterad 2026-09-16 09:44 |

Vad det betyder för dig:

1. **Ditt inträde till hela kön är sammanställningen.** Öppna
   `data/blogg-utkast/GRANSKNINGSKO-SAMMANSTALLNING.md` — varje rad är ett
   utkast som väntar på dig, med status, källor och not. Kvartalsserien
   redovisas där med fullständig källtäckning per paket.
2. **M9-serierna granskas som tidigare — §1 gäller oförändrat.** Sex serier
   ligger i Supabase-kön och panelens flöde (läs → stäm av mot kvittot →
   ta bort kvitto-avsnittet → "Skicka till granskad" → export) är samma.
   Att de hålls aktuella syns i granskningskatalogen: tre av serierna
   (branschmedianer, kassaflödesanalys, börspsykologi) har
   KONTROLL-rapporter daterade **2026-09-16**.
3. **Grundregeln består i ALLA delar av kön:** maskinen sätter aldrig
   "granskad" eller "publicerad" — publicering är ditt klick (R2), oavsett
   om utkastet kommer från M9-fabriken, kvartalsserien eller
   branschguiderna.
4. **Evergreen-notis:** M9-seriernas underlag (korstabell-grund.json,
   vågvalideringsdomarna) är oförändrade sedan 2026-09-03/09-04 —
   evergreen-regeln släpper därför inga oktoberutgåvor ännu; nya
   månadsutkast kommer när underlagen rör sig. Köns totala volym drivs
   just nu av kvartalsserien (18 paket mot rappdagarna 2026-10-01 →
   2026-10-27) och branschguiderna.

*Levande hållning: denna sektion uppdateras när köns storlek eller form
ändras — nästa dokvåg mäter igen.*

---

## 9. Uppdatering 2026-09-20 (dokvåg s9-u2) — kön fördubblad på fyra dagar; m9-familjen grön; speglingsklassen född

§8 ovan speglar 09-16-läget. Allt nedan MÄTT i arbetsytan 2026-09-20
~12:4x lokal (ls/stat/wc per katalog + `m9-ko/index.json` — inget läst
ur worklog):

| Del | 09-16 (§8) | 09-20 (denna mätning) |
|---|---|---|
| Rot `data/blogg-utkast/*.json` | 28 | **78** — varav **13 arabiska speglingar** (`*-ar.json`, ny klass) |
| `m9-ko/` | 6 utkast + index | **6 utkast + index** — oförändrad uppsättning (mtider 09-14 15:11 = dumpkonsolideringen, se nedan; själva produktionsskrivningarna är från 09-11 enligt `created_at`) |
| `kvartal/2026-q3/` | 28 = 18 paket + 10 kalendrar | **74 = 64 bolagspaket + 10 kalendrar** (+46 paket) |
| `granskning/` | 47 (31 MD · 14 diff.json) | **150** — 83 MD (varav 43 KONTROLL + 11 KOMPLEMENT) · 66 diff.json · 1 ren diff |
| `GRANSKNINGSKO-SAMMANSTALLNING.md` | 38 kB, 09-16 | **252 kB, 09-20 09:07** (×6,6 — sammanställningen lever, uppdaterad samma morgon) |

### Vad det betyder för dig

1. **m9-familjen är komplett granskad på underlagssidan — sex av sex
   FLYTTKLARA.** §8:2 redovisade kontrollrapporter för tre serier
   (09-16); sedan dess har oberoende kontroller (09-19) grönmarkerat
   även kassaflödesanalys, börspsykologi, branschmedianer och
   forskningsläget — sammanställningens m9-sektion bär domarna med
   länkar till respektive KONTROLL-rapport. Nästa steg i kedjan är
   DITT: granskning + klick (R2 — publicering är och förblir ditt
   beslag, styckvis eller som grupp).
2. **Grundregeln är nu också mätt i databasen.** `m9-ko/index.json`
   (read-only dump av Supabase-kön, 09-14 13:10Z): **7 rader, samtliga
   `status="utkast"`** — branschmedianer bär v1+v2 (senaste-vinner), de
   övriga fem v1. Att maskinella kontroller gett grönt ljus har alltså
   INTE ändrat någon status: "granskad"/"publicerad" sätts aldrig av
   maskinen, exakt som §"Grundregeln" lovar. Filernas mtider 09-14
   15:11 är själva dump-konsolideringen (`index.json` → `dumpad`
   13:10:36Z = 15:10:36 lokal), inte nya skrivningar.
3. **Speglingarna är en ny klass i roten: 13 `*-ar.json`.** AR1–AR5
   (bankaktier, fastighetsaktier, läkemedelsaktier, teknikaktier,
   telekomaktier) är oberoende granskade 09-19 — samtliga FLYTTKLARA
   med ord-/sifferparitet redovisad i sammanställningen. Åtta ytterligare
   ar-speglingar (bilaktier, detaljhandelsaktier, halvledaraktier,
   industriaktier, konsumentaktier, saasaktier, spelaktier,
   tillväxtaktier) ligger i roten — deras domar redovisas allt eftersom
   i sammanställningen. §1:s granskningssteg gäller oförändrat: kvitto
   är kvitto, klick är klick.
4. **Kvartalsserien växer mot rappdagarna:** 64 bolagspaket ("Så läser
   du …") + 10 branschkalendrar mot 2026-10-01 → 10-10-27. Din väg in
   är oförändrad: sammanställningens sektioner per rappdag.
5. **Evergreen-notisen — korrigerad och aktuell:**
   - korstabell-grund.json och vagvalidering-SENASTE.json rörde sig
     **09-10 16:33** (inte "oförändrade sedan 09-03/09-04" som §8:4
     sa) — rörelsen FÅNGADES av 09-11-körningen (branschmedianer v2;
     medianerna identiska, ändringen var kortNamn-fixen i
     ytterlighetsbolagen). Därefter stilla ⇒ inga oktoberutgåvor av
     serierna 1–3 och börspsykologin ännu.
   - **bolagsunivers.json rörde sig 09-20 07:59** (universumets
     tillväxtvåg) — det är källa till serierna 4–6
     (kassaflödesanalysen läser det). Nästa `--skriv`-körning av
     m9-fabriken kan därför producera en ny version av
     kassaflödesanalys-101 — utfallet styrs av fabrikens
     evergreen-jämförelse vid körningen. Nytt utkast landar i kön som
     alltid; publicering förblir ditt klick.

*Kö-poster (maskinellt underhåll, ej publicering): m9-fabrikens nästa
`--skriv` efter bolagsunivers-rörelsen 09-20; sammanställningens
branschguide-sektion redovisar än så länge endast staging-rader —
guidernas detaljer bor i `data/forskning/SEO-GUIDER-2026-09.md`.*

*Levande hållning: §9 uppdateras när köns storlek eller form ändras —
nästa dokvåg mäter igen.*
