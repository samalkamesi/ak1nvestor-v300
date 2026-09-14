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

const PARALLELL_TAK = 3; // 12 = RAM-döden (bevisat); 3 = bevisat säkert
const RAM_TAK_MB = 1500; // vägra ny omgång under detta MemAvailable
const TIMEOUT_MS = 25 * 60_000; // 25 min per uppgift
const LOGG_TAK = 256 * 1024; // utdata-logg kapas här (disk-takt)

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

/**
 * Arbetsgången varje fabriksagent får INNAN sin egen prompt — samma
 * doktrin som AGENTS.md men komprimerad (barnet läser AGENTS.md självt:
 * zcode laddar den ur arbetsytan automatiskt).
 */
function prefix(titel) {
  return [
    `Du är en fabriksagent i AK1A Agentfabrik — uppdrag: ${titel}.`,
    "Arbetsyta: /home/ak1a/AK1 (doktrinen i AGENTS.md gäller fullt ut).",
    "Regler: src/ ENDAST via Write/Edit; data/ får bash; commit med `git commit -F <meddelandefil>`;",
    "ALDRIG `--no-verify`; ALDRIG röra priser/tier/publicering (kundens veto);",
    "ALDRIG publicera i data/blogg/ (live-mappen) — utkast till data/blogg-utkast/.",
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
    logga(`▶ ${manifestId}/${uppgift.id} "${uppgift.titel.slice(0, 60)}"`);
    // MEGA G3 — audit: varje fabriksuppgift är en autonom skrivning.
    skrivAudit(`fabriken:${manifestId}:${uppgift.id}`, "uppgift_start", uppgift.titel, `manifest: ${manifestId}`);

    const barn = spawn(
      ZCODE,
      ["-p", `${prefix(uppgift.titel)}\n\nUPPGIFT:\n${uppgift.prompt}`],
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

/** Statusfilen — agentens fönster in i fabriken. */
function skrivStatus(manifest, status) {
  mkdirSync(STATUS, { recursive: true });
  writeFileSync(path.join(STATUS, `${manifest.id}.json`), JSON.stringify(status, null, 2), "utf8");
}

/** Atomärt mkdir-lås; städar föregångare äldre än 35 min (kraschad fabrik). */
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

if (!taLås()) {
  logga("annan fabrik håller låset — avslutar (idempotent)");
  process.exit(0);
}
try {
  for (const mapp of [KO, KLARA, STATUS, UTDATA]) mkdirSync(mapp, { recursive: true });
  const manifestFiler = readdirSync(KO)
    .filter((f) => f.endsWith(".json"))
    .sort();
  if (manifestFiler.length === 0) {
    logga("kön tom");
    släppLås(); // töm inte kön-svaret på låset: annars blockerar varje tom rop fabriken 35 min
    process.exit(0);
  }
  const fil = manifestFiler[0]; // ETT manifest per omgång — resten väntar
  const manifestSökväg = path.join(KO, fil);
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestSökväg, "utf8"));
    if (!Array.isArray(manifest.uppgifter) || manifest.uppgifter.length === 0) throw new Error("inga uppgifter");
    if (typeof manifest.id !== "string" || !manifest.id) throw new Error("id saknas");
  } catch (e) {
    logga(`ogiltigt manifest ${fil}: ${String(e).slice(0, 120)} — flyttas till klara/ som FEL`);
    loggrad({ händelse: "manifest-fel", fil, fel: String(e).slice(0, 200) });
    renameSync(manifestSökväg, path.join(KLARA, `FEL-${Date.now()}-${fil}`));
    släppLås(); // samma låsläcka som kön tom-grenen
    process.exit(0);
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
  const status = {
    id: manifest.id,
    titel: manifest.titel ?? manifest.id,
    startad: stämpel(),
    status: "pågår",
    totalt: manifest.uppgifter.length,
    klara: sparadStatus?.klara ?? [],
    uppgiftLoggar: manifest.uppgifter.map((u) => `utdata/${manifest.id}-${u.id}.log`),
  };
  skrivStatus(manifest, status);

  // Omgångar om PARALLELL_TAK — RAM-vakt före VARJE omgång (aldrig blint).
  const köade = manifest.uppgifter.filter((u) => !redanKlara.has(u.id));
  const gitFore = gitTopp();
  while (köade.length > 0) {
    const ram = ramTillgangligtMB();
    if (ram !== null && ram < RAM_TAK_MB) {
      logga(`RAM-vakt: ${ram} MB < ${RAM_TAK_MB} MB — avbryter omgången (kvar: ${köade.length})`);
      status.status = "vantar-ram";
      status.kvar = köade.map((u) => u.id);
      skrivStatus(manifest, status);
      loggrad({ händelse: "ram-vakt", manifest: manifest.id, ram, kvar: köade.length });
      släppLås();
      process.exit(0); // nästa fabriksrop återupptar; klara uppgifter hoppas över
    }
    const omgång = köade.splice(0, PARALLELL_TAK);
    logga(`omgång: ${omgång.map((u) => u.id).join(", ")} (ram ${ram ?? "?"} MB)`);
    // ROND 25: vidKlar bokför varje avslutad uppgift direkt i statusfilen —
    // dog fabriken mitt i omgången plockar återupptagningen upp alla klara.
    const resultat = await Promise.all(
      omgång.map((u) =>
        korUppgift(manifest.id, u, (r) => {
          status.klara.push(r);
          skrivStatus(manifest, status);
        }),
      ),
    );
    skrivStatus(manifest, status); // säkerhetsnät om en vidKlar svalt ett fel
    for (const r of resultat) {
      loggrad({ händelse: "uppgift-klar", manifest: manifest.id, ...r });
    }
  }

  status.status = "klar";
  status.slutad = stämpel();
  status.gitFore = gitFore;
  status.gitEfter = gitTopp();
  skrivStatus(manifest, status);
  renameSync(manifestSökväg, path.join(KLARA, `${manifest.id}.json`));
  loggrad({
    händelse: "manifest-klar",
    manifest: manifest.id,
    uppgifter: status.totalt,
    levererade: status.klara.filter((r) => r.leverans).length,
  });
  logga(`manifest ${manifest.id} KLART — ${status.klara.length}/${status.totalt} uppgifter`);
} catch (e) {
  logga(`FABRIKSFEL: ${String(e).slice(0, 300)}`);
  loggrad({ händelse: "fabriksfel", fel: String(e).slice(0, 500) });
  process.exitCode = 1;
} finally {
  släppLås();
}
