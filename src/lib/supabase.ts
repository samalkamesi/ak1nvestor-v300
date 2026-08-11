/**
 * Supabase-konfiguration för AK1A Research Lab
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Client-side Supabase (anon key)
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Server-side Supabase (service role — FULL access)
export const supabaseAdmin: SupabaseClient | null =
  isSupabaseConfigured && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

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

export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  if (!supabaseAdmin) {
    return { connected: false, error: "Supabase inte konfigurerad" };
  }
  try {
    const { error } = await supabaseAdmin
      .from(TABLES.SYSTEM_EVENTS)
      .select("id")
      .limit(1);
    if (error) return { connected: false, error: error.message };
    return { connected: true };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
