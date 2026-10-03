import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const SUPA_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!SUPA_URL || !SUPA_ANON) {
    return NextResponse.json({ error: 'Supabase ej konfigurerad' }, { status: 500 });
  }

  try {
    const res = await fetch(
      SUPA_URL + '/rest/v1/courses?select=title,description,level,content&is_published=eq.true&order=content->>slug',
      { headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON } }
    );
    if (!res.ok) {
      return NextResponse.json({ error: 'Supabase: HTTP ' + res.status }, { status: 502 });
    }
    const data = await res.json();
    const kurser = (data || []).map((rad) => {
      const c = rad.content || {};
      return {
        slug: c.slug || '',
        title: rad.title || c.slug || '',
        category: c.category || '',
        level: rad.level || '',
        minutes: c.minutes || c.totalMinutes || 30,
        xp: c.xp || 0,
        summary: rad.description || '',
      };
    }).filter((k) => k.slug);
    return NextResponse.json({ kurser, antal: kurser.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Okänt fel' }, { status: 500 });
  }
}