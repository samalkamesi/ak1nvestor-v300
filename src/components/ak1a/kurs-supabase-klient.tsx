'use client';

/**
 * KURS-LISTA-SUPABASE — hämtar kurser från Supabase i webbläsaren
 * Arbetsstation 2, 2026-10-03
 *
 * Detta är den PERMANENTA lösningen för alltid färsk data:
 * - Servern (SSDNodes eller Vercel) levererar endast HTML/CSS/JS
 * - Webbläsaren hämtar kursdata direkt från Supabase
 * - ALLTID samma data oavsett vilken server som kör
 * - Nya kurser syns DIREKT (ingen ombyggnad krävs)
 *
 * Användning: Ersätt deep-courses.json-import i sidkomponenter
 * med denna komponent eller useKurser()-hooken.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export interface KursSammanfattning {
  slug: string;
  title: string;
  category: string;
  level: string;
  minutes: number;
  xp: number;
  summary: string;
}

export function useKurser(): {
  kurser: KursSammanfattning[];
  loading: boolean;
  error: string | null;
  antal: number;
  refresh: () => void;
} {
  const [kurser, setKurser] = useState<KursSammanfattning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const hamta = useCallback(async () => {
    if (!SUPA_URL || !SUPA_ANON) {
      setError('Supabase ej konfigurerad');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${SUPA_URL}/rest/v1/courses?select=title,description,level,content&is_published=eq.true&order=title`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPA_ANON,
          Authorization: `Bearer ${SUPA_ANON}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Supabase: HTTP ${res.status}`);
      }

      const data = await res.json();
      const resultat: KursSammanfattning[] = (data || []).map((rad) => {
        const c = rad.content || {};
        return {
          slug: c.slug || '',
          title: rad.title || c.slug || 'Okänd kurs',
          category: c.category || 'Allmänt',
          level: rad.level || 'beginner',
          minutes: c.minutes || c.totalMinutes || 30,
          xp: c.xp || 0,
          summary: rad.description || c.learn || '',
        };
      }).filter(k => k.slug);

      if (mountedRef.current) {
        setKurser(resultat);
        setError(null);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'Kunde ej hämta kurser');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    hamta();
    // Refresh var 5:e minut
    const interval = setInterval(hamta, 5 * 60 * 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [hamta]);

  return {
    kurser,
    loading,
    error,
    antal: kurser.length,
    refresh: hamta,
  };
}

/** Enkel räknare-komponent som visar aktuellt kursantal från Supabase */
export function KursRaknare({ className }: { className?: string }) {
  const { antal, loading } = useKurser();
  if (loading) return <span className={className}>…</span>;
  return <span className={className}>{antal}</span>;
}

/** Lista av kurser från Supabase */
export function KursLista({ limit = 20 }: { limit?: number }) {
  const { kurser, loading, error } = useKurser();

  if (loading) return <div aria-busy="true">Laddar kurser…</div>;
  if (error) return <div role="alert">Kunde ej läsa kurser: {error}</div>;

  return (
    <ul>
      {kurser.slice(0, limit).map((k) => (
        <li key={k.slug}>
          <a href={`/kurser/${k.slug}`}>
            <strong>{k.title}</strong>
            <span> · {k.category} · {k.level} · {k.minutes} min · {k.xp} XP</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
