/**
 * _s9u2-intentionsradar.mjs — dokvåg s9-u2 2/3 (manifest auto-s9, 2026-09-19)
 * READ-ONLY sond: räkna system_events-rader av typen konvertering_intention
 * (D22:s aktiveringsintentioner) i LEVANDE Supabase-tabellen.
 *
 * Mimosa-kontraktet (syskonpresedens _s9u2-b9-vagscan-rader.mjs): läser .env
 * ENDAST via process.loadEnvFile — nycklar loggas ALDRIG, endast antal och
 * tidsstämplar skrivs ut. Ingen skrivning: enbart GET/HEAD mot PostgREST.
 */
try { process.loadEnvFile(".env"); } catch {}
try { process.loadEnvFile(".env.local"); } catch {}
const BAS = process.env.NEXT_PUBLIC_SUPABASE_URL;
const NYCKEL = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!BAS || !NYCKEL) { console.log("saknar env — avbryter"); process.exit(0); }
const H = { apikey: NYCKEL, Authorization: `Bearer ${NYCKEL}` };

try {
  const cRes = await fetch(
    `${BAS}/rest/v1/system_events?type=eq.konvertering_intention&select=id`,
    { method: "HEAD", headers: { ...H, Prefer: "count=exact" } },
  );
  const total = cRes.headers.get("content-range")?.split("/")[1] ?? "?";
  const rRes = await fetch(
    `${BAS}/rest/v1/system_events?type=eq.konvertering_intention&select=created_at&order=created_at.desc&limit=10`,
    { headers: H },
  );
  const rader = rRes.ok ? await rRes.json() : [];
  console.log(`konvertering_intention: TOTALT ${total} — senaste ${rader.length}:`);
  for (const r of rader) console.log("  ", (r.created_at || "?").slice(0, 19));
} catch (e) {
  console.log(`konvertering_intention: FEL ${String(e?.message || e).slice(0, 60)}`);
}
