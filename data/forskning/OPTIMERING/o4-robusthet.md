# O4 — Robusthet & teknisk skuld (MEGA-OPTIMERING fas A)

Datum: 2026-09-05 · Granskare: arkitektur-review (tsc --noEmit, statisk
kodanalys, schema- och cron-genomgång). Arbetslogg: VÅG 63 O4.
Konkret mätvärde: **tsc-baslinjen = 43 fel** (`ignoreBuildErrors: true`
i next.config.ts låter alla 43 passera bygget — varav minst 3 är
verkliga prod-krascher, se §1).

## 1. TSC-baslinjen: 43 fel exakt (fördelning: src 19 · scripts 22 · examples 2)

**A. Runtime-krascher i prod-kod (dolda av ignoreBuildErrors) — 9 fel:**
| Fil | Fel | Prod-effekt |
|---|---|---|
| `src/app/api/admin/bookings/route.ts:33,41,43` | 4× TS2304 `SUPABASE_URL`/`SUPABASE_KEY`/`rest` saknas i PATCH-scope | PATCH kastar ReferenceError → alltid 500; bokningsbekräftning död |
| `src/components/ak1a/rik-text.tsx:84,86,88` | 3× TS2552 `fargar` (deklarerad `farger`) | ReferenceError när poängskalor renderas → komponentkrasch |
| `src/components/ak1a/stock-analysis-view.tsx:812` | TS2339 `recommendationScale` finns ej | Renderar "Du är här · undefined av 5" |
| `src/components/ak1a/stock-analysis-view.tsx:841` | TS2552 `setSection` finns ej | ReferenceError vid klick på "Öppna AKM1-calculatorn" |

**B. Type-fel utan omedelbar krasch i prod-kod — 10 fel:**
supabase/status (2×, feltypad null), interaktiva-verktyg (3× `never[]`
= otypad `useState([])`), visuellt-bibliotek (4× `never[]`),
customer-ecosystem (1× `.locale` på string), spaced-repetition (1×
null-guard i filterpredikat).

**C. Verktyg/examples — 24 fel:** scripts/save-blueocean-tasks (5×
`db possibly null`), save-mega-tasks (4×), seed-cases-combinations (7×
— tuple längd 10 vs 11 = avgår en kolumn!), seed (4×),
restore-course-depth-v2 (1× `any→never`), examples/websocket (2× —
`socket.io`/`socket.io-client` är inte ens installerade).

**Fix:** A = 5 rader kodändring (scope `rest` in i PATCH; `fargar`→
`farger`; `setSection`→intern state eller prop; `recommendationScale`→
befintligt `r.scale`-fält). Därefter `typescript.ignoreBuildErrors:
false` + `tsconfig.exclude: ["scripts", "examples"]` tills C ärstädat.

## 2. console.log-skräp

5 förekomster i 3 filer. Prod-påverkande: **1** —
`src/lib/oversattning/motor.ts:651` (rondlogg per objekt i
översättningscronen; avsiktlig men spammar Vercel-loggar vid stora
ronder → flytta till aggregerad slutrad). Övriga 4 i
`src/lib/ak1a/regenerate-all-courses.ts` (3) och `add-perspectives.ts`
(1) = offline-skript, harmlösa.

## 3. Dubblettkod

- **Tre menyimplementationer:** `header.tsx` (667 r) rullar EGEN
  desktop+mobil-logik (`oppenSektion` + `kontext`) parallellt med
  `huvudmeny.tsx` (191 r) och `mobilmeny.tsx` (360 r) som duplicerar
  samma tillståndsmönster (`useState<MenyKontext>(GAST_KONTEXT)` +
  sektionsväxling). Huvudmeny/mobilmeny används ENDAST av
  `seo-page-shell.tsx`. → Bryt ut `useMenyKontext()`-hook + gemensam
  sektionstoggla; tre filer → en komponent + två tunna wrappers.
- **~10 handrullade rate-limiters** (se §5) — ingen delad helper.
- **Två SQL-setup-filer:** `scripts/supabase-schema.sql` och
  `scripts/supabase-setup-ak1a.sql` skapar båda system_events (mm.) —
  divergensrisk när index ändras i den ena men inte den andra.
- "Spektra": ingen direkt koddubblering hittad i wave-matrix; väl
  avgränsad (undantag: vågterminologi upprepas i 9 komponenter —
  kosmetiskt).

## 4. Deps-audit: 16 paket oanvända + 9 oanvända ui-komponenter

**Noll importer i src/scripts/tests (kan `npm rm` direkt):**
`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`,
`@mdxeditor/editor`, `@reactuses/core`, `@tanstack/react-query`,
`@tanstack/react-table`, `framer-motion`, `next-auth`, `next-intl`,
`react-syntax-highlighter`, `date-fns`, `uuid`, `zod`,
`react-markdown`, `@hookform/resolvers`.

**Oanvända via oanvända shadcn-ui-filer (radera komponent + dep):**
carousel→`embla-carousel-react`, input-otp, calendar→`react-day-picker`,
form→`react-hook-form`, chart→`recharts`, drawer→`vaul`,
resizable→`react-resizable-panels` (samt dessa 7 ui-filer; sonner och
cmdk ÄR använda — behåll). `satori`+`sharp` behålls (og-skript +
Next-image). **Notera även:** dubbla lockfiler (`bun.lock` 262 kB +
`package-lock.json` 522 kB) och `--legacy-peer-deps` i vercel.json —
välj package-lock, ta bort bun.lock ur repot.

## 5. Risksvep

**CRON_SECRET (kunden har EJ satt den) → 12 schemalagda rutter är
helt öppna för internet** (mönstret vägrar aldrig utan satt secret):
`/api/cron/autonom` (00:00), `seo-refresh` (03:00), `vagscan` (05:00),
`vagvalidering` (05:30), `datacache` (06:00), `email` (06:30 —
**SKICKAR RIKTIGA MEJL = spam-vektor**), `kvalitet` (07:00),
`/api/nyheter/scan` (08:00), `oversatt` (10:00 — **bränner
översättningskvoter/DeepL-krediter**), `expand-courses` (12:00),
`portfolj-uppfoljning` (mån 07:00), `akm3-kalibrering` (mån 05:20).
Dessutom `webhook/vbt` i "overifierat läge" utan VBT_WEBHOOK_SECRET.
Gott mönster: `migrate-to-supabase` VÄGRAR utan MIGRATE_SECRET (403).
**Fix = 1 env-variabel** (Vercel skickar automatiskt `Bearer
CRON_SECRET` till sina crons när den är satt) — kundåtgärd, noll kod.

**Ogardad admin-yta (värsta fyndet):** `/api/admin/members` PATCH
(ändra medlem till pro/pre!), `/api/admin/bookings` PATCH,
`/api/admin/activity`, `/api/admin/upload-analysis`,
`/api/pro/admin` — **ingen som helst auth** (admin/auth-route finns
men verifieras inte av övriga rutter; middleware fångar bara
scanners/flöden). → Delad `requireAdmin()` (signad HMAC-cookie på
ADMIN_LOSENORD) + middleware-block på `/api/admin/:path*`.

**Rate-limits inkonsekventa:** middleware 30/10 s (bot) resp 150/10 s
(normal) per IP-hash — men route-nivån är ~10 duppade
minnes-limiters med OLIKA scope: **GLOBALA per process** (email 10/min,
konvertering/intention 10/min — en attacker låser ALLA besöktares
mejlanmälningar; och per Vercel-lambda = taket multipliceras),
per-IP/nyckel (admin/auth 5/min, fas2-access, signal, styrelse, trafik,
webhook). Alla nollställs vid cold start. → gemensam
`kontrolleraTak(nyckel, max, fönsterSec)` i `src/lib/sakerhet.ts`;
email/intention → per-IP.

**Supabase-index:** system_events har ENDAST enkelt index på `type`,
`severity`, `created_at` (supabase-schema.sql:268-270). Alla frågor
kör `type=eq.X&order=created_at.desc` (lager.ts läsregler, organ.ts
retention+dedupe, akm3-kalibrering, admin-paneler) → Postgres sorterar
alla träffrader (typ-oversattning växer mot 45 000) vid VARJE läsning.
**Fix:** `CREATE INDEX idx_events_type_created ON
system_events(type, created_at DESC);` i BÅDA SQL-filerna + SQL-editorn.

**Middleware-deprecation:** Next 16.3.2 bygger med varning "The
'middleware' file convention is deprecated. Please use 'proxy'
instead" — `src/middleware.ts` funkar än men ska migreras:
`npx @next/codemod@canary middleware-to-proxy .` (ren rename; kör
dev-servern efteråt — matchern kastar vid ogiltigt mönster).

## 6. Datavård

- **45k-taket:** logiken lever (organ.ts `raknaTakMos`: dubletter först,
  sedan icke-publicerade äldst; körs av cron/autonom 00:00). VÅG 55
  testade lagret live 12/12 — men **själva taktrimningen har inget
  automatiserat test** (repot saknar helt *.test.ts; tests/ innehåller
  bara byggskript). → `verktyg/testa-retention.mjs` mot dev-Supabase
  (sätt in 45 001 rader → verifiera trimordning).
- **Hash-kedjor på read-only fs — FUNGERAR EJ på prod:** crons skriver
  `kalibrering-logg.json` / `regime-logg.json` /
  `prediktionslogg-akm3.json` med `writeFileSync` i try/catch; på
  Vercel misslyckas skrivningen TYST (kalibrering/regime) eller med
  notis (prediktion). Filerna som läses nästa rond är de som bundles
  vid build (`outputFileTracingIncludes`) → **prod-kedjan växer aldrig;
  varje rond kedjar mot samma build-time prevHash = syskonrader, inte
  en kedja**; `valideraKedja` läser den frusna filen och rapporterar
  alltid "intakt". Append-only-kontraktet (BESLUT §10.5/§10.10)
  uppfylls bara i dev/CI. **Fix:** läs `prevHash` från senaste
  system_events-rad (type=akm3_kalibrering etc.) när filskrivningen
  faller — DB blir sanningen på prod; eller dedikerad
  hashkedja-tabell.
- **Backup:** `data/backup/` innehåller manuella kopior
  (kalibrering-logg, regime-logg, korstabell) — ingen automatiserad
  export; prediktionsloggen saknas bland kopiorna. system_events
  exporteras inte alls. → veckovis `verktyg/`-export av
  type in (akm3_kalibrering, vagvalidering, prediktion) till
  data/backup + commit, eller Supabase-dagssql.

## 7. Topp-10 rankad efter prod-påverkan (✅ = före nästa marknadspush)

| # | Skuld/risk | Fix | Push? |
|---|---|---|---|
| 1 | Admin-ytan ogardad (members PATCH m.fl.) | `requireAdmin()`-helper + middleware-block `/api/admin/*` | ✅ |
| 2 | CRON_SECRET osatt → 12 öppna rutter (email-spam, kvotbränning) | kund sätter 1 env-variabel; vägrà-läge som migrate-rutten | ✅ |
| 3 | 3 runtime-krascher dolda av ignoreBuildErrors (§1A) | 5 rader kod; sedan ignoreBuildErrors=false | ✅ |
| 4 | Hash-kedjor frusna på prod (read-only fs) | prevHash från system_events vid filfail | ✅ |
| 5 | system_events saknar (type, created_at)-index | 1 CREATE INDEX i båda SQL-filerna | ✅ |
| 6 | Rate-limits globala/inkonsekventa (email-DoS) | gemensam per-IP-tak-funktion | ✅ |
| 7 | ignoreBuildErrors=true permanent | tsconfig-exclude scripts/examples + återaktivera | ✅ (efter 3) |
| 8 | 16 oanvända deps + 9 ui-filer + dubbla lockfiler | npm rm + radera filer + behåll package-lock | nästa |
| 9 | Tre menyimplementationer + två SQL-setup-filer | useMenyKontext-hook; slå ihop SQL-filerna | nästa |
| 10 | Retention-trim otestad + ingen auto-backup av loggkedjorna | testa-retention.mjs + veckoexport | nästa |

Total åtgärd före push: ~1 dag kod + 2 kundåtgärder (CRON_SECRET,
CREATE INDEX). Inget committat i denna granskning.
