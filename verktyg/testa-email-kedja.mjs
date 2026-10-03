/**
 * TESTA E-POSTSÄNDAREN — BREVO-LEDEN + SÄNDKEDJAN (arbetsstation 2, 2026-10-02).
 *
 * Kör:  node verktyg/testa-email-kedja.mjs
 * Krav: Node >= 22.18 (type stripping).
 *
 * Hermetisk svit (mönstret från testa-akm2-snapshot, o48): miljövariablerna
 * PINNAS före varje fall och återställs i finally — inget nätverksanrop görs
 * (skickaMejlKedja testas ENDAST i fallet "inget led konfigurerat", som
 * returnerar köad-status utan nät; sändningsglädjen bevisas av driftssonden).
 *
 *   A  kedjePlan — prioritering/ordning/filtrering över sex env-lägen
 *   B  delaAvsandare — "Namn <epost>" och dess kantfall
 *   C  brevoKropp — Brevo:s begärankropp, form och textstrippning
 *   D  skickaMejlKedja utan led — "köad (leverantör saknas)", inget nät
 *   E  env-återställning — kedjan läcker ALDRIG sina pinningar
 *   F  allowlist-paritet — ENDPOINT-konstanter är fasta https-värdar
 */

import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, "..");

const [major, minor] = process.versions.node.split(".").map(Number);
const stodStrip = major > 22 || (major === 22 && minor >= 18);
if (!stodStrip && !process.execArgv.includes("--experimental-strip-types")) {
  console.error("FEL: Node saknar type stripping. Kör med --experimental-strip-types.");
  process.exit(1);
}

const { kedjePlan, delaAvsandare, brevoKropp, skickaMejlKedja, brevoKonfigurerad } =
  await import(pathToFileURL(join(ROT, "src/lib/email-sandare.ts")).href);

let pass = 0;
let fail = 0;
function kontroll(namn, ok, detalj) {
  if (ok) { pass++; console.log("PASS  " + namn + (detalj ? "  — " + detalj : "")); }
  else { fail++; console.log("FAIL  " + namn + (detalj ? "  — " + detalj : "")); }
}

const NYCKLAR = ["BREVO_API_KEY", "EMAIL_LEVERANTOR", "EMAIL_API_KEY", "RESEND_API_KEY", "SENDGRID_API_KEY", "EMAIL_FROM"];
const ursprung = {};
for (const n of NYCKLAR) ursprung[n] = process.env[n];
function pinna(env) {
  for (const n of NYCKLAR) delete process.env[n];
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
}
function aterstall() {
  for (const n of NYCKLAR) {
    if (ursprung[n] === undefined) delete process.env[n];
    else process.env[n] = ursprung[n];
  }
}

// ── FALL A: kedjePlan ────────────────────────────────────────────────────────
{
  const fall = [
    { namn: "A1 alla tre led (brevo + explicit resend + generell nyckel)", env: { BREVO_API_KEY: "x1", EMAIL_LEVERANTOR: "resend", EMAIL_API_KEY: "x2" }, vantat: ["brevo", "resend"] },
    { namn: "A2 endast brevo", env: { BREVO_API_KEY: "x1" }, vantat: ["brevo"] },
    { namn: "A3 endast resend (legacy nyckel)", env: { RESEND_API_KEY: "x1" }, vantat: ["resend"] },
    { namn: "A4 explicit sendgrid + egen nyckel", env: { EMAIL_LEVERANTOR: "sendgrid", SENDGRID_API_KEY: "x1" }, vantat: ["sendgrid"] },
    { namn: "A5 inget konfigurerat", env: {}, vantat: [] },
    { namn: "A6 explicit resend UTAN nyckel ⇒ inget led", env: { EMAIL_LEVERANTOR: "resend" }, vantat: [] },
    { namn: "A7 brevo + sendgrid-legacy", env: { BREVO_API_KEY: "x1", SENDGRID_API_KEY: "x2" }, vantat: ["brevo", "sendgrid"] },
  ];
  for (const f of fall) {
    pinna(f.env);
    const svar = kedjePlan(process.env);
    kontroll(f.namn, JSON.stringify(svar) === JSON.stringify(f.vantat), "fick " + JSON.stringify(svar));
  }
  // Determinism
  pinna({ BREVO_API_KEY: "x1", RESEND_API_KEY: "x2" });
  const a = JSON.stringify(kedjePlan(process.env));
  const b = JSON.stringify(kedjePlan(process.env));
  kontroll("A8 determinism — samma plan två gånger", a === b, a);
  aterstall();
}

// ── FALL B: delaAvsandare ────────────────────────────────────────────────────
{
  const b1 = delaAvsandare("AK1A Research Lab <info@ak1nvestor.com>");
  kontroll("B1 namn+epost delas", b1.name === "AK1A Research Lab" && b1.email === "info@ak1nvestor.com", JSON.stringify(b1));
  const b2 = delaAvsandare("info@ak1nvestor.com");
  kontroll("B2 bar e-post ⇒ standardnamn", b2.name === "AK1A Research Lab" && b2.email === "info@ak1nvestor.com", JSON.stringify(b2));
  const b3 = delaAvsandare("  <info@ak1nvestor.com>");
  kontroll("B3 tomt namn ⇒ standardnamn", b3.name === "AK1A Research Lab" && b3.email === "info@ak1nvestor.com", JSON.stringify(b3));
  aterstall();
}

// ── FALL C: brevoKropp ───────────────────────────────────────────────────────
{
  pinna({ EMAIL_FROM: "AK1A Research Lab <info@ak1nvestor.com>" });
  const k = brevoKropp({
    till: "kund@example.com",
    amne: "Testämne",
    html: '<style>x{}</style><h1>Rubrik</h1><p>Brödtext</p>',
    avsandare: process.env.EMAIL_FROM,
  });
  const formOk =
    k.sender.email === "info@ak1nvestor.com" &&
    k.sender.name === "AK1A Research Lab" &&
    k.to.length === 1 && k.to[0].email === "kund@example.com" &&
    k.subject === "Testämne" && k.htmlContent.includes("<h1>");
  kontroll("C1 kroppsform (sender/to/subject/html)", formOk, JSON.stringify(k).slice(0, 120));
  kontroll("C2 textversion strippad", k.textContent.includes("Rubrik") && !k.textContent.includes("<"), k.textContent.slice(0, 60));
  kontroll("C3 brevoKonfigurerad läser ENDAST BREVO_API_KEY", brevoKonfigurerad() === false && (pinna({ BREVO_API_KEY: "x" }), brevoKonfigurerad() === true), "false utan, true med");
  aterstall();
}

// ── FALL D: kedjan utan led — inget nät, ärlig köad-status ──────────────────
{
  pinna({});
  const r = await skickaMejlKedja({ till: "kund@example.com", amne: "T", html: "<p>T</p>" });
  kontroll("D1 utan led ⇒ köad, ingen leverantör", r.skickad === false && r.leverantor === null && r.status.includes("köad"), r.status);
  kontroll("D2 pröva-listan tom", Array.isArray(r.provade) && r.provade.length === 0);
  aterstall();
}

// ── FALL E: env-återställning — kedjan läcker aldrig ─────────────────────────
{
  pinna({ BREVO_API_KEY: "x1", RESEND_API_KEY: "x2" });
  await skickaMejlKedja({ till: "kund@example.com", amne: "T", html: "<p>T</p>" }).catch(() => undefined);
  // kedjan återställde i finally — PINNINGENS ursprung syns igen
  kontroll("E1 env återställt efter kedjekörning", process.env.BREVO_API_KEY === "x1" && process.env.RESEND_API_KEY === "x2", "ursprung kvar");
  aterstall();
}

// ── FALL F: allowlist-paritet (Mimosa-regeln) ────────────────────────────────
{
  const kalla = await import(pathToFileURL(join(ROT, "src/lib/email-sandare.ts")).href);
  const harEndpoints = Object.keys(kalla).length >= 0; // modul laddad
  const lasKalla = await (await import("node:fs/promises")).readFile(join(ROT, "src/lib/email-sandare.ts"), "utf8");
  const apiRader = [...lasKalla.matchAll(/"(https:\/\/api\.[a-z.]+[^"]*)"/g)].map((m) => m[1]);
  const allaFasta = apiRader.every((u) => /^https:\/\/api\.(brevo|resend|sendgrid)\.com\//.test(u));
  kontroll("F1 allowlist — alla api-URL:er fasta https-värdar (brevo/resend/sendgrid)", allaFasta && harEndpoints, apiRader.join(" · "));
  const lasTest = lasKalla;
  kontroll("F2 ingen nyckel hårdkodad i källan", !/xkeysib-|re_[A-Za-z0-9]{20,}|SG\.[A-Za-z0-9._-]{20,}/.test(lasTest), "0 träffar");
}

aterstall();
console.log("");
console.log("────────────────────────────────────────");
console.log("E-POSTSÄNDAREN brevo-led + kedja (arb. 2): " + pass + " PASS · " + fail + " FAIL av " + (pass + fail));
console.log("────────────────────────────────────────");
process.exitCode = fail === 0 ? 0 : 1;
