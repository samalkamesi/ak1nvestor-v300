/**
 * Gemensam Supabase REST-konfiguration med strikt värdvalidering.
 *
 * SSRF-skydd: URL:en får endast vara https mot <ref>.supabase.co — localhost,
 * privata nätverk och andra värdar avvisas. Alla server-side-anrop mot
 * Supabase ska gå via denna hjälpfunktion.
 */
export type SupabaseRest = {
  origin: string;
  headers: Record<string, string>;
};

const ALLOWED_HOST_RE = /^([a-z0-9-]+)\.supabase\.co$/i;

function isPrivateHost(h: string): boolean {
  const host = h.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "[::1]" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  );
}

/**
 * Returnerar validerad REST-bas + autentiseringsheaders, eller null om
 * NEXT_PUBLIC_SUPABASE_URL saknas/är ogiltig/pekar på otillåten värd.
 */
export function getSupabaseRest(): SupabaseRest | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!raw || !key) return null;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  if (isPrivateHost(u.hostname)) return null;
  if (!ALLOWED_HOST_RE.test(u.hostname)) return null;

  return {
    origin: u.origin,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  };
}
