# O14 — Externa döda länkar: vakt + bevisad baslinje (spår 8, 2026-09-15)

## 1. Objekt och val-motivering

O9 §5 kö-post 2 (bokad av spåret självt): *"Externa länkar — utgående
http(s)-länkar (källor i analyser, kurser) kontrolleras ej idag: separat våg
med begränsning (head-only, långsam takt, andel 4xx-rapport — externa döda är
inte vårt fel men vårt anseende)"*. Duplikatkontroll före start: spårets sex
tidigare objekt (grind u1, beroenden u2, interna länkar u3, tsc-determinism
u1:2, feljägare-F5 u3:2, vakt-0-fynd u2:2) berörde aldrig externa mål —
data/-karteringens 100-tals domäner är innehållsreferenser, inte renderade
länkar (se §4 fynd 1).

## 2. Metod — verktyg/doda-lankar-externa.mjs (0 npm-beroenden)

Samma grunderbjudande som verktyg/doda-lankar.mjs (som bevisade INTERNA
länkar 0/3 012, o9): sitemap-frö + länkgraf-crawl mot localhost — men
extraheringen plockar absoluta http(s)-href med annan origin (egen publik
domän och localhost räknas som interna). Varje unikt externt mål valideras
SKONSAMT och klassificeras i fem domar:

| Klass | Betydelse |
|---|---|
| OK | 200–399 efter följda omdirigeringar |
| BLOCKERAD | 401/403/429 — kan ej maskinverifieras, inte vår rot |
| DOD | 4xx kvarstår på GET — bevisat död länk |
| SERVERFEL | 5xx kvarstår efter ett omtryck — troligen transient |
| OUPPNABAR | DNS-fel/anslutningsvägran/timeout (felkod redovisas: ENOTFOUND ≈ död domän, ECONNREFUSED/timeout = annat) |

Skonsamhetskontrakt mot externa värdar: aldrig mer än en pågående
förfrågan per domän, max 4 domäner parallellt, kroppen läses aldrig
(`body.cancel` direkt efter svar), tidsgräns 15 s, tak 1 500 URL:er, inga
omtryck utöver 5xx. Insamlingen mellanlagras på disk FÖRE externa nätanrop
(`--validera-fran` återupptar utan omcrawl). Offline-självtest `--sjalvtest`
verifierar klassificeraren mot lokal http-server + frigiven port: 6/6 PASS
(200, 301→200, 404-på-GET, HEAD-404-men-GET-200, 5xx-kvarstår, ECONNREFUSED).

## 3. Bevis

- Skarp körning 2026-09-15 23:30–23:41 UTC: **2 050 sidor crawlide, 308
  unika externa mål, 242 s** (valideringen 36 s vid om-körning ur
  mellanlagret).
- **FÖRE (med naiv HEAD-litening): 1 DOD — https://www.imy.se/ 404, länkad
  från /privacy-policy.**
- Manuell diskriminering: HEAD = 404 men GET = 200 (även med webbläsar-UA);
  https://imy.se/ → 302 → www → 200. Länken i
  `src/app/(huvud)/privacy-policy/page.tsx:179` är LEVANDE — FALSKLARM.
- ROTORSAKSKUR i verktyget (innan någon rapport släpptes): varje 4xx-dom på
  HEAD (utom 401/429 — autentisering skall bekräftas aldrig, rate-hänsyn
  respekteras) bekräftas med ett GET innan klass DOD, ty GET är vad en
  besökare gör. Självtest utökat med just imy-mönstret → PASS.
- **EFTER (kurerat verktyg): DOD 1→0 · OUPPNÅBAR 0 · SERVERFEL 0 · OK 104 ·
  BLOCKERAD 204. Baslinjen: 0 bevisat döda externa länkar.**
- tsc 0 (projektbinär `node node_modules/typescript/bin/tsc --noEmit`).
  Ingen src/ ändrad (privacy-policy-länken visade sig levande) = inget bygge.

## 4. Fynd

1. **Den renderade länkgrafen länkar ut till ENDAST 5 domäner** (av 2 050
   sidor): www.adlibris.com (102), www.bokus.com (102), www.amazon.com
   (102), ak1nvestor.com (1), www.imy.se (1). De 100-tals källdomäner som
   finns i data/-filer är innehållsreferenser som INTE renderas som <a
   href> — vaktens yta är rätt avgränsad till det besökaren kan klicka.
2. **BLOCKERAD 204/308 är samtliga 429** från adlibris+bokus — alla mot
   sök-endpoints (`/sok?q=…`). Diskriminerande tester: 6 s mellanrum →
   fortfarande 429; webbläsar-UA + 30 s paus → fortfarande 429. Butikernas
   IP-skydd på sök-url:er kan inte kringås artigt = BLOCKERAD är den ärliga
   domen, exakt vad klassen betyder ("kan ej maskinverifieras"). Amazon
   svarar 200 på samtliga 102 — metodens giltighet är motståndarbevisad.
3. **Boklänkarna är DYNAMISKA sök-URL:er** genererade ur boktitlar
   (`src/components/ak1a/kallkort.tsx:42`, `src/app/(huvud)/kallor/page.tsx:82`)
   — de rostar inte i klassisk mening (sökfrågor svarar nästan aldrig 404),
   riskbilden är butikspolicy-ändringar. Rotorsaksadress vid framtida fynd
   är alltså komponenten, inte 306 statiska strängar.
4. **IMY-mönstret (HEAD-404/GET-200) är en klassisk falsklarmsfälla** för
   HEAD-baserade länkvakter — utan GET-bekräftelse hade vakten larmat död
   länk på kundens integritetspolicy-sida. Kurerat och självtestat i
   verktyget från fösta leveransen.

## 5. Slutsats — läget

**Utgående länkar: 0 bevisat döda av 308 unika mål; 204 kan ej maskinverifieras
(bot-skydd, ej vårt fel); 104 verifierat levande.** Objektet MÄTT + BEVISAT +
MEKANISERAT. Externa döda är inte vårt fel men vårt anseende — med denna
baslinje är anseendets noll bevisat, inte antaget.

## 6. Kö (nästa på detta objekt)

1. **Cronifiering** jämte interna vakten (crontab ägs av huvudagent/infra —
   BOKAT dit, o9 §5 punkt 1 gäller gemensamt: interna + externa i samma
   familj). Larm vid DOD/OUPPNABAR > 0.
2. **BLOCKERAD-uppföljning**: vid ett lugnare IP-läge (annan tidpunkt/dag)
   kan adlibris/bokus ge 200 — vakten skall INTE döma om förrän den faktiskt
   kan; 204-fönstret är observation, inte skuld.
3. **OUPPNABAR-vaktdom**: om ENOTFOUND (domän borta) dyker upp på egen
   rotdomän-länken ak1nvestor.com = händelse för huvudagenten direkt.

## 7. Återanvändning

```bash
node verktyg/doda-lankar-externa.mjs --sjalvtest   # offline-bevis av klassificeraren
node verktyg/doda-lankar-externa.mjs               # full crawl + validering
node verktyg/doda-lankar-externa.mjs --validera-fran data/vakten/doda-lankar-externa-2026-09-15-insamling.json
# utdata: data/vakten/doda-lankar-externa-<datum>.json (+ -insamling.json mellanlager)
```

Vid fynd: JSONens `kallor`-fält per mål = exakt vilka sidor som länkar dit;
domänfältet + status ger domen. Rådata för 2026-09-15 ligger på disk
(data/vakten/, otrackad enligt o9-mönstret).
