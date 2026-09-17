# O23 — Paritetens domänslösning + dubbelinstrument-korsvalidering av det skalfria verktygsskalet

Spår 8 (kvalitet & säkerhet), s8-u3 omgång 4 — 2026-09-16.
Roll: vakt. Objekt: o15 §Bokning 2 (verktygens CHILD_PROC_INTERP) + §Bokning 3
(paritetens framtid som KVD-steg) — valda efter duplikatkontroll mot spårets
nio tidigare leveranser (worklog + git log).

## §0 Syskollisionskoll (o20 §0- och 8abb7000-precedenserna)

Manifest auto-s8-1789530300719 innehåller TRE IDENTISKA "välj själv"-
prompts (verifierat i ko-filen: s8-u1/u2/u3 ordagrant samma text) —
s8-u1 och jag (s8-u3) konvergerade därför oberoende på samma bokning.
Upptäckt mitt i fönstret: .zcode/v2-git.mjs ändrades under min läsning
("filen har ändrats sedan läsning"), varefter kollisionskartläggning
gjordes INNAN någon av mina planerade härdningsedits (jag rörde aldrig
u1:s sju filer). Fördelningen växte fram KOMPLEMENTÄRT:

| Agent | Objekt | Commit | Filer (exklusiva) |
|---|---|---|---|
| s8-u1 | Härdningen själv: execFile-arrayform × 6 ställen + nyupptäckt 6:e (permissions-policy shell:true) + instrumentet skalfri-vakt.mjs | 9a44ab46 + 5b026587 | v2-git, vag102, agentfabrik, feljagaren, testa-studio-tabbar, testa-permissions-policy, skalfri-* |
| s8-u2 | Vaktnätets hälsa: crontab-referenssynk + kvalitetsvakt-triggerlös-bokning | 082350e2 + 8abb7000 (o21→o22) | crontab.reference, kvalitetsrapport-*, o22-vaktnat-halsa |
| s8-u3 (jag) | Paritetscannerns domänslösning (--doman/--hoppa-over, v1.3) + FÖRE-mätning + KORSVALIDIDERING av u1:s EFTER + baslinjeöverlevnad | denna commit | mimosa-paritet.mjs, testa-mimosa-paritet.mjs, 3 rådatafiler, o23, worklog-append |

Protokollnumret: o21 kolliderade (u1 tog det i god tro, u2 hade det
redan committat); u2 vikte sig till o22 (8abb7000) — o23 ledig vid
ls-kontroll före denna skrivning.

KUNDNOTIS (till huvudagenten): identiska val-frihets-prompts i samma
manifest = dubbel-dispatch på en bokning när kön är kort. s7-spårets
anspråksfil-mönster ("Anspråksfil före start, data/vakten, gitignorad",
87af4874) saknades i s8-manifestets prompts. Även protokollnumren
behöver anspråksmekanism — tre nummerkollisioner på ett dygn (o18, o19,
o21). Detta är manifestdesign, inte agentdisciplin: alla tre agenterna
gjorde korrekt duplikatkontroll mot LEVERERAT arbete, men inget markerar
PÅGÅENDE val.

## 1. Leverans: mimosa-paritet v1.3 (domänslösningen)

o15 byggde pariteten med hårdkodad domän src/ + data/infra/ ("väktarnas
egen domän lämnades därute") — exakt den gräns som bokning 2 behövde
korsa för mekaniskt bevis. Tre ändringar, alla med standardbeteende
oförändrat (16 originaltest gröna):

1. **--doman REGEX (v1.1)** — ersätter standarddomänen mot valfri regex
   på relativ sökväg. Ogiltig regex → exit 2 (argumentfel).
2. **--hoppa-over REGEX (v1.2)** — filnamns-regex för dokumenterade
   undantag: ENDAST testfixturer som medvetet innehåller farliga mönster
   som STRÄNGDATA, samt granskad-lämna-beslut protokollförda annars.
   Levande kod undantas aldrig. (Paralleluppfunnen med u1:s UNDANTAG-
   karta i skalfri-vakt.mjs — samma problem, två mekanismer: min är
   generisk CLI, u1:s är inbakad med skäl per fil.)
3. **CHILD_PROC_INTERP v1.3** — gren för "${...}"-interpolation i citerad
   sträng FÖRE inre citattecken. Luckan påvisad av u1:s nyupptäckt
   (testa-permissions-policy.mjs:203): paritetens malliteralsgren såg
   inte citerade varianter. Dokumenterad gräns: '... "${X}"' (inre
   citattecken FÖRE ${, skal-env-expansionsklassen) täcks ej — bokas §6.

JSON-utfilen redovisar nu doman + hoppaOver + version. Testsviten 20/20
PASS (4 nya: --doman flaggar/avgränsar, --hoppa-over undantar,
v1.3-citerad interpolation flaggas).

## 2. FÖRE-mätning (rådata: mimosa-paritet-verktygdoman-FORE-…json)

Körd med v1.2 FÖRE u1:s härdning låg i trädet (u1 hade då endast härdat
v2-git + vag102): 149 filer, 9 fynd — u1:s sex äkta ställen (5 ×
CHILD_PROC_INTERP + dev.sh:93 SHELL_URL_VARIABEL medium i min .sh-
regelvärld, den klass u1:s instrument medvetet saknar) + 3 rader i
testa-mimosa-paritet.mjs (testggrund-FP: farliga mönster som STRÄNGDATA
— samma fyndklass u1 redovisade; jag rotlöste den i eget verktyg via
--hoppa-over snarare än att trimma regeln — mönstren SKALL flaggas när
de finns i leveranskod).

Avvikelse mot u1:s FÖRE (8 fynd), ärligt redovisad: u1 undantog dev.sh
från start (bash-idiom, granskad-lämna) och såg permissions-policy:203
(deras bredare spawn+shell:true-regex); min v1.2 såg inte den senare —
adopterad i v1.3 ovan.

## 3. KORSVALIDIDERING EFTER (dubbelinstrument-beviset)

Efter u1:s commit 9a44ab46:

- u1:s skalfri-vakt: **EFTER 0 fynd GRÖN** (51 arrayform, 31 fasta,
  2 undantag) — deras protokoll o21.
- min mimosa-paritet v1.3, --doman väktardomänen + --hoppa-over
  (testggrund + dev.sh enligt u1:s protokollförda granskad-lämna, som
  jag verifierat: host/port ur funktionens args med inre citering,
  anropad med literaler "localhost"/"3000"): **147 filer, 0 fynd GRÖN**
  (rådata: mimosa-paritet-verktygdoman-EFTER-…json).

TVÅ OBEROENDE INSTRUMENT, skilda implementeringar och regeluppsättningar,
ÖVERENS om den härdade domänen. CHILD_PROC_INTERP-klassen: 8 → 0 i båda.
Detta är försvar i djupet gört mekaniskt — ena verktygets tystnad bevisar
inte längre något ensamt.

## 4. Baslinjeöverlevnad (spårets kontextord, o15 bokning 3-förberedelse)

Standarddomän färsk körning EFTER nattens fyra src-rörande s7-commits
(CV-bibliotek 210dd518, prefetch 184c6dc7, skelettkur 50463d80, CV-kur
87af4874): **677 filer, 0 fynd GRÖN** (o15:s baslinje: 671 — 6 nya
filer, alla rena; SSRF-kontexter 80 härdade, PATH_API 1 härdad, profil
oförändrad mot o15). v1.3:s bredare exec-regel hittade INGET nytt i src/. Ny
referensbaslinje: mimosa-paritet-baslinje-2026-09-16.json.

## 5. Bevis

- tsc 0 (projektbinär node node_modules/typescript/bin/tsc --noEmit) —
  src/ orörd av denna våg (endast verktyg/ + data/).
- node --check × 2 (scanner + svit).
- Testsvit 20/20 PASS (ALLA PASS).
- Rådata × 3 i denna katalog (FORE/EFTER verktygsdomän + baslinje).
- R2 orörd: inga priser/tier/publicering; inga .env/nyckelfiler;
  data/blogg/ orörd; syskonens filer orörda.

## 6. Metodfynd + bokningar till huvudagenten/styrelsen

1. **Försteargsvariabel-klassen** (agentfabrik.mjs:226,
   `execSync(kommando, …)` där kommando byggs av tre fasta interna grenar):
   osynlig för BÅDA instrumenten (regexarna kräver interpolerat första
   argument). Manuell granskning: låg risk (validera-kod/tscBin/npx —
   fasta sökvägar ur ROT). Bokas: evolutionspost — första-arg-är-variabel
   utan vittne bör klassas "granskad manuell" i båda skannrarna.
2. **'… "${X}"'-gränsen** (inre citattecken före ${, skal-env-klassen) —
   dokumenterad lucka i v1.3-grenen, bokas som regelutveckling efter
   tidsskördad falskpositiv-bas.
3. **KVD-integrering** (o15 bokning 3): levererar nu allt den behöver
   (domänfrihet + undantagsmekanism + dubbelinstrument-validering) —
   beslutet kvarstår hos styrelsen enligt o15.
4. **Orphan-artefakt**: mimosa-paritet-verktyg-fore-2026-09-16.json =
   u1:s döda v1.0-försök (0 skannade filer — domänfiltret stängde ute
   allt före v1.1). Lämnad orörd (u1:s artefakt); nästa städvåg kan
   ta den.
5. KUNDNOTIS manifestdesign — se §0.
