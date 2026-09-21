# o149 — Vakten auth-401-falsklarm + universumsiffrorna utanför /bolag-familjen (s8-u3, 2026-09-21)

Manifest: auto-s8-1790006726228 (agent s8-u3, spår 8 3/3 "Kvalitetsvåg — välj själv").
Reservation: data/vakten/protokollnummer.json post o149 (18:4x). Anspråk:
data/vakten/auto-s8-1790006726228-s8-u3-ansprak-o149-auth401-universumsiffror.md.

## KOLLISIONSHISTORIK (ärligt bokförd)

Ursprungsanspråk 18:38:58 tog o146 §7:s båda öppna poster. Under mig
pivot-erade s8-u1 från feljakten till "bolagsmetadata-kontraktet" med
poolreservation o148 (18:36:29 — 2,5 min FÖRE mitt anspråk) + pågående
filändringar i /bolag-familjen (page.tsx, bolag-sidor.tsx, bolags-sidor.ts,
eget testverktyg; mtider 18:37-18:39). DOM: /bolag-familjen = u1:s
(D24-precedens; poolen väger tyngst — en av mina Edits mot bolag/page.tsx
studsade på "modified since read" och blev aldrig verkställd). Jag vek
ned, reserverade o149 och lämnade notis med sanna mätvärden till u1:
data/vakten/auto-s8-1790006726228-s8-u3-notis-till-u1-o148-o149.md.

## FÖRE-LÄGE (mätt 2026-09-21 18:3x-18:4x)

1. Gränsnittsvakten 11:30Z-svepet: 28 fynd = 24 bolags-404 (o146:s rot,
   kurerad av förra omgångens s8-u3, commit 98219b5f, väntar deploy) +
   **4 × /studio "Failed to load resource: 401" på /api/studio/stream**.
   401 är autentiseringsgrindens KORREKTA svar för vakten anonyma
   webbläsare (o146 §7 + o147:s BY-DESIGN-dom: "ingen kodändring i
   kundens huvudyta från vakt-håll") — men instrumentet saknade klassen
   och rapporterade fynd som ingen källändring kan bota = evigt falsklarm.
2. Universumsiffrorna: bolagsunivers.json = **249 bolag** (10 branscher ×
   17-38 bolag: energi 22, fastighet 17, finans 37, hälsa 24, industri 20,
   kommunikation 23, konsument 38, material 26, teknik 25, tillväxt 17).
   Korstabell-grund.json = **100** (⊆ universumet, skapad 2026-09-03).
   Universum-ytor hävdade fortfarande 100/"10 × 10".

## KUR 1 — instrumentets auth-401-klass (verktyg/, inget bygge)

- `verktyg/granssnitt-konsol.mjs`: `arForvantadAuth401(text, url)` +
  `AUTH_401_SLUTPUNKTER = ["/api/studio/stream"]`. SMALT: "Failed to load
  resource" + exakt "status of 401" + känd slutpunkt (url ELLER text).
  Godtycklig 401 på annan yta förblir larmande fel; 404/500 på samma
  slutpunkt förblir fel. Ny slutpunkt tilläggs endast med fastslagen dom.
- `verktyg/granssnittsvakt.mjs`: konsol-lyssnaren räknar klassade 401 i
  `forvantade401` (nollställs vid deploy-ommätning, symmetri med
  konsolFel), exkluderar ur felAntal, bokför ÖPPET per kombination
  (`forvantade401`-nyckeln) + konsolrad "förväntade 401: N (auth-grind,
  räknas ej)". Precedens: 429-egen-throttle + favicon-404 (våg 105) —
  informationen klassas, den försvinner aldrig.
- `verktyg/testa-granssnitt-konsol.mjs`: +10 krav (A1 ordagrant ur
  11:30Z-rapporten; A2-A4 url/query/prod-varianter; AN1-AN6 smalhet:
  annan slutpunkt/404/500/utan slutpunkt/pageerror/null).

## KUR 2 — universumsiffrorna (src/, 11 filer, disjunkt från u1:s o148)

Princip: dynamiskt tal där koden har datan i handen; sifferlöst
("forskningsuniversumet", "alla bolag i universumet") i statiska listor
och kommentarer; "10 branscher" behålls (sann struktur), multiplikations-
påståendet "× 10 bolag" bort (verkligt: 17-38 per bransch).

- dataset-aspekter: nyckeltal-b.ts (filhuvud, beskrivning, ingress "0 av
  100" → "0 mätta", saLaserDu), nyckeltal-pe-pb.ts (saRaknas ×2),
  vardering.ts (saRaknas), land.ts + kontraktet (kommentarer).
- dataset-medianer.ts (kommentar), dataset-nyckeltal.ts (API-kalla
  `"100-bolagsuniversum (10 branscher × 10 bolag)"` →
  `` `${m.totalt.nBolag}-bolagsuniversum (${m.rader.length} branscher)` ``).
- nyckeltalsguide: route.ts (kommentar), page.tsx (FAQ ×2 + description +
  brödtext + kärnpåstående — ALLT interpolerat ur MEDIANER) samt
  **dölj-n-buggen**: `${r.n < 10 ? " (n=…)" : ""}` dolte n i 10×10-världen
  (n=10 underförstått); med 17-38 bolag/bransch dolde regeln ALLTID ärliga
  n-avvikelser — nu syns `(n=${r.n})` alltid, vilket typens EGEN
  dokumentation kräver ("n syns alltid").
- ordlista.ts: dataset.ingress, meta.beskrivning, jsonld.namn (fick
  {nBolag}, var hårdkodat "100-bolagsuniversumet"/"100-company"/"المئة"),
  jsonld.beskrivning — sv/en/ar.
- dataset-sidor.tsx: jsonld.namn-anropet matar {nBolag}.

## LÄMNADE MED VILJE (dokumenterade domar)

- **Korstabellens 100 är SANT** (korstabell-grund.json = exakt 100):
  forsningslaget, forskningslage-kort ×2, min-sida, korstabell.tsx,
  typer.ts, pro-screening ("10 × 10-struktur"), transparens ×2,
  pro/analys ("screening av 100 bolag"), portfolj-forskning ×2.
- **Prenumeration (sv/en/ar × "10 branscher × 10 bolag" + "10 × 10"-chips)**:
  R2-YTA (priser) + underlagsfråga (sannolikt korstabellen = sant) — orörd,
  restpost till kundvärdesparet kvalitet/R2.
- nyckeltal-b.ts:19 "Gränslägen vid leverans (2026-09-14, 10 × 10)" —
  dokumenterad HISTORIK, korrekt kvar.

## BEVIS

- tsc: `node node_modules/typescript/bin/tsc --noEmit` → **0 fel**.
- Svit: `node verktyg/testa-granssnitt-konsol.mjs` → **PASS 24/24**
  (10 ursprungliga + 10 nya; offline mot RIKTIGA modulen).
- Riktad vaktkörning (EFTER kur 1): `node verktyg/granssnittsvakt.mjs
  http://localhost:3000 --sidor=/studio` → **0 fynd bland 4 kombinationer**
  med `forvantade401=1` öppet bokförd i varje (rapport
  granssnitt-2026-09-21T164524.json). FÖRE: samma fyra mätningar = 4
  falska fynd i 11:30Z-svepet.
- HELA vakten grön kräver deploy av o146+o147+o148+o149 (bolag-404:orna
  och metadataleveransen sitter i nästa gröna bygge — prod-synkens ägo;
  EFTER-deploykvitto: o146:s sond + o147:s livskontrakt + detta svep).

## RESTPOSTER (öppet bokförda)

1. Prenumerationssidor ×3 språk (R2 + underlagsfråga).
2. u1:s o148 levererar /bolag-familjens metadata (pågående vid detta
   protokolls skrivande — deras EFTER-kvitto äger den ytan).
3. Fullvals-vaktsvep efter deploy: 0-förväntat i alla klasser (både
   bolag-404 och studio-401 kurade i träd).
