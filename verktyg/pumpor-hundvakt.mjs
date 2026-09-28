#!/usr/bin/env node
/**
 * PUMPOR-HUNDVAKTEN (v192, r287 2026-09-28) — extern pulsvakt åt daemonen
 * =====================================================================
 * BAKGRUND (r285:s fynd): pumpor-daemonen frös intermittent i block
 * (03:22:30→03:27:00, 03:29:30→03:39:20) med pm2 "online"/0 omstarter,
 * state S + wchan ep_poll och INGA barn — konsekvensen var missade
 * :x7-poller som svälter deploys. o140:s tick-mätning är MÄTBLIND för
 * totalblockad (den kan bara rapportera när tick() får köras — en helt
 * blockerad event-loop producerar ingen rad alls). Väntar man på att
 * instrumentet ska larma väntar man för alltid.
 *
 * KURAN ÄR TVÅDELAD:
 *   1. ROTEN (hypotes, mest sannolik): daemonens barn spawnades med
 *      stdio "inherit" — byggfloder från prod-synk/npm/next-build delade
 *      daemonens stdout-pipe till pm2:s God-daemon; pipan fylldes under
 *      tung last ⇒ daemonens egen console.log blockerade event-loopen i
 *      kernelläge (state S + ep_poll = exakt frysbilden). Daemonen kör
 *      nu barnen med stdio "ignore" (varje verktyg loggar själv på disk).
 *   2. DENNA HUNDVAKT: oavsett rot — daemonens logg-puls bevakas UTANFÖR
 *      daemonen. Tystnad > 3 min ⇒ journal + pm2-omstart (eskalering:
 *      max 1 omstart/10 min, efter 2 omstarter utan läkning pausas
 *      auto-omstart 1 h och läget bokförs som ESKALERAT).
 *
 * PULSKÄLLA: automation-motorn ropas minutvis ("▶ automation-motor") —
 * normal logg har minst en rad/minut. Tystnadströskel 180 s.
 *
 * pm2: startas som pumpor-hundvakt (pm2 save) — listed i
 * data/infra/konfig-referens/pm2-processer.reference.
 * Kastar ALDRIG utanför sina egna await-ytor; pm2 startar om vid krasch.
 */
import { open } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { appendFile } from "node:fs/promises";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── Konfigurerbara konstanter (testerna overridar via beroenden) ────────────
export const KOLL_INTERVALL_MS = 30_000; // egen puls
export const TYSTNAD_MS = 180_000; // > 3 min tyst logg = frysning
export const OMSTART_MIN_MS = 600_000; // minst 10 min mellan omstarter
export const MAX_OMSTART_I_FÖLJD = 2; // därefter eskalering
export const ESKALERINGSBACKOFF_MS = 3_600_000; // 1 h paus av auto-omstart
const LOGGFÖNSTER_BYTE = 65_536; // läser bara loggens svans — filen kan växa
const TIDSRAD_RE = /^(\d{2}):(\d{2}):(\d{2}) /; // daemonens logga(): HH:MM:SS (UTC)

/**
 * Ren parser: nyaste tidsstämpeln i daemonloggs-rader (HH:MM:SS, UTC, utan
 * datum). Midnattsövergång: en tolkad tid i framtiden (> nu + 2 min) tillhör
 * gårdagen. Ogiltiga rader ignoreras. Returnerar Date ELLER null (tom/ogen).
 */
export function beraknaSenasteRadTs(rader, nu) {
  let senaste = null;
  for (const rad of rader) {
    const m = TIDSRAD_RE.exec(rad);
    if (!m) continue;
    const [, h, mi, s] = m;
    if (+h > 23 || +mi > 59 || +s > 59) continue;
    let ts = new Date(nu);
    ts.setUTCHours(+h, +mi, +s, 0);
    if (ts.getTime() - nu.getTime() > 120_000) {
      ts = new Date(ts.getTime() - 86_400_000); // raden var från igår
    }
    if (!senaste || ts.getTime() > senaste.getTime()) senaste = ts;
  }
  return senaste;
}

/**
 * Tillståndsmaskin + IO avskild: byggHundvakt(deps) returnerar { kolla } —
 * testerna injicerar klocka, loggläsning, journal och omstart.
 */
export function byggHundvakt({
  nu = () => new Date(),
  lasRader, // async () => string[]  (daemonloggens svans)
  journal = async (obj) => { await appendFile(path.join(ROT, "data/vakten/pumpor-hundvakt.jsonl"), JSON.stringify(obj) + "\n"); },
  omstart = (klar) => {
    const b = spawn("pm2", ["restart", "ak1a-pumpor"], { cwd: ROT, stdio: "ignore" });
    b.on("error", (e) => klar(false, String(e)));
    b.on("exit", (kod) => klar(kod === 0, `pm2 exit ${kod ?? "?"}`));
  },
  tystnadMs = TYSTNAD_MS,
  omstartMinMs = OMSTART_MIN_MS,
  maxOmstartIFöljd = MAX_OMSTART_I_FÖLJD,
  backoffMs = ESKALERINGSBACKOFF_MS,
} = {}) {
  const state = {
    frusenSedan: null, // Date | null
    senasteOmstart: 0, // epoch-ms
    omstarterIFöljd: 0,
    eskaleradTill: 0, // epoch-ms; > nu ⇒ auto-omstart pausad
    senasteFelRad: 0, // feljournal rate-limit
  };

  async function kolla() {
    let rader;
    try {
      rader = await lasRader();
    } catch (e) {
      const t = nu().getTime();
      if (t - state.senasteFelRad >= 60_000) {
        state.senasteFelRad = t;
        await journal({ ts: new Date(t).toISOString(), händelse: "lasfel", fel: String(e).slice(0, 200) });
      }
      return; // läsfel är ALDRIG frysning-dom (fil kan roteras)
    }
    const t = nu();
    const senaste = beraknaSenasteRadTs(rader, t);
    if (!senaste) {
      // tom/otolkbar logg: daemonen kan ha startats OM och loggen roterats —
      // behandla som okänd, aldrig som grund för omstart (vaktens heliga
      // regel: aldrig omstart utan positiv tystnadsbevis)
      return;
    }
    const tystnad = t.getTime() - senaste.getTime();

    if (tystnad <= tystnadMs) {
      if (state.frusenSedan) {
        await journal({
          ts: t.toISOString(), händelse: "återställd",
          frusenSedan: state.frusenSedan.toISOString(),
          varaktighetMs: t.getTime() - state.frusenSedan.getTime(),
        });
        state.frusenSedan = null;
        state.omstarterIFöljd = 0;
      }
      return;
    }

    // ── frysning pågår ──
    if (!state.frusenSedan) {
      state.frusenSedan = t;
      await journal({
        ts: t.toISOString(), händelse: "frysning-upptäckt",
        tystnadMs: tystnad, senasteLoggrad: senaste.toISOString(),
      });
    }
    // backoffen löpt ut ⇒ ny cykel tillåts (annars återbeväpnar
    // ESKALERAD-grenen sig själv i all evinnerlighet och vakten aldrig
    // återupptar omstarter — vakten ska pausa, inte avgå)
    if (state.eskaleradTill > 0 && t.getTime() >= state.eskaleradTill && state.omstarterIFöljd >= maxOmstartIFöljd) {
      state.eskaleradTill = 0;
      state.omstarterIFöljd = 0;
      await journal({ ts: t.toISOString(), händelse: "backoff-utgången", detalj: "nya omstartsförsök tillåtna" });
    }
    if (t.getTime() < state.eskaleradTill) {
      await journal({ ts: t.toISOString(), händelse: "backoff-aktiv", eskaleradTill: new Date(state.eskaleradTill).toISOString(), tystnadMs: tystnad });
      return;
    }
    if (state.omstarterIFöljd >= maxOmstartIFöljd) {
      state.eskaleradTill = t.getTime() + backoffMs;
      await journal({
        ts: t.toISOString(), händelse: "ESKALERAD",
        detalj: `${state.omstarterIFöljd} omstarter utan läkning — auto-omstart pausad till_backoff`,
        backoffTill: new Date(state.eskaleradTill).toISOString(),
      });
      return;
    }
    if (t.getTime() - state.senasteOmstart >= omstartMinMs) {
      state.senasteOmstart = t.getTime();
      state.omstarterIFöljd++;
      const nr = state.omstarterIFöljd;
      await journal({ ts: t.toISOString(), händelse: "omstart-beslutad", nr, tystnadMs: tystnad });
      omstart(async (ok, detalj) => {
        await journal({ ts: new Date().toISOString(), händelse: ok ? "omstart-verkställd" : "omstart-fel", nr, detalj });
      });
    }
    // rate-limit-fönstret aktivt: vänta ut nästa kolla
  }

  return { kolla, state };
}

/** Läser daemonloggens sista ~64 KiB och returnerar raderna. */
export async function lasDaemonloggsRader(fil) {
  const fh = await open(fil, "r");
  try {
    const { size } = await fh.stat();
    const langd = Math.min(size, LOGGFÖNSTER_BYTE);
    const buf = Buffer.alloc(langd);
    await fh.read(buf, 0, langd, size - langd);
    return buf.toString("utf8").split("\n");
  } finally {
    await fh.close();
  }
}

// ── driftstart (endast när filen körs direkt, inte vid testimport) ───────────
const arHuvudprogram =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (arHuvudprogram) {
  const PUMPOR_LOGG = process.env.AK1A_PUMPOR_LOGG ?? "/home/ak1a/.pm2/logs/ak1a-pumpor-out.log";
  const vakt = byggHundvakt({ lasRader: () => lasDaemonloggsRader(PUMPOR_LOGG) });
  console.log(`PUMPOR-HUNDVAKTEN (v192) startar — bevakar ${PUMPOR_LOGG} · tystnadtröskel ${TYSTNAD_MS / 1000} s · koll var ${KOLL_INTERVALL_MS / 1000} s`);
  const puls = setInterval(() => {
    vakt.kolla().catch((e) => console.error(`hundvakt-kolla fel (tål): ${String(e).slice(0, 200)}`));
  }, KOLL_INTERVALL_MS);
  await vakt.kolla().catch(() => {});
}
