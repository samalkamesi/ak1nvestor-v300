-- ═════════════════════════════════════════════════════════════════════════════
-- MÖS — MEGA ÖVERSÄTTNINGSSYSTEMET: tabellen oversattningar
--
-- >>> KUNDEN KÖR DENNA FIL — HELA INNEHÅLLET, ÄVEN VID OMKÖRNING <<<
-- Öppna Supabase → SQL Editor → klistra in HELA detta innehåll → Run.
-- Idempotent: kan köras om utan skada (IF NOT EXISTS/DROP IF EXISTS överallt;
-- status-CHECK:en byts nedan med DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT).
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
--   vantar-motor                  ingen motor svarade (kedja DeepL → Google →
--                                 MyMemory) / för lång källa
--   vantar-kvot                   MyMemory:s nyckelfria dagskvot förbrukad —
--                                 köas till nästa dags rond (ca 24 h)  [VÅG 54]
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
                    ('utkast','granskad','publicerad','vantar-motor','vantar-kvot',
                     'inaktuell','maskinutkast-behovar-granskning')),
  kvalitet        INTEGER NOT NULL DEFAULT 0 CHECK (kvalitet >= 0 AND kvalitet <= 100),
  kontrollrapport JSONB NOT NULL DEFAULT '{}'::jsonb,  -- korKontroller(): poäng + 4 kontroller
  uppdaterad      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (scope_typ, scope_nyckel, sprak)  -- ett live-objekt per scope+språk
);

-- ── VÅG 54: status 'vantar-kvot' (externa motor-kedjans kvotläge) ────────────
-- KÖR OM SQL (idempotent med ALTER): en BEFINTLIG tabell (skapad före våg 54)
-- har en CHECK utan 'vantar-kvot' — blocket nedan byter den mot den nya
-- listan. DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT är idempotent: en andra
-- omkörning släpper villkoret och lägger till det igen, utan dataförlust.
-- (Postgres namnger en namnlös kolumn-CHECK automatiskt
--  oversattningar_status_check — därför vet vi namnet.)
ALTER TABLE oversattningar DROP CONSTRAINT IF EXISTS oversattningar_status_check;
ALTER TABLE oversattningar ADD CONSTRAINT oversattningar_status_check CHECK (status IN
  ('utkast','granskad','publicerad','vantar-motor','vantar-kvot',
   'inaktuell','maskinutkast-behovar-granskning'));

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

-- Klar (våg 54). Verifiera med:
--   SELECT count(*) FROM oversattningar;                       (0 rader = korrekt start)
--   SELECT pg_get_constraintdef(oid) FROM pg_constraint
--    WHERE conname = 'oversattningar_status_check';            ('vantar-kvot' syns i listan)
