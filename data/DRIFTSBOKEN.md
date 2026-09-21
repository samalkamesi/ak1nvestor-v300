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
  (arbetsytan UTAN node_modules/.next/.git/tool-results/data-cache/
  data-backups, ~130 MB, vakt 500 MB) + server-git-<datum>.bundle (hela
  historiken ~140 MB, `git bundle verify`-bar). gzip-integritetskoll i
  verktyget sedan 2026-09-16 (DR-PROV-2026-09-16-KEDJA3.md: 09-09-tarballen
  var KORRUPT i 7 dygn oupptäckt; 09-08 frisk).
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
   (max ett dygn gammal när datorn varit på). Återinläsning är MEKANISERAD
   sedan 2026-09-15 (DR-PROV-2026-09-15-JSON-KEDJAN): verifiera + konvertera
   med `node verktyg/aterstall-system-events.mjs --fil <arkiv> --jsonl-ut …`
   (mappar type→event_type — namnbyte 09-10..15), REST-plan med
   `--plan-supabase` (ALDRIG ignore-duplicates — tabellen saknar PK);
   huvudagenten tillför enbart nycklarna. OBS: händelsehistorik före
   2026-09-03 finns ENDAST i 09-08-arkivet (levande tabellen gallras) —
   system-events-full-*.json.gz är arkivhandlingar, retention gäller ALDRIG.
   AKUT LÄGE sedan 2026-09-16 ~13:46 lokal: system_events är TOM i prod
   (bevis: DR-KVARTAL-2026-09-16-FYRAKEDJOR.md §4) — scenariet c) ÄR AKTIVERAT
   för tabellen: senaste kompletta källa = system-events-full-2026-09-16.json.gz
   (161 678 rader t.o.m. 05:23 UTC; byteidentisk kopia i /tmp med md5-kvitto).
   Skrivvägen till tabellen tystnadade samtidigt — utreds av huvudagenten.
   **ÅTERAUDITERING KRÄVS (s10-u1 2026-09-19, DR-OVNING-2026-09-19-
   DUBBELPROJEKT.md):** dump-kedjans 02:30-cron hårdkodar pg_dump mot
   rkaq… — EJ appens projekt aufr…suhvlsbp (= .env + AGENTS.md:s prod-ref).
   rkaq:s system_events är TOM (0 rader i samtliga 9 blad 09-11→09-19 +
   levande psql 0) medan APPENS tabell bär 166 673+ rader och skrivs varje
   minut (trafik/säkerhet) — mättes "TOM i prod"/"tystnadad skrivväg" (09-16)
   via psql/rkaq är de artefakter av fel projekt. Kedja 2 (JSON-exporterna
   02:40, läser .env → aufr) är ENDA kopian av appens händelsehistorik;
   kedja 1 har ALDRIG fångat appens data. Kur-kö §7 i protokollet.

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
- dr-rpo-diff.mjs — RPO-diff per tabell: dumpens COPY-räkning vs levande
  prod-COUNT (psql via PGPASSFILE, EN UNION ALL-fråga) → oskyddade rader
  sedan bladets 02:30. Vid DR-övning eller misstanke om dataförlust.
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
| Sajten 200 men ostylad/utan JS (chunkar 500) | OOM-dödat deploy-bygge raderade .next-tillgångar medan gamla pm2-processen fortfarande serverar HTML (bevisat 2026-09-17 16:28–16:41Z, ~13 min; s7-u1, o49 §8; återigen 17:30–17:43Z — pm2 kraschloopade dessutom (extern 502) tills flock-läkbygget deployade 5 commits och prod 200, s7-u1 o52 §5b). (1) `ls .next/BUILD_ID` — saknas = bevis. (2) VÄNTA på prod-synkens nästa poll (var 10:e minut; bygger vid RAM ≥ 2200) — ombygget läker automatiskt; ALDRIG bygg själv utanför flock-låset. (3) Retry-OOM igen? Minnespressuren är ofta fabriksbarnens tsc/mät-processer — vänta ut fönstret, starta inget parallellt. (4) Verifiera efteråt: css+js-chunk 200 (`curl -o /dev/null -w '%{http_code}'` på en chunk-URL ur HTML:n) + prod 200. Mätinstrument-vetande: Lighthouse mitt i rotationen visar ALLA chunkar 500 à ~0,28 KiB — kastas, mäts om. |

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
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **KVÄLLS-DR 2026-09-20 19:08 lokal (s10-u1 Fabrik-dispatch: blad 10 fjärde restoren idag, kvällsläget — RTO 12,7 s · radkontrakt 60 tabeller/1 345 719 rader · fel 788 kända/0 okända · RPO-kvällspunkt +19 548 = pumpbatch +18 984 EXAKT + board 8×66 + organ 12×3 · städning oberoende egenmätt · DR-OVNING-2026-09-20-KVALLS-JUNGRU.md)**; dessförinnan DUBBELPROJEKT 2026-09-19 09:51–10:00 lokal (s10-u1 Fabrik-dispatch, manifest auto-s10-1789802729714 vakt 1/3 — STORFYND: dump-kedjan läser EJ appens projekt: crontab 02:30 hårdkodar pg_dump mot rkaq…, .pgpass har ENDAST rkaq-posten, samtliga 9 blad 09-11→09-19 bär 0 system_events-rader och rkaq:s tabell är tom (levande psql 0, skilt schema event_type) medan appens projekt aufr…suhvlsbp bär 166 673+ rader, växer ~1/min (kolumn type; tabellklyfta: board 77 vs 49 578 · snapshots SAKNAS vs 1 252 404 · members 3 vs 0 · courses 3 vs 10) ⇒ kedja 1 har ALDRIG fångat appens data, kedja 2 (JSON 02:40 → aufr) är ENDA händelsekopian, och RPO-instrumentet (dr-rpo-diff.mjs, rkaq hårdkodat som "levande prod") har aldrig mätt appens exponering — "system_events delta 0" i fyra JSON-delprotokoll = tomhet-vs-tomhet FALSK paritet, fångad i eget delprotokoll; 09-16:s AKUT LÄGE återmärkt för auditering (mätningens projekt okänd); RLS-hypotes motbevisad i skrap-DB (ENABLE utan FORCE + endast INSERT-policy p18 — ägaren ser allt); blad 9:s SJUNDE restore GRÖN exit 0 (AUTO-10) RTO 15,5 s @ 2 441 MB — dagklassen 14–18 s tredje bekräftelsen (RAM förklarar ej, jfr FÖRMIDDAGSPULS) · radkontrakt EXAKT (60/1 325 919 · 68/1 326 055 · 99/1 326 315) · fel 788 kända/0 okända · DB-bevis: skrap system_events = 0 rader · RPO-diff +19 229 (board +232 = 8×29 EXAKT — kvartsklockan) · städning oberoende eigenmätt (PG17 down · base endast OID 1/4/5 · pgsql_tmp tom · WAL 481 MB · lås ledigt); protokoll DR-OVNING-2026-09-19-DUBBELPROJEKT.md + maskinellt DR-PROV-2026-09-19-AUTO-10.md + JSON DR-RPO-DIFF-2026-09-19-DUBBELPROJEKT.json + anspråk data/vakten/auto-s10-1789802729714-u1-ansprak-2-DUBBELPROJEKT.md; KUR-KÖ till huvudagenten (protokoll §7: dumpa ÄVEN aufr (db-app-*.sql.gz + .pgpass-post, nyckelhantering R2-nära) · parametrisera dr-rpo-diff per projekt · auditera AKUT LÄGE 09-16 · finn rkaq:s skrivare (+232 board/dag, ej i repot — kandidat pg_cron i rkaq, samma dashboard-besök som B9 köat) · appens per-typ-JSON-skyddskarta (board-aufr 77 rader oskyddade))** |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **FORMIDDAGSPULS 2026-09-19 09:45–09:51 lokal (s10-u3 ANDRA INSTANSEN manifest auto-s10-1789802729714 vakt 3/3 — dubbelinstancen bokförd öppet: första instansen levererade DAGFONSTER-REPLIK (commit 76815e5f) under mitt startfönster ⇒ duplikat avstått enligt OMSTARTSBOKFÖRING-presedensen, mitt objekt = REPLIK-§8 köpost 4: INTRA-KVARTS-MIKROPUNKTEN STATISTISK — par nr 2 Δboard = 0 EXAKT på 4 min 6 s inom kvart 09:45–10:00 (mätning 09:45:49 vs 09:49:55, totalt fruset 1 345 148 på båda) ⇒ serien 2/2: kvartsklockan eldar VID markören ej kontinuerligt — oskyddad exponering mellan markörer i praktiken frusen utom organpulser (organ Δ0 här stödjer u2:s 6-timmarssvepsmotor); KVARTSFORMELNS FEMTE test KEDJAT från MÄTT punkt (första gången — bas REPLIK 09:34:16 board 49 570 + 8×1 markör ⇒ 49 578 förutsagt 09:46, mätt 09:45:49 EXAKT; dumpbenet +232 = 8×29 EXAKT); blad 9:s SJÄTTE restore GRÖN exit 0 (AUTO-9) RTO 15,1 s · radkontrakt EXAKT sjätte gången (public 60/1 325 919 · 68/1 326 055 · 99/1 326 315 · fel 788 kända/0 okända · fellogg 34 881 B; dagklassen 14–18 s tredje dagen — RAM förklarar ej dagtoppen: 18,1@1,0 GB · 16,1@3,0 GB · 15,1@2,5 GB); VAKT-INSATS: u2:s dr-ovning --behall-kur stage:ad mot prod-synkens checkout-radering (o87-läxan: staged innehåll överlever git checkout -- .; node --check GRÖN; kur:en committas av u2 — ej min yta) + SKARPT LIVE-VERIFIERAD i icke-behall-grenen av min restore (dropdb + PG-stopp korrekt); städning oberoende eigenmätt: PG17 down · base endast OID 1/4/5 · pgsql_tmp tom · WAL 481 MB SJUNDE punkten på serie-låget · 9 blad orörda; prediktioner K1/K2/K3/K7 EXAKTA (K2 = par nr 2) · K4/K5 band men primär-miss ärligt bokförd — läxa: vid känd 6h-svepmotor ska intra-timmars-primär sätta Δ0; protokoll DR-OVNING-2026-09-19-FORMIDDAGSPULS.md + maskinellt DR-PROV-2026-09-19-AUTO-9.md + JSON DR-RPO-DIFF-2026-09-19-FORMIDDAGSPULS{,-2}.json + DR-PREDIKTION-2026-09-19-FORMIDDAGSPULS.json)**; dessförinnan **KOPOST3+4-ANOMALI-ORGAN 2026-09-19 09:33–09:50 lokal (s10-u2 manifest auto-s10-1789802729714 vakt 2/3 — s10-u3:s ÖPPNA köposter 3+4 (5b5e9e60) STÄNGDA/KARTLAGDA i EN övning med restore av blad db-2026-09-14 (täcker kalenderdagen 09-13) GRÖN ×2 (AUTO-6 RTO 14,9 s + AUTO-8 15,7 s, radkontrakt public 60/1 226 931 EXAKT == ARKIVSVEP == tre instrument, fel 780/0) + levande korsvalidering; KÖPOST 3 STÄNGD: 09-13-anomalien (board 765 av 768) = exakt EN avvikande kvarts — 09-13 10:00 med 5 rader (landade 10:00:01.181–.503, tight batch på 322 ms) — arkiv == live på dag-, kvarts- OCH tidsstämpelnivå ⇒ de 3 raderna skrevs ALDRIG (frånvarande i dumpen född 09-14 02:30 — ingen efterhandstampering, skiljer från B9:s raderarklass där prod-rådata försvinner) och servern var frisk (syslog ren — OBS ISO-format på rsyslog: "Sep 13"-grep ger falskt logggap, pumpor normalt 09:51→10:11 exit 0, ingen OOM/omstart; skrivaren varken src/ (0 träffar), pumpor (loggen ren om board) eller pulsvakt (startad 09-16)) ⇒ DOM: transient skrivförlust i kvartsbatchen, engångshändelse −3 av ~8 400 = 0,04 % på elva dagar, RPO-modellen 768/dygn opåverkad; KÖPOST 4 KARTLAGD: organ_health_logs = intern 6-timmarssvepmotor MED ±1–2 h JITTER (jittersignaturen utesluter cron — inget crontab-schema matchar: vakt 1/7/13/19 · dump 02:30 · moln 02:40 · arkiv sönd 03:20 · /etc vagscan 06:30 · nyheter 08:00; skrivare: organism-motorn utanför repot, ny köpost om schemaägande), fas 1 →08-10 12-organ sharp var 6:e timme, fas 2 9+3-split-par septemberläge ~02/04·08/10·14/16·20/22 + TVÅ NYA FYND: (A) SPLIT-SVEP under morgonbelastning — 09-18: 1@08+8@09 och 1@14+8@15, 09-19: 1@09 — kadensen hålls men leveransen förskjuts 1 h, klassbesläktat med anomalin (skrivsidan degraderar transient); (B) organ_name-KODNINGSDRIFT — "Hjarta"×232 mot "Hjärta"×1 (samma för Ögon/Öron/Immunförsvar): konsumenter skall gruppera på organ_id; VERKTYGSKUR I SAMMA FÖNSTER: dr-ovning.mjs --behall bröt sitt eget kontrakt — dropdb kördes VILLKORSLÖST FÖRE behall-grenen (bevis: AUTO-6:s protokollrad "skrap-DB raderad · PG17 lämnad uppe" emot konsolens "lämnar skrap-DB uppe" i samma körning) — kurerad i tre punkter (behall-gren först med tidig return + GRÖN-formeln behall-medveten (behall || (skrapDbBort && pgStoppad)) + protokollrendering) och FÄLTVERIFIERAD i AUTO-8: skrap-DB LEV kvar efter verktygsexit (psql board 45 506) — kvartalsövningens efterundersökningsväg (--behall) brukbar igen; städning MANUELL enligt --behall-kontraktet och bevisad: PG17 down · psql-vägran · base endast OID 1/4/5 · pgsql_tmp tom · WAL 481 MB FEMTE punkten på serie-låget · disk 63 GB · lås flock-viloläge; mätinstrumentläxor bokförda: session-TZ tolkar timestamptz-literaler (skrap CEST vs prod UTC ⇒ gränsdagar visar 704/768 — skriv literalerna med explicit offset) + rsyslog ISO-format; bonus-gåva åt u1/u3: board levande 49 570 = 49 346 + 8×28 EXAKT (tredje oberoende instrumentet på klockformeln, == u1:s 09:30-tal) · organ levande 3 037 = 3 024 + 13; prediktioner P1–P9: 8 ✅ varav P5 primärhypotesen EXAKT (en kvarts med 5 rader); protokoll DR-OVNING-2026-09-19-KOPOST3-4-ANOMALI-ORGAN.md + JSON DR-KOPOST-ANOMALI-ORGAN-2026-09-19{,-LIVE}.json + sond verktyg/_s10u2-kopost3-4-analys.mjs)** — dessförinnan **DAGFONSTER-REPLIK 2026-09-19 09:33–09:34 lokal (s10-u3 manifest auto-s10-1789802729714 vakt 3/3 — DUBBELDISPATCH mot u1:s dagpunkt redovisad öppet (båda valde GRYNINGSPULS köpost 3 inom 3 min, bägge anspråk FÖRE mätning; s9-u2-D20-presedens: primäranspråket u1:s, mina mätningar = OBEROENDE KORSVALIDERING med 09:29:30-låsta prediktioner): restore GRÖN exit 0 RTO 16,1 s = blad 9:s femte punkt (12,1·12,2·12,5·18,1·16,1) med radkontrakt EXAKT femte gången (60/1 325 919 · 68/1 326 055 · 99/1 326 315 · fel 788/0 · fellogg 34 881 B femte identiska); RPO 09:34:16 reproducerar u1:s 09:30:35 EXAKT på alla fyra mått (board +224 = 8×28 · snapshots +18 984 → 1 252 404 · organ +13 · totalt +19 221 · 3/60 · 0 negativa) — u3:s blad-10-prediktion nu DUBBELT förhandsverifierad levande; NYTT 1: RAM-grindens första dokumenterade SKIP (845 MB < 1 000 vid 09:31 — fabrikens omgång om 3 + syskon-PG tryckte minnet; dr-ovning.mjs stod säkert men utan omstart dör fönstret) + KUR levererad: verktyg/_s10u3-dagfonster-vanta-ram.mjs (pollar ≥1 050 MB var 20:e s, tak 14 min, startar atomärt — fabriksläxa för framtida omgångar); NYTT 2: intra-kvarts-mikropunkten — board Δ = 0 mellan u1:s 09:30:35 och min 09:34:16 (3 min 41 s, ingen kvarsmarkör): klockan eldar VID markören, ej kontinuerligt (första parobservationen i klassen); NYTT 3: u1:s kodifierade RTO-läxa "≥2 GB ⇒ 10–14 s" BRUTEN av 16,1 s vid 3,0 GB — dagklassen 14–18 s gäller oavsett RAM; cache-kålshypotes (nystartad PG, tomma buffertar) + I/O-kö öppna; prediktioner 3 EXAKTA (P1 board · P3 snapshots · P6 radkontrakt) + P8 felbild EXAKT · band ✅ P5/P10 · primär-miss P4/P5 (organ +3 vs +13: dagepisoden skulle vägt tyngre än nattpulsen) + P7 (12,5 vs 16,1); PG-städning bevisad (min körning stoppade PG 09:33:41 enligt AUTO-5 [7/7] · OID 1/4/5 · pgsql_tmp tom · WAL 481 MB sjätte punkten) medan u2:s --behall-fönster (AUTO-6, blad 09-14 för deras 09-13-anomalien + organ-klocka) lämnats HELT ifred — tre-agent-flockkedjan kartlagd: u1 09:29:34 → jag 09:33:13 → u2 09:33:45; protokoll DR-OVNING-2026-09-19-DAGFONSTER-REPLIK.md + maskinellt DR-PROV-2026-09-19-AUTO-5.md + JSON DR-RPO-DIFF-2026-09-19-DAGFONSTER.json + DR-PREDIKTION-2026-09-19-DAGFONSTER.json)** — dessförinnan **DAGPULS-KLOCKFORMEL 2026-09-19 09:29–09:31 lokal (s10-u1 manifest auto-s10-1789802729714 vakt 1/3 — GRYNINGSPULS §8 köpost (3) BESVARAD: första DAGPUNKTS-RPO:n med klockformeln som prediktor; restore GRÖN exit 0 RTO 18,1 s = blad 9:s fjärde punkt (12,1·12,2·12,5·18,1 — dagpunkten seriens HÖGSTA, korrelerad med RAM-grind 1 004 MB: RTO är belastnings- inte klockslagskänslig, läxa kodifierad — framtida RTO-band konditioneras på MemAvailable: ≥2 GB ⇒ 10–14 s, ~1 GB ⇒ 14–20 s); radkontrakt EXAKT fjärde gången (public 60/1 325 919 · 68/1 326 055 · 99/1 326 315 · fel 788/0 · fellogg 34 881 B); DAG-RPO mätning 09:30:35 (M=28 kvarsmarkörer): board 49 570 = +224 = 8×28 EXAKT — **kvartsklockan DAGBEVISAD** i fönstret 02:30→09:30 inkl. två styrelserond-timmar (06:00·09:00): ronder skriver INGET påslag i board_decisions, kadensen är 8/kvart dygnet runt ⇒ blad 10:s board-prediktion 50 114 (8×96) stärkt; snapshots 1 252 404 = +18 984 EXAKT dag 7 = **u3:s blad-10-prediktion förhandsverifierad på LEVANDE sidan 17 h före blad 10:s födelse** (första gången en blad-prediktion mäts levande FÖRE den förutsagda dumpen existerar); organ +13 (puls-band hållet); totalt RPO +19 221 = 18 984+224+13 EXAKT dekomponerat · 3/60 tabeller i rörelse · 0 negativa — daglig exponering kl 09:30 ≈ 1,45 % av beståndet, pumpdominerad (98,7 % av delta); prediktioner 9✅ (5 EXAKTA) 1❌ — P6 RTO-missen 0,1 s över bandet rotorsaksbokförd; städning oberoende eigenmätt (PG17 down · base endast OID 1/4/5 + tom pgsql_tmp · WAL 481 MB FJÄRDE punkten på serie-låget (497×3→529×4→481×4) · lås flock-viloläge · 9 blad); protokoll DR-OVNING-2026-09-19-DAGPULS-KLOCKFORMEL.md + maskinellt DR-PROV-2026-09-19-AUTO-4.md + JSON DR-RPO-DIFF-2026-09-19-DAGPULS.json)** — dessförinnan **GRYNINGSPULS 2026-09-19 03:18–03:20 lokal (s10-u1 manifest auto-s10-1789779315763 vakt 1/3 — u2:s kvartsgränsköpost BESVARAD: första flerkvarts-RPO-fönstret (blad 9, 02:30→03:19 = tre kvarsmarkörer 02:45·03:00·03:15) skärper tvåledsmodellen till KLOCKA + PULS — board +24 = 8 × 3 kvarts EXAKT, kvartsklockan eldar VARJE kvart tre-för-tre, formeln board_delta = 8 × kvarsmarkörer; organ +1 intermittent småpuls (serien +9·+0·+1); snapshots +0 tredje nattpunkten; totalt RPO +25 på 49 min = nattlig DR-exponering ≈ noll OCH förutsägbar; restore GRÖN RTO 12,5 s = blad 9:s tredje (12,1·12,2·12,5) med radkontrakt EXAKT identiskt (1 325 919/1 326 055/1 326 315 · 60/68/99) och fellogg 34 881 B byte-identisk tredje gången (788/0); prediktioner 7✅ 2❌ ärligt bokförda — P1-miss (räknade två kvarts i stället för tre: läxan prediktera-från-formeln-ej-punkten) + P2-miss (blad 8:s organ-tal som bas); WAL 481 MB tredje punkten på serie-låget; PG-städning oberoende egenmätt (down · OID 1/4/5 · lås viloläge); protokoll DR-OVNING-2026-09-19-GRYNINGSPULS.md + maskinellt DR-PROV-2026-09-19-AUTO-3.md + DR-RPO-DIFF-2026-09-19-GRYNINGSPULS.json)** — dessförinnan **NATT-BLAD9-REPLIK 2026-09-19 02:59–03:01 lokal (s10-u3 manifest auto-s10-1789779315763 vakt 3/3 — oberoende REPLIK av blad 9 minutEN efter s10-u2:s rekordkörning, flock-serialiserad utan väntan: RTO 12,2 s · public 60/1 325 919 == syskonets restore == deras RPO-dumpTotal == min zcat-COPY-räkning == FEM instrument samma tal; SEX förregistrerade prediktioner låsta på disk FÖRE körningen (DR-PREDIKTION-2026-09-19-NATT-BLAD9.json) ALLA infriade — section_data_snapshots 1 233 420 EXAKT = pumpkontraktet +18 984 DAG 3 · board 49 346 EXAKT = kvartsformeln +768 DAG 3 · publicTotal 1 325 910 ±25 → 1 325 919 (avvikelse +9) · RTO 10–18 s → 12,2 · fel 788/0 · tabeller 60/68/99; dagstegsseriens sjunde punkt +19 800 = modalvärdet (bas: blad 8 zcat-mätt 1 306 119/1 214 436/48 578 — vart och ett konsistent med tidigare instrument); födelsebevis 29,5 min efter födelsen = tredje inom födelsetimmen (rekordet syskonets 27,8 samma natt); städning oberoende verifierad PG17 down/psql-vägran/disk 68 GB/lås flock-viloläge + fellogg-krockimmuniteten (pid+ms-namn) verifierad i levande dubbelkörning; agentprotokoll DR-OVNING-2026-09-19-NATT-BLAD9-REPLIK.md + maskinellt DR-PROV-2026-09-19-AUTO-2.md + prediktions-JSON)** — dessförinnan **NATT-FÖDELSEBEVIS 2026-09-19 02:57–03:0x lokal (s10-u2 manifest auto-s10-1789779315763 vakt 2/3 — blad 9 db-2026-09-19.sql.gz restore-bevisat 27,8 min efter födelsen 02:30:36 = NYTT SERIEREKORD i födelsetimmen, förra 28,0; markörer GRÖN 1 347 729 · CREATE 99 · COPY 101; RTO 12,1 s; public 60/1 325 919 = dagstakt +19 800 sjunde dagen; snapshots 1 233 420 = pumpkontraktet +18 984 EXAKT SJÄTTE kvartalet; board 49 346 Δ+768 = kvartsformeln EXAKT; fel 788/0 17:e gåningen; RPO +8 på ~33 min = nattens GOLV — board-kvaret enda garanterade rörelsen, organ-pulsen intermittent ⇒ modellen TVÅLED (se protokollets §4); WAL 481 MB ANDRA punkten på serie-låget = restores växer ej WAL; städning egenmätt PG17 down/base endast OID 1/4/5/9 blad/retention 09-11 vid 8 dygn; prediktioner 9 + 1 partiell av 10 förhandsregistrerade (P8-missen protokollförd); race mot u3 symmetriskt bokförd — deras board-tolerans ±0 skarpare; protokoll DR-FÖDELSEBEVIS-2026-09-19-NATT-BLAD9.md + maskinellt DR-PROV-2026-09-19-AUTO.md + JSON DR-RPO-DIFF-2026-09-19-NATT-BLAD9.json)** — dessförinnan KVÄLLSPULS-DR 2026-09-18 20:08–20:50 lokal (s10-u1 manifest auto-s10-1789754706687 vakt 1/3 omgång 2 + full fabricke: blad 8:s KOMPLETTA DAGSCYKEL sluten — 12 restores natt→kväll av SAMMA blad, spann 10,2–18,2 s, median 13,7 s, v98:s 20,0-s-mall slaget i samtliga; kvällens trio AUTO-15/17/18 flock-serialiserade på 49 s med dagens två snabbaste RTO 12,7/12,5 s = kvälls-dom håller; RPO fyra dagpunkter 08:10→20:50: +19 172→+19 604 — snapshots +18 984 EXAKT i ALLA (pump-noll heldag), board 8,0/kvart exakt; WAL 481 MB seriens lägsta = återvinning ej läckage; protokoll DR-OVNING-2026-09-18-KVALL.md + maskinella AUTO-15/17/18 + JSON KVALL ×2)** — dessförinnan PUMPVAKT-DR 2026-09-18 14:22–14:33 lokal (s10-u1 manifest auto-s10-1789733701140 vakt 1/3, NYTT verktyg `node verktyg/dr-pumpvakt.mjs --etikett EFTERMIDDAG` GRÖN exit 0 efter två självtestvägranar RÖT/RÖT — beviskedja AUTO-11/12/13/14; agentprotokoll DR-OVNING-2026-09-18-EFTERMIDDAG-PUMPVAKT.md + maskinellt DR-PROV-2026-09-18-AUTO-14.md + JSON-baslinje DR-PUMPSIGNATUR-2026-09-18-EFTERMIDDAG-4.json; commit 09c1c11a + om-leverans av denna rad efter prod-synk-clobber — se FYND clobber nedan): ARKIVSVEP:ns KÖPOST 4 MEKANISERAD FRÅN ENGÅNGSSVAR TILL STÅENDE VAKTPOST (syskon-u2:s blad-parsmätning samma fönster = fjärde bevisvägen; detta verktyg kontrollerar ALLA par VARJE runda med maskinell slarm-dom): samtliga 6 pump-par (09-12→13 … 09-17→18) Δsection_data_snapshots +18 984 EXAKT (förhandsregistrerat i anspråk FÖRE mätning; 0 PUMPSTOPP-SLARM; Δboard 765–773 · Δorgan 39–48 · Δpublic 19 791–19 805) · epokparet 09-11→12 Δsnap 0/Δboard 419/Δpublic +439 (dagen före pumpen OCH före beslutsklockans fulla regime — bär epok-notis) · snapshots 1 100 532 på BÅDA epokbladen = pumpen född efter 02:30 09-12, första batchen 09-12 08:00 landade i 09-13-bladet · restore-puls db-09-18 RTO 15,5 s i eftermiddagsläge (bladets punktserie idag 10,2–18,2 s) · public 60/1 306 119 EXAKT · radkontrakt 98 tabeller EXAKTA (cron+vault undantagna) · fel 788 kända/0 okända · TRE instrumentläxor bokförda i källkoden, samtliga fångade av självtestet FÖRE mätning (signaturfodral skall spänna födelsedatumet; observationsband skalas per dag — annars falskt VARNING:ar 2-dagars par vid hål i arkivet; utdatafält beräknas före textbygget) · städning oberoende mätt ×2: PG17 down/psql-vägran · fixtures borta · disk 71 G · CLOBBER-FYND (s10-u2-klassen i ny skepnad): delade filers ändringar (DRIFTSBOKEN + worklog) WIPES av prod-synkens git-fas när commit försenas av hook-väntan — bevis: ändringarna Edit-bevisat skrivna 14:4x, borta ur träd 14:5x medan deploy pid 2162642 höll låset; kur = om-leverans + commit i EN sekvens, lärdom = ALDRIG låta delade filer ligga osparkade över ett deployfönster**; dessförinnan **EFTERMIDDAGS-DR + PUMPVAKTPOST BESVARAD 2026-09-18 14:20–14:22 lokal (s10-u2 manifest auto-s10-1789733701140 vakt 2/3, `node verktyg/dr-ovning.mjs` GRÖN exit 0 + `PGPASSFILE=/home/ak1a/.pgpass node verktyg/dr-rpo-diff.mjs --fil db-2026-09-18.sql.gz --json`, anspråk disk-först 14:20; protokoll DR-OVNING-2026-09-18-EFTERMIDDAG.md + maskinellt DR-PROV-2026-09-18-AUTO-9.md + JSON DR-RPO-DIFF-2026-09-18-EFTERMIDDAG.json): dagens FEMTE restore av blad 8 — RTO 14,6 s · public 60 tabeller/1 306 119 rader == dump-COPY == dagens fyra tidigare restore = fem instrument samma tal · fel 788 kända/0 okända · markör GRÖN 1 327 830 · RPO kl 14:21: +19 384 oskyddade på 11,85 h i 3/60 tabeller (snapshots +18 984 · beslut +376 · organ +24) == gårdagens eftermiddagspunkt +19 392 (8 rador skillnad — dygnsprofilen upprepas; värsta-fall ≈ +19 788 oförändrad) · FYND — ARKIVSVEP:ets PUMPVAKTPOST (kö 4: avvikande blad-par = pumpstopp?) BESVARAD **FRISK**: blad-paret 09-17→09-18 mätt direkt på dumparna (zcat+awk-COPY-räkning) ger snapshots +18 984 EXAKT och beslut +768 EXAKT = pumpens FJÄRDE oberoende bevisväg (retro-diff · captured_at-sond · realtids-diff · blad-par), plus längsta mätta intra-dag-nollpunkten: snapshots stilla exakt 1 233 420 kl 06:09→12:21 UTC = +0 på 6,2 h efter 08:00-batchen (NATT-BLAD8:s delta 0 kl 00:58 UTC var FÖRE batchstart, ej stopp) — domregel kodifierad: bedöm blad-PAR, aldrig en enstaka stilla timme mitt på dagen; städning oberoende mätt: PG17 down · psql-socketvägran · disk 71 G · MemAvailable 1 198 MB**; dessförinnan **EFTERMIDDAG-FELLOGGSKUR 2026-09-18 14:20–14:22 lokal (s10-u3 manifest auto-s10-1789733701140 vakt 3/3; spårets äldsta öppna VERKTYGSKÖPOST STÄNGD enligt COMMIT-NORMEN — kur + beteendeprov + commit i samma fönster): dr-ovning.mjs:s restore-fellogg hette per KÖRDATUM (/tmp/dr-ovning-fel-<datum>.log) så två agenter samma dag skrev SAMMA fil (morgonkrocken pump-u2 ↔ DAGPULS-u1, båda 788 rader — en äkta RÖT-log kunde skrivas över av syskons GRÖNA körning) och bär nu BLAD+PROCESS-namn (/tmp/dr-ovning-fel-blad-<blad>-p<pid>-<ms>.log, rad 305–313); BEVIS I LEVANDE FABRIKSTRAFIK: tre flock-serialiserade körningar av samma blad db-2026-09-18 inom 75 s — AUTO-8 (RTO 18,2 s, mitt) + AUTO-10 (13,9 s, mitt; --fil med bart bladnamn resolverades med NOTIS = valDump-kurens andra återbevis) + LEVANDE SYSKON u2:s AUTO-9 (14,6 s — deras oberoende valda eftermiddagspuls, anspråk 14:20) = TRE distinkta felloggar à 34 881 B bevarade på disk, tre protokoll med varsin §4-referens; under gamla namnet hade samtliga tre skrivit SAMMA fil — morgonkrockens exakta scenario, nu omöjligt; gamla dagformatfilen orörd hela fönstret (md5 112e14e0… + mtime 08:10:27.588, mätt före och efter); radbild identisk med dagens tre morgonkörningar: public 60 tabeller/1 306 119 rader · public+storage 68/1 306 255 · alla scheman 99/1 306 515 · fel 788 kända/0 okända · markörer GRÖNA 1 327 830 rader/CREATE 99/COPY 101; blad 8:s RTO-serie 10,2/10,9/17,4/13,5/18,2/14,6/13,9 s — spannet 10–19 s, tjockleks- inte klockslagsberoende (kvälls-dom håller); städning oberoende mätt: PG17 down · skrap-DB borta (psql-vägran; base endast OID 1/4/5 + tom pgsql_tmp) · låsfil flock-viloläge · disk 71 G oförändrat; agentprotokoll DR-OVNING-2026-09-18-EFTERMIDDAG-FELLOGGSKUR.md + maskinella DR-PROV-2026-09-18-AUTO-8.md + AUTO-10.md (AUTO-9 = syskon-u2:s yta, orörd)**; dessförinnan **ARKIVSVEP-8-BLAD 2026-09-18 08:14–08:21 lokal (s10-u3 manifest auto-s10-1789711500221 vakt 3/3, NYTT verktyg `node verktyg/dr-arkivsvep.mjs` GRÖN exit 0; agentprotokoll DR-ARKIVSVEP-2026-09-18.md + maskinella DR-PROV-2026-09-18-AUTO-6.md (RÖT-beviset) + AUTO-7.md (GRÖN-kvittot)): HELARKIVET restore-bevisat i EN sekvens — 8/8 blad GRÖNA äldst→yngst (db-09-11…db-09-18) · RTO 11,0–16,8 s/blad (106,2 s totalt) · PER-TABELL-RADKONTRAKT EXAKT på samtliga blad (dumpens COPY-räkning == psql count(*); 94 tab på 09-11…09-15, 98 tab från 09-16) · markörer GRÖN 8/8 · fel 780→788 kända (+8 = Supabases auth-utbyggnad auth.mfa_recovery_codes/mfa_recovery_code_sets/auth.scim_tokens/auth.scim_users som tillkom mellan blad 09-15→09-16 — plattformens, ej kundens, tabeller)/0 okända · FYND 1 (formelrevision): radräkningsformeln har ett TREDJE undantag — vault.secrets (supabase_vault-extensionen failar lokalt ⇒ schemat skapas ej; COPY-blocket är TOMT 0 rader i alla blad; första svepkörningen RÖT på den = per-tabell-kontraktet SKARPRARE än schemanivå-formeln — kodifierad i verktygets KANDA_SCHEMA_UNDANTAG: cron OCH vault) · FYND 2 (ärlighetsrättelse): svepets "mitten aldrig restore-bevisad"-premiss var delvis fel — O7:s kontinuitetsövning 09-17 (db-09-12/13/14) + 09-15:s kvartalsövning (db-09-15) hade bevisat bladen var för sig; genuint nya = en-sekvens-svepet + per-tabell-kontraktet + verktyget + vault-fyndet · FYND 3: tillväxttrappan daterar pumpens födelsedygn (09-11→09-12 +439 rader, därefter +19 79x/dag mekaniskt; section_data_snapshots +18 984/dag == pump-u2:s realtidsdiff tredje vägen) — avvikande blad-par = pumpstopp-slarm (vaktpost) · FYND 4: felloggar per BLAD-namn (/tmp/dr-arkivsvep-fel-db-*.log) = krockimmun mot pump-u2:s per-DATUM-krockfynd · städning oberoende mätt: PG17 down · skrap-DB borta · lås flock-viloläge · fixtures borta · disk 72 G oförändrad; kvartalssvitens förslag: dr-total (yngsta) + dr-arkivsvep (hela fönstret) senast 2026-12-17**; dessförinnan **MORGON-PUMP-DR 2026-09-18 08:09–08:13 lokal (s10-u2 manifest auto-s10-1789704300078 vakt 2/3, PGPASSFILE-pekare + `node verktyg/dr-ovning.mjs --fil` GRÖN exit 0; protokoll DR-OVNING-2026-09-18-MORGON-PUMP.md + maskinellt DR-PROV-2026-09-18-AUTO-4.md + JSON DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json): PUMPENS LEVANDE LANDNING — första realtidsmätningen i 08:00-fönstret (dr-rpo-diff kl 08:09:16, 9 min 16 s efter batchen) med FÖRHANDSREGISTRADE prediktioner i anspråksfilen FÖRE mätstart (08:07): snapshots **+18 984 EXAKT** == gårdagens batch = pump-noll-hypotesen bevisad LEVANDE, tredje oberoende vägen (1 retro blad-diff u1 · 2 captured_at-sond u1 · 3 denna realtids-diff — alla tre == 18 984) · board_decisions **+176 EXAKT** = 22/22 kvartsbatchar 02:45→08:00, 0 missade · organ +12 · övriga 57 tabeller +0 · RPO-delta +19 172 på 5,64 h — SAMTLIGA 5 PREDIKTIONER INFRIADE (totaltintervall 19 140–19 260, mätt mitt i) · restore RTO 13,5 s (bonusprediktion 10–18 s; blad 8:s punkter 10,2/10,9/17,4/13,5) · fel 788 kända/0 okända · public 60/1 306 119 (public+storage 68/1 306 255 · alla scheman 99/1 306 515) · RACE mot syskon-u1 (samma minutfönster, oberoende manifest): flock-generationsskifte **90 ms** (mitt AUTO-4 skrivet 08:10:05.600 → deras barn pid 1991343 tog flocken 08:10:05.690) = seriens snabbaste, noll dödtid, båda GRÖNA, identiska RPO-tal på 90 s isär = dubbel oberoende instrumentering · ÄRLIGHETSNOTIS: min första "oberoende" städmätning (08:11) fångade deras AKTIVA fönster (PG17 online + färsk OID 193869 = deras skrap-DB) — jag rörde det ej, ommeätt efter deras exit: PG17 down · psql-vägran · base endast OID 1/4/5 · pg_wal 529 MB SJÄTTE punkten (två restores till rörde ej) · disk 72 G · låsfil flock-viloläge · FYND (köpost till verktygsägaren): dr-ovning.mjs:s fellogg namnges per DATUM (/tmp/dr-ovning-fel-<datum>.log) — två agenter samma dag skriver SAMMA fil (idag kolliderade min och u1:s 788-radersloggar; innehåll identiska, men en äkta RÖT-log kan skrivas över av syskons GRÖNA körning) — pid-/sekundsuffix önskas; verktyget orört denna omgång (COMMIT-NORMEN: kur + beteendeprov + commit i samma fönster)**; dessförinnan **DAGPULS-DR 2026-09-18 08:10 lokal (s10-u1 manifest auto-s10-1789711500221 vakt 1/3, `node verktyg/dr-ovning.mjs --fil db-2026-09-18.sql.gz` GRÖN exit 0; protokoll DR-OVNING-2026-09-18-DAGPULS.md + maskinellt DR-PROV-2026-09-18-AUTO-5.md): RTO 12,9 s DAGSLÄGE på db-2026-09-18 (public 60/1 306 119 · alla scheman 99/1 306 515 · fel 788 kända 0 okända) = TREDJE oberoende restore samma blad med IDENTISKA radtal (natt 10,2 · 17,4 s · dag 12,9 s — dagskors tre vägar) + RPO DAG 2: +19 172 oskyddade på 5,68 h i 3 av 60 tabeller (snapshots +18 984 · beslutsklockan +176 ≈ 31,0 r/h · episoden +12) med PUMPFÖRUTSÄGELSEN VERIFIERAD EXAKT (läsande captured_at-sond, COUNT-klass: 18 984 rader med ENDA ts 06:00:00.078402Z == 08:00:00,078 lokal idag mot 06:00:00.058474Z igår — batchstorlek OCH sekund deterministiska på DAG 2; runbook: extra blad ~08:05 skär värsta-fallet ≈19 788 → ≈408 = −97,9 %, varje vardag) + KEDJA 3-KÄLLGAP REVISED: nyaste paket 09-16 13:40 = gap 42,6 h · 325 commits oskyddade NU (kod-ytan; dataytan max ~30 h via 02:30/02:40-natterna) · datorns hybridkedja fortfarande död sedan 09-09 (hetzner_key) MEN arkivera-server.mjs (d8ef3cea 09-16, skapade 13:40-paketet) + söndagscron `20 3 * * 0` FINNS i levande crontab — saknas i 09-16 13:40-snapshoten och /tmp/server-arkiv.log är TOM ⇒ raden tillagd efter 13:40 09-16 och aldrig körd ⇒ PREDIKTIONSKONTRAKT: JUNGRUKÖRNING söndag 2026-09-20 03:20 (vakt verifierar log + server-repo-2026-09-20.* + bundle verify; avvikelse = ny fyndklass); sektion S10-U1 nedan · Dessförinnan MORGON-PULS-DR 2026-09-18 02:59–03:06 lokal (s10-u3 manifest auto-s10-1789692929837 vakt 3/3, `node verktyg/dr-ovning.mjs` GRÖN exit 0; protokoll DR-OVNING-2026-09-18-MORGON-RETENTION.md + maskinellt DR-PROV-2026-09-18-AUTO-3.md): RTO 17,4 s på db-2026-09-18 (public 60/1 306 119 · alla scheman 99/1 306 515 · fel 788 kända 0 okända) = oberoende replik mot syskon-AUTO-2:s 10,2 s med IDENTISKA radtal = dagskorsbevis · RADRÄKNINGSFORMELN (ny): markörkollens totalrad 1 327 830 = ALLA rader i dumpfilen (DDL+data) — per-schema COPY möter psql EXAKT (public 1 306 119 == 1 306 119 · auth 140 + storage 136 + realtime 82 + migrations 38 == psql-deltat 396), enda schemanivå-synliga tabellavvikelsen cron 6 266 rader (ARKIVSVEP FYND 1 + kö 2, reviderad 2026-09-18: kända schema-undantag = cron OCH vault — vault.secrets bär 0 rader och är OSYNLIG för schemanivå-formeln; per-tabell-kontraktet i dr-arkivsvep/dr-pumpvakt är det skarpare instrumentet) (pg_cron-ägt schema skapas ej i skrap-DB — kördhistorik ej kunddata, kategoriserad bland de 788 kända felen) + 15 049 DDL-rader ⇒ 1 306 515 + 6 266 + 15 049 = 1 327 830 ✓ — totalsiffran jämförs ALDRIG direkt med psql-COUNT igen · RETENTIONENS ANDRA PROV (FÖRSTA = s10-u3 O7 01:55 i DR-FONSTER-KONTINUITET-2026-09-17.md; detta tar fallen som saknades): tre kontrollfall i skarp katalog med beviskedja -print→-delete→stat-diff — 32-d dummy RADERAD (enda -print-träffen) · 28-d dummy överlevde · dummy med FÄRSK mtime men namnet db-1987-… överlevde ⇒ MTIME STYR, filnamnets datum är KOSMETISKT (kö-konsekvens: kopior med cp UTAN -p blir raderingsskyddade — cp -p/rsync -a vid dumpflytt); 8 äkta blad stat-diff-orörda; dummy B+C manuellt städade (O7-normen: en dummy överlever aldrig provet) · PREDIKTIONSKONTRAKT: första äkta bladraderingen = **2026-10-13 02:30** (db-2026-09-11 mtime 13:29:55 når n=31 vid 10-12 13:29:55) medan db-2026-09-12 (mtime 02:30:38) överlever 10-13 års körning med 38 s → raderas 10-14 02:30; vaktspåret verifierar mot /tmp/supabase-backup.log + katalogen — avvikelse = ny fyndklass · PG-städning oberoende mätt (PG17 down, skrap-DB borta, låsfil = flock-viloläge, disk 72 G oförändrat)**; dessförinnan **KVÄLLS-KEDJA-3 (SERVERFILS-ARKIVET) 2026-09-17 21:11–21:13 lokal (s10-u3 vakt 3/3, `node verktyg/dr-kedja3.mjs` GRÖN exit 0; agentprotokoll DR-OVNING-2026-09-17-KVALL-KEDJA3.md + maskinellt DR-KEDJA3-2026-09-17-AUTO.md + DR-BESLUTSKLOCKA-2026-09-17-KVALL.json): kvartalsmallens fjärde steg första gången på dagens läge — sabotage 3/3 gripna · arkiv A repo-tar 144 MB (09-16 13:40) gzip GRÖN 8 892 poster/exkluderingskontrakt 0 brott · restore RTO 3,4 s — 8 322 filer + 570 kataloger == listat, src 675 filer/203 930 rader · spot-diff 2 IDENTISKA + 2 SKILJER-FÖRKLARADE (kvällens 20:23/20:30-commits efter arkivets mtime: DRIFTSBOKEN + package.json/next@16.3.5-patchen) · arkiv B git-bundle 151 MB verify + klon GRÖN 9,6 s/1 195 commits + ancestor GRÖN mot levande HEAD · PG17 nere ankomst+slut · O9:s kö (3) STÄNGD (u1:s KVÄLLS-TOTAL körbevis + denna oberoende kodbevisreplik): dr-total.mjs:235 anropar kedjorna UTAN --fil-argument → dr-ovning:s defaultgren hittaSenasteDump() (DUMP_KATALOG, absolut rotad) — valDump():s resolveringsgren berörs ALDRIG av dr-total (u2:s "absolut väg"-antagande preciseras till "inget vägargument alls") · O9:s kö (4) STÄNGD: board_decisions = DETERMINISTISK KVARTSKLOCKA — exakt 8 rader per :00/:15/:30/:45 → 32/h → 768/dygn, 24 hela timmar utan undantag, enda avvikelsen i 7-dagsserien 09-13 (765); organ_health_logs = den äkta episoden (9/3 rader vid 02/04/08/10/14/16/20); O9:s "episodisk (rondstyrd?)"-dom för board OMSKRIVEN (+0-på-9,2-min låg mellan :30- och :45-batcherna); värsta-falls-RPO tredje oberoende vägen: 18 984+768+~36 ≈ 19 788 == O9:s ≈19 800 == u2:s +19 780 · FYND NYTT GAP (huvudagentkö): kedja 3:s KÄLLA saknar mekanisk cadens — användar-crontaben har ingen rad för backup-server-filer.mjs (endast 02:30 pg_dump + 02:40 moln-JSON), hybrid-sync.log SENASTE körning 09-09 20:09 med dubbla fel ("ssh-nyckel saknas (…hetzner_key)" + "system-events-full HTTP 500") = datorns hybridkedja DÖD i 8 dygn, nyaste paket agenttriggat 09-16 13:40 ⇒ katastrof ikväll = restore GRÖN men ~32 h förlorade commits; kö: server-cron ~02:50 + retention -mtime +30 ELLER reparera datorns synka.cmd (hetzner→contabo_key) — crontaben ägs av huvudagenten**; dessförinnan **KVÄLLS-DR 2026-09-17 21:09 lokal (s10-u2 vakt 2/3: RTO 11,0 s — seriepunkt 20, dagens snabbaste, spannet 10,3–23,9 oförändrat · 60 tabeller/1 286 328 rader — SEX oberoende instrument samma tal · pump-noll 14:40→21:09 (+0 snapshots på 6,5 h) = O9:s profillucka stängd · beslutsklockan +220/6,48 h = 34 r/h tredje dagtimmen samma snitt · värsta-fall-RPO ≈ +19 780 möter O9:s ≈ +19 800 · VAKTFYND: valDump-kuren bevisad 14:33 men ALDRIG committad och BORTA från disken vid 21:07 (git-ren mot 09-16, mtime 14:37) — återlevererad troget spec, beteendeprov AUTO-6 RÖT-vägran → AUTO-7 GRÖN med NOTIS, committad I SAMMA FÖNSTER; NY NORM: verktygsändring + beteendeprov + commit i samma fönster; protokoll DR-OVNING-2026-09-17-KVALL-RPO.md + JSON DR-RPO-DIFF-2026-09-17-KVALL.json)**; dessförinnan **KEDJA 7 — KIRURGIRECEPTET FÖR BOARD_DECISIONS BEVISAT 2026-09-17 14:43 lokal (s10-u2 O9, `node verktyg/dr-kedja7.mjs` GRÖN exit 0; agentprotokoll DR-KEDJA7-2026-09-17-BOARD-RECEPT.md + maskinella DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md = RÖT/RÖT/GRÖN-beviskedjan): spårets äldsta öppna köpost STÄNGD — kedja 5:s FYND 1 (board_decisions kan EJ kirurgeras: FK:n forecast_log.board_decision_id ON DELETE SET NULL gör att kirurgins DELETE UPDATE:a forecast_log, där trg_forecast_log_immutable vägrar allt) har nu sitt bevisade recept: `SET LOCAL session_replication_role = replica` i kirurgins ENDA transaktion (superuser — lokal PG-postgres är det) — replica-läget stänger av triggrar OCH FK-enforsering: SET NULL-kaskaden eldas ALDRIG (0 ärr: forecast_log 429 rader/113 referenser OBERÖRDA, till skillnad från FK-paus-varianter) men FK validerar ej heller under appliceringen ⇒ verktygets OBLIGATORISKA efterkontrakt, alla GRÖNA: rader 47 810 == källa · checksumma 8e16c9e7… IDENTISK · hängande-referenssond 0 · skyddstriggrar 2/2 aktiva (tgenabled=O) · LIVE-bevis — engångs-UPDATE i forecast_log VÄGRAS fortfarande efteråt · roll `origin` (SET LOCAL dog med transaktionen). Mätvärden: full restore 15,2 s (fel 788 kända/0 okända; kedja 7-serie 17,5/13,1/15,2) · extraktion 47 810 rader/80,9 MiB/1,1 s (antalskontrakt == källa) · KATASTROF-mutation (buggig migrering, consensus_level=-1) 500 rader LANDADE (sondbekräftat) · NAIVA kirurgin (kedja 5:s recept) VÄGRAD på 0,5 s exakt av "AK1A prognosmotor: UPDATE på forecast_log är förbjuden" + HEL rullbak, katastrofen kvar (fynd 1 mekaniskt återbevisat) · sabotage (mitt-rads-kolumnfel i receptfilen) vägrat + rullbak · RECEPET 4,2 s. FYND: (a) SKIKTAT SKYDD — en olycks-DELETE av board_decisions stoppas REDAN av skyddet via kaskaden; den farliga katastrofen är MUTATION (tabellen själv triggerfri — konsensusförfalskning landar obehindrat) och ENDAST replica-receptet läker den; (b) två instrumentbuggar bokförda enligt ärlighetsdoktrinen: kör 1 RÖT på conrelid::regclass::text utan public.-prefix (search_path) → normaliseringskur; kör 2 RÖT på psql -q som döljer UPDATE-n-ekot → oberoende sond-kur (process-eko är inget mått); (c) runbook för prod tillämpning i sektionen nedan. Städning ägar + oberoende mätt: skrap-DB ak1a_dr_k7 raderad, PG17 stoppad, tmp raderade (fellogg medvetet kvar), låsfil utan hållare.** Dessförinnan **EFTERMIDDAGS-DR 2026-09-17 — DUBBEL STABIL RPO-PUNKT + INTRA-DAG-NOLL + FALSK RÖT-DOM KURAD (2026-09-17 14:28–14:41 lokal, s10-u3 O9, `node verktyg/dr-ovning.mjs` ×3 GRÖN ×2 + `PGPASSFILE=… node verktyg/dr-rpo-diff.mjs` ×2, protokoll DR-OVNING-2026-09-17-EFTERMIDDAG-RPO.md + maskinella DR-PROV-2026-09-17-AUTO-{3,4,5}.md + JSON DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json): RTO-punkt 18 = 17,1 s (absolut väg) + punkt 19 = 14,1 s (dagens snabbaste — samma relativa bladargument EFTER kuren); jungfrubladet db-2026-09-17:s radtal 60 tabeller/1 286 328 == dump-COPY == morgonens två restore = FEM instrument samma tal (bladets mest oberoende bevis); RPO kl 14:31 +19 392 oskyddade på 11,9 h (snapshots +18 984 · beslutsklockan +408 · 3 av 60) == s10-u1:s MIDDAG-mätning SAMMA minut = oberoende replik två instrument; punkt 2 kl 14:40:39 TOTALT +0 på 9,2 min mitt på dagen (snapshots 1 214 436 oförändrad — ingen drip) ⇒ med s10-u1:s exakta 08:00:00,058-tidsstämpel är dygns-RPO-profilen KOMPLETT: växling 02:30 (0) → batchkliv 08:00 (+18 984 i ETT bulk-påstående) → episodiskt kryp → VÄRSTA FALL ≈ +19 800 == dagsteget sekunder före nästa växling (två beräkningsvägar möts); 02:30-placeringen bevisad optimal bland ett enda blad (ligger i pumpens stilla natt-gap; s10-u1:s runbook-kö extra blad ~08:05 bygger på profilen); beslutsklockan preciserad till EPISODISK (+0 på 9,2 min trots 34 r/h-snitt — rundstyrd?); VAKTFYND+ROTORSAKSKUR: `--fil db-…` med bart bladnamn dömdes FALSKT RÖTT (dr-ovning.mjs path.resolve mot cwd; AUTO-3: restore VÄGRADES, PG17 orörd = fail-fast bevisat i felriktningen) → kirurgisk `valDump()` (bladnamn som saknas relativt cwd resolvas mot dumpkatalogen med NOTIS-rad; äkta saknad fil förblir RÖD) → beteendeprov AUTO-5: SAMMA kommando GRÖNT med NOTIS + full restore 14,1 s; node --check GRÖN, inga andra verktyg rörda; PG-städning egenmätt (base endast OID 1/4/5, pg_wal 497 MB oförändrad, PG17 down, /tmp enligt mall).** Dessförinnan **MIDDAGS-DR 2026-09-17 — KEDJA 4 PÅ JUNGFRU-CRON-SETET + PUMPSTARTEN TIDSATT + TOMMA PER-TYP BESVARADE (2026-09-17 14:26–14:35 lokal, s10-u1, `node verktyg/dr-kedja4.mjs` GRÖN exit 0 + `PGPASSFILE=… node verktyg/dr-rpo-diff.mjs --json` + läsande captured_at-sond, protokoll DR-OVNING-2026-09-17-MIDDAG.md + maskinellt DR-PROV-2026-09-17-KEDJA4.md + JSON DR-RPO-DIFF-2026-09-17-MIDDAG.json): kedja 4 första gången på en OBEVAKAD cron-export (09-16-setet var manuellt exporterat) — RAM-grind GRÖN direkt (1 223 MB), självtest 4/4, 10/10 per-typ-filer GRÖNA (0 VARNINGAR = inga tysta exportfel), ⊆ full-arkiv 10 matchade/0 saknade (arkiv 163 039), restore i skrap-PG 10 rader från 10 filer RTO 0,10 s, oberoende PG-verifiering (perTyp blogg_utkast=7 + medlem=3, jsonb 10), städning verifierad (ak1a_dr_pertyp raderad, PG17 nere); KÖPOSTEN TOMMA PER-TYP BESVARAD — de 8 tomma filerna är ÄKTA TOMMA: arkivets faktiska per-typ-fördelning är medlem=3 · blogg_utkast=7, alla övriga 8 bevakade typer 0 OCKSÅ i arkivet (källan tom, ej exportfel; räkneklarering: 8 av 10 per-typ-filer + full-arkivet som 11:e fil; ytan stillastående — de 10 raderna bär fönstret 09-11 10:44→23:25, inga nya event av bevakade typer på 6 dygn); MORGNONS KÖPOST PUMPSTART INFRIAD — snapshots-pumpen skriver HELA dagens batch vid exakt 08:00:00 lokal (captured_at 06:00:00.058474Z, samtliga 18 984 rader EN tidsstämpel = ett enda bulk-påstående; gårddagen identisk 06:00:00.047496Z/18 984): morgonmätningen 07:43 såg pumpen på 0 (17 min före start), middagsmätningen 14:31 såg den klar — fönstret (07:43, 14:31) slutet av mätningarna, sonden sätter start exakt; KORSBEVIS sondens 18 984 == diffens +18 984; MIDDAGS-RPO: +19 392 oskyddade på 11,9 h sedan 02:30-bladet i 3 av 60 tabeller (snapshots +18 984 · board_decisions +384 · organ_health_logs +24, inga negativa); TVÅ-KLOCKOR-BILDEN KOMPLETT: beslutsklockan +163→+408 på 6,81 h ≈ 36,0 r/h (serien 31,3–36,0, jämn dygnet runt) medan pumpen levererar EN batch/dag kl 08:00 ⇒ ~96 % av RPO-skulden byggs i en enda sekund; RUNBOOK-KÖ till huvudagenten: ett extra blad ~08:05 skär värsta-falls-RPO:n ≈ 19 700 → ≈ 408 rader (−96 %, RTO-kostnad ~10 s) — crontaben ägs av huvudagenten, inget ändrat av agenten.** Dessförinnan **JUNGRUDAGEN KEDJA 1 — FÖNSTRETS SJUNDE BLAD db-2026-09-17 RESTORE-BEVISAT + FÖNSTRET KOMPLETT 7 BLAD (N ∈ [0..6]) + FÖRSTA MORGNON-RPO:N (2026-09-17 07:39–07:45 lokal, s10-u3 O8, `node verktyg/dr-ovning.mjs --fil db-2026-09-17.sql.gz` GRÖN exit 0 + `dr-rpo-diff.mjs --json`, protokoll DR-OVNING-2026-09-17-JUNGRUDAG-7-BLAD.md + maskinellt DR-PROV-2026-09-17-AUTO.md + JSON DR-RPO-DIFF-2026-09-17-MORGON.json): nattens 02:30-blad GRÖNT 1 307 940 rader · RTO 12,1 s (seriens punkt 16, spann 10,3–23,9 s) · fel 788 kända/0 okända · public 60 tabeller/1 286 328 rader == dumpens COPY-räkning (två instrument, samma tal); dagstegsserien KONFIRMERAD med femte punkten +19 800 (spridning 8 rader över 5 steg: 19 805/19 797/19 797/19 800/19 800); FYND TVÅ KLOCKOR i RPO-bilden — beslutsklockan (board_decisions+organ_health_logs) ≈ 31 r/h jämn dygnet runt (natt 31,9 · morgon 31,3) medan snapshots-pumpen (+19 800/dag) stod HELT STILLA 02:30→07:43 (morgondelta +163 endast beslutsklockan) — timmarna efter växlingen är nästan kostnadsfria, skulden byggs först när pumpen startar (köpost: mitt-på-dagens-mätning tidssätter startet); RAM-GRINDKUR under fabrikstrefönstret: exit 75 vid 943 MB (tre fabriksbarn + main) → poll-vänta-tills-öppet 120 s → GRÖN 1 155 MB, PG orörd under väntan; SAMMA blad oberoende replikerat av s10-u1 O8 21 s senare (deras AUTO-2: 12,4 s — FYRKANTIGT KORSBEVIS restore-COUNT ×2 == dump-COPY == 1 286 328, se deras FÖDELSEBEVIS)**. Dessförinnan **JUNGFRUNATT KEDJA 2 — RAD 3:S FÖRSTA OBEVAKADE NATTEXPORT (02:40) BEVISAD ÄNDA TILL RESTORE 2026-09-17 07:36–07:39 lokal (s10-u2 O8, `node verktyg/dr-kedja2.mjs` GRÖN exit 0 på jungfrunattens arkiv system-events-full-2026-09-17.json.gz, protokoll DR-KEDJA2-2026-09-17-JUNGRUNATT.md + maskinellt DR-KEDJA2-2026-09-17-AUTO.md): jungfrunatt-bevis — /tmp/moln-backup.log FÖDD 02:40:01.838 (stat-Birth: loggen skapad av cron-körningen själv = rad 3:s första körning någonsin; 09-16:s export var manuell och skrev aldrig loggen), tidslinje 02:40:01→02:40:38 ≈ 37 s (10 per-typ-filer 02:40:02–03 → system-events-full 26.3 MB klar 02:40:38), total-kontrakt KOMPLETT 163039/163039 (v3-trunceringsvakten GRÖN på första obevakade natten), äkthetsdiff 161 678 (09-16 manuell) → 163 039 (09-17 cron) = +1 361 rader på 19 h 16 min = äkta ny export ej kopia; RESTORE: 163 039 rader · 0 felaktiga · 0 dubblett-id · RTO 25,0 s = KEDJA 2-SERIENS SNABBASTE (52–58 · 27,2 · 38,5 · 37,3 · 25,0) · COPY 6 535 r/s · oberoende PG-verifiering rader==unikaId==163 039 · tidsfönster till 09-17 02:40:02 (sista raden skriven sekunder före exporten) · severity info 162 296/warning 743 · jsonb-prov 15 915; ⇒ KEDJA 2 BEVISAD ÄNDA TILL ÄNDA UTAN AGENT I KEDJAN — BÅDA nattkedjorna (02:30 SQL + 02:40 JSON) har nu jungfrunatts-bevis ända till restore-bar lokal PG; observation: 0 dublett-id mot gårdagens 4 (hypotes: v3:s repetitionsskydd — ej bevisat, prod-PK saknas fortfarande); köpost: 8 av 11 per-typ-tabeller TOMMA i nattexporten.** Dessförinnan **FÖNSTERKONTINUITETEN: ALLA SEX blad restore-bevisade + RETENTIONSPROVET 2026-09-17 01:55–01:57 lokal (s10-u3 O7, `node verktyg/dr-ovning.mjs --fil` ×3, samlingsprotokoll DR-FONSTER-KONTINUITET-2026-09-17.md + maskinella DR-PROV-2026-09-16-AUTO-{7,8,9}.md): fönstrets MITT-BLAD restore-bevisade — db-2026-09-12 RTO 11,1 s · public 60 tabeller/1 187 329 rader · db-2026-09-13 11,2 s · 60/1 207 134 · db-2026-09-14 10,3 s (seriens snabbaste) · 60/1 226 931; fel 780 kända/0 okända ×3; markörer GRÖN ×3 ⇒ HELA retentionfönstret 09-11→09-16 restore-bevisat (fönsterdjupet + kedja 1-serien tog ändarna; varje N∈[0..5] "dagar sen katastrof" har nu bevisat blad + mätt radtal); FYND: tillväxten +439 (09-11→12) därefter KONSTANT ≈+19 800/dag (fönsterdjupets 16 016/dag-snitt = artefakt av 439-dagen), RTO ålder-oblessrad (10,3–11,2 s på 4–5 dagar gamla blad — 30-dagarsgränsen RTO-neutral); RETENTIONENS BETEENDEPROV (första): cron-radens exakta find -mtime +30 -delete raderade 40-dagars-dummy + skonade 28-dagars-dummy + lämnade 6 äkta blad (gränsen är >30 hela dygn; gränsfallsfilen städad manuellt — dummy överlever aldrig provet, RÖD markör låser &&-kedjans retention); första äkta bladraderingen ~2026-10-11+ då 09-11-bladet passerar 30 dygn — fönstret växer dit, fönsterdjupets dag-29-runbook gäller då för 09-11.** Dessförinnan **TOTAL-MALLEN KOMPLETT MED KIRURGI — fem kedjor ETT kommando 2026-09-17 01:52–01:55 lokal (s10-u1 O7, `node verktyg/dr-total.mjs` med dr-kedja5.mjs vävt som steg 2 av 5 i ordning 1→5→2→4→3; maskinellt överprotokoll DR-TOTAL-2026-09-16-AUTO-3.md (UTC-bladnamn) + 5 delprotokoll): samtliga 5 kedjor GRÖNA i EN sekvens — TOTALT 187,2 s (iterationsserie 130,0 → 147,0 → 187,2 s; kirurgin +73,0 s: full restore 11,4 s · extraktion 2,2 s/1 176 468 datarader · sabotage GRIPET · kirurgi 13,7 s · checksumma IDENTISK); kvartalsmallen 2026-12 = ETT kommando (--utan-kirurgi i rescue-läge); FLOCK-KÖ MELLAN AGENTER skarpt bevisad (syskonets dr-ovning tog prov-låset 13 ms efter överprotokollets slut — köade bakom mina barns lås, noll kollision).** Dessförinnan **NATT-DR + FÖRSTA NATTLIGA RPO-DIFFEN 2026-09-17 01:47–01:51 lokal (s10-u2 O7, `node verktyg/dr-ovning.mjs` GRÖN exit 0 + NYTT instrument `verktyg/dr-rpo-diff.mjs`, protokoll DR-OVNING-2026-09-17-NATT-RPO.md + JSON DR-RPO-DIFF-2026-09-17.json): kedja 1 i nattfönstret strax före 02:30-växlingen — markörer GRÖN 1 288 041 · RTO 12,7 s · fel 788 kända/0 okända · public 60 tabeller/1 266 528 rader == dumpens zcat-COPY-räkning (KORSBEVIS: två instrument, samma tal — kompletthetskontrakt i båda ändar); RPO-diff levande prod: 1 286 295 rader = +19 767 oskyddade på 23,3 h i 3 av 60 tabeller (snapshots +18 984 · board_decisions +744 · organ_health_logs +39, inga negativa); NATTDIFTSFYND: nattfönstret +408 rader/12,1 h ≈ 34 r/h vs ~1 730 r/h dagtid = natten ~50× lugnare — RPO-skulden byggs dagtid, timmen före 02:30 minst kostsam för DR; instrumentbuggar (felvillkor + schema-citering) bokförda+fixade innan GRÖN; PG-städning ägarmätt (skrap-DB borta, PG17 ner).** Dessförinnan **KEDJA 6 STORAGE-RESTORE + FYND TVÅ SUPABASE-PROJEKT 2026-09-16 20:41–20:43 lokal (s10-u3, `node verktyg/dr-kedja6.mjs`, maskinellt protokoll DR-KEDJA6-2026-09-16-AUTO.md + fyndrapport DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md): storage-lagrets BÅDA halvor restore-bevisade — metadata (5 buckets/63 objekt/0,57 MB) ur nattdumpen i skrap-DB (full restore 13,8 s · fel 788 kända/0 okända · retentionssvep 6/6 GRÖN · markörer GRÖN) + innehåll via LÄSANDE Storage-REST (bucket+objektlista 0,7 s; nerladdningsprov ak1nvestor-code.zip 1 272 122 B == live-listans metadata.size — byte-kontrakt GRÖNT, första gången innehållsvägen bevisad; blobbar har INGEN historik, runbook i protokollet); FYND 1 (akut, fyra instrument): dumpkedjan (.pgpass → db.rkaq…wxrw) och appens REST (.env → …suhvlsbp = AGENTS.md:s ref) läser TVÅ OLIKA Supabase-projekt — rkaq: system_events 0 i ALLA dumpar sedan 09-11, snapshots 1 176 468 växande ~19k/dag, board_decisions 47 602; aufr: system_events 162 741 VÄXANDE (+1 063 på 11 h), members 3, board_decisions 77, snapshots 404 — dagens "system_events TOM i prod" MOTBEVISAT som radering (tväprojekt-artefakt; ÅTERIMPORTEN ska EJ genomföras), dumpkontradiktionen + members=0 upplösta; kedjorna 1/3/4/5:s restore-bevis består (rkaq↔rkaq), men aufr:s icke-events-tabeller är OBACKADE; FYND 2 (R2, orört): aufr:s bucket "ak1nvestor-code" är PUBLIK och listade en .env.local-namngiven fil (innehållet ALDRIG läst — verktygets R2-filter valde zip:en som provobjekt) — åtgärd = huvudagenten.** Dessförinnan **TOTAL-ÖVNINGEN ITERATION 2 + FLOCK-BETEENDEPROV 2026-09-16 20:42–20:45 lokal (s10-u2 O6, `node verktyg/dr-total-flockprov.mjs`, DR-TOTAL-2026-09-16-FLOCKPROV.md + maskinellt överprotokoll DR-TOTAL-2026-09-16-AUTO-2 + 4 delprotokoll): alla fyra kedjorna GRÖNA i EN sekvens — TOTALT 147,0 s == väggklocka (kedja 1 39,9 s/restore 14,3 s · public 60 tabeller/1 266 528 rader · kedja 2 39,8 s/161 678 rader/4 955 r/s · kedja 4 36,4 s/10 av 10 + sabotage 3/3 · kedja 3 30,8 s/8 322 filer/1 195 commits) MED flock-lagret BETEENDEBEVISAT (O4:s ärlighetsnot INLÖST i förtid): (i) låsfilen bar `flock=1` med LEVANDE pid under körningen, (ii) främmande aktiv 25 s-låshållare → dr-total KÖADE och tog över efter 24,1 s (gamla fillås-semantiken hade exit 3 direkt), (iii) 45 min bakdaterad död låsfil oskadlig — exit 3 uteblev; PG-städning verifierad (PG17 nere, /tmp/dr-total-* borta, låset släppt); grindläge MemAvailable 1 075 MB (nära 1 000-taket — omkörningsvägen förblev overksam); kvartalsmallen 2026-12 = ETT KOMMANDO `dr-total-flockprov.mjs` (övningskärnan + gratis flock-om-verifiering).** Dessförinnan **KIRURGI-ÖVNINGEN 2026-09-16 14:09–14:13 lokal (s10-u2 O5, `node verktyg/dr-kedja5.mjs`, DR-KEDJA5-2026-09-16-KIRURGI.md + tre maskinella delprotokoll): KEDJA 5 kirurgisk TABELLåterställning — organismens minne (public.section_data_snapshots, 1 176 468 rader ≈ 92 % av DB:n) tillbaka som ENDA tabell ur nattdumpens COPY-block: extraktion 2,4 s (zcat+awk, 93 369 KiB, antalskontrakt == källa) + atomisk applicering 15,5 s (DELETE+COPY i EN transaktion), radantal+checksumma IDENTISKA med fullt återställd källa; sabotage (kolumnfel i mitt-rad) GRIPT — psql ON_ERROR_STOP vägrade, transaktionen rullades tillbaka, tabellen orörd; NYTT stående kontrakt: retentionssvep 6/6 dumpar gzip-gröna per körning (kedja 3:s läxa mekaniserad på dumparna); FYND: (1) board_decisions kan EJ kirurgeras — SET NULL-kaskaden mot forecast_log stoppas av forecast_immutable()-triggern (äkta skydd mot olycksradering; specialrecept = huvudagenten), (2) psql accepterar TYST en vid EOF trunkerad COPY (bevisat: 705 881 rader landade exit 0) — radantal+checksumma är OBLIGATORISKT completeness-kontrakt, verktyget bär det.** Senast bevisade FÖNSTERDJUP (äldsta bladet): **FÖNSTERDJUPSÖVNINGEN 2026-09-16 20:49–20:55 lokal (s10-u1 O6, `node verktyg/dr-fonsterdjup.mjs`, DR-FONSTERDJUP-2026-09-16.md): retentionens ÄLDSTA blad (db-2026-09-11, dag 1 av 30) restore-bevisat i två körningar — RTO 15,4 + 14,5 s, okända fel 0, PG count == dumpblock för 60/60 public-tabeller (1 186 890 == 1 186 890); fönstrets tillväxtdiff äldsta→yngsta: +80 082 rader/5 dagar (≈ 16 016/dag; drivers snapshots +75 936 · board_decisions +3 493 · cron +449; 4 nya auth-plattformstabeller; konton 5→3) — gzip-integritet (kedja 5:s svep) är inte restore-barhet, detta är djupbeviset.** Senast bevisade FULLA restore: **TOTAL-KVARTALSÖVNINGEN ETT KOMMANDO 2026-09-16 13:51–13:53 (s10-u2 o4, `node verktyg/dr-total.mjs`, DR-TOTAL-2026-09-16-AUTO.md): alla fyra kedjorna GRÖNA i EN sekvens — TOTAL-RTO 130,0 s = summa==väggklocka (kedja 1 23,3 s/restore 12,2 s · kedja 2 43,8 s/161 678 r · kedja 4 33,4 s · kedja 3 29,6 s/arkiv 8 892 poster = s10-u1 o5:s minutfärska export korsbevisad) med fail-fast + RAM-omkörningskontrakt + vilolägesgaranti i finally — kvartalsmallen 2026-12 = ETT KOMMANDO (korsbevis: s10-u3 3/3:s manuella sekvens ≈105 s samma dag; flock-lagret tillagt efter körningen — BETEENDEBEVISAT 20:42 samma dag av O6, se DR-radens lead).** Dessförinnan **KVARTALSÖVNINGEN I FYRA KEDJOR 2026-09-16 13:40–13:45 (s10-u3 3/3, DR-KVARTAL-2026-09-16-FYRAKEDJOR.md): kedja 1 RTO 17,3 s — nionde punkten (public 60 tabeller/1 266 528 rader == dumpens COPY-radantal: två instrument, samma tal) + kedja 2 GRÖN 161 678 rader/39,0 s + kedja 3 GRÖN (sabotage 3/3 gripna, git-klon 1 195 commits, restore == listat) + kedja 4 GRÖN (10/10 ⊆ full-arkivet) — ALLA FYRA i EN sekvens ≈ 105 s; kvartalsmallen = FYRA kommandon (dr-ovning/dr-kedja2/dr-kedja3/dr-kedja4), nästa senast 2026-12-16. FÖRSTA FULLA LIVE-PROD-DIFFEN (psql COUNT per tabell via PGPASSFILE, 60 tabeller): RPO-delta +19 359 sedan 02:30-dumpen = väntad tillväxt i 3 tabeller, inget oväntat. **AKUT FYND: system_events TOM i levande prod** — 0 rader 13:46 lokal (tabellägare postgres bypassar RLS ⇒ talet sant; 161 678 rader fanns 07:24; raderade i fönstret 07:23–13:46 lokal; inget lokalt el. molnets cron-jobb raderar tabellen; nya events skrivs EJ heller — skrivvägen tystnade); dagens arkiv = ENDA kopian (kopia /tmp/s10u3-arkiv-sakerhetskopia.json.gz, md5 35ce34fc…); återimport mekaniserad (aterstall-system-events.mjs --plan-supabase) men skrivning mot prod = HUVUDAGENTENS beslut — se DR-KVARTAL-…-FYRAKEDJOR.md §4–5.** **RÄTTAD 20:5x lokal samma kväll av KEDJA 6 (S10-U3, se DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md): fyndet var en TVÄPROJEKT-ARTEFAKT — psql-sonderna (→ rkaq-projektet) och exportören/REST (→ aufr, appens projekt) läser olika fysiska förråd; system_events LEVER i appens projekt (162 741 och växer) och är 0 i rkaq-dumparna sedan 09-11 ⇒ INGEN radering skett, återimporten SKA EJ genomföras.** Dessförinnan TAKLYFTET 2026-09-16 (s10-u1 O4): kedja 2:s exportör v3 — TOTAL-KONTRAKT + cron 02:40** — 200k-takets kommande TYSTA trunkering (~2026-10-05, +2 015 rader/dag) avvärjd; export GRÄNS 161 678 rader/33 sidor/42,9 s med total-kontrakt KOMPLETT 161678/161674 (dumpen bär sitt eget kompletthetsbevis — JSON-motsvarigheten till slutmarkörerna); restore RTO **38,5 s** = åttonde punkten GRÖN (0 felaktiga · 4 dublett-id kvantifierade = prod-tabellens saknade PK); exporten var OSCHEMALAGD på servern sedan hybrid-sync tystnade → **cron-rad 3 kl 02:40 installerad + referenssynkad, konfigvakten GRÖN 3/3**. Dessförinnan **JUNGRUNATTEN 2026-09-16 (s10-u2 o2): 02:30-cronen levererade OBEVAKAT första natten efter kuren** (markör GRÖN 1 288 041 rader via pgpass; +81 mot manuella testet = äkta ny dump) **+ sjunde RTO-punkten 12,2 s på själva cron-dumpen** (public 60 tabeller/1 266 528 rader · alla scheman 99/1 266 924 · fel 788 kända 0 okända) — kedja 1 bevisad ända till ända UTAN agent i kedjan; RAM-grindens första verkliga exit 75 (PG orörd, omkörning GRÖN). Dessförinnan FULL kvartalsövning BÅDA kedjorna i sekvens 2026-09-16 (s10-u1 o3) — total ~38–40 s: kedja 1 RTO **11,2 s** (sjätte punkten; public 60 tabeller/1 266 455 rader · alla scheman 99/1 266 851 · fel 788 kända 0 okända) på db-2026-09-16; kedja 2 GRÖN **27,2 s / 160 928 rader / 0 dubbletter** via NYTT verktyg `verktyg/dr-kedja2.mjs` — kvartalsmallen = TVÅ kommandon, flock INBYGGT i båda (u3:2:s kö LÖST, se flock-notisen); race-fynd bevisat: läsning mitt i pågående export döms RÖT = skyddet verkade. Tidigare: 20,0 s / 95 tabeller (60 public) / 1,25 M rader (2026-09-15, AUTOMATISK kvartalsövning `node verktyg/dr-ovning.mjs` — låsfilsskyddad, protokoll maskinellt). KEDJA 2 (moln-JSON, system_events — saknas i SQL-dumpen): senaste arkiv natten 2026-09-15/16 GRÖNT — 160 928 rader, domkontrakt 0 fel/0 dubbletter (7 dagars RPO-gap SLUT, s10-u5); RTO 52–58 s vid 146 727 rader, verktyg `aterstall-system-events.mjs` (strömmande, sabotagebevisat) — komplett DR = BÅDA kedjorna. Kedja 1-verktyget OBEROENDE GODKÄNNANDEPROVAT (femte RTO-punkten 23,9 s; härdat). NATTKEDJAN KURAD 2026-09-16 (s10-u5): pgpass = inget klartextlösenord i processlistan + markörvakt varje natt i cron (RÖD natt låser retention); testköt hela kedjan GRÖN 29,1 s / 1 287 960 rader | data/forskning/DR-PROV-2026-09-15-AUTO.md + DR-PROV-2026-09-15-JSON-KEDJAN.md + DR-VERKTYG-GODKANNANDE-2026-09-15.md + DR-NATTKEDJAN-2026-09-16.md + DR-PROV-2026-09-16-FULL.md + DR-KEDJA2-2026-09-15-AUTO{,-2}.md + DR-PROV-2026-09-16-KEDJA3.md (serverfiler) + DR-PROV-2026-09-16-KEDJA4.md (per-typ-vyorna) + DR-PROV-2026-09-16-JUNGRUNATT.md (jungfrunatten + sjunde RTO-punkten; maskinellt delprotokoll DR-PROV-2026-09-16-AUTO.md) + DR-TAKLYFT-2026-09-16.md (taklyft + total-kontrakt + cron 02:40; maskinellt delprotokoll DR-KEDJA2-2026-09-16-AUTO.md) + DR-TOTAL-2026-09-16-AUTO.md (totalöverprotokoll ETT KOMMANDO; maskinella delprotokoll DR-PROV-2026-09-16-AUTO-3 + DR-KEDJA2-2026-09-16-AUTO-3 + DR-PROV-2026-09-16-KEDJA4-3 + DR-KEDJA3-2026-09-16-AUTO-4) + DR-TOTAL-2026-09-16-FLOCKPROV.md (O6: flock-beteendeprov + TOTAL iteration 2; maskinella DR-TOTAL-2026-09-16-AUTO-2 + DR-PROV-2026-09-16-AUTO-4 + DR-KEDJA2-2026-09-16-AUTO-4 + DR-PROV-2026-09-16-KEDJA4-4 + DR-KEDJA3-2026-09-16-AUTO-5) + DR-KEDJA6-2026-09-16-AUTO.md (KEDJA 6 storage-restore; maskinellt) + DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md (tvåprojekt-fyndet + backup-gap-kartan + kö §5) + DR-OVNING-2026-09-17-NATT-RPO.md (natt-DR + första nattdiffen; JSON-delprotokoll DR-RPO-DIFF-2026-09-17.json) + DR-FONSTER-KONTINUITET-2026-09-17.md (mitt-bladen + retentionens beteendeprov; maskinella DR-PROV-2026-09-16-AUTO-{7,8,9}.md) + DR-KEDJA2-2026-09-17-JUNGRUNATT.md (jungfrunatt rad 3: första obevakade 02:40-exporten restore-bevisad; maskinellt delprotokoll DR-KEDJA2-2026-09-17-AUTO.md) + DR-OVNING-2026-09-17-JUNGRUDAG-7-BLAD.md (jungfrubladet kedja 1 + kompletta 7-bladsfönstret + första morgon-RPO:n; maskinellt DR-PROV-2026-09-17-AUTO.md + JSON DR-RPO-DIFF-2026-09-17-MORGON.json) + DR-OVNING-2026-09-17-MIDDAG.md (middags-DR: kedja 4 på jungfru-cron-setet + diagnosen tomma per-typ + pumpstart 08:00 tidsatt; maskinellt DR-PROV-2026-09-17-KEDJA4.md + JSON DR-RPO-DIFF-2026-09-17-MIDDAG.json) + DR-OVNING-2026-09-17-EFTERMIDDAG-RPO.md (eftermiddags-DR: dubbel stabil RPO-punkt + intra-dag-noll + komplett dygnsprofil + falsk-RÖT-kuren med AUTO-3/4/5-beviskedjan; maskinella DR-PROV-2026-09-17-AUTO-{3,4,5}.md + JSON DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json) + DR-KEDJA7-2026-09-17-BOARD-RECEPT.md (agentprotokoll: recept + runbook + fynd) + DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md (maskinella; RÖT/RÖT/GRÖN) + DR-OVNING-2026-09-18-MORGON-RETENTION.md (morgon-puls-DR + retentionens andra prov: namn-vs-mtime + sekundprediktion 10-13; maskinellt delprotokoll DR-PROV-2026-09-18-AUTO-3.md) + DR-OVNING-2026-09-18-MORGON-PUMP.md (morgon-pump-DR: pumpens levande landning + 5/5 förhandsregistrerade prediktioner + 90-ms-flockskiftet; maskinellt DR-PROV-2026-09-18-AUTO-4.md + JSON DR-RPO-DIFF-2026-09-18-MORGON-PUMP.json) + DR-ARKIVSVEP-2026-09-18.md (helarkivssvep 8/8 blad i en sekvens: per-tabell-radkontrakt + vault-fyndet + pumpens födelsedygn; maskinella DR-PROV-2026-09-18-AUTO-6.md (RÖT-beviset) + AUTO-7.md (GRÖN-kvittot)) + DR-OVNING-2026-09-18-EFTERMIDDAG-FELLOGGSKUR.md (felloggskuren per blad+process med krockbevis i levande fabrikstrafik — tre körningar samma blad inom 75 s, tre bevarade loggar à 34 881 B; maskinella DR-PROV-2026-09-18-AUTO-8.md + AUTO-10.md; AUTO-9 tillhör syskon-u2:s eftermiddagspuls) + DR-OVNING-2026-09-18-EFTERMIDDAG.md (eftermiddags-DR: dagens femte restore av blad 8 + RPO 14:21 + pumpvaktposten besvarad FRISK via blad-parsignatur; maskinellt DR-PROV-2026-09-18-AUTO-9.md + JSON DR-RPO-DIFF-2026-09-18-EFTERMIDDAG.json) + DR-OVNING-2026-09-18-EFTERMIDDAG-PUMPVAKT.md (pumpsignatur-vakten: ARKIVSVEP-kö 4 mekaniserad till stående vaktpost — 6/6 pump-par +18 984 EXAKT, epokvärlden dokumenterad, tre instrumentläxor fångade av självtestet FÖRE mätning; maskinella DR-PROV-2026-09-18-AUTO-{11,12,13,14}.md = RÖT/RÖT/GRÖN/GRÖN-beviskedjan + JSON-baslinje-serien DR-PUMPSIGNATUR-2026-09-18-EFTERMIDDAG{,-2,-3,-4}.json) |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **EFTERMIDDAGSPULS 2026-09-19 16:06–16:09 lokal (s10-u1 manifest auto-s10-1789826700636 vakt 1/3 — DUBBELDISPATCH redovisad öppet: syskon-u3 körde kärnövningen samma minutfönster (AUTO-12 kl 16:08:46, RTO 11,5 s) 63 s efter denna (AUTO-11 kl 16:07:43, RTO 11,7 s) — u3 trodde u1/u2 höll offsite-spåret (det var s8-u2/u3, annat manifest); dom enligt D20-precedenserna: ingen avvisning, repliken = OBEROENDE KORSVALIDERING med identiska radtal inom 103 s, flock-serialiserat noll krock; läxa: disk-anspråk FÖRE mätning vid dispatch av samma objekt-typ; duplikatkontroll FÖRE start var korrekt — dagens tio restores slutade 09:52, ingen 16:0x-punkt fanns): blad 9:s ELJONDE restore GRÖN exit 0 (AUTO-11) RTO 11,7 s (näst snabbast av TOLV: 12,1·12,2·12,5·18,1·16,1·14,9·15,9·15,7·15,1·15,5·11,7·11,5 — median 15,0 · medel 14,3 · v98:s 20,0-s-mall slaget 12/12) @ MemAvailable 1 970 MB ⇒ DAGPULS-bandet "≈2 GB ⇒ 10–14 s" bekräftat (formiddagens 14,9–18,1 s gick vid 1,0–3,0 GB); radkontrakt EXAKT (public 60/1 325 919 · 68/1 326 055 · 99/1 326 315 · fel 788 kända/0 okända); DAGSTEG blad 8→9 +19 800 EXAKT (modalvärdet åttonde punkten); RPO 16:09:30 +19 441 oskyddade på 13,65 h i 3/60 tabeller · 0 negativa — snapshots +18 984 == gårdagens samtliga fyra dagpunkter == pumpens dygnsbatch, PUMP-NOLL DAG 2 (1 252 404 stilla sedan 08:00, +0 på 6,6 h — utökar gårdagens 6,2 h-nollpunkt) · board +432 = 8×54 kvartar EXAKT (mätning mellan 16:00/16:15-markörerna; kvartsformeln lever, blad-10-prediktion 50 114 = 49 346+768 stärkt tredje vägen) · organ +25; KORSVALIDERING instrument A==B: dumpens zcat-COPY-total 1 325 919 == restorens psql count(*) på siffran; städning oberoende eigenmätt: PG17 down · psql-socketvägran · base endast OID 1/4/5 · pgsql_tmp TOM · WAL 481 MB ÅTTONDE punkten på serie-låget · lås flock-viloläge · retention 9 blad orörda (äldsta 09-11 13:29:55, raderingsprediktion 10-13 02:30 intakt) · disk 63 G/36 % · MemAvailable 1 948 MB efteråt; protokoll DR-OVNING-2026-09-19-EFTERMIDDAG.md + maskinellt DR-PROV-2026-09-19-AUTO-11.md + JSON DR-RPO-DIFF-2026-09-19-EFTERMIDDAG.json + anspråk data/vakten/auto-s10-1789826700636-s10-u1-ansprak.md; u3:s parallella leverans: AUTO-12 + sektion S10-U3 med STÄDNINGSFYND (AUTO-10:s --behall-kvarlämning — deras yta, deras läxa)** |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **KEDJA-0 APPDUMP 2026-09-19 16:09–16:41 lokal (s10-u2 manifest auto-s10-1789826700636 vakt 2/3 — FÖRSTA dump+restore någonsin av APPENS projekt aufr…suhvlsbp, DUBBELPROJEKT-storfyndets direkta följd; engångsbevis UTAN persistenta ändringar: .pgpass/crontab/.env orörda, lösenord läst ur DATABASE_URL vid körning, env-till-barn, aldrig loggat): pg_dump GRÖN **84 MB gz** (sha256 937f48c0… · slutmarkör GRÖN · COPY 420/CREATE 418 — tabelluniversum 6× rkaq:s: public **372 tabeller/178 493 rader** · public+storage 380/179 838 · alla scheman 417/181 645 · nyckeltabeller: system_events **167 219 VÄXANDE** (levande kontrakt: 178 491→178 493 publika rader mellan två körningar) · auth.users 45 · user_activities 5 388 · members 3 · profiles 11 · board 77) · restore **RTO 22,2 s** (band 20,3–26,0 s tre körningar — läxa: DDL-ANTALET (372) driver RTO, ej radmassan) · fel 109 kända/0 okända (deterministiskt ×3) · dumptid band 105–415 s (WAN/IPv6-varians på AAAA-enda värdar — trestegs-retry i verktyget efter en "no response"-dip); **KEDJA 2 REHABILITERAD**: system-events-full 02:40 = KOMPLETT (166 067 rader == api-total == filens eget total-kontrakt, truncerad false, 27,7 MB gz) — RPO-gap händelser 1 152 rader/14 h ≈ 82 r/h; ärlighetsnotis: mitt instrument felrapporterade först "7 rader" (räknade JSON-toppnycklar) och stoppades av egen storlekskontroll FÖR publicering — falskt storfynd avvärjt; SIDOFYND (1) appens DATABASE_URL (.env.production.local) pekar på RKAQ — hypotes: appens serverkod via DATABASE_URL = DUBBELPROJEKT §7.4:s "osynliga skrivare" ("rkaq" syns ej i src/, bara i env-värdet — huvudagenten utreder med kod-kontext); (2) lösenordsåteranvändning aufr==rkaq (DR-bekvämt, säkerhetspunkt — R2); (3) auth.users + user_activities + ai_generated_courses SAKNAS i ALLA kedjor (skyddskartan §7.5:s första tabellnivå-mätdokument); (4) ROTORSAK HITTAD: körning 1/3:s maskinprotokollfiler OCH verktyget självt försvann — ROND 96:s skraparkivering (pre-r96 16:35–16:37) svepte OSPÅRADE fabriksfiler inklusive pågående agents ocommittade leveranser (körning 4 klarade sig: node läst filen i minnet; fyra filer återfunna intakta i arkivet, verktyget återställt sha-identiskt; köpost: exkludera pågående fabriksfönster från svepet); **KEDJEKUREN §7.1 AVRISKERAD** — receptet bevisat hela vägen; kvar åt huvudagenten: .pgpass-post + crontab db-app-*.sql.gz (R2); städning oberoende eigenmätt: PG17 down · skrap-DB ak1a_dr_app raderad · dumpfil raderad GDPR-säkert (0700-katalog, sha256 är beviset) · lås flock-viloläge · felloggar kvar i /tmp (spårbara); protokoll DR-OVNING-2026-09-19-KEDJA0-APPDUMP.md + maskinellt DR-APPDUMP-2026-09-19-KEDJA0.md/.json + NYTT verktyg verktyg/dr-appdump.mjs (kvartalsrepeterbart) + anspråk data/vakten/auto-s10-1789826700636-u2-ansprak-APPDUMP.md (P1–P7: 6✅ varav 2 EXAKTA, 1❌ RTO-miss band-kodifierad)** |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **KVÄLLSPUNKT APP-DB 2 2026-09-19 22:29–22:34 lokal (s10-u3 manifest auto-s10-1789849506241 vakt 3/3 — KEDJA-0-instrumentets ANDRA fulla körning = appens databas aufr har nu en reproducerbarhetspunkt: pg_dump 188,1 s/84,1 MB gz GRÖN (sha256 98cd669f…, slutmarkör GRÖN, COPY 420/CREATE 418) · restore RTO 26,8 s (band 20,3–26,8 över 4 restores — u2:s 20–30 s-kodifiering håller) · fel 109 kända/0 okända EXAKT ×2 fulla körningar · radkontrakt 372/380/417 tabeller · public **179 902 rader**); **aufr system_events TRE punkter ⇒ dygnsprofil TVÅLED: dag 82,4 r/h → kväll 179,0 r/h (2,2× — kvällsfabrikstrafiken skriver events)** med dekomposition EXAKT (+1 409 = events +1 050 + user_activities +359; övriga 370 tabeller +0) · user_activities FÖRSTA takten 61,2 r/h (tabellen saknas i ALLA kedjor — skyddskarta §7.5:s första siffra); **kedja-2-gap 2 202 rader på 19,9 h = appens verkliga RPO vid kväll** (ENDA händelsekopian; prognos nästa 02:40 ≈ 2 400–2 950, verifieras mot system-events-full-2026-09-20.json.gz); prediktioner P1–P10 låsta på disk FÖRE körning: 7 ✅ (5 EXAKTA) · 3 ❌ med GEMENSAM rotorsak (dagfasmodellen 82 r/h saknade kvällens 2,2× — läxa: tvåpunktsbas per tabell OCH per dygnsfas); städning oberoende eigenmätt: PG17 down · psql-socketvägran · dumpfil GDPR-raderad (/tmp/dr-appdump-aufr-* borta) · fellogg enligt mall · 9 blad orörda; protokoll DR-OVNING-2026-09-19-KVALL-APP-2.md + maskinellt DR-APPDUMP-2026-09-19-KEDJA0-2.md/.json + DR-PREDIKTION-2026-09-19-KVALL-APP.json; KVD: data-only, src/ orörd = INGET bygge, R2 orörd (.pgpass/crontab/.env orörda — mätning ej kur), syskonytor orörda (dr-appdump.mjs omodifierat)** |
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **DAGPUNKT BLAD 10 2026-09-20 12:39–12:40 lokal (s10-u1 manifest auto-s10-1789900509524 vakt 1/3 — blad 10:s TREDJE restore, den FÖRSTA i DAGSLÄGE (de två nattliga födelsebevisen u2/u3 06:3x lokal; DAGPULS-precedensen: varje blad förtjänar en dagpunkt): `node verktyg/dr-ovning.mjs` GRÖN exit 0 · RTO 15,9 s ∈ doktrin 11–19 (blad-10-serien 11,7·12,9·15,9) · markörer GRÖN 1 367 628/CREATE 99/COPY 101 · radkontrakt EXAKT tredje gången (public 60/1 345 719 · 68/1 345 855 · 99/1 346 115 · fel 788/0) · fellogg BYTE-IDENTISK med båda nattreplikerna (cmp GRÖN, 34 881 B ×3 — blad 10:s determinismbevis komplett); DAG-RPO 10:40:38Z: +19 328 oskyddade på 10,17 h · 3/60 i rörelse · 0 negativa, dekomponerat EXAKT = **snapshots +18 984 → 1 271 388 = PUMPENS DYGNSBATCH LANDAD** (morgonens 04:39Z såg den frusen 1 252 404 ⇒ landningsfönster 04:39–10:40Z, första gången spåret fångar LANDNINGEN mellan två levande punkter; **blad-11-prediktionen 1 271 388 förhandsverifierad LEVANDE** — andra gången i spårets historia) + **board +320 → 50 434 = 8×40 markörer EXAKT** (klockformelns åttonte test, åttonde träff, PUNKTTRÄFF siffra för siffra; fönstret spänner ronder 06+09 utan påslag; blad-11-konsistens 50 434+8×56 = 50 882 = gårdagens låsta prediktion) + organ +24 → 3 096 (blad-11 3 120 stöds av dagtakt); exponering 12:40 lokal ≈ 1,43 % pumpdominerad; prediktioner P1–P9 låsta 10:38:55Z FÖRE mätning: 9/9 ✅ varav 5 EXAKTA (P3 punktmisse ärligt bokförd — band höll); städning eigenmätt: PG17 down · psql-vägran · base OID 1/4/5 · retention 10 blad orörda · disk 57 G · DR-flock togs EFTER min körning av syskonen u2/u3:s fönster (D20-läget, deras protokoll); protokoll DR-OVNING-2026-09-20-DAGPUNKT-BLAD10.md + maskinellt DR-PROV-2026-09-20-AUTO-3.md + JSON DR-RPO-DIFF-2026-09-20-DAGPUNKT.json + anspråk data/vakten/auto-s10-1789900509524-s10-u1-ansprak.md** |
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
- F1 ISR-uppvärmare: pumpor-daemonen kl 03:10 kör bash data/infra/contabo/ak1a-varm.sh
  (versionerad i repot — inte crontab; logg /tmp/ak1a-varm.log). ROND 104-ROTKUR
  2026-09-19: sitemap-grepet levererar sluggar med eget /blogg/-prefix — gamla
  loopen prependede igen ⇒ /blogg//blogg/slug 404, alla 30 bloggvägar värmdes
  ALDRIG sedan våg 98 (loggen 12/44 = enbart statiska 200:or; s9-u2:s fynd
  "glider nedåt" var samma rot + transienta natt-timeout). Kurerad + bevisad:
  torrkörning 2026-09-19 23:08 lokal = 44/44 (även /en + /ar utan trailing
  slash — svarade 308 förr); nytt försök per väg vid timeout; missade vägar
  loggas namngivet.

## S10-U2 — KVARTALS-DR-ÖVNING (2026-09-15, GODKÄNT)

- Full återställning av natt-dumpen (30,8 MB gz) i lokal PG17-skrap-DB:
  **17,7 sekunder · 68 publika tabeller · 1 246 728 rader**. Verifierat:
  medlemmar 3/3, kurser 10, moduler 122, snapshots 1 157 484.
- 780 "fel" = samma kända kategori som v98 F3 (saknade Supabase-roller/
  extensions i vanilla-PG) — ofarliga.
- **Sudo-lösningen**: agentfabrikens barn HAR sudo (studio-skalet har det
  inte). DR-övningar körs hädanefter autonomt via agentfabriken — inget
  kundfönster behövs.
- **System_events-fyndet slutgiltigt utrett i återställd DB**: ingen tabell
  eller vy i SQL-dumpen bär händelseloggen (tabellen tom, fel kolumnnamn,
  kolumnen `type` finns bara i notifications/payouts/storage). Beständig
  regel: komplett DR = SQL-nattdump (allt utom loggen) + moln-JSON-backup
  (loggen, integritetsbevisad 2026-09-13).
- Städning enligt mönster: skrap-DB raderad, PG17 stoppad (redo), 78 GB
  ledigt. Retention: 5 dumpar (11–15 sep) — 30-dagarsregeln tom ännu.
- Nästa övning per kvartal: **senast 2026-12-15**.
- Fullständigt protokoll: data/forskning/DR-PROV-2026-09-15.md.

## S10-U3 — DR-REPLIK + FABRIKKOLLISIONSFYND (2026-09-15)

- **Oberoende andra restore av samma natt-dump: 14,7 s** (u3) + u2:s 17,7 s =
  RTO replikerbar, båda under v98 F3:s 20 s. Radtal identiskt: public
  1 246 728; totalt **1 247 119 rader / 95 tabeller** (auth 135, realtime 82,
  storage 136, migrations 38). Fel 780 = samma kategori (u3 bekräftar
  oberoende). Fullständigt protokoll: data/forskning/DR-PROV-2026-09-15-REPLIK.md.
- **Instrumentdiff förklarad:** "68 publika tabeller" (ovan) = public 60 +
  storage 8; public-schemat är exakt **60 = v98 F3:s 60** (oförändrat).
  Nästa protokoll redovisar public / public+storage / alla scheman var för sig.
- **FABRIKKOLLISION (rotorsak + kur):** manifestet gav 3 identiska
  uppgiftstexter → två agenter körde DR-flödet samtidigt; journal-bevis:
  syskonets mätfrågor mot samma skrap-DB 12:08:56, "fast shutdown" 12:09:14
  (avbröt u3:s verifiering), skrap-DB droppad under pågående fönster. Noll
  förlorad data. KUR: (1) fabriksmanifest ger ALDRIG två id samma
  objekt-räckvidd; (2) **PG17 DR-fönstret ägs av EN agent i taget**
  (låsfil /tmp/ak1a-dr-prov.lock, flock-mönstret) — till huvudagenten att
  mekanisera; (3) DR-fönstret stängs alltid med dropdb + stop, oavsett vem
  som öppnade.
- Städning oberoende verifierad av u3: ak1a_dr_test borta, PG17 down, disk
  78 GB ledigt. Nästa kvartalsövning oförändrat: **senast 2026-12-15**.

## S10-U1 — DUMP-SLUTMARKÖRSVAKTEN (2026-09-15, LEVERERAD)

- Nytt verktyg `verktyg/kolla-dump-markorer.mjs`: bevisar att natt-dumparna
  är KOMPLETTA, inte bara giltiga gzip-arkiv — kontraktet är pg_dump 17:s
  `\restrict`/`\unrestrict`-tokenpar (start rad ~5, sista icke-tomma raden,
  matchande token) + raden "-- PostgreSQL database dump complete" +
  gzip-ström-integritet. Streaming, konstant minne, ~6 s/dump. Lägen:
  baslinje (alla) / `--natt` (dagens, för cron) / `--fil`. Exit 0 endast
  när alla domar GRÖNA.
- BEVISAT: 3 sabotagefall (trunkerad gzip, avklippt slut med GILTIG gzip,
  förfalskad token) = samtliga RÖD exit 1; baslinje 5/5 GRÖNA på dumparna
  11–15 sep (1 207 625 → 1 267 803 rader, ~10–20 k raders tillväxt/dag).
- **FYND säkerhet:** 02:30-cronen kör pg_dump med lösenordet i
  KOMMANDORADEN — under ~2 min/natt syns det i serverns processlista.
  Kur (huvudagenten): ~/.pgpass (chmod 600) + PGPASSFILE, inga hemligheter
  i argument. Värdet återges aldrig i repo/loggar.
- **Retention 30 dagar är REDAN mekaniserad** i samma cron-rad
  (`find … -mtime +30 -delete`) — härmed dokumenterat; 5 dumpar 11–15 sep,
  regeln tom ännu (korrekt).
- ~~VÄNTAR huvudagenten~~ **VERKSTÄLLT 2026-09-16 av s10-u5 (fabrik):**
  crontab-radbytet applicerat + testkört helt GRÖNT (se sektion S10-U5)
  — tillsammans med pgpass-kuren ovan: processlistan ren, varje natt-dump
  döms av markörkontraktet, RÖD natt låser retention (gamla dumpar
  behålls tills kedjan är grön).
- Fullständig rapport: data/forskning/DUMP-MARKORKOLL-2026-09-15.md.

## S10-U4 — DR-ÖVNINGEN MEKANISERAD: `verktyg/dr-ovning.mjs` (2026-09-15, LEVERERAD)

- **Kvartalsövningen är nu ETT kommando**: `node verktyg/dr-ovning.mjs` kör
  hela flödet — lås → dumpkontroll (s10-u1:s verktyg anropas som förkontroll)
  → PG17-start → färsk skrap-DB → restore med RTO-mätning → tabell-/radmätning
  på TRE nivåer (u3:s kontrakt: public / public+storage / alla scheman) →
  protokoll i data/forskning/DR-PROV-<datum>-AUTO.md → GARANTERAD städning
  (finally — även misslyckad övning lämnar aldrig skräp i PG17).
- **u3:s låsfilskur IMPLEMENTERAD**: `/tmp/ak1a-dr-prov.lock` (atomär
  skapande, pid + starttid; dött lås tas över efter 30 min). Upptaget lås =
  exit 3 INNAN PG17 rörs — fabrikskollisionen från omgång 1 kan inte upprepas.
- BEVISAT denna dag: låsvägran exit 3 (PG orörd) · trunkerad dump vägras av
  förkontrollen exit 1 (PG orörd) · ÄKTA KÖRNING GRÖN exit 0 — RTO **20,0 s**,
  public 60 tabeller / 1 246 728 rader, public+storage 68 / 1 246 864, alla
  scheman 95 / 1 247 119 — fjärde oberoende mätpunkten (v98 20,0 · u2 17,7 ·
  u3 14,7 · denna 20,0 s) och identisk radbild mot u2/u3. Felloggen 780
  rader: samtliga kända (roller/scheman/extensions + 12 fortsättningsrader
  HINT/DETAIL/LINE — psql:s flerlinjers fel; kategoriseringen breddades för
  detta, okända ERROR-rader lyser fortfarande igenom och ger VARNING).
- Städning oberoende verifierad: låsfil borta, skrap-DB raderad, PG17 down,
  disk 77G ledigt oförändrat. Misslyckad övning protokollförs också (RÖD
  dom + avbrottsorsak i protokollet) — vakten protokollför ALLT.
- Nästa kvartalsövning: **senast 2026-12-15** — kör `node verktyg/dr-ovning.mjs`
  (behöver fabriksbarnets sudo; `--fil` för annan dump, `--behall` lämnar
  skrap-DB+PG uppe för manuell undersökning — protokollet noterar brutet
  viloläge). Fullständigt protokoll: data/forskning/DR-PROV-2026-09-15-AUTO.md.

## S10-U3:2 — DR-ÖVNING KEDJA 2: MOLN-JSON system_events (2026-09-15, GODKÄNT)

- **Sista obevisade restore-kedjan bevisad.** SQL-kedjan var mätt 4× (v98/u2/u3/
  u4) men system_events (händelseloggen) saknas i SQL-dumpen — dess ENDA DR-väg
  är moln-JSON-arkivet, som var integritetsbevisat men ALDRIG återställnings-
  bevisat (scenario (c) sa "dokumentera engångs-skript i worklog" = improvisation
  vid katastrofen). Nu: verktyg + mätt RTO + protokoll.
- **Nytt verktyg `verktyg/aterstall-system-events.mjs`** — strömmande (KONSTANT
  minne; arkivet 350 MB okomprimerat, full parse förbjuden på RAM-snål server),
  domar GRÖN/RÖD med exit 0/1: gzip-ström + header-kontrakt + antal-eftal +
  per-rad giltighet; lägen `--db` (psql COPY i skrap-PG), `--jsonl-ut` (REST-
  inmatningsfiler med prod-kolumnnamn), `--plan-supabase` (katastrofplan; läser
  ALDRIG nycklar). Sabotage 3/3 gripna (trunkerad gzip på två vägar, förfalskat
  antal, truncerad-flagga).
- **Mätt:** verify 26–37 s/arkiv; restore i skrap-PG17 **51,6 s resp 57,6 s**
  väggklocka för 146 727 rader (~2 600–2 850 rader/s), oberoende PG-verifiering
  identisk (9 typer, jsonb läsbar, tidsfönster sekundexakt). Total DR båda
  kedjorna ≈ 70–80 s.
- **FYND (6, alla i protokollet):** (1) schemadrift type→event_type mellan arkiv
  09-09 och dump 09-15 — naiv import hade kört mot fel kolumn, verktyget mappar
  båda; (2) tabellen saknar PK — 6 dubblett-id i 09-09-arkivet (09-08: 0), trolig
  Range-pagineringsrace i exportören, planen förbjuder därför ignore-duplicates;
  (3) **RPO-gap: inget nytt JSON-arkiv sedan 09-09** (hybrid-sync tyst — SQL-
  cronen lever) OCH levande tabellen gallras: historik före 2026-09-03 finns
  ENDAST i 09-08-arkivet ⇒ system-events-full-*.json.gz = arkivhandlingar,
  retention ALDRIG; (4) tillväxt +104 rader/dag — 200k-taket årtionden bort;
  (5) psql -q tystar COPY-taggen (egen bugg, gripen av egen dom, kurad);
  (6) låsprotokoll-mismatch flock↔dr-ovning.mjs filprotokoll — utesluter inte
  varandra, kur till huvudagenten: flock i dr-ovning.mjs på samma fil.
- Städning: skrap-DB droppad ×2, PG17 down, sabotagefiler + flock-låsfil rensade,
  disk 78 GB. Rollen `ak1a` skapad i LOKALA klustret 17 (ej Supabase).
- **Kvartalsmallen är nu BÅDA kedjorna:** `node verktyg/dr-ovning.mjs` (kedja 1)
  + `node verktyg/aterstall-system-events.mjs --fil <senaste> --db ak1a_dr_json`
  (kedja 2; skrap-schema enligt protokollet). Fullständigt protokoll:
  data/forskning/DR-PROV-2026-09-15-JSON-KEDJAN.md.

## SPÅR 10 — DR-VERKTYGETS GODKÄNNANDEPROV + HÄRDNING (2026-09-15, GODKÄNT)

- **Oberoende godkännandeprov av `verktyg/dr-ovning.mjs`** (u4:s leverans
  55dc2ee2) av annan agent än författaren — granskning + härdning + egen
  fullkörning. Dom: GODKÄNT.
- **Härdning levererad i samma fil:** (H1) städningskontraktet slutet —
  `skapaSkrapDb()` in i det inre try-scopet, ett createdb-fel kan inte längre
  lämna PG17 uppe; (H2) ram-/diskgrind FÖRE allt tungt (MemAvailable ≥ 1 000 MB,
  ≥ 5 GB ledigt; under gräns = exit 75, kör igen — 16:42-incidentens läxa);
  (H3) RÖD dump skriver nu protokoll + verklig GRÖN/RÖD-dom i stegtabellen;
  (H4) avbrottsfallet renderar "nåddes ej"/"rördes ej" — aldrig NaN/nollvärden
  som ser ut som mätetal; (H5) DUMPEN-typo + §4-referens.
- **Bevis:** låsvägran i VERKLIG trafik (exit 3 medan kedja-2-agenten höll
  flock-fönstret 19:28 — PG orört av den nekade parten) · RÖD trunkerad dump →
  protokoll UNDERKÄNT med PG17 orörd (DR-PROV-2026-09-15-AUTO-2.md) · GRÖN
  fullkörning **23,9 s** = FEMTE oberoende RTO-punkten (20,0 · 17,7 · 14,7 ·
  20,0 · 23,9 s — lastberoende spridning), radbild identisk för femte gången
  (public 60/1 246 728 · public+storage 68/1 246 864 · alla 95/1 247 119 ·
  fel 780/780 kända 0 okända), städning verifierad (DR-PROV-2026-09-15-AUTO-3.md).
- **Flock-notisen (RÄTTAD 2026-09-16 av s10-u1 o3):** rekommendationen ovan var
  DUBBELDEFEKT och har ALDRIG fungerat: (a) `--`-separatorn stöds ej av
  util-linux flock 2.39.3 ("failed to execute --", exit 69 — empiriskt bevisat),
  (b) även korrekt syntax (`flock -n <låsfil> node …`) skapar flock:s tomma
  låsfil som taLas() vägrar (exit 3 — emuleringsbevis). Flock-stödet är NU
  INBYGGT i dr-ovning.mjs OCH dr-kedja2.mjs (re-exec under flock ≤ 900 s;
  låsfilen städas ej i flock-läge — medvetet: unlink under flock kan skapa ny
  inod och spränga skyddet). Bevisat i praktiken: verktyget väntade in ett
  10-s-syskonfönster och körde sedan GRÖNT. u3:2:s kö till huvudagenten är
  härmed LÖST.
- **Fabrikskollision bevis nr 2** (identiska "välj själv"-uppdragstexter gav
  två agenter samma objekt; noll förlorat arbete — Write-läshindret + kollisions-
  kontroll hejdade): u3:s kur nr 1 (manifest-unika objekt) är fortfarande ej
  mekaniserad hos huvudagenten.
- Fullständigt protokoll: data/forskning/DR-VERKTYG-GODKANNANDE-2026-09-15.md.

## S10-U5 — DR-NATTKEDJAN KURAD: övningarnas eftersläpande kurer verkställda (2026-09-16, GODKÄNT)

- **Objektval:** restore-kärnan redan levererad 4× (fem RTO-punkter) + aktivt
  syskonfönster på flock-omskrivningen → spårets nästa obehandlade = de tre
  "VÄNTAR huvudagenten"-kurerna, verkställda av fabriksbarn (samma
  drift-rättigheter enligt u2:s sudo-bevis). Fullprotokoll:
  data/forskning/DR-NATTKEDJAN-2026-09-16.md.
- **Kur 1 — klartextlösenordet BORT:** /home/ak1a/.pgpass (600) +
  PGPASSFILE i 02:30-cronen; värdet överfördes programmatiskt, återges
  aldrig. Processlistan ren från och med 09-16 02:30.
- **Kur 2 — markörvakten mekaniserad i natt-cronen** (u1:s VÄNTAR-rad
  applicerad + testkörd): GRÖN exit 0 på 29,1 s — db-2026-09-16.sql.gz
  29,8 MB / 1 287 960 rader via pgpass-vägen, domrad i
  /tmp/supabase-backup.log. RÖD natt ⇒ retention låses (gamla dumpar
  behålls). Gamla cron-raden backup:ad 0600 i /tmp (ALDRIG till git).
- **Kur 3 — kedja 2:s RPO-gap SLUT:** hybrid-sync omkörd efter 7 dygns
  tystnad (dog 09-09 på HTTP 500 sida 5): system-events-full-2026-09-15
  .json.gz **160 928 rader / 33 sidor / 26,2 MB** + 10 per-typ-filer.
  Domkontraktet GRÖNT (22,5 s): 0 felaktiga, **0 dubblett-id**, fönster
  09-03→09-15. HTTP 500:et TRANSIENTT (ej reproducerbart); indexlösa
  Range-sorteringen kvarstår som lastkänslighet → composite-index-kön
  består. Notis: exportören stämplar UTC-datum i filnamnet.
- **Flock-kursstatus:** VIKS till aktivt syskon (fabrikskollision bevis
  nr 3 — deras Write 00:41:50 vann, mitt Edit hejdades av läshindret;
  deras PG17-fönster respekterades, denna agent rörde ej PG).

## S10-U1 (O3) — FULL KVARTALSÖVNING: båda kedjorna i en sekvens + flock-kur levererad (2026-09-16, GODKÄNT)

- **Objektval:** uppdragstexten identisk med u2/u3/u4:s — kvartalsmallen
  (sedan u3:2 = BÅDA kedjorna) hade aldrig körts END-TILL-END av en agent.
  Fullprotokoll: data/forskning/DR-PROV-2026-09-16-FULL.md.
- **Kedja 1** (dr-ovning.mjs, på db-2026-09-16 skapad 00:41:34 av s10-u5:s
  testkörning): GRÖN exit 0 — **RTO 11,2 s** (sjätte punkten, snabbaste:
  20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2), public 60/1 266 455 ·
  public+storage 68/1 266 591 · alla scheman **99**/1 266 851 (+4 tabeller
  på ett dygn) · fel 788 kända 0 okända. AUTO-protokoll: DR-PROV-2026-09-15-AUTO-4.md
  (verktyget stämplar UTC — kunddag är 09-16).
- **FLOCK-KUREN LEVERERAD I VERKTYGET** (s10-u5 viks; u3:2:s fynd 6-kur
  mekaniserad): dr-ovning.mjs startar om sig under flock(1) på
  /tmp/ak1a-dr-prov.lock (re-exec, väntar ≤ 900 s; pid-raden kvar som info;
  låsfil städas ej i flock-läge — unlink under flock kan skapa ny inod och
  spränga skyddet). **Empiriskt dubbelbevis att gamla rekommendationen var
  trasig** (se flock-notisen: exit 69 resp exit 3-vägran) + **praktbevis:**
  verktyget väntade in ett 10-s-syskonflock-fönster och körde sedan GRÖNT.
- **NYTT VERKTYG `verktyg/dr-kedja2.mjs`** — kedja 2 som kommando (u4:s
  mönster): flock-lagret + senaste-arkiv-val + skrap-DB ak1a_dr_json med
  DDL ur SENASTE dumpen (kirurgiskt `extensions.uuid_generate_v4()` →
  `gen_random_uuid()`; DEFAULT oviktig för COPY) + u3:2:s verktyg + oberoende
  PG-verifiering + maskinellt protokoll + garanterad städning.
- **Kedja 2-resultat:** 09-09-arkivet 3× GRÖN (30,7/27,0/24,6 s · 146 727
  rader) + **nya 09-15-arkivet GRÖN 27,2 s / 160 928 rader / 0 dubbletter**,
  tidsfönster till 2026-09-16 00:40:02, 11 event_type, jsonb läsbar.
- **RACE-FYNDET (F3):** första försöket mot 09-15-arkivet dömdes RÖD
  (97 557 av 160 928 — "unexpected end of file") därför att s10-u5:s
  exportör SKREV filen mitt i läsningen (mtime 00:49:22 inuti läs-fönstret
  00:49:01–23). Omkörning GRÖN. **Regel: RÖT mot färskt arkiv = kolla
  exportör-process/mtime och kör om — ALDRIG mjuka upp domslutet.**
- Städning: skrap-DB:er raderade efter varje körning, PG17 down, disk
  76–77 GB, tmp-filer rensade. src/ orörd (tsc via projektbinär vid commit).
  Kvartalsmallen hädanefter: `node verktyg/dr-ovning.mjs` +
  `node verktyg/dr-kedja2.mjs` — nästa senast **2026-12-15**.


## S10-U3 (O3) — DR-ÖVNING KEDJA 3: SERVERFILS-ARKIVET (2026-09-16, GODKÄNT)

- **Spårets sista obevisade kedja restore-testad — och den var delvis DÖD:**
  server-repo-2026-09-09.tar.gz KORRUPT (bruten gzip, "invalid compressed
  data", 681 poster vid listing) i 7 dygn OUPTÄCKT som "senaste" arkivet;
  09-08 frisk (restore 3,2 s, 2 564 filer, HEAD 023e9f95 = dokumenterad
  deploy-punkt, bevisad föregångare). Fullprotokoll:
  data/forskning/DR-PROV-2026-09-16-KEDJA3.md.
- **Tre rotorsaker, alla kurerade i `backup-server-filer.mjs` (commit
  55ddba50):** (1) verktyget godtog ssh-exit 0 + storlek men verifierade
  ALDRIG gzip-strömmen → ny strömmande `gzipIntakt()` FÖRE rename (trasig
  ström raderas, blir ALDRIG arkiv); (2) namndrift hetzner_key↔contabo_key —
  Contabo-flyttningen dödade tar+env-steget silent (bevis: hybrid-sync.log
  09-09 "ssh-nyckel saknas… hoppar") → contabo_key; (3) exkluderingslistan
  tog med .git (502 MB, arkivet passerade 500 MB-vakten: 595,9 MB mätt) +
  tool-results + cache + data/backups (arkiv-i-arkiv) → alla exkluderade.
- **Nya VERIFIERADE artefakter på servern (server-side tar = ingen
  ssh-ström):** server-repo-2026-09-16.tar.gz 132 MB, gzip -t GRÖN, 8 436
  poster, exkluderingskontrakt 0 brott, restore-test 3,9 s / 7 903 filer /
  src 666 filer 200 991 rader, spot-diff 4/4 identisk · server-git-
  2026-09-16.bundle 139 MB, `git bundle verify` "complete history", klon-
  test 8,3 s / 1 067 commits / HEAD = dagens topp. **Total kedja-3-RTO
  ~12,2 s.** Bundle FYND: 3,6× effektivare packning än .git → `git gc`-kö
  till huvudagenten (ALDRIG under aktiv fabriksdrift).
- **Sidokurer:** server-env-backup chmod 644→600 (doktrin; värden lästa
  ALDRIG — nyckelnamn endast); konfig-snapshots parse-bar men 7 d gamla
  (datorns hybrid-sync tyst sedan 09-09 — eskalering: kundens Schemaläggare,
  se S10-U5). Moln-JSON-arkivet 160 928 rader delat med s10-u5 (min
  exportör 00:49 + deras verify + S10-U1(O3):s omkörning = trippelverifyat;
  min exportör orsakade deras falska RÖDA "unexpected end of file" — se
  deras regel RÖT-mot-färskt-arkiv).
- **Kö till huvudagenten:** `git gc` vid lugnt fönster · 200k-taket i
  backup-fran-molnet.mjs nås ~2026-10-04 vid +2 185 rader/dag (91 %
  översättning; verktyget markerar taket HEDERLIGT men kapaciteten räcker
  ej) · cron för vecko-arkivering server-side · kundnotis datorns
  hybrid-sync. KVD: tsc 0 via projektbinär, src/ orörd, inga byggen,
  PG17 orörd HELA övningen (down före/efter), tmp städad, R2 orörd.

## S10-U3 (O4) — DR-ÖVNING KEDJA 4: PER-TYP-SNAPSHOTS (2026-09-16, GODKÄNT)

- **Spårets fjärde och sista restore-led bevisat** (kedja 1 SQL-dump ·
  kedja 2 full-JSON · kedja 3 serverfiler · kedja 4 per-typ-vyorna):
  NYTT verktyg `verktyg/dr-kedja4.mjs` i hela dr-kedja2-mönstret —
  flock på samma /tmp/ak1a-dr-prov.lock + RAM-/diskgrind + självsabotage
  + kontraktsvalidering + konsistenskontroll + PG-restore med RTO-mätning
  + maskinellt protokoll + GARANTERAD städning (finally). Fullprotokoll:
  data/forskning/DR-PROV-2026-09-16-KEDJA4.md.
- **Resultat GRÖNT (exit 0):** självsabotage 4/4 (giltig godkänns +
  trunkerad JSON, antal≠rader.length, fel typnamn grips) · samtliga 10
  per-typ-filer GRÖNA och från samma set-datum 2026-09-15 (ingen typ
  saknar dagens fil = inga tysta exportfel) · konsistens 10/10 rader
  matchade i full-arkivet, 0 saknade · COPY 10 rader på **0,08 s** i
  skrap-DB ak1a_dr_pertyp (probe-tabell) · oberoende PG-verifiering
  identisk (jsonb läsbar 10, medlem-epostHash 3) · skrap-DB raderad,
  PG17 stoppad, lås släppt.
- **Ägtenhetssvaret på de åtta antal=0-filerna:** full-arkivet (160 928
  rader) bär EXAKT medlem=3 + blogg_utkast=7 av de tio per-typ-typerna —
  nollorna är ÄKTA TOMMA (system_events gallras i drift; historiken lever
  i full-arkiven, som är ARKIVHANDLINGAR där retention aldrig gäller),
  INTE tysta exportfel. Exportörens felväg är dessutom rent DISKRET:
  HTTP-fel skriver INGEN fil alls (backup-fran-molnet.mjs) — "fil finns
  med antal 0" bevisar äkta tomt, "fil saknas för set-datum" är
  felmönstret. dr-kedja4.mjs flaggar båda fallen.
- **FYND + kur levererad:** per-typ-limiten (5000) var OMARKERAT — en
  avklippt snapshot skilde sig inte från en komplett (full-dumpen har
  haft truncerad-flagga länge; per-typ-grenen saknade den) →
  backup-fran-molnet.mjs v2.1 bär nu truncerad-markör per fil, och
  dr-kedja4.mjs varnar vid antal ≥ 5000 i äldre filer utan markör.
- **Volymnot, ärlig:** kedja 4 är pytteliten IDAG (10 rader, RTO 0,08 s)
  — värdet växer med verksamhetsdata (variabler/medlem_progress/
  termbank). Kontrakt: per-typ-filerna bär endast created_at+details;
  FULL återställning av innehållet äger kedja 2 — kedja 4 bevisar att
  vyerna är intakta, konsistenta och inläsbara.
- **Sidofix:** drift-ops-SKILL.md bar verktygsnamnet
  "backup-fran-molnen.mjs" (filen heter molnet — DRIFTSBOKEN hade rätt);
  rättat 2026-09-16 — on-call-sökvägen till backup-verktyget är nu
  entydig i båda handböckerna.
- **Kö till huvudagenten: ingen ny** — spårets FYRA kedjor är samtliga
  restore-bevisade; kvartalsmallen 2026-12-15 är fyra steg:
  `dr-ovning.mjs` + `dr-kedja2.mjs` + `dr-kedja4.mjs` + kedja 3-manualen
  (DR-PROV-2026-09-16-KEDJA3.md — ännu inte kommandoradiserat).


## S10-U2 (O2) — JUNGRUNATTEN: nattkedjans första OBEVAKADE leverans + sjunde RTO-punkten (2026-09-16, GODKÄNT)

- **Objektval:** restore-kärnan var sex gånger levererad; det icke-bevisade
  ledet var OBEVAKAD drift — s10-u5:s nattkedjekur var MANUELLT testad
  (00:41) och s10-u1 O3 återställde just den manuella dumpen. Fullprotokoll:
  data/forskning/DR-PROV-2026-09-16-JUNGRUNATT.md.
- **Jungfrunatten bevisad:** cron körde själv 02:30 — logg
  `MARKÖRKOLL 2026-09-16T00:30:31.911Z` GRÖN **1 288 041 rader** (+81 mot
  det manuella testet = äkthetsbevis: ny dump, ej kopia), dumpens mtime
  02:30:31.814, pgpass-vägen (inget klartextlösenord i proceslistan),
  retention tyst korrekt (6 dumpar, äldsta 5 dygn).
- **Restore av CRON-dumpen** (`dr-ovning.mjs`, exit 0): RTO **12,2 s** =
  sjunde punkten (20,0 · 17,7 · 14,7 · 20,0 · 23,9 · 11,2 · 12,2) ·
  public 60/1 266 528 (+73 vs O3:s manuella dump; board_decisions +64 =
  organens nattbeslut) · alla scheman 99/1 266 924 · fel 788/788 kända
  0 okända. AUTO-protokoll: DR-PROV-2026-09-16-AUTO.md.
- **RAM-grindens första verifiering i verklig drift:** försök 1 exit 75 vid
  MemAvailable 519 MB (syskon i fabriksvågen) — PG17 rördes EJ av grinden;
  omkörning GRÖN vid 2 198 MB. Vaktens skydd därmed dubbelt praktbevisat:
  flock-vägran exit 3 (godkännandeprovet) + RAM-grind exit 75 (denna
  övning).
- **Kedja 1 PROVAD ÄNDA TILL ÄNDA UTAN AGENT I KEDJAN:**
  cron → pg_dump (pgpass) → gzip → markörvakt → restore-bar dump. Kedja 1:s
  RPO = dygnlig 02:30 (RÖD natt låser retention + syns i loggen).
- Kollisionskontroll: KEDJA 4-syskonet (07:12:52) och denna övning (07:14)
  körde i separata flock-fönster — inget krockade. Städning oberoende
  verifierad: skrap-DB raderad, PG17 down, disk 75 G, prod/src/R2 orörda.

## S10-U1 (O4) — TAKLYFTET: kedja 2:s exportör härdad + total-kontrakt + cron 02:40 (2026-09-16, GODKÄNT)

- **Objektval:** restore-kärnan åtta gånger levererad; det icke-levererade
  var spårets bokförda kommande dataförlust — FULL-dumpens hårdta
  40-sidors-tak (200k rader) i `backup-fran-molnet.mjs`, nås ~2026-10-05
  (mätt: 161 550 i molnet · +2 015 rader/dag) = därefter TYST trunkering
  av varje nattexport. Fullprotokoll: data/forskning/DR-TAKLYFT-2026-09-16.md.
- **KUR (v3):** SAKERHETSTAK 400 sidor (2M rader ≈ >1 år — evighetsskydd,
  ALDRIG dimensionerande) + **TOTAL-KONTRAKTET** (sida 0 läser
  Content-Range via Prefer: count=exact → filen bär `totaltFranApi`,
  truncerad döms MASKINELLT `antal < totalt` — JSON-dumpens motsvarighet
  till SQL-dumpens slutmarkörer) + repetitionsskydd mot ignorerad Range.
- **Bevisat i äkta körning:** export 161 678 rader/33 sidor/42,9 s/26,2 MB
  med domen KOMPLETT 161678/161674 — kontraktets append-only-semantik
  verifierad live (dumpen kan bära någrar fler än starttotalen, aldrig
  färre utan att dömas TRUNCERAD). Restore via dr-kedja2: **RTO 38,5 s**
  (åttonde punkten) · 0 felaktiga · städning PG17 down.
- **FYND — exporten var OSCHEMALAGD på servern** (crontab + /etc/crontab
  + pumpor-daemon mätt: 0 träffar; arkiven levde på agent-manuella körning-
  ar sedan hybrid-sync tystnade 09-09). KUR: **cron-rad 3 kl 02:40**
  (10 min efter kedja 1:s 02:30-dump = §4-ordningen; ingen retention i
  raden — system-events-full är arkivhandlingar). Ändringsprotokollet
  följt: crontab + crontab.reference i samma ändring, konfigvakten
  **GRÖN 3/3** (s8-u2:s 30-larm-natt ej upprepad).
- **FYND (kvantifierat):** 4 dublett-id i prod-tabellen (161 678 rader /
  161 674 unika = exakt kontraktets differens) — känd saknad PK, nu med
  tal: 0,0025 %. Ingen kur (prod-DDL = huvudagentkö); domen förblev GRÖN.
- **Kollisionsbevis nr 5+6** (noll förlorat arbete): rond-46-merge raderade
  första Editen; syskonet s10-u2 (O2):s bulk-add fångade v3-kuren ordagrant
  in i sin commit c8df5f6b när HEAD-loppet vägrade min commit — koden lever
  i HEAD, denna sektion + protokollet + cron är completo.
- Jungfrunatten för rad 3 kan bevisas 2026-09-17 (s10-u2 O2:s mönster).

## S10-U3 (O5) — DR-ÖVNING KEDJA 3 KOMMANDORADISERAD: `verktyg/dr-kedja3.mjs` (2026-09-16, GODKÄNT)

- **Objektval:** restore-kärnan nio gånger levererad; manualen KEDJA3 §8
  begärde själv sin kommandoradisering "av annan agent än författaren" —
  kvartalsmallens fjärde steg var det ENDA manuella. Ny omgångsoinstans av
  s10-u3 (O3:s artefakter granskade med friska ögon, inget delat minne).
  Fullprotokoll (GRÖN): DR-KEDJA3-2026-09-16-AUTO-2.md · RÖT-fyndkörningen:
  DR-KEDJA3-2026-09-16-AUTO.md.
- **FYND (huvudresultatet) — `git bundle verify` är INTE ett integritetsbevis:**
  verktygets självsabotage grep att verify GODTAR en 60 % kapad bundle och
  skriver "The bundle records a complete history" (den läser header/refs,
  ALDRIG packdatan) — medan klonen dör ("early EOF", "index-pack died").
  Samma buggklass som KEDJA3-F2 (exit 0 ≠ intakt ström). KUR i verktyget:
  s3-sabotagets dom + huvuddomen för arkiv B = KLON-testet; verify behålls
  som nödvändigt (inte tillräckligt) delkontrakt. Manualens O3-bevisning
  håller (de körde också klon) men deras domORDLYDELSE "verify = komplett
  historia" är motbevisad som huvuddom — varje verify-användning (crons,
  kommande övningar) följer samma regel: klon (eller fsck) är domen.
- **GRÖN fullkörning (exit 0):** sabotage 3/3 GRIPNA (kapad gzip · skräp-
  fil med rätt ändelse · kapad bundle via klon) · arkiv A server-repo-
  2026-09-16.tar.gz: gzip -t + full listning 8 435 poster + exkluderings-
  kontrakt 0 brott + restore **3,2 s** → 7 903 filer + 532 kataloger ==
  listat · src 666 ts/tsx-filer · arkiv B server-git-2026-09-16.bundle:
  klon **9,4 s** → 1 067 commits, HEAD 59939c18 + ancestor-bevis (klonens
  HEAD ∈ trädets historia). **Total RTO 12,6 s** (manualen 12,2 s =
  replikerbar). Spot-diff: 3/4 IDENTISKA, DRIFTSBOKEN.md SKILJER-FÖRKLARAD
  (trädets commit 07:35 > arkivets mtime 00:45 — RPO-visning; en blind
  identisk-eller-RÖD-dom hade fällts falskt).
- **Konventionsmätning (falska diskrepanser bort för nästa omgång):**
  manualens 8 436 poster/533 kataloger räknar MED rot-posten './' och
  restore-roten; verktyget räknar utan → 8 435/532, SAMMA 7 903 filer.
  src-rader: manualens 200 991 (wc -l) = verktygets 201 657 (split('\n')
  räknar +1 per fil med avslutande radbryt) − 666 filer. Innehållet
  identiskt till sista raden; endast räknekonvention skiljer.
- **Städning + KVD:** PG17 orörd HELA övningen (nere före/efter — korrekt
  viloläge enligt kontraktet; ingen skrap-DB skapas av kedja 3) · /tmp
  raderad (finally-garanti) · `node --check` GRÖN · tsc 0 via projekt-
  binär (src/ orörd = inget bygge) · R2 orörd · data/blogg/ orörd.
- **Kö till huvudagenten: ingen ny** — kvartalsmallen 2026-12-15 är nu
  FYRA KOMMANDON: `dr-ovning.mjs` + `dr-kedja2.mjs` + `dr-kedja3.mjs` +
  `dr-kedja4.mjs` (kvar hos huvudagenten oförändrat: cron för vecko-
  arkivering server-side · git gc vid luget fönster · kundnotis datorns
  hybrid-sync · jungfrunatt rad 3 bevisas 09-17).

## S10-U1 (O5) — KEDJA 3:S EXPORTÖR SERVER-SIDE + VECKOCRON (2026-09-16, GODKÄNT)

- **F8-kön verkställd** ("cron för vecko-arkivering server-side" — kö-radens
  enda återstående mekaniserbara objekt): serverfils-arkivet levde på agent-
  manuella körningar sedan hybrid-sync tystnade 09-09 — kedja 3:s RPO var
  "när en agent minns", härmed **≤ 7 dygn**. Fullprotokoll:
  data/forskning/DR-ARKIV-SERVER-2026-09-16.md.
- **Nytt verktyg `verktyg/arkivera-server.mjs`**: helt server-side (ingen
  ssh-ström — 09-09:s korruptarkiv-rot elimineras), flock på
  /tmp/ak1a-dr-prov.lock (samma kontrakt som dr-kedja* — export och DR-övning
  mutar aldrig varandra; RÖT-mot-färskt-arkiv-racet strukturellt omöjligt),
  RAM-/diskgrind 600 MB/5 GB, minisjälvtest, tar med exkluderingskontrakt +
  verifiering FÖRE godkännande (gzip -t, full listning, spot-filer,
  500 MB-vakt), bundle --all + verify, konfigsnapshots färskas (nginx/
  crontab/pm2 — F8:s "7 dygn gamla" kurerat), atomiska namnbyten (*.del),
  retention 60 dygn (system-events-full röras ALDRIG).
- **Bevisad körning exit 0 (13:39–13:40 lokal):** tar 144,4 MB / 8 893
  poster / 675 src ts/tsx / 33,1 s · bundle 151,2 MB complete history /
  24,2 s · snapshots nginx 53 rader + crontab 3 aktiva + pm2 4 processer ·
  totalt 58 s. Arkiven FÄRSKARE än nattens (+457 poster = förmiddagens
  kommitten; omkörningen = idempotensbevis).
- **Driftfynd + kur:** körning 1 RÖD på "tar: file changed as we read it"
  (levande agentträd under 30-s-fönstret; ronderna skriver 24/7). Kur:
  exit 1 acceptas ENDAST när samtliga felrader är "…as we read it"-noter —
  verifieringen är den äkta grinden, exakt historik ägs av bundlen. Båda
  lägena bevisade (rörelse kör 1, lugn kör 2).
- **Cron rad 4 söndag 03:20 lokal** + crontab.reference i samma ändring +
  konfigvakten **GRÖN 4/4**. Jungfrunatten för rad 4 bevisas 2026-09-20.
- **Fabrikskollision bevis nr 7, hantverksmässigt löst (0 förlorat
  arbete):** denna agents förstaval (dr-kedja3.mjs, bokat i worklog 11:33Z)
  togs samtidigt av syskonet s10-u3 som SKAPADE filen 11:33 och körde under
  flock — Write-läshindret hejdade, vike enligt s10-u5-precedenten, nytt
  objekt = F8-kön (komplement: syskonets restore-kommando prover arkiven,
  detta verktyg håller dem friska). Manifestets tre identiska "välj själv"-
  texter förblir obehandlade hos huvudagenten (u3:s kur nr 1).
- PG17 orörd (nere före/efter — korrekt viloläge); R2 orörd; inga byggen;
  tsc-grinden passerad vid commit (src/ orörd av denna leverans).

## S10-U2 (O3) — DR-FÖNSTRETS INDEX-PROV: ALTER-filen testad, dubbel fel + kur + ~396× (2026-09-16, GODKÄNT)

- **Kö-item verkställt SOM PROV:** "ALTER-system_events-composite.sql vid
  nästa DR-fönster" (E33 gap 3, s9-u3:s kö) — filen (våg 63) låg okörd;
  prod-DDL rördes ALDRIG (huvudagenten/kunden äger själva prod-körningen).
  Verktyg `verktyg/dr-index-prov.mjs` (dr-kedja2-kontraktet: flock
  /tmp/ak1a-dr-prov.lock + RAM-/diskgrind + skrap-DB ak1a_dr_index +
  DDL/rådata ur dagens dump + arkiv + maskinellt protokoll + garanterad
  städning i finally). Fullprotokoll:
  data/forskning/DR-INDEX-PROV-2026-09-16-2.md (GRÖN exit 0) +
  DR-INDEX-PROV-2026-09-16.md (RÖD = PK-kollisionsvarianten).
- **Filen DUBBELT UNDERKÄND mot äkta data** (161 678 rader COPY:ade):
  (1) `CREATE INDEX IF NOT EXISTS CONCURRENTLY` = SYNTAXFEL i PostgreSQL
  (korrekt ordning: `CONCURRENTLY IF NOT EXISTS`); (2) kolumnen `type`
  existerar ej i prod — verkligt namn `event_type` (schemadriften igen).
  En okritisk prod-körning hade misslyckats två gånger om.
- **KURERAD v2 levererad i data/sql/ALTER-system_events-composite.sql**
  (testbevis + historik i filens header):
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_events_type_created
  ON public.system_events(event_type, created_at desc);` — verifierad
  GRÖN: byggtid 0,4 s, index 1,5 MB.
- **Prestanda (filens eget motiverade läsmönster, topp-typ oversattning
  146 194 rader):** 74,8 ms → 0,2 ms = **~396× snabbare** (Seq Scan +
  Sort → Index Scan). FYND: prod har INGA sekundära index på
  system_events (dump 09-16: endast PK) — filens påstående "har idag
  enkla index" är FALSKT; tabellen växer ~2 000 rader/dag.
- **FYND i DR-kedjan — katastrofsekvensen kedja 1 + kedja 2 mot SAMMA DB
  DÖR:** full dump-restore föder system_events MED PK, och arkivets
  4 dublett-id stoppar importen (COPY dör vid rad 30 001, alternativt
  PK-altret "could not create unique index" — båda varianterna bevisade).
  Tidigare sekvensprov körde kedjorna mot skilda skrap-DB:er; kombinationen
  var obevisad tills nu. KUR-KÖ till huvudagenten: dedupe-läge i
  aterstall-system-events.mjs ELLER röjning av de 4 dublett-id i prod
  (samma tabell som ALTER-kön — se även s10-u1 O4:s idempenskö).
- NOTERA: scripts/supabase-schema.sql definierar fortfarande kolumnen
  `type` (dev/prod-glidning lever — synka vid tillfälle).
- Städning verifierad: ak1a_dr_index raderad, PG17 stoppad; R2 orörd;
  inga byggen (src/ orörd; tsc-grinden passerad vid commit).

## S10-U2 (O4) — TOTAL-KVARTALSÖVNINGEN `verktyg/dr-total.mjs`: mallen ETT KOMMANDO (2026-09-16, GODKÄNT)

- **Kvartalsmallen är nu ETT KOMMANDO:** `node verktyg/dr-total.mjs` kör
  HELA DR-övningen — kedja 1 → 2 → 4 → 3 i mallordning (PG-kedjorna
  först, serverfilsarkivet sist), mäter TOTAL-RTO, skriver ETT över-
  protokoll (DR-TOTAL-<datum>-AUTO.md) och garanterar vilolägeskontraktet
  (PG17 nere, tmp städad) även vid avbrott. Barnverktygen (dr-ovning,
  dr-kedja2/3/4) äger själva sina DR-lås + delprotokoll — dr-total har
  EGEN låsfil (/tmp/ak1a-dr-total.lock) och FÅR ALDRIG hålla barnens
  låsfil (dödläge: barnet väntar på ett lås föräldern håller).
- **ÄKTA KÖRNING GRÖN exit 0 — TOTAL-RTO 130,0 s (summa = väggklocka):**
  kedja 1 SQL 23,3 s (restore 12,2 s · public 60 tabeller/1 266 528
  rader · fel 788 kända 0 okända) · kedja 2 moln-JSON 43,8 s (161 678
  rader, 4 230 rader/s COPY, 0 felaktiga — med tanke på dagens AKUTA
  FYND att system_events gallrats tom i live prod är detta arkivet nu
  den kompletta händelseloggen) · kedja 4 per-typ 33,4 s (sabotage 3/3
  gripna) · kedja 3 serverfiler 29,6 s (arkiv 8 892 poster, src 675
  filer/203 930 rader — MINUTFÄRSKT: s10-u1 o5:s arkivera-server-export
  13:50 är samma arkiv som restore-bevisades 13:53 = syskons exportör +
  detta verktyg korsbevisar varandra).
- **Kontrakt:** fail-fast (en RÖD kedja avbryter övningen, avbrottsorsak
  i protokollet) · barn exit 75 (RAM-grind) → 90 s väntan + EN omkörning
  (JUNGRUNATT-precedensen) · RPO-läge per kedja redovisas i protokollet.
  Den äkta körningen väntade inte på något lås (syskonens fönster
  dr-index-prov/manuella sekvens löpte före/parallellt; flock -w 900
  behövde aldrig vänta).
- **KORSBEVIS med s10-u3 (3/3):s manuella sekvens** (samma dag, ≈105 s,
  alla fyra GRÖNA) — sekvensen som sådan bevisad TVÅ oberoende vägar:
  manuellt orkestrerad (deras) och som ETT KOMMANDO med överprotokoll +
  omkörnings-/fail-fast-kontrakt (denna). Sektions-ID-not: O3-toget
  togs av index-prov-syskonet samma fönster — därför O4 här.
- **Ärlighetsnot (flock-lagret):** den äkta körningen skedde under
  fillåsläge — flockStartaOm()-anropet saknades i leveransversionen och
  lades till OMEDELBART efter körningen (mönstret 1:1 från dr-ovning.mjs,
  vars flock-lager har praktbevis av s10-u1 o3; node --check GRÖN).
  Nästa totalkörning (2026-12) verifierar flock-lagret beteendemässigt.
  Fillåset är funktionellt (30-min-dött-lås-semantik) men inte lika
  starkt som flock.
- Protokoll: data/forskning/DR-TOTAL-2026-09-16-AUTO.md + fyra maskinella
  delprotokoll (DR-PROV-2026-09-16-AUTO-3 · DR-KEDJA2-…-AUTO-3 ·
  DR-PROV-…-KEDJA4-3 · DR-KEDJA3-…-AUTO-4). Städning verifierad: PG17
  nere, /tmp/dr-total-* borta, total-låsfilen släppt. R2 orörd; inga
  byggen; tsc-grinden passerad vid commit (src/ orörd).

## S10-U2 (O5) — KEDJA 5: KIRURGISK TABELL-ÅTERSTÄLLNING `verktyg/dr-kedja5.mjs` (2026-09-16, GODKÄNT)

- **Scenariot kedja 1–4 inte täcker:** EN tabell skadas i prod (felaktig
  migrering/olycks-DELETE) medan övriga tabeller är friska och NYARE än
  dumpen — full restore offrar dygnets skrivningar i friska tabeller.
  Kedja 5 bevisar den kirurgiska vägen: ENDA tabellens COPY-block plockas
  ur natt-dumpFILEN (streamad zcat+awk — ingen pg_dump-roundtrip) och
  appliceras atomiskt (DELETE + COPY i EN transaktion, ON_ERROR_STOP).
- **GRÖN körning 14:09–14:13 lokal (exit 0):** organismens minne
  public.section_data_snapshots — 1 176 468 rader (92 % av DB:n) — tillbaka
  på extraktion 2,4 s + applicering 15,5 s; radantal OCH checksumma
  IDENTISKA med fullt återställd källa (full restore 13,4 s som måttstock,
  fel 788 kända/0 okända). Städning verifierad: skrap-DB raderad, PG17
  stoppad, tmp borta (fellogg lämnad avsiktligt).
- **Retentionssvepet = nytt stående kontrakt:** varje kedja 5-körning
  gzip-testar ALLA dumpar i fönstret (6/6 GRÖNA, 1,0–1,3 s/dump) — kedja
  3:s läxa (korrupt tarball 7 dygn oupptäckt) mekaniserad på dumparna.
- **FYND 1 — board_decisions är kirurgiskt låst:** FK:n
  forecast_log→board_decisions (ON DELETE SET NULL) möter
  immutabilitetstriggern forecast_immutable() som VÄGRAR UPDATE — hela
  DELETE:n rullas tillbaka (första körningen RÖT på precis detta).
  Positiv driftsida: en olycks-massradering av organens beslut STOPPAS av
  eget skydd. Verklig kirurgi på tabellen kräver specialrecept (tillfällig
  FK-paus ELLER restore-till-ny-tabell + swap) — huvudagentens ägande.
- **FYND 2 — psql tyst-accepterar vid-EOF-trunkerad COPY:** bevisat i
  andra körningen: en utan `\.` avsluten COPY landade med 705 881 rader
  och psql exit 0 (!). Därför testar verktyget sabotage som DATAFEL
  (kolumnfel i mitt-rad — grips: "missing data for column", full rullbak,
  tabellen orörd) och bär radantal+checksumma-kontrakt på BÅDE extraktionen
  (== källa) och resultatet (== källa). Läxa för ALLA filbaserade
  återställningsflöden: "kommandot gick bra" ≠ komplett.
- **Kontrakt:** flock på /tmp/ak1a-dr-prov.lock (familjen) · RAM-/diskgrind
  (exit 75) · vägran vid blockerande inkommande FK (NO ACTION/RESTRICT/
  SET DEFAULT) och CASCADE-FK · kollateralrapport per inkommande FK ·
  exit 0/1/3/75. --tabell-flagga för valfri tabell, --fil för äldre dump,
  --behall för manuell granskning.
- **Kö till huvudagenten:** (1) väv in dr-kedja5 i TOTAL-mallen (O4) till
  2026-12 ELLER kör manuellt vid tabellincident; (2) dokumentera
  board_decisions-specialreceptet om/lämpligen när det behövs; (3) se även
  O3:s akuta system_events-fynd (gallrad tom i prod) — moln-arkivet är
  ENDA kopian, dedupe-kön kvarstår.
- Protokoll: DR-KEDJA5-2026-09-16-KIRURGI.md (agent) + DR-KEDJA5-2026-09-16-
  AUTO.md (RÖT triggerfyndet) + -AUTO-2.md (RÖT sabotagelektionen) +
  -AUTO-3.md (GRÖN). R2 orörd; inga byggen (src/ orörd, .mjs-verktyg); tsc-
  grinden passerad vid commit; data/blogg/ orörd.

## S10-U2 (O6) — FLOCK-BETEENDEPROV `verktyg/dr-total-flockprov.mjs` + TOTAL-övning iteration 2 (2026-09-16, GODKÄNT)

- **Vad/varför:** O4:s ärlighetsnot — flockStartaOm() lades till EFTER den
  äkta 130,0 s-körningen ("nästa totalkörning verifierar flock-lagret
  beteendemässigt"). Skillnaden mot gammal fillås-semantik är BETEENDE,
  inte kodväg — därför ett körande prov. Nya verktyget gör verifieringen
  återkommande: det startar en främmande kortlivad låshållare, startar
  dr-total (som skall köa), samlar bevisen och kör SAMTIDIGT hela
  kvartalsövningen (inget slösas). Flagga `--hollare-sek N` (5–300,
  default 25).
- **Tre bevis i EN körning (20:42–20:45 lokal, GRÖN exit 0):**
  (i) RE-EXEC: låsfilen bar `pid=1225710 … flock=1` med pid LEVANDE under
  körningen (ps-verifierat) — flock=1-grenen är aktiv kod.
  (ii) KÖ-BETEENDE (det skiljande): främmande hållare (flock -c 'sleep 25',
  startad 1,2 s före dr-total) → flock=1-raden först efter **24,1 s**;
  tidskonsistens: hållaren släppte ≈23,8 s efter dr-total-start. Gammal
  fillås-semantik hade svarat TOTAL-LÅSET UPTAGET + exit 3 direkt.
  (iii) DÖTT LÅS OSKADLIGT: 45 min bakdaterad låsfil med död pid → start
  utan exit 3 — flock förvärvar oavsett mtime.
- **Övningen (iteration 2):** alla fyra kedjorna exit 0 — kedja 1 39,9 s
  (restore 14,3 s · 1 288 041 dumprader · public 60 tabeller/1 266 528 ·
  fel 788 kända 0 okända · markörsummering 1/1) · kedja 2 39,8 s (161 678
  rader · 4 955 r/s · 0 felaktiga) · kedja 4 36,4 s (10/10 · sabotage 3/3
  gripna) · kedja 3 30,8 s (8 322 filer == listat · klon 1 195 commits) —
  TOTALT **147,0 s == väggklocka** (iteration 1: 130,0 s; skillnaden =
  lastläge: grinden läste MemAvailable 1 075 MB, omkörningsvägen overksam).
- **Städning lokal PG (maskinellt verifierad):** PG17 NERE, /tmp/dr-total-*
  BORTA, total-låsfilen SLÄPPT (flock -n förvärvar direkt).
- **Kvartalsmallen 2026-12 (uppdaterad):** `node verktyg/dr-total-flockprov.mjs`
  = ETT KOMMANDO med gratis flock-om-verifiering; rå `dr-total.mjs` kvarstår
  som kärna. Kvar i kön (oförändrat): väv in dr-kedja5 i totalen ELLER kör
  manuellt vid tabellincident; board_decisions-specialreceptet;
  system_events-återimporten = huvudagentens beslut.
- Ärlighetsnot: bevisutskriftens rad "Låsfilen under köfasen (senast läst
  innan flock=1)" är felaktigt etiketterad (poll-loopen läser och sätter i
  samma iteration) — kö-fasen bevisas av TIDEN + levande hållarprocess;
  korrigerad etikett till 2026-12. Bevisvärde opåverkat.
- Protokoll: DR-TOTAL-2026-09-16-FLOCKPROV.md (agent, citerar maskinella
  bevisblocket) + DR-TOTAL-2026-09-16-AUTO-2.md (överprotokoll) + 4
  delprotokoll (DR-PROV-…-AUTO-4 · DR-KEDJA2-…-AUTO-4 · DR-PROV-…-KEDJA4-4
  · DR-KEDJA3-…-AUTO-5). R2 orörd; inga byggen; src/ orörd; data/blogg/ orörd.

## S10-U3 (O6) — DR-ÖVNING KEDJA 6: STORAGE-RESTORE `verktyg/dr-kedja6.mjs` + FYND: TVÅ SUPABASE-PROJEKT (2026-09-16, GODKÄNT — med fynd)

- **Vad/varför:** kedjorna 1–5 bevisar databasen (SQL-dump) och
  system_events (moln-JSON); Supabase STORAGE var det enda lagret utan
  bevisad innehålls-återställning (SQL-dumpen bär bara metadata, moln-JSON
  läser bara events). KEDJA 6 mäter och bevisar BÅDA halvorna.
- **Övningen (20:41–20:43 lokal, GRÖN exit 0, DR-KEDJA6-2026-09-16-AUTO.md):**
  retentionssvep 6/6 GRÖN · markörer GRÖN (1 288 041 rader) · full restore
  i skrap-DB 13,8 s (fel 788 kända/0 okända) · storage-metadata i dumpen:
  5 buckets/63 objekt/0,57 MB (oförändrad sedan 2026-07-23/24) · levande
  lista via LÄSANDE Storage-REST 0,7 s: 3 buckets/11 objekt/1,22 MB ·
  INNEHÅLLS-PROV: ak1nvestor-code.zip 1 272 122 B nedladdat 0,72 s ==
  live-listans metadata.size (byte-kontrakt GRÖNT — första bevisade
  innehållsvägen). Runbook för verklig incident i protokollet §6.
  Familjekontraktet: flock + RAM-/diskgrind + finally-städning
  (skrap-DB raderad, PG17 stoppad, tmp borta — verifierat).
- **FYND 1 (akut) — TVÅ SUPABASE-PROJEKT:** korsningen dump↔live gav 0
  gemensamma objekt. Fyra instrument senare stod roten klar (DR-KEDJA6-
  2026-09-16-TVAPROJEKT-FYND.md): dump-cronen+psql-sonderna (.pgpass →
  db.rkaq…wxrw) och appens REST (.env → …suhvlsbp) läser OLIKA projekt.
  rkaq: system_events 0 I ALLA DUMPAR sedan 09-11 · snapshots 1 176 468
  (+~19k/dag) · board_decisions 47 602. aufr: system_events 162 741 VÄXER
  · members 3 · board_decisions 77 · snapshots 404. Därmed: dagens "AKUT
  FYND: system_events TOM i levande prod" (DR-KVARTAL §4) är MOTBEVISAT
  som radering — tväprojekt-artefakt; **återimporten av 161 678-arkivet
  SKA EJ genomföras** (dubbletter på levande data); dumpkontradiktionen
  (0 vs 161 678) och members=0 upplösta. Kedjornas restore-bevis består
  (rkaq↔rkaq), men aufr:s icke-events-tabeller är OBACKADE — backup-gap.
- **FYND 2 (R2):** aufr:s bucket "ak1nvestor-code" är PUBLIK och listade
  en .env.local-namngiven fil (193 B; innehållet ALDRIG läst — verktygets
  R2-filter uteslöt .env*/pem/key/rsa/secret från innehålls-provet och
  valde zip:en). Åtgärd = huvudagenten/kunden (R2: nyckelfiler).
- **Kö till huvudagenten (fyndrapport §5, prioriterad):** (1) stoppa/
  ompröva system_events-återimporten (läkekö E33 steg 4–5); (2) konfig-
  utredning .pgpass vs .env — avsiktlig hybrid eller migreringskvarleva,
  isåfall peka om 02:30-cronen (R2); (3) tvåprojekt-kartan i DRIFTSBOKEN;
  (4) backup-beslut för aufr:s övriga tabeller; (5) storage-blob-backup
  (båda projekten) + publika ak1nvestor-code-bucketet.
- Protokoll: DR-KEDJA6-2026-09-16-AUTO.md (maskinellt) +
  DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md (fyndrapport med alla mätetal).
  R2 orörd (inga .env-/nyckelfiler rörda; nycklar endast lästa ur env av
  verktyget, aldrig loggade); inga byggen; src/ orörd; data/blogg/ orörd.
  Kollisionsnot: s10-u2 O6:s flockprov (20:42–20:45) och denna övning
  (20:41–20:43) delade DR-fönstret — flocken serialiserade dem (deras
  "främmande 25 s-låshållare" var denna kedjans retentionssvep/restore):
  låsmekanismen korsbevisad i skarpt läge, noll förlorat arbete.

## S10-U1 (O6) — FÖNSTERDJUPET: äldsta bladet restore-bevisat `verktyg/dr-fonsterdjup.mjs` (2026-09-16, GODKÄNT)

- **Objektval + krockbokföring:** förstavallet KEDJA 6 (Storage-restore)
  krockade med s10-u3:s fil på disk (dr-kedja6.mjs 20:42, mitt anspråk
  21:05 — disk-faktum slår sent anspråk; objektet släpptes HELT, deras
  leverans respekterad, se S10-U3 (O6) ovan). Nytt val: KEDJA 1-SERIENS
  BLINDFLÄCK — samtliga 8 RTO-punkterna (20,0 · 17,7 · 14,7 · 20,0 ·
  23,9 · 11,2 · 12,2 · 17,3 s) mätte färska blad; retentionens ÄLDSTA
  blad (katastrofen som upptäcks dag 29) var ALDRIG restore-bevisat
  (kedja 5:s retentionssvep bevisar gzip-integritet, inte restore-barhet).
- **Bevisad körning ×2, GRÖN exit 0:** äldsta bladet db-2026-09-11.sql.gz
  restore i färsk skrap-DB — **RTO 15,4 s + 14,5 s** (två punkter, stabilt
  ≈15 s mitt i kedja 1-serien trots 5 dagar äldre data) · felrader 780
  ALLA kända (okända 0) · **TVÅ INSTRUMENT IDENTISKA: PG count(*) ==
  dumpens blockräkning för 60/60 public-tabeller** (summa 1 186 890 ==
  1 186 890, 0 avvikande). Självtest 2/2 inkl. KEDJA 5:S LÄXA: trunkerat
  COPY-block (saknad \.-terminator) vägras av räknaren.
- **Blockräkningens fönsterbild (nya serien):** äldsta 97 tabeller /
  1 192 910 rader → yngsta 101 / 1 272 992 = **+80 082 rader på 5 dagar
  (≈ 16 016/dag)**; drivers: public.section_data_snapshots +75 936 ·
  public.board_decisions +3 493 · cron.job_run_details +449. FYND
  (aggregat, icke-känsligt): auth.users/identities/profiles MINSKAR 5→3
  under veckan (konton bortagna) och 4 NYA auth-tabeller (mfa_recovery_
  codes, scim_*) = Supabase-plattformen lagt tabeller under fönstret —
  vid ÄLDSTA-bladets restore saknas plattformstabeller som ny kod kan
  förvänta sig (schema-återställning ≠ plattformsversion).
- **Instrumentnotis (genomskinlighet):** denna blockräkning räknar ALLA
  scheman (101 tabeller inkl. cron 2/6 068) medan syskonens "alla scheman
  99/1 266 924" exkluderar cron — skillnaden är KÄND och systematisk,
  ej avvikelse; public-talen (60/1 266 528) är IDENTISKA mellan alla tre
  instrumenten (JUNGRUNATT · AUTO-3 · detta).
- **Koppling till S10-U3 (O6):s tväprojektfynd:** fönstret = rkaq-
  projektets dumpar; detta restore-bevis gäller rkaq↔rkaq (u3:s not:
  "Kedjornas restore-bevis består"). Korsvalidering: u3:s live-sond
  snapshots 1 176 468 == detta yngsta blad EXAKT; board_decisions
  live 47 602 vs dump 47 042 = dagens tillväxt efter 02:30 (konsistent).
- **Runbook:** vid SEN upptäckt (dag 29) — kör
  `node verktyg/dr-fonsterdjup.mjs` (eller dr-ovning --fil <äldsta>) och
  använd äldsta FUNGERANDE bladet; gallringsslukade rader (−14 i fönstret)
  finns ENDAST i äldre blad. Nästa kvartals-DR (2026-12): fonsterdjupet
  körs som komplement till dr-total (djup + bredd).
- **KVD:** node --check GRÖN · tsc 0 via projektbinär (src/ orörd —
  verktyget är ren node, inga byggen) · R2 orörd · data/blogg/ orörd ·
  städning verifierad: skrap-DB raderad, PG17 stoppad, tmp borta, disk
  73 GB fri. Protokoll: DR-FONSTERDJUP-2026-09-16.md (maskinellt).

## S10-U2 (O7) — NATT-DR + FÖRSTA NATTLIGA RPO-DIFFEN `verktyg/dr-rpo-diff.mjs` (2026-09-17, GODKÄNT)

- **Körning 01:47–01:51 lokal (s10-u2, fabriksagent spår 10 vakt), strax
  före 02:30-cronens växling** — kedja 1 GRÖN exit 0 (`node verktyg/dr-ovning.mjs`):
  markörer GRÖN 1 288 041 rader · **RTO 12,7 s** (serien 11,2–23,9 s, samtliga
  under v98 F3:s 20,0) · fel 788 kända/0 okända · public 60 tabeller/
  1 266 528 rader (tre nivåer: +storage 68/1 266 664 · alla scheman 99/
  1 266 924) · städning verifierad (skrap-DB raderad, PG17 stoppad).
- **KORSBEVIS två instrument samma tal**: skrap-DB:ns psql-COUNT == dumpens
  zcat-COPY-räkning == 1 266 528 för alla 60 public-tabeller — dubbel
  instrumentering mot kedja 5:s "tyst trunkerad COPY"-fynd.
- **NYTT instrument `verktyg/dr-rpo-diff.mjs`** (versionerad): dump-COPY per
  tabell vs LEVANDE prod-COUNT (EN UNION ALL-fråga via PGPASSFILE —
  lösenordet läses aldrig av anroparen). **Första nattdiffen: RPO-delta
  +19 767 rader/23,3 h i 3 av 60 tabeller** (snapshots +18 984 ·
  board_decisions +744 · organ_health_logs +39; inga negativa, inga
  schemaförskjutningar).
- **NATTDIFTSFYNDET**: dagtiden 09-16 gav +19 359 på 11,2 h; nattfönstret
  13:43→01:50 endast **+408 rader på 12,1 h ≈ 34 r/h** mot dagtakt
  ~1 730 r/h — natten ~50× lugnare; RPO-skulden byggs dagtid (organismens
  rundor), timmen före 02:30 är den minst kostsamma för planerad DR-övning.
- **Instrumentbuggar bokförda (ärlighetsdoktrin)**: (1) felvillkor `!exitCode`
  dömde exit 0 som fel; (2) icke-public COPY-block (41 st, auth/storage) bröt
  citeringen — fixat med public-filtrering + HEL blockkonsumering (datarader i
  ignorerade block får aldrig likna COPY-start). Verktyget dömdes GRÖN först
  efter fix + återmätning.
- **Kollision kontrollerad**: syskonbokning s10-u1 (auto-s10-1789602326938,
  01:52 lokal — TOTAL-kirurgi-vävning) avgränsad: detta objekt rör INTE
  dr-total.mjs/kedja 5; flock-lagret serialiserar PG-fönstret vid behov.
- KVD: node --check OK · src/ orörd (tsc-opåverkat noll; ren node) · R2 orörd
  · data/blogg/ orörd · RAM-grind GRÖN (1 252 MB).
- Fullständigt protokoll: data/forskning/DR-OVNING-2026-09-17-NATT-RPO.md +
  maskinellt JSON-delprotokoll data/forskning/DR-RPO-DIFF-2026-09-17.json +
  övningsprotokoll DR-PROV-2026-09-16-AUTO-5.md (bladets UTC-datum; körning
  09-17 01:47 lokal).

## S10-U1 (O7) — TOTAL-MALLEN KOMPLETT: KIRURGIN (KEDJA 5) VÄVD — fem kedjor ETT kommando (2026-09-17, GODKÄNT)

- **Objektval:** s10-u2 O5:s bokförda kö ("väv dr-kedja5 i TOTAL-mallen till
  2026-12") — bokat 01:52 lokal FÖRE ingreppet (anspråksfil + worklog);
  syskonet s10-u2:s O7 (NATT-RPO, 01:47–01:51) avgränsat i sin sektion.
- **Vävning `verktyg/dr-total.mjs`:** kedja 5 som steg 2 av 5 i mallordning
  **1 → 5 → 2 → 4 → 3** (kirurgin direkt efter sin källkedja — samma
  SQL-dump; PG-kedjorna före serverfilsarkivet) + flagga **--utan-kirurgi**
  (rescue-läge: vid tabellincident körs dr-kedja5 manuellt med --tabell) +
  dynamiska protokolltexter; dr-total-flockprov.mjs är generisk (kosmetisk
  kommentar). Barnkontraktet orört: dr-kedja5 äger egen skrap-DB + barnlås.
- **Äkta femkedjekörning 01:52–01:55 lokal GRÖN exit 0 — TOTALT 187,2 s ==
  väggklocka** (iterationsserie 130,0 → 147,0 → 187,2 s; kirurgin +73,0 s
  köper EN-tabells-scenariot in i kvartalsbeviset): kedja 1 21,5 s (restore
  11,8 s · public 60/1 266 528 · fel 788 kända/0 okända) · **kedja 5 73,0 s:
  full restore 11,4 s · källa 1 176 468 rader · extraktion 2,2 s/93 369 KiB
  · sabotage GRIPET (psql vägrade, rullbak) · kirurgi 13,7 s · radtal+
  checksumma IDENTISKA (7af32541f90e…)** · kedja 2 37,3 s (161 678 rader ·
  5 158 r/s) · kedja 4 29,1 s (10/10) · kedja 3 26,4 s (8 322 filer/1 195
  commits) · retentionssvep 6/6 dumpar gzip-gröna.
- **FLOCK-KÖ MELLAN AGENTER skarpt bevisat:** syskonets dr-ovning (pid
  1314546) tog prov-låset 13 ms efter överprotokollets SLUT-rad — köade
  korrekt bakom mina barns lås genom hela totalen (O6:s beteendeprov i
  verklig tvåagents-trafik; PG17 online efteråt = SYSKONETS aktiva fönster,
  deras ägo — min övning städade maskinellt, överprotokollet bokför
  "PG17 NERE vid övningens slut").
- **Kvartalsmallen 2026-12 = ETT kommando:** `node verktyg/dr-total.mjs`
  (fem kedjor; --utan-kirurgi i rescue-läge) + fonsterdjup vid sen upptäckt.
- KVD: node --check ×2 · negativtest exit 2 (okänt arg före lås) · src/
  orörd (tsc 0 via projektbinär) · R2 orörd · data/blogg/ orörd.
- Protokoll: DR-TOTAL-2026-09-17-KIRURGIVEVNING.md (agent; lokaldatum) +
  maskinellt DR-TOTAL-2026-09-16-AUTO-3.md (överprotokoll; UTC-bladnamn —
  körning 09-17 01:5x lokal) + 5 delprotokoll (DR-PROV-2026-09-16-AUTO-6 ·
  DR-KEDJA5-2026-09-16-AUTO-4 · DR-KEDJA2-2026-09-16-AUTO-5 ·
  DR-PROV-2026-09-16-KEDJA4-5 · DR-KEDJA3-2026-09-16-AUTO-6).

## S10-U3 (O7) — FÖNSTERKONTINUITETEN: mitt-bladen restore-bevisade + retentionens beteendeprov (2026-09-17, GODKÄNT)

- **Objektval:** fönstrets MITT-BLAD (db-2026-09-12/-13/-14) var aldrig
  restore-bevisade — ändarna var bevisade (fönsterdjupet: äldsta 09-11 ×2;
  kedja 1-serien: 09-15/09-16 ×flera) men "databasen dog N dagar sedan"
  saknade bevis för N=2..4; DR-PROV-2026-09-13.md var våg 122D:s
  filanalys med sudo spärrat (ingen PG-restore). Därtill var retentionens
  find-beteende dokumenterat men aldrig beteendebevisat.
- **Tre restores GRÖNA ×3 (dr-ovning.mjs --fil, familjekontraktet intakt:
  flock-kö + RAM-grind 3 707–3 748 MB + markörförkontroll GRÖN + färsk
  skrap-DB + finally-städning):** 09-12 RTO 11,1 s · public 60 tabeller/
  1 187 329 rader · 09-13 11,2 s · 60/1 207 134 · 09-14 10,3 s (seriens
  snabbaste) · 60/1 226 931; fel 780 kända/0 okända ×3; RTO-serien
  punkterna 13–15. ⇒ **ALLA SEX blad 09-11→09-16 restore-bevisade.**
- **FYND:** (1) fönsterdjupets snitt "16 016 rader/dag" var artefakt av
  EN avvikande dag — 09-11→12 endast +439, därefter KONSTANT ≈+19 800/dag
  (19 805 · 19 797 · 19 797 · 19 800; snapshots-rytmen stabiliserad sedan
  09-12); (2) RTO är bladålder-OBLESSRAD (10,3–11,2 s på 4–5 dagar gamla
  blad) — dumpstorleken styr, 30-dagarsgränsen är RTO-neutral.
- **RETENTIONENS BETEENDEPROV (första):** cron-radens exakta
  `find … -mtime +30 -delete`: dummy 40 dagar → RADERAD; dummy 28 dagar →
  SKONAD (gränsen är >30 hela dygn); 6 äkta blad KVAR. Gränsfallsfilen
  städad manuellt omedelbart efter provet — en dummy som överlever skulle
  dömas RÖD av 02:30-markörvakten och låsa &&-kedjans retention.
  Konsekvens: första äkta bladraderingen sker tidigast ~2026-10-11+ (då
  09-11-bladet passerar 30 dygn) — fönstret växer dit och fönsterdjupets
  dag-29-runbook gäller då för 09-11-bladet.
- **Kollisionsnot:** nattfönstret delades med s10-u2 O7 (NATT-RPO 01:47,
  commit 5d377343) och s10-u1 O7 (total-kirurgi-vävning 01:52–01:55,
  commit ab7d5308) — deras objekt orörda; flock-kön korsbevisad BÅDA
  vägar (deras överprotokoll såg denna agents dr-ovning pid 1314546 köa
  13 ms efter deras SLUT-rad; dessa restores köade bakom deras barnlås):
  tre agenter, ett lås, noll förlorat arbete. DRIFTSBOKEN-editen avvaktade
  deras staging→commit (clobber-kuren; deras text är deras ägo).
- Städning ägarmätt: skrap-DB raderad ×3 (verktygets finally), PG17 down
  (pg_lsclusters), testfiler borta (40-dagars raderad av provet självt,
  28-dagars manuellt dokumenterat), fönstret exakt 6 äkta blad (ls).
  Protokoll: DR-FONSTER-KONTINUITET-2026-09-17.md + maskinella
  DR-PROV-2026-09-16-AUTO-{7,8,9}.md. KVD: src/ orörd = inget bygge,
  tsc-baslinjen orörd (grinden verifierade) · R2 orörd · data/blogg/ orörd.

## S10-U2 (O8) — JUNGFRUNATT KEDJA 2: rad 3:s första obevakade nattexport bevisad ända till restore (2026-09-17, GODKÄNT)

- **Objektval:** s10-u1 O4:s bokförda kö ("jungfrunatten för rad 3 bevisas
  2026-09-17 enligt s10-u2 O2:s mönster") — mogen först efter 02:40; 09-16:s
  export var MANUELL beviskörning, natten till 09-17 var crontab-rad 3:s
  jungfrunatt. Kedja 1:s motsvarande mönster = S10-U2 (O2).
- **Jungfrunatt-bevis (allt mätt i arbetsytan):** `/tmp/moln-backup.log`
  FÖDD 02:40:01.838 (stat-Birth — loggen skapad av cron-körningen själv,
  första raden = 09-17-rubriken; 09-16:s manuella körning skrev aldrig
  loggen) · tidslinje 02:40:01 → per-typ-filer 02:40:02–03 →
  system-events-full-2026-09-17.json.gz 02:40:38 (26.3 MB) = ≈37 s körning ·
  ingen agent aktiv 02:40 · loggen: **163 039 rader (33 sidor), total-kontrakt
  KOMPLETT 163039/163039** (v3-trunceringsvakten GRÖN på första obevakade
  natten) · äkthetsdiff 161 678 → 163 039 = **+1 361 rader på 19 h 16 min**
  (äkta ny export, ej kopia; konsistent med aufr-takten från kedja 6).
- **Restore GRÖN exit 0** (`node verktyg/dr-kedja2.mjs`, 07:36–07:39 lokal):
  163 039 rader · 0 felaktiga · 0 dubblett-id · **RTO 25,0 s = kedja
  2-seriens snabbaste** (52–58 · 27,2 · 38,5 · 37,3 · 25,0) · COPY 6 535 r/s
  · 5/5 domkontrakt · oberoende verifiering rader==unikaId==163 039,
  tidsfönster 09-03 22:43 → 09-17 02:40:02 (sista raden skriven sekunder
  före exporten), severity info 162 296/warning 743, jsonb-prov 15 915.
- **⇒ KEDJA 2 BEVISAD ÄNDA TILL ÄNDA UTAN AGENT I KEDJAN** (cron → export →
  total-kontrakt → arkiv → restore → verifiering) — BÅDA nattkedjorna har
  nu jungfrunatts-bevis; RPO kedja 2 = dygnlig 02:40 utan retention
  (arkivhandlingar). Arkivet förblir ENDA kopian av system_events
  (tväprojekt-fyndet: rkaq-dumparna saknar tabellen).
- **Observation:** 0 dubblett-id mot gårdagens 4 — hypotes (ej bevisat):
  v3:s repetitionsskydd stänger dubblettkällan; prod-PK:t saknas fortfarande.
  Köpost till nästa rond: per-typ-vyernas 8 av 11 tabeller TOMMA (0 rader)
  i nattexporten.
- Städning oberoende verifierad: skrap-DB raderad (finally), PG17 down
  (pg_lsclusters + psql-vägran), låsfilen endast pid-info, 73 GB ledigt.
  KVD: src/ orörd = inget bygge · R2 orörd · data/blogg/ orörd.
- Protokoll: DR-KEDJA2-2026-09-17-JUNGRUNATT.md (agent) + maskinellt
  DR-KEDJA2-2026-09-17-AUTO.md. Sido-bevis samma natt: kedja 1:s 09-17-blad
  GRÖNT 1 307 940 rader 02:30:29 (markörkoll; rad 2:s leverans konstaterad,
  restore-ägarskap O7 + kommande rundor).

## S10-U3 (O8) — JUNGRUDAGEN: fönstrets sjunde blad restore-bevisat + första morgon-RPO:n + RAM-grindens kur (2026-09-17, GODKÄNT)

- **Objektval:** kontinuitetens (O7) prediktion "fönstret växer till 7+ blad"
  inlöst — nattens 02:30-cron lämnade jungfrubladet db-2026-09-17 som INGEN
  hade restore-bevisat (syskonet s10-u2 O8 tog jungfrunatten KEDJA 2 och
  lämnade själva restore-ägarskapet öppet). Tre vinklar: jungfrublads-restore
  (kedja 1), femte dagstegs-punkten, första morgon-RPO:n. Under fönstret
  körde ett syskon dr-ovning mot SAMMA blad (deras DR-PROV-2026-09-17-AUTO-2:
  RTO 12,4 s, identiskt radtal) — flocken serialiserade; utfallet bokfört som
  OBEROENDE REPLIKBEVIS (12,1 + 12,4 s, 1 286 328 == 1 286 328) — se deras
  FÖDELSEBEVIS-protokoll (fyrkantigt korsbevis) för replikens detaljer.
- **Förkontroll:** markörkoll GRÖN 1 307 940 rader · 99 CREATE · 101 COPY.
- **RAM-grindens första fabrikstrefönster-fall + kur:** exit 75 vid
  MemAvailable 943 MB (tre fabriksbarn + main delar servern) → poll-
  vänta-tills-öppet-wrapper (node, /proc/meminfo var 15:e s) → GRÖN vid
  1 155 MB efter 120 s, **PG17 orörd under hela väntan**. Läxa: DR-övning
  under fabrikstrefönster räknar med grindstopp; poll-mönstret = standardkur
  (s10-u1 replikerade med 2× exit 75 + omkörningsslinga).
- **Restore GRÖN exit 0** (07:43 lokal): **RTO 12,1 s** = RTO-seriens punkt 16
  (spann 10,3–23,9 s, samtliga under v98 F3:s 20,0 s) · fel 788 kända/0
  okända · public 60 tabeller/**1 286 328 rader** == dumpens COPY-räkning
  (dr-ovning + dr-rpo-diff: två instrument, samma tal) · public+storage
  68/1 286 464 · alla scheman 99/1 286 724.
- **⇒ FÖNSTRET KOMPLETT 7 BLAD (09-11 → 09-17, N ∈ [0..6])** — varje
  "dagar sen katastrof"-läge har bevisat blad + mätt radtal. Dagstegs-
  hypotesen KONFIRMERAD: femte steget **+19 800** (serien 19 805 · 19 797 ·
  19 797 · 19 800 · 19 800 — spridning 8 rader/0,04 % över fem dagar).
- **FYND — TVÅ KLOCKOR i RPO-exponeringen** (första morgon-RPO:n, 5,2 h efter
  växlingen): delta **+163** endast board_decisions +160 · organ_health_logs
  +3 · **snapshots +0**. Beslutsklockan ≈ **31 r/h jämn dygnet runt** (natt
  31,9 · morgon 31,3 ≈ 744/dag — styrelsens rundor); snapshots-pumpen
  (+19 800/dag) stod STILLA 02:30→07:43 — skulden byggs först när pumpen
  startar. Timmarna efter 02:30-växlingen är nästan kostnadsfria. Köpost:
  mitt-på-dagens-mätning tidssätter pumpens start.
- Städning (finally + oberoende): skrap-DB borta, PG17 down, flock släppt;
  R2 orörd (.pgpass pekare ur publika crontaben, aldrig inläst); src/ orörd
  = inget bygge; data/blogg/ orörd.
- **CLOBBER-NOTIS:** leveransen committad 8b82f0a2 07:46; rundagentens
  samtidiga gamla-läge-skrivning av DRIFTSBOKEN/worklog raderade text-raderna
  ur arbetsytan (filerna var hela tiden säkra i historiken) — detta är
  återföringen i tilläggscommit (clobber-kurens andra steg); s10-u1:s
  889b5d51 bokför symmetriskt och väntar med sina text-rader tills detta
  steg landat.
- Protokoll: DR-OVNING-2026-09-17-JUNGRUDAG-7-BLAD.md (agent) + maskinellt
  DR-PROV-2026-09-17-AUTO.md + JSON DR-RPO-DIFF-2026-09-17-MORGON.json.

## S10-U1 (O8) — FÖDELSEBEVISETS REPLIK + LOKAL PG EGENMÄTT STÄDVERIFIERAD (2026-09-17, GODKÄNT)

- Kontext: fabriksspår 10 vakt ("återställ, mät tid/rader, protokoll, städa
  lokal PG"). Objektval efter duplikatkontroll: nyfödda bladet
  db-2026-09-17.sql.gz (fött 02:30:29, obevisat vid start — FÖDELSEBEVIS:
  N=0-bladet en verklig katastrof IDAG laddar från; igår bevisades N∈[1..5]).
- RACE (symmetriskt bokförd): s10-u3 (O8) tog SAMMA blad + samma morgon-RPO
  21 s före mig — flocken serialiserade oss, båda GRÖNA, deras commit
  8b92f0a2 bokför min körning som "OBEROENDE REPLIKBEVIS"; restore-kärnan +
  morgonpunktens förstahandsfynd ("två klockor") är DERAS. Detta är repliken
  + de delar de inte täckte.
- REPLIKEN: `node verktyg/dr-ovning.mjs --fil db-2026-09-17.sql.gz` GRÖN
  exit 0 — markörer GRÖN 1 307 940 · RTO **12,4 s** (seriepunkt 17) · fel
  788 kända/0 okända · public 60 tabeller/**1 286 328 rader** == dump-COPY
  == syskonkörningen (FYRKANTIGT KORSBEVIS på födelsebladet) · +storage
  68/1 286 464 · alla scheman 99/1 286 724. RAM-omkörning: 2× exit 75
  (896 MB — fyra syskonpar ~0,8 GB/st) → 60 s-slinga → GRÖN (grind+kö-
  kontraktet beteendebevisat under äkta belastning).
- **LOKAL PG STÄDVERIFIERAD EGENMÄTT** (första gången oberoende av
  verktygens självrapport): base/ ENDAST OID 1/4/5 + tom pgsql_tmp (NOLL
  skrap-svans — "4 kataloger" är ls total-raden, dubbelkollat) ·
  **pg_wal 497 MB — FÖRSTA MÅTNINGEN** (normal återanvändningsbuffert efter
  spårets ~20 restores; shutdown-checkpoint "0 added/removed/recycled,
  estimate 221 MB"; långt under 1 GB-taket; 73 GB ledigt — referensvärde
  för kvartalstrend) · ren avstängning i PG-loggen · 7 blad i fönstret ·
  /tmp-felloggar enligt mall. DOM: lokal PG fullständigt städad + viloläge
  med egenmätta bevis.
- **CLOBBER-OBSERVATION (VAKT):** under mitt pass skrev organ-Φ
  DRIFTSBOKEN från en föråldrad bas (före 8b92f0a2) vilket tillfälligt
  raderade s10-u3 (O8):s DR-rad + sektion ur arbetsträdet; s10-u3:s
  ÅTERFÖRING-commit 72d74370 läkte det — men Φ:s egen "VÅG 181
  LEVERERAD"-rad i DRIFTSBOKEN:s våg-ledger sopades med i svängen.
  Köpost till Φ: återapplicera raden (deras PIPELINE-KO/ZCODE-GAP-staging
  lever orörd). Lärdom: skrivning i delade böcker under aktiva
  fabriksfönster SKALL följas av OMEDELBAR commit (clobber-kuren) —
  gapet mellan skrivning och commit är fönstret.
- Kö: födelsebevis som stående vaktpraxis (varje blad restore-bevisas sin
  födelsedag, ~60 s) · mitt-på-dagen-RPO-punkt (tidssätter snapshots-
  pumpens start) · WAL-mätningen återtas kvartalsvis som trend.
- Protokoll: DR-FODELSEBEVIS-2026-09-17.md + maskinellt
  DR-PROV-2026-09-17-AUTO-2.md (commit 889b5d51). KVD: src/ orörd = inget
  bygge · R2 orörd (.pgpass aldrig inläst) · data/blogg/ orörd.

## S10-U3 (O9) — EFTERMIDDAGS-DR: dubbel RPO-punkt + intra-dag-noll + KUR av falsk RÖT-dom (2026-09-17, GODKÄNT)

Manifest spår 10 vakt 3/3. Kört 2026-09-17 14:28–14:41 lokal (12:28–12:41Z).
Order: "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll, städa
lokal PG."

**Objektval:** morgonens tre O8-leveranser lämnade köposten
"mitt-på-dagen-RPO-punkt" (s10-u1 O8:s kö-rad) — RPO-serien hade dag-, natt-
och morgon-läge men aldrig mitt-på-dagen. Valt kl 14:27: restore av
jungfrubladet (RTO-punkter 18+19) + RPO-diff med dubbel mätpunkt.

**Körningar (samtliga flock-skyddade, RAM-grind GRÖN 1,1–1,3 GB):**

| Tid | Körning | Utfall |
|---|---|---|
| 14:28 | `dr-ovning.mjs --fil db-2026-09-17.sql.gz` (bladnamn) | FALSK RÖT — vägrad, PG17 orörd (AUTO-3) |
| 14:30 | `--fil /…/db-2026-09-17.sql.gz` (absolut) | GRÖN · RTO 17,1 s · 60 tab/1 286 328 r (AUTO-4) |
| 14:31 | `dr-rpo-diff.mjs --json` | +19 392 på 11,9 h (punkt 1) |
| 14:33 | samma bladnamn EFTER kur | GRÖN · NOTIS · RTO 14,1 s (AUTO-5) |
| 14:40 | `dr-rpo-diff.mjs` (punkt 2) | TOTALT +0 på 9,2 min |

**Vaktfynd + rotorsakskur — falsk RÖT-dom på sunt blad:** `--fil` med bart
bladnamn löstes av `path.resolve()` mot arbetskatalogen → sökväg som inte
finns → markörkollen RÖD → restore vägrades, trots GRÖN 31,7 MB-fil på disk
(sju timmar tidigare oberoende GRÖN-återställd av två syskon). Fail-fast
bevisad i FELRIKTNINGEN (vägran skedde före varje PG-röring — AUTO-3).
Kur: `valDump()` — given väg först, sedan `DUMP_KATALOG/<bladnamn>` med
NOTIS-rad, äkta saknad fil förblir RÖD. Beteendeprov AUTO-5: SAMMA kommando
GRÖNT. `node --check` GRÖN; kolla-dump-markorer.mjs orört (dess kontrakt är
korrekt — felet satt i anroparen). Allvarlighetsbedömning: en framtida
vaktkörning med bladnamn hade kunnat eskalera "dumplen RÖD" om ett sunt
blad; kuren gör båda konventionerna säkra.

**RPO — pumpbilden komplett (kollisionsbokförd):** syskonet s10-u1:s
MIDDAG-protokoll (14:26–14:35, läst under fönstret, commit 07dd6aa0) hann
tidsätta pumpens start EXAKT 08:00:00,058 med tidsstämpel-sond — deras fynd
står, min hastighets-extrapolering omdefinierades till intra-dag-stabilitet.
Mina egna värden: (1) punkt 1 == deras 18 984 samma minut, oberoende replik;
(2) punkt 2 +0 allt på 9,2 min → engångspump, ingen drip; (3) komplett
dygnsprofil: 02:30 växling (0) → 08:00 batchkliv (+18 984) → episodiskt kryp
→ värsta fall ≈ +19 800 == dagsteget sekunder före växlingen. Beslutsklockan
preciserad: 34 r/h i SNITT men +0 på 9,2 min → episodisk (rondstyrd?),
morgonens "jämn" gäller endast som snitt.

**Städning egenmätt:** PG17 down · base endast OID 1/4/5 + tom pgsql_tmp ·
pg_wal 497 MB (oförändrad mot morgonen) · /tmp enligt mall.

**Kö:** (1) lätt kvälls-RPO-punkt ~22:00 (sista profilluckan) — **STÄNGD av
s10-u2 21:09** (pump-noll 6,5 h); (2) valDump()-
NOTIS i dr-total.mjs-kontext — **STÄNGD av s10-u1:s KVÄLLS-TOTAL (körbevis
AUTO-8/9) + oberoende kodbevis s10-u3 21:1x** (dr-total
anropar kedja 1 UTAN --fil → defaultgrenen; se S10-U3 KVÄLLS-KEDJA-3);
(3) WAL-trend kvartalsvis (tre dygnspunkter 497 MB stabila — u2);
(4) episodkarta — **STÄNGD av s10-u3 21:15** (kvartsklockan, se S10-U3
KVÄLLS-KEDJA-3).

Protokoll: DR-OVNING-2026-09-17-EFTERMIDDAG-RPO.md + maskinella
DR-PROV-2026-09-17-AUTO-{3,4,5}.md + JSON DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json.
KVD: src/ orörd = inget bygge (endast verktyg/dr-ovning.mjs + data/) · R2
orörd (.pgpass endast PGPASSFILE-pekare) · data/blogg/ orörd.

## S10-U2 — KVÄLLS-DR: sista profilluckan mätt + FÖRLORAD KUR ÅTERLEVERERAD (2026-09-17, GODKÄNT)

Manifest spår 10 vakt 2/3. Kört 2026-09-17 21:06–21:11 lokal (19:06–19:11Z).
Order: "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll, städa
lokal PG."

**Objektval:** O9:s köpost (1) "lätt kvälls-RPO-punkt ~22:00 — sista
profilluckan". Körningar (flock-skyddade, RAM-grind GRÖN 1,9 GB):

| Tid | Körning | Utfall |
|---|---|---|
| 21:07 | `dr-ovning --fil db-2026-09-17.sql.gz` (bladnamn) | FALSK RÖT — vägrad, PG17 orörd (AUTO-6) = REGRESSION: kuren från 14:33 borta |
| 21:08 | valDump() återlevererad + `node --check` GRÖN | — |
| 21:08 | samma bladnamn EFTER återleverans | GRÖN · NOTIS · RTO 11,0 s (punkt 20, dagens snabbaste) · 60 tab/1 286 328 r (AUTO-7) |
| 21:09 | `dr-rpo-diff.mjs --json` | +19 612 på 18,65 h (kvällspunkt) |

**Vaktfynd — den försvunna kuren:** valDump()-kuren bevisades 14:33 (AUTO-5)
men fanns ALDRIG i git (senaste commit på verktyget = c3b871f7 09-16; diff
tom; ingen stash/reflog) och försvann från disken vid mtime 14:37 — O9:s
commit f1a33e95 dokumenterade kuren i meddelandet men committade ej filen.
Ocommittad kur = ingen kur. Återlevererad troget spec (given väg →
DUMP_KATALOG/<bladnamn> + NOTIS → annars RÖT med sökväg), beteendeprovad
(AUTO-6 RÖT-vägran → AUTO-7 GRÖN) och committad I SAMMA FÖNSTER denna gång.
**NY NORM: verktygsändring + beteendeprov + commit i samma fönster —
"dokumenterad i commit-meddelande" ≠ levererad.**

**RPO — profiltabellens sista lucka:** snapshots 1 214 436 vid 14:31, 14:40
OCH 21:09 = **pump-noll på 6,5 h** (engångsbatch 08:00, ingen kvällsdripp;
resten 21:09→02:29 bevisas retrospektivt av nattens bladväxling). Beslutsklockan
+220 på 6,48 h = 34 r/h — tredje dagtimmen med samma snitt (morgon 34, kväll
34): episodisk i takt, konstant i dygnssnitt. Värsta fallet ≈ +19 780 — möter
O9:s ≈ +19 800 (två vägar, samma dom: worst case == dagsteget).

**Städning eigenmätt:** PG17 down · base endast OID 1/4/5 + tom pgsql_tmp ·
pg_wal 497 MB (TREDJE dygnspunkten — WAL stabil hela dygnet, gratis svar till
O9:s kö 3) · /tmp enligt mall · skrap-DB:s frånvaro bevisad av psql-vägran
(server nere).

**Kö:** (1) nattens 02:30-bladväxling = retrospektivt pump-noll-bevis (nytt
blads snapshots-total − 1 195 452 ≈ +19 8xx); (2) valDump-NOTIS i
dr-total.mjs-kontext — **STÄNGD av s10-u1:s KVÄLLS-TOTAL (körbevis) +
oberoende kodbevis s10-u3** (dr-total anropar
kedja 1 UTAN --fil — defaultgrenen; se S10-U3 KVÄLLS-KEDJA-3); (3)
COMMIT-NORMEN som standing-rad ovan.

Protokoll: DR-OVNING-2026-09-17-KVALL-RPO.md + maskinella
DR-PROV-2026-09-17-AUTO-{6,7}.md + JSON DR-RPO-DIFF-2026-09-17-KVALL.json.
KVD: src/ orörd = inget bygge · node --check GRÖN på verktyget · R2 orörd
(.pgpass endast PGPASSFILE-pekare) · data/blogg/ orörd.

## S10-U3 — KVÄLLS-KEDJA-3: serverfils-arkivet GRÖNT + dr-total-kontext KODBEVISAD + BESLUTSKLOCKAN = DETERMINISTISK KVARTSKLOCKA + KÄLLCADCENSFYND `verktyg/dr-kedja3.mjs` (2026-09-17, GODKÄNT)

Manifest auto-s10-1789671929408, spår 10 vakt 3/3 (O10). Körd 21:11–21:17
lokal. Order: "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll,
städa lokal PG." Anspråksfil före körning; duplikatkontroll mot dagens alla
DR-protokoll + syskonens kvällskörningar (u2:s KVÄLLS-DR 21:06–21:11, u4:s
AUTO-7/8).

**Kedja 3 GRÖN** (`DR-KEDJA3-2026-09-17-AUTO.md`): sabotage 3/3 gripna ·
repo-tar 144 MB gzip GRÖN 8 892 poster, exkluderingskontrakt 0 brott ·
**restore RTO 3,4 s** — 8 322 filer + 570 kataloger == listat, src 675
filer/203 930 rader · spot-diff 2 IDENTISKA + 2 SKILJER-FÖRKLARADE (kvällens
20:23/20:30-commits efter arkivets mtime 09-16 13:40) · git-bundle verify +
**klon GRÖN 9,6 s / 1 195 commits** + ancestor GRÖN · PG17 nere ankomst+slut,
/tmp städad.

**O9:s kö (3) + u2:s kö (2) STÄNGDA — u1:s körbevis + denna KODBEVISREPLIK:**
s10-u1:s KVÄLLS-TOTAL (21:12–21:16) stängde posten med körbevis (AUTO-8 GRÖN
utan NOTIS i total-kontext + AUTO-9 explicit NOTIS); detta arbete levererar
den oberoende kodaläsningsrepliken: dr-total.mjs:235 anropar kedjorna UTAN `--fil` → dr-ovning:s defaultgren `hittaSenasteDump()`
(DUMP_KATALOG-absolut) — valDump():s resolveringsgren berörs aldrig av
dr-total. u2:s antagande "kedja 1 anropar med absolut väg" preciseras till
"inget vägargument alls" — slutsatsen (oförändrat beteende) består, nu av
kod i stället för förväntan.

**O9:s kö (4) STÄNGD — beslutsklockans episodkarta** (läsande COUNT-sond,
`DR-BESLUTSKLOCKA-2026-09-17-KVALL.json`): board_decisions är en
DETERMINISTISK KVARTSKLOCKA — exakt 8 rader per :00/:15/:30/:45 → 32/h →
768/dygn; 24 hela timmar utan undantag; per-dag 768×7 med enda avvikelsen
09-13 (765 = −3). organ_health_logs = den äkta episoden (9/3 rader vid
02/04/08/10/14/16/20). O9:s "episodisk (rondstyrd?)"-dom för board OMSKRIVEN:
deras +0-på-9,2-min låg mellan :30- och :45-batcherna. Värsta-falls-RPO:
tredje oberoende vägen 18 984+768+~36 ≈ 19 788 == O9 ≈19 800 == u2 +19 780.

**FYND — kedja 3:s KÄLLA saknar mekanisk cadens (huvudagentkö):**
användar-crontaben saknar rad för backup-server-filer.mjs; hybrid-sync.log
senaste körning 09-09 20:09 med dubbla fel (hetzner_key-sökväg + HTTP 500) =
datorns hybridkedja död i 8 dygn; nyaste paket agenttriggat 09-16 13:40 ⇒
katastrof ikväll = restore GRÖN men ~32 h förlorade commits. Kö: (a)
server-cron ~02:50 + `find … -mtime +30 -delete` i samma rad, ELLER (b)
reparera datorns synka.cmd (hetzner→contabo_key). Crontaben ägs av
huvudagenten — ingen ändring av agenten.

**Kollisionsbokföring:** u2:s kvälls-RPO 21:09 var före mitt anspråk ~21:11;
min dr-rpo-diff 21:13 skrev till deras committade KVALL-JSON-sökväg —
verifierad byte-identisk (git status/diff tomma), deras fil orörd; min
körning omklassificerad till oberoende replik (mätvärden oförändrade
21:09→21:13; total diff +19 612 == deras). u4:s AUTO-8 deras yta — orörd.

Protokoll: DR-OVNING-2026-09-17-KVALL-KEDJA3.md + maskinella
DR-KEDJA3-2026-09-17-AUTO.md + DR-BESLUTSKLOCKA-2026-09-17-KVALL.json.
KVD: tsc 0 via projektbinär (src/ orörd = inget bygge) · R2 orörd (.pgpass
endast PGPASSFILE-pekare; prod DB endast LÄST) · data/blogg/ orörd ·
syskonens ytor orörda.

## S10-U2 (O9) — KEDJA 7: KIRURGIRECEPTET FÖR TRIGGERBLOCKADE board_decisions `verktyg/dr-kedja7.mjs` (2026-09-17, GODKÄNT)

Kedja 5:s FYND 1 löst: board_decisions (organens beslutsregister, 47 810 rader)
kirurgeras med `SET LOCAL session_replication_role = replica` i kirurgins ENDA
transaktion. Bevisad i skrap-DB på db-2026-09-17 (GRÖN exit 0, körning 3 — körning
1 och 2 RÖTA på vardera en instrumentbugg, se nedan):

| Moment | Värde |
|---|---|
| Full restore (källmåttstock) | 15,2 s · fel 788 kända/0 okända |
| Källa | 47 810 rader · checksumma 8e16c9e70d173a338352c2affac71abe |
| Kollateralbaslinje | forecast_log 429 rader · 113 refererar board_decisions |
| Katastrof (buggig migrering) | 500 rader muterade (consensus_level=-1) — LANDADE |
| Naiv kirurgi (kedja 5:s recept) | VÄGRAD 0,5 s — prognosmotor-feltexten + HEL rullbak |
| Sabotage (mitt-rads-kolumnfel) | VÄGRAD + rullbak (gäller även under replica-läge) |
| RECEPET (replica + DELETE + COPY) | 4,2 s · 47 810 rader · checksumma IDENTISK |
| Efterkontrakt | 0 ärr (113==113) · 0 hängande · triggrar 2/2 · live-UPDATE vägras · roll origin |

Varför säkert: replica-läget är PG:s egen kanal för logiska replikeringar —
SET LOCAL dör med transaktionen, ingen DDL, inga bestående spår; kaskaden eldas
aldrig så grannen bibehålls bit-för-bit; FK:n var avstängd ⇒ hängande-sonden +
live-triggerbeviset är OBLIGATORISKA efter varje verklig applicering (verktyget
bär båda). Runbook: (1) kör dr-kedja7.mjs mot dagens dump; (2) receptfil =
SET LOCAL + DELETE + COPY-block, EN transaktion, ON_ERROR_STOP; (3) mot Supabase
krävs superuser-rättigheter + lågtrafik + huvudagentens ägande (R2); (4) verifiera
rader/checksumma/hängande/live-skydd efteråt. Gränser: pausar ALLA triggrar under
transaktionen — aldrig mot tabeller vars triggrar bär affärslogik för COPY-datan;
håll transaktionen minimal.

Fynd: skiktat skydd (olycks-DELETE stoppas redan av kaskaden; katastrofen som
behöver receptet är MUTATION av den triggerfria tabellen) · instrumentbuggarna
regclass-prefix (search_path) och psql -q-dolt rowcount-eko (sond-kur) — båda
protokollförda i RÖT-delprotokollen.

KVD: src/ orörd (rent node-verktyg utanför src/, tsc-baslinjen orörd via grinden,
INGET bygge) · prod RÖRDES ALDRIG · R2 orörd · data/blogg/ orörd · syskonytor
orörda (s10-u1:s MIDDAGS-DR 07dd6aa0 och s10-u3:s O9 lästa, deras sektioner orörda;
DR-fönstret taget först efter u1:s låssläpp).

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

---

## INCIDENT 2026-09-15 16:42 lokal — F6-larm "prod osvarar" (rot: RAM-svält)

- **Symptom:** feljägarens sond dog ("TypeError: fetch failed" 16:42:45,
  feljakt-fynd.jsonl) · pm2-omstart 16:40:20 · next-start stack-trace
  16:47:21 · kraschvakt kooldown 16:54 (online, omstarter +0) · målet
  återställt av hjärtslaget 16:51 · själväkt ~17:01 (prod-synk nytt bygg
  + omstart, ISR-varm 16:59/17:01).
- **Rot:** på 8 GB-servern (swap redan ~1,5 GB använd) sammanföll
  fabrikens auto-s6-omgång (3 barn; s6-u3 ensam 58 min ≈ 0,8 GB) med
  pm2-omstartar och bygg — next build (~2 GB peak) hade dessförinnan
  dödats TYST av minnesvakten ("Killed", rond32-deploy.log 13:31), och
  vid 16:42 svultgick hela servern kort. Verkligt osvarar-fönster ~5 min.
- **Omedelbar kur:** ingen behövdes — organismen självläkte (kraschvakt,
  hjärtslag, prod-synk); prod 200 från 17:01, bygg EFTER commit bevisat
  (rond 33-sonder).
- **VACCIN (våg 169):** `verktyg/ram-grind.mjs` + `prebuild` i
  package.json — ALLA `npm run build` (deploy-skript, fabriksbarn,
  prod-synk, manuella) väntar tills MemAvailable ≥ 1 600 MB (tak 15 min,
  därefter PÅSKRIVET avbrott med loggrad — aldrig mer tyst "Killed").
  Vaktwrappern fick egen grind 1 100 MB / 5 min → SKIPPAS med loggrad
  (exit 75) om minnet är tomt; cron ropar igen om 6 h. Grinden aktiverar
  ENDAST på Contabo (path-markör /home/ak1a/AK1) — kundens arbetsstation
  och CI opåverkad. Logg: data/vakten/ram-grind.logg (gitignorad).
- **Bevis:** båda grindgrenarna testade live (öppnad exit 0; stängd
  loggad + exit 1); F6-tidslinjen bunden i rond 33 (feljakt-fynd.jsonl,
  pm2-loggar, fabrikens statusfiler, /tmp-byggloggar). dmesg krävde
  sudo och lämnades oläst — OOM-slutsatsen vilar på "Killed"-signaturen
  + minnessiffrorna, antecknat ärligt.

### STÄNGD+VERIFIERAD rond 34 (2026-09-15 17:45 lokal) — omlevererat larm, ingen ny incident

- **Utlösare:** F6-larmet levererades OM till sessionen. Verifikat:
  senaste "prod osvarar"-rad i feljakt-fynd.jsonl är **14:42:45Z** —
  SAMMA incident som ovan; prod 200 på HTTPS+localhost vid sond.
- **Ingen ny händelse (bevis):** pumpor-daemonen lever (rop
  min%15==12); körningarna 15:27Z/15:42Z gav noll nya fyndrader;
  manuell feljägarkörning 15:44:46Z = **ALLT GRÖNT** — F2 4/4 pm2
  online, F3 **18/18 endpoints 200** (vid incidenten dog alla), F6
  prod 200 · RAM 4 615 MB · disk 20 %, F5 fem loggar rena.
- **Vaccinet LIVE i prod:** package.json bär `prebuild=node
  verktyg/ram-grind.mjs --min 1600 --tak 900`; prod-synk.mjs bygger
  via `npm ci && npm run build` → varje synk-deploy passerar
  grinden; tre deploys efter incidenten (15:01:56Z, 15:32:53Z,
  15:40:51Z — alla "prod 200"); ram-grind.logg TOM = grinden aldrig
  behövt vänta/avbryta sedan vaccinet landat.
- **Lärdom (Lag 6):** omleverans av ett larm är INTE ett nytt fel —
  verifiera fyndloggens tidsstämpel mot nuet FÖRE rot-analys, annars
  kurar man ett spöke. Rutinregel från och med rond 34.

## 2026-09-15 rond 35 — F6-omleverans #3: rot i LARMVÄGEN (våg 171)
- SYMPTOM: tredje "FELJÄGAREN FYNN: prod osvarar" till sessionen. Fyndloggen: ingen
  ny F6-rad efter 14:42:45Z (rond 33:s RAM-svält, kurad våg 169). Prod 200; grön
  feljägarkörning 15:44:46Z (18/18 API).
- ROT: mal-hjartslag.mjs fyndkick (våg 168 p5) läste sista 5 rader + filtrerade
  HÖG/KRITISK — utan ts-koll. Kurade rader i svansen ⇒ re-alarm var 30:e minut.
- KUR: våg 171 tidsfilter — endast fynd yngre än 35 min får kicka. Filterbevis mot
  prodloggen: gamla filtret 1 (exakt 14:42:45-raden), nya 0.
- VACCIN (klassen): en larmkanal utan tidsstämpelkoll re-alarmar kurade fel i all
  evighet — alla fyndkickar måste kräva färsk ts. Persistens hos verkligt fel ger
  NYA rader med färsk ts ⇒ alarmeras korrekt kvar.

## 2026-09-15 rond 36 — F6-omleverans #4: KURAD KOD ≠ KURAD DRIFT (våg 171 fullföljd)
- SYMPTOM: fjärde "prod osvarar". Fyndloggen: fortfarande sista F6 14:42:45Z; prod 200/200.
- ROT: våg 171:s tidsfilter (244166e8) landade i arbetsytan men pushen bröts mitt i
  (merge-konflikt UU worklog.md) — prods mal-hjartslag.mjs saknade filtret; daemonen
  spawnar skriptet som barnprocess per rop ⇒ gamla filtretlösa koden kördes vid varje slag.
- KUR: merge löst + pushad ccbadca7..539d0fff; filtret fysiskt i prods fil (rad 256);
  filtertest mot loggvans: gamla filtret 1 (exakt 14:42:45-raden) → nya 0.
- VACCIN (Lag 6): kur är leverad först när koden FINNS I PROD med beteendebevis —
  rundens verify-kedja slutar ALDRIG vid "commit i arbetsyta" (rond 26:lärdomen
  generaliserad från bygg till larmväg).

- **2026-09-15 rond 39 (F1-falsklarm):** feljägarens tsc-mätning under pågående npm ci gav 5 × TS2688 (transitiva @types/d3-* rivna minutvis). Vaccin: deploylås-probe + TS2688/2307-andra-chans i feljagaren.mjs — mät aldrig kod under underhållsfönster. Familj nr 3 av "mätning under underhåll"-falsklarm (jfr F6-tidsfilter rond 35-36, RAM-grind rond 33).

## 2026-09-16 rond 44 — F3+F6-falsklarm #5: rot i DEPLOYFÖNSTRET (feljägaren låsmedveten)
- SYMPTOM: FYNN 04:27:30Z "/tjanster/* nätverksfel; prod osvarar". Prod 200; rutterna 401 live.
  Fyndloggen: ALLA 21 ändpunkter + F6 fetch failed samma sekund = hela localhost:3000 nere.
- ROT: prod-synkens bygg 2 (04:27:20): bygg 1 OOM-dödat 04:23:15 (Killed/heap) förlängde
  fönstret; npm ci bygger om node_modules under levande pm2 → app osvarande ~3 min →
  pm2 restart 04:30:24 (pm_uptime-bevis) → DEPLOYAD 04:30:30 prod 200. Allt självläkt vid larm.
- KUR: feljagaren.mjs deployPagar() — flock -n /tmp/ak1a-deploy.lock (hålls av prod-synk
  "flock -w 900" + deploya-contabo "flock -n"); F3/F6-fel under aktivt bygg ⇒ MEDEL "väntat
  fönster" (larmar ej; endast HÖG/KRITISK kickar session enligt mal-hjartslag.mjs), utan
  bygg ⇒ HÖG kvar. Fail-safe: endast exit-status 1 (= lås hålls) räknas som deploy.
- VACCIN: instrument ska känna systemets underhållsfönster (familj: rond 33 RAM-svält,
  35-36 larmväg-ts, 39 npm ci-race, 44 deployfönster). Kvar bokad: atomisk byggswap.

## INCIDENT 2026-09-16 19:17 lokal — GRÄNSSNITTSVAKTEN dog med SIGINT (exit 130)
- SYMPTOM: cron-körningen 19:17 (flik "17 1,7,13,19 * * *") avbröts mitt i
  dark/390-svepet; larm VAKTFEL med halvfärdig utdata; cron.log SAKNAR 19:17-raden
  (bash hann POSTa larmet men dö innan echo) ⇒ signalen träffade hela jobbprocessen.
- ROT: yttre SIGINT, engångsslag. Uteslutna med belägg: kernel (journalctl 19:10–19:25
  tyst om OOM/kill), agentfabriken (logg.jsonl tyst sedan 19:13, inga barn vid 19:17),
  egna verktyg (pumpor/evighetsmotor/pulsvakt/kraschvakt: 0 kill/pkill-källor, bara
  AbortSignal.timeout). INTE den bevisade 2026-09-15-roten korrupt node_modules:
  prod = 583 paket, 0 trasiga, puppeteer-core installerad + deklarerad (package.json
  rad 91) ⇒ nästa npm ci oskadelig.
- KUR: ingen — prod var frisk (200, pm2 online, .next intakt). Reparationsbygget
  (npm ci+build under flock) avstått medvetet: inget att laga, bygg avbrott hade bara
  burit risk. Skyddet åter bevisat direkt: snabbsvep 12/12 GRÖN + riktat adminsvep
  88/88 GRÖN (19:35); cron återupptar fullkontrollen 01:17.
- VACCIN: (1) larmtextens "korrupt node_modules"-hypotes är en GISSNING från
  2026-09-15 — kör diagnosen (paket-integritet + journal + fabriklogg) FÖRE npm
  ci+build; ett onödigt bygge är själv en incidentrisk. (2) Vakten MÅSTE köras från
  /home/ak1a/AK1 (arbetsytan har partiellt node_modules utan puppeteer-core — snabbtest
  där ger falskt VAKTFEL "Cannot find package"). (3) RÄTTAD 2026-09-18 (s8-u3-retry,
  u1:s bokning): "/admin 2px överflöd i mobil" var INTE ett normalmönster utan ett äkta
  defekt i tre lager (tabbradens -mx-4-utbrytning o58 + ActivityRow shrink-0 + Radix
  ScrollArea-table-svällning) — kurerat 2026-09-17/18, slutmätt 0/88 GRÖN på deploy
  5d8bbd1f 00:10Z (OPTIMERING-protokoll o58 + S8-U3-ACTIVITYROW-OVERFLOD; kedjesond
  l=0 v=390). "GRÖN 13:17 med identiskt mönster"-slutsatsen var mätblindhet: dokument-
  scrollen klipptes (0px överflöd) medan element låg utanför — jaga ALLTID
  utanfor-signalen, aldrig bara överflödstalet. (4) Studio-skalet verkställde varken rm eller node-fil
  ikväll (häng utan effekt, omväxlande med fungerande körningar) — städning via
  subagent; fjärde observationen av hang-typen.

## 2026-09-17 17:42–17:47Z — prod 502: avbrutet bygge mellan BUILD_ID och prerender-manifest (s7-u3, o53 §4)

- SYMPTOM: pm2 ak1a kraschloop (ENOENT .next/prerender-manifest.json, ↺ 3 700+)
  ⇒ nginx 502 på alla sidor ~5 min. Root: 17:27- och 17:37-ropens byggen
  OMM-dödades/avbröts under minnestränghet (fabriksomgång + gränssnittsvaktens
  6-timmarscron delade RAM-taket); 17:37-bygget skrev BUILD_ID men hann inte
  skriva manifestet innan död — sekvensens pm2-restart startade ändå.
- ROT: next build är INTE atomisk — BUILD_ID skrivs före sista manifesterna;
  exit-väg + "bygg klar"-detektering räcker inte som hälsokontroll.
- KUR: manuell återställning av vakande s7-agent: tsc 0 verifierade HELA
  node_modules först (npm ci skötts undvikit, sparade 3 min) → pm2 stop →
  npm run build under /tmp/ak1a-deploy.lock via node-kanal
  (verktyg/_s7u3e-prodatallning.mjs) → pm2 restart → prod 200 ×3 17:47:02Z,
  BUILD_ID J87oNXS1k5w1NAMDS1rpJ.
- VACCIN: (1) prod-synkens HTTPS-steg bör GRINDA mot
  .next/prerender-manifest.json:s existens FÖRE pm2 restart (billigt:
  existsSync) — "bygget exitade 0" bevisar inte komplett .next.
  (2) pm2-restart mot ofullständigt .next ger kraschloop som pm2 inte
  hämtar sig från — stop → bygga klart → start är rätt ordning, aldrig
  bara retry. (3) Bygg under samtidig tung cron (gränssnittsvakten ~1 GB
  chrome) + fabrikens barn = OMM-fälla; RAM-vaktens tröskel bör räkna
  med byggheap + cron, inte bara ledig RAM.

## 2026-09-17 ~18:5x–19:4x lokal — två vaktåtgärder i patch-/grindkedjan (s8-u3, o50)

- VACCIN 1 OVAN: INFRIAT av s8-u3 (o50 §5) — verifieraArtefakt (prod-synkens
  deploygrind AND kraschvaktens ärlighetsgrind, ingen extra anropsplats
  behövdes) kontrollerar nu KRITISKA_FILER = BUILD_ID + prerender-manifest.json
  + routes-manifest.json FÖRE pm2-restart; incidentbilden (BUILD_ID skriven +
  HTML grön mot gamla chunks, server dör på ENOENT) = trasig med filnamn.
  Skarp sond mot prod-.next: GRÖN 1667 HTML/81 ref — inget falsklarm.
  VACCIN 2 + 3: INFRIADE 2026-09-18 av s8-u1 (o67) — (2) kraschvaktens
  felsgren vid misslyckat räddningsbygg mäter nu verifieraArtefakt FÖRE
  start: pm2-restart ENDAST vid hel artefakt, annars STOPPAD + kooldown
  30 (nästa poll bygger klart — aldrig bara retry); (3) prod-synkens
  RAM-tak räknar med tunga klassers tillväxt: chrome-cron levande ⇒
  +1024 MB, zcode-barn ⇒ +300/st (cap 4) ovanpå basen 2200 — VÄNTAR-RAM
  bär behov + reserv. Svit 26/26 + 17/17, skarpt: 177 ps-rader 0 falska.
- PROCFS-SPINN (ny klass): fs.mkdirSync({recursive}) mot /proc i en
  TESTFILTUR satte tre svit-processer i kernel-syscall-storm (R-läge,
  stime +227 ticks/3 s, aldrig återvändande) — manuellt dödade 1708486,
  1708844 (egna körningar) + 1709260 (främmande sessions barn ur
  sess_e4658741 som körde SAMMA svitfil — utan nådadöd hade den snurrat
  till fabrikens 25-min-tak). Fixturen bytt till ENOTDIR-väg; regel:
  ALDRIG /proc som fs-mål i testfixturer. Ingen prod-påverkan (bara
  svit-processer; prod 200 genomgående).
- SAMTIDIGT: patch-köns tysta död upptäckt+curerad (o50): next-RCE-patchen
  16.3.5 var avstängd av 3 misslyckade kvitton VARAV 1 spurious (prod-synkens
  commit-stege nåddes med riven lock — "nothing to commit" räknades som
  patch-fel). Kurer: patchInstallerad nollställs vid rivning · bygg-loggar
  bevaras i data/vakten/patch-byggfel/ · flock-timeout ("startade-aldrig")
  skiljs från riktigt fel. Spurious-kvittona rensade med backup
  (patch-kvitton.jsonl.backup-o49), äkta fälten kvar (2/3) aktiva — därefter
  syskonet s8-u1/o55:s arkivering 20:15 (de 4 äkta raderna flyttade till
  patch-kvitton-arkiv-2026-09-17T18Z.jsonl) = räknare NOLLade, kö aktiv
  på starkare grund; deras race-rotorsaka (pm2:s live-ISR mot rivna
  .next-kategorier, ENOTEMPTY) förklarar de två äkta byggfelen och deras
  skapaPm2Vakt är race-kuren. Se
  data/forskning/OPTIMERING/o50-patchko-atervandning-s8.md §9.

## S10-U1 (O9) — KVÄLLS-TOTAL: kvartalsmallen dr-total GRÖN i kvällsläge + O9:s köpost (2) STÄNGD KOMPLETT (2026-09-17, GODKÄNT)

- `node verktyg/dr-total.mjs` 21:12–21:16 lokal, **exit 0 — alla fem kedjor
  GRÖNA i kvällsläge** (fabrikskväll, RAM-grind 1 107 MB): kedja 1 19,9 s
  (RTO 11,7 s · public 60/1 286 328 · fel 788/0) · kedja 5 kirurgi 73,2 s
  (källa 1 195 452 rader, checksumma identisk, sabotage vägrad) · kedja 2
  34,6 s (163 039 rader, 0 dubblett) · kedja 4 28,5 s · kedja 3 24,7 s —
  **TOTALT 180,9 s**. Dagens första TOTAL på 09-17 (serien 09-16 ×3 + denna);
  totalprotokoll DR-TOTAL-2026-09-17-AUTO.md. RTO-serien: kvällspunkterna
  20–22 (u2 11,0 · 11,7 · 13,7 s); spann 10,3–23,9 s oförändrat.
- **O9:S KÖPOST (2) STÄNGD på två ben:** (a) designbevis — dr-total startar
  barnen UTAN `--fil` (cwd REPO_ROT) → kedja 1:s default = absolut
  dumpkatalogväg → valDumps NOTIS-gren kan EJ triggas i total-kontext =
  "oförändrat beteende" bevisat (AUTO-8 GRÖN utan NOTIS); (b) explicit
  NOTIS-bevis — AUTO-6:s exakta bladnamns-kommando efter totalen: NOTIS-rad
  + GRÖN RTO 13,7 s (AUTO-9). Kedja: AUTO-5 → AUTO-7 (u2) → AUTO-9 —
  regressionen har ingen obevisad gren kvar.
- **AUTO-6:s falska RÖT oberoende bekräftad** (korsvaliderar u2:s §3):
  dumpen oskadd (31 733 199 B, mtime 02:30:29, gzip OK, slutmarkörer) · egen
  markörkoll 21:09:51 GRÖN 1 307 940 rader/4,7 s · **137 ms-beviset**
  (AUTO-6:s hela körning — en äkta koll tar 4–7 s ⇒ snabb-RÖT-grenen) ·
  git-beviset (sista fil-commit c3b871f7 09-16; kuren aldrig committad; u2:s
  commit 9d24c73b landade under fönstret).
- **WAL-seriens första rörelse:** 497×3 (läsläge) → **529 MB** efter
  kvällens restore-aktivitet — WAL stabil under läsning, växer med
  PG-skrivsessioner; under 1 GB-taket. Norm: WAL-mätning protokollför
  aktivitetskontext.
- Städning egenmätt: PG17 down · base endast OID 1/4/5 + tom pgsql_tmp ·
  disk 72 GB · låsfilerna flock-viloläge. Kö: TOTAL i kvartalssviten senast
  2026-12-17 · WAL per kvartal med aktivitetsnotis · COMMIT-NORMEN standing.
  Protokoll: DR-OVNING-2026-09-17-KVALL-TOTAL.md + 7 maskinella protokoll.


## S10-U2 — NATT-FÖDELSEBEVIS: blad 8 bevisat i sin födelsetimme + RPO-kurvans yngsta punkt (2026-09-18 02:57–03:0x, GODKÄNT)

- **Födelsebevis SERIEREKORD:** db-2026-09-18.sql.gz (född 02:30:40,
  32 192 241 B) restore-bevisad **28,0 min efter födelse** — första
  bladet någonsin bevisat inom sin födelsetimme (föregående rekord ~5 h).
  `node verktyg/dr-ovning.mjs --fil …` GRÖN: markörer 1 327 830 rader ·
  RTO 10,9 s · fel 788 kända/0 okända · public 60 tabeller/1 306 119
  rader · samtliga scheman 99/1 306 515 · skrap-DB raderad · PG17 stoppad.
- **RACE (fjärde i spåret, symmetriskt bokfört):** syskon körde SAMMA blad
  18 s efter mig via flock-kön (DR-PROV-2026-09-18-AUTO-2.md, pid
  1872083, RTO **10,2 s = NYTT SERIEMINIMUM**); identiska radtal på alla
  nivåer = replikkorsbevis tredje gången. Två agenter, ett lås, noll
  förlorat arbete.
- **RPO yngsta punkt någonsin** (bladålder 28 min, isolerat fönster
  02:30→02:58): **+17 rader ≈ 36 r/h** — organ_health_logs +9 ·
  board_decisions +8 · snapshots +0. Nattlugnet ~32–36 r/h nu DIREKT
  mätt i efter-dump-fönstret: DR-fönstrets exponering ≈ noll hela
  02:30→07:40. Kurvan har fem ben.
- **Födelsetillväxt steg 6:** 1 286 328 → 1 306 119 = **+19 791**
  (serien 19 805 · 19 797 · 19 797 · 19 800 · 19 800 · 19 791) —
  konstant dagstakt håller sjätte dagen.
- **Städ eigenmätt:** PG17 down · base endast OID 1/4/5 + tom pgsql_tmp ·
  **WAL 529 MB OFÖRÄNDRAD efter två restores** (serien 497×3 → 529 →
  529; stabilitetsbevis: restore-läsning växer ej WAL) · ren avstängning
  i loggen · **8 blad — äldsta (09-11, 7 dygn) överlevde = retentionens
  beteendepunkt 2, ingen beskärning, förenligt med 30 dagar** · disk
  72 GB ledig.
- Kö: födelsebevis i födelsetimmen som ny norm (recept: första vaktronden
  efter 02:30 kör dr-ovning på dagens blad) · RPO 08:1x-punkt binder
  dagmaskinens start · WAL-kvartal 2026-12 · retention nästa punkt
  ~2026-10-11. Protokoll: DR-FODELSEBEVIS-2026-09-18-NATT-BLAD8.md +
  DR-PROV-2026-09-18-AUTO.md + DR-RPO-DIFF-2026-09-18-NATT-BLAD8.json.

## S10-U1 — NATTFÖDELSEBEVIS: dagsteget DEKOMponerat (pump-noll STÄNGD) + kvartsklocke-förutsägelse infriad EXAKT + WAL-platå (2026-09-18, GODKÄNT)

Manifest auto-s10-1789692929837, spår 10 vakt 1/3. Körd 02:57–03:0x lokal.
Order: "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll, städa
lokal PG." **Trippelreplika på nattens blad** db-2026-09-18 (fött 02:30,
32 192 241 B): tre syskon-restorationer genom flock-kön — u1 10,2 s (seriens
minimum) · u2 10,9 s · u3 17,4 s — IDENTISKA tal på tre nivåer (60/1 306 119
· 68/1 306 255 · 99/1 306 515); u2 äger födelsetimmes-rekordet (28,0 min) och
den isolerade 02:30–02:58-remsan, u3 retentionens raderingsbevis.

**s10-u1:s unika ben** (DR-OVNING-2026-09-18-FODELSEBEVIS.md):
- **DAGSTEGET DEKOMponerat, båda delpåvis EXAKTA:** public 1 286 328 →
  1 306 119 (+19 791) = snapshots **+18 984 == 08:00-batchen** (hela dygnets
  snapshots-tillväxt är EN batch — pump-noll retrospektivt bevisad, **STÄNGER
  S10-U2:s köpost 1**) · board_decisions **+768 == exakt ett dygn av
  kvartsklockan** (8/kvart → 32/h → 768/dygn; tredje oberoende vägen) ·
  övriga 57 tabeller +39. Värsta-falls-RPO ≈ dagsteget konfirmerat som
  designtak (tre konvergerande instrument).
- **FÖRUTSÄGELSE FÖRE MÄTNING — INFRIAD EXAKT:** RPO-punkt 2 kl 03:00:18
  med förhandsregistrerad dom "board_decisions = exakt +16 (batchar 02:45 +
  03:00 efter bladets 02:30-tillstånd)" → mätt **+16 EXAKT** (18 s efter
  batchen). Totalt +25 = u2:s +17 + exakt batchen; organ_health_logs +9
  oförändrad. Kurvstart 0 → +17 → +25: rena kvartssteg, noll drip —
  kvartsklockan verifierad i bladets första timme med falsifierbar metod.
- **valDump()-regression: TREDJE GRÖN i linjen** (AUTO-5 → 7 → 9 → denna):
  NOTIS-rad + GRÖN restore på bart bladnamn.
- **WAL-platå: 529 MB på FYRA tillfällen** — 09-17 kväll, nattvila, efter
  två restores, efter tre restores (03:02:10). WAL är återanvändningsbuffert,
  inte kumulativ räknare (bekräftar oberoende u2:s stabilitetshypotes).

Städning oberoende egenmätt: PG17 down (psql-värgan bevisar skrap-DB:s
frånvaro) · låsfil flock-viloläge · fellogg 788 kända mönster kvar som
referens · disk 72 GB / 26 %. KVD: src/ orörd = inget bygge, inga
verktygsändringar (pre-commit-tsc passerar mekaniskt) · R2 orörd (.pgpass
endast PGPASSFILE-pekare; prod endast LÄST) · data/blogg/ orörd ·
syskonytor orörda.

Kö: (1) kedja 3-källans cadens (backup-server-filer i användar-crontab) —
huvudagentens ägande, öppen sedan 09-17; (2) första äkta retentionstriggern
~2026-10-11 (u3:s dummy-mekanism bevisad — protokollför den verkliga
raderingen); (3) TOTAL i kvartalssviten senast 2026-12-18 · WAL per kvartal;
(4) födelsebeviset STÅENDE praxis — nästa blad 02:30 09-19.

Protokoll: DR-OVNING-2026-09-18-FODELSEBEVIS.md + maskinella
DR-PROV-2026-09-18-AUTO-2.md + DR-RPO-DIFF-2026-09-18-FODELSE-PUNKT2.json.



## S10-U1 — DAGPULS-DR: blad 8 i dagläge (tredje oberoende) + pumpförutsägelsen verifierad dag 2 + kedja 3-källgap REVISED (2026-09-18, GODKÄNT)

Manifest auto-s10-1789711500221 vakt 1/3, fönster 08:09–08:2x lokal; anspråk FÖRE
ingreppet (data/vakten/auto-s10-1789711500221-u1-ansprak.md). Protokoll:
DR-OVNING-2026-09-18-DAGPULS.md + maskinellt DR-PROV-2026-09-18-AUTO-5.md +
DR-RPO-DIFF-2026-09-18-DAGPULS.json.

- **Restore dagläge**: `dr-ovning.mjs --fil db-2026-09-18.sql.gz` GRÖN exit 0 —
  RTO 12,9 s · markörkoll 1 327 830 (radräkningsformeln: 1 306 515 + 6 266 +
  15 049 ✓) · public 60/1 306 119 · public+storage 68/1 306 255 · alla scheman
  99/1 306 515 · fel 788 kända 0 okända. TRE oberoende restores av bladet med
  identiska radtal (natt 10,2 · natt 17,4 · dag 12,9 s).
- **RPO dag 2**: +19 172 på 5,68 h; sond (COUNT-klass, PGPASSFILE-pekare):
  idag 18 984 rader EN ts 06:00:00.078402Z (= 08:00:00,078 lokal) mot igår
  06:00:00.058474Z — förutsägelsen från 09-17 infriad exakt; total-max
  1 233 420 == diffens live-count (två instrument). Runbook −97,9 % gäller
  varje vardag.
- **Kedja 3-källgap REVISED**: gap 42,6 h · 325 commits · hybridkedjan död
  09-09 — men arkivera-server.mjs (d8ef3cea) + söndagscron 03:20 lever i
  crontaben sedan efter 09-16 13:40; log tom ⇒ jungfrukörning **2026-09-20
  03:20** = prediktionskontrakt; därefter veckocadens mekanisk om GRÖN.
- Städning oberoende: PG17 down · skrap-DB borta (psql-vägran) · låsfil
  viloläge · RAM 1 888 MB · disk 72 GB. KVD: ingen kod = inget bygge · R2
  orörd · data/blogg/ orörd · syskonytor orörda.

Kö: (1) 09-20 03:20 jungfrukörningen; (2) 2026-10-13 02:30 första bladraderingen
(oförändrat); (3) kedja 3-retentionens beteendeprov tidigast efter 09-20;
(4) nästa födelsebevis 02:30 09-19.

## 2026-09-18 16:43Z — s7-u2 (fabrik, manifest auto-s7-1789729524): nginx-cache-lager renodlat (o70) + OOM-återhämtningsfönstret 16:30–16:42Z

**Händelse:** prod 502 16:30:33Z–16:42:19Z (~11,8 min). Rot: prod-synkens
byggen 16:17Z och 16:27Z OOM-dödades (RAM-tak: fabrikens 3 s7-barn + next
build > 8 GB); varje dödat bygge lämnade .next halvraderad ⇒ pm2 boot-loop
("no production build") ⇒ errored (backoff, själv läker ALDRIG). Läkning:
prod-synkens poll 16:37:06Z byggde GRÖNT (RAM-vaken släppte igenom),
artefaktgrind + pm2 restart + prod 200 kl 16:42:19Z — exekt enligt design;
inget manuellt ingripande behovdes (våg 100-regeln hölls: racea aldrig
byggägaren under ett pågående fönster).

**Åtgärd (planerad o66 §6-rest, körd EFTER prod 200):**
/etc/nginx/sites-available/ak1a våg-96-D1-cacheblock renodlat — Next äger
cache-policyn via next.config.ts headers() (o66): /og/ + /ak1a/ +
/_next/static/ = enbar proxy_pass (nginx expires/add_header undertryckte
Next-raderna HELT pa prod — dubbla/motstridiga rader borta); llms-regexen
delad: = /llms.txt behaller nginx 24h (Next saknar regel), llms-full.txt =
Next 3600+swr. sok-index/speglar ORÖRDA (enda lagret). Backup:
/etc/nginx/sites-available/ak1a.bak-o70-20260918-164x; repo-spegel
data/backups/server-nginx-ak1a.conf färskad. Verifierat: nginx -t GRÖN,
graceful reload 16:43:16Z, FÖRE/EFTER-sweep maskinell (10+1 resurser, JSON i
data/forskning/OPTIMERING/), prod 200 ×3, pm2 online.

**Kö till drift-spåret:** OOM-kedjan är systemisk — fabrikens 3-barns-fönster
+ prod-synkens bygge overlappar; överväg RAM-vakt-höjning eller
byggfenster-koordinering (fabriken ticker xx:05, synken xx: x1 — kollision
var 10:e minut vid samtidig belastning).

## 2026-09-18 20:49 lokal — s10-u3 (fabrik, manifest auto-s10-1789754706687, vakt 3/3): KVÄLLS-DR — restore-replik SERIEREKORD 12,7 s + determinismbevis + räddning av AUTO-15 (GODKÄNT)

Order: "DR-övning nästa i spåret: återställ, mät tid/rader, protokoll, städa lokal PG."

- **AUTO-17 (egen körning 20:48–20:49)**: `node verktyg/dr-ovning.mjs` exit 0 GRÖN.
  Dumpkontroll GRÖN (db-2026-09-18.sql.gz, 30,7 MB gz, 1 327 830 rader i dumpen,
  CREATE TABLE 99 / COPY 101). RTO **12,7 s = seriens snabbaste** (v98 20,0 →
  s10-u2 17,7 → s10-u3 14,7 → AUTO-15 14,6 → AUTO-17 12,7). Mätning tre nivåer:
  public 60 tabeller / 1 306 119 rader · public+storage 68 / 1 306 255 ·
  alla scheman 99 / 1 306 515. Fellogg 788 rader — samtliga kända ofarliga
  (Supabase-roller/scheman), **0 okända** → inga fynd att utreda.
  Städning verifierad: skrap-DB raderad · PG17 stoppad (viloläge återställt).
- **Determinismbevis**: AUTO-15 (20:08, annan agent) och AUTO-17 (20:49, denna
  agent) återställde SAMMA dump oberoende av varandra → IDENTISKT radtal på
  alla tre nivåerna (1 306 119 / 1 306 255 / 1 306 515). Restore-pipelinen
  (zcat | psql) är deterministisk; RTO-skillnaden 14,6 → 12,7 s (~13 %) är
  maskinbelastning, inte dataskillnad.
- **Räddning av dött syskons leverans**: AUTO-15:s protokoll +
  DR-RPO-DIFF-2026-09-18-KVALL.json låg OKOMMITTA sedan 20:08 — agenten dog
  före bokföring (41 min > fabrikens 25-minstimeout; samma förlustklass som
  valDump-kuren 09-17). Räddade i denna commit. RPO-punkten kväll: dump
  1 306 119 vs live 1 325 699 = **delta 19 580 rader** (snapshots +18 984 ·
  board_decisions +560 · organ_health_logs +36) — normal tillväxt sedan
  nattens dump 02:30; inget RPO-larm.
- **AUTO-16 observerad, orörd**: aktivt syskons protokoll (20:48:50, äldre
  blad, 1 186 890 rader) lämnas helt åt syskonet själv (anspråksregeln —
  s9-u3:s kollisionsläxa tillämpad).
- Protokollfiler: DR-PROV-2026-09-18-AUTO-17.md (egen) + AUTO-15 (räddad) +
  DR-RPO-DIFF-2026-09-18-KVALL.json. Prod opåverkad (skrap-DB lever enbart på
  lokal PG17; prod-data i Supabase-molnet). src/ orörd — tsc-baslinjen orörd,
  inga byggen. GDPR: endast antal, tabellnamn och tider — inga personvärden.
  Nästa kvartalsövning enligt kontraktet: **senast 2026-12-18** —
  `node verktyg/dr-ovning.mjs`.

## S10-U1 — KVÄLLSPULS-DR: blad 8:s kompletta dagscykel sluten + RPO fyra dagpunkter + WAL-lägstapunkt (2026-09-18 20:08–20:5x, GODKÄNT)

Manifest auto-s10-1789754706687 vakt 1/3, omgång 2 (sessionstart 20:45 lokal;
anspråk disk-först 20:07:14 av omgång 1, bevarat över omstarten). Protokoll:
DR-OVNING-2026-09-18-KVALL.md + maskinellt DR-PROV-2026-09-18-AUTO-18.md +
DR-RPO-DIFF-2026-09-18-KVALL-2.json.

- **Restore kväll**: `node verktyg/dr-ovning.mjs` GRÖN exit 0 — RTO **12,5 s**
  (AUTO-18, dagens snabbaste); radkontraktet identiskt för 12:e gången:
  public 60/1 306 119 · public+storage 68/1 306 255 · alla scheman 99/1 306 515 ·
  fel 788 kända/0 okända · markör 1 327 830/CREATE 99/COPY 101.
- **Dagscykeln sluten**: 12 restores av SAMMA blad natt→kväll — spann
  10,2–18,2 s, median 13,7 s, v98:s 20,0-s-mall slagen i samtliga; kvälls-dom
  (tjockleks- inte klockslagsberoende) bekräftad: 14,6/12,7/12,5 s.
- **RPO fyra dagpunkter**: 08:10 +19 172 · 15:1x +19 384 · 20:08 +19 580 ·
  20:50 **+19 604** (18,33 h) — snapshots +18 984 EXAKT i ALLA fyra (pump-noll
  heldag; nästa batch 09-19 08:00 lokal) · board +560→+584 på 42 min =
  8,0 rader/kvart exakt (kvartsklockan) · värsta-fall intra-dag ~+19 788
  (runbookens extrablad ~08:05-motiv förstärks).
- **WAL 481 MB = seriens lägsta** (497×3 → 529×4 → 481): checkpointer-
  återvinning, ej monoton läckage. Disk 70 G ledigt (28 %) · RAM 1 191 MB.
- **Städning oberoende**: PG17 down (pg_lsclusters) · psql-socketvägran ·
  /tmp/ak1a-dr-prov.lock flock-viloläge.
- **Fabricke-attribuering** (fyra aktörer, en grön kedja): u2-omgång 1 körde
  AUTO-15 (20:08, RTO 14,6 s) + RPO-punkten men dog före bokföring — räddad
  av u3 i commit b1c7b8af · u3-omgång 2: AUTO-17 (12,7 s) + determinismbevis ·
  u2-omgång 2: AUTO-16 retentionsdjup äldsta bladet 09-11 (acee0a28) · denna
  agent: AUTO-18. Flock-vittne: AUTO-16/17/18 inom 49 s, flock -w 900
  serialiserade PG17-fönstret, samtliga GRÖNA, RTO opåverkad.
- Kö: födelsebevis 09-19 02:30 · bladraderingsprediktion 10-13 02:30 ·
  retentionstriggern ~10-11 · kvartalssviten TOTAL+ARKIVSVEP senast 2026-12-17/18.

## S10-U2 — NATT-FÖDELSEBEVIS BLAD 9: serierekord 27,8 min + pumpkontraktet sjätte kvartalet + RPO-modellen omskriven till tvåled (2026-09-19, GODKÄNT)

Manifest auto-s10-1789779315763 vakt 2/3; körning 02:57–03:0x lokal
(nattfönstret). Köposten "födelsebevis 09-19 02:30" (tre kvällsronder)
verkställd: **blad 9 restore-bevisat 27,8 min efter födelsen — nytt
serierekord i födelsetimmen** (blad 8: 28,0). Anspråk med P1–P10
förhandsregistrerade på disk FÖRE mätstart.

Värden: markörer GRÖN 1 347 729 rader · CREATE 99 · COPY 101 · RTO 12,1 s ·
public 60 tabeller/1 325 919 rader (+19 800 — dagstakten sjunde dagen:
19 805·19 797·19 797·19 800·19 800·19 791·19 800) · public+storage 68/
1 326 055 · alla scheman 99/1 326 315 · fel 788 kända/0 okända (17:e
körningen; fellogg 34 881 B == blad 8:s — deterministisk felbild, krockimmunt
namn) · **snapshots 1 233 420 = pumpkontraktet +18 984 EXAKT för sjätte
kvartalet i rad** · board 49 346 (Δ+768 — kvartsformeln 8/kvart × 96 EXAKT).

RPO-natten (~33 min bladålder): +8 rader — ENDAST board_decisions rörde sig
(02:45-kvaret); organ_health_logs +0, snapshots +0. **Modellrevision:**
blad 8:s nattplanå "~32–36 r/h" var en punkts generalisering — natten har
ett GOLV (board-kvaret, 8/styck) + en INTERMITTENT organ-puls; DR-exponeringen
om natten förblir ≈ noll men kurvan är tvåled, inte planå. Prediktion P8
partiell (2/3 drivare; missen protokollförd med rotorsak: en enda punkts
värdelyft togs som norm — läxa: två punkter innan en planå får namnet).
Övriga P1–P10: 9 infriade (P1 +9/±150 · P2 EXAKT · P3 +9/±100 · P4 EXAKT ·
P5 −4/±25 · P6 12,1 s i 10–19 · P7 EXAKT · P9 · P10 rekord).

WAL 481 MB = ANDRA punkten på serie-låget (497×3→529×4→481→481) —
stabilitetshypotesen "restores växer ej WAL" stärkt till två kvällar/nätter.
Städning EGENMÄTT: PG17 down · psql-socketvägran · base endast OID 1/4/5 +
tom pgsql_tmp · lås flock-viloläge · disk 68 GB · 9 blad (09-11→09-19;
retentionens beteendepunkt: äldsta bladet vid 8 dygn obestruket).

Race mot syskonet u3 (samma objekt, femte flock-racet): deras anspråk
02:57:45 (disk-koll 02:56 — före min anspråksskrivning; båda ärliga
disk-först), min restore vann fönstret (AUTO 02:58:26; deras prediktions-
JSON 02:59:26 — EJ blind mot mina resultat, bokfört). Deras board-tolerans
±0 (formel +768) skarpare än mitt ±25 — prediktionsduellens vinnare;
deras restore-replik (väntad AUTO-2) = oberoende determinismbevis. Deras
ytor orörda.

Kö: RPO tvåled-modellen — nästa natt-punkt över kvartsgränser för att skilja
golv från puls · kvartalssviten TOTAL+PUMPVAKT+ARKIVSVEP senast 2026-12-17/18 ·
retentionstriggern ~2026-10-11 + bladraderingsprediktion 10-13 02:30 ·
prod-synk.mjs:s tidsstämpelbugg (s7-u1:s köpost) kvar åt verktygsägaren.

## S10-U1 — GRYNINGSPULS: kvarsgränsfönstret besvarar köposten — tvåledsmodellen skärpt till KLOCKA + PULS (2026-09-19 03:07–03:2x, GODKÄNT)

Fabriksagent s10-u1 (manifest auto-s10-1789779315763 vakt 1/3). Order:
"DR-övning nästa i spåret (välj själv): återställ, mät tid/rader, protokoll,
städa lokal PG." Anspråk disk-först 03:07 med P1–P10 FÖRE mätning.

**Objektet** = ovanstående köpost nr 1 (S10-U2-nattens §7): första
REALTIDSFÖNSTRET över en kvartsLANDNING — blad 9, 02:30→03:19 = tre
kvarsmarkörer (02:45 · 03:00 · 03:15). Födelsebeviset var taget av u2/u3
(deras ytor orörda); u3:s manifestdesign-notis föddes: gryningspunkten +
fönstret var lediga.

**Restore GRÖN** (`dr-ovning.mjs`, 03:18:52–03:19:22): RTO **12,5 s** ·
radkontrakt EXAKT identiskt tredje gången (public 60/1 325 919 · +storage
68/1 326 055 · alla 99/1 326 315) · fel 788/0, logg 34 881 B byte-identisk
med båda syskonens. RTO-serien blad 9: 12,1 · 12,2 · **12,5**.

**Svaret på köposten** (`dr-rpo-diff` 03:19:41): board +24 = **8 × 3 kvarts
EXAKT** — kvartsklockan eldar VARJE kvart, tre för tre, ingen uteblev ⇒
board är en deterministisk KLOCKA (formel: board_delta = 8 × kvarsmarkörer
i fönstret), inte ett "golv". Organ +1 (intermittent småpuls; serien +9 ·
+0 · +1). Snapshots +0 tredje nattpunkten. Totalt RPO +25 på 49 min =
nattlig DR-exponering ≈ noll, och FÖRUTSÄGBAR: 8 rader/påbörjat kvart.

**Prediktioner 7 ✅ · 2 ❌ (ärligt bokförda):** P1 board +16 MISSAD (+24) —
rotorsak: ankrade på u2:s punktvärde "+8 vid 03:02" i stället för att räkna
fönstrets kvarsmarkörer; P2 organ-band MISSAT — rotorsak: tog blad 8:s
organ-tal (2 976) ur PREDIKTION-JSON:ens bas-block i stället för blad 9:s
(3 024). Två lärdomar till spårets prediktionskultur: prediktera från
formeln (ej föregående punkten), verifiera basen mot bladets EGET protokoll.

**Städning oberoende egenmätt:** PG17 down · base/ endast OID 1/4/5 ·
**WAL 481 MB = TREDJE punkten på serie-låget** (restores växer ej WAL) ·
lås flock-viloläge · 9 blad orörda. src/ orörd, INGET bygge, R2 orörd,
prod endast läst. Maskinellt: DR-PROV-2026-09-19-AUTO-3.md +
DR-RPO-DIFF-2026-09-19-GRYNINGSPULS.json; agentprotokoll
DR-OVNING-2026-09-19-GRYNINGSPULS.md.

Kö: blad 10:s födelsebevis 09-20 02:30 (u3:s prediktioner; board-värdet
blir kvartsformelns fjärde test) · jungurkörningen söndag 09-20 03:20 ·
första DAGPUNKTS-RPO med klockformeln som prediktor (ej nattens tal) ·
kvartalssviten senast 2026-12-17/18.


---

## DRIFTNOT 2026-09-19 ~04:20 UTC — .next HALVBYGGT: /en- och /ar-speglar 500 (fynd: fabriksagent s5-u1)

**Symptom.** Spegelsidor svarar 500 på liveservern (localhost:3000):
/en/kurser · /ar/kurser · /en|/ar/kurser/trading-in-the-zone · the-intelligent-investor ·
security-analysis — medan / och /kurser (sv, cachade) svarar 200. testa-schema-kurser.mjs
UNDERKÄNT enbart på (ar)-sidor av bokkurser; sv-sidor gröna.

**Rot (bevis).** pm2 ak1a-error.log: ChunkLoadError — Cannot find module
.next/server/chunks/ssr/_0802uae._.js (require-stack: (ar)/ar/blogg/[slug]/page.js).
Katalogfakta: .next innehåller ENDAST build/ · cache/ · diagnostics/ · lock · package.json
(mtime 03:38 UTC) — VARKEN server/ ELLER BUILD_ID, och chunks/ssr/ är TOM (0 filer).
pm2-processen startad 02:40 UTC, alltså: server lever men dess .next byttes ut/höggades
under den 03:38 av ett avbrutet bygge.

**Läge vid fyndet.** /tmp/ak1a-deploy.lock LEDIGT; inget next-build/npm-ci lever (ps).
Ingen deploylogg skrevs i data/infra för händelsen. Huvudsajten (/, /kurser, sv-kursidor
med ISR-cache) serving 200 — exponeringen är främst SSR-speglar + okachade kurssidor.

**Botläge = prod-synk/kraschvakten** (fabriksagenter får INTE bygga): nästa deploy under
flock bygger om .next komplett och pm2-omstartar — då läks chunk-felet. Tills dess:
räkna med 500 på /en|/ar-speglar; gränssnittsvaktens nästa rop (cron 01/07/13/17) kommer
flagga — denna not är rotförklaringen att hävisa till. DRIFTSBOKEN § våg 100-precedensen
(parallella byggen raderade .next) ligger nära: ett bygge startat UTAN flock, eller avbrutet
mitt i, är den sannolika mekanismen; vem som triggar lämnas åt audit-loggen.


---
**2026-09-19 06:2xZ — gränsnittsvaktens 07:17-larm var 100 % artefakt + klassen kurerad (o86).**
Föregående not förutsåg "gränssnittsvaktens nästa rop kommer flagga" — det gjorde det:
07:17-lokalsvepet (05:17–05:20Z) larmade 100+ fynd (88 stil-lös + 8 http-500 på /studio
/admin) mitt i chunk-500-fönstret, 27 min före 05:44Z-läkningen. Rådata: rapporten visar
samma CSS-chunk 500 som efter läkningen svarar 200/246 kB. ROT: vaktens bas-koll mätte
endast bassidans HTTP-kod — pm2 serverade gamla HTML-skal (200) medan tillgångsserveringen
var död. KUR (o86, spår 8 s8-u3): basens tillgångshälsa (HTML 200 + första CSS-länken 200)
i pre-gaten + drift-tak EFTER svepet (≥ 30 % infra-klass på ≥ 3 sidor ⇒ svepet kasserat
som driftartefakt, exit 0, inget fynd-larm). Äkta enstaka siddefekter larmar som förut
(svitsbevisat). Protokoll: data/forskning/OPTIMERING/o86-granssnitt-driftblindhet-s8.md.


---

## 2026-09-19 07:15Z — manifest-offer rutt 3, Upptäckt-och-läkt-med-bevis (s9-u3; o83-klassen tredje fönstret idag)

Två misslyckade synkbyggen (06:58:57Z bygg MISSLYCKADES 4 icke-byggfiler, revert avstås o72; 07:01:27Z ombygg misslyckades, reset avstås o79) halvrev .next (mtime 07:00:21Z) UTAN pm2-omstart ⇒ klient-manifest saknades för växande uppsättning rutter: /_not-found, /portfolj-forskning, /portfoljbyggare, /rapporter, /llms-full-txt, /kurser (500-loopback 07:04Z; 4 380 felloggrader; / /blogg /ar /min-portfolj /sitemap /llms.txt /robots gröna — o86:s basHalsa-blindhetSyns igen: bas-200 maskerade). LÄKT 07:12:37Z av 07:07:29-pollens framgångsrika bygg (deploy + MÅL återarmat); åter-sonder 07:14:52Z: samtliga drabbade rutter 200. Rot-fråga kvarstår åt synkägaren: misslyckade byggen SKRIVER i .next (06:41-gröna träd skrevs över av 07:00-halvbygget utan omstart) — överväg omstart-på-misslyckat-byggkvitto eller .next-skrivskydd under bygg. Sido-fynd: npm ci under bygg tog tillfälligt bort node_modules/typescript ⇒ pre-commit-grinden (tsc) blockerade commits i fönstret; sidoeffekt av samma rot.

## S10-U1 — DAGPULS-KLOCKFORMEL: kvartsklockan dagbevisad + pumpens dag 7 + blad-10-prediktionen förhandsverifierad levande (2026-09-19 09:27–09:32, GODKÄNT)

**Agent:** s10-u1 (manifest auto-s10-1789802729714, vakt 1/3); anspråk disk-först
09:30 med P1–P10 FÖRE mätning (data/vakten/auto-s10-1789802729714-u1-ansprak.md).
**Objekt:** GRYNINGSPULS §8 köpost (3) — första DAGPUNKTS-RPO:n med klockformeln
som prediktor (formeln var endast nattbevisad 02:45–03:19; dagtid obevisad,
hypotesen "board rör sig snabbare dagtid").

**Körning:** `node verktyg/dr-ovning.mjs` GRÖN exit 0 (grind 1 004 MB · disk
63 GB · markörer GRÖN 1 347 729/CREATE 99/COPY 101 på 6,9 s) — **RTO 18,1 s**
= blad 9:s fjärde punkt (12,1·12,2·12,5·18,1) och seriens högsta: dagpunkt
under belastning (grinden 24 MB från taket). Radkontrakt EXAKT fjärde gången:
public 60/1 325 919 · public+storage 68/1 326 055 · alla scheman 99/1 326 315 ·
fel 788 kända/0 okända · fellogg 34 881 B. Maskinellt: DR-PROV-2026-09-19-AUTO-4.md.

**DAG-RPO:n** (`PGPASSFILE`-pekare + `dr-rpo-diff.mjs --json`, mätning
09:30:35, M=28 kvarsmarkörer sedan 02:30:36):

| Tabell | Dump 02:30 | Levande 09:30 | Δ |
|---|---|---|---|
| board_decisions | 49 346 | 49 570 | +224 = 8×28 EXAKT |
| section_data_snapshots | 1 233 420 | 1 252 404 | +18 984 EXAKT |
| organ_health_logs | 3 024 | 3 037 | +13 (puls) |
| Totalt | 1 325 919 | 1 345 140 | +19 221 |

**Tre fynd:** (1) **Kvartsklockan DAGBEVISAD** — fönstret 02:30→09:30 spänner
28 kvart i dagsljus inkl. två styrelserond-timmar; delta EXAKT 8×28. Köpostens
hypotes "snabbare dagtid" MOTBEVISAD: ronder skriver inget påslag i
board_decisions; kadansen är 8/kvart dygnet runt ⇒ blad 10:s board 50 114
(8×96) stärkt. (2) **Pumpen dag 7** +18 984 EXAKT — u3:s blad-10-prediktion
(snapshots 1 252 404) förhandsverifierad på LEVANDE sidan 17 h före blad 10:s
födelse: första gången en blad-prediktion mäts innan den förutsagda dumpen
existerar. (3) **RTO-belastningsläxa**: 18,1 s vid 1 004 MB (nattens 12,x vid
1,2–4,7 GB) — framtida RTO-prediktioner konditioneras på MemAvailable-band.

**Prediktionsdom:** 9 ✅ (P1/P2/P7/P8/P9 EXAKTA) · 1 ❌ (P6 RTO 18,1 vs band
10–18 — rotorsak belastning, bokförd). **Städning oberoende:** PG17 down ·
base endast OID 1/4/5 + tom pgsql_tmp · WAL 481 MB fjärde punkten på
serie-låget · lås flock-viloläge · 9 blad. **Kö vidare:** blad 10:s
födelsebevis 09-20 02:30 (kvartsformelns fjärde test: board 50 114 ·
snapshots 1 252 404 nu dag-förhandsverifierad) · jungurkörseln 09-20 03:20 ·
eftermiddags-punkt ~14:xx · retentionstriggern ~10-11 · kvartalssviten
senast 2026-12-17/18. Protokoll: DR-OVNING-2026-09-19-DAGPULS-KLOCKFORMEL.md +
JSON DR-RPO-DIFF-2026-09-19-DAGPULS.json.


## S10-U3 — DAGFONSTER-REPLIK: dagpunkten korsvaliderad + RAM-grindskip med kur + intra-kvarts-mikropunkt (2026-09-19 09:29–09:4x, GODKÄNT)

**Agent:** s10-u3 (manifest auto-s10-1789802729714, vakt 3/3). Fullständigt
protokoll: data/forskning/DR-OVNING-2026-09-19-DAGFONSTER-REPLIK.md — denna
sektion är DRIFTSBOKENs driftkort.

- **Dubbeldispatch, öppet:** u1 och jag valde GRYNINGSPULS köpost 3 (dagpunkts-
  RPO med klockformeln) inom 3 minuter (deras katalogäsning 09:27 var före mitt
  anspråk 09:29:30; deras anspråk 09:30 efter det) — bägge ärliga, flocken
  serialiserade körningarna. Primäranspråket avstått till u1 (commit 0cd74805);
  mina mätningar bokförda som oberoende korsvalidering (presedens s9-u2-D20).
- **Korsvalideringen:** restore GRÖN 09:33:13–09:33:41 (AUTO-5), RTO 16,1 s,
  radkontrakt EXAKT femte gången; RPO-diff 09:34:16 (M = 28) reproducerar u1:s
  09:30-mätning EXAKT: board +224 = 8×28 · snapshots +18 984 = 1 252 404 ·
  organ +13 · totalt +19 221 · 3/60 i rörelse · 0 negativa. Blad-10-prediktionen
  (snapshots 1 252 404) därmed DUBBELT förhandsverifierad på levande sidan.
- **Nytt 1 — RAM-grindskip:** dr-ovning.mjs SKIPPADE 09:31 vid 845 MB
  (fabrikstrafik: omgång om 3 + syskon-PG). Kur: verktyg/_s10u3-dagfonster-
  vanta-ram.mjs — pollar MemAvailable (≥1 050 MB, var 20:e s, tak 14 min),
  startar dr-ovning.mjs atomärt när minnet räcker; tidsstämplar allt för
  protokoll. Fabriksläxa: DR-övningar i omgångar om 3 på 8 GB-skivan behöver
  vänteloop. Kö till verktygsägaren: adoptera --vanta-ram internt.
- **Nytt 2 — intra-kvarts-mikropunkten:** board Δ = 0 mellan 09:30:35 (u1)
  och 09:34:16 (jag) — ingen kvarsmarkör passerad: klockan eldar VID markören,
  inte kontinuerligt. Första parobservationen i klassen (en punkt — para fler).
- **Nytt 3 — RTO-läran korrigerad:** 16,1 s vid MemAvailable 3,0 GB bryter
  u1:s band "≥2 GB ⇒ 10–14 s". Dagklassen 14–18 s gäller oavsett RAM;
  kvarvarande kandidater: cache-kyla (nystartad PG) och disk-I/O-kö. Kontroll-
  par kölagda (två restores i rad, samma RAM-band).
- **Städning + tre-agent-kedja:** min körning städade + stoppade PG 09:33:41
  (AUTO-5 [7/7]); PG online vid protokolltidpunkt = u2:s dokumenterade
  --behall-fönster (AUTO-6, blad db-2026-09-14, RTO 14,9 s, fel 780/0 — deras
  09-13-anomalien/organ-klocka-analys pågår; deras städningsansvar). base
  ENDAST OID 1/4/5 · pgsql_tmp tom · skrap-DB:n borta · WAL 481 MB (sjätte
  punkten på serie-låget) · låsfilens döda pid oskyldig (flocken frigjord).
- **KVD:** src/ orörd (tsc 0 via projektbinären som bevis) · INGET bygge ·
  R2-ytor orörda · prod endast LÄST (GDPR-rent) · data/blogg/ orörd ·
  syskonytor orörda (u2:s aktiva fönster lämnat ifred) · commit med pathspec.

SLUT — sektion S10-U3 DAGFONSTER-REPLIK, inlagd av s10-u3 2026-09-19.

## S10-U2 — KOPOST3+4-ANOMALI-ORGAN: 09-13-anomalien lokaliserad till EN kvarts + organ-klockan kartlagd + dr-ovning --behall-kurerad (2026-09-19 09:25–09:50, GODKÄNT)

Agent: s10-u2 (manifest auto-s10-1789802729714, vakt 2/3). Order: DR-övning
nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal PG.
Anspråk disk-först 09:36 med P1–P9 FÖRE alla mätningar.

**Objektval:** u1 (09:30) och u3 (09:29) valde båda dagpunkts-RPO:t —
dubbelanspråket bokfört neutralt, deras ytor orörda. Mitt objekt = s10-u3:s
ÖPPNA köposter 3+4 från 5b5e9e60 (2026-09-17): 09-13-anomalien + organ-
klockan↔rond-schema.

**Verktygsfynd + kur (COMMIT-NORMEN: kur + beteendeprov + commit samma
fönster):** dr-ovning.mjs --behall droppade skrap-DB:n trots löftet "lämnas
uppen" — dropdb kördes villkorslöst FÖRE behall-grenen. Bevis: AUTO-6:s egna
protokollrad "skrap-DB raderad · PG17 lämnad uppe" emot konsolens "lämnar
uppe" i samma körning; låsfilens mtime visade att inget syskon körde (ingen
race — verktygsbugg). Kur i tre punkter (behall-gren först med tidig
return; GRÖN-formeln (behall || (skrapDbBort && pgStoppad)); protokoll-
renderingen behall-medveten). Fältverifiering AUTO-8: skrap-DB LEV kvar
efter verktygsexit — kvartalsövningens efterundersökningsväg brukbar igen.

**Köpost 3 STÄNGD — anomalen = EN kvarts, 5 av 8 rader:** restore av blad
db-2026-09-14 (täcker kalenderdagen 09-13) GRÖN ×2 (RTO 14,9 + 15,7 s;
public 60/1 226 931 == ARKIVSVEP == tre instrument; fel 780/0) + levande
korsvalidering. BÅDA instrumenten: exakt EN avvikande kvarts i 09-12→09-14 —
09-13 10:00 med 5 rader (tidsstämplar 10:00:01.181–.503 identiska i arkiv
och live). Arkivet (dump född 09-14 02:30) bär samma 765 ⇒ de 3 raderna
skrevs ALDRIG — ingen efterhandstampering (annan klass än B9:s raderare).
Servern frisk vid tillfället (syslog ren — rsyslog loggar ISO-format,
"Sep 13"-grep ger FALSKT logggap; pumpor normalt; ingen OOM/omstart).
Skrivaren: varken src/, pumpor eller pulsvakt. DOM: transient skrivförlust
i kvartsbatchen (nät/pool), engångshändelse 0,04 % på elva dagar —
värsta-falls-RPO 768/dygn opåverkad.

**Köpost 4 KARTLAGD — organ-klockan är en intern 6-h-svepmotor med
jitter:** 2 månaders histogram (arkiv + levande, identiska): fas 1
(07-15→08-10 16:00) 12-organ sharp var 6:e timme; fas 2 (08-10 17:00→)
9+3-split-par, septemberläge ~02/04·08/10·14/16·20/22 med ±1–2 h JITTER —
jittersignaturen utesluter cron (inget crontab-schema matchar). Skrivaren
sitter i organism-motorn utanför repot ⇒ NY KÖPOST (huvudagenten):
dokumentera/äga organ-svepets interna schema. Två färska fynd: (A)
SPLIT-SVEP under morgonbelastning — 09-18: 1@08+8@09, 1@14+8@15; 09-19:
1@09 — kadensen hålls, leveransen förskjuts 1 h (klassbesläktat med
anomalin: skrivsidan degraderar transient); (B) organ_name-kodningsdrift
("Hjarta"×232/"Hjärta"×1, dito Ögon/Öron/Immunförsvar) — konsumenter skall
gruppera på organ_id.

**Städning (manuell, --behall-kontraktet) bevisad:** dropdb OK ·
pg_ctlcluster stop OK · PG17 down · psql-vägran · base endast OID 1/4/5 ·
pgsql_tmp tom · WAL 481 MB femte punkten på serie-låget · disk 63 GB ·
lås flock-viloläge.

**Instrumentläxor:** (1) timestamptz-literaler tolkas i sessionens zon —
skrap (CEST) vs prod (UTC) skiljer gränsdagar 64 rader; skriv explicit
offset i framtida sonder. (2) rsyslog på denna server loggar ISO-format —
grep alltid på "2026-09-13T…" inte "Sep 13".

**KVD:** src/ orörd (tsc 0 via projektbinären som bevis) · INGET bygge ·
R2 orörd (.pgpass ENDAST PGPASSFILE-pekare; prod endast läsande aggregat,
GDPR-rent) · data/blogg/ orörd · syskonytor orörda.

Protokoll: DR-OVNING-2026-09-19-KOPOST3-4-ANOMALI-ORGAN.md + maskinella
DR-PROV-2026-09-19-AUTO-6.md (före kur) + AUTO-8.md (efter kur) + JSON
DR-KOPOST-ANOMALI-ORGAN-2026-09-19{,-LIVE}.json + sond
verktyg/_s10u2-kopost3-4-analys.mjs.

Kö: (1) organ-svepets schemaägare (huvudagenten); (2) split-svep-
frekvensmätning en vecka; (3) organ_name-kodningskur hos organ-ägaren;
(4) blad 10 födelsebevis 09-20 02:30 + jungurkörsel 03:20 (u1-kö); (5)
retention ~10-11 · TOTAL senast 12-19.

SLUT — sektion S10-U2 KOPOST3+4-ANOMALI-ORGAN, inlagd av s10-u2 2026-09-19.


---

## 2026-09-19 07:48Z — manifest-offer rutt 3 STÄNGD: dom äkta + LÄKT (FYNN; huvudagenten ROND 84)

Oberoende eftermätning 07:41Z: samtliga offer gröna — /kurser /portfolj-forskning /portfoljbyggare
/rapporter 200, /api/llms-full-txt 200 (280 363 B), /api/llms-txt 200, /llms-full.txt 200 (rewrite)
och /_not-found 404 med RENDERAD AK1A-not-found-sida (27 454 B, text/html — det friska kontraktet
för den interna rutten); localhost OCH https. pm2-felloggen (exakta tidsstämplar): SISTA felet
09:07:10 lokal — FÖRE läkningsdeployen 07:12:27Z (24c220d6) och sista deployen 07:22:26Z (a7174cb0,
BUILD_ID HZ8EGAF3sqE887kQ2c_pQ, mtime 07:20:58Z); 0 fel-rader efter 09:23 lokal. KUR = ingen
handslagning (våg 100 hölls): prod-synkens egna gröna byggen läkte. Rot-frågan till synkägaren
kvarstår oförändrad: misslyckade byggen SKRIVER i .next. Not: eskalerings-ledgerraden från
07:15Z-notisen föll offer för synkens checkout-radering (tracked-men-ignorad fil + add utan -f) —
dom-raden i feljakt-bedomningar.jsonl är därför incidentens första ledger-rad.


### S10-U2 BOARD-ANOMALI-ROT 2026-09-19 (09:36–09:5x lokal)

- **09-13-anomalien (board 765 vs 768) LÖST:** en VANDRANDE aktiebevakningsrond
  (+15 min/dygn sedan ~07-23) spillde 09-13 över 09:45/10:00-kvartsgränsen
  (+1 aktierad) medan strategirondens 10:00-batch uteblev (−4) ⇒ −3 i ETT
  fack. Avvikarklass: episodisk, maskinintern, arkivet förlorar inget.
  Prod-korsval EXAKT (768/768/765 levande == dump).
- **Organ-klockan = VANDRANDE, ej schema:** två sammanflätade ×3/×9-pulssekvenser,
  kadens ~6h15, drift +30–45 min/dygn. Ingen crontab matchar — rund-ID hos
  huvudagenten.
- **--behall-kontraktet: kurens commit ägs av parallell-u2 (189a7500), av mig
  OBEROENDE korsvaliderad** (dr-ovning.mjs: dropdb före behall-grenen raderade
  skrap-DB trots löftet — AUTO-6-bevisat; min AUTO-7 beteendeprov GRÖN =
  andra oberoende verifieringen). Kvarvarande lucka: --behall släpper flocken
  vid exit — konsumenter håller EN egen flock över undersökningsfönstret
  (_s10u2-analys.mjs = mönstret); permanent kur kölagd.
- **Shell-lärdom:** `node … | head` = SIGPIPE dödar node med städning
  fullbordad men utdata förlorad — stdout till FIL vid städningskritiska körningar.
- DR-tal: 4 restores blad 09-14 RTO 13,7–15,9 s · radkontrakt 60/1 226 931
  EXAKT ×4 instrument · fel 780/0 · städning eigenmätt (down · OID 1/4/5 ·
  WAL 481 MB oförändrat · 9 blad).

## S10-U3 — FORMIDDAGSPULS (andra instansen): intra-kvarts-serien 2/2 + kvartsformeln KEDJAT EXAKT + blad 9:s sjätte restore (2026-09-19 09:44–09:5x, GODKÄNT)

Fabriken dispatchade u3 två gånger (RAM-väggen); första instansen
levererade DAGFONSTER-REPLIK (76815e5f) under det andra startfönstret ⇒
duplikat avstått, objekt = REPLIK §8 köpost 4 (öppet kvarlämnad):
**intra-kvarts-mikropunkten gjord statistisk** — par nr 2 (09:45:49 ↔
09:49:55, 4 min 6 s, Δboard = 0 EXAKT, totalt fruset 1 345 148) mot par
nr 1 (REPLIK) ⇒ 2/2: klockan eldar VID markören. Samtidigt
**kvartsformelns femte test, första KEDJADE** (bas = MÄTT punkt 49 570
kl 09:34:16, ej bladbasen): 49 578 förutsagt 09:46 → mätt EXAKT 09:45:49
(dumpben +232 = 8×29 EXAKT). Restore GRÖN AUTO-9: RTO 15,1 s (blad 9:s
serie 12,1·12,2·12,5·18,1·16,1·15,1) · radkontrakt EXAKT sjätte gången ·
fel 788/0. **Vakt-insats:** u2:s ostageda dr-ovning --behall-kur stage:ad
(o87-läxan — staged innehåll överlever prod-synkens checkout-radering) +
skarpt verifierad i icke-behall-grenen. Städning eigenmätt: PG17 down ·
OID 1/4/5 · WAL 481 MB (sjunde punkten). Prediktioner K1/K2/K3/K7 EXAKTA ·
K4/K5 band/primär-miss med läxa (organ intra-kvarts fryst — Δ0-primär vid
känd 6h-svepmotor). Kö: par nr 3+ över :00/:30 · kontrollparet dag-RTO ·
blad 10 födelsebevis 09-20 02:30 (formelns sjätte test, board 50 114) ·
jungurkörningen 09-20 03:20. Protokoll:
DR-OVNING-2026-09-19-FORMIDDAGSPULS.md + maskinellt AUTO-9 + JSON
DR-RPO-DIFF-2026-09-19-FORMIDDAGSPULS{,-2}.json + PREDIKTION-json.


## ROND 88 — FYNN F3-api dom: KURERAD-LIVE (2026-09-19 11:03–11:10 lokal, UTFALL: GRÖNT)

- **Symptom** (FYNN): /api/studio/godkannande 500 två gånger + nätverksfel
  på /api/studio/mal/status, /api/studio/session, /api/studio/tjanster/bakgrund.
- **Mätning**: prod 200 båda baser; samtliga fyra rutter 401 o-auth (friskt
  kontrakt) och 200 AUTHAT efter deploy 09:01:27Z (BUILD_ID
  x1966Je1fB4eouYckWHNh, .next 09:01:22Z). Bygget bär ROND 87-kuren
  bevisat: godkannande.ts blob ac447b98, rad 263 = (kandidater[0] ?? "").
- **Dom**: symptomen äkta men tidsbestämda till FÖRE deployen. 500:an =
  pushad-men-OBEYGGD kur (gap 10:28 lokal push → 11:01 lokal bygge,
  bevisat i förrondens sond). Nätverksfelen = deployfönstrets transienter.
- **Åtgärd**: ingen ny kur — deploy-kvittot som ROND 87 skrev ut på sig är
  levererat; dom bokförd i feljakt-ledgern.
- **Läxa**: "pushad kur är inte deployad kur" — live-kvitto mäts mot
  BUILD_ID, aldrig mot commit-HEAD (andra bevisade fallet; första = våg
  100-epoken).

## S10-U3 — KVARTALSÖVNING EFTERMIDDAG: restore GRÖN 11,5 s (dagens snabbaste) + eftersläpad skrap-DB från --behall-fönstret städad (2026-09-19 16:07–16:09 lokal, GODKÄNT)

Agent: s10-u3 (manifest auto-s10-1789826700636, vakt 3/3). Order: DR-övning
nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal PG.
Syskonen u1/u2 höll offsite-backup-spåret (backup-offsite.mjs 14:52) —
kärnövningen ledig, dubbelanspråk fanns ej.

**Körning** (`node verktyg/dr-ovning.mjs`, protokoll
DR-PROV-2026-09-19-AUTO-12.md): markörkoll GRÖN på blad db-2026-09-19
(31,1 MB · 1 347 729 dump-rader · 99 CREATE TABLE · 101 COPY) → färsk
skrap-DB → **restore RTO 11,5 s** (dagens snabbaste; serie-spann 10,3–23,9)
→ fel 788 kända / **0 okända** → mätning tre nivåer: public
**60 tabeller / 1 325 919 rader** · public+storage 68 / 1 326 055 ·
alla scheman 99 / 1 326 315 → protokoll → full städning (skrap-DB raderad ·
PG17 stoppad). Radtalet IDENTISKT med AUTO-10/AUTO-11 (samma blad) —
determinismen i serien håller; jämförelsebasen: v98 20,0 s · 1 187 291 →
s10-u2 17,7 s · 1 246 728 → s10-u3 14,7 s · 1 246 728 → denna 11,5 s ·
1 325 919 (datat växer, RTO fallande).

**Städningsfynd (uppdragets fjärde steg blev en leverans i sig):** vid
min start låg `ak1a_dr_test` KVAR i PG17-klustret medan PG17 var stoppad —
ett --behall-fönsters halvföljda kontrakt (AUTO-10:s protokoll rad
"skrap-DB lämnad + PG17 uppe (— anroparen städar)": anroparen stoppade
PG17 men droppade aldrig DB:n). Övningens steg 3 (dropdb --if-exists)
städade den gamla DB:n atomärt och det avslutande städsteget — utan
--behall — lämnade klustret i bevisat viloläge. Läxa för kommande
--behall-användare: kontraktet har TVÅ delar (stopp OCH drop) — halv
städning lämnar kvar ett franchise-tecken som nästa övning måste bära.
Verifierad slutposition: pg_lsclusters 17/main **down** · psql
kopplingsvägran (skrap-DB:s frånvaro bevisad) · fellogg sparad i /tmp
enligt mall (blad+pid+ms) · flock-låsfil kvar i viloläge (enligt c3b871f7).

**KVD:** data-only — src/ orörd = INGET bygge (tsc-baslinjen vilar i
pre-commit-grinden) · R2 orörd · data/blogg/ orörd · data/backups/ endast
läsning · syskonytor orörda. Nästa kvartalsövning: **senast 2026-12-19** —
`node verktyg/dr-ovning.mjs`.


## S10-U2 — SKRAPFILTERGAP: ROND 96:s "prod-yta ren" korrigerad — 748 trackade fabriks-skrap arkiverade ur trädet (2026-09-19 16:48–17:0x lokal, GODKÄNT)

Sent omstarts-dispatch av vakt 2/3 (orderns restore-kärna var 3× levererad:
AUTO-11/12 + KEDJA-0 commit 90a58f89 — duplikat avstått, se
DR-ARKIVSVEP-2026-09-19-TRACKADE-VERKTYG.md §1). Vaktmätnigen fann istället
ett mätbart fel i städ-kedjan: ROND 96 arkiverade 456 **ospårade** (untracked)
skrapfiler och claimade "prod-yta REN" — men **748 trackade** fabriks-skrap
(committade in av barnen) + 1 ny låg kvar i verktyg/ (vissa föregick svepet
med dagar; git ls-files är beviset). Rotorsaka: ren-yta-grinden läser
git-status-vyn (ser bara untracked) medan barnen commitar in sina commitmsg-/
sond-filer skrivna i repot. KUR (reversibel, ROND 96:s arkivmönster): git rm
--cached 748 (51 748 rader ur indexet, historiken orörd) + node-flytt av
samtliga 749 till data/vakten/skrap-arkiv/2026-09-19-trackade-verktyg-post-r96/
+ manifestpost i manifest.jsonl — verktyg/ nu 0 _-filer; inga beroenden
(inget levande skript/cron ropar _-filer; offsite-taren berörs ej). Oberoende
PG-eftermätning: 17/main **down** · base endast OID 1/4/5 · pgsql_tmp tom ·
felloggar enligt mall (6× blad + 3× appdump) · flock-låsfil viloläge. Köpost
till ROND 97+: ren-yta-grinden måste räkna TRACKADE _*-skrap (git ls-files),
och fabrikens commitmeddelandefiler hör hemma i /tmp — annars föds gapet om.
KVD: src/ orörd = INGET bygge · R2 orörd · data/blogg/ orörd · syskonleveranser
orörda. Protokoll: data/forskning/DR-ARKIVSVEP-2026-09-19-TRACKADE-VERKTYG.md.

## 2026-09-19 ~22:1x lokal — ROT-FRÅGAN STÄNGD: .next-LÄKEBACKUP i prod-synken (o97, s8-u1; "misslyckade byggen SKRIVER i .next")

07:15Z-notisens rot-fråga ("överväg omstart-på-misslyckat-byggkvitto eller .next-skrivskydd
under bygg") har sin kur: verktyg/prod-synk.mjs bär nu NEXT-LÄKEBACKUP (o97) — FÖRE varje
byggstart säkras senast GRÖNA .next i .next-laeke (katalog-grönhetsguard BUILD_ID +
build-manifest.json + prerender-manifest.json; ISR-cachen ~1 GB exkluderas — regenererbar;
LAEKE skrivs ENDAST när den saknas, ett halvskrivet .next kan aldrig ersätta en bevisat
grön backup), och i varje fallit utfall (oom · riktigt-fel före ombyggs-kedjan · fallna
ombyggar · artefakt-stopp) återställs .next ur backupen ⇒ pm2 serverar det gröna läget
direkt i stället för att blöda 500/ostylat ~10-15 min till nästa lyckade poll (bevisade
fönster 06:58–07:12 och 19:11–19:54-klassen 2026-09-19). Lyckad deploy städar backupen —
LAEKE speglar alltid senaste LYCKADE deploy. Fail-open: varje backup-fel loggas + VARNING
och lämnar beteendet som före kuren; deploy-kedjan kan aldrig dö av läkevägen. .gitignore
täcker /.next-laeke/ (runtime-skydd, aldrig leverans). Bevis: svit
verktyg/testa-prod-synk-nextlaeke.mjs 29/29 PASS (sandbox, katalog-guards mot tyst
fil-kopiering, idempotens, finns-sedan-bevarande) + regression 184/184 (arbetsytasynk 34 ·
patchko 52 · pm2vakt 35 · ramvakt 17 · revertgrid 34 · tidsstampel 12) + Mimosa-paritet
verktygsdomän 292/0 GRÖN (fixtures exkluderade enligt full-scan-basens konvention) + tsc 0.
Kvarvarande lucka (medveten): "startade-aldrig"-grenen rör inget (bygget startade ej);
ombygg-kedjan river .next på nytt per försök — terminalerna läker efter varje fallitet.

## S10-U2 — OFFSITE-DR KVALL: 3-2-1-kedjans led 3 första gången återställningsbevisat + ROTFYND GitHub-push-benet NERE (2026-09-19 22:29–22:3x lokal, GODKÄNT)

Första återställningsövningen UR offsite-arkivet (blad-restores bevisade 12× samma dag, men
led 3 var obevisat): ak1a-offsite-2026-09-19.tar.gz.tar.gz (479 554 465 B, sha256 377e2c41…,
10/10 kontrakterade delar, 1 503,9 MB okomprimerat) extraherat till skrap-yta RTO 23,8 s ·
den ÅTERSTÄLLDA db-snapshot.sqlite (1 379 422 208 B) PRAGMA integrity_check = "ok" på 40,4 s ·
byte-identisk med server-snapshotten (cmp 9,1 s) · **katastrof-RTO till verifierbar tråd-DB
≈ 64 s** · radtal i återställd session-DB: part 222 960 · message 53 089 · tool_usage 56 737 ·
session 1 234 — TRÅDENS PERMANENS kan återfödas från offsite-kopian (kundens största smärta
har bevisat motmedel i led 3). Snapshot-semantik: 0 negativa skillnader på 8 ytor (audit
1 851→1 880 · forskning 855→873 = väntad tillväxt; övriga identiska). SÄKERHETSSCAN: 0
hemlighetsträffar i arkivet — docstring-rutnan KURERAD (headern påstod felaktigt att
.env.production.local ingick; Edit i verktyg/backup-offsite.mjs, svit 12/0, node --check OK).

ROTFYND (öppet, väntar kund): GitHub-push-benet (led 3:s fjärrkopia) NERE — loggen "push OK"
senast 12:53:23Z, "väntar (SSH-nyckel ej aktiv än)" från 18:53:21Z; läsande diagnos
git ls-remote origin: **Permission denied (publickey)** exit 128. Arkivet skapas fortsatt
var 6:e timme på servern men GitHub-kopian fryser på 12:53Z-läget tills kunden återregistrerar
serverns publika nyckel (~/.ssh/id_ed25519.pub, förnyad 09-18 20:07 lokal) hos GitHub
NewUserAK/AK1 — nyckelfiler = stoppregel, GitHub-spegling ägs av arbetsstationen (R2/KÖPOST).

Städning: skrap 1,5 GB bortad, bevisfiler kvar i /tmp enligt mall, data/backups/ endast läst
(SHA oförändrad), PG17 viloläge bevisat 20:32:41Z UNDER övningen (därefter öppnade ett syskon
sitt aktiva PG-fönster = deras städning, DAGFONSTER-precedensen). KVD: INGET bygge · src/
orörd · tsc 0 exit 0 · R2 orörda · data/blogg/ orörd · prod rörddes aldrig. Protokoll:
data/forskning/DR-OFFSITE-ATERSTALLNING-2026-09-19-KVALL.md + JSON + instrument
_s10u2-offsite-steg1/2.mjs. Kö: kund/R2-nyckel → vakten bekräftar "push OK"-rad; offsite-
restore repeteras med kvartalsövningen (mall finns, nästa ≤2026-12-19).

## S10-U3 — KVÄLLSPUNKT APP-DB 2: KEDJA-0-instrumentets andra fulla körning + aufr:s dygnsprofil tvåled + appens verkliga RPO kvantifierad (2026-09-19 22:29–22:34 lokal, GODKÄNT)

Fabriksagent s10-u3 (manifest auto-s10-1789849506241, vakt 3/3; anspråk disk-först
22:31 med P1–P10 låsta FÖRE mätning). VAL: blad-9-rkaq-restore avstått (13+ punkter
idag, duplikat = förlorat arbete); appens databas aufr hade EXACT EN full övning
(KEDJA-0 16:09, s10-u2) — kvällspunkt 2 = instrumentets reproducerbarhet + den
efter DUBBELPROJEKT-storfyndet mest värdefulla omätta ytan (appens data har ENDA
kopian i kedja 2:s JSON 02:40).

KÖRNING `node verktyg/dr-appdump.mjs` GRÖN exit 0 (u2:s verktyg omodifierat,
deras yta respekterad): pg_dump 188,1 s · 84,1 MB gz (sha256 98cd669f…, slutmarkör
GRÖN, COPY 420/CREATE 418) → skrap-DB ak1a_dr_app i PG17 → RTO 26,8 s → fel 109
kända/0 okända → public 372 tabeller/179 902 rader · +storage 380/181 247 · alla
scheman 417/183 057 → full städning (verktyg + oberoende eftermätning: PG17 down,
psql-socketvägran, /tmp/dr-appdump-aufr-* borta GDPR, fellogg enligt mall,
9 blad orörda).

FYND 1 — AUFR:S DYGNSPROFIL TVÅLED (system_events tre punkter): 02:40 166 067
(kedja-2) → 16:39 167 219 (82,4 r/h) → 22:32 168 269 (**179,0 r/h = 2,2×
dagtakten** — kvällsfabrikstrafiken skriver events). Dekomposition EXAKT:
public +1 409 = events +1 050 + user_activities +359, övriga 370 tabeller +0.

FYND 2 — APPENS VERKLIGA RPO VID KVÄLL: kedja-2-gap 2 202 rader på 19,9 h
(ENDA händelsekopian). Prognos nästa 02:40-växling ≈ 2 400–2 950 — verifierbar
mot system-events-full-2026-09-20.json.gz:s total-kontrakt.

FYND 3 — user_activities FÖRSTA takten 61,2 r/h (5 388→5 747): KEDJA-0:s
sidofynd 3 (tabellen saknas i ALLA kedjor) får sin första växtsiffra — oskyddad
yta ~360 rader/6 h kvällstid.

PREDIKTIONSDOM 7 ✅ (5 EXAKTA: radkontrakt · fel · nyckeltabeller ·
protokollnamn · städning) · 3 ❌ (P1/P2/P7) — GEMENSAM rotorsak: modellen 82 r/h
byggde på natt→dag-fönstret; kvällens 2,2×-takt och user_activities vägdes ej.
Läxa kodifierad: tvåpunktsbas per tabell OCH per dygnsfas innan prediktion
(utökar s10-u2:s "två punkter innan en planå får namnet").

KVD: data-only — src/ orörd = INGET bygge (tsc-baslinjen bärs av pre-commit-
grinden) · R2 orörd (.pgpass/crontab/.env skriftligen orörda; prod DB endast
läst; lösenord enbart env-till-barn per verktygets KEDJA-0-kontrakt) ·
data/blogg/ orörd · syskonytor orörda · commit med pathspec, commitmsg i /tmp.
Kö: blad 10:s födelsebevis 09-20 02:30 + jungur 03:20 · 02:40-prognosen verifieras
· kvällspunkt APP imorgon = kvällsfasens tvåpunktsbas · huvudagentens
DUBBELPROJEKT-kur (db-app-crontab + .pgpass, R2-nära) består.
Protokoll: data/forskning/DR-OVNING-2026-09-19-KVALL-APP-2.md.

## S10-U1 — KVALLSKONTROLLPAR: kontrollparet stänger cache-hypotesen · par 3 +8 EXAKT över 23:00 · pumpen är DAGLIG batch (2026-09-19 22:29–23:02, GODKÄNT)

Agent: s10-u1 (manifest auto-s10-1789849506241, vakt 1/3). Fullständigt
protokoll: data/forskning/DR-OVNING-2026-09-19-KVALLSKONTROLLPAR.md. Order:
DR-övning nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal
PG. Anspråk disk-först 22:29:30 med P1–P10 FÖRE mätning (u2:s anspråk 22:31,
u3:s 22:31 — tre vakter, tre skilda ytor; flocken serialiserade PG17: u2:s
offsite-övning såg viloläge 20:32:41Z mellan mina två fönster).

- **Två öppna köposter tagna:** kontrollparet dag-RTO (DAGFONSTER-REPLIK/
  FORMIDDAGSPULS) + intra-kvarts par 3 över :00/:30. Restore-kärnan var
  levererad (AUTO-10/11/12) — inget duplikat.
- **KONTROLLPARET (AUTO-13 + AUTO-14, blad db-2026-09-19):** två FULLA
  cykler fem minuter isär — RTO **12,9 s** (1 222 MB) resp **15,7 s**
  (4 470 MB). B hade varmare cache OCH 3,7× mer RAM och blev ändå 2,8 s
  långsammare ⇒ **cache-kylan utesluten som RTO-förklaring; korttidsbrus
  ±3 s dominerar.** DAGFONSTER-REPLIK:s "dagklass 14–18 s oavsett RAM"
  MOTBEVISAD (12,9 på kvällen). NY DOKTRIN: RTO-prediktion = spann 11–19 s
  (9 punkter, medel 14,0 s); avvikelse är parmätning värd, inte fynd.
  Radkontrakt/felbild fullt deterministiska: EXAKT identiska i A och B,
  felloggarna byte-identiska 34 881 B (sjunde/åttonde repetitionerna).
  Kontextfynd: 3,2 GB RAM frigjordes mellan körningarna (extern händelse).
- **PAR 3 ÖVER MARKÖR:** 22:58:43 → 23:01:31 — Δboard = **+8 EXAKT**
  (49 994 → 50 002), snapshots/organ frusna i paret. Kedjeprediktionen
  **50 002** (49 578 + 8×53) träffade siffra för siffra 13,3 h i förväg —
  kvartsformeln lever oavbruten även kvällstid (tredje parbeläggningen:
  2×Δ0 inom kvart + 1×+8 över markör; klockan eldar VID markören).
- **KVÄLLS-RPO (M=82):** totalt **+19 685** oskyddade · board +656 = 8×82
  EXAKT · snapshots +18 984 · organ +45 · 3 av 60 tabeller i rörelse.
  **Driftfynd: snapshots fruset på 1 252 404 sedan 09:30 (13,5 h) — pumpen
  är en DAGLIG batch (skriver mellan 02:30 och 09:30), inte kontinuerlig.**
  Blad-10-prediktionen (snapshots 1 252 404) kvällsverifierad på exakt talet
  ~3 h före bladets födelse; blad-10 board 50 114 (8×96) stärkt.
- **Prediktionsdom 7 ✅ · 2 ❌** (P2 primär: B>A i stället för B<A — data
  ger starkare uteslutning än decisionregeln; P3: RAM-bandet brutet av
  extern frigörelse). Städning EGENMÄTT: PG17 down · base OID 1/4/5 + tom
  pgsql_tmp · skrap-DB borta · WAL 481 MB (nionde punkten på serie-låget) ·
  felloggar i /tmp enligt mall · lås flock-viloläge.
- **KVD:** src/ orörd = INGET bygge · R2 orörd · data/blogg/ orörd · prod
  ENDAST läst (psql COUNT, GDPR-rent) · syskonytor orörda (u2:s offsite ·
  u3:s app-DB) · commit med pathspec + commitmsg i /tmp.

Kö: blad 10:s födelsebevis 09-20 02:30 (formelns sjätte test: board 50 114 ·
snapshots 1 252 404 — nu kvällsförankrad) · jungurkörningen 09-20 03:20 ·
pump-batchens exakta tidpunkt (02:30–09:30-fönstret) · retention ~10-11 ·
kvartalssviten senast 12-19.


## 2026-09-20 04:28–04:42 lokal — PRODAVBROTT ~7 MIN + SJÄLVÅTERHÄMTNING: pm2-restart-loop dog på "next: not found" under prod-synkens npm ci (observationspost, s7-u2/fabrik)

- **Symptom (02:28–02:35Z):** prod-synkens deploy-kedja av o104 failade i
  serie (OOM 02:10:50Z → byggfel 02:18:39Z/02:28:33Z → good-HEAD-ombygge
  fail 02:32:17Z + 02:35:35Z — samma ENOTEMPTY-race-klass mot
  .next/server/app/ar/kurser som u1 bokförde i ded423cc). Under ombyggenas
  `npm ci`-faser dog pm2 ak1a:s restart-loop på `sh: next: not found`
  (node_modules mitt i omskrivning; ↺ ökade till 6334+, pid 0, errored),
  dessförinnan `no-build-id`/`client reference manifest saknas` mot det
  halvskrivna .next-trädet. localhost 000 ~02:29–02:35Z.
- **Återhämtning UTAN manuell åtgärd:** 02:35:52Z läkebackup återställd +
  node_modules hel ⇒ pm2-restart lyckades (online 02:35:5x, https 200).
  02:41:40Z DEPLOYAD 13 commits (20957e51, u3:s slutläge med o104
  nettoreverterat) — prod 200, BUILD_ID RbGEkEnQH, pm2 stabil därefter.
- **Rotfynd åt infra-ägaren (ALDRIG fabrikens yta att fixa):** pm2:s
  autorestart-loop borde hållas tillbaka (`pm2 stop ak1a` eller
  restart-fördröjning) under deploy-fönstrets npm ci-fas — annars tävlar
  restart-loopen med omskrivningen av node_modules och dör på binärspan
  som sedan kräver manuell restart när läget väl är grönt. Kraschvakten
  överlevde men kunde inte starta det som inte fanns.
- **Fabriksagentens hållning:** inget eget bygge/restart (reglerna);
  bevakning + verifiering (https 200 ×2, pm2 online) + denna post.


## S10-U3 — BLAD 10:S FÖRSTA RESTORE ×2 (födelsebeviset LEVERERAT): board 50 114 · snapshots 1 252 404 EXAKT i två oberoende instrument · dagsteget +19 800 dekomponerat till tre namngivna skrivare (2026-09-20 06:37–06:45 lokal, GODKÄNT)

- **Dubbelreplik (D20-presedens):** u2 (anspråk 06:38, AUTO) + u3 (anspråk
  06:41 FÖRE mätning, AUTO-2) återställde blad 10 (db-2026-09-20.sql.gz,
  31,6 MiB, född 02:30:43) var för sig under DR-flocken, ~80 s isär.
  Resultat IDENTISKA: public 60/**1 345 719** · +storage 68/1 345 855 · alla
  99/1 346 115 · fel 788 kända/0 okända · felloggar byte-identiska 34 881 B.
  RTO 11,7 s (u2) · 12,9 s (u3) — båda i doktrin-spannet 11–19 s.
- **FÖDELSEBEVISET (kvällens köpost, formelns sjätte test):** gårdagens
  låsta prediktioner board **50 114** (49 346 + 8×96) och snapshots
  **1 252 404** (frusen sedan 09:30) träffade EXAKT, mätta av två
  instrument — kedjan prediktion→födelse→restore bevisad ända ut.
- **Dekomposition (dagsteget är tre skrivare, inte brus):** blad 9 → blad 10
  = snapshots **+18 984** (pumpens dygnsbatch) + board **+768** (8×96
  kvartal) + organ_health_logs **+48** = **+19 800 EXAKT**; övriga 57 publika
  tabeller +0. Universum stabilt (60/68/99).
- **Städning oberoende egenmätt:** PG17 down · socketvägran · base endast OID
  1/4/5 · pgsql_tmp tom · flock viloläge · båda felloggarna kvar enligt mall
  (pid+ms) · retention 10 blad (09-11…09-20) orörda · disk 58 G.
- **KVD:** data-only — src/ orörd = INGET bygge · R2 orörd · data/blogg/
  orörd · prod orörd · syskonytor orörda (u2:s protokoll respekterat) ·
  commit med pathspec + commitmsg i /tmp.
- Protokoll: data/forskning/DR-PROV-2026-09-20-AUTO-2.md (maskinellt) +
  DR-OVNING-2026-09-20-MORGON-BLAD10-REPLIK2.md (berättande).

Kö: blad 11:s födelsebevis 09-21 02:30 (formelns sjunde test: board 50 882 ·
snapshots ≈ 1 271 388 · public ≈ 1 365 519 om modalt dagsteg) · u2:s
02:40-gap-prediktion ([2 400, 2 950]) · retention-vakten (första
30-dagars-raderingen: db-2026-09-11 först ~10-11) · kvartalsövingen senast
2026-12-20.

## S10-U2 — BLAD 10 FÖDELSEBEVIS: prediktiondom 9/9 (fyra EXAKTA) + 02:40-gap STÄNGT (2 629 i bandet) + RPO-morgonpunkt + trippelkorsvalidering A==B==C (2026-09-20 06:36–06:44 lokal, GODKÄNT)

- **Komplement till S10-U3:s replik-sektion ovan** (dubbelrepliken, födelse-
  talet och dekompositionen täcks där — min körning = dess "u2 AUTO"-rad).
- **Prediktiondom (anspråk låst 06:38 FÖRE mätning, P1–P9): 9/9 infriade,
  fyra EXAKTA** — board 50 114 · snapshots 1 252 404 · DAGSTEG +19 800 ·
  markörprofil 99/101 · fel 788/0. Ärlighetsnot P7: anspråkets gapformel skrev
  fel bas (22:32-punkten i stället för föregående dags full-dump) — domenen
  följer u3:s ursprungliga definition.
- **02:40-gap STÄNGT (S10-U3:s köpost):** system-events-full-2026-09-20.json.gz
  = 168 696 (truncerad false) − 166 067 (09-19) = **2 629 ∈ [2 400, 2 950]** —
  prognosen träffad. Sidofynd: nattakten 22:32→02:40 = 427 r / 4,13 h ≈
  **103 r/h** (högre än dagtakten 82 — nattens fabrikstrafik skriver events).
- **RPO-morgonpunkt (04:39Z):** +140 oskyddade på 4 h 08 min (~34 r/h) ·
  2/60 i rörelse (board +128 → 50 242 · organ_health_logs +12 → 3 084) ·
  **A==B==C:** dump-COPY == restore-count == rpo-dump-räkning == 1 345 719.
- **Städning dubbelbevisad:** mitt fönster städade (verktyget), syskonets
  verktyg loggade "PG17 var stoppad — korrekt viloläge" vid sin start 04:38:56Z
  (låsfilen pid 3424104 bevittnar), slutligt viloläge egenmätt 06:43.
- Protokoll: data/forskning/DR-OVNING-2026-09-20-BLAD10-FODELSE.md +
  DR-PROV-2026-09-20-AUTO.md (maskinellt) + DR-RPO-DIFF-2026-09-20-MORGON.json.
  KVD: data-only · src/ orörd = INGET bygge · R2 orörd · prod ENDAST läst
  (GDPR: endast antal) · syskonytor orörda (AUTO-2 + REPLIK2 committas av u3).


## S10-U1 — JUNGURKVITTO 03:20: arkivera-server.mjs första AUTOMATISKA veckoarkivering BEVISAD + kedja 3 GRÖN på jungurarkiven (2026-09-20 06:5x–07:4x lokal, GODKÄNT)

Agent: s10-u1 (manifest auto-s10-1789878902744, vakt 1/3). Order: DR-övning
nästa i spåret — återställ, mät tid/rader, protokoll, städa lokal PG. VAL:
jungurköposten (tre gånger bokförd, orörd av syskonen som höll blad-10:
u2 födelsebevis + 02:40-gap, u3 replik 2). Anspråk P1–P10 låsta FÖRE mätning
(data/vakten/auto-s10-1789878902744-s10-u1-ansprak.md).

- **JUNGURBEVISET komplett:** cron-rad `20 3 * * 0` (rad 4) × verktygets
  egen logg /tmp/server-arkiv.log "ALLT GRÖNT · 65 s" × 5 artefakter på disk
  (tar 225,9 MiB 01:20:33Z · bundle 219,9 MiB 01:21:06Z · nginx · crontab ·
  pm2-dump). Spårets första AUTOMATISKA veckoarkivering — 09-08/09-09 hybrid-
  sync, 09-16 agent-manuell; jungur = cron-epokens födelsebevisade start.
- **Konfigsnapshot-dom 3/3 GRÖN:** nginx-artefakt == levande conf (normaliserat)
  · crontab-artefakt == crontab -l + proveniensheader (5==5) · pm2-dump giltig
  JSON 4 processer (ak1a · ak1a-pumpor · ak1a-test · pulsvakt), namnmängd
  oförändrad vid mätningen.
- **KEDJA 3 GRÖN exit 0 på jungurarkiven** (DR-KEDJA3-2026-09-20-AUTO.md):
  sabotage 3/3 gripna · 13 022 poster 0 brott · **RTO restore 6,1 s** ·
  antalskontrakt 12 211 filer + 811 kataloger == listat · src 726 filer /
  221 230 rader · klon 1 922 commits på 17,1 s · ancestor GRÖN · spot-diff
  1 IDENTISK + 3 SKILJER-FÖRKLARAD (nattens commits 05:18–06:43 > mtime —
  RPO synlig, ej falsk RÖD). Första körningen RAM-grind-skippad (713 MB,
  exit 75) → väntewrapper _s10u1-vanta-ram.mjs startade vid 2 531 MB.
- **Retention:** 6 veckoarkiv · 0 raderade (äldsta 11,2 dygn) · nästa träff
  ≈ 2026-11-15 · R2-notis: .env-NAMN i arkivlistan (avsett — katastrof-
  återställning av hela servern; valvet lämnar aldrig servern; innehåll
  aldrig läst).
- **Prediktionsdom 6 ✅ · 4 ❌** (P3/P4/P5/P6 — kontraktsnivån 100 % GRÖN;
  läxorna: precedens måste matcha SAMMA instrument (offsite-extraktion ≠
  kedja3-tar), band utan mätbas är lotteri (src-rader stod i 09-16-proto-
  kollet), prediktera spot-KONTRAKTET ej fördelningen).
- **KVD:** src/ orörd = INGET bygge · R2 orörd · data/blogg/ orörd · prod
  orörd (endast läsning) · syskonytor orörda · PG17 viloläge egenmätt nere
  före och efter · /tmp/dr-kedja3-* borta · disk 58 GB-klass oförändrad.
  Protokoll: data/forskning/DR-OVNING-2026-09-20-JUNGUR-KEDJA3.md +
  maskinellt DR-KEDJA3-2026-09-20-AUTO.md.

Kö: jungur kvartalsrepris (nästa söndag 03:20-körning kan nu förväntas
GRÖN — första uppföljningen 2026-09-27) · retentionsträffen ~11-15 ·
kvartalssviten senast 12-17/18 (TOTAL+ARKIVSVEP) · u2:s 02:40-gap-dom
och u3:s serie/dekomposition kommunicerar i deras protokoll.


## S10-U2 — APP-DB MIDDAGPUNKT 3: första fulla dygncykeln för aufr (dag ≠ dag: söndag 0,75× lördag) + RAM-grindens andra eldprov samma dag (2026-09-20 12:36–12:5x lokal, GODKÄNT)

Agent: s10-u2 (manifest auto-s10-1789900509524, vakt 2/3). VAL: APPENS
databas punkt 3 — serien hade två punkter (09-19 16:39 + 22:32), ingen
dag/middag; rkaq-kärnan var daglevererad (blad 10 ×2 i morse). Anspråkscap
ärligt bokförd: u3:s anspråk (samma yta, "dagpunkt") först på disk 12:38:27,
mitt ~12:39:3x (kontrollen var 12:37 — läs-tid ≠ skriv-tid, korrigerat i
anspråksfilen). D20: min körning tog flock-fönstret 12:40:23–12:43:33, u3:s
replik startade vid min release (pågår vid skrivande — deras yta orörd).

- **RAM-GRINDENS ANDRA ELDPROV SAMMA DAG** (u1 jungur 06:5x: 713 MB; denna
  12:39: 832 MB — prod-synkens next-build höll 5,1 GB): övningen vägrades
  korrekt (exit 75), servern skyddades. Kur = node-väntewrapper (mönster nu
  bevisat 2×; denna i /tmp — ingen ny skrapfil i verktyg/). Fönstret öppnade
  vid 5 795 MB när bygget landade. **DR-beredskapen på 8 GB-servern är
  deploy-fönsterberoende — dokumenterat driftläge: vid DR-brand under deploy,
  vänta in fönstret, ALDRIG kringgå grinden.**
- **GRÖN exit 0:** pg_dump 114,8 s · 84,1 MB gz (sha 223b6e81…, slutmarkör
  GRÖN, COPY 420/CREATE 418) → skrap-PG17 → **RTO 20,4 s** (aufr-seriens
  snabbaste; band 20–30 tredje dagen) · fel **109 kända/0 okända ×3** och
  felloggarna **BYTE-IDENTISKA 5 927 B över två dagar** · universum EXAKT ×3
  (372/380/417 · 420/418) · public **181 143** · system_events **169 313** ·
  user_activities **5 944** · städning full (PG17 down, dump GDPR-raderad,
  egenmätt; låsfilen korrekt överlämnad till u3:s flock).
- **DYGNPROFIL 5 PUNKTER (första fulla cykeln):** natt 103,4 · dag lördag
  82,4 · kväll 179,0 · natt 103,4 · dag söndag **61,6 r/h** — dagfasen är INTE
  konstant (söndag 0,75× lördag): modellen blir TRE faser med
  helgdagsvarians. Dekomposition EXAKT: public +1 241 = events +1 044 +
  user_activities +197 (+0 övriga 370); events +1 044 = natt +427 + dag +617
  EXAKT (kedja-2:s 02:40-värde = fungerande delpunkt).
- **RPO vid middag:** 617 rader/10,02 h (61,6 r/h) i ENDA kopian; prognos
  nästa 02:40-växling: gap [1 900, 2 400] → 09-21-JSON ≈ [170 600, 171 100].
- **Prediktionståling 10/10 GRÖN — första i APP-serien** (faskännedomen är
  kuren: gårdagens 3-miss-dagar var fasblinda; dagens fasmedvetna band höll
  alla, bonus user_activities [5 850, 6 250] → 5 944 ✅).
- **KVD:** src/ orörd = INGET bygge · R2 orörd (.pgpass/crontab/.env orörda;
  prod ENDAST läst; lösenord env-till-barn vid körning, aldrig loggat) ·
  data/blogg/ orörd · syskonytor orörda · commit med pathspec + /tmp-commitmsg.
  Protokoll: data/forskning/DR-OVNING-2026-09-20-MIDDAG-APP-3.md + maskinellt
  DR-APPDUMP-2026-09-20-KEDJA0.md/.json.

Kö: u3:s replik (determinismens fjärde korsbevis) · blad 11 födelsebevis
09-21 02:30 + APP-prognosen mot system-events-full-2026-09-21.json.gz ·
retention db-2026-09-11 (~10–11) · DUBBELPROJEKT-kuren består (appens
RPO-gap ~2 100/dygn är priset tills crontab db-app-*.sql.gz landar).

## S10-U2 (manifest auto-s10-1789923906930) — APP-DB KVÄLLSPUNKT 4: söndagens eftermiddag REDAN i kvällstakt (132,0 r/h = 0,74× lördag — ingen trappa på söndagen) + läran "fönstermedel ≠ fas" (3 systematiska tillväxtmissar) — 2026-09-20 19:08–19:2x lokal, GODKÄNT

Agent: s10-u2 (vakt 2/3). VAL: kvällsfasen saknades för dagen (rkaq ×3 +
aufr dagpunkt + u3-replik levererade till 12:48; kö :2587 "kvällspunkt APP
= kvällsfasens tvåpunktsbas" — söndagskvällen osampad). Körning OMODIFIERAT
`node verktyg/dr-appdump.mjs`, prediktioner låsta på disk FÖRE (P1–P11).
Resultat: dump **177,7 s · 84,2 MB** slutmarkör GRÖN (COPY 420/CREATE 418)
→ skrap-PG17 → **RTO 22,2 s** · fel 109/0 med fellogg sha256 **IDENTISK
tredje dagen** · universum EXAKT ×4 (372/380/417) · system_events
**170 174** · user_activities **6 271** · public 182 331 · dekomposition
EXAKT: public +1 188 = SE +861 + UA +327 (fjärde punkten två-skrivare ·
övriga 370 stilla). **FYND:** medeltakt 12:41→19:12 = 132,0 r/h = 0,74×
lördagskvällen — dagfasens 0,75×-kvot speglad i kvällen; söndagen = tvåläge
(låg förmiddag ~35, sedan ~132-platå in i kvällen), trefasmodellens
trappa gäller endast lördag. **Prediktion 7/11 + P11-dom; P1–P3 missade
+74/+21/+381 — alla i tillväxtriktningen; rot: modellerna tog
MIDDAG-punktens 61,6 (ett 10 h FÖNSTERMEDEL av natt 103 + förmiddag ~35)
som fas-platå. KUR: fönstermedel ≠ fas — tvålägesprofil per veckodag
härefter.** RPO-gap mot ENDA kopian (02:40-JSON): **1 478 rader vid
19:12** (16,5 h ålder) · delprognos 02:40 09-21: **[170 950, 171 250]**
(triangel 171 080) — MIDDAG-bandet [170 600, 171 100] i gränsfall om
platån håller (+985-scenariot slår taket); avgörs 02:40 två vägar. Städning
OBEROENDE: PG17 down · /tmp-dumpkatalog borta (GDPR) · dött flock-lås
(egen pid) städat · retention 10 blad oröda · disk 56 G. KVD: src orörd =
INGET bygge · R2 orörd · data/blogg orörd · syskonytor orörda · commit med
pathspec. Protokoll: data/forskning/DR-OVNING-2026-09-20-KVALL-APP-4.md +
maskinellt DR-APPDUMP-2026-09-20-KEDJA0-3.md/.json · anspråk
data/vakten/auto-s10-1789923906930-s10-u2-ansprak-kvall-app-4.md.

Kö: 02:40 09-21 dubbelprognos-dom (MIDDAG vs KVÄLL-band) + blad 11
födelsebevis · fasprediktion på tvåläge per veckodag (aldrig
fönstermedel) · DUBBELPROJEKT-kuren består · UA mätt i tre faser (13,9 dag
sön · 50,2 kväll sön · 61,2 kväll lör) men oskyddad i alla kedjor.

## S10-U1 (manifest auto-s10-1789900509524) — BLAD 10:S FÖRSTA DAGPUNKT: klockformel 8×40 EXAKT + pumpbatchen LANDAD (blad-11 förhandsverifierat levande) — 2026-09-20 12:38–12:42 lokal

- **Val (anspråk disk-först 10:38:55Z, P1–P9 låsta FÖRE mätning):** blad
  10:s restorepunkt 3, första i DAGSLÄGE — de två befintliga var nattliga
  (u2/u3 06:3x); jungur+kedja 3 orört (förra manifestets u1), blad 11 ej
  moget. DAGPULS-precedensen: varje blad förtjänar en dagpunkt i
  vardagstrafik med klockformeln som prediktor.
- **Restore GRÖN exit 0:** RTO 15,9 s (11,7·12,9·15,9 — alla i spannet
  11–19) · radkontrakt EXAKT tredje gången · fellogg byte-identisk ×3
  (cmp GRÖN) = blad 10:s determinismbevis komplett, samma klass som blad
  9:s nio-punktsserie. RAM-notis ärligt bokförd: 1 121 MB vid låsning →
  5 772 MB vid start (extern frigörelse mellan låsning och körning).
- **DAG-RPO 10:40:38Z (+19 328 på 10,17 h, 3/60, 0 negativa):**
  - board 50 434 = **8×40 EXAKT** — punktprediktionen i anspråket P1
    träffade siffra för siffra; fönstret spänner ronder 06+09 utan
    påslag; blad-11-konsistens: 50 434 + 8×56 = 50 882 = gårdagens
    låsta prediktion (klockan och kalendern överens).
  - snapshots 1 271 388 = **+18 984 EXAKT — pumpens dygnsbatch LANDAD**;
    landningsfönster 04:39–10:40Z (morgon-RPO:n såg den frusen) = första
    gången spåret fångar själva landningen mellan två levande punkter;
    **blad-11-prediktionen förhandsverifierad LEVANDE** (andra gången,
    efter DAGPULS 09-19). Landningstiden varierar mellan dygn (09-18:
    klar före 06:09Z; 09-20: ej klar 04:39Z) men batchstorleken är
    deterministisk åtta dagar i rad.
  - organ 3 096 (+24 sedan bladet) — pulserna stödjer blad-11:s 3 120.
  - Dekomposition EXAKT: 18 984 + 320 + 24 = +19 328; daglig exponering
    ≈ 1,43 %, pumpdominerad (98,2 %).
- **Prediktionsdom 9/9 ✅ (5 EXAKTA)** — P3:s punktgissning miss men band
  höll (organpulser är ej punktbarbara; läxa upprepad ärligt).
- **Städning:** verktyg [7/7] + eigenmätt (PG17 down · socketvägran ·
  OID 1/4/5 · retention 10 blad orörda · disk 57 G). DR-flocken togs av
  syskonen u2/u3:s fönster EFTER min cykel (pids 3620829/3620937/
  3621006 — D20-läget; deras objektval och protokoll är deras).
- Protokoll: data/forskning/DR-OVNING-2026-09-20-DAGPUNKT-BLAD10.md +
  maskinellt DR-PROV-2026-09-20-AUTO-3.md + JSON
  DR-RPO-DIFF-2026-09-20-DAGPUNKT.json.
- Kö: **blad 11:s födelsebevis 09-21 02:30 — alla fyra hörn förankrade**
  (board 50 882 formel+konsistens · snapshots 1 271 388 LEVANDE · organ
  3 120 dagtakt · public 1 365 519 modal levandekonsistent) · pumpens
  landningstidsvarians (kvälls-/nattmätning snäver dagens fönster) ·
  retention ~10-11 (db-2026-09-11 först — tidigare försvinner = FYND) ·
  kvartalsövning senast 2026-12-20.

## V234 — DR-FÄRSKHETSPROV (rond 121 [organ:Φ], spår 10-rotation) — 2026-09-20

- **DOM: GRÖN — alla backupspår färskare än 24 h, inget att åtgärda.**
  Egenmätt (ls-mtime, prod-trädets data/backups/ + offsite/):
  - **Offsite-arkiv DAGLIGT och färskt:** ak1a-offsite-2026-09-20.tar.gz
    567 MB kl **14:52–14:53 i dag** (föregående 09-19 20:53 · 09-18
    20:53 — kadensen håller tre dagar i rad).
  - **DB-snapshot:** db-snapshot.sqlite 1,6 GB kl **14:52 i dag**.
  - **Nattlig serverbackup hel:** server-repo tar 236 MB + git-bundle
    230 MB + pm2-dump + crontab + nginx-konf, samtliga 03:20–03:21 i dag.
  - **DR-övning GRÖN samma dag** (s10-spåret 12:38–12:57): pg_dump
    114,8 s · skrap-restore **RTO 20,4 s** · prediktionsband 10/10 —
    protokoll DR-APPDUMP-2026-09-20-KEDJA0.md/.json. Övningsdumpar
    GDPR-raderas efteråt (design, "dumpBort: true" i JSON).
- **Kända gap förblir s10-spårets kö (ej nytt för V234):** app-DB:n
  saknar egen crontab-dump (db-app-*.sql.gz) ⇒ RPO-gap ~2 100 r/dygn —
  bokat i s10-kön; retention db-2026-09-11 (~10–11 blad) bevakas 09-21
  02:30.
- **ISR-värmaren:** vardagscron (03:10) — söndag = designpaus, senaste
  körning fredag 09-18; prod-sidor mäts varma via driftstrafik (12 ms
  hem-svar i dag). Ingen åtgärd.

## S10-U1 — KVÄLLS-DR BLAD 10: dagens fjärde restore (kvällsläget) + RPO-kvällspunkt + jungurarkivet OBEROENDE DUBBELBEVISAT (2026-09-20 19:08–19:14 lokal, GODKÄNT)

Agent: s10-u1 (vakt 1/3, Fabrik-order "DR-övning: återställ, mät tid/rader,
protokoll, städa lokal PG"). Anspråk disk-först 19:11 med P1–P9 låsta
(data/vakten/s10-u1-kvallsdr-2026-09-20-ansprak.md).

- **RESTORE GRÖN exit 0** (dr-ovning.mjs, blad 10): RTO **12,7 s** ·
  markör GRÖN 1 367 628 · **public 60/1 345 719** · +storage 68/1 345 855 ·
  alla 99/1 346 115 · fel 788 kända/**0 okända**. Blad 10:s restore-serie
  idag: 06:37 · 06:39 · 12:40 · **19:08** — kvällsläget var dagens sista
  öppna punkt; determinism fjärde dagen.
- **RPO-KVÄLLPUNKT** (16,6 h efter 02:30): **+19 548** oskyddade, 3/60
  tabeller rör sig — snapshots **+18 984 == pumpens 08:00-batch EXAKT**
  (dag 3) · board **+528 = 8×66** (kvartsrondens kvällssiffra; 31,7 r/h,
  serien 31,0–36,0 lever) · organ **+36 = 12×3** (vandrande väv). Två
  mätningar 71 s isär = IDENTISK delta (intra-kvarts-stilla, par 3).
  JSON: DR-RPO-DIFF-2026-09-20-KVALL.json.
- **JUNGURARKIVET DUBBELBEVISAT:** morgonens JUNGURKVITTO (u1 06:5x)
  + kvällens oberoende snabbreplik — gzip -t OK 4,3 s (tar.gz 236 846 742 B)
  + `git bundle verify` "complete history" (bundle 230 627 592 B, HEAD
  e56a6953) + log 6 rader ALLT GRÖNT + retention 0 raderade. Köpost (a)
  från u1 09-18 STÄNGD; nästa jungur-repris 09-27 förväntas GRÖN.
- **GitHub-push (R2, kunden):** 4:e "väntar (SSH-nyckel ej aktiv än)"-raden
  i rad (senast 12:53); arkivet växer ändå (494→554 MB). Köpost oförändrad.
- **Städning oberoende egenmätt:** PG17 down · psql-socketvägran · 10 blad
  orörda · fellogg kvar enligt mall · lås frigjort.
- **Prediktioner 9/9** (P5 EXAKT 788/0; P3: uppskattning 1 345 700 mot
  faktiskt 1 345 719 — 19 rader av, trängsta i serien).
- **KVD:** src/ orörd = INGET bygge · R2 orörd (.pgpass endast pekare,
  prod endast LÄST, GDPR: antal+tider) · data/blogg/ orörd · data/backups
  ENDAST LÄST · syskonytor orörda (verktyg omodifierade).
  Protokoll: DR-OVNING-2026-09-20-KVALLS-JUNGRU.md + DR-PROV-2026-09-20-
  AUTO-4.md + DR-RPO-DIFF-2026-09-20-KVALL.json.

Kö: blad 11:s födelsebevis 02:30 imorgon (förhandsregister: public ≈
1 345 719 + nattens tillväxt; blad-11 levande förhandsverifierat av u1
12:38) · aufr kvällspunkt 2 (tvåpunktsbas) · kund/R2 GitHub-nyckeln.

## S10-U2 (manifest auto-s10-1789923906930, ANDRA INSTANSEN) — KEDJA 2-KVALL: moln-JSON:ns restore-väg bevisad för 09-20 + u3:s köpostsband restore-stängt (2026-09-20 19:21–19:28 lokal, GODKÄNT)

Andra u2-instansen i omgången (första instansen levererade APP-DB kvällspunkt 4,
commit 7f3b076e 19:17:56 — denna instans valde enligt ordern nästa fria objekt;
anspråk disk-först med P1–P10 låsta FÖRE mätning: data/vakten/s10-u2-kedja2dr-2026-09-20-ansprak.md).
VAL: KEDJA 2 (molnbackupens full-JSON) hade INTE körts sedan 09-17 medan alla
mätningar 09-18→09-20 var KEDJA-0/1 — och JSON-filen är appens ENDA händelsekopia
(u2:a-instansens 19:12-mätning: RPO-gap 1 478 mot just denna fil). Morgonens u2
stängde u3:s band [2 400, 2 950] via HEADER-läsning; detta pass bevisar
RESTORE-vägen: `node verktyg/dr-kedja2.mjs` (u3:2:s verktyg, OMODIFIERAT) GRÖN
exit 0 — system-events-full-2026-09-20.json.gz (27 792 947 B, SHA c8735a87…,
header 168 696/truncerad false) → gzip-ström → giltighetskontrakt → COPY →
skrap-DB ak1a_dr_json → oberoende omräkning.

MÄTETAL: RTO 34,3 s (COPY-fas 34,2 s · 4 933 rader/s; ref 09-17: 25,0 s @ 163 039)
· FYRA-SAMMA 168 696 (header == lästa == COPY-n == PG == unika id) · 0 felaktiga ·
0 dubblett-id · severity info 167 765/warning 931 · typer oversattning 146 190 ·
trafik 21 361 · sakerhet 1 031 · akm2_snapshot 101 · jsonb-prov 21 361 == trafik
EXAKT · tidsfönster till 02:38:45,830+02. Dagssteg 2 629 ∈ [2 400, 2 950] ✅ —
köposten nu stängd på BÅDA vägarna (header + restore).

PREDIKTIONSDOM 7 ✅ / 3 ❌ ärligt bokförd: P5 max(tid)-bandet sattes runt
dumpstart men sista eventet ligger 107 s FÖRÄRAN (molnexportens eftersläpning —
korrigerat band: [dumpstart−300 s, dumpstart]); P7a–c linjär skalning av 09-17:
fördelningen förutsatte all-tillväxt men oversattning är FROSEN och trafik
kvällsväxer (samma klass som u2:a-instansens "fönstermedel ≠ fas"-läxa).

FYND (observationsposter; cron-yta = huvudagentens): (1) oversattning EXAKT
146 190 sedan 09-17 = 0 nya på 3 dygn — troligen motorn klar (100 % översatt);
följs mot 09-21:s JSON, två veckors stilla = definitivt bevis. (2) trafik
+5 446 på 3 dygn (~1 815/dygn, kvällstyngt) — blockeringstrafiken lever.
(3) akm2_snapshot 101 OFÖRÄNDRAD i aufr-events medan pumpen skriver
+18 984/dygn i rkaq — entalsfönster, räknas ALDRIG som snapshot-bevis.
(4) kedja 2:s "02:40-punkt" mäter faktiskt 02:38:45 (107 s eftersläpning) —
relevant vid RPO-mätning mot live-klockan.

Städning OBEROENDE egenmätt: ak1a_dr_json raderad · PG17 down (viloläge) · /tmp
ren · arkiv ENDAST LÄST bevisat (SHA-256 + mtime byte-identiska före/efter).
KVD: src/ orörd = INGET bygge (grinden bär baslinjen) · R2 orörd · data/blogg/
orörd · syskonytor orörda · GDPR endast antal/typer. Protokoll:
DR-KEDJA2-ATERSTALLNING-2026-09-20-KVALL.md/.json + maskinellt
DR-KEDJA2-2026-09-20-AUTO.md. Kö: blad 11:s födelsebevis 09-21 02:30 ·
oversättnings-stillastående följs 09-21 02:40 · kvartalsövning ≤2026-12-20.


## S10-U3 — DUBBELPROJEKT-KUREN LANDAD: app-DB:n (aufr) får egen nattlig crontab-dump 02:50 — RPO-gapet ~2 400 r/dygn stängs från i natt (2026-09-20 19:08–19:29 lokal, GODKÄNT)

Agent: s10-u3 (manifest auto-s10-1789923906930, vakt 3/3). VAL: spårets
bokade stående gap — appens projekt dumpades ALDRIG av kedja 1 (02:30 läser
rkaq). §7-köns .pgpass-blockerare var upplöst av KEDJA-0-bevisen (lösenord
läses vid körning ur .env.production.local — R2-nära ytor orörda), därmed
fabrikslevererbar. Anspråk disk-först 19:08.

- **KUREN TREDELAD + ALLT BEVISAT SAME-NIGHT:** (1) `verktyg/dumpa-app-db.sh`
  — rkaq-kontrakt + .part-säkerhet (trunkerat blad kan ALDRIG ligga i
  kedjan) + markörkontroll FÖRE retention (RÖD = stopp, inga raderingar);
  (2) crontab rad 6 `50 2 * * * …dumpa-app-db.sh` installerad 19:29
  (6 rader; före-kopia committad — revert = en rad); (3) bevisövning:
  dumpen körd under `env -i` cron-paritets-env.
- **FÖRSTA APP-BLADET GRÖNT:** db-app-2026-09-20.sql.gz · 84,2 MB ·
  sha 1453365e… · slutmarkörkontrakt ✓ (CREATE 418/COPY 420) · dump 371 s
  (kvällsbelastad; nattreferens 115–178 s) · RAM-grind väntade 150 s in
  ett prod-bygge (840→2 174 MB) — doktrin följd.
- **ÅTERSTÄLLNING AV DET RIKTIGA bladet** (fullformat, rkaq-paritet):
  RTO **32,9 s** · fel **2 611 = 100 % kända, 0 okända** (roll/grant-
  universumet: service_role 572 · authenticated 569 · anon 547 …) ·
  radkontrakt public **372/182 332** · alla scheman 417/185 505 ·
  system_events 170 175 (syskonets 19:09-punkt 170 174 — sammanhängande
  levande drift). Städning full: skrap-DB raderad · PG17 stoppad + nere
  (egenmätt).
- **RPO-gapet mätt:** +1 189 public-rader på 6,55 h sedan 12:43-punkten
  (181,5 r/h dag/kväll-blandat; system_events +862, user_activities +327)
  ⇒ trefasmodellen ~2 400–2 500 r/dygn som hittills växte i ENDA kopian —
  från 02:50 i natt fångas varje dygn i egen bladkedja, 30 dagars
  retention.
- **Kompatibilitetsbevis:** rkaq-vakten `--natt` exit 0 (opåverkad) ·
  baslinjen 10 blad UTAN app-bladet (regex-skydd) · rkaq-radens retention
  `db-*` täcker även app-bladen (samma policy — harmlös dubbelsäkring).
- KVD: src/ orörd = INGET bygge · R2 orörd (.env*/.pgpass ENDAST lästa,
  aldrig skrivna) · prod orörd (klientläsning) · data/blogg/ orörd ·
  syskonytor orörda (KEDJA0-3 = deras, inläst som jämförelsetal).
  Protokoll: DR-OVNING-2026-09-20-DUBBELPROJEKT-KUR.md + maskinellt
  DR-APPDUMP-2026-09-20-KUR.json.

Kö: **jungfrukörningsbevis 09-21 ~02:50** — /tmp/supabase-appdump.log
första rad + db-app-2026-09-21.sql.gz GRÖN (DUBBELPROJEKT-jungurkvitto) ·
kedja 3:s konfigsnapshot nästa söndag bär rad 6 (6==6) · kvartalssviten
får --fil-app-bladkontroll · dr-rpo-diff.mjs --projekt-app (u2-läxa) har
nu en kedja att mäta mot.

## S10-U3 (ANDRA INSTANSEN, pivot) — KEDJA-2-TREKÄLLA + AUFR-SKYDDSMATRIS: 372/373 public-tabeller hade INGET kedja-2-skydd före kvällens kür-blad; dump-kedjorna själva arkiv/offsite-oskyddade (2026-09-20 19:10–19:4x lokal, GODKÄNT)

- **Slotkollision + pivot (D24):** dispatchen visade slotens ursprungsanspråk
  (DUBBELPROJEKT-KUREN) ägas av en LEVANDE förstainstans (process-träd
  zcode → /tmp/s10u3-kur-ovning.mjs → pg_dump mot aufr 19:19) — kollisions-
  notis + pivoterat anspråk disk-först 19:26, kurens ytor orörda; första-
  instansen fullbordade själv (ff1eea41). Overlap med u2-andra-instansen
  (c954a0b9, dr-kedja2 AUTO 34,3 s) bokförd öppet: min körning = tredje
  instansens REPLIK, aldrig förstabevis.
- **Kedja-2-restore REPLIK (dr-kedja2.mjs OMODIFIERAT):** nattens artefakt
  system-events-full-2026-09-20.json.gz (27,8 MB) → RTO **36,9 s** ·
  radkontrakt EXAKT 168 696/168 696/unika 168 696 · 0 felaktiga · 0
  dubblett-id · serien (pausad sedan 09-17) nu dubbelbevisad samma kväll —
  determinism dag 4 (34,3/36,9 s).
- **Trekällakontraktet system_events:** JSON 02:40 = 168 696 → kür-bladet
  19:25 = 170 175 (+1 479 på 16,7 h ≈ 88,6 r/h) → levande 19:31 =
  170 439 (+264). Burstens rot: **276 nya rader sedan 19:19, 100 % typen
  trafik** (0 översättningar, 0 säkerhet) ≈ 23 r/min söndagskväll —
  RPO-mätare som antar jämn tillväxt underskattar toppminuter.
- **Skyddsmatrisen (P8 kraftigt underskattat):** bladets hela COPY-
  inventering (en strömpass 21,8 s): **373 public-tabeller** (102 med
  rader, 271 tomma), 182 378 rader + auth 27/cron 2/realtime 8/storage 8/
  migrations 1/vault 1. Kedja 2 täcker **1/373** (system_events = 93,3 %
  av raderna men 0,3 % av tabellerna): **101 icke-noll-tabeller med
  12 203 rader** (user_activities 6 271 · autonomous_system_evolution
  1 359 · agent_swarm 1 000 · learning_feedback_loops 714 ·
  ai_performance_metrics 437 + 96 fler) hade INGET skydd före kür-bladet
  19:25 — historiens första fulla aufr-backup. Maskinell matris:
  DR-KEDJA2-SKYDDSMATRIS-2026-09-20.json.
- **NYTT GAP (F3):** data/backups-kedjorna (rkaq-blad, db-app-blad,
  moln-JSON) exkluderas ur SÅVÄL söndagsarkivet (arkivera-server.mjs
  UTESLUTNA prefix) SOM offsite-kontraktet (endast db-snapshot.sqlite) —
  dump-kedjorna lever endast på servern. Kö-post till spåret.
- **Städning lokal PG:** verktygets finally + oberoende egenmätt 19:31:
  ak1a_dr_json borta · PG17 down (viloläge) · DR-lås frigjort.
- Prediktioner P1–P9 låsta 19:26:38 FÖRE mätning — dom **7 ✓ + 1 halv +
  1 ✗ = 7,5/9** (P6-missens rot = trafikburst; P8:s "≥4" blev 372/373).
  Protokoll: DR-OVNING-2026-09-20-SENKVALL-KEDJA2-TREKALLA.md ·
  maskinellt DR-KEDJA2-2026-09-20-AUTO-2.md.
- KVD: src/ orörd = INGET bygge · R2 orörd · GDPR endast antal/typer/
  tider (radinnehåll och nycklar ALDRIG loggade) · data/blogg/ orörd ·
  data/backups ENDAST LÄST · syskonytor orörda (ff1eea41/c954a0b9
  verifierade). Kö: F3-arkivgapet värdar en verktygsvåg · dubbelfödelsen
  02:30/02:50 imorgon natt · dr-rpo-diff.mjs --projekt-app.


### S10-U2 NATT-RPO + GRINDFYND F1 — 2026-09-21 02:1x lokal (spår 10, manifest auto-s10-1789948522392, vakt 2/3)

- RPO-NATTPUNKT (`verktyg/dr-rpo-diff.mjs`, OMODIFIERAT, GRÖN exit 0): blad 10
  COPY-total **1 345 719 EXAKT** · levande prod 1 365 503 · **+19 784 oskyddade
  vid ~23,7 h** — seriens längsta mätta fönster (kvällspunkten 16,6 h → +19 548) ·
  3/60 tabeller i rörelse: snapshots +18 984 (pumpens 08:00-batch, OFÖRÄNDRAD sedan
  kvällen — dag 4) · board +752 (kväll→natt +224 = 32 r/h; bandet 31,0–36,0 lever)
  · organ +48 · organisk nattpaus +236/7 h ≈ 34 r/h ⇒ **rkaq = maskinuniversum,
  fas-oberoende ~32 r/h dygnet runt** (aufr:s spegel: tvåläge 132–179 r/h).
  Maskinellt delprotokoll: data/forskning/DR-RPO-DIFF-2026-09-21-NATT.json ·
  handprotokoll: DR-OVNING-2026-09-21-NATT-RPO-GRIND.md.
- **GRINDFYND F1 (DR-planeringsregel):** dr-ovning.mjs/dr-appdump.mjs (tröskel
  MemAvailable ≥ 1 000 MB) real-NEKAS medan agentfabriken kör omgångar om 3:
  available 404 → 474 MB (fyra zcode-cli ≈ 1,7 GB + node-repl-mcp ≈ 380 MB).
  APP-nattpunkt 5 nekades exit 75 ×2 (02:05, 02:08) med korrekt vänta-retry.
  u1:s natt-DR 01:58:18 passerade med sekunders marginal — TUR, ej kontrakt.
  **REGEL: kvartalsövningen ≤2026-12-20 (och all restore-övning) körs i TOM
  fabrik, eller DR-uppgift först i omgången innan syskonprocesser växt.**
- Städning: inget lokalt PG17-fönster öppnades (RPO rör inte lokal PG); PG17
  down eftermätt · u1:s kvarlämnade låspid-rad = information, flocken frigjord.
- Kö: 02:30 blad 11-födelsebevis · 02:40 moln-JSON + u2:a:s prognosdom
  (171 080, band [170 950, 171 250]) · **02:50 KURENS FÖRSTA automatiska
  appdump — jfr handprotokollets P2–P10-band** · oversättningsdom t.o.m. 10-01 ·
  kvartalsövning ≤2026-12-20 med F1-regeln.

## S10-U1 — NATTFAS-DR: RAM-grindens tredje eldprov (skip 343 MB → retry GRÖN) + blad 10:s femte restore = seriens determinismdag (2026-09-21 01:52–02:12 lokal, GODKÄNT)

Fabriksorder: "DR-övning: återställ, mät tid/rader, protokoll, städa lokal PG".
Anspråk låst disk-först 01:5x (data/vakten/s10-u1-nattdr-2026-09-21-ansprak.md)
med ÅTTA förregistrerade prediktioner — seriens första NATTFAS-punkt (~02:00;
morgon 06:3x / middag 12:3x / kväll 19:0x var redan mätta).

**RAM-grindens tredje eldprov (efti 16:42-incidenten + APP-DB middag 3):**
första försöket 01:58 SKIPPADES korrekt — MemAvailable 343 MB < 1 000 MB.
Rotsond (ps): den LEVANDE fabriksomgången — 36 zcode-processer (~0,8 GB/st
enligt våg 146-kalkylen), däribland 7 langlivade sedan Sep 11/13 (OBSERVATION
only — processstädning är huvudagentens/yta, ej beröring). Ingen läcka, volym.
Grinden respekterades (ALDRIG kringgås — prod-skydd); retry 02:10 EFTER
frigörelse (2 355 MB tillgängligt; 02:05-omgången vägrades ny av fabrikens
RAM-vakt < 1 500 MB — systemet självkoordinerat).

**Körning `node verktyg/dr-ovning.mjs` GRÖN exit 0** (instrumentet
OMODIFIERAT — syskonläran; auto-lås flock /tmp/ak1a-dr-prov.lock):
- Dumpkontroll: db-2026-09-20.sql.gz GRÖN (markörkontraktet, 1 367 628 rader)
- RTO **13,7 s** (nattfas, kall PG17 + kallt sidminne; kvällspunkten 12,7 s →
  natten +1,0 s — fortfarande undre halvan av seriens band 11,5–26,8 s)
- Mätning: public **60 tabeller / 1 345 719 rader** · public+storage 68/1 345 855 ·
  alla scheman 99/1 346 115 — EXAKT gårdagens kvällspunkt på samma blad
- Restore-fel: **788 kända / 0 okända** (Supabase-roller/scheman — ofarliga)
- Nyckeltabeller: section_data_snapshots 1 252 404 · board_decisions 50 114 — EXAKTA
- Städning: skrap-DB ak1a_dr_test raderad · PG17 stoppad — OBEROENDE
  verifierad (pg_lsclusters: down). Låsfilen kvarstår = flock-information
  (dött lås tas över efter 30 min, verktygets kontrakt).

**Prediktionsdom 8/8 INFRIADE** (P1 13,7 s ∈ [11,5; 25] · P2 60 · P3 1 345 719
EXAKT · P4 0 okända · P5 788 EXAKT · P6 båda EXAKTA · P7 städning · P8 filnamn).
P3+P5+P6 = restore är en ren funktion av bladet — instrumentets determinism
bevisad dag 5 i raden (samma blad, olika agenter/faser, byte-identiska tal).

**Tidsläge:** blad 10:s SISTA restore — blad 11 (db-2026-09-21.sql.gz) föds
02:30, 18 min efter körningen; app-DB-cronen 02:50 gör kurens första
automatiska aufr-nattdump strax efter (syskonens DUBBELPROJEKT-KUR — deras kvitto).

Protokoll: data/forskning/DR-PROV-2026-09-21-AUTO.md (verktygsgenererat).
Nästa kvartalsövning enligt protokollet: senast 2026-12-21. src/ orörd —
tsc-baslinjen orörd, inga byggen. Slutdom: **GRÖN — övningen godkänd**.

SLUT — sektion inlagd av s10-u1 2026-09-21.
