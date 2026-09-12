#!/usr/bin/env node
/**
 * AK1A — Testsvit för B2B-AKTIVERINGSGRINDEN (våg 77 / V86, kontraktet i
 * src/lib/b2b-status.ts + STYRELSE-B2B-VARIABLER.md beslut B1).
 *
 * REN LOGIK UTAN NÄTVERK: inga fetch-anrop, inga fil-uppladdningar — bara
 * process.env-styrning + import av källmodulerna. Tre ÄRLIGA nivåer:
 *
 *   NIVÅ 1 — DIREKTIMPORT (node ≥ 22.18, type stripping):
 *     src/lib/b2b-status.ts (0 imports) — b2bAktiv():s env-matris. Exakt
 *     sträng "1" är ENDAST sant värde; unset/"0"/"true"/"yes"/"TRUE"/" 1"
 *     är AV. Värdet läses LAZY (i funktionskroppen) — runtime-växling OK.
 *
 *   NIVÅ 2 — IMPORTBRO (våg 99 la till runtime-import av @/lib/tier-status
 *     i robots.ts — Node-native typstripping kan inte lösa @/-alias, därför
 *     bro på NIVÅ 3-mönstret): src/app/robots.ts — Allow "/pro/" endast när
 *     NEXT_PUBLIC_B2B_AKTIV=1 VID MODULINLÄSNING (PUBLIKA_YTOR är top-level)
 *     → bron importeras två gånger (query-bust ?lage=av / ?lage=pa). Disallow
 *     "/pro/admin" gäller ALLTID (även PÅ).
 *
 *   NIVÅ 3 — IMPORTBRO (mönstret från verktyg/testa-mediabibliotek.mjs):
 *     src/lib/meny-register.ts — @/-alias skrivs om till absoluta file://-
 *     URL:er (member-local/kurs-access/b2b-status — alla rena löv utan
 *     egna imports; ordlista är typimport och raderas). Kontrakt:
 *       • punkten "/pro" (b2b: true, yttor ["footer","sok"]) är DOLD i
 *         ALLA ytor när b2bAktiv() är AV (sektionPunkter-filter);
 *       • SYNLIG i footer+sok när PÅ;
 *       • ALDRIG i meny-panelerna (yttor-kontraktet, oberoende av grind);
 *       • filterväxlingen styrs runtime (b2bAktiv() anropas per filtrering).
 *
 *   NIVÅ 4 — KÄLLKONTRAKT (filläsning, INGEN import — komponenterna är
 *     React/klientkod som inte kan köras rent): att grind-wiringen FINNS
 *     i pro/layout.tsx (early-return av Under-uppbyggnad + noindex),
 *     toppvaxel.tsx (endast Privatperson när AV), chat-widget.tsx (Pro-
 *     förslag bakom b2bAktiv) och sokindex.ts (b2b-filter på STATISKA).
 *     Plus RESIDUAL-VAKTER: V86:s två kända residualer (sitemap.ts +
 *     /pro/priser robots) är STÄNGDA av senare våg — kontrollerna
 *     bevakar att grindningen består (se V86-B2B-AKTIVERING.md).
 *
 * Användning:  node verktyg/testa-b2b-grind.mjs   (node ≥ 22.18)
 * Avslutskod:  0 om inga FAIL, 1 annars.
 */
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_NYCKEL = "NEXT_PUBLIC_B2B_AKTIV";

// ── Testram (mönstret från verktyg/testa-mediabibliotek.mjs) ─────────────────
const RADER = [];
function kolla(namn, ok, detalj = "") {
  RADER.push({ namn, ok: !!ok, detalj });
}
const las = (rel) => readFileSync(path.join(REPO, rel), "utf8");

// ── Miljöhantering — testen äger ENV_NYCKEL, sparas/återställs runt sviten ──
const SPARAD = process.env[ENV_NYCKEL];
function setEnv(v) {
  if (v === undefined) delete process.env[ENV_NYCKEL];
  else process.env[ENV_NYCKEL] = v;
}

async function main() {
  // ═══ NIVÅ 1 — b2b-status.ts: env-matrisen (DIREKTIMPORT) ═════════════════
  const b2b = await import(
    pathToFileURL(path.join(REPO, "src", "lib", "b2b-status.ts")).href
  );
  const fallen = [
    [undefined, false, "unset (default i prod)"],
    ["1", true, 'exakt "1" — ENDAST sanna värdet'],
    ["0", false, '"0"'],
    ["true", false, '"true" (sträng, ej "1")'],
    ["TRUE", false, '"TRUE"'],
    ["yes", false, '"yes"'],
    [" 1", false, '" 1" (mellanslag — ej trimmat)'],
    ["2", false, '"2"'],
  ];
  for (const [varde, vantat, etikett] of fallen) {
    setEnv(varde);
    kolla(
      `N1 b2bAktiv(): ${etikett} ⇒ ${vantat ? "PÅ" : "AV"}`,
      b2b.b2bAktiv() === vantat,
      `fick ${b2b.b2bAktiv()}`,
    );
  }
  // Lazy-kontraktet: samma import växlar vid runtime (krav för N3).
  setEnv("1");
  const pa1 = b2b.b2bAktiv();
  setEnv(undefined);
  const av1 = b2b.b2bAktiv();
  kolla(
    "N1 b2bAktiv() läser env LAZY (runtime-växling utan re-import)",
    pa1 === true && av1 === false,
  );

  // ═══ NIVÅ 2 — robots.ts: Allow /pro/ endast vid PÅ (IMPORTBRO) ═══════════
  // PUBLIKA_YTOR evalueras vid modulinläsning → bron importeras två gånger
  // (query-bust). Bron skriver om @/-alias till absoluta file://-URL:er i en
  // gitignorad hjälpfil under tool-results/ (ALDRIG i src/), tas bort efteråt.
  // (Fix 2026-09-12, våg-agent V2: våg 99:s `import { tierAktiv } from
  // "@/lib/tier-status"` i robots.ts gav ERR_MODULE_NOT_FOUND vid direkt-
  // import — bro är samma mönster som NIVÅ 3 redan använder.)
  const robotsBroSokvag = path.join(REPO, "tool-results", "v2-b2b-robots-bro.ts");
  let robotsUrl;
  try {
    mkdirSync(path.dirname(robotsBroSokvag), { recursive: true });
    let robotsKalla = las(path.join("src", "app", "robots.ts"));
    robotsKalla = robotsKalla.replaceAll(
      /"@\/lib\/([a-zA-Z0-9_-]+)"/g,
      (_hela, modul) => JSON.stringify(pathToFileURL(path.join(REPO, "src", "lib", modul + ".ts")).href),
    );
    writeFileSync(robotsBroSokvag, robotsKalla);
    robotsUrl = pathToFileURL(robotsBroSokvag).href;
  } catch (e) {
    console.error("[testa-b2b-grind] KUNDE INTE BYGGA ROBOTS-BRON: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  }

  setEnv(undefined);
  const robotsAv = (await import(robotsUrl + "?lage=av")).default();
  const stjarnaAv = robotsAv.rules.find((r) => r.userAgent === "*" || (Array.isArray(r.userAgent) && r.userAgent.includes("*")));
  kolla("N2 robots AV: Allow-listan saknar /pro/", !stjarnaAv.allow.includes("/pro/"));
  kolla("N2 robots AV: publika ytor kvar (/kurser/, /llms.txt)", stjarnaAv.allow.includes("/kurser/") && stjarnaAv.allow.includes("/llms.txt"));
  kolla("N2 robots AV: Disallow /pro/admin kvar", stjarnaAv.disallow.includes("/pro/admin"));
  const aiAv = robotsAv.rules.filter((r) => r.userAgent !== "*");
  kolla(
    "N2 robots AV: AI-crawler-grupper (~16 regler) saknar också /pro/",
    aiAv.length >= 8 && aiAv.every((r) => !r.allow.includes("/pro/")),
    aiAv.length + " AI-regler",
  );

  setEnv("1");
  const robotsPa = (await import(robotsUrl + "?lage=pa")).default();
  const stjarnaPa = robotsPa.rules.find((r) => r.userAgent === "*" || (Array.isArray(r.userAgent) && r.userAgent.includes("*")));
  kolla("N2 robots PÅ: Allow /pro/ tillbaka", stjarnaPa.allow.includes("/pro/"));
  kolla("N2 robots PÅ: Disallow /pro/admin kvar (admin aldrig crawlbar)", stjarnaPa.disallow.includes("/pro/admin"));
  kolla("N2 robots PÅ: sitemap-host pekar på lab.ak1nvestor.com", robotsPa.sitemap === "https://lab.ak1nvestor.com/sitemap.xml");
  // Bron är färdiganvänd — städa direkt (gitignorad hjälpfil, ALDRIG i src/).
  try { unlinkSync(robotsBroSokvag); } catch { /* redan borta */ }

  // ═══ NIVÅ 3 — meny-register.ts via importbro (RUNTIME-växling) ═══════════
  // Bron skriver om @/-importer till absoluta file://-URL:er och cachedunkas
  // i tool-results/ (gitignorad hjälpfil — aldrig i src/), tas bort efteråt.
  let meny;
  const broSokvag = path.join(REPO, "tool-results", "v86-b2b-menyyregister-bro.ts");
  try {
    mkdirSync(path.dirname(broSokvag), { recursive: true });
    let kalla = las(path.join("src", "lib", "meny-register.ts"));
    for (const modul of ["member-local", "kurs-access", "b2b-status"]) {
      const absolut = pathToFileURL(path.join(REPO, "src", "lib", modul + ".ts")).href;
      kalla = kalla.replaceAll(`"@/lib/${modul}"`, JSON.stringify(absolut));
    }
    writeFileSync(broSokvag, kalla);
    meny = await import(pathToFileURL(broSokvag).href);
  } catch (e) {
    console.error("[testa-b2b-grind] KUNDE INTE IMPORTERA MENY-REGISTRET: " + (e && e.message ? e.message : String(e)));
    process.exitCode = 1;
    return;
  } finally {
    try { unlinkSync(broSokvag); } catch { /* redan borta */ }
  }

  const proPunkt = meny.MENY_REGISTER.flatMap((s) => s.punkter).find((p) => p.lank === "/pro");
  kolla("N3 registret: /pro-punkten är märkt b2b: true", proPunkt?.b2b === true);
  kolla(
    'N3 registret: /pro-punkten lever bara i yttor ["footer","sok"]',
    Array.isArray(proPunkt?.yttor) && proPunkt.yttor.join(",") === "footer,sok",
    proPunkt?.yttor?.join(","),
  );

  const lankar = (yta) =>
    meny.registerFor(meny.GAST_KONTEXT, yta)
      .flatMap((s) => s.punkter.map((p) => p.lank));

  setEnv(undefined);
  kolla("N3 AV (gast): /pro dold i footer", !lankar("footer").includes("/pro"));
  kolla("N3 AV (gast): /pro dold i sok (⌘K-grunddata)", !lankar("sok").includes("/pro"));
  kolla("N3 AV (gast): /pro dold i meny", !lankar("meny").includes("/pro"));
  kolla(
    "N3 AV: övrigt register oskrtat (t.ex. /kurser + /manifest kvar i meny)",
    lankar("meny").includes("/kurser") && lankar("meny").includes("/manifest"),
  );
  setEnv("1");
  kolla("N3 PÅ (gast): /pro synlig i footer", lankar("footer").includes("/pro"));
  kolla("N3 PÅ (gast): /pro sökbar i sok", lankar("sok").includes("/pro"));
  kolla("N3 PÅ (gast): /pro FORTFARANDE borta ur meny-paneler (yttor)", !lankar("meny").includes("/pro"));

  // ═══ NIVÅ 4 — källkontrakt: wiring som inte kan importeras rent ══════════
  const layout = las(path.join("src", "app", "(huvud)", "pro", "layout.tsx"));
  kolla("N4 pro/layout.tsx: early-return !b2bAktiv() ⇒ Under-uppbyggnad", layout.includes("if (!b2bAktiv())") && layout.includes("håller på att byggas klart"));
  kolla("N4 pro/layout.tsx: noindex-metadata styrd av b2bAktiv()", /robots:\s*b2bAktiv\(\)/.test(layout));

  const vaxel = las(path.join("src", "components", "ak1a", "toppvaxel.tsx"));
  kolla("N4 toppvaxel.tsx: !b2bAktiv() ⇒ endast Privatperson-segmentet", vaxel.includes("{!b2bAktiv() ?"));
  kolla("N4 toppvaxel.tsx: Företag-länken pekar mot /pro vid PÅ", vaxel.includes('href="/pro"'));

  const chat = las(path.join("src", "components", "ak1a", "chat-widget.tsx"));
  kolla("N4 chat-widget.tsx: Pro-förslaget bakom if (b2bAktiv())", chat.includes("if (b2bAktiv())"));

  const sok = las(path.join("src", "lib", "sokindex.ts"));
  kolla("N4 sokindex.ts: STATISKA filtrerar (!p.b2b || b2bAktiv())", sok.includes('(!p.b2b || b2bAktiv())'));

  // RESIDUAL-VAKTER (V86 § Kända residualer — STÄNGDA av senare våg:
  // sitemap grindar numera /pro bakom b2bAktiv() och /pro/priser har ingen
  // egen robots-rad. Uppdaterad 2026-09-12 av våg-agent V2: kontrollerna
  // bevakar ATT grindningen består — regression som återinför ogratade
  // /pro-URL:er eller hardcodad robots failar här.)
  const sitemap = las(path.join("src", "app", "sitemap.ts"));
  kolla(
    "N4 residual STÄNGD: sitemap.ts grindar /pro-URL:er bakom b2bAktiv()",
    sitemap.includes("b2bAktiv(") && sitemap.includes("${BASE_URL}/pro"),
  );
  const priserSida = las(path.join("src", "app", "(huvud)", "pro", "priser", "page.tsx"));
  kolla(
    "N4 residual STÄNGD: /pro/priser hardcodar INTE robots index:true (grindens noindex gäller)",
    !priserSida.includes("robots: { index: true"),
  );

  // ── Rapport ────────────────────────────────────────────────────────────────
  let fail = 0;
  for (const r of RADER) {
    console.log((r.ok ? "PASS" : "FAIL") + " | " + r.namn + (r.detalj ? " | " + r.detalj : ""));
    if (!r.ok) fail++;
  }
  console.log("---");
  console.log(RADER.length + " kontroller, " + fail + " FAIL");
  process.exitCode = fail ? 1 : 0;
}

// ── Env-återställning ALWAYS (även vid kast) ────────────────────────────────
try {
  await main();
} finally {
  if (SPARAD === undefined) delete process.env[ENV_NYCKEL];
  else process.env[ENV_NYCKEL] = SPARAD;
}
