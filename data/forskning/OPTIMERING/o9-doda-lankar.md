# O9 — Döda länkar: systematisk dödlänksvakt + bevisad baslinje 0 fynd (Spår 8, s8-u3)

Datum: 2026-09-15 · Mätare: `verktyg/doda-lankar.mjs` (NY — 0 npm-beroenden,
Node-fetch) · Mål: localhost:3000 (prod-pm2, whitelistad i middleware) ·
Bevis: `data/vakten/doda-lankar-2026-09-15.json` (otrackad bevisfil, mönster
från s6-u2) + utskrift nedan.

## Varför detta objekt

Spår 8 listar "döda länkar" som evigt objekt — men ingen systematisk mätning
fanns: gamla worklog-rader ("0 döda länkar", våg ~78-epoken) var punktkontroll
av OG-bilder, inte länkgrafen. En 404 är det mest kundsynliga felet som finns:
den finurligaste kurslänken hjälper inte om målet är bort. Gränsnittsvakten
mäter ENBART sidor ur sin prioriterade rotation — den bevisar inte att länkar
mellan sidor leder levande.

## 1. Verktyget

`verktyg/doda-lankar.mjs` — sitemap-frö + full länkgraf-crawl:

- **Frö**: /sitemap.xml (1998 URL:er — sv + /en + /ar speglar).
- **Graf**: varje sida hämtas (GET, följer omdirigeringar), ALLA interna
  `<a href>`-mål extraheras, varje unikt mål kontrolleras tills grafen är
  sluten (djuptak 3 hopp, hårt tak 5 000 sidor).
- **Fynd**: mål med status 0 (nätverksfel/timeout) eller ≥400, med upp till
  25 källsidor per mål = rotorsaksadress direkt i rapporten.
- **Observation**: omdirigeringar listas separat (inte fel, men material).
- **Skonsamhet mot prod**: concurrency 6, tidsgräns 20 s/sida, inga
  återförsök, UA-märkt `ak1a-doda-lankar/1.0 (+vakten)`.
- **Medvetna exkluderingar** (dokumenterade i verktyget): `/studio`,
  `/admin` (sessionstyrda — gränsnittsvaktens bord), `/api/*` (ej länkmål),
  `/logga-ut` (POST-endast, GET 404 är design, länkas aldrig som `<a href>` —
  verifierat: 0 träffar i src/). Externa länkar kontrolleras INTE (framtida
  objekt, se §5).

## 2. Bevisad baslinje (2026-09-15, 2 omgångar)

| Körning | Sökvägar | Döda | Omdirigeringar | Tid |
|---|---|---|---|---|
| Kall (ISR ospolad) | 2 675 | 0 | 0 | 674 s |
| Slutlig (varm ISR) | **3 012** | **0** | **0** | 44 s |

Täckning per prefix (slutlig körning, topp): /ar/kurser 338 · /en/kurser 338
· /en/blogg 56 · /ar/blogg 56 · /analyser/* 20 sida/bolag · + alla sv-sidor,
/dataset (181), /labb (202), /bolag (104), /blogg (56). 3 012 − 1 998 = 1 014
mål hittade ENBAST via länkgraf (inte i sitemap) — bevis att grafcrawlen
täcker det sitemap-alone missar (t.ex. /logga-in, /min-sida, kategorisidor).

## 3. Verktygsvalidering (varför 0:an är trovärdig)

- **Negativt kontrollfall**: `/kurser/finns-inte-skall-ge-404` → HTTP 404
  (direktfetch) — verktygets fyndfilter (`status ≥ 400`) fångar detta; noll
  är alltså ett mätresultat, inte ett parsningsfel.
- **Sitemap-normalisering**: `<loc>`-URL:er använder publika domänen
  (https://lab.ak1nvestor.com) medan mätningen går mot localhost — första
  versionen matchade aldrig fröna (0 sidor). Fixad med URL-parsning som
  normaliserar till sökväg oavsett origin. (Själva buggen = spårets
  rotorsaksfynd nr 1: verktygets förutsättning var osynlig tills den mättes.)
- **Exkluderingsfel**: /logga-in exkluderades först som "sessionstyrd" men
  mäter 200 anonymt — togs bort ur exkluderingslistan; /logga-ut behölls med
  motiveringen ovan. Skillnaden 2 675 → 3 012 sidor.
- **Omdirigering 0** är äkta: servern svarar raka 200/404 (inga
  trailing-slash-redirecter i länkgrafen).

## 4. SLUTSATS — läget

**Länkgrafen är HEL: 0 döda länkar av 3 012 kontrollerade mål.** Ingen
rotorsaksfix i src/ krävs — allt som sajten länkar internt lever. Objektets
läge: MATT + BEVISAT + MEKANISERAT; nästa steg är hållbarheten (§5).

## 5. Kö (nästa i spåret på detta objekt)

1. **Cronifiering** — dödlänksvakt var 6:e timme jämte gränsnittsvakten
   (crontab ägs av huvudagent/infra enligt våg 28-läxan — BOKAT dit, berör
   ALDRIG crontab autonomt). Larm vid fynd > 0.
2. **Externa länkar** — utgående http(s)-länkar (källor i analyser, kurser)
   kontrolleras ej idag: separat våg med begränsning (head-only, långsam
   takt, andel 4xx-rapport — externa döda är inte vårt fel men vårt anseende).
3. **Redirect-hälsa** — om omdirigeringar dyker upp i framtida körningar:
   varje sådan är en kandidat att släta ut (länka slutmålet direkt).

## 6. Återanvändning

```bash
node verktyg/doda-lankar.mjs --bas=http://localhost:3000 --djup=3
# utdata: data/vakten/doda-lankar-<datum>.json + sammanfattning på stdout
```

Kall körning ~11 min (ISR värms), varm ~45 s. Vid fynd: JSONens `kallor`-fält
per mål = exakt vilka sidor som länkar dit — rotorsaken är en grep bort.
