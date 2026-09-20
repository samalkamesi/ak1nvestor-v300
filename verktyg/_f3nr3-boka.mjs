#!/usr/bin/env node
/** ROND 123 bokning [organ:Φ]: F3-vaccin v3 (FYNN nr 3, åldergrinden).
 * Worklog + feljakt-bedömning (KORREKT nyckelkontrakt: bedömningens ts =
 * fyndradens exakta ts 18:44:02.269Z, dom = giltig klass transient-design,
 * domdTs = nu) + beslutsminne + commit + push med retry. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const ROT = "/home/ak1a/agent/ak1";
const SVAR = `${ROT}/data/vakten/f3nr3-boka-svar.txt`;
const ts = new Date().toISOString();
const lines = [`BOKNING start ${ts}`];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cd = (arr, opts = {}) => execFileSync(arr[0], arr.slice(1), { encoding: "utf8", cwd: ROT, maxBuffer: 16 * 1024 * 1024, ...opts });

try {
  // 1) worklog
  const wlPath = `${ROT}/worklog.md`;
  const wl = fs.readFileSync(wlPath, "utf8");
  if (!wl.includes("ROND 123 [organ:Φ] — F3-VACCIN V3")) {
    fs.appendFileSync(wlPath, `

**ROND 123 [organ:Φ] — F3-VACCIN V3 (FYNN NR 3): ÅLDERGRINDEN:** FYNN eskalerade /andringar igen 18:44:02Z HÖG "rot LEVER — äkta API-fel" — med förra rundens rot-sond aktiv och korrekt mätt (GET / 200). Lag 1-återmätning: /api/studio/andringar svarar 401 på 0,01 s (auth-skydd) — frisk. Lag 2-rot: sondens BEROENDEBLINDFLÄCK — GET / är en ren Next-yta men /api/studio/* går via studio-transportens barn-RPC; appen 11 min gammal (pm2-omstart 18:33, deploy e6a80031) grönar rot-sonden medan den kalla transporten under syskonlast timeout:ar (båda familjens falsklarm 14:57Z + 18:44Z har identisk signatur: 11–20 min post-omstart, rot 200, endpoint-timeout ×2, frisk vid återmätning; /halsa + /puls avslogs som sonder — registret/minnet, inte barnet). KUR: UPPVARMNINGSGRINDEN i verktyg/feljagaren.mjs — hamtaAppAlderMin() läser pm2 pm_uptime (F2:s jlist-källa); app < 25 min vid nätverksfel utan aktivt bygg ⇒ MEDEL "efterdyning — appen N min gammal", aldrig HÖG; pm2 oläsbar ⇒ null ⇒ rot-sonden ensam. Eldprov 7/7 PASS (AK1A_APP_ALDER_MIN-hook, cron sätter den aldrig): V0 levande pm2-läsning = 18 min; V1+V2 död rot+vuxen app ⇒ 18 MEDEL 0 HÖG; V3+V4 levande rot+vuxen app ⇒ 18 HÖG rot-LEVER (äkta-skyddet bevarat); V5+V6 levande rot+ung app ⇒ 18 MEDEL efterdyning 0 HÖG — 18:44-signaturen reproducerad och kurad. Commit a57e53e9 → prod (rak push). 18:44-fyndraden bedömd i ledgern: transient-design (designat deploy-efterdyningavbrott) med exakt nyckel ts=2026-09-20T18:44:02.269Z — kontraktet denna gång korrekt (förra rondens fritext-domklass var skral i lage-verktyget; noteras som lärdom).
`);
    lines.push("worklog: +ROND 123");
  } else lines.push("worklog: redan bokad (idempotent)");

  // 2) feljakt-bedömning — KORREKT nyckel: ts = fyndradens exakta ts
  const ledger = `${ROT}/data/vakten/feljakt-bedomningar.jsonl`;
  const fyndTs = "2026-09-20T18:44:02.269Z";
  if (!fs.readFileSync(ledger, "utf8").includes(`"ts":"${fyndTs}"`)) {
    fs.appendFileSync(ledger, JSON.stringify({
      ts: fyndTs, domdTs: ts, "spår": "F3-api", allvar: "HÖG",
      fynd: "/andringar nätverksfel",
      dom: "transient-design",
      rotorsaka: "Deploy-efterdyning (FYNN nr 3, 2026-09-20 18:44Z): fyndet mättes 11 minuter efter pm2-omstarten 18:33 (deploy e6a80031, prod-synk.log 'DEPLOYAD automatiskt ... prod 200'). Rot-sonden (FYNN nr 2-vaccinet) grönade korrekt — GET / är en ren Next-yta — men /api/studio/andringar går via studio-transportens barn-RPC (zcode-app-server): kall transport under syskonlast timeout:ar två gånger (15 s + omtest 20 s) medan roten svarar 200. Identisk signatur som 14:57Z-falsklarmet: 11–20 min post-omstart, rot 200, frisk vid återmätning (Lag 1: 401 på 0,01 s kl 19:0xZ — auth-skydd, väntat).",
      kur: "Åldergrinden (vaccin v3, commit a57e53e9): hamtaAppAlderMin() läser pm2 pm_uptime; app yngre än 25 min vid nätverksfel utan aktivt deploybygg bokförs MEDEL 'efterdyning — appen N min gammal', aldrig HÖG. Grenordning: deploylås > efterdyning > kaskad > rot-sond > omtest. Äkta-skyddet bevarat: vuxen app (≥ 25 min) med levande rot + död endpoint eskaleras fortfarande HÖG.",
      bevis: "Eldprov verktyg/_f3-vaccin-test.mjs 7/7 PASS (V0 levande pm2-läsning=18; V1/V2 död rot+vuxen ⇒ MEDEL; V3/V4 levande rot+vuxen ⇒ HÖG rot-LEVER; V5/V6 levande rot+ung 10 min ⇒ 18 MEDEL efterdyning 0 HÖG) + Lag 1-återmätning 401/0,01 s + prod-synk.log 18:33:10Z deployraden.",
      lag: "1 (färsk återmätning före dom) · 2 (rot: beroendeblindfläck + kall transport, ingen ytlagning) · 6 (dom + vaccin + eldprov = klassen stängd)",
      protokoll: "rond 123 F3-order nr 3 (FYNN) — verkställd av studion [organ:Φ]",
    }) + "\n");
    lines.push("ledger: +18:44-bedömning (korrekt nyckel + giltig domklass)");
  } else lines.push("ledger: redan bokad");

  // 3) beslutsminne (idempotent)
  const minne = `${ROT}/data/vakten/beslutsminne.jsonl`;
  if (!fs.readFileSync(minne, "utf8").includes('"rond":123,"beslut":"F3-vaccin v3')) {
    fs.appendFileSync(minne, JSON.stringify({ ts, rond: 123, beslut: "F3-vaccin v3 (FYNN nr 3): åldergrinden — pm_uptime < 25 min ⇒ MEDEL efterdyning, aldrig HÖG; rot-sondens beroendeblindfläck (GET / Next-yta vs /api/studio transport-RPC) dokumenterad; eldprov 7/7 PASS; commit a57e53e9", landat: "" }) + "\n");
    lines.push("beslutsminne: +rond 123");
  } else lines.push("beslutsminne: redan bokad");

  // 4) städa meddelandefilen + commit
  try { fs.unlinkSync(`${ROT}/_f3nr3-commitmsg.txt`); } catch {}
  cd(["git", "add", "worklog.md", "data/vakten/feljakt-bedomningar.jsonl", "verktyg/_f3nr3-boka.mjs"]);
  const msg = `studio: rond 123 bokning [organ:Φ] — F3-vaccin v3 (FYNN nr 3) bokförd: worklog + 18:44-bedömning med korrekt nyckelkontrakt (ts=fyndets ts, dom=transient-design) + beslutsminne; kur i a57e53e9`;
  fs.writeFileSync(`${ROT}/_f3nr3-commitmsg2.txt`, msg);
  const commit = cd(["git", "commit", "-F", "_f3nr3-commitmsg2.txt"]);
  lines.push("commit: " + commit.split("\n")[0]);
  try { fs.unlinkSync(`${ROT}/_f3nr3-commitmsg2.txt`); } catch {}

  // 5) push med retry
  let pushad = "";
  for (let i = 1; i <= 30 && !pushad; i++) {
    try { pushad = cd(["git", "push", "prod", "develop"]); }
    catch (e) {
      try { cd(["git", "fetch", "prod", "develop"]); cd(["git", "merge", "-m", "merge prod (fabriksleveranser) — rond 123", "prod/develop"]); } catch {}
      lines.push(`push försök ${i}: upptagen — väntar 60 s`);
      fs.writeFileSync(SVAR, lines.join("\n") + "\n");
      await sleep(60_000);
    }
  }
  lines.push(pushad ? `PUSH GRÖN: ${pushad.trim().split("\n").pop()}` : "PUSH nekad efter 30 försök");
  if (pushad) {
    const m = fs.readFileSync(minne, "utf8").trim().split("\n");
    const sista = JSON.parse(m.pop());
    sista.landat = "ja";
    m.push(JSON.stringify(sista));
    fs.writeFileSync(minne, m.join("\n") + "\n");
  }
  lines.push(`BOKNING klar ${new Date().toISOString()}`);
} catch (e) {
  lines.push(`FEL: ${String(e.stderr || e.message).slice(0, 600)}`);
}
fs.writeFileSync(SVAR, lines.join("\n") + "\n");
console.log(lines.join("\n"));
