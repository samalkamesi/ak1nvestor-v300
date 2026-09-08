# STYRELSEBESLUT VÅG 83 — ADMIN-MEGA STEG 5: ROLLER + SESSIONER + SPEGLAR-404 (ordföranden 2026-09-08)

Underlag: STYRELSE-ADMIN-MEGA.md §2.5 + steg 5, STYRELSE-SPEGLAR-P2.md (alt C-rek).
Kundens lagar gäller; SÄKERHETSSKÄL sankar ÄNDA avvikelsen från max-agenter:
auktorisering är sekretesskänsligt — FÄRE, TÄTARE händer (4 agenter), admin-auth.ts
ägs av EXAKT EN agent.

## DEL A — SESSIONER + ROLLER (steg 5 kärna)

**A1 · AUTH-agenten (EXKLUSIVT ägande av src/lib/admin-auth.ts + NYA filer):**
- src/lib/admin-auth.ts UTÖKAS (bakåtkompatibelt — befintlig header-väg BESTÅR
  som bootstrap/rollback):
  - `export type AdminRoll = "admin" | "redaktor"`
  - Ny signerad sessions-cookie `ak1a_admin`: värde = `<roll>.<utgar>.<hmac>`,
    HMAC-SHA256 med nyckel = SESSION_SECRET (env). **AKTIVERAS ENDAST när
    SESSION_SECRET finns — utan den NEKAS sessionsvägen tyst och
    lösenordsvägen gäller oförändrat (prod kan aldrig låsa sig på en
    env-kund saknar ännu).** Cookie: httpOnly + secure + sameSite=lax +
    path=/ + maxAge 8 h. Utgår = vägran.
  - `export function forvantatRedaktorLosenord(): string | null` —
    REDAKTOR_PASSWORD (dev-fallback "AK1A-REDAKTOR-2026" ENDAST development,
    samma skärpning som v79: prod utan env = rollen finns ej).
  - `export function requireAdmin(req, body?, tillat?: AdminRoll[])` —
    utökad: (1) giltig sessions-cookie med roll ∈ tillat (default båda),
    ELLER (2) befintlig ADMIN_PASSWORD-väg (roll "admin"), ELLER (3) om
    tillat innehåller "redaktor": REDAKTOR_PASSWORD-väg (roll "redaktor").
    Timing-safe jämförelser (befintligt mönster). ALDRIG logga lösenord/
    cookie-värden.
  - `export function skapaSession(roll): string` + `export function
    lasSessionFranCookie(req): AdminRoll | null` (ren verifiering,-exporterad
    för test).
- NY /api/admin/login/route.ts: POST {losenord} → avgör roll (admin- el.
    redaktör-lösenord; fel = 401 generell text, ALDRIK vilken som felade) →
    om SESSION_SECRET finns: Set-Cookie ak1a_admin (och svar {roll}) — annars
    503 {fel: "Sessioner kräver SESSION_SECRET — använd lösenordsläget"}.
  Logout: POST /api/admin/logout → cookie töms. Endast POST.
- ROLLTILLÅTELSESKARTA (dokumenterad i kontraktet, implementeras i A2):
  admin = ALLT; redaktör = blogg (spara/kontrollera/status/exportera/
  publicera) + termbank-tillägg + kurser-metadata + media (upload/lista/
  radera). Redaktör NEKAS: variabler, medlemmar, bokningar, aktivitet,
  upload-admin, pro-admin, trafik/säkerhet. requireAdmin-anropen uppdateras
  med tillat-parametrar i A2 (ENDAST anropen — filen admin-auth.ts rör
  AUTH-agenten).
- verktyg/testa-admin-session.mjs ≥ 10 PASS ren logik (HMAC-format, utgång,
  roll-tillåt-matris, fel lösenord, cookie-parsning, SESSION_SECRET-frånvaro
  ⇒ sessionsvägen av, timing-safe-simulering ej krav).

**A2 · PANEL-agenten (EDIT enbart panel-filer):**
- admin-klient.ts: `adminHeaders()` BESTÅR; ny `loggaIn(lösenord)` → POST
  /api/admin/login → om cookie satt: session-läge (skickar ej lösenord
  vidare); `loggaUt()`; `lasRoll()`. sessionStorage behåller senaste roll
  för UI. 401/403 ⇒ låsvy som idag + "Logga ut"-knapp.
- admin/page.tsx: rollindikator (Admin/Redaktör-chip), redaktören ser ENDAST
  sina flikar (Blogg/Kurser/Media/Termbank — variabler/övriga döljs),
  inloggningsraden vid öppet läge. SYSKONMÖNSTER, svensk copy.

## DEL B — SPEGLARNA ÄKTA 404 (ALT C ur STYRELSE-SPEGLAR-P2.md)

**B · SPEGLAR404-agenten:**
- Nytt verktyg verktyg/kor-speglar-slugar.mjs: destillerar public/
  speglar-slugar.json = {kurser: [...333 slug], blogg: [...55 slug]} ur
  public/sok-index.json + data/blogg (kor-sokindex-mönstret; lätt, ~10 kB).
- src/middleware.ts UTÖKAS (FÖRSIKTIGT — filen är Mimosa-känd, endast ny
  ren block i slutet): matcher-prefiksen /en/kurser/, /ar/kurser/, /en/blogg/,
  /ar/blogg/ — om <slug> ∈ resp. lista ⇒ next() (status quo); annars
  omedelbar `new Response(FRITT_404_HTML, {status: 404, headers:
  {content-type: text/html; charset=utf-8}})` — enkel svensk 404-sida med
  länk till speglans lista + startsida (INLINE-konstant, inga fetchar).
  Slug-listan läses EN gång per kall start (module-scope import av JSON —
  bundlas i edge-buntens storlek mäts: tak ~40 kB). ÅÄÖ: slugar är rena
  ASCII (minnets regel) — enkel regex. ALDRIG blocking-logik, aldrig nät.
- verifiering: /en/kurser/the-intelligent-investor 200 (äkta), /en/kurser/
  finns-ej 404 ÄKTA + svensk sida, /ar/blogg/finns-ej 404 — lokal
  produktionsserver (main kör).

## DEL C — FORSKNING VÅG 84 (FORSK-agenten → data/forskning/STYRELSE-VAG84-PLAN.md)
(a) html-lang-route-group: detaljerad migreringsplan ur STYRELSE-SPEGLAR-P2
§html-lang (risklistan → steg-för-steg, SSG-paritetsgrind 906=906). (b)
commit-back-spegling alt C (Supabase→priser.json vid skrivning — risker,
token, konflikt med agent-processen; rek). (c) EXPAND-COURSES/översättnings-
systemets framtid nu när korpusen är 100 % (motorbatch-pensionering? termbank-
underhållsläge?). (d) Hetzner H2-dev-instans design (pm2 + nginx + CDN-beslut
— aldrig publik utan beslut).

## KRITA: tsc 35 · motorer 107/0/0 · vakten GRÖN · build exit 0 · befintliga
admin-flöden oförändrade utan nya env (graceful) · inga nya spår (P6 —
session-cookien innehåller roll+utgång+HMAC, ALDRIG lösenord) · deploy-
flödet orubbat.

— Ordföranden, AI-styrelsen AK1A
