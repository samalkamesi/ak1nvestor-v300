# DR-ÖVNING 2026-09-17 (kväll) — KEDJA 3 SERVERFILS-ARKIVET GRÖNT + DR-TOTAL-KONTEXT KODBEVISAD + BESLUTSKLOCKAN KARTLAGD TILL KVARTSNIVÅ + KÄLLCADCENSFYND (s10-u3, O10)

**Uppdrag (fabriksmanifest auto-s10-1789671929408, spår 10 vakt 3/3):**
"DR-övning nästa i spåret (välj själv): återställ, mät tid/rader, protokoll,
städa lokal PG." — evighetskatalogens postmall, alltså tolkningsbar mot spårets
nästa icke-levererade objekt.

**Objektval + duplikatkontroll.** Läge vid anspråk ~21:11 lokal (anspråksfil
`data/vakten/auto-s10-1789671929408-u3-ansprak.md`, skriven efter sonder): dagen
sedan 02:30 hade levererat jungfrunatt kedja 2 (u2 O8), jungrudag kedja 1 ×2
(u3+u1 O8), MIDDAG kedja 4 + pumpstart (u1), EFTERMIDDAG dubbel RPO +
valDump-kur (u3 O9), KEDJA 7 board-recept (u2), och under mitt sonderfönster
21:06–21:11 **s10-u2:s kvälls-DR** (commit 9d24c73b: kvälls-RPO-punkten 21:09 +
återleverans av den förlorade valDump-kuren, AUTO-6 RÖT-vägran → AUTO-7 GRÖN
11,0 s = RTO-seriepunkt 20) samt s10-u4:s AUTO-8 (11,7 s, deras yta — orörd).
Kvartalsmallens kedja 3 (serverfiler) var ENDAST icke-idag-levererade kedja
(senast 09-16 13:40, fyra-kedjor-protokollet) → huvudobjekt. Därtill O9:s
öppna köposter (3) dr-total-kontext och (4) episodkarta — u2:s kvälls-DR stängde
endast (1) och lämnade (2)–(3) öppna ("valDump-NOTIS i dr-total.mjs-kontext
vid nästa total — kedja 1 anropar med absolut väg — oförändrat förväntas").

**Kollisionsbokföring (ärlighetsdoktrinen):** min planerade kvälls-RPO-punkt
blev tagen av u2 21:09 FÖRE min anspråk 21:15 (disk-först-precedens); min
körning 21:13 av dr-rpo-diff med `--json …KVALL.json` skrev till DERAS
committade filsökväg — verifierad SKADEFRI: `git status` + `git diff` tomma =
filen byte-identisk med 9d24c73b (mätvärdena oförändrade 21:09→21:13, se
nedan). Körningen omklassificeras till OBEROENDE REPLIK och deras fil lämnas
orörd. Lärdom (kö till fabriksprompten): delprotokollsökvägar med fast namn
är kollisionsytor när två vaktagenter delar kväll — u2:s autoload var
först, mitt `-AUTO`-suffixmönster (dr-kedja3) är den säkra konventionen.

---

## 1. KEDJA 3 — serverfils-arkivet restore-bevisat (GRÖN, klar 21:12:50 lokal)

`node verktyg/dr-kedja3.mjs` (skal-kvotens kanal 1) — GRÖN exit 0, maskinellt
protokoll `DR-KEDJA3-2026-09-17-AUTO.md`. Kvartalsmallens fjärde steg för första
gången på DAGENS data-läge (paket från 09-16 — se fynd 2 om varför).

| Moment | Värde |
|---|---|
| Grind | RAM 1 756 MB · /tmp 72 GB — GRÖN |
| Självsabotage | 3/3 GRIPNA (kapad gzip · skräp-.tar.gz · kapad bundle — notis: `git bundle verify` GODTAR kapad bundle, KLON-provet dödar = huvuddomen, känt kontrakt) |
| Arkiv A repo-tar (144 MB, 09-16 13:40) | gzip GRÖN · **8 892 poster** · exkluderingskontrakt 0 brott (node_modules/.next/.git/tool-results/data-cache/data-backups ute) |
| **Restore RTO (tar -xzf)** | **3,4 s** — 8 322 filer + 570 kataloger == listat (antalskontrakt) |
| Källkods-yta | src **675 filer / 203 930 rader** (09-16:s källa; dagens träd 20:31-commit — jfr spot-diff) |
| Spot-diff mot levande träd | package.json SKILJER-FÖRKLARAD (trädets commit 2026-09-17 20:30:22 > arkivets mtime 09-16 13:40:13 = kvällens next@16.3.5-patch-kö) · next.config.ts **IDENTISK** · DRIFTSBOKEN SKILJER-FÖRKLARAD (20:23:49-commit) · src/lib/seo.tsx **IDENTISK** |
| Arkiv B git-bundle (151 MB) | verify GRÖN · **klon GRÖN 1 195 commits · RTO 9,6 s** · ancestor GRÖN mot levande HEAD |
| **Total RTO kedja 3** | **3,4 + 9,6 s** (nätverksflytt till ny VPS tillkommer i verklig katastrof) |
| Städning | PG17 nere vid ankomst OCH slut (vilolägeskontraktet — kedja 3 rör aldrig PG, kontraktet verifieras ändå) · /tmp/dr-kedja3-1733678 raderad (restore+sabotage+klon+bv) |

**Slutdom kedja 3: GRÖN** — katastrofformen "servern försvinner, återuppbygg
från arkiven" är bevisad på både kodytan (tar == träd modulo förklarade
commits) och historiken (bundle klonar hela git-historien, ancestor mot
levande HEAD). KORSBEVIS: s10-u1:s KVÄLLS-TOTAL körde kedja 3 som sitt sista
steg (deras DR-KEDJA3-2026-09-17-AUTO-2.md: 24,7 s, samma arkiv) — mitt
fristående lopp (flock-först, klart 21:12:50) + deras totaldel = två kedja
3-bevis samma kväll.

## 2. O9:s kö (3) STÄNGD — dr-total-kontexten: u1:s körbevis + denna KODBEVISREPLIK

**Attribution:** syskonet s10-u1:s KVÄLLS-TOTAL (21:12–21:16, worklog + deras
DR-OVNING-2026-09-17-KVALL-TOTAL.md) stängde samma post med KÖRBEVIS på två
ben: design (dr-total startar barnen utan --fil) + explicit NOTIS-bevis
(AUTO-8 GRÖN utan NOTIS i total-kontext; AUTO-9 = bladnamnskommandot GRÖN med
NOTIS, seriepunkt 22). Mitt bidrag nedan är den OBEROENDE REPLIKEN — två
agenter, samma slutsats ur skilda bevisvägar (deras körning, min kodaläsning);
deras anspråk ~21:12 och mitt ~21:11 ligger i samma fönster, dubbelstängningen
är koordinerad (deras worklog: "u3 ägde beslutsklocka-histogrammet +
kedja3-loppet").

Köposten: "kurens NOTIS-rad bör testas i dr-total.mjs-kontext (dess kedja
1-anrop använder absolut väg — oförändrat beteende förväntas)". Kodbevis
(ingen tung körning — kvartalsverktyget ägs av kvartalscadensen):

- `dr-total.mjs` anropar sina kedjor via
  `spawnSync(process.execPath, [pathJoin(REPO_ROT, 'verktyg', kedja.verktyg)])`
  (dr-total.mjs:235) — **UTAN `--fil`-argument**. u2:s formulering "absolut
  väg" är en presumtion; verkligheten är starkare: **inget vägargument alls**.
- Utan `--fil` kör dr-ovning sin defaultgren `hittaSenasteDump()`
  (dr-ovning.mjs:187–200): readdir på `DUMP_KATALOG` (= `REPO_ROT/data/
  backups/supabase`, absolut rotad i filens egen plats, inte cwd) → senaste
  `db-*.sql.gz` → absolut sökväg. **valDump():s resolveringsgren (rad 207+,
  "given men saknad väg → DUMP_KATALOG/<bladnamn>") berörs ALDRIG av
  dr-total** — kuren kan inte förändra dr-total:s beteende, i ingen riktning.
- AUTO-7 (GRÖN 11,0 s, u2 21:08) + kvällens totala frånvaro av NOTIS-rader i
  u2:s/deras körningar bekräftar: defaultgrenen lever som före kuren.
- **Köposten stängd med PRECISERING:** antagandet "kedja 1 anropar med absolut
  väg" korrigeras till "kedja 1 anropar utan vägargument (defaultgren)" —
  slutsatsen (oförändrat beteende) består, bevisad av kod i stället för
  förväntan.

## 3. O9:s kö (4) STÄNGD — beslutsklockan kartlagd TILL KVARTSNIVÅ (fynd 1)

Läsande sond (COUNT-histogram via PGPASSFILE, inga radvärden — GDPR-ren;
maskinell data: `DR-BESLUTSKLOCKA-2026-09-17-KVALL.json`):

- **board_decisions är en DETERMINISTISK KVARTSKLOCKA: exakt 8 rader per
  :00/:15/:30/:45 → 32/h → 768/dygn.** 24 hela timmar i sträck utan ett
  enda undantag (09-16 22:00 → 09-17 21:00); 21:15-kvarten på plats med 8.
  Per-dag-serien 768 · 768 · 768 · **765** · 768 · 768 · 768 — enda
  avvikelsen 09-13 (765 = −3). Tabellens spänner 2026-07-15 → nu; totalt
  48 410 vid sonden (räknaren +8 sedan 21:13-kvarten = klockan lever).
- **organ_health_logs är den ÄKTA episoden:** 9 rader kl 02:00, 3 kl 04:00,
  9 kl 08:00, 3 kl 10:00, 9 kl 14:00, 3 kl 16:00, 9 kl 20:00 — ronder vid
  irregulära timmar, alternerande 9/3.
- **Omskrivningar:** O9:s "+0 på 9,2 min ⇒ EPISODISK (rondstyrd?)" är FALSK
  för board: med kvartsbatchar är gap upp till ~15 min naturligt — deras
  fönster 14:31–14:40 föll helt mellan :30- och :45-batcherna. s10-u1:s
  "≈36 r/h jämn dygnet runt" bekräftas och mekaniseras (32 board + ~2 organ).
- **Värsta-falls-RPO får sin tredje oberoende beräkningsväg:**
  18 984 (pump) + 768 (board) + ~36 (organ) ≈ **19 788** — möter O9:s ≈19 800
  och u2:s uppmätta +19 780. Tre vägar, samma dom: värsta fallet == dagsteget.

## 4. FYND 2 — kedja 3:s KÄLLA saknar mekanisk cadens (nytt gap, obehandlat)

Restore-beviset ovan gäller ett **agenttriggat** paket. Cadensmätning:

- **Användar-crontaben** (mätt 21:20): exakt 2 backup-rader — 02:30 pg_dump
  (+ markörvakt + 30-dagars retention) och 02:40 backup-fran-molnet.mjs.
  **Ingen rad kör `backup-server-filer.mjs`.** /etc/crontab: inga
  backup-rader (känd sedan tidigare mätning).
- **hybrid-sync** (datorns kanal, som verktyget självt uppger "körs av"):
  `data/backups/hybrid-sync.log` SENASTE körning **2026-09-09 20:09** — och
  redan den misslyckades på båda stegen: "backup-server-filer: ssh-nyckel
  saknas (…hetzner_key)" (RESTKÄLLA — filnamnet bär gamla leverantören;
  verktyget kurades till contabo_key 09-16 men datorns synka.cmd kör
  uppenbarligen fortfarande gamla sökvägen) + "system-events-full: FEL HTTP
  500 på sida 5". Datorns hybridkedja har varit DÖD i 8 dygn — outvecklat
  sedan ingen annan kedja beror av den (02:40-cronen tog över JSON-sidan).
- **Konsekvens:** nyaste serverfilspaket = 09-16 13:40 (agentdrivet i kedja
  3-sammanhang). Vid en katastrof IKVÄLL vore kodarkivet 32 h och
  git-bundlen lika gammal — restore fungerar (bevisat ovan) men
  **förlorade timmars commits**. SQL- och JSON-kedjorna har mekanisk nattlig
  cadens; serverfilskedjan har INGEN.
- **Köpost till huvudagenten (R2-nära — crontaben ägs av huvudagenten,
  precedens: tidigare crontab-kurer gick via dokvåg/huvudagent):** mekanisera
  serverfilspaketet — antingen (a) server-cron-rad ~02:50 (efter 02:40-stegs
  JSON-exporten; verktyget är idempotent, gzip-vakt inbyggd; lägg
  `find data/backups -name 'server-(repo|git)-*' -mtime +30 -delete` i samma
  rad för retentionens symmetri) eller (b) reparera datorns synka.cmd
  (hetzner_key→contabo_key) om dator-valv-arkitekturen ska leva kvar.
  Ingen ändring gjord av denna agent.

## 5. KVD + städning

- `node node_modules/typescript/bin/tsc --noEmit` — **0 fel, exit 0** (före
  commit; src/ orörd = INGET bygge — byggen ägs av prod-synken under
  deploylåset).
- PG17: **nere** vid ankomst och slut (`pg_lsclusters`) — korrekt viloläge;
  kedja 3 öppnade aldrig något PG-fönster (låset togs ändå i familjekontraktets
  ordning, kö-fritt).
- /tmp: dr-kedja3:s restore-katalog raderad av verktyget (verifierat i
  utdata); inga nya /tmp/dr-total-*-rester.
- R2 ORÖRD: inga priser/tier/publicering; .pgpass endast PGPASSFILE-pekare
  (aldrig återgiven); prod DB endast LÄST (COUNT-histogram).
- data/blogg/ ORÖRD. Syskonytor orörda (u2:s KVALL-JSON lämnad byte-identisk;
  u4:s AUTO-8 orörd; deras protokoll orörda).

## 6. Kö till nästa vakt

1. **Serverfilscadensen** (fynd 2) — huvudagentkö: cron 02:50 eller
   synka.cmd-reparation; tills dess: ny puppetdatering vid varje kvartals-DR
   är manuell.
2. **Nattens bladväxling 02:30** (u2:s kö): retrospektivt pump-noll-bevis —
   nytt blads snapshots-total − 1 195 452 skall ≈ +19 8xx; min kvartsklocka
   ger en extraprediktion: board_decisions i blad 08 skall vara
   47 810 + 768 = 48 578 ± 8.
3. 09-13-anomalien (765 i 768-serien) — läsande dagsgranskning vid tillfälle
   (tre förlorade kvartar: vilka? engångs- eller återkommande?).
4. Episodkartans organ-klocka (9/3 vid 02/04/08/10/14/16/20) kan kopplas till
   styrelserondens schema vid nästa rond-läge — endast om RPO-profilen
   behöver den upplösningen.

— protokollfört 2026-09-17 21:2x lokal av s10-u3 (vakt 3/3, O10);
maskinella delprotokoll: DR-KEDJA3-2026-09-17-AUTO.md +
DR-BESLUTSKLOCKA-2026-09-17-KVALL.json (+ replik-data i u2:s
DR-RPO-DIFF-2026-09-17-KVALL.json, byte-identisk, deras ägande).
