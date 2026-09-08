# STYRELSEDOKUMENT V86-L2DESIGN — SERVERSTYRD GATING + XP-SYNC (våg 87)

Underlag till STYRELSE-INLOGGNING-ADMIN.md FAS L2. Förutsätter våg 86 (L1:
medlem-auth). Forskningsdokument — ingen kod rörd. Ägare: V86-L2DESIGN.

## A. SERVERSTYRD GATING-KONTRAKT (kurs-sidor)

Konsumentkontrakt mot L1 (`src/lib/medlem-auth.ts`, server-only, våg 86 äger):
`lasMedlemSession(): Promise<{ authId: string; namn?: string } | null>` — läser
httpOnly-session-cookien (Supabase Auth via server-proxy). Våg 87 ANROPAR den,
definierar den ej. Ingen ny klientväg till tokens (P6 gäller).

Renderingsmodell — våg 78-mönstret GENERALISERAT till gratis-kurser (fas 0):
- SSR/cachad bas (ALLTID gäst-vyn): smakprov kap 1–2 + låst kort + NivaBar i
  neutral nolläge. Kap 3+ serialiseras ALDRIG i HTML/flight — dagens KursGate-
  läcka (`medlem===null → children` i first paint) sluts.
- Klient-egis efter hydrering: tunn sessionsfråga → gäst: klart (låsta vyn är
  slutläget); medlem: upplåsning + hämtning. Fulltexten levereras först efter
  server-verifierad session — samma tvåstegs-kontrakt som Fas2Gate (våg 78 B1).
- [slug]-sidan (`src/app/(huvud)/kurser/[slug]/page.tsx`) bygger smakprov +
  fortsättning som props REDAN i dag (raderna 105–113) — Fas-kurserna äter dem;
  våg 87 pekar gratis-kurserna på samma bana. Speglarna (en)/(ar): samma ändring.

Mjuk migrering av gamla localStorage-medlemmar (ak1a-member utan konto):
1. Gäst-läge kvar tills registrering (L1-beslut: inget bryts, ingen tvingan).
2. Banner på kurssidor när LOKAL medlem hittas men ingen session: "Du har
   framsteg sparat på denna enhet — registrera dig gratis för att behålla det."
   Return-URL-mönstret (våg 63 O2 #1) återanvänds: ?next=/kurser/<slug>.
3. EV. engångsimport-knapp (på /skapa-konto-klar eller första inloggade vy):
   läser lasXP/lasStjarnor/lasKlaraKurser + quiz-nycklar (ak1a-quiz-*), POSTAR
   typ:"import" till /api/medlem/progress EN gång.
   Integritetsläge (utrett): lokal data = användarens egna på egen enhet;
   knapptryck = explicit samtycke; GDPR-minimering — endast aggregat (xp,
   stjärnor, klara slug:ar) sänds, ingen e-post (authId identifierar), ingen
   tredje part. Import är FRIVILLIG; utan konto lämnar datan aldrig enheten
   (status quo bevaras). Slutsats: import med samtycke = OK.

## B. XP/PROGRESS-SYNC-KONTRAKT

POST /api/medlem/progress — body { typ: "quiz"|"kursklar"|"stjarna"|"import",
slug, kap?, i? } (i = frågeindex; import: extrafält enligt A.3). GET behövs
INTE för skrivningen; för hydrering räcker sessionsfrågan som FÅR bära med
progress i svaret (en rundtur, se C.4). localStorage förblir cache (L2-linjen).

Serverns arbete per POST:
1. lasMedlemSession() → 401 utan giltig session (generellt fel, ingen info om
   kontoexistens — v83-regeln).
2. Validera mot kursdata: slug måste finnas i deep-courses.json; kap/i inom
   gränser; typ i vitlistan.
3. Deterministisk nyckel (ALDRIG klientskickad sträng): quiz →
   `quiz:<slug>:<kap>:<i>`, kursklar → `kursklar:<slug>`, stjarna →
   `stjarna:<slug>`, import → `import:<authId>:<datum>`.
4. Värde fastställs AV SERVERN: quiz=10, kursklar=50, stjarna=1. Klienten kan
   aldrig förhandla belopp (importens xp takas: ≤ teoretiskt max ur
   kursdata). Skriv EN system_events-rad — exakt organ-event.ts-mönstret
   (getSupabaseRest, Prefer: return=minimal, AbortSignal.timeout(8000),
   fail-safe): type="medlem_progress", severity="info", details={ authId,
   slug, nyckel, varde }. Members-profilen = läsning med SENASTE-VINNER per
   nyckel (Range-paginerat som lasKursOverrides) — men REQUESTSCOPAD, ALDRIG
   modul-cache (kurs-metadata-lives 5-min-cache är global per instans =
   läcker mellan medlemmar — förbjudet här).
5. Rate-limit 60/min per authId — in-memory per process (samma klass som
   admin-auth:ts misslyckade-lista). Ärligt: på serverless = per instans, ej
   globalt; acceptabelt nivå 1, uppgradera till edge-KV senare (skulda_notera).

Anti-fusk — ärliga gränser (nivå 1, alla skulda_notera):
- Enbart poster med giltig session når databasen; värden server-fastställda;
  nycklar deterministiska och kursvalida; import takad och engångs-markerad
  (idempotent per authId).
- GRÄNS 1: en INLOGGAD användare kan POSTa quiz/kursklar han inte gjort —
  metadata saknar bevisbarhet. Konsekvensen är saboterad EGEN statistik =
  acceptabelt nivå 1 (samma klass som att redigera localStorage i dag).
- GRÄNS 2: kursinnehållet är tekniskt publikt redan i dag (public/
  deep-courses.json + öppna /api/kurs/*). Gating = pedagogik + betalmoral,
  ej DRM. Våg 87 ändrar inte det (ändras ev. i L4 efter kundbeslut).
- GRÄNS 3: streak förblir endast lokal (integritetsval, v1-scope).

## C. ÄGARSKAPSKARTA — filer våg 87 rör

1. SKAPA src/app/api/medlem/progress/route.ts — POST-kontraktet (B).
2. SKAPA src/lib/medlem-progress.ts — server-only: nyckelnormalisering,
   skriv/läs SENASTE-VINNER, importtak. (Läsbar av L3-admin senare.)
3. KONSUMERA (rörs ej av 87): src/lib/medlem-auth.ts — L1/våg 86 äger.
4. SKAPA/ÅTERANVÄND tunn sessionsfråga (t.ex. GET /api/medlem/session → 401
   gäst / 200 { namn, progress }): om våg 86 levererat den återanvänds den —
   annars äger våg 87 den. Hydrering-egisens enda nätverksberoende.
5. REDIGERA src/components/ak1a/kurs-gate.tsx — KursGate: låst vy blir
   SSR-default (children-läckan sluts), upplåsning via session + hämtning;
   NivaBar: local-cache kvar + skugg-POST (fire-and-forget) vid varje
   belöning; gästar-läge renderas utan nätvärk.
6. REDIGERA src/components/ak1a/kurs-quiz.tsx — svara()-vinnaren POSTAR
   progress samtidigt som addXP körs lokalt (localStorage = offline-cache).
7. REDIGERA src/app/(huvud)/kurser/[slug]/page.tsx — gratis-kurser går via
   den generaliserade gaten (smakprov + lås som SSR-bas), speglarna
   src/app/(en)/en/kurser/[slug]/page.tsx + (ar)/ar/kurser/[slug]/page.tsx
   samma ändring.
8. RÖRS EJ I GRUNDEN: src/lib/kurs-access.ts (kraverFas/FAS-sets oförändrade
   — medlems-gatet är ett Lager ovanpå fas-logiken, gratis-kurser förblir
   fas 0), src/lib/member-local.ts (förblir cache-API), public/
   deep-courses.json, /api/kurs/[slug] (Fas-flödet kräver den öppen tills L4).

## D. RISKER

- Egis-flash: inloggad ser lås-skelett ~1 rundtur (Fas2Gate redan visar
  "låser upp…"-läget — återanvänd). Gäster märker ingen skillnad.
- Två sanningskällor (local + server) kan divergera vid offline/kass nät —
  local vinner i UI tills nästa event; import endast en gång per authId.
- Nyckelformatet dubbleras mellan klient (quiz-nycklar) och server
  (medlem-progress.ts) — dokumenteras i B.3; driftskostnad skulda_notera.
- Interop: gamla /api/member/register (members-TABELLEN, vbout/referral)
   lever kvar parallellt; L1 äger dess framtid — våg 87 skriver ENDAST
   system_events-medlem_progress och kolliderar ej.

## E. ISR-KONSEKVENSER — UTREDNING OCH REKOMMENDATION

Fakta: kurssidorna har revalidate=3600 + dynamicParams=false (våg 81/82) —
333 ISR-sidor + ÄKTA 404 på okända slug. Läser sidan cookies()/headers()
(ehuru bara för sessionen) blir hela rutten DYNAMISK (λ) för ALLA besökare:
ISR och förrenderade 404-skal förbi på varje request, TTFB upp, ×3 speglar.
Kandidater:

1. ISR-LÅST BAS + KLIENT-HYDRERING-EGIS (REKOMMENDERAD): sidan läser ALDRIG
   session. Den cachade varianten ÄR gäst-vyn; medlem låser upp på klienten
   mot server-verifierad hämtning. Personligt innehåll hamnar ALDRIG i CDN-
   cache (integritetsbonus — ingen cache-control-akrobatik krävs). Kostnad:
   egis-flashen (D). Våg 78 bevisat mönster, noll nya route-mekanismer.
2. Middleware-header + villkorlig dynamik: headers() är en dynamisk API —
   redan i prerender balar rutten till dynamisk; räddning kräver dubbla
   rutter (middleware rewrite till force-dynamic tvilling för inloggade) =
   ×3 speglar-duplikat + cookie-NÄRVARO ≠ giltig session (hanteras, men
   mer maskineri). FÖRKASTAT för nivå 1.

BESLUT: kandidat 1. Formuleringen i FAS L2 "medlem=true renderar kap 3+
(SSR!)" tolkas som SERVER-VERIFIERAT (innehållet når klienten endast efter
godkänd session) — inte per-request-SSR; ISR-förlusten för 333 sidor väger
tyngre än en rundturs egis. Avvikelsen markeras här; styrelsen kan överklaga.

— V86-L2DESIGN, AI-styrelsen AK1A (2026-09-07)
