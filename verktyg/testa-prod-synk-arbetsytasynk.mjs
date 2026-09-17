#!/usr/bin/env node
/**
 * TEST: prod-synk AGENTARBETSYTA-SYNK (s8-u1/o33 påbörjad; färdigställd +
 * rotSha-buggen lagad s8-u3/o43 2026-09-17 — sviten 29/30 → 34/34 med
 * untracked-falsklarmsfixture D)
 * ====================================================================
 * Enhet: unionLosMarkorer · sakraUnionAttributInnehall · forklaraGitFel
 * Integration (tmp-repon, ALDRIG riktiga ytor): tre scenarier mappade mot
 * det bevisade 2026-09-16-fallet (rond 50:s döda merge) + dess grannar.
 * Körs: node verktyg/testa-prod-synk-arbetsytasynk.mjs (offline, kräver git).
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import {
  unionLosMarkorer,
  sakraUnionAttributInnehall,
  forklaraGitFel,
  synkaArbetsyta,
} from "./prod-synk.mjs";

let pass = 0;
let fail = 0;
const fel = [];

function kolla(namn, villkor, detalj = "") {
  if (villkor) {
    pass += 1;
    console.log(`  PASS ${namn}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`);
    fel.push(namn);
  }
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", timeout: 60_000 }).trim();
}

/** tmp-repopar (rot + klonad yta) med worklog-bas — returnerar {rot, yta}. */
function nyttRepopar(namn) {
  const rot = fs.mkdtempSync(path.join(os.tmpdir(), `s8u1-${namn}-rot-`));
  git(["init", "-q", "-b", "develop"], rot);
  git(["config", "user.email", "vakt@test.local"], rot);
  git(["config", "user.name", "vakt-test"], rot);
  fs.writeFileSync(path.join(rot, "worklog.md"), "# worklog\nrad-bas\n");
  git(["add", "worklog.md"], rot);
  git(["commit", "-q", "-m", "bas"], rot);
  const yta = path.join(os.tmpdir(), `s8u1-${namn}-yta-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
  git(["clone", "-q", rot, yta]);
  git(["config", "user.email", "vakt@test.local"], yta);
  git(["config", "user.name", "vakt-test"], yta);
  return { rot, yta };
}

function stada(...stycken) {
  for (const s of stycken) fs.rmSync(s, { recursive: true, force: true });
}

console.log("TEST prod-synk-arbetsytasynk (s8-u1/o33)");

// ---------------------------------------------------------------- enhet
console.log("Enhet: unionLosMarkorer");
{
  const ettBlock = "före\n<<<<<<< HEAD\nvår rad\n=======\nderas rad\n>>>>>>> f3a574ba\nefter";
  const r1 = unionLosMarkorer(ettBlock);
  kolla("ett block → vår före deras, markörer borta", r1.text === "före\nvår rad\nderas rad\nefter" && r1.block === 1, JSON.stringify(r1));
  const tvaBlock = "<<<<<<< HEAD\nA\n=======\nB\n>>>>>>> x\nmellan\n<<<<<<< HEAD\nC\n=======\nD\n>>>>>>> y";
  const r2 = unionLosMarkorer(tvaBlock);
  kolla("två block → alla fyra sidrader", r2.text === "A\nB\nmellan\nC\nD" && r2.block === 2, JSON.stringify(r2));
  const diff3 = "<<<<<<< HEAD\nvår\n||||||| bas\nbas-rader\n=======\nderas\n>>>>>>> z";
  const r3 = unionLosMarkorer(diff3);
  kolla("diff3-stil: basblocket ägs ingen (union = vår+deras)", r3.text === "vår\nderas" && r3.block === 1, JSON.stringify(r3));
  const ren = "ingen konflikt alls";
  const r4 = unionLosMarkorer(ren);
  kolla("markörfri text oförändrad, block 0", r4.text === ren && r4.block === 0);
  let kastad = false;
  try { unionLosMarkorer("<<<<<<< HEAD\nvår\n=======\nderas\n"); } catch { kastad = true; }
  kolla("oavslutat block kastar (vägrar tyst halvlösning)", kastad);
  const tomVar = "<<<<<<< HEAD\n=======\nderas sida\n>>>>>>> q";
  const r5 = unionLosMarkorer(tomVar);
  kolla("tom vår-sida bevarar deras sida", r5.text === "deras sida" && r5.block === 1, JSON.stringify(r5));
}

console.log("Enhet: sakraUnionAttributInnehall");
{
  const ny = sakraUnionAttributInnehall("");
  kolla("tom fil → rad skapas", ny !== null && /^worklog\.md merge=union$/m.test(ny), JSON.stringify(ny));
  kolla("rad finns → null (idempotent)", sakraUnionAttributInnehall("x\nworklog.md merge=union\n") === null);
  const utanNl = sakraUnionAttributInnehall("# Kommentar utan radslut");
  kolla("saknad slutnewline → prefixas (ingen sammanklistrad rad)", utanNl !== null && utanNl.includes("\n# s8-u1/o33") && !utanNl.includes("radslut#"), JSON.stringify(utanNl));
}

console.log("Enhet: forklaraGitFel");
{
  const e = Object.assign(new Error("Command failed: git pull"), { stderr: "error: Pulling is not possible because you have unmerged files.\nhint: Fix" });
  const f = forklaraGitFel(e);
  kolla("stderr bär roten, whitespace kollapsat, en rad", f.includes("unmerged files") && !f.includes("\n"), JSON.stringify(f));
  kolla("utan stderr → message används", forklaraGitFel(new Error("x")).includes("x"));
  kolla("tomt fel → okänt fel", forklaraGitFel("") === "okänt fel");
}

// -------------------------------------------------------- integration
console.log("Integration A: död merge med worklog-konflikt (rond 50-fallet)");
{
  const { rot, yta } = nyttRepopar("a");
  try {
    fs.appendFileSync(path.join(rot, "worklog.md"), "rad-ROT\n");
    git(["add", "worklog.md"], rot);
    git(["commit", "-q", "-m", "rot framåt"], rot);

    fs.appendFileSync(path.join(yta, "worklog.md"), "rad-YTA\n");
    git(["add", "worklog.md"], yta);
    git(["commit", "-q", "-m", "yta bokföring"], yta);
    git(["fetch", "-q", rot, "develop"], yta);
    let konflikt = false;
    try { git(["merge", "FETCH_HEAD"], yta); } catch { konflikt = true; }
    kolla(
      "fixture: merge skapar worklog-konflikt",
      konflikt && fs.existsSync(path.join(yta, ".git", "MERGE_HEAD"))
        && git(["diff", "--name-only", "--diff-filter=U"], yta) === "worklog.md",
    );

    const satt = synkaArbetsyta(yta, rot);
    kolla("sätt: död merge union-löst + avrundad", satt.includes("död merge union-löst"), satt);
    const wl = fs.readFileSync(path.join(yta, "worklog.md"), "utf8");
    kolla("worklog: BÅDA sidor bevarade", wl.includes("rad-YTA") && wl.includes("rad-ROT"), JSON.stringify(wl));
    kolla("worklog: kronologi vår före deras", wl.indexOf("rad-YTA") < wl.indexOf("rad-ROT"));
    kolla("inga konfliktmarkörer kvar", !wl.includes("<<<<<<<"));
    kolla("MERGE_HEAD borta (ytan levande igen)", !fs.existsSync(path.join(yta, ".git", "MERGE_HEAD")));
    kolla("status ren (merge-avrundad, inget lämnat)", git(["status", "--porcelain"], yta) === "");
    const attr = fs.readFileSync(path.join(yta, ".gitattributes"), "utf8");
    kolla(".gitattributes union-rad committad i ytan", /^worklog\.md merge=union$/m.test(attr) && !git(["status", "--porcelain"], yta).includes(".gitattributes"));
  } finally {
    stada(rot, yta);
  }
}

console.log("Integration B: divergens utan dött läge → merge-vägen (union-skyddad)");
{
  const { rot, yta } = nyttRepopar("b");
  try {
    fs.appendFileSync(path.join(yta, "worklog.md"), "yta-rad\n");
    git(["add", "worklog.md"], yta);
    git(["commit", "-q", "-m", "yta bokföring 2"], yta);

    fs.appendFileSync(path.join(rot, "worklog.md"), "rot-rad\n");
    git(["add", "worklog.md"], rot);
    git(["commit", "-q", "-m", "rot framåt 2"], rot);

    const satt = synkaArbetsyta(yta, rot);
    kolla("sätt: merge-vägen (ff-only otillräcklig)", satt.includes("merge"), satt);
    const wl = fs.readFileSync(path.join(yta, "worklog.md"), "utf8");
    kolla("worklog: båda sidorna med (auto eller kur)", wl.includes("yta-rad") && wl.includes("rot-rad"), JSON.stringify(wl));
    kolla("status ren efter synk", git(["status", "--porcelain"], yta) === "");
    const rotSha = git(["rev-parse", "HEAD"], rot);
    kolla("ytan innehåller rot-HEAD (ikapp)", (() => {
      try { git(["merge-base", "--is-ancestor", rotSha, "HEAD"], yta); return true; } catch { return false; }
    })());

    const satt2 = synkaArbetsyta(yta, rot);
    kolla("idempotent: andra körningen ff/already utan spår", !satt2.includes("död merge"), satt2);
    kolla("worklog oförändrad vid andra körningen", fs.readFileSync(path.join(yta, "worklog.md"), "utf8") === wl);
  } finally {
    stada(rot, yta);
  }
}

console.log("Integration C: död merge med FRÄMMANDE konflikt → vägras, ytan orörd");
{
  const { rot, yta } = nyttRepopar("c");
  try {
    fs.writeFileSync(path.join(rot, "fil.txt"), "rot-version\n");
    git(["add", "fil.txt"], rot);
    git(["commit", "-q", "-m", "rot ändrar främmande fil"], rot);

    fs.writeFileSync(path.join(yta, "fil.txt"), "yta-version\n");
    git(["add", "fil.txt"], yta);
    git(["commit", "-q", "-m", "yta ändrar samma fil"], yta);
    git(["fetch", "-q", rot, "develop"], yta);
    let konflikt = false;
    try { git(["merge", "FETCH_HEAD"], yta); } catch { konflikt = true; }
    kolla(
      "fixture: konflikt i främmande fil",
      konflikt && fs.existsSync(path.join(yta, ".git", "MERGE_HEAD"))
        && git(["diff", "--name-only", "--diff-filter=U"], yta).includes("fil.txt"),
    );

    let kastad = false;
    let medd = "";
    try { synkaArbetsyta(yta, rot); } catch (e) { kastad = true; medd = String(e.message); }
    kolla("vägrar auto-lösa främmande fil (kastar)", kastad, medd);
    kolla("felmeddelande namnger FILen (rotorsaka synlig)", medd.includes("fil.txt"), medd);
    kolla("död merge-läget lämnas ORÖRT (ägande = nästa rond)", fs.existsSync(path.join(yta, ".git", "MERGE_HEAD")));
  } finally {
    stada(rot, yta);
  }
}

console.log("Integration D: untrackade skrivfiler (rond-skrap, live-klassen 2026-09-17) → synk hindras EJ");
{
  const { rot, yta } = nyttRepopar("d");
  try {
    fs.appendFileSync(path.join(rot, "worklog.md"), "rot-ny-rad\n");
    git(["add", "worklog.md"], rot);
    git(["commit", "-q", "-m", "rot framåt 3"], rot);
    fs.writeFileSync(path.join(yta, "_r54-skratch.mjs"), "rond-skrivfil");
    let kastad = false;
    let satt = "";
    try { satt = synkaArbetsyta(yta, rot); } catch (e) { kastad = true; satt = String(e.message); }
    kolla("untrackad fil blockerar ej (falsklarmsklassen kurerad)", !kastad, satt);
    const wl = fs.readFileSync(path.join(yta, "worklog.md"), "utf8");
    kolla("worklog ikapp med rot trots skriven", wl.includes("rot-ny-rad"));
    kolla("untrackad fil orörd (skyddad)", fs.existsSync(path.join(yta, "_r54-skratch.mjs")));
    kolla(
      "status = ENDAST den untrackade raden (inget läckt in i synken)",
      git(["status", "--porcelain"], yta) === "?? _r54-skratch.mjs",
      git(["status", "--porcelain"], yta),
    );
  } finally {
    stada(rot, yta);
  }
}

console.log(`\nTEST prod-synk-arbetsytasynk: ${pass}/${pass + fail} PASS${fail ? " — " + fail + " FAIL: " + fel.join(", ") : ""}`);
process.exit(fail === 0 ? 0 : 1);
