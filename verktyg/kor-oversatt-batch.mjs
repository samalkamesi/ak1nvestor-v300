#!/usr/bin/env node
/**
 * AK1A — MÖS BATCHMOTOR: "varenda ord översätts" (våg 62).
 *
 * Skillnaden mot cron-ronden (/api/cron/oversatt, 4–80 objekt på Vercels 60 s):
 * detta verktyg kör en MAXIMAL batch LOKALT med full tidsbudget och den externa
 * motor-kedjan (DeepL → Google → MyMemory; termbanks-PRE/POST körs internt i
 * motor.ts) tills något SLUTVILLKOR inträffar:
 *
 *   1. MyMemory-kvot-signal ("vantar-kvot") — modulräknare per process-dygn
 *      (≈ 5 000 ord / 400 anrop, se motor.ts) ELLER MyMemory:s egna 429/
 *      "MYMEMORY WARNING". Kvoten är DAGLIGEN ÅTERKOMMANDE — nästa dags
 *      omgång fortsätter där denna stannade (publicerade objekt hoppas över).
 *   2. Tidsbudget: flagga --max-min (default 25 minuter).
 *   3. Antalstak: flagga --max-antal (bearbetade objekt).
 *   (4. Motor borta: 3 konsekutiva "vantar-motor" utan en enda framgång —
 *      nätverk nere/avstängd kedja; ärligt stopp i stället för tusen kö-rader.)
 *
 * PRIORITET (kalla.ts listaKallor-kontraktet, oförändrat): ui-nycklar först →
 * kursblock i kursordning (deep-courses.json) → blogg i filnamnsordning. Per
 * källa bearbetas en före ar (samme ordning som cron-ronden).
 *
 * URVAL/IDEMPOTENS: ett objekt (typ:nyckel:språk) hoppas över ENDAST när
 * lagrets SENASTE rad för det är "publicerad" MED aktuell källhash — allt annat
 * (saknas, utkast, vantar-*, inaktuell, ändrad hash) körs om. Omkörning är
 * alltså idempotent: publicerade rader röras aldrig, övriga får en ny chans
 * (med DeepL-nyckel senare konverterar utkast → publicerad).
 *
 * STATUSMAPPNING (våg 62-briefen — medvetet avvikande från motor.bestamStatus
 * för poäng < 90): 100 p ⇒ "publicerad"; 90–99 p OCH < 90 p ⇒ "utkast".
 * Kontrollrapporten (korKontroller, körs internt i motor.oversatt på det
 * termbanksrättade svaret) sparas med poängen — granskningsläget syns i
 * kvalitet-fältet, och kontrollerna kan ALDRIG förhandlas bort.
 *
 * LAGER: lager.ts lasSpara (tabell om den finns, annanzas system_events-event
 * med senaste-vinner-dedupe — lasStatusKarta deduperar internt). Skrivning
 * sker i omgångar om ≤ 12 rader så lasSparaEvents också RADERAR föregångare
 * med samma nyckel (lagret sväller inte). "vantar-kvot"/"vantar-motor"
 * skrivs ALDRIG som rader av batchen (en tom kö-rad skulle kunna radera en
 * värdefull utkast-rad som föregångare) — stoppet dokumenteras i rapporten.
 *
 * KÖRMÖNSTER (samma som verktyg/importera-oversattning.mjs): node kan inte
 * importera TS direkt → skriptet genererar tmp_kor_oversatt_batch.ts i
 * repo-roten, kör den med npx --yes tsx under hård tidsbudget och läser
 * JSON-svaret mellan ASCII-markörer. Framstegsrader (prefix "[batch]")
 * reläas live. tmp-filerna städas alltid.
 *
 * ENV (importörens mönster — värden loggas ALDRIG, endast namn + satt/ej
 * satt): .env.local vinner över .env, redan satta processenv-värden vinner
 * över båda. Nycklar: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * (eller NEXT_PUBLIC_SUPABASE_ANON_KEY), DEEPL_API_KEY, GOOGLE_TRANSLATE_KEY,
 * ZAI_API_KEY, OVERSATTNING_EXTERN_AVSTANGD.
 *
 * Användning:
 *   node verktyg/kor-oversatt-batch.mjs --max-min 25      # batch (default 25)
 *   node verktyg/kor-oversatt-batch.mjs --max-antal 100   # tak i bearbetade objekt
 *   node verktyg/kor-oversatt-batch.mjs --status          # endast lägeskoll: källor + lagerräkning, inga motoranrop
 * Avslutskod: 0 = ok (också kvot-stopp — det är ett dokumenterat slutvillkor),
 *             1 = fel (lagerfel, timeout, oläsbar utdata, ogiltiga flaggor).
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TMP_TS = path.join(REPO, "tmp_kor_oversatt_batch.ts");
const TMP_MANIFEST = path.join(REPO, "tmp_kor_oversatt_batch_manifest.json");
const MARK_START = "===KOR_OVERSATT_BATCH_JSON_START===";
const MARK_END = "===KOR_OVERSATT_BATCH_JSON_END===";

// ── 1) Flaggor ────────────────────────────────────────────────────────────────
function lasFlaggor(args) {
  const f = { maxMin: 25, maxAntal: null, status: false, fel: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--max-min") {
      const n = Number(args[i + 1]);
      if (!Number.isFinite(n) || n <= 0) f.fel.push("--max-min kräver ett positivt antal minuter");
      else { f.maxMin = n; i += 1; }
    } else if (a === "--max-antal") {
      const n = Number(args[i + 1]);
      if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) f.fel.push("--max-antal kräver ett positivt heltal");
      else { f.maxAntal = n; i += 1; }
    } else if (a === "--status") {
      f.status = true;
    } else {
      f.fel.push("okänt argument: " + a);
    }
  }
  return f;
}

// ── 2) Env: enkel KEY=VALUE-parse av .env.local + .env — värden loggas ALDRIG ─
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
    deeplSatt: Boolean(process.env.DEEPL_API_KEY),
    googleSatt: Boolean(process.env.GOOGLE_TRANSLATE_KEY),
    zaiSatt: Boolean(process.env.ZAI_API_KEY),
    externAvstangd: process.env.OVERSATTNING_EXTERN_AVSTANGD === "1",
  };
}

// ── 3) Genererad tmp-fil (TS — körs via npx tsx, raderas efteråt) ─────────────
// OBS: ingen backtick och inga ${} i koden nedan (den ligger i en template-literal).
const TS_KOD = String.raw`// tmp_kor_oversatt_batch.ts — GENERERAD av verktyg/kor-oversatt-batch.mjs. Raderas efter körning.
// MÖS-batchmotor (våg 62): kalla.ts → lasStatusKarta (senaste-vinner) → motor.oversatt → status → lager.lasSpara.
import { readFileSync } from "node:fs";

const MARK_START = "===KOR_OVERSATT_BATCH_JSON_START===";
const MARK_END = "===KOR_OVERSATT_BATCH_JSON_END===";

type Manifest = {
  lage: "batch" | "status";
  maxMin: number;
  maxAntal: number | null;
};

type Stat = {
  publicerade: number;
  utkast: number;
  vantarKvot: number;
  vantarMotor: number;
  hoppadeOver: number;
  forLangt: number;
  termbankDirekta: number;
};

function tomStat(): Stat {
  return { publicerade: 0, utkast: 0, vantarKvot: 0, vantarMotor: 0, hoppadeOver: 0, forLangt: 0, termbankDirekta: 0 };
}

/** statuskartans id "typ:nyckel:sprak" → [typ, sprak] (nyckeln innehåller själv kolon). */
function typOchSprakUrId(id: string): [string, string] {
  return [id.slice(0, id.indexOf(":")), id.slice(id.lastIndexOf(":") + 1)];
}

// ── Läge --status: räkna källregister + lager, NOLL motoranrop ───────────────
async function koraStatus(): Promise<Record<string, unknown>> {
  const { listaKallor } = await import("./src/lib/oversattning/kalla");
  const { lasStatusKarta } = await import("./src/lib/oversattning/lager");
  const { getSupabaseRest } = await import("./src/lib/supabase-rest");

  const kallor = listaKallor();
  const kallorPerTyp: Record<string, number> = {};
  const teckenPerTyp: Record<string, number> = {};
  let teckenAllt = 0;
  for (const k of kallor) {
    const t = String(k.scope.typ);
    kallorPerTyp[t] = (kallorPerTyp[t] ?? 0) + 1;
    teckenPerTyp[t] = (teckenPerTyp[t] ?? 0) + k.text.length;
    teckenAllt += k.text.length;
  }

  const karta = await lasStatusKarta();
  const senaste: Record<string, number> = {};
  for (const [id, post] of karta) {
    const [typ, sprak] = typOchSprakUrId(id);
    const n = typ + " / " + sprak + " / " + post.status;
    senaste[n] = (senaste[n] ?? 0) + 1;
  }

  // RÅA radräkningar (före dedupe) per språk/status — PostgREST Content-Range.
  const STATUSER = ["publicerad", "granskad", "utkast", "vantar-motor", "vantar-kvot", "inaktuell", "maskinutkast-behovar-granskning"];
  const rest = getSupabaseRest();
  const raRader: Record<string, number> = {};
  let raTotalt: number | string = "n/a";
  if (rest) {
    const rakna = async (filter: string): Promise<number | string> => {
      try {
        const r = await fetch(rest.origin + "/rest/v1/system_events?type=eq.oversattning" + filter + "&select=id", {
          headers: { ...rest.headers, Range: "0-0", Prefer: "count=exact" },
          signal: AbortSignal.timeout(15_000),
        });
        const cr = r.headers.get("content-range") ?? "?";
        const n = cr.split("/")[1];
        return n === undefined || n === "*" ? "n/a" : Number(n);
      } catch {
        return "n/a";
      }
    };
    raTotalt = await rakna("");
    for (const sprak of ["en", "ar"]) {
      for (const status of STATUSER) {
        const n = await rakna("&details->>sprak=eq." + sprak + "&details->>status=eq." + status);
        if (typeof n === "number" && n > 0) raRader[sprak + " / " + status] = n;
      }
    }
  }

  return {
    lage: "status",
    kallorTotalt: kallor.length,
    oversattningsobjekt: kallor.length * 2,
    kallorPerTyp,
    teckenPerTyp,
    teckenTotalt: teckenAllt,
    senasteVinnerUnika: karta.size,
    senasteVinner: senaste,
    raRaderTotalt: raTotalt,
    raRader,
  };
}

// ── Läge batch: maximal översättningsomgång under slutvillkoren ──────────────
async function koraBatch(manifest: Manifest): Promise<Record<string, unknown>> {
  const { listaKallor, MALSPRAK } = await import("./src/lib/oversattning/kalla");
  const {
    oversatt,
    lasMyMemoryStatistik,
    MYMEMORY_MAX_ORD_PER_DAG,
    MYMEMORY_MAX_ANROP_PER_DAG,
    MAX_KALLTEXST_LANGD,
  } = await import("./src/lib/oversattning/motor");
  const { lasSpara, lasStatusKarta } = await import("./src/lib/oversattning/lager");

  const FLUSH = 12; // rader per lasSpara-anrop — ≤ lager.ts RADERA_MAX_NYCKLAR
  const MOTOR_BORTA_GRANS = 3; // konsekutiva vantar-motor utan framgång ⇒ stopp

  const start = Date.now();
  const budgetMs = manifest.maxMin * 60_000;
  const kallor = listaKallor();
  const totaltObjekt = kallor.length * MALSPRAK.length;

  // Statuskartan: lasStatusKarta deduperar INTERNT med senaste-vinner
  // (dedupeSenasteVinner/mosStatusKartaUrEventRader) — en äldre "publicerad"-rad
  // servas aldrig om den senaste raden för nyckeln har annan status.
  const karta = await lasStatusKarta();
  let publiceradeFore = 0;
  for (const post of karta.values()) {
    if (post.status === "publicerad") publiceradeFore += 1;
  }

  const stat = new Map<string, Stat>();
  const statFor = (typ: string, sprak: string): Stat => {
    const k = typ + "|" + sprak;
    let s = stat.get(k);
    if (!s) {
      s = tomStat();
      stat.set(k, s);
    }
    return s;
  };

  const motorAnvanda: Record<string, number> = {};
  const lasRader = new Map<string, Record<string, unknown>>();
  let bearbetade = 0;
  let sparadeRader = 0;
  let fel: string | null = null;
  let stoppOrsak = "klar";
  let stoppNotering = "samtliga ej publicerade objekt i källregistret bearbetade";
  let stoppVid: Record<string, unknown> | null = null;
  let sisteBearbetade: string | null = null;
  let nastaKvar: string | null = null;
  let foljdMotorBorta = 0;

  const sekunder = (): string => ((Date.now() - start) / 1000).toFixed(1);
  const framsteg = (): void => {
    const mm = lasMyMemoryStatistik();
    let pub = 0;
    let utk = 0;
    for (const s of stat.values()) {
      pub += s.publicerade;
      utk += s.utkast;
    }
    console.log("[batch] " + String(bearbetade) + " objekt · publicerade " + String(pub) + " · utkast " + String(utk) + " · mymemory " + String(mm.ord) + "/" + String(MYMEMORY_MAX_ORD_PER_DAG) + " ord, " + String(mm.anrop) + "/" + String(MYMEMORY_MAX_ANROP_PER_DAG) + " anrop · " + sekunder() + " s");
  };

  const spara = async (): Promise<void> => {
    const rader = [...lasRader.values()];
    lasRader.clear();
    for (let i = 0; i < rader.length; i += FLUSH) {
      const bit = rader.slice(i, i + FLUSH);
      await lasSpara(bit as never);
      sparadeRader += bit.length;
    }
  };

  yttre:
  for (let ki = 0; ki < kallor.length; ki++) {
    const kalla = kallor[ki];
    for (const sprakRaw of MALSPRAK) {
      const sprak = sprakRaw as "en" | "ar";
      const id = String(kalla.scope.typ) + ":" + kalla.scope.nyckel + ":" + sprak;
      const lagrad = karta.get(id);

      // Idempotens: publicerad med AKTUELL källhash ⇒ hoppas över helt.
      if (lagrad && lagrad.status === "publicerad" && lagrad.kallhash === kalla.hash) {
        statFor(String(kalla.scope.typ), sprak).hoppadeOver += 1;
        continue;
      }
      // Källor längre än motorrons gräns kan aldrig översättas i en rond —
      // räknas ärligt men kostar inget motoranrop (motor.ts ger ändå vantar-motor).
      if (kalla.text.length > MAX_KALLTEXST_LANGD) {
        statFor(String(kalla.scope.typ), sprak).forLangt += 1;
        continue;
      }

      // Slutvillkor kontrolleras FÖRE varje nytt motoranrop.
      if (manifest.maxAntal !== null && bearbetade >= manifest.maxAntal) {
        stoppOrsak = "max-antal";
        stoppNotering = "--max-antal " + String(manifest.maxAntal) + " bearbetade objekt uppnått";
        stoppVid = { id, kallIndex: ki };
        break yttre;
      }
      if (Date.now() - start >= budgetMs) {
        stoppOrsak = "max-min";
        stoppNotering = "tidsbudgeten --max-min " + String(manifest.maxMin) + " min förbrukad";
        stoppVid = { id, kallIndex: ki };
        break yttre;
      }

      const resultat = await oversatt(kalla.text, sprak);
      bearbetade += 1;
      sisteBearbetade = id;
      motorAnvanda[resultat.motor] = (motorAnvanda[resultat.motor] ?? 0) + 1;
      const s = statFor(String(kalla.scope.typ), sprak);

      // Slutvillkor 1: MyMemory-kvoten (modulräknare eller tjänstens egen signal).
      if (resultat.status === "vantar-kvot") {
        s.vantarKvot += 1;
        const mm = lasMyMemoryStatistik();
        stoppOrsak = "kvot";
        stoppNotering = "MyMemory-kvoten: " + String(mm.ord) + "/" + String(MYMEMORY_MAX_ORD_PER_DAG) + " ord, " + String(mm.anrop) + "/" + String(MYMEMORY_MAX_ANROP_PER_DAG) + " anrop — kvoten är dagligen återkommande, nästa omgång fortsätter här (publicerade hoppas över); DEEPL_API_KEY/GOOGLE_TRANSLATE_KEY ger premium utan kvot";
        stoppVid = { id, kallIndex: ki };
        break yttre;
      }
      // Slutvillkor 4: motorn svarar inte alls (nät nere / kedjan avstängd).
      if (resultat.status === "vantar-motor") {
        s.vantarMotor += 1;
        foljdMotorBorta += 1;
        if (foljdMotorBorta >= MOTOR_BORTA_GRANS) {
          stoppOrsak = "motor-borta";
          stoppNotering = String(foljdMotorBorta) + " konsekutiva vantar-motor — externa kedjan svarar inte: " + resultat.notering.slice(0, 160);
          stoppVid = { id, kallIndex: ki };
          break yttre;
        }
        continue; // enstaka fel är transient — nästa objekt får sin chans
      }
      foljdMotorBorta = 0;
      if (resultat.motor === "termbank") s.termbankDirekta += 1;

      // Våg 62-briefens statusmappning (avvikelse från motor.bestamStatus):
      // 100 p ⇒ publicerad; 90–99 OCH <90 ⇒ utkast (kontrollrapporten bevarar poängen).
      const status = resultat.poang >= 100 ? "publicerad" : "utkast";
      if (status === "publicerad") s.publicerade += 1;
      else s.utkast += 1;
      lasRader.set(id, {
        scope_typ: kalla.scope.typ,
        scope_nyckel: kalla.scope.nyckel,
        sprak,
        kallhash: kalla.hash,
        text: resultat.text,
        status,
        kvalitet: resultat.poang,
        kontrollrapport: resultat.rapport,
      });
      if (lasRader.size >= FLUSH) {
        try {
          await spara();
        } catch (e) {
          fel = e instanceof Error ? e.message : String(e);
          stoppOrsak = "lagerfel";
          stoppNotering = "lasSpara misslyckades — ospolade rader i minnet är inte skrivna";
          stoppVid = { id, kallIndex: ki };
          break yttre;
        }
      }
      if (bearbetade % 20 === 0) framsteg();
    }
  }

  if (fel === null && lasRader.size > 0) {
    try {
      await spara();
    } catch (e) {
      fel = e instanceof Error ? e.message : String(e);
    }
  }

  // Var omgången stannade + var nästa fortsätter: första objekt efter
  // stopppositionen som inte är (publicerad med aktuell hash) — samma
  // urvalslogik som loopen ovan, utan motoranrop.
  if (stoppVid !== null) {
    const fran = Number(stoppVid.kallIndex);
    const stoppId = String(stoppVid.id);
    for (let ki = fran; ki < kallor.length && nastaKvar === null; ki++) {
      const kalla = kallor[ki];
      for (const sprakRaw of MALSPRAK) {
        const id = String(kalla.scope.typ) + ":" + kalla.scope.nyckel + ":" + String(sprakRaw);
        if (id === stoppId) continue;
        const lagrad = karta.get(id);
        if (lagrad && lagrad.status === "publicerad" && lagrad.kallhash === kalla.hash) continue;
        if (kalla.text.length > MAX_KALLTEXST_LANGD) continue;
        nastaKvar = id;
        break;
      }
    }
  }

  const mmSlut = lasMyMemoryStatistik();
  let pubOmgang = 0;
  let utkOmgang = 0;
  for (const s of stat.values()) {
    pubOmgang += s.publicerade;
    utkOmgang += s.utkast;
  }
  const perOmgang: Record<string, Record<string, number>> = {};
  for (const [k, s] of stat) {
    perOmgang[k.split("|").join(" / ")] = {
      publicerade: s.publicerade,
      utkast: s.utkast,
      vantarKvot: s.vantarKvot,
      vantarMotor: s.vantarMotor,
      hoppadeOver: s.hoppadeOver,
      forLangt: s.forLangt,
      termbankDirekta: s.termbankDirekta,
    };
  }

  return {
    lage: "batch",
    kallorTotalt: kallor.length,
    oversattningsobjekt: totaltObjekt,
    publiceradeFore,
    bearbetade,
    publiceradeDennaOmgang: pubOmgang,
    utkastDennaOmgang: utkOmgang,
    sparadeRader,
    perOmgang,
    motorAnvanda,
    stopp: { orsak: stoppOrsak, notering: stoppNotering, vid: stoppVid, sisteBearbetade, nastaKvar },
    myMemory: {
      dag: mmSlut.dag,
      ord: mmSlut.ord,
      maxOrd: MYMEMORY_MAX_ORD_PER_DAG,
      anrop: mmSlut.anrop,
      maxAnrop: MYMEMORY_MAX_ANROP_PER_DAG,
    },
    tidSek: Math.round((Date.now() - start) / 1000),
    fel,
  };
}

(async () => {
  let resultat: Record<string, unknown>;
  try {
    const manifest = JSON.parse(readFileSync(process.argv[2], "utf8")) as Manifest;
    resultat = manifest.lage === "status" ? await koraStatus() : await koraBatch(manifest);
  } catch (e) {
    resultat = { lage: "fel", fel: e instanceof Error ? e.message : String(e) };
  }
  console.log(MARK_START);
  console.log(JSON.stringify(resultat));
  console.log(MARK_END);
  process.exit(0);
})();
`;

// ── 4) Kör tmp-filen med tsx under hård tidsbudget ────────────────────────────
function doda(barn) {
  if (barn.killed || barn.exitCode !== null) return;
  if (process.platform === "win32" && typeof barn.pid === "number") {
    spawnSync("taskkill", ["/pid", String(barn.pid), "/T", "/F"]);
  } else {
    try { barn.kill("SIGKILL"); } catch { /* ignorera */ }
  }
}

function korTsx(timeoutMs) {
  return new Promise((res) => {
    const barn = spawn("npx", ["--yes", "tsx", "tmp_kor_oversatt_batch.ts", "tmp_kor_oversatt_batch_manifest.json"], {
      cwd: REPO,
      shell: true,
      env: { ...process.env, NO_COLOR: "1" },
    });
    let ut = "";
    let fel = "";
    let rest = "";
    let inomMarkorer = false;
    if (barn.stdout) {
      barn.stdout.setEncoding("utf8");
      barn.stdout.on("data", (d) => {
        ut += d;
        // Live-relä: rader FÖRE markörblocket (framsteg från tmp-skriptet);
        // JSON-payloaden mellan markörerna undertrycks.
        rest += d;
        const rader = rest.split(/\r?\n/);
        rest = rader.pop();
        for (const rad of rader) {
          if (rad.includes(MARK_START)) { inomMarkorer = true; continue; }
          if (rad.includes(MARK_END)) { inomMarkorer = false; continue; }
          if (!inomMarkorer && rad.trim().length > 0) console.log("  " + rad);
        }
      });
    }
    if (barn.stderr) {
      barn.stderr.setEncoding("utf8");
      barn.stderr.on("data", (d) => { fel += d; });
    }
    const stop = setTimeout(() => {
      doda(barn);
      setTimeout(() => res({ utdata: ut, felutdata: fel, timeout: true }), 2500);
    }, timeoutMs);
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
function skrivStatusRapport(r) {
  console.log("");
  console.log("── Källregister (kalla.ts listaKallor: ui → kursblock → blogg) ──");
  console.log("  " + r.kallorTotalt + " källor → " + r.oversattningsobjekt + " översättningsobjekt (× 2 språk)");
  for (const typ of Object.keys(r.kallorPerTyp ?? {})) {
    console.log("  " + typ + ": " + r.kallorPerTyp[typ] + " källor · " + r.teckenPerTyp[typ] + " tecken källtext");
  }
  console.log("  Total källtext: " + r.teckenTotalt + " tecken (" + (r.teckenTotalt * 2) + " tecken att översätta vid 2 målspråk)");
  console.log("");
  console.log("── Lagret, SENASTE-VINNER (" + r.senasteVinnerUnika + " unika objekt) ──");
  for (const n of Object.keys(r.senasteVinner ?? {}).sort()) {
    console.log("  " + n + ": " + r.senasteVinner[n]);
  }
  console.log("");
  console.log("── Råa rader (type=oversattning i system_events, FÖRE dedupe) ──");
  console.log("  Totalt: " + r.raRaderTotalt);
  for (const n of Object.keys(r.raRader ?? {}).sort()) {
    console.log("  " + n + ": " + r.raRader[n]);
  }
}

function skrivBatchRapport(r, maxMin, maxAntal) {
  console.log("");
  console.log("── Rapport per scope_typ / språk (denna omgång) ──");
  for (const n of Object.keys(r.perOmgang ?? {}).sort()) {
    const s = r.perOmgang[n];
    console.log(
      "  " + n + ": publicerade " + s.publicerade + " · utkast " + s.utkast +
      " · vantar-kvot " + s.vantarKvot + " · vantar-motor " + s.vantarMotor +
      " · hoppade över (redan publicerade) " + s.hoppadeOver +
      " · för långa källor " + s.forLangt + " · termbank-direkt " + s.termbankDirekta,
    );
  }
  console.log("");
  console.log("── Slutvillkor ──");
  const stopp = r.stopp ?? {};
  console.log("  ORSAK: " + stopp.orsak);
  console.log("  " + stopp.notering);
  if (stopp.vid) {
    console.log("  Stannade vid: " + stopp.vid.id + " (källindex " + stopp.vid.kallIndex + " av " + r.kallorTotalt + " källor)");
  }
  if (stopp.sisteBearbetade) console.log("  Siste bearbetade: " + stopp.sisteBearbetade);
  if (stopp.nastaKvar) console.log("  Nästa ej publicerade efter stoppet: " + stopp.nastaKvar);
  console.log("");
  console.log("── Ord-förbrukning (MyMemory-modulräknare, per process, UTC-dag " + r.myMemory.dag + ") ──");
  console.log("  " + r.myMemory.ord + "/" + r.myMemory.maxOrd + " ord · " + r.myMemory.anrop + "/" + r.myMemory.maxAnrop + " anrop");
  const motorer = Object.keys(r.motorAnvanda ?? {}).map((m) => m + " " + r.motorAnvanda[m]).join(" · ");
  console.log("  Motorfördelning: " + (motorer.length > 0 ? motorer : "inga anrop"));
  console.log("");
  console.log("  Källor totalt: " + r.kallorTotalt + " (" + r.oversattningsobjekt + " objekt × 2 språk)");
  console.log("  Publicerade i lagret före omgången: " + r.publiceradeFore);
  console.log("  Bearbetade denna omgång: " + r.bearbetade + " → publicerade " + r.publiceradeDennaOmgang + " · utkast " + r.utkastDennaOmgang);
  console.log("  Sparade rader: " + r.sparadeRader + " (spolningar om ≤ 12 rader — föregångarrader raderas)");
  console.log("  Körtid: " + r.tidSek + " s (tidsbudget " + maxMin + " min" + (maxAntal !== null ? ", antalstak " + maxAntal : "") + ")");
}

async function main() {
  const args = process.argv.slice(2);
  const f = lasFlaggor(args);
  if (f.fel.length > 0) {
    for (const fel of f.fel) console.log("[FEL] " + fel);
    console.log("Användning: node verktyg/kor-oversatt-batch.mjs [--max-min 25] [--max-antal N] [--status]");
    return 1;
  }
  const t0 = Date.now();

  console.log("═══ MÖS BATCHMOTOR — \"varenda ord översätts\" (våg 62) ═══");
  console.log(
    "Läge: " + (f.status ? "STATUS (källor + lagerräkning, inga motoranrop)" : "BATCH --max-min " + f.maxMin + (f.maxAntal !== null ? " --max-antal " + f.maxAntal : " --max-antal ∞")),
  );

  const env = laddaEnv();
  console.log(
    "Env: NEXT_PUBLIC_SUPABASE_URL " + (env.supabaseUrlSatt ? "satt" : "EJ SATT") +
    ", SUPABASE_SERVICE_ROLE_KEY " + (env.serviceNyckelSatt ? "satt" : "ej satt") +
    ", NEXT_PUBLIC_SUPABASE_ANON_KEY " + (env.anonNyckelSatt ? "satt" : "ej satt") +
    " (läst ur .env.local/.env — värden loggas aldrig)",
  );
  const kedja = env.externAvstangd
    ? "AVSTÄNGD (OVERSATTNING_EXTERN_AVSTANGD=1)"
    : env.zaiSatt
      ? "Z.ai-premiumgren (ZAI_API_KEY)"
      : "DeepL " + (env.deeplSatt ? "(nyckel satt)" : "(ej satt)") + " → Google " + (env.googleSatt ? "(nyckel satt)" : "(ej satt)") + " → MyMemory (nyckelfri standard)";
  console.log("Motor-kedja: " + kedja);

  if (!f.status && !env.supabaseUrlSatt) {
    console.log("[FEL] NEXT_PUBLIC_SUPABASE_URL saknas — batchen kan inte läsa/skriva lagret. Avbryter.");
    return 1;
  }

  writeFileSync(TMP_MANIFEST, JSON.stringify({ lage: f.status ? "status" : "batch", maxMin: f.maxMin, maxAntal: f.maxAntal }), "utf8");
  writeFileSync(TMP_TS, TS_KOD, "utf8");

  // Hård tak: status 4 min; batch = tidsbudget + 4 min spelrum (tsx-start,
  // 17 MB källregister, statuskarta, sista spolningen).
  const timeoutMs = f.status ? 240_000 : f.maxMin * 60_000 + 240_000;

  let resultat = null;
  try {
    console.log("Kör via npx --yes tsx (hård tak " + Math.round(timeoutMs / 1000) + " s) ...");
    const r = await korTsx(timeoutMs);
    if (r.felutdata && r.felutdata.trim()) {
      console.log("  (tsx stderr, trunkerad): " + r.felutdata.trim().slice(0, 400));
    }
    if (r.timeout) {
      console.log("[FEL] Hård tidsgräns överskreds — processen dödades. Rader som inte spolats är EJ skrivna.");
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

  if (resultat.lage === "fel") {
    console.log("[FEL] " + String(resultat.fel));
    return 1;
  }
  if (resultat.lage === "status") {
    skrivStatusRapport(resultat);
    console.log("");
    console.log("Körtid: " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
    return 0;
  }

  skrivBatchRapport(resultat, f.maxMin, f.maxAntal);
  if (resultat.fel !== null && resultat.fel !== undefined) {
    console.log("[FEL] Lagerfel: " + String(resultat.fel));
    return 1;
  }
  console.log("");
  console.log("Körtid totalt: " + ((Date.now() - t0) / 1000).toFixed(1) + " s");
  return 0;
}

main().then((kod) => process.exit(kod)).catch((e) => {
  try { unlinkSync(TMP_TS); } catch { /* ignorera */ }
  try { unlinkSync(TMP_MANIFEST); } catch { /* ignorera */ }
  console.error("[kor-oversatt-batch] FEL: " + (e instanceof Error ? e.stack : String(e)));
  process.exit(1);
});
