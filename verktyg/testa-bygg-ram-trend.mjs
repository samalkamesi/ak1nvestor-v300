#!/usr/bin/env node
/**
 * testa-bygg-ram-trend.mjs — svit för V185 (r276): BYGG-RAM-TREND-verktyget.
 *
 * Mäter:
 *   · klassaMinne — gränserna GRÖN/GUL/RÖD (300/150 MB, dokumenterade i verktyget)
 *   · lasFonster — fönsterparsning: stängda, pågående, avbrutna (start utan
 *     slut — sondens rekursionsolycka 2026-09-27 får ALDRIG döljas igen),
 *     föräldralösa prover (bygg-rad utan start)
 *   · sammanstallFonster — per-fönsterstatistik (min, dykminut, varaktighet,
 *     under300) + trend (SÄNKS/STIGER/JÄMN) + värsta fönster + fallback till
 *     slut-radens minTillgangligtMB när prover saknas
 *   · CLI — Markdown + --json mot fixturefil, exit 2 vid saknad/tom fil
 *
 * Användning:  node verktyg/testa-bygg-ram-trend.mjs
 * Exit 0 = alla PASS, exit 1 = minst ett FAIL.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { klassaMinne, lasFonster, sammanstallFonster, tillMarkdown, valjServerfonster } from "./bygg-ram-trend.mjs";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(REPO, "verktyg/bygg-ram-trend.mjs");
let pass = 0;
let fail = 0;
const FEL = [];

function kontroll(namn, villkor, detalj = "") {
  if (villkor) {
    pass++;
    console.log(`PASS ${namn}`);
  } else {
    fail++;
    console.log(`FAIL ${namn}${detalj ? " — " + detalj : ""}`);
    FEL.push(namn);
  }
}

// ── 1) KLASSNINGSGRÄNSER ──────────────────────────────────────────────────
kontroll("1. klassaMinne 300 MB = GRÖN (designmarginal)", klassaMinne(300) === "GRÖN");
kontroll("2. klassaMinne 299 MB = GUL (BYGG-RAM-VARNING-zonen)", klassaMinne(299) === "GUL");
kontroll("3. klassaMinne 150 MB = GUL (nedre GUL-gränsen)", klassaMinne(150) === "GUL");
kontroll("4. klassaMinne 149 MB = RÖD (OOM-riskzonen, r273-roten)", klassaMinne(149) === "RÖD");

// ── 2) FÖNSTERPARSNING — produktionslik fixture (två äkta fönster 09-27) ──
const FIXTUR_RADER = [
  { fas: "start", ts: "2026-09-27T12:47:26.158Z", pid: 1044242 },
  { fas: "bygg", ts: "2026-09-27T12:48:26.484Z", tillgangligtMB: 648, minut: 1 },
  { fas: "bygg", ts: "2026-09-27T12:49:26.452Z", tillgangligtMB: 235, minut: 2 },
  { fas: "bygg", ts: "2026-09-27T12:50:26.471Z", tillgangligtMB: 5443, minut: 3 },
  { fas: "slut", ts: "2026-09-27T12:53:20.640Z", varv: 5, minTillgangligtMB: 235 },
  { fas: "start", ts: "2026-09-27T14:57:26.389Z", pid: 1150056 },
  { fas: "bygg", ts: "2026-09-27T14:58:26.453Z", tillgangligtMB: 2311, minut: 1 },
  { fas: "bygg", ts: "2026-09-27T15:00:26.854Z", tillgangligtMB: 193, minut: 3 },
  { fas: "slut", ts: "2026-09-27T15:05:45.344Z", varv: 8, minTillgangligtMB: 193 },
];
const P = lasFonster(FIXTUR_RADER);
kontroll("5. lasFonster: två stängda fönster parsade", P.stangda.length === 2 && P.pagasende === null && P.foraldralosa === 0);
kontroll("6. lasFonster: pågående fönster (start utan slut) syns", lasFonster([
  { fas: "start", ts: "2026-09-27T16:00:00Z", pid: 1 },
  { fas: "bygg", ts: "2026-09-27T16:01:00Z", tillgangligtMB: 900, minut: 1 },
]).pagasende?.prover?.length === 1);
kontroll("7. lasFonster: avbrutet fönster (ny start utan slut) behålls SYNLT", (() => {
  const r = lasFonster([
    { fas: "start", ts: "2026-09-27T12:27:26Z", pid: 1 },
    { fas: "bygg", ts: "2026-09-27T12:28:26Z", tillgangligtMB: 400, minut: 1 },
    { fas: "start", ts: "2026-09-27T12:37:26Z", pid: 2 },
    { fas: "slut", ts: "2026-09-27T12:45:00Z", varv: 4, minTillgangligtMB: 300 },
  ]);
  return r.stangda.length === 2 && r.stangda[0].avbrutet === true && r.stangda[1].avbrutet === false;
})());
kontroll("8. lasFonster: föräldralös bygg-rad räknas och kastas tyst", (() => {
  const r = lasFonster([{ fas: "bygg", ts: "2026-09-27T12:28:00Z", tillgangligtMB: 400, minut: 1 }]);
  return r.foraldralosa === 1 && r.stangda.length === 0 && r.pagasende === null;
})());
kontroll("9. lasFonster: null-rad (skräp) hoppas över utan krasch", (() => {
  const r = lasFonster([null, ...FIXTUR_RADER]);
  return r.stangda.length === 2;
})());

// ── 3) SAMMANSTÄLLNING + TREND ────────────────────────────────────────────
const S = sammanstallFonster(P.stangda);
kontroll("10. sammanstall: fönster 1 min 235 MB vid dykminut 2", S.fonster[0].minstMB === 235 && S.fonster[0].dykMinut === 2);
kontroll("11. sammanstall: fönster 2 min 193 MB", S.fonster[1].minstMB === 193);
kontroll("12. sammanstall: varaktighet fönster 1 = 354 sek", S.fonster[0].varaktighetSek === 354);
kontroll("13. sammanstall: under300-räknare (fönster 1 har 1 prov under 300)", S.fonster[0].under300 === 1);
kontroll("14. sammanstall: båda fönstern klassas GUL", S.fonster[0].klass === "GUL" && S.fonster[1].klass === "GUL");
kontroll("15. sammanstall: TREND SÄNKS med delta -42 MB", S.trend.riktning === "SÄNKS" && S.trend.delta === -42);
kontroll("16. sammanstall: VÄRSTA fönster = 193 MB-fönstret", S.varsta?.minstMB === 193 && S.varsta?.startTs === "2026-09-27T14:57:26.389Z");
kontroll("17. sammanstall: fallback till slut-radens min när prover saknas", (() => {
  const r = lasFonster([
    { fas: "start", ts: "2026-09-27T10:00:00Z", pid: 1 },
    { fas: "slut", ts: "2026-09-27T10:06:00Z", varv: 3, minTillgangligtMB: 190 },
  ]);
  const s = sammanstallFonster(r.stangda);
  return s.fonster[0].minstMB === 190 && s.fonster[0].klass === "GUL";
})());
kontroll("18. sammanstall: RÖTT fönster klassas RÖD", sammanstallFonster(lasFonster([
  { fas: "start", ts: "2026-09-27T10:00:00Z", pid: 1 },
  { fas: "bygg", ts: "2026-09-27T10:01:00Z", tillgangligtMB: 120, minut: 1 },
  { fas: "slut", ts: "2026-09-27T10:06:00Z", varv: 2, minTillgangligtMB: 120 },
]).stangda).fonster[0].klass === "RÖD");
kontroll("19. sammanstall: STIG-trend (friskare fönster senare)", sammanstallFonster(lasFonster([
  { fas: "start", ts: "2026-09-27T10:00:00Z", pid: 1 },
  { fas: "bygg", ts: "2026-09-27T10:01:00Z", tillgangligtMB: 250, minut: 1 },
  { fas: "slut", ts: "2026-09-27T10:06:00Z", varv: 2, minTillgangligtMB: 250 },
  { fas: "start", ts: "2026-09-27T11:00:00Z", pid: 2 },
  { fas: "bygg", ts: "2026-09-27T11:01:00Z", tillgangligtMB: 900, minut: 1 },
  { fas: "slut", ts: "2026-09-27T11:06:00Z", varv: 2, minTillgangligtMB: 900 },
]).stangda).trend.riktning === "STIGER");
kontroll("20. sammanstall: ett ensamt fönster ger trend OKÄND (ingen riktning på n=1)", sammanstallFonster(P.stangda.slice(0, 1)).trend.riktning === "OKÄND");

// ── 4) MARKDOWN ───────────────────────────────────────────────────────────
const md = tillMarkdown(S, null, 0);
kontroll("21. markdown: rubrikrad med antal + span", md.includes("2 stängda fönster") && md.includes("12:47:26"));
kontroll("22. markdown: TREND- och VÄRSTA-rader", md.includes("TREND: SÄNKS") && md.includes("VÄRSTA FÖNSTER"));
kontroll("23. markdown: AVBRUTET-fönster märks (transparens, ej dolt)", tillMarkdown(
  sammanstallFonster(lasFonster([
    { fas: "start", ts: "2026-09-27T12:27:26Z", pid: 1 },
    { fas: "bygg", ts: "2026-09-27T12:28:26Z", tillgangligtMB: 400, minut: 1 },
    { fas: "start", ts: "2026-09-27T12:37:26Z", pid: 2 },
    { fas: "slut", ts: "2026-09-27T12:45:00Z", varv: 4, minTillgangligtMB: 300 },
  ]).stangda), null, 0,
).includes("AVBRUTET"));

// ── 5) CLI MOT FIXTUREFILER ───────────────────────────────────────────────
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-trend-"));
const fixturFil = (namn, rader) => {
  const f = path.join(TMP, namn);
  fs.writeFileSync(f, rader.map((r) => JSON.stringify(r)).join("\n") + "\n");
  return f;
};
const cli = (args) => execFileSync(process.execPath, [VERKTYG, ...args], { encoding: "utf8" }).trim();
const cliStatus = (args) => {
  try { execFileSync(process.execPath, [VERKTYG, ...args], { encoding: "utf8", stdio: "pipe" }); return 0; }
  catch (e) { return e.status; }
};

const huvudfixture = fixturFil("tva.jsonl", FIXTUR_RADER);
try {
  const ut = cli([huvudfixture]);
  kontroll("24. CLI: markdown mot fixture — fönsterrader + klass", ut.includes("min 235 MB") && ut.includes("min 193 MB") && ut.includes("GUL"));
  kontroll("25. CLI: PÅGÅENDE fönster rapporteras live", (() => {
    const f = fixturFil("pagasende.jsonl", [
      { fas: "start", ts: "2026-09-27T16:00:00Z", pid: 9 },
      { fas: "bygg", ts: "2026-09-27T16:01:00Z", tillgangligtMB: 800, minut: 1 },
    ]);
    return cli([f]).includes("PÅGÅENDE FÖNSTER");
  })());
  const jsonUt = JSON.parse(cli([huvudfixture, "--json"]));
  kontroll("26. CLI --json: antalFonster + trend + varsta + pagasende=null", jsonUt.antalFonster === 2 && jsonUt.trend.riktning === "SÄNKS" && jsonUt.varsta.minstMB === 193 && jsonUt.pagasende === null);
  kontroll("27. CLI: saknad fil ⇒ exit 2", cliStatus([path.join(TMP, "finns-ej.jsonl")]) === 2);
  const tomFil = path.join(TMP, "tom.jsonl");
  fs.writeFileSync(tomFil, "\n\n");
  kontroll("28. CLI: tom fil ⇒ exit 2", cliStatus([tomFil]) === 2);
  kontroll("29. CLI: --json flaggan oberoende av filargumentets ordning", JSON.parse(cli(["--json", huvudfixture])).antalFonster === 2);
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
}

// ── 6) ROND 284: SERVER-TAGGNING — blanda aldrig maskinvaror i en trend ───
const BLANDAD = [
  { fas: "start", ts: "2026-09-27T12:47:26.158Z", pid: 1044242, server: "contabo" },
  { fas: "bygg", ts: "2026-09-27T12:48:26.484Z", tillgangligtMB: 235, minut: 2, server: "contabo" },
  { fas: "slut", ts: "2026-09-27T12:53:20.640Z", varv: 5, minTillgangligtMB: 235, server: "contabo" },
  { fas: "start", ts: "2026-09-28T03:47:00.000Z", pid: 4711, server: os.hostname() },
  { fas: "bygg", ts: "2026-09-28T03:48:00.000Z", tillgangligtMB: 57000, minut: 1, server: os.hostname() },
  { fas: "slut", ts: "2026-09-28T03:52:00.000Z", varv: 4, minTillgangligtMB: 57000, server: os.hostname() },
];
kontroll("30. r284 lasFonster: fönstret ärver server-taggen från start-raden", (() => {
  const r = lasFonster(BLANDAD);
  return r.stangda.length === 2 && r.stangda[0].server === "contabo" && r.stangda[1].server === os.hostname();
})());
kontroll("31. r284 lasFonster: otaggad start + taggad slut ⇒ slut-radens tagg ärvs", (() => {
  const r = lasFonster([
    { fas: "start", ts: "2026-09-28T03:47:00.000Z", pid: 1 },
    { fas: "slut", ts: "2026-09-28T03:52:00.000Z", varv: 1, minTillgangligtMB: 400, server: "ssdnodes-test" },
  ]);
  return r.stangda[0].server === "ssdnodes-test";
})());
kontroll("32. r284 valjServerfonster: främmande server exkluderas + räknas ärligt", (() => {
  const { stangda } = lasFonster(BLANDAD);
  const v = valjServerfonster(stangda, os.hostname());
  return v.bevarade.length === 1 && v.bevarade[0].server === os.hostname()
    && v.exkluderadeServrar.get("contabo") === 1;
})());
kontroll("33. r284 valjServerfonster: otaggade fönster (äldre historia) bevaras", (() => {
  const { stangda } = lasFonster(FIXTUR_RADER); // fixturen är otaggad
  return valjServerfonster(stangda, os.hostname()).bevarade.length === 2;
})());
try {
  // section 5:s finally städade TMP — egen katalog för r284-fixturerna
  const TMP2 = fs.mkdtempSync(path.join(os.tmpdir(), "ak1a-trend-r284-"));
  const fixturFil2 = (namn, rader) => {
    const f = path.join(TMP2, namn);
    fs.writeFileSync(f, rader.map((r) => JSON.stringify(r)).join("\n") + "\n");
    return f;
  };
  const blandadFil = fixturFil2("blandad.jsonl", BLANDAD);
  const egen = JSON.parse(cli([blandadFil, "--json"]));
  kontroll(
    "34. r284 CLI: standard visar EGEN server — contabo-fönstret exkluderat med räknerad",
    egen.antalFonster === 1 && egen.serverfilter.vald === os.hostname()
      && JSON.stringify(egen.serverfilter.exkluderade) === JSON.stringify([["contabo", 1]]),
  );
  kontroll("35. r284 CLI: markdown bär SERVERFILTER-notisen", cli([blandadFil]).includes("SERVERFILTER"));
  const alla = JSON.parse(cli([blandadFil, "--json", "--alla-servrar"]));
  kontroll("36. r284 CLI: --alla-servrar visar allt utan filter", alla.antalFonster === 2 && alla.serverfilter.vald === null);
  kontroll(
    "37. r284 CLI: blandad trend LÄSER olika utan filtret — contabo 235 → ssdnodes 57000 = STIGER (falsk maskinvaru-trend, därför filtret)",
    JSON.parse(cli([blandadFil, "--json", "--alla-servrar"])).trend.riktning === "STIGER",
  );
  fs.rmSync(TMP2, { recursive: true, force: true });
} catch (e) {
  kontroll("34-37. r284 CLI-serverfilter", false, e.message.split("\n")[0]);
}

console.log(`\n${pass}/${pass + fail} PASS${fail ? " — FAIL: " + FEL.join(", ") : ""}`);
process.exit(fail ? 1 : 0);
