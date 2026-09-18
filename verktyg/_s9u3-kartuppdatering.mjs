// _s9u3-kartuppdatering.mjs — dokvåg (manifest auto-s9-1789731901131): B10+B11+B14
// Uppdaterar SYSTEMKARTAN.md (UPPDATERING-sektion + tre sektioner + översiktsrader
// + snittraden) och appendar worklog-sektion. Clobber-kur: mtime-grind före skrivning,
// en-träff-verifiering per ersättning, EN skrivning per fil, omedelbar commit.
import { readFileSync, writeFileSync, statSync, appendFileSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";

const mtimeFore = statSync(KARTA).mtimeMs;
let text = readFileSync(KARTA, "utf8");

const ersatt = (namn, gammal, ny) => {
  const forst = text.indexOf(gammal);
  if (forst === -1) throw new Error(`SAKNAS: ${namn}`);
  if (text.indexOf(gammal, forst + 1) !== -1) throw new Error(`FLERA TRÄFFAR: ${namn}`);
  text = text.slice(0, forst) + ny + text.slice(forst + gammal.length);
  console.log(`OK: ${namn}`);
};

// ── R1: ny UPPDATERING-sektion före ÖVERSIKT ────────────────────────────────
const uppdatering = `## UPPDATERING 2026-09-18 (dokvåg s9-u3, manifest auto-s9-1789731901131 — B10 + B11 + B14 återdiffade; DRIFTFYND: Contabo-nyhetscronen 404-död sedan skapandet + tyst tom nyhetslista live)

Objektval: B-radens tre ENDAST kvarvarande system utan andra varvet — B7+B8
(09-17 omg 11), B9 (09-17), B12 (09-18 u2), B13 (09-17 omg 13) var redan
återdiffade; B10+B11 passades senast 09-16 omgång 5, B14 09-16 (u2 2/3).
Anspråk FÖRE mätstart (data/vakten/auto-s9-1789731901131-u3-ansprak.md);
syskonens val respekterade och deras sektioner orörda (u1 = E29, u2 = A2+C17
— u2:s sektion noterade mitt val disk-först). Varje rad MÄTT egenhändigt
2026-09-18 ~13:46–14:05 lokal: live-sonder loopback (3 sidor + 4 API:er),
EGEN motorvalidering med sann exitkod, git/ls/grep/node-räkningar,
pm2-logspaning, /etc/crontab-läsning.

| Mått | Kartan (09-16-passningarna) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| /api/konfluens (B10) | färsk tidsstämpel 09-16T04:44:21Z | **genererad 2026-09-18T11:48:25Z** (egen sond): 10 rader · 10/10 med ≥3 datakällor · fem-källors-fältet komplett (värdegolv/kvalitet/fundamentalVagstart/prisVaglage/divergens) · 2 rader klassade |
| /api/netnet (B11) | färsk tidsstämpel 09-16T04:43:31Z, VOLV-B 330,2 | **genererad 2026-09-18T11:48:35Z**: 25 rader (= universumet fast 25 fortfarande, praktiskt bevis i svaret) · VOLV-B.ST kurs 335,9 — live-flödet lever; sonden refreshade 25 netnet-cachefiler i data/cache (13:48 lokal) |
| Motorvalidering | 107/0/0 (6,9 s, tredje gröna) | **107 PASS / 0 FAIL / 0 SKIP (6,4 s, exit 0 — FJÄRDE dokumenterat gröna; tmp_motor_koll.ts städad av verktyget självt)** |
| Sidstatus | /konfluens /netnet /nyheter 200 | **200 ×3 igen** (egna sonder) |
| Filstabilitet B10/B11/B14 | stabil sedan 09-11 | **orörd sedan 09-16-passningarna** (git-bevis; radtal 493/292/844 exakt kvar) |
| B14 Contabo-cron | "crontab-bevisad men ej KÖRbevisad" | **KÖRBEVIS NEGATIVT — 404 LIVE**: /etc/crontab rad 25 curlar /api/cron/nyheter som svarar 404 (egen sond med crontabens exakta Host-header); rutten har ALDRIG funnits i git-historien (git log --all över sökvägen = tom) medan grannraderna vagscan + portfolj-uppfoljning pekar på rutter SOM FINNS — mönstret rätt, sökvägen fel; scan-rutten heter /api/nyheter/scan sedan 02f7495b (2026-09-03) |
| B14 pm2-logg | "ingen logg (curl >/dev/null)" | **0 'nyheter'-rader i ak1a-out.log(+.1) senaste 2 dygnen** — konsistent med 404 |
| B14 nyhetsflöde | gap 2-varning: "kan tyst bli tom nyhetslista" | **REALISERAT LIVE**: /api/nyheter → ok:true · nyheter:[] · franCache:true · antal:0 (13:50 lokal) och TOMMA svaret disk-cachats (data/cache/analys-nyh_c8f24f66.json, 93 B, 0 poster, cachad 11:50:06Z — 30 min TTL) + routens 5-min-minnescache; SAMTIDIGT cacheades en RIK hämtning 5 minuter tidigare för en annan konfignyckel (analys-nyh_e406a84d.json: 40 nyheter från SVT Ekonomi/Dagens industri/Privata Affärer/Yahoo, senaste publikation 13:36 lokal — organisk trafik, före mina sonder) ⇒ externa flödet lever intermittens men tomma svar cachas tyst; /nyheter-HTML (71 kB, egen sond) bär 0 nyhetstexter = kunden ser viloläget |
| B14 CRON_SECRET | ej satt | **fortfarande 0 namnträffar** i .env + .env.local (namnnivå — värden ALDRIG inlästa) |
| B14 vercel.json | /api/nyheter/scan 08:00 UTC | **raden kvar oförändrad** — men detta är nu ENDRIVNING på den passiva backup-plattformen |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| B10 | LEVER 7 → **LEVER 7** | Allt grönt igen (API färskt, 107/0/0 fjärde gången, filer orörda) och inga gap stängda; gap 3 fördjupad med namnkollisionsfyndet (se sektionen) — E33/B14-precedensen |
| B11 | LEVER 6 → **LEVER 6** | Allt grönt oförändrat (25 rader, VOLV-B live, determinismgrön); svit-gapet och 25-listan lever — ingen poängrörelse |
| B14 | LEVER 6 → **LEVER 5** | Prod-drivningen av skannern död (404 sedan raden skrevs — rutten fanns aldrig) + kundsynlig tyst-tom nyhetslista live = dataflödesförsämring av B7-precedensklassen (09-16:s motsvarande nedgång för berika-pipelinen); kunskap tillförd men kapabiliteten sämre än kartan trodde |

Snittscore **7,6/10 OFÖRÄNDRAD i avrundning — 287 poäng / 38 system**
(B14 −1; u2:s A3 +1 samma dag före).

Kö till huvudagenten: (1) **/etc/crontab rad 25 ompekas till
/api/nyheter/scan** (root-ägd yta — dokvågen läser endast; grannmönstret
vagscan/portfolj-uppfoljning bevisar rätt form) ELLER medvetet beslut att
Vercel äger nyhetsscanen (då bör raden tas bort — död kod i drift); (2)
src-spår: tomma flödessvar bör ej disk-cachas 30 min (eller bli larmklass i
vakten) — viloläget är kundsynligt på /nyheter; (3) OrganEvent-belägg:
Supabase-fråga efter organ/nyheter-events avgör om Vercel-scans överhuvudtaget
kör på den passiva plattformen; (4) B10/B13-terminologin nu dokumenterad —
ev. namnbyte av portfolj-forsknings lager3-fält är frivilligt.

KVD: endast data/forskning/SYSTEMKARTAN.md + worklog.md + anspråksfil + detta
sondskript — INGET bygge; src/ orörd (tsc-ej-aktuellt, commit-grinden bär
baslinjen); R2 orörd; data/blogg/ orörd; syskonens yter orörda.

`;
ersatt("R1 UPPDATERING-infogning", "## ÖVERSIKT — 38 system", uppdatering + "## ÖVERSIKT — 38 system");

// ── R2-R4: sektionshuvuden ──────────────────────────────────────────────────
ersatt("R2 B10-huvud", "## B10. Konfluensradarn — LEVER — 7/10 *(uppdaterad 2026-09-16)*",
  "## B10. Konfluensradarn — LEVER — 7/10 *(uppdaterad 2026-09-18)*");
ersatt("R3 B11-huvud", "## B11. Net-net-skannern — LEVER — 6/10 *(uppdaterad 2026-09-16)*",
  "## B11. Net-net-skannern — LEVER — 6/10 *(uppdaterad 2026-09-18)*");
ersatt("R4 B14-huvud", "## B14. Nyheter + marknadsdata — LEVER — 6/10 *(uppdaterad 2026-09-16)*",
  "## B14. Nyheter + marknadsdata — LEVER — 5/10 *(uppdaterad 2026-09-18)*");

// ── R5: B10 ny not + gap 3-fördjupning ──────────────────────────────────────
ersatt("R5 B10-not", "- **Vad:** Väger värde mot vågor",
  `*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet — allt MÄTT egenhändigt: /konfluens 200 + /api/konfluens LEVANDE med
färsk tidsstämpel (genererad 2026-09-18T11:48:25Z, egen sond): 10 rader,
10/10 med ≥3 datakällor, fem-källors-fältet komplett, 2 rader klassade;
motorvalideringen 107/0/0 (6,4 s, exit 0 — fjärde dokumenterat gröna);
filerna orörda sedan 09-11 (git-bevis, motorn 493 r oförändrad). Gap 1 lever
(ingen testa-konfluens* finns). Gap 3 FÖRDJUPAD: 0 import mellan
konfluens-{motor,tabell} och portfolj-forskning (återmätt) MEN
portfolj-forskning bär ett EGET "konfluens"-begrepp — lager3-fältet
"3 av 5 teorier pekar uppåt" (typer.ts:173, akm2-koppling.ts:115/136) är
TEORIKONSENSUS per horisont, ett annat mått än radarns DATAKÄLLKONSENSUS;
enda textuella bryggan är stilkommentaren vag-stil.tsx:196 ("bandmönster
från konfluensradarn"). Score 7 orörd (E33/B14-precedensen — inga gap
stängda).*

- **Vad:** Väger värde mot vågor`);
ersatt("R6 B10-gap3",
  "(3) koppling till portföljforskningens korstabell (B13) — PRECISERAD\n  2026-09-16: konceptuell, ej kodad (0 direkta import, mätt).",
  `(3) koppling till portföljforskningens korstabell (B13) — PRECISERAD
  2026-09-16: konceptuell, ej kodad (0 direkta import, mätt). FÖRDJUPAD
  2026-09-18: namnkollision — portfolj-forsknings eget "konfluens"-begrepp
  (teorikonsensus per horisont) är ett ANNAT mått än radarns
  datakällkonsensus; enda bron är stilkommentaren vag-stil.tsx:196.`);

// ── R7: B11 ny not ──────────────────────────────────────────────────────────
ersatt("R7 B11-not", "- **Vad:** Skär 25 svenska/nordiska bolag",
  `*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet — /netnet 200 + /api/netnet LEVANDE färsk (genererad
2026-09-18T11:48:35Z, egen sond): 25 rader = universumet fast 25 fortfarande
(API-svaret är det praktiska beviset), VOLV-B.ST kurs 335,9 (live-flödet
lever; 330,2 vid 09-16-passningen); sonden refreshade 25 netnet-cachefiler i
data/cache (13:48 lokal — lasEllerHamta-leddet lever). Motorvalideringen
107/0/0 (6,4 s, exit 0) — determinismgrenens underlag oförändrat grönt.
Filerna orörda sedan 09-11 (git-bevis; netnet-motorn 292 r oförändrad mot
kartan). Gaps oförändrade: egen svit saknas fortfarande (ingen
testa-netnet*), 25-listan fast. Score 6 orörd.*

- **Vad:** Skär 25 svenska/nordiska bolag`);

// ── R8-R10: B14 ny not + Vad-rad + GAP-block ────────────────────────────────
ersatt("R8 B14-not", "- **Vad:** Nyhetsmotor (aktienyheter med källhänvisning), nyhetskanaler,",
  `*Uppdatering 2026-09-18 (dokvåg s9-u3 manifest auto-s9-1789731901131): andra
varvet med TVÅ DRIFTFYND, allt EGENMÄTT. (1) KÖRBEVISET NEGATIVT —
/etc/crontab rad 25 curlar /api/cron/nyheter som svarar 404 LIVE (egen sond
med crontabens exakta Host-header) och rutten har ALDRIG funnits i
git-historien (git log --all över sökvägen = tom; grannraderna vagscan +
portfolj-uppfoljning pekar på rutter som FINNS — mönstret rätt, sökvägen
fel; scan-rutten heter /api/nyheter/scan sedan 02f7495b 2026-09-03) ⇒
Contabo-leden av "dubbel drivning" har varit död sedan raden skrevs;
pm2-utloggen bär 0 "nyheter"-rader senaste 2 dygnen (konsistent). Enda
kvarvarande drivning = Vercel-cron 08:00 UTC (vercel.json-raden kvar) på den
PASSIVA backup-plattformen — scan-körning kan ej beläggas lokalt (OrganEvent
skriver till Supabase). (2) GAP 2 REALISERAT LIVE — /api/nyheter svarade
ok:true, nyheter:[], franCache:true, antal:0 (egen sond 13:50 lokal) och det
TOMMA resultatet disk-cachats (data/cache/analys-nyh_c8f24f66.json, 93 B,
0 poster, cachad 11:50:06Z — 30 min TTL + routens 5-min-minnescache) medan
en RIK hämtning cacheats 5 minuter tidigare för en annan konfignyckel
(analys-nyh_e406a84d.json: 40 nyheter från SVT Ekonomi/Dagens industri/
Privata Affärer/Yahoo, senaste publikation 13:36 lokal — organisk trafik
före mina sonder) ⇒ externa flödet lever intermittens men tomma svar cachas
TYST; /nyheter-renderingen (71 kB HTML, egen sond) bär 0 nyhetstexter =
kunden ser viloläget. CRON_SECRET fortfarande 0 namnträffar (.env +
.env.local, namnnivå — värden ALDRIG inlästa). Nyhets-motorn 844 r orörd
sedan 09-16 (git-bevis). Score 6 → 5: prod-drivningen av skannern död +
kundsynlig tyst-tom lista = dataflödesförsämring av B7-precedensklassen.*

- **Vad:** Nyhetsmotor (aktienyheter med källhänvisning), nyhetskanaler,`);
ersatt("R9 B14-Vad-led",
  "daglig scan-cron i dubbel drivning (Contabo /etc/crontab 08:00 lokal + Vercel 08:00 UTC, mätt 2026-09-16)",
  "daglig scan-cron — \"dubbel drivning\" MOTBEVISAD 09-18: Contabo-leden 404-död sedan raden skrevs (se GAP 4); enda drivning Vercel 08:00 UTC");
ersatt("R10 B14-GAP-block",
  `- **GAP:** (1) ingen testsvit alls; (2) rate-kvoter/fel från externa API:er
  bevakas ej (kan tyst bli tom nyhetslista); (3) nyheternas juridikgrind
  (rubrikformuleringar) körs via kontrolleraText endast vid publicering —
  ej på leverantörens rubriker; (4) NY 09-16: Contabo-cronens exekvering är
  crontab-bevisad men ej KÖRbevisad (curl till /dev/null, ingen logg —
  pm2-spaning vid 06:00 UTC ger svaret) och CRON_SECRET är fortfarande
  osatt (E29-gap 1 gäller även här).`,
  `- **GAP:** (1) ingen testsvit alls; (2) rate-kvoter/fel från externa API:er
  bevakas ej — REALISERAT LIVE 09-18: ok:true + 0 nyheter serveras och det
  tomma svaret disk-cachas 30 min (93 B-post mätt) trots att en rik hämtning
  (40 nyheter) cacheats minuterna tidigare för annan konfig; viloläget är
  kundsynligt på /nyheter; (3) nyheternas juridikgrind (rubrikformuleringar)
  körs via kontrolleraText endast vid publicering — ej på leverantörens
  rubriker; (4) BESVARAD 09-18 — NEGATIVT körbevis: crontab-målet
  /api/cron/nyheter svarar 404 live och rutten har ALDRIG funnits i
  git-historien (scan ligger på /api/nyheter/scan sedan 02f7495b 09-03) ⇒
  Contabo-leden död sedan raden skrevs; enda drivning = Vercel-cron på den
  passiva backup-plattformen (ej lokalt beläggbar — OrganEvent → Supabase).
  CRON_SECRET fortfarande osatt (E29-gap 1 gäller även här).`);

// ── R11-R13: översiktsrader ─────────────────────────────────────────────────
ersatt("R11 B10-rad",
  "| B10 | Konfluensradarn | Analys | LEVER | 7 | Fem-källors-logiken LEVER live (API-sond färsk 09-16, datakällor per rad); motorvalidering 107/0/0 egen körning; kvar: 0 egen svit, historik/utfall lagras ej (mätt), korstabell-kopplingen konceptuell ej kodad |",
  "| B10 | Konfluensradarn | Analys | LEVER | 7 | Fem-källors-logiken LEVER live (API-sond färsk 09-18: 10 rader, 10/10 ≥3 källor; motorvalidering 107/0/0 fjärde gröna); kvar: 0 egen svit, historik/utfall lagras ej; kopplingen till B13 fördjupad 09-18: 0 import MEN namnkollision — portfolj-forsknings eget \"konfluens\"-begrepp (teorikonsensus per horisont) är ett annat mått än radarns datakällkonsensus |");
ersatt("R12 B11-rad",
  "| B11 | Net-net-skannern | Analys | LEVER | 6 | Determinism-grönt stabilt (107/0/0 egen körning 09-16 + /api/netnet färsk live-sond); universum fast 25 (mätt); egen testsvit saknas fortfarande |",
  "| B11 | Net-net-skannern | Analys | LEVER | 6 | Determinism-grönt stabilt (107/0/0 egen körning 09-18 + /api/netnet färsk 09-18: 25 rader, VOLV-B 335,9 — live-flödet lever); universum fast 25; egen testsvit saknas fortfarande |");
ersatt("R13 B14-rad",
  "| B14 | Nyheter + marknadsdata | Analys | LEVER | 6 | 0 sviter (mätt 09-16); DUBBEL cron-drivning (Contabo 08:00 lokal + Vercel 08:00 UTC); CRON_SECRET ej satt; fallback-vägar otestade |",
  "| B14 | Nyheter + marknadsdata | Analys | LEVER | 5 | 0 sviter; \"dubbel drivning\" MOTBEVISAD 09-18: Contabo-cronens mål /api/cron/nyheter = 404 (rutten fanns aldrig i git-historien — scan heter /api/nyheter/scan) ⇒ enda drivning Vercel-cron på passiv backup; gap 2 REALISERAT live: tyst tom nyhetslista (ok:true + 0 nyheter, tomt svar disk-cachat 30 min) medan rik hämtning (40 nyheter) cacheats minuterna före; CRON_SECRET ej satt |");

// ── R14: snittraden ─────────────────────────────────────────────────────────
ersatt("R14 snitt",
  "Snittscore: **7,6/10** (288 poäng / 38 system; A3 +1 vid dokvåg s9-u2 09-18",
  "Snittscore: **7,6/10** (287 poäng / 38 system; B14 −1 vid dokvåg s9-u3 09-18 — Contabo-cronens mål 404 (rutten fanns aldrig) + tyst tom nyhetslista live; A3 +1 vid dokvåg s9-u2 09-18");

// ── Clobber-grind + skrivning ───────────────────────────────────────────────
const mtimeNu = statSync(KARTA).mtimeMs;
if (mtimeNu !== mtimeFore) throw new Error("ABORT: karta ändrad under fönstret (syskon?)");
writeFileSync(KARTA, text, "utf8");
console.log("KARTA SKRIVEN: " + text.length + " tecken");

// ── Worklog-append ──────────────────────────────────────────────────────────
appendFileSync(WORKLOG, `
## SPÅR 9 s9-u3 (manifest auto-s9-1789731901131, 3/3) — 2026-09-18 ~14:1x lokal: SYSTEMKARTAN dokvåg — B10 + B11 + B14 återdiffade (andra varvet; B-radens sista tre) + DRIFTFYND: Contabo-nyhetscronen 404-död sedan skapandet + tyst tom nyhetslista live [fabrik]

Leverans: B-radens tre ENDAST kvarvarande aldrig-återdiffade system — anspråk disk-först FÖRE mätning (data/vakten/auto-s9-1789731901131-u3-ansprak.md; syskonen u1=E29 u2=A2+C17 respekterade, deras sektioner orörda). Allt EGENMÄTT 13:46–14:05 lokal. B14 TVÅ RÖTFYND: (1) /etc/crontab rad 25 curlar /api/cron/nyheter som svarar 404 LIVE (sond med crontabens Host-header) och rutten har ALDRIG funnits i git-historien (git log --all tom) medan grannraderna vagscan/portfolj-uppfoljning pekar på existerande rutter — scan heter /api/nyheter/scan sedan 02f7495b 09-03 ⇒ "dubbel drivning" = i praktiken endrivning på passiv Vercel-backup; pm2-utloggen 0 nyheter-rader/2 dygn (konsistent). (2) Gap 2 REALISERAT LIVE: /api/nyheter ok:true + nyheter:[] + franCache (13:50) medan TOMT svar disk-cachats 30 min (data/cache/analys-nyh_c8f24f66.json 93 B cachad 11:50:06Z) och en RIK hämtning (40 nyheter SVT/Di/PA/Yahoo, senaste 13:36 lokal — organisk trafik före mina sonder) cacheats 5 min tidigare för annan konfignyckel; /nyheter-HTML 71 kB bär 0 nyhetstexter = kundsynligt viloläge; CRON_SECRET fortfarande 0 namnträffar (värden olästa). B10/B11 ALLT GRÖNT igen: /api/konfluens 11:48:25Z (10 rader, 10/10 ≥3 källor, fem-källorsfältet komplett, 2 klassade) + /api/netnet 11:48:35Z (25 rader, VOLV-B 335,9; 25 netnet-cachefiler refreshade av sonden) + motorvalidering 107/0/0 (6,4 s, exit 0 — fjärde gröna, tmp-städad) + filerna orörda sedan 09-16 (493/292/844 r exakt). B10 gap 3 fördjupad: 0 import kvar MEN namnkollision — portfolj-forsknings eget "konfluens"-begrepp (lager3 teorikonsensus, typer.ts:173 + akm2-koppling.ts:115/136) är ett annat mått än radarns datakällkonsensus; enda bron vag-stil.tsx:196. Poäng: B14 6→5 (B7-precedensklassen — prod-dataflödet faller ifrån), B10/B11 orörda; snitt 7,6 / 287 / 38. Kö: crontab-ompekning till /api/nyheter/scan (huvudagenten — root-yta), tom-svars-cachekur (src-spår), OrganEvent-belägg via Supabase. Endast SYSTEMKARTAN + worklog + anspråk + sondskript — INGET bygge; src/ orörd; R2 orörd; data/blogg/ orörd. [fabrik]
`, "utf8");
console.log("WORKLOG APPENDAD");
