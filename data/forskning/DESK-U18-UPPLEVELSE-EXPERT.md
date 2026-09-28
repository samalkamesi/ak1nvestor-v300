# DESK-U18 — UPPLEVELSE+SKYDD-EXPERTEN: UX-lagret + säkerhetsögonen, rad för rad

**Fabrikuppdrag:** v205-u3 (GRANSKARE — befintligt material mot källor, juridik och
kvalitet; rapport + rättingsförslag, skriver ALDRIG i andras filer)
**Datum:** 2026-09-28 ~23:45 UTC · **Agent:** fabriksagent v205-u3
**Lager:** 3 av 3 (upplevelse + skydd). Syskon: U16 (kärna), U17 (nät/klient),
U19 (rådsdomen). Uppdragets kärna: kundens resa landning → ström → chatt,
varje rad granskad, med säkerhetsögon.

---

## 0. KVD — källor och gränser

Lästa i fulltext denna omgång: `/var/www/desk/index.html` (101 rader, mtime
22:01) · `/var/www/desk/hjalp.html` (145 rader, mtime 22:22) ·
`/usr/local/bin/zdesk-browser` (30 r) · `/usr/local/bin/desk-startzoom` (16 r) ·
`verktyg/desk-halsa.mjs` (321 r, commit 5515c7c1 r313) · `/home/ak1a/desk-lakare`
(r315) · `/etc/systemd/system/zdesk-{xvnc,wm,zcode,novnc}.service` ·
`data/forskning/DESK-U13V2-PARITETSSYNTES.md` · `DESK-U14-ROBOTFOKUS.md` ·
`DESK-U15-STROMFARTSMATNING.md` · `DESK-U7-LOGINPERSISTENS.md` ·
`~/desk-login-backup/README.md` + `backup.log` · crontab ·
`/etc/nginx/sites-available/ak1a` (location /desk/) ·
`/home/ak1a/desk-web/vnc.html` (AK1A-knapparna rad 159–196) + `defaults.json`.

**Ägarskap hållit:** ENDAST detta protokoll skrivet. Inga processer
startade/stoppades/omstartades; inga X-inputs skickades (xdotool ENBART fråge-
kommandon: search + getwindowgeometry — U14:s passiva mönster); `.htdesk`
endast `stat`-ad (640 root:www-data, 43 byte — innehåll OLÄST); inga token-,
nyckel- eller arkivinnehåll lästa (inga tar.gz-arkiv existerar ännu, se B2);
`sudo -n` användes en gång som negativ sond (vägrades korrekt). Egna mätningar
betecknas M1–M15 och specificeras i §8.

---

## 1. FYNDLISTA — A (blockerande säkerhet)

### A1 — Port 6080 (websockify/noVNC) exponerad på 0.0.0.0 UTAN autentisering, med Xvnc SecurityTypes None bakom sig

**Vad:** hela kundens inloggade skrivbord är sannolikt nåbart rakt på
`http://5.189.162.162:6080/` (och :6080/websockify), förbi nginx basic-auth.

**Bevis (tripp):**
1. `ss -ltn` (M7): `LISTEN 0.0.0.0:6080` — websockify binder ALLA adresser.
   `zdesk-novnc.service` ExecStart: `websockify --web … --heartbeat 30 6080
   localhost:5910` — inget bind-adressprefix framför 6080.
2. `curl http://127.0.0.1:6080/` (M8) => HTTP 200 + noVNC-landningssida
   (21 529 byte) — ingen auth-fråga på denna port (auth sitter ENDAST i
   nginx `/desk/`-blocket: sites-available/ak1a rad 29).
3. Ingen brandvägg aktiv (M9): `systemctl is-active ufw nftables` = inactive
   ×2; `/etc/nftables.conf` = tomma kedjor (flush ruleset, inga regler);
   `/proc/net/ip_tables_names` tom. (`/etc/ufw/ufw.conf` säger ENABLED=yes men
   tjänsten är inaktiv — motstridighet som gör läget MER osäkert, inte mindre.)
   Bakom bron: `Xvnc :10 … -localhost -SecurityTypes None` (ps, M10 —
   U14 §2 och U15 §0 samma bild) — loopback-bindningen skyddar bara DIREKTA
   VNC-anslutningar; websockify är just den lagliga loopback-klient som
   samtidigt är en oautentiserad port mot världen.
4. Förstärkare: websockify kör som **root** (ps: PID 351439 user root, M10;
   unit-filen har ingen User=-rad — U15 §0 såg samma).

**Konsekvens:** en portskanner får kundens AKTIVA ZCode-session (inloggad med
API-nyckel sedan r309, worklog ROND 309) med full tangentbords-/muskontroll.
Detta dödar förtroendet för hela "ditt skrivbord live"-löftet — säkerhet ÄR
upplevelsens fundament.

**Rättning (ägare: ROOT-ROND — /etc-ägda ytor, ALDRIG fabriksbarn):
(a) `zdesk-novnc.service`: byt `… --heartbeat 30 6080 localhost:5910` →
`… --heartbeat 30 127.0.0.1:6080 localhost:5910` (websockify stödjer
bind-adress:port) + `systemctl daemon-reload && systemctl restart zdesk-novnc`
+ verifiera `ss -ltn` => `127.0.0.1:6080` och https://lab.ak1nvestor.com/desk/
fortfarande 200 med auth. (b) Sekundärt försvarslager: aktivera ufw med
allow 22,80,443 (rubrik: ALDRIG fjärrlåsa SSH). (c) Bevis: från en EXTERN
punkt ska `:6080` därefter vara oåtkomlig — verifieras av huvudsessionen
(kundens telefon på mobildata räcker som sond).

**Ärlighetsrad:** yttre nåbarhet är inte sondad utifrån (fabriksagenten sitter
på servern); beviskedjan 0.0.0.0 + ingen brandvägg + 200 utan auth på porten
gör exponeringen dock sannolik nog för A-grad. Felaktig premiss söks aktivt:
inget filter hittat på tre oberoende sätt (M9).

---

## 2. FYNDLISTA — B (skall rättas; funktion/kvalitet/skydd)

### B1 — hjalp.html:91: scale-epokens "förinställd av oss"-text kvar trots U13V2:s korrigeringskrav

U13V2 §6.2 (rad 232–237) krävde ny text: med `resize=remote` (defaults.json +
båda knapparna, M1+M2: index.html:72 och hjalp.html:137 båda `resize=remote`)
sätter TELEFONEN sin egen storlek — "förinställd av oss" är inte längre sant.
Fakta: hjalp.html rättades 22:22 (mtime; rad 137 = remote) men rad 91 lämnades
orörd i samma redigering: *"Skrivbordets egen storlek är **förinställd av
oss** — vyn anpassar sig automatiskt…"*. Kunden som läser detta föreställer
sig en fast serverstorlek och förstår inte att hennes egen skärm styr —
exakt den missförståelsekällan U12:110–115 flaggade.
**Rättning (ägare: huvudsession, ak1a-ägd fil):** U13V2 §6.2:s formulering
("Skrivbordet anpassar sig automatiskt till din skärm — telefonen får sin egen
storlek utan att du zoomar.") — fortfarande aktuell, klistra rakt av.

### B2 — Login-backup-vakten VILAR: cron aldrig installerad, jungfruarkiv saknas — kundens aktiva inloggning oskyddad

Uppdragets premiss "login-backup-vakten lever" håller bara halvt: VERKTYGET
lever (`~/desk-login-backup/` 700: README.md + spara-login.sh 700 + backup.log
600), men: (1) `backup.log` innehåller ENDA raden `[19:43:24] SKIP: appen ej
inloggad (senaste providerCount=0)`; (2) INGA `zcode-login-*.tar.gz` finns i
katalogen (ls, M5); (3) crontab innehåller ENBAST desk-läkaren (M6) — U7 §4.2:s
cron-rad installerades aldrig. Kunden loggade in via API-nyckel EFTER skipet
(ROND 309, worklog: "KUNDEN LOGGADE IN via API-nyckel-vägen … INLOGGAD OCH
FUNKTIONELL") ⇒ den enda inloggning som FINNS är den enda som ALDRIG
arkiverats. Vid profilförlust (diskfel, felaktig omstart, lakar-restart som
raderar tillstånd) är "inloggad för alltid"-löftet oinsurance.
**Rättning (ägare: huvudsession):** (a) kör `~/desk-login-backup/spara-login.sh`
NU (skriptet detekterar själv inloggat läge; läser+packar endast, stoppar
ingen process — README:s hårda regler följs av skriptet självt), (b) installera
U7 §4.2:s cron-rad, (c) bokför jungfruarkivet + första ÅTERSTÄLLNINGSPROVET
(endast namn, aldrig innehåll) i U7:s RESULTAT-rad.

### B3 — /desk saknar brute-force-skydd: fail2ban har ingen nginx-jail

fail2ban är `active` men `/etc/fail2ban/jail.d/` innehåller ENBAST
`defaults-debian.conf` (sshd-jail; M11). Basic auth mot `.htdesk` kan
password-gissas i obegränsad takt: nginx skriver visserligen misslyckade
auth-rader i error.log, men ingen jail läser dem. Med A1 öppen finns till och
med en auth-FRI omväg, men även med A1 kurad kvarstår gapet på 443.
**Rättning (ägare: root-rond):** aktivera Debains medföljande
`jail.d/nginx-auth.local` (`enabled = true`, filter nginx-auth, ban 1 h) —
logpath /var/log/nginx/error.log. Kombinera gärna med nginx `limit_req` på
location /desk/ (10 r/m, burst 5) som operativt tak.

### B4 — Bevakningsgap i desk-hälsan: auth-trion är PERMANENT SKIP i cron-läget + hjalp.html obevakad

desk-halsa.mjs är i övrigt stark (se §4), men: (1) desk-läkarens cron kör
UTAN `DESK_AUTH` — loggen visar 3 SKIP på varje körning (M4: två senaste
körningarna 6 PASS/0 FAIL/3 SKIP, auth-trion SKIP) ⇒ 200-sökvägen MED auth
(landningens title, vnc.html, ui.js) har ALDRIG bevakats automatiskt; exakt
den yta kunden faktiskt passerar är obelagd. (2) Kontrollen täcker
`/desk/`, `/desk/vnc.html`, `/desk/app/ui.js` — men INTE `/desk/hjalp.html`
(ak1a-skrev 20:43, mtime M3): hjälpsidan kan 404:a (skrivfel i filnamn,
flytt) utan att någon larmas.
**Rättning (ägare: huvudsession + root):** enklast: lägg till en fjärde
http-auth-kontroll för `/desk/hjalp.html` i sviten (ak1a-ägd fil), och låt
root placera `DESK_AUTH` i ett 600-rootfile som lakarens sudo-steg läser —
ELLER kör DESK_AUTH-varianten som separat root-cron en gång/timme.
Lösenordet fortsätter aldrig loggas (svitens kontrakt, desk-halsa.mjs:37–40).

### B5 — Känsliga skärmdumpar i världsläsbart /tmp + tredje skal-konto ("nova")

`ls /tmp` (M12): nio desk-dumpar (desk-login.png 0644, desk-after.png 0664,
desk-auth-test.jpg/png root-ägda 644, desk-now.png, desk-crop.jpg,
desk-pre-test.*, desk-index-fore-u9.html) — flera kan innehålla kundens
chatt/inloggningsvy (U14 §8.1 slår fast att dumpar ALDRIG committas just
därför). `getent passwd` (M12) visar TRE konton med bash: root, ak1a, nova
(uid 103) — /tmp är läsbart för samtliga. U14:s skärmdump `/tmp/u14-skarm.png`
renses dessutom aldrig automatiskt.
**Rättning (ägare: huvudsession):** (a) städ /tmp:s desk-dumpar NU (behåll
ev. bevisdumpar med chmod 600 + tidsstämpel i protokoll), (b) policy i
AGENTS.md-anda: dumpar till `~/desk-dumpar/` (0700) i stället för /tmp,
(c) kontrollrad i desk-läkaren: varna om /tmp innehåller desk-*.png äldre än
24 h. (Nova-kontots roll kan jag inte avgöra passivt — flaggas till
root-rond för avklarning: konto med skal som ingen dokumenterar är en egen
riskpost.)

### B6 — Browser-profilen + tokens exponerade inom ak1a-processrymden (fabriksbarn inbegripna) + Chrome --no-sandbox

`~/.zdesk-browser-profil` är 700 (bra mot andra ANVÄNDARE) men ALLT som kör
som ak1a — inklusive varje agentfabriksbarn och varje npm-postinstall i
arbetsytan — kan läsa z.ai-cookies och sessionstillstånd. Wrappern kör dessutom
`--no-sandbox` (zdesk-browser:21; D4:s medvetna val för Xvnc-stabilitet,
dokumenterat i filhuvudet) vilket tar bort Chromes innersta försvarslager
OM en fientlig sida öppnas i just detta fönster. Ingen indikation på missbruk;
detta är en dokumenterad ARKITEKTURPOST, inte ett aktiva-läge.
**Rättning (ägare: root-rond, evolutionärt — se E8):** dedikerad
systemanvändare åt hela desk-stacken (zdesk-*), profil+tokens därmed åtskild
från arbetsytans processer; kortiktig mitigering: bokför posten i
STYRELSE-REGELVERKETS riskavsnitt så den är ett medvetet val, inte ett glömt.

### B7 — index.html:96 råder den KRÅNGLIGA vägen före den ENKLA knappen (inre inkonsekvens mot hjälpsidan)

Landningens "Viktigt"-ruta: *"…öppna tangentbordet och tryck Ctrl + 0 — då
återställs storleken"* — dvs. öppna noVNC-menyn, hitta tangentbordsikonen,
trycka två tangenter. Men v202 levererade en ETTKLICKS-KNAPP i samma meny:
"Återställ zoom (Ctrl+0)" (vnc.html:159–176, M13) — och hjälpsidan hänvisar
korrekt till just knappen (hjalp.html:108, :133). Samma problem, två råd,
olik svårighetsgrad; landningssidan (kundens FÖRSTA möte) har det sämre rådet.
**Rättning (ägare: huvudsession):** index.html:96: *"Har det blivit fel? Tryck
på menyikonen i noVNC:s kant och sedan knappen Återställ zoom (Ctrl+0) — då
är storleken normal igen."*

---

## 3. FYNDLISTA — C (poleringsgrad)

### C1 — WCAG AA-brister i index.html som hjälpsidan redan rättat

Maskinell kontrastberäkning (M14, WCAG-formeln): index `.litet` #6b7280 på
#0b1120 = **3,89:1** och `.fot` #475569 = **2,48:1** — båda under AA 4,5:1 för
sin storlek (12,5/11,5 px). hjalp.html använder #94a3b8 på samma ställen =
7,34:1 (GRÖN). Index mtime (22:01) är NYARE än hjalp (20:43) men behöll de
svaga färgerna — harmoniseringen missades. Övriga index-kombinationer
mätta GRÖNA: .blurb 7,42 · .steg p 6,83 · knapp 5,17 · .steg-nr 5,74.
**Rättning (ägare: huvudsession):** byt #6b7280→#94a3b8 och #475569→#94a3b8
(i index.html:s `.litet`/`.fot`) — hjälpsidens bevisade värden.

### C2 — index.html saknar fokus-/rörelsevänlighet som hjalp.html har

hjalp har `:focus-visible` (2 ställen), `prefers-reduced-motion` och
`theme-color`; index.html saknar ALLT TRE (jämförelse M15). Tangentbords-
navigeraren (och switch-användaren) får ingen synlig fokusring på landningens
huvudknapp. **Rättning (ägare: huvudsession):** klistra hjalp:s tre regler
(.knapp:focus-visible, @media prefers-reduced-motion, meta theme-color).

### C3 — Fel kant: index steg 3 säger "strecket högst upp" — panelen sitter i VÄNSTER kanten

U9:54–55 (med U2 F7): "menyn från strecket i VÄNSTRA kanten"; hjalp.html:99
samma. index.html:88: "strecket högst upp/knappen i kanten" — den första
halvan är fel, kunden letar i överkanten och finner inget.
**Rättning (ägare: huvudsession):** "Tryck på strecket i skärmens vänsterkant".

### C4 — Stavfel i title + hälsan låst till felstavningen ("ZCode-skivbordet")

index.html:7: `<title>AK1A Lab — ZCode-skivbordet</title>` — saknar "r"
(kundsynligt i fliken/bokmärket). LÖMSK KOPPLING: desk-halsa.mjs:74
`TITEL_MARKE = 'ZCode-skivbordet'` — rättas titeln ensam FAILar kontrollen
http-auth-landning på nästa körning (falsklarm av precis den sorten r313
kurade bort). **Rättning (ägare: huvudsession, SAMORDNAT i EN commit):**
index.html:7 + desk-halsa.mjs:74 (och kommentarsraden :54) tillsammans.

### C5 — Robot-handens kur A är overkställt-till-hälften och OBOOKFÖRD; passivt bevis: rot-läget BESTÅR

Uppdragets premiss: "kur A missade med unik sträng (OLUPT) — geometri-timing
misstänkt". Arkivsanningen (M2, grep i worklog + data/forskning + utdata):
"OLUPT" finns INTE i något protokoll — endast som prompt-citat i zcode:s
sessionsdatabas (20 träffar, samtliga prompt-/todo-text från v205-u1/u3:s
uppdrag; INGEN träff är chatt-text ⇒ strängen nådde aldrig kompositorn —
konsistent med premissen att testet missade). Vidare PASSIVT LÄGESBEVIS
(M10): Xvnc är DEN SAMMA processen sedan 20:58:21 (PID 478952) med current
960x540, och ZCode-fönstret mäts 960x640 NU — U14 §3:s strukturella rot
(100 px översvämd zon, kompositorns hemvist) BESTÅR alltså oförändrad. Med
TigerVNC:s "senast begärda läge består" (U13V2 §2.2) följer: Kur A:s
1024x768-byte är antingen aldrig verkställd på :10, eller verkställd och
manuellt återställd — i BÅDA fallen skedde testklicket (om det skedde) mot
en 540-hög skärm där kompositorn geometriskt OSYNLIG ligger under botten.
**Granskarens dom:** missen förklaras FULLT ut av U14 lager 2b (deterministisk
översvämning); race-/timing-hypotesen (u1:s fund) behövs INTE som förklaring
och är overifierad — den ska inte bokföras som rot förreren bevisad.
**Rättning (ägare: huvudsession):** (a) bokför kur A:s faktiska kommandon +
utfall i ett protokoll (DESK-U14B eller worklog-rad) — just nu är robotens
status muntlig tradition, inte källmaterial; (b) robot-handens KÖRFÖRUTSÄTTNING
skall vara `xrandr current-höjd ≥ 640` (appens minimi-höjd, U14 §3) —
kontrolleras passivt FÖRE varje körning; OBS: ett mobilporträttsbesök med
remote-resize (390x844) uppfyller den AV SIG SIG SIGT — se E6.

---

## 4. desk-halsa.mjs — täcker den U13V2:s krav? (uppdragspunkt 3)

**JA, båda kraven är landade och bevisade:**
1. **Fynd B-kuren (resize-medveten invariant):** xGeometri() jämför numera
   _NET_WORKAREA mot `xrandr --query` current (desk-halsa.mjs:197–212, med
   U13V2-citeringen i kommentaren) — commit 5515c7c1 (r313). Live-bevis:
   senaste lakar-körningen PASS: "workarea == xrandr current == 960x540
   (resize-medveten invariant)" (M4, 23:30 UTC).
2. **resize=remote-kontraktet:** webrotDefaultsJson() FAILar om
   `obj.resize !== 'remote'` (rad 294–296) — live-PASS i samma körning
   ("defaults.json giltig (5 toppnycklar) + resize=remote enligt
   U13V2-kontraktet").

**Självläkande — läget och glappen.** Kedjan har REDAN tre skyddslager:
(a) systemd `Restart=always` på alla fyra enheter (krasch-omstart, sekunder),
(b) desk-läkaren (r315, cron */30: 2 FAIL i följd ⇒ sudo-omstart ENBART av
zdesk-zcode — smalaste ytan; xvnc/wm/novnc rörs aldrig automatiskt eftersom
de bär sessionen; läkning journaförs i desk-halsa.log; state-fil nollställs),
(c) svitens SKIP-arkitektur (dokumenterade tomrum istället för falska FAIL).
**Saknas för grad 2 ("självläkande" på riktigt):**
- **Läknings-DJUP:** lakaren kan bara läka appen. Dör websockify/postfixen av
  OOM hjälper Restart — men "lever men fel" i novnc/nginx upptäcks och
  lämnas. Förslag: lakar-steg 2 med VITLISTAD omstart ÄVEN av zdesk-novnc
  (bär INTE kundens data — endast strömmen; omstart = 5 s återanslutning via
  noVNC reconnect:true som redan är default) — root-rond beslutar.
- **Eskalering:** läknings-raderna skrivs till desk-halsa.log men INTE till
  rot-kön (`data/vakten/rot-kon/`) — upptäckt fel som lakaren inte kan bota
  är osynligt för huvudsessionens rond. En rad `>> data/vakten/rot-kon/…`
  i lakaren täpper till det (ak1a-ägd yta, huvudsessionen äger skriptet).
- **Bevakningsgap B4:** auth-trion + hjalp.html (ovan).
- **Ingen mätning av "kunden är inne":** hälsan mäter kedjans organ, inte
  pulsen — se E4 (evolutionärt, ej saknad kur).

---

## 5. Robot-handen + wrappar + startzoom — konsekvenser och GRÄNS (uppdragspunkt 2)

**zdesk-browser (D4/r302):** korrekt syfte (OAuth-fönster syns i strömmen),
stabil Chrome-källa (puppeteer-cachens senaste, sort -V), LD_LIBRARY_PATH-
mönstret dokumenterat, profil persistent (avsikt: "andra gången räcker
Logga in"). Anmärkningar: `--no-sandbox` (B6); skriptet `echo`-felmeddelandet
vid saknad Chrome är tydligt; DESK_BROWSER_DISPLAY default :10 stämmer med
drift.

**desk-startzoom (r308):** sund design — söker fönstret i 80 s, aktiverar
med --sync, `--clearmodifiers` på båda tangenterna, `-`-prefix i ExecStartPost
(zoom-fel får ALDRIG fälla enheten; zdesk-zcode.service-kommentaren bevisar
att detta är ett MEDVETET kontrakt). Notering C: startzoom körs ENDAST vid
service-start; körs xrandr-byte i drift bibehåller appen sitt zoomLevel
(apptillstånd, inte fönstermått) — ingen åtgärd krävs, men robotens egna
in-drift-zoom-försök EFTER geometribyte saknar startzoomens skyddsnät:
där gäller C5:s körförutsättning (current-höjd ≥ 640 först).

**ROBOT-HANDENS GRÄNS — autentisering (dokumenteras här som stående policy,
efter ROND 308:s KVD-rad och U14:s mönster):**
1. Robot-handen (xdotool) används ENDAST för neutral hjälp: zoom-steg,
   Cancel/Waiting-avbrott, fönsteraktivering, passiva frågekommandon.
2. Roboten får ALDRIG: skriva i, klicka i eller navigera AUTENTISERINGS-ytor
   (z.ai/OAuth-inloggningsfönstret, API-nyckelfält, lösenordsfält,
   "Logga in"-knappar, token-/profilval). Kundens konto förblir kundens —
   inloggningshandlingen är hennes handslag, maskinens är att hålla dörren
   öppen (zdesk-browser + backup-vakten).
3. Undantag kräver STYRELSEBESLUT med kundens explicita medgivande (R2-klass:
   autentisering gränsar till nycklar) — tills dess: NEJ är hela svaret.
4. Bevismönster: varje robotkörning lämnar passiva spår (xdotool-frågor,
   skärmdump före/efter, ASCII-teststräng grep:bart i chatt-db) — kur A:s
   obookförda status (C5) är exakt vad regeln skall förhindra: kör utan
   kvitto.

---

## 6. SÄKERHETSLÄGE — samlad dom (uppdragspunkt 4)

| Yta | Läge | Bevis |
|---|---|---|
| nginx /desk/ auth | **FÖRSVARBART** — basic auth + TLS + .htdesk 640 root:www-data, endast nginx läser | sites-available/ak1a:29, stat (M3) |
| Port 6080 | **GAP A1** — 0.0.0.0, ingen auth, root-process | ss + curl + unit-fil (M7–M10) |
| Brandvägg | **INAKTIV** — ufw inactive (trots ENABLED=yes i conf), nftables tom | M9 |
| Port 3000 (Next) | exponerad *:3000 — appen har egen yta men når förbi nginx; same-klass som A1, lägre känslighet | ss (M7); lämnas till U17:s lager |
| 7681 (ttyd /chat), 5910 (VNC-http) | **BRA** — 127.0.0.1 endast | ss (M7) |
| Xvnc | -localhost + SecurityTypes None — OK ENDAST så länge bron (6080) är stängd | ps (M10) |
| fail2ban | aktiv men ENDAST sshd-jail — /desk obevakat (B3) | M11 |
| Sessionspersistens | APPARAKIV SAKNAS (B2); verktyg+perms korrekta (700/600) | M5–M6 |
| Browser-profil | 700 mot andra användare; exponerad mot ak1a-processrymden + --no-sandbox (B6) | stat (M3) |
| /tmp-dumpar | 0644/0664, känsligt innehåll möjligt, 3 skal-konton (B5) | M12 |
| sudo-yta | fabriksagent NEKAS korrekt (sudo -n vägrar); lakarens sudoers-vitlista = EN enhets-omstart | M3 |
| Hemligheter i sviten | hälsan gissar/hårdkodar/läser aldrig .htdesk; DESK_AUTH loggas aldrig | desk-halsa.mjs:37–40 |

**Säkerhetsläge totaldom: GAP — A1 (6080) måste stängas innan något annat
räknas; därefter försvarbart med kända B-poster (B2, B3, B5, B6).**

---

## 7. KUNDRESANS SISTA GLAPP → EVOLUTIONÄRA STEG (uppdragspunkt 5, rankade)

Resan landning → ström → chatt är REDAN ovanligt vårdad: landning med fyra
steg-kort i plain svenska, hjälp med sex avsnitt + varningskort, noVNC-panel
med tre AK1A-knappar på svenska (Återställ zoom/Förstora/Förminska, M13),
reconnect:true, Ctrl+0-knapp, dokumentsvenska konsekvent (utom C3/C4:s
detaljer). Det som återstår för "exceptionell":

1. **E1 (säkerhet=känsla): stäng A1** — kunden ska kunna lita på att länken
   mellan henne och skrivbordet är privat. Bevis: ss visar 127.0.0.1:6080 +
   extern sond död. Ägare: root-rond. (Även E1b: ufw 22/80/443.)
2. **E2 (felmeddelanden som omsorg):** kundens felväg idag slutar i nginx
   engelska standardsidor (401 "Authorization Required", 502) och noVNC:s
   tekniska reconnect-texter. Bygg svensk 401-sida ("Fel lösenord — försök
   igen med det du fick") + svensk overlay-text vid avbrott i vnc.html
   ("Tappade kontakten — försöker komma tillbaka…"). Ägare: 401-sidan
   root-rond (nginx error_page till /var/www/desk/401.html), overlay:
   desk-web (fabrik-yta, samordna med U17).
3. **E3 (inloggad-för-alltid-försäkringen):** B2:s tre steg (arkiv nu + cron
   + återställningsprov). Bevis: första `zcode-login-*.tar.gz` + loggrad OK.
   Ägare: huvudsession.
4. **E4 (ankomst-kvitto):** landningen talar OM att sessionen lever men
   VISAR den inte. En liten "puls"-indikator (grön prick = kedjan mätt
   nyss; desk-läkarens senaste RESULTAT kan exponeras statiskt, ingen
   hemlighet) gör löftet kontrollerbart på 1 sekund. Ägare: huvudsession
   + desk-web (fabrik-yta). OBS: ingen ny datainsamling (GDPR-art 13 orörd).
5. **E5 (självläkande grad 2):** §4:s fyra glapp — lakar-eskalering till
   rot-kön, ev. novnc i vitlistan, DESK_AUTH-rootkörning, hjalp.html i
   sviten (B4). Bevis: nästa FAIL producerar rot-kö-rad. Ägare: huvudsession
   (desk-läkare + svit) + root (DESK_AUTH).
6. **E6 (robot-handens arbetsfönster):** definiera körförutsättningen
   current-höjd ≥ 640 (C5) + bokföringskrav per körning. Notera synergien:
   ett telefon-besök i porträtt (390x844 via remote) uppfyller kravet av
   sig självt — robotens och kundens bästa geometri är DEN SAMMA. Ägare:
   huvudsession (policy + protokoll).
7. **E7 (WCAG-harmonisering + vakt-täckning):** C1+C2-kurerna; utöka
   gränssnittsvakten att även mäta /desk-sidorna (de är nginx-statik utanför
   Next:3000 — vakten mäter dem inte idag; kontrast-bristerna i index är
   beviset på glappet). Ägare: fabrik (vakten) + huvudsession (index).
8. **E8 (least privilege, arkitekturellt):** dedikerad användare åt
   zdesk-stacken (B6) + i förlängningen profilkryptering. Ägare: root-rond,
   styrelse-beslut (R2-nära: röra drift-arkitektur).

---

## 8. Källförteckning (källtripp per påstående — egna mätningar M1–M15, alla 2026-09-28 ~22:4x–23:4x UTC)

- M1 = Read /var/www/desk/index.html + hjalp.html (mtimes 22:01/22:22 via ls).
- M2 = grep "OLUPT" i worklog.md, data/forskning/, utdata/ (0 träff) +
  db.sqlite (20 träffar; kontext-extraktion: samtliga prompt-citat) +
  ls data/forskning/DESK-U1* (varken U14B eller kur A-protokoll finns).
- M3 = stat .htdesk (640 root:www-data), ls ~/desk-login-backup,
  stat ~/.zdesk-browser-profil (700), sudo -n (vägrad), nginx:29 cat.
- M4 = tail desk-halsa.log + cat desk-halsa-state (två körningar 6/6 PASS,
  3 SKIP auth; state=0).
- M5 = cat backup.log (endast SKIP-raden) + ls (inga tar.gz).
- M6 = crontab -l (endast desk-läkare).
- M7 = ss -ltn (0.0.0.0:6080, *:3000, 127.0.0.1:7681/5910).
- M8 = curl 127.0.0.1:6080 (200 + noVNC-sida, 21 529 byte).
- M9 = systemctl is-active ufw/nftables (inactive), /etc/nftables.conf (tom),
  /proc/net/ip_tables_names (tom), /etc/ufw/ufw.conf (ENABLED=yes).
- M10 = ps Xvnc+websockify (478952 ak1a 20:58:21; 351439 root) ·
  xrandr --query (960x540 59,63*) · xdotool search+getwindowgeometry
  (0x400003 = 960x640+0+0) — frågekommandon, inga inputs.
- M11 = systemctl is-active fail2ban (active) + ls jail.d (endast
  defaults-debian.conf).
- M12 = ls -la /tmp (nio desk-dumpar 0644/0664) + getent passwd (tre
  skal-konton: root, ak1a, nova).
- M13 = sed vnc.html:155–200 (knappar "Återställ zoom (Ctrl+0)",
  "Förstora (+)", "Förminska (−)") + cat defaults.json
  (resize remote, quality 3, show_dot, reconnect, compress 2).
- M14 = node-beräkning WCAG-kontraster (formel 1.4.6; värden i C1).
- M15 = diff-ad jämförelse index↔hjalp CSS-attribut (focus-visible,
  reduced-motion, theme-color).

**Protokoll-källor:** U13V2 (§1.2 fynd A, §1.4 fynd B, §4.7, §6.1–6.3) ·
U14 (§2 fokus-läge, §3 översvämning, §5 teckenleverans, §8 bevisgränser,
§9 kur A) · U15 (§0 flödeskedja + websockify root) · U7 (§4–6 + RESULTAT
"inloggad-läge nej") · U9 (rad 54–58 panel/knapp) · worklog ROND 306–311
(robot-handens gräns, API-nyckel-inloggning) · U13V2 M8 (vnc.html-knappar) ·
git 5515c7c1 (r313-kommit).

**Ärlighetsrad:** påståenden om kundens upplevelse efter nästa besök är
PROGNOS; OLUPT-kur A:s exakta kommandon är inte återvinningsbara i arkivet
(C5 dokumenterar själva avsaknaden som fynd); "nova"-kontot kunde inte
avklaras passivt; yttre portnåbarhet sondades inte utifrån (A1:s ärlighetsrad).

---

## 9. Juridik

Ren UX/infrastruktur-granskning: inget finansiellt innehåll, inga råd
(2007:528 oberörd). Priser/tier/publicering: orörda (R2). Kakor/GDPR: E4:s
puls-indikator är designad UTAN ny datainsamling (statisk läsning av lakarens
egna logg); noVNC-inställningar persist-as endast i besökarens localStorage
(U13V2 §7). Skärmdumpar med ev. chatt-innehåll hanteras enligt B5 — aldrig
committas (U14 §8.1:s precedens).

RESULTAT: 13 fynd (A:1 B:7 C:5) + 8 evolutionära steg rankade + säkerhetsläge GAP: port 6080 exponerad utan auth (A1 — stängs i root-rond), därefter försvarbart med kända B-poster (B2 login-arkiv, B3 fail2ban, B5 /tmp, B6 profil)
