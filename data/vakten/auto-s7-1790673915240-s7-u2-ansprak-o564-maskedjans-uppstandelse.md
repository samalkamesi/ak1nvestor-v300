# Anspråk o564 (disk-först; namnbyte ur o563 efter nummerkollision) — fabriksagent s7-u2 (byggare 2/3)

**Manifest:** auto-s7-1790673915240 · **Nummer:** o564 (reserverat i poolen under flock, `hogstaKanda: o563`)
**Spår:** 7 — PRESTANDA & MOBILPOLISH · **Uppdrag:** nästa prestandavåg i spåret (mät före/efter, deploy, prod 200, mätning bokförd)

## Kollisionshistorik (o159/o160-precedensen)

Ursprunglig reservation: **o563** kl ~09:38 UTC (poolens `hogstaKanda` var då o562; post
`agare: s7-u2` skriven under flock). Syskonet s7-u3:s samtidiga våg i SAMMA manifest
reserverade/hann committa samma nummer först — commit **3ae85a27 kl 09:44:28Z** med egen
eftervakt `verktyg/_s7u3o563-eftervakt.mjs` (pid 824990, startad 09:40:55Z) och protokoll
`o563-prestanda-o160-efter-df331ae2-s7.md`. Ej committerat anspråk viker sig: mina filer
omdöpta till o564-namnrymd, poolen kyrt med ny post under flock, och min redan startade
eftervakt (09:41) **dödad + lås städat** — deras committade vakt äger EFTER-mätningen;
två Chrome-vaktar i samma tysta fönster kontaminerar varandra (o558:s OGILTIG-lektion).
Min kurerade vakt behålls som OSTARTAD RESERV (startas endast om deras 6 h-vakt dör på
tidsgrans utan dom — deras tak löper ut ~15:41Z).

## Valt objekt (ej levererat tidigare — sondbevis 2026-09-29 ~09:30–09:50 UTC)

**Mätkedjans uppståndelse**: spårets tre mätorgan var samtidigt nere/obeamade och inga andra
spår-7-objekt kan domas utan dem:

1. **Natt-TBT-cronen (03:27) levererade ingen dom i natt (29 sep)** — sista
   `dom-o151-natt.json` är från 28 sep 02:16. ROTORSAK hittad i min sond: crontab-
   massförlusten (r328) läktes först med commit 1d2d2a68 **2026-09-29 06:40Z** —
   alltså var crontaben fortfarande borta/trasig vid 03:27. Ingen har bokfört detta
   för natt-tbt-kedjan specifikt; r328:s bevis gällde G2/G5-spåren.
2. **o558-eftervakten** dog på tidsgräns 2026-09-28T22:33:24Z (fas "tidsgrans",
   köpost: "omstart av vakten vid nästa rond"). /bolag-CV-kurens EFTER-dom (TBT/LCP)
   levererar alltså fortfarande inte — efterföljandet löses av syskonet u3:s o563-våg
   (deras vakt + deras adoption). Min våg bidrar ROTORSAKSBEVISET för nattcronen (som
   äger TBT-slutdomen) och RESERV-vakten med längre tak.
3. **Prod-synken** hade inte DEPLOYAT sedan 28 sep 11:52Z (22df62aa) pga aktiva
   fabriksmanifest (V235-sekvens) + ett buntslagsrace (07:57-bygget avbröts 08:48);
   ny byggnings pågår från df331ae2 (09:37:19Z).

## Avgränsning (redan levererat — lämnas orört)

- Bildoptimering: **avslutat** av o101/o111 (skulptur-hero.jpg = deklarerad aktiv
  standard i varumärkesregistret, 0 runtime-referenser; städen arkiverade).
- Cache-header-grind: **rond 4 GRÖN** av o558; denna våg levererar den dom-bara
  strukturmätningen som JSON med byte-tal (§4).
- 52px-mobil: **o557** (CTA 44→52) + o159-tapsonden 0 fynd.
- Koddelning: kräver src+bygge → EFTER-mätning kan inte ägas inom denna session;
  förblir öppet i spåret tills mätkedjan lever (därav detta val).

## Leveransplan (o564)

§1 Rotorsaksbevis nattcronen (commit-tid + logg-mtime + crontab/referens-paritet).
§2 Torr verifiering av nattkedjan: `node --check` matare, `bash -n` cron-skript,
    Chrome-detektion (chrome-sokvag), crontab-rad exakt mot referensen.
§3 Reserv-vakt `verktyg/_s7u2o564-eftervakt.mjs` (o165/o558-mönstret; tak 14 h,
    vaktsvepsfönstren 01/07/13/19 :05–:40 förbjuden mättid, DEPLOYAD-krav >
    09:37:19Z-bygget) — OSTARTAD: syskonets committade vakt äger mätningen.
§4 Struktur-mätning dagtid (dom-bar, o160-mönstret): HTTP-header-granskning ×3 ytor
    ×2 lager (localhost + https), bokförd som JSON.
§5 Prod 200 ×3 loopback + https-verifiering.
§6 Protokoll `data/forskning/OPTIMERING/o564-maskedjans-uppstandelse-s7.md` + worklog +
    commit (git commit -F).

## Ytor jag äger

`data/forskning/OPTIMERING/o564-*`, `data/forskning/OPTIMERING/lighthouse/o564-*`,
`verktyg/_s7u2o564-*`, detta anspråk, worklog-rader (eget block), pool-posten (o564).
Syskonytor orörda — särskilt u3:s hela o563-namnrymd (protokoll, vakt, anspråk, mätdata)
och den pågående modifieringen av `verktyg/natt-tbt-matare.mjs` (deras yta, +93/−13 rader,
lämnas ostaged).
