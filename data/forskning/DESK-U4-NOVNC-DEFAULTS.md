# DESK-U4 — noVNC-defaults: svenskt/riktat första intryck (2026-09-28)

**Våg:** v198-u4 (agentfabrik, BYGGARE) · **Ägarskap:** `/home/ak1a/desk-web/{defaults.json,vnc.html}` — `mandatory.json` lämnad orörd · **Syfte:** telefonens första intryck efter Anslut-knappen ska kännas svenskt, skarpt och självklart — utan att grena klienten.

---

## 1. Sammanfattning (tre rader)

1. **Fyra bevisade defaults satta** i `defaults.json`: lokal skalning på, kvalitet 6, musprick på, automatisk återanslutning på. Inget låst (mandatory orörd) — kunden kan ändra allt i Inställningar.
2. **Svenskan fanns redan inbyggd**: noVNC-paketet har komplett `sv.json` + LINGUAS-koppling — svensk telefon får HELA kontrollpanelen på svenska automatiskt. Ingen kodgren behövs; vnc.html bara fick `lang="sv"` + svensk `<title>`.
3. **Två gränser dokumenterade**: `view_clip` är en död nyckel när skalning är på (tvingas false i ui.js), och `document.title` skrivs över av ui.js till "noVNC" vid start — svenska titeln syns endast före JS/felfall.

## 2. Källkartläggning — vilka nycklar LÄS verkligen i denna version

Lässätt (bevisat): `vnc.html:64-98` hämtar `defaults.json`/`mandatory.json` →
`UI.start({settings:{defaults, mandatory}})` → **ui.js:752-770 `initSetting(name, defVal)`**:
`defaults.json[name]` **ersätter det inbyggda defaultvärdet**; prioritet vid läsning =
URL-query/hash (`getConfigVar`) → localStorage → default. `mandatory.json[name]` tvingar
värdet OCH avaktiverar kontrollen (`forceSetting`+`disableSetting`, ui.js:765-776).
**Okända nycklar är inerta** — en nyckel verkar bara om `initSetting` anropas med det namnet.

Nycklar som verkligen initieras (ui.js:169-191, namn → inbyggt default):

| Nyckel | Inbyggt default | Värdefält (bevis) |
|---|---|---|
| `logging` | `'warn'` | error/warn/info/debug (ui.js:163) |
| `host` / `port` / `path` / `encrypt` / `password` | `''` / `0` / `'websockify'` / protokoll / – | sätts av /desk-flödets URL — **ORÖRDA** |
| `autoconnect` | `false` | `'true'`/`'1'`/bool (ui.js:136-137) — orörd (Anslut-dialogen är första intrycket) |
| `view_clip` | `false` | bool — **död nyckel vid scale**, se §4 |
| `resize` | `'off'` | `'off'`/`'scale'`/`'remote'` (vnc.html:233-235 + ui.js:1099-1100) |
| `quality` | `6` | **heltal 0–9**, hårdvaliderat i rfb.js:383-385 |
| `compression` | `2` | heltal 0–9 (rfb.js:400+) |
| `shared` | `true` | bool (ui.js:184) |
| `bell` | `'on'` | sträng |
| `view_only` | `false` | bool |
| `show_dot` | `false` | bool (ui.js:187, verkställs ui.js:1757-1759 `rfb.showDotCursor`) |
| `repeaterID` | `''` | sträng |
| `reconnect` | `false` | bool — kräver **booleskt true** (ui.js:1182 `=== true`) |
| `reconnect_delay` | `5000` | ms, parseInt (ui.js:1185) |

Verkställande vid anslutning (ui.js:1098-1102): `rfb.scaleViewport = resize==='scale'`,
`rfb.resizeSession = resize==='remote'`, `rfb.clipViewport = view_clip`,
`rfb.qualityLevel = parseInt(quality)`, `rfb.compressionLevel = parseInt(compression)`.

## 3. Före/efter per nyckel (defaults.json)

| Nyckel | FÖRE | EFTER | Källbevis för valet |
|---|---|---|---|
| `resize` | *(frånvarande → 'off')* | `"scale"` | ui.js:1099/1352: `'scale'` ⇒ `scaleViewport=true` — 1280×720-skrivbordet skalas ner till telefonens skärm. Väljs i UI:s rullgardin "Skalningsläge" (sv.json:49-52). |
| `quality` | *(frånvarande → 6)* | `6` | Värdefält heltal 0–9 (rfb.js:384, reglage vnc.html:244). 6 = uppströms balanserat läge — satt EXPLICIT för att dokumentera mobilvalet och vara robust mot framtida paketlyft som ändrar inbyggt default. |
| `show_dot` | *(frånvarande → false)* | `true` | ui.js:187 + 1757-1759: visar prick när servern inte skickar muspekare — telefonen får alltid synlig pekare. ("Visa prick när ingen muspekare finns", sv.json:64.) |
| `reconnect` | *(frånvarande → false)* | `true` | ui.js:1181-1186: vid tappad anslutning (mobilnät blippar) väntas `reconnect_delay` (5000 ms oförändrat) och ansluts igen automatiskt, med "Avbryt"-knapp synlig (sv.json:79). |
| `view_clip` | *(frånvarande → false)* | **EJ SATT — död nyckel**, se §4 | ui.js:1384-1387 |
| `mandatory.json` | `{}` | `{}` **orörd** | Rättvisa: inget låses — alla val förblir kundens i Inställningspanelen. Identisk med paketet (diff-bevis, §6). |
| `vnc.html` | `lang="en"`, `<title>noVNC</title>` | `lang="sv"`, `<title>AK1A — Skrivbord</title>` | Endast 2 rader ändrade i hela filen (diff-bevis §6) — noll logik. `lang` rättas för skärmläsare/a11y; lokaliseraren rör aldrig `lang` (localization.js:176 FIXME). Titel-gräns: se §5. |

Fairness-notering: defaults gäller vid **första besöket** (tomt localStorage); URL-param
träffar alltid först, kundens egna sparade val respekteras — inget skrivs över i ryggen på kunden.

## 4. Utredning: view_clip är en DÖD nyckel vid skalning

ui.js:1384-1387 (`updateViewClip`): när `resize==='scale'` körs
`UI.forceSetting('view_clip', false); UI.rfb.clipViewport = false;` med kommentaren
*"Can't be clipping if viewport is scaled to fit"*. En `view_clip:true` i defaults.json
skulle alltså omedelbart tjinas av klienten själv och kontrollen avaktiveras — att sätta
den vore ett vilseledande default. Beslut: nyckeln lämnas bort; dokumenterad här i stället.
(Vid framtida `resize:'off'`-läge gäller i stället specialfallen ui.js:1376-1393:
pekenheter utan scrollbar-gutter tvingar `view_clip:true` automatiskt.)

## 5. Utredning: svensk text — vägen finns INBYGGD, ingen gren behövs

**JA, det finns en nåbar i18n-väg och den är redan på:**

- `app/ui.js:23` — `LINGUAS = […, "sv", …]` inkluderar svenska.
- `app/ui.js:60` — `await l10n.setup(LINGUAS, "app/locale/")` + `ui.js:78 l10n.translateDOM()`.
- `app/locale/sv.json` — **komplett ordbok, 82 strängar**: hela Inställningspanelen
  (Inställningar/Delat läge/Endast visning/Skalningsläge/Lokal skalning/Kvalitet/Kvalitet:
  Kompressionsnivå/Visa prick…/Automatisk återanslutning), alla knappar (Anslut/Koppla
  från/Fullskärm/Visa tangentbord/Visa extraknappar/Stäng av/Boota om), dialoger
  (Användarnamn/Lösenord/Godkänn/Neka/Avbryt) OCH statusmeddelanden (Ansluter…/
  Återansluter…/Frånkopplad…).
- Språkval sker i `localization.js:31-90` efter **webbläsarens språklista**
  (`navigator.languages`): kundens svenska telefon ⇒ hela klienten på svenska, automatiskt,
  inklusive titel-attribut och alt-texter (`translateDOM`, localization.js:125-202).

**Därför hardkodas INGEN svensk text i vnc.html**: svenska DOM-texter skulle slåss mot
ordboken (engelsk webbläsare ⇒ blandat språk: svenska paneler + engelska statusmeddelanden).
Inbyggd i18n är det korrekta skiktet — rätta verktyget, noll underhållsgren.

**Var gränsen går (dokumenterat, lämnat orört):**
1. `document.title` skrivs över av klienten: ui.js:21 `PAGE_TITLE = "noVNC"`,
   ui.js:1193 `document.title = PAGE_TITLE` vid start och ui.js:1768-1769
   `"<skrivbordsnamn> - noVNC"` vid anslutning. Titeln i vnc.html syns därför bara
   före JS-start samt i felfalls-skärmen. Att ändra till svensk live-titel kräver
   ui.js-grepp = förbjudet område denna våg.
2. Statusmeddelanden som saknar ordboksträff återger engelsk källsträng (localization.js:114-121).
3. Språket kan inte tvingas via defaults.json — ingen sådan nyckel läses; enda styrningen
   är webbläsarens språklista.

## 6. KVD — utdata (klistrad)

```
$ node -e 'JSON.parse(require("fs").readFileSync("/home/ak1a/desk-web/defaults.json","utf8")); console.log("GILTIG")'
GILTIG

$ cat /home/ak1a/desk-web/mandatory.json
{}

$ sha256sum /home/ak1a/desk-web/{defaults.json,mandatory.json,vnc.html}
708f4705c71b6105de1be7f158d7d698cb24895bb892073d2f1a5b941fd91fa4  defaults.json   (ÄNDRAD)
ca3d163bab055381827226140568f3bef7eaac187cebd76878e0b63e9e442356  mandatory.json  (ORÖRD, identisk med /usr/share/novnc)
03d8c8eb5fdb5134fc65495a23734b360499271e896f8d8d1111c98f9b898cbd  vnc.html       (ÄNDRAD: 2 rader — lang + title)

$ curl (efter ändring, utan auth — VÄNTAT 401)
https://lab.ak1nvestor.com/desk/vnc.html        → HTTP 401
https://lab.ak1nvestor.com/desk/defaults.json   → HTTP 401
(före ändring samma: vnc.html 401, defaults.json 401, app/locale/sv.json 401 — auth-väggen hel)

$ diff /usr/share/novnc/vnc.html /home/ak1a/desk-web/vnc.html   (komplett avvikelse)
2c2   <html lang="en"  →  <html lang="sv"
16c16 <title>noVNC</title>  →  <title>AK1A — Skrivbord</title>
(inga andra skillnader — logik, core/, vendor/ orörda)
```

Paketet `/usr/share/novnc` orört (där säkerhetsdiffarna ovan kördes läs-endast).
websockify serverar desk-web som statiska filer — ändringarna är LIVE utan omstart.

## 7. Juridik

Ren gränssnitts konfiguration (skalning/kvalitet/musprick/återanslutning + svenska
etiketter) — inget finansiellt innehåll, inga råd (2007:528 berörs ej). Ingående
användaruppgifter hanteras av klientens egna dialoger oförändrat; GDPR/kakor: noVNC
lagrar endast lokala inställningar i webbläsarens localStorage (webutil.js:142-151),
inga nya kakor sätts av denna ändring.

## 8. Rollback

`defaults.json` → `{}` och vnc.html-rad 2/16 tillbaka till `lang="en"`/`noVNC`
(sha256 ovan är nya läget; paketet /usr/share/novnc har originalvärdena kvar som referens).
