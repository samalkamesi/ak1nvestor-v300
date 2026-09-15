/**
 * /api/studio/godkannande/publicera — KUNDENS PUBLICERINGSKNAPP (mega g1,
 * styrelsens beslut punkt 1). DETTA ÄR R2-YTAN: rutten existerar ENBART för
 * kundens tryck på den STORA Publicera-knappen i studions godkännandeyta —
 * den verkställer flytten utkast → data/blogg/ och loggar varje tryck till
 * audit-loggen (data/vakten/audit-logg.jsonl, aktor "kund").
 *
 * POST {sokvag}
 *   → {publicerad:true, slug, liveSokvag, meddelande}
 *
 * SKYDDSLAGER (i ordning):
 *   1. requireAdmin — kundens admin-session (samma som övriga studio-ytor).
 *   2. Väntelistsvakt — sokvag MÅSTE stå i den aktuella FLYTTKLAR-listan
 *      (lasGodkannandePoster): granskingsledens verdict är inpassbiljetten;
 *      vilken som helst sökväg går inte att publicera.
 *   3. Engångsvakt — slug får INTE redan finnas i data/blogg/ (409).
 *   4. VÅG 66-GRINDEN — kontrolleraText 0 FEL krävs på exakt det innehåll
 *      som publiceras (samma grind som admin-panelens exportväg).
 *
 * TVÅ UTKASTFORMER:
 *   · BlogPost-form (SEO-guiderna, redan exakt content.ts-form) → grinden +
 *     BYTE-IDENTISK kopia ("drop-in-publicerbar" enligt SEO-specen).
 *   · m9-köform (titel/ingress/bodyMarkdown) → konvertering via
 *     exporteraKlarPost (0-FEL-grinden där): kvitto-avsnittet
 *     "## Granskningsunderlag — maskinens kvitto" stryks, "(utkast)"-suffixet
 *     i titeln stryks, disclaimer sista rad säkerställs, pillar/author enligt
 *     exportkontraktet.
 *
 * EFTER TRYCKET: filen ligger i data/blogg/ på disk — agenten committar den
 * (prod-synk) och den syns på sajten vid nästa driftsättning (bloggroutern
 * är force-static). Rutten rör ALDRIG git (byggen/commits ägs av
 * prod-synken under deploylåset) och ALDRIG databasen.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { BloggValideringsFel, exporteraKlarPost, kontrolleratextRad } from "@/lib/blogg-utkast";
import { skrivAudit } from "@/lib/studio/audit-logg";
import { lasGodkannandePoster, skrivGodkannandeVal } from "@/lib/studio/godkannande";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** JSON-svar utan caching — studio-ytan får aldrig cachas. */
function jsonSvar(kropp: unknown, status = 200): Response {
  return new Response(JSON.stringify(kropp), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: { sokvag?: unknown };
  try {
    kropp = (await req.json()) as { sokvag?: unknown };
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  const sokvag = typeof kropp.sokvag === "string" ? kropp.sokvag.trim() : "";
  if (!sokvag) return jsonSvar({ fel: "Parameter sokvag krävs." }, 400);

  // ── Vakt 2: väntelistan (FLYTTKLAR är inpassbiljetten) ──
  let post: ReturnType<typeof lasGodkannandePoster>["poster"][number] | null = null;
  try {
    post = lasGodkannandePoster().poster.find((p) => p.sokvag === sokvag) ?? null;
  } catch {
    return jsonSvar({ fel: "Väntelistan kunde ej läsas — försök igen." }, 500);
  }
  if (!post) {
    return jsonSvar(
      {
        fel:
          "Posten står inte i väntelistan (FLYTTKLAR) — publicering nekas. Den kan vara redan publicerad eller sakna granskningens FLYTTKLAR-bedömning.",
      },
      404,
    );
  }

  // ── Vakt 3: engångsoperation ──
  const liveSokvag = `data/blogg/${post.slug}.json`;
  const helLive = path.join(process.cwd(), liveSokvag);
  if (existsSync(helLive)) {
    return jsonSvar({ fel: `Slugen "${post.slug}" är redan publicerad i data/blogg/.` }, 409);
  }

  let bytes: Buffer;
  let j: Record<string, unknown>;
  try {
    bytes = readFileSync(path.join(process.cwd(), sokvag));
    j = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
  } catch {
    return jsonSvar({ fel: "Utkastet kunde ej läsas (ogiltig JSON eller saknad fil)." }, 400);
  }
  const md5 = createHash("md5").update(bytes).digest("hex");

  // ── Vakt 4 + former: 0-FEL-grinden, konvertering, atomär skrivning ──
  let utBuffer: Buffer;
  let detalj: string;
  try {
    if (typeof j.titel === "string" && typeof j.bodyMarkdown === "string") {
      // m9-köform → BlogPost via exportmotorn (grinden bor i lib:en).
      const titel = j.titel.replace(/\s*\(utkast\)\s*$/i, "").trim();
      const rensadBody = j.bodyMarkdown
        .replace(/^##\s+Granskningsunderlag[^]*$/m, "")
        .trimEnd();
      const ingress = typeof j.ingress === "string" ? j.ingress : "";
      const { paket } = exporteraKlarPost({
        slug: post.slug,
        titel,
        ingress,
        bodyMarkdown: rensadBody,
      });
      utBuffer = Buffer.from(`${JSON.stringify(paket, null, 2)}\n`, "utf8");
      detalj = "m9-utkast konverterat till BlogPost (kvitto-avsnitt och (utkast)-suffix strukna)";
    } else if (typeof j.title === "string" && typeof j.body === "string") {
      // BlogPost-form — grinden + byte-identisk kopia (drop-in enligt spec).
      const rapport = kontrolleratextRad(
        j.title,
        typeof j.description === "string" ? j.description : "",
        j.body,
      );
      if (rapport.fel.length > 0 || rapport.strukturFel.length > 0) {
        const alla = [
          ...rapport.fel.map((f) => `"${f.fras}" → ${f.ersattning}`),
          ...rapport.strukturFel.map((s) => s.meddelande),
        ];
        return jsonSvar({ fel: `Publicering nekas — 0 FEL krävs (våg 66-grinden): ${alla.join("; ")}`.slice(0, 500) }, 400);
      }
      utBuffer = bytes;
      detalj = "utkastet kopierat byte-identiskt (drop-in-publicerbar)";
    } else {
      return jsonSvar(
        { fel: "Okänd utkastform — varken BlogPost (title/body) eller m9-köutkast (titel/bodyMarkdown)." },
        400,
      );
    }
  } catch (fel) {
    if (fel instanceof BloggValideringsFel) {
      return jsonSvar({ fel: fel.message.slice(0, 500) }, 400);
    }
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Konverteringen misslyckades." },
      500,
    );
  }

  try {
    mkdirSync(path.dirname(helLive), { recursive: true });
    const temp = `${helLive}.tmp-${Date.now()}`;
    writeFileSync(temp, utBuffer);
    renameSync(temp, helLive);
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Filen kunde ej skrivas till data/blogg/." },
      500,
    );
  }

  skrivGodkannandeVal(sokvag, {
    val: "publicerad",
    ts: new Date().toISOString(),
    slug: post.slug,
    liveSokvag,
  });
  skrivAudit(
    "kund",
    "publicera",
    liveSokvag,
    `R2: kundens tryck i studions godkännandeyta — flytt från ${sokvag} (md5 ${md5}); ${detalj}. Syns på sajten efter nästa driftsättning.`,
  );

  return jsonSvar({
    publicerad: true,
    slug: post.slug,
    liveSokvag,
    meddelande:
      "Publicerad! Filen ligger nu i data/blogg/ — agenten committar den och texten syns på sajten efter nästa driftsättning.",
  });
}
