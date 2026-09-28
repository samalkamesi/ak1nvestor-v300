# DESK-U19 — RÅDSDOMEN: expert-rådets gemensamma evolutionära färdplan

**Fabrikuppdrag:** v205-u4 (GRANSKARE) · **Denna version:** v2 SLUTGILTIG,
2026-09-28 23:50 UTC · **Kundorder:** "samlas som experter, djup forskning,
koll på varesta kod, besluta tillsammans" (manifest v205, rad 3).

> **Versionshistorik i korthet:** v1 skrevs provisionell 23:40 (commit
> f4b23cd9) — kollegprotokollen saknades då (9 min poll, V4). Under
> commit-ögonblicket landade alla tre (23:4x),lästes i fulltext, och denna v2
> är den SLUTGILTIGA dom som uppdraget begärde. Mönstret är U13 v1→v2. v2:s
> viktigaste korrigering av v1: **U13V2:s fynd A var INTE rättat i praktiken**
> — rättningen landade i en kopia nginx aldrig serverar (U17 A1, se §1).

---

## 0. KVD — källläget

| Källa | Läge | Innehåll | RESULTAT-rad |
|---|---|---|---|
| DESK-U16-KARNA-EXPERT.md | FINNS, läst i fulltext (411 r) | Kärnlager rad för rad | "10 fynd (A:2 B:4 C:4) + 8 evolutionära steg" |
| DESK-U17-NAT-EXPERT.md | FINNS, läst i fulltext (308 r) | Nät/klient rad för rad | "9 fynd (A:1 B:4 C:4) + 8 steg + kopia-integritet HEL" |
| DESK-U18-UPPLEVELSE-EXPERT.md | FINNS, läst i fulltext (445 r) | UX + säkerhet | "13 fynd (A:1 B:7 C:5) + 8 steg + säkerhetsläge GAP" |

Bakgrundsdomar som rådet bygger vidare på (lästa i fulltext denna omgång):
DESK-U13V2 (paritetssyntesens slutdom), DESK-U14 (robotfokus-roten),
DESK-U15 (strömfartsmätningen) — citat nedan med `protokoll:rad`. Tre
expertprotokoll citerade + tre bakgrundskällor + worklog E42: källtrippen
håller.

## 1. Rådets första handling: verifiering av de öppna kraven — och ett nyckelfynd

Innan diskussionen kontrollerade rådet (ordförande-stolen) diskens läge mot
tidigare domar (V1–V3, körd 23:39):

- **U13V2 fynd B (hälsans invariant): LANDAD** — commit 5515c7c1 (r313),
  xGeometri jämför mot xrandr current; U18:257-262 har dessutom LIVE-beviset:
  senaste lakarkörningen PASS "workarea == xrandr current == 960x540
  (resize-medveten invariant)" (M4, 23:30 UTC). **Bekräftad av två stolar.**
- **U13V2 fynd A (hjälpsidans scale-pin): RÄTTAD I FEL KOPIA.** V1 visade
  `/var/www/desk/hjalp.html:137 = resize=remote` — men U17 A1 (rad 229) bevisar
  med curl att **den serverade kopian** (`desk-web/hjalp.html`, via websockify
  6080) fortfarande bär `?resize=scale`: nginx `location = /desk/` serverar
  endast index.html från /var/www; `/desk/hjalp.html` proxys till 6080 →
  desk-web-kopian (U17:75-80, M8). Korrigeringskravet är alltså **ÖPPET i
  drift** — v1:s steg-1-formulering ("fynd A rättad") var fel och rättas här.
  Roten är dubbelförvaringen (U17 B1: två kopior, en död rättad, en live orörd
  sedan leveranshashen 1df68231…, U17 M6).
- **defaults.json oförändrad** (V2): resize remote, quality 3, compress 2 —
  noteras: nyckeln `compress` är DÖD (klienten läser `compression`,
  U17:48/U16 C2) — två stolar oberoende.

## 2. RÅDSDISKUSSEN — där fynden möts och skiljer

### 2.1 Kluster 1: port 6080 — rådets tyngsta beslutsyta (3 stolar, 2 grader → dom: A)

- U18 A1 (rad 37-79): websockify binder **0.0.0.0:6080 UTAN auth**, Xvnc
  `-SecurityTypes None` bakom bron, och **ingen brandvägg aktiv** (M9: ufw
  inactive trots ENABLED=yes, nftables tomma kedjor) — "en portskanner får
  kundens AKTIVA ZCode-session … med full tangentbords-/muskontroll" (U18:60-62).
- U17 B3 (rad 232) samma fynd men B-grad — skillnaden är beviskedjan: U17:s
  externa sond visade porten STÄNGD utifrån (M16: timeout) men kunde ej läsa
  brandväggsreglerna; U18 kom åt brandväggsfilerna och fann dem TOMMA.
- U16 B1 (rad 307): dessutom kör websockify som **root** (enheten saknar
  User=; U16:234-242, ps-bevis PID 351439).

**Vägning:** U17:s "extern stängd" och U18:s "brandvägg tom" kan båda vara
sanna endast om ett okänt filter (provider/hostnivå) blockerar — ett skydd
ingen dokumenterar. Rådet dömer med U18: A-grad. Graderingstvisten är i sig
ett fynd om metod: **yttre sond utan konfig-läsning undervärderar risk.**
Tilläggsbeslut: U17:s förslag `mandatory.json {"resize":"remote"}` (rad
246-251) — en strukturell låsning som gör ALLA scale-querys harmlösa — har en
trade-off (rullgardinen "Resize session" låses i panelen) och döms därför
**styrelsefråga, ej fabrik** (U17 markerar samma).

### 2.2 Kluster 2: hjälpsidan och dokumentationen (3 stolar, A/B/C → dom: A för kedjan)

U17 A1 (serverad kopia bär scale — kringår remote-kontraktet) + U17 B1
(dubbelförvaringens divergens) + U18 B1 (rad 91 "förinställd av oss" orörd i
båda kopiorna trots U13V2 §6.2) + U18 B7/index:96 (landningen råder den
krångliga Ctrl+0-vägen före menyns ettklicksknapp) + U18 C1-C3 (WCAG AA-brister
3,89:1/2,48:1, saknad focus-visible/reduced-motion, "strecket högst upp" —
panelen sitter i VÄNSTER kanten) + U17 B4 (stavfel "ZCode-skivbordet").
U16 C3 såg samma rad 137 men värderade C ("kedjeskuld") — utan U17:s
serveringsbevis hade rådet undervärderat. **Viktig korsreferens (U18 C4, rad
217-224):** stavfelet är LÖMSKT KOPPLAT till `desk-halsa.mjs:74`
TITEL_MARKE='ZCode-skivbordet' — rättas titeln ensam FAILar hälsan. Enhetlig
dom: hela dokumentpaketet rättas I EN SAMORDNAD ändring.

### 2.3 Kluster 3: robot-handen — SKILJAKTIGHET avgjord (U16 mot U18)

- U16 A1 (rad 99-140): klick-race vid mode-byte, bevisad som KLASS (fyra
  oberoende stöd: startzoomens egna 80 s-poll + 1 s-settle, EWMH-felet
  U14:163-166, certets saknade settle-grind, sex historiska felleveranser).
- U18 C5 (rad 226-249): dom att kur A-missen "förklaras FULLT ut av U14
  lager 2b (deterministisk översvämning)" — passivt lägesbevis M10: Xvnc
  oförändrad sedan 20:58, current 960x540, fönstret 960×640 NU; OLUPT-grep:
  strängen nådde aldrig kompositorn. "Race-/timing-hypotesen … ska inte
  bokföras som rot förrän bevisad" (U18:241-243).

**Vägning:** båda har rätt på olika nivå — U18 vinner som ROT-förklaring
(missen krävde inget race: kompositorn låg deterministiskt under botten),
U16 vinner som KÖRFÖRUTSÄTTNING (varje framtida kur MÅSTE ha settle-grind
oavsett rot, ty klassen är bevisad). Rådet antar båda: cert v2 = U14 Kur A
(geometri ≥640) + U16 B2 (`--onlyvisible --name "ZCode"` — sökningen ger två
fönster med 10×10-hjälpfönstret FÖRST, U16:144-157) + U16 A1 (polla
workarea-match + settle ≥300 ms) + U18 C5/E6 (förutsättning `xrandr`
current-höjd ≥640 passivt kontrollerad FÖRE körning; bokföringskrav per
körning) + U18 §5:316-320 (robotens gräns: ALDRIG autentiseringsytor — R2-klass).
U18:s synergibemärkelse (rad 248-249, 376-379) antas som planprincip:
**ett telefonporträtt-besök (390×844 via remote) uppfyller höjd-kravet av
sig självt — robotens och kundens bästa geometri är densamma.**

### 2.4 Kluster 4: appens min-hints (U16 A2) — planens nya A-post

`WM_NORMAL_HINTS min 480×640` gör appen inkompatibel med telefonviewports i
remote-eran: liggande ~844×390 ⇒ 250 px av botten (kompositorns hemvist)
utanför; porträtt ~390×844 ⇒ 90 px klippt i höger (U16 A2 rad 306, med M6 +
U11 F9 + U12:100-104). U13V2:125-131 hade risklistan öppen; U16 gör den till
certainty per orientering. Rådet: **acceptansprovet (steg 4) skall mäta
just detta** — app-min är leverantörens yta, men skadan skall beläggas i
drift innan någon förhandlingsväg öppnas.

### 2.5 Kluster 5: mätning först — tre stolar, en röst

U15 rek 1 (rad 84: instrument vid kundens nästa besök) = U16 steg 1 (rad 324:
"instrumentera först … utan siffror är allt gissning") = U17 steg 4 (rad
253-254). quality 3→6 villkoras likadant av alla tre (U15:85, U16 steg 5 rad
328, U17 steg 6 rad 258-259). U16 tillför försiktighetsregeln (rad 294-297):
aktiva mätningar skall undvika gränssnittsvaktens cron-fönster
(puppeteer-chrome snedvrider talen). **Enigt: instrument före reglage.**

### 2.6 Kluster 6: självläkande — läget kartlagt av U18

Kedjan har REDAN tre lager (systemd Restart=always ×4; desk-läkaren r315 —
2 FAIL ⇒ omstart ENBART av zdesk-zcode; SKIP-arkitekturen), men fyra glapp
står kvar (U18 §4 rad 272-285): lakaren når bara appen, eskalering saknas
(fel den inte bär skrivs inte till rot-kön), auth-trion permanent SKIP i
cron-läget + hjalp.html obevakad (U18 B4), och ingen mätning av kund-pulsen.
U16 B3/B4 (rad 309-310) tillför startzoomens race och sömn-i-stället-för-poll
i startkedjan. Dom: steg 6 samlar hela självläkningspaketet.

### 2.7 Kluster 7: inloggningsförsäkringen (U18 B2 — unikt fynd, unik vikt)

Kundens AKTIVA inloggning (API-nyckel, ROND 309) har ALDRIG arkiverats:
backup.log en enda SKIP-rad (före inloggningen), inga tar.gz, cron-raden
aldrig installerad (U18:98-114). Vid profilförlust är "inloggad för
alltid"-löftet oinsurance. Rådet placerar kur bland de tre första stegen —
löften till kunden väger lika tungt som rör som läcker.

## 3. DEN GEMENSAMMA FÄRDPLANEN — 8 steg, sorterade

Sorteringsprincip: (i) säkerhet är upplevelsens fundament (U18:62-63),
(ii) kundlöften och kedjeintegritet, (iii) bevis och instrument, (iv)
automation, (v) polering, (vi) arkitektur. Varje steg: VAD/VARFÖR
(citerat)/beviskrav/risk+återställning/ägare.

### Steg 1 — STÄNG PORT 6080 (+ brandvägg + brute-force-tak)

- **VAD:** (a) `zdesk-novnc.service`: `--heartbeat 30 127.0.0.1:6080
  localhost:5910` + `User=ak1a` + daemon-reload + restart; (b) aktivera ufw
  med allow 22,80,443 — **ALDRIG fjärrlåsa SSH** (U18:69-70); (c) fail2ban
  `jail.d/nginx-auth.local` + ev. nginx `limit_req` på /desk/ (U18 B3:123-126).
- **VARFÖR:** U18 A1 (rad 37-79 — 0.0.0.0 + ingen auth + tom brandvägg +
  root-process); U17 B3 (rad 232 — "skyddsnet skall inte hänga på ett externt
  filter"); U16 B1 (rad 307 — User= saknas).
- **Beviskrav:** `ss -ltn` → `127.0.0.1:6080`; extern sond död (kundens
  telefon på mobildata räcker, U18:72-73); https://lab.ak1nvestor.com/desk/ =
  200 med auth; processens user = ak1a.
- **Risk/återställning:** websockify-omstart klipper strömmen ~5 s —
  noVNC reconnect:true (defaults, V2) fångar; fel i enheten revertas med en
  rad. ufw-misstag kan låsa SSH — därför allow 22 FÖRST, och helst i
  konsolfönster.
- **Ägare:** ROOT-ROND (/etc — aldrig fabriksbarn).

### Steg 2 — Dokumentpaketet I EN SAMORDNAD ändring + ett filhem

- **VAD:** i **desk-web/hjalp.html** (den serverade!): rad 137 scale→remote
  (eller stryk parametern — U17 A1:s två varianter) + rad 91 ny text enligt
  U13V2 §6.2; i `/var/www/desk/index.html`: :96 ettklicksknappens väg (U18
  B7), :7 stavfelet **SAMORDNAT med desk-halsa.mjs:74 TITEL_MARKE** (U18 C4),
  :88 "vänsterkanten" (U18 C3), WCAG-färgerna #94a3b8 + focus-visible +
  reduced-motion + theme-color (U18 C1-C2). Därutöver: ETT filhem för
  hjalp.html (U17 B1:s båda alternativ — rådets preferens: desk-web som enda
  hem, /var/www-kopian bort).
- **VARFÖR:** "varje entré via 'Öppna ZCode'-knappen på hjälpen ger
  scale-läge och kringgår … verkställandet" (U17 A1:229); "fel kant: kunden
  letar i överkanten och finner inget" (U18 C3:216); kontrast under AA
  (U18 C1:195-198).
- **Beviskrav:** curl 127.0.0.1:6080/hjalp.html → remote; gränssnittsvakten
  (eller U18 M14-beräkningen om) grön på båda sidorna; desk-halsa-körning
  PASS efter titeländringen.
- **Risk/återställning:** låg; desk-web utanför git — manuellt steg: spara
  före/efter-hash (U17:s M6-mönster). Återställning = tillbakaklistrad rad.
- **Ägare:** HUVUDSESSIONEN (D3-rätten; desk-web + /var/www). Fabriken äger
  endast diff-förslagen som redan finns i U17/U18.

### Steg 3 — Inloggningsförsäkringen: arkiv NU + cron + återställningsprov

- **VAD:** (a) kör `~/desk-login-backup/spara-login.sh` (detekterar själv
  inloggat läge; läser+packar endast); (b) installera U7 §4.2:s cron-rad;
  (c) första återställningsprovet (endast namn, aldrig innehåll — U18:112-114).
- **VARFÖR:** "den enda inloggning som FINNS är den enda som ALDRIG
  arkiverats" (U18:106-108).
- **Beviskrav:** första `zcode-login-*.tar.gz` + loggrad OK + provrad i U7:s
  RESULTAT.
- **Risk/återställning:** skriptet stoppar ingen process (U18:110-111);
  arkivet 600-skyddas.
- **Ägare:** HUVUDSESSIONEN.

### Steg 4 — Acceptansprovet + ströminstrumentet vid kundens nästa besök

- **VAD:** (a) U13V2 §2.4-testet: xrandr current ≠ 960x540, orientering
  noteras, skärmdump (privat, U14 §8-reglerna) — **med A2-mätning**:
  hur många px av kompositorn hamnar utanför per orientering (U16 A2);
  (b) instrument-script (U15 rek 1): /proc/net/dev-rx + ss :5910-vakt,
  Mbit/s per 10 s-fönster till data/vakten/ — undvik vaktens cron-fönster
  (U16:294-297).
- **VARFÖR:** "inte 'KLART' förrän …" (U13V2:118-124); "det akuta glappet
  är mätinstrument" (U15:94); "steg 1 utan siffror är allt gissning"
  (U16:333-334).
- **Beviskrav:** xrandr-rad + journalrad (root) + loggad aktiv Mbit/s +
  A2-px-tal per orientering.
- **Risk/återställning:** passiva avläsningar — ingen risk.
- **Ägare:** root-rond (journal, besöksfönstret) + FABRIK-YTA
  (instrument-scriptet — ny fil i verktyg/, kan dispatchas nästa omgång).

### Steg 5 — Robot-cert v2: deterministiskt, settle-grindat, bokfört

- **VAD:** cert enligt §2.3:s syntes: förutsättningskontroll (xrandr
  current-höjd ≥640 — annars avstå tills porträttsbesök/driftbyte), målning
  `--onlyvisible --name "ZCode"`, `windowactivate --sync` + verify, geometri-
  poll till workarea-match + settle ≥300 ms, `type … --delay 150` UTAN
  --window, ASCII endast, `key Return`; varje körning bokförs (kommandon +
  utfall + bevis-grep) i protokoll/worklog; robotens gräns mot
  autentiseringsytor gäller oförändrat (U18 §5:306-320).
- **VARFÖR:** "lager 2 … PRIMÄR ROT" (U14:182); race-klassen bevisad (U16
  A1) även om ROT var deterministisk översvämning (U18 C5); "kör utan
  kvitto" är exakt vad policyn skall förhindra (U18:318-320).
- **Beviskrav:** unik ASCII-sträng grep-bar i ~/.zcode/cli/rollout + db +
  bokförd protokollrad.
- **Risk/återställning:** geometri-byte transients (settle-grinden tar den);
  felträff avbryts utan sidoeffekt; nästa klients remote-resize återställer
  geometrin av sig själv (U13V2:145-149).
- **Ägare:** HUVUDSESSIONEN (cert + policy), med U16/U18:s diff-förslag som
  underlag.

### Steg 6 — Självläkande grad 2: eskalering, bevakningsluckor, readiness

- **VAD:** (a) lakaren eskalerar oläkbart till `data/vakten/rot-kon/`
  (U18 §4); (b) auth-trion får sin DESK_AUTH-körning (root-cron el. 600-fil
  via lakarens sudo-steg — U18 B4) + `/desk/hjalp.html` som fjärde
  http-auth-kontroll; (c) ev. novnc i lakarens vitlista (bär ej kundens
  data; reconnect fångar 5 s-avbrottet — U18 §4); (d) startzoom
  geometri-medveten + readiness-poll i stället för sömn i startkedjan
  (U16 B3/B4).
- **VARFÖR:** "upptäckt fel som lakaren inte kan bota är osynligt för
  huvudsessionens rond" (U18:278-280); startzoom-racet har en gång fällt
  enheten (U16:198-201, worklog:18523).
- **Beviskrav:** simulerad FAIL → rot-kö-rad; auth-kontrollerna PASS i
  loggen; startzoom tålig mot mode-byte i skrap-prov.
- **Risk/återställning:** vitlistade omstarter endast; DESK_AUTH hanteras
  enligt svitens kontrakt (loggas aldrig — desk-halsa.mjs:37-40).
- **Ägare:** HUVUDSESSIONEN (lakare + svit) + ROOT (DESK_AUTH-delen).

### Steg 7 — Kvalitets- och klientreglage, VILLKORAT av steg 4:s tal

- **VAD:** quality 3→6 i defaults.json (U15:85); döp den döda nyckeln
  compress→compression (U17 B2/U16 C2) vid samma rörelse; därefter i
  prioritetsordning om mätetalen motiverar: -depth 16-försök (U16 steg 6)
  och createImageBitmap-vägen i display.imageRect (U17 C4/steg 5).
- **VARFÖR:** "skarpare terminaltext är den enda parameter som direkt
  påverkar läsbarhet" + marginal 4-20× (U15:70, 85); base64-omvägen är
  "det största identifierade avkodningsreglaget" (U17 C4).
- **Beviskrav:** mätetal före/efter varje ändring + kundens iakttagelse.
- **Risk/återställning:** varje ändring en rad, fullt reversibel.
- **Ägare:** HUVUDSESSIONEN (defaults) — beslut i rundan på steg 4:s tal.

### Steg 8 — Arkitektursporet: least privilege, hygien, långsiktighet

- **VAD:** (a) /tmp-städ av desk-dumpar + policy (dumpar till ~/desk-dumpar
  0700 + lakar-varning — U18 B5); (b) avklara "nova"-kontot (tredje
  skal-kontot, odokumenterat — U18 B5 flaggar); (c) bokför B6 (profilen i
  ak1a-rymden + --no-sandbox) som medvetet val i regelverkets riskavsnitt;
  (d) styrelsefrågan mandatory.json-låsning (U17 steg 2); (e) långsiktigt:
  dedikerad zdesk-användare (U18 E8), ev. binärbrygga/WebRTC om steg 4 visar
  relay-CPU som flaskhals (U17 steg 7, U16 steg 8).
- **VARFÖR:** "konto med skal som ingen dokumenterar är en egen riskpost"
  (U18:157-159); E42:s gaplista (worklog s9-u3: EN AppImage utan redundans,
  delat auth-lösenord, 0 strömmön mobil).
- **Beviskrav:** per delpost (städad /tmp, avklarat konto, bokförd post).
- **Risk/återställning:** (a)-(c) låg; (d)-(e) kräver egna beslut — därför
  SIST.
- **Ägare:** HUVUDSESSIONEN (a, c) · ROOT-ROND (b) · STYRELSE (d) ·
  root-rond + ev. kundinformation (e).

## 4. EPOKCYKELN — när rådet samlas igen

Tre trigger-ytor (någon räcker):

1. **T1 — A-fynd:** varje kommande expertgranskning med A-grad ⇒ råd inom
   samma rond (nu gäller det steg 1-3:s verkställande: A1 är inte stängt
   förrän ss visar 127.0.0.1:6080).
2. **T2 — Milstolpe:** när färdplanens steg 1-3 är bokförda (säkerhetsgapet
   stängt, kedjan + dokumentpaketet helheter, arkivet levande) ⇒ kalibrerings-
   samling som väger in steg 4:s besöksdata om kunden hunnit besöka.
3. **T3 — Kalender:** senast **2026-12-31** (kvartalsrytm, harmonisk med
   DR-Q4-fönstret 10-01→12-31 i worklog s10-u1).

Mellan samlingarna är steg 1-3 omedelbart verkställbara av root-rond/
huvudsession med detta protokoll som beslutsunderlag; steg 4-7 har sina
villkor i texten; steg 8 ligger i styrelsens/rondens takt.

## 5. Juridik

Ren infrastruktursyntes: inget finansiellt innehåll, inga kundriktade texter,
inga råd — lagen (2007:528) berörs ej. Priser/tier/publicering orörda (R2);
noterbart: mandatory.json-låsningen (steg 8d) och robot-gränsen (U18 §5) är
medvetet placerade hos styrelse/kund-nära beslut, ej hos fabriken. GDPR/kakor:
förslagen sätter inga kakor och samlar ingenting nytt — instrumentet (steg 4)
mäter byte på loopback, aldrig innehåll/identitet (U15:16-metoden); puls-
idén (U18 E4) exponerar endast lakarens egen logg statiskt. Skärmdumpar i
steg 4 hanteras enligt U14 §8/U18 B5: aldrig commit, aldrig kvar i /tmp.

## 6. Källförteckning (källtripp per påstående)

**Källprotokoll (lästa i fulltext denna omgång):**
- K1 = DESK-U16-KARNA-EXPERT.md (v205-u1) — citat med :rad + dess M1-M21.
- K2 = DESK-U17-NAT-EXPERT.md (v205-u2) — citat med :rad + dess M1-M20.
- K3 = DESK-U18-UPPLEVELSE-EXPERT.md (v205-u3) — citat med :rad + dess M1-M15.
- K4 = DESK-U13V2-PARITETSSYNTES.md · K5 = DESK-U14-ROBOTFOKUS.md ·
  K6 = DESK-U15-STROMFARTSMATNING.md — bakgrundsdomarna.
- K7 = worklog.md (E42-raden s9-u3; ROND 309-311; s10-u1:s Q4-fönster).
- K8 = manifest v205-desk-expertradet-1789635000.json (uppdragsprompts).

**Egna verifieringar (23:28–23:39 UTC):**
- V1 = grep /var/www/desk/hjalp.html:137 → resize=remote (den DÖDA kopian —
  se §1:s korrigering mot U17 A1/M8).
- V2 = Read /home/ak1a/desk-web/defaults.json (remote/3/compress 2).
- V3 = git log + grep verktyg/desk-halsa.mjs (5515c7c1 r313: xrandr-
  invarianten rad 192-212 — matches U18:257-262 live-PASS).
- V4 = fabriksstatus + 9 min filpoll (v1:s provisionella grund).

**Ärlighetsrad:** v1:s "fynd A rättad" korrigeras öppet i §1 — rådet värderar
egen felbarhet som en del av protokollet. Påståenden om kundens framtida
besök är prognos tills steg 4 mäter. Yttre nåbarhet av 6080 är ej sondad
utifrån (U18 A1:s egen ärlighetsrad gäller rådets vägning). ms-tal för
om-maximering är ej passivt mätbara (U16 §0). Inget påstående vilar på
intentioner ur K8.

RESULTAT: färdplan i 8 steg (slutgiltig) + nästa rådssamling <T1: A-fynd ⇒ samma rond | T2: steg 1-3 bokförda ⇒ kalibrering | T3: senast 2026-12-31>
