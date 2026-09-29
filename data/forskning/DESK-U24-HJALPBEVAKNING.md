# DESK-U24 — HJÄLPBEVAKNINGEN: hälsan lär sig hjälpsidans väg (U19 steg 6b)

**Fabrikuppdrag:** auto-s11-1790645110002 s11-u2 (BYGGARE, spår 11 DESK A-Ö)
· **Datum:** 2026-09-29 02:05–02:20 UTC · **Ägarskap:** verktyg/desk-halsa.mjs
+ detta protokoll. Anspråk FÖRE ingrepp: data/vakten/
auto-s11-1790645110002-u2-ansprak.md (02:10 UTC; syskonet u1 av omgången
startade 02:05 med samma "välj själv"-brief — anspråket är koordinationssignalen).

**Valgrund (duplikatkontroll):** worklog r314–r317 + PIPELINE-KO + DESK-U19–U23
visade: strömmätaren LEVERERAD (desk-strommatare.mjs + pumpor-rad r316 — första
kandidaten ryker); U19 steg 2 landat (U23-landning); U22 levererat (vyzoom);
rot-kö R1–R9 = root-rond. Kvar ÖPPET och uttryckligen fabrikens yta: **U19
steg 6b, svit-delen** — "/desk/hjalp.html som fjärde http-auth-kontroll" —
med U18 B4:s lucka "hjalp.html obevakad" (§2.6: "auth-trion permanent SKIP i
cron-läget + hjalp.html obevakad"). Protokollnumret U24 följer U23-landningens
notering "nästa protokoll tar U24+" (U23 kolliderade med vyzoom-vågen).

---

## Bakgrund — varför denna kontroll

- /desk/hjalp.html serveras via nginx:s `/desk/*`-**proxygren** till
  websockify 6080 — en ANNAN nginx-gren än landningens exakta match `= /desk/`.
- U17 A1 bevisade klassen: hjalp-rättningar landade i den DÖDA kopian medan
  den serverade vägen behöll felet. U18 B4/U19 steg 6b drog slutsatsen: hälsan
  skall bevaka JUST den serverade hjälpside-vägen — både bommen (401 utan
  auth) och leveransen (200 med auth).
- FÖRE-mätning (02:09 UTC): `curl /desk/hjalp.html` utan auth => **401** —
  bommen täcker proxy-grenen I DAG. Kontrollen är alltså inget akut fel utan
  **regressionsskyddet**: tappar nginx-grenen `auth_basic` (rot-kö-klass,
  /etc = root) FAILar hälsan inom nästa pulsslag i stället för att ligga
  tyst tills en portskanner hittar hjälpsidans innehåll öppet.

## Fynd A — bevakningsluckan: hälsan kände inte till hjälpsidans väg

- **Fynd:** desk-halsa kontrollerade landningens bomm (kontroll 1) men aldrig
  `/desk/hjalp.html` — U18 §4:s fyra självläkningsglapp, rad 4: "hjalp.html
  obevakad (U18 B4)". U19 steg 6b befallde: "+ /desk/hjalp.html som fjärde
  http-auth-kontroll".
- **Kur (verkställd):** ny kontroll **`http-hjalp-401`** (kontroll 1b, körs
  direkt efter landningens 401-kontroll): GET /desk/hjalp.html UTAN auth =>
  exakt 401, annars FAIL med pek på proxy-grenen.

## Fynd B — auth-kontrollerna kände ej heller hjälpsidan (med-auth-sidan)

- **Fynd:** auth-gruppen (kontroll 5) mätte /desk/, /desk/vnc.html och
  /desk/app/ui.js med auth — hjälpsidan saknades även där.
- **Kur (verkställd):** fjärde auth-kontroll **`http-auth-hjalp-html`**
  (httpAuthFil-mönstret): GET /desk/hjalp.html med DESK_AUTH => 200. UTAN
  DESK_AUTH => SKIP — dokumenterat läge (lösenordet gissas/läses ALDRIG,
  svitens kontrakt); kontrollen aktiveras automatiskt vid första
  DESK_AUTH-satta körningen (root-cron-delen av steg 6b, se nedan).

## Fynd C — dokumentationens talsanna fel: "värstafall ~24 s" med fyra anrop var redan passerat, sex gör det säkert

- **Fynd:** DETERMINISM-avsnittet hävdade "6 s timeout per anrop, värstafall
  ~24 s — under svitens 30 s-tak" men kontrollgrupperna hade redan fem
  anrop (1 + auth-trion ×(200-fall)) — och med 1b + den fjärde auth-
  kontrollen blir det sex: värstafall ~36 s > det utskrivna taket.
- **Kur (verkställd):** DETERMINISM-texten => "sex anrop totalt (1, 1b + fyra
  auth) => värstafall ~36 s, i normaldrift ~2 s"; Summa-raden "(tak 30 s)"
  => "(värstafall ~36 s, se DETERMINISM)". I praktik mätte sviten 0,9–1,5 s.
  Timeout per anrop (6 s) och alla PASS/FAIL-domar orörda — endast
  dokumentationen gör sig skyldig till sanningen igen.

## Förlöparspår — arbetet som städades bort (ärlighetsrad)

Workträdet bar vid sessionens start en ocommittad 4-radig header i
desk-halsa.mjs som dokumenterade kontroll "1b. http-hjalp-401" — men utan
implementation (troligen förra omgångens u2, som enligt U23-efterordet
aldrig levererade). Vid 02:07:27 UTC städades workträdet mot HEAD (den
ocommittade headern försvann; 9 s senare startade prod-synkens bygge —
samma aktör troligen). Denna våg återinför dokumentationen ORDAGRATT och
färdigställer implementationen — dokumentation + kod i EN SAMORDNAD commit
(U18 C4:s princip, tillämpad på sviten själv).

## Bevis — FÖRE/EFTER (egna mätningar, UTC)

| Bevis | FÖRE (02:10) | EFTER (02:15–02:19) |
|---|---|---|
| sha256 desk-halsa.mjs | cc198b055ff4…3dde9bd | b9b4f902f47c…ccf33a287 |
| node --check | OK (HEAD-versionen) | **OK** |
| desk-halsa | RESULTAT: 7/7 PASS (3 auth-SKIP), exit 0 | **RESULTAT: 8/8 PASS (4 auth-SKIP), exit 0** |
| ny rad i utdata | — | `PASS http-hjalp-401: GET /desk/hjalp.html utan auth => 401 (proxy-grenen bakom samma bomm)` + `SKIP http-auth-hjalp-html: …` |
| curl /desk/hjalp.html utan auth | 401 (02:09) | 401 (02:19) |
| curl /desk/ · /desk/vnc.html · /desk/app/ui.js utan auth | 401 ×3 | 401 ×3 (bommarna opåverkade) |
| curl 127.0.0.1:6080/hjalp.html (lokal bro) | 200 | 200 (webbrock opåverkad) |
| tsc --noEmit | — | **0 fel** (node_modules stabilt — ingen npm ci i fönstret; bygget 02:07:36 skriver .next, inte node_modules) |

## ROT-KÖ (oförändrad sammanställning — /etc ägs av root-ronden)

| # | Förslag | Källa |
|---|---|---|
| R9 | nginx `location = /desk/h` 302 bär resize=scale — stryk för symmetri | U23-landning (obruket ännu) |
| R11 | **DESK_AUTH-körningen** av auth-kvartetten (U19 steg 6b root-delen): root-cron eller 600-fil via lakarens sudo-steg — tills dess SKIP-paraden är det dokumenterade viloläget | U19 steg 6b · U18 B4 |

## Medvetet lämnat (öppet för syskon/huvudsession)

- Steg 6b:s ÖVRIGA delar: (a) lakarens eskalering till rot-kö, (c) novnc i
  lakarens vitlista, (d) startzoom readiness-poll — huvudsessionens yta
  (lakare + enheter), ej svitens.
- U16 A2-mätningen (px utanför per orientering) — U19 steg 4:s besöksfönster.
- U18 C5/U19 steg 5 robot-cert v2 — huvudsessionens cert-yta.

## KVD

- **Kod:** verktyg/desk-halsa.mjs (node --check OK; sviten 7/7 FÖRE → 8/8
  EFTER — utökad med två kontroller, ALDRIG nivåsänkt; alla tidigare PASS
  opåverkade); src/ orörd; tsc 0 fel; inget bygge (verktyg + data = ingen
  prod-påverkan — next-bygget 02:07:36 är prod-synkens eget, avvaktat vid
  commit).
- **R2:** priser/tier/publicering orörda; data/blogg orörd; inget finansiellt
  innehåll (2007:528 orörd); GDPR: sviten sätter inga kakor, samlar ingenting
  — läser endast svarskoder från kundens egen kedja.
- **Ytor:** core/vendor/mandatory.json/defaults.json orörda; /etc + /usr
  orörda (R11 endast föreslaget); desk-sessioner opåverkade (inga
  omstarter; webbrocken svarade 200 genom hela fönstret; DESK_AUTH lästes
  aldrig).

## Källförteckning

- K1 = DESK-U19-RADSDOM.md steg 6 (rad 247-263 — befallningens ordalydelse),
  §2.6 (rad 132-140 — U18 §4:s fyra glapp, "hjalp.html obevakad").
- K2 = DESK-U18-UPPLEVELSE-EXPERT.md B4 (auth-trions SKIP-läge + obevakad
  hjalp) via U19 §2.6; §4 rad 272-285 (självläkningsglappen).
- K3 = DESK-U17-NAT-EXPERT.md A1 (rad 229 — serverad väg vs rättad kopia:
  klassen kontrollen fångar).
- K4 = DESK-U23-LANDNINGEN.md (landning-fil-kontrollens födelse + första
  fångst — mönstret denna våg följer; "nästa protokoll tar U24+").
- K5 = DESK-U23-VYZOOM-ORIENTERING.md (u3:s leverans — hjalp-entréns läge).
- M1-M9 = mätningstabellen ovan + anspråksfilen + workträdsstädningens
  tidsvittne (mtime 02:07:27, bygge 02:07:36).

RESULTAT: U19 steg 6b:s SVIT-DEL LEVERERAD — hälsan bevakar nu hjälpsidans
serverade väg på båda sidor bommen (1b: 401 utan auth · fjärde auth-kontroll:
200 med auth) + dokumentationens talsanna fel kurat (sex anrop, värstafall
~36 s) — desk-hälsa 7/7 → 8/8 PASS, curl 401/401/401/401 + lokal 200,
DESK_AUTH-aktiveringen bokförd som rot-kö R11
