#!/usr/bin/env node
// döda-länkar-externa-vakten — utgående länkars hälsa (spår 8, 2026-09-15)
//
// O9 §5 kö-post 2: "Externa länkar — utgående http(s)-länkar (källor i
// analyser, kurser) kontrolleras ej idag: separat våg med begränsning
// (head-only, långsam takt, andel 4xx-rapport)". Detta är den vågen.
//
// Metod: sitemap-frö + länkgraf-crawl mot localhost (samma mönster som
// verktyg/doda-lankar.mjs, som bevisade INTERNA länkar 0/3 012) — men plockar
// ut absoluta http(s)-href med annan origin. Varje unikt externt mål valideras
// SKONSAMT: HEAD i första hand, GET-endast-i-kroppen när servern stöder ej
// HEAD eller bot-blockerar HEAD (vanligt), en sonde per domän i taget, max 4
// domäner parallellt, tidsgräns per förfrågan, ett omtryck för 5xx.
//
// Klassificering (externa döda är inte vårt fel men vårt anseende — därför
// skiljer vakten BEVISAT döda från sådant som inte kan maskinverifieras):
//   OK          200–399 efter omdirigeringar
//   BLOCKERAD   401/403/429 eller bot-motstånd — kan ej maskinverifieras
//   DOD         404/410 och övriga 4xx — bevisat död länk
//   SERVERFEL   5xx kvarstår efter omtryck — troligen transient
//   OUPPNABAR   DNS-fel/anslutningsvägran/timeout — domänfel är stark
//               dödsignal, långsamhet är det inte (felkod redovisas)
//
// MÄTFÖNSTER-GRIND + DRIFT-TAK (o87 2026-09-19, o55 §2-doktrinen bärd hit —
// samma kontrakt som verktyg/doda-lankar.mjs): FÖRE crawlen verifieras
// (a) att ingen process ÄGER deploy-låset (/proc-fd-läsning — en flock-
//     hållare bär alltid en öppen fd; fuser togs bort o570: psmisc saknas
//     på SSD Nodes-servern; ALDRIG låsfilens existens — flock städar ej),
// (b) ingen bygg/install-process (kommaseparerade HELA mönster: "next build" finns bara i ett äkta
// bygg — pm2:s "next start" bär aldrig sekvensen; "npm ci" ensamt matchar
// fabrikorsagtersas prompt-cmdlines), (c) basen frisk (/ och /kurser = 200).
// Missar ⇒ avbrott INNAN något mätvärde producerats (exit 1). EFTER crawlen:
// landar > 5 % av LOKALA sidor på 5xx/nätfel ⇒ driftfönster — rapporten
// kasseras (exit 2), ingen fyndfil (artefaktdoktrinen, o47:s 1 616×500-
// klass). Insamlings-mellanlagret sparas märkt driftfonster=true och kan
// ALDRIG återupptas till mätvärde (bakdörren stängd) — endast --tvinga
// diagnostik. Externa måls SERVERFEL räknas INTE i taket: det är externa
// värdars fel, redan egen klass. Rapport- och mellanlagerfiler skrivs ALDRIG
// över (klockslagssuffix vid samma-dag-kollision).
//
// --tvinga = diagnostikläge: hoppar grunderna och taket, märker ALLA
// utdatafiler "diagnostik" — resultatet är ALDRIG ett mätvärde.
//
// DOMÄNVETTET (o570, 2026-09-29 — 429-mörkrets rotorsakskur): bevisat läge
// 2026-09-15→09-27: Adlibris+Bokus (bokköpslänkar, 102 mål vardera = 59 % av
// alla externa mål) svarade 429 på ALLT — startsidor, produktsidor, egna
// UA:er som webbläsare — dvs IP-nivåblock, och instrumentet underhöll det
// SELVT: korDom avlossade 102 back-to-back-förfrågningar per domän varje
// natt, och en domän som sagt STOOOP fick ytterligare 101 den nästa natten.
// KUR, tre lager:
//   1. DOMÄNTAKT      minst AK1A_DOMAN_TAKT_MS (standard 1200) mellan två
//                     förfrågningar till SAMMA domän — främst skydd för de
//                     domäner som TÅL oss idag (amazon 102 OK) och skall
//                     inte tröttna imorgon.
//   2. KANIN+KLIPP    domänens FÖRSTA mål är kanin: svarar det 429 väntas
//                     (Retry-After i förekommande fall, annars
//                     AK1A_429_RETRY_MS) och omprovas EN gång med GET —
//                     läker det (t.ex. HEAD-specifik 429) fortsätter hela
//                     domänen normalt; består 429:n KLIPPS domänen: övriga
//                     mål klassas BLOCKERAD UTAN förfrågningar (blockeradTyp
//                     "rate") och domänen skrivs in i vilofilen.
//   3. VILOPERIOD     data/vakten/doda-lankar-externa-doman-vila.json bär
//                     per-domän `tills` (standard AK1A_DOMAN_VILA_MS =
//                     604800000 = 7 dygn): under vilen ställs domänens mål
//                     som BLOCKERAD (blockeradTyp "vila") med NOLL
//                     förfrågningar — värdarna får vila så ett avklingande
//                     rateblock kan läka, kaninen provar igen när vilen löper
//                     ut. --tvinga (diagnostik) respekterar ALDRIG vila och
//                     skriver ALDRIG vila — diagnostiken ändrar inget tillstånd.
// Ärlighet: BLOCKERAD delas i rapporten upp per blockeradTyp — "vagg"
// (401/403: vägrade oss, inte länkens fel), "rate" (429: vår IP är
// begränsad, länken overifierbar), "vila" (domän vilar efter 429). perKlass
// och stdout-kontraktet (cron-wrapperns parsning) är OFÖRÄNDRADE.
//
// Miljövariabler (testbarhet; standardvärden = skarpt läge):
//   AK1A_DEPLOY_LAS    sökväg till deploy-låset (standard /tmp/ak1a-deploy.lock)
//   AK1A_BYGG_MONSTER  kommaseparerade HELA pgrep-mönster (standard
//                      "next build,npm ci --no-audit")
//   AK1A_RETRY_VANTA_MS   väntetak för fönstervakt vid återmätning (standard
//                         480000 = 8 min; typiskt byggfönster 3–5 min)
//   AK1A_RETRY_POLL_MS    pollintervall under fönstervakten (standard 30000)
//   AK1A_DOMAN_TAKT_MS    minsta mellanrum mellan förfrågningar till samma
//                         domän (standard 1200)
//   AK1A_429_RETRY_MS     kaninens omprovningpaus när Retry-Aten saknas
//                         (standard 15000)
//   AK1A_DOMAN_VILA_MS    vilolängd för klippt domän (standard 604800000)
//   AK1A_VILA_FIL         vilofilens sökväg (standard
//                         data/vakten/doda-lankar-externa-doman-vila.json)
//
// ÅTERMÄTNING VID DRIFTTAK-TRÄFF (o113, 2026-09-20): grunden är en SNAPSHOT
// före crawl — ett byggfönster som ÖPPNAR MITT I crawlen (bevisat första
// organiska cron-körningen 2026-09-20 02:16–02:28Z: prod-synkens läkebacks-
// cykler gav 202 kalla ISR-sidor × 500 medan toppnivåerna var varma, och
// fönstret stängde sekunder före det en kontroll VID takträff skulle ha
// sett det) syns först i taket, och hela mätomgången går förlorad till
// nästa dygn. KUR: vid takträff vakta gröna grunder (poll, väntetak) och
// mät OM EN gång. Består felen träffas taket igen → exit 2 som förr —
// ommätningen kasserar sig själv, okända fel maskeras aldrig (artefakt-
// doktrinen hel; mellanlagret från driftfönstret bevaras som diagnostik).
//
// 0 npm-beroenden. Körning:
//   node verktyg/doda-lankar-externa.mjs [--bas=http://localhost:3000] [--djup=3]
//   node verktyg/doda-lankar-externa.mjs --tvinga             (diagnostik, ej mätvärde)
//   node verktyg/doda-lankar-externa.mjs --sjalvtest          (offline, inga nätanrop utåt)
//   node verktyg/doda-lankar-externa.mjs --validera-fran <insamlingsfil>
// Avslutskoder: 0 = mätvärde (eller diagnostik med --tvinga) levererat ·
//   1 = grind/fel (fönstret var ej mätbart) · 2 = driftfönster, rapport
//   kasserad (inget mätvärde).
// Lämnar: data/vakten/doda-lankar-externa-<datum>.json + sammanfattning på
// stdout. Insamlingen sparas FÖRE validering så en krasch inte kostar omcrawl.

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const koraKommando = promisify(execFile);

const args = process.argv.slice(2);
function argument(namn, standard) {
  const i = args.indexOf(`--${namn}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : standard;
}
const SJALVTEST = args.includes("--sjalvtest");
const BAS = argument("bas", "http://localhost:3000").replace(/\/$/, "");
const DJUP = parseInt(argument("djup", "3"), 10);
const VALIDERA_FRAN = argument("validera-fran", null);
const TVINGAD = args.includes("--tvinga");
const DRIFT_TAK = 0.05; // > 5 % LOKALA sidor på 5xx/nätfel = driftfönster
const DEPLOY_LAS = process.env.AK1A_DEPLOY_LAS || "/tmp/ak1a-deploy.lock";
const BYGG_MONSTER = (process.env.AK1A_BYGG_MONSTER || "next build,npm ci --no-audit")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const RETRY_VANTA_MS = parseInt(process.env.AK1A_RETRY_VANTA_MS || "480000", 10);
const RETRY_POLL_MS = parseInt(process.env.AK1A_RETRY_POLL_MS || "30000", 10);
const DOMAN_TAKT_MS = parseInt(process.env.AK1A_DOMAN_TAKT_MS || "1200", 10);
const RETRY_429_MS = parseInt(process.env.AK1A_429_RETRY_MS || "15000", 10);
const DOMAN_VILA_MS = parseInt(process.env.AK1A_DOMAN_VILA_MS || "604800000", 10);
const VILA_FIL =
  process.env.AK1A_VILA_FIL || path.join(process.cwd(), "data", "vakten", "doda-lankar-externa-doman-vila.json");

// Skonsamhet mot externa värdar: aldrig mer än en pågående förfrågan per
// domän, högst DOMANER_PARALLELLT domäner samtidigt, aldrig fler än så många
// förfrågningar totalt än det finns unika mål (inga återförsök utöver 5xx-omtryck).
const DOMANER_PARALLELLT = 4;
const TIDSGRANS_MS = 15_000;
const TAK_SIDOR = 5000;
const TAK_URL = 1500;
const USER_AGENT = "ak1a-doda-lankar-externa/1.0 (+länkvakten; kontakta hej@ak1nvestor.com)";

const PUBLIK_DOMAN = "lab.ak1nvestor.com"; // absolut skrivna egna länkar = interna, redan mätt av verktyg/doda-lankar.mjs
const HOPP_OVER_PREFIX = ["/studio", "/admin", "/api/", "/logga-ut"]; // sessionstyrda ytor, ej anonym-crawlbara

function logg(handelse, data) {
  process.stderr.write(`[doda-externa] ${handelse}: ${JSON.stringify(data)}\n`);
}

function extraheraExterna(html) {
  const maltal = new Set();
  const re = /<a\b[^>]*\shref\s*=\s*["']([^"']+)["']/gi;
  let t;
  while ((t = re.exec(html)) !== null) {
    let href = t[1].replace(/&amp;/g, "&").trim();
    if (!/^https?:\/\//i.test(href)) continue; // interna, ankare, mailto, tel, relativa
    let u;
    try {
      u = new URL(href);
    } catch {
      continue; // malformad URL — inte ett länkmål vi kan mäta
    }
    if (u.hostname === "localhost" || u.hostname === PUBLIK_DOMAN) continue;
    u.hash = "";
    maltal.add(u.toString());
  }
  return [...maltal];
}

// --- crawl (samma kontrakt som verktyg/doda-lankar.mjs) ---------------------

async function hamta(sokvag) {
  const kontroll = new AbortController();
  const tid = setTimeout(() => kontroll.abort(), 20_000);
  try {
    const svar = await fetch(`${BAS}${sokvag}`, {
      redirect: "follow",
      signal: kontroll.signal,
      headers: { "user-agent": "ak1a-doda-lankar/1.0 (+vakten)" },
    });
    const text = await svar.text();
    return { status: svar.status, text };
  } catch (fel) {
    return { status: 0, text: "", fel: String(fel?.cause?.code || fel?.message || fel) };
  } finally {
    clearTimeout(tid);
  }
}

// --- mätfönster-grind (o87, o55 §2:s kontrakt) -------------------------------

async function lasHollare() {
  // o570: fuser (psmisc) SAKNAS på SSD Nodes-servern (Contabo-födda verktyg)
  // — fd-ägandet läses i stället direkt ur /proc: en flock-hållare bär ALLTID
  // en öppen fd mot låsfilen, exakt den sanning fuser lämnade. ALDRIG en egen
  // flock-probe här: den skulle själv ta låset en microsekund och kan få en
  // ÄKTA deploys non-blocking acquire att fela. Stat öppnar ingen fd — sonden
  // kan aldrig se sig själv.
  let lasSokvag;
  try {
    lasSokvag = fs.realpathSync(DEPLOY_LAS);
  } catch {
    return null; // filen finns ej = ingen kan hålla den
  }
  const pids = [];
  for (const pid of fs.readdirSync("/proc")) {
    if (!/^\d+$/.test(pid)) continue;
    let fds;
    try {
      fds = fs.readdirSync(`/proc/${pid}/fd`);
    } catch {
      continue; // andra användare/processzoner — fuser hade samma gräns
    }
    for (const fd of fds) {
      let mal;
      try {
        mal = fs.readlinkSync(`/proc/${pid}/fd/${fd}`);
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

async function lasByggprocess() {
  for (const monster of BYGG_MONSTER) {
    try {
      await koraKommando("pgrep", ["-f", monster]);
      return monster; // exit 0 = matchande process lever
    } catch {
      // ej hittad — nästa mönster
    }
  }
  return null;
}

async function verifyeraMatfonster() {
  const hollare = await lasHollare();
  if (hollare) {
    console.error(`GRIND: deployfönster aktivt — låset ägs av PID ${hollare}; mätning avbryten (o55 §2).`);
    process.exit(1);
  }
  const bygg = await lasByggprocess();
  if (bygg) {
    console.error(`GRIND: bygg/install-process pågår ("${bygg}"); mätning avbryten (o55 §2).`);
    process.exit(1);
  }
  for (const sond of ["/", "/kurser"]) {
    const { status } = await hamta(sond);
    if (status !== 200) {
      console.error(`GRIND: basen ej frisk — ${sond} svarade ${status || "inget svar"}; mätning avbryten (o55 §2).`);
      process.exit(1);
    }
  }
  logg("matfonster", { grunder: "gröna", las: DEPLOY_LAS });
}

// Samma tre grunder som verifyeraMatfonster, men UTAN process.exit —
// fönstervakten (o113) behöver ett booleskt svar att polla på.
async function matfonsterFritt() {
  const hollare = await lasHollare();
  if (hollare) return { fritt: false, orsak: `las:${hollare}` };
  const bygg = await lasByggprocess();
  if (bygg) return { fritt: false, orsak: `bygg:${bygg}` };
  for (const sond of ["/", "/kurser"]) {
    const { status } = await hamta(sond);
    if (status !== 200) return { fritt: false, orsak: `bas:${sond}=${status || "inget"}` };
  }
  return { fritt: true, orsak: null };
}

// Vakta ett pågående driftfönster tills grunderna grönas igen — eller
// väntetaket slår till. Återger true endast när ett nytt mätfönster fick
// nominellt gröna grunder (krävs för att återmätningen ska bli mätvärde).
async function vantaPaFrittFonster() {
  const start = Date.now();
  for (;;) {
    const { fritt, orsak } = await matfonsterFritt();
    if (fritt) return true;
    if (Date.now() - start >= RETRY_VANTA_MS) {
      logg("driftfonster-vantak", { orsak, vantadeMs: Date.now() - start });
      return false;
    }
    await new Promise((losa) => setTimeout(losa, RETRY_POLL_MS));
  }
}

async function lasSitemap() {
  const { status, text } = await hamta("/sitemap.xml");
  if (status !== 200) {
    console.error(`FEL: sitemap svarade ${status} — avbryter`);
    process.exit(1);
  }
  const fron = [];
  for (const rad of text.split("<loc>")) {
    if (!rad.includes("</loc>")) continue;
    const loc = rad.split("</loc>")[0].trim();
    try {
      const u = new URL(loc);
      if (u.pathname) fron.push(u.pathname + (u.search || "") || "/");
    } catch {
      if (loc.startsWith("/")) fron.push(loc);
    }
  }
  logg("sitemap", { antal: fron.length });
  return fron;
}

async function samlaExterna() {
  const sett = new Map(); // url → Set<källsökväg>
  const besokta = new Set();
  let driftfel = 0; // LOKALA sidor på 5xx/nätfel (status 0 eller ≥ 500)
  const felSidor = []; // stickprov för loggen (tak 25)
  const ko = (await lasSitemap()).map((s) => ({ sokvag: s, niva: 0 }));
  let aktiva = 0;

  await new Promise((losa) => {
    function pumpa() {
      while (aktiva < 6 && ko.length > 0) {
        const { sokvag, niva } = ko.shift();
        if (besokta.has(sokvag) || besokta.size >= TAK_SIDOR) continue;
        besokta.add(sokvag);
        aktiva++;
        hamta(sokvag).then(({ status, text }) => {
          if (status === 0 || status >= 500) {
            driftfel++;
            if (felSidor.length < 25) felSidor.push({ sokvag, status: status || "FEL" });
          }
          if (status >= 200 && status < 400) {
            for (const maltal of extraheraExterna(text)) {
              const s = sett.get(maltal) || new Set();
              s.add(sokvag);
              sett.set(maltal, s);
            }
            if (niva < DJUP) {
              const re = /<a\b[^>]*\shref\s*=\s*["']([^"']+)["']/gi;
              let t;
              while ((t = re.exec(text)) !== null) {
                let href = t[1].replace(/&amp;/g, "&");
                if (href.startsWith(`${BAS}/`)) href = href.slice(BAS.length);
                if (!href.startsWith("/")) continue;
                href = href.split("#")[0].split("?")[0];
                if (!href || href === "/") continue;
                if (HOPP_OVER_PREFIX.some((p) => href.startsWith(p))) continue;
                if (!besokta.has(href)) ko.push({ sokvag: href, niva: niva + 1 });
              }
            }
          }
          aktiva--;
          pumpa();
        });
      }
      if (aktiva === 0 && ko.length === 0) losa();
    }
    pumpa();
  });
  logg("crawlstat", { sidor: besokta.size, driftfel, stickprov: felSidor });
  return { besokta: besokta.size, mal: sett, driftfel, felSidor };
}

// --- extern validering -------------------------------------------------------

async function sond(url, metod) {
  const kontroll = new AbortController();
  const tid = setTimeout(() => kontroll.abort(), TIDSGRANS_MS);
  try {
    const svar = await fetch(url, {
      method: metod,
      redirect: "follow",
      signal: kontroll.signal,
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
    const status = svar.status;
    const slutlig = svar.url;
    const raRad = svar.headers.get("retry-after");
    const retryAfter = raRad !== null && /^\d+$/.test(raRad.trim()) ? parseInt(raRad, 10) : null;
    // kroppen läses aldrig — släpp socketen direkt
    try {
      await svar.body?.cancel();
    } catch {
      kontroll.abort();
    }
    return { status, slutlig, fel: null, retryAfter };
  } catch (fel) {
    return { status: 0, slutlig: url, fel: felText(fel), retryAfter: null };
  } finally {
    clearTimeout(tid);
  }
}

function felText(fel) {
  if (fel?.cause?.code) return fel.cause.code; // ENOTFOUND (domän borta) vs ECONNREFUSED vs …
  if (fel?.cause?.message) return `cause:${fel.cause.message}`;
  if (String(fel?.name || "").includes("Abort") || /aborted|timed? ?out/i.test(String(fel?.message || ""))) return "TIMEOUT";
  return String(fel?.message || fel);
}

function klassificera(status, fel) {
  if (status === 0) return "OUPPNABAR";
  if (status >= 200 && status < 400) return "OK";
  if (status === 401 || status === 403 || status === 429) return "BLOCKERAD";
  if (status >= 400 && status < 500) return "DOD";
  return "SERVERFEL";
}

async function valideraMal(mal) {
  // 1) HEAD. 2) HEAD är OPÅLITLIGT för dödsdomar: värdar kan svara 405/501
  // (metoden stöds ej), 403 (bot-blockar just HEAD) eller t.o.m. 404 på HEAD
  // medan GET tjänar sidan (bevisat fall: www.imy.se 2026-09-15 — levande
  // länk som HEAD dömde död). GET är vad en besökare gör = sanningen.
  // Undantag: 401/429 bekräftas ej (GET ger ingen ny information; 429 skall
  // respekteras med hänsyn). 3) 5xx är ofta transient: ett omtryck efter paus.
  let r = await sond(mal, "HEAD");
  if (r.status >= 400 && r.status < 500 && r.status !== 401 && r.status !== 429) {
    const r2 = await sond(mal, "GET");
    if (r2.status !== 0) r = r2; // GET-nätverksfel behåller HEAD-domens klass
  }
  if (r.status >= 500) {
    await new Promise((losa) => setTimeout(losa, 8000));
    const r2 = await sond(mal, "HEAD");
    if (r2.status !== 0) r = r2;
  }
  return { klass: klassificera(r.status, r.fel), status: r.status, slutlig: r.slutlig, fel: r.fel, retryAfter: r.retryAfter ?? null };
}

function doman(url) {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url;
  }
}

function blockeradTyp(status) {
  if (status === 429) return "rate";
  if (status === 401 || status === 403) return "vagg";
  return "vagg"; // övriga BLOCKERAD-klasser (skall ej förekomma) — ärlig vägg-typ
}

// --- vilofilen (o570 lager 3): domäner som klippts för 429 vilar — noll
// förfrågningar tills vilen löper ut och kaninen provar igen. Läsning är
// alltid förlåtande (korrupt fil = ingen vila, aldrig krasch), skrivning
// atomisk (temp+rename) — cron och manuell körning kan överlappa.
function lasVila() {
  try {
    const rå = JSON.parse(fs.readFileSync(VILA_FIL, "utf8"));
    return rå && typeof rå === "object" ? rå : {};
  } catch {
    return {};
  }
}

function skrivVila(vila) {
  fs.mkdirSync(path.dirname(VILA_FIL), { recursive: true });
  const tmp = `${VILA_FIL}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(vila, null, 2) + "\n");
  fs.renameSync(tmp, VILA_FIL);
}

function vilaAktiv(vila, d) {
  const post = vila[d];
  return post && typeof post.tills === "number" && post.tills > Date.now() ? post : null;
}

// valideraAlla — med domänvettet (o570): vila ⇒ noll förfrågningar; kanin-429
// ⇒ en GET-omprovning efter paus; består den ⇒ domänklipp (övriga mål
// BLOCKERAD-rate utan förfrågningar) + vilopost; taktföring mellan varje
// förfrågning till samma domän. Returnerar { resultat, klipp, vila } —
// vila = den postförda vila-ståndpunkten (läst ∪ nyklippt) för rapporten.
async function valideraAlla(sett, progress) {
  const perDom = new Map();
  for (const [url, kallor] of sett) {
    const d = doman(url);
    if (!perDom.has(d)) perDom.set(d, []);
    perDom.get(d).push({ url, kallor });
  }
  const resultat = [];
  const domanKo = [...perDom.entries()];
  const vila = TVINGAD ? {} : lasVila();
  const klipp = new Map(); // doman → vilopost (nya klipp denna körning)
  let gjorda = 0;

  function rapportera(d, m, v) {
    const post = { mal: m.url, doman: d, ...v, kallor: [...m.kallor].sort().slice(0, 25) };
    if (post.klass === "BLOCKERAD") post.blockeradTyp = v.blockeradTyp || blockeradTyp(post.status);
    resultat.push(post);
  }

  async function korDom([d, mal]) {
    const vilande = vilaAktiv(vila, d);
    if (vilande) {
      for (const m of mal) {
        rapportera(d, m, {
          klass: "BLOCKERAD",
          status: null,
          slutlig: m.url,
          fel: `vilande domän — 429-vila till ${new Date(vilande.tills).toISOString()}`,
          retryAfter: null,
          blockeradTyp: "vila",
        });
        gjorda++;
      }
      logg("doman-vila", { doman: d, mal: mal.length, tills: vilande.tills });
      return;
    }
    let klippt = false;
    for (const [i, m] of mal.entries()) {
      if (klippt) {
        rapportera(d, m, {
          klass: "BLOCKERAD",
          status: 429,
          slutlig: m.url,
          fel: "domänklippt — kaninmålet svarade 429 två gånger (HEAD+GET), övriga mål ej förfrågade",
          retryAfter: null,
          blockeradTyp: "rate",
        });
        gjorda++;
        continue;
      }
      if (i > 0) await new Promise((losa) => setTimeout(losa, DOMAN_TAKT_MS)); // domäntakt
      let v = await valideraMal(m.url);
      // KANIN-429 (o570 lager 2): första målet bär domänens dom. 429 ⇒ pausa
      // (Retry-After i mån, aldrig > 2 min) och omprova EN gång med GET —
      // läker den (HEAD-specifik begränsning) fortsätter domänen normalt.
      if (i === 0 && v.status === 429) {
        const vanta = v.retryAfter !== null ? Math.min(v.retryAfter * 1000, 120_000) : RETRY_429_MS;
        logg("kanin-429", { doman: d, vantaMs: vanta });
        await new Promise((losa) => setTimeout(losa, vanta));
        const r2 = await sond(m.url, "GET");
        if (r2.status !== 0) {
          v = { klass: klassificera(r2.status, r2.fel), status: r2.status, slutlig: r2.slutlig, fel: r2.fel, retryAfter: r2.retryAfter };
        }
        if (v.status === 429 && !TVINGAD) {
          klippt = true;
          const post = { tills: Date.now() + DOMAN_VILA_MS, orsak: "kanin 429 ×2 (HEAD+GET)", sedan: new Date().toISOString() };
          klipp.set(d, post);
          vila[d] = post;
          logg("doman-klipp", { doman: d, atersparadeForfragningar: mal.length - 1, vilaMs: DOMAN_VILA_MS });
        }
      }
      rapportera(d, m, v);
      gjorda++;
      if (progress && gjorda % 25 === 0) logg("progress", { gjorda, av: sett.size });
    }
  }

  await new Promise((losa) => {
    let aktiva = 0;
    let i = 0;
    function pumpa() {
      while (aktiva < DOMANER_PARALLELLT && i < domanKo.length) {
        const grupp = domanKo[i++];
        aktiva++;
        korDom(grupp).then(() => {
          aktiva--;
          pumpa();
        });
      }
      if (aktiva === 0 && i >= domanKo.length) losa();
    }
    pumpa();
  });
  return { resultat, klipp, vila };
}

// --- självtest (offline: lokal http-server + ouppnåbar port) -----------------

async function sjalvtest() {
  function starta() {
    return new Promise((losa) => {
      const s = http.createServer((req, res) => {
        if (req.url === "/ok") {
          res.writeHead(200, { "content-type": "text/html" });
          res.end("<html><body><a href='https://example.com/ok'>x</a></body></html>");
        } else if (req.url === "/head-fel") {
          // imy-mönstret: HEAD → 404 men GET → 200 (server/CDN hanterar HEAD inkonsekvent)
          if (req.method === "HEAD") {
            res.writeHead(404);
          } else {
            res.writeHead(200, { "content-type": "text/html" });
          }
          res.end();
        } else if (req.url === "/flyttad") {
          res.writeHead(301, { location: "/ok" });
          res.end();
        } else if (req.url === "/fel") {
          res.writeHead(500);
          res.end();
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      s.listen(0, "127.0.0.1", () => losa(s));
    });
  }
  const server = await starta();
  const port = server.address().port;
  const bas = `http://127.0.0.1:${port}`;
  // en nyligen frigiven port = garanterat ingen lyssnare (port 1 förkastas av
  // URL-parsern som "bad port" och når aldrig nätverkslagret)
  const dodServer = await starta();
  const dodPort = dodServer.address().port;
  await new Promise((losa) => dodServer.close(losa));

  const fall = [
    { namn: "200 OK", url: `${bas}/ok`, vantad: "OK" },
    { namn: "301→200 följs", url: `${bas}/flyttad`, vantad: "OK" },
    { namn: "404 = DOD (GET bekräftar)", url: `${bas}/finns-ej`, vantad: "DOD" },
    { namn: "HEAD-404 men GET-200 = OK (imy-fallet)", url: `${bas}/head-fel`, vantad: "OK" },
    { namn: "5xx kvarstår = SERVERFEL", url: `${bas}/fel`, vantad: "SERVERFEL" },
    { namn: "anslutningsvägran = OUPPNABAR", url: `http://127.0.0.1:${dodPort}/x`, vantad: "OUPPNABAR" },
  ];
  let passerade = 0;
  for (const f of fall) {
    const v = await valideraMal(f.url);
    const ok = v.klass === f.vantad;
    if (ok) passerade++;
    console.log(`  ${ok ? "PASS" : "FAIL"} ${f.namn}: klass=${v.klass} status=${v.status} fel=${v.fel || "-"}`);
  }
  server.close();
  console.log(`Självtest: ${passerade}/${fall.length}`);
  process.exit(passerade === fall.length ? 0 : 1);
}

// --- huvudspår ----------------------------------------------------------------

const dagensDatum = new Date().toISOString().slice(0, 10);

if (SJALVTEST) {
  await sjalvtest();
}

// Filskydd: en fil skrivs ALDRIG över — samma dags tidigare mätning (t.ex.
// ett driftfynds bevisfil) bevaras och klockslagssuffix skiljer nästa.
function skyddadFil(namn) {
  let fil = path.join(process.cwd(), "data", "vakten", namn);
  if (fs.existsSync(fil)) {
    fil = path.join(
      process.cwd(),
      "data",
      "vakten",
      namn.replace(/\.json$/, `-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.json`),
    );
  }
  return fil;
}

const prefix = TVINGAD ? "doda-lankar-externa-diagnostik-" : "doda-lankar-externa-";
const rapportNamn = `${prefix}${dagensDatum}.json`;
const mellanNamn = `${prefix}${dagensDatum}-insamling.json`;

// MÄTFÖNSTER-GRIND FÖRE allt mätvärde (o87/o55 §2): gäller även återupptagning
// — ett mätvärde levererat mitt i ett byggfönster är ett spökmätvärde.
if (!TVINGAD) await verifyeraMatfonster();

const t0 = Date.now();
let besokta;
let sett;
let driftAndel = null;
let aterupptagen = false;
let atermatAntal = 0;

// Crawl + mellanlager i ett steg: mellanlagret skrivs FÖRE externa
// nätanrop (en krasch kostar inte en omcrawl) och märks med drift-tal +
// driftfonster-dom så en driftfönster-insamling aldrig kan återupptas till
// mätvärde (märkningen är grinden, se VALIDERA_FRAN-grenen).
async function korInsamling() {
  const insamling = await samlaExterna();
  const antal = insamling.besokta;
  const andel = antal > 0 ? insamling.driftfel / antal : 0;
  const malKarta = insamling.mal;
  const mellanFil = skyddadFil(mellanNamn);
  fs.mkdirSync(path.dirname(mellanFil), { recursive: true });
  fs.writeFileSync(
    mellanFil,
    JSON.stringify(
      {
        bas: BAS,
        tid: new Date().toISOString(),
        besoktaSidor: antal,
        driftAndel: andel,
        driftfonster: andel > DRIFT_TAK,
        tvingad: TVINGAD,
        felSidor: insamling.felSidor,
        mal: [...malKarta.entries()].map(([url, k]) => ({ url, kallor: [...k] })),
      },
      null,
      2,
    ) + "\n",
  );
  logg("insamling", { sidor: antal, mal: malKarta.size, driftAndel: andel, sparad: mellanFil });
  return { besokta: antal, mal: malKarta, driftAndel: andel };
}

if (VALIDERA_FRAN) {
  const mellanlager = JSON.parse(fs.readFileSync(VALIDERA_FRAN, "utf8"));
  // Bakdörrs-stängning (artefaktdoktrinen): ett driftfönsters insamling kan
  // ALDRIG återupptas till mätvärde — endast --tvinga ger diagnostik.
  if (mellanlager.driftfonster && !TVINGAD) {
    console.error(
      `GRIND: mellanlagret är insamlat i ett driftfönster (${((mellanlager.driftAndel || 0) * 100).toFixed(1)} % sidfel) — kan ALDRIG bli mätvärde (o47 §2); diagnostik kräver --tvinga.`,
    );
    process.exit(1);
  }
  besokta = mellanlager.besoktaSidor;
  sett = new Map(mellanlager.mal.map((m) => [m.url, new Set(m.kallor)]));
  driftAndel = typeof mellanlager.driftAndel === "number" ? mellanlager.driftAndel : null;
  aterupptagen = true;
  logg("aterupptar", { fran: VALIDERA_FRAN, mal: sett.size });
} else {
  let ins = await korInsamling();
  besokta = ins.besokta;
  sett = ins.mal;
  driftAndel = ins.driftAndel;

  // DRIFT-TAK EFTER crawl (artefaktdoktrinen): ett byggfönster som öppnar
  // MITT I mätningen ger massiva 5xx/nätfel på LOKALA sidor — det är drift,
  // inte länkgraf, och får aldrig bokföras som mätvärde (o47: 1 616×500).
  // Mellanlagret finns kvar som märkt diagnostikunderlag; fyndfil skrivs ej.
  //
  // o113-ÅTERMÄTNING: grunden var grön vid crawlstart men fönstret kan ha
  // öppnat under crawlen (bevis: 2026-09-20 02:16–02:28Z — och fönstret
  // stängde sekunder FÖRE kontrollen vid takträff, därför kräver kuren
  // INTE påvisad aktivitet: fönstervakten avgör själv). Vid takträff:
  // vakta gröna grunder (poll, väntetak) och mät OM EN gång. Består felen
  // träffas taket igen → exit 2 exakt som förr — ommätningen kasserar sig
  // själv, okända fel maskeras aldrig (artefaktdoktrinen hel).
  if (!TVINGAD && driftAndel > DRIFT_TAK) {
    logg("driftfonster-atermat", { vantaMs: RETRY_VANTA_MS });
    if (await vantaPaFrittFonster()) {
      ins = await korInsamling();
      besokta = ins.besokta;
      sett = ins.mal;
      driftAndel = ins.driftAndel;
      atermatAntal = 1;
    }
  }

  if (!TVINGAD && driftAndel > DRIFT_TAK) {
    console.error(
      `DRIFTFÖNSTER: ${(driftAndel * 100).toFixed(1)} % av ${besokta} sidor svarade 5xx/nätfel ` +
        `(tak ${(DRIFT_TAK * 100).toFixed(0)} %) — rapporten kasseras, ingen fyndfil skrivs (o47 §2). ` +
        `Diagnostik vid driftfynd: kör om med --tvinga (utdata märks diagnostik, är ALDRIG mätvärde).`,
    );
    process.exit(2);
  }
}

if (sett.size > TAK_URL) {
  console.error(`FEL: ${sett.size} unika externa mål överstiger taket ${TAK_URL} — avbryter FÖRE externa förfrågningar (skonsamhetskontraktet)`);
  process.exit(1);
}

const { resultat, klipp, vila } = await valideraAlla(sett, true);
resultat.sort((a, b) => (a.klass === b.klass ? a.mal.localeCompare(b.mal) : a.klass.localeCompare(b.klass)));

// Nyklippta domäner ⇒ vilofil (o570 lager 3). Diagnostik (--tvinga) skriver
// ALDRIG vila — den ändrar inget tillstånd.
if (klipp.size > 0 && !TVINGAD) {
  skrivVila(vila);
  logg("vila-skriven", { domaner: [...klipp.keys()], fil: VILA_FIL });
}

const perKlass = {};
for (const r of resultat) perKlass[r.klass] = (perKlass[r.klass] || 0) + 1;
const perDoman = {};
for (const r of resultat) perDoman[r.doman] = perDoman[r.doman] || { OK: 0, BLOCKERAD: 0, DOD: 0, SERVERFEL: 0, OUPPNABAR: 0 }, perDoman[r.doman][r.klass]++;

// Aktiv vila-ståndpunkt för rapporten: vilande + nyklippta domäner.
const vilaStandalone = {};
for (const [d, post] of Object.entries(vila)) {
  if (vilaAktiv(vila, d)) vilaStandalone[d] = post;
}
const blockeradeTyper = { rate: 0, vagg: 0, vila: 0 };
for (const r of resultat) if (r.klass === "BLOCKERAD") blockeradeTyper[r.blockeradTyp || "vagg"]++;

const rapport = {
  bas: BAS,
  tid: new Date().toISOString(),
  sekunder: Math.round((Date.now() - t0) / 1000),
  djup: DJUP,
  tvingad: TVINGAD,
  matfonster: TVINGAD ? "diagnostik" : "grönt",
  aterupptagen,
  atermatAntal,
  driftAndel,
  crawlideSidor: besokta,
  unikaExternaMal: resultat.length,
  perKlass,
  perDoman: Object.fromEntries(Object.entries(perDoman).sort((a, b) => a[0].localeCompare(b[0]))),
  fynd: {
    doda: resultat.filter((r) => r.klass === "DOD"),
    ouppnabara: resultat.filter((r) => r.klass === "OUPPNABAR"),
    serverfel: resultat.filter((r) => r.klass === "SERVERFEL"),
    blockerade: resultat.filter((r) => r.klass === "BLOCKERAD"),
  },
  blockeradeTyper,
  domanVila: vilaStandalone,
  alla: resultat,
};

const utFil = skyddadFil(rapportNamn);
fs.mkdirSync(path.dirname(utFil), { recursive: true });
fs.writeFileSync(utFil, JSON.stringify(rapport, null, 2) + "\n");

console.log(`Crawlade ${besokta} sidor, validerade ${resultat.length} unika externa mål på ${rapport.sekunder} s${atermatAntal > 0 ? ` (efter ${atermatAntal} återmätning ur driftfönster, o113)` : ""}${TVINGAD ? " [DIAGNOSTIK — ej mätvärde]" : ""}`);
console.log(`Klasser: ${JSON.stringify(perKlass)}`);
console.log(`DÖDA (4xx): ${rapport.fynd.doda.length}`);
for (const d of rapport.fynd.doda) console.log(`  ${d.status} ${d.mal}  ← ${d.kallor.slice(0, 3).join(", ") || "(sitemap)"}`);
console.log(`OUPPNÅBARA (domän/anslutning): ${rapport.fynd.ouppnabara.length}`);
for (const d of rapport.fynd.ouppnabara) console.log(`  ${d.fel} ${d.mal}  ← ${d.kallor.slice(0, 3).join(", ") || "(sitemap)"}`);
console.log(`SERVERFEL kvarstår: ${rapport.fynd.serverfel.length} · BLOCKERADE (kan ej maskinverifiera): ${rapport.fynd.blockerade.length}`);
console.log(
  `Blockerade-typ: rate ${blockeradeTyper.rate} (429-begränsad IP) · vägg ${blockeradeTyper.vagg} (401/403) · vila ${blockeradeTyper.vila} (domän vilar, o570)` +
    (Object.keys(vilaStandalone).length > 0 ? ` — domäner i vila: ${Object.keys(vilaStandalone).sort().join(", ")}` : ""),
);
console.log(`Rapport: ${utFil}`);
