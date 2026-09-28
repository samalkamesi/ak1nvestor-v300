# DESK-U13 — Paritetssyntes: organen diskuterar (PROVISIONELL v1)

**Fabrikuppdrag:** v203-u3 (manifest `v203-desk-paritet-1789628600`, rad 23-27) ·
**Roll:** GRANSKARE — styrelsens sammanfogande organ · **Datum:** 2026-09-28 21:31 UTC
**Kundorder:** "be ai styrelse organen diskutera med varandra" (manifestets titelrad).
**STATUS: PROVISIONELL.** Båda källprotokollen saknades vid läsning — se §0.

---

## 0. Ärlighetsrapport: båda källprotokollen saknas (dokumenterat)

Uppdragets metod steg 1 säger: läs `DESK-U11-APPRESPONSIVITET.md` och
`DESK-U12-TELEFONPARITET.md`; saknas någon — VÄNTA inte, dokumentera, bygg
på det som finns. **BÅDA saknas:**

| Källa | Läge kl. 2026-09-28 21:31:52 UTC | Bevis |
|---|---|---|
| DESK-U11 (kollega A, v203-u1) | **FINNS EJ** | `ls data/forskning/DESK-U1[12]*` → exit 2 (inga träffar) |
| DESK-U12 (kollega B, v203-u2) | **FINNS EJ** | samma sond |
| Fabrikens körstatus | u1+u2+kam pågår, 0 klara | statusfil: `startad 2026-09-28T21:25:30.174Z`, `status: "pågår"`, `klara: []`; utdata-loggar för u1/u2 = 0 byte |

Kollegorna och jag körs i SAMMA fabriksomgång (startad 6 minuter före min
sond) — deras rapporter landar efter min tidsram. **KVD-konsekvens, ärligt
bokförd:** kravet "båda källprotokollen citerade med radreferenser" kan
EJ uppfyllas denna omgång. I stället citeras kollegornas UPPDRAG (manifestet,
rad 13 resp. 20) samt det BEFINTLIGA belägget i DESK-serien U1-U10,
tjänstefilen r311 och AGENTS.md. Grinden kör U13 igen när A+B landat →
syntes v2 (steg 1 i §5).

---

## 1. Frågorna kollegorna forskar (ur manifestet — inte deras fynd)

**A = U11, appens egna responsiva krafter** (manifest rad 13): kan
ZCode-appen GÖRA MER själv vid smal bredd — responsive breakpoints,
compact/mobile-läge, sidebar-kollaps? Källor de ska läsa: app.asar-strängar
(media queries, brytpunktssiffror 480/640/768/900/1024), `~/.zcode/v2/
setting.json` (desktopZoomLevel-gränser; appens EGEN mobilvy för inbäddad
webbläsare 393x852 — finns motsvarande för HUVUDfönstret?). Slutsats de
ska ge: kan 960x540 — eller ännu smalare, t.ex. 720x405 — rendera mer
mobil-likt, och vilken bredd är optimal?

**B = U12, arkitekturerna** (manifest rad 20): (1) RANDR/remote-resize —
stödjer Xvnc runtime-upplösningsändring; noVNC `resize=remote` — kan
TELEFONEN be om SIN upplösning? (2) Dubbelt skrivbord: Xvnc :11
(telefongeometri) + andra AppImage-instansen (Electron-singletonlåset,
`--user-data-dir`, delad auth, RAM-kostnad). (3) Alternativet /chat-bryggan
(ttyd+tmux+CLI) som komplement. De ska ranka komplexitet/kostnad/risk/
närhet till "nativt" och rekommendera EN huvudväg + EN reserv.

---

## 2. Befintligt belägg för A:s fråga (appens krafter — vad DESK-serien redan vet)

1. **Grundproblemet är MÄTT:** "skrivbordet är 1280×720 (mätt, rotfönster);
   telefon-porträtt ~390 px bred → skalfaktor ≈ 0,30 → apptext ~4-5 px"
   (DESK-U2-MOBILFELJAKT:104). Detta är den mätta roten till kundens
   "allt ser litet ut".
2. **Appens enda belagda "responsiva kraft" i serien = Chromium-zoom:**
   pinch-gesten håller ner Ctrl och skickar scrollhjul till servern —
   den zoomar ZCode-appens EGET UI (Chromium-zoom), inte noVNC-fönstret
   (DESK-U2:22-24, rfb.js:1431-1444). Zoomen riskerar att leva kvar mellan
   sessioner (U2 kunde inte testa empiriskt — ärligt redovisat där).
   Det är ett ZOOM-reglage, inte ett LAYOUT-reglage.
3. **Kuren hittills är GEOMETRI, inte app-krafter:** r311 satte
   `-geometry 960x540` med motivationen "telefonens logiska bredd (~0,8x
   skala i liggande = LÄSBAR text, tryckbara knappar) + 4x färre pixlar
   än full HD (snabbare ström). Datorbläddraren zoomar vid behov"
   (`/etc/systemd/system/zdesk-xvnc.service` rad 7-10). Alltså: serien har
   hittills löst läsbarheten UTAN appens breakpoints — genom att göra
   skrivbordet telefonstort.
4. **Lucka (väntar på U11):** inget befintligt protokoll belägger appens
   interna breakpoints, compact-läge eller sidebar-kollaps. Påståenden
   om "appen kollapsar vid X px" får EJ göras innan U11 landar.

## 3. Befintligt belägg för B:s fråga (arkitekturerna — vad serien redan vet)

1. **resize "remote" är källbelagt som HÖG mobilvinst / MEDEL risk**
   (DESK-U5-STREAMFART §5 reglage 2, rad 118-131): mekanismen genomläst —
   `rfb.resizeSession` (ui.js:1103), klienten skickar SetDesktopSize med
   FÖNSTRETS storlek (rfb.js:795-830, inbyggd rate-limit 100 ms), Xvnc
   accepterar (AcceptSetDesktopSize default=on); telefon-porträtt ≈ 390 px
   ⇒ ~2,6× färre pixlar än 1024-bredd. Risk: "skrivbordets WM-layout
   flyttas när framebuffer ändras; därför bäst per-enhet: bokmärke
   `?resize=remote` på telefonen, defaults.json orörd för datorn"
   (U5:128-130).
2. **Beslutet att LÅTA BLI står dokumenterat:** v202-u3 verkställde endast
   risk-LÅG-reglage och lämnade resize:remote orörd med hänvisning till
   just U5:s risk-MEDEL + bokmårådet (DESK-U10-STREAMIMPLEMENTERING §4,
   rad 67 — noll-risk-alternativet bokmärket noted där).
3. **Klientens tre lägen + en död nyckel:** `resize` = 'off'/'scale'/
   'remote' (DESK-U4-NOVNC-DEFAULTS:30, ui.js:1099-1100); default satt
   till "scale" (U4:49); `view_clip` tvingas false när scale är på — död
   nyckel (U4:60-68, ui.js:1384-1387).
4. **Klickmatematiken sätter tak för klienttricks:** yttre skalning
   (body.zoom OCH transform:scale) är GENOMRÄKNAT förkastad — den bryter
   noVNC:s klickinvariant "canvasens synliga bredd == display.scale × vp.w"
   (clientToElement + absX), tryck landar 30 % snett vid 1,3× (DESK-U8-
   VYZOOM:26-40). Vy-zoom byggde i stället på källans EGNA primitiver
   clipViewport + Display.scale med korrekt klickmatematik (U8:41-56,
   steg 0.85-1.6, rad 64). ALLA framtida klientidéer måste hålla denna
   invariant.
5. **Sessionsdelning är default:** `shared: true` är klientens inbyggda
   default (U4:33) — flera klienter kan ansluta till SAMMA display :10.
6. **Kedjan och komplementen:** nginx → websockify (:6080) → Xvnc :10 +
   openbox (maximerar allt) + ZCode-AppImage (DESK-U1-DESKHALSA:5, kontroll
   x-geometri `_NET_WORKAREA` rad 21-22). /chat-bryggan (ttyd+tmux+CLI)
   och /studio-webchatten står REDAN som telefonvänliga vägar till samma
   konto (AGENTS.md, sektionen Arkitektur: "Kundens tre chattvägar").
7. **Luckor (väntar på U12):** inget protokoll belägger RANDR/
   runtime-resize på burken, Electron-singleton/`--user-data-dir` för en
   andra AppImage-instans, delad auth-API-nyckel mellan instanser, eller
   RAM-kostnaden för en andra instans. Rankningen av arkitekturerna är
   U12:s leverans.

---

## 4. Provisionell syntes — var håller belägget samman, var spänner det?

### Sammanfatt (där serien är enig)

1. **"Litent på telefonen" är en pixelförhållande-fråga, mätt** (U2:104:
   0,30×) — och BOTH kurer hittills har varit geometri/klientskalning,
   aldrig appens egna layout-krafter (r311, U4, U8).
2. **Läsbarhet och fart är SAMMA rätning:** smalare framebuffer = större
   rendrerad text OCH mindre data (r311 "4x färre pixlar", U5 reglage 2
   "~2,6× färre"). Ingen avvägning mellan dem behövs — smalare vinner
   bägge, fram till gränsen där appens UI slutar fungera (okänd gräns =
   U11:s fråga).
3. **Per-enhet slår globalt i seriens egna beslut:** r311 ("datorbläddraren
   zoomar vid behov" — telefonen är normen) och U5:s bokmåråd ("telefonen
   remote, datorns defaults orörda") pekar åt samma håll: telefonens behov
   får diktera, datorn kompenserar billigast.
4. **Klientens kanaler är slutkjorda:** de redan bevisade klientkrafterna
   (scale-läge U4:49, vy-zoom U8, quality U10:30) har tagit sitt ansvar;
   nästa våg av "ZCode-nativt" måste komma från APPlagret (U11) eller
   ARKITEKTURlagret (U12) — inte fler klientknappar.

### Skiljaktigheter och spänningar (min bedömning på belagt underlag)

1. **Fast geometri (r311) vs per-klient-geometri (remote) i en DELAD
   display.** r311 valde EN fast geometri för alla — bevisat läsbart på
   telefon, kompenseras av datorn. `resize=remote` låter den ANSLUTNA
   klientens fönster styra framebuffer-storleken (U5:119-127) — men
   `shared: true` är default (U4:33): kopplar telefonen remote medan
   datorn tittar, flyttas WM-layouten för ALLA (samma mekanism som
   U5:128-130 varnar för, nu över sessionsgränsen). Bokmärkesrådet i
   U5 förutsätter tyst att telefonen är ensam/primär klient. **Bedömning:**
   remote-resize och delad display är en reell konflikt som U12:s
   RANDR-utredning ("kan telefonen be om SIN upplösning?") måste besvara
   innan remote blir mer än en ensamklient-lösning.
2. **App-zoom ≠ app-layout.** Enda belagda app-kraften är pinch→Chromium-
   zoom (U2:22-24) — den förstorar utan att ändra layout; ett ECHT
   mobil-läge (kollapsad sidebar, compact-densitet) skulle ge mer "nativt"
   per pixel. Om U11 belägger sådana breakpoints kan EN rad geometry
   (r311-mönstret) låsa upp dem — om ej, är geometrispåret takat och
   tyngden flyttas till U12:s arkitekturer.
3. **Dubbelt skrivbord = dyrast på varje axel** (RAM för andra instansen,
   singleton/auth-komplexitet, dubbla sessionsytor att hålla levande) —
   och serverresurserna finns (manifestet: 12 kärnor/60 GiB), men seriens
   hela historia belönar billiga enradsändringar (r311, U10 quality).
   **Bedömning:** ska bara väljas OM U11 visar noll app-krafter OCH
   U12 visar att remote-resize brister i delat läge.
4. **"ZCode-nativt på telefonen" behöver inte bara vara VNC:** /studio
   (HTML-webchat, telefonvänlig av konstruktion) och /chat (ttyd+tmux+CLI)
   står redan (AGENTS.md). DESK-strömmen är den enda vägen med FULL
   visuell paritet — men den är också den dyraste per förbättringsprocent
   i jämförelse med vägar som redan är responsiva.

---

## 5. Beslutsunderlag till root-ronden — PROVISIONELL stegplan (5 steg)

> Varje steg: vad / varför / beviskrav / risk + återställning. Steg 2 och 4
> är VILLKORADE på kollegornas protokoll; steg 3 är belagt redan idag.

**Steg 1 — Inhämta A+B och kör syntes v2 (grinden äger detta).**
VAD: när DESK-U11 och DESK-U12 landar körs U13 igen; denna fil revideras
till v2 med båda källprotokollen citerade med radreferenser (KVD:t
uppfyllt då). VARFÖR: hela stegplanens två villkorade ben (2 och 4) saknar
sina belägg tills dess — att besluta nu vore att gissa. BEVISKRAV: båda
protokollen finns med egna RESULTAT-rader. RISK+ÅTERSTÄLLNING: ingen —
ren läsning; denna v1 står kvar som dokumenterad mellantid.

**Steg 2 — (villkorat U11) breakpoint-geometri enligt r311-mönstret.**
VAD: om U11 belägger att appen har responsiva breakpoints, justera
`-geometry` i `zdesk-xvnc.service` (en rad, root) till U11:s optimala
bredd (manifestet nämner 720x405 som kandidat). VARFÖR: r311 bevisade
mönstret — en rad geometri gav läsbart + snabbare (service rad 7-10);
Om appen har ett smalare mobil-läge låser samma mönster upp ECHT layout,
inte bara zoom. BEVISKRAV: `verktyg/desk-halsa.mjs` x-geometri-rad
(_NET_WORKAREA) visar nya värdet + kundbild från telefonen före/efter.
RISK+ÅTERSTÄLLNING: smalare vy för datorn (kompenserar med zoom, r311:s
egen linje) och WM-layout flyttas vid omstart (openbox maximerar allt,
U1); återställning = geometry tillbaka till 960x540 (föregångaren står i
r311-kommentaren; `daemon-reload + restart`, omstarten är rutin).

**Steg 3 — kundens bokmärke `?resize=remote` på telefonen (belagt idag).**
VAD: ge kunden ett bokmärke `…/desk/vnc.html?resize=remote` (eller
automatconnect-variant) på telefonen; defaults.json orörd för datorn —
exakt U5:128-130:s råd. VARFÖR: HÖG mobilvinst, noll kod, noll filändring
(U5 reglage 2; U10:67 höll med och lämnade filen orörd av just risk-MEDEL).
BEVISKRAV: kundtest — telefonen ritar egna pixlar (framebuffer följer
fönstret), strömmen märkbart snabbare; dokumentera i worklog. RISK+
ÅTERSTÄLLNING: WM-layouten flyttas när telefonen ansluter (U5:128-129);
I DELAT LÄGE (dator + telefon samtidigt, shared:true U4:33) flyttas vyn
även för datorn — konflikten analyseras i min bedömning §4.1 och MÅSTE
följas av U12:s RANDR-svar innan något permanentare beslut. Återställning:
kunden tar bort bokmärket (tillbaka till scale-default) — noll kvarvarande
spår (query vinner bara per besök).

**Steg 4 — (villkorat U12, ENDAST om 2+3 visar sig otillräckliga) dubbelt
skrivbord.** VAD: Xvnc :11 med telefongeometri + andra AppImage-instansen
enligt U12:s belägg (singleton-lås/`--user-data-dir`, auth-delning,
RAM-mätning). VARFÖR: ger varje klient-typ sin EGEN display — renaste
per-klient-pariteten; men dyrast (min bedömning §4.3 på manifestets
resursfakta). BEVISKRAV: U12:s RAM-mätning från burken + asar-belägg för
user-data-dir + dokumenterad auth-väg; därefter root-beslut om systemd-
enhet. RISK+ÅTERSTÄLLNING: ny tjänsteyta, sessionsduplikat, auth-yta —
högst risken i planen; återställning = stoppa+inaktivera :11-enheten
(den rörs INTE innan U12:s belägg finns — inget skyddslöst beslut).

**Steg 5 — bokföring och kundmanual.**
VAD: syntes v2 (från steg 1) bokförs i worklog + beslutsminne; en
manualrad för vinsterna (vy-zoom U8, ev. bokmärke steg 3) föreslås till
hjälpsidans ägare (DESK-U9-HJALPSIDA — jag skriver ENDAST förslag, ändrar
inte andras filer). VARFÖR: protokollkedjan ska stängas ärligt —
provisionell v1 är inget slutgiltigt svar; kunden ska kunna BRUKA det som lever
utan att läsa protokoll. BEVISKRAV: worklog-rad + förslagsrad här.
RISK+ÅTERSTÄLLNING: ingen.

---

## 6. Vad som MÅSTE revideras när U11/U12 landar (lista åt syntes v2)

1. **Hela §2 + steg 2:** U11:s belagda breakpoints (eller frånvaron) —
   antingen bekräftas geometrispåret med en siffra, eller takas det och
   steg 2 stryks.
2. **Hela §3:1-2 + steg 3-4:** U12:s RANDR-svar avgör om remote-resize
   kan bli mer än ensamklient-lösning (min §4.1-konflikt), och om dubbelt
   skrivbord är tekniskt/mässigt rimligt.
3. **Rankingen i §4:** om U11 hittar ECHT mobil-layout blir
   app+geometri odiskutabel huvudväg; om båda kollegorna kommer tomma
   tillbaka är frågan om /chat-bryggan+studion (AGENTS.md:s två redan
   telefonvänliga vägar) ska bära mer av telefonlätet i stället — ett
   spår syntes v2 måste väga.
4. **Denna fils STATUS-rad** avslutas då med slutgiltig rekommendation;
   RESULTAT-raden nedan är PROVISIONELL av naturen.

## 7. Juridik

Ren verktygssyntes om skrivbordsupplevelsens geometri och arkitektur —
inget finansiellt innehåll, inga råd, inga kundriktade texter (2007:528
berörs ej). GDPR/kakor: berörda klientmekanismer lagrar endast lokala
UI-inställningar i webbläsarens localStorage (DESK-U4:128-134:s linje);
denna syntes sätter ingen kaka och samlar ingenting. Priser/tier/
publicering: orörda (R2-respekt).

---

*GRANSKARENSnotationsrad: denna v1 bygger på 12 källor (DESK U1, U2, U4,
U5, U8, U10; tjänstefil r311; manifestet; fabrikstatus; AGENTS.md) —
noll fakta utan källa, bedömningar märkta som bedömning. Kollegorna A och
B citeras VIA sina uppdrag tills deras protokoll finns.*

RESULTAT: rekommendation telefon-först-geometri i EN display (appens egna krafter + per-enhet remote-resize som reserv, dubbelt skrivbord endast som sista utväg) i 5 steg — PROVISIONELL tills U11+U12 landat och syntes v2 körts
