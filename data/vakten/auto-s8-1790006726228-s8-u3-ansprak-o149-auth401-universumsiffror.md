# Anspråk s8-u3 (manifest auto-s8-1790006726228) — o149

Skapad: 2026-09-21 18:38:58 lokal (disk-först), omscåpat till o149 ~18:5x.
Omgångens tredje agent (u1 = o145 feljakt-ledgern → o148 pivot, u2 = o147
sitemap-komplement — lästa, respekterade).

## KOLLISION TVISTAD OCH LÖST (disk-först)

Mitt ursprungsanspråk (18:38:58) tog o146 §7:s båda öppna poster. Under
mig pivot-erade u1 från feljakten och reserverade **o148** i den kanoniska
poolen (data/vakten/protokollnummer.json, mtime 18:36:29 — 2,5 min före
mitt anspråk): "bolagsmetadata-kontraktet: /bolag hårdkodade '100 bolag'-
löften blir datadrivna ur publiceradeBolagSidor". Deras pågående yta
(mtider 18:37:22-18:39:23): src/app/(huvud)/bolag/page.tsx,
src/components/ak1a/bolag-sidor.tsx, src/lib/bolags-sidor.ts,
verktyg/testa-bolag-metadata-kontrakt.mjs.

DOM: /bolag-FAMILJEN är u1:s (D24-precedens; poolen väger tyngst). Jag
viker ned där — deras fyra filer rörs INTE. Kvar av mina fynd (orört av
o145/o146/o147/o148) = komplementet, reserverat som **o149** i poolen.

## OBJEKT 1: gränsnittsvaktens 401-falsklarm (o146 §7-post 1)

8 fynd/svep (bevis: granssnitt-2026-09-21T113043.json) — /studio:s
anonyma poll på /api/studio/stream ger Chrome-nätverksrad "Failed to load
resource: 401" som vakten räknar som konsol-DEFEKT. 401 är autentiserings-
grindens KORREKTA svar (o146 §7 + u2:s o147-dom BY-DESIGN: "ingen
kodändring i kundens huvudyta från vakt-håll"). ROTEN är instrumentets
konsolfel-kategori: nätverks-statusfel från autentiserade slutpunkter är
inte gränsnittsdefekter — samma klass som 429-egen-throttle och
favicon-404 (väg 105-precedens).

KUR: ren klassificerare arForvantadAuth401(text, url) i
verktyg/granssnitt-konsol.mjs (SMALT: "Failed to load resource" + exakt
"status of 401" + känd slutpunkt /api/studio/stream; lista
AUTH_401_SLUTPUNKTER för framtida dom-fastslagna slutpunkter) +
vakten integrerar med ÖPPEN bokföring (nyckel forvantade401 per
kombination + konsolrad "förväntade 401: N (auth-grind, räknas ej)") +
svit-utvidgning (10 nya krav, offline mot RIKTIGA modulen).

## OBJEKT 2: universumsiffrorna UTANFÖR /bolag-familjen (o146 §7-post 2)

SANNING mätt 18:4x: bolagsunivers.json = 249 bolag (10 branscher ×
17-38 bolag); korstabell-grund.json = 100. Korstabellens 100 är SANT och
lämnas: forsningslaget, forskningslage-kort, min-sida, korstabell,
transparens, pro/analys, portfolj-forskning, prenumeration (R2-yta!),
typer.ts.

FEL-klass 1 — kundsynliga universum-texter med föråldrat 100-tal:
- src/lib/dataset-aspekter/nyckeltal-b.ts (filhuvud + beskrivning +
  ingress "0 av 100 bolag" + saLaserDu)
- src/lib/dataset-aspekter/nyckeltal-pe-pb.ts ("på alla 100 bolag" ×2)
- src/lib/dataset-aspekter/vardering.ts ("ur 100-bolagsuniversumets")
- src/lib/ordlista.ts (dataset.ingress + meta.beskrivning + jsonld.namn
  + jsonld.beskrivning — sv/en/ar: "10 branscher × 10 bolag" + "100-
  bolagsuniversumet")
- src/app/(huvud)/data/nyckeltalsguide/page.tsx (FAQ-svar ×2,
  description, kärnpåstående "10 × 10")
- src/lib/dataset-nyckeltal.ts (API-kalla "100-bolagsuniversum (10
  branscher × 10 bolag)" → datadrivet ur m)

FEL-klass 2 — dold n-synlighet: nyckeltalsguide-kärnpåståendets
`${r.n < 10 ? " (n=…)" : ""}` dolde n i 10×10-världen (n=10 alltid);
med 17-38 bolag/bransch döljs ALLTID ärliga n-avvikelser — typens EGEN
dokumentation säger "n syns alltid". Kur: n syns alltid.

FEL-klass 3 — kommentarer (dokumentationssanning): land.ts,
dataset-aspekter-kontrakt.ts, dataset-medianer.ts, route.ts.

Kur-princip: dynamiskt tal där koden har datan i handen (m.totalt.nBolag,
MEDIANER.totalt.nBolag, {nBolag}-interpolering — dataset-sidor.tsx
jsonld.namn får parametern); sifferlöst ("forskningsuniversumet", "alla
bolag i universumet") i statiska listor/kommentarer. Rätt struktur "10
branscher" behålls (sann, stabil), multiplikationspåståendet "× 10 bolag"
bort (17-38 verkliga).

## YTA (exklusiv ägarskap, o149)

- verktyg/granssnittsvakt.mjs (konsol-lyssnaren + rapportnyckel)
- verktyg/granssnitt-konsol.mjs (klassificeraren)
- verktyg/testa-granssnitt-konsol.mjs (svit-utvidgning)
- OBJEKT 2:s elva filer (listade ovan)
- data/forskning/OPTIMERING/o149-vakt-auth401-universumsiffror-s8.md
- worklog.md (egen rad sist)

GRÄNSER: src/ ENDAST Write/Edit; ALDRIG bygge (prod-synken äger);
ALDRIG --no-verify; R2 orörd; u1:s o148-filer + u2:s ytor orörda.
Bevis: tsc 0 · svit PASS · riktad vaktkörning --sidor=/studio mot
localhost (studio 0 fel + forvantade401 öppet bokförd).
