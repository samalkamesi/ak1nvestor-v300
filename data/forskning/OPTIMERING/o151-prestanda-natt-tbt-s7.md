# O151 — NATT-TBT-MÄTAREN: o144 §5 / o139 §7.2:s enda öppna post får en cron-ägd mätare (Spår 7, s7-u3)

Datum: 2026-09-21 23:07–23:2x lokal · Manifest:
auto-s7-1790031919251 (byggare 3/3) · Reservation: o151 i
data/vakten/protokollnummer.json (23:20Z) · Anspråk disk-först 23:07:04Z
+ uppdaterad 23:20Z (`data/vakten/auto-s7-1790031919251-s7-u3-ansprak.md`).

## §0 VAL med dokumenterad pivot

Ursprungsval (23:07Z): o144-slutbokföringen — o144 §9 steg 7 + §10:s
uttryckliga arvsuppdrag ("NÄSTA LEVANDE VÅG"). **VIKT 23:18–23:20Z:**
syskon s7-u1 (ingen klaim-fil — min klaim låg 1 min 52 s före deras
första ytrörande) hade vid 23:17Z levererat hela §3-§6-fyllnaden med
högre evidenskvalitet än mitt färdiga utkast (kanalbevis ×2 träd,
A/B-par-evidens, tre verktygsfixar inklusive en jag missat:
pe-extraheringen) och commitmsg/worklog på disk — att konkurrera om
worklog/commit hade skapat det dubbelarbete konventionen ska förhindra.
Vik fullständigt dokumenterad i anspråksfilen; u1:s bokföring kanonisk.

Nytt val: **o151 — den uttryckligen öppna posten** (o144 §5: "Kriteriet
förblir ÖPPET: nästa nattfönster mäter om" + o139 §8-köposten "natt-LH
om TBT-spåret öppnas igen"): TBT /kalkylator ≤ ~450 (o139 §7.2) kan
ENDAST domas i nattfönster — metrologiregeln o143 §3 (TBT jämförbar
endast inom samma lastfönster; basen o139-fore nattmätt 06:03Z; o144:s
efter-mätning 17:53Z var dagmätt = ogiltig jämförelse). Problemet är
STRUKTURELLT: nattfönstret (03:xx, tyst, ISR-varmt) infaller när ingen
agent är vaken — därför en cron-ägd mätare, o144-väntarens mönster
(JSON-fakta av process; dom + bokföring av levande våg).

Duplikatkontroll 23:20Z: u1 = o144-bokföring, u2 = o150 (anspråk
23:14Z, reservation i poolen). o151–o150-gapet tomt; inget tidigare
"natt-TBT"-verktyg i verktyg/ (grep natt/tbt mot verktygslistan).

## §1 Leveransen

1. **`verktyg/_s7u3o151-natt-tbt.mjs`** — mätaren. Kontrakt:
   - Steg 0 RAM-vakt: MemAvailable ≥ 1 500 MB (annars `avbruten-ram`,
     exit 2 — aldrig kollidera med byggfönster).
   - Steg 1 prod 200-preflight ×2 sidor **+ ISR-värmning** (3 hämtningar/
     sida + 15 s settle — kor-o139-kontraktet STEG 3; sonden bevisade
     värmningens nödvändighet, se §2).
   - Steg 2 kanoniska `prestanda-lighthouse.mjs` med `LH_JAMFOR=o139-fore`
     på /superanalys + /kalkylator — samma instrument som basen.
   - Steg 3 maskinell dom mot o139 §7.2: CLS 0 ×2 (heligt) · LCP ±15 %
     per sida · TBT /kalkylator ≤ 450 · /superanalys poäng-band ±8 av 73
     (§7.2:s "oförändrad ±" tolkat som lastbrusband — dokumenterad
     tolkning, ej ny fysik).
   - Lägen: natt (cron) dom-berättigat; `--sond` = dagkörning som
     validerar pipelinen och märker TBT med "SOND — dagfönster, ej dom
     enligt o143 §3". Exit 0 = dom GRÖN · 1 = rött kriterium/sond-
     observation · 2 = avbruten (RAM/200) · 3 = pipelinefel.
   - Utdata: `lighthouse/o151-natt[-sond]-*` + `dom-o151-natt[-sond].json`
     — JSON-fakta ENDAST (o144 §10: bakgrundsprocess bokför ALDRIG).
2. **`data/infra/contabo/natt-tbt-cron.sh`** — ropare: deploylås-
   kontroll (hoppa över under byggfönster) + kör mätaren, logg till
   `lighthouse/o151-natt-cron.log`. **Installerad i crontab 23:2xZ:
   `27 3 * * *`** — 17 min efter ISR-varmaren (03:10): sidorna varma,
   lastfönstret tyst, samma fönsterfamilj som nattbasen.

## §2 Sondbevis (verktyget validerat i dagfönster, ×2)

| körning | /kalkylator LCP Δ | /superanalys LCP Δ | TBT (obs, dag) | CLS |
|---|---|---|---|---|
| sond 1 (utan värmning, 23:1xZ) | **+28,3 %** | −2,5 % | 866 / 4 944 | 0 ×2 |
| sond 2 (med värmning, 23:2xZ) | **+3,5 %** | +18,5 % | 929 / 3 599 | 0 ×2 |

- **Värmningens värde BEVISAT:** kall ISR gav /kalkylator LCP +28,3 %
  (6 175 ms — kompileringsträffen i mätvägen); med värmning +3,5 %.
  Natt-cronen (efter ISR-varmaren) + värmningen dubbelssäkrar detta.
- **Dagfönstrets otillräcklighet demonstrerad på riktiga tal:** sond 2:s
  /superanalys +18,5 % och TBT 929/3 599 (mot nattbas 375/582) med
  RAM 4 222 MB fritt = ren CPU-lastsystematik, exakt metrologiregelns
  innehåll. Ingen sond domar — nattkörningen äger domen.
- CLS 0 ×4 (båda körningarna, båda sidor) — mätaren stör inte layouten.

## §3 Vakarövertags-order (nästa våg, efter första nattkörningen)

1. `cat data/forskning/OPTIMERING/lighthouse/dom-o151-natt.json` +
   `o151-natt-sammanfattning.json` (+ `o151-natt-cron.log` vid avbrott).
2. Dom GRÖN ⇒ TBT-kriteriet SLUTSTÄNGT: fyll o144 §5:s "förblir ÖPPET"-
   rad + o139 §8-facit + worklog. Dom RÖD på TBT ⇒ kuren (o139 §8.4)
   återöppnas med natt-evidens — ALDRIG med dagtal.
3. `avbruten-ram`/deployfönster ⇒ nästa natts körning gäller (cron är
   tålmodig); tre avbrott i rad ⇒ larma spåret.

## §4 KVD

- src/ orörd ⇒ INGET bygge (prod-synken äger) · tsc-baslinjen bärs av
  pre-commit-grinden (denna commit passerar den).
- R2 orörd · data/blogg/ (live) orörd · data/blogg-utkast/ orörd.
- Cron-installationen: append-rad i befintlig crontab (bevarade rader
  bitidentiska; gränssnittsvakt/daemons orörda) — driftändring i linje
  med granssnittsvakt-precedensen (våg 105), dokumenterad här.
- Syskonytor: u1:s o144-filer + u2:s o150-yta orörda; u1:s leverans 6cb14367
  committad av dem själva.

## §5 Kö vidare

- Första nattkörningen landar 03:27 lokal natt till 2026-09-22 —
  vakarövertag enligt §3.
- o120:s /blogg kall-TBT-arkitekturpost (oförändrad öppen).
- Docs-Offline-metrologin (o143 §8) — s8-spårets.
