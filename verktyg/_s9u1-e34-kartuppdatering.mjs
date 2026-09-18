// _s9u1-e34-kartuppdatering.mjs — dokvåg s9-u1 omgång 13: E34 återdiff.
// Clobber-kur: varje ersättning måste träffa EXAKT EN gång, annars abort utan skrivning.
import fs from "node:fs";

const FIL = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
let t = fs.readFileSync(FIL, "utf8");

const GAMMAL_E34 = `| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 8 | PROD-INCIDENT 09-16 (mätt): OOM-kedja → .next inkomplett → KUNDSYNLIGT OSTYLAD 10:02→pågående 13:19 med alla vakter blinda utom pulsvaktens nya sond; bristklassen ÅTERKOM i "fullföljt" bygge 12:50 (färsk prerender refererar 12 ej emitterade chunks — 12/25 × 404 mätt mot prod OCH disk); läkning = ombygge vid RAM≥2200 (pågick vid mätningens slut); DR/backup själv grön (kvartals-DR 2×, dump-markörvakt, RAM-vaktens vägran RÄTT); NYTT GAP: post-build-artefaktverifiering; kvar: cron-koppling + pgpass, hybrid-sync, ISR 12/44, Storage-restore |`;

const NY_E34 = `| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 8 | Huvudgapet (post-build-artefaktverifiering, omg 9) STÄNGT mekaniskt: verifieraArtefakt bär KRITISKA_FILER i prod-synkens deploygrind (prod-synk.mjs:785, stoppar pm2-restart + DEPLOYAD-markör) + kraschvaktens ärlighetsgrind — svit 15/15 egen + skarp sond GRÖN 1364 HTML/81 ref (mätt 09-17); pm2-race-kuren DRIFTBEVISAD ×2 (skapaPm2Vakt :482, återstart i main():s finally höll 18:33:01Z + 18:41:19Z); RCE-patchen next 16.3.5 LIVE i prod (processbevis; package+lock committade 957272f8; patchkö-svit 51/51 egen); döda länkar 3 473/0/793 s + filskyddet bevisat (o47:s 13:46-fil orörd); DR-KEDJA7 ×4 (09-17); MEN tre kundsynliga 502-fönster samma dag (17:42–47Z-incident + 2 patchfönster 4m51s+3m44s, rond 2 OBEHÖVIG) + KVITTO-LÖGNEN lever (lock-commit no-op räknas "misslyckad", 4 kvitton, kön stängd på falsk grund) + mål-återarmning bröts (FEL 502 18:32:57Z); kvar: hybrid-sync, ISR 12/44, Storage-restore |`;

const SEKTION = `## UPPDATERING 2026-09-17 (dokvåg s9-u1 omgång 13 — E34 återdiffad; patch-ködramat fångat PÅ LIVE + artefaktgrinden stänger rot-gapet)

Objektval enligt varv-regeln "störst verklighetsrörelse sedan senaste
passning": E34:s domän har sedan 09-16-passningen (omgång 9) tagit emot
o50 (artefaktmanifestet + patchkö-svit 51/51 + DRIFTSBOKEN-vaccin 1),
o55 (skapaPm2Vakt-race-kuren + svit 35/35), RCE-patchen next 16.3.5 och
döda-länkar-vågen. Dokvågen föll MITT I patch-rond två: mätningen inleddes
i ett PÅGÅENDE 502-fönster (pm2 stoppad av vaktens designgren 18:37:35Z)
och avslutades i läkt prod 18:41:19Z — hela kedjan EGENMÄTT (egna
svitkörningar med sanna exitkoder, skarp sond, processlista, HTTPS-sonder,
node-läsning av kvitton/rapporter, crontab, git log). Anspråksfil
data/vakten/auto-s9-1789670129370-u1-ansprak.md skrevs FÖRE skrivningen.

| Mått | Kartan 09-16 (omg 9) | Verkligheten 09-17 (mätning) |
|---|---|---|
| Prod-kontinuitet | incident, läkning pågick vid mätningsslut | **200 på 6 ytor** (/, /kurser, /blogg, /laroplan, /analyser, /studio — egna HTTPS-sonder) MEN tre kundsynliga 502-fönster samma dag: 17:42–17:47Z (avbrutet bygge, DRIFTSBOKEN-post) + patchfönster 1 18:28:10→18:33:01Z (4m51s) + patchfönster 2 18:37:35→18:41:19Z (3m44s); rond 2 var OBEHÖVIG — rond 1 deployade redan 16.3.5, de falska misslyckad-kvittona drev en extra nedtid |
| post-build-artefaktverifiering (omg 9:s NYTT GAP) | saknas i deploy-kedjan | **STÄNGT, mekaniskt**: verifieraArtefakt bär KRITISKA_FILER (BUILD_ID + prerender-manifest.json + routes-manifest.json, artefakt-verifiering.mjs:48) i prod-synkens deploygrind (prod-synk.mjs:785 — stoppar pm2-restart OCH DEPLOYAD-markör) + kraschvaktens ärlighetsgrind; svit 15/15 egen exit 0; skarp sond mot prod-.next GRÖN 1364 HTML/81 ref (2,3 s) |
| .next-racet (ENOTEMPTY) | okänd rot vid passningen | **skapaPm2Vakt DRIFTBEVISAD ×2**: pm2 stoppas i patch-grenen (fail-open), återstartas i main():s finally — garantin höll båda rundorna (18:33:01Z + 18:41:19Z, synkloggbevis); svit 35/35 egen exit 0 |
| RCE-patchen next 16.3.5 | kön "död av 3 kvitton", 16.3.2 i prod | **LIVE I PROD**: next-server v16.3.5 i processlistan, package.json + lock committade (957272f8), .next byggt med 16.3.5; patchkö-svit 51/51 egen exit 0; MEN kvitto-lögnen: lock-commit-räknaren dömer "nothing to commit" som misslyckad (18:32:57Z + 18:41:09Z = 4 kvitton i patch-kvitton.jsonl) trots levererad patch ⇒ kön stängs på falsk grund |
| Döda länkar | 3 012/0 (s8-u3:s våg) | **3 473 sökvägar · 0 döda · 0 omdirigeringar · 793 s · tvingad:false** (rapport 20:26:42); filskyddet BEVISAT: o47:s 13:46-bevisfil (1 616 döda = hela-sajten-nere-fönstret; profil ar 451 · en 451 · analyser 231 · kurser 203 · labb 201) orörd vid sidan av; svit 24/0/0 egen — MEN miljökänslighet mätt: sviten FAILAR (kod 1 + TypeError rad 159) under PÅGÅENDE äkta bygge — byggprocess-grinden ser globala /proc, fixture-cwd isolerar ej |
| DRIFTSBOKEN | incident-post 09-16 | **+2 färska poster**: 17:42–17:47Z-incidenten (ROT: next build ej atomisk — BUILD_ID skrivs före sista manifesten; tre vaccin) + 18:5x-posten (vaccin 1 INFRIAT av o50 + PROCFS-regeln: ALDRIG /proc som fs-mål i testfixturer) |
| DR/backup | kvartals-DR 2×, markörvakt grön | **DR-KEDJA7 ×4 samma dag** (14:40–14:46 — kirurgireceptet för triggerblockade tabeller: board_decisions-FK:n mot immutable-triggern); crontab-kurer mätta live: pg_dump 02:30 med PGPASSFILE + kolla-dump-markorer --natt + 30-dagars retention, backup-fran-molnen 02:40 |
| Typbaslinjen | (E35-yta, driftrelevans) | **tsc 0 rader, exit 0** via projektbinären (node_modules/typescript/bin/tsc) — o12:s o47-driftklass har ej återkommit |

Poäng: **E34 LEVER 8 kvar** — omgång 9:s namngivna huvudgap är mekaniskt
stängt och race-kuren driftbevisad i skarpt läge, MEN samma dag levererade
verkligheten tre kundsynliga avbrottsfönster (varav ett onödigt), en öppet
levande felräknare (kvitto-lögnen) och en bruten mål-återarmning ("mål-
återarmning FEL 502" 18:32:57Z i synkloggen) — netto E33/B14-precedensen
(fynd utan poängrörelse; B7-precedensen spänner åt andra hållet: driftgap
nådde konsumentytan IDAG). Snitt 7,5 / 286 / 38 oförändrat.

Korsnotiser: (a) döda-länkar-svitens byggfönster-krav = E35:s verktygsbälte
(köpost dit); (b) syskon u2:s B9-mätning skedde i patchfönstret (deras
"live-sonder 502, läkningen ägs av synken" var detta fönster — korrekt
bokfört av dem); (c) s8-u2:s lockcommit-notis (data/vakten/
s8u2-o55-patchko-lockcommit-notis.md, 20:33) dokumenterar no-op-klassen
från patch-köns sida och dömer den harmlös-gynnsam — denna dokvåg bekräftar
INNEHÅLLET (patchen lever) men visar RÄKNARENS konsekvens: onödig rond 2.

Kö till huvudagenten: (1) lock-commit-räknaren: "nothing to commit" när
package.json + lock redan bär målversionen i git = FRAMGÅNG, ej misslyckad
(annars bokför varje framtida patch leverans som fel + onödiga ombyggen);
(2) patchfönstret ~4 min kundsynlig nedtid per rond — bokas som godkänt
fönster ELLER kur (skuggbygge + swap); (3) mål-återarmningens 502-tålighet
(retry vid driftfönster); (4) döda-länkar-sviten märks "kräver byggfritt
fönster" i sin header.`;

function byt(namn, fran, till) {
  const n = t.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT ${namn}: ${n} träffar (kräver exakt 1)`);
    process.exit(1);
  }
  t = t.replace(fran, till);
}

byt("E34-rad", GAMMAL_E34, NY_E34);

const ANKARE = "## ÖVERSIKT — 38 system";
byt("sektion", ANKARE, SEKTION + "\n\n" + ANKARE);

fs.writeFileSync(FIL, t);
console.log("OK: E34-rad ersatt + sektion insatt före ÖVERSIKT");
