# ☀️ Morgonrapport — natten 2026-08-23

> Allt du behöver veta när du vaknar. TL;DR: **databasen är räddad (17,7M → ~0 rader),
> skribenten är stoppad, sajten har vuxit från 1 till 459 crawlbara URL:er, och ett NYTT
> säkert AI-organsystem är byggt. Allt är commitat lokalt — inte pushat.**

## 1. Supabase-krisen — LÖST ✅

| | Före | Efter |
|---|---|---|
| Rader | 17 711 048 | ~0 i loggtabellerna (några hundra konfigrader kvar) |
| CPU | 100% (18h/dag) | Skribenten avstängd — normal belastning |
| Disk | 9,1 GB | TRUNCATE frigör direkt; planner-statistik synkar inom ett dygn |

**Vad som hände:** Ditt SQL-block (pg_cron-avstängning + TRUNCATE) som du körde innan
du somnade fungerade. Min städrobot verifierade och plockade rester. Skribenten var
pg_cron-jobb inuti databasen från gamla "AK1A Gold"-systemet.

**Verifiering:** `update_logs` = 0 rader och växer inte (testat två gånger, 50s intervall).

## 2. Vad jag byggde i natt ✅

### A. Säker AI-organ-plattform (din önskan — byggd RÄTT)
- `src/lib/autonom/organ.ts` — bounded motor: **kill-switch** (`AUTONOM_DISABLED=1`),
  **hårt tak 500 loggrader**, **30 dagars retention**, **EN skrivning per körning**
- 4 organ: Hälsa (198 tasks + 225 kurser), SEO (bloggfärskhet + föråldrade analyser),
  Innehåll (nästa expansionskurs), Retention (självrengörande vakt)
- `/api/autonom/status` — publik insyn i gränser och aktivitet
- Testat live: motorn rapporterar `healthy`, 225/225 kurser djupa, 23 blogginlägg
- Säkerhetsdesignen dokumenterad i AUTONOMOUS_SYSTEM.md §7

### B. V01–V20-bloggserien (Pelare 3 i 100x-planen)
- 20 nya artiklar genererade från kursdata (`data/blogg/`) med Lynch/Graham/AK1-perspektiv
- Totalt 23 inlägg — var och en med Article JSON-LD och internlänkar till kurser

### C. Infrastruktur
- `scripts/supabase-inventory.mjs` / `supabase-purge.mjs` / `supabase-health.mjs`
- `scripts/supabase-cleanup.sql` (för framtida bruk)
- `scripts/generate-v-series.mjs` — artiklar kan regenereras när kurser expanderas
- Migreringsskriptet `.mjs` redo när AK1A-tabellerna skapats

## 3. Vad DU behöver göra (3 saker, ~10 min)

1. **Skapa AK1A:s 13 tabeller** — SQL Editor, klistra in `scripts/supabase-schema.sql`
   från repot (eller be mig — jag ger dig det som ett klistra-och-kör-block)
2. **Vercel → Settings → Environment Variables** (för ak-1-projektet), lägg till:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://aufrvmesyzsfsuhvlsbp.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_P_tqxlp3egxg94_QdgDnVw_SH4WYRg3`
   - `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_s2hbh9p82bVtQSaabYX7AQ_dhWxSBlT`
   - `MIGRATE_SECRET` = valfri lång slumpmässig sträng (låser migrerings-endpointen)
   - ALDRIG `DATABASE_URL`
3. **Redeploy med cache rensad** (Deployments → ⋯ → Redeploy → "clear cache")
   — då slutar Register API visa gamla Prisma-fel

Efter det: säg till, så kör jag `node scripts/migrate-to-supabase.mjs` (migrerar 198
tasks + 201 cases + analyser + protokoll) och verifierar hela kedjan.

## 4. Säkerhet — gör när du hinner
- Rotera service-nyckeln (Supabase → Settings → API) — den har passerat chatten
- Byt databaslösenordet (Settings → Database → Reset) — inget använder det just nu
- Supabase → Edge Functions: kolla om gamla funktioner finns (vi stoppade pg_cron,
  men en snabb koll att inga schemalagda funktioner finns är klokt)

## 5. Siffror för morfikakaffeet

- Sitemap: **459 URL:er** (startade natten med 1)
- Statiskt genererade sidor: **470** (225 kurser + 201 cases + 23 blogg + analyser + mer)
- Bygget: ✅ grönt, lint rent på alla nya filer
- **Committat lokalt: `902fe10` + `0939f08`** (599 filer) — INTE pushat, säg till om du vill
- Worklog: Task 75–76 dokumenterade

## 6. Säkerhetshärdning som tillkom under natten

Säkerhetsscannern krävde fixar innan commit — bra sådan:
- **SSRF**: 10 API-routes byggde Supabase-URL:er ur miljövariabler utan kontroll.
  Ny gemensam helper `src/lib/supabase-rest.ts` — endast `https://*.supabase.co`,
  localhost/privata nätverk avvisas. Alla routes refaktorerade och testade.
- **Path traversal**: 5 döda engångsskript togs bort (2 hade hårda sökvägar från en
  främmande maskin, 1 var beroende av borttagen Prisma). Finns kvar i git-historien.
- `MIGRATE_SECRET`-låset på migrerings-endpointen är på plats i kod — lägg till
  variabeln i Vercel (steg 3 ovan) så den blir aktiv.
