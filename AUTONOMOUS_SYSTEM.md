# AK1A Research Lab — Autonomt System

> Detta dokument definierar de fullständiga principerna för AK1A:s autonoma system.
> Allt automatiserat, allt spårbart, allt MÄTT.

## 1. Systemarkitektur

```
GitHub (kod + statisk data)
  ↓ auto-deploy
Vercel (Next.js production)
  ├── /api/cron/autonom (var 6h) — system health check
  ├── /api/cron/expand-courses (var 12h) — kurs-expansion
  ├── /api/system/status — fullständig status
  ├── /api/mega/tasks — 198 uppgifter (JSON)
  ├── /api/analysis/[ticker] — aktieanalyser (JSON)
  └── /api/supabase/status — Supabase konfiguration
      ↓ (vid behov)
Supabase (dynamisk data)
  ├── members — medlemmar
  ├── bookings — bokningar
  ├── user_activities — aktivitetslogg
  └── system_events — AI-organ beslut
```

## 2. Autonoma Principer

### Princip 1: Statisk data = JSON-filer
All statisk data (mega tasks, case studies, analyser, kurser) lagras som JSON-filer på GitHub.
- **Varför**: Ingen nätverksberoende, fungerar alltid, versionhanterat
- **Uppdatering**: Ändra fil → git push → Vercel deployar automatiskt

### Princip 2: Dynamisk data = Supabase
All dynamisk data (medlemmar, bokningar, loggning) lagras i Supabase.
- **Varför**: Realtids-uppdateringar, säker, skalbar
- **Fallback**: Om Supabase inte svarar → sidan fungerar ändå (statisk data kvar)

### Princip 3: Auto-deploy
Varje `git push` till `main` branch → Vercel deployar automatiskt.
- Ingen manuell deploy
- Rollback vid fel (Vercel automatiskt)
- Build cache för snabbare deploy

### Princip 4: Autonom AI-organ loop
`/api/cron/autonom` körs var 6:e timme av Vercel Cron:
1. Analyserar systemstatus
2. Identifierar vad som behöver förbättras
3. Sparar rapport i `data/export/last-report.json`
4. Returnerar rekommendationer

### Princip 5: Autonom kurs-expansion
`/api/cron/expand-courses` körs var 12:e timme:
1. Hittar grundaste kursen (< 2000 chars per kapitel)
2. Expanderar med template-baserat innehåll
3. Sparar direkt till deep-courses.json
4. Nästa cron-körning expanderar nästa kurs

### Princip 6: MÄTT-validering
Allt som publiceras måste vara:
- **M**ätbart (kan verifieras)
- **Ä**rligt (sant)
- **T**estat (fungerar)
- **T**estat igen (edge cases)

## 3. API-översikt

| Endpoint | Syfte | Datakälla | Frekvens |
|----------|-------|-----------|----------|
| `/api/system/status` | Fullständig systemstatus | JSON + env | On-demand |
| `/api/cron/autonom` | AI-organ health check | JSON | Var 6h |
| `/api/cron/expand-courses` | Kurs-expansion | JSON | Var 12h |
| `/api/mega/tasks` | 198 mega-uppgifter | JSON | On-demand |
| `/api/analysis/[ticker]` | Aktieanalys | JSON | On-demand |
| `/api/supabase/status` | Supabase konfiguration | env | On-demand |

## 4. Data-struktur

### Statisk data (GitHub JSON)
```
data/
├── export/
│   ├── mega-tasks.json        (198 uppgifter)
│   ├── case-studies.json      (201 case studies)
│   ├── system-events.json     (7 events)
│   ├── meeting-protocols.json (1 protokoll)
│   ├── last-report.json       (senaste autonom rapport)
│   └── analyses/
│       ├── PREC-ST.json       (Precise Biometrics)
│       └── VOLCAR-B.json      (Volvo Cars)
├── analyses/                   (samma som export, används av API)
│   ├── PREC-ST.json
│   └── VOLCAR-B.json
└── stocks/PREC-ST/             (per-stock data)
```

### Dynamisk data (Supabase)
```
members          — registrerade medlemmar
client_portfolios — medlemmars portföljer
client_holdings   — innehav i portföljer
client_analyses   — analytiker-uppladdningar
bookings          — bokningar
user_activities   — aktivitetsloggning
system_events     — systemhändelser
meeting_protocols  — AI-organ möten
organ_consultations — AI-organ frågor
mega_tasks        — (backup i Supabase)
case_studies      — (backup i Supabase)
analyses          — (backup i Supabase)
```

## 5. Automations-pipeline

```
Utvecklare gör ändring
  ↓
git commit + push till GitHub
  ↓
Vercel auto-deploy (2-3 min)
  ↓
Vercel Cron kör var 6h:
  ├── /api/cron/autonom → health check + rapport
  └── /api/cron/expand-courses → expandera 1 kurs
  ↓
Systemet förbättras autonomt
  ↓
Nästa deploy inkluderar förbättringarna
```

## 6. Övervakning

### Manuell övervakning
- Öppna `https://lab.ak1nvestor.com/api/system/status` → fullständig status
- Öppna `https://lab.ak1nvestor.com/api/cron/autonom` → trigger health check

### Automatisk övervakning
- Vercel Cron kör var 6h automatiskt
- Vid fel → Vercel skickar email
- Vid build-fel → Vercel rollar tillbaka

## 7. Skalning

### När du växer:
1. **Fler analyser** → lägg JSON i `data/analyses/` → git push
2. **Fler kurser** → lägg i `deep-courses.json` → git push
3. **Fler medlemmar** → Supabase hanterar automatiskt
4. **Mer traffic** → Vercel skalar automatiskt (gratis upp till 100GB)

### Vercel Pro ($20/mån) när:
- Mer än 100GB bandwidth/månad
- Mer än 100h serverless function execution/månad
- Flera team-medlemmar
