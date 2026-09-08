#!/usr/bin/env node
/**
 * AK1A — Testsvit för ADMIN-ROLLER + SESSIONER (src/lib/admin-auth.ts, VÅG 83 /
 * ADMIN-MEGA steg 5 — STYRELSE-VAG83-ROLLER.md §A1).
 *
 * REN LOGIK UTAN NÄTVERK: admin-auth.ts importerar next/server (NextRequest/
 * NextResponse) och node:crypto. Bron (v81-mönstret från verktyg/
 * testa-mediabibliotek.mjs) skriver om "next/server"-importen till en stub
 * i tool-results/ (gitignorad hjälpfil — aldrig i src/, aldrig tmp_-namngiven):
 * NextResponse.json blir ett { status, data }-objekt — testerna kollar endast
 * null (auktoriserad) vs .status (401/500/429). node:crypto löses internt.
 *
 * Kontroller (≥ 10 enligt kontraktet A1):
 *   (1)  Cookie-format: skapaSession → "<roll>.<utgar>.<hmac>" med utgar
 *        ~ nu + 8 h och hmac = 64 hex-tecken — för båda rollerna.
 *   (2)  HMAC deterministisk: omräknad HMAC-SHA256(SESSION_SECRET,
 *        "<roll>.<utgar>") hex === signaturdelen (exakt formatkontakt).
 *   (3)  lasSessionFranCookie: giltig cookie ⇒ rätt roll (admin + redaktör).
 *   (4)  Utgången vägrar: korrekt signerad cookie med utgar i dåtid ⇒ null.
 *   (5)  Tamper: fel signatur ⇒ null; roll-uppgradering (redaktörs signatur
 *        utgiven som "admin") ⇒ null — HMAC:en täcker rollen.
 *   (6)  Cookie-parsning: flera kakor i headern, skräpvärden, 4 delar,
 *        icke-numerisk utgar, okänd roll med KORREKT hmac ⇒ null.
 *   (7)  SESSION_SECRET-frånvaro ⇒ sessionsvägen TYST av: lasSession ⇒ null
 *        även för en cookie som var giltig; skapaSession ⇒ "".
 *   (8)  Rollmatrisen: redaktörs-session passerar tillat=["admin","redaktor"]
 *        (ADMIN_OCH_REDAKTOR) men NEKAS på admin-ytan (default tillat).
 *   (9)  Admin godkänd överallt: admin-session passerar såväl default som
 *        ADMIN_OCH_REDAKTOR.
 *   (10) ADMIN_PASSWORD-vägen består bakåtkompatibelt: header-lösenord
 *        (dev-fallback AK1A-2026) ⇒ null på default-ytan.
 *   (11) REDAKTOR_PASSWORD-vägen: godkas ENBART med ADMIN_OCH_REDAKTOR —
 *        på admin-ytan (default) ⇒ 401.
 *   (12) Fel lösenord ⇒ 401 med GENERELL text (ekar aldrig det felande).
 *   (13) v79 i produktion: NODE_ENV=production utan ADMIN_PASSWORD ⇒ 500 på
 *        default-ytan (oförändrat); admin-SESSION passerar ändå (graceful).
 *   (14) Prod + REDAKTOR_PASSWORD: redaktörslösenord ⇒ null på redaktörsyta,
 *        men 500 på admin-ytan (admin-lösenord saknas, rollen ej tillåten).
 *
 * Användning:  node verktyg/testa-admin-session.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { createHmac } from "node:crypto";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = path.join(REPO, "src", "lib", "admin-auth.ts");

// ── Testram (mönstret från verktyg/testa-mediabibliotek.mjs) ─────────────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}

// ── Miljöhantering (testerna styr process.env — modulen läser den LAZY) ──────
const ENV_NYCKLAR = ["SESSION_SECRET", "ADMIN_PASSWORD", "REDAKTOR_PASSWORD", "NODE_ENV"];
const SPARAD_ENV = Object.fromEntries(ENV_NYCKLAR.map((k) => [k, process.env[k]]));
function rensaEnv() {
  for (const k of ENV_NYCKLAR) delete process.env[k];
}
function aterstallEnv() {
  for (const [k, v] of Object.entries(SPARAD_ENV)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

/** Mock-req: allt requireAdmin/lasSessionFranCookie behöver är headers.get. */
function req({ cookie, losenord, bearer } = {}) {
  const headers = new Map();
  if (cookie) headers.set("cookie", cookie);
  if (losenord) headers.set("x-admin-password", losenord);
  if (bearer) headers.set("authorization", "Bearer " + bearer);
  return { headers: { get: (n) => headers.get(String(n).toLowerCase()) ?? null } };
}

const TEST_HEMLIGHET = "v83-test-session-nyckel";

/** Omräknad förväntad HMAC — kontraktet: HMAC-SHA256(nyckel, "<roll>.<utgar>"). */
function vantanHmac(roll, utgar) {
  return createHmac("sha256", TEST_HEMLIGHET).update(`${roll}.${String(utgar)}`, "utf8").digest("hex");
}

async function main() {
  // ── Importbro (v81-mönstret): "next/server" ⇒ stub, resten orörd ───────────
  let auth;
  const BRO_KALLA = path.join(REPO, "tool-results", "v83-admin-auth-importbro.ts");
  const STUB = path.join(REPO, "tool-results", "v83-next-server-stub.mjs");
  try {
    mkdirSync(path.dirname(BRO_KALLA), { recursive: true });
    writeFileSync(
      STUB,
      "export class NextRequest {}\n" +
        "export class NextResponse {\n" +
        "  static json(data, init = {}) { return { __stub: true, status: init.status ?? 200, data }; }\n" +
        "}\n",
    );
    const kalla = readFileSync(MODUL_SOKVAG, "utf8");
    const transformerad = kalla.replace('from "next/server"', `from "${pathToFileURL(STUB).href}"`);
    writeFileSync(BRO_KALLA, transformerad);
    auth = await import(pathToFileURL(BRO_KALLA).href);
  } catch (e) {
    console.error("[testa-admin-session] KUNDE INTE IMPORTERA MODULFILEN: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  } finally {
    try { unlinkSync(BRO_KALLA); } catch { /* redan borta */ }
    try { unlinkSync(STUB); } catch { /* redan borta */ }
  }
  const {
    skapaSession, lasSessionFranCookie, requireAdmin, forvantatRedaktorLosenord,
    forvantatLosenord, ADMIN_OCH_REDAKTOR, ADMIN_SESSION_KAKA,
  } = auth;

  // Deterministisk dev-start: inga lösenord i env ⇒ dev-fallbacks gäller,
  // SESSION_SECRET satt ⇒ sessionsvägen är på.
  rensaEnv();
  process.env.SESSION_SECRET = TEST_HEMLIGHET;

  // ── (1) Cookie-format ───────────────────────────────────────────────────────
  const nu = Date.now();
  const adminCookie = skapaSession("admin");
  const redaktorCookie = skapaSession("redaktor");
  const formatOK =
    /^admin\.\d+\.[0-9a-f]{64}$/.test(adminCookie) &&
    /^redaktor\.\d+\.[0-9a-f]{64}$/.test(redaktorCookie) &&
    Number(adminCookie.split(".")[1]) > nu &&
    Number(adminCookie.split(".")[1]) <= nu + 8 * 60 * 60 * 1000 + 10_000;
  kolla(
    'Cookie-format: "<roll>.<utgar>.<hmac>" med utgar ≈ nu+8 h och 64 hex hmac (admin+redaktör)',
    formatOK,
    "admin: " + adminCookie.slice(0, 24) + "… redaktör: " + redaktorCookie.slice(0, 24) + "…",
  );

  // ── (2) HMAC deterministisk ─────────────────────────────────────────────────
  const [aRoll, aUtgar, aSign] = adminCookie.split(".");
  const [rRoll, rUtgar, rSign] = redaktorCookie.split(".");
  const hmacOK =
    aSign === vantanHmac(aRoll, aUtgar) && rSign === vantanHmac(rRoll, rUtgar);
  kolla(
    "HMAC deterministisk: HMAC-SHA256(SESSION_SECRET, \"<roll>.<utgar>\") hex === signaturdelen",
    hmacOK,
    hmacOK ? "överensstämmer för båda rollerna" : "FEL: signaturen matchar inte kontraktet",
  );

  // ── (3) Giltig cookie ⇒ rätt roll ───────────────────────────────────────────
  const lasOK =
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${adminCookie}` })) === "admin" &&
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${redaktorCookie}` })) === "redaktor";
  kolla("lasSessionFranCookie: giltig cookie ⇒ rätt roll (admin + redaktör)", lasOK, "");

  // ── (4) Utgången vägrar ─────────────────────────────────────────────────────
  const utgangen = nu - 5_000;
  const utgangenCookie = `admin.${String(utgangen)}.${vantanHmac("admin", utgangen)}`;
  kolla(
    "Utgången vägrar: korrekt signerad cookie med utgar i dåtid ⇒ null",
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${utgangenCookie}` })) === null,
    "utgar = nu − 5 s, signaturen äkta — ändå vägran",
  );

  // ── (5) Tamper + roll-uppgradering ──────────────────────────────────────────
  const sista = aSign.slice(-1);
  const knäcktSign = aSign.slice(0, -1) + (sista === "a" ? "b" : "a");
  const uppgraderad = `admin.${rUtgar}.${rSign}`; // redaktörs signatur utgiven som admin
  kolla(
    "Tamper: fel signatur ⇒ null; roll-uppgradering (redaktörs signatur som admin) ⇒ null",
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${aRoll}.${aUtgar}.${knäcktSign}` })) === null &&
      lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${uppgraderad}` })) === null,
    "HMAC:en täcker både roll och utgång",
  );

  // ── (6) Cookie-parsning: ytterligheter ──────────────────────────────────────
  const blandad = `annan=kaka; ${ADMIN_SESSION_KAKA}=${adminCookie}; tredje=x`;
  const hackerUtgar = nu + 3_600_000;
  const hacker = `hacker.${String(hackerUtgar)}.${vantanHmac("hacker", hackerUtgar)}`;
  const parsning =
    lasSessionFranCookie(req({ cookie: blandad })) === "admin" &&
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=xyz` })) === null &&
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=a.b.c.d` })) === null &&
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=admin.abc.${aSign}` })) === null &&
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${hacker}` })) === null &&
    lasSessionFranCookie(req({})) === null;
  kolla(
    "Cookie-parsning: flera kakor ⇒ hittad; skräp/4 delar/icke-numerisk utgar/okänd roll (även med äkta hmac)/saknad ⇒ null",
    parsning,
    '"hacker"-rollen avvisas oavsett signatur — vitlista i parsern',
  );

  // ── (7) SESSION_SECRET-frånvaro ⇒ sessionsvägen TYST av ─────────────────────
  delete process.env.SESSION_SECRET;
  const utanSecret =
    lasSessionFranCookie(req({ cookie: `${ADMIN_SESSION_KAKA}=${adminCookie}` })) === null &&
    skapaSession("admin") === "";
  process.env.SESSION_SECRET = TEST_HEMLIGHET;
  kolla(
    "SESSION_SECRET-frånvaro ⇒ sessionsvägen av: giltig cookie ⇒ null, skapaSession ⇒ \"\"",
    utanSecret,
    "lösenordsvägen opåverkad (se 10–12) — prod kan aldrig låsa sig",
  );

  // ── (10) ADMIN_PASSWORD-vägen består (bakåtkompatibilitet) ──────────────────
  // (körs före rollmatrisen: DEV-fallback AK1A-2026 utan env, dev-läge)
  const devAdmin = forvantatLosenord();
  const devRedaktor = forvantatRedaktorLosenord();
  const bakatOK =
    devAdmin === "AK1A-2026" &&
    devRedaktor === "AK1A-REDAKTOR-2026" &&
    requireAdmin(req({ losenord: devAdmin })) === null;
  kolla(
    "ADMIN_PASSWORD-vägen bakåtkompatibel: dev-fallback AK1A-2026 ⇒ null på admin-ytan (default tillat)",
    bakatOK,
    "requireAdmin(req) utan tillat = admin-only, som före våg 83",
  );

  // ── (8) Rollmatrisen: redaktör på sin yta vs admin-yta ──────────────────────
  const redaktorReq = req({ cookie: `${ADMIN_SESSION_KAKA}=${redaktorCookie}` });
  const paSinYta = requireAdmin(redaktorReq, {}, ADMIN_OCH_REDAKTOR) === null;
  const paAdminYta = requireAdmin(redaktorReq); // default tillat = ["admin"]
  kolla(
    "Rollmatrisen: redaktör-session passerar ADMIN_OCH_REDAKTOR, NEKAS (401) på admin-ytan",
    paSinYta && paAdminYta !== null && paAdminYta.status === 401,
    "sin yta: null · admin-yta: " + String(paAdminYta && paAdminYta.status),
  );

  // ── (9) Admin godkänd överallt ──────────────────────────────────────────────
  const adminReq = req({ cookie: `${ADMIN_SESSION_KAKA}=${adminCookie}` });
  const adminAllt =
    requireAdmin(adminReq) === null &&
    requireAdmin(adminReq, {}, ADMIN_OCH_REDAKTOR) === null &&
    Array.isArray(ADMIN_OCH_REDAKTOR) &&
    ADMIN_OCH_REDAKTOR.length === 2 &&
    ADMIN_OCH_REDAKTOR[0] === "admin" &&
    ADMIN_OCH_REDAKTOR[1] === "redaktor";
  kolla("Admin godkänd överallt: admin-session ⇒ null på såväl default som ADMIN_OCH_REDAKTOR", adminAllt, "");

  // ── (11) REDAKTOR_PASSWORD-vägen ────────────────────────────────────────────
  const redPwReq = req({ losenord: "AK1A-REDAKTOR-2026" });
  const paRedYta = requireAdmin(redPwReq, {}, ADMIN_OCH_REDAKTOR);
  const paAdmYtan = requireAdmin(redPwReq); // default — redaktörslösenord FÅR ej passera
  kolla(
    "REDAKTOR_PASSWORD-vägen: godkas ENBART med tillat=[admin,redaktor]; på admin-ytan ⇒ 401",
    paRedYta === null && paAdmYtan !== null && paAdmYtan.status === 401,
    "redaktörsyta: null · admin-yta: " + String(paAdmYtan && paAdmYtan.status),
  );

  // ── (12) Fel lösenord ⇒ 401, GENERELL text ──────────────────────────────────
  const felSvar = requireAdmin(req({ losenord: "hej-hopp" }), {}, ADMIN_OCH_REDAKTOR);
  const felText = felSvar && felSvar.data && typeof felSvar.data.error === "string" ? felSvar.data.error : "";
  kolla(
    "Fel lösenord ⇒ 401 med generell text (ekar ALDRIG det felande lösenordet)",
    felSvar !== null && felSvar.status === 401 && !felText.includes("hej-hopp"),
    "text: \"" + felText.slice(0, 60) + "\"",
  );

  // ── (13) v79 i produktion: utan ADMIN_PASSWORD ⇒ 500; session ⇒ graceful ────
  process.env.NODE_ENV = "production";
  delete process.env.ADMIN_PASSWORD;
  delete process.env.REDAKTOR_PASSWORD;
  const prodSvar = requireAdmin(req({})); // default-yta, inget lösenord, ingen session
  const prodAdminSession = requireAdmin(
    req({ cookie: `${ADMIN_SESSION_KAKA}=${adminCookie}` }),
  );
  kolla(
    "v79 prod utan ADMIN_PASSWORD ⇒ 500 på admin-ytan (oförändrat); admin-SESSION passerar ändå",
    prodSvar !== null && prodSvar.status === 500 && prodAdminSession === null,
    "500-texten består; sessionsvägen är prod-låsets alternativa inköp",
  );

  // ── (14) Prod + REDAKTOR_PASSWORD ───────────────────────────────────────────
  process.env.REDAKTOR_PASSWORD = "prod-redaktor-pw";
  const prodRed =
    requireAdmin(req({ losenord: "prod-redaktor-pw" }), {}, ADMIN_OCH_REDAKTOR) === null;
  const prodRedAdminYta = requireAdmin(req({ losenord: "prod-redaktor-pw" }));
  kolla(
    "Prod + REDAKTOR_PASSWORD: redaktörsyta ⇒ null; admin-ytan ⇒ 500 (admin-lösenord saknas)",
    prodRed && prodRedAdminYta !== null && prodRedAdminYta.status === 500,
    "redaktör nekas ADMIN-ytor även med eget lösenord",
  );

  aterstallEnv();

  // ── Sammanställning (akm2-mönstret) ─────────────────────────────────────────
  let fail = 0;
  let nr = 0;
  for (const r of RADER) {
    nr += 1;
    const status = r.ok ? "PASS" : "FAIL";
    if (!r.ok) fail += 1;
    console.log(`${status}  ${String(nr).padStart(2)} · ${r.namn}${r.detalj ? " — " + r.detalj : ""}`);
  }
  console.log("");
  const grona = RADER.length - fail;
  console.log(`[testa-admin-session] ${grona}/${RADER.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
  if (!fail) {
    console.log("[testa-admin-session] Kontrakt A1: HMAC-format, utgångsvakten, rollmatrisen och v79-graceful — REN logik.");
  }
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  aterstallEnv();
  console.error("[testa-admin-session] FEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
