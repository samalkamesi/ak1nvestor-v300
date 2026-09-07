import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getSupabaseRest } from "@/lib/supabase-rest";
import {
  exporteraKlarPost,
  lasUtkast,
  markeraPublicerad,
  sparaUtkast,
  kontrolleratextRad,
  BloggSparningsFel,
  BloggValideringsFel,
  type BloggStatus,
} from "@/lib/blogg-utkast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/admin/blogg — BLOGGPANELENS data-rutt (VÅG 80b del B, ADMIN-MEGA
 * steg 2 — BYGGKONTRAKT VÅG 80b §Del B, "WordPress-kärnan").
 *
 * GET  → lista alla utkast (senaste-vinner per slug) med status + aktuell
 *        kontrollstatus (varumärkes+FEL-räkning per post, räknad live).
 * POST { action } → fyra åtgärder:
 *   "spara"      {slug, titel, ingress, bodyMarkdown, status?, ny?}
 *                — validerar enligt lib:en; ny=true kräver ledig slug
 *                  (unik-tvingad); "publicerad" avvisas (endast exportvägen).
 *   "kontrollera" {titel, ingress, bodyMarkdown}
 *                — kontrolleratextRad utan skrivning (panelens rapportvy).
 *   "status"     {slug, status:"granskad"}
 *                — utkast→granskad kräver 0 FEL i kontrolleraText (våg
 *                  66-grinden); sparar ny rad med oförändrat innehåll.
 *   "exportera"  {slug, tags?}
 *                — LÄGE A: PAKETEXPORT. Bygger den klara JSON-posten
 *                  (BlogPost-formen) med 0-FEL-gate + disclaimer tillagd
 *                  om den saknades, markerar utkastet publicerat i lagret
 *                  (endast insläppet för den statusen) och returnerar
 *                  paketet. Filen droppas i data/blogg/<slug>.json av
 *                  main/agent + main-push → live (bloggroutern renderar
 *                  den automatiskt med metadata/OG).
 *
 * SKYDD: requireAdmin-skriv (admin-auth.ts — dev-fallback ENBAST i
 * development; prod utan ADMIN_PASSWORD ⇒ 500). Rate-limit 10 fel/min.
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

function plockaObjekt(rå: unknown): Record<string, unknown> {
  return rå && typeof rå === "object" && !Array.isArray(rå) ? (rå as Record<string, unknown>) : {};
}

function strang(v: unknown): string {
  return typeof v === "string" ? v : "";
}

// ── GET — panelens lista: alla utkast + kontrollstatus ──────────────────────

export async function GET(req: NextRequest) {
  const skydd = requireAdmin(req);
  if (skydd) return skydd;

  const utkast = await lasUtkast();
  const poster = [...utkast.values()]
    .map((p) => {
      const rapport = kontrolleratextRad(p.titel, p.ingress, p.bodyMarkdown);
      return {
        slug: p.slug,
        titel: p.titel,
        ingress: p.ingress,
        bodyMarkdown: p.bodyMarkdown,
        status: p.status,
        av: p.av,
        version: p.version,
        uppdaterad: p.uppdaterad,
        kontroll: {
          felAntal: rapport.fel.length + rapport.strukturFel.length,
          varningAntal: rapport.varningar.length + rapport.strukturVarningar.length,
          godkand: rapport.godkand,
          ord: rapport.ord,
          readingMinutes: rapport.readingMinutes,
        },
      };
    })
    // Nyast uppdaterad först — panelens lista andas som en redaktion.
    .sort((a, b) => b.uppdaterad.localeCompare(a.uppdaterad));

  return NextResponse.json({ poster });
}

// ── POST — action: spara | kontrollera | status | exportera ─────────────────

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

  const action = strang(body.action);

  // ── kontrollera — rapport utan skrivning ─────────────────────────────────
  if (action === "kontrollera") {
    const rapport = kontrolleratextRad(strang(body.titel), strang(body.ingress), strang(body.bodyMarkdown));
    return NextResponse.json({
      ok: true,
      rapport: {
        fel: rapport.fel,
        varningar: rapport.varningar,
        strukturFel: rapport.strukturFel,
        strukturVarningar: rapport.strukturVarningar,
        godkand: rapport.godkand,
        ord: rapport.ord,
        readingMinutes: rapport.readingMinutes,
      },
    });
  }

  // ── spara — nytt eller uppdaterat utkast (utkast/granskad) ───────────────
  if (action === "spara") {
    const rest = getSupabaseRest();
    if (!rest) {
      return NextResponse.json(
        { error: "Supabase ej konfigurerat — utkast kan inte sparas utan lagret (NEXT_PUBLIC_SUPABASE_URL/nyckel saknas i miljön)." },
        { status: 500 },
      );
    }
    const status = strang(body.status) || "utkast";
    if (status !== "utkast" && status !== "granskad") {
      return NextResponse.json(
        { error: 'Status måste vara "utkast" eller "granskad" — "publicerad" sätts enbart via exportvägen.' },
        { status: 400 },
      );
    }
    // Grinden (granskad kräver 0 FEL) bor i lib:en — sparaUtkast kastar
    // BloggValideringsFel som mappas till 400 här under.
    try {
      const post = await sparaUtkast(
        {
          slug: strang(body.slug),
          titel: strang(body.titel),
          ingress: strang(body.ingress),
          bodyMarkdown: strang(body.bodyMarkdown),
          status: status as BloggStatus,
        },
        body.ny === true,
      );
      return NextResponse.json({
        ok: true,
        post,
        meddelande: `Utkast sparat — ${post.slug} v${String(post.version)} (${post.status}).`,
      });
    } catch (e) {
      if (e instanceof BloggValideringsFel) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      const meddelande = e instanceof BloggSparningsFel ? e.message : "Okänt fel vid sparandet — utkastet sparades INTE.";
      return NextResponse.json({ error: meddelande }, { status: 500 });
    }
  }

  // ── status — utkast → granskad med 0-FEL-grind ───────────────────────────
  if (action === "status") {
    const slug = strang(body.slug);
    const status = strang(body.status);
    if (status !== "granskad") {
      return NextResponse.json(
        { error: 'Statusbyte här kan endast gå till "granskad" — "publicerad" sätts enbart via exportvägen (action "exportera").' },
        { status: 400 },
      );
    }
    const utkast = await lasUtkast();
    const befintlig = utkast.get(slug);
    if (!befintlig) {
      return NextResponse.json({ error: `Utkastet "${slug}" finns inte — spara det först.` }, { status: 404 });
    }
    // Grinden (0 FEL) körs av sparaUtkast på det SPARADE innehållet —
    // statusbytet validerar alltid lagrets senaste-vinner-rad.
    try {
      const post = await sparaUtkast(
        {
          slug: befintlig.slug,
          titel: befintlig.titel,
          ingress: befintlig.ingress,
          bodyMarkdown: befintlig.bodyMarkdown,
          status: "granskad",
        },
        false,
      );
      return NextResponse.json({
        ok: true,
        post,
        meddelande: `"${befintlig.slug}" satt till granskad (v${String(post.version)}) — 0 FEL i kontrolleraText.`,
      });
    } catch (e) {
      if (e instanceof BloggValideringsFel) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      const meddelande = e instanceof BloggSparningsFel ? e.message : "Okänt fel vid statusbytet — raden sparades INTE.";
      return NextResponse.json({ error: meddelande }, { status: 500 });
    }
  }

  // ── exportera — Läge A: det klara paketet (0-FEL-gate + publicerad-rad) ──
  if (action === "exportera") {
    const slug = strang(body.slug);
    const utkast = await lasUtkast();
    const befintlig = utkast.get(slug);
    if (!befintlig) {
      return NextResponse.json({ error: `Utkastet "${slug}" finns inte — spara det först.` }, { status: 404 });
    }
    try {
      // (1) 0-FEL-grinden + paketbygge (disclaimer tillagd om den saknades).
      const { paket, rapport } = exporteraKlarPost(befintlig, body.tags);
      // (2) "publicerad" i lagret — ENBART via denna väg (kontraktet).
      await markeraPublicerad(befintlig);
      return NextResponse.json({
        ok: true,
        paket,
        rapport: {
          fel: rapport.fel,
          varningar: rapport.varningar,
          strukturFel: rapport.strukturFel,
          strukturVarningar: rapport.strukturVarningar,
          godkand: rapport.godkand,
          ord: rapport.ord,
          readingMinutes: rapport.readingMinutes,
        },
        filnamn: `${paket.slug}.json`,
        meddelande:
          `Klar post exporterad — droppa filen i data/blogg/${paket.slug}.json och committa (main-push → live; bloggroutern renderar den med metadata/OG). ` +
          `Utkastet markerades publicerat i lagret (Läge A: paketexport).`,
      });
    } catch (e) {
      if (e instanceof BloggValideringsFel) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      const meddelande = e instanceof BloggSparningsFel ? e.message : "Okänt fel vid exporten — paketet levererades INTE.";
      return NextResponse.json({ error: meddelande }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: 'Okänd action — använd "spara", "kontrollera", "status" eller "exportera".' },
    { status: 400 },
  );
}
