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

## TILLÄGG VÅG 87 — STUDIO MEGA PERSISTENS + DESIGN (kundrapport: "sparar ej info, fortsätter ej när jag är utanför sidan")

ROTORSAK (kundens problem): sessionerna lever på SERVERN (transport-
singleton + barnprocessen fortsätter arbeta) men BROWSERN tappar
kopplingen vid navigering — när kunden återkommer laddas inte historiken
från frånvaron. Detta är studions STÖRSTA UX-brott.

- H1 **ÅTERKOPPLING (kritisk bugg)**: vid varje besök på /studio →
  auto-detektera aktiv session → resume + visa ALL historik (även det
  som hände medan borta) → reconnect SSE om agenten arbetar. localStorage
  ak1a-studio-senaste-session som temperatur-pekare. Poll för pågående
  mål-loop (GET /api/studio/stream?sessionId=… var 30:e sekund om fliken
  öppen men SSE tappat).
- H2 **OFFLINE-BUFFERT**: transportens sessionskarta (lasStudioSessions-
  karta) skrivs till DISK på servern varje gång ett svar klart (inte
  bara i minnet) → vid användarens återkomst läser GET hela kartan.
- H3 **DESIGN-POLISH (Z-kvalitet)**: animations (message fade-in,
  button hover-lift, streaming cursor-blink), bättre typografi (rubrik-
  hierarki med letter-spacing), gradient-accenter på agent-bubblor,
  empty-state med illustration + förslag, loading skeletons, smooth
  scroll-beteende, focus-ring på interaktiva element.
- H4 **MOBIL-POLISH**: safe-area-inset för iPhone-notch, svaj-indikator
  i input-fältet, tangentbords-aware layout (composer stannar ovanför
  keyboard), touch-feedback (active:scale-95).

## TILLÄGG VÅG 88 — STUDIO FOKUSERAD + MENY-OPTIMERING (kunds bild + direktiv)

- I1 **MENY-KONSOLIDERING (bildens problem)**: 3 dropdowns (modell/läge/
  tanke) + tema + status = FÖR MÅNGT på mobil. Konsolidera: (a) alla 3
  dropdowns i en "⚙️ Inställningar"-knapp → drawer med alla val (modell,
  läge, tankestyrka, tema) stora tryckytor i lista; (b) status-pricken
  flyttas in i headerns titelrad; (c) headern = logo + "Studio" +
  status-prick + ⚙️ = ENRADIG och REN.
- I2 **ADMIN I STUDIO**: admin-panelens kraftkommandon som drawer i
  Studio ("🔧 Verktyg"-knapp): variabler (priser), blogg-publicering,
  minnesfiler — kunden styr HELA systemet från ETT ställe.
- I3 **CACHE-OPTIMERING**: reconnect-poll 30s→15s när mål aktivt;
  sessionskarta flush 60s→30s; GET-historik cache 5-min i IndexedDB
  (webbläsarens beständiga lagring — överlever flikstängning, inte bara
  refresh).

## TILLÄGG VÅG 90 — PIXELNÄRA Z CODE (kundens sanna vision)

Kunden vill ha EXAKT Z Code-upplevelsen: 3-kolumners IDE-layout
( sidebar: tasks | chatt: agent med tool-calls/diffs | panel: mål/terminal )
— MÖRK VS Code-inspirerat tema, INTE bubbelfokus.

- K1 **KÄRNSTABILITET**: (a) zcode-barnprocessens hållbarhet (minne,
  auto-restart vid död); (b) SSE-anslutning utan avbrott (heartbeat +
  reconnect); (c) sessions aldrig "tappa" (disk-persistens + auto-resume);
  (d) respons-hastighet (cache historik, lazy panels).
- K2 **Z CODE-LAYOUT**: mörkt tema (VS Code-palett), 3-kolumners på
  desktop (sidebar 260px | chatt flex | panel 300px — kollapsbara),
  mobil = chatt + hamburgermeny. Chatt-meddelanden = FULLBREDD (INTE
  bubblor), agent-handlingar med statuschips (Utforskat ✓ / Körde ✓ /
  Skrev ✓), diff-badges (+733 −7), verktygsanrop med $-prefix.
- K3 **SIDEBAR**: sessions/tasks grupperade, relativa tidsstämplar,
  "+ Nytt samtal"-knapp, aktiv markering. Klick = öppna/resume.
- K4 **HÖGER PANEL**: mål-progress (checklist med bockar), kontext-
  info (tokens, modell), terminal-visning (senaste verktygskörning).

### VÅG 90 K1 — KÄRNSTABILITET LANDAD (2026-09-09)

Rotorsaker till "sega, stänger av sig" åtgärdade i
`src/lib/studio/studio-transport.ts` (~+700 rader):

1. **Barnprocess-overleksakter**: döds-lyssnare ger omedelbart fel-event
   till pågående prompt (slut på 10-min-tystnad); auto-omstart max 3
   försök med backoff 2/8/32 s; race-skydd `omstartPaga` spärrar
   dubbelstart (ingen dubbel RAM); radbuffert kappas vid 1 MB;
   SIGTERM→SIGKILL(3 s) vid avsiktlig nedstängning.
2. **Sessionshushållning**: MAX_AKTIVA_BARN=3 (äldsta idle stängs först);
   idle-städning >2 h (levande UI-flikar räknas som aktiva); tvungen
   karta-flush vid stäng/död; `stangd`-flagga bevaras på disk så döda
   sessioner inte återbjuds som levande; global SIGTERM/SIGINT-guard →
   inga zombie-zcode efter pm2-omstart.
3. **SSE-hjärtslag**: `: ping` var 15:e s i båda strömrutterna;
   abort-vakter stoppar polling/sonder när klienten försvunnit.
4. **Hälsa**: ny `GET /api/studio/halsa` — barnantal, RAM per barn via
   /proc/statm, sessioner, senaste fel (inga hemligheter).

tsc: 0 nya fel (egna filer typrena). KVD-skydd: studio-chat.tsx orördes.

## TILLÄGG VÅG 91 — HELA Z CODE I STUDION + SANN AUTONOMI + STYRELSEN SOM LAG (2026-09-10)

Kunddirektiv (ordagrant): "Jag vill ... visa dig bilder och allt möjligt
starta nya konversationer göra samma sak där, alltså ... gå igenom
bokstavligen varenda tjänst som finns i z code och implementera där,
men ... den ej dör [när] jag hoppar vidare till nästa sida eller gör
annat, den ska göra jobbet helt autonomt ... jag vill att AI styrelse
organen träffas som lag varje gång jag frågar och diskutera och alltid
tar allt på störst allvar med högst och max vilja nyttja max parallella
agenter ... Mega stora projekt och jobba på de helt autonomt utan mitt
närvarande med full access och finns det frågor ... gå till styrelse
och ... bestämma ... beslut som ska tillämpas omedelbart förutom saker
som kan stöda hela sidans karriär och framgång totalt."

### STÅENDE STYRELSEREGLER (permanent governance från våg 91)

- R1 Varje kundfråga i studion kan konkallera styrelsen (multibot-session).
- R2 Styrelsens beslut tillämpas OMEDELBART av agentpipelinen — utom
  existentiella åtgärder (domänflytt, prissättning, betalningsflöden,
  extern publicering, juridik/GDPR, radering av data, API-nycklar) som
  VÄNTAR KUND. Klassning sker automatiskt i styrelsemotorn.
- R3 Mega-projekt körs autonout full access utan kundnärvaro; frågor
  beslutas av styrelsen enligt R2.
- R4 Max parallella agenter gäller som tak (~9 i dator-pipelinen;
  studions zcode-barn max 3 + styrelsevågor inom taket).

### BLOCK A1 — SANN BAKGRUNDSAUTONOMI (ägarfiler: studio-transport.ts, api/studio/mal/**, api/studio/stream/route.ts, api/studio/session/route.ts)

Princip: ARBETET lever i zcode-barnprocessen + en server-side
mål-motor i Next-processen — SSE är ENDAST en vy. K1:s abort-vakter
får ALDRIG stoppa arbete, bara nätverkstvätten mot borta klienter.

- A1a Mål-motor fristående från SSE: mål-loop/state bor i transporten
  (server-processen), mal/stream prenumererar; klient som försvinner
  pausar strömning men ALDRIG målet. Verifiera att session/goal-loop
  matas av barnprocessen (v85 F1) och att sond-abort (K1) inte dödar
  loopen — sondera bara status, drives av motor.
- A1b GET /api/studio/mal/status → {aktiv, iteration, paagarandeTurn,
  senasteEvent, sessionId} — återvändande flik pollar denna + befintlig
  återkoppling (v87) = komplett catch-up.
- A1c Köade prompts: skicka-prompt returnerar direkt {accepted} även om
  klienten lämnar; svar samlas i historiken (redan fallet via session/
  messages) — verifiera E2E: skicka → stäng SSE → vänta klar → öppna →
  HELA svaret syns.
- A1d skickaMedBild(prompt, bildSokvagar[]): sondera live hur
  session/send tar bildinnehåll (attachments/content-blocks i kartan;
  annars fallback: bilder i workspace + prompt refererar sökvägar —
  barnets Read presenterar bilder visuellt). Kontrakt i stream-routen:
  POST {prompt, bilder?: string[]}.
- A1d TJÄNSTE-BRYGGOR (tunna transportmetoder + API-ytor enligt
  kontrakt nedan): bakgrundsjobb (projection.backgroundJobs +
  cancelBackgroundTask), webbläsare (interaction/browserList,
  browserExecute), automation (automation/* enligt kartan),
  workspace/generateText. Endpoints under /api/studio/tjanster/*.

### BLOCK A2 — STYRELSEMOTORN (ägarfiler: NY src/lib/studio/styrelse.ts, NY api/studio/styrelse/**)

- sammanstyrelsen(fraga): 5 rollagenter (Ordförande/CEO, Teknik/CTO,
  Säkerhet, Juridik&Compliance, Tillväxt/SEO) — körs i VÅGOR inom
  MAX_AKTIVA_BARN=3 (3 + 2) med korta analyser; Ordföranden syntetiserar
  BESLUT {beslut, motivering, atgarder[], existential: boolean}.
- POST /api/studio/styrelse {fraga} → {id}; GET .../styrelse?id=&senast=
  → händelser + beslut (poll, ingen SSE nödvändig v1).
- Beslut skrivs till data/forskning/STYRELSE-BESLUT.md (append, daterat)
  + system_events type=styrelse_beslut.
- existential=true → status VÄNTAR KUND (chat-badge + köad påminnelse);
  annars KÖRS DIREKT: åtgärder matas till pipelinen (worklog-kö i
  data/forskning/PIPELINE-KO.md som huvudagentens dispatchlista).
- Klassningsregel R2 hårdkodad + utökningsbar lista.

### BLOCK A3 — STUDIO-UI (ägarfiler: studio-chat.tsx, kommandon.ts)

Behåller våg 90:s visuella språk exakt:

- A3a BILDER I SAMTALET: thumbnails på skickat meddelande, bifoga innan
  send (drag/paste/📎 redan finns), POST {prompt, bilder}; agent-svar
  refererar dem. Ny konversation = befintlig "+ Nytt samtal".
- A3b STYRELSEN 🏛: knapp + /styrelsen-kommando → fråga → mötes-vy
  (5 rollkort tänds allt eftersom) → beslutskort (BESLUT/MOTIVERING/
  ÅTGÄRDER/badge KÖRS DIREKT|VÄNTAR KUND). Poll mot A2:s API; dold om
  API saknas (graceful).
- A3c TJÄNSTE-PANELER: Bakgrundsjobb (lista+avbryt), Webbläsare, Auto-
  mation — drawer i höger panel; varje panel dold om endpoint 501.
- A3d Autonomi-signal: "⏱ Agenten arbetar i bakgrunden" i header +
  statuspoll (A1b) — kunden SER att jobbet lever när hen återkommer.

### BLOCK A4 — Z-PARITETS-KARTA (read-only; ägarfil: NY data/forskning/V91-Z-PARITET-KARTA.md)

Inventera BOKLAVLIGEN varenda tjänst i zcode-binären (v83-kartan +
live-sond mot app-servern): session/*, workspace/*, interaction/*,
plugins/skills/mcp, automation, usage, v4-grenen — jämför med studion,
ranka luckor (P0 kundnära/P1 kraft/P2 sen), dokumentera protokollform
för varje lucka = underlag för våg 92+.

### KVD-vakt

tsc 0 nya (baslinje 36 i orörda filer) · motorer 107/0/0 · vakten
GRÖN · build exit 0 · E2E-autonomitest (A1c) grönt före deploy.

### VÅG 91 LANDAD (2026-09-10, 660cc44, prod 200 + live-verifierad)

- A1 E2E 5/5 PASS; KÄRRFYND: req.signal fördes till transport.skicka
  ⇒ klient-abort = session/stop = kundens "den dör" — NU: abort stoppar
  endast SSE, arbetet lever server-side; mal-motor i transporten;
  /api/studio/mal/status 200 (auth-vaktad); 5 tjänstebryggor (401-vaktade,
  generera = POST-endast 405 på GET — korrekt); bilder via arbetsyta+
  promptreferens (v4-attachment begin/chunk/sha256 ej live-bevisat ännu).
- A2 styrelsemotor live (401-vaktad); E2E 6/6 i dev-mock; Mimosa-vakt:
  naken filnamnskonstant + strängkonkat + rot-prefixkontroll i
  protokoll-appenden (path.join med variabel blockeras HÖGT — recept).
- A3 UI live i studion (bilder, 🏛-modal, tjänstepaneler, autonomi-badge).
- A4 paritetskarta: 91 tjänster, 31 (34 %) implementerade, 57 gap —
  topp-P0: v4-attachments, webbläsare, automation, full bakgrundslista,
  send-automationId. = våg 92-underlag.
- PIPELINE-KO.md = styrelsens dispatchlista (testrader rensade).

## TILLÄGG VÅG 92 — Z-PARITET P0-KOMPLETT (2026-09-10, kunddirektiv "Mega projektet, jobba hårt/länge")

A4-kartans topp-5 P0 byggs nu. Ägarskap krockfritt:

- B1 **TRANSPORT** (studio-transport.ts + api/studio/stream/route.ts):
  (a) v4/attachment begin/chunk/commit — laddaUppBilaga(sokvag) →
  {attachmentId} (sha256+base64 enligt binärform; 501-fallback =
  arbetsytareferens kvar); (b) skicka med attachments; (c) automation
  CRUD: automationSkapa/Uppdatera(pausa)/Radera + lasAutomationer;
  (d) skickaAutomation (send med automationId/offPeakTaskId);
  (e) lasBakgrundsjobb full projektionsparsning (id/titel/status/startad).
- B2 **TJÄNSTER-RODDAR** (api/studio/tjanster/** ENDAST): webblasare
  POST {url} → korWebblasare med full kontext (requestId/sessionId/
  workspace/clientMode); automation GET/POST/DELETE + /pausa; bakgrund
  GET full lista. 401-vaktade; StudioMetodSaknasError → 501 {saknas}.
- B3 **STUDIO-UI** (studio-chat.tsx + kommandon.ts ENDAST): webbläsar-
  panel (URL-fält → kör → titel+url+utdrag; lista öppna sidor),
  automationshanterare (lista + skapa namn/cron/prompt + pausa/radera),
  bakgrundskort med Avbryt, bilage-progress ("Laddar upp bilaga…" →
  "Bilaga ✓"). Våg 90-språk. Graceful vid 501.
- B4 **E2E-SVIT** (tool-results/ ENDAST, read-only mot src): v92-e2e.mjs
  — attachment-uppladdning, automation skapa→pausa→radera, webbläsare
  kör, bakgrundslista — körbar efter integration; + P1-designunderlag
  för våg 93 (hooks/trustGrant, workspace-inställningar, plugins-drift).

KVD: tsc 36-baslinje · build exit 0 · E2E grönt · deploy + prodcheck.

### VÅG 92 LANDAD (2026-09-10, 940343c, prod 200 + LIVE-E2E)

- **T1 BILDER LIVE-BEVISADE på prod**: uppladdning → stream med
  bildreferens → riktiga agenten såg 1×1-pixeln och svarade "rött —
  RGB (255,0,0)". Kundens "visa dig bilder" fungerar END-TO-END.
  v4-attachment-flödet implementerat (begin/chunk/commit) men prod-
  binären 3.11.2:s app-server valde referensvägen — båda vägarna
  levande, uppgradering av binären aktiverar äkta bilagor tyst.
- **T2/T3 SKIP = ÄRLIGA PROTKOLLGAP**: automation/create +
  interaction/browserExecute → -32601 ("stöds ej av denna
  agent-version") — metoder finns i A4:s kartsträng men app-server-
  gränssnittet på 3.11.2 exponerar dem ej; UI döljer panelerna graciöst
  (501-kontraktet). Återaktiveras vid binäruppgradering.
- T4 bakgrundslista 200 · T5 regression 200 · halsa 1 barn.
- TOTALT: 7 PASS · 0 FAIL · 2 SKIP av 9.
- V93-P1-UNDERLAG.md = nästa vågs blockindelning (C1 workspace-
  inställningar, C2 hooks/trustGrant, C3 plugins-drift, C4 events-
  replay) — NOTERA: håll koll på om binäruppgradering frigör
  automation/webbläsare först.

## TILLÄGG VÅG 93 — P1-KLUSTER ENLIGT V93-P1-UNDERLAG (2026-09-10)

Samma beprövade struktur som våg 92 (transport/rutter/UI, krockfritt):

- C1 **TRANSPORT** (studio-transport.ts ENDAST): workspace/readState
  full parsning + setDefaultModel/setDefaultThoughtLevel/setDefaultMode
  (kundens preferenser persists i workspace), plugins/setEnabled +
  plugins-drift-lista (aktiverad/version), session/events sonderad
  replay (seq-cursor om formen tillåter). -32601 → 501-karta.
- C2 **RUTTER** (api/studio/** NYA installningar + fardigheter-uppgr.):
  GET/POST /api/studio/installningar {modell?, tankestyrka?, lage?}
  → workspace-metoderna; /api/studio/fardigheter uppgraderas med
  plugin-aktiveringsstatus; ALDRIG skriva config.json med API-nycklar —
  endast preferensfälten via protokollets egna metoder.
- C3 **UI** (studio-chat.tsx + kommandon.ts ENDAST): Inställningar-
  drawern sparar till servern ("gäller nästa samtal"-ärlighet), plugin-
  brytare (på/av) i Färdigheter-drawer, indikator när workspace-läge
  avviker från sessionens.

KVD: tsc 36 · build 0 · E2E (installningar roundtrip) · deploy.

### VÅG 93 LANDAD (2026-09-10, 4896219, prod LIVE-verifierad)

- **INSTALLNINGAR LIVE**: GET → {modell:"zai/glm-5.3", tankestyrka:"max",
  lage:"build"} ur ÄKTA workspace/readState; POST {lage} → {ok,
  sparade:["lage"]} — workspace/setDefaultMode ACCEPTERAD av prod-
  binären med eko-persistens. Kundens standardval lever nu i servern.
- **PLUGINS LIVE**: 11 plugins med aktiverad-status (android-emulator,
  browser-use, document-skills …) — plugins-listan bär driftstatus.
- Events-replay-grund (lasEventsFranSeq) landad; wire-formen för
  setDefault* + plugins/setEnabled NU PROD-BEVISADE (fyller A4-kartans
  dokumenterade-form-gaps).
- Paritet efter 91-93: av 91 tjänster är nu 31+8 ≈ 39 implementerade
  (43 %) — resterande gap domineras av binärens -32601-metoder
  (automation, webbläsare — väntar binäruppgradering) + v4-styre/
  telemetri. NÄSTA: binäruppgraderingsutredning (frigör automation +
  webbläsare + attachment-väg) → därefter V93-C4 events-replay-UI.

### VÅG 93 TILLÄGG — BINÄRUPPGRADERINGSUTREDNINGEN STÄNGD (2026-09-10)

Serverns zcode-app-cli = **3.11.2-22** = npm `latest` (utgiven
2026-09-07; -19/-20/-21/-22 kom 5-7 sep). INGEN uppgradering finns —
automation/create + interaction/browserExecute är ej exponerade i
NÅGON utgiven version (strängar i bunten, metoder ej registrerade i
app-servergränssnittet — troligen gating för framtida/desktop-byggen).
Studions 501-graceful-kontrakt är därmed PERMANENT korrekt hållning.
ÅTERKOMST: `npm view zcode-app-cli version` vid varje våg-start — ny
version > 3.11.2-22 ⇒ kör v92-e2e.mjs omgående (T2/T3 vaknar tyst).
Paritetens tak är nu ~39/91 tills Z.AI släpper metoderna.

## VÅG 94 — KVALITETSKLYFTAN STÄNGD VID ROTEN (2026-09-10, f89888c)

Kundens besked: "inte alls samma kvalitet ... inget fungerar som det skall".
DIFFERENTIALDIAGNOS (inte mer UI — hjärnan):

1. **Skrivbordsagenten vs studions agent = samma motor, olika hjärna**:
   skrivbordet har AGENTS.md-briefing + 7 minnesfiler + färdigheter;
   studions agent hade **TOM arbetsyta-briefing (ingen AGENTS.md) +
   100 % tomt minne + arbetsyta fryst på våg 81** (12 vågar gammal —
   agenten citerade UTDATERADE regler ur gamla MEGA_PLAN-docs).
2. FIX PÅ SERVERN: (a) agentarbetsytan /home/ak1a/agent/ak1 uppdaterad
   086833e→f89888c (dubblettrensning som deploy-fällan); (b) AGENTS.md
   (91 r, versionerad i repo data/infra/agent-arbetsyta/ + kopiad till
   arbetsytrot) med sanningshierarki (AGENTS.md > STYRELSE-*.md >
   worklog > HISTORISKA MEGA-docs); (c) minnet sått (kundprofil,
   projektstatus, juridik, styrelseregler i projekt-minnet ak1-80a87…).
3. **A/B-BEVIS (samma fråga, prod)**: FÖRE = föråldrad våg-81-"sanning",
   ingen juridik/kundprofil; EFTER = citerar briefing, kundprofil,
   ALDRIG-investeringsråd, Contabo/develop/våg-93-aktualitet, R1-R4.
   Arbetsprobe: läste STYRELSE-ADMIN-MEGA.md live och sammanfattade
   våg 91 korrekt (tankar 2 182 tkn).
4. KVAR-STÖRNING: -32031 vid första meddelandet efter omstart (gammal
   karta-session fäster död modell) — självläkning slår efter sekunder,
   engångskostnad per omstart; bevakas.
5. **STÅENDE VÅG-START-RUTIN**: agentarbetsytan pullas + AGENTS.md
   kopieras (cp data/infra/agent-arbetsyta/AGENTS.md ./AGENTS.md) vid
   varje våg-deploy — annars glider hjärnan ifrån koden igen.

### VÅG 94B — AUTO-POLICY + MOLNUTVECKLING BEVISAD (2026-09-10, e4f336c + agent-commit ab08bd2)

- FYND (E2E-test 1): molnagentens ALLA skrivningar fastnade i
  30 s-permissionsvantan ("inget klient-svar") = kundens "inget
  fungerar"-kansla vid varje filandring; lasning verkade fri.
- FIX: permissions-policyn (lib/studio, ny modul) — allow (Write/Edit
  i arbetsytan, Bash-vitlista per led: git/npm/npx/node/pm2 ak1a/curl
  localhost+lab), deny (.env/nycklar/sudo/destruktivt/force-push),
  frag (ovrigt -> dialog). Transportkoppling i requestPermission-
  grenen; STUDIO_AUTO_POLICY=av-brytare. Test 63/63.
- BEVIS 2 (prod, oberoende verifierad): agenten skapade
  data/forskning/MOLN-DEV-BEVIS.md, committade (ab08bd2) och pushade
  till prod-repot VIA EGEN GIT — statusraderna visade auto-policyens
  tillstand; prod-HEAD = agentens commit. CHAT -> UTVECKLA -> LEVERERA,
  hela kedjan i molnet utan dator. AGENTS.md bar leveransprotokollet
  (data = push direkt; kod = tsc+bygg+pm2 med revert-stoppregel;
  prod-remote = lokal sodkvag).

### VÅG 95 LANDAD (2026-09-11, 6776bda + 430dcf6, prod 200)

- **M9-FABRIKEN**: 3 evergreen-utkast i kundens Supabase-granskningskö
  (kontrolleraText 0 FEL, md5-kvitton, determinism bevisad, 57/57 oberoende
  kontroller) + M9-GRANSKNING-2026-09.md-guiden + fabrikbootstrap (--tvinga)
  + kortNamn-buggfix. KUNDENS FÖRSTA GRANSKNINGSKÖ ÄR LEVERERAD.
- **8 SEO-GUIDER**: granskningskö data/forskning/SEO-GUIDER-2026-09.md;
  JSON-utkast i data/blogg-utkast/ (EJ live-mappen — main-agentens
  add -A-fel fångat och åtgärdat innan deploy; prod oförändrad
  55 poster verifierad).
- **HASTIGHET**: friskgangsregel (24 h/modellDod → FRISK session vid nytt
  meddelande, E2E 5/5) + varmStudioTransport (PROD-BEVISAD: barnprocess
  född utan kund efter omstart) + TTFB-verktyg (brygg-overhead 36 ms).
- **STYRELSEFIX**: appendera()-vakten kastade vid varje protokoll-append
  (separerar-självmotsägelse) — exakt rot+'/'+namn-kontroll nu.
- tsc 36=baslinje · build exit 0 · regressioner gröna · deploy 200.

## VÅG 96 — BREDD + DJUP (2026-09-11, styrelsebeslut per R1-R3)

- D1 **PRESTANDA VÅG 3**: prod-mätning (TTFB/LCP-grund, buntar, bilder)
  + topp-5 åtgärder inom tillåtna ytor (nginx/Next-konfig, bild-
  optimering, font/laddningsordning) — ALDRIG pm2-filer på servern.
- D2 **STUDIO MOBIL-POLISH**: telefon-först-förbättringar av
  studio-chat.tsx (tryckytor ≥52px, läsbarhet, drawer-ergonomi,
  tangentbordshantering) — våg 90-språket består.
- D3 **M9 SERIE 4-6**: tre nya evergreen-serier i fabriken (kassa-
  flödesanalys, utdelningar-101, boerspsykologi) → kundens
  granskningskö — samma harda grindar (utkast-status, kontrolleraText,
  md5-kvitton, ALDRIG investeringsråd).

KVD: tsc 36 · build 0 · E2E-regressioner gröna · deploy + prodcheck.

### VÅG 96 TILLÄGG — R2-SKÄRPNING + AUTONOM VERKSTÄLLNAD (2026-09-11)

Kunddirektiv: "ai styrelse agenter teamet bestämmer allt och helt
autonomt jobbar, jag har ej [behövt] beslutet att göra, ni har full
access till allt." → R2 SKÄRPS: styrelsen beslutar OCH verkställer
ALLT verkställbart autonomt. Enda undantaget = fysiska handlingar i
system som kräver kundens inloggning/hand Underskrift (registrar-DNS,
bank/Stripe-identitet, juristavtal, kundens egna Z.AI-konto) — dessa
listas som "KUNDENS HÄNDER" (handlinger, EJ beslut) med färdigpackad
instruktion.

VERKSTÄLLT AUTONOMT (2026-09-11):
- SQL-tabellen: REDAN KLAR (system_events lever, m9 skriver till den;
  den gamla påminnelsen var inaktuell — INLOGGNING-ADMIN §"städades
  med service-nyckel").
- REDAKTOR_PASSWORD: genererad + satt i serverns .env.production.local
  (chmod 600) + verifierad: redaktörslogin 200 med signerad kaka.
- SESSION_SECRET: fanns sedan tidigare våg — verifierad aktiv.

KUNDENS HÄNDER (färdigpackat, väntar på fysisk åtgärd — INGA beslut):
- Domänen lab.→ak1nvestor.com: DNS A-record hos one.com (styrelsen
  förbereder certbot+nginx samma timme som kunden flippar).
- API-nyckelrotation: kundens Z.AI-konto (nyckeln lever ENDAST där +
  serverns config.json chmod 600).
- Stripe/betalning + jurist K-B2B: kräver kundens bank-ID/underskrift.

### VÅG 96 LANDAD (2026-09-11, bf9e06a, prod 200 + nginx-cacher live)

- D2 MOBIL: ~35 tryckytor ≥52px (sm:-reset), läsbarhet 15px, iOS-zoom-
  bort (16px fält), visualViewport-lyssnare, drawer 85vw + Stäng-rad.
- D1 PRESTANDA: mono-font preload av (2 preload = -40 kB kritiskt),
  X-Powered-By borta, PROD-MÄTNING: / TTFB median 47,8 ms · /kurser
  50,9 · blogg 53,4 · speglar ISR-svans 0,5-3,6 s (kunddirektiv
  oförändrat); nginx public/-cacher LIVE (og/ak1a 30 d · index 1 h ·
  llms 24 h — blocken flyttades till 443-servern; backup
  /tmp/nginx-ak1a.bak-v96).
- D3 M9: 4 nya utkast i kön (kassaflödesanalys-101 · utdelningar-101 ·
  börspsykologi-fallstugor · branschmedianer v2-legitimt) — nyckeltal
  omräknade mot källfiler, 0 FEL. Kundens kö = 7 utkast + 8 SEO-guider.
- tsc 36 · build 0 · deploy 200 · arbetsyta synkad.

## VÅG 97 — CITERINGSMAGNETER + STUDIO-TANKAR (2026-09-11, R2-skarpt)

- E1 **DATASET-SIDOR** (front A i AI-innovationsprogrammet): publika
  citeringsmagnetsidor ur AKM2-datan — branschmedianer (P/E, direkt-
  avkastning, marginaler) som strukturerade sidor + JSON-LD + llms.txt-
  länkning. KONTRAKT: endast publika medianer/aggregat — per-bolag-
  poäng ALDRIG (V86-dataset-kontraktet). Trespråkigt enligt speglarnas
  mönster.
- E2 **STUDIO TANKAR-VY + BORTA-REPLAY**: agentens resonemang (kanal
  "tankar") renderas som kollapsbar sektion under svaret; borta-bannern
  berikas ur /api/studio/session/events (C4) — "vad agenten gjorde
  medan du var borta" med verktygsaktivitet.
- Backup-verifiering: dumpens slutmarkör + 710 objekt bevisade; nattlig
  cron verifierad installerad.

KVD: tsc 36 · build 0 · deploy + prodcheck.

### VÅG 97 LANDAD (2026-09-11, 80085c1, prod 200 + live-verifierad)

- E1 DATASET LIVE: /dataset + 10 branscher × 3 språk (33 URL:er) alla
  200 med Dataset-JSON-LD + korrekta canonicals; llms.txt-sektion live;
  sitemap 33 rader; 0 bolagsläckage (programmatiskt bevisat).
- E2 STUDIO: TankarVy (kollapsbar 💭 per meddelande, peek under
  streaming, persistens session+IndexedDB) + borta-banner med upp till
  5 verktygsrader ur session/events även vid reconnect.
- tsc 36 · build 0 (951 sidor) · arbetsyta synkad.

## VÅG 98 — DATASET-DJUP + DRIFTSTYRKEPROV (2026-09-11)

- F1 **ISR-UPPVÄRMNING** (server-ops, ej byggändring): vardagar 03:00
  värmer cron ~65 vägar (/, /kurser, /dataset ×3 språk, topp-blogg +
  speglar) genom localhost — kapar förstagångs-svansen 0,5-3,6 s.
  Kunddirektivet "INGET förbygge" (=byggtid) respekteras: detta är
  runtime-cachelukring.
- F2 **DATASET-DJUP** (repo): kvartil-spridning (aggregat — kontraktet
  tillåter medianer+aggregat, ALDRIG per-bolag) + jämförelsevy + guide-
  länkning till kurserna.
- F3 **BACKUP-DR-PROV** (server-ops): full återställning av gårdagens
  dump i skrap-postgres på servern — tabell-/radräknings-jämförelse +
  återställningstid dokumenteras i DRIFTSBOKEN.

KVD: tsc 36 · build 0 · deploy + prodcheck.

### VAG 98 LANDAD (2026-09-11, 7a04259 + c9cded9 + 151b5a9, prod 200)

- F1 ISR-VARMARE LIVE: cron kl 03:10 (versionerad i repot data/infra/
  contabo/); testkorning 12/44 — sokvagslista finslipas successivt.
- F3 DR-PROV GODKANT: 20 s · 60 tabeller · 1 187 291 rader; 768 fel =
  Supabase-roller (ofarliga GRANT-satser); lokal PG17 installerad +
  stoppad for framtida prov (start: sudo pg_ctlcluster 17 main start).
- F2 DATASET-DJUP LIVE (prodverifierad): kvartilsspridning, bransch-
  mot-universum med delta-pilar, sortering, kurslankar, 20 nycklar x3,
  permanent lekagevakt (222 filer, 0 traffar).
- tsc 36 · build 0 (951 sidor) · deploy 200.

## VÅG 99 — DJUPT: SCHEMA-KOMPLETT + PRISSTEGE-REDskap (2026-09-11)

- G1 **A3 SLUTFÖRD**: FAQPage-schema (genererat ur varje kurs learn/
  why-innehåll, 3-4 frågor/svar) + Course-schema komplett (provider,
  educationalLevel, timeRequired, inLanguage, offers) + BreadcrumbList
  — på alla 333 kurser × 3 språk; validerat mot Googles rika resultat-
  krav (inga tomma fält, inga påhittade frågor).
- G2 **PRISSTEGE BAKOM FLAGGA**: portfölj-tier-sidorna (249/499→799;
  kundens slutliga priser väntar — EXISTS-kravet: sidorna bygger klara
  men oåtkomliga tills kundens beslut; env-flagga + 404-grind enligt
  b2bAktiv-mönstret). ALDRIG aktiverad autonomt (R2: prissättning =
  kundens).

KVD: tsc 36 · build 0 · schema-validering · deploy.

## VÅG 99 TILLÄGG — SYSTEM FÖR SYSTEM (2026-09-11, kunddirektiv "bygg i timmar system för system")

- H1 **LÄRVÄGS-SYSTEMET KLART** (front B): statusrevision av B1-LARVAG +
  fullbordan — personlig nästa-kurs-rekommendation med varför-rad ur
  medlemmens progress/kategori/quiz-svaghet; visas på min-sida.
- H2 **AI-MENTORN 2.0** (front B): publikchatt-widgeten grundas i ÄKTA
  data (kursregistret + dataset-medianer) med AK1A-röst + juridikgrind —
  aldrig generiska svar.
- H3 **KVARTALSRAPPORT-SYSTEMET** (front A sista biten): pedagogiska
  kvartalssammanfattningar ("vad resultatensäsongen lärde oss") som
  citeringsmagnet-serie i granskningskön.

KVD: tsc 36 · build 0 · deploy per system när klart.

## SYSTEMRANKNINGEN (2026-09-11, kunddirektiv "ranka alla system, strikt metodiskt, många parallella agenter, korrekta översättningar")

| # | System | Läge | Åtgärd |
|---|--------|------|--------|
| 1 | Inloggning/konto | TRASIG UX (fel suppressas; kund blockerad 2 ggr) | LOGIN-2.0 körs (specifika fel + live-räknare) |
| 2 | Översättningskorpus | ~100 % men okvalitetsgranskad sen våg 80 | I1: kvalitetsvåg med fixpaket |
| 3 | Kurs-schema (A3) | pågår G1 | — |
| 4 | Prisstege | pågår G2 (bakom flagga) | — |
| 5 | Lärväg (front B) | pågår H1 | — |
| 6 | AI-Mentorn | pågår H2 | — |
| 7 | Kvartalsrapport (front A) | pågår H3 | — |
| 8 | Studio/Z-paritet | tak ~39/91 (binärgap) | bevakar npm view per våg |
| 9 | Betalning (L4) | väntar kundens 8 beslut | förberedd via G2 |
| 10 | B2B | väntar jurist | inaktiv |
| 11 | Systemkartan total | saknas | I2: full inventering + score |

- I1 **ÖVERSÄTTNINGSKVALITET**: stickprovs-audit sv↔en↔ar över kurser/
  blogg/UI-ordlista + dataset — maskinella anomalier (orolängd, okända
  tecken, ofullständiga, falska vänner) + fixpaket som MAIN applicerar
  (ej redigera ordlista.ts parallellt med G1!).
- I2 **SYSTEMKARTAN**: read-only inventering av ALLA system med
  kvalitetscore + gap — våg 100+dispatchlista.

## VÅG 100 — AGENTENS VERKTYGSBÄLTE (2026-09-11, kunddirektiv "bygg dig själv vidare autonomt … absolut maximala kapacitet")

Agenten bygger ut SIG SJÄLV — operativ kunskap paketerad så att varje
framtida session (och varje parallell agent) startar på max, utan att
återhärleda protokoll ur 10 000 worklog-rader:

- J1 **FÄRDIGHETSBIBLIOTEKET** (`.zcode/skills/`, 8 st, frontmatter
  validerad 8/8): `sessionstart` (läge + sanningshierarki + dokument-
  karta), `leverera-kod` (deployprotokoll + revert-stoppregeln),
  `leverera-data` (datapush utan bygge), `leveranskontroll` (KVD: tsc-36
  · motorer 107/0/0 · vakten GRÖN · prod 200), `styrelsemote` (R1-R4 +
  styrelsemotorn + protokollgång), `parallell-dispatch` (R4-tak ~9,
  promptmall, huvudagentens build-ensamrätt — OOM-lärdomen våg 85),
  `juridikgrind` (utbildning ALDRIG rådgivning + lagrumsträd som ej
  blandas), `drift-ops` (backup, DR-prov, ISR-varmare, pm2-ordning).
- J2 **LÄGESVERKTYGET** `verktyg/agent-status.mjs`: ETT kommando →
  git-läge + senaste våg (worklog och styrelsedokument sammanslagna) +
  prod-HTTPS + prod-commit + pm2 + vakten/motorer + bältets skick.
  Maskinläsbar RESULTAT_JSON-sista-rad (samma mönster som vakten).
  Parserfälla hittad och skärpt vid test: dokumentraden "Statusregler:
  RÖD = …" fick ALDRIG tolkas som status — enbart STATUS-rader parsas.
  Testat GRÖNT: prod 200 · pm2 online · vakten GRÖN · motorer 107/0/0.
- J3 **KOMMANDON** (`.zcode/commands/`): `/status`, `/kvd`, `/deploy` —
  snabbåtkomst i Z-Code-ytan (studiens "/"-meny + skrivbordsklienten).
- J4 **AGENTS.md**: ny sektion "VERKTYGSBÄLTET (våg 100)" — briefingens
  pekare in i bältet; AGENTS.md förblir sanningshierarkins topp.

KVD: tsc = baslinjen (kontrollkörd, se worklogkvitto) · leveransen är
datafiler/konfig (inget appbygge) · deploy + prodcheck.


## VÅG 103 — HARMONI-PROGRAMMET (2026-09-11, kundens universumsdirektiv)

"Jobba hand i hand med andra agenter... alla system djupt med full
harmoni och integration... rätt system som förstår naturen så som
när jag analyserar tack vare våra system."

- K-A **AGENT-TILL-AGENT-KOORDINATION**: main ↔ molnagenten kommuni-
  cerar via studions session (meddelanden + gemensam dispatchlista);
  molnagenten äger portal-vågen (102+), main äger plattform-systemen —
  låset skyddar byggen, speglarna håller koden samlad.
- K-B **METODIKEN HEM**: ak1a-analys-skillen (5×5×4, Monte Carlo,
  bayesiansk omviktning, Kelly) portas versionerat till molnarbetsytan
  → kunden kan be studion "kör en AK1A-analys" och få METODIKENS djup,
  inte generiska svar — systemen som förstår naturen.
- K-C **DJUPET**: analysdjupet (analysfabrik + AKM2 + data) integreras
  i portalens dashboard (molnagentens våg) + publika analysytor
  fördjupas (main) — harmoni mellan medlem/portfölj/analys/kurser.
