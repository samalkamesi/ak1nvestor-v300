#!/usr/bin/env node
// testa-feljakt-skriv-dom.mjs — svit för skrivgrinden (o145 §5).
// Eldprov mot isolerad tmp-katalog: fixture-fynd + tom ledger; verktyget och
// feljakt-lage.mjs anropas i execFileSync-ARRAYFORM (o133-doktrinen — skal-
// fria anrop). Två HYDRINGSFALL (H): verktyget ska aldrig kunna lämna
// fixture-katalogen i ett halvskrivet tillstånd.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERKTYG = path.join(ROT, "verktyg", "feljakt-skriv-dom.mjs");
const LAGE = path.join(ROT, "verktyg", "feljakt-lage.mjs");

let pass = 0, fail = 0;
const ok = (namn, villkor, detalj = "") => {
  if (villkor) { pass++; console.log(`  PASS ${namn}`); }
  else { fail++; console.log(`  FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
};

const kat = fs.mkdtempSync(path.join(os.tmpdir(), "feljakt-skrivdom-"));
const fyndFil = path.join(kat, "feljakt-fynd.jsonl");
const ledger = path.join(kat, "feljakt-bedomningar.jsonl");
const FYND1 = { ts: "2026-09-21T10:00:00.000Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "testloggen: felmönster på ny rad", bevis: "bevis A" };
const FYND2 = { ts: "2026-09-21T10:00:00.000Z", "spår": "F5-logg", allvar: "MEDEL", fynd: "testloggen: felmönster på helt annat vis", bevis: "bevis B" };
fs.writeFileSync(fyndFil, [FYND1, FYND2].map((f) => JSON.stringify(f)).join("\n") + "\n");

const kor = (args) => {
  try {
    const stdout = execFileSync("node", [VERKTYG, ...args, `--vaktkatalog=${kat}`], { encoding: "utf8" });
    return { kod: 0, json: JSON.parse(stdout.trim().split("\n").pop()) };
  } catch (e) {
    const stdout = String(e.stdout ?? "").trim();
    return { kod: e.status ?? 1, json: stdout ? JSON.parse(stdout.split("\n").pop()) : null };
  }
};
const ledgerRader = () => (fs.existsSync(ledger) ? fs.readFileSync(ledger, "utf8").split("\n").filter((r) => r.trim()) : []);

const EXAKT = `${FYND1.ts}|F5-logg|${FYND1.fynd}`;
const bas = ["--rotorsaka", "testrot", "--bevis", "testbevis", "--protokoll", "o145 §5"];

console.log("SVIT testa-feljakt-skriv-dom (o145 §5) — isolerad katalog:", kat);

// T1: fritext-dom avslås (o145 §2a-klassen)
let r = kor(["--fynd", EXAKT, "--dom", "äkta + LÄKT", ...bas]);
ok("T1 fritext-dom avslås", r.kod === 1 && /ogiltig dom/.test(r.json?.fel ?? ""), JSON.stringify(r.json));
ok("T1b inget skrivet", ledgerRader().length === 0);

// T2: nyckelglidning avslås (o145 §2b-klassen — hemgjord ts)
r = kor(["--fynd", "2026-09-21T99:99:99.000Z|F5-logg|" + FYND1.fynd, "--dom", "rotkurad", ...bas]);
ok("T2 gliden nyckel avslås", r.kod === 1 && /nyckelglidning/.test(r.json?.fel ?? ""), JSON.stringify(r.json));
ok("T2b inget skrivet", ledgerRader().length === 0);

// T3: exakt nyckel skrivs med KOPIERADE nyckelfält
r = kor(["--fynd", EXAKT, "--dom", "rotkurad", ...bas]);
const r3 = ledgerRader();
ok("T3 exakt nyckel skriven", r.kod === 0 && r.json?.ok === true);
if (r3.length === 1) {
  const j = JSON.parse(r3[0]);
  ok("T3b fält kopierade ur fyndraden", j.ts === FYND1.ts && j["spår"] === "F5-logg" && j.fynd === FYND1.fynd && j.allvar === "MEDEL");
  ok("T3c domdTs + stämpel", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(j.domdTs) && j.skrivverktyg?.includes("o145"));
} else ok("T3b fält kopierade", false, `${r3.length} rader`);

// T4: entydig prefix matchar (FYND2:s text avviker tidigt från FYND1:s)
r = kor(["--fynd", `${FYND2.ts}|F5-logg|testloggen: felmönster på helt`, "--dom", "transient-design", ...bas]);
ok("T4 prefix entydig skriven", r.kod === 0 && r.json?.metod === "prefix");

// T5: tvetydig PREFIX (olika nycklar delar prefix) avslås fortfarande
r = kor(["--fynd", `${FYND1.ts}|F5-logg|testloggen: felmönster`, "--dom", "falskt-pos", ...bas]);
const fore = ledgerRader().length;
ok("T5 tvetydig avslås", r.kod === 1 && /OLIKA fyndrader/.test(r.json?.fel ?? ""), JSON.stringify(r.json));
ok("T5b inget skrivet", ledgerRader().length === fore);

// T6: append är icke-destruktiv — endast +1 rad per skrivning
const fore6 = ledgerRader().length;
kor(["--fynd", EXAKT, "--dom", "pagaende", ...bas]);
ok("T6 append +1 endast", ledgerRader().length === fore6 + 1);

// H1: korrupt ledger (saknar slutradsbryt) vägras — antal rader oförändrat
fs.writeFileSync(ledger, ledgerRader().join("\n")); // slita brytningen medvetet
const foreH1 = ledgerRader().length;
r = kor(["--fynd", EXAKT, "--dom", "rotkurad", ...bas]);
ok("H1 ledgrad utan bryt vägras", r.kod === 1 && /radbrytning/.test(r.json?.fel ?? ""), JSON.stringify(r.json));
ok("H1b inga nya rader vid korrupt läge", ledgerRader().length === foreH1);

// T7: INTEGRATION — färsk skrivning + feljakt-lage räknar domen
fs.writeFileSync(fyndFil, [FYND1, FYND2].map((f) => JSON.stringify(f)).join("\n") + "\n");
fs.writeFileSync(ledger, ledgerRader().join("\n") + "\n");
kor(["--fynd", EXAKT, "--dom", "rotkurad", ...bas]);
kor(["--fynd", `${FYND2.ts}|F5-logg|${FYND2.fynd}`, "--dom", "transient-design", ...bas]);
const lageUt = execFileSync("node", [LAGE, `--vaktkatalog=${kat}`], { encoding: "utf8" });
ok("T7 lage läser båda domer (öppna 0)", /ÖPPNA ÄKTA: 0\b/.test(lageUt), lageUt.split("\n").find((l) => l.includes("ÖPPNA")) ?? "");
ok("T7b inga skral-varningar", !/ogiltig domklass/.test(lageUt));

// T8: o69-KOLLISIONSGRUPP — två IDENTISKA fyndrader: exakt nyckel matchar båda,
// basdom (utan bevisHash) är KONTRAKTET som täcker hela gruppen i lage —
// tillåts med antalTäckta-kvitto, och lage räknar BÅDA som bedömda.
fs.appendFileSync(fyndFil, JSON.stringify(FYND1) + "\n"); // nu: FYND1 ×2 + FYND2
r = kor(["--fynd", `${FYND1.ts}|F5-logg|${FYND1.fynd}`, "--dom", "pagaende", ...bas]);
ok("T8 kollisionsgrupp-basdom tillåts", r.kod === 0 && r.json?.metod === "kollisionsgrupp" && r.json?.antalTäckta === 2, JSON.stringify(r.json));
const lageT8 = execFileSync("node", [LAGE, `--vaktkatalog=${kat}`], { encoding: "utf8" });
ok("T8b lage: gruppen rapporterad + täckt", /2 rader, 2 täckta av bedömning/.test(lageT8), lageT8.split("\n").find((l) => l.includes("F5-logg")) ?? "");

// H2: okänd nyckel — verktyget lämnar katalogen hel (flyttas sist: raderar ledgern)
fs.rmSync(ledger, { force: true });
r = kor(["--fynd", "finns-ej|i-nagon-log|overhuvud", "--dom", "rotkurad", ...bas]);
ok("H2 okänd nyckel lämnar hel katalog", r.kod === 1 && !fs.existsSync(ledger));

console.log(`\nSVIT klar: ${pass} PASS · ${fail} FAIL`);
fs.rmSync(kat, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
