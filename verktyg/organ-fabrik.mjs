#!/usr/bin/env node
/**
 * ORGAN-FABRIKEN (våg 109) — det evolutionära organsystemet
 * =====================================================================
 * Kundens direktiv 2026-09-12: "ai styrelse nya organ från a till ö…
 * dåliga organ makro som mikro skall ha högst integration… de organ som
 * är dåliga skall bort… cell föds och cell dör, de bästa cellerna
 * överlever längst… alltid optimera och rensa och komprimera."
 *
 * Evolutionsreglerna (objektiva, mätta på LANDADE RESULTAT):
 *   · FITNESS = commits landade i prod sedan senaste rond, tillskrivna
 *     organet via taggen [organ:X] i commit-meddelandet (fallback:
 *     ronden fördelar otaggade commits jämnt på aktiva organ).
 *   · DÖD: organ med 0 leveranser under 2 KONSEKUTIVA ronder ⇒ status
 *     "död" (arkiveras med obduktionsrad i registret).
 *   · FÖDELSE: rondens bästa organ föder ett BARN (nästa lediga bokstav
 *     A-Ö) med ett avgränsat deluppdrag ur förälderns uppdrag.
 *   · MAX AKTIVA: 12 organ ( mikro-integrationen: flera små > ett stort).
 *
 * Registret: data/forskning/organ-registret.json · Körs av styrelse-rond.mjs
 * Fristående körning: node verktyg/organ-fabrik.mjs            (endast rapport)
 *                     node verktyg/organ-fabrik.mjs --evolvera (uppdaterar)
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REGISTER = path.join(ROT, "data", "forskning", "organ-registret.json");
const EVOLVERA = process.argv.includes("--evolvera");

// Svenska alfabetet A-Ö (organ-namnslag enligt kundens "från a till ö")
const BOKSTAVER = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ".split("");

/** Startorganen (våg 109): de åtta klassiska + missionsformuleringar. */
function froOrgan() {
  const fro = [
    { bokstav: "A", namn: "Alfa-strategi", uppdrag: "Prioritera nästa våg efter affärsvärde; äger målkön" },
    { bokstav: "B", namn: "Beta-analys", uppdrag: "AKM1/AK1TS-metodikens djup; analysmotorer" },
    { bokstav: "D", namn: "Delta-data", uppdrag: "Datasidor, datakvalitet, insamling" },
    { bokstav: "O", namn: "Omega-vision", uppdrag: "Arkitektur och långsiktig integration (kroppen)" },
    { bokstav: "F", namn: "Fi-innovation", uppdrag: "Nya system; portalen och organtekniken" },
    { bokstav: "T", namn: "Theta-kvalitet", uppdrag: "Vakt, tester, tsc, kontrahällning" },
    { bokstav: "M", namn: "My-marknad", uppdrag: "SEO, granskningskö, konvertering" },
    { bokstav: "P", namn: "Psi-utbildning", uppdrag: "Kurser, mentor, lärvägar" },
  ];
  return fro.map((o) => ({
    ...o,
    status: "aktiv",
    fodd: new Date().toISOString().slice(0, 10),
    dod: null,
    leveranserSista2: [0, 0],
    totaltLeveranser: 0,
    foralder: null,
    obduktion: null,
  }));
}

function lasRegister() {
  try {
    return JSON.parse(fs.readFileSync(REGISTER, "utf8"));
  } catch {
    return { rond: 0, senasteRondTs: 0, organ: froOrgan(), historik: [] };
  }
}

/** Commits i prod sedan UNIX-ms; tillskrivning via [organ:X]-tagg.
 *  (execFileSync = skal-fritt: %-koder i --pretty klarar cmd.exe.) */
function lasCommitsSedan(sedanMs) {
  const sedanIso = new Date(sedanMs).toISOString();
  try {
    const ut = execFileSync(
      "git",
      ["log", `--since=${sedanIso}`, "--pretty=format:%h|%s"],
      { cwd: ROT, encoding: "utf8", timeout: 10_000 },
    );
    return ut
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((rad) => {
        const [hash, ...amne] = rad.split("|");
        const amneStr = amne.join("|");
        const tagg = amneStr.match(/\[organ:([A-ZÅÄÖ])\]/i);
        return { hash, organ: tagg ? tagg[1].toUpperCase() : null, amne: amneStr.slice(0, 100) };
      });
  } catch {
    return [];
  }
}

function evolvera() {
  const reg = lasRegister();
  const commits = lasCommitsSedan(reg.senasteRondTs || Date.now() - 3 * 3600_000);
  const aktiva = reg.organ.filter((o) => o.status === "aktiv");

  // VÅG 112 — KOSTNADS-FITNESS (arXiv 2408.11198 / ACL 2025): tokens per
  // landad commit denna rond ur kostnads-loggen (rondens kontext-event).
  let tokensDennaRond = 0;
  try {
    const logg = JSON.parse(fs.readFileSync(path.join(ROT, "data", "vakten", "kostnad-log.json"), "utf8"));
    const forra = logg.filter((l) => l.ts <= reg.senasteRondTs).slice(-1)[0];
    const nu = logg.slice(-1)[0];
    if (forra && nu && nu.totalTokens >= forra.totalTokens) {
      tokensDennaRond = nu.totalTokens - forra.totalTokens;
    }
  } catch { /* loggen byggs upp — första ronden saknar delta */ }
  const tokensPerLeverans = commits.length > 0 ? Math.round(tokensDennaRond / commits.length) : null;

  // 1) Räkna leveranser (taggade direkt; otaggade jämnt på aktiva)
  const otaggade = commits.filter((c) => !c.organ);
  for (const o of reg.organ) {
    const direkt = commits.filter((c) => c.organ === o.bokstav).length;
    const andel = aktiva.length > 0 ? otaggade.length / aktiva.length : 0;
    const nu = direkt + (aktiva.some((a) => a.bokstav === o.bokstav) ? andel : 0);
    if (o.status === "aktiv") {
      o.leveranserSista2 = [nu, o.leveranserSista2[0]];
      o.totaltLeveranser += nu;
    }
  }

  // 2) DÖD: 0 leveranser två ronder i rad
  const doda = [];
  for (const o of reg.organ) {
    if (o.status === "aktiv" && o.leveranserSista2[0] === 0 && o.leveranserSista2[1] === 0 && reg.rond >= 2) {
      o.status = "död";
      o.dod = new Date().toISOString().slice(0, 10);
      o.obduktion = `0 leveranser under rond ${reg.rond - 1}-${reg.rond} — döden enligt § evolution`;
      doda.push(o);
    }
  }

  // 3) FÖDELSE: bästa aktiva organet föder barn i nästa lediga bokstav
  const levande = reg.organ.filter((o) => o.status === "aktiv");
  const bokstavslag = levande.map((o) => o.bokstav);
  const foralder = [...levande].sort((a, b) => b.leveranserSista2[0] - a.leveranserSista2[0])[0];
  const nyBokstav = BOKSTAVER.find((b) => !reg.organ.some((o) => o.bokstav === b));
  const fodd = [];
  if (foralder && foralder.leveranserSista2[0] > 0 && nyBokstav && levande.length < 12) {
    const barn = {
      bokstav: nyBokstav,
      namn: `${nyBokstav}-${foralder.namn.split("-")[1]}-barn`,
      uppdrag: `Deluppdrag ur ${foralder.namn}: ${foralder.uppdrag.split(";")[0]} — mikrofokuserat`,
      status: "aktiv",
      fodd: new Date().toISOString().slice(0, 10),
      dod: null,
      leveranserSista2: [0, 0],
      totaltLeveranser: 0,
      foralder: foralder.bokstav,
      obduktion: null,
    };
    reg.organ.push(barn);
    fodd.push(barn);
  }

  reg.rond += 1;
  reg.senasteRondTs = Date.now();
  reg.kostnad = {
    tokensSistaRond: tokensDennaRond,
    tokensPerLeverans: tokensPerLeverans,
    tokensTotalt: (reg.kostnad?.tokensTotalt ?? 0) + tokensDennaRond,
  };
  reg.historik.push({
    rond: reg.rond,
    commits: commits.length,
    tokens: tokensDennaRond,
    doda: doda.map((o) => o.bokstav),
    fodd: fodd.map((o) => o.bokstav),
  });
  reg.historik = reg.historik.slice(-50);
  fs.mkdirSync(path.dirname(REGISTER), { recursive: true });
  fs.writeFileSync(REGISTER, JSON.stringify(reg, null, 2));
  return { reg, commits, doda, fodd, foralder };
}

// ── Huvud ────────────────────────────────────────────────────────────────────
// Endast --evolvera uppdaterar registret; utan flagga = ren läsrapport.
let resultat;
if (EVOLVERA) {
  resultat = evolvera();
} else {
  const reg = lasRegister();
  const commits = lasCommitsSedan(reg.senasteRondTs || Date.now() - 3 * 3600_000);
  resultat = { reg, commits, doda: [], fodd: [], foralder: null };
}
const { reg, commits, doda, fodd, foralder } = resultat;
const aktiva = reg.organ.filter((o) => o.status === "aktiv");
const totalt = commits.length;

const sammanfattning = [
  `ROND ${reg.rond} · ${totalt} commits landade sedan förra ronden` +
    (reg.kostnad?.tokensPerLeverans
      ? ` · ekonomi: ${reg.kostnad.tokensSistaRond.toLocaleString("sv-SE")} tokens ≈ ${reg.kostnad.tokensPerLeverans.toLocaleString("sv-SE")} tokens/leverans`
      : ""),
  ...commits.slice(0, 6).map((c) => `  ${c.hash} ${c.organ ? "[" + c.organ + "] " : ""}${c.amne}`),
  doda.length ? `DÖDA denna evolution: ${doda.map((o) => o.bokstav + " " + o.namn).join(", ")}` : "Inga döda (grundnåd första ronden)",
  fodd.length ? `FÖDDA: ${fodd.map((o) => o.bokstav + " " + o.namn).join(", ")}` : "Inga födda (ingen leverans att dela av)",
  foralder ? `Bästa organ: ${foralder.bokstav} ${foralder.namn} (${foralder.leveranserSista2[0]} leveranser)` : "",
  `Aktiva organ (${aktiva.length}/12): ${aktiva.map((o) => o.bokstav).join(" ")}`,
].filter(Boolean).join("\n");

console.log(sammanfattning);
if (!EVOLVERA) {
  console.log("\n(ENDAST RAPPORT — kör med --evolvera från ronden för att uppdatera registret)");
}
export { sammanfattning };
