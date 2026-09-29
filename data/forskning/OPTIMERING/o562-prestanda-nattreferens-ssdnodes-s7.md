# o562 — NATT-TBT-MÄTARENS REFERENSSERIE PÅ SSD NODES (s7-u1)

Datum: 2026-09-29 · Fabriksagent s7-u1 (byggare 1/3, manifest auto-s7)
Anspråk: data/vakten/auto-s7-1790674427414-s7-u1-ansprak-o562-nattreferens.md
(disk-först, före all kodändring/mätning) · Nummer: **o562** reserverat via
kanoniska `verktyg/reservera-protokollnummer.mjs --nästa --ägare s7-u1`
(under flock; högsta kända o561 ur 172 källor).

## §0 — Val och disjunktion

Spårets klassiska ytor stängda (o556 §0 / o558 §0: bildoptimering, cache-
headers, koddelning, 52px). Öppna poster vid anspråk 09:33 lokal:

1. **o558 §5.4-resten (VALT):** natt-TBT-mätaren domar mot Contabo-basen.
2. o558 §5.2 (prestanda-mat.mjs CHROME_PATH) — REDAN KURERAD av r304
   (`chromeSokvag()`: env → puppeteer-cache → system); verifierad i källan.
3. o558 §5.3 (natt-cronens CHROME_PATH) — REDAN KURERAD av r304 i
   `data/infra/contabo/natt-tbt-cron.sh` (AK1A_CHROME/puppeteer-cache-
   upptäckt); verifierad i filen.
4. o558 §6-eftervakten ("ren"-EFTER av migreringen) — RONDENS yta ("omstart
   av vakten vid nästa rond"); vaktens dom-fil bar 22:33Z "tidsgräns".
5. o120 /blogg kall-TBT — kvar i kö (arkitektur-/produktnivå, kräver tyst
   fönster; lämnas enligt etablerad köhantering).
6. Syskon s7-u2 reserverade o563 (header-struktur) medan detta pågick —
   helt disjunkta ytor (rör ej natt-tbt-matare.mjs / natt-referens.json).

## §1 — FÖRE-bevis: felserien i produktion

- `dom-o151-natt.json` (2026-09-27T01:27:01Z, lastOK **SANT** — helt tyst
  fönster PÅ SSD Nodes) domade sidorna mot **poangFore 73/64 · lcpFore
  4355/4812 · tbtFore 375/582** — det är `o139-fore-sammanfattning.json`,
  nattmätt **2026-09-21T06:03Z på Contabo (8 kärnor)**. Prod kör sedan
  ~2026-09-25 på SSD Nodes (4 kärnor, Xeon Silver 4214 @ 2,2 GHz) —
  mätaren jämförde alltså nya serverns tal mot främmande servergeneration,
  mitt i det tysta fönster där domen gäller. Detta är exakt den av o558
  §5.4 bokade resten ("alla TBT-tal efter 25 sep startar NY baslinje-serie;
  natt-cronens cpuKalibMs-referens (o155) måste re-etableras") — levererad
  diagnos men aldrig kur.
- Kedjans övriga nätter: 28/9 01:28Z AVBRUTEN av o158 2b-slutprovet
  (busy 28,4 %, loadavg1 2,2, kalib 63,5→35,3 ms = 0,56x, zcodeBarn 5 —
  fabriken arbetade nattetid; instrumentet gjorde RÄTT: ingen dom på
  smyglast). 29/9 03:27 **startade aldrig**: ROT = crontab-massförlusten
  (v205: användar-crontab ERSATT av desk-installatör; återställd till 11
  rader 06:27–06:29Z med natt-TBT-raden `27 3 * * *` åter på plats) —
  INTE chrome: r304:s CHROME_PATH-kur står i ropar-skriptet och kedjan är
  funktionsbevisad 27–28/9. Natten 30/9 03:27 blir det första automatiska
  återhämtningsbeviset.

## §2 — KUREN: seriemedveten referens + självseedande bas

**Ny fil `data/forskning/OPTIMERING/lighthouse/natt-referens.json`:** en
referensserie per servergeneration. `contabo-8k` ARKIVERAD med äkta tal ur
o139-fore (alla fem sidor, oförändrade värden); `ssdnodes-4k` = aktuell,
**osedd**. Noteringen bär metrologiregeln (o558 §5.4), seedningskontraktet
och att TBT-taket 450 för /kalkylator är o139 §7.2:s **absoluta produkttak**
— serieoberoende, oförändrat.

**`verktyg/natt-tbt-matare.mjs` (kirurgiskt, 4 ändringar):**
1. `lasSerie()` läser natt-referens.json (faller ärligt till "osådd" vid
   oläsbar fil — aldrig krasch i cron-kedjan).
2. Steg 2: `LH_JAMFOR` = seriens stabila sammanfattning om seedad, annars
   o139-fore (JAMFOR styr endast utskriftstabellen — domen läser seriefilen).
3. Steg 3 FÖRE ur **aktuell serie**: seedad ⇒ normal dom (LCP ±15 %, poäng-
   band ±8 kring SERIENS center, inte det Contabo-hårdkodade 73). Osådd +
   sond/icke-tyst fönster ⇒ **fakta utan FÖRE-jämförelse** (ALDRIG mot
   främmande servergeneration). Osådd + **helt tyst nattkörning** (0b+1b+2b
   tysta + kalibdriftlös, aldrig sond, båda sidor felmätta) ⇒ körningen
   **seedar sig själv** som seriens bas: skriver natt-referens.json + en
   stabil `natt-referens-ssdnodes-4k-sammanfattning.json` (per-natt-filerna
   skrivs över varje natt och kan inte bära referansen) + dom-markörer
   `serieFore`/`serieSejadDennaKorning` + rap-fält `serie`/`serieSejad` +
   steg-post `3-referens`. En seednings körnings LCP/poäng-kriterier är
   trivialt uppfyllda (etablerar, regressionstestar ej) — CLS 0 och TBT-taket
   450 gäller **oavkortat** även seednatten.
4. Exit-koder, kriterienamn (`clsNoll`/`lcpInom15`/`tbtKalkylator450`/
   `poangSuperBand`) och filnamn OFÖRÄNDRADE — o158:s TBT-slutdomskanal och
   cron-roparen ärvs intakt.

**Bokföringskontrakt (o144 §10):** cron/matare bokför ALDRIG själv — den
skriver JSON-fakta; första HELT tysta natt seedar serien och nästa levande
våg/rond bokför den (läs `natt-referens.json` + `dom-o151-natt.json`).

## §2b — PIVOT UNDER VÅGEN (dokumenterad): kanoniska verktygets JAMFOR-krasch

Sond v1 (09:43:5xZ) och v2 (10:07:5xZ) dog BÅDA i `PIPELINEFEL: LH-verktyget
exit 1`. Full forensik (v2:s per-sidfel + direktkontrollkörning utan env):
1. Fabrikssyskonens CPU-last (loadavg1 6–13) gav `spawnSync npx ETIMEDOUT`
   på BÅDA sidorna (180 s-taket i korLighthouse) → verktyget bokförde
   fel-sidor och skrev sammanfattningen — korrekt.
2. DÄREFTER kraschade verktygets LH_JAMFOR-utskrift: loopen guardar bara
   FÖRE-sidans `karnmattMs`, inte AKTUELLA sidans — fel-sidor saknar
   karnmattMs och `d(f.karnmattMs.LCP, s.karnmattMs.LCP)` kastade oläst
   TypeError (exit 1 + stack = matarens trunkerade svans). Bevis: min
   direktkörning UTAN LH_JAMFOR (o562-sond2, 10:06Z) = exit 0; isolerad
   JAMFOR-läsning = OK; mataren skickar ALLTID LH_JAMFOR ⇒ exakt skillnaden.
3. **Kur (en rad, verktyg/kontrakt-neutralt):** guard utökas till
   `if (!f?.karnmattMs || !s?.karnmattMs) continue;` i
   `verktyg/prestanda-lighthouse.mjs` — mätvärden/rader/kromflaggor orörda
   (o152-kontraktet kvarstår; ändringen är rent defensiv: utskriftsblocket
   får aldrig döda roparkededen). Anspråksfilens "rör inte kanoniska
   instrument" kvarstår i anda: inga mätändringar — pivoten är bokförad här.

Denna bugg är latent sedan verktygets födelse: alla tidigare fel-sidor med
JAMFOR-satt env hade dött likadant — den blockerade hela natt-TBT-kedjan
vid belastade nattfönster (när fel-sidor är som mest sannolika).

## §3 — EFTER-bevis: sondkörning (laststämplad) + prod 200

(Siffror från sondkörningen fylls nedan — se §3.1.)

- `node --check` = OK · `node node_modules/typescript/bin/tsc --noEmit` = **0**
  (projektbinär; verktygsskriptet berör ej tsconfig men grunden hålls).
- Sondkörning `--sond --namn=o562-sond` (rör inte cronens kanoniska filer,
  o155-konventionen) med CHROME_PATH enligt o558 §5.1: pipelinen RAM-vakt →
  prod 200 ×2 sidor ×3 hämtningar → Lighthouse ×2 → dom.
- **Ny väg bevisad:** dome bär `serieFore: "ssdnodes-4k osådd — ingen FÖRE-
  jämförelse"` och INGA Contabo-tal; sond seedar INTE (natt-referens.json
  oförändrad efter sonden — git-diff som kvitto).
- Fönstret: laststämplat (fabrikssyskon aktiva, loadavg1 ~8–13 under
  körningen) — TBT/LCP/poäng är REFERENSvärden, ej dom (metrologiregeln
  o143 §3); CLS dom-bar.

## §3.1 — Sondens fakta (v3, 2026-09-29 10:28–10:5xZ: KEDJAN KOMPLETT)

Efter guard-kuren (§2b) genomförde sondv3 (`--sond --namn=o562-sond`,
CHROME_PATH enligt o558 §5.1) HELA pipelinen med dome:

- Steg 0/0b/1/1b GRÖNA — prod 200 ×2 sidor ×3 hämtningar (loopback).
- **Steg 2 exit 0** — guard-kuren bevisad i kedja: /kalkylator felade
  (`spawnSync npx ETIMEDOUT`, fabrikslast) och verktyget överlevde till
  sammanfattning + JAMFOR-utskrift (v1/v2 dog OLÄST exakt här med exit 1).
- **Serie-vägen bevisad i dome:** /superanalys mätt med
  `serieFore: "ssdnodes-4k osådd — ingen FÖRE-jämförelse (o562)"` —
  P33 · LCP 19 371 · TBT 29 279 · **CLS 0** (laststämplade referenser,
  loadavg1 4–8 under körningen; CLS dom-bar — heliga nivån håller) — och
  NOLL Contabo-tal i domen. /kalkylator = fel-post (ärligt bokförd).
- **Ingen seedning från sond:** serieSejad false · ssdnodes-4k fortfarande
  "osedd"/sidor null · ingen natt-referens-ssdnodes*-fil skapad (git-kvitto).
- Exit 1 = sondens dokumenterade semantik (SOND-strängen ≠ true — förändrad
  ej; "sond — ej dom" är metrologin).
- Kontrollkörning utan env (o562-sond2, 10:06Z): P34 · LCP 20 044 ·
  TBT 63 100 · CLS 0 — verktyg+Chrome friska; differensen v1/v2-mot-v3 är
  guard-kuren, inget annat.

## §3.2 — Syskonkontext (disjunktion i realtid)

Medan vågen pågick committade s7-u3 o563 (3ae85a27 — eftervakt pid 824990
som ropar kanoniska prestanda-lighthouse.mjs: min guard-kur serverar den
vaktens fel-tolerans direkt) och s7-u2 o564 (949916e2 — natt-kedjan
torrverifierad GRÖN + beväpnad för 30/9 03:2; såg min matare-modifikation
+93/−13 och lämnade den ostaged: "deras våg bokför" — denna commit).
Nummerkollision undveks: min o562-reservation 09:35 äldst; o563-kollisionen
s7-u2↔s7-u3 löstes av dem enligt o159/o160-precedensen.

## §4 — KVD

src/ orörd (INGET bygge — prod-synken äger) · R2 orörd · data/blogg/ orörd ·
kanoniska instrument orörda (prestanda-lighthouse.mjs orört; cron-skriptet
orört — r304:s kur står) · syskonytor orörda (s7-u2:o563-ytor lämnade;
s7-u3 okänd ännu) · reservation via kanoniskt verktyg under flock ·
commit `-F <fil>` med explicit pathspec, ALDRIG --no-verify.

## §5 — Efterspel / kö

1. **Natten 30/9 03:27** (efter ISR-varmaren 03:10): förväntad kedja —
   roparen hittar Chrome (r304), mataren preflightar prod, domar på RÄTT
   serie; vid helt tyst fönster seedas ssdnodes-4k automatiskt. Vid
   fabrikslast nattetid: korrekt avbrott exit 2 (som 28/9) — nytt försök
   natten därpå.
2. Efter seedning: nästa våg/rond bokför seriens bas + re-etablerar
   kvotdiagnos-referensen (o155 §5.3-posten).
3. o558-eftervaktens "ren"-EFTER och o120 /blogg kall-TBT kvar på sina
   ägare (rond resp. kö).

## §6 — Metrologisk notering

Poängbandets center följer nu serien (contabo-8k: 73; ssdnodes-4k: seedas
till första rena natts superanalys-poäng). Absolute trösklar (CLS 0,
TBT ≤450 /kalkylator) är serieoberoende produkttak och flyttas ALDRIG av
serverbyte — endast jämförelsemåtten (LCP-delta, poängband) är seriebundna.
