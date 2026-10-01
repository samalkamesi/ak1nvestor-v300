#!/usr/bin/env node
/**
 * PUMPOR-HUNDVAKTEN (v193, o572 2026-10-01) — extern pulsvakt åt daemonen
 * =====================================================================
 * o572 K1 (mätblindhet 1): sedan daemonens stop+start 2026-09-30 18:54
 * bär loggen pm2-tidsprefix ("2026-09-30T18:54:52: …") på i princip ALLA
 * rader (empiri: 1 154 av 1 155 i svansfönstret). v192:s pulsparser var
 * ^-ankrad mot prefixlös "HH:MM:SS " ⇒ senaste = null ⇒ "aldrig omstart
 * utan positivt tystnadsbevis" ⇒ vakten 100 % BLIND (sond 03:22 bevisade
 * pulsen 1,4 s gammal som v192 aldrig kunde se). KUR: parsern tolkar ÄVEN
 * pm2-ISO-prefix — fullständigt datum ger direkt ts utan midnattsgissning;
 * prefixlös HH:MM:SS behåller sin logik; blandade svansar täcks.
 * o572 K2 (mätblindhet 2): vakten kunde vara DÖD i det tysta (egna
 * pm2-loggar 0 byte sedan start 09-28, journal saknades helt — levnaden
 * var obevisbar). KUR: journalrad "vakten-startad" vid driftstart +
 * "puls-läge" var 6:e h — levnadsbevis på DISK, oberoende av stdout-pipan.
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
export const LEVNADS_PULS_MS = 6 * 3_600_000; // o572 K2: puls-läge var 6:e h
const LOGGFÖNSTER_BYTE = 65_536; // läser bara loggens svans — filen kan växa
const TIDSRAD_RE = /^(\d{2}):(\d{2}):(\d{2}) /; // daemonens logga(): HH:MM:SS (UTC)
// o572 K1: pm2 --time-prefix ("2026-10-01T04:02:22: …") — fraktional tillåten
const PM2_TIDSRAD_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?:/;

/**
 * Ren parser: nyaste tidsstämpeln i daemonloggs-rader. Två format (o572 K1):
 *   1. pm2-ISO-prefix "YYYY-MM-DDTHH:MM:SS:" — fullständigt datum ger direkt
 *      ts (Date.UTC), ingen midnattsgissning behövs.
 *   2. Prefixlös "HH:MM:SS " (daemonens logga()) — midnattsövergång: en
 *      tolkad tid i framtiden (> nu + 2 min) tillhör gårdagen.
 * Ogiltiga rader ignoreras. Returnerar Date ELLER null (tom/ogen).
 */
export function beraknaSenasteRadTs(rader, nu) {
  let senaste = null;
  for (const rad of rader) {
    let ts = null;
    const p = PM2_TIDSRAD_RE.exec(rad);
    if (p) {
      const [, ar, man, dag, h, mi, s] = p;
      if (+man >= 1 && +man <= 12 && +dag >= 1 && +dag <= 31 && +h <= 23 && +mi <= 59 && +s <= 59) {
        ts = new Date(Date.UTC(+ar, +man - 1, +dag, +h, +mi, +s));
      }
    } else {
      const m = TIDSRAD_RE.exec(rad);
      if (m) {
        const [, h, mi, s] = m;
        if (+h > 23 || +mi > 59 || +s > 59) continue;
        ts = new Date(nu);
        ts.setUTCHours(+h, +mi, +s, 0);
        if (ts.getTime() - nu.getTime() > 120_000) {
          ts = new Date(ts.getTime() - 86_400_000); // raden var från igår
        }
      }
    }
    if (ts && (!senaste || ts.getTime() > senaste.getTime())) senaste = ts;
  }
  return senaste;
}

/** Gemensam journalutskrift (data/vakten/pumpor-hundvakt.jsonl) — o572 K2. */
export async function skrivJournal(obj) {
  await appendFile(path.join(ROT, "data/vakten/pumpor-hundvakt.jsonl"), JSON.stringify(obj) + "\n");
}

/**
 * o572 K2 — levnadsbevis på disk, oberoende av stdout-pipan (vakten kan vara
 * DÖD i det tysta när pm2-loggarna är 0 byte). starta() en gång vid
 * driftstart; puls() periodiskt — bär senaste tolkade logg-ts + tystnad,
 * dvs samma öga som kolla() men utan omstartsbefogenhet.
 */
export function byggLevnadsjournal({ nu = () => new Date(), lasRader, journal = skrivJournal } = {}) {
  return {
    starta: async (detalj = {}) => {
      await journal({ ts: nu().toISOString(), händelse: "vakten-startad", ...detalj });
    },
    puls: async () => {
      const t = nu();
      let senaste = null;
      try {
        senaste = beraknaSenasteRadTs(await lasRader(), t);
      } catch {
        // läsfel skall inte döda levnadsbeviset — puls-raden journalas ändå
      }
      await journal({
        ts: t.toISOString(),
        händelse: "puls-läge",
        senasteLoggrad: senaste ? senaste.toISOString() : null,
        tystnadMs: senaste ? t.getTime() - senaste.getTime() : null,
      });
      return senaste;
    },
  };
}

/**
 * Tillståndsmaskin + IO avskild: byggHundvakt(deps) returnerar { kolla } —
 * testerna injicerar klocka, loggläsning, journal och omstart.
 */
export function byggHundvakt({
  nu = () => new Date(),
  lasRader, // async () => string[]  (daemonloggens svans)
  journal = skrivJournal,
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

/**
 * o572 (tredje blindheten — main-detektionen): under pm2 är process.argv[1]
 * = pm2:s wrapper (lib/ProcessContainerFork.js), INTE skriptet — cmdline
 * ljuger via process.title. v192:s argv[1]-jämförelse var därför FALSK i
 * pm2-drift ⇒ main-blocket hoppades över ⇒ vakten var en zombi (pm2
 * "online", IPC-kanalen höll processen vid liv, noll koll-ronder sedan
 * 09-28 — utlogg 0 byte, journal saknades). Ren funktion: sann om argv[1]
 * ÄR modulen (manuell körning) ELLER pm2:s pm_exec_path matchar modulens
 * egen sökväg (pm2 fork-drift; pm_exec_path sätts per app av pm2).
 */
export function arMainProcess({ argv1, env = process.env, modulUrl }) {
  if (!argv1 || !modulUrl) return false;
  try {
    if (pathToFileURL(argv1).href === modulUrl) return true;
    return Boolean(env.pm_id && env.pm_exec_path && pathToFileURL(env.pm_exec_path).href === modulUrl);
  } catch {
    return false; // ogiltig sökväg i argv/pm_exec_path är aldrig main
  }
}

// ── driftstart (endast när filen körs direkt, inte vid testimport) ───────────
const arHuvudprogram = arMainProcess({ argv1: process.argv[1], modulUrl: import.meta.url });

if (arHuvudprogram) {
  const PUMPOR_LOGG = process.env.AK1A_PUMPOR_LOGG ?? "/home/ak1a/.pm2/logs/ak1a-pumpor-out.log";
  const lasRader = () => lasDaemonloggsRader(PUMPOR_LOGG);
  const vakt = byggHundvakt({ lasRader });
  const levnad = byggLevnadsjournal({ lasRader }); // o572 K2
  await levnad.starta({ version: "o572", tystnadTröskelS: TYSTNAD_MS / 1000, drift: process.env.pm_id ? `pm2:${process.env.pm_id}` : "manuell" }).catch(() => {});
  console.log(`PUMPOR-HUNDVAKTEN (v193/o572) startar — bevakar ${PUMPOR_LOGG} · tystnadtröskel ${TYSTNAD_MS / 1000} s · koll var ${KOLL_INTERVALL_MS / 1000} s`);
  const puls = setInterval(() => {
    vakt.kolla().catch((e) => console.error(`hundvakt-kolla fel (tål): ${String(e).slice(0, 200)}`));
  }, KOLL_INTERVALL_MS);
  setInterval(() => {
    levnad.puls().catch((e) => console.error(`hundvakt-puls fel (tål): ${String(e).slice(0, 200)}`));
  }, LEVNADS_PULS_MS);
  await vakt.kolla().catch(() => {});
}
