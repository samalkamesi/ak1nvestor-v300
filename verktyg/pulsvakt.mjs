#!/usr/bin/env node
/**
 * PULSVAKTEN (våg 122A) — styrelsens beslut mtzou25g, åtgärd 1
 * =====================================================================
 * Evig node-loop (egen pm2-process 'pulsvakt', cwd /home/ak1a/AK1) som
 * mäter sajtpulsen och själv startar om appen vid lokalt fel:
 *
 *   VAR 60 s (loopback, Host-header lab.ak1nvestor.com — whitelistad i
 *   middleware, ingen 429-störning):
 *     (a) GET http://127.0.0.1:3000/                 → kräv HTTP 200
 *     (b) GET http://127.0.0.1:3000/api/sok?q=akm2   → kräv 200 + JSON
 *         404 = endpointen ej deployad ännu → VARNING "väntar deploy"
 *   VAR 10:E VARV (≈ 10 min) även externt:
 *     (c) GET https://lab.ak1nvestor.com/ (timeout 10 s) → fångar
 *         nginx-/certifikat-/DNS-fel (kan ej sudo-omstarta → larm direkt)
 *
 * Självläkning: fel på (a)/(b) → `pm2 restart ak1a --update-env` via
 * child_process (processen körs som användaren ak1a — tillåtet utan
 * sudo). TAK: max 1 omstart per minut; 10 omstarter utan en enda OK
 * kontroll → auto-omstarten stängs av (larm högprio) tills appen svarar
 * igen — ALDRIG loop-restart (same doktorin som ak1a-halsa).
 * 3 misslyckade kontroller i rad → högprio-larm.
 *
 * DEPLOYLÅS (rond 50, femte observationen 08:43): medan flock
 * /tmp/ak1a-deploy.lock hålls (prodbygg pågår) SKJUTS auto-omstarten upp —
 * deploy-kedjan äger pm2-omstarten i det fönstret, och en extra omstart
 * mitt i npm ci+build dödar appen under pågående bygge. Felräkning och
 * högprio-larm vid felrad kvarstår (ett fastfruset bygg ska inte tystas);
 * saknad flock/fel = ingen deploy (fail-safe: omstart som förr).
 *
 * LARM: JSON-rader i data/vakten/pulsvakt-larm.log (självvänande, max
 * 5000 rader). Status VARJE varv: data/vakten/pulsvakt-status.json.
 * OBS: styrelse-ronden läser (ännu) bara data/vakten/senaste-korning.txt
 * — kopplingen pulsvakt→rond kräver huvudagenten (se våg 122A-rapport).
 *
 * Användning:
 *   pm2 start verktyg/pulsvakt.mjs --name pulsvakt   (drift, se
 *     data/infra/contabo/pulsvakt-start.sh)
 *   node verktyg/pulsvakt.mjs --test                 (ETT varv, skriver
 *     ENDAST ut resultatet — inga filer, inga pm2-åtgärder; KVD-läge)
 *
 * Designregel: ALLT i try/catch — processen får ALDRIG krascha (pm2
 * superviserar ändå, men tyst överlevande är billigare än omstarter).
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VAKTKATALOG = path.join(ROT, "data", "vakten");
const LARMLOGG = path.join(VAKTKATALOG, "pulsvakt-larm.log");
const STATUSFIL = path.join(VAKTKATALOG, "pulsvakt-status.json");

const INTERN_BAS = process.env.AK1A_PULSVAKT_BAS || "http://127.0.0.1:3000";
const EXTERN_URL = "https://lab.ak1nvestor.com/";
const HOST_RUBRIK = "lab.ak1nvestor.com";
const VARV_MS = 60_000; // ett varv per minut
const EXTERNT_VARV = 10; // extern koll var 10:e varv (≈ 10 min)
const INTERN_TAK_MS = 8_000;
const EXTERN_TAK_MS = 10_000;
const MAX_OMSTART_PER_MIN_MS = 60_000;
const FELRAD_LARM = 3; // misslyckade kontroller i rad → högprio
const MAX_OMSTART_UTAN_OK = 10; // därefter stängs auto-omstart av
const MAX_LARM_RADER = 5_000; // loggens självvänande tak

const TESTLAGE = process.argv.includes("--test");

// ── Tillstånd (processminne; statusfilen är läsarnas sanning) ───────────────
const st = {
  felrad: 0,
  omstarter: 0,
  senasteOmstart: 0,
  omstarterUtanOk: 0,
  autoAvstangd: false,
  varv: 0,
  sokVantarDeploy: false,
};

function nuIso() {
  return new Date().toISOString();
}

// Deploybyggen (prod-synk.mjs "flock -w 900", deploya-contabo.sh "flock -n")
// håller låset under npm ci + build + pm2 restart — i det fönstret äger
// deploy-kedjan omstarten. Endast exit 1 ("hålls") räknas som deploy;
// saknad flock/övriga fel → false (fail-safe: omstart som förr).
function deployPagar() {
  try {
    execFileSync("flock", ["-n", "/tmp/ak1a-deploy.lock", "true"], {
      timeout: 5_000, stdio: "ignore",
    });
    return false;                          // låset togs → inget bygg pågår
  } catch (e) { return e?.status === 1; }  // exit 1 = hålls av bygg
}

/** Skriv statusfilen — de fem kontraktsfälten + diagnostik. Får aldrig kasta. */
function skrivStatus(falt) {
  try {
    fs.mkdirSync(VAKTKATALOG, { recursive: true });
    fs.writeFileSync(
      STATUSFIL,
      JSON.stringify(
        {
          senasteKoll: falt.senasteKoll,
          senasteOk: falt.senasteOk,
          senasteFel: falt.senasteFel,
          antalOmstarter: st.omstarter,
          lever: true,
          felIRad: st.felrad,
          sokVantarDeploy: st.sokVantarDeploy,
          autoOmstandAvstangd: st.autoAvstangd,
          varv: st.varv,
          processPid: process.pid,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    console.error(`${nuIso()} STATUSFIL-FEL (lever vidare): ${String(e).slice(0, 120)}`);
  }
}

/** Appenda en JSON-larmrad + självsänk loggen till max 5000 rader.
 *  I --test-läge skrivs INGA filer (KVD-läge är rent). */
function larma(niva, kalla, detalj) {
  const rad = JSON.stringify({ ts: nuIso(), niva, kalla, detalj });
  if (!TESTLAGE) {
    try {
      fs.mkdirSync(VAKTKATALOG, { recursive: true });
      fs.appendFileSync(LARMLOGG, rad + "\n");
      // Självvänning: behåll bara de sista MAX_LARM_RADER raderna.
      const innehall = fs.readFileSync(LARMLOGG, "utf8").split("\n").filter(Boolean);
      if (innehall.length > MAX_LARM_RADER) {
        fs.writeFileSync(LARMLOGG, innehall.slice(-MAX_LARM_RADER).join("\n") + "\n");
      }
    } catch (e) {
      console.error(`${nuIso()} LARMFIL-FEL (lever vidare): ${String(e).slice(0, 120)}`);
    }
  }
  console.log(`${nuIso()} LARM ${niva} ${kalla}: ${detalj}`);
}

/** GET med tydlig timeout — returnerar {ok, status, content_type, fel}. */
async function get(url, takMs, extern = false) {
  try {
    const sv = await fetch(url, {
      headers: extern ? {} : { Host: HOST_RUBRIK },
      redirect: "manual", // 301/302 är ett fel, inte en framgång
      signal: AbortSignal.timeout(takMs),
    });
    return { ok: sv.ok, status: sv.status, content_type: sv.headers.get("content-type") || "" };
  } catch (e) {
    const orsak = e?.cause?.code || e?.name || String(e);
    return { ok: false, status: 0, content_type: "", fel: String(orsak).slice(0, 120) };
  }
}

/** (a) Framsidan via loopback — kräv 200. */
async function kollaFramsida() {
  const r = await get(`${INTERN_BAS}/`, INTERN_TAK_MS);
  if (r.ok && r.status === 200) return { ok: true };
  return {
    ok: false,
    text: `framside-svar ${r.status || "inget"}${r.fel ? ` (${r.fel})` : ""}`,
  };
}

/** (b) Sök-API:t via loopback — kräv 200 + JSON; 404 = väntar deploy (VARNING). */
async function kollaSok() {
  const r = await get(`${INTERN_BAS}/api/sok?q=akm2`, INTERN_TAK_MS);
  if (r.ok && r.status === 200 && r.content_type.includes("json")) {
    st.sokVantarDeploy = false;
    return { ok: true };
  }
  if (r.status === 404) {
    // Endpointen deployas senare i våg 122 — väntar, är INTE ett fel.
    if (!st.sokVantarDeploy) {
      st.sokVantarDeploy = true;
      larma("varning", "sok", "sok: väntar deploy (404 på /api/sok?q=akm2)");
    }
    return { ok: true, varning: "sok: väntar deploy" };
  }
  return {
    ok: false,
    text: `api/sok-svar ${r.status || "inget"}${r.fel ? ` (${r.fel})` : ""}` +
      (r.content_type ? ` CT=${r.content_type.split(";")[0]}` : ""),
  };
}

/** (c) Externt via https — fångar nginx-/cert-/DNS-fel. */
async function kollaExtern() {
  const r = await get(EXTERN_URL, EXTERN_TAK_MS, true);
  if (r.ok) return { ok: true };
  return {
    ok: false,
    text: `extern-svar ${r.status || "inget"}${r.fel ? ` (${r.fel})` : ""}` +
      " — nginx/cert/DNS; KAN INTE auto-omstartas (sudo spärrat)",
  };
}

/** pm2-omstart av appen — körs som användaren ak1a (tillåtet utan sudo). */
function omstartaApp() {
  try {
    execFileSync("pm2", ["restart", "ak1a", "--update-env"], {
      encoding: "utf8",
      timeout: 90_000,
      stdio: "ignore",
    });
    st.omstarter++;
    st.senasteOmstart = Date.now();
    st.omstarterUtanOk++;
    return true;
  } catch (e) {
    larma("hogprio", "omstart", `pm2 restart ak1a MISSLYCKADES: ${String(e.message).slice(0, 150)}`);
    return false;
  }
}

/** ETT kontrollvarv. Returnerar summering; ALLT fångas av anroparen. */
async function kontrollvarv(externOckså) {
  st.varv++;
  const a = await kollaFramsida();
  const b = await kollaSok();
  const interntOk = a.ok && b.ok;
  let c = { ok: true, hoppadeOver: true };

  if (externOckså) c = await kollaExtern();

  // ── Lokalt fel (a/b): räkna, omstart (med tak), larm ────────────────────
  if (!interntOk) {
    st.felrad++;
    const detalj = [a.ok ? null : a.text, b.ok ? null : b.text].filter(Boolean).join(" · ");
    larma(st.felrad >= FELRAD_LARM ? "hogprio" : "fel", "lokal", detalj);
    if (st.felrad >= FELRAD_LARM) {
      larma("hogprio", "felrad", `${st.felrad} misslyckade kontroller i rad`);
    }
    const takOk = Date.now() - st.senasteOmstart >= MAX_OMSTART_PER_MIN_MS;
    const deploy = takOk && !st.autoAvstangd ? deployPagar() : false;
    if (takOk && !st.autoAvstangd && !deploy) {
      omstartaApp();
      larma(
        "info",
        "omstart",
        `pm2 restart ak1a körd (omstart ${st.omstarter}, felrad ${st.felrad})`,
      );
      if (st.omstarterUtanOk >= MAX_OMSTART_UTAN_OK) {
        st.autoAvstangd = true;
        larma(
          "hogprio",
          "autoavstangd",
          `${st.omstarterUtanOk} omstarter utan en enda OK-kontroll — auto-omstarten STÄNGD` +
            " tills appen svarar igen (manuell granskning krävs)",
        );
      }
    } else if (takOk && !st.autoAvstangd && deploy) {
      // Rond 50: bygget äger omstarten — en extra pm2-restart mitt i
      // npm ci+build dödar appen under pågående deploy (08:43-fallet).
      larma(
        "info",
        "omstart-uppskjuten",
        "deploybygg pågår (ak1a-deploy.lock hålls) — omstart uppskjuten, deploy-kedjan äger pm2-omstarten",
      );
    } else if (!takOk) {
      larma("varning", "omstarttak", "omstart-tak (1/min) — väntar nästa varv");
    }
  } else {
    // Friskt igen: nollställ räknare, ev. återaktivera auto-omstart.
    if (st.felrad > 0 || st.autoAvstangd) {
      larma("info", "aterstall", `app svarar igen efter ${st.felrad} fel i rad — nollställer`);
    }
    st.felrad = 0;
    st.omstarterUtanOk = 0;
    st.autoAvstangd = false;
  }

  // ── Externt fel (c): kan ej åtgärdas utan sudo → högprio direkt ─────────
  if (externOckså && !c.ok) {
    larma("hogprio", "extern", c.text);
  }

  return { a, b, c, interntOk };
}

/** Huvudloop — evig; varje varv isolerat i try/catch (ALDRIG krascha). */
async function huvudloop() {
  console.log(`${nuIso()} PULSVAKTEN startar (pid ${process.pid}, varv ${VARV_MS / 1000}s,` +
    ` extern var ${EXTERNT_VARV}:e varv, bas ${INTERN_BAS})`);
  // Uppstartsläge: skriv direkt så läsaren ser liv direkt.
  skrivStatus({ senasteKoll: nuIso(), senasteOk: null, senasteFel: null });
  for (;;) {
    let resultat = null;
    try {
      resultat = await kontrollvarv(st.varv % EXTERNT_VARV === EXTERNT_VARV - 1);
    } catch (e) {
      // Isolerat skyddsnät — kontrollvarv fångar själv, detta är baktvätten.
      try {
        larma("hogprio", "ovantat", `kontrollvarv kastade: ${String(e).slice(0, 150)}`);
      } catch { /* logg-bakslag dödar aldrig vakten */ }
    }
    try {
      skrivStatus({
        senasteKoll: nuIso(),
        senasteOk: resultat?.interntOk ? nuIso() : null,
        senasteFel: resultat && !resultat.interntOk
          ? [resultat.a.ok ? null : resultat.a.text, resultat.b.ok ? null : resultat.b.text]
              .filter(Boolean).join(" · ")
          : null,
      });
    } catch { /* skrivStatus fångar själv */ }
    await new Promise((sov) => setTimeout(sov, VARV_MS));
  }
}

/** KVD-läge: ETT varv, ENDAST utskrift — inga filer, inga pm2-åtgärder. */
async function testlage() {
  console.log(`PULSVAKTEN --test ${nuIso()} (ett varv, inga pm2-åtgärder, inga filer)`);
  const a = await kollaFramsida();
  const b = await kollaSok();
  const c = await kollaExtern();
  const rad = (n, r, krav) =>
    `${n}: ${r.ok ? "OK" : "FEL"} — ${krav}` +
    (r.varning ? ` [VARNING: ${r.varning}]` : "") +
    (r.text ? ` [${r.text}]` : "");
  console.log(rad("(a) framside", a, "GET / loopback → HTTP 200"));
  console.log(rad("(b) sok-api  ", b, "GET /api/sok?q=akm2 → 200 + JSON (404 = väntar deploy)"));
  console.log(rad("(c) extern   ", c, `GET ${EXTERN_URL} → 200 (nginx/cert)`));
  const interntOk = a.ok && b.ok;
  console.log(
    interntOk
      ? `RESULTAT: INTERN PULS OK${c.ok ? " · EXTERN OK" : " · EXTERN FEL (hogprio-larm i drift)"}`
      : "RESULTAT: INTERN PULS FEL (i driftläge: pm2-omstart + larm)",
  );
  process.exit(interntOk ? 0 : 1);
}

// Entré: --test körs en gång; annars evig loop med totalkylningsnät.
if (TESTLAGE) {
  testlage().catch((e) => {
    console.error(`--test FEL: ${String(e).slice(0, 200)}`);
    process.exit(2);
  });
} else {
  huvudloop().catch((e) => {
    // Sista utvägen — ska i praktiken aldrig nås (loopen fångar allt själv).
    console.error(`${nuIso()} PULSVAKTEN OVÄNTAT STOPP: ${String(e).slice(0, 200)}`);
    process.exit(1); // pm2 supervisor startar om oss — vakten vakar vidare.
  });
}
