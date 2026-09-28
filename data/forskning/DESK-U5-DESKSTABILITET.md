# DESK-U5 — /desk-kedjans stabilitetsutredning + crontab-puls (v198-u5)

**Datum:** 2026-09-28, mätningar 16:08–16:12 UTC · **Agent:** fabriksbarn v198-u5
(BYGGARE) · **Ägande:** detta protokoll + ak1a:s EGNA crontab — inget annat
rördes (inga kill/restart, ingen ~/.zcode, inget /etc, ingen processpåverkan).

---

## Sammanfattning

1. **Kedjan lever:** 4/4 enheter `active` + `enabled` (boot-säker), X-arbetsytan
   exakt 1280x720, ett fönster maximerat, hälsosviten 6/6 PASS (1,0 s).
2. **Pulsen INSTALLERAD** i ak1a:s crontab: `*/30` → `desk-halsa.mjs` med logg
   utanför repot. Manifestets sökväg `/home/ak1a/agent/ak1` korrigerades till
   `/home/ak1a/AK1` — klonen saknar skriptet, prod-trädet har det committat
   (bevis i §6).
3. **Viktigaste stabilitetsfyndet:** zcode-appen cyklade var ~10:e minut
   14:21–15:45 (ren exit kod 0 + `Restart=always` väckte den — 10 instansstarter
   på 6 h). Sedan 15:45:36 står samma instans stabil med full init. Hypotes och
   innebörd för kundens samtal i §3.3 och §4a: **samtalet överlever omstarter —
   trådens sanning ligger server-side (våg 148) — det är vyn, inte tråden, som
   blinkar.**
4. **Säkerhetsfynd (root-ägt, ej åtgärdat):** websockify körs SOM ROOT, lyssnar
   på `0.0.0.0:6080` — en väg förbi nginx basic auth mot en Xvnc med
   `SecurityTypes None`. Eventuell brandvägg kan ej verifieras som ak1a. Förslag
   i §7 punkt 3–4 med prioritet HÖG.
5. **Journalblindhet:** som ak1a syns enheternas PROCESSRADER men inte PID 1:s
   livscykelrader (Started/Stopped/Failed) — novnc:s journal är därför HELT tom
   (processen kör som root). Kur i §7 punkt 1–2.

---

## 1. Utgångsläge (mätt 16:08–16:12 UTC)

| Enhet | ExecStart (förkortat) | Tillstånd | MainPID (start) | NRestarts | Restart | Watchdog | User |
|---|---|---|---|---|---|---|---|
| zdesk-xvnc | `Xvnc :10 -geometry 1280x720 -depth 24 -localhost -SecurityTypes None` | active/running, **enabled** | 349454 (14:59:32) | 0 | always | 0 (av) | ak1a |
| zdesk-wm | `openbox` | active/running, **enabled** | 349552 | 0 | always | 0 (av) | ak1a |
| zdesk-zcode | `ZCode-3.14.3…AppImage --no-sandbox` | active/running, **enabled** | 364689 (15:45:36, 22 min vid mätning) | **5** | always | 0 (av) | ak1a |
| zdesk-novnc | `websockify --web /home/ak1a/desk-web --heartbeat 30 6080 localhost:5910` | active/running, **enabled** | 351439 (15:05:31) | **7** | always | 0 (av) | **(tom ⇒ ROOT — bevisat med ps, §5)** |

Beroendekanor (från `systemctl show`): wm `Requires=`+`After=` xvnc ·
zcode `Requires=`+`After=` wm · novnc har ENBART `After=` xvnc (ingen hård
koppling). Alla fyra `enabled` ⇒ kedjan reser sig själv efter serveromstart.

---

## 2. journalctl som ak1a — test och gräns (uppgiftens punkt 1)

**Test:** `journalctl -u zdesk-xvnc.service --since '7 days ago'` som ak1a →
**SVARAR** med Xvnc-processens rader (utdrag i §3.1). Åtkomst NEKAS alltså inte
helt — men med en viktig gräns:

- `groups` för ak1a = endast `ak1a` (INTE `adm`/`systemd-journal`) ⇒ journalctl
  visar bara rader från egna UID:er. Enhetsprocesser som kör som ak1a (xvnc,
  wm, zcode) syns; **PID 1:s livscykelrader (`Started`/`Stopped`/`Failed`/
  `Scheduled restart job`) syns EJ** — de loggas av root.
- Följd: **zdesk-novnc:s journal är helt tom i 7 dagar** — websockify kör som
  root (bevis §5), så dess rader är osynliga. Tidigare fynd (föräldralös
  websockify på port 6080, activating-loop) kan därför EJ efterverifieras här;
  de hanteras som känd historia + §7-förslag.
- NRestarts-värdena (tabell §1) är därmed enda livscykelkällan för root-delar;
  tolkning osäker (räkneverkets nollställning är inte entydig). zcode=5 är
  konsistent med 10-minuterscykeln i §3.3; novnc=7 är konsistent med den kända
  portkrocksperioden men overifierbar som ak1a.

---

## 3. Journalfynd, 7 dagar (det synliga)

### 3.1 zdesk-xvnc — två starter, ingen krasch
- 14:20:55 första start; **14:59:32 omstart** = geometribytet till 1280x720
  (v198-arbetet) — efter den står kedjan.
- Återkommande rader `Could not find any render nodes` / `Failed to initialize
  DRI3 extension` = normala på huvudlös TigerVNC (ingen GPU) — brus, ej fel.
- `ComparingUpdateTracker`-rader = VNC:s egna pixelstatistik vid
  klientaktivitet — bevisar att strömning fungerat.

### 3.2 zdesk-wm — en varning, kosmetisk
- 14:20:57 `Unable to find a valid menu file /var/lib/openbox/debian-menu.xml`
  — saknad Debian-menymall, ingen funktionell påverkan (openbox maximerar och
  rullar). Inga fler rader på 7 dagar = tyst och stabilt.

### 3.3 zdesk-zcode — 10-minuterscykeln 14:21–15:45 (återrapporterat i detalj)

Observerad instanskedja (startmarkerare = appens boot-dump `signal: null`;
slutmarkerare = `cron-scheduler … exited code=0` + `spawnHostProcess host
process (local-1) exited with code=0` tystnad):

| Instans (PID) | Född | Död | Livslängd |
|---|---|---|---|
| 338451 | 14:21:33 | 14:35:21 | ~13,8 min |
| 342665 | 14:36:07 | 14:45:21 | ~9,2 min |
| 346072 | 14:46:16 | 14:55:23 | ~9,1 min |
| 347157 | 14:55:49 | ~14:59 | ~3,5 min (xvnc-omstarten 14:59:32 avbröt) |
| 349582 | 15:00:30 | ~15:1x | (före 15:45, exakt tid ej fångad) |
| … | | | totalt **10 starter på 6 h** |
| 361498 | ~15:3x | 15:45:24 | (sista dödande) |
| **364689** | **15:45:36** | **— lever ≥22 min vid 16:08** | **stabil, full init** |

Mönster: exit-tidpunkterna ligger exakt ~10:00 från start (14:35:21 → 14:45:21
→ 14:55:23) och appen avslutar **rent, kod 0** — sedan väcker `Restart=always`.
De döende instanserna visar aldrig raderna `forked host process` /
`cron scheduler started`; den levande (364689) visar full init: host-processen
gafflad 15:47:30, cron-schemaläggaren startad 15:48:28 — och inga utträdesrader.

**Hypotes (ej bevisad, värd nästa ronds observation):** instanser som aldrig
får sin session fullt initierad/använd har en intern ~10-minutersviloutgång
(troligen inaktivitetsskydd i appen när ingen interagerat); när skrivbordet
använts initialiserar appen fullt och cykeln upphör. Alternativ förklaring:
u1–u3-agenternas manuella omstarter under v198-arbetet — men de reguljära
10:00-intervallen och frånvaron av `cron scheduler started` i de döda
instanserna talar för viloutgång, inte manuell handling.

dbus-felrader (`Failed to connect to the bus`) och GPU-rader
(`ContextResult::kTransientFailure`) = kända Electron-brus i huvudlös miljö
(ingen session-bus, ingen GPU) — förekommer även i den friska instansen,
inget åtgärdsbart.

### 3.4 zdesk-novnc — tom journal (förklaring i §2), nu-läget mätt annorlunda
- Processen lever (§5), port 6080 answerar via kedjan (hälsosviten PASS), webrot
  intakt (vnc.html 17 823 byte, defaults.json giltig). Djupare historik kräver
  root-journal — §7 punkt 1–2.

---

## 4. Omstartskartan (uppgiftens punkt 2)

### (a) zcode-enhetens omstart — vad händer med kundens pågående samtal?

- **Processnivån:** Electron-processen dör; `Restart=always` startar ny
  instans inom sekunder (se cykeln i §3.3 — appen kom tillbaka 10 gånger).
- **Samtalet:** risken är INTE trådförlust. Enligt våg 148-arkitekturen (AGENTS.md,
  repo-dokumentation — inget i ~/.zcode har lästs i denna utredning) är servern
  trådens sanningsägare: hela huvudtråden läses ur ZCodes egna sessionsdata och
  serveras via `/api/studio/stream` (`tradHistorik`). En omstart av
  Electron-appen återskapar fönstret och hämtar historiken igen.
- **Det som faktiskt förloras:** vy-läge (scroll-läge, öppna paneler),
  oskickat utkast i inmatningsrutan, pågående rendering i upp till ~10–30 s.
  = mjuk, visuell förlust — aldrig tråden.
- **Empiri:** dagens 5+ omstarter utan att tråd försvunnit (kunden har även
  tidigare bevisat resume via /studio). Kvarstående osäkerhet: hur appen BETEER
  SIG vid viloutgång medan kunden aktivt läser — pulsen (§6) mäter nu kedjans
  hälsa var 30:e minut och fångar framtida cykler med tidsstämplar.

### (b) xvnc-omstart — varför wm+zcode MÅSTE följa med

- **X-protokollet:** Xvnc dör ⇒ alla X-klienter tappar sin socketförbindelse ⇒
  openbox avslutar och Electron dör med X-I/O-fel — oavsett systemd.
- **systemd-kanon:** wm `Requires=` xvnc och zcode `Requires=` wm ⇒ ett stopp
  av xvnc propagerar nedåt som stopp.
- **Fällan utan kedja:** klienterna hinner ofta krascha FÖRE systemd:s
  propagerade stopp, och `Restart=always` försöker då starta om dem MOT en X
  som är nere/ny — omstart i oordning, snabba kraschar i följd, risk att nå
  systemd:s startbegränsningstak (standard 5 starter/10 s) ⇒ enhet fastnar i
  `failed`/`activating` tills manuell åtgärd (känd novnc-bild).
- **Korrekt förfarande (befintligt, bekräftat i praktiken 14:59:32):** ETT
  kommando `systemctl restart zdesk-xvnc zdesk-wm zdesk-zcode` — `After=`
  kedjar ordningen xvnc → wm → zcode. novnc behöver inte ingå (ingen `Requires`
  på xvnc) men tål det (tilståndslös bro).
- Geometrin är X-start-parameter (`-geometry 1280x720` i ExecStart) — därför
  KRÄVER geometribyte omstart av xvnc, och därmed hela kedjan.

### (c) novnc-omstart — mjuk?

- websockify är en tilståndslös bro (HTTP/websocket ↔ VNC). Omstart dödar
  klienternas websockets men rör INTE X-sessionen: Electron lever, samtalet
  lever, fönstret står kvar.
- Klientsidan: noVNC visar `Disconnected`; automatisk återanslutning är inte
  standardbeteende — kunden får (i nuvarande konfiguration) trycka anslut igen.
  Pågående defaults-arbete (DESK-U4, parallell uppgift) kan påverka detta —
  korsreferens där.
- `--heartbeat 30` gör att döda förbindelser upptäcks inom ~30 s; tidigare
  fynd (föräldralös websockify höll 6080, activating-loop) handlar om
  START-fasens portbindning, inte om drift — se §7 punkt 3–5.

---

## 5. Portar och exponering (säkerhetsfynd — root-ägt, OÅTGÄRDAT)

Mätt med `ss -tlnp` + `ps` som ak1a:

| Port | Lyssnare | Bindning | Bedömning |
|---|---|---|---|
| 5910 | Xvnc (pid 349454, syns som ak1a) | **endast 127.0.0.1 + ::1** | Rätt — `-localhost` verkar |
| 6080 | websockify pid 351439 + forkserver-barn 351472 — **körs av ROOT** (`ps` bevis; enheten saknar `User=`) | **0.0.0.0** | Direktåtkomst UTANFÖR nginx basic auth. Xvnc har `SecurityTypes None` ⇒ OM 6080 når ut från internet är skrivbordet öppet utan lösenord. Brandväggsregler kan ej läsas som ak1a — okänd, får antas ÖPPEN tills root bevisat annat. |

Nginx officiella väg proxyar `/desk/*` → `127.0.0.1:6080`; att binda websockify
till 127.0.0.1 bryter alltså INTE kundvägen. Åtgärder föreslås i §7 (root).

---

## 6. Pulsen — installation i ak1a:s EGNA crontab

**Villkor 1 — skriptet finns:** `/home/ak1a/AK1/verktyg/desk-halsa.mjs`,
committad i `dda553ef` (v198-u1), ren git-status. Sviten är ren läsning (kod
granskad rad för rad: inga kill/restart, inga filskrivningar, inga hemligheter
— DESK_AUTH-värden loggas aldrig).

**Villkor 2 — grönt:** manuell körning 16:10:14 UTC →

```
=== DESK-HÄLSA — /desk-kedjan i EN kontroll ===
Bas https://lab.ak1nvestor.com · display :10 · web-rot /home/ak1a/desk-web · 2026-09-28T16:10:14.971Z
Auth-läge: DESK_AUTH ej satt (auth-trion blir SKIP)
PASS http-landning-401: GET /desk/ utan auth => 401 (auth-bommen lever)
PASS systemd-enheter: fyra enheter active (zdesk-xvnc, zdesk-wm, zdesk-zcode, zdesk-novnc)
PASS x-geometri: _NET_WORKAREA = 0,0,1280,720 => exakt 1280x720
PASS fonstermaximering: 1 fönster maximerade både VERT och HORZ (0x400003)
SKIP http-auth-landning / http-auth-vnc-html / http-auth-ui-js: DESK_AUTH ej satt (väntat)
PASS webrot-vnc-html: /home/ak1a/desk-web/vnc.html existerar (17823 byte)
PASS webrot-defaults-json: /home/ak1a/desk-web/defaults.json är giltig JSON (4 toppnycklar)
Summa: 6 PASS, 0 FAIL, 3 SKIP · 1.0 s (tak 30 s)
RESULTAT: 6/6 PASS
EXIT=0
```

**Manifestavvikelse (dokumenterad):** manifestraden pekar `cd /home/ak1a/agent/ak1`
— men den klonen saknar `verktyg/desk-halsa.mjs` (klonens HEAD `aea976b6`, med
v197-stam; u1-committen `dda553ef` finns inte i dess historik). Verbatim
installation hade blivit en DÖD puls (fil ej funnen var 30:e minut). Installerad
rad använder `cd /home/ak1a/AK1` — träd där skriptet är committat, i linje med
ALLA befintliga crontabrader. Klonfrågan bokförs som fabriksrondspost (§7 sista).

**crontab FÖRE (15 rader; backup /tmp/crontab-ak1a-u5-backup.txt):**

```
30 2 * * * cd /home/ak1a/AK1 && mkdir -p data/backups/supabase && PGPASSFILE=/home/ak1a/.pgpass /usr/lib/postgresql/18/bin/pg_dump "host=db.rkaqmulgoubvewwnwxrw.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" 2>>/tmp/supabase-backup.log | gzip > data/backups/supabase/db-$(date +\%Y-\%m-\%d).sql.gz && /usr/bin/node /home/ak1a/AK1/verktyg/kolla-dump-markorer.mjs --natt >> /tmp/supabase-backup.log 2>&1 && find data/backups/supabase -name "db-*.sql.gz" -mtime +30 -delete
17 1,7,13,19 * * * /home/ak1a/AK1/data/infra/contabo/granssnittsvakt-cron.sh
40 2 * * * cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/backup-fran-molnet.mjs >> /tmp/moln-backup.log 2>&1
20 3 * * 0 cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/arkivera-server.mjs >> /tmp/server-arkiv.log 2>&1
17 4 * * * /home/ak1a/AK1/data/infra/contabo/doda-lankar-externa-cron.sh
50 2 * * * /bin/bash /home/ak1a/AK1/verktyg/dumpa-app-db.sh >> /tmp/supabase-appdump.log 2>&1

# o136 (spår 8): daemonens rop-hälsa — daglig kadensmätning 06:27 lokal (efter externa 04:17, före kvalitetsvakt 07:02)
27 6 * * * /home/ak1a/AK1/data/infra/contabo/rop-halsa-cron.sh

# o151 (spår 7): natt-TBT-mätaren — daglig 03:27 lokal (efter ISR-varmaren 03:10, tystaste lastfönstret; metrologiregeln o143 §3)
27 3 * * * /home/ak1a/AK1/data/infra/contabo/natt-tbt-cron.sh

# o164 (spår 8): beroendevakten — daglig 05:37 lokal (fritt fönster: efter dödlänkarnas ~04:30-slut, före rop-hälsan 06:27; npm audit tar sekunder, ingen chrome-RAM)
37 5 * * * /home/ak1a/AK1/data/infra/contabo/beroende-vakt-cron.sh
```

**Installationen:** `crontab -l` backup → +2 rader i kopia → `crontab <kopia>`.
Diff före/efter = exakt de två tillagda raderna, inget borttaget.

**crontab EFTER (tillägg sist):**

```
# v198-u5: desk-pulsen — /desk-kedjans hälsa var 30:e minut (6/6 PASS 2026-09-28; sökväg korrigerad fran manifestets agent/ak1 till prod-tradet, se data/forskning/DESK-U5-DESKSTABILITET.md §6)
*/30 * * * * cd /home/ak1a/AK1 && /usr/bin/node verktyg/desk-halsa.mjs >> /home/ak1a/desk-halsa.log 2>&1
```

Egenskaper: takt :00/:30 varje timme (överlappar inget befintligt schema; 02:30
kör supabase-backup parallellt — separata cron-processer, ingen konflikt);
körtid ~1 s (tak 30 s i skriptet) ⇒ ingen överlappningsrisk; `/usr/bin/node`
absolut sökväg som övriga rader; loggen `/home/ak1a/desk-halsa.log` LIGGER
UTANFÖR repot (trädet hålls rent) och skapas av cron vid första ticket 16:30
UTC — **nästa rond verifierar med `tail /home/ak1a/desk-halsa.log`**.

---

## 7. Förslag till nästa root-rond (varje med motivering)

1. **OnFailure-larm på alla fyra enheter** — t.ex. `OnFailure=zdesk-haveri@%n`
   med en mottagarenhet som skriver larmmarkör till `data/vakten/` + POSTar
   studio-strömmen. **Motivering:** PID 1:s Failed-rader syns inte för ak1a
   (§2) och pulsen har 30-minutersblindhål; OnFailure gör haveri till PUSH
   inom sekunder istället för upptäckt vid nästa puls eller — värre — av
   kunden.
2. **Lägg ak1a i `systemd-journal`-gruppen** (`usermod -aG systemd-journal
   ak1a`). **Motivering:** låser upp PID 1:s livscykelrader = full
   efterhandsanalys (Started/Stopped/Failed/Scheduled restart) utan root —
   kurerar §2:s blinda fläck för hela vaktfamiljen, inte bara desk.
3. **`User=ak1a` + `Group=ak1a` på zdesk-novnc.** **Motivering:** minsta
   privilegium — websockify binder 6080 (hög port) och läser ak1a-ägd webrot;
   root-drift (bevisat §5) gör journalen osynlig OCH föräldralösa websockify
   odödbara för ak1a (port-6080-incidenten). Ej heller någon R2-yta — ren
   driftshärdning.
4. **Binda websockify till 127.0.0.1** (`… --heartbeat 30 127.0.0.1:6080
   localhost:5910`) + kontrollera/stonsluta 6080 utåt i brandväggen.
   **Motivering:** idag `0.0.0.0` med `SecurityTypes None` bakom — enda
   skyddet på den vägen är en overifierad brandvägg; nginx kundväg går via
   127.0.0.1 och påverkas inte. **Prioritet HÖG** (potentiellt öppet
   skrivbord på internet). Verifiering efteråt: `ss -tlnp | grep 6080` +
   extern curl.
5. **Restart-tålig omstartspolitik på novnc+zcode:** `RestartSec=3`,
   `StartLimitIntervalSec=120`, `StartLimitBurst=10`. **Motivering:**
   activating-loop-fenomenet (novnc NRestarts=7, portkrock med orphan) och
   zcodes 10-minuterscykel kan under snabba serier nå standardtaket (5
   starter/10 s) ⇒ enhet fastnar i `failed` och kedjan ligger nere tills
   manuell åtgärd; rymligare tak + 3 s andning gör `Restart=always`
   hållbart. **WatchdogUSec föreslås AVSTÅENDES (0 kvar):** ingen av de fyra
   processerna (Xvnc, openbox, Electron, websockify) sänder sd_notify — en
   watchdog utan keepalive skulle döda FRISKA processer. Puls + OnFailure
   (§6, punkt 1) är rätt överlevnadslinns tills notify-stöd finns.
6. **Pulsvaktskoppling** — ny liten ak1a-cron (förslag `13 * * * *`): kollar
   att `/home/ak1a/desk-halsa.log` (a) finns, (b) fått rader senaste 40 min
   (ett missat tick + marginal — undviker falsklarm), (c) sista `RESULTAT:`
   är N/N; larmvia samma väg som gränssnittsvakten (`data/vakten/` +
   studio-ström). **Motivering:** pulsen är tyst vid fel (exit 1 skriver bara
   till filen) — en friskhet+innehållskontroll gör tyst död till larm inom
   drygt timmen.
7. *(Fabriksrond, organ Φ — ej root)* **Kanonisera fabriksträdet:** klonen
   `/home/ak1a/agent/ak1` ligger på v197-stam och saknar u1/u2, men bär en
   u3-commit (`aea976b6`) som INTE finns i prod-trädets historik (prod u3 =
   `7b8cf1ee`) — två parallella u3-linjer. Manifest för denna våg antog att
   klonen bar desk-halsa.mjs (nära att en död puls installerats). Besluta ETT
   mönster: antingen `git pull` av klonen i varje fabriksrop, eller att
   manifest alltid pekar på `/home/ak1a/AK1`.

---

## 8. KVD

- **Ingen src-ändring** ⇒ typkontroll ej aktuell för leveransen; pre-commit-
  grinden (tsc 0 + hemlighetsscan) körs mekaniskt på committen ändå.
- **Ren läsning:** inga processer dödade/omstarta, inga filer utanför ägandet
  skrivna (backup + nya crontab-filen ligger i /tmp).
- **crontab före/efter:** §6 (diff = exakt +2 rader).
- **Hälsosvit:** 6/6 PASS, exit 0 — utdrag §6.
- **Första cron-ticket** 16:30 UTC verifieras av nästa rond (`tail
  /home/ak1a/desk-halsa.log`).

*Juridik: intern driftsdokumentation — inga råd-uttalanden förekommer
(utbildningsplattformen hålls åtskilt från rådgivning, 2007:528).*

RESULTAT: utredning + puls (installerad)
