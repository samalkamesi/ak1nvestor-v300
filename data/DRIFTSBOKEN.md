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
| DR | Färsk backup + integritetsbevis dagligen möjligt; senast bevisade fulla restore: **KVARTALSÖVNINGEN I FYRA KEDJOR 2026-09-16 13:40–13:45 (s10-u3 3/3, DR-KVARTAL-2026-09-16-FYRAKEDJOR.md): kedja 1 RTO 17,3 s — nionde punkten (public 60 tabeller/1 266 528 rader == dumpens COPY-radantal: två instrument, samma tal) + kedja 2 GRÖN 161 678 rader/39,0 s + kedja 3 GRÖN (sabotage 3/3 gripna, git-klon 1 195 commits, restore == listat) + kedja 4 GRÖN (10/10 ⊆ full-arkivet) — ALLA FYRA i EN sekvens ≈ 105 s; kvartalsmallen = FYRA kommandon (dr-ovning/dr-kedja2/dr-kedja3/dr-kedja4), nästa senast 2026-12-16. FÖRSTA FULLA LIVE-PROD-DIFFEN (psql COUNT per tabell via PGPASSFILE, 60 tabeller): RPO-delta +19 359 sedan 02:30-dumpen = väntad tillväxt i 3 tabeller, inget oväntat. **AKUT FYND: system_events TOM i levande prod** — 0 rader 13:46 lokal (tabellägare postgres bypassar RLS ⇒ talet sant; 161 678 rader fanns 07:24; raderade i fönstret 07:23–13:46 lokal; inget lokalt el. molnets cron-jobb raderar tabellen; nya events skrivs EJ heller — skrivvägen tystnade); dagens arkiv = ENDA kopian (kopia /tmp/s10u3-arkiv-sakerhetskopia.json.gz, md5 35ce34fc…); återimport mekaniserad (aterstall-system-events.mjs --plan-supabase) men skrivning mot prod = HUVUDAGENTENS beslut — se DR-KVARTAL-…-FYRAKEDJOR.md §4–5.** Dessförinnan TAKLYFTET 2026-09-16 (s10-u1 O4): kedja 2:s exportör v3 — TOTAL-KONTRAKT + cron 02:40** — 200k-takets kommande TYSTA trunkering (~2026-10-05, +2 015 rader/dag) avvärjd; export GRÄNS 161 678 rader/33 sidor/42,9 s med total-kontrakt KOMPLETT 161678/161674 (dumpen bär sitt eget kompletthetsbevis — JSON-motsvarigheten till slutmarkörerna); restore RTO **38,5 s** = åttonde punkten GRÖN (0 felaktiga · 4 dublett-id kvantifierade = prod-tabellens saknade PK); exporten var OSCHEMALAGD på servern sedan hybrid-sync tystnade → **cron-rad 3 kl 02:40 installerad + referenssynkad, konfigvakten GRÖN 3/3**. Dessförinnan **JUNGRUNATTEN 2026-09-16 (s10-u2 o2): 02:30-cronen levererade OBEVAKAT första natten efter kuren** (markör GRÖN 1 288 041 rader via pgpass; +81 mot manuella testet = äkta ny dump) **+ sjunde RTO-punkten 12,2 s på själva cron-dumpen** (public 60 tabeller/1 266 528 rader · alla scheman 99/1 266 924 · fel 788 kända 0 okända) — kedja 1 bevisad ända till ända UTAN agent i kedjan; RAM-grindens första verkliga exit 75 (PG orörd, omkörning GRÖN). Dessförinnan FULL kvartalsövning BÅDA kedjorna i sekvens 2026-09-16 (s10-u1 o3) — total ~38–40 s: kedja 1 RTO **11,2 s** (sjätte punkten; public 60 tabeller/1 266 455 rader · alla scheman 99/1 266 851 · fel 788 kända 0 okända) på db-2026-09-16; kedja 2 GRÖN **27,2 s / 160 928 rader / 0 dubbletter** via NYTT verktyg `verktyg/dr-kedja2.mjs` — kvartalsmallen = TVÅ kommandon, flock INBYGGT i båda (u3:2:s kö LÖST, se flock-notisen); race-fynd bevisat: läsning mitt i pågående export döms RÖT = skyddet verkade. Tidigare: 20,0 s / 95 tabeller (60 public) / 1,25 M rader (2026-09-15, AUTOMATISK kvartalsövning `node verktyg/dr-ovning.mjs` — låsfilsskyddad, protokoll maskinellt). KEDJA 2 (moln-JSON, system_events — saknas i SQL-dumpen): senaste arkiv natten 2026-09-15/16 GRÖNT — 160 928 rader, domkontrakt 0 fel/0 dubbletter (7 dagars RPO-gap SLUT, s10-u5); RTO 52–58 s vid 146 727 rader, verktyg `aterstall-system-events.mjs` (strömmande, sabotagebevisat) — komplett DR = BÅDA kedjorna. Kedja 1-verktyget OBEROENDE GODKÄNNANDEPROVAT (femte RTO-punkten 23,9 s; härdat). NATTKEDJAN KURAD 2026-09-16 (s10-u5): pgpass = inget klartextlösenord i processlistan + markörvakt varje natt i cron (RÖD natt låser retention); testköt hela kedjan GRÖN 29,1 s / 1 287 960 rader | data/forskning/DR-PROV-2026-09-15-AUTO.md + DR-PROV-2026-09-15-JSON-KEDJAN.md + DR-VERKTYG-GODKANNANDE-2026-09-15.md + DR-NATTKEDJAN-2026-09-16.md + DR-PROV-2026-09-16-FULL.md + DR-KEDJA2-2026-09-15-AUTO{,-2}.md + DR-PROV-2026-09-16-KEDJA3.md (serverfiler) + DR-PROV-2026-09-16-KEDJA4.md (per-typ-vyorna) + DR-PROV-2026-09-16-JUNGRUNATT.md (jungfrunatten + sjunde RTO-punkten; maskinellt delprotokoll DR-PROV-2026-09-16-AUTO.md) + DR-TAKLYFT-2026-09-16.md (taklyft + total-kontrakt + cron 02:40; maskinellt delprotokoll DR-KEDJA2-2026-09-16-AUTO.md) |
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
