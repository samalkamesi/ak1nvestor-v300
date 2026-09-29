# DESK-U23 — LANDNINGEN: de tre sista fynden rättade + bevakning född

**Fabrikuppdrag:** auto-s11-1790645110002 s11-u1 (BYGGARE, spår 11 DESK A-Ö)
· **Datum:** 2026-09-29 01:30–01:45 UTC · **Ägarskap:** /var/www/desk/index.html
(på plats, utanför git — hash-kvitton nedan) + verktyg/desk-halsa.mjs +
detta protokoll. Anspråk FÖRE ingrepp: data/vakten/
auto-s11-1790645110002-u1-ansprak.md (syskon u2/u3 startade 01:25:10 med
samma "välj själv"-brief — anspråket är koordinationssignalen).

**Valgrund (duplikatkontroll):** worklog r314–r317 + PIPELINE-KO +
DESK-U19–U22 + data/ visade: U19 steg 2:s dokumentpaket landade till stora
delar (hjalp.html: resize struken, vänsterkanten, Ctrl+0-vägen, WCAG
#94a3b8, focus-visible, reduced-motion, theme-color; "förinställd av oss"
borta — 0 grep-träffar) MEN tre objekt stod kvar, varav ett specifikt
eftersom det kräver en SAMORDNAD ändring över git-gränsen. Ingen våg
levererar dem (s11-klara = [] vid anspråk).

---

## Fynd A — titelns stavfel "ZCode-skivbordet" (U18 C4, U17 B4(iii), U19 steg 2-rest)

- **Fynd:** /var/www/desk/index.html:8 `<title>AK1A Lab —
  ZCode-skivbordet</title>` — saknar "r" (kundsynligt i fliken/bokmärket).
  U17 B4 (rad 233) flaggade; U18 C4 (rad 217-221) belade den lömska
  kopplingen: desk-halsa.mjs:74 `TITEL_MARKE = 'ZCode-skivbordet'` —
  "rättas titeln ensam FAILar kontrollen http-auth-landning".
- **Skälet att fyndet överlevt alla dokumentvågor:** U18 C4:s kurform kräver
  index.html + desk-halsa.mjs "SAMORDNAT i EN commit" — 01:00-vågen som
  rättade övriga index-fynd (mtime-vittne) rättade just inte titeln, ty den
  sitter ihop med repo-filen. Detta är den första vågen som äger båda sidor
  i samma leverans.
- **Kur (verkställd):** index.html:8 → "ZCode-skrivbordet" SAMT i
  verktyg/desk-halsa.mjs: TITEL_MARKE (rad 74) + kommentarraderna :35-36
  (kontrolliste 5a) och arkitekturnoteringen :56-59 — exakt U18 C4:s
  formulering "(och kommentarsraden :54)".
- **Svep:** "skivbordet" → **0 träffar** i index.html, hjalp.html, vnc.html
  efteråt (fanns före ENDAST i index.html:8 — desk-halsa var den andra
  parten).

## Fynd B — trasig sluttagg `./p>` i steg-kort 2 (NYTT fynd)

- **Fynd:** index.html:92 `…appens mobil-layout — håll telefonen
  upprätt./p>` — sluttaggen saknar `<` (skrivet `./p>`). Webbläsare
  auto-stänger vid `</div>` så felet är tyst för ögat men är ett objektivt
  markup-fel i kundsynlig sida (den här klassen: gränssnittsvaktens
  "klippt text"-detektor kan träffa felaktigt).
- **Kur (verkställd):** `håll telefonen upprätt./p>` → `håll telefonen
  upprätt.</p>`.

## Fynd C — resize=scale-pinen på landningens entréknappar (U17 A1-klass)

- **Fynd:** index.html:79 (huvudknappen "Öppna ZCode" → :10-porträttet)
  och :82 ("Liggande läge" → /desk/h/ → :11-landskapet 915x412) bar båda
  `?autoconnect=true&resize=scale&show_dot=true`. Ursprung: v198:s D1-spec
  (PIPELINE-KO rad 34 bevarar den). Doktrinen flyttade sedan till
  U13V2:s remote-kontrakt (defaults.json resize=remote — hälsokontrollerat
  sedan r313, bevisat live r314, kedjan hel r322/U20) och hjalp-entrén
  rättades 00:54 (resize STRUKEN) — men PRIMARY entrén, den kunden trycker
  på varje besök, bibehöll scale-pinen och kringgår kontraktet på exakt
  U17 A1:s sätt ("varje entré … ger scale-läge och kringgår …
  verkställandet", U19 §1 citerar U17 A1:229).
- **Kur (verkställd):** `resize=scale&` struken ur BÅDA länkarna (samma
  variant som den landade hjalp-rättningen valde) → länkarna bär
  `autoconnect=true&show_dot=true` och defaults.json resize=remote börjar
  gälla: telefonens egna pixlar via SetDesktopSize (U20 bevisade hela
  kedjan; autoconnect finns kvar — U20 fynd 4:s brytlänk är täckt).
- **Riskbedömning före beslut:** U16 A2 (app-min 480x640) gäller oavsett
  klientläge och är U19 steg 4:s öppna mätobjekt — live-sond visar
  WM_NORMAL_HINTS min 480x640 på :10 än idag (0x600003, 01:33 UTC); skalan
  var INTE skydd mot den klassen (412-skrivbordet är redan smalare än
  app-min). Rådets dom (U19 §2.3): telefonporträtt via remote är "robotens
  och kundens bästa geometri". Båda webbrockarna (6080/6081) serverar
  SAMMA web-rot → samma defaults → kontraktet gäller symmetriskt.

## Fynd D — bevakningsluckan (U18 §4-klass): hälsan bevakade inte landningen

- **Fynd:** desk-halsa kontrollerade defaults.json (resize=remote) men
  aldrig landningsfilens innehåll — svävningsklassen är BEVISAD: r314
  bokförde ett fabriksbarn som 23:56 skrev tillbaka scale i defaults.json.
  Utan bevakning kan fynd A/B/C försvinna lika tyst.
- **Kur (verkställd):** ny kontroll **`landning-fil`** i desk-halsa.mjs
  (läser /var/www/desk/index.html — filnivå som webrot-kontrollerna 6a/6b,
  kräver ej DESK_AUTH): FAILar om (i) title saknar TITEL_MARKE (samma
  markör som 5a — ett sanning-par), (ii) 'resize=scale' återkommer,
  (iii) trasig sluttagg './p>' återkommer. Header-dokumentationen
  utökad (kontroll 7).

## Bevis — FÖRE/EFTER (samtliga egna mätningar, UTC)

| Bevis | FÖRE (01:35–01:36) | EFTER (01:36–01:40) |
|---|---|---|
| sha256 index.html | 9878662834ceb…c5ab7331 (mtime 01:00:23) | c26f59f6d80de…16e41563 (mtime 01:36:37) |
| grep 'skivbordet' i index.html | 1 (rad 8) | **0** |
| grep 'resize=scale' i index.html | 2 (rad 79, 82) | **0** |
| grep './p>' i index.html | 1 (rad 92) | **0** |
| desk-halsa | RESULTAT: 6/6 PASS (3 auth-SKIP), exit 0 | **RESULTAT: 7/7 PASS (3 auth-SKIP), exit 0** — ny rad: `PASS landning-fil: title "AK1A Lab — ZCode-skrivbordet" + ingen scale-pin + inga trasiga sluttaggar` |
| node --check desk-halsa.mjs | — | OK (syntax) |
| GET https://lab.ak1nvestor.com/desk/ utan auth | 401 | 401 (bommen opåverkad) |
| GET /desk/h (root-yta) | 302 → …resize=scale… | 302 → …resize=scale… (**OFÖRÄNDRAD — rot-kö R9**) |
| GET 127.0.0.1:6080/{vnc.html,hjalp.html,defaults.json} | 200 ×3 | 200 ×3 (webbrock opåverkad) |
| GET 127.0.0.1:6081/{vnc.html,defaults.json} | 200 ×2 | 200 ×2 |
| defaults.json serverat (6080) | resize remote · quality 3 · compression 2 | d:o (orörd av denna våg) |

Titel-kontrollen 5a (HTTPS-grenen) är SKIP i denna miljö (DESK_AUTH ej
satt — lösenordet gissas/läses ALDRIG, svitens kontrakt): titelbeviset bärs
av (a) filinnehållet + hash och (b) nya kontrollen landning-fil som kör
SAMMA title-logik (regex + includes(TITEL_MARKE)) på disk — paret är
samordnat i EN leverans, vilket var U18 C4:s kärnkrav. Nästa
DESK_AUTH-satta hälsokörning får 5a grön direkt (title och markör matchar).

## ROT-KÖ (nya rader — /etc ägs av root-ronden, ALDRIG rörd här)

| # | Förslag | Fil |
|---|---|---|
| R9 | `location = /desk/h` 302:bär `resize=scale` (belagt: curl 302 → redirect_url …resize=scale…; oförändrad före/efter denna våg) — stryk parametern för symmetri med landningens länk (defaults resize=remote gäller via 6081:s web-rot) | /etc/nginx/sites-enabled/ak1a rad 30 |
| R10 | U21 §6:s befintliga R1–R8 kvarstår obrutna (websockify-User/bindning, startzoom, readiness-poll, SecurityTypes, depth 16 …) | se DESK-U21 §6 |

## Medvetet lämnat (öppet för syskon/andra vågor)

- **U22-implementationen** (orientation a+b+c i app/ui.js) — utredningens
  beslutsägare är huvudsessionen; större yta än denna trippel.
- **U16 A2-mätningen** (px utanför per orientering) — U19 steg 4:s
  besöksfönster; min live-sond (min 480x640 kvar) är underlaget.
- **U18 C5/U19 steg 5 robot-cert v2** — huvudsessionens cert-yta.
- **Stavfel-liknande** i löpande brödtext ("Ligger du ner den?" rad 83)
  lämnas — innehållsredigering är D3/huvudsessionens yta; denna våg
  rättade ENDAST protokollbelagda/objektiva fel.

## KVD

- **Kod:** verktyg/desk-halsa.mjs (node --check OK; hälsokörning 7/7
  GRÖN före/efter — sviten aldrig nivåsänkt, bara utökad med en kontroll);
  src/ orörd; `node node_modules/typescript/bin/tsc --noEmit` kört (se
  commit-kvitto) — ingen bygge (verktyg + data = ingen prod-påverkan).
- **R2:** priser/tier/publicering orörda; data/blogg orörd; inget
  finansiellt innehåll (2007:528 orörd); GDPR: ingen kaka, ingen
  insamling — rena filrättningar i kundens egen landning.
- **Ytor:** core/vendor/mandatory.json/defaults.json orörda; /etc + /usr
  orörda (R9 endast föreslaget); desk-sessioner opåverkade (inga
  omstarter; webbrockarna svarade 200 genom hela fönstret).

## Källförteckning

- K1 = DESK-U18-UPPLEVELSE-EXPERT.md C4 (rad 217-221 — kurformen), C1-C3
  (redan landade, verifierade borta/gröna i denna vågs svep).
- K2 = DESK-U17-NAT-EXPERT.md B4 rad 233 (stavfelet), A1 (scale-pin-klassen,
  via U19 §1:39-47).
- K3 = DESK-U19-RADSDOM.md steg 2 (rad 175-195 — dokumentpaketet SAMORDNAT),
  §2.3 (rad 110-111 — remote-porträtt som kundens bästa geometri).
- K4 = DESK-U20-SETDESKTOPSIZE.md (kedjan bevisad hel; fynd 4 autoconnect-
  brytlänken — kvarhållen i länkarna).
- K5 = DESK-U13V2-PARITETSSYNTES.md (remote-kontraktet) + worklog r313/r314
  (5515c7c1-invarianten; defaults-återfallet 23:56 = svävningsklassen).
- K6 = DESK-U21-LATENSIMPL.md (defaults-läget quality 3/compression 2 —
  orört; rot-köns_format).
- M1-M16 = mätningstabellen ovan + anspråksfilen + fabriksstatus
  (klara=[] vid anspråk).

RESULTAT: 3 fynd rättade (A titelstavfel SAMORDNAT över git-gränsen enligt
U18 C4:s kurform · B trasig </p> · C scale-pin struken ur båda entréerna) +
bevakningskontroll landning-fil född (7/7 PASS) + rot-kö R9 (nginx-302:ns
scale-pin) — landningen är nu i fas med U13V2:s remote-kontrakt på ALLA
ak1a-ägda entréer

---

## EFTERORD (02:00 UTC) — kontrollens första fångst: återfall inom 12 minuter, fångat och kurat

Vakten föll inte i glömskan efter leverans — den ARBETAR. Tidslinje:

- **01:36:37** — min rättad version (hash c26f59f6…, 7/7 PASS).
- **01:45:48** — filen omskriven (hash 6b96b1f9…, 5 823 byte): ett syskon
  i samma fabrikmanifest (u2, ingen LEVERANS-logg ännu vid 02:00) lade
  till rad 83 "Automatisk storlek (beta)" (explicit resize=remote) + rad
  84:s "Zoom-minnet finns nu per håll" (dokumenterar u3:s U22-leverans
  c8fd21c7) — men skrev från det GAMLA innehållet (läst före 01:33,
  före anspråksfilen) och återupplivade alla tre felen: klassisk
  **lost-update** (samma klass som s10-u2 F3-clobbern; anspråksfilen
  fanns men lästes för sent av syskonet).
- **~01:49** — SLUTKÖRNINGEN av denna vågs hälsosvit: `FAIL landning-fil:
  landningens title är "AK1A Lab — ZCode-skivbordet"` — **kontrollens
  första äkta fångst, 12 minuter efter sin födelse.** Beviskedjan
  fungerar exakt som designad (fynd D:s syfte).
- **02:00:05** — KUR: syskonets tillägg BEVARADES (rad 83-84 kvar — de
  dokumenterar kundvärde från u3:s våg), mina tre rättningar
  återapplicerade ovanpå. Slutläge: hash f6830e42…, **7/7 PASS**
  (`PASS landning-fil: title "AK1A Lab — ZCode-skrivbordet" + ingen
  scale-pin + inga trasiga sluttaggar`).

Noteringar till emottaget: (1) sidan har nu tre entréer — huvudknappen
(defaults remote) + liggande (defaults remote) + betalinken (explicit
remote): funktionellt samstämmiga, copy-polering är huvudsessionens
D3-yta; (2) protokollnumret U23 kolliderar med u3:s
DESK-U23-VYZOOM-ORIENTERING.md (båda valda parallellt 01:3x) — här
kallad "U23-landning", u3:s "U23-vyzoom"; nästa protokoll tar U24+;
(3) om syskonet skriver igen fångar landning-fil-kontrollen det —
grunden står, sweeprapporterna ljuger inte.
