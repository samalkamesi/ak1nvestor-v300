import { NextResponse } from "next/server";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { korRunda, lasSenaste } from "@/lib/autonom/organ-bus";
import { getSupabaseRest } from "@/lib/supabase-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function raknaFilmer(dir: string, suffix: string): Promise<number> {
  try {
    return readdirSync(path.join(process.cwd(), dir)).filter((f) => f.endsWith(suffix)).length;
  } catch {
    return 0;
  }
}

/**
 * GET /api/organ/runda — kör en makro-mikro-koordineringsrunda (OrganBus).
 * Triggbar on-demand; samma logik körs av dagliga cron (Hobby-gräns: 1 gång/dag;
 * Pro-planen låser tätare intervall — se PLAN_MEGASYSTEM.md).
 */
export async function GET() {
  // Signaler (mätt, inte gissat)
  const bloggAntal = await raknaFilmer("data/blogg", ".json");
  const analyser = await raknaFilmer("data/analyses", ".json");
  let kurser = 0;
  try {
    kurser = Object.keys(JSON.parse(readFileSync(path.join(process.cwd(), "public/deep-courses.json"), "utf8"))).length;
  } catch {}

  const rest = getSupabaseRest();
  let besokare7d = 0;
  let medlemmar = 0;
  if (rest) {
    try {
      const sedan = new Date(Date.now() - 7 * 86400_000).toISOString();
      const [aRes, mRes] = await Promise.all([
        fetch(`${rest.origin}/rest/v1/user_activities?created_at=gte.${sedan}&select=session_id`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
        fetch(`${rest.origin}/rest/v1/members?select=id`, { headers: rest.headers, signal: AbortSignal.timeout(10000) }),
      ]);
      if (aRes.ok) besokare7d = new Set(((await aRes.json()) || []).map((r: any) => r.session_id)).size;
      if (mRes.ok) medlemmar = ((await mRes.json()) || []).length;
    } catch {}
  }

  const resultat = await korRunda({
    kurser,
    bloggAntal,
    bloggDagarSedan: 0, // dagens inlägg publicerat; organet loggar färskhet vid cron
    analyser,
    besokare7d,
    konvertering: besokare7d > 0 ? Math.round((medlemmar / besokare7d) * 1000) / 10 : 0,
    medlemmar,
  });

  const historik = await lasSenaste(10);
  return NextResponse.json({ ...resultat, signaler: { besokare7d, medlemmar }, senasteMeddelanden: historik });
}
