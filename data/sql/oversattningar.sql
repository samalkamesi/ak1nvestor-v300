-- ═════════════════════════════════════════════════════════════════════════════
-- MÖS — MEGA ÖVERSÄTTNINGSSYSTEMET: tabellen oversattningar
--
-- >>> KUNDEN KÖR DENNA FIL EN ENDA GÅNG <<<
-- Öppna Supabase → SQL Editor → klistra in HELA detta innehåll → Run.
-- Idempotent: kan köras om utan skada (IF NOT EXISTS överallt).
--
-- Syfte: sanningslagret för alla översättningar (sv → en/ar). Skrivs av
-- /api/cron/oversatt (daglig 10:00 UTC) via service-role-nyckeln, läses av
-- framtida UI för publicerade översättningar. Utan denna tabell köar
-- pipelinen endast lokalt (data/oversattning-kö.json) — PRODUKTION KRÄVER
-- TABELLEN (Vercels filsystem är read-only).
--
-- Statusflöde (speglar src/lib/oversattning/motor.ts + kontroller.ts):
--   utkast                        maskinutkast 90–99 poäng, väntar granskning
--   granskad                      mänskligt granskad (manuell/framtida verktyg)
--   publicerad                    100 poäng — alla 4 kontroller gröna, automat
--   vantar-motor                  ZAI_API_KEY saknar / motorn svarade ej / för lång källa
--   inaktuell                     källan har ändrats (kallhash stämmer ej längre)
--   maskinutkast-behovar-granskning  poäng < 90 — granskning OBLIGATORISK
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS oversattningar (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope_typ       TEXT NOT NULL CHECK (scope_typ IN ('ui','sida','kurs','kursblock','blogg')),
  scope_nyckel    TEXT NOT NULL,  -- t.ex. 'nav.lar' (ui) eller 'the-intelligent-investor:kap5:block3' (kursblock)
  sprak           TEXT NOT NULL CHECK (sprak IN ('en','ar')),
  kallhash        TEXT NOT NULL,  -- SHA-256 12 hex av källtexten (versionshash)
  text            TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL CHECK (status IN
                    ('utkast','granskad','publicerad','vantar-motor','inaktuell',
                     'maskinutkast-behovar-granskning')),
  kvalitet        INTEGER NOT NULL DEFAULT 0 CHECK (kvalitet >= 0 AND kvalitet <= 100),
  kontrollrapport JSONB NOT NULL DEFAULT '{}'::jsonb,  -- korKontroller(): poäng + 4 kontroller
  uppdaterad      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scope_typ, scope_nyckel, sprak)  -- ett live-objekt per scope+språk
);

-- Index för rondens arbetsläge: hashjämförelse och granskningskö
CREATE INDEX IF NOT EXISTS idx_oversattningar_scope ON oversattningar(scope_typ, scope_nyckel);
CREATE INDEX IF NOT EXISTS idx_oversattningar_sprak_status ON oversattningar(sprak, status);
CREATE INDEX IF NOT EXISTS idx_oversattningar_kallhash ON oversattningar(kallhash);

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Publik läsning: ENDAST publicerade rader är anonymt läsbara (anon-nyckeln).
-- Skrivning: service-role passar RLS (bypassrls) — därför finns INGA
-- INSERT/UPDATE/DELETE-policies för anon/authenticated: offentligheten kan
-- aldrig skriva översättningar.

ALTER TABLE oversattningar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS oversattningar_publik_las_publicerad ON oversattningar;
CREATE POLICY oversattningar_publik_las_publicerad ON oversattningar
  FOR SELECT
  TO anon, authenticated
  USING (status = 'publicerad');

-- Klar. Verifiera med:  SELECT count(*) FROM oversattningar;  (0 rader = korrekt start)
