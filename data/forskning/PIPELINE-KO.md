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
| A1 FAQ | V140A1 | 5 analysposter H&M/Industrivärden/Investor/NP3/Truecaller | 5 blogg-JSON + v140-a1-faq.json | DISPATCHAD (rond 18) |
| A2 FAQ | V140A2 | 5 metodikposter ARR/Volvo Cars/diversifiering/ROIC/portföljrapport | 5 blogg-JSON + v140-a2-faq.json | DISPATCHAD (rond 18) |
| A3 FAQ | V140A3 | 5 rapportposter balansräkning/arsredovisning/EV-EBITDA/skuld ×2 | 5 blogg-JSON + v140-a3-faq.json | DISPATCHAD (rond 18) |
| A4 FAQ | V140A4 | v01–v05 (försäljning, ARR, diversifiering, P/S, P/B) | 5 blogg-JSON + v140-a4-faq.json | DISPATCHAD (rond 18) |
| A5 FAQ | V140A5 | v06–v09 + v09-roe-avkastning (EV/EBITDA, marginaler, ROE ×2) | 5 blogg-JSON + v140-a5-faq.json | DISPATCHAD (rond 18) |
| A6 FAQ | V140A6 | v10–v14 (skuld, likviditet, stabilitet, patent, varumärke) | 5 blogg-JSON + v140-a6-faq.json | DISPATCHAD (rond 18) |
| A7 FAQ | V140A7 | v15–v18 (nätverkseffekter, lanseringar, avtal, regulatorik) — v15/v16 redan levererade 01:34, KONTROLLERA + färdigställ v17/v18 | 4 blogg-JSON + v140-a7-faq.json | DISPATCHAD (rond 18) |
| A8 FAQ | V140A8 | v19–v20 + vad-ar-ev-ebitda + institutionell analys | 4 blogg-JSON + v140-a8-faq.json | DISPATCHAD (rond 18) |
| A9 FAQ | V140A9 | vad-ar-roe + vad-ar-skuldsattningsgrad + vågfundament + veckans marknad w34 | 4 blogg-JSON + v140-a9-faq.json | DISPATCHAD (rond 18) |
| B1 FAQ-ÖVERS | V140B1 | en/ar för FAQ-blocken på 4 befintliga FAQ-poster | v140-b1-gamlafaq.json | DISPATCHAD (rond 18) |
| B2 FAQ-ÖVERS | V140B2 | en/ar för FAQ-blocken på 3 befintliga FAQ-poster | v140-b2-gamlafaq.json | DISPATCHAD (rond 18) |
| B3 FAQ-ÖVERS | V140B3 | en/ar för FAQ-blocken på 3 befintliga FAQ-poster | v140-b3-gamlafaq.json | DISPATCHAD (rond 18) |

**ÖVERTAGNOTIS (2026-09-14 04:05, rond 18 — hjärtslagssession):** rond 17:s
dispatch 03:33 dog ~03:4x–03:51 (femte dödsfallet i natt; agenternas sonder
skrev 03:38–03:40, sedan tystnad; app-server omstartad 03:51). Mönstret:
12 SAMTIDIGA agenter dödar sessionen (OOM-misstänkt) — våg 138:s 9 parallella
fungerade hela natten. Rond 18 tar över med GROPAR à 6: grop 1 = A1–A6
(dispatch ~04:07), grop 2 = A7–A9 + B1–B3 startar när grop 1 levererat.
Mätning (kunddirektiv): dispatch-tid per grop + commit-tidsstämplar → tid
per leverans + commits/timme i worklog. ÖVRIGA INSTANSER: AVSTÅ tills denna
notis säger LEVERERAD. Studions skal fortfarande degraderat (bash-script,
kill, node -e, sammansatta kommandon hänger) — enkla korta kommandon samt
`node <skriptfil>` fungerar; subagent-skal är felfria. v15/v16 ligger
smutsiga i trädet sedan 01:34-leveransen (A7 kontrollerar + färdigställer).

## NÄSTA I KÖN (observatoriet — underhålls av huvudagenten vid varje vågbokföring)

- ▶ PÅGÅR: Våg 140 (se ovan) — bokföring sker vid vågens slut
- ✓ LEVERERAT våg 139 (commit b2aa5972, rebasad på dator-agentens fcefa714): Observatoriet v3 — planeringsvy i Organismen-panelen (src/lib/observatoriet.ts parsar denna fil, API:t berikar med FILBEVIS, panelen visar pågående våg + nästa i kön + senaste landningar) · mekanisk kvalitetsgrind verktyg/kvalitetsgrind.mjs (.git/hooks/pre-commit, DUBBELBEVISAD: avslag vid R2-självreferens + genomslag efter fix med tsc 0) · S1–S9 bokförda LEVERERADE · juridikgrinds-titelfix Volvo Cars ("rekommendation"→"slutsats", sv+en+ar) · våg 138-syntes data/forskning/SOKORDSINVENTERING-2026.md (täckningsmatris + trespårsplan). NOTA BENE: dator-agentens parallella grindvariant lever i verktyg/hooks/pre-commit (core.hooksPath-modell) — två aktiveringsmodeller sida vid sida, konsolidering = styrelsefråga.
- · Våg 141-förslag: /bolag/{slug} — 100 bolagssidor på befintlig data (SOKORDSINVENTERING-2026 glapp 1: störst sökvolym-täckning per kodrad; "ABB nyckeltal"-longtail)
- · Programmatiska dataset-teman (S7): ~240–253 sidor — /dataset/[bransch]/[nyckeltal] (tema 1 störst) + akm2/kategori/lagesbild/fcf/vardering/land-teman; gränsregeln <5 mätta MÅSTE med; PREC.ST recommendation/priceTarget ALDRIG syndikeras
- · Sökordsvolym-validering — LT-betyg är analytiska; Search Console-täckning kräver API-nyckel (R2: väntar kund)
- · Bokföringshygien: SEO-A-O-rondloggen hålls i fas med levererad kod (våg 137-b-lärdomen: dokumentation släpar efter kod annars)
