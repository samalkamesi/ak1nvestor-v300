# DESK-U30 — R352-KONTRAKTSFÖLJDEN: skälläkarens falsklarm kurat, entrékontraktet följt efter REN-konfigen, r352:s nya ytor bevakade

**Fabrikuppdrag:** auto-s11-1790855728248 s11-u2 (BYGGARE, spår 11 DESK A-Ö)
· **Datum:** 2026-10-01 11:58–12:1x UTC · **Ägarskap:** verktyg/desk-halsa.mjs +
detta protokoll + anspråksfil + worklog-rad. /etc LÄST aldrig skrivet.

---

## § 0 Sammanfattning för kunden (icke-teknisk)

Serverns nya inställningar (nya servern, 30 september 22:23) flyttade entrance-
knappen till skrivbordet från en adress till en annan. Vår hälsokontroll mätte
fortfarande den gamla adressen och trodde att allt var trasigt — och
underhållslikaren, som startar om programmet när hälsan säger fel två gånger
i rad, startade därför om ditt ZCode-skrivbord **i onödan klockan 11:31 i
dag**. Detta protokoll är kuren: hälsan mäter nu de riktiga adresserna
(9 av 9 grönt) och bevakar även de två nya sidor som kom med inställningarna
(telefonsidan och larmsidan). Nästa underhållskörning 12:30 ser grönt — inga
fler onödiga omstarter.

## § 1 Fyndet — kontraktsdrift efter REN-konfigen r352

**FÖRE-körning (12:00:06, oförändrad kod):** desk-halsa kontroll 1
http-desk-entree FAILade:

```
FAIL http-desk-entree: förväntade 302-direktentrén utan auth, fick 401 —
nginx /desk/-blocket förändrad (landningens hem är /desk/start sedan
EN-TRYCKS-entrén)
RESULTAT: 7/8 PASS
```

**Rot — INTE kedjefel utan KONTRAKTSFEL (U27-klassens exakta upprepning):
"doktrinbyte utan kontraktsföljd".** nginx-konfigen
(/etc/nginx/sites-available/ak1a, mtime 2026-09-30 22:23, huvudkommentar
"r352: zcode-proxy borta") förändrade serveringslogiken:

| Yta | U27-kontraktet (mätandes) | r352-verkligheten (curl-belagt 12:01) |
|---|---|---|
| exakt `/desk` (utan snedstreck) | (mättes ej) | **302** → `/desk/h/vnc.html?autoconnect=true&resize=scale&show_dot=true` |
| `/desk/` (med snedstreck) | **302** direktentré | **401** — auth-bakad proxy till 6080 (porträtt-webbrocken) |
| `/desk/start` | 401 (landningens hem) | 401 (oförändrat) |
| `/desk/h/vnc.html` | 401 (ström-målet) | 401 (oförändrat) |
| `/desk/hjalp.html` | 401 (1b) | 401 (oförändrat) |
| `/desk/telefon.html` | fanns ej | **401** — NY exakt gren, proxy 6080 (telefonlandningen i web-roten) |
| `/desk/larm.json` | fanns ej | **401** — NY exakt gren, proxy 6080 (vakttornets larmbanner) |

r352 är huvudsessionens/kundkanalens beslut (REN-konfig efter serverflytten
till SSD Nodes) — lika lite fel som 302:an var det i U29 ("kundens EN-TRYCKS-
direktiv, inget fel"). Vårt kontrakt hade bara inte följt efter. Notera att
scale-pinen nu sitter I nginx 302-raden (resize=scale&show_dot=true) = R327:s
kundväg, konsekvent med landningens egna länkar (grep-belagt: landningens
href bär exakt samma parametrar).

## § 2 Kundpåverkan — PÅGÅENDE onödig omstart (bevis)

Skälläkaren (/home/ak1a/desk-lakare, cron var 30:e, kör **repo-kopian**
`~/AK1/verktyg/desk-halsa.mjs` — läsning från disk, ingen deploy behövs)
restartar vid TVÅ FAIL i följd kundens zdesk-zcode (vitlistad sudo). Ur
~/desk-halsa.log:

```
2026-10-01T11:30:11+00:00 SJALLAKAREN: desk-halsa MISSLYCKADES (2 i foljd)
2026-10-01T11:30:11+00:00 SJALLAKAREN: lakar — sudo systemctl restart zdesk-zcode (vitlistad)
2026-10-01T11:30:30+00:00 SJALLAKAREN: lakt (zdesk-zcode omstartad)
...
2026-10-01T12:00:12+00:00 SJALLAKAREN: desk-halsa MISSLYCKADES (1 i foljd)
```

11:31-restarten var ONÖDIG (kedjan var frisk — 7 av 8 kontroller gröna, felet
satt i mätänden). Räknaren stod på 1 efter 12:00-körningen ⇒ nästa körning
12:30 skulle bli fel #2 ⇒ EN omstart till. **Kuren landade på disk 12:06:33
(9/9 PASS, exit 0) — 12:30-körningen ser grönt och nollställer räknaren.**
Kundsessionen verifierad levande före/under/efter (x-geometri 412×915 PASS,
fönster 0x600003 maximerat PASS i både FÖRE- och EFTER-körningarna). Detta är
exakt U29:s akutfångst-klass ("lakaren misslökte och startade om kundens
Zcode i onödan") — samma mönster, ny omgång, nu med 23 timmars fördröjning
mellan konfigbyte och kontraktsföljd.

## § 3 Kuren — tre delar, allt i repo-ytan

1. **Kontrakt 1 http-desk-entree:** första delkontraktet mäter nu EXAKT
   `/desk` (utan snedstreck) => 302 + Location börjar `/desk/h/vnc.html` +
   `autoconnect=true` (Location normaliseras från absolut URL — U27:s
   normaliserare behållen). Delkontrakt (b) `/desk/start` => 401 och (c)
   `/desk/h/vnc.html` => 401 orörda — de höll konfigen igen. FAIL-meddelandet
   pekar nu på r352-kontraktet (entrén på /desk, prefixet bakom auth).
2. **NY kontroll 1c http-telefon-larm-401** (U17 A1-klassen — varje serverad
   väg bevakas per yta): `/desk/telefon.html` + `/desk/larm.json` utan auth
   => exakt 401. Fångar att någon av r352:s nya exakta grenar tappar
   auth_basic. Båda ytor lever lokalt (6080 => 200 ×2, mätt 12:01);
   larm.json skrivs var 5:e minut av r332-vakttornet (crontab-belagt) —
   kontrollen mäter BOMMEN, inte innehållet (larmens egen logik äger
   vakttornet, JÄRN-U3).
3. **Dokumentation synkad i svitens huvud:** kontrollbeskrivningar 1 + 1c,
   DETERMINISM (åtta → tio HTTP-anrop, ~48 → ~60 s värstafall), arkitektur-
   noteringen (r352-layouten med exakta grenar + webbrockar), Summa-radens
   värstafall-tal.

Medvetet lämnat: kontroll av `/desk/h` (den andra exakta 302-entrén,
alias för samma mål) — redundant mätning av samma kontrakt håller bara
körtiden uppe; primära entrén `/desk` bär kontraktet.

## § 4 Bevis — före/efter

| Kontroll | FÖRE (12:00:06) | EFTER (12:06:33) |
|---|---|---|
| http-desk-entree | FAIL (mätte /desk/ => 302, fick 401) | **PASS** (exakt /desk => 302 autoconnect · start => 401 · mål => 401) |
| http-hjalp-401 | PASS | PASS |
| http-telefon-larm-401 | (fanns ej) | **PASS** (båda nya ytorna => 401) |
| systemd-enheter (7) | PASS | PASS |
| x-geometri (412×915) | PASS | PASS |
| fonstermaximering (0x600003) | PASS | PASS |
| webrot-vnc-html + defaults-json | PASS | PASS |
| landning-fil | PASS | PASS |
| **RESULTAT** | **7/8 PASS** (exit 1) | **9/9 PASS** (exit 0) |

- `node --check` OK ×3 (före commit).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src orörd,
  inget bygge).
- Curl-kedja utan auth (12:01): `/desk` => 302 (Location absolut, autoconnect
  + resize=scale + show_dot) · `/desk/` => 401 · `/desk/start` => 401 ·
  `/desk/h/vnc.html` => 401 · `/desk/hjalp.html` => 401 · `/desk/telefon.html`
  => 401 · `/desk/larm.json` => 401 · lokala 6080: `telefon.html`/`larm.json`/
  `hjalp.html` => 200 ×3.
- sha256 desk-halsa.mjs: `28233ea5…` (HEAD-föregångaren = U28-versionen)
  → `8067fa6d…`; git diff 64+/33−.
- Skälläkarloggens 12:00-rad = fel #1; kuren på plats 12:06:33 ⇒ 12:30-grönt
  väntas (eftermätning: nästa rads fromhet i ~/desk-halsa.log).

## § 5 KVD

- **/etc + /usr: lästa, ALDRIG skrivna** — r352-konfigen är huvudsessionens
  beslut; min kur FÖLJER den som nytt kontrakt (R327-läran: konfigbyte =
  kundväg, svitens fel är att inte följa efter).
- src/ orörd · R2 orörd (priser/tier/publicering) · data/blogg orörd ·
  desk-web core/vendor/defaults/mandatory orörda · ui.js/hjalp/vnc/landning
  (syskonytor) orörda · DESK_AUTH aldrig satt/läst/gissat · .htdesk läst
  ALDRIG · inga omstarter av kundens session (12:06-körningen är ren läsning
  — sviten dödar/omstartar ALDRIG något).
- Syskonkoordination: anspråk 12:02 (före ingrepp); u1/u3 med samma välj-
  själv-brief hänvisade till min U30-version + protokollnummer U30 taget,
  nästa lediga U31.

## § 6 Källförteckning

- K1 DESK-U27-DESKENTREE.md — U27-kontraktet jag ersätter arvet från (kon-
  troll 1:s föregångare) + "doktrinbyte utan kontraktsföljd"-klassen.
- K2 DESK-U29-NYPVYZOOM.md § 4 — akutfångstklassen (lakarens onödiga omstarter
  18:30+19:00 09-30) + R327-läran "302:an = kundens EN-TRYCKS-direktiv".
- K3 /etc/nginx/sites-available/ak1a (läst 12:01, mtime 2026-09-30 22:23) —
  r352-layouten: exakta grenar /desk, /desk/start, /desk/telefon.html,
  /desk/larm.json, /desk/h + prefix /desk/ (6080) + /desk/h/ (6081).
- K4 ~/desk-halsa.log + ~/desk-halsa-state — läkarjournalen (11:30-restarten,
  12:00 fel #1) och räknarläget.
- K5 /home/ak1a/desk-lakare — läkarens kontrakt (2-fel-tröskel, restart enbart
  zdesk-zcode, repo-kopian är dess mätände).
- K6 crontab (läst) — läkar-cron */30 + r332-vakttornet (larm.json-skrivaren
  var 5:e) + JÄRN-U3-paraplyvaktens larm-yta.
- M1–M3: curl-kedjan 12:01 (tabell § 1), hälsokörningarna 12:00/12:06,
  sha-kvittona § 4.

RESULTAT: falsklarmet kurerat med bevis (7/8 → 9/9 PASS), läkarens omstarts-
hot avvärjt före 12:30-körningen, r352:s båda nya ytor bevakade framöver —
spårets nästa våg läser ~/desk-halsa.log efter 12:30 för det gröna kvittot.
