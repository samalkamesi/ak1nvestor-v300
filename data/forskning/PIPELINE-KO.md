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
