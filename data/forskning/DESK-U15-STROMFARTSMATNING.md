# DESK-U15 — Strömfartsmätning (passiv): konkreta siffror på desk-strömmen

**Datum:** 2026-09-28 ~22:10–22:15 (serverlokal tid) · **Agent:** v204-u2 (fabriksagent, BYGGARE)
**Uppdrag:** Kundens "snabbare" + ändrade kvalitetsordning (nu `quality 3, compress 2`, viloläge 960×540) saknar siffror: hur många Mbit/s flödar vid aktiv användning? Passiv mätning — inga klienter startades, ingen processpåverkan.

## Sammanfattning (3 rader)

1. **Ingen kund var inne under mätningen** (bevis nedan) → aktiv Mbit/s kunde INTE mätas passivt; lugn-nivån är ~0 Mbit/s och hela kedjan fram till strömmen är mätt och snabb.
2. Teoretisk takbelastning för nuvarande 960×540-ström är **12,4 Mbit per helbild okomprimerat** — praktisk aktiv ström efter tight+zlib (quality 3/compress 2) uppskattas till **enstaka Mbit/s**, långt under telefon-5G:s 20–100 Mbit/s.
3. **Flaskhalsen är inte bandbredden** utan (i fall aktiv drift) latens + klientens avkodning + skärpan i kvalitetsordningen — och det största konkreta glappet är att vi saknar mätinstrument vid kundens besök (rekommendation nedan).

## 0. Förutsättningar och metodavvikelser (ärlighet först)

- **Flödeskedja (verifierad i drift):** telefon/webbläsare → `https://lab.ak1nvestor.com/desk/` (nginx, basic auth, WebSocket-upgrade) → `127.0.0.1:6080` (websockify 0.12+, `--heartbeat 30`, PID 351439, root, uppe sedan 15:05) → **loopback port 5910** → Xvnc `:10` (PID 478952, ägare ak1a, `-geometry 960x540 -depth 24 -localhost -SecurityTypes None`, startad 20:58). Källa: `ps`, `ss -tlnp`, `/etc/nginx/sites-available/ak1a` (location `/desk/` → `proxy_pass http://127.0.0.1:6080/`).
- **Kvalitetsordning på klienten:** `/home/ak1a/desk-web/defaults.json` = `{"resize":"remote","quality":3,"show_dot":true,"reconnect":true,"compress":2}` — bekräftar kontexten (remote-resize verkställt; noVNC 1.6.0 enligt desk-web/package.json).
- **Metodavvikelse 1:** `tcpdump` **finns inte installerat** på servern (`/usr/bin/tcpdump: No such file or directory`) och sudo saknas för fabriksagenten → i stället **passiv läsning av `/proc/net/dev`** (loopback-räknare, noll paketfångst, noll -w-filer, noll processpåverkan). Notera lo-semantiken: varje byte räknas i både rx och tx → **unik bytesomhet = rx** (annars dubbelräkning).
- **Metodavvikelse 2:** websockify/Xvnc-loggar ligger i systemd-journal som fabriksagenten inte får läsa (kräver adm/systemd-journal) → senaste kundbesöket kunde ej fastställas ur logg. Kompenserat med live-socketbevis + process-IO (nedan).
- **Ingen klient inne — BEVIS:** `ss -tn | grep -E ":6080|:5910"` = **tomt** (inga etablerade anslutningar; websockify öppnar upstream till 5910 först när en klient ansluter). Därför blev alla tre mätfnöstren "lugn"-läge och "aktiv" kunde inte mätas — detta dokumenteras som faktum, inte som mätvärde.

## 1. Mätning A — loopback (hel lo, 3 fönster à 10 s)

Script: node, läser `/proc/net/dev` före/efter, rx-delta = unika byte (lo dubbelräknar rx/tx).

Råa värden (klistrade):

```
fonster 1: 10.1s | rx-delta 1938 byte | tx-delta 1938 byte | 0.002 Mbit/s (unik bytesomhet pa lo)
fonster 2: 10.0s | rx-delta 1866 byte | tx-delta 1866 byte | 0.001 Mbit/s (unik bytesomhet pa lo)
fonster 3: 10.1s | rx-delta 0 byte    | tx-delta 0 byte    | 0.000 Mbit/s (unik bytesomhet pa lo)
```

**Tolkning:** lugn = 0,000–0,002 Mbit/s. De ≤194 byte/s är övrig systemtrafik på loopback (inte VNC — port 5910 hade noll etablerade sockets, se bevis ovan). Noll VNC-trafik i vila stämmer med noVNC:s inkrementella modell: inga fbUpdateRequest → inga bilder skickas.

## 2. Mätning B — Xvnc-processens IO/CPU (passiv kumulativ räknare sedan start 20:58)

Råa värden: `/proc/478952/io` → `rchar: 552105` · `wchar: 26655428` · `syscr: 443` · `syscw: 24625`; CPU `00:00:44` på 72 min (~1,0 %).

Beräkning: 26 655 428 byte / 4 340 s = 6 142 byte/s = **0,049 Mbit/s** ut-snitt sedan start (blandat X11-replies till Electron-appen på :10 + VNC; ingen VNC-klient har varit uppkopplad enligt socketbeviset). → Servern Producerar i praktiken stillastående ungefär noll.

## 3. Mätning C — HTTP-timings mot /desk-kedjan (curl -w, 5 st/mål, median)

Råa värden (alla 5 körningar per mål, klistrade):

```
A http://127.0.0.1:6080/vnc.html (websockify web-rot)
  run1 200 total=0.917233 | run2 200 total=0.657397 | run3 200 total=0.266538
  run4 200 total=0.424798 | run5 200 total=0.842530 | size=21529 B
  MEDIAN: connect=0.001s tls=— starttransfer=0.657s total=0.657s speed=32748 B/s
B https://lab.ak1nvestor.com/desk/ (nginx+TLS+auth; 401 utan cred är väntat och mäter hela kedjan fram till auth-beslutet)
  run1 401 total=0.112443 | run2 401 total=0.047398 | run3 401 total=0.104432
  run4 401 total=0.174244 | run5 401 total=0.188296 | size=188 B
  MEDIAN: connect=0.005s tls=0.057s starttransfer=0.112s total=0.112s
C https://lab.ak1nvestor.com/ (referens, huvudsajtens startsida)
  run1 200 total=0.761843 | run2 200 total=0.553634 | run3 200 total=0.595006
  run4 200 total=0.559063 | run5 200 total=0.420488 | size=106230 B
  MEDIAN: connect=0.033s tls=0.357s starttransfer=0.559s total=0.559s speed=190014 B/s
```

**Tolkning:** nginx+TLS-ledet till /desk/ är snabbt (median 0,112 s inklusive TLS-påslag 0,057 s — från servern själv). websockify:s leverans av noVNC-sidan har spridning 0,27–0,92 s (enkeltrådig Python-webbrot; märks vid kall start, irrelevant under strömning). Referensen visar att huvudsajtens HTML levereras med 190 kB/s ≈ **1,5 Mbit/s** — dvs. vanlig sidhämtning i sig är i storleksordningen av en hel VNC-ström.

## 4. Klientsidan (noVNC): statistik-yta

Sökta i `/home/ak1a/desk-web/`: `app/ui.js`, `vnc.html`, `core/rfb.js` efter `stats|bitrate|latency|Statistics` → **ingen Connection Stats-yta finns i denna kopia** (noVNC 1.6.0-bas, D3-fork; endast FBU-intern logik i rfb.js träffas). Panelen har kvalitets-slider 0–9 (nu 3 via defaults.json) och kompressions-slider (nu 2). Slutsats: kunden kan INTE se strömmens Mbit/s i UI:t idag — mätglapp, inte hastighetsglapp.

## 5. Beräkningar: vad SKULLE strömmen kosta vid aktiv användning?

- Rå helbild: 960 × 540 pixlar × 3 byte (depth 24) = **1 555 200 byte = 12,44 Mbit per full framebuffer**.
- Vid hypotetiska 10 fps fullbilder okomprimerat: ~124 Mbit/s — men så fungerar inte VNC: noVNC begär **inkrementella** uppdateringar och Xvnc kodar med tight+zlib/JPEG (därför `quality`/`compress`).
- Skrivbordsinnehåll (Z-Code: text, terminal, mest statiska ytor) komprimeras typiskt 10–40×; aktivt skrivande ändrar små rektanglar. Praktisk nivå för 960×540 skrivbord: **~0,5–5 Mbit/s vid aktiv användning, <0,1 i vila** (uppskattning, ej mätt — se §7).
- Referens: telefon-5G typiskt **20–100 Mbit/s** nedströms → även ett pessimistiskt 5 Mbit/s-strömmande lämnar **4–20× marginal**.

## 6. Dom — vad är flaskhalsen?

| Kandidat | Belägg | Dom |
|---|---|---|
| Bandbredd server→telefon | Teoretisk tak 12,4 Mbit/helbild; praktiskt enstaka Mbit/s; 5G 20–100 | **Inte flaskhalsen** |
| Server-KPU/bildbygge | Xvnc 1,0 % CPU i vila; 8 GB RAM-system | Ej mätt under last, låg risk |
| Nätverkslatens (RTT kund↔Contabo) | Påverkar "kännsla" per tangenttryck; mäts ej passivt | **Trolig huvudfaktor för "långsam"** |
| Klientens avkodning i mobil-Canvas | JPEG+zlib per rektangel på telefon-CPU | **Trolig medfaktor** |
| Skärpa (quality 3 = låg JPEG-kvalitet) | Suddigare text upplevs som "sämre/långsammare" läsning | Reglage, se §7 |

## 7. Rekommendation — nästa konkreta reglage

1. **Instrumentera först (lägsta kostnad, störst info):** bygg ett litet driftscript (evighetsmotor/vakten kan äga det) som — med U15:s metod — läser `/proc/net/dev`-rx och kontrollerar `ss -tn port 5910`: när en klient ÄR uppkopplad loggas Mbit/s per 10 s-fönster till `data/vakten/`. Nästa kundbesök ger då ÄKTA aktiva siffror utan ny dispatch. (Alternativ/komplement: koppla in noVNC:s Connection Stats-panel i D3-forken.)
2. **Därefter quality 3 → 6 (noVNC-standard) i `defaults.json`:** bandbreddsmarginalen mot 5G är stor (4–20×), datamängden ökar måttligt vid JPEG-kvalitetshöjning, och skarpare terminaltext är den enda parameter som direkt påverkar läsbarhet vid 960×540. Vänta på mätetal från steg 1 om kundens upplevelse handlar om "respons" snarare än "skärpa".
3. **Rör INTE compress (2) och storlek (960×540) än:** compress 2 är rimlig zlib-nivå; mindre yta skulle sänka skärpan ytterligare (U11/U12-paritetsarbetet landade remote-resize exakt för att telefonen ska begära SIN upplösning — sänk inte viloläget utan ny breakpoint-data).

## KVD

- Råa mätvärden klistrade: §1 (3 fönster), §2 (io+CPU), §3 (5+5+5 curl-körningar) · Beräkningar visade: §2 (snitt), §5 (helbild/fps/komprimering).
- Metodavvikelser redovisade ärligt (tcpdump saknas; journal låst; ingen klient inne → aktiv mätning omöjlig passivt).
- Ägarskap hållet: ENDAST detta protokoll skapades/ändrades; inga processer påverkade; inga -w-filer; inga klienter startade.

RESULTAT: 0,000–0,002 Mbit/s vid lugn (ingen klient inne under mätningen; aktiv nivå kunde ej mätas passivt, teoretisk tak 12,4 Mbit/helbild och uppskattad aktiv ström ~0,5–5 Mbit/s vs 5G 20–100) — flaskhals är INTE bandbredden utan latens+avkodning, och det akuta glappet är mätinstrument vid kundens nästa besök.
