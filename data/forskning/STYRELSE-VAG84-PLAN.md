# STYRELSE — VÅG 84-PLAN (forskning, agent V83-FORSK 2026-09-07)

Underlag: STYRELSE-VAG83-ROLLER.md DEL C · STYRELSE-SPEGLAR-P2.md §2 ·
ADMIN-MEGA §2.2 alt C + §4.1 · tidigare leverantör-ARKITEKTUR fas H2 · worklog våg 81-82.
Forskning — BYGG EJ. Källmätningar: ls/find mot src/app (2026-09-07).

## (a) HTML-LANG-ROUTE-GROUP — migreringsplan (SPEGLAR-P2 §2 → steg-för-steg)

Nuläge: src/app/layout.tsx:209 äger `<html lang="sv">`; speglarnas SSR-HTML
bär sv-lang till crawlers. Kompensationerna (div-lang, hreflang-kluster,
SpegelSprakLeverantor) består tills flyttet. SRC-KARTA (uppmätt): app-rot har
53 poster, varav ~45 sv/neutrala ruttmappar + 190 ruttfiler totalt; en/ + ar/
har egna NESTADE layouter (blir root-layouter efter flyttet).

**STEG 0 — spike (30 min, INNAN sankning):** (i) not-found.tsx per grupp i
sandbox — verifiera utseende + äkta 404-status med flera root-layouter;
(ii) kartlägg vilka sidor som FÖLJER rot-layoutens metadata-default
(canonical SITE_URL + start-hreflang — mest /pro, verktygssidor): de behöver
explicit metadata i en/ar-grupperna, annars dubbelkanonikaler.

**STEG 1 — gemensam infrastruktur (deploy-bar, noll beteendeförändring):**
- `src/lib/typografi.ts`: de fyra next/font-instanserna som modul-singletons
  (importeras av alla tre layouterna — ingen koddubblering).
- `src/lib/globalt-skal.tsx`: server-komponent `<GlobaltSkal lang="sv|en|ar">`
  (ThemeProvider, SprakLeverantor, Ak1aStoreProvider, Toaster, StagingBanner,
  PageViewBeacon, organisation/website-JSON-LD, de sex lazy-globalerna) +
  viewport/manifest-export i samma modul. Rot-layouten delegerar redan dit
  i detta steg (deploy-bar isolering). Grind: build 906=906 + visuellt
  identisk + ingen grupp utan skal (risk 4).

**STEG 2 — massflyttet (EN egen våg, flytt-agenten ENSAM — SPEGLAR-P2
risk 1: maximal git-churn mitt i parallellbyggen):**
- `src/app/(huvud)/` tar ALLT sv + neutralt: de ~45 ruttmapparna + page.tsx,
  error/loading/not-found (globals.css importeras per layout).
- `src/app/(en)/en/**` + `src/app/(ar)/ar/**`: befintliga filer + en/ar:s
  nuvarande layouter flyttas OFÖRÄNDRADE och blir root-layouter
  (`<html lang="en">` resp. `lang="ar" dir="rtl"`, suppressHydrationWarning ×3).
- ROT-layouten `src/app/layout.tsx` FÖRSVINNER (atomiskt — inga sidor får
  ligga direkt under app/ utanför grupper när rot-layouten borts).
- KVAR på app-rot: sitemap.ts, robots.ts, manifest.ts (konventionsfiler),
  api/ (route handlers — layout gäller ej), globals.css.
- Speglarnas metadata-defaults: metadataBase + canonical mot /en|/ar-rot.
- SprakLeverantorns documentElement-skrivning består (redundant, ofarlig).

**STEG 3 — verify-grind (vägräknande):** (i) next build → inventarie av
.next/server/app före/efter: EXAKT 906 = 906, samma uppsättning (engångs-
mätning i tool-results/); (ii) SSR-grep: /en-sida → lang="en", /ar →
lang="ar" dir="rtl", sv opåverkad; (iii) klientväxling sv↔en↔ar utan
hydreringsfel; (iv) build-tid oförändrad i princip; (v) PWA/manifest/ikoner
korrekt per grupp.

**STEG 4 — rollback:** ren git revert av flytts-commiten (EN commit för hela
flyttet = kontraktskrav). Filflytt utan datamigrering; URL:erna OFÖRÄNDADE
(gruppmappar räknas ej i sökvägen) ⇒ ingen extern påverkan, ingen SEO-kostnad.

**Omfattning:** 1 våg + spike; max 2 agenter (GlobaltSkal-agent steg 1 kan
ske i förväg i annan våg; steg 2 SELVT ensamt). Prioritet: viktigt men ej
brådskande — kompensations-signalerna gäller (Google läser språk främst ur
innehåll); läggs efter admin-mega-avslut och tidigare leverantör H1.

## (b) COMMIT-BACK-SPEGLING — Supabase → priser.json (steg 5-rest)

Kärna: Vercel-fs är read-only; git-push från panel kräver GitHub-token i
Vercel-env = ny hemlighet + attackyta (ADMIN-MEGA §4.1 avvisade token-vägen
som primär). Tre alternativ:

- **ALT 1 — periodisk agent-synk (REKOMMENDERAD):** verktyg/synka-variabler
  .mjs (samma mönster som verktyg/synka-termbank.mjs våg 79): dra Supabase
  senaste-vinner → skriv priser.json → commit ENDAST vid diff. Körs (i) av
  agent i varje vågs avslutningschecklista och (ii) när tidigare leverantör H1/H2 lever:
  schemalagt på tidigare leverantör (cron) där git-autentisering redan finns. INGEN
  Vercel-token någonsin. Panelen kan visa "gitSpeglad: tidpunkt".
- **ALT 2 — Vercel deploy-hook-kedja:** panel-POST → deploy-hook → rebuild.
  Löser INTE spegling (bygger om ur Supabase; filen förblir stale) och är
  onödig (revalidate 300 s + ISR finns). AVSLÅS som speglingsmekanism.
- **ALT 3 — accepterad tvåvägsordning (KONTRAKT, alltid oavsett val):**
  dokumenterad ordning i variabler.ts-filhuvudet: Supabase = sanning live,
  filen = seed; agenter MÅSTE lasGallande() före pris-copy-skrivningar;
  panelen visar källa+tid per nyckel (§4.1 iv).

**Risker:** (i) token i env — undviks helt med alt 1; (ii) race agent-vs-
synk: synken får INTE köras parallellt med pågående vågbyggen (agenten drar
den före sin commit — enkel regel); (iii) senaste-vinner-konflikt: agent
ändrar filen samtidigt som kunden ändrat i panelen ⇒ filändringen tystas —
mitigering: kontraktet + diff-preview före agent-commit + att git aldrig
anses sanning. **Rek: ALT 1 + ALT 3.** Omfattning: en timmes agent-del
(verktyg + filhuvud) — ryms i nästa admin-våg, ingen egen våg.

## (c) ÖVERSÄTTNINGSSYSTEMETS EFTERLIV (korpus 100 % sedan våg 76)

Fakta: 69 857 källobjekt = 100 %, 139 745 rader, 2 dokumenterade AR-undantag.
- **Motorbatch/MyMemory:** nattfyllnads-batchen PENSIONERAS ur rondschemat —
  kvot-flaskhalsen (≈5 000 ord/dag anonym) finns ej längre. motor.ts består
  som bibliotek för on-demand-nyöversättning (DeepL/Google om kund nycklar
  in; termbankens PRE/POST-styrning behålls). Nya schemalagda kvotberoenden
  tillkommer ALDRIG.
- **Termbank:** underhållsläge. Admin-tillägg lever (Supabase-sanning sedan
  våg 79); termer betyder nu något först för NYTT innehåll. Vardag 0; ev.
  granskningsrond per kvartal eller vid ny domän.
- **"Översätt vid publicering" (Läge A-anda — sv först, agent rondar):**
  1. Post publiceras sv (B2-paket/fil-drop) — speglar visar svensk fallback
     (redan beteendet; kurstitlarna våg 80b samma mönster).
  2. Samma våg, main-agentens plock-rutin (DOKUMENTERAD — ingen kod):
     extrahera nya strängar (title/description/body/pillar) → importpaket
     data/oversattning-import/vNN.json → standardpipeline med kontroller →
     MÖS-lagret → ISR färgar speglar ≤1 h. Regens av sok-index +
     speglar-slugar (våg 83-verktygen) i samma steg som fil-droppen.
  3. Hinner vågen ej: system_events type="oversattning_skuld" (details=
     slug+fält) → nästa rondlista genereras ur STATUSKARTAN (v76-lärdom:
     aldrig handsgjorda listor). Grind: kor-status <100 % syns i radarn —
     befintlig mätning, noll ny kod.
- **Våg 84-förslag (konkret):** ingen egen översättningsvåg. (i) dokumentera
  plock-rutinen (B2 + framtida m9-utkast) med stegen ovan i styrelse-dok +
  worklog; (ii) stryk motorbatch-raden ur rondschemat; (iii) VALFRITT lilla
  verktyget verktyg/oversatt-skuld.mjs (läser kö/status → genererar nästa
  importpaket-skelett) om main-agenten vill ha stöd. Kostnad: minuter.

## (d) tidigare leverantör H2-DESIGN — dev-instans (pm2 + nginx)

**PUNKT FÖR PUNKTEN: H1 BLOCKAR fortfarande på KUNDSTEG 1 — ssh-copy-id -i
~/.ssh/contabo_key.pub root@65.108.241.93 (servern svarar men nekar:
Permission denied publickey,password). Allt nedan är papper till dess.**

Design (för sankning efter H1-verifiering):
- **pm2 ersätter keepalive.sh HELT:** ecosystem-fil kör `next start -p 3000`
  på senaste build (INTE next dev — telefon-refresh-roten var dev-HMR-
  reconnects; en byggd server har inga sådana) + max_memory_restart ~700 MB
  (CX23 har 4 GB) + pm2 startup && pm2 save (boot-beständig). keepalive.sh:s
  curl-15s + kill/restart-mönster dör; pm2:s processvakt + minnesgräns
  ersätter. Bygg via data/infra/tidigare leverantör/bygg.sh (git pull → npm ci → build).
- **nginx reverse proxy :80 → 3000** (beredd i H1) med TRE skydd:
  1. `X-Robots-Tag: noindex, nofollow` som nginx-header på ALLA svar —
     crawler-säkert utan att röra src/.
  2. Dev-vhostens robots.txt: `User-agent: * Disallow: /` (nginx-location).
  3. Auth DAG 1: **basic-auth (htpasswd, starkt lösen)** — enda telefon-
     kompatibla alternativet (X-Header-hemlighet kräver klient som sätter
     headers ⇒ avslås för kundens telefon). OBS: över ren HTTP är det
     base64-interim; målskyddet är HTTPS (DNS-beslut nedan). Utan auth
     NEKAS ALLT — dev-instansen har dev-fallback-lösenord i koden.
- **Env:** .env (Supabase ×3 + MARKETSTACK) rsync-as chmod 600 under
  /home/ak1a (säkerhetskontrakt §3) — ALDRIG committad.
- **KRÄVER KUND-DNS-BESLUT (H3-grinden):** dev.ak1nvestor.com A →
  65.108.241.93 möjliggör Let's Encrypt + basic-auth över TLS. Utan DNS:
  åtkomst via http://65.108.241.93 (basic-auth + noindex-interim) eller SSH-
  tunnel (localhost-only — telefon kan ej). Beslutet styr bara TIMING;
  designen är DNS-neutral. Ingen publik indexering i noläget.
- **Synergi:** när boxen lever äger dess cron den periodiska variabel-
  speglingen (sektion b ALT 1) + ev. tunga nattjobb (H3).

## SLUTSATSER (fyra rader)
(a) Genomförbart i EN egen våg (spike + GlobaltSkal i förväg, flytt-agent
ensam, 906=906 som grind, revert = en commit) — viktigt, ej brådskande.
(b) Periodisk agent-synk + dokumenterad tvåvägsordning; ALDRIG GitHub-token
i Vercel-env; deploy-hook-kedjan avslås.
(c) Motorbatch pensioneras, termbank i underhållsläge; "översätt vid
publicering" = dokumenterad plock-rutin + skuld-logg — noll egen våg.
(d) H2 = pm2 (next start) + nginx (noindex-header + robots + basic-auth);
DNS-beslutet styr bara HTTPS-timing — men H1 VÄNTAR fortfarande på kundens
ssh-copy-id.

— Agent V83-FORSK, AI-styrelsen AK1A (våg 83, 2026-09-07)
