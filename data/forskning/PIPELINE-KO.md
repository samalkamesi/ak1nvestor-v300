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
