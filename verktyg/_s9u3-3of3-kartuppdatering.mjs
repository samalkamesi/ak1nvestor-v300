// _s9u3-3of3-kartuppdatering.mjs — dokvåg s9-u3 3/3 (E33+E34+C16), clobber-kur enligt
// 93f43878/c70adaab-precedensen: N en-träff-ersättningar, abort-grind före EN skrivning.
import fs from 'node:fs';

const FIL = '/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md';

const SEK = `
## UPPDATERING 2026-09-17 (dokvåg s9-u3 3/3 — E33 + E34 + C16 diffade mot verkligheten; "prod-tömningen" MOTBEVISAD)

Objektval mot duplikat: inget av dagens (09-17) passningar rört E33 (senast
09-16 u1 omgång 9, FLAGGA med öppna femstegskö) · E34 (senast 09-16 u3
omgång 9 — sedan dess 19 DR-protokoll + nattens obevakade nattkedja + kvällens
patch-kedja) · C16 (senast 09-16 u3 omgång 9 — sedan dess +51 köfiler/dygn +
sammanställning förnyad + tre kontrollgranskningar). Syskonen u1/u2 i samma
manifest (auto-s9-1789670129370) kör parallellt mot samma fil — E29:s
dokvågslås-gap är levande (u2:s omgång 10 landade 7e124f59 under detta fönster
och respekterades); vedertagen återkörs-precedens gäller vid clobber. Varje
rad MÄTT i arbetsytan 2026-09-17 ~20:3x–20:5x lokal (zcat/git/ls/grep/
loopback-curl + DR-protokollens artefakter — aldrig worklog):

| Mått | Kartan (senaste passning) | Verkligheten 2026-09-17 (mätning) |
|---|---|---|
| Prod-tabellen system_events (E33) | "TOM sedan 13:46 09-16; arkivet = enda kopian" | **LEVER med 163 039 rader** (zcat 09-17-arkivet: antal 163039 · sidor 33 · truncerad false · total-kontrakt 163039/163039 enligt jungfrunatt-protokollet). Äkthetsdiff 09-16 07:24 → 09-17 02:40 = +1 361 rader/19 h 16 min = KONTINUERLIG äkta trafik — en tom tabell hade gett ~hundratal rader, inte 163 039, och ingen återimport är bokförd. ROT: tväprojektfyndet (DR-KEDJA6-2026-09-16): pg_dump-lästa rkaq-projektet SAKNAR system_events helt, arkivet (backup-fran-molnet) läser aufr = appens projekt — 13:46-mätningen föll i fällan; "tömningen" var ett mättillstånd i fel projekt, ej dataförlust |
| Arkiv-cadensen (E33 kö-steg 5) | "ojämn; morgondagens arkiv avgör om kedjan lever" | **STÄNGD**: system-events-full-2026-09-17.json.gz (27 542 167 B) född av cron 02:40 — logg född 02:40:01, hela körningen ≈ 37 s, INGEN agent aktiv (jungfrunatt-beviset), v3-trunceringsvakten GRÖN sin första obevakade natt |
| Dublett-id (E33 blockerare) | "4 st dödar PK-återimporten" | **0 dublett-id i 09-17-arkivet** (jungrunatt-protokollets mätning mot 09-16:s 4) — dedupe-blockeraren försvagad för framtida arkiv (v3-repetitionsskydd, hypotes ej bevisat) |
| ALTER v2 (E33 kö-steg 1) | "förlorad i clobber; disk bär V1" | **FORTFARANDE V1 i disk OCH HEAD** (mätt: git log --follow = enda commiten 2a55da6e 09-05; rad 30 bär syntaxfelet IF NOT EXISTS CONCURRENTLY … (type, + headerns "enkla index"-påstående förblir falskt) — v2 lever endast i DR-INDEX-PROV-2026-09-16-2.md:33-34 |
| Dedupe + schema (E33 kö-steg 3-4) | "dedupe-läge saknas; type 4 st" | **OFÖRÄNDRADE** (mätt: enda ignore-duplicates-träffen = plan-notis rad 205 i aterstall-system-events.mjs; scripts/supabase-schema.sql type TEXT rad 58/194/221/260); inventory 25 dagar (generatedAt 2026-08-23) |
| Natt-backupkedjan (E34) | "cron mätt strukturellt 09-16" | **OBEVAKAD GRÖN**: blad 7 db-2026-09-17.sql.gz fött 02:30:29 (31 733 199 B) + moln-JSON 02:40 — ingen agent i kedjan; retention lever (7 blad 09-11→09-17 på disk; crontab mätt: 4 rader oförändrade) |
| DR-övningar (E34) | "kvartalsövat; nästa senast 2026-12-15" | **19 protokoll IDAG** (ls DR-*2026-09-17*.md): FÖDELSEBEVIS-konceptet (N=0-bladet restore-bevisat 2× oberoende med identiska radtal — race ärligt bokfört) · NATT-RPO första nattdiffen (+19 767 rader oskyddade/23,3 h; 3/60 tabeller bär skulden; natt 34 r/h) · morgon- + eftermiddags-RPO (dubbel punkt, "två klockor") · MIDDAGS-DR = kedja 4 per-typ-vyor första gången (36,0 s) · KEDJA7 BOARD-RECEPT (board_decisions FK-paus/tabellswap) · KIRURGIÖVNING i total-mallen |
| Nya instrument + kur (E34) | — | **dr-rpo-diff.mjs** (per-tabell RPO-skuld, JSON-utdata) + KUR av falsk RÖT-dom på sunt blad: relativ väg → markörkoll 0 kB → resolverad mot dumpkatalogen, beteendeprov GRÖN RTO 14,1 s (protokoll AUTO-3/4/5 = RÖT-bevis/GRÖN/beteendeprov) |
| Patch-kön (E34, s8-kvällen) | ej i kartan | **MEKANISERAD + REAKTIVERAD**: package.json next ^16.3.5 låst · kvittoarkiv patch-kvitton-arkiv-2026-09-17T18Z.jsonl (+ .backup-o49) · patch-byggfel/ TOM (0 nya byggfel sedan kurerna) · prod-synk bär pm2-vakt + artefakt-manifest (KRITISKA_FILER) · DRIFTSBOKEN 2 nya sektioner (17:42Z 502-klassen; 18:5x-19:4x patch-/grindvakt). Korsnotis u2 omgång 10: prod 502 under planerat patch-fönster 18:37Z — min sond EFTER: se raden längst ned |
| ISR-varmarens täckning (E34 gap 3) | 12/44 | **12/44 FEM nätter i rad** (loggen 09-13→09-17 kl 03:10-03:11) — körningen lever, täckningen står fast |
| Migreringsguiden (E34) | saknas i kartan | **data/infra/MIGRERING-NY-DATOR.md** (huvudagenten 09-16): kvickstart 3 steg + ALLA inloggningsuppgifter — SÄKERHETSFYND: bär studions lösenord i KLARTEXT i repot (pre-commit täcker .env/pem/key — inte .md; repot speglas mot GitHub av arbetsstationen) — gap bokförs, filen orörd (huvudagentens yta, R2-känslig) |
| Prod-sond (E34) | — | **200 på 0,04 s** (egen loopback-curl, ~20:4x — EFTER u2:s 502-patchfönster: pm2-återstarten landade, läkningen bekräftad) |
| Granskningskön (C16) | 124 filer (09-16) | **175 filer** (+51/dygn, find-mätt): rot 48 · m9-ko 7 · granskning 77 · kvartal 43; data/blogg/ 55 publicerade oförändrade (publicering = kundens klick, R2) |
| Kundens kö-vy (C16) | "sammanställningen åldras (09-14-vyn)" | **FÖRNYAD 16:58 IDAG** (GRANSKNINGSKO-SAMMANSTALLNING.md, 99 474 B) — gap stängt |
| Granskningsmotorn (C16) | "utkast kopplas till knappflödet" | **OBEROENDE KONTROLLGRANSKNING i högvarv** (s1-spåret, 3 st idag): substansrabatt (#2) + rörelsekapital (#3) + B6-industriaktier — maskinella sifferkontroller mot git-återkallat bolagsuniversum, juridikgrind 0 fynd, diff-JSON-paket (gammalt/nytt-kontrakt), anspråksfiler för syskonkoordinering, §8-systemfyndet (BlogPost-familjen ~ord/200 vs SEO-GUIDER ≤2-min — fel släkts kontrakt påvisat och dom rättad) |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| E33 | FLAGGA 7 → **LEVER 8** | FLAGGA-motivet (tom prod) är MOTBEVISAT av arkivkedjan (163 039 rader kontinuerligt; mätning ovan) — inget dataförlustläge föreligger i appens projekt och återimport-kön kan AVBOKAS (fel projekt mättes). Samtidigt: arkivcadensen obevakat grön, 0 dublett-id, kedjan bär total-kontrakt. Kvar: V1-faran på disk (aktuell fil = dubbeltrappan), composite-indexet ej installerat, schema-driften, inventory 25 d — därför 8, ej högre (tillbaka till nivån före den felaktiga sänkningen) |
| E34 | LEVER 9 → **LEVER 9** | Redan toppreviderad (omgång 9); passningen tillför instrumentdjup (RPO per tabell, födelsebevis, obevakad nattkedja) och patch-kön som mekaniserat väntar-läge — inget nytt rot-gap stängt, inget öppnat: ISR 12/44 lever kvar, migreringsfilens klartext-lösenord är NYTT gap (säkerhetsklass), prod-bygget av 16.3.5 inte landat vid mätningen |
| C16 | LEVER 8 → **LEVER 8** | Sammanställningen förnyad + granskningsmotorn bevisad i högvarv (3 kontroller/dygn med maskinella paket) — men publiceringsuttaget står still (55 frysta, kundens klick = R2) och kön växer +51/dygn; B13-precedensen: ingen score-rörelse utan E2E-publiceringsbevis. Flaskhalsen är FÖRFLYTTAD från granskning till publiceringsbeslut |

Snittscore **7,5** (286 → **287 poäng** / 38 system; E33 +1 vid denna dokvåg).

Sidofynd utanför de tre systemen: (a) E33:s femstegskö FÖRENKLAS — steg 2-3
(index FÖRE återimport + dedupe-läge) var motiverade av en återimport som nu
är avbokad; kvar levererar steg 1 (ALTER v2 återleverans ur
DR-INDEX-PROV-2026-09-16-2.md:33-34), steg 4 (schema-synk) och ett NYTT steg:
tväprojekt-mätfällan dokumenteras i DRIFTSBOKEN (rkaq vs aufr — pg_dump saknar
tabellen; sonder mot "system_events i prod" MÅSTE deklarera projekt).
(b) MIGRERING-NY-DATOR.md-lösenordet (E34) eskaleras till huvudagenten —
filen är kundnära driftdokumentation men repot speglas mot GitHub.
`;

const E = [
  // 1. Huvudsektionen införs före ÖVERSIKT
  {
    g: `\n## ÖVERSIKT — 38 system`,
    n: `\n${SEK}\n## ÖVERSIKT — 38 system`,
  },
  // 2. E33 detaljblock: rubrik + ny not
  {
    g: `## E33. Supabase-persistenslagret — FLAGGA — 7/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 9, återdiff): LEVER 8 →`,
    n: `## E33. Supabase-persistenslagret — LEVER — 8/10 *(uppdaterad 2026-09-17)*\n\n*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3): FLAGGA 7 → LEVER 8 — "prod-tömningen" MOTBEVISAD: 09-17-arkivet (cron 02:40, obevakat) bär 163 039 rader med kontinuerlig äkthetsdiff (+1 361 sedan 09-16 07:24) — appens projekt (aufr) var aldrig tomt; 13:46-mätningen föll i tväprojektfällan (pg_dump-lästa rkaq saknar tabellen helt; kedja 6:s fynd). Återimport-kön AVBOKAS; arkiv-cadensen grön utan agent; 0 dublett-id i nya arkivet. Kvar lever: V1 på disk/HEAD (v2 endast i DR-INDEX-PROV-2026-09-16-2.md:33-34), composite-indexet ej installerat, schema-drift, inventory 25 d. Se diff-tabellen i UPPDATERING-sektionen.*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u1 omgång 9, återdiff): LEVER 8 →`,
  },
  // 3. E34 detaljblock: rubrikdatum + ny not
  {
    g: `## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): score 8 → 9`,
    n: `## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-17)*\n\n*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3, passning utan score-rörelse): natt-backupkedjan OBEVAKAT GRÖN (blad 7 fött 02:30 + moln-JSON 02:40, ingen agent i kedjan); 19 DR-protokoll på ett dygn — FÖDELSEBEVIS (N=0-bladet 2× oberoende), RPO-instrumentet dr-rpo-diff.mjs (per-tabell skuld; natt +19 767 rader/23,3 h, 3/60 tabeller), falsk RÖT-dom kurerad (relativ väg → dumpresolvering; beteendeprov 14,1 s); patch-kön mekaniserad + reaktiverad (next ^16.3.5 låst, kvittoarkiv 18Z, pm2-vakt + artefakt-manifest i prod-synken) med prod 200 egen sond EFTER u2:s 502-patchfönster; ISR 12/44 fem nätter i rad (gap lever). NYTT GAP: data/infra/MIGRERING-NY-DATOR.md bär studions lösenord i klartext i repot (speglas mot GitHub) — huvudagenten äger filen. Se diff-tabellen i UPPDATERING-sektionen.*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): score 8 → 9`,
  },
  // 4. C16 detaljblock: rubrikdatum + ny not
  {
    g: `## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-16)*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): granskningskön 44 → 124`,
    n: `## C16. M9-innehållsfabriken — LEVER — 8/10 *(uppdaterad 2026-09-17)*\n\n*Uppdatering 2026-09-17 (dokvåg s9-u3 3/3, passning utan score-rörelse): Kön 124 → 175 filer på ett dygn (rot 48 · m9-ko 7 · granskning 77 · kvartal 43) medan data/blogg/ står på 55; GRANSKNINGSKO-SAMMANSTALLNING.md FÖRNYAD 16:58 samma dag (gapet "åldrande vy" stängt); granskningsmotorn i högvarv — 3 oberoende kontrollgranskningar (substansrabatt, rörelsekapital, industriaktier) med maskinella sifferkontroller, juridikgrind 0 fynd, diff-JSON-paket och anspråkskoordinering; §8-systemfyndet: BlogPost ~ord/200 vs SEO-GUIDER ≤2-min (fel släkts kontrakt påvisat, dom rättad). Flaskhalsen är nu publiceringsuttaget (kundens klick, R2), inte granskningen. Se diff-tabellen i UPPDATERING-sektionen.*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 9): granskningskön 44 → 124`,
  },
  // 5. ÖVERSIKT-rad E33
  {
    g: `| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | **FLAGGA** | 7 | PROD-TÖMT 09-16 (mätt): system_events tom sedan 13:46, arkivet 09-16 07:24 = enda kopian (27,5 MB), återimport MEKANISERAD men blockerad (dedupe-läge saknas, mätt) + KURERAD ALTER v2 FÖRLORAD i clobber (commit a3756ab7 bokför leveransen men saknar filen — disk/HEAD bär V1, dubbelt underkänd; enda v2 = index-provets protokoll rad 33); DR = SQL + moln-JSON (mätt); översättningskö 320 oförändrad (kund-SQL krävs) |`,
    n: `| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | LEVER | 8 | "PROD-TÖMT 09-16" MOTBEVISAT (mätt 09-17): 163 039 rader levande i appens projekt (aufr) — 13:46-mätningen föll i tväprojektfällan (rkaq-dumpar saknar tabellen, kedja 6); arkiv-cron grön OBEVAKAT 02:40, 0 dublett-id; kvar: ALTER V1 på disk/HEAD (v2 endast i index-provsprotokollet), composite-index ej installerat, schema-drift, inventory 25 d; kedja 2 = enda system_events-kopian |`,
  },
  // 6. ÖVERSIKT-rad E34 (sloopande rad: detaljblocket bär 9 sedan omgång 9 men ÖVERSIKT visade 8 + incidenttext)
  {
    g: `| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 8 | PROD-INCIDENT 09-16 (mätt): OOM-kedja → .next inkomplett → KUNDSYNLIGT OSTYLAD 10:02→pågående 13:19 med alla vakter blinda utom pulsvaktens nya sond; bristklassen ÅTERKOM i "fullföljt" bygge 12:50 (färsk prerender refererar 12 ej emitterade chunks — 12/25 × 404 mätt mot prod OCH disk); läkning = ombygge vid RAM≥2200 (pågick vid mätningens slut); DR/backup själv grön (kvartals-DR 2×, dump-markörvakt, RAM-vaktens vägran RÄTT); NYTT GAP: post-build-artefaktverifiering; kvar: cron-koppling + pgpass, hybrid-sync, ISR 12/44, Storage-restore |`,
    n: `| E34 | Drift, backup & DR (Contabo) | Grund | LEVER | 9 | Rot-gapet STÄNGT (omgång 9: artefaktverifiering i deploy+kraschvakt); 09-17 tillagt: nattkedjan OBEVAKAT grön (blad 7 + moln 02:40), 19 DR-protokoll/dygn (födelsebevis 2×, RPO per tabell: natt +19 767/23,3 h, falsk RÖT-dom kurerad), patch-kön reaktiverad (next ^16.3.5, pm2-vakt + artefakt-manifest), prod 200 efter 502-patchfönstret; kvar: ISR 12/44 (fem nätter fast), hybrid-sync, Storage-restore, NYTT: MIGRERING-NY-DATOR.md lösenord i klartext i repot |`,
  },
  // 7. ÖVERSIKT-rad C16
  {
    g: `| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp finns (v82 — gamla "saknas" motbevisat); M9-kön ej kopplad + växer (11 JSON + 22 kvartalsfiler: 12 bolagspaket + 10 kalendrar, mätt 09-16); schemalagd re-run saknas |`,
    n: `| C16 | M9-innehållsfabriken (granskningskön) | Innehåll | LEVER | 8 | B2-knapp lever (v82); kön 175 filer (+51/dygn: rot 48 · m9-ko 7 · granskning 77 · kvartal 43, mätt 09-17) med sammanställningen FÖRNYAD 16:58 + 3 oberoende kontrollgranskningar/dygn (maskinella paket); flaskhals = publiceringsuttaget (55 frysta, kundens klick R2); schemalagd re-run saknas |`,
  },
  // 8. Snittscore-raden
  {
    g: `Snittscore: **7,5/10** (286 poäng / 38 system; E35 +1 vid omgång 11:s återdiff 09-17`,
    n: `Snittscore: **7,5/10** (287 poäng / 38 system; E33 +1 vid dokvåg s9-u3 3/3 09-17 — "prod-tömningen" motbevisad, FLAGGA hävs; E35 +1 vid omgång 11:s återdiff 09-17`,
  },
];

let t = fs.readFileSync(FIL, 'utf8');
for (let i = 0; i < E.length; i++) {
  const c = t.split(E[i].g).length - 1;
  if (c !== 1) {
    console.error(`ABORT: mönster ${i + 1} träffar ${c} gånger — inget skrivet`);
    process.exit(1);
  }
}
for (const e of E) t = t.replace(e.g, e.n);
fs.writeFileSync(FIL, t);
console.log(`OK: ${E.length} ersättningar skrivna (en-träff-grind passerad)`);
