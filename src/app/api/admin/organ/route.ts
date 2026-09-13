import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/lib/admin-auth";
import { parsPipelineKo, utdatafilVagar, type VagRad } from "@/lib/observatoriet";

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
  // VÅG 118: registret lever i data/vakten/ (deploy-säkert runtime-tillstånd;
  // versionering sköts av data-hygienens veckoarkiv).
  const registret = lasJson(
    path.join(rot, "data", "vakten", "organ-registret.json"),
  ) as { rond?: number; organ?: OrganRad[]; historik?: { rond: number; commits: number; doda: string[]; fodd: string[] }[] } | null;

  // VÅG 118 — SENASTE LANDNINGAR (kunden ser resultat direkt i studion):
  // de sex senaste commitarna ur prod-trädet (hash · tid · ämne) + besluts-
  // minnets tre senaste rader — organismens faktiska leveranser, inte dess
  // påståenden.
  let senasteCommits: { hash: string; tid: string; amne: string }[] = [];
  try {
    const { execFileSync } = await import("node:child_process");
    const ut = execFileSync(
      "git",
      ["log", "-6", "--pretty=format:%h|%ad|%s", "--date=short"],
      { cwd: rot, encoding: "utf8", timeout: 10_000 },
    );
    senasteCommits = ut
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((rad) => {
        const [hash, tid, ...amne] = rad.split("|");
        return { hash, tid, amne: amne.join("|").slice(0, 120) };
      });
  } catch { /* git ej tillgängligt — panelen visar registret ändå */ }
  const beslut = svans(path.join(rot, "data", "vakten", "beslutsminne.jsonl"), 3);

  // VÅG 139 — OBSERVATORIET v3 (kunddirektiv: planeringsvy i Organismen-
  // panelen): pågående våg ur PIPELINE-KO:s dispatchlista, berikad med
  // FILBEVIS (finns utdatafilen på disk? är den committad? av vem/när?)
  // samt kön nästa 5 med varför-rader. Statusen kontrolleras mot
  // verkligheten — aldrig bara ett påstående i en tabell.
  interface VagRadBevisad extends VagRad {
    filFinns: boolean;
    commit: string | null;
    commitTid: string | null;
  }
  let planering: {
    vagTitel: string;
    vagRader: VagRadBevisad[];
    nasta: { markering: string; uppdrag: string; varfor: string }[];
  } = { vagTitel: "", vagRader: [], nasta: [] };
  try {
    const koText = fs.readFileSync(
      path.join(rot, "data", "forskning", "PIPELINE-KO.md"),
      "utf8",
    );
    const p = parsPipelineKo(koText);
    const { execFileSync: exec2 } = await import("node:child_process");
    const vagRader: VagRadBevisad[] = p.vagRader.map((r) => {
      const vagar = utdatafilVagar(r.utdatafil);
      const befintliga = vagar.filter((v) => fs.existsSync(path.join(rot, v)));
      const filFinns = befintliga.length > 0;
      let commit: string | null = null;
      let commitTid: string | null = null;
      if (filFinns) {
        try {
          const ut = exec2(
            "git",
            ["log", "-1", "--pretty=format:%h|%ad", "--date=short", "--", befintliga[0]],
            { cwd: rot, encoding: "utf8", timeout: 5_000 },
          ).trim();
          const [h, d] = ut.split("|");
          if (h !== undefined && h !== "") {
            commit = h;
            commitTid = d ?? null;
          }
        } catch { /* ny fil ännu ej committad */ }
      }
      return { ...r, filFinns, commit, commitTid };
    });
    planering = { vagTitel: p.vagTitel, vagRader, nasta: p.nasta.slice(0, 5) };
  } catch { /* PIPELINE-KO ej läsbar — panelen visar övrigt */ }

  // VÅG 122: organismens TOTALA tokenförbrukning (kostnad-loggens sista punkt)
  // — kunden vill se hur den nyttjar sitt 1M-kontext.
  let kostnadTotal: number | null = null;
  try {
    const logg = JSON.parse(
      fs.readFileSync(path.join(rot, "data", "vakten", "kostnad-log.json"), "utf8"),
    ) as { totalTokens: number }[];
    kostnadTotal = logg.length > 0 ? logg[logg.length - 1].totalTokens : null;
  } catch { /* loggen byggs upp */ }

  return NextResponse.json(
    {
      registret: registret ?? { rond: 0, organ: [], historik: [] },
      senasteCommits,
      beslut,
      kostnadTotal,
      pumper: {
        rond: svans(path.join(rot, "data", "vakten", "styrelse-rond.log"), 6),
        hjartslag: svans(path.join(rot, "data", "vakten", "hjartslag.log"), 8),
        vakt: svans(path.join(rot, "data", "vakten", "senaste-korning.txt"), 3),
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
