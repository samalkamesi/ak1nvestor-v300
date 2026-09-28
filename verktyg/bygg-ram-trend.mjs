#!/usr/bin/env node
/**
 * AK1A — VÅG 185 (BYGG-RAM-TREND): trendanalys över prod-synkens byggfönster
 * ur V184-sondens tidsserie data/vakten/bygg-ram-profil.jsonl.
 *
 * BAKGRUND (r274-r276): F6-RAM-domaren kräver två oberoende bevis per dopp;
 * v184-sonden gav byggfönstret sin EGEN källa — MemAvailable var 60:e sekund
 * under next build, per fönster aggregerat (fas=start/bygg/slut). Ett fönster
 * säger dock inget om RIKTNINGEN: doppen är strukturella (även friska
 * fönster bottnar ~200 MB vid min 2-3 = next-buildens topp) men trendingången
 * (sämre/bättre över deploys, t.ex. vid beroendetillväxt) syns först över
 * flera fönster. Detta verktyg är den läsande änden: stänger v185.
 *
 * Användning:
 *   node verktyg/bygg-ram-trend.mjs           — Markdown-rapport på stdout
 *   node verktyg/bygg-ram-trend.mjs --json    — maskinläsbar JSON (vakt-cron)
 *   node verktyg/bygg-ram-trend.mjs --alla-servrar — utan serverfilter (r284)
 *   node verktyg/bygg-ram-trend.mjs <fil>     — annan profilfil (tester)
 *
 * Fönsterkontrakt (sonden, se prod-synk.mjs korByggMedSond):
 *   {"fas":"start","ts","pid","server"} → {"fas":"bygg","ts","tillgangligtMB","minut","server"}*
 *   → {"fas":"slut","ts","varv","minTillgangligtMB","server"}
 * Fönster utan slut (bygget dog/omstart) behålls markerat avbrutet — sondens
 * rekursionsolycka 2026-09-27 lärde oss att trasiga fönster ska synas, ej
 * döljas. Föräldralösa prover (bygg utan start) räknas och hoppas över.
 * ROND 284 (serverbytet v190): "server" = os.hostname() hos sonden; trenden
 * visar som standard EGEN server (främst taggade fönster exkluderas med
 * ärlig räknerad — olika maskinvaror är inte en trend). Otaggade rader =
 * äldre historia (pre-r284) och följer med ofiltrerade.
 *
 * Klassning per stängt fönster (MB tillgängligt):
 *   GRÖN ≥ 300 (designmarginal) · GUL 150-299 (designad topplast =
 *   BYGG-RAM-VARNING-zonen) · RÖD < 150 (OOM-riskzonen — kärnan börjar döda
 *   processer; jfr det tysta OOM-mordet på prod-synken 2026-09-27 05:57Z,
 *   rotat i r273).
 *
 * Avslutskod: 0 = rapport levererad · 2 = profilfil saknas/tom/utan fönster.
 *
 * Pedagogisk utbildning — ALDRIG investeringsråd.
 */
import { readFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STANDARDPROFIL = path.join(REPO, "data/vakten/bygg-ram-profil.jsonl");

export function klassaMinne(mb) {
  if (mb >= 300) return "GRÖN";
  if (mb >= 150) return "GUL";
  return "RÖD";
}

/** Parsar sondrader (redan JSON:ade objekt) till fönster. Tolerant mot null.
 * ROND 284: fönstret ärver SERVER-taggen från start-raden (fallback: slut-
 * raden) — fönster utan tagg är äldre (pre-v190) historia som lämnas
 * omarkerad; trenden grupperar per server (se valjServerfonster). */
export function lasFonster(rader) {
  const stangda = [];
  let oppet = null;
  let foraldralosa = 0;
  for (const r of rader) {
    if (!r || typeof r !== "object") continue;
    if (r.fas === "start") {
      if (oppet) {
        // ny start utan slut: föregående fönster dog (krasch/omstart) — behåll synligt
        oppet.avbrutet = true;
        stangda.push(oppet);
      }
      oppet = { startTs: r.ts ?? null, pid: r.pid ?? null, server: r.server ?? null, prover: [] };
    } else if (r.fas === "bygg") {
      if (!oppet) { foraldralosa++; continue; }
      oppet.prover.push({ ts: r.ts ?? null, mb: r.tillgangligtMB, minut: r.minut ?? null });
    } else if (r.fas === "slut") {
      if (!oppet) { foraldralosa++; continue; }
      oppet.slutTs = r.ts ?? null;
      oppet.varv = typeof r.varv === "number" ? r.varv : oppet.prover.length;
      oppet.minRapporterad = typeof r.minTillgangligtMB === "number" ? r.minTillgangligtMB : null;
      oppet.avbrutet = false;
      if (oppet.server === null && typeof r.server === "string") oppet.server = r.server;
      stangda.push(oppet);
      oppet = null;
    }
  }
  return { stangda, pagasende: oppet, foraldralosa };
}

/** ROND 284 (serverbytet v190): blanda ALDRIG fönster från olika servrar i
 * samma trend — Contabos 8 GiB-bottnar (~200 MB) och SSD Nodes 60 GiB-
 * bottnar (~50 GB) är olika MASKINVOR, inte en riktning. Fönster taggade
 * med ANNAN server än den valda exkluderas (otaggade = äldre historia som
 * bara finns på EN server i taget — de hör logiskt till den som läser).
 * Returnerar bevarade fönster + ärlig exkluderingsräkning för rapporten. */
export function valjServerfonster(stangda, valdServer) {
  const bevarade = [];
  const exkluderadeServrar = new Map();
  for (const w of stangda) {
    if (w.server === null || w.server === undefined || w.server === valdServer) {
      bevarade.push(w);
    } else {
      exkluderadeServrar.set(w.server, (exkluderadeServrar.get(w.server) ?? 0) + 1);
    }
  }
  return { bevarade, exkluderadeServrar };
}

/** Beräknar per-fönsterstatistik + trend över stängda fönster (kronologiskt). */
export function sammanstallFonster(stangda) {
  const fonster = stangda.map((w) => {
    const mb = w.prover.map((p) => p.mb).filter((m) => typeof m === "number");
    const minstMB = mb.length ? Math.min(...mb) : w.minRapporterad;
    const dykMinut = minstMB === null ? null : (w.prover.find((p) => p.mb === minstMB)?.minut ?? null);
    const varaktighetSek = w.slutTs && w.startTs
      ? Math.round((Date.parse(w.slutTs) - Date.parse(w.startTs)) / 1000)
      : null;
    return {
      startTs: w.startTs,
      slutTs: w.slutTs ?? null,
      avbrutet: w.avbrutet === true,
      pid: w.pid,
      server: w.server ?? null,
      antalProver: w.prover.length,
      varv: typeof w.varv === "number" ? w.varv : w.prover.length,
      minstMB,
      dykMinut,
      startMB: mb.length ? mb[0] : null,
      slutMB: mb.length ? mb[mb.length - 1] : null,
      under300: mb.filter((m) => m < 300).length,
      varaktighetSek,
      klass: minstMB === null ? "OKÄND" : klassaMinne(minstMB),
    };
  });

  const giltiga = fonster.filter((f) => f.minstMB !== null);
  let trend = { riktning: "OKÄND", fran: null, till: null, delta: null };
  if (giltiga.length >= 2) {
    const fran = giltiga[giltiga.length - 2].minstMB;
    const till = giltiga[giltiga.length - 1].minstMB;
    trend = {
      riktning: till < fran ? "SÄNKS" : till > fran ? "STIGER" : "JÄMN",
      fran,
      till,
      delta: till - fran,
    };
  }
  const varsta = giltiga.length
    ? giltiga.reduce((a, b) => (b.minstMB < a.minstMB ? b : a))
    : null;
  return { fonster, trend, varsta };
}

const tid = (ts) => (typeof ts === "string" ? ts.slice(11, 19) : "??:??:??");
const dag = (ts) => (typeof ts === "string" ? ts.slice(0, 10) : "????-??-??");
const minSek = (s) => {
  if (s === null) return "? min";
  return `${(s / 60).toFixed(1).replace(".", ",")} min`;
};

export function tillMarkdown({ fonster, trend, varsta }, pagasende, foraldralosa, exkluderadeServrar = null) {
  const rader = [];
  const first = fonster[0]?.startTs ?? pagasende?.startTs ?? null;
  const last = fonster[fonster.length - 1]?.startTs ?? first;
  rader.push(`BYGG-RAM-TREND — ${fonster.length} stängda fönster (${dag(first)} ${tid(first)} → ${tid(last)})`);
  fonster.forEach((f, i) => {
    rader.push(
      `  fönster ${i + 1}: ${tid(f.startTs)}→${f.slutTs ? tid(f.slutTs) : "AVBRUTET"}`
      + ` · ${minSek(f.varaktighetSek)} · ${f.varv} varv`
      + ` · min ${f.minstMB === null ? "?" : f.minstMB} MB`
      + `${f.dykMinut === null ? "" : ` (dyk min ${f.dykMinut})`}`
      + ` · ${f.klass}`
      + `${f.server ? ` · ${f.server}` : ""}`
      + `${f.avbrutet ? " · AVBRUTET (bygget dog utan slut-rad)" : ""}`,
    );
  });
  if (trend.riktning !== "OKÄND") {
    rader.push(`TREND: ${trend.riktning} — min ${trend.fran} → ${trend.till} MB (Δ ${trend.delta > 0 ? "+" : ""}${trend.delta} MB)`);
  }
  if (varsta) {
    rader.push(`VÄRSTA FÖNSTER: ${varsta.startTs} (min ${varsta.minstMB} MB, ${varsta.klass})`);
  }
  if (pagasende && pagasende.prover.length) {
    const mb = pagasende.prover.map((p) => p.mb).filter((m) => typeof m === "number");
    rader.push(`PÅGÅENDE FÖNSTER: start ${tid(pagasende.startTs)} — ${pagasende.prover.length} varv, min ${mb.length ? Math.min(...mb) : "?"} MB hittills`);
  }
  if (foraldralosa > 0) {
    rader.push(`OBS: ${foraldralosa} föräldralösa prover (bygg-rad utan start) hoppades över`);
  }
  if (exkluderadeServrar && exkluderadeServrar.size > 0) {
    const lista = [...exkluderadeServrar.entries()].map(([s, n]) => `${s} ×${n}`).join(", ");
    rader.push(`SERVERFILTER: fönster från annan server exkluderade (${lista}) — --alla-servrar visar allt (r284: olika maskinvaror är inte en trend)`);
  }
  return rader.join("\n");
}

// ── CLI (import-vakt enligt o43: testsviter importerar funktionerna —
//    CLI-delen körs ENDAST som direkt program, aldrig som sidoeffekt) ──────
function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--hjalp" || args[0] === "--help") {
    console.log("node verktyg/bygg-ram-trend.mjs [--json] [--alla-servrar] [profilfil]");
    process.exit(0);
  }
  const jsonFlag = args.includes("--json");
  const allaServrar = args.includes("--alla-servrar");
  const filArg = args.find((a) => !a.startsWith("--"));
  const fil = filArg || STANDARDPROFIL;

  if (!existsSync(fil)) {
    console.error(`BYGG-RAM-TREND FEL: profilfilen saknas (${fil})`);
    process.exit(2);
  }
  const rader = readFileSync(fil, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => { try { return JSON.parse(l); } catch { return null; } });
  const { stangda, pagasende, foraldralosa } = lasFonster(rader);
  if (!stangda.length && !pagasende) {
    console.error("BYGG-RAM-TREND FEL: profilfilen bar inga fönster");
    process.exit(2);
  }
  // r284: standard = EGEN serverns fönster (otaggad äldre historia följer
  // med — den levde bara på en server i taget); --alla-servrar visar allt.
  const vald = allaServrar ? null : os.hostname();
  const { bevarade, exkluderadeServrar } = vald
    ? valjServerfonster(stangda, vald)
    : { bevarade: stangda, exkluderadeServrar: new Map() };
  const rapport = sammanstallFonster(bevarade);
  if (jsonFlag) {
    console.log(JSON.stringify({
      antalFonster: bevarade.length,
      serverfilter: { vald, exkluderade: [...exkluderadeServrar.entries()] },
      ...rapport,
      pagasende: pagasende ? { startTs: pagasende.startTs, varv: pagasende.prover.length } : null,
      foraldralosa,
    }));
  } else {
    console.log(tillMarkdown(rapport, pagasende, foraldralosa, exkluderadeServrar));
  }
}

const arDirektProgram = (() => {
  try {
    return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (arDirektProgram) main();
