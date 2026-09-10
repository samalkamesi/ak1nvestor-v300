# STYRELSE — ADMIN-MEGA (våg 78, kunddirektiv 2026-09-07)

**Kunddirektiv:** "mega system för admin precis som WordPress för att hantera allt
på långt håll." Detta dokument = kartläggning av befintligt admin + designderlag för
styrelsens byggbeslut. BYGG EJ. Respekterar: B2B-BESLUT, MARKNADS-BESLUT P1–P7 +
våg 2/4, AKM3-BESLUT, STYRELSE-B2B-VARIABLER (våg 77), arbetslinjen
(Supabase-persistens på prod, filer = dev-fallback), deploy-flödet (main-push auto).

---

## 1. NULÄGESKARTA — vad admin kan I DAG (src/app/admin/page.tsx, 15 flikar)

| Flik | Kan göra | Skrivväg |
|---|---|---|
| Översikt | KPI-kort (aktiviteter, sessioner, portföljer, AI-organ, kritiska events), senaste aktivitet/events, toppsektioner | läs |
| Medlemmar | Lista medlemmar, ändra nivå free/premium/pro | PATCH /api/admin/members → Supabase members |
| Kundekosystem / Ekosystem / Beteende | Aggregerade vyer (läs) | läs |
| Aktivitetslogg / Klientportföljer / Systemevents | Filtrerbara loggar och portföljvy | läs |
| **Analys-uppladdning** | Medlemskö → portföljgranskning med Elliott-våg-redigerare → uppladdning + PUBLICERA pedagogisk analys; separat Bokningar-tab (bekräfta, möteslänk) | POST upload-analysis; GET/PUT/PATCH bookings → Supabase |
| Statistik & SEO / Trafik & Säkerhet / Konvertering | Trafik, dna-blockering, tratt i 6 steg (MARKNADS våg 1b; P6: noll nya spår) | läs |
| AI-organ styrelse | Autonoma organet (bygger vidare självt) | organ-styrd |
| Utvecklingsradarn | P1–P9, AKM2/3, kvalitetsvakten, språk, kurshälsa, fasplan | läs |
| **Översättning** | Granskningskön: redigera + PUBLICERA med 4 kontroller omkörda (termer, siffror, struktur, lateral). **Termbank: LÄGG/UPPDATERA/TA BORT term** | POST /api/admin/oversattning → Supabase (MÖS-lagret); termer → data/termbank-tillagg.json |

**Guldkällor och deras mekanik (våg 77:s beslut B2):**
- `data/portfolj-system/priser.json` — ALLA priser (249/449/799 + år + fas-rabatt
  0,2 + B2B 499/1 499/4 999 + onboarding 9 900). Läses av `src/lib/variabler.ts`
  via **statisk import → inlines i bunten vid build** ⇒ ändring kräver deploy.
- `data/siffror.json` — 8 tal (333 kurser, 8 211 quiz …), genereras av
  `verktyg/rakna-siffror.mjs` (skript + commit + deploy per kurstillägg).
- **Termbank-tillägget (viktigt nulägesfynd):** admin KAN lägga termer, men
  persistensen (`src/lib/oversattning-admin.ts`) skriver fil — på Vercel är fs
  read-only ⇒ ok=false med ärligt fel. **Term-tillägg fungerar alltså EJ i prod
  idag.** Mönstret att lära av, inte kopiera rakt av.
- **MÖS-lagret** (`src/lib/oversattning/lager.ts`): Arkitekturen attärva —
  autodetekterad backend (tabell `oversattningar` → annars `system_events`-event-
  rader, ingen kund-SQL krävs), senaste-vinner-dedupe, dev-fallback-kö.
- **m10-referral** (`src/lib/referral.ts`): bevisar lagringsvägen UTAN DDL —
  system_events-rader (type=referral_kod), senaste-vinner per nyckel, inga nya
  datakategorier. **Detta är mallen för variabelpanelen.**

**Autentisering:** ADMIN_PASSWORD (env; dev-fallback "AK1A-2026" i
src/lib/admin-auth.ts:56 — se risk §4.2), x-admin-password per anrop, timing-säkert,
rate-limit 10/min, lösenordet i sessionStorage (rensas per flik). Ingen session.
B2B-BESLUT K9: ADMIN_PASSWORD = accepterad INTERIMSFORM.

**Innehåll idag:** kurser/blogg = statiska filer (public/deep-courses.json 333,
data/blogg/*.json 55) läses server-side vid build/render (src/lib/content.ts).
Deploy = main-push → Vercel auto (vercel.json: next build + 12 crons).
Kvalitetsvakten körs av agenter + cron 07:00 — **inte** i build-pipeline.

## 2. MÅLBILD — "WordPress på långt håll"

### 2.1 Innehålls-CMS (kurser/blogg/guider redigerbara utan deploy)
Bloggposter i Supabase (samma JSON-form som data/blogg — m9 §1: "IDENTISKT, ingen
ny form"), redigeras i panelen (MDX-editor-beroendet finns redan), statiska filerna
blir seed + dev-fallback (MÖS-mönstret). Kurser: steg 1 = metadata/beskrivningar;
full redigering senare (tung data, expand-courses-cron äger strukturen).

### 2.2 Variabelpanel (ändra pris/tal i UI → skriver guldkällorna)
**Problemets kärna:** Vercel-fs är READ-ONLY — panelen KAN INTE skriva
priser.json/siffror.json i prod. Tre vägar, noga resonemang:

- **(A) Commit-back till git:** panel → Supabase-kö → bot committar priser.json
  via GitHub API → main-push → auto-deploy. Bevarar dagens propageringsmodell
  (våg 77: fil → build → hela sajten) OCH force-static-DNA. NACKDELAR: ny hemlig
  nyckel (GitHub-token i env = ny attackyta), deploy-latens, race mot agenters
  samtidiga filändringar, och två sanningskällor under fönstret (Supabase-kö vs
  git). Kvalitetsvakten (hårdkodade pris-tal i src-copy) skyddar fortfarande —
  men valideringen måste finnas I API-rutten eftersom build inte kör vakten.
- **(B) Flytta guldkällorna till Supabase, fil = dev-fallback** — samma mönster
  som översättningslagret (strukturerat, bevisat i prod): lasVariabler() läser
  system_events-rader (type=variabel, senaste-vinner — m10-mönstret, INGEN ny
  tabell/DDL) och mergar över fil-defaults; skrivning = POST av event-rader med
  hård validering. FÖRDELAR: ingen token, effekt inom revalidate-fönstret, rollback
  = radera override-rader (filen gäller igen), komplett spårhistorik gratis.
  NACKDELAR: propageringsmodellen ändras — priser läses request-time (ISR/
  revalidate, t.ex. 300s) i stället för build-time-inlining; alla klient-ytor som
  idag interpolerar PRISER ur bunten måste få värden via props/server-komponent
  (svep ~10–15 ytor); transaktionspris MÅSTE läsas ur samma lager vid köp.
- **(C) Hybrid:** B för läsning+skrivning direkt, PLUS valfri commit-back som
  speglar Supabase-läget till priser.json vid varje ändring (git = spegel, inte
  sanning) — håller repo/dev-miljöer friska. Steg 5-material, ej en förutsättning.

**Rekommendation: B (med C som frivillig spegling i steg 5).** Den följer
arbetslinjen rakt av (Supabase på prod, filer = dev-fallback), kräver ingen ny
hemlighet, och har redan två bevisade föregångare i kodbasen (MÖS + referral).
Filhuvudet i variabler.ts uppdateras: filen = SEED, Supabase = sanning live.

### 2.3 Mediebibliotek (OG-bilder/bilder)
Supabase Storage bucket (publik läsning) + panel: ladda upp, lista, kopiera URL.
seo.tsx pageMetadata kopplas till biblioteks-URL:er. Runtime-OG-generering förblir
AVSLAGEN (MARKNADS våg 1a AC4 — force-static): nya bloggposter får default-OG
tills nästa deploys og-körning. Ingen CDN-kod, inga nya spår (P6).

### 2.4 Publiceringsflöde (draft → granska → publicera)
Statusmaskin per post: utkast → granskad → publicerad. Grind vid "publicera":
**kontrolleraText körs server-side** (FEL = blockerat, VARNING = visas för
människan) — MARKNADS våg 4: "AI-genererade texter MÅSTE passera kontrolleraText +
mänskligt godkännande." Mänsklig granskning = admin-klicket självt (människan
bakom ADMIN_PASSWORD). m9-innehållsfabriken kopplas in som producent av utkast.

### 2.5 Roller (admin/redaktör)
Två nivåer i samma ADMIN_PASSWORD-interim: ADMIN_PASSWORD = admin (allt);
REDAKTOR_PASSWORD (ny env) = redaktör (innehåll + termbank, EJ variabler/
medlemmar/bokningar). Riktiga seats = B2B fas 2 (K9) — samordnas, dubbeldrivs ej.

## 3. STEGPLAN — 5 steg, varje ≤ 1 våg

**Steg 1 — VARIABELPANEL (REKOMMENDERAD som första våg).**
*Varje minst:* ~1 lib-modul + 1 API-rutt + 1 panel; alla mönster färdiga i kodbasen.
Leveranser: `src/lib/variabler-live.ts` (lasVariabler(): fil-defaults + Supabase-
override senaste-vinner, cacha per request), `/api/admin/variabler` (GET/POST,
requireAdmin, validering: fasta id:n, prisManad 0–100 000 heltal, prisAr ≈ 10×,
fas-rabatt 0–0,5; ogiltigt = 400), admin-panel med diff-preview + spårhistorik,
svep av prismätande ytor till lasVariabler() med revalidate. Kundvärde: pris/tal-
ändring utan deploy — våg 77:s Excel-löfte fullbordat "på långt håll".
**Krita:** panelen kan ALDRIG skapa/ta bort nivåer eller röra gratis-Fas-1
(P3: gratis ligger UTANFÖR priser.json och förblir hårdkodad helighet); köp/pris
vid transaktion ur samma lager; logga varje skrivning som system_event (ipHash).
**OBS:** fixa termbank-tilläggets prod-skrivning (§1-fyndet) i samma våg — samma
Supabase-senaste-vinner-lösning, termbank-tillagg.json blir dev-fallback.

**Steg 2 — PUBLICERINGSFLÖDE FÖR BLOGG/GUIDER.**
Leveranser: blogginlägg i Supabase (system_events-payload ELLER tabell via
data/sql med autodetekterad fallback — MÖS-lärdomen: aldrig KRÄV kund-SQL),
draft→granska→publicera-status, kontrolleraText-grind server-side, editor-UI,
publik läsning med ISR. Statiska data/blogg/*.json = seed + dev-fallback.
**Krita:** kontrolleraText är hård grind (våg 4); OG = default-bild tills deploy;
P1 (öppen delning — inga väggar) och P2 (2007:528) gäller varje post.

**Steg 3 — MEDIEBIBLIOTEK.**
Leveranser: Storage-bucket + panel (upload/lista/URL-kopia), seo.tsx-koppling,
next/image remote-pattern. **Krita:** ingen runtime-OG (AC4), inga nya spår (P6).

**Steg 4 — KURS-CMS + SIFFROR LIVE.**
Leveranser: kursmetadata redigerbar; SIFFROR räknas ur lagret live (rakna-siffror-
motsvarighet som las-funktion), siffror.json blir genererad cache/seed.
**Krita:** kurs-XP/access-logik (kurs-access.ts) röras inte i grunden; Fas 2/3-
kurser förblir bakom ansökningsflödet.

**Steg 5 — ROLLER + HÄRDNING + SPEGLING.**
Leveranser: REDAKTOR_PASSWORD-roll, httpOnly-signerad sessions-cookie framför
ADMIN_PASSWORD (som behålls som bootstrap/rollback), ev. commit-back-spegling av
Supabase → priser.json (alt C), revisionsvy (event-rader redan bär historiken).
**Krita:** B2B K9 — seats samordnas med /pro fas 2, dubbeldrivs ej.

**Gemensam krita (alla steg):** inget steg bryter gratis-Fas-1-löftet (P3),
kvalitetsvakten (admin-skrivningar går INTE via src ⇒ vakten berörs ej; panelens
egna valideringar + kontrolleraText ersätter grinden för runtime-värden), eller
deploy-flödet (main-push auto består orubbat — Supabase-skrivningar ändrar aldrig
git och kodändringar går fortfarande via agent → main → Vercel).

## 4. RISKER

**4.1 Två sanningskällor (Supabase vs git-guldkällor).** Med alternativ B är
Supabase sanning live och filen seed — men om en agent ändrar priser.json i repo
medan kunden ändrat i panelen tystas repo-ändringen av senaste-vinner-regeln.
Mitigering: (i) dokumenterat kontrakt i variabler.ts-filhuvudet; (ii) agenter
läser lasVariabler() innan copy-skrivningar om pris; (iii) varje merge visar
källa+tid i panelen; (iv) steg 5:s spegling gör gitSpeglad igen. Commit-back som
PRIMÄR väg (alt A) avråds: token-risk + race + byggd kringgång av agent-processen.

**4.2 Säkerhet — ADMIN_PASSWORD idag.** Dev-fallback "AK1A-2026" (admin-auth.ts:56
+ termbank-rutterns egen kopia): om Vercel-env saknas är prod-låset ett publicerat
lösenord — och steg 1 höjer insatserna (panelen kan ändra PRISER). Krav för steg 1:
(a) i NODE_ENV=production utan ADMIN_PASSWORD ⇒ skriv-rutter svarar 500-refused
(ingen fallback alls), (b) alla skrivningar loggas med ipHash/tid, (c) rate-limit.
**Sessions-rollback?** JA behåll ADMIN_PASSWORD som bootstrap + katastrof-rollback;
session-cookien (steg 5) läggs FRAMFÖR, ersätter aldrig förrän bevisad. sessionStorage
per anrop är acceptabel interimsform (B2B K9) men XSS-exponerad — steg 5-material.

**4.3 Migreringsplan för guldkällorna.** Seed-skript: läs priser.json → skriv
en override-rad per nyckel (idempotent; tom databas = filen gäller). Rollback:
DELETE på type=variabel-rader → fil-defaults åter. ISR-fönstret dokumenteras
(ändring syns ≤ revalidate). Transaktionslogg: köp-event bär pris + källa-rad-id.

**4.4 Övrigt.** (a) Force-static-DNA: ISR är en medveten, avgränsad kompromiss —
endast variabel-/innehållsbärande sidor, aldrig nya runtime-endpoints för metadata.
(b) Betalningslogik: prenumeration.ts räknar ur registret idag — samma lager vid
köp, annars copy/pris-discordans. (c) Blogg-payload i system_events: retention-
organets 30-dagarsregel för övriga typer måste exkludera innehållstypen (som MÖS)
eller tabellvägen väljs — beslut i steg 2:s våg. (d) B2B-K8: admin-filer är
undantagna från "kunder"-vakten — panelcopy får säga kunder där det är tekniskt.

## 5. Rekommendation (ordförandesynes, för styrelsens beslut)

Bygg steg 1 (variabelpanel, alternativ B) som våg 78:s enda steg + termbank-
prod-fixen i samma våg. Det är minst (mönstren finns: lager.ts + referral.ts),
värdeskapandet störst (kundens Excel-dröm "på långt håll" — utan deploy), och det
etablerar Supabase-som-sanning-kontraktet som steg 2–5 bygger vidare på. Därefter
steg 2 (publiceringsflöde) som våg 79 — WordPress-känslan (skriv → granska →
publicera, med kontrolleraText-grind) blir påtaglig för kunden. BYGG INGET ännu.

— ADMIN-MEGA forskaragent, våg 78. Underlag: kodläsning 2026-09-07 (src/app/admin,
src/lib/{variabler,siffror,oversattning,oversattning-admin,referral,admin-auth,
varumarke,content}.ts, data/portfolj-system/priser.json, data/siffror.json,
vercel.json, STYRELSE-B2B-VARIABLER, B2B/MARKNADS/AKM3-BESLUT).

---

## ORDFÖRANDEBESLUT (våg 78, 2026-09-07)

**GODKÄNT enligt rekommendationen:** Admin-mega steg 1 (variabelpanel,
alternativ B: Supabase som sanning + fil som dev-fallback) + termbank-
prod-fixen — byggs som VÅG 79 efter att våg 78:s finslipningsfixar landat.
Villkor från ordföranden utöver dokumentets kritor:
1. Skriv-rutter: requireAdmin UTAN dev-fallback i prod (ADMIN_PASSWORD
   förblir bootstrap; logga varje ändring som system_events type=variabel-
   andring med gamla/nya värdet — revisbarhet).
2. Panelen låser gratis-nivån: Fas 1-priser (gratis) kan ALDRIG skapas/
   ändras/raderas från panelen — hardkodat skydd i rutten.
3. Våg 78:s kod-mitigering av spegelfönstret (paginering) kombineras med
   kundens SQL: när tabellen landar växer lasSpara/lasStatusKarta automatiskt.
4. Fas-priserna 9 999/13 999 (fixat i våg 78) blir panelens första data —
   seed-skriptet migrerar priser.json till Supabase vid steg 1-deploy.
Steg 2 (blogg-publiceringsflöde) = våg 80. Steg 3-5 efter varje godkänd
leverans.

---

## BYGGKONTRAKT STEG 1 (våg 79, ordföranden 2026-09-07)

**Datakälla (INGEN DDL — kunden har ej kört SQL):** system_events
type="variabel", details={nyckel, varde, gammalt, av, kalla} — SENASTE-
VINNER per nyckel (m10/oversattning-mönstret, order created_at.desc,id.desc).

**NYCKLAR (kanoniska, panelen redigerar ENDAST dessa):**
pris.forskning.manad / .ar · pris.forskning-plus.manad / .ar ·
pris.portfolj-hyra.manad / .ar · pris.pro-analytiker.manad ·
pris.pro-studio.manad · pris.pro-institution.manad ·
pris.b2b-onboarding.engang · pris.fas2.engang · pris.fas3.engang ·
pris.fas3-intro.manad
(LÅS: panelen kan ENDAST ändra värden på dessa nycklar — aldrig skapa
nya nivåer, aldrig sätta värde < 0, aldrig nollställa gratis-konceptet.)

**API-KONTRAKT:**
- GET /api/variabler — PUBlik, cache 60 s (Cache-Control), svar
  {priser: {...sammanslagna värden}} — sammanslagning: filvärde +
  Supabase-override senaste-vinner.
- GET /api/admin/variabler — requireAdmin UTAN dev-fallback i prod:
  {poster: [{nyckel, varde, filvarde, kalla, andrad}], logg: [senaste 20
  type=variabel-andring-rader]}.
- POST /api/admin/variabler — requireAdmin-skriv (samma hårda krav),
  body {nyckel, varde} → validerar nyckel mot vitlistan + värde ≥ 0 heltal
  → skriver system_events type="variabel" (gammalt = förra gällande) +
  type="variabel-andring" (revisbarhet: nyckel/gammalt/nytt/av).

**LÄSVÄG (server):** src/lib/variabler-lagring.ts — lasGallande():
async, modul-cache 5 min, läser overrides (tak: alla rader av typen,
paginerat Range 1000/sida) + slår ihop med filens PRISER-defaults.
Exporterar lasPriserGallande(): Promise<PRISER-typ>.

**KONSUMERARE ( ISR):** server-sidor som visar pris (/prenumeration,
/medlemskap, pro/priser, villkor, startsidans props till home-section)
byter statisk PRISER → await lasPriserGallande() + export const
revalidate = 300. Klient-flöden (fas2-ansok, chatbot-route) läser
GET /api/variabler (server-side i route) eller props. OBS: variabler.ts
(export PRISER) får INTE brytas — kvar som fil-default + byggvärde.

**TERMBANK-PROD-FIX:** POST /api/admin/termbank skriver system_events
type="termbank_tillagg" (details={sv,en,ar,kat}) — filen skrivs endast i
dev (ok=false på Vercel är accepterat svar med Supabase-raden som sanning);
verktyg/synka-termbank.mjs drar Supabase→fil före lokala pipelineruns;
termbank.ts overlay läses vid pipeline-start (lokal tsx — läser både fil
och vid .env Supabase). Admin-fliken visar Supabase-läget.

**SÄKERHET:** admin-auth.ts — requireAdmin: i NODE_ENV=production utan
ADMIN_PASSWORD satt → 500 med tydligt fel (dev-fallback "AK1A-2026" får
ENBAST gälla i development). Alla admin-rutter med skrivning använder
denna.

**GULDKANT:** panel-UI i befintlig admin-skal (ingen ny sida): flik
"Variabler 📊" — grupperade nycklar, nuvärde, filvärde grått, inline-edit,
spara→POST, toast, logg-lista. Materialstil = befintliga paneler.

## BYGGKONTRAKT VÅG 80b (ordföranden 2026-09-07)

### Del A — KURSTITLAR PÅ SPEGLAR (P1 från 80a)
- NY KÄLLA i kalla.ts: kursblock-domänens {slug}:titel = kursens title-fält
  ur deep-courses.json (333 källor; OBS kollisionssäkert — kursblock har
  bara :kapN:-suffix hittills, kursens egen titel saknas). FÖRBIKOPPLA
  inte gällande registerstruktur — bara TILLÄGG.
- ÖVERSÄTTNING: 333 titlar × en+ar via agent(er) — importpaket
  data/oversattning-import/v80titel{1,2}.json (poster {nyckel,en,ar}),
  kontroll som vanligt (titlar = 1 rad, term/sifferr-reglerna gäller).
- KONSUMENTER: kurs-spegel-sida.tsx + /en|ar/kurser-listsidorna + KursSok-
  speglar läser titel ur lasPubliceradeForSpegel (fallback svensk title).
- VERIFIERA KursSteg-upplåst läge: följer nu spegelns språk via
  effektivSprak (80a-fixen) — bekräfta, åtgärda ej om redan rätt.

### Del B — ADMIN-MEGA STEG 2: BLOGG-PUBLICERINGSFLOW (WordPress-kärnan)
- DATA: system_events type="blogg_utkast" details={slug, titel, ingress,
  bodyMarkdown, status: "utkast"|"granskad"|"publicerad", av, version}
  — SENASTE-VINNER per slug (variabel-mönstret, ingen DDL).
- PUBLICERINGSVÄG: PUBLICERAD blogg = rad i system_events type=
  "blogg_publicerad" OCH data/blogg/<slug>.json skrivs i dev (prod:
  filen skapas vid nästa main-push av agent — STEG 2:LÄGE A = utkast-
  flödet levererar PAKET: knappen "Exportera klar post" ger JSON som
  main/agent droppar i data/blogg/ + commit. Produktbeslut Läge B
  (hot-path: /blogg läser Supabase-live) väntar — prestandarisken på
  51+ inlägg kräver benchmark först.)
- GRIND: kontrolleraText på titel+ingress+body vid varje statusbyte till
  granskad/publicerad — 0 FEL krav (våg 66-mönstret); varumärkesreglerna
  gäller (negerad disclaimer tillsätts automatiskt om den saknas).
- PANEL: admin-flik "Blogg ✍️" — lista utkast/granskade/publicerade,
  editor (titel/ingress/markdown-body), kontrolleraText-knapp med
  rapport, statussteg knappar, exportera-knapp. requireAdmin-skriv.
- SEO: exporterad post får pageMetadata + OG automatiskt vid drop
  (befintlig blogg-[slug]-rendering).

Båda delar: max parallella agenter, src via Write/Edit, grön svit+vakten
+ build krav, commit separat per del.

## TILLÄGG VÅG 80c — UTVECKLINGSPANEL ("följa allt tillsammans", kunddirektiv)

Kunden vill följa utvecklingen från telefonen utan dator. BESLUT: admin-
flik "Utveckling 📡" — visar (1) worklog.md senaste sektionerna (läses
server-side, renderas läsbart), (2) senaste systemhändelser (typ, tid,
meddelande-truncat — inga hemligheter), (3) statuskort: lagerrader,
korpus täckning (via /api/forskningslage-mönstret läs ur MÖS-kartan om
billigt, annars räkna publicerade), senaste deploy-commit (git-log
runtime är inte möjligt på Vercel — visa Senaste aktivitet ur events
i stället). requireAdmin-läsning. Mobilanpassad (telefon först!).

## TILLÄGG VÅG 81 — WEBCHAT-STUDIO (kunddirektiv "exceptionell design, uppmana allt — bilder till mappar, exakt som Z, max kapacitet")

Kundens /chat (ttyd) är funktionell men ren terminal. BESLUT:
1. SNABBVINST (klarat direkt): lrzsz installerat — ZMODEM-uppladdning i ttyd
   (fil/zip via terminalmenyn Ctrl+Alt+Shift+U; mappar som zip).
2. /studio = EGEN WEBCHAT på AK1-stacken: Next-sida som via en server-
   brygga startar/pratar med `zcode app-server` (ZCode-protokollet över
   stdio — samma runtime som TUI:n). V1-funktioner: meddelandechatt m
   markdown, bildpaste/-drag (→ ~/agent/ak1/uploads + sökväg i prompten),
   filuppladdning, mappuppladdning (webkitdirectory → zip → workspace),
   sessionsliståterkomst (tmux-lös — bryggan håller sessionen vid liv),
   uppgifts-/verktygsstatus. Admin-autentisering. Design: AK1A-DNA
   (paper/guld/marin) — EXCEPTIONELL enligt kundens ord.
3. Säkerhet: uploads ska 30 MB-filtak + filtypsvitlista + rensas > 7 dgr;
   bryggan binder 127.0.0.1 endast; INGA hemligheter i klientsidan.

## TILLÄGG VÅG 82 — STUDIO V2: "Z-PORTALEN I MOLNET" (kunddirektiv)

Kundens önskan: terminalen/webchatten skall bli "super avancerad som Z" —
modellval (glm-5.3/5.2/5.1/turbo), kontextoptimering (max 1M), bilder/
filer/mappar (FINNS i v1), 24/7 molndrift utan datorn (FINNS — Contabo).

BESLUT: UPPGRADERA /studio (ej ttyd — den är reserv):
1. MODELLVÄLJARE: UI-dropdown i /studio som växlar huvudmodell — via
   session/create-parametrar eller en "session/setModel"-metod i
   protokollet (FORSKA i vendor/zcode.cjs på servern: sök "model" i
   session/create-params-zod + runtimePreferences + /model-kommandot i
   TUI-koden för exakt fältnamn). Kräver sannolikt ny session per modell
   — transporten stödjer det (kassera + skapa).
2. KONTEXTKONTROLL: visa tokenCount per turn (FINNS i klart-eventet) +
   ackumulerat i headern; "/compact"-knapp om protokollet stödjer det
   (sök "compact" i app-server-metoderna; annars "ny session"-knapp som
   bevarar historiklistan i UI:t men börjar frisk kontext = 1M-kontoret).
3. MODELLKORT: visa vald modell + context-ledigt i LIVE-raden.
4. Sessionshantering: "Ny session"-knapp + lista tidigare (session/list
   är bevisad metod).
5. Deployas på Contabo (redan molnet — inget mer "ladda upp": det KÖR
   redan 24/7 där; förklara detta för kunden).

KVD: max parallella agenter, src via Write/Edit, protokollforskning
FIRST (som våg 81 — dokumentera fynden), E2E-krav på prod.

## TILLÄGG VÅG 83 — MEGA: STUDIO = EXAKT Z CODE (kunddirektiv: "ta alla koder i z code, jobba i dagar parallellt")

MÅLBILD: /studio skall replikera Z Codes portal-FUNKTIONALITET (egen
front-end på ZCodes runtime — vi kopierar INTE Z-kod, vi BYGGER mot
samma protokoll). Delmoment (var och en = en agent):
A. PROTOKOLLKARTA: extrahera ALLA app-server-metoder ur vendor/zcode.cjs
   (session/*, permission/*, task/*, diff/*, memory, skills, plugins).
B. BYGG-blocken (efter kartan): sessionshantering (flera flikar, resume,
   arkiv) · diff-vy (filändringar per turn) · task-panel (agents/tasks) ·
   permission-approvals (godkänn verktygskall från webben) · mode/model/
   reasoning-level-väljare · minnespanel · verktygskalls-visualisering i
   strömmen · filträd för workspacet · tangentkommandon · bildrendering
   i meddelanden.
C. KVD: max parallella agenter, protokollforskning FIRST, E2E på prod
   per block, src via Write/Edit, deploy via tar-pipe (exkl .env*).

## TILLÄGG VÅG 84 — STUDIO 100x: FULL Z-PARITET (kunddirektiv: "100x förbättring, max parallellt, ni har full access")

Kunden vill ha STUDIO = exakt Z Code-upplevelsen, 100x bättre. Styrelsen
beslutar FEM PARALLELLA BYGGBLOCK (varje block = egen agent, fria filer,
E2E på prod krav):

- A. **VISUELLA Z-PARITET**: mörkt/ljust-tema-växlare i studion (AK1A-guld
  på båda), tangentbordsgenvägar (Enter=skicka, Shift+Enter=nyrad, Ctrl+K
  = kommandopalett i studion), auto-scroll med "hoppa ner"-knapp,
  meddelandesökning, exportchatt (markdown-fil), tokens/cost-räknare.
- B. **MULTI-SESSION-TABBAR**: flera samtidiga agent-sessioner som
  webbläsartabbar i studion (varje tab = egen session med egen modell),
  badge med ongående arbete per tab, bakgrundsfortsättning (agenten
  arbetar vidare i inaktiva tabbar — SSE per tab).
- C. **VERKTYGSGODKÄNNANDE + RISKGRADER**: realtids-permissionsdialog
  utbyggd med diff-förhandsvisning INNAN godkännande (se exakt vad
  Write/Edit ändrar), minneslista "alltid tillåt"-regler per verktyg,
  ljud/visuell notis vid långa körningar.
- D. **ARBEDESMINNE + KUNSKAPSBAS**: agentens egna minnesfiler
  (~/.zcode/cli/memories) läsbara/redigerbara i studion — kunden ser
  VAD agenten kommer ihåg och kan rätta rader; + CLAUDE.md-konventionen
  (AGENTS.md) visad och redigerbar.
- E. **OBSERVERBARHET**: live-panel med CPU/RAM på Contabo (pm2-API),
  token/kostnad-räknare per session och dag, felloggen, uppstartsstatus
  för alla tjänster (pm2, crontab, nginx) — kunden ser serverns puls.

REGLER: ingen agent rörs akm2/vagfundament/korstabell; .env.production.
local HELIG; E2E per block på prod; max parallella agenter (5 st + ev.
uppföljning); finslipning efter alla block.

## TILLÄGG VÅG 85 — STUDIO V3: FULL Z-PARITET + AUTONOM UTVECKLING

Kundens vision: "varenda detalj som Z Code — live utveckling, autonomt,
max parallella agenter, automatisk vidareutveckling". Kvarvarande gap
ur protokollkartan (60+ metoder; vi exponerar ~35):

- F1 **MÅL-LÄGE (Goal Mode)**: session/goal STARTAR en autonom loop —
  agenten itererar själv mot målet (bevisat våg 83 B3). UI: stort
  "Starta mål-läge"-flöde — beskriv utvecklingsmål → agenten kör
  autonomt (turner matas automatiskt), kunden SER varje iteration live
  (verktygskort + diff + streaming), kan pausa/stoppa när som helst.
- F2 **SKILLS/PLUGINS-panel**: skills/referenceCatalog + plugins/list
  (17 metoder dokumenterade) — visa vad agenten KAN (skills) och vilka
  verktygsutbyggningar som är aktiva; toggla plugins på/av (updateProviderRegistry).
- F3 **USAGE/COST-panel**: usage/stats (8,35M tkn/7d bevisat) — daglig/
  veckovis tokenförbrukning, modellfördelning, kostnadsuppskattning.
- F4 **V4-DIFF (filändringar i realtid)**: v4/conversation/fileChanges —
  rikare än Write/Edit-parsningen (nya filer, namnbyten, batch).
- F5 **INLINE KODVY**: syntaxmarkerad kodvisning + redigering i chattens
  diff-kort (klicka en fil i "Ändringar" → kodvy med ±rader i kontext).

KVD: 5 agenter parallellt, protokollmetoder ur kartan (v83-protokollkarta.md
är LAGEN), E2E på prod, src via Write/Edit, deploy via tar-pipe.

## TILLÄGG VÅG 86 — STUDIO COMPLETE (kunds direktiv: "fortsätt i timmar, Mega sätt, sluta aldrig")

Sista Z-paritetsgaper — 7 parallella byggspår:

- G1 **SLASH-AUTOCOMPLETE**: skriv "/" i skrivfältet → dropdown med
  alla kommandon (från kommandon.ts) + beskrivningar + piltangenter —
  som Z Code men INLINE.
- G2 **PROMPTBIBLIOTEK**: spara återkommande prompts (localStorage),
  kommando /sparad, autocomplete-införlivad; + prompthistorik (pil-upp
  återkallar föregående prompt — som terminal).
- G3 **RICHTIG INPUT-EDITOR**: markdown-förhandsvisning av skrivfältet
  (toggle 👁), autoväxande höjd (min 1 rad, max 8), teckenräknare,
  placeholder med tips.
- G4 **WEB-VERKTYG VISUALISERING**: när agenten kör WebFetch/WebSearch —
  visa hämtad URL + sammanfattning INLINE i verktygskortet (inte bara
  "WebFetch kördes" utan faktisk länk + resultattruncat).
- G5 **CHECKPOINT/REWIND**: Z Code har rewind — implementera via
  session/fork med checkpoint (dokumenterat i kartan); UI: "⟲ Gå till-
  baka-hit"-knapp på varje agentbubbla → forkar sessionen vid den punkten.
- G6 **NOTISHISTORIK + SNABBMENY**: persistent lista av alla notiser
  (localStorage); "?"-tangent visar tangentbordsgenvägs-kort.
- G7 **SESSION-EXPORT PDF/HTML**: exportera chatten som snygg HTML
  (AK1A-stil, printbar) utöver markdown.
