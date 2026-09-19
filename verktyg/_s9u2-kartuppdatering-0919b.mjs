/**
 * _s9u2-kartuppdatering-0919b.mjs — dokvåg s9-u2 (manifest auto-s9-1789800329491)
 * Uppdaterar SYSTEMKARTAN: B9 + E33 (återdiff 2026-09-19) + UPPDATERING-sektion
 * + ÖVERSIKT-rader + snitt. Varje ersättning har EN-TRÄFF-ANKARE med abort-grind:
 * 0 eller >1 träffar ⇒ HELA skriptet avbryts INNAN någon skrivning (clobber-skydd,
 * s9-u2-läxan). EN atomär skrivning av hela filen. (Filen ...0919.mjs ägs av
 * förra manifestets s9-u2 — därför suffix b.)
 */
import { readFileSync, writeFileSync } from "node:fs";

const FIL = "data/forskning/SYSTEMKARTAN.md";
let text = readFileSync(FIL, "utf8");
const original = text;

const ersatt = (ankare, ny, namn) => {
  const n = text.split(ankare).length - 1;
  if (n !== 1) {
    console.error(`ABORT: ankar "${namn}" gav ${n} träffar (krävde 1) — ingen skrivning skedde.`);
    process.exit(1);
  }
  text = text.replace(ankare, ny);
};

// ── 1. B9 rubrik: stampel + score ──────────────────────────────────────────
ersatt(
  "## B9. Vågsystemet AK1TS — LEVER — 8/10 *(uppdaterad 2026-09-17)*",
  "## B9. Vågsystemet AK1TS — LEVER — 7/10 *(uppdaterad 2026-09-19)*",
  "B9-rubrik",
);

// ── 2. B9 nytt återdiff-block (före B10-rubriken) ─────────────────────────
const b9Block = `*Återdiff 2026-09-19 (dokvåg s9-u2, manifest auto-s9-1789800329491;
syskonet u3:s pivot-mätningar korsvaliderar nivåerna — deras B9-gåva på disk
bokförd): skanningen lever dagligen — senaste rad genererad
2026-09-19T05:05:21.478Z (Vercel-cronens minut; /api/vagscan/senaste läser
type=eq.vagscan UR system_events), universum exakt 12/12 tickers, svit 57/57
PASS exit 0 EGEN, /vagfundament 200 (41 ms), kärnan kodstilla sedan 09-17
(motor 1 078 r exakt). MEN STORFYND — HISTORIEKONTRAKTET BRUTET (route.ts:23:
"den dagliga vagscan-historiken (system_events) ÄR den fulla historiken"):
read-only sond mot LEVANDE tabellen (verktyg/_s9u2-b9-vagscan-rader.mjs,
Mimosa-mönstret — .env via loadEnvFile, nycklar aldrig loggade): TOTALT 1
vagscan-rad (dagens), 2 signal-rader, 5 organ-rader — SAMTLIGA från idag;
föregående dagars rader existerar ej kvar. BEVISKEJDA FÖR RADERING (motbevisar
u3:s båda tolkningsgrenar): (1) id-diff 09-16→09-17-exporterna = exakt 4 rader
försvann (vagscan 05:05:24 + signal 05:05:24 + organ 05:05:25 + organ 03:01:37,
samtliga 09-16 — BEVISLIGEN skrivna, funna i 05:24Z-exporten, borta ur
00:40Z-dumpen) medan 17→18 och 18→19 = 0 försvunna ⇒ gren (a) skrivfel
motbevisad som huvudförklaring; (2) alla fyra nattexporterna är FULLSTÄNDIGA
(truncerad:false, antal==totaltFranApi) ur SAMMA aufr-projekt som appen läser
(appens URL ref-prefix aufr mätt; service-nyckel satt) ⇒ gren (b) tväprojekt
motbevisad. RADERAREN EJ IDENTIFIERBAR I REPOT: samtliga DELETE-anrop
genomgångna — organ.ts:s retention är typ-scopad (30/35 d; allowlisten SAKNAR
vagscan/signal/organ men regeln raderar >30 d, ej <1 d), cleanup-rutten
(7 d) har ingen cron-anropare, scan-rutten POSTar endast, pumpor/rond/
evighetsmotor 0 DELETE ⇒ rot misstänks databas-sidan (pg_cron/trigger/extern
nyckel) eller Vercel-byggets retention-version — kö till huvudagenten.
KASKAD — KVARTALSDEDUBEN SLAGEN: dagens rad bär vagklassSnapshot 2026Q3
protokoll 2 · 1 200 rader på kvartalets DAG 80 — dedube-läsningen (~120 dagars
vagscan-rader) hittar inga tidigare snapshotter (raderna borta) ⇒ snapshoten
REGENERERAS varje dygn och B8:s kalibreringsgalleri (steg 6-7) är i praktiken
"endast senaste dygnet". Gap 4 orörd (/etc/crontab rad 24 kör 06:30 lokal till
/dev/null 2>&1; 04:30Z-fönstret 0 spår i samtliga fyra exporter); gap 5 orörd
(vagvalidering-SENASTE mtime 09-10 16:33, domar 09-04 = 15 dagar, serveras
live av /api/data/vagstatistik; 0 UI-konsumenter kvar). Score 8 → 7
(B14-precedensklassen: systemets egna dokumenterade dataflöde — daglig
historik + kvartalsgalleri — faller ifrån i roten).*

## B10. Konfluensradarn`;
ersatt("## B10. Konfluensradarn", b9Block, "B10-rubrik (B9-insättning)");

// ── 3. B9 GAP-listan: nytt gap 6 ───────────────────────────────────────────
ersatt(
  "bara förnyas av agent/manuell körning med skrivåtkomst till repot).",
  `bara förnyas av agent/manuell körning med skrivåtkomst till repot); (6) **NYTT
  09-19 — HISTORIEKONTRAKTET BRUTET**: dagliga vagscan-rader (och signal/organ)
  raderas ur system_events inom ett dygn av en aktör utanför repot — dagshistoriken
  består ALDRIG, kvartalsdeduben är slagen (se återdiff-blocket ovan).`,
  "B9-gap5",
);

// ── 4. E33 rubrik: stampel + score ─────────────────────────────────────────
ersatt(
  "## E33. Supabase-persistenslagret — LEVER — 8/10 *(uppdaterad 2026-09-17)*",
  "## E33. Supabase-persistenslagret — LEVER — 7/10 *(uppdaterad 2026-09-19)*",
  "E33-rubrik",
);

// ── 5. E33 nytt återdiff-block (före E34-rubriken) ─────────────────────────
const e33Block = `*Återdiff 2026-09-19 (dokvåg s9-u2, manifest auto-s9-1789800329491):
arkivkedjan grön på ytan — 4 konsekutiva nattexporter (09-16→09-19 02:40,
obevakade), antal==totaltFranApi ×4, 0 dublett-id (id-diff 17→18 och 18→19 =
0 försvunna) — MEN TVÅ BLINDA FÄLT + EN OIDENTIFIERAD RADERARE: (1)
TYPSLÄPNING: nattexporterna bevarar EJ typerna vagscan/signal/organ (0 rader i
09-17/18/19-filerna trots fullständig dump) — tabellens rader av dessa typer
raderas samma dag (beviskedja: read-only sond TOTALT 1/2/5 rader alla från
idag + id-diff 16→17 med exakt 4 försvunna; se B9:s block) ⇒ "kedja 2 = enda
kopian" är för dem FALSK: varken tabell eller arkiv bär historiken. (2)
DUBLETTLINDHET: 09-16-filen bar antal 161 678 > totaltFranApi 161 674 = 4
odeducerade Range-skift-dubletter — v3-kontraktet dömer bara trunkering
(antal < totalt), aldrig dubletter (fyndet upplöste även "oversattning −4"-
skenet i min typjämförelse: ingen rad försvann, fyra räknades dubbelt).
RADERAREN: repot genomgånget (samtliga DELETE-anrop: organ.ts typ-scopade
30/35 d-regler, cleanup-rutt 7 d utan anropare, pumpor/rond/evighetsmotor
0 DELETE) ⇒ rot misstänks DATABAS-SIDAN (pg_cron/trigger/extern nyckel) eller
Vercel-byggets retention-version — kö till huvudagenten: dashboard-granskning
FÖRE ev. allowlist-kur (annars maskeras roten). Dessutom återmätt: ALTER V1
fortfarande på disk/HEAD (2a55da6e — gap 3 orörd) · supabase-inventory.json
27 d (generatedAt 08-23) · kärnbeståndet stabigt (166 067 rader 09-19,
oversattning/trafik/sakerhet/akm2_snapshot orörda av raderaren). Score 8 → 7:
integritetsbilden sämre än kartan visste — oidentifierad daglig raderare i
kärntabellen + fullständighetskontraktets två blinda fält.*

## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-18)*`;
ersatt(
  "## E34. Drift, backup & DR (Contabo) — LEVER — 9/10 *(uppdaterad 2026-09-18)*",
  e33Block,
  "E34-rubrik (E33-insättning)",
);

// ── 6. ÖVERSIKT: B9-raden ───────────────────────────────────────────────────
ersatt(
  "| B9 | Vågsystemet AK1TS (vagfundament, vagkon, vagscan) | Analys | LEVER | 8 | Skanning dagligen färsk (05:05Z mätt); DUBBEL cron-drivning (Vercel 05:00Z + /etc/crontab 06:30 lokal, mätt 09-16 — användar-crontab tom gav syskonet fel källa); valideringsrapport 12 d gammal; träff-% osynlig publikt |",
  "| B9 | Vågsystemet AK1TS (vagfundament, vagkon, vagscan) | Analys | LEVER | 7 | Skanning dagligen färsk (05:05Z, 09-19) MEN HISTORIEKONTRAKTET BRUTET (mätt 09-19): dagliga vagscan/signal/organ-rader raderas ur tabellen inom ett dygn av oidentifierad aktör (repo-genomgång: 0 raderare) ⇒ kvartalsdeduben slagen (2026Q3-snapshot 1 200 r regenereras DAGLIGEN på kvartalets dag 80; B8:s galleri i praktiken tomt); SENASTE-rapport domar 09-04 (15 d); träff-% osynlig publikt |",
  "ÖVERSIKT-B9",
);

// ── 7. ÖVERSIKT: E33-raden ─────────────────────────────────────────────────
ersatt(
  '| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | LEVER | 8 | "PROD-TÖMT 09-16" MOTBEVISAT (mätt 09-17): 163 039 rader levande i appens projekt (aufr) — 13:46-mätningen föll i tväprojektfällan (rkaq-dumpar saknar tabellen, kedja 6); arkiv-cron grön OBEVAKAT 02:40, 0 dublett-id; kvar: ALTER V1 på disk/HEAD (v2 endast i index-provsprotokollet), composite-index ej installerat, schema-drift, inventory 25 d; kedja 2 = enda system_events-kopian |',
  "| E33 | Supabase-persistenslagret (system_events-mönstret) | Grund | LEVER | 7 | OIDENTIFIERAD DAGLIG RADERARE i system_events (mätt 09-19: vagscan/signal/organ lever bara samma dag — id-diff bevisar radering, ej skrivfel; repo-genomgång 0 raderare, rot misstänks pg_cron/trigger/extern nyckel) + arkivkedjans TVÅ blinda fält (exporterna bevarar ej de typerna; 4 odeducerade dubletter i 09-16-filen — v3-kontraktet dömer bara trunkering); 4 nätter kadansgröna; ALTER V1 kvar; inventory 27 d; kärnbestånd 166k stabigt |",
  "ÖVERSIKT-E33",
);

// ── 8. Snittraden ──────────────────────────────────────────────────────────
ersatt(
  "Snittscore: **7,6/10** (287 poäng / 38 system; B14 −1 vid dokvåg s9-u3 09-18",
  "Snittscore: **7,5/10** (285 poäng / 38 system; B9 −1 + E33 −1 vid dokvåg s9-u2 09-19 — B9:s historiekontrakt brutet (dagliga skans-rader raderas inom ett dygn av oidentifierad aktör; kvartalsdeduben slagen) och E33:s arkivkedja typblind + dublettblind med samma raderare verksamt i kärntabellen; B14 −1 vid dokvåg s9-u3 09-18",
  "snittrad",
);

// ── 9. Ny UPPDATERING-sektion (före ÖVERSIKT-rubriken) ─────────────────────
const upd = `## UPPDATERING 2026-09-19 (dokvåg s9-u2, manifest auto-s9-1789800329491 — B9 + E33 diffade mot verkligheten; STORFYND: vagscan-historiken raderas samma dag — kvartalsdeduben slagen; D20-pivot + B9-gåva bokförda)

KOLLISIONSBOKFÖRING (disk-först-racen): mitt anspråk D20+B9 på disk 08:47:15;
syskonet u1:s D20-anspråk 08:47:18 + LEVERANS (commit 08:55) ⇒ D20 AVSTÅTT
enligt spårets duplikatregel, PIVOT till E33 (stämpel 09-17 = äldsta fria;
R2-ytorna D22/D23/E30 orörda). Syskonet u3 (anspråk 09:01:32) respekterade
mitt B9-val, valde B8+B13+C18 och lämnade B9-gåvan
auto-s9-1789800329491-s9-u3-b9-gava.md — deras pivot-mätningar korsvaliderar
mina nivåer exakt; deras två tolkningsgrenar MOTBEVISADE av mina sonder
(id-diff + read-only tabellsond, se B9-blocket); deras sektioner orörda av mig.

| System | Före → Efter | Skäl (bevis, egenmätt 06:47–09:10 lokal) |
|---|---|---|
| B9 | LEVER 8 → **LEVER 7** | Skanningen lever (05:05:21Z dagligen, 12/12, svit 57/57 EGEN, /vagfundament 200, kodstilla) MEN historiekontraktet brutet: levande tabellen bär TOTALT 1 vagscan-rad (dagens) — dagsrader raderas inom ett dygn; id-diff 09-16→09-17-export: exakt 4 rader försvann (raderna bevisligen skrivna); raderaren EJ i repot (samtliga DELETE-anrop genomgångna); KASKAD: 2026Q3-snapshot (1 200 r) regenereras DAGLIGEN på kvartalets dag 80 = deduben slagen, B8:s kalibreringsgalleri i praktiken tomt |
| E33 | LEVER 8 → **LEVER 7** | Arkivkedjan kadansgrön (4 nätter, antal==totaltFranApi ×4, 0 dublett-id) MEN två blinda fält: exporterna bevarar EJ vagscan/signal/organ (0 rader sedan 09-17 trots fullständig dump) + 4 odeducerade dubletter i 09-16-filen (v3-kontraktet dömer bara trunkering); samma oidentifierade raderare verkar i kärntabellen; ALTER V1 kvar på disk/HEAD; inventory 27 d |

KORSVALIDERING D20 (u1:s leverans, deras sektion orörd): mina mätningar
bekräftar deras bild — svit 17/17 exit 0 EGEN · glomt/recover 0 träffar i
sviten (gap 2 lever) · medlem-auth.ts 556 r exakt + kärnfiler kodstilla sedan
09-11/12 · /logga-in 200 (115 ms) + /en/logga-in + /ar/logga-in 200 (speglarna
lever) · GET /api/medlem 405 (POST-only, korrekt kontrakt) · GET
/api/medlem/progress 200 {inloggad:false} (tyst gästkontrakt).

KVD: data-only — src/ orörd = INGET bygge (deploy ägs av prod-synken);
R2 orörd; data/blogg/ orörd; syskonens ytor orörda (u1 D20 · u3 B8/B13/C18).
Kö till huvudagenten: (1) Supabase-dashboard: pg_cron/trigger/externa nycklar
— VEM raderar vagscan/signal/organ dagligen? (2) retention-allowlist-kur i
organ.ts FÖRST efter att raderaren identifierats (annars maskeras roten);
(3) arkivexporten: markera antal>totaltFranApi som dublettfynd; (4) bära
vagklass-galleriet utanför system_events (datacache/fil) tills historiken
består; (5) B8-notis: kalibreringens steg 6-7 läser ett tomt galleri.

## ÖVERSIKT — 38 system`;
ersatt("## ÖVERSIKT — 38 system", upd, "ÖVERSIKT-rubrik (UPPDATERING-insättning)");

if (text === original) {
  console.error("ABORT: ingen ändring — oväntat.");
  process.exit(1);
}
writeFileSync(FIL, text, "utf8");
console.log("OK: 9 ersättningar applicerade, EN atomär skrivning klar.");
