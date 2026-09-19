/**
 * _s9u2-b9-vagscan-rader.mjs — dokvåg s9-u2 (manifest auto-s9-1789800329491)
 * READ-ONLY sond: räkna och lista system_events-rader av typerna
 * vagscan/signal/organ i LEVANDE Supabase-tabellen (appens projekt).
 *
 * Mimosa-kontraktet: läser .env ENDAST via process.loadEnvFile — nycklar
 * loggas ALDRIG, endast antal/tidsstämplar skrivs ut. Ingen skrivning:
 * enbart GET/HEAD mot PostgREST.
 */
try { process.loadEnvFile(".env"); } catch {}
try { process.loadEnvFile(".env.local"); } catch {}
const BAS = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NYCKEL = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!BAS || !NYCKEL) { console.log("saknar env — avbryter"); process.exit(0); }
const H = { apikey: NYCKEL, Authorization: `Bearer ${NYCKEL}` };

for (const typ of ["vagscan", "signal", "organ"]) {
  try {
    const cRes = await fetch(`${BAS}/rest/v1/system_events?type=eq.${typ}&select=id`, {
      method: "HEAD", headers: { ...H, Prefer: "count=exact" },
    });
    const total = cRes.headers.get("content-range")?.split("/")[1] ?? "?";
    const rRes = await fetch(
      `${BAS}/rest/v1/system_events?type=eq.${typ}&select=created_at&order=created_at.desc&limit=12`,
      { headers: H },
    );
    const rader = rRes.ok ? await rRes.json() : [];
    console.log(`type=${typ}: TOTALT ${total} — senaste ${rader.length}:`);
    for (const r of rader) console.log("  ", (r.created_at || "?").slice(0, 19));
  } catch (e) {
    console.log(`type=${typ}: FEL ${String(e?.message || e).slice(0, 60)}`);
  }
}
