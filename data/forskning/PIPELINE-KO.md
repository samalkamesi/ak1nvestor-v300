# PIPELINE-KO — huvudagentens dispatchlista

Rader med [STYRELSEN]-prefix är styrelsens KÖRS DIREKT-beslut (våg 91 A2, STYRELSE-ADMIN-MEGA.md). Dev-mock-testrader rensade 2026-09-10 (mötet protokollfört i STYRELSE-BESLUT.md).

## VÅG 101 — HAND I HAND (2026-09-11, kunddirektiv "ja fortsätt bygg hand i hand")

Kunddirektiv + systemrankningen (STYRELSE-ADMIN-MEGA.md) = kön. Två
parallella block + huvudagenten:

| Block | Agent | Uppgift | Filverk | KVD |
|---|---|---|---|---|
| K1 SYSTEMKARTAN [STYRELSEN I2] | subagent | Inventera ALLA system, kvalitetscore + gap → `data/forskning/SYSTEMKARTAN.md` | endast den filen | dataleverans (inget bygge), commit utan push |
| K2 LOGIN-KARTLÄGGNING | subagent (read-only) | Hitta var fel suppressas i inloggning/konto + var live-räknare hör hemma; rapportera, skriv INET | ingen | rapport i slutmeddelandet |
| K3 LOGIN-2.0 [STYRELSEN rank #1] | HUVUDAGENTEN | Specifika felmeddelanden + live-räknare i inloggning/konto | src/** (autentisering) | tsc 36-baslinje, build, deploy, prod 200 |

Regler: två agenter skriver ALDRIG samma fil · bygget är huvudagentens
ensamrätt (OOM-våg 85) · en push + ett bygge per våg.

## VÅG 105 (PORTAL-SPÅRET) — UTBILDNINGSPORTFÖLJEN (2026-09-13, dispatched av huvudagenten)

Styrelsens plan (STYRELSE-PORTAL-MEGA.md §VÅG 105) + våg 104:s
system_events-beslut + faktakarta (Explore-agent 2026-09-13). ETT block:

| Block | Agent | Uppgift | Filverk | KVD |
|---|---|---|---|---|
| P1 PORTFÖLJNAVET | subagent | Per-konto-holdings i system_events (mönster medlem-bevakning v104) + /api/medlem/portfolj + PortfoljNavet på Min Sida + legacy-import via e-postbrygga (members.email → client_portfolios, engångskontrakt) | NYA: src/lib/medlem-portfolj.ts, src/lib/medlem-portfolj-klient.ts, src/app/api/medlem/portfolj/route.ts, src/components/ak1a/portfolj-navet.tsx · ÄNDRAR: src/components/ak1a/portal.tsx, src/lib/ordlista.ts | tsc 0 nya (baslinje 34), commit UTAN push |

Designbeslut (huvudagenten): nyckel `holding:<ticker>` varde 1/0 + antal/
kurs i details, tak 30 aktiva, ticker MÅSTE finnas i analysbiblioteket,
senaste-vinner, serverfastställda värden (§B.3), NEXT_PHASE-fas, request-
skopad läsning. Premiumtiers: Grundlistning = gratis-fas; djupanalys-yta
reserveras som tier-yta via tier-status.ts-mönstret senare (R2: aldrig
autonomt aktiverat). MinPortfoljKort + /min-portfolj orörda (legacy lever).

**STATUS 2026-09-13 (våg 121):** P1 LEVERERAD (våg 119 + korskopplingarna
våg 120, deployad 09:02) och hela portal-spåret slutlevererat med KVD full
(tsc 34 · motorer 107/0/0 · vakten GRÖN · prod 200) + systemkarta 38
system — se STYRELSE-PORTAL-MEGA.md §VÅG 106. Kön härmed tom; nästa våg
väljs av styrelseronden.

## VÅG 122 — "100 % ONLINE-SPÅRET" (2026-09-13, beslut styrelse-mtzou25g-yjq73l)

Förgrodda av huvudagenten: push-blockeringen permanent fixad (7f496757,
data/cache ur indexet, prod = develop, säkringsgren raderad, prod 200).

| Block | Agent | Uppgift (beslutets åtgärd) | Äger (EXKLUSIVT) | Status |
|---|---|---|---|---|
| A PULSVAKT | V122A | Åtgärd 1+10: pm2-pulsvakt var 60 s, autoåterstart pm2 ak1a, larm till sessionen; utred om cron-pumparna lever | verktyg/pulsvakt.mjs, data/infra/contabo/pulsvakt-start.sh, data/infra/contabo/crontab-korrekt.txt | LEVERERAD 48e4c0a6 |
| B EXTERN VAKT | V122B | Åtgärd 2: publik status-endpoint + webhook-larm-endpoint + kundinstruktion (konto väntar kund = R2) | src/app/api/overvaking/**, src/lib/overvaking.ts, data/forskning/EXTERN-OVERVAKNING.md | LEVERERAD 4a7ac845 |
| C HTTPS/START | V122C | Åtgärd 3: bevisa certförnyelse + självstart via läsbara bevis; sudo-steg dokumenteras som väntar kund | data/forskning/HTTPS-SJALVSTART-PROV.md | LEVERERAD 9bc6b111+e4ddc470 |
| D DR-PROV | V122D | Åtgärd 4: färsk Supabase-backup + integritetsbevis + restore-procedur; fullt PG-restore väntar sudo (bevis 2026-09-11 finns) | data/forskning/DR-PROV-2026-09-13.md | LEVERERAD 58605348 (+rättelse 2056cb9c) |
| E SÖK | V122E | Åtgärd 5: server-side sök med cache + reservlösning, kontrakt för pulsvakten | src/app/api/sok/**, src/lib/sok/**, verktyg/testa-sok.mjs (ny) | LEVERERAD 5d51c8b8 (test 19/19) |
| F SEO | V122F | Åtgård 7+8: SEO-A-Ö-checklista (levande, ett avsnitt per rond) + hreflang/sitemap-granskning sv/en/ar + JSON-LD (Course/Article/FAQ) | data/forskning/SEO-A-O.md, src/app/sitemap.ts, src/components/seo/**, JSON-LD i sidfiler | LEVERERAD ec4fde90 |
| G BESLUTSLOGG | V122G | Åtgärd 6+9: BESLUTSLOGG.md + juridikgrinds-rad i STYRELSE-REGELVERK.md + commita STYRELSE-BESLUT.md | data/forskning/BESLUTSLOGG.md, STYRELSE-REGELVERK.md, STYRELSE-BESLUT.md | LEVERERAD f9cf082d |

Gemensamma regler: commit UTAN push (huvudagenten pushar+bygger, ETT bygg/våg).
sudo/behörighetspromptar får INTE köras (de hänger sessionen) — dokumentera istället.
Baslinje tsc = 34 fel. Bygg sker ENDAST i /home/ak1a/AK1 under flock-lås av huvudagenten.

## VÅG 138 — SÖKORDSINVENTERINGEN (2026-09-13, dispatched av huvudagenten; kunddirektiv "fortsätt bygga vidare i djupet" + styrelsebeslut mu098wjw åtgärd 2+3)

Full sökordsinventering sv/en/ar mappad mot 333 kurser + analysbiblioteket →
täckningsglapp → plan för programmatiska long-tail-landningssidor. NIO
parallella subagenter (R4-tak 12, ~9 aktiva), exklusiva utdatafiler under
data/forskning/sokord/ — INGA kodändringar (ren dataleverans, inget bygge).
Syntesen (täckningsmatris + long-tail-plan) ägs av HUVUDAGENTEN efteråt:
data/forskning/SOKORDSINVENTERING-2026.md → styrelseronden beslutar
implementationen.

| Block | Agent | Uppgift | Utdatafil (EXKLUSIVT) | Status |
|---|---|---|---|---|
| S1 KURSORPUS SV | subagent | Extrahera svenska nyckelfraser ur data/seo/kurser (333 JSON: titlar, ämnen, begrepp) | data/forskning/sokord/kurser-sv.md | LEVERERAD 5f9248a1 |
| S2 KURSORPUS EN | subagent | Engelska nyckelfraser ur samma källas en-fält | data/forskning/sokord/kurser-en.md | LEVERERAD 0c7287b5 |
| S3 KURSORPUS AR | subagent | Arabiska nyckelfraser ur samma källas ar-fält | data/forskning/sokord/kurser-ar.md | LEVERERAD 86d663f5 |
| S4 ANALYSBIBLIOTEKET | subagent | data/analyses (11) + data/forskningsbiblioteket (22) + cacher → ticker/bransch/tema-nyckelord | data/forskning/sokord/analysbibliotek.md | LEVERERAD 0d278b42 |
| S5 BLOGGKORPUS | subagent | data/blogg (55) → befintlig ämnestäckning × 3 språk | data/forskning/sokord/blogg.md | LEVERERAD 73dfaf25 |
| S6 INDEX-INVENTORY | subagent | src/app/sitemap.ts + rutter (huvud/en/ar) → vad är indexerbart idag, URL-mönster, strukturella glapp | data/forskning/sokord/inventory.md | LEVERERAD 77aed5dd |
| S7 BRANSCH/DATASET | subagent | branschmedianer-akm2.json, data/stocks, dataset-ytorna → branschteman för programmatiska sidor | data/forskning/sokord/bransch-teman.md | LEVERERAD 0c47fabe |
| S8 FRÅGEMÖNSTER | subagent | Pedagogiska sökmönster sv/en/ar ("hur X", "vad är X", "X för nybörjare") + juridikgrinds-flaggning | data/forskning/sokord/fragemonster.md | LEVERERAD f5c8a7dd |
| S9 EXTERNA SIGNALER | subagent | WebSearch: verkliga sökfrågor inom finansiell utbildning (sv först, en/ar-ekvivalenter), relaterade sökningar | data/forskning/sokord/externa-signaler.md | LEVERERAD 76b40143 |

Gemensamma regler: LÄSA får alla allt; SKRIVA endast egen utdatafil (+ ev.
sondskript i .zcode/). Ingen agent rör src/**, ingen bygger, ingen pushar —
commit "studio: våg 138 <block> — <vad>" UTAN push. Juridikgrind i alla
formuleringar (utbildning, aldrig råd). tsc-baslinje 0 (våg 133) skall
förbli 0 — inga kodändringar alls i denna våg.

## VÅG 140 — MAX-PARALLELL BEVISVÅG: FAQ PÅ 42 POSTER + FAQ-ÖVERSÄTTNING (2026-09-14; dispatch 01:34 DÖD · redispatch 02:03 DÖD · redispatch 3 02:56 + 4 03:07 FRUSNA-dödade 03:32 — ÖVERTAG AV STUDION-HUVUDSESSIONEN rond 17, dispatch 03:33, 12 agenter I FÖRGRUND inom levande session)

Kunddirektiv 2026-09-14 punkt 2: bevisa 12-parallellismen, mät commits/timme
+ tid per leverans. Underlag: data/forskning/sokord/v140-faq-plan.md (slugar
verifierade 01:34 — 42 + 10 = 52, 0 saknade). Spår A: "## FAQ" (3–4 par) sist i
bodyn + en/ar-importfil per agent. Spår B: en/ar för befintliga FAQ-block.
Självkontroll per agent: korKontroller 100p via tsx-skript. Huvudagenten:
central kontrollera → importera endast v140-filer → push prod → speglar ≥ 80 %.
Kontraktsfynd vid redispatch: block EFTER "## FAQ" (disclaimer-raden) får nya
p{n}-nummer ⇒ deras nya nycklar ingår i importfilerna (gamla översättningar
orphanade) — agenterna instruerade om detta + ar-rubrik "## الأسئلة الشائعة"
(termbanken saknar FAQ-term; enhetlig term styrdd centralt).

| Block | Agent | Uppgift | Äger (EXKLUSIVT) | Status |
|---|---|---|---|---|
| A1 FAQ | V140A1 | 5 analysposter H&M/Industrivärden/Investor/NP3/Truecaller | 5 blogg-JSON + v140-a1-faq.json | LEVERERAD 6c725160 |
| A2 FAQ | V140A2 | 5 metodikposter ARR/Volvo Cars/diversifiering/ROIC/portföljrapport | 5 blogg-JSON + v140-a2-faq.json | LEVERERAD 26f7ed35 |
| A3 FAQ | V140A3 | 5 rapportposter balansräkning/arsredovisning/EV-EBITDA/skuld ×2 | 5 blogg-JSON + v140-a3-faq.json | LEVERERAD 163bc6a9 |
| A4 FAQ | V140A4 | v01–v05 (försäljning, ARR, diversifiering, P/S, P/B) | 5 blogg-JSON + v140-a4-faq.json | LEVERERAD 385644e5 |
| A5 FAQ | V140A5 | v06–v09 + v09-roe-avkastning (EV/EBITDA, marginaler, ROE ×2) | 5 blogg-JSON + v140-a5-faq.json | LEVERERAD dfd1df15 |
| A6 FAQ | V140A6 | v10–v14 (skuld, likviditet, stabilitet, patent, varumärke) | 5 blogg-JSON + v140-a6-faq.json | LEVERERAD f909d4f6 (+termfix 4407f6b0) |
| A7 FAQ | V140A7 | v15–v18 (nätverkseffekter, lanseringar, avtal, regulatorik) — v15/v16 arvkontrollerade | 4 blogg-JSON + v140-a7-faq.json | LEVERERAD c5b54513 |
| A8 FAQ | V140A8 | v19–v20 + vad-ar-ev-ebitda + institutionell analys | 4 blogg-JSON + v140-a8-faq.json | LEVERERAD b378ff67 |
| A9 FAQ | V140A9 | vad-ar-roe + vad-ar-skuldsattningsgrad + vågfundament + veckans marknad w34 | 4 blogg-JSON + v140-a9-faq.json | LEVERERAD db4150d2 |
| B1 FAQ-ÖVERS | V140B1 | en/ar för FAQ-blocken på 4 befintliga FAQ-poster | v140-b1-gamlafaq.json | LEVERERAD 51328ae0 |
| B2 FAQ-ÖVERS | V140B2 | en/ar för FAQ-blocken på 3 befintliga FAQ-poster | v140-b2-gamlafaq.json | LEVERERAD 6ee50953 |
| B3 FAQ-ÖVERS | V140B3 | en/ar för FAQ-blocken på 3 befintliga FAQ-poster (P/B, PEG, P/S) | v140-b3-gamlafaq.json | LEVERERAD b32af9f6 |

**AVSLUT 2026-09-14 (våg 148):** samtliga 12 block + termfix levererade
04:20–05:01 (19 commits/h; mätning i worklog våg 140-raderna). Slutled
av huvudagenten våg 148: merge med prod (b99869e4), push, prodbygge
(FAQ synlig), import av v140-filerna + spegelmätning (jfr worklog våg 148).
Nattens läxa är permanent i AGENTFABRIKEN-reglerna (våg 146): ≤3 direkta
Agent-anrop, 4+ via fabriksmanifest.

## NÄSTA I KÖN (observatoriet — underhålls av huvudagenten vid varje vågbokföring)

- ★ STYRELSE-MÅLEN 2026 (data/forskning/STYRELSE-MAL.md, kundorder
  2026-09-15): ronden läser chaftern FÖRST — mål 1 (ordens fullbordande:
  kunduppdrag.json före nya vågor) → mål 2 (beviskultur) → mega A/B/C
  (gap-registret, godkännandeytan g1, kvartalsserien v152) → golv →
  synlighet. Chafterns "nästa tre åtgärder" är köns topp.
- ✓ LEVERERAT våg 140 (FAQ 42+10 poster, 13 commits 04:20–05:01; slutled
  våg 148: merge b99869e4 + prodbygge + import — se worklog)
- ✓ LEVERERAT våg 141–147 (studio-trådens infrastruktur: trådkedja, mål-
  loopen, prompt-kön, huvudtrådens bok, AGENTFABRIKEN, EVIGHETSMOTORN —
  efterbokförda i worklog av våg 148)
- ✓ LEVERERAT våg 148 (trådens permanens: tradHistorik ur db.sqlite +
  mal-återarming + autonom prod-synk; fix 2 = createRequire/bundler);
  VÅG 149-FIX LEVERERAD (ee6a06a2: självvärmande server via
  instrumentation.ts — vaktens kallstartslarm kuras i roten)
- ✓ LEVERERAT våg 149 (2026-09-14): /bolag/{slug} — 100 bolagssidor +
  register livekodade (40f15763, prod-committen; fabrikmerge ba43e980).
  KVD: /bolag 200 med 100 länkar · sitemap 100 URL:er · stickprov
  akrbp-ol/cvx 200 med SEO-titlar · prod 200 · vakten GRÖN · motorer
  107/0/0. Slutled + worklog bokat av hjärtslagssessionen 09:0x;
  SOKORDSINVENTERING-2026.md committad (våg 138-syntesen).
- ✓ LEVERERAT våg 150 (2026-09-14): dataset-aspekter fas A — fabrikens
  u1–u6 (moduler + värderingshub + vit-test + fas A-rapport) 12:25–12:50
  + slutledet u7–u8 (3c2d703f vit-test 37 fel → 0; 9dee0971 register,
  rutt, vy, sitemap) + molnagentens merge fc48a588 + TRÅDMINNE-fixar
  (96c85bb1, a982a500). KVD: sitemap exakt 130 aspekt-URL:er · stickprov
  5 finns = 200, 4 uteslutna = 404 · vit-test 0 fel (4 moduler, 15
  aspekter, 130 sidkontroller, 20 rätt uteslutna) · prod 200 (byggd
  15:21 under flock). TRÅDENS MINNE E2E-BEVIST: test 3 = MINNE LADDAT
  (60 meddelanden nådde sessionen; test 1–2 INGA MINNE före fix 2 =
  före/efter-bevis). Fas B (AKM-poäng-ytor) väntar A2-omprövning.
- ✓ LEVERERAT våg 151 (2026-09-14 16:50, slutled rond 21): granskningskön
  — fabriken körde 14/14 (m1–m6 månadsutkast + g1–g8 SEO-guider), samtliga
  FLYTTKLAR (4 efter verkställd rättning). Rapporter per slug i
  data/blogg-utkast/granskning/ + kund-sammanställning
  SAMMANSTALLNING-2026-09-14.md. Publicering förblir kundens (R2).
  Spårrotation enligt evighetskatalogen (149 SEO-sidor → 150 dataset →
  151 granskning).
- ✓ MEGA-MANIFESTET 7/7 KLART (2026-09-15, status/mega-beslut-styrelsen.json):
  g1 godkännandeytan (56175326) · g2 juridikgrind (ca1e0ff4, :37-pumpa) ·
  g3 audit-spårbarhet (f2589675) · g4 fabrik 2.0 (ef939240) · g5 integritets-
  vakt (a1114594) · g6 GDPR + g7 kvalitetsgrind (fabriksmerges, bl.a. 46e8d61d).
  Styrelsens mega-beslut fullverkställt — R2-ytor förblir kundens.
- ✓ VÅG 152 FAS 2 LEVERERAT (2026-09-15, bokfört rond 28): 10/10 bransch-
  kalendrar i data/blogg-utkast/kvartal/2026-q3/ — 100/100 bolag
  maskinverifierade (rond 28-sond), juridikstickprov 0 rådsförbuds-mönster,
  källor + hämtdatum per bolag; granskningsrond auto-s1 klar (fabriksbarn
  s1-u1..u3: granskningsdokument i blogg-utkast/granskning/). Kalendrarna
  väntar kundpublicering (R2 — godkännandeytan g1 lever, 401-skyddad rutt).
  Fas 3 (läsårt-paket per rappdag, kartan 194e463a) redo att dispatchas.
  startar när fas 2-kalendern levererar.
- ✓ VÅG 157 LEVERERAT (2026-09-15, stängt rond 30 [Φ] på journalbevis):
  journalen (vakt-sidjournal.json) har 87 poster varav 21 /dataset-poster —
  prioriteringen (rond 29, PRIORITERADE_SEKTIONER=["/dataset"]) bevisad live:
  /dataset/energi/* mättes direkt efter basen. Senaste vaktrapport (06:00)
  0 fynd. Aspekttäckningen ackumulerar vidare per rop (~21 platser/körning).
  Vakt-cron hel (17 1,7,13,19 — läkt rond 28, verifierad rond 30: 06:00-rapporten levererad).
- ✓ VÅG 158 LEVERERAT+STÄNGT (2026-09-15, rond 37 [Φ] på maskinbevis): förhandsfrågor
  15 → 30 via fabriksomgångar (u2 2 · extra u3 3 · makro 2 · nästa 3 — DCF/inre
  värde, investmentbolag/NAV, options) med källmärkning + kurslänkar per svar,
  ALLT deterministiskt utan API-kostnad. Regressionstester 83 PASS · 0 FAIL
  (bas 26 · nästa 21 · extra 19 · makro 17) inkl. antistöld G01, kedja H01,
  juridikgrind I/F01, registeräkthet E01 (343 kurser). R2-säker — stängd.
- ✓ VÅG 165 LEVERERAT+STÄNGT (2026-09-15, rond 38 [Φ] på live-bevis): gap 10
  Mermaid levererades redan av våg 168 (`48e14864`: mermaid-visning.tsx 509
  rader + renderingsgren i studio-chat.tsx) — och gap 24 usage-observabilitet
  av våg 169 (`a77bb1a3`: lasV4Anvandning() + /api/studio/tjanster/usage-v4)
  på våg 85 F3:s stats-ground (lasUsage). Live-bevis rond 38: båda rutterna
  401-härdade på localhost (ej 404), prodbygget 17:29 EFTER committen,
  UI-konsumenter studio-forbrukning-panel + utveckling-panel + studio-chat.
  Gap-registret reparerat samma rond (korrumperade tabellrader 23/24/27).
- ✓ VÅG 172 LEVERERAD rond 40 [Φ] (`2cf13fe5`, live-bevis i registrets footer):
  gap 25 v4/conversation/resync — gap-återhämtning (initialWires + commit)
  när revision tappas efter gateway-omstart/missade frames; idag faller
  lasFilandringarV4() då på Write/Edit-motorn. Filägarskap:
  src/lib/studio/studio-transport.ts (HUVUDAGENTEN DIREKT — het fil,
  ALDRIG fabriksbarn). KVD: tsc 0 (projektbinär) + resync-grens mock-test +
  bygg under flock + prod 200. Stängs endast med live-bevis (regel 2).
- ✓ VÅG 173 LEVERERAD+STÄNGT (rond 43 [Φ] på live-bevis): gap 26 sessions-index — protokollrot kurerad (våg 171:s ogiltiga "v4/subscribe" → "v4/conversation/subscribe" + grundfält enligt våg 85-mönstret, rond 42 commit a12203cc). live-bevis 2026-09-16T05:06:14.154Z: sessions-index-rutt GET 401 utan auth + 401 med fel lösenord (monterad+härdad), BUILD_ID 2026-09-16T04:59:21.352Z EFTER commit a12203cc (2026-09-16T03:04:44.000Z), a12203cc ancestor till prod HEAD, prod HTTPS 200.
- ✓ VÅG 174 LEVERERAD rond 41 [Φ] (7/7 PASS, se registrets footer): E2E-flöden i
  studion (401-härdning, chatt-SSE, komprimerings-knapp, bilduppladdning)
  i NYA filer under verktyg/scenariotest/ — fabriks-dugligt (exklusivt
  filägarskap, inget src-rörande).
- ✓ VÅG 175 LEVERERAD+STÄNGT (rond 46 [Φ] på live-bevis — data/vakten/rond46-bevis.json): gap 27 etapp 2 — v4/command sendText-inskickning (envelope §11.1: commandId klientgenererat, clientId = v4ConnectionId, sessionId = levande session, payload {text, requestedDelivery startNow|queue}; baseRevision/baseLogEpoch bryggda tills A6) + NY rutt /api/studio/tjanster/kommando (POST, requireAdmin, text 1–4 000, delivery ∈ {startNow,queue}, GET ⇒ 405). ENDAST sendText (§11.4:s migreringsordning); UI-koppling = feature-avvägning, medvetet senare. STÄNGS ENDAST på live-bevis (regel 2): rutt 401-härdad + bygg efter commit + prod 200.
- ✓ VÅG 176 LEVERERAD (rond 47-50 [Φ], commits `9cef70a4`+`dcc1b6bb` via merge `c5eb885c`, prodbygg 11:19:41Z, prod 200): AI-Mentorn spår 6 — omformat EFTER sond (vågtextens "15 → 25" var föråldrad: fabrikens s6-vågor hade redan växt beståndet). LEVERERAT: (a) samlad kedjeregression `verktyg/testa-ai-mentor-kedja.mjs` — 32/32 PASS på 13-läget (54 monsters: kanonisk fråga per motor inkl tulpanmanin→historia, skuggprober över motorgränser med 0 skuggor, genomströmning + juridikgrind, determinism bitidentisk, källmärkning + kursläkthet på SAMTLIGA, inventarie som fall H-vakt när nya lager tillkommer); (b) widgetens föråldrade ~15-kommentar → kodens sanning (13 lager); (c) SAMTIDIG KUR-släpp: falsklarmsfamiljens 6:e+7:e observation kirurgerad i roten — feljägarens F3-OMTEST vid nätverksfel + pulsvaktens deployPagar-uppskjutning (dcc1b6bb). LIVE-BEVIS pulsvaktskirurgin: varv 3-4 under deployfönstret 11:19-11:21Z loggade "trasig-bygg men deploy pågår — transient, avvaktar" + "statiska tillgångar GRÖNA igen" — nya koden aktiv i prod, noll falsk omstart där gamla pulsvakten omstartade (7:e observationen 09:40:19).
- ✓ VÅG 177 LEVERERAD (rond 52 [Φ] — data-leverans, registret är levande per regel 3): zcode-paritet §11.4 — gap-registret TILLFÖRT 9 nya V/A-rankade poster (28–36) i ZCODE-GAP-REGISTER.md: resolveInteraction (V8/A4 — dialog-kortens svarsväg {resolvedBy}), switchModelConfig (V6/A4), pauseGoal/resumeGoal (V8/A3 — närmaste syskon till mål-motorns befintliga paus), setAutoDrain (V5/A2), köoperationerna sendQueuedNow/editQueueItem/reorderQueueItem/deleteQueueItem (V7/A5), createSession/createSelectionSideSession (V6/A6 — readyFlights-ko §11.3), fakta-typerna qft: applyFileRewind/forkAssistant/editUserQuery/retryTurn/setAssistantFeedback (V6/A6 — v4/command_fact-lagret), UI-kopplingen av sendText (V9/A5 — ÖPPEN men VÄNTAR post 36: §11.4:s feature-avvägning, ersätter dagens styrväg stegvis), och forskningsposten A6 (V9/A4 — felkoder/flight-timeout/delivery-triaden startNow/queue/guide mot mål-loopens -32010-serialisering; blockerar 35; leverans = §11.5-dokument med bevisade signaturer ur bundeln). Alla poster ÖPPNA enligt regel 2 (stängs ENDAST på live-bevis per post); rekommenderad ordning dokumenterad: 36 → 30/28 → 31+32 → 29 → 33/34 → 35. Registrets historiksektion verifierad hel (Rond 40/41-raderna bevarade + rond 52 tillagd).
- ✓ VÅG 178 LEVERERAD (FABRIKEN s8-u3 96a35b14, worklog 2026-09-16 — bokförd av huvudagenten rond 50 [Φ]): Mimosa full-scan — hela trädet mätt FÖRE 905 filer/16 fynd → EFTER 906/0 GRÖN. Falskt-positiv-klassens rotorsakor kurade i mimosa-paritet v1.4 (KONSTANT-PROPAGEERING: filscope-const med ren http(s)-literal propagerar, env/ternary/uttryck ALDRIG + VITTNEN_SHELL_URL-skelett + fönster 5→8), dev.sh-undantaget AVVECKLAT i koden (wait_for_service riktighärdad, skannern bevisar "härdad-kontext"), v85-e2e flyttad ur gitignorad körningsdata till verktyg/e2e-prod-studio-v85.mjs (strukturbokning: kör-verktyg föds i verktyg/ direkt). Bevis: scenariotest 26/26 PASS (20 oförändrade + 6 nya inkl två avgränsningar), standarddomän 682/0 oförändrad, korsinstrument skalfri-vakt GRÖN 175/0, tsc 0, inget bygge. Protokoll data/forskning/OPTIMERING/o29-fullscan-mimosa-s8.md + rådata fullscan-{fore,efter}-2026-09-16.json. Bokningar kvarleverans: 906/0 = ny full-scan-referensbas (återmät efter vågor som tillför filer utanför src/); våg 177 (zcode-registerposter) förblev huvudagent-yta.
- ✓ VÅG 179 LEVERERAD+STÄNGD (rond 51 [Φ] på drift-bevis): pulsvakt-överlevnad (E35-kön item 1, evighetskatalogen spår 9) — (a) ÖVERLEVNADSKEDJAN verifierad existerande: pulsvakten körs som EGEN pm2-process (online, superviserad), pm2-ak1a.service ENABLED i /etc/systemd/system → serveromstart kör pm2 resurrect ur ~/.pm2/dump.pm2 som innehåller pulsvakt (jämte ak1a, ak1a-test, ak1a-pumpor) — crontab-vägen avslogs (auto-policy-blockerad i studio-skalet); (b) KOD: enskild-instans-lås (3e9cda0e) i pulsvakt.mjs EGEN entré — PID-låsfil data/vakten/pulsvakt.las (wx-atomisk, /proc-dödstest, takeover av dött lås, SIGTERM/SIGINT/exit-cleanup ENDAST när filen bär egen pid, fail-open med hogprio-larm vid fs-fel, --test låser ALDRIG); (c) DRIFT-BEVIS 17:49:40Z: pm2 restart pulsvakt → ny pid 1207077 med låsfil + statusfil frisk (lever=true, varv 1, statisk gron), PROD-DUBBELINSTANS-TEST exit 0 "redan igång (pid 1207077)" i skarpt läge, pm2 save → färsk dump (alla fyra processer), prod HTTPS 200/0,08 s; (d) LÅSTEST 6/6 PASS (lås · dubbelinstans-avvis · opåverkad förstainstans · kill-9-takeover · SIGTERM-cleanup · låsfritt --test). Kvarleverans-bokning: full serveromstart kan ej testas utan risk — beviskedjan (enabled unit + färsk dump + pm2-supervision) är vågens stängningsgrund.
- ✓ VÅG 180 LEVERERAD+STÄNGD (rond 53 [Φ]): gap 36 = INSATS A6 — V4-LAGRET §11.5 (7 undersektioner, offset-citerat ur bundeln 3.11.2-24): ackens wire-schema med statusunion {accepted/rejected/stale/duplicate/noop/failed} + result.inputDisposition, retryAck-idempotens, CommandInbox-flödet (queueItemId = "queue_"+commandId deterministiskt), reasonCode-namespaces fullständigt uppräknade (proto 10 · guard 17 · fault.attachment 18+ · fault.command 19 · övriga), qa-registret -32003…-32603 med bevisade meddelanden + MCP-namnrymdsvarningen (samma siffra ≠ samma fel — matcha på reasonCode), delivery-triadens bevisade semantik (startNow: lease acquireForegroundPromotionLease + preempt + AUTOMATISK målpaus "send_now_goal_paused" · queue: steerTurn-mappning · guide: pendingInput med TurnSteerDeliveryChanged-fallback till kö), routing-läget {startNow/enqueue/guide/reject/choice} + heldQueueDisposition-kravet, -32010-förhållandet (äldre session/send avvisar — v4-triaden ersätter serialiseringen), flights: ingen egen flyg-timeout i bundeln (endast projectionEventCommit 25 s) ⇒ studion behåller egen AbortSignal-gräns. Post 35 OBLOCKERAD. Definition-of-done = dokumentet; data-leverans (inget bygge, src orörd).
- ✓ VÅG 181 LEVERERAD+STÄNGD (ronder 54–56 [Φ]): gap 30 pauseGoal/resumeGoal via kommandobussen (V8/A3) — transportmetoder i studio-transport (interface + AppServerTransport + MockTransport-motpol), kommandoruttens typ-gren i /api/studio/tjanster/kommando (401-härdad) + målpanelens spegelben speglaMalStyrningV4 (fel-tolerant; funktionell paus våg 156 består som huvudväg). Live-bevis: POST 401 utan + med fel lösenord, GET 405; pauseGoal/resumeGoal i byggda server-chunks (prodbygg 05:20, pulsvakt GRÖN efteråt); kod 0c6d8eaa + push c9a01fb8 ancestors i prod-HEAD 8d82db48; HTTPS 200. Leveransresan: push väntade ut LEVANDE fabriksbarns yta (rond 55 — ett barns yta städas ALDRIG) och bygg-låset togs av prod-synkens deploy.
- · VÅG 182 BOKAD (registrets ordning 31+32): kö-systemet — setAutoDrain (V5/A2) + köoperationerna sendQueuedNow/editQueueItem/reorderQueueItem/deleteQueueItem (V7/A5, queueItemId-nycklat "queue_<commandId>" enligt §11.5.1). Stängs på live-bevis.
- · VÅG 183 BOKAD (registrets ordning 29 → 33/34): switchModelConfig (V6/A4 — modellbytardrawern ⇄ kommandobussen, kräver readyFlights-ko §11.3); därefter createSession/fakta-typer enligt ordning. Stängs på live-bevis.
- · VÅG 184 BOKAD (registrets ordning 28): resolveInteraction (V8/A4 — dialog- och behörighetskortens svarsväg enligt post 28; registrets högsta öppna V/A-kvot 2,0). Stängs på live-bevis.
- · VÅG 185 BOKAD (gränssnittsvaktens fynd 2026-09-17T17:25-rapporten): /admin·Trafik & Säkerhet + /admin·Konvertering — horisontell överflöd 2px + 1 element utanför viewport i light/390px (mobil) — diagnostisera roten (troligen fast bredd/min-width i panel/tabell), rätta src/ enligt Mimosa-regler, tsc 0, bygg, vakten om GRÖN på de två sidorna. Kvalitetsspåret (evighetskatalogen spår 8); "ett defekt som nå kunden = vaktsystemfel" (våg 105).
- · Programmatiska dataset-teman (S7): ~240–253 sidor — /dataset/[bransch]/[nyckeltal] (tema 1 störst) + akm2/kategori/lagesbild/fcf/vardering/land-teman; gränsregeln <5 mätta MÅSTE med; PREC.ST recommendation/priceTarget ALDRIG syndikeras
- · Evighetskatalogens spår (data/infra/evighetskatalog.md): granskningskön (7 m9-utkast + 8 SEO-guider) = fabriksspekt, dataset-djup, kvartalsrapportserien — välj där när denna kö tunnar
- · Sökordsvolym-validering — LT-betyg är analytiska; Search Console-täckning kräver API-nyckel (R2: väntar kund)
- · Bokföringshygien: SEO-A-O-rondloggen hålls i fas med levererad kod (våg 137-b-lärdomen: dokumentation släpar efter kod annars)
- ✓ [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Fabriksmanifest "register-2" med poster 17/21/22/23 (+11 som femte), exklusivt filägande, sekvensering vid filkonflikt. ROND 30 (Φ): manifestet 5/5 klart (r2a 17 · r2b 21 · r2c 22 `8288eda0` · r2d 23 `45f1a9d4` · r2e 11) — SAMTLIGA sju registerposter STÄNGDA på live-bevis (signaturer i prod-träd + bygg 10:40 + prod 200 + /studio 200). Registret: endast 10 (Mermaid) + 13 (scenariotest) öppna.
- ✓ [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Direkta agenter (≤3): 10X-pelare 9+10 med KVD (tsc 0, flock-bygge, prod 200). — STÄNGDA enligt fullmaktssamträdets punkt 2 med KVD-bevis (STUDIO-10X-PROGRAM.md §52); raden bockad rond 37 [Φ] (bokföringshygien, våg 137-b-lärdomen).
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Sessionen: /dataset-prioritering i vakturvalet, stäng v157 på journalbevis.
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | R2-påminnelse: 11 FLYTTKLAR väntar kundens knapp i godkännandeytan — verkställs aldrig av organen.
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Bokför per rond: worklog + beslutsminne + commit [organ:T] + push prod.
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Bygg konfigintegritetsvakten (direkt agent) — git-versionerade referensfiler för crontab/systemd/nginx, verifiering var 10:e minut, larm vid drift; filägarskap verktyg/konfigintegritet-vakt.mjs
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Härdning av godkännandeytans rutter (direkt agent) — admin-session på varje endpoint inkl publicera, hastighetstak, append-only audit-rad per publicering; filägarskap src/app/api/studio/godkannande/**
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Register 23 LaTeX-rendering med Mermaid-saneringsmönstret (direkt agent), medan fabriken fortsätter auto-s2/dataset-djup
- ✓ [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Verifiera bildservern på port 3987 är död + dokumentera regeln: kunduppladdningar serveras endast via localhost — VERIFIERAD rond 29 (Φ): ss visar INGEN lyssnare på 3987. REGEL: kunduppladdade bilder serveras endast via localhost (bildanalysverktyg når dem aldrig externt; tillfälliga bildservrar är förbjudna).
- [STYRELSEN] 2026-09-15T05:17:12.420Z | styrelse-mu27v0zl-lqp458 | Auditlogg-hook för fabriksbarns död/OOM så framtida nattkriser lämnar spår i spårbarheten
