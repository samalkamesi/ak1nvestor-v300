# SYSTEMKARTAN — AK1A Research Lab (2026-09-11 · uppdaterad 2026-09-18)

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

## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 11 — E35 ÅTERDIFFAD: tmp-skyddet FULLT levererat i båda ändarna)

Fjärde E35-passningen (09-15 · 09-16 13:20 · 09-17 01:2x) — andra varvets
regel pekar hit igen: sedan omgång 10:s mätning levererade s8-vågen BÅDA
halvorna av tmp-skyddet (448365a9 s8-u2 vakt/grind ~04:42Z + 84a1841f
s8-u1 ROTKUR o44) mot det gap omgång 10 öppnade. Objektval mot duplikat
EFTER kollisionskontroll: auto-s9-manifestet (05:05Z) kör tre dokvågs-
syskon mot SAMMA kartfil — u1:tak = 1 system, E35 valt och commit sker
omedelbart efter redigeringen (clobber-kuren). Allt MÄTT i arbetsytan
2026-09-17 ~07:1x lokal (sex egna svitkörningar + full vaktkörning +
motorvalidering, curl loopback+HTTPS, ps, ls/grep, git log) — aldrig
worklog-läsning:

| Mått | Kartan (E35-diff omgång 10) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| tmp-gap (5) vakt/grind-halvan | STÄNGT av s8-u2 (påstått i kön) | **BEKRÄFTAT EGNA KÖRNINGAR**: tmp-stad.mjs ropas av pre-commit FÖRE tsc (hook rad 40 med \|\| echo-fallback — städarens fel låser aldrig commit-taket) + kvalitetsvaktens sektion 11 ropar den med transparent rad (kod mätt rad 57/927/934); svit 15/15 PASS egen körning |
| tmp-gap (5) rot-halvan | "pågår (s8-u1)" | **STÄNGD (o44, 84a1841f) + verifierad**: tsconfig exclude .tmp + tmp_*.ts (rad 42–43, mätt) · svitgenerering i .tmp/ · zonsoparen stada-tmp-ts.mjs (rot = u2:s tmp-stad, .tmp = u1:s) med svit 12/12 PASS egen körning · TREDJE läckvägen dokumenterad: process.exit inuti try mossar finally — morgonrondsviten läckte vid VARJE körning, ej bara vid SIGKILL (o44-protokoll rad 27–30, live-bevisat) |
| Falsklarmsrepetitionen | — | **GRÖN enligt protokoll** (planterad 01:19-läcka i rot → pre-commit självläker: TMP-STÄD + tsc, HOOK_EXIT=0) + EGEN repetitions­mätning: morgonrond 19/19 & demoklient 16/1 (G1 = känd demodata-brist, ej regression) körs — rot ren; ETT transientfönster på sekunder fångat (en tmp-fil syntes direkt efter demoklientens fail-väg, borta vid nästa ls = svitens fördröjda egenstädning; residualen bär städaren i grinden) |
| Vaktkörning | 11/11 GRÖN (23:22Z) | **11/11 PASS · FEL 0 · MANUELLA 0 · GRÖN — EGEN körning 05:09:35Z** (rapportfilen omskriven; tmp-städningen inbyggd i sektion 11) |
| Motorvalidering | 107/0/0 | **107 PASS / 0 FAIL / 0 SKIP (6,2 s, EGEN körning)** — validera-motorer städar nu sin EGEN tmp-fil (utfällande rad i svitutdata) |
| Testsviter | 69 | **74** (ls-mätt; +5 på ett dygn) — aggregator-gapet VÄXER |
| Prod + pulsvakt | grön (varv 330) | hem 200 loopback OCH HTTPS (egna sonder); pulsvakt lever:true · statiskStatus "gron" · varv 675 · PID 1207077 (ps + statusfil; senasteKoll 05:08:59Z färsk) |
| Motorregistret | fruset 09-03 | **fortfarande fruset** — efff399c 2026-09-03 (git-mätt; 14 dagar) |
| Vaktrapports-stopp (gap 3:sista halvan) | saknas | **fortfarande saknas, mätt**: 0 vaktrapport/kvalitetsrapport-träffar i prod-synk.mjs (deployvägen bär artefaktgrinden men inget RÖD-rapport-stopp) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E35 | LEVER 8 → **LEVER 9** | D20/E34-precedenserna: ett NAMNGIVET gap från föregående dokvåg är FULLT stängt mekaniskt i BÅDA ändarna — klassen som 2026-09-17 01:19 LÅSTE ALL commit och krävde manuella handgrepp är död i tre lager (.tmp/-generering + tsconfig-glob + signaturverifierad städare i grind OCH vakt), bevisat levande av TVÅ oberoende agenter (äkta läcka städad UNDER commiten; planterad repetition självläker HOOK_EXIT=0) och ÅTER verifierat egenhändigt här (15/15 + 12/12 + 19/19 + 16/1 + vaktkörning 11/11 GRÖN + 107/0/0). Kontroll 11 gör typbaslinjen daglig. Restgapen namnges: aggregatorn VÄXER (74 sviter = fortfarande provtagning), motorregistret fruset 14 dagar, vaktrapports-stoppet — inget av dem nådde konsumentytan och två av tre bär dokument-/processkaraktär. Kvalitetssystemets kärnuppdrag — hålla kvaliteten MEKANISK — bevisat i skarpt läge: hel incidentklass stängd på ett dygn |

Snittscore **7,5** (285 → **286** poäng / 38 system; E35 +1 vid denna dokvåg).

Kö till huvudagenten från fynden: (1) aggregatorn ("kör-alla-tester" med
PASS/FAIL-summa i RESULTAT_JSON-mönstret) — 74 sviter och växer, provtagnings-
glappet fördjupas per dag; (2) motorregistret 14 dagar fruset (efff399c) —
regenereras med testtäckningskolumner; (3) gap 3:s sista halva: vaktrapports-
stopp i deployvägen (RÖD kvalitetsrapport ⇒ deploy-stopp); (4) transient-
fönstret i demoklientens fail-städning kan stramas åt (omedelbar unlink) —
kosmetiskt, grinden fångar residualen.

## UPPDATERING 2026-09-17 (dokvåg s9-u2 omgång 8 — A3 + E37 återdiffade; andra varvet)

Tredje passningen för båda systemen (A3: u1:4 09-15 → u2 omgång 7 09-16 20:21 ·
E37: u2 09-15 → u2 omgång 7) — men andra varvets regel "börja där verkligheten
rört sig mest sedan senaste passningen" pekar hit igen: sedan 20:21 levererade
s6 SJU mentor-commits 23:58–06:01 (sex helt nya lager) och s7 tre
prestandavågor 06:17–06:22 (o37/o41/o42: prefetch-kur + natt-/morgonfacit).
Kollisionsbokföring: denna redigering blockerades EN gång av syskonet u1
omgång 11:s commit (E35 → LEVER 9, deras sektion läst och orörd ovan) —
omredigering direkt efter deras landning; A3+E37 är denna slots egna system
sedan omgång 7, inget syskonfönster öppet på dem. Varje rad MÄTT i arbetsytan
2026-09-17 ~07:0x lokal (30 svitkörningar med sanna exitkoder, node-läsning
av Lighthouse-/siffror-JSON, egen larvag-synk-körning, grep i kod, git log,
ls) — aldrig worklog-läsning:

| Mått | Kartan (omgång 7, 09-16 20:21) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Lagerkedjan (A3) | 18 lager (chat-widget.tsx:876) | **24 lager** (chat-widget.tsx:986, egen läsning): makro ?? extra ?? bas ?? nästa ?? kapitalmekanik ?? sektor ?? case ?? praktik ?? portfoljgrund ?? agande ?? redovisningsdjup ?? djup ?? historia ?? lonsamhetsdjup ?? tsdjup ?? skattedjup ?? beteendedjup ?? riskdjup ?? **riskmattsdjup ?? utdelningsdjup ?? forvantningsdjup ?? portfoljbalans ?? stabilitetsdjup ?? grahamgolv** (fetmarkerade = sex nya, committade fce83d6a…3367b5f8 23:58–06:01) |
| Frågemonster (A3) | 68 (25 bas + 43 i 17 filer) | **80** (id-räknat: basens MONSTER 25 i ai-mentor-svar.ts + 55 i 23 frågelager-filer — de nya lagrens +12 = 3+1+2+1+2+3) |
| Testsviter (A3) | 24 sviter / 598 kontroller (597/1) | **30 sviter / 781 kontroller: 780 PASS / 1 FAIL** (samtliga egna körningar: 29 sviter exit 0, däribland de sex nya — grahamgolv 30/0, forvantningsdjup 30/0, portfoljbalans 27/0, riskmattsdjup 27/0, stabilitetsdjup 27/0, utdelningsdjup 26/0 — + bassviten 25/1 + modellagret 38 kontroller gröna) |
| E01 registeräkthet (A3) | RÖD 358/375 (gap 17) | **RÖTARE 358/390 — gapet VUXIT 23→32** (egen körning: "inbakad=358 · byggd=390 — kör --baka"; ingen rebake-commit sedan b3b5e2c4 09-16 03:49 trots sju mentor-commits efteråt, git-mätt) — disciplinen bröts av morgonens sex leveranser |
| Dödkodsklassen (A3) | sektorlagret var död kod (c363ec8b) | **EJ UPPREPAD**: kedjeraden i widgeten bär alla 24 lager OCH varje nytt lager kom med egen grön svit (kedjesviten 55/0, egen körning) |
| /studio-EFTER (E37, omgång 7:s kö 2) | "obokförd" | **LANDAD**: studio-s7u2c-efter.json = **71 poäng · LCP 4 168 ms · TBT 577 · CLS 0** (node-mätt) — serien studio-fore 55/5 863/909 → o16-efter 63/5 027/638 → s7u2c 71/4 168/577: +16 poäng och LCP −1,7 s genom kedjan, app-ytans högsta mätta poäng |
| Hem-serien (E37) | o32-vila 54/4 972/984 | **nattfacit-0030: 66/4 150/844 · morgonfacit-0618: 60/4 832/902** (node-mätt ur OPTIMERING/lighthouse; CLS 0,0 i båda) — bästa hemmämätningen hittills är nattens 66, driftband 60–66 mellan natt och morgon |
| /kurser (E37) | o32-vila 55/5 429 | **53/5 325/1 636** — LCP bättre men TBT 1 636 ms är facitets värsta kärnmått (morgonfacit, node-mätt) |
| /blogg prefetch-kur (E37) | prefetch={false} i (huvud)-listan (o17) | **prefetch={false} i TRE språklistrar** ((huvud)/blogg/page.tsx:70+95 med o17/o37-precedens-kommentaren · (en) · (ar), grep-mätt) + mätbevis: före 52/5 498 → **efter3-solo 62/4 158** (LCP −1,3 s) |
| Sökindex (E37) | friskt 09-16 23:32 | **friskt 2026-09-17 05:52** (public/sok-index.json mtime) — synkat med morgonens 390-våg; cadansen förblir manuell disciplin (gapet kvarstår) |
| Footer-läsbarhet rond 2 (E37-kö) | bokad | **fortfarande obokförd** — ingen footer-commit sedan bokningen (git-mätt) |
| Röda auditer (E37) | unused-JS 74–79 KiB · bootup 3,3–3,5 s | **kvar i morgonfacitet**: unused-JS 93 KiB (poäng 0,5) · bootup 3,0 s (0) · mainthread 6,4 s (0) — tre nollor i JS-familjen |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A3 | LEVER 8 → **LEVER 8** | Testtäckningen växte 598→781 kontroller på ett dygn (30 sviter, 29 gröna, dödkodsklassen mekaniskt förhindrad) och kedjan 18→24 lager — men den ENDA röda kontrollen är själva kontraktbrottet: E01-gapet VUXIT 23→32 kurser (register-disciplinen bröts av morgonens sex leveranser, mätt). Kvantitativ växt utan ny kapabilitetsklass + fördjupat kontraktsgap = ingen poängrörelse (omgång 7:s egen precedent höll 8 vid 597/1 med samma logik) |
| E37 | LEVER 8 → **LEVER 8** | Tre nya prod-mätbelägg (studio 71 = app-ytans högsta, hem 66 i nattfacitet, blogg 62 efter prefetch-kuren i ×3 språklistrar) + köposten /studio-EFTER inlöst — men 0 egna regressionstester, tre röda JS-auditer och /kurser-TBT 1 636 ms kvar: kunskap tillförd, inga namngivna gap stängda (E33/B14-precedensen) |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg;
syskonets E35 +1 landade före denna sektion och är redan räknad i baslinjen).

Sidofixar (mätta, inga poängändringar): kursantalet 381 → **390** i A1/A2:s
ÖVERSIKT-rader + A1-detaljblockets mätkedja (siffror.json uppdaterad
2026-09-17, node-mätt: 390 kurser · 8 223 quiz oförändrat — s5:s morgonvåg
381→390; **larvag-synk EGEN körning GRÖN 390=390=390 · 0 fantomer · 21
profiler**, exit 0).

Kö till huvudagenten från fynden: (1) **registerrebake 358→390** — gapet
17→23→32 på tre mätningar och varje ny kursvåg utan --baka fördjupar det;
--baka bör bli obligatoriskt leveranssteg i s5/s6-fabriksprompterna
(b3b5e2c4-precedensen), annars bokförs det om igen av nästa dokvåg; (2)
**/kurser TBT 1 636 ms** = morgonfacitets värsta kärnmått — kurskortslistan
växer med registret (390), nästa prestandaronds förstahandsobjekt; (3) E37:s
gamla köer orörda: footer-läsbarhet rond 2, språkresolvens-produktbeslut a/b/c,
sökindex-hook i deploy.

## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 11 — B7 + B8 återdiffade; A3-korsvalidering; andra varvet)

Elfte u3-dokvågen, andra varvets åttonde omgång. Objektval mot duplikat med
TVÅ TRÄDSKIFT under mätningen (s10-u3-kuren): A3 var självklart tredjeobjekt
(mina mätningar 06:5x–07:2x hann FÖRE commit-upptäckten) men togs av syskonet
s9-u2 omgång 8 (223140e1 — deras A3-fynd identiska med mina, se
korsvalideringen), och E35 höjdes av s9-u1 omgång 11 (dad5bc94, 8→9 —
snittet 286 räknat av dem); deras sektioner orörda, A3 avstås här. B7 + B8
genomfördes som huvudobjekt — B7:s egen kö sade uttryckligen "B8-dokvåg
verifierar" (ensemble-kurens självläkning 2026-10-01). Allt MÄTT i arbetsytan
2026-09-17 ~06:5x–07:2x lokal (nio svitkörningar, motorvalidering, eget
full-svep mot localhost på samtliga 22 bibliotekssidor, live-sonder,
node-läsning av JSON/loggar, crontab-läsning, ls/grep/git log) — aldrig
worklog-läsning:

| Mått | Kartan (senaste passning) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| AKM2-sviterna (B7) | 156 kontroller gröna (09-16) | **156 GRÖNA igen, samtliga egna körningar** (kärna 25/25 · dynamik 55/55 · moduler 64/64 · snapshot 12/12 i ren env) + motorvalidering **107/0/0 (6,7 s, egen)** |
| snapshot env-läcka (B7) | 11/12 med ärvt env | **LEVER KVAR mätt**: 11/12 med ärvt env (kontroll 11 FAIL, egen körning), 12/12 i ren env — gapet orört |
| berika-pipelinen (B7) | stillastående sedan 09-04 (12 d) | **13 DAGAR** (git-mätt: 4b98cd15 senaste); 0 akm2-cacher på disk |
| data/cache (B7) | "endast 7 sporadiska on-demand-filer" (09-16) | **33 runtime-skrivna filer** (netnet 25 · analys 7, färskast analys-nyh 09-17 06:17 · vagfundament 1) — on-demand-skrivningarna LEVER; men akm1/akm2/akm3/fundamental fortfarande 0, självläkningen väntar på månads-cronen 2026-10-01 |
| AKM2-dashboard (B7) | 22/22 (09-16) | **22/22 BEKRÄFTAD** (eget full-svep, alla 22 sidor 200) — metodnotis: filnamnets sista `_` är `.` i URL:en; svep utan transform gav 12/22 + tio 404:or = mätartefakt, ej regression |
| ensemble-vyn (B8) | 0/22 | **0/22 KVAR** (samma svep — konsumentytan fortsatt tom) |
| AKM3-sviten (B8) | 55/55 (09-16) | **55/55 PASS exit 0 ×3 återmätningar** — MEN ett engångsfail i första körningen (dokvågens egna två bash-block körde node parallellt: stacktrace + avslutskod 1, ej reproducerbar i 3 isolerade körningar) — instabilitetsnotis, ej kontraktsbrott; 0 tmp-läckor i roten (s8-u2:s självläkning verifierad) |
| kalibrering-loggen (B8) | 1 rad (09-04, ΔΦ=0) | **fortfarande 1 rad** (node-mätt) |
| regime-loggen (B8) | 1 genesis-rad (09-03) | **fortfarande 1 rad**; /api/forskningslage live-sondad bär EXAKT genesis-talen (7 gröna/100 · 17 röda · "magert") — regimen frusen i 14 dagar, åldern osynlig för eleven |
| Contabo-cron (B8 gap 4) | akm3-kalibrering + vagvalidering saknas | **fortfarande saknas** (användar-crontab + /etc/crontab grep-mätta: 0 träffar); vercel.json: kalibrering `20 5 2 * *` = nästa molnrond **2026-10-02**, vagvalidering 05:30 UTC daglig |
| vagvalideringsrapporten (B8/B9-gräns) | 12 d (B9-not 09-16) | **13 dagar** (mtime 09-10 16:33) — Vercel-fs kan inte förnya Contabo-filen; speglingsgapet lever |
| A3 (KORSVALIDERING) | syskonets omgång 8: 24 lager/80 monsters/E01 358/390 | **bekräftat EXAKT med oberoende mätningar FÖRE deras commit-upptäckt**: kedjan 24 lager (chat-widget.tsx:986 egenhändigt läst), 80 monsters (id-räknat: basen 25 + 55 i 23 frågelager-filer), bas **25 PASS · 1 FAIL** (endast E01) + de fem nyaste lagren ALLA GRÖNA (grahamgolv 30/0 · förväntningsdjup 30/0 · portföljbalans 27/0 · stabilitetsdjup 27/0 · riskmåttsdjup 27/0 = 141/0), E01 RÖD **inbakad 358 · byggd 390** (siffror.json 390, uppdaterad 09-17; gapet 17 → 23 → 32 kurser), larvag-synk GRÖN 390=390=390 · 0 fantomer (ts 07:12) — eftersläpningen specifik för mentorns --baka-steg; deras sektion lämnas helt åt dem |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B7 | LEVER 8 → **LEVER 8** | Lägesbekräftelse med egna mätbevis (156 kontroller + 107/0/0 + 22/22-livlinan) och två preciserade mått (cache-delåterfyllningen 33 runtime-filer — netnet/analys lever medan datacache-typerna står på 0; metodnotisen URL-transform). Berika fortfarande stillastående 13 dagar, env-läckan orörd: inga gap stängda eller öppnade — ingen poängrörelse (E33/B14-precedensen) |
| B8 | PÅGÅR 7 → **PÅGÅR 7** | Driftbilden oförändrat frusen (1+1 loggrad, regimen genesis-tal live i 14 dagar, ensemble 0/22, Contabo-cron fortfarande saknas) men sviten grön ×3 + instabilitetsnotis (engångsfail vid parallellkörning) + molnrondens datum preciserat (2026-10-02): kunskap tillförd, inga gap stängda — ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad av denna dokvåg; u1
omgång 11:s E35 +1 och u2 omgång 8:s A3/E37-passningar landade under fönstret
och är räknade i deras sektioner).

Kö till huvudagenten från fynden: (1) **B8:s tidsfönster**: nästa molnrond
2026-10-02 — sker inte Contabo-speglingen (akm3-kalibrering + vagvalidering)
före dess växer kalibreringskedjan + regimen endast i molnet och prod-diskens
loggar står stilla ytterligare en månad (samma speglingsfamilj som B9/D25
bokfört); (2) **registerrebaken 358→390** (u2 omgång 8:s kö upprepas med
tyngd: gapet fördjupades 17→23→32 på två dygn; larvag-synkens samtidiga
390-grönhet visar att kedjan KAN hänga med — --baka som obligatoriskt steg i
s5/s6-prompterna); (3) AKM3-svitens engångsfail utreds (parallellköarnings-
känslighet — fast tmp-namn? samma klass som s8:s tmp-fynd men med
självläkning intakt); (4) berika-cadansen (B7:s gamla kö lever oförändrat);
(5) metodnotisen för framtida bibliotekssvep: URL-transform sista `_` →
`.` (annars 10/22 falska 404:or — denna dokvågs eget misstag, dokumenterat).

## UPPDATERING 2026-09-17 (dokvåg s9-u2 omgång 9 — D22 + D23 diffade mot verkligheten; R2-ytorna)

De två system som lämnats sist i varje diff-cykel (u3 omgång 7 bokförde
"D22/D23 väntar kund-R2") är nu mätta — READ-ONLY: inget pris ändrat, ingen
flagga satt, inga .env-värden lästa (endast namn-närvaro, B14-precedensen).
R2:vårt gäller ÄNDRINGAR (priser/tier/aktivering), inte inventering — K1:s
inventering dokumenterade dessa system från första början på samma sätt.
Därmed har ALLA 38 system diffats minst en gång: den fullständiga cykeln
inkluderar R2-ytorna.

**D22 BETALNING & PRENUMERATIONSSTOMME — kartans ryggrad HÅLLER, tre nyanser:**

| Mått | Kartan 2026-09-11 | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Stommen | prenumeration.ts 202 r + 4 komponenter + (huvud)+speglar | OFÖRÄNDRAD: 202 r; aktivera-panel/niva-kort/prenum-cta/rabatt-band orörda sedan 09-10 (senaste rörande commit f3448b0f, våg 77); 6 ytor på disk: (huvud) + (en) + (ar) × {prenumeration, medlemskap} |
| "Ingen betalmotor: ingen Stripe/annan PSP-kod i src/" | påstående | BEKRÄFTAT med nyans: PSP-namnen finns ENDAST som R2-veto-ordlista i styrelsemotorn (styrelse.ts:123–127: stripe/kortbetalning/swish/klarna/paypal/checkout/fakturering…) + substring-falskar i analysskiktet ("trösklarna", "nycklarna") — noll implementering; /api/webhook bär fortfarande ENDAST vbt-routen |
| "Aktiveringsintention i localStorage + e-postnotis till admin" | så skrev kartan | MOTBEVISAD I FORMEN — leden är STARKARE: aktivera-panelen postar ALLTID ett anonymiserat A4-event till POST /api/konvertering/intention (94 r: system_events type=konvertering_intention severity=info, in-memory rate-limit 10/min, fälttak 60 tecken, nyhetsbrevscheck → befintligt /api/email-flöde); "admin-notisen" är en ADMIN-VY (/api/admin/konvertering, 368 r, 401 utan lösenord — AC5) över system_events, INTE ett brev; email-mallar.ts (274 r) bär morgonMejl/veckoRapport/fas2Nudge — ingen intentionsmall (brev-leverantören ändå okonfigurerad, D25-mätningen) |
| Prod-ytor | ej mätt | /prenumeration + /medlemskap = 500 på loopback — men det är det KÄNDA GLOBALA SSR-driftfelet (mätt samma sekund: / svarar 200, /kurser 500, chunk-fel i pm2-errorloggen; o47:s bokföring), inte D22-fel; ytkoden byggd + speglar på disk |
| Prisregistret | FAS 2 9 999 kr, FAS 3 13 999 kr | + detaljer ur priser.json: årspriserna 2 490/4 490/7 990 kr samt fas3IntroManad 299 kr/mån exkl. moms det första året (B2-beslutet) |

GAP D22: (1) PSP-blockerat på kundens 8 L4-beslut — kvarstår; (2) transaktionspris
MÅSTE läsas ur samma lager vid köp — kvarstår (kontrakt kodat); (3) ångerrätts-
flödet (2005:59 2 kap 10–11 §§) endast text — kvarstår; **NYTT (4)**:
intentionerna landar i system_events — tabellen vars prod-tömning E33 bokfört
(FLAGGA) — intentionerna delar den förlustkänsligheten tills E33 läker
(korsnotis). 0 egna testsviter (mätt: inga testa-*prenum*/betal*/pris*).

**D23 PRISSTEGEN — grinden nu MÄTT I PROD (starkare bevis än vid K1):**

| Mått | Kartan 2026-09-11 | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Sidorna | byggda klara, 404-grind | 3 sidor på disk (61+64+61 r; senaste rörande commit 2a566cfd, våg 99 — orörda sedan); notFound()-grind i page.tsx; 404-grenen osonderbar just nu (SSR-driftfelet svarar 500 på allt dynamiskt) |
| Flagga | NEXT_PUBLIC_TIER_AKTIV=1 aktiverar | namnet finns i INGEN .env-fil (mätt: grep -l på namnet = tomt; värden aldrig lästa) ⇒ fortfarande AV, väntar kundens prisbeslut |
| Gating | robots + sitemap läser samma flagga | **MÄTT I PROD**: robots.txt = 0 portfolj-rader, sitemap.xml = 0 tier-URL:er (båda serverade OK trots driftfelet) ⇒ tierAktiv()=false bevisad i KÖRANDE instans |
| Priskälla | "alla pristal ur lasPriserGallande() — ingen hårdkodad siffra" | PRECISERAD två-lager (tier-sida.tsx:157–161): strukturen ur priser.json via lasPriser() + pristalen live via lasPriserGallande() (Supabase-override senaste-vinner, filen = fallback); CTA = mailto:info@ak1nvestor.com + Fas-ansökan (mänsklig aktivering, ingen motor krävs) |
| Speglar | en/ar för tier-sidorna saknas | BEKRÄFTAT mätt: find i (en)/(ar) efter portfolj-* = tomt |

GAP D23: (1) kundens slutliga priser (R2) — kvarstår; (2) speglar en/ar —
kvarstår (mätt); (3) tier-CTA mot betalflödet (D22) — kvarstår; notiser:
0 egna testsviter (mätt) + aktiveringsproceduren bär BYGGKRAV — NEXT_PUBLIC_*
inlineras vid bygge, så env-sättning vid nästa ombyggnad är den säkra vägen
(tier-status.ts:s egen dokumentation: ISR-fönstret räcker i andra hand).

Poäng: D22 5 och D23 7 OFÖRÄNDRADE — R2-lägena rördes inte; starkare stomme
(D22) och bättre grindbevis (D23) motiverar ingen rörelse. Sidofixar:
E32 + C15 sektionsstämplar 09-15 → 09-17 (manifest-körningen 2/3 ovan diffade
dem 2026-09-17 men lämnade stämpeln).

## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 12 — E26 Admin-panelen återdiffad; andra varvet)

| Yta | Kartan sa (09-15) | Verkligheten MÄTT 2026-09-17 (~14:0x lokal) |
|---|---|---|
| Audit-loggen (E26) | 68 677 byte aktiv | **258 969 byte / 1 008 rader** (3,8×) — 301 unika aktörer; åtgärder: 357 uppgift_start · 334 uppgift_klar · 162 modellkatalog-synk · 143 deploy · 8 komprimering_tier3 · 1 fabrikskirurgi · 1 beslut · 1 deploy_revert · 1 g2-fullbordande; span 09-14 23:19:59Z → LEVANDE (sista raden = fabriksbarns start 11:55:28Z idag) — mega-beslut spår 2 är fabrikens FAKTISKA driftlogg |
| Admin-sessionssviten (E26) | 14/14 (mätt 09-15) | **14/14 KÖRD GRÖN igen** (egen körning: rollmatris, v79-500-gren, ekar-aldrig-lösenordet) |
| Admin-API-rutter (E26) | 24 rutter | **25 route.ts** — räknekorrigering: git diff-filter=A sedan 09-15 = 0 nya ruttfiler (09-15-notisens 24 var räkneavvikelse, ej tillväxt) |
| requireAdmin i prod (E26) | antaget | **MÄTT LIVE**: /api/admin/variabler utan auth ⇒ 401 · /api/studio/godkannande utan auth ⇒ 401; /admin-sidans 500 ÄR o47-driftfelet (samma sekund: /kurser + /blogg 500, / 200 — SSR-klassen, ej admin-specifikt; API-lagret oskadat) |
| Juridikgrind-vakten (E26 gap 5) | GUL 0 FEL / 8 FP-VARNINGAR | **GUL 0 FEL / 17 VARNINGAR** (larmfilens senaste körning 11:37:28Z idag) — FP-kön FÖRDUBBLAD på 2 dygn; FLYTTKLAR-strängen nu i **63** utkastfiler (21 vid 09-15-mätningen) = granskningskön växer rakt in i vakten |
| Godkännandeval-filen (E26 gap 6) | saknas (R2-knappen orörd) | **FINNS FORTFARANDE EJ** — kundens publiceringsknapp förblir orörd; flödet kodbevisat, ej körbevisat |
| Övriga ytor (E26) | — | paneler 16 oförändrade · admin-auth.ts 245 r oförändrad · audit-logg.ts 130 r · sessionStorage-rester lever (77 träffar x-admin-password i src/) · rate-limit 8 av 25 rutter · IP-block 0 träffar · GDPR-DATAKARTA.md lever (24 026 B, mtime 09-15) |

| E26 | LEVER 8 → **LEVER 8** | Preciseringsdokvåg utan poängrörelse (E33/B14-precedensen): styrkorna bekräftade med färska egna mått (audit 3,8× aktivare, sviten grön, vakten 401 live) men juridik-FP-kön fördubblad (8→17) + FLYTTKLAR 21→63 gör gap 5 BRITTARE — vakten drunknar gradvis i granskningsköns meta-texter; publicera-E2E förblir kundens (R2). Kö till huvudagenten: juridikgrindens citat-vs-råd-kur hastas (63 väntande filer), IP-block förblir öppet |

## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 12 — A1 + C17 + C18 återdiffade; tredje varvet + AKUT DRIFTFYND: prod SSR-ytor 500)

Val (anspråk FÖRE byggstart, data/vakten/auto-s9-1789646128050-u3-ansprak.md):
spårets mogenhet-regel — diffade 2026-09-15 i första varvet, ALDRIG
återdiffade, rankade på störst rörelse: A1 (kurser 352→396 sedan dess), C17
(kvartalskön 22→28→40 + guldkällans två vågor), C18 (prod-incidenten + döda
länkar-återmätningen). Syskonrace: u2 omgång 9 (D22+D23) landade under
fönstret — deras sektion orörd (s10-u3-kuren); u1:s logg tom vid anspråk.
Allt MÄTT i arbetsytan (node-läsning av guldkällor, egna svitkörningar med
SANN exitkod, curl-sonder localhost + https, pm2-loggen, prod-synk.loggen,
fuser-grind mot deployfönster enligt o47 §2) — aldrig worklog-läsning.

A1 LEVER 8 kvar: 396 kurser bevisat tre vägar (siffror.json 09-17 ·
deep-courses 396 nycklar · larvag-synk EGEN GRÖN 396=396=396, 21 profiler,
0 fantomer, exit 0); quiz 8 223 / XP 82 230 / fas 18+24 oförändrade;
bokmaster-diskrepans 105 filer på disk mot 103 i siffror (kosmetik, köpost);
gap 1 oförändrad (kurs-access-svit 0 träffar). C17 LEVER 9 kvar: kvartalskön
40 filer (30 paket + 10 kalendrar) mot H3 = 0 src-filer; gap 0 BEKRÄFTAD
(aspektsviten dör OFÅNGAT på './ordlista'-importbro, identiskt 09-15); v98
GRÖN 0 träffar (153+153 × 3 utdatafiler). C18 LEVER 9 kvar: sitemap 2 239 ·
sok-index färskt 396 (09-17 11:39) · llms×2 + robots 200 · OG-kopling 0
träffar kvar · schemasviten UNDERKÄNT sann exit 1 = 100 % driftfel (500).

DRIFTFYND (AKUT, bokförd i alla tre sektionerna): prod-SSR-ytor 500
(/kurser /analyser /blogg /labb /dataset × båda nivåerna; localhost OCH
https, egna sonder 12:0xZ) medan statiskt / 200. ROT: ChunkLoadError —
server/chunks/ssr/_1tjfn0y._.js SAKNAS på disk (pm2-loggen 12:00Z);
kedjan: patch-kön (next@16.3.5) föll 11:39Z "bygg misslyckades utan ny
kod … (revert hoppas: koden är deployad sedan tidigare)" = o47:s felgren
ÅTER — .next lämnades halvtrasigt och pm2 startad 11:39 kör döda
chunk-referenser; LÄKNINGEN BLOCKERAD: prod-synken 11:57Z VÄNTAR-RAM
872<2200 MB medan agentfabriken (3 barn/omgång) håller minnet — prod
trasig tills RAM frigörs och synkens bygge landar. PARADOX-köpost: en
grön vakthelkörning rapporterades 11:50:11Z (o48:s bevisrad) medan
/kurser var 500 vid 12:00 — gränsnittsvaktens SSR-500-detektering ses
över. r58-kuren ("OMBYGG på god lock när patchbygget faller utan ny
kod") greppte ej i 11:39-fallet — verkade eller täckte ej patch-grenen.

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A1 | LEVER 8 → **LEVER 8** | Talen 352→396 (tre oberoende källor + synk GRÖN egen) men inga gap stängda/öppnade i koden; /kurser-500 är drift (chunk-roten), ej systemgap — ingen poängrörelse (E33/B14-precedensen) |
| C17 | LEVER 9 → **LEVER 9** | Lägesbekräftelse: v98 GRÖN, kö 28→40, gap 0+1 oförändrade; /dataset-500 = drift — ingen poängrörelse |
| C18 | LEVER 9 → **LEVER 9** | Sitemap 2 239 + sok-index färskt = kunskap tillförd; svitens UNDERKÄNT = drift (500), ingen kodförändring; gap 2+3 kvar — ingen poängrörelse |

Snittscore **7,5** (286 poäng / 38 system — oförändrad; tre
preciseringsdokvågor, syskonens ev. poängrörelser räknas i deras sektioner).

Kö till huvudagenten: (1) **AKUT**: prod-SSR 500 — påskynda prod-synkens
RAM-fönster (fabriksmellanrum) så läkningsbygget landar; (2) o47:s
felgren "revert hoppas vid fall utan ny kod" fortfarande levande i
patch-köfallet trots r58 — rotorsaka igen med 11:39Z-loggen som bevis;
(3) gränsnittsvaktens SSR-500-detektering (grön 11:50Z mot röd verklighet
12:00Z); (4) C17 gap 0: importbro './ordlista' (v82-mönstret); (5)
siffrorns bokmaster 103 vs diskens 105 i nästa rakna-siffror-rebake.

## UPPDATERING 2026-09-17 (dokvåg s9-u3 omgång 13 — A2 + E31 + B13 återdiffade; störst rörelse sedan passning + SSR-läkningen bokförd)

Objektval enligt varv-regeln "störst verklighetsrörelse sedan senaste
passning": A2 (17 src-commits på larvag-karta.ts sedan 09-16 — hela
s5-spårets lärvägsdjup låg EFTER passningen), E31 (kartans äldsta stämpel
09-15 + D23:s ointegrerade speglar-fakta), B13 (31 loggträffar;
bolagsunivers 14 commits). Allt EGENMÄTT i arbetsytan 09-17 (egna
svitkörningar med sanna exitkoder, node-läsning av JSON, find/grep,
loopback-curl, git log) — aldrig worklog. DRIFTFYND: förra omgångens AKUTA
SSR-500 (/kurser /analyser /blogg) är LÄKT — /kurser 200 · /blogg 200 ·
/laroplan 200 · /api/larvag 200 (egna loopback-sonder): prod-synkens
RAM-blockerade bygge landade; omgång 12:s kö 1 kan avbokas.

| System | Före (passning) | Nu (mätt 09-17) | Domkraft |
|---|---|---|---|
| A2 | 352 kurser, synk GRÖN (09-16) | 396 kurser; synk EGEN GRÖN 396=396=396 · 21 profiler · 0 fantomer; karta 435 r (konstant 396); larvag.ts 458 r orörd sedan v99; 16 frontb-sonder; /laroplan 200 | E01-rebasten stängde registergapet; gap 1 (regressionssvit) + gap 3 (E2E) lever |
| E31 | MÖS 107/0/0 (09-15); kön 320; speglar omätta | MÖS EGEN 107/0/0 (7,2 s, tredje gröna); ordlista 2 154→2 745 r; kön 320 oförändrad; termbankstillägg 0 poster; 18+18 speglar; tier-speglar preciserade (prenumeration/medlemskap FINNS, portfölj-ytorna SAKNAS); I1 0 artefakter | rapportnamn fast 2026-09-02 (vilseledande); D23-korsnotis integrerad |
| B13 | univers 120; sviter 32/0 + 50/0 (09-16) | univers 153 (+33); sviter EGEN 32/0 + 50/0 exit 0; korstabell-grund frusen 09-10 (100 r) = 53 bolag efter; member/portfolio fortfarande vaktlös; cron dubbel-driven, 0 cacher (nästa rond 10-01) | glidningen fördjupad; A3-korsnotis (portfoljgrund/balans-lagren) |

Poäng: A2 LEVER 7 · E31 PÅGÅR (I1) 7 · B13 LEVER 8 — OFÖRÄNDADE
(preciseringsdokvågor, E33/B14-precedensen). Snitt 7,5 / 286 / 38
oförändrat. Sidofixar: A1/A2-tabellradernas kurstal 390→396 (föråldrat av
9e3bbf76:s rebake; samma sidofix-klass som 223140e1:s 381→390).

Kö: (1) korstabell-cadansen (rop eller auto vid universumsväxt — 53 bolag
väntar); (2) regressionssvit för raknaLarvag (16 frontb-sonder att hämta
mönster ur); (3) motorvalideringsrapportens datumstämpel; (4)
member/portfolio-sessionsvakt (B13 gap 3); (5) I1-audit (E31:s eget mål).

## UPPDATERING 2026-09-17 (dokvåg s9-u2 omgång 10 — B9 + A4 återdiffade; andra varvet + mätblindhet under planerat patch-bygge)

Objektval enligt varv-2-regeln "störst verklighetsrörelse sedan senaste
passning" mot kollisionskontroll (senaste kart-commits c70adaab · 93f43878 ·
4fd4242e; arbetsytan ren vid anspråk, data/vakten/auto-s9-u2-ansprak-omg10.md):
B9 och A4 — aldrig återdiffade sedan 09-16, båda med dagligen rörlig
verklighet (B8-korsnotisen i 8b90113d "B9-gränsfyndet åldras vidare").
DRIFTFÖRHÅLLANDE FÖR MÄTNINGEN: prod ligger i PLANERAT patch-byggfönster —
prod-synk.logg 18:37Z "PATCH-KÖ aktiv: next@16.3.5" + pm2 stoppad medvetet
enligt o48/r58-kuren + .next under ombyggnad (BUILD_ID saknas, lock satt;
återstart garanteras av main():s finally) ⇒ alla live-sonder (loopback +
HTTPS) svarade 502/connection refused i fönstret — dokvågen äger ej
läkningen och lämnar den åt synken; fil-, kod-, cron-, arkiv- och
svitmätningar opåverkade.

| System | Före (passning 09-16) | Nu (mätt 09-17) | Domkraft |
|---|---|---|---|
| B9 | "Contabo-crontaben saknar vagscan" (u3 omg 4); skans 09-15 05:05:22Z; svit 57/57 | KARTFEL RÄTTAT: /etc/crontab rad 24 (fil-mtime 09-08) kör vagscan 06:30 lokal DAGLIGEN + vercel 05:00Z = dubbel drivning på pappret — MEN arkivbeviset visar att Contabo-körningen FALLERAR TYST: system-events-full-2026-09-16.json.gz (export 05:24Z) bär ENDA vagscan-raden 05:05:24Z "206 impulsvågor, 90 korrigeringar (12/12)" = Vercel-minuten (i linje med 09-15:s 05:05:22), Contabo-fönstret 04:30Z lämnade 0 spår, koden skriver skans-raden utan daglig dedupe (två lyckade körningar = två rader) och curl:as till /dev/null 2>&1 = rotobevisbarhet inbyggd; vagvalidering fortfarande OSPEGELAD på Contabo (båda crontab-källor mätta); SENASTE-rapporten domar 09-04 (13 dagar), mtime 09-10 oförändrad; svit EGEN 57/57 exit 0; universum fast 12 | gap 4 skärpt: "raden saknas" → "raden finns men tyst fallerande (okörbevisad)"; kontinuiteten bevisad till 09-16 |
| A4 | determinism prod-bevisad 09-16 (SHB-B.ST dubbelanrop); 0 sviter | Rotationsalgoritmen OBEROENDE verifierad OFFLINE: FNV-1a (salt 1) ombereknad ur route.ts ger 2026-09-16 → ROTATION[4] = SHB-B.ST = EXAKT passningens prod-bevis ⇒ algoritm + sanning bevisad utan nät; 09-17 → ROTATION[3] = SAND.ST (rotationens nya väntade värde); NY KOPPLING: ROTATION = samma 12-bolags AKM1-universum som vagscan-cronen (dagens-pass tränar i B9:s skannade universum); alla 8 nyckelfiler orörda sedan 09-16 (git log); gap 1 lever: 0 sviter (lasStreak member-local.ts:69 orörd, inga testa-{streak,dagens,veckoplan,briefing}-verktyg); /dagens-pass ej sonderbar (byggfönstret) | determinismen nu DUBBELBEVISAD (prod + offline); gap 1 orört |

Poäng: B9 LEVER 8 · A4 LEVER 7 — OFÖRÄNDADE (preciseringsdokvågor,
E33/B14-precedensen: kartfel rättat + gap skärpt, inget stängt).
Snitt 7,5 / 286 / 38 oförändrat.

Kö: (1) Contabo-vagscan-cronens TYSTA FALLERANDE — körbevis/loggning
(pumpor-kanalen loggar; curl >/dev/null gör det inte) eller kvitto-rad i
system_events; (2) vagvalidering fortfarande ospeglad på Contabo — samma
kedjekrav som B8:s (annars frusna prod-loggar till molnronden 2026-10-02);
(3) SENASTE-rapportens förnyelse (kvarstående); (4) A4 streak/XP-svit
(lasStreak är ren funktion — lätt första svit).


## UPPDATERING 2026-09-17 (dokvåg s9-u3 3/3 — E33 + E34 + C16 diffade mot verkligheten; "prod-tömningen" MOTBEVISAD)

Objektval mot duplikat: inget av dagens (09-17) passningar rört E33 (senast
09-16 u1 omgång 9, FLAGGA med öppna femstegskö) · E34 (senast 09-16 u3
omgång 9 — sedan dess 19 DR-protokoll + nattens obevakade nattkedja + kvällens
patch-kedja) · C16 (senast 09-16 u3 omgång 9 — sedan dess +51 köfiler/dygn +
sammanställning förnyad + tre kontrollgranskningar). Syskonen u1/u2 i samma
manifest (auto-s9-1789670129370) kör parallellt mot samma fil — E29:s
dokvågslås-gap är levande (u2:s omgång 10 landade 7e124f59 under detta fönster
och respekterades); vedertagen återkörs-precedens gäller vid clobber. Varje
rad MÄTT i arbetsytan 2026-09-17 ~20:3x–20:5x lokal (zcat/git/ls/grep/
loopback-curl + DR-protokollens artefakter — aldrig worklog):

| Mått | Kartan (senaste passning) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Prod-tabellen system_events (E33) | "TOM sedan 13:46 09-16; arkivet = enda kopian" | **LEVER med 163 039 rader** (zcat 09-17-arkivet: antal 163039 · sidor 33 · truncerad false · total-kontrakt 163039/163039 enligt jungfrunatt-protokollet). Äkthetsdiff 09-16 07:24 → 09-17 02:40 = +1 361 rader/19 h 16 min = KONTINUERLIG äkta trafik — en tom tabell hade gett ~hundratal rader, inte 163 039, och ingen återimport är bokförd. ROT: tväprojektfyndet (DR-KEDJA6-2026-09-16): pg_dump-lästa rkaq-projektet SAKNAR system_events helt, arkivet (backup-fran-molnet) läser aufr = appens projekt — 13:46-mätningen föll i fällan; "tömningen" var ett mättillstånd i fel projekt, ej dataförlust |
| Arkiv-cadensen (E33 kö-steg 5) | "ojämn; morgondagens arkiv avgör om kedjan lever" | **STÄNGD**: system-events-full-2026-09-17.json.gz (27 542 167 B) född av cron 02:40 — logg född 02:40:01, hela körningen ≈ 37 s, INGEN agent aktiv (jungfrunatt-beviset), v3-trunceringsvakten GRÖN sin första obevakade natt |
| Dublett-id (E33 blockerare) | "4 st dödar PK-återimporten" | **0 dublett-id i 09-17-arkivet** (jungrunatt-protokollets mätning mot 09-16:s 4) — dedupe-blockeraren försvagad för framtida arkiv (v3-repetitionsskydd, hypotes ej bevisat) |
| ALTER v2 (E33 kö-steg 1) | "förlorad i clobber; disk bär V1" | **FORTFARANDE V1 i disk OCH HEAD** (mätt: git log --follow = enda commiten 2a55da6e 09-05; rad 30 bär syntaxfelet IF NOT EXISTS CONCURRENTLY … (type, + headerns "enkla index"-påstående förblir falskt) — v2 lever endast i DR-INDEX-PROV-2026-09-16-2.md:33-34 |
| Dedupe + schema (E33 kö-steg 3-4) | "dedupe-läge saknas; type 4 st" | **OFÖRÄNDRADE** (mätt: enda ignore-duplicates-träffen = plan-notis rad 205 i aterstall-system-events.mjs; scripts/supabase-schema.sql type TEXT rad 58/194/221/260); inventory 25 dagar (generatedAt 2026-08-23) |
| Natt-backupkedjan (E34) | "cron mätt strukturellt 09-16" | **OBEVAKAD GRÖN**: blad 7 db-2026-09-17.sql.gz fött 02:30:29 (31 733 199 B) + moln-JSON 02:40 — ingen agent i kedjan; retention lever (7 blad 09-11→09-17 på disk; crontab mätt: 4 rader oförändrade) |
| DR-övningar (E34) | "kvartalsövat; nästa senast 2026-12-15" | **19 protokoll IDAG** (ls DR-*2026-09-17*.md): FÖDELSEBEVIS-konceptet (N=0-bladet restore-bevisat 2× oberoende med identiska radtal — race ärligt bokfört) · NATT-RPO första nattdiffen (+19 767 rader oskyddade/23,3 h; 3/60 tabeller bär skulden; natt 34 r/h) · morgon- + eftermiddags-RPO (dubbel punkt, "två klockor") · MIDDAGS-DR = kedja 4 per-typ-vyor första gången (36,0 s) · KEDJA7 BOARD-RECEPT (board_decisions FK-paus/tabellswap) · KIRURGIÖVNING i total-mallen |
| Nya instrument + kur (E34) | — | **dr-rpo-diff.mjs** (per-tabell RPO-skuld, JSON-utdata) + KUR av falsk RÖT-dom på sunt blad: relativ väg → markörkoll 0 kB → resolverad mot dumpkatalogen, beteendeprov GRÖN RTO 14,1 s (protokoll AUTO-3/4/5 = RÖT-bevis/GRÖN/beteendeprov) |
| Patch-kön (E34, s8-kvällen) | ej i kartan | **MEKANISERAD + REAKTIVERAD**: package.json next ^16.3.5 låst · kvittoarkiv patch-kvitton-arkiv-2026-09-17T18Z.jsonl (+ .backup-o49) · patch-byggfel/ TOM (0 nya byggfel sedan kurerna) · prod-synk bär pm2-vakt + artefakt-manifest (KRITISKA_FILER) · DRIFTSBOKEN 2 nya sektioner (17:42Z 502-klassen; 18:5x-19:4x patch-/grindvakt). Korsnotis u2 omgång 10: prod 502 under planerat patch-fönster 18:37Z — min sond EFTER: se raden längst ned |
| ISR-varmarens täckning (E34 gap 3) | 12/44 | **12/44 FEM nätter i rad** (loggen 09-13→09-17 kl 03:10-03:11) — körningen lever, täckningen står fast |
| Migreringsguiden (E34) | saknas i kartan | **data/infra/MIGRERING-NY-DATOR.md** (huvudagenten 09-16): kvickstart 3 steg + ALLA inloggningsuppgifter — SÄKERHETSFYND: bär studions lösenord i KLARTEXT i repot (pre-commit täcker .env/pem/key — inte .md; repot speglas mot GitHub av arbetsstationen) — gap bokförs, filen orörd (huvudagentens yta, R2-känslig) |
| Prod-sond (E34) | — | **200 på 0,04 s** (egen loopback-curl, ~20:4x — EFTER u2:s 502-patchfönster: pm2-återstarten landade, läkningen bekräftad) |
| Granskningskön (C16) | 124 filer (09-16) | **175 filer** (+51/dygn, find-mätt): rot 48 · m9-ko 7 · granskning 77 · kvartal 43; data/blogg/ 55 publicerade oförändrade (publicering = kundens klick, R2) |
| Kundens kö-vy (C16) | "sammanställningen åldras (09-14-vyn)" | **FÖRNYAD 16:58 IDAG** (GRANSKNINGSKO-SAMMANSTALLNING.md, 99 474 B) — gap stängt |
| Granskningsmotorn (C16) | "utkast kopplas till knappflödet" | **OBEROENDE KONTROLLGRANSKNING i högvarv** (s1-spåret, 3 st idag): substansrabatt (#2) + rörelsekapital (#3) + B6-industriaktier — maskinella sifferkontroller mot git-återkallat bolagsuniversum, juridikgrind 0 fynd, diff-JSON-paket (gammalt/nytt-kontrakt), anspråksfiler för syskonkoordinering, §8-systemfyndet (BlogPost-familjen ~ord/200 vs SEO-GUIDER ≤2-min — fel släkts kontrakt påvisat och dom rättad) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E33 | FLAGGA 7 → **LEVER 8** | FLAGGA-motivet (tom prod) är MOTBEVISAT av arkivkedjan (163 039 rader kontinuerligt; mätning ovan) — inget dataförlustläge föreligger i appens projekt och återimport-kön kan AVBOKAS (fel projekt mättes). Samtidigt: arkivcadensen obevakat grön, 0 dublett-id, kedjan bär total-kontrakt. Kvar: V1-faran på disk (aktuell fil = dubbeltrappan), composite-indexet ej installerat, schema-driften, inventory 25 d — därför 8, ej högre (tillbaka till nivån före den felaktiga sänkningen) |
| E34 | LEVER 9 → **LEVER 9** | Redan toppreviderad (omgång 9); passningen tillför instrumentdjup (RPO per tabell, födelsebevis, obevakad nattkedja) och patch-kön som mekaniserat väntar-läge — inget nytt rot-gap stängt, inget öppnat: ISR 12/44 lever kvar, migreringsfilens klartext-lösenord är NYTT gap (säkerhetsklass), prod-bygget av 16.3.5 inte landat vid mätningen |
| C16 | LEVER 8 → **LEVER 8** | Sammanställningen förnyad + granskningsmotorn bevisad i högvarv (3 kontroller/dygn med maskinella paket) — men publiceringsuttaget står still (55 frysta, kundens klick = R2) och kön växer +51/dygn; B13-precedensen: ingen score-rörelse utan E2E-publiceringsbevis. Flaskhalsen är FÖRFLYTTAD från granskning till publiceringsbeslut |

Snittscore **7,55** (tabellsumma **287** / 38 system; u3:s dokvåg flyttade E33 +1 OCH E34 +1 — E34-radens "LEVER 9 → LEVER 9" är Före-skrivfel, faktisk rörelse 8→9; provenans-rättning s9-u1 omg 13: omgång 13:s och u2:s "286" existerade aldrig i tabellen — summan var 285 före u3:s +2).

Sidofynd utanför de tre systemen: (a) E33:s femstegskö FÖRENKLAS — steg 2-3
(index FÖRE återimport + dedupe-läge) var motiverade av en återimport som nu
är avbokad; kvar levererar steg 1 (ALTER v2 återleverans ur
DR-INDEX-PROV-2026-09-16-2.md:33-34), steg 4 (schema-synk) och ett NYTT steg:
tväprojekt-mätfällan dokumenteras i DRIFTSBOKEN (rkaq vs aufr — pg_dump saknar
tabellen; sonder mot "system_events i prod" MÅSTE deklarera projekt).
(b) MIGRERING-NY-DATOR.md-lösenordet (E34) eskaleras till huvudagenten —
filen är kundnära driftdokumentation men repot speglas mot GitHub.

## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 13 — E29 återdiffad; clobber-kuren bevisad i skarpt läge + målhjärtats driftfönster-känslighet)

Objektval EFTER kollision: E34 var förstahandsvalet (spårets största
verklighetsrörelse: patch-kedjan) men syskon u3:s disk-skrivning (20:46:33)
och commit (f1a33e95, 20:47:03) hann FÖRE min anspråksfil — disk-först-
presedensen tillämpad, E34 avstått, deras sektion orörd (korsvalidering
nedan). E29 valt i stället: senast passat 09-16 och kvällens händelser ÄR
dess namngivna gap. Varje rad EGENMÄTT 09-17 ~20:35–21:05 lokal (pm2,
node-läsning av status/jsonl/loggar, ls, grep, git — aldrig worklog).

| Mått | Kartan (09-16) | Verkligheten 09-17 (mätning) |
|---|---|---|
| Fabrikmanifest | 66 klara av 67 (+41/dygn) | **116 klara av 117**; kön bär 1 pågående (auto-s9-1789670129370 = denna dokvågs eget manifest) |
| Leveransbevis | ej mätt | **387 utdataloggar** i agentfabrik/utdata/ |
| Beslutsminne | 48 poster | **62 poster** (+14), 6 bokförda idag, senast 17:43:30Z — rondkadansen (3 h) lever |
| Pumpor-daemonen | "i ps" | **ak1a-pumpor online 25 h, ↺19** (pm2-mätt) |
| Clobber-gapet ("samma kartfil utan lås") | 3 commits/19 min + clobberbevis (09-16) | **ÅTERKOM MITT I DENNA DOKVÅG, från förlorarsidan**: min kartuppdaterares abort-grind VÄGRADE skriva när u3:s E34-rad bytts under fönstret ("ABORT E34-rad: 0 träffar" → exit 1, ingen skrivning) = en-träff-verify-kuren BEVISAD I SKARPT LÄGE; men min anspråksfil skrevs FÖR SENT (minuter efter deras disk-skrivning) — koordinationen fungerar ENDAST när anspråk läggs FÖRE mätstart |
| Målmachineriet i driftfönster | obehörigt | **evighetsmotorn 2× "mål-status OSVARBAR (två försök)"** (18:38:39Z mitt i patchfönstret 2 + 18:48:39Z; evighetsmotor.log) — samma klass som prod-synkens "mål-återarmning FEL 502" 18:32:57Z: driftfönstret bryter målhjärtat i flera system; designen ärlig (loggar + avslutar, hjärtat :x1 äger återaktivering) |
| Kunduppdragsprotokollet | mekaniskt (v156) | **VILANDE, korrekt**: kunduppdrag.json + uppdrag-klart.json saknas = ingen order i flykt just nu |
| Egen testsvit | "saknas" | **PRECISERAD**: testa-pumpor-scheman.mjs + testa-styrelse.mjs FINNS (2 st); agentfabrik / evighetsmotor / uppdragsprotokoll utan egna sviter |
| CRON_SECRET | ej satt | **fortfarande 0 namnträff** i .env* (namn-närvaro endast, värden aldrig lästa — B14-precedensen) |

Poäng: **E29 LEVER 8 kvar** — kunskap tillförd utan gaprörelse (E33/B14-
precedensen): clobber-kuren är skarptbevisad men gapet (strukturellt utan
lås) lever, svitgapet preciseras bara, CRON_SECRET kvar. Snitt 7,55 / 287 /
38 (se räkningssidofix nedan).

Korsvalidering E34 (syskon u3:s passning f1a33e95 — deras mätning slutade
"prod-bygget av 16.3.5 inte landat vid mätningen"; raden orörd): min mätning
EFTER deras: **next-server v16.3.5 LEVER i processlistan** (byggd
18:37–18:41Z), 6 ytor 200 (/, /kurser, /blogg, /laroplan, /analyser,
/studio), patchfönstren exakt **4m51s + 3m44s**, **rond 2 var OBEHÖVIG**
(rond 1 deployade redan 16.3.5; lock-commit-räknaren dömer "nothing to
commit" som misslyckad — 4 kvitton i patch-kvitton.jsonl, kön stängs på
falsk grund), döda-länkar-sviten 24/0/0 i byggfritt fönster MEN FAILAR
under pågående äkta bygge (byggprocess-grinden ser globala /proc; fixturen
isolerar ej). Köposter (1) lock-commit no-op = framgång när målversionen
redan är committad, (2) patchfönstret ~4 min kundsynlig/rond, (3) döda-
länkar-sviten märks "kräver byggfritt fönster" — förs till E34/E35:s köer.

Räkningssidofixar (dokvåg-hygien): snitt-provenansen rättas — tabellsumman
var **285** vid omgång 13 (prosans "286" existerade aldrig i tabellen; u2:s
"286 OFÖRÄNDRAT" bar samma drift) och är nu **287** = 285 + E33 +1 +
E34 +1 (u3:s E34-cell "LEVER 9 → LEVER 9" är Före-skrivfel; faktisk
rörelse 8→9).

Kö till huvudagenten: (1) kartfil-lås/kur för dokvåg-syskon — anspråk FÖRE
mätstart som promptregel + en-träff-abort som norm (båda halvorna bevisade
ikväll); (2) lock-commit no-op-klassen (E34-kö, se korsvalideringen);
(3) målhjärtats driftfönster-tålighet (synkens återarmning + motorns sond);
(4) agentfabrik/evighetsmotor-sviter.

## UPPDATERING 2026-09-18 (dokvåg s9-u3 3/3 — E34 + E26 + E27 diffade mot verkligheten; nattens deploy-/patch-fönster)

Duplikatkontroll: E34 senast passad 09-17 kväll (f1a33e95 + u1:s
korsvalidering 311b97bc), E26 09-17 14:0x (omgång 12), E27 09-17 01:3x
(omgång 10) — alla tre med verifierbar rörelse EFTER senaste passning
(patch-köns slutleverans 00:21Z + DRIFTSBOKEN-rättning 02:22 · admin-
kurerna deployade 23:50Z+00:10Z · kommandobuss-vågorna 181/182/184).
Varje rad MÄTT i arbetsytan 2026-09-18 ~02:3x lokal (curl/grep/git/ls —
aldrig worklog).

### E34 — patch-kön SLUTLEVERERAD (kvällens falsk-grund-fynd kurat)

| Mått | Kartan (09-17 kväll) | Verkligheten 09-18 (mätning) |
|---|---|---|
| Patch-kön | "stängs på falsk grund" (4 spurious-kvitton, u1:s korsvalidering) | **TÖMD `[]`** (data/infra/patch-ko.json) + **2 ok-kvitton** i patch-kvitton.jsonl (next 16.3.5 + eslint-config-next 16.3.5, ts 00:21:29Z, HELA beviskedjan i detalj-fältet) + 6 spurious-rader arkiverade intakta (patch-kvitton-arkiv-2026-09-18T00Z.jsonl) |
| lasPatchKo | ej mätt | **läser patch-ko.json** (prod-synk.mjs:380 + :579) = nästa synk ser 0 aktiva; egen svit finns (testa-prod-synk-patchko.mjs) |
| RCE-läget | next-server 16.3.5 i processlistan (u1) | **prod 200 på committad lock** (deploy 00:10:09Z 5d5bbd1f enligt kvittot; egen mätning: / + /kurser + /blogg + /studio = 200) |
| DRIFTSBOKEN | punkt 3 rättas (u1:s bokning) | **RÄTTAD** (150 982 B, mtime 02:22: "2px-admin var INTE normalmönster utan äkta treskiktsdefekt — kurerat 2026-09-17/18, slutmätt 0/88 GRÖN") |
| pm2 | — | **ak1a online** (PID 1 856 308, omstart i deployfönstrets spår) |

| E34 | LEVER 9 → **LEVER 9** | Falsk-grund-stängningen KURAD med bokföringsbevis (o60-precedensen: arkivera intakt + ok-kvitton med beviskedja + töm kön) — inget namngivet gap stängt, inget nytt öppnat; kvar-listan oförändrad (hybrid-sync, ISR 12/44, Storage-restore, MIGRERING-lösenordet) + REST hos prod-synkägaren: idempotensgrinden (nothing-to-commit = ok, inte misslyckad — klassen tröttat kön två gånger) |

### E26 — treskiktsdefekten på admin-ytan UPPTÄCKT OCH KURERAD EFTER passningen

| Mått | Kartan (09-17 14:0x) | Verkligheten 09-18 (mätning) |
|---|---|---|
| Admin-mobilöverflöd | ej nämnt (0 i färska mätningar) | **TRE kurer landade efter passningen**: tabradens `-mx-[0.875rem]` (d775e6a8 — 2px-spill i 29 arkiverade rapporter sedan ≥09-13) + ActivityRow shrink-0 → min-w-0 truncate rad ~974 med rotkommentar (37071551 — 22/22-fyndet, datastyrt intermittant) + ScrollArea `[&>div]:!block` rad 26 med rotkommentar (5d5bbd1f — botar 11 konsumenter); alla tre kodverifierade egenhändigt |
| Slutbevis | — | **granssnitt-2026-09-18T0016.json: status ok, 0 fynd/88 komb** med testpost aktiv i top-50 (exakt FÖRE-villkoret) — tredje oberoende vaktkörningen på det andra bygget |
| requireAdmin | 401 live (09-17) | **401 live igen** (egen GET /api/admin/variabler) |
| Audit-loggen | 258 969 B / 1 008 r | **312 884 B / 1 199 r** (+21 %/dygn — fabrikens driftlogg) |

| E26 | LEVER 8 → **LEVER 8** | Mobildefekten var gränssnittsvaktens fynd på E26:s yta: botad med eget slutbevis + bokförd lärdom (intermittenta fynd återskapas före kur); kärn-gapen orörda (manuell spegling, publicera-E2E R2, IP-block) — ingen poängrörelse (E33/B14-precedensen) |

### E27 — kommandobussen TRE vågor längre (181+182+184, efter omgång 10)

| Mått | Kartan (09-17 01:3x) | Verkligheten 09-18 (mätning) |
|---|---|---|
| v4-kommandobussen | sendText etapp 2 (v175) sista | **v181** pauseGoal/resumeGoal (post 30 + målpanelens spegelben) · **v182** KÖ-SYSTEMET (gap 31+32: setAutoDrain + queueItem-CRUD) · **v184** resolveInteraction (post 28) — commits 0c6d8eaa / b9c0fc23 / bd2fabf4 |
| Transportkoden | — | **skickaV4InteraktionSvar på TRE ställen** (interface :1800 + AppServerTransport :5978 + MockTransport :8788 i src/lib/studio/studio-transport.ts) + interaktions-grenen i kommandorutten (rad 106) — egenhändigt verifierad |
| Live-ytor | stream 401 (09-17) | **/studio 200 · stream 401 · kommando GET 405 · POST utan auth 401** "Admin-lösenord krävs" (egna curl-mätningar) |

| E27 | LEVER 9 → **LEVER 9** | Gap-registret tjocknar (post 28+30+31+32 stängda på kommandobuss-vägen, §11.2/§11.4); UI-kopplingarna (dialog-kort, köpanel) förblir feature-avvägning — redan toppnoterat, ingen poängrörelse |

Snitt **7,5 / 287 / 38 OFÖRÄNDRAT** (kunskapsdokvåg, E33/B14-precedensen
— ingen poäng rördes). Kö till huvudagenten: (1) prod-synkägarens
idempotensgrind (E34-REST, klassen tröttat kön två gånger); (2) juridik-
grindens FP-kur hastas (E26, se omgång 12 — kön växer rakt in i vakten);
(3) v4-dialogens UI-koppling (E27, feature-avvägning enligt §11.4).

## UPPDATERING 2026-09-18 (dokvåg s9-u1 omgång 14 — A6 Biblioteken återdiffad; läspaketkön tredubbad på två dygn, underlagsgapet blev en klass)

Objektval enligt spårets mogenhet-regel (äldsta stämpeln utan återdiff +
störst verklighetsrörelse): A6 stämplad 09-16 och aldrig återdiffad; bland
de elva 09-16-stämplade kandidaterna (A5 A6 B10 B11 B12 B14 C19 D20 D25
D38 E36) hade enbart A6 mätbar rörelse — läspaketkön; övriga stilla
(topplistan tom, ingen src-rörelse i deras ytor, inga nya datafiler).
Syskonkontroll: u2/u3:s senaste passningar (omgång 9–13) rörde D22 D23 B9
A4 A1 C17 C18 A2 E31 B13 — A6 orört, inget duplikat. Allt EGENMÄTT i
arbetsytan 09-18 (node-mätning med sidans eget analysfabrik-v1-kontrakt +
explicita ticker-tabeller, per-paket-matchning mot båda underlagskatalogerna,
ls/mtimes, git log, loopback-curl + HTTPS).

| System | Före (passning 09-16) | Nu (mätt 09-18) | Domkraft |
|---|---|---|---|
| A6 | Kön 22 filer (12 paket + 10 kalendrar), serien "fullbordad"; bokmaster 103; forskningsbibliotek 22 tickers; gap 4 = Nordeas enkelfall | Kön 46 filer (36 paket + 10 kalendrar — TREDUBLAT); per-paket: 11 med AKM2-analysbank (en-till-en med bankens 11) · 7 med forskningsbiblioteks-AKM1 (AT&T, BSX, Nike, Norsk Hydro, Novo, NP3, SAP) · 18 utan alla underlag; bokmaster 105 på disk (siffror.json 103); 22 tickers orörd sedan 09-10 (0 förkastade); /bibliotek /forskningsbiblioteket /kallor 200 loopback+HTTPS; gap 1 öppen (0 bokmaster-referenser i pre-commit) | yttillväxt utan underlagsföljd — gap 4 skärpt till klass (25 paket utan AKM2-underlag); serieproduktionen (s1/s4) löper ifrån underlagsbasen |

Poäng: A6 LEVER 7 — OFÖRÄNDRAD (preciseringsdokvåg, B13-precedensen:
yttillväxt + skärpt gap utan stängning). Snitt 7,5 / 286 / 38 oförändrat.

Kö: (1) medvetet universumbeslut för de 18 nakna paketen — underlags-
produktion ELLER lucknotis-standard som Nordea-paketet bär; (2) lint-dörr
för bokmaster-JSON i pre-commit (gap 1, öppen sedan 09-16); (3) siffror-
rebake 103→105 (A1:s kosmetik-köpost, bokförd 09-17); (4) universumfrågan
22↔11 (gap 2, frusen sedan 09-10 — inget nytt underlag tillkommit).

## UPPDATERING 2026-09-18 (dokvåg s9-u2 manifest auto-s9-1789691129810 — A3 + B12 diffade; E27-kollision med syskon u3 hanterad)

Objektval: A3 + E27 (anspråk FÖRE mätning 02:28). KOLLISION under fönstret:
syskon u3:s commit 2301ed2e 02:32 (E34+E26+E27) — E27 AVSTÅTT enligt
disk-först-presedensen (s9-u1 omg 13-mönstret), deras sektion orörd;
KORSVALIDERING nedan. PIVOT: B12 — enda fria systemet med faktisk
src-rörelse sedan senaste passningen (FOMO-kuren 1f43c167 09-17 00:55,
oläst i kartan). u1:s A6-anspråk (02:31) respekterat. Varje rad MÄTT i
arbetsytan 09-18 ~02:3x–02:5x lokal (38 svitkörningar med sanna exitkoder,
egen larvag-synk, git show, grep i prod-chunks, live-sonder loopback):

| Mått | Kartan (förra passningen) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Lagerkedjan (A3, omg 8) | 24 lager (chat-widget.tsx:986) | **33 motorer** — kedjesvitens domslut "disjunkta monster-id:n över alla trettiotre motorer" (egen körning); kedjeraden chat-widget.tsx:1138 (32 ??-led) |
| Frågemonster (A3) | 80 (25 bas + 55 i 23 filer) | **98 unika id** (kedjesvitens id-räkning) — +18 på nio nya lager (optionsdjup, värderingsverktyg ×3, konjunkturindikatorer, kapitalbindning, rörelsekapital/KCC, warrant m.fl.; s6 omg 14–16) |
| Testsviter (A3) | 30 sviter / 781 kontroller: 780/1 | **38 sviter · 38 gröna · 0 FAIL** (samtliga egna körningar med sanna exitkoder: bassviten 555/0 · kedjan 70/0 · warrant 39/0 · alla lagerfiler gröna) |
| E01 registeräkthet (A3) | RÖD 358/390 (gap 32, tre mätningar i rad) | **GRÖN — "408 kurser fält-för-fält — identisk med getCourses()-källan"** (egen körning) — gap 5 STÄNGT |
| Register/larvag (A3) | gapet växer | larvag-synk EGEN körning GRÖN **408=408=408 · 21 profiler · 0 fantomer** exit 0; siffror.json 408 kurser · 8 223 quiz; warrant-lagret ai-mentor-warrant-fragor.ts (09-18 00:31, DI-mönstret) + 32 frågelagerfiler |
| Granskningsstegets text (B12, omg 6) | "Sista chansen att justera…" (FOMO-formulering, outtalt i kartan) | **FOMO-kuren LEVER i prod**: "Efter detta steg låses dina val och resultatet visas" (superanalys.tsx:467; deploybevis: prod-chunk 1wv5cn_5misik.js bär nya strängen, gamla BORTA ur samtliga chunks — egen grep) |
| Kodbas (B12) | 2 670 r (507/752/1 411) | OFÖRÄNDRADE radtal (wc -l) — kuren var 1:1-radsbyte |
| Egna sviter (B12) | gap 1: 0 sviter | **0 sviter fortfarande** (ls: inga testa-superanalys/kalkylator/akm1-filer) — gap 1 lever |
| Vakttäckning (B12) | outtalt | **PRECISERINGSFYND**: /superanalys + /kalkylator finns EJ i gränsnittsvaktens FALLBACK_SIDOR (granssnittsvakt.mjs:68 bär 6 sidor; 0 vaktrapporter i data/vakten med superanalys-träff, egen sökning) — ytan rutinmäts ej; /superanalys + /kalkylator 200 live (egna sonder) |
| E27 (KORSVALIDERING) | u3:s 02:32-commit: v181/182/184 + tre skickaV4-metoder + live-sonder | **OBEROENDE BEKRÄFTAT**: transporten 10 481 r (karta senast bar 8 316); skickaV4InteraktionSvar/KoStyrning/MalStyrning på :1800/:1774/:1752 interface + :5978/:5911/:5871 AppServer + :8788/:8741/:8715 Mock (grep); kommandorutten 209 r dokumenterar POST 28+30; egna live-sonder: /studio 200 · stream 401 · usage-v4 401 · kommando GET 405 |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A3 | LEVER 8 → **LEVER 9** | E01-kontraktet (SKÄLET att hålla 8 vid omgång 7+8 — "enda röda kontrollen är själva kontraktbrottet") STÄNGT mätbart: 408/408 fält-för-fält grönt efter tre röda mätningar; disciplinen bevisat hållen genom två efterföljande kursvågor (398→401→408, atomär rebake); 38/38 sviter gröna = kodbasens bredaste testyta HELT röda-fri för första gången. Kvarvarande gap mjuka: dataset-medianer = produktbeslut, E2E kräver levande inloggning, assistent-panel 0 sviter |
| B12 | LEVER 7 → **LEVER 7** | En textkur (beteendeekonomiskt värdefull, ingen kapabilitet) + preciseringsfynd (vakttäckning); kärn-gapen 1 (0 sviter) och 2 (E2E-rendering) orörda (E33/B14-precedensen) |

Snittscore **7,6** (287 → **288** poäng / 38 system; A3 +1 vid denna dokvåg).

Kö till huvudagenten: (1) /superanalys + /kalkylator in i gränsnittsvaktens
sidrotation (FALLBACK_SIDOR bär 6 sidor — B12:s publik yta rutinmäts ej);
(2) B12 klientfilens egna sviter (gap 1, tredje mätningen); (3) A3:s mjuka
gap: dataset-medianer-beslut + assistent-panel (0 sviter kvar).

## UPPDATERING 2026-09-18 (dokvåg s9-u2 manifest auto-s9-1789709700201 — E35 + E37 diffade mot verkligheten)

Objektval: **störst rörelse sedan senaste passningen** (andrarondens regel).
Båda passerades 09-17 07:14–07:15 — och är sedan dess spårens mest
rörda ytor: E37 bar hela prestandaserien s7 (o45 flight, o49–o57
prefetch/defer-kurerna, o61 PalettVakt-defern, o62 mobil-läsbarheten)
och E35 bar kvalitetsvågen s8 (o46–o50 patch-kedjan, o55 döda länkar,
o59 mimosa, o64 SSR-livssonden, o65 stormtriagen). Klaim i worklog
FÖRE mätning; syskon u1/u3 hänvisade till andra system. Varje rad
MÄTT egenhändigt 09-18 ~05:3x–05:5x lokal (vaktkörning, svitkörningar
med sanna exitkoder, wc/ls/grep, live-sonder, protokoll-läsning):

| Mått | Kartan (förra passningen) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Vaktens kontroller (E35) | 11 kontroller | **12** — KONTROLL 12 SSR-livssonden (o64, 40a512be): o47:s blindhet botad, prod kan inte igen stå sjuk med 1 616 SSR-500 okända — sentinellrutter (/ /kurser /analyser /blogg /labb /en /ar) provas på loopback i VARJE vaktkörning |
| EGEN vaktkörning (E35) | 11/11 PASS GRÖN (09-17 05:09Z) | **12/12 PASS · 0 fel · 0 manuella · GRÖN** (egen körning 05:39:43Z, exit 0) — inkl. sektion 12 och typbaslinjen (kontroll 11, tsc projektbinär) |
| Testsviter (E35) | 74 (mätt 09-17 omg 11) | **90** (ls verktyg/testa-*.mjs — +16 på ett dygn) |
| Feljakts-systemet (E35) | outtalt (endast o25-köpost) | **STORMTRIAGEN LEVER** (o65, e5eca448): backlog 245/245 bedömda (FÖRE 241 öppna/97 HÖG-KRIT → EFTER 0/0), ledgern 245 fyndrader + 243 bedömningsrader (egen wc — differensen = nyckelkollisionerna, bokade hos verktygsägaren), stormar-grinden allt-eller-inget; svit **20/20 PASS** egen körning (domklasser 4) |
| Döda-länksvakt (E35) | 3 012 sökvägar / 0 fynd (09-15) | **INSTRUMENTET KURATERAT** (o55, 957272f8): 3 473/0 + negativt kontrollfall |
| Prefetch-serien (E37) | blogg ×3 (o37/o41) + koddelning o27/o31 | **TOLV kurer till**: o45 flight (393 kursobjekt ur RSC-payloaden), o49 /logga-in (2→0), o50 logo ×3 omgångar, o51 kurskort-lista, o52 blogginlägg (?_rsc 5→0), o53 chat-defer (rIDLE 2 500 ms), o54 kursiv-preload (LCP-elementet), o56 herolänkar (**/ _rsc 5→3 · requests 45→38 · transfer 633,1→590,8 KiB**), o57 LasyGlobal tvåstegs (8 s + idle), o61 PalettVakt-defer (15–21 K-familjen ur TBT-fönstret) |
| Lighthouse-band / (E37) | nattfacit 66 poäng (o38) | **P61 · LCP 5 162 · TBT 675 · CLS 0** (o56-EFTER-tvärsnittet, bygge stE6SStz — band, ej kriterium; /kurser P57 · TBT 1 074; /blogg P66) |
| 52-px-delspåret (E37) | gap 6: "rond 2 bokad" | **SLUT för barnägda ytor** (o62, fe3e85dd): mätverktyget metrologiskt härdat (settle-vänta + stabilitetspass; 19 fantomer bevisade av tre CDP-sonder), EFTER 6 fynd på 6 sidor = SAMMA element (ShortSeller-döljknappen 44×44, o8 §8:s dokumenterade undantag, WCAG 2.5.8 + Apple HIG), 0 zoomfällor; kvar = 2 designbeslut (huvudagent-yta) |
| Kvarvarande _rsc-spill (E37) | outtalt | **/kurser ×3 (36,0 KiB) bitidentisk** — ägaren herons TREDJE länk (home.slutTitta-textlänken ~526); köpost o63 med färdig kurs-idé (väntan _rsc 3→0 · 38→35 req · ~555 KiB) |
| Prod-läge (E37/E35) | prod 200 | **Egna HTTPS-sonder: / · /kurser · /blogg · /studio ALLA 200 på 59–75 ms** (05:4x); bygge BBrkvx9 (nyare än o62:s c7v5uV — s8-vågornas deploys) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E35 | LEVER 9 → **LEVER 9** | Vaktbältet växte 11→12 kontroller + 74→90 sviter + ett helt nytt delsystem (feljakt-stormtriagen) — men de bärande gapen lever oförändrade: aggregatorn (90 sviter = fortfarande provtagning), motorregistret fruset sedan 09-03, vaktrapports-stoppet i deploy; score redan i taket |
| E37 | LEVER 8 → **LEVER 8** | Serien är mätbart störst i repot (_rsc 5→3, −42,3 KiB, TBT 1 636→1 074-band, 52-px-ronden avslutad) men inkrementell polering av ett system som redan bar 8 — kvar: o63-köposten outlevererad, 0 egna sviter, språkresolvens-CLS intermittent, sökindex-cadans (B12-precedensen: kurer utan ny kapabilitet flyttar ej poäng) |

Snittscore **7,6** (288/38 oförändrad — båda poängen orörda med motivering ovan).

Kö till huvudagenten: (1) **o63-köposten** — herons TREDJE länk
(home.slutTitta-textlänken, identisk kirurgi som o56, väntat −36 KiB +
3 requests per kall familjen); (2) **E37:s två designbeslut** — prosa-
länkar i löpande text + 44-korset (dokumenterat undantag vs 52-golv) =
styrelse-yta, ej barn-agent; (3) **E35:s aggregator-växt** — 90 sviter
utan kör-alla-aggregator, motorregistret 15 d fruset, vaktrapports-
stoppet fortfarande 0 träffar i prod-synk.

## UPPDATERING 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789709700201 — A5 Gamification återdiffad mot verkligheten)

Andra varvet för A5 (förra passningen 09-16, dokvåg s9-u3 omgång 6). Varje
rad MÄTT i arbetsytan 2026-09-18 05:39–06:05Z — inte läst ur worklog. Anspråk
FÖRE mätstart (data/vakten/auto-s9-1789709700201-u1-ansprak.md, HEAD e5eca448);
syskon u3:s anspråk (E35+E26/E37) respekterat.

| Mått | Kartan 2026-09-16 | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| A5-kod i git | passningens läge 09-16 | **0 commits sedan 09-16** — api/topplista 129 r · certifikat.tsx 242 r · topplista.tsx 136 r · badg-panel.tsx 235 r · badges.ts 326 r (orörd sedan 02c0920d 09-01): HELT STILLA |
| Publika ytor | /badges /certifikat /topplista 200 | **200 på loopback OCH HTTPS** (egna sonder) |
| Topplistan live | TOM | **FORTFARANDE TOM** (GET {"topplista":[],"antal":0}) — 0 xp_sync i fönstret ⇒ gap 3 "inget utnyttjat" intakt |
| Sessionsvakt POST | saknas (e-post ur klient-body rad 34) | **ÅTERVERIFIERAD SAKNAS** (auth-grep 0 träffar; caps orörda rad 38–40: xp ≤ 10 M · nivå ≤ 100 · kurser ≤ 1 000) |
| NYTT: POST-svaret | ej noterat 09-16 | **läcker {rank,total} till oautentiserad anropare** (rad 63–83) — placering av främmande e-post läsbar av vem som helst |
| NYTT: GET-fönstret | ej noterat 09-16 | **aggregerar endast senaste 500 xp_sync** (rad 97) — äldre synkar faller av listan helt |
| certId | kollisionsbart (certifikat.tsx:57) | **OFÖRÄNDRAD** konstruktion AK1A-år-XP-pad-6 — gap 2 lever |
| Badges | trösklar som okompilerad data | **29 troféer** i badges.ts (28 flaggskepp f3a56fc9 + Ritualstartad 02c0920d, båda 09-01) |
| Gap 1 (sviter) | 0 egna sviter | **0 fortfarande** (ingen badge/topplista/certifikat-svit i verktyg/, mätt) |
| Bränslet (SIDOFYND) | quiz 8 223 · XP 82 230 (A1 09-17) | kurser **414** (+18 sedan 09-17; s5-vågorna tx-04/ma-05/ek-05/od-05 …) men quiz **8 223** · quizXp **82 230** OFÖRÄNDADE (siffror.json uppdaterad 09-18 06:01) — nya kurser bär INGA quiz |

Score A5 LEVER 7 orörd — kodstasis + skärpta precisioner utan gap-stängning
(B13-precedensen). Snitt 7,6 / 288 / 38 OFÖRÄNDRAT. Kö: (1) sessionsvakt +
rank-läcka på /api/topplista (huvudagenten); (2) A1/A2-ÖVERSIKT-radernas
kurstal 396 föråldrat (414 mätt 09-18 — A1:s yta, lämnad orörd här);
(3) quiz-tillväxt för nya kurser (A1/s5-spåret).

## UPPDATERING 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201 — E26 + C15 + E34 diffade mot verkligheten; kollisionspivot från E35+E37)

Objektval: anspråk FÖRE mätning (data/vakten/auto-s9-1789709700201-u3-ansprak.md,
05:36Z — E35+E26+E37, störst rörelse). KOLLISION: syskon u2:s commit 58cc326e
07:44:59 levererade E35+E37 medan mätningarna pågick — deras sektioner orörda
(disk-först-presedensen); mina oberoende tal bokförs som KORSVALIDERING nedan.
PIVOT: E26 (egen anspråkspost, orörd av syskonen) + C15 + E34 (båda med
verifierbar rörelse EFTER senaste passning). Varje rad MÄTT i arbetsytan
2026-09-18 ~07:3x–07:5x lokal — svitkörningar med sanna exitkoder, egen full
vaktkörning, wc/ls/grep/git, curl mot loopback, processlistor; protokoll-
korsläsning ENDAST som sekundärkälla.

### E26 — godkännandehärdningen KODVERIFIERAD (levererad 07:18, EFTER 02:3x-passningen)

| Mått | Kartan (02:3x) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Härdningstak | outtalt (våg 91 A2:s KÖRS DIREKT-post öppen) | **KODAD OCH EGENLÄST** (a20f15fa, protokoll o64-godkannande-hardningstak-s8.md): publicera-ruttens SKYDDSLAGER steg 1b — 6 authade försök/minut, sittande EFTER requireAdmin (anonym trafik kan aldrig förbruka fönstret och DoS:a kundens R2-knapp); val-ytan (route.ts:25) — 20 authade POST:er/minut, GET takfritt; 429 bär Retry-After 60 och pushar aldrig (takUppnaatt :61) |
| Audit-åtgärden | 8 åtgärdstyper | **+ "publicera-avvisad"** (skrivAudit "kund" :91) — append-only kvitto per avvisat publiceringsförsök (429/404/409/400); **0 förekomster ännu** (egen grep — flödet kodbevisat, ej driftbevisat: R2-knappen förblir kundens) |
| Audit-loggen | 312 884 B / 1 199 r | **336 540 B / 1 281 r** (egen wc; sista raden = DETTA barns uppgift_start — fabrikens driftlogg lever; 452 start + 430 klar + 206 katalogsynk + 181 deploy) |
| Svit + live | 14/14 · 401 ×2 (02:3x) | **14/14 exit 0 igen** (egen körning) · requireAdmin **401** på /api/admin/variabler + /api/studio/godkannande (egna sonder) |
| Granskningsköns mått | FLYTTKLAR 63 utkast (gap 5 brittare) | **FLYTTKLAR 0** — mätetalet DÖTT: utkastmappen omorganiserad till GRANSKNINGSKO-SAMMANSTALLNING.md (förnyad 05:22Z) + JSON-uppladdningsformat (52 json + 2 md i roten, s3-vågorna) |
| Juridik-FP | 17 VARNINGAR | **22 VARNINGAR** (larmfil 05:37Z, 0 FEL — kön växer vidare, nu på .json-utkast via tvärfall-regeln) |

| E26 | LEVER 8 → **LEVER 8** | Härdningstaket = belastningsrobusthet på kodbevisnivå (0 driftfall ännu — R2); kärn-gapen orörda (manuell spegling, publicera-E2E, IP-block, Elliott-test); FLYTTKLAR-mätetalet ersatt av kö-struktur-census. Ingen poängrörelse (E33/B14) |

### C15 — kön 175 → 199 filer med FÖRNYAD kundvy; publiceringsstocken orörd (R2)

| Mått | Kartan (09-17) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Utkastköten | 175 filer (rot 48 · m9-ko 7 · granskning 77 · kvartal 43) | **199 filer** (rot 54 · m9-ko 7 · granskning 89 · kvartal/2026-q3 49 — egen find-census; +24 på ett dygn: s4-läspaketen 37–39 + s1-mx + s3-översättningarna) |
| Kundens kö-vy | sammanställningen förnyad 09-17 16:58 | **FÖRNYAD IGEN 05:22Z idag** (mtime) — "åldrande vy"-gapet hålls stängt av leverantörerna själva |
| Publicerat | 55 (sedan 09-14) | **55 orörda** (egen ls; R2 — kundens beslut) · /blogg 200 (egen sond) · B2-rutten metodbevakad (GET /api/admin/blogg/publicera = 405, ej 404 — egen sond) |

| C15 | LEVER 8 → **LEVER 8** | Kö-växten + förnyade kundvyn är processhälsa; flaskhalsen förblir publiceringsuttaget (kundens klick, R2) och B2-E2E saknas fortfarande — ingen score-rörelse (B13) |

### E34 — nattens DR-födelsebevisövningar + dagens gröna deployfönster; driftminnet maskinellt i feljakt-ledgern

| Mått | Kartan (02:3x) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| DR-övningar | s10-köposter bokade | **S10-U1 + S10-U2 LEVERERADE I NATT** (DRIFTSBOKEN :1830 + :1863): blad 8 bevisat i sin födelsetimme, RPO-kurvans yngsta punkt, dagsteget dekomponerat — pump-noll STÄNGD, kvartsklocke-förutsägelse infriad EXAKT, WAL-platå; protokoll DR-OVNING-2026-09-18-FODELSEBEVIS.md + 2 maskinella |
| Deployfönstret | prod@5d5bbd1f 00:10Z | **prod@e5eca448 05:29:45Z** ("4 commits — HTTPS 200 verifierat", audit-kvitto egen grep) · BUILD_ID BBrkvx9Vkuq56S_7jW9CF (egen läsning) · next-server 16.3.5 i processlistan (egen ps) · pm2-omstart i fönstrets spår · 12 deploy-events idag |
| Patch-kön | [] + 2 ok-kvitton | **OFÖRÄNDRAT** ([] + 2 rader next/eslint 16.3.5 i data/vakten/patch-kvitton.jsonl, egen wc) |
| Driftminnet | kraschvakten + DRIFTSBOKEN | **+ feljakt-ledgern** (o65): 69 salvor ur 5 källloggar dom-kodifierade (18 kraschvakt-trigg · 15 ram-/byggfönster · 24 agentträd · 6 deploybygg · 5 deployfönster · 1 okänd), bygg-OOM ×3 (04:23/16:30/17:30 09-16–17) dokumenterade |

| E34 | LEVER 9 → **LEVER 9** | DR-övningarna fördjupar bevisen (födelsebeviset stående praxis — nästa blad 02:30 09-19) utan nytt rot-gap; deployfönstret grönt; kvar-listan oförändrad (ISR 12/44, hybrid-sync, Storage-restore, MIGRERING-lösenordet, idempotensgrinden) |

### KORSVALIDERING E35 + E37 (syskon u2:s 58cc326e — oberoende tal, identiska domar)

Egen full vaktkörning **12/12 PASS · 0 fel · 0 manuella · GRÖN 05:41:29Z**
(2 min efter u2:s 05:39:43Z — samma dom) · motorvalidering **107/0/0 (5,7 s)**
· testsviter **90** (egen ls) · stormar-sviten **20/0** (egen körning, domklasser 4)
· feljakt-ledgern **245 rader / 42 767 B** (egen wc) · SSR500-sviten **25/0/0**
(egen) · o56-koden prefetch={false} på home-section.tsx:313+324 med
o17/o41/o49-rotkommentar (egengrep) + hem-HTML:n bär 0 prefetch-linktaggar
(egen sond) · live / /en /ar /kurser 200 på 11–17 ms (egna sonder).
METODFYND (transparens): mätfönstergrindens pgrep FICK inte bära mönstertexten
okammad i eget argv — första grindsvaret var SJÄLVMATCHNING ("bygget aktivt"
medan processlistan visade vilande prod; kuren parentes-form `next[ ]build`
+ fullsekvens-kontroll i processlistan) — o55 §5:s klass lever hos varje ny
mätare; bokas som perpetuell metodregel.

Snitt **7,6 / 288 / 38 OFÖRÄNDRAT** (tre preciseringsdokvågar utan poäng).
Kö till huvudagenten: (1) o63-köposten (E37, u2 bokade — herons TREDJE länk);
(2) juridikgrindens citat-vs-råd-kur hastas (22 VARNINGAR på köns nya
JSON-format); (3) feljakt-ledgerns nyckelkollisions-härdning (verktygsägaren);
(4) B2-E2E förblir kundens första knapptryckning (R2); (5) E34:s kvar-lista
(ISR 12/44 främst).

## UPPDATERING 2026-09-18 (dokvåg s9-u2, manifest auto-s9-1789731901131 — A2 + C17 diffade mot verkligheten)

Objektval: störst rörelse sedan senaste passning (andrarondens regel). A2 bar
s5-spårets BÅDA manifestomgångar samma dag (omg 14 + 15 = 11 nya kurser +
register-rebakes) och C17 bar s2 omgång 14 (universum +6 + första landmodulen
utanför sverige/usa) + s4:s kvartalskö-tillväxt. Anspråk FÖRE mätstart
(data/vakten/auto-s9-1789731901131-u2-ansprak.md, gitignorerad väg); syskonens
val respekterade (u1 = E29, u3 = B10+B11+B14 — disk-först vid båda). Varje rad
MÄTT i arbetsytan 2026-09-18 ~12:0x–12:2x lokal — node-räkningar, EGEN
synk-/svit-/vaktkörning med sanna exitkoder, ls/grep/git, curl-sonder mot
loopback OCH HTTPS:

| Mått | Kartan (förra passningen) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Registret (A2) | 396 kurser (09-17) | **420** — node-räkning av public/deep-courses.json; siffror.json "kurser": 420 (uppdaterad 09-18); LARVAG_ANTAL_KURSER = 420 i larvag-karta.ts:459 — +24 på ett dygn: dagens s5-vågor omg 14 (bk-04, rp-03, ma-05, ek-05, od-05) + omg 15 (bk-05, pe-04, ib-02, vr-05, tx-05, roic-03), resten 09-17 kväll |
| larvag-karta.ts (A2) | 435 r | **459 r** — sista commit 729ad5e7 (s5-u2 omgång 15, idag) |
| Kärnan larvag.ts (A2) | 458 r orörd sedan v99 | **OFÖRÄNDRAD** (git-bevis: sista ändring 2a566cfd 2026-09-11 våg 99) — deterministiska kärnan orörd genom hela 396→420-tillväxten |
| larvag-synk (A2) | GRÖN 396=396=396 · 21 profiler | **EGEN KÖRNING GRÖN 420=420=420 · 21 profilkurser · 0 fantomer** (exit 0, bevis data/vakten/larvag-synk.json) |
| Ytor (A2) | /laroplan + /api/larvag 200 (loopback) | **200 på båda kanalerna** — /laroplan HTTPS 200 + loopback 84 ms · /api/larvag loopback 200 · LarvagKort lever (min-sida.tsx:857) |
| front-B-sonder (A2) | 16 | **28** (verktyg/_s5*frontb*.mjs, egen ls) |
| Universum (C17) | 171 (s2:s FÖRE-läge; kartans kropp räknade ej) | **177 poster** — egen node-räkning av data/portfolj-system/bolagsunivers.json; +6 på ett dygn (FCX, Klarna, Boozt, Genmab, Lundbeck, Ambu) |
| Landaspekter (C17) | sverige + usa (v150) | **+ DANMARK** (land.ts:261, "omg14 s2-u3" i koden) — första landmodulen utanför se/us; /dataset/halso/danmark **200 på HTTPS 141 ms OCH loopback** |
| Kön-filer (C17) | 40 (30 paket + 10 kalendrar) | **52** — 42 sa-laser-du-bolagspaket + 10 kalendrar i data/blogg-utkast/kvartal/2026-q3 (egen ls); s4 levererade GS (seriens 40:e) + Vår Energi (41:a) |
| Aspekt-sviten (C17 gap 0) | TRASIG (09-15 + 09-17) | **FORTFARANDE TRASIG — TREDJE passningen i rad**: egen körning exit 1, "OFÅNGAT FEL (testet självt): ERR_MODULE_NOT_FOUND './ordlista'" via dataset-medianer.ts; SKÄRPNING: verktygets eget huvud lovar "ALLT körs i try/catch per modul — ett importfel dödar aldrig hela testet" men importen ligger på toppnivå ⇒ hela sviten dör |
| Läckagevakt v98 (C17) | GRÖN 153+153 i 3 utdatafiler | **GRÖN 177+177 i 1 538 utdatafiler** (egen körning exit 0) — sweep-ytan vuxit med datasetlandskapet |
| Prod-drift (C17) | /dataset m.fl. HTTP 500 (09-17-fyndet) | **LÄKT OCH STÅENDE** — /dataset, /dataset/energi, /dataset/material, /dataset/halso/danmark ALLA 200 (HTTPS 98–166 ms + loopback 11–27 ms; SSR-läkningen 09-17 bekräftad) |
| llms.txt LIVE (C17) | 171-läget | **177-bolagssektionen LIVE** (curl round-trip: "fasta universumet på 177 bolag i 10 branscher (rådata 2026-09-18)", totalt P/E 21,2 n=167); 0 av dagens sex bolagsnamn i filen — kontraktet §1 håller även i llms |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A2 | LEVER 7 → **LEVER 7** | Rekordtillväxt i registret (+24 kurser/dygn) med kärnan orörd, synk GRÖN och ytor 200 — men rent kvantitativ: gap 1 (egen regressionssvit för raknaLarvag — grep 0 träffar) och gap 3 (E2E-inloggning) oförändrade; E33/B14-precedensen (tillväxt utan gap-rörelse flyttar ej poäng) |
| C17 | LEVER 9 → **LEVER 9** | Universum +6, Danmark-födseln (ny sidtyp-klass: tredje landet) och läkt drift — men gap 0 nu trasig TREDJE passningen (och svitens egna huvud-löfte om per-modul-felisolering hålls ej) och H3-underlaget växer utan src-kod (52 Kön-filer, 0 i src); B13-precedensen |

Snittscore **7,6 / 288 / 38 OFÖRÄNDRAT** (båda poängen orörda med motivering
ovan). Sidofynd: quiz 8 223 · quizXp 82 230 FRYSTA medan kurserna växte
396→420 (siffror.json) — förlänger s9-u1:s bränsle-fynd med +6 quizlösa
kurser; A1:s yta, lämnad orörd (s9-u1:s bokade kö).

Kö till nästa dokvåg/huvudagent: (1) **gap 0-reparationen växer i vikt** —
importbro à la v82-kurs-metadata-bro för testa-dataset-aspekter.mjs; tre
passningar trasig och kontraktslöftet i verktygshuvudet är brutet (doktrin:
svitens huvud SKALL stämma med svitens beteende); (2) A1:s ÖVERSIKT-kurstal
(396→420) + quiz-frysningen (A1/s5-spåret); (3) H3-kvartalsruten växer ifrån
sitt underlag (52 Kön-filer).

## UPPDATERING 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789731901131 — E29 autonoma organet återdiffad; tredje varvet)

Val mot duplikat: E29:s detailblock bar stamplen 2026-09-16 (äldsta klassen
som återstod efter u3:s B10/B11/B14-anspråk på disk 13:47). Anspråk på disk
FÖRE mätstart (data/vakten/auto-s9-1789731901131-u1-ansprak.md, gitignorerad
väg — disk-först-presedensen sedan 09-17:s E34-clobberläxa); KUR-BEVIS I
EGNA FÖNSTRET: syskonet u2:s sektion ovan bokför självt "syskonens val
respekterade (u1 = E29, u3 = B10+B11+B14 — disk-först vid båda)" och valde
A2+C17 — disciplinen fungerade, noll kollision i detta fönster. Varje rad
MÄTT i arbetsytan 2026-09-18 ~14:00:

| Mått | Kartan (09-17-kvällsraden) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Fabriksmanifest | 116 klara av 117 | **146 klara av 147** (+30 på ~20 h; enda pågående = detta manifest) — 22 auto-manifest startade IDAG (21 klara) |
| Utdataloggar | 387 | **475** (+88 leveransbevis) |
| Beslutsminne | 62 poster, senast 17:43:30Z | **68 poster**, senast **rond 51 kl 11:43:03Z** (4 poster idag — rondkadansen lever) |
| pumpor-daemon | online 25 h ↺19 | **pm2 'ak1a-pumpor' online 42 h ↺19** (ps: sedan 16 sep) + fabriksprocessen fångad LEVANDE i mätfönstret (pid 2140015, startad 13:45 — matade detta manifests barn) |
| evighetsmotorn | "verktyg på disk" (09-15-rad) | **614 kontroller, senaste 11:48:03Z** (state+log); loggen "målet INAKTIVT — lämnas åt hjärtat :x1/ronden" + mal-state återarmat 11:41Z (24/7-STANDBY) = maskineriet levande under mätningen |
| Svitgap | pumpor+styrelse HAR · fabrik/evighet/uppdrag saknar | **OFÖRÄNDRAT återmätt**: testa-pumpor-scheman.mjs + testa-styrelse.mjs på disk; 0 svitträffar för agentfabrik/evighetsmotor/uppdrag |
| CRON_SECRET | 0 namnträff | **0 env-filer bär namnet (återmätt)**; namnet refererat i src (5 cron-rutter + nyheter/scan + ekosystem-panel) — cron-vakten vilar fortsatt på ett osatt secret |
| Kunduppdragsfiler | vilar korrekt | **fortfarande frånvarande** (kunduppdrag.json + uppdrag-klart.json existerar ej; senaste UPPDRAG KLART 09-14 i uppdragsloggen) = ingen order i flykt |
| Drivbild | crontab bär ingen rond-rad | **återmätt**: användar-crontab bär backup/vakt/arkiv-rader — fortfarande INGEN rond-/fabriksrad; pm2 äger pumpor-daemonen |
| Kollisionsklassen | 09-16 kartfil · 09-17 E34-rad (abort-grind bevisad) | **ÅTERKOMMEN 09-18 i ny skepnad** (s8-fönstret 13:30–13:36): protokollnumret o67 TRIPPELKOLLIDERADE (u1 driftsbok + u3 protokollfil + u2 flytt o67→o68) OCH git-index-kollision (057f8446:s commit utan paths tog u3:s staggade namnbyte med sig) — allt ärligt bokfört i 6e44422c/dcd3e279 + två disknotiser (data/vakten/auto-s8-1789730101010-u1-o67- och -u2-o68-commitnotis.md, mätta på disk 13:32/13:34) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E29 | LEVER 8 → **LEVER 8** | Tillväxten talar för högre (+30 manifest utan förlorad uppgift, rondkoll på 51, processerna levande under mätningen, disk-först-disciplinen bevisad i eget fönster) MEN kollisionsklassen är nu bevisad i TRE fönster i TRE skepnader (kartfil 09-16 · kartrad 09-17 · nummerserie+git-index 09-18) och kuren är DISCIPLIN, inte mekanism — fabrikens commit-instruktion föder syskonen utan isolerade nummerserier/staging-ytor. E33/B14-precedensen: kunskap tillförd, inget gap stängt ⇒ ingen poängrörelse |

Snitt **7,6 / 288 / 38 OFÖRÄNDRAT** (återdiff utan poängrörelse). Kur-kö till
fabriksägaren: per-uppgift isolerad protokollnummerserie + commit med EXPLICITA
paths (aldrig allt staggat) i fabriks-prefixet — stänger kollisionsklassen
mekaniskt i stället för disciplinärt.

## UPPDATERING 2026-09-18 (dokvåg s9-u3, manifest auto-s9-1789731901131 — B10 + B11 + B14 återdiffade; DRIFTFYND: Contabo-nyhetscronen 404-död sedan skapandet + tyst tom nyhetslista live)

Objektval: B-radens tre ENDAST kvarvarande system utan andra varvet — B7+B8
(09-17 omg 11), B9 (09-17), B12 (09-18 u2), B13 (09-17 omg 13) var redan
återdiffade; B10+B11 passades senast 09-16 omgång 5, B14 09-16 (u2 2/3).
Anspråk FÖRE mätstart (data/vakten/auto-s9-1789731901131-u3-ansprak.md);
syskonens val respekterade och deras sektioner orörda (u1 = E29, u2 = A2+C17
— u2:s sektion noterade mitt val disk-först). Varje rad MÄTT egenhändigt
2026-09-18 ~13:46–14:05 lokal: live-sonder loopback (3 sidor + 4 API:er),
EGEN motorvalidering med sann exitkod, git/ls/grep/node-räkningar,
pm2-logspaning, /etc/crontab-läsning.

| Mått | Kartan (09-16-passningarna) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| /api/konfluens (B10) | färsk tidsstämpel 09-16T04:44:21Z | **genererad 2026-09-18T11:48:25Z** (egen sond): 10 rader · 10/10 med ≥3 datakällor · fem-källors-fältet komplett (värdegolv/kvalitet/fundamentalVagstart/prisVaglage/divergens) · 2 rader klassade |
| /api/netnet (B11) | färsk tidsstämpel 09-16T04:43:31Z, VOLV-B 330,2 | **genererad 2026-09-18T11:48:35Z**: 25 rader (= universumet fast 25 fortfarande, praktiskt bevis i svaret) · VOLV-B.ST kurs 335,9 — live-flödet lever; sonden refreshade 25 netnet-cachefiler i data/cache (13:48 lokal) |
| Motorvalidering | 107/0/0 (6,9 s, tredje gröna) | **107 PASS / 0 FAIL / 0 SKIP (6,4 s, exit 0 — FJÄRDE dokumenterat gröna; tmp_motor_koll.ts städad av verktyget självt)** |
| Sidstatus | /konfluens /netnet /nyheter 200 | **200 ×3 igen** (egna sonder) |
| Filstabilitet B10/B11/B14 | stabil sedan 09-11 | **orörd sedan 09-16-passningarna** (git-bevis; radtal 493/292/844 exakt kvar) |
| B14 Contabo-cron | "crontab-bevisad men ej KÖRbevisad" | **KÖRBEVIS NEGATIVT — 404 LIVE**: /etc/crontab rad 25 curlar /api/cron/nyheter som svarar 404 (egen sond med crontabens exakta Host-header); rutten har ALDRIG funnits i git-historien (git log --all över sökvägen = tom) medan grannraderna vagscan + portfolj-uppfoljning pekar på rutter SOM FINNS — mönstret rätt, sökvägen fel; scan-rutten heter /api/nyheter/scan sedan 02f7495b (2026-09-03) |
| B14 pm2-logg | "ingen logg (curl >/dev/null)" | **0 'nyheter'-rader i ak1a-out.log(+.1) senaste 2 dygnen** — konsistent med 404 |
| B14 nyhetsflöde | gap 2-varning: "kan tyst bli tom nyhetslista" | **REALISERAT LIVE**: /api/nyheter → ok:true · nyheter:[] · franCache:true · antal:0 (13:50 lokal) och TOMMA svaret disk-cachats (data/cache/analys-nyh_c8f24f66.json, 93 B, 0 poster, cachad 11:50:06Z — 30 min TTL) + routens 5-min-minnescache; SAMTIDIGT cacheades en RIK hämtning 5 minuter tidigare för en annan konfignyckel (analys-nyh_e406a84d.json: 40 nyheter från SVT Ekonomi/Dagens industri/Privata Affärer/Yahoo, senaste publikation 13:36 lokal — organisk trafik, före mina sonder) ⇒ externa flödet lever intermittens men tomma svar cachas tyst; /nyheter-HTML (71 kB, egen sond) bär 0 nyhetstexter = kunden ser viloläget |
| B14 CRON_SECRET | ej satt | **fortfarande 0 namnträffar** i .env + .env.local (namnnivå — värden ALDRIG inlästa) |
| B14 vercel.json | /api/nyheter/scan 08:00 UTC | **raden kvar oförändrad** — men detta är nu ENDRIVNING på den passiva backup-plattformen |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B10 | LEVER 7 → **LEVER 7** | Allt grönt igen (API färskt, 107/0/0 fjärde gången, filer orörda) och inga gap stängda; gap 3 fördjupad med namnkollisionsfyndet (se sektionen) — E33/B14-precedensen |
| B11 | LEVER 6 → **LEVER 6** | Allt grönt oförändrat (25 rader, VOLV-B live, determinismgrön); svit-gapet och 25-listan lever — ingen poängrörelse |
| B14 | LEVER 6 → **LEVER 5** | Prod-drivningen av skannern död (404 sedan raden skrevs — rutten fanns aldrig) + kundsynlig tyst-tom nyhetslista live = dataflödesförsämring av B7-precedensklassen (09-16:s motsvarande nedgång för berika-pipelinen); kunskap tillförd men kapabiliteten sämre än kartan trodde |

Snittscore **7,6/10 OFÖRÄNDRAD i avrundning — 287 poäng / 38 system**
(B14 −1; u2:s A3 +1 samma dag före).

Kö till huvudagenten: (1) **/etc/crontab rad 25 ompekas till
/api/nyheter/scan** (root-ägd yta — dokvågen läser endast; grannmönstret
vagscan/portfolj-uppfoljning bevisar rätt form) ELLER medvetet beslut att
Vercel äger nyhetsscanen (då bör raden tas bort — död kod i drift); (2)
src-spår: tomma flödessvar bör ej disk-cachas 30 min (eller bli larmklass i
vakten) — viloläget är kundsynligt på /nyheter; (3) OrganEvent-belägg:
Supabase-fråga efter organ/nyheter-events avgör om Vercel-scans överhuvudtaget
kör på den passiva plattformen; (4) B10/B13-terminologin nu dokumenterad —
ev. namnbyte av portfolj-forsknings lager3-fält är frivilligt.

KVD: endast data/forskning/SYSTEMKARTAN.md + worklog.md + anspråksfil + detta
sondskript — INGET bygge; src/ orörd (tsc-ej-aktuellt, commit-grinden bär
baslinjen); R2 orörd; data/blogg/ orörd; syskonens yter orörda.

## UPPDATERING 2026-09-18 (dokvåg s9-u1-OMSTART, manifest auto-s9-1789731901131 — E36 mediebiblioteket återdiffad; E29-duplikat avstått)

OMSTARTSBOKFÖRING (ärlig): ursprungs-u1-processen levererade detta manifests
E29-uppdrag KOMPLETT under omstartens fönster — commit 62bb7b85 kl 13:56:47
(SYSTEMKARTAN + worklog; reflog-bevisat) — duplikat avstods enligt spårets
regel; omstartens oberoende korsvalidering (verktyg/_s9u1-e29-atermatning.mjs)
bekräftar samtliga E29-tal (146/147 klara manifest · 68 beslutsposter · pumpor
pm2 online 43 h ↺19, ps pid 1198464 · evighet 614 kontroller · svitgap
oförändrat · CRON_SECRET 0 · kunduppdragsfilerna frånvarande). ANDRA VALET:
E36 — kandidaterna C19/D20/D25/E36/D38 samtliga kodstilla sedan 09-16, men
E36 ensam bar DATA-drift (backup-filerna på disk). Anspråk på disk FÖRE
mätning (auto-s9-1789731901131-u1-ansprak2.md, gitignorerad väg); syskonen
u2 (7b7cff77) och u3 (5b959338) klara och orörda.

| Mått | Kartan (09-16-passningen) | Verkligheten 2026-09-18 (egenmätt) |
|---|---|---|
| media-filer-*.json | "manuell, 2 tillfällen 09-08/09-09, ingen cron" | **6 filer; AUTOMATISK nattlig** sedan s10-u1:s e97aa579 09-16 (användar-crontab "40 2 * * *" → backup-fran-molnet.mjs; första auto-filen 09-17 00:40:03 UTC, därefter 09-18 00:40:02 — variabler-exporterna samma sekund = samma körning) |
| Filernas innehåll | kallade "bucket-förteckning" | **INTE en bucket-förteckning** — exporten listar EVENT-TYPEN media_fil (backup-fran-molnet.mjs:79); antal=0 rader=[] i SAMTLIGA 6 = händelsetrömmen äkta tom sedan 09-08 (mediabibliotek.ts:65 SKRIVER media_fil vid varje uppladdning — ingen uppladdning/radering skett; s10-u3:s "äkta tomma"-klass) |
| Bucket-förteckningens backup | "manuell" (gap 4) | **FINNS EJ** — inget verktyg förtecknar Storage-objekten; det kartan trodde var backup är en tom event-export ⇒ GAP 4 SKÄRPT till DR-risk: bucketen vilar enbart på Supabase-plattformen |
| Svit + kontrakt | 18/18 (påstått 09-16) | **18/18 GRÖN EGEN** (exit 0) + kontrakt A7 REN (SVG-förbud, 2 MB-tak, magic-byte, uuid-nyckel, hermetik) |
| OG-koppling | 0 og-generate i deploy-skriptet; 404 OG-filer i git | **0 träffar återmätt · public/og = 404 trackade i git** (8 bloggbilder på toppnivå + kurs-OG i underkataloger; disk = git, arbetsytan ren) — fortfarande MANUELLT disciplinsteg |
| Kärnfilen | 577 r, oförändrad | **578 r**, senaste commit 7b2666c1 2026-09-07 — fortfarande kodstilla sedan 09-07 |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E36 | LEVER 9 → **LEVER 9** | Gap 4 föll isär i två fynd (automatisk event-export påvisad + bucket-förteckningens FRAÅVARO) men inget gap stängdes eller föll i funktion — E33/B14-precedensen; sviten grön igen, kärnan kodstilla |

Snitt **7,6 / 288 / 38 OFÖRÄNDRAT** (kunskapsdokvåg). Kö till huvudagenten:
(1) bucket-förtecknings-export i nattjobbet (Storage-objektlistan till
data/backups/ — stänger DR-gapet mekaniskt); (2) OG-kopplingen förblir manuell
(0 träffar återmätt; disciplinen bevisad sedan 09-09-leveransen).

## UPPDATERING 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789752906622 — E28 Styrelsemotorn återdiffad; fjärde varvet)

VAL (anspråk data/vakten/auto-s9-1789752906622-s9-u1-ansprak.md på disk
FÖRE mätstart, gitignorerad väg): E28 — enda FLAGGA-systemet som inte är
R2-väntande, senast diffad 09-17 (s9-u3 omgång 10), med mätbar rörelse
(beslutsminnet växte idag). Syskonen oberoende (dagens tidigare ytor:
E29/E36/A2/C17/B10/B11/B14).

| Mått | Kartan (09-17-passningen) | Verkligheten 2026-09-18 (egenmätt ~17:38Z) |
|---|---|---|
| Mötet | "stilla sedan 09-15 07:55 (senaste 05:17 FULL DELEGATION)" | **OFÖRÄNDRAT bekräftat** — STYRELSE-BESLUT.md mtime 2026-09-15 07:55 lokal; senaste mötes-id styrelse-mu27v0zl-lqp458; 3,6 dygn stillhet = fortfarande "inga sammanträden krävts" under full delegation (ej motorfel) |
| Gap 1 (JSON-fallback) | "lever i senaste mötet" | **KVARSTÅR + FÖRDJUPAT** — senaste mötets beslut bär "Automatisk syntes (ordförandens svar kunde ej tolkas som JSON)" OCH 2 av 5 organ ute på tidsgränser (ordförande 50 s, juridik 90 s — "rollen redovisas som ute") = dubbel svagpunkt i SAMMA möte: syntes + rolltidsgränser |
| Koden | styrelse.ts 864 r | **KODSTILLA 3,5 dygn** — senaste commit f2589675 2026-09-15 01:13 (mega g3: audit-megasystemet); API-rutterna senast våg 91 (660cc440); gap 1-kuren (JSON-reparatur/schemavalidation) har ALDRIG påbörjats |
| Ronder | "lever via pumpor-daemonen (min 43, timme%3==1)" | **ÅTERBEVISAD LEVANDE, PUNKTLIG** — 15 senaste loggraderna exakt var 3:e timme (xx:43), senaste 14:43:04Z idag; 17:43Z-ronden lå 6 min i framtiden vid mätningen 17:37:57Z (ärligt: inget gap); pumpor pm2 online ↺19 (E29:s tal håller) |
| Beslutsminnet | 68 poster (rond 51 11:43Z, 4 idag) | **70 poster** — dagsserie 09-13:4 · 09-14:16 · 09-15:19 · 09-16:17 · 09-17:8 · 09-18:6; senaste post 14:47:17Z = 4 min 14 s efter rondsändningen (organet svarar INOM rondfönstret) |
| Rondernas innehåll | ej mätt ("skickad OK"-klass) | **NY FYNDKLASS: RONDerna BESLUTAR** — senaste posten ("ROND 66 [Φ]") är ett fullständigt organbeslut: våg 186 stängd på live-bevis (25133bff ancestor i prod-HEAD + flagga ak1a-v4-sendvag i byggd chunk + rutt 405/401), hälso-GUL diagnostiserad som falslarm (vakten frisk — hälsonäret läser gitignorad katalog), nästa vågar 187/188 bokade ⇒ ROND-VÄGEN levererar den faktiska styrningen; MÖTES-VÄGEN (5 rolls + ordförandesyntes) är den fallbördiga |
| API-ytan | 8 rutter /api/styrelse/** + studio-huvudrutt | **LEVER i prod (egna sonder localhost:3000)**: /api/styrelse/protokoll **200** · /api/styrelse/mote **405** (vägrar GET korrekt — POST äger mötet) · /api/studio/styrelse **401** (vaktad); notering: protokoll/mote bor under /api/styrelse/**, EJ under /api/studio/styrelse/** (sond mot gissad sökväg gav 404 — kartans nyckelfilsrader är korrekta) |
| Svit (testa-styrelse.mjs) | "på disk" (våg 91, 6/6 mock) | **DEV-LÅST + SKRIVANDE** — kräver NODE_ENV=development + admin-devfallback (standardlösenord 'AK1A-2026' i klartext i skriptet; dev-endast), startar EGEN dev-server (npm run dev) och APPEND:AR verkligt protokoll (K6: STYRELSE-BESLUT.md) ⇒ EJ KÖRBAR i prod-fönstret; 8 dagar gammal, mock-transporten har aldrig haft chansen fånga JSON-fallback-klassen; gap 3 (E2E som kräver åtgärder>0) kvarstår |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E28 | FLAGGA 6 → **FLAGGA 6** | Kunskapsdokvåg (E33/B14-precedensen): rondvägen bevisad som det faktiska beslutsorganet + svitens dev-lås + dubbel svagpunkt preciserade — men inget gap stängdes, ingen kur levererades, inget kartpåstående motbevisades |

Snitt **7,6 / 287 / 38 OFÖRÄNDRAT** (E28 rör inga poäng). Kö till
huvudagenten: (1) gap 1-kur i styrelse.ts — ordförande-JSON-reparatur
ELLER strukturell prompt med schemavalidation + retry (kodleveransvåg);
(2) rolltidsgränserna 50/90 s — 2/5 organ ute i senaste mötet antyder att
gränserna är för snäva för produktionssvarstiden; (3) prod-körbar
mötessyntes-sond (autentiserad, icke-protokollskrivande) så fallbördan
upptäcks innan nästa riktiga sammanträde krävs.

## ÖVERSIKT — 38 system

| # | System | Grupp | Läge | Score | Topp-gap |
|---|--------|-------|------|-------|----------|
| A1 | Kursplattformen (396 kurser, quiz, XP, case) | Utbildning | LEVER | 8 | Fullständigt kurs-CMS saknas; kurs-access utan egen testsvit |
| A2 | Lärvägen + läroplanen | Utbildning | LEVER | 7 | Registret 420 (+24/dygn, s5 omg 14+15); synk EGEN GRÖN 420=420=420 · 21 profiler (09-18); kärnan larvag.ts orörd sedan v99; 28 front-B-sonder; regressionssvit för rekommendationsreglerna + E2E-inloggning saknas |
| A3 | AI-Mentorn (33 deterministiska svarslager + modellager) | Utbildning | LEVER | 9 | 38 sviter ALLA GRÖNA 0 FAIL (mätt 09-18; E01 STÄNGD: 408/408 fält-för-fält, rebaken höll genom 398→401→408-vågorna); kedjan 98 monsters/33 motorer; dataset-medianer okopplade; E2E mot levande medlems-API återstår |
| A4 | Daglig träning (dagens pass, veckoplan, kunskapsflöde) | Utbildning | LEVER | 7 | 0 egna sviter; streak/XP (member-local lasStreak) ej validerad — kartens determinism- och vagscan-gap MOTBEVISADE i kod+prod (mätt 09-16) |
| A5 | Gamification (badges 29 troféer, certifikat, topplista) | Utbildning | LEVER | 7 | 0 egna sviter (mätt 09-18); gap 3 ÅTERMÄTT ÖPPEN 09-18: POST utan sessionsvakt + läcker {rank,total} till oautentiserad anropare (topplistan fortfarande tom = inget utnyttjat), GET-fönster 500 händelser; certId kollisionsbart (certifikat.tsx:57); bränslet fruset: quiz 8 223/XP 82 230 oförändrade medan kurserna växte 396→414 |
| A6 | Biblioteken (bokmaster, bokkanon, forskningsbiblioteket) | Utbildning | LEVER | 7 | Verktygskedjan manuell (integrera/fixa/lagg-till-kalla; ingen lint-dörr — gap 1 öppen, mätt 09-18); läspaketkön 36 paket varav 25 utan AKM2-underlag (klass, mätt 09-18); universum 22 vs 11 tickers (2 gemensamma, frusen sedan 09-10) |
| B7 | AKM2-analysmotorn + analysidorna | Analys | LEVER | 8 | Kärnan 156 kontroller grön igen (mätt 09-17); berika-pipelinen stillastående 13 d (0 akm2-cacher; däremot 33 runtime-filer åter i data/cache — netnet/analys lever), AKM3-ensemble 0/22 i prod (AKM2-livlinan 22/22 håller), snapshot-svit env-känslig |
| B8 | AKM3 (regim, kalibrering, ensemble) | Analys | PÅGÅR | 7 | Konstruktion topp (55/55 ×3 återmätningar 09-17 + LÅST grind ΔΦ=0, hash-kedjor); men kalibreringen ENBART Vercel-cron-driven (nästa molnrond 2026-10-02; Contabo-crontab saknar fortfarande raden, mätt 09-17), regimen FROSEN på genesis 09-03 (14 d; genesis-talen lever live i /api/forskningslage), ensemble-vy 0/22; n_eff-målet 8–12 kvartal bort |
| B9 | Vågsystemet AK1TS (vagfundament, vagkon, vagscan) | Analys | LEVER | 8 | Skanning dagligen färsk (05:05Z mätt); DUBBEL cron-drivning (Vercel 05:00Z + /etc/crontab 06:30 lokal, mätt 09-16 — användar-crontab tom gav syskonet fel källa); valideringsrapport 12 d gammal; träff-% osynlig publikt |
| B10 | Konfluensradarn | Analys | LEVER | 7 | Fem-källors-logiken LEVER live (API-sond färsk 09-18: 10 rader, 10/10 ≥3 källor; motorvalidering 107/0/0 fjärde gröna); kvar: 0 egen svit, historik/utfall lagras ej; kopplingen till B13 fördjupad 09-18: 0 import MEN namnkollision — portfolj-forsknings eget "konfluens"-begrepp (teorikonsensus per horisont) är ett annat mått än radarns datakällkonsensus |
| B11 | Net-net-skannern | Analys | LEVER | 6 | Determinism-grönt stabilt (107/0/0 egen körning 09-18 + /api/netnet färsk 09-18: 25 rader, VOLV-B 335,9 — live-flödet lever); universum fast 25; egen testsvit saknas fortfarande |
| B12 | Superanalysen + AKM1-kalkylatorn | Analys | LEVER | 7 | Kärnprofilen svit-testad men klientfilen 0 sviter (mätt 09-18: lever); FOMO-kuren live i prod (chunk-bevis 09-18); ytan UTANFÖR vaktens FALLBACK_SIDOR — rutinmäts ej (nytt, mätt) |
| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Sviter 32/0 + 50/0 gröna (egen 09-17); korstabell-grund frusen 09-10 (100 r) mot bolagsunivers 153 — glidningen 53 bolag; member/portfolio utan sessionsvakt; universumet matar numera A3:s portföljlager |
| B14 | Nyheter + marknadsdata | Analys | LEVER | 5 | 0 sviter; "dubbel drivning" MOTBEVISAD 09-18: Contabo-cronens mål /api/cron/nyheter = 404 (rutten fanns aldrig i git-historien — scan heter /api/nyheter/scan) ⇒ enda drivning Vercel-cron på passiv backup; gap 2 REALISERAT live: tyst tom nyhetslista (ok:true + 0 nyheter, tomt svar disk-cachat 30 min) medan rik hämtning (40 nyheter) cacheats minuterna före; CRON_SECRET ej satt |
| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B STÄNGT (A består, 09-07); B2-knappen lever metodbevakad (GET 405, ej 404 — egen sond 09-18); kön 199 filer (rot 54 · m9-ko 7 · granskning 89 · kvartal 49; +24/dygn) med FÖRNYAD kundvy (GRKO 05:22Z); 55 publicerade orörda (R2); kvar: B2-E2E (kundens knapp), OG default tills deploy |
| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp lever (v82); kön 175 filer (+51/dygn: rot 48 · m9-ko 7 · granskning 77 · kvartal 43, mätt 09-17) med sammanställningen FÖRNYAD 16:58 + 3 oberoende kontrollgranskningar/dygn (maskinella paket); flaskhals = publiceringsuttaget (55 frysta, kundens klick R2); schemalagd re-run saknas |
| C17 | Dataset-citeringsmagneter | Innehåll | LEVER | 9 | Universum 177 (10 branscher) + landaspekt danmark (09-18); 52 Kön-filer men /kvartalsdata-src kvarstår; aspekt-testsviten TRASIG tredje passningen (importbro saknas) |
| C18 | SEO/schema/llms.txt | Innehåll | LEVER | 9 | G1-slutverifikation (Google rich-results live) återstår |
| C19 | Trafik, spår & konvertering | Innehåll | LEVER | 7 | 0 sviter + 0 alarm-trösklar (mätt 09-16); GDPR-gatingen KODAD för trafik-rapportören men PageViewBeacon sänder före samtycke (mätt 09-16 — spår till Supabase + sessions-localStorage före varje val, mot kakmodalens eget 2022:482-citat); P6 även koddokumenterad |
| D20 | Inloggning & konto (L1) | Medlem | LEVER | 8 | Glömt-lösenord-flödet LEVER (recover + neutral talkart + egen rate-limit, mätt 09-16); verifiering PÅ (ej_bekraftad-gren); kvar: E2E-svit + glomt-grenen otäckt av sviten |
| D21 | Medlemsdata & progress (molnet) | Medlem | LEVER | 8 | GDPR-export/radering saknas i UI (mätt 09-16); replay-skyddet MOTBEVISAT (importtak + engångs-import, kodat sedan våg 87); 4 rutter ALLA vaktade (mätt 09-16); sviter 13/13 + 17/17 grön egen mätning |
| D22 | Betalning & prenumerationsstomme | Medlem | **VÄNTAR** | 5 | Ingen betalmotor alls (PSP-namn endast R2-ordlista i styrelsemotorn, mätt 09-17); intention-leden starkare än kartan (system_event + admin-vy + rate-limit, inget brev); kundens 8 beslut; intentioner bor i E33:s flaggade tabell |
| D23 | Prisstegen (portfölj-tier) | Medlem | VÄNTAR (flagga) | 7 | NEXT_PUBLIC_TIER_AKTIV i ingen .env (mätt 09-17); grinden MÄTT I PROD (robots/sitemap = 0 tier-URL:er); väntar kundens prisbeslut; speglar en/ar saknas; aktivering kräver ombygge |
| D24 | Fas 2/3-access | Medlem | LEVER | 8 | Fas-set 18+24 EXAKTA i kod (mätt 09-16, underlag 369 kurser); aktivering EN medlem/anrop men sido-kön starkare än kartan (system_events + VBOUT-lead); elevstatus visas — ansökningsutfall saknas; cert-verifiering saknas; rate-limit i ansökningsrutten saknas (nytt, mätt) |
| D25 | Referral + e-post + notiser | Medlem | LEVER | 6 | Brev-leverantör OKONFIGURERAD (mätt 09-16: 0 env-variabler + /etc/crontab saknar email-raden = inga brev kan skickas från prod); VBOUT-lead-leden SATT (saknades i kartan); validering + rate-limit kodade (400 mätt i prod); notis-tak 100 ej 50; referral-adminvy delvis (antal, ej identitet — GDPR); 0 sviter |
| D38 | Medlemsnavet — Min Sida-portalen (AnalysNavet, KursNavet, PortfoljNavet, bevakning) | Medlem | LEVER | 8 | Inga egna E2E-tester (mätt 09-16); pass.namn-API-texter fortfarande svenska i alla grenar (mätt); förhandsfyllnad lever ej; gäst-flödet enklare; prod /min-sida 200 |
| E26 | Admin-panelen ("WordPress-drömmen") | Styrning | LEVER | 8 | Mobil-treskiktsdefekten (2px-tabrad + ActivityRow + ScrollArea-svällning) UPPTÄCKT OCH KURERAD 09-17/18, slutmätt 0/88 GRÖN med testpost aktiv (mätt 09-18); godkännandehärdningen KODAD+EGENLÄST 09-18 (o64: tak EFTER auth — publicera 6/min · val-ytan 20/min POST · GET takfri · 429 Retry-After 60; audit-åtgärd publicera-avvisad, 0 driftfall = R2-knappen kundens); audit-loggen 336 540 B / 1 281 r; sviten 14/14 + requireAdmin 401 live ×2 (egen mätning 09-18); FLYTTKLAR-mätetalet DÖTT (63→0, kö-omorganisationen), juridik-FP 17→22; kvar: manuell spegling, publicera-E2E, IP-block |
| E27 | Studio (Z-portalen) | Styrning | LEVER | 9 | Paritetstak 39/91 (binär 3.11.2-22); -32031 efter omstart; skal-kvot-häng = process-kur i AGENTS.md; usage-v4-panelen LEVER (v169); kommandobussen TRE vågor längre efter omgång 10 (mätt 09-18): v181 pauseGoal/resumeGoal + v182 KÖ-SYSTEMET (gap 31+32) + v184 resolveInteraction (post 28) — skickaV4InteraktionSvar kodbevisad på tre ställen (interface+AppServer+Mock); /studio 200 + stream 401 + kommando 401/405 live |
| E28 | Styrelsemotorn (AI-styrelsen) | Styrning | **FLAGGA** | 6 | Mötet stilla sedan 09-15 05:17 (3,6 dygn; FULL DELEGATION — inga sammanträden krävts, ej motorfel); ROND-VÄGEN bevisad som det faktiska beslutsorganet (mätt 09-18: beslutsminne 70 poster, senaste "ROND 66 [Φ]" 14:47Z stänger våg 186 på live-bevis + falslarmdiagnos; ronder var 3:e timme punktliga, organet svarar 4 min in i rondfönstret); gap 1 öppet och FÖRDJUPAT: JSON-fallback + 2/5 organ ute på tidsgränser (50/90 s) i senaste mötet, koden stilla sedan 09-15 (f2589675); API lever (protokoll 200 · mote 405 · studio 401); sviten dev-låst (startar egen dev-server + skriver protokoll — ej körbar i prod-fönstret) |
| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik 146 klara manifest av 147 (mätt 09-18 ~14:00; +30 sedan 09-17 kväll, 22 startade idag) · 475 utdataloggar · beslutsminne 68 poster (rond 51 11:43:03Z, 4 idag) · pumpor 42 h ↺19 + FABRIKSPROCESSEN FÅNGAD LEVANDE i mätfönstret (pid 2140015) · evighetsmotorn 614 kontroller (11:48:03Z) + målet återarmat 11:41Z · kunduppdragsfilerna fortsatt frånvarande (ingen order i flykt) · svitgapet oförändrat (fabrik/evighet/uppdrag 0) · CRON_SECRET 0 env · KOLLISIONSKLASSEN ÅTERKOM 09-18 i ny skepnad (s8-fönstret: o67-trippelkollision + git-index-kollision, ärligt bokförd med disknotiser) = bevisad i 3 fönster/3 skepnader, kuren disciplin ej mekanism — MEN disk-först-disciplinen bevisad i eget fönster (u2 läste anspråket, valde A2+C17, 0 kollision); kur-kö: fabrikinstruktion med isolerade nummerserier + explicita paths per commit |
| E30 | B2B / AK1A PRO | Styrning | INAKTIV | 6 | Väntar jurist (R2); grind-grön i egen körning (sann exit 0, mätt 09-17); demoklient-G1 fortfarande röd (16/1); kvalitetsvaktens YTA-regel täcker (huvud)/pro/** sedan 09-16 (arProYta-kuren) |
| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | MÖS grönt tredje gången (107/0/0 egen 09-17); ordlista 2 154→2 745 r; kön 320 låst; tier-speglar preciserade (prenumeration/medlemskap finns, portfölj-ytorna saknas); I1-audit opåbörjad; rapportnamn fast 2026-09-02 |
| E32 | Guldkällorna (variabler + siffror) | Grund | LEVER | 8 | 320 poster i översättnings-fallback-kön; speglingsfönster manuell |
| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | LEVER | 8 | "PROD-TÖMT 09-16" MOTBEVISAT (mätt 09-17): 163 039 rader levande i appens projekt (aufr) — 13:46-mätningen föll i tväprojektfällan (rkaq-dumpar saknar tabellen, kedja 6); arkiv-cron grön OBEVAKAT 02:40, 0 dublett-id; kvar: ALTER V1 på disk/HEAD (v2 endast i index-provsprotokollet), composite-index ej installerat, schema-drift, inventory 25 d; kedja 2 = enda system_events-kopian |
| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 9 | Rot-gapet STÄNGT (omgång 9: artefaktverifiering i deploy+kraschvakt); 09-18: patch-kön SLUTLEVERERAD (kön `[]` + ok-kvitton next/eslint 16.3.5 med hela beviskedjan, 6 spurious-rader arkiverade — falsk-grund-stängningen kurad; lasPatchKo läser tom fil); DRIFTSBOKEN 2px-rättad (150 982 B 02:22); prod 200 ×4 egen (/, /kurser, /blogg, /studio); 09-18 DAG: deploy prod@e5eca448 05:29:45Z HTTPS-200-kvitto + BUILD_ID BBrkvx9 + next-server 16.3.5 live (egna mätningar) + nattens S10-födelsebevisövningar (blad 8 i födelsetimmen, pump-noll STÄNGD, WAL-platå) + driftminnet maskinellt i feljakt-ledgern (o65: 69 salvor, bygg-OOM ×3); pm2 online; kvar: ISR 12/44 (fem nätter fast), hybrid-sync, Storage-restore, MIGRERING-NY-DATOR.md lösenord i klartext i repot, REST idempotensgrind (nothing-to-commit = ok) åt prod-synkägaren |
| E35 | Kvalitetssystemet (vakten, motorvalidering, verktygsbälte) | Grund | LEVER | 9 | 12 kontroller (KONTROLL 12 SSR-livssonden 09-18: o47:s blindhet botad — sentinellrutter provar LEVANDE SSR i varje vaktkörning) + 12/12 PASS · 0 manuella · GRÖN egen vaktkörning 09-18 05:39Z; feljakt-stormtriagen LEVER (o65: backlog 245/245 bedömda, stormar-grind allt-eller-inget, svit 20/20 egen); tmp-läckeklassen STÄNGD i BÅDA ändarna (o44+s8-u2, svit 15/15+12/12); artefakt-klassen av gap 3 stoppad i deployvägen; kvar: aggregator (90 sviter = provtagning, mätt 09-18), motorregister fruset 09-03, vaktrapports-stopp i deploy (mätt: 0 träffar i prod-synk) |
| E36 | Mediebiblioteket | Grund | LEVER | 9 | 18/18 GRÖN egen (09-18); OG manuellt kvar (0 träffar återmätt, public/og 404 i git); media-EVENT-exporten cronad 02:40 (s10-u1) men antal=0 ×6 OCH bucket-förteckningen backas av INGEN (gap skärpt) |
| E37 | Navigering & app-yta (palett, sökindex, PWA, menyer) | Grund | LEVER | 8 | Prestandaserien o45–o62 LEVER i prod (tolv kurer med EFTER-bevis: / _rsc 5→3 · requests 45→38 · transfer −42,3 KiB · /logga-in ×2 borta · PalettVakt-defern ur TBT-fönstret; band / P61 · TBT 675, /kurser TBT 1 074) + SPA-/StudioChat-koddelning (o27+o31) + mobil-mätverktyget METROLOGISKT HÄRDAT (o62: 19 fantomer bevisade, 52-px-ronden SLUT för barnägda ytor — 6 fynd = ShortSeller-knappens dokumenterade 44×44-undantag, 0 zoomfällor); kvar: o63-köposten (herons TREDJE länk home.slutTitta, 36,0 KiB spill), 2 designbeslut (prosa-länkar + 44-korset = huvudagent), inga egna sviter, språkresolvens-CLS intermittent, sökindex-cadans |

Snittscore: **7,6/10** (287 poäng / 38 system; B14 −1 vid dokvåg s9-u3 09-18 — Contabo-cronens mål 404 (rutten fanns aldrig) + tyst tom nyhetslista live; A3 +1 vid dokvåg s9-u2 09-18 — E01-kontraktet stängt grönt 408/408 och 38/38 sviter röda-fria; E33 +1 vid dokvåg s9-u3 3/3 09-17 — "prod-tömningen" motbevisad, FLAGGA hävs; E35 +1 vid omgång 11:s återdiff 09-17 — tmp-läckeklassen mekaniskt död i båda ändar, levande bevisad; E34 +1 vid omgång 9:s återdiff (artefaktverifieringsgrinden stänger incidentens rot-gap); E35/E29/E30/E37/A3/E34 +1 vid
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
u3 omgång 11 (09-17, andra varvet) återdiffade B7/B8 utan poängrörelser — B7 bekräftad med 156 gröna + 22/22-livlina (metodnotis: URL-transform `_`→`.` i bibliotekssvep, annars 10 falska 404:or) men berika 13 d + cache-nyansen 33 runtime-filer, B8 fruset kvar (loggar 1+1 rad, regimen genesis-tal live i 14 d, ensemble 0/22, nästa molnrond 10-02, sviten 55/55 ×3 + instabilitetsnotis); A3 korsvaliderat mot u2 omgång 8 med identiska oberoende tal (24 lager/80 monsters/E01 358/390); u2 omgång 9 (09-17) diffade D22/D23 read-only (R2-ytorna, deras sektion). u3 omgång 12 (09-17, tredje varvet — de mest mogna 09-15-systemen) återdiffade A1/C17/C18 utan poängrörelser: A1 396 kurser (larvag GRÖN egen körning) + DRIFTFYND /kurser 500 (chunk _1tjfn0y saknas, patch-köns felgren igen, läkning RAM-blockerad), C17 kvartalskö 40 filer + gap 0 oförändrad + v98 GRÖN + /dataset 500, C18 sitemap 2 239 + sok-index färskt 396 + schemasvit UNDERKÄNT AV DRIFT. s9-u1 omgång 12 (09-17, andra varvet) återdiffade E26 utan poängrörelse — audit-loggen 3,8× aktivare (1 008 rader/301 aktörer/143 deploy = fabrikens faktiska driftlogg), sviten 14/14 grön igen, requireAdmin 401 live på båda ytor, /admin-500 = o47-driftklassen (API oskadat), juridik-FP 8→17 + FLYTTKLAR 21→63 (gap 5 brittare), 25 rutter (räknekorrigering, 0 nya i git sedan 09-15); R2-knappen orörd som väntat.
s9-u2 omgång 9 (09-17) diffade D22/D23 utan poängrörelser — R2-ytorna mätta
read-only (inget pris, ingen flagga, inga env-värden): D22:s intention-led
starkare än kartan (system_event + admin-vy) + nytt gap 4 (intentioner i
E33:s flaggade tabell), D23:s grind bevisad i prod via robots/sitemap;
därmed är ALLA 38 system diffade minst en gång — fullständig cykel även
för R2-ytorna.
Sämst: betalning (5). Bäst: Studio, Dataset, SEO,
Mediebibliotek (9).

---

# A. UTBILDNINGENS KÄRNA

## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-15 (s9-u3): talen rättade mot guldkällan — 337 kurser,
8 223 quizfrågor (82 230 XP), fas2 18 / fas3 24 (data/siffror.json,
regenererad 2026-09-15 av rakna-siffror efter s5-vågens fyra kurser:
balansräkning, DuPont, soliditet/räntetäckning + V-spåret 20/20 i
kurskartan; larvag-synk GRÖN 337=337=337). Score oförändrat — samma
kontraktsbrott kvarstår i gaplistan. Senare samma dag (s9-u1:4-mätning):
registerrebake 337 → **343 kurser** (siffror.json + commit 570c51ee +
E01-äkthetstestet) — talen i Vad-raden gäller 343.* Ännu senare (s9-u2 2/3-mätning 2026-09-16): **352 kurser** (mx-vågorna kväll 09-15; quiz 8 223 oförändrad — nya kurser bär inga quiz). Senast (s9-u2 dokvåg 2026-09-17): **381 kurser** (s5:s kvällsvåg 09-16, 896c91ca; quiz 8 223 fortfarande oförändrad — larvag-synk GRÖN 381=381=381 · 0 fantomer, mätt). Senare samma morgon (s9-u2 omgång 8, 2026-09-17): **390 kurser** (s5:s morgonvåg; larvag-synk EGEN körning GRÖN 390=390=390 · 0 fantomer · 21 profiler; quiz 8 223 fortfarande oförändrat).

*Återdiff 2026-09-17 (s9-u3 omgång 12): talen 390 → **396 kurser** (siffror.json
uppdaterad 2026-09-17 · deep-courses.json 396 nycklar/18,8 MB mtime 11:39 idag ·
larvag-synk EGEN körning GRÖN: register 396 = karta 396 = konstant 396, 21
profiler, 0 fantomer, exit 0); quiz 8 223 / XP 82 230 / fas-set 18+24 bekräftade
oförändrade i guldkällan (data/bokmaster/ bär 105 filer mot siffrorns 103 —
kosmetisk diskrepans, köpost); s5-spåret levererar vidare (idag pe-03 + mt-04).
DRIFTFYND I FÖNSTRET: /kurser och /kurser/[slug] svarar HTTP 500 i prod (localhost
+ https, egna sonder ~12:0xZ) — ChunkLoadError: server/chunks/ssr/_1tjfn0y._.js
SAKNAS på disk (pm2-loggen 12:00Z); rot: patch-köns bygge 11:39Z föll utan ny kod
och felgrenen "revert hoppas" lämnade .next halvtrasigt (prod-synk.loggen —
o47:s felgren ÅTER, r58-kuren greppte ej) medan läkningen är RAM-blockerad
(prod-synken 11:57Z VÄNTAR-RAM 872<2200, agentfabriken håller minnet) — ytan
onåbar för kunden tills synkens nästa bygge landar; statiskt / 200. Gap 1
oförändrat (kurs-access-testsvit: 0 träffar i verktyg/, mätt).*

- **Vad:** Plattformens ryggrad: 396 kurser × 3 språk (deep-courses.json,
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

## A2. Lärvägen + läroplanen — LEVER — 7/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2, manifest auto-s9-1789731901131):
ÅTERDIFFAD efter s5-spårets BÅDA manifestomgångar samma dag — registret
396 → **420 kurser** (+24 på ett dygn; omg 14: bk-04, rp-03, ma-05, ek-05,
od-05 · omg 15: bk-05, pe-04, ib-02, vr-05, tx-05, roic-03). ALLT EGENMÄTT
09-18: deep-courses.json 420 poster · LARVAG_ANTAL_KURSER = 420
(larvag-karta.ts:459, 459 r, sista commit 729ad5e7) · larvag.ts 458 r
OFÖRÄNDRAD sedan våg 99 (git 2a566cfd 2026-09-11 — kärnan orörd genom hela
tillväxten) · larvag-synk EGEN KÖRNING GRÖN 420=420=420 · 21 profiler ·
0 fantomer (exit 0) · /laroplan 200 på HTTPS + loopback · /api/larvag 200 ·
LarvagKort lever (min-sida.tsx:857) · front-B-sonderna 16 → 28. Gap 1 lever
(ingen egen regressionssvit, grep 0 träffar) och gap 3 lever. Score LEVER 7
kvar — kvantitativ tillväxt utan gap-rörelse (E33/B14-precedensen).*

*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD efter s5-spårets
lärvägsdjup-vågor — registret 352 → 396 kurser (+44) sedan 09-16-passningen;
slutrebasten (9e3bbf76, "358→396") stängde E01-registergapet atomärt (karta +
sökindex + speglar + siffror + llms i EN commit). ALLT EGENMÄTT 09-17:
larvag-karta.ts 435 r med LARVAG_ANTAL_KURSER = 396 i koden; larvag.ts 458 r
OFÖRÄNDRAD sedan våg 99 (deterministiska kärnan orörd genom hela tillväxten);
larvag-synk EGEN KÖRNING GRÖN 396=396=396 · 21 profilkurser · 0 fantomer;
LarvagKort lever på min-sida (rad 857); /laroplan 200 + /api/larvag 200
(loopback). FRONT B-leveransbevisen växt till 16 frontb-skript (senaste
_s5u3o11) men gap 1 lever: ingen EGEN regressionssvit för raknaLarvag-reglerna
(varför-rads-prioriteten kan regressera tyst); gap 3 lever (E2E med levande
inloggning overifierad). Score LEVER 7 kvar — kvantitativ tillväxt, kärnan
orörd, gapen oförändrade (E33/B14-precedensen).*

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

## A3. AI-Mentorn — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9, tredje varvet):
E01 STÄNGT + hela sviten röda-fri — 38 sviter ALLA GRÖNA 0 FAIL (sanna
exitkoder), 33 motorer/98 monsters, register 408=408=408 — se diff-tabellen
i UPPDATERING-sektionen.*

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
  maskintestad). Sedan våg 158 + spår 6:s omgångar: 98 deterministiska
  frågemonster i 33 lager (09-18) (makro ?? extra ?? bas ?? nästa ?? kapitalmekanik
  ?? sektor ?? case ?? praktik ?? portfoljgrund ?? agande ?? redovisningsdjup
  ?? djup ?? historia ?? lonsamhetsdjup ?? tsdjup ?? skattedjup ??
  beteendedjup ?? riskdjup — DCF-inre värde, investmentbolags-NAV, options,
  ränta, inflation, kapitalstruktur, organisk vs förvärvad tillväxt,
  rapportläsning, nyckeltal, utdelning, lärväg, beteende, skatt,
  skuldfällan, svarta svanar m.m.) + medlemens modellager /api/mentor/fraga
  (generateText, dagstak 429, felväg 503 + fallback, rollback) + Z.ai
  GLM-läge i den publika rutten — svaren källmärks med kurslänkar ur det
  inbakade registret (408 kurser = källan, E01 grön 09-18), utan
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
- **Observation:** Testtäckningen är kodbasens bredaste: 38 sviter ALLA GRÖNA
  vid 2026-09-18-mätningen (0 FAIL, sanna exitkoder; bassviten 555 PASS med
  E01 GRÖN 408/408; kedjan 70 PASS/98 monsters/33 motorer; kanoniska/felstavade/omatchade frågor,
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
  vägar (assistent.ts) har fortfarande 0 testsviter (mätt); (5)~~NY 09-16: registerrebaken BRÖTS~~ STÄNGD 09-18: E01
  GRÖN — 408 kurser fält-för-fält identiska med getCourses(); rebaken höll
  genom två efterföljande kursvågor (398→401→408, atomär --baka i
  s5/s6-leveranserna); larvag-synk grön 408=408=408 · 21 profiler · 0 fantomer.

## A4. Daglig träning — LEVER — 7/10 *(uppdaterad 2026-09-17)*

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

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 10, återdiff): rotationen
OBEROENDE verifierad OFFLINE — FNV-1a-datumhashen (salt 1) ombereknad ur
route.ts:s ROTATION ger 2026-09-16 → SHB-B.ST = EXAKT passningens
prod-dubbelanrop (algoritm + sanning bevisad utan nät) och 2026-09-17 →
SAND.ST (rotationen lever vidare; prod-sond blockerad av dagens
patch-byggfönster — se UPPDATERING-sektionen). NY KOPPLING BOKFÖRD:
ROTATION är samma 12-bolags AKM1-universum som vagscan-cronen (B9) —
dagens-pass-gissningen tränar i det universum vågkartan skannar dagligen.
Alla 8 nyckelfiler orörda sedan 09-16 (git log); gap 1 lever: fortfarande
0 sviter för streak/XP (lasStreak i member-local.ts:69 orörd). Score
7 kvar.*

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

## A5. Gamification — LEVER — 7/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789709700201 — A5 återdiffad, andra varvet): HELT KODSTILLA men RÖRELSE I BRÄNSLET. Samtliga A5-filer orörda i git sedan 09-16 (api/topplista 129 r · certifikat.tsx 242 r · topplista.tsx 136 r · badg-panel.tsx 235 r; badges.ts 326 r orörd sedan 02c0920d 09-01) — 0 commits, mätt. /badges /certifikat /topplista 200 på loopback+HTTPS (egna sonder). Topplistan FORTFARARDE TOM (GET {"topplista":[],"antal":0} — 0 xp_sync i fönstret) ⇒ gap 3 lever med "inget utnyttjat" intakt; sessionsvakten ÅTERVERIFIERAD SAKNAS I KOD (auth-grep 0 träffar; e-post ur klient-body rad 34; caps orörda rad 38–40: xp ≤ 10 M · nivå ≤ 100 · kurser ≤ 1 000). TVÅ NYA PRECISIONER I GAP 3: (a) POST-svaret läcker {rank,total} till oautentiserad anropare (rad 63–83) — vem som helst kan posta en främmande e-post och läsa av dennas placering, samma klass som impersonationen; (b) GET aggregerar ENBART senaste 500 xp_sync-händelserna (rad 97) — en elev som synkat längre bak faller AV listan helt. BRÄNSLEFYND: siffror.json (uppdaterad 09-18 06:01 av s5-vågorna) bär 414 kurser (+18 sedan A1:s 09-17-mätning 396) men quiz 8 223 · quizXp 82 230 OFÖRÄNDADE — nya kurser (tx-04, ma-05, ek-05, od-05 …) bär INGA quiz: topplistens bränsle fruset medan kursflödet växer (spegelbild av A6:s underlagsfynd). Badges preciserade 29 troféer (28 flaggskepp f3a56fc9 + Ritualstartad 02c0920d, båda 09-01). Gap 1 lever: 0 egna sviter (ingen badge/topplista/certifikat-svit i verktyg/, mätt). certId orörd kollisionsbar (certifikat.tsx:57). Score 7 orörd — kodstasis + skärpta precisioner utan stängning (B13-precedensen). Sidofynd åt A1:s nästa dokvåg: ÖVERSIKT-radernas kurstal 396 föråldrat (414 i siffror+deep-courses, mätt 09-18 — A1:s yta, lämnad orörd här).*

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
- **GAP:** (1) badge-reglerna (trösklar) saknar test (mätt 09-18: 0 egna
  sviter i verktyg/); (2) certifikatens unikhet BESVARAD 09-16, orörd 09-18:
  certId kollisionsbart (certifikat.tsx:57, AK1A-år-XP utan medlemshash, inget
  register) — verifierbarhet saknas; (3) SKÄRPT 09-16, ÅTERMÄTT ÖPPEN 09-18:
  xp_sync-POST utan sessionsvakt på publik rutt — impersonationsbar tills vakt
  finns (kö till huvudagenten; topplistan fortfarande tom = inget utnyttjat);
  09-18-tillägg: POST-svaret läcker {rank,total} till oautentiserad anropare
  och GET aggregerar endast senaste 500 händelserna (äldre synkar faller av).

## A6. Biblioteken — LEVER — 7/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1 omgång 14): läspaketkön TREDUBLAD på två dygn — 22→46 filer (36 sa-laser-paket + 10 kalendrar; s1/s4-vågorna levererade JNJ, Samsung, Novo, SAP, AT&T, BSX, Nike m.fl.) — medan underlagsbasen står stilla: data/analyses 11 och forskningsbiblioteket 22 tickers, båda oförändrade sedan 09-10 (mtimes + git log). Per-paket-mätning 09-18 med sidans eget analysfabrik-v1-kontrakt + explicita ticker-tabeller: 11 paket med AKM2-analysbankunderlag (en-till-en med bankens 11 — fortfarande heltäckande där), 7 med forskningsbibliotekets AKM1-vy (AT&T, BSX, Nike, Norsk Hydro, Novo Nordisk, NP3, SAP), 18 UTAN såväl AKM2- som AKM1-underlag — gap 4 är inte längre Nordeas enkelfall utan en KLASS: 25 av 36 paket saknar analysbankunderlag. Bokmaster 105 JSON på disk mot siffrorns 103 (rebaken = A1:s bokförda kosmetik-köpost); bokkanon 102 böcker orörd. Gap 1 (lint-dörr) fortfarande öppen: verktyg/ bär endast integrera-bokmaster.mjs, pre-commit-kroken 0 bokmaster-referenser (grep). /bibliotek /forskningsbiblioteket /kallor 200 loopback + HTTPS (egna sonder). Score 7 orörd — yttillväxt + skärpt gap utan stängning (B13-precedensen). Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): läspaketserien FULLBORDAD i
granskningskön — samtliga 11 bolag i data/analyses har kvartalsläspaket (en-till-
en mappat, node-mätt) + Nordea som tolfte paket utan AKM2-analysunderlag; totalt
22 Kön-filer (12 paket + 10 branschkalendrar). Universumet preciserat: forsknings-
biblioteket 22 tickers mot analysbanken 11 med endast 2 gemensamma (HM-B,
INDU-C) — gap 2 är en universum-fråga, inte en synk-fråga. Verktygskedjan
oförändrad manuell (lagg-till-KALLA är verktygets rätta namn). 0 egna sviter.
Score 7 kvar — yttillväxt utan gap-stängning. Se diff-tabellen i UPPDATERING
2026-09-16 högt upp i filen.*

- **Vad:** Bokmastern (105 JSON på disk 09-18 — siffror.json bär 103, rebaken A1:s köpost), bokkanon (102 böcker),
  forskningsbiblioteket (per-ticker-analysunderlag), källor & upphovsrätt.
- **Nyckelfiler:** data/bokmaster/*.json, data/bokkanon.json,
  src/app/(huvud)/{bibliotek,forskningsbiblioteket,kallor},
  src/components/ak1a/bibliotek.tsx, verktyg/{integrera-bokmaster,
  fixa-tabeller,lagg-till-kalla}.mjs, data/rapporter/
  upphovsrattsgranskning-2026-09-01.md.
- **Observation:** Kvalitetsvakten PASSAR åäö-bortfall + kursdata-konsistens
  för bokmaster (0 fel). Upphovsrättsgranskning dokumenterad. Verktygskedjan
  (validera→integrera→källa-attribution via lagg-till-kalla) existerar men är manuell.
- **GAP:** (1) verktygskedjan saknar fortfarande (mätt 09-18) ett enda kommando (lint-dörr) som blockerar ogiltig bokmaster-JSON före commit — verktyg/ bär endast integrera-bokmaster.mjs, pre-commit-kroken 0 bokmaster-referenser; (2) universum-fråga (mätt 2026-09-16, återmätt 09-18 oförändrad): forskningsbiblioteket 22 tickers mot analysbanken (B7:s data/analyses) 11 med endast 2 gemensamma (HM-B, INDU-C) — katalogen frusen sedan 09-10, 0 filer förkastade av analysfabrik-v1-kontraktet; synkningen är sekundär mot universumbeslutet; (3) källförteckning per kurs maskinläsbar endast delvis; (4) SKÄRPT 09-16→09-18: paket utan AKM2-underlag är en KLASS, inte Nordeas enkelfall — 25 av 36 läspaket saknar analysbankunderlag, 18 av dem även forskningsbiblioteks-AKM1 (per-paket mätt 09-18 mot båda katalogerna).

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

*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 11, återdiff): läget
bekräftat med egna mätbevis — 156 kontroller gröna igen (kärna 25/25 ·
dynamik 55/55 · moduler 64/64 · snapshot 12/12 i ren env) + motorvalidering
107/0/0 (6,7 s) + AKM2-livlinan 22/22 i eget full-svep mot localhost
(metodnotis: filnamnets sista `_` är `.` i URL:en — svep utan transform
gav 12/22 + tio 404:or = mätartefakt, ej regression). Cache-bilden
NYANSERAD: data/cache bär 33 runtime-skrivna filer (netnet 25 · analys 7,
färskast analys-nyh 09-17 06:17 · vagfundament 1) mot "7 sporadiska" vid
senaste diffen — on-demand-skrivningarna lever, men akm1/akm2/akm3/
fundamental fortfarande 0 och berika-pipelinen stillastående 13 dagar
(4b98cd15 09-04). Env-läckan lever (11/12 med ärvt env, egen körning).
Score 8 kvar.*

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

*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 11, återdiff): driftbilden
oförändrat frusen — kalibrering-loggen 1 rad (09-04), regime-loggen 1 rad
(09-03), /api/forskningslage live-sondad bär EXAKT genesis-talen (7 gröna
av 100 · 17 röda · "magert" — regimen frusen i 14 dagar, åldern osynlig för
eleven), ensemble 0/22 (eget svep), Contabo-crontaberna (användare + /etc)
bär fortfarande INGEN akm3-kalibrering/vagvalidering; vercel.json: nästa
molnrond 2026-10-02. Sviten 55/55 ×3 återmätningar MEN ett engångsfail i
första körningen (parallell node-körning i dokvågens eget fönster:
stacktrace + avslutskod 1, ej reproducerbar isolerat; 0 tmp-läckor i
roten) — instabilitetsnotis. Vagvalideringsrapporten 13 dagar gammal
(mtime 09-10) — B9-gränsfyndet åldras vidare. Score 7 kvar, PÅGÅR kvar.*

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
  55/55 (mätt 2026-09-16; återmätt 09-17 ×3 grönt med en
  instabilitetsnotis — se UPPDATERING-sektionen). Kalibreringens indata är Bana B (system_events
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

## B9. Vågsystemet AK1TS — LEVER — 8/10 *(uppdaterad 2026-09-17)*

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

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 10, återdiff): KARTFEL RÄTTAT
+ SKÄRPNING. Kontinuitet bevisad i arkivet: system-events-full-2026-09-16
.json.gz (export 05:24Z) bär vagscan-raden 05:05:24Z "Vågkarta: 206
impulsvågor, 90 korrigeringar (12/12 bolag mätta)" = Vercel-cronens minut,
i linje med 09-15:s 05:05:22Z. Contabo-bilden RÄTTAD: /etc/crontab rad 24
(filens mtime 09-08) kör vagscan 06:30 lokal DAGLIGEN (curl med Host-header
mot 127.0.0.1) — kartans "Contabo-crontaben saknar raderna" läste fel källa
(användar-crontab) och motbevisades redan i worklog 09-16 men inarbetades
ej i sektionen; MEN arkivbeviset SKÄRPER gap 4: Contabo-fönstret 04:30Z
lämnade 0 spår i 09-16:s export — koden skriver skans-raden UTAN daglig
dedupe (två lyckade körningar = två rader; dedupe gäller bara
kvartalssnapshoten) ⇒ Contabo-körningen FALLERAR TYST, och curl:as till
/dev/null 2>&1 = rotobevisbarhet inbyggd. vagvalidering är fortfarande
OSPEGELAD på Contabo (båda crontab-källor mätta). SENASTE-rapporten
oförändrad (domar 09-04 = 13 dagar, mtime 09-10 16:33); /api/data/
vagstatistik läser den från disk (route.ts:30–31); 0 sid-/
komponentkonsumenter (gap 3 lever). Svit EGEN 57/57 PASS exit 0 (09-17);
universum fast 12 tickers (vagscan route.ts:36–38, oförändrat). Live-
sonder (/api/vagscan/senaste · vagstatistik · /vagfundament) blockerade av
patch-byggfönstret. Score 8 kvar.*

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
  komponenter/sidor, API:t lever); (4) **cron-spegling — SKÄRPT 09-17**:
  /etc/crontab KÖR vagscan 06:30 lokal dagligen (rad 24; kartans "saknar
  raderna" läste fel källa) men körningen FALLERAR TYST (arkivbevis 09-16:
  0 spår av 04:30Z-fönstret; curl till /dev/null utan logg); vagvalidering
  är fortfarande ENBART vercel-cron (båda Contabo-källor mätta) — körbevis
  + loggning krävs; (5) SENASTE-rapportens förnyelse är bruten (domar 09-04, filen kan
  bara förnyas av agent/manuell körning med skrivåtkomst till repot).

## B10. Konfluensradarn — LEVER — 7/10 *(uppdaterad 2026-09-18)*

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

*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet — allt MÄTT egenhändigt: /konfluens 200 + /api/konfluens LEVANDE med
färsk tidsstämpel (genererad 2026-09-18T11:48:25Z, egen sond): 10 rader,
10/10 med ≥3 datakällor, fem-källors-fältet komplett, 2 rader klassade;
motorvalideringen 107/0/0 (6,4 s, exit 0 — fjärde dokumenterat gröna);
filerna orörda sedan 09-11 (git-bevis, motorn 493 r oförändrad). Gap 1 lever
(ingen testa-konfluens* finns). Gap 3 FÖRDJUPAD: 0 import mellan
konfluens-{motor,tabell} och portfolj-forskning (återmätt) MEN
portfolj-forskning bär ett EGET "konfluens"-begrepp — lager3-fältet
"3 av 5 teorier pekar uppåt" (typer.ts:173, akm2-koppling.ts:115/136) är
TEORIKONSENSUS per horisont, ett annat mått än radarns DATAKÄLLKONSENSUS;
enda textuella bryggan är stilkommentaren vag-stil.tsx:196 ("bandmönster
från konfluensradarn"). Score 7 orörd (E33/B14-precedensen — inga gap
stängda).*

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
  2026-09-16: konceptuell, ej kodad (0 direkta import, mätt). FÖRDJUPAD
  2026-09-18: namnkollision — portfolj-forsknings eget "konfluens"-begrepp
  (teorikonsensus per horisont) är ett ANNAT mått än radarns
  datakällkonsensus; enda bron är stilkommentaren vag-stil.tsx:196.

## B11. Net-net-skannern — LEVER — 6/10 *(uppdaterad 2026-09-18)*

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

*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet — /netnet 200 + /api/netnet LEVANDE färsk (genererad
2026-09-18T11:48:35Z, egen sond): 25 rader = universumet fast 25 fortfarande
(API-svaret är det praktiska beviset), VOLV-B.ST kurs 335,9 (live-flödet
lever; 330,2 vid 09-16-passningen); sonden refreshade 25 netnet-cachefiler i
data/cache (13:48 lokal — lasEllerHamta-leddet lever). Motorvalideringen
107/0/0 (6,4 s, exit 0) — determinismgrenens underlag oförändrat grönt.
Filerna orörda sedan 09-11 (git-bevis; netnet-motorn 292 r oförändrad mot
kartan). Gaps oförändrade: egen svit saknas fortfarande (ingen
testa-netnet*), 25-listan fast. Score 6 orörd.*

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

## B12. Superanalysen + AKM1-kalkylatorn — LEVER — 7/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9): FOMO-kuren LEVER
i prod — granskningsstegets "Sista chansen att justera innan resultatet" →
"Efter detta steg låses dina val och resultatet visas" (superanalys.tsx:467,
1f43c167 09-17 00:55; deploybevis: prod-chunk 1wv5cn_5misik.js bär nya
strängen, gamla BORTA ur samtliga chunks — egen grep). Radtal oförändrade
(507/752/1 411). PRECISERINGSFYND: /superanalys + /kalkylator finns EJ i
gränsnittsvaktens FALLBACK_SIDOR (granssnittsvakt.mjs:68, 6 sidor; 0
vaktrapporter med sidorna, egen sökning) — ytan rutinmäts ej. Båda sidorna
200 live. Gap 1 lever (fortfarande 0 egna sviter). Score 7 kvar —
textkur + preciseringsfynd, ingen kapabilitetsrörelse (E33/B14).*

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

## B13. Portföljforskning — LEVER — 8/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD efter s2-spårets
dataset-djup-vågor — bolagsunivers.json 120 → 153 bolag (+33; 458 144 B,
senaste skrivning 09-17 09:49) sedan 09-16-passningen. Båda egna sviterna
GRÖNA igen i egen körning (riskportfölj 32/0 + uppföljning 50/0, exit 0 —
tredje dokumenterade gången). SKÄRPNING: korstabell-grunden fortfarande FRUSEN
(mtime 09-10 16:33, 83 582 B, 100 rader) medan universum nått 153 — glidningen
FÖRDJUPAD till 53 bolag utan korstabellrad; gap 1 akutare (cadans/rop vid
universumsväxt). member/portfolio fortfarande UTAN lasMedlemSession (grep tomt
— gap 3 lever). Uppföljnings-cronen DUBBELT driven (/etc/crontab + vercel.json,
mätt) men 0 fundamental/akm2/akm3-cacher på disk (endast vagfundament-VOLV_B
09-14 = B7:s kända) — månadsronden 09-01 fyllde ej, nästa 10-01. KORSNOTIS A3:
mentorns nya lager portfoljgrund + portfoljbalans konsumerar universumet —
B13:s underlag matar numera AI-Mentorn direkt. Score LEVER 8 kvar
(preciseringsdokvåg).*

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

## B14. Nyheter + marknadsdata — LEVER — 5/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): cron-bilden mätt — DUBBEL drivning
(/etc/crontab: /api/cron/nyheter 08:00 lokal = 06:00 UTC + vercel.json:
/api/nyheter/scan 08:00 UTC = 10:00 lokal; server-TZ Europe/Berlin); CRON_SECRET
fortfarande EJ SATT (.env-närvaro mätt, värden olästa) = publika rutter;
scan-kontraktet dokumenterat i koden (universum 12 tickers hårdkodat, tröskel
påverkans ≥ 70, max 5 signaler/scan + OrganEvent, "ALDRIG krascha"). 0 sviter
kvarstår (mätt). Score 6 orörd — kunskap tillförd, inga gap stängda.*

*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet med TVÅ DRIFTFYND, allt EGENMÄTT. (1) KÖRBEVISET NEGATIVT —
/etc/crontab rad 25 curlar /api/cron/nyheter som svarar 404 LIVE (egen sond
med crontabens exakta Host-header) och rutten har ALDRIG funnits i
git-historien (git log --all över sökvägen = tom; grannraderna vagscan +
portfolj-uppfoljning pekar på rutter som FINNS — mönstret rätt, sökvägen
fel; scan-rutten heter /api/nyheter/scan sedan 02f7495b 2026-09-03) ⇒
Contabo-leden av "dubbel drivning" har varit död sedan raden skrevs;
pm2-utloggen bär 0 "nyheter"-rader senaste 2 dygnen (konsistent). Enda
kvarvarande drivning = Vercel-cron 08:00 UTC (vercel.json-raden kvar) på den
PASSIVA backup-plattformen — scan-körning kan ej beläggas lokalt (OrganEvent
skriver till Supabase). (2) GAP 2 REALISERAT LIVE — /api/nyheter svarade
ok:true, nyheter:[], franCache:true, antal:0 (egen sond 13:50 lokal) och det
TOMMA resultatet disk-cachats (data/cache/analys-nyh_c8f24f66.json, 93 B,
0 poster, cachad 11:50:06Z — 30 min TTL + routens 5-min-minnescache) medan
en RIK hämtning cacheats 5 minuter tidigare för en annan konfignyckel
(analys-nyh_e406a84d.json: 40 nyheter från SVT Ekonomi/Dagens industri/
Privata Affärer/Yahoo, senaste publikation 13:36 lokal — organisk trafik
före mina sonder) ⇒ externa flödet lever intermittens men tomma svar cachas
TYST; /nyheter-renderingen (71 kB HTML, egen sond) bär 0 nyhetstexter =
kunden ser viloläget. CRON_SECRET fortfarande 0 namnträffar (.env +
.env.local, namnnivå — värden ALDRIG inlästa). Nyhets-motorn 844 r orörd
sedan 09-16 (git-bevis). Score 6 → 5: prod-drivningen av skannern död +
kundsynlig tyst-tom lista = dataflödesförsämring av B7-precedensklassen.*

- **Vad:** Nyhetsmotor (aktienyheter med källhänvisning), nyhetskanaler,
  daglig scan-cron — "dubbel drivning" MOTBEVISAD 09-18: Contabo-leden 404-död sedan raden skrevs (se GAP 4); enda drivning Vercel 08:00 UTC, stock-data/indikatorer-API:er mot externa
  leverantörer, shortseller-bank, morgonrond-data till PRO.
- **Nyckelfiler:** src/lib/{nyhets-motor (844 r),nyhetskanaler,
  shortseller-bank}.ts, src/app/(huvud)/nyheter, src/app/api/{nyheter,
  nyheter/scan,stock-data,indicators,shortseller}/**, src/lib/briefingdata
  via pro/morgonrond-data.ts.
- **Observation:** Väl dokumenterad motor med källhänvisning och cron.
  Externa beroenden (MarketStack, Yahoo) har fallback men inga tester av
  fallback-vägarna.
- **GAP:** (1) ingen testsvit alls; (2) rate-kvoter/fel från externa API:er
  bevakas ej — REALISERAT LIVE 09-18: ok:true + 0 nyheter serveras och det
  tomma svaret disk-cachas 30 min (93 B-post mätt) trots att en rik hämtning
  (40 nyheter) cacheats minuterna tidigare för annan konfig; viloläget är
  kundsynligt på /nyheter; (3) nyheternas juridikgrind (rubrikformuleringar)
  körs via kontrolleraText endast vid publicering — ej på leverantörens
  rubriker; (4) BESVARAD 09-18 — NEGATIVT körbevis: crontab-målet
  /api/cron/nyheter svarar 404 live och rutten har ALDRIG funnits i
  git-historien (scan ligger på /api/nyheter/scan sedan 02f7495b 09-03) ⇒
  Contabo-leden död sedan raden skrevs; enda drivning = Vercel-cron på den
  passiva backup-plattformen (ej lokalt beläggbar — OrganEvent → Supabase).
  CRON_SECRET fortfarande osatt (E29-gap 1 gäller även här).

---

# C. INNEHÅLL & TILLVÄXT

## C15. Bloggen + publiceringsflödet — LEVER — 8/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
kö-census 199 filer (rot 54 · m9-ko 7 · granskning 89 · kvartal/2026-q3 49 —
+24 på ett dygn: s4-läspaketen + s1-mx + s3-översättningarna; egen find);
GRANSKNINGSKO-SAMMANSTALLNING.md förnyad 05:22Z idag (kundens kö-vy lever);
publiceringsstocken 55 orörd (R2); /blogg 200 + B2-rutten metodbevakad
(GET = 405, ej 404) — egna sonder. Flaskhalsen förblir uttaget (kundens
klick) + B2-E2E. Score 8 kvar (B13-precedensen).*

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
  data/blogg-utkast/ (199 filer: rot 54 · m9-ko/ 7 · granskning/ 89 · kvartal/2026-q3/ 49, mätt 09-18),
  src/lib/varumarke.ts (kontrolleraText).
- **Observation:** Hård grindslogik dokumenterad + protokollförd (våg 80b);
  vakten bekräftar 55 poster i prod oförändrade efter utkast-separeringen
  (våg 95). Statusmaskin + senaste-vinner-persistens via system_events.
- **GAP:** (1) B2-flödet E2E-bevisas (knapp → blogg_publicerad-event →
  agent-drop → prod 200) + "Väntar på agent"-vyn förkovras; (2) nya poster
  får default-OG tills deploy (AC4: force-static-DNA); (3) återkopplingsyta
  (läsarmätning per post) finns ej — kommentarer avsiktligt borta.

## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3, passning utan score-rörelse): Kön 124 → 175 filer på ett dygn (rot 48 · m9-ko 7 · granskning 77 · kvartal 43) medan data/blogg/ står på 55; GRANSKNINGSKO-SAMMANSTALLNING.md FÖRNYAD 16:58 samma dag (gapet "åldrande vy" stängt); granskningsmotorn i högvarv — 3 oberoende kontrollgranskningar (substansrabatt, rörelsekapital, industriaktier) med maskinella sifferkontroller, juridikgrind 0 fynd, diff-JSON-paket och anspråkskoordinering; §8-systemfyndet: BlogPost ~ord/200 vs SEO-GUIDER ≤2-min (fel släkts kontrakt påvisat, dom rättad). Flaskhalsen är nu publiceringsuttaget (kundens klick, R2), inte granskningen. Se diff-tabellen i UPPDATERING-sektionen.*

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

## C17. Dataset-citeringsmagneterna — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2, manifest auto-s9-1789731901131):
ÅTERDIFFAD efter s2 omgång 14 + s4:s kvartalsvågor — universumet 171 →
**177 bolag** (egen node-räkning av bolagsunivers.json; FCX, Klarna, Boozt,
Genmab, Lundbeck, Ambu) och landaspekternas första utvidgning utanför
sverige/usa: **danmark** (land.ts:261) med /dataset/halso/danmark 200 på
HTTPS och loopback. Kön-filerna 40 → **52** (42 bolagspaket + 10 kalendrar,
egen ls). Driftfyndet 09-17 (dataset-HTTP-500) LÄKT och stående: /dataset,
/dataset/energi, /dataset/material + Danmark-sidan ALLA 200 (egna sonder).
Läckagevakten v98 GRÖN i egen körning: 177 tickers + 177 namn i 1 538
utdatafiler. llms.txt LIVE bär 177-bolagssektionen (rådata 2026-09-18,
totalt P/E 21,2 n=167) utan ett enda av dagens bolagsnamn — kontraktet §1
håller även i llms. Gap 0 LEVER — TREDJE passningen i rad dör
testa-dataset-aspekter.mjs (OFÅNGAT FEL ERR_MODULE_NOT_FOUND './ordlista',
exit 1) och verktygets egna huvud lovar "ett importfel dödar aldrig hela
testet" medan toppnivå-importen dödar just hela testet. Score 9 kvar —
tillväxt + läkt drift men inget gap stängt (B13-precedensen).*

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

*Återdiff 2026-09-17 (s9-u3 omgång 12): kvartalsunderlaget 28 → **40 Kön-filer**
(ls-mätt: 30 bolagspaket sa-laser-du-* + 10 branschkalendrar i
data/blogg-utkast/kvartal/2026-q3) men /kvartalsdata-src fortfarande 0 filer —
H3 orört, gap 1 växer bara tyngre av eget underlag. Gap 0 BEKRÄFTAD oförändrad:
testa-dataset-aspekter.mjs dör fortfarande OFÅNGAT (ERR_MODULE_NOT_FOUND
'./ordlista' importeras ändelselöst av dataset-medianer.ts — egen körning ~12:0xZ,
identiskt med 09-15-fyndet). Läckagevakten v98 GRÖN i egen körning (exit 0):
0 träffar, 153 tickers + 153 namn sökta i 3 utdatafiler — kontraktet §1 håller.
DRIFTFYND: /dataset, /dataset/energi och aspektrutten svarar HTTP 500 i prod
(egna sonder; vid 09-15-mätningen 200) — chunk-roten, se A1-notisen; ytan
omätbar grön tills läkningen. Score 9 kvar — fynden är drift + oförändrade gap.*

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

## C18. SEO/schema/llms.txt — LEVER — 9/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-15 (s9-u3 omgång 2): schema-kurser OMÄTT GRÖN igen —
444 kontroller / 0 fel (18 sidor, 6 kurser × 3 språk mot localhost).
llms-txt + llms-full-txt 200/200 (mätt). sitemap 1 684 → **1 998 URL:er**.
sökindex FRYSKT: sok-index.json genererad 2026-09-15, committad i b514fe67 —
men kopplingen förblir manuell disciplin. seo.tsx 809 → 841 r. OG-steget
fortfarande manuellt: deploya-contabo.sh saknar og-generate-kopling (grep
0 träffar). Kursantalet i G1-gapet rättat 333 → 337. Score 9 kvar.*

*Återdiff 2026-09-17 (s9-u3 omgång 12): sitemap 1 998 → **2 239 URL:er**
(localhost /sitemap.xml 200, loc-räknat, egen sond); sok-index.json FÄRSK: 396
poster genererade 2026-09-17 (public/, mtime 11:39 — kopplingen lever men
förblir manuell disciplin, gap 3 kvar); llms.txt + llms-full-txt + robots.txt
200 (egna sonder); seo.tsx 841 r oförändrad; OG-deploy-kopling fortfarande 0
träffar i deploya-contabo.sh (gap 2 kvar). SVITFYND: testa-schema-kurser
UNDERKÄNT med SANN exit 1 (egen körning, exitkod fångad utan pipe) — men ALLA
sidfel är HTTP 500 på localhost-kurssidor: DRIFT, ej schema-kod (444/0-grönt
09-15 gällde när ytan svarade; inget schema har ändrats). Searchbot-hälsan:
/kurser /analyser /blogg /labb /dataset bär 500 i prod JUST NUPT (chunk-roten,
se A1-notisen) medan statiska SEO-ytor (/, llms×2, robots, sitemap) är gröna.
Score 9 kvar — felen är drift, inte systemets kod; gap-listan oförändrad.*

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

## D22. Betalning & prenumerationsstomme — VÄNTAR — 5/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 9, read-only — inget pris
rördes): stommen OFÖRÄNDRAD sedan våg 77 (202 r + 4 komponenter orörda
sedan 09-10); "ingen PSP-kod" bekräftad (PSP-namnen endast R2-veto-ordlista
i styrelsemotorn + substring-falskar); "e-postnotis till admin" MOTBEVISAD
I FORMEN — intention-leden är starkare: anonymiserat A4-event →
/api/konvertering/intention (system_events type=konvertering_intention,
rate-limit 10/min, fälttak) + admin-VY /api/admin/konvertering (401-vaktad),
inget brev; NYTT GAP 4: intentionerna bor i system_events (E33:s FLAGGA-
tabell). Prod-ytor osonderbara pga det globala SSR-driftfelet (mätt: /
200 medan /kurser 500 samma sekund).*

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

## D23. Prisstegen (portfölj-tier) — VÄNTAR (bakom flagga) — 7/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u2 omgång 9, read-only — ingen flagga
sattes): grinden MÄTT I PROD — robots.txt 0 tier-rader + sitemap 0 tier-
URL:er ⇒ tierAktiv()=false i körande instans; NEXT_PUBLIC_TIER_AKTIV finns
i ingen .env-fil (namn-närvaro mätt, värden aldrig lästa); priskällan
preciserad två-lager (lasPriser struktur + lasPriserGallande pristal,
Supabase-override senaste-vinner); speglar en/ar mätt SAKNAS; aktiveringen
bär BYGGKRAV (NEXT_PUBLIC_* inlineras vid bygge). Sidorna orörda sedan
våg 99 (2a566cfd). 0 egna testsviter.*

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

## E26. Admin-panelen — LEVER — 8/10 *(uppdaterad 2026-09-18)*

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

*Uppdatering 2026-09-17 (s9-u1 omgång 12, andra varvet): ÅTERDIFFAD med
egna mått — 09-15-läget bekräftat och STÄRKT: audit-loggen 68,7 KB →
258 969 byte / 1 008 rader (301 unika aktörer; 357 uppgift_start +
334 uppgift_klar + 162 modellkatalog-synk + 143 deploy + 8 tier3-
komprimeringar + 1 fabrikskirurgi + 1 beslut + 1 deploy_revert) =
fabrikens FAKTISKA driftlogg, span 09-14 23:19:59Z → levande (sista
raden = fabriksbarns start 11:55:28Z idag); admin-sessionssviten 14/14
GRÖN i egen körning igen; requireAdmin MÄTT LIVE (401 på
/api/admin/variabler och /api/studio/godkannande utan auth); /admin-
sidans 500 = o47-driftklassen (samma sekund: /kurser + /blogg 500, /
200 — SSR-felet, ej admin-specifikt; API-lagret oskadat). Skärpningar:
juridikgrindens FP-kön 8 → 17 VARNINGAR + FLYTTKLAR 21 → 63 utkastfiler
(gap 5 brittare); R2-knappen orörd — godkannande-val.json finns
fortfarande ej (flödet kodbevisat, ej körbevisat); paneler 16 +
admin-auth.ts 245 r oförändrade; sessionStorage-resterna lever (77
träffar x-admin-password i src/); rate-limit på 8 av 25 rutter, IP-block
0 träffar; GDPR-DATAKARTA.md lever (24 026 B). Score 8 kvar.*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
s8-u1:s godkännandehärdning (a20f15fa 07:18, EFTER 02:3x-passningen)
KODVERIFIERAD eigenhändigt: härdningstak EFTER requireAdmin — publicera
6 authade försök/minut · val-ytan 20 authade POST:er/minut · GET takfri ·
429 med Retry-After 60 som pushar aldrig; NY audit-åtgärd "publicera-avvisad"
(skrivAudit :91 — kvitto per avvisat försök; 0 driftfall ännu, R2-knappen
kundens); audit-loggen 336 540 B / 1 281 r (egen wc); sviten 14/14 exit 0;
requireAdmin 401 live ×2; rutter 25 + sessionresterna 77 orörda. MÄTEALSBYTE:
FLYTTKLAR-stocken 63 → 0 (utkastkön omorganiserad till GRANSKNINGSKO-
SAMMANSTALLNING + JSON-format, se C15) — gamla talet dött; juridik-FP
17 → 22 VARNINGAR (05:37Z, 0 FEL). Score 8 kvar (E33/B14-precedensen).*

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
  src/app/api/admin/** (25 rutter — räknekorrigering 09-17: 0 nya ruttfiler i git sedan 09-15, 09-15-notisens 24 var räkneavvikelse), src/app/api/studio/godkannande/**
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
  ingen IP-block; (5) SKÄRPT 09-17: FP-kön FÖRDUBBLAD — 8 → 17 VARNINGAR (larmfilens
  senaste körning 11:37Z; 0 FEL kvar) på meta-texter som CITERAR
  förbudsorden; FLYTTKLAR-strängen i utkastkön 21 → 63 filer sedan 09-15 —
  granskningskön växer rakt in i vakten, grinden lär sig skilja citat
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

## E28. Styrelsemotorn (AI-styrelsen) — FLAGGA — 6/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789752906622;
fjärde varvet): ROND-VÄGEN bevisad som det faktiska beslutsorganet —
beslutsminnet 70 poster (68 vid 14:00-mätningen; dagsserie 4/16/19/17/8/6
för 09-13→09-18), senaste posten "ROND 66 [Φ]" 14:47:17Z = fullständigt
organbeslut på live-bevis (våg 186 stängd: 25133bff ancestor i prod-HEAD +
flagga i byggd chunk + rutt 405/401; hälso-GUL diagnostiserad som falslarm;
våg 187/188 bokade) med svaret 4 min 14 s in i rondfönstret; rondloggen
punktlig var 3:e timme (15/15 senaste, senaste 14:43:04Z; 17:43-ronden lå
6 min i framtiden vid mätningen 17:37:57Z — inget gap); pumpor online ↺19.
MÖTES-VÄGEN fortfarande stilla (09-15 05:17, 3,6 dygn — inga sammanträden
krävts) och gap 1 FÖRDJUPAT: senaste mötet bär JSON-fallbacken OCH 2/5
organ ute på tidsgränserna (ordförande 50 s, juridik 90 s) = dubbel
svagpunkt; koden stilla sedan f2589675 09-15 01:13 (gap 1-kuren aldrig
påbörjad). API-ytan lever i prod (egna sonder: /api/styrelse/protokoll
200 · /api/styrelse/mote 405 · /api/studio/styrelse 401). Svitens
dev-lås preciserat: testa-styrelse.mjs kräver development-läge (fallback-
lösenord i klartext, dev-endast), startar EGEN dev-server och APPEND:AR
verkligt protokoll — ej körbar i prod-fönstret; mock-transporten har
aldrig haft chansen fånga fallback-klassen. FLAGGA 6 kvar — se
UPPDATERING-sektionen och köposterna till huvudagenten.*

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

## E29. Autonoma organet + cron-pipeline — LEVER — 8/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1, manifest auto-s9-1789731901131):
återdiff med anspråk på disk FÖRE mätstart — och KUR-BEVIS i eget fönster:
syskonet u2 bokförde i sin sektion "syskonens val respekterade (u1 = E29 …
— disk-först)" och valde A2+C17, noll kollision. Tillväxt mätt: 146 klara
manifest av 147 (+30 sedan 09-17 kväll; 22 startade idag), 475 utdataloggar
(+88), beslutsminnet 68 poster (rond 51, 11:43:03Z), pumpor-daemonen 42 h ↺19,
den levande fabriksprocessen fångad i mätfönstret (pid 2140015 — matade detta
manifests barn), evighetsmotorn 614 kontroller (11:48:03Z) med målet återarmat
11:41Z, kunduppdragsfilerna fortsatt frånvarande (ingen order i flykt),
svitgapet och CRON_SECRET oförändrade (återmätta). MEN kollisionsklassen från
09-16/09-17 ÅTERKOM 09-18 i ny skepnad: s8-fönstrets protokollnummer-
trippelkollision (o67 ×3) + git-index-kollision (syskons commit utan paths tog
allt staggat) — ärligt bokförd i 6e44422c/dcd3e279 med disknotiser. Score 8
kvar: kuren är disciplin (disk-först + explicita paths + tidig protokollcommit
+ ärlig bokföring), inte mekanism — fabrikens commit-instruktion saknar
fortfarande isolerade nummerserier och staging-ytor per uppgift. Se
diff-tabellen i UPPDATERING-sektionen.*

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
  regressions-testade, OCH syskonkoordineringen vilar på disciplin: delade
  namnresurser (kartrader · protokollnummer · git-index) kolliderar i tre
  fönster utan mekanisk kur (fabrikinstruktion saknar isolerade serier +
  explicita paths per commit — kur-kö bokad 09-18); (1) CRON_SECRET sätt i prod-env (en rad) eller bind
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

## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u3 omgång 13): ÅTERDIFFAD (kartans äldsta
stämpel, 09-15). Motorvalidering EGEN KÖRNING: 107 PASS / 0 FAIL / 0 SKIP
(7,2 s) — MÖS-lagrets tredje dokumenterade gröna (09-13, 09-15, 09-17); notis:
rapporten skrivs till FAST filnamn motorervalidering-2026-09-02.md (vilseledande
namn, färskt innehåll — köpost: datumstämpel). Nyckelfilerna OFÖRÄNDADE i src
(motor 820 r · lager 890 r · termbank 540 r · kalla 346 r · kontroller 342 r)
men ordlista.ts 2 154 → 2 745 r (+591). Fallback-kön 320 poster OFÖRÄNDRAD;
termbank-tillagg.json TOM (0 poster). Speglar: 18 page.tsx per språk (en/ar);
rörelsen sedan 09-15 är PRESTANDAKurer från s7-spåret (bloggspegel-listornas
prefetch-kur 8fa5f0ce + CV-kur cd2b68ac), inga innehållsändringar i
översättningsskiktet. TIER-SPEGLARNA PRECISERADE (D23-korsnotis, egen find):
prenumeration + medlemskap HAR speglar (en/ar) men portfölj-ytorna SAKNAS
fortfarande — gap 4 lever med exakt yta. I1-auditen OPÅBÖRJAD (0 artefakter,
mätt igen). Läge PÅGÅR (I1) och score 7 kvar — auditen ÄR I1-läget.*

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


## E32. Guldkällorna (variabler + siffror) — LEVER — 8/10 *(uppdaterad 2026-09-17)*

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

## E33. Supabase-persistenslagret — LEVER — 8/10 *(uppdaterad 2026-09-17)*

*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3): FLAGGA 7 → LEVER 8 — "prod-tömningen" MOTBEVISAD: 09-17-arkivet (cron 02:40, obevakat) bär 163 039 rader med kontinuerlig äkthetsdiff (+1 361 sedan 09-16 07:24) — appens projekt (aufr) var aldrig tomt; 13:46-mätningen föll i tväprojektfällan (pg_dump-lästa rkaq saknar tabellen helt; kedja 6:s fynd). Återimport-kön AVBOKAS; arkiv-cadensen grön utan agent; 0 dublett-id i nya arkivet. Kvar lever: V1 på disk/HEAD (v2 endast i DR-INDEX-PROV-2026-09-16-2.md:33-34), composite-indexet ej installerat, schema-drift, inventory 25 d. Se diff-tabellen i UPPDATERING-sektionen.*

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

## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u3 3/3, manifest auto-s9-1789709700201):
S10-U1 + S10-U2:s nattdokvåg LEVERERADE (DRIFTSBOKEN :1830/:1863): blad 8
bevisat i födelsetimmen, RPO-kurvans yngsta punkt, dagsteget dekomponerat
(pump-noll STÄNGD), kvartsklocke-förutsägelse infriad EXAKT, WAL-platå —
födelsebeviset stående praxis (nästa blad 02:30 09-19). Dagens deployfönster
grönt: prod@e5eca448 05:29:45Z med HTTPS-200-kvitto, BUILD_ID BBrkvx9 (egen
läsning), next-server 16.3.5 i processlistan (egen ps), 12 deploy-events
idag; patch-kön fortfarande [] + 2 ok-kvitton. Feljakt-ledgern (o65)
kodifierar driftminnet maskinellt — 69 salvor ur 5 källloggar, bygg-OOM ×3
dokumenterade. Score 9 orörd; kvar-listan oförändrad (ISR 12/44, hybrid-sync,
Storage-restore, MIGRERING-lösenordet, idempotensgrinden).*

*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3, passning utan score-rörelse): natt-backupkedjan OBEVAKAT GRÖN (blad 7 fött 02:30 + moln-JSON 02:40, ingen agent i kedjan); 19 DR-protokoll på ett dygn — FÖDELSEBEVIS (N=0-bladet 2× oberoende), RPO-instrumentet dr-rpo-diff.mjs (per-tabell skuld; natt +19 767 rader/23,3 h, 3/60 tabeller), falsk RÖT-dom kurerad (relativ väg → dumpresolvering; beteendeprov 14,1 s); patch-kön mekaniserad + reaktiverad (next ^16.3.5 låst, kvittoarkiv 18Z, pm2-vakt + artefakt-manifest i prod-synken) med prod 200 egen sond EFTER u2:s 502-patchfönster; ISR 12/44 fem nätter i rad (gap lever). NYTT GAP: data/infra/MIGRERING-NY-DATOR.md bär studions lösenord i klartext i repot (speglas mot GitHub) — huvudagenten äger filen. Se diff-tabellen i UPPDATERING-sektionen.*

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

## E35. Kvalitetssystemet (vakten + motorvalidering + verktygsbälte) — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9-1789709700201 —
femte passningen): kvalitetsvågen s8 (09-17 13:00 → 09-18 07:24) är
systemets största tillväxt sedan kartans födelse — ALLT egenmätt i denna
dokvåg: (1) **KONTROLL 12 SSR-livssonden** (o64, 40a512be) — o47:s
bevisade blindhet (prod stod med 1 616 SSR-500 i timmar medan ALLA vakter
var gröna) är botad: sentinellrutterna / /kurser /analyser /blogg /labb
/en /ar provas på loopback i varje vaktkörning, 5xx = sektions-FEL inom
ett cron-varv; EGEN full vaktkörning **12/12 PASS · 0 fel · 0 manuella ·
GRÖN** (05:39:43Z, exit 0) inklusive kontroll 11 (tsc, projektbinär) —
sju rutter levande 97–153 ms. (2) **Feljakt-stormtriagen LEVER** (o65,
e5eca448): backlog 245/245 bedömda (FÖRE 241 öppna/97 HÖG-KRIT → EFTER
0/0, dom: rotkurad 151 · transient-design 91 · falskt-pos 2 · pågående
1); ledgern 245 fyndrader + 243 bedömningsrader (egen wc; differensen =
dokumenterade nyckelkollisioner, härdning bokad hos verktygsägaren);
stormar-grinden allt-eller-inget; svit **20/20 PASS egen körning**
(domklasser 4). (3) Sviter **74 → 90** (+16/dygn, ls-mätt). (4) Döda-
länksinstrumentet kuraterat (o55: 3 473/0 + kontrollfall) och mimosa-
pariteten mätt (o59). Score 9 orörd — aggregatorn (90 sviter = fortfarande
provtagning), motorregistret (fruset sedan 09-03) och vaktrapports-stoppet
i deploy (0 träffar i prod-synk) lever kvar. Se diff-tabellen i
UPPDATERING-sektionen.*

*Uppdatering 2026-09-17 (dokvåg s9-u1 omgång 11 — fjärde passningen): gap (5)
tmp-läckage-klassen är FULLT STÄNGD i båda ändarna och score höjs 8 → 9.
01:19-klassen som låste ALL commit är mekaniskt död i tre lager: ROTKUR (o44,
84a1841f — svitgenerering i .tmp/, exit-efter-finally mot process.exit-mossade
finally: morgonrondsviten läckte vid VARJE körning, ej bara vid SIGKILL;
tsconfig-glob tmp_*.ts; zonsoparen stada-tmp-ts.mjs 12/12) + vakt/grind-halvan
(s8-u2 448365a9 — tmp-stad.mjs signaturverifierad i pre-commit + sektion 11,
svit 15/15, äkta läcka städad UNDER commiten) + falsklarmsrepetitionen GRÖN
(planterad läcka → hooken självläker HOOK_EXIT=0). EGENHÄNDIGT omätet i denna
dokvåg: vaktkörning 11/11 GRÖN (05:09:35Z), motorvalidering 107/0/0 (6,2 s),
morgonrond 19/19 + demoklient 16/1 (G1 känd demodata-brist) med ren rot,
74 sviter, prod 200 + pulsvakt grön varv 675. Restgap: aggregatorn (74
sviter, växer), motorregistret fruset 14 dagar, vaktrapports-stoppet i
deploy (mätt: 0 träffar i prod-synk). Se diff-tabellen i
UPPDATERING-sektionen.*

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

- **Vad:** Kvalitetsvakten (12 kontroller över hela sajten: varumärke,
  JSON, länkar, kursdata, sitemap, motorer, åäö, siffror, typbaslinje,
  SSR-livssond — kontroll 12 till 2026-09-18; skriver
  kvalitetsrapport-SENASTE.md + RESULTAT_JSON), motorvalidering (42 motorer,
  determinism/kontraktskontroller), 90 testsviter i verktyg/ (mätt 09-18
  dokvågen; 74 vid omgång 11), pre-commit-grinden (tsc-0 +
  R2-filblockad vid varje commit),
  verktygsbältet (8 färdigheter + /status,/kvd,/deploy + agent-status.mjs),
  feljakt-stormtriagen (ledgern + bedömningar + stormar-grind, o65),
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
  fortfarande provtagning — med 90 sviter (mätt 09-18, dokvåg s9-u2; 74 vid
  omgång 11); (3) deploy-blockad vid RÖD
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
  TMP-SKYDD-VAKT-GRIND-2026-09-17.md); **ROT-ÄNDAN STÄNGD 09-17 (s8-u1 o44, 84a1841f)**: svitgenereringen
  skrivs i .tmp/ + exit-efter-finally (process.exit inuti try mossar finally
  — TREDJE läckvägen, live-bevisad) + tsconfig-glob tmp_*.ts + zonsoparen
  stada-tmp-ts.mjs (svit 12/12); falsklarmsrepetitionen GRÖN (planterad
  01:19-läcka → pre-commit självläker HOOK_EXIT=0) — klassen mekaniskt död
  i BÅDA ändarna, egenhändigt omätet i dokvåg omgång 11 (15/15 + 12/12 +
  19/19 + 16/1 + vakt 11/11 GRÖN). Zonavtalet dokumenterat i
  data/vakten/s8-tmpskydd-kollisions-notis-u2.md + o44-protokollet.

## E36. Mediebiblioteket — LEVER — 9/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u1-omstart, manifest auto-s9-1789731901131):
gap 4 föll ISÄR — media-filer-*.json är INTE en bucket-förteckning utan
nattjobbens export av EVENT-TYPEN media_fil (backup-fran-molnet.mjs:79), numera
AUTOMATISK kl 02:40 lokal sedan s10-u1:s e97aa579 09-16 (crontab "40 2 * * *";
första auto-filen 09-17 00:40 UTC), med antal=0 rader=[] i alla 6 filerna =
händelsetrömmen äkta tom sedan 09-08 (mediabibliotek.ts:65 skriver media_fil
vid varje uppladdning — ingen skett). SANNINGEN: Storage-bucketens förteckning
backas upp AV INGEN — gap 4 SKÄRPT till DR-risk. Återmätt GRÖNT: sviten 18/18
egen (exit 0, kontrakt A7 REN) · OG 0 träffar i deploy-skriptet + public/og
404 trackade i git (disk = git) · kärnfilen 578 r kodstilla sedan 7b2666c1
(09-07). Score 9 kvar (kunskap tillförd, inget gap stängt/fallet).*

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
  (medvetet? dokumentera); (4) Storage-bucketens förteckning backas upp AV INGEN — media-filer-*.json
  visade sig vara nattjobbens TOMMA event-export av typen media_fil (antal=0 ×6,
  automatiserad 02:40 sedan s10-u1:s e97aa579) — DR-gap skärpt 09-18, kö till
  huvudagenten: objektlistning av Storage-bucketen i nattjobbet.

## E37. Navigering & app-yta — LEVER — 8/10 *(uppdaterad 2026-09-18)*

*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9-1789709700201 —
tredje passningen; översiktsraden senast 09-17 omgång 8): prestandaserien
s7 (o45–o62, 09-17 12:00 → 09-18 07:00) är systemets tätaste leveransrad
någonsin — tolv kurer sedan kartans o41-läge, ALLA med mekaniska
EFTER-bevis i protokoll: o45 flight (393 {slug,titel}-kursobjekt ur varje
sidas RSC-payload), o49 /logga-in (2→0), o50 logo ×3 omgångar, o51
kurskortens list-prefetch, o52 blogginlägg (?_rsc 5→0), o53 chat-defer
(rIDLE-tak 2 500 ms på 8-s-steget), o54 kursiv-preload (hero-citatet =
LCP-elementet), o56 herolänkar (**/ _rsc 5→3 · requests 45→38 · transfer
633,1→590,8 KiB**; /kurser+/blogg _rsc 0 orörda), o57 LasyGlobal
tvåstegs-basfall (8 s + idle — prod-bevisat), o61 PalettVakt-defern
(15–21 K-chunkfamiljen ur TBT-fönstret på /). Lighthouse-band (o56-EFTER,
bygge stE6SStz): / P61 · LCP 5 162 · TBT 675 · CLS 0 — /kurser P57 ·
TBT 1 074 · /blogg P66. KVAR: /kurser ×3 (36,0 KiB) bitidentiskt spill =
herons TREDJE länk (home.slutTitta-textlänken ~526, alltid viewport,
utan prefetch={false}) — köpost o63 med färdig kurs-idé. 52-px-delspåret
SLUT för barnägda ytor (o62): mätverktyget metrologiskt härdat (19
fantomer bevisade av tre CDP-sonder — o8:s paginerings-"1"-anomali
hänförd till samma klass), EFTER 6 fynd/6 sidor = endast ShortSeller-
döljknappen 44×44 (o8 §8:s dokumenterade undantag; att den nu mäts på
alla sidor är i sig bevis på o57:s defer), 0 zoomfällor; 2 designbeslut
kvar (prosa-länkar + 44-korset) = huvudagent-yta. Egna HTTPS-sonder
09-18: / · /kurser · /blogg · /studio ALLA 200 på 59–75 ms. Score 8
orörd (o63 outlevererad + 0 egna sviter + CLS-intermittens + sökindex-
cadans). Se diff-tabellen i UPPDATERING-sektionen.*

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
- **GAP (uppdaterat 2026-09-18):** (1) sökindexet statiskt mellan deploys
  (nya kurser/poster osynliga tills kor-sokindex + deploy; fortfarande ingen
  hook); (2) PWA offline-beteende overifierat (service worker endast
  registrerare?); (3) palettens täckning av pro/tier-ytor följer flaggorna
  men testas ej; (4) språkresolvens-CLS INTERMITTENT (~0,11 i r5u2b-EFTER
  men 0,000 i vilande-facitet — sv-locale isolerat 0,000; produktbeslut
  a/b/c fortfarande obokat); (5) fortfarande inga egna regressionstester
  (CDP/Lighthouse är mätbevis, inte testsviter); (6) STÄNGT 09-18 (o62):
  52-px-delspåret SLUT för barnägda ytor — kvar = två DESIGNBESLUT
  (prosa-länkar i löpande text + 44-korset vs 52-golv) = huvudagent/
  styrelse-yta; (7) /kurser ×3 _rsc-spill (36,0 KiB) = herons TREDJE länk
  (home.slutTitta-textlänken) — köpost o63 outlevererad; (8) /studio-EFTER
  (o31) fortfarande obokförd + unused-JS poäng 0 kvar (74–79 KiB) och
  bootup 3,3–3,5 s / mainthread 7,7–7,8 s — koddelningen minskade men
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
