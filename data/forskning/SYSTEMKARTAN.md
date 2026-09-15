# SYSTEMKARTAN — AK1A Research Lab (2026-09-11 · uppdaterad 2026-09-15)

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

---


## ÖVERSIKT — 38 system

| # | System | Grupp | Läge | Score | Topp-gap |
|---|--------|-------|------|-------|----------|
| A1 | Kursplattformen (337 kurser, quiz, XP, case) | Utbildning | LEVER | 8 | Fullständigt kurs-CMS saknas; kurs-access utan egen testsvit |
| A2 | Lärvägen + läroplanen | Utbildning | PÅGÅR (H1) | 7 | Ingen egen testsvit; H1-statusrevision ej avslutad |
| A3 | AI-Mentorn | Utbildning | PÅGÅR (H2) | 7 | H2 2.0 (dataset-grundning) overifierad; ingen test |
| A4 | Daglig träning (dagens pass, veckoplan, kunskapsflöde) | Utbildning | LEVER | 7 | Inga tester; streak-logik ej validerad |
| A5 | Gamification (badges, certifikat, topplista) | Utbildning | LEVER | 7 | Inga tester |
| A6 | Biblioteken (bokmaster, bokkanon, forskningsbibliotek) | Utbildning | LEVER | 7 | Verktygskedjan manuell (integrera/fixa/lägg-till-källa) |
| B7 | AKM2-analysmotorn + analysidorna | Analys | LEVER | 9 | Berika-pipeline manuell; snapshot-cadans fast |
| B8 | AKM3 (regim, kalibrering, ensemble) | Analys | PÅGÅR | 7 | Kalibreringsloopen cron-driven men beslut delvis ouppfyllt |
| B9 | Vågsystemet AK1TS (vagfundament, vagkon, vagscan) | Analys | LEVER | 8 | Fast 12-ticker-universum; träff-% publikt oklart |
| B10 | Konfluensradarn | Analys | LEVER | 7 | Ingen egen testsvit (ingår i motorvalidering, PASS) |
| B11 | Net-net-skannern | Analys | LEVER | 6 | Determinismfelet rättat (107/0/0, 2026-09-13); egen testsvit saknas |
| B12 | Superanalysen + AKM1-kalkylatorn | Analys | LEVER | 7 | Inga tester |
| B13 | Portföljforskning (korstabell, risk, uppföljning, byggare) | Analys | LEVER | 8 | Månads-cron fast; peer-jämförelse ytlig |
| B14 | Nyheter + marknadsdata | Analys | LEVER | 6 | Inga tester; externa beroenden (MarketStack/Yahoo) utan fallback-test |
| C15 | Bloggen + publiceringsflödet | Innehåll | LEVER | 8 | Läge B (live-läsning Supabase) obeslutat; OG default tills deploy |
| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | Kön manuell att publicera (export-paket → main-agent) |
| C17 | Dataset-citeringsmagneter | Innehåll | LEVER | 9 | Kvartalsrapport H3: kontrakt klart, src EJ PÅBÖRJAD |
| C18 | SEO/schema/llms.txt | Innehåll | LEVER | 9 | G1-slutverifikation (Google rich-results live) återstår |
| C19 | Trafik, spår & konvertering | Innehåll | LEVER | 7 | Inga tester; P6-spårregeln övervakas manuellt |
| D20 | Inloggning & konto (L1) | Medlem | LEVER | 7 | LOGIN-2.0 E2E-verifierad (specifika feltexter live); återställ lösenord + E2E-svit saknas |
| D21 | Medlemsdata & progress (molnet) | Medlem | LEVER | 8 | Gäst→moln-migrering en enkelriktning |
| D22 | Betalning & prenumerationsstomme | Medlem | **VÄNTAR** | 5 | Ingen betalmotor alls (Stripe saknas); kundens 8 beslut |
| D23 | Prisstegen (portfölj-tier) | Medlem | VÄNTAR (flagga) | 7 | NEXT_PUBLIC_TIER_AKTIV ej satt — väntar kundens prisbeslut |
| D24 | Fas 2/3-access | Medlem | LEVER | 8 | Manuell admin-aktivering skalar inte |
| D25 | Referral + e-post + notiser | Medlem | LEVER | 6 | E-post/notiser utan tester; driftstatus overifierad |
| D38 | Medlemsnavet — Min Sida-portalen (AnalysNavet, KursNavet, PortfoljNavet, bevakning) | Medlem | LEVER | 8 | Inga egna E2E-tester; pass.namn-API-texter svenska; gäst-flödet enklare |
| E26 | Admin-panelen ("WordPress-drömmen") | Styrning | LEVER | 8 | Spegling Supabase→fil manuell (synka-*); session-cookie framför lösenord = steg 5 |
| E27 | Studio (Z-portalen) | Styrning | LEVER | 9 | Paritetstak 39/91 (binär 3.11.2-22); -32031 efter omstart; skal-kvot-häng = process-kur i AGENTS.md |
| E28 | Styrelsemotorn (AI-styrelsen) | Styrning | **FLAGGA** | 6 | Ordförandesvar ej JSON-tolkbart → tomma beslut (åtgärder "(inga)") |
| E29 | Autonoma organet + cron-pipeline | Styrning | LEVER | 8 | Fabrik+evighetsmotor+uppdragsprotokoll mekaniska (25 klara manifest, pumpor i ps); kvar: egen testsvit, CRON_SECRET, 28 motorer utan triggare |
| E30 | B2B / AK1A PRO | Styrning | INAKTIV | 6 | Väntar jurist (R2); grind- + screening-sviter gröna (33/0, 26/0, mätt 2026-09-15); demoklient-G1 röd (AKM2Resultat saknas i demodata) |
| E31 | Flerspråkighet (MÖS + termbank + speglar) | Styrning | PÅGÅR (I1) | 7 | Portalens sista trespråksgap stängt (våg 113); MÖS-kvalitetsaudit kvar |
| E32 | Guldkällorna (variabler + siffror) | Grund | LEVER | 8 | 320 poster i översättnings-fallback-kön; speglingsfönster manuell |
| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | LEVER | 8 | Mönstret bevisat i 3 system (progress/bevakning/portfölj); `oversattningar` kräver kund-SQL |
| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 8 | Datorns hybrid-sync overifierad; main efter develop (reserv-slack) |
| E35 | Kvalitetssystemet (vakten, motorvalidering, verktygsbälte) | Grund | LEVER | 8 | Grind blockerar varje commit (bevisad s8-u1); +3 vakter (beroende/döda länkar/konfig); kvar: motorregister 2026-09-03, testaggregator, deploy-blockad vid RÖD |
| E36 | Mediebiblioteket | Grund | LEVER | 9 | OG-kopplingen till nya poster = nästa deploy |
| E37 | Navigering & app-yta (palett, sökindex, PWA, menyer) | Grund | LEVER | 8 | CLS 0,000 (sv) + LCP −0,4…−1,4 s mätbevisat, läsbarhet 52 px mätt; kvar: inga egna tester, språkresolvens-CLS, sökindex-cadans |

Snittscore: **7,5/10** (284 poäng / 38 system; E35/E29/E30/E37 +1 vid
dokvågarna 2026-09-15). Sämst: betalning (5). Bäst: AKM2, Studio,
Dataset, SEO, Mediebibliotek (9).

---

# A. UTBILDNINGENS KÄRNA

## A1. Kursplattformen — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u3): talen rättade mot guldkällan — 337 kurser,
8 223 quizfrågor (82 230 XP), fas2 18 / fas3 24 (data/siffror.json,
regenererad 2026-09-15 av rakna-siffror efter s5-vågens fyra kurser:
balansräkning, DuPont, soliditet/räntetäckning + V-spåret 20/20 i
kurskartan; larvag-synk GRÖN 337=337=337). Score oförändrat — samma
kontraktsbrott kvarstår i gaplistan.*

- **Vad:** Plattformens ryggrad: 337 kurser × 3 språk (deep-courses.json,
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

## A2. Lärvägen + läroplanen — PÅGÅR (H1) — 7/10

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
- **GAP:** (1) ingen egen testsvit för raknaLarvag-reglerna (varför-radernas
  prioritet kan regressera tyst); (2) H1-statusrevisionen avslutas +
  dokumenteras; (3) lärvägens synlighet på min-sida bekräftas E2E.

## A3. AI-Mentorn — PÅGÅR (H2) — 7/10

- **Vad:** Publik chatt-widget som känner eleven (nivå, XP, platssammanhang),
  redigerar behovet med klarliggande motfråga, ger handlingar och AKM1/
  AK1TS-referenser — ALDRIG köp/sälj (rådgivningsgrind i kod).
- **Nyckelfiler:** src/app/api/chatbot/route.ts, src/lib/chatbot-nlu.ts
  (259 r), src/lib/chat-minne.ts, src/lib/assistent.ts,
  src/components/ak1a/chat-widget.tsx, assistent-panel.tsx.
- **Observation:** Rutten läser ÄKTA data (kursregistret via getCourses,
  blogg, EKOSYSTEM, priser via lasPriserGallande) och har Z.ai-gren +
  deterministic fallback. Rådgivningsgrind + disclaimer är kodad i rutten.
  H2 2.0 (grundning i dataset-medianer med AK1A-röst) är delvis infriad —
  dataset-medianer finns som lib men kopplingen till mentorns svarskällor är
  ej E2E-verifierad i kod.
- **GAP:** (1) H2-koppling dataset-medianer → mentorsvar verifieras E2E;
  (2) ingen test av NLU-reglerna (normalisering, ämnesmatchning, följdfråga);
  (3) chat-minnets retention/tömning dokumenteras ej.

## A4. Daglig träning — LEVER — 7/10

- **Vad:** Dagens Pass (5-minutersritual: vågklassgissning på live-data,
  dagens quiz +10 XP, flashcards, streak), veckoplan, kunskapsflöde,
  morgonbriefing.
- **Nyckelfiler:** src/app/(huvud)/dagens-pass + src/app/api/dagens-pass,
  src/lib/veckoplan.ts (246 r), src/lib/kunskapsflode.json,
  src/lib/briefing.ts (206 r), src/components/ak1a/{dagens-pass,vecko-plan,
  kunskaps-flode,morgon-briefing}.tsx.
- **Observation:** Väl dokumenterade små libs med pedagogisk copy; dagens
  pass är force-dynamic (live-data), övriga statiska. Inga tester.
- **GAP:** (1) streak-logik + XP-tildelning testas ej; (2) dagens bolags
  determinism (samma dag ⇒ samma pass) garanteras ej i kod; (3) briefingens
  datakällor är statiska — koppling till vagscan-signal saknas.

## A5. Gamification — LEVER — 7/10

- **Vad:** Badges (förtjänade medaljer), certifikat (kursintyg), topplista
  (XP-rankning, "poängen förtjänas, tas inte"), streak-visning.
- **Nyckelfiler:** src/lib/badges.ts (326 r), src/app/(huvud)/{badges,
  certifikat,topplista}, src/components/ak1a/{badg-panel,certifikat,
  topplista}.tsx, src/app/api/topplista.
- **Observation:** Ren logik, varumärkesriktiga texter, force-static där
  möjligt. Topplistan bygger på medlem-progress (D21). Inga tester.
- **GAP:** (1) badge-reglerna (trösklar) saknar test; (2) certifikatens
  unikhet/verifierbarhet (kan två identiska utfärdas?) otyst; (3) topplistans
  integritet (XP-manipulation via klient?) — progress-skrivning går via
  auth-vaktad rutt men granskas ej.

## A6. Biblioteken — LEVER — 7/10

- **Vad:** Bokmastern (103 bokbaserade kurser), bokkanon (102 böcker),
  forskningsbiblioteket (per-ticker-analysunderlag), källor & upphovsrätt.
- **Nyckelfiler:** data/bokmaster/*.json, data/bokkanon.json,
  src/app/(huvud)/{bibliotek,forskningsbiblioteket,kallor},
  src/components/ak1a/bibliotek.tsx, verktyg/{integrera-bokmaster,
  fixa-tabeller,lagg-till-kalla}.mjs, data/rapporter/
  upphovsrattsgranskning-2026-09-01.md.
- **Observation:** Kvalitetsvakten PASSAR åäö-bortfall + kursdata-konsistens
  för bokmaster (0 fel). Upphovsrättsgranskning dokumenterad. Verktygskedjan
  (validera→integrera→källa-attribution) existerar men är manuell.
- **GAP:** (1) verktygskedjan saknar ett enda kommando (lint-dörr) som
  blockerar ogiltig bokmaster-JSON före commit; (2) forskningsbibliotekets
  ticker-täckning vs analysbanken (B7) synkas manuellt; (3) källförteckning
  per kurs maskinläsbar endast delvis.

---

# B. ANALYSMOTORERNA

## B7. AKM2-analysmotorn + analysidorna — LEVER — 9/10

- **Vad:** Plattformens vetenskapliga kärna: AKM1:s 20 fundamentalvariabler
  (V01–V20, 0–5 p med motivering), AKM2-lagersyntes (kärna + vikter +
  moduler + dynamik via injektion), förklaring per variabel med kurslänk,
  analyser per ticker + variabel, on-demand-beräkning, snapshot-lagring.
- **Nyckelfiler:** src/lib/akm2/{karna.ts (914 r), dynamik.ts (869 r),
  vikter.ts, moduler/, typer.ts}, src/lib/analys-motor.ts (600 r),
  src/lib/akm2-onsdemand.ts, src/lib/akm2-snapshot-lagring.ts (402 r),
  src/app/(huvud)/analyser/**, src/app/api/{analysis,stock-data}/**,
  verktyg/testa-akm2-{karna,dynamik,moduler,snapshot}.mjs,
  verktyg/kor-akm2-berika.mjs.
- **Observation:** Högsta kvalitet i kodbasen: PROJEKTIONSINVARIANTEN
  (projiceraAKM1(raknaAKM2(k)) === raknaAKM1(k), byte-identisk) + ÄRLIG-
  HETSPRINCIPEN (null in ⇒ "osatt" ut, kärnan gissar aldrig) är dokumenterade
  och testade i fyra separata sviter. Motorvalideringen PASSAR analysmotorn.
- **GAP:** (1) kor-akm2-berika (AI-berikning) är manuell pipeline — ingen
  autonom berikning; (2) snapshot-cadansen fast (ingen ombestämning vid
  datakorrigering); (3) motorregistret (2026-09-03) listar akm2-modulerna som
  "omonterade" i cron/autonomi-meningen — kopplingen till organ-pulsen saknas.

## B8. AKM3 (regim, kalibrering, ensemble) — PÅGÅR — 7/10

- **Vad:** Regimdetektering (marknadsläge), osäkerhetskvantifiering,
  ensemble-kärna, kalibreringsloop mot kvartalsdeduplicerade vågklass-
  snapshots.
- **Nyckelfiler:** src/lib/akm3/{ensemble,kalibrering,osakerhet,regim,typer}.
  ts, src/app/api/cron/akm3-kalibrering/route.ts, data/forskning/AKM3/
  (beslut), verktyg/testa-akm3-kalibrering.mjs, src/lib/vagvalidering.ts
  (kvartalsnyckel + protokollversion).
- **Observation:** Kärnor + testsvit + cron finns; vagscan (B9) matar
  kalibreringen med kvartalsgaller (våg 59-steg 2, två konsumenter enligt
  kodkommentar). AKM3-BESLUTets fulla program (r3-dynamisering) är delvis
  genomfört — läget "pågår" i rankningen var korrekt.
- **GAP:** (1) regimetikettens publika exponering (visas den för eleven
  nånstans?) — konsumentytan tunn; (2) kalibreringens träff-%-rapportering
  (/api/data/vagstatistik) saknar historisk trendvy; (3) ensemble-vikternas
  drift över tid bevakas ej.

## B9. Vågsystemet AK1TS — LEVER — 8/10

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
  träff-% redovisas inte på någon publika utbildningssida (lärdomen syns ej).

## B10. Konfluensradarn — LEVER — 7/10

- **Vad:** Väger värde mot vågor: värdegolv först, fundamental vågstart +
  prisvågläge därefter; fem oberoende källor måste tala samman.
- **Nyckelfiler:** src/lib/konfluens-motor.ts (493 r), src/app/(huvud)/
  konfluens, src/app/api/konfluens, src/components/ak1a/konfluens-tabell.tsx.
- **Observation:** Force-static, pedagogisk ingress, "aldrig investeringsråd"
  i metadatan. Ingår i motorvalideringen (PASS där).
- **GAP:** (1) ingen egen testsvit för fem-källors-logiken (regression vid
  motorändring i B7/B9 fångas bara indirekt); (2) radarns historik (hur många
  konfluenser setts/utfall) lagras ej; (3) koppling till portföljforskningens
  korstabell (B13) är läsbar men ej testad.

## B11. Net-net-skannern — LEVER — 6/10 *(uppdaterad 2026-09-13)*

*Uppdatering 2026-09-13: motorvalideringen kör nu 107 PASS / 0 FAIL /
0 SKIP (6,4 s) — determinismfelet (VOLV-B.ST 340.3≠340.4) är borta och
skannern lämnar inga röda till vakten. Kvar: egen testsvit, fast
25-bolagslista.*

- **Vad:** Skär 25 svenska/nordiska bolag mot Grahams net-net-kriterium
  (kurs < 2/3 × NCAV), sorterad på kurs/NCAV med NET-NET/NÄRA-markering.
- **Nyckelfiler:** src/lib/netnet-motor.ts (292 r), src/app/(huvud)/netnet,
  src/app/api/netnet, src/components/ak1a/netnet-skanner.tsx.
- **Observation:** **KÖRT BEVIS:** motorvalideringen FAILAR determinism —
  "utdata skiljer mellan körningar. Första skillnad: rot.kurs: 340.3 != 340.4"
  (VOLV-B.ST). Motorn är live-kursberoende inne i beräkningen: icke-
  deterministisk mellan två körningar inom samma kvotfönster. Detta är en av
  de två röda som sänker vakten till GUL (E35).
- **GAP (avgörbart):** (1) determinism-testet får fast indata (fryst kurs-
  fixture) ELLER motorn renodlas så live-data hämtas EN gång utanför den
  rena beräkningskärnan (mönstret från larvag.ts/A1); (2) 25-bolagslistan
  fast — expansion beslutas; (3) egen testsvit saknas.

## B12. Superanalysen + AKM1-kalkylatorn — LEVER — 7/10

- **Vad:** Guidad aktieanalys i 24 steg (V01–V20 + vågklassgissning per
  horisont) med delbart analys-kort av 100 poäng; AKM1-kalkylatorn (fri
  övningsyta med samma trösklar).
- **Nyckelfiler:** src/lib/superanalys.ts (507 r), src/app/(huvud)/
  {superanalys,kalkylator}, src/components/ak1a/{superanalys,
  akm1-calculator}.tsx.
- **Observation:** Trösklarna delas med AKM2-kärnan (en källa till sanning),
  force-static, delbart kort utan persondata. Inga tester.
- **GAP:** (1) poängsummor/validering av elevens inmatning testas ej;
  (2) delningskortets utseende vid extrema värden (0/100) overifierat;
  (3) kalkylatorn har ingen länk tillbaka till kurslektioner per variabel
  (forklaraPoang-länkarna finns i B7 — återanvänd).

## B13. Portföljforskning — LEVER — 8/10

- **Vad:** Korstabellen (fundamental nivå × vågstil), riskportfölj,
  uppföljning av tidigare analyser, peer-jämförelse, portföljbyggare +
  min portfölj, rapporthantering, fundamental vågmotor som del.
- **Nyckelfiler:** src/lib/portfolj-forskning/{korstabell-data,riskportfolj,
  uppfoljning,peer,fundamental-vagmotor,akm2-koppling,typer}.ts,
  src/app/(huvud)/{portfolj-forskning,portfoljbyggare,min-portfolj,rapporter},
  src/app/api/{portfolj-forskning,portfolio,member/portfolio,report}/**,
  src/components/ak1a/portfolj-forskning/* (7), verktyg/
  {testa-riskportfolj,testa-uppfoljning}.mjs, src/app/api/cron/
  portfolj-uppfoljning (månadens 1:a).
- **Observation:** Två egna testsviter (gröna vid senaste dokumenterade
  körningar), månadsvis autonom uppföljning, deterministisk korstabell ur
  data/portfolj-system. AKM2-kopplingen återanvänder B7:s kärna.
- **GAP:** (1) korstabellens dataunderlag uppdateras manuellt (skanka-
  akm2-snapshots) — ingen autonom refresh; (2) peer-jämförelsen ytlig
  (median, ej kvartiler —.dataset-mönstret återanvänds ej); (3) medlemmens
  portfölj (member/holding) saknar transaktionshistorik/valideringstest.

## B14. Nyheter + marknadsdata — LEVER — 6/10

- **Vad:** Nyhetsmotor (aktienyheter med källhänvisning), nyhetskanaler,
  daglig scan-cron 08:00, stock-data/indikatorer-API:er mot externa
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
  ej på leverantörens rubriker.

---

# C. INNEHÅLL & TILLVÄXT

## C15. Bloggen + publiceringsflödet — LEVER — 8/10

- **Vad:** 55 publicerade poster (data/blogg/*.json) + speglar en/ar,
  granskningskö med draft→granskad→publicerad-statusmaskin, kontrolleraText-
  grind (0 FEL krav) vid varje statusbyte, export-paket till main-agent
  (Läge A), SEO-metadata + OG automatiskt vid drop.
- **Nyckelfiler:** src/lib/blogg-{utkast,speglar}.ts, src/app/(huvud)/blogg/
  **, src/app/{en|ar}/blogg/**, src/app/api/admin/blogg{,/publicera},
  src/components/ak1a/admin/blogg-panel.tsx, data/blogg/ (55) +
  data/blogg-utkast/ (8), src/lib/varumarke.ts (kontrolleraText).
- **Observation:** Hård grindslogik dokumenterad + protokollförd (våg 80b);
  vakten bekräftar 55 poster i prod oförändrade efter utkast-separeringen
  (våg 95). Statusmaskin + senaste-vinner-persistens via system_events.
- **GAP:** (1) Läge B (hot-path live-läsning ur Supabase) obeslutat —
  prestandarisken på 51+ inlägg kräver benchmark (beslut dokumenterat);
  (2) nya poster får default-OG tills deploy (AC4: force-static-DNA);
  (3) kommentarer/diskussion saknas avsiktligt men återkopplingsyta
  (läsarmätning per post) finns ej.

## C16. M9-innehållsfabriken — LEVER — 8/10

- **Vad:** Evergreen-utkastfabrik: deterministiska utkast (kassaflödes-
  analys-101, utdelningar-101, börspsykologi, branschmedianer ...) i kundens
  Supabase-granskningskö med kontrolleraText 0 FEL, md5-kvitton och
  57/57 oberoende kontroller; + 8 SEO-guider.
- **Nyckelfiler:** verktyg/m9-fabrik.mjs, data/forskning/M9-GRANSKNING-
  2026-09.md, data/blogg-utkast/*.json (8 filer i kön), data/forskning/
  SEO-GUIDER-2026-09.md.
- **Observation:** Determinism bevisad (samma indata ⇒ md5-identiskt
  utkast), nyckeltal omräknade mot källfiler, hård ALDRIG-investeringsråd-
  grind. Fabriksbootstrap (--tvinga) + kortNamn-buggfix dokumenterade.
- **GAP:** (1) kön är manuell att tömma (export → main commit) —
  publiceringsknapp i admin som skriver klara paket saknas (Läge B skulle
  lösa); (2) fabrikens serier styrs av hårdkodad serie-lista — ny serie
  kräver kod; (3) ingen schemalagd re-run (kvartalsvis serie-enligt-H3).

## C17. Dataset-citeringsmagneterna — LEVER — 9/10

- **Vad:** Publika branschmedianer (P/E, direktavkastning, marginaler ...) +
  kvartilsspridning + bransch-mot-universum med delta-pilar, 10 branscher ×
  3 språk = 33 URL:er med Dataset-JSON-LD, llms.txt-sektion, sortering,
  kurslänkning. Kontrakt: endast medianer/aggregat — per-bolag ALDRIG.
- **Nyckelfiler:** src/lib/{dataset-medianer (314 r),dataset-nyckeltal
  (393 r)}.ts, src/app/(huvud)/dataset/** + speglar, src/app/api/llms-txt,
  verktyg/v98-dataset-vakt.mjs (permanent läckagevakt: 222 filer, 0 träffar),
  data/forskning/A2-DATASET-KONTRAKT.md + A4-KVARTAL-KONTRAKT.md.
- **Observation:** KVD-mässigt exemplariskt: 33/33 URL:er 200, 0 bolags-
  läckage programmatiskt bevisat, kontrakt i filhuvuden. **Men:** A4-kvartals-
  rapporten (/kvartalsdata, frusna utgåvor med md5+CC-BY) har kontrakt men
  INGEN src-kod — H3 är därmed ej "pågående i koden" utan icke-påbörjad.
- **GAP:** (1) kvartalsrapport-H3: route /kvartalsdata/[kvartal] + index +
  frysnings-pipeline (kontraktet A4 är färdigt underlag — en våg);
  (2) tidsserie/jämförelse mot föregående utgåva saknas (kräver H3);
  (3) datasetens uppdateringscadans dokumenteras på sidan (n-redovisat finns,
  "nästa frysning" saknas).

## C18. SEO/schema/llms.txt — LEVER — 9/10

- **Vad:** pageMetadata-centrum (809 r), Course/FAQPage/BreadcrumbList-schema
  på alla 337 kurser × 3 språk, Dataset-schema, llms.txt + llms-full-txt,
  sitemap (inkl. tier-gating), robots (pro-stängning), hreflang-speglar,
  OG-generering vid deploy, sökindex.
- **Nyckelfiler:** src/lib/seo.tsx (809 r), src/lib/schema-kurser.ts (192 r),
  src/app/{sitemap.ts,robots.ts}, src/app/api/{llms-txt,llms-full-txt},
  verktyg/{testa-schema-kurser,seo-generate,og-generate,kor-sokindex}.mjs,
  data/forskning/V84-METADATA-KARTA.md.
- **Observation:** testad schema-kurser 444/0 grönt (18 sidor, körd nu);
  G1:s FAQPage ur learn/why-innehåll (inga påhittade frågor) lever i kod.
  Verktygskedja genererar OG + sökindex vid deploy.
- **GAP:** (1) G1-slutverifiering: full 333×3-maskinell körning + Google
  rich-results live-test (stickprov gjorda enligt våg 99-dok);
  (2) OG-genereringen är ett manuellt deploy-steg (kan glömmas — hook/
  deploy-skript-koppling); (3) sökindexet (data via kor-sokindex) åldras
  mellan deploys.

## C19. Trafik, spår & konvertering — LEVER — 7/10

- **Vad:** Tracern (intresseprofil), trafikrapportör, DNA-blockering,
  konverteringstratt i 6 steg + intentionsmätning, "noll nya spår"-regeln
  (P6), trafik & säkerhetsvyer i admin.
- **Nyckelfiler:** src/lib/tracer.ts (742 r), src/lib/ekosystem.ts +
  eko-koppling.ts, src/app/api/{track,trafik,konvertering/intention,tracer,
  konvertering}/**, src/components/ak1a/{trafik-rapportor,trafik-status-rad,
  dashfraga-kort}.tsx, src/lib/dashfraga.ts.
- **Observation:** Tracern matar eko-kopplingen (har numera komponent-
  konsumenter: assistent-panel + /api/eko — motorregistrets "noll
  konsumenter" från 2026-09-03 är föråldrat). P6-disciplinen protokollförd.
- **GAP:** (1) inga tester; (2) konverteringstrattens 6 steg mäts men ingen
  automatisk alarm-tröskel; (3) GDPR-art-13-kopplingen till kakmodalen
  (cookie-consent) är manuell — spåren startar före samtycke? (verifiera
  gracious-defer).

---

# D. MEDLEM & KOMMERS

## D20. Inloggning & konto (FAS L1) — LEVER — 7/10 *(uppdaterad 2026-09-13)*

*Uppdatering 2026-09-13: LOGIN-2.0 landat och E2E-verifierat på prod
(specifika feltexter + live-räknare; STYRELSE-2026-09-11-V106 § 3 D1).
FLAGGAN upphävd — kvar som gap: återställ lösenord, E2E-svit, oklart
e-postverifieringsläge.*

- **Vad:** Medlemsautentisering via Supabase Auth (GoTrue v2) genom server-
  proxy: signup/signin/signout/session, tokens ENDAST i httpOnly-kakor
  (access 1 h + refresh 30 d med rotation), rate-limit med IP-hash,
  generella feltexter (läcker ej kontofinns), gäst-läge kvar som mjuk
  fallback + migreringsbanner.
- **Nyckelfiler:** src/lib/medlem-auth.ts (452 r, 17/17 tester gröna),
  src/app/api/medlem/route.ts, src/components/ak1a/medlem-inloggning.tsx
  (220 r), src/components/ak1a/{logga-in,inloggad-knapp,migrera-progress}.tsx,
  src/app/(huvud)/logga-in + speglar, verktyg/testa-medlem-auth.mjs.
- **Observation:** KÄRNAN är ren och väldokumenterad (kontrakt i filhuvud,
  hermetik vid build, SSR-vägar). Men SYSTEMRANKNINGEN #1: "TRASIG UX (fel
  suppressas; kund blockerad 2 ggr)" — kundupplevelsen faller någonstans
  ovanpå kärnan (t.ex. lasSvar-toleransen som visar "Något gick fel" utan
  orsak, session-kollens tysta .catch, eller nätverkslägets detaljer).
  LOGIN-2.0 (K3, huvudagenten) + K2-kartläggning (parallell subagent) körs
  i våg 101 — precis rätt åtgärd.
- **GAP (avgörbart):** (1) K2 lokalisera var fel suppressas (kandidater i
  medlem-inloggning.tsx: lasSvar-fallback, session-catch, signup-lotsning)
  och visa SPECIFIKA fel; (2) live-räknare (försök kvar innan rate-limit)
  i UI; (3) återställ lösenord-flödet saknas helt (GoTrue stödjer det);
  (4) e-postverifiering vid signup av/på — oklart i UI.

## D21. Medlemsdata & progress — LEVER — 8/10

- **Vad:** Medlemsprogress (kurssteg, quiz-XP, flashcards) i Supabase med
  lokal member-local-fallback, min-sida (nästa steg, streaks, lärväg),
  migrering gäst→moln, medlemsprofil-event.
- **Nyckelfiler:** src/lib/medlem-progress.ts (448 r), src/lib/
  medlem-progress-klient.ts, src/lib/member-local.ts, src/app/api/medlem/
  progress, src/app/(huvud)/{min-sida,profil}, src/components/ak1a/
  {min-sida,migrera-progress,fortsatt-panel}.tsx, verktyg/
  testa-medlem-progress.mjs.
- **Observation:** requestskopad läsning (§B.4-dokumenterat), deterministisk
  kärna, testsvit finns och är grön vid senaste dokumenterade körning.
- **GAP:** (1) migrering enkelriktad (moln→lokal återgång vid offline saknas
  — dokumentera val); (2) progress-integritet (XP-replay-skydd) otyst;
  (3) GDPR-export/radering av eget konto finns ej i UI (endast kontaktväg).

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

## D24. Fas 2/3-access — LEVER — 8/10

- **Vad:** Ansökningsflöde för Fas 2 (fördjupningskurser) och Fas 3
  (professionsnivå), admin-aktivering per medlem, certifikat för Fas 3,
  tier-status i klienten, 18/24 kurser bakom grind.
- **Nyckelfiler:** src/components/ak1a/{fas2-ansok,fas2-gate,fas3-cert}.tsx
  + spegel/spegel/fas2-ansok-{ar,en}.tsx, src/app/(huvud)/{fas2-ansok,fas3},
  src/app/api/{fas2-ansok,admin/fas2-access}, src/lib/tier-status.ts,
  src/lib/kurs-access.ts (grindkärnan).
- **Observation:** Grindkorrekt i både UI och API; admin-yta för aktivering
  finns; certifikatutfärdning kopplad till Fas 3.
- **GAP:** (1) manuell aktivering skalar inte vid många ansökningar
  (sido-kö + notis till admin finns, men inget bulkflöde); (2) ansöknings-
  status syns ej för eleven (endast toast); (3) Fas 3-certifikatets
  äkthetsverifiering (offentlig kontroll-URL) saknas.

## D25. Referral + e-post + notiser — LEVER — 6/10

- **Vad:** Referral-koder (m10-mönstret: system_events-rader, senaste-vinner,
  bevisad lagringsväg utan DDL), e-post-sändare + mallar, notiscenter +
  notishistorik.
- **Nyckelfiler:** src/lib/referral.ts (301 r), src/app/api/referral/kod,
  src/components/ak1a/ref-mottagare.tsx, src/lib/{email-sandare (185 r),
  email-mallar}.ts, src/app/api/{email,cron/email}, src/lib/notiser.ts
  (363 r), src/components/ak1a/notis-center.tsx.
- **Observation:** Referral är mallren (dokumenterat mönster som variabel-
  panelen byggde på). E-post: mallar + sändare + cron finns men driftstatus
  (leverans, bouncar) overifierad. Notiser: localStorage/50-tak enligt våg 86.
- **GAP:** (1) inga tester för e-post-sändare (validering av mottagaradress,
  felväg); (2) notiser saknar server-side-lagring (enhetbyte = förlorad
  historik); (3) referral-utlösning (vem fick vilken kod) utan uppföljning-
  vy i admin.

## D38. Medlemsnavet — Min Sida-portalen — LEVER — 8/10 (NY 2026-09-13)

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

## E26. Admin-panelen — LEVER — 8/10

- **Vad:** "WordPress på långt håll": 15+ flikar (översikt, medlemmar,
  variabler, blogg-publicering, översättning/termbank, kurser-metadata,
  media, bokningar, analys-uppladdning med Elliott-redigerare, aktivitet,
  ekosystem, trafik/säkerhet, konvertering, utveckling, puls), rollerna
  ADMIN + REDAKTÖR, HMAC-signerad session-cookie (8 h).
- **Nyckelfiler:** src/app/(huvud)/admin/page.tsx, src/components/ak1a/admin/
  (15 paneler), src/lib/{admin-auth (245 r),admin-klient,medlem-admin}.ts,
  src/app/api/admin/** (24 rutter), verktyg/testa-admin-session.mjs (14/14).
- **Observation:** Alla fyra provade delsviter gröna (admin-session 14/14,
  kurs-metadata 16/16, mediabibliotek 18/18, medlem-auth 17/17). Prod utan
  ADMIN_PASSWORD ⇒ 500 på skrivytor (inget dev-fallback-läck). REDAKTOR_
  PASSWORD satt + verifierad (våg 96). Variabelpanelen har vitlista +
  gratis-lås + revisionslogghistorik.
- **GAP:** (1) commit-back-spegling (Supabase→priser.json/termbank) är
  MANUELL (synka-variabler/synka-termbank före pipelinerun) — steg 5-alt C
  automation återstår; (2) session-cookie-läget dokumenterat men sessionStorage-
  rester (x-admin-password) lever kvar som bootstrap; (3) analys-uppladdningens
  Elliott-redigerare saknar test; (4) admin-URL:en offentligt känd —
  fail2ban-liknande skydd mot lösenordsmalming finns via rate-limit men
  ingen IP-block.

## E27. Studio (Z-portalen i molnet) — LEVER — 9/10 *(uppdaterad 2026-09-15)*

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

## E28. Styrelsemotorn (AI-styrelsen) — FLAGGA — 6/10

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

## E29. Autonoma organet + cron-pipeline — LEVER — 8/10 *(uppdaterad 2026-09-15)*

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

## E30. B2B / AK1A PRO — INAKTIV — 6/10 *(uppdaterad 2026-09-15)*

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

## E31. Flerspråkighet: MÖS + termbank + speglar — PÅGÅR (I1) — 7/10

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
  "okvalitetsgranskad sen våg 80" (rankning #2 korrekt). **KÖRT FYND:**
  motorvalideringen FAILAR MÖS-kontrollen — "ordgräns 5000 respekteras ej;
  anropstak 400 respekteras ej" (MyMemory-kvoterna) — kvotbalansen är alltså
  REGLERAD I KODEN men icke-fungerande/Testat-fel just nu. Fallback-kön
  bär 320 poster (notering: "produktion kräver tabellen oversattningar" —
  kund-SQL ej körd).
- **GAP:** (1) I1-kvalitetsvåg: stickprovs-audit sv↔en↔ar (maskinella
  anomalier: ordlängd, okända tecken, ofullständiga, falska vänner) +
  fixpaket — PÅGÅR enligt rankningen; (2) MÖS-kvots-kontrollen repareras
  (en av två röda som håller vakten GUL); (3) tabellen oversattningar
  (data/sql/oversattningar.sql) körs av kund ELLER event-vägen fullt ut;
  (4) speglarnas täckning av NYA ytor (tier-sidor D23 saknar speglar).

## E32. Guldkällorna (variabler + siffror) — LEVER — 8/10

- **Vad:** Pris- och tal-sanningen: priser.json (ALLA priser + fas-rabatt +
  B2B + onboarding) med Supabase-override senaste-vinner via variabler-
  lagning; siffror.json (337 kurser, 8 223 quiz ...) genererad av rakna-
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

## E33. Supabase-persistenslagret — LEVER — 8/10

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
  nej — kund-SQL spår); (2) retention-organets 30-dagarsregel måste
  exkludera innehållsbärande typer (dokumenterat beslut, implementations-
  status oklar); (3) composite-indexet (ALTER-system_events-composite.sql)
  installerat? — prestanda vid växande event-tabell.

## E34. Drift, backup & DR (Contabo) — LEVER — 8/10

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

## E35. Kvalitetssystemet (vakten + motorvalidering + verktygsbälte) — LEVER — 8/10 *(uppdaterad 2026-09-15)*

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

- **Vad:** Kvalitetsvakten (10 kontroller över hela sajten: varumärke,
  JSON, länkar, kursdata, sitemap, motorer, åäö, siffror — skriver
  kvalitetsrapport-SENASTE.md + RESULTAT_JSON), motorvalidering (42 motorer,
  determinism/kontraktskontroller), 33 testsviter i verktyg/ (mätbart
  2026-09-15), pre-commit-grinden (tsc-0 + R2-filblockad vid varje commit),
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
  fortfarande provtagning; (3) deploy-blockad vid RÖD vaktrapport —
  grinden stoppar commit-nivån men ingen blockerar deploy; (4) STÄNGDA:
  netnet+MÖS röda (2026-09-13, 107/0/0), testa-b2b-grind trasig (kör
  GRÖNT igen 2026-09-15 — se sidofynd E30-revision ovan).

## E36. Mediebiblioteket — LEVER — 9/10

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
  (guide finns, validering av att OG verkligen finns saknas); (2) bucket-
  kvot/storleksbudget bevakas ej; (3) (2) audio/video-format stöds ej
  (medvetet? dokumentera).

## E37. Navigering & app-yta — LEVER — 8/10 *(uppdaterad 2026-09-15)*

*Uppdatering 2026-09-15 (s9-u2): prestandaspåret s7 mätbevisat på prod —
CLS 0,125→0,000 (font-display optional ×4 fonter; sv-locale-isolering
0,000/0 skift; standardspråk ~0,11 kvar = språkresolvens med produktbeslut
a/b/c bokat i o5-prestanda-s7.md), LCP −0,4…−1,4 s, Lighthouse +7–10
poäng (O5 komplett; rådata OPTIMERING/lighthouse/). SearchModal koddelad
(spa-hem.tsx:22-24 next/dynamic ssr:false + LasyGlobal :145). Mobil
läsbarhet ≥52 px första mätningen: verktyg/mobil-lasbarhet.mjs (CDP,
0 npm) — FÖRE 255 tryckmål + 2 zoomfällor på 6 sidor, 8 filer kirurgiskt
fixade max-md, zoomfällorna dödade (12/14→16 px); footer-länkar m.fl.
medvetet kvar (rond 2). Ny mätbeviskedja: prestanda-mat.mjs +
lighthouse-mätaren + mobil-lasbarhet.mjs.*

- **Vad:** Kommandopalett (⌘K), sökindex (404-förslag + palett), huvudmeny +
  mobilmeny + meny-register, PWA (manifest + registrerare), tema-växlare,
  navigationsminne, global skeleton/lasy-global.
- **Nyckelfiler:** src/components/ak1a/{kommandopalett,huvudmeny,mobilmeny,
  pwa-registrerare,tema-vaxlare,navigationsminne,sprak-vaxlare}.tsx,
  src/lib/{sokindex,meny-register,navigationsminne}.ts, src/app/(huvud)/
  manifest, verktyg/kor-sokindex.mjs.
- **Observation (uppdaterad 2026-09-15):** Ren UI-logik i AK1A-DNA;
  sökindex genereras ur äkta data (kor-sokindex destillerar); menyer
  centraliserade i register. Nu dessutom MÄTBAR: CDP-prestandamätning,
  Lighthouse FÖRE/EFTER-rådata och tryckyteaudit ger systemet en beviskedja
  det saknade (alltid levererat "ignorant" — mätningarna fanns inte före
  spår 7).
- **GAP (uppdaterat 2026-09-15):** (1) sökindexet statiskt mellan deploys
  (nya kurser/poster osynliga tills kor-sokindex + deploy); (2) PWA
  offline-beteende overifierat (service worker endast registrerare?);
  (3) palettens täckning av pro/tier-ytor följer flaggorna men testas ej;
  (4) NY: språkresolvens-CLS — SSR sv → klient en vid navigator en-US
  ger ~0,11 skift på standardspråket (sv-locale = 0,000); produktbeslut
  a/b/c bokat; (5) fortfarande inga egna regressionstester (CDP/
  Lighthouse är mätbevis, inte testsviter); (6) footer-tryckmål (20 px)
  + AI-Mentor/ShortSeller-monteringsknappar (44 px) kvar till
  läsbarhetsrond 2 (bokade, ej glömda).

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
