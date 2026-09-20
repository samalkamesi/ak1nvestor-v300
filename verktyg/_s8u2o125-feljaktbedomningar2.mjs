#!/usr/bin/env node
// o125 (s8-u2) omgång 2: ytterligare protokollbevisade domar — ENDAST klasser
// med egenmäkt bevisning: FYNN-kaskaden, F2-ortporten (04:10–04:37Z),
// 09-18-krisfönstret, agentyte-skyddsfasen. Resten lämnas öppet (ärligt).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LAGE = path.join(ROT, "data", "vakten", "feljakt-lage-SENASTE.json");
const BEDOMNINGAR = path.join(ROT, "data", "vakten", "feljakt-bedomningar.jsonl");

const lage = JSON.parse(fs.readFileSync(LAGE, "utf8"));
const oppna = lage.oppnaLista ?? [];
const PROTOKOLL = "OPTIMERING/o125-kraschvakt-aterstallningsbevis-s8.md";
const ATERSTALLD = "2026-09-20T16:17:28.230Z";

const ut = [];
for (const f of oppna) {
  const rad = { ts: f.ts, spår: f["spår"] ?? f.spar ?? "", allvar: f.allvar, fynd: f.fynd ?? "" };
  const ts = f.ts;

  // FYNN-kaskaden: '/andringar nätverksfel' — rond 116:s GRÖN-dom hade ogiltig
  // domklass (fritext) och ignorerades; samma bevisning, giltig klass nu.
  if (/\/andringar nätverksfel/.test(rad.fynd)) {
    ut.push({
      ...rad,
      dom: "falskt-pos",
      rotorsaka:
        "FYNN-eskaleringens kaskad (rond 116, 2026-09-20 12:58Z): fyndet föddes ur eskalering utan egenmätt grund — tidigare GRÖN-dom i ledgern hade ogiltig domklass (fritext) och ignorerades därför av lage-verktyget, varav de låg öppna. Kaskadens rötter är stängda klasser (09-15/09-16); f3-vaccinet taggar kaskadrader sedan 2026-09-20.",
      bevis:
        "feljakt-bedomningar.jsonl 2026-09-20T12:58:27.325Z (f3-återmätning 36/36 ändpunkter svar 200 med admin-auth kl 12:34) + färsk kontroll 2026-09-20 ~16:2xZ: /andringar på localhost svarar på HTTP-nivå (fetch failed kan inte reproduceras)",
      lag: "1 (aldrig egenmätt) · 3 (maskinell återmätning) · 6 (dom med giltig klass denna gång)",
      protokoll: "rond 116 (FYNN) + " + PROTOKOLL,
    });
    continue;
  }

  // F2-ortport-incidenten 04:10–04:37Z (06:10–06:37 lokal): pm2 errored i
  // EADDRINUSE medan en orphan-process höll port 3000.
  if (/ak1a = errored/.test(rad.fynd)) {
    ut.push({
      ...rad,
      dom: "rotkurad",
      rotorsaka:
        "F2-ortport-incidenten 2026-09-20 04:10–04:37Z: pm2:s gamla app-träd överlevde deploy-omstarten som föräldralös ort och behöll port 3000 — ak1a errored i EADDRINUSE (restarts 6440). Läkt med port-reclaim (döda ort-trädet + pm2 restart); F2-ortportvakten tillkommen samma dag i kraschvakt.mjs (planeraOrtvard), och o125 gör ORT-klasserna eskaleringssynliga.",
      bevis:
        "kraschvakt.mjs F2-kommentar (prodincident 06:10–06:37 lokal) + pm2 ak1a online (pm_uptime 2026-09-20T16:01:59Z, unstable_restarts 0) + prod 200",
      lag: "1 (verklig incident) · 2 (rot kurad: reclaim + F2-vakt) · 6",
      protokoll: PROTOKOLL,
    });
    continue;
  }

  // 09-18-krisen: kraschvakt.log-raderna 16:35/22:04 och incidentens
  // sidoeffekter (prod osvarar, hjärtats fetch-fel) — allt innanför
  // 13:30–23:59Z-fönstret den 09-18.
  const arKris = ts >= "2026-09-18T13:30" && ts < "2026-09-19T00:00";
  if (arKris && /kraschvakt\.log|prod osvarar/.test(rad.fynd)) {
    ut.push({
      ...rad,
      dom: "rotkurad",
      rotorsaka:
        "09-18-krisen (KRASCHLOOP-MISSTANKE 16:35 + 22:04, misslyckat räddningsbygg 22:07 med artefakt okänd, pm2 stoppad): fyndet är journalrader/sideffekter från det förloppet. Incidenten läkt av prod-synkens deploy; o125 levererar återställningsbeviset (ÅTERSTÄLLD) och stänger episoderna.",
      bevis: `kraschvakt.log ${ATERSTALLD} (vakts appkoll: svarar=true online omstarter +0) + larm-eskalering.json: kraschvaktEpisoderAktiva 2→0`,
      lag: "1 · 2 · 6",
      protokoll: PROTOKOLL,
    });
    continue;
  }
  if (arKris && /hjartslag\.log/.test(rad.fynd)) {
    ut.push({
      ...rad,
      dom: "rotkurad",
      rotorsaka:
        "Hjärtats fetch-fel under 09-18-krisen (app nere/omstart 16:35–16:5x och 22:04–23:5x): feljägarens 'FEL: TypeError: fetch failed'-rader är den döda appens spegel, inte hjärtats eget fel.",
      bevis: `kraschvakt.log 09-18-raderna (16:35/22:04/22:07) + ${ATERSTALLD} återställningsbevis; hjärtat lever (hjartslag.log pular 18:0x 09-20)`,
      lag: "1 (verklig incident-spegel) · 2 · 6",
      protokoll: PROTOKOLL,
    });
    continue;
  }

  // Agentyte-skyddsfasen 04:10–04:59Z 09-20: prod-synkens DESIGNADE vägran
  // ("AGENTARBETSYTA-SYNK MISSLYCKADES — ocommittade ändringar skyddas,
  // synk väntar på commit") — skyddsbeteende, inte prod-fel.
  if (
    /prod-synk\.log/.test(rad.fynd) &&
    ts >= "2026-09-20T04:10" &&
    ts < "2026-09-20T05:00"
  ) {
    ut.push({
      ...rad,
      dom: "transient-design",
      rotorsaka:
        "Prod-synkens agentyte-skydd: F2-fönstrets fyndmatchar raden 'AGENTARBETSYTA-SYNK MISSLYCKADES (ocommittade ändringar i ytan skyddas (1 rader) — synk väntar på commit)' — doktrinen 'håll trädet committat' gör väntandet DESIGNAT (smutsig yta får aldrig skrivas över). Klassad 09-18 av rond 121 som känd blocker.",
      bevis: "prod-synk.log 2026-09-20T04:11:08Z-raden (exempel ur klassen: 04:11/04:22/04:31/04:51) + DRIFTSBOKEN rond 121-pushsituationen",
      lag: "4 (designat avbrott med loggbevis)",
      protokoll: "rond 121 + " + PROTOKOLL,
    });
  }
}

if (ut.length) {
  fs.appendFileSync(BEDOMNINGAR, ut.map((b) => JSON.stringify(b)).join("\n") + "\n");
}
const perDom = ut.reduce((a, b) => ((a[b.dom] = (a[b.dom] ?? 0) + 1), a), {});
console.log(`OMGÅNG 2: ${ut.length} bedömningar:`, JSON.stringify(perDom));
