export const db = null;

export function getBackendStatus() {
  return {
    database: "supabase",
    configured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    tables: 13,
  };
}
