# DESK-U2 — MOBILFELJAKT: telefonens hela resa in till ZCode

**Datum:** 2026-09-28 · **Agent:** fabriksagent v198-u2 (BYGGARE, feljakt)
**Uppdrag:** kundens order "förbättra inloggningsupplevelsen via telefon som att du är människan som ska börja logga in, chatta osv — låt fabrikens agenter söka efter fel, rätta, förbättra, hela tiden".
**Metod:** (1) läst ALLA ytors faktiska kod — landningen `/var/www/desk/index.html`, noVNC-kopian `/home/ak1a/desk-web/` (vnc.html, app/ui.js, app/webutil.js, app/localization.js, app/locale/sv.json, styles, defaults.json, package.json, core/rfb.js gest-flödet), apparaten (systemd + X-fönsterträd, passivt), auth-lagret (curl 401-kedja). (2) gått resan steg för steg som en människa i en telefon. (3) varje fynd bevisat ur fil+rad eller mätvärde — inget påhittat beteende. (4) allvarlighet: **A** = kunden fastnar, **B** = irriterar, **C** = polering.

---

## RESEN — vad människan faktiskt möter (verifierat)

1. **Adress + browser-auth-ruta.** `https://lab.ak1nvestor.com/desk` → 302 → `/desk/` → **401** med `WWW-Authenticate: Basic realm="ZCode-skrivbord"` (mätt 2026-09-28 15:51). Rutan är svensk och personlig — bra. Cert: Let's Encrypt, giltigt t.o.m. 2026-12-27.
2. **Landningen.** Mörk, svensk, en stor knapp "Öppna ZCode →" till `vnc.html?autoconnect=true&resize=scale&show_dot=true`, fyra guide-steg, ingen extern resurs, inget lösenord i källan (läst i sin helhet).
3. **noVNC-vyn.** Sidan landar på svenska på en svensk telefon (språkval ur `navigator.languages` via tre-pass-matching, localization.js:43-89; sv.json komplett med 82 nycklar). Parametrarna är **bevisat stödda av just denna kopia** (noVNC 1.6.0, package.json): `autoconnect` (ui.js:136-139), `resize=scale` (ui.js:181 + 1099 `scaleViewport`), `show_dot` (ui.js:187 + 1103). WebSocket-URL:en byggs relativt sidans URL (`new URL(path, location.href)`, ui.js:1071) → `/desk/websockify` — korrekt, ingen prefix-fälla.
4. **Apparaten.** Alla fyra systemd-enheter `active`. Xvnc `:10` med `-geometry 1280x720 -depth 24 -localhost -SecurityTypes None` (systemd ExecStart, läst). Rotfönstret mätt 1280×720. ZCode-fönstret `0x400003 "ZCode"` mätt **1280x720+0+0** = fullt maximerad; openbox-konfig `maximized=yes, decor=no` (läst). Appen fyller hela strömmen.
5. **Tangentbord + chatt.** Touch-enhet får tangentbordsikon (vnc.html:130-133, `noVNC_mobile_buttons`); extraknappar (Ctrl/Alt/Tab/Esc) finns; inmatning sker via osynlig textarea (base.css:870-878) — standard noVNC-mekanism.
6. **Avbrott + återkomst.** Vid tappad anslutning: status "Frånkopplad" + Connect-panelen öppnas automatiskt (ui.js:1190-1196). Automatisk återanslutning finns i koden men är **avslagd** (se fynd F5). Server-sessionen lever kvar — landningens påstående "Sessionen pausas inte" är sant.

## FYNDLISTA

---

### F1 · Nyp-gesten zoomar APPEN, inte vyn — och det finns ingen enkel väg tillbaka på mobil
**Allvarlighet: A** — kunden kan själv förstöra sin vy och fastna.
**Bevis:** core/rfb.js:1431-1444 — pinch-gesten håller ner Ctrl och skickar scrollhjul till servern (`_handleKeyEvent(KeyTable.XK_Control_L …)` + scrollknappar). Det zoomar alltså ZCode-appens eget UI (Chromium-zoom), inte noVNC-fönstret. På mobil finns ingen Ctrl+0-snväg: tangentbordet kräver först kontrollbarens extraknappstogg + öppet tangentbord + "0" — tre steg ingen tänker på. Elektron-zoomen riskerar dessutom att leva kvar mellan sessioner (ej kunnat testas empiriskt inom uppdragets processpåverkan-förbud — ärligt redovisat).
**Rättning:** core/ är förbjudet område (KO-regel för u4) — gesten kan inte plockas bort i kopian. Pragmatisk kuration: (a) lägg ett varvingssteg på landningen ("Nypa med två fingrar zoomar appens text — för att återställa: extraknappar → Ctrl → skriv 0"), (b) beverkliga en "Ctrl+0"-snabbknapp i extraknappspanelen (app/ui.js + vnc.html — ak1a-ytigt).
**Ägare:** landningen = fabriken kan självrätta; extraknappslösning = bokas till nästa KO-omgång (u4-omgången äger ui-beröring).

---

### F2 · Kontrast i sidfoten: 2,5:1 — under WCAG AA (4,5:1 för småtext)
**Allvarlighet: B** (tillsammans med F3: kunden med sedligt glasögon läser foten i dunkel).
**Bevis:** `/var/www/desk/index.html:63` — `.fot { color:#475569 }` på bakgrund `#0b1120` (index.html:13), 11,5 px text. Relativ luminans (WCAG-formeln): 0,0885 mot 0,00576 → kontrast **2,49:1**. Krav för normal text: 4,5:1.
**Rättning:** lyft till `#94a3b8` eller ljusare (ger >7:1); behåll storlek eller öka till 12,5–13 px.
**Ägare:** ak1a-ytigt — `/var/www/desk` är ak1a-ägd (worklog r18446); fabriken självrätter.

---

### F3 · Kontrast i knapptexten under knappen: 3,9:1 — under 4,5:1
**Allvarlighet: B.**
**Bevis:** `index.html:45` — `.litet { color:#6b7280; font-size:12.5px }` på `#0b1120` → **3,89:1**. Texten "Öppnas i fullskärm — vrid telefonen liggande…" är samtidigt resans viktigaste instruktion — den ska inte vara svagast på sidan.
**Rättning:** `#9ca3af` (samma som .blurb, 7,4:1 bevisat OK i samma fil).
**Ägare:** ak1a-ytigt — fabriken självrätter.

---

### F4 · "Öppnas i fullskärm" är ett löfte skrivbords- och iPhone-användaren aldrig får uppfyllt
**Allvarlighet: B** — förväntansbrott redan vid första trycket.
**Bevis:** (a) vnc.html öppnas som vanlig sida; webbläsare tillåter inte automatisk fullskärm utan gest. (b) På iOS Safari finns ingen `requestFullscreen` alls — noVNC döljer till och med sin fullskärmsknapp på Safari (ui.js:147-158, `isSafari()`-vilkoret). Texten står i index.html:75.
**Rättning:** "Öppnar skrivbordet — vrid telefonen liggande för bästa vy." Fullskärm är möjlig på Android via noVNC:s knapp (förespråka "Lägg till på startskärmen" som separat tips, se F15).
**Ägare:** ak1a-ytigt — fabriken självrätter (landningstext).

---

### F5 · Automatisk återanslutning är AVSLAGEN trots mobilnäts-verkligheten
**Allvarlighet: B** — varje tågtunnel/balkonghopp blir ett manuellt ingrepp.
**Bevis:** ui.js:190 `UI.initSetting('reconnect', false)` + `/home/ak1a/desk-web/defaults.json` innehåller exakt `{}` — ak1a-kopians egen krok för just detta står oanvänd. Flödet vid avbrott utan reconnect: status "Frånkopplad" + Connect-knapp krävs (ui.js:1188-1196). Landningens råd är då "ladda om sidan och tryck på knappen igen" (index.html:96) — tre steg i stället för noll.
**Rättning:** `defaults.json` ← `{"reconnect": true, "reconnect_delay": 5000}` (funktion redan i koden, svensk status "Återansluter..." finns i sv.json:5). Landningens råd mjukas till "tappar du anslutningen återansluter den oftast själv — annars tryck på Anslut".
**Ägare:** defaults.json = u4:s exakta område i denna KO-omgång — **boka direkt till u4**; landningstexten = fabriken självrätter.

---

### F6 · "Webbläsaren sparar det — bara första gången" — överoptimistiskt på telefon
**Allvarlighet: B** — andra dagen frågar rutan igen och kunden tror hen gjorde fel.
**Bevis:** basic auth sparas i mobil Safari per session; när appen/processen startar om (iOS gör det rutinmässigt vid minnespress) visas auth-rutan igen. Påståendet index.html:80 lovar permanent. (Chrome/Firefox Android sparar däremot persistent — beteendet varierar, alltså är löftet osant för en del av resan.)
**Rättning:** "Webbläsaren minns det vanligtvis åt dig — ibland frågar den igen efter omstart, då anger du samma igen."
**Ägare:** ak1a-ytigt — fabriken självrätter.

---

### F7 · "strecket högst upp" — kontrollbaren sitter i VÄNSTRA KANTEN, inte högst upp
**Allvarlighet: B** — tangentbordsvägledningen (resans steg 3) pekar fel i rummet.
**Bevis:** base.css:221-241 — `#noVNC_control_bar_anchor` positioneras `left:0` (vänster kant; höger only vid `.noVNC_right`). Dra-handtaget (`noVNC_control_bar_handle`, vnc.html:116) sitter på kantens mitt. Texten index.html:88.
**Rättning:** "Tryck på strecket i telefonens VÄNSTRA kant för att öppna menyn — tangentbordsikonen finns där."
**Ägare:** ak1a-ytigt — fabriken självrätter.

---

### F8 · Touch-mål ~33 px på noVNC:s knappar — under 44 px-rekommendationen
**Allvarlighet: B** — tangentbordsikonen är resans mest använda knapp och är knappt träffbar med tumme.
**Bevis:** base.css:390-397 — `#noVNC_control_bar .noVNC_button { padding:4px 4px }`; ikonerna ritas i naturlig storlek, t.ex. keyboard.svg `width="25"` (mätt i filen) → träffyta ≈ 25+8 = **33×33 px**. WCAG 2.5.5 (AAA) / Apple HIG rekommenderar 44 px.
**Rättning:** i ak1a-kopians `app/styles/base.css`: `.noVNC_button { padding:8px }` + `min-width/height:44px` med centrerad ikon (CSS-only, ingen core-beröring). Kontrollbaren är redan scrollBAR, höjdökningen är gratis.
**Ägare:** ak1a-ytigt (app/styles i ak1a-kopian) men utanför u4:s deklarerade filer → bokas till nästa KO-omgång som egen mikro-uppgift.

---

### F9 · Tappad inloggning + autoconnect = "Misslyckades att ansluta till servern" UTAN förklaring
**Allvarlighet: B** (A-adjacent): kunden ser ett teknikfel när det egentligen är auth-rutan som saknas.
**Bevis:** `/desk/websockify` svarar **401** utan autentiseringsuppgifter (mätt). När Safari tappat basic-auth (se F6) och sidan autoconnectar, får RFB ett 401-vsbrott → status "Misslyckades att ansluta till servern" (sv.json:7, ui.js:1178) — ingen svensk rad om att inloggningen behövs, och Connect-knappen som då trycks misslyckas upprepande.
**Rättning:** kan inte fixas inuti core (förbjudet område). Kuration: (a) landningen får en rad "om den bara säger 'misslyckades att ansluta' — stäng fliken, öppna /desk/ igen och logga in"; (b) ev. future: egen liten wrapper-sida som pingar `/desk/defaults.json` (401-test, 1 request) och visar svensk inloggningsvägledning före autoconnect. Wrappern äger fabriken (ak1a-ytig).
**Ägare:** landningsrad = fabriken; wrapper = bokas till nästa omgång (vnc.html ägs av u4 nu).

---

### F10 · Nginx standardsida vid 401: engelsk, opersonlig, 188 byte
**Allvarlighet: C.**
**Bevis:** curl på `/desk/` visar nginx 1.28.3 default-sida "401 Authorization Required" (Server-header + Content-Length 188, mätt).
**Rättning:** `error_page 401 /desk-401.html;` med svensk "Du behöver logga in — tryck tillbaka och ange ak1a + ditt lösenord" i AK1A-stil.
**Ägare:** **root** (nginx-konfig) — bokas till nästa root-rond (R2-adjacent yta men icke-veto: ren driftförbättring).

---

### F11 · Porträttvyn är ~30 % skala — oläslig — och vägledningen lever bara på landningen
**Allvarlighet: C** (landningen fångar det, men bokmärkes-/delad-länk-resan gör den inte).
**Bevis:** skrivbordet är 1280×720 (mätt, rotfönster); telefon-porträtt ~390 px bred → skalfaktor 390/1280 ≈ **0,30** → apptext ~4-5 px. Vägledningen "vrid liggande" finns enbart i index.html:75+84 — i själva vnc-vyn finns ingen rotationstips.
**Rättning:** (a) landningens rad räcker för knappflödet; (b) bokmärkesresan: defaults.json kan inte visa tips — men en 5-raders "snabbhjälp"-rad kan läggas i vnc.html under connect-rutan (ak1a-ytigt, u4:s fil).
**Ägare:** vnc.html-tips = u4/boka; landningen komplett = OK redan.

---

### F12 · `user-scalable=no` + `maximum-scale=1.0` — webbläsarens zoom är helt avstängd
**Allvarlighet: C** — korrekt för en VNC-yta (nyp-gesten ägs av strömmen, se F1) men det förstärker F11: i porträtt kan användaren inte ens kompensera med vanlig sidzoom.
**Bevis:** vnc.html:22 `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`.
**Rättning:** avlägsna `maximum-scale`/`user-scalable` är INTE önskvärt (dubbelzoom-förvirring med F1) — behåll som det och kurera via F11:s rotationsvägledning. Fyndet dokumenterar medvetet val: ingen rättning rekommenderad, notera bara i beslut.
**Ägare:** dokumenterat — ingen ändring föreslås (BASF: rättning får inte skapa nytt fel).

---

### F13 · Tom `defaults.json` — varje besök utan query-parametrar förlorar skalning och autoconnect
**Allvarlighet: C.**
**Bevis:** defaults.json = `{}` (mätt, 3 byte). Inställningar läses query-först, annars localStorage (ui.js:752-762) — en länk delad/sparad utan `?autoconnect=true&resize=scale` (t.ex. browser som klipper query vid bokmärke, eller kund som skriver adressen själv) ger oskalad vy (1280 px klippt i 390 px) + Connect-klick. Landningens knapp bär parametrarna — men bara den.
**Rättning:** `defaults.json` ← `{"resize":"scale", "autoconnect":"true", "show_dot":true, "reconnect":true}` (parametrarna bevisat giltiga namn, se ovan) — då är hela domänen säker oavsett entré.
**Ägare:** u4:s exakta fil — **boka direkt till u4** (samma rättning som F5, en redigering).

---

### F14 · Flikens titel är "noVNC" — inte "ZCode"
**Allvarlighet: C.**
**Bevis:** ui.js:23 `PAGE_TITLE = "noVNC"` + vnc.html:16 `<title>noVNC</title>`; vid anslutning sätts `document.title = desktopName + " - noVNC"` (ui.js:1769). Kunden med flera flikar letar efter "ZCode".
**Rättning:** vnc.html `<title>ZCode — AK1A</title>` (u4:s fil) räcker för startläget; full titelkontroll kräver ui.js-ändring (`PAGE_TITLE` är app/-fil — ak1a-ytigt, bokas nästa omgång).
**Ägare:** title-taggen = u4; PAGE_TITLE = nästa KO-omgång.

---

### F15 · PWA-läge utlovat (`apple-mobile-web-app-capable`) men noll safe-area-anpassning
**Allvarlighet: C.**
**Bevis:** vnc.html:23-24 sätter apple-mobile-web-app-capable/status-bar-style — lägger kunden sidan på hemskärmen körs den standalone; grep i noVNC-css: **0** träffar på `safe-area`/`env(` (base.css, input.css, constants.css). I liggande iPhone kan kontrollbaren (vänsterkant, F7) hamna under notch/statusfältsområdet.
**Rättning:** i kopians base.css: `#noVNC_control_bar_anchor { padding-left: env(safe-area-inset-left); }` + motsvarande — eller ta bort meta-taggarna (mindre bra: hemskärmsläget är annars resans bästa fullskärm på iPhone, se F4).
**Ägare:** app/styles + vnc.html — ak1a-ytigt, bokas till nästa KO-omgång.

---

### F16 · Inställningspanelens "Remote resizing" är översatt "Ändra storlek" — tvetydig
**Allvarlighet: C.**
**Bevis:** sv.json:52 — `"Remote resizing": "Ändra storlek"` bredvid "Local scaling" = "Lokal skalning". Kunden som råkar öppna Inställningar ser två olika begrepp där ena är vilseledande generisk ("ändra storlek" låter som precis vad man VILL på en telefon).
**Rättning:** sv.json i ak1a-kopian: "Fjärrändra upplösning" eller "Skalning på servern". Obs: väljer kunden det läget ändras skrivbordets upplösning (Xvnc stödjer resize-session) och 1280×720-formatet bryts — därför också värt att mandatory-låsa `resize` i defaults-arbetet (u4).
**Ägare:** sv.json = ak1a-kopia (app/locale) — nästa KO-omgång; låsningen = u4.

---

## VERIFIERAT BRA (för att nästa agent inte ska jaga spöken)

- **`autoconnect/resize=scale/show_dot` stöds av exakt denna kopia** — bevisat ur ui.js/webutil.js (se ovan); länkens parametrar gör vad de lovar och query vinner över localStorage (ui.js:758-761).
- **Svenska hela vägen in** på svensk telefon: 82 kompletta nycklar i sv.json, inklusive alla felmeddelanden ("Något gick fel, anslutningen avslutades").
- **Auth-kedjan konsekvent**: allt under `/desk/` (även assets, sv.json, websockify) svarar 401 utan inloggning (mätt) — inget läcker runt auth.
- **Realm-texten är svensk**: "ZCode-skrivbord" (mätt i WWW-Authenticate).
- **Apparaten sund**: 1280×720 rot, ZCode maximerat 1280x720+0+0 (xwininfo), fyra enheter active, openbox decor=no — kundens bildproblem från 1600×900-eran är botat i verkligheten.
- **Power-knappen (Stäng av/Boota om) är DOLD** mot denna server — Xvnc saknar power-kapability, ui.js:951-961 döljer knappen. Kunden kan inte av misstaga släcka skrivbordet från telefonen.
- **Fel-lösenordsresan**: fel basic auth → rutan kommer tillbaka tom — ingen låsning mätt; tungt men säkert.
- **Vikt första resan**: ~740 KB okomprimerat (vnc.html 17,8 + app 692 + core 403 delar… totalt mätt med du -sb: app 692 KB, core 403 KB, vendor 176 KB) — normalt för noVNC; komprimeras över HTTPS. Cache-headers kunde inte mätas utan inloggningsuppgifter (allt 401) — ärligt oprövat.

## BEGRÄNSNINGAR (ärliga)

- Ingen automatisk klick-simulering i telefonbrowser gjordes (browser-drivna test mot auth-skyddad yta kräver uppgifter jag inte får röra); resan är bevisad ur kod + passiva HTTP/X-mätningar.
- Zoom-persistens i Electron (F1) ej empiriskt testat — processpåverkan är förbjuden i detta uppdrag; provas lämpligen i u5:s stabilitetsutredning eller nästa root-rond.
- F2/F3:s kontrastvärden är beräknade enligt WCAG-relativ-luminans-formeln från filens egna hexkoder (rubbet <0,1).

## NÄSTA STEG (bokning till KO)

1. **u4 (pågående omgång):** defaults.json `{"resize":"scale","autoconnect":"true","show_dot":true,"reconnect":true,"reconnect_delay":5000}` (F5+F13) + vnc.html-title "ZCode — AK1A" (F14) + ev. rotationsrad under connect-ruta (F11).
2. **Nästa KO-omgång, mikro-uppgifter (ak1a-ytigt, allt förberett i detta protokoll):** landningstexter F3/F4/F6/F7/F9 + kontrast F2/F3; base.css touch-mål F8 + safe-area F15; sv.json F16; ev. Ctrl+0-snabbknapp F1.
3. **Root-rond:** svensk 401-sida F10.

RESULTAT: 16 fynd (A:1 B:8 C:7)
