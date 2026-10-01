// ssr-livssond.mjs — SSR-livssond för kvalitetsvakten (spår 8, o64, 2026-09-18)
//
// ROTORSAKA SOM BOTAS: o47 (2026-09-17) bevisade att prod kan stå sjuk i
// timmar — 1 616 SSR-sidor svarade HTTP 500 (trasigt .next efter ett patch-
// byggs felgren) medan / svarade 200 och ALLA mekaniska vakter var gröna.
// Kvalitetsvakten mäter ENDAST statiska ytor (filer, JSON, länkar mot
// src/app); gränsnittsvakten samplar konsol på ett fåtal sidor. Ingen vakt
// provade levande rutter ⇒ sjuk prod upptäcktes av en ad-hoc-crawl, inte av
// vaktssystemet. Denna sektion är den saknade livssonden: deterministiska
// sentinellrutter (o47:s exakta 500-rötter) provas på loopback vid varje
// vaktkörning.
//
// MÄTFÖNSTER-GRIND FÖRE MÄTVÄRDE (o55 §2:s kontrakt, buret in i kvalitets-
// vakten — "bär över vid behov" infrias här):
//   (a) deploylåset ÄGS av någon — /proc-fd = öppna fd:n, ALDRIG filens
//       existens (flock lämnar filen kvar mellan deploys; o574: /proc-läsning
//       i stället för fuser — psmisc saknas på SSD Nodes, o570:s fynd);
//   (b) bygg/install-process — pgrep -f mot HELA mönster
//       ("next build,npm ci --no-audit": sekvenserna finns bara i äkta
//       anrop — pm2 bär "next start", fabriksprompter blott "npm ci"),
//       med SLÄKT-EXKLUDERING: den egna processkedjan (jag + föräldrar)
//       matchas ALDRIG — live-bevis 2026-09-18: en sondpipeline där själva
//       kontrollkommandot bar mönstertexten gav sig själv som träff
//       (o55:s F2-klass hos OBSERVATÖREN; exkluderingen dödar den klassen)
//       — och sedan o574 ÄVEN KEDJANS BARN: skal som forkar pipe-grenar
//       bär en mikrosekund FÖRÄLDERNS cmdline (ändras först vid exec) och
//       kan självmatcha; en äkta deploy är aldrig barn till vaktens kedja;
//   (c) träff ⇒ MANUELL "OMÄTT" — vakten ger ALDRIG tyst PASS och ALDRIG
//       artefakt-FEL (driftfönster bokförs ärligt, o47/o55-doktrinen).
//
// UTFALLSTOLKNING per sentinell:
//   2xx/3xx = levande (3xx noteras — Next:s canonical/lokalisering).
//   5xx     = FEL — servern SVARAR med serverfel = äkta o47-klass, aldrig
//             driftartefakt (restart ger connection refused, ej 500).
//   4xx     = MANUELL — sentinellen kan ha flyttats (vaktkoden åtgärdas).
//   nätfel/timeout = MANUELL — omätbart (omstart? kall ISR? last?).
//
// Miljövariabler (testbarhet enligt o55-mönstret; standard = skarpt läge):
//   AK1A_SSR_SOND_BAS        bas-URL (standard http://localhost:3000 —
//                            loopback är whitelistad i middleware, AGENTS.md)
//   AK1A_SSR_SOND_RUTTER     kommaseparerade sentineller (standard o47-rötter)
//   AK1A_SSR_SOND_TIDSGRANS_MS  tidsgräns per förfrågan (standard 20 000)
//   AK1A_DEPLOY_LAS          sökväg till deploylåset (standard /tmp/ak1a-deploy.lock)
//   AK1A_BYGG_MONSTER        kommaseparerade HELA pgrep-mönster
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, readlinkSync, realpathSync } from "node:fs";

export const STANDARD_RUTTER = ["/", "/kurser", "/analyser", "/blogg", "/labb", "/en", "/ar"];
const STANDARD_TIDSGRANS_MS = 20_000;

// ── släktexkludering: jag + alla föräldrar kan aldrig vara "byggprocess" ──
// /proc/<pid>/stat: "pid (comm) state ppid …" — comm kan innehålla parenteser
// och mellanslag, därför söks sista ')'. Läsning av ~20 små statfiler är
// billigt (o50:s procfs-läxa gällde mkdirSync-recursive mot /proc, ej läsning).
function minSlakt() {
  const slakt = new Set();
  let pid = process.pid;
  let varv = 0;
  while (Number.isInteger(pid) && pid > 1 && varv++ < 32) {
    slakt.add(pid);
    let stat = null;
    try {
      stat = readFileSync(`/proc/${pid}/stat`, "utf8");
    } catch {
      break; // processen försvann mid-gång — keddan slutar här
    }
    const slut = stat.lastIndexOf(")");
    const m = slut >= 0 ? stat.slice(slut + 2).match(/^\S+ (\d+)/) : null;
    pid = m ? Number(m[1]) : 0;
  }
  if (Number.isInteger(pid) && pid > 1) slakt.add(pid); // roten (systemd/init)
  return slakt;
}

function lasHollare(deployLas) {
  // o574: fuser (psmisc) SAKNAS på SSD Nodes-servern (Contabo-fött verktyg)
  // — fd-ägandet läses i stället direkt ur /proc: en flock-hållare bär ALLTID
  // en öppen fd mot låsfilen, exakt den sanning fuser lämnade (o570:s mönster
  // ur båda länkvakterna). ALDRIG en egen flock-probe här: den skulle själv
  // ta låset en mikrosekund och kan få en ÄKTA deploys non-blocking acquire
  // att fela. readdir/readlink/stat öppnar ingen fd mot låsfilen — sonden kan
  // aldrig se sig själv.
  let lasSokvag;
  try {
    lasSokvag = realpathSync(deployLas);
  } catch {
    return null; // filen finns ej = ingen kan hålla den
  }
  const pids = [];
  for (const pid of readdirSync("/proc")) {
    if (!/^\d+$/.test(pid)) continue;
    let fds;
    try {
      fds = readdirSync(`/proc/${pid}/fd`);
    } catch {
      continue; // andra användare/processzoner — fuser hade samma gräns
    }
    for (const fd of fds) {
      let mal;
      try {
        mal = readlinkSync(`/proc/${pid}/fd/${fd}`);
      } catch {
        continue;
      }
      if (mal === lasSokvag) {
        pids.push(pid);
        break;
      }
    }
  }
  return pids.length > 0 ? pids.join(",") : null;
}

function lasByggprocess(monster) {
  const slakt = minSlakt();
  for (const monsterStr of monster) {
    const sub = spawnSync("pgrep", ["-f", monsterStr], { encoding: "utf8", timeout: 10_000 });
    if (sub.error || sub.status !== 0) continue;
    const frammande = (sub.stdout || "")
      .split(/\s+/)
      .filter((p) => /^\d+$/.test(p))
      .map(Number)
      .filter((p) => {
        if (slakt.has(p)) return false; // o55 F2: kedjan själv är aldrig byggprocess
        // o574: kedjans EGENA BARN är det heller aldrig — ett skal som forkar
        // pipe-grenar lämnar kortlivade barn som vid fångsttillfället bär
        // FÖRÄLDERNS cmdline (ändras först vid exec) och därmed även ett
        // självbärande mönster; bevisat med /proc-ögonvittne (fork-barn
        // PID+1, snapshot-cmdline, matchande pgrep). En ÄKTA byggprocess är
        // alltid barn till SIN cron/synk-familj — aldrig till denna kedja.
        let ppid = 0;
        try {
          const stat = readFileSync(`/proc/${p}/stat`, "utf8");
          const slut = stat.lastIndexOf(")");
          const m = slut >= 0 ? stat.slice(slut + 2).match(/^\S+ (\d+)/) : null;
          ppid = m ? Number(m[1]) : 0;
        } catch {
          return false; // processen hann dö efter pgrep — ingen levande byggprocess
        }
        return !slakt.has(ppid);
      });
    if (frammande.length > 0) return { monster: monsterStr, pids: frammande.join(",") };
  }
  return null;
}

async function sonda(url, tidsgrensMs) {
  const kontroll = new AbortController();
  const stopur = setTimeout(() => kontroll.abort(), tidsgrensMs);
  const start = Date.now();
  try {
    const svar = await fetch(url, { signal: kontroll.signal, redirect: "manual" });
    return { typ: "svar", status: svar.status, ms: Date.now() - start };
  } catch (e) {
    const aborterad = e?.name === "AbortError";
    return { typ: aborterad ? "timeout" : "natfel", fel: String(e?.cause?.code || e?.message || e).slice(0, 120), ms: Date.now() - start };
  } finally {
    clearTimeout(stopur);
  }
}

// Sektionen — returnerar kvalitetsvaktens sektionsform:
// { namn, fel: [...], manuella: [...], info: [...] }
export async function sektionSsrLivssond() {
  const namn = "SSR-livssond (loopback-prob av sentinellrutter — o47:s 500-klass)";
  const fel = [];
  const manuella = [];
  const info = [];

  const bas = (process.env.AK1A_SSR_SOND_BAS || "http://localhost:3000").replace(/\/+$/, "");
  const rutter = (process.env.AK1A_SSR_SOND_RUTTER || STANDARD_RUTTER.join(","))
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const tidsgrensMs = Number(process.env.AK1A_SSR_SOND_TIDSGRANS_MS || STANDARD_TIDSGRANS_MS);
  const deployLas = process.env.AK1A_DEPLOY_LAS || "/tmp/ak1a-deploy.lock";
  const monster = (process.env.AK1A_BYGG_MONSTER || "next build,npm ci --no-audit")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  // (a) deploylåsets ÄGARE
  const hollare = lasHollare(deployLas);
  if (hollare) {
    manuella.push({
      fil: deployLas,
      plats: "-",
      ord: "deployfönster",
      kontext: `låset ÄGS av PID ${hollare} (/proc-fd = öppna fd:n) — pågående deploy; SSR OMÄTT denna körning, omkör vakten när fönstret stängts`,
    });
    info.push(`mätfönster-grind: deploylåset ägs av PID ${hollare} — SSR OMÄTT (o55 §2: aldrig mätvärde i deployfönster)`);
    return { namn, fel, manuella, info };
  }

  // (b) bygg/install-process utanför släkten
  const bygg = lasByggprocess(monster);
  if (bygg) {
    manuella.push({
      fil: "verktyg/ssr-livssond.mjs",
      plats: "pgrep",
      ord: "byggfönster",
      kontext: `process som matchar "${bygg.monster}" lever (PID ${bygg.pids}) — pågående bygg/install; SSR OMÄTT denna körning`,
    });
    info.push(`mätfönster-grind: bygg/install ("${bygg.monster}", PID ${bygg.pids}) — SSR OMÄTT`);
    return { namn, fel, manuella, info };
  }

  info.push(`provar ${rutter.length} sentinellrutter mot ${bas} (tidsgräns ${tidsgrensMs} ms/förfrågan; o47:s 500-rötter)`);
  const resultat = await Promise.all(rutter.map((r) => sonda(`${bas}${r}`, tidsgrensMs)));

  let levande = 0;
  for (let i = 0; i < rutter.length; i++) {
    const r = resultat[i];
    if (r.typ === "svar" && r.status >= 200 && r.status < 400) {
      levande++;
      info.push(`${rutter[i]} → ${r.status} på ${r.ms} ms${r.status >= 300 ? " (omdirigering — noterad, anses levande)" : ""}`);
    } else if (r.typ === "svar" && r.status >= 500) {
      // Servern SVARAR med serverfel = o47-klassen: äkta FEL, aldrig artefakt
      // (omstart ger connection refused — den hamnar i nätfel-grenen).
      fel.push({
        fil: `SSR ${rutter[i]}`,
        plats: bas,
        detalj: `HTTP ${r.status} efter ${r.ms} ms — SSR-sidan serverfallerar (o47-klassen: kontrollera pm2-loggen och .next-integritet; ChunkLoadError/MODULE_NOT_FOUND är den kända signaturen)`,
      });
    } else if (r.typ === "svar") {
      manuella.push({
        fil: `SSR ${rutter[i]}`,
        plats: bas,
        ord: `HTTP ${r.status}`,
        kontext: `sentinellen svarar ${r.status} (ej 2xx/3xx) — rutt Flyttad/raderad? vaktkonstanten AK1A_SSR_SOND_RUTTER/defaultlistan behöver ses över`,
      });
    } else {
      manuella.push({
        fil: `SSR ${rutter[i]}`,
        plats: bas,
        ord: r.typ,
        kontext: `kunde inte provas (${r.fel}) efter ${r.ms} ms — omstart, kall ISR eller last; om det återkommer: undersök pm2 och ISR-varmaren`,
      });
    }
  }

  info.push(`${levande}/${rutter.length} sentineller levande (2xx/3xx)`);
  return { namn, fel, manuella, info };
}
