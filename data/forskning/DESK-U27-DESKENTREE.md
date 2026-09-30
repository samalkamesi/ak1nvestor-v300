# DESK-U27 — DESK-ENTRÉN: hälsans falsklarm mot EN-TRYCKS-direktentrén kurerat (kontroll 1 + 5a lär sig nya sanningen)

**Fabrikuppdrag:** auto-s11-1790794523042 s11-u1 (BYGGARE, spår 11 DESK A-Ö,
"nästa i spåret — rätta fynd ur DESK-protokollen") · **Datum:** 2026-09-30
19:05–19:30 UTC · **Ägarskap:** verktyg/desk-halsa.mjs (repo) + denna protokoll
+ anspråksfilen (u1, skriven FÖRE ingrepp + koordinationsuppdaterad 19:20) +
worklog-rad.

---

## 0. Sammanfattning för kunden (icke-teknisk)

Din en-trycks-ingång till skrivbordet (tryck EN gång — du kommer rakt in i
strömmen, sedan i morse) fick vår hälsokoll att tro att något var trasigt:
hälsan höll fortfarande koll på den GAMLA ingången. Falsklarmet är nu borta,
och hälsan bevakar i stället ALLA tre dörrarna i den nya kedjan: själva
snabbingången (skall leda rakt in), välkomstsidan på sitt nya ställe (skall
vara låst) och strömmen bakom snabbingången (skall vara låst). En växel som
byter mellan stående/liggande läge står stilla sedan i går — det är ett annan
agents fynd och ligger i kön åt rätt ägare (rot-kön).

## 1. Fyndet — ett AKTIVT falsklarm fångat av FÖRE-körningen

Vågens rutin (FÖRE-mätning före varje ingrepp) gav:

```
FAIL http-landning-401: förväntade exakt 401 utan auth, fick 302 — basic
     auth-bommen på exakt /desk/ är botten eller förändrad
RESULTAT: 7/8 PASS
```

**Rot — inte ett kedjefel utan ett kontraktsfel i hälsan:**

- nginx-konfen `/etc/nginx/sites-available/ak1a` (mtime 2026-09-30 05:33:44,
  R349/R350-eran — kunddirektivet "kunden trycker EN gång") gör `exakt /desk/`
  + `/desk` till **302-direktentré** rakt till strömmen:
  `Location: https://lab.ak1nvestor.com/desk/h/vnc.html?autoconnect=true&…`,
  medan LANDNINGSSIDAN (`/var/www/desk/index.html`) flyttats till
  **`/desk/start`** bakom sin egen auth_basic-bomm (konfen rad 21–28).
- Hälsans kontroll 1 bar fortfarande D1-r289-kontraktet ("exakt /desk/ =>
  401, landningssidan lever där") och falsklarmade alltså VARJE körning sedan
  05:33 — min FÖRE-körning 19:05 är det första belagda larmet (hur många
  cron-körningar däremellan som FAILat kan denna våg inte belägga —
  ärlighetsrad, se § 6).
- Latensfel i samma klass: kontroll 5a `http-auth-landning` förväntade
  `200 + landningstitel` på `/desk/` MED auth — men nginx `return`-satsen
  styrs inte av auth, så den kontrollen skulle FAILa i root-cron
  (DESK_AUTH-satt läge) trots hel kedja.

**Säkerhetsläget verifierat FÖRE kur (inget hål, bara fel förväntan):**
`/desk/start` utan auth = 401 · `/desk/h/vnc.html` utan auth = 401 (båda
bommar lever) · `/desk/hjalp.html` = 401 · `/desk/index.html` = 401.

## 2. Kuren — kontroll 1 och 5a lär sig direktentré-kontraktet

I `verktyg/desk-halsa.mjs` (repo-ytan; /etc berördes ALDRIG — läs-endast):

1. **`http-landning-401` → `http-desk-entree`** — bevakar TRE delkontrakt i
   en kontroll: (a) `/desk/` utan auth => exakt 302 + Location (normaliserad
   från absolut URL) som börjar på `/desk/h/vnc.html` OCH innehåller
   `autoconnect=true` — fångar både svävning som lägger tillbaka landningen
   på entrén OCH tappad autoconnect ur direktvägen; (b) `/desk/start` utan
   auth => exakt 401 (landningens hem får aldrig ligga öppet); (c)
   `/desk/h/vnc.html` utan auth => exakt 401 (ström-målet bakom 302:ns slut).
   Bevakningen är STARKARE än före (tre bommar+väg kontra en).
2. **`httpAuthLandning`** mäter nu `/desk/start` med auth => 200 + TITEL_MARKE
   (landningens serverade hem — title-kontrollen följer med flytten).
3. **`hamta()`** bär `headers` i svaret (Location-läsning krävdes; inga
   övriga konsumenter påverkas — tilläggsfält).
4. **DETERMINISM-räkningen:** sex → åtta HTTP-anrop (1: tre delkontrakt,
   1b + fyra auth) => värstafall ~48 s; dokumentationen noterar att kontroll
   1 är den ENDA som förväntar en 3xx (302 är själva kontraktet den bevakar).
5. **Dokumentationshuvud + arkitekturnotering + kontroll-7-beskrivning**
   synkade till nya serveringslogiken (inkl. R318+R327: scale-pin på
   landningens knappar = kundvägen, bevakas inte som fel — detaljraden säger
   nu sanningen).

**Egen felning under utvecklingen (bokförd):** första versionen av
Location-kontrollen jämförde med relativt prefix — nginx skickar Location
SOM ABSOLUT URL. Kontrollen FAILade rätt på sin egen brist (19:11), varefter
normaliseringen `replace(/^https?:\/\/[^/]+/i, '')` lades till. Exakt den
självrättnings-loopen kontrollen är byggd för.

## 3. Syskonsamordningen — tre agenter, samma spår, nOLL duplikat-leverans

Uppdraget "välj själv nästa" gav en kollision (GAP 1+2-patchen var U24 §6:s
rekommendation 1 — uppenbar kandidat för alla tre): u2 anslår 19:06 (ui.js +
hjalp + vnc.html-tooltips + strukturtest + protokoll U26), jag 19:08, u3
19:11/19:15 (samma GAP 1+2 + landningens nyp-rad + DESSUTOM samma
desk-halsa-falsklarm + två nya driftfynd). Upplösning:

| Yta | Ägare | Min hantering |
|---|---|---|
| desk-web/app/ui.js (GAP 1+2-koden) | u2 + u3 (u2:s anslag först) | **ORÖRD av mig** — 0 rader skrivna; min FÖRE-hash e2a10ab7… = U23-versionen, deras 19:12-version e84a466d… orörd |
| desk-web/hjalp.html | u2/u3 (uppdaterad 19:12:58 av dem) | orörd av mig |
| /var/www/desk/index.html :106 (nyp-raden) | u3 (deklarerad, orörd än) | orörd av mig |
| verktyg/desk-halsa.mjs | **JAG (u1)** — verkställt 19:08–19:14 | u3 meddelad via koordinationssektionen i min anspråksfil: "kör FÄRSK Read på HEAD, bygg VIDARE (era -land-basenheter är komplementära)" — lost-update-klassen enligt DESK-U23-efterordet |
| Protokollnumret U26 | u2/u3 (båda deklarerar det) | mitt protokoll = U27 |

Fabrikens Edit file-state-vakt är det mekaniska skyddet om anspråksfilen
missas: u3:s Edit mot desk-halsa.mjs mot HEAD-versionen avvisas tills de
läser om — koordinationen har alltså TVÅ lager.

## 4. Bevis — FÖRE/EFTER (egna mätningar, UTC)

| Bevis | FÖRE (19:05) | EFTER (19:14) |
|---|---|---|
| desk-halsa.mjs | **7/8 PASS** (FAIL http-landning-401 "fick 302"; 4 auth-SKIP enligt kontrakt) | **8/8 PASS** — "PASS http-desk-entree: /desk/ => 302 autoconnect-direktentré · /desk/start => 401 (landningens hem) · målet => 401 (strömmen bakom bommen)" (4 SKIP oförändrat) |
| kontroll 5a (med auth) | (latent trasig: /desk/ med auth => 302 ≠ 200) | mäter /desk/start — SKIP i fabriksfönstret (DESK_AUTH ej satt), kontraktet synkat för root-cron |
| GET /desk/ utan auth | 302 (Location absolut till /desk/h/vnc.html?autoconnect…) | d:o — oförändrat, kontraktet ANPASSAT |
| GET /desk/start utan auth | 401 (bommen lever) | 401 |
| GET /desk/h/vnc.html utan auth | 401 | 401 |
| GET /desk/hjalp.html utan auth | 401 (kontroll 1b PASS före som efter) | 401 |
| 127.0.0.1:6080/vnc.html · 6081/vnc.html | 200 · 200 | 200 · 200 (båda webbrockarna) |
| node --check desk-halsa.mjs | OK | OK (efter alla ändringar) |
| systemd | 9 zdesk-enheter active + **zdesk-vaxlare inactive/dead** (u3:s fynd B — deras rot-kö) | d:o (växlaren lämnad åt rot-kön; landskapsstacken :11 800x360 + zcode-land LEVER, u3:s omstart bärandes) |
| xrandr :10 | 412×915 VNC-0 connected (hälsans invariant PASS) | d:o |

- Före/efter-kvantitet: `git diff` i commiten (kontroll 1 + 5a + hamta +
  fyra dokumentationsblock + Summa-radens ~36→~48 s).
- src/ orörd ⇒ ingen prod-påverkan; `node node_modules/typescript/bin/tsc
  --noEmit` kört vid commit (kvitto i commit-meddelandet). INGET bygge.

## 5. Kvarvarande — ärligt

1. **Live-telefonprov** av direktentréns hela resa (302 → bomm → autoconnect
   → ström) är kundens nästa besök — kodläsning + curl-kedjan bär leveransen
   (samma bevisgrad som svitens övriga kontrakt).
2. **DESK_AUTH-satt root-cron-körning** av 5a mot /desk/start återstår att
   se PASS (SKIP i fabriksfönstret är dokumenterat viloläge, rot-kö R11).
3. **zdesk-vaxlare.service dead** = u3:s fynd, deras/rot-köns bord — här
   endast belagt (list-units 19:18).
4. Metodnotis från historien: DESK-U25:s "curl 401×2"-kvitto för /desk/
   (09-29 02:24) var förenligt med dåvarande konfen; direktentrén tillkom
   05:33 DAGEN EFTER — men lärdomen står: **curl-kvitton MÅSTE deklarera
   -L eller ej** (med -L blir en 302-kedjas sista kod 401 och mellanstegets
   redirect döljs). Denna svit mäter redirecter medvetet EJ.

## 6. Juridik & ytor

Ren infrastruktur-svit: inget finansiellt innehåll, inga råd — lagen
(2007:528) berörs ej. R2 orörd (priser/tier/publicering). /etc + /usr LÄSTA
aldrig rörda (nginx-konfen rad 21–28 citerad som rot-belägg). desk-web-ytorna
(ui.js/hjalp/defaults) orörda av mig — syskonens leverans. GDPR/kakor: mätning
= HTTP-statuskoder mot serverns egna URL:er, ingen persondata, ingen kaka.

## 7. Källförteckning

- K1 = /etc/nginx/sites-available/ak1a rad 19–30 (läst 2026-09-30 19:0x:
  direktentré-raden + /desk/start-blocket + prefix-proxyn) — mtime 05:33:44.
- K2 = verktyg/desk-halsa.mjs HEAD-före (kontroll 1/5a/DETERMINISM som denna
  våg ändrade; citat i § 1).
- K3 = DESK-U24-HJALPBEVAKNING.md (kontroll 1b:s födelse + svitens
  determinism-rad ~36 s — uppdaterad av denna våg).
- K4 = DESK-U25-A2-TALEN.md (föregående vågens 8/8 + curl-kvito-mönstret som
  § 5.4:s metodnotis nyanserar).
- K5 = syskon-anspråken data/vakten/auto-s11-1790794523042-u2-ansprak.md
  (19:06) + -u3-ansprak.md (19:11/19:15) + fabriksstatus (3 pågår, 0 klara
  vid 19:16).
- K6 = DESK-U23-LANDNINGEN.md efterord (lost-update-klassen + hash-kvitto-
  tvånget som § 3 bygger på).
- M1–M8 = mätningarna i § 4 (hälsakörningar, curl-kedjan, list-units,
  pgrep-processerna, konf-stat).

## RESULTAT

FALSLARMET KURERAT OCH BEVAKNINGEN STÄRKT: kontroll 1 lärde sig EN-TRYCKS-
direktentréns kontrakt (302+autoconnect · /desk/start 401 · mål 401 — tre
delkontrakt mot tidigare ett), kontroll 5a följde landningen till /desk/start,
Location-normalisering + DETERMINISM ~48 s synkat; desk-halsa 7/8 → 8/8 PASS
med curl-401-kedjan och båda webbrockarna gröna; kollisionen tre agenter —
samma GAP 1+2-spår löst med NOLL duplikat-leverans (ui.js/hjalp/landningen
orörda av mig, ägda av u2/u3 enligt anslagstider; protokoll U26 lämnat till
dem, detta = U27); sidobelägg: zdesk-vaxlare dead (u3:s rot-kö) medan hela
landskapsstacken och båda brockarna lever.
