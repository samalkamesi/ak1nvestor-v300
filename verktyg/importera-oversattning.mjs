#!/usr/bin/env node
/**
 * AK1A — IMPORTÖREN för MÖS (våg 54): handöversättningar → översättningssystemet.
 *
 * Läser data/oversattning-import/*.json ({kurs, sprak?, poster:[{nyckel, en, ar}]}),
 * hämtar källtext ur MÖS källa-register (src/lib/oversattning/kalla.ts), kör
 * korKontroller per språk (src/lib/oversattning/kontroller.ts) och skriver via
 * lager.ts lasSpara (Supabase `oversattningar`, upsert på UNIQUE-nyckeln —
 * idempotent: omkörning uppdaterar, skapar aldrig dubbletter).
 *
 * STATUSLOGIK (spegling av motor.ts bestamStatus, enligt våg 54-brief):
 *   100 poäng          → "publicerad"   (autopublicering, som motorn)
 *   90–99 poäng        → "utkast"       (granskningskö för main/admin-panelen)
 *   < 90 poäng         → VARNING + SKIPPA posten (räknas som nekad — skrivs
 *                        ALDRIG till lagret; en dålig handöversättning ska inte
 *                        kunna ta sig in bara för att den är handgjord)
 *   okänd nyckel       → VARNING + skip (finns inte i källa-registret)
 *
 * KÖRMÖNSTER (samma som verktyg/validera-motorer.mjs): node kan inte importera
 * TS direkt → skriptet genererar tmp_import_oversattning.ts i repo-roten (så
 * att "./src/lib/..."-importer löser sig), kör den med `npx --yes tsx` under
 * hård tidsbudget och läser JSON-svaret mellan ASCII-markörer. tmp-filen och
 * manifestet städas alltid (även vid fel/timeout).
 *
 * ENV (importen körs LOKALT av main — på Vercel är filsystemet read-only):
 * Supabase-nycklar läses ENBART från miljön. Skriptet parsar .env.local och
 * .env (enkelt KEY=VALUE, "value"-citat rensas) in i process.env FÖRE tsx-
 * start — .env.local vinner över .env, redan satta processenv-värden vinner
 * över båda. VÄRDENA LOGGAS ALDRIG — endast nyckelnamn och satt/ej satt.
 * (Mönster från verktyg/python/samla_nyckeltal.py _las_env, översatt till node.)
 *
 * NEDGRADERING (PGRST205 / TabellSaknasFel): saknas tabellen skrivs
 * data/oversattning-import/ko-backup-{kurs}.json med poster+poäng och ett
 * tydligt meddelande "kör data/sql/oversattningar.sql först" — arbetet går
 * aldrig förlorat och omkörning efter SQL-körning upsertar samma rader.
 *
 * Användning:
 *   node verktyg/importera-oversattning.mjs                 # alla *.json (ej ko-backup-*)
 *   node verktyg/importera-oversattning.mjs zero-to-one.json   # en fil (rel. importkatalogen)
 *   node verktyg/importera-oversattning.mjs --kontrollera   # poängsättning UTAN skrivning (kräver ej env)
 * Avslutskod: 0 = ok (även nedgraderat tabell-saknas-läge), 1 = fel.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMPORT_KAT = path.join(REPO, "data", "oversattning-import");
const TMP_TS = path.join(REPO, "tmp_import_oversattning.ts");
const TMP_MANIFEST = path.join(REPO, "tmp_import_oversattning_manifest.json");
const TIMEOUT_MS = 300_000; // 5 min: 17 MB källa-register + kontroller + nätkall
const MARK_START = "===IMPORT_OVERSATTNING_JSON_START===";
const MARK_END = "===IMPORT_OVERSATTNING_JSON_END===";
const MALSPRAK = ["en", "ar"];

// ── 1) Env: enkel KEY=VALUE-parse av .env.local + .env — värden loggas ALDRIG ─
function lasEnvFil(sokvag) {
  const karta = new Map();
  if (!existsSync(sokvag)) return karta;
  for (const rad of readFileSync(sokvag, "utf8").split(/\r?\n/)) {
    if (rad.trim().startsWith("#")) continue;
    const m = rad.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"') && v.length >= 2) || (v.startsWith("'") && v.endsWith("'") && v.length >= 2)) {
      v = v.slice(1, -1);
    }
    if (v.length > 0) karta.set(m[1], v);
  }
  return karta;
}

function laddaEnv() {
  const bas = lasEnvFil(path.join(REPO, ".env"));
  const lokal = lasEnvFil(path.join(REPO, ".env.local"));
  for (const [k, v] of [...bas, ...lokal]) {
    if (process.env[k] === undefined) process.env[k] = v; // redan satt processenv vinner
  }
  return {
    supabaseUrlSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceNyckelSatt: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    anonNyckelSatt: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

// ── 2) Validera importfilerna (mjs-sidan litar inte på indata) ────────────────
function tolkaSprakFalt(rav, filnamn) {
  if (rav === undefined || rav === null) return null;
  // Tre tolererade former (leverantörernas handöversättningsfiler skiljer sig):
  //   "en" | ["en","ar"] | {en: …, ar: …} (metadataobjekt — språklistan är dess nycklar)
  const lista = Array.isArray(rav)
    ? rav
    : typeof rav === "object"
      ? Object.keys(rav)
      : [rav];
  const rensad = [];
  for (const s of lista) {
    if (typeof s !== "string" || !MALSPRAK.includes(s)) {
      throw new Error(filnamn + ': ogiltigt "sprak" (väntat "en"/"ar", lista eller objekt med sådana nycklar): ' + JSON.stringify(rav).slice(0, 120));
    }
    if (!rensad.includes(s)) rensad.push(s);
  }
  return rensad;
}

function lasImportFiler(sokvagar) {
  const filer = [];
  const fel = [];
  for (const sokvag of sokvagar) {
    const namn = path.basename(sokvag);
    let raa;
    try {
      raa = readFileSync(sokvag, "utf8");
    } catch (e) {
      fel.push(namn + ": kan inte läsas (" + (e instanceof Error ? e.message : String(e)) + ")");
      continue;
    }
    let data;
    try {
      data = JSON.parse(raa.replace(/^\uFEFF/, ""));
    } catch (e) {
      fel.push(namn + ": ogiltig JSON — " + (e instanceof Error ? e.message : String(e)));
      continue;
    }
    const kurs = typeof data?.kurs === "string" ? data.kurs.trim() : "";
    if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(kurs)) {
      fel.push(namn + ': "kurs" saknas eller ogiltig (väntat kurs-slug, t.ex. "zero-to-one")');
      continue;
    }
    if (!Array.isArray(data?.poster)) {
      fel.push(namn + ': "poster" saknas eller är inte en array');
      continue;
    }
    let sprakValda = tolkaSprakFalt(data.sprak, namn);
    const poster = [];
    const dubbletter = [];
    const sedda = new Set();
    for (const p of data.poster) {
      const nyckel = typeof p?.nyckel === "string" ? p.nyckel.trim() : "";
      if (!nyckel) {
        fel.push(namn + ": post utan \"nyckel\" — posten hoppas över");
        continue;
      }
      const en = typeof p?.en === "string" ? p.en : "";
      const ar = typeof p?.ar === "string" ? p.ar : "";
      if (!en && !ar) {
        fel.push(namn + ": post " + nyckel + " har varken en eller ar — posten hoppas över");
        continue;
      }
      if (sedda.has(nyckel)) dubbletter.push(nyckel);
      sedda.add(nyckel);
      poster.push({ nyckel, en, ar });
    }
    if (poster.length === 0) {
      fel.push(namn + ": inga användbara poster");
      continue;
    }
    // Språkomfång: explicit "sprak" om det finns, annars unionen av det som faktiskt levererats.
    if (!sprakValda) {
      sprakValda = MALSPRAK.filter((s) => poster.some((p) => p[s].trim().length > 0));
    }
    filer.push({ fil: namn, kurs, sprak: sprakValda, poster, dubbletter });
  }
  return { filer, fel };
}

function hamtaSokvagar(args) {
  const valda = args.filter((a) => !a.startsWith("--"));
  if (valda.length > 0) {
    return valda.map((v) => {
      const abs = path.isAbsolute(v) ? v : path.join(process.cwd(), v);
      return existsSync(abs) ? abs : path.join(IMPORT_KAT, v);
    });
  }
  if (!existsSync(IMPORT_KAT)) return [];
  return readdirSync(IMPORT_KAT)
    .filter((n) => /\.json$/i.test(n) && !n.startsWith("ko-backup-"))
    .sort()
    .map((n) => path.join(IMPORT_KAT, n));
}

// ── 3) Genererad tmp-fil (TS — körs via npx tsx, raderas efteråt) ────────────
// OBS: ingen backtick och inga ${} i koden nedan (den ligger i en template-literal).
const TS_KOD = String.raw`// tmp_import_oversattning.ts — GENERERAD av verktyg/importera-oversattning.mjs. Raderas efter körning.
// Importören: källa-register → korKontroller → lager.lasSpara (eller ko-backup vid PGRST205).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MARK_START = "===IMPORT_OVERSATTNING_JSON_START===";
const MARK_END = "===IMPORT_OVERSATTNING_JSON_END===";
const SPAR_BATCH = 250; // rader per lasSpara-anrop — aldrig pratsam mot lagret

type ManifestFiler = {
  kontrollera: boolean;
  importSokvag: string;
  filer: Array<{
    fil: string;
    kurs: string;
    sprak: string[];
    poster: Array<{ nyckel: string; en: string; ar: string }>;
  }>;
};

async function kor(): Promise<Record<string, unknown>> {
  const manifestSokvag = process.argv[2];
  if (!manifestSokvag) throw new Error("manifest-sökväg saknas (argv[2])");
  const manifest = JSON.parse(readFileSync(manifestSokvag, "utf8")) as ManifestFiler;

  const { listaKallor } = await import("./src/lib/oversattning/kalla");
  const { korKontroller, KVALITETSTRASKEL } = await import("./src/lib/oversattning/kontroller");
  const { bestamStatus } = await import("./src/lib/oversattning/motor");
  const { lasSpara, TabellSaknasFel } = await import("./src/lib/oversattning/lager");

  // Källkarta: scope-nyckel → källa. ui-nycklar ("nav.lar") och kursblocksnycklar
  // ("zero-to-one:kap1:block1") delar inte namnrymd (ui har inga kolon).
  const karta = new Map<string, { typ: string; text: string; hash: string }>();
  for (const k of listaKallor()) karta.set(k.scope.nyckel, { typ: k.scope.typ, text: k.text, hash: k.hash });

  const perSpraK: Array<Record<string, unknown>> = [];
  const varningar: Array<Record<string, unknown>> = [];
  const okanda: Array<Record<string, unknown>> = [];
  const lasRader = new Map<string, Record<string, unknown>>(); // scope_typ:nyckel:sprak → rad (dubblett inom/kött: sista vinner, som upsert)

  for (const fil of manifest.filer) {
    for (const sprakRaw of ["en", "ar"]) {
      if (fil.sprak.length > 0 && fil.sprak.indexOf(sprakRaw) < 0) continue;
      const sprak = sprakRaw as "en" | "ar";
      const sum: Record<string, number | string> = {
        fil: fil.fil, kurs: fil.kurs, sprak,
        totalt: 0, publicerade: 0, utkast: 0, nekade: 0, okanda: 0, saknade: 0,
        p100: 0, p90_99: 0, pUnder90: 0,
      };
      for (const post of fil.poster) {
        const text = post[sprak];
        if (typeof text !== "string" || text.trim().length === 0) {
          sum.saknade = (sum.saknade as number) + 1;
          continue;
        }
        sum.totalt = (sum.totalt as number) + 1;
        let losning = post.nyckel;
        let kalla = karta.get(losning);
        if (!kalla && losning.indexOf(":") < 0) {
          losning = fil.kurs + ":" + losning; // kortform "kap5:block3" → full kursblocksnyckel
          kalla = karta.get(losning);
        }
        if (!kalla) {
          sum.okanda = (sum.okanda as number) + 1;
          okanda.push({ fil: fil.fil, nyckel: post.nyckel, sprak });
          continue;
        }
        const rapport = korKontroller(kalla.text, text, sprak);
        const poang = rapport.poang;
        if (poang >= 100) { sum.p100 = (sum.p100 as number) + 1; sum.publicerade = (sum.publicerade as number) + 1; }
        else if (poang >= KVALITETSTRASKEL) { sum.p90_99 = (sum.p90_99 as number) + 1; sum.utkast = (sum.utkast as number) + 1; }
        else { sum.pUnder90 = (sum.pUnder90 as number) + 1; sum.nekade = (sum.nekade as number) + 1; }
        if (poang < KVALITETSTRASKEL) {
          // NEKAD: skrivs ALDRIG till lagret — ärlig varning med kontrollens egna detaljer.
          varningar.push({
            fil: fil.fil, nyckel: post.nyckel, sprak, poang,
            orsaker: rapport.resultat.filter((r) => !r.pass).map((r) => r.namn + ": " + r.detaljer),
          });
          continue;
        }
        lasRader.set(kalla.typ + ":" + losning + ":" + sprak, {
          scope_typ: kalla.typ,
          scope_nyckel: losning,
          sprak,
          kallhash: kalla.hash,
          text,
          status: bestamStatus(poang),
          kvalitet: poang,
          kontrollrapport: rapport,
        });
      }
      perSpraK.push(sum);
    }
  }

  const rader = [...lasRader.values()];
  let lage = manifest.kontrollera ? "kontrollera" : "sparat";
  let meddelande: string | null = null;
  const backupFiler: Array<Record<string, unknown>> = [];

  if (!manifest.kontrollera && rader.length > 0) {
    try {
      for (let i = 0; i < rader.length; i += SPAR_BATCH) {
        await lasSpara(rader.slice(i, i + SPAR_BATCH) as never);
      }
    } catch (e) {
      const arTabellFel = e instanceof TabellSaknasFel;
      lage = arTabellFel ? "tabell-saknas" : "fel";
      meddelande = e instanceof Error ? e.message : String(e);
      // Arbete går aldrig förlorat: ko-backup per kurs (kursblocksnyckelns första
      // led; ui-rader samlas under "ui") — poster+poäng, redo att upsertas om.
      const perKurs = new Map<string, Array<Record<string, unknown>>>();
      for (const r of rader) {
        const kurs = r.scope_typ === "kursblock" ? String(r.scope_nyckel).split(":")[0] : "ui";
        if (!perKurs.has(kurs)) perKurs.set(kurs, []);
        perKurs.get(kurs)!.push(r);
      }
      mkdirSync(manifest.importSokvag, { recursive: true });
      for (const [kurs, kursRader] of perKurs) {
        const sokvag = path.join(manifest.importSokvag, "ko-backup-" + kurs + ".json");
        writeFileSync(
          sokvag,
          JSON.stringify({
            kurs,
            skapad: new Date().toISOString(),
            lage,
            meddelande: arTabellFel
              ? "Tabellen oversattningar saknas i Supabase (PGRST205). KÖR data/sql/oversattningar.sql FÖRST i Supabase SQL Editor och kör sedan importören igen — dessa poster är inte förlorade."
              : "Skrivning till Supabase misslyckades — se importörens konsol. Dessa poster är inte förlorade.",
            antalPoster: kursRader.length,
            poster: kursRader,
          }, null, 2),
          "utf8",
        );
        backupFiler.push({ sokvag, kurs, antalPoster: kursRader.length });
      }
    }
  }

  return {
    lage,
    meddelande,
    perSpraK,
    varningar,
    okanda,
    lasSparadeRader: rader.length,
    backupFiler,
  };
}

(async () => {
  let resultat: Record<string, unknown>;
  try {
    resultat = await kor();
  } catch (e) {
    resultat = { lage: "fel", meddelande: e instanceof Error ? e.message : String(e) };
  }
  console.log(MARK_START);
  console.log(JSON.stringify(resultat));
  console.log(MARK_END);
  process.exit(0);
})();
`;

// ── 4) Kör tmp-filen med tsx under tidsbudget ────────────────────────────────
function doda(barn) {
  if (barn.killed || barn.exitCode !== null) return;
  if (process.platform === "win32" && typeof barn.pid === "number") {
    spawnSync("taskkill", ["/pid", String(barn.pid), "/T", "/F"]);
  } else {
    try { barn.kill("SIGKILL"); } catch { /* ignorera */ }
  }
}

function korTsx() {
  return new Promise((res) => {
    const barn = spawn("npx", ["--yes", "tsx", "tmp_import_oversattning.ts", "tmp_import_oversattning_manifest.json"], {
      cwd: REPO,
      shell: true,
      env: { ...process.env, NO_COLOR: "1" },
    });
    let ut = "";
    let fel = "";
    if (barn.stdout) { barn.stdout.setEncoding("utf8"); barn.stdout.on("data", (d) => { ut += d; }); }
    if (barn.stderr) { barn.stderr.setEncoding("utf8"); barn.stderr.on("data", (d) => { fel += d; }); }
    const stop = setTimeout(() => {
      doda(barn);
      setTimeout(() => res({ utdata: ut, felutdata: fel, timeout: true }), 2500);
    }, TIMEOUT_MS);
    barn.on("error", (e) => { clearTimeout(stop); res({ utdata: ut, felutdata: fel + "\nspawn-fel: " + e.message, timeout: false }); });
    barn.on("close", () => { clearTimeout(stop); res({ utdata: ut, felutdata: fel, timeout: false }); });
  });
}

function parsaMarkorer(utdata) {
  const i = utdata.indexOf(MARK_START);
  const j = utdata.lastIndexOf(MARK_END);
  if (i < 0 || j <= i) return null;
  try {
    return JSON.parse(utdata.slice(i + MARK_START.length, j).trim());
  } catch {
    return null;
  }
}

// ── 5) Konsolrapport ──────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const kontrollera = args.includes("--kontrollera");
  const t0 = Date.now();

  console.log("═══ IMPORTÖREN — handöversättningar → MÖS (våg 54) ═══");
  if (kontrollera) console.log("Läge: KONTROLLERA (poängsättning utan skrivning till Supabase)");

  const env = laddaEnv();
  if (!kontrollera) {
    console.log(
      "Env: NEXT_PUBLIC_SUPABASE_URL " + (env.supabaseUrlSatt ? "satt" : "EJ SATT") +
      ", SUPABASE_SERVICE_ROLE_KEY " + (env.serviceNyckelSatt ? "satt" : "ej satt") +
      ", NEXT_PUBLIC_SUPABASE_ANON_KEY " + (env.anonNyckelSatt ? "satt" : "ej satt") +
      " (läst ur .env.local/.env — värden loggas aldrig)",
    );
  }

  const sokvagar = hamtaSokvagar(args);
  if (sokvagar.length === 0) {
    console.log("Inga importfiler hittades i " + IMPORT_KAT + " (mönster: *..json, ko-backup-* hoppas över). Klart.");
    return 0;
  }
  console.log("Läser " + sokvagar.length + " fil(er): " + sokvagar.map((s) => path.basename(s)).join(", "));

  const { filer, fel } = lasImportFiler(sokvagar);
  for (const f of fel) console.log("  [FEL] " + f);
  for (const f of filer) {
    console.log("  " + f.fil + ": kurs=" + f.kurs + ", " + f.poster.length + " poster, språk " + f.sprak.join("+"));
    for (const d of f.dubbletter) console.log("    [NOTIS] dubblettnyckel i filen (sista posten vinner, som upsert): " + d);
  }
  if (filer.length === 0) {
    console.log("INGA tolkningsbara importfiler — avbryter.");
    return 1;
  }

  writeFileSync(TMP_MANIFEST, JSON.stringify({
    kontrollera,
    importSokvag: IMPORT_KAT,
    filer: filer.map((f) => ({ fil: f.fil, kurs: f.kurs, sprak: f.sprak, poster: f.poster })),
  }), "utf8");
  writeFileSync(TMP_TS, TS_KOD, "utf8");

  let resultat = null;
  try {
    console.log("Kör kontroller + skrivning via npx --yes tsx (budget " + Math.round(TIMEOUT_MS / 1000) + " s) ...");
    const r = await korTsx();
    if (r.felutdata && r.felutdata.trim()) {
      console.log("  (tsx stderr, trunkerad): " + r.felutdata.trim().slice(0, 400));
    }
    if (r.timeout) {
      console.log("[FEL] Tidsbudgeten överskreds — processen dödades. Inget skrivningsläge är verifierat.");
      return 1;
    }
    resultat = parsaMarkorer(r.utdata);
  } finally {
    try { unlinkSync(TMP_TS); } catch { /* redan borta */ }
    try { unlinkSync(TMP_MANIFEST); } catch { /* redan borta */ }
  }
  if (!resultat) {
    console.log("[FEL] Ingen tolkbar JSON-utdata från tsx-körningen.");
    return 1;
  }

  // Sammanfattning per kurs+språk
  console.log("");
  console.log("── Sammanfattning per kurs + språk ──");
  let totAllt = 0, totPub = 0, totUtk = 0, totNek = 0, totOk = 0;
  for (const s of resultat.perSpraK ?? []) {
    totAllt += Number(s.totalt); totPub += Number(s.publicerade); totUtk += Number(s.utkast);
    totNek += Number(s.nekade); totOk += Number(s.okanda);
    console.log(
      "  " + s.kurs + " / " + s.sprak + ": totalt " + s.totalt +
      " | publicerade " + s.publicerade + " | utkast " + s.utkast +
      " | nekade " + s.nekade + " | okända nycklar " + s.okanda + " | saknade fält " + s.saknade +
      " | poängfördelning: 100p=" + s.p100 + ", 90–99p=" + s.p90_99 + ", <90p=" + s.pUnder90,
    );
  }
  console.log("  TOTALT: " + totAllt + " poster · " + totPub + " publicerade · " + totUtk + " utkast · " + totNek + " nekade · " + totOk + " okända");

  for (const o of resultat.okanda ?? []) {
    console.log("  [VARNING] okänd nyckel (finns ej i källa-registret): " + o.fil + " " + o.nyckel + " (" + o.sprak + ")");
  }
  for (const v of resultat.varningar ?? []) {
    console.log("  [VARNING] NEKAD " + v.fil + " " + v.nyckel + " (" + v.sprak + ") — poäng " + v.poang + ":");
    for (const orsak of v.orsaker ?? []) console.log("      " + String(orsak).slice(0, 220));
  }

  // Läge + resultat
  console.log("");
  const lage = String(resultat.lage);
  if (lage === "kontrollera") {
    console.log("LÄGE: kontrollera — inget skrivet till Supabase (kör utan --kontrollera för import).");
  } else if (lage === "sparat") {
    console.log("LÄGE: SPARAT — " + resultat.lasSparadeRader + " rader upsertade i tabellen oversattningar (UNIQUE-nyckel: omkörning ger inga dubbletter).");
  } else if (lage === "tabell-saknas") {
    console.log("LÄGE: TABELLEN SAKNAS — " + String(resultat.meddelande));
    console.log("  KÖR data/sql/oversattningar.sql FÖRST i Supabase SQL Editor, sedan importören igen (idempotent upsert).");
    for (const b of resultat.backupFiler ?? []) {
      console.log("  Backup skriven: " + b.sokvag + " (" + b.antalPoster + " poster med poäng)");
    }
  } else {
    console.log("LÄGE: FEL — " + String(resultat.meddelande));
    for (const b of resultat.backupFiler ?? []) {
      console.log("  Backup skriven: " + b.sokvag + " (" + b.antalPoster + " poster med poäng)");
    }
  }
  console.log("Körtid: " + ((Date.now() - t0) / 1000).toFixed(1) + " s");

  if (fel.length > 0) return 1;
  return lage === "fel" ? 1 : 0;
}

main().then((kod) => process.exit(kod)).catch((e) => {
  try { unlinkSync(TMP_TS); } catch { /* ignorera */ }
  try { unlinkSync(TMP_MANIFEST); } catch { /* ignorera */ }
  console.error("[importera-oversattning] FEL: " + (e instanceof Error ? e.stack : String(e)));
  process.exit(1);
});
