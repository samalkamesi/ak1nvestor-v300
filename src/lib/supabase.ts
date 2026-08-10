/**
 * Supabase-konfiguration för AK1A Research Lab
 *
 * STATUS: KONFIGURERAD — projekt https://aufrvmesyzsfshvhlsbp.supabase.co
 *
 * Arkitektur:
 * - Prisma + SQLite = primär databas (lokalt, snabb)
 * - Supabase = cloud-backup + framtida primär
 * - Migrering: lokal → Supabase via scripts/migrate-to-supabase.ts
 *
 * Viktigt: @supabase/supabase-js används ENDAST i migreringsskript
 * (scripts/migrate-to-supabase.ts), inte i Next.js runtime — för tungt för Turbopack.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Supabase clients är null i runtime — används bara i migreringsskript
export const supabase = null;
export const supabaseAdmin = null;

export const dbConfig = {
  isSupabase: isSupabaseConfigured,
  isPrisma: true,
  backend: isSupabaseConfigured ? "supabase+prisma" : "prisma-sqlite",
};

export const TABLES = {
  INDICATORS: "ak1_indicators",
  CASES: "case_studies",
  COMBINATIONS: "indicator_combinations",
  PROTOCOLS: "meeting_protocols",
  TASKS: "mega_tasks",
  COURSES: "deep_courses",
  ANALYSES: "analyses",
  MEMBERS: "members",
  CLIENT_PORTFOLIOS: "client_portfolios",
  CLIENT_HOLDING: "client_holdings",
  CLIENT_ANALYSES: "client_analyses",
  BOOKINGS: "bookings",
  USER_ACTIVITIES: "user_activities",
  SYSTEM_EVENTS: "system_events",
  ORGAN_CONSULTATIONS: "organ_consultations",
} as const;

export const SUPABASE_PROJECT = {
  url: SUPABASE_URL,
  projectRef: SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || null,
  hasServiceKey: Boolean(SUPABASE_SERVICE_KEY),
};

/**
 * Testar Supabase-anslutning (används i migreringsskript, inte i dev server)
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  tables?: string[];
}> {
  if (!isSupabaseConfigured) {
    return { connected: false, error: "Supabase inte konfigurerad" };
  }

  try {
    // Dynamic import — bara i Node.js runtime, inte Turbopack
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from(TABLES.SYSTEM_EVENTS)
      .select("id")
      .limit(1);

    if (error) {
      return { connected: false, error: error.message };
    }

    return { connected: true, tables: Object.values(TABLES) };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
