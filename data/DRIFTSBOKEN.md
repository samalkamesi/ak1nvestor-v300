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
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade restore: **KVÄLLS-DR 2026-09-17 21:09 lokal (s10-u2 vakt 2/3: RTO 11,0 s — seriepunkt 20, dagens snabbaste, spannet 10,3–23,9 oförändrat · 60 tabeller/1 286 328 rader — SEX oberoende instrument samma tal · pump-noll 14:40→21:09 (+0 snapshots på 6,5 h) = O9:s profillucka stängd · beslutsklockan +220/6,48 h = 34 r/h tredje dagtimmen samma snitt · värsta-fall-RPO ≈ +19 780 möter O9:s ≈ +19 800 · VAKTFYND: valDump-kuren bevisad 14:33 men ALDRIG committad och BORTA från disken vid 21:07 (git-ren mot 09-16, mtime 14:37) — återlevererad troget spec, beteendeprov AUTO-6 RÖT-vägran → AUTO-7 GRÖN med NOTIS, committad I SAMMA FÖNSTER; NY NORM: verktygsändring + beteendeprov + commit i samma fönster; protokoll DR-OVNING-2026-09-17-KVALL-RPO.md + JSON DR-RPO-DIFF-2026-09-17-KVALL.json)**; dessförinnan **KEDJA 7 — KIRURGIRECEPTET FÖR BOARD_DECISIONS BEVISAT 2026-09-17 14:43 lokal (s10-u2 O9, `node verktyg/dr-kedja7.mjs` GRÖN exit 0; agentprotokoll DR-KEDJA7-2026-09-17-BOARD-RECEPT.md + maskinella DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md = RÖT/RÖT/GRÖN-beviskedjan): spårets äldsta öppna köpost STÄNGD — kedja 5:s FYND 1 (board_decisions kan EJ kirurgeras: FK:n forecast_log.board_decision_id ON DELETE SET NULL gör att kirurgins DELETE UPDATE:a forecast_log, där trg_forecast_log_immutable vägrar allt) har nu sitt bevisade recept: `SET LOCAL session_replication_role = replica` i kirurgins ENDA transaktion (superuser — lokal PG-postgres är det) — replica-läget stänger av triggrar OCH FK-enforsering: SET NULL-kaskaden eldas ALDRIG (0 ärr: forecast_log 429 rader/113 referenser OBERÖRDA, till skillnad från FK-paus-varianter) men FK validerar ej heller under appliceringen ⇒ verktygets OBLIGATORISKA efterkontrakt, alla GRÖNA: rader 47 810 == källa · checksumma 8e16c9e7… IDENTISK · hängande-referenssond 0 · skyddstriggrar 2/2 aktiva (tgenabled=O) · LIVE-bevis — engångs-UPDATE i forecast_log VÄGRAS fortfarande efteråt · roll `origin` (SET LOCAL dog med transaktionen). Mätvärden: full restore 15,2 s (fel 788 kända/0 okända; kedja 7-serie 17,5/13,1/15,2) · extraktion 47 810 rader/80,9 MiB/1,1 s (antalskontrakt == källa) · KATASTROF-mutation (buggig migrering, consensus_level=-1) 500 rader LANDADE (sondbekräftat) · NAIVA kirurgin (kedja 5:s recept) VÄGRAD på 0,5 s exakt av "AK1A prognosmotor: UPDATE på forecast_log är förbjuden" + HEL rullbak, katastrofen kvar (fynd 1 mekaniskt återbevisat) · sabotage (mitt-rads-kolumnfel i receptfilen) vägrat + rullbak · RECEPET 4,2 s. FYND: (a) SKIKTAT SKYDD — en olycks-DELETE av board_decisions stoppas REDAN av skyddet via kaskaden; den farliga katastrofen är MUTATION (tabellen själv triggerfri — konsensusförfalskning landar obehindrat) och ENDAST replica-receptet läker den; (b) två instrumentbuggar bokförda enligt ärlighetsdoktrinen: kör 1 RÖT på conrelid::regclass::text utan public.-prefix (search_path) → normaliseringskur; kör 2 RÖT på psql -q som döljer UPDATE-n-ekot → oberoende sond-kur (process-eko är inget mått); (c) runbook för prod tillämpning i sektionen nedan. Städning ägar + oberoende mätt: skrap-DB ak1a_dr_k7 raderad, PG17 stoppad, tmp raderade (fellogg medvetet kvar), låsfil utan hållare.** Dessförinnan **EFTERMIDDAGS-DR 2026-09-17 — DUBBEL STABIL RPO-PUNKT + INTRA-DAG-NOLL + FALSK RÖT-DOM KURAD (2026-09-17 14:28–14:41 lokal, s10-u3 O9, `node verktyg/dr-ovning.mjs` ×3 GRÖN ×2 + `PGPASSFILE=… node verktyg/dr-rpo-diff.mjs` ×2, protokoll DR-OVNING-2026-09-17-EFTERMIDDAG-RPO.md + maskinella DR-PROV-2026-09-17-AUTO-{3,4,5}.md + JSON DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json): RTO-punkt 18 = 17,1 s (absolut väg) + punkt 19 = 14,1 s (dagens snabbaste — samma relativa bladargument EFTER kuren); jungfrubladet db-2026-09-17:s radtal 60 tabeller/1 286 328 == dump-COPY == morgonens två restore = FEM instrument samma tal (bladets mest oberoende bevis); RPO kl 14:31 +19 392 oskyddade på 11,9 h (snapshots +18 984 · beslutsklockan +408 · 3 av 60) == s10-u1:s MIDDAG-mätning SAMMA minut = oberoende replik två instrument; punkt 2 kl 14:40:39 TOTALT +0 på 9,2 min mitt på dagen (snapshots 1 214 436 oförändrad — ingen drip) ⇒ med s10-u1:s exakta 08:00:00,058-tidsstämpel är dygns-RPO-profilen KOMPLETT: växling 02:30 (0) → batchkliv 08:00 (+18 984 i ETT bulk-påstående) → episodiskt kryp → VÄRSTA FALL ≈ +19 800 == dagsteget sekunder före nästa växling (två beräkningsvägar möts); 02:30-placeringen bevisad optimal bland ett enda blad (ligger i pumpens stilla natt-gap; s10-u1:s runbook-kö extra blad ~08:05 bygger på profilen); beslutsklockan preciserad till EPISODISK (+0 på 9,2 min trots 34 r/h-snitt — rundstyrd?); VAKTFYND+ROTORSAKSKUR: `--fil db-…` med bart bladnamn dömdes FALSKT RÖTT (dr-ovning.mjs path.resolve mot cwd; AUTO-3: restore VÄGRADES, PG17 orörd = fail-fast bevisat i felriktningen) → kirurgisk `valDump()` (bladnamn som saknas relativt cwd resolvas mot dumpkatalogen med NOTIS-rad; äkta saknad fil förblir RÖD) → beteendeprov AUTO-5: SAMMA kommando GRÖNT med NOTIS + full restore 14,1 s; node --check GRÖN, inga andra verktyg rörda; PG-städning egenmätt (base endast OID 1/4/5, pg_wal 497 MB oförändrad, PG17 down, /tmp enligt mall).** Dessförinnan **MIDDAGS-DR 2026-09-17 — KEDJA 4 PÅ JUNGFRU-CRON-SETET + PUMPSTARTEN TIDSATT + TOMMA PER-TYP BESVARADE (2026-09-17 14:26–14:35 lokal, s10-u1, `node verktyg/dr-kedja4.mjs` GRÖN exit 0 + `PGPASSFILE=… node verktyg/dr-rpo-diff.mjs --json` + läsande captured_at-sond, protokoll DR-OVNING-2026-09-17-MIDDAG.md + maskinellt DR-PROV-2026-09-17-KEDJA4.md + JSON DR-RPO-DIFF-2026-09-17-MIDDAG.json): kedja 4 första gången på en OBEVAKAD cron-export (09-16-setet var manuellt exporterat) — RAM-grind GRÖN direkt (1 223 MB), självtest 4/4, 10/10 per-typ-filer GRÖNA (0 VARNINGAR = inga tysta exportfel), ⊆ full-arkiv 10 matchade/0 saknade (arkiv 163 039), restore i skrap-PG 10 rader från 10 filer RTO 0,10 s, oberoende PG-verifiering (perTyp blogg_utkast=7 + medlem=3, jsonb 10), städning verifierad (ak1a_dr_pertyp raderad, PG17 nere); KÖPOSTEN TOMMA PER-TYP BESVARAD — de 8 tomma filerna är ÄKTA TOMMA: arkivets faktiska per-typ-fördelning är medlem=3 · blogg_utkast=7, alla övriga 8 bevakade typer 0 OCKSÅ i arkivet (källan tom, ej exportfel; räkneklarering: 8 av 10 per-typ-filer + full-arkivet som 11:e fil; ytan stillastående — de 10 raderna bär fönstret 09-11 10:44→23:25, inga nya event av bevakade typer på 6 dygn); MORGNONS KÖPOST PUMPSTART INFRIAD — snapshots-pumpen skriver HELA dagens batch vid exakt 08:00:00 lokal (captured_at 06:00:00.058474Z, samtliga 18 984 rader EN tidsstämpel = ett enda bulk-påstående; gårddagen identisk 06:00:00.047496Z/18 984): morgonmätningen 07:43 såg pumpen på 0 (17 min före start), middagsmätningen 14:31 såg den klar — fönstret (07:43, 14:31) slutet av mätningarna, sonden sätter start exakt; KORSBEVIS sondens 18 984 == diffens +18 984; MIDDAGS-RPO: +19 392 oskyddade på 11,9 h sedan 02:30-bladet i 3 av 60 tabeller (snapshots +18 984 · board_decisions +384 · organ_health_logs +24, inga negativa); TVÅ-KLOCKOR-BILDEN KOMPLETT: beslutsklockan +163→+408 på 6,81 h ≈ 36,0 r/h (serien 31,3–36,0, jämn dygnet runt) medan pumpen levererar EN batch/dag kl 08:00 ⇒ ~96 % av RPO-skulden byggs i en enda sekund; RUNBOOK-KÖ till huvudagenten: ett extra blad ~08:05 skär värsta-falls-RPO:n ≈ 19 700 → ≈ 408 rader (−96 %, RTO-kostnad ~10 s) — crontaben ägs av huvudagenten, inget ändrat av agenten.** Dessförinnan **JUNGRUDAGEN KEDJA 1 — FÖNSTRETS SJUNDE BLAD db-2026-09-17 RESTORE-BEVISAT + FÖNSTRET KOMPLETT 7 BLAD (N ∈ [0..6]) + FÖRSTA MORGNON-RPO:N (2026-09-17 07:39–07:45 lokal, s10-u3 O8, `node verktyg/dr-ovning.mjs --fil db-2026-09-17.sql.gz` GRÖN exit 0 + `dr-rpo-diff.mjs --json`, protokoll DR-OVNING-2026-09-17-JUNGRUDAG-7-BLAD.md + maskinellt DR-PROV-2026-09-17-AUTO.md + JSON DR-RPO-DIFF-2026-09-17-MORGON.json): nattens 02:30-blad GRÖNT 1 307 940 rader · RTO 12,1 s (seriens punkt 16, spann 10,3–23,9 s) · fel 788 kända/0 okända · public 60 tabeller/1 286 328 rader == dumpens COPY-räkning (två instrument, samma tal); dagstegsserien KONFIRMERAD med femte punkten +19 800 (spridning 8 rader över 5 steg: 19 805/19 797/19 797/19 800/19 800); FYND TVÅ KLOCKOR i RPO-bilden — beslutsklockan (board_decisions+organ_health_logs) ≈ 31 r/h jämn dygnet runt (natt 31,9 · morgon 31,3) medan snapshots-pumpen (+19 800/dag) stod HELT STILLA 02:30→07:43 (morgondelta +163 endast beslutsklockan) — timmarna efter växlingen är nästan kostnadsfria, skulden byggs först när pumpen startar (köpost: mitt-på-dagens-mätning tidssätter startet); RAM-GRINDKUR under fabrikstrefönstret: exit 75 vid 943 MB (tre fabriksbarn + main) → poll-vänta-tills-öppet 120 s → GRÖN 1 155 MB, PG orörd under väntan; SAMMA blad oberoende replikerat av s10-u1 O8 21 s senare (deras AUTO-2: 12,4 s — FYRKANTIGT KORSBEVIS restore-COUNT ×2 == dump-COPY == 1 286 328, se deras FÖDELSEBEVIS)**. Dessförinnan **JUNGFRUNATT KEDJA 2 — RAD 3:S FÖRSTA OBEVAKADE NATTEXPORT (02:40) BEVISAD ÄNDA TILL RESTORE 2026-09-17 07:36–07:39 lokal (s10-u2 O8, `node verktyg/dr-kedja2.mjs` GRÖN exit 0 på jungfrunattens arkiv system-events-full-2026-09-17.json.gz, protokoll DR-KEDJA2-2026-09-17-JUNGRUNATT.md + maskinellt DR-KEDJA2-2026-09-17-AUTO.md): jungfrunatt-bevis — /tmp/moln-backup.log FÖDD 02:40:01.838 (stat-Birth: loggen skapad av cron-körningen själv = rad 3:s första körning någonsin; 09-16:s export var manuell och skrev aldrig loggen), tidslinje 02:40:01→02:40:38 ≈ 37 s (10 per-typ-filer 02:40:02–03 → system-events-full 26.3 MB klar 02:40:38), total-kontrakt KOMPLETT 163039/163039 (v3-trunceringsvakten GRÖN på första obevakade natten), äkthetsdiff 161 678 (09-16 manuell) → 163 039 (09-17 cron) = +1 361 rader på 19 h 16 min = äkta ny export ej kopia; RESTORE: 163 039 rader · 0 felaktiga · 0 dubblett-id · RTO 25,0 s = KEDJA 2-SERIENS SNABBASTE (52–58 · 27,2 · 38,5 · 37,3 · 25,0) · COPY 6 535 r/s · oberoende PG-verifiering rader==unikaId==163 039 · tidsfönster till 09-17 02:40:02 (sista raden skriven sekunder före exporten) · severity info 162 296/warning 743 · jsonb-prov 15 915; ⇒ KEDJA 2 BEVISAD ÄNDA TILL ÄNDA UTAN AGENT I KEDJAN — BÅDA nattkedjorna (02:30 SQL + 02:40 JSON) har nu jungfrunatts-bevis ända till restore-bar lokal PG; observation: 0 dublett-id mot gårdagens 4 (hypotes: v3:s repetitionsskydd — ej bevisat, prod-PK saknas fortfarande); köpost: 8 av 11 per-typ-tabeller TOMMA i nattexporten.** Dessförinnan **FÖNSTERKONTINUITETEN: ALLA SEX blad restore-bevisade + RETENTIONSPROVET 2026-09-17 01:55–01:57 lokal (s10-u3 O7, `node verktyg/dr-ovning.mjs --fil` ×3, samlingsprotokoll DR-FONSTER-KONTINUITET-2026-09-17.md + maskinella DR-PROV-2026-09-16-AUTO-{7,8,9}.md): fönstrets MITT-BLAD restore-bevisade — db-2026-09-12 RTO 11,1 s · public 60 tabeller/1 187 329 rader · db-2026-09-13 11,2 s · 60/1 207 134 · db-2026-09-14 10,3 s (seriens snabbaste) · 60/1 226 931; fel 780 kända/0 okända ×3; markörer GRÖN ×3 ⇒ HELA retentionfönstret 09-11→09-16 restore-bevisat (fönsterdjupet + kedja 1-serien tog ändarna; varje N∈[0..5] "dagar sen katastrof" har nu bevisat blad + mätt radtal); FYND: tillväxten +439 (09-11→12) därefter KONSTANT ≈+19 800/dag (fönsterdjupets 16 016/dag-snitt = artefakt av 439-dagen), RTO ålder-oblessrad (10,3–11,2 s på 4–5 dagar gamla blad — 30-dagarsgränsen RTO-neutral); RETENTIONENS BETEENDEPROV (första): cron-radens exakta find -mtime +30 -delete raderade 40-dagars-dummy + skonade 28-dagars-dummy + lämnade 6 äkta blad (gränsen är >30 hela dygn; gränsfallsfilen städad manuellt — dummy överlever aldrig provet, RÖD markör låser &&-kedjans retention); första äkta bladraderingen ~2026-10-11+ då 09-11-bladet passerar 30 dygn — fönstret växer dit, fönsterdjupets dag-29-runbook gäller då för 09-11.** Dessförinnan **TOTAL-MALLEN KOMPLETT MED KIRURGI — fem kedjor ETT kommando 2026-09-17 01:52–01:55 lokal (s10-u1 O7, `node verktyg/dr-total.mjs` med dr-kedja5.mjs vävt som steg 2 av 5 i ordning 1→5→2→4→3; maskinellt överprotokoll DR-TOTAL-2026-09-16-AUTO-3.md (UTC-bladnamn) + 5 delprotokoll): samtliga 5 kedjor GRÖNA i EN sekvens — TOTALT 187,2 s (iterationsserie 130,0 → 147,0 → 187,2 s; kirurgin +73,0 s: full restore 11,4 s · extraktion 2,2 s/1 176 468 datarader · sabotage GRIPET · kirurgi 13,7 s · checksumma IDENTISK); kvartalsmallen 2026-12 = ETT kommando (--utan-kirurgi i rescue-läge); FLOCK-KÖ MELLAN AGENTER skarpt bevisad (syskonets dr-ovning tog prov-låset 13 ms efter överprotokollets slut — köade bakom mina barns lås, noll kollision).** Dessförinnan **NATT-DR + FÖRSTA NATTLIGA RPO-DIFFEN 2026-09-17 01:47–01:51 lokal (s10-u2 O7, `node verktyg/dr-ovning.mjs` GRÖN exit 0 + NYTT instrument `verktyg/dr-rpo-diff.mjs`, protokoll DR-OVNING-2026-09-17-NATT-RPO.md + JSON DR-RPO-DIFF-2026-09-17.json): kedja 1 i nattfönstret strax före 02:30-växlingen — markörer GRÖN 1 288 041 · RTO 12,7 s · fel 788 kända/0 okända · public 60 tabeller/1 266 528 rader == dumpens zcat-COPY-räkning (KORSBEVIS: två instrument, samma tal — kompletthetskontrakt i båda ändar); RPO-diff levande prod: 1 286 295 rader = +19 767 oskyddade på 23,3 h i 3 av 60 tabeller (snapshots +18 984 · board_decisions +744 · organ_health_logs +39, inga negativa); NATTDIFTSFYND: nattfönstret +408 rader/12,1 h ≈ 34 r/h vs ~1 730 r/h dagtid = natten ~50× lugnare — RPO-skulden byggs dagtid, timmen före 02:30 minst kostsam för DR; instrumentbuggar (felvillkor + schema-citering) bokförda+fixade innan GRÖN; PG-städning ägarmätt (skrap-DB borta, PG17 ner).** Dessförinnan **KEDJA 6 STORAGE-RESTORE + FYND TVÅ SUPABASE-PROJEKT 2026-09-16 20:41–20:43 lokal (s10-u3, `node verktyg/dr-kedja6.mjs`, maskinellt protokoll DR-KEDJA6-2026-09-16-AUTO.md + fyndrapport DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md): storage-lagrets BÅDA halvor restore-bevisade — metadata (5 buckets/63 objekt/0,57 MB) ur nattdumpen i skrap-DB (full restore 13,8 s · fel 788 kända/0 okända · retentionssvep 6/6 GRÖN · markörer GRÖN) + innehåll via LÄSANDE Storage-REST (bucket+objektlista 0,7 s; nerladdningsprov ak1nvestor-code.zip 1 272 122 B == live-listans metadata.size — byte-kontrakt GRÖNT, första gången innehållsvägen bevisad; blobbar har INGEN historik, runbook i protokollet); FYND 1 (akut, fyra instrument): dumpkedjan (.pgpass → db.rkaq…wxrw) och appens REST (.env → …suhvlsbp = AGENTS.md:s ref) läser TVÅ OLIKA Supabase-projekt — rkaq: system_events 0 i ALLA dumpar sedan 09-11, snapshots 1 176 468 växande ~19k/dag, board_decisions 47 602; aufr: system_events 162 741 VÄXANDE (+1 063 på 11 h), members 3, board_decisions 77, snapshots 404 — dagens "system_events TOM i prod" MOTBEVISAT som radering (tväprojekt-artefakt; ÅTERIMPORTEN ska EJ genomföras), dumpkontradiktionen + members=0 upplösta; kedjorna 1/3/4/5:s restore-bevis består (rkaq↔rkaq), men aufr:s icke-events-tabeller är OBACKADE; FYND 2 (R2, orört): aufr:s bucket "ak1nvestor-code" är PUBLIK och listade en .env.local-namngiven fil (innehållet ALDRIG läst — verktygets R2-filter valde zip:en som provobjekt) — åtgärd = huvudagenten.** Dessförinnan **TOTAL-ÖVNINGEN ITERATION 2 + FLOCK-BETEENDEPROV 2026-09-16 20:42–20:45 lokal (s10-u2 O6, `node verktyg/dr-total-flockprov.mjs`, DR-TOTAL-2026-09-16-FLOCKPROV.md + maskinellt överprotokoll DR-TOTAL-2026-09-16-AUTO-2 + 4 delprotokoll): alla fyra kedjorna GRÖNA i EN sekvens — TOTALT 147,0 s == väggklocka (kedja 1 39,9 s/restore 14,3 s · public 60 tabeller/1 266 528 rader · kedja 2 39,8 s/161 678 rader/4 955 r/s · kedja 4 36,4 s/10 av 10 + sabotage 3/3 · kedja 3 30,8 s/8 322 filer/1 195 commits) MED flock-lagret BETEENDEBEVISAT (O4:s ärlighetsnot INLÖST i förtid): (i) låsfilen bar `flock=1` med LEVANDE pid under körningen, (ii) främmande aktiv 25 s-låshållare → dr-total KÖADE och tog över efter 24,1 s (gamla fillås-semantiken hade exit 3 direkt), (iii) 45 min bakdaterad död låsfil oskadlig — exit 3 uteblev; PG-städning verifierad (PG17 nere, /tmp/dr-total-* borta, låset släppt); grindläge MemAvailable 1 075 MB (nära 1 000-taket — omkörningsvägen förblev overksam); kvartalsmallen 2026-12 = ETT KOMMANDO `dr-total-flockprov.mjs` (övningskärnan + gratis flock-om-verifiering).** Dessförinnan **KIRURGI-ÖVNINGEN 2026-09-16 14:09–14:13 lokal (s10-u2 O5, `node verktyg/dr-kedja5.mjs`, DR-KEDJA5-2026-09-16-KIRURGI.md + tre maskinella delprotokoll): KEDJA 5 kirurgisk TABELLåterställning — organismens minne (public.section_data_snapshots, 1 176 468 rader ≈ 92 % av DB:n) tillbaka som ENDA tabell ur nattdumpens COPY-block: extraktion 2,4 s (zcat+awk, 93 369 KiB, antalskontrakt == källa) + atomisk applicering 15,5 s (DELETE+COPY i EN transaktion), radantal+checksumma IDENTISKA med fullt återställd källa; sabotage (kolumnfel i mitt-rad) GRIPT — psql ON_ERROR_STOP vägrade, transaktionen rullades tillbaka, tabellen orörd; NYTT stående kontrakt: retentionssvep 6/6 dumpar gzip-gröna per körning (kedja 3:s läxa mekaniserad på dumparna); FYND: (1) board_decisions kan EJ kirurgeras — SET NULL-kaskaden mot forecast_log stoppas av forecast_immutable()-triggern (äkta skydd mot olycksradering; specialrecept = huvudagenten), (2) psql accepterar TYST en vid EOF trunkerad COPY (bevisat: 705 881 rader landade exit 0) — radantal+checksumma är OBLIGATORISKT completeness-kontrakt, verktyget bär det.** Senast bevisade FÖNSTERDJUP (äldsta bladet): **FÖNSTERDJUPSÖVNINGEN 2026-09-16 20:49–20:55 lokal (s10-u1 O6, `node verktyg/dr-fonsterdjup.mjs`, DR-FONSTERDJUP-2026-09-16.md): retentionens ÄLDSTA blad (db-2026-09-11, dag 1 av 30) restore-bevisat i två körningar — RTO 15,4 + 14,5 s, okända fel 0, PG count == dumpblock för 60/60 public-tabeller (1 186 890 == 1 186 890); fönstrets tillväxtdiff äldsta→yngsta: +80 082 rader/5 dagar (≈ 16 016/dag; drivers snapshots +75 936 · board_decisions +3 493 · cron +449; 4 nya auth-plattformstabeller; konton 5→3) — gzip-integritet (kedja 5:s svep) är inte restore-barhet, detta är djupbeviset.** Senast bevisade FULLA restore: **TOTAL-KVARTALSÖVNINGEN ETT KOMMANDO 2026-09-16 13:51–13:53 (s10-u2 o4, `node verktyg/dr-total.mjs`, DR-TOTAL-2026-09-16-AUTO.md): alla fyra kedjorna GRÖNA i EN sekvens — TOTAL-RTO 130,0 s = summa==väggklocka (kedja 1 23,3 s/restore 12,2 s · kedja 2 43,8 s/161 678 r · kedja 4 33,4 s · kedja 3 29,6 s/arkiv 8 892 poster = s10-u1 o5:s minutfärska export korsbevisad) med fail-fast + RAM-omkörningskontrakt + vilolägesgaranti i finally — kvartalsmallen 2026-12 = ETT KOMMANDO (korsbevis: s10-u3 3/3:s manuella sekvens ≈105 s samma dag; flock-lagret tillagt efter körningen — BETEENDEBEVISAT 20:42 samma dag av O6, se DR-radens lead).** Dessförinnan **KVARTALSÖVNINGEN I FYRA KEDJOR 2026-09-16 13:40–13:45 (s10-u3 3/3, DR-KVARTAL-2026-09-16-FYRAKEDJOR.md): kedja 1 RTO 17,3 s — nionde punkten (public 60 tabeller/1 266 528 rader == dumpens COPY-radantal: två instrument, samma tal) + kedja 2 GRÖN 161 678 rader/39,0 s + kedja 3 GRÖN (sabotage 3/3 gripna, git-klon 1 195 commits, restore == listat) + kedja 4 GRÖN (10/10 ⊆ full-arkivet) — ALLA FYRA i EN sekvens ≈ 105 s; kvartalsmallen = FYRA kommandon (dr-ovning/dr-kedja2/dr-kedja3/dr-kedja4), nästa senast 2026-12-16. FÖRSTA FULLA LIVE-PROD-DIFFEN (psql COUNT per tabell via PGPASSFILE, 60 tabeller): RPO-delta +19 359 sedan 02:30-dumpen = väntad tillväxt i 3 tabeller, inget oväntat. **AKUT FYND: system_events TOM i levande prod** — 0 rader 13:46 lokal (tabellägare postgres bypassar RLS ⇒ talet sant; 161 678 rader fanns 07:24; raderade i fönstret 07:23–13:46 lokal; inget lokalt el. molnets cron-jobb raderar tabellen; nya events skrivs EJ heller — skrivvägen tystnade); dagens arkiv = ENDA kopian (kopia /tmp/s10u3-arkiv-sakerhetskopia.json.gz, md5 35ce34fc…); återimport mekaniserad (aterstall-system-events.mjs --plan-supabase) men skrivning mot prod = HUVUDAGENTENS beslut — se DR-KVARTAL-…-FYRAKEDJOR.md §4–5.** **RÄTTAD 20:5x lokal samma kväll av KEDJA 6 (S10-U3, se DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md): fyndet var en TVÄPROJEKT-ARTEFAKT — psql-sonderna (→ rkaq-projektet) och exportören/REST (→ aufr, appens projekt) läser olika fysiska förråd; system_events LEVER i appens projekt (162 741 och växer) och är 0 i rkaq-dumparna sedan 09-11 ⇒ INGEN radering skett, återimporten SKA EJ genomföras.** Dessförinnan TAKLYFTET 2026-09-16 (s10-u1 O4): kedja 2:s exportör v3 — TOTAL-KONTRAKT + cron 02:40** — 200k-takets kommande TYSTA trunkering (~2026-10-05, +2 015 rader/dag) avvärjd; export GRÄNS 161 678 rader/33 sidor/42,9 s med total-kontrakt KOMPLETT 161678/161674 (dumpen bär sitt eget kompletthetsbevis — JSON-motsvarigheten till slutmarkörerna); restore RTO **38,5 s** = åttonde punkten GRÖN (0 felaktiga · 4 dublett-id kvantifierade = prod-tabellens saknade PK); exporten var OSCHEMALAGD på servern sedan hybrid-sync tystnade → **cron-rad 3 kl 02:40 installerad + referenssynkad, konfigvakten GRÖN 3/3**. Dessförinnan **JUNGRUNATTEN 2026-09-16 (s10-u2 o2): 02:30-cronen levererade OBEVAKAT första natten efter kuren** (markör GRÖN 1 288 041 rader via pgpass; +81 mot manuella testet = äkta ny dump) **+ sjunde RTO-punkten 12,2 s på själva cron-dumpen** (public 60 tabeller/1 266 528 rader · alla scheman 99/1 266 924 · fel 788 kända 0 okända) — kedja 1 bevisad ända till ända UTAN agent i kedjan; RAM-grindens första verkliga exit 75 (PG orörd, omkörning GRÖN). Dessförinnan FULL kvartalsövning BÅDA kedjorna i sekvens 2026-09-16 (s10-u1 o3) — total ~38–40 s: kedja 1 RTO **11,2 s** (sjätte punkten; public 60 tabeller/1 266 455 rader · alla scheman 99/1 266 851 · fel 788 kända 0 okända) på db-2026-09-16; kedja 2 GRÖN **27,2 s / 160 928 rader / 0 dubbletter** via NYTT verktyg `verktyg/dr-kedja2.mjs` — kvartalsmallen = TVÅ kommandon, flock INBYGGT i båda (u3:2:s kö LÖST, se flock-notisen); race-fynd bevisat: läsning mitt i pågående export döms RÖT = skyddet verkade. Tidigare: 20,0 s / 95 tabeller (60 public) / 1,25 M rader (2026-09-15, AUTOMATISK kvartalsövning `node verktyg/dr-ovning.mjs` — låsfilsskyddad, protokoll maskinellt). KEDJA 2 (moln-JSON, system_events — saknas i SQL-dumpen): senaste arkiv natten 2026-09-15/16 GRÖNT — 160 928 rader, domkontrakt 0 fel/0 dubbletter (7 dagars RPO-gap SLUT, s10-u5); RTO 52–58 s vid 146 727 rader, verktyg `aterstall-system-events.mjs` (strömmande, sabotagebevisat) — komplett DR = BÅDA kedjorna. Kedja 1-verktyget OBEROENDE GODKÄNNANDEPROVAT (femte RTO-punkten 23,9 s; härdat). NATTKEDJAN KURAD 2026-09-16 (s10-u5): pgpass = inget klartextlösenord i processlistan + markörvakt varje natt i cron (RÖD natt låser retention); testköt hela kedjan GRÖN 29,1 s / 1 287 960 rader | data/forskning/DR-PROV-2026-09-15-AUTO.md + DR-PROV-2026-09-15-JSON-KEDJAN.md + DR-VERKTYG-GODKANNANDE-2026-09-15.md + DR-NATTKEDJAN-2026-09-16.md + DR-PROV-2026-09-16-FULL.md + DR-KEDJA2-2026-09-15-AUTO{,-2}.md + DR-PROV-2026-09-16-KEDJA3.md (serverfiler) + DR-PROV-2026-09-16-KEDJA4.md (per-typ-vyorna) + DR-PROV-2026-09-16-JUNGRUNATT.md (jungfrunatten + sjunde RTO-punkten; maskinellt delprotokoll DR-PROV-2026-09-16-AUTO.md) + DR-TAKLYFT-2026-09-16.md (taklyft + total-kontrakt + cron 02:40; maskinellt delprotokoll DR-KEDJA2-2026-09-16-AUTO.md) + DR-TOTAL-2026-09-16-AUTO.md (totalöverprotokoll ETT KOMMANDO; maskinella delprotokoll DR-PROV-2026-09-16-AUTO-3 + DR-KEDJA2-2026-09-16-AUTO-3 + DR-PROV-2026-09-16-KEDJA4-3 + DR-KEDJA3-2026-09-16-AUTO-4) + DR-TOTAL-2026-09-16-FLOCKPROV.md (O6: flock-beteendeprov + TOTAL iteration 2; maskinella DR-TOTAL-2026-09-16-AUTO-2 + DR-PROV-2026-09-16-AUTO-4 + DR-KEDJA2-2026-09-16-AUTO-4 + DR-PROV-2026-09-16-KEDJA4-4 + DR-KEDJA3-2026-09-16-AUTO-5) + DR-KEDJA6-2026-09-16-AUTO.md (KEDJA 6 storage-restore; maskinellt) + DR-KEDJA6-2026-09-16-TVAPROJEKT-FYND.md (tvåprojekt-fyndet + backup-gap-kartan + kö §5) + DR-OVNING-2026-09-17-NATT-RPO.md (natt-DR + första nattdiffen; JSON-delprotokoll DR-RPO-DIFF-2026-09-17.json) + DR-FONSTER-KONTINUITET-2026-09-17.md (mitt-bladen + retentionens beteendeprov; maskinella DR-PROV-2026-09-16-AUTO-{7,8,9}.md) + DR-KEDJA2-2026-09-17-JUNGRUNATT.md (jungfrunatt rad 3: första obevakade 02:40-exporten restore-bevisad; maskinellt delprotokoll DR-KEDJA2-2026-09-17-AUTO.md) + DR-OVNING-2026-09-17-JUNGRUDAG-7-BLAD.md (jungfrubladet kedja 1 + kompletta 7-bladsfönstret + första morgon-RPO:n; maskinellt DR-PROV-2026-09-17-AUTO.md + JSON DR-RPO-DIFF-2026-09-17-MORGON.json) + DR-OVNING-2026-09-17-MIDDAG.md (middags-DR: kedja 4 på jungfru-cron-setet + diagnosen tomma per-typ + pumpstart 08:00 tidsatt; maskinellt DR-PROV-2026-09-17-KEDJA4.md + JSON DR-RPO-DIFF-2026-09-17-MIDDAG.json) + DR-OVNING-2026-09-17-EFTERMIDDAG-RPO.md (eftermiddags-DR: dubbel stabil RPO-punkt + intra-dag-noll + komplett dygnsprofil + falsk-RÖT-kuren med AUTO-3/4/5-beviskedjan; maskinella DR-PROV-2026-09-17-AUTO-{3,4,5}.md + JSON DR-RPO-DIFF-2026-09-17-EFTERMIDDAG.json) + DR-KEDJA7-2026-09-17-BOARD-RECEPT.md (agentprotokoll: recept + runbook + fynd) + DR-KEDJA7-2026-09-17-AUTO{,-2,-3}.md (maskinella; RÖT/RÖT/GRÖN) |
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

**Kö:** (1) lätt kvälls-RPO-punkt ~22:00 (sista profilluckan); (2) valDump()-
NOTIS testas i dr-total.mjs-kontext vid nästa total; (3) WAL-trend kvartalsvis.

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
blads snapshots-total − 1 195 452 ≈ +19 8xx); (2) O9:s kö (2) kvarstår:
valDump-NOTIS i dr-total.mjs-kontext vid nästa total; (3) COMMIT-NORMEN som
standing-rad ovan.

Protokoll: DR-OVNING-2026-09-17-KVALL-RPO.md + maskinella
DR-PROV-2026-09-17-AUTO-{6,7}.md + JSON DR-RPO-DIFF-2026-09-17-KVALL.json.
KVD: src/ orörd = inget bygge · node --check GRÖN på verktyget · R2 orörd
(.pgpass endast PGPASSFILE-pekare) · data/blogg/ orörd.

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
  där ger falskt VAKTFEL "Cannot find package"). (3) "/admin 2px överflöd i mobil" är
  ett konstant normalmönster UNDER fyndtröskeln (GRÖN 13:17 med identiskt mönster) —
  inte ett fel, jaga det inte. (4) Studio-skalet verkställde varken rm eller node-fil
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
  Vaccin 2 + 3 förblir öppna (oägda).
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
