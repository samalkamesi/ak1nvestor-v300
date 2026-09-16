# O26 — Larmeskaleringen: mekanismen som översätter ignorerade vaktlarm till signal (s8-u3 omstart, spår 8 KVALITET & SÄKERHET)

**Datum:** 2026-09-16, fönster 06:18–06:5x lokal (04:18–04:5x Z).
**Agent:** fabriksbarn s8-u3 i manifest auto-s8-1789530300719 — OMKÖRD
(försök 2): första processen dog vid start i rate limit (429, logg
utdata/auto-s8-…-s8-u3.log — noll arbete); försök 2 (05:44-ruset)
levererade paritetsdomänen (o23, 31dd0b46+c476efe0) men KVARSTOD som
föräldralös aktiv session; JAG är försök 3 (06:18-ruset) och valde ett
NYTT objekt efter full duplikatkontroll.

**Objekt:** larmeskalering — den mekanism o22 §4.2 efterfrågade
("30 larm i rad utan att någon reagerade … mekanismen saknar
eskalering (se kö)") och o24 §6.1 delade med drift-ops-spåret.
Granskade redan levererat i spåret (worklog + git log + OPTIMERING/ls):
kvalitetsgrind-bevis, beroende-vakt, döda länkar, tsc-determinism,
F5-feljakt, F7-nyckelbevakning, nollfynd-jakt, mimosa-paritet (o15),
skalfritt verktygsskal (o21), vaktnätets hälsa (o22), paritetsdomän
(o23), kraschvaktens feltriggar (o24), fyndlogg-läge (o25) — ingen
levererade eskalering. grep "eskalering" i verktyg/*.mjs: noll träff.

## §0 Syskollisionskoll (o20 §0-precedensen; race-familjen 5+6 samma dygn)

Fönstret var det tätaste hittills: FYRA aktiva sessioner i samma träd
(u1-redispatch o25, u2-redispatch o24+kraschvakt-kur, s8-u3-försök-2
som föräldralös men LEVANDE session, jag). Försök-2-processen (PID
947220, PPID 1, CPU-aktiv, levande repl-mcp-barn) diagnostiserades
FÖRE allt eget skrivande: dess filer (mimosa/o23) lämnades orörda och
dess leverans landade av egen kraft (c476efe0) mitt i mitt fönster —
omstartade sessioner KAN alltså fortfarande leverera; fabriks-
redispatchen skapar dubbel-discipline-risk men i detta fall komplement
arbete. MINA filer är exklusivt mina: verktyg/larm-eskalering.mjs,
verktyg/testa-larm-eskalering.mjs, detta protokoll + worklog-append
(delad fil, o22-fönsterpraxis). Commit gjord i tomt-index-fönster
(alla syskons commits landade: ed581390 senast) med git add ENDAST
egna filer — race-familjens kur så lång den räcker inom nuvarande
struktur (strukturell lösning bokad av o23/o24 hos huvudagenten:
per-agent commit-kö).

Protokollnumret: ls-kontroll vid skrivning — o20–o25 tagna ⇒ o26.

## 1. ROTORSAKA (bevisad i o22, kvantifierad här)

Konfigintegritetsvakten larmade 30 gånger identiskt 2026-09-15T22:49Z
→ 2026-09-16T03:49Z (SAKNAD crontab-rad, falsk norm) utan att någon
mekanism reagerade — den manliga kuren kom först 03:54Z (o22). Journalen
bar signalen men översatte aldrig upprepning ⟶ eskalering. Larmkulturens
dödsregel (o22): ett larm som är fel/ignorerat >1 dag tränar systemet
att strunta i larm. ROTEN är inte raderna i journalen utan det
SAKNADE LAGRET mellan journal och uppmärksamhet.

## 2. KUR — lager PÅ journalen, aldrig dedup i källan (designbeslut med skäl)

**verktyg/larm-eskalering.mjs** (ny, fristående): läser
data/vakten/konfig-larm.jsonl (append-only, orörd) och bedömer varje
larmepisod mot trösklar:

| Signal | Tröskel (default) | Betydelse |
|---|---|---|
| VARNING (nivå 1) | aktiv episod ≥ 30 min | vakten larmar utan kur |
| ESKALERING (nivå 2) | ≥ 60 min | systemet ignorerar signalen |
| KRITISK (nivå 3) | ≥ 240 min | o22-nattens klass |
| VAKT-TYSTHET | senaste journalrad > 25 min | vakten själv död/tyst = mätblindhet (o22:s kvalitetsvakt-triggerlöshets-klass) |
| HISTORIK | uppklarad episod ≥ 60 min | larmkultur-läxa, synliggjord utan att ackumuleras som larm |

Episod = alla larm med samma fingeravtryck (typ|område|meddelande)
sedan senaste GRÖN-rad; grön avslutar alla pågående episoder
(konfigvakten skriver grön endast när allt är grönt). Två olika
larmnycklar utan grön emellan ackumuleras var för sig.

**Medvetet AVVISAD kur:** dedup/aggregering i källvakten. Journalen
SKALL förbli komplett append-only — de 30 raderna ÄR beviset för
hur länge systemet var blint; att tysta källan vore att radera
beviskedjan för att stilla symptomet. Eskalering är ett LAGER PÅ
TOPPEN som läser journalen — källfilen konfigintegritet-vakt.mjs
är därför orörd av denna våg (även: pumpor-daemonen kör den LIVE
var 10:e minut; noll live-risk från denna leverans).

Teknik: kärnan (byggEpisoder/bedomEpisod/bedomTysthet/lasRader/
kopplaGronTillEpisoder) ren + exporterad, noll IO i kärnan, noll
child-processer i HELA verktyget (naturskalfritt — inte ens
arrayform behövs). Lägesfil data/vakten/larm-eskalering.json skrivs
om hel varje körning (för ronder/människor/framtida pulsvakt-hook).
Exit alltid 0 (journal-bärande signal, konfigvaktens kultur).

## 3. BEVIS

1. **Beslutstabell:** verktyg/testa-larm-eskalering.mjs — 12/12 PASS,
   varje nivågren mappad mot dokumenterade tidpunkter i o22: natten
   bedömd VID 01:30Z ⇒ ESKALERING, VID 03:00Z ⇒ KRITISK — verktyget
   hade ropat KRITISK en timme före den manuella kuren.
2. **Skarp rekonstruktion:** körning mot den verkliga journalen
   finner EXAKT o22-natten som historikläxa — 30 upprepningar,
   22:49:06Z→03:49:01Z, grön 03:54:13Z, varaktighet 305 min —
   instrumentet rekonstruerar den dokumenterade historien från rådata
   (starkaste korsvalideringen: protokoll ⟵ journal ⟶ verktyg).
   Läge nu: 0 aktiva episoder, vakten frisk (senaste rad 2 min).
3. **Dubbelinstrument (o23 §3-mönstret):** skalfri-vakt 154 filer
   0 fynd GRÖN && mimosa-paritet v1.3 --doman '^verktyg/' 123 filer
   0 fynd GRÖN — båda syskoninstrumenten gröna med mina nya filer.
4. **Syntax:** node --check ×2 OK.
5. **tsc:** projektbinär 0 fel (src/ orörd — endast verktyg/ + data/).
6. **Inget bygge, inget lås, R2 orörd:** inga priser/tier/publicering,
   inga .env/nyckelfiler, data/blogg/ orörd, syskonens filer orörda.

## 4. Återanvändning

```bash
node verktyg/testa-larm-eskalering.mjs   # 12/12 beslutstabell (noll IO utom tmp)
node verktyg/larm-eskalering.mjs --torr  # mät utan att skriva lägesfil
node verktyg/larm-eskalering.mjs         # mät + skriv data/vakten/larm-eskalering.json
cat data/vakten/larm-eskalering.json     # läget: aktiva, historik, tysthet
```

## 5. KÖ (bokningar)

1. **Till huvudagenten (cron-ägaren):** pumpa larm-eskalering strax
   EFTER konfigintegritetsvakten (min%10==9) på ledig daemon-minut —
   aldrig :x1/:x4/:x5/:x7/:x8 eller :17/:23/:37/:43/:47
   (konfigvaktens huvudkommentar); korEnGang-nyckel t.ex.
   "larm-eskalering". Verktyget är redo; triggern är allt som saknas
   (samma arkitektur som o22:s kvalitetsvaktsbokning).
2. **Till drift-ops (o24 §6.1, kompletterande):** när larmvägen utåt
   byggs (pulsvakt-rad vid ÄKTA räddning) är larm-eskalering.json
   beredd läs-yta: nivå≥2-episoder + vakt-tysthet är exakt de två
   tillstånd som förtjänar utåtsignal.
3. **Evolutionspost v2:** fler källor — kraschvakt.log (o24:s nya
   radtyper DEPLOY PÅGÅR/TRANSIENT/PM2-RESTART behöver egen parser,
   syskonets format) + kvalitetsrapportens SENASTE-förnyelse (o22:s
   6-dagars mätblindhet). Kärnan är källagnostisk (rader med
   ts+niva+fingeravtryck) — bara mappningslagret växer.

— s8-u3 omstart (fabriksagent, spår 8 KVALITET & SÄKERHET), 2026-09-16
