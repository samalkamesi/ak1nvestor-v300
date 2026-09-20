#!/usr/bin/env node
// reservera-protokollnummer.mjs — gemensam nummerreservation under flock.
//
// Rotorsaka (bevisad 4 ggr: o106/o107/o108/o114): fritt protokollnummerval i
// "välj själv"-manifest är ett race-fönster — två agenter väljer samma nummer
// innan någon committar. KUR: PRE-val reserverar numret här atomiskt; käll-
// skanningen (OPTIMERING-filnamn, worklog-frekomster, anspråksfiler) är
// säkerhetsnät mot nummer verktyget inte känner till.
//
// Användning (exit 0 = ok, 1 = logiskt avslag, 2 = ogiltiga argument, 3 = låsfel):
//   node verktyg/reservera-protokollnummer.mjs --nästa --ägare "s8-u1" [--manifest id --titel "…"]
//   node verktyg/reservera-protokollnummer.mjs --ta o116 --ägare "s8-u1" […]
//   node verktyg/reservera-protokollnummer.mjs --kontrollera o116 --ägare "s8-u1"
//   node verktyg/reservera-protokollnummer.mjs --lämna o116 --ägare "s8-u1"
//   node verktyg/reservera-protokollnummer.mjs --lista
//
// Lämna används vid cession/nedställning; lämnade nummer återanvänds ALDRIG
// (protokoll kan ha hunnit skrivas ändå). All utdata: EN JSON-rad på stdout.
// OBS process.exit(): alla utgångar går via ETT ställe EFTER finally — exit
// inne i try hoppar över finally och lämnar flock-låset kvar (svitens H-spår).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPOROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLROT = process.env.AK1A_NUMMERRESERV_KALLOR
  ? path.resolve(process.env.AK1A_NUMMERRESERV_KALLOR)
  : REPOROT;
const RESERVKAT = path.resolve(
  process.env.AK1A_NUMMERRESERV_KATALOG ?? path.join(KALLROT, "data", "vakten")
);
const RESERVFIL = path.join(RESERVKAT, "protokollnummer.json");
const LAS_KAT = path.join(RESERVKAT, ".protokollnummer.lock.d");
const LAS_STALE_MS = 30_000; // levande lås rivs aldrig under detta — se rivregeln
const LAS_FODELSE_MS = 2_000; // info.json får ms på sig att födas efter mkdir
const LAS_MAX_VANT_MS = Number(process.env.AK1A_NUMMERRESERV_LASVANT ?? 15_000);

function sov(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function pidLever(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM"; // finns men ägs av annan = lever
  }
}

// --- flock: mkdir är atomiskt på POSIX ---
// Rivregler: (a) info.json finns + pid död → riv direkt (död ägare skriver
// aldrig klart); (b) info.json saknas + lås äldre än födelsefönstret → riv
// (ägaren dog mellan mkdir och info-write); (c) pid lever men låset > 4×stale
// → riv som sista utväg; (d) färskt + levande → vänta.
function skaffaLas() {
  const start = Date.now();
  for (;;) {
    try {
      fs.mkdirSync(LAS_KAT);
      fs.writeFileSync(
        path.join(LAS_KAT, "info.json"),
        JSON.stringify({ pid: process.pid, ts: Date.now() })
      );
      return;
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      let alder = 0;
      let info = null;
      try {
        alder = Date.now() - fs.statSync(LAS_KAT).mtimeMs;
        info = JSON.parse(fs.readFileSync(path.join(LAS_KAT, "info.json"), "utf8"));
      } catch {
        // info.json saknas/oläsbart — födelsefönstret avgör
      }
      const aktorias = info ? pidLever(info.pid) : false;
      const dodPidFinns = info !== null && !aktorias;
      const fodelseSaknas = info === null && alder > LAS_FODELSE_MS;
      const fortvividLevande = aktorias && alder > 4 * LAS_STALE_MS;
      if (dodPidFinns || fodelseSaknas || fortvividLevande) {
        fs.rmSync(LAS_KAT, { recursive: true, force: true });
        process.stderr.write(
          `[nummerreserv] rev överåldrat lås (${Math.round(alder / 1000)} s${info ? `, pid ${info.pid} ${aktorias ? "lever" : "död"}` : ", ingen info"})\n`
        );
        continue;
      }
      if (Date.now() - start > LAS_MAX_VANT_MS) {
        return { lasfel: `lås upptaget > ${Math.round(LAS_MAX_VANT_MS / 1000)} s — annan agent skriver reservationsfilen` };
      }
      sov(150);
    }
  }
}
function slappLas() {
  fs.rmSync(LAS_KAT, { recursive: true, force: true });
}

// --- kända nummer ur trädet (säkerhetsnät mot okända reservationer) ---
function kandaNummer() {
  const kanda = new Set();
  const mata = (text) => {
    for (const m of text.matchAll(/\bo(\d{1,4})\b/g)) kanda.add("o" + m[1]);
  };
  // 1) levererade protokoll: filnamn
  const optDir = path.join(KALLROT, "data", "forskning", "OPTIMERING");
  for (const f of listDir(optDir)) {
    const m = f.match(/^o(\d{1,4})[-._]/);
    if (m) kanda.add("o" + m[1]);
  }
  // 2) worklog-frekomster (större än 8 MB → läs sista 2 MB; äldre nummer är ändå < max)
  const wl = path.join(KALLROT, "worklog.md");
  try {
    const st = fs.statSync(wl);
    if (st.size > 8 * 1024 * 1024) {
      const fh = fs.openSync(wl, "r");
      const buf = Buffer.alloc(2 * 1024 * 1024);
      fs.readSync(fh, buf, 0, buf.length, st.size - buf.length);
      fs.closeSync(fh);
      mata(buf.toString("utf8"));
    } else {
      mata(fs.readFileSync(wl, "utf8"));
    }
  } catch {
    // worklog saknas i fixture — tomt är tillåtet
  }
  // 3) anspråksfiler i data/vakten: namn + innehåll (pågående val syns här)
  for (const f of listDir(RESERVKAT)) {
    if (!/ansprak/i.test(f)) continue;
    mata(f);
    try {
      const p = path.join(RESERVKAT, f);
      if (fs.statSync(p).size <= 256 * 1024) mata(fs.readFileSync(p, "utf8"));
    } catch {
      // races med pågående skrivning — namnet räcker
    }
  }
  return kanda;
}
function listDir(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

// --- reservationsfilen ---
function lasReserveringar() {
  let rå;
  try {
    rå = fs.readFileSync(RESERVFIL, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return { skapat: new Date().toISOString(), poster: [] };
    throw e;
  }
  try {
    const parsed = JSON.parse(rå);
    if (!Array.isArray(parsed.poster)) throw new Error("poster saknas");
    return parsed;
  } catch {
    const backup = RESERVFIL.replace(/\.json$/, `.korrupt-${Date.now()}.json`);
    fs.renameSync(RESERVFIL, backup);
    process.stderr.write(`[nummerreserv] ogiltig JSON backad till ${path.basename(backup)} — börjar om tom\n`);
    return { skapat: new Date().toISOString(), poster: [] };
  }
}
function sparaReserveringar(data) {
  const tmp = RESERVFIL + ".tmp-" + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  fs.renameSync(tmp, RESERVFIL);
}
const aktiv = (post) => post.status === "reserverat";
const hitta = (data, nummer) => data.poster.find((p) => p.nummer === nummer && aktiv(p)) ?? null;

// --- argument (före låset — tidiga exits lämnar inget eget lås) ---
const argv = process.argv.slice(2);
const arg = (namn) => {
  const i = argv.indexOf("--" + namn);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
};
const flagga = (namn) => argv.includes("--" + namn);
const AGARE = arg("ägare") ?? arg("agare");
const MANIFEST = arg("manifest");
const TITEL = arg("titel") ?? "oprovat val";

const antalKommandon = ["nästa", "ta", "kontrollera", "lämna", "lista"].filter((k) => flagga(k)).length;
const NUMMER = arg("ta") ?? arg("kontrollera") ?? arg("lämna");

function validera() {
  if (antalKommandon !== 1)
    return "exakt ett kommando krävs: --nästa | --ta oNNN | --kontrollera oNNN | --lämna oNNN | --lista";
  if ((flagga("ta") || flagga("kontrollera") || flagga("lämna")) && !NUMMER)
    return "--ta/--kontrollera/--lämna kräver ett nummer (t.ex. o116)";
  if (NUMMER && !/^o\d{1,4}$/.test(NUMMER))
    return `ogiltigt nummer "${NUMMER}" — format: o + 1–4 siffror (t.ex. o116)`;
  if (!flagga("lista") && !AGARE) return "--ägare krävs (ditt agent-id, t.ex. s8-u1)";
  if (AGARE && (AGARE.trim() === "" || AGARE.length > 64))
    return "ogiltig ägare (tom eller > 64 tecken)";
  return null;
}

// --- verkställ (under lås; ALLA utgångar som retur — aldrig process.exit) ---
function verkstall() {
  fs.mkdirSync(RESERVKAT, { recursive: true });
  const data = lasReserveringar();
  const nu = Date.now();

  if (flagga("lista")) {
    return { svar: { ok: true, reservfil: RESERVFIL, poster: data.poster }, kod: 0 };
  }

  if (flagga("kontrollera")) {
    const post = hitta(data, NUMMER);
    if (post && post.agare === AGARE) {
      return { svar: { ok: true, nummer: NUMMER, agare: AGARE, status: "reserverat", din: true }, kod: 0 };
    }
    return {
      svar: {
        ok: false,
        kod: 1,
        fel: post
          ? `o-numret ${NUMMER} är reserverat av ${post.agare} — INTE ditt`
          : `o-numret ${NUMMER} har ingen aktiv reservation`,
      },
      kod: 1,
    };
  }

  if (flagga("lämna")) {
    const post = hitta(data, NUMMER);
    if (!post) return { svar: { ok: false, kod: 1, fel: `${NUMMER}: ingen aktiv reservation att lämna` }, kod: 1 };
    if (post.agare !== AGARE)
      return { svar: { ok: false, kod: 1, fel: `${NUMMER} tillhör ${post.agare} — endast ägaren får lämna` }, kod: 1 };
    post.status = "lamnat";
    post.lamnatTs = nu;
    sparaReserveringar(data);
    return { svar: { ok: true, nummer: NUMMER, agare: AGARE, status: "lamnat" }, kod: 0 };
  }

  if (flagga("ta")) {
    const befintlig = hitta(data, NUMMER);
    if (befintlig) {
      if (befintlig.agare === AGARE) {
        return { svar: { ok: true, nummer: NUMMER, agare: AGARE, status: "redan-din", idempotent: true }, kod: 0 };
      }
      return {
        svar: {
          ok: false,
          kod: 1,
          fel: `${NUMMER} är redan reserverat av ${befintlig.agare} (sedan ${new Date(befintlig.ts).toISOString()})`,
        },
        kod: 1,
      };
    }
    const lamnad = data.poster.find((p) => p.nummer === NUMMER && !aktiv(p));
    if (lamnad)
      return {
        svar: {
          ok: false,
          kod: 1,
          fel: `${NUMMER} är förbrukat (lämnat ${new Date(lamnad.lamnatTs).toISOString()}) — lämnade nummer återanvänds aldrig`,
        },
        kod: 1,
      };
    if (kandaNummer().has(NUMMER)) {
      return {
        svar: {
          ok: false,
          kod: 1,
          fel: `${NUMMER} förekommer redan i trädet (OPTIMERING/worklog/anspråk) — välj ledigt med --nästa`,
        },
        kod: 1,
      };
    }
    data.poster.push({ nummer: NUMMER, agare: AGARE, manifest: MANIFEST ?? null, titel: TITEL, ts: nu, status: "reserverat" });
    sparaReserveringar(data);
    return { svar: { ok: true, nummer: NUMMER, agare: AGARE, status: "reserverat", kalla: "val" }, kod: 0 };
  }

  // --nästa
  const kanda = kandaNummer();
  const alla = [...kanda, ...data.poster.map((p) => p.nummer)];
  if (alla.length === 0) {
    return {
      svar: { ok: false, kod: 1, fel: "inga kända nummer i källorna — vägrar gissa seriebasen (kontrollera källrot)" },
      kod: 1,
    };
  }
  const hogsta = alla.reduce((max, n) => {
    const v = parseInt(n.slice(1), 10);
    return Number.isFinite(v) && v > max ? v : max;
  }, 0);
  let kandidat = hogsta + 1;
  while (data.poster.some((p) => p.nummer === "o" + kandidat)) kandidat += 1;
  const nummer = "o" + kandidat;
  data.poster.push({ nummer, agare: AGARE, manifest: MANIFEST ?? null, titel: TITEL, ts: nu, status: "reserverat" });
  sparaReserveringar(data);
  return {
    svar: { ok: true, nummer, agare: AGARE, status: "reserverat", hogstaKanda: "o" + hogsta, kallor: kanda.size },
    kod: 0,
  };
}

// --- main: ETT ställe skriver ut, ETT exit — efter finally ---
const valideringsfel = validera();
if (valideringsfel) {
  process.stdout.write(JSON.stringify({ ok: false, fel: valideringsfel, kod: 2 }) + "\n");
  process.exit(2);
}
const las = skaffaLas();
if (las?.lasfel) {
  process.stdout.write(JSON.stringify({ ok: false, fel: las.lasfel, kod: 3 }) + "\n");
  process.exit(3);
}
let resultat;
try {
  resultat = verkstall();
} finally {
  slappLas();
}
process.stdout.write(JSON.stringify(resultat.svar) + "\n");
process.exit(resultat.kod);
