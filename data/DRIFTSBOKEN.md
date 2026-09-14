# AK1A — DRIFTSBOKEN (operativ handbok)

Skriven 2026-09-08 av agent V86-DRIFTBOK. Fakta verifierade mot prod samma datum.
Målgrupp: människor + framtida AI-sessioner. REGEL: denna bok innehåller ALDRIG
hemliga värden — bara var nycklarna BOR. Sanningskällor: worklog.md (sista
sektionerna), STYRELSE-tidigare leverantör-ARKITEKTUR.md, data/infra/*, verktyg/*.

---

## 1. ARKITEKTURÖVERSIKT

Kunddirektiv 2026-09-08: Contabo = HELA driften. Kunden kan stänga av sin dator —
servern är självförsörjande mellan sessionerna. Inget kräver datorn på.

| Roll           | Ansvar                                                             |
|----------------|--------------------------------------------------------------------|
| Contabo-servern| PROD (sajt + API + croner + SSL) OCH byggmaskin (npm ci + build)   |
| GitHub         | Kodbas + spegel; varje main-push håller Vercel-reserven varm       |
| Datorn         | Backup-VALV (hybrid-sync): kod, data, serverkonfig — när den är på |
| Vercel         | Passiv katastrof-reserv (projekt "ak-1" kvar; DNS-flip = minuter)  |
| Supabase       | Levande data + auth (system_events-tabellen är sanningen)          |

Nyckelfakta (alla verifierade 2026-09-08):
- Server: Contabo Cloud VPS 4, 4 vCPU/8 GB, ~96 GB disk (5 % använt), Tyskland.
  Kostnad 6,88 EUR/man, obegränsad trafik.
- IP: 5.189.162.162. Domän: lab.ak1nvestor.com (A-record hos one.com).
- SSH: `ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162` (endast nycklar;
  PasswordAuthentication no; kontot ak1a har NOPASSWD-sudo).
- App: pm2-process `ak1a` (kör `npm run start` i /home/ak1a/AK1, Next.js på
  port 3000). pm2-ak1a systemd-tjänsten är `enabled` (överlever omstart).
- Webb: nginx-site `ak1a` (/etc/nginx/sites-available/ak1a) — proxy till
  127.0.0.1:3000, certbot/Let's Encrypt med HTTP->HTTPS-redirect.
- Node v22.23.2 på servern. UFW endast 22/80/443; fail2ban +
  unattended-upgrades aktiva. Tidszon: Europe/Berlin (CEST) — crontab-tider
  nedan är LOKAL tid.
- Git: remote `origin` = github.com/NewUserAK/AK1 (utveckling),
  remote `contabo` = ssh://ak1a@5.189.162.162/home/ak1a/AK1 (deploy-mål,
  receive.denyCurrentBranch=updateInstead). Driftsgren = `develop`.

## 2. DAGLIG DRIFT

### Sköter sig självt
- `/etc/crontab` (avsiktligt, men se KÄNT FEL nedan):
  - 06:30 dagligen: `curl -H "Host: lab.ak1nvestor.com" http://127.0.0.1/api/cron/vagscan`
  - 08:00 dagligen: samma mönster mot `/api/cron/nyheter`
  - 07:00 månadens 1:a: samma mönster mot `/api/cron/portfolj-uppfoljning`
  - */5 min (root): `/usr/local/bin/ak1a-halsa` — självläkande hälsokontroll:
    HTTP-koll via nginx; vid fel först `pm2 restart ak1a` (som användaren
    ak1a), sedan `systemctl restart nginx`, därefter bara loggning. ALDRIG
    loop-restart. Förebyggande: disk >= 90 % eller pm2-minne >= 1500 MB ger
    omstart. Logg: /var/log/ak1a-halsa.log (självsänks till 5000 rader).
- certbot.timer förnyelser Let's Encrypt automatiskt (2 ggr/dag, kollad aktiv).
- unattended-upgrades = säkerhetspatchar; fail2ban = SSH-skydd.
- Datorn (när på): AK1A-hybrid-sync vid inloggning (startmappen) + timvis
  via Schemaläggaren (se kap 4).

### Kända brister (kända vid skrivandet)
1. ~~**KÄNT FEL — /etc/crontab ignoreras HELT av cron.**~~ **ÅTGÄRDAT före
   2026-09-13** (våg 122A verifierade filläsning: alla fyra AK1A-rader har
   `root`-fält; /var/log/ak1a-halsa.log färsk var 5:e minut). Ursprunglig
   åtgärd stämmer fortfarande som referens: `30 6 * * * root curl ...`.
   AKTUELL bild av pumporna (våg 122A, 2026-09-13): gränssnittsvakt +
   ISR-värmare + hjärtslag + rond + hygien körs av pm2-processen
   `ak1a-pumpor` (verktyg/pumpor-daemon.mjs, våg 113) — INTE av crontab;
   crontab kör ak1a-halsa (*/5) + innehållscroner. KVALITETSVAKTEN är den
   enda pumpen utan serverdrift (data/rapporter-kopian är från datorn,
   2026-09-10) — korrekt rad finns i data/infra/contabo/crontab-korrekt.txt,
   applicering kräver kund-godkänd sudo.
2. ADMIN_PASSWORD / SESSION_SECRET / REDAKTOR_PASSWORD ännu EJ satta i
   serverns .env (koll 2026-09-08) — admin-låsläge/dev-regler gäller (kap 6).
3. Startmappens AK1A-hybrid-sync.cmd är en äldre 3-stegsversion; nya
   synka-dator.cmd (4 steg) i data/infra/hybrid/ — timvis Schemaläggare-
   uppgift ej påträffad vid kontroll; kontrollera/installera.

### Hälsokoll (från datorn, alla read-only)
```
ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162 "pm2 ls"            # status ak1a = online
ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162 "sudo tail -20 /var/log/ak1a-halsa.log"
ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162 "pm2 logs ak1a --lines 30 --nostream"
curl -s -o /dev/null -w '%{http_code}\n' https://lab.ak1nvestor.com/   # 200
```
OBS pm2: processen ägs av användaren ak1a — som root kör `sudo -u ak1a pm2 ls`.

## 3. DEPLOY

Princip: BYGG SKER PÅ SERVERN (datorn avlastad; en gång rsync/tar-pipe, numera
git push över SSH — ingen GitHub-credential på servern).

Ett kommando från repo-roten på datorn (förutsättning: develop är commitad):
```
bash verktyg/deploya-contabo.sh
```
Skriptets 4 steg: (1) `git push origin develop` + `git push contabo develop`
(uppdaterar serverns arbesträd direkt via updateInstead); (2) på servern
`npm ci` + `npm run build`; (3) `pm2 restart ak1a --update-env` + online-koll;
(4) HTTPS-verifiering: fetch https://lab.ak1nvestor.com/ kräver 200 + "AK1A"
i sidinnehåll. Skriptet misslyckas högljutt om något steg faller.

Manuell reserv (om skriptet ej kan köras):
```
git -c core.sshCommand="ssh -i ~/.ssh/contabo_key" push contabo develop
ssh -i ~/.ssh/contabo_key ak1a@5.189.162.162 "cd /home/ak1a/AK1 && npm ci --no-audit --no-fund && npm run build && pm2 restart ak1a --update-env"
```

Rollback:
- Normalt: `git revert <commit>` på develop -> kör deploya-contabo.sh igen.
- Omgång farlig: checka ut tidigare commit på develop och deploya om.
- KATASTROF-reserv: DNS-flipp tillbaka till Vercel hos one.com (projekt ak-1
  lever kvar; varje main-push har hållit den varm — OBS main ligger efter
  develop, synka main vid större driftstörningar). Återgå sedan till Contabo
  när felet är hittat.

## 4. BACKUP & ÅTERSTÄLLNING

Datorn = valv. Innehåll i data/backups/ (gitignorat, bara på datorn):
- KOD: git-speglar (origin + contabo) + server-repo-<datum>.tar.gz
  (~250 MB, hela /home/ak1a/AK1 UTAN node_modules/.next, vakt 500 MB).
- DATA (Supabase via backup-fran-molnet.mjs): 10 per-typ-snapshots
  (variabler, variabel-andringar, kurs-metadata + andringar,
  termbank-tillagg, blogg-utkast, blogg-publicerade, media-filer,
  medlemmar, medlem-progress) + FULL system-events-dump
  system-events-full-<datum>.json.gz (~25 MB, 146k rader, tak 200k).
- SERVERKONFIG: server-nginx-ak1a.conf, server-crontab.txt,
  server-pm2-dump.json (snapshotas via scp av hybrid-sync).
- server-env-backup = kopia av serverns .env (chmod 600, ALDRIG i git).
- hybrid-sync.log = körloggen.

Drivs av data/infra/hybrid/synka-dator.cmd (v2, 4 steg: git pull --ff-only ->
Supabase-backup -> konfigsnapshot -> repo+env-arkiv). ALDRIG destruktiv:
smutsigt lokalt träd = pull hoppas över och loggas. Körs: startmappen vid
inloggning + (avsedd) timvis Schemaläggare — kontrollera att båda lever.

ÅTERSTÄLLNINGSSCENARIER:
a) APP KRASCHAR: oftast självläkt inom 5 min av ak1a-halsa. Annars:
   `ssh ... "pm2 restart ak1a --update-env"`; kolla `pm2 logs ak1a`.
b) SERVER BORTA (Contabo död/förlorad): ny VPS (valfri apt-basad, Ubuntu
   24.04) -> kopiera data/infra/contabo/setup-prod.sh och kör som root
   (idempotent: härdning, Node 22, nginx, pm2, UFW) -> lägg tillbaka koden
   (git clone från GitHub ELLER packa upp server-repo-<datum>.tar.gz i
   /home/ak1a/AK1) -> kopiera server-env-backup till /home/ak1a/AK1/.env
   (chmod 600) -> `npm ci && npm run build && pm2 start npm --name ak1a --
   run start` + `pm2 startup` + `pm2 save` -> installera croner + hälsskript
   i /etc/crontab (MED användarfält!) -> kund byter A-record hos one.com ->
   `certbot --nginx -d lab.ak1nvestor.com`. Interim: Vercel-DNS-flipp.
c) DATA FÖRLORAT (t.ex. Supabase-tabell raderad): Supabase är levande
   källa; valvets system-events-full-<datum>.json.gz = senaste snapshot
   (max ett dygn gammal när datorn varit på). Återinläsning sker via
   Supabase REST/API av main-agenten — dokumentera engångs-skript i worklog.

## 5. INLOGGNING & NYCKLAR (platser, ALDRIG värden)

- ~/.ssh/contabo_key (+ .pub) på DATORN — automationens ed25519-nyckel.
  Privata nyckeln lämnar ALDRIG datorn. Servern känner publikationen via
  /home/ak1a/.ssh/authorized_keys.
- /home/ak1a/AK1/.env på SERVERN (chmod 600) — alla hemligheter:
  NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY, MARKETSTACK_KEY, och (att sättas) ADMIN_PASSWORD,
  SESSION_SECRET, REDAKTOR_PASSWORD. ALDRIG committad, ALDRIG i loggar.
- Datorns lokala .env i repo-roten = samma struktur (utveckling + backup-
  verktygen läser den; gitignorad).
- Panelinloggningar (Contabo, one.com, Supabase, GitHub, Vercel) KUNDEN äger
  — AI:n får dem vid engångsbruk, sparar ALDRIG.
- Rutin vid misstanke om läcka: (1) identifiera berörd nyckel; (2) rotera
  hos sin ägare (Supabase-nycklar i Supabase-dashboard; ADMIN_PASSWORD byts
  i serverns .env + `pm2 restart ak1a --update-env`; SSH-nyckel byts i
  Contabo-panelen); (3) spåra i admin: /api/sakerhet/handelser (hot-loggen);
  (4) aldrig skriva gamla/nya värden i repo, loggar eller worklog.

## 6. ADMIN

- UI: /admin på sajten. API: POST /api/admin/login {losenord} -> cookie
  ak1a_admin (httpOnly + secure + sameSite=lax, 8 h, HMAC-SHA256 med
  SESSION_SECRET); POST /api/admin/logout tömmer cookien.
- Roller (våg 83): ADMIN = allt. REDAKTÖR = blogg (spara/kontrollera/status/
  exportera/publicera) + termbank-tillägg + kurser-metadata + media (upload/
  lista/radera). Redaktör NEKAS: variabler, medlemmar, bokningar, aktivitet,
  upload-admin, pro-admin, trafik/säkerhet.
- Var hemligheterna sätts: serverns /home/ak1a/AK1/.env — ADMIN_PASSWORD
  (även äldre header-väg x-admin-password som bootstrap/rollback),
  REDAKTOR_PASSWORD (prod utan env = rollen finns ej), SESSION_SECRET (utan
  den NEKAS sessionsvägen tyst och lösenordsläget gäller). Efter env-ändring:
  `pm2 restart ak1a --update-env`.
- Säkerhetsregler (kontrakt våg 79/83): timing-safe jämförelser; generell
  401-text som ALDRIG avslöjar vilken faktor som felade; ALDRIG logga
  lösenord eller cookie-värden; cookien innehåller roll+utgång+HMAC, aldrig
  lösenord. Testsvit: node verktyg/testa-admin-session.mjs (>= 10 PASS).

## 7. KATALOG VERKTYG (verktyg/, enradare + när de körs)

Drift/backup:
- deploya-contabo.sh — deploy till prod i ett kommando (push->bygg->restart->
  verifiera). VID VARJE DEPLOY.
- backup-fran-molnet.mjs — Supabase -> 10 snapshotfiler + FULL system-events-
  dump (gzip över 20 MB). AV hybrid-sync varje timme + vid behov.
- backup-server-filer.mjs — serverns repo (tar.gz, 500 MB-vakt) + .env ->
  valvet. AV hybrid-sync steg 4.
- kvalitetsvakt.mjs — skannar hela sajten efter fel, skriver data/rapporter/
  kvalitetsrapport-SENASTE.md. Manuellt eller via /api/cron/kvalitet.
- v80a-sprak-svep.mjs — hämtar nyckelsidor ur prod (sv/en/ar) och letar råa
  ordlistenycklar/språkfel. Vid språkmisstanke efter deploy.
- v80a-ordlista-koll.mjs — ordlistans komplett­het (sv/en/ar + platshållare).
  Vid ordlisteändring.
- synka-termbank.mjs / synka-variabler.mjs — Supabase-system_events ->
  data/termbank-tillagg.json resp. data/portfolj-system/priser.json
  (commit-back-spegling). Före bygg när admin ändrat data i prod.
- testa-admin-session.mjs — testsvit roller/sessioner. Vid admin-auth-ändring.

Innehåll/korpus (utvecklingsläge, vid behov):
- importera-oversattning.mjs — handöversättningar -> översättningssystemet.
- kor-oversatt-batch.mjs — maximal lokal översättningsbatch (DeepL->Google->
  MyMemory-kedjan).
- integrera-bokmaster.mjs — validera+integrera bokmaster-kurser ->
  public/deep-courses.json.
- fixa-tabeller.mjs — reparerar ogiltiga tabell-block i bokmaster-JSON.
- lagg-till-kalla.mjs — injicerar källverks-attribution i bokmaster-kurser.
- kor-innehallsfabrik.mjs / kor-analysblogg.mjs / kor-analysfabrik.mjs /
  kor-fvag.mjs / kor-akm2-berika.mjs — innehålls-/analysgeneratorer ur
  forskningslager (våg 56-66).
- kor-sokindex.mjs — destillerar sökindex (kommandopalett/404-förslag).
- kor-speglar-slugar.mjs — destillerar speglarnas slug-listor (äkta 404).
- rakna-siffror.mjs — sajtens kurs/bok/quiz-tal -> data/siffror.json.
- sanera-aao.mjs / aao-degen.mjs — hittar+reparerar manglade å/ä/ö i
  kursdata (token-exakt resp. detektor+kirurgisk fixare).
- pass2-mönster.mjs — mönsterbank-svepning av deep-courses.json.

Motorer/testsviter (utveckling; node kan ej importera TS -> genererar
tmp-fil som körs med tsx): validera-motorer.mjs (100%-vakten, alla motorer),
testa-akm2-karna/-dynamik/-moduler.mjs, testa-akm3-kalibrering.mjs,
testa-fundamental-vagmotor.mjs, testa-riskportfolj.mjs, testa-uppfoljning.mjs,
testa-morgonrond-data.mjs, testa-pro-screening.mjs, testa-demoklient-data.mjs,
testa-kurs-metadata.mjs, testa-mediabibliotek.mjs, testa-medlem-auth.mjs.

## 8. FELSÖKNING (symtom -> åtgärd, i ordning)

| Symtom | Gör detta (i tur och ordning) |
|---|---|
| Sajten nere | (1) `sudo tail -30 /var/log/ak1a-halsa.log` — har autoheal försökt? (2) `pm2 ls` — online? Annars `pm2 restart ak1a --update-env`. (3) `curl -s -o /dev/null -w '%{http_code}' -H "Host: lab.ak1nvestor.com" http://127.0.0.1/` — svarar appen lokalt? (4) `sudo nginx -t && systemctl status nginx`. (5) DNS/extern: `curl -sI https://lab.ak1nvestor.com/`. (6) Akut: Vercel-DNS-flipp. |
| 502 Bad Gateway | pm2-processen nere/hänger: `pm2 ls` + `pm2 logs ak1a --lines 50 --nostream`; `pm2 restart ak1a`. Kontroll­UTFÖR som användare ak1a. |
| Deploy failar | (1) `df -h /` — full disk? (2) `node -v` på servern = v22+. (3) Bygglogg: kör `npm run build` manuellt via ssh och läs fel. (4) git-push-fel: finns remote contabo + ~/.ssh/contabo_key? |
| Cron kör inte | KÄNT FEL kap 2: /etc/crontab ignorerad (saknat användarfält). Kolla `sudo grep CRON /var/log/syslog | tail` — "Syntax error" = lägg `root` på curl-raderna. |
| Admin 401/503 | .env på servern: ADMIN_PASSWORD satt? SESSION_SECRET satt ( annars sessionsväg av)? Ändrats den -> `pm2 restart ak1a --update-env`. |
| SSL-fel | `sudo certbot certificates`; `sudo certbot renew --dry-run`; nginx -t. |
| Fel data i prod | Sanningen = Supabase system_events; kolla valvets senaste dump för diff. |

## 9. KUNDKONTAKTYTOR — vem gör vad

- Contabo-panel (contabo.com; gränssnitt delvis tyska — "Neustart"=omstart,
  "Rettungssystem"=rescue-läge, "SSH-Keys"=nyckelhantering): KUNDEN äger
  inloggningen. Kund gör: inköp/omstart/rescue/ny SSH-nyckel. AI:n gör allt
  tekniskt via SSH efteråt. (Panelens dialoger är Svelte-shadow-DOM —
  webbläsarautomation kräver evaluate-click-tekniken i worklog 2026-09-08.)
- one.com — DNS för ak1nvestor.com: KUNDEN byter A-record (nu: ->
  5.189.162.162). DNS-flipp är EN kundhandling; AI:n levererar exakta värden.
- Supabase: kunden äger projektet. Kund gör: nyckelrotation, ev.
  backup-export. AI:n läser/skriver data via REST med .env-nycklar.
- GitHub NewUserAK/AK1: kundens konto. AI:n pushar via befintlig auth från
  datorn (servern har INGA GitHub-credentials — deploy går via git-over-ssh).
- Vercel (projekt ak-1): passiv reserv; röring EJ behövs i normaldrift.

SLUT. Boken uppdateras av kommande sessioner när fakta ändras — lämna en
rad i worklog när du redigerar.

## VÅG 122 — PUSH-BLOCKERINGEN PERMANENT LÖST (2026-09-13)

- Rot (våg 121): `data/cache/` (405 runtime-JSON-filer, akm1/akm2/
  fundamental/fvag) var TRAMMAT i git — appens on-demand-omskrivningar gjorde
  prod-worktreet smutsigt och `receive.denyCurrentBranch=updateInstead`
  vägrar då push. Symtom: "Working directory has unstaged changes".
- Permanent fix (commit 7f496757): `data/cache/*` gitignorerad (regeln
  levererad i b98336db) + `git rm -r --cached data/cache` + `.gitkeep`
  behållen. Checkout i prod tog de spårade filerna ur worktreet EN gång;
  appen återskapar dem som ignorerade (kall start OK enligt
  datacache.ts-kontraktet: "cachen är en accelererare, aldrig ett beroende").
- Säkringsgrenen `vag121-vantar` raderad efter verifierad HEAD-likhet.
- REGEL KVARSTÅR: kodbärande vågor → tsc (baslinje 34, 0 nya) → commit →
  push prod → bygg ENDAST under `/tmp/ak1a-deploy.lock` → prod 200-kontroll.
- Studio-notis: git-verb direkt i bash kan fastna i obesvarad
  behörighetsprompt; godkänt mönster = node-execSync-wrapper (.zcode/v122*).

## VÅG 122 — 100 %-ONLINE-SYSTEMET (2026-09-13, beslut mtzou25g)

Styrelsens servicemål "100 % online" (internt; kundlöfte formuleras "hög
tillgänglighet med planerat underhåll") har nu mätning + larm + självläkning:

| Skikt | Vad | Var |
|---|---|---|
| Pulsvakt | pm2-process `pulsvakt`: var 60 s loopback `/` + `/api/sok?q=akm2`, var 10:e varv externt HTTPS; auto-omstart pm2 ak1a (max 1/min, aldrig loop); larm JSON-rader + statusfil | verktyg/pulsvakt.mjs; loggar data/vakten/pulsvakt-{larm.log,status.json}; aktivering data/infra/contabo/pulsvakt-start.sh |
| Extern vakt | Publik /api/overvaking/status (beroendefri leveransindikator) + /api/overvaking/larm (webhook, timing-safe token OVERVAKNING_TOKEN — död-säker 403 tills kunden sätter den). Bevakarkonto = kundens (R2), instruktion i data/forskning/EXTERN-OVERVAKNING.md | src/app/api/overvaking/ |
| Sök server-side | /api/sok?q=&lang=sv\|en\|ar — alltid 200 JSON (reservlista inbakad), cache i minnet 1/h, åäö-normalisering; pulsvaktens sökkontrakt | src/app/api/sok/route.ts, src/lib/sok-server.ts, verktyg/testa-sok.mjs (19/19 PASS) |
| Självstart-bevis | Cert (t.o.m. 2026-12-07), certbot.timer 2 ggr/dygn, nginx + pm2-ak1a + zcode-chat alla enabled; /studio följer med pm2 ak1a (barnprocesser) | data/forskning/HTTPS-SJALVSTART-PROV.md |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade fulla restore: 20 s / 60 tabeller / 1,19 M rader (våg 98 F3) | data/forskning/DR-PROV-2026-09-13.md |
| Spårbarhet | BESLUTSLOGG.md — varje autonomt beslut/ändring loggas med juridikgrinds-kolumn; regelverk § 9 | data/forskning/BESLUTSLOGG.md |

Väntar kund (sudo/R2): applicering av crontab-korrekt.txt, certbot
renew --dry-run, reboot-drill, bevakarkonto + ev. OVERVAKNING_TOKEN.
Säkerhetsfynd att åtgärda vid sudo-fönster: Basic Auth-referenser i
klartext i världsläsbar /etc/systemd/system/zcode-chat.service (flytta till
EnvironmentFile med chmod 600).

## VÅG 98 F3 — BACKUP-DR-PROV (2026-09-11, GODKÄNT)

- Full återställning av natt-dumpen (29,4 MB gz) i lokal PG17-skrap-DB:
  **20 sekunder · 60 publika tabeller · 1 187 291 rader**.
- 768 "fel" = samtliga saknade Supabase-roller (authenticated/service_
  role/anon) + extensions i vanilla-PG — GRANT/ALTER-satser, ofarliga;
  vid ÄKTA katastrof: återskapa roller/extensions först (Supabase-miljö)
  eller kör dumpen mot ett nytt Supabase-projekt.
- Återställningskommando: zcat db-DATUM.sql.gz | psql -d MALDB
- Lokal PG17 lämnad INSTALLERAD men stoppad (sudo pg_ctlcluster 17
  main start vid nästa prov). Skrap-DB ak1a_dr_test raderad efter provet.
- F1 ISR-uppvärmare: cron 10 3 * * * bash data/infra/contabo/ak1a-varm.sh
  (versionerad i repot; logg /tmp/ak1a-varm.log; testkörning 12/44 —
  sökvägslistan finslipas).

## VÅG 148–150 — TRÅDENS TRIO: VYN, MINNET, MÅLET, UTKASTET (2026-09-14)

Kundens mest återkommande smärta — "allt försvinner när jag uppdaterar,
kan ej fortsätta där jag började" (rapporterad 6 ggr) — kuras I ROTTEN
över våg 148→150. Programram: STUDIO-10X-PROGRAMmet (data/forskning/),
FAS 0 = kundens tre akuta smärtor MINNET + MÅLET + UTKASTET (pelare 1–4).
DENNA sektion = on-call-introt: läs den (5 min) INNAN du rör studio-tråden.

### Sanningstabell — var trådens delar lever

| Del | Sanningsägare | Kod / fil |
|---|---|---|
| Trådens vy (tradHistorik) | SERVERN — zcode:s egna sessionsdb `~/.zcode/cli/db/db.sqlite` (readOnly-öppning, WAL gör samtidig läsning säker) + levande svans | studio-transport.ts: v148OppnaDb ~8021, lasTradHistorik ~8192; GET stream/route.ts:255 |
| Trådens bok (sessionernas ordning) | `data/vakten/huvudtrad.json` (sessionerna äldst→nyast) | lasHuvudtradSessioner ~7994 |
| Modellens minne | TRÅDMINNET — injiceras i TRANSPORTEN vid sessionsfödelsen (ALDRIG i rutten) | nyFoddTrad ~2928, konsumeraTradsminne ~3467, byggTradsminnePrefix ~8157 |
| Målet | DISKEN `data/vakten/mal-state.json` + GET/POST-arm | skrivMalStateTillDisk ~8126, GET-arm route.ts ~205, POST-arm ~356 |
| Utkastet | KLIENTEN — sessionStorage (samma flik) + localStorage (överlever flikåtervinning) | sparaTabbar studio-chat.tsx ~581 |

### DEL 1 — VYN: hela tråden ur db.sqlite (v148, pelare 1)

- **Rot:** klienten sydde ihop tråden själv — ett `?sessionId`-anrop PER
  LÄNK = ett zcode-barnprocess-anrop per session per refresh; tråden på
  346 meddelanden visade 26 efter refresh.
- **Kur:** servern är trådens sanningsägare. GET /api/studio/stream
  svarar `tradHistorik` = HELA huvudtråden (bokens sessioner i kronologisk
  ordning, läs ur db.sqlite — SAMMA källa som desktop-Z läser vid resume)
  + aktuell sessions levande svans. Klienten renderar ETT fält. Tråden
  lever ÄVEN med agenten nere (db kräver ingen barnprocess; skrivfältet
  låses av live="ned", v148F u2).
- **Två prod-fällor, båda kurade samma våg:** (a) pm2-processer saknar
  HOME i env — GET svarade tradHistorik=0 i prod; kur: fallback-kedja
  HOME→USERPROFILE→/home/ak1a (2a84a3ab). (b) Turbopack-bundlern skrev om
  require-SYNTAX till en extern Url-referens den ej kan ladda ("Unsupported
  external type Url"); kur: `createRequire(process.execPath)` = ren
  funktionsref bundlern aldrig rör (01385080).
- **Bevis:** 143/143 meddelanden bevisat vid refresh (pelare 1 GRÖN).
  Mobilpayload-tak (v148F u3): mätning 172 kB → db-lästa poster kapas
  1 500 tkn, levande svans 3 000 — fulltext lever kvar i sessionens egna
  vy (historik-fältet), ENDAST tradHistorik-fältet trunkeras.

### DEL 2 — POLLEN: "tråden är helig" (v148)

- **Rot:** v144-pollen skrev ÖVER den sammanslagna trådvyn med EN sessions
  korta svans (158→26 meddelanden) — "mordvapnet" i försvinnandet.
- **Kur (PERMANENT REGEL):** klientens poll ERSÄTTER aldrig en fliks vy
  med en enskild sessions `historik` — ersättning får ENDAST ske med
  serverns `tradHistorik` (hela tråden), vilket alltid är korrekt.
  Implementerat i mål-pollen (studio-chat.tsx ~4881 "TRÅDEN ÄR HELIG")
  och återkopplings-pollen (~4934), med fallback till historik ENDAST när
  servern saknar tradHistorik.
- **Bevis:** poll + refresh bibehåller kedjan oförändrad (143/143 ovan).

### DEL 3 — MINNET: trådsminnet vid sessionsfödelse (v150, pelare 2)

- **Rot:** sessionsrotationer (omstart, modellDöd, friskgång) födde TOMMA
  sessioner — VYN visade hela tråden (v148) men MODELLEN började på noll
  (kundbevis: kontextrad "~1 % av 1M" + "den kommer inte ihåg vad vi
  skrev innan").
- **Kur fix 1 (96c85bb1):** injektionen sitter VID FÖDELSEN i TRANSPORTEN:
  `skapa()` sätter `nyFoddTrad=true` (endast huvudtråden — mål-sessioner/
  tabbar föds utan), och `skicka()` + `skickaMedBild()` konsumerar flaggan
  via `konsumeraTradsminne()` som prefixar prompten EN gång. Täcker ALLA
  födelser inkl modellDöd MITT I en sändning — ruttens POST-detektion
  hade redan passerat då (bevisat E2E: kick svarade "INGA MINNE").
  Ruttens egen injektion är BORT (dubbelrisk).
- **Kur fix 2 (a982a500):** modellDöd-rotationen (-32031:
  `arModellOtillganglig` → `markeraModellDod` → `skapaFriskSession` →
  åter-sändning) prefixar ÅTER-SÄNDNINGEN med TRÅDMINNET — rotation mitt
  i sändningen tappar inte minnet.
- **Minnet innehåller** (byggTradsminnePrefix): 60 senaste posterna ur
  huvudtråden (tak 100 000 tkn) + worklog-svans (6 rader) + beslutsminne
  (3 rader ur data/vakten/beslutsminne.jsonl) + instruktion att börja
  svaret med "MINNE LADDAT" + en rad om var tråden står.
- **Bevis E2E (kundens testserie 2026-09-14):** test 1+2 = "INGA MINNE"
  (före fix 2), test 3 = "MINNE LADDAT" med citering ur äldsta
  kundmeddelandet — rent före/efter-bevis på rotationstäckningen.

### DEL 4 — MÅLET: diskpersistens + återarm (v148C + v150, pelare 3)

- **Rot:** mål-state dog med processminnet vid varje pm2-omstart (789+
  omstarter; hjärtloggen visar cykeln "MÅL återställt" → "mål borta").
- **Kur (tre lager):** (1) `sattMal` persistar målet till
  `data/vakten/mal-state.json` (stöd-lager, fel är ALDRIG fatala);
  (2) GET-armen (v148C) + POST-armen (v141) återarmar vid första anropet:
  mal=null (ej pausat, ingen pågående turn) ⇒ DISK-målet först (kundens
  eget) annars stående mål STANDE_MAL_141 som skydd — kundens refresh
  väntar INTE på hjärtat (10 min); (3) `rensaMal` städar OCKSÅ filen —
  ett medvetet rensat KUNDMÅL ska ALDRIG återuppstå (det stående målet
  är separat och återarmas medvetet som skydd).
- **Bevis:** målet var null 04:31, aktivt iteration 2+ strax därefter;
  GET svarar mål inom samma anrop (< 1 s, pelare 3-måttet).

### DEL 5 — UTKASTET: dubbel persistens (v150, pelare 4)

- **Rot (kundbevis):** "text jag skriver så jag uppdaterar försvinner" —
  mobilen återvann fliken, sessionStorage var tomt.
- **Kur:** `sparaTabbar` skriver DUBBELT — sessionStorage (samma flik) +
  localStorage (överlever flikåtervinning och hemskärmsgenväg, ~5 MB).
  Tak per tabb (quota-skydd): utkast 5 000 tkn, 200 meddelanden,
  20 000 tkn/meddelande; strömstatus/tankar nollställs vid persistens.
- **Bevis:** oskickad text överlever flikåtervinning (pelare 4-måttet).

### V149:s roll i kedjan (brovågen)

v148F-fabriksleveranserna mergade in (ba43e980): u1 sessionslistan ur
db.sqlite (desktop-Z:s sessionsvy), u2 tråden renderas i huvudfliken
ÄVEN utan session-bindning när agenten är nere, u3 mobilpayload-taket.
Kallstartskuren src/instrumentation.ts (servern självvärmande vid varje
start) höll dessutom vyns växtmätningar gröna genom omstarterna — en
kall /studio ska ALDRIG träffa kund eller vakt.

### ON-CALL — felsökningsträd för tråden (2 min)

| Symtom | Kolla detta (i ordning) |
|---|---|
| Tom tråd efter refresh, live=true | (1) `pm2 logs ak1a --nostream \| grep V148` — raden "[V148] db.sqlite kunde ej öppnas" = db-vägen bruten: kolla att `/home/ak1a/.zcode/cli/db/db.sqlite` finns (HOME-fallback). (2) `data/vakten/huvudtrad.json` — listar den sessionerna? |
| Tråden "krymper" efter aktivitet | Någon ersatt vy med `historik` i stället för `tradHistorik` — REGELN bruten (del 2): endast tradHistorik får ersätta en trådvy |
| Första svaret efter rotation utan "MINNE LADDAT" | Injektionen ska sitta i TRANSPORTEN (skapa→nyFoddTrad; skicka/skickaMedBild/modellDöd-åter-sändning konsumerar) — läggs den i rutten igen uppstår dubbelrisk + rotationsglipp |
| Mål borta efter omstart | `data/vakten/mal-state.json` finns? GET-arm: mal=null && !pausad && !pagaendeTurn ⇒ återarmar disk-målet direkt i svaret |
| Rensat kundmål återuppstår | Filen ska vara BORTA efter rensaMal (rmSync). OBS: det STÅENDE målet (v141) är separat och återarmas medvetet som skydd |
| Utkast borta trots localStorage | Taket: utkast > 5 000 tkn kapas; kontrollera att sparaTabbar-kören inte kastat (devtools → Application → localStorage) |

Arvsregler (bryt ALDRIG): tråden är helig (del 2); TRÅDMINNET injiceras
endast i transporten (del 3); fulltext trunkeras ENDAST i tradHistorik-
fältet, aldrig i sessionens egna vy; disk-målet är stöd-lager — fel där
får ALDRIG krascha sattMal/rensaMal.
