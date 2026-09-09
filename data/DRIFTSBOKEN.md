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
1. **KÄNT FEL — /etc/crontab ignoreras HELT av cron.** De tre curl-raderna
   saknar användarfält; cron svarar "bad username / Syntax error, this
   crontab file will be ignored" (syns i /var/log/syslog). Konsekvens: INGA
   av ovanstående rader körs — varken innehållscroner eller ak1a-halsa
   (hälso-loggens rader vid 21:57 var manuella testkörningar).
   Åtgärd (en rad per cron-rad, lägg `root` efter de fem tidsfälten):
   `30 6 * * * root curl -s -m 300 -H "Host: lab.ak1nvestor.com" ...`
   Verifiera efteråt: `sudo grep CRON /var/log/syslog | tail`.
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
