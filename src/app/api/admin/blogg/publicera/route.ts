import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  publiceraMedPaket,
  lasUtkast,
  BloggSparningsFel,
  BloggValideringsFel,
} from "@/lib/blogg-utkast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/blogg/publicera — B2-PUBLICERA (VÅG 82 del C, STYRELSE-
 * BLOGG-LAGE-B §D ordagrant). ENBART POST — övriga metoder får Next.js
 * automatiska 405.
 *
 * POST {slug, tags} → publiceraMedPaket:
 *   (1) exporterarKlarPost — 0-FEL-grinden BESTÅR (kontroll-FEL ⇒ 400,
 *       publiceringen nekas, våg 66-grunden);
 *   (2) markeraPublicerad — status=publicerad-raden i lagret;
 *   (3) agent-påminnelsen type="blogg_publicerad" postas (details=paketet)
 *       — main-agenten plockar raden: fil-drop i data/blogg/ + commit vid
 *       nästa main-push. Publika bloggrutter orörda (force-static kvar).
 *
 * Svar: 200 {paket} | 400 {fel} | 503 {fel} — feltexter sanerade (inga
 * nycklar, inga interna detaljer utöver lib:ens egna, avsiktliga texter).
 *
 * SKYDD: requireAdmin (admin-auth.ts — dev-fallback ENBART i development;
 * prod utan ADMIN_PASSWORD ⇒ vägran). Rate-limit 10 fel/min.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

/** Samma slug-kontrakt som lib:en — ^[a-z0-9-]+$ (säkert att eka i feltext). */
const SLUG_RE = /^[a-z0-9-]+$/;

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

export async function POST(req: NextRequest) {
  let kropp: unknown = null;
  try {
    kropp = await req.json();
  } catch {
    kropp = null;
  }
  const body = plockaObjekt(kropp);

  const skydd = requireAdmin(req, body);
  if (skydd) return skydd;

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { fel: "Slug krävs i formatet ^[a-z0-9-]+$ (små bokstäver, siffror, bindestreck)." },
      { status: 400 },
    );
  }

  const utkast = await lasUtkast();
  const befintlig = utkast.get(slug);
  if (!befintlig) {
    return NextResponse.json(
      { fel: `Utkastet "${slug}" finns inte — spara det först.` },
      { status: 400 },
    );
  }

  try {
    const { paket } = await publiceraMedPaket(befintlig, body.tags);
    return NextResponse.json({ paket });
  } catch (e) {
    if (e instanceof BloggValideringsFel) {
      return NextResponse.json({ fel: e.message }, { status: 400 });
    }
    // Persistensfel (lagret nere etc.) ⇒ 503 — "försök igen", aldrig 500.
    // Okända fel saneras till en fast text (ingen läckage av internt).
    const meddelande =
      e instanceof BloggSparningsFel ? e.message : "Okänt fel — publiceringen fullföljdes inte.";
    return NextResponse.json({ fel: meddelande }, { status: 503 });
  }
}
