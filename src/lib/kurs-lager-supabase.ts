/**
 * KURS-LAGER — läser kursdata från SUPABASE (ALLTID aktuell)
 * Arbetsstation 2, 2026-10-03
 *
 * Detta lager ersätter filläsning av public/deep-courses.json.
 * Fördel: samma data på ALLA servrar (SSDNodes + Vercel + vilken som).
 * Nya kurser syns DIREKT — ingen ombyggnad krävs.
 *
 * Använder befintliga `courses`-tabellen i Supabase:
 *   title, description, level, content (JSONB med allt vårt data)
 *
 * Mimosa: nycklar från env; fallback till filläsning om Supabase nere.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _klient = null;
function klient() {
  if (!_klient && SUPA_URL && SUPA_ANON) {
    _klient = createClient(SUPA_URL, SUPA_ANON);
  }
  return _klient;
}

// Cache: 5 minuter
const CACHE_MS = 5 * 60 * 1000;
let _cache: { data: Record<string, unknown> | null; tid: number } = { data: null, tid: 0 };

/** Supabase konfigurerat? */
export function supabaseKonfigurerad(): boolean {
  return Boolean(SUPA_URL && SUPA_ANON);
}

/**
 * Hämta alla kurser — från Supabase (primärt) eller fil (fallback).
 * Returnerar samma format som deep-courses.json: { slug: kursdata }
 */
export async function lasAllaKurser(): Promise<Record<string, unknown> | null> {
  const k = klient();

  // Försök Supabase först
  if (k) {
    const nu = Date.now();
    if (_cache.data && nu - _cache.tid < CACHE_MS) {
      return _cache.data;
    }

    try {
      const { data, error } = await k.from("courses").select("title, description, level, content").eq("is_published", true);
      if (!error && data && data.length > 0) {
        const resultat: Record<string, unknown> = {};
        for (const rad of data) {
          const content = rad.content as Record<string, unknown> | null;
          const slug = (content?.slug as string) || "";
          if (!slug) continue;
          resultat[slug] = {
            slug,
            category: content?.category || "",
            weight: content?.weight || "",
            chapterCount: content?.chapterCount || 0,
            totalMinutes: content?.totalMinutes || rad.description?.length || 0,
            title: rad.title,
            summary: rad.description || "",
            minutes: content?.minutes || 0,
            xp: content?.xp || 0,
            level: rad.level || "",
            learn: content?.learn || "",
            why: content?.why || "",
            chapters_list: content?.chapters_list || [],
            history: content?.history || "",
            chapters: content?.chapters || [],
            lynchSection: content?.lynchSection || "",
            grahamSection: content?.grahamSection || "",
            ak1Section: content?.ak1Section || "",
          };
        }
        _cache = { data: resultat, tid: nu };
        return resultat;
      }
    } catch {
      // Supabase misslyckades — fall tillbaka till fil
    }
  }

  // Fallback: läs från fil (samma beteende som tidigare)
  return lasFranFil();
}

/** Hämta EN kurs */
export async function lasKurs(slug: string): Promise<unknown | null> {
  const alla = await lasAllaKurser();
  return alla?.[slug] ?? null;
}

/** Hämta antal kurser */
export async function antalKurser(): Promise<number> {
  const k = klient();
  if (k) {
    try {
      const { count } = await k.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);
      if (count !== null && count !== undefined) return count;
    } catch {}
  }
  const alla = await lasAllaKurser();
  return alla ? Object.keys(alla).length : 0;
}

/** Fallback: läs från fil */
function lasFranFil(): Record<string, unknown> | null {
  try {
    const filvag = path.join(process.cwd(), "public", "deep-courses.json");
    return JSON.parse(fs.readFileSync(filvag, "utf8"));
  } catch {
    return null;
  }
}

/** Töm cache */
export function tomCache(): void {
  _cache = { data: null, tid: 0 };
}
