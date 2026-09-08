# STYRELSEBESLUT — INLOGGNING + ADMIN, MASTERPLANEN (ordföranden 2026-09-08)

Kundfråga: "rätt inloggningssystem med allt plus rätt admin — maximera allt
fullt." Faktatest FÖRRE beslut: **Supabase Auth (GoTrue v2.196.0)Verifierad
LIVE mot kundens projekt** (health 200; signup skapade äkta användare som
städades med service-nyckel — INGEN kund-SQL krävs). Därmed: RIKTIG
medlemsautentisering (e-post+lösenord, hashning, sessioner, återställning)
är byggbar OMEDELBART på befintlig infrastruktur.

## NULÄGET (ärligt)
- Medlemmar = KLIENTSIDIGT localStorage (ak1a-member) — ingen server-
  verifiering, XP/progress bara lokalt på enheten, gäst-läge lätt kringgås.
- Admin = ADMIN_PASSWORD + sessions-cookies + redaktörsroll (v83) — bra
  interim, men delad hemlighet per roll, ingen användaradministration.
- Fas 2/3-gating = e-postbaserad ansökan; kurslås klientstyrt för gratis-
  kurser (SSR-låst vy finns sedan våg 78 för Fas-kurserna).

## PLANEN — fyra faser, varje våg egenlevererad

### FAS L1 — MEDLEMSAUTH-KÄRNAN (våg 86, 4–5 agenter)
- src/lib/medlem-auth.ts (server-only): signup/signin/signout/lasSession via
  Supabase Auth. **Session-tokens ENDAST i httpOnly-cockies via server-proxy —
  ALDRIG localStorage (XSS-skydd). Refresh-rotation mot auth/v1.**
- /logga-in blir riktig inloggning (e-post+lösenord, felmeddelanden utan
  information om kontots existens); ny /skapa-konto; /glomt-losenord (Supabase
  reset-mail — kräver SMTP? SUPABASE INBYGGD SMTP har 2 mail/timme; kund-
  beslut senare om egen SMTP, INTE blockerande: reset kan vänta till L4).
- /api/member/register → skapar auth-user + members-profil i system_events
  (details={authId, epost-hash, namn, xp, nivå...} — ALDRIG lösenord).
- Gamla localStorage-medlemmar = mjuk migrering: gäst-läge kvar tills de
  registrerar; välkomsttext guider.
- KRITA: inga lösenord i egen kod någonsin; Supabase sköter allt; rate-
  limit på sign-in; e-post normaliserad+gemener; GDPR-minimering.

### FAS L2 — SERVERSTYRD GATING + XP-SYNC (våg 87)
- KursGate: server läser session-cookie → medlem=true renderar kap 3+
  (SSR!), gäst = låst vy (samma mönster som Fas-kursernas SSR-lås våg 78).
- XP/quiz-stjärnor/kurs-klar → /api/medlem/progress (server-verifierad,
  skriver members-profil; kriminalistik: en skrivning per händelse, anti-
  spam-rate-limit). localStorage = cache.
- Fas 2/3-ansökan kopplad till authId (idag e-post); admin ser kopplingen.

### FAS L3 — RÄTT ADMIN (våg 88)
- Ny flik "Medlemmar 👥" (admin-only): lista/sök auth-användare via service-
  key, visa profil/XP/nivå/Fas-status, blockera/avblockera (auth admin-API),
  manuellt Fas-grant. Granskningslogg-visare (events som redan samlas).
- Egen admin-identitet: admin-användare som Supabase Auth-users med
  role-claim (ersätter delad ADMIN_PASSWORD när mogen — password kvar som
  bootstrap). Admin-sessioner = redan byggda (v83) — utökas med identitet.
- Server-side rate-limits + lås-vyer harmoniseras.

### FAS L4 — NIVÅER + BETALNINGAR (våg 89+, kräver kundbeslut)
- prenumeration.ts-nivåer kopplas till authId (server-verifierat, inte
  klient). Fas 2/3-flödet slutgiltigt. Betalning: kundbeslut Stripe/swish/
  faktura (K-B2B-blocket). SMTP för maillutskick (Kund-ärende kvar).

## ORDNING & VILLKOR
- L1 sankas som våg 86 SÅ FORT våg 85 (massflyttet) landat — gemensam
  app/-yta = aldrig parallellt.
- Varje fas: kontrakt → agenter → full svit → deploy via serverbygge →
  prodverifiering (enligt stående rutin).
- Säkerhetsgrunden från v83 består: sessions-cookies httpOnly+signerade,
  generella felmeddelanden, rate-limits, P6 (logga aldrig lösenord/tokens).

— Ordföranden, AI-styrelsen AK1A
