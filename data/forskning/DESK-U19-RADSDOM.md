# DESK-U19 — RÅDSDOMEN: expert-rådets gemensamma evolutionära färdplan

**Fabrikuppdrag:** v205-u4 (GRANSKARE) · **Datum:** 2026-09-28 23:40 UTC
**Kundorder:** "samlas som experter, djup forskning, koll på varesta kod, besluta
tillsammans" (manifest v205, rad 3).

> **STATUS: PROVISIONELL — GRINDEN KÖR OM.** Rådets tre utsedda expertstolar
> (U16 kärna, U17 nät/klient, U18 upplevelse+skydd) hade INTE landat sina
> protokoll vid dom-tillfället: fabriken dispatchade alla fyra uppgifterna
> 23:25:05 UTC (statusfilen: `pågår`, `klara: []`) och 9 minuters polling
> (23:28–23:37, V4) gav noll filträffar. Domen förs DÄRFÖR på de tre
> expertprotokoll som FINNS och vars lagertäckning motsvarar rådets stolar:
> U14 (X/fokus-lagret = kärnstolen), U15 (ström/nät-kedjan = nät/klient-stolen),
> U13V2 (paritet/upplevelse-syntesen = upplevelsestolen). Detta är exakt
> mönstret från U13 v1 (provisionell då båda källor saknades) → v2 (kedjans
> slutdom) — bevisat fungerande 2026-09-28. **När U16/U17/U18 landar skrivs
> rådsdom v2 på deras fynd; v2 ersätter då detta protokoll.**

---

## 0. KVD — källläget

| Källa | Läge kl. 23:28–23:37 UTC 2026-09-28 | Roll i rådet | Commit |
|---|---|---|---|
| DESK-U14-ROBOTFOKUS.md | FINNS, läst i fulltext (256 rader) | Kärna/X-lagrets expert | 22:17-epoken (v204-u1) |
| DESK-U15-STROMFARTSMATNING.md | FINNS, läst i fulltext (95 rader) | Nät-/klientlagrets expert | 22:14 (v204-u2) |
| DESK-U13V2-PARITETSSYNTES.md | FINNS, läst i fulltext (293 rader) | Upplevelse-/paritets-experten | v204-u3 |

Saknade (drar provisionell-markeringen): DESK-U16-KARNA-EXPERT.md,
DESK-U17-NAT-EXPERT.md, DESK-U18-UPPLEVELSE-EXPERT.md — kollegor i samma
manifest, pågående vid dom-tillfället (V4). Uppdragsprompternas krav (manifest
rad 13, 20, 27) har beaktats som INTENTION, aldrig som belagt faktum: inget
påstående nedan vilar på det U16/U17/U18 KOMMER att säga.

Kompletterande källa: worklog E42-raden (s9-u3, 2026-09-28) för systemkortets
gaplista — sanningshierarkins plats 3.

Egna verifieringar denna omgång (V-serien, §1).

## 1. Verifieringar — läget har RÖRT SIG sedan U13V2 (rådets första handling)

Rådet öppnade med att kontrollera sina egna tidigare krav mot diskens sanning:

- **U13V2 fynd A (hjälpsidans scale-pin) är RÄTTAD (V1).** U13V2:45-46 belade
  `hjalp.html:137` med `resize=scale` och dömde "inte KLART förrän rad 137 är
  rättad" (U13V2:65). Nu: `href="vnc.html?autoconnect=true&resize=remote&show_dot=true"`
  (V1: grep, rad 137). Huvudingången följer nu remote-kontraktet.
- **U13V2 fynd B (hälsans resize-blinda invariant) är LANDAD (V3).** U13V2:88-95
  krävde jämförelse mot runtime-sanningen; commit 5515c7c1 (r313) landade exakt
  det: `xGeometri()` jämför mot `xrandr --query` current med PASS-detaljen
  "workarea == xrandr current … (resize-medveten invariant)" (V3: git log +
  grep rad 192–212 i verktyg/desk-halsa.mjs). Filen är committad och ren i
  trädet.
- **defaults.json oförändrad (V2):** `{"resize":"remote","quality":3,
  "show_dot":true,"reconnect":true,"compress":2}` — läget U13V2:30-34/U15:15
  dokumenterade står kvar; quality-beslutet (färdplan steg 3) är således
  fortsatt öppet.
- **Kollegprotokollen (V4):** 9 min polling, inga landningar — se statusraden.

**Bokföring:** av U13V2:s två korrigeringskrav är ALLTVA innefridda. Kvar av
U13V2:s nästa-root-steg (U13V2:198-202) är endast (b): acceptanstestet vid
kundens nästa besök.

## 2. RÅDSDISKUSSEN — där fynden möts och skiljer

### 2.1 Enighet 1: fienden heter TID, inte DATA

Alla tre experternas slutsatser pekar samma håll:

- U15:94 (RESULTAT): "flaskhals är INTE bandbredden utan latens+avkodning" —
  tabellen U15:74-80 ger nätverkslatens "Trolig huvudfaktor för 'långsam'",
  klientens avkodning "Trolig medfaktor"; marginalen mot 5G är 4–20×
  (U15:70).
- U14:31-33: robot-handens 1080-epoksrot var TIMING (klickavvikelse vid yttre
  zoom), och U14:164-168 dokumenterar EWMH-timing i omstartsfönstret — åter
  tidsfenomen, inte kapacitet.
- U13V2:145-149: remote-resize låter telefonen begära sin EGEN viewport vid
  varje anslutning — parets bort med ett helt klass av fördröjning
  (uppskalnings-suddighet som LÄSES som "långsamt", U15:80).

**Rådets slutsats:** varje färdplanssteg som sänker upplevd tid utan att öka
dataflödet är värt mer än ett steg som ökar rådata. Detta är U15:s dom
"latens>bandbredd" fastställd av rådet som planprincip.

### 2.2 Enighet 2: geometrin är systemets maktspak

- U14:95-122 (belagt): 960x640-fönstret på 960x540-skärm ⇒ 100 px
  översvämning; appens minimi-höjd 640 gör det strukturellt — maximering kan
  inte krympa under minimi.
- U13V2:145-156: med remote LEVERAR klientens viewport per besök; vilolägets
  siffra är ett transient tillstånd utan tittare.
- U15:86 (rek 3): "sänk inte viloläget utan ny breakpoint-data".

### 2.3 Konflikt: U14 Kur A (1024x768) mot U13V2/U15 (960x540 kvar)

U14:209-214 rekommenderar robot-kur med `xrandr --mode 1024x768` ("ALDRIG
800x600/640x480 (<640!)") och noterar själv kostnaden: "+52 % pixlar mot
960x540 — telefon-först-kompromiss" (U14:218-219). U13V2:151-153 dömde
viloläget kvar 960x540; U15:86 dömde "rör INTE … storlek (960×540) än".

**Vägning (rådets dom):** ingen reell konflikt — olika TIDSFÖNSTER.
Kur A är en PUNKTÅTGÄRD i drift (sessionen själv växlar läge, kör
robotsekvensen, växlar tillbaka eller låter nästa klients remote-resize sätta
geometrin), medan 960x540 är VILONSPÅRETS kontrakt. Med remote-resize
aktiverat är vilolägets siffra dessutom mindre betydelse än när U13V2:domen
skrevs: varje besök sätter sin egen storlek ändå (U13V2:145-149). Rådet häver
däremot INTE U15:s villkor — permanent vilolägesbyte mot 1024x768 kräver ny
breakpoint-data (U15:86), och Kur A-skyltning i DRIFTSBOKEN skall anges när
kuren körs så att ronden inte läser läget som driftavvikelse.

### 2.4 Skiljaktighet: kvalitetslyftet — nu eller villkorat?

U15:85 (rek 2) föreslår `quality 3 → 6` med motiveringen att skärpa är "den
enda parameter som direkt påverkar läsbarhet", men avslutar: "Vänta på mätetal
från steg 1 om kundens upplevelse handlar om 'respons' snarare än 'skärpa'".
U13V2:80-81 noterade att 2→3 var koherent med remote (bandbredd frigjords).

**Vägning:** rådet gör U15:s egen villkorsrad till planregel: kvalitetslyftet
(färdplan steg 3) körs FÖRST efter att instrumentet (steg 2) levererat en
aktiv siffra. Ordningsföljden är själva riskåterställningen: med mätetal i
hand kan 3→6 prövas och återkallas med en enda radsändring om siffran växer
orarimiskt.

### 2.5 Gap utan expertbelägg (ärlighetsrad)

E42-systemkortet (worklog s9-u3) namnger gap rådet saknar protokollbelägg
för: "EN session/EN AppImage utan redundans, delat basic-auth-lösenord, 0
strömmön mobil" (score 7). Detta är kartans påstående — rådet väger det in som
LANGSIKTIGT spår (steg 8) men noterar att U17/U18:s granskningar (manifest
rad 20, 27: auth-ytor, portar, säkerhetsögon) är de rättägande instanserna
som skall belägga eller nyansera varje gap. Deras dom väntas i v2.

## 3. DEN GEMENSAMMA FÄRDPLANEN — mot "exceptionell nivå", 8 steg sorterade

Sorteringsprincip: kundens upplevda kvalitet först (enighet 1), sedan
autonomin (robot + självläkande), sedan instrument och ytor, reserv och
redundans sist. Varje steg bär VAD / VARFÖR (citerat) / beviskrav /
risk+återställning / ägare.

### Steg 1 — Paritetsbeviset: acceptanstestet vid kundens nästa besök

- **VAD:** när kunden nästa gång besöker skrivbordet: läs
  `DISPLAY=:10 xrandr --query` — current ≠ 960x540 (förväntas ≈ telefonens
  viewport) ⇒ remote-resize BEVISAT; därefter journalavläsning (root) för att
  skilja "inget besök" från "avbojd TigerVNC". Exakt test: U13V2:118-124.
- **VARFÖR:** "inte 'KLART' förrän rad 137 är rättad" (U13V2:65) — den halvan
  är nu rättad (V1) — "fortfarande 960x540 ⇒ antingen skedde inget
  remote-besök … eller avbojd TigerVNC" (U13V2:122-124). Oförifierade risker
  står öppna listade (U13V2:125-131: porträttgeometri, Electron-omfallning).
- **Beviskrav:** xrandr-rad + (root) journalrad, bokfört i worklog.
- **Risk/återställning:** passiv avläsning — ingen risk.
- **Ägare:** root-rond (huvudsessionen; fabriksagenten är journalblockerad,
  U13V2:106-109 / U15:17).

### Steg 2 — Ströminstrumentet: äkta siffror vid nästa besök

- **VAD:** litet driftscript (vakten/evighetsmotorn äger) som — med U15:s
  metod — läser `/proc/net/dev`-rx och kontrollerar `ss -tn port 5910`: när en
  klient ÄR uppkopplad loggas Mbit/s per 10 s-fönster till `data/vakten/`
  (U15:84, rek 1 ordagrant).
- **VARFÖR:** "det akuta glappet är mätinstrument vid kundens nästa besök"
  (U15:94); aktiv nivå kunde ej mätas passivt (U15:18, 32).
- **Beviskrav:** loggad aktiv siffra från ett verkligt kundbesök.
- **Risk/återställning:** passiv läsning, noll paketfångst (U15:16);
  avstängning = ta bort scriptet ur vakten.
- **Ägare:** fabrik-yta (verktyg/ + data/vakten/ — nytt script, exklusivt
  filägarskap).

### Steg 3 — Kvalitetslyftet quality 3→6, VILLKORAT av steg 2

- **VAD:** `defaults.json` quality 3 → 6, endast efter att steg 2 levererat
  aktivt mätetal som visar marginal (U15:85).
- **VARFÖR:** "skarpare terminaltext är den enda parameter som direkt
  påverkar läsbarhet vid 960×540" och marginalen "4–20×" (U15:70, 85).
- **Beviskrav:** mätetal före/efter + kundens iakttagelse vid nästa kontakt.
- **Risk/återställning:** måttlig datamängdsökning på telefon-nät;
  återställning = quality tillbaka till 3 (en rad, V2 visar filen).
- **Ägare:** root-rond (desk-web är sessionens D3-yta, U13V2:198-200).

### Steg 4 — Robot-handens Kur A: kompositorn nåbar

- **VAD:** rotkur enligt U14 §9, EXAKT ordning: `xrandr -d :10 --output VNC-0
  --mode 1024x768` (ALDRIG <640-höjd) → `xdotool search --class zcode`
  (dynamiskt ID — hårdkodade ID dör vid omstart, U14:167-170) →
  `windowactivate --sync` → verifiera fokus → `mousemove … click 1` på
  kompositorns centrum → `type --delay 150 'robotfocus-u14-test-ascii'`
  **UTAN --window** (Chromium släpper syntetiska event, U14:148-151) →
  `key Return`. ASCII ENDAST (svenska tecken saknar keysyms, U14:153-155).
- **VARFÖR:** "lager 2 … PRIMÄR ROT" (U14:182); robot-typing är sessionens
  väg till full autonom dialog utan kundens fingrar.
- **Beviskrav:** grep teststrängen i `~/.zcode/cli/rollout` + db (U14:237-238).
- **Risk/återställning:** geometriavvikelse från viloläget (+52 % pixlar,
  U14:218-219) och EWMH-timing vid omstart (U14:164-168 — retry med sleep 5);
  återställning: `xrandr --mode 960x540` ELLER låt nästa klient-resize sätta
  geometrin; Kur A-tillfället protokollförs i DRIFTSBOKEN (rådets regel §2.3).
- **Ägare:** root-rond (desk-infra-yta; U14:205-207: "Kur A ändrar kundens
  skärmgeometri … vid tvekan: konkalla rond" — rundan ÄR samlad, denna dom
  är dess beslutsunderlag).

### Steg 5 — Hälsan nivå 2: från DETEKTERA till LÄKA (design väntar U18)

- **VAD:** designsteg: `desk-halsa.mjs` vid FAIL → automatisk läkeåtgärd
  (omstart av fel enhet) — ENDAST när ingen klient är uppkopplad (ss-kontroll
  som U15:18-mönstret). Implementering väntar U18:s granskning av verktyget
  (manifest rad 27 ger U18 rätten att definiera vad som saknas för
  "självläkande").
- **VARFÖR:** r313 landade resize-medveten DETEKTERING (V3) — kända domens
  "självläkande (hälsan)" är nästa spel; hälsan är systemets egen
  felupptäckt.
- **Beviskrav:** simulerad FAIL (t.ex. stoppad enhet i skrap-läge) → PASS
  utan mänsklig handling; logg som visar läkesteget.
- **Risk/återställning:** fel-omstart av levande session = värsta fallet —
  därför kopplingen till uppkopplade klienter; återställning: läkegren bakom
  flagga, av som default.
- **Ägare:** root-rond (filen är dess); designunderlag kan delegelas till
  fabrik som utkast, beslut i rundan.

### Steg 6 — Mätbarheten i kundens vy: Connection Stats-ytan

- **VAD:** koppla in noVNC:s Connection Stats-panel i D3-forken (U15:84,
  alternativet i rek 1) — gömd bakom en avancerad-växel så grundvyn förblir
  enkel.
- **VARFÖR:** "kunden kan INTE se strömmens Mbit/s i UI:t idag — mätglapp,
  inte hastighetsglapp" (U15:63); kunden är telefon-först och icke-teknisk —
  diagnostik ska kunna visas på begäran, inte tömma vyn.
- **Beviskrav:** panel synlig i mobilvy med levande siffra.
- **Risk/återställning:** UI-yta — återställning = revert av paneländringen.
- **Ägare:** root-rond (desk-web, D3-ytan).

### Steg 7 — Reserv B: dubbelt skrivbord vid trigger (ORÖRD)

- **VAD:** `:11` + `--user-data-dir` aktiveras ENDAST vid U12:s triggläge:
  verkligt SAMTIDIGA dator+telefon-sessioner (U13V2:179-183 citerar
  U12:80-88, 233-237).
- **VARFÖR:** "RFB är en framebuffer per session — sista klienten vinner …
  vid SAMTIDIGA dator+telefon-sessioner blir det dragkamp" (U13V2:179-183).
- **Beviskrav:** två samtidiga sessioner med var sin geometri, belagt med
  xrandr+journal.
- **Risk/återställning:** RAM-kostnad mäts FÖRE aktivering (AppImage-storlek
  i minnet är obelagt i protokollen — ärlighet: ingen siffra finns);
  återställning = stäng :11.
- **Ägare:** root-rond.

### Steg 8 — Exceptionell-nivåns långsiktsspår: redundans + beläggning av E42:s gap

- **VAD:** designpass (fabrik kan äga utkastet): redundans för EN-session-
  risken (AppImage-vaktare/omstart), granskning av delat basic-auth-lösenord,
  mobil strömmön — VARJE åtgärd villkoras av U17/U18:s belägg i v2 (se §2.5).
- **VARFÖR:** E42-raden: "EN session/EN AppImage utan redundans, delat
  basic-auth-lösenord, 0 strömmön mobil" (worklog s9-u3, 2026-09-28) —
  "exceptionell" kräver att EN kras inte är slutet.
- **Beviskrav:** failover-prov: dödad AppImage → automatisk återkomst,
  tidmätt; säkerhetsåtgärderna belagda av U17/U18:s fyndlistor.
- **Risk/återställning:** komplexitet — därför SIST i kön och villkorat av
  v2; återställning = enskilt läge kvar tills provet är grönt.
- **Ägare:** root-rond (beslut), fabrik (designutkast); INTE kund-veto-yta
  (driftsäkerhet, ej priser/domän/publicering) — men kunden INFORMERAS i
  nästa studiorapport när åtgärder ändrar hennes inloggningsupplevelse.

## 4. EPOKCYKELN — när rådet samlas igen

Tre trigger-ytor (någon av dem räcker):

1. **T1 — OMEDELBAR omkörning:** U16/U17/U18 landar ⇒ rådsdom **v2** skrivs
   på deras fyndlistor och ersätter detta protokoll (U13 v1→v2-mönstret:
   provisionell dom var INTE förlorad arbete — v2 kunde sluta kedjan eftersom
   v1 redan vägt underlagen, U13V2:5-8). Root-ronden ser landningen i
   fabriksstatusen och dispatcher v2.
2. **T2 — A-fynd:** varje framtida expertgranskning med allvarlighetsgrad A
   ⇒ råd inom samma rond (fyndet får inte vänta till kalendern).
3. **T3 — Kalender:** senast **2026-12-31** (kvartalsrytm; harmonisk med
   DR-Q4-fönstret 10-01→12-31 som worklog s10-u1 bokför) — rådet kalibrerar
   färdplanen mot vad som hann landa.

Mellan samlingarna: färdplanens steg 1–4 är verkställbara NU av root-ronden
(bevisen ligger i detta protokoll); steg 5–6 väntar in v2:s expertbeläge där
så anges.

## 5. Juridik

Ren infrastruktursyntes: inget finansiellt innehåll, inga kundriktade texter,
inga råd — lagen (2007:528) berörs ej. Priser/tier/publicering orörda (R2).
GDPR/kakor: förslagen sätter inga kakor och samlar ingenting nytt —
ströminstrumentet (steg 2) mäter BYTE på loopback, aldrig innehåll eller
identitet, och loggar till serverägda `data/vakten/` (art 13 oberörd; U15:s
metod har denna egenskap dokumenterad, U15:16).

## 6. Källförteckning (källtripp per påstående)

**Källprotokoll (lästa i fulltext denna omgång):**
- K1 = data/forskning/DESK-U13V2-PARITETSSYNTES.md — citat med :rad.
- K2 = data/forskning/DESK-U14-ROBOTFOKUS.md — citat med :rad.
- K3 = data/forskning/DESK-U15-STROMFARTSMATNING.md — citat med :rad.
- K4 = worklog.md E42-rad (s9-u3, 2026-09-28) — systemkortets gaplista.
- K5 = manifest v205-desk-expertradet-1789635000.json — uppdragsprompts
  (intentioner, aldrig belägg).

**Egna verifieringar (23:28–23:37 UTC):**
- V1 = grep /var/www/desk/hjalp.html rad 137 → `resize=remote` (fynd A
  rättad).
- V2 = Read /home/ak1a/desk-web/defaults.json (resize remote, quality 3,
  compress 2).
- V3 = git log + grep verktyg/desk-halsa.mjs (commit 5515c7c1 r313:
  xrandr-invarianten rad 192–212; trädet rent för filen).
- V4 = statusfil v205 + 9 min filpoll → U16/U17/U18 saknas.

**Ärlighetsrad:** alla prognosmoment är markerade som sådana (steg 1:s
utfall beror på kundens besök; steg 4:s kur är OTESTAD — U14:205-207
understryker att utredaren rättigt nöjde sig med rekommendation). Påståenden
om U16/U17/U18:s kommande innehåll förekommer INTE. Systemkortets gaplista
(K4) är kartans påstående, vägt in endast som villkorat långsiktsspår.

RESULTAT: färdplan i 8 steg (provisionell) + nästa rådssamling <T1: U16/U17/U18 landar → grinden kör om som v2; T2: A-fynd → råd samma rond; T3: senast 2026-12-31>
