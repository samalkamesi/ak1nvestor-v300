#!/usr/bin/env node
// ROND 112 — bokföring: PIPELINE-KO 213(c) stängs + worklog-rad.
// (beslutsminne-appended görs av _r112-beslutsminne.mjs EFTER push, med hash.)
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const KO = `${ROT}/data/forskning/PIPELINE-KO.md`;
const WORKLOG = `${ROT}/worklog.md`;
const LOGG = `${ROT}/data/vakten/r112-bokfor.log`;

const linje = (s) => fs.appendFileSync(LOGG, s + "\n");
fs.writeFileSync(LOGG, `R112 BOKFÖRING ${new Date().toISOString()}\n`);

// ── 1. PIPELINE-KO: 213(c) stängs ────────────────────────────────────────────
const gammaltC = "; (c) dataset-aspekter-svantens @/-alias-brott (src-yta, bokfört v209-u3); (d)";
const nyttC =
  "; (c) STÄNGD rond 112: dataset-aspekter-sviten migrerad till ts-import-bryggan (s8-u2:s resolver-hook — @/-alias + ändelselösa importer under ren node) — GRÖN under ren node: 0 fel, 24 aspekter, 184 sidkontroller, exit 0 (bevis _r112-dataset-aspekter-resultat.txt) OCH GRÖN i r112-fullsvepets egen kedja (r112-logg: DETERMINISTISK GRÖN 1 s), tsx-beroendet borta; (d)";
let ko = fs.readFileSync(KO, "utf8");
const traeffarC = ko.split(gammaltC).length - 1;
if (traeffarC !== 1) {
  linje(`FEL: 213(c)-segmentet träffade ${traeffarC} gånger (väntat 1) — PIPELINE-KO orörd.`);
  process.exit(1);
}
ko = ko.replace(gammaltC, nyttC);
fs.writeFileSync(KO, ko);
linje(`PIPELINE-KO: 213(c) STÄNGD (1 träff, ersatt ${gammaltC.length}→${nyttC.length} tkn)`);

// ── 2. Worklog: rondens rad ──────────────────────────────────────────────────
const rad = `
## ROND 112 [organ:Φ] — 2026-09-20 ~08:0x lokal: VÅG 213(c) STÄNGD — dataset-aspekter-sviten GRÖN under ren node (ts-import-bryggan) + fullsvepet r112 omstartat fristående efter tyst död
FULLSVEP-OMSTART: omgång 1 (07:18–07:21 via studio-shellens bakgrundskanal) dog TYST vid 50/150 GRÖNA sviter — rot: sessionsomstarten dödade processgruppen (ingen SLUT-rad skrevs, inga processer kvar; skal-kvot-läxan bekräftad: studio-shellens bakgrundskörningar överlever ej sessionsdöd). KUR: _r112-fullsvep.mjs i append-läge (tidigare GRÖN-rader bevaras som bevis) + _r112-starta.mjs (node-kanalen spawnar wrappern detached=true ⇒ ny session — överlever sessionsdöd) — sveppet återupptog 07:47 och RAM-strypningen bevisad LIVE (loggrad "väntar-ram: 827 MB < 900 MB — 60 s": aggregatorn väntar, dör inte, medan fabriksbarnen äter minnet). V213(c) STÄNGD: dataset-aspekter-sviten (v150:s vit-test — kontrakt + juridikgrind för 8 moduler, 10 branscher) var bokförd röd sedan v209-u3 (ändelselösa src-importer: "Cannot find module src/lib/ordlista imported from dataset-medianer.ts" under ren node; sviten krävde npx tsx); fabriksbarnet s8-u2 hade redan levererat kuren som gåva (verktyg/ts-import.mjs + _ts-resolve-hooks.mjs — resolver-hook löser @/-alias + ändelselösa relativa importer under nodes type stripping, rökpovad mot signal-bus/klientkontext/nyhets-motor); migreringen: branschNamn-importen + per-modul-discoveryn → importeraTs(), pathToFileURL-bort, körkontraktet "node … (ts-import-bryggan)". BEVIS: FÖRE = ERR_MODULE_NOT_FOUND OFÅNGAT (fångad i _r112-dataset-aspekter-resultat.txt) ⇒ EFTER = GRÖNT 0 fel · 24 aspekter · 184 sidkontroller · exit 0 under REN NODE, OCH det löpande fullsvepet fångade den migrerade sviten i EGNA kedjan (r112-logg rad 137: "[DETERMINISTISK] testa-dataset-aspekter.mjs … GRÖN (1 s)") — aggregatorn själv mätte kuren; sviten deterministisk utan tsx-återfall. TRÄDSTÄD: _f2-bokf-commit-resultat.txt (r111:s bokföringskvitto, spärrade ytan) + r112-bevisfilerna (_r112-fullsvep-status.txt snapshot 143 GRÖNA, _r112-dataset-aspekter-resultat.txt) committade. SKULDSOND (statusmatning §9b): scanner_enobufs ×5 = REDAN STÄNGD (s8-u3 2026-09-16 — kraschbevis-arkiveringen lever i cron-skriptet; statusmatningens skuldlista inaktuell där); granskningskön fabrikägd (auto-s1 levererar: tele2-q3, kryptoaktier B22, utbildningsaktier B23); AI-Mentorn-generateText = kostnadsbeslut (väntar kund); gap-registret 36/36 STÄNGT (nästa evolution föds ur ny forskning). FULLSVEPET löper (DEV-FÖNSTER→PROD-NÄRA→TUNG återstår) — slutbokningen (r110-steg: dagsaktuellt helsvepsbevis ~150 sviter) görs när SLUT-raden landar, nästa iteration.
`;
fs.appendFileSync(WORKLOG, rad);
linje(`Worklog: ROND 112-rad appenderad (${rad.length} tkn)`);
linje("BOKFÖRING OK — klara för commit.");
console.log("bokföring klar");
