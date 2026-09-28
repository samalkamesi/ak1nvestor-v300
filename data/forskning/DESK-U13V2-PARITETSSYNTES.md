# DESK-U13V2 — Paritetssyntes: styrelsens SLUTGILTIGA dom

**Fabrikuppdrag:** v204-u3 (GRANSKARE — granskar befintligt material mot källor och
kvalitet; levererar rapport + diff-förslag som nya filer) · **Datum:** 2026-09-28 22:13 UTC
**Ersätter:** DESK-U13-PARITETSSYNTES.md v1 (provisionell — båda källprotokollen
saknades vid det läsningstillfället, v1 §0). Denna v2 är kedjans slutdom i
paritetsfrågan: huvudvägen är verkställd på disk, granskningen hittar **två
korrigeringskrav** och definierar bevisgrinden för remote-resize.

---

## 0. KVD — källprotokollen finns (v1:s lucka är sluten)

| Källa | Läge kl. 22:00 UTC 2026-09-28 | Omfattning | Commit |
|---|---|---|---|
| DESK-U11-APPRESPONSIVITET.md | FINNS, läst i fulltext | 213 rader; RESULTAT rad 213 | 66b0b45d (v203-u1) |
| DESK-U12-TELEFONPARITET.md | FINNS, läst i fulltext | 278 rader; RESULTAT rad 278 | ba348371 (v203-u2) |
| DESK-U13-PARITETSSYNTES.md (v1) | FINNS, läst i fulltext | 266 rader; RESULTAT rad 266 | c785d493 (v203-u3) |

Kravet "alla tre källprotokoll citerade med radreferenser" är uppfyllt — citat
nedan anger `protokoll:radnummer`. Egna mätningar denna omgång betecknas
M1–M10 och specificeras i §8.

---

## 1. Verkställandeläget på disk — granskarens mätningar

### 1.1 Bekräftat verkställt (källtripp M1+M2)

- `/home/ak1a/desk-web/defaults.json` innehåller nu `"resize": "remote"` och
  `"quality": 3`; filen ändrad **22:01:25 UTC** (M1: Read + stat). U12:30-34
  dokumenterade vid kollegans läsning (~21:2x) `"resize": "scale"` och
  `"quality": 2` — sessionen bytte alltså vid 22:01, i linje med uppdragets
  premiss om verkställande.
- `DISPLAY=:10 xrandr --query` svarar: RANDR aktiv, `VNC-0 connected`,
  current **960x540 (59.63\*)** med modolista 640x480–1920x1200 (M2) —
  bekräftar U12:51-54 och viloläget 960x540.

### 1.2 GRANSKARFYND A — "landningens knapp" är INTE verkställd på disk

Uppdragets premiss säger att sessionen verkställt "resize=remote i
defaults.json **+ landningens knapp**". Diskens bevis håller bara första
halvan:

- **hjalp.html:137** (sidans ENDA vnc.html-länk, M5+M8):
  `href="vnc.html?autoconnect=true&resize=scale&show_dot=true"` — alltså
  **scale**, inte remote. Filens mtime är **20:43:53** — före
  defaults-bytet 22:01:25 (M1+M5): knappen rördes inte i verkställandet.
- **Query-parametern vinner över defaults.json**, rad för rad belagt i den
  ak1a-ägda noVNC-kopian: `initSetting` (ui.js:771-789) låter defaults.json
  endast ersätta det hårdkodade defaultvärdet, varefter
  `WebUtil.getConfigVar(name)` — hash först, sedan query
  (webutil.js:61-70) — går före `readSetting` (localStorage före default,
  webutil.js:153-171); `mandatory.json` är tom `{}` och tvingar ingenting
  (M6). Slutlig inställningsordning: **mandatory → hash/query →
  localStorage → defaults.json → hårdkodat** (ui.js:194-196 sätter
  'off'/'6'/'2' som hårdkodade utgångspunkter, M7).
- **Konsekvens:** varje entré via hjälpsidans stora knapp ("Öppna
  ZCode-skrivbordet igen") ger kunden scale-läge och kringgår därmed
  remote-verkställandet. Ingen alternativ "landningsknapp" finns hittad:
  sajtkoden länkar inte till /desk alls (M9: grep i src/ → endast
  falskträffen "desktop" i manifest.ts:5), vnc.html saknar hjälplänk (M8),
  desk-web har ingen index.html (M8: ls) — ingången är direkt-URL/bokmärke
  eller just denna knapp.
- **Dom:** inte "KLART" förrän rad 137 är rättad (diff-förslag §6.1). Tills
  dess gäller: direktbesök till vnc.html utan parametrar får remote (nya
  besökare utan localStorage), knappbesök får scale, och återkommande
  besökare som en gång rört rullgardinen låses av localStorage
  (webutil.js:159).

### 1.3 Delta-observationer (ärlighetsrad)

- defaults.json-nyckeln **`"compress": 2`** matchar inte `initSetting
  ('compression', 2)` (ui.js:196) — nyckeln är död, men hårdkodad default är
  2 ändå ⇒ noll funktionell skillnad (M1+M7). U12:30-34 citerade
  `"compression": 2` vid sin läsning — deltat (omkollega-citat eller
  sessionsbyte) kan inte avgöras i efterhand; rapporterat, inte tolkat.
- **quality 2→3** (M1 mot U12:30-34): sammanhängande med remote — telefonens
  viewport ≈ 390x844 = ~0,33 Mpix mot 960x540 = ~0,52 Mpix (U12:36-39
  processmätning; U5-citerad "~2,6x färre pixlar" i U13v1:82) ⇒ bandbredd
  frigörs och kvalitetssteget är koherent, ej konflikt.

### 1.4 GRANSKARFYND B — hälsokontrollens nya invariant är resize-blind

Arbetsytan har en ocommittad ändring i `verktyg/desk-halsa.mjs` (git status
M; diff läst i fulltext, M10): kontrollen "X-geometri" jämför _NET_WORKAREA
mot Xvnc-processens **-geometry ur /proc/cmdline** med motiveringen att inte
härdkoda epokens siffra (föregångaren härdkodade 1280x720). Förbättringen är
rätt i fasta läget men **slår fel under remote-resize**: _NET_WORKAREA följer
klientens begärda storlek vid varje SetDesktopSize, medan cmdline förblir
960x540 ⇒ första kundbesöket med remote ger FAIL "internt inkonsistent
skrivbord" — ett falsklarm som kommer att förvirra nästa rond. Rätt invariant
med remote aktiv: workarea == `xrandr --query` current (båda runtime-sanning)
— se diff-förslag §6.3. Filen ägs av sessionen; jag rör den inte, bara
rapporterar.

---

## 2. Remote-resize-verifiering — väntar kundbesök (dokumenterat)

**Fråga:** har någon klient anslutit och begärt storlek sedan verkställandet
22:01? **Svar: inget sådant spår finns, och beviskanalen är delvis stängd för
fabriksagenten — dokumenterat enligt ärlighetsregeln:**

1. **Journalen oläsbar för mig:** `journalctl -u zdesk-novnc --since
   "2026-09-28 21:00"` → "-- No entries --" + behörighetshint; `id` visar
   uid/gid 1000 med ENDAST gruppen ak1a (ej adm, ej systemd-journal); `sudo
   -n` vägrar (M4). Systemjournalen kan endast huvudsessionen/root läsa —
   fabricerade loggcitat är därför omöjliga att lämna, och lämnas ej.
2. **xrandr är den direkta runtime-sanningen och visar oförändrat läge:**
   current 960x540 med \* (M2). TigerVNC behåller senast begärda storlek
   (inget idle-återställningsläge är belagt i U12) ⇒ **ingen
   SetDesktopSize≠960x540 har verkställts sedan 22:01.** Obs (ärlighet):
   xrandr kan inte skilja "inget besök" från "besök via scale-knappen" —
   scale begär ingen storlek (U12:62-70); journalen (root) kan skilja dem åt.
3. **Inga aktuella klienter:** `ss -tn state established` på 6080/5910/7681 →
   tom lista (M3) — ingen desk- eller chattklient uppkopplad just nu.
4. **Acceptanstest definierat (för nästa fabrikspuls ELLER root-session):**
   efter kundens nästa besök direkt på vnc.html UTAN scale-query skall
   `DISPLAY=:10 xrandr --query` visa current ≠ 960x540 (förväntas ≈
   telefonens viewport, t.ex. 390x844 porträtt / 844x390 liggande) ⇒
   **remote-resize BEVISAT**. Fortfarande 960x540 ⇒ antingen skedde inget
   remote-besök (root läser journalen för att avgöra) eller avbojd TigerVNC
   (reservläge i klienten, rfb.js:2957-2959 via U12:94-95).
5. **Oförifierade risker som står kvar tills dess:** TigerVNC:s accept av
   godtycklig porträttgeometri (U12:102-104, ärlighetsrad U12:273-277) och
   Electron-fönstrets omfallning vid krympande display (U12:98-99) — samt
   U11 F9:s `minHeight:640` mot en 390-låg liggande vy (U11:127-139; notera
   att dagens live-läge redan har 960x640 fönster på 540-hög skärm,
   U11:136-139, så situationens klass är tränad, om än ej bevisad för
   porträtt).

---

## 3. U11:s breakpoints mot 960x540-viloläget — dom: behåll, 720x405 blir reserv

- **Dagens viloläge ligger mellan trösklarna:** 960 px fönster vid zoomLevel 1
  (faktor 1,2) = **800 effektiv CSS-px** — varken under 640 (sheet-läge,
  U11:40-49) eller under 768 (kompakta tabeller, U11:80-84); U11:196-197
  konstaterar själva mekanismen i kundens iakttagelse "allt ser likadant ut
  bara mindre".
- **Fast-geometri-optimum enligt U11:** 720 px fönsterbredd vid zoomLevel 1 ⇒
  600 effektiv ⇒ slår 640+768+740-trösklarna på en gång (U11:180, slutsats
  U11:198-204) — det var U13v1 steg 2:s spår (v1:186-196).
- **Med remote LEVANDE ändras förutsättningarna:** viloläget är ett transient
  tillstånd utan tittare — varje anslutande klient sätter SIN egen viewport
  redan vid firstUpdate (U12:74-78), och telefonens ~390 px bredd vid
  zoomLevel 1 ⇒ ~325 effektiv CSS-px, DJUPARE under 640 än 720-spåret
  nårgonsin kommer ⇒ appens EGEN mobil-layout aktiveras (U11 F1
  sheet-dialoger, F2 enkolumn + mobil-endast-element, U11:39-59).
- **DOM:** viloläget står kvar **960x540** — ingen root-ändring i /etc för
  ett tillstånd ingen ser; geometri-rad i systemd är inte längre
  paritetsspårets verktyg. **720x405 dokumenteras som RESERVGEOMETRI** om
  remote måste återkallas (då enligt U11:180 med zoomLevel 1 ⇒ 600 effektiv
  bredd). U13v1:s steg 2 omklassificeras därmed från "villkorat nästa steg"
  till "reserv".
- **Synergin är domens kärna:** remote-resize är inte bara "telefonens egna
  pixlar utan uppskalningssuddighet" (U12 rankning 4/5, U12:216) — det
  **låser upp appens egen mobil-layout**, vilket täpper till den lucka
  v1:153-158 beskrev ("app-zoom ≠ app-layout"): nu är det APP-LAYOUT som
  aktiveras, vid telefonens egen bredd.

---

## 4. Slutgiltig dom

1. **HUVUDVÄG A BEKRÄFTAD OCH FÖRBÄTTRAD.** Global `resize=remote` i
   defaults.json (sessionens verkställande 22:01, §1.1) kombinerat med U11:s
   tio belagda responsiva krafter är starkaste pariteten per rad kod: noll
   nya processer (U12:108-116), telefonen ber om sin faktiska viewport vid
   varje anslutning och rotation (U12:62-78), och appens eget mobil-läge
   aktiveras under 640 px effektiv bredd (§3). U12:s rekommendation
   (U12:225-231) bekräftas av U11:s belägg.
2. **Avvikelsen från bokmårådet är dokumenterad och bedömd RÄTT.** U5:128-130
   och U13v1 steg 3 (v1:199-210) föreslog per-enhet-query med orörd
   defaults-fil; sessionen valde globalt default i stället. För en
   icke-teknisk kund är det rätt avvägning: ingen bokmärkesinstruktion, inget
   läge att glömma. Kostnaden står kvar öppet dokumenterad: RFB är en
   framebuffer per session — sista klienten vinner (U12:80-88) — vid
   SAMTIDIGA dator+telefon-sessioner blir det dragkamp. För en användare som
   alternerar (inte samtidigt) är det självkorrigerande: varje anslutning
   sätter sin egen storlek. Verklig samtidighet = triggläge för reserv B
   (U12:233-237).
3. **KORRIGERINGSKRAV FÖRE "KLART" (fynd A, §1.2):** hjälpsidans knapp pinar
   `?resize=scale` och vinner över defaults.json — huvudingången kringgår
   alltså remote tills rad 137 rättas (förslag §6.1). Utan detta rättas inte
   heller bevisgrinden: kundens nästa besök via knappen bevisar ingenting om
   remote (§2.4).
4. **Hälsokontrollen behöver resize-medveten invariant (fynd B, §1.4):**
   annars falsklarm "internt inkonsistent skrivbord" efter första lyckade
   remote-resize — exakt det tillfälle systemet INTE skall larma (förslag
   §6.3).
5. **Viloläge 960x540 kvar; 720x405 reservgeometri** (§3).
6. **Reserv B (dubbelt skrivbord :11 + --user-data-dir) KVARSTÅR** med
   U12:s belägg och triggrar (U12:216-218, 233-237); /chat-bryggan och
   /studio förblir komplementen som redan är telefonvänliga (U12:186-208;
   AGENTS.md "Kundens tre chattvägar").
7. **Nästa root-steg i ordning:** (a) rätta hjalp.html:137 och :91 (ägs av
   huvudsessionen under D3-rätten — ak1a-ägd fil), (b) invänta kundens nästa
   besök → kör acceptanstestet §2.4 → bokför beviset i worklog, (c) landa
   desk-halsa.mjs med resize-medveten invariant (§6.3) innan nästa
   hälsokörning efter kundbesök.

---

## 5. Revidering av v1:s stegplan (bokföring)

| v1-steg | Utfall i v2 |
|---|---|
| 1. Inhämta A+B, kör syntes v2 | **✓ detta protokoll** (v1:178-183) |
| 2. Villkorat U11: breakpoint-geometri 720x405 i systemd | **RESERV** — supersett av remote: klientviewport går djupare än 720 (§3; v1:186-196) |
| 3. Kundens bokmärke ?resize=remote | **UTFÖRT GLOBALT** av sessionen (defaults.json) — enklare för kunden; med fynd A-korrigeringskravet (v1:199-210) |
| 4. Villkorat U12: dubbelt skrivbord | **ORÖRD RESERV** med kvarstående triggrar (v1:212-221) |
| 5. Bokföring + kundmanual | **DELVIS**: detta protokoll + diff-förslag §6; worklog-bokföring och hjälpsideändring åvilar huvudsessionen (v1:224-230) |

V1:s revideringslista (v1:234-248) är därmed avverkad: §2+steg 2 besvarat av
U11 (ja, ECHT breakpoints finns — men geometrispåret ersatt av remote),
§3.1-2+steg 3-4 besvarat av U12 (RANDR svarar; delad-display-konflikten står
kvar som B-trigger), rankingen fastställd i §4.

---

## 6. Diff-förslag (GRANSKAREN föreslår — filerna ägs av sina ägare, jag skriver ej i dem)

1. **hjalp.html:137** — byt
   `vnc.html?autoconnect=true&resize=scale&show_dot=true` →
   `vnc.html?autoconnect=true&resize=remote&show_dot=true`,
   eller stryk `resize`-parametern helt och låt defaults.json råda (knappen
   följer då framtida defaultbyten automatiskt; localStorage-låsning för
   besökare som själva rört rullgardinen kvarstår i båda varianterna,
   webutil.js:159).
2. **hjalp.html:91** — ersätt "Skrivbordets egen storlek är förinställd av
   oss — vyn anpassar sig automatiskt, så du behöver inte zooma inne i
   bilden." med t.ex. "Skrivbordet anpassar sig automatiskt till din skärm —
   telefonen får sin egen storlek utan att du zoomar." (U12:110-115 flaggade
   meningen för uppdatering redan vid driftsättning av A; med remote är
   "förinställd av oss" inte längre sant).
3. **verktyg/desk-halsa.mjs** (ocommittad diff i trädet) — i `xGeometri()`:
   byt jämförelsemål från `/proc/<pid>/cmdline`-geometry (starttillstånd)
   till `xrandr --query` current (runtime), alternativt acceptera
   "workarea == cmdline-geometry ELLER == xrandr-current" — annars
   falsklarm efter första lyckade remote-resize (§1.4).

---

## 7. Juridik

Ren infrastruktur- och verktygssyntes: inget finansiellt innehåll, inga
kundriktade texter, inga råd (2007:528 berörs ej). Priser/tier/publicering:
orörda (R2-respekt). Kakor/GDPR: noVNC-inställningar persist-as endast i
besökarens egna localStorage (webutil.js:142-171) — denna syntes sätter ingen
kaka och samlar ingenting; diff-förslagen ändrar UI-text och klientbeteende,
ingen ny datainsamling (art 13 oberörd).

---

## 8. Källförteckning (källtripp per påstående)

**Källprotokoll (lästa i fulltext denna omgång):**
- K1 = data/forskning/DESK-U11-APPRESPONSIVITET.md (commit 66b0b45d) — citat
  med :rad.
- K2 = data/forskning/DESK-U12-TELEFONPARITET.md (commit ba348371) — citat
  med :rad.
- K3 = data/forskning/DESK-U13-PARITETSSYNTES.md v1 (commit c785d493) —
  citat med :rad.

**Egna mätningar (alla körda 22:00-22:13 UTC 2026-09-28):**
- M1 = Read + stat /home/ak1a/desk-web/defaults.json (resize remote, quality
  3, compress 2; mtime 22:01:25.678).
- M2 = `DISPLAY=:10 xrandr --query` (current 960x540 59.63\*, modolista).
- M3 = `ss -tn state established` port 6080/5910/7681 (tom).
- M4 = `id` (endast ak1a-grupp), `sudo -n journalctl` (vägrar),
  `journalctl -u zdesk-novnc --since 21:00` ("-- No entries --" + hint).
- M5 = grep hjalp.html (enda vnc.html-länk rad 137, resize=scale) + stat
  (mtime 20:43:53).
- M6 = ui.js:771-789 (initSetting-ordning), webutil.js:61-70 (getConfigVar),
  webutil.js:153-171 (readSetting→localStorage), mandatory.json (`{}`).
- M7 = ui.js:194-196 (hårdkodade defaults 'off'/'6'/'2').
- M8 = ls desk-web (ingen index.html; vnc_auto.html → symlink), grep
  vnc.html (rullgardin rad 283-288; AK1A-tillägga knappar rad 159-196; tips
  rad 398).
- M9 = grep src/ efter desk-länkar (endast falskträff "desktop" i
  manifest.ts:5).
- M10 = `git diff verktyg/desk-halsa.mjs` (xGeometri jämför workarea mot
  /proc-cmdline-geometry; ocommittad, ägd av sessionen).

**Ärlighetsrad:** påståenden om klientbeteende efter kundbesök är PROGNOS,
markerade som sådana (acceptanstest §2.4); journalbaserad verifiering är
behörighetsblockerad för fabriksagenten (M4) och lämnas öppen åt root; inga
fakta utan källa ovan.

RESULTAT: slutgiltig dom huvudväg A bekräftad och förbättrad — global remote-resize låser upp appens EGEN mobil-layout (U11+U12-synergin) — med TVÅ korrigeringskrav före klart: hjälpknappens resize=scale-pin (hjalp.html:137) och hälsokontrollens resize-blinda invariant (desk-halsa.mjs); viloläge 960x540 kvar (720x405 reserv), reserv B kvarstår (+ remote-resize väntar kundbesök)
