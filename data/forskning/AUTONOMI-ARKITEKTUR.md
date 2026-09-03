# AUTONOMI-ARKITEKTUR — normerande dokument

**Status:** NORMERANDE (gäller från våg 49; ändringar kräver motiv i PROTOKOLL.md)
**Datum:** 2026-09-01
**Författare:** VÅG 49 agent 3 — autonomi-ronden
**Kunddirektiv (ordagrant):** "Jag vill att alla systemen nyttjar sina egna intelligenser i hela hemsidan helt autonomt, helst utan AI men AI ska nyttjas för att nå exceptionalitet."

Detta dokument tolkar direktivet i två lagrade principer som ALL framtidutveckling i AK1A måste följa:

1. **Egen intelligens först och alltid** — varje system har en deterministisk motor och en autonom körkanal. Sajten är FULLSTÄNDIG utan AI.
2. **AI som exceptionalitetslager** — när `ZAI_API_KEY` aktiveras fördjupar AI:n de deterministiska svaren. AI ersätter ALDRIG en motor; den bygger OVANPÅ dess svar.

---

## A. Princip 1: All funktionalitet deterministisk (egna motorer)

### A.1 Regeln

Varje intelligent funktion på sajten ska kunna beskrivas så här:

```
funktion → deterministisk motor (src/lib/*-motor.ts) → autonom kanal (cron/rond) → puls (OrganEvent)
```

- **Motorn** är ren kod: regler, formler, vikter, konstanter. Samma input → samma output. Ingen nätverksberoende AI i beslutspathen. Fullständig karta över alla 42 motorer, deras montering och testtäckning: `data/motorregister.json` (underhålls av motorregister-agenten — källan till "vad finns").
- **Den autonoma kanalen** ser till att motorn gör nytta utan att någon klickar: en cron-rutt (Vercel Cron, max 1×/dag enligt Hobby-plan) eller en befintlig ronds sidoeffekt. KRAV: ingen ny cron om behovet kan täckas av en befintlig rutt.
- **Pulsen** är motorns andetag: ett OrganEvent (`src/lib/organ-event.ts`, `publiceraOrganEvent`) som gör kanalen synlig i kroppsvyn (`/api/kropp` → KroppsvyKort på Min Sida, 60 s-poll). En motor utan puls är osynlig för kroppen — det räknas som ett gap.
- **Fallback alltid:** utan Supabase-konfig returnerar `publiceraOrganEvent` false och motorn kör ändå (fail-safe, samma regel som `src/lib/autonom/organ.ts`).

### A.2 Konsekvenser (normerande)

- En ny motor levereras med: kanal (cron-rutt eller återanvänd rond), OrganEvent-puls och en rad i `/api/kropp`-registret `ORGAN_KALLA_TILL_TYP` (annars syns den inte).
- Cron-schema i `vercel.json`: max EN körning per dag per jobb (`0 H * * *`-form). ALDRIG `*/6`-uttryck — deploy dör tyst på Hobby.
- Alla cron-rutter skyddas med `CRON_SECRET` (om satt) via `?secret=` ELLER `Authorization: Bearer` — samma mönster som `src/app/api/cron/vagscan/route.ts`.
- Puls-fönstret i `/api/kropp` är 2× kanalens kadens (daglig kanal = 48 h "lever", månadsronen = 62 dagar).

---

## B. Princip 2: AI = exceptionalitetslager (zaiAktiv-mönstret)

### B.1 Regeln

`src/lib/zai.ts` är det ENDA AI-lagret. Mönstret som gäller överallt det används (i dag: AI-Mentorn `/api/chatbot`, Short-Seller `/api/shortseller`):

```ts
if (zaiAktiv()) {
  const djup = await zaiChat([...]);       // fördjupning OVANPÅ bassvaret
  if (djup) return berika(bassvar, djup);  // AI:n berikar — ersätter inte
}
return bassvar;                            // deterministiskt svar ALLTID först
```

- `zaiAktiv()` är sann endast när `ZAI_API_KEY` finns i miljön. Utan nyckel: `zaiChat` returnerar null och anroparen kör sin deterministiska bana (chatbot-NLU + V-registret i `/api/chatbot`).
- **Bassvaret konstrueras FÖRST, deterministiskt**, ur egna motorer och register. AI:n får sedan bassvaret + kontext och kan fördjupa, förklara längre, ställa bättre motfrågor — den kan aldrig ändra fakta, poäng eller rekommendations-status (rådgivningsgräns: ALDRIG investeringsråd gäller AI-lagret lika hårt).
- Tidsgräns 25 s, host allow-list (`api.z.ai`, `api.bigmodel.cn`), nyckeln läcker aldrig i felmeddelanden. Vid timeout/fel: deterministiskt svar, inget fel för eleven.
- Gamla planer (`AI_VISION_SPEC.md`, `ZAI_NATIVE_PLAN.md`) beskriver ambitioner; detta dokument är det normerande tillståndet. AI får ALDRIG flyttas in i en motors beslutslogg.

### B.2 Formulering att minas

> AI är syret, inte hjärtat: utan det slår hjärtat ändå — med det känns vågen djupare.

---

## C. Autonomi-tabellen — system → kanal → kadens → kontroll

Läget efter autonomi-ronden (våg 49). ALLA rader har autonom kanal OCH puls. Tider = UTC (Vercel Cron).

| System (motor) | Autonom kanal | Kadens | Puls (kroppsyta) | Kontroll |
|---|---|---|---|---|
| Organ-motor (hälsa/SEO/innehåll/retention) | `/api/cron/autonom` | daglig 00:00 | `autonom_report` → Immunförsvaret | kill-switch `AUTONOM_DISABLED`, 500-raderstak/30 d retention |
| SEO-rond (sitemap-hälsa) | `/api/cron/seo-refresh` | daglig 03:00 | `organ/seo` → Huden | CRON_SECRET; räknar URL:ar deterministiskt |
| Vågkartan (`vagfundament-motor`) | `/api/cron/vagscan` | daglig 05:00 | `type=vagscan` → Sinnena + signal-buss (Vagvisaren) | CRON_SECRET; deterministisk vågmatris V01–V20 × 5 horisonter |
| Datacentralen (4 motorer: vagfundament, analys, netnet, konfluens) | `/api/cron/datacache` | daglig 06:00 | `organ/datacache` → Matsmältningen + cache-kvitto till admin + konfluens-signaler till fas2 | CRON_SECRET; konfluens-skann på hela universumet sker HÄR (ingen egen cron behövs) |
| Mejl-rondan (morgonbriefing) | `/api/cron/email` | daglig 06:30 | `organ/email` → Andningen | CRON_SECRET; köas i `email_kö` tills leverantör konfigureras, tak 100/körning |
| Kvalitetsvakten (7 kontroller) | `/api/cron/kvalitet` | daglig 07:00 | `organ/kvalitetsvakt` → Immunförsvaret + RÖD-varning till admin | CRON_SECRET; `verktyg/kvalitetsvakt.mjs` skriver `data/rapporter/kvalitetsrapport-SENASTE.md` |
| Nyhetscentralen (`nyhets-motor`) | `/api/nyheter/scan` | daglig 08:00 | `organ/nyheter` → Öronen + max 5 signaler till fas2 | CRON_SECRET; påverkans-tröskel 70, deterministisk rankning |
| Kursexpansion (mallbaserad, INGEN AI) | `/api/cron/expand-courses` | daglig 12:00 | `organ/kurser` → Tillväxten | CRON_SECRET (nytt i våg 49 — rutten var oskyddad); 1 kapitel/körning |
| Portföljuppföljning (`analys-motor` + P2/P6-cache) | `/api/cron/portfolj-uppfoljning` | månadsron 1:a 07:00 (per portfölj: mån/kvartal) | `organ/portfolj` → Ryggraden (nytt i våg 49) + notiser till fas2 | CRON_SECRET; intervall-logik per portföljfil, max 6 portföljer/rond |
| Styrelsen (organ-bus ronder) | styrelseronder (befintlig rond-logik) | vid rond | `organ_msg`/beslut/delegation → Hjärnan | P8: grova sammanfattningar utåt |
| XP-synk (elevkärnan) | elevbesök (topplistan) | vid besök | `xp_sync` → Minnet | P8/PGD: aldrig elevnamn/XP-nivåer i publika pulsen |
| Konfluens-spaning på universumet | ingår i `/api/cron/datacache` fas 4 | daglig 06:00 | via Matsmältningen + konfluens-signaler | behovet täckt av befintlig rond — INGEN ny cron |
| AI-lagret (ZAI) | endast vid anrop (chatbot/shortseller) | på begäran | `zaiAktiv()`-status i chatbot-svar (`modell`-fält) | se §B: aldrig i motors beslutslogg, alltid fallback |

Klientpulserna (ingen cron — eleven är hjärtat): Vagvisaren (ekosystemPuls 60 s), KroppsvyKort (`/api/kropp` 60 s → broadcast `ak1a:organ-event`), NotisCenter, chatbot-kontext. EN poll — många prenumeranter via `uiEvent()`.

---

## D. 100 %-kravet — sajten komplett utan AI

**Påstående (normerande):** med `ZAI_API_KEY` borttagen (eller ZAI nere) förlorar sajten INGEN funktionalitet — endast fördjupningsdjupet i konversationsytan minskar.

Kontroll att kravet hålls:

1. **`node verktyg/validera-motorer.mjs`** — kör motorernas deterministiska testfall (PASS/FAIL/SKIP per motor). Rapport landar i `data/rapporter/motorervalidering-<datum>.md` och läses av `/api/kropp` (Sinnena: "Motorer live · validering X PASS / Y FAIL"). En FAIL ska betraktas som brutet kontrakt — motorns deterministiska kärna är skadad.
2. **Kvalitetsvakten** (`/api/cron/kvalitet` daglig 07:00, `verktyg/kvalitetsvakt.mjs`) — 7 kontroller (åäö-bortfall, UI-strängar, JSON-giltighet, länk-validitet, kursdata-konsistens, sitemap-täckning, motorvalidering). Status RÖD (> 9 fel) → varning på signal-bussen till admin.
3. **Kroppspulsen** — varje organ i §C-tabellen ska visa "lever" inom 2× kadens. "okänd" i mer än två kadenser = antingen bruten kanal eller missat i `ORGAN_KALLA_TILL_TYP`-registret — båda är fel som ska rättas.

**Regel vid driftstörning i ZAI:** inget larm, ingen degradering av funktionalitet — chatboten svarar via NLU + V-registret, shortsellern via sin deterministiska bana. AI-bortfall är INTE en incident; motorbortfall ÄR det.

---

## E. Ändringslogg för detta dokument

- 2026-09-01 (våg 49, agent 3): Grundat. Autonomi-ronden fyllde pulsgapen: `organ/portfolj` (månadsronen fick OrganEvent), `organ/kurser` (kursexpansionen fick OrganEvent + CRON_SECRET — rutten var helt oskyddad), `organ/seo` (SEO-ronden fick OrganEvent — resultatet nådde tidigare ingen vy). `/api/kropp` mappar nu alla `organ/*`-källor via `ORGAN_KALLA_TILL_TYP` (nya ytor: Matsmältningen, Öronen, Andningen, Ryggraden, Huden, Tillväxten; Immunförsvaret andas via autonom + kvalitetsvakt; frågefönstret höjt 120→500 rader så månadsorganet ryms). Noll nya cron-jobb — konfluens-spaningen på universumet bor kvar i datacache-rondens fas 4.
