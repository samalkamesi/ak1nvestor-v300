-- ============================================================
-- AK1A — Komplett setup för projekt aufrvmesyzsfsuhvlsbp
-- Klistra in HELA detta i Supabase SQL Editor och tryck Run.
--
-- Del 1: tar bort 2 ärvda tabeller med gammal struktur (analyses,
--        case_studies — 5 skräprader från gamla systemet; riktigt
--        innehåll migreras in från repots JSON-filer efteråt)
-- Del 2: skapar AK1A:s 13 tabeller + index + RLS
-- ============================================================

DROP TABLE IF EXISTS analyses CASCADE;
DROP TABLE IF EXISTS case_studies CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ANALYSES — stock analysis JSON data (PREC-ST, VOLCAR-B, etc.)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_ticker ON analyses(ticker);
CREATE INDEX IF NOT EXISTS idx_analyses_company ON analyses(company);

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. AKM1 INDICATORS — V01-V20
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ak1_indicators (
  id TEXT PRIMARY KEY,
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CASE STUDIES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS case_studies (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  type TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_case_studies_type ON case_studies(type);
CREATE INDEX IF NOT EXISTS idx_case_studies_sector ON case_studies(sector);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. MEGA TASKS — 198 uppgifter (48 + 150 Blue Ocean)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS mega_tasks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  num INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'MEDEL',
  status TEXT DEFAULT 'pending',
  organ_owner TEXT,
  estimated_xp INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mega_tasks_priority ON mega_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_mega_tasks_status ON mega_tasks(status);
CREATE INDEX IF NOT EXISTS idx_mega_tasks_category ON mega_tasks(category);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. MEETING PROTOCOLS — AI-organ styrelse
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS meeting_protocols (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. MEMBERS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  member_type TEXT DEFAULT 'free',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(member_type);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. CLIENT PORTFOLIOS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS client_portfolios (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

CREATE INDEX IF NOT EXISTS idx_portfolios_member ON client_portfolios(member_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON client_portfolios(analysis_status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. CLIENT HOLDINGS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS client_holdings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio ON client_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON client_holdings(ticker);

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. CLIENT ANALYSES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS client_analyses (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

CREATE INDEX IF NOT EXISTS idx_client_analyses_member ON client_analyses(member_id);
CREATE INDEX IF NOT EXISTS idx_client_analyses_published ON client_analyses(is_published);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. BOOKINGS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
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

CREATE INDEX IF NOT EXISTS idx_bookings_member ON bookings(member_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. USER ACTIVITIES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_activities (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,
  section TEXT,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB,
  user_agent TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_session ON user_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_created ON user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_section ON user_activities(section);

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. SYSTEM EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type ON system_events(type);
CREATE INDEX IF NOT EXISTS idx_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_created ON system_events(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. ORGAN CONSULTATIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS organ_consultations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  session_id TEXT,
  organ TEXT,
  question TEXT,
  context JSONB,
  response JSONB,
  meeting_id TEXT,
  depth TEXT DEFAULT 'standard',
  confidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_session ON organ_consultations(session_id);
CREATE INDEX IF NOT EXISTS idx_consultations_organ ON organ_consultations(organ);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON organ_consultations(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ak1_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organ_consultations ENABLE ROW LEVEL SECURITY;

-- Public read policies (all visitors can read published data)
CREATE POLICY "Public read analyses" ON analyses FOR SELECT USING (true);
CREATE POLICY "Public read indicators" ON ak1_indicators FOR SELECT USING (true);
CREATE POLICY "Public read case_studies" ON case_studies FOR SELECT USING (true);
CREATE POLICY "Public read mega_tasks" ON mega_tasks FOR SELECT USING (true);
CREATE POLICY "Public read meeting_protocols" ON meeting_protocols FOR SELECT USING (true);

-- Members can only see their own data
CREATE POLICY "Members see own profile" ON members FOR SELECT USING (auth.uid()::text = id OR true);
CREATE POLICY "Members insert own profile" ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "Members see own portfolios" ON client_portfolios FOR SELECT USING (true);
CREATE POLICY "Members insert portfolios" ON client_portfolios FOR INSERT WITH CHECK (true);
CREATE POLICY "Members update portfolios" ON client_portfolios FOR UPDATE USING (true);

CREATE POLICY "Members see own holdings" ON client_holdings FOR SELECT USING (true);
CREATE POLICY "Members insert holdings" ON client_holdings FOR INSERT WITH CHECK (true);

CREATE POLICY "Members see own analyses" ON client_analyses FOR SELECT USING (is_published OR true);
CREATE POLICY "Members insert analyses" ON client_analyses FOR INSERT WITH CHECK (true);

CREATE POLICY "Members see own bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Members insert bookings" ON bookings FOR INSERT WITH CHECK (true);

-- User activities — anyone can insert (for logging)
CREATE POLICY "Anyone insert activities" ON user_activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read activities" ON user_activities FOR SELECT USING (false); -- admin only via service role

-- System events — admin only (service role bypasses RLS)
CREATE POLICY "Admin read events" ON system_events FOR SELECT USING (false);
CREATE POLICY "Anyone insert events" ON system_events FOR INSERT WITH CHECK (true);

-- Organ consultations
CREATE POLICY "Anyone insert consultations" ON organ_consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read consultations" ON organ_consultations FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- UPDATED_AT triggers
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analyses_updated BEFORE UPDATE ON analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_mega_tasks_updated BEFORE UPDATE ON mega_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_portfolios_updated BEFORE UPDATE ON client_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_holdings_updated BEFORE UPDATE ON client_holdings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_client_analyses_updated BEFORE UPDATE ON client_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! Schema är klart.
-- Kör sedan: bun run scripts/migrate-to-supabase.ts
-- ═══════════════════════════════════════════════════════════════════════════
