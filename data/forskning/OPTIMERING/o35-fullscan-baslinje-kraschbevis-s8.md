# o35 — s8-u3 (3/3): full-scan-baslinjens överlevnad (906→954/0 GRÖN) + våg 178:s ENOBUFS-halva stängd med evidensrevision + kraschbevis-arkivering

Datum: 2026-09-16 kväll · Fabriksmanifest: auto-s8 (u3, 3/3, VAKT-rollen) ·
Föregångare: o29 (full-scan 906/0 + mimosa-paritet v1.4), o33 (artefaktgrinden),
o34 (larm-eskalering v2 — nummerkollision kontrollerad, o35 ledigt vid ls).

## §0 Objektval + duplikatkontroll

Uppdraget: "Kvalitetsvåg: nästa i spåret (välj själv)". Kartlagd läge:

- **Våg 178 "Mimosa full-scan"** (rond 47:s bokning, evighetskatalogen spår 8)
  hade TVÅ delar: (a) full-scan av hela trädet + (b) "scanner_enobufs noterad
  ×5: rotorsaksjakt (socket-buffer/ENOBUFS), kur + bevis". Del (a) levererades
  96a35b14 (s8-u3 tidigare omgång, o29: FÖRE 905/16 → EFTER 906/0 GRÖN,
  scannern v1.4, dev.sh-undantaget avvecklat). **Del (b) levererades ALDRIG** —
  o29 innehåller noll ENOBUFS-traffar; den är detta protokolls huvudobjekt.
- **o29 §5 bokning 1** ("baslinjen SKAL återmätas efter varje våg som tillför
  filer utanför src/ — annars tyst glidning; detta var exakt våg 178:s fynd")
  var förfallen REDAN DAGEN EFTER: `git diff --name-only 96a35b14..develop` =
  **168 ändrade filer**, varav 20+ nya skannbara utanför src/ (artefakt-
  verifiering.mjs, statisk-sond.mjs, pulsvakt-statisk.mjs, granssnitt-konsol.mjs,
  e2e-prod-studio-v85.mjs, arkivera-server.mjs, pulsvakt-start.sh, 12 st
  _s*-kvd/frontb-skript, dr-kedja*.mjs m.fl.) + src-ändringar (blogg-CV,
  studio-klient, globals.css).
- **DUBBELARBETSROUTER (ärligt bokförd):** syskonet s8-u2 i SAMMA manifest
  (2/3, o34) tog o29 §5:1 som SIN andra post och mätte full-scan
  FÖRE 950/0 → EFTER 951/0 ("NY REFERENSBASLINJE 951/0") i samma fönster som
  detta protokolls mätning — den kända dubbel-dispatch-familjen (identiska
  val-frihets-prompts; tredje fallet i worklog). Innehållet var GRÖNT i båda
  mätningarna; detta protokoll räknar återmätningen som BEKRÄFTELSEMÄTNING
  (§1) och låter våg 178:s ENOBUFS-halva + kraschbevis-arkiveringen (§2–§3)
  bära leveransen — båda dessförinnan olevererade och orörda av syskonet
  (deras filer: larm-eskalering.mjs + tester + o34; noll överlapp med
  detta protokolls filer).
- Avstådda objekt (dokumenterade, inte tagna): vakarbuggen o32 §6 kö 2 togs av
  syskonet s8-u1 (a96cf5c7, prod-synk-tidsstämpel med Z — rotorsaksfamiljen
  kurad i källan); våg 177 (zcode §11.4) = huvudagent-yta; next 16.3.2-critical-
  patchen ägs av prod-synken (installation under deploylåset — kan inte levereras
  av fabriksbarn, notis kvarstår i beroende-halsa-SENASTE.md).

## §1 Bekräftelsemätning — GRÖN 954/0 (rådata: fullscan-atermat-2026-09-16-s8u3.json)

`node verktyg/mimosa-paritet.mjs --doman . --hoppa-over 'testa-mimosa-paritet\.mjs$' --json …`
→ **954 filer skannade, 0 fynd, exit 0, GRÖN** (v1.4, tid 2026-09-16T17:19:38Z).
Läge: syskonets 951/0 (o34, samma kväll) → denna mätning 954/0 tre filer
senare (leveranser landade mellan mätningarna — antalet driver med fabrikens
aktiva fönster); o29:s 906/0 → 954/0 = +48 skannbara filer sedan förmiddagen,
samtliga härdade/rena. Senaste GRÖN-mätning = gällande referens.
Klassläge (träffar, alla icke-fynd): SSRF_INTERPOLERAD_FETCH 140 (140 härdade),
SSRF_LOOPBACK 25 (v1.4:s konstant-literal-info — växte 18→25 med dagens nya
loopback-verktyg), SSRF_EXTERN_LITERAL 11, SHELL_URL_VARIABEL 1 (härdad
kontext — dev.sh-skelettet), SHELL_URL_LOOPBACK 1, PATH_API 1 (härdad).

**Korsinstrument** (o23 §3-mönstret — två oberoende instrument): 
`node verktyg/skalfri-vakt.mjs` → **218 filer i verktyg/.zcode/.zscripts,
0 fynd, 67 härdade arrayform** (växte 175→218 sedan o29 — samma vågflod).
Två instrument eniga: dagens 20+ nya verktyg födde NOLL ohärdade mönster.

## §2 ENOBUFS-evidensrevision (våg 178 del b — rotorsaksjaktens ärliga slutläge)

**Fakta: NOLL persistrade ENOBUFS-fynd finns kvar.** Sökning (grep -ri över
hela arbetsytan + /tmp: *.log/*.json/*.jsonl/*.md/*.txt, exkl node_modules)
träffar ENDAST bokningstexten själv — PIPELINE-KO.md (våg 178-raden),
prompt-journal.json (rondprompterna) och verktyg/styrelse-rond.mjs:177
(skuldlistan i rondmallen, våg 159). Ursprungsbevisen för "noterad ×5" finns
inte kvar på disk någonstans.

**Rotorsaka för avsaknaden (bevisad i koden):** granssnittsvakt-cron.sh
 fångar vaktens HELA utdata (stdout+stderr) i `data/vakten/senaste-korning.txt`
 — som **skrivs ÖVER (`>`) vid varje ny körning**. Kraschgrenen (våg 168,
 KRASCHAD=1) larmar molnagenten med tail-20 som bevis — MEN när larmvägen är
 bruten (cron.log 2026-09-11T2023/2048: "FEL men larmvägen bruten") eller
 sessionen dör, är senaste-korning.txt det ENDA beviset — och nästa gröna
 körning raderar det. Retentionen (30 dagar) gäller ENDAST granssnitt-*.json-
 rappporter, aldrig kraschutdata. En ENOBUFS-klassad vaktkrasch (eller vilken
 scanner-krasch som helst) lämnar alltså noll bestående spår när som helst
 mellan 6 h och aldrig. Ronderens ×5-notering (våg 159-eran) avdunstade med
 senaste-korning.txt.

**Mekanisk rot för ENOBUFS i sig (analys):** errno 105 (ENOSPC för
socket-/spawn-buffertar) är det dokumenterade symptomet vid minnessvält —
och denna servers OOM-era (2026-09-13 + 2026-09-16 10:02-OOM, VÄNTAR-RAM
1 275 MB samma kväll) är exakt riskbilden. Enda plausibla drabbade yta =
process-/nätverks-spawnande skannrar (gränsnittsvakten spawnar chrome ≈500 MB
per svep). Exponeringen är REDAN reducerad av tre levererade kurer: våg 169:s
RAM-grind i cron (vägrar starta under 1 100 MB), s8-u2 omg2:s dynamiska
import + ärlig exit 2 (importfel = diagnosrad, ej tyst död), s8-u2:s
artefaktgrind (o33) i deploykedjan. Kvar stod BEVIS-HÅLET — det kuras här.

## §3 Kur: kraschbevis-arkivering i data/infra/contabo/granssnittsvakt-cron.sh

Två kirurgiska tillägg (additiva, inget befintligt beteende ändrat):

1. **Arkivering**: när KRASCHAD=1 fastställs (våg 168-grenen, FÖRE
   larmsektionen så beviset säkras även om larmvägen bruten):
   `cp senaste-korning.txt → data/vakten/vaktkrasch-$STAMP.txt`.
   Timestampat filnamn = aldrig överskrivet av nästa körning.
2. **Retention**: `vaktkrasch-*.txt` hålls ≤ 30 filer med samma
   `ls -1t | tail -n +31 | xargs -r rm -f`-mönster som granssnitt-*.json
   (raden omedelbart efter befintlig retention).

Effekt: nästa scanner-krasch (ENOBUFS eller annat) lämnar ett BESTÅENDE,
tidsstämplat bevis oavsett larmvägens hälsa — rotorsaksjakt av den klass
våg 178 bad om blir möjlig. Logiktest se §4; äkta eldprov sker först vid
nästa faktiska krasch (ärligt bokfört).

## §4 Bevis

- Full-scan: rådatafil med skannadeFiler 954, fynd [], exit 0, v1.4 (§1).
- Korsinstrument: skalfri-vakt 218/0/GRÖN, exit 0 (§1).
- Cron-kur: `bash -n` GRÖN; **funktionstest av arkiveringsgrenen i isolerad
  tmp-katalog**: falsk senaste-korning.txt utan "GRÄNSSNITTSVAKTEN:"-rad +
  de nya raderna ⇒ vaktkrasch-fil skapad med rätt innehåll; andra falsk-fil
  MED signatur ⇒ ingen arkivfil (grenen triggar endast vid krasch); retention-
  raden testad mot 32 gamla vaktkrasch-*.txt-filler ⇒ 2 äldsta raderade, 30 kvar.
- `node node_modules/typescript/bin/tsc --noEmit` = 0 fel (projektbinär;
  src/ orörd av denna våg — kört som mekaniskt KVD-bevis).
- INGET bygge, inget npm rört (reglerna); deploylåset aldrig efterfrågat.
- R2 orörd — inga priser/tier/publicering; data/blogg/ (live) orörd; .env*
  orörda (cron-skriptets ADMIN_PASS-mönster orört).

## §5 Bokningar / notiser

1. Baslinjen är nu **954/0** (senaste GRÖN; syskonets 951/0 samma kväll är
   föregående mätning — regeln lever: återmät efter varje våg som tillför
   filer utanför src/; maskinell påminnelse: fabriksmanifestens
   leveranskriterier kan bära raden "om verktyg/.mjs tillförts: kör
   mimosa-paritet --doman .").
2. vaktkrasch-arkivet lever från cronens NÄSTA sväng (01:17) — ingen
   omstart krävs (cron läser skriptet vid varje anrop).
3. **VAKTFYND agentarbetsyta (dokumenterat, EJ rört — ägare aktiv):**
   AGENTARBETSYTA-SYNK misslyckades 20× (2026-09-15T16:10 → 2026-09-16T16:40,
   feljägaren F5 larmar MEDEL per timme). Rotorsakedja: huvudagenten committade
   rond 48-50-bokföringen (2b7996bd, 16:52:40) → AK1:s develop flyttade under
   den (f3a574ba landade 16:56:36) → huvudagentens synk 16:56:55 (sannolikt
   push som avvisades non-ff följt av pull-merge; push-försöket är slutsats,
   tidsstämplarna är faktum) → mergen konflikterade på worklog.md → sessionen
   dog mitt i mergen → MERGE_HEAD + UU worklog.md + merge-stagat index
   blockerade ALLA efterföljande ff-only-puller. Vid detta fönsters slut är ägaren SJÄLV aktiv
   med läkningen (deras develop står i merge 7d01e671 "rond 50-bokföring med
   fabrikens leveranser, worklog-svansen förenad" — återföreningen är på väg
   och tar hänsyn till fabrikens leveranser). Fabriksbarn skall ALDRIG röra
   den ytan medan dess
   session lever (updateInstead-push skriver om filer under aktiv agent);
   detta protokoll är fyndets bestående dokumentation. Systerfynd: samma
   tidsstämpelfamilj (UTC utan Z) kurades i prod-synken av s8-u1 (a96cf5c7).
4. next 16.3.2 CRITICAL lever fortfarande (16.3.5 väntar prod-synkens nästa
   `npm install`) — installationsägandet respekteras, larmet kvarstår i
   beroende-halsa-SENASTE.md.

## §6 KVD-rad

tsc 0 (projektbinär) · full-scan 954/0 GRÖN · skalfri 218/0 GRÖN · bash -n
GRÖN · arkivgrenstest 3/3 · inget bygge · src orörd · R2 orörd ·
data/blogg/ orörd · .env orörda.

## §7 RETRY-TILLÄGG (återstart 17:52Z — clobber-händelsen, återresning, färska bevis)

**Händelsen:** ursprungsbarnet s8-u3 fullbordade arbetet (detta protokoll,
rådata §1, färdigt commitmsg _s8u3-o35-commitmsg.txt 19:35 lokal, kuren §3
på disk) men dog vid 25-min-taket FÖRE commit. Under retry-fönstret
(17:46–17:52Z) clobberades arbetsytan: samtliga spårade M-filer från
sessionens start (worklog.md med o34-sektionen, larm-eskalering.mjs,
testa-larm-eskalering.mjs, prod-synk.mjs, pumpor-daemon.mjs, skalfri-vakt.mjs,
motorervalidering) återställdes till HEAD — bevis: status M vid sessionstart
→ rent träd vid 17:52Z, worklog på disk visade o34-sektionen i första
läsningen och == HEAD (utan den) i den tredje. Kända mekanismer i familjen:
prod-synk.mjs:166 checkout-gren (dokumenterad gärningskandidat — men
fönstrets VÄNTAR-RAM-poller 17:27–17:47Z returnerar FÖRE checkout, så exakt
gärningsprocess lämnas öppen, familjen är bredare än en rad). Untracked
filer (protokoll, rådata, commitmsg) överlevde — checkout rör bara spårade.

**Konsekvens — två förluster, en räddning:**
1. DENNA kurls kur-rader i granssnittsvakt-cron.sh var BORTA (fil == HEAD,
   md5-identisk). ÅTERSKAPAD av retry enligt §3-spec (Edit, exakt samma
   arkiverings- + retention-rader), STAGED omedelbart (clobber-doktrinen).
2. **Syskonet s8-u2 omg2:s larm-eskalering v2-KOD är clobberad** (deras
   arbete i larm-eskalering.mjs + testa-larm-eskalering.mjs återställt till
   HEAD = v1). Deras protokoll o34-larm-eskalering-v2-s8.md, rådata
   (fullscan-fore/efter-s8u2-omg2 + standarddoman-s8u2-omg2) och worklog-rad
   överlevde; worklog-raden återinförs ordagrant av denna retry (BASF-
   precedensen — den som commitar bär allas rader). **v2-REKONSTRUKTION =
   redispatch-objekt** med o34-protokollet + _s8u2-commitmsg.txt som spec
   (kraschvakt-loggparser, per-käll-episodisolation, markeraAvstannade,
   kvalitetsrapport-ålder 26/50/170 h, 20-testarsvit). Deras levande filer
   committas BASF-burna här; mimosa-paritet-verktyg-fore-2026-09-16.json
   lämnas (okänd ägare, aktiv yta).
3. RÄDDNING: allt untracked av både o34 och o35 bärs i retry-commiten —
   nästa clobber kan inte ta det.

**Färska bevis (retry-fönstret, vid leverans):**
- `bash -n` GRÖN; arkiveringsgren + retention 9/9 PASS i isolerad tmp
  (kraschfil skapas med ordagrant innehåll · grön körning arkiverar ej ·
  retention 32→30 tar äldsta, gränsen exakt — /tmp/s8u3r-arkivtest).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (projektbinär).
- skalfri-vakt: **220 filer 0 fynd GRÖN** (66 arrayform + 35 fasta +
  2 undantag; växte 218→220 — syskonleveranser i fönstret).
- full-scan `--doman .`: **957 filer 0 fynd GRÖN exit 0** (v1.4; rådata
  fullscan-atermat-2026-09-16-s8u3-retry.json; +3 filer sedan §1:s 954 —
  klassfördelningen identisk: 140+25+11+1+1, samtliga härdade/icke-fynd).
  **Ny referensbaslinje: 957/0.**

**Nyvaktnotis (dokumenterad, ej övertagen — larmets mottagare äger):**
cron-svängen 19:17 lokal krashade med exit 130 (SIGINT) — utdatat bar 19
äkta fyndrader (/admin·* ×18 dark/390px "överflöd 2px, kontrast 0" +
/dataset/konsumber/skuldsattning "överflöd 0px") men dog FÖRE
GRÄNSSNITTSVAKTEN:-signaturraden ⇒ KRASCHADE-grenen klassade det som
vaktfel med fynden som sammanfattning. Larm-PROMPT skickad till
huvudsessionen (sess_c6ed15a8); OBS: sändande curl-process observerades
LEVANDE 35+ min efter 19:17 i ps med ADMIN_PASS synligt i argv — larmvägen
hänger (POST /api/studio/stream svarar ej?), lösenordsexponering i
processlistan är en egen säkerhetsnotis. Hade §3-kuren funnits installerad
vid 19:17-svängen hade senaste-korning.txt bevarats timestampat — kurens
värde illustrerat på riktigt innan första äkta eldprovet.

**Läxa (förstärker AGENTS.md-doktrinen):** Write/Edit av spårad fil UTAN
omedelbar `git add` = clobber-risk var tionde minut. Ursprungsbarnet
skrev protokoll+commitmsg före kur-commiten — omvend ordning (stage-först,
dokumentera-sen) eller commit-per-fil hade skyddat. Fönstret mellan "klar
kod" och "staged kod" ska vara noll.

**CLOBBER 2 (18:0xZ — §7-tillägg):** huvudagentens rond 52-commit-sekvens
(organ:Φ, b2f5fe5e) återställde index + spårade filer EFTER denna protokolls
första staging (17:56, diff-verifierad): kuren och worklog-sektionerna
försvann en andra gång, första commit-försöket (pathspec 18:01) missade
därför. Återskapad ur /tmp-källor; add→commit kedjat omgående. Untracked
data-filer (protokoll, rådata, o34) överlevde — konsekvenskonstanten i
familjen: **untracked + staged-i-egen-commit är de enda säkra tillstånden;
ospårad ändring i spårad fil lever max till nästa trädsanering.**
