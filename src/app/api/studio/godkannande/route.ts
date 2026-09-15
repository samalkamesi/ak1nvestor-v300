/**
 * /api/studio/godkannande — GODKÄNNANDEYTA (mega g1 — styrelsens beslut
 * punkt 1): studions "väntar-på-dig"-lista över FLYTTKLART granskat
 * innehåll, med kundens publiceringsknapp i UI:t.
 *
 * GET (inga params)
 *   → {hamtat, antal, poster[], redanLive[]} — poster med titel, typ
 *     (seo-guide | m9-serie), status (FLYTTKLAR | FLYTTKLAR EFTER
 *     RÄTTNING), md5 (utkastfilens fingeravtryck), en förhandsvisningsrad
 *     och kundens ev. registrerade val. Källor: granskningsprotokollen i
 *     data/blogg-utkast/granskning/ + data/forskning/M9-GRANSKNING-2026-09.md
 *     + data/forskning/SEO-GUIDER-2026-09.md (se lib/studio/godkannande.ts
 *     för sanningsordningen). Slugar som redan står i data/blogg/ listas
 *     ALDRIG som väntande — de rapporteras i redanLive.
 *
 * POST {sokvag, val:"behall"}
 *   → {ok:true, sokvag, val} — markerar ENBART kundens val i
 *     data/vakten/godkannande-val.json (atomärt) + audit-rad. Denna rutt
 *     publicerar ALDRIG: R2 (styrelseregelverket) — publicering är
 *     kundens knapp och går via DEN SEPARATA rutten
 *     /api/studio/godkannande/publicera, som bara svarar på kundens tryck
 *     och loggar till audit-loggen. Andra val än "behall" avvisas här.
 *
 * SKYDD: requireAdmin på ALLA metoder (samma admin-session som övriga
 * studio-rutter). Svaret bär aldrig innehåll utanför listans kontrakt.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
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

// ── GET — väntelistan ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  try {
    const { poster, redanLive } = lasGodkannandePoster();
    return jsonSvar({
      hamtat: new Date().toISOString(),
      antal: poster.length,
      poster,
      redanLive,
    });
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Godkännandelistan kunde ej byggas." },
      500,
    );
  }
}

// ── POST — markera kundens val (ALDRIG publicering) ──────────────────────────

export async function POST(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  let kropp: { sokvag?: unknown; val?: unknown };
  try {
    kropp = (await req.json()) as { sokvag?: unknown; val?: unknown };
  } catch {
    return jsonSvar({ fel: "Ogiltig JSON-kropp." }, 400);
  }
  const sokvag = typeof kropp.sokvag === "string" ? kropp.sokvag.trim() : "";
  if (!sokvag) return jsonSvar({ fel: "Parameter sokvag krävs." }, 400);
  if (kropp.val !== "behall") {
    return jsonSvar(
      {
        fel:
          'Endast val "behall" markeras här — publicering är kundens beslut (R2) och går via knappen Publicera (/api/studio/godkannande/publicera, som loggar till audit).',
      },
      400,
    );
  }

  try {
    const { poster } = lasGodkannandePoster();
    const post = poster.find((p) => p.sokvag === sokvag);
    if (!post) {
      return jsonSvar(
        { fel: "Posten finns inte i väntelistan — den kan vara publicerad eller saknar FLYTTKLAR-status." },
        404,
      );
    }
    skrivGodkannandeVal(sokvag, {
      val: "behall",
      ts: new Date().toISOString(),
      slug: post.slug,
    });
    skrivAudit("kund", "godkannande-val", sokvag, `Behåll i utkast — kundens markering i studions godkännandeyta (R2): ${post.titel}`);
    return jsonSvar({ ok: true, sokvag, val: "behall" });
  } catch (fel) {
    return jsonSvar(
      { fel: fel instanceof Error ? fel.message.slice(0, 200) : "Valet kunde ej sparas." },
      500,
    );
  }
}
