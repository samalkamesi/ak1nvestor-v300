# GDPR-DATAKARTA — AK1A Research Lab (intern beredskap)

**Uppdrag:** Styrelsens beslut punkt 7 (mega g6, 2026-09-15).
**Syfte:** Intern beredskapskarta över ALLA personuppgiftsflöden i systemet —
vad, var, raderingsväg (exakta kommando/steg), kaksegregation enligt lagen
(2022:482) om elektronisk kommunikation och art 13-informationsstatus per flöde.
**Status:** INTERN. Ej publig. Kompletterar (och granskar) det publika
art 13-registret på `/transparens`.
**Metod:** Read-only research i kodbasen och på servern (källor § 7). Inga
ändringar i data eller kod har gjorts i uppdraget — åtgärder kräver beslut
(notera R2: radering av personuppgiftslager och git-historia väntar kund).

**Resultat i korthet: 16 flöden kartlagda (F1–F16), 12 brister (varav 3 högallvarlighets).**
De tre allvarligaste: (H1) personuppgifter (e-post, telefon, skärmdumpar) finns
i git-historiken och GitHub-spegeln, (H2) en obevakad cleanup-rutt kan radera
medlemsprofiler, (H3) medlemsradering saknar rutin trots lovat i
/transparens.

---

## 1. Systemöversikt — var personuppgifter kan finnas

| Lager | Plats | Ägs av |
|---|---|---|
| Konton + autentisering | Supabase Auth `auth.users` (projekt suhvlsbp, EU) | Supabase/GoTrue |
| Appens event-logg | Supabase `system_events` (allt nedan: medlem, medlem_progress, medlem_portfolj, medlem_bevakning, trafik, sakerhet, quiz_svaghet, …) | Appen (service-role) |
| Legacy-medlemsdata | Supabase `members`, `client_portfolios`, `client_holdings`, `client_analyses`, `user_activities` | Appen (äldre flöde) |
| Lokal SQLite-kopia | `db/custom.db` i repot (server + git) | Äldre flöde |
| Kundens studio-chatt | `~/.zcode/cli/db/db.sqlite` (zcode:s egna sessionsdatabas) | zcode-app-servern |
| Studio-uppladdningar | `/home/ak1a/agent/ak1/uploads/<datum>/` (STUDIO_UPLOAD_ROT) | Appen |
| Äldre uppladdningar | `upload/` i repot — TRACKAD i git | — |
| Minnen | `~/.zcode/cli/memories/projects/<id>/memory/` + `data/vakten/*` | Agenten |
| Kakor/localStorage | Besökarens webbläsare | Besökaren |
| Backups | Kundens arbetsstation `data/backups/` (gitignorerad) | Kunden |
| Driftloggar | Contabo: nginx, fail2ban, pm2 | Driften |

Prod-server: Contabo 5.189.162.162 (Tyskland/EU). Next.js (pm2 `ak1a`,
port 3000) + zcode-app-cli. Supabase = EU-region (verifierat i
/transparens). GitHub-spegling sköts av kundens arbetsstation (kodbas +
Vercel-backup, passiv).

---

## 2. Flödeskartan — A. Medlemmar och den publika sajten

### F1. Medlemskonto — Supabase Auth (`auth.users`)

- **Vad:** e-post (klartext), lösenord (hashas av Supabase/GoTrue — skickas
  EN gång i begäran och glöms), authId (UUID), tidsstämplar, ev.
  bekräftelsestatus. Inget annat samlas vid signup (verifierat:
  `src/lib/medlem-auth.ts` skickar enbart `{email, password}`).
- **Var:** Supabase-projektet, tabell `auth.users` — ägs av GoTrue, nås via
  Supabase Dashboard eller SQL (appens REST-anon når den ej).
- **Rättslig grund:** avtal 6.1 b (kontot levererar det köpta).
- **Retention enligt /transparens post 1:** aktivt + 12 månader — **automatik
  saknas** (brist B3).
- **Raderingsväg (exakt):**
  1. Supabase Dashboard → Authentication → Users → sök e-posten → Delete
     user (rekorderad väg — tabellen ägs av GoTrue), ELLER SQL-editorn:
     `delete from auth.users where email = '<epost>';`
  2. DÄREFTER rensa kopplad data: F2–F6 nedan (checklista § 6.1).
- **Kaksegregation:** `ak1a_medlem` (access, 1 h) + `ak1a_medlem_refresh`
  (roterande, 30 d) — NÖDVÄNDIGA (httpOnly, secure, sameSite=lax; aldrig
  localStorage).
- **Art 13:** TÄCKT — /transparens post 1; signup-formuläret har kryssruta
  med länk till /villkor + /privacy-policy (art 13: informera vid insamling).

### F2. Medlemsprofil — `system_events` (type=`medlem`)

- **Vad:** `details={authId, epostHash (sha256/12), namn? (valfritt,
  klartext ≤100 tecken), skapad}`. ALDRIG lösenord, aldrig e-post i klartext.
- **Var:** Supabase `system_events`. Skrivs av
  `skrivMedlemProfilEvent` (src/lib/medlem-auth.ts).
- **Retention:** Eget hårt tak 50 000 rader, INGET ålderstak (VÅG 86 §KRITA —
  profilen får aldrig åldras bort; senaste raden per authId är sanningen).
- **Raderingsväg (exakt):**
  ```bash
  curl -X DELETE "https://<ref>.supabase.co/rest/v1/system_events?type=eq.medlem&details->>authId=eq.<AUTHID>" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Prefer: return=representation"
  ```
  (Raderar även Fas-grant — kontrollera § 6.1 steg 6.)
- **Kaksegregation:** bär ingen kaka.
- **Art 13:** TÄCKT — post 1 (kontouppgifter).

### F3. Kursframsteg, quiz-svar, XP — `system_events` (type=`medlem_progress`)

- **Vad:** `details={authId, slug, nyckel, varde}` — kursprogress, quiz-svar,
  certifikatgrund, Fas-grants.
- **Retention:** tak 500 000 rader, inget ålderstak (VÅG 86).
- **Raderingsväg:** som F2 med `type=eq.medlem_progress`.
- **Art 13:** TÄCKT — post 2 (kursframsteg, quiz-svar och XP).

### F4. Portfölj & bevakning — `system_events` (type=`medlem_portfolj`, `medlem_bevakning`)

- **Vad:** innehav per konto (ticker, antal, snittkostnad — ekonomisk
  persondata, dock inga personnummer/namn; importspärren nekar sådant) samt
  valda bevakningar. Tak 100 innehav per konto (`PORTFOLJ_MAX`).
- **Retention:** samma senaste-vinner-regel som medlemstyperna (inget
  ålderstak).
- **Raderingsväg:** som F2 med respektive type.
- **Kaksegregation:** ingen.
- **Art 13:** DELVIS — bevakningar täcks av post 6; **portföljinnehaven för
  medlemmar nämns inte explicit** i registret (post 12 gäller bara
  PRO-biträdesledet). Brist B7: preciseringsrad saknas.

### F5. Legacy-medlemstabeller — Supabase (`members`, `client_portfolios`, `client_holdings`, `client_analyses`)

- **Vad:** `members` (id, email i klartext, ev. namn), portföljer med namn/
  totalvärde kopplade via member_id, innehav (ticker/shares/avg_cost).
- **Var:** Supabase (läses av `importeraLegacyPortfolj` i
  src/lib/medlem-portfolj.ts och /api/admin/kundbild — engångsbrygga vid
  inloggning + adminvy).
- **Retention:** INGEN — tabellerna ligger stilla (brist B4).
- **Raderingsväg (exakt, efter migrering kontrollerad):** SQL-editorn:
  ```sql
  delete from client_holdings where portfolio_id in
    (select id from client_portfolios where member_id = '<MEMBERID>');
  delete from client_portfolios where member_id = '<MEMBERID>';
  delete from members where id = '<MEMBERID>';
  ```
  (memberid slås upp via `members.email`.) R2: radering väntar kund.
- **Art 13:** SAKNAS — legacy-kopian med e-post i klartext finns inte i
  /transparens-registret. Brist B4.

### F6. Aktivitetsspår — `user_activities` (Supabase)

- **Vad:** `session_id` (≤64), action (`page_view`), section (intern sökväg),
  referrer, UA, ipHash, tidsstämpel. Skrivs av `/api/track` (beacon).
  **För inloggade medlemmar är session_id `m-<memberId>`** (läses så av
  /api/admin/kundbild) → personuppgift, kopplingsbar till kontot.
- **Retention:** 90 dagar (organ-motorn, `organ.ts` cut90). /transparens
  post 3 säger 90 dagar — STÄMMER.
- **Raderingsväg (exakt):**
  ```bash
  curl -X DELETE "https://<ref>.supabase.co/rest/v1/user_activities?session_id=eq.m-<MEMBERID>" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
  ```
- **Art 13:** TÄCKT — post 3 (beteendetracer).

### F7. Trafikmätning — `system_events` (type=`trafik`)

- **Vad:** dag, path (query-strängar ALDRIG — saneras i `sannyaPath`), källa
  (värdnamn), UA-klass (bot/mobil/dator/okänd), språk, land, sessionshash
  (SHA-256 saltad, 16 hex, hashas på SERVERN före skrivning), puls/urval.
  Rå IP hashas i minnet och lämnar aldrig processen. INGEN cookie i
  mätningen. Utan analys-samtycke loggas ENBAST path + UA-klass
  (minimal-läget verifieras server-side: session-fält saknas ⇒ stryk språk/
  land/session).
- **Retention:** 12 000 rader / 35 dagar (retention-organet) — /transparens
  post 8 lovar 35 dagar. STÄMMER.
- **Raderingsväg:** automatisk (organet, körs av styrelseronder/cron);
  framtvingat: `DELETE /rest/v1/system_events?type=eq.trafik&created_at=lt.<ISO>` (service-role).
- **Kaksegregation:** styrs av localStorage-samtycket
  `ak1a-cookie-samtycke` (kategori ANALYS) — mätningen i sig sätter ingen kaka.
- **Art 13:** TÄCKT — post 8.

### F8. Säkerhetslogg — `system_events` (type=`sakerhet`)

- **Vad:** blockerade attacker: klass (hot/misstänkt/flöde), http (403/429),
  path, `ip_hash` (SHA-256 + salt ur SESSION_SECRET, trunkerad 16 hex —
  inte reversibel utan salt), UA, monstermönster.
- **Retention:** 3 000 rader / 35 dagar — /transparens post 9 lovar samma. STÄMMER.
- **Raderingsväg:** automatisk; manuellt som F7 med `type=eq.sakerhet`.
- **Art 13:** TÄCKT — post 9.

### F9. Anonym telemetri — konverteringsintentioner, quiz_svaghet, felgräns

- **Vad:** konverteringshändelse (endast nivånamn/period/pris — ingen e-post,
  IP, session), `quiz_svaghet` (`{slug, kap}` — noll personuppgifter; IP-hash
  finns bara som rate-limit-nyckel i minnet), felgränstelemetri
  (`{kategori, url}` — PII-fritt, verifierat i /api/trafik).
- **Retention:** system_events-övrigt-regeln (500 rader/30 d) respektive
  trafikregeln.
- **Raderingsväg:** som F7 (per type).
- **Art 13:** TÄCKT — post 11 (konverteringsintentioner). quiz_svaghet/
  felgräns är ej personuppgifter (ingen art 13-plikt).

---

## 3. Flödeskartan — B. Kundens egna ytor (studio/agent)

*Den registrerade här är kunden själv. /studio är ett inloggat
admin-verktyg bakom `ak1a_admin` — inte publikt. Art 13-plikt i förhållande
till KUNDEN själv uppstår först om verktyget får andra användare; därför
status "intern dokumentation" per flöde.*

### F10. Studio-chattens sessioner — `~/.zcode/cli/db/db.sqlite`

- **Vad:** huvudtrådens ALLA meddelanden (kundens prompts — kan innehålla
  vad som helst kunden skriver/klistrar in, inkl. personuppgifter — samt
  agentens svar), sessionsmetadata, subagent-sessioner. Läses av
  GET /api/studio/stream (tradHistorik, readOnly via node:sqlite) och
  /api/studio/sessions/disk (lista ≤50 trådar).
- **Var:** `~/.zcode/cli/db/db.sqlite` (+ -wal/-shm) på Contabo-servern.
  Ägs av zcode-app-cli. Backas INTE upp av repot-taren (utanför /home/ak1a/AK1).
- **Retention:** INGEN — trådens permanentens är medveten design (våg 148:
  "servern är trådens sanningsägare").
- **Raderingsväg (exakt, intern manual):**
  1. Avsluta pågående studio-turn (inga aktiva zcode-barn).
  2. Arkivera hela databasen (trådar kan inte raderas styckvis via UI):
     `mv ~/.zcode/cli/db/db.sqlite ~/.zcode/cli/db/db.sqlite.arkiv-$(date +%F)`
     samt `rm ~/.zcode/cli/db/db.sqlite-wal ~/.zcode/cli/db/db.sqlite-shm`.
  3. zcode skapar ny databas vid nästa session. OBS: hela trådhistoriken
     försvinner ur studion — worklog.md + data/vakten/huvudtrad.json bevarar
     sammanfattningar. Radera arkivet först när kunden godkänt (R2).
- **Kaksegregation:** `ak1a_admin` (signerad sessionskaka, 8 h) — NÖDVÄNDIG.
- **Art 13:** INTERN — dokumenteras här; ingen publik post behövs så länge
  verktyget är kundens eget.

### F11. Studio-uppladdningar — bilder/filer från kunden

- **Vad:** kundens inklistrade/laddade filer (skärmdumpar kan innehålla
  personuppgifter — t.ex. bank-app, Chrome, YouTube-notiser; PDF:er,
  analysfiler). Max 30 MB/fil. Serveras ENDAST till inloggad admin via
  /api/studio/filer?sokvag=…&bild=1 (no-store, nosniff, requireAdmin).
- **Var:** `/home/ak1a/agent/ak1/uploads/<datum>/<namn>` (STUDIO_UPLOAD_ROT,
  default `<cwd>/uploads`; gitignorerad).
- **Retention:** >7 dagar gamla filer raderas (best effort) vid varje
  POST till /api/studio/uppladdning + "Töm uploads"-knappen
  (DELETE /api/studio/filer rensar roten).
- **Raderingsväg (exakt):** knappen i studion, eller:
  `rm -rf /home/ak1a/agent/ak1/uploads/*` (agenten tappar gamla bildreferenser).
- **Brister i anslutning:** (a) äldre katalog `upload/` I REPOT med ~70
  skärmdumpar/PDF från aug 2026 — TRACKAD i git trots gitignore-regeln
  (tillagd före regeln), följer med till GitHub; ingen automatisk rensning
  (B5/H1). (b) `public/_tmp-k9f2xq1..3.jpg` — tillfälliga bilder ligger i
  PUBLIC och serveras därmed öppet på URL:en (B6).
- **Art 13:** INTERN.

### F12. Minnesfiler — agentens minne + vaktens tillstånd

- **Vad och var:**
  - zcode-minnen: `~/.zcode/cli/memories/projects/<5 projekt-id>/memory/*.md`
    (+ `MEMORY.md`-index) — fakta om kunden (roll "analytiker", språk,
    preferenser, pågående projekt). Exempel bekräftade:
    `user-analyst-role.md`, `user-speaks-swedish.md`.
  - Vaktens tillstånd i repot (data/vakten/): `beslutsminne.jsonl`
    (append-only beslut, refererar kundorder), `audit-logg.jsonl`,
    `mal-state.json` (stående mål — innehåller kundens måltext),
    `huvudtrad.json` (trådens bok), `kunduppdrag.json`/`uppdrag-klart.json`
    (uppdragsprotokollets filer, skapas vid order), `granssnitt-*.json`.
- **Raderingsväg (exakt):**
  - Minnena: /studio → Minne-UI (DELETE gör backup-kopia i
    `.minnes-backup/` först — rensa den efteråt), eller:
    `rm ~/.zcode/cli/memories/projects/<id>/memory/<fil>.md`
  - vakten-filer: `git rm data/vakten/<fil>` (de flesta är otrackade —
    då `rm`). `beslutsminne.jsonl` är append-only BY DESIGN (redovisad
    avvägning) — partiell radering kräver manuelltfilter med kundens godkännande.
- **Art 13:** INTERN.

---

## 4. Flödeskartan — C. Gemensam infrastruktur

### F13. Kakor & lokal lagring — LEK 2022:482 (6 kap. 19–20 §§)

Samtyckesmekanism: kakmur vid första besök (`cookie-consent.tsx`), valet i
localStorage `ak1a-cookie-samtycke` (version, kategorier, datum), ändras via
`?cookies=1` eller "Kakinställningar" i sidfoten. **Inga marknadsföringskakor.**

| Kategori | Nycklar | Kommentar |
|---|---|---|
| Nödvändiga (inget samtycke) | `ak1a-cookie-samtycke`; `ak1a_admin` (8 h, signerad); `ak1a_medlem` (1 h) + `ak1a_medlem_refresh` (30 d, roterande); `ak1a-member` (äldre lokal profil); `ak1a-elevkarna-v1` + `ak1a-klara-kurser` (kursprogress); `ak1a-quiz-*`, `ak1a-sr-v1`, `ak1a-sr-xp-v1` (quiz/SR/XP) | Samtliga sessionskakor httpOnly+secure. Listan = /cookiepolicy (STÄMMER med koden). |
| Analys (samtycke) | `ak1a-tracer-v1` (se F14) | Endast efter aktivt val. |
| Preferenser (samtycke) | `ak1a-notiser-v1`, `ak1a-notiser-dag-v1`, `ak1a-signal`, `ak1a-organ-event`, `ak1a-badges`, `ak1a-shortseller-v1`, `ak1a-analysbank-v1`, `ak1a-villkors-samtycke` | UI-val, notiser, verktygs-state. |

- **Raderingsväg:** användaren rensar i webbläsaren (lärs ut i
  /privacy-policy § "Så raderar du lokal data själv" och ?cookies=1).
- **Art 13/LEK:** TÄCKT — /cookiepolicy (fullständig förteckning) + post 7
  i /transparens. Brist B8: analys+preferenser är FÖRIFYLLDA i kakmuren
  (`useState(true)`) och "Godkänn alla" är primärknapp — samtycke ska vara
  aktivt givet; avförkryssa.

### F14. Beteendetracer — localStorage `ak1a-tracer-v1` (KLIENTEN)

- **Vad:** aktiv tid, besökta sidor, verktygsanvändning, quiz-räknare,
  typiska timmar, intresseprofil, scroll-djup, tid per sektion,
  musrörelse AGGREGERAD (sträcka/jitter — koordinater lämnar aldrig minnet).
  ALLT lokalt; INGET skickas (delningsknapp ej byggd). Server-sida = no-op.
- **Raderingsväg:** webbläsarens rensa lokal data.
- **Art 13:** TÄCKT — post 3, men notera B9: "rullande 90 dagar" i post 3
  avser serverns user_activities — den LOKALA tracern står tills användaren
  rensar. Precisera formuleringen vid nästa revision.

### F15. Backups

- **Vad och var (kundens arbetsstation, `data/backups/` — gitignorerad):**
  - `backup-fran-molnet.mjs` → `system-events-full-<datum>.json[.gz]`
    (FULL dump av system_events, tak 200k rader) + `medlem*.json` —
    **innehåller authId, namn, epostHash, portföljinnehav, trafik- och
    säkerhetshistorik.**
  - `backup-server-filer.mjs` → `server-repo-<datum>.tar.gz` (hela
    /home/ak1a/AK1 utom node_modules/.next — alltså `upload/`-skärmdumparna,
    data/vakten, db/custom.db, worklog) + `server-env-backup` (.env — ej
    personuppgift men hemlighet).
  - DR-prov i skrap-postgres (drift-ops) — kopia av Supabase-data vid prov.
- **Retention:** SAKNAS — datumfiler ackumuleras; ingen dokumenterad
  raderingstid för personuppgifter i backup (brist B10).
- **Raderingsväg (exakt, på arbetsstationen):**
  `rm data/backups/system-events-full-<datum>.json* data/backups/server-repo-<datum>.tar.gz`
  (behåll .env-backup enligt driftspolicyn).
- **Art 13:** SAKNAS delvis — post 1 lovar radering 12 mån efter
  kontots slut, men backuppar utan retention gör löftet omöjligt att hålla.

### F16. Serverns driftloggar (Contabo)

- **Vad:** nginx åtkomstlogg (IP + tidstämpel + sökväg), fail2ban-loggar,
  pm2-apploggar (`~/.pm2/logs/`). /transparens post 10 redovisar lagret
  korrekt (IP + tidstämpel, berättigat intresse, loggrotation "kort
  lagringstid").
- **Raderingsväg:** logrotate (verifiera att den körs — B11);
  `truncate -s 0 /var/log/nginx/access.log` vid begäran om granskning+radering.
- **Art 13:** TÄCKT — post 10 (Contabo).

**Sammanlagt 16 numrerade flöden: F1–F9 den publika sajten, F10–F12 kundens
egna studio-ytor, F13–F16 gemensam infrastruktur.**

---

## 5. Art 13-täckningsmatris (/flöde → /transparens-post)

| Flöde | Post i /transparens | Status |
|---|---|---|
| F1 konto | 1 Kontouppgifter | ✅ täckt |
| F2 profil | 1 | ✅ |
| F3 progress | 2 Kursframsteg | ✅ |
| F4 portfölj/bevakning | 6 (bevakning) / 12 (endast PRO) | ⚠️ medlemsportfölj implicit |
| F5 legacy-tabeller | — | ❌ saknas |
| F6 aktivitetsspår | 3 Beteendetracer | ✅ |
| F7 trafik | 8 Trafikstatistik | ✅ |
| F8 säkerhetslogg | 9 | ✅ |
| F9 telemetri | 11 | ✅ |
| F10 sessioner (studio) | — | intern (kunden själv) |
| F11 uploads (studio) | — | intern |
| F12 minnen | — | intern |
| F13 kakor | 7 + /cookiepolicy | ✅ (men B8) |
| F14 tracer lokal | 3 | ⚠️ 90-dagar gäller ej lokalt (B9) |
| F15 backups | 1 (12-mån löfte) | ❌ retention saknas (B10) |
| F16 driftloggar | 10 Contabo | ✅ |

---

## 6. Raderingsmanualer (intern beredskap)

### 6.1 Radera en medlem HELT (art 17-begäran)

1. **Konto:** Supabase Dashboard → Authentication → Users → Delete (F1).
2. **Profil:** `DELETE system_events?type=eq.medlem&details->>authId=eq.<AUTHID>` (F2).
3. **Progress:** samma med `type=eq.medlem_progress` (F3).
4. **Portfölj + bevakning:** `type=eq.medlem_portfolj` resp `medlem_bevakning` (F4).
5. **Legacy:** members/client_portfolios/client_holdings via SQL (F5) —
   slå först upp memberId via e-post.
6. **Aktivitetsspår:** `DELETE user_activities?session_id=eq.m-<MEMBERID>` (F6).
7. **Kontroll:** läs tillbaka med `select=id` + samma filter — 0 rader =
   klart. Bokför åtgärden (vem, när, vad) i worklog; 12-månaders-
   undantaget (bokföring) gäller ev. betalningsdata — kontrollera mot
   fakturaunderlag FÖRE radering.
   OBS: radering av kunddata = R2 → kunden godkänner utförandet.

### 6.2 Radera kundens egna studiodata

1. Sessioner/trådar: § F10 (arkivera db.sqlite — kundens godkännande först).
2. Uploads: "Töm uploads" i studion (§ F11).
3. Minnen: Minne-UI:t → radera filer (§ F12); rensa `.minnes-backup/`.
4. Vakten: `git rm`/`rm` per fil (§ F12).

### 6.3 Rensa backups (vid begäran)

`rm data/backups/system-events-full-<datum>.json* server-repo-<datum>.tar.gz`
på arbetsstationen (§ F15). DR-skrapen rensas enligt drift-ops.

---

## 7. Brister — sammanställd lista (B1–B12)

| # | Allvar | Brist | Åtgärd (ägd av) |
|---|---|---|---|
| B1/H1 | HÖG | `db/custom.db` (Member: email, phone m.m. — 2 rader; UserActivity 254 rader) är TRACKAD i git → GitHub-spegeln + varje klon. Även `upload/`-skärmdumpar (~70 st, aug 2026) är trackade trots senare gitignore. | `git rm --cached db/custom.db upload/*` + commit; git-historierensning + GitHub-purge = kundens beslut (R2, extern yta). Överväg BFG-filter-repo. |
| B2/H2 | HÖG | `/api/supabase/cleanup` (GET) har INGEN adminvakt och raderar `system_events` >7 dagar — skulle förstöra medlemsprofiler (VÅG 86: aldrig ålderstak) och bryta 35-dagars-trafikaggregaten vid ett slumpträff/crawl. | requireAdmin + ta bort system_events ur cleanup-listan (retention-organet äger den). Kodändring (src/) — ej i detta uppdrag. |
| B3/H3 | HÖG | Medlemsradering saknar rutin: ingen DELETE-rutt; transparensens "aktivt + 12 månader" har ingen automatik. | Manualen § 6.1 (denna karta) + beslut om automation (rättighets-rutt) i kommande våg. |
| B4 | MEDEL | Legacy-tabeller med e-post i klartext (members m.fl.) kvar i Supabase utan post i /transparens. | Migrationsbeslut: arkivera/radera efter F5-bryggans avslut (R2). |
| B5 | MEDEL | `upload/` (äldre katalog) saknar automatisk rensning och ingår i tar-backup. | Engångsstädning + arkivera ev. behållna filer utanför repot. |
| B6 | MEDEL | `public/_tmp-k9f2xq*.jpg` — tmp-bilder i public/ serveras öppet på gissningsbar URL. | Flytta till uploads/ (ignorerad) eller radera; aldrig public/ för kundbilder. |
| B7 | LÅG | Medlemsportföljens innehav nämns inte explicit i /transparens (post 12 gäller bara PRO). | Preciseringsrad i registret vid nästa revision. |
| B8 | MEDEL | Kakmuren förifyller analys+preferenser (förcheckade) och gör "Godkänn alla" till primärknapp — samtycke ska vara aktivt (LEK 6 kap 19 §; GDPR art 7). | Avförkryssa i cookie-consent.tsx (kodändring, kommande våg). |
| B9 | LÅG | Post 3:s "rullande 90 dagar" gäller server-data; lokala tracern står tills rens. | Precisera formulering. |
| B10 | MEDEL | Backups (fulla system_events-dumpar med authId/namn + repot-tar med skärmdumpar) saknar retention. | Retention (t.ex. 90 d) i hybrid-sync + bokför i DRIFTSBOKEN. |
| B11 | LÅG | Loggroteringen på Contabo ej verifierad i detta uppdrag. | Verifiera logrotate/fail2ban-rotation (drift-ops). |
| B12 | LÅG | Samtyckesbevis (kakvalet) finns endast klient-side — art 7.1-bokföring svår. | Vid revision: överväg server-side samtyckeslogg (minimal rad). |

---

## 8. Källor (read-only research 2026-09-15)

- `src/app/api/trafik/route.ts`, `src/lib/sakerhet.ts` (trafik + säkerhet,
  hash/sanering), `src/middleware.ts` (blockering).
- `src/lib/medlem-auth.ts` (auth-kontrakt, kakor, profil-event),
  `src/lib/medlem-progress.ts`, `medlem-portfolj.ts`, `medlem-bevakning.ts`
  (eventtyper + legacy-brygga), `src/app/api/medlem/route.ts`,
  `src/app/api/admin/{medlemmar,members,kundbild}/route.ts`.
- `src/app/api/track/route.ts` (user_activities), `src/app/api/quiz/svaghet/route.ts`,
  `src/app/api/konvertering/intention/route.ts`.
- `src/lib/autonom/organ.ts` (retention-organet: tak per typ).
- `src/app/api/supabase/cleanup/route.ts` (B2).
- `src/app/(huvud)/transparens/page.tsx` (art 13-registret),
  `privacy-policy/page.tsx`, `cookiepolicy/page.tsx` (kaklistan),
  `src/components/ak1a/cookie-consent.tsx`.
- `src/app/api/studio/{filer,uppladdning,minne,stream,sessions/disk}/route.ts`,
  `src/lib/studio/studio-transport.ts` (uploads-rot, minnen, db.sqlite).
- `verktyg/backup-fran-molnet.mjs`, `verktyg/backup-server-filer.mjs`.
- Serverkontroller: `ls` av `upload/`, `uploads/`, `data/vakten/`,
  `~/.zcode/cli/{db,memories}`; sqlite-läsning av `db/custom.db` (readOnly);
  `git ls-files` (trackning), `.gitignore`.

*Pedagogisk plattform — inte investeringsråd (2007:528). Detta dokument är
intern beredskap enligt styrelsens beslut punkt 7; genomförande av
raderings-/revisionsåtgärder följer R2 (kundens veto för radering, extern
publicering och git-historia).*
