# DESK-U28 — LANDSKAPSKEDJAN: hälsan ser direktentréns ryggrad; kraschloopen stoppad; landningens nyp-rad sann

**Fabrikuppdrag:** auto-s11-1790794523042 s11-u3 (BYGGARE, spår 11 DESK A-Ö)
· **Datum:** 2026-09-30 19:00–19:45 UTC · **Ägarskap:** verktyg/desk-halsa.mjs
(additiva -land-tillägg OVANPÅ u1:s U27-version på disk — aldrig mot den) +
/var/www/desk/index.html (:106, utanför git — hash-kvitton nedan) + detta
protokoll + worklog-rad + anspråksfil (u3, 19:11 + uppdatering 19:15).

**Syskenkoordination (omgångens trippelkollision, löst utan duplikat):**
u1 = DESK-U27 (hälsans direktentré-kontrakt, klart på disk 19:08–19:14) ·
u2 = DESK-U26 (nyp→vy-zoom i app/ui.js — live i serverad kod 19:12,Verifierat:
init-koppling rad 158 + handlers 2030-2036 via BÅDA brockarna 6080/6081) ·
u3 (jag) = DETTA protokoll U28. Jag RÖRDE EJ ui.js/hjalp.html/vnc.html
(u2:s yta) trots egen färdig design — raderna "AK1A (DESK-U26)" i ui.js
+ u2:s anspråk 19:06 (mitt 19:11) avgjorde saken; lost-update-klassen
(U23-efterordet) undveken mekaniskt.

---

## 1. FYND A — hälsan var blind mot landskapskedjan (direktentréns ryggrad)

**Fynd:** EN-TRYCKS-direktentrén (R349/R350-eran, nginx mtime 2026-09-30
05:33:44) pekar /desk/ → /desk/h/vnc.html = LANDSKAPSSKRIVBORDET :11 via
websockify 6081 — men desk-halsa:s systemd-kontroll bevakade ENDAST
porträttets fyra enheter. Landskapets tre basenheter (zdesk-xvnc-land,
zdesk-wm-land, zdesk-novnc-land) kunde dö totalt utan att hälsan såg det,
medan kundens EN-TRYCKS-ingång (kontroll 1:s eget 302-mål!) strömmade svart.

**Kur (verkställd, additivt ovanpå u1:s U27-version):**
- `ENHETER` 4 → 7: + zdesk-xvnc-land, zdesk-wm-land, zdesk-novnc-land
  (ALLTID-PÅ-kontraktet ur zdesk-vaxlare.service:s egna kommentar: "xvnc/wm/
  novnc på båda skärmarna lever alltid").
- PASS-raden dynamisk ("${ENHETER.length} enheter active") — aldrig härdkodad
  epok-siffra igen (r311-lärdomen).
- **MEDVETET EJ bevakat:** APP-enheten zdesk-zcode-land — den startas/stoppas
  av växlaren per ingång och är avstängd per design (enheten t.o.m.
  `disabled`). Sviten härdkodar aldrig epokens app-policy. DETTA BESLUT
  BEVISADE SIG INOM TIMMEN: se fynd B — appen kraschloopade och stoppades;
  sviten förblev 8/8 GRÖN genom hela händelsen (korrekt: basryggraden lev,
  app-läget är växlarens/root-rondens bord).

## 2. FYND B — landskapsappens kraschkedja: död 7,5 h, kraschloop vid återstart, stoppad

**Kedja (alla tider UTC, journal + systemctl):**
1. zdesk-zcode-land startad 03:50 av R349/R350-vågen, lev 7 h 56 min, dog
   **11:46:40 med SIGBUS (Result: core-dump)** — ExecStartPost
   desk-startzoom-land status=1 hela vägen (se fynd C).
2. Därmed: EN-TRYCKS-ingångens mål = TOM landskapsström i ~7,5 h
   (xvnc/wm/novnc-land levde; appen saknades). Ingen vakt såg det — växlaren
   (den som borde starta appar per ingång) var DÖD sedan 29/9 14:55 (sista
   loggrad ~/desk-vaxlare.log; enhet inactive/dead trots Restart=always =
   av någon stoppad, aldrig återstartad).
3. Min återstart 19:12 via den SUDO-VITLISTADE vägen (sudo -n /usr/bin/
   systemctl start zdesk-zcode-land.service — explicit nopasswd-rad):
   appen aktiverade men **KRASCHLOOPADE** — NRestarts 8 på ~8 min
   (~75 s-cykel: electron init → "runtime process env prepared" → tyst död
   med manager-dispose-rensning; ENDAST ett 10x10-hjälparfönster 0x600001
   "zcode" mappades på :11, inget huvudfönster; dödsfallen bär SIGTERM-
   klass, inte SIGBUS). Huvudfönstret uteblev alla cykler.
4. **Beslut 19:2x: STOPPAD** (samma vitlista) — ett ~75-sekunders
   kraschloopande Electron-barn (~1,2 GB minnestopp per cykel, journal-
   spam "FAILED SU" per start) på kundens live-server värmer mer än det
   gör nytta; enheten är `disabled` (ingen boot-återkomst) och den designade
   startkanalen är växlaren. Porträttappens ström (zdesk-zcode, kundens
   verkliga session) opåverkad hela tiden — verifierad active före/efter.

**Öppen rot-analys (ärligt obesvarat):** varje instans dog ~60 s efter
"runtime env prepared". Hypotes: lås/kollision på DELAD ~/.zcode-rymd med
samtidigt levande porträttapp (två Electron-instanser, egna user-data-dir
men gemensam ~/.zcode enligt R323-kommentaren "auth delad" — växlar-
kommentaren SÄGER själv "appens eget lås på delad ~/.zcode-nivå ⇒ EN
instans i taget"). MOTBEVIS-NOT: morgoninstansen levde 8 h SAMTIDIGT med
porträttappen — samexistens är alltså INTE omöjligt per se; skillnaden
mellan morgonen och kvällen (appens interna tillstånd? crash-dir? DB-lås?)
kräver root-rondens journal- och core-dumpgrävning — bokas, gissas ej.

## 3. FYND C — ExecStartPost su-buggen: startzoom-land körs ALDRIG

**Fynd (journal, varje instansstart):** `ExecStartPost=/bin/su -s /bin/bash
ak1a -c /usr/local/bin/desk-startzoom-land` → pam_unix "auth could not
identify password for [ak1a]" + "FAILED SU" → status=1/FAILURE. Enheten
kör REDAN som User=ak1a — su-steget frågar efter lösenord som systemd-inte
kan ge. Skriptet i sig är oskyldigt (söker fönster i 80 s, ctrl+0 ifall
funnet, exit 0 annars); felet är enhetens su-inkapsling. Jämförelse:
porträttets startzoom har samma mönster men dess ExecStartPost är
feltolerant och porträttfönstret finns (kontroll 4 bevisar maximeringen).
**Bokas till rot-kön** (/etc/systemd/system — stryk su-lagret, kör skriptet
direkt): utan kur får landskapet aldrig sin zoom-nollställning ens när
appen en dag lever.

## 4. FYND D — landningens nyp-rad motsade verkligheten (sann text levererad)

**Fynd:** /var/www/desk/index.html:106 varnade "Nypa med två fingrar zoomar
appens text (inte vyn)" — men u2:s GAP 1+2-kur (DESK-U26) är LIVE i
serverad ui.js sedan 19:12 (_capture-intercept: nyp → vy-zoom, verifierad
via curl på BÅDA webbrockarna 6080 + 6081). Dokumentation som motsäger
produkten är sin egen felklass (U17 A1:s släktskap: texten rätt, sanningen
fel). Landningens hem är sedan 05:33 /desk/start men FILen är densamma
(hälsans kontroll 7 läser den på disk — title-marker och taggintegritet
bevarade av hälsokörringen efter ändringen).

**Kur (verkställd):** nya raden — "<b>Tips:</b> Nypa med två fingrar
förstorar och förminskar <b>hela vyn</b> — som i en kartapp. Föredrar du
knappar? Använd <b>Förstora (+)</b> i menyn (strecket i vänsterkanten)."
Kort, telefon-först, ingen jargon, inget löfte om app-text-zoom (Ctrl+0-
knappen finns kvar i appmenyn för det sällsynta fallet via extra-tangenter
+ tvåfingersscroll). Texten är implementations-agnostisk: den beskriver
BETEENDET (GAP 1+2-kurens kärna), inte kodfilerna.

## 5. Bevis — FÖRE/EFTER (egna mätningar, UTC)

| Bevis | FÖRE (19:0x) | EFTER (19:18–19:4x) |
|---|---|---|
| desk-halsa | 7/8 PASS — FAIL http-landning-401 "fick 302" (gamla kontraktet; u1:s fynd, min FÖRE-körning 19:06) | **8/8 PASS · 4 auth-SKIP** (u1:s http-desk-entree + mina 7 enheter) — ÄVEN efter fynd B:s stopp (rätt: app-policy ≠ basryggrad) |
| systemd-kontroll | 4 enheter (porträttet) | **7 enheter active** (+ xvnc-land, wm-land, novnc-land) |
| zdesk-zcode-land | failed (core-dump sedan 11:46), start-limit | startad 19:12 → kraschloop NRestarts 8 → **stoppad 19:2x** (vitlistad sudo), porträttapp active före/som/efter |
| _NET_CLIENT_LIST :11 | (levereras av fynd B: tomt utöver 10x10-hjälparfönstret) | tomt — landskapet väntar på rot-rondens app-lösning (rot-kö R12) |
| curl /desk/ utan auth | 302 → /desk/h/vnc.html?autoconnect=true&resize=scale&show_dot=true | d:o (oförändrat — kontraktet u1 byggde kontrollen på) |
| curl /desk/start · /desk/h/vnc.html · /desk/hjalp.html utan auth | 401 · 401 · 401 | 401 · 401 · 401 (bommar hela) |
| curl 6080/vnc.html · 6081/vnc.html (lokala broar) | 200 · 200 | 200 · 200 (u2:s ui.js serverad via BÅDA: addPinchZoomHandlers 2 träffar per bro) |
| index.html :106 | "Viktigt: Nypa … zoomar appens text" (falskt sedan 19:12) | "Tips: Nypa … förstorar hela vyn" (sant) |
| sha256 index.html | 46b1edadeb4e…d99e745b2 | edec961e0fcb…190d064cae |
| sha256 desk-halsa.mjs | 5b5b971aee1f…ece48d0b1f1 (u1:s U27-version) | 28233ea52209…6d79d0fab3 (U27+U28) |
| node --check desk-halsa.mjs | OK | **OK** |

## 6. ROT-KÖN (nya poster — /etc och appdesign är root-rondens/huvudsessionens yta)

| # | Förslag | Källa |
|---|---|---|
| R12 | EN-TRYCKS-målet: 302 pekar på LANDSKAP :11 vars app inte kan leva samtidigt som porträttappen (kraschloop, fynd B) — välj: (a) peka 302 mot PORTRÄTTET /desk/vnc.html (bevisat friskt, kundens session bor där), (b) rot-analysera låskollisionen + core-dumpar och återskapa landskapsappen stabil, (c) väck liv i växlaren som DESIGNED startar appar per ingång — INGEN av vägarna är fabrikens att välja | Fynd B · vaxlar-designen |
| R13 | zdesk-zcode-land.service ExecStartPost: stryk su-inkapslingen (enheten kör redan som ak1a) — startzoom-land har aldrig körts en enda gång | Fynd C |
| R14 | zdesk-vaxlare.service: inactive/dead sedan 29/9 14:55 (Restart=always ⇒ medveten stopp, aldrig återstartad) + dess logg visar "byte -> portratt: startad" VAR 10:E MINUT 14:00–14:55 (något stoppade porträttappen upprepade — separat grävning) | Fynd B:2 |

## 7. KVD

- **Kod:** verktyg/desk-halsa.mjs — node --check OK; sviten utökad 4→7
  enheter (ALDRIG nivåsänkt; alla tidigare PASS opåverkade; 8/8 före som
  efter FYND B:s app-stopp = bevisat rätt bevakningsdjup); src/ orörd;
  tsc-grinden körs vid commit (mekaniskt, baslinje 0).
- **Ingripande i drift:** EXAKT två sudo-kommandon, BÅDA ur den explicita
  vitlistan (start + stop av zdesk-zcode-land) — enhetens egen avsedda
  kanal; porträttsessionen (kundens) orörd och verifierad levande före/
  under/efter; inga omstarter av nginx/pm2/övriga enheter.
- **R2:** priser/tier/publicering orörda; data/blogg orörd; inget
  finansiellt innehåll; GDPR: sviten/protokollet samlar ingenting nytt.
- **Ytor:** /etc + /usr LÄSTA aldrig rörda (rot-kön bär förslagen);
  core/vendor/mandatory/defaults orörda; ui.js/hjalp.html/vnc.html lämnade
  åt u2 (deras pågående U26); DESK_AUTH aldrig satt/läst/gissat;
  zcode-dedikerad-vhostens nyckelinnehåll citeras ALDRIG (läst i förbifarten
  under nginx-utredningen — protokollet bär den inte).

## 8. Källförteckning

- K1 = DESK-U19-RADSDOM.md steg 6 (bevakningsluckorna) + r311-lärdomen
  (sviten härdkodar aldrig epokens policy — applicerad på app-enheten).
- K2 = DESK-U24-HJALPBEVAKNING.md (svitens utökningsmönster: additivt,
  aldrig nivåsänkande, dokumenterat SKIP-läge) + U24-BERORNINGSGAP §6
  (GAP 1+2-rekommendationen — u2:s leverans, min textkur bygger på den).
- K3 = zdesk-vaxlare.service + zdesk-zcode-land.service (lästa): ALLTID-PÅ-
  kontraktet, EN-instans-kommentaren, su-ExecStartPost.
- K4 = journalctl/systemctl-show (NRestarts 8, pam_unix FAILED SU,
  core-dump 11:46:40) + xwininfo -tree :11 (0x600001 "zcode" 10x10).
- K5 = u1:s anspråk + worklog-rad (U27-avräckningen, koordinationen);
  u2:s anspråk (U26-ytorna).
- M1–M10 = bevis-tabellen §5 + anspråksfilens tidsstämplar.

## RESULTAT

Hälsan ser nu HELA direktentréns ryggrad: 7 Always-On-enheter (porträtt +
landskap) istället för 4, dynamisk rapportering, 8/8 PASS bevisat STABILT
genom en pågående app-kraschkedja (rätt abortdjup: basenheter bevakas,
app-policy lämnas åt sin ägare). Landskapsappens 7,5-timmars-död upptäckt,
återstartad (vitlistat), dess kraschloop diagnosticerad och stoppad inom
8 min — kundens porträttsession orörd genom hela händelsen. Tre rot-kö-
poster (R12 entré-målets design, R13 su-buggen, R14 växlar-döden) med
fulla beviskedjor. Landningens nyp-rad talar sanning med u2:s live-kur.
Kraschloopens rot är ÄRLIGT öppen (samexistens-motbeviset noterat) — den
gissas inte, den bokas.
