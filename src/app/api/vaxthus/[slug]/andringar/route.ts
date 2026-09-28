import path from "node:path";
import { execFile } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { hyresgastFinns, vaxthusKatalog } from "@/lib/vaxthus/tenant-content";

// VÄXTHUSET Fas 1 (r287) — hyresgästens ÄNDRINGSLOGG (läs-vänlig git-historik).
// Säkerhetskontrakt: git anropas med ENBART fasta argument (inga request-
// data i argv); hyresgästens yta binds via cwd efter slug-validering.

export const dynamic = "force-dynamic";

interface Andring {
  hash: string;
  datum: string;
  meddelande: string;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;
  const { slug } = await ctx.params;
  if (!hyresgastFinns(slug)) return NextResponse.json({ fel: "okänd hyresgäst" }, { status: 404 });
  const yta = path.join(vaxthusKatalog(), slug);
  const rader = await new Promise<Andring[]>((lyckas) => {
    execFile(
      "git",
      ["log", "--format=%h|%ad|%s", "--date=iso-strict", "-n", "50"],
      { cwd: yta, timeout: 15_000 },
      (fel, ut) => {
        if (fel) return lyckas([]);
        lyckas(
          String(ut)
            .split("\n")
            .filter(Boolean)
            .map((rad) => {
              const [hash, datum, ...resten] = rad.split("|");
              return {
                hash: hash ?? "",
                datum: datum ?? "",
                meddelande: resten.join("|") || "",
              };
            })
            .filter((a) => a.hash.length > 0),
        );
      },
    );
  });
  return NextResponse.json({ andringar: rader });
}
