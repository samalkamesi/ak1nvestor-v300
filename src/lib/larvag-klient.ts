"use client";

/**
 * LÄRVÄGEN KLIENT (våg 88 — B1-LARVAG): den klientständiga halvan.
 *
 * Kärnan bor på SERVERN (raknaLarvag i src/lib/larvag.ts) — klienten skickar
 * ENDAST en sammanfattad kontext som query (fas + lästillstånd + streak —
 * eko-mönstret: inga personuppgifter, inget som identifierar) och sanerar
 * svaret hårt. Fel/timeout/tömhet ⇒ [] — ett tips får aldrig krascha en yta.
 *
 * rapporteraQuizSvaghet: fire-and-forget-POST till /api/quiz/svaghet vid
 * FELAT quiz-svar (EN anonym radix — keepalive överlever navigation; fel
 * sväljs tyst, signalen får aldrig störa belöningen).
 *
 * Pedagogisk plattform — inte investeringsråd.
 */

import type { KlientKontext } from "./klientkontext"; // typ-only — ingen runtime-cykel
import { harFas2Access, harFas3Access } from "./kurs-access";

// ── Typer (speglar serverns LarvagRek — sanerad delmängd) ────────────────────

export type LarvagRekKlient = {
  slug: string;
  titel: string;
  varför: string;
  ikon: string;
  regel?: string;
};

// ── Query-byggaren (sammanfattad kontext — ALDRIG rådata) ────────────────────

/** Klientens fas ur kurs-access (Fas 3 öppnar Fas 2 — supermängd). */
function fasKlient(): 1 | 2 | 3 {
  if (typeof window === "undefined") return 1;
  try {
    return harFas3Access() ? 3 : harFas2Access() ? 2 : 1;
  } catch {
    return 1;
  }
}

/** /api/larvag-query ur en KlientKontext (lästillstånd + streak + fas). */
export function larvagQuery(k: Pick<KlientKontext, "lasTillstand" | "streak">, antal: number, exkluderaSlug?: string): string {
  const p = new URLSearchParams();
  p.set("fas", String(fasKlient()));
  p.set("lag", k.lasTillstand);
  if (k.streak > 0) p.set("streak", String(Math.min(9999, Math.floor(k.streak))));
  p.set("antal", String(Math.max(1, Math.min(5, Math.floor(antal)))));
  if (exkluderaSlug && /^[a-z0-9-]{1,200}$/i.test(exkluderaSlug)) p.set("exkludera", exkluderaSlug);
  return p.toString();
}

// ── GET: topp-N rek (hårt sanerade) ──────────────────────────────────────────

/**
 * berikaLarvag — AI-Mentorns kontext berikas med lärvägens topp-tips
 * (GET /api/larvag?antal=1, timeout 8 s). Returnerar ALLTID en kontext —
 * vid motstånd DEN OFÖRÄNDRADE (mentorn gissar aldrig, han väntar tyst).
 * Kastar aldrig; kopian är grund (sprid {...k} — kärnan orörd).
 */
export async function berikaLarvag(
  k: KlientKontext,
  exkluderaSlug?: string,
): Promise<KlientKontext> {
  const rek = await lasLarvag(k, 1, exkluderaSlug);
  if (rek.length === 0) return { ...k, larvag: null };
  const r = rek[0];
  return { ...k, larvag: { slug: r.slug, titel: r.titel, varför: r.varför } };
}

/** Sanera ett råd ur svaret — oförutsedd form ⇒ null (aldrig rendera skräp). */
function renRek(rå: unknown): LarvagRekKlient | null {
  if (!rå || typeof rå !== "object") return null;
  const r = rå as Partial<LarvagRekKlient>;
  if (typeof r.slug !== "string" || !/^[a-z0-9-]{1,200}$/i.test(r.slug)) return null;
  if (typeof r.titel !== "string" || !r.titel.trim()) return null;
  return {
    slug: r.slug,
    titel: r.titel.trim().slice(0, 200),
    varför: typeof r.varför === "string" ? r.varför.trim().slice(0, 400) : "",
    ikon: typeof r.ikon === "string" && r.ikon.trim() ? r.ikon.trim().slice(0, 16) : "📚",
    regel: typeof r.regel === "string" ? r.regel.slice(0, 40) : undefined,
  };
}

/**
 * lasLarvag — GET /api/larvag med den sammanfattade kontexten. Ogiltigt
 * svar/nätverksfel ⇒ [] (TYST — ytan renderar bara inget kort).
 */
export async function lasLarvag(
  k: Pick<KlientKontext, "lasTillstand" | "streak">,
  antal = 1,
  exkluderaSlug?: string,
): Promise<LarvagRekKlient[]> {
  try {
    const res = await fetch(`/api/larvag?${larvagQuery(k, antal, exkluderaSlug)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const kropp = (await res.json()) as Record<string, unknown> | null;
    if (!kropp || typeof kropp !== "object" || !Array.isArray(kropp.rek)) return [];
    return kropp.rek.map(renRek).filter((r): r is LarvagRekKlient => r !== null);
  } catch {
    return [];
  }
}

// ── POST: den anonyma svaghetsradixen (fire-and-forget) ──────────────────────

/**
 * rapporteraQuizSvaghet — felat quiz-svar ⇒ EN anonym radix (keepalive;
 * fel sväljs tyst — aldrig await:ad av UI:t, aldrig ett fel för eleven).
 */
export function rapporteraQuizSvaghet(slug: string, kap: number): void {
  try {
    fetch("/api/quiz/svaghet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, kap }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tyst — quiz-upplevelsen är helgarderad */
  }
}
