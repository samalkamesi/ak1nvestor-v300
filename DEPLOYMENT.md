# AK1A Research Lab — Deployment Guide

## Steg 1: GitHub (5 min)
1. Gå till github.com → skapa konto (eller logga in)
2. Klicka "+" → "New repository"
3. Namn: ak1a-research-lab
4. Private (inte public — din kod är hemlig)
5. Klicka "Create repository"

## Steg 2: Pusha kod (3 min)
I terminalen:
```bash
cd /home/z/my-project
git init
git add .
git commit -m "AK1A Research Lab — initial deploy"
git branch -M main
git remote add origin https://github.com/DIN-ANVÄNDARE/ak1a-research-lab.git
git push -u origin main
```

## Steg 3: Vercel (5 min)
1. Gå till vercel.com → "Log in with GitHub"
2. Klicka "New Project"
3. Välj "ak1a-research-lab" repository
4. Klicka "Deploy" (vänta 2-3 min)
5. Du får URL: ak1a-research-lab.vercel.app

## Steg 4: Environment Variables (2 min)
I Vercel dashboard:
1. Settings → Environment Variables
2. Lägg till:
   - NEXT_PUBLIC_SUPABASE_URL = https://aufrvmesyzsfshvhlsbp.supabase.co
   - NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1...
   - SUPABASE_SERVICE_ROLE_KEY = sb_secret_s2hbh9p82b...
   - DATABASE_URL = file:./db/custom.db
3. Klicka "Save"
4. Gå till Deployments → "Redeploy"

## Steg 5: Supabase Schema (3 min)
1. Gå till supabase.co → ditt projekt
2. SQL Editor → "New Query"
3. Klistra in hela innehållet från scripts/supabase-schema.sql
4. Klicka "Run"

## Steg 6: Migrera data (2 min)
Lokalt i terminalen:
```bash
cd /home/z/my-project
bun run scripts/migrate-to-supabase.ts
```

## Steg 7: Domän (5 min)
### I Vercel:
1. Settings → Domains → "Add Domain"
2. Skriv: ak1nvestor.com → "Add"
3. Skriv: www.ak1nvestor.com → "Add"

### I one.com:
1. Logga in på one.com
2. Domains → DNS Settings
3. Ändra A-record:
   - Namn: @
   - Värde: 76.76.21.21
4. Ändra CNAME:
   - Namn: www
   - Värde: cname.vercel-dns.com
5. Spara

Vänta 15-30 minuter → ak1nvestor.com är LIVE!

## Steg 8: Verifiera
Öppna ak1nvestor.com i webbläsaren.
Du bör se: "Vi ger dig metoden institutionerna använder."
