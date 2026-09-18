# o64 — HÄRDNING AV GODKÄNNANDEYTANS RUTTER: hastighetstak + avvisad-audit (s8-u1)

Manifest: auto-s8-1789707900149 (vakt 1/3) · 2026-09-18 · anspråk FÖRE arbete:
data/vakten/auto-s8-1789707900149-u1-ansprak.md · protokollserie OPTIMERING
(o61–o62 tagna av s7-familjen; o63 = s7-u2:s namngivna köpost — därför o64 här).

## §0 — Objekt och duplikatkontroll

STYRELSENS öppna KÖRS DIREKT-post (våg 91 A2, PIPELINE-KO.md): "Härdning av
godkännandeytans rutter — admin-session på varje endpoint inkl publicera,
hastighetstak, append-only audit-rad per publicering; filägarskap
src/app/api/studio/godkannande/**". Delmomentens läge vid anspråk:

| Delmoment | Läge |
|---|---|
| admin-session varje endpoint | REDAN LEVERERAD (requireAdmin på båda filernas alla metoder; E26-mätningen 2026-09-17 bevisade 401 live) |
| hastighetstak | **OLEVERERAT** — 0 tak-logik i båda ruttfilerna vid HEAD (grep-bevis §4) |
| append-only audit-rad per publicering | Lyckade tryck loggade (skrivAudit, append-only logg med rotation); **avvisade försök spårlösa** |

Syskonen u2/u3 (samma "välj själv"-uppdrag) avvisades till andra objekt via
anspråksfilen — noll filöverlapp (mina enda src-ytor är de två ruttfilerna,
som styrelseposten definierar som exklusivt filägarskap för just denna våg).

## §1 — Rotorsaka

Godkännanderutterna passerade requireAdmin och stannade DÄR i skyddet:
varje AUTHAT anrop behandlades obegränsat. Konsekvenser:

1. **Authad spam är gratis.** POST /publicera kör lasGodkannandePoster per
   anrop (läser granskningsprotokoll + register från disk), och POST på
   basrutten skriver godkannande-val.json + audit-rad per anrop. En loop
   (skript, hijackad session, repetativ klientbugg) svämmar audit-loggen
   (rotation tvingas ofta) och slössar disk-CPU i maskinhastighet — på
   kundens R2-knapp, som ska vara DYR att trycka maskinellt.
2. **Avvisade försök lämnar inget spår.** Vakt 2 (FLYTTKLAR-inpass), vakt 3
   (engångs), juridikgrindens dom och våg 66-grinden nekade TYST — om ett
   knapptryck nekats fanns inget kvitto alls, emot spårbarhetsandemålet i
   styrelsens post ("append-only audit-rad per publicering" — ett försök
   ÄR en publiceringshändelse även när vakterna står i vägen).

## §2 — Kur (src ENDAST via Edit, inom filägarskapet)

**src/app/api/studio/godkannande/route.ts**
- Tak på AUTHADE POST:er: 20/minut (tidsfönster-array i modul-scope —
  admin-auth:s etablerade mönster; pm2 fork = en process).
- GET förblir takfri — panelens/läsningens kontrakt orört.
- jsonSvar utökad med valfri extra-header-param (Retry-After).

**src/app/api/studio/godkannande/publicera/route.ts**
- Tak på AUTHADE publiceringsförsök: 6/minut (kunden publicerar
  handmanövrerat, ett tryck + UI-bekräftelse i taget).
- Ny åtgärd **publicera-avvisad** i samma append-only audit-logg som de
  lyckade trycken, vid: taket (429), vakt 2 (404), vakt 3 (409),
  juridikgrindens dom (400), våg 66-grinden (400), okänd utkastform (400).
  Ogiltig JSON/saknad sokvag spåras INTE (formulärskräp utan artefakt —
  taket stoppar ändå sådana sviter vid försök 7).
- Rubrikkommentarernas SKYDDSLAGER-sektioner uppdaterade (källan bär
  sanningen om lagren 1/1b/2/3/4 + spårkravet).

**Designbeslut (constraint koden inte visar):** taket sitter MEDVETET EFTER
requireAdmin — annars kan ANONYM trafik förbruka fönstret och låsa kundens
knapp (DoS på R2-ytan). 429 pushar aldrig tid i fönstret (stormar tömmer
fönstret nativt; samma semantik som admin-auth:s misslyckade-tak).

R2 KONTROLL: rutten publicerar fortfarande ENBART kundens tryck på
FLYTTKLAR-poster; grunderna (FLYTTKLAR-inpass, engångsvakt, våg 66-grinden,
juridikgrindens dom) orörda; data/blogg/ orörd; inga priser/tier rörda.

## §3 — Bevis

1. **tsc 0** — `node node_modules/typescript/bin/tsc --noEmit` exit 0 efter
   ändringarna (projektbinären, ALDRIG npx; baslinjen 0 består).
2. **FÖRE, levande prod** (verktyg/_s8u1-hardningsfore.mjs, localhost:3000,
   ts 2026-09-18T05:14:53Z, BUILD_ID `c7v5uV6wUzTJn051hQFgW`):
   - POST utan auth ×3 → **401, 401, 401** (lager 1 består — E26 orött).
   - GET utan auth ×8 → 401 ×7 sedan **429** — det är admin-auth:s EGENA
     globala misslyckade-tak (10/min, delat av alla admin-rutter; sondens
     10 oautentiserade anrop under en minut) — alltså INTE något tak på
     authat läge; se lärdom §5.1.
   - Audit de sista 500 raderna: publicera-avvisad **0**, publicera
     (lyckad) 0 i svansen — spårformen fanns ej i prod vid mätningen.
3. **Strukturellt FÖRE/EFTER**: `git show HEAD:<fil> | grep -c
   'takUppnaatt|publicera-avvisad'` = **0** i båda ruttfilerna (prod-källan
   vid senaste deployn); arbetskopian = **5** (publicera) + **2** (bas).

## §4 — EFTER-kriterier (väntar prod-synkens deploy, o54/o56-precedensen)

Vid BUILD_ID-byte (≠ c7v5uV6wUzTJn051hQFgW):
- (a) **Signaturer i byggda server-chunks**: `grep -r "publicera-avvisad"
  .next/server/app/api/studio/godkannande/` ≥ 1 träff (våg 181/182/184-
  precedensen — kräver ingen auth).
- (b) **Funktionssond med auth** (ägaren av autentiseringsvägen —
  .env.production.local är chmod 600 och lämnades orörd av denna våg):
  7 snabba authade POST:er med ogiltig sokvag → 6×404 + minst 1×**429 med
  Retry-After: 60**; upprepning efter 60 s → 404 igen (fönstret återhämtar).
- (c) **GET opåverkad**: 8 authade GET → 8×200 (takfri läsning).
- (d) Källkodens grunder orörda i chunk: requireAdmin forran taket
  (stäms med (b): oautentiserad POST ger 401 även under pågående storm).

## §5 — Lärdomar

1. **Admin-auth:s misslyckade-tak är GLOBALT** (delad array över ALLA
   admin-rutter, 10 fel/min): oautentiserade sonder måste budgetera
   <10 anrop/min SAMMANLAGT — annars får sonden själv 429 och förorenar
   mätdata (denna vågs GET-gren gjorde precis det; FÖRE-datans 401×7 + 429
   dokumenterar mekanismen istället för att dölja den).
2. Ett tak på en kundknapp hör hemma EFTER authen — annars blir taket
   ett DoS-vapen MOT knappen.
3. "Audit-rad per publicering" ska tolkas per publiceringsFÖRSÖK: väntar-
   listens/engångs-/grindens nekanden är händelser kunden kan behöva
   förklara i efterhand — tysta nekanden är förlorad historik.

LEVERANS: src/app/api/studio/godkannande/route.ts,
src/app/api/studio/godkannande/publicera/route.ts,
verktyg/_s8u1-hardningsfore.mjs, data/forskning/OPTIMERING/o64-godkannande-hardningstak-s8.md,
data/vakten/auto-s8-1789707900149-u1-ansprak.md, worklog-rad.
