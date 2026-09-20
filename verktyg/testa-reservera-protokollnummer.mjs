#!/usr/bin/env node
// testa-reservera-protokollnummer.mjs — svit för verktyg/reservera-protokollnummer.mjs
// (nummerreservationsmekaniken: flock-atomisk reservation, källskannings-
// säkerhetsnät, återanvändningsförbud, race-bevis med två parallella processer).
// Allt körs mot fixtures i OS-tmp (mkdtemp) — repet och prod berörs aldrig.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const VERKTYG = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "reservera-protokollnummer.mjs"
);
const ARBETE = fs.mkdtempSync(path.join(os.tmpdir(), "nummerreserv-svit-"));

let pass = 0;
let fail = 0;
let skip = 0;
function rapport(nr, namn, ok, detalj = "") {
  if (ok) {
    pass += 1;
    console.log(`PASS ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  } else {
    fail += 1;
    console.log(`FAIL ${nr} ${namn}${detalj ? ` — ${detalj}` : ""}`);
  }
}
function rapportSkip(nr, namn, detalj) {
  skip += 1;
  console.log(`SKIP ${nr} ${namn} — ${detalj}`);
}

// --- fixture: kända nummer o106/o114 (protokollfilnamn), o113/o114 (worklog),
// o112 (anspråksfil namn + innehåll); nästa lediga = o115 --------------------
function byggFixture() {
  const rot = fs.mkdtempSync(path.join(ARBETE, "kallor-"));
  const opt = path.join(rot, "data", "forskning", "OPTIMERING");
  const vakten = path.join(rot, "data", "vakten");
  fs.mkdirSync(opt, { recursive: true });
  fs.mkdirSync(vakten, { recursive: true });
  fs.writeFileSync(path.join(opt, "o106-tsc-grind-patchko-s8.md"), "# o106\n");
  fs.writeFileSync(path.join(opt, "o114-ts-import-konsolidering-s8.md"), "# o114\n");
  fs.writeFileSync(
    path.join(rot, "worklog.md"),
    "rad1 … protokoll o113 levererat …\nrad2 … o114 dubbelbokat …\n"
  );
  fs.writeFileSync(
    path.join(vakten, "auto-exempel-s8-u1-ansprak-o112-react-kvitto.md"),
    "# anspråk o112 — react-familjens efterbörder\n"
  );
  const reserv = fs.mkdtempSync(path.join(ARBETE, "reserv-"));
  return { rot, reserv };
}
function kor(args, { rot, reserv }, extraEnv = {}) {
  const r = spawnSync(process.execPath, [VERKTYG, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      AK1A_NUMMERRESERV_KALLOR: rot,
      AK1A_NUMMERRESERV_KATALOG: reserv,
      ...extraEnv,
    },
  });
  let json = null;
  try {
    json = JSON.parse((r.stdout || "").trim().split("\n").pop());
  } catch {
    // ogiltig/none — testerna fångar det
  }
  return { kod: r.status, json, stderr: r.stderr || "" };
}
const korAsync = promisify((args, miljo, cb) => {
  const barn = spawn(
    process.execPath,
    [VERKTYG, ...args],
    { env: miljo, stdio: ["ignore", "pipe", "pipe"] }
  );
  let ut = "";
  let err = "";
  barn.stdout.on("data", (d) => (ut += d));
  barn.stderr.on("data", (d) => (err += d));
  barn.on("close", (kod) => cb(null, { kod, ut, err }));
});

// --- A: argumentvalidering ---------------------------------------------------
{
  const f = byggFixture();
  rapport("A1", "inget kommando = avslag kod 2", kor([], f).kod === 2);
  rapport("A2", "flera kommandon = avslag kod 2", kor(["--lista", "--nästa", "--ägare", "x"], f).kod === 2);
  rapport("A3", "ogiltigt nummer (x99) = kod 2", kor(["--ta", "x99", "--ägare", "x"], f).kod === 2);
  rapport("A4", "nummer utan o-prefix = kod 2", kor(["--ta", "116", "--ägare", "x"], f).kod === 2);
  rapport("A5", "--ägare saknas = kod 2", kor(["--nästa"], f).kod === 2);
}

// --- B: nästa lediga räknas ur ALLA källor ------------------------------------
{
  const f = byggFixture();
  const r = kor(["--nästa", "--ägare", "s8-u1", "--titel", "test"], f);
  rapport(
    "B1",
    "--nästa = o115 (max kända o114 från filnamn/worklog + o112 anspråk)",
    r.kod === 0 && r.json?.nummer === "o115",
    `kod=${r.kod} nummer=${r.json?.nummer} hogstaKanda=${r.json?.hogstaKanda}`
  );
}

// --- C: reservation, kollision, idempotens ------------------------------------
{
  const f = byggFixture();
  const rA = kor(["--nästa", "--ägare", "agent-A"], f);
  rapport("C1", "agent A reserverar o115", rA.json?.nummer === "o115", `nummer=${rA.json?.nummer}`);
  const rB = kor(["--ta", "o115", "--ägare", "agent-B"], f);
  rapport(
    "C2",
    "agent B:s --ta o115 avslås (reserverat av A)",
    rB.kod === 1 && /agent-A/.test(rB.json?.fel ?? ""),
    `kod=${rB.kod} fel=${rB.json?.fel}`
  );
  const rA2 = kor(["--ta", "o115", "--ägare", "agent-A"], f);
  rapport(
    "C3",
    "agent A:s omkörning --ta o115 = idempotent (redan-din)",
    rA2.kod === 0 && rA2.json?.idempotent === true,
    `kod=${rA2.kod}`
  );
  const rk = kor(["--kontrollera", "o115", "--ägare", "agent-A"], f);
  rapport("C4", "kontrollera: rätt ägare = exit 0", rk.kod === 0 && rk.json?.din === true);
  const rk2 = kor(["--kontrollera", "o115", "--ägare", "agent-B"], f);
  rapport("C5", "kontrollera: fel ägare = exit 1", rk2.kod === 1);
}

// --- D: källskanningen som säkerhetsnät ---------------------------------------
{
  const f = byggFixture();
  const r = kor(["--ta", "o110", "--ägare", "agent-A"], f);
  // o110 finns inte i fixtures — men o106/o113/o114 gör det; testa känt ur worklog
  const r2 = kor(["--ta", "o113", "--ägare", "agent-A"], f);
  rapport(
    "D1",
    "--ta o113 (känt ur worklog) avslås med källhänvisning",
    r2.kod === 1 && /förekommer redan i trädet/.test(r2.json?.fel ?? ""),
    `kod=${r2.kod} fel=${r2.json?.fel}`
  );
  rapport("D2", "--ta o110 (okänt, ledigt) går bra", r.kod === 0 && r.json?.nummer === "o110", `kod=${r.kod}`);
}

// --- E: lämna + återanvändningsförbud -----------------------------------------
{
  const f = byggFixture();
  kor(["--nästa", "--ägare", "agent-A"], f); // o115
  kor(["--nästa", "--ägare", "agent-B"], f); // o116
  const rl = kor(["--lämna", "o115", "--ägare", "agent-B"], f);
  rapport("E1", "lämna av fel ägare = exit 1", rl.kod === 1);
  const rl2 = kor(["--lämna", "o115", "--ägare", "agent-A"], f);
  rapport("E2", "lämna av ägaren = exit 0", rl2.kod === 0 && rl2.json?.status === "lamnat");
  const rt = kor(["--ta", "o115", "--ägare", "agent-B"], f);
  rapport(
    "E3",
    "lämnat nummer går INTE att ta igen (förbrukat)",
    rt.kod === 1 && /förbrukat/.test(rt.json?.fel ?? ""),
    `kod=${rt.kod} fel=${rt.json?.fel}`
  );
  const rn = kor(["--nästa", "--ägare", "agent-C"], f);
  rapport(
    "E4",
    "--nästa efter lämning ger o117 (aldrig återanvändning av o115)",
    rn.json?.nummer === "o117",
    `nummer=${rn.json?.nummer}`
  );
  const rls = kor(["--lista"], f);
  const poster = rls.json?.poster ?? [];
  rapport(
    "E5",
    "--lista visar aktiva + lämnade (3 poster, varav 1 lamnat)",
    poster.length === 3 && poster.filter((p) => p.status === "lamnat").length === 1,
    `poster=${poster.length}`
  );
}

// --- F: RACE-BEVIS — två parallella processer --nästa samtidigt ----------------
for (let i = 1; i <= 3; i += 1) {
  const f = byggFixture();
  const miljo = {
    ...process.env,
    AK1A_NUMMERRESERV_KALLOR: f.rot,
    AK1A_NUMMERRESERV_KATALOG: f.reserv,
  };
  const [rA, rB] = await Promise.all([
    korAsync(["--nästa", "--ägare", "race-A"], miljo),
    korAsync(["--nästa", "--ägare", "race-B"], miljo),
  ]);
  const jA = JSON.parse(rA.ut.trim().split("\n").pop());
  const jB = JSON.parse(rB.ut.trim().split("\n").pop());
  const fil = JSON.parse(fs.readFileSync(path.join(f.reserv, "protokollnummer.json"), "utf8"));
  const aktiva = fil.poster.filter((p) => p.status === "reserverat");
  rapport(
    `F${i}`,
    `race omgång ${i}: olika nummer (${jA.nummer}/${jB.nummer}), båda gröna, filen bär 2 aktiva poster`,
    rA.kod === 0 && rB.kod === 0 &&
      jA.nummer !== jB.nummer &&
      [jA.nummer, jB.nummer].sort().join(",") === "o115,o116" &&
      aktiva.length === 2,
    `A=${jA.nummer} B=${jB.nummer} aktiva=${aktiva.length}`
  );
}

// --- G: korrupt reservationsfil backas upp, aldrig dödar vakten -----------------
{
  const f = byggFixture();
  fs.writeFileSync(path.join(f.reserv, "protokollnummer.json"), "{{{ inte json");
  const r = kor(["--lista"], f);
  const backuper = fs.readdirSync(f.reserv).filter((n) => n.startsWith("protokollnummer.korrupt-"));
  rapport(
    "G1",
    "korrupt fil → backup skapad + tomt läger exit 0",
    r.kod === 0 && backuper.length === 1 && (r.json?.poster ?? []).length === 0,
    `kod=${r.kod} backuper=${backuper.length}`
  );
}

// --- H: låshärdning — levande lås väntas, dött stale-lås rivs -------------------
{
  const f = byggFixture();
  const lasKat = path.join(f.reserv, ".protokollnummer.lock.d");
  // levande lås: vår EGEN pid, färsk mtime → verktyget får VÄNTA sig ur (kort tak)
  fs.mkdirSync(lasKat);
  fs.writeFileSync(path.join(lasKat, "info.json"), JSON.stringify({ pid: process.pid, ts: Date.now() }));
  const rLevande = kor(["--lista"], f, { AK1A_NUMMERRESERV_LASVANT: "700" });
  rapport(
    "H1",
    "levande lås (egen pid) rivs INTE → låsfel exit 3 efter taket",
    rLevande.kod === 3 && fs.existsSync(lasKat),
    `kod=${rLevande.kod} låsKvar=${fs.existsSync(lasKat)}`
  );
  fs.rmSync(lasKat, { recursive: true, force: true });
  // dött stale-lås: fantasipid + mtime 60 s bakåt → rivs och jobbet går
  fs.mkdirSync(lasKat);
  fs.writeFileSync(path.join(lasKat, "info.json"), JSON.stringify({ pid: 999999999, ts: Date.now() }));
  const gammal = new Date(Date.now() - 60_000);
  fs.utimesSync(lasKat, gammal, gammal);
  const rStale = kor(["--lista"], f);
  rapport(
    "H2",
    "dött stale-lås (>30 s, pid borta) rivs → exit 0",
    rStale.kod === 0 && !fs.existsSync(lasKat) && /rev överåldrat lås/.test(rStale.stderr),
    `kod=${rStale.kod}`
  );
}

console.log(`\nSVIT: ${pass} PASS, ${fail} FAIL, ${skip} SKIP`);
fs.rmSync(ARBETE, { recursive: true, force: true });
process.exit(fail === 0 ? 0 : 1);
