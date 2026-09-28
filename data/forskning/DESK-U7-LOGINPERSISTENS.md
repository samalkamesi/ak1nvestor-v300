# DESK-U7 — Loginpersistens: inloggningens hemvist + backup-procedur

Våg v201-u3 · Agentfabrik-barn (BYGGARE) · 2026-09-28 19:45 lokal
Föräldradokument: desk-kedjan (jfr DESK-U5-DESKSTABILITET.md, desk-pulsen).
Uppdrag: kartlägga VAR OAuth-tokenen landnar på Linux när kunden loggar in
EN gång i skrivbords-ZCode (zdesk-zcode, systemd + persistent profil), och
bygg proceduren som skyddar den — för att appen sedan ska förbli inloggad
FÖR ALLTID.

---

## § 1 Lägesbesked: appen är EJ inloggad (2026-09-28 19:38)

Journalen (både process 440206 före omstart 19:36 och nya 446480/447235
efter) ger en entydig bild:

```
Sep 28 19:38:27 … [rpc:call] oauth.restoreCachedSessionState OK (708.7ms)
Sep 28 19:38:31 … [provider-runtime][trace:Provider Registry 已就绪]
                 {"configRevision":"…","providerCount":0}
Sep 28 19:38:31 … message: '当前没有可用的模型供应商和模型，请先登录或配置 API Key。'
                 (= "ingen modelleverantör tillgänglig — logga in eller
                    konfigurera API-nyckel först")
Sep 28 19:38:44 … [rpc:call] oauth.getProviders OK (14.3ms)
Sep 28 19:38:45 … [rpc:call] oauth.getActiveProvider OK (14.6ms)
Sep 28 19:37:22 … [spawnHostProcess] BIGMODEL_OAUTH_APP_SECRET source: fallback
```

Tolkning:
- `oauth.restoreCachedSessionState OK` körs vid varje uppstart men cachen
  är tom — det finns INGEN sessionsstatus att återställa ännu.
- `providerCount: 0` + explicit "logga in först"-meddelande = appen är
  utloggad; samma läge sågs 19:17:59 i föregående process.
- `oauth.getProviders`/`getActiveProvider`-pollningen (19:18 och 19:38) är
  UI:t som frågar efter inloggningsstatus — pollning PÅGÅR alltså, den har
  inte upphört. Detta är "Log in"-knapp-läget.
- `BIGMODEL_OAUTH_APP_SECRET source: fallback` (19:37:22): OAuth-
  apphemligheten kommer från inbyggd fallback — inget env behövs, login-
  fönstret kan öppnas när kunden vill.

## § 2 Var tokenen landar — kartering (namn/tidsstämplar, innehåll ALDRIG läst)

Elektron-appens persistenta profil är `~/.config/ZCode/session/`. Nuläge:

```
drwx------ 13 ak1a ak1a 4096 Sep 28 19:36 .
drwx------  4 ak1a ak1a 4096 Sep 28 19:36 ..
drwx------  4 ak1a ak1a 4096 Sep 28 14:13 Cache               ← död vikt, backas ej
-rw-------  1 ak1a ak1a 20480 Sep 28 19:37 Cookies
drwx------  3 ak1a ak1a 4096 Sep 28 18:58 Local Storage       ← TOKEN-KANDIDAT 1
-rw-------  1 ak1a ak1a   473 Sep 28 14:23 Network Persistent State
-rw-------  1 ak1a ak1a   158 Sep 28 19:36 Preferences
drwx------  2 ak1a ak1a 4096 Sep 28 19:35 Session Storage     ← TOKEN-KANDIDAT 2
drwx------  3 ak1a ak1a 4096 Sep 28 14:13 Partitions           ← TOKEN-KANDIDAT 3
```

Local Storage/leveldb (filnamn + tidsstämplar endast — innehåll opåläst):

```
-rw-r--r-- 1 ak1a ak1a 19976 Aug 23 01:28 000005.ldb
-rw-r--r-- 1 ak1a ak1a 11795 Sep 19 17:50 000277.ldb
-rw-r--r-- 1 ak1a ak1a 16141 Sep 20 21:09 000280.ldb
-rw-r--r-- 1 ak1a ak1a 31878 Sep 28 19:37 000282.log        ← skrivs kontinuerligt (appaktivitet)
-rw-r--r-- 1 ak1a ak1a 17840 Sep 24 00:42 000283.ldb        ← SENASTE komakterade DB:n
-rw-r--r-- 1 ak1a ak1a    16 Aug 22 23:57 CURRENT
-rw-rw-r-- 1 ak1a ak1a 23321 Sep 24 00:42 MANIFEST-000001
```

Observationer:
- Inget nytt `.ldb` sedan 24 sep — en genomförd login skulle med stor
  sannolikhet kompaktera fram nya .ldb-filer; frånvaron stödjer § 1.
- `000282.log` ändras av ren appaktivitet → mtime på log-filen är INGET
  inloggningsbevis (därför använder proceduren journalens providerCount som
  detektor, inte mtimes).
- `Partitions/` innehåller i dag endast `zcode-embedded-browser` (skapad
  14:13) — OAuth-popuppar kan skapa en egen partition vid login: den ska
  med i backupen (därför tar scriptet hela `Partitions/`).

**Tokenens hemvist — ärlig slutsats:** exakt vilka filer som bär tokenen
kan FASTSTÄLLAS FÖRST via diff mot FÖRE-bilden EFTER kundens login (§ 4).
Backupen täcker därför hela den tokenbärande delmängden (Local Storage,
Session Storage, Partitions, Preferences, Network Persistent State,
Cookies). Notera även: `oauth.restoreCachedSessionState` är ett zcode-host-
RPC — värden kan ha en egen cache under `~/.zcode/**`, som enligt U7:s
ägarskapsregler ligger UTANFÖR fabriksbarnets läs-räckvidd; den ytan ägs av
huvudagenten och ska ingå i dennas post-login-kontroll.

## § 3 FÖRE-bilden: ZCode.backup-r306 (gräns dokumenterad)

```
drwx------ 4 root root 4096 Sep 28 18:58 /home/ak1a/.config/ZCode.backup-r306
```

- Backupen skapades 2026-09-28 18:58 av root (skapare: huvudagentkanalen,
  som har sudo — fabriksbarnet har det inte: `sudo -n` → "SUDO-NEJ").
- `drwx------ root:root` ⇒ fabriksbarnet kan varken lista eller köra
  `diff -rq` mot den. DETTA ÄR EN ÄRLIG GRÄNS: diff-listan mot r306 kan
  bara levereras av huvudagenten efter login, med:

```
sudo diff -rq /home/ak1a/.config/ZCode.backup-r306 /home/ak1a/.config/ZCode \
  | grep -viE 'cache|blob_storage|DIPS|Singleton'
```

## § 4 Proceduren — FÖRBEREDD (ej verifierbar förrän kunden loggat in)

### 4.1 Levererade delar (redan på plats, utanför repot)

- `~/desk-login-backup/` (chmod 700) — vault-katalogen
- `~/desk-login-backup/spara-login.sh` (chmod 700) — VERIFIERAT 19:43:24:
  syntax-OK + detektorn SKIP:ar korrekt på utloggat läge
  (`SKIP: appen ej inloggad (senaste providerCount=0)`), exit 0.
- `~/desk-login-backup/README.md` — regler (hemligheter opålästa; arkiv
  chmod 600; återställning = huvudagentens domän)

Scriptet: (1) detekterar login via journalens senaste `"providerCount":N`
(raden `"providerCount":0` vid uppstart FÖRE restore är normalt — senaste
raden vinner); (2) hoppar över om oförändrat sedan senaste arkiv
(mtime-stämpel `.senaste-mtime`); (3) skapar
`zcode-login-ÅÅÅÅ-MM-DD_hhmmss.tar.gz` (umask 077 + chmod 600 — arkivet
INNEHÅLLER tokens) av tokenbärande delmängd; (4) rullande fönster keep 7.
Full källkod finns i filen samt i git-historiken av detta protokoll.

### 4.2 Cron-rad — DOKUMENTERAD, EJ INSTALLERAD (medvetet)

Ak1a:s crontab är INTE tom — den bär kritisk infrastruktur (supabase-backup
02:30, gränssnittsvakten 4×/dag, desk-pulsen v198-u5 m.fl.). U7:s regel
"ENDAST om crontab är tom/egen" tolkades strikt: raden installeras först
nästa rond, EFTER verifierad login + första verifierade arkivet. Rad att
 lägga (sista, med vXXX-prefix enligt v198-u5-mönstret):

```
# v201-u3 (DESK-U7): loginpersistens-backup — daglig 03:47 lokal (fritt fönster: efter natt-TBT 03:27, före dödlänkar 04:17; keep 7)
47 3 * * * /home/ak1a/desk-login-backup/spara-login.sh >> /home/ak1a/desk-login-backup/cron.log 2>&1
```

Installation (nästa rond, efter stegen i § 5):
`crontab -l > /tmp/crontab-u3.tmp && echo '<raden ovan>' >> /tmp/crontab-u3.tmp && crontab /tmp/crontab-u3.tmp && crontab -l | tail -3`

### 4.3 Katastrofåterställning (app tappar inloggningen)

1. Stoppa appen (huvudagentens domän — processpåverkan är inte fabriksens).
2. `tar -xzf ~/desk-login-backup/zcode-login-<datum>.tar.gz -C ~/.config/`
   (skriver tillbaka `ZCode/session/…`-trädet).
3. Starta om zdesk-zcode; verifiera `journalctl -u zdesk-zcode --since
   "-5 min" | grep -oE '"providerCount":[0-9]+' | tail -1` → ≥ 1.

## § 5 Bevakning — kvittosteg för nästa rond (allt förberett)

1. **Är kunden inloggad?**
   `journalctl -u zdesk-zcode --since "-1 hour" --no-pager | grep -oE '"providerCount":[0-9]+' | tail -1`
   → `0`/tom = fortfarande ej inloggad: avvakta (protokollet står kvar).
   → `≥1` = INLOGGAD: fortsätt.
2. **Diffa mot FÖRE-bilden** (kräver huvudagentens sudo, se § 3) och
   klistra diff-listan i § 2:bis — där fastställs tokenens exakta filer.
3. **Kör första arkivet:** `/home/ak1a/desk-login-backup/spara-login.sh &&
   tail -2 ~/desk-login-backup/backup.log` → vänta rad `OK: …tar.gz`.
   Verifiera innehållslista (ENDAST namn, aldrig innehåll):
   `tar -tzf ~/desk-login-backup/zcode-login-*.tar.gz | head -20`.
4. **Installera cron-raden** (§ 4.2) + `crontab -l | tail -3` som kvitto.
5. **Bokför:** uppdatera detta protokolls RESULTAT-rad till
   "inloggad-läge ja + procedur verifierad" + worklog-rad.

## § 6 Gränser (ärlighet)

- Tokenens exakta filändringar kan inte diffas förrän efter login; backupen
  täcker därför hela den tokenbärande delmängden hellre än en gissning.
- FÖRE-bilden är root-ägd — fabriksbarnet kan inte läsa den (sudo nekas);
  diffen är delegerad till huvudagenten (§ 3).
- `~/.zcode/**` (värdens egen session-cache är möjlig hemvist) är utanför
  U7:s läs-räckvidt — huvudagentens post-login-kontroll.
- Scriptets detektor bygger på journalens providerCount-spårning: om appen
  loggar in UTAN ny providerCount-rad i 24 h kan första arkivet dröja till
  dess — manuellt KVD-steg 3 ovan kringgår det.

RESULTAT: inloggad-läge nej + procedur förberedd
