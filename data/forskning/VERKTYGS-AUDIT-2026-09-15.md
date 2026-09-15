# VERKTYGSAUDITEN 2026-09-15 — ärlig inventering av varje studioverktyg

> Kunddirektiv: "Titta på vilka verktyg som jobbar och vilka som är falska — jobba så att
> alla verktyg 100 % fungerar och kom ALDRIG tillbaka och säg att allt fungerar om det
> inte gör det på riktigt." Varje rad nedan är LIVE-TESTAD mot prod detta datum; påståenden
> utan bevis står inte här.

## ÄNDEPOUNKTER (alla /api/studio/*)

| Verktyg | Dom | Bevis |
|---|---|---|
| stream GET (tråd+tradHistorik) | ✅ ÄKTA | 200; tråd 58–143 poster stabil över upprepade anrop (S1) |
| mal/status + mal/stream + mål-motor | ✅ ÄKTA | aktiv iteration pågående; återarmning ur disk 7+ bevis |
| session (list/resume/läge/tankestyrka…) | ✅ ÄKTA | 200; fyra lägen live-bevisade (v153) |
| puls (lättvikts) | ✅ ÄKTA | 200, 9–27 ms mot tak 500 (S3) |
| maskin (maskinpulsen) | ✅ ÄKTA | 200 med samlad live-data |
| halsa | ✅ ÄKTA | 200 med barnprocessdata |
| modeller | ✅ ÄKTA | 200; katalogen (glm-5.3 1M-kontext osv.) |
| fardigheter (skills) | ✅ ÄKTA | 200; agentens skills listade |
| filer | ✅ ÄKTA | 200; arbetsyte-träd (p5) |
| minne | ✅ ÄKTA | 200; minnesfiler (p6) |
| anvandning (usage) | ✅ ÄKTA | 200; förbrukning live |
| andringar (diff) | ✅ ÄKTA | 200; diff-trippeln levererad (v164) |
| interaktion | ✅ ÄKTA | 200; dialoger STÄMDA mot källan (KONTROLL-6) |
| subagenter (+avbryt) | ✅ ÄKTA | 200; levande barn visade sig live (v152) |
| audit | ✅ ÄKTA | 200; 185+ rader självmatande |
| godkännande (+publicera) | ✅ ÄKTA | 200; 11 FLYTTKLAR; publicering = kundens knapp (R2) |
| sessions/disk | ✅ ÄKTA | 200; db.sqlite-läsning (u1) |
| sessionstart (hook) | ✅ ÄKTA | POST-only (405 på GET = korrekt); loggen samlar rader |
| styrelse | ✅ ÄKTA | sammanträden bevisade (beslut verkställda v161) |
| uppladdning | ✅ ÄKTA | 200; kundens filer listade |
| tjanster/generera (generateText) | ✅ ÄKTA | POST → riktig modelltext "VERKTYGSKONTROLL" (m7) |
| tjanster/bakgrund | ✅ ÄKTA | 200; tom lista = ärlig (inga jobb just då; subagent-API:t parallellt) |
| **tjanster/automation** | ✅ **ÄKTA SEDAN v166** | **VAR FALSK (501-stubb sedan v91)** — se nedan |
| **tjanster/webblasare** | ⚠️ **ÄRLIGT DOLD — EJ FALSK** | interaction/browserList exponeras ej av runtinen på vår kanal (-32601); rutten svarar 501 {saknas:true} och UI:t DÖLJER panelen — inget falskt verktyg visas kunden |

## AUTOMATION: den falska som blev äkta (v166)

**Rot (bevisad):** runtinens automation/*-metoder finns i bundeln men exponeras EJ på
app-server-kanalen → tjänsten var en 501-stubb sedan våg 91.
**Kur — NATIV MOTOR:** diskregister (data/vakten/automations.json) + verktyg/automation-motor.mjs
i pumpor-daemonen (korMinutvis, 55 s-dedup) eldar varje cron-matchande minut via
/api/studio/stream; CRUD-rutter med strikt 5-fälts-cron (naturligt språk avvisas ärligt).
**E2E-BEVIS (tvåfaldigt):** probe2 eldad 12:35:05, probe3 eldad 12:38:25 — båda
`{"händelse":"eldenad","detalj":"…OK"}` i automation-logg.jsonl + körningar=1 i registret;
DELETE/CRUD verifierade (testerna städade, listan tom).
**Fälla på vägen (hederligt redovisad):** första deployen missade E2E-sloten 12:30 —
korEnGang:s 2-min-dedup krossade minutprecisionen; kurerad med korMinutvis (55 s).

## KVARSTÅENDE ÄRLIGHET
- webblasare: kräver funktionsstöd som runtinens kanal ej ger (eller egen implementering
  på klientsidan) — panelen är DOLD, aldrig falsk. När runtinen exponerar metoden (eller
  en ny version) aktiveras den via R1-kartan.
- Agentens SVAR på automationeldningarna bearbetas i sessionen; trådsvansens tak (60 poster)
  kan döja dem ur vyn — eldningen i sig är ovan bevisad.
