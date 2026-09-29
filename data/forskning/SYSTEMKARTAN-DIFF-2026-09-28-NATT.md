# SYSTEMKARTAN-DIFF — natten 2026-09-28: ikapp med revolutionen (desk-organen, läkaren, rot-kön, tak 6)

**Uppdrag:** v206-u6 (GRANSKARE, manifest `v206-mega-kapacitet-1789637000`, spår 9 —
evighetskatalogen "dokumentation"). **Mätt:** 2026-09-28 23:50–00:05 UTC på
ssdnodes-6ab9b334e519a (prod-trädet /home/ak1a/AK1, develop @ 8812d2b3).
**Kartans läge före:** senaste landning `bfb8f301` (dokvåg s9-u3: E42 DESK ny rad,
"14 fabriksuppgifter v198–v202") + r300-dokvågen `04f245a2` (SSD Nodes-plattformen).
**Leveransform:** GRANSKARE — denna rapport + färdiga diff-rader NEDAN som förslag;
SYSTEMKARTAN.md själv RÖRS EJ av mig (kartans ägare klistrar).

---

## 1. Granskningsdom — uppdragets sju epok-påståenden mot mätt verklighet

| # | Påstående (v206-manifestets kontext) | Mätt verklighet (egen mätning) | Dom |
|---|---|---|---|
| 1 | Själläkaren: crontab */30 + sudoers-vitlista, första läkningen 23:00 UTC | crontab `*/30 * * * * /home/ak1a/desk-lakare` ✓ · sudoers `/etc/sudoers.d/zdesk-lakare` = NOPASSWD ENDAST `systemctl restart zdesk-zcode.service` ✓ · loggens första cron-runda **23:00:04Z** ✓ (6/6 PASS, ingen läkning behövdes) | **VERIFIERAT** |
| 2 | Rot-kön: data/vakten/rot-kon/ | Katalog FINNS (skapad 22:45 UTC), **0 poster** — läkarens dokumenterade eskaleringsmål vid misslyckad läkning | **VERIFIERAT** (född, tom) |
| 3 | MEGA-AI-PLAN-24-7-konstitutionen | **Ingen artefakt på disk** (sökt data/**, worklog, PIPELINE-KO, beslutsminnet: 0 träffar). Närmaste bärare: v206-manifestets titel "MEGA-KAPACITET (kundorder: maximera i alla delar)" + nattens tre arkitekturfakta (cron→daemon-konsolidering, tak 6, läkaren) | **EJ VERIFIERAD** som dokument — flagga §5c |
| 4 | Expert-rådets epokcykel (v205 pågår) | v205 **KLAR 4/4** 23:25:05→23:44:45Z (status+logg.jsonl: U16–U18 experter + U19 rådsdom v2 "slutgiltig" 23:50). Epokcykeln lever vidare: v206 = första vågen efter domen | **VERIFIERAT** — men "pågår" var inaktuellt vid mätningen |
| 5 | PARALLELL_TAK 6 + nya RAM-grunder (8/12 GiB) | **Tak 6 ÄR I DRIFT**: fabriken (pid 543230, start 23:45:06) driver **6 zcode-barn samtidigt** (543241/248/255/262/283/286 = v206-u1..u6). MEN koden säger `PARALLELL_TAK = 3` (rad 103; senaste commit 5a27f1ec 19:41 lokal; trädet git-rent, mtime 23:47) — tak-6-ändringen clobberades av prod-synkens 23:47-fönster, next rop läser 3. RAM: "8/12 GiB" opåvisbart; verklighet = **60 GiB total / ~51 GiB tillgängligt**, prod-synkens nya grund "ps-reserven 850 MB/barn + 51 953 MB fritt" | **DELVIS** — drift ja, kod nej; siffran 8/12 fel (§5a) |
| 6 | Desk-kedjans 21 protokoll | **25 DESK-*.md** i data/forskning/ (huvudserie U1–U19 + U2B, U2C, U3-LANDNING, U4-NOVNC, U5×2 ämnen, U13V2) | **VERIFIERAT** som serie; antalet 21→mätt 25 |
| 7 | Remote-resize-vägen | defaults.json bär `resize=remote` enligt U13V2-kontraktet (läkarens kontroll) ✓ · r313 (5515c7c1) uppgraderade invarianten till `workarea == xrandr current` (runtime-sanning — falsklarm vid LYCKAT resize kurat) ✓ · telefon-trappan `?quality=2&resize=remote` (U5) ✓ | **VERIFIERAT** |

---

## 2. Bevis per organ/yta (vad · var · när — allt egenmätt i körningen)

### 2.1 SJÄLLÄKAREN (r315) — kartans helt nya organ

- **Skript** `/home/ak1a/desk-lakare` (1 270 B, körbart, mtime 22:45): kör
  `node verktyg/desk-halsa.mjs`; vid **2 felut i följd** ⇒ `sudo -n systemctl
  restart zdesk-zcode.service` — ENBART zcode-enheten ("xvnc/wm/novnc rörs
  ALDRIG automatiskt: de bär sessionen"); max **EN läkning per cron-varv**;
  räknare i `~/desk-halsa-state`; misslyckad läkning ⇒ loggrad med rot-kön-markör.
- **Sudoers-vitlistan** `/etc/sudoers.d/zdesk-lakare` (root:root 0440, mtime
  22:45): `ak1a = (root) NOPASSWD: /usr/bin/systemctl restart
  zdesk-zcode.service` — bevisat med `sudo -n -l` (EN rad, smalaste möjliga yta).
- **Cron**: `*/30 * * * *` → loggbevisade cron-rundor **23:00:04Z och 23:30:03Z**
  (loggen har 17 runder total; äldre runder = manuella/rondburna sedan 16:30Z).
- **Hälsoläget**: varje rond 6 PASS / 0 FAIL / 3 SKIP (auth-trion SKIP:ar korrekt
  — DESK_AUTH ej satt i cron-miljön; lösenord gissas/hårdkodas ALDRIG).
- **r313-invarianten** (5515c7c1, landad mellan 23:00- och 23:30-rundan — båda
  varianterna syns i loggen som levande beviskedja): x-geometri jämför nu mot
  **xrandr current** i stället för Xvnc-cmdlinens starttillstånd + defaults-
  kontrollen kräver `resize=remote` (U13V2-kontraktet).

### 2.2 ROT-KÖN — data/vakten/rot-kon/

Katalog skapad 22:45 (samma fönster som läkaren + sudoers). **0 poster.**
Ändamål (ur läkarens kod): slutstation när automatiken inte räcker —
"sessionen måste titta (rot-kon)". Köns första faktiska innehåll väntas
 bokföras av session/huvudagent vid första eskaleringen.

### 2.3 FABRIKENS TAK-REVOLUTION — drift kontra kod

- **Drift (ps-bevis):** `ps --ppid 543230` = **SEX** zcode-barn, samtliga startade
  23:45:06–09 = v206-u1..u6 SAMTIDIGT. Fabriksprocessen läste alltså tak 6 vid
  starten 23:45.
- **Kod (disk-bevis):** `verktyg/agentfabrik.mjs` rad 103
  `const PARALLELL_TAK = 3; // 12 = RAM-döden (bevisat); 3 = bevisat säkert` —
  trädet git-rent mot HEAD (senaste fil-commit 5a27f1ec, r303v2 19:41 lokal),
  fil-mtime **23:47**.
- **Clobber-kedjan:** prod-synken ropade :x7 → logg `23:47:09Z VÄNTAR-FABRIK tak
  passerat (30 min hungrande deploy) — bygger NU med ps-reserven 850 MB/barn +
  51 953 MB fritt` (data/vakten/prod-synk.log) — samma sekund som fil-mtime.
  Klass = s10-u2/s10-u3:s dokumenterade F3 (ocommittat verktygsarbete skrivs
  över av synkens git-fas). **Tak-6 överlevde endast i den körande processen.**
- **RAM-grunderna i verkligheten:** `free -h` = 60 GiB total (12 kärnor, SSD
  Nodes), ~9,5 GiB använt / ~51 GiB tillgängligt UNDER 6-barnsdrift + pågående
  bygg. `RAM_TAK_MB 1500` / `RAM_KEDJA_MB 2200` oförändrade i koden; kodens
  "8 GB-server"-kommentarer (rader 9, 103-området, 275) är Contabo-historik.
  Nya mätbara grunden = prod-synkens **850 MB/barn**-ps-reserv (23:47-raden).

### 2.4 DESK-KEDJAN — protokollserien och epokcykeln

- **25 protokoll** i `data/forskning/DESK-U*.md` (U1–U19 + sex bilagor/varianter).
- **Fabriksvågorna:** v198 A-Ö (5) → v199 → v200 (2) → v201 megaforskning (3) →
  v202 (3) → v203 super-forskning (3) → v204 (3) → **v205 EXPERT-RÅDET (4,
  KLAR 23:44:45Z)** → **v206 MEGA-KAPACITET (6, PÅGÅR — denna rapport är u6)**.
  E42:s "14 uppgifter klara (v198–v202)" är därmed vuxen till ≥24 klara + 6 köande.
- **Epokcykeln (v205):** kundorder "samlas som experter, djup forskning och koll
  på varenda kod" ⇒ tre experter granskar VARJE lager — U16 kärna (410 r),
  U17 nätklient (308 r), U18 upplevelse (445 r) — därefter **U19 rådsdomen v2
  SLUTGILTIG** (613 r, 23:50 UTC; v1 skrevs provisionell och omskrevs när alla
  tre protokollen landade under skrivandet — U13 v1→v2-mönstret). U19:v2:s
  nyckelkorrigering: U13V2:s fynd A var INTE rättat i praktiken (rättningen
  landade i en kopia nginx aldrig serverar, U17 A1). Cykeln = experter →
  rådsdom → nästa epok (v206 är första vågen efter domen).

### 2.5 CRON-REVOLUTIONEN — schemat flyttade hem (E29-världen)

- **Användar-crontaben:** vid 16:12 tio rader (bevis `/tmp/crontab-ak1a-u5-efter.txt`:
  db-dump 02:30 · gränsnittsvakt 01/07/13/19:17 · molnbackup 02:40 · arkivera
  sö 03:20 · döda-länkar 04:17 · appdb-dump 02:50 · rop-hälsa 06:27 · natt-TBT
  03:27 · beroende-vakt 05:37 · desk-puls */30) → **nu EN rad** (läkaren,
  kommentar "v198-u5+r315"). `/etc/crontab` = stock Ubuntu; `/etc/cron.d` =
  certbot + e2scrub_all.
- **Pumpor-daemonen v2 "klockstyrd"** (startad 09:42Z, pm2 ak1a-pumpor ↺3; v192:
  barnens stdio avkopplad) äger nu schemat: hjärta :x1 · kraschvakt :x4 ·
  **agentfabrik :x5** · prod-synk :x7 · evighetsmotor :x8 · konfigintegritet :x9 ·
  larm-eskalering :x0 · juridikgrind :37 · styrelserond xx:43/3h ·
  gränssnittsvakt :17/6h · integritetsvakt :47/6h · minnesberedare :23/6h ·
  **backup-offsite :52/6h** · ISR-värmare 03:10 · ra-gallring 04:41 ·
  scenariotest 04:44 · skalfri-vakt 05:06 · kvalitetsvakt 07:02 · data-hygien
  sö 03:33 · feljagare :x2/15 + MINUTVIS: automation-motor, vaxthus-chatt
  (r288), daemon-friskhet (v195), vercel-cron-motor (r299, G9-steg 1).
- **pm2-familjen (mätt):** ak1a (app) · ak1a-pumpor · **pulsvakt** (våg 122A —
  sajtpuls 60 s, statiskt kontraktstest, HÖGPRIO-larm vid trasigt bygg) ·
  **pumpor-hundvakt** (v192 r287 — daemonens externa pulsbevakare: tystnad >3 min
  ⇒ journal + pm2-omstart, eskalering max 1/10 min, paus 1 h efter 2 misslyckade).
  Hundvakten och vercel-cron-motorn finns i kartan ENDAST som prosa-noter
  (rader ~7588–7594) — saknar organ-rader.

### 2.6 Desk-ytorna som växte ikväll (E42-fodralet)

Skärmkontrakt **960x540** (telefon-först, r311; loggen visar hela evolutionen
1280x720 → 1024x576 → 960x540) · web-roten /home/ak1a/desk-web: vnc.html
17 823→21 529 B, defaults.json 4→5 toppnycklar med `resize=remote` · vy-zoom-
knappar + `/desk/hjalp.html` (v202) · 401-auth-bommen · 4 systemd-enheter
(zdesk-xvnc/wm/zcode/novnc, samtliga active — egen systemctl-kontroll).

---

## 3. DIFF-FÖRSLAG — färdiga rader att klistra in i SYSTEMKARTAN.md

### 3.1 Två nya tabellrader (efter E42) + två prosa→rad-höjningar

| Rad | System | Läge | Score | Kärna |
|---|---|---|---|---|
| **E43** | **SJÄLLÄKAREN** (desk-läkaren) — cron */30 + desk-halsa.mjs + sudoers-vitlista; 2 fel ⇒ restart ENBART zdesk-zcode; misslyckad läkning ⇒ rot-kön. Född r315 22:45Z; första cron-rundan 23:00:04Z (6/6 PASS); r313 gjorde invarianten resize-medveten | **LEVER 7** | drivs mätbart (loggen), smalaste tänkbara läkarmakt, EGEN växel till rot-kön; kvar: auth-trio SKIP i cron-läge, ingen svit på läkarlogiken själv |
| **E44** | **ROT-KÖN** (data/vakten/rot-kon/) — eskaleringskön dit läkaren och framtida vakter parkerar fall som kräver sessionens öga | **PÅGÅR 5** | katalog + kontrakt i läkarkoden; 0 poster ännu (okörd väg = odömd väg) |
| **E45** | **PUMPOR-HUNDVAKTEN** (v192 r287) — extern pulsvakt åt daemonen: tystnad >3 min ⇒ omstart-eskalering | **LEVER 7** | höjs från prosa (rad ~7588); roten (stdio-ignore) + vakten lever tillsammans |
| **E46** | **VERCEL-CRON-MOTORN** (v196 r299, G9-steg 1) — minutvis motor; rutter ENBART vid aktiv=true | **LEVER 7** | höjs från prosa; steg 2 (kund stänger Vercel-cron) väntar R2 |

### 3.2 E42-uppdatering (till befintlig rad)

Protokollserie **25 st** (U1–U19+bilagor) · fabriksuppgifter 14→**≥24 klara +
6 pågående** (v203–v206) · skärmkontrakt 960x540 · resize=remote-kontraktet
· **E43-läkaren** vaktar kedjan var 30:e minut · expert-rådets epokcykel
(v205→U19-rådsdomen) definierar nästa epok. Score LEVER 7→**LEVER 8**
(driftbevisad 24/7-vakt + rådsdom + telefonparitet lever; kvar: EN session,
delat basic-auth, 1 svit).

### 3.3 E29-uppdatering (cron-familjen)

"Cron-familjen 9 kommandorader" (09-25) ⇒ **historia**: schemat KONSOLIDERAT
till pumpor-daemonen v2 (klockstyrd, §2.5) + användar-crontab med EN rad
(läkaren). PM2-familjen 4 processer. **FYND-KLASS: 8 föräldralösa jobb** — se
§4 flagga a.

### 3.4 Ny UPPDATERING-sektion (rubrik-utkast)

"UPPDATERING 2026-09-28 natt (dokvåg v206-u6): +E43 läkaren +E44 rot-kön
+E45/E46 radhöjningar · E42/E29 ikapp · tak 6 i drift (bevisat i ps) men kod
3 (clobber-klass F3, se flagga) · crontab 10→1 rad, daemonen äger schemat ·
snitt 312→324/42→46 = 7,04⇒7,0" — *(siffrorna är kartägarens att fastställa
vid inklistringen; mina rad-förslag bär 7+5+7+7=26 poäng).*

---

## 4. Ändringslogg — vad som tillkom denna epok (2026-09-28 ~16:00–24:00 UTC)

1. **16:12** v198-u5: desk-pulsen installeras (*/30, 10-raderscrontab) — läkarens föregångare.
2. **~19:41** r303v2 (5a27f1ec): fabrikens städarkur (sista fil-committen på agentfabrik.mjs — tak fortfarande 3).
3. **20:1x–20:4x** s8-vågen: o559 dataset-byggsanning, o560 trädhälsa, o561 cron-exekverarbitsrotkur (chmod ×5 + index 755 + svit 15/0).
4. **22:2x–23:2x** s10-vågen: DR-kvällsreplik + app-bladets första restore på SSD Nodes + offsite-ruinen upptäckt/kurad/återbevisad.
5. **23:25–23:44:45** **v205 EXPERT-RÅDET** klar 4/4 (U16–U18 + U19 rådsdom v2).
6. **~22:45 (r315-fönstret)** läkaren + sudoers + rot-kön föds; crontaben reduceras 10→1 rad; (tak-6-redigeringen av agentfabrik.mjs — oclobberad, se flagga).
7. **23:45:06** **v206 MEGA-KAPACITET** startar: FÖRSTA manifestationen med 6 parallella barn (tak 6 i drift).
8. **23:47** prod-synkens byggfönster (bygger från 8812d2b3) — clobberar tak-6-koden; kvalitetsrapporten GUL (1 fel) stoppar inte.
9. **23:50** U19 v2 "slutgiltig" committad — epokcykeln sluten.

---

## 5. Flaggor — kö till huvudagenten/kartägaren (i prioritetsordning)

- **(a) TAK-6-KODEN SAKNAS I GIT — commit:a omgående.** Driften (6 barn) bevisar
  att en tak-6-version av `verktyg/agentfabrik.mjs` fanns på disk 23:45; prod-
  synkens 23:47-fas lämnade HEAD:s tak 3 på disk. Nästa fabrik-rop läser tak 3
  igen. Commit `PARALLELL_TAK = 6` (med 850 MB/barn-grunden och rättad
  "60 GiB"-kommentar) innan nästa manifest släpps — annars är MEGA-epoken
  endast en process-generation djup. Manifestets "8/12 GiB" bör ersättas med
  de mätbara 60 GiB/850 MB-per-barn.
- **(b) ÅTTA FÖRÄLDRRÖSA CRON-JOBB — deadline 02:30 UTC.** db-dump 02:30,
  molnbackup 02:40, appdb-dump 02:50, arkivera sö 03:20, natt-TBT 03:27,
  döda-länkar 04:17, beroende-vakt 05:37, rop-hälsa 06:27 finns I INGEN av de
  tre schemahemmen (crontab ✗ · daemon-tick ✗ rad-för-rad · automation-motor ✗
  namngrep). Hot: s10-u2:s "jungfrunatt 02:50"-kvitto, s8-u2:s "första fulla
  levande dygnet", G-spårens nattkvitton. Antingen återinstalleras raderna
  eller daemonen utökas — FÖRE 02:30. (Ronden 01:43 hinner lyfta flaggan.)
- **(c) MEGA-AI-PLAN-24-7 saknar bärare på disk.** Namnet lever endast i
  v206-manifestets kontext. Förslag: nästa Φ-rond skriver konstitutionen ELLER
  döper om referensen till det verifierbara ("v206 MEGA-KAPACITET + daemon-
  konsolideringen + läkaren = 24/7-arkitekturens tre ben").
- **(d) Manifest-epoken 11 dagar fel:** v206:s `skapad: 1789637000` =
  2026-09-17 09:23 UTC (samma fel i v205) — fabrikens `startad`-fält är rätt.
  Bryter epok-sortering i ko-kön vid namnkollisioner; kosmetisk kur.
- **(e) Bokföringsgap:** worklog slutar vid s10-u3 (23:2x); r313, v205 (4
  commits), r314–r316 (läkare/rot-kön/crontab/tak — ej i git) och v206-start
  saknar worklog/beslutsminne (senaste rond 133 = 22:43). Nästa rond 01:43.
- **(f) Kartans E42-antal:** "21 protokoll" i uppdraget mot mätt 25 — kartan
  bör bära det mätta talet (K1-precedensen: mätbara tal slår berättade).

---

## 6. KVD för denna leverans

Data-only (EN ny rapportfil; SYSTEMKARTAN.md orörd — granskarrollen) · src/ orörd
= INGET bygge · R2 orörd (priser/tier/publicering orörda) · data/blogg/ orörd ·
crontab/sudoers/daemon ENDAST LÄSTA (syskonytor orörda; agentfabrik.mjs RÖRD EJ —
flagga a överlämnas till ägaren) · tsc oberörd (pre-commit-grinden bär) · varje
påstående i §1–§2 bär sitt mätbevis från körningen 23:50–00:05 UTC.

RESULTAT: kartan +4 organ (E43 läkaren, E44 rot-kön, E45 hundvakten, E46
vercel-cron-motorn) +7 ytor (crontab-konsolideringen, sudoers-vitlistan,
desk-web-kontrakten, protokollserien 25, hälso-logg/state, fabrikens tak-6-
driftläge, epokcykel-arkitekturen) ikapp
