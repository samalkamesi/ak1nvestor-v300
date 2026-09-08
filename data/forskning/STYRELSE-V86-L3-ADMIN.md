# STYRELSEBESLUT V86 → VÅG 88 — FAS L3: RÄTT ADMIN (ordföranden 2026-09-07)

Forskningsdokument V86-L3DESIGN. Underlag: STYRELSE-INLOGGNING-ADMIN.md
(FAS L3), src/app/(huvud)/admin/page.tsx (flikkarta v83 §A2), src/lib/
admin-auth.ts (roller+sessioner), src/components/ak1a/admin/ (panelmönster),
src/app/api/admin/members + fas2-access (befintliga mönster), Supabase Auth
Admin-API (GoTrue: /auth/v1/admin/users, service-nyckel). L1 (våg 86) och
L2 (våg 87) är Förutsättningar — detta kontrakt låser L3:s yta för våg 88.

## NULÄGE KORT
- Flik "Medlemmar" (members-manager.tsx) läser GAMLA members-tabellen
  (leads ur /api/member/register) — INTE auth-användare. FAS L1 bygger
  auth-användare + members-profiler som system_events (type=medlem,
  details={authId, epost-hash, namn, xp, nivå}); L2 lägger
  type=medlem_progress. L3-panelen ska läsas mot DET, inte members-tabellen.
- requireAdmin har REDAN default tillat=["admin"] — ny yta behöver ingen
  tillat-parameter alls (säkraste default gäller automatiskt).
- getSupabaseRest() bär SUPABASE_SERVICE_ROLE_KEY som Bearer — SAMMA
  headers duger för /auth/v1/admin/* (SSRF-valideringen *.supabase.co
  täcker auth-endpointen; den är INTE något nytt nätverksmönster).

## A · MEDLEMMAR-PANEL-KONTRAKT (ny flik "Medlemmar 👥", admin-only)

**Flik-karta (page.tsx):** ny rad `{ id: "auth-medlemmar", etikett:
"Medlemmar 👥", endastAdmin: true }` — mountas LAZY (Radix TabsContent utan
forceMount, media-panel-mönstret: GET först när fliken öppnas). Gamla
fliken id="members" byter ETIKETT till "Leads 🧲" (panel+route orörd — två
flikar med namnet "Medlemmar" förbjuds). Ny komponent:
src/components/ak1a/admin/medlemmar-panel.tsx (NY).

**GET /api/admin/medlemmar?sida=N&sok=** (NY route, runtime=nodejs,
force-dynamic):
1. `requireAdmin(req)` — default tillat=["admin"] (redaktören nekas).
2. Service-nyckel: `GET {origin}/auth/v1/admin/users?per_page=50&page=N`
   (per_page tak 50 i v1). GoTrue-svaret ger `users[]` + `nextPage`
   (null på sista sidan) — sidvandring på nextPage, ALDRIG blint N+1.
   Fält som används: id, email, created_at, last_sign_in_at, banned_at,
   app_metadata.roll, app_metadata.fas.
3. Members-profiler: EN enda system_events-fråga
   `type=eq.medlem&order=created_at.desc&limit=200` → senaste profil-rad
   per authId (latest-winner i minnet) → merge per authId. INTE en
   förfrågan per användare.
4. **SANERING av svaret (GDPR-beslut, se §A-GDPR):** listan visar
   `epostMaskerad = hashPrefix(8) + "@" + domän` + namn + xp + nivå +
   fas-status + banned. ALDRIG e-post i klartext i list-payloaden.
   Klartext hämtas ENDAST per rad: `?authId=...&visaEpost=1` (samma route,
   admin-only) och svarar {epost} för EN rad.
5. Svar: { medlemmar: [...], sida, nastaSida, total: approx }.

**POST /api/admin/medlemmar { authId, action }** — samma route, requireAdmin,
authId valideras mot UUID-regex (mönster MEMBER_ID_RE i fas2-access):
- `ban` → `PUT /auth/v1/admin/users/{authId}` body `{"ban_duration":
  "876000h"}` (100 år ≈ oändligt; GoTrue har inget "forever"). VÄGRAR om
  målet har app_metadata.roll ∈ {admin, redaktor} (självlåsningsskydd).
- `unban` → samma PUT med `{"ban_duration": "none"}`.
- `fas2-grant` / `fas3-grant` → PUT app_metadata = {...befintlig, fas}
  (MERGE — hela app_metadata-objektet skickas; läs först, skriv sedan).
  fas3 innehåller fas2 (FAS3_TYPER-supermängden i kurs-access.ts).
- `role` → PUT app_metadata.roll = "redaktor"|"medlem" (admin-roll sätts
  ENBART via bootstrap, se §B — inte utbytbar från panelen i v1).
- VARJE lyckad POST skriver ETT audit-event: system_events type=
  "admin-andring", message klartext utan e-post, details={actor: roll,
  authId, action} (P6: inga lösenord/token/epost i loggen — HASH-ar).

**§A-GDPR (utredning → beslut):** kunden (admin) ÄR personuppgifts-
ansvarig och därmed behörig mottagare av medlemmars e-post internt —
klartext VISAS därför OK i panelen (per rad, se ovan). MEN tre hårda regler:
(1) klartext-e-post får ALDRIG finnas i list-svaret (skärmdump/läge-risk),
(2) klartext-e-post loggas ALDRIG (varken console, system_events eller
körloggar — P6-utvidgning), (3) minimering: hash-prefix+råd-ikonen duger
för att SKILJA användare åt; klartext är för faktiska åtgärder (kontakt,
duplikatjakt). Detta är proportionerligt enligt art. 5 GDPR.

## B · ADMIN-IDENTITET (Supabase Auth-users med app_metadata.roll)

**Mål:** admin loggar in som AUTH-användare; ADMIN_PASSWORD består som
bootstrap/rollback (v83-lagen oförändrad).

- **Skapa admin-user (bootstrap):** kund skapar auth-user via L1:s
  /skapa-konto, därefter sätter EN engångsoperation (eller panelen, §A
  action=role med vitlista) app_metadata.roll="admin" via service-nyckel.
  Chicken-egg löst: ADMIN_PASSWORD-vägen krävs för ATT ge den första
  admin-rollen — kedjan kan aldrig brytas.
- **Login-flöde (/api/admin/login UTÖKAS, bakåtkompatibelt):** (1) försök
  Supabase `POST /auth/v1/token?grant_type=password` — OK + användarens
  app_metadata.roll ∈ {admin, redaktor} + ej banned ⇒ skapaSession(roll)
  (SAMMA cookie "<roll>.<utgar>.<hmac>" — lasSessionFranCookie ÖRÖRD,
  3 delar kvar; identiteten behöver inte in i cookien eftersom
  requireAdmin bara kontrollerar rollen); (2) annars befintlig
  ADMIN_PASSWORD/REDAKTOR_PASSWORD-väg exakt som idag. Supabase-auth-PATH
  finns dessutom i requireAdmin? NEJ — requireAdmin rör EJ: sessionen är
  redan signerad av login-ruten. Service-nyckel behövs INTE i login —
  vanlig anon-key räcker (password-grant).
- **Roll-förfriskning:** rollen läses VID INLOGGNING (från token-svarets
  user.app_metadata) — rollbyte tar effekt vid nästa inloggning ≤ 8 h
  (sessionens maxAge). acceptabelt; dokumenteras i panelen.
- **RISKLISTA:** (r1) Supabase-Availability — fallback-lösenordsvägen
  garanterar inträde (redan byggd); (r2) självlåsning — ban-vägran för
  rollbärare (§A) + ADMIN_PASSWORD kan aldrig banneas; (r3) SESSION_SECRET
  rotation dödar alla sessioner — acceptabelt (8 h); (r4) email-confirm
  kan spärra första inloggning — bootstrap-user skapas med auto_confirm
  via admin-API ELLER kundens L1-flöde (dokumenteras); (r5) delad hemlighet
  kvar tills kunden medvetet roterar bort ADMIN_PASSWORD — MÖJLIGT först
  när ≥1 auth-admin verifierats i prod (separerat kundbeslut, ej våg 88);
  (r6) password-grant rate-limitas av GoTrue (10/min/IP-typ) — samma tak
  som våra egna 10/min, ingen ny exponering; (r7) P6: auth-svar innehåller
  access_token — loggas ALDRIG, endast roll + utgång förs vidare.

## C · GRANSKNINGSLOGG-VISARE (ny underpanel i "Medlemmar 👥")

- GET /api/admin/granskningslogg?type=alla|medlem|medlem_progress|
  admin-andring&limit=50 → system_events `type=in.(medlem,
  medlem_progress, admin-andring)&order=created_at.desc&limit=50`
  (limit-tak 50, hårdkodad). Visning: tid, type-badge, meddelande,
  details-JSON (kollapsad), severity-färg enligt SEVERITY_COLORS-mönstret.
- Koppling: varje §A-POST hamnar här inom sekunder (same-table write).
- Panel-placering: UNDER medlemslistan i medlemmar-panel.tsx (EJ egen
  flik — en yta, en ägare, mindre page.tsx-röring).

## D · FILÄGARSKAPSKARTA VÅG 88 + KRITA + ISR/RATE-NOTES

**Agenter (v83-lagen: admin-auth.ts ÄGS av EXAKT EN agent):**
- A1 AUTH-agenten: src/lib/admin-auth.ts (orörd eller minsta touch),
  /api/admin/login/route.ts (Supabase-steg), src/lib/admin-klient.ts
  (loggaIn utökas med identitet? NEJ — klienten är redan roll-abstrakt,
  orörd).
- A2 MEDLEM-API-agenten: /api/admin/medlemmar/route.ts (NY) +
  /api/admin/granskningslogg/route.ts (NY) + src/lib/medlem-admin.ts
  (NY: hämtaAnvändare/sidvandring/ban/fas — tunn server-only-hjälpare).
- A3 PANEL-agenten: src/app/(huvud)/admin/page.tsx (flik-kartans två
  rader) + src/components/ak1a/admin/medlemmar-panel.tsx (NY). Gamla
  members-manager.tsx orörd utöver etikettbytet i KARTAN (page.tsx).

**KRITA (hårda):** inga lösenord/tokens/e-post i loggar någonsin (P6×2);
SUPABASE_SERVICE_ROLE_KEY ENDAST server-side (aldrig NEXT_PUBLIC-prefix,
aldrig i klientkode); ALLT via getSupabaseRest (SSRF-valideringen);
app_metadata — ALDRIG user_metadata — för roll+fas (user_metadata är
användarskrivbar!); MERGA app_metadata vid PUT (läs-först, annars raderas
grannfält); ban_duration "none" = unban ("0" är ODEFINIERAT); RETENTION-
VARNING: system_events gallras av retention-organet (500 rader/30d) —
medlem-profiler (type=medlem) MÅSTE undantas/höjas I L1-KONTRAKTET, annars
försvinner Fas-grants (L3 beroende — flagga till våg 86-genomförarna);
generella felmeddelanden (avslöja aldrig om konto finns/banad vid login);
tsc-baslinje 35 (0 nya), SSG-paritet 906=906 örörd (inga page-vägar ändras).

**ISR/rate-notes:** alla nya routes `dynamic="force-dynamic"` + runtime
nodejs — ISR/revalidate Ej aktuellt (admin-data aldrig cachad, ingen
on-demand-revalidate behövs; rör INGA generateStaticParams). Rate: GET
10/min (requireAdmin-fel-tak) + klientens enge refresh-knapp; POST-actions
10/min delat tak; /auth/v1/admin-users listas 1 sida/anrop (50) — ALDRIG
loopa alla sidor i ett anrop (Supabase-side tak); Supabase-AUTH-password-
grant delar GoTures egna 10/min/IP (dokumenterat i §B r6).

## Ordning
A1 → A2 → A3 (auth först, API sen, panel sist — panelen utan API är
enbart död vy). Leverans enligt stående rutin: kontrakt → agenter → full
svit → deploy via serverbygge → prodverifiering.

— Ordföranden, AI-styrelsen AK1A
