#!/usr/bin/env node
/**
 * AGENTFABRIKEN (våg 146) — server-ägd verkställare av storskalig parallellism
 * =====================================================================
 * PROBLEMET (bevisat 2026-09-14): när mål-sessionens agent dispatchar 12
 * parallella Agent-tool-anrop dör vågen TYST — subagent-registret svarar
 * [] och inget levereras till trädet ("döda 01:34-dispatchen" + redispatch
 * 02:03 = noll spår). Orsak: varje zcode-barn äter ~400–470 MB; 12 st ≈
 * 5,2 GB på en 8 GB-server där next + app-servrar redan bor — RAM-taket
 * slår ut barnen innan de rapporterar. Det ENDA bevisat levererande
 * mönstret är skript-drivna agenter i omgångar (rond F: v15/v16 landade).
 *
 * LÖSNINGEN: agenten SKRIVER en beställning (manifest) i stället för att
 * själv föda barn — fabriken verkställer med de skydd modellen saknar:
 *   · RAM-vakt   — vägrar starta ny omgång under 1 500 MB tillgängligt
 *   · Omgångar   — max 3 samtidiga zcode-barn (bevisat säker nivå)
 *   · Timeout    — 25 min/uppgift, dödade barn loggas (aldrig tyst död)
 *   · Bevis      — varje uppgift efterlämnar utdata/*.log + statusrad +
 *                  commit-hash (git log före/efter) i logg.jsonl
 *
 * KÖ-PROTOKOLL (agenten ↔ fabriken):
 *   1. Agenten skriver data/vakten/agentfabrik/ko/<id>.json:
 *      { "id": "v147-blogg", "titel": "…", "skapad": Date.now(),
 *        "uppgifter": [ { "id": "u1", "titel": "…", "prompt": "…" }, … ] }
 *   2. Daemonen ropar fabriken var 10:e minut (min%10==5); ETT manifest
 *      bearbetas per rop till slut (atomärt LOCK — två fabriker kan aldrig
 *      dubbelköra; RAM-avbrott återupptas utan omkörning av klara delar).
 *   3. Agenten läser data/vakten/agentfabrik/status/<id>.json (progress)
 *      och utdata/<manifest>-<uppgift>.log (fullständiga svar).
 *
 * FABRIK 2.0 (mega g4 — styrelsens beslut punkt 4, 2026-09-15):
 *   (a) MALLAR — är ko/ tom genererar fabriken SJÄLV nästa manifest ur
 *       data/infra/evighetskatalog.md: spår-rotering via spar.json (aldrig
 *       samma spår två auto-manifest i rad), EN omgång = 3 uppgifter med
 *       prompts ur katalogens postmallar (platshållare fylls med "nästa i
 *       spåret — välj själv", barnet verifierar mot arbetsytan). Skydd:
 *       max ett auto-manifest per 30 min (AUTO_TAK_MS) och flaggfil
 *       data/vakten/agentfabrik/AUTO-PAUS stänger av (kundens paus är
 *       heligt — huvudagenten skapar/raderar filen vid paus/start).
 *   (b) ROLLER — uppgift.roll = 'byggare'|'granskare'|'vakt' (default
 *       byggare, bakåtkompatibelt) ger barnet rollrad i uppdragsprefixet;
 *       uppgift.filer = [] deklarerar EXKLUSIVT ägarskap (våg 104) —
 *       fabriken VARNAR vid filöverlapp inom manifestet och mot andra
 *       manifest i kön. Varning stoppar aldrig körningen (manifestet kan
 *       vara korrekt ändå — läsaren bedömer).
 *   (c) AUTO-KEDJNING — två lager: (1) IOM KÖRNINGEN: efter varje avslutad
 *       omgång startar nästa DIREKT om MemAvailable > RAM_KEDJA_MB
 *       (2 200 MB), annars status "vantar-ram" + avslut; (2) PUMPOR-
 *       daemonen ropar fabriken var 10:e minut (":x5") — det är den
 *       reservkedja som återupptar avbrutna manifest UTAN att omköra klara
 *       uppgifter (idempotens via statusfilens klara-lista).
 *   (d) MEKANISK KVALITETSGRIND (mega g7 — styrelsens beslut punkt 8,
 *       2026-09-15): en uppgift bokförs KLAR endast om (a) kvitto-raden
 *       "LEVERANS:" finns i barnets utdata, (b) en commit med rätt prefix
 *       (default "studio:", manifest.commitPrefix kan överstyra) gjordes
 *       under körningsfönstret (git log <före>..HEAD), och (c) kod-
 *       valideringen ger 0 NYA fel — preferens verktyg/validera-kod.mjs
 *       (om den finns), annars tsc-baslinjen — projektets egna binär
 *       `node node_modules/typescript/bin/tsc --noEmit` i
 *       AK1-trädet; baslinjen är mekaniskt 0 (pre-commit-hook sedan våg
 *       138) ⇒ varje fel är ett NYTT fel. Tung tsc körs ENDAST om
 *       uppgiften rörde src/ — manifestets filer avgör (rorSrc).
 *       Underkänns uppgiften: status "underkänd" + OMSTART EXAKT EN
 *       gång; andra underkänningen är slutgiltig (hoppas över vid
 *       återupptagning). Tunga kontroller körs SERIELLT (in-process
 *       kedja) — aldrig 3 parallella tsc på 8 GB-servern.
 *
 *   --torr = TORRKÖRNING: skriver ut allt som SKULLE göras (auto-manifest,
 *   valideringsvarningar, omgångsplan, kedjebeslut) men föder inga barn,
 *   flyttar inga manifest och uppdaterar inget state (utom fabrikslåset,
 *   som tas för att skydda läsningen mot en samtidig fabrik).
 *
 * Regel för modellen (står även i AGENTS.md): storskalig parallellism =
 * manifest. Agent-tool direkt FÅR bara användas ≤3 parallella anrop.
 */
import { execSync, spawn } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skrivAudit } from "./audit-logg.mjs";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROTT = path.join(ROT, "data", "vakten", "agentfabrik");
const KO = path.join(ROTT, "ko");
const KLARA = path.join(ROTT, "klara");
const STATUS = path.join(ROTT, "status");
const UTDATA = path.join(ROTT, "utdata");
const LOCK = path.join(ROTT, "LOCK");
const LOGG = path.join(ROTT, "logg.jsonl");
const KATALOG = path.join(ROT, "data", "infra", "evighetskatalog.md");
const SPAR_STATE = path.join(ROTT, "spar.json");
const AUTO_PAUS = path.join(ROTT, "AUTO-PAUS");

const PARALLELL_TAK = 3; // 12 = RAM-döden (bevisat); 3 = bevisat säkert
const RAM_TAK_MB = 1500; // vägra ny omgång under detta MemAvailable
const RAM_KEDJA_MB = 2200; // (c) auto-kedjning: nästa omgång direkt ÖVER detta
const AUTO_TAK_MS = 30 * 60_000; // (a) max ett auto-manifest per 30 min
const AUTO_UPPGIFTER = 3; // (a) ett auto-manifest = en omgång
const TIMEOUT_MS = 25 * 60_000; // 25 min per uppgift
const LOGG_TAK = 256 * 1024; // utdata-logg kapas här (disk-takt)

// (d) Mekanisk kvalitetsgrind (mega g7 — styrelsens beslut punkt 8, 2026-09-15)
const GRIND_PREFIX = "studio:"; // rätt commit-prefix (manifest.commitPrefix överstyrbar)
const VALIDERARE = path.join(ROT, "verktyg", "validera-kod.mjs"); // preferens OM den finns
const VALIDERING_TIMEOUT_MS = 5 * 60_000; // tsc på AK1-trädet ~1-2 min — marginal
const GRIND_OMSTARTER = 1; // exakt EN omstart vid underkänning (styrelsens beslut)

const ROLLER = ["byggare", "granskare", "vakt"];
const ROLLRADER = {
  byggare:
    "Roll: BYGGARE — du bygger/färdigställer nya leveranser (data, innehåll, kod) enligt uppdraget och committar DINA filer.",
  granskare:
    "Roll: GRANSKARE — du granskar befintligt material mot källor, juridik (2007:528) och kvalitet; leverera granskningsrapport + diff-förslag som NYA filer, skriv INTE om andras filer.",
  vakt:
    "Roll: VAKT — du bevakar maskinens hälsa: mät, verifiera och fixa rotorsaker med bevis (tsc 0, vakten grön, prod 200); protokollför varje fynd.",
};
// Spår med fast roll ur evighetskatalogen; övriga → byggare.
const SPAR_ROLL = { 1: "granskare", 8: "vakt", 10: "vakt" };

const TORR = process.argv.includes("--torr");

const ZCODE =
  process.env.STUDIO_ZCODE_BIN ||
  ["/home/ak1a/.npm-global/bin/zcode", path.join(process.env.HOME ?? "", ".npm-global/bin/zcode")].find(
    (p) => p && existsSync(p),
  ) ||
  "zcode";

/** Millisekunds-stämpel utan Date.now()-beroende i loggar. */
function stämpel() {
  return new Date().toISOString();
}
function logga(rad) {
  console.log(`${stämpel().slice(11, 19)} ${rad}`);
}
function torrLogga(rad) {
  logga(`[TORR] ${rad}`);
}
function loggrad(objekt) {
  try {
    mkdirSync(path.dirname(LOGG), { recursive: true });
    appendFileSync(LOGG, `${JSON.stringify({ t: stämpel(), ...objekt })}\n`);
  } catch {
    /* logg får aldrig krascha fabriken */
  }
}

/** MemAvailable i MB ur /proc/meminfo (Linux); null = okänd (tillåt). */
function ramTillgangligtMB() {
  try {
    const meminfo = readFileSync("/proc/meminfo", "utf8");
    const m = meminfo.match(/^MemAvailable:\s+(\d+)\s+kB/m);
    return m ? Math.round(Number(m[1]) / 1024) : null;
  } catch {
    return null;
  }
}

/** Git-hjälp: senaste commit-hashen (eller "?") — leveransbevis före/efter. */
function gitTopp() {
  try {
    return execSync("git log --oneline -1", { cwd: ROT, timeout: 10_000 }).toString().trim().slice(0, 80);
  } catch {
    return "?";
  }
}

// ── FABRIK 2.0 (d): mekanisk kvalitetsgrind (mega g7) ─────────────────────────

/** Full HEAD-hash — grindens commit-fönster före/efter barnkörningen. */
function gitHash() {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROT, timeout: 10_000 }).toString().trim();
  } catch {
    return "?";
  }
}

/**
 * Rörde uppgiften src/? Manifestets FILER avgör (primärt); saknas filer
 * fångar prompt-fallback konkreta src/-sökvägar. Prefixradens regeltext
 * "src/ ENDAST via Write/Edit" matchar AVSIKTLIGT inte (mellanslag efter
 * "src/"), så en prompt som bara citerar reglerna triggar inte tung tsc.
 */
function rorSrc(uppgift) {
  const filer = Array.isArray(uppgift.filer) ? uppgift.filer.map(String) : [];
  if (filer.some((f) => f.replace(/^\.\//, "").startsWith("src/"))) return true;
  return (
    filer.length === 0 && /(?:^|[\s`"'(])src\/[A-Za-z0-9_*.-]/.test(String(uppgift.prompt ?? ""))
  );
}

/**
 * Tung kodvalidering — ALLTID seriellt via in-process kedja: tre parallella
 * tsc på 8 GB-servern är RAM-döden i ny tappning (våg 146). Preferens
 * verktyg/validera-kod.mjs (dess exit-kod äger tolkningen "0 NYA fel");
 * annars tsc-baslinjen — baslinjen är mekaniskt 0 (pre-commit-hook sedan
 * våg 138 blockerar varje commit med tsc-fel) ⇒ varje fel är ett NYTT fel.
 */
let valideringsKedja = Promise.resolve();
function korValideringSeriellt() {
  const jobb = valideringsKedja.then(() => korValidering());
  valideringsKedja = jobb.catch(() => null); // kedjan får aldrig brytas av ett fel
  return jobb;
}
function korValidering() {
  // TYPESCRIPT-BINÄREN DIREKT (node …/bin/tsc) är robustare än npx: mitt i
  // en pågående npm ci kan node_modules/.bin sakna länkar och npx löser då
  // "tsc" till dummy-paketet (bevisat 2026-09-15 04:57 — deployfönster).
  const tscBin = path.join(ROT, "node_modules", "typescript", "bin", "tsc");
  const kommando = existsSync(VALIDERARE)
    ? `node "${VALIDERARE}"`
    : existsSync(tscBin)
      ? `node "${tscBin}" --noEmit`
      : "npx tsc --noEmit";
  try {
    execSync(kommando, { cwd: ROT, timeout: VALIDERING_TIMEOUT_MS, maxBuffer: 8 * 1024 * 1024 });
    return { godkand: true, kommando };
  } catch (e) {
    const ut = `${e.stdout?.toString() ?? ""}${e.stderr?.toString() ?? ""}`;
    // "error TSxxxx" = tsc KORDE och hittade typfel; annat (dummy-npx,
    // ENOENT, OOM, avbruten npm ci) = valideringen kunde inte köras —
    // miljöfel, inte barnets kod. Omstarten (en gång) är retryn.
    const typfel = /error TS\d+/.test(ut);
    return {
      godkand: false,
      kommando,
      orsak: e.killed
        ? `validering TIMEOUT efter ${VALIDERING_TIMEOUT_MS / 60000} min`
        : typfel
          ? "validering: typfel finns (kravet är 0 nya fel)"
          : "validering OTILLGÄNGLIG — kunde inte köras (miljö-/deploy-fönster?), ej barnets kod",
      detalj: ut.split("\n").filter(Boolean).slice(0, 6).join(" | ").slice(0, 400),
    };
  }
}

/**
 * Själva grindsutvärderingen — en uppgift bokförs klar ENDAST om:
 *   (a) kvitto-raden "LEVERANS:" finns i barnets utdata,
 *   (b) en commit med rätt prefix gjordes under körningsfönstret
 *       (git log <före>..HEAD; prefixmatchning på ämnesraden),
 *   (c) kodvalideringen ger 0 nya fel — tung kontroll ENDAST om
 *       uppgiften rörde src/ (manifestets filer avgör, se rorSrc).
 * Annars: underkänd + omstart en gång (se korUppgiftMedGrind).
 *
 * Känd gräns (dokumenterad, accepterad): parallella barn i samma omgång
 * delar commit-fönster — barn B kan formellt bevisas av barn A:s commit.
 * Grinden är mekanisk miniminivå (prefix + fönster), inte attribuering
 * per fil; filägarskapet sköts av manifest-valideringen (2.0b).
 */
async function utvarderaGrind(manifest, uppgift, fore, leveransRad) {
  const orsaker = [];
  const prefix =
    typeof manifest.commitPrefix === "string" && manifest.commitPrefix.trim()
      ? manifest.commitPrefix.trim()
      : GRIND_PREFIX;
  if (!leveransRad) orsaker.push("(a) kvitto-raden 'LEVERANS:' saknas i utdata");
  let commitBevis = false;
  if (fore === "?") {
    orsaker.push("(b) git-basen före körningen kunde inte läsas — commit kan inte bevisas");
  } else {
    try {
      const nu = gitHash();
      if (nu === fore) {
        orsaker.push(`(b) ingen ny commit under körningen (HEAD oförändrad ${fore.slice(0, 8)})`);
      } else {
        const amnen = execSync(`git log ${fore}..${nu} --format=%s`, { cwd: ROT, timeout: 10_000 })
          .toString()
          .split("\n")
          .filter(Boolean);
        commitBevis = amnen.some((amne) => amne.startsWith(prefix));
        if (!commitBevis) {
          orsaker.push(
            `(b) ingen commit med prefix "${prefix}" i ${fore.slice(0, 8)}..${nu.slice(0, 8)} (ämnen: ${
              amnen.slice(0, 3).join(" | ").slice(0, 140) || "ingen"
            })`,
          );
        }
      }
    } catch (e) {
      orsaker.push(`(b) git log kunde inte läsas: ${String(e).slice(0, 100)}`);
    }
  }
  let validering = {
    godkand: true,
    kommando: null,
    notering: "tung validering hoppades över — uppgiften rörde ej src/",
  };
  const berorSrc = rorSrc(uppgift);
  if (berorSrc) {
    validering = await korValideringSeriellt();
    if (!validering.godkand) {
      orsaker.push(`(c) ${validering.orsak}${validering.detalj ? ` — ${validering.detalj}` : ""}`);
    }
  }
  return {
    godkand: orsaker.length === 0,
    kontroller: {
      kvitto: Boolean(leveransRad),
      commit: commitBevis,
      prefix,
      rorSrc: berorSrc,
      validering: {
        godkand: validering.godkand,
        kommando: validering.kommando ?? null,
        notering: validering.notering ?? null,
      },
    },
    orsaker,
  };
}

// ── FABRIK 2.0 (a): evighetskatalogen → auto-manifest ─────────────────────────

/**
 * Läs evighetskatalogens spår: [{ nr, namn, beskrivning, postmall }].
 * Postmallar är citerade strängar som FÅR spänna rader (spår 1 gör det)
 * — allt normaliseras till enkla mellanslag. Spår utan postmall hoppas.
 */
function lasKatalog() {
  try {
    const text = readFileSync(KATALOG, "utf8");
    const spår = [];
    for (const sek of text.split(/^## Spår /m).slice(1)) {
      const rubrik = sek.match(/^(\d+) — (.+)$/m);
      if (!rubrik) continue;
      // kropp = sektionen UTAN sin rubrikrad ("N — NAMN"), fram till Postmall
      const kropp = sek.split(/\n─\n|\n## /)[0];
      const postmall = kropp.match(/Postmall:\s*"([\s\S]*?)"/)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
      if (!postmall) continue;
      const beskrivning =
        kropp
          .slice(0, kropp.indexOf("Postmall:"))
          .split("\n")
          .slice(1) // rubrikraden ("N — NAMN") står redan i spårets namn
          .join(" ")
          .replace(/\s+/g, " ")
          .trim() || "";
      spår.push({ nr: Number(rubrik[1]), namn: rubrik[2].trim(), beskrivning, postmall });
    }
    return spår;
  } catch {
    return []; // oläslig katalog ⇒ ingen auto-generering (fabriken som förut)
  }
}

function lasSparState() {
  try {
    return JSON.parse(readFileSync(SPAR_STATE, "utf8"));
  } catch {
    return {}; // första auto-manifestet — rotation börjar på spår 1
  }
}

/** Rotation: nästa spår efter senaste (cirkulärt, aldrig samma i rad). */
function valjSpar(spår, state) {
  const sorterade = [...spår].sort((a, b) => a.nr - b.nr);
  if (sorterade.length === 0) return null;
  const senaste = typeof state.senasteSpar === "number" ? state.senasteSpar : null;
  if (senaste === null) return sorterade[0];
  const index = sorterade.findIndex((s) => s.nr === senaste);
  return sorterade[(index + 1) % sorterade.length] ?? sorterade[0];
}

/**
 * Platshållare i katalogens postmallar. `<n>` = uppgiftens löpnummer;
 * domänplatshållare (ämne/bolag/kvartal/…) → "nästa i spåret (välj själv)"
 * — barnet FÅR inte köra på ett antaget objekt utan verifierar mot
 * arbetsytan vilket som är nästa ej levererade.
 */
function fyllPlatshallare(mall, lopnr) {
  return mall
    .replace(/<n>/g, String(lopnr))
    .replace(/<(?:ämne|amne|bransch\/språk|bransch\/sprak|bransch|bolag|kvartal|yta|objekt|område|omrade|system)>/gi, "nästa i spåret (välj själv)");
}

function genereraAutoManifest(spår) {
  const nu = Date.now();
  const roll = SPAR_ROLL[spår.nr] ?? "byggare";
  const uppgifter = [];
  for (let i = 1; i <= AUTO_UPPGIFTER; i++) {
    const kropp = fyllPlatshallare(spår.postmall, i);
    uppgifter.push({
      id: `s${spår.nr}-u${i}`,
      titel: `Spår ${spår.nr} (${roll}) ${i}/${AUTO_UPPGIFTER}: ${kropp.slice(0, 70)}`,
      roll,
      filer: [],
      prompt: [
        kropp,
        "",
        `Spår ${spår.nr} — ${spår.namn}. Kontext: ${spår.beskrivning}`,
        "Välj själv nästa INTE redan levererade objekt i spåret (kontrollera data/ och worklog.md",
        "före start) — duplikat är förlorat arbete. R2 gäller: ALDRIG priser/tier/publicering;",
        "utkast till data/blogg-utkast/, ALDRIG data/blogg/.",
        "Leveranskriterier: konkreta filer, `node node_modules/typescript/bin/tsc --noEmit` = 0 om kod berörs (ALDRIG bygge),",
        `commit "studio: auto s${spår.nr}-u${i} <vad>", avsluta med LEVERANS:-rad.`,
      ].join("\n"),
    });
  }
  return {
    id: `auto-s${spår.nr}-${nu}`,
    titel: `Auto: Spår ${spår.nr} — ${spår.namn} (${AUTO_UPPGIFTER} uppgifter ur evighetskatalogen)`,
    skapad: nu,
    auto: true,
    spar: spår.nr,
    uppgifter,
  };
}

// ── FABRIK 2.0 (b): roll- och filer-validering ────────────────────────────────

/**
 * Normalisera + validera uppgifternas roll/filer och VARNA vid
 * filöverlapp. Överlapp inom manifestet är allvarligast (två uppgifter
 * kan hamna i SAMMA parallella omgång — omgångsindelningen skiftar vid
 * återupptagning, därför varnas alltid), överlapp mot andra kö-manifest
 * ("pågående" i pipelinen) varnas också. Varning ändrar aldrig körningen.
 */
function valideraManifest(manifest, ovrigaKoManifest) {
  const varningar = [];
  for (const u of manifest.uppgifter) {
    if (u.roll === undefined) {
      u.roll = "byggare";
      varningar.push(`${manifest.id}/${u.id}: roll saknas → default "byggare"`);
    } else if (!ROLLER.includes(u.roll)) {
      varningar.push(
        `${manifest.id}/${u.id}: okänd roll "${String(u.roll).slice(0, 30)}" (tillåtna: ${ROLLER.join("|")}) → behandlas som "byggare"`,
      );
      u.roll = "byggare";
    }
    if (u.filer === undefined) {
      u.filer = [];
    } else if (!Array.isArray(u.filer)) {
      varningar.push(`${manifest.id}/${u.id}: filer är inte en lista → ignoreras`);
      u.filer = [];
    } else {
      u.filer = u.filer.map(String);
    }
    if (u.titel === undefined) u.titel = u.id;
  }
  const agare = new Map(); // fil → uppgifts-id (exklusivt ägarskap)
  for (const u of manifest.uppgifter) {
    for (const f of u.filer) {
      const nyckel = f.replace(/\/+$/, "");
      if (agare.has(nyckel)) {
        varningar.push(`FILER-OVERLAPP: ${manifest.id}/${u.id} och ${manifest.id}/${agare.get(nyckel)} claimar båda ${nyckel} — exklusivt ägarskap (våg 104) bryts`);
      } else {
        agare.set(nyckel, u.id);
      }
    }
  }
  for (const annan of ovrigaKoManifest) {
    for (const u of annan.uppgifter ?? []) {
      for (const f of Array.isArray(u.filer) ? u.filer.map(String) : []) {
        const nyckel = f.replace(/\/+$/, "");
        if (agare.has(nyckel)) {
          varningar.push(`FILER-OVERLAPP: ${manifest.id}/${agare.get(nyckel)} claimar ${nyckel} som även står i kö-manifestet ${annan.id}/${u.id}`);
        }
      }
    }
  }
  return varningar;
}

/** Övriga manifest i ko/ (för överlapp-varning) — ogiltiga filer hoppas tyst. */
function lasOvrigaKoManifest(filer) {
  const manifest = [];
  for (const f of filer) {
    try {
      const m = JSON.parse(readFileSync(path.join(KO, f), "utf8"));
      if (Array.isArray(m.uppgifter)) manifest.push(m);
    } catch {
      /* felhanteras när filen blir först i kön */
    }
  }
  return manifest;
}

/**
 * Arbetsgången varje fabriksagent får INNAN sin egen prompt — samma
 * doktrin som AGENTS.md men komprimerad (barnet läser AGENTS.md självt:
 * zcode laddar den ur arbetsytan automatiskt). Rollraden (2.0b) ger
 * barnet sin plats i divisionen: byggare levererar, granskare bedömer,
 * vakt bevakar.
 */
function prefix(titel, roll = "byggare") {
  return [
    `Du är en fabriksagent i AK1A Agentfabrik — uppdrag: ${titel}.`,
    ROLLRADER[roll] ?? ROLLRADER.byggare,
    "Arbetsyta: /home/ak1a/AK1 (doktrinen i AGENTS.md gäller fullt ut).",
    "Regler: src/ ENDAST via Write/Edit; data/ får bash; commit med `git commit -F <meddelandefil>`;",
    "ALDRIG `--no-verify`; ALDRIG röra priser/tier/publicering (kundens veto);",
    "ALDRIG publicera i data/blogg/ (live-mappen) — utkast till data/blogg-utkast/.",
    // VÅG 162 (incidentrot 2026-09-15 01:23): ett barns npm-kommando raderade
    // node_modules mitt i en deploy-omstart → prod nere 5 min (kraschvakten
    // räddade). Barn FÅR ALDRIG röra installationen — byggen ägs av
    // prod-synk/kraschvakt under deploylåset.
    "ALDRIG `npm ci`/`npm install`/`rm -rf node_modules`/`npm run build` —",
    "installation och byggen ägs ENDAV prod-synken/kraschvakten under",
    "/tmp/ak1a-deploy.lock; typkoll = `node node_modules/typescript/bin/tsc --noEmit`",
    "(läser, installerar ej — ALDRIG npx tsc: i deployfönster kan npx lösa tsc till cachens dummy-paket).",
    "När du är klar: commit:a DINA filer (git add <dina filer>) och avsluta svaret",
    "med en rad 'LEVERANS: <fil1>, <fil2>, …' — fabriken läser den som kvitto.",
  ].join("\n");
}

/** Kör ETT zcode-barn (-p = engångsprompt, ej interaktiv) med timeout+vakt.
 *  ROND 25: vidKlar anropas i close-hantlern — klara bokförs PER UPPGIFT i
 *  statusfilen, så en fabrikspågående-död mitt i omgången aldrig förlorar
 *  avslutade posters bokföring (bevis: mega g3 2026-09-15 — utdata + commit
 *  levererade men klara:[] förblev tom; återupptagningen körde om den). */
function korUppgift(manifestId, uppgift, vidKlar) {
  return new Promise((resolve) => {
    const loggSökväg = path.join(UTDATA, `${manifestId}-${uppgift.id}.log`);
    mkdirSync(UTDATA, { recursive: true });
    let buffer = "";
    const start = Date.now();
    logga(`▶ ${manifestId}/${uppgift.id} [${uppgift.roll ?? "byggare"}] "${uppgift.titel.slice(0, 60)}"`);
    // MEGA G3 — audit: varje fabriksuppgift är en autonom skrivning.
    skrivAudit(`fabriken:${manifestId}:${uppgift.id}`, "uppgift_start", uppgift.titel, `manifest: ${manifestId}`);

    const barn = spawn(
      ZCODE,
      ["-p", `${prefix(uppgift.titel, uppgift.roll)}\n\nUPPGIFT:\n${uppgift.prompt}`],
      { cwd: ROT, env: { ...process.env, HOME: process.env.HOME }, stdio: ["ignore", "pipe", "pipe"] },
    );
    const timeout = setTimeout(() => {
      barn.kill("SIGKILL");
      buffer += `\n[FABRIKEN: TIMEOUT efter ${TIMEOUT_MS / 60000} min — barnet dödades]`;
    }, TIMEOUT_MS);

    const samla = (chunk) => {
      buffer += chunk.toString();
      if (buffer.length > LOGG_TAK * 4) buffer = buffer.slice(-LOGG_TAK * 2); // minne-takt i farten
    };
    barn.stdout.on("data", samla);
    barn.stderr.on("data", samla);
    barn.on("error", (e) => {
      buffer += `\n[FABRIKEN: spawn-fel ${String(e).slice(0, 200)}]`;
    });
    barn.on("close", (kod) => {
      clearTimeout(timeout);
      try {
        writeFileSync(loggSökväg, buffer.slice(-LOGG_TAK), "utf8");
      } catch {
        /* disk-fel skall ej dölja exit-koden */
      }
      const leverans = buffer.match(/LEVERANS:\s*(.+)$/m)?.[1]?.trim() ?? null;
      logga(`■ ${manifestId}/${uppgift.id} kod=${kod ?? "?"} på ${Math.round((Date.now() - start) / 1000)}s`);
      // MEGA G3 — audit: kvitto per avslutad uppgift (leveransrader = artefakten).
      skrivAudit(
        `fabriken:${manifestId}:${uppgift.id}`,
        "uppgift_klar",
        leverans ?? `utdata/${manifestId}-${uppgift.id}.log`,
        `kod=${kod ?? "?"} sekunder=${Math.round((Date.now() - start) / 1000)}`,
      );
      const resultat = { id: uppgift.id, kod: kod ?? -1, sekunder: Math.round((Date.now() - start) / 1000), leverans };
      try {
        vidKlar?.(resultat); // ROND 25: per-uppgiftsbokföring FÖRE resolve — överlever omgångsdöd
      } catch {
        /* bokföring får aldrig döda exit-vägen */
      }
      resolve(resultat);
    });
  });
}

/**
 * (d) korUppgift + MEKANISK KVALITETSGRIND: bokförd klar ENDAST vid
 * godkänd grind (a+b+c, se utvarderaGrind). Underkänns uppgiften:
 * status "underkänd" + OMSTART EXAKT EN gång (GRIND_OMSTARTER); andra
 * underkänningen är SLUTGILTIG och hoppas över vid återupptagning
 * (se slutgiltigtUnderkända i huvud()).
 *
 * ROND 25 bevaras: klar-bokföringen sker fortfarande i korUppgifts
 * close-handlere (per uppgift, överlever omgångsdöd); underkänningen
 * plockar UR klara och skriver statusfilen direkt efter grinds-
 * utvärderingen — dog fabriken under den tunga valideringen står
 * underkänningen kvar i statusfilen, inget falskt "klar" lever kvar.
 */
async function korUppgiftMedGrind(manifest, uppgift, boka) {
  // Fabriksdöd efter en underkänning men före omstarten: omstart-raden
  // (omstart: true) i statusfilen betyder att försök 1 redan förbrukats —
  // återupptagningen kör EXAKT det sista försöket, aldrig ett tredje.
  const omstartForbrukad = boka.lasUnderkanda().some((u) => u.id === uppgift.id && u.omstart);
  const startForsok = omstartForbrukad ? 2 : 1;
  const maxForsok = omstartForbrukad ? 2 : 1 + GRIND_OMSTARTER;
  let resultat = null;
  for (let forsok = startForsok; forsok <= maxForsok; forsok++) {
    const fore = gitHash();
    resultat = await korUppgift(manifest.id, uppgift, (r) => boka.klar({ ...r, forsok }));
    const grind = await utvarderaGrind(manifest, uppgift, fore, resultat.leverans);
    logga(
      `grind ${manifest.id}/${uppgift.id} (försök ${forsok}/${maxForsok}): ${
        grind.godkand ? "GODKÄND" : `UNDERKÄND — ${grind.orsaker.join("; ").slice(0, 200)}`
      }`,
    );
    loggrad({
      händelse: "grind",
      manifest: manifest.id,
      uppgift: uppgift.id,
      forsok,
      maxForsok,
      godkand: grind.godkand,
      orsaker: grind.orsaker,
    });
    if (grind.godkand) {
      boka.rmUnderkand(uppgift.id); // godkänd omstart ⇒ underkänd-raden städas
      return { ...resultat, forsok, grind: "godkänd" };
    }
    boka.underkand(uppgift.id, forsok, grind.orsaker, forsok < maxForsok);
  }
  return { ...resultat, underkänd: true, grind: "underkänd" };
}

/** Statusfilen — agentens fönster in i fabriken. */
function skrivStatus(manifest, status) {
  mkdirSync(STATUS, { recursive: true });
  writeFileSync(path.join(STATUS, `${manifest.id}.json`), JSON.stringify(status, null, 2), "utf8");
}

/** Atomiskt mkdir-lås; städar föregångare äldre än 35 min (kraschad fabrik). */
function taLås() {
  try {
    if (existsSync(LOCK)) {
      const ålder = Date.now() - statSync(LOCK).mtimeMs;
      if (ålder < 35 * 60_000) return false;
      renameSync(LOCK, `${LOCK}.skrotad-${Date.now()}`); // obstuktion av dött lås
      logga("gammalt LOCK städades (kraschad fabriksomgång)");
    }
    mkdirSync(LOCK);
    writeFileSync(path.join(LOCK, "startad"), stämpel());
    return true;
  } catch {
    return false; // konkurrent hann före — korrekt: avstå
  }
}
function släppLås() {
  try {
    renameSync(LOCK, `${LOCK}.fri-${Date.now()}`);
  } catch {
    /* bäst förmåga */
  }
}

// ── huvud ────────────────────────────────────────────────────────────────────

async function huvud() {
  for (const mapp of [KO, KLARA, STATUS, UTDATA]) mkdirSync(mapp, { recursive: true });
  let manifestFiler = readdirSync(KO)
    .filter((f) => f.endsWith(".json"))
    .sort();

  // ── FABRIK 2.0 (a): tom kön → auto-manifest ur evighetskatalogen ──
  if (manifestFiler.length === 0) {
    const state = lasSparState();
    const takKvar =
      typeof state.senasteAutoTs === "number" && Date.now() - state.senasteAutoTs < AUTO_TAK_MS;
    if (existsSync(AUTO_PAUS)) {
      logga("kön tom — AUTO-PAUS aktiv: ingen auto-generering (kundens paus är heligt)");
    } else if (takKvar) {
      logga(
        `kön tom — auto-tak: ${Math.round((Date.now() - state.senasteAutoTs) / 60000)} min sedan senaste auto-manifest (< ${AUTO_TAK_MS / 60000}) — avslutar`,
      );
    } else {
      const spår = valjSpar(lasKatalog(), state);
      if (!spår) {
        logga("kön tom — evighetskatalogen oläsbar/saknar postmallar — avslutar (som före 2.0)");
      } else {
        const manifest = genereraAutoManifest(spår);
        if (TORR) {
          torrLogga(
            `kön tom — SKULLE generera auto-manifest ur Spår ${spår.nr} (rotation: senaste=${state.senasteSpar ?? "ingen"}) och skriva ko/${manifest.id}.json + uppdatera spar.json. Manifest som SKULLE skrivas:`,
          );
          console.log(JSON.stringify(manifest, null, 2));
          return;
        }
        writeFileSync(path.join(KO, `${manifest.id}.json`), JSON.stringify(manifest, null, 2), "utf8");
        writeFileSync(
          SPAR_STATE,
          JSON.stringify(
            { senasteSpar: spår.nr, senasteAutoTs: Date.now(), senasteAutoId: manifest.id },
            null,
            2,
          ),
          "utf8",
        );
        manifestFiler = [`${manifest.id}.json`];
        logga(
          `kön tom — AUTO-MANIFEST genererat: ${manifest.id} (Spår ${spår.nr} — ${spår.namn}, roll ${SPAR_ROLL[spår.nr] ?? "byggare"})`,
        );
        loggrad({
          händelse: "auto-manifest",
          manifest: manifest.id,
          spår: spår.nr,
          roll: SPAR_ROLL[spår.nr] ?? "byggare",
        });
      }
    }
    if (manifestFiler.length === 0) return; // kön förblev tom — låset släpps i finally
  }

  const fil = manifestFiler[0]; // ETT manifest per omgång — resten väntar
  const manifestSökväg = path.join(KO, fil);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestSökväg, "utf8"));
    if (!Array.isArray(manifest.uppgifter) || manifest.uppgifter.length === 0) throw new Error("inga uppgifter");
    if (typeof manifest.id !== "string" || !manifest.id) throw new Error("id saknas");
    for (const u of manifest.uppgifter) {
      if (!u || typeof u.id !== "string" || !u.id) throw new Error(`uppgift utan id: ${JSON.stringify(u).slice(0, 60)}`);
      if (typeof u.prompt !== "string" || !u.prompt) throw new Error(`uppgift ${u.id}: prompt saknas`);
    }
  } catch (e) {
    logga(`ogiltigt manifest ${fil}: ${String(e).slice(0, 120)} — flyttas till klara/ som FEL`);
    loggrad({ händelse: "manifest-fel", fil, fel: String(e).slice(0, 200) });
    if (TORR) {
      torrLogga(`SKULLE flytta ${fil} → klara/FEL-<ts>-${fil}`);
      return;
    }
    renameSync(manifestSökväg, path.join(KLARA, `FEL-${Date.now()}-${fil}`));
    return; // låset släpps i finally
  }

  // ── FABRIK 2.0 (b): roller + exklusivt filägarskap — varna, avbryt aldrig ──
  const varningar = valideraManifest(manifest, lasOvrigaKoManifest(manifestFiler.slice(1)));
  for (const v of varningar) logga(`VARNING: ${v}`);
  if (varningar.length > 0) {
    loggrad({ händelse: "manifest-varningar", manifest: manifest.id, antal: varningar.length });
  }

  logga(`manifest ${manifest.id}: ${manifest.uppgifter.length} uppgifter, tak ${PARALLELL_TAK}`);

  // Återupptagning: en tidigare omgång kan ha avbrutits av RAM-vakten med
  // ofullständig leverans — statusfilens klara-lista är sanningen, redan
  // klarade uppgifter körs ALDRIG igen (idempotens över omstarter).
  let sparadStatus = null;
  try {
    sparadStatus = JSON.parse(readFileSync(path.join(STATUS, `${manifest.id}.json`), "utf8"));
  } catch {
    /* första omgången — ingen tidigare status */
  }
  const redanKlara = new Set(
    Array.isArray(sparadStatus?.klara) ? sparadStatus.klara.map((r) => r.id) : [],
  );
  // (d) slutgiltigt underkända (omstarten förbrukad) hoppas också över —
  // omstart sker EXAKT en gång, aldrig en tredje körning vid återupptagning.
  const underkandaSparade = Array.isArray(sparadStatus?.underkända) ? sparadStatus.underkända : [];
  const slutgiltigtUnderkända = new Set(
    underkandaSparade.filter((u) => u && typeof u.id === "string" && !u.omstart).map((u) => u.id),
  );
  const köade = manifest.uppgifter.filter(
    (u) => !redanKlara.has(u.id) && !slutgiltigtUnderkända.has(u.id),
  );

  // ── torrkörning: skriv planen, rör inget ──
  if (TORR) {
    torrLogga(
      `SKULLE bearbeta ${manifest.id} — ${manifest.uppgifter.length} uppgifter (${redanKlara.size} redan klara hoppas över, ${köade.length} köade)`,
    );
    torrLogga(`validering: ${varningar.length} varningar (se ovan; roller normaliserade till ${ROLLER.join("|")})`);
    torrLogga(
      `grind (d): varje uppgift kräver LEVERANS-kvititto + "${manifest.commitPrefix?.trim() || GRIND_PREFIX}"-commit i körningsfönstret + kodvalidering 0 nya fel (tung tsc ENDAST om uppgiften rörde src/); underkänning ⇒ omstart exakt ${GRIND_OMSTARTER} gång${GRIND_OMSTARTER === 1 ? "" : "er"}`,
    );
    torrLogga(`RAM just nu: ${ramTillgangligtMB() ?? "?"} MB (vägra-gräns ${RAM_TAK_MB}, kedje-gräns ${RAM_KEDJA_MB})`);
    const plan = [...köade];
    let n = 1;
    while (plan.length > 0) {
      const omgång = plan.splice(0, PARALLELL_TAK);
      torrLogga(
        `omgång ${n++}: ${omgång.map((u) => `${u.id} [${u.roll ?? "byggare"}]`).join(", ")} — SKULLE föda ${omgång.length} zcode-barn parallellt`,
      );
      if (plan.length > 0) {
        torrLogga(
          `  efter omgången: auto-kedjning DIREKT om MemAvailable > ${RAM_KEDJA_MB} MB, annars status "vantar-ram" + avslut (pumpor :x5 återupptar inom 10 min)`,
        );
      }
    }
    torrLogga(`avslut: status → "klar", ko/${fil} → klara/${manifest.id}.json`);
    return;
  }

  const status = {
    id: manifest.id,
    titel: manifest.titel ?? manifest.id,
    startad: stämpel(),
    status: "pågår",
    totalt: manifest.uppgifter.length,
    klara: sparadStatus?.klara ?? [],
    underkända: underkandaSparade, // (d) grindens fallerade försök (omstart=true ⇒ ej slutgiltig)
    // 2.0b: synliggör roller + deklarerat filägarskap i agentens statusfönster
    uppgiftsinfo: manifest.uppgifter.map((u) => ({ id: u.id, roll: u.roll, filer: u.filer.length })),
    uppgiftLoggar: manifest.uppgifter.map((u) => `utdata/${manifest.id}-${u.id}.log`),
  };
  skrivStatus(manifest, status);

  // (d) bokförings-gränssnittet mot korUppgiftMedGrind — per uppgift +
  // direkt statusskrivning (ROND 25: bokföringen överlever omgångsdöd).
  const boka = {
    klar(r) {
      status.klara.push(r);
      skrivStatus(manifest, status);
    },
    underkand(id, forsok, orsaker, omstart) {
      status.klara = status.klara.filter((r) => r.id !== id);
      status.underkända = status.underkända.filter((u) => u.id !== id);
      status.underkända.push({ id, forsok, orsaker, omstart, ts: stämpel() });
      skrivStatus(manifest, status);
    },
    rmUnderkand(id) {
      status.underkända = status.underkända.filter((u) => u.id !== id);
      skrivStatus(manifest, status);
    },
    lasUnderkanda() {
      return status.underkända;
    },
  };

  // Omgångar om PARALLELL_TAK — RAM-vakt före VARJE omgång (aldrig blint).
  const gitFore = gitTopp();
  while (köade.length > 0) {
    const ram = ramTillgangligtMB();
    if (ram !== null && ram < RAM_TAK_MB) {
      logga(`RAM-vakt: ${ram} MB < ${RAM_TAK_MB} MB — avbryter omgången (kvar: ${köade.length})`);
      status.status = "vantar-ram";
      status.kvar = köade.map((u) => u.id);
      skrivStatus(manifest, status);
      loggrad({ händelse: "ram-vakt", manifest: manifest.id, ram, kvar: köade.length });
      process.exit(0); // finally släpper låset; nästa fabriksrop återupptar
    }
    const omgång = köade.splice(0, PARALLELL_TAK);
    logga(`omgång: ${omgång.map((u) => u.id).join(", ")} (ram ${ram ?? "?"} MB)`);
    // ROND 25 + (d): varje uppgift genom MEKANISK KVALITETSGRIND — klar
    // bokförs ENDAST vid godkänd grind; underkänning ⇒ omstart en gång.
    const resultat = await Promise.all(omgång.map((u) => korUppgiftMedGrind(manifest, u, boka)));
    skrivStatus(manifest, status); // säkerhetsnät om en vidKlar svalt ett fel
    for (const r of resultat) {
      loggrad({
        händelse: r.underkänd ? "uppgift-underkänd" : "uppgift-klar",
        manifest: manifest.id,
        id: r.id,
        kod: r.kod,
        sekunder: r.sekunder,
        leverans: r.leverans,
        forsok: r.forsok,
        grind: r.grind ?? "godkänd",
      });
    }

    // ── FABRIK 2.0 (c): auto-kedjning — nästa omgång DIREKT om RAM tillåter.
    // Lager 2 är pumpor-daemonens :x5-rop (var 10:e minut) som återupptar
    // här efter paus — klara uppgifter hoppas över, inget körs om.
    if (köade.length > 0) {
      const ramEfter = ramTillgangligtMB();
      if (ramEfter !== null && ramEfter <= RAM_KEDJA_MB) {
        logga(
          `auto-kedjning: ${ramEfter} MB ≤ ${RAM_KEDJA_MB} MB — pausar kedjan, :x5-ropet återupptar (kvar: ${köade.length})`,
        );
        status.status = "vantar-ram";
        status.kvar = köade.map((u) => u.id);
        skrivStatus(manifest, status);
        loggrad({ händelse: "kedje-paus", manifest: manifest.id, ram: ramEfter, kvar: köade.length });
        process.exit(0); // finally släpper låset
      }
      logga(`auto-kedjning: ${ramEfter ?? "?"} MB > ${RAM_KEDJA_MB} MB — nästa omgång startar DIREKT`);
    }
  }

  status.status = "klar"; // (d) kontraktet med läsaren består ("klar" = manifestet är avslutat); underkända uppgifter syns i fältet underkända
  status.slutad = stämpel();
  status.gitFore = gitFore;
  status.gitEfter = gitTopp();
  skrivStatus(manifest, status);
  renameSync(manifestSökväg, path.join(KLARA, `${manifest.id}.json`));
  const underkändaAntal = status.underkända.filter((u) => !u.omstart).length;
  loggrad({
    händelse: "manifest-klar",
    manifest: manifest.id,
    uppgifter: status.totalt,
    levererade: status.klara.filter((r) => r.leverans).length,
    underkända: underkändaAntal,
  });
  logga(
    `manifest ${manifest.id} KLART — ${status.klara.length}/${status.totalt} uppgifter${
      underkändaAntal > 0 ? ` (${underkändaAntal} slutgiltigt underkända — se underkända i statusfilen)` : ""
    }`,
  );
}

if (!taLås()) {
  logga(TORR ? "annan fabrik håller låset — torrkörning avslutar (idempotent)" : "annan fabrik håller låset — avslutar (idempotent)");
  process.exit(0);
}
try {
  await huvud();
} catch (e) {
  logga(`FABRIKSFEL: ${String(e).slice(0, 300)}`);
  loggrad({ händelse: "fabriksfel", fel: String(e).slice(0, 500) });
  process.exitCode = 1;
} finally {
  släppLås();
}
