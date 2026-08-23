import { NextResponse } from "next/server";
import {
  isSupabaseConfigured,
  dbConfig,
  testSupabaseConnection,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/supabase/status
 *
 * Returnerar Supabase-konfigurationsstatus.
 * Används av admin dashboard för att visa migrerings-status.
 */
export async function GET() {
  const configured = isSupabaseConfigured;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const projectRef = url?.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || null;

  // Testa anslutning endast om konfigurerad (med kort timeout)
  // I sandbox: nätverksbegränsning förväntas — returnera konfigurerad status
  let connectionStatus = null;
  if (configured) {
    connectionStatus = {
      connected: false,
      error: "Sandbox-begränsning: kör scripts/migrate-to-supabase.ts lokalt för att testa",
    };
  }

  return NextResponse.json({
    configured,
    url,
    projectRef,
    dbConfig,
    connection: connectionStatus,
    tables: configured
      ? [
          "analyses",
          "ak1_indicators",
          "case_studies",
          "mega_tasks",
          "meeting_protocols",
          "members",
          "client_portfolios",
          "client_holdings",
          "client_analyses",
          "bookings",
          "user_activities",
          "system_events",
          "organ_consultations",
        ]
      : [],
    migrationInstructions: !configured
      ? "Lägg till NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_ANON_KEY i .env"
      : !connectionStatus?.connected
      ? "Kör scripts/supabase-schema.sql i Supabase SQL Editor, sedan scripts/migrate-to-supabase.ts"
      : "Kör scripts/migrate-to-supabase.ts för att migrera lokal data",
  });
}
