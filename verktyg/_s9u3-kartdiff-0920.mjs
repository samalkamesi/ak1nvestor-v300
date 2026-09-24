#!/usr/bin/env node
// _s9u3-kartdiff-0920.mjs — dokvåg s9-u3 (manifest auto-s9-1789898701601)
// Read-only mätare: C17 (dataset-citeringsmagneterna) + D21 (medlemsdata &
// progress) + D25 (referral + e-post + notiser) mot SYSTEMKARTAN 2026-09-18.
// Enbart GET/HEAD mot localhost + filläsningar + git-log via execFileSync —
// inga nycklar, ingen skrivning mot prod, src/ orörd.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const utf = (s) => readFileSync(path.join(ROT, s), "utf8");
const log = (...a) => console.log(...a);
const BAR = "=".repeat(72);

async function sond(url, { metod = "GET", väntaPå = null } = {}) {
  const start = Date.now();
  try {
    const r = await fetch(url, { method: metod, redirect: "manual" });
    const ms = Date.now() - start;
    let kropp = "";
    if (metod === "GET") {
      const t = await r.text();
      kropp = väntaPå ? (t.includes(väntaPå) ? " ✓ innehåller " + JSON.stringify(väntaPå) : " ✗ SAKNAR " + JSON.stringify(väntaPå)) : ` (${t.length} B)`;
    }
    return `${r.status} ${ms} ms${kropp}`;
  } catch (e) {
    return `FEL ${e.cause?.code || e.message}`;
  }
}

const git = (args) => execFileSync("git", args, { cwd: ROT, encoding: "utf8" }).trim();

log(BAR, "\nC17 — DATASET-CITERINGSMAGNETERNA");
{
  const uni = JSON.parse(utf("data/portfolj-system/bolagsunivers.json"));
  const lista = Array.isArray(uni) ? uni : uni.bolag || Object.values(uni).flat();
  log("bolagsunivers:", Array.isArray(lista) ? lista.length : "okänd form", "(kartan 09-18: 177)");
  const ko = readdirSync(path.join(ROT, "data/blogg-utkast/kvartal/2026-q3"));
  const paket = ko.filter((f) => f.includes("sa-laser-du")).length;
  const kalendrar = ko.filter((f) => !f.includes("sa-laser-du")).length;
  log(`Kön-filer 2026-q3: ${ko.length} = ${paket} bolagspaket + ${kalendrar} kalendrar (kartan 09-18: 52 = 42+10)`);
  for (const s of ["/dataset", "/dataset/energi", "/dataset/material", "/dataset/halso/danmark", "/en/dataset", "/ar/dataset"]) {
    log(` sond ${s}:`, await sond("http://localhost:3000" + s));
  }
  log(" sond CTA live (sv):", await sond("http://localhost:3000/dataset", { väntaPå: "Från tabell till hantverk" }));
  log(" sond CTA live (en):", await sond("http://localhost:3000/en/dataset", { väntaPå: "kurser" }));
  const llms = utf("public/llms.txt");
  log("llms.txt: bär danmark-aspekt:", llms.includes("danmark"), "· längd", llms.length, "B");
  const ds = utf("src/components/ak1a/dataset-sidor.tsx").split("\n").length;
  log("dataset-sidor.tsx:", ds, "rader (våg 201 CTA + o110 lang-bindning på SeoPageShell)");
  const aspekter = readdirSync(path.join(ROT, "src/lib/dataset-aspekter")).filter((f) => f.endsWith(".ts")).length;
  log("dataset-aspekter-moduler på disk:", aspekter);
  log(" senaste git på dataset-sidor.tsx:", git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/components/ak1a/dataset-sidor.tsx"]));
}

log(BAR, "\nD21 — MEDLEMSDATA & PROGRESS");
{
  const s = JSON.parse(utf("data/siffror.json"));
  log(`siffror.json (uppdaterad ${s.uppdaterad}): kurser ${s.kurser} · quiz ${s.quiz} · quizXp ${s.quizXp} · fas2 ${s.fas2Kurser} · fas3 ${s.fas3Kurser}`);
  log("  (kartan 09-18: kurser 426 · quiz 8 223 · quizXp 82 230 — quiz-talen FRUSNA, kurserna +", s.kurser - 426, ")");
  const senasteSiffror = git(["log", "-1", "--format=%h %ad %s", "--date=format:'%m-%d %H:%M'", "--", "data/siffror.json"]).slice(0, 90);
  log("  senaste siffror-commit:", senasteSiffror);
  for (const s2 of ["/api/medlem/progress"]) {
    log(` sond ${s2}:`, await sond("http://localhost:3000" + s2));
  }
  const mp = utf("src/lib/medlem-progress.ts").split("\n").length;
  const sns = git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/lib/medlem-progress.ts"]);
  log("medlem-progress.ts:", mp, "rader · senaste beröring", sns, "(kartan: 478 r)");
  const synk = JSON.parse(utf("data/vakten/larvag-synk.json"));
  log("larvag-synk:", JSON.stringify(synk).slice(0, 220));
}

log(BAR, "\nD25 — REFERRAL + E-POST + NOTISER");
{
  const n = utf("src/lib/notiser.ts").split("\n").length;
  const sns = git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/lib/notiser.ts"]);
  log("notiser.ts:", n, "rader · senaste beröring", sns, "(kartan: 363 r, stilla sedan 09-06 → rörd 09-19 våg 201)");
  const i = utf("src/lib/notiser.ts");
  log(" notis-djup bevis: '20 fundamentalindikatorerna' i koden:", i.includes("20 fundamentalindikatorerna"), "· fas2-länk:", i.includes("/fas2-ansok"));
  log(" sond /api/notiser:", await sond("http://localhost:3000/api/notiser"));
  const r = utf("src/lib/referral.ts").split("\n").length;
  const rsns = git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/lib/referral.ts"]);
  log("referral.ts:", r, "rader · senaste beröring", rsns, "(kartan: 301 r, 2d67d75b 09-06)");
  const e = utf("src/lib/email-sandare.ts").split("\n").length;
  const esns = git(["log", "-1", "--format=%h %ad", "--date=short", "--", "src/app/api/cron/email/route.ts"]);
  log("cron/email route · senaste beröring:", esns, "(gap 4-mätningen 09-18: kodstilla)");
  const vag = i.includes("vagkarta");
  log(" vagkarta-fält i notis-underlaget (kod):", vag);
}
log(BAR);
