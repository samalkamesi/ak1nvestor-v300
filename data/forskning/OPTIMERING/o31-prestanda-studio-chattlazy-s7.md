# O31 — Prestanda spår 7: /studio chatt-laty — StudioChat-bunten ur lås-vyns kritiska last (2026-09-16)

**Ägare:** fabriksagent s7-u2 (byggare 2/3, nytt manifest) · **Status:** KLAR
— EFTER bokförd 2026-09-17 (uppföljningsomgång s7-u2 2/3): vakaren mätte
2026-09-16 19:01:27Z på BUILD_ID 18:59:40Z (deploy bevisad; grindar gröna:
RAM 5 610 MB, statisk sond GRÖN, ISR-trigga ×2+8 s) → **P71 · LCP 4 168 ·
TBT 577 · CLS 0 · vikt 556 KiB · unused-JS 104 KiB** — tabell + värdering i
§5. Kuran BEVISAD: P +8, unused-JS −62 KiB.

## §0 Objektval + duplikatkontroll

Uppdrag: nästa prestandaobjekt i spåret ("mät före/efter, deploy, prod 200,
mätning bokförd"). Kontroll före val (worklog + OPTIMERING + anspråksfiler):

- **o16:s två köposter** ("Nya köobjekt … nästa prestandavåg") = spårets enda
  explicit barnbokade objekt: (1) /studio SEO 0,66, (2) /studio unused-JS
  141 KiB (StudioChat-bunten före auth). Denna våg tar båda — (1) visas i §4
  vara AVSIKTLIG och stängs med bevis (R2), (2) kuras här.
- **EFTER-kedjan för o27 (koddelning) + o28 §6 (blogg-CV)**: TAGEN av syskon
  s7-u3 (3/3) — anspråk `data/vakten/s7-bloggefter-u3-ansprak-1816.md`
  18:16, före min start 18:18. Lämnas helt åt dem; inga parallella
  Lighthouse-körningar från denna våg (mina mätningar = endast vakarens
  /studio, med pgrep- + RAM-grindar).
- Cache (o10/o13), läsbarhet (o8), fonter (styrelsebeslut v96 D1), prefetch
  (o17), CV /bibliotek+/kurser+/blogg (o18/o20/o28), SPA-koddelning (o27),
  bildoptimering (avförd o5-F5 + o27: inga bildauditer flaggar), brotli
  (huvudagent/sudo), språkresolvens-CLS + kakpanel-LCP (o18 §4: huvudagent/
  produkt/kund), chatt-chunkens INTERNA innehåll (o17/o19: spår 6:s testgrep
  på chat-widget.tsx) — alla stängda/andra ägare. Kurten här rör INTE
  chat-widget.tsx (syskonfil, se §6).

## §1 FYND: hela StudioChat-kedjan bundleas till lås-vybesökaren

`studio-klient.tsx` (o16:s klickthalva) importerade `StudioChat` STATISKT
(rad 13 i föregående version) men renderar den ENDAST i `authad`-grenen
(efter sessionkontroll `GET /api/studio/stream` 200). SSR-renderar ALLTID
lås-vyn (initial state `authad=false, kollar=true`) — ändå följde hela
chatt-subträdets chunk med sidans initiala JS till varje besökare: chat +
paneler (färdigheter/minne/förbrukning) + studio-transport + lucide-ikon-
uppsättningen i studio-chat.tsx. Kedjan är EXKLUSIVT ropad av studio-klient
(grep: övriga träffar = kommentarer i lib/panel-filer) → flytt skadar ingen
annan route. o16:s Lighthouse: **unused-JS 141 KiB** (FÖRE) → **166 KiB**
(EFTER o16:s egen kur, 03:33) — kedjan VÄXER med varje mentorlager (12 → 16
under dagen; syskonets 17:e wireas parallellt med denna våg) utan att en
enda lås-vybesökare behöver den.

## §2 KUR (denna commit)

`studio-klient.tsx`: statisk import bort; `next/dynamic` + `ssr: false` +
lås-vyns egen skelett-idiom som `loading` ("Öppnar chatten…") — EXAKT
husidiomet från spa-hem (o27/våg 68): `dynamic(() => import(…).then((m) =>
({ default: m.StudioChat })), { ssr: false, … })`.

- Chunken hämtas först när authad-grenen renderar (inloggad kund) — lås-vyns
  besökare (och ISR-cachens lås-HTML, o16: 3600+swr) bär den aldrig.
- **Server-HTML strukturellt identisk**: grenen renderades aldrig vid SSR
  (initial state = lås-vyn) → noll hydration-risk, noll SEO/AX-påverkan.
- `page.tsx`-wrappern (revalidate 3600) orörd; ISR-cachen ogiltiggörs av
  bygget som vanligt.
- chat-widget.tsx + samtliga ai-mentor-*.ts + kedja.mjs ORÖRDA (spår 6:s
  yta; deras testgrep ser sin fil oförändrad — se §6).

## §3 FÖRE-baslinje

FÖRE = o16:s deployade EFTER-körning `lighthouse/studio-efter.json`
(2026-09-16 03:33:46Z, mobil, localhost = prod-bygget) — senaste giltiga
mätningen på /studio; koden däremellan (mentorlager 13–16) rör INTE
lås-vyns rendering, bara chatt-chunkens STORLEK (växer — objektets poäng):

| Mätning | P | LCP | TBT | CLS | bootup | totalvikt | unused-JS |
|---|---|---|---|---|---|---|---|
| studio-fore 02:21 (före o16) | 55 | 5 863 | 909 | 0 | 2 373 | 695 635 B | 141 KiB |
| **studio-efter 03:33 (FÖRE för o31)** | **63** | **5 027** | **638** | **0** | **1 569** | **640 009 B** | **166 KiB** |

Ärlighet: färsk FÖRE-om-mätning avstod — servern var mätovärd vid valtillfället
(fri RAM 411 MB, load 3,3; o28 §4-disciplin: Chrome kunde OOM-döda pm2 =
incidentmönstren 10:02/12:02). EFTER körs endast under vakarens grindar (§5),
vilket gör jämförelsen konservativ (EFTER mäts i bättre läge än en eventuell
panik-FÖRE hade mätts i).

## §4 o16-köpost 1 STÄNGD: /studio SEO 0,66 = AVSIKTLIG (R2)

Felande audit i studio-efter.json: `is-crawlable — "Page is blocked from
indexing"` (ENDA SEO-fyndet; title + description ärvs korrekt från
rot-layouten — o16:s "tunn text-yta"-teori var fel). Källan: `src/app/
robots.ts` STÄNGDA_YTOR = ["/admin", "/pro/admin", **"/studio"**,
"/api/studio"] med dokumenterad motivering "VÅG 81 /studio (admin-låst
agent-webchat)". SEO 0,66 på /studio är alltså en AVSIKTLIG policy, inte ett
fel: att öppna kundens privata agent-webchat för indexering = publicerings-
beslut = R2 (kundens veto) — kur lämnas ALDRIG till barnagent. Köposten
stängs HÄR med bevis; värdet 0,66 är priset för policyn och ska inte
jägas av kommande vågor.

## §5 EFTER (vakare — MÄTT 2026-09-16 19:01:27Z, bokförd 2026-09-17)

Vakare `/tmp/s7u2c-vakare.mjs` (setsid-fristående, logg `/tmp/s7u2c-vakare.log`,
tak 4 h, poll 2 min) mäter när ALLA grindar passerats:
1. Deploy bevisad: `.next/BUILD_ID` mtime > denna commits tidstämpel (prod-
   synken bygger HEAD ⊇ denna commit) OCH prod-synk.log "DEPLOYAD" efteråt.
2. ISR-trigga /studio ×2 + 8 s (11163-metoden) — första hämtningen sparkar
   SWR-omvalidiering; s8-u2:s post-deploy-fönster (gammal ISR-HTML + nya
   chunk-hashar = sken-404) passeras innan mätning.
3. `node verktyg/statisk-sond.mjs --sida=/studio` = **grön** (HTML↔chunks
   konsistens — s8-u2/u1:s lärdom).
4. Vilande: `pgrep lighthouse`/`pgrep chrome` = 0 (syskon-disciplin) OCH
   fri RAM ≥ 1 500 MB (Chrome får aldrig riskera pm2).
5. `node verktyg/prestanda-lighthouse.mjs s7u2c-efter /studio` → rådata +
   sammanfattning; tabellen nedan fylls av nästa omgång/huvudagent.

| Mätning | P | LCP | TBT | CLS | bootup | totalvikt | unused-JS |
|---|---|---|---|---|---|---|---|
| **/studio EFTER (s7u2c, 09-16 19:01:27Z)** | **71** | **4 168** | **577** | **0** | **1 500** | **556 KiB** | **104 KiB** |

Förväntad mekanism: unused-JS på /studio sjunker kraftigt (166 KiB-bäraren
lämnar initialbunten; exakt tal = chatt-chunkens storlek I DAG inkl. 16–17
mentorlager — större än o16:s 166), total-byte-weight −(chatt-chunkens
zippade vikt), TBT/bootup följer sekundärt. FUNKTIONSBEVIS för inloggad väg
kan en barnagent inte köra (kräver admin-autentisering — R2-yta); mekanismen
är typgrön + husmönster (o27/våg 68) och kundens nästa studiobesök är det
levande beviset — noteras som ärlig rest tillsammans med EFTER-talen.

**Värdering (bokförd 2026-09-17, uppföljningsomgång s7-u2 2/3) — kuran
BEVISAD:** P 63→71 (+8) · LCP 5 027→4 168 ms (−859, −17 %) · TBT 638→577
(−61) · CLS 0→0 · bootup 1 569→1 500 (−69) · totalvikt 640 009 B→556 KiB
(−69 KiB, −11 %) · **unused-JS 166→104 KiB (−62 KiB)** — exakt den
förväntade mekanismen ovan: chatt-chunkens initiala bidrag (62 KiB) lämnar
lås-vybesökarens bunten. Riktningsmässigt konservativ: FÖRE mättes i
vilande nattläge (03:33), EFTER vid load 3,82 (RAM-grinden grön men ej
fullvila — o28 §1-disciplin) ⇒ den sanna förbättringen är snarare
underskattad. Beviskedja: vakarlogg `/tmp/s7u2c-vakare.log` (vakaren
väntade korrekt genom två pågående byggen — BUILD_ID ENOENT 18:19/18:59
mitt i npm-builds — grindar gröna 19:01:18Z med BUILD_ID 18:59:40Z nyare
än kur-commiten 3a8f2287; ISR-trigga ×2+8 s; statisk sond GRÖN) + rådata
`lighthouse/{studio-s7u2c-efter.json, s7u2c-efter-sammanfattning.json}` +
prod 200 på / och /studio om-verifierad 2026-09-17.

**Byggeshistorik (ärlighet):** mätningen gällde BUILD_ID 18:59:40Z; prod
har sedan dess fått ytterligare byggen (senaste 2026-09-16 22:09:33Z,
s6-vågornas mentorlager 20–21) som bara VÄXER chatt-chunkens innehåll (§1:s
tillväxtmekanism) — 104 KiB är alltså en undre gräns; den kurerade
strukturen (lås-vyn bär aldrig chatten) är bygges-okänslig.

**Kvarvarande (stängda/andra ägare):** unused-JS poäng 0 med 104 KiB
spill — bärare: mentortexternas växande chunk (spår 6:s yta, stängt sedan
o17 §AVSTÅTT/o19) + huvudbunten; bootup 1,5 s + mainthread 3,1 s =
CPU-kostnad, last-känslig (o28/o32). Funktionsbevis inloggad väg förblir
R2-yta — kundens nästa studiobesök är det levande beviset.

## §6 Syskon- och kollisionsbokföring

- **u3 (3/3, samma manifest)**: äger o27-EFTER + o28 §6 (anspråk 18:16).
  Denna våg mäter INGET själv; vakarens grindar (pgrep/RAM) skyddar deras
  körningar. Arbetsfördelningen speglar rond-precedensen (mätning vs kur).
- **Spår 6-agent i realtid**: chat-widget.tsx (+36 rader) + tio mentor-test-
  filer modifierade i arbetsytan UNDER detta fönster; deras ospårade nya
  modul (ai-mentor-beteendedjup-fragor.ts) väntar på deras commit. Denna
  commits pathspec innehåller ENbart egna filer; tsc 0 gällde HELA trädet
  inklusive deras pågående diff. Deras yta orörd av mig (chat-widget.tsx
  läses, ändras ej).
- Anspråksfil före start: `data/vakten/s7-studiochat-u2-ansprak-1824.md`
  (gitignorad katalog).

## §7 Noteringar

- Vakarens rådata namnges i EGEN namnrymd (s7u2c-*) — verktygets
  copyFileSync-clobber-lärdom (o18 §kollisionsbokföring) respekteras.
- Om vakaren dör inom taket (12:39-precedensen): EFTER förblir pending och
  nästa omgång mäter enligt §5:s grillista — tabellen är självbeskrivande.
- **Upplöst 2026-09-17 (uppföljningsomgång s7-u2 2/3):** vakaren levererade
  INOM taket — grindar gröna 19:01:18Z, mätning 19:01:27Z, filer på disk
  19:01:53Z; processen avslutad och borta vid omgångens start (ps-
  verifierat 2026-09-17). o32 §6:s tidszonsbugg blev aldrig utlösande: det
  som frigjorde mätningen var nya BUILD_ID (18:59:40Z) + RAM-grinden —
  loggraden "grindar gröna" sammanfattar samtliga villkor inkl.
  deploy-beviset; buggen lämnas åt o32:s ägare som dokumenterad.
- R2 orörd: inga priser/tier/publicering (§4 = just därför STÄNGD ej kurad);
  data/blogg/ orörd; .env*/nycklar orörda; inget bygge i denna våg (ägande:
  prod-synken under deploylåset). Bokföringsomgången 2026-09-17 rör ENDAST
  data/-filer (protokoll + mätningsrådata + worklog) — src/ orörd, inget
  bygge.
