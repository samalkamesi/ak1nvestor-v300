#!/usr/bin/env node
/**
 * AK1A — Test av den server-sidiga sajtsökningen (våg 122E):
 * src/app/api/sok/route.ts + src/lib/sok-server.ts.
 *
 * Samma mönster som verktyg/testa-akm2-dynamik.mjs (node kan inte impor-
 * tera TS direkt):
 *   1. Genererar tmp_sok_koll.ts i repots rot — importerar API-rutten och
 *      sök-servern och anropar GET direkt med Request-objekt (ingen server
 *      behövs — route.ts använder web-standard Response, inget next/import).
 *   2. Kör den med: npx --yes tsx .tmp/tmp_sok_koll.ts
 *   3. Skriver ut svensk PASS/FAIL-rapport per rad och städar tmp-filen.
 *
 * Kontroller (styrelsebeslut mtzou25g åtgärd 5):
 *   a) tomt/whitespace/saknad q → 400 { fel: "q krävs" }.
 *   b) q=akm2 → 200, JSON, ≥1 träff med url; svarskontraktet {q,lang,antal,
 *      resultat}; lang=en ⇒ speglade kurs-url:er får /en-prefix; tak 20.
 *   c) åäö: "förvaltning" → 200 + normaliseringen "Förvaltning"=="forvaltning".
 *   d) RESERVVÄGEN: AK1A_SOK_TVINGA_RESERV=1 (simulerad saknad indexdata)
 *      ⇒ fortfarande 200 med träffar ur den inbakade listan — ALDRIG 500.
 *
 * Användning:  node verktyg/testa-sok.mjs
 * Avslutskod:  0 om inga FAIL, 1 annars.
 *
 * Pedagogisk forskning — ALDRIG investeringsråd.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, ".tmp", "tmp_sok_koll.ts");
const TIMEOUT_MS = 240_000; // tsx kan behöva laddas ner första gången

// ── 1) Genererad tmp-testfil (TS — körs via npx tsx, raderas efteråt) ────────
// Obs: ingen backticks/${} inuti denna String.raw-literal.
const TS_KOD = String.raw`// tmp_sok_koll.ts — GENERERAD av verktyg/testa-sok.mjs. Raderas efter körning.
// (async-main: repot är CJS-package — top-level await stöds ej i tsx här.)
import { GET } from "../src/app/api/sok/route";
import { normaliseraSok, sokServerSide } from "../src/lib/sok-server";

let fail = 0;
function kolla(namn: string, ok: boolean, detalj: string): void {
  console.log("  " + (ok ? "PASS" : "FAIL") + " | " + namn + " => " + detalj);
  if (!ok) fail += 1;
}

async function anrop(qs: string): Promise<{ status: number; ct: string; body: any }> {
  const res = await GET(new Request("http://localhost:3000/api/sok" + qs));
  return { status: res.status, ct: res.headers.get("content-type") || "", body: await res.json() };
}

async function main(): Promise<void> {

// ── a) tomt/whitespace/saknad q → 400 { fel: "q krävs" } ─────────────────────
{
  const saknad = await anrop("");
  kolla("a1 saknad q → 400", saknad.status === 400, "status=" + saknad.status);
  kolla("a2 felmeddelande", saknad.body.fel === "q krävs", JSON.stringify(saknad.body));
  const tom = await anrop("?q=");
  kolla("a3 tom q → 400", tom.status === 400, "status=" + tom.status);
  const vitt = await anrop("?q=%20%20%20");
  kolla("a4 whitespace q → 400", vitt.status === 400, "status=" + vitt.status);
}

// ── b) q=akm2 → 200 + JSON + träffar med url; kontrakt; lang=en; tak 20 ─────
{
  const r = await anrop("?q=akm2");
  kolla("b1 akm2 → 200", r.status === 200, "status=" + r.status);
  kolla("b2 JSON-content-type", r.ct.includes("application/json"), "ct=" + r.ct);
  kolla(
    "b3 ≥1 träff med url",
    Array.isArray(r.body.resultat) && r.body.resultat.length >= 1 && r.body.resultat.every((x: any) => typeof x.url === "string" && x.url.length > 0),
    "antal=" + String(r.body.antal),
  );
  kolla(
    "b4 kontrakt {q,lang,antal,resultat}",
    r.body.q === "akm2" && r.body.lang === "sv" && r.body.antal === r.body.resultat.length,
    "q=" + r.body.q + " lang=" + r.body.lang + " antal=" + String(r.body.antal),
  );
  kolla(
    "b5 träfffält titel/url/typ/utdrag",
    r.body.resultat.every((x: any) => typeof x.titel === "string" && typeof x.url === "string" && typeof x.typ === "string" && typeof x.utdrag === "string"),
    "fälten ok=" + String(r.body.resultat.every((x: any) => "titel" in x && "url" in x && "typ" in x && "utdrag" in x)),
  );
  const en = await anrop("?q=akm2&lang=en");
  kolla("b6 lang=en → 200", en.status === 200, "status=" + en.status);
  kolla(
    "b7 speglad träff får /en-prefix",
    en.body.resultat.some((x: any) => x.url.startsWith("/en/")),
    "url:er=" + JSON.stringify(en.body.resultat.map((x: any) => x.url)),
  );
  const bmb = await anrop("?q=bokmaster&lang=en");
  kolla(
    "b7b kurskategori bokmaster → /en/kurser/-url",
    bmb.status === 200 && bmb.body.resultat.some((x: any) => x.url.startsWith("/en/kurser/")),
    "antal=" + String(bmb.body.antal),
  );
  const brett = await anrop("?q=a&lang=sv");
  kolla("b8 tak 20 träffar", brett.status === 200 && brett.body.antal <= 20, "antal=" + String(brett.body.antal));
}

// ── c) åäö: q med förvaltning → 200 + normaliseringen ───────────────────────
{
  const kodad = await anrop("?q=f%C3%B6rvaltning"); // "förvaltning" procentkodad
  kolla("c1 förvaltning (kodad) → 200", kodad.status === 200, "status=" + kodad.status);
  const rå = await GET(new Request("http://localhost:3000/api/sok?q=förvaltning"));
  kolla("c2 förvaltning (rå UTF-8 i URL) → 200", rå.status === 200, "status=" + rå.status);
  kolla(
    "c3 normalisering Förvaltning == forvaltning",
    normaliseraSok("Förvaltning") === normaliseraSok("forvaltning") && normaliseraSok("förvaltning") === "forvaltning",
    normaliseraSok("Förvaltning") + " == " + normaliseraSok("forvaltning"),
  );
}

// ── d) reservvägen: tvingad saknad indexdata → fortfarande 200 ──────────────
{
  process.env.AK1A_SOK_TVINGA_RESERV = "1"; // kollas FÖRE cachen i hamtaIndex
  const r = await anrop("?q=kurser");
  kolla("d1 tvingad reserv → 200", r.status === 200, "status=" + r.status);
  kolla(
    "d2 reserv ger träff ur inbakad lista",
    r.body.antal >= 1 && r.body.resultat.every((x: any) => x.url.startsWith("/")),
    "antal=" + String(r.body.antal) + " första=" + String(r.body.resultat[0] ? r.body.resultat[0].url : "ingen"),
  );
  const reservDirekt = sokServerSide("bibliotek", "sv");
  kolla("d3 reservvägen sökbar direkt", reservDirekt.length >= 1 && reservDirekt[0].url === "/bibliotek", "url=" + String(reservDirekt[0] ? reservDirekt[0].url : "ingen"));
  delete process.env.AK1A_SOK_TVINGA_RESERV;
}

console.log(fail === 0 ? "\nALLA PASS" : "\n" + String(fail) + " FAIL");
process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FEL i testkörningen: " + String(e));
  process.exit(1);
});
`;

// ── 2) Skriv, kör, städa ──────────────────────────────────────────────────────
  mkdirSync(path.dirname(TMP_TS), { recursive: true }); // o44: engångszonen finns alltid
  writeFileSync(TMP_TS, TS_KOD, "utf8");
console.log("Testar /api/sok (server-sidig sajtsökning, våg 122E) via npx tsx …\n");
let slutkod = 1;
try {
  const res = spawnSync("npx", ["--yes", "tsx", ".tmp/tmp_sok_koll.ts"], {
    cwd: REPO,
    encoding: "utf8",
    stdio: ["ignore", "inherit", "inherit"],
    timeout: TIMEOUT_MS,
  });
  if (res.error) {
    console.error("FEL: kunde inte köra npx tsx: " + res.error.message);
    slutkod = 1;
  } else {
    slutkod = res.status ?? 1;
  }
} finally {
  try {
    unlinkSync(TMP_TS);
  } catch {
    // tmp-filen fanns inte — inget att städa.
  }
}
process.exit(slutkod); // o44 R2: exit EFTER finally — annars mossas unlink vid varje körning
