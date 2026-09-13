# HTTPS-SJÄLVSTART-PROV — provrapport våg 122C

- **Datum:** 2026-09-13 (provtider 11:18–11:26 UTC / 13:18–13:25 CEST lokal server-tid)
- **Organ:** Θ (diagnos) · **Beslut:** styrelsens mtzou25g åtgärd 3 — "verifiera automatisk
  HTTPS-certifikatförnyelse (certbot) samt att nginx och pm2 startar själva efter
  serveromstart — dokumentera provet".
- **Verktygsläge:** sudo/systemctl/crontab är SPIÄRRADE i studion (fastnar i
  behörighetsprompt). Samtliga bevis nedan är samlade via LÄSBARA vägar: node
  (tls.connect, fetch, fs), ls/cat/stat på världsläsbara filer. Ingenta
  ändringar har gjorts på servern — hela leveransen är denna rapport (KVD:
  dataleverans, ingen kod ändrad).

---

## 1. SYFTE

Bevisa — inte tro — tre saker om produktionsservern (Contabo 5.189.162.162,
lab.ak1nvestor.com):

1. HTTPS-certifikatet är giltigt och förnyelsemaskineriet (certbot) är aktiverat.
2. nginx startar själv vid omstart (systemd 'enabled' på enhetsnivå).
3. pm2 (och därmed Next.js-appen 'ak1a' + app-servern för /studio) startar
   själv vid omstart (systemd 'enabled' + resurrect-dump).

Ärlighetsprincip: varje påstående klassas som **BEVISAT** (utdata i denna
rapport), **KONFIGURERAT** (konfiguration läsbar men funktionen ej ännu
skedd/prövad i drift) eller **VÄNTAR KUND** (kräver sudo = kundens hand).

---

## 2. METOD

| Fråga | Läsbar väg (ersättning för spärrade kommandon) |
|---|---|
| Certifikatets giltighet | node `tls.connect` → `getPeerCertificate()` (ersätter `sudo certbot certificates`) |
| certbot-timer aktiverad | `ls -la /etc/systemd/system/timers.target.wants/` + `cat` av timern (ersätter `systemctl is-enabled certbot.timer`) |
| nginx/pm2 självläge | `ls -la /etc/systemd/system/multi-user.target.wants/` + `cat` av enhetsfiler (ersätter `systemctl is-enabled …`) |
| pm2:s resurrect-material | `cat`/node-läsning av `~/.pm2/dump.pm2` (JSON) + pid-filer i `~/.pm2/pids/` |
| Hela kedjan lever just nu | node `fetch` mot https://lab.ak1nvestor.com/ + /studio + /api/studio/halsa |

Notering om metodens gränser: `pm2 ls` och läsning av `/proc/<pid>` kunde INTE
köras från studions bash (verktygsskalet svarade inte inom 30 s — dokumenterat
faktum, inte gissning). Livstecken för pm2-processerna hämtades i stället via
pid-filernas tidsstämplar och via att sajten/App Engine svarar 200 (se bevis 7
och 9) — detta räcker för provets fråga, men redovisas ärligt som indirekta
bevis för processernas tillstånd, direkta bevis för att tjänsterna är
aktiverade vid boot.

---

## 3. BEVIS

### Bevis 1 — Certifikatet: giltigt, färskt, hela kedjan verifierar (BEVISAT)

Kommando (node, kördes 2026-09-13 11:18:15 UTC): tls.connect till
lab.ak1nvestor.com:443 med rejectUnauthorized=true → getPeerCertificate().

Faktisk utdata:

```
PROVTID (UTC): 2026-09-13T11:18:15.888Z
subject: {"CN":"lab.ak1nvestor.com"}
issuer: {"C":"US","O":"Let's Encrypt","CN":"YE1"}
notBefore: Sep  8 18:03:22 2026 GMT
notAfter: Dec  7 18:03:21 2026 GMT
certlivslängd (dygn): 90
ålder (dygn sedan notBefore): 5
marginal (dygn till notAfter): 85
valideringskedja OK (authorized): true
TLS-protokoll: TLSv1.3
```

**Slutsats (BEVISAT):** Servern presenterar ett giltigt Let's Encrypt-cert
(utgivare YE1) för exakt lab.ak1nvestor.com, exakt 90 dagars giltighetsfönster
(Let's Encrypt standard), med 85 dagars marginal kvar vid provtiden
2026-09-13. Klientens fulla validering godkänd (authorized=true) och
förhandlingen skedde med TLS 1.3.

**Ärlig tolkning av förnyelsehistoriken (viktigt):** notBefore (2026-09-08
18:03 UTC = 20:03 lokal) ligger inom senaste ~60 dygn — MEN sammanfaller
timme för timme med serverns setup-kväll 8 sep (systemd-enheterna för certbot/
nginx/pm2 länkades 20:41–20:43 lokal samma kväll, se bevis 2/4/5, och
DRIFTSBOKEN kap 1 anger kunddirektiv om Contabo-drift 2026-09-08). Detta är
med stor sannolikhet den **initiala utfärdelsen** vid installationen — INTE
en ännu genomförd automatisk förnyelse. Certet är helt enkelt för ungt för
att någon förnyelse ha behövts. Certbot förnyar normalt när ~30 dagar återstår,
dvs första automatiserade förnyelsen förväntas runt **2026-11-07**. Alltså:
"en förnyelse HAR skett automatiskt" kan ICKE bevisas idag; vad som bevisas
är (a) giltigt färskt cert, (b) förnyelsemaskineriet aktiverat (bevis 2–3).
Att förnyelseförfarandet fungerar i drift är KONFIGURERAT tills dess
(kundens `--dry-run` eller den första riktiga förnyelsen i november bevisar det).

### Bevis 2 — certbot.timer: aktiverad på enhetsnivå (BEVISAT)

Kommando: `ls -la /etc/systemd/system/timers.target.wants/` (2026-09-13).
Relevant rad ur faktisk utdata:

```
lrwxrwxrwx 1 root root 47 Sep  8 20:41 certbot.timer -> /usr/lib/systemd/system/certbot.timer
```

Slutsats: symlinken i timers.target.wants är exakt det systemd skapar vid
`systemctl enable` — timern är **aktiverad på enhetsnivå och kommer att laddas
vid varje boot**. Skapad Sep 8 20:41 lokal (setup-kvällen), oförändrad sedan dess.

### Bevis 3 — certbot.timer/service: 2 gånger/dygn, Persistent (BEVISAT)

Kommando: `cat /usr/lib/systemd/system/certbot.timer` samt
`cat /usr/lib/systemd/system/certbot.service`. Faktisk utdata:

```
# certbot.timer
[Unit]
Description=Run certbot twice daily
[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=43200
Persistent=true
[Install]
WantedBy=timers.target

# certbot.service (relevant del)
[Service]
Type=oneshot
ExecStart=/usr/bin/certbot -q renew --no-random-sleep-on-renew
PrivateTmp=true
```

Slutsats: schemat är 00:00 och 12:00 med slumpad fördröning upp till 12 h
(standard från certbot-paketet, Avoiding-peak-design), Persistent=true innebär
att en missad körning (t.ex. server avstängd) tas igen när servern vaknar.
Tjänsten kör `certbot -q renew` — tyst läge, förnyar bara när det behövs.
Stämmer överens med DRIFTSBOKEN kap 2 ("certbot.timer förnyelser … 2 ggr/dag").
Kompletterande bevis att certbot äger nginx-SSL-blocket: /etc/nginx/
sites-available/ak1a (läst, world-readable) innehåller rader som
`listen 443 ssl; # managed by Certbot` och cert-sökvägarna under
`/etc/letsencrypt/live/lab.ak1nvestor.com/` — installationen är en
certbot--nginx-integration, vilket är samma mekanism som sköter omkonfiguration
vid förnyelse (nginx laddas om av certbot efter byte).

### Bevis 4 — nginx: aktiverad vid boot + lever just nu (BEVISAT)

Kommando: `ls -la /etc/systemd/system/multi-user.target.wants/` (2026-09-13).
Relevanta rader ur faktisk utdata:

```
lrwxrwxrwx 1 root root 37 Sep  8 20:41 nginx.service -> /usr/lib/systemd/system/nginx.service
lrwxrwxrwx 1 root root 36 Sep  8 20:43 pm2-ak1a.service -> /etc/systemd/system/pm2-ak1a.service
lrwxrwxrwx 1 root root 38 Sep  9 12:34 zcode-chat.service -> /etc/systemd/system/zcode-chat.service
lrwxrwxrwx 1 root root 40 Sep  8 20:41 fail2ban.service -> /usr/lib/systemd/system/fail2ban.service
lrwxrwxrwx 1 root root 38 Sep  9 12:34 postgresql.service -> /usr/lib/systemd/system/postgresql.service
```

**Slutsats nginx (BEVISAT):** nginx.service är symlinkad i multi-user.target.
wants = aktiverad vid boot. Därtill LIVE-bevis (bevis 9): port 443 svarar
200 med rätt cert och port 80 svarar 301 → https — nginx arbetar korrekt
just nu. Webbplatskonfigen är aktiverad via
`/etc/nginx/sites-enabled/ak1a -> ../sites-available/ak1a` (ls bevisad):
SSL-terminering + proxy 127.0.0.1:3000 (Next.js) + /chat → 127.0.0.1:7681
(ttyd) + HTTP→HTTPS-redirect.

### Bevis 5 — pm2-ak1a.service: aktiverad vid boot, kör resurrect (BEVISAT)

Kommando: `cat /etc/systemd/system/pm2-ak1a.service` (644 root:root, läsbar).
Faktisk utdata:

```
[Unit]
Description=PM2 process manager
After=network.target
[Service]
Type=forking
User=ak1a
LimitNOFILE=infinity
Environment=PM2_HOME=/home/ak1a/.pm2
PIDFile=/home/ak1a/.pm2/pm2.pid
Restart=on-failure
ExecStart=/usr/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/lib/node_modules/pm2/bin/pm2 kill
[Install]
WantedBy=multi-user.target
```

**Slutsats (BEVISAT):** pm2-ak1a.service är symlinkad i multi-user.target.wants
(aktiverad vid boot, se bevis 4) och dess ExecStart är `pm2 resurrect` — dvs
vid boot återuppväcker pm2 exakt de processer som senast sparats i dumpen
(bevis 6). Restart=on-failure ger dessutom omstart vid krasch. PM2_HOME pekar
på /home/ak1a/.pm2, alltså samma hemvist som dumpen nedan. (Enheten skapad
Sep 8 20:43 lokal — setup-kvällen; stämmer med DRIFTSBOKEN kap 1
"pm2-ak1a systemd-tjänsten är enabled".)

### Bevis 6 — dump.pm2: resurrect har material — 3 processer inkl. ak1a (BEVISAT)

Kommandon: `ls -la /home/ak1a/.pm2/dump.pm2` + node-läsning av JSON:et.
Faktisk utdata:

```
-rw-rw-r-- 1 ak1a ak1a 23453 Sep 13 01:31 /home/ak1a/.pm2/dump.pm2
(= mtime 2026-09-12T23:31:04 UTC)

Antal processer i dumpen: 3
- name: ak1a       | exec: /usr/bin/npm             | cwd: /home/ak1a/AK1
- name: ak1a-test  | exec: /home/ak1a/AK1-test/…/next | cwd: /home/ak1a/AK1-test
- name: ak1a-pumpor | exec: /home/ak1a/AK1/verktyg/pumpor-daemon.mjs | cwd: /home/ak1a/AK1
```

**Slutsats (BEVISAT):** dumpen finns, är färsk (sparad 2026-09-12 23:31 UTC —
`pm2 save` körs i driften, senast natten före detta prov) och innehåller
hela produktionsbehovet: **ak1a** (npm run start i /home/ak1a/AK1 = Next.js
prod på port 3000), ak1a-pumpor (styrelsens pumpor-daemon) och ak1a-test
(testmiljön). När systemd vid boot kör `pm2 resurrect` får den exakt detta
att återuppväcka. Kedjan boot → systemd → pm2 resurrect → ak1a är därmed
konfigurationsmässigt komplett och varje länk är läsbelyst.

### Bevis 7 — pm2-processerna lever nu (indirekta livstecken, BEVISAT på filnivå)

Kommandon: `ls -la /home/ak1a/.pm2/pids/` + `cat /home/ak1a/.pm2/pm2.pid`.
Faktisk utdata:

```
-rw-rw-r-- 1 ak1a ak1a   6 Sep 13 10:50 ak1a-0.pid        (ak1a, id 0)
-rw-rw-r-- 1 ak1a ak1a   6 Sep 13 01:31 ak1a-pumpor-2.pid (pumpor, id 2)
-rw-rw-r-- 1 ak1a ak1a   5 Sep  8 22:47 ak1a-test-1.pid   (test, id 1)
pm2.pid = 3984
```

**Slutsats:** pid-filerna för ak1a skrevs 10:50 lokal (08:50 UTC) och pumpornas
01:31 lokal — pm2-hushållet var aktivt samma dag som provet. /proc-kontroll av
pid:arna kunde ej köras från studions verktygsskal (dokumenterat i kap 2), MEN
bevis 9 (sajten svarar 200 via nginx→127.0.0.1:3000→pm2-ak1a, och
/api/studio/halsa rapporterar levande barnprocesser med aktuella pid:ar)
bevisar att pm2 och dess processer arbetar just nu. Klassning: processernas
AKTIVA tillstånd = bevisat via halsa-endpointen; pid-filerna = stödjande.

### Bevis 8 — App-servern (zcode-app-cli, /studio): barnprocess-design, INGET gap (BEVISAT)

Källläsning: `src/lib/studio/studio-transport.ts` (repot, rad ~431 ff):

> "appServerTransport — PRIMÄR … spawnar `zcode app-server` som långlivad
> barnprocess och talar ZCode Protocol: NDJSON …"

LIVE-bevis — node fetch mot https://lab.ak1nvestor.com/api/studio/halsa
(2026-09-13 11:25 UTC), faktisk utdata (förkortad):

```
{"transport":"appserver","maxAktivaBarn":3,
 "barn":[{"standard":true,"pid":298164,"lever":true,"ramMB":47.8,"omstartForsok":0},
         {"standard":false,"pid":301462,"lever":true,"ramMB":47.8,"omstartForsok":0},
         {"standard":false,"pid":305029,"lever":true,"ramMB":47.9,"omstartForsok":0}],
 "antalBarnprocesser":3 …}
```

**Slutsats (BEVISAT):** app-servern behöver INGEN egen boot-tjänst — den
spawnas som barnprocess av Next.js-appen (pm2 'ak1a') när /studio använder,
med hushållning enligt källkoden (max 3 samtidiga barn, idle-städning 2 h,
SIGTERM-hantering vid pm2-omstart, värme-hantering vid kall start). Självstart
vid omstart täcks ALLTSÅ av kedjan i bevis 5+6: systemd → pm2 resurrect →
ak1a → barn spawnas vid behov. Tre barnprocesser lever just nu (pid 298164,
301462, 305029; ~48 MB RAM vardera; 0 omstartsförsök) — kundens /studio är
i drift. Noterat: efter en boot är barnen nere tills första studio-besök
(eller värmen) — det är medveten design (våg 87: "servern + barnprocessen
fortsätter ARBETA när användaren lämnar"), inte ett gap.

### Bevis 9 — Hela kedjan lever just nu (BEVISAT)

node fetch (2026-09-13 11:25:24 UTC), faktisk utdata:

```
https://lab.ak1nvestor.com/      -> 200 text/html; charset=utf-8
http://lab.ak1nvestor.com/       -> 301 Location: https://lab.ak1nvestor.com/
https://lab.ak1nvestor.com/studio -> 200
/api/studio/halsa                -> 200 (innehåll i bevis 8)
```

**Slutsats:** cert + nginx + pm2 + Next.js + app-server-barn — hela leverans-
kedjan för kundens webb och studio är verifierad i drift vid provtillfället,
och HTTP tvingas till HTTPS (certbot-redirecten från bevis 3).

### Bevis 10 — /chat-vägen och starta-zcode.sh (BEVISAT, med notering)

- `data/infra/contabo/starta-zcode.sh` (läst): MANUELL tmux-väg — skapar/
  återansluter tmux-sessionen "zcode" (CLI-agenten för Termius-SSH-vägen),
  plus engångs­nyckelinstall. Är I sig inte del av boot-kedjan.
- MEN: `zcode-chat.service` (läst, 644 root:root) är symlinkad i
  multi-user.target.wants (bevis 4) med
  `ExecStart=/usr/local/bin/ttyd … -i 127.0.0.1 -p 7681 … tmux new -A -s zcode zcode`
  och `Restart=always` — dvs /chat-terminalen (ttyd→tmux→zcode) startar
  SJÄLV vid boot och hålls uppe. nginx proxar /chat → 7681 (bevis 4).

**Slutsats:** kundens chattvägar efter omstart: /studio via pm2-kedjan (bevis
5–8, barn vid behov), /chat via zcode-chat.service (bevisat aktiverad), SSH-
tmux via starta-zcode.sh (manuell, per design). Inget gap.

---

## 4. SAMMANFATTANDE TABELL

| # | Påstående | Status | Bevis |
|---|---|---|---|
| 1 | Cert giltigt för lab.ak1nvestor.com (Let's Encrypt, 90 d, TLS 1.3) | **BEVISAT** | Bevis 1 (2026-09-13 11:18 UTC) |
| 2 | Automatisk förnyelse HAR skett (utförd i drift) | **EJ PÅVISBART ÄN** — certet är initiala utfärdelsen från 8 sep; första förnyelsen väntas ~2026-11-07 | Bevis 1 (notBefore vs setup-datum) |
| 3 | Förnyelsemaskineriet aktiverat (certbot.timer 2 ggr/dygn, Persistent, renew-kommando) | **BEVISAT** (aktivering + konfiguration) / **KONFIGURERAT** (att renew lyckas i drift bevisas först vid första förnyelsen eller dry-run) | Bevis 2 + 3 |
| 4 | nginx startar själv vid omstart | **BEVISAT** (enabled-symlink) — faktisk reboot se VÄNTAR KUND | Bevis 4 + 9 |
| 5 | pm2 startar själv vid omstart | **BEVISAT** (enabled-symlink + resurrect + dump) — faktisk reboot se VÄNTAR KUND | Bevis 4 + 5 + 6 |
| 6 | Alla tre pm2-processerna (ak1a, ak1a-test, ak1a-pumpor) återkommer vid boot | **BEVISAT** (alla tre står i dump.pm2 som resurrect läser) | Bevis 6 |
| 7 | App-servern /studio överlever omstart | **BEVISAT** (design: barn till pm2-ak1a; barnen levande nu) | Bevis 8 |
| 8 | /chat (ttyd) startar själv | **BEVISAT** (zcode-chat.service enabled, Restart=always) | Bevis 4 + 10 |
| 9 | Reboot-reálisering: allt kommer UPP efter faktisk omstart | **VÄNTAR KUND** (drill nedan) | — |
| 10 | certbot renew fungerar mot Let's Encrypt just nu (nät/konto/rate) | **VÄNTAR KUND** (sudo dry-run) | — |

---

## 5. VÄNTAR KUND-GODKÄNNANDE (sudo — exakta kommandon)

Studions verktygsläge spärrar sudo; dessa steg kan bara kunden (eller en
SSH-session med sudo) köra. De bevisar det sista percentilet:

```bash
# A. Förnyelseprovet (bekräfta "Congratulations, all simulated renewals succeeded")
sudo certbot renew --dry-run

# B. Enhetlig aktiveringskoll (samma sak våra symlinks bevisar, fast av systemd själv)
sudo systemctl is-enabled nginx pm2-ak1a certbot.timer
# förväntat: enabled \n enabled \n enabled

# C. Vid tillfälle — timerns nästa körtid (frivillig extra)
sudo systemctl list-timers certbot.timer --no-pager
```

### Reboot-drill (planerad — körs EJ autonomt)

**Varför reboot inte körts i detta prov:** en omstart dödar AI-sessionen
(självaste provaren), kundens båda chattvägar (/studio-appens barnprocesser
och /chat-ttyd:n med dess tmux-agent) samt pågående bakgrundsvågor. All
kommunikation med kunden ligger på den server som startas om — om något
inte kommer tillbaka står kunden utan röstväg utom Contabo-panelen. En drill
ska därför ske i kundens fönster, med kundens vetskap, när kunden kan
övervaka Contabo-panelen (rescue-läge finns där) — R2-andan: existential-
riskande driftsbrott ägs av kunden även om ingen formell veto krävs.

**Före drillen (av agenten, läsbara vägar):**
1. `pm2 save` via SSH (dumpen färsk — den är det resurrect läser; senast
   sparad 2026-09-12 23:31 UTC enligt bevis 6).
2. Kontrollera att develop är committad i både /home/ak1a/AK1 och arbetsytan
   (inget osparat arbete som riskeras).
3. Notera certets notAfter (skriv ner före/efter — ett bevis till att
   certet överlever och att tiden går åt rätt håll).
4. Meddela kunden: fönster + förväntat avbrott ~2–5 min.

**Efter drillen (läsbara kontroller, i ordning):**
1. node tls.connect → cert presenteras med samma/nyare datum (bevis 1-metoden).
2. fetch https://lab.ak1nvestor.com/ → 200 (bevis 9-metoden).
3. fetch /api/studio/halsa → 200, transport=appserver (bevis 8-metoden;
   barnen kan komma igång vid första besök — maxAktivaBarn-hushållet sköter det).
4. SSH: `pm2 ls` → ak1a online, uptime = sedan boot (detta bevisar resurrect
   faktiskt utförde jobbet — slutbeviset för tabellens rad 5).
5. /chat i webbläsaren → terminalen svarar (zcode-chat.service).
6. Kontroll av att pumpor-daemonen vaknat (målhjärtslaget i system_events /
   pm2-pidens ålder).
7. Protokoll: resultat in i denna fil (ny sektion "REBOOT-DRILL UTFÖRD")
   + worklog-rad.

---

## 6. ÖVRIGA OBSERVATIONER (ej åtgärdade — utanför uppdragets ägarskap)

1. **zcode-chat.service innehåller Basic Auth-referenser i klartext** i den
   världsläsbara (644) enhetsfilen (sett vid bevis 10; värdet återges med
   vilje EJ här). Åtgärd kräver sudo (t.ex. flytta till EnvironmentFile
   med 600) → styrelsen bör ta ställning; tills dess noteras risken som låg
   (filen kräver shell-åtkomst på servern för att läsas) men onödig.
2. **ak1a-test står i resurrect-dumpen** — testmiljön återstartar alltså vid
   varje boot. Om den inte längre önskas vid drift kan den plockas ur dumpen
   (pm2 delete + pm2 save via SSH) — beslut till driftorganet, inget fel.

---

## 7. KVD

- Ingen kod ändrad, ingen serverkonfiguration ändrad — leveransen är uteslutande
  denna rapport (dataleverans enligt protokoll).
- Varje påstående i tabellen har en bevisrad i kap 3 med kommando, faktisk
  utdata och tidsstämpel.
- Ärlighetsredovisning: "förnyelse HAR skett" (uppdragets tolkningsregel)
  har omvärderats till "initial utfärdelse, förnyelse väntas ~2026-11-07" —
  notBefore-vs-setup-datum bevisar att certet är 5 dagar gammalt och kommer
  från installationen; att skriva "automatisk förnyelse skett" vore en lögn
  med siffror i hand.

*Protokollfört av agent våg 122C, 2026-09-13.*
