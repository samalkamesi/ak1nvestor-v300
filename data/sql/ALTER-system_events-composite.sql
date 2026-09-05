-- ═══════════════════════════════════════════════════════════════════════════
-- ALTER system_events — composite index (VÅG 63 bygg-1, O4-robusthet §5)
--
-- KUNDÅTGÄRD — köras EN gång i Supabase SQL-editorn:
--   Dashboard → SQL Editor → New query → klistra in → Run.
--
-- VARFÖR: system_events har idag ENDAST enkla index (type, severity,
-- created_at — se scripts/supabase-schema.sql), men i princip ALLA läsningar
-- kör mönstret `type=eq.X&order=created_at.desc` (översättningslagrets
-- läsregler, orgalets retention+dedupe, akm3-kalibreringen, admin-panelerna).
-- Utan ett sammansatt index tvingar Postgres fram en sortering av ALLA
-- träffrader per läsning — och typ-oversattning växer mot 45 000 rader
-- (45k-taket i organ.ts). Detta index låter Postgres both filtrera AND
-- sortera i samma indexsvep (Index Scan Backward).
--
-- KÖRNINGSNOTIS: CREATE INDEX ... CONCURRENTLY bygger indexet utan lås av
-- skrivningar (tabellen är live) men KAN INTE köras inuti ett transaktions-
-- block — kör som ett eget statement utan BEGIN/COMMIT-omslag. I Supabase
-- SQL Editor kör du den som en fristående query (default).
--
-- IDEMPOTENT: IF NOT EXISTS gör att filen kan köras flera gånger utan fel —
-- andra körningen blir en no-op. Av samma anledning är den säker att köra i
-- både prod och dev.
--
-- Namn: idx_system_events_type_created — samma namn i båda setup-filerna
-- (scripts/supabase-schema.sql + scripts/supabase-setup-ak1a.sql) så att
-- framtida databaser föds med indexet och dev/prod aldrig glider isär.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS CONCURRENTLY idx_system_events_type_created
  ON system_events(type, created_at desc);

-- Verifiering (valfri, efteråt):
--   SELECT indexname FROM pg_indexes
--   WHERE tablename = 'system_events' AND indexname = 'idx_system_events_type_created';
