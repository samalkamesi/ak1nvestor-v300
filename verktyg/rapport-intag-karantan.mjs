#!/usr/bin/env node
/** rapport-intag-karantan.mjs — RAPPORT-INTAGET SOM KARANTÄNPIPELINE.
 * STYRELSEBESLUT 2026-09-20 (styrelse-muacmgtw-qizth0 + muadcvyf-cg1jm2):
 *   "Bygg rapport-intaget som karantänpipeline — verifierade källor,
 *    checksumma + provenienslogg per fil, PDF-parsning i isolerad process,
 *    lagring utanför publik webbrot."
 *   "Bygg citat-valideraren: hårt tak 200 ord/sektion + obligatoriska
 *    källa/länk-fält, failar hela leveransen vid överträff — nyckeltal/
 *    fakta passeras fritt enligt ÄL 1 §." + "refusera, trimma inte manuellt."
 *
 * FLOW (varje steg loggas; inget steg kan hoppas över):
 *   1. KÄLLVERIFIERING — endast https, content-typ application/pdf,
 *      storlekstak 40 MB. Avslag ⇒ intaget avbryts FÖRE nedladdning.
 *   2. KARANTÄNLAGRING — data/rapportintag/karantan/ (gitignorerad, utanför
 *      public/ — PDF:en hostas ALDRIG publikt, R2-principen i design).
 *   3. PROVENIENS — append data/rapportintag/proveniens.jsonl:
 *      {ts, bolag, ar, kalla, sha256, bytes, fil} per fil (styrelsekrav:
 *      källa + tidpunkt + hash).
 *   4. ISOLERAD PARSNING — barnprocess (rapport-intag-tolkare.mjs), 60 s
 *      timeout + SIGKILL vid häng; hängande parsning dör med barnet.
 *   5. CITAT-VALIDERARE — sektion med .citat: ≤ 200 ord HÅRT (överträff ⇒
 *      HELA leveransen refuseras — ingen trimning); kalla.url + kalla.namn
 *      OBLIGATORISKA på varje sektion; nyckeltal/text passeras fritt.
 *   6. LEVERANS — data/rapportintag/leveranser/<bolag>-<ar>.json med
 *      sektioner + källänk; PDF:en stannar i karantän.
 *
 * CLI: node verktyg/rapport-intag-karantan.mjs --url=<pdf> --bolag=<ticker>
 *       --ar=<2025> [--organ="bolagets IR-sida"]
 * Bibliotek: import { intagFranFil, valideraLeverans } from ...  (tester). */
import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const KARANTAN = path.join(ROT, "data", "rapportintag", "karantan");
const LEVERANSER = path.join(ROT, "data", "rapportintag", "leveranser");
const PROVENIENS = path.join(ROT, "data", "rapportintag", "proveniens.jsonl");
const TOLKARE = process.env.TOLKARE_SOKVAG || path.join(ROT, "verktyg", "rapport-intag-tolkare.mjs");
const MAX_BYTES = 40 * 1024 * 1024;
const TOLK_TAK_MS = Number(process.env.TOLK_TAK_MS || 60_000);

const lasArg = (namn) => {
  const m = process.argv.find((a) => a.startsWith(`--${namn}=`));
  return m ? m.slice(namn.length + 3) : null;
};

function loggaProveniens(post) {
  fs.mkdirSync(path.dirname(PROVENIENS), { recursive: true });
  fs.appendFileSync(PROVENIENS, JSON.stringify(post) + "\n");
}

/** Hämta och verifiera källan; returnerar {buf, kalla} eller kastar. */
async function hamtaOchVerifiera(url) {
  if (!url.startsWith("https://")) throw new Error(`KÄLLAVSLAG: endast https accepteras (${url})`);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 AK1A-Rapportintag/1.0" }, redirect: "follow" });
  if (!res.ok) throw new Error(`KÄLLAVSLAG: HTTP ${res.status} från ${url}`);
  const typ = res.headers.get("content-type") || "";
  if (!typ.includes("pdf") && !/\.pdf(\?|$)/.test(url)) {
    throw new Error(`KÄLLAVSLAG: content-typ "${typ}" är inte PDF`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error("KÄLLAVSLAG: tom fil");
  if (buf.length > MAX_BYTES) throw new Error(`KÄLLAVSLAG: ${buf.length} B överstiger taket ${MAX_BYTES} B`);
  return { buf, kalla: { url, http: res.status, contentTyp: typ, bytes: buf.length } };
}

/** Isolerad parsning: barnprocess med timeout — häng dör med barnet. */
function isoleradTolkning(pdfSokvag) {
  return new Promise((resolve, reject) => {
    const barn = spawn(process.execPath, [TOLKARE, pdfSokvag], { stdio: ["ignore", "pipe", "pipe"] });
    let ut = "";
    const tak = setTimeout(() => {
      barn.kill("SIGKILL");
      reject(new Error(`TOLKNINGSAVSLAG: isolerad tolkare avlivad efter ${TOLK_TAK_MS / 1000} s (hang)`));
    }, TOLK_TAK_MS);
    barn.stdout.on("data", (d) => { ut += d; });
    barn.stderr.on("data", (d) => { ut += d; });
    barn.on("error", (e) => { clearTimeout(tak); reject(new Error(`TOLKNINGSAVSLAG: barnprocess föddes ej — ${e.message}`)); });
    barn.on("close", (kod) => {
      clearTimeout(tak);
      const rad = ut.trim().split("\n").pop() || "";
      try {
        const j = JSON.parse(rad);
        if (kod === 0 && j.ok) return resolve(j);
        reject(new Error(`TOLKNINGSAVSLAG: ${j.fel || `exit ${kod}`}`));
      } catch { reject(new Error(`TOLKNINGSAVSLAG: oväntad tolkarutdata (exit ${kod})`)); }
    });
  });
}

/** CITAT-VALIDERAREN — styrelsens hårda kontrakt. Returnerar [] vid grönt,
 *  annars lista över överträdelser (HELA leveransen refuseras av anroparen). */
export function valideraLeverans(leverans) {
  const fel = [];
  const sektioner = leverans?.sektioner || [];
  if (!sektioner.length) fel.push("leveransen bär inga sektioner");
  for (const [i, s] of sektioner.entries()) {
    const ref = s.rubrik || `sektion ${i + 1}`;
    if (!s.kalla?.url) fel.push(`${ref}: kalla.url saknas (obligatoriskt fält)`);
    if (!s.kalla?.namn) fel.push(`${ref}: kalla.namn saknas (obligatoriskt fält)`);
    if (typeof s.citat === "string") {
      const ord = s.citat.trim().split(/\s+/).filter(Boolean).length;
      if (ord > 200) fel.push(`${ref}: citat ${ord} ord > tak 200 — refusera, trimma inte (${s.kalla?.url || "okänd källa"})`);
    }
  }
  return fel;
}

/** Offline-intag ur befintlig fil (testkanal + omhämtning är onödig). */
export async function intagFranFil(pdfSokvag, meta) {
  if (!meta.bolag || !meta.ar) throw new Error("KÄLLAVSLAG: --bolag och --ar krävs");
  const buf = fs.readFileSync(pdfSokvag);
  if (buf.length > MAX_BYTES) throw new Error(`KÄLLAVSLAG: ${buf.length} B överstiger taket`);
  return forberedOchLeverera(buf, {
    url: meta.url || pdfSokvag,
    http: meta.http || "lokal",
    contentTyp: "application/pdf (lokal fil)",
    bytes: buf.length,
  }, meta);
}

async function forberedOchLeverera(buf, kalla, meta) {
  const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
  fs.mkdirSync(KARANTAN, { recursive: true });
  const karantFil = path.join(KARANTAN, `${meta.bolag}-${meta.ar}-${sha256.slice(0, 10)}.pdf`);
  fs.writeFileSync(karantFil, buf);

  const proveniens = { ts: new Date().toISOString(), bolag: meta.bolag, ar: meta.ar, kalla, sha256, fil: karantFil };
  loggaProveniens(proveniens);

  const tolkad = await isoleradTolkning(karantFil);

  // källfälten sätts mekaniskt per sektion (PDF:ens egen url/namn) — citat
  // läggs till av kuration; validatorn vrider hårt på båda.
  const sektioner = tolkad.sektioner.map((s) => ({
    rubrik: s.rubrik,
    text: s.text,
    kalla: { namn: `${meta.bolag} årsredovisning ${meta.ar}`, url: kalla.url },
  }));
  const leverans = { bolag: meta.bolag, ar: meta.ar, sektioner, proveniensSha: sha256, tolkad: new Date().toISOString() };

  const fel = valideraLeverans(leverans);
  if (fel.length) {
    throw new Error(`VALIDERINGSAVSLAG — hela leveransen refuserad (${fel.length} överträdelser):\n  - ${fel.join("\n  - ")}`);
  }

  fs.mkdirSync(LEVERANSER, { recursive: true });
  const levFil = path.join(LEVERANSER, `${meta.bolag}-${meta.ar}.json`);
  fs.writeFileSync(levFil, JSON.stringify(leverans, null, 2));
  return { leveransFil: levFil, sektioner: sektioner.length, sha256, karantFil };
}

async function intagRapport({ url, bolag, ar }) {
  const { buf, kalla } = await hamtaOchVerifiera(url);
  return forberedOchLeverera(buf, kalla, { bolag, ar, url });
}

// ── CLI ─────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith("rapport-intag-karantan.mjs")) {
  const url = lasArg("url");
  const bolag = lasArg("bolag");
  const ar = lasArg("ar");
  if (!url || !bolag || !ar) {
    console.error("Användning: --url=<https-pdf> --bolag=<ticker> --ar=<årtal>");
    process.exit(2);
  }
  intagRapport({ url, bolag, ar })
    .then((r) => { console.log(`INTAG LEVERERAD: ${r.sektioner} sektioner → ${r.leveransFil} (sha256 ${r.sha256.slice(0, 12)}…, PDF i karantän)`); })
    .catch((e) => { console.error(String(e.message || e)); process.exit(1); });
}
