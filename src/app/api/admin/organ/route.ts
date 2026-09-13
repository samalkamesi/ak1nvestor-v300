import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * /api/admin/organ (VÅG 110) — organsystemets läs-API för admin-panelen.
 *
 * Serverar:
 *   · registret (data/forskning/organ-registret.json — organ A-Ö, fitness,
 *     födslar/dödsfall, obduktioner, evolutionshistorik)
 *   · pump-loggarnas svansar (styrelse-rond + hjärtslag + vaktens senaste)
 *     så panelen visar LIVE-status på 24/7-maskineriet
 *
 * SKYDD: requireAdmin (samma som övriga admin-API:r). Endast läsning —
 * evolutionen sker uteslutande via verktyg/organ-fabrik.mjs (cron-ronden).
 */

interface OrganRad {
  bokstav: string;
  namn: string;
  uppdrag: string;
  status: "aktiv" | "död";
  fodd: string | null;
  dod: string | null;
  leveranserSista2: number[];
  totaltLeveranser: number;
  foralder: string | null;
  obduktion: string | null;
}

function lasJson(fil: string): unknown {
  try {
    return JSON.parse(fs.readFileSync(fil, "utf8"));
  } catch {
    return null;
  }
}

function svans(fil: string, rader: number): string[] {
  try {
    return fs
      .readFileSync(fil, "utf8")
      .trim()
      .split("\n")
      .slice(-rader);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const nej = requireAdmin(req);
  if (nej) return nej;
  const rot = process.cwd();
  // VÅG 116: registret lever i data/vakten/ (deploy-säkert runtime-tillstånd;
  // versionering sköts av data-hygienens veckoarkiv).
  const registret = lasJson(
    path.join(rot, "data", "vakten", "organ-registret.json"),
  ) as { rond?: number; organ?: OrganRad[]; historik?: { rond: number; commits: number; doda: string[]; fodd: string[] }[] } | null;

  return NextResponse.json(
    {
      registret: registret ?? { rond: 0, organ: [], historik: [] },
      pumper: {
        rond: svans(path.join(rot, "data", "vakten", "styrelse-rond.log"), 6),
        hjartslag: svans(path.join(rot, "data", "vakten", "hjartslag.log"), 8),
        vakt: svans(path.join(rot, "data", "vakten", "senaste-korning.txt"), 3),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
