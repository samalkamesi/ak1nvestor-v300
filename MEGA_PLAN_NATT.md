# MEGA PLAN — 7-timmarssessionen 2026-08-25

> Mandat: full access, MarketStack Business (500k anrop/mån), kvalitet först,
> AI-organ-styrelsen fattar beslut. Fas för fas; varje fas = commit + verify + worklog.

## Faser
- P0 PLAN + nyckel i .env ✓
- P1 MarketStack som 3:e oberoende källa i analysis_engine.py (EOD-data, cross-validering)
- P2 NYA RIKTIGA AKTIEANALYSER (styrelsens #1): datadrivna screening-analyser av
  5-6 stora svenska bolag (SAAB-B, ATCO-A, ERIC-B, SAND, HM-B m.fl.) via
  Yahoo+MarketStack — ärligt märkta "datadriven screening", alla siffror källspårade
- P3 Merge/deploy/verify analyser + SEO-sidor för dem
- P4 Portföljrapport: fundamentaldel (P/E etc via motor) i djupanalysen
- P5 Blogg: 2-3 artiklar baserade på nya analysdata
- P6 Styrelsegranskning + nästa sprint-plan + worklog
- P7 Slutverifiering

## Kritiska regler
- Nycklar ENDAST i .env (gitignored)
- Server-requests: https + host-allowlist + privata IP blockerade
- Bounded writes (organ-motorns regler)
- Ärlighet: [est.]-märkningar, teorier = struktureringsverktyg
