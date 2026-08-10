-- ============================================================
-- AK1A Research Lab — Supabase Schema
-- Kör detta i Supabase SQL Editor för att skapa tabeller
-- ============================================================

-- Stock analyses (ersätter data/analyses/*.json)
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  ticker TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  exchange TEXT,
  sector TEXT,
  isin TEXT,
  currency TEXT DEFAULT 'SEK',
  verified TEXT,
  analysis_date TEXT,
  source TEXT,
  status TEXT,
  -- Full JSON analysis data (cover, recommendation, motivation, etc.)
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_ticker ON analyses(ticker);
CREATE INDEX IF NOT EXISTS idx_analyses_company ON analyses(company);

-- AKM1 indicators (V01-V20)
CREATE TABLE IF NOT EXISTS ak1_indicators (
  id TEXT PRIMARY KEY, -- "V01".."V20"
  num INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  weight TEXT,
  level TEXT,
  summary TEXT,
  formula TEXT,
  scale TEXT,
  lynch_view TEXT,
  graham_view TEXT,
  ak1_view TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case studies
CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL, -- success | failure
  company TEXT NOT NULL,
  ticker TEXT,
  title TEXT NOT NULL,
  description TEXT,
  akm1_score INTEGER,
  decisive_vars TEXT,
  sector TEXT,
  year INTEGER,
  outcome TEXT,
  lesson TEXT,
  is_illustrative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting protocols (AI organ styrelse)
CREATE TABLE IF NOT EXISTS meeting_protocols (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meeting_id TEXT UNIQUE NOT NULL,
  agenda TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  viewpoints JSONB,
  decision JSONB,
  decision_title TEXT,
  confidence TEXT,
  passed BOOLEAN,
  signatures JSONB
);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  member_type TEXT DEFAULT 'free',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Client portfolios
CREATE TABLE IF NOT EXISTS client_portfolios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Min portfölj',
  description TEXT,
  total_value FLOAT DEFAULT 0,
  cash_position FLOAT DEFAULT 0,
  risk_tolerance TEXT DEFAULT 'medium',
  avg_wave_micro TEXT,
  avg_wave_short TEXT,
  avg_wave_medium TEXT,
  avg_wave_long TEXT,
  avg_wave_mega TEXT,
  avg_wave_score FLOAT,
  risk_score FLOAT,
  analysis_status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client holdings
CREATE TABLE IF NOT EXISTS client_holdings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  portfolio_id TEXT REFERENCES client_portfolios(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company TEXT,
  sector TEXT,
  shares FLOAT,
  avg_cost FLOAT,
  current_price FLOAT,
  weight FLOAT,
  wave_micro TEXT,
  wave_short TEXT,
  wave_medium TEXT,
  wave_long TEXT,
  wave_mega TEXT,
  wave_confidence FLOAT,
  wave_score FLOAT,
  used_cache BOOLEAN DEFAULT false,
  cache_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client analyses
CREATE TABLE IF NOT EXISTS client_analyses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  portfolio_id TEXT REFERENCES client_portfolios(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  portfolio_overview TEXT,
  risk_assessment TEXT,
  wave_analysis TEXT,
  recommendations TEXT,
  next_steps TEXT,
  analyzed_by TEXT,
  confidence TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  analysis_id TEXT REFERENCES client_analyses(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  requested_time TIMESTAMPTZ,
  confirmed_time TIMESTAMPTZ,
  status TEXT DEFAULT 'requested',
  notes TEXT,
  meeting_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System events
CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak1_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

-- Public read för analyses, indicators, case_studies, meeting_protocols
CREATE POLICY "Public read analyses" ON analyses FOR SELECT USING (true);
CREATE POLICY "Public read indicators" ON ak1_indicators FOR SELECT USING (true);
CREATE POLICY "Public read case_studies" ON case_studies FOR SELECT USING (true);
CREATE POLICY "Public read meeting_protocols" ON meeting_protocols FOR SELECT USING (true);

-- Service role har full access (via SUPABASE_SERVICE_ROLE_KEY i backend)
