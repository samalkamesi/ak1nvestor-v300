/**
 * Supabase-konfiguration för AK1A Research Lab
 *
 * STATUS: Ej konfigurerad ännu. Projektet använder Prisma + SQLite.
 *
 * FÖR ATT AKTIVERA SUPABASE:
 * 1. Skapa ett projekt på https://supabase.com
 * 2. Lägg till i .env.local:
 *    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *    SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
 * 3. Kör SQL-migrering i Supabase SQL Editor (se scripts/supabase-schema.sql)
 * 4. Ändra isSupabaseConfigured till true nedan
 * 5. Kör bun run scripts/migrate-to-supabase.ts för att flytta data
 *
 * Data som ska migreras:
 * - data/analyses/*.json → supabase table "analyses"
 * - CaseStudy, Ak1Indicator, etc. → motsvarande supabase-tabeller
 * - UserActivity, SystemEvent → behålls i SQLite för prestanda (cache)
 */

export const isSupabaseConfigured = false;
export const supabase = null;
export const supabaseAdmin = null;
export const dbConfig = {
  isSupabase: false,
  isPrisma: true,
  backend: "prisma-sqlite" as const,
};

export const TABLES = {
  INDICATORS: "ak1_indicators",
  CASES: "case_studies",
  COMBINATIONS: "indicator_combinations",
  PROTOCOLS: "meeting_protocols",
  TASKS: "mega_tasks",
  COURSES: "deep_courses",
  ANALYSES: "analyses", // ny tabell för stock-analysis-view data
} as const;
