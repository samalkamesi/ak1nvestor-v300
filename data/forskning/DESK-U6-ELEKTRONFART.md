# DESK-U6 — Elektronfart-kartan: Chromium/Electron-flaggor på GPU-lös X-server (Xvnc)

**Typ:** Forskningsrapport / beslutsunderlag (INGEN implementering —läs-ytor endast).
**Datum:** 2026-09-28 · **Agent:** fabriksagent BYGGARE, uppdrag v201-u2.
**Ägarskap:** Denna rapport är uppdragets enda leverans. Jag har INTE ändrat setting.json, serviceenheten, processer eller ~/.zcode — allt nedan är passiv läsning.

**Sammanhang:** ZCode-3.14.3-linux-x64.AppImage (Electron 41.0.3, Ubuntu 26.04 — crashpad-annotation `--annotation=prod=Electron --annotation=ver=41.0.3`, ps 2026-09-28 19:36) körs via `/etc/systemd/system/zdesk-zcode.service` med `ExecStart=/home/ak1a/ZCode-3.14.3-linux-x64.AppImage --no-sandbox`, `DISPLAY=:10` (Xvnc), `Restart=always`, `RestartSec=5`. Ingen GPU finns på maskinen — renderingen sker i programvara.

---

## 1. Källor (alla uttömmande för KVD)

| # | Källa | Hur läst |
|---|-------|----------|
| K1 | Aktiv AppImage-mount `/tmp/.mount_ZCode-fALEG7` (5 mounter finns; fALEG7 är aktiv — crashpad-barn PID 446831 pekar dit, `ps aux` 19:36) | `ls -a /tmp \| grep mount`, `ps aux` |
| K2 | `app.asar` (326 913 762 byte) i K1 — appens JS-källa | `strings -n 5` → 4 432 772 rader / 299,7 MB text, sedan `grep -aoE` |
| K3 | Electron-binären `/tmp/.mount_ZCode-fALEG7/zcode` — Chromiums C++-flaggtolk (switch-tabell) | `grep -aoE` direkt på binären |
| K4 | Mountens filförteckning | `ls /tmp/.mount_ZCode-fALEG7/` |
| K5 | `~/.zcode/v2/setting.json` | `cat` |
| K6 | journald för enheten `zdesk-zcode.service` | `journalctl -u zdesk-zcode.service` (passivt) |
| K7 | `/etc/systemd/system/zdesk-zcode.service` | `cat` |

## 2. Fynd A — Appens EGEN flaggyta (vad den känner och styr)

**A1. Vitlista för argument (K2, ordagrant ur app.asar):**
```js
aW=new Set(["--no-sandbox","--disable-gpu","--disable-software-rasterizer"]),
cW=["--use-gl=","--use-angle=","--disable-features=","--enable-features="];
function uW(e){return aW.has(e)||cW.some(t=>e.startsWith(t))}
s(uW,"isAllowedAppImageDeepLinkArg");
```
Appen har alltså en egen vitlista där just `--disable-gpu`, `--disable-software-rasterizer`, `--use-gl=`, `--use-angle=`, `--disable-features=`, `--enable-features=` är kända och vidarebefordringsbara argument (deep-link-omstart via `x-scheme-handler/zcode`). Detta är utvecklarnas egen deklarerade flaggyta — argumenten är "förstklassiga medborgare" i appens start.

**A2. Inställningen `desktopChromiumHardwareAccelerationEnabled` (K2, ordagrant):**
```js
function Sf(e,t){let r=t===void 0?BI():vf(t);return r||e.disableHardwareAcceleration(),r}
s(Sf,"applyEarlyChromiumHardwareAccelerationBootstrap"); Sf(NI);
```
Medhörande: `readBootstrapChromiumHardwareAccelerationEnabledFromDisk` läser `getSettingsFile()` = `<homedir>/.zcode/v2/setting.json` (K2: `Zs(){return go(of(),".zcode","v2")} … Tt(){return go(Zs(),"setting.json")}`; sökvägen bekräftad av K5/K6 — journalen 18:50:00 visar `[settingService] writing settings to: /home/ak1a/.zcode/v2/setting.json`). Default är `true` (`boolean"?t:!0` i `extractBootstrap…`). Logik: **läs setting.json tidigt vid start → om värdet är falsy → `app.disableHardwareAcceleration()` (Electron-API) FÖRE fönster skapas.** Med nuvarande `true` (K5) görs alltså INGET — Chromium får försöka GPU på Xvnc, misslyckas, och faller tillbaka per-kontext.

**A3. Appens egen dokumentation av växeln (K2, UI-strängar, ordagrant):**
> `settings.desktopChromiumHardwareAcceleration`: "Chrome hardware acceleration"
> `settings.desktopChromiumHardwareAccelerationDescription`: "Turn this off to work around blank windows, crashes, or rendering issues caused by some GPUs or drivers. Restart the app to take effect."
> `settings.desktopChromiumHardwareAccelerationSavedHint`: "…setting saved. Restart…"

Inställningen finns alltså i appens inställningspanel, ändras via appens egen `settingService` (K6: `[rpc:call] setting.update OK`), och kräver omstart — exakt som ExecStart-vägen.

**A4. Utvecklarnas eget mönster (K2):** appens inbyggda headless-Chrome-hjälpare startas med `["--headless=new","--disable-gpu","--disable-extensions",…]` — dvs. i den GPU-lösa hjälparen är `--disable-gpu` redan appens standardlösning. Huvudfönstret saknar däremot den.

## 3. Fynd B — Chromium-sidan (binärens switch-tabell, K3)

`grep -aoE` på `/tmp/.mount_ZCode-fALEG7/zcode` ger träffar i C++-lagret för: `in-process-gpu` (2), `disable-software-rasterizer` (2), `use-gl` (1), `use-angle` (1), `ignore-gpu-blocklist` (1), `disable-renderer-backgrounding` (1), `disable-gpu-compositing` (1), `disable-backgrounding-occluded-windows` (1), `disable-background-timer-throttling` (1). Alltså: dessa flaggor tolkas av Chromium även när strängen inte finns i app.asar — Electron delar huvudprocessens kommandorad med Chromium. **Skillnaden mot A1:** A1-flaggorna är dessutom app-granskade (vidarebefordras vid deep-link-omstart); övriga fungerar vid systemd-start men rensas bort om appen någon gång startar om via deep-link.

## 4. Fynd C — Miljöbevis (Xvnc har ingen GPU)

- **K4:** mounten bär `libvk_swiftshader.so`, `vk_swiftshader_icd.json`, `libEGL.so`, `libGLESv2.so`, `libvulkan.so.1` — Electron 41 skeppar SwiftShader (CPU-Vulkan-renderare). GPU-"processen" på denna maskin är SwiftShader-programvara.
- **K6 (journalen sedan 2026-09-27):** 11× `ERROR:gpu/ipc/client/command_buffer_proxy_impl.cc:287] ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.` (bl.a. 18:59:42, 19:06:22); 1× `ERROR:gpu/command_buffer/service/context_group.cc:138] ContextResult::kFatalFailure: WebGL1 blocklisted`; 9× `ERROR:components/viz/service/display/display.cc … Frame latency is negative` (−0,001 till −0,102 ms — mjukvarukompositorns tidartefakter). Renderare försöker alltså upprepade gånger skapa GPU-kommandobuffertar som dör.
- **K6 (minnesraderna 18:55–19:38):** `ws.gpu` = 143 704–150 372 kB RSS — en helt programmässig "GPU"-process kostar stadigt ~140–150 MB, plus `ws.chromium_other` ~80 MB. Total CPU-rendering-overhead att attackera: ~220 MB och OmniContext-försöken ovan.
- **K6 (omstarter):** 54 `reason=first`-rader sedan midnatt (main- och zcode-host-processer); huvud-PID:ar byts med 5–20 minuters mellanrum på kvällen (431295→433395→436438→440206→446480). `Restart=always` håller appen vid liv — en felvald flagga återhämtas alltså av sig själv inom ~5 s, MEN en flagga som kraschar vid varje start = omstartsloop var 5:e sekund (därav katastrof-markeringen nedan).
- **Sidospår (ej fart):** 106× dbus `bus.cc`-fel + 46× `object_proxy` (servern saknar sessionsbus — normalt headless), 2× nätverkstjänst-krasch, 6× GCM `DEPRECATED_ENDPOINT`.
- **shm (K2):** asar-strängarna innehåller `libxcb-shm` (14), `shmop` (9), `shmwrite` (5) — Chromiums X11-bindningar för MIT-SHM (skärmdels-överföring via delat minne). Ingen appstyrbAR flagga för shm finns i appens yta; Xvnc:s MIT-SHM är redan den aktiva transporten. **Slutsats: shm är inget åtgärdsbart spår via flaggor** — det arbete som kan sparas ligger på GPU-/komposit-sidan.

## 5. Flaggkandidater (3–6 st, källbelagda)

| # | Kandidat | Källbelägg | Förväntad effekt | Risk |
|---|----------|-----------|------------------|------|
| 1 | **Inställningsvägen: `desktopChromiumHardwareAccelerationEnabled: false`** — slå av "Chrome hardware acceleration" i appens inställningspanel + omstart (eller låt appens settingService skriva filen via dess eget RPC) | A2 + A3 (appens egen kod och dokumentation) | `disableHardwareAcceleration()` körs före fönster skapas: Chromium hoppar direkt till programvarurendering utan misslyckade GPU-kontext-försök; färre `kTransientFailure`; GPU-processens ~145 MB försvinner eller krymper kraftigt | **LÅG** — appens egen dokumenterade nödutgång för just "GPUs or drivers"-problem; fullt återställningsbar i samma panel |
| 2 | **`--disable-gpu` på ExecStart** | A1 (appens vitlista) + A4 (utvecklarnas eget mönster i headless-hjälparen) | i princip samma läge som kandidat 1 via kommandorad: GPU-processen startas inte, komposit/raster sker i processerna direkt | **LÅG** — men notera: tillsammans med kandidat 1 redundant; välj EN av dem först |
| 3 | **Bakgrundspaketet: `--disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling`** | K3 (alla tre i switch-tabellen) | Hindrar Chromium att "gasa ner" fönster den tror är skymda/tomma och att strypa timers — appen är en agent som SKA jobba även när noVNC-klienten är frånkopplad och fönstret övergs av WM:n. Ingen renderingsväxling alls | **LÅG** — ren beteendeförändring (CPU-timers), kan inte bryta renderingen; möjlig sidoeffekt: något högre vila-CPU |
| 4 | **`--in-process-gpu`** | K3 (switch-tabell, 2 träffar) | GPU-arbetet (här: SwiftShader-CPU) körs i huvudprocessen i stället för separat process → sparar IPC och buffertkopiering per frame; ~145 MB processidentifiering försvinner | **MEDEL** — en krasch i GPU-lagret tar ner HELA appen (i stället för bara en flik/process); med Restart=always är återhämtning 5 s men omstartsloopen kan bli tät |
| 5 | **`--use-angle=swiftshader` (alternativt `--use-gl=…`-värde)** | A1 (prefixet vitlistat) + K4 (SwiftShader-filerna medföljer) | Tvingar ANGLE rakt på SwiftShader-backend utan att först provköra EGL/GL-X-vägen som idag misslyckas (C-fynden) | **OKLART/EXPERIMENTELL** — byggens exakta giltiga värden för Electron 41 är inte belagda i källorna; fel värde riskerar startfel. Provas ENDAST efter 1–3 och med journalen öppen |
| ⚠️ | **FALSK VÄN: `--disable-software-rasterizer`** | A1 (vitlistad — men det är INTE en rekommendation) | **KATASTROF-risk:** flaggan stänger av just SwiftShader-programvaru-rasterizern — på en GPU-lös X-server är den ENDAST skadlig (tomma/blanka fönster är den kända följden). Appen vitlistat den för deep-link-vidarebefordran i ALLMÄNNA fall, inte för denna miljö | **ALDRIG användas här** |

Avvisade: `--ignore-gpu-blocklist` (meningslös utan GPU att avblockera), `--disable-gpu-compositing` (överflödig när kandidat 1/2 redan lagt hela GPU-spåret i programvara), `--ozone-platform` (X11 är redan aktiv väg på Xvnc).

## 6. Föreslagen verkställighet (root-rond — jag implementerar INTE)

**Rekommenderad ordning:** steg I först (noll systemingrepp), mät, och ta steg II endast om effekten inte räcker. Kandidat 3 (bakgrundspaketet) kan kombineras med vilken som helst.

**Steg I — inställningsvägen (sämst ingrepp = bäst först):**
Slå av "Chrome hardware acceleration" i ZCodes inställningspanel och starta om appen (`systemctl restart zdesk-zcode`). Appens settingService skriver själv setting.json (K6 18:50). Om filvägen väljs manuellt: ta backup först (`cp ~/.zcode/v2/setting.json ~/.zcode/v2/setting.json.bak-u6`), ändra ENDAST `"desktopChromiumHardwareAccelerationEnabled": true → false`, omstart.
*Återställning:* växla tillbaka i panelen (eller `cp setting.json.bak-u6 setting.json`) + omstart.

**Steg II — ny ExecStart-rad (om steg I ej räcker):**
```ini
ExecStart=/home/ak1a/ZCode-3.14.3-linux-x64.AppImage --no-sandbox --disable-gpu --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling
```
(alla fyra nya argumenten är källbelagda: `--disable-gpu` i appens vitlista A1, övriga tre i binärens switch-tabell K3.)
*Verkställ:* `systemctl daemon-reload && systemctl restart zdesk-zcode`.
*Återställning:* sätt tillbaka originalraden `ExecStart=/home/ak1a/ZCode-3.14.3-linux-x64.AppImage --no-sandbox` + `daemon-reload` + `restart` (originalraden är protokollförd i K7 ovan).
*Stoppregel:* om appen efter en flaggändring inte visar fönster inom ~30 s eller journalen visar omstartsloop var 5:e sekund → återställ OMEDELBART enligt ovan; låt aldrig ett experiment stå kvar över natten.

**Mätprotokoll före/efter (beviskrav):**
1. `journalctl -u zdesk-zcode --since <t> | grep -c 'kTransientFailure'` per timme (idag 11/dygn).
2. `ws.gpu=`-värdet i minnesraderna (idag 143,7–150,4 MB) och `ws.chromium_other` (~80 MB).
3. `reason=first`-antal per timme (omstarter — ska inte öka).
4. Subjektiv: noVNC-sidans svarstid vid scroll/skrift i chatten (kundens mått).
5. `Frame latency is negative`-rader (idag 9/dygn) — skall helst försvinna med färre komposit-omstartsförsök.

## 7. Slutsats

Settingen `desktopChromiumHardwareAccelerationEnabled: true` betyder — källbelagt via appens egen bootstrap-kod — att appen INTE anropar `disableHardwareAcceleration()`, alltså låter den Chromium provköra GPU på en Xvnc som inte har någon: GPU-processen (SwiftShader, ~145 MB) lever, renderare försöker skapa kommandobuffertar som dör (11 kTransientFailure/dygn), WebGL blocklistas och viz-kompositorn rapporterar negativa frame-latenser. Appen har själva byggt två kurader: en dokumenterad inställningsväg (kandidat 1) och en vitlista där `--disable-gpu` är förstaklassigt argument (kandidat 2). Utöver detta är bakgrundsgasningen (kandidat 3) en billig, renderingsneutral förbättring för en agent som måste arbeta även osedd. Katastrofvarningen gäller `--disable-software-rasterizer` — den heter som ett saneringsmedel men tar bort den ende renderaren denna server har.

RESULTAT: 5 flaggkandidater (säkra:3 att prova först)
