'use client';
import { useState, useEffect } from 'react';

const SUPA_URL = 'https://aufrvmesyzsfsuhvlsbp.supabase.co';
const SUPA_ANON = 'sb_publishable_P_tqxlp3egxg94_QdgDnVw_SH4WYRg3';

export function useKurser() {
  const [kurser, setKurser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function hamta() {
      try {
        setLoading(true);
        const res = await fetch(SUPA_URL + '/rest/v1/courses?select=title,description,level,content&is_published=eq.true', {
          headers: { apikey: SUPA_ANON, Authorization: 'Bearer ' + SUPA_ANON },
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (mounted) {
          setKurser((data||[]).map(r => {
            const c = r.content||{};
            return { slug:c.slug||'', title:r.title||'', category:c.category||'', level:r.level||'', minutes:c.minutes||30, xp:c.xp||0 };
          }).filter(k=>k.slug));
          setError(null);
        }
      } catch(e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    hamta();
    const iv = setInterval(hamta, 5*60*1000);
    return () => { mounted=false; clearInterval(iv); };
  }, []);

  return { kurser, loading, error, antal: kurser.length };
}

export function KursRaknare({ className }) {
  const { antal, loading } = useKurser();
  if (loading) return React.createElement('span',{className},'…');
  return React.createElement('span',{className},String(antal));
}
