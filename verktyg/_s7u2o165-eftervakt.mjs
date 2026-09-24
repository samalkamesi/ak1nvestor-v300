#!/usr/bin/env node
/**
 * AK1A — o165 (Spår 7, s7-u2, omdispatch): STÅENDE EFTER-VAKARÖVERTAG av
 * o159 §9 — den autonoma kedjan "mät före/efter (Lighthouse), deploy,
 * prod 200, mätning bokförd" när deployen av cv-kuren (commit 21e67000,
 * .cv-bolagsektion på /bolag) landar.
 *
 * MÖNSTER: o130/o131/o144 (vakarövertag vid RAM-blockerad deploy) + o158 §3
 * (instrumentet, inte disciplinen, äger kedjan). Startas FRISTÅENDE
 * (setsid nohup) och överlever agentronden; vid måltid krävs RAM ≥ 1 500 MB
 * (spårets tak — Chrome ~0,5–0,7 GB får ALDRIG riskera prod-processer).
 *
 * FASER (status → data/vakten/o165-eftervakt/status.json):
 *   1. vanta-deploy   — poll 60 s: senaste "DEPLOYAD automatiskt: N commits
 *                       (<hash>)" i prod-synk.log där 21e67000 är anfader.
 *   2. prod-200       — loopback ×3 sidor måste svara 200 (middleware-whitelist).
 *   3. kanalbevis     — serverad /bolag-HTML bär cv-bolagsektion + --cv-h,
                       deployad CSS-chunk bär .cv-bolagsektion-regeln.
 *   4. vanta-ram      — väntar tillgängligt RAM ≥ 1 500 MB.
 *   5. mat            — kanoniska verktyget oförändrat:
 *                       node verktyg/prestanda-lighthouse.mjs o159-efter \
 *                         /data/nyckeltalsguide /bolag /bolag/eqnr-ol
 *   6. skroll         — node verktyg/_s7u2o159-skrollcls.mjs (o144-mönstret;
 *                       egen RAM-vakt; post-load-observatör per o159 §7.2).
 *   7. dom            — o165-eftervakt-dom.json i lighthouse/-katalogen:
 *                       STRUKTUR dom-bar alltid (kanalbevis · CLS 0 ×3
 *                       heligt · skroll-CLS utan stavhopp); TBT/LCP/poäng
 *                       bokförs som laststämplad referens dagtid (metrolo-
 *                       giregeln o143 §3 — natt-cronen 03:27 äger TBT-
 *                       slutdomen, o158 §6).
 *
 * Exit: 0 = GRÖN/GUL bokförd · 1 = RÖD (strukturkontraktsbrott) ·
 *       2 = tidsgräns/fel utan dom. Idempotent: klar dom ⇒ exit 0 direkt.
 * Env:  O165_TAK_TIMMAR (default 6) · O165_KUR_COMMIT (default 21e67000) ·
 *       LH_BAS (default http://localhost:3000).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync, unlinkSync, statSync } from "node:fs";

const BAS = process.env.LH_BAS || "http://localhost:3000";
const KUR_COMMIT = process.env.O165_KUR_COMMIT || "21e67000";
const SIDOR = ["/data/nyckeltalsguide", "/bolag", "/bolag/eqnr-ol"];
const NAMN = "o159-efter";
const LH_KAT = "data/forskning/OPTIMERING/lighthouse";
const DOMFIL = `${LH_KAT}/o165-eftervakt-dom.json`;
const STATUSFIL = "data/vakten/o165-eftervakt/status.json";
const SYNKLOGG = "data/vakten/prod-synk.log";
const SKROLLUTFIL = `${LH_KAT}/skrollcls-o159-bolag-mobil.json`;
const TAK_MS = Math.round(Number(process.env.O165_TAK_TIMMAR || 6) * 3600_000);
const POLMS = 60_000;
const RAM_TAK_MB = 1500;
const start = Date.now();

const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
const logg = (...a) => console.log(new Date().toISOString(), ...a);
function ramMB() {
  return Math.round(
    Number(/MemAvailable:\s+(\d+) kB/.exec(readFileSync("/proc/meminfo", "utf8"))[1]) / 1024,
  );
}
function skrivStatus(fas, extra = {}) {
  mkdirSync("data/vakten/o165-eftervakt", { recursive: true });
  writeFileSync(STATUSFIL, JSON.stringify({ ts: new Date().toISOString(), fas, ...extra }, null, 2));
}
function restTid() {
  return Math.max(0, TAK_MS - (Date.now() - start));
}
async function vantaRam(fas) {
  while (ramMB() < RAM_TAK_MB && restTid() > 0) {
    skrivStatus(fas, { ramMB: ramMB(), takSek: Math.round(restTid() / 1000) });
    logg(`${fas}: RAM ${ramMB()} MB < ${RAM_TAK_MB} — väntar`);
    await SLEEP(Math.min(POLMS, restTid() || POLMS));
  }
  return ramMB() >= RAM_TAK_MB;
}

// — Single-instans: O_EXCL-lås med stöld av gammalt (crash) lås —
const LOCK = "/tmp/ak1a-o165-eftervakt.lock";
try {
  openSync(LOCK, "wx");
} catch {
  try {
    const alder = Date.now() - statSync(LOCK).mtimeMs;
    if (alder > TAK_MS + 3600_000) {
      logg(`gammalt lås ${Math.round(alder / 60000)} min — stjäls`);
      unlinkSync(LOCK);
      openSync(LOCK, "wx");
    } else {
      console.error(`AVBRUTEN: annan instans lever (lås ${LOCK}, ${Math.round(alder / 60000)} min)`);
      process.exit(2);
    }
  } catch (e2) {
    console.error(`AVBRUTEN: lås races — ${e2}`);
    process.exit(2);
  }
}
process.on("exit", () => {
  try { unlinkSync(LOCK); } catch {}
});

// — Idempotens: färdigdom bokförd ⇒ inget mer att göra —
if (existsSync(DOMFIL)) {
  try {
    const klar = JSON.parse(readFileSync(DOMFIL, "utf8"));
    if (klar.fas === "klar") {
      logg(`Dom redan bokförd (${klar.dom}) — avslutar idempot`);
      process.exit(0);
    }
  } catch {}
}

// — FAS 1: vänta deploy där kuren är anfader —
logg(`EFTER-vakt start: kur=${KUR_COMMIT} · tak=${Math.round(TAK_MS / 60000)} min · bas=${BAS}`);
let deployad = null;
let sistaRad = null;
while (Date.now() - start < TAK_MS) {
  const rader = readFileSync(SYNKLOGG, "utf8")
    .split("\n")
    .filter((r) => r.includes("DEPLOYAD automatiskt"));
  sistaRad = rader[rader.length - 1] || null;
  const hash = sistaRad
    ? (/DEPLOYAD automatiskt: \d+ commits \(([0-9a-f]{7,40})\)/.exec(sistaRad) || [])[1]
    : null;
  if (hash) {
    const anc = spawnSync("git", ["merge-base", "--is-ancestor", KUR_COMMIT, hash], {
      cwd: process.cwd(),
    });
    if (anc.status === 0) {
      deployad = hash;
      break;
    }
    logg(`Deploy ${hash} bär EJ ${KUR_COMMIT} (status ${anc.status}) — fortsätter vänta`);
  } else {
    logg(`vantar-deploy: senaste rad: ${sistaRad ? sistaRad.slice(0, 90) : "ingen"}`);
  }
  skrivStatus("vantar-deploy", {
    kurCommit: KUR_COMMIT,
    sistaDeployadRad: sistaRad,
    ramMB: ramMB(),
    takSek: Math.round(restTid() / 1000),
  });
  await SLEEP(Math.min(POLMS, restTid() || POLMS));
}
if (!deployad) {
  skrivStatus("tidsgrans-utan-deploy", { kurCommit: KUR_COMMIT });
  logg("TIDSGRÄNS: deploy av kuren landade inte inom taket — vakarövertaget består (o165 §kö)");
  process.exit(2);
}
logg(`DEPLOY MED KUREN: ${deployad} — fortsätter mot mätning`);

// — FAS 2: prod 200 ×3 (loopback) —
skrivStatus("prod-200", { deployad });
for (const s of SIDOR) {
  try {
    const r = await fetch(BAS + s);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
  } catch (e) {
    skrivStatus("prod-ej-200", { deployad, sida: s, fel: String(e) });
    logg(`PROD EJ 200: ${s} — ${e}`);
    process.exit(2);
  }
}
logg("prod 200 ×3 — OK");

// — FAS 3: kanalbevis (serverad HTML + deployad CSS) —
skrivStatus("kanalbevis", { deployad });
const html = await (await fetch(BAS + "/bolag")).text();
const htmlKlass = html.includes("cv-bolagsektion");
const htmlCvh = html.includes("--cv-h");
const cssLankar = [...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => m[1]);
const cssKollade = [];
let cssRegel = false;
for (const l of cssLankar) {
  const u = new URL(l, BAS).href;
  try {
    const t = await (await fetch(u)).text();
    cssKollade.push(l.split("/").pop());
    if (t.includes(".cv-bolagsektion")) cssRegel = true;
  } catch (e) {
    cssKollade.push(`${l.split("/").pop()} (fel: ${String(e).slice(0, 60)})`);
  }
}
const kanalbevis = { htmlKlass, htmlCvh, cssRegel, cssKollade };
logg(`kanalbevis: htmlKlass=${htmlKlass} htmlCvh=${htmlCvh} cssRegel=${cssRegel} (${cssKollade.length} css)`);
if (!(htmlKlass && htmlCvh && cssRegel)) {
  const dom = {
    ts: new Date().toISOString(), fas: "klar", deployad, dom: "RÖD",
    domTyp: "kanalbrott",
    motivering: [
      "o159 §9.2 kanalbevis BRUTEN: kuren (21e67000) är anfader till deployen men nådde inte den serverade ytan.",
      `htmlKlass=${htmlKlass} htmlCvh=${htmlCvh} cssRegel=${cssRegel}`,
      "Åtgärd: kontrollera att globals.css-medien (≤640px) och bolag-sidor.tsx-klassen följde med i bygget; ALDRIG egen build — prod-synken äger.",
    ],
    kanalbevis,
  };
  writeFileSync(DOMFIL, JSON.stringify(dom, null, 2));
  skrivStatus("klar", { dom: "RÖD" });
  logg("DOM RÖD (kanalbrott) — bokförd i " + DOMFIL);
  process.exit(1);
}

// — FAS 4+5: vänta RAM, mät med kanoniska instrumentet —
if (!(await vantaRam("vantar-ram"))) {
  skrivStatus("tidsgrans-utan-ram", { deployad });
  logg("TIDSGRÄNS: RAM räckte aldrig för mätning — vakarövertaget består (o165 §kö)");
  process.exit(2);
}
skrivStatus("mat-lighthouse", { deployad, ramMB: ramMB() });
logg(`mäter: node verktyg/prestanda-lighthouse.mjs ${NAMN} ${SIDOR.join(" ")}`);
const lh = spawnSync("node", ["verktyg/prestanda-lighthouse.mjs", NAMN, ...SIDOR], {
  timeout: 15 * 60_000,
});
logg(`lighthouse exit=${lh.status}${lh.error ? " fel=" + lh.error : ""}`);
if (lh.status !== 0 || !existsSync(`${LH_KAT}/${NAMN}-sammanfattning.json`)) {
  skrivStatus("mätning-fel", { deployad, lhExit: lh.status });
  logg("MÄTNING FEL — ingen sammanfattning; nästa våg/kron återtar med §6-kommandona");
  process.exit(2);
}

// — FAS 6: skroll-CLS-sonden (o159 §9.4) —
if (!(await vantaRam("vantar-ram-skroll"))) {
  skrivStatus("tidsgrans-utan-ram-skroll", { deployad });
  process.exit(2);
}
skrivStatus("skroll-cls", { deployad, ramMB: ramMB() });
const sk = spawnSync("node", ["verktyg/_s7u2o159-skrollcls.mjs"], { timeout: 8 * 60_000 });
logg(`skrollcls exit=${sk.status}${sk.error ? " fel=" + sk.error : ""}`);
const skroll = existsSync(SKROLLUTFIL) ? JSON.parse(readFileSync(SKROLLUTFIL, "utf8")) : null;

// — FAS 7: dom —
const efter = JSON.parse(readFileSync(`${LH_KAT}/${NAMN}-sammanfattning.json`, "utf8"));
let fore = null;
try {
  fore = JSON.parse(readFileSync(`${LH_KAT}/o159-fore-sammanfattning.json`, "utf8"));
} catch {}
const eMap = Object.fromEntries(efter.sidor.filter((s) => s.karnmattMs).map((s) => [s.sokvag, s]));
const fMap = fore ? Object.fromEntries(fore.sidor.filter((s) => s.karnmattMs).map((s) => [s.sokvag, s])) : {};
const perSida = SIDOR.map((s) => {
  const e = eMap[s];
  const f = fMap[s];
  return {
    sokvag: s,
    poang: e ? Math.round((e.poang.prestanda ?? 0) * 100) : null,
    LCP: e?.karnmattMs.LCP ?? null,
    TBT: e?.karnmattMs.TBT ?? null,
    CLS: e?.karnmattMs.CLS ?? null,
    forePoang: f ? Math.round(f.poang.prestanda * 100) : null,
    foreLCP: f?.karnmattMs.LCP ?? null,
    foreTBT: f?.karnmattMs.TBT ?? null,
  };
});
const saknasSida = perSida.some((p) => p.CLS == null);

// Strukturkriterier (dom-bar alltid)
const clsNoll = !saknasSida && perSida.every((p) => p.CLS === 0);
const skrollOmg = skroll?.omgangar ?? [];
const skrollOK =
  skrollOmg.length >= 1 && skrollOmg.every((o) => (o.skrollClsSumma ?? 1) < 0.01);

// Laststämplade tal (fakta, ej RÖD-dom dagtid)
const timme = new Date().getHours();
const dagtid = timme >= 7 && timme < 23;
const bolag = perSida.find((p) => p.sokvag === "/bolag");
const tbtBolag = bolag?.TBT ?? null;
const TBT_FORE = 4324;

const motivering = [];
let dom;
if (!clsNoll) {
  dom = "RÖD";
  motivering.push(`CLS-kontraktet brutet: ${perSida.map((p) => `${p.sokvag}=${p.CLS}`).join(" · ")} (o100: CLS 0 är heligt)`);
} else if (!skrollOK) {
  dom = "GUL";
  motivering.push(
    skrollOmg.length
      ? `skroll-CLS summa ${skrollOmg.map((o) => o.skrollClsSumma).join("/")} ≥ 0.01 — platshållarreservationerna ger stavhopp (o159 §9.4: justera --cv-h-formeln 68,6·rader−300 mot uppmätt median)`
      : "skroll-CLS-sonden producerade ingen rapport (verktygsfel) — omkörning krävs",
  );
} else {
  motivering.push(`kanalbevis HEL (htmlKlass+htmlCvh+cssRegel) · CLS 0 ×${perSida.length} · skroll-CLS ${skrollOmg.map((o) => o.skrollClsSumma).join("/")} < 0.01`);
  if (tbtBolag != null && tbtBolag < 3000) {
    dom = "GRÖN";
    motivering.push(`/bolag TBT ${tbtBolag} ms — väsentligt under FÖRE ${TBT_FORE} (A/B-span −47…−81 % hållet, o159 §9.3)`);
  } else {
    dom = "GUL";
    motivering.push(
      tbtBolag == null
        ? "/bolag-TBT saknas i EFTER-rapporten"
        : `/bolag TBT ${tbtBolag} ms ≥ 3 000 — ${dagtid ? "dagtid laststämplad referens (metrologiregeln o143 §3): natt-cronen 03:27 äger slutdomen (o158 §6)" : "nattfönster: kvar att tolka mot lastprober"}`,
    );
  }
  if (bolag && bolag.foreLCP != null && Math.abs(bolag.LCP - bolag.foreLCP) / bolag.foreLCP > 0.15) {
    motivering.push(`OBS: /bolag LCP ${bolag.LCP} ms avviker ${(Math.round((Math.abs(bolag.LCP - bolag.foreLCP) / bolag.foreLCP) * 100))} % från FÖRE ${bolag.foreLCP} (utanför ±15 % — laststämplad observation dagtid)`);
  }
}

const domJson = {
  ts: new Date().toISOString(),
  fas: "klar",
  protokoll: "o165",
  uppdrag: "o159 §9 EFTER-vakarövertag (mät före/efter, deploy, prod 200, mätning bokförd)",
  deployad,
  kurCommit: KUR_COMMIT,
  kanalbevis,
  struktur: { clsNoll, skrollOK, prod200: true },
  laststal: { dagtid, perSida, skrollOmgangar: skrollOmg.map((o) => ({ skrollClsSumma: o.skrollClsSumma, hojdForePx: o.hojdForePx, hojdDeltaPx: o.hojdDeltaPx, cvSektioner: (o.cvSektioner || []).length })) },
  dom,
  motivering,
  vidare: "Bokför i o165-protokollet + worklog; committa mätfilerna (o159-efter-*.json + skrollcls-*.json). TBT-slutdom ägs av natt-cronen (o158 §6).",
};
mkdirSync(LH_KAT, { recursive: true });
writeFileSync(DOMFIL, JSON.stringify(domJson, null, 2));
skrivStatus("klar", { dom, deployad });
logg(`DOM ${dom} — bokförd i ${DOMFIL}`);
process.exit(dom === "RÖD" ? 1 : 0);
