import { NextRequest, NextResponse } from "next/server";

import { fornyaMedlemSession, lasMedlemSession, sattMedlemKakor } from "@/lib/medlem-auth";
import { lasMedlemProgress, TOM_MEDLEM_PROGRESS } from "@/lib/medlem-progress";
import { getCourses } from "@/lib/content";
import { profilLista, profilUrId, raknaProfil, type ProfilMal, type ProfilSteg } from "@/lib/larvag-profiler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * /api/larvag/profil — LÄRVÄGSPROFILERNA (spår 5, Front B: lärvägsdjup per
 * profil). Kurerade lärvägar med handskrivna varför-rader per steg; kärnan
 * bor i src/lib/larvag-profiler.ts (REN: kartan enda dep) — rutterna talar
 * aldrig om pedagogik själva.
 *
 * GET (inget ?profil)  ⇒ { antal, profiler: [{id, titel, kort, ikon,
 *                          antalSteg, minuter}] } — listvyn, gästsäker.
 * GET ?profil=<id>     ⇒ { profil, steg: [...klar-märkta...], mal, klaraSteg }
 *                          — stegen berikas med kapitel (coursedata, våg 99-
 *                          mönstret) och märks klara ur MEDLEMMENS progress;
 *                          gästen ser samma väg utan klara-markeringar.
 *
 * GET ?profil=okänd    ⇒ 404 { fel: "okand-profil" } (deterministiskt).
 *
 * Eko-mönstret: query + session ger ENDAST sammanfattad kontext — inga
 * personuppgifter når svaret; force-dynamic håller personliga klara-
 * markeringar borta från CDN-cachen. Fel ⇒ ALDRIG krasch: listvyn svarar
 * alltid, detaljvyn 404:a endast vid okänt id (ett tips får aldrig störas).
 *
 * Ton: inbjudan, aldrig tvång — pedagogisk plattform, inte investeringsråd.
 */

/** Profil-id: lowercase slug-form (samma vokabulär som kursslugs). */
const PROFIL_ID_RE = /^[a-z0-9-]{1,60}$/;

/** Kapitelberikning (våg 99-mönstret — samma clamp som /api/larvag). */
function berikaKapitel(slug: string, kurser: Record<string, { chapterCount?: number }>): number | undefined {
  const kap = kurser[slug]?.chapterCount;
  return typeof kap === "number" && Number.isFinite(kap) && kap > 0 ? Math.min(999, Math.floor(kap)) : undefined;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const profilRaw = q.get("profil") ?? "";

  // ── Listvyn: alla profiler, kompakta rader (gästsäker, deterministisk) ────
  if (profilRaw === "") {
    const profiler = profilLista();
    return NextResponse.json({ antal: profiler.length, profiler });
  }
  if (!PROFIL_ID_RE.test(profilRaw) || !profilUrId(profilRaw)) {
    return NextResponse.json({ fel: "okand-profil" }, { status: 404 });
  }

  // ── Session → progress (gäst ⇒ TOM — samma toppedekonomi som /api/larvag) ─
  // LOGIN-2.0: utgången access-kaka roteras med refresh-kakan först.
  let session = await lasMedlemSession(req);
  let fornyad: { access: string; refresh: string } | undefined;
  if (session === null) {
    const f = await fornyaMedlemSession(req);
    if (f !== null) {
      session = f.session;
      fornyad = { access: f.access, refresh: f.refresh };
    }
  }
  const progress = session ? await lasMedlemProgress(session.authId) : TOM_MEDLEM_PROGRESS;
  const klaraSet = new Set(progress.klaraKurser);

  // ── Kärnan + klara-markeringar + kapitelberikning ──────────────────────────
  const p = raknaProfil(profilRaw, progress.klaraKurser);
  if (!p) {
    // Race-skydd: id:t verifierades ovan — men motorn lämnar aldrig trasigt.
    return NextResponse.json({ fel: "okand-profil" }, { status: 404 });
  }
  const kurser = getCourses();
  const steg = p.steg.map((s: ProfilSteg) => ({ ...s, klar: klaraSet.has(s.slug), kapitel: berikaKapitel(s.slug, kurser) }));
  const mal: ProfilMal | null = p.mal ? { ...p.mal, kapitel: berikaKapitel(p.mal.slug, kurser) } : null;
  const klaraSteg = steg.filter((s) => s.klar).length;

  const res = NextResponse.json({
    profil: { id: p.id, titel: p.titel, kort: p.kort, ikon: p.ikon, minuter: p.minuter },
    steg,
    mal,
    klaraSteg,
  });
  if (fornyad) sattMedlemKakor(res, fornyad.access, fornyad.refresh);
  return res;
}
