# DESK-U3 — Tyst auto-återanslutning i noVNC (2026-09-28)

**Våg:** v200-u1 (agentfabrik, BYGGARE) · **Ägarskap:** `/home/ak1a/desk-web/app/ui.js` — **vnc.html, defaults.json, mandatory.json, core/**, vendor/** orörda** (u4:s och u2b:s leveranser orörda, bygger PÅ dem) · **Syfte:** telefonen som tappar nätet (tunnelbana, fickan, nattbyte wifi→mobil) ska själv hitta tillbaka — kunden får ALDRIG behöva ladda om sidan och ALDRIG tro att skrivbordet dött (sessionen lever kvar på servern; bara strömmen bröts).

---

## 1. Sammanfattning (tre rader)

1. **Avbrottstypen skiljs av källan själv** — redan före denna våg: användarens Koppla-från-knapp kör `UI.disconnect()` som sätter `inhibitReconnect = true` (gammal ui.js:1116) ⇒ auto-reconnect stannar; nätverksdöd går förbi `UI.disconnect` och landar i `disconnectFinished` ⇒ auto-reconnect körs. Jag byggde PÅ den mekanismen, ersatte den inte.
2. **Fyra tillskott i ui.js (59 nya + 2 ändrade rader, allt märkt `AK1A (DESK-U3)`):** försöksräknare, svensk statusrad "Återansluter… (försök N)" i både överlägg och statusrad, första försöket efter 2 s (därefter 5 s), samt "Uppkopplad igen" i exakt 5 s vid lyckad återkomst.
3. **Två fällor undveks:** (a) showStatus vägrar skriva över en öppen **error**-rad och fel timeout:ar aldrig — källans röda "Something went wrong…" hade legat kvar genom hela återanslutningen; reconnect-grenen kör nu `hideStatus()` först (ui.js:1232). (b) vid misslyckat försök visade källan röda "Failed to connect to server" var 5:e sekund — nu den lugna försöksraden i stället.

## 2. Grundläget jag fann (kartläggning)

Källans inbyggda mekanism (noVNC 1.4, aktiverad av u4:s `reconnect: true` i defaults.json):

```
nätverksdöd ⇒ RFB "disconnect"-event (clean=false)
   ▼
disconnectFinished(e)  [före denna våg: ui.js:1163]
   ├─ wasConnected=true ⇒ showStatus("Something went wrong…", 'error')   ← RÖD, aldrig timeout
   ├─ reconnect-inställningen på + !inhibitReconnect ⇒ reconnect-gren:
   │     updateVisualState('reconnecting')  → överlägg "Återansluter…" (ordbok sv.json)
   │     setTimeout(UI.reconnect, 5000)
   ▼
reconnect() ⇒ connect(null, reconnectPassword)
   ├─ lyckas ⇒ connectFinished: "Ansluten (krypterat) till <namn>" 1,5 s
   └─ misslyckas ⇒ nytt "disconnect"-event ⇒ disconnectFinished igen ⇒ OÄNDLIG loop ✓
```

**Redan rätt i källan:** oändligt antal försök (loopen är självförsörjande), avbrottstypen skiljd (`inhibitReconnect` sätts ENDAST i `UI.disconnect()` = användarens knapp), ingen sidomladdning någonstans, Avbryt-knapp i överlägget (base.css:848 visar den bara under `noVNC_reconnecting`).

**Saknades mot uppdraget:** försöksräknare i status, 2 s förstagångsfördröjning (källan: alltid 5 000 ms), "Uppkopplad igen"-bekräftelse, samt de två fällorna i §1.3.

## 3. Före/efter — samtliga ändringar i app/ui.js

### 3.1 State (ui.js:48) — NY

```js
    reconnectPassword: null,
    reconnectAttempts: 0,          // ← NY: aktuell återanslutningsomgångs försök
```

### 3.2 `disconnect()` (ui.js:1121) — användarens aktiva avbrott

```js
        // Disable automatic reconnecting
        UI.inhibitReconnect = true;

        // AK1A (DESK-U3): user-initiated — next manual connect starts
        // the attempt counter from zero
        UI.reconnectAttempts = 0;          // ← NY
```

### 3.3 `cancelReconnect()` (ui.js:1147) — Avbryt-knappen i överlägget

```js
        // AK1A (DESK-U3): cancelled wait — next manual connect starts
        // the attempt counter from zero
        UI.reconnectAttempts = 0;          // ← NY (efter clearTimeout-blocket)
```

### 3.4 Nya helpers (ui.js:1158-1170) — efter cancelReconnect

```js
    // AK1A (DESK-U3): tyst auto-återanslutning. Räknarleden finns inte
    // i noVNC:s ordböcker, så den väljs efter webbläsarens språk —
    // aldrig blandat språk i samma rad (u4:s i18n-princip); basen
    // lokaliseras av ordboken ("Reconnecting..." → "Återansluter...").
    isSwedishLang() {
        const lang = ((navigator.languages && navigator.languages.length)
                      ? navigator.languages[0] : navigator.language) || "";
        return lang.toLowerCase().startsWith("sv");
    },

    reconnectStatusText() {
        const word = UI.isSwedishLang() ? "försök" : "attempt";
        return _("Reconnecting...") + " (" + word + " "
               + UI.reconnectAttempts + ")";
    },
```

Varför språkval: u4 bevisade att hårdkodad svensk DOM-text slåss mot
ordboken (engelsk webbläsare ⇒ blandat). Basen `"Reconnecting..."`
går genom `_()` (localization.js) ⇒ sv-ordboken ger "Återansluter...";
 Räknarleden "(försök N)" finns i INGEN ordbok (locale/ är ej min yta)
 ⇒ väljs efter webbläsarens språklista: svensk telefon ⇒ hela raden
svensk, annan webbläsare ⇒ hela raden engelsk. Kunde inte ändra i
locale-filerna (ägarskapsregeln) — dokumenterat som framtida förbättring:
lägg `"Reconnecting (attempt %d)"` i alla ordböcker och plocka här.

### 3.5 `connectFinished()` (ui.js:1176-1190) — lyckad återkomst

FÖRE:
```js
        let msg;
        if (UI.getSetting('encrypt')) {
            msg = _("Connected (encrypted) to ") + UI.desktopName;
        } else {
            msg = _("Connected (unencrypted) to ") + UI.desktopName;
        }
        UI.showStatus(msg);
```

EFTER:
```js
        // AK1A (DESK-U3): a silent reconnect made it back — say so,
        // clearly and calmly, for 5 s, then normal view. First-time
        // connections keep the source's ordinary line (1.5 s).
        const wasReconnect = UI.reconnectAttempts > 0;
        UI.reconnectAttempts = 0;

        let msg;
        if (UI.getSetting('encrypt')) {
            msg = _("Connected (encrypted) to ") + UI.desktopName;
        } else {
            msg = _("Connected (unencrypted) to ") + UI.desktopName;
        }
        if (wasReconnect) {
            msg = UI.isSwedishLang() ? "Uppkopplad igen" : "Connected again";
            UI.showStatus(msg, 'normal', 5000);
        } else {
            UI.showStatus(msg);
        }
```

### 3.6 `disconnectFinished()` reconnect-gren (ui.js:1218-1246) — KÄRNAN

FÖRE:
```js
        // If reconnecting is allowed process it now
        if (UI.getSetting('reconnect', false) === true && !UI.inhibitReconnect) {
            UI.updateVisualState('reconnecting');

            const delay = parseInt(UI.getSetting('reconnect_delay'));
            UI.reconnectCallback = setTimeout(UI.reconnect, delay);
            return;
```

EFTER:
```js
        // If reconnecting is allowed process it now
        if (UI.getSetting('reconnect', false) === true && !UI.inhibitReconnect) {
            // AK1A (DESK-U3): tyst auto-återanslutning — nätverksdöd
            // (tunnelbana, fickan, wifi→mobil) ska aldrig se död ut:
            // sessionen lever kvar på servern, bara strömmen bröts.
            // Räkna upp, göm ev. rött fel (showStatus vägrar skriva
            // över en öppen error-rad) och säg i stället vad som händer.
            // Första försöket efter 2 s, därefter reconnect_delay
            // (default 5 000 ms) — oändligt antal försök: varje missat
            // försök landar här igen via RFB:s disconnect-event.
            // Användarens egen Koppla-från stoppar loopen via
            // inhibitReconnect (UI.disconnect) — avbrottstypen skiljs.
            UI.reconnectAttempts += 1;
            UI.hideStatus();

            UI.updateVisualState('reconnecting');

            const delay = UI.reconnectAttempts === 1
                ? 2000
                : parseInt(UI.getSetting('reconnect_delay'));

            const counterText = UI.reconnectStatusText();
            document.getElementById("noVNC_transition_text")
                .textContent = counterText;
            UI.showStatus(counterText, 'normal', delay + 15000);

            UI.reconnectCallback = setTimeout(UI.reconnect, delay);
            return;
```

Rad-för-rad: räkna upp omgångens försök → göm eventuell röd felrad
(fälla a) → visa reconnecting-läge (överlägg + Avbryt-knapp, källans
egen väg) → delay 2 000 ms första försöket, annars
`reconnect_delay` (u4:s default 5 000) → skriv försöksraden i BÅDA de
befintliga ytorna: stora överlägget `#noVNC_transition_text` (ersätter
källans raderäknarlösa "Återansluter…") och statusraden
`#noVNC_status` som 'normal' med gott tidsutrymme (delay + 15 s; ett
pågående försök som MISSLYCKATS visar kort "Failed…" i källan — nästa
varv i loopen skriver genast ny försöksrad, se §4) → boka nästa försök.

## 4. Kodväg (granskningsbar utan live-anslutning — processpåverkan förbjuden)

```
TELEFONEN TAPPAR NÄTET
   ▼
WebSocket dör ⇒ core/rfb.js "disconnect"-event (clean=false)   [ORÖRD KÄLLA]
   ▼
ui.js:1207  disconnectFinished(e)
   ├─ ui.js:1214  wasConnected=true-grenens röda rad sätts FÖRST (källans egen)
   ▼
ui.js:1218  reconnect-grenen (reconnect-inställning på + !inhibitReconnect)
   ├─ ui.js:1231  UI.reconnectAttempts += 1
   ├─ ui.js:1232  UI.hideStatus()                     ← rensar den röda raden (fälla a)
   ├─ ui.js:1234  UI.updateVisualState('reconnecting') ← överlägg + Avbryt-knapp visas
   ├─ ui.js:1236  delay = försök 1 ? 2000 : reconnect_delay(5000)
   ├─ ui.js:1240  counterText = UI.reconnectStatusText()   [ui.js:1165]
   │               = _("Reconnecting...") + " (försök N)"  → "Återansluter... (försök N)"
   ├─ ui.js:1241  #noVNC_transition_text = counterText  (överlägget, mitten av skärmen)
   ├─ ui.js:1243  UI.showStatus(counterText, 'normal', …)  (statusraden, nedre)
   ▼
setTimeout(ui.js:1245) → ui.js:1149  reconnect() → connect(null, reconnectPassword)
   ├─ LYCKAS ⇒ ui.js:1173 connectFinished:
   │     ui.js:1178  wasReconnect = attempts > 0  ⇒  nollställ (ui.js:1179)
   │     ui.js:1188  msg = "Uppkopplad igen"       (svensk webbläsare)
   │     ui.js:1189  showStatus(msg, 'normal', 5000)  ← exakt 5 s, sedan normal vy
   └─ MISSLYCKAS ⇒ nytt "disconnect"-event ⇒ disconnectFinished igen
         ⇒ attempts += 1 ⇒ "Återansluter... (försök N+1)" ⇒ OÄNDLIGT antal försök

ANVÄNDAREN TRYCKER KOPPLA FRÅN (ui.js:1110 disconnect)
   └─ ui.js:1119  inhibitReconnect = true + ui.js:1121 attempts = 0
         ⇒ reconnect-grenens villak (ui.js:1218 !inhibitReconnect) är FALSK
         ⇒ INGEN auto-reconnect — Anslut-dialogen öppnas (källans eget beteende)

ANVÄNDAREN TRYCKER AVBRYT under återanslutning (ui.js:1141 cancelReconnect)
   └─ clearTimeout + ui.js:1147 attempts = 0 ⇒ väntan slutar, dialogen öppnas
```

**Ingen `location.reload()`/sidomladdning finns i någon väg** — återanslutningen
skapar en ny RFB-instans i samma sida (ui.js:1149→connect, rad 1095: gammal
rfb är `undefined` sedan disconnectFinished rad 1216), sessionen i appen på
servern störds aldrig.

**Om kunden slår AV "Automatisk återanslutning" i Inställningar** (u4:s
default är PÅ, inget låst): reconnect-grenens första villkor är falskt ⇒
källans vanliga "Frånkopplad"-vy med Anslut-dialog — kundens val respekteras
i alla lägen (u4:s rättviseprincip).

## 5. KVD — utdata (klistrad 2026-09-28)

**(a) Parse-kontroll av ändrad ui.js** (ES-modul; u2b:s DESK-U2B §KVD a
-precedens: `new Function` kan inte tolka ESM-import i funktionskropp,
script-läge — de två första kontrollerna är starkare och gröna):

```
$ node --check /home/ak1a/desk-web/app/ui.js && echo "NODE-CHECK-OK"
NODE-CHECK-OK
$ cp ui.js /tmp/u3.mjs && node --check /tmp/u3.mjs && echo "ESM-PARSE-OK"
ESM-PARSE-OK
$ node -e 'new Function(require("fs").readFileSync("<fil>","utf8")); …'
→ SyntaxError: Cannot use import statement outside a module (väntat, se precedens)
```

**(b) Ytan lever:**
```
$ curl -s -o /dev/null -w '%{http_code}' https://lab.ak1nvestor.com/desk/vnc.html
401                        ← VÄNTAT utan auth; auth-väggen hel, ytan serverad
```

**(c) Grep-radbevis (nya positioner):**
```
ui.js:48     reconnectAttempts: 0,                     (state)
ui.js:1121   UI.reconnectAttempts = 0;                (disconnect — användaravbrott)
ui.js:1147   UI.reconnectAttempts = 0;                (cancelReconnect — Avbryt)
ui.js:1159   isSwedishLang() {                        (språkval)
ui.js:1165   reconnectStatusText() {                  (försöksraden)
ui.js:1178   const wasReconnect = UI.reconnectAttempts > 0;
ui.js:1188   msg = UI.isSwedishLang() ? "Uppkopplad igen" : "Connected again";
ui.js:1189   UI.showStatus(msg, 'normal', 5000);
ui.js:1231   UI.reconnectAttempts += 1;               (reconnect-triggern)
ui.js:1232   UI.hideStatus();                         (error-fällan)
ui.js:1236   delay = försök 1 ? 2000 : reconnect_delay
ui.js:1241   #noVNC_transition_text = counterText
ui.js:1245   setTimeout(UI.reconnect, delay)
```

**(d) Ärlighetsrad:** beteendet i en riktig telefon-tunnelbana kan INTE
bevisas live från fabriken (processpåverkan förbjuden i uppdraget).
Beviset är kodvägen ovan + parse-kontrollerna + den manuella
testproceduren i §6. websockify serverar desk-web som statiska filer —
ändringen är LIVE utan omstart (u4:s bevisade faktum, samma yta).

**(e) Orörda ytor (sha256, efter):**
```
684d67389467ee5990f71212f163fd8e9957cd6e7b516960afca507067621ad1  app/ui.js   (ÄNDRAD — endast denna)
3d29c5e7dd35493b404b37dcc8bcaef60fec8cd93fbfbf1bb5d73c6fe637aa5b  vnc.html    (ORÖRD — u4:s leverans)
7083cc261079667e312c8c1684be0b131ec2637ba39d04017352ec83f6f65481  defaults.json (ORÖRD — u4:s leverans)
ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356  mandatory.json (ORÖRD)
core/ + vendor/: 0 filer nyare än backup-tidsstämpeln (find -newer → 0 rader)
diff före/efter: 59 tillagda rader, 2 ändrade (showStatus-anropen i connectFinished)
```

## 6. Manuell 30-sekunderstest för kunden (flyga läget + återkomst)

1. Öppna skrivbordet (https://lab.ak1nvestor.com/desk/) på telefonen
   och logga in — väl ansluten.
2. **Flyga läget:** svep ner snabbmenyn och slå på flygplansläget
   (eller slå av wifi och gå utom täckning) — strömmen dör.
3. Vänta ~3 sekunder. Nu ska Telefonen visa lugn text — INTE rött fel:
   **"Återansluter… (försök 1)"** mitt på skärmen, och samma rad i
   statusfältet. Ingen sidomladdning sker.
4. Håll flygplansläget på i ~15 sekunder: raden räknar tyst upp
   (försök 2, 3, …) — en gång var 5:e sekund, för alltid tills nätet
   är tillbaka eller du trycker Avbryt.
5. **Återkomsten:** slå AV flygplansläget. Inom några sekunder ansluter
   sig skrivbordet självt — och visar **"Uppkopplad igen"** i 5
   sekunder, sedan är allt normalt igen. Sessionen du hade i appen på
   servern lever precis där du lämnade den — INGEN omstart, INGEN
   omflyttning av strömmen krävs från din sida.
6. **Kontroll av skillnaden:** tryck sedan själv på Koppla från i
   panelen — då ska INGEN automatisk återanslutning köras (Anslut-
   dialogen öppnas som vanligt). Det bevisar att klientskillnaden
   mellan nätverksdöd och eget val fungerar.

## 7. Juridik

Ren uppkopplingslogik i klientens eget gränssnitt — inget finansiellt
innehåll, inga råd (2007:528 berörs ej). Inga nya kakor; localStorage
används oförändrat av källans inställningshantering (webutil.js).
Lösenord för återanslutning återanvänder källans egna
`reconnectPassword`-minne i sidminnet (ui.js:1149) — inget nytt lagras.

## 8. Rollback

`cp /tmp/ui.js.före-u3 /home/ak1a/desk-web/app/ui.js` (sha256 före =
u2b:s leverans exakt: `2deb7d1ebbc9b31623db525f0030a3e41b35aeb98c433d5ae1c822c36d40ef50`).
Inga andra filer rörda — rollback är en fil, ingen omstart behövs
(statiskt serverad).
