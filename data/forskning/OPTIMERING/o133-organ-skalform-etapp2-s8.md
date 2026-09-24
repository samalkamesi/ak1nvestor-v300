# o133 — ORGANENS SKALFORM ETAPP 2: samtliga levande organ i execFileSync-arrayform (spår 8, s8-u3)

**Våg:** Kvalitetsvåg o133 — manifest auto-s8-1789943721747 (vakt 3/3), fönster 2026-09-20 22:36–23:0xZ.
**Protokollnummer:** reserverat under flock 22:38Z (verktyg/reservera-protokollnummer.mjs --nästa
--ägare s8-u3 → o133, hogstaKanda o132, 132 källträffar) — o117-doktrinen följd PRE-val.
**Bokning som infrias:** o123 §5.1 "Etapp 2 — organens skalform (26 anrop)" — hela posten.

## §0 — VAL (duplikatkontroll)

Anspråk disk-först 22:38:28Z. Spårets levererade granskade mot worklog (o86–o131): etapp 2
OLEVERERAT. KOLLISION (hederligt redovisad, o123 §6-mönstret): syskonet s8-u2 skrev eget
anspråk på SAMMA objekt 22:39:11Z (43 s efter mitt; deras fil anger själv s7-precedensen
"först på disk" + namnger mittdatum) — mitt ägarskap gäller, deras eventuella delarbete
deras; denna våg redovisas fullständigt här och dubbelarbete konstateras endast som
tidsstämpelfakta, ingen gemensam fil berörs av två skrivande parter i detta fönster
(git-status genom hela vågen: endast de nio organfilerna + bokföring modifierade).

## §1 — FYND OCH LÄGE

**FÖRE (mimosa v1.6, kanonisk full-scan via kvalitetsvaktens exaktanrop
`--doman . --hoppa-over 'testa-mimosa-paritet\.mjs$'`):** 2 142 filer · 0 fynd GRÖN ·
**70 CHILD_PROC_STRANG_LITERAL-info**. Trädet växt sedan o123:s bas (2 025/67; syskonvågor
tillför filer — doktrinometern är levande). Fördelning: **levande organ 30** (feljagaren 9 ·
kraschvakt 6 · _f2-familjen 13 · agentfabrik 4 · granssnittsvakt 1 · process-trad 1 —
f2-familjen högre än o123:s räkning: verklig fördelning vid mättillfället) · engångssonder 8 ·
.zcode-speglar 16 · skrap-arkiv 15 (de senare tre = ej organ, bokade för skrap-arkiveringsronder).

## §2 — KUR (9 filer, 34 anrop konverterade, alla exec/execSync-literaler → execFileSync-arrayform)

| Fil | Anrop | Noteringar |
|---|---|---|
| verktyg/feljagaren.mjs | 9 | 4 skal-pipe/`\|\|`-konstruktioner omgjorda EKVIVALENT i node: tsc-`2>&1 \| head -5` → try/catch som returnerar stdout+stderr kapat 5 rader (pipe:ns exit-0-bevarande bevarat; TS2688/2307-gren + "kraschade"-yttercatch intakta; process.execPath följer filens egna stil) · `pgrep -c zcode \|\| echo 0` → exit-1-gren pga pgrep:s nollträffar-exit, övriga fel kastas vidare till F2-catchen · `df \| tail \| awk` → sista radens 5:e kolumn · `git ls-files … \|\| echo NEJ` → catch med stdout-fallback |
| verktyg/kraschvakt.mjs | 6 | pm2 jlist/stop/restart ×4 (replace_all — identiska rader). RAD 298 LÄMNAD MEDVETET: räddningsbyggets `execSync(`…${…}`…)` är CHILD_PROC_INTERP-klass, redan citat-härdat (JSON.stringify-skydd ×2) — annan klass, ej denna vågs ägo |
| verktyg/agentfabrik.mjs | 4 | git log/rev-parse, ps, sleep. Förälderprocessen LEV under fönstret: alla 4 + node --check klara 22:43:29Z — FÖRE 22:45-ropet. Rad 276 `execSync(kommando, …)` = variabel-form, ej STRANG-klass, orörd |
| verktyg/_f2-kur.mjs | 4 | bash-piper: `\|\| echo PORT-FRI` → filter+fallback; grep-tomt-läge i sond 2 → throw (bevarar exit-1-ekvivalensen för yttre catchens KRITISKT-rad) |
| verktyg/_f2-status.mjs | 4 | jlist/ss/ps/curl (curl med enkla citat+yttre `"` = mimosa-osynlig klass, kurad ändå — doktrinen är formen) |
| verktyg/_f2-slutverifiering.mjs | 3 | jlist/ss/curl |
| verktyg/_f2-doda-devort.mjs | 2 | ss/curl |
| verktyg/granssnittsvakt.mjs | 1 | flock-proben (deployLasUpptaget) — semantikmotsvarande feljagarens deployPagar |
| verktyg/process-trad.mjs | 1 | ss -ltnp i hamtaPortagare |

Felgrenar (e.status, kod === ETIMEDOUT m.m.) är identiska mellan execSync/execFileSync —
node:s felobjekt bär samma fält för båda formerna; encoding/stdio/timeout/cwd/options
överförda ordagrant. Tre curl-sonder i f2-familjen syntes INTE av v1.6:s regex (enkla citat
med inre `"`) men kurades ändå (redovisat under kända gränser).

## §3 — BEVIS

| Bevis | Resultat |
|---|---|
| node --check × 9 | GRÖN (efter varje fil, o123-doktrinen) |
| Mimosa EFTER (samma kanon-anrop) | **2 145 filer / 0 fynd GRÖN / 39 STRANG-info (70 → 39, −31)** — 0 kvar i levande organ; rest = 8 sonder + 16 .zcode + 15 arkiv |
| Levande sond process-trad | hamtaPortagare(3000) = {finnas:true, pid:4070892} via NYA arrayformen (import, export-anrop) |
| Levande sond feljagaren | hamtaAppAlderMin() = 17 min — pm2 jlist-vägen går genom kur-koden (import, export-anrop) |
| Levande bevis agentfabriken | 22:45:21.809Z-ropet KÖRDE med de kurade formerna (mina edits + check 22:43:29Z) — loggade normalt i logg.jsonl (ram-vakt 1 486 MB → korrekt väntar; ingen krasch, ingen tyst död) |
| Grannsviter × 6 | testa-kraschvakt 53 fall exit 0 · testa-feljakt-f1-atermatning 5/5 · testa-granssnitt-drift 45/0 · testa-granssnitt-cron-loggklass 23/0 · testa-artefakt-verifiering 15/15 · testa-larm-eskalering 23/23 |
| Instrumentregression | testa-mimosa-paritet ALLA PASS (orört — endast mät) |
| tsc projektbinär | **0 fel** (src/ orörd — kvitto) |
| Bygge | INGET (prod-synken äger) |
| Rådata | data/vakten/_s8u3o133-mimosa-{fore,efter}.json (gitignorerad körningsdata) |

Gränsnittsvaktens Chrome-drift bevisas av cron 01:17 lokal (23:17Z, ~20 min efter commit)
som kör den kurade filen i skarpt läge — node --check + 2 sviter + drift-modulens 45/0 bär
förr (RAM-respekt, o105-precedensen: eget Chrome-svep avstås när syskon trycker minnet).

## §4 — PROCESSFYND (ärlig redovisning)

1. **_f2-kur rad 27-fel under egen kur:** första node-baserade strängbygget tappade ett
   slutcitat (trasig rad synlig i chatt-fönstret) — fångat OMEDELBART av Read-före-Edit-
   disciplinen och kirurgiskt rättat innan nästa steg; node --check GRÖN efter. Läxa:
   citeringskrångel i bash-escaped node -e → använd Edit-verktyget, inte strängbyggen.
2. **_f2-doda-devort bär en REDAN existerande import-bugg** (`import fs from
   "node:child_process"` — fel modulnamn, rad 5; filen använder `f` från node:fs och fs
   aldrig) — förhistorisk, orörd av denna våg (filscope-respekt), protokollförd för en
   framtäd städvåg. Kraschrisk ingen: fs-identifieraren oanvänd.

## §5 — BOKNINGAR (nästa våg)

1. **STRANG-resten 39 → städning:** 8 engångssonder i verktyg/ + 15 skrap-arkivposter +
   16 .zcode-speglar — lämpligast en skrap-arkiveringsrond (o123 §5.1:s "kan lämnas eller
   städas"); _r107-motorregen/sond är RONDAKTIVA och bör kuras först bland sonderna om
  something roterar dem igen.
2. **Doktrinometer:** STRANG-räknaren i levande filer ska vara 0 — varje ny verktygsfil
   som föds med exec/execSync-literal syns nu direkt (v1.6); fabriksmanifestmallens rad
   "nya verktyg föds i execFileSync-arrayform" fortfarande huvudagent-yta (o123 §5.3 kvarstår).
3. **u2-kollisionen:** om s8-u2 hunnit påbörja samma kur innan min commit syns — deras
   arbete deras; härmed full redovisning av detta fönsters samtliga ändringar.

R2 orörd — inga priser/tier/publicering; data/blogg/ orörd; .env* orörda; src/ orörd.
