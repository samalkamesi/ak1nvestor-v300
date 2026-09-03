import { NextRequest, NextResponse } from "next/server";
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ADMIN UTVECKLINGSRADARN — kundägarens kontrollrum för hela utvecklingen.
 *
 * Visar i ett slag:
 *  - Portföljforskningssystemet (P1–P9): universets storlek, cache-hälsa, priser
 *  - AKM2-forskningens landningar (data/forskning/)
 *  - Kvalitetsvaktens senaste status (sektioner PASS/FAIL)
 *  - Språk-/motorrapporter (data/rapporter/)
 *  - Kurser & quiz (deep-courses.json hälsa)
 *
 * SKYDD: samma ADMIN_PASSWORD-mönster som övriga admin-rutter
 * (x-admin-password / Bearer), timing-säker + rate-limit 10/min.
 */

const misslyckade: number[] = [];

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function kontrolleraAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_PASSWORD || "AK1A-2026";
  const urHeader = req.headers.get("x-admin-password");
  const authorization = req.headers.get("authorization");
  const provided = urHeader
    ? urHeader
    : authorization && authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

  const now = Date.now();
  while (misslyckade.length && now - misslyckade[0] > 60_000) misslyckade.shift();
  if (misslyckade.length >= MAX_MISSLYCKADE_PER_MIN) {
    return NextResponse.json({ error: "För många försök — vänta en minut." }, { status: 429 });
  }
  if (!provided || !timingSafeEqual(provided, expected)) {
    misslyckade.push(now);
    return NextResponse.json({ error: "Admin-lösenord krävs." }, { status: 401 });
  }
  return null;
}

const MAX_MISSLYCKADE_PER_MIN = 10;

type FilInfo = { namn: string; dag: string; kb: number };

function listaKatalog(dir: string, suffix?: string): FilInfo[] {
  const abs = path.join(process.cwd(), dir);
  if (!existsSync(abs)) return [];
  try {
    return readdirSync(abs)
      .filter((f) => (suffix ? f.endsWith(suffix) : true))
      .map((f) => {
        const fp = path.join(abs, f);
        const st = statSync(fp);
        return { namn: f, dag: st.mtime.toISOString().slice(0, 10), kb: Math.round(st.size / 1024) };
      })
      .sort((a, b) => (a.dag < b.dag ? 1 : -1));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const fel = kontrolleraAdmin(req);
  if (fel) return fel;

  // 1 · Portföljforskningssystemet
  const portfoljDir = "data/portfolj-system";
  const manifest = existsSync(path.join(process.cwd(), portfoljDir, "manifest.json"))
    ? JSON.parse(readFileSync(path.join(process.cwd(), portfoljDir, "manifest.json"), "utf8"))
    : null;
  const priser = existsSync(path.join(process.cwd(), portfoljDir, "priser.json"))
    ? JSON.parse(readFileSync(path.join(process.cwd(), portfoljDir, "priser.json"), "utf8"))
    : null;
  const fundamentalaFiler = listaKatalog("data/cache", ".json").filter((f) => f.namn.startsWith("fundamental-"));

  const universAntal = manifest?.branscher
    ? (manifest.branscher as Array<{ bolag?: string[] }>).reduce((sum: number, b) => sum + (b.bolag?.length ?? 0), 0)
    : null;

  // 2 · AKM2-forskning
  const forskning = listaKatalog("data/forskning", ".md");

  // 3 · Kvalitetsvakten — senaste sektionsstatus
  let kvalitet: { dag: string; sektioner: Array<{ namn: string; status: string }> } | null = null;
  const kvalFil = path.join(process.cwd(), "data", "rapporter", "kvalitetsrapport-SENASTE.md");
  if (existsSync(kvalFil)) {
    const text = readFileSync(kvalFil, "utf8");
    const sektioner = [...text.matchAll(/^## \d+\. (.+?) — \*\*(PASS|FAIL|MANUELL|SKIP)\*\*$/gm)].map((m) => ({
      namn: m[1],
      status: m[2],
    }));
    kvalitet = { dag: statSync(kvalFil).mtime.toISOString().slice(0, 10), sektioner };
  }

  // 4 · Rapporter (språk, motorvalidering, url-scan)
  const rapporter = listaKatalog("data/rapporter", ".md")
    .filter((f) => !f.namn.startsWith("kvalitetsrapport"))
    .slice(0, 15);

  // 5 · Kurser & quiz — hälsa
  let kurser: { antal: number; quiz: number } | null = null;
  const kursFil = path.join(process.cwd(), "public", "deep-courses.json");
  if (existsSync(kursFil)) {
    try {
      const djup = JSON.parse(readFileSync(kursFil, "utf8")) as Record<
        string,
        { chapters?: Array<{ quiz?: unknown[] }> }
      >;
      let quiz = 0;
      for (const k of Object.values(djup)) {
        for (const kap of k.chapters ?? []) quiz += Array.isArray(kap.quiz) ? kap.quiz.length : 0;
      }
      kurser = { antal: Object.keys(djup).length, quiz };
    } catch {
      kurser = null; // parsfel = hälsoproblem, visas som saknad
    }
  }

  // 6 · Fasplanen ur MEGA-dokumentet (råa tabellrader, statuskolumnen sist)
  let faser: Array<{ fas: string; status: string }> = [];
  const megaFil = path.join(process.cwd(), "MEGA_PROJEKT-PORTFOLJ.md");
  if (existsSync(megaFil)) {
    const text = readFileSync(megaFil, "utf8");
    faser = [...text.matchAll(/^\| \*\*(P\d[^|]*)\*\*[^|]*\|[^|]*\| (✅ 🔄|✅|🔄|⏳|✅ KLAR|🔄 agent pågår|KLAR|agent pågår|kö) \|$/gm)].map(
      (m) => ({ fas: m[1].trim(), status: m[2].trim() }),
    );
    // Fallback: alla tabellrader som börjar på **P
    if (faser.length === 0) {
      faser = [...text.matchAll(/^\| \*\*(P\d[^|]*)\*\*(.*)\| ([^|]*)\|$/gm)].map((m) => ({
        fas: m[1].trim(),
        status: m[3].trim() || "—",
      }));
    }
  }

  return NextResponse.json({
    hamtat: new Date().toISOString(),
    portfoljSystemet: {
      universAntal,
      branscher: manifest?.branscher?.length ?? 0,
      fundamentalaFiler: fundamentalaFiler.length,
      priser: priser?.nivaer?.map((n: { id: string; namn?: string; prisManad?: number }) => ({
        id: n.id,
        namn: n.namn,
        prisManad: n.prisManad,
      })) ?? [],
      manifestDag: manifest?.skapad ?? null,
    },
    forskning,
    kvalitet,
    rapporter,
    kurser,
    faser,
  });
}
