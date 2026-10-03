/**
 * KURS-LAGER — läser kursdata från Supabase (ALLTID aktuell)
 * Arbetsstation 2, 2026-10-03
 *
 * Ersätter filläsning (public/deep-courses.json) med Supabase-läsning.
 * Fördel: samma data på ALLA servrar (SSDNodes + Vercel + vilken som helst).
 * Nya kurser syns DIREKT — ingen ombyggnad krävs.
 *
 * Mimosa: fasta https-värdar; nycklar från env; fallback till fil om Supabase nere.
 */

import { createClient } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy-init (klienten skapas först vid användning — undviker kallstart-kostnad)
let _klient = null;
function klient() {
  if (!_klient && SUPA_URL && SUPA_ANON) {
    _klient = createClient(SUPA_URL, SUPA_ANON);
  }
  return _klient;
}

// Cache: 5 min (kurser ändras sällan, men nya syns inom 5 min)
const CACHE_MS = 5 * 60 * 1000;
let _cache = { data: null, tid: 0 };

/** Kontrollera om Supabase är konfigurerat */
export function supabaseKonfigurerad(): boolean {
  return Boolean(SUPA_URL && SUPA_ANON);
}

/** Hämta alla kurser från Supabase (med cache) */
export async function lasAllaKurser(): Promise<Record<string, unknown> | null> {
  const k = klient();
  if (!k) return null;

  // Cache
  const nu = Date.now();
  if (_cache.data && nu - _cache.tid < CACHE_MS) {
    return _cache.data;
  }

  try {
    const { data, error } = await k.from("kurser").select("*");
    if (error) {
      console.error("Supabase-läsning misslyckades:", error.message?.slice(0, 100));
      return _cache.data; // returnera gammal cache om ny läsning misslyckas
    }

    // Konvertera array → objekt (samma format som deep-courses.json)
    const resultat: Record<string, unknown> = {};
    for (const rad of data || []) {
      resultat[rad.id] = {
        slug: rad.id,
        category: rad.category,
        weight: rad.weight,
        chapterCount: rad.chapter_count,
        totalMinutes: rad.total_minutes,
        title: rad.title,
        summary: rad.summary,
        minutes: rad.minutes,
        xp: rad.xp,
        level: rad.level,
        learn: rad.learn,
        why: rad.why,
        chapters_list: rad.chapters_list,
        history: rad.history,
        chapters: rad.chapters,
        lynchSection: rad.lynch_section,
        grahamSection: rad.graham_section,
        ak1Section: rad.ak1_section,
      };
    }

    _cache = { data: resultat, tid: nu };
    return resultat;
  } catch (e) {
    console.error("Supabase-anrop fel:", (e as Error).message?.slice(0, 100));
    return _cache.data; // fallback till cache
  }
}

/** Hämta EN kurs från Supabase */
export async function lasKurs(slug: string): Promise<unknown | null> {
  const k = klient();
  if (!k) return null;

  try {
    const { data, error } = await k.from("kurser").select("*").eq("id", slug).single();
    if (error || !data) return null;

    return {
      slug: data.id,
      category: data.category,
      weight: data.weight,
      chapterCount: data.chapter_count,
      totalMinutes: data.total_minutes,
      title: data.title,
      summary: data.summary,
      minutes: data.minutes,
      xp: data.xp,
      level: data.level,
      learn: data.learn,
      why: data.why,
      chapters_list: data.chapters_list,
      history: data.history,
      chapters: data.chapters,
      lynchSection: data.lynch_section,
      grahamSection: data.graham_section,
      ak1Section: data.ak1_section,
    };
  } catch {
    return null;
  }
}

/** Hämta plattformssiffror från Supabase */
export async function lasSiffror(): Promise<Record<string, number> | null> {
  const k = klient();
  if (!k) return null;

  try {
    const { data, error } = await k.from("plattform_siffror").select("nyckel, varde");
    if (error) return null;

    const resultat: Record<string, number> = {};
    for (const rad of data || []) {
      resultat[rad.nyckel] = rad.varde;
    }
    return resultat;
  } catch {
    return null;
  }
}

/** Hämta kurser per språk (spegel) */
export async function lasKurserSpegel(lang: string): Promise<unknown[] | null> {
  const k = klient();
  if (!k) return null;

  try {
    const { data, error } = await k.from("kurser_spegel").select("*").eq("lang", lang);
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/** Töm cache (tvinga ny läsning vid nästa anrop) */
export function tomCache(): void {
  _cache = { data: null, tid: 0 };
}
