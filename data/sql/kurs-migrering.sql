-- ============================================================
-- KURS_MIGRERING — Supabase schema för AK1A:s kursbibliotek
-- Arbetsstation 2, 2026-10-03
--
-- PORTABILT: ren standard-SQL — fungerar med PostgreSQL,
-- Supabase, eller vilken SQL-databas som helst. Inga
-- leverantörsspecifika funktioner. När kunden bytar
-- från Supabase → exportera med pg_dump → importera.
-- ============================================================

-- Huvudtabell: kurser
CREATE TABLE IF NOT EXISTS public.kurser (
  id TEXT PRIMARY KEY,              -- slug (t.ex. 'v01-forsaljningstillvaxt')
  category TEXT NOT NULL,           -- kategori (t.ex. 'TILLVÄXT')
  weight TEXT,                      -- vikt (t.ex. 'KRITISK')
  chapter_count INTEGER DEFAULT 0,  -- antal kapitel
  total_minutes INTEGER DEFAULT 0,  -- total läsningstid
  title TEXT NOT NULL,              -- kursens titel
  summary TEXT,                     -- kort sammanfattning
  minutes INTEGER DEFAULT 0,        -- faktisk lästid
  xp INTEGER DEFAULT 0,            -- XP-poäng
  level TEXT,                       -- nivå (Nybörjare/Intermediate/Avancerad)
  learn TEXT,                       -- vad eleven lär sig
  why TEXT,                         -- varför detta är viktigt
  chapters_list JSONB,              -- lista av kapitelrubriker
  history TEXT,                     -- historisk kontext
  chapters JSONB,                   -- alla kapitel med innehåll (STORT FÄLT)
  lynch_section TEXT,               -- Lynch-perspektiv
  graham_section TEXT,              -- Graham-perspektiv
  ak1_section TEXT,                 -- AK1A-perspektiv
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för snabb sökning
CREATE INDEX IF NOT EXISTS idx_kurser_category ON public.kurser(category);
CREATE INDEX IF NOT EXISTS idx_kurser_level ON public.kurser(level);
CREATE INDEX IF NOT EXISTS idx_kurser_title ON public.kurser USING gin(to_tsvector('swedish', title));

-- Spegeltabell: kurser_spegel (en/ar översättningar)
CREATE TABLE IF NOT EXISTS public.kurser_spegel (
  id TEXT PRIMARY KEY,              -- slug (samma som originalet)
  lang TEXT NOT NULL DEFAULT 'en',  -- 'en' eller 'ar'
  title TEXT NOT NULL,
  summary TEXT,
  chapters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id, lang)
);

CREATE INDEX IF NOT EXISTS idx_spegel_lang ON public.kurser_spegel(lang);

-- Siffror-tabell (sökvägsdata som tidigare låg i siffror.json)
CREATE TABLE IF NOT EXISTS public.plattform_siffror (
  nyckel TEXT PRIMARY KEY,          -- t.ex. 'kurser', 'quiz', 'xp_totalt'
  varde INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) — publikt läsbart
ALTER TABLE public.kurser ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kurser_spegel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plattform_siffror ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kurser_las" ON public.kurser FOR SELECT USING (true);
CREATE POLICY "spegel_las" ON public.kurser_spegel FOR SELECT USING (true);
CREATE POLICY "siffror_las" ON public.plattform_siffror FOR SELECT USING (true);

-- Notis: INSERT/UPDATE/DELETE görs via service role key (server-side only)
-- Detta skyddar mot obehörig skrivning från klienter
