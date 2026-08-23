# AK1A — Arbetsflöde A/B (produktion + testmiljö)

> Syfte: sidan A (`lab.ak1nvestor.com`) är ALLTID live för klienter.
> All utveckling sker på B. A uppdateras bara med granskad, fungerande kod.

## Arkitektur

| | A — Produktion | B — Testmiljö |
|---|---|---|
| URL | `lab.ak1nvestor.com` | `newak1a.vercel.app` |
| Vercel-projekt | `ak-1` | `newak1a` |
| GitHub-gren | `main` | `develop` |
| Syfte | Kunder använder denna | Bygg, testa, granska |
| Markering | Ingen | Amber-banner "⚠ TESTMILJÖ (B)" överst |

Båda projekten bygger från samma repo (`NewUserAK/AK1`) men olika grenar.

## Dagligt arbetsflöde

```
1. UTVECKLA   arbeta på develop (eller feature-gren → merga till develop)
2. BYGGA B    git push origin develop  → newak1a bygger automatiskt
3. TESTA B    öppna newak1a.vercel.app — kolla att allt ser bra ut
              (B har samma databas som A — testdata hamnar i Supabase,
              radera ev. testmedlemmar efteråt)
4. LYFT TILL A git checkout main && git merge develop && git push origin main
              → ak-1 bygger → lab.ak1nvestor.com uppdateras
5. ALDRIG     pusha direkt till main utan att ha testat på B först
```

## Om A går sönder — akut rollback (30 sekunder)

1. Vercel → ak-1 → **Deployments**
2. Hitta senaste **gröna** deployment (fungerande version)
3. ⋯-menyn → **Instant Rollback to this Deployment**
4. `lab.ak1nvestor.com` är tillbaka på den versionen omedelbart — ingen ombyggnad

Vercel behåller alla tidigare deploymenter, så ALLT som någonsin fungerat kan
återställas med en knapptryckning.

## Backuper — tre oberoende lager

| Lager | Vad | Var | Skyddar mot |
|---|---|---|---|
| Kod | All källkod + allt innehåll | GitHub (varje push = version) | Kodfel, oavsiktliga raderingar |
| Data | Medlemmar, bokningar | Supabase (hanterad, dagliga snapshots) | Dataförlust |
| Innehåll | Kurser, analyser, cases | JSON-filer i repot (198+201+2 objekt) | Databasproblem |

Kommando för manuell databasbackup (kan köras när som helst):
```
node scripts/supabase-health.mjs          # lägesrapport
```

## Regler

- `main` är helig — bara mergar från granskad `develop`
- Databasen delas mellan A och B (samma Supabase) — B-test som skriver data
  (t.ex. registrering) ska städas efter test
- Nya hemligheter läggs i BÅDA projekten (Settings → Environment Variables)
- Byggfel på B = inget att oroa sig för — kunderna märker inget
