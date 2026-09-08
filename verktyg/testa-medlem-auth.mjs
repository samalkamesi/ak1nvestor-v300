#!/usr/bin/env node
/**
 * AK1A — Testsvit för MEDLEM-AUTH (src/lib/medlem-auth.ts, FAS L1 våg 86 —
 * STYRELSE-INLOGGNING-ADMIN.md, kontrakt V86-L1AUTH).
 *
 * REN LOGIK UTAN NÄTVERK: global fetch är stubbad genom hela sviten — varje
 * "svar" kommer från lokala fabrikcr. Bron (v81-mönstret från verktyg/
 * testa-admin-session.mjs) kopierar supabase-rest.ts (importfri) till
 * tool-results/ (gitignorad hjälpkatalog — aldrig i src/, aldrig tmp_-namngiven)
 * och skriver om medlem-auth.ts:s relativa import till kopian; modulen läses
 * med nodes typstrippring (node ≥ 22.18).
 *
 * Kontroller (≥ 10 enligt kontraktet):
 *   (1)  E-postvalidering: gemener-normalisering + ogiltiga format ⇒ null.
 *   (2)  Lösenordsvalidering: < 10 ⇒ null, = 10 ⇒ ok, > 72 ⇒ null.
 *   (3)  Signup-validering LOKALT: ogiltig e-post/kort lösenord ⇒ SPECIFIK
 *        feltext och fetch ALDRIG anropad (0 nätverksanrop).
 *   (4)  Signup SUPPRESSION: Supabage-fel (även "User already registered")
 *        ⇒ GENERISK "Kontot kunde inte skapas." — ekoar ALDRIG e-post,
 *        lösenord eller Supabase-detailjer.
 *   (5)  Signup lyckad: exakt POST /auth/v1/signup, anon-apikey-header, body
 *        med GEMENER-email, svar {ok, authId}.
 *   (6)  Signin: ogiltiga uppgifter ⇒ GENERISK "Fel e-post eller lösenord."
 *        (ALDRIG invalid_grant/epost); lyckad ⇒ {access, refresh, user} och
 *        exakt URL .../auth/v1/token?grant_type=password.
 *   (7)  P6-läckage: INGEN feltext innehåller lösenordet; token-fält saknas
 *        i alla fel-svar.
 *   (8)  Cookie-parsning: flera kakor, "="-padding i värde, saknad kaka,
 *        tom header ⇒ rätt/null.
 *   (9)  lasMedlemSession: giltig ⇒ {authId, epost} (gemener) via GET
 *        /auth/v1/user med Bearer; 401 ⇒ null; nätverksfel ⇒ null; saknad
 *        kaka ⇒ null UTAN fetch.
 *   (10) Bygg-hermetik: NEXT_PHASE=phase-production-build ⇒ signup/signin/
 *        session gör ALDRIG fetch (0 anrop) och svarar generiskt/null.
 *   (11) URL-hermetik (Mimosa-receptet): ALLA fetch-URL:ar matchar
 *        https://<ref>.supabase.co/(auth|rest)/v1/... — fasta literal-suffix.
 *   (12) fornyaMedlemSession: refresh-kaka ⇒ POST .../token?grant_type=
 *        refresh_token med refresh_token i kroppen; lyckad ⇒ nya tokens +
 *        session; avslagen ⇒ null.
 *   (13) medlemSignOut: POST /auth/v1/logout med "Bearer <access>"; ok ⇒
 *        true, nätverksfel ⇒ false (best-effort, kastar ALDRIG).
 *   (14) Kakhjälpare: sattMedlemKakor ⇒ 2 kakor httpOnly+secure+sameSite=lax
 *        +path=/ med maxAge 3600/2592000; rensaMedlemKakor ⇒ maxAge 0 + "".
 *   (15) utvarderaRateLimit: 9 i fönstret ⇒ öppet; 10 ⇒ limitad; utgångna
 *        städas; framtida tidsstämplar räknas EJ (t <= nu).
 *   (16) ipHash + klientIp: 16 hex, deterministisk, skiljer IP; xff-första,
 *        x-real-ip-fallback, "okand" som sista utväg.
 *   (17) epostHash + skrivMedlemProfilEvent: sha256-första-12; event-raden
 *        type=medlem med details.epostHash — INGEN e-post i klartext, INGET
 *        lösenordsfält, exakt POST /rest/v1/system_events.
 *
 * Användning:  node verktyg/testa-medlem-auth.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODUL_SOKVAG = path.join(REPO, "src", "lib", "medlem-auth.ts");
const SUPABASE_REST_SOKVAG = path.join(REPO, "src", "lib", "supabase-rest.ts");

// ── Testram (mönstret från verktyg/testa-admin-session.mjs) ─────────────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}

// ── Miljöhantering (testerna styr process.env — modulen läser den LAZY) ──────
const ENV_NYCKLAR = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PHASE",
];
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

// ── Fetch-stub: räknar anrop, svarar från fabrik — NÄTVERK ALDRIG ────────────
let ANROP = [];
let svarFabrik = () => nySvar(200, {});
const RIKTIG_FETCH = globalThis.fetch;
function nySvar(status, kropp) {
  // 204/205/304 FÅR inte ha kropp (Response-konstruktorn kastar annars) —
  // libbet läser aldrig kroppen på dessa statusar.
  if (status === 204 || status === 205 || status === 304) {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(kropp), { status, headers: { "Content-Type": "application/json" } });
}
function installeraFetchStub() {
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    ANROP.push({ url: u, init });
    return svarFabrik(u, init);
  };
}
function aterstallFetch() {
  globalThis.fetch = RIKTIG_FETCH;
}

/** Mock-req: allt libbet behöver är headers.get (admin-auth-mönstret). */
function req({ cookie, xff, realIp } = {}) {
  const headers = new Map();
  if (cookie) headers.set("cookie", cookie);
  if (xff) headers.set("x-forwarded-for", xff);
  if (realIp) headers.set("x-real-ip", realIp);
  return { headers: { get: (n) => headers.get(String(n).toLowerCase()) ?? null } };
}

/** Mock-svar med kak-insamlare (sattMedlemKakor/rensaMedlemKakor-målet). */
function svarMedKakor() {
  const kakor = [];
  return {
    kakor,
    cookies: { set: (namn, varde, attribut) => { kakor.push({ namn, varde, ...attribut }); } },
  };
}

async function main() {
  // ── Importbro (v81-mönstret): "./supabase-rest" ⇒ kopia i tool-results ────
  let m;
  const BRO_KALLA = path.join(REPO, "tool-results", "v86-medlem-auth-importbro.ts");
  const REST_KOPIA = path.join(REPO, "tool-results", "v86-medlem-auth-supabase-rest.ts");
  try {
    mkdirSync(path.dirname(BRO_KALLA), { recursive: true });
    writeFileSync(REST_KOPIA, readFileSync(SUPABASE_REST_SOKVAG, "utf8"));
    const kalla = readFileSync(MODUL_SOKVAG, "utf8");
    const transformerad = kalla.replace(
      'from "./supabase-rest"',
      `from "${pathToFileURL(REST_KOPIA).href}"`,
    );
    writeFileSync(BRO_KALLA, transformerad);
    m = await import(pathToFileURL(BRO_KALLA).href);
  } catch (e) {
    console.error("[testa-medlem-auth] KUNDE INTE IMPORTERA MODULFILEN: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  } finally {
    try { unlinkSync(BRO_KALLA); } catch { /* redan borta */ }
    try { unlinkSync(REST_KOPIA); } catch { /* redan borta */ }
  }
  const {
    valideraEpost, valideraLosenord, medlemSignup, medlemSignIn, medlemSignOut,
    lasKakaVarde, lasMedlemSession, fornyaMedlemSession,
    sattMedlemKakor, rensaMedlemKakor, MEDLEM_KAKA, MEDLEM_REFRESH_KAKA,
    utvarderaRateLimit, ipHash, klientIp, epostHash, skrivMedlemProfilEvent,
  } = m;

  rensaEnv();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://testproj.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-nyckel";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-nyckel";
  installeraFetchStub();

  const LOSSENORD = "hogskoleprovet-2026";
  const EPOST = "Anna@Exempel.com";

  // ── (1) E-postvalidering ────────────────────────────────────────────────────
  const epostOK =
    valideraEpost("Anna@Exempel.com") === "anna@exempel.com" &&
    valideraEpost("  anna@exempel.com  ") === "anna@exempel.com" &&
    valideraEpost("anna@exempel.se") === "anna@exempel.se" &&
    valideraEpost("hej") === null &&
    valideraEpost("hej@exempel") === null &&
    valideraEpost("") === null &&
    valideraEpost(null) === null &&
    valideraEpost(42) === null;
  kolla(
    "E-postvalidering: gemener+trim normaliseras; ogiltigt format/tom/icke-sträng ⇒ null",
    epostOK,
    '"Anna@Exempel.com" ⇒ "anna@exempel.com"',
  );

  // ── (2) Lösenordsvalidering ─────────────────────────────────────────────────
  const losenordOK =
    valideraLosenord("nio-teckn") === null && // 9 tecken ⇒ null
    valideraLosenord("tio-tecken") !== null && // 10 tecken ⇒ ok (gränsen inkluderad)
    valideraLosenord("a".repeat(72)) !== null &&
    valideraLosenord("a".repeat(73)) === null &&
    valideraLosenord("") === null &&
    valideraLosenord(undefined) === null;
  kolla(
    "Lösenordsvalidering: < 10 tecken ⇒ null; ≥ 10 och ≤ 72 ⇒ ok; > 72/icke-sträng ⇒ null",
    losenordOK,
    "policy: signup ≥ 10 (kontrakt L1), tak 72 (GoTrue/bcrypt)",
  );

  // ── (3) Signup-validering LOKALT — fetch ALDRIG anropad ─────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(200, {});
  const lokValEpost = await medlemSignup("inte-en-epost", LOSSENORD);
  const lokValLosen = await medlemSignup("anna@exempel.com", "korta");
  const antalAnropEfterVal = ANROP.length;
  const lokalValOK =
    !lokValEpost.ok && lokValEpost.fel === "Ogiltig e-postadress." &&
    !lokValLosen.ok && lokValLosen.fel === "Lösenordet måste vara minst 10 tecken." &&
    antalAnropEfterVal === 0;
  kolla(
    "Signup-validering LOKALT: ogiltig e-post/kort lösenord ⇒ specifik feltext, 0 nätverksanrop",
    lokalValOK,
    "valideringsfel är HARMLÖSA att visa (läcker inget om konton)",
  );

  // ── (4) Signup SUPPRESSION — generisk text, aldrig detaljer ─────────────────
  svarFabrik = () => nySvar(422, { error: "signup_requires_email", msg: "User already registered", code: 422 });
  const suppr = await medlemSignup("finns@redan.se", LOSSENORD);
  const textSuppr = suppr.ok ? "" : suppr.fel;
  const supprOK =
    !suppr.ok &&
    textSuppr === "Kontot kunde inte skapas." &&
    !textSuppr.includes("finns@redan.se") &&
    !textSuppr.toLowerCase().includes("registered") &&
    !textSuppr.includes("422");
  kolla(
    'Signup SUPPRESSION: Supabase-fel (t.o.m. "User already registered") ⇒ exakt generisk "Kontot kunde inte skapas."',
    supprOK,
    "kontots existens avslöjas ALDRIG ( enumerationsskydd)",
  );

  // ── (5) Signup lyckad: URL + headers + gemener-body + authId ────────────────
  ANROP = [];
  svarFabrik = () => nySvar(200, { access_token: "acc-1", refresh_token: "ref-1", user: { id: "auth-uuid-1", email: "anna@exempel.com" } });
  const lyckadSignup = await medlemSignup(EPOST, LOSSENORD);
  const signupAnrop = ANROP[0];
  const signupBody = signupAnrop ? JSON.parse(signupAnrop.init.body) : {};
  const signupOK =
    lyckadSignup.ok === true && lyckadSignup.authId === "auth-uuid-1" &&
    signupAnrop !== undefined &&
    signupAnrop.url === "https://testproj.supabase.co/auth/v1/signup" &&
    signupAnrop.init.method === "POST" &&
    signupAnrop.init.headers.apikey === "test-anon-nyckel" &&
    signupBody.email === "anna@exempel.com" &&
    signupBody.password === LOSSENORD;
  kolla(
    "Signup lyckad: exakt POST {origin}/auth/v1/signup, anon-apikey, body med GEMENER-epost, svar {ok, authId}",
    signupOK,
    "URL = validerat origin + FAST literal (Mimosa-receptet)",
  );

  // ── (6) Signin: generisk feltext + lyckad roundtrip ─────────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(400, { error: "invalid_grant", error_description: "Invalid login credentials" });
  const felSignin = await medlemSignIn("anna@exempel.com", "fel-lösenord!");
  const felSigninText = felSignin.ok ? "" : felSignin.fel;
  svarFabrik = () => nySvar(200, { access_token: "acc-2", refresh_token: "ref-2", user: { id: "auth-uuid-2", email: "Anna@Exempel.se" } });
  const okSignin = await medlemSignIn("ANNA@EXEMPEL.SE", LOSSENORD);
  const signinAnrop = ANROP[1];
  const signinOK =
    !felSignin.ok && felSigninText === "Fel e-post eller lösenord." &&
    !felSigninText.includes("invalid") && !felSigninText.includes("anna") &&
    okSignin.ok === true && okSignin.access === "acc-2" && okSignin.refresh === "ref-2" &&
    okSignin.user.authId === "auth-uuid-2" && okSignin.user.epost === "anna@exempel.se" &&
    signinAnrop.url === "https://testproj.supabase.co/auth/v1/token?grant_type=password" &&
    JSON.parse(signinAnrop.init.body).email === "anna@exempel.se";
  kolla(
    'Signin: fel ⇒ exakt "Fel e-post eller lösenord." (ALDRIG invalid_grant); lyckad ⇒ tokens + user, exakt /auth/v1/token?grant_type=password',
    signinOK,
    "epost i svaret normaliseras till gemener",
  );

  // ── (7) P6: lösenord/tokens läcker ALDRIG i feltexter ───────────────────────
  svarFabrik = () => nySvar(500, { error: "server_error" });
  const netSignin = await medlemSignIn("anna@exempel.com", LOSSENORD + "hemlig");
  const netSignup = await medlemSignup("anna@exempel.com", LOSSENORD + "hemlig");
  const p6OK =
    !netSignin.fel.includes(LOSSENORD) && !netSignup.fel.includes(LOSSENORD) &&
    !netSignin.fel.includes("hemlig") && !netSignup.fel.includes("hemlig") &&
    netSignin.fel === "Fel e-post eller lösenord." && netSignup.fel === "Kontot kunde inte skapas.";
  kolla(
    "P6: inget fel-svar innehåller lösenordet (eller token-fält) — nätverksfel ger samma generiska texter",
    p6OK,
    "ALDRIG logga/eka lösenord — Supabase sköter hashningen",
  );

  // ── (8) Cookie-parsning ─────────────────────────────────────────────────────
  const accessMedPadding = "eyJhbGci.eyJzdWIi.c2lnbg==";
  const parsning =
    lasKakaVarde(req({ cookie: `annan=1; ${MEDLEM_KAKA}=${accessMedPadding}; tredje=x` }), MEDLEM_KAKA) === accessMedPadding &&
    lasKakaVarde(req({ cookie: `${MEDLEM_REFRESH_KAKA}=ref-token-9` }), MEDLEM_KAKA) === null &&
    lasKakaVarde(req({ cookie: `${MEDLEM_KAKA}=` }), MEDLEM_KAKA) === "" &&
    lasKakaVarde(req({}), MEDLEM_KAKA) === null &&
    lasKakaVarde(req({ cookie: "skräp-utan-lika-tecken" }), MEDLEM_KAKA) === null;
  kolla(
    'Cookie-parsning: hittar rätt kaka bland flera; "="-padding bevaras; fel/saknad/tom ⇒ null resp ""',
    parsning,
    "JWT-base64 FÅR innehålla = — allt efter första = är värdet",
  );

  // ── (9) lasMedlemSession ────────────────────────────────────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(200, { id: "auth-uuid-9", email: "Anna@Exempel.se" });
  const giltig = await lasMedlemSession(req({ cookie: `${MEDLEM_KAKA}=acc-giltig` }));
  const userAnrop = ANROP[0];
  svarFabrik = () => nySvar(401, { error: "invalid_jwt" });
  const ogiltig = await lasMedlemSession(req({ cookie: `${MEDLEM_KAKA}=acc-utgangen` }));
  svarFabrik = () => { throw new Error("nätverksbortfall"); };
  const nett = await lasMedlemSession(req({ cookie: `${MEDLEM_KAKA}=acc-net` }));
  ANROP = [];
  const utanKaka = await lasMedlemSession(req({}));
  const sessionOK =
    giltig !== null && giltig.authId === "auth-uuid-9" && giltig.epost === "anna@exempel.se" &&
    userAnrop.url === "https://testproj.supabase.co/auth/v1/user" &&
    userAnrop.init.headers.Authorization === "Bearer acc-giltig" &&
    ogiltig === null && nett === null && utanKaka === null && ANROP.length === 0;
  kolla(
    "lasMedlemSession: giltig ⇒ {authId, epost} via GET /auth/v1/user med Bearer; 401/nätverksfel/saknad kaka ⇒ null (sista UTAN fetch)",
    sessionOK,
    "tyst null — aldrig fel-text, aldrig token-eko",
  );

  // ── (10) Bygg-hermetik: NEXT_PHASE=phase-production-build ───────────────────
  process.env.NEXT_PHASE = "phase-production-build";
  ANROP = [];
  svarFabrik = () => nySvar(200, { access_token: "a", refresh_token: "r", user: { id: "u", email: "a@b.co" } });
  const hermSignin = await medlemSignIn("anna@exempel.com", LOSSENORD);
  const hermSignup = await medlemSignup("anna@exempel.com", LOSSENORD);
  const hermSession = await lasMedlemSession(req({ cookie: `${MEDLEM_KAKA}=acc` }));
  const hermProfil = await skrivMedlemProfilEvent("auth-1", "anna@exempel.com");
  const hermOK =
    ANROP.length === 0 &&
    !hermSignin.ok && !hermSignup.ok && hermSession === null && hermProfil === false;
  delete process.env.NEXT_PHASE;
  kolla(
    "Bygg-hermetik: NEXT_PHASE=phase-production-build ⇒ signup/signin/session/profil gör 0 fetch och svarar generiskt/null/false",
    hermOK,
    "mönstret från variabler-lagring.ts våg 79 — aldrig nätverk under next build",
  );

  // ── (11) URL-hermetik (Mimosa) ──────────────────────────────────────────────
  // Samla ALLA URL:ar som gjorts hittills + en färsk profilskrivning.
  ANROP = [];
  svarFabrik = () => nySvar(201, {});
  await skrivMedlemProfilEvent("auth-1", "anna@exempel.com", "Anna A");
  await medlemSignOut("acc-ut");
  await fornyaMedlemSession(req({ cookie: `${MEDLEM_REFRESH_KAKA}=ref-gammal` }));
  const URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/(auth|rest)\/v1\/[a-z_]+(\?(grant_type=(password|refresh_token)))?$/;
  const urlOK =
    ANROP.length === 3 && ANROP.every((a) => URL_RE.test(a.url)) &&
    ANROP.some((a) => a.url.endsWith("/auth/v1/logout")) &&
    ANROP.some((a) => a.url === "https://testproj.supabase.co/rest/v1/system_events");
  kolla(
    "URL-hermetik (Mimosa-receptet): varje fetch-URL = https://<ref>.supabase.co + FAST literal (auth/v1/* | rest/v1/system_events) — ingen variabel i sökvägen",
    urlOK,
    ANROP.map((a) => a.url.replace("https://testproj.supabase.co", "")).join(" · "),
  );

  // ── (12) fornyaMedlemSession ────────────────────────────────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(200, { access_token: "acc-ny", refresh_token: "ref-ny", user: { id: "auth-uuid-12", email: "anna@exempel.se" } });
  const fornyad = await fornyaMedlemSession(req({ cookie: `${MEDLEM_REFRESH_KAKA}=ref-gammal` }));
  const fornyAnrop = ANROP[0];
  svarFabrik = () => nySvar(400, { error: "invalid_grant" });
  const dodRefresh = await fornyaMedlemSession(req({ cookie: `${MEDLEM_REFRESH_KAKA}=ref-dod` }));
  const utanRefresh = await fornyaMedlemSession(req({}));
  const fornyaOK =
    fornyad !== null && fornyad.access === "acc-ny" && fornyad.refresh === "ref-ny" &&
    fornyad.session.authId === "auth-uuid-12" &&
    fornyAnrop.url === "https://testproj.supabase.co/auth/v1/token?grant_type=refresh_token" &&
    JSON.parse(fornyAnrop.init.body).refresh_token === "ref-gammal" &&
    dodRefresh === null && utanRefresh === null;
  kolla(
    "fornyaMedlemSession: refresh-kaka ⇒ POST /auth/v1/token?grant_type=refresh_token med refresh_token; lyckad ⇒ nya tokens + session; död/saknad ⇒ null",
    fornyaOK,
    "rotation levererad i L1 (API-rutten sätter om kakorna)",
  );

  // ── (13) medlemSignOut ──────────────────────────────────────────────────────
  ANROP = [];
  svarFabrik = () => nySvar(204, {});
  const utOK = await medlemSignOut("acc-utloggning");
  const utAnrop = ANROP[0];
  svarFabrik = () => { throw new Error("nätverksbortfall"); };
  const utNett = await medlemSignOut("acc-utloggning");
  const signOutOK =
    utOK === true && utNett === false &&
    utAnrop.url === "https://testproj.supabase.co/auth/v1/logout" &&
    utAnrop.init.method === "POST" &&
    utAnrop.init.headers.Authorization === "Bearer acc-utloggning" &&
    utAnrop.init.headers.apikey === "test-anon-nyckel";
  kolla(
    "medlemSignOut: POST /auth/v1/logout med Bearer access (på anon-grunden); 204 ⇒ true; nätverksfel ⇒ false (kastar ALDRIG)",
    signOutOK,
    "best-effort — kakorna rensas av rutten oavsett",
  );

  // ── (14) Kakhjälpare: attribut + maxAge ─────────────────────────────────────
  const satt = svarMedKakor();
  sattMedlemKakor(satt, "acc-x", "ref-x");
  const rens = svarMedKakor();
  rensaMedlemKakor(rens);
  const accessKaka = satt.kakor.find((k) => k.namn === MEDLEM_KAKA);
  const refreshKaka = satt.kakor.find((k) => k.namn === MEDLEM_REFRESH_KAKA);
  const attributOK = (k, maxAge) =>
    k.httpOnly === true && k.secure === true && k.sameSite === "lax" && k.path === "/" && k.maxAge === maxAge;
  const kakOK =
    satt.kakor.length === 2 &&
    accessKaka.varde === "acc-x" && attributOK(accessKaka, 3600) &&
    refreshKaka.varde === "ref-x" && attributOK(refreshKaka, 30 * 24 * 60 * 60) &&
    rens.kakor.length === 2 &&
    rens.kakor.every((k) => k.varde === "" && k.maxAge === 0 && k.httpOnly === true);
  kolla(
    "Kakhjälpare: satt ⇒ ak1a_medlem 1 h + ak1a_medlem_refresh 30 d, båda httpOnly+secure+sameSite=lax+path=/; rensa ⇒ maxAge 0 + tomt värde",
    kakOK,
    "sessionstokens ENDAST i httpOnly-kakor — ALDRIG localStorage (L1-beslutet)",
  );

  // ── (15) utvarderaRateLimit (ren logik) ─────────────────────────────────────
  const nu = 1_000_000;
  const nio = Array.from({ length: 9 }, (_, i) => nu - i * 1000);
  const tio = [...nio, nu];
  const medUtgangna = [...nio, nu - 61_000, nu - 120_000];
  const medFramtida = [...nio, nu + 5_000];
  const rlOK =
    utvarderaRateLimit(nio, nu, 10).limitad === false &&
    utvarderaRateLimit(nio, nu, 10).stansade.length === 9 &&
    utvarderaRateLimit(tio, nu, 10).limitad === true &&
    utvarderaRateLimit(medUtgangna, nu, 10).limitad === false && // 9 kvar i fönstret
    utvarderaRateLimit(medUtgangna, nu, 10).stansade.length === 9 &&
    utvarderaRateLimit(medFramtida, nu, 10).stansade.length === 9; // framtid räknas ej
  kolla(
    "utvarderaRateLimit: 9 i fönstret ⇒ öppet; 10 ⇒ limitad; > 60 s gamla städas; framtida tidsstämplar räknas EJ",
    rlOK,
    "10 fel/minut per IP-hash (KRITA) — ENDAST misslyckade försök räknas",
  );

  // ── (16) ipHash + klientIp ──────────────────────────────────────────────────
  const ipOK =
    /^[0-9a-f]{16}$/.test(ipHash("203.0.113.7")) &&
    ipHash("203.0.113.7") === ipHash("203.0.113.7") &&
    ipHash("203.0.113.7") !== ipHash("203.0.113.8") &&
    klientIp(req({ xff: "203.0.113.7, 70.41.3.18" })) === "203.0.113.7" &&
    klientIp(req({ xff: "  " , realIp: "198.51.100.9" })) === "198.51.100.9" &&
    klientIp(req({})) === "okand";
  kolla(
    "ipHash: 16 hex, deterministisk, skiljer IP:er; klientIp: xff-FÖRSTA värde → x-real-ip → \"okand\"",
    ipOK,
    "raw-IP:n lagras ALDRIG — endast sha256-nyckeln (GDPR-minimering)",
  );

  // ── (17) epostHash + skrivMedlemProfilEvent ─────────────────────────────────
  const vantanHash = createHash("sha256").update("anna@exempel.com", "utf8").digest("hex").slice(0, 12);
  ANROP = [];
  svarFabrik = () => nySvar(201, {});
  const profilOKSkriven = await skrivMedlemProfilEvent("auth-uuid-17", "Anna@Exempel.com", "Anna A");
  const profilAnrop = ANROP[0];
  const profilRader = profilAnrop ? JSON.parse(profilAnrop.init.body) : [];
  const profilRad = Array.isArray(profilRader) ? profilRader[0] : {};
  const detaljer = profilRad.details || {};
  const profilText = profilAnrop ? profilAnrop.init.body : "";
  const profilOK =
    profilOKSkriven === true &&
    epostHash("Anna@Exempel.com") === vantanHash && epostHash("anna@exempel.com") === vantanHash &&
    epostHash("anna@exempel.com") !== epostHash("anders@exempel.com") &&
    profilAnrop.url === "https://testproj.supabase.co/rest/v1/system_events" &&
    profilAnrop.init.method === "POST" &&
    profilRad.type === "medlem" && profilRad.severity === "info" &&
    detaljer.authId === "auth-uuid-17" && detaljer.epostHash === vantanHash &&
    detaljer.namn === "Anna A" && typeof detaljer.skapad === "string" &&
    !profilText.includes("anna@") && !profilText.includes("Anna@") &&
    !profilText.toLowerCase().includes("password") &&
    !profilText.toLowerCase().includes("losenord");
  kolla(
    "skrivMedlemProfilEvent: POST /rest/v1/system_events med type=medlem, details={authId, epostHash (sha256 första 12), namn?, skapad} — INGEN e-post/lösenord i klartext",
    profilOK,
    "epostHash: " + vantanHash + " — GDPR-minimering enligt L1",
  );

  aterstallFetch();
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
  console.log(`[testa-medlem-auth] ${grona}/${RADER.length} kontroller gröna${fail ? ", " + fail + " FAIL" : ""}.`);
  if (!fail) {
    console.log("[testa-medlem-auth] Kontrakt L1: validering, suppression, cookies, hermetik, rate-limit — REN logik, nätverk stubbat.");
  }
  process.exitCode = fail ? 1 : 0;
}

main().catch((e) => {
  aterstallFetch();
  aterstallEnv();
  console.error("[testa-medlem-auth] FEL: " + (e && e.message ? e.message : String(e)));
  process.exitCode = 1;
});
