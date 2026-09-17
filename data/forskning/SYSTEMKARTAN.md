# SYSTEMKARTAN — AK1A Research Lab (2026-09-11 · uppdaterad 2026-09-16)

Styrelsebeslut **I2** (SYSTEMRANKNINGEN, STYRELSE-ADMIN-MEGA.md): read-only
inventering av ALLA system i plattformen med kvalitetscore och gap. Byggd av
K1-subagenten (våg 101) genom kodläsning av src/app (89 sidor + 134 API-rutter),
src/lib (~20 500 rader), src/components/ak1a (118 komponenter), data/, verktyg/
(60+ skript/varav 37 testsviter), data/infra/ + DRIFTSBOKEN. **Ingen kod ändrad.**

## Verifieringar körda vid inventeringen (bevis, 2026-09-11)

| Kontroll | Resultat | Not |
|---|---|---|
| `npx tsc --noEmit` | **36 utdatarader** (34 fel-diagnostik + 2 fortsättningsrader) | Identisk med baslinjen 36 — oförändrat |
| `node verktyg/validera-motorer.mjs` | **105 PASS / 2 FAIL / 0 SKIP** | **AVVIKELSE** från dokumenterade 107/0/0 (se B11 + E31) |
| `node verktyg/kvalitetsvakt.mjs` | **GUL** (2 fel = motorvalideringen, 4 manuella) | Avvikelse från "vakten GRÖN" i KVD-basen |
| `testa-medlem-auth` 17/17 · `testa-schema-kurser` 444/0 · `testa-kurs-metadata` 16/16 · `testa-mediabibliotek` 18/18 · `testa-admin-session` 14/14 | ALLA GRÖNA | Provtagningsurval ur 37 sviter |
| `node verktyg/testa-b2b-grind.mjs` | **TRASIG** — ERR_MODULE_NOT_FOUND | Skriptet importerar src/app/robots.ts med `@/lib`-alias som node ej löser (se E30) |

Lägesord: **LEVER** (fungerar i prod) · **PÅGÅR** (byggs/revideras) · **FLAGGA**
(lever men med känt fel) · **VÄNTAR** (kod klar, väntar kund/jurist) ·
**INAKTIV** (avstängt bakom flagga). Score 1–10 är KODMÄSSIG (tester,
validering, felhantering, dokumentation) — inte kommersiell mognad.

## UPPDATERING 2026-09-13 (portal-spåret våg 102–106 + organism-spåret 113–120)

K1-inventeringen kompletteras efter portal-megaplanens slutleverans
(STYRELSE-PORTAL-MEGA.md §VÅG 106) och organism-spårets vågor. Ändrade
rader markeras nedan; övriga 31 rader oförändrade sedan 2026-09-11.

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B11 | FLAGGA 5 → **LEVER 6** | DETERMINISM-felet (VOLV-B.ST) är borta: motorvalideringen 107/0/0 (2026-09-13, se KVD nedan). Kvar: egen testsvit saknas |
| D20 | FLAGGA 6 → **LEVER 7** | LOGIN-2.0 E2E-verifierad på prod (STYRELSE-2026-09-11-V106 § 3 D1 "KLART — specifika feltexter live"); rank #1-åtgärden därmed landad. Kvar: återställ lösenord, egen E2E-svit |
| D21 | LEVER 8 → **LEVER 8** | Kontraktet bär nu även paborjadeKurser + quizRatta (våg 106-rond 1) — ingen ny läsning/tabell, samma system_events-karta |
| E29 | LEVER 6 → **LEVER 7** | Prompt-evolution v1+v2 (våg 113/115), organ-registret deploy-säkrat (våg 116), organism-panel + senaste landningar i studion (våg 114/118), beslutsminne.jsonl påbörjad 2026-09-13 (rond-promptens steg 6 hade aldrig exekverats — nu igång) |
| E31 | PÅGÅR 7 → **PÅGÅR 7** | Portalens sista trespråksgap stängt (cert/pass/läroplan sv/en/ar + 6 spegelsidor, våg 113); MÖS-kvalitetsaudit fortfarande ej gjord |
| E33 | LEVER 8 → **LEVER 8** | system_events-mönstret bevisat i TRE system: progress + bevakning (våg 104) + portfölj (våg 119) — senaste-vinner, serverfastställda värden, tak-regler |
| E35 | FLAGGA 7 → **LEVER 7** | Motorvalideringen 107/0/0 (båda inventeringsfelen borta) + gränssnittsvakten cron-driven GRÖN. Kvar: testtäckning 32/42 motorer, ingen CI |
| E37 | LEVER 7 → **LEVER 7** | Min Sida uppgraderad till medlemens nav — lyft till ny rad D38 |
| **D38** | **NY: LEVER 8** | Medlemsnavet (se detaljblock) — kundkrav #1–#6 i portal-megaplanen lever |

**KVD-verifiering 2026-09-13 (subagent, efter våg 120-deployen 09:02):**
tsc exakt 34 = baslinjen (0 nya) · `validera-motorer.mjs` **107 PASS /
0 FAIL / 0 SKIP (6,4 s)** · gränssnittsvakten GRÖN (cron-fullsvep 0 fynd/144
kombinationer 07:17 + snabbsvep 0/12 efter deployen) · prod 200 på både
loopback och HTTPS. Vakten MÅSTE köras ur /home/ak1a/AK1 (arbetsytan saknar
puppeteer-core — annars ERR_MODULE_NOT_FOUND).

Snittscore **7,4** (269 → 280 poäng / 38 system; B11 +1, D20 +1, E29 +1,
D38 +8).

## UPPDATERING 2026-09-15 (dokvåg s9-u1 — E35 kvalitetssystemet + diff mot verkligheten)

E35 är systemet som rörts mest sedan 2026-09-13 (kvalitetsspåret våg
133/138 + auto-s8). Varje rad nedan är MÄTT i arbetsytan 2026-09-15 under
dokvågen — inte läst ur worklog:

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| `npx tsc --noEmit` | baslinje 34 fel (36 rader) | **0 rader, exit 0** — baslinjen är NOLL sedan våg 133 och hålls mekaniskt av grinden |
| Commit-grind | nämns ej | `verktyg/hooks/pre-commit` AKTIV (`core.hooksPath` verifierad): blockerar ALL commit med tsc-fel eller R2-fil; blockerande-bevisad med 8 isolerade exitkodstester + R2-härdning (.p12/.pfx/.jks/.kdbx/.htpasswd-hålet täppt) — s8-u1, bevis `data/forskning/KVALITETS-GRINDEN-BEVIS-2026-09-15.md` |
| `validera-motorer.mjs` | 107/0/0 (KVD-not 09-13) | **107 PASS / 0 FAIL / 0 SKIP (6,3 s)** — omätten nu, oförändrat grönt |
| Vaktverktyg | kvalitetsvakt + motorvalidering + agent-status | **+ beroende-vakt.mjs** (s8-u2: rotorsak "npm audit körs aldrig"; CRITICAL next 16.3.2 upptäckt, fix 16.3.5 inom intervall) · **+ doda-lankar.mjs** (s8-u3: 3 012 sökvägar, 0 döda, negativt kontrollfall validerar noll) · **+ konfigintegritet-vakt.mjs** (:x9 var 10:e min, E2E-bevisad i sandlåda) · + O5-bältet (prestanda-mat/-lighthouse/-skiftspar, mobil-lasbarhet) · + pumpor-daemon.mjs + agentfabrik.mjs (hör till E29:s värld) |
| Testsviter | "37 st testa-*.mjs" | **33 st** — ingen svit raderad sedan 09-13 (git `--diff-filter=D` tomt), +3 AI-mentor-sviter tillkommit; K1:s "37" ej reproducerbart, korrigeras till mätbara 33 |
| Motorregistret | 2026-09-03, föråldrat | **OFÖRÄNDRAT** — sista commit efff399c 2026-09-03 (git-bevis); gapet kvarstår |
| testa-b2b-grind (E30-referens i E35:s gap) | TRASIG (ERR_MODULE_NOT_FOUND) | **KÖR GRÖNT** (exit 0, samtliga PASS, mätt nu) — importbridgan lagad efter 09-11; E30:s läges-text är inaktuell |

Sidofynd utanför E35 (förs till nästa dokvåg): (a) testa-b2b-grind grönt ⇒
E30 behöver revision av läge + gaplista; (b) gränssnittsvakten cron-GRÖN
0717/176 kombinationer är gällande enligt s8-u1-sonden. Verifierings-
tabellen högt upp (2026-09-11: tsc 36 rader, vakten GUL) är HISTORIK —
KVD-noten 2026-09-13 och denna sektion är det gällande läget.

## UPPDATERING 2026-09-15 (dokvåg s9-u3 — A1 + E27 + E29 diffade mot verkligheten)

Fortsättning på s9-u1:dokvåg (E35): tre system till, varje rad MÄTT i
arbetsytan 2026-09-15 — inte läst ur worklog.

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| Kurser (A1) | 333 kurser, 8 211 quiz, 82 110 XP | **337 kurser, 8 223 quiz, 82 230 XP** — `data/siffror.json` (regenererad 2026-09-15 av rakna-siffror; s5-vågens fyra kurser: balansräkning, DuPont, soliditet/räntetäckning + V-spår 20/20 i kurskartan) |
| Trådens permanens (E27) | ej omnämnd | **kodad och på plats**: `src/app/api/studio/stream/route.ts:175-323` — lasTradHistorik(lasHuvudtradSessioner()) svarar HELA huvudtråden (äldst→nyast) ur zcode:s egna sessionsdatabas; målet återarmas vid GET efter omstart; klientens poll ersätter ALDRIG vyn (v144-mordvapnet bort) — våg 148 |
| Autonomi-pipelinen (E29) | beslutsminnet "påbörjat 2026-09-13" | **25 poster i beslutsminnet, senast rond 30 (2026-09-15 08:49)** · pumpor-daemonen KÖR (ps-bevis: uppe sedan 07:37) · fabriksstatus **25 manifest "klar" + 1 "pågår"** (det pågående = auto-s9, denna dokvåg) · verktyg/{agentfabrik,evighetsmotor,pumpor-daemon,styrelse-rond}.mjs alla på disk |
| Blogg-utkast (C15-sidofynd) | 8 utkast | **11 utkast** i data/blogg-utkast/ (55 publicerade oförändrade) — C15-revision bokförs som kö till nästa dokvåg |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A1 | 8 → **8** (tal rättade) | Kartans tal var fyra kurser gamla; register 333→337 med larvag-synk GRÖN 337=337=337 och siffror.json regenererad samma dag. GAP-listan oförändrad — ingen score-rörelse |
| E27 | LEVER 9 → **LEVER 9** | Trådens permanens (v148) kurerar kundens mest återkommande smärta ("allt försvinner när jag uppdaterar") — i koden nu; skal-kvotens KUR-regler (node-wrappers först, verifiera effekt efter häng) tillagt i gaplistan. Score kvarstår 9: redan toppnoterat, nyheten är ett hållbarhetsbevis |
| E29 | LEVER 7 → **LEVER 8** | Autonomi-pipelinen är nu MEKANISK och driftbevisad: agentfabriken (v146: RAM-vakt 1 500 MB, omgångar om 3, timeout 25 min, leveransbevis per uppgift — 25 klara manifest ÄR driftbeviset), evighetsmotorn (v147: aldrig utan nästa våg), kunduppdragsprotokollet (v156: order jobbas klart + UPPDRAG KLART-kvitto), beslutsminnet tätt (25 poster). Kvar: ingen egen testsvit för fabrikens delar, CRON_SECRET |

Snittscore **7,4** (281 → 282 poäng / 38 system; E29 +1 vid denna dokvåg).

Sidofixar utanför de tre systemen (motbevisade tal, inga scoreändringar):
C18:s "333 kurser" och E32:s "333 / 8 211" rättade till 337 / 8 223 enligt
siffror.json — i övrigt lämnas C15/C18/E32 till nästa dokvåg (u1 bokförde
dessutom E30-revisionen: testa-b2b-grind körs grönt).

## UPPDATERING 2026-09-15 (dokvåg s9-u2 — E37 + E30 diffade mot verkligheten)

Fortsättning på s9-u1/s9-u3-dokvågorna (E35 + A1/E27/E29). Objektval mot
duplikat: E30-revisionen var bokförd som kö av s9-u1 (sidofyndet
"testa-b2b-grind KÖR GRÖNT"), och E37 bär prestandaspårets s7-leveranser
som ingen dokvåg rört. Varje rad MÄTT i arbetsytan 2026-09-15 — inte
läst ur worklog:

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| testa-b2b-grind (E30) | TRASIG (ERR_MODULE_NOT_FOUND) | **33 kontroller, 0 FAIL, exit 0** — mätt nu; flagg/robots/sitemap/noindex-grinden helgrön |
| testa-pro-screening (E30) | okänd status | **26 PASS / 0 FAIL, exit 0** — mätt nu |
| testa-demoklient-data (E30) | okänd status | **16 PASS / 1 FAIL, exit 1** — NYTT FYND: G1 ("minst ett fullständigt AKM2Resultat — 0 st") är RÖD; demoklientens data bär inget komplett AKM2Resultat (fixture/data-avvikelse, ej grindfel) |
| SearchModal-koddelning (E37) | ej omnämnd | **i koden**: spa-hem.tsx:22-24 dynamic-import ssr:false + :145-146 LasyGlobal — overlays-paketet ur startsidans kritiska hydratisering |
| CLS (E37) | ej mätt | **sv-locale 0,000 / 0 skift** (isolationssond — font-roten botad via font-display optional ×4); standardspråk (navigator en-US) ~0,11 kvar = språkresolvens, produktbeslut a/b/c bokat i o5-prestanda-s7.md |
| Prod-prestanda (E37) | ej mätt | **CLS 0,125→0,000, LCP −0,4…−1,4 s, Lighthouse +7–10 poäng** (O5 komplett, bokförd commit 8bbe8215; rådata OPTIMERING/lighthouse/) |
| Mobil läsbarhet (E37) | omätet | **verktyg/mobil-lasbarhet.mjs NY** (CDP, 0 npm): FÖRE 255 tryckmål + 2 zoomfällor på 6 sidor → 8 filer kirurgiskt fixade max-md (header/tema/språk/logga/inloggad/blogg ~30 länkar; zoomfällorna dödade 12/14→16 px); footerns 20 px-länkar m.fl. medvetet kvar (bokade rond 2) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E30 | INAKTIV 5 → **INAKTIV 6** | Testförfallet borta: grindsviten 33/0 + screening 26/0 körs grön (mätt nu) — läget fortsatt INAKTIV (väntar jurist, R2). Nytt gap: demoklient-G1 röd |
| E37 | LEVER 7 → **LEVER 8** | Prestanda nu MÄTBEVISAT: CLS 0,000 (sv), LCP −0,4…−1,4 s, +7–10 poäng; SearchModal koddelad; läsbarhet 52 px mätt + fixad; ny verktygskedja (prestanda-mat/lighthouse/mobil-lasbarhet). Kvar: inga egna regressionstester, språkresolvens-CLS |

Snittscore **7,5** (282 → 284 poäng / 38 system; E30 +1, E37 +1).

## UPPDATERING 2026-09-15 (dokvåg s9-u2:2 — C15 diffad mot verkligheten + C16-sidofix)

C15-revisionen som u3 bokförde som kö ("C15-revision bokförs som kö till
nästa dokvåg"). E30+E37 levererades av den parallella s9-u2-omgången ovan —
mina oberoende mätningar av samma tre sviter (33/0 · 26/0 · 16/1 med G1-rött
ur den tomma berikningscachen) bekräftar den sektionen; E30 lämnas åt den,
inget duplikat här. Varje rad nedan MÄTT i arbetsytan 2026-09-15:

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| Läge B (C15 gap 1) | "obeslutat" | **BESLUTAT 2026-09-07** — ordförandebeslut i STYRELSE-BLOGG-LAGE-B.md: Läge A består som publiceringsväg; full hot-path AVSLAGEN med mätdata (61–76 ms varm statisk mot 240–630 ms/request utan cache; OG-generering + sitemap bygger på filerna på disk; Vercel prod-fs read-only gör B dödfött i ren form) |
| B2-hybriden | nämns ej i kartan (endast API-rutten i nyckelfilerna) | **BYGGD (våg 82 del C)** — hela §D-kontraktet i kod: publiceraMedPaket (src/lib/blogg-utkast.ts:603 — 0-FEL-grinden + blogg_publicerad-event), src/app/api/admin/blogg/publicera/route.ts, knappen "Publicera (skickar till agent)" i blogg-panel.tsx:335 (syns ENBART på granskade utkast) |
| Bloggutkast | "8 utkast" | **Strukturerad köträd**: 11 publiceringsklara JSON i roten + m9-ko/ (3 M9-original) + kvartal/2026-q3/ (13: 10 branschkalendrar + 3 bolagspaket H&M/Ericsson/Volvo Car från s4-vågen) + granskning/ (17 MD + kalender-/diff-JSON) + GRANSKNINGSKO-SAMMANSTALLNING.md = kundens kö-vy (2026-09-14); 55 publicerade i data/blogg/ oförändrade |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| C15 | LEVER 8 → **LEVER 8** | Läge B STÄNGT (beslut 2026-09-07 med mätdata — kartan speglade det inte) och B2-knappen lever i kod; men inga nya tester/E2E-bevis tillkom sedan 09-13 och gap (1) ersätts av B2-E2E + ködjupet. Score oförändrad 8; snittet opåverkat (284 kvar) |
| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp finns (v82); M9-kön ej kopplad + växer KRAFTIGT (124 Kön-filer mätt 09-16 kväll: rot 31 JSON + m9-ko 7 + granskning 53 + kvartal 31 ≈ 2,8×/dygn; 55 publicerade oförändrade; sammanställningen 09-14 åldras); schemalagd re-run saknas |

Sidofynd (förs till nästa dokvåg/dispatch): C18/E32-fullrevisioner kvarstår
som kö från u3 (talen redan rättade där); demoklient-G1 + tmp_*-städning i
PRO-sviterna bokförda av den parallella u2-sektionen.

## UPPDATERING 2026-09-15 (dokvåg s9-u3 omgång 2 — C18 + E32 + C17 diffade mot verkligheten)

u3:s kö fullgjort: C15 togs under mätningen av u2:2 ovan (lämnas orött),
C18 + E32 är köns rester — och C17 tillkom som tredje system när
granskningsköns kvartalsmassa visade sig ostämt i kartan. Varje rad MÄTT i
arbetsytan 2026-09-15 — inte läst ur worklog.

| Mått | Kartan | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| Schema-kurser (C18) | 444/0 (kört 2026-09-11) | **444/0 KÖRT IDAG** — 18 sidor (6 kurser × 3 språk) mot localhost, GODKÄNT |
| Sitemap (C18) | 1 684 URL:er (våg 78-not) | **1 998 URL:er** (mätt mot localhost:s sitemap.xml) — växer med kurser/speglar; dödlänksvakten 3 012 sökvägar / 0 fynd (s8-u3) |
| Sökindex (C18) | "åldras mellan deploys" | **friskt**: public/sok-index.json genererad 2026-09-15, committad i b514fe67 (ren i git) — verktyget KÖRS vid kurstillägg, men kopplingen är manuell disciplin (ingen hook); gapet kvarstår i mjukare form |
| llms + seo.tsx (C18) | llms-txt + llms-full-txt · 809 r | **200 + 200** mot localhost (mätt) · seo.tsx **841 r** (+32 sedan inventeringen) |
| OG-deploy-steg (C18) | manuellt | **fortfarande manuellt** — deploya-contabo.sh saknar og-generate-koppling (grep: 0 träffar); gapet kvarstår |
| siffror.json (E32) | 337/8 223/82 230 (rättat omgång 1) | bekräftad mätt; uppdaterad 2026-09-15 i b514fe67; bär även kanonSomKurs 96 |
| priser.json (E32) | — | **orörd sedan 2026-09-07** (fbfb135f, våg 78) — registret stabilt, speglingsfönstret inte utlöst på 8 dagar |
| siffror-live (E32) | "saknar konsistenskontroll" | kontraktet DOKUMENTERAT i filhuvudet (raknelogiken speglar rakna-siffror EXAKT, per-fält-fallback mot siffror.json, kastar aldrig, NEXT_PHASE-hermetik, 60 s modul-cache) — men ingen aktiv divergensmätning/larm: gapet kvarstår |
| pris-inläsning (E32) | "saknar schema-validering" | Supabase-vägen normaliseras med typade guards (tolkaTal + strängkontroller) + tyst fallback till filvärdena; FIL-vägen (priser.json) fortfarande utan schema-kontroll — gapet kvarstår, nu med nyans |
| Aspektsystemet (C17) | **saknas helt i kartan** | **i kod sedan v150**: /dataset/[bransch]/[aspekt]/page.tsx + dataset-aspekter-kontrakt.ts + 8 moduler (nyckeltal-a/b, pe-pb, omsattning-tillvaxt-ttm, vardering, universum, land) + dataset-aspekt-vy.tsx; /dataset och /dataset/energi svarar 200 (mätt) |
| Kvartalsserien (C17) | "H3 icke-påbörjad" | **src påståendet sant** (0 kvartalsfiler i src, find mätt) — MEN data-pipelinen lever: V152-KVARTALSKARTA.md (4-fasers plan, 2026-09-14) + fas 2–3 LEVERERADE i granskningskön: 10 branschkalendrar + 3 bolagspaket (H&M/Ericsson/Volvo Car) i kvartal/2026-q3 |
| Aspekt-testsviten (C17) | saknas i kartan | **TRASIG i rak node** — testa-dataset-aspekter.mjs dör: "OFÅNGAT FEL: ERR_MODULE_NOT_FOUND: src/lib/ordlista imported from dataset-medianer.ts" (ändelselös relativ import; importbro saknas — samma sjukdom som gamla testa-b2b-grind). Testtäckningen förföll tyst |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| C18 | 9 → **9** | 444/0 bevisat igen idag + llms 200/200 + sitemap 1 998 + sökindex friskt; G1-slutverifieringen (Google rich-results live) återstår — redan toppnoterat, ingen poängrörelse |
| E32 | 8 → **8** | siffror.json färsk + priser.json stabil; konsistenskontroll och fil-schema-validering saknas fortfarande — inga nya bevis som flyttar poängen |
| C17 | 9 → **9** | Två ytor tillkommit som kartan saknade (aspekter i kod, kvartalsdata i kö) MEN aspekt-testsviten är trasig — större yta, tyst testförfall: netto ingen score-rörelse |

Snittscore **7,5** (284 poäng / 38 system — oförändrad av denna omgång; inga
score-rörelser, endast läges- och yträttningar med egna mätbevis).

Dispatch-kö från fynden: (1) **testa-dataset-aspekter.mjs-reparation**
(importbro à la v82-kurs-metadata-bro — tills dess är aspektstatus okänd);
(2) kvartals-H3-src (/kvartalsdata) har nu färdigt underlag: A4-kontraktet +
V152-kartan + 13 Kön-filer.

## UPPDATERING 2026-09-15 (dokvåg s9-u1:4 — A3 AI-Mentorn diffad mot verkligheten)

Fjärde dokvågen (efter u1: E35 · u3: A1/E27/E29 · u2: E30/E37 · u2:2: C15/C16
· u3 omgång 2: C17/C18/E32). A3 valdes mot duplikat: ingen tidigare dokvåg har
rört det, och våg 158 + spår 6:s fabriksomgångar byggde om mentorn grundligt
samma dag. Varje rad MÄTT i arbetsytan 2026-09-15 (svitkörningar, grep, wc,
git log) — inte läst ur worklog:

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| Tester | "ingen test" (gap 2) | **8 sviter, ALLA gröna (mätta nu, samtliga exit 0)**: svars­lagren 26+22+19+33+17+21+26 = **164 PASS / 0 FAIL** + modellagret **38 kontroller** (testa-mentor-modell.mjs: ruttlogik med mock-kakor, felväg 503, dagstak 429, rollback) — rond 37:s "83-testbevis" var mellanläget; tre sviter tillkom efteråt (u2 22, spar6 33, omg2 26, commit 07bc086e "svit 164/164") |
| Frågenivå | 15 kanoniska förhandsfrågor | **31 deterministiska mönster i 4 lager** (bas 23 + extra 3 + makro 2 + nästa 3, grep-räknat i src/lib/ai-mentor-*.ts) — kedja `makro ?? extra ?? bas ?? nästa` i chat-widget.tsx:740; nya ämnen: DCF-inre värde, investmentbolags-NAV, options, ränta, inflation, kapitalstruktur, organisk vs förvärvad tillväxt, rapportläsning, nyckeltal m.fl. |
| Kursregister | "läser ÄKTA data (getCourses)" | **ai-mentor-register.ts (492 r) med maskinbevisad äkthet**: E01 registeräkthet — 343 kurser FÄLT-FÖR-FÄLT identiska med getCourses()-källan (PASS, mätt); --baka-verktyget bakar om registret vid kurstillägg |
| Juridikgrind | "kodad i rutten" (overifierad) | **MASKINTESTAD**: 0 rådsfraser i svars­lagren (G01- och I-tester PASS — ren utbildningsformulering, lagen 2007:528) |
| Determinism | ej omnämnd | **bevisad**: 20 frågor × 2 körningar bitidentiska (D01 PASS); svars­lagren kostar 0 API-anrop |
| Källmärkning | ej omnämnd | källrad + kurslänkar per svar, länkarna verifieras ÄKTA mot registret (F-tester PASS i tre sviter) |
| chat-minne gap 3 | "retention/tömning dokumenteras ej" | **MOTBEVISAT**: filhuvudet dokumenterar MAX_TURER 60 + HISTORIK_FÖNSTER 12-bakåtfönster (mätt i src/lib/chat-minne.ts) |
| H2 gap 1 | "dataset-medianer → mentorsvar overifierad" | **OMSCOPAT**: grundningen skedde via KURSREGISTRET (äkthetsbeviset ovan) + nya modellaget /api/mentor/fraga (143 r: medlemsvakt, generateText, dagstak, rollback); dataset-medianer är fortfarande OKOPPLADE (grep i route/svar/widget: 0 träffar) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A3 | PÅGÅR (H2) 7 → **LEVER 8** | Största gapet ("ingen test") är borta: 164/0 + 38 kontroller mätta nu; determinism, juridikgrind, registeräkthet och källmärkning maskinbevisade; 10X-pelare 9+10 stängda (STUDIO-10X-PROGRAM.md:52). Gamla gapen (2)+(3) motbevisade. Kvar: dataset-koppling, E2E mot levande medlems-API, assistent-panelens egna tester (0 sviter, mätt) |

Sidofix (mätt): kursantalet 337 → **343** — siffror.json bär 343 kurser /
8 223 quiz / 82 230 XP (uppdaterad 2026-09-15) + registerrebaken 570c51ee
("337→343") + E01-äkthetstestet; A1/C18/E32:s tal rättade i ÖVERSIKT och
detaljblocken (förmiddagens dokvågor rättade 333→337 — rebaken kom senare
samma dag; quiz/XP oförändrade).

Snittscore **7,5** (284 → 285 poäng / 38 system; A3 +1 vid denna dokvåg).

---

## UPPDATERING 2026-09-15 (dokvåg s9-u3 omgång 3 — E34 + E33 + E28 diffade mot verkligheten)

Objektval mot duplikat EFTER kollisionskontroll: A3 var förstavalet men
s9-u1:4 diffade det under pågående mätning (commit abac0e0f — filens rader
skiftade mitt i läsningen; s10-u3:s kur om unika objekt tillämpad). Tre
FRIA system med dagens största verklighetsglapp valdes: E34 (spår 10:s tre
DR-leveranser samma dag saknas helt i kartan), E33 (DR-fyndet om
system_events + index-mätningen), E28 (protokollen lever vidare — kartans
fynd refererar 2026-09-10). Varje rad MÄTT i arbetsytan 2026-09-15
(markörvakt-körning, zcat-grep på dumpen, crontab-läsning, node-läsning av
JSON, ls, git log) — inte läst ur worklog:

| Mått | Kartan | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| DR-prov (E34) | "godkänt (20 s, 60 tabeller, 1 187 291 rader)" (v98) | **KVARTALSÖVNING 2026-09-15, tvåoperatörsreplikerbar**: 17,7 s (s10-u2) + oberoende 14 658 ms (s10-u3) i isolerad PG17-skrap-DB; 1 246 728 public-rader (60 public-tabeller = v98 F3:s 60; 95 tabeller / 1 247 119 rader alla scheman); medlemmar 3/3, kurser 10/moduler 122; 780 felrader samtliga kända Supabase-roller (ofarliga, oberoende bekräftade); städning verifierad ×2 |
| Dumpkompletthet (E34) | "nattlig backup-cron verifierad (våg 97)" | **mekaniskt bevisbar**: verktyg/kolla-dump-markorer.mjs (s10-u1 — pg_dump 17:s markörkontrakt + gzip-integritet, 3 sabotagefall gripna) — EGEN körning nu: db-2026-09-15.sql.gz **GRÖN 29,4 MB / 1 267 803 rader / CREATE TABLE 95 / COPY 97 / 6,7 s / exit 0**; baslinje 5/5 på db-2026-09-{11..15} |
| Retention (E34) | backup till dator-valvet (10 per-typ-snapshots) | **30-dagar MEKANISERAD i server-cron-raden** (crontab mätt: find -mtime +30 -delete på data/backups/supabase) — 5 dumpar på disk (11–15 sep) |
| system_events i SQL-dumpen (E33) | "senaste-vinner-mönstret, INGEN DDL krävs" | **COPY 0 rader i dumpen** (s10-u2 utrett i återställd DB: ingen tabell/vy bär händelseloggen; konfirmerat av s10-u1) — händelseloggens DR-väg är MOLN-JSON-backupen; SQL-dumpen ensam återställer den inte (komplett DR = båda kedjorna, dokumenterat i DRIFTSBOKEN) |
| Composite-index (E33 gap 3) | "installerat? — oklart" | **MÄTT EJ INSTALLERAT**: zcat-grep på dumpen 2026-09-15 ger 0 CREATE INDEX på public.system_events — enda träffen är RLS-policy p18 (FOR INSERT WITH CHECK true); ALTER-system_events-composite.sql ligger kvar okört i data/sql/ |
| Inventory (E33) | data/supabase-inventory.json som nyckelfil | **23 dagar gammal** (generatedAt 2026-08-23T03:21; totalTables 362, totalRows 17 711 048) — manuell avtappning, ingen auto-refresh |
| Översättningskö (E33 gap 1) | "fallback-kön 320 poster säger nej" | **fortfarande 320** (240 vantar-motor / 71 publicerad / 9 maskinutkast-behovar-granskning) — kön ACKUMULERAR: publicerade rensas ej ur filen |
| Styrelseprotokoll (E28) | "senaste protokollen (2026-09-10) … 'Åtgärder: (inga)'" | **filen lever till 2026-09-15 07:55 med FYRA nya möten**: 09-13 10:48 + 20:19, 09-14 22:57 (MEGA-SYSTEMBESLUT, kundens direkta direktiv), 09-15 05:17 (FULL DELEGATION) — Åtgärderna bär INNEHÅLL i alla fyra ("(inga)" bara i 09-10-mötena): "R2-verkställningen får inget att verkställa" är motbevisat för 09-13→09-15 |
| JSON-syntesen (E28 gap 1) | "Automatisk syntes … kunde ej tolkas som JSON" | **fortfarande levande i SENASTE mötet** (09-15 05:17 bär fallback-raden, 3 organ den gången) — kärnfelet ej botat; läget bättre än kartan men FLAGGAN kvarstår |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 9 | Artefaktverifierings-GRINDEN lever i båda deploy-länkarna (svit 12/12 + frisk grön prod-mätning egen, mätt 09-16 kväll) — incidentens rot-gap STÄNGT; DR-mallen ETT KOMMANDO (dr-total 130,0 s + kirurgi-kedja 5); crontab-kurer GENOMFÖRDA (pgpass + markörvakt mätt i användar-crontaben — /etc/crontab var fel källa); kvar: hybrid-sync, ISR 12/44, Storage-restore, system_events-återimport (E33) |
| E33 | LEVER 8 → **LEVER 8** | Fynden preciserar snarare än stänger: system_events DR-väg = moln-JSON (SQL ensam räcker ej — dokumenterat), composite-indexet mätt EJ installerat (gap 3: "oklart" → bekräftat öppet), inventory åldras manuellt, kön 320 ackumulerande. Ingen score-rörelse — kunskap tillförd, inga gap stängda |
| E28 | FLAGGA 6 → **FLAGGA 6** | Lägesrättning med egna mätbevis: protokollen lever (4 möten sedan kartans mätning, åtgärder med innehåll, kundens mega-beslut + fulla delegation protokollförda och verkställda i vågorna 146–158) — men ordförande-JSON-fallbacken lever i senaste mötet: gap 1 kvarstår, FLAGGAN kvarstår |

Snittscore **7,5** (285 → 286 poäng / 38 system; E34 +1 vid denna dokvåg).

Kö till huvudagenten från fynden: (1) s10-u1:s crontab-radbyten (markörvakts-
append `&& node verktyg/kolla-dump-markorer.mjs --natt` + pgpass-kuren —
crontab mätt: raden slutar fortfarande efter find-delete och bär db-lösenordet
i klartext, värdet återges aldrig här); (2) composite-indexet
nu mätt obehandlat — kör ALTER-system_events-composite.sql vid nästa
DR-fönster (prestanda vid växande event-tabell); (3) E28 gap 1 (JSON-reparatur
eller strukturell prompt) lever — styrelsens syntes faller fortfarande till
fallback (senast 09-15 05:17).

## UPPDATERING 2026-09-15 (dokvåg s9-u2 omgång 3 — E31 + E26 diffade mot verkligheten)

Objektval mot duplikat EFTER kollisionskontroll (tre syskon diffade
SYSTEMKARTAN under dagen: u1:4 tog A3, u3 omgång 3 tog E34+E33+E28 medan
denna agent mätte — deras trädrättningar lästes och lämnas orörda). Fria
system med mätbar drift valdes: E31 (kartans röda MÖS-motorfynd mot dagens
verklighet) och E26 (mega-beslutets spår 1–2 — godkännandeytan + audit +
mekanisk juridikgrind — saknas helt i kartan). Varje rad MÄTT i arbetsytan
2026-09-15 (svitkörningar, vaktexekvering, ls/grep, node-läsning av JSON) —
inte läst ur worklog:

| Mått | Kartan | Verkligheten 2026-09-15 (mätning) |
|---|---|---|
| MÖS i motorvalideringen (E31) | "FAILAR MÖS-kontrollen — ordgräns 5000/anropstak 400 … en av två röda som håller vakten GUL" | **107 PASS / 0 FAIL / 0 SKIP (10,8 s) — KÖRD I DENNA DOKVÅG**: MÖS-fasen passerar (termbankens garanti-kontrakt, termKonsistens, sifferIntegritet — deterministiska kärnor utan nät). Båda 09-11-röda (B11-determinism + MÖS) är borta sedan 09-13 — kartans fynd är historik |
| Översättnings-fallback-kön (E31) | 320 poster | **320 oförändrat** (mätt) — men ACKUMULERANDE enligt u3 omgång 3:s E33-brytning (240 vantar-motor / 71 publicerad / 9 granskning): publicerade rensas ej ur filen |
| I1-kvalitetsaudit (E31) | "PÅGÅR enligt rankningen" | **0 artefakter i data/forskning/** (ls mätt — ingen MÖS/I1/översättnings-audit-fil): auditen opåbörjad, PÅGÅR (I1) korrekt läge |
| Tier-spegelgap (E31 gap 4) | "tier-sidor D23 saknar speglar" | **kvarstår** (ls mätt: src/app/en/portfolj-grund och src/app/ar/portfolj-grund existerar ej) |
| Godkännandeytan (E26) | saknas helt i kartan | **BYGGD (mega-beslut spår 1)**: src/app/api/studio/godkannande/ (route + publicera) — requireAdmin på ALLA metoder, atomär val-fil (data/vakten/godkannande-val.json), endast "behåll"-val här; publicera-rutten = kundens R2-knapp med audit-rad (aktör "kund") + mekanisk juridikgrind kopplad (v168 integration-audit p4: kontrolleratextRad före publicering) |
| Audit-megasystemet (E26) | saknas helt | **LEVERANDE**: src/lib/studio/audit-logg.ts + data/vakten/audit-logg.jsonl **68 677 byte aktiv** (mätt) — append-only spårbarhet för autonoma aktörer (mega-beslut spår 2) |
| Mekanisk juridikgrind (E26) | saknas helt | **verktyg/juridikgrind-vakt.mjs KÖRD nu (exit 0)**: status GUL — 0 FEL / 8 VARNING, larmfil data/vakten/juridik-larm.json (senasteKörning 16:56); FLYTTKLAR-strängen i 21 utkastfiler (grep mätt; mega-beslutet räknade 14 — kön växer) |
| GDPR-datakartan (E26) | saknas | **data/forskning/GDPR-DATAKARTA.md LEVER på disk** (mega-beslut åtgärd 7) |
| Admin-paneler (E26) | "15 paneler" | **16 komponenter** i src/components/ak1a/admin/ (mätt; organ-panel tillkommen sedan inventeringen) |
| Admin-sessionssviten (E26) | "14/14 (vid inventeringen)" | **14/14 KÖRD GRÖN nu** (mätt i denna dokvåg) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E31 | PÅGÅR 7 → **PÅGÅR 7** | Observationsrättning med eget mätbevis: motorvalideringens MÖS-röd är BORTA (107/0/0 mätt nu) — "en av två röda som håller vakten GUL" är historik från 09-11; kön 320 och tier-spegelgapet kvarstår, I1-auditen opåbörjad. Ingen score-rörelse — rättningen speglar en fix som levererades FÖRE dokvågen (09-13); kartan var inaktuell (samma precedens som C15/C16) |
| E26 | LEVER 8 → **LEVER 8** | Yttillväxt utan poäng: godkännandeytan + audit-loggen + juridikgrind-vakten + GDPR-kartan lever (mätt i kod/disk/körning) men publicera-vägen är E2E-overifierad (R2-knappen är kundens — orörd av princip), juridikvakten ger 8 FP-VARNINGAR (ordlistan träffar meta-texter som CITERAR förbudsorden), gamla gapen (manuell spegling, Elliott-test, IP-block) kvarstår |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg; inga
poängrörelser, endast läges- och yträttningar med egna mätbevis).

E28-tilläggsfynd (syskonet u3 omgång 3 diffade E28 medan denna agent mätte —
deras not håller FLAGGA 6 med lägesrättning; mina tre MÄTTA fynd saknas där
och bokförs som kö, E28-blocket lämnas åt dem): (1) **testa-styrelse.mjs är
RÖD mot härdad prod** — dör POST 401 "Admin-lösenord krävs
(x-admin-password)" (0 PASS, mätt nu): rutten härdades efter våg 91:s
mock-test, sviten följde inte med; (2) **styrelse-rond-cronen 2 av 4
sändningar FEL idag** (11:43 + 14:43 fetch failed, 3 försök vardera,
data/vakten/styrelse-rond.log) — sammanfaller med RAM-svält-fönstret
13:17–14:42 och syns ENDAST i loggen (F6-larmvägen täcker mal-hjärtat, ej
ronden); (3) **beslutsminnet 32 poster** (mätt; ronder 33–37 med landat-
commits 6ea6acda…19a8e8e1) och parse-räntan **3 av 4 möten sedan 09-13**
(mega-beslutet 09-14 parsat helt — verklig ORDFORANDE-JSON i protokollet).

Bekräftelserad: u1:4:s A3-sektion (PÅGÅR 7 → LEVER 8) stämmer med egna
oberoende körningar — de fyra våg-158-lagerna 83 PASS 0 FAIL + modellagret
38 kontroller gröna (identiska tal; mätt innan deras commit upptäcktes).

Dispatch-kö från fynden: (1) testa-styrelse.mjs anpassas till härdade
rutters admin-session (motorstatus är idag driftbevisad, ej svitbevisad);
(2) rond-cronens fetch-fel får larmväg; (3) juridikgrindens ordlista lär
sig skilja meta-texter (citat av förbudsorden) från faktiska råd — 8
FP-VARNINGAR idag; (4) E26 publicera-E2E bevisas vid kundens första
knapptryckning (R2 — orgens ansvar är att audit-loggen fångar den).

---


## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 4 — A2 + B9 + E36 diffade mot verkligheten)

Fjärde dokvågen under s9-u3-uppdraget (duplikat undveks: 17 system redan
diffade 2026-09-15 av dagens syskon — E35, A1, E27, E29, E30, E37, C15,
C16, C17, C18, E32, A3, E34, E33, E28, E31, E26; tre FRIA system valdes).
Mätt 2026-09-15 22:08 UTC — varje rad MÄTT i arbetsytan (svitkörningar,
API-sonder mot localhost, node-läsning av JSON, grep, git log), inte läst
ur worklog:

| Mått | Kartan | Verkligheten (mätning) |
|---|---|---|
| H1-läge (A2) | "PÅGÅR (H1) … statusrevision ej avslutad" | **STÄNGT sedan våg 99** — STYRELSE-ADMIN-MEGA.md:949 "H1 LÄRVÄGS-SYSTEMET KLART (front B): statusrevision av B1-LARVAG + fullbordan … visas på min-sida" (2026-09-11); kartan speglade aldrig beslutet |
| Lärvägs-register (A2) | 333 kurser (inventeringens tal) | **352 kurser** — siffror.json (mätt): s5-spåret + mx-vågorna byggde 19 kurser under 09-15, sista kvällen 343→352 (fortsättningskurser med FRONT B-bevis 3/3 + 5/5 GRÖNA mot riktiga motorn via importbro, commits 0fb0a5b8/02a35507); quiz 8 223 oförändrat — nya kurser bär inga quiz |
| Lärvägs-paritet (A2 gap 1) | "ingen egen testsvit" | **larvag-synk.mjs GRÖN (egen körning, exit 0)**: register 352 = karta 352 = konstant 352, profiler 21 kurser, 0 fantomer — maskinell paritetsvakt; regressionssvit för raknaLarvag-reglerna saknas FORTFARANDE (mätt: 0 testa-larvag*) |
| Min-sida-synlighet (A2 gap 3) | öppen ("bekräftas E2E") | **KODAD**: min-sida.tsx:22 importerar LarvagKort, :857 renderar `<LarvagKort antal={1} />`, :917 "Nästa kurs på vägen" — E2E med levande inloggning fortfarande overifierat |
| Vågskanningen (B9) | "daglig autonom vågskanning av 12 tickers" | **FÄRSK men Vercel-driven**: senaste vågskans genererad 2026-09-15T05:05:22Z (/api/vagscan/senaste, mätt — matchar vercel-cron 0 5 * * *), universum exakt 12 tickers (listan mätt); FYND: Contabo-crontaben saknar vagscan — den dagliga skanningen drivs ENDAST av passiva backup-miljön |
| Vagvalideringsrapporten (B9) | (kartan bär ingen ålder) | **SENASTE 12 dagar gammal**: domar 2026-09-04 (träff 52 %, nDomda 48, rullandeSedan 09-04), spegelfilens mtime 09-10 16:33; /api/data/vagstatistik lever (mätt) men serverar åldrad rapport — Vercel read-only fs kan inte förnya filen på disk |
| Träff-% publikt (B9 gap 3) | "redovisas ej på publik utbildningssida" | **BEKRÄFTAT MÄTT**: 0 konsumenter i src/components + (huvud)-sidor (grep) — API-rutten lever men ingen sida visar talet |
| Vågmotorssviten (B9) | "testsvit finns" | **57/57 PASS (egen körning, exit 0)** |
| Mediebibliotekssviten (E36) | 18/18 (vid inventeringen) | **18/18 GRÖN (egen körning, exit 0)** + kontrakt A7 REN (SVG-förbud, 2 MB-tak, magic-byte, uuid-nyckel, hermetik) |
| OG-koppling (E36 gap 1) | "manuellt; guide finns" | **fortfarande manuellt (mätt)**: deploya-contabo.sh 0 og-generate-träffar (grep); senaste manuella leverans 023e9f95 09-09 (8 OG-bloggbilder, md5-bevisade); 404 OG-filer committade i git (ls-files) |
| Media-backup (E36) | nämns ej | data/backups/media-filer-2026-09-{08,09}.json — 2 tillfällen, ingen cron (bucket-förteckningen förnyas manuellt) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A2 | PÅGÅR (H1) 7 → **LEVER 7** | H1 stängt sedan våg 99 (dokumentbevis) + registret vuxit 333→352 med front-B-bevis per kurs + paritetssynken GRÖN 0 fantomer + min-sida-visning kodad. Score 7 kvar: regressionssviten för rekommendationsreglerna (största gapet) saknas fortfarande |
| B9 | LEVER 8 → **LEVER 8** | Skanningen lever dagligen (färsk tidsstämpel mätt) men två preciseringsfynd: driftberoendet av passiva Vercel-cron (nytt gap) + valideringsrapporten åldras (12 d) medan API:t serverar den — inga gap stängda, ingen score-rörelse |
| E36 | LEVER 9 → **LEVER 9** | Säkerhetstätaste sviten fortfarande grön (18/18 mätt nu); OG förblir manuellt disciplinsteg (mätt, 09-09-leveransen bevisar att disciplinen hållit) — oförändrat toppscore, gap-listan kompletteras med backup-cadans |

Snittscore **7,5** (286 poäng / 38 system — oförändrad; inga poängrörelser,
endast lägesrättning A2 PÅGÅR→LEVER samt preciserade gap med egna mätbevis).

Kö till huvudagenten: (1) vagscan + vagvalidering speglas till Contabo-cron
(eller pumporna) — den dagliga vågskanningen dör tyst om Vercel-speglingen
dör; (2) SENASTE-valideringsrapporten förnyas (domar 09-04) + publik yta
för träff-%:en (52 % är plattformens läromärke, osynligt idag); (3) A2:s
regressionssvit (raknaLarvag-reglerna) — synken + front-B-bevisen är
leveransbevis, inte regressionsvakt.

## UPPDATERING 2026-09-16 (dokvåg s9-u1 omgång 5 — B7 AKM2-analysmotorn diffad mot verkligheten)

Femte u1-dokvågen (efter u1: E35 · u1:4: A3; syskonen tog resten — senast
u3 omgång 4 med A2/B9/E36 = 21 av 38 system diffade på fyra dagar). B7 fritt
vid kollisionskontrollen och valt med omdöme: S2-spåret växte bolagsuniversum
till 115 och analysdatakedjan är motorns livnerv. Varje rad MÄTT i arbetsytan
2026-09-16 (fyra svitkörningar + motorvalidering, live-fetch-svep mot
localhost på samtliga 22 bibliotekssidor, node-läsning av JSON, ls/grep,
git log) — inte läst ur worklog:

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Egna testsviter | "dokumenterade och testade i fyra separata sviter" | **156 kontroller ALLA GRÖNA (egna körningar, exit 0)**: kärna 25/25 · dynamik 55/55 · moduler 64/64 · snapshot 12/12 — och motorvalideringen **107 PASS / 0 FAIL / 0 SKIP (6,0 s, egen körning, rapportfilen omskriven)** |
| Snapshot-sviten | miljökänslighet okänd | **ENV-LÄCKANDE**: med ärvt Supabase-env failar kontroll 11 (11/12, **exit 1**); i ren env (`env -i`) 12/12 exit 0 — svitfel EJ kodfel (kontrollens "giltigt utan env ⇒ 'ej konfigurerat'" krockar med satt env); sviten rapporterar alltså rött i agentmiljö och grönt i ren miljö utan att skillnaden syns någonstans |
| Berika-pipeline | "manuell pipeline — ingen autonom berikning" | **STILLASTÅENDE 12 DAGAR**: kor-akm2-berika senast körd 2026-09-04 (commit 4b98cd15 "100 akm2-cacher"); data/cache bär **0** akm1-/akm2-/fvag-/fundamental-cacher — våg 122 rensade 405 runtime-filer ur git 2026-09-13 och sedan dess har endast 7 sporadiska on-demand-filer återkommit (tidsstämplar 01:19–23:19; ingen 06:00-cronfyllning — datacache-cronen ropas ej från Contabo-crontaben, mätt) |
| AKM2-dashboard live | "on-demand-beräkning" | **22/22 SYNS** (egen fetch-svep mot localhost, BUILD_ID 2026-09-15 23:58): analysfilernas akm2-block godtas av steg 1:s formguard (källa "analys-json", i git) — cache-tomheten syns EJ här; kodkommentaren "D2:s sammanfattande block har inte den formen" är MOTBEVISAD av live-beteendet |
| AKM3-ensemble live | ej i B7-kartan | **0/22 SYNS** (samma svep): akm3-cacher 0 + fundamental-cacher 0 på disk ⇒ hamtaAkm3ForAnalys null ⇒ "ensemble-vyn renderas ej" på alla 22 bibliotekssidor — konsumentfynd som främst hör hemma i B8 |
| Återfyllningsväg | okänd | fundamental-{TICKER}.json + akm3-cacher skrivs av cron/portfolj-uppfoljning (månadens 1:a, senaste 2026-09-01) — nästa automatiska återfyllning **2026-10-01**; akm2-cacherna har ENBART kor-akm2-berika (manuell = i praktiken aldrig) |
| Analysbanken | "analyser per ticker + variabel" | **två skilda lager (mätta)**: data/analyses = 11 premiumanalyser (2026-09-10, aldrig fler i git-historien) · data/forskningsbiblioteket = 22 tickerunderlag (versionsdatum 2026-09-04) vars akm2-block är AKM2-livlinan — våg 56:s "22 analyser med akm2-block" avser dessa |
| Snapshot-persistens | (09-13-not) | 100 skrivna + idempotenta 2026-09-09 (023e9f95) via system_events, tak 2 000 rader — E33:s fynd gäller fortfarande (SQL-dumpen bär ej händelseloggen; DR-vägen är moln-JSON-kedjan) |
| Motorregistret | 2026-09-03 (gap 3) | **fortfarande oförändrat** (bekräftat av s9-u1-mätningen 2026-09-15) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B7 | LEVER 9 → **LEVER 8** | Kärnan förblir kodbasens finaste (156 kontroller + 107/0/0, egna körningar) men DATAKEDJAN nåddes av verkligheten: berika-pipelinen stillastående 12 dagar, on-demand-kedjans steg 2+3 tomma på disk, datacache-kontraktets "accelerator, aldrig beroende" håller i prod ENBART tack vare analysfilernas git-trackade block (AKM3 hade ingen sådan livlina — 0/22), snapshot-sviten env-känslig. Driftgapet nådde konsumentytan = inte 9-läge |

Snittscore **7,5** (286 → 285 poäng / 38 system; B7 −1 vid denna dokvåg).

Kö till huvudagenten från fynden: (1) **AKM3-ensemble-vyn borta 22/22** —
snabbaste kur: trigga cron/portfolj-uppfoljning manuellt (skriver
fundamental- + akm3-cacher) eller kör kor-akm2-berika; annars självläker det
2026-10-01 — B8-dokvåg verifierar; (2) snapshot-sviten bör köras med `env -i`
i vakten ELLER kontroll 11 villkoras mot ärvt env; (3) berika-pipelinen
behöver cadans-vakt/cron-koppling — "manuell" visade sig betyda "aldrig" i
praktiken; (4) akm2-onsdemand-kommentaren om blockformen revideras
(formguarden GODTAR sammanfattande block — dokumentationen motbevisad av
live-mätningen); (5) datacache-kontraktet bör skilja "accelerator" (de fyra
datacache-typerna) från "enda källan" (akm2-onsdemand steg 2+3, akm3) i text.

## UPPDATERING 2026-09-16 (dokvåg s9-u2 2/3 — A6 + B14 diffade mot verkligheten)

Elfte dokvågen (efter u1: E35 · u3: A1/E27/E29 · u2: E30/E37 · u2:2: C15/C16 ·
u3 omg 2: C17/C18/E32 · u1:4: A3 · u3 omg 3: E34/E33/E28 · u2 omg 3: E31/E26 ·
u3 omg 4: A2/B9/E36 · u1 omg 5: B7). Objektval mot duplikat EFTER kollisions-
kontroll: denna agents första val (A2 + E36) togs av syskonet s9-u3 omgång 4
medan mätningarna pågick (filens rader skiftade mitt i redigeringen — s10-u3:s
kollisionskur tillämpad, se korsvalideringen nedan); A6 + B14 är FRIA system
med färsk drift: mx2 fullbordade bibliotekets läspaketsserie 23:59 och B14
delar cron-familjen med syskonets B9-fynd. Varje rad MÄTT i arbetsytan
2026-09-16 (ls/node/grep, /etc/crontab-läsning, .env-NÄRVARO mätt utan värden,
git log) — inte worklog:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Kvartalsläspaketen (A6/C16-vy) | "13 Kön-filer (10 kalendrar + 3 bolagspaket)" | **22 filer: 10 branschkalendrar + 12 bolagspaket** (ls mätt) — s4-vågen fyllde serien över hela analysbiblioteket, mx2 täppte de tre sista hålen (AZN/EVO/PREC 23:59): SAMTLIGA 11 bolag i data/analyses har paket (en-till-en mappat, node-mätning) + Nordea som tolfte paket UTAN AKM2-analys i data/analyses (lucknotis i paketet, ärligt redovisad) |
| Ticker-täckning (A6 gap 2) | "forskningsbibliotekets täckning vs analysbanken synkas manuellt" | **nästan disjunkta universum** (mätt): forskningsbiblioteket 22 tickers (BSX … VZ, mest USA/multinationella) mot data/analyses 11 (svenska AKM2-bolag) — överlapp endast 2 efter normalisering (HM-B, INDU-C); gapet är en universum-fråga, inte en synk-fråga |
| Verktygskedjan (A6 gap 1) | "integrera/fixa/lägg-till-källa" | alla tre på disk (mätt): integrera-bokmaster.mjs + fixa-tabeller.mjs + **lagg-till-kalla.mjs** (ÖVERSIKT-raden bar namnfelet "källa"); fortfarande manuell, ingen lint-dörr — gapet kvarstår |
| A6-testsviter | (ej påstått i kartan) | **0 egna sviter** (grep mätt — testa-mediabibliotek hör till E36) |
| Bokmaster/kanon | 103 / 102 | bekräftat via siffror.json (103 / 102 / kanonSomKurs 96, mätt) — oförändrat; upphovsrättsgranskningen lever på disk |
| Nyhets-cronen (B14) | "daglig scan-cron 08:00" | **DUBBEL drivning mätt**: /etc/crontab (root) kör /api/cron/nyheter 08:00 LOKAL (= 06:00 UTC; serverns TZ = Europe/Berlin, mätt) + vercel.json /api/nyheter/scan 08:00 UTC (= 10:00 lokal) — två andetag per dag |
| Cron-härdning (B14/E29) | "CRON_SECRET vaktar endast OM satt" | **EJ SATT** (närvaro mätt i .env*: 0 filer bär variabeln — värdena aldrig lästa): rutten är publik; Contabo-curl:en utan secret passerar |
| Scan-kontraktet (B14) | (ej dokumenterat i kartan) | läst i koden: 12-tickers-universum hårdkodat (samma lista som vagscan/datacache), påverkans-tröskel 70, max 5 signaler per scan på signal-bussen + OrganEvent-rapport, maxDuration 60, "ALDRIG krascha" |
| Nyhets-testsviter (B14 gap 1) | "ingen testsvit alls" | **bekräftad mätt** (0 nyhet*-verktyg i verktyg/) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A6 | LEVER 7 → **LEVER 7** | Yttillväxt med mätbevis (läspaketserien fullbordad 11/11 + Nordea tolfte) — men materialet lever i granskningskön (C16/C17:s publiceringsväg) och universum-preciseringen tillför kunskap utan att stänga gap: verktygskedjan förblir manuell, 0 egna sviter — ingen poängrörelse |
| B14 | LEVER 6 → **LEVER 6** | Dubbel cron-drivning + CRON_SECRET-läge + scan-kontraktet mätta (kunskap tillförd, E33-precedensen) men inga gap stängda: 0 sviter kvarstår, fallback-vägarna förblir otestade |

Snittscore **7,5** (285 poäng / 38 system — oförändrad av denna dokvåg;
B7 −1 togs parallellt av syskonet s9-u1 omgång 5 samma natt).

**Korsvalidering av syskonen (deras sektioner orörda, ärlig bokföring):**
(1) s9-u3 omgång 4:s B9-fynd "Contabo-crontaben saknar vagscan" är MOTBEVISAT
— /etc/crontab rad 5 kör cron/vagscan 06:30 lokal (= 04:30 UTC; mätt; ANVÄNDAR-
crontab är tom, vilket troligen gav fel källa). Deras mätta tidsstämpel
05:05:22Z förblir förklarlig: Vercel (05:00 UTC) överskrider Contabos 04:30 UTC
en halvtimme senare — BÅDA drivarna kan leva. ÖVERSIKT-radens "ENBART
Vercel-cron-driven" rättad här; deras kö-item lever dock för vagvalidering (den
SAKNAS verkligen på Contabo — mätt: crontaben bär vagscan + nyheter +
portfolj-uppfoljning + halsa, ingen vagvalidering). (2) deras E36-rad "OG-
koppling manuellt kvar" NYANSERAS av denna agents samtidiga mätningar:
GENERERINGEN är manuell (instämmer — deploy-skriptet bär 0 og-träffar), men
KOPPLINGEN i kod är konventionsbaserad och automatisk — ogBildForPath-mönstret
i seo.tsx + blogg-speglar.ts:308-318 väljer /og/blogg/{slug}.png med AUTOMATISK
fallback /og/blogg.png; aktuell paritet 55/55 (alla 55 poster har PNG, 0
saknade/0 extra, node-mätning) och nyaste postens OG serverar 200 på prod
(24 856 byte, curl) — manus krävs för genereringen, inte för kopplingen.

Sidofixar (motbevisade tal, inga poängändringar): kursantalet 343 → **352** i
A1-detaljblockets Vad-rad (syskonet rättade ÖVERSIKT-raden men inte detaljen),
E32:s siffror-rad och C18:s G1-formulering (352×3); kvartalsantalet 13 → 22 i
C15/C16/C17 (ÖVERSIKT + detaljblock); rubrikens uppdateringsdatum → 2026-09-16.

Kö från fynden: (1) Contabo-cronernas verkliga exekvering loggbevisas (curl
till /dev/null + ingen request-loggning ⇒ körbarheten är crontab-bevisad, ej
körbevisad — en loggrad i rutten eller pm2-spaning vid 04:30/06:00 UTC);
(2) A6-universumfrågan till styrelsen: 22 mot 11 tickers med endast 2 gemensamma
— medveten utbildningsbredd eller gap?; (3) NDA-SE-analys underbygger Nordea-
paketet (12:e paketet utan analysunderlag).

## UPPDATERING 2026-09-16 (dokvåg s9-u2 omgång 5 — D20 + D38 diffade mot verkligheten)

Tolfte dokvågen (uppdragstexten "2/3" identisk med omgång 4:s — 2 FRIA system
valda efter kollisionskontroll: 23 av 38 redan tagna av spårets dokvåger,
D22/D23 lämnas av princip (VÄNTAR på kundens R2-beslut), inga syskonfönster
öppna på dessa sektioner). Varje rad MÄTT i arbetsytan 2026-09-16 — kodläsning,
git-datering, testkörning, prod-sond — aldrig worklog-läsning.

| Mått | Kartan 2026-09-13 | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Återställ lösenord (D20 gap 3) | "flödet saknas helt (GoTrue stödjer det)" | **MOTBEVISAT — flödet är KOMPLETT i kod**: medlem-inloggning.tsx läge `"glomt"` (UI-växel "Glömt lösenord?", neutral text "om kontot finns skickar vi en återställningslänk", knapp "Skicka återställningslänk") · /api/medlem action=glomt → POST /auth/v1/recover · EGEN rate-limit 5/IP/min (glomtAnrop-Map) · medlem-auth.ts:372–382 recover-kontrakt med neutral talkart (kontoexistens läcks aldrig). Daterat d83915fb 2026-09-11 22:09 (våg 101 K2/K3) — K1:s 452-radsläsning föregick commiten samma kväll; kartans "kvar"-not var inaktuell från början |
| E-postverifieringsläget (D20-not "oklart") | "av/på — oklart i UI" | **BESVARAT: verifiering är PÅ och säkerhetsmedveten** — GoTrue `email_not_confirmed` mappas till felkod `"ej_bekraftad"` (medlem-auth.ts:204–229) ENDAST när e-post+lösenord var korrekta (inexistens läcker aldrig), egen UI-text + rate/natverk utskiljda som typade felkoder |
| medlem-auth.ts | 452 r | **556 r** (glomt-kontrakt + felkodsgrenar; växten = våg 101:s K2/K3, ingen rörelse sedan) |
| Testsviten | "17/17 gröna" | **17/17 GRÖN körd nu** (10 s) — MEN 0 träffar på glomt/recover: återställningsgrenen är OTÄCKT av sviten (nytt preciserat gap) |
| E2E-svit (D20 gap 2) | saknas | **saknas fortfarande** (mätt: verktyg/ bär endast testa-medlem-auth + testa-medlem-progress) |
| Prod /logga-in | — | **200** (loopback-sond) |
| Navet D38 — kodrörelse sedan 09-13 | (senaste leverans våg 120) | **Ingen funktionsrörelse**: endast LarvagKort-läsbarhetsrader ≥52 px (3d25e4f5) + /min-sida revalidate=3600 (årlåskuren b77699ba) + (huvud)-layoutens prefetch-kur (184c6dc7) träffar ytan — kosmetik/cache, inga gap |
| D38 gap 2 — API-texter | "pass.namn-API-texter svenska" | **LEVER (mätt)**: bevakning + portfolj-rutter svarar svenska feltexter i ALLA grenar ("Inloggning krävs." 401, "För många anrop — vänta en minut." 429) |
| D38 gap 4 — förhandsfyllnad | "antal/kurs kunna förhandsfyllas" | **LEVER (mätt)**: 0 träffar på förhandsfyllning i portfolj-navet.tsx; våg 120:s one-click lämnar antal/kurs valfria (kommit-meddelandet "antal/kurs valfria senare" = medvetet designläge) |
| D38 gap 1 — E2E | "inga egna E2E-tester" | **saknas fortfarande** (mätt: 0 navet-sviter i verktyg/) |
| Prod /min-sida | — | **200 på loopback OCH HTTPS** |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| D20 | LEVER 7 → **LEVER 8** | Det namngivna huvudgapet (återställ lösenord) är STÄNGT med säkerhetsdesign (neutral talkart, egen rate-limit, GoTrue-recover) och verifieringsläget är besvarat i kod — mätbart, inte påstått. Sviten grön 17/17. Kvar: E2E-svit + glomt-grenens testtäckning (0/1 recover-kontroller). A3-precedensen: score stiger när mätbart huvudgap stängs |
| D38 | LEVER 8 → **LEVER 8** | Kunskap tillförd utan gaprörelse (E33/B9-precedensen): svenska API-texter + förhandsfyllnad + E2E-bristen MÄTTA och lever; R2-tier-ytan orörd av princip; prod 200. Ytans cache- och läsbarhetskurar tillhör E37/o13:s värld, inte navets gap |

Snittscore **7,5** (285 → **286** poäng / 38 system; D20 +1 — första poängrörelsen
på tre dokvåger).

Kö från fynden: (1) glomt-grenen in i testa-medlem-auth (recover-mappning +
neutral talkart är rena funktioner — sviten stubbar nätverket redan);
(2) D38:s API-texter in i nästa motorpipeline-översättningssväng (pass.namn).

## UPPDATERING 2026-09-16 (dokvåg s9-u1 omgång 6 — B8 AKM3 diffad mot verkligheten)

Sjätte u1-dokvågen (25 system diffade av spårets dokvåger — senast s9-u2
omgång 5 med D20/D38 i ccb18a32, upptäckt som trädskifte under pågående
mätning; deras sektion orörd här). B8 fritt vid kollisionskontrollen och valt
med omdöme: B7-dokvågens kö sade uttryckligen "B8-dokvåg verifierar" (AKM3-
ensemble-fyndet). Varje rad MÄTT i arbetsytan 2026-09-16 (svitkörning,
node-läsning av JSON-loggar, /etc/crontab + vercel.json-läsning, grep i src,
live-curl mot localhost + API-sond) — inte läst ur worklog:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Testsviten | "Kärnor + testsvit + cron finns" | **55 kontroller / 55 PASS / 0 FAIL, exit 0** (egen körning) — sviten täcker episoder/faser, osatt-pool, hash-kedjan (tamper-vakt G7), rapporten, determinism; lib oförändrat 2 113 r i 5 moduler sedan 09-10 16:33 (git: 6bd23a0a + e9a75fab) |
| Cron-drivning (ÖVERSIKT: "kalibreringsloopen cron-driven") | cron finns | **ENBART Vercel-driven**: vercel.json bär `"20 5 2 * *"` (tillkommen våg 60, commit 64b9fea9 2026-09-04) — **/etc/crontab mätt SAKNAR akm3-kalibrering** (raderna: vagscan, nyheter, portfolj-uppfoljning, halsa). Prod-servern kör ALDRIG ronden; loggfil + rapport växer bara i molnet (system_events bär loggRad som kedjebas — O4-robusthet §6 i rutten). Första möjliga automatiska rond: **2026-10-02** |
| Kalibreringsloggen | (ej i kartan) | **1 rad**: v1 · 2026-09 · typ matning · ΔΦ=0 · hash b5400a158c00…; rapporten (genererad 2026-09-04T20:12Z): 0 dom-rader / 0 episoder — clean-förbudet §10.5 kasserar allt före 2026-09-04; alla sex faser n_eff 0/20, status "vantar-grind" (designen säger 8–12 kvartal — korrekt läge, inte fel) |
| Regime-loggen | (ej i kartan) | **1 genesis-rad 2026-09-03**: regim "magert", grönAndel 0,07 / rödAndel 0,17, nettoVagbredd OSATT ("senaste vagscan-event ej läsbart"), kravdaSnapshots 2. **FYND: regimen på prod är FROSEN på genesis** — uppdateringsvägen är cron/vagvalidering ("appendar vid reglerad förändring", route.ts:87) som SAKNAS på Contabo (mätt av s9-u2 2/3) OCH inte kan skriva fil på Vercel (read-only fs; kalibreringens loggRad-i-event-mönster finns EJ i vagvalideringens regimgren); /api/forskningslage läser senaste loggraden (route.ts:24-25, mätt) |
| Regimens publika exponering (gap 1) | "konsumentytan tunn — visas den?" | **MOTBEVISAD — fyra ytor**: RegimeChip i forskningslage-kort (kanoniska etiketter, ogiltiga värden visas ej) konsumeras av min-sida + portfolj-forskning + prenum-CTA; transparens-sidans "Metodrad 10 — så räknas regimeindikatorn (AKM3)" = HEL tabell med indikatorer, trösklar, hysteres och kadens; pro-ytorna (morgonrond, motespaket, klientvy, målsida) + fas3. MEN: chipet bär genesis-indikatorerna UTAN datum — att dagens läge råkar vara identiskt (7/100 gröna, 17 röda — live-sondad) är sammanträffande, inte mekanism |
| Ensemble-vyn (B7:s kö) | (B7:s sektion: 0/22) | **EGEN mätning**: /forskningsbiblioteket/HM-B.ST svarar 200 (155 kB) med **0 ensemble-träffar** i HTML:t (akm3=null ⇒ vyn renderas ej) — bekräftar B7:s 22/22-svep. Koden bär två källor (akm3-cache ELLER on-demand ur nyckeltalscachen, page.tsx:128-132) — ingen lever; portfolj-uppfoljning-cronen FINNS på Contabo (`0 7 1 * *`) men 0 fundamental-/akm3-cacher på disk trots att 09-01 passerat — orsak outredd (mätt) |
| Träff-%-trendvy (gap 2) | "saknar historisk trendvy" | **bekräftad mätt**: data/rapporter bär endast vagvalidering-SENASTE.json/.md — ingen historik; kalibreringsrapporten versionerar via loggen men serverar ingen trend |
| Ensemble-vikters drift (gap 3) | "bevakas ej" | **bekräftad**: prediktionsloggen lever i src (regim.ts/uppfoljning) men loggar AKM1-prediktioner, inte ensemble-vikter; ensemble.ts (172 r) persistar inga vikter — drift-bevakning saknas fortfarande |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B8 | PÅGÅR 7 → **PÅGÅR 7** | Precisering utan poängrörelse (E33/B14-precedensen): KONSTRUKTIONEN håller toppklass — 55/55 med tamper-vakt på hash-kedjan, LÅST grind ΔΦ=0 kodat som kontrakt (grindvillkor + rollback-regel i varje rad), DB-kedjebas-robusthet, månads-idempotens — och gap 1 är delvis motbevisat (fyra publika ytor). Men DRIFTVERKLIGHETEN: kalibreringen ENBART Vercel-driven (Contabo-crontab saknar raden, mätt), regimen frusen på genesis-indikatorer sedan 09-03 (osynligt för eleven), ensemble-konsumentytan tom. PÅGÅR är fortfarande det rätta läget (n_eff-målet ligger 8–12 kvartal bort enligt design); score 7 oförändrad — kunskap tillförd, inga kod- eller testgap stängda/öppnade |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg).

Kö till huvudagenten från fynden: (1) **/etc/crontab-spegling**: lägg curl-rader
för akm3-kalibrering (månadens 2:a 05:20 UTC = 07:20 lokal) och vagvalidering
(05:30 UTC = 07:30 lokal) — samma kö som B9:s vagscan-spegelning; annars växer
kalibreringskedjan + Bana B + regimen ENDAST i moln-JSON medan prod-diskens
loggar står stilla; (2) **regim-raderna kedjeläggs i system_events** à la
kalibreringens loggRad-mönster — annars kan Vercel aldrig föra regime-loggen
vidare och regimen förblir fruset genesis-läge; (3) **portfolj-uppfoljningens
cache-skrivning utreds** (cron-raden finns på Contabo men 0 akm3/fundamental-
cacher på disk sedan 09-01) — B7:s ensemble-kur lever, alternativt självläker
2026-10-01 om cronen lever; (4) regimchipet bör bära indikatorernas datum
(idag visas genesis-tal utan åldermarkering).

## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 5 — B13 + B11 + B10 diffade mot verkligheten)

Femte u3-dokvågen. Objektval mot duplikat EFTER kollisionskontroll — och TVÅ
trädskiften mitt i arbetet: förstavalet D38 togs av s9-u2 omgång 5 (ccb18a32)
och andravalet B8 av s9-u1 omgång 6, båda upptäckta när filen skiftat under
pågående mätning (s10-u3:s kollisionskur tillämpad: deras sektioner lästes,
lämnades orörda och D38/B8 avstods — se korsvalideringen nedan). Tre FRIA
system genomfördes i stället, alla i analysfamiljen: B13 (orörd av spårets
dokvåger och platsen där B7/B8:s cache-tomrum återfylls), B11 + B10 (båda
nya för kartans dokvåger). Varje rad MÄTT i arbetsytan 2026-09-16
(svitkörningar, motorvalidering, API-sonder mot localhost:3000, ls/node-
läsning av JSON, /etc/crontab- + vercel.json-läsning, kodläsning, grep,
git log) — inte läst ur worklog:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Riskportföljssviten (B13) | "grön vid senaste dokumenterade körning" | **32 PASS / 0 FAIL (egen körning, exit 0)** |
| Uppföljningssviten (B13) | dto | **50 PASS / 0 FAIL (egen körning, exit 0)** |
| Korstabell-underlaget (B13 gap 1) | "uppdateras manuellt — ingen autonom refresh" | **SKÄRPT MED MÅTT**: korstabell-grund.json FRUSEN — skapad 2026-09-03, 100 rader, akm2Berikad 2026-09-04 — medan bolagsunivers.json vuxit till **120 bolag** (s2-spåret; senaste skrivning 2026-09-16 01:44, mätt): underlag och korstabell GLIDER ISÄR |
| Peer-jämförelsen (B13 gap 2) | "ytlig (median, ej kvartiler)" | **NYANSERAD — delvis designbeslut**: rank/median är AKM3-BESLUT §10.10 (MAD/kvartiler FÖRBJUDNA vid n=10; peer.ts filhuvud dokumenterar förbudet) — gapet lever bara för branscher med stort n |
| member/portfolio-rutten (B13 gap 3) | "saknar transaktionshistorik/valideringstest" | **SKÄRPT: ingen sessionsvakt alls** — rutten (107 r, genomläst) tar memberId ur klientens body/query UTAN lasMedlemSession-kontroll, holdings mappas `any`-typade utan validering; konsumenter på publik sida /min-portfolj (portfolio-system.tsx m.fl., mätt) — kontrast: D38:s medlem/portfolj (samma dag kodläst) bär lasMedlemSession → 401 + rate-limit 60/min per authId + refresh-rotation |
| Uppföljnings-cronen (B13) | "månadens 1:a" | **DUBBEL drivning mätt** (/etc/crontab 0 7 1 * * + vercel.json 0 7 1 * *); prediktionslogg-akm3.json + fundamental-/akm3-cacher saknas på disk (mätt) trots att 09-01 passerat — samma outredda fynd som syskonets B8-sektion noterar; nästa körning 2026-10-01 |
| Netnet-egensviten (B11 gap 3) | "egen testsvit saknas" | **kvarstår** (mätt: 0 testa-netnet* i verktyg/) |
| Netnet-universum (B11 gap 2) | "25-bolagslistan fast" | **fast 25, oförändrad** (mätt i netnet-skanner.tsx: VOLV-B, SAAB-B, ATCO-A, SAND, SSITY-B, ERIC-B, AZN, NDA-SE, SKF-B, ALFA, NCC-B, BALD-B, INDU-C, KINV-B, LATO-B, EVO, SINCH, SBB-B, CATE, NYF-B, FABG, BEIA, SHB-A, SWED-A, HM-B) |
| Netnet i prod (B11) | (ej prod-mätt i kartan) | **/netnet 200 + /api/netnet LEVANDE med färsk tidsstämpel** (genererad 2026-09-16T04:43:31Z, egen sond; VOLV-B kurs 330,2 — live-kursflödet lever); motorvalideringen **107 PASS / 0 FAIL / 0 SKIP (6,9 s, egen körning)** — determinismgrenen stabil grön sedan 09-13 |
| Netnet-git (B11) | — | ytan stabil: endast b77699ba (revalidate=3600) + 0fe32c6c (JSON-LD) sedan 09-11, inga motorändringar |
| Konfluens-egensviten (B10 gap 1) | "ingen egen testsvit" | **kvarstår** (mätt: 0 testa-konfluens* i verktyg/) |
| Konfluens i prod (B10) | (ej prod-mätt i kartan) | **/konfluens 200 + /api/konfluens LEVANDE** (genererad 2026-09-16T04:44:21Z, egen sond): fem-källors-raderna (värdegolv, kvalitet, fundamental vågstart, prisvågläge, divergens ⇒ konfluens 0–100 + antal datakällor) beräknas live; ingår i motorvalideringen (107/0/0 egen körning) |
| Konfluens-historik (B10 gap 2) | "lagras ej" | **kvarstår** (mätt: ingen system_events-/utfallspersistens i konfluens-motor.ts) |
| Korstabell-kopplingen (B10 gap 3) | "läsbar men ej testad" | **preciserad: KONCEPTUELL, ej kodad** — 0 direkta import mellan konfluens-{motor,tabell} och portfolj-forskning/* (mätt); den gemensamma vägen är motorstacken (konfluens importerar netnet- + analys- + vagfundament-motorerna, kodläst) |
| Konfluens-git (B10) | — | ytan stabil: endast 7be67f80 (KO-rättning v105) + 0fe32c6c (JSON-LD) + b77699ba (revalidate) sedan 09-11 |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B13 | LEVER 8 → **LEVER 8** | Båda egna sviterna gröna omätta (32/0 + 50/0) och cron-bilden mätt — men korstabellen frusen 13 dagar under ett växande universum (100 rader mot 120 bolag) och member/portfolio-rutten visade sig sakna sessionsvakt på publik konsumentyta: skärpta gap, inga stängda — ingen poängrörelse |
| B11 | LEVER 6 → **LEVER 6** | Lägesrättning med egna mätbevis: determinismgrenen stabil grön (107/0/0 egen körning + färsk live-sond), detaljblockets motbevisade FAILAR-observation städad till historik — men båda namngivna gapen lever oförändrade (0 egna sviter, fast 25-lista): ingen poängrörelse |
| B10 | LEVER 7 → **LEVER 7** | Kunskap tillförd (E33/B14-precedensen): fem-källors-logiken lever LIVE i prod med färsk tidsstämpel (första egna sonden av radarns API) och motorvalideringen grön egenhändigt — men ingen av de tre gapen rördes (svit, historik, koppling): ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg; inga
poängrörelser, endast läges- och gaprättningar med egna mätbevis).

**Korsvalidering av syskonen (deras sektioner orörda, ärlig bokföring):**
(1) s9-u1 omgång 6:s B8-sektion bekräftas av denna agents samtidiga,
oberoende B8-mätningar exakt (55/55 egen körning, vercel.json "20 5 2 * *" +
raden SAKNAS i /etc/crontab, regimens fyra publika ytor) — deras fynd går
djupare (regimen frusen på genesis-raden sedan 09-03, uppdateringsvägen
vagvalidering finns ej på Contabo); B8 lämnas helt åt dem. (2) s9-u2 omgång
5:s D38-sektion överlappar mina D38-mätningar (rutterna medlem/bevakning +
medlem/portfolj kodlästa med session/rotation/rate-limit, korskopplingen i
portfolj-navet.tsx:101-133, gränssnittsvakten senaste rapport 2026-09-15T23:27
med 0 fel/176 kombinationer) — mina fynd bekräftar deras, D38 lämnas åt dem.

Kö till huvudagenten från fynden: (1) **member/portfolio-rutten behöver
sessionsvakt** — lasMedlemSession-mönstret från D38:s medlem/portfolj är den
färdiga kurmallen (import + fyra rader); publik POST utan auth i
/min-portfolj-kedjan är dagens skarpaste integritetsgap; (2) korstabell-refresh
behöver cadans — korstabell-grund (09-03, 100 rader) glider ifrån
bolagsunivers (120): skanka-/berika-kedjan ropas vid universumsväxt;
(3) portfolj-uppfoljningens cache-skrivning utreds (sammanfaller med syskonet
s9-u1:s B8-kö: cron-raden finns på Contabo men 0 cacher på disk sedan 09-01 —
en enda utredning täcker båda).

## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 6 — A4 + A5 + B12 diffade mot verkligheten)

Fjortonde dokvågen i spåret; objektval efter kollisionskontroll: 29 system tagna
av spårets dokvåger (A1/A2/A3/A6, B7–B11, B13, B14, C15–C18, D20, D38, E26–E37),
D22/D23 lämnas av princip (VÄNTAR KUND-R2) — A4, A5 och B12 valdes bland sju
fria (C19, D21, D24, D25 kvarstår i dokvågskön). Bokföring om syskonracet: u3
omgång 5-sektionen (B13+B11+B10) låg osparad i arbetsträdet och landade med
898605a7:s filcommit — innehållet intakt och respekterat, denna dokvåg rör tre
ALDRA diffade system. Allt MÄTT i arbetsytan: kodläsning (tre rutter/filer
genomlästa), git-datering, grep i verktyg/, live-sonder mot localhost + prod-HTTPS,
determinism-prov med dubbla API-anrop — aldrig worklog-läsning.

| Objekt | Kartans påstående | Verkligheten (mätt) |
|---|---|---|
| A4 gap 2 | "dagens bolags determinism garanteras ej i kod" | **MOTBEVISAT**: FNV-1a-datumhash med salt KODAD (api/dagens-pass/route.ts:33–34, 202–203 — ROTATION 12 bolag + AKM1-fråga per dag); prod-bevis: två live-anrop byte-identiska (SHB-B.ST 2026-09-16, pris 236, pos52 0,873) |
| A4 gap 3 | "briefingens datakällor statiska — koppling till vagscan saknas" | **MOTBEVISAT**: briefing.ts:21 deklarerar Vagdata-formen "speglar /api/vagscan/senaste"; komponenten fyller vagdata-fältet via fetch (rad 8, 59, 174) |
| A4 nyckelfil | "src/lib/kunskapsflode.json" | **FINNS EJ** — kunskapsflödet bor i komponenten kunskaps-flode.tsx (enda "kunskapsflod"-träffen i src) |
| A4 gap 1 | "streak-logik + XP-tildelning testas ej" | **LEVER**: 0 sviter i verktyg/; streak-logiken bor i member-local.ts lasStreak, konsumerad av badges + briefing |
| A5 gap 3 | "topplistans integritet — progress via auth-vaktad rutt men granskas ej" | **SKÄRPT**: POST /api/topplista (xp_sync) HELT utan sessionsvakt — e-post+XP tas ur klient-bodyn (route.ts:34–41), GET aggregerar senaste-per-e-post (105–111): vem som helst kan posta en annan elevs e-post med 10 M XP (impersonationsklassen från B13:s member/portfolio-fynd). Mjukande mätt: caps (xp ≤ 10 M, nivå ≤ 100), maskerad e-post, topplistan TOM live ({"topplista":[],"antal":0}) = ej utnyttjad. Gamla formuleringen gällde D21:s progress-rutt, inte denna synk-rutt |
| A5 gap 2 | "certifikatens unikhet/verifierbarhet otyst" | **BESVARAT**: certId = `AK1A-<år>-<XP nollstoppad>` (certifikat.tsx:57) utan medlemsspecifik hash — två medlemmar med samma XP samma år får IDENTISKT id; samma medlem får nytt id vid varje XP-synk; ingen signatur/register bakom |
| A5 gap 1 | "badge-reglernas trösklar saknar test" | **LEVER**: 0 egna sviter; badges.ts 326 r bär trösklarna som okompilerad data (xp-1000, xp-10000 …) |
| B12 gap 3 | "kalkylatorn har ingen länk tillbaka till kurslektioner per variabel (återanvänd B7:s)" | **MOTBEVISAT**: akm1-calculator.tsx (1 411 r) importerar forklaPoang från kärnan (rad 12) och bär MODUL_KURS_LANK-map med våg 78 B3-reglerna — aldrig döda länkar, fallback kursbiblioteket (rad 67–74); kartans eget förslag är redan implementerat |
| B12 observation | "trösklarna delas med AKM2-kärnan (en källa till sanning)" | **NYANSERAD/INVERTERAD**: superanalys.ts (507 r, use client) har 0 imports — det är tvärtom AKM2-KÄRNAN som bär viktprofilen "superanalys-2026" som en av tre kanoniska (testa-akm2-karna kontroll 6–8: summa 100; kontroll 22: kategoriupplösning) — delning genom konvention+svit; klientens kategorivikter (15/20/20/15/15/5/10) är en OBEROENDE kopia som inte följer kärnan automatiskt |
| B12 gap 1 | "poängsummor/validering av elevens inmatning testas ej" | **TUNNARE LEVER**: kärnprofilen ÄR svit-testad (kontroll 22); klientfilens egna poängsummor 0 sviter |
| B12 gap 2 | "delningskortets utseende vid extrema värden (0/100) overifierat" | **DELVIS LUGNAT**: totalpoängen matematiskt inlåst 0–100 per konstruktion (Σ kategorisnitt ÷ 5 × vikt × 100, rad 307–310); renderingen förblir E2E-overifierad |
| Prod | — | /dagens-pass, /badges, /certifikat, /topplista, /superanalys, /kalkylator = 200 på loopback OCH https |

| System | Före → efter | Bedömning |
|---|---|---|
| A4 | LEVER 7 → **LEVER 7** | Lägesrättning enligt E31/C15-precedensen: determinism + vagscan-koppling har funnits i kod sedan 09-01–09-03 (02c0920d, 4d5f2457, fcdc14ed) — kartan var inaktuell från början; huvudgapet (streak/XP-tester) orött = ingen poängrörelse |
| A5 | LEVER 7 → **LEVER 7** | Skärpt gap utan stängning (B13-precedensen): vaktlös xp_sync-POST + kollisionsbart certId MÄTTA i kod, men topplistan är tom (0 poster, live-sond) = ingen konsumentskada ännu; 0 sviter kvarstår |
| B12 | LEVER 7 → **LEVER 7** | Kunskap tillförd (E33/B14-precedensen): länk-gapet motbevisat, delningsbilden inverterad (kärnan bär profilen — svit-testad), testgapet tunnare men levande; ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad; tre preciserings-dokvågar
utan poängrörelser är spårets mönster när verkligheten bekräftar snarare än
förändrar).

Kö till huvudagenten från fynden: (1) **A5: sessionsvakt i /api/topplista POST** —
lasMedlemSession-mönstret från D38:s medlem/portfolj är den färdiga kurmallen;
samma våg som B13:s portfolio-kur täcker båda publika POST-ytorna; (2) A5:
certId medlemsspecifik (hash av medlemId+år) när vakten vågas; (3) A4: datumHash
är en ren funktion — en svit à la testa-b2b-mönstret täcker gap 1 tillsammans
med streak-logiken; (4) B12: klientens kategorivikter antingen importeras ur
kärnan eller kommenteras mot profilen superanalys-2026 om dubbelläget ska bort.

## UPPDATERING 2026-09-16 (dokvåg s9-u1 omgång 7 — D25 referral + e-post + notiser diffad mot verkligheten)

Femtonde dokvågen (uppdragstexten identisk med omgång 6:s — B8 levererat i
898605a7 och lämnas orött; objektval efter kollisionskontroll: 32 system
diffade efter syskonens omgångar 5–6, D22/D23 VÄNTAR kund-R2 av princip —
D25 FRITT valt med omdöme: lägst score bland de fyra kvarstående (C19, D21,
D24, D25) och enda systemet med öppen "driftstatus overifierad"-fråga =
störst mätbart glapp. Syskonrace-bokföring: s9-u3 omgång 6:s sektion
(A4+A5+B12) låg osparad i arbetsträdet vid denna dokvågs start — innehåll
intakt och respekterat, deras rader orörda. Allt MÄTT i arbetsytan 2026-09-16
(genomläsning av 5 lib-filer + 4 API-rutter + vbout-adaptern, env-NÄRVARO
mätt utan att värden lästs, /etc/crontab + vercel.json, live-sonder mot
localhost, pm2-log, grep) — aldrig worklog-läsning:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Brev-leverantören | "driftstatus (leverans, bouncar) overifierad" | **MÄTT OKONFIGURERAD**: EMAIL_LEVERANTOR/EMAIL_API_KEY/RESEND_API_KEY/SENDGRID_API_KEY/EMAIL_FROM = 0 satta i .env* (närvaro mätt, värden olästa) — skickaMejl kan ENBAST svara "köad (leverantör saknas)"; INGET brev kan ha skickats från prod-servern |
| Mejl-cronens drivning | "cron finns" (06:30) | **ENBART Vercel-driven**: vercel.json bär /api/cron/email `30 6 * * *` (06:30 UTC); /etc/crontab mätt SAKNAR raden — Contabo kör aldrig mejl-rondan. Speglingsgap-familjen växer: vagscan+nyheter+portfölj-uppföljning FINNS på Contabo, akm3-kalibrering+vagvalidering+email SAKNAS |
| VBOUT-leden | **saknas helt i kartan** | **KONFIGURERAD lead-väg kartan aldrig nämnt**: src/lib/vbout.ts (123 r) — adapter till kundens Vbout-automation (host-vitlista vbt.ak1nvestor.com/ssl.vbt.io + DNS-rebinding-skydd + https-tvång, kastar aldrig); kopplad i /api/email + /api/member/register + /api/fas2-ansok (kalla: medlem/fas2-ansok/prenumeration/nyhetsbrev/manuell); VBOUT_WEBHOOK_URL SATT i .env* (mätt) = den ENDAST livsdugliga e-postvägen på prod |
| Validering + felvägar (gap 1) | "inga tester (validering av mottagaradress, felväg)" | **KODEN lever, mätt i prod**: EMAIL_RE + längdtak (e-post 254/namn 80/text 300/aktie 40) + rate-limit 10 IP/min i /api/email (232 r); sond POST ogiltig adress → 400 `"Ogiltig e-postadress."`; typade svarsstatusar 400/429/503/502, leverantörsfel = köad (ALDRIG 502). TESTER: 0 sviter (mätt) — gapet preciseras: kod ja, tester nej |
| Notis-tak | "localStorage/50-tak enligt våg 86" | **FÖRÅLDRAT**: taket är 100 (notiser.ts:72 `lista.slice(0, 100)`) + 30 dagars åldersgolv (:55) — kartans 50-tal gäller ej |
| Notisernas server-sida (gap 2) | "saknar server-side-lagring" | **KVARSTÅR som design** (historiken fästs i localStorage — enhetsbyte förlorar den) MEN arkitekturen är bredare än kartan: GET /api/notiser (125 r) levererar LEVANDE underlag — mätt 200 med dagens pass SHB-B.ST (deterministisk rotation) — och signal-bussen /api/signal är NotisCenters källa (portfölj-cronen publicerar dit, kodläst :57-63). Bussen mätt: lage "supabase" men "alla"-vyn bär ENDAST statisk fallback (0 äkta signaler, mätt 06:51 lokal före dagens 08:00-nyhetsrond) |
| Underlagets vågkarta | (ej i kartan) | **vagkarta: null mätt** — rutten visar endast färsk type=vagscan-rad (design: "gammal karta hälsas aldrig som färsk"); cron/vagscan SKRIVER event (route.ts:291, kodläst) men ändå null medan B9 mätte färsk skans 05:05Z — färskhetsfönstret/konsumentkedjan utreds ej här, bokförs som kö |
| Referral-admin-vy (gap 3) | "utan uppföljningsvy i admin" | **DELVIS MOTBEVISAT**: /api/admin/konvertering mäter system_events type=referral details.framgang=true (totalt + rullande 30 d, :176-177) + utveckling-panelens "Tips-värvar"-rad — ANTAL lyckade värvar följs i admin; identitetsnivån medvetet bort (m10 AC2: ingen social graf, GDPR-design) |
| m10 steg 2 | (våg 86-not "väntar J1-J2") | **fortfarande BYGGS EJ** (referral.ts:15 "väntar på kundens policy-uppdatering J1–J2") — kundväntan korrekt bokförd i kod |
| DelaKort-konsument | nyckelfil ref-mottagare.tsx | tipskod-knappen lever i dela-kort.tsx på /forskningsbiblioteket/[ticker] (mätt kod + konsumtion); /api/referral/kod 133 r: rate-limit 6/min, kräver medlemrad (404 annars), FOMO-förbud i svaret, GET → 405 (mätt) |
| Mallar | (inget radtal i kartan) | email-mallar.ts **274 r**: morgonMejl + veckoRapport + fas2Nudge + NYHETSBREV_MALL + MEJL_DISCLAIMER (export mätt) |
| Köbildning i prod | overifierad | pm2-loggen: **0 träffar på POST /api/email** (ingen direktköning på logghorisonten); med leverantören osatt är "köad (leverantör saknas)" enda möjliga utfall oavsett |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| D25 | LEVER 6 → **LEVER 6** | Dubbel natur MÄTT: ytorna lever (notis-underlag 200 live, valideringsgren 400, referral POST-only 405, signal-buss lage supabase, VBOUT konfigurerad) men BREV-fUNKTIONEN kan inte verka från prod (leverantör osatt + Contabo-cronen saknas = 0 mejl möjliga); tester saknas fortfarande (gap 1), server-side-lagring kvarstår (gap 2), gap 3 delvis motbevisat. E33/B14-precedensen: kunskap tillförd, inga kod/testgap stängda eller öppnade — score orörd. LEVER kvarstår: notiscentern + referral + kö-kontraktet är fungerande ytor; riktigt utskick väntar kundsetup (kodens setup-box är checklista) — ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg).

Kö till huvudagenten från fynden: (1) **email-cronen speglas till /etc/crontab**
(06:30 UTC = 08:30 lokal) — speglingsfamiljen (akm3-kalibrering + vagvalidering
+ email) samlas i ETT crontab-beslut, samma kö som B9:s vagscan-not; (2) **kundsetup
för brev-leverantör** (Resend/SendGrid-konto + domänverifiering + env) är kundäga —
email-sandare.ts:6-28 är färdig checklista; (3) **VBOUT-driften loggbevisas** —
webhook är satt men 0 synliga sändningar i pm2-loggen: har något lead nått
Vbout? (auditråd eller leverantörens dashboard); (4) **vagscan-eventets färskhet
i /api/notiser** utreds (vagkarta null trots färsk skans + skrivande cron —
notiskedjan återkopplar ej, konsumentfynd kopplat till B9); (5) notis-takets
dokumentation 50→100 rättad i detaljblocket här.

## UPPDATERING 2026-09-16 (dokvåg s9-u1 omgång 8 — D21 medlemsdata & progress diffad mot verkligheten)

Sextonde dokvågen. Objektval efter kollisionskontroll: omgång 7 lämnade
C19/D21/D24 fria (D22/D23 VÄNTAR kund-R2 av princip) — D21 valt med omdöme:
medlemssystemets kärna har aldrig diffats, och B13-omgångens fynd om OVAKTADE
member/*-portföljrutter gör D21:s egen vakthet aktuell att mäta (grannytan
avgränsas: member/* = B13:s system). Allt MÄTT i arbetsytan 2026-09-16
(två svitkörningar, kodläsning, grep per fil, prod-sonder mot localhost,
git log -S) — aldrig worklog-läsning:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Testsviter | "testsvit finns och är grön vid senaste dokumenterade körning" | **13/13 KÖRD GRÖN nu** (testa-medlem-progress.mjs, exit 0 — kontrakt: deterministiska nycklar, server-fastställda värden, importtak, senaste-vinner, requestscopad läsning, URL-/bygg-hermetik) + **testa-medlem-auth 17/17 KÖRD GRÖN nu** (exit 0) |
| medlem-progress.ts | 448 r | **478 r** (+30); våg 106-kontraktet lever i typen: paborjadeKurser + quizRatta (rad 264–266, härledning rad 303) |
| API-yta | endast progress i nyckelfilerna | **FYRA rutter, ALLA VAKTADE** (lasMedlemSession mätt per fil: medlem, progress, portfolj, bevakning — bevakningen tillkom med våg 104) |
| GET-kontrakt i prod | "requestskopad läsning (§B.4-dokumenterat)" | **sond mätt: 200 `{inloggad:false}`** för gäst (ruttdokumentationen: "TYST, aldrig 401-text"); POST-grenarna bär 401 utan session, 429 rate-limit, 400 validering, 502 skrivfel (kodläst) |
| XP-replay-skydd (gap 2) | "progress-integritet (XP-replay-skydd) otyst" | **MOTBEVISAT — tydst i kod + svit**: importen ENGÅNGS (`import:<authId>:<datum>` ⇒ importGjord=true, "förbrukad"), importtaket rad 88 (teoretiskt max ur kursdata) + rad 206 "XP takat mot teoretiskt max OCH avraget för vad servern redan registrerat", server-fastställda stegvärden (quiz +10, kursklar +50, stjärna +1), främmande nycklar kan aldrig påverka aggregatet (svit-test 9 PASS). Git -S: importtaket kodades i VÅG 87 — FÖRE inventeringen; kartan hade ej läst det |
| Gäst→moln-migrering (gap 1) | enkelriktad | **fortfarande enkelriktad** lokal→moln (migrera-progress.tsx 110 r, våg 87 §A.3: gäst med lokal progress → registrera → importera; bannern renderas aldrig utan lokal data) — öppet designval, gap kvarstår |
| GDPR-export/radering (gap 3) | "finns ej i UI (endast kontaktväg)" | **fortfarande saknas** (0 kodträffar i profil/page.tsx — endast metadata-rader) — tyngsta kvarvarande gapet; GDPR-DATAKARTA.md lever sedan E26-mätningen men UI-ytan är obyggd |
| Kontrast grannytan | — | B13:s fynd gäller INTE D21: member/*-konsultrutterna (memberId ur klienten, 7 rutter OVAKTADE) är portföljforskningens yta — D21:s svenska medlem/* bär lasMedlemSession på ALLA fyra rutter (mätt) och är färdig mall för grannytans kur |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| D21 | LEVER 8 → **LEVER 8** | Gap 2 motbevisat med kod+svit-bevis, men E31-precedensen gäller: skyddet kodades i våg 87 FÖRE inventeringen — kartan var inaktuell, ingen ny fix levererad av dokvågen. Kvar: GDPR-gapet (3, substansiellt) + migreringens enkelriktning (1, dokumenterat val). Sviterna ÅTERmätta grön (13/13 + 17/17), hela API-ytan helvaktad mätt — kunskap tillförd, inga gap stängda/öppnade: score orörd |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg).

Kö till huvudagenten från fynden: (1) **GDPR-export/radering av eget
konto i UI** (gap 3) — GDPR-DATAKARTA.md kartlade rätten, UI-ytan återstår;
(2) member/*-konsultrutternas sessionsvakt (B13:s kö) har färdig mall i
D21:s lasMedlemSession-mönster — fyra rutter mätt som referens; (3) vill
gap 1 stängas formellt: dokumentera enkelriktningen som beslut i
detaljblocket (i dag bärt av kodens vaghuvud).

## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 7 — C19 + D24 diffade mot verkligheten; D21-korsvalidering)

Sjunde u3-dokvågen och spårets SLUTSTYCKE: med C19 + D24 är ALLA 36
diffbara system diffade (38 − D22/D23 som VÄNTAR kund-R2) — kartans
första FULLSTÄNDIGA diff-cykel sedan K1-inventeringen 2026-09-11.
Kollisionsbokföring: D21 var denna dokvågs tredje mätobjekt men togs av
syskonet s9-u1 omgång 8 (6fcd6621) mitt under pågående mätning — deras
sektion orörd, D21 lämnas åt dem; mina oberoende mätningar FÖRE
commit-upptäckten (svit 13/13 egen körning exit 0, medlem-progress.ts
478 r, lasMedlemSession + rotationsförnyelse + 401 + 429 kodläst i
progress-rutten, deterministiska nycklar quiz:slug:kap:i) bekräftar
deras fynd EXAKT — se korsvalideringen nedan. Allt MÄTT i arbetsytan
2026-09-16 (kodläsning av tracer/cookie-consent/trafik-rapportor/
globalt-skal/kurs-access + tre fas2-rutter, grep, live-sonder mot
localhost, node-läsning av siffror.json) — inte worklog-läsning:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| C19 tester (gap 1) | "inga tester" | **bekräftad mätt**: 0 sviter för tracer/trafik/konvertering/dash/eko i verktyg/ (grep) |
| C19 alarm-tröskel (gap 2) | "6 steg mäts men ingen automatisk alarm-tröskel" | **bekräftad mätt** (0 larm-/tröskelträffar i konverterings-panelen) — men panelens kontrakt är bredare än kartan: SEX STEG · NOLL NYA SPÅR (P6) + P4-mätkvalitet per steg (MÄTT/SKATTAD/MANUELL — luckorna skrivs ut, göms aldrig) + x-admin-password + 5-min-modulmemo |
| C19 GDPR (gap 3) | "kopplingen till kakmodalen manuell — spåren startar före samtycke? (verifiera gracious-defer)" | **SPLITTRAT SVAR, mätt i kod**: (a) trafik-rapportören ÄR samtyckesgated — lasCookieSamtycke (trafik-rapportor.tsx:97,153): analys-samtycke → fullt läge, annars minimalt (ENBAST path+ua, 30 % stickprov), puls kräver analys, "skapa INTE ny lagring utan analys-val"; (b) MEN PageViewBeacon (globalt-skal.tsx:243–276, "kopia ur layout.tsx") beaconar ALLTID {path, sessionId} → /api/track → user_activities i Supabase OCH skapar ak1a-session-localStorage UTAN att läsa samtycket — kakmodalens eget lagcitat (2022:482 6 kap 19–20 §§, "samtycke INNAN icke-nödvändiga cookies/localStorage") efterlevs EJ av beaconen: kartans misstanke ÄR sann för denna spårväg; (c) lokala tracern ogated (harCookieSamtycke bär "för framtida gating") men lämnar ALDRIG enheten (filhuvudkontrakt: localStorage ak1a-tracer-v1, delning endast via frivillig knapp som ännu ej byggts) |
| C19 API-live | — | POST /api/track {} → **400** (p ≤ 200 + sessionId krävs, endast interna sökvägar i loggen, tyst nläge utan Supabase) · GET /api/trafik **200** · GET /api/tracer **405** (POST-only = den frivilliga delningsvägen) · intention GET 405 / POST {} **400** |
| C19 P6 | "P6-disciplinen protokollförd" | **även KODDOKUMENTERAD** (mätt): del-rad.tsx ("inga klick-event, ingen pixel — bara webbläsarens egna API:er"), konverterings-panelen ("ur BEFINTLIGA källor, noll nya spår"), medlemmar-panelen ("loggas ALDRIG (P6×2)") |
| C19 nyckeltal | tracer.ts 742 r | **742 r oförändrad** · ekosystem.ts 59 · eko-koppling.ts 581 · dashfraga.ts 291 — dashfraga-kort.tsx konsumeras av min-sida.tsx (mätt) |
| D24 fas-set | "18/24 kurser bakom grind" | **EXAKT oförändrad mätt i kod**: FAS2_KURSER **18** + FAS3_KURSER **24** (kurs-access.ts:29–84, 274 r) — Fas-inversionen (användarens direktiv 2026-09-03): member_type free/fas2/fas3/premium/pro, fas3+ öppnar supermängden, ak1a-fas2-override lokalt; underlaget vuxit 352→**369 kurser** (siffror.json färskt mätt) utan att grindytan rörts |
| D24 ytor | — | /fas2-ansok **200 i sv + en/ar-speglarna** + /fas3 **200** (loopback) |
| D24 validering + admin | — | POST /api/fas2-ansok {} → **400 "Namn krävs"** + grenarna Ogiltig förfrågan/E-post/Supabase 500 (kodläst) mätta; GET /api/admin/fas2-access utan lösen → **401** |
| D24 aktivering (gap 1) | "manuell aktivering skalar inte (sido-kö + notis finns)" | **bekräftad mätt** (POST {memberId, ge} → PATCH member_type, EN medlem per anrop) — men sido-kön är starkare än kartan visar: ansökan loggas som system_event type=fas2_ansokan (syns i admin Systemevents) + content-range-räknare i rutten + VBOUT-lead vid ansökan (vbout-import rad 3, leadmiss loggas tyst — D25:s fynd bekräftat i koden) |
| D24 elevstatus (gap 2) | "ansökningsstatus syns ej för eleven (endast toast)" | **NYANSERAD/DELVIS MOTBEVISAD**: "Din elevstatus" visas med neutral presentation på ansökningssidan (fas2-ansok.tsx:132–150, lokal läsning + automatisk hämtning vid medlemskoppling) — det som saknas är ANSÖKNINGSUTFALLET (väntar/beviljad), inte elevstatusen |
| D24 cert (gap 3) | "äkthetsverifiering (offentlig kontroll-URL) saknas" | **bekräftad mätt**: fas3-cert.tsx bär stapel-id:n (grund/praktik/etik/cert) — ingen publik verifierings-URL, hash eller register bakom certifikatet |
| D24 rate-limit | (ej omnämnt i kartan) | **NYTT FYND**: /api/fas2-ansok saknar rate-limit helt (grep rate/throttle/429 = 0 träffar) — öppen POST-yta med Supabase-skrivning; kontrast mot /api/email (10 IP/min) och /api/referral/kod (6/min) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| C19 | LEVER 7 → **LEVER 7** | Gap 1+2 bekräftade mätta; gap 3 delat: samtyckesgating KODAD för trafik-rapportören (motbevisat) men PageViewBeacon sänder före samtycke (SKÄRPT — spår skrivs till Supabase + sessions-localStorage skapas före varje samtyckesval, mot kakmodalens eget lagcitat) och tracern förblir ogated-lokal — kunskap tillförd, inga kod/testgap stängda (E33/B14-precedensen) |
| D24 | LEVER 8 → **LEVER 8** | 18/24 exakt + ytor + validerings-/admin-grindar mätta; gap 1 bekräftad (men sido-kön starkare: system_events + VBOUT), gap 2 nyanserad (elevstatus visas, ansökningsutfall saknas), gap 3 bekräftad, nytt rate-limit-gap — inga gap stängda, ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg).

**Korsvalidering D21 (syskonet s9-u1 omgång 8:s sektion orörd):** mina
mätningar hann före deras commit-upptäckt och bekräftar fynd för fynd —
sviten 13/13 GRÖN i egen körning (exit 0), medlem-progress.ts 478 r,
progress-rutten lasMedlemSession + rotationsförnyelse + 401 "Inloggning
krävs." + rate-limit per authId 429 (kodläst), och idempotensnycklarna
quiz:slug:kap:i / kursklar:slug / stjarna:slug med "bodyns nyckel/varde/
xp läses ALDRIG" — deras svit-detalj (import ENGÅNGS 409, importtak)
bygger på samma kontrakt. D21 lämnas helt åt deras sektion.

Kö till huvudagenten från fynden: (1) **PageViewBeacon samtyckesgates**
(globalt-skal.tsx + layout-kopian) — läs ak1a-cookie-samtycke som
trafik-rapportören gör, annars skrivs user_activities-rader +
sessions-localStorage före varje samtyckesval; (2) **rate-limit i
/api/fas2-ansok** (färdigt mönster i /api/email: 10 IP/min); (3) GDPR-
export/radering i UI lever som D21/D20-gemensamt gap (syskonets kö);
(4) konverteringstrattens alarm-trösklar (C19 gap 2) när panelen växer.

**Med denna dokvåg är SYSTEMKARTANS diff-cykel SLUTFÖRD: 36/36 diffbara
system mätta mot verkligheten i 17 dokvågar (2026-09-15 → 2026-09-16);
D22/D23 väntar kund-R2. Nästa dokvåg = andra varvet — börja där
verkligheten rört sig mest sedan första passningen.**

## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 8 — E35 ÅTERDIFFAD: s8-vaktvågen + PÅGÅENDE prod-fel)

Andra varvets första dokvåg, exakt enligt omgång 7:s slutregel ("börja där
verkligheten rört sig mest sedan första passningen"): E35 är systemet med
störst rörelse sedan sin första diff (2026-09-15) — s8-spåret levererade en
hel vaktvåg 2026-09-16 (deployklassning, pulsvakt, statisk sond, konsol).
Kollisionsbokföring: uppdragets två naturliga förstaval (C19 + D24) togs av
syskonet s9-u3 omgång 7 (b20f0b92) medan mätningarna pågick — deras sektion
lästes och lämnas orörd; mina oberoende mätningar FÖRE commit-upptäckten
bekräftar deras fynd (API-sonderna 400/200/405/405, fas-seten 18+24,
rate-limit-gapet i /api/fas2-ansok — oberoende fynd av samma gap) och
tillför fyra mått deras sektion saknar (se korsvalideringen nedan). Allt
MÄTT i arbetsytan 2026-09-16 (svitkörningar, motorvalidering, ps-läsning
av pulsvakt-processen, node-läsning av JSON, curl mot loopback + HTTPS,
free -m, git log) — inte worklog-läsning:

| Mått | Kartan (senaste E35-diff 09-15) | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Testsviter | "33 st (mätbart)" | **54 st** (ls mätt) — +21 på ETT dygn (fabriks- + s8-vågorna); tre nya s8-sviter KÖRDA GRÖNA egna körningar: testa-granssnitt-konsol **14/14** + testa-statisk-sond **10/10** + testa-pulsvakt-statisk **17/17** (alla exit 0) |
| Motorvalidering | 107/0/0 (09-15) | **107 PASS / 0 FAIL / 0 SKIP (8,1 s, egen körning)** — fortsatt grön, tredje dokvågsbekräftelsen |
| Vaktverktyg | beroende-/dödlänkar-/konfigintegritetsvakt (09-15) | **+ FYRA till (s8-vågen, ls mätt)**: pulsvakt.mjs (20 259 byte — minutpuls med lägesmaskin), pulsvakt-statisk.mjs (statiskt kontraktstest), statisk-sond.mjs (bygg-tillgångars kontrakt), granssnitt-konsol.mjs (delresurs-deploysignaturer); granssnittsvakt.mjs vuxen till 36 748 byte med DEPLOYKLASSNING (stil-lös-detektor, vänta+mät-om vid deploykollision); protokoll KVALITET-VAKTEN-DEPLOYKLASSNING-2026-09-16.md på disk |
| Pulsvakten i drift | (fanns ej) | **LEVER SOM PROCESS**: PID 1084046, upp 20:41 min, pulserar VARJE minut (senasteKoll 11:11:36Z vid mätning 11:12:12Z), status lever:true, varv 20 — MEN ingen crontab-rad (mätt): drivningen är en engångsprocess, omstartsberoende |
| PÅGÅENDE prod-fel | (fanns ej) | **FÅNGAT I REALTID AV SYSTEMET, MÄTT EGNA HÄNDER 11:12Z**: pulsvakten högprio "trasig-bygg" — HTML 200 men **12/25 statiska tillgångar 404**; EGEN sond: chunk 0dkvqmwqb0ena.css = **404 på loopback OCH HTTPS** (kundsynligt ostylat); gränssnittsvakten 10:41Z klassar /kurser "stil-lös sida (CSS ej laddad)" — deployklassningen gör sitt jobb |
| Läkningsvägen | — | prod-synk.loggen: "NY KOD 5419b688→b0b1e4ac 11:07:13Z · VÄNTAR-RAM 796 MB (<2200)" — ombygget (som äger läkningen under deploylåset) väntar fortfarande: RAM **2 106 MB vid 11:12Z** (free -m), under tröskeln; felet lever tills minnet frigjors |
| Gränssnittsvakten | cron GRÖN (09-15) | senaste rapport 2026-09-16T1041 (cron igång idag) med deployklassningen i rapportens kombinationer |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E35 | LEVER 8 → **LEVER 8** | Båda hållen samtidigt: vaktbältet växer kraftigt (+21 sviter/dygn → 54, fyra nya verktyg med kontraktstester, pulsvakt driftbevisad — den FÅNGAR ett levande prod-fel, vilket är kvalitetssystemets kärnuppdrag bevisat i skarpt läge) MEN gap 3 (deploy-blockad vid RÖD) är nu EXEKTERAT av verkligheten: .next skadades (OOM-dödat bygge) och felet nådde prod utan att någon grind stoppade vägen; aggregatorn saknas fortfarande (54 sviter = provtagning) och motorregistret förblir fruset (09-03). Netto E33/B14-precedensen: kunskap tillförd, inga gap stängda — ingen poängrörelse |

**Korsvalidering C19/D24 (syskonet omgång 7:s sektion orörd, deras fynd
bekräftade + FYRA egna tillägg):** (a) **fantomkontrollen 0/42** — alla 42
grindslugar (18+24) MÄTTA mot public/deep-courses.json + data/bokmaster med
node (0 fantomer — deras kodräkning kompletteras med registeräktheten);
(b) **ADMIN_PASSWORD är SATT i prod** (närvaro mätt i .env*, värdet aldrig
läst) — admin-ruttens dev-fallback "AK1A-2026" (fas2-access route.ts:55) är
INAKTIV i prod; (c) admin-rutten hanterar **ENDAST fas2/free** — ingen
fas3-aktiveringsgren (Fas 3-aktiveringens adminväg finns ej i denna rutt,
precisering till deras gap 1-not); (d) kartans C19-begrepp "DNA-blockering"
är en SUBSTRING-FALS (grep -i "dna" träffar endast "värd**namn**") och
nyckelfilsradens fristående "/api/konvertering" existerar ej (endast
/intention) — två småkartfel som deras sektion inte rörde och som bokförs
här i stället för i deras detaljblock.

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg).

Kö till huvudagenten från fynden: (1) **pulsvakten behöver överlevnad** —
cron-rad ELLER pm2-process (idag: engångsprocess, dör vid omstart medan
prod-felet den bevakar fortfarande är olakt); (2) **gap 3 (deploy-blockad
vid RÖD) nu exekverat** — ett vaktrapports-stopp i deploy-skriptet (eller
prod-synkens poll) hade hindrat .next-skadan från att bli kundsynlig;
prioriteras om än en gång; (3) testaggregatorn viktigare för var dag som
går (54 sviter, fortfarande provtagning); (4) motorregistret 09-03 —
oförändrat fruset sedan första diffen; (5) om RAM frigjors: prod-synkens
ombygge laker .next automatiskt — E35:s nästa återdiff verifierar grönt
stil-läge + att pulsvaktens varvräknare nollställs.

## UPPDATERING 2026-09-16 (dokvåg s9-u2 omgång 6 — E34 + E29 återdiffade; ANDRA VARVET mot dagens prodincident)

Andra varvets andra dokvåg (u3 omgång 7+8 stängde första cykeln 36/36 och
inledde varv 2 med E35 — deras slutstycke uppmanade "börja där verkligheten
rört sig mest"). Objektval efter kollisionskontroll MED TRE TRÄDSKIFTEN under
mätningen: förstavalet D21 togs av s9-u1 (6fcd6621 13:02:05), andravalen C19+D24
av s9-u3 (b20f0b92 13:11:19) och E35-återdiffen av samma syskon (bf05b6d1
13:20:37) — deras sektioner lästa, orörda, systemen avstodna (s10-u3-kuren).
E34 (incidentens kärna, orörd av alla) + E29 (dagens fabrikscollisioner är
organismens eget nya mätdata) genomfördes i stället. Allt MÄTT i arbetsytan
2026-09-16 kl 13:05–13:21 (prod-sonder mot HTTPS+loopback, diskjämförelser
mot .next, node-läsning av vakternas status-JSON, svitkörning, git log,
ps, free) — inte worklog:

| Mått | Kartan | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Prod-läge vid 13:09 | (E34-raden 09-15 bär ingen incident) | **HTML 200 (115 985 B, identisk loopback+HTTPS) men 12/25 statiska resurser 404 på prod-HTTPS** — inkl. CSS-chunken 0dkvqmwqb0ena.css = KUNDSYNLIGT OSTYLAD sida; samtliga 12 saknas ÄVEN på disk i .next/static/chunks (97 filer, endast 2 css med ANDRA namn) |
| Incident-kedjan | — | 10:02:39Z prod-synkens bygge OOM-dödat → 12:02Z manuellt triggat bygge "Killed" mitt i → .next inkomplett (protokoll KVALITET-VAKTEN-DEPLOYKLASSNING-2026-09-16.md) → 10:51:58Z kraschvakten DEPLOYAD automatiskt 19 commits med nytt bygge 10:49–10:50Z — MEN artefakten ÅTER inkomplett → felet PÅGICK vid mätningen |
| ROT-FYND (djupare än "ISR-föråldring") | s8-u2 (259ae2dd) tolkade 12/25 som ISR-föråldring post-deploy | **.next/server/app/index.html är FÄRSK (12:51:39, strax efter BUILD_ID 12:50:29) och refererar DE 12 saknade chunks** — nuvarande byggets EGEN prerender pekar på filer bygget aldrig emitterade: artefaktinkonsistens I bygget, inte (endast) ISR-cache-gammal HTML; pulsvaktens diagnos "trasig-bygg" + "pm2-omstart hjälper INTE" oberoende bekräftad |
| Vakternas synlighet (E35-gränsyta) | — | alla BLINDA vid 10:02 (kraschvakt HTML-200-blind, prod-synk commit-blind, gränssnittscron 6 h-glad) — pulsvaktens fjärde sinne (s8-u2, I DRIFT) är ENDA vakt som ser felet: statiskStatus "trasig-bygg", varv 24–25, 12/25-formulerat IDENTISKT med denna dokvågs oberoende mätning |
| Läkningsläget | — | prod-synk 11:07:13Z: "NY KOD 5419b688 → b0b1e4ac; VÄNTAR-RAM 796 MB (<2200)"; RAM cirkulerade 629→2 044 MB under mätningen (två fria mätningar); pulsvakten 13:19:39Z: "trasig-bygg (deploy pågår — larm undertryckt)" — **ombygget PÅGICK vid dokvågens slut**; RAM-vaktens två vägringar (12:06, 13:07) var KORREKTA (förebyggde tredje OOM) |
| Fabriksbastal (E29) | "25 klara manifest" (mätt 09-15) | **66 klara + 1 pågående av 67** (status-katalogen mätt 13:2x) — +41 klara manifest på ETT dygn; pumpor-daemonen uppe sedan 15 sep (ps); beslutsminnet 48 poster (mätt; 32 vid senaste diffen) |
| Samtidiga syskon på DELAD fil (E29, nytt) | (regeln "exklusivt filägarskap" gäller uppdragens filer) | **DOKVÅGSUPPDRAG pekar 3 syskon på SAMMA kartfil utan lås** — mätt: TRE SYSTEMKARTAN-commits på 19 min (13:02:05 u1 · 13:11:19 u3 · 13:20:37 u3), tre dokumenterade trädskiften under denna dokvågs mätning, och en E35-sektion som skymtade i arbetsträdet ~13:1x och FÖRSVANN i en senare syskonskrivning (innehållet återställdes av u3:s egen omgång 8-commit — tur, inte mekanism) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E34 | LEVER 9 → **LEVER 8** | B7-precedensen: driftgapet nådde KONSUMENTYTAN — kunden såg ostylad sajt i timmar (10:02 → pågående 13:19) med ALLA vakter gröna; .next-bristklassen ÅTERKOM i ett "fullföljt" bygge (BUILD_ID skriven trots 12 ej emitterade chunks — nytt gap: post-build-artefaktverifiering saknas i deploy-kedjan). DR-och-backup-orkestreringen själv förblev grön (kvartals-DR 2×, dump-markörvakt, RAM-vaktens tvångsvägran korrekt) men prod-KONTINUITETEN är E34:s kärna = inte 9-läge |
| E29 | LEVER 8 → **LEVER 8** | Tillväxt mätt (66 klara manifest, +41/dygn; beslutsminne 48) men dagens omgång AVSLÖJADE ett strukturellt gap: våg 104:s "exklusivt filägarskap per agent" gäller uppdragens egna filer — dokvågsuppdrag pekar flera syskon på SAMMA kartfil utan lås/sekvensering, med clobber-bevis (försvept sektion + tre trädskiften). E33/B14-precedensen: kunskap tillförd, inget gap stängt — ingen poängrörelse |

Snittscore **7,5** (286 → 285 poäng / 38 system; E34 −1 vid denna dokvåg).

Kö till huvudagenten från fynden: (1) **POST-BUILD-ARTEFAKTVERIFIERING i
deploy-kedjan** (deploya-contabo.sh/kraschvakten): jämför
.next/server/app/*.html:s chunk-referenser mot .next/static/ FÖRE
pm2-restarten — idag skrevs BUILD_ID trots 12 saknade filer ("bygget klart"
ljuger); dagens trasiga artefakt är färdigt testobjekt; (2) **pulsvaktens
"deploy pågår — larm undertryckt" behöver tidsgräns** — undertryck utan tak
= ny blindhet om en deploy hänger; (3) **RAM-cirkeln**: om tillgängligt
aldrig når 2 200 medan pulsvakten ropar trasig-bygg — prioritera
minnesfrigörelse (väntande fabriksbarn/pumpor-täthet) framför nya omgångar
tills prod läkt; (4) **fabrikens dokvågsuppdrag behöver filsekvensering**
(låsrad per kartfil i manifestprompts, eller "commit:a din sektion innan
nästa syskon mäter") — clobberbeviset ovan; (5) E34:s nästa återdiff
verifierar grönt stil-läge + att pulsvaktens varvräknare nollställs efter
ombygget som pågick vid denna dokvågs slut.

Korsvalidering av syskonen (deras sektioner orörda): (a) u1 omgång 8:s
D21-sektion bekräftad av mina mätningar FÖRE deras commit-upptäckt — svit
13/13 grön egen körning, XP-replay-engångs+tak i kod, POST 401
{"fel":"Inloggning krävs."} live, GET {inloggad:false}; (b) u3 omgång 7:s
C19/D24 bekräftad (0 sviter, 0 alarm-trösklar, /api/track 400, /api/trafik
200 {besokareIdag:33,blockerat24h:1}, 405:orna, {"antal":7}, admin 401) —
MITT TILLSKOTT till deras C19-rad (c): delningsknappen ÄR byggd, min-sida.tsx
delaInsikter() + delningOppen (rader ~336–360, mätt) → POST /api/tracer med
samtycke:true + bekräftelsetoast — "knappen är ännu ej byggd" är FÖRÅLDRADE
kodkommentarer i rutten + tracer-mount som deras rad ärvde.

EFTERSKRIFT (13:28, egen sond): ombygget som pågick vid mätningens slut
KLARADE — pulsvakt-status "gron", varvräknaren NOLLSTÄLLD (13:27:41Z), och
huvudsidans ALLA 20 refererade statresurser svarar 200 på prod-HTTPS
(kö-item 5 här ovan är därmed redan verifierat grönt; incidentens totala
kundsynliga fönster 10:02→~13:27). RAM efter bygget 563 MB — nästa
deployväntan kvarstår.

## UPPDATERING 2026-09-16 (dokvåg s9-u1 omgång 9 — E33 ÅTERDIFFAD: prod-tömning, blockerad återimport + v2-clobberbeviset)

Andra varvets tredje återdiff (E35 togs av u3 omgång 8, E34+E29 av u2
omgång 6 — här E33, senast diffad 2026-09-15 och sedan dess drabbad av
dagens största händelse: händelseloggens prod-tömning). Varje rad MÄTT i
arbetsytan 2026-09-16 ~19:50 (ls/git/node-läsning — aldrig worklog):

| Mått | Kartan 2026-09-15 | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Prod-tabellen system_events | "COPY 0 rader i SQL-dumpen" (DR-väg = moln-JSON) | **TOM I PROD sedan 13:46** (u3 3/3:s akuta mätning, bokförd i commit a3756ab7 "efter dagens prod-tömning"); vid 19:50-mätningen INGA spår av återimport: inga nya arkiv/exporter efter 07:24, inga aterstall-spår i data/, worklogs senaste våg (179, 17:49) tyst om ämnet. Arkivet = enda kopian |
| Arkivet (enda kopian) | moln-JSON-arkivet = DR-väg | **system-events-full-2026-09-16.json.gz finns, 27,5 MB, 07:24** (ls-mätt) — taget FÖRE tömningen. Arkivkadansen OJÄMN: 09-08/09-09/09-15/09-16 på disk, lucka 09-10→09-14 |
| Återimport (DR-kedja 2) | "dokumenterat i DRIFTSBOKEN" (plan) | **MEKANISERAD**: verktyg/aterstall-system-events.mjs på disk (strömmande konstant minne, --jsonl-ut med PROD-kolumnnamn type→event_type, --plan-supabase; läser ALDRIG nycklar) — men **dedupe-läge SAKNAS** (mätt: enda "ignore-duplicates"-träffen är plan-notisen rad 205) = blockeraren lever: arkivets 4 dublett-id dödar PK-återimporten (bevisat i index-provet) |
| Composite-index (gap 3) | "MÄTT EJ INSTALLERAT — kör ALTER vid DR-fönster" | Fortfarande EJ installerat i prod — och **den kurerade v2:FÖRLORAD**: commit a3756ab7:s meddelande bokför "KURERAD v2 levererad i data/sql/ALTER-system_events-composite.sql" men `git show a3756ab7 --stat` = 6 filer, ALTER-filen EJ MED; disk OCH HEAD bär V1 (mätt: "enkla index (type…)"-headern + syntaxfelet `IF NOT EXISTS CONCURRENTLY … (type,` — det DUBBELT underkända innehållet); pathhistoriken = endast 2a55da6e 09-05. Enda v2-beviset = DR-INDEX-PROV-2026-09-16-2.md:33-34 (kurerad sats, GRÖN ~396×). Clobber-klass: våg 178/o35-precedensen (edit landar ej i commiten) — nu med bokförd-påstådd leverans i själva commitmeddelandet |
| Översättningskö (gap 1) | "320 ackumulerande" | **320 EXAKT oförändrad** (240 vantar-motor / 71 publicerad / 9 granskning, node-mätt) — ingen tillväxt på ett dygn; kund-SQL:en fortfarande okörd, men kön växer inte heller (trolig orsak: den tomma prod-tabellen ger läsarna inget nytt att publicera — tolkning, ej mätning) |
| Inventory | "23 dagar gammal" | **24 dagar** (generatedAt 2026-08-23, mätt) — fortfarande manuell avtappning, ingen auto-refresh |
| Schemadrift | "type vs event_type bevisad" | **scripts/supabase-schema.sql bär fortfarande `type TEXT NOT NULL`** (rad 58/194/221/260, mätt) — dev/prod-glidningen lever kvar; V1-filens "har idag enkla index"-påstående förblir FALSKT (prod bär endast PK — index-provets dumpbevis) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E33 | LEVER 8 → **FLAGGA 7** | Ryggradstabellen är TOM i prod sedan 13:46 med arkivet som enda kopia och återimporten blockerad (dedupe-läge saknas i aterstall-verktyget, mätt) — aktivt känt fel = FLAGGA enligt lägesordningen. Samtidigt: 0 rader förlorade (arkivet togs 07:24, före tömningen), mönstret lever i 6+ övriga system, verktygskedjan växt (aterstall + index-prov ~396× + dagens 27 DR-protokoll) — därför 7, ej lägre. Score −1 enligt E34-precedensen: kärntabellens prod-läge väger tyngre än verktygsbredden |

Snittscore **7,5** (285 → **284 poäng** / 38 system; E33 −1 vid denna dokvåg).

Kö till huvudagenten (E33:s läkeväg — ordningen BETYDELSEBÄRANDE): (1)
ÅTERLEVERERA ALTER v2: satsen står färdig i DR-INDEX-PROV-2026-09-16-2.md:33-34
(`CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_events_type_created ON
public.system_events(event_type, created_at desc)`) — filen på disk är V1 =
dubbeltrappan (syntaxfel + fel kolumn, båda bevisade). (2) Kör indexet i prod
FÖRE återimport (index-provets ordning: 396×-planen från första påfyllnadsraden).
(3) Dedupe-läge i aterstall-system-events.mjs (resolution=ignore-duplicates
eller prod-röjning av de 4 dublett-id) FÖRE återimport — annars dör importen
på PK (bevisat i skrap-PG). (4) Synka scripts/supabase-schema.sql (type →
event_type + indexet) så dev/prod slutar glida. (5) Verifiera arkivcadansen i
cron (luckan 09-10→09-14 + dagens 07:24-sista — morgondagens arkiv avgör om
kedjan lever).

## UPPDATERING 2026-09-16 (dokvåg s9-u2 omgång 7 — A3 + E37 återdiffade; andra varvet)

Fjärde återdiffen i andra varvet (E35 av u3 omgång 8, E34+E29 av u2 omgång 6,
E33 av u1 omgång 9). KOLLISIONSBOKFÖRING: denna dokvågs första tre
filredigeringar (denna sektion + två ÖVERSIKT-rader) CLOBBERADES ur
arbetsträdet av syskonet u1:s Write-commit bdaaeacb 20:16 (0 spår kvar i
HEAD) — tredje dokumenterade kartclobbern idag (efter f6669761:s bevis +
våg 178/o35); samtliga redigeringar körda om här via node-kanalen (data/
bash-tillåten) enligt u3-omgång-8-ÅTERKÖRS-precedensen, syskonets E33-sektion
orörd och respekterad. Två system med dagens största rörelse valda (A3/E37-
sektionerna orörda av alla syskon): **A3** (diffad 2026-09-15 av u1:4 —
spår 6 byggde 14 YTTERLIGARE lager efter den mätningen) och **E37** (diffad
2026-09-15 av u2 — spår 7:s o27/o31/o32 levererades idag). Varje rad MÄTT i
arbetsytan 2026-09-16 18:0x–18:2x UTC (24 svitkörningar, id-räkning i kod,
grep, node-läsning av Lighthouse-JSON, git log) — aldrig worklog-läsning:

| Mått | Kartan 2026-09-15 | Verkligheten 2026-09-16 (mätning) |
|---|---|---|
| Svars­lager (A3) | 4 lager (kedja chat-widget.tsx:740) | **18 lager i en ??-kedja** (chat-widget.tsx:876, egen läsning): makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor ?? case ?? praktik ?? portfoljgrund ?? agande ?? redovisningsdjup ?? djup ?? historia ?? lonsamhetsdjup ?? tsdjup ?? skattedjup ?? beteendedjup ?? riskdjup |
| Frågemonster (A3) | 31 deterministiska mönster | **68 monsters** (id-räknat per array: basens MONSTER 25 i ai-mentor-svar.ts + 43 i 17 frågelager-filer, ls+grep mätt); riskdjup-lagrets filhuvud bär sondens eget tal 720 kärnord LIVE ur sexton lager |
| Testsviter (A3) | 8 sviter, 164 + 38 kontroller | **24 sviter, 598 kontroller: 597 PASS / 1 FAIL** (samtliga egna körningar; 23 sviter exit 0) |
| Registeräkthet (A3) | E01 GRÖN, 343 kurser (u1:4) | **E01 RÖD (exit 1): inbakad 358 · byggd 375** — s5 levererade 17 kurser idag (352→375, git-bevisat) EFTER senaste rebaken (b3b5e2c4, 349→358): rebake-disciplinen bröts, 17 nya kurser osynliga för mentorns källmärke |
| Determinism (A3) | D01 bitidentisk | D01 PASS igen (20 frågor × 2 bitidentiska, mätt nu) |
| Koddelning (E37) | SearchModal-laty (spa-hem.tsx:22-24) | **+ SPA-sektionerna** (o27, kod mätt: PREC/PORTAL/AKTIER `dynamic ssr:false` + SektionsSkelett, spa-hem.tsx:35-45 — ~190 kB renderas-aldrig-kod ur startsidans chunk) **+ StudioChat-kedjan** (o31, kod mätt: studio-klient.tsx:36 — chatt-bunten hämtas först i authad-grenen, lås-vybesökaren bär den aldrig; bunten VÄXER med varje mentorlager) |
| Prod-mått / (E37) | O5: LCP −0,4…−1,4 s, CLS 0,000 (sv) | **o27 EFTER (r5u2b-efter-sammanfattning.json, 16:28:33Z): LCP 5 542→4 360 ms, prestandapoäng 52→53, unused-JS 83→74 KiB** · **o32 vilande facit (s7u1-vila, 16:52:38Z, load 0,56, JS-friskt bygge 22/22 chunks gröna): 0,54 / LCP 4 972 / CLS 0,000 / TBT 984** — första giltiga vilande-baslinjen sedan r4b2-ronden visade sig JS-nedbruten |
| /kurser (E37) | (O5: +7–10 poäng) | o32 vila: **0,55 / LCP 5 429 ms** (o27 FÖRE: 47 poäng / 6 040 ms) |
| /studio-EFTER (E37) | — | **fortfarande obokförd** (0 studio-s7u2c-efter-filer i lighthouse/, mätt; vakaren LEVER i ps, PID 1179591 — men o32 bokförde dess tidszonstolkningsbugg: Date.parse utan Z-suffix ⇒ 2 h fel) |
| Kvar-röda auditer (E37) | språkresolvens-CLS ~0,11 | **intermittent bekräftad** (CLS 0,110 i r5u2b-EFTER men 0,000 i vilande-facitet) + **unused-JS poäng 0 kvar (74–79 KiB), bootup 3,3–3,5 s, mainthread 7,7–7,8 s** (båda mätningarna) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A3 | LEVER 8 → **LEVER 8** | Testtäckningen nästan TREDUBBLAD på ett dygn (202 → 598 kontroller, 8 → 24 sviter, allt egethändigt grönt utom EN) och kedjan 4 → 18 lager — men den röda kontrollen är själva kontraktsbrottet: E01 registeräkthet (källmärke-kontraktet gäller ej 17 nya kurser) och ingen namngiven gap stängdes (dataset-medianer okopplade, E2E mot levande API, assistent-panel 0 sviter — mätt). Kvantitativ växt utan ny kapabilitetsklass håller 8 (E33/B14-precedensen) |
| E37 | LEVER 8 → **LEVER 8** | Två nya koddelningskur MÄTTA i kod + EFTER-tal (LCP −1,2 s på /) + första vilande-baslinjen på friskt bygge — kunskap tillförd men inga gap stängda: fortfarande inga egna regressionstester, /studio-EFTER ej landad, unused-JS/bootup röda kvar, sökindex-cadans orörd (E33/B14-precedensen) |

Snittscore **7,5** (284 poäng / 38 system — oförändrad av denna dokvåg; inga
poängrörelser, två återdiffar med läges- och kontraktsfynd — syskonets E33 −1
landade i arbetsträdet före denna sektion och är redan räknad i snittet).

Kö från fynden: (1) **registerrebake 358→375** — spår 6:s egen disciplin
(a2f0f8ee- + b3b5e2c4-precedensen): `--baka`-rader + Write/Edit-inklistring,
sedan E01 grönt + kedjesvit; tills dess når mentorns källmärken 17 kurser
för få; (2) /studio-EFTER (o31 §5) kontrolleras landad — vakaren lever men
bar tidszonsbuggen (o32 §1 18:46-notisen); (3) E37:s befintliga köer
kvarstår oförändrade (footer-läsbarhet rond 2, språkresolvens-produktbeslut
a/b/c, sökindex-hook i deploy).

## UPPDATERING 2026-09-16 (dokvåg s9-u3 omgång 9 — E34 + C16 återdiffade; korsvalideringar E33/E37/A3)

Nionde u3-dokvågen, andra varvets fjärde omgång. Race-bokföring först
(s10-u3-kuren på TRE nivåer): förstavalet E33 togs av syskonet s9-u1
omgång 9 (bdaaeacb ~19:50), andravalet A3 och tredjevalet E37 av syskonet
s9-u2 omgång 7 (bb47685f, mätt 18:0x–18:2x UTC) — alla tre upptäckta som
trädskiften under pågående mätning; deras sektioner orörda, systemen
avstodna, mina oberoende mätningar bokförs som korsvalideringar nedan.
E34 förblev FRITT (syskonets E34-diff stannade 13:21 — allt som landade
EFTER är omätt i kartan) och blev huvudobjekt; C16 (fritt sedan 09-15,
granskningsköns tillväxt = spårets egen kontext) genomfördes som andra
system. Varje rad MÄTT i arbetsytan 2026-09-16 19:49–20:4x lokal
(psql-sonder mot prod via cron-radiens exakta PGPASSFILE-mönster —
lösenordet aldrig läst; zcat+awk på nattdumpen; egna svitkörningar; egen
markörvaktskörning; egen artefaktmätning; egen mimosa-full-scan;
crontab-läsning; ps/curl/ls/node) — inte worklog-läsning:

| Mått | Kartan (senaste E34-diff 13:21) | Verkligheten 2026-09-16 kväll (mätning) |
|---|---|---|
| Artefaktverifiering (E34:s NYA gap 5) | "post-build-artefaktverifiering saknas i deploy-kedjan" | **STÄNGT I KOD + DRIFT**: verktyg/artefakt-verifiering.mjs på disk (kontrakt: VARJE /_next/static-referens i .next/server/app/*.html MÅSTE finnas på disk; gron/trasig/okand = exit 0/1/2 — mätblindhet aldrig grönt); kopplad mätt med grep: prod-synk.mjs (deploygrind FÖRE pm2-restart) + kraschvakt.mjs (ärlighetsgrind efter räddningsbygg — HTML-200 lurar varm()); svit **12/12 PASS egen körning** (lasRefs: escapade flight-JSON-referenser + %-kodad avkodning, PASS 5+8); EGEN frisk mätning av prod-artefakten: **gron**, 6 053 ms, trunkerad false |
| Crontab-kurerna | "kvar: cron-koppling + pgpass — cron-raden bär fortfarande db-lösenordet i klartext" | **MOTBEVISAT i ANVÄNDAR-crontaben** (crontab -l mätt; tidigare dokvåger läste /etc/crontab = fel källa): 02:30-raden bär PGPASSFILE=/home/ak1a/.pgpass + pg_dump 17 + **kolla-dump-markorer.mjs --natt-appenden** (s10-u1:s kö-item 1 INLÖST) + find -mtime +30-retention — inget klartextlösenord; fyra rader: 02:30 dump · 02:40 moln-JSON · 17 1,7,13,19 gränssnittsvakt-cron · sön 03:20 arkivera-server; referensfilen maskerar DATABASE_URL (konfigvakten GRÖN) |
| DR-kedjan | "kvartals-DR 2×" | **MALL = ETT KOMMANDO**: dr-total.mjs på disk; DRIFTSBOKEN:s DR-rad omskriven — TOTAL-RTO 130,0 s (13:51–13:53) + KIRURGI-kedja 5 (tabell-återställning 1,18 M rader, sabotage gripet, 14:09–14:13) + fyra-kedjeprotokoll 13:40 (RTO 17,3 s); nästa övning 2026-12-16; EGEN markörvaktskörning: **6/6 dumpar GRÖNA** (57,1 s; 09-16-dumpen 1 288 041 rader / CREATE TABLE 99 / COPY 101) |
| Prod-läge | "felet PÅGICK 13:19" | **GRÖNT bestående, egen sond**: hem 200 (115 269 B) + 2/2 CSS-chunkar 200 på HTTPS; pulsvakten LEVER (PID 1207077 ps-mätt; senasteKoll färsk vid mätning; varv 24; statiskStatus gron; antalOmstarter 1 — 19:49-omstarten överlevd = rond 51:s överlevnadsbeslut DRIFTBEVISAT) |
| Moln-arkivet | — | system-events-full-2026-09-16.json.gz lever i data/backups (repo-skyddat; syskonen 09-08/09/09/09-15) — arkivet är alltså INTE enbart /tmp-kopian |
| Granskningskön (C16) | "11 JSON + m9-ko 3 + kvartal 22 + granskning 17" | **124 filer totalt mätt** (rot 31 JSON + 2 MD · m9-ko 7 · granskning 53 · kvartal 31) — ~2,8× på ett dygn: spår 1:s m9-serie 6/6 granskningsklar + spår 3:s branschguider (försvar/detailhandel/flyg m.fl. i rotlistan) + kvartalsseriens tillväxt |
| Publicerat (C16) | 55 | **55 oförändrat mätt** (data/blogg/) — publiceringsvägen står still medan kön växer; GRANSKNINGSKO-SAMMANSTALLNING.md (09-14) åldras bakom tillväxten |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E34 | LEVER 8 → **LEVER 9** | Återgång till 9:an (höjd 09-15, avtagen 09-16 för incidenten): incidentens ROT-GAP är nu stängt mekaniskt — artefaktverifieringsgrinden kodad i BÅDA deploy-länkarna med svit 12/12 + frisk grön prod-mätning egen; DR-mallen ETT KOMMANDO med kirurgi-kedja och RTO-bevis; crontab-kurerna (pgpass + markörvakt) mätta GENOMFÖRDA i användar-crontaben; prod grön bestående + pulsvakt-överlevnad driftbevisad. Kvar: hybrid-sync, ISR 12/44, Storage-restore, system_events-återimporten (E33:s FLAGGA — beslutet huvudagentens) |
| C16 | LEVER 8 → **LEVER 8** | Kön växer KRAFTIGT (44 → 124 filer på ett dygn, ~2,8×) medan publiceringen står på 55 — gapet "kön ej kopplad + växer" SKÄRPS (B13/E33-precedensen: skärpt gap utan stängning, ingen poängrörelse); B2-flödet orört sedan 09-14 |

**Korsvalideringar (syskonens sektioner orörda, ärlig bokföring):**
(1) **E33** (s9-u1 omgång 9, bdaaeacb): bekräftar deras fynd oberoende —
system_events 0 rader i prod (egen psql-sond som tabellägaren postgres),
ALTER-filen bär V1 på disk (egen läsning: `CREATE INDEX IF NOT EXISTS
CONCURRENTLY` + kolumnen `type` — dubbelt fel), översättningskön 320
exakt (240/71/9 egen node-mätning), inventory 2026-08-23. **MITT TILLSKOTT
deras sektion saknar — dumpkontradiktionen**: nattdumpen 02:30 bär **0
COPY-rader i system_events-blocket** (två instrument: egen zcat+awk —
blocket på dumprad 1 279 988 med exakt kolumnform, block_slut_rader=0;
plus egen markörvaktskörning GRÖN 1 288 041 total) MEDAN kedja 2:s export
läste 161 678 rader vid 07:24 (arkivfilens mtime 07:24:42) ⇒ **exportens
läsväg och psql/dump kan inte läsa samma fysiska förråd** — tidslinjen
"raderade 07:23–13:46" är underbelyst (nolltalet ÄLDRE än fönstret,
alternativt olika förråd); samma klass: members=0 och user_activities=0 i
BÅDA mina instrument (prod + 02:30-dumpen) trots C19:s mätta
besokareIdag:33 vid 13:2x, medan snapshots (1 195 452, +18 984 mot
dumpen) och board_decisions (47 602, +560) lever och växer. Detta är
material till läkeköns steg 4 (schemasynk/förrådsutredning) FÖRE
återimporten skriver mot prod.
(2) **A3** (s9-u2 omgång 7): identiska tal i oberoende mätningar — 68
frågemonster (25 bas + 43 i frågelagren, id-räknat), 24 sviter på disk,
E01 RÖD 358/375 (mina körningar: bas **25 PASS · 1 FAIL** med D01
determinism PASS; beteendedjup **27/27** med J01 kärnordsdisjunktion 712
kärnord och L01 17/17 lager i ordning). Deras sektion står.
(3) **E37** (s9-u2 omgång 7): deras o27/o31/o32-fynd bekräftas (EFTER-
filerna på disk 18:20/18:26 egen ls). **MITT TILLSKOTT**: mimosa-paritet.mjs
EGEN full-scan — **687 filer, 0 fynd, GRÖN** (härdade klasser:
SSRF_INTERPOLERAD_FETCH 80 kontexter, SSRF_EXTERN_LITERAL 5, PATH_API 1,
SHELL_URL_LOOPBACK 1); lasRefs-%-kärnfixen svitbevisad i artefaktsviten
(PASS 5+8); sökindex FÄRSKT (17:08) med **paritet 375 = 375 = 375**
(siffror.json = kurser = antal i sok-index.json — dagens läge synkat,
men filhuvudets "kör skriptet efter varje kursändring" = mekanismen
förblir manuell disciplin; deras kvar-not om cadans består).

Snittscore **7,5** (284 → 285 poäng / 38 system; E34 +1 vid denna dokvåg).

Kö till huvudagenten från fynden: (1) **E33-läkeköns steg 4 breddas med
dumpkontradiktionen** — utred exportens läsväg (var läste den 161 678
kl 07:24 när psql och dumpen ser 0?) innan aterstall-system-events skriver
mot prod; members/user_activities-nollorna i båda instrumenten hör till
samma fråga; (2) **C16: GRANSKNINGSKO-SAMMANSTALLNING förnyas** (rotens
31 JSON och kvartalsserien växer förbi 09-14-vyn) + publiceringsbeslut
för kön (124 filer väntar, 55 publicerade oförändrade); (3) mimosa
full-scan (687/0) är driftbillig — kandidat för löpande vakt; (4)
/studio-EFTER-mätningen vakarens tidszonstolkningsbugg (syskonets kö,
o32 §1).

## UPPDATERING 2026-09-17 (dokvåg s9-u2, manifest auto-s9 2/3 — E32 + C15 diffade mot verkligheten)

Objektval mot duplikat EFTER kollisionskontroll: senaste kart-commits
(f4bdbd03 E34+C16 · bb47685f A3+E37 · bdaaeacb E33, samtliga 09-16 kväll)
lästa — E32 och C15 FRIA, och med dagens största verklighetsglapp:
E32 diffad 09-15 men guldkällan rördes två vågor efteråt (352→375→381),
C15 diffad 09-15 men granskningskön fördubblad sedan dess. Redigering via
node-kanal + omedelbar commit (clobber-kuren — tredje kartclobbern
dokumenterad i bb47685f). Varje rad MÄTT i arbetsytan 2026-09-17 00:5x–01:2x
lokal (node-läsning av JSON, find/ls/wc/grep/stat, git log) — aldrig worklog:

| Mått | Kartan | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| siffror.json (E32) | 337 (not 09-15) / 352 (Vad-raden) | **381 kurser · 8 223 quiz · uppdaterad 2026-09-16 · kanonSomKurs 96** (node-mätt) — s5:s kvällsvåg 378→381 (896c91ca); kartans båda tal eftersläpade, rättade här |
| registerparitet (E32) | omätt | **larvag-synk GRÖN 381=381=381 · 0 fantomer · 21 unika profilsugs** (data/vakten/larvag-synk.json, ts 2026-09-16T21:36Z) — leveranskedjan atomär: karta/register/konstant |
| sökindex | "friskt 09-15" (C18-not) | **friskt 2026-09-16 23:32** (public/sok-index.json mtime) — synkat med 381-vågen |
| priser.json (E32) | orörd sedan 2026-09-07 (fbfb135f) | **fortfarande orörd** (git-mätt; 10 dagar) — registret stabilt, speglingsfönstret ej utlöst |
| variabler/siffror-filer (E32) | variabler 133 r · lagring 362 r | **oförändrade** (wc-mätt; siffror.ts 37 r · siffror-live.ts 110 r) |
| gap 2: sifferkonsistens (E32) | "ingen aktiv divergensmätning" | **DELVIS STÄNGD MÄTBART**: kvalitetsvaktens kontroll 10 "Sifferkonsistens (rakna-siffror + föråldrade tal i copy)" = **PASS 0 fel** i senaste rapporten (genererad 2026-09-16T22:55:18Z; dagligen 07:02) — guldkällan kontrolleras MEKANISKT mot rakna-omkörning + föråldrade copy-tal; samma rapport: kontroll 6 kursdata 105 kurser PASS, kontroll 8 motorer 107/0/0, kontroll 11 tsc 0 fel/6,8 s. KVAR: runtime-divergens för siffror-live (requestlägets läsning ur lagret) mäts ej — kontrollen täcker FIL-guldkällan |
| registerparitet mot mentor (A3-gränsmått) | E01 RÖD 358/375 (u2 omgång 7) | **gapet VUXIT: 358/381** — registret fortfarande inbakat 358 (senaste rebake b3b5e2c4, git-mätt; ingen ny sedan), källan 381 ⇒ 23 kurser osynliga för mentorns källmärke; A3:s område lämnas orört, kö bokförs |
| bloggutkast-trädet (C15) | "11 publiceringsklara JSON i roten" (09-15) | **135 filer** (find-mätt: rot 36 = 34 JSON + 2 MD · m9-ko 7 · granskning 59 · kvartal 33) — 124→135 sedan u3 omgång 9:s C16-mätning kvällen 09-16; branschguide-serien (B18) + Q3-paketen driver |
| publicerade (C15) | 55 | **55 oförändrade**; senaste fil-mtime **2026-09-14** (vad-ar-skuldsattningsgrad.json) — 3 dygn utan publicering medan kön växer (publiceringsbeslutet = kundens, R2 — bokförs, ej rörd) |
| GRANSKNINGSKO-SAMMANSTALLNINGEN (C15) | "åldras" (C15/C16-not) | **MOTBEVISAD**: 55 691 B, uppdaterad **2026-09-16 22:58** — leverantörerna registrerar sig själva vid leverans nu (s4-u3 c0684b79 registrerade Iberdrola-raden); kö-vyn LEVER |
| B2-publiceringsvägen (C15) | byggd våg 82, E2E overifierad | **koden orörd-funktionell** (grep-mätt): publiceraMedPaket i src/lib/blogg-utkast.ts (deklarerad i filhuvudet :18, :553) + knappen "Publicera (skickar till agent)" i blogg-panel.tsx:335 (syns ENBART på granskade utkast); E2E fortfarande overifierat — R2-knappen är kundens |
| gransknings-underkatalogen (C15) | 17 MD + diff-JSON (09-15) | **59 filer** — KONTROLL-ärenden tillkomna (boerspsykologi-fallstugor-KONTROLL-2026-09-16.md + branschmedianer-akm2-KONTROLL-2026-09-16.md): m9-GRANSKNING-guidens levande hållning förankrad i trädet — kontroll körs VID LEVERANS, inte bara när dokvågen tittar |
| kvartalsmassan (C15/C16) | 13 i kvartal/2026-q3 (09-15) | **33** — universumets 12 bolag fullbordade (SAAB 12/12) + Iberdrola-serien + branschkalendrarna; rappfönstret 20–23 oktober nära |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E32 | LEVER 8 → **LEVER 8** | Guldkällan är FÄRSK och paritetsgrön (381=381=381, 0 fantomer, sökindex synkat) + den DAGLIGA sifferkonsistenskontrollen (kontroll 10 PASS 0 fel) mjukar gap 2 från "ingen aktiv mätning" till "mekanisk fil-kontroll — runtime-livet återstår"; men gap 1 (speglingsfönstret manuellt) och gap 3 (priser.json utan schema-validering) orörda — inga bevis som motiverar poängrörelse (B13-precedensen). Talen i ÖVERSIKT/detaljblock rättade 352/343 → 381 |
| C15 | LEVER 8 → **LEVER 8** | Flödet friskt och DOKUMENTERAT levande: B2-vägen orörd-funktionell, sammanställningen uppdaterad av leverantörerna själva (motbevisar "åldras"-noten), kön 135 och växande med KONTROLL-ärenden i trädet — men publiceringsstocken (55 sedan 09-14) är kundens R2-beslut och inga nya tester/E2E-bevis tillkommit: ingen score-rörelse |

Snittscore **7,5** (285 poäng / 38 system — oförändrad av denna dokvåg; inga
poängrörelser, endast läges- och talrättningar med egna mätbevis).

Kö till huvudagenten/nästa dokvåg från fynden: (1) **registerrebake 358→381**
(spår 6:s bokförda kö — gapet vuxit 17→23 kurser sedan u2 omgång 7 mätte det;
E01 grönt krävs); (2) publiceringsbeslutet för 135-filkön = kundens (R2) —
sammanställningen lever och får fortsätta användas som beslutsunderlag;
(3) E32 gap 1+3 lever (speglingsfönster + priser.json-schema); (4) runtime-
divergens för siffror-live som rest av gap 2 (E2E-mätning vid tillfälle).

## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 10 — E27 + E28 + E30 återdiffade; andra varvet)

Val: tre mest mogna system (diffade 2026-09-15, aldrig återdiffade —
andra varvet tog E35/E34/E29/E33/A3/E37/C16 under 09-16; syskonet s9-u2
tog E32+C15 i natt, sektion ovan). Allt MÄTT i arbetsytan 2026-09-17
~01:1x CEST (live-curl localhost, egen svitkörning med sann exitkod,
ps, grep, filstat) — aldrig worklog-läsning.

| Mått | Kartan 2026-09-15 | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| **E27** gap 4 "usage/cost-panel tunn i UI" | öppet | **MOTBEVISAT** — våg 169 (a77bb1a3, 09-16) lever: lasV4Anvandning i transporten + /api/studio/tjanster/usage-v4 (monterad, 401-härdad) + UI-konsumenter (studio-forbrukning-panel m.fl.) — gapet streckas |
| E27 stream-rutten | 759 r, tradHistorik + återarming (v148) | OFÖRÄNDRAT levande: tradHistorik :177/:265/:334, mål-återarming :280 + :475; live /studio 200, /api/studio/stream 401 (auth ≠ 404 = monterad) |
| E27 nytt sedan 09-15 | — | våg 164–175 (11+ studio-commits): maskinpuls (3 pumpor synliga; HÖG-fynd → målsession 30-min tak), verktygsaudit, pub-rutten publiceringsgrindad mot juridikgrinden (v168), värme-kontext/sticky-complete (v170: kunden ser aldrig 0% under uppvärmning), v4-resync (v172), v4-command sendText etapp 2 (v175), godkännandeytan (g1: R2-knappen är kundens) |
| **E28** mötesprotokoll | lever till 09-15 07:55 | OFÖRÄNDRAT: STYRELSE-BESLUT.md mtime 09-15 07:55, senaste mötet 09-15 05:17 (FULL DELEGATION) — inga sammanträden på 2 dygn = inga har krävts (kunden delegerade fullt), ej motorfel |
| E28 ronder | "cron var 3:e timme" | **DRIVKÄLLA-PRECISION:** ronderna LEVER men drivs av PUMPOR-DAEMONEN (ps: uppe sedan 16 sep; rop min==43 && timme%3==1 → 01:43…22:43), INTE crontab (användar-crontaben bär 4 rader — backup/gränssnittsvakt/moln/server-arkiv, ingen rond-rad); beslutsminnet 55 poster, senaste 2026-09-16T20:43Z = exakt 22:43-fönstret; juridikgrind-vakten ropas :37 FÖRE varje rond (mega g2-integration) |
| E28 gap 1 JSON-fallback | öppet i senaste mötet | KVARSTÅR: 4 fallback-träffar totalt, senaste mötet (09-15 05:17) bär dem; "Åtgärder: (inga)" endast i 09-10-mötena (rad 17/31/45) — omgång 3:s bild håller |
| **E30** läge INAKTIV | noindex "Under uppbyggnad", robots | BEKRÄFTAT live: /pro 200 + "Under uppbyggnad" + noindex; robots stänger /pro/admin + /studio + /api/studio; grind-sviten EGEN körning sann exit 0 (N4: sokindex STATISKA filtrerar, sitemap grindar /pro-URL:er, /priser hardcodar ej index) |
| E30 demoklient-G1 | röd (16/1) | FORTFARANDE röd: 16 PASS / 1 FAIL (AKM2Resultat saknas i demodata) — gap 4 öppet |
| E30 B2B-terminologi-vakt | fanns ej | **NY KUR 09-16 (s8-u3, 4c77d419):** kvalitetsvaktens YTA-regel normaliserar route-gruppen (huvud)/pro/** via arProYta (kvalitetsvakt.mjs:327–333 + transparent rapportrad :450; spegeln varumarke.ts yta?.proYta :136–153) — PRO-ytans "kunder" är legitim B2B-terminologi; vaktkörning efter kur 11/11 PASS 0 fel (s8-u3-bevis) |

Score: E27 9 kvar (gap 4 motbevisat men inget nytt testgap — E33/B14-
precedensen), E28 FLAGGA 6 kvar (gap 1 öppet; protokollen tysta men
ronderna lever), E30 INAKTIV 6 kvar (aktivering väntar fortfarande jurist
K-B2B + kund R2 — orörd). Snitt 7,5 / 285 / 38 OFÖRÄNDRAT. Kö till
huvudagenten: (1) STYRELSE-REGELVERKET §3:s "cron verktyg/styrelse-rond.mjs"
rättas till pumpor-daemonen som drivkälla (dokumentationsprecision, ingen
kodändring); (2) E28 gap 1 (JSON-reparatur) är motorns enda rörliga poängväg;
(3) E30 demoklient-fixturen (AKM2Resultat) fixas innan B2B-paketet hämtas fram.

## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 10 — E35 ÅTERDIFFAD: kontroll 11 + GRÖN vaktdrift + tmp-falsklarmet)

Tredje E35-passningen (första 09-15, återdiff 09-16 13:20 av u3 omgång 8) —
andra varvets regel "börja där verkligheten rört sig mest sedan senaste
passningen" pekar hit igen: s8-vågen (1f43c167 + 88c6fe26 + 4c77d419,
22:52–23:02Z natten till 09-17) levererade en hel kontrollvåg I E35:s
värld efter senaste mätningen. Syskonrace avbokat: s9-u2 (E32+C15,
ebb36da1) och s9-u3 omgång 10 (E27+E28+E30, 826de54c) landade committade
under detta fönster — deras sektioner orörda; u3:s E30-rad bokför YTA-
kurens B2B-sida, här mäts VAKTSYSTEMETS sida av samma kur. Allt MÄTT i
arbetsytan 2026-09-17 ~01:2x lokal (egen full vaktkörning, tre svitkörningar,
tsc via projektbinären ×2, prod-sonder loopback+HTTPS, ps, ls, grep,
git log) — aldrig worklog:

| Mått | Kartan (E35-diff 09-16 13:20) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Kontrollantal | 10 kontroller | **11** — KONTROLL 11 Typbaslinjen: tsc via PROJEKTBINÄREN (node_modules/typescript/bin/tsc — ALDRIG npx, deployfönstrets dummy-paket-fälla), budget 120 s, klassning enligt falsklarmsdoktrinen (typfel = baslinjebrott-FEL · node_modules-fel = MANUELL deploy-transient K2/K3 · saknad binär/timeout = MANUELL OMÄTT, aldrig tyst PASS) — kodad i 1f43c167; rotorsakan: typnollen var mekanisk ENDAST vid commit, merge-committar passerar pre-commit-grinden ⇒ dagligt 07:02-bevis i stället för commit-antagande |
| kvalitetsvakt.mjs | 36 748 byte | **55 942 byte** (mätt): arProYta() normaliserar route-gruppssegment FÖRE yta-match (rad 333 — globen ^src/app/pro/ var död sedan födseln, pro-rutterna bor i (huvud)/pro/**) + A8-ETIKETT-UNDANTAG med räknare + transparent rapportrad (rad 396–451; o26-doktrinen: vakten döljer aldrig) |
| Vaktrapport | 4 MANUELLA-träffar (s8-u3:s utgångsläge) | **11/11 PASS · FEL 0 · MANUELLA 0 · GRÖN — EGEN full vaktkörning 23:22:01Z** (exit 0; s8-u3:s 22:55:18Z-körning likaså GRÖN, rapportfil mätt före omkörning); YTA-undantag 4 träffar + A8-etikett 1 redovisas TRANSPARENT i sektion 3; FOMO-texten kurerad i superanalys.tsx ("Efter detta steg låses" — 1 träff, mätt) |
| **NYTT FALSKLARM-FYND** | — | **tmp_demoklient_koll.ts LÄCKT i trädet** (01:19, untracked, mätt): genererad av testa-demoklient-data.mjs vars finally-unlink (rad 131–133) ej överlever SIGKILL (sviten dödades mitt i — fabriks-/tidsgränsklassen); följder MÄTTA I KEDJA: kvalitetsvaktens sektion 11 FAIL (GUL 23:19Z) + egen tsc-körning exit 1 (TS2345 i tmp-filen rad 64) + tsc-sviten 9/2 FAIL = pre-commit-grinden hade blockerat ALL commit; roten är MÄTKOLLISION (trasigt arbetsTRÄD, ej kodbrott — vakten mätte äkta fel med fel rot); kur: filen raderad (dess egna header "Raderas efter körning") ⇒ tsc 0 + vakt 11/11 GRÖN + svit 11/11 PASS (tre egna återmätningar) |
| Prod-stil-läge (köpost 5 från omg 8) | ostylat-läget pågick | **GRÖNT**: hem 200 + första CSS-chunk 200 på loopback + hem 200 HTTPS (egna sonder); pulsvakt lever:true · statiskStatus "gron" · varv 330 · PID 1207077 (ps) — omg 8:s båda verifieringskrav uppfyllda |
| Deploy-blockad (gap 3) | "EXEKTERAT — ingen grind stoppade vägen" | **ARTEFAKT-KLASSEN MEKANISKT STOPPAD**: prod-synk.mjs importerar verifieraArtefakt (rad 50) och mäter FÖRE pm2-restart (rad 236–241: status ≠ gron ⇒ deploy_stoppad_artefakt — EJ omstart, EJ DEPLOYAD-markör) + kraschvakt.mjs ärlighetsgrind (rad 39+187: friskEfter = varm() && artefakt===gron); MEN vaktrapports-stoppet (RÖD kvalitetsrapport ⇒ deploy-stopp) saknas fortfarande — gapet NARROWAT, ej stängt |
| Testsviter | 54 | **69** (ls mätt) — aggregator-gapet VÄXER |
| Ny svit | — | testa-kvalitetsvakt-tsc.mjs **11/11 PASS egen körning** (efter tmp-städningen; första körningens 2 FAIL VAR fyndet — sviten kör vakten och fångade det smutsiga trädet korrekt = sviten gör sitt jobb) |
| Motorvalidering | 107/0/0 | **107 PASS / 0 FAIL / 0 SKIP (7,7 s, EGEN körning)** |
| Motorregistret | fruset 09-03 | **fortfarande fruset** — efff399c 2026-09-03 (git mätt; 14 dagar) |
| Övrigt bälte | — | granssnittsvakt.mjs 36 748 byte oförändrad (deployklassningen kvar); testa-mimosa-paritet.mjs på disk (metodfångsten lever) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E35 | LEVER 8 → **LEVER 8** | Kapabilitetstillväxt på PLUS-sidan (kontroll 11 gör typbaslinjen DAGLIGT mekanisk, vaktkörning 11/11 GRÖN med 0 manuella, artefaktgrind kodad i deployvägen, YTA/A8/FOMO-kurerna stänger falska träffar) mot tre MINUS-vikter: aggregator-gapet växer (69 sviter = fortfarande provtagning), motorregistret fruset 14 dagar, och dokvågen fångade ett NYTT öppet gap — tmp-läckage-klassen (SIGKILL-dödad svit lämnar tmp_*.ts som bryter baslinjen OCH commit-grinden; falsklarmsdoktrinens gråzon bevisad i skarpt läge). Netto E33/B14-precedensen: kunskap tillförd, inget namngivet gap FULLT stängt (artefakt-klassen ja, vaktrapport-stoppet nej) — ingen poängrörelse |

Snittscore **7,5** (285 poäng / 38 system — oförändrad av denna dokvåg).

Kö till huvudagenten från fynden: (1) **tmp-skydd mekaniseras** — vaktens
sektion 11 och/eller pre-commit-grinden städar eller ropar ut
tmp_*_koll.ts i trädet FÖRE mätning (motorvalideringens tmp sköter sig
inom sin egen process — oskadad); annars kan varje SIGKILL-dödad
svitkörning låsa ALLA commits tills manuell städning (idag: dokvågens
handgrepp) — **STÄNGT 09-17 s8-u2 (vakt/grind-halvan: tmp-stad.mjs i
pre-commit + sektion 11, svit 15/15 + levande läcka-genom-commit-bevis)
med s8-u1:s rot-halva (tmp-generering → .tmp/) pågående parallellt —
kollisionsnotis data/vakten/s8-tmpskydd-kollisionsnotis-u2.md**; (2) aggregatorn (54 → 69 sviter på två dygn — provtagningen
glesare för varje dag); (3) motorregistret 14 dagar fruset; (4) gap 3:s
sista halva: vaktrapports-stopp i deployvägen (artefaktklassen stoppad,
RÖD kvalitetsrapport blockerar fortfarande ej).

## ÖVERSIKT — 38 system

| # | System | Grupp | Läge | Score | Topp-gap |
|---|--------|-------|------|-------|----------|
| A1 | Kursplattformen (381 kurser, quiz, XP, case) | Utbildning | LEVER | 8 | Fullständigt kurs-CMS saknas; kurs-access utan egen testsvit |
| A2 | Lärvägen + läroplanen | Utbildning | LEVER | 7 | H1 stängt sedan v99 (kartan efter); 381 kurser, paritetssynk GRÖN, front-B-bevis; regressionssvit för rekommendationsreglerna saknas |
| A3 | AI-Mentorn (18 deterministiska svarslager + modellager) | Utbildning | LEVER | 8 | 597/1-testbevis över 24 sviter (mätt 09-16; E01 registeräkthet RÖD 358/375 — rebake väntar); dataset-medianer okopplade; E2E mot levande medlems-API återstår |
| A4 | Daglig träning (dagens pass, veckoplan, kunskapsflöde) | Utbildning | LEVER | 7 | 0 egna sviter; streak/XP (member-local lasStreak) ej validerad — kartens determinism- och vagscan-gap MOTBEVISADE i kod+prod (mätt 09-16) |
| A5 | Gamification (badges, certifikat, topplista) | Utbildning | LEVER | 7 | 0 egna sviter; SKÄRPT (mätt 09-16): /api/topplista POST utan sessionsvakt (e-post ur klient-body, senaste-vinner); certId kollisionsbart (AK1A-år-XP, ingen medlemshash) |
| A6 | Biblioteken (bokmaster, bokkanon, forskningsbiblioteket) | Utbildning | LEVER | 7 | Verktygskedjan manuell (integrera/fixa/lagg-till-kalla; ingen lint-dörr); läspaketserien fullbordad 11/11 + Nordea i granskningskön (mätt 09-16); universum 22 vs 11 tickers (2 gemensamma) |
| B7 | AKM2-analysmotorn + analysidorna | Analys | LEVER | 8 | Kärnan 156 kontroller grön (mätt 09-16); berika-pipelinen stillastående 12 d (0 cacher på disk), AKM3-ensemble 0/22 i prod, snapshot-svit env-känslig |
| B8 | AKM3 (regim, kalibrering, ensemble) | Analys | PÅGÅR | 7 | Konstruktion topp (55/55, LÅST grind ΔΦ=0, hash-kedjor; mätt 09-16); men kalibreringen ENBART Vercel-cron-driven (Contabo-crontab saknar raden, mätt), regimen FROSEN på genesis 09-03 (uppdateringsvägen vagvalidering finns ej på Contabo), ensemble-vy 0/22; n_eff-målet 8–12 kvartal bort |
| B9 | Vågsystemet AK1TS (vagfundament, vagkon, vagscan) | Analys | LEVER | 8 | Skanning dagligen färsk (05:05Z mätt); DUBBEL cron-drivning (Vercel 05:00Z + /etc/crontab 06:30 lokal, mätt 09-16 — användar-crontab tom gav syskonet fel källa); valideringsrapport 12 d gammal; träff-% osynlig publikt |
| B10 | Konfluensradarn | Analys | LEVER | 7 | Fem-källors-logiken LEVER live (API-sond färsk 09-16, datakällor per rad); motorvalidering 107/0/0 egen körning; kvar: 0 egen svit, historik/utfall lagras ej (mätt), korstabell-kopplingen konceptuell ej kodad |
| B11 | Net-net-skannern | Analys | LEVER | 6 | Determinism-grönt stabilt (107/0/0 egen körning 09-16 + /api/netnet färsk live-sond); universum fast 25 (mätt); egen testsvit saknas fortfarande |
| B12 | Superanalysen + AKM1-kalkylatorn | Analys | LEVER | 7 | Kärnprofilen superanalys-2026 svit-testad (kontroll 22) men klientfilen 0 sviter; länk-gap MOTBEVISAT (MODUL_KURS_LANK lever); klientens vikter oberoende kopia av kärnans (mätt 09-16) |
| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (mätt 09-16); korstabell-grund frusen 09-03 (100 r) mot bolagsunivers 120; member/portfolio UTAN sessionsvakt på publik yta (/min-portfolj, mätt); peer-median = designbeslut (AKM3 §10.10) |
| B14 | Nyheter + marknadsdata | Analys | LEVER | 6 | 0 sviter (mätt 09-16); DUBBEL cron-drivning (Contabo 08:00 lokal + Vercel 08:00 UTC); CRON_SECRET ej satt; fallback-vägar otestade |
| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B STÄNGT (A består, beslut 2026-09-07); B2-publiceringsknapp lever (v82); kvar: B2-E2E, OG default tills deploy |
| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp finns (v82 — gamla "saknas" motbevisat); M9-kön ej kopplad + växer (11 JSON + 22 kvartalsfiler: 12 bolagspaket + 10 kalendrar, mätt 09-16); schemalagd re-run saknas |
| C17 | Dataset-citeringsmagneter | Innehåll | LEVER | 9 | Aspektsystemet (v150) i kod men saknat i kartan; kvartalsserien v152: kalendrar+bolagspaket i granskningskön, /kvartalsdata-src kvarstår; aspekt-testsviten TRASIG |
| C18 | SEO/schema/llms.txt | Innehåll | LEVER | 9 | G1-slutverifikation (Google rich-results live) återstår |
| C19 | Trafik, spår & konvertering | Innehåll | LEVER | 7 | 0 sviter + 0 alarm-trösklar (mätt 09-16); GDPR-gatingen KODAD för trafik-rapportören men PageViewBeacon sänder före samtycke (mätt 09-16 — spår till Supabase + sessions-localStorage före varje val, mot kakmodalens eget 2022:482-citat); P6 även koddokumenterad |
| D20 | Inloggning & konto (L1) | Medlem | LEVER | 8 | Glömt-lösenord-flödet LEVER (recover + neutral talkart + egen rate-limit, mätt 09-16); verifiering PÅ (ej_bekraftad-gren); kvar: E2E-svit + glomt-grenen otäckt av sviten |
| D21 | Medlemsdata & progress (molnet) | Medlem | LEVER | 8 | GDPR-export/radering saknas i UI (mätt 09-16); replay-skyddet MOTBEVISAT (importtak + engångs-import, kodat sedan våg 87); 4 rutter ALLA vaktade (mätt 09-16); sviter 13/13 + 17/17 grön egen mätning |
| D22 | Betalning & prenumerationsstomme | Medlem | **VÄNTAR** | 5 | Ingen betalmotor alls (Stripe saknas); kundens 8 beslut |
| D23 | Prisstegen (portfölj-tier) | Medlem | VÄNTAR (flagga) | 7 | NEXT_PUBLIC_TIER_AKTIV ej satt — väntar kundens prisbeslut |
| D24 | Fas 2/3-access | Medlem | LEVER | 8 | Fas-set 18+24 EXAKTA i kod (mätt 09-16, underlag 369 kurser); aktivering EN medlem/anrop men sido-kön starkare än kartan (system_events + VBOUT-lead); elevstatus visas — ansökningsutfall saknas; cert-verifiering saknas; rate-limit i ansökningsrutten saknas (nytt, mätt) |
| D25 | Referral + e-post + notiser | Medlem | LEVER | 6 | Brev-leverantör OKONFIGURERAD (mätt 09-16: 0 env-variabler + /etc/crontab saknar email-raden = inga brev kan skickas från prod); VBOUT-lead-leden SATT (saknades i kartan); validering + rate-limit kodade (400 mätt i prod); notis-tak 100 ej 50; referral-adminvy delvis (antal, ej identitet — GDPR); 0 sviter |
| D38 | Medlemsnavet — Min Sida-portalen (AnalysNavet, KursNavet, PortfoljNavet, bevakning) | Medlem | LEVER | 8 | Inga egna E2E-tester (mätt 09-16); pass.namn-API-texter fortfarande svenska i alla grenar (mätt); förhandsfyllnad lever ej; gäst-flödet enklare; prod /min-sida 200 |
| E26 | Admin-panelen ("WordPress-drömmen") | Styrning | LEVER | 8 | Godkännandeyta + audit + mekanisk juridikgrind LEVER (mega-beslut spår 1–2, mätt 2026-09-15); kvar: manuell spegling, juridik-FP på meta-texter, publicera-E2E (R2-knapp orörd) |
| E27 | Studio (Z-portalen) | Styrning | LEVER | 9 | Paritetstak 39/91 (binär 3.11.2-22); -32031 efter omstart; skal-kvot-häng = process-kur i AGENTS.md; usage-v4-panelen LEVER (v169 — gap 4 motbevisat, mätt 09-17); våg 164–175 tillförde maskinpuls + publiceringsgrind + resync + godkännandeyta |
| E28 | Styrelsemotorn (AI-styrelsen) | Styrning | **FLAGGA** | 6 | Mötet stilla sedan 09-15 05:17 (FULL DELEGATION — inga sammanträden krävts, ej motorfel); RONDERNA lever via pumpor-daemonen (min 43, timme%3==1 — crontab bär ingen rond-rad, mätt 09-17); JSON-fallbacken kvar i senaste mötet: gap 1 öppet |
| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik+evighetsmotor+uppdragsprotokoll mekaniska (66 klara manifest av 67, +41/dygn mätt 09-16; pumpor i ps; beslutsminne 48 poster); NYTT GAP mätt 09-16: dokvågsuppdrag pekar syskon på SAMMA kartfil utan lås (3 commits/19 min + clobberbevis); kvar: egen testsvit, CRON_SECRET, 28 motorer utan triggare |
| E30 | B2B / AK1A PRO | Styrning | INAKTIV | 6 | Väntar jurist (R2); grind-grön i egen körning (sann exit 0, mätt 09-17); demoklient-G1 fortfarande röd (16/1); kvalitetsvaktens YTA-regel täcker (huvud)/pro/** sedan 09-16 (arProYta-kuren) |
| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS-röden i motorvalideringen BORTA (107/0/0 mätt 2026-09-15 — gamla fyndet historik); I1-kvalitetsaudit + tier-spegel-gap kvar |
| E32 | Guldkällorna (variabler + siffror) | Grund | LEVER | 8 | 320 poster i översättnings-fallback-kön; speglingsfönster manuell |
| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | **FLAGGA** | 7 | PROD-TÖMT 09-16 (mätt): system_events tom sedan 13:46, arkivet 09-16 07:24 = enda kopian (27,5 MB), återimport MEKANISERAD men blockerad (dedupe-läge saknas, mätt) + KURERAD ALTER v2 FÖRLORAD i clobber (commit a3756ab7 bokför leveransen men saknar filen — disk/HEAD bär V1, dubbelt underkänd; enda v2 = index-provets protokoll rad 33); DR = SQL + moln-JSON (mätt); översättningskö 320 oförändrad (kund-SQL krävs) |
| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 8 | PROD-INCIDENT 09-16 (mätt): OOM-kedja → .next inkomplett → KUNDSYNLIGT OSTYLAD 10:02→pågående 13:19 med alla vakter blinda utom pulsvaktens nya sond; bristklassen ÅTERKOM i "fullföljt" bygge 12:50 (färsk prerender refererar 12 ej emitterade chunks — 12/25 × 404 mätt mot prod OCH disk); läkning = ombygge vid RAM≥2200 (pågick vid mätningens slut); DR/backup själv grön (kvartals-DR 2×, dump-markörvakt, RAM-vaktens vägran RÄTT); NYTT GAP: post-build-artefaktverifiering; kvar: cron-koppling + pgpass, hybrid-sync, ISR 12/44, Storage-restore |
| E35 | Kvalitetssystemet (vakten, motorvalidering, verktygsbälte) | Grund | LEVER | 8 | 11 kontroller (KONTROLL 11 Typbaslinjen: tsc dagligen mekaniskt via 07:02-pumpan, projektbinär) + 11/11 PASS · 0 manuella · GRÖN egen vaktkörning 09-17; artefakt-klassen av gap 3 mekaniskt stoppad i deployvägen (prod-synk verifieraArtefakt FÖRE pm2-restart + kraschvakt-ärlighet, kod mätt); kvar: aggregator (69 sviter = provtagning), motorregister fruset 09-03, NYTT tmp-läckage-gap (SIGKILL-dödad svit lämnade tmp_*.ts som bröt baslinjen + commit-grinden, mätt 09-17), vaktrapports-stopp i deploy saknas |
| E36 | Mediebiblioteket | Grund | LEVER | 9 | 18/18 mätt igen (09-15); OG-koppling manuellt kvar (0 träffar i deploy-skriptet, mätt); media-backup utan cadans |
| E37 | Navigering & app-yta (palett, sökindex, PWA, menyer) | Grund | LEVER | 8 | + SPA-/StudioChat-koddelning mätbevisad i kod (o27+o31; LCP 5 542→4 360 ms på /, o27 EFTER) + vilande facit på JS-friskt bygge (o32); kvar: inga egna tester, /studio-EFTER obokförd, språkresolvens-CLS intermittent, sökindex-cadans |

Snittscore: **7,5/10** (285 poäng / 38 system; E34 +1 vid omgång 9:s återdiff (artefaktverifieringsgrinden stänger incidentens rot-gap); E35/E29/E30/E37/A3/E34 +1 vid
dokvågorna 2026-09-15, D20 +1 samt B7 −1 och E34 −1 vid dokvågorna 2026-09-16
— glömt-
lösenord-flödet mätbart stängt resp. berika-pipelinen stillastående +
AKM3-ensemble 0/22); C15+C16 reviderade utan scoreändring; u3 omgång 2
diffade C17/C18/E32 och omgång 3 E33/E28 med egna mätbevis utan
poängrörelser; u3 omgång 5 (09-16) diffade B13/B11/B10 utan poängrörelser;
u3 omgång 6 (09-16) diffade A4/A5/B12 utan poängrörelser — två motbevisade gap
(A4), ett skärpt säkerhetsgap + besvarad certId-fråga (A5) och en inverterad
delningsbild (B12), allt med egna mätbevis; u1 omgång 7 (09-16) diffade D25
utan poängrörelse — brev-leverantören mätt OKONFIGURERAD, VBOUT-lead-leden
tillagd i kartan, notis-taket rättat 50→100); u1 omgång 8 (09-16) diffade
D21 utan poängrörelse — replay-skyddet MOTBEVISAT (importtak + engångs-
import kodat sedan våg 87, svit-testat), fyra API-rutter ALLA vaktade
(mätt), sviter 13/13 + 17/17 grön egen mätning, GDPR-gapet kvarstår;
u3 omgång 7 (09-16) diffade C19/D24 utan poängrörelser — samtyckesgatingen
delvis motbevisad + PageViewBeacon-fyndet (sänder före samtycke), fas-seten
18/24 exakta i kod, nytt rate-limit-gap i /api/fas2-ansok — och därmed är
ALLA 36 diffbara system diffade (fullständig diff-cykel; D22/D23 väntar
kund-R2); u3 omgång 8 (09-16) INLEDDE ANDRA VARVET med E35-återdiff utan
poängrörelse — vaktbältet 33→54 sviter på ett dygn, pulsvakt + statisk
sond + konsol + deployklassning tillkomna (s8), pulsvakten driftbevisad
fånga ett PÅGÅENDE kundsynligt stil-lös-fel (12/25 chunks 404 mätt 11:12Z;
läkning = prod-synkens ombygge vid RAM≥2200), motorvalidering 107/0/0 egen
körning; s9-u2 omgång 6 (09-16, andra varvet) återdiffade E34/E29 mot dagens
prodincident — E34 −1 (kundsynligt ostylad prod i timmar med blinda vakter =
B7-precedensen; bristklassen återkom i "fullföljt" bygge), E29 orörd trots
mätt tillväxt (66 klara manifest) men nytt clobberbevis för delade
kartfiler bland samtidiga dokvågssyskon; u1 omgång 9 (09-16, andra varvet)
återdiffade E33 — **FLAGGA 8→7**: händelseloggens kärntabell TOM i prod
sedan 13:46 (arkivet = enda kopian, återimport blockerad på saknat
dedupe-läge, allt mätt) + v2-clobberbeviset (kurerad ALTER bokförd i
a3756ab7:s meddelande men EJ i commitens träd — disk bär V1); 0 rader
förlorade (arkivet togs före tömningen); u3 omgång 10 (09-17, andra
varvet) återdiffade E27/E28/E30 utan poängrörelser — E27 gap 4
(usage-panelen) motbevisat av våg 169, E28 rondernas drivkälla preciserad
till pumpor-daemonen (crontab bär ingen rond-rad; mötesprotokollen tysta
sedan 09-15 = inga sammanträden krävts), E30 INAKTIV-läget + grön grind
bekräftade live och YTA-vaktens pro-täckning (arProYta) bokförd.
Sämst: betalning (5). Bäst: Studio, Dataset, SEO,
Mediebibliotek (9).

---

# A. UTBILDNINGENS KÄRNA

## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u3): talen rättade mot guldkällan — 337 kurser,
8 223 quizfrågor (82 230 XP), fas2 18 / fas3 24 (data/siffror.json,
regenererad 2026-09-15 av rakna-siffror efter s5-vågens fyra kurser:
balansräkning, DuPont, soliditet/räntetäckning + V-spåret 20/20 i
kurskartan; larvag-synk GRÖN 337=337=337). Score oförändrat — samma
kontraktsbrott kvarstår i gaplistan. Senare samma dag (s9-u1:4-mätning):
registerrebake 337 → **343 kurser** (siffror.json + commit 570c51ee +
E01-äkthetstestet) — talen i Vad-raden gäller 343.* Ännu senare (s9-u2 2/3-mätning 2026-09-16): **352 kurser** (mx-vågorna kväll 09-15; quiz 8 223 oförändrad — nya kurser bär inga quiz). Senast (s9-u2 dokvåg 2026-09-17): **381 kurser** (s5:s kvällsvåg 09-16, 896c91ca; quiz 8 223 fortfarande oförändrad — larvag-synk GRÖN 381=381=381 · 0 fantomer, mätt).

- **Vad:** Plattformens ryggrad: 352 kurser × 3 språk (deep-courses.json,
  103 bokmaster-kurser + egna), 8 223 quizfrågor (82 230 XP), 201 analyscase
  (/labb), kurs-access i tre nivåer (gratis-Fas 1 för alltid, 18 Fas 2- och
  24 Fas 3-kurser bakom ansökan), XP/stjärnor per kurssteg.
- **Nyckelfiler:** src/lib/content.ts (199 r), src/lib/kurs-access.ts (274 r,
  väl kommenterad med vitlista), src/lib/kurs-metadata-live.ts,
  src/lib/kurstips.ts, public/deep-courses.json, data/bokmaster/*.json (103),
  src/app/(huvud)/kurser/**, src/components/ak1a/kurs-*.tsx (11 komponenter),
  src/app/api/kurs/**, verktyg/rakna-siffror.mjs → data/siffror.json.
- **Observation:** Kvalitetsvakten PASSAR kursdata-konsistens, JSON-giltighet,
  länk-validitet och sifferkonsistens (0 fel i alla). siffror.json är
  genererad guldkälla med källhänvisning i filhuvudet. Kursmetadata är
  redigerbar live (16/16 tester gröna, se E26). Bokmaster-integrering har
  idempotenta verktyg (integrera-bokmaster, fixa-tabeller, sanera-aao).
- **GAP (till 10/10):** (1) kurs-access.ts — access-kärnan (nivåmatchning,
  override-läsning) saknar egen testsvit; (2) fullständigt kurs-CMS (ägande
  hos expand-courses-cron) — endast metadata redigerbara i admin; (3)
  quiz-frågornas kvalitet/entropi omätet (ingen dubblerings-/svårighetsgrads-
  analys); (4) /labb-casen (201 st) saknar uppdateringspipeline.

## A2. Lärvägen + läroplanen — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 4): H1 STÄNGT sedan våg 99 —
STYRELSE-ADMIN-MEGA.md:949 "H1 LÄRVÄGS-SYSTEMET KLART (front B): status­
revision av B1-LARVAG + fullbordan … visas på min-sida" (2026-09-11);kartans
"PÅGÅR (H1)" speglade aldrig beslutet. Registret 333 → **352 kurser**
(siffror.json mätt 2026-09-15: s5-spåret + mx-vågorna byggde 19 kurser under
dagen, sista kvällen 343→352 — fortsättningskurser med FRONT B-bevis 3/3 +
5/5 GRÖNA mot riktiga motorn via importbro-v82-mönstret); larvag-synk.mjs
GRÖN (egen körning, exit 0): register 352 = karta 352 = konstant 352, 21
profilkurser, 0 fantomer; min-sida-visning kodad (LarvagKort, min-sida.tsx:
857). Läge PÅGÅR → LEVER, score 7 kvar — se diff-tabellen i
UPPDATERING-sektionen.*

- **Vad:** Personlig nästa-kurs-rekommendation med varför-rad ur medlemmens
  progress, kategori och anonyma quiz-svagheter; läroplansvy (/laroplan).
- **Nyckelfiler:** src/lib/larvag.ts (458 r, ren deterministisk kärna),
  src/lib/larvag-karta.ts, src/lib/larvag-klient.ts, src/app/api/larvag/
  route.ts (force-dynamic, GDPR-tvättad kontext), src/components/ak1a/
  larvag-kort.tsx, src/components/ak1a/laroplan.tsx, verktyg/testa-* saknas.
- **Observation:** Kärnan är riktigt bra: determinism dokumenterad ("samma
  indata ⇒ samma svar"), anonyma quiz-svaghetsräknare (type=quiz_svaghet,
  "polystrar aldrig fram någon elev"), varför-radar ur vinnande regler.
  H1 (våg 99) = statusrevision av B1-LARVAG — koden ser färdig ut sedan
  våg 88; dokumentationen hänger efter koden.
- **GAP:** (1) ingen egen REGRESSIONSSVIT för raknaLarvag-reglerna (varför-
  radernas prioritet kan regressera tyst) — larvag-synk.mjs är paritetsvakt
  (register↔karta↔profiler, GRÖN mätt) och front-B-sonderna är leveransbevis,
  ingen av dem fångar regelregression; (2) ~~H1-statusrevisionen~~ STÄNGD
  (våg 99, dokumentbevis); (3) lärvägens synlighet på min-sida KODAD
  (LarvagKort renderad) men E2E med levande inloggning overifierad.

## A3. AI-Mentorn — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 7, återdiff): spår 6:s
fabriksomgångar byggde vidare efter u1:4:s mätning — kedjan är nu 18 lager
(chat-widget.tsx:876) med 68 frågemonster (25 i basen + 43 i 17
frågelager-filer; riskdjup-lagrets sond: 720 kärnord LIVE), och
testtäckningen 598 kontroller i 24 sviter (597 PASS / 1 FAIL, samtliga egna
körningar). FYND: bassvitens E01 registeräkthet RÖT (exit 1) — inbakat
register 358 kurser mot källans 375 (s5:s 17 kursleveranser idag efter
senaste rebaken b3b5e2c4): källmärke-kontraktet gäller ej de nya kurserna
tills rebake. Score 8 kvar — se diff-tabellen i UPPDATERING-sektionen högt
upp i filen.*

- **Vad:** Chatt-widget som känner eleven (nivå, XP, platssammanhang),
  redigerar behovet med klarliggande motfråga, ger handlingar och AKM1/
  AK1TS-referenser — ALDRIG köp/sälj (rådgivningsgrind kodad OCH
  maskintestad). Sedan våg 158 + spår 6:s omgångar: 68 deterministiska
  frågemonster i 18 lager (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik
  ?? sektor ?? case ?? praktik ?? portfoljgrund ?? agande ?? redovisningsdjup
  ?? djup ?? historia ?? lonsamhetsdjup ?? tsdjup ?? skattedjup ??
  beteendedjup ?? riskdjup — DCF-inre värde, investmentbolags-NAV, options,
  ränta, inflation, kapitalstruktur, organisk vs förvärvad tillväxt,
  rapportläsning, nyckeltal, utdelning, lärväg, beteende, skatt,
  skuldfällan, svarta svanar m.m.) + medlemens modellager /api/mentor/fraga
  (generateText, dagstak 429, felväg 503 + fallback, rollback) + Z.ai
  GLM-läge i den publika rutten — svaren källmärks med kurslänkar ur det
  inbakade registret (358 kurser; källan bär 375 — se gap 5), utan
  API-kostnad.
- **Nyckelfiler:** src/lib/ai-mentor-{register,svar}.ts + 17 frågelager-filer
  (ai-mentor-{extra,makro,nasta,kapitalmekanik,sektor,case,praktik,
  portfoljgrund,agande,redovisningsdjup,djup,historia,lonsamhetsdjup,tsdjup,
  skattedjup,beteendedjup,riskdjup}-fragor.ts), src/lib/mentor-svar.ts (199 r),
  src/app/api/mentor/fraga/route.ts (143 r),
  src/app/api/chatbot/route.ts (1 750 r, Z.ai-gren + pedagogik-promt),
  src/lib/chatbot-nlu.ts (259 r), src/lib/chat-minne.ts, src/lib/assistent.ts,
  src/components/ak1a/{chat-widget,assistent-panel}.tsx,
  verktyg/testa-ai-mentor*.mjs (23 sviter) + testa-mentor-modell.mjs.
- **Observation:** Testtäckningen är nu bland de bredaste i kodbasen: 598
  kontroller i 24 sviter (597 gröna vid 2026-09-16-mätningen — enda röda:
  E01 registeräkthet, se gap 5; kanoniska/felstavade/omatchade frågor,
  determinism, registeräkthet, källmärkning, kursläkthet, antistöld mellan
  lager via kärnordsdisjunktion — riskdjup-lagrets sond bär 720 kärnord
  LIVE) + modellagrets 38 kontroller. Registerrebaken vid kurstillägg har
  eget verktyg (testa-ai-mentor.mjs --baka) men är MANUELL disciplin — se
  gap 5. Rutten läser ÄKTA data (getCourses, blogg, EKOSYSTEM,
  lasPriserGallande) med Z.ai-gren + deterministisk fallback.
- **GAP:** (1) dataset-medianer (H2:s ursprungsidé) förblir okopplade till
  mentorns svarskällor (grep i route/svar/widget: 0 träffar) — grundningen
  sker via kursregistret; besluta om kopplingen eller stäng idén; (2) E2E mot
  LEVANDE medlems-API kräver riktig inloggning (modellsvitens mock-kakor
  täcker logiken, inte nätverket); (3) felstavs-djupet är 5 kanoniska
  varianter i bassviten — bredare fuzz saknas; (4) assistent-panelens egna
  vägar (assistent.ts) har fortfarande 0 testsviter (mätt); (5) NY 09-16:
  registerrebaken BRÖTS — inbakat 358 mot källans 375 (17 nya kurser),
  bassvitens E01 RÖD (exit 1) tills --baka + Write/Edit-inklistring; kurser
  levererade utan E01-grön rebake är oregistrerade för mentorns källmärken.

## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): två av tre gap MOTBEVISADE i
kod+prod. Determinismen (gap 2) är KODAD — FNV-1a-datumhash med salt ger
ROTATION[hash % 12]-bolag + AKM1-fråga per dag (api/dagens-pass/route.ts:33–34,
202–203) — och prod-bevisad: två live-anrop gav byte-identiskt svar (SHB-B.ST
2026-09-16). Briefingens vagscan-koppling (gap 3) LEVER: briefing.ts:21
deklarerar Vagdata-formen "speglar /api/vagscan/senaste" och komponenten fyller
vagdata via fetch (rad 8, 59, 174). Nyckelfel rättat: kunskapsflode.json FINNS
EJ — flödet bor i komponenten kunskaps-flode.tsx. Gap 1 lever oförändrat:
streak/XP-logiken (member-local.ts lasStreak) har 0 sviter. Score 7 kvar —
rättning av kartfel som legat i koden sedan 09-01 (E31/C15-precedensen),
huvudgapet orört. Ytan stabil sedan 09-01–09-03; /dagens-pass 200 loopback+HTTPS
med färsk live-data (pris, 52v-position, ATR).*

- **Vad:** Dagens Pass (5-minutersritual: vågklassgissning på live-data,
  dagens quiz +10 XP, flashcards, streak), veckoplan, kunskapsflöde,
  morgonbriefing.
- **Nyckelfiler:** src/app/(huvud)/dagens-pass + src/app/api/dagens-pass
  (route.ts 264 r — FNV-1a-datumhash), src/lib/veckoplan.ts (246 r),
  src/lib/briefing.ts (206 r — vagdata-speglar /api/vagscan/senaste),
  src/components/ak1a/{dagens-pass,vecko-plan,kunskaps-flode,morgon-briefing}.tsx.
- **Observation:** Väl dokumenterade små libs med pedagogisk copy; dagens
  pass är force-dynamic (live-data), övriga statiska. Inga tester (mätt igen
  09-16: 0 träffar i verktyg/).
- **GAP:** (1) streak-logik + XP-tildelning testas ej (lasStreak i
  member-local.ts — ren funktion, lätt svit); (2)~~dagens bolags determinism
  garanteras ej~~ MOTBEVISAT 09-16: datumhash kodad + prod-dubbelanrop
  identiska; (3)~~briefingens datakällor statiska~~ MOTBEVISAT 09-16:
  vagscan-koppling lever via /api/vagscan/senaste.

## A5. Gamification — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 SKÄRPT och gap 2 BESVARAT
efter genomläsning av api/topplista/route.ts (130 r) + certifikat.tsx (242 r).
(1) SKÄRPNING: POST /api/topplista (xp_sync) har INGEN sessionsvakt — e-post+XP
tas ur klient-bodyn (rad 34–41), ägarskap bevisas aldrig, GET aggregerar
senaste-posten-per-e-post (rad 105–111): vem som helst kan posta en annan elevs
e-post med 10 M XP och överta listplatsen (impersonationsklassen från B13:s
member/portfolio-fynd). Mjukande mätt: caps (xp ≤ 10 M, nivå ≤ 100, kurser ≤
1 000), maskerad e-post i GET, och topplistan är just nu TOM
({"topplista":[],"antal":0} live-sond) — inget utnyttjat. Gamla formuleringen
"progress-skrivningen går via auth-vaktad rutt" gällde D21:s progress-rutt,
INTE denna separata synk-rutt. (2) certId är KOLLISIONSBART:
`AK1A-<år>-<XP nollstoppad>` (certifikat.tsx:57) utan medlemsspecifik hash —
två medlemmar med samma XP samma år får identiskt id, och samma medlem får nytt
id vid varje XP-synk; ingen signatur/register bakom. Gap 1 lever: 0 egna
sviter (badges.ts 326 r trösklar som okompilerad data). Score 7 kvar
(B13-precedensen: skärpt gap utan stängning, topplistan tom = ingen
konsumentskada ännu). /badges /certifikat /topplista 200 loopback+HTTPS;
badges.ts orörd sedan 09-01 (be04e17c).*

- **Vad:** Badges (förtjänade medaljer), certifikat (kursintyg), topplista
  (XP-rankning, "poängen förtjänas, tas inte"), streak-visning.
- **Nyckelfiler:** src/lib/badges.ts (326 r), src/app/(huvud)/{badges,
  certifikat,topplista}, src/components/ak1a/{badg-panel,certifikat,
  topplista}.tsx, src/app/api/topplista (130 r — xp_sync utan sessionsvakt).
- **Observation:** Ren logik, varumärkesriktiga texter, force-static där
  möjligt. Topplistan bygger på system_events (xp_sync) med senaste-vinner
  per e-post — XP-statistiken själv lever i localStorage/member-local (D21).
- **GAP:** (1) badge-reglerna (trösklar) saknar test; (2) certifikatens
  unikhet BESVARAD 09-16: certId kollisionsbart (ingen medlemshash, inget
  register) — verifierbarhet saknas; (3) SKÄRPT 09-16: xp_sync-POST utan
  sessionsvakt på publik rutt — impersonationsbar tills vakt finns (kö till
  huvudagenten; topplistan tom = inget utnyttjat).

## A6. Biblioteken — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): läspaketserien FULLBORDAD i
granskningskön — samtliga 11 bolag i data/analyses har kvartalsläspaket (en-till-
en mappat, node-mätt) + Nordea som tolfte paket utan AKM2-analysunderlag; totalt
22 Kön-filer (12 paket + 10 branschkalendrar). Universumet preciserat: forsknings-
biblioteket 22 tickers mot analysbanken 11 med endast 2 gemensamma (HM-B,
INDU-C) — gap 2 är en universum-fråga, inte en synk-fråga. Verktygskedjan
oförändrad manuell (lagg-till-KALLA är verktygets rätta namn). 0 egna sviter.
Score 7 kvar — yttillväxt utan gap-stängning. Se diff-tabellen i UPPDATERING
2026-09-16 högt upp i filen.*

- **Vad:** Bokmastern (103 bokbaserade kurser), bokkanon (102 böcker),
  forskningsbiblioteket (per-ticker-analysunderlag), källor & upphovsrätt.
- **Nyckelfiler:** data/bokmaster/*.json, data/bokkanon.json,
  src/app/(huvud)/{bibliotek,forskningsbiblioteket,kallor},
  src/components/ak1a/bibliotek.tsx, verktyg/{integrera-bokmaster,
  fixa-tabeller,lagg-till-kalla}.mjs, data/rapporter/
  upphovsrattsgranskning-2026-09-01.md.
- **Observation:** Kvalitetsvakten PASSAR åäö-bortfall + kursdata-konsistens
  för bokmaster (0 fel). Upphovsrättsgranskning dokumenterad. Verktygskedjan
  (validera→integrera→källa-attribution via lagg-till-kalla) existerar men är manuell.
- **GAP:** (1) verktygskedjan saknar ett enda kommando (lint-dörr) som
  blockerar ogiltig bokmaster-JSON före commit; (2) universum-fråga (mätt 2026-09-16): forskningsbiblioteket 22 tickers mot
  analysbanken (B7:s data/analyses) 11 med endast 2 gemensamma (HM-B, INDU-C) —
  synkningen är sekundär mot universumbeslutet; (3) källförteckning per kurs
  maskinläsbar endast delvis; (4) NY 09-16: Nordea-läspaketet (12:e paketet)
  saknar AKM2-analysunderlag (NDA-SE finns ej i data/analyses — lucknotis i
  paketet).

---

# B. ANALYSMOTORERNA

## B7. AKM2-analysmotorn + analysidorna — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 5): score 9 → 8. Kärnan förblir
kodbasens finaste — 156 kontroller gröna i egna körningar (kärna 25/25 ·
dynamik 55/55 · moduler 64/64 · snapshot 12/12) + motorvalidering 107/0/0
(6,0 s). Men DATAKEDJAN föll ifrån: kor-akm2-berika senast körd 2026-09-04
(100 akm2-cacher då; 0 på disk sedan våg 122:s rensning 2026-09-13 — ingen
cron återfyller akm2), AKM3-ensemble-vyn renderas ej på 22/22 biblioteks-
sidor (akm3- + fundamental-cacher 0 på disk; självläker först vid månads-
cronen 2026-10-01), snapshot-sviten env-läckande (11/12 med ärvt Supabase-
env, 12/12 i ren env — mätt båda). AKM2-dashboarden överlevde ENDAST genom
analysfilernas git-trackade akm2-block (steg 1 "analys-json", live-bevis
22/22). Se diff-tabellen i UPPDATERING-sektionen.*

- **Vad:** Plattformens vetenskapliga kärna: AKM1:s 20 fundamentalvariabler
  (V01–V20, 0–5 p med motivering), AKM2-lagersyntes (kärna + vikter +
  moduler + dynamik via injektion), förklaring per variabel med kurslänk,
  analyser per ticker + variabel, on-demand-beräkning (3 steg: analys-json-
  block → akm2-cache → fundamental-cache; null ⇒ sektion renderas ej),
  snapshot-lagring (system_events, tak 2 000). Två analyslager: data/analyses
  (11 premiumanalyser) + data/forskningsbiblioteket (22 tickerunderlag vars
  akm2-block är AKM2-livlinan).
- **Nyckelfiler:** src/lib/akm2/{karna.ts (914 r), dynamik.ts (869 r),
  vikter.ts, moduler/, typer.ts}, src/lib/analys-motor.ts (600 r),
  src/lib/akm2-onsdemand.ts, src/lib/akm2-snapshot-lagring.ts (402 r),
  src/app/(huvud)/analyser/**, src/app/api/{analysis,stock-data}/**,
  verktyg/testa-akm2-{karna,dynamik,moduler,snapshot}.mjs,
  verktyg/kor-akm2-berika.mjs.
- **Observation:** Högsta kvalitet i kodbasen: PROJEKTIONSINVARIANTEN
  (projiceraAKM1(raknaAKM2(k)) === raknaAKM1(k), byte-identisk) + ÄRLIG-
  HETSPRINCIPEN (null in ⇒ "osatt" ut, kärnan gissar aldrig) är dokumenterade
  och testade i fyra separata sviter (156 kontroller, mätta 2026-09-16).
  Motorvalideringen PASSAR analysmotorn (107/0/0, egen körning).
- **GAP:** (1) kor-akm2-berika (AI-berikning) manuell OCH stillastående —
  senaste körning 2026-09-04, 0 cacher på disk, ingen cadans-vakt/påminnelse;
  behöver cron-koppling eller vakten ropar vid ålder; (2) snapshot-cadansen
  fast (ingen ombestämning vid datakorrigering) + svitens env-hermetik
  (kontroll 11 failar med ärvt Supabase-env); (3) motorregistret (2026-09-03)
  listar akm2-modulerna som "omonterade" i cron/autonomi-meningen —
  kopplingen till organ-pulsen saknas; (4) akm2-onsdemand steg 2+3 har ingen
  git-trackad livlina och ingen nät-branch — "accelerator, aldrig beroende"
  gäller bara datacache:s fyra typer; ett nytt cache-tömningstillfälle öppnar
  samma AKM3-tomrum (0/22) även för AKM2 om blockformatet ändras.

## B8. AKM3 (regim, kalibrering, ensemble) — PÅGÅR — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 6): allt MÄTT i arbetsytan —
svit 55/55 PASS exit 0 (egen körning), lib 2 113 r orörda sedan 09-10.
STORFYND (drift): kalibreringsloopen är ENBART Vercel-cron-driven (vercel.json
`20 5 2 * *`; /etc/crontab mätt SAKNAR raden — prod-servern kör aldrig ronden,
första möjliga automatiska rond 2026-10-02) och REGIMEN är FROSEN på genesis-
raden 2026-09-03 (uppdateringsvägen cron/vagvalidering finns ej på Contabo +
Vercel-fs read-only; loggen bär 1 rad; chipet visar genesis-indikatorer utan
datum). Kalibreringsloggen 1 rad (v1 2026-09, ΔΦ=0, 0 episoder — clean-förbudet;
alla faser "vantar-grind", korrekt designläge 8–12 kvartal). Gap 1 MOTBEVISAT —
regimen visas på FYRA publika ytor (forskningslage-chip via min-sida/portfolj-
forskning/prenum-CTA + transparensens Metodrad 10 + pro-ytor + fas3). Ensemble-
vyn MÄTT död igen (HM-B.ST 200 med 0 ensemble-träffar — bekräftar B7:s 0/22).
Score 7 kvar, PÅGÅR kvar — se diff-tabellen i UPPDATERING-sektionen.*

- **Vad:** Regimdetektering (marknadsläge), osäkerhetskvantifiering,
  ensemble-kärna, kalibreringsloop mot kvartalsdeduplicerade vågklass-
  snapshots.
- **Nyckelfiler:** src/lib/akm3/{ensemble (172 r),kalibrering (1 161 r),
  osakerhet (144 r),regim (472 r),typer (164 r)}.ts, src/app/api/cron/
  akm3-kalibrering/route.ts (463 r), data/forskning/AKM3/ (beslut r1–r7),
  verktyg/testa-akm3-kalibrering.mjs (55 kontroller), src/lib/vagvalidering.ts
  (kvartalsnyckel + protokollversion), data/portfolj-system/
  {kalibrering-logg,regime-logg}.json, data/rapporter/
  akm3-kalibrering-SENASTE.md.
- **Observation:** Kvalitetsmässigt bland de mest genomtänkta cron-konstruktionerna
  i kodbasen: LÅST handlingsgrind ΔΦ=0 som kodat kontrakt (grindvillkor
  n_eff ≥ 20 + kredibelt intervall + rate-limit, rollback-regeln i varje rad),
  hash-kedjad append-only-logg med DB-kedjebas-fallback (O4-robusthet §6) och
  tamper-vakt, månads-idempotens, OrganEvent-puls, fail-safe utan nät. Svit
  55/55 (mätt 2026-09-16). Kalibreringens indata är Bana B (system_events
  type=vagvalidering) — vagvaliderings-cronen som både matar kalibreringen och
  uppdaterar regimen drivs dock ENBAST från Vercel (se gap 4).
- **GAP:** (1) ~~regimetikettens publika exponering — konsumentytan tunn~~
  MOTBEVISAD (mätt 09-16: chip + transparens-metodrad + pro-ytor + fas3);
  kvar som rest: chipet bär genesis-indikatorer UTAN datum (frusen regimen
  osynlig för eleven); (2) kalibreringens träff-%-rapportering saknar
  historisk trendvy (mätt: endast SENASTE-filer i data/rapporter); (3)
  ensemble-vikternas drift över tid bevakas ej (mätt: prediktionsloggen
  loggar AKM1-prediktioner, ej ensemble-vikter); (4) **NY 09-16 —
  driftspegling**: akm3-kalibrering + vagvalidering saknas i /etc/crontab
  (Contabo = prod) ⇒ kalibreringskedjan + Bana B + regimen växer endast i
  moln-JSON, prod-diskens loggar frusna (1 + 1 rad), och ensemble-konsument­
  ytan tom (akm3=null mätt — återfyllningsvägen portfolj-uppfoljning finns
  som cron-rad men skrev 0 cacher vid 09-1-passagen, orsak outredd).

## B9. Vågsystemet AK1TS — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 4): skanningen lever DAGLIGEN —
senaste vågskans genererad 2026-09-15T05:05:22Z (mätt via
/api/vagscan/senaste; matchar vercel-cron 0 5 * * *), universum exakt
12 tickers (listan mätt), vågmotorssviten 57/57 PASS (egen körning).
TVÅ DRIFTFYND: (a) Contabo-crontaben saknar vagscan/vagvalidering — den
dagliga skanningen drivs ENDAST av vercel-cron, dvs den passiva
backup-miljön (dör tyst om Vercel-speglingen dör); (b) SENASTE-
valideringsrapporten är 12 dagar gammal (domar 2026-09-04: träff 52 %,
nDomda 48; spegelfilens mtime 09-10 16:33) och /api/data/vagstatistik
serverar den åldrade rapporten — Vercel read-only fs kan inte förnya filen
på disk. Score 8 kvar — inga gap stängda, se diff-tabellen.*

- **Vad:** Vågfundamentmotorn (vågmätning i fundamentalindikatorer V01–V20 ×
  5 horisonter), vågkon (Elliott-vågklasser), daglig autonom vågskanning av
  12 svenska tickers, vågvalidering med protokollversion, vågkarta-signal på
  bussen, vagfundament-matris + vagkurvor i UI.
- **Nyckelfiler:** src/lib/vagfundament-motor.ts (1 078 r), src/lib/vagkon.ts,
  src/lib/vagvalidering.ts, src/app/api/cron/vagscan/route.ts (CRON_SECRET-
  vakt om satt), src/app/(huvud)/vagfundament, src/components/ak1a/
  {vagfundament-matris,vagkon-graf,vagkurva-graf,vag-skattning}.tsx,
  verktyg/testa-fundamental-vagmotor.mjs, data/rapporter/vagvalidering-*
  (SENASTE), src/app/api/vagscan/senaste.
- **Observation:** Motor med 1 078 väl dokumenterade rader, dagligen cron-
  driven, EN vågskans-skrivning per körning (dedupe), snapshot-kvartalsgaller
  till kalibreringen, signal-bus-publicering. Testsvit + valideringsrapport
  finns. Motorvalideringen PASSAR vagfundament.
- **GAP:** (1) universum fast 12 tickers — expansion mot Nordic/bolags-
  universum beslutad men ej kodad; (2) Yahoo/MarketStack-felvägars
  degraded-läge (stale vågkarta flaggas ej i UI); (3) vagstatistikens
  träff-% redovisas inte på någon publika utbildningssida (lärdomen syns
  ej — mätt 2026-09-16: 0 konsumenter av /api/data/vagstatistik i
  komponenter/sidor, API:t lever); (4) **cron-spegling**: vagscan +
  vagvalidering körs enbart av vercel-cron (mätt: Contabo-crontaben saknar
  raderna) — spegling till server-cron/pumpor krävs för Contabo-oberoende
  drift; (5) SENASTE-rapportens förnyelse är bruten (domar 09-04, filen kan
  bara förnyas av agent/manuell körning med skrivåtkomst till repot).

## B10. Konfluensradarn — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 5): första egna prod-sonden av
radarn — /konfluens 200 + /api/konfluens LEVANDE med färsk tidsstämpel
(genererad 2026-09-16T04:44:21Z): fem-källors-raderna beräknas live
(värdegolv, kvalitet, fundamental vågstart, prisvågläge, divergens ⇒
konfluens 0–100, antal datakällor redovisat per rad). Motorvalideringen
107/0/0 i egen körning. Ytan stabil sedan 09-11 (endast KO-/JSON-LD-/
cache-kurur). Gap 3 preciseras: kopplingen till B13:s korstabell är
KONCEPTUELL, ej kodad — 0 direkta import mellan konfluens-{motor,tabell}
och portfolj-forskning/* (mätt); den gemensamma vägen är motorstacken
(netnet + analys + vagfundament). Score 7 orörd — inga gap stängda. Se
diff-tabellen i UPPDATERING-sektionen.*

- **Vad:** Väger värde mot vågor: värdegolv först, fundamental vågstart +
  prisvågläge därefter; fem oberoende källor måste tala samman.
- **Nyckelfiler:** src/lib/konfluens-motor.ts (493 r), src/app/(huvud)/
  konfluens, src/app/api/konfluens, src/components/ak1a/konfluens-tabell.tsx.
- **Observation:** Force-static, pedagogisk ingress, "aldrig investeringsråd"
  i metadatan. Ingår i motorvalideringen (PASS där — 107/0/0 egen körning
  2026-09-16; API-sonden samma dag svarar med färsk fem-källors-beräkning).
- **GAP:** (1) ingen egen testsvit för fem-källors-logiken (regression vid
  motorändring i B7/B9 fångas bara indirekt); (2) radarns historik (hur många
  konfluenser setts/utfall) lagras ej (mätt 09-16: ingen persistens i motorn);
  (3) koppling till portföljforskningens korstabell (B13) — PRECISERAD
  2026-09-16: konceptuell, ej kodad (0 direkta import, mätt).

## B11. Net-net-skannern — LEVER — 6/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-13: motorvalideringen kör nu 107 PASS / 0 FAIL /
0 SKIP (6,4 s) — determinismfelet (VOLV-B.ST 340.3≠340.4) är borta och
skannern lämnar inga röda till vakten. Kvar: egen testsvit, fast
25-bolagslista.*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 5): lägesrättning med egna
mätbevis — determinismgrenen STABILT grön (motorvalideringen 107 PASS /
0 FAIL / 0 SKIP på 6,9 s i egen körning — tredje dokumenterat gröna
körningen sedan 09-13) + /netnet 200 och /api/netnet LEVANDE med färsk
tidsstämpel (genererad 2026-09-16T04:43:31Z, egen sond — live-kursflödet
lever, VOLV-B 330,2). Universumet fast 25 tickers, listan mätt oförändrad
i komponenten. Observationskroppens FAILAR-text nedan är HISTORIK från
2026-09-11. Ytan stabil: inga motorändringar sedan 09-11. Score 6 orörd —
egna sviten och 25-listan lever som gap. Se diff-tabellen i
UPPDATERING-sektionen.*

- **Vad:** Skär 25 svenska/nordiska bolag mot Grahams net-net-kriterium
  (kurs < 2/3 × NCAV), sorterad på kurs/NCAV med NET-NET/NÄRA-markering.
- **Nyckelfiler:** src/lib/netnet-motor.ts (292 r), src/app/(huvud)/netnet,
  src/app/api/netnet, src/components/ak1a/netnet-skanner.tsx.
- **Observation:** [HISTORIK 2026-09-11 — motbevisad 2026-09-13, se
  updatingarna ovan:] motorvalideringen FAILAR determinism — "utdata skiljer
  mellan körningar. Första skillnad: rot.kurs: 340.3 != 340.4" (VOLV-B.ST).
  Motorn är live-kursberoende inne i beräkningen: icke-deterministisk mellan
  två körningar inom samma kvotfönster. Detta var en av de två röda som
  sänkte vakten till GUL (E35).
- **GAP (avgörbart):** (1) ~~determinism-testet får fast indata (fryst kurs-
  fixture) ELLER motorn renodlas så live-data hämtas EN gång utanför den
  rena beräkningskärnan~~ STÄNGT 2026-09-13 — determinismgrenen grön sedan
  dess och omätt grön 2026-09-16; (2) 25-bolagslistan fast — expansion
  beslutas (listan mätt oförändrad 2026-09-16); (3) egen testsvit saknas
  (mätt 2026-09-16).

## B12. Superanalysen + AKM1-kalkylatorn — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 MOTBEVISAT,
kärnobservationen nyanserad, testbilden preciserad. (1) Kalkylatorn HAR länkar
tillbaka per variabel: akm1-calculator.tsx (1 411 r — kartan räknade bara
superanalys.ts 507 r; total kodbas 2 670 r med superanalys.tsx 752 r)
importerar forklaPoang från kärnan (rad 12) och bär MODUL_KURS_LANK-map med
våg 78 B3-reglerna (aldrig döda länkar, osäker match → kursbiblioteket, rad
67–74) — kartans eget förslag "återanvänd B7:s" är redan implementerat.
(2) "Trösklarna delas med AKM2-kärnan" gäller INTE på filnivå: superanalys.ts
(use client) har 0 imports — i stället bär AKM2-KÄRNAN viktprofilen
"superanalys-2026" som en av tre kanoniska profiler (testa-akm2-karna kontroll
6–8: råvikter summa 100; kontroll 22: kategoriupplösning korrekt) — delning
genom konvention+svit, inte import; klientens kategorivikter (15/20/20/15/15/
5/10, dokumenterade i filhuvudet) är en OBEROENDE kopia som inte följer
kärnan automatiskt. (3) "Inga tester" tunnare: profilen ÄR svit-testad;
klientens egna poängsummor 0 sviter (gap 1 lever). Gap 2 delvis lugnat
matematiskt: totalpoängen inlåst 0–100 per konstruktion (rad 307–310) —
renderingen vid extrema värden förblir E2E-overifierad. Score 7 kvar
(E33/B14-precedensen). Ytor 200 loopback+HTTPS; senaste beröring b77699ba 09-15
(cache-headers, ingen funktionsrörelse).*

- **Vad:** Guidad aktieanalys i 24 steg (V01–V20 + vågklassgissning per
  horisont) med delbart analys-kort av 100 poäng; AKM1-kalkylatorn (fri
  övningsyta med samma trösklar).
- **Nyckelfiler:** src/lib/superanalys.ts (507 r, use client, 0 imports —
  vikterna oberoende kopia av kärnprofilen superanalys-2026),
  src/app/(huvud)/{superanalys,kalkylator}, src/components/ak1a/{superanalys
  (752 r),akm1-calculator (1 411 r — forklaPoang-import + MODUL_KURS_LANK)}.tsx.
- **Observation:** Kategorivikterna delas med AKM2-kärnan via KONVENTION +
  kärnsvit (profil superanalys-2026, kontroll 22), inte via import; force-static
  där möjligt; delbart kort utan persondata; totalpoäng matematiskt inlåst
  0–100.
- **GAP:** (1) klientfilens poängsummor/inmatningsvalidering 0 egna sviter
  (kärnprofilen däremot svit-testad); (2) delningskortets rendering vid
  extrema värden (0/100) E2E-overifierat — intervallet självt matematiskt
  säkert; (3)~~kalkylatorn utan länk per variabel~~ MOTBEVISAT 09-16:
  MODUL_KURS_LANK + forklaPoang-import lever i akm1-calculator.tsx.

## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 5): båda egna sviterna gröna
omätta (riskportfolj 32/0 + uppföljning 50/0, egna körningar exit 0). TVÅ
SKÄRPNINGAR: (a) korstabell-grund.json FRUSEN — skapad 2026-09-03, 100
rader, akm2Berikad 2026-09-04 — medan bolagsunivers.json vuxit till 120
bolag (s2-spåret, senaste skrivning 09-16 01:44, mätt): underlag och
korstabell glider isär; (b) member/portfolio-rutten (publik konsumentyta
/min-portfolj, genomläst) tar memberId ur klienten UTAN lasMedlemSession-
kontroll och mappar holdings `any`-typade utan validering — skarpare än
gamla gap 3. Peer-medianen nyanserad till designbeslut (AKM3-BESLUT §10.10:
MAD/kvartiler förbjudna vid n=10). Uppföljnings-cronen DUBBELT driven
(/etc/crontab + vercel.json, mätt) men 0 cacher/prediktionslogg på disk
sedan 09-01. Score 8 orörd. Se diff-tabellen i UPPDATERING-sektionen.*

- **Vad:** Korstabellen (fundamental nivå × vågstil), riskportfölj,
  uppföljning av tidigare analyser, peer-jämförelse, portföljbyggare +
  min portfölj, rapporthantering, fundamental vågmotor som del.
- **Nyckelfiler:** src/lib/portfolj-forskning/{korstabell-data,riskportfolj,
  uppfoljning,peer,fundamental-vagmotor,akm2-koppling,typer}.ts,
  src/app/(huvud)/{portfolj-forskning,portfoljbyggare,min-portfolj,rapporter},
  src/app/api/{portfolj-forskning,portfolio,member/portfolio,report}/**,
  src/components/ak1a/portfolj-forskning/* (7), verktyg/
  {testa-riskportfolj,testa-uppfoljning}.mjs, src/app/api/cron/
  portfolj-uppfoljning (månadens 1:a — DUBBELT driven, mätt 09-16).
- **Observation:** Två egna testsviter (gröna vid egna körningar
  2026-09-16: 32/0 + 50/0), månadsvis autonom uppföljning, deterministisk
  korstabell ur data/portfolj-system. AKM2-kopplingen återanvänder B7:s
  kärna. Uppföljnings-cronen är även AKM3:s återfyllningsväg (skriver
  fundamental- + akm3-cacher + ensemble-prediktionslogg — kodläst).
- **GAP:** (1) korstabellens dataunderlag uppdateras manuellt (skanka-
  akm2-snapshots) — ingen autonom refresh; MÄTT SKÄRPT 09-16: korstabell-
  grunden frusen sedan 2026-09-03 (100 rader) medan bolagsunivers nått 120 —
  kedjan behöver cadans eller ropas vid universumsväxt; (2) peer-jämförelsen
  rank/median är delvis MEDVETET (AKM3-BESLUT §10.10 förbjuder MAD/kvartiler
  vid n=10) — kvartiler återstår bara för stora branscher; (3) member/
  portfolio-rutten saknar sessionsvakt OCH indata-validering (mätt 09-16,
  publik yta /min-portfolj) — transaktionshistorik saknas fortfarande men
  integritetsgapet är skarpare.

## B14. Nyheter + marknadsdata — LEVER — 6/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): cron-bilden mätt — DUBBEL drivning
(/etc/crontab: /api/cron/nyheter 08:00 lokal = 06:00 UTC + vercel.json:
/api/nyheter/scan 08:00 UTC = 10:00 lokal; server-TZ Europe/Berlin); CRON_SECRET
fortfarande EJ SATT (.env-närvaro mätt, värden olästa) = publika rutter;
scan-kontraktet dokumenterat i koden (universum 12 tickers hårdkodat, tröskel
påverkans ≥ 70, max 5 signaler/scan + OrganEvent, "ALDRIG krascha"). 0 sviter
kvarstår (mätt). Score 6 orörd — kunskap tillförd, inga gap stängda.*

- **Vad:** Nyhetsmotor (aktienyheter med källhänvisning), nyhetskanaler,
  daglig scan-cron i dubbel drivning (Contabo /etc/crontab 08:00 lokal + Vercel 08:00 UTC, mätt 2026-09-16), stock-data/indikatorer-API:er mot externa
  leverantörer, shortseller-bank, morgonrond-data till PRO.
- **Nyckelfiler:** src/lib/{nyhets-motor (844 r),nyhetskanaler,
  shortseller-bank}.ts, src/app/(huvud)/nyheter, src/app/api/{nyheter,
  nyheter/scan,stock-data,indicators,shortseller}/**, src/lib/briefingdata
  via pro/morgonrond-data.ts.
- **Observation:** Väl dokumenterad motor med källhänvisning och cron.
  Externa beroenden (MarketStack, Yahoo) har fallback men inga tester av
  fallback-vägarna.
- **GAP:** (1) ingen testsvit alls; (2) rate-kvoter/fel från externa API:er
  bevakas ej (kan tyst bli tom nyhetslista); (3) nyheternas juridikgrind
  (rubrikformuleringar) körs via kontrolleraText endast vid publicering —
  ej på leverantörens rubriker; (4) NY 09-16: Contabo-cronens exekvering är
  crontab-bevisad men ej KÖRbevisad (curl till /dev/null, ingen logg —
  pm2-spaning vid 06:00 UTC ger svaret) och CRON_SECRET är fortfarande
  osatt (E29-gap 1 gäller även här).

---

# C. INNEHÅLL & TILLVÄXT

## C15. Bloggen + publiceringsflödet — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (dokvåg s9-u2:2): LÄGE B ÄR BESLUTAT —
ordförandebeslut 2026-09-07 (STYRELSE-BLOGG-LAGE-B.md): Läge A består som
publiceringsväg, full hot-path AVSLAGEN med mätdata (61–76 ms varm statisk
mot 240–630 ms/request utan cache; OG-generering + sitemap bygger på filerna
på disk som prod-fs ändå kräver). B2-HYBRIDEN ÄR BYGGD (våg 82 del C):
publiceraMedPaket (0-FEL-grinden + blogg_publicerad-event) +
/api/admin/blogg/publicera + knappen "Publicera (skickar till agent)" i
panelen — publicera-UX utan hot-path-beroende. Kön är nu en strukturerad
trädstruktur (11 publiceringsklara JSON + m9-ko/ 3 + kvartal/2026-q3/ 13 +
granskning/ + GRANSKNINGSKO-SAMMANSTALLNING.md som kundens kö-vy). Score
kvarstår 8: beslutet var dokumenterat sedan 09-07 — nyheten är att kartan
nu speglar det; B2-flödet saknar fortfarande E2E-bevis.*

- **Vad:** 55 publicerade poster (data/blogg/*.json) + speglar en/ar,
  granskningskö med draft→granskad→publicerad-statusmaskin, kontrolleraText-
  grind (0 FEL krav) vid varje statusbyte, export-paket till main-agent
  (Läge A, ordförandebeslut 2026-09-07) alternativt B2-knappen (agent-
  påminnelse med paket), SEO-metadata + OG automatiskt vid drop.
- **Nyckelfiler:** src/lib/blogg-{utkast,speglar}.ts, src/app/(huvud)/blogg/
  **, src/app/{en|ar}/blogg/**, src/app/api/admin/blogg{,/publicera},
  src/components/ak1a/admin/blogg-panel.tsx, data/blogg/ (55) +
  data/blogg-utkast/ (11 JSON + m9-ko/ 3 + kvartal/2026-q3/ 22 = 12 bolagspaket + 10 kalendrar, mätt 09-16 + granskning/),
  src/lib/varumarke.ts (kontrolleraText).
- **Observation:** Hård grindslogik dokumenterad + protokollförd (våg 80b);
  vakten bekräftar 55 poster i prod oförändrade efter utkast-separeringen
  (våg 95). Statusmaskin + senaste-vinner-persistens via system_events.
- **GAP:** (1) B2-flödet E2E-bevisas (knapp → blogg_publicerad-event →
  agent-drop → prod 200) + "Väntar på agent"-vyn förkovras; (2) nya poster
  får default-OG tills deploy (AC4: force-static-DNA); (3) återkopplingsyta
  (läsarmätning per post) finns ej — kommentarer avsiktligt borta.

## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): granskningskön 44 → 124
filer på ett dygn (~2,8×, ls-mätt): rot 31 JSON + 2 MD (m9-serien 6/6
granskningsklar + branschguide-serien) · m9-ko 7 · granskning 53 · kvartal
31 — medan data/blogg/ står på 55 publicerade oförändrade och
GRANSKNINGSKO-SAMMANSTALLNING.md åldras (09-14-vyn). Gapet "kön ej kopplad
+ växer" SKÄRPS; score 8 kvar (B13-precedensen). Kö: sammanställningen
förnyas + publiceringsbeslut för kön.*

- **Vad:** Evergreen-utkastfabrik: deterministiska utkast (kassaflödes-
  analys-101, utdelningar-101, börspsykologi, branschmedianer ...) i kundens
  Supabase-granskningskö med kontrolleraText 0 FEL, md5-kvitton och
  57/57 oberoende kontroller; + 8 SEO-guider.
- **Nyckelfiler:** verktyg/m9-fabrik.mjs, data/forskning/M9-GRANSKNING-
  2026-09.md, data/blogg-utkast/*.json (11 i roten + m9-ko/ 3, mätt
  2026-09-15), data/forskning/SEO-GUIDER-2026-09.md.
- **Observation:** Determinism bevisad (samma indata ⇒ md5-identiskt
  utkast), nyckeltal omräknade mot källfiler, hård ALDRIG-investeringsråd-
  grind. Fabriksbootstrap (--tvinga) + kortNamn-buggfix dokumenterade.
- **GAP:** (1) sidofix 2026-09-15: påståendet "publiceringsknapp i admin
  saknas" är MOTBEVISAT — B2-knappen (våg 82, se C15) skickar klara paket
  till agenten; kvar: M9-fabrikens utkast kopplas till knappflödet och kön
  växer snabbare än granskningen (11 JSON + 22 kvartalsfiler väntar — 12 bolagspaket + 10 kalendrar, mätt 09-16);
  (2) fabrikens serier styrs av hårdkodad serie-lista — ny serie
  kräver kod; (3) ingen schemalagd re-run (kvartalsvis serie-enligt-H3).

## C17. Dataset-citeringsmagneterna — LEVER — 9/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u3 omgång 2): två ytor kartan missade, båda
mätta i arbetsytan — (1) ASPEKTSYSTEMET (v150) lever i kod:
/dataset/[bransch]/[aspekt]-rutter + dataset-aspekter-kontrakt.ts + 8
moduler i src/lib/dataset-aspekter/ + dataset-aspekt-vy.tsx; /dataset och
/dataset/energi svarar 200. (2) KVARTALSSERIEN (v152) har fas 2–3
LEVERERADE i data: 10 branschkalendrar + 3 bolagspaket (H&M/Ericsson/
Volvo Car) i granskningskön data/blogg-utkast/kvartal/2026-q3 — men
/kvartalsdata-src fortfarande ej påbörjad (find: 0 kvartalsfiler i src).
NYTT GAP: aspekt-testsviten testa-dataset-aspekter.mjs är TRASIG i rak
node (ERR_MODULE_NOT_FOUND: dataset-medianer.ts importerar './ordlista'
ändelselöst — importbro saknas). Score 9 kvar: ytan växt men
testtäckningen föll tyst — netto noll.*

- **Vad:** Publika branschmedianer (P/E, direktavkastning, marginaler ...) +
  kvartilsspridning + bransch-mot-universum med delta-pilar, 10 branscher ×
  3 språk = 33 URL:er med Dataset-JSON-Ld, llms.txt-sektion, sortering,
  kurslänkning — sedаn v150 dessutom aspektsidor (nyckeltal per aspekt ×
  bransch). Kontrakt: endast medianer/aggregat — per-bolag ALDRIG.
- **Nyckelfiler:** src/lib/{dataset-medianer (314 r),dataset-nyckeltal
  (393 r)}.ts, src/lib/dataset-aspekter-kontrakt.ts + dataset-aspekter/
  (8 moduler), src/app/(huvud)/dataset/** (+ [bransch]/[aspekt]) + speglar,
  src/app/api/llms-txt, verktyg/{v98-dataset-vakt (läckagevakt: 222 filer,
  0 träffar),testa-dataset-aspekter (TRASIG — se gap 0)}.mjs,
  data/forskning/{A2-DATASET-KONTRAKT,A4-KVARTAL-KONTRAKT,
  V152-KVARTALSKARTA}.md.
- **Observation:** KVD-mässigt exemplariskt: 33/33 URL:er 200, 0 bolags-
  läckage programmatiskt bevisat, kontrakt i filhuvuden. A4-kvartals-
  rapporten (/kvartalsdata, frusna utgåvor med md5+CC-BY) har kontrakt +
  V152-plan + producerat kömaterial men fortfarande INGEN src-kod.
- **GAP:** (0) testa-dataset-aspekter.mjs repareras (importbro à la
  v82-kurs-metadata-bro — annars okänd aspektstatus; mätt TRASIG
  2026-09-15); (1) kvartalsrapport-H3: route /kvartalsdata/[kvartal] +
  index + frysnings-pipeline (underlaget är nu KOMPLETT: A4-kontraktet +
  V152-kartan + 22 Kön-filer (12 bolagspaket + 10 kalendrar, mätt 09-16) — en våg); (2) tidsserie/jämförelse mot
  föregående utgåva saknas (kräver H3); (3) datasetens uppdateringscadans
  dokumenteras på sidan (n-redovisat finns, "nästa frysning" saknas).

## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u3 omgång 2): schema-kurser OMÄTT GRÖN igen —
444 kontroller / 0 fel (18 sidor, 6 kurser × 3 språk mot localhost).
llms-txt + llms-full-txt 200/200 (mätt). sitemap 1 684 → **1 998 URL:er**.
sökindex FRYSKT: sok-index.json genererad 2026-09-15, committad i b514fe67 —
men kopplingen förblir manuell disciplin. seo.tsx 809 → 841 r. OG-steget
fortfarande manuellt: deploya-contabo.sh saknar og-generate-kopling (grep
0 träffar). Kursantalet i G1-gapet rättat 333 → 337. Score 9 kvar.*

- **Vad:** pageMetadata-centrum (841 r), Course/FAQPage/BreadcrumbList-schema
  på alla 381 kurser × 3 språk (mätt 2026-09-17), Dataset-schema, llms.txt + llms-full-txt,
  sitemap (inkl. tier-gating), robots (pro-stängning), hreflang-speglar,
  OG-generering vid deploy, sökindex.
- **Nyckelfiler:** src/lib/seo.tsx (841 r), src/lib/schema-kurser.ts (192 r),
  src/app/{sitemap.ts,robots.ts}, src/app/api/{llms-txt,llms-full-txt},
  verktyg/{testa-schema-kurser,seo-generate,og-generate,kor-sokindex}.mjs,
  data/forskning/V84-METADATA-KARTA.md.
- **Observation:** testad schema-kurser 444/0 grönt (18 sidor; körd 2026-09-11
  och igen 2026-09-15); G1:s FAQPage ur learn/why-innehåll (inga påhittade
  frågor) lever i kod. Verktygskedja genererar OG + sökindex vid deploy.
- **GAP:** (1) G1-slutverifiering: full 352×3-maskinell körning + Google
  rich-results live-test (stickprov gjorda enligt våg 99-dok);
  (2) OG-genereringen är ett manuellt deploy-steg (kan glömmas — hook/
  deploy-skript-koppling); (3) sökindexet (data via kor-sokindex) åldras
  mellan deploys — mjukare i praktiken: verktyget körs vid kurstillägg
  (sok-index.json committad färsk 2026-09-15) men ingen mekanisk tvingan.

## C19. Trafik, spår & konvertering — LEVER — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 7): gap 3 BESVARAT med delat
utfall — trafik-rapportören ÄR samtyckesgated i kod (lasCookieSamtycke i
trafik-rapportor.tsx:97,153: fullt läge endast vid analys-samtycke, annars
minimalt läge ENBAST path+ua; puls kräver analys; "skapa INTE ny lagring
utan analys-val"), MEN PageViewBeacon (globalt-skal.tsx:243–276 + kopian i
layout.tsx) beaconar {path, sessionId} → /api/track → user_activities i
Supabase OCH skapar ak1a-session-localStorage UTAN att läsa samtycket —
kakmodalens eget lagcitat (2022:482 6 kap 19–20 §§, samtycke INNAN
icke-nödvändiga cookies/localStorage) efterlevs EJ av beaconen; kur = lås
beaconen på samma samtyckesnyckel. Lokala tracern ogated (harCookieSamtycke
bär "för framtida gating") men lämnar aldrig enheten. P6 även koddokumen-
terad. Live mätt: track POST {} → 400 · trafik 200 · tracer 405 (POST-only
= frivillig delning) · intention 400/405.*

- **Vad:** Tracern (intresseprofil), trafikrapportör, DNA-blockering,
  konverteringstratt i 6 steg + intentionsmätning, "noll nya spår"-regeln
  (P6), trafik & säkerhetsvyer i admin.
- **Nyckelfiler:** src/lib/tracer.ts (742 r, oförändrad mätt 09-16),
  src/lib/ekosystem.ts + eko-koppling.ts, src/app/api/{track,trafik,
  konvertering/intention,tracer,konvertering}/**, src/components/ak1a/
  {trafik-rapportor,trafik-status-rad,dashfraga-kort}.tsx, src/lib/
  dashfraga.ts — samt cookie-consent.tsx (samtyckesgating) + globalt-skal.
  tsx (PageViewBeacon).
- **Observation:** Tracern matar eko-kopplingen (har numera komponent-
  konsumenter: assistent-panel + /api/eko — motorregistrets "noll
  konsumenter" från 2026-09-03 är föråldrat). P6-disciplinen protokollförd
  OCH koddokumenterad (mätt 09-16); konverteringspanelen bär P4-mätkvalitet
  per steg (MÄTT/SKATTAD/MANUELL).
- **GAP:** (1) inga tester (mätt 09-16: 0 sviter); (2) alarm-trösklar för
  tratten saknas (mätt 09-16); (3) PageViewBeacon sänder spår FÖRE
  samtycke (mätt 09-16 — se uppdatering; trafik-rapportören är kurmallen).

---

# D. MEDLEM & KOMMERS

## D20. Inloggning & konto (FAS L1) — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-13: LOGIN-2.0 landat och E2E-verifierat på prod
(specifika feltexter + live-räknare; STYRELSE-2026-09-11-V106 § 3 D1).
FLAGGAN upphävd.*

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 5): kartans kvar-not
"återställ lösenord" var INAKTUEL — glömt-lösenord-flödet landade redan i
våg 101 K2/K3 (d83915fb 2026-09-11 22:09, samma kväll som K1:s 452-radsläsning
men efter den): UI-läge "glomt" + /api/medlem → GoTrue /auth/v1/recover + EGEN
rate-limit 5/IP/min + neutral talkart (kontoexistens läcks aldrig). Även
"oklart e-postverifieringsläge" besvarat: verifiering PÅ — email_not_confirmed
mappas till "ej_bekraftad" ENDAST vid korrekta uppgifter (medlem-auth.ts:204).
medlem-auth.ts nu 556 r; sviten 17/17 GRÖN körd nu men täcker EJ glomt-grenen
(0 träffar). Score 7 → 8 (huvudgap mätbart stängt).*

- **Vad:** Medlemsautentisering via Supabase Auth (GoTrue v2) genom server-
  proxy: signup/signin/signout/session/GLÖMT-LÖSENORD (recover, neutral
  talkart), tokens ENDAST i httpOnly-kakor (access 1 h + refresh 30 d med
  rotation), rate-limit med IP-hash (signin + separat 5/IP/min för recover),
  typade felkoder (ej_bekraftad/rate/natverk — inexistens läcker aldrig),
  generell signin-feltext, gäst-läge kvar som mjuk fallback +
  migreringsbanner.
- **Nyckelfiler:** src/lib/medlem-auth.ts (556 r, 17/17 tester gröna mätta
  2026-09-16), src/app/api/medlem/route.ts (glomt-gren + glomtAnrop-rate-limit),
  src/components/ak1a/medlem-inloggning.tsx (220 r + glomt-läge), src/
  components/ak1a/{logga-in,inloggad-knapp,migrera-progress}.tsx, src/app/
  (huvud)/logga-in + speglar, verktyg/testa-medlem-auth.mjs.
- **Observation:** KÄRNAN är ren och väldokumenterad (kontrakt i filhuvud,
  hermetik vid build, SSR-vägar). LOGIN-2.0 E2E-verifierad på prod
  (specifika feltexter + live-räknare) och GLÖMT-LÖSENORD kompletterar
  kärnan med samma säkerhetsdesign (KRITA-regeln: kontoexistens avslöjas
  ALDRIG — recover svarar alltid neutralt). Prod /logga-in 200 (mätt).
- **GAP (avgörbart):** (1) egen E2E-svit saknas (sviten är logikstubbar,
  inget levande flöde); (2) glomt/recover-grenen OTÄCKT av testa-medlem-auth
  (0 träffar — mappning + neutral talkart är rena funktioner, sviten
  stubbar nätverket redan); (3) återställningsmejlets leveransväg (GoTrue-
  konfig, avsändardomän) overifierad — kodvägen grön, mejlvägen omätbar
  från arbetsytan.

## D21. Medlemsdata & progress — LEVER — 8/10 *(uppdaterad 2026-09-16)*

- **Vad:** Medlemsprogress (kurssteg, quiz-XP, flashcards) i Supabase med
  lokal member-local-fallback, min-sida (nästa steg, streaks, lärväg),
  migrering gäst→moln, medlemsprofil-event.
- **Nyckelfiler:** src/lib/medlem-progress.ts (478 r), src/lib/
  medlem-progress-klient.ts, src/lib/member-local.ts, src/app/api/medlem/
  {route,progress,portfolj,bevakning}, src/app/(huvud)/{min-sida,profil},
  src/components/ak1a/{min-sida (1 093 r),migrera-progress,fortsatt-panel}.tsx,
  verktyg/{testa-medlem-progress,testa-medlem-auth}.mjs.
- **Observation (mätt 2026-09-16):** requestskopad läsning (§B.4-dokumenterat
  + svit-test 11), deterministisk kärna, ALLA fyra API-rutter vaktade med
  lasMedlemSession (mätt per fil); GET i prod svarar 200 {inloggad:false}
  för gäst (tyst kontrakt, aldrig 401-text) medan POST bär 401/429/400/502;
  sviterna KÖRDA GRÖNA denna dag: 13/13 progress + 17/17 auth.
- **GAP:** (1) migrering enkelriktad (moln→lokal återgång vid offline
  saknas — öppet designval, dokumentera för att stänga); (2) ~~progress-
  integritet (XP-replay-skydd) otyst~~ **STÄNGT 2026-09-16**: importen är
  engångs (import:<authId>:<datum> ⇒ förbrukad) + takad mot teoretiskt max
  ur kursdata MED avdrag för redan registrerat (våg 87-koden, svit-testad);
  (3) GDPR-export/radering av eget konto finns ej i UI (endast kontaktväg)
  — tyngsta kvarvarande gapet, GDPR-DATAKARTA lever men UI-ytan är obyggd.

## D22. Betalning & prenumerationsstomme — VÄNTAR — 5/10

- **Vad:** Prenumerationssidan med tre nivåer, fas-rabatt (0,2) travas i
  klienten, aktiveringsintention i localStorage (köpflödets minne tills
  betallösning finns), e-postnotis till admin vid intention, prisdata ur
  variabelregistret (E32). FAS 2 = 9 999 kr, FAS 3 = 13 999 kr.
- **Nyckelfiler:** src/lib/prenumeration.ts (202 r), src/components/ak1a/
  prenumeration/* (aktivera-panel, niva-kort, rabatt-band, prenum-cta),
  src/app/(huvud)/{prenumeration,medlemskap} + speglar, src/lib/email-mallar.
- **Observation:** Stommen är prydlig (SSR-priser + klient-rabatt,hydrering-
  säkert) men DET FINNS INGEN BETALMOTOR: ingen Stripe/annan PSP-kod i src/,
  ingen webhook (utom /api/webhook/vbt för VBout), ingen kvitto-/faktura-
  väg. Ligger och väntar på kundens 8 L4-beslut + Stripe-identitet
  (bank-ID = KUNDENS HÄNDER enligt våg 96).
- **GAP:** (1) betalflöde (PSP-val + implementering) — blockerat på kundens
  beslut, förberett via G2-prisstegen; (2) transaktionspris MÅSTE läsas ur
  samma lager vid köp (kontrakt redan i variabler-lagring); (3) ångerrätt-
  flödet (2005:59 2 kap 10-11 §§) endast text — ingen ångerknapp/kvitto.

## D23. Prisstegen (portfölj-tier) — VÄNTAR (bakom flagga) — 7/10

- **Vad:** Tre tier-sidor (portfolj-grund/plus/hyra = 249/449/799 kr/mån i
  registret) byggda KLARA men oåtkomliga tills kundens prisbeslut:
  NEXT_PUBLIC_TIER_AKTIV=1 aktiverar (404-grind + robots + sitemap-gating).
  Alla pristal ur lasPriserGallande() — ingen hårdkodad siffra.
- **Nyckelfiler:** src/lib/tier-status.ts, src/components/ak1a/portfolj-tier/
  tier-sida.tsx, src/app/(huvud)/{portfolj-grund,portfolj-plus,portfolj-hyra}/
  page.tsx, data/portfolj-system/priser.json, src/lib/variabler-lagring.ts.
- **Observation:** EXISTS-kravet från G2 är uppfyllt i kod: sidorna bygger,
  grindas korrekt (robots.ts + sitemap.ts läser samma flagga), CTA går till
  ansökan/mailto (mänsklig aktivering — ingen betalmotor krävs för launch).
- **GAP:** (1) kundens slutliga priser (R2: prissättning väntar kund);
  (2) när aktiverad: speglar en/ar för tier-sidorna saknas (svenska-only);
  (3) tier-CTA:n mot betalflödet (D22) när det finns.

## D24. Fas 2/3-access — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 7): fas-seten MÄTTA EXAKTA i
kod — FAS2_KURSER 18 + FAS3_KURSER 24 (kurs-access.ts:29–84) medan
underlaget vuxit till 369 kurser; grindytan oförändrad sedan
Fas-inversionen (direktiv 2026-09-03). Alla ytor 200 mätta (sv + en/ar-
speglar + /fas3); valideringsgrenar 400 + admin-grind 401 mätta live.
Gap 1 bekräftad men sido-kön STARKARE än kartan: ansökan loggas som
system_event type=fas2_ansokan (syns i admin Systemevents) + content-range-
räknare + VBOUT-lead vid ansökan. Gap 2 nyanserad: "Din elevstatus" VISAS
på ansökningssidan (fas2-ansok.tsx:132–150) — det som saknas är
ANSÖKNINGSUTFALLET (väntar/beviljad). Gap 3 bekräftad (stapel-id:n, ingen
publik verifiering). NYTT GAP (4): /api/fas2-ansok saknar rate-limit helt
(mätt; kontrast /api/email 10 IP/min, /api/referral/kod 6/min) — öppen
POST-yta med Supabase-skrivning.*

- **Vad:** Ansökningsflöde för Fas 2 (fördjupningskurser) och Fas 3
  (professionsnivå), admin-aktivering per medlem, certifikat för Fas 3,
  tier-status i klienten, 18/24 kurser bakom grind (mätt exakt 09-16).
- **Nyckelfiler:** src/components/ak1a/{fas2-ansok,fas2-gate,fas3-cert}.tsx
  + spegel/spegel/fas2-ansok-{ar,en}.tsx, src/app/(huvud)/{fas2-ansok,fas3},
  src/app/api/{fas2-ansok,admin/fas2-access}, src/lib/tier-status.ts,
  src/lib/kurs-access.ts (grindkärnan, 274 r).
- **Observation:** Grindkorrekt i både UI och API; admin-yta för aktivering
  finns; certifikatutfärdning kopplad till Fas 3; speglarna lever (200
  mätta i alla tre språk).
- **GAP:** (1) manuell aktivering skalar inte vid många ansökningar (EN
  medlem per anrop mätt — men system_events-kön + VBOUT-lead fångar varje
  ansökan); (2) elevstatus visas men ANSÖKNINGSUTFALLET syns ej för eleven
  (endast toast); (3) Fas 3-certifikatets äkthetsverifiering (offentlig
  kontroll-URL) saknas; (4) rate-limit i /api/fas2-ansok saknas (nytt,
  mätt 09-16).

## D25. Referral + e-post + notiser — LEVER — 6/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 7): diffad mot verkligheten —
dubbel natur mätt. YTORNA lever (GET /api/notiser 200 med levande underlag,
valideringsgren 400 mätt i prod, /api/referral/kod POST-only, signal-buss
lage supabase). Men BREV-FUNKTIONEN kan inte verka: 0 leverantörs-variabler
satta i .env* (mätt) + /etc/crontab saknar email-raden (ENBART Vercel 06:30
UTC) = inga brev kan ha skickats från prod-servern. STORFYND: VBOUT-leden
(123 r, webhook SATT) saknades helt i kartan — kundens lead-automation är
den enda konfigurerade e-postvägen. Notis-taket rättat 50→100. Gap 3 delvis
motbevisat (admin mäter lyckade värvar). Score 6 orörd. Se diff-tabellen i
UPPDATERING-sektionen.*

- **Vad:** Referral-koder (m10-mönstret: system_events-rader, senaste-vinner,
  bevisad lagringsväg utan DDL), e-post-sändare + mallar + VBOUT-lead-adapter,
  notiscenter + notishistorik + signal-buss-underlag.
- **Nyckelfiler:** src/lib/referral.ts (301 r), src/app/api/referral/kod
  (133 r), src/components/ak1a/{ref-mottagare,dela-kort}.tsx (tipskod-knappen
  på /forskningsbiblioteket/[ticker]), src/lib/{email-sandare (185 r),
  email-mallar (274 r — morgon/vecka/fas2nudge/nyhetsbrev + disclaimer),
  vbout (123 r)}.ts, src/app/api/{email (232 r),cron/email (232 r)}, src/lib/
  notiser.ts (363 r), src/app/api/notiser (125 r), src/components/ak1a/
  notis-center.tsx.
- **Observation:** Referral är mallren (dokumenterat mönster som variabel-
  panelen byggde på); m10 steg 2 BYGGS EJ (väntar kundens policy J1–J2,
  referral.ts:15). E-post: mallar + sändare + cron finns men leverantören är
  OKONFIGURERAD (mätt 09-16 — alla brev köas, kundsetup är checklan i
  email-sandare.ts:6-28); VBOUT-leden däremot SATT. Notiser: localStorage
  med 100-tak + 30 dagars golv (mätt; våg 86:s 50-tal föråldrat), servern
  levererar levande underlag + signal-bussen.
- **GAP:** (1) 0 testsviter för e-post-leden (VALIDERINGEN + felvägarna
  finns i kod och är mätta i prod — 400/429/503/502 — men otästa); (2) notiser
  saknar server-side-lagring av historiken (enhetbyte = förlorad fästning;
  underlaget + signalerna återkommer); (3) referral-uppföljning i admin =
  ANTAL lyckade värvar (totalt + 30 d, motbevisat gammalt gap) men ingen
  identitetsnivå — medvetet GDPR-val; (4) NYTT: mejl-cronen ENBART
  Vercel-driven (Contabo-crontab saknar raden) + vagkarta-null i
  notis-underlaget trots skrivande vagscan-cron (kö till huvudagenten).

## D38. Medlemsnavet — Min Sida-portalen — LEVER — 8/10 (NY 2026-09-13 · mätt 2026-09-16)

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 5): diffad mot verkligheten —
INGEN funktionsrörelse sedan 09-13 (endast LarvagKort-läsbarhetsrader 3d25e4f5
+ /min-sida revalidate=3600 b77699ba + (huvud)-layoutens prefetch-kur
184c6dc7). Gap MÄTTA: API-texter fortfarande svenska i alla grenar
("Inloggning krävs." 401 / "För många anrop — vänta en minut." 429 i både
bevakning- och portfolj-rutterna), förhandsfyllnad 0 träffar (våg 120:s
"antal/kurs valfria senare" = medvetet designläge), 0 egna E2E-sviter.
Prod /min-sida 200 på loopback OCH HTTPS. Score 8 kvar (E33-precedensen:
kunskap tillförd, inga gap stängda).*

- **Vad:** Portal-megaplanens kärnleverans (STYRELSE-PORTAL-MEGA.md,
  kundens sex krav → en yta): Min Sida som plattformens nav med Dashboarden
  (våg 102), LarvagKort + Fortsatt-panel + KursNavet "Mina kurser"
  (påbörjade/kurser med quiz-rätt, våg 103), AnalysNavet med ☆-bevakning
  per konto i system_events (våg 104), PortfoljNavet — utbildningsportföljen
  med antal/inprisad kurs, aldrig värde/råd (våg 119) — och korskopplingarna
  bevakning→portfölj→analys→metodkurs med one-click (våg 120). Tre språk
  fullt via useSprak + speglarna (våg 113).
- **Nyckelfiler:** src/components/ak1a/portal.tsx, src/components/ak1a/
  {analys-navet,kurs-navet,portfolj-navet,larvag-kort}.tsx, src/lib/
  {medlem-bevakning,medlem-portfolj}.ts + -klient.ts, src/app/api/medlem/
  {bevakning,portfolj}/route.ts, src/app/(huvud)/min-sida.
- **Observation:** KONSISTENT mönster genom hela navet: serverfastställda
  värden (§B.3), senaste-vinner, session-rotation + rate-limit på alla
  API:er, sidorna statiska (data via klientens rundturor), marin palett
  med 44 px-tryckytor (våg 105 KO-regler), gränssnittsvakten GRÖN i alla
  mätningar sedan leverans. Juridikgrinden genomförd: bevakning =
  läsningslista, portfölj = studielista — aldrig värde eller råd.
- **GAP (till 10/10):** (1) inga egna E2E-tester (KVD-måttets manuella
  flöden gäst/inloggad/tre språk körs för hand); (2) pass.namn-API-texter
  fortfarande svenska (motorpipelinen översätts separat); (3) portföljens
  djupanalys-yta reserverad som tier-yta (R2 — väntar kundens prisbeslut);
  (4) antal/kurs-fält vid one-click-bevakning→portfölj valfria att fylla
  i efteråt (kunna förhandsfyllas ur senaste analys).

---

# E. STYRNING, VERKTYG & GRUND

## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u2 omgång 3): MEGA-BESLUTETS SPÅR 1–2 SAKNADES I
KARTAN och lever nu (allt mätt i arbetsytan): godkännandeytan
src/app/api/studio/godkannande/ (requireAdmin på alla metoder, atomär
val-fil, kundens R2-publiceringsknapp med mekanisk juridikgrind kopplad i
publicera-rutten — våg 168 integration-audit p4), audit-megasystemet
src/lib/studio/audit-logg.ts med AKTIV audit-logg.jsonl (68 677 byte),
juridikgrind-vakt.mjs KÖRBAR (GUL: 0 FEL / 8 VARNING, larmfil lever) och
GDPR-DATAKARTA.md. Admin-sessionssviten 14/14 GRÖN mätt nu; 16 panelkomponenter
(förr 15). Score 8 kvar: publicera-vägen E2E-overifierad (R2-knappen är
kundens), juridikvakten ger FP på meta-texter som citerar förbudsorden,
gamla gapen kvarstår.*

- **Vad:** "WordPress på långt håll": 15+ flikar (översikt, medlemmar,
  variabler, blogg-publicering, översättning/termbank, kurser-metadata,
  media, bokningar, analys-uppladdning med Elliott-redigerare, aktivitet,
  ekosystem, trafik/säkerhet, konvertering, utveckling, puls), rollerna
  ADMIN + REDAKTÖR, HMAC-signerad session-cookie (8 h). Sedan
  mega-beslutet (2026-09-14) dessutom: godkännandeytan ("väntar på dig"-
  lista med förhandsgranskning + kundens publiceringsknapp, R2 intakt)
  och audit-megasystemet (append-only händelselogg per autonom skrivning)
  — byggda på samma admin-session.
- **Nyckelfiler:** src/app/(huvud)/admin/page.tsx, src/components/ak1a/admin/
  (16 komponenter), src/lib/{admin-auth (245 r),admin-klient,medlem-admin}.ts,
  src/app/api/admin/** (24 rutter), src/app/api/studio/godkannande/**
  (route + publicera), src/lib/studio/audit-logg.ts,
  verktyg/{testa-admin-session (14/14 mätt 2026-09-15),juridikgrind-vakt}.mjs,
  data/vakten/{audit-logg.jsonl,godkannande-val.json,juridik-larm.json},
  data/forskning/GDPR-DATAKARTA.md.
- **Observation:** Alla fyra provade delsviter gröna (admin-session 14/14
  MÄTT NU igen, kurs-metadata 16/16, mediabibliotek 18/18, medlem-auth
  17/17). Prod utan ADMIN_PASSWORD ⇒ 500 på skrivytor (inget
  dev-fallback-läck). REDAKTOR_PASSWORD satt + verifierad (våg 96).
  Variabelpanelen har vitlista + gratis-lås + revisionslogghistorik.
  Godkännande-rutterna bär requireAdmin + audit-rad per val, och
  publicera-rutten kör kontrolleratext-grinden mekaniskt FÖR publicering
  med audit-aktör "kund" — R2-knapptryckningen förblir kundens.
- **GAP:** (1) commit-back-spegling (Supabase→priser.json/termbank) är
  MANUELL (synka-variabler/synka-termbank före pipelinerun) — steg 5-alt C
  automation återstår; (2) session-cookie-läget dokumenterat men sessionStorage-
  rester (x-admin-password) lever kvar som bootstrap; (3) analys-uppladdningens
  Elliott-redigerare saknar test; (4) admin-URL:en offentligt känd —
  fail2ban-liknande skydd mot lösenordsmalming finns via rate-limit men
  ingen IP-block; (5) NY: juridikgrind-vaktens ordlista ger 8 FP-VARNINGAR
  på meta-texter som CITERAR förbudsorden (t.ex. gransknings-MD:er som
  redovisar "0 träffar på köp/sälj-råd") — grinden lär sig skilja citat
  från råd; (6) NY: publicera-vägen E2E-bevisas först vid kundens första
  knapptryckning (R2 — tills dess är flödet kodbevisat, ej körbevisat).


## E27. Studio (Z-portalen i molnet) — LEVER — 9/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (s9-u3 omgång 10): gap 4 MOTBEVISAT — våg 169
(a77bb1a3, 09-16) levererade lasV4Anvandning + /api/studio/tjanster/usage-v4
+ UI-konsumenter (studio-forbrukning-panel m.fl.). Våg 164–175 tillförde
maskinpuls, verktygsaudit, pub-ruttens publiceringsgrind mot juridikgrinden
(v168), värme-kontext/sticky-complete (v170), v4-resync (v172), v4-command
sendText etapp 2 (v175) och godkännandeytan (g1). Live 09-17: /studio 200,
stream-rutten 401-härdad och monterad. Score 9 kvar — se diff-tabellen i
UPPDATERING-sektionen.*

*Uppdatering 2026-09-15 (s9-u3): TRÅDENS PERMANENS (våg 148) kodad och
verifierad i src/app/api/studio/stream/route.ts:175-323 — GET svarar
tradHistorik = HELA huvudtråden (äldst→nyast) läst ur zcode:s EGNA
sessionsdatabas, målet återarmas vid första anropet efter omstart, och
klientens poll ersätter aldrig vyn med en enskild sessions korta svans
(v144-mordvapnet avlägsnat) — kundens mest återkommande smärta ("allt
försvinner när jag uppdaterar") kurerad i roten. Skal-kvoten (v137/148):
studio-skalets sammansatta bash-kommandon kan hänga ~30 s (verkställt men
svaret förlorat) — KUR-reglerna lever i AGENTS.md (node-wrappers först,
verifiera effekt efter häng, tunga körningar till subagent).*

- **Vad:** Kunden chattar med AK1A-agenten på /studio via zcode-app-cli-
  barnprocesser: streaming med verktygskort/diff/tankar-vy, multi-session-
  tabbar, mål-läge (autonom loop som lever i servern), bildbevis (agenten
  SER bilder), rewind (turn-fork), kommandopalett, modell/läge/tanke-val,
  server-persistenta inställningar, plugin-drift, styrelseregel-yta,
  uppladdningar, hälsa, admin-verktygslåda — våg 81-93 allt levande.
- **Nyckelfiler:** src/lib/studio/{studio-transport.ts (8 316 r!),
  permissions-policy.ts (381 r, 63/63), styrelse.ts (864 r), kommandon.ts},
  src/components/ak1a/{studio-chat,studio-admin-panel,
  studio-fardigheter-panel,studio-minne-panel,studio-html-export}.tsx*,
  src/app/(huvud)/studio, src/app/api/studio/** (24 rutter), data/forskning/
  V91-Z-PARITET-KARTA.md.
- **Observation:** Kodbasens tyngsta och mest härdade system:
  barnprocess-overlevnad (auto-restart 3 försök backoff 2/8/32 s, race-skydd),
  MAX_AKTIVA_BARN=3 + idle-städning, SSE-hjärtslag 15 s, disk-persistens av
  sessionskarta, friskgångsregel vid modellDöd, varm transport vid omstart,
  abort-vakter som ALDRIG dödar arbete, 501-graceful-kontrakt för metoder
  binären saknar. E2E: 7 PASS / 0 FAIL / 2 SKIP (våg 92, prod). Paritet
  ~39/91 tjänster — taket satt av binären 3.11.2-22 (=npm latest; utredning
  stängd våg 93: automation/webbläsare ej exponerade i NÅGON version).
- **GAP:** (1) binärbevakning per våg (`npm view zcode-app-cli version`,
  dokumenterad rutin) — vid version > 3.11.2-22 körs v92-e2e direkt;
  (2) -32031 vid första meddelandet efter omstart (självläker på sekunder,
  engångskostnad — obevakad bugg); (3) äkta v4-attachment-väg implementerad
  men ej live-bevisad (referensvägen bär bilder idag); (4) usage/cost-panel
  per dag (F3) tunn i UI; (5) skal-kvotens ~30 s-häng är karaktäriserat men
  EJ botat i binären — node-wrapper-disciplinen är en process-kur, ingen
  teknisk kur (återkommer tills app-servern fixar det underliggande).

## E28. Styrelsemotorn (AI-styrelsen) — FLAGGA — 6/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (s9-u3 omgång 10): RONDERNA lever — drivs av
PUMPOR-DAEMONEN (min 43, timme%3==1; ps-bevis), senaste beslutsminnespost
2026-09-16T20:43Z i exakt rond-fönster, juridikgrind-vakten ropas :37 före
varje rond; crontab bär INGEN rond-rad (regelverkets formulering är inexakt
om drivkällan). MÖTENA stillastående sedan 09-15 07:55 (senaste mötet
05:17 FULL DELEGATION) = inga sammanträden har krävts, ej motorfel.
Gap 1 (JSON-fallback i senaste mötet) kvarstår; FLAGGA 6 kvar — se
diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-15 (s9-u3 omgång 3): lägesrättning på egna mätningar —
STYRELSE-BESLUT.md lever till 2026-09-15 07:55 (inte stoppad 09-10 som
originalfyndet anger): FYRA möten tillkommit (09-13 10:48 + 20:19, 09-14
22:57 MEGA-SYSTEMBESLUT, 09-15 05:17 FULL DELEGATION) och Åtgärder-raderna
bär INNEHÅLL i alla fyra ("(inga)" finns bara i 09-10-mötena) —
"R2-verkställningen får inget att verkställa" är motbevisat för 09-13→
09-15 (vågorna 146–158 är spåren). MEN ordförande-JSON-fallbacken lever i
senaste mötet (09-15 05:17 bär "kunde ej tolkas som JSON", 3 organ):
gap 1 kvarstår, FLAGGA och score oförändrade.*

- **Vad:** R1-R4-governance: 5 rollagenter (ordförande/teknik/säkerhet/
  juridik/tillväxt) i vågor inom barnprocess-taket, ordförandesyntes →
  BESLUT {beslut, motivering, åtgärder, existential}, R2-klassning
  (existentiellt ⇒ VÄNTAR KUND), protokoll till STYRELSE-BESLUT.md +
  system_events, dispatch till PIPELINE-KO.md.
- **Nyckelfiler:** src/lib/studio/styrelse.ts (864 r), src/app/api/studio/
  styrelse/**, src/lib/autonom/{organ,organ-bus,styrelse}.ts, src/app/api/
  styrelse/** (8 rutter: beslut, mote, protokoll, agendas, kommunikation,
  marknadsforing, djup, autonom), data/forskning/STYRELSE-BESLUT.md,
  PIPELINE-KO.md, verktyg/testa-styrelse.mjs.
- **Observation:** **KÖRT FYND:** senaste protokollen i STYRELSE-BESLUT.md
  (2026-09-10) visar "Automatisk syntes (ordförandens svar kunde ej tolkas
  som JSON)" + rollsvar som EKOAR PROMPTEN ("Mottaget: KONTEXT — AK1A …"
  trunkerat) + "Åtgärder: (inga)". Motorn lever (möten körs, 5/5 organ
  svarar, protokoll skrivs, append-vakten fixad våg 95) men SYNTESEN faller
  till fallback och besluten blir tomma — dvs. R2-verkställningen får inget
  att verkställa. Dev-mock-testet (6/6, våg 91) täcker ej detta.
- **GAP (avgörbart):** (1) tolka/normalisera ordförandesvaret (JSON-reparatur
  eller strukturell prompt med schemavalidation + retry); (2) rollsvars-
  rendering: skilj prompt-eko från analys (trunkeringen klipper vid "värdep…"
  — svaren är troligen svar-text men presenteras oklart); (3) E2E-test som
  kräver åtgärder.length > 0 på en enkel fråga; (4) protokollens läsbarhet
  (markerade originalsvars-texter).

## E29. Autonoma organet + cron-pipeline — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 6): tillväxt MÄTT — status-
katalogen bär 66 klara + 1 pågående manifest av 67 (+41 klara på ett dygn;
25 vid senaste diffen), pumpor-daemonen uppe sedan 15 sep (ps), beslutsminnet
48 poster (32 vid senaste diffen). MEN dagens dokvågsomgång avslöjade ett
STRUKTURELLT GAP: våg 104:s regel "exklusivt filägarskap per agent" gäller
uppdragens egna filer — dokvågsuppdrag pekar tre syskon på SAMMA kartfil
(SYSTEMKARTAN.md) utan lås eller sekvensering. Mätt bevis: tre commits på
19 minuter (6fcd6621 13:02:05 · b20f0b92 13:11:19 · bf05b6d1 13:20:37),
tre trädskiften mitt i en syskons mätning, och en hel E35-sektion som
skymtade i arbetsträdet ~13:1x och FÖRSVANN i en senare syskonskrivning
(innehållet återställdes av författarens egen commit — tur, inte mekanism).
Kur-kö: låsrad per kartfil i manifestprompts ELLER "commit:a din sektion
innan nästa syskon mäter". Score 8 kvar (E33/B14-precedensen: kunskap
tillförd, inget gap stängt). Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-15 (s9-u3): autonomi-pipelinen MEKANISK och
driftbevisad. Agentfabriken (våg 146: verktyg/agentfabrik.mjs — RAM-vakt
vägrar ny omgång under 1 500 MB tillgängligt, omgångar om 3 parallella
barn, timeout 25 min/uppgift, döda barn loggas aldrig tyst död,
leveransbevis per uppgift; status-katalogens 25 manifest "klar" är
driftbeviset). Pumpor-daemonen ropar fabriken :x5 och evighetsmotorn :x8
(ps-bevis: daemonen uppe; motorn kickar vid 20 min stillastående, tak
1/25 min — kundens paus helig). Kunduppdragsprotokollet (v156): order ⇒
data/vakten/kunduppdrag.json som sessionens MÅL ⇒ arbetas tills helt klar ⇒
uppdrag-klart.json + "UPPDRAG KLART"-kvitto. Beslutsminnet tätt: 25
poster, senast rond 30 (2026-09-15 08:49). Score 7→8: felhantering och
leveransbevis bevisade i drift — kvar utan egen testsvit.*

*Uppdatering 2026-09-13: våg 113–120 stärkt organet: prompt-evolution v1+v2
(barnorgan ärver uppdrag + deterministisk mutation → organ-mutationer.json),
organ-registret deploy-säkrat (runtime-tillstånd i data/vakten/, gitignore —
deployerna skrev över evolutionens ronder), organism-panel + senaste
prod-commit landningar synliga i studion (våg 114/118), styrelse-rond-cron
verifierad levande (senaste ROND 2026-09-13 05:43), beslutsminne.jsonl
påbörjat 2026-09-13 (rond-promptens steg 6 hade aldrig exekverats innan).*

- **Vad:** Organbussen + organrundor (autonoma ronder), 8 cron-motorer
  (vagscan, nyheter, autonom, kvalitet, oversatt, email, expand-courses,
  datacache, seo-refresh, portfolj-uppfoljning, akm3-kalibrering, vagvali-
  dering — 12 rutter), utvecklingsradarn, mega/tasks.
- **Nyckelfiler:** src/lib/autonom/{organ (674 r),organ-bus}.ts,
  src/app/api/{organ/runda,autonom/status,cron/*}/**, src/lib/organ-event.ts,
  src/lib/signal-bus.ts (577 r), vercel.json (12 crons), /etc/crontab på
  Contabo (användarfält FIXAT, worklog rad 9340).
- **Observation:** Motorregistret (data/motorregister.json, 2026-09-03):
  42 motorer — 8 med cron, 3 med puls, 3 organ, **28 helt utan autonomi**;
  32/42 saknar test. CRON_SECRET vaktar endast OM satt — publika cron-
  endpoints annars (localhost-caller på Contabo + Vercel-header stöds).
- **GAP:** (0) fabrikens delar (agentfabrik/evighetsmotor/pumpor) saknar
  egen testsvit — RAM-vakt/timeout/lås är verifierade i drift men inte
  regressions-testade; (1) CRON_SECRET sätt i prod-env (en rad) eller bind
  crons till localhost-only; (2) 28 motorer utan triggare — inventera vilka
  som SKA vara autonoma (registeruppdatering!); (3) organrundornas resultat
  syns ej i admin-utvecklingsradarn live.

## E30. B2B / AK1A PRO — INAKTIV — 6/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (s9-u3 omgång 10): INAKTIV-läget bekräftat live
(/pro 200 "Under uppbyggnad" + noindex; robots stänger /pro/admin);
grind-sviten sann exit 0 grön i egen körning; demoklient-G1 fortfarande
röd (16/1). NYTT: kvalitetsvaktens YTA-regel täcker sedan 09-16 (s8-u3,
4c77d419) route-gruppen (huvud)/pro/** via arProYta-normalisering —
B2B-terminologi vakad utan MANUELL-träffar (vaktkörning 11/11 PASS).
Aktivering väntar fortfarande jurist + kund (R2). Score 6 kvar — se
diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-15 (s9-u2, mätt i arbetsytan): testa-b2b-grind.mjs är
REPARERAD och KÖR GRÖNT (33 kontroller, 0 FAIL, exit 0 — importbron lagad
sedan inventeringen 2026-09-11); testa-pro-screening 26/0 grönt. NYTT FYND:
testa-demoklient-data 16 PASS / 1 FAIL — G1 ("minst ett fullständigt
AKM2Resultat — 0 st") röd: demoklientens data bär inget komplett
AKM2Resultat (fixture/data-avvikelse, ej grindfel). Läget fortsatt
INAKTIV — aktivering väntar jurist (K-B2B) + kund (R2).*

- **Vad:** Pro-plattformen för analytiker/institutioner: klientportaler,
  pro-screening, morgonrond, mötespaket, DPA-mall, rapportverkstad,
  CSV-import, tenant-modell — allt bakom NEXT_PUBLIC_B2B_AKTIV (av:
  toppväljaren visar bara "Privatperson", /pro = noindex "Under uppbyggnad",
  robots stänger).
- **Nyckelfiler:** src/lib/b2b-status.ts, src/lib/pro/tenant.ts,
  src/app/(huvud)/pro/** (6 sidor), src/app/api/pro/** (4 rutter),
  src/components/ak1a/pro/ (13 filer), verktyg/{testa-pro-screening,
  testa-b2b-grind,testa-demoklient-data}.mjs, data/forskning/B2B/ +
  V86-B2B-AKTIVERING.md.
- **Observation (uppdaterad 2026-09-15):** Grindmönstret rent och komplett
  dokumenterat; samtliga tre testsviter KÖRS nu (grind 33/0 + screening
  26/0 gröna, demoklient 16/1 — se G1 nedan). Historik: grind-testet var
  TRASIGT vid inventeringen 2026-09-11 (ERR_MODULE_NOT_FOUND via `@/lib`-
  alias) och föll tyst — det är lagat. Väntar jurist (K-B2B) + kund.
- **GAP (uppdaterat 2026-09-15):** (1) ✓ HÄVT — testa-b2b-grind reparerad
  och helgrön (33/0, mätt); (2) juristbeslut (K-B2B avtal/DPA) väntar;
  (3) tenant-isoleringens testtäckning (multi-kund-läckage) tunn; (4) NY:
  demoklient-G1 röd — demodatot saknar fullständigt AKM2Resultat; fixa
  fixture eller testkontrakt innan B2B-aktiveringspaketet hämtas fram.

## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u2 omgång 3): det KÖRTA FYNDET nedan är HISTORIK —
motorvalideringen KÖRD I DENNA DOKVÅG: 107 PASS / 0 FAIL / 0 SKIP (10,8 s),
MÖS-fasen passerar (termbankens garanti-kontrakt, termKonsistens,
sifferIntegritet). Båda 09-11-röda (B11-determinism + MÖS) är borta sedan
09-13 — "en av två röda som håller vakten GUL" stämmer inte längre.
Fallback-kön fortfarande 320 poster (mätt; ackumulerande enligt E33-brytningen
i dokvåg u3 omgång 3). I1-auditen opåbörjad (0 artefakter i data/forskning/),
tier-spegelgapet kvarstår (en/ar portfolj-grund saknas, ls mätt). Läge PÅGÅR
(I1) och score 7 korrekt kvar.*

- **Vad:** Tre språk (sv/en/ar) över hela sajten: spegelträd (en)/(ar),
  översättningsmotor med leverantörskedja (DeepL → Google → MyMemory →
  vantar-motor; Z.ai-gren med termbank i systempromten), MÖS-lagret
  (autodetekterad backend: tabell oversattningar → annars system_events →
  dev-fallback-kö), fyra kontroller (termer, siffror, struktur, lateral) +
  kontrolleraText-grind, termbank med LÄGG/UPPDATERA/TA BORT, granskningskö
  i admin med PUBLICERA-knapp.
- **Nyckelfiler:** src/lib/oversattning/{motor (820 r),lager (890 r),kalla,
  kontroller,termbank (540 r)}.ts, src/lib/ordlista.ts (2 154 r),
  src/lib/sprak.ts, src/lib/{kurs-speglar,blogg-speglar,spegel-metadata}.ts,
  src/app/(en)/(ar)/**, src/app/api/{cron/oversatt,admin/oversattning,
  kurs-spegel}, data/{oversattning-kö.json (320 poster i fallback-kön),
  termbank-tillagg.json}, verktyg/{kor-oversatt-batch,importera-oversattning,
  synka-termbank,v80a-*}.mjs.
- **Observation:** ~100 % täckning (kurser, blogg, UI, dataset) men
  "okvalitetsgranskad sen våg 80" (rankning #2 korrekt). Historiskt fynd
  2026-09-11: motorvalideringen failade MÖS-kontrollen ("ordgräns 5000 /
  anropstak 400 respekteras ej") — MOTBEVISAT 2026-09-15: valideringen
  kör 107/0/0 med MÖS-grönt (mätt; även 2026-09-13 grönt enligt KVD-noten).
  Fallback-kön bär 320 poster (notering: "produktion kräver tabellen
  oversattningar" — kund-SQL ej körd).
- **GAP:** (1) I1-kvalitetsvåg: stickprovs-audit sv↔en↔ar (maskinella
  anomalier: ordlängd, okända tecken, ofullständiga, falska vänner) +
  fixpaket — OPÅBÖRJAD (0 artefakter, mätt 2026-09-15); (2) motorvalideringens
  MÖS-kontroll är GRÖN igen (107/0/0, mätt) men den testar deterministiska
  kärnor utan nät — kvotbalansen mot LEVANDE leverantör (MyMemory-fönstret)
  bevakas ej; (3) tabellen oversattningar
  (data/sql/oversattningar.sql) körs av kund ELLER event-vägen fullt ut;
  (4) speglarnas täckning av NYA ytor (tier-sidor D23 saknar speglar —
  mätt kvarstående 2026-09-15).


## E32. Guldkällorna (variabler + siffror) — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u3 omgång 2): siffror.json bekräftad mot
guldkällan (337/8 223/82 230 + kanonSomKurs 96; uppdaterad 2026-09-15 i
b514fe67). priser.json ORÖRD sedan 2026-09-07 (fbfb135f) — registret
stabilt, speglingsfönstret inte utlöst på 8 dagar. siffror-live bär nu ett
dokumenterat kontrakt i filhuvudet (raknelogik speglar rakna-siffror
EXAKT, per-fält-fallback, kastar aldrig, NEXT_PHASE-hermetik) men ingen
aktiv divergensvakt; Supabase-vägens prisnormalisering har typade guards
medan filvägen fortfarande saknar schema-kontroll. Score 8 kvar.*

- **Vad:** Pris- och tal-sanningen: priser.json (ALLA priser + fas-rabatt +
  B2B + onboarding) med Supabase-override senaste-vinner via variabler-
  lagning; siffror.json (381 kurser, 8 223 quiz ...) genererad av rakna-
  siffror; siffror-live (live-räkning ur lagret).
- **Nyckelfiler:** src/lib/variabler.ts (133 r, fil-default),
  src/lib/variabler-lagring.ts (362 r: lasGallande, modul-cache 5 min,
  hermetik vid build), src/lib/{siffror,siffror-live}.ts, data/
  portfolj-system/priser.json, data/siffror.json, src/app/api/variabler
  (publik GET, 60 s cache), verktyg/{rakna-siffror,synka-variabler}.mjs.
- **Observation:** Kontraktet (fil = seed, Supabase = sanning live) dokumenterat
  i filhuvudena; vakten PASSAR sifferkonsistens (0 fel). Alla prismätande
  ytor läser registret (verifierat i tier-sida + prenumeration + chatbot).
- **GAP:** (1) speglingsfönstret: repo-ändring av priser.json medan kund
  ändrat i panelen tystas av senaste-vinner (mitigeringarna dokumenterade
  i ADMIN-MEGA §4.1 men den automatiska speglingen är manuell); (2) siffror-
  live saknar konsistenskontroll mot siffror.json (två tal-källor);
  (3) priser.json saknar schema-validering vid inläsning (ogiltig JSON =
  tasgren).

## E33. Supabase-persistenslagret — FLAGGA — 7/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 9, återdiff): LEVER 8 →
FLAGGA 7 — system_events är TOM i prod sedan 13:46 (u3 3/3:s akuta mätning;
inga återimportspår vid 19:50-mätningen), arkivet 09-16 07:24 = enda kopian
(27,5 MB), och återimporten är MEKANISERAD men BLOCKERAD: aterstall-
system-events.mjs saknar dedupe-läge (mätt — arkivets 4 dublett-id dödar
PK-importen, bevisat i index-provet). Samtidigt mätts den kurerade ALTER
v2:FÖRLORAD i en clobber av våg 178-klassen: commit a3756ab7:s meddelande
bokför "v2 levererad i data/sql/ALTER-system_events-composite.sql" men
commiten (6 filer) saknar filen; disk + HEAD + hela pathhistoriken (enda
commiten 2a55da6e 09-05) bär V1 = det dubbelt underkända innehållet
(syntaxordning + kolumnen type); enda v2-beviset lever i
DR-INDEX-PROV-2026-09-16-2.md:33-34. Läkevägen i fem steg står i
UPPDATERING-sektionens kö. Översättningskön 320 EXAKT oförändrad
(240/71/9, node-mätt), inventory 24 dagar, schemadriften lever
(supabase-schema.sql rad 58/194/221/260 bär fortfarande type).*

*Uppdatering 2026-09-15 (s9-u3 omgång 3): tre preciserande mätningar.
(1) DR-FYND (s10-u2, konfirmerat s10-u1): system_events-tabellen bär COPY
0 rader i SQL-dumpen — händelseloggens DR-väg är MOLN-JSON-backupen
(backup-fran-molnet-kedjan); SQL-dumpen ensam återställer den inte, komplett
DR = båda kedjorna (dokumenterat i DRIFTSBOKEN). (2) Composite-indexet
MÄTT EJ INSTALLERAT: dumpen 2026-09-15 bär 0 CREATE INDEX på
public.system_events (enda träffen = RLS-policy p18) — gap 3 går från
"oklart" till bekräftat öppet; kör ALTER-system_events-composite.sql vid
nästa DR-fönster. (3) supabase-inventory.json 23 dagar gammal (generatedAt
2026-08-23; 362 tabeller / 17,7 M rader) + översättningskön 320 poster
(240 vantar-motor / 71 publicerad / 9 granskning) — kön ackumulerar,
publicerade rensas ej. Score oförändrad: kunskap tillförd, inga gap stängda.*

- **Vad:** Arkitekturens ryggrad: supabase-rest (SSRF-vaktad https*.supabase.
  co-klient), system_events-mönstret (senaste-vinner per nyckel, INGEN DDL
  krävs) återanvänt av MÖS/referral/variabler/kurs-metadata/blogg-utkast/
  medlemmar, migrate + status + cleanup-rutter.
- **Nyckelfiler:** src/lib/supabase-rest.ts, src/lib/supabase.ts,
  src/lib/data-access.ts, src/lib/datacache.ts, src/app/api/{supabase/*,
  migrate-to-supabase}, data/sql/*.sql (2 skript: oversattningar +
  composite-index), data/supabase-inventory.json.
- **Observation:** Mönstret är bevisat i prod på 6+ system (m10-doktrinen);
  service-nyckeln används ENDAST server-side; health-rutt verifierar live.
- **GAP:** (1) tabellen oversattningar körd? (fallback-kön 320 poster säger
  nej — kund-SQL spår; oförändrad 09-15→09-16, node-mätt); (2) retention-
  organets 30-dagarsregel måste exkludera innehållsbärande typer (dokumenterat
  beslut, implementationsstatus oklar); (3) composite-indexet EJ installerat
  i prod OCH den kurerade v2:n förlorad i clobber — återleverera ur
  DR-INDEX-PROV-2026-09-16-2.md:33-34 och kör FÖRE återimport; (4) NYTT:
  återimporten av den tomma prod-tabellen blockerad på dedupe-läge i
  aterstall-system-events.mjs (4 dublett-id, bevisat); (5) NYTT: arkiv-
  cadansen ojämn (lucka 09-10→09-14; senaste arkiv 09-16 07:24) —
  verifiera cron-kedjan.

## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): score 8 → 9 — incidentens
rot-gap STÄNGT + kurerna mätta genomförda. (a) Artefaktverifieringen lever
i KOD och DRIFT: verktyg/artefakt-verifiering.mjs (varje /_next/static-
referens i prerender-HTML måste finnas på disk; gron/trasig/okand exit
0/1/2 — mätblindhet aldrig grönt) ropas av prod-synk.mjs FÖRE pm2-restart
(deploygrind) och kraschvakt.mjs efter räddningsbygg (ärlighetsgrind —
HTML-200 lurar varm()); svit 12/12 PASS egen körning + EGEN frisk
prod-mätning gron (6 053 ms, trunkerad false). (b) ANVÄNDAR-crontaben
(mätt; /etc/crontab var fel källa i tidigare speglingsmätningar): 02:30
pg_dump med PGPASSFILE + markörvakts-append + 30-dagarsretention, 02:40
moln-JSON, gränssnittsvakt 1,7,13,19, arkiv sön 03:20 — pgpass-kuren och
markörvaktskopplingen GENOMFÖRDA (gamla kvar-noter motbevisade). (c)
DR-mallen ETT KOMMANDO: dr-total.mjs TOTAL-RTO 130,0 s + kirurgi-kedja 5
(1,18 M rader, sabotage gripet); egen markörvaktskörning 6/6 dumpar GRÖNA
(09-16: 1 288 041 rader / CREATE 99 / COPY 101). (d) Prod grön bestående
egen sond (hem 200 + 2/2 CSS 200) + pulsvakten överlevt 19:49-omstarten
(PID-mätt, rond 51:s beslut driftbevisat). Kvar: hybrid-sync, ISR 12/44,
Storage-restore, system_events-återimporten (E33:s FLAGGA, huvudagentens
beslut). Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 6): score 9 → 8 — DAGENS
PROD-INCIDENT nådde konsumentytan (B7-precedensen). Mätt 13:05–13:21:
prod-HTML 200 men 12/25 statiska resurser 404 (inkl. CSS-chunk ⇒ kundsynligt
ostylad), samtliga 12 saknas på disk; ROT-FYNDET är djupare än "ISR-
föråldring" (s8-u2:s tolkning): .next/server/app/index.html är FÄRSK
(12:51:39, efter BUILD_ID 12:50:29) och refererar de 12 saknade chunks —
byggets EGA prerender pekar på filer som aldrig emitterades = artefakt-
inkonsistens I bygget (BUILD_ID skriven trots saknade filer). Kedja:
OOM-dödat prod-synkbygge 10:02:39Z → manuellt triggt "Killed"-bygge 12:02Z
→ inkomplett .next → kraschvaktens auto-deploy 10:51:58Z byggde OM men
arten återkom inkomplett → felet PÅGICK vid 13:19 (pulsvakten: "trasig-bygg
(deploy pågår — larm undertryckt)", varv 24–25 — ENDA vakt som ser det).
Läkning = prod-synkens ombygge vid RAM≥2200 (796 MB vid 11:07Z-pollen;
RAM cirkulerade 629→2 044 under mätningen). RAM-vaktens två vägringar var
KORREKTA (förebyggde tredje OOM) och DR/backup-orkestreringen själv förblev
grön — men prod-KONTINUITET är E34:s kärna. NYTT GAP (5): post-build-
artefaktverifiering saknas i deploy-kedjan (jämför prerender-referenser mot
static/ FÖRE pm2-restart — dagens trasiga artefakt är färdigt testobjekt).
Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-15 (s9-u3 omgång 3): DR-kedjan KVARTALSÖVAD OCH
REPLIKERBAR samma dag (spår 10): natt-dumpen db-2026-09-15.sql.gz
återställd i isolerad PG17-skrap-DB på 17,7 s (s10-u2) + oberoende replik
14 658 ms (s10-u3) — RTO replikerbar av två operatörer; 1 246 728
public-rader (60 public-tabeller = v98 F3:s 60), medlemmar 3/3, kurser
10/moduler 122, 780 felrader samtliga kända Supabase-roller. Dump-
komplettheten är MEKANISKT bevisbar: verktyg/kolla-dump-markorer.mjs
(s10-u1 — pg_dump 17:s markörkontrakt, 3 sabotagefall gripna, baslinje
5/5 GRÖN på db-2026-09-{11..15}); egen mätning nu: GRÖN 29,4 MB /
1 267 803 rader / CREATE TABLE 95 / COPY 97 / 6,7 s / exit 0. Retention
30 dagar MEKANISERAD i cron-raden (crontab mätt: find -mtime +30 -delete),
5 dumpar på disk. Fabriksbarnet HAR sudo — DR-övningar körs nu autonomt
via agentfabriken, inget kundfönster. Nästa övning senast 2026-12-15.
Score 8→9: replikerbarhet + mekanisk dumpsäkring + autonom exekveringsväg.
Kvar som gap: s10-u1:s crontab-radbyten (markörvakts-append + pgpass —
cron-raden bär fortfarande db-lösenordet i klartext, värdet återges aldrig),
hybrid-sync, ISR 12/44, Storage-media-restore (DR-övningen täckte SQL).*

- **Vad:** Contabo = hela driften: pm2 'ak1a' + zcode-app-cli-barnprocesser +
  nginx + certbot, ak1a-halsa */5 (sjävläkande: pm2→nginx→loggning, aldrig
  loop-restart), ISR-uppvärmare 03:10, dagliga innehållscroner (06:30/08:00),
  månadsvis uppföljning, backup till dator-valvet (10 per-typ-snapshots +
  full system-events-dump gz + server-repo-tar + env-kopia chmod 600),
  DR-prov i skrap-postgres, deploy-skript med HTTPS-verifiering + revert-
  stoppregeln.
- **Nyckelfiler:** data/DRIFTSBOKEN.md (operativ handbok, fakta verifierade
  mot prod), data/infra/contabo/{setup-prod.sh,ak1a-varm.sh,starta-zcode.sh},
  verktyg/{deploya-contabo.sh,backup-fran-molnet.mjs,backup-server-filer.mjs},
  data/infra/hybrid/synka-dator.cmd, data/infra/agent-arbetsyta/AGENTS.md.
- **Observation:** DR-prov godkänt (20 s, 60 tabeller, 1 187 291 rader,
  768 ofarliga GRANT-fel), nattlig backup-cron verifierad (våg 97),
  crontab-användarfält-buggen FIXAD (worklog), ISR-varmare 12/44 vid
  testkörning (sökvägslistan finslipas successivt — dokumenterat).
- **GAP:** (1) datorns hybrid-sync overifierad (startmappens cmd = gammal
  3-stegsversion, timvis Schemaläggare ej påträffad — DRIFTSBOKEN känd
  brist #3); (2) main ligger efter develop — Vercel-reservens kodslack
  synkas vid större driftstörningar (manuell rutin); (3) ISR-varmarens
  täckning 12/44 → 44/44 (sökvägslista komplett); (4) backup-RESTORERINGS-
  prov av media-filer (Storage) ej gjort (endast databas provad).

## E35. Kvalitetssystemet (vakten + motorvalidering + verktygsbälte) — LEVER — 8/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u1 omgång 10 — tredje passningen):
KONTROLL 11 Typbaslinjen tillkommen (tsc via projektbinären, dagligen
07:02 av vaktpumpan, falsklarmsklassning; s8-u1 1f43c167) + YTA-kuren
arProYta() och A8-ETIKETT-UNDANTAG kodade (kvalitetsvakt.mjs 55 942 byte);
EGEN vaktkörning 11/11 PASS · FEL 0 · MANUELLA 0 · GRÖN (23:22:01Z);
prod-stilläget GRÖNT (omg 8:s köpost 5 verifierad: hem 200 + CSS-chunk 200
+ HTTPS 200, pulsvakt grön varv 330); artefakt-klassen av gap 3 mekaniskt
stoppad i deployvägen (prod-synk verifieraArtefakt FÖRE pm2-restart +
kraschvakt-ärlighetsgrind, kod mätt) — vaktrapports-stoppet återstår;
sviter 54 → 69; NYTT GAP (5): tmp-läckage-klassen — SIGKILL-dödad
svitkörning lämnade tmp_demoklient_koll.ts i trädet som bröt typbaslinjen
OCH pre-commit-grinden (mätt i kedja, kurat + återmätt grönt ×3).
Score 8 orörd (E33/B14). Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 8 — andra varvets första
återdiff): vaktbältet har vuxit KRAFTIGT på ett dygn — 33 → **54
testsviter** (mätt) varav tre s8-sviter körs gröna i egna körningar
(gränssnitt-konsol 14/14, statisk-sond 10/10, pulsvakt-statisk 17/17), fyra
nya verktyg (pulsvakt, pulsvakt-statisk, statisk-sond, gränssnitt-konsol) +
gränssnittsvaktens deployklassning (36 748 byte). Pulsvakten LEVER som
process (PID-mätt, varje minut) och FÅNGADE ett PÅGÅENDE prod-fel i
realtid: 12/25 statiska tillgångar 404 (mätt egna händer 11:12Z på loopback
OCH HTTPS — kundsynligt ostylat), medan prod-synken väntar RAM (2 106 MB <
2 200-tröskeln) för det läkande ombygget. Motorvalideringen 107/0/0 (8,1 s,
egen körning). Gap 3 (deploy-blockad vid RÖD) är nu EXEKTERAT av
verkligheten — felet nådde prod utan grindstopp. Score 8 orörd (E33/B14:
bältet stärker, aggregatorn + frusna motorregistret + gap 3 väger emot).
Se diff-tabellen i UPPDATERING-sektionen ovan.*

*Uppdatering 2026-09-15 (dokvåg s9-u1): FLAGGAN (105/2 GUL) är sedan
2026-09-13 historia — motorvalideringen omätten nu: 107 PASS / 0 FAIL /
0 SKIP (6,3 s). tsc-baslinjen är NOLL (våg 133) och pre-commit-grinden
(våg 138, `core.hooksPath` = verktyg/hooks) blockerar mekaniskt ALL
commit med tsc-fel eller R2-fil — blockerande bevisad med 8 isolerade
exitkodstester + R2-härdning (s8-u1). Tre nya vakter i bältet:
beroende-vakt (CRITICAL next 16.3.2 upptäckt, patch inom ^16.1.1-
intervallet), dödlänsvakt (3 012 sökvägar / 0 fynd / negativt
kontrollfall) och konfigintegritetsvakten (:x9). "37 testsviter"
korrigerat till mätbara 33. Originaltexten nedan är K1-historik från
2026-09-11; gällande skillnader se diff-tabellen i UPPDATERING
2026-09-15 högt upp i filen.*

- **Vad:** Kvalitetsvakten (11 kontroller över hela sajten: varumärke,
  JSON, länkar, kursdata, sitemap, motorer, åäö, siffror, typbaslinje —
  kontroll 11 till 2026-09-17; skriver
  kvalitetsrapport-SENASTE.md + RESULTAT_JSON), motorvalidering (42 motorer,
  determinism/kontraktskontroller), 69 testsviter i verktyg/ (mätbart
  2026-09-17; 54 vid 09-16-mätningen), pre-commit-grinden (tsc-0 +
  R2-filblockad vid varje commit),
  verktygsbältet (8 färdigheter + /status,/kvd,/deploy + agent-status.mjs),
  cron-kvalitet 07:00, DRIFTSBOKEN-koppling.
- **Nyckelfiler:** verktyg/{kvalitetsvakt,validera-motorer,agent-status}.mjs,
  verktyg/hooks/pre-commit (grinden, våg 138+s8-u1),
  verktyg/{beroende-vakt,doda-lankar,konfigintegritet-vakt}.mjs (2026-09-15),
  verktyg/testa-*.mjs (33 st, mätbart), data/motorregister.json, data/rapporter/,
  .zcode/{skills,commands}/.
- **Observation:** **KÖRT BEVIS (avvikelse):** just nu 105 PASS / 2 FAIL
  (netnet-determinism B11 + MÖS-kvoter E31) = **GUL**, medan AGENTS.md/
  KVD-basen dokumenterar "motorer 107/0/0 · vakten GRÖN". Vakten GÖR sitt
  jobb (den hittade felen) men baslinjen är inaktuell. Motorregistret är
  från 2026-09-03 och delvis föråldrat (eko-koppling har numera konsumenter).
  32/42 motorer saknar test; testsviterna körs manuellt (ingen CI-aggregator
  utöver vakten).
- **GAP (kvarstående 2026-09-15, s8-u1-reviderad):** (1) motorregistret
  regenereras (42 motorer, autonomi-kolumner, testtäckning — oförändrat
  sedan 2026-09-03, git-bevis efff399c); (2) "kör-alla-tester"-
  aggregator (33 sviter + PASS/FAIL-summa i RESULTAT_JSON-mönstret) —
  fortfarande provtagning — med 54 sviter; (3) deploy-blockad vid RÖD
  vaktrapport — grinden stoppar commit-nivån men ingen blockerar deploy;
  EXEKTERAT 2026-09-16 (mätt): .next-skadan nådde prod som kundsynligt
  stil-lös-fel (12/25 chunks 404) medan pulsvakten larmade högprio — ingen
  grind stoppade vägen; NYANSERAT 09-17: artefaktklassen stoppas NU
  mekaniskt (prod-synkens verifieraArtefakt FÖRE pm2-restart +
  kraschvaktens ärlighetsgrind, kod mätt) — vaktrapports-stoppet
  återstår; (4) STÄNGDA:
  netnet+MÖS röda (2026-09-13, 107/0/0), testa-b2b-grind trasig (kör
  GRÖNT igen 2026-09-15 — se sidofynd E30-revision ovan); (5) NYTT 09-17:
  tmp-läckage-klassen — SIGKILL-dödad svitkörning lämnar tmp_*_koll.ts i
  trädet som bryter typbaslinjen OCH pre-commit-grinden (mätt: en läcka
  låste ALL commit-tillstånd; vakt/svit/grind saknar tmp-skydd — köpost 1
  i UPPDATERING-sektionen); **VAKT/GRIND-ÄNDAN STÄNGD 09-17 av s8-u2**
  (verktyg/tmp-stad.mjs: signaturverifierad städning — rot-nivå + namnmönster
  tmp_*.ts/tmp_*_manifest.json + EJ git-trackad + GENERERAD-signatur — ropas
  av pre-commit FÖRE tsc + sektion 11 med transparensrad; svit 15/15, levande
  gränsbevis: äkta läcka städad AV GRINDEN under commiten; protokoll
  TMP-SKYDD-VAKT-GRIND-2026-09-17.md); **ROT-ÄNDAN** (tmp-generering flyttas
  ur roten till .tmp/) ägs av s8-u1 enligt anspråk — pågår, komplementär
  halva, se data/vakten/s8-tmpskydd-kollisions-notis-u2.md.

## E36. Mediebiblioteket — LEVER — 9/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 4): sviten OMÄTT GRÖN igen —
18/18 kontroller + kontrakt A7 REN (SVG-förbud, 2 MB-tak, magic-byte,
uuid-nyckel, hermetik; egen körning, exit 0). OG-kopplingen förblir MANUELL
(mätt: deploya-contabo.sh 0 og-generate-träffar; senaste manuella leverans
023e9f95 2026-09-09 — 8 OG-bloggbilder md5-bevisade; 404 OG-filer
committade i git). Bucket-förteckningen backas upp manuellt
(data/backups/media-filer-2026-09-{08,09}.json — 2 tillfällen, ingen cron).
Score 9 kvar; gap-listan kompletterad med backup-cadans.*

- **Vad:** Supabase Storage-bucket (publik läsning) + admin-panel: ladda upp,
  lista, kopiera URL, radera; kopplat till seo.tsx pageMetadata.
- **Nyckelfiler:** src/lib/mediabibliotek.ts (577 r), src/app/api/admin/
  media, src/components/ak1a/admin/media-panel.tsx, verktyg/
  testa-mediabibliotek.mjs (18/18).
- **Observation:** Provad sviten är den säkerhetstätaste i kodbasen: SVG-
  förbud, 2 MB-tak, magic-byte-formatkontroll (JPEG/PNG/WEBP/AVIF),
  uuidv4-nycklar (kundfilnamn når aldrig sökvägen — traversal dött vid
  födseln), SSRF-host-vitlista, bygg-hermetik, graceful vid ej konfigurerat.
- **GAP:** (1) nya bloggposter kopplar biblioteks-URL i pageMetadata manuellt
  (guide finns, validering av att OG verkligen finns saknas — deploy-skriptet
  bär fortfarande 0 og-generate-koppling, mätt 2026-09-16); (2) bucket-
  kvot/storleksbudget bevakas ej; (3) (2) audio/video-format stöds ej
  (medvetet? dokumentera); (4) bucket-förteckningens backup är manuell
  (media-filer-*.json, 2 tillfällen 09-08/09-09 — ingen cron).

## E37. Navigering & app-yta — LEVER — 8/10 *(uppdaterad 2026-09-16)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 7, återdiff): spår 7:s andra
våg landade EFTER kartans 09-15-mätning — allt nedan MÄTT i kod och data:
SPA-sektionerna koddelade (o27: PREC/PORTAL/AKTIER dynamic ssr:false +
SektionsSkelett i spa-hem.tsx:35-45 — ~190 kB renderas-aldrig-kod ur
startsidans kritiska chunk) och StudioChat-kedjan flyttad ur lås-vyns last
(o31: studio-klient.tsx:36 — hämtas först i authad-grenen; bunten växer med
varje mentorlager, lås-vybesökaren bär den aldrig). EFTER-tal (o27,
r5u2b-efter 16:28Z): LCP 5 542→4 360 ms, unused-JS 83→74 KiB på /.
o32 levererade första giltiga vilande-baslinjen på JS-friskt bygge (16:52Z,
load 0,56, 22/22 chunks gröna): / 0,54 · LCP 4 972 · CLS 0,000 · TBT 984;
/kurser 0,55 · LCP 5 429. /studio-EFTER (o31 §5) fortfarande obokförd —
vakaren lever men dess tidszonstolkningsbugg försköt triggern (o32 §1).*

- **Vad:** Kommandopalett (⌘K), sökindex (404-förslag + palett), huvudmeny +
  mobilmeny + meny-register, PWA (manifest + registrerare), tema-växlare,
  navigationsminne, global skeleton/lasy-global.
- **Nyckelfiler:** src/components/ak1a/{kommandopalett,huvudmeny,mobilmeny,
  pwa-registrerare,tema-vaxlare,navigationsminne,sprak-vaxlare,spa-hem,
  studio-klient}.tsx, src/lib/{sokindex,meny-register,navigationsminne}.ts,
  src/app/(huvud)/manifest, verktyg/kor-sokindex.mjs.
- **Observation (uppdaterad 2026-09-16):** Ren UI-logik i AK1A-DNA;
  sökindex genereras ur äkta data (kor-sokindex destillerar); menyer
  centraliserade i register. Mätbarheten fördjupad till SIDNIVÅ: efter
  SearchModal-latyn (s7 rond 4) nu också SPA-sektioner + StudioChat
  koddelade med samma husidiom (dynamic ssr:false + skelett), och första
  vilande-baslinjen på fullfungerande bygge dokumenterar att r4b2-rondens
  röda CPU-tal var instrumentartefakt (JS-nedbruten chunk-servning).
- **GAP (uppdaterat 2026-09-16):** (1) sökindexet statiskt mellan deploys
  (nya kurser/poster osynliga tills kor-sokindex + deploy; fortfarande ingen
  hook); (2) PWA offline-beteende overifierat (service worker endast
  registrerare?); (3) palettens täckning av pro/tier-ytor följer flaggorna
  men testas ej; (4) språkresolvens-CLS INTERMITTENT (~0,11 i r5u2b-EFTER
  men 0,000 i vilande-facitet — sv-locale isolerat 0,000; produktbeslut
  a/b/c fortfarande obokat); (5) fortfarande inga egna regressionstester
  (CDP/Lighthouse är mätbevis, inte testsviter); (6) footer-tryckmål (20 px)
  + AI-Mentor/ShortSeller-monteringsknappar (44 px) kvar till
  läsbarhetsrond 2 (bokade, ej glömda); (7) NY 09-16: /studio-EFTER (o31)
  obokförd + unused-JS poäng 0 kvar (74–79 KiB) och bootup 3,3–3,5 s /
  mainthread 7,7–7,8 s i båda färskmätningarna — koddelningen minskade men
  eliminerade ej spillet.

---

## AVSTÄMNING MOT SYSTEMRANKNINGEN (styrelsedokumentet)

Rankningens 11 rader stämda av mot koden — fyra lägesavvikelser + fyra nya
fynd utanför rankningen:

| Rankningens rad | Rankningens läge | Koden visar | Dom |
|---|---|---|---|
| 1. Inloggning/konto "TRASIG UX" | LOGIN-2.0 körs | KÄRNAN ren (17/17 tester, dokumenterat kontrakt); felet ligger i UX-lagret ovanpå — K2:s kartläggning är rätt väg | STÄMMER delvis — score 6 med FLAGGA på flödet, ej kärnan |
| 2. Översättningskorpus "~100 %, okvalitetsgranskad" | I1 pågår | ~100 % täckning + 320 posters fallback-kö + MÖS-kvot-FAIL (nytt) | STÄMMER + allvarligare: kvot-kontrollen själv är röd |
| 3. Kurs-schema A3 "pågår G1" | pågår | testa-schema-kurser 444/0 GRÖNT; FAQPage+Course+Breadcrumb lever i kod på kurserna | I PRAKTIKEN LEVER — G1 = slutverifiering återstår (mindre gap än rankningen antyder) |
| 4. Prisstege "pågår G2 bakom flagga" | pågår | Kod KLAR + korrekt gated (404/robots/sitemap via NEXT_PUBLIC_TIER_AKTIV) | LEVER-BAKOM-FLAGGA = VÄNTAR KUND — rankningens "pågår" överdriver bygget, semantiskt korrekt |
| 5. Lärväg "pågår H1" | pågår | Kärnan LEVER sedan våg 88 (deterministisk, varför-rader); H1 = revisionsstatus | LEVER i koden — dokumentationen efter |
| 6. AI-Mentorn "pågår H2" | pågår | Grundversion LEVER (NLU+Z.ai+grind); 2.0-datasetgrundning delvis | STÄMMER (pågående förbättring av levande system) |
| 7. Kvartalsrapport "pågår H3" | pågår | A4-KONTRAKT klart men /kvartalsdata EJ PÅBÖRJAD i src; M9-fabriken har kvartals-LÄSNING-utkast (sa-laser-du-en-kvartalsrapport) som är NÅGOT ANNAT | **STÖRSTA AVVIKELSEN: H3 är ej påbörjat i kod** |
| 8. Studio/Z-paritet "tak ~39/91" | bevakar npm | ~39/91, binär 3.11.2-22 = npm latest (utredning stängd v93) | STÄMMER exakt |
| 9. Betalning L4 "väntar kundens 8 beslut" | väntar | Ingen betalmotor i src alls | STÄMMER — score 5 |
| 10. B2B "väntar jurist, inaktiv" | inaktiv | Flagga av + EN TRASIG TESTSVIT (nytt) | STÄMMER + testförfall |
| 11. Systemkartan "saknas" | I2 | **Denna fil** | LEVERERAD |

**Nya fynd utanför rankningen (föres till styrelsen enligt R1):**
1. **Motorvalideringen är nederbörd: 105/2/0 (dokumenterat 107/0/0) ⇒ vakten GUL** — netnet-determinism + MÖS-kvoter. Två avgörbara fixar.
2. **Styrelsemotorn faller till automatisk syntes** — ordförandesvar ej JSON-tolkbart, rollsvar ekoar prompten, åtgärder tomma (protokoll 2026-09-10). R2-motorn lever men får inget att verkställa.
3. **testa-b2b-grind.mjs trasig** (ERR_MODULE_NOT_FOUND) — B2B-grindens testtäckning förföll tyst.
4. **Motorregistret föråldrat** (2026-09-03): "eko-koppling: noll komponentkonsumenter" stämmer inte längre; 32/42 utan test gäller dock kvar.

## TOPP-GAP FÖR DISPATCH (våg 102+ — härledda ur GAP-fälten)

1. **B11 Netnet-determinism + E31 MÖS-kvoter** (två röda i validera-motorer
   → vakten GUL) — små, avgörbara, återställer KVD-basen "GRÖN + 107/0/0".
2. **E28 Styrelsemotorns syntes** — JSON-tolkning/retry av ordförandesvar +
   rollsvars-rendering + E2E med åtgärder>0. Governance-kritiskt (R2).
3. **D20 LOGIN-2.0 (K3, pågår i våg 101)** — specifika fel + live-räknare +
   lösenordsåterställning; K2:s karta är indata.
4. **C17 H3 Kvartalsrapport** — kontraktet A4 färdigt; route + index + frys-
   pipeline = en våg, stor citeringsmagnet-vinst.
5. **E35 Kvalitetsaggregator** — kör-alla-37-svier + regenererat motorregister
   + CI-blockad vid RÖD (idag provtagning).
6. **E30 testa-b2b-grind-reparation** + B2B-aktiveringspaket färdigställande
   när jurist sveper.
7. **D22 Betalflöde** — blockerat på kundens 8 beslut (R2) men stommen +
   G2 gör implementeringen snabb därefter; KUNDENS HÄNDER: Stripe-identitet.

*Score-kriterier: tester (finns/körda/gröna), validering (kontrakt i kod),
felhantering (graceful/ärlighet), dokumentation (filhuvud-kontrakt). Läge
enligt prod-verifieringar i STYRELSE-ADMIN-MEGA.md våg 90-99 + ovanstående
körningar. — K1-subagenten, våg 101, 2026-09-11.*
