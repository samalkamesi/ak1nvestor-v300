#!/usr/bin/env node
/**
 * _s8u2-feljakt-triage.mjs — genererar bedömningsfil för feljakt-ledgern
 * (manifest auto-s8-1789707900149, spår 8, protokoll o65).
 *
 * Infriar o25 §5:s bokning: "storm-klassificering transient-design med
 * per-salv-bevis". Läser fyndloggen (append-only, skrivs ALDRIG) + stormar-
 * underlaget (kontextrader per salv) och klassar varje ÖPPET fynd enligt
 * dokumenterade rotorsaksprotokoll. Rad utan matchande regel ⇒ scriptet
 * VÄGRAR (exit 1) — okända fynd grävs manuellt, massmarkering förbjuden.
 *
 * Utdata: JSONL till stdout (spara till fil → valida med
 * `node verktyg/feljakt-stormar.mjs --torr --bekrafta=<fil>`).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKT = path.join(ROT, "data", "vakten");
const DOMDAV = "s8-u2 (fabrik, manifest auto-s8-1789707900149)";
const P = "OPTIMERING/o65-feljakt-stormtriage-s8.md";

function lasJsonl(fil) {
  return fs.readFileSync(fil, "utf8").trim().split("\n").filter(Boolean)
    .map((r) => JSON.parse(r));
}
const nyckel = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;

const fynd = lasJsonl(path.join(VAKT, "feljakt-fynd.jsonl"));
const ledger = lasJsonl(path.join(VAKT, "feljakt-bedomningar.jsonl"));
const bedomda = new Set(ledger.map(nyckel));
const oppna = fynd.filter((f) => !bedomda.has(nyckel(f)));

// per-salv kontextrader ur stormar-underlaget (maskinellt extraherade bevis)
const underlag = JSON.parse(fs.readFileSync(path.join(VAKT, "feljakt-stormar-SENASTE.json"), "utf8"));
const kontextPerTs = new Map();
for (const s of underlag.salvor) {
  const k = {};
  const krasch = (s.kontext.kraschvakt || []).find((r) => /KRASCHLOOP|PM2-RESTART RÄCKTE/.test(r));
  const deploy = (s.kontext["prod-synk"] || []).find((r) => /DEPLOYAD|NY KOD|VÄNTAR-RAM|OOM-dödat|MISSLYCKADES/.test(r));
  const hjarta = (s.kontext.hjartslag || []).find((r) => /WEB-VAKT|FEL:/.test(r));
  if (krasch) k.krasch = krasch.slice(0, 110);
  if (deploy) k.deploy = deploy.slice(0, 110);
  if (hjarta) k.hjarta = hjarta.slice(0, 110);
  for (const r of s.fynd) kontextPerTs.set(r.ts, k);
}

const kx = (f) => kontextPerTs.get(f.ts) || {};
const radBevis = (f) => (f.bevis || "").replace(/\s+/g, " ").slice(0, 90);

// ── rotorsaketexter (klassnivå) + källprotokoll per dom ─────────────────────
const ROT_MELTDOWN = "2026-09-15:s dokumenterade meltdown: den dåvarande kraschvakten triggade RÄDDNINGSBYGG/omstoppar på enstaka osvar-fläckar (o24:s 4 rotorsaker: triggvillkoret ignorerade sin egen design, ingen deploylås-medvetenhet, state sparades först vid KLAR, fast kooldown) — appen hann bli errored/stopping mellan räddningarna, förstärkt av RAM-svält i 12-agent-stormen. KURER: kraschvakten omskriven (o24, svit 19/19) + agentfabrikens max-3/RAM-vakt-arkitektur (v146, AGENTS.md) + feljägarens omtest (rond 50) — klassen kommer inte tillbaka i denna form";
const ROT_DESIGNDEPLOY = "designat deployfönster: prodbygget (npm ci + build + pm2-restart under /tmp/ak1a-deploy.lock) håller appen väntat nere/omstartande — feljägarens EGEN klassning 'MEDEL väntat fönster' (rond 44-kuren) är korrekt och protokollbevisad";
const ROT_RAM_MEDEL = "informativ RAM-tröskel (MemAvailable < 800 MB) under designat belastningsfönster: bygg + fabriksomgång på den gemensamma 8 GB-servern; prod-synkens VÄNTAR-RAM-grind (2200 MB) och fabrikens RAM-vakt (1500 MB, v146) håller minnet under kontroll — MEDEL-raderna är vakten som arbetar, ej haveri";
const ROT_SVANS = "GAMLA F5-skannern (före o11-kuren): tail-återskanning utan positionsminne återlevererade samma felrader var 15:e minut (o11 brist 1) och bevisfältet visade svansens SLUT istället för träffraden (o11 brist 2 — därför bär flera rader 'progress … — tyst'-rader som aldrig matchade); underliggande äkta rader = 09-15-meltdowns omstarter + STATUS-FEL 429 (ratebegränsning i 12-agent-stormen, kurerad av v146). KUR: positionsminne + exakt-en-gång-skanning + versal markör (o11) — klassen kurad i roten";
const ROT_O40 = "prod-synkens pull av agentklonen dog i MERGE-KONFLIKT (append-only-ledgerns worklog kolliderar i filslut vid varje vanlig merge; klonen satt i övergiven merge) — gamla feltexten 'smutsigt träd?' var en felaktig gissning. KUR: .gitattributes merge=union för worklog.md + klonen läkt med unionsförening live-bevisad (o40, M3 8c6cd4ca noll konfliktmarkörer) — merge-kollisionklassen löses nu automatiskt";
const ROT_O43 = "o40-kuren recidiverade: rond-agenter committar lokalt utan omedelbar push (R3) ⇒ divergens ⇒ merge igen. KUR: prod-synkens arbetsytasynk-försvar (o43, svit 34/34): union-lösning för worklog-klassen + VÄGRAN vid främmande/spårade ändringar + korrekt felorsakstext — synken hanterar klassen nu istället för att misslyckas; R3-disciplinen (push direkt) förblir bokad hos huvudagenten (o40/o43 §6)";
const ROT_O43_SKYDD = "o43-försvarets DESIGNADE vägran: agentarbetsytan bar 1 ocommittad spårad rad och prod-synken vägrade korrekt (skyddar ytan, väntar på commit) i stället för att skriva över — exakt kontraktet från o43. Synken läkte när raden committades (AGENTARBETSYTA synkad 03:20 09-18); R3-disciplinen förblir bokad hos huvudagenten (o40/o43 §6)";
const ROT_PATCHKO = "patch-köns dokumenterade kedja (o50 + o60): next 16.3.2→16.3.5 (RCE GHSA-p293-qw3h-jr36 + GHSA-2xp9-vwfh-vxw4) — bygg på ARBETSLOCK misslyckades 11:29, lock-commit-raderna var spurious nothing-to-commit (index-kollisionen 957272f8 tog package-filen först), 502-återarmningen = 502-klassens manifestkontrakt (o50 vaccin 1). SLUTLEVERANS bevisad (o60): installation ×3 OK, lock committad, deploy på committad lock 00:10 09-18, node_modules 16.3.5, prod 200, kön tom — idempotensgrind-bokningen (nothing-to-commit = ok) ligger hos prod-synkägaren";
const ROT_KRASCH_NY = "NYA kraschvaktens (o24) trappstegs-räddning på ÄKTA häng: app svarade inte 2 gånger ⇒ PM2-RESTART först (17:34:49, 'bygge ej motiverat ännu') ⇒ räddningsbygg först när restarten inte räckte (17:36) ⇒ KLAR 17:41 med kooldown — exakt den designade eskaleringen; underliggande häng = minnespressfönster (bygg OOM-dödat 17:30, deploy KLAR 17:43, prod 200)";
const ROT_OMSTART_0917 = "omstarts-/deployfönster: hjärtats WEB-VAKT såg appen osvarar i pm2-omstarten och loggade 'FEL: TypeError: fetch failed' — prod-synken DEPLOYAD samma minut (se kontextrad) och appen svarar igen; övergående och designat (deployfönstrets natur, rond 44-klassen)";
const ROT_OMSTART_0916 = "09-16:s stormnatts-omstarter (RAM-svält 03:58: 134/109/125 MB + bygg OOM-dödat 04:23): hjärtat omstartade appen i omstartsfönstren. Rotkurad av v146-arkitekturen (fabrik max 3 + RAM-vakt) och o24 — nattens klass kommer inte tillbaka";
const ROT_ROND50 = "rond 50:s dokumenterade fall: /session-timeout 3 min efter pm2-omstart under RAM-svält 503 MB — självläkt inom minuter; DETTA fynd var utlösaren till feljägarens omtest-kur (20 s + en omtest) som klassar övergående nätverksfel MEDEL 'självläkt' i stället för HÖG";
const ROT_429 = "STATUS-FEL 429 = modell-API:ts ratebegränsning under 12-agent-stormens topp (09-15) — parallellismstaket v146 (max 3 direkta + fabrikens omgångar om 3 med RAM-vakt) kurade belastningsroten";

const regler = [
  // ── F1 ──
  {
    namn: "F1 tsc-under-deploy",
    match: (f) => (f["spår"] ?? f.spar) === "F1-kod",
    dom: "rotkurad",
    rotorsaka: "tsc mättes under PÅGÅENDE deploy-npm-ci: transitiva @types (d3-array-familjen) försvann minutvis när node_modules revs ⇒ falska TS2688 — grönt vid ommätning efter byggslut samma kväll. KUR: r39-vaccinet i feljagaren.mjs (mät ALDRIG tsc under deploylåset) + TS2688/2307-omtest — klassen mekaniskt stängd",
    protokoll: P + " + feljagaren.mjs r39-vaccin (r 119–124) + OPTIMERING/o24-kraschvakt-feltriggar-s8.md §5",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).deploy || "prod-synk NY KOD 20:27:09 + DEPLOYAD 20:32:05 (bygg igång när mätningen skedde)"}`,
  },
  // ── deploybygg-MEDEL (rond 44) ──
  {
    namn: "deploybygg-MEDEL",
    match: (f) => /deploybygg pågår/.test(f.fynd),
    dom: "transient-design",
    rotorsaka: ROT_DESIGNDEPLOY,
    protokoll: P + " + feljagaren.mjs deployfönster-hantering (rond 44, dokumenterad i verktygets rubrik)",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).deploy || "deploylåset hölls (fyndradens egen klassning)"}`,
  },
  // ── 09-15-meltdown (F2/F3/F6 09-15) ──
  {
    namn: "meltdown-0915",
    match: (f) => f.ts.startsWith("2026-09-15") && /^(F2-process|F3-api)$/.test(f["spår"] ?? f.spar) && /(errored|stopping|nätverksfel)/.test(f.fynd),
    dom: "rotkurad",
    rotorsaka: ROT_MELTDOWN,
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md + AGENTS.md v146",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).krasch || ""} ${kx(f).hjarta || ""}`.trim(),
  },
  {
    namn: "meltdown-0915-prod",
    match: (f) => f.ts.startsWith("2026-09-15") && (f["spår"] ?? f.spar) === "F6-drift" && /prod osvarar/.test(f.fynd),
    dom: "rotkurad",
    rotorsaka: ROT_MELTDOWN,
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md + AGENTS.md v146",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).krasch || ""} ${kx(f).hjarta || ""}`.trim(),
  },
  // ── 09-16 04:27-stormen (OOM-natten) ──
  {
    namn: "oom-natt-0427",
    match: (f) => f.ts.startsWith("2026-09-16T04:2") && /^(F3-api|F6-drift)$/.test(f["spår"] ?? f.spar),
    dom: "rotkurad",
    rotorsaka: "09-16:s stormnatt: prodbygget OOM-dödades 04:23 (Killed/heap, dokumenterad infra-händelse i prod-synk.log) medan RAM låg på 134–166 MB (03:58-fynden) och kraschvakten (dåvarande versionen) triggade räddningsbygg på hängen 04:24 — API:et osvarade i fönstret till deploy KLAR 04:30 (prod 200). Rotkurad av v146 (fabrik max 3 + RAM-vakt) + o24 (kraschvakt omskriven) — stormnattens orsakskedja kan inte återkomma i samma form",
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md §5 + AGENTS.md v146",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).krasch || "kraschvakt 04:24:21 KRASCHLOOP-MISSTANKE ⇒ RÄDDNINGSBYGG"} ${kx(f).deploy || "prod-synk 04:23:15 bygg OOM-dödat + 04:30:30 DEPLOYAD prod 200"}`,
  },
  // ── F2 stopped 09-16 08:17 ──
  {
    namn: "f2-stopped-0817",
    match: (f) => (f["spår"] ?? f.spar) === "F2-process" && /stopped/.test(f.fynd),
    dom: "rotkurad",
    rotorsaka: "dåvarande kraschvakten stoppade appen för räddningsbygg 08:16:48 (status=stopping ⇒ RÄDDNINGSBYGG) samtidigt som prod-synken köade nästa deploy — o24:s rotorsaka 2 (noll deploylås-medvetenhet före pm2 stop). KUR: o24-omskrivningen (lasUpptagen() flock-test ⇒ vantad-deploy viker HELT; beslutstabell i exporterad planeraAtguard(), svit 19/19) — nya kraschvakten stoppar aldrig appen under pågående deploybygg",
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).krasch || "kraschvakt 08:16:48 KRASCHLOOP-MISSTANKE status=stopping ⇒ RÄDDNINGSBYGG"}`,
  },
  // ── rond 50: /session 09:13 ──
  {
    namn: "rond50-session",
    match: (f) => /session nätverksfel/.test(f.fynd) && f.ts.startsWith("2026-09-16T09:1"),
    dom: "rotkurad",
    rotorsaka: ROT_ROND50,
    protokoll: P + " + feljagaren.mjs omtest-kur (rond 50, dokumenterad i verktygets rubrik)",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).hjarta || "hjärtat 09:11:16 WEB-VAKT TimeoutError — omstart"}`,
  },
  // ── RAM HÖG 09-16 03:58 ──
  {
    namn: "ram-hog-stormnatt",
    match: (f) => (f["spår"] ?? f.spar) === "F6-drift" && /RAM \d+ MB/.test(f.fynd) && f.allvar === "HÖG",
    dom: "rotkurad",
    rotorsaka: "09-16:s stormnatt 03:57–03:59: MemAvailable 134/109/125 MB — 12-para­lell-fabrikens barn + deploybygg på 8 GB-servern (samma natt som o24 §5:s metodfynd 'måttobjekt trasigt ≠ kunde inte mäta' och lasttimeout-falsket). KUR: v146-arkitekturen (fabrik max 3 per omgång + RAM-vakt 1500 MB vägrar ny omgång) + prod-synkens VÄNTAR-RAM-grind (2200 MB) — systematiska undre 300 MB-fönstret kurat i roten",
    protokoll: P + " + AGENTS.md v146 + OPTIMERING/o24-kraschvakt-feltriggar-s8.md §5",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).deploy || "prod-synk 03:57:35 VÄNTAR-RAM: 166 MB"}`,
  },
  // ── RAM MEDEL ──
  {
    namn: "ram-medel",
    match: (f) => (f["spår"] ?? f.spar) === "F6-drift" && /RAM \d+ MB/.test(f.fynd),
    dom: "transient-design",
    rotorsaka: ROT_RAM_MEDEL,
    protokoll: P + " + AGENTS.md v146 (fabrikens RAM-vakt) + prod-synk.mjs VÄNTAR-RAM-grind",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).deploy || "inget aktivt bygg i fönstret (trögeltiden 800 MB är informativ)"}`,
  },
  // ── F5 gamla svans-scannern ──
  {
    namn: "f5-svans-era",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /i svansen/.test(f.fynd),
    dom: "rotkurad",
    rotorsaka: ROT_SVANS,
    protokoll: P + " + OPTIMERING/o11-feljakt-f5-rotorsaksfix.md",
    bevis: (f) => `fyndradens eget bevis (svansens slut, ej träffraden): '${radBevis(f)}' — o11 brist 2:s fingeravtryck`,
  },
  // ── F5 AGENTARBETSYTA ──
  {
    namn: "f5-agentyta-o40",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /AGENTARBETSYTA-SYNK MISSLYCKADES \(smutsigt träd/.test(f.bevis || "") && f.ts <= "2026-09-16T22:57",
    dom: "rotkurad",
    rotorsaka: ROT_O40,
    protokoll: P + " + OPTIMERING/o40-agentsynk-lakning-s8.md",
    bevis: (f) => `${radBevis(f)} — före o40-läkningen 22:57 09-16 (union-drivern + klönen läkt)`,
  },
  {
    namn: "f5-agentyta-o43",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /AGENTARBETSYTA-SYNK MISSLYCKADES \(smutsigt träd/.test(f.bevis || ""),
    dom: "rotkurad",
    rotorsaka: ROT_O43,
    protokoll: P + " + OPTIMERING/o43-arbetsytasynk-forsvar-s8.md",
    bevis: (f) => `${radBevis(f)} — o40-recidiven (00:10–02:20 09-17) som MOTIVERADE o43-försvaret (svit 34/34)`,
  },
  {
    namn: "f5-agentyta-skydd",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /ocommittade ändringar i ytan skyddas/.test(f.bevis || ""),
    dom: "transient-design",
    rotorsaka: ROT_O43_SKYDD,
    protokoll: P + " + OPTIMERING/o43-arbetsytasynk-forsvar-s8.md",
    bevis: (f) => `${radBevis(f)} — vägran-tillståndet läkte 03:20 09-18 (AGENTARBETSYTA synkad, prod-synk.log)`,
  },
  // ── F5 patch-kö/502/byggMISS ──
  {
    namn: "f5-patchko",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /(PATCH-KÖ|mål-återarmning FEL 502|bygg MISSLYCKADES)/.test(f.bevis || ""),
    dom: "rotkurad",
    rotorsaka: ROT_PATCHKO,
    protokoll: P + " + OPTIMERING/o50 (patch-köns tysta död) + OPTIMERING/o60-efterbokforing-patchko-driftboken-s8.md",
    bevis: (f) => `${radBevis(f)} — slutläge grönt: next 16.3.5 verifierad i node_modules, deploy på committad lock 00:10 09-18, prod 200, kön tom (o60)`,
  },
  // ── F5 KRASCHLOOP ──
  {
    namn: "f5-kraschloop-gammal",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /KRASCHLOOP/.test(f.bevis || "") && f.ts < "2026-09-17",
    dom: "rotkurad",
    rotorsaka: "dåvarande kraschvaktens falska trigg-rader (o24:s fynd: 7 KRASCHLOOP-MISSTANKE på 28 h, ALLA med omstarter +0 — triggvillkoret implementerade inte filhuvudets egen design). KUR: o24-omskrivningen — beslutstabell med lasUpptagen()-flock-test, PM2-restart före bygg, svit 19/19 mot verkliga loggfall",
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md",
    bevis: (f) => `${radBevis(f)} — omstarter +0 = o24:s fingeravtryck för falsk trigg`,
  },
  {
    namn: "f5-kraschloop-ny",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /(KRASCHLOOP|PM2-RESTART RÄCKTE)/.test(f.bevis || ""),
    dom: "transient-design",
    rotorsaka: ROT_KRASCH_NY,
    protokoll: P + " + OPTIMERING/o24-kraschvakt-feltriggar-s8.md (beslutstabellen)",
    bevis: (f) => `${radBevis(f)} — trappsteget syns i loggen: 17:34:49 'PM2-RESTART (bygge ej motiverat ännu)' ⇒ 17:36 räddningsbygg ⇒ 17:41 KLAR; deploy 17:43 prod 200`,
  },
  // ── F5 hjärta-FEL ──
  {
    namn: "f5-hjarta-0916",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /hjartslag/.test(f.fynd) && /FEL:/.test(f.bevis || "") && f.ts < "2026-09-17",
    dom: "rotkurad",
    rotorsaka: ROT_OMSTART_0916,
    protokoll: P + " + AGENTS.md v146",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).hjarta || "WEB-VAKT-omstart samma minut"} ${kx(f).deploy || ""}`.trim(),
  },
  {
    namn: "f5-hjarta-0917",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /hjartslag/.test(f.fynd) && /FEL:/.test(f.bevis || ""),
    dom: "transient-design",
    rotorsaka: ROT_OMSTART_0917,
    protokoll: P + " + feljagaren.mjs deployfönster-hantering (rond 44)",
    bevis: (f) => `${radBevis(f)} — kontext: ${kx(f).deploy || "deployfönster"} ${kx(f).hjarta || ""}`.trim(),
  },
  // ── F5 429 ──
  {
    namn: "f5-429",
    match: (f) => (f["spår"] ?? f.spar) === "F5-logg" && /STATUS-FEL 429/.test(f.bevis || ""),
    dom: "rotkurad",
    rotorsaka: ROT_429,
    protokoll: P + " + AGENTS.md v146 (parallellism-takets motivering)",
    bevis: (f) => `${radBevis(f)} — 429 = ratebegränsning, inte appfel; v146 tog parallelismen från 12 till omgångar om 3`,
  },
];

// ── klassa alla öppna ───────────────────────────────────────────────────────
// Nyckelkollisionsfynd (o65 §5): två fyndrader kan dela EXAKT (ts, spår, fynd)
// — generisk F5-text + två loggrader matchade i samma millisekundersskanning.
// Lage-Set-matchningen täcker då ALLA rader med nyckeln, och stormar-grinden
// vägrar dublettnycklar i bedömningsfilen ⇒ deduplicera per nyckel och sloga
// ihop bevisen (klassen är densamma — kolliderande rader grävdes individuellt).
const ut = [];
const perNyckel = new Map();
const kollisioner = [];
const okanda = [];
for (const f of oppna) {
  const r = regler.find((regel) => {
    try { return regel.match(f); } catch { return false; }
  });
  if (!r) { okanda.push(`${nyckel(f)}`); continue; }
  const n = nyckel(f);
  const befintlig = perNyckel.get(n);
  if (befintlig) {
    if (befintlig.dom !== r.dom) { okanda.push(`${n} — NYCKELKOLLISION med OLIKA dom (${befintlig.dom} vs ${r.dom}) — gräv manuellt`); continue; }
    kollisioner.push(n);
    befintlig.bevis = `${befintlig.bevis} || även: ${r.bevis(f)} [2 fyndrader delar nyckeln — en bedömning täcker båda i lage-Set:et]`;
    continue;
  }
  const rad = {
    ts: f.ts,
    "spår": f["spår"] ?? f.spar,
    allvar: f.allvar,
    fynd: f.fynd,
    dom: r.dom,
    rotorsaka: r.rotorsaka,
    bevis: r.bevis(f),
    protokoll: r.protokoll,
    domdAv: DOMDAV,
  };
  perNyckel.set(n, rad);
  ut.push(rad);
}
if (kollisioner.length) console.error(`[triage] ${kollisioner.length} nyckelkollision(er) slogs ihop (samma dom): ${[...new Set(kollisioner)].join(" ; ")}`);

const perDom = {};
for (const r of ut) perDom[r.dom] = (perDom[r.dom] ?? 0) + 1;
console.error(`[triage] ${ut.length} klassade av ${oppna.length} öppna — ${Object.entries(perDom).map(([d, n]) => `${d}:${n}`).join(" · ")}`);
if (okanda.length) {
  console.error(`[triage] ${okanda.length} OKÄNDA — VÄGRAR generera (gräv manuellt):`);
  for (const k of okanda) console.error(`  ${k}`);
  process.exit(1);
}
for (const r of ut) console.log(JSON.stringify(r));
