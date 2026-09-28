import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hyresgastFinns, vaxthusKatalog } from "@/lib/vaxthus/tenant-content";

// VÄXTHUSET Fas 1 (r285) — hyresgästens chatt-API.
// POST: startar agent-runnen (avgrepad — requesten återkommer direkt);
// GET: loggen + status. Autentisering = ADMIN (requireAdmin: lösenord i
// x-admin-password ELLER studions signerade sessions-cookie — Fas 1 har
// stängd registrering, kunden är ende chattaren; hyresgästkonton = Fas 2).
// Säkerhetskontrakt (Mimosa): det avgrepade barnet = FAST skript utan
// argument; slug + kundmeddelandet förs över via tenants-rotens
// chatt-jobb.txt (rad 1 = slug, rad 2+ = meddelande) som runern läser,
// raderar och omvalsvaliderar — tolk-argv bär ALDRIG request-data.

export const dynamic = "force-dynamic";

interface ChattRad {
  ts: string;
  roll: string;
  text: string;
}

function chattVagar(slug: string) {
  const katalog = path.join(vaxthusKatalog(), slug, "chatt");
  return {
    katalog,
    logg: path.join(katalog, "logg.jsonl"),
    flagga: path.join(katalog, "paagar.flagga"),
  };
}

function lasLogg(slug: string): ChattRad[] {
  const { logg } = chattVagar(slug);
  try {
    return fs
      .readFileSync(logg, "utf8")
      .split("\n")
      .filter(Boolean)
      .slice(-100)
      .map((r) => {
        try {
          const p = JSON.parse(r) as Partial<ChattRad>;
          if (typeof p.ts === "string" && typeof p.roll === "string" && typeof p.text === "string") {
            return { ts: p.ts, roll: p.roll, text: p.text };
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter((r): r is ChattRad => r !== null);
  } catch {
    return [];
  }
}

function pagaar(slug: string): boolean {
  const { flagga } = chattVagar(slug);
  try {
    const info = JSON.parse(fs.readFileSync(flagga, "utf8")) as { start?: number };
    // staled flagga (>20 min) rensas — agenten har en timeout på 10 min
    if (typeof info.start === "number" && Date.now() - info.start < 20 * 60_000) return true;
    fs.rmSync(flagga);
  } catch {
    /* ingen flagga */
  }
  return false;
}

// Runerns sökväg i runtime-tillstånd (se POST-kommentaren r288): Turbopack
// får ALDRIG en utvickbar literal i spawn-anropet — env-override först, sedan
// cwd-join, cachat på objektet så analysatorn inte kan vika fram den.
const runnerState = { vag: "" };
function runnerVag(): string {
  if (!runnerState.vag) {
    runnerState.vag =
      process.env.AK1A_VAXTHUS_RUNNER ??
      path.join(process.cwd(), "verktyg", "vaxthus-agent-chatt.mjs");
  }
  return runnerState.vag;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  const { slug } = await ctx.params;
  if (!hyresgastFinns(slug)) return NextResponse.json({ fel: "okänd hyresgäst" }, { status: 404 });
  return NextResponse.json({ status: pagaar(slug) ? "pagaar" : "ledig", meddelanden: lasLogg(slug) });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const body = (await req.json().catch(() => null)) as { meddelande?: string } | null;
  const skydd = requireAdmin(req, body ?? undefined);
  if (skydd) return skydd;
  const { slug } = await ctx.params;
  if (!hyresgastFinns(slug)) return NextResponse.json({ fel: "okänd hyresgäst" }, { status: 404 });
  const meddelande = (body?.meddelande ?? "").trim();
  if (meddelande.length < 2 || meddelande.length > 2000) {
    return NextResponse.json({ fel: "meddelandet ska vara 2–2000 tecken" }, { status: 400 });
  }
  const vagar = chattVagar(slug);
  if (pagaar(slug)) {
    return NextResponse.json({ fel: "agenten arbetar redan — vänta till svaret landat" }, { status: 409 });
  }
  fs.mkdirSync(vagar.katalog, { recursive: true });
  // jobbfilen i tenants-roten: rad 1 = slug, rad 2+ = meddelande — runern
  // läser+raderar den och omvalsvaliderar slug själv
  fs.writeFileSync(path.join(vaxthusKatalog(), "chatt-jobb.txt"), slug + "\n" + meddelande + "\n");
  fs.writeFileSync(vagar.flagga, JSON.stringify({ start: Date.now(), pid: -1 }));
  // r288: Turbopack analyserar spawn-argument statiskt och försöker resolva
  // dem som server-relativa moduler — en direkt path.join(process.cwd(), …)
  // i anropet dödade BYGGET (Module not found '/ROOT/verktyg/vaxthus-agent-
  // chatt.mjs' — två fällda fönster 05:08 + 05:26). Kuren är studio-
  // transportens bevisade mönster: sökvägen lever i RUNTIME-tillstånd som
  // analysatorn inte kan vika ut (env-först, cachat på objektet).
  const barn = spawn("node", [runnerVag()], {
    cwd: vaxthusKatalog(),
    detached: true,
    stdio: "ignore",
  });
  barn.unref();
  return NextResponse.json({ status: "pagaar" });
}
