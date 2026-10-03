import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Publika Supabase-värden (anon key = läs-only, säker att exponera)
const SUPA_URL = 'https://aufrvmesyzsfsuhvlsbp.supabase.co';
const SUPA_ANON = 'sb_publishable_P_tqxlp3egxg94_QdgDnVw_SH4WYRg3';

export async function GET() {
  try {
    const res = await fetch(
      SUPA_URL + '/rest/v1/courses?select=title,description,level,content&is_published=eq.true&order=content->>slug',
      { headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON } }
    );
    if (!res.ok) return NextResponse.json({ error: 'Supabase HTTP ' + res.status }, { status: 502 });
    const data = await res.json();
    const kurser = (data || []).map((rad) => {
      const c = rad.content || {};
      return { slug: c.slug || '', title: rad.title || '', category: c.category || '', level: rad.level || '', minutes: c.minutes || 30, xp: c.xp || 0, summary: rad.description || '' };
    }).filter((k) => k.slug);
    return NextResponse.json({ kurser, antal: kurser.length });
  } catch (e) {
    return NextResponse.json({ error: 'Fel: ' + (e.message || 'okänt') }, { status: 500 });
  }
}